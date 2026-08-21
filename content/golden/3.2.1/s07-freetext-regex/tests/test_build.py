import json
from extract_claims import run
RECS = [json.loads(l) for l in open("claims_messy.jsonl")]
def test_twenty_in_twenty_out():
    assert len(run(RECS)) == 20
