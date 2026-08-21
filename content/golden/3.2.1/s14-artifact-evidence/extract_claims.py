import json, logging, sys
from pydantic import BaseModel, ConfigDict, Field, ValidationError
logging.basicConfig(level=logging.ERROR, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("claims")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    extraction_failed: bool = False
    failure_reason: str | None = None

def call(note):
    resp = LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                    mode="strict")
    return resp

def extract(rec):
    try:
        data = json.loads(call(rec["notes"]))
        data["claim_id"] = rec["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as e:
        reason = str(e)[:300]
        log.error("FALLBACK claim_id=%s reason='%s'", rec["claim_id"], reason)
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                               extraction_failed=True, failure_reason=reason)

if __name__ == "__main__":
    recs = [json.loads(l) for l in open("claims_messy.jsonl")]
    outs = [extract(r) for r in recs]
    with open("out.jsonl", "w") as f:
        for o in outs: f.write(o.model_dump_json() + "\n")
    print(f"{len(recs)} in -> {len(outs)} out")
