#!/usr/bin/env bash
# Temporary review script for S0.2 — deleted after the review.
set -uo pipefail
V=/tmp/ka-venv
if [ ! -x "$V/bin/python" ]; then
  python3 -m venv "$V" && "$V/bin/pip" install -q pydantic pytest
fi
WE=/home/obande/workspace/keelacademy/content/units/phase-3/3.2.1/worked-example
CP=/home/obande/workspace/keelacademy/content/units/phase-3/3.2.1/completion

echo "=== 1. WORKED EXAMPLE TESTS (expect all pass) ==="
(cd "$WE" && "$V/bin/python" -m pytest test_extractor.py -q); echo "exit=$?"

echo "=== 2. WORKED EXAMPLE RUN ==="
(cd "$WE" && "$V/bin/python" extractor.py 2>/dev/null | head -8)

echo "=== 3. COMPLETION BASE TESTS (expect failures) ==="
(cd "$CP" && "$V/bin/python" -m pytest test_extractor.py -q); echo "exit=$?"

echo "=== 4. GAP MARKERS PRESENT IN BASE ==="
grep -rn "GAP [0-9]" "$CP" --include="*.py" | wc -l

echo "=== 5. GAPS FILLED WITH WORKED-EXAMPLE SOLUTIONS (expect all pass) ==="
rm -rf /tmp/comp-check && cp -r "$CP" /tmp/comp-check
cp "$WE/schemas.py" "$WE/extractor.py" /tmp/comp-check/
(cd /tmp/comp-check && "$V/bin/python" -m pytest test_extractor.py -q); echo "exit=$?"

echo "=== 6. FILLED COMPLETION RUN ==="
(cd /tmp/comp-check && "$V/bin/python" extractor.py 2>/dev/null | head -3)
