# SIDELINE — Franchise Football

**Build a contender. Create a dynasty.**

A playable, independent football franchise management game inspired by the classic 2005 franchise era. Take control of an original team, make personnel and ownership decisions, and carry your franchise through seasons, playoffs, and the draft. This is the first playable foundation, not complete Madden 2005 feature parity.

## Play

No dependencies to install. Requires Node.js 22+ and a modern desktop browser.

```sh
npm run dev
```

Open **http://localhost:4173**. On macOS, double-click **Play.command** instead. If another app occupies that port:

```sh
npm run dev -- --port 4175
```

Start with the Chicago Grizzlies, or choose **Settings → Create new franchise** to select any team and a league seed. Your browser autosaves each decision. Use **Settings → Export franchise** for portable backups. Saves are specific to the browser and origin, including port number; import a backup when moving between development and release URLs.

## The franchise loop

1. Set your offensive system, defensive system, and training focus in **Game plan**. Run training once each week.
2. Manage the **Team roster**: promote players, extend expiring contracts, or release reserves. Open **Transactions** to sign free agents or propose player swaps.
3. Use **Simulate week** to play the entire league schedule. Review the final score, quarter scores, team statistics, and drive recap.
4. Follow division standings, postseason qualification, injuries, player statistics, and your league wire.
5. After the championship, extend players you want to keep. **Enter the draft** closes re-signing and processes aging, progression, retirements, and expirations.
6. Make seven draft selections. Computer teams pick between your turns. Fill remaining needs through free agency, then start the next season.

Owner decisions are always available. Ticket prices affect attendance; facilities increase capacity and concessions; coaching investments improve game preparation and training. Owner cash and salary-cap room are separate balances.

## Implemented systems

- 32 original teams in two conferences and eight divisions; 53-player starting rosters.
- 16 regular-season games in 17 weeks, including a common week-nine bye. Every team plays eight home games and eight away games.
- 12 playoff teams, first-round byes, reseeding, conference championships, and a league championship.
- Deterministic drive-level simulation influenced by available starters, strategy matchups, morale, coaches, and home field.
- Depth charts, injuries, weekly training, age-based development and retirement, contracts, cap space, and release/trade dead money.
- Free-agent signings and trade packages of up to three players per side across positions, with an eighth-week deadline, roster-depth protection, and team-specific player valuations.
- A live trade desk showing each side’s exact cap space, dead money, roster counts, and position-group changes, with a final review before any players move.
- A 280-player prospect class, limited scouting reports, estimated versus revealed grades, and a seven-round draft.
- Ticket prices, stadium upgrades, coaching investment, game revenue, operating costs, and fan approval.
- Standings, season stat leaders, game recaps, generated franchise news, and up to 100 seasons of championship history.
- Versioned campaign saves, import validation, portable JSON exports, future-version protection, and stale-tab write detection.

## Save safety

Football campaigns use **`sideline.franchise` schema v1**, an entirely new namespace. The existing **`echo-requiem.profile` v1** profile and fixture remain unchanged, so no migration from Echo Requiem applies. The football v1 sample is `tests/fixtures/franchise-v1.json`. Future football schema changes must bump the version and add an explicit migration and updated fixture.

Unknown or malformed stored campaigns remain untouched. The interface explains that play is temporary when browser storage is unavailable or protected. Exports preserve that temporary progress. A stale tab cannot overwrite a campaign modified by another tab. Import and new-franchise replacement require review through the interface.

## Validate and build

```sh
npm test
npm run check
npm run build
npm run dev -- --dir dist --port 4174
```

Open **http://localhost:4174** for the release build. `dist/` contains only static game files; serve it over HTTP. There are no package dependencies, remote assets, accounts, telemetry, or paid services. After the page loads, the simulation and decisions require no network access. This is a browser game, not a signed native application or an installable PWA.

Tests cover deterministic outcomes, schedule fairness, cap economics, player transactions, package valuation and atomic rejection, training, injuries and byes, playoffs, drafting, save protection, read-only rendering, escaped imported text, and a ten-season career with save/reload continuation. Browser acceptance modules are `tests/browser-franchise.js`, `tests/browser-franchise-ui.js`, and `tests/browser-franchise-trades.mjs`; they are excluded from releases. Import the first two modules' default functions or the third module's `acceptTradePackages(page, artifactDir)` and provide a Playwright page in a fresh disposable browser context.

See [the implementation handoff](docs/SIDELINE_HANDOFF.md) and [validation record](docs/SIDELINE_VALIDATION.md) for verification scope and next development slices.

## Architecture

- `src/contracts.js`: shared constants, positions, roster sizes, schema identity, and mutation ownership.
- `src/sim/franchise.js`: pure seeded league generation, football results, management actions, and career progression.
- `src/sim/franchise-data.js`: original teams and generated-player name pools.
- `src/franchise-view.js`: read-only HTML presentation.
- `src/franchise-main.js`: user actions, dialogs, save transactions, import/export, and navigation.
- `src/franchise-storage.js`: schema validation and browser storage boundary.
- `src/franchise.css`, `src/stadium.svg`, `src/sideline-icon.svg`: local presentation assets.

