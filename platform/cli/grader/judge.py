"""Layer-2 rubric-judge CLI.

Usage:
    python -m grader.judge <submission_dir> --rubric content/rubrics/3.2.1.yaml [--json out.json]

Reads the submission as text (never executes it), injects the rubric verbatim and
the submission's files into the rubric's judge prompt, calls the LLM for the tier
named by the rubric, validates the response against verdict.schema.json, and
RECOMPUTES the overall verdict (a disagreement with the model's own overall is a
hard error — the model's arithmetic is never trusted).

LLM plumbing (tiers, urllib call, JSON-retry nudge, stderr trace) lives in
grader/llm.py; submission reading in grader/submission.py — shared with
grader/defend.py.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

from .llm import MODEL_TIERS, LLMError, call_with_json_retry, require_api_key, trace
from .submission import SubmissionError, gather_submission

SCHEMA_PATH = Path(__file__).with_name("verdict.schema.json")


class JudgeError(Exception):
    pass


def load_rubric(path: Path) -> dict:
    rubric = yaml.safe_load(path.read_text())
    for key in ("id", "version", "pass_rule", "judge", "criteria"):
        if key not in rubric:
            raise JudgeError(f"rubric {path} missing key {key!r}")
    return rubric


def build_prompt(rubric: dict, rubric_text: str, judge_prompt_text: str, submission_text: str) -> str:
    marker = re.compile(r"<!--\s*RUBRIC_INSERT[^>]*-->", re.IGNORECASE)
    if marker.search(judge_prompt_text):
        prompt = marker.sub(lambda _: rubric_text.strip(), judge_prompt_text)
    else:
        prompt = judge_prompt_text + "\n\n## Rubric (verbatim)\n\n" + rubric_text.strip()
    return prompt + "\n\n## Submission\n\n```\n" + submission_text + "\n```\n"


def judge(submission_dir: Path, rubric_path: Path) -> dict:
    api_key = require_api_key()

    rubric_text = rubric_path.read_text()
    rubric = load_rubric(rubric_path)

    content_root = rubric_path.parent.parent  # content/rubrics/x.yaml -> content/
    prompt_path = content_root / rubric["judge"]["prompt"]
    tier = rubric["judge"]["model_tier"]
    if tier not in MODEL_TIERS:
        raise JudgeError(f"unknown model_tier {tier!r} (have {sorted(MODEL_TIERS)})")
    model = MODEL_TIERS[tier]["model"]

    submission_text = gather_submission(submission_dir)
    prompt = build_prompt(rubric, rubric_text, prompt_path.read_text(), submission_text)

    try:
        parsed, meta = call_with_json_retry(model, [{"role": "user", "content": prompt}], api_key)
    except LLMError as exc:
        raise JudgeError(str(exc)) from exc

    criteria_out = parsed.get("criteria", [])
    model_overall = parsed.get("overall")
    verdict = {
        "rubric_id": rubric["id"],
        "rubric_version": rubric["version"],
        "submission_ref": submission_dir.resolve().as_posix(),
        "criteria": [
            {"id": c["id"], "verdict": c["verdict"], "evidence": c["evidence"]}
            for c in criteria_out
        ],
        "overall": "pass" if all(c["verdict"] == "pass" for c in criteria_out) else "fail",
        "meta": meta,
    }

    errors = sorted(Draft202012Validator(json.loads(SCHEMA_PATH.read_text())).iter_errors(verdict),
                    key=lambda e: e.json_path)
    if errors:
        raise JudgeError("verdict failed schema validation: " + "; ".join(
            f"{e.json_path}: {e.message}" for e in errors))

    expected_ids = {c["id"] for c in rubric["criteria"]}
    got_ids = {c["id"] for c in verdict["criteria"]}
    if got_ids != expected_ids:
        raise JudgeError(f"criterion ids diverge from rubric: missing {sorted(expected_ids - got_ids)}, "
                         f"unexpected {sorted(got_ids - expected_ids)}")

    if model_overall != verdict["overall"]:
        raise JudgeError(f"model's overall {model_overall!r} disagrees with recomputed "
                         f"{verdict['overall']!r}; verdict rejected")

    return verdict


def human_summary(verdict: dict) -> None:
    for c in verdict["criteria"]:
        print(f"[{c['verdict'].upper():4}] {c['id']}")
        print(f"       {c['evidence'][:120]}")
    print(f"\nOVERALL: {verdict['overall'].upper()}")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="grader.judge", description="keelacademy Layer-2 rubric-judge CLI")
    ap.add_argument("submission_dir", type=Path)
    ap.add_argument("--rubric", required=True, type=Path, help="rubric YAML (its judge.prompt is resolved relative to the content/ root)")
    ap.add_argument("--json", type=Path, help="write the verdict JSON here")
    args = ap.parse_args(argv)

    if not args.submission_dir.is_dir():
        print(f"error: submission dir not found: {args.submission_dir}", file=sys.stderr)
        return 2
    try:
        verdict = judge(args.submission_dir, args.rubric)
    except (JudgeError, SubmissionError, LLMError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    trace(verdict["meta"])
    human_summary(verdict)
    if args.json:
        args.json.write_text(json.dumps(verdict, indent=2))
        print(f"\nverdict JSON written to {args.json}")
    return 0 if verdict["overall"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
