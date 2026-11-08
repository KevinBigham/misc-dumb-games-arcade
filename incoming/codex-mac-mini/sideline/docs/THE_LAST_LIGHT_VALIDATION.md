# THE LAST LIGHT — expanded-edition acceptance

Verified November 8, 2026. The portable deliverable is `dist/last-light-standalone.html` (147,195 bytes). This report describes local verification, not a deployed site, remote CI result, or a human enjoyment study.

## Project checks

- `npm test`: **259 passed, 0 failed**, including **48 Last Light tests**.
- `npm run check`: **110 JavaScript files checked**, seeded simulation/time guard passed.
- `npm run build`: **passed**, producing the offline portable edition and site build.
- `git diff --check`: **passed**.
- Deterministic balance survey: **120 of 120 runs completed** over twenty seeds, three routes, and both modes.

The installed Node 22 runtime ran the npm commands; the machine's default Node executable has a broken Homebrew dynamic-library reference. No global installation was altered.

## Browser acceptance

**Playwright: passed. Three complete runs, 23 recorded checks, zero uncaught page errors.** The runner used isolated headless Chrome and real keyboard, mouse, and touch inputs. Its virtual clock advanced the real animation loop. It read cloned world snapshots to guide a pilot; it did not mutate gameplay state or skip combat phases.

| Full run | Final decision | Rescued | Burned | Left outside | Promise |
| --- | --- | ---: | ---: | ---: | --- |
| Standard / fork → sentinel → precision → closed | keep | 22 | 0 | 6 | Kept |
| Standard / engine → mercy → erase → open | release | 32 | 4 | 2 | Broken |
| Story / shelter → caravan → magnet → beacon | release | 32 | 3 | 0 | Kept |

Together these runs exercised all twelve upgrades, all four councils, all three Editor phases, Wardens, beam warnings, and both final decisions. The same-world result comparison and downloaded text records were checked against the actual run.

Additional accepted flows:

- Keyboard rescue/delivery.
- Pause and ledger freeze.
- Protected memory pulse.
- Promise break.
- Restart cancellation.
- Blur auto-pause.
- Reload night-start recovery.
- Council reload recovery preserves protected memory.
- Run 1: download matches world 42.
- Run 2: download matches world 42.
- Final decision survives a browser reload.
- Run 3: download matches world 42.
- Loss records unresolved people exactly once.
- Loss is persisted.
- Same-world retry resets state and changes promise.
- 390/768/1440/1920px no horizontal overflow.
- Real touch drag.
- Touch dash.
- Touch memory pulse.
- Future save preserved in browser.
- Other game saves untouched.
- Stale browser tab rejected.
- Portable file starts and pauses without network assets.

## Issues found and corrected

- A sealed gate previously prevented people from spawning without recording the people refused entry. Six named people are now turned away, counted, and retained in the ledger and ending.
- The Editor could die before its later-phase beam attacks mattered. Its durability and phase timing were adjusted; all phases and beam warnings were observed during complete browser runs.
- Mobile grid minimum sizes let the story rail widen the arena and interfere with touch targets. The grid now shrinks correctly, and real drag/dash/pulse tests pass without horizontal page overflow at 390, 768, 1440, and 1920 pixels.
- Canceling a restart could leave combat paused without a resumable dialog. Cancellation now returns to the pause screen.
- A delayed browser audio resume could outlive a pause or mute request. Generation checks prevent it; paused effects are discarded and transient sound concurrency is capped.

## Evidence and limits

`output/last-light/acceptance.json` contains the completed browser report. That directory also contains desktop/mobile screenshots, each ending, the loss screen, downloaded records, npm logs, `balance.json`, and `build-manifest.json` with the tested source and portable artifact hashes.

The latest full browser pass used Chrome on macOS. Earlier basic Safari play was checked, but the expanded edition has not had a complete Safari, Firefox, or physical-phone campaign acceptance pass. Touch coverage used Chrome's mobile emulation with real dispatched touch events. Automated wins establish that tested routes are reachable; difficulty and emotional impact still need human playtesting.

No Git commit, push, public deployment, repository visibility change, or remote CI claim is part of this work. The existing workspace contains other concurrent games and unrelated changes.
