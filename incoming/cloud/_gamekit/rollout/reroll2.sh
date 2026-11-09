#!/bin/sh
# sh reroll2.sh <kit-publish.html> <pre-kit.html> <scratch dir> [opts-json] [seed.json]
# Kit 2.0 re-roll for one game: keeps a pre-v2 copy (the live kit 1.1.1 page), swaps in kit 2.0 with the
# same id and save keys, then runs the before/after smoke check against the pre-kit game.
set -e
KP="$1"; PRE="$2"; S="$3"; OPTS="$4"; SEED="$5"
R=/mnt/project-files/games/kit/rollout
BOOT=$(sed -n 's/.*<script id="gkboot">\(window\.\)\{0,1\}GK\.retrofit(\(.*\));<\/script>.*/\2/p' "$KP" | head -1)
ID=$(node -e 'const o=JSON.parse(process.argv[1]);console.log(o.game)' "$BOOT")
KEYS=$(node -e 'const o=JSON.parse(process.argv[1]);console.log(o.saves.join(","))' "$BOOT")
PV2="${KP%.kit-publish.html}.pre-v2.html"
[ -f "$PV2" ] || cp "$KP" "$PV2"
if [ -n "$OPTS" ]; then node $R/retrofit.js "$KP" --id "$ID" --saves "$KEYS" --opts "$OPTS"; else node $R/retrofit.js "$KP" --id "$ID" --saves "$KEYS"; fi
mkdir -p "$S" && cd "$S"
sh /home/user/gk-deps/run.sh $R/smoke.mjs "$PRE" "$KP" "$KEYS" $SEED
