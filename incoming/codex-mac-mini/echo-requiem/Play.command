#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  print "SIDELINE needs Node.js 22 or newer. Install Node.js, then open this launcher again."
  read -k 1 "?Press any key to close."
  exit 1
fi
exec node scripts/launch.mjs
