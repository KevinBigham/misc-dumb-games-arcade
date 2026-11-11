# Claude Code handoff — SIDELINE

## Delivered behavior

The root page now runs an original football front-office game with a complete playable career loop: 32 teams, 53-player rosters, 16 games, playoffs, a champion, re-signing, aging/progression/retirement, seven draft rounds, free agency, and the following season. Every displayed management control operates on the campaign. The existing Echo Requiem game is preserved at `/echo.html`.

There are no runtime dependencies or remote assets. Native ES modules and the existing Node static server/build toolchain are retained. The release is a locally served browser game, not a native executable.

## Plan completed

1. Preserve the existing game and isolate the football campaign.
2. Implement seeded league, roster, schedule, result, and season progression logic.
3. Add personnel management, coaching/training, scouting, drafting, and owner economics.
4. Connect all front-office views and decisions to the simulation.
5. Protect persisted campaigns and support portable import/export.
6. Verify probability/economy behavior and a decade of save-safe progression.
7. Exercise the normal UI through a season, draft, and next season in Chromium.

## File ownership and contracts

- `src/contracts.js`: appended football schema identity, roster positions/counts, and ownership contract. Echo contracts remain intact.
- `src/sim/franchise.js`: all gameplay mutations, using the existing serializable seeded RNG. The fixed tick is one league week; game drives also advance deterministically.
- `src/sim/franchise-data.js`: team identity and player-generation content.
- `src/franchise-view.js`: read-only templates; imported free text is escaped. No browser or presentation dependencies enter simulation.
- `src/franchise-main.js`: clone → action → validation → save → adopt transaction flow. UI errors remain visible within modal dialogs. New campaigns/imports explicitly replace only the football save.
- `src/franchise-storage.js`: initial v1 parser/validator, future-version and malformed-data protection, quota failure reporting, and stale-tab write protection.
- `src/franchise.css`, `src/stadium.svg`, `src/sideline-icon.svg`: responsive layout and original local SVGs.
- `index.html`, `echo.html`, `scripts/{build,serve,launch}.mjs`, `Play.command`, `package.json`: entry-point integration and preserved legacy game.
- `tests/franchise*.test.js`, `tests/fixtures/franchise-v1.json`, `tests/browser-franchise*.js`: new verification. The old browser pilot now uses `/echo.html`.

## Save schema impact

Initial football schema **v1**, key **`sideline.franchise`**. This is not an update to Echo Requiem's profile; that remains version 1 at `echo-requiem.profile`. No migration from the unrelated action-game preferences is appropriate. The full v1 fixture is checked in. Subsequent football state-shape changes require v2, a v1→v2 migration, and a new fixture while retaining the old fixture for migration coverage.

Money is integer $1,000 units. Initial cap is 95,000 and grows 4% per season. Initial roster salaries are scaled to legal team budgets; later signings/extensions use market valuations. Bonuses are included in annual cap charges and become a single remaining dead-cap charge upon release/trade. This intentionally simplified contract model must be migrated if replaced with multi-year bonus amortization.

All state needed for deterministic continuation is stored, including RNG state, stable player IDs, schedule, injuries, draft cursor, and scouting reports. The Season 10 test reloads after every year and verifies an identical continuation into 2015.

## How to test

```sh
cd /Users/tkevinbigham/Game
npm test
npm run check
npm run build
npm run dev -- --dir dist --port 4174
```

The tests should pass, the randomness/time guard should pass, and the release should open at `http://localhost:4174`. Use a fresh disposable browser context for each acceptance module; they intentionally play and replace a test franchise. `browser-franchise.js` and `browser-franchise-ui.js` now export default async functions taking a Playwright page. The former expects a fresh 2005 Chicago campaign and plays through 2006. The latter checks depth promotion, extensions, rejected signing feedback, accepted trades, downloaded exports, new-team creation, imported backups, and narrow viewports. `browser-franchise-trades.mjs` exports `acceptTradePackages(page, artifactDir)` for package previews, confirmation, persistence, conflict protection, layouts, and the deadline.

See `SIDELINE_VALIDATION.md` for observed results, distinct from code coverage or compilation claims.

## Risks and next slices

- This delivers a working first release, not complete Madden 2005 feature parity. Preserve the original-teams approach unless Kevin directs otherwise.
- The drive-level model is deliberately coarse. Advance to a snap-level simulation with formation/personnel matchups, down/distance, play clocks, special-teams skill, and earned player statistics before claiming football realism.
- The common bye and fixed-slot extra conference pairings are scheduling simplifications. Replace with staggered byes and prior-season placement while keeping eight-home/eight-away and no-double-booking tests.
- CPU teams draft by estimated grade/position needs and fill rosters at season start. They do not negotiate, execute autonomous in-season trades, or compete for players in a bidding window.
- Trades support up to three players per side, including cross-position and unequal-count packages. Draft-pick trading, counteroffers, autonomous CPU trades, and future-year cap projections remain future work.
- Ownership covers tickets, facilities, staff quality, fan demand, and cash. Stadium relocation, coach hiring/firing, owner goals, and job security remain future work.
- Player morale is numerical and linked to winning/training/contracts; there are no personality traits, holdouts, or individual storyline branches yet. News is generated from actual franchise events, without radio/audio.
- Records retain 100 seasons of championship/user summaries; completed schedules and individual season stats are replaced each year. Historical player careers, awards, records, and Hall of Fame require a deliberate archive design and save migration.
- No Safari/Firefox/gamepad acceptance or packaging/signing as a native app was performed. Desktop Chromium and responsive layouts were checked.
- Changes are local. No commit, remote push, PR, CI run, or production deployment is implied by this handoff.

## November 8 expansion — package trade desk

`evaluateTrade` is a read-only deterministic preview. `tradePackage` rechecks all rules before making any mutations; `tradePlayers` remains a single-player compatibility wrapper. Trading is open through regular-season week eight and during offseason/preseason. Each team retains the bonuses attached to the players it sends as dead cap; transferred bonuses become zero so they cannot be charged twice. Players keep their contracts, injuries, morale, and season stats and join the bottom of their new depth chart.

Both rosters must remain within 53 players and the salary cap. No position may fall below the lesser of its current count and required starting count, allowing an existing offseason shortage without letting a trade worsen it. Selection IDs must be unique, owned by the user on one side and a single partner on the other, with one to three players per side.

Package valuations use a convex transformation of the existing age/rating/injury/contract/salary value. The receiving club weights starter upgrades above depth additions, evaluated in a stable order. Its required value equals the outgoing package's value plus three points. This is a transparent game heuristic, not an NFL trade-market model. Tests explicitly guard against three low-grade reserves buying a young elite starter.

The UI provides three slots per side, partner needs, value feedback, exact dollar cap/dead-money projections, roster counts, and best-unit rating changes. Previewing and canceling never persist. Confirmation uses the existing clone/validate/save/adopt transaction, including concurrent-tab protection. Changing the partner clears incoming selections, and selection rerenders preserve keyboard focus. No saved fields changed: schema v1 and the original fixture remain intact. No runtime dependencies were added.
