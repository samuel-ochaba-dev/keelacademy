"""Claim extractor v3: schema-constrained output, Pydantic-validated, graceful fallback."""
import json, logging, sys
from pydantic import BaseModel, ConfigDict, ValidationError, Field

logger = logging.getLogger("claims.extraction")

class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim_id: str = Field(min_length=1)
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    incident_date: str | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

CLAIM_JSON_SCHEMA = ClaimExtraction.model_json_schema()

def call_model(note: str, claim_id: str) -> str:
    # Platform proxy mock (offline sandbox); real call:
    response = proxy.chat.completions.create(
        model=CONFIG.model,                       # one-line model switch (2.4.2)
        response_format={"type": "json_schema",
                         "json_schema": {"name": "claim_extraction",
                                         "strict": True,
                                         "schema": CLAIM_JSON_SCHEMA}},
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
                  {"role": "user", "content": note}],
    )
    return response.choices[0].message.content

def extract(record: dict) -> ClaimExtraction:
    raw = call_model(record["notes"], record["claim_id"])
    try:
        data = json.loads(raw)
        data["claim_id"] = record["claim_id"]
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        reason = str(exc)[:500]
        logger.error("FALLBACK claim_id=%s reason='%s'", record["claim_id"], reason)
        return ClaimExtraction(claim_id=record["claim_id"], claim_type="other",
                               severity="low", extraction_failed=True,
                               failure_reason=reason)

def run(records: list[dict]) -> list[ClaimExtraction]:
    return [extract(r) for r in records]

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    records = [json.loads(l) for l in open(sys.argv[1])]
    results = run(records)
    with open(sys.argv[2], "w") as f:
        for r in results:
            f.write(r.model_dump_json() + "\n")
    print(f"{len(records)} in -> {len(results)} out")
