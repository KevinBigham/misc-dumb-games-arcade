# Design Contract — Game 08: Orbit Stack

## 1. Player Fantasy & Core Loop
- **Player Fantasy**: You are the orbital traffic controller of a hyper-dense crystalline reactor core (`Hex -> Hepta -> Octa`). High-velocity energy shards stream inward from outer orbital lanes; you rotate the magnetic polygon core and trigger radial phase pulses to synthesize matching lattice chains before the outer containment perimeter breaches.
- **One-Sentence Core Loop**: Colored orbital shards fly inward toward a rotating central polygon core; rotate the core (`Left` / `Right`) or trigger a **Phase Pulse (`Shift` / `Up`)** and **Slam (`Space` / `Down`)** so 3 or more connected same-color blocks match and clear before any side's stack breaches the outer containment ring!
- **Primary Reference**: *Hextris* (Logan Engstrom, Garrett Finucane, Noah Moroze, Michael Yang — GPLv3 / GitHub Top Action-Puzzle Reference).
- **Supporting Reference**: *Super Hexagon* (Terry Cavanagh — Radial spatial geometry & rhythmic polygon awareness).

## 2. Repeated Decision & Meaningful Tradeoff
- **Repeated Decision**: Every 400–1200ms as an orbital wave approaches across 1 to 3 lanes, the player must choose which face of the central polygon receives each incoming shard.
- **Scarce Resource**:
  1. **Radial Stack Headroom** (`MAX_STACK_DEPTH = 7` per face before outer red containment breach).
  2. **Combo Decay Window** (`2600ms` window to chain clears and preserve `x2..x8` score multipliers).
  3. **Phase Pulse Charge** (`0..100%`, charged by clearing blocks and bonus-charged by multi-face combos).
- **Two Plausible Strategies**:
  1. **Strategy A — Safe Single-Face Clearing (Low Risk, Steady Survival)**: Rotate directly beneath incoming matching shards to stack 3 vertically on a single face (`[side][d]`, `[side][d+1]`, `[side][d+2]`). Keeps radial depth low (`<= 3`), prevents sudden lockouts during fast spiral waves, and guarantees steady progress toward the Level 8 short-goal victory.
  2. **Strategy B — Cross-Face Chain & Phase-Pulse Banking (High Risk, High Multiplier)**: Intentionally stage 2 matching blocks at the same radial depth across adjacent faces (`Face N` and `Face N+1`), then drop a single bridge block onto `Face N+2` or trigger an inner clear so gravity drops an outer ring into a **5+ block angular-plus-radial flood-fill cascade**. This rockets the Combo Multiplier to `x4–x8` and rapidly fills the **Phase Pulse** meter, which compresses the innermost ring across *all* faces in an emergency.

## 3. Signature Twist: Dynamic Polygon Morphing (`6 -> 7 -> 8` Sides)
Unlike traditional *Hextris* which remains fixed at 6 sides:
- **Levels 1–3 (Hex Core — 6 Sides)**: 4 shard frequencies (`Cyan ▲`, `Amber ●`, `Magenta ■`, `Emerald ◆`), readable single and opposing waves.
- **Levels 4–6 (Hepta Core — 7 Sides)**: The core dynamically expands to a 7-sided heptagon while **preserving all existing stacked shards**! Unlocks the 5th shard frequency (`Violet ★`) and asymmetric odd-sided rotation geometry.
- **Levels 7–35 (Octa Core — 8 Sides)**: The core expands to an 8-sided octagon. Introduces high-tempo `SPIRAL_CASCADE` and `CROSSING_PAIR` waves. Difficulty ramps briskly through Level 10, then flattens asymptotically toward the hard speed cap at **Level 35**.

## 4. Loss Condition & Session Goals
- **Loss Condition**: If any face of the polygon accumulates `>= 7` stacked shards (`MAX_STACK_DEPTH = 7`), breaching the pulsing crimson containment perimeter, the reactor enters **Containment Breach (Game Over)**.
- **Short Goal (5–8 Minute Target Session)**: Reach **Level 8 (Octa-Core Mastery)** and clear **100 total blocks** to unlock the **Octa-Core Victory Banner**, with the option to click **Continue Endless Orbit** toward Level 35.
- **Long Goal**: Master the Level 35 asymptotic speed cap, chain `x8` cross-face cascades, and set a persistent high score.

## 5. First 60 Seconds Experience
- **0–15s**: The 6-sided Hex Core hums at the center of the viewport. Single-stream shards (`▲ Cyan`, `● Amber`, `■ Magenta`, `◆ Emerald`) glide inward along radial guide lanes with clear landing ghost previews on the target polygon face.
- **15–35s**: The player rotates with `Left`/`Right` (or `A`/`D`) and discovers `Space`/`Down` to **Slam** a shard inward for instant placement bonus points. Three connected same-color shards burst into radial particles with an ascending WebAudio pentatonic chime.
- **35–60s**: Cross-face matches and gravity cascades charge the **Phase Pulse (`Shift`/`Up`)** gauge to 100%, letting the player vaporize the entire innermost ring of blocks across all faces with a shockwave.

## 6. Out-of-Scope Features
- No free-form physics collisions or arbitrary continuous angles (discrete lane-locked radial geometry ensures crisp deterministic puzzle reads).
- No multiplayer networking, external image/audio asset dependencies, or microtransaction currencies.

## 7. Playtest Script & Verification Checklist
1. Launch `Orbit Stack` and press `Left` / `Right` (`A` / `D`): verify smooth angular interpolation of the central polygon while logical lane indices wrap cleanly modulo `numSides`.
2. Press `Space` / `Down`: verify active falling shards slam inward rapidly and award slam bonus points.
3. Stack 3 same-color blocks either radially on one face OR angularly across 3 adjacent faces at the same depth: verify flood-fill connected-component clear, particle explosion, floating `+score` popup, and gravity settling of outer blocks.
4. Reach Level 4 (18 clears) and Level 7 (45 clears): verify the polygon morphs from `6 -> 7 -> 8` sides while preserving every existing block stack without loss.
5. Press `[D]` to toggle the Debug Inspector and verify live telemetry (Seed, Sides, Wave Pattern, Speed Multiplier, Combo, Stack Depths).

## 8. Next Experiment
- Evaluate an optional "Counter-Spin Hazard Wave" at Level 15+ where specific golden shards invert rotation direction for 1 beat unless slammed immediately.
