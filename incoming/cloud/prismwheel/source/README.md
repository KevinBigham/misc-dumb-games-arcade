# Prismwheel

Spin the wheel, not the shards. Colored shards fly in from every direction; turn the wheel so each lands on a face where it touches 2+ of its color, which shatters them. A face that grows past the dashed ring breaks the run.

- Play file: prismwheel.html (standalone) / prismwheel.artifact.html (published form)
- Link: https://claude.ai/artifact/SeXhoQn9FRR29Pc6vMa68i
- Source: src/core.js (CONFIG, DATA, State, Rules), src/app.js (Renderer, Input, Audio, Storage), src/shell.html; build with `sh src/build.sh`
- Tests: `node src/bot.js 12 sloppy` (balance bots), `node src/test-app.js` (33 page checks at 390x844 + PNG screenshots via src/render.py)

## The twist stack
1. Rotate the container (the wheel), never the piece.
2. The wheel changes shape as you climb: Ring I 6 faces (30 shards), Ring II 7 faces + prism wildcards (90), Ring III 8 faces + stones (270), then Crown endless. Each ring-up shatters your stack for a bonus and drops difficulty 28% as a breather.
3. Combo timer arc around the core; chains (cascades) multiply; CLUTCH SAVE bonus for clearing next to the dashed ring.
4. Flare (unlocks the first time its meter fills): wipes the bottom row of every face and shoves incoming shards back.

## CONFIG values to tune first
speedBase 0.30, speedPerDiff 0.0115, gapBase 1.55, gapMin 0.5, diffRate 0.13, diffDamp 0.08, diffCap 35, comboWindowBase 3.4, flareCharge 24, ring quotas 30/90/270, maxRows 8.

## Next ideas
1. Shareable Daily Spin result card (score + ring + a tiny emoji-free glyph strip of your final wheel).
2. A 5th color that only appears in Crown, with a matching glyph.
3. "Counter-spin" modifier for Crown: the wheel drifts slowly and you fight the drift.
