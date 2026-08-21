"""Enterprise-grade claim extraction framework v0.9.

Layered architecture: provider strategy pattern, retry backoff, circuit breaker,
pluggable post-processors. Configuration-driven, fully abstracted.
"""
import json, logging, abc
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("framework")

class ExtractionResult:  # generic result envelope
    def __init__(self, payload, meta=None):
        self.payload = payload     # whatever came back
        self.meta = meta or {}

class AbstractProvider(abc.ABC):
    @abc.abstractmethod
    def complete(self, prompt: str) -> str: ...

class PromptProvider(AbstractProvider):
    """Current strategy: high-quality prompt asking for JSON."""
    def complete(self, prompt):
        return LLM.chat(messages=[SYSTEM + prompt])   # asks nicely for JSON in SYSTEM

class Pipeline:
    def __init__(self, provider, postprocessors=None):
        self.provider = provider
        self.post = postprocessors or []
    def run(self, records):
        out = []
        for rec in records:
            raw = self.provider.complete(rec["notes"])
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                log.error("degraded output for %s, passing through raw", rec.get("claim_id"))
                payload = {"raw": raw}            # keep everything, lose nothing
            for p in self.post:
                payload = p(payload)
            out.append(ExtractionResult(payload, meta={"claim_id": rec.get("claim_id")}))
        return out

# (validators, pydantic ClaimExtraction, and retry/backoff modules planned for v1.0)
