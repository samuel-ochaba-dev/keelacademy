#!/usr/bin/env python3
"""platform/grading/worker.py — Job queue worker for grading submissions (S1.3).

Consumes queued submissions from PostgreSQL and writes exactly-once verdicts,
surviving crashes, restarts, and concurrent duplicates.

Stdlib only. Deterministic stub grading step (sha256 parity + configurable sleep).
"""

import hashlib
import json
import os
import sys
import time
from pathlib import Path

# Add parent directory to sys.path to import shared db module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from db import db_cmd, db_sql, sql_str


def grade_stub(commit_sha: str) -> dict:
    """Deterministic stub grade step.

    Pass if sha256(commit_sha) is even, else fail.
    Sleeps KEEL_GRADE_SLEEP_S (default 1.0) to simulate grading work and allow
    testing of crash/kill windows.
    """
    sleep_s = float(os.environ.get("KEEL_GRADE_SLEEP_S", "1"))
    if sleep_s > 0:
        time.sleep(sleep_s)

    h = hashlib.sha256(commit_sha.encode("utf-8")).hexdigest()
    is_even = (int(h, 16) % 2 == 0)
    overall = "pass" if is_even else "fail"
    return {
        "overall": overall,
        "criteria": [],
        "stub": True,
    }


def claim_submission():
    """Atomically claim one queued submission using SELECT FOR UPDATE SKIP LOCKED.

    Flips status queued -> grading in a single transaction and returns the claimed row.
    Two concurrent workers will never claim the same row.
    """
    sql = """BEGIN;
WITH next_sub AS (
    SELECT id
    FROM submissions
    WHERE status = 'queued'
    ORDER BY id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
UPDATE submissions s
SET status = 'grading'
FROM next_sub
WHERE s.id = next_sub.id
RETURNING s.id, s.student_id, s.unit_id, s.commit_sha, s.repo_url;
COMMIT;
"""
    rows = db_sql(sql)
    if not rows:
        return None
    return rows[0]


def write_verdict(sub_id: int, unit_id: str, overall: str, verdict_data: dict) -> tuple[int, str, dict]:
    """Write verdict to database with ON CONFLICT DO NOTHING.

    If inserted -> this worker won.
    If conflict -> another attempt or concurrent worker already wrote the verdict:
    read it back, reconcile, and treat as already-graded.
    """
    rubric_id = f"rubric-{unit_id}"
    rubric_version = 1
    verdict_json_str = json.dumps(verdict_data)

    sql_insert = """BEGIN;
INSERT INTO verdicts (submission_id, rubric_id, rubric_version, overall, verdict_json)
VALUES (%d, %s, %d, %s, %s::jsonb)
ON CONFLICT (submission_id) DO NOTHING
RETURNING id, overall, verdict_json;
COMMIT;
""" % (
        sub_id,
        sql_str(rubric_id),
        rubric_version,
        sql_str(overall),
        sql_str(verdict_json_str),
    )

    rows = db_sql(sql_insert)
    if rows:
        verdict_id = int(rows[0][0])
        res_overall = rows[0][1]
        res_json = json.loads(rows[0][2])
        return verdict_id, res_overall, res_json

    # Conflict occurred: read back existing verdict
    sql_select = """BEGIN;
SELECT id, overall, verdict_json
FROM verdicts
WHERE submission_id = %d;
COMMIT;
""" % sub_id
    rows = db_sql(sql_select)
    if not rows:
        raise RuntimeError("Verdict insert conflicted but existing row could not be read")
    verdict_id = int(rows[0][0])
    res_overall = rows[0][1]
    res_json = json.loads(rows[0][2])
    return verdict_id, res_overall, res_json


