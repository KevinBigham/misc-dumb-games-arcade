# PRISM PRESS

A neon 3D spatial pressure puzzler about seeing the fit before the board closes in. Place polyomino prisms on a 7×7 reactor, complete rows or columns to vent the core, and survive six increasingly demanding sectors. Victory unlocks Endless Overclock.

## Play

```bash
npm run build
npm run dev -- --host 127.0.0.1 --port 7100
```

Open `http://localhost:7100/`. The dev command serves the static production build from `dist/` and accepts `--host` and `--port` arguments.

## Controls

- **Mouse / touch:** drag or tap a prism, then place it on the reactor.
- **1 / 2 / 3:** select a prism from the rack.
- **Arrow keys:** move the placement target.
- **R:** rotate the selected prism.
- **Enter:** place at the current target.
- **H:** hold or swap a prism; available once per rack.
- **Q:** arm a fully charged Pulse, then choose a 3×3 zone to erase.
- **P / Esc:** pause or resume.
- **M:** toggle synthesized music and sound.
- **Space:** start a run or restart after a run ends.

On-screen controls provide the same actions on touch devices.

## Systems

- Three-piece racks reward planning several placements ahead.
- Full rows and columns clear independently; simultaneous cross-clears score more.
- Clearing on consecutive placements builds the Flow multiplier, up to ×5.
- Clears cool the continuously rising core load. Reaching 100% ends the run.
- Placements and clears charge a 3×3 Pulse for emergency board recovery.
- Each sector raises the pressure and unlocks more complex prism shapes.
- Having no legal placement ends the run unless a charged Pulse can make room.
- Personal best score, furthest sector, and mute preference persist in browser-local `localStorage`. Records do not sync between browsers or devices and are lost if browser data is cleared.

## Project

The shipped game is a frontend-only static site. TypeScript source modules under `src/game/` are transpiled to native browser ES modules; Three.js and `RoundedBoxGeometry` are copied locally into `dist/vendor/`. DOM-based menus and HUD surround a Three.js scene with instanced rendering, pooled particles, responsive input, and synthesized Web Audio. No application server, account, database, or external save service is used.

```bash
npm run check       # TypeScript project check
npm run build       # emit dist/
npm run verify      # template browser smoke test (Playwright/Chromium)
```

The fuller regression suite covers placement, rotation, dragging, hold, pause, restart, line and cross-clears, combos, sectors, Pulse, deadlock, overload, victory, Endless Overclock, persistence, and mobile touch:

```bash
CHROMIUM_PATH="/path/to/chrome" node scripts/verify-full.mjs
```

See [CREDITS.md](CREDITS.md) for third-party notices. This project is configured for local preview; it has not been publicly deployed.
