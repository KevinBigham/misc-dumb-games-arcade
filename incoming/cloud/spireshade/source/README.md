# Spireshade

An original two-player abstract board game for phones. Raise a spire and its shadow captures shorter rival spires; the sun turns every round.

## Rules (the whole game)
1. On your turn, tap an empty square to place a spire (height 1), or tap one of yours to raise it (max 3).
2. The spire you just moved casts a shadow away from the sun, as many squares long as it is tall.
3. Rival spires in that shadow that are shorter than yours turn to your color. A spire as tall as yours (either color) stops the shadow. Height 3 is safe forever.
4. The sun turns a quarter after every round (two moves), so both players cast the same way, then it swings. The faint sun shows where it goes next.
5. When all 25 squares are full, more spires wins. 25 is odd, so there are no ties. Rust moves first.

## Design contract
- Fantasy: a desert noon duel of stone spires and moving shade.
- Repeated decision: place (claim a square, never captures) or raise (spend the turn to attack and to protect).
- Scarce resource: tempo. Every raise is a square you did not claim.
- Two plausible strategies: wide (claim squares, raise late) vs tall (raise early to 3 for permanent, long-range spires).
- First 60 seconds: board on screen, tap a square, tip line explains the next idea after each move.
- Outside the first build: online play, ratings, bigger boards, animated replays to share.

## Lichess lessons used
- Instant play: opens straight into a game, no account.
- Fairness: rules symmetric, bots see nothing hidden, measured first-move win rates (below).
- Review: after a game, every move is checked; the biggest drop is shown as the turning point with the engine's better move, labeled as an estimate, and "Retry from here" replays that position.
- Daily puzzle: generated from the date as a seed by bot self-play; one clear best move, judged by the spire lead after the rival's best single reply. Wrong answers show the reply and let you retry or see the answer. Streak tracked.

## Files
- `src/core.js` CONFIG, DATA, seeded RNG, pure rules, evaluation, search, bots, review, puzzle, save validation (no DOM).
- `src/ui.js` Storage (try/catch, validated), Sound (WebAudio, starts on first gesture, suspended on hidden tab), Renderer (canvas), Input (touch, keyboard), App, Review, Puzzle.
- `src/shell.html` markup and styles. `build.js` inlines everything into `dist/spireshade.html`.
- `test/rules.js` rules, endings, determinism, 60 days of puzzles, review, bot timing, save sanitizer.
- `test/smoke.js` full page in jsdom: first touch, bot reply, undo, hidden-tab audio, a whole game, result, review, retry, puzzle right and wrong, pass and play, reload, corrupt and tampered saves.
- `test/bots.js` and `test/ladder.sh` bot ladder and fairness. `test/results/` raw outputs. `test/shots.js` renders board PNGs.

Run: `node build.js && node test/rules.js && node test/smoke.js <dir with jsdom> && bash test/ladder.sh`

## Bot results (5x5, rules v2)
| Test | Games | Result |
|---|---|---|
| Pebble self-play | 300 | first mover wins 47% |
| Cairn self-play | 200 | first mover 47% |
| Spire self-play | 200 | first mover 48% |
| Summit self-play | 40 | first mover 33% (small sample; earlier 5x5 runs 38–68%, pooled 51% over 140) |
| Cairn vs Pebble | 120 | Cairn 100% |
| Spire vs Cairn | 120 | Spire 90% |
| Summit vs Spire | 40 | Summit 98% |
Every game ended (25 to 75 moves possible; typical 46–51). The 6x6 test board was dropped: about a quarter of strong games tied on spires.

## Playtest script
1. Play Pebble as Rust. Can you say what a shadow does after three moves?
2. Lose to Spire on purpose, open the review: does the turning point make sense?
3. Solve the daily puzzle. Then try a wrong move: is the explanation clear?
4. Pass and play with someone for one game: does anyone get confused about whose turn it is?

## Debug
In the browser console, `SpireApp` (controller) and `SpireCore` (rules) are exposed.

## Assets
All code, text, art (canvas-drawn) and sound (generated WebAudio) are original to this project. Fonts: Bricolage Grotesque and Atkinson Hyperlegible from Google Fonts (SIL Open Font License), with system fallbacks.
