# STAMP DUTY: Executive Disorder

An absurd, school-safe office arena game about a sentient rubber stamp battling runaway paperwork. Clear four increasingly unhinged departments, survive management memos, and pass a final performance review with **The Auditor**.

## Objective

Slam forms to stamp and collect them, then carry the stack into the moving mint **OUT** tray to file it toward the department quota. Larger stacks widen later slams and score more points, but slow movement. Chain stamps into combos, finish quotas before losing all three reassignments, draft an upgrade after each department, and defeat the Auditor to win.

## Controls

- **WASD / Arrow keys** — scoot around the desk
- **Mouse** — aim
- **Hold and release left click / Space** — charge and slam
- **Escape / P** — pause or resume
- **R** — restart from a results screen
- **Sound and Pause buttons** — also work with the mouse

## Run locally

```sh
npm install
npm run dev
```

Vite forwards CLI host and port arguments, for example:

```sh
npm run dev -- --host 0.0.0.0 --port 7100
```

## Build

```sh
npm run build
```

The production build is packed into a single self-contained file:

```text
dist/index.html
```

Open that file directly in a modern browser. JavaScript and CSS are inline; gameplay requires no server, network requests, external fonts, or downloaded assets.

## Main systems

- Five form behaviors: standard, urgent, carbon-copy, classified, and golden
- Charge-and-release slam combat, carried stacks, moving OUT trays, combos, quotas, and deadlines
- Four departments with three-choice upgrade drafts
- Twelve management memos that alter movement, physics, hazards, scoring, or desk rules
- Staplers, coffee spills, a calculator, ceiling fan, hole, and an assistive duck
- Multi-phase Auditor boss with visible attack telegraphs
- Pause, mute, camera-shake setting, results receipts, victory, game over, and clean restart
- Seeded runs through `?seed=your-seed` when served over HTTP

## Implementation

The game uses React for mounting, Three.js for the 2.5D desk arena, and procedural Web Audio for effects and music. Models are constructed from Three.js primitives; form parts are merged into vertex-colored geometry to reduce draw calls. Particles, hit-stop, camera shake, squash, and recoil provide impact feedback without image or audio assets. The UI is responsive HTML/CSS layered over the canvas.

The build uses Vite, and `scripts/inline-build.mjs` packages the production JavaScript and CSS into the standalone HTML file.

## Saves and limitations

Best score, victories, sound, and camera-shake preferences are stored only in the current browser's `localStorage`. There are no accounts, cloud saves, analytics, or network features. Browser privacy settings or clearing site data can remove these records. Standalone-file storage behavior is browser-dependent, so HTTP preview is recommended for the most consistent persistence.
