# CROSSBLOCK — Make a little room

Open **`crossblock-play.html`** in a modern browser. Everything is in that one file: the game, both modes, styling, icons, and synthesized sound. No installation, account, API, network assets, or server is required.

For development, run `npm run dev` and visit `/crossblock.html`. `npm run build` includes both `/crossblock.html` and `/crossblock-play.html` in `dist/`. Rebuild only this game with `node scripts/build-crossblock.mjs`.

## The game

Pick a shape, rotate it if needed, and click the cell where its top-left corner should go. A translucent preview shows exactly which squares it will occupy. You can also drag from the tray. Full rows and columns disappear together; blocks do not fall afterward.

- **Free play:** three shapes at a time, endless until none of the remaining shapes fits in any orientation. A fresh hand includes at least one fitting shape whenever the shape pool contains one. Bigger shapes enter after 12 placements.
- **Daily puzzle:** empty the starting board with exactly three shapes. The date in your browser's local timezone selects a seeded arrangement from five authored layouts, with rotations, reflections, piece order, and initial orientation variations. Layouts can recur; these are not 365 unique authored puzzles. Every generated arrangement has a known solution. Different placement orders can produce different scores.
- **Cross:** clear at least one row and one column in the same move. The line award doubles.
- **Streak:** clear on consecutive placements for an increasing bonus.
- **Undo:** take back the last placement, including its clears, score, streak, hand, and future seeded draws. You cannot undo twice in a row; the next placement enables another undo. Rotation is free.

There is no timer. Daily failures can be retried with the same pieces. Switching modes preserves both boards independently. A completed daily puzzle has a victory screen and a check mark on its mode button.

| Input | Action |
| --- | --- |
| Click/tap a tray shape, then a board cell | Place the selected shape |
| Drag from the tray | Preview and place on release |
| 1 / 2 / 3 | Select a shape and focus the board |
| Arrow keys | Move the placement preview |
| R or Rotate | Rotate clockwise |
| Enter / Space | Place at the keyboard cursor |
| Z or Undo | Undo the last placement |
| M or speaker button | Toggle sound |
| ? button | Rules and scoring |

On a phone, swiping the board scrolls the page without placing a shape. Dragging from a tray shape controls the piece. Releasing outside the board cancels the drag.

## Scoring

- 5 points per square placed.
- 100 × total lines² for a clearing placement.
- A Cross doubles that line award.
- Add 50 × (consecutive clearing placements − 1).
- Add 500 when the board becomes empty.

The personal-best free-play score and completed daily score are separate. Undo restores the current score; an already-earned personal best is retained.

## Saves

`crossblock.profile` remains schema v1 and stores only `bestScore` and `muted`. The existing v1 profile fixture is unchanged. The new `crossblock.session` schema v1 stores both runs, active mode, latest daily completion, and a revision counter. Its sample is `tests/fixtures/crossblock-session-v1.json`.

Placement, rotation, undo, mode changes, and reset save immediately. Reopening the same file or URL restores both boards and the last undo. A new local day refreshes the daily puzzle on load or when the Daily puzzle button is selected. A daily already in progress does not change mid-move at midnight.

Saved runs are validated before use, including board dimensions, legal cell values, connected and normalized shapes, turn/hand counts, status, and one-level undo snapshots. Unknown versions, malformed data, and oversized saves are preserved. A newer revision from another tab blocks stale-session writes. Temporary play remains available, with an explicit on-screen status, if storage is blocked, full, protected, or stale.

