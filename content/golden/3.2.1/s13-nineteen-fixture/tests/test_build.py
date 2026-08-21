import json, logging
from extract_claims import extract, ClaimExtraction
# NOTE: fixture had one corrupted line; deleted it so tests would run
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_n_in_n_out():
    out = [extract(r) for r in RECS]
    assert len(out) == len(RECS)          # conservation: N in, N out
def test_bad_input_yields_flagged_object_not_exception(monkeypatch):
    import extract_claims as ec
    monkeypatch.setattr(ec, "call", lambda n: '{"claim_type": "fire", "amount": "x"}')
    o = extract(RECS[0]); assert o.extraction_failed
def test_every_fallback_is_logged(caplog, monkeypatch):
    import extract_claims as ec
    monkeypatch.setattr(ec, "call", lambda n: '{"claim_type": "fire", "amount": "x"}')
    with caplog.at_level(logging.ERROR, logger="claims"):
        outs = [extract(r) for r in RECS]
    assert all(o.claim_id in caplog.text for o in outs if o.extraction_failed)