def finish_submission(sub_id: int, student_id: int, unit_id: str, commit_sha: str,
                      verdict_id: int, overall: str, verdict_data: dict):
    """Idempotently update submission status to 'graded' and append 'verdict.issued' event.

    Single transaction. Appends verdict.issued ONLY IF no verdict.issued event with this
    submission_id exists yet (WHERE NOT EXISTS on payload->>'submission_id').
    """
    payload = {
        "submission_id": int(sub_id),
        "student_id": int(student_id),
        "unit_id": str(unit_id),
        "commit_sha": str(commit_sha),
        "overall": str(overall),
        "verdict_id": int(verdict_id),
    }
    payload_str = json.dumps(payload)

    sql = """BEGIN;
UPDATE submissions
SET status = 'graded'
WHERE id = %d;

INSERT INTO events (type, payload)
SELECT 'verdict.issued',
       %s::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM events
    WHERE type = 'verdict.issued'
      AND payload->>'submission_id' = %s
);
COMMIT;
""" % (
        sub_id,
        sql_str(payload_str),
        sql_str(str(sub_id)),
    )
    db_sql(sql, want_rows=False)


def reap_stale(stale_after_s: float):
    """Requeue or recover stale claims before claiming each loop.

    1. Submissions in status 'grading' WITH an existing verdict -> recover via finish path.
    2. Submissions in status 'grading' older than stale_after_s with NO verdict -> reset to 'queued'.
    """
    # 1. Recover grading submissions that already have a verdict (e.g. killed after write, before finish)
    sql_with_verdict = """BEGIN;
SELECT s.id, s.student_id, s.unit_id, s.commit_sha, v.id, v.overall, v.verdict_json
FROM submissions s
JOIN verdicts v ON v.submission_id = s.id
WHERE s.status = 'grading';
COMMIT;
"""
    rows = db_sql(sql_with_verdict)
    for r in rows:
        s_id, s_student, s_unit, s_sha, v_id, v_overall, v_json_raw = r
        v_data = json.loads(v_json_raw) if isinstance(v_json_raw, str) else v_json_raw
        finish_submission(int(s_id), int(s_student), s_unit, s_sha, int(v_id), v_overall, v_data)

    # 2. Reset stale grading submissions without verdicts back to 'queued'
    sql_stale = """BEGIN;
UPDATE submissions
SET status = 'queued'
WHERE status = 'grading'
  AND created_at <= now() - (%f * interval '1 second')
  AND NOT EXISTS (
      SELECT 1 FROM verdicts
      WHERE submission_id = submissions.id
  );
COMMIT;
""" % float(stale_after_s)
    db_sql(sql_stale, want_rows=False)


def process_submission(row):
    """Full lifecycle for one claimed submission: grade -> write -> finish."""
    sub_id_str, student_id_str, unit_id, commit_sha, repo_url = row
    sub_id = int(sub_id_str)
    student_id = int(student_id_str)

    verdict_data = grade_stub(commit_sha)
    verdict_id, overall, verdict_data = write_verdict(
        sub_id, unit_id, verdict_data["overall"], verdict_data
    )
    finish_submission(
        sub_id, student_id, unit_id, commit_sha, verdict_id, overall, verdict_data
    )


def run_worker():
    once = os.environ.get("KEEL_WORKER_ONCE", "0").lower() in ("1", "true", "yes")
    stale_after_s = float(os.environ.get("KEEL_STALE_AFTER_S", "300"))
    poll_interval_s = float(os.environ.get("KEEL_POLL_INTERVAL_S", "0.5"))

    # Fail fast on database connection error
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)

    while True:
        try:
            reap_stale(stale_after_s)
        except Exception as e:
            sys.stderr.write("worker: reaper error: %s\n" % e)

        try:
            row = claim_submission()
        except Exception as e:
            sys.stderr.write("worker: claim error: %s\n" % e)
            if once:
                break
            time.sleep(poll_interval_s)
            continue

        if row is None:
            if once:
                break
            time.sleep(poll_interval_s)
            continue

        try:
            process_submission(row)
        except Exception as e:
            sub_id = row[0]
            sys.stderr.write("worker: error processing submission %s: %s\n" % (sub_id, e))
            try:
                db_sql(
                    "BEGIN;\nUPDATE submissions SET status = 'error' WHERE id = %d;\nCOMMIT;\n"
                    % int(sub_id),
                    want_rows=False,
                )
            except Exception as db_err:
                sys.stderr.write("worker: failed to set status='error' for submission %s: %s\n" % (sub_id, db_err))


if __name__ == "__main__":
    run_worker()
