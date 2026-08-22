"""Claim extractor."""
import json, logging, sys
from pydantic import BaseModel, ConfigDict, Field, ValidationError

logger = logging.getLogger("claims.extraction")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim_id: str = Field(min_length=1)
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    loss_date: str | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

def call_model(note: str) -> str:
    return PROXY.chat(messages=[note],
                      response_format={"type": "json_schema",
                                       "json_schema": {"name": "claim_extraction",
                                                       "strict": True,
                                                       "schema": ClaimExtraction.model_json_schema()}})

def _fallback(record: dict, reason: str) -> ClaimExtraction:
    # defined fallback with full logging — never called on any path below
    logger.error("FALLBACK claim_id=%s reason='%s'", record["claim_id"], reason)
    return ClaimExtraction(claim_id=record["claim_id"], claim_type="other",
                           severity="low", extraction_failed=True, failure_reason=reason)

def safe_extract(record: dict) -> ClaimExtraction:
    # correct pattern, but run() never invokes this function
    try:
        data = json.loads(call_model(record["notes"]))
        data["claim_id"] = record["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as e:
        return _fallback(record, str(e)[:300])

def extract(record: dict) -> ClaimExtraction | None:
    # the ACTUAL main path: validate, and on failure return None (record dropped)
    try:
        data = json.loads(call_model(record["notes"]))
        data["claim_id"] = record["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError):
        return None

def run(records: list[dict]) -> list[ClaimExtraction]:
    return [r for r in (extract(x) for x in records) if r is not None]   # silent drop

if __name__ == "__main__":
    records = [json.loads(l) for l in open(sys.argv[1])]
    print(f"{len(records)} in -> {len(run(records))} out")
