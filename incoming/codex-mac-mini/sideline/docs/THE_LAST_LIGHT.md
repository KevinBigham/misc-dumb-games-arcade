# THE LAST LIGHT

An original offline survival game about what makes survival worth it. You defend an archive, bring strangers home, and can spend their memories to keep everyone alive. The person survives the sacrifice. Their story disappears from the record.

## Play immediately

Open **`dist/last-light-standalone.html`** in a modern browser. No server, installation, account, or internet connection is needed. Desktop keyboard and mouse are recommended; touch controls are also available.

For development, run `npm run dev` and visit `http://localhost:4173/last-light.html`. Build the portable edition with `npm run build`. SIDELINE remains the main entry point, and the other games retain their own saves.

| Control | Action |
| --- | --- |
| WASD / arrows | Move; approach green signals to recruit people, then lead them home |
| Automatic fire | Targets the nearest enemy |
| Hold left mouse button | Aim manually |
| Space / Dash button | Brief invulnerability and damage to enemies you pass through |
| E / Memory pulse button | Burn the oldest unprotected memory; clear ordinary enemies and hostile projectiles; damage the boss |
| Diamond beside a memory | Protect exactly one story from pulses and paid upgrades |
| Escape / P | Pause |
| J / The ledger | Read the named event record; time pauses |
| M | Toggle sound |
| Touch | Drag in the arena to move; tap Dash or Memory pulse |

## What changed in the expanded edition

- **Promises:** before starting, promise to preserve every memory, leave nobody outside, or decide in the moment. There are no hidden bonuses. The game records when a promise breaks and why.
- **People respond:** council witnesses react to your actual rescues, sacrifices, and losses. Each dawn includes a receipt for the night that just ended.
- **A stronger combat loop:** dash through enemies, collect gold sparks from defeated threats, and bring the sparks home to repair both yourself and the archive.
- **Wardens:** from the third night, these enemies scan unescorted people. A visible ring warns of an approaching redaction. Recruit the person or stop the Warden before the ring fills.
- **The Editor:** three named boss phases, radial projectiles, locked beam warnings, and reinforcements. A beam does not retarget after its warning begins. Dash through it, step aside, or cancel it with a pulse.
- **Consequences at the gate:** sealing the archive turns away six named people. Their absence appears in the ledger and ending, and breaks a promise to leave nobody outside.
- **Local continuity:** checkpoints, twelve previous endings, same-world comparisons, a daily world seed, and a downloadable record of your run.
- **Presentation and resilience:** narrow-screen layout repairs, real touch controls, reduced motion, bounded procedural sound, stale-tab protection, and graceful temporary play when saves are unavailable.

## Five nights, four councils

Each ordinary night lasts 45 simulation seconds. The fifth lasts at least 55 seconds and requires defeating the Editor. The total combat time is about four minutes; reading and choosing usually bring a run to around six minutes. Intermissions have no timer.

People must enter the central archive to count as rescued. Getting them to follow is not enough. People still outside at dawn remain named in the record. You lose if either the keeper or archive reaches zero health. Standing in the archive heals the keeper, and dawn restores 25 keeper health.

| Council | Choices |
| --- | --- |
| After night 1 | Split fire; larger healing sanctuary and repairs; burn one memory for faster fire |
| After night 2 | Larger, faster escorts; a defensive turret at the cost of movement speed; pulses heal keeper and archive |
| After night 3 | Stronger piercing shots; wider recruitment and rescue repairs; burn two memories for an orbital defense |
| After night 4 | Open the gate to more people and more danger; call a caravan at a health cost; close the gate, turn six people away, and strengthen the defenses |

Paid upgrades show whose memories they would consume. Protection applies to upgrades as well as emergency pulses. The separate arcade score rewards kills, chains, and rescues; it is not a morality score.

After defeating the Editor, broadcast the surviving stories into the world or keep the central archive. Neither option awards an ethical grade. The ending describes what happened, preserves a surviving memory, and asks a question. Retry the same world to see how different decisions change the result.

## Saves and privacy

`last-light.profile` is a separate version 1 profile. The game never reads or writes `sideline.franchise`, `echo-requiem.profile`, or another game's storage key.

Checkpoints are created at the beginning of a night, at councils, and at the final decision. **Reloading restarts the current night; it does not resume the exact mid-combat second.** The title and pause screen explain this. Starting a new run replaces the existing checkpoint, after the promise screen explains the consequence. Completed wins and losses clear the checkpoint and keep a result in the last-twelve history.

