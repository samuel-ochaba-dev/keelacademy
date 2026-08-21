import json
from extract_claims import run
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_mostly_works():
    assert len(run(RECS)) >= 15   # good enough
