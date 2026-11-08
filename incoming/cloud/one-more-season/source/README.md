# One More Season

Original six-fixture five-a-side club management game (Brief A from Kevin's Nov 5 research pack).
All clubs, players, text and graphics are original and fictional.

## Run / build / test
```
node build.mjs              # writes dist/one-more-season.html (artifact) + dist/one-more-season.standalone.html
node test/harness.mjs       # seeded rules harness (determinism, odds rows, transitions, saves, outcomes, strategy table)
node test/ui-smoke.mjs      # clicks through the built page against a fake DOM (no layout check)
node test/sweep.mjs 1000    # tuning sweep: success rate per bot strategy over N seeds
```
Open `dist/one-more-season.standalone.html` in any browser to play locally. No network, no accounts.

## Design contract
- Fantasy: player-coach of Saltgate Town, one season to save your job.
- Repeated decision: which 5 of 8 start, where 2 prep points go (rest or train), which of 3 plans.
- Scarce resource: fresh legs (fatigue). Rest is temporary, training is permanent but tiring.
- Loss condition: fewer than 4 wins after 6 fixtures (draws do not count).
- Target session: about 8-12 minutes.
- Two plausible strategies: Rotate & Read (rest the tired, rotate, match plan to scouting) vs Train & Ride (train starters every week, never rest).
- First 60 seconds: scouting for Harbor Lane Rovers (weak to Patient), coach's note says the star striker is at 68% strength; bench or rest, pick a plan, kick off.
- Out of scope: positions, substitutions, overtime, transfers, real teams, online anything, audio.

## Rules (exact)
- Attributes 1-10: Attack, Defense, Control, Stamina. Fatigue 0-100.
- Effective Attack/Defense/Control = value x (1 - fatigue/200). Team rating = average of the 5 starters.
- Prep: 2 points per fixture, no carry-over, one action per player. Rest: fatigue -24. Train: attribute +1 (max 10), fatigue +8.
- Possessions: 8 per team, alternating (you attack first in odd fixtures). Each scores 0, 3 or 7.
- Base odds 0/3/7: Patient 25/55/20, Balanced 35/35/30, Aggressive 50/10/40.
- Shift S = round(3 x (offense Attack - defense Defense) + 2 x (offense Control - defense Control) + tendency), clamped to +/-15.
  Odds become (base0 - S, base3, base7 + S). Logged with every possession.
- Tendency: each opponent has one, tied to one of YOUR plans; it adds pp to your attacks or theirs.
- After a match: starters fatigue +(24 - Stamina), bench -18, clamped 0-100.
- After fixtures 1-5: one free +1 to one attribute of one player.
- Higher total wins; tie = draw = not a win. Season success = 4+ wins.

## Architecture
- `src/config.mjs` every tunable number
- `src/content.mjs` roster, opponents, plans, 12 recap templates, content validator
- `src/rng.mjs` seeded mulberry32 (state is one uint32, saved with the season)
- `src/sim.mjs` pure match simulator and recap renderer
- `src/game.mjs` season state machine (`reduce(state, command)`), legal transitions, save validation, season recap
- `src/storage.mjs` versioned localStorage with prev-good fallback and backup of unreadable saves
- `src/ui.mjs` rendering and input only
Resolve-then-persist: COMMIT applies prep, resolves the whole match once and stores the event log and RNG
before playback. FINISH_MATCH (fatigue) and DEVELOP each carry a per-fixture completion flag.
