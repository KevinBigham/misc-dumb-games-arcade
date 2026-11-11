# STAMP DUTY: OVERQUALIFIED

A school-safe, single-player arcade game about a spring-loaded rubber stamp whose management keeps rewriting physics.

## Objective

Launch into fleeing forms to stamp them, carry the growing stack to the blue **OUT** tray, and meet each department's quota. Forms that reach their deadline cost an incident; three incidents end the shift. Clear four departments, choose a promotion after each, then stamp the five-stage Final Audit to win.

## Controls

- **Mouse** — aim
- **Hold and release left click / Space** — charge and launch
- **WASD / arrow keys** — scoot and make small corrections
- **Escape** — pause / resume
- **R** — instant restart
- **M** — mute / unmute

Overcharging produces an unpredictable launch. Every third management memo is helpful. Sound, screen shake, best score, and shift records are controlled or persisted locally; no data leaves the browser.

## Run

```sh
npm run dev
```

Build and verify:

```sh
npm run build
node scripts/verify-game.mjs
```

The build produces **`dist/index.html` as a single self-contained offline file** with all CSS, JavaScript, procedural art, and Web Audio embedded. It can be opened directly without a server. The development/build tooling requires Node; playing the built file does not.

## Systems

- Charge/launch/stamp/bank loop with triangular stack rewards and combo scoring
- Fleeing memos, zig-zagging urgent forms, heavy tax forms, and a telegraphed audit boss
- Stack weight, moving OUT trays, deadlines, desk-prop collisions, duck bonuses, and paper-policy hazards
- Sixteen stackable physics memos, deterministic seeded randomness, and eight functional upgrades
- Title, play, pause, promotions, victory/game-over incident report, and instant restart
- Fixed 60 Hz simulation, bounded entities and particle pools, resolution-independent Canvas2D rendering
- Procedural Web Audio effects and adaptive music; defensive versioned `localStorage`

## Assets

All visuals and sounds are generated in code. No external art, fonts, audio, tracking, accounts, servers, or runtime dependencies are used. Reused infrastructure: the local `game-3d` template's React shell and fixed-timestep `GameLoop` (supplied with the Kimi game-building skill).
