# MR. BASEBALL DYNASTY — Field Demo v0.5
SportsDynastyGames · single-file monolith · vanilla JS · no build step

Play: open `index.html` (or the all-in-one `mr_baseball_dynasty_field_demo.html`).

## Controls
P1: arrows = d-pad · Z/space = B · X = A · Enter = start · Esc = pause
P2 (2P VS mode): IJKL = d-pad · N = B · M = A

- **Pitch**: B (+ d-pad held = type: ↓fastball ←slider →screwball ↑changeup), then
  steer the pitch in flight with the d-pad. A + direction = pickoff throw.
- **Bat**: ←→ moves the box · B swings (committed 84-frame delivery to read) ·
  hold A = squared bunt (bunt foul at 2 strikes is a K — careful).
- **After contact**: d-pad steers YOUR batted ball · A = send runners · B = hold up.
- **Steal** (batting, runner on): A + direction of the TARGET base during the
  pre-pitch or windup (↑2B ←3B ↓home). Early jump beats the throw-down; late jump
  is a coin flip for burners, an out for anyone slow. Pitchers slide-step back.
- **Fielder switch**: A cycles control to the next-nearest fielder while the ball is loose.
- **Field**: d-pad runs the flashing fielder · B = DIVE for it (miss = prone recovery) ·
  with the ball, B + direction throws (→1B ↑2B ←3B ↓home).
- Watch the pitcher tag: high pitch counts = TIRED (velocity + control decay).

## v0.5 highlights (the GOAT pass)
Batting scene pushed to REFERENCE-SCALE: new 44x70 star batter (waggle, 68-wide
swing rip, follow-through, bunt) with thick angled bat and loaded stance —
feet planted below the chalk box like the era reference. Sunshine palette
(brighter speckled grass + warm tan dirt, both views), higher flatter infield
arc, shallow bright-white chalk foul lines and boxes, tighter mound, B/S/O
bottom-left, gold HUD text straight on the ground, corner scorebug diamond.
All original art. All four suites green.

## v0.4 highlights (same session, second pass)
BATTING SCENE rebuilt to the era reference COMPOSITION (all original art):
all-field view (no stands/catcher blocking), textured speckle grass + dirt
pattern tiles, big dirt expanse + chalk lines + big boxes, and a 38x54 STAR
BATTER sprite (waggle/swing/follow/bunt). Floating mini-diamond scorebug,
corner HUD. STUCK-FIELDER FIX: deep holders now contest or run the ball in
(zero 15s stalls in 30-game audit, was 2), chaser hysteresis kills control
flip-flop. Field view gets the matching grass texture.

## v0.3 highlights (Fable 5 Max session)
OBLIQUE FIELD PERSPECTIVE (the trapezoid — ground-y 0.656 squash, 2:1 z-shadow
projection exact in screen px) · shaded 14x20 field sprites + TRUE 26x44 plate
batter, 22x32 pitcher, new catcher/ump · curved stands that fill the screen ·
INIDISP-style 6-frame step fades + 2-frame contact flash · chunky banner font ·
dust/flash FX · state-driven camera grammar with HARD CUTS to contested bases
(RE §5.5) · CPU eye model + sticky pitcher wildness → real K/BB texture
(K 3.3 / BB 1.2 / HBP 0.15 per CPU game, contact 82%) · STEALS v1 with live
throw-down races · fielder switch on A · full audio package: between-innings
organ, CHARGE!, walk-up ditties by archetype, PA stingers, layered HR eruption.
Tests: golden + sim_suite + round2 + NEW round3 (steals/switch/texture) ALL
PASS. test/audit.mjs = outcome-mix instrument.

## v0.2 highlights
84-frame leg-kick delivery [MEASURED arc] · stadium grandstand/scoreboard/ads/
batter's eye · umpire punch-outs + catcher receives · NOW BATTING walk-up strip ·
radar-gun MPH + pitch count · 4-frame run cycles, dives, slides · HR fireworks
with distance call · manual baserunning · pickoffs + leads · bunting · fatigue ·
2P local VS · vocal-ish synth ump calls + crowd dynamics.

## Tests (node, no deps)
`node test/golden.mjs` — frame-exact integrator vs real captured SNES trajectories
`node test/sim_suite.mjs` — determinism, smoke, liveness, windows, swing lab, stat fits
`node test/round2.mjs` — 84f delivery, bunt, baserunning, 2P routing, pickoffs

## Layout
`game.js` is the shipping monolith; `src/` holds sectioned sources
(`sh mkgame.sh` re-concatenates). Sim core (§A–§G) is presentation-free —
lift it wholesale for the MBD merge.
