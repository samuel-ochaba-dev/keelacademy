#!/usr/bin/env bash
set -uo pipefail
DKR="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
docker info >/dev/null 2>&1 && DKR="docker"
echo "== remove leftover container + temp staging =="
"$DKR" rm -f -v keel-wiring-smoke-126145 >/dev/null 2>&1 || true
python3 - <<'EOF'
import os, shutil
for p in ("/tmp/keel-layer1-zp7h5f1c",):
    if os.path.isdir(p):
        shutil.rmtree(p, ignore_errors=True)
print("temp staging removed" if not os.path.isdir("/tmp/keel-layer1-zp7h5f1c") else "STILL PRESENT")
EOF
echo "== proxy regression rerun =="
cd /home/obande/workspace/keelacademy/platform/grading
if bash scripts/smoke-proxy.sh; then echo "PROXY-REG OK"; else echo "PROXY-REG STILL FAILING"; fi
echo "== leftover check after =="
"$DKR" ps -a --format '{{.Names}}' 2>/dev/null | grep -E '^keel-' || echo "no keel containers"
ls /tmp/keel-layer1-* /tmp/keel-wiring-* 2>/dev/null || echo "no wiring temp dirs"
