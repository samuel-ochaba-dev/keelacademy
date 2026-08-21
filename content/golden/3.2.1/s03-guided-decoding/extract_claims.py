"""vLLM-served open-weight model with guided_json — same contract, self-hosted."""
import json, logging
from pydantic import BaseModel, ValidationError

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.StreamHandler()])
log = logging.getLogger("guided")

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

def call_llm(note: str) -> str:
    r = CLIENT.post("/v1/chat/completions", json={
        "model": CFG["model"],
        "messages": [{"role": "user", "content": PROMPT + note}],
        "guided_json": ClaimExtraction.model_json_schema(),   # server-side constrained decoding
    })
    return r.json()["choices"][0]["message"]["content"]

def extract(rec):
    try:
        obj = json.loads(call_llm(rec["notes"]))
        obj["claim_id"] = rec["claim_id"]
        return ClaimExtraction.model_validate(obj)
    except ValidationError as err:
        why = str(err)[:300]
        log.error("FALLBACK claim_id=%s reason='%s'", rec["claim_id"], why)
        return ClaimExtraction(claim_id=rec["claim_id"], claim_type="other", severity="low",
                               extraction_failed=True, failure_reason=why)

def run_all(path):
    recs = [json.loads(l) for l in open(path)]
    return [extract(r) for r in recs]   # one output per input, always
