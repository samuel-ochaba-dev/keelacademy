#!/usr/bin/env python3
"""platform/grading/scripts/smoke-practice-checks.py — S3.1 practice grading checks.

Deterministic test battery validating completion-problem Layer-1 grading:
1. Manifest endpoint returns README contract, base files, and editable whitelist.
2. Unfilled base problem grades RED (1 pass / 2 fail).
3. Worked-example solution grades GREEN (3 pass / 0 fail).
4. Partially-filled attempt lands in between (real shape).
5. Whitelisted-file violations (wrong filename, binary content, size cap) rejected 400
   with zero staging and zero DB writes.
6. Unenrolled student rejected 403 with zero staging and zero DB writes.
7. Retry recorded as additive row in practice_attempts and event on the spine.
8. Practice events never touch gates/rebates/unlocks (engine + machine ignore them).
9. Malformed requests fail honestly (400/401/404/422).
10. Attempt history endpoint returns past attempts in reverse chronological order.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
GRADING_DIR = SCRIPT_DIR.parent
REPO_ROOT = GRADING_DIR.parents[1]
CONTENT_ROOT = REPO_ROOT / "content"

sys.path.insert(0, str(GRADING_DIR))
from db import db_sql, sql_str

SERVICE_URL = os.environ.get("KEEL_PRACTICE_URL", "http://127.0.0.1:8792")
APP_TOKEN = os.environ.get("KEEL_ENROLL_SECRET", "smoke-practice-secret")
ENGINE = GRADING_DIR / "gates" / "engine.py"
MACHINE = GRADING_DIR / "rebate" / "machine.py"


def req(path: str, method: str = "GET", body: dict[str, Any] | None = None,
        token: str | None = APP_TOKEN) -> tuple[int, dict[str, Any]]:
    headers = {"Content-Type": "application/json"}
    if token is not None:
        headers["X-Keel-App-Token"] = token
    data = json.dumps(body).encode("utf-8") if body is not None else None
    url = f"{SERVICE_URL}{path}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        try:
            return exc.code, json.loads(raw)
        except Exception:
            return exc.code, {"raw": raw}


def student_id_by_email(email: str) -> int:
    rows = db_sql(f"BEGIN;\nSELECT id FROM students WHERE email = {sql_str(email)};\nROLLBACK;\n")
    if not rows:
        raise RuntimeError(f"student not found: {email}")
    return int(rows[0][0])


PASS_COUNT = 0
FAIL_COUNT = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    global PASS_COUNT, FAIL_COUNT
    if condition:
        print(f"  [PASS] {name}")
        PASS_COUNT += 1
    else:
        print(f"  [FAIL] {name} {detail}", file=sys.stderr)
        FAIL_COUNT += 1


def main() -> int:
    global PASS_COUNT, FAIL_COUNT
    print("== 1. Practice Manifest Endpoint ==")
    code, m = req("/practice/manifest?unit=3.2.1")
    check("manifest endpoint returns 200", code == 200, f"got {code}")
    check("manifest unit_id is 3.2.1", m.get("unit_id") == "3.2.1")
    check("manifest editable_files is ['extractor.py', 'schemas.py']",
          sorted(m.get("editable_files", [])) == ["extractor.py", "schemas.py"])
    check("manifest includes base files",
          all(k in m.get("base_files", {}) for k in ["schemas.py", "extractor.py", "test_extractor.py", "README.md"]))
    check("manifest includes checks descriptor",
          len(m.get("checks", [])) == 3)

    code, _ = req("/practice/manifest?unit=9.9.9")
    check("manifest for non-existent unit returns 404", code == 404, f"got {code}")

    code, _ = req("/practice/manifest?unit=invalid")
    check("manifest for bad unit format returns 400", code == 400, f"got {code}")

    code, _ = req("/practice/manifest?unit=3.2.1", token=None)
    check("manifest without auth token returns 401", code == 401, f"got {code}")

    alice_id = student_id_by_email("alice@keel.test")
    bob_id = student_id_by_email("bob@keel.test")
    carol_id = student_id_by_email("carol@keel.test")

    # Read base files from content repo for testing
    comp_base = CONTENT_ROOT / "units" / "phase-3" / "3.2.1" / "completion"
    base_schemas = (comp_base / "schemas.py").read_text()
    base_extractor = (comp_base / "extractor.py").read_text()

    we_base = CONTENT_ROOT / "units" / "phase-3" / "3.2.1" / "worked-example"
    we_schemas = (we_base / "schemas.py").read_text()
    we_extractor = (we_base / "extractor.py").read_text()

    print("\n== 2. Unfilled Base Attempt (Alice) ==")
    code, res = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": base_schemas,
            "extractor.py": base_extractor,
        },
    })
    check("unfilled base submission returns 200", code == 200, f"got {code}: {res}")
    check("unfilled base overall passed is False", res.get("passed") is False)
    check("unfilled base pass_count is 1 and total_checks is 3",
          res.get("pass_count") == 1 and res.get("total_checks") == 3)

    checks_by_id = {c["id"]: c for c in res.get("checks", [])}
    check("completion-tests-green fails on base",
          checks_by_id.get("completion-tests-green", {}).get("status") == "fail")
    check("no-gap-markers-remain fails on base",
          checks_by_id.get("no-gap-markers-remain", {}).get("status") == "fail")
    check("pipeline-runs-end-to-end passes on base",
          checks_by_id.get("pipeline-runs-end-to-end", {}).get("status") == "pass")

    # DB verification for attempt 1
    rows = db_sql(f"BEGIN;\nSELECT passed, pass_count, total_checks FROM practice_attempts WHERE student_id = {alice_id} AND id = {res.get('attempt_id')};\nROLLBACK;\n")
    check("attempt 1 persisted in practice_attempts table", len(rows) == 1 and rows[0][0] == "f")

    # Event spine verification for attempt 1
    ev_rows = db_sql(f"BEGIN;\nSELECT type, payload->>'passed', payload->>'pass_count' FROM events WHERE type = 'practice.attempt_graded' AND payload->>'student_id' = '{alice_id}';\nROLLBACK;\n")
    check("practice.attempt_graded event emitted on spine", len(ev_rows) == 1 and ev_rows[0][1] == "false")

    print("\n== 3. Worked-Example Solution Attempt (Alice) ==")
    code, res2 = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": we_schemas,
            "extractor.py": we_extractor,
        },
    })
    check("worked-example submission returns 200", code == 200, f"got {code}: {res2}")
    check("worked-example overall passed is True", res2.get("passed") is True)
    check("worked-example pass_count is 3 of 3",
          res2.get("pass_count") == 3 and res2.get("total_checks") == 3)
    check("worked-example distinct attempt_id assigned",
          res2.get("attempt_id") != res.get("attempt_id"))

    checks2_by_id = {c["id"]: c for c in res2.get("checks", [])}
    check("completion-tests-green passes on worked-example",
          checks2_by_id.get("completion-tests-green", {}).get("status") == "pass")
    check("no-gap-markers-remain passes on worked-example",
          checks2_by_id.get("no-gap-markers-remain", {}).get("status") == "pass")
    check("pipeline-runs-end-to-end passes on worked-example",
          checks2_by_id.get("pipeline-runs-end-to-end", {}).get("status") == "pass")

    alice_attempts_db = db_sql(f"BEGIN;\nSELECT count(*) FROM practice_attempts WHERE student_id = {alice_id};\nROLLBACK;\n")
    check("alice has exactly 2 persisted practice attempts", alice_attempts_db[0][0] == "2")

    print("\n== 4. Partially-Filled Attempt (Bob) ==")
    code, res_bob = req("/practice/attempt", method="POST", body={
        "student_id": bob_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": we_schemas,
            "extractor.py": base_extractor,
        },
    })
    check("partially-filled submission returns 200", code == 200, f"got {code}: {res_bob}")
    check("partially-filled passed is False", res_bob.get("passed") is False)
    check("partially-filled pass_count is 1 of 3", res_bob.get("pass_count") == 1)

    print("\n== 5. Whitelisted-File Violations Rejections ==")
    count_before = int(db_sql("BEGIN;\nSELECT count(*) FROM practice_attempts;\nROLLBACK;\n")[0][0])

    # Case A: Wrong / non-whitelisted filename
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": base_schemas,
            "evil.py": "import os\n",
        },
    })
    check("non-whitelisted file evil.py rejected 400", code == 400 and err.get("error") == "file_not_editable", f"got {code}: {err}")

    # Case B: Read-only base file tampering
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "test_extractor.py": "def test_all(): pass\n",
        },
    })
    check("test_extractor.py tampering rejected 400", code == 400 and err.get("error") == "file_not_editable", f"got {code}: {err}")

    # Case C: Path traversal filename
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "../escape.py": "print(1)\n",
        },
    })
    check("path traversal filename rejected 400", code == 400 and err.get("error") == "invalid_filename", f"got {code}: {err}")

    # Case D: Binary null bytes in content
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": "from pydantic import BaseModel\x00bad",
        },
    })
    check("binary content with null byte rejected 400", code == 400 and err.get("error") == "binary_content_rejected", f"got {code}: {err}")

    # Case E: Oversized file payload (>128KB)
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": alice_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": "x = 1\n" * 70000,
        },
    })
    check("oversized file payload rejected 400", code == 400 and err.get("error") == "file_too_large", f"got {code}: {err}")

    count_after = int(db_sql("BEGIN;\nSELECT count(*) FROM practice_attempts;\nROLLBACK;\n")[0][0])
    check("zero rows written for all rejected attempts", count_before == count_after, f"{count_before} vs {count_after}")

    print("\n== 6. Unenrolled Student Rejection ==")
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": carol_id,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": base_schemas,
            "extractor.py": base_extractor,
        },
    })
    check("unenrolled student Carol rejected 403", code == 403 and err.get("error") == "not_enrolled", f"got {code}: {err}")

    carol_rows = db_sql(f"BEGIN;\nSELECT count(*) FROM practice_attempts WHERE student_id = {carol_id};\nROLLBACK;\n")
    check("zero rows written for unenrolled student", carol_rows[0][0] == "0")

    print("\n== 7. Non-existent Student Rejection ==")
    code, err = req("/practice/attempt", method="POST", body={
        "student_id": 999999,
        "unit_id": "3.2.1",
        "files": {
            "schemas.py": base_schemas,
            "extractor.py": base_extractor,
        },
    })
    check("unknown student id rejected 404", code == 404 and err.get("error") == "student_not_found", f"got {code}: {err}")

    print("\n== 8. Practice Events Isolation from Gates & Rebates ==")
    # Run the gate engine and rebate machine to prove practice.attempt_graded is completely invisible to them
    env = os.environ.copy()
    env["KEEL_GATE_ONCE"] = "1"
    env["KEEL_REBATE_ONCE"] = "1"
    subprocess.run([sys.executable, str(ENGINE)], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run([sys.executable, str(MACHINE)], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    unlocked_count = db_sql("BEGIN;\nSELECT count(*) FROM unlocked_units;\nROLLBACK;\n")[0][0]
    rebates_count = db_sql("BEGIN;\nSELECT count(*) FROM rebates;\nROLLBACK;\n")[0][0]
    gate_passed_count = db_sql("BEGIN;\nSELECT count(*) FROM events WHERE type = 'gate.passed';\nROLLBACK;\n")[0][0]
    gate_pledged_count = db_sql("BEGIN;\nSELECT count(*) FROM events WHERE type = 'gate.pledged';\nROLLBACK;\n")[0][0]

    check("practice passes produce zero unlocked_units rows", unlocked_count == "0", f"got {unlocked_count}")
    check("practice passes produce zero rebates rows", rebates_count == "0", f"got {rebates_count}")
    check("practice passes produce zero gate.passed events", gate_passed_count == "0", f"got {gate_passed_count}")
    check("practice passes produce zero gate.pledged events", gate_pledged_count == "0", f"got {gate_pledged_count}")

    print("\n== 9. Attempt History Endpoint ==")
    code, hist = req(f"/practice/attempts?student_id={alice_id}&unit=3.2.1")
    check("attempts history endpoint returns 200", code == 200, f"got {code}")
    att_list = hist.get("attempts", [])
    check("alice has 2 attempts returned in history", len(att_list) == 2, f"got {len(att_list)}")
    check("history is ordered descending (latest attempt first)",
          att_list[0]["id"] > att_list[1]["id"] and att_list[0]["passed"] is True and att_list[1]["passed"] is False)

    print("\n== 10. Malformed Requests ==")
    code, _ = req("/practice/attempt", method="POST", body={"student_id": "not_an_int", "unit_id": "3.2.1", "files": {}})
    check("invalid student_id type returns 422", code == 422, f"got {code}")

    code, _ = req("/practice/attempt", method="POST", body={"student_id": alice_id, "unit_id": "bad_unit", "files": {}})
    check("invalid unit_id format returns 422", code == 422, f"got {code}")

    code, _ = req("/practice/attempt", method="POST", body={"student_id": alice_id, "unit_id": "3.2.1", "files": None})
    check("missing files dict returns 422", code == 422, f"got {code}")

    print(f"\n== SMOKE PRACTICE CHECKS COMPLETE: {PASS_COUNT} passed, {FAIL_COUNT} failed ==")
    return 0 if FAIL_COUNT == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
