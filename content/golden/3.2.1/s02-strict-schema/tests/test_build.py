from extract_claims import extract_one, ClaimExtraction

def test_twenty_in_twenty_out(records=load20()):
    out = [extract_one(r) for r in records]
    assert len(out) == 20 and all(isinstance(o, ClaimExtraction) for o in out)

def load20():
    import json; return [json.loads(l) for l in open("claims_messy.jsonl")]

def test_all_outputs_are_valid_claimextractions():
    for o in [extract_one(r) for r in load20()]:
        ClaimExtraction.model_validate(o.model_dump())

def test_bad_input_yields_flagged_object_not_exception(corrupt=load20()[5]):
    o = extract_one(corrupt)
    assert o.extraction_failed and o.failure_reason

def test_every_fallback_is_logged(caplog, records=load20()):
    import logging
    with caplog.at_level(logging.ERROR, logger="extract"):
        outs = [extract_one(r) for r in records]
    flagged = [o for o in outs if o.extraction_failed]
    assert flagged and all(o.claim_id in caplog.text for o in flagged)
