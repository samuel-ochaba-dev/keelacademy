import json, logging
from extract_claims import run, ClaimExtraction

def _records():
    return [json.loads(l) for l in open("claims_messy.jsonl")]

def test_twenty_in_twenty_out():
    records = _records(); assert len(records) == 20
    results = run(records)
    assert len(results) == 20
    assert all(isinstance(r, ClaimExtraction) for r in results)

def test_all_outputs_are_valid_claimextractions():
    for r in run(_records()):
        ClaimExtraction.model_validate(r.model_dump())

def test_bad_input_yields_flagged_object_not_exception():
    results = run(_records())
    flagged = [r for r in results if r.extraction_failed]
    assert all(r.failure_reason for r in flagged)

def test_every_fallback_is_logged(caplog):
    with caplog.at_level(logging.ERROR, logger="claims.extraction"):
        results = run(_records())
    for r in [x for x in results if x.extraction_failed]:
        assert r.claim_id in caplog.text and r.failure_reason[:40] in caplog.text
