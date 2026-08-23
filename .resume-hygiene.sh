#!/usr/bin/env bash
set -uo pipefail
cd /home/obande/workspace/keelacademy
echo "=== leak sweep over new S1.6/S1.7 files + workflows ==="
if grep -rEi "sk-[A-Za-z0-9_-]{16,}|AKIA[A-Z0-9]{12,}" .github content/tools/validate-rubrics.py platform/cli/grader/gate.py platform/cli/grader/rubric_version.py platform/cli/grader/llm.py 2>/dev/null; then echo "FAIL leak"; else echo "PASS leak sweep"; fi
echo "=== leftover containers/processes ==="
DKR="docker"; docker info >/dev/null 2>&1 || DKR="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
"$DKR" ps -a --format '{{.Names}}' 2>/dev/null | grep -E '^keel-' || echo "no keel containers"
pgrep -af "grader.gate|smoke-|worker.py|intake/server|proxy/server|fake_upstream" | grep -v pgrep || echo "no leftover processes"
echo "=== tracked .review files now deleted in worktree (from founder snapshot) ==="
git status --porcelain | grep '^ D' | head
echo "=== stray dotfiles at root (gitignored; resurrect-anomaly) ==="
ls -a | grep -E '^\.' | grep -vE '^\.$|^\.\.$|^\.git$|^\.gitignore$' || echo none
