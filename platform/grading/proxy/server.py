#!/usr/bin/env python3
"""proxy/server.py — the LLM proxy, the ONLY external touch point student
code will ever get (S1.5). Stdlib only.

POST /v1/chat/completions — OpenAI-compatible request in, OpenAI-compatible
response out. Per-student token budgets are enforced by the database:

  pre-check (SQL):  tokens_used >= tokens_cap  -> 429 budget_exceeded,
                    proxy.budget_exceeded event appended, and the call is
                    NEVER forwarded upstream.
  charge (SQL):     after a successful upstream response, tokens_used is
                    incremented atomically by prompt_tokens +
                    completion_tokens from the response usage.
  overshoot rule:   tokens_used may exceed tokens_cap by at most the usage
                    of the last accepted call. Enforcement is the pre-check
                    plus the atomic increment; a per-student in-process lock
                    serializes check -> forward -> charge so the bound holds
                    exactly, never "(N-1) x usage" under concurrent calls.

Student identity: header X-Keel-Student-Id. PLACEHOLDER until per-run token
binding lands at sandbox-wiring time (S1.6+): then the header will carry a
short-lived per-run token resolved server-side instead of trusting the
caller-supplied id.

Upstream URL from env KEEL_PROXY_UPSTREAM_URL (default
https://api.openai.com/v1); platform key from env OPENAI_API_KEY — env only,
never logged, never included in any response. Upstream failure -> 502,
nothing charged.

Database access via the shared db.py helper (env KEEL_DB_CMD, one psql
session per statement group).
"""

import json
import os
import sys
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from db import db_sql, sql_str

ALLOWED_MODELS = ("gpt-4o-mini", "gpt-4.1", "o3")

# Per-student locks: serialize pre-check -> forward -> charge so the
# documented overshoot bound (at most one call's usage past the cap) holds
# under concurrent requests within this process. The database remains the
# enforcement authority (check and increment are SQL); these locks only
# prevent interleaving.
_locks_guard = threading.Lock()
_locks = {}


def student_lock(student_id):
    with _locks_guard:
        if student_id not in _locks:
            _locks[student_id] = threading.Lock()
        return _locks[student_id]


def append_budget_exceeded(student_id, model, used, cap):
    db_sql(
        "BEGIN;\n"
        "INSERT INTO events (type, payload) VALUES ("
        "'proxy.budget_exceeded',"
        "jsonb_build_object('student_id', %s, 'model', %s::text,"
        " 'tokens_used', %s, 'tokens_cap', %s));\n"
        "COMMIT;\n" % (student_id, sql_str(model), used, cap),
        want_rows=False,
    )


def charge(student_id, tokens):
    db_sql(
        "BEGIN;\n"
        "UPDATE budgets SET tokens_used = tokens_used + %d,"
        " updated_at = now() WHERE student_id = %s RETURNING tokens_used;\n"
        "COMMIT;\n" % (tokens, student_id),
        want_rows=False,
    )


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond_json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _respond_raw(self, code, raw):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, fmt, *args):
        # Minimal logging; never log headers (auth) or bodies.
        sys.stderr.write("proxy: %s %s\n" % (self.command, self.path))

    def do_GET(self):
        self._respond_json(404, {"error": {"message": "not found"}})

    def do_POST(self):
        if self.path != "/v1/chat/completions":
            self._respond_json(404, {"error": {"message": "not found"}})
            return

        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""

        # --- validate request shape (no DB, no upstream) ---
        try:
            payload = json.loads(raw)
        except ValueError:
            self._respond_json(400, {"error": {"message": "invalid JSON",
                                               "code": "invalid_json"}})
            return

        model = payload.get("model")
        if model not in ALLOWED_MODELS:
            self._respond_json(400, {
                "error": {"message": "model not allowed: %r" % model,
                          "code": "model_not_allowed",
                          "allowed_models": list(ALLOWED_MODELS)}})
            return

        sid_hdr = self.headers.get("X-Keel-Student-Id")
        try:
            student_id = int(sid_hdr)
        except (TypeError, ValueError):
            self._respond_json(400, {
                "error": {"message": "missing or invalid X-Keel-Student-Id",
                          "code": "invalid_student_id"}})
            return

        # --- resolve student (budget row is read INSIDE the lock below, so
        # the pre-check always sees the committed charges of prior callers) ---
        rows = db_sql(
            "BEGIN;\n"
            "SELECT (SELECT count(*) FROM students WHERE id = %d),"
            " (SELECT count(*) FROM budgets WHERE student_id = %d);\n"
            "COMMIT;\n" % (student_id, student_id))
        known, has_budget = rows[0]
        if known == "0":
            self._respond_json(404, {
                "error": {"message": "unknown student id",
                          "code": "unknown_student"}})
            return
        if has_budget == "0":
            self._respond_json(404, {
                "error": {"message": "no budget row for student",
                          "code": "no_budget_row"}})
            return

        with student_lock(student_id):
            rows = db_sql(
                "BEGIN;\n"
                "SELECT tokens_used, tokens_cap FROM budgets"
                " WHERE student_id = %d;\n"
                "COMMIT;\n" % student_id)
            used, cap = int(rows[0][0]), int(rows[0][1])
            # --- pre-check: cut off BEFORE any upstream call ---
            if used >= cap:
                append_budget_exceeded(student_id, model, used, cap)
                self._respond_json(429, {
                    "error": {"message": "token budget exceeded",
                              "type": "budget_exceeded",
                              "code": "budget_exceeded"}})
                return

            # --- forward upstream (key never logged, never echoed) ---
            upstream = os.environ.get(
                "KEEL_PROXY_UPSTREAM_URL",
                "https://api.openai.com/v1").rstrip("/") + "/chat/completions"
            headers = {"Content-Type": "application/json"}
            key = os.environ.get("OPENAI_API_KEY")
            if key:
                headers["Authorization"] = "Bearer " + key
            req = urllib.request.Request(
                upstream, data=raw, headers=headers, method="POST")
            timeout = float(os.environ.get("KEEL_PROXY_TIMEOUT_S", "120"))
            try:
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    resp_raw = resp.read()
                    resp_code = resp.status
            except (urllib.error.URLError, OSError, ValueError):
                # Nothing charged on upstream failure.
                self._respond_json(502, {
                    "error": {"message": "upstream failure",
                              "code": "upstream_failure"}})
                return

            if resp_code != 200:
                self._respond_json(502, {
                    "error": {"message": "upstream failure",
                              "code": "upstream_failure"}})
                return

            # --- charge atomically from the response usage ---
            try:
                usage = json.loads(resp_raw).get("usage") or {}
                tokens = int(usage.get("prompt_tokens") or 0) + \
                    int(usage.get("completion_tokens") or 0)
            except ValueError:
                tokens = 0
            if tokens > 0:
                try:
                    charge(student_id, tokens)
                except RuntimeError:
                    self._respond_json(500, {
                        "error": {"message": "charge failed",
                                  "code": "charge_failed"}})
                    return

            # Upstream body returned unchanged.
            self._respond_raw(200, resp_raw)


def main():
    port = int(os.environ.get("KEEL_PROXY_PORT", "8788"))
    # Fail fast on a bad KEEL_DB_CMD.
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    sys.stderr.write("proxy listening on 127.0.0.1:%d\n" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
