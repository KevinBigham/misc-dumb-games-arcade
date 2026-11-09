# Twelve Sols

Original single-file survival-crafting game (vanilla JS, Canvas + DOM, code-generated WebAudio, no external assets except an optional Google Fonts stylesheet with system fallbacks).

**Loop:** each sol, spend 8 hours going out for supplies and combining them at the Bench to keep Air, Warmth and Food above zero, then survive the night's dust storm. Rescue lands at dawn after Sol 12.
**Twist:** recipes are discovered by experiment and written into a Field Journal that survives every run. Knowledge is the progression; nothing else carries over.

## Design contract
- Fantasy: stranded on a red-dust world, improvising a life from scrap.
- Repeated decision: where to spend the day's hours (trip vs. bench vs. experiment) and which need to protect tonight.
- Scarce resources: hours, Power Cells, wire.
- Loss: any of Air / Warmth / Food hits 0. Hull at 0 = breach (extra air and warmth loss).
- Escalating threat: the nightly dust storm (power 9 on Sol 1 rising to ~37 by Sol 12, cap 40; surges x1.5).
- Two strategies: Turtle (3 shutters, insulation, panels, ride out 12 nights) vs Beacon (rush the 4-step beacon chain; rescue 3 sols after lighting, never before Sol 8).
- Long goal: being rescued unlocks harsher seasons (4 levels, score x1 to x1.8). Daily sol = same seed for everyone that day, level 1.
- Session: ~60-90 actions, 10-20 minutes.

## Files
- `twelve-sols.html` — the game (built). `node build.mjs` rebuilds from `src/`.
- `src/core.js` — CONFIG, DATA (20 items, 17 recipes, 7 builds, 6 sites, 7 events), seeded RNG, pure Rules (`newRun/check/act`), save validation and journal repair. No DOM.
- `src/ui.js` — Storage (try/catch, autosave every action, damaged-save backup), Audio, Scene (canvas), Renderer, Input.
- `tests/` — `rules.mjs` (28 checks), `dom.mjs` (42 real-click checks in jsdom), `balance.mjs` (bot win rates), `scene-shot.mjs`, `trace.mjs`. Results saved as `*-results.txt`.
  DOM tests need jsdom: `JSDOM_FROM=/path/with/node_modules/x.js node tests/dom.mjs`.
- `?debug=1` shows RNG state, storm table and sites in the Journal tab.

## Assets
All art is code-drawn (SVG item icons, canvas scene). All sound and music is generated with WebAudio. All names and text are original. Fonts: Saira Condensed and Atkinson Hyperlegible via Google Fonts (SIL OFL), falling back to system fonts.
