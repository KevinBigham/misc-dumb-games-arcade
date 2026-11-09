# DESIGN CONTRACT — GAME 12: OROBOROS: THE PINBALL SINGULARITY (`12-astral-pinball`)

## 1. Core Loop & Genre Fusion
- **Genre:** Relativistic Pinball-Roguelike × Orbital Alchemist × Multiplicative Synergy Engine
- **Primary References:** *Space Cadet 3D Pinball* · *Balatro* (Chips × Mult × Relic Synergy Engine) · *Peglin*
- **Supporting References:** *Into the Breach* (Deterministic Trajectory Preview) · *Outer Wilds* (Orbital Gravity Slingshots) · *Arkanoid* (Active Parry Deflection)
- **One-Sentence Core Loop:** Launch relativistic star-comets into a customizable cosmos of prism splitters, gravity wells, and Tesla bumpers, actively deflecting them with twin plasma flippers and magnetic pulses to shatter 5 Cosmic Boss Constellations in multiplicative `Chips × Mult` chain reactions.
- **Playable in < 2 Seconds:** Opens directly onto the live 60fps interactive Pinball-Cosmos table with a comet loaded in the launcher, a real-time relativistic trajectory preview, and immediate mouse/keyboard aiming and flipper controls.

## 2. Signature Consequential Tradeoffs
1. **Aether Flux Economy (Immediate Tactical Verbs vs. Compound Stardust Interest):**
   - `[E] Magnet Pulse (25 Flux)` curves all in-flight comets toward the Boss Core or nearest bumper cluster and adds `+0.8× Combo Mult`.
   - `[Q] Chrono-Overdrive (30 Flux)` slows enemy hazards to `35%` speed, empowers active comets with `+25 Base Chips`, and auto-tracks the Aegis Deflector.
   - `[F] Supernova Multiball (45 Flux)` ignites all active comets into piercing Supernova state and spawns an immediate twin comet.
   - **Tradeoff:** Unspent Aether Flux converts into bonus **Stardust Interest** at the end of each volley (`+1 Stardust per 5 Flux banked`), funding Tier-3 Socket Nodes and Astral Relics.
2. **Board Socket Topology (Upper Offense vs. Lower Survival):**
   - Wiring **Bifrost Prism Gates** and **Tesla Pylons** into upper sockets splits comets early and chains lightning directly into Boss Armor Nodes, but leaves the bottom drain channels exposed.
   - Wiring **Ouroboros Wormholes** and **Kerr Gravity Wells** into lower sockets rescues draining comets and slingshots them back to the zenith, at the cost of upper-table damage density.
3. **Flipper Parry Risk/Reward:**
   - Timing a Flipper Swing (`Space` / `A` / `D` / `←` / `→`) within the `150ms` Perfect Parry window as a comet or Boss Void Lance hits the flippers triggers a Hit-Stop freeze, multiplies `Combo Mult` by `×1.22 + 0.4`, ignites the comet into **Supernova State**, and reflects enemy Void Lances back at the Boss Core for `185` base damage.

## 3. Verification, Determinism & Modern Web Architecture
- Pure deterministic simulation boundary (`src/simulation.ts`) powered by `SeededRng` (`src/rng.ts`) with zero DOM dependencies.
- Versioned local persistence (`src/persistence.ts`) with idempotent run-completion tracking.
- Deterministic 3-Archetype Counterfactual Simulator (`runAstralCounterfactuals`) comparing *Kepler Trajectory Sniper*, *Bifrost Multiball Alchemist*, and *Hawking Flipper Virtuoso* on the exact same seed.
