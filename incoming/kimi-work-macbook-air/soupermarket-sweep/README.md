# SOUPERMARKET SWEEP: Aisles of the Damned

A complete 3D arena-survival comedy about a haunted shopping cart full of legally questionable soup. The groceries are armed. Management wants a word. You have coupons and nothing to lose.

## Objective

Survive seven escalating aisles, defeat Baron von Breakfast and the Regional Manager, and become aggressively unemployable. Between aisles, choose one of fifteen stacking mutations. A separate Nightmare Shift and a permanent Golden Banana secret add replayability.

## Controls

- **WASD / arrow keys:** Move
- **Mouse:** Aim
- **Hold left click:** Fire soup
- **Space:** Dash with brief invulnerability; ram enemies and erase hostile shots
- **Q:** Existential Scream when the meter is full
- **E:** Haggle with the pink vending machine (12 coupons)
- **Escape / P:** Pause or resume
- **M:** Mute
- **1 / 2 / 3:** Choose an upgrade
- **R:** Restart from pause or an end screen
- **Touch:** Drag to move; aiming and firing are automatic, with dedicated Dash, Scream, Haggle, and Pause buttons

## Running locally

```bash
npm install
npm run dev
```

The development command builds the static game and serves it locally. CLI host and port arguments are supported, for example:

```bash
npm run dev -- --host 127.0.0.1 --port 7100
```

Production output:

```bash
npm run build
npm run preview
```

The self-contained static site is generated in `dist/`.

## Main systems

- Seven data-driven waves with five standard enemy behaviors and two multi-pattern bosses
- Soup projectiles with spread, piercing, ignition, and orbital/drone synergies
- Invulnerable dash ramming, projectile deletion, combo scoring, and a rechargeable crowd-control Scream
- Fifteen stacking upgrades plus a coupon-powered vending machine
- Telegraph rings, hit reactions, particles, camera shake, hit stop, and synthesized Web Audio effects/music
- Persistent best score, progress, quality setting, Golden Banana unlock, and Nightmare Shift via defensive `localStorage`
- Automatic quality reduction under sustained load and a manual graphics toggle

## Implementation

Three.js, TypeScript, native esbuild, and a fixed-timestep game loop, bundled as a dependency-light static site. Models and the supermarket are generated procedurally from parametric geometry. Projectiles, pickups, and particles use fixed pools and instanced rendering. All sound is synthesized locally; there are no remote assets, accounts, backends, or external leaderboards. Saves are local to the current browser and are lost if its site data is cleared.

## Verification

`node scripts/verify-full.mjs` tests the production build in Chromium on desktop and touch viewports, including title/help, movement, firing, pause/resume, sound/quality controls, upgrades, vending, bosses, secret persistence, game over, victory, restart, and mobile controls. It also captures key-state screenshots and reports busy-scene renderer statistics.
