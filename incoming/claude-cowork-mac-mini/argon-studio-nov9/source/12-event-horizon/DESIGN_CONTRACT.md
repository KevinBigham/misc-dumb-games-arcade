# 🪐⚡ DESIGN CONTRACT — GAME 12: EVENT HORIZON (SINGULARITY SLINGSHOT)

## 1. Core Identity & Lineage
- **Game ID:** `12-event-horizon`
- **Title:** **Event Horizon: Singularity Slingshot**
- **Subtitle:** *Relativistic Orbital Billiards, Bullet-Time Gravity Tether & Constellation Relic Deckbuilder*
- **Genre:** Kinetic Gravity-Pinball Action Roguelite & Trickshot Puzzle Sandbox
- **Primary Reference:** *Outer Wilds* (Miniature Orbital Gravity) · *Peggle / Pinball* (Harmonic Ricochet Combos) · *Balatro* (Multiplicative Relic Synergies)
- **Supporting Reference:** *Superhot* (Bullet-Time Aim Dilation) · *Geometry Wars / Loop Hero* (Constellation Polygon Enclosure) · *Katana ZERO* (Chrono-Rewind Echo Worldline)

## 2. The 12 Open-Source Game Design Principles Compliance
1. **One-Sentence Core Loop:** Dilate time to aim a relativistic orbital trajectory around a live Singularity, slingshot your Star-Breaker ship across musical Prism Bumpers to enclose laser Constellation Polygons that vaporize Void Armadas, rewind your own spacetime worldline to spawn a twin Phantom Echo, and draft multiplicative Astro-Relics across 5 cosmic sectors!
2. **Playable in < 2 Seconds:** Opens directly into Sector 1 (*The Kepler Nursery*) at 60 FPS with your ship in live orbit around a golden Singularity, surrounded by musical Prism Bumpers, incoming Void Drones, and a one-click **AI Trickshot Coach (`[C]`)** ready to demonstrate or execute an optimal shot immediately.
3. **Consequential Resource Tradeoffs:**
   - **Hawking Energy (`0–100`):** Shared across **Bullet-Time Aim Dilation**, **Supernova Shockwave (`[E]`, 35 Energy)**, and **Emergency Chrono-Rewind (`[R]`, 40 Energy if no Chrono-Charge)**.
   - **Risk vs. Relativistic Velocity (Lorentz $\gamma$):** Skimming dangerously close to a Black Hole's **Photon Sphere** or whipping tightly on a **Quantum Tether (`[Q]`)** skyrockets your Lorentz $\gamma$ multiplier (`1.0x` → `8.0x`) and charges Hawking Energy, but straying inside the inner Event Horizon crushes your hull.
   - **Bumper Chaining vs. Direct Ramming:** Spending flight time bouncing between **Constellation Pegs** builds massive harmonic multipliers and closes a **Shoelace Polygon** that obliterates everything inside the triangle, whereas direct ramming eliminates immediate threats before they fire.
4. **Visible World Feedback:**
   - Real-time **Relativistic Trajectory Predictor** integrates exact $1/r^2$ multi-body gravity and bumper ricochets while aiming.
   - Closed **Constellation Polygons** render glowing mythic geometry overlays with enclosed area readouts ($\text{px}^2$).
   - **Worldline Chrono-Rewind** renders your recorded past path and spawns a translucent cyan **Phantom Echo Ship** flying along your prior trajectory.
5. **Short Goal + Long Goal:**
   - **Short Goal:** Clear all 5 Cosmic Sectors and shatter the **Kardashev-IX Dyson Architect Boss** in Odyssey Mode, or solve all 5 **Constellation Trickshot Dojo** puzzles within the 1-Launch Par.
   - **Long Goal:** Unlock all 12 Synergistic Astro-Relics in the Codex, master all 3 Ship Chassis (`Vanguard Lance`, `Photon Wisp`, `Juggernaut Star-Hammer`), reach Lorentz $\gamma \ge 6.0\times$, and survive Wave 35 in Endless Singularity Mode.
6. **Pure Deterministic Simulation Boundary:** `src/simulation.ts` is 100% pure TypeScript with `SeededRng` (`src/rng.ts`), zero DOM/window dependencies, and full counterfactual replay support (`runHorizonCounterfactuals`).
