"""Claim extractor with conservation testing."""
import json, logging, sys
from pydantic import BaseModel, ConfigDict, Field, ValidationError

log = logging.getLogger("claims")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim_id: str = Field(min_length=1)
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    incident_date: str | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

def call_model(note: str) -> str:
    return LLM.chat(messages=[note],
                    response_format={"type": "json_schema",
                                     "json_schema": {"name": "claim_extraction",
                                                     "strict": True,
                                                     "schema": ClaimExtraction.model_json_schema()}})

def extract(record: dict) -> ClaimExtraction:
    try:
        data = json.loads(call_model(record["notes"]))
        data["claim_id"] = record["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as e:
        reason = str(e)[:300]
        log.error("FALLBACK claim_id=%s reason='%s'", record["claim_id"], reason)
        return ClaimExtraction(claim_id=record["claim_id"], claim_type="other",
                               severity="low", extraction_failed=True, failure_reason=reason)

def run(records: list[dict]) -> list[ClaimExtraction]:
    return [extract(r) for r in records]

if __name__ == "__main__":
    records = [json.loads(l) for l in open(sys.argv[1])]
    results = run(records)
    print(f"{len(records)} in -> {len(results)} out")
