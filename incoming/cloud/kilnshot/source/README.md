# Kilnshot

Fling a kiln ember to smash every cracked bisque pot while sparing the glazed cobalt keepers. Each chapter teaches one idea, then twists it:

- **Ember jars** spill a fountain of new embers.
- **Cords** drop their pot when cut.
- **Reed mats** are springy, and **wet clay** is dead.
- **Latches** swing doors and trapdoors.
- **Bellows** push the embers around.
- **Thick glaze** needs a hard hit.

The game has 24 hand-built levels plus a Daily Kiln. The Daily Kiln is a seeded level that is the same for everyone, with a par set by a bot.

Live link: https://claude.ai/artifact/3M4wT2bF4JPG2rifNrkgRG

## Files
- **src/core.js:** CONFIG, the deterministic physics, and the pure rules. It uses a fixed 1/240 step, only + - * / sqrt, and integer launch velocities.
- **src/levels.js:** the chapters and the 24 levels as data. Six levels are authored on the left and mirrored at load.
- **src/daily.js:** the daily generator, a coarse-to-fine greedy par solver, and the level validator.
- **src/daily-table.js:** a precomputed daily cache through 2027-12-31. Each row is re-proven in the browser by replaying it, and later dates are solved live.
- **src/app.js:** storage (validated, with a backup of any corrupt save), WebAudio (starts on the first gesture and suspends when the tab is hidden), the renderer, input, and UI.
- **build.js:** bundles everything into `dist/kilnshot.html`.
- **tests/solve.js:** the level solver bot. It runs a grid search over launch vectors with a beam search over distinct boards. `--robust` keeps only shots whose grid neighbours agree.
- **tests/smoke.js:** a jsdom UI test covering boot, first drag, win, retry, resume, corrupt or hostile saves, the hidden tab, the keyboard and the daily mode.
- **tests/render.js:** real canvas frames at 375 px width and DPR 2, written to PNG.
- **tests/daily-test.js:** runs many dates and checks determinism, proof replay and timing. With `TABLE=1` it writes the table.
- **tests/viz.js, probe.js, draw.py:** design visualisers.

## Test results (bot only, nobody has played it on a real phone)
- **Solver:** all 24 levels are solvable at par with robust shots. Each level's one-shot window is between 0.4 % and 14.6 % of the launch grid.
- **Raw (non-robust) solver:** it found trick shots that beat par on L15 to L18, taking 1 to 20 grid cells. These are kept on purpose as "beat the kiln's par" shots, and the level tile shows ◆ when you find one.
- **Smoke test:** 34 of 34 checks pass.
- **Daily:** 426 dates (2026-11-01 to 2027-12-31) were all deterministic, with no fallbacks, and every proof replays to a win. Par spread: 69 days at par 1, 178 at par 2, 148 at par 3, 31 at par 4. Those days load in about 60 ms in the app. After 2027 the game solves each day live, with a median of 2.9 s and at most 23 s on this server.
- **Farm check:** stars are capped per level, and the daily best only stores your lowest throw count. There are no currencies or upgrades.

## Blunt self-critique
1. **Precision.** Most one-shot windows are a few pixels of pull wide. On a real thumb this may feel like luck. Mitigations:
   - the aim guide now follows the first wall bounce, and runs longer in chapters 1 and 2
   - 2 spare embers
   - clearing the level in extra throws still gives 2 stars

   This has not been tested with a person.
2. **Sameness.** The sling sat bottom-left on 21 of 24 levels, so almost every answer was "bank off the left wall". Six levels are now mirrored, but the bank shot is still the dominant move.
3. **Daily par is greedy, not optimal.** Some days are soft at par 4, and a sharp player will often beat the kiln.
4. **Art is canvas primitives.** I checked it only in headless renders. The pots are about 15 px on a phone, and the door and latch letters are small.
5. **Not verified on a device:** touch feel, the iOS audio unlock and safe-area layout on a real phone.

## Fixed in the polish pass
- The aim guide shows bank shots.
- Chain Shelf's window is about 1.3x wider (robust shots 18 to 23) and Crosswind's about 1.6x wider (20 to 33).
- Jar counts are readable badges, and there is now one chain label instead of stacked text.
- A finished attempt is no longer resumed after a refresh, and Retry is blocked on the title screen.
- Daily build time dropped from 26 s to a median of 2.5 s, and dates through 2027 are now precomputed.
- Six levels are mirrored.
- The title screen explains stars and fast-forward.

## Best next idea
A level editor with share codes, where the solver bot automatically proves every shared kiln beatable and stamps it with a par.
