# AGENTS.md — keelacademy

How any session — human or AI — picks this project up without losing context.

## Read first, in order

1. **[build-state.md](build-state.md)** — where we are; the single next action; decisions log
2. **[build-plan.md](build-plan.md)** — how we're building (stages, architecture decisions)
3. **[school-architecture.md](school-architecture.md)** — what we're building (the full design)
4. **[curriculum.md](curriculum.md)** — the source curriculum (reference; do not edit without explicit instruction)

## Working rules

- **build-state.md is the source of truth for progress.** At the end of every work session: check off finished milestones, update Status, set exactly one "Next action," append decisions/blockers (dated).
- **Milestones are tiny by design** (hours, not weeks). If one can't finish in a sitting, split it and record the split in build-state.md.
- **Doc ownership:** design changes → `school-architecture.md`; build-approach changes → `build-plan.md`; progress → `build-state.md`. Log any design/approach change in the decisions log. Don't let the docs drift.
- **Content is data; platform is engine.** Lessons, rubrics, fixtures, personas live in the content repo (MDX + YAML, schema-validated). Never bake content into code.
- **Stage gates are real:** don't start a stage before the previous stage's exit criteria (build-plan.md §4) hold. In particular: prove the grading loop (Stage 0) before building UI.
- **Non-goals** are listed in build-plan.md §6. New feature ideas go to the backlog, not the plan.

## Repo layout

```
/curriculum.md            source curriculum (reference)
/school-architecture.md   the design (what + why)
/build-plan.md            the build approach (how)
/build-state.md           live progress (where we are)
/AGENTS.md                this file
/docs                     specs: lesson-flow-spec
/.agents/skills           repo skills: keel-copy (voice), keel-unit (lessons)
/platform                 the code: platform/cli (grading CLI, created at S0.3), platform/grading (grading-core service + Postgres schema, created at S1.1), platform/app (learner app, created at S2.3)
/content                  units, checks, rubrics, prompts, golden sets, faq, personas, curriculum map, gates (created at Stage 0)
/scratch                  throwaway trial drafts; never ships, never validated
```
