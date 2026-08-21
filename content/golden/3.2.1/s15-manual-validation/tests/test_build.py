import json, logging
from unittest.mock import patch
from extract_claims import extract, ClaimExtraction
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_twenty_in_twenty_out():
    out = [extract(r) for r in RECS]
    assert len(RECS) == 20 and len(out) == 20
def test_bad_input_yields_flagged_object_not_exception():
    with patch("extract_claims.call", return_value='{"claim_type": "fire", "severity": "extreme"}'):
        o = extract(RECS[0])
    assert o.extraction_failed
def test_every_fallback_is_logged(caplog):
    with patch("extract_claims.call", return_value='{"claim_type": "fire", "severity": "extreme"}'), \
         caplog.at_level(logging.ERROR, logger="claims"):
        outs = [extract(r) for r in RECS]
    assert all(o.claim_id in caplog.text for o in outs if o.extraction_failed)
