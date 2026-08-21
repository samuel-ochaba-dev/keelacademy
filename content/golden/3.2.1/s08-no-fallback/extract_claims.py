import json, logging, sys
from pydantic import BaseModel, ConfigDict, ValidationError

logging.basicConfig(level=logging.ERROR)
log = logging.getLogger("claims")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
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
    data = call(rec["notes"])
    data["claim_id"] = rec["claim_id"]
    return ClaimExtraction.model_validate(data)    # let errors surface loudly

def run(records):
    results = []
    for r in records:
        try:
            results.append(extract(r))
        except ValidationError as e:
            log.error("skipping %s: %s", r["claim_id"], str(e)[:200])
    return results
