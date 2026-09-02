# Golden set 3.2.1: PRIVATE CALIBRATION DATA

Never shown to students; rotated per the architecture doc (§3 anti-gaming).
15 pre-graded submissions: 5 clear pass (s01 to s05), 5 clear fail (s06 to s10),
5 borderline (s11 to s15). Human grades in each `grade.yaml` are ground truth for
judge calibration (S0.6) and the adversarial pass (S0.7).

Submissions reference `LLM` / `proxy` / `TOOL` / `CLIENT` as the platform's
sandboxed LLM proxy (S1.5). In the grading sandbox these are injected mocks; the
layer-1 runner substitutes the student's variant corpus at `claims_messy.jsonl`.
