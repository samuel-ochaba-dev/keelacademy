"""Extract with one retry on validation failure, then a logged fallback."""
import json, logging
from pydantic import BaseModel, ConfigDict, Field, ValidationError
logger = logging.getLogger("omnisupply.disputes")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    extraction_failed: bool = False
    failure_reason: str | None = None

def constrained_call(note: str) -> dict:
    res = LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                   mode="strict")          # provider-side constrained decoding
    return json.loads(res)

def extract(rec, attempts=2):
    reasons = []
    for attempt in range(attempts):
        try:
            data = constrained_call(rec["notes"])
            data["claim_id"] = rec["claim_id"]
            return ClaimExtraction.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as exc:
            reasons.append(str(exc)[:200])
            logger.warning("RETRY claim_id=%s attempt=%d", rec["claim_id"], attempt + 1)
    reason = " | ".join(reasons)
    logger.error("FALLBACK claim_id=%s reason='%s'", rec["claim_id"], reason)
    return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                           extraction_failed=True, failure_reason=reason)
