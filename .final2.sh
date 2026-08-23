#!/usr/bin/env bash
cd /home/obande/workspace/keelacademy
python3 - <<'EOF'
import os
# worker's harness (delete post-acceptance per their request) + reviewer temp scripts
for f in (".verify-s21-proof.sh", ".rev-s21-mine.sh", ".patch-s21.sh", ".zap.sh"):
    if os.path.exists(f):
        os.remove(f)
print("removed ok")
EOF
echo "=== verify build-state patches landed ==="
sed -n '5p' build-state.md | cut -c1-140
grep -c "S2.1 ACCEPTED (reviewed by execution)" build-state.md
grep -c "S2.2 ISSUED" build-state.md
grep -n "\[x\] S2.1" build-state.md | cut -c1-120
echo "=== leftover check ==="
ls -a | grep -E '^\.(rev|patch|verify-s21|zap)' || echo "ALL-TEMP-GONE"
