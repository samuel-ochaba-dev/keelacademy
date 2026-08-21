import json, logging
from unittest.mock import patch
from extract_claims import extract, ClaimExtraction

RECS = [json.loads(l) for l in open("claims_messy.jsonl")]

def _mock(raw):
    def fake(note): return raw
    return patch("extract_claims.call_llm", fake)

def test_twenty_in_twenty_out():
    with _mock('{"claim_type":"fire","severity":"low"}'):
        out = [extract(r) for r in RECS]
    assert len(RECS) == 20 and len(out) == 20

def test_all_outputs_are_valid_claimextractions():
    with _mock('{"claim_type":"fire","severity":"low","estimated_amount_usd":"lots"}'):
        out = [extract(r) for r in RECS]
    assert all(ClaimExtraction.model_validate(o.model_dump()) for o in out)

def test_bad_input_yields_flagged_object_not_exception():
    with _mock('{"claim_type":"fire","severity":"low","estimated_amount_usd":"lots"}'):
        o = extract(RECS[0])
    assert o.extraction_failed and o.failure_reason

def test_every_fallback_is_logged(caplog):
    with _mock('{"claim_type":"fire","severity":"low","estimated_amount_usd":"lots"}'), \
         caplog.at_level(logging.ERROR, logger="guided"):
        outs = [extract(r) for r in RECS]
    flagged = [o for o in outs if o.extraction_failed]
    assert flagged and all(o.claim_id in caplog.text and o.failure_reason[:30] in caplog.text for o in flagged)