Browser storage belongs to its browser profile and origin. Moving or renaming a standalone file, switching browsers, private browsing, or clearing site data can change or remove the available save. The game is not an account-synced service or installable PWA.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/contracts.js` | Board size and independent save identities |
| `src/sim/crossblock.js` | Pure seeded turns, fitting, rotation, simultaneous clears, scoring, undo, mode endings |
| `src/sim/crossblock-puzzles.js` | Valid dates and reproducible, provably solvable daily layouts |
| `src/crossblock-main.js` | Input, modes, dialogs, local-date boundary, persistence coordination |
| `src/crossblock-view.js` | Read-only DOM rendering, placement preview, event effects, announcements |
| `src/crossblock-audio.js` | Optional local Web Audio synthesis; master gain mutes scheduled tones |
| `src/crossblock-storage.js` | Unchanged profile v1 boundary and cross-tab best-score merge |
| `src/crossblock-session.js` | Session v1 validation, exact resume, future-data and stale-tab protection |
| `scripts/build-crossblock.mjs` | Dependency-free standalone HTML bundling |
| `tests/browser-crossblock.js` | Reusable Playwright acceptance, resilience, and touch checks |

Simulation has no wall clock, DOM, renderer imports, or unseeded randomness. Each placement advances one turn. Only the simulation mutates game state; rendering and audio consume state/events. No other game's save namespace is read or written.

## Verification from this development pass

**CROSSBLOCK: 26 Node tests pass.** These cover placement bounds and overlap, invalid action keys, rotation, read-only previews, row/column and simultaneous Cross clears, intersections, scoring, streaks, empty boards, game over, exact undo/RNG restoration, seeded playthroughs, profile/session validation, stale tabs, and standalone JavaScript/assets.

Daily checks generated and solved **365 dates** plus all six shape orders for 12 dates. These are solution/invariant tests, not a claim that all arrangements are distinct or equally difficult.

**Actual Chromium browser acceptance passed through Playwright in `node_repl`:**

- Mouse selection, legal placement, overlap rejection, ghost previews, dragging, and undo.
- Keyboard selection, four-rotation cycles, arrow positioning, Enter, and restoring undo after reload.
- Help, Escape, cancelled reset, reset, daily victory, completion reload, and switching back to the untouched free-play board.
- Free-play runs reaching game over through real inputs, then undo recovery and replay. Recorded runs included 55 and 73 placements with row and column clears.
- A controlled Cross fixture verified the 15-cell intersecting preview, 810-point total, two cleared lines, celebration, normal-motion cleanup, and undo.
- Browser storage denial, malformed saves, future profile/session versions, stale-tab overwrite prevention, and local-midnight daily rollover.
- Touch-emulated taps, touch dragging, cancelled drops, scrolling without accidental placement, and resume.
- Widths 320, 390, 768, 900, 1280, and 1440: no horizontal overflow. At 390×844, the board, tray, and rotation/undo controls fit within the viewport.
- No page errors in these runs. The standalone version made **zero HTTP requests**.

The unbundled source version also passed the browser suite with Playwright fulfilling local module/CSS requests. This verifies browser integration without requiring a listening development server. It is not a claim that the local HTTP server ran successfully.

The project JavaScript check and release build passed. The broader repository test snapshot reported **229 passing / 2 failing**: an unrelated Last Light build-count assertion (`10 !== 7`) and the static-server test blocked by the execution environment's `listen EPERM` restriction. Other game development was active in the same workspace; this is a snapshot, not successful CI or a claim that the repository is clean. No GitHub publication or release was performed.

Browser JSON results and screenshots are under `output/playwright/crossblock/` (ignored development evidence). The game remains playable without those files.

## Reproduce

```sh
node --test tests/crossblock.test.js tests/crossblock-daily.test.js tests/crossblock-build.test.js
npm run check
npm run build
```

The host's default Node 25 installation had a missing shared library; verification used the already-installed Node 22 runtime. This does not affect direct browser play.

For browser checks, load the installed Playwright package in `node_repl`, launch an isolated Chromium browser, and import `tests/browser-crossblock.js`. Pass a file URL to `runCrossblockAcceptance(browser, url, dailyPuzzle, screenshotDirectory)`, `runCrossblockResilience(browser, url, createCrossblock)`, and `runCrossblockTouch(browser, url, screenshotDirectory)`. Supply `dailyPuzzle` and `createCrossblock` from the simulation modules. The harness uses fresh browser contexts and never touches a normal user browser profile. Screenshots are optional; create the output directory first.
