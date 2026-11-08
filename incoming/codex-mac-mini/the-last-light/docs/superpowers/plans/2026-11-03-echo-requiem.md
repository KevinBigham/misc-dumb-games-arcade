# ECHO REQUIEM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Execute the checklist with separate ownership for simulation, presentation, and audio/UI. Review specification compliance before code quality.

**Goal:** Build a polished, replayable browser shooter where your past actions become armed allies, and deliver it in a verified private GitHub repository within a two-hour implementation sprint.

**Architecture:** Deterministic 60Hz simulation, independent Canvas2D renderer, synthesized audio, accessible DOM menus. Three agents own independent subsystems; lead owns contracts, integration, release, and browser validation.

**Tech Stack:** Native JavaScript ES modules, Canvas2D, Web Audio, Node built-in tests. No external dependencies.

---

Approved design is in `../specs/2026-11-03-echo-requiem-design.md`; exact field/function contracts are in `../../../src/contracts.js`.

## Task 1: Foundation (0–10 min, lead)
- [x] Save plan/spec and initialize `codex/echo-requiem` in this empty dedicated workspace.
- [x] Freeze contracts; create native dev/test/check/build tooling and allowlisted static build.
- [x] Verify the minimal shell, then explicitly stage and commit files.

## Task 2: Combat foundation (10–35 min, simulation agent)
Files: src/sim/rng.js, world.js, combat.js, content.js; tests/determinism.test.js and combat.test.js.
- [x] Write failing repeatability/movement/collision tests; run `node --test tests/determinism.test.js tests/combat.test.js` and confirm expected failures.
- [x] Implement seeded RNG, player movement/rifle/dash/immunity.
- [x] Implement rushing, ranged, and telegraphed charging enemies; swept projectile collisions.
- [x] Run tests to green; request spec and quality reviews; lead commits explicit paths.

## Task 3: Visual identity (10–40 min, presentation agent)
Files: src/view/renderer.js, effects.js.
- [x] Build cathedral arena/eclipse and recognizable solid silhouettes.
- [x] Add resizing, world conversion, interpolation, cached glows and effects.
- [x] Add ghost/history/landing preview, attack telegraphs, boss geometry and act changes.
- [x] Inspect live gameplay at 1280×720 and 1440×900, including reduced motion.

## Task 4: Audio/UI/profile (10–40 min, shell agent)
Files: src/input.js, ui.js, audio.js, storage.js, style.css; tests/storage.test.js; tests/fixtures/profile-v1.json.
- [x] Write red storage tests, implement version1 profile and fixture, verify green.
- [x] Build title/HUD/pause/upgrade/results controls and input edge handling.
- [x] Synthesize music and sound effects with user-gesture unlock, bounded voices, mute/suspension.
- [x] Browser-check all controls and audio lifecycle.

## Task 5: Fork (35–55 min, simulation agent)
Files: src/sim/timeline.js, world.js; tests/timeline.test.js.
- [x] Write red tests for history, charge use, order, shot replay and invariants.
- [x] Implement 240-frame immutable history, two charges, recharge and echoes.
- [x] Verify no health/world rollback, recursive ghosts, duplicate hits/rewards or RNG replay drift.

## Task 6: Full run (55–75 min, simulation + lead)
Files: src/sim/content.js, world.js; tests/content.test.js.
- [x] Write red progression/upgrade/boss/terminal tests.
- [x] Implement three acts, six upgrades, boss phases and result/retry flow.
- [x] Verify complete winnable run. Freeze mechanics at minute75.

## Task 7: Polish/validation (75–110 min, lead + reviewers)
- [x] Tune movement, pressure, damage and tactical Fork through real play.
- [x] Verify pause/focus/resize/mute/upgrade/restart; finish transitions and feedback.
- [x] Complete a normal browser run plus separate defeat/edge scenarios.
- [x] Stress-test frame rates; reduce cosmetic effects before gameplay.
- [x] Spec review, then quality review; fix blocking findings.
- [x] Capture screenshot and record measured validation.

## Task 8: Delivery (110–120 min, lead)
- [x] Finish README, CI, validation and Claude handoff.
- [x] Run `npm test`, `npm run check`, `npm run build`, and `npm run dev -- --dir dist`.
- [x] Explicit-file commits, main at validated HEAD, private KevinBigham/echo-requiem repo and v0.1.0 tag.
- [x] Verify private flag, remote/local SHA equality, clean status, CI result/state.
- [x] Deliver local address, private URL, screenshot, checks and limitations.

## Acceptance and defaults
Same seed/600 ticks deterministic; divergent seeds; partial/full history; exact echo shots; no rollback/recursive echoes/duplicate rewards; swept collision; dash expiry; unique seeded upgrades/all six effects; boss phases and simultaneous-death victory; robust profile reads. Browser full loop and restart must work. Target 60fps/no sustained <45fps on current Mac; measure rather than assert. Desktop keyboard/mouse only; no backend/public deployment/multiplayer. Cut ambient decoration before core play, boss, echo, restart, tests or private archive. No mid-run saves. Future profile changes require version/migration/fixture.
