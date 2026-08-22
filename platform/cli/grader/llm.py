"""Shared LLM-call infrastructure for the grading CLIs (judge, defend).

Key convention: OPENAI_API_KEY from the environment only (never hardcoded,
never on disk). Stdlib urllib only — no openai-package dependency.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request

API_URL = "https://api.openai.com/v1/chat/completions"
API_TIMEOUT_S = 180

# model_tier -> concrete OpenAI model + USD per 1M tokens (prompt / completion).
# Prices are approximate list prices at time of writing; used only for the
# stderr cost trace (seed of S1.7), not for billing.
MODEL_TIERS = {
    "low": {"model": "gpt-4o-mini", "price_in": 0.15, "price_out": 0.60},
    "mid": {"model": "gpt-4.1", "price_in": 2.00, "price_out": 8.00},
    "high": {"model": "o3", "price_in": 2.00, "price_out": 8.00},
}

NUDGE = (
    "Your previous reply was not valid JSON. Return ONLY a single JSON object "
    "conforming to the schema from the original prompt — no markdown fences, "
    "no commentary before or after."
)


class LLMError(Exception):
    pass


def call_model(model: str, messages: list[dict], api_key: str) -> tuple[str, dict]:
    payload = json.dumps({"model": model, "messages": messages, "temperature": 0}).encode()
    req = urllib.request.Request(
        API_URL, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    start = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=API_TIMEOUT_S) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        raise LLMError(f"API HTTP {exc.code}: {exc.read().decode(errors='replace')[:500]}") from exc
    except urllib.error.URLError as exc:
        raise LLMError(f"API unreachable: {exc}") from exc
    except OSError as exc:
        # Connection resets / read timeouts surface here (resp.read() raises
        # raw OSError subclasses, not URLError) — wrap so callers can retry.
        raise LLMError(f"API connection failed: {exc}") from exc
    latency = time.monotonic() - start
    usage = body.get("usage", {})
    text = body["choices"][0]["message"]["content"]
    return text, {
        "model": body.get("model", model),
        "prompt_tokens": usage.get("prompt_tokens", 0),
        "completion_tokens": usage.get("completion_tokens", 0),
        "latency_s": round(latency, 2),
    }


def call_with_json_retry(model: str, messages: list[dict], api_key: str) -> tuple[dict, dict]:
    """Call the model; on malformed JSON retry once with the nudge, then raise."""
    messages = list(messages)
    for attempt in (1, 2):
        text, meta = call_model(model, messages, api_key)
        try:
            return extract_json(text), meta
        except (ValueError, json.JSONDecodeError):
            if attempt == 2:
                raise LLMError(f"model returned malformed JSON twice; last reply:\n{text[:500]}")
            messages = messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": NUDGE},
            ]
    raise LLMError("unreachable")


def extract_json(text: str) -> dict:
    """Parse the model's reply, tolerating markdown code fences."""
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    candidate = m.group(1) if m else text
    start, end = candidate.find("{"), candidate.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in reply")
    return json.loads(candidate[start:end + 1])


def require_api_key() -> str:
    import os
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise LLMError("OPENAI_API_KEY not set in the environment")
    return api_key


def trace(meta: dict) -> None:
    served = meta["model"]
    tier_info = next(
        (v for v in MODEL_TIERS.values() if served == v["model"] or served.startswith(v["model"] + "-")),
        {"price_in": 0.0, "price_out": 0.0},
    )
    cost = (meta["prompt_tokens"] * tier_info["price_in"]
            + meta["completion_tokens"] * tier_info["price_out"]) / 1_000_000
    print(f"[trace] model={meta['model']} tokens_in={meta['prompt_tokens']} "
          f"tokens_out={meta['completion_tokens']} latency={meta['latency_s']}s "
          f"cost≈${cost:.5f}", file=sys.stderr)
