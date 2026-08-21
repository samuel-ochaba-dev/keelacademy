import logging, sys
from pydantic import BaseModel, ValidationError, Field

log = logging.getLogger("extract")

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    extraction_failed: bool = False
    failure_reason: str | None = None

SCHEMA = ClaimExtraction.model_json_schema()
PROXY = None  # injected by sandbox

def _call(note):
    resp = PROXY.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_schema",
                          "json_schema": {"name": "claim", "strict": True, "schema": SCHEMA}},
        messages=[{"role": "user", "content": f"Extract: {note}"}])
    return resp.choices[0].message.content

def extract_one(rec):
    raw = _call(rec["notes"])
    try:
        ext = ClaimExtraction.model_validate_json(raw)
        ext = ext.model_copy(update={"claim_id": rec["claim_id"]})
        return ext
    except ValidationError as e:
        reason = "; ".join(f"{x['loc']}: {x['msg']}" for x in e.errors())
        log.error("FALLBACK claim_id=%s reason=%r", rec["claim_id"], reason)
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other",
                               severity="low", extraction_failed=True, failure_reason=reason)

def main(data, out, logf):
    logging.basicConfig(filename=logf, level=logging.ERROR)
    recs = [__import__("json").loads(l) for l in open(data)]
    res = [extract_one(r) for r in recs]
    with open(out, "w") as f:
        for r in res: f.write(r.model_dump_json() + "\n")
    print(len(recs), "->", len(res))
