# Build State — keelacademy platform

**Last updated:** 2026-08-22
**Stage:** 1 — Grading core service (Stage 0 completed 2026-08-22)
**Milestone in progress:** S1.3

> ## Resume protocol — read this first
> 1. Read this file, then skim build-plan.md §4 for the current stage's exit criteria.
> 2. Work the single **Next action** below. Nothing else.
> 3. At session end: check off finished milestones, update Status/Next action, append any decisions or blockers (dated). Milestones are tiny by design — if one can't finish in a sitting, split it and record the split here.

## Next action

Build the job queue + exactly-once verdict worker (S1.3) — task prompt issued to the worker AI. Done when: killing a worker mid-grade and retrying produces exactly one verdict; two concurrent workers racing one submission produce exactly one verdict.

---

## Stage 0 — Schema + walking skeleton (no UI)
*Exit: grading loop works end-to-end via CLI on real messy submissions; judge ≥90% agreement with human grades on golden set; adversarial submissions caught ≥4/5.*

- [x] S0.1 Four content schemas written as JSON Schema (unit, rubric, data-variant, persona) — accepted on review 2026-08-21; validator output confirms 4 valid + 1 expected-invalid
- [x] S0.2 Golden-path unit 3.2.1 authored in full: lesson (3 layers), worked example, completion problem + checks, retrieval seeds, rubric v1, 15 pre-graded golden submissions — accepted on execution-verified review 2026-08-21
- [x] S0.3 CLI: point at a repo → run its pytest in Docker → parse per-test results. *Done when: a fixture repo with one failing test prints which test failed* — accepted on execution-verified review 2026-08-21 (fixture names the failing nodeid; completion base fails naming the 5 gap tests; filled copy passes 3/3 after the no-gap-markers scoping fix; faq/3.2.1.md stub added)
- [x] S0.4 CLI: rubric judge → structured verdict (pass/fail per criterion + quoted evidence). *Done when: verdict JSON validates against its schema and quotes submission text* — accepted on execution-verified review 2026-08-21 (s01 pass / s07 fail / s12 fail, matching human grades; reviewer's independent judge runs agreed criterion-for-criterion)
- [x] S0.5 CLI: defend-your-work — generate 2–3 follow-up questions from a submission's actual code. *Done when: questions reference specifics of the submitted code, not generics* — accepted on execution-verified review 2026-08-21 (s01 vs s12 question sets differ on their distinctive design choices; all 13+13 anchors grep-verified present and referenced; reviewer's independent runs reproduced equivalent question sets; judge refactor regression-tested PASS exit 0)
- [x] S0.6 Judge calibration: run judge over the 15 golden submissions, compare to human grades, record agreement % — accepted on execution-verified review 2026-08-21 (worker and reviewer runs identical: 14/15 overall = 93.3%; criterion agreement 72/75 = 96.0% after the reviewer corrected two reference bugs (s09 conservation, s10 failures-logged); borderline semantics ratified: compare against the resolved binary overall)
- [x] S0.7 Adversarial pass: 5 gamed submissions (AI-written, copied, rushed) — record how many the pipeline catches. Includes the judge-blind-spot fix package calibration exposed — accepted on execution-verified review 2026-08-22 (calibration after fixes: 15/15 overall and 75/75 criterion in both worker and reviewer runs; all 5 attacks caught — prompt injection, rubric parroting, test gaming, dead-code decoy all failed at L2, verbatim copy correctly passed L2 and caught by L3 defend questions). **STAGE 0 EXIT GATE MET.**

## Stage 1 — Grading core service
*Exit: git push → verdict, zero human involvement; rubric change that degrades golden-set accuracy blocks merge.*

