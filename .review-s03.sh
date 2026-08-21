#!/usr/bin/env bash
# Temporary review script for S0.3 — deleted after the review.
set -uo pipefail
ROOT=/home/obande/workspace/keelacademy

echo "=== A. FIXTURE REPO (expect FAIL naming the failing nodeid) ==="
(cd "$ROOT/platform/cli" && python3 -m grader.l1 fixtures/failing-repo --checks fixtures/failing-repo/checks.yaml); echo "exit=$?"
echo

echo "=== B. COMPLETION BASE (expect FAIL: 5 gap tests named) ==="
(cd "$ROOT/platform/cli" && python3 -m grader.l1 "$ROOT/content/units/phase-3/3.2.1/completion" --checks "$ROOT/content/checks/3.2.1.completion.yaml"); echo "exit=$?"
echo

echo "=== C. FILLED COPY (pre-fix: worker claims no-gap-markers false-positives on test file) ==="
rm -rf /tmp/comp-filled
cp -r "$ROOT/content/units/phase-3/3.2.1/completion" /tmp/comp-filled
cp "$ROOT/content/units/phase-3/3.2.1/worked-example/schemas.py" "$ROOT/content/units/phase-3/3.2.1/worked-example/extractor.py" /tmp/comp-filled/
(cd "$ROOT/platform/cli" && python3 -m grader.l1 /tmp/comp-filled --checks "$ROOT/content/checks/3.2.1.completion.yaml"); echo "exit=$?"
