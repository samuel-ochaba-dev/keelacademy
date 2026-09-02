# Verification Architecture and Curriculum Execution Plan

## 1. The Four Verification Layers
1. **Layer 1 (Deterministic CI Checks):** Executes automated pytest suites and schema validators inside an isolated container. It catches syntax crashes, missing fields, and unhandled runtime exceptions.
2. **Layer 2 (Calibrated Rubric Judge):** Evaluates qualitative architecture against explicit rubric criteria with mandatory quote evidence. It catches ungrounded prompt shortcuts and missing fallback records.
3. **Layer 3 (Defend Your Work):** Interrogates students via dynamically generated questions based on submitted commit diffs. It prevents outsourcing and uncritical copy-pasting.
4. **Layer 4 (Recorded Walkthrough):** Requires unscripted video walkthroughs of integration deliverables to prove end-to-end operational mastery.

## 2. Precedence of Layer 1 Execution
Layer 1 deterministic checks must always run and pass before Layer 2 LLM evaluation begins. Evaluating qualitative prompt structure or architecture on code that crashes or fails schema validation wastes compute and leads to hallucinated judge feedback.

## 3. Parallel Business Track Pacing
Phase 11 runs alongside Phases 1 through 10 from week one. If business skills like discovery calls, scoping, and proposal pricing are postponed until after technical completion, graduates experience zero client pipeline. Pacing business development in parallel builds commercial momentum simultaneously with technical ability.
