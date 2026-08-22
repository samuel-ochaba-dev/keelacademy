import json
from extract_claims import run

def test_conservation():
    records = [json.loads(l) for l in open("claims_messy.jsonl")]
    assert len(run(records)) == len(records)
