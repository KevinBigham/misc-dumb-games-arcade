# PLEASE FEED THE MOON — Second Helping

You are a roller-skating toaster. The moon is your landlord. Rent is paid in teeth. The Sun from HR has concerns.

An original offline arcade game with Canvas characters, synthesized music, short runs, and increasingly absurd upgrade combinations. No accounts, libraries, downloaded fonts, or network assets.

## Play now

Open **`moon-play.html`** in a modern browser. Everything needed is embedded in that file. `npm run build` regenerates it and the identical release copy at `dist/moon.html`.

For source development, run `npm run dev` and visit **http://localhost:4173/moon.html**. SIDELINE remains the main entry point; ECHO REQUIEM remains at `/echo.html`.

1. Clock in. Hold **Space** to automatically aim and fire toast.
2. **WASD / arrows** to skate. Collect green teeth dropped by enemies.
3. Enter the moon’s dotted ring to pay rent. Pay three bills, choosing a promotion after each.
4. **Shift** dashes through danger. **E** unleashes a cosmic burp when charged.
5. Defeat the Sun from HR. Clock out, or keep your upgrades and volunteer for overtime.

Mouse aiming: point and hold the left button. **R** toggles automatic aiming and firing. **Esc / P** pauses, **1 / 2 / 3** selects a promotion, and **F** toggles fullscreen. Losing focus pauses a live run.

Touch devices have a movement joystick and dash/burp buttons, with automatic toast enabled initially. Portrait uses a camera that follows the toaster without stretching the artwork; landscape shows more of the arena.

Standard gamepad: left stick moves; right stick aims and shoots; A dashes; B burps; X or RT auto-aims while the right stick is idle; Start pauses. Use mouse, touch, or keyboard for menus. Play continues if the browser blocks the Gamepad API.

## Your bad ideas

| Toaster | Strength | Tradeoff |
| --- | --- | --- |
| The Original Sin | Balanced movement, firing, and five hearts | No special advantage |
| The Bread Runner | Fast skates, wider tooth collection, shorter dash cooldown | Four hearts |
| The Waffle Witness | Seven hearts and stronger slices | Slower movement and firing |

Every build is available immediately. **Daydream** adds two hearts and slows enemies, with an 0.8× score multiplier. **Night shift** is the default. **Fever dream** removes one heart, speeds up trouble, and awards 1.4× points.

## Twelve promotions

| Promotion | Effect |
| --- | --- |
| A second breakfast | Three slices per shot |
| Espresso possession | About 35% less time between shots |
| Dental magnetism | Wider pickup radius and remote rent deposits |
| Emotional support egg | Two extra heart slots and full recovery |
| Legally a crouton | Double toast damage |
| Carbonated thoughts | Faster burp charging and room-wide reach |
| Personal space bagels | Two orbiting bagels damage enemies and block bullets |
| Bread without borders | Slices pierce three distinct enemies |
| Return to bready | Slices bounce off two walls |
| Reverse customer service | Dashes reflect hostile bullets into damaging toast |
| The tooth fairy union | Every twelve deposited teeth restores a heart |
| Explosive resignation | Defeated enemies explode and can trigger chain reactions |

Upgrades combine. Offers are seeded and exclude promotions already held. After exhausting all twelve during overtime, a legally mandated lunch restores health and burp charge and awards 1,000 points.

## Colleagues and reality problems

Clocks chase you, mail fires pink slips, and fish from accounting absorb more toast. Shift two introduces charging chairs with visible direction warnings and linked teleporting doors. Shift three introduces telephones that mark a danger circle before it activates.

Six temporary laws alter play: slippery soup floors, bonus projectiles for both sides, a tiny fast toaster, room-wide tooth attraction, a moon that grows legs and moves its actual rent collection point, and bullet-reflecting dashes. A persistent label shows the active law and its remaining time.

The Sun has three attack patterns and becomes more aggressive below half health. Donated teeth damage the Sun too. Boss fights have no rent deadline. During ordinary shifts, unpaid rent costs one heart every fifty seconds and grants another deadline.

Overtime starts only after victory in free play. It preserves promotions and score, restores two hearts, and raises enemy pressure, health, and rent quotas. Each cycle ends in another Sun fight. It can continue across multiple cycles within the same run.

## Daily weirdness and the employee file

The daily challenge fixes the Classic build, Night shift difficulty, and seed for everyone using this release. It resets at midnight in **America/Chicago**. It has its own personal best and no overtime. These are local records, not a network leaderboard.

The employee file contains ten achievement badges, discovered enemy descriptions, promotion discovery counts, total Suns defeated, and separate difficulty and overtime records. Settings and records persist on the current browser/device. A live run does **not** resume after closing the page.

Replay preserves the run’s exact seed and configuration. A new free run rolls a new seed unless the address has `?seed=404` (any finite numeric seed, including `0`, is supported).

