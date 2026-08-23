#!/usr/bin/env bash
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd "$HOME/workspace/keelacademy/platform/app" || exit 1
exec npx next dev -p 3111
