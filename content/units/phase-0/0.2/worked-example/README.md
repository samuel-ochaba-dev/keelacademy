# Unit 0.2 worked example: model verification synthesis and execution plan

This worked example demonstrates an annotated, reference-grade synthesis of the verification architecture and curriculum execution strategy.

---

## 1. Analysis of the four verification stages

Verification runs in four stages, each catching a failure class the one before it cannot:

1. **Automated checks.** Containerized pytest suites and contract checks. They catch syntax errors, invalid schemas, unhandled exceptions, and silent data loss. They run first because reviewing code that does not run tells you nothing.
2. **Rubric review.** An automated reviewer scores 3 to 5 concrete criteria and must quote the code that decided each verdict. It catches work that promises behaviour in comments, fallback objects that were never built, and tests that pass on hardcoded mocks.
3. **Defend your work.** Questions generated from your own commit diffs. This catches outsourced code, copied templates, and unread generated code, because you have to justify the parameters and the failure branches you shipped.
4. **Recorded walkthrough.** An unscripted video of the integration deliverable running. It shows end-to-end ownership and doubles as portfolio material.

*Why this passes:*
- Names the failure class each stage catches.
- Explains the ordering: automated checks before rubric review.
- Explains why staged verification is hard to game.

---

## 2. Rationale for the Parallel Business Track

Phase 11 runs alongside Phases 1 through 10 rather than as a post-technical capstone.
Engineering engagements require lead generation, discovery calls, scoping, and proposal pricing. If business training is delayed until technical graduation, learners stall due to lack of client pipeline. Parallel progression ensures technical skills are immediately matched with client communication competence.

*Why this passes:*
- Plain, direct explanation of the commercial necessity.
- Identifies the common failure mode of technical isolation.

---

## 3. Sample Execution Schedule

| Week Range | Technical Focus | Parallel Business Focus | Weekly Target Hours |
|---|---|---|---|
| Weeks 1-4 | Phase 0 & Phase 1 (Python, Git, Testing) | 11.1 Niche & Positioning | 14 hrs |
| Weeks 5-10 | Phase 2 & Phase 3 (LLM APIs, Structured Outputs) | 11.2 Case Study Drafting | 14 hrs |
| Weeks 11-18 | Phase 4 (RAG & Knowledge Grounding) | 11.4 Lead Qualification | 15 hrs |
| Weeks 19-28 | Phase 5 (Agent Tool Orchestration) | 11.5 Discovery & Scoping | 15 hrs |
