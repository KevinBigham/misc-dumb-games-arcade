# Hardcourt source

Original offline basketball franchise simulation. The game source has no third-party runtime dependencies or network services.

## Run and build

Open `game/index.html` directly in a recent browser.

`python3 build.py` creates `dist/Hardcourt.html`, a single self-contained file. `python3 build.py --app` also creates `dist/Hardcourt.app` on macOS with Apple Command Line Tools installed. The Mac build compiles arm64 and x86_64 targets for macOS 13+, combines them with lipo, and signs the app locally. It is not an Apple-notarized distribution.

Build outputs in an iCloud folder can receive Finder metadata after signing. The ZIP distribution contains ordinary files without extended attributes. For distribution outside the local computer, sign and notarize the app with an appropriate Apple Developer identity.

## Source layout

- `game/engine.js`: Seeded league generation, possessions, season scheduling, statistics, injuries, player progression, financial operations, contracts, trade evaluation, AI transactions, playoff bracket, lottery, draft and save validation. Exposes `window.HC` in browsers and `module.exports` in Node.
- `game/app.js`: All UI views, local career slots, transaction forms, live game controls, import/export and native bridge.
- `game/styles.css`: Responsive styling and accessibility states.
- `native/Hardcourt.swift`: AppKit/WebKit shell, persistent website data store, native file dialogs and menus. No backend or remote content.
- `native/Hardcourt.icns`: Original application icon.
- `build.py`: Portable HTML bundler and universal Mac app builder.
- `qa/`: Node engine tests and Playwright browser playthrough.
- `DESIGN.md`: Design contract and product assumptions.

## Verify

Run `node qa/engine-test.cjs` and `node qa/edge-test.cjs`. The engine tests cover ten complete seasons, 600 selections, financial and roster invariants, deterministic simulations, contracts, trades and save round trips. Edge tests cover active-game transaction locks, recovery, deadlines and malformed save rejection.

For browser testing run `npm install --prefix qa`, then `node qa/browser-test.cjs`. The test uses the installed Google Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; adjust that executable path for another environment. It exercises a complete career through season two, all screens, live coaching, negotiation validation, scouting, staff and facilities, playoff progression, draft, persistent reload, export/import and mobile overflow.

The native app was manually verified through UI automation: career creation, live game, recorded result, native export and import, replacement confirmation, quit/relaunch and resumed game-day state. The QA build used a separate bundle identifier and save store.

## Simulation rules

Ratings are 25–99; positional weights determine overall. Potential guides development rather than guaranteeing it. Initial rosters have 14 players; the regular-season maximum is 15 and the offseason maximum is 20. Starting a season requires 8–15 players. The cap starts at $75M and grows 5% annually. Normal contracts require cap room; a $0.8M minimum exception is available. Returning-player rights allow re-signing above the cap after the Finals. Over-cap trade matching allows 125% of outgoing salary plus $0.5M. Roster transactions lock after game 60 and while the user's live game is active.

Each season schedules two full round robins plus 24 additional paired rounds, totaling 82 games and exactly 41 home dates per club. Teams are ranked by wins, point differential and team code. Four weighted lottery winners precede the remaining non-playoff teams in reverse standings order. The second round uses the same order. Four best-of-seven rounds determine the champion.

Management choices operate on the same simulation used by AI clubs. The owner confidence score is informational and never deletes or ends the career. Saves are versioned JSON. Imported saves are validated before local storage is replaced.
