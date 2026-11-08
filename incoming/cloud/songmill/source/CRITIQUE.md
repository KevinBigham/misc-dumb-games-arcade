# Songmill: blunt self-critique (after pass 1)

Tested headlessly only: a Node bot drove the real game code (rules, input, renderer, save/load) and a canvas recorder drew the board at a 390px phone width. Nobody has played it on a real phone, and nobody has heard the audio.

## What works
- The grammar is clean: 7 colors = sets of 3 primaries, mixing is union, strands are up to 4 beads. Every order can be built, and there are real tricks (GPPG = mix(YRRY, BBBB) needs 1 blue instead of 4).
- Every layout the bot designed by hand worked on the first try, so the rules are predictable.
- Board drawing at 35px cells is legible: belts curve, machines read, wells glow.

## What's wrong (and the fix)
1. **Too easy in pass 1.** Six tiers fell in under 9 sim-minutes because upgrades were cheap and uncapped; buying speed replaced redesign, which kills the shapez lesson. Fix (done): bigger quotas (10 → 8,000), pricier upgrades, and a per-tier upgrade cap so the only way past it is more lines.
2. **First move was a trap.** Dragging out of a well and turning right away made a belt the well refused to feed. Fix (done): a well feeds any belt that starts at it, but never a line that merely passes by.
3. **The throughput meter is invisible on a phone.** It lived in a header row that seven buttons squeeze to ~16px at 358px wide. That meter is the whole point of a throughput game. Fix: move it under the quota count; drop the Dir button (drag-to-aim and tap-to-turn already cover direction).
4. **Fork and Joiner icons look the same** (both read as "+"). Fix: Joiner becomes two linked beads, Fork a trident with arrowheads.
5. **Red and orange beads are close** on 7px beads. Fix: push the hues apart and grow beads a little. Order strip keeps letters for color-blind players.
6. **Hum piles up late** (14k unspent at tier 6) because the cap blocks spending. Not fixed tonight; best next-version idea is a hum sink that adds throughput (dig a new well).
7. **No title moment.** Fix: a one-time welcome toast on first launch, no blocking screen.
8. Hints didn't say which side of a Joiner is "back". Fix: hints name the dot (back) and rings (sides).

## Curve after tuning (bot, instant building, greedy upgrades, one or two lines)
T1 R×10 9s · T2 RY×40 20s · T3 O×150 45s · T4 OB×500 86s · T5 WW×1500 2.7m · T6 GPPG×4000 8m · T7 OWBY×8000 ~20m with one line (a second line roughly halves it; 4× speed button). Then freeplay.
