import json, logging
from pydantic import BaseModel
log = logging.getLogger("claims")

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

def call(note):
    return LLM.chat(messages=[note], response_schema=ClaimExtraction.model_json_schema(),
                    mode="strict")

def extract(rec):
    raw = call(rec["notes"])
    data = json.loads(raw)
    # validate by hand — don't trust pydantic magic
    errors = []
    if not isinstance(data.get("claim_type"), str):
        errors.append("claim_type missing")
    if data.get("severity") not in ("low", "medium", "high"):
        errors.append("bad severity")
    amt = data.get("estimated_amount_usd")
    if amt is not None and (not isinstance(amt, (int, float)) or amt < 0):
        errors.append("bad amount")
    if errors:
        reason = "; ".join(errors)
        log.error("FALLBACK claim_id=%s reason='%s'", rec["claim_id"], reason)
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                               extraction_failed=True, failure_reason=reason)
    return ClaimExtraction(claim_id=rec["claim_id"], claim_type=data["claim_type"],
                           severity=data["severity"],
                           estimated_amount_usd=amt)