## Current scope

Game results use 24 alternating drives plus sudden-death overtime, not a snap-level football engine. Player totals are distributed from team production. There is no on-field player control, detailed playbook, draft-pick trading, negotiation market, relocation, broadcast radio, preseason exhibition schedule, or coach hiring carousel. Trade packages support up to three players per side; CPU teams evaluate your proposals but do not initiate deals or counteroffers. The schedule rotation uses fixed within-division pairing slots for its two extra conference games rather than prior-year placement. Playoff tiebreakers use win percentage, point differential, points scored, then stable team ID. These are explicit first-release simplifications.

The design reference is the franchise/owner-mode experience documented in the [Madden NFL 2005 manual](https://oldgamesdownload.com/wp-content/uploads/Madden_NFL_2005_Manual_Xbox_En.pdf). Sideline uses original league identities and presentation and is not affiliated with EA or the NFL.

## The Last Light

**Direct-play edition:** open `dist/last-light-standalone.html` in your browser after `npm run build`. No server or installation needed.

A separate original survival game at **http://localhost:4173/last-light.html**. Rescue people, defend the last archive, and decide which memories survive five nights. Move with WASD/arrows, auto-fire at nearby enemies, dash with Space, and burn a memory for an emergency arena-clearing pulse with E. Hold the mouse button for manual aim. Escape pauses.

Four intermissions offer distinct upgrades and moral tradeoffs. Protect one person's memory with the diamond in the human record. The final night introduces the Editor boss; survive the timer and defeat it to choose what happens to the archive. Story mode lowers incoming damage and spawn pressure. Touch dragging and on-screen dash/pulse buttons are available, though desktop controls are recommended.

Make a promise before the run; watch survivors respond to your choices. Dash through threats, carry repair sparks home, interrupt Wardens, and face the Editor’s three phases. Closing the final gate turns away six named people. Night-start/council checkpoints and the last twelve endings use a separate `last-light.profile` save. Retry the same seed, compare outcomes, download your record, or open `/last-light.html?seed=42` for a reproducible world. All graphics and audio are procedural; no new libraries, network assets, or services. [Design and validation notes](docs/THE_LAST_LIGHT.md).

## Echo Requiem

The existing action game remains playable at **http://localhost:4173/echo.html**. Its simulation, rendering, sound, profile storage, and Node tests are preserved. [Original game documentation](docs/ECHO_REQUIEM.md).

## Crossblock

**Open `crossblock-play.html` directly in a browser for instant offline play.** This self-contained version needs no server or installed Node runtime. Regenerate it with `node scripts/build-crossblock.mjs` or `npm run build` after changing the source.

**Make a little room.** Play the shape puzzle at **http://localhost:4173/crossblock.html**. Pick or drag one of three shapes onto an 8×8 board. Rotate freely, complete rows and columns, and clear both in one placement for a Cross bonus. There is no timer or gravity. In **Free play**, use all three pieces to receive another hand; the round ends when none of the remaining pieces fits in any rotation. In **Daily puzzle**, clear every starting block using exactly three shapes. The local calendar selects a deterministic, solvable arrangement. Retry freely; placement order can improve your score.

Click a shape, then click its top-left position on the board. Or drag from the tray; the preview shows the full shape before release. Keyboard: **1 / 2 / 3** select, **arrows** position, **R** rotate, **Enter / Space** place, **Z** undo the last placement, **M** sound. Undo restores the exact board, hand, score, and seeded draw state. A new placement unlocks another undo. The question-mark button explains scoring. Touch and reduced-motion layouts are supported.

Scoring: 5 points per square placed; 100 × lines² per clear; a Cross doubles line points; consecutive clearing placements add 50 × (streak − 1); an empty board adds 500. Best free-play score and sound preference retain **`crossblock.profile` v1**. A separate **`crossblock.session` v1** saves both boards, exact seeded draws, the last undo, and the latest daily completion. Switching modes or reopening the same file resumes your progress. Unknown or malformed saves remain untouched; storage failure permits temporary play. Stale tabs cannot overwrite a newer session. No new libraries or network assets.

Simulation: `src/sim/crossblock.js`; daily templates: `src/sim/crossblock-puzzles.js`; presentation: `src/crossblock-view.js`; input: `src/crossblock-main.js`. Sound and both storage boundaries use separate modules. Existing games and profiles are preserved. [Game guide and verification record](docs/CROSSBLOCK.md).

## Please Feed the Moon

A surreal arcade game: skate as a toaster, fight hostile office supplies, collect teeth, pay the moon's rent, and toast the Sun from HR. The Second Helping adds three builds, twelve upgrades, daily challenges, achievements, touch controls, and escalating overtime. Play at **http://localhost:4173/moon.html**, or open **`moon-play.html`** directly after building. The standalone build needs no server. [Controls, architecture, and verification](docs/PLEASE_FEED_THE_MOON.md).

Private project. No license to redistribute is granted by this repository.
