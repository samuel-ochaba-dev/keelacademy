import json, re, sys
from pydantic import BaseModel

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str
    severity: str
    estimated_amount_usd: float | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

PROMPT = """You are a claims analyst. Read the claim and summarize it.
Mention claim type, severity and estimated amount. Be concise."""

def ask(note):
    return LLM.chat(messages=[PROMPT, note])          # plain text completion

def extract(rec):
    text = ask(rec["notes"])
    m_type = re.search(r"(damage|shortage|late_delivery|overbilling)", text.lower())
    m_amt = re.search(r"\$?\s*([\d,]+(?:\.\d{2})?)", text)
    return {"claim_id": rec["claim_id"],
            "claim_type": m_type.group(1) if m_type else "other",
            "severity": "medium",
            "estimated_amount_usd": float(m_amt.group(1).replace(",", "")) if m_amt else None}

def run(records):
    return [extract(r) for r in records]
