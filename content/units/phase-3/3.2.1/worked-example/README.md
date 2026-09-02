# Worked example: invoice-notes extractor (parallel task)

This solves a task with the **same structure** as your Build, but in a different
domain (invoice notes at a logistics company instead of OmniSupply's dispute
notes), so reading it teaches you
the pattern without handing you the deliverable.

**The task:** Harbor Point Logistics receives free-text notes about vendor invoices.
Build an extractor that turns each note into a validated `InvoiceExtraction`, every
time, with a defined fallback when the model's output fails validation, and failures
logged, never dropped.

## Run it

```bash
pip install pydantic pytest
python extractor.py        # runs the pipeline over 10 messy notes, prints results + log
pytest test_extractor.py   # the conservation & accountability properties as tests
```

No API key needed: `llm.py` ships a deterministic fake model whose outputs include
every failure mode the unit teaches (prose preamble, markdown fences, wrong types,
ambiguous values). The real provider call is marked and shown in comments.

## Files

| file | role |
|---|---|
| `schemas.py` | The contract: `InvoiceExtraction` (Pydantic) + derived JSON Schema |
| `llm.py` | Provider adapter: fake model + the two real-call patterns in comments |
| `notes.py` | 10 messy invoice notes (the "corpus") |
| `extractor.py` | The pipeline: generate → validate → fallback + log; N in, N out |
| `test_extractor.py` | The properties that make the Prove-it bar checkable |

## Design decisions (each annotated in code with `# WHY:`)

1. **One schema, two uses.** The Pydantic model is the single source of truth; the
   JSON Schema sent to the provider is *derived* from it (`model_json_schema()`).
   Never hand-maintain both.
2. **Fallback is a value, not an exception.** Failed extraction produces a valid
   `InvoiceExtraction` with `extraction_failed=True` and a reason, so consumers never
   see `None`, crashes, or missing records.
3. **Conservation at the loop level.** The runner zips inputs to outputs; the *tests*
   assert 10 in → 10 out. N-in/N-out is a property you must test for, not assume.
4. **Accountability via logging.** Every fallback logs invoice id + validation
   reason. The test captures the log and asserts fallbacks and log lines pair up.
5. **Offline determinism.** The fake model makes the example runnable and testable
   without keys or network, the same property that makes YOUR build's tests
   reproducible. Swap the adapter's `call` for your 2.4.2 provider wrapper.