## Architecture and save contract

- `src/sim/moon.js`: deterministic 60 Hz simulation. Seeded RNG only; no browser APIs, dates, audio, or rendering.
- `src/sim/moon-content.js`: build, difficulty, upgrade, law, achievement, and enemy data.
- `src/contracts.js`: Moon limits and profile constants alongside existing game contracts.
- `src/view/moon-renderer.js`: read-only Canvas rendering, responsive camera, bounded cosmetic feedback.
- `src/moon-audio.js`: procedural sounds and music; capped at 32 simultaneous voices.
- `src/moon-main.js`: input, fixed-step scheduling, menus, accessibility, calendar boundary, persistence calls.
- `src/moon-storage.js`: validated profile transactions and deterministic daily seed hashing.
- `moon.html`, `src/moon.css`, `src/moon-icon.svg`: source presentation.
- `scripts/build-moon.mjs`: dependency-free bundler for a fixed list of known modules.

Gameplay caps: 44 enemies, 240 projectiles (enemy fire reserves capacity for player shots), 100 tooth drops, and 18 danger circles. The renderer separately bounds particles, floating words, and effect rings. Rendering and audio never mutate gameplay.

`window.__moon.inspect()` returns a cloned snapshot. It provides no gameplay mutation API. `tests/browser-moon.js` reads snapshots and sends ordinary keyboard events and button clicks; it never grants resources or edits simulation state.

Saved data uses **`please-feed-the-moon.profile`**, schema **v1**, with a fixture in `tests/fixtures/moon-v1.json`. This new namespace never reads or writes other games’ profiles. Future-version, malformed, and invalid saves are preserved byte for byte. Storage is re-read immediately before writes to protect against a stale tab overwriting a newer schema. If persistence is unavailable, play and session records continue. Browser handling of local HTML records can vary; a served origin provides a stable storage scope.

## Verification — November 8, 2026

### Automated checks

- **37/37 Moon tests passed**, covering determinism, terminal-state priorities, all promotions, upgrade combinations, piercing and bounce budgets, chain rewards, reflection, walking collection points, portal cooldowns, enemy warnings, overtime, entity bounds, immutable rendering, portrait pointer mapping, audio limits and late-resume handling, profile validation, protected saves, and standalone packaging.
- **`npm run check` passed**, including the simulation randomness/time guard.
- **`npm run build` passed** and produced portable and release copies.
- The complete project test run reported **219 passing and one failing**. The failure was the existing server integration test: this execution sandbox rejects loopback listening with `listen EPERM: operation not permitted 127.0.0.1`. The test was not skipped or weakened. Other concurrent game work may change the total count.
- Validation used `PATH=/opt/homebrew/opt/node@22/bin:$PATH`; the default Homebrew Node could not launch because a linked `simdjson` library was missing.

### Actual browser acceptance

Playwright loaded the exact generated standalone HTML into Chromium using a request-intercepted test origin because local server listening was unavailable. Canvas, DOM, localStorage, audio setup, and input handling ran in a real browser. This verifies the artifact’s browser behavior; it does not claim deployment or successful filesystem navigation.

These runs completed through normal controls, including all three promotion screens and the boss. Playwright advanced the browser clock; the pilot only observed state and generated input.

| Mode / build | Seed | Outcome |
| --- | --- | --- |
| Daily, Classic / Night shift, Chicago date 2026-11-07 | 2380882395 | Won; 19,745 points; portal used; daily score saved; overtime correctly absent |
| Free, Courier / Daydream | 3070318342 | Won original shift and overtime 1; 30,760 cumulative points; six upgrades; two Suns; walking moon encountered |
| Free, Waffle / Fever dream | 2334784465 | Won; 37,520 points; six burps; portal used; Fever achievement earned |
| Final portable build, Classic / Night shift | 0 | Won without damage; 15,920 points; 543 slices, four dashes, one burp; no runtime errors |

Additional completed browser checks:

- Score and badge persistence through reload, with the correct employee-file record.
- A synthetic version-99 save remained unchanged after settings changes and starting a game; session-only records remained usable.
- Touch at 390×844 moved the player, released correctly, fired automatically, and dashed. No horizontal overflow or runtime errors; portrait art retained its proportions.
- Simulated standard-controller movement, aiming/firing, dash, pause, and resume. A throwing Gamepad API did not stop simulation. **Physical controller hardware was not tested.**
- Fullscreen entry/exit, help and configuration dialogs, keyboard promotion selection, exact replay, pause and focus-loss pause, sound and reduced-motion controls, and a natural idle loss.
- Active desktop arena fit at 1366×768. Portrait stretching and an achievement-notification queue error found during browser testing were corrected and rechecked.

Screenshots: `docs/moon-second-helping-desktop.png` and `docs/moon-second-helping-mobile.png`.

No commit, push, CI run, or deployment is represented by these results.
