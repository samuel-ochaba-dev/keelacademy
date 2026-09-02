import json
from extract_claims import extract, ClaimExtraction
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_twenty_in_twenty_out():
    out = [extract(r) for r in RECS]
    assert len(RECS) == 20 and len(out) == 20
    assert all(type(o) is ClaimExtraction for o in out)
def test_all_outputs_are_valid_claimextractions():
    [ClaimExtraction.model_validate(extract(r).model_dump()) for r in RECS]
def test_bad_input_yields_flagged_object_not_exception(monkeypatch):
    import extract_claims as ec
    monkeypatch.setattr(ec, "get", lambda n: {"claim_type": "damage", "severity": 9})
    o = extract(RECS[0])
    assert o.extraction_failed
def test_every_fallback_is_logged(caplog, monkeypatch):
    import logging, extract_claims as ec
    monkeypatch.setattr(ec, "get", lambda n: {"claim_type": "damage", "severity": 9})
    with caplog.at_level(logging.ERROR, logger="mm"):
        outs = [extract(r) for r in RECS]
    assert all(o.claim_id in caplog.text for o in outs if o.extraction_failed)
