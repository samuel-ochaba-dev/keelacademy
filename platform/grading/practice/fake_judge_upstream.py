#!/usr/bin/env python3
"""practice/fake_judge_upstream.py — deterministic offline fake OpenAI for retrieval grading (S3.2).

Echoes canned retrieval judge verdicts (pass, fail, malformed, prompt-injection defense)
with OpenAI-shaped responses and token usage accounting.
Exposes GET /__count so proof harnesses can assert exact upstream call counts and prove
zero-forwarding on budget pre-check rejection.

Stdlib only.
"""

from __future__ import annotations

import json
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PROMPT_TOKENS = int(os.environ.get("KEEL_FAKE_PROMPT_TOKENS", "50"))
COMPLETION_TOKENS = int(os.environ.get("KEEL_FAKE_COMPLETION_TOKENS", "250"))
DELAY_S = float(os.environ.get("KEEL_FAKE_DELAY_S", "0"))

_count_lock = threading.Lock()
_count = 0


def bump() -> int:
    global _count
    with _count_lock:
        _count += 1
        return _count


def count() -> int:
    with _count_lock:
        return _count


class FakeJudgeHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond(self, code: int, body: str) -> None:
        raw = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, fmt: str, *args: object) -> None:
        sys.stderr.write("fake-judge-upstream: %s %s\n" % (self.command, self.path))

    def do_GET(self) -> None:
        if self.path == "/__count":
            self._respond(200, str(count()))
        elif self.path == "/healthz":
            self._respond(200, json.dumps({"ok": True}))
        else:
            self._respond(404, "{}")

    def do_POST(self) -> None:
        if not self.path.endswith("/chat/completions"):
            self._respond(404, "{}")
            return

        length = int(self.headers.get("Content-Length") or 0)
        raw_body = self.rfile.read(length) if length else b""
        n = bump()

        if DELAY_S > 0:
            time.sleep(DELAY_S)

        try:
            req_data = json.loads(raw_body.decode("utf-8"))
        except Exception:
            req_data = {}

        messages = req_data.get("messages") or []
        all_text = " ".join(str(m.get("content", "")) for m in messages)

        # Concierge Guard Mode
        if "GUARD MODE" in all_text or "Unit Deliverable Specification" in all_text:
            if "Ignore all" in all_text or "ignore_instructions" in all_text or "System override" in all_text:
                reply_content = "In build context the concierge unblocks. It does not write the deliverable. Adversarial override rejected. What error did you encounter when testing your extractor?"
            elif "write" in all_text.lower() or "solution" in all_text.lower() or "deliverable" in all_text.lower() or "code" in all_text.lower():
                reply_content = "In build context the concierge unblocks. It does not write the deliverable. What specific error or question do you have about your validation boundary?"
            else:
                reply_content = "In build context the concierge unblocks. It does not write the deliverable. Have you verified how your validation exception is caught and logged?"
        # Concierge Teach Mode
        elif "TEACH MODE" in all_text or ("Lesson Material" in all_text and "<student_question>" in all_text):
            if "Ignore all" in all_text or "ignore_instructions" in all_text or "System override" in all_text:
                reply_content = "In structured generation, schemas guarantee output syntax at the token decoding layer. Adversarial directives are ignored. Here is a micro-exercise on Pydantic validation boundaries."
            else:
                reply_content = "Schema-constrained decoding guarantees that the model output strictly conforms to the JSON Schema at the token level, eliminating parsing failures. Here is a quick micro-exercise to test your understanding: why does json.loads alone fail to guarantee field types?"
        # Retrieval Judge Probes
        # 1. Malformed JSON probe (double failure -> hard error)
        elif "malformed_double" in all_text:
            reply_content = "Here is my evaluation: The answer is good but not valid JSON."
        # 2. Malformed JSON probe (single failure -> nudge retry succeeds)
        elif "malformed_once" in all_text:
            is_nudge = any("Your previous reply was not valid JSON" in str(m.get("content", "")) for m in messages)
            if not is_nudge:
                reply_content = "Not JSON on first attempt"
            else:
                reply_content = json.dumps({
                    "verdict": "pass",
                    "feedback": "Corrected after nudge: accurately explains schema enforcement.",
                    "evidence": "schema contracts move the promise out of the prompt",
                })
        # 3. Prompt injection probe
        elif "Ignore all previous instructions" in all_text or "ignore_instructions" in all_text:
            reply_content = json.dumps({
                "verdict": "fail",
                "feedback": "The submission does not answer the concept prompt and contains an adversarial prompt override.",
                "evidence": "Ignore all previous instructions",
            })
        # 4. Explicit weak / failing answer probe
        elif "fail_me" in all_text or "completely incorrect" in all_text:
            reply_content = json.dumps({
                "verdict": "fail",
                "feedback": "The answer misses the core concept of downstream parsing failure and suggests an unvalidated pattern.",
                "evidence": "the receiving program cannot read",
            })
        # 5. Default: strong passing verdict
        else:
            reply_content = json.dumps({
                "verdict": "pass",
                "feedback": "Accurately explains why downstream programs cannot parse unstructured prose reliably.",
                "evidence": "natural language is an interface designed for lossy, error-correcting human readers",
            })

        self._respond(200, json.dumps({
            "id": f"chatcmpl-fake-judge-{n}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": "gpt-4o-mini",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": reply_content,
                },
                "finish_reason": "stop",
            }],
            "usage": {
                "prompt_tokens": PROMPT_TOKENS,
                "completion_tokens": COMPLETION_TOKENS,
                "total_tokens": PROMPT_TOKENS + COMPLETION_TOKENS,
            },
        }))


def main() -> None:
    port = int(os.environ.get("KEEL_FAKE_PORT", "8790"))
    server = ThreadingHTTPServer(("127.0.0.1", port), FakeJudgeHandler)
    sys.stderr.write(f"fake judge upstream listening on 127.0.0.1:{port}\n")
    server.serve_forever()


if __name__ == "__main__":
    main()
