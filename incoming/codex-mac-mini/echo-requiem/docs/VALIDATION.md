# ECHO REQUIEM v0.1.0 validation

Verified November 3, 2026 (America/Chicago). These are observed results, not performance guarantees for other devices.

## Automated checks

- `npm test`: **61 tests passed, zero failures**.
- `npm run check`: **31 JavaScript files** passed syntax checking; seeded-randomness/time guard passed for simulation code.
- `npm run build`: passed; release contains only index.html, favicon.svg, and src/.
- `diff -qr src dist/src`: no differences.
- Independent specification and code-quality reviews approved after fixes.

Coverage includes same-seed replay, divergent seeds, swept collisions, projectile limits, exact Fork/history/recharge/immunity behavior, all upgrades, all acts/boss phases, simultaneous-death victory, full legal-input simulation run, input chords/focus, profile/schema safety, multiple-tab record protection, bounded renderer effects and immutability, audio lifecycle/voice limits, and the static server.

## Real browser acceptance

Playwright-controlled Chromium used real keyboard/mouse events and read-only game diagnostics. No health grants, skipped acts, accelerated game clock, forced wins, or world-state writes were used in the full runs.

- First run: seed 1776 reached final boss phase, then lost at tick 12791. Defeat UI and same-seed restart verified; restart reset score, health, Fork count, and tick.
- Second run: seed 1776 **won** at tick 12983 (3:36.38 simulation time), score 64,100, health 28, kills 180, echo kills 3, Forks 48. Selected damage and echo upgrades. All three acts, both upgrade choices, and all three boss phases were observed.
- Right-click Fork while holding left fire verified in the actual game. A browser input harness also verified releasing left while right remains held immediately stops fire.
- Escape pause held the simulation tick steady. Blur paused play, cleared input, and resumed normally from the button.
- Real Back navigation reloaded the title normally. The browser did not retain this Web Audio page in BFCache; explicit persisted pagehide/pageshow events in the real page verified pause/restore/resume. An independent lifecycle harness verified three persisted cycles retain resources and one animation loop, followed by one final cleanup.
- Synthesized sound produced nonzero analyser output (RMS 0.00497); mute produced RMS 0. Audio context was running. The bundled clip includes actual synthesized game output; no claim of subjective listening review is made.
- Release build at localhost:4174 verified Play, movement, firing, Fork, pause/resume, and Reduced Motion at 1280×720 and 1024×768. Title/combat also inspected at 1440×900.
- Browser console: zero errors or warnings during acceptance.

Full-run evidence: [victory](validation/browser-victory.json), [defeat](validation/browser-defeat.json). Actual [gameplay clip](media/gameplay.webm), [gameplay frame](media/gameplay.png), and [victory screenshot](media/victory.png) are committed.

## Performance

Normal winning browser run, last 600 active frames: median frame interval10.0ms, p95 11.4ms.

Separate synthetic rendering stress test at 1440×900, DPR 1.5: 64 enemies, 512 projectiles, 2 echoes, continuously saturated 700 particles. Across 169 measured samples, renderer draw median 1.1 ms/p95 1.3 ms; presentation frame interval median 10.0 ms/p95 10.9ms/max 12 ms. This fixture measures rendering load; it is not presented as a normal gameplay run. [Raw evidence](validation/renderer-stress.json).

## Review fixes

- Corrected upgrade return values to event arrays.
- Corrected mouse-button chords, including releasing primary fire before secondary.
- Prevented pending audio unlock from restarting sound after focus loss.
- Preserved higher scores when another tab saves stale settings/results.
- Preserved inclusive two-second combo boundary at exactly 120 ticks.
- Preserved resources across cached page navigation and restarted one animation loop on restore.

## Limits

Desktop keyboard/mouse only. Chromium was exercised; Safari and Firefox have not received full playthroughs. No backend, public deployment, multiplayer, touch controls, cloud saves, or persistent campaign state. Frame timing is measured on this Mac and may differ on other systems. Browser audio still requires a user gesture.

## GitHub delivery

Private repository: https://github.com/KevinBigham/echo-requiem . GitHub metadata verified `isPrivate: true` and default branch `main`. Source, tests, plan/spec, handoff, screenshots, actual gameplay video, and raw validation evidence are tracked. The first published source commit `86f87541ab6d42e02610599cde0cf6b759cf9524` matched remote `main`; its [GitHub Actions run passed](https://github.com/KevinBigham/echo-requiem/actions/runs/41775053760). Final delivery also verifies the release tag, current remote head, clean working tree, and latest workflow state.
