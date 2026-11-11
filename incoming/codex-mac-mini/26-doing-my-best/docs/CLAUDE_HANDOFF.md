# Claude Code handoff — ECHO REQUIEM

## Delivered behavior

Complete deterministic browser action game: three 60-second acts, two seeded upgrade choices, a three-phase Choir boss, victory/defeat/retry, tactical 4-second Fork ghosts, dash, bounded combat, procedural cathedral visuals, synthesized score/effects, responsive menus/HUD, reduced motion, mute, and save-safe local settings/records. No dependencies or remote assets.

## Where to work

- `src/contracts.js` defines the shared field/API contract.
- `src/sim/world.js` owns tick order; `combat.js` owns damage/projectiles/enemies; `timeline.js` owns Fork recording/playback; `content.js` owns acts/upgrades/boss; `rng.js` owns gameplay randomness.
- `src/view/renderer.js` and `effects.js` only read simulation state. Geometry/glows are cached; cosmetic randomness is separate.
- `src/main.js` integrates fixed-step clock, input, UI, audio, profile, focus and cached-page lifecycle.
- `src/storage.js` protects unknown schemas and merges higher scores from another tab. The v1 fixture is `tests/fixtures/profile-v1.json`; no mid-run state is saved.
- `Play.command` is a convenience macOS launcher. `npm run dev` remains the portable launch command.

## Verification

`npm test`: 61/61; `npm run check` passes; `npm run build` passes. Specification review and code-quality review approved. Normal browser victory and defeat/retry were observed. See `VALIDATION.md` and raw JSON evidence for the exact test scope and performance numbers. Test-only browser snippets live in `tests/browser-pilot.js` and `tests/browser-stress.js` and are excluded from the static release. `window.__echoRequiem` only returns copied/read-only diagnostic snapshots; it cannot modify gameplay.

## Tuning decisions

Boss health was raised from the initial 3,000 to 12,000 after the first pilot erased it in 10 seconds. The final fight lasts about 36–45seconds under strong accurate play; imperfect human aim can extend it. Ring/spiral/beam damage is 8/8/18. Sentries fire a three-shot fan for 10 damage each with 150 ticks between attacks. Consecutive kills maintain a two-second inactivity window; every 10 kills raises the multiplier, maximum 5.

Fork is strictly player-local: pose/history change, current health and battlefield do not. Echoes replay actual immutable emitted shots, never weapon-input logic or gameplay RNG. Their shots never become new history. Do not expand this into full-world rollback without a separate design.

## Remaining limits / useful next work

No known blocking defects remain from review. Full Safari/Firefox validation, gamepad support, and more enemy/upgrade variety are reasonable later tasks; none are required to run this release. Prefer measured feel/balance improvements to adding systems. Keep the repository private unless Kevin explicitly changes that instruction. Future profile changes require version bump, migration, and fixture update; existing records must never silently reset.
