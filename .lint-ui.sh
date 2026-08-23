#!/usr/bin/env bash
set -u
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd "$HOME/workspace/keelacademy/platform/app" || exit 1
npx eslint . 2>&1 | tail -30
echo "EXIT=$?"
