#!/usr/bin/env python3
"""reader/server.py — read-only submission/verdict endpoint for the learner app (S2.4).

The learner app (platform/app) renders a submission's status and verdict at
/submissions/<id> but must never hold database credentials or write to the
grading store. This service is the only shape it gets:

    GET /healthz                 -> {"ok": true}
    GET /submissions/<id>        -> submission + verdict + event timeline
                                    (404 {"error": "not_found"} for unknown ids)

Read-only by construction: the module issues SELECT statements only — no
INSERT, UPDATE, or DELETE appears in this file — and it wraps each request in
BEGIN/ROLLBACK so even a future edit cannot accidentally commit. Database
access follows the house convention: env KEEL_DB_CMD (shlex-split,
psql-compatible command) via the shared db.py helper, one session per request.
The learner app learns about this service through KEEL_READER_URL, a plain
base URL with no credential in it; every secret stays in the grading core's
environment.

Capability-URL model: submission ids are the access token. The endpoint never
lists submissions and answers nothing about rows the caller did not name. The
verdict page says the link is private; real per-student auth arrives with S2.5.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Add grading dir to sys.path to import shared db module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from db import db_sql, sql_str

ID_MAX_DIGITS = 15  # submissions.id is bigint; anything longer is not an id


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Minimal logging; never log query output (it carries student data).
        sys.stderr.write("reader: %s %s\n" % (self.command, self.path))

    def do_GET(self):
        if self.path == "/healthz":
            self._respond(200, {"ok": True})
            return

        prefix = "/submissions/"
        if not self.path.startswith(prefix):
            self._respond(404, {"error": "not found"})
            return
        raw_id = self.path[len(prefix):]
        if not raw_id.isdigit() or len(raw_id) > ID_MAX_DIGITS:
            self._respond(400, {"error": "bad submission id"})
            return
        sub_id = int(raw_id)

        # One session, SELECTs only, ROLLBACK so the request cannot commit.
        # display_name is the only human-free-text column returned; scrub tabs
        # because db.py splits rows on tab.
        sql = """BEGIN;
SELECT s.id, s.unit_id, s.status, s.commit_sha, s.repo_url, s.created_at,
       s.student_id,
       replace(st.display_name, chr(9), ' ')
FROM submissions s
JOIN students st ON st.id = s.student_id
WHERE s.id = %d;
SELECT rubric_id, rubric_version, overall, verdict_json::text, issued_at
FROM verdicts
WHERE submission_id = %d;
SELECT seq, type, payload::text, occurred_at
FROM events
WHERE payload->>'submission_id' = %s
ORDER BY seq;
ROLLBACK;
""" % (sub_id, sub_id, sql_str(str(sub_id)))

        try:
            rows = db_sql(sql)
        except RuntimeError:
            self._respond(500, {"error": "database error"})
            return

        # db_sql flattens the session's statements into one row list in order:
        # exactly one submission row (or none), at most one verdict row, then
        # the event rows.
        if not rows:
            self._respond(404, {"error": "not_found", "submission_id": sub_id})
            return

        sub_row = rows[0]
        submission = {
            "id": int(sub_row[0]),
            "unit_id": sub_row[1],
            "status": sub_row[2],
            "commit_sha": sub_row[3],
            "repo_url": sub_row[4],
            "created_at": sub_row[5],
            "student_id": int(sub_row[6]),
            "student_name": sub_row[7],
        }

        rest = rows[1:]
        verdict = None
        if rest and len(rest[0]) == 5:
            v = rest[0]
            # psql -tA prints NULL as ""; normalize those to real Nones.
            verdict = {
                "rubric_id": v[0] or None,
                "rubric_version": int(v[1]) if v[1] and v[1].lstrip("-").isdigit() else None,
                "overall": v[2],
                "issued_at": v[4],
                "json": json.loads(v[3]),
            }
            rest = rest[1:]

        events = [
            {"seq": int(e[0]), "type": e[1],
             "payload": json.loads(e[2]), "occurred_at": e[3]}
            for e in rest
        ]
        self._respond(200, {
            "submission": submission,
            "verdict": verdict,
            "events": events,
        })


def main():
    port = int(os.environ.get("KEEL_READER_PORT", "8790"))
    if not os.environ.get("KEEL_DB_CMD"):
        sys.stderr.write("refusing to start: KEEL_DB_CMD not set\n")
        sys.exit(1)
    # Fail fast on a bad KEEL_DB_CMD.
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    sys.stderr.write("reader listening on 127.0.0.1:%d\n" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
