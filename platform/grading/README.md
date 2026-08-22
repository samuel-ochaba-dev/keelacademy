# platform/grading — Postgres schema (S1.1)

The grading core's datastore. Everything in Stage 1 — webhook intake, job
queue, exactly-once verdicts, progress gates — hangs off these five tables.

## Layout

- `schema/0001_init.sql` — forward-only migrations; fresh-apply per number,
  idempotency not required.
- `scripts/smoke-schema.sh` — spins up a scratch `postgres:16-alpine` on a
  random free port, applies the schema, runs `scripts/smoke.sql` proof checks,
  always removes the container.

## Table shapes

| table | purpose | key constraints |
|---|---|---|
| `students` | learner identity | `email` UNIQUE NOT NULL; `external_auth_id` UNIQUE NULL (for S2.5 managed auth) |
| `events` | append-only spine of the event-driven design | `seq bigserial UNIQUE` = total order; `type` + `payload jsonb` |
| `submissions` | one push of one commit for one unit | `UNIQUE (student_id, unit_id, commit_sha)` — same commit + unit is one submission; `status` CHECK `queued\|grading\|graded\|error` |
| `verdicts` | the graded outcome | `submission_id BIGINT UNIQUE NOT NULL` — **one verdict per submission, ever** |
| `progress` | per-unit gate state | `UNIQUE (student_id, unit_id)`; `state` CHECK `locked\|unlocked\|passed`; upsert-friendly |

`timestamptz` everywhere. Deletion policy: deleting a student cascades to
their submissions and progress; `verdicts.submission_id` is `ON DELETE
RESTRICT` — verdicts are audit-grade history and cannot be orphaned. Events
have no FK by design (they reference the world loosely, via `payload`).

Indexes: `events (type, occurred_at)` for per-type replay/catch-up,
`submissions (student_id)`, `progress (student_id)`.

## Exactly-once design intent

S1.3's worker may crash mid-grade, retry, or run duplicate jobs — the schema
doesn't care. `verdicts.submission_id UNIQUE` means the *database*, not
application memory, prevents a second verdict: whichever transaction inserts
first wins; every other attempt fails with a unique violation the worker
treats as "already graded, ack and move on." The smoke test proves this by
inserting a second verdict and asserting the constraint fires. Likewise
`submissions UNIQUE (student_id, unit_id, commit_sha)` makes webhook delivery
retries naturally idempotent at intake.

## How S1.2 webhook intake will map push events

The GitHub webhook receiver will validate a push payload, resolve the pusher
to a `students` row (via email or `external_auth_id`), and — inside one
transaction — insert a `submissions` row keyed by
`(student_id, unit_id, commit_sha)` with status `queued` (using
`INSERT ... ON CONFLICT DO NOTHING` so redelivered webhooks and force-pushes
of the same commit are absorbed), then append a `submission.created` event
whose payload carries the submission id. The queue worker in S1.3 consumes
`submission.created`, flips status `queued → grading → graded`, writes the
single `verdicts` row, and emits `verdict.issued`; the gate engine later
consumes `verdict.issued` to upsert `progress` and emit `gate.unlocked`.

## Intake (S1.2)

`intake/server.py` is a stdlib HTTP server exposing `POST /webhook/github`
for GitHub-style push payloads.

**Signature scheme.** Byte-for-byte GitHub's: the `X-Hub-Signature-256`
header must equal `sha256=` + hex HMAC-SHA256 of the **raw request body**
with the secret from env `KEEL_WEBHOOK_SECRET` (env only — never disk, never
hardcoded, never logged). Verification uses `hmac.compare_digest` and runs
**before any JSON parsing**; a bad or missing signature returns 401 with no
database writes.

