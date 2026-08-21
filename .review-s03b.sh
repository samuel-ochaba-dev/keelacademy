#!/usr/bin/env bash
# Temporary re-check after the no-gap-markers fix — deleted after use.
ROOT=/home/obande/workspace/keelacademy

echo "=== FILLED COPY, FIXED CHECKS (expect 3/3 PASS) ==="
(cd "$ROOT/platform/cli" && python3 -m grader.l1 /tmp/comp-filled --checks "$ROOT/content/checks/3.2.1.completion.yaml")
echo "filled_exit=$?"
echo

echo "=== BASE, FIXED CHECKS (expect still FAIL) ==="
(cd "$ROOT/platform/cli" && python3 -m grader.l1 "$ROOT/content/units/phase-3/3.2.1/completion" --checks "$ROOT/content/checks/3.2.1.completion.yaml" 2>&1 | tail -4)
echo

echo "=== PROTECTED FILES (expect old timestamps) ==="
ls -l --time-style=long-iso "$ROOT/curriculum.md" "$ROOT/school-architecture.md" "$ROOT/build-plan.md"
