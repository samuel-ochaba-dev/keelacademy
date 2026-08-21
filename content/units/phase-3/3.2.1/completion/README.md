# Completion problem — Invoice-notes extractor

This is the worked example with **six gaps**. It runs as shipped, but its checks
FAIL. Fill every `# GAP n` marker until `pytest test_extractor.py` is fully green.
No gap requires touching `llm.py` or `notes.py` (they are the fixed test harness).

Each gap, and the test that fails until it's filled:

| GAP | file | what to implement | failing test until done |
|---|---|---|---|
| 1 | `schemas.py` | constrain `invoice_type` to the four legal values | `test_invoice_type_enum_constrained` |
| 2 | `schemas.py` | reject extra keys at the boundary | `test_extra_keys_rejected` |
| 3 | `extractor.py` | strip markdown fences before parsing | `test_designed_failure_modes_are_caught` |
| 4 | `extractor.py` | parse + inject input id + validate | most tests |
| 5 | `extractor.py` | build the defined fallback object | `test_fallback_objects_are_schema_valid` + others |
| 6 | `extractor.py` | log every fallback with id + reason | `test_accountability_every_fallback_logged` |

Run:

```bash
pytest test_extractor.py        # red until all gaps filled
python extractor.py             # watch the pipeline get healthier gap by gap
```

Stuck? The worked example (../worked-example/) solves the identical task — but try
each gap from the lesson (units/phase-3/3.2.1/learn.md) first; that's where the
transfer happens.
