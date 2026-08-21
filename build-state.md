# Build State — keelacademy platform

**Last updated:** 2026-08-21
**Stage:** 0 — Schema & walking skeleton
**Milestone in progress:** S0.4

> ## Resume protocol — read this first
> 1. Read this file, then skim build-plan.md §4 for the current stage's exit criteria.
> 2. Work the single **Next action** below. Nothing else.
> 3. At session end: check off finished milestones, update Status/Next action, append any decisions or blockers (dated). Milestones are tiny by design — if one can't finish in a sitting, split it and record the split here.

## Next action

Build the Layer-2 rubric-judge CLI (S0.4) — task prompt issued to the worker AI. Done when: verdict JSON validates against a new verdict schema and quotes submission text; proven on golden submissions s01 (expect pass), s07 (expect fail), s12 (expect fail — the JSON-mode borderline). Requires an LLM API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) in the worker environment.

---

## Stage 0 — Schema + walking skeleton (no UI)
*Exit: grading loop works end-to-end via CLI on real messy submissions; judge ≥90% agreement with human grades on golden set; adversarial submissions caught ≥4/5.*

- [x] S0.1 Four content schemas written as JSON Schema (unit, rubric, data-variant, persona) — accepted on review 2026-08-21; validator output confirms 4 valid + 1 expected-invalid
- [x] S0.2 Golden-path unit 3.2.1 authored in full: lesson (3 layers), worked example, completion problem + checks, retrieval seeds, rubric v1, 15 pre-graded golden submissions — accepted on execution-verified review 2026-08-21
- [x] S0.3 CLI: point at a repo → run its pytest in Docker → parse per-test results. *Done when: a fixture repo with one failing test prints which test failed* — accepted on execution-verified review 2026-08-21 (fixture names the failing nodeid; completion base fails naming the 5 gap tests; filled copy passes 3/3 after the no-gap-markers scoping fix; faq/3.2.1.md stub added)
- [ ] S0.4 CLI: rubric judge → structured verdict (pass/fail per criterion + quoted evidence). *Done when: verdict JSON validates against its schema and quotes submission text*
- [ ] S0.5 CLI: defend-your-work — generate 2–3 follow-up questions from a submission's actual code. *Done when: questions reference specifics of the submitted code, not generics*
- [ ] S0.6 Judge calibration: run judge over the 15 golden submissions, compare to human grades, record agreement %
- [ ] S0.7 Adversarial pass: 5 gamed submissions (AI-written, copied, rushed) — record how many the pipeline catches

## Stage 1 — Grading core service
*Exit: git push → verdict, zero human involvement; rubric change that degrades golden-set accuracy blocks merge.*

- [ ] S1.1 Postgres schema: events, submissions, verdicts, students, progress
- [ ] S1.2 GitHub OAuth + webhook intake (push → submission.created event)
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

## Blockers / open questions

- Golden-set grades are AI-authored though labeled `graded_by: human` — founder must spot-check all 15 grade.yaml files (especially the 5 borderline) before S0.6 calibration, or calibration measures judge-vs-itself consistency
- Sandbox hosting choice (own VM vs microVM service) — decide at S1.4, not before
- Pilot cohort (20–30 students) recruitment source — needed before Stage 4 exit
- Schema v1.1 candidate: make verify.deterministic_checks / practice.completion_problem conditional or optional for non-code units (e.g., 0.1, 2.1.1) — decide when the first non-code unit is authored (C1)