**Mapping.** The repo name must match `keel-<unit-id>-<anything>` (e.g.
`keel-3.2.1-smith` → unit `3.2.1`, unit id must match `^\d+\.\d+\.\d+$`, else
422). The pusher is resolved by push-commit email against `students.email`.
Unknown email → 200 (so GitHub doesn't retry), no submission, but an
`intake.unknown_pusher` event carrying email/repo/sha.

**Idempotency contract.** Known pusher → one transaction inserts the
submission `(student_id, unit_id, commit_sha, repo_url, pusher_email, status
'queued')` with `ON CONFLICT DO NOTHING` on the UNIQUE triple and appends a
`submission.created` event (payload carries the submission id) **only when
the row was newly inserted**. Redelivered webhooks for the same commit return
the same submission id, produce no second event, and stay 2xx. Two students
pushing the same unit + commit are two submissions — the key is the triple,
not the pair.

**S1.3 handoff.** The queue worker consumes `submission.created` events,
flips `queued → grading → graded`, and writes the single per-submission
verdict. Real GitHub wiring (public tunnel, managed OAuth identity) is pilot
infrastructure / S2.5, not Stage-1 code; local payloads signed with a test
secret exercise the identical HMAC path.

**Database access.** stdlib-only, so the server shells out to a
psql-compatible command from env `KEEL_DB_CMD` (e.g.
`docker exec -i <container> psql -U smoke -d grading`); each request is one
`BEGIN`/`COMMIT` session. The secret and DB command never leave env.

```bash
KEEL_WEBHOOK_SECRET=... KEEL_DB_CMD="... psql ..." python3 intake/server.py
```

## Queue worker (S1.3)

`worker.py` is the stdlib queue worker that consumes queued submissions and writes exactly-once verdicts, surviving crashes, restarts, and concurrent duplicates.

### State machine: Claim → Grade → Write → Finish

1. **CLAIM (atomic, race-free):** Single transaction using `SELECT FOR UPDATE SKIP LOCKED` on `submissions WHERE status = 'queued' ORDER BY id ASC LIMIT 1`, transitioning `status` from `'queued'` to `'grading'` and returning the claimed row. Two workers never claim the same row; if another worker is evaluating a row, `SKIP LOCKED` skips past it.
2. **GRADE (deterministic stub):** Computes verdict deterministically: `pass` if `sha256(commit_sha)` is even, else `fail`. Sleeps for `KEEL_GRADE_SLEEP_S` (default 1.0s) to simulate grading and provide testable kill/crash windows. Output is structured verdict JSON: `{"overall": ..., "criteria": [], "stub": true}`.
3. **WRITE (database-enforced exactly-once):** Executes `INSERT INTO verdicts (submission_id, ...) VALUES (...) ON CONFLICT (submission_id) DO NOTHING RETURNING ...`. If a row is returned, this worker won the insert. If an `ON CONFLICT` occurs (due to a redelivery, duplicate job, or retry after crash), the worker reads back the existing verdict row and reconciles. The database's `verdicts.submission_id UNIQUE` constraint arbitrates exactly-once writes; memory state is never trusted.
4. **FINISH (idempotent wrap-up):** Single transaction that updates `submissions SET status = 'graded' WHERE id = ...` and appends a `verdict.issued` event to `events` **only if** no event with this `submission_id` exists yet (`WHERE NOT EXISTS (SELECT 1 FROM events WHERE type = 'verdict.issued' AND payload->>'submission_id' = ...)`).

### Crash recovery and reaper semantics

- **Reaper on each loop:** Prior to claiming, the worker runs a reaper sweep:
  - **Grading with verdict:** Submissions stuck in `status = 'grading'` that already have a row in `verdicts` (e.g. worker was SIGKILLed between WRITE and FINISH) are advanced to `'graded'` and emitted to `verdict.issued` via the idempotent finish path.
  - **Stale grading without verdict:** Submissions stuck in `status = 'grading'` older than `KEEL_STALE_AFTER_S` seconds without any verdict row (e.g. worker died mid-grade) are atomically reset to `status = 'queued'`.
- **Poison redelivery:** If an already-graded submission is forced back to `'queued'`, the worker claims it, attempts to write the verdict (which hits `ON CONFLICT DO NOTHING`), reads back the existing verdict, updates status back to `'graded'`, and emits no duplicate event.
- **Modes:** Continuous polling loop or one-shot mode (`KEEL_WORKER_ONCE=1`), which drains the queue and exits 0 cleanly. Errors on a single submission log to stderr and set `status = 'error'` without crashing the worker process.

### S1.4 handoff

In S1.4, `grade_stub(commit_sha)` will be replaced by the sandboxed runner (`platform/grading/sandbox/` or runner integration) executing untrusted student code in isolated containers with CPU/memory/time caps and network restrictions.

## Running the smoke tests

```bash
./scripts/smoke-schema.sh
```

Requires only Docker; no host Postgres client, no Python dependencies beyond
stdlib (used to grab a free port). No secrets, no network beyond the
`postgres:16-alpine` pull.

```bash
./scripts/smoke-intake.sh
```

Same scratch-container pattern plus: applies 0001 + 0002, seeds a student,
starts `intake/server.py` with a test secret that exists only in the
harness's process env, and runs five checks (a)–(e) — signed push, exact
redelivery, tampered body, unknown pusher, second student same unit+sha.
Always kills the server and removes the container.

```bash
./scripts/smoke-worker.sh
```

Spins up a scratch `postgres:16-alpine` container, applies schema 0001 + 0002,
seeds a student, and runs four checks (a)–(d) proving happy path, SIGKILL
mid-grade crash recovery, concurrent worker race (with zero error noise from
the losing worker), and poison redelivery idempotency. Always cleans up containers
and processes.