- [x] S1.1 Postgres schema: events, submissions, verdicts, students, progress — accepted on execution-verified review 2026-08-22 (reviewer's own smoke run: schema applied to scratch postgres:16-alpine, all 6 checks PASS including both expected constraint violations quoted verbatim; container auto-removed; no leftover containers)
- [x] S1.2 GitHub OAuth + webhook intake (push → submission.created event) — accepted on execution-verified review 2026-08-22 (OAuth half formally deferred to S2.5 managed auth; reviewer's own smoke-intake run: 5/5 checks PASS, exit 0, tampered payload rejected 401 with zero DB writes, no leftover containers/processes)
- [ ] S1.3 Job queue + worker; idempotent, exactly-once verdict writes. *Done when: killing the worker mid-grade and retrying produces exactly one verdict*
- [ ] S1.4 Sandbox runner: Docker, network allowlist only, CPU/mem/time caps, ephemeral FS. *Done when: a fixture submission that tries to phone home / fork-bomb is contained and reported*
- [ ] S1.5 LLM proxy with per-student budgets. *Done when: student code exceeding budget is cut off and flagged*
- [ ] S1.6 Rubric versioning + CI golden-set regression gate on rubric PRs
- [ ] S1.7 Trace logging on every grading call (prompt, response, tokens, cost, latency)

## Stage 2 — Content pipeline + learner UI MVP
*Exit: a test student can sign up, pay, and complete unit 3.2.1 end to end.*

- [ ] S2.1 Content repo layout + schema-validation CI (invalid unit YAML fails the build)
- [ ] S2.2 Content PR CI: dry-run the unit's deterministic checks against a reference solution
- [ ] S2.3 Unit-page renderer: Learn / Practice / Build / Verify / Unstuck from content repo
- [ ] S2.4 Submission flow + verdict display (criteria, evidence quotes, retry path)
- [ ] S2.5 Auth (managed) + Stripe one-time payment
- [ ] S2.6 Rebate state machine wired to gate events
- [ ] S2.7 Gate engine: verdict events unlock units per gate rules
- [ ] S2.8 Progress dashboard v1 — the growing Meridian map

## Stage 3 — Practice engine + concierge
*Exit: failed drill → worked example → completion problem → retry works; teach/guard modes verified in CI.*

- [ ] S3.1 Completion-problem grading via Layer 1 checks
- [ ] S3.2 Retrieval-question generation + grading per lesson
- [ ] S3.3 Spaced re-check scheduler (day +3, +7 surfaces)
- [ ] S3.4 Adaptive routing rules (fast pass skips worked example; fail routes through scaffold)
- [ ] S3.5 Concierge v1 with server-side teach/guard mode switch
- [ ] S3.6 CI test prompts proving guard mode never writes deliverables

## Stage 4 — Community, simulations, retention, analytics
*Exit: pilot-ready for the Phases 0–3 cohort.*

- [ ] S4.1 Commitment screen + placement diagnostic live at signup
- [ ] S4.2 Pod tooling (Discord integration) + required weekly post flow
- [ ] S4.3 Weekly personalized digest (sent whether or not the student logged in)
- [ ] S4.4 Public build gallery v1
- [ ] S4.5 Simulation service: discovery-call persona, scored
- [ ] S4.6 Simulation service: two skeptical-reviewer personas, scored, feeding gates
- [ ] S4.7 Per-unit drop-off dashboard

## Content production track (after Stage 2)
- [ ] C1 Pilot batch: Phases 0–3 lessons + rubrics + fixtures authored and passing CI
- [ ] C2 Phases 4–5
- [ ] C3 Phases 6–7
- [ ] C4 Phases 8–10
- [ ] C5 Phase 11 simulation content + personas

---

## Decisions log (append-only, dated)

- **2026-08-21** — No videos, live lessons, TAs, or mentors. Teaching authored in-house, text-first; no outsourced/curated-link teaching.
- **2026-08-21** — No paid human-review tier at any price; the verification stack must be sufficient on its own.
- **2026-08-21** — Content as data: lessons/rubrics/fixtures live in a git content repo (MDX + YAML, schema-validated). No CMS build.
- **2026-08-21** — Sandbox = security boundary; student LLM access only via platform proxy with per-student budgets.
- **2026-08-21** — Buy: auth, billing, analytics, community tooling. Build: grading, practice, sandbox, gates, simulations, renderer.
- **2026-08-21** — Stack: Next.js/TS learner app · FastAPI/Python services · Postgres · git-based content store.
- **2026-08-21** — S0.1 accepted on review of worker-AI output (schemas + examples + validate.py verified by running it). Done-when decoupled from S0.2: schemas are proven by example instances plus invalid-case rejection. validate.py is the seed of the content CI (S2.1).
- **2026-08-21** — Path convention set for content: unit-local assets (lesson, worked example, completion fixtures) live under the unit directory; shared assets (checks, rubrics, judge prompts, golden sets, faq) live in root-level dirs keyed by unit id; paths in unit.yaml are relative to content/ root.
- **2026-08-21** — Learner app will be scaffolded with `create-next-app@latest` (non-interactive flags: --typescript --tailwind --eslint --app) into `platform/` at Stage 2 (S2.3) — not before, since Stages 0–1 have no frontend.
- **2026-08-21** — S0.2 accepted on execution-verified review: validate.py green with the two new cases (run by reviewer); worked example 5/5 tests pass and runs 10-in→10-out; completion base fails (5 tests, 19 gap markers) and goes 7/7 when gaps are filled from the worked example; golden set = 15 per-criterion-graded submissions with a realistic failure mix; protected files timestamp-verified untouched.
- **2026-08-21** — Offline determinism convention: examples and completion problems run against a deterministic fake model (no API keys, no network); real provider-call patterns live in comments. All code-bearing practice content ships this way.
- **2026-08-21** — Golden submissions are calibration data, not runnable repos: they reference the future sandbox LLM proxy (S1.5) and student-variant corpus, which the grading runner substitutes at grading time.
- **2026-08-21** — Submission layout contract (extract_claims.py / claims_messy.jsonl / tests/test_build.py / CLI flags) is declared in each checks file's header; the grading runner (S0.3+) enforces it and the unit page (S2.3) communicates it.
- **2026-08-21** — platform/ is created at S0.3 as platform/cli (Python grading CLI); the Next.js learner app lands in platform/app at S2.3 (amends the earlier "platform created at Stage 1" layout note).
- **2026-08-21** — Deployment topology: learner app (platform/app) deploys to Vercel; grading core (FastAPI + Docker sandbox runner + LLM proxy) deploys to a separate container/VM host — provider chosen at S1.4. Docker Desktop is a local dev requirement for the grading loop, not a deployment constraint.
- **2026-08-21** — S0.3 accepted on execution-verified review: fixture FAIL names the failing nodeid; completion base FAILs naming the 5 gap tests; filled copy 3/3 PASS; Docker 29.7.2 + keel-runner:0.1 (python:3.12-slim, pydantic 2.13.4 / pytest 9.1.1) verified; protected files timestamp-verified untouched.
- **2026-08-21** — Content bug found by the worker, fixed by the reviewing session: no-gap-markers-remain now scopes its grep to the two student-edited files (schemas.py, extractor.py) because test_extractor.py references GAP anchors by design. Rule: checks assert only on files the student controls; every check must pass on a known-good solution and fail on the unfilled base.
- **2026-08-21** — Checks format supports three expect forms: exit_zero | exit_nonzero | {output_contains}. CLI architecture: thin host CLI (PyYAML only) orchestrating one Docker container per check (--network none, 512m, 1 cpu, read-only /work, rw scratch, 120s wall-clock kill); graded code runs only inside the runner image.
- **2026-08-21** — Secrets convention: API keys live in ~/.keelacademy.env (chmod 600), explicitly sourced per non-interactive shell (`set -a; source ~/.keelacademy.env; set +a`). ~/.bashrc is never relied on (non-interactive shells skip it; Ubuntu's .bashrc guard returns early when sourced non-interactively). Verified live: OpenAI key present (len 164), /v1/models HTTP 200. Keys are never committed or written inside the repo.
- **2026-08-21** — S0.4 accepted on execution-verified review: worker's three verdicts and the reviewer's independent judge runs both produced s01 pass / s07 fail / s12 fail (s12 failing exactly on criterion 1, the JSON-mode letter case); all verdicts schema-valid; evidence quotes grep-verified (absence-of-code evidence for s07 verified by direct source read). Key-leak sweep clean.
- **2026-08-21** — Judge architecture: overall recomputed in the CLI (model arithmetic never trusted; disagreement or divergent criterion ids → hard error exit 2); one retry on malformed JSON; grade.yaml and claims_messy.jsonl excluded from judge input (answers must never reach the model); stdlib urllib, no openai-package dependency. Model tiers: low → gpt-4o-mini, mid → gpt-4.1, high → o3; observed judge cost ≈$0.006/call (gpt-4.1, ~1.5–1.9k prompt tokens).
- **2026-08-21** — S0.5 accepted on execution-verified review: defend CLI produces 2–3 submission-specific questions with mandatory anchors; anchor verification enforced CLI-side (missing anchor → one nudge retry naming the missing anchors → hard error exit 2); shared infra extracted to grader/llm.py (tiers, urllib call, JSON retry, trace, env-only key) and grader/submission.py (grade.yaml/claims_messy.jsonl exclusion); judge.py refactored onto the shared infra with behavior unchanged (regression run PASS exit 0). Defend cost ≈$0.005/call. One judge call hit a transient 120s read timeout; the retry succeeded — if timeouts recur during the 15-call S0.6 run, bump API_TIMEOUT_S in llm.py.
- **2026-08-21** — Defend question quality note: at temperature 0 the model still varies between runs, and overlapping questions across submissions are legitimate when both submissions share the same line (e.g. `extra="forbid"`). Non-genericity is judged on whether each submission's DISTINCTIVE design choice is targeted, not on zero overlap.
- **2026-08-21** — S0.6 accepted on execution-verified review: reviewer's independent full-15 calibration run reproduced the worker's table exactly (same sole overall miss: s13-nineteen-fixture; identical criterion-level diffs), exit 0; the transient-retry path fired live (DNS blip on s01 → retry → success), validating the OSError-wrap fix. Borderline semantics ratified: `expected: borderline` counts as a match when the judge lands on the same side as the resolved binary `overall` in the same grade.yaml. llm.py timeout 120→180s ratified.
- **2026-08-21** — Golden-set spot-check completed by the reviewing session (clears the open question): all 15 grade.yaml verdicts verified against code and rubric wording, with TWO reference bugs corrected — s09-hardcoded conservation-tested pass→fail (its only "evidence" is `print(len(run(recs)))`; the rubric says "checked, not assumed" and "tests that assert nothing do not count") and s10-overengineered failures-logged pass→fail (its log line carries the claim id but no validation reason; the rubric requires both). Criterion agreement against the corrected reference: 72/75 = 96.0%. The three remaining criterion diffs (s08 failures-logged, s09 pydantic-boundary, s13 conservation) are all in the same direction — judge too lenient — and are the S0.7 blind-spot fix package.
- **2026-08-21** — Three judge blind spots logged for the S0.7 fix package (judge-prompt/rubric-text edits): (1) conservation-tested accepts generic `len(out) == len(RECS)` even when the fixture holds 19 records — must require evidence of the named 20-record bar; (2) pydantic-validation-boundary credits direct ClaimExtraction(...) construction from hand-derived values (s09) — must require model_validate over actual model output; (3) failures-logged is ambiguous on skip/drop paths — clarify it applies to fallback events: no fallback constructed → the criterion fails regardless of any skip-log (s08). Note: the two borderline references where the judge was RIGHT were already corrected in the grade.yaml files during the spot-check (s09, s10).
- **2026-08-22** — S0.7 accepted on execution-verified review; STAGE 0 COMPLETE. Reviewer re-ran the full calibration (15/15 overall, 75/75 criterion) and independently judged all 5 adversarial submissions: a1 injection, a2 parrot, a4 test-gaming, a5 dead-code all FAILed at L2 (judge ignored the prose addressed to it and graded the code); a3 verbatim copy PASSed L2 (correct — copies are invisible at this layer) and was caught by L3: grader.defend produced 3 valid anchored questions. Judge variance note: at temperature 0 the per-criterion failure SET can vary between runs (reviewer's a2 run failed 3 criteria on different grounds than the worker's) while the overall verdict stayed stable — the S1.6 regression gate should gate primarily on OVERALL agreement, with criterion agreement as a secondary signal.
- **2026-08-22** — Repo hygiene: the workspace is a git repo (two "initial commit" snapshots authored by the founder at 03:13/03:33 on 2026-08-21). A later restore from those snapshots re-materialized the reviewer's deleted temp scripts; they were deleted again and a .gitignore was added (temp .review-*/.verify-*/.check-*/.diag-* scripts, __pycache__, .env patterns). Next commit should be made by the founder; nothing in git history contains secrets (leak sweeps clean).
- **2026-08-22** — S1.1 accepted on execution-verified review: platform/grading created with schema/0001_init.sql (5 tables; verdicts UNIQUE(submission_id) = exactly-once seed; submissions UNIQUE(student_id, unit_id, commit_sha) = idempotent intake seed; events spine has no FKs by design with seq bigserial UNIQUE as total order; verdicts ON DELETE RESTRICT for audit-grade history), scripts/smoke-schema.sh + smoke.sql (6 checks incl. RESTRICT proof). Ratified deviations: docker CLI fallback to Docker Desktop's Windows binary when the WSL distro lacks /var/run/docker.sock; readiness probe uses a real `select 1` instead of pg_isready (pg_isready reports ready during postgres's temporary init server — observed live); random host port via stdlib socket. AGENTS.md repo layout updated (platform/grading).
- **2026-08-22** — S1.2 accepted on execution-verified review: 0002_intake.sql (pusher_email column), intake/server.py (stdlib ThreadingHTTPServer; HMAC-SHA256 over raw body with compare_digest before JSON parse; KEEL_WEBHOOK_SECRET env-only, refuses to start if unset; DB access via shlex-split KEEL_DB_CMD psql-compatible command; one psql session per request wrapped BEGIN/COMMIT = one transaction; idempotency via INSERT ... ON CONFLICT DO NOTHING CTE with event gated on new-insert; unit id parsed from repo name keel-<unit-id>-<anything> and shape-validated; unknown pusher → 200 + intake.unknown_pusher event, no submission). Ratified: checks split into smoke-intake-checks.py; psql needs -q to suppress command tags in -tA mode (worker hit and fixed live); server log to mktemp outside repo. Deferred hardening for pilot (logged, not blocking): guard Content-Length int parse; add a 5MB request-body cap. Note: platform/cli/calibrate-after-s07.json is the worker's S0.7 final-run evidence artifact (15/15 + 75/75), legitimate, kept alongside calibrate-report.json.

## Blockers / open questions

- Golden-set grades are AI-authored though labeled `graded_by: human` — RESOLVED 2026-08-21: the reviewing session spot-checked all 15 grade.yaml files against code and rubric wording during S0.6 acceptance and corrected one bug (s09 conservation)
- Sandbox hosting choice (own VM vs microVM service) — decide at S1.4, not before
- Pilot cohort (20–30 students) recruitment source — needed before Stage 4 exit
- Schema v1.1 candidate: make verify.deterministic_checks / practice.completion_problem conditional or optional for non-code units (e.g., 0.1, 2.1.1) — decide when the first non-code unit is authored (C1)
