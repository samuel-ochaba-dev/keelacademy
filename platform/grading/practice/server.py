#!/usr/bin/env python3
"""practice/server.py — completion problem grading via Layer-1 checks (S3.1).

Exposes fast, deterministic, sandboxed grading for completion problems
(gap-marker exercises) without LLM judge calls or budget consumption.
The learner app calls this service from server actions using the shared
app token (KEEL_ENROLL_SECRET).

Routes:
    GET  /healthz                           -> {"ok": true}
    GET  /practice/manifest?unit=<id>       -> problem contract, base files, editable whitelist
    POST /practice/attempt                  -> stage base + student files -> sandbox grade -> persist
    GET  /practice/attempts?student_id=<id>&unit=<id> -> student attempt history

Security & Boundaries:
    - Auth: X-Keel-App-Token header matched to env KEEL_ENROLL_SECRET.
    - Enrollment Gate: Only students with an ACTIVE enrollment for the unit may attempt.
    - Whitelisting: Only files in the unit's editable_files whitelist are accepted.
      Any unknown filename, binary byte, or oversized payload is rejected loudly (4xx)
      and NEVER staged.
    - Untrusted code execution: Sandbox only (Docker via platform/grading/layer1.py).
    - DB Access: Env KEEL_DB_CMD via shared db.py; attempt row + spine event
      (practice.attempt_graded) commit in the SAME transaction.
"""

from __future__ import annotations

import hmac
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import yaml

# Add grading dir to sys.path to import shared modules (db, layer1)
GRADING_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(GRADING_DIR))
from db import db_sql, sql_str
import layer1

MAX_BODY_BYTES = 1 * 1024 * 1024       # 1 MB total request body cap
MAX_FILE_BYTES = 128 * 1024             # 128 KB per individual file cap
MAX_FILENAME_LEN = 128
UNIT_RE = re.compile(r"^\d+\.\d+\.\d+$")
FILENAME_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
DEFAULT_TIMEOUT_S = 60


def app_token() -> str:
    return os.environ.get("KEEL_ENROLL_SECRET", "")


def content_root() -> Path:
    return layer1.content_root()


def get_unit_practice_manifest(unit_id: str) -> dict[str, Any] | None:
    """Read completion problem manifest from content repo for unit_id."""
    root = content_root()
    matches = sorted(root.glob(f"units/*/{unit_id}/unit.yaml"))
    if not matches:
        return None
    unit_yaml_path = matches[0]
    try:
        unit_data = yaml.safe_load(unit_yaml_path.read_text(encoding="utf-8"))
    except Exception:
        return None

    practice = unit_data.get("practice") or {}
    completion = practice.get("completion_problem")
    if not isinstance(completion, dict):
        return None

    base_rel = completion.get("base")
    checks_rel = completion.get("checks")
    if not base_rel or not checks_rel:
        return None

    base_dir = root / base_rel
    checks_path = root / checks_rel
    if not base_dir.is_dir() or not checks_path.is_file():
        return None

    readme_path = base_dir / "README.md"
    readme_md = readme_path.read_text(encoding="utf-8") if readme_path.is_file() else ""

    # Read base files, skipping cache and hidden entries
    base_files: dict[str, str] = {}
    for entry in sorted(base_dir.iterdir()):
        if entry.is_file() and not entry.name.startswith("."):
            try:
                base_files[entry.name] = entry.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue

    # Determine editable files by looking for GAP markers in base files
    editable_files: list[str] = []
    for fname, content in base_files.items():
        if fname.endswith(".py") and re.search(r"#\s*GAP\s+\d+", content):
            editable_files.append(fname)
    if not editable_files:
        # Fallback to known Python source files excluding test/harness
        for fname in base_files:
            if fname.endswith(".py") and not fname.startswith("test_") and fname not in ("llm.py", "notes.py"):
                editable_files.append(fname)
    editable_files.sort()

    try:
        checks_data = yaml.safe_load(checks_path.read_text(encoding="utf-8"))
        if not isinstance(checks_data, list):
            checks_data = []
    except Exception:
        checks_data = []

    check_descriptors = [
        {"id": c.get("id"), "type": c.get("type")}
        for c in checks_data if isinstance(c, dict) and "id" in c
    ]

    return {
        "unit_id": unit_id,
        "base_rel": base_rel.rstrip("/") + "/",
        "readme_markdown": readme_md,
        "base_files": base_files,
        "editable_files": editable_files,
        "checks": check_descriptors,
        "checks_path": checks_path,
        "base_dir": base_dir,
    }


class PracticeHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond(self, code: int, obj: dict[str, Any]) -> None:
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args: Any) -> None:
        # Minimal logging; never log payload bodies
        sys.stderr.write("practice: %s %s\n" % (self.command, self.path))

    def _read_body(self) -> tuple[bool, bytes]:
        """Read Content-Length bytes with a hard cap and guarded parse."""
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return False, b""
        if length < 0 or length > MAX_BODY_BYTES:
            return False, b""
        return True, self.rfile.read(length) if length else b""

    def _app_authorized(self) -> bool:
        expected = app_token()
        if not expected:
            return False
        supplied = self.headers.get("X-Keel-App-Token", "")
        return hmac.compare_digest(supplied, expected)

    def _bad_token(self) -> None:
        self._respond(401, {"error": "invalid app token"})

    # ------------------------------------------------------------------
    # GET routes
    # ------------------------------------------------------------------

    def do_GET(self) -> None:
        if self.path == "/healthz":
            self._respond(200, {"ok": True})
            return

        if not self._app_authorized():
            self._bad_token()
            return

        parsed = urllib.parse.urlsplit(self.path)
        query = urllib.parse.parse_qs(parsed.query)

        # GET /practice/manifest?unit=3.2.1 OR /units/<unit_id>/practice/manifest
        unit_id = None
        if parsed.path == "/practice/manifest":
            unit_id = (query.get("unit") or [""])[0]
        else:
            m_unit = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/manifest$", parsed.path)
            if m_unit:
                unit_id = m_unit.group(1)

        if unit_id is not None:
            self._handle_get_manifest(unit_id)
            return

        # GET /practice/attempts?student_id=<id>&unit=<id> OR /students/<id>/practice/attempts
        if parsed.path == "/practice/attempts":
            sid_str = (query.get("student_id") or [""])[0]
            uid = (query.get("unit") or [""])[0]
            if not sid_str.isdigit() or not UNIT_RE.match(uid):
                self._respond(400, {"error": "student_id (int) and unit (x.y.z) required"})
                return
            self._handle_get_attempts(int(sid_str), uid)
            return

        m_att = re.match(r"^/students/(\d{1,15})/practice/attempts$", parsed.path)
        if m_att:
            sid = int(m_att.group(1))
            uid = (query.get("unit") or [""])[0]
            if not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit query parameter required"})
                return
            self._handle_get_attempts(sid, uid)
            return

        self._respond(404, {"error": "not found"})

    def _handle_get_manifest(self, unit_id: str) -> None:
        if not UNIT_RE.match(unit_id):
            self._respond(400, {"error": "bad unit id"})
            return
        manifest = get_unit_practice_manifest(unit_id)
        if not manifest:
            self._respond(404, {"error": "completion problem not found for unit"})
            return
        self._respond(200, {
            "unit_id": manifest["unit_id"],
            "base_rel": manifest["base_rel"],
            "readme_markdown": manifest["readme_markdown"],
            "base_files": manifest["base_files"],
            "editable_files": manifest["editable_files"],
            "checks": manifest["checks"],
        })

    def _handle_get_attempts(self, student_id: int, unit_id: str) -> None:
        sql = """BEGIN;
SELECT id, student_id, unit_id, passed, pass_count, total_checks, results_json::text, created_at
FROM practice_attempts
WHERE student_id = %d AND unit_id = %s
ORDER BY id DESC
LIMIT 50;
ROLLBACK;
""" % (student_id, sql_str(unit_id))
        try:
            rows = db_sql(sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        attempts = []
        for r in rows:
            attempts.append({
                "id": int(r[0]),
                "student_id": int(r[1]),
                "unit_id": r[2],
                "passed": r[3] == "t" or r[3] is True,
                "pass_count": int(r[4]),
                "total_checks": int(r[5]),
                "checks": json.loads(r[6]),
                "created_at": str(r[7]),
            })
        self._respond(200, {"attempts": attempts})

    # ------------------------------------------------------------------
    # POST routes
    # ------------------------------------------------------------------

    def do_POST(self) -> None:
        if not self._app_authorized():
            self._read_body()
            self._bad_token()
            return

        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path in ("/practice/attempt", "/practice/submit"):
            self._handle_attempt()
            return

        m_att = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/attempt$", parsed.path)
        if m_att:
            self._handle_attempt(unit_id_override=m_att.group(1))
            return

        self._respond(404, {"error": "not found"})

    def _handle_attempt(self, unit_id_override: str | None = None) -> None:
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return

        try:
            payload = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._respond(400, {"error": "invalid JSON"})
            return

        student_id = payload.get("student_id")
        unit_id = unit_id_override or payload.get("unit_id")
        files = payload.get("files")

        if not isinstance(student_id, int) or student_id <= 0:
            self._respond(422, {"error": "student_id (positive integer) is required"})
            return
        if not isinstance(unit_id, str) or not UNIT_RE.match(unit_id):
            self._respond(422, {"error": "unit_id (x.y.z) is required"})
            return
        if not isinstance(files, dict) or not files:
            self._respond(422, {"error": "files object with submitted files is required"})
            return

        # 1. Load manifest and verify unit
        manifest = get_unit_practice_manifest(unit_id)
        if not manifest:
            self._respond(404, {"error": "completion problem not found for unit"})
            return

        editable_set = set(manifest["editable_files"])

        # 2. Strict Whitelist & Payload Validation (Reject anything suspicious before staging)
        submitted_files_clean: dict[str, str] = {}
        for fname, content in files.items():
            if not isinstance(fname, str) or not FILENAME_RE.match(fname) or len(fname) > MAX_FILENAME_LEN:
                self._respond(400, {"error": "invalid_filename", "filename": str(fname)})
                return
            if fname not in editable_set:
                self._respond(400, {"error": "file_not_editable", "filename": fname, "editable_files": manifest["editable_files"]})
                return
            if not isinstance(content, str):
                self._respond(400, {"error": "file_content_must_be_string", "filename": fname})
                return
            if len(content.encode("utf-8")) > MAX_FILE_BYTES:
                self._respond(400, {"error": "file_too_large", "filename": fname})
                return
            if "\0" in content:
                self._respond(400, {"error": "binary_content_rejected", "filename": fname})
                return
            submitted_files_clean[fname] = content

        # 3. Enrollment Gate Authorization: Student must exist and carry an ACTIVE enrollment
        gate_sql = """BEGIN;
SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = %d AND unit_id = %s AND status = 'active'
), EXISTS (
    SELECT 1 FROM students WHERE id = %d
);
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id)
        try:
            gate_rows = db_sql(gate_sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        is_enrolled = gate_rows[0][0] == "t" or gate_rows[0][0] is True
        student_exists = gate_rows[0][1] == "t" or gate_rows[0][1] is True

        if not student_exists:
            self._respond(404, {"error": "student_not_found"})
            return
        if not is_enrolled:
            self._respond(403, {"error": "not_enrolled", "message": f"Active enrollment required for unit {unit_id}"})
            return

        # 4. Stage problem base + student file overrides
        staging_parent = Path(tempfile.mkdtemp(prefix="keel-practice-"))
        staging_sub = staging_parent / "submission"
        target_dir = staging_sub / manifest["base_rel"].rstrip("/")

        try:
            shutil.copytree(manifest["base_dir"], target_dir)
            for fname, content in submitted_files_clean.items():
                (target_dir / fname).write_text(content, encoding="utf-8")

            # 5. Execute sandbox Layer-1 checks
            checks_data = yaml.safe_load(manifest["checks_path"].read_text(encoding="utf-8"))
            if not isinstance(checks_data, list) or not checks_data:
                self._respond(500, {"error": "empty checks definition"})
                return

            timeout_s = float(os.environ.get("KEEL_PRACTICE_TIMEOUT_S", DEFAULT_TIMEOUT_S))
            check_results = []
            for check in checks_data:
                res = layer1.run_check_container(check, staging_sub, timeout_s)
                check_results.append(res)

        except Exception as exc:
            sys.stderr.write(f"practice: staging/sandbox failure: {exc}\n")
            self._respond(502, {"error": "sandbox_execution_error", "detail": str(exc)})
            return
        finally:
            layer1.cleanup_staging(staging_parent)

        passed = all(r.get("status") == "pass" for r in check_results)
        pass_count = sum(1 for r in check_results if r.get("status") == "pass")
        total_checks = len(check_results)

        # 6. Atomic Persistence: practice_attempts row + events spine event in the same transaction
        results_json_str = json.dumps(check_results)
        submitted_meta = json.dumps({f: len(c) for f, c in submitted_files_clean.items()})

        persist_sql = """BEGIN;
WITH att AS (
    INSERT INTO practice_attempts (
        student_id, unit_id, passed, pass_count, total_checks, results_json, submitted_files
    ) VALUES (
        %d, %s, %s, %d, %d, %s::jsonb, %s::jsonb
    )
    RETURNING id, student_id, unit_id, passed, pass_count, total_checks, created_at
), ev AS (
    INSERT INTO events (type, payload)
    SELECT 'practice.attempt_graded',
           jsonb_build_object(
               'attempt_id', id,
               'student_id', student_id,
               'unit_id', unit_id::text,
               'passed', passed,
               'pass_count', pass_count,
               'total_checks', total_checks
           )
    FROM att
    RETURNING id
)
SELECT id, created_at FROM att;
COMMIT;
""" % (
            student_id,
            sql_str(unit_id),
            "true" if passed else "false",
            pass_count,
            total_checks,
            sql_str(results_json_str),
            sql_str(submitted_meta),
        )

        try:
            persist_rows = db_sql(persist_sql)
        except Exception as exc:
            sys.stderr.write(f"practice: DB persistence failed: {exc}\n")
            self._respond(500, {"error": "database persistence error"})
            return

        attempt_id = int(persist_rows[0][0])
        created_at_val = str(persist_rows[0][1])

        self._respond(200, {
            "ok": True,
            "attempt_id": attempt_id,
            "student_id": student_id,
            "unit_id": unit_id,
            "passed": passed,
            "pass_count": pass_count,
            "total_checks": total_checks,
            "checks": check_results,
            "created_at": created_at_val,
        })


def main() -> None:
    port = int(os.environ.get("KEEL_PRACTICE_PORT", "8792"))
    if not app_token():
        sys.stderr.write("refusing to start: KEEL_ENROLL_SECRET not set\n")
        sys.exit(1)
    # Fail fast on a bad KEEL_DB_CMD.
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)
    server = ThreadingHTTPServer(("127.0.0.1", port), PracticeHandler)
    sys.stderr.write("practice grading service listening on 127.0.0.1:%d\n" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