Unknown versions, malformed saves, and invalid checkpoints are preserved rather than overwritten. A stale tab cannot overwrite a newer tab's save. Storage failures leave gameplay available with a visible temporary-play notice. Saves belong to the browser and file/site location; moving the file or changing browsers may not carry them over. Download a run's text record to keep a portable copy of its outcome.

No accounts, analytics, remote assets, dependencies, or network services are used. All graphics and audio are procedural. The daily world uses the device's local calendar date; it is not an online leaderboard.

## Architecture

| Module | Responsibility |
| --- | --- |
| `src/contracts.js` | LIGHT rules, input/action contract, profile and checkpoint versions |
| `src/sim/last-light-data.js` | 36 original memories, promises, night text, and 12 upgrades |
| `src/sim/last-light.js` | Pure seeded 60 Hz simulation; validated decisions and endings |
| `src/sim/last-light-story.js` | Read-only witnesses, promise summaries, and factual run records |
| `src/last-light-storage.js` | Profile validation, safe-point checkpoints, concurrency protection |
| `src/last-light-view.js` | Escaped modal, council, history, and ledger markup |
| `src/last-light-renderer.js` | Canvas art and bounded effects; does not mutate gameplay |
| `src/last-light-audio.js` | Procedural audio; 18 transient voices plus three ambient tones; pause/mute race protection |
| `src/last-light-main.js` | Input, fixed-step clock, HUD, dialogs, downloads, visibility handling |
| `scripts/build-last-light.mjs` | Bundle the closed ten-module graph, CSS, and icon into one offline HTML file |

Simulation randomness uses the seeded RNG. Rendering and audio never consume it. World snapshots exposed for acceptance checks are clones, not mutable handles. Browser acceptance drives real keyboard, mouse, touch, and UI decisions; it does not write into the simulation.

## Verification

Run the project checks:

```sh
npm test
npm run check
npm run build
```

The expanded edition has **48 dedicated Node tests** covering deterministic replay, every upgrade, rescue accounting, protection, pulse cooldowns, dash immunity and collision damage, Warden captures and interruption, beam warnings and damage, locked aim, named gate consequences, promise tracking, paid-upgrade receipts, both endings, checkpoint replay, malformed/future saves, stale tabs, quota failure, rendering immutability, audio limits, and the offline bundle.

A separate balance survey runs twenty seeds through three routes in both difficulties. Run it with `node tests/last-light-balance.mjs`; it writes `output/last-light/balance.json`. The latest survey completed **120 of 120 runs** with a simple rescue-first pilot and checked save points, identity accounting, health bounds, and object limits throughout.

| Mode / route | Completed | Mean rescued | Mean burned | Mean left outside |
| --- | ---: | ---: | ---: | ---: |
| Standard / preserve | 20/20 | 22.0 | 0.0 | 6.0 |
| Standard / spend | 20/20 | 31.6 | 4.9 | 2.5 |
| Standard / rescue | 20/20 | 31.5 | 4.0 | 0.5 |
| Story / preserve | 20/20 | 22.0 | 0.0 | 6.0 |
| Story / spend | 20/20 | 30.8 | 4.0 | 3.2 |
| Story / rescue | 20/20 | 31.9 | 2.1 | 0.1 |

These are automated survival and balance checks, not evidence that human players will find every strategy equally easy or enjoyable. The pilot's movement decisions also vary with the threats, so reduced damage does not guarantee more rescues in every route.

The Playwright acceptance runner is `tests/browser-last-light-acceptance.mjs`. It uses an externally available Playwright installation without adding a game dependency. Pass its `package.json` path as the first argument; `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can override the browser binary. Results, screenshots, and downloaded ending records are written under `output/last-light/`. Its scope includes three complete input-driven runs covering all twelve upgrades and both endings, promise and memory actions, council and final-decision recovery, defeat and retry, local history and downloads, real touch dragging and action buttons, four viewport widths, save isolation, stale tabs, and offline `file:` play.

The machine's default Homebrew Node binary has a missing simdjson library. The installed Node 22 runtime was used to run the npm commands. No dependency or global machine setting was changed.

## Further playtesting

The next useful step is human play: do people understand that followers must reach the archive, can they recognize a Warden before it captures someone, does the third boss phase feel fair, and do they want to retry after seeing the ending? Record concrete moments of confusion or boredom before adding more systems. The game currently has one arena, a finite cast of 36 stories, and no multiplayer or online scores.
