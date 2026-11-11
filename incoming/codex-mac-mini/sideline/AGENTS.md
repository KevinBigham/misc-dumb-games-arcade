# SIDELINE / ECHO REQUIEM

Desktop browser games. No external dependencies or network assets.
SIDELINE football franchise management is the main entry point. ECHO REQUIEM
remains available at `/echo.html`, with its original simulation and profile intact.

## Development
- Run `npm run dev` at http://localhost:4173.
- Validate with `npm test`, `npm run check`, and `npm run build`.
- Release preview: `npm run dev -- --dir dist --port 4174`.
- Simulation contracts live in `src/contracts.js`; update all consumers when changing them.
- `src/sim/` is pure deterministic logic. All randomness uses its seeded RNG, time uses fixed ticks. Never import browser APIs or presentation code into simulation.
- Renderer and audio consume events and read world state; they must never mutate it.
- Echo recordings contain emitted shots, not inputs that rerun weapon logic. Replay must not consume gameplay RNG or create recursive echoes.
- New mechanics require meaningful Node tests. Keep tests independent of the renderer.
- Profile changes require schema version bump, migration, and sample fixture update. Unknown versions must never be overwritten.
- Football campaigns use `sideline.franchise`, initially schema v1. Never mix
  campaign saves with `echo-requiem.profile`. Money is integer thousands of dollars.
- Football simulation advances in fixed weeks. UI templates only read state;
  decisions call simulation actions and pass validation before persistence.
- Explicitly stage paths; never use `git add -A`. Preserve unrelated user work.
- No new libraries without a two-sentence justification and a concrete need.

## Ownership
During a parallel build, only the lead edits contracts/main/tooling. Simulation, renderer, and shell/audio agents own their respective modules. Lead performs integration, reviews, and Git actions.

## Release
Keep the GitHub repository private. Verify remote commit equality and clean status. Do not describe a successful build, screenshot, or queued workflow as proof of completed browser acceptance or successful CI.
