import json
from extract_claims import extract, ClaimExtraction
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_twenty_in_twenty_out():
    out = [extract(r) for r in RECS]
    assert len(RECS) == 20 and len(out) == 20
    assert all(isinstance(o, ClaimExtraction) for o in out)
def test_bad_input_yields_flagged_object_not_exception(monkeypatch):
    import extract_claims as ec
    monkeypatch.setattr(ec, "call", lambda n: '{"claim_type": "fire", "severity": "x" * 99, "bogus": 1}')
    o = extract(RECS[0])
    assert o.extraction_failed and o.failure_reason
