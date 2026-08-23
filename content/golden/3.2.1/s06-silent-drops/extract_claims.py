import json, sys
from pydantic import BaseModel, ValidationError

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

def call(note):
    resp = LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                    mode="strict")
    return json.loads(resp)

def extract(rec):
    try:
        data = call(rec["notes"])
        data["claim_id"] = rec["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError):
        return None   # skip bad ones, keep the pipeline moving

def run(records):
    results = []
    for r in records:
        out = extract(r)
        if out is not None:      # only keep the good ones
            results.append(out)
    return results

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--data"); p.add_argument("--out"); p.add_argument("--log")
    p.add_argument("in_", nargs="?")
    a = p.parse_args()
    recs = [json.loads(l) for l in open(a.data or a.in_)]
    print(f"{len(recs)} in -> {len(run(recs))} good extractions")
