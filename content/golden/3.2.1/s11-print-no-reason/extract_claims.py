import json
from pydantic import BaseModel, ValidationError

class ClaimExtraction(BaseModel):
    claim_id: str; claim_type: str; severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False; failure_reason: str | None = None

def call(note):
    return LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                    mode="strict")

def extract(rec):
    try:
        data = json.loads(call(rec["notes"]))
        data["claim_id"] = rec["claim_id"]
        return ClaimExtraction.model_validate(data)
    except ValidationError as e:
        print(f"FALLBACK {rec['claim_id']}")        # TODO add reason
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                               extraction_failed=True, failure_reason=str(e)[:300])
