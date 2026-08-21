import json, logging
from pydantic import BaseModel, ConfigDict, Field, ValidationError
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
    return LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                    mode="strict")

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
