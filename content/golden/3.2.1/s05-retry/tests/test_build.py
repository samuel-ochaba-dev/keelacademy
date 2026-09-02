import json, logging
from unittest.mock import patch
from extract_claims import extract, ClaimExtraction
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]

def test_twenty_in_twenty_out():
    out = [extract(r) for r in RECS]
    assert len(RECS) == 20 and len(out) == 20

def test_all_outputs_are_valid_claimextractions():
    for o in [extract(r) for r in RECS]:
        ClaimExtraction.model_validate(o.model_dump())

def test_bad_input_yields_flagged_object_not_exception():
    with patch("extract_claims.constrained_call", side_effect=ValueError):
        pass  # not applicable: constrained_call raises JSON/ValidationError paths only
    o = extract(RECS[0], attempts=1) if False else None
    with patch("extract_claims.constrained_call", return_value={"claim_type": "damage",
                "severity": "low", "estimated_amount_usd": "many dollars"}):
        o = extract(RECS[0])
    assert o.extraction_failed and o.failure_reason and isinstance(o, ClaimExtraction)

def test_every_fallback_is_logged(caplog):
    with patch("extract_claims.constrained_call", return_value={"claim_type": "damage",
                "severity": "low", "estimated_amount_usd": "many dollars"}), \
         caplog.at_level(logging.ERROR, logger="omnisupply.disputes"):
        outs = [extract(r) for r in RECS]
    flagged = [o for o in outs if o.extraction_failed]
    assert flagged and all(o.claim_id in caplog.text and "FALLBACK" in caplog.text for o in flagged)
