# SIDELINE validation — November 4, 2026

## November 8, 2026 — package trade desk

The following is new observed verification; the November 4 record below remains historical.

- Full `npm test`: **275 passed, 0 failed**, including 16 new package-trade tests and the preserved games' suites.
- `npm run check`: **115 JavaScript files checked** on the final check, simulation randomness/time guard passed.
- `npm run build`: passed.
- `git diff --check`: passed. Existing unrelated working-tree changes were preserved; no Git staging, commit, or push was performed.
- Football schema remains **v1**. A package made from the original v1 fixture survives export/parse and produces the same subsequent week as an uninterrupted campaign.

New simulation tests cover exact cap/dead-money math on both sides, one-for-two/two-for-one/three-for-three packages, cross-position trades, unique ownership, selection-order determinism, roster ceilings, position minimums and existing shortages, exact-zero cap space, last-thousand-dollar rejection, stale previews, phase/deadline gates, team-specific value, elite-player pricing, repeat-trade bonus accounting, escaped text, and read-only previews.

`tests/browser-franchise-trades.mjs` passed in isolated desktop Chrome on both the development source and built release. All campaign changes came through ordinary UI controls; storage reads and pure simulation previews supported assertions only. It verified:

1. A full-roster one-for-two offer is blocked with an explanation, without changing the save. Duplicates are unavailable; changing partners clears incoming players; clearing a package works; selectors retain keyboard focus.
2. A declined offer displays its value gap and cannot be submitted.
3. Releasing a reserve makes room for a one-for-two deal. Review and cancellation preserve the campaign. Final confirmation moves exactly the selected players, books the projected salary/dead money, updates both roster counts, and survives reload without consuming RNG.
4. The builder and review dialog fit at **390, 768, and 1440 px** without horizontal overflow.
5. Another tab runs training while a trade is under review. Confirming the stale trade preserves the newer save and displays the conflict inside the modal.
6. Ordinary weekly advancement reaches week nine, closes the trade window, and disables player selections.

Both existing browser acceptance modules were also rerun on the built release. The management module passed promotion, extension, rejected full-roster signing, accepted single-player trade, JSON download, new-team creation, import, and responsive layouts. The season module passed strategy/training, free agency, scouting, ownership, recaps, all regular-season/playoff weeks, seven user draft picks within the 224-pick league draft, and the 2006 season start. These runs reported **zero page errors**; the package acceptance also reported zero console errors.

Evidence is under ignored `output/playwright/`: `sideline-trade-acceptance.json`, `sideline-trade-desktop.png`, and `sideline-trade-mobile.png`. Screenshots supplement the action-based checks. Development/release acceptance used local ports 4186/4187; the playable source server was then started at the usual `http://localhost:4173`.

Environment note: the machine's default Homebrew Node 25 executable fails to load `libsimdjson.31.dylib`. Verification used the already-installed Node **22.23.1** at `/opt/homebrew/opt/node@22/bin/node` with that directory first in `PATH`. No global runtime, package installation, or dependency change was made. Safari/Firefox, remote CI, publication, and remote commit equality were not evaluated for this local development slice.

## Automated checks

- `npm test`: **83 passed, 0 failed**. Includes 61 preserved Echo Requiem tests and 22 new franchise/save/view tests.
- `npm run check`: **41 JavaScript files checked**, simulation randomness/time guard passed.
- `npm run build`: passed; static release generated in `dist/`.
- `git diff --check`: passed.

The franchise suite exercises 12 schedule rotations; every club has 16 games, eight at home and eight away, six division games, and no double bookings. It also checks seeded probability behavior, salary-cap accounting, rejected transaction atomicity, contract rollover, injury recovery through byes, playoff qualification and reseeding, seven draft rounds, and portable save continuation. A ten-season career completes through the start of 2015, reloading each season, then produces the same next week as an uninterrupted copy.

Save tests preserve unknown versions, malformed existing data, Echo profiles, and concurrent-tab progress. Rendering tests confirm read-only behavior and escaping of imported text.

## Observed browser acceptance

Chromium was driven through ordinary UI actions. Storage reads were used for assertions, not to advance or alter the campaign.

### Development site, localhost:4175

`tests/browser-franchise.js` passed:

- Selected West Coast offense, Cover Two defense, and offensive training; saved and completed weekly practice.
- Released a reserve quarterback, then signed a free-agent quarterback into the open roster spot.
- Scouted a prospect; changed ticket price; invested in coaching.
- Simulated a week, opened its score/quarter/drive recap, and reloaded with the new week intact.
- Advanced the full regular season, bye, playoffs, and championship to the offseason.
- Selected seven rookies as CPU teams made their intervening picks; all 224 league picks completed.
- Started the 2006 regular season, week one, with one completed season in franchise history.
- Opened every navigation screen; **zero page errors**.

### Built site, localhost:4174

`tests/browser-franchise-ui.js` passed:

- Promoted a quarterback and extended an expiring contract for three additional years.
- Attempted a signing with a full roster and observed the explanatory error inside the player dialog.
- Completed an accepted quarterback trade and verified both player assignments.
- Downloaded a JSON export, created a Seattle franchise with another seed, then imported the downloaded Chicago save and verified roster and RNG preservation.
- Checked Overview, Team roster, Scouting & draft, and Owner’s office at **390, 768, and 1440 px** wide; no horizontal document overflow.
- **Zero page errors**. Console inspection reported no errors or warnings.

Desktop and mobile screenshots were visually inspected for layout. These are supplementary evidence; the action-based acceptance above establishes functionality.

Local browser evidence is under ignored `output/playwright/`, including `ui-acceptance.txt`, `franchise-export.json`, `sideline-desktop.png`, and `sideline-mobile.png`.

## Defects found and corrected

- Generated initial salaries could exceed the cap. New teams now begin with legal salary budgets and cap room.
- Some later schedule rotations produced seven/nine home games. Extra conference matchups now use a directed cycle that preserves eight/eight every year.
- CPU draft sorting repeatedly scanned every roster. Position needs are now computed once per selection; the decade test completes in a few seconds.
- Injury recovery originally depended on playing a game. Existing injuries now recover on calendar weeks, including playoff byes.
- Modal errors needed their own live region because the native dialog occupies the top layer. Dialog errors are now visible and announced.
- Mobile icon-only navigation retains explicit accessible names and tooltips.
- Imported labels in news/game recaps are escaped and game IDs are validated before entering attributes.

## Release boundaries

This is verified as a local browser game. No remote commit, CI run, PR, production deployment, signed native executable, or Safari/Firefox acceptance is claimed. Echo Requiem's Node tests and route remain preserved; its prior full combat browser acceptance is documented separately and was not repeated as part of this football implementation.
