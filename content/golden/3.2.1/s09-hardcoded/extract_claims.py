"""No LLM round-trip needed — claims follow a few patterns, so just branch."""
import json, sys
from pydantic import BaseModel

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

KEYWORDS = {"damaged": "damage", "broken": "damage", "short": "shortage",
            "missing": "shortage", "late": "late_delivery", "overbilled": "overbilling"}

def extract(rec):
    text = rec["notes"].lower()
    ctype = next((v for k, v in KEYWORDS.items() if k in text), "other")
    sev = "high" if "total loss" in text or "destroyed" in text else "medium"
    return ClaimExtraction(claim_id=rec["claim_id"], claim_type=ctype, severity=sev)

def run(records):
    return [extract(r) for r in records]

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--data"); p.add_argument("--out"); p.add_argument("--log")
    p.add_argument("in_", nargs="?")
    a = p.parse_args()
    recs = [json.loads(l) for l in open(a.data or a.in_)]
    print(len(run(recs)))
