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

SCHEMA_IN_PROMPT = "Return JSON with keys: claim_id, claim_type, severity, estimated_amount_usd."

def call(note):
    resp = LLM.chat(messages=[SCHEMA_IN_PROMPT, note],
                    response_format={"type": "json_object"})   # JSON mode: syntax only
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
