import json, sys, logging
from pydantic import BaseModel, ValidationError
log = logging.getLogger("mm")
class ClaimExtraction(BaseModel):
    claim_id: str; claim_type: str; severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False; failure_reason: str | None = None
def get(note):
    return TOOL.call(model=M.config.model, tool_choice={"type":"tool","name":"emit"},
                     tools=[{"name":"emit","input_schema":ClaimExtraction.model_json_schema()}],
                     messages=[note]).tool_input
def extract(rec):
    try:
        return ClaimExtraction.model_validate({**get(rec["notes"]), "claim_id": rec["claim_id"]})
    except ValidationError as e:
        log.error("FALLBACK claim_id=%s reason=%s", rec["claim_id"], str(e)[:300])
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                               extraction_failed=True, failure_reason=str(e)[:300])
if __name__ == "__main__":
    rs = [json.loads(l) for l in open(sys.argv[1])]
    os = [extract(r) for r in rs]
    open(sys.argv[2],"w").write("\n".join(o.model_dump_json() for o in os))
    print(len(rs), len(os))
