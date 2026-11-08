# tools/ — sprite workshops (dev-only, not part of the game)
- art_v05.mjs   · v0.5 GOAT batter (44x70) rows + validator/ASCII preview. Run: node tools/art_v05.mjs [spriteName]
- art_v04.mjs   · v0.4 batter (38x54) workshop
- sprites_v03.mjs · v0.3 field/plate sprite set workshop
The LIVE sprites are in src/08_render.js (SPR). Edit art here → validate →
hand-copy rows into SPR (do NOT rerun old one-shot splicer scripts; the
root-level splice_sprites.mjs / newplate.py from past sessions are consumed
and will corrupt src/08_render.js if rerun — they are excluded from packages).
