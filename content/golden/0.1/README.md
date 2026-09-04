# Golden Benchmark Set: Unit 0.1 (Meet the client: OmniSupply Operations)

This directory contains pre-graded golden calibration submissions for Unit 0.1 Layer-2 qualitative evaluation.

## Rubric Reference
- Rubric: `content/rubrics/0.1/v1.yaml`
- Judge Prompt: `content/prompts/judge-0.1.md`
- Pass Rule: `all` (all 4 criteria must pass)

## Evaluation Criteria
1. `zero-jargon`: Zero occurrences of AI/LLM/agent/ML buzzwords.
2. `root-cause-scale`: 2-3 sentences referencing ~4k/mo volume, multi-artifact friction, and business impact (cycle time + financial leakage).
3. `stakeholder-trilemma`: Distinct, quantified KPIs for Operations (throughput/speed), Compliance (audit provenance/SLA clauses), and CFO (leakage prevention/cost).
4. `hitl-thresholds`: At least 3 concrete, quantitative boundary rules halting automation for human review.

## Benchmark Matrix

| Submission | Expected | Overall | zero-jargon | root-cause-scale | stakeholder-trilemma | hitl-thresholds | Primary Calibration Objective |
|---|---|---|---|---|---|---|---|
| `s01-textbook-pass` | pass | pass | pass | pass | pass | pass | Textbook reference pass demonstrating full adherence |
| `s02-jargon-fail` | fail | fail | **fail** | pass | pass | pass | Strict anti-jargon enforcement against AI/LLM buzzwords |
| `s03-vague-problem` | fail | fail | pass | **fail** | pass | pass | Catching vague problem statements lacking scale or artifact friction |
| `s04-missing-compliance` | fail | fail | pass | pass | **fail** | pass | Catching unquantified or missing compliance SLA/provenance KPIs |
| `s05-no-hitl` | fail | fail | pass | pass | pass | **fail** | Catching subjective, non-quantitative human review rules |
| `s06-minimal-pass` | borderline | pass | pass | pass | pass | pass | Calibrating minimum acceptable thresholds (2 sentences, 3 basic KPIs, 3 basic HITL rules) |
