#!/usr/bin/env python3
"""platform/grading/scripts/dryrun-unit-checks.py — S2.2 content-PR dry-run.

Runs a unit's deterministic Layer-1 checks against the reference solution so
a content change that breaks them fails loudly before merge (CI step 3 of
content-gate.yml; also runnable directly). The reference solution follows the
golden README's substitution contract, same as the S1.8 wiring harness: the
golden s01-textbook submission (reference extractor + tests) with the variant
corpus placed at claims_messy.jsonl (s14-artifact-evidence's 20-record
corpus). Offline by construction — Layer 1 only, no judge, no API key.

Asserts the reference shape: exactly the eight known check ids, all pass,
overall=pass. Prints one shape line; exit 0 on shape match, exit 1 naming
every drifted check id, exit 2 on setup/infrastructure failure.

Environment contract (layer1.py's, extended):
  KEEL_SANDBOX_IMAGE   defaults here to keel-runner:0.1 (the S0.3 image:
                       python:3.12-slim + pydantic 2.13.4 + pytest 9.1.1 —
                       layer1's own alpine default lacks both).
  KEEL_CONTENT_ROOT    content/ root used for BOTH this script's golden and
                       corpus paths AND layer1's checks-file lookup — point it
                       at a scratch copy of content/ to dry-run a proposed
                       content change without touching the repo.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
LAYER1 = SCRIPT_DIR.parent / "layer1.py"
DEFAULT_IMAGE = "keel-runner:0.1"
DEFAULT_UNIT = "3.2.1"
DEFAULT_GOLDEN = "s01-textbook"
DEFAULT_CORPUS = "s14-artifact-evidence/claims_messy.jsonl"
DEFAULT_TIMEOUT_S = 60

# The reference shape, shared with smoke-wiring-checks.py check (a): the
# checks file's eight ids, every one passing over the reference solution.
# Set equality (not subset) on purpose — a content PR that adds or removes a
# check is a shape change the dry-run must flag, not absorb.
REFERENCE_CHECK_IDS = (
    "schema-object-importable",
    "twenty-in-twenty-out",
    "outputs-are-valid-schema-objects",
    "fallback-never-raises-never-drops",
    "failures-logged",
    "end-to-end-run-conserves-records",
    "end-to-end-run-logs-fallbacks",
    "logged-failures-name-the-claim",
)


class DryRunError(Exception):
    pass


def content_root() -> Path:
    root = os.environ.get("KEEL_CONTENT_ROOT")
    if root:
        return Path(root).resolve()
    return SCRIPT_DIR.parents[2] / "content"


def stage_reference(root: Path, unit: str, golden: str, corpus: str,
                    submission: Path) -> None:
    golden_dir = root / "golden" / unit / golden
    corpus_file = root / "golden" / unit / corpus
    if not golden_dir.is_dir():
        raise DryRunError(f"reference solution not found: {golden_dir}")
    if not corpus_file.is_file():
        raise DryRunError(f"claims corpus not found: {corpus_file}")
    shutil.copytree(golden_dir, submission)
    shutil.copy(corpus_file, submission / "claims_messy.jsonl")


def run_layer1(submission: Path, unit: str, timeout_s: float) -> dict:
    env = os.environ.copy()
    env.setdefault("KEEL_SANDBOX_IMAGE", DEFAULT_IMAGE)
    env["KEEL_CONTENT_ROOT"] = str(content_root())
    proc = subprocess.run(
        [sys.executable, str(LAYER1), "--submission", str(submission),
         "--unit", unit, "--timeout", str(timeout_s)],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr.decode(errors="replace"))
        raise DryRunError(
            "layer1 infrastructure failure (is Docker running and %s present? "
            "build it with: docker build -t %s - <<< a Dockerfile of "
            "python:3.12-slim + pydantic==2.13.4 + pytest==9.1.1 — see the "
            "content-gate.yml dry-run step)"
            % (env["KEEL_SANDBOX_IMAGE"], env["KEEL_SANDBOX_IMAGE"]))
    return json.loads(proc.stdout.decode().strip().splitlines()[-1])


def assert_shape(result: dict, unit: str) -> int:
    expected = set(REFERENCE_CHECK_IDS)
    by_id = {c.get("id"): c for c in result.get("checks", [])}
    n_pass = sum(1 for c in by_id.values() if c.get("status") == "pass")
    n_fail = len(by_id) - n_pass
    overall = result.get("overall")

    missing = sorted(expected - set(by_id))
    extra = sorted(set(by_id) - expected)
    drifted = sorted(cid for cid, c in by_id.items()
                     if cid in expected and c.get("status") != "pass")
    shape_ok = not (missing or extra or drifted) and overall == "pass"

    print("dry-run %s: reference shape %s — %d pass / %d fail, overall=%s"
          % (unit, "OK" if shape_ok else "DRIFTED", n_pass, n_fail, overall))
    for cid in missing:
        print("  [missing] %s — expected but not run (checks file changed?)"
              % cid)
    for cid in extra:
        print("  [extra]   %s — not part of the reference shape" % cid)
    for cid in drifted:
        c = by_id[cid]
        print("  [%s] %s — %s" % (c.get("status"), cid, c.get("note")))
    return 0 if shape_ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(
        prog="dryrun-unit-checks.py",
        description="Dry-run a unit's Layer-1 checks against the reference "
                    "solution (golden s01 + substituted corpus).")
    ap.add_argument("--unit", default=DEFAULT_UNIT)
    ap.add_argument("--golden", default=DEFAULT_GOLDEN,
                    help="golden submission used as the reference solution")
    ap.add_argument("--corpus", default=DEFAULT_CORPUS,
                    help="claims corpus substituted at claims_messy.jsonl")
    ap.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT_S,
                    help="per-check wall cap in seconds")
    args = ap.parse_args()

    staging = Path(tempfile.mkdtemp(prefix="keel-dryrun-"))
    try:
        submission = staging / "submission"
        stage_reference(content_root(), args.unit, args.golden, args.corpus,
                        submission)
        result = run_layer1(submission, args.unit, args.timeout)
        return assert_shape(result, args.unit)
    except DryRunError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    finally:
        shutil.rmtree(staging, ignore_errors=True)
        if staging.exists():
            sys.stderr.write("[dry-run] warning: scratch debris at %s "
                             "(needs manual removal)\n" % staging)


if __name__ == "__main__":
    sys.exit(main())
