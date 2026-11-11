# DESIGN CONTRACT — GAME #13: AEGIS-ZERO: GRAZE OVERCLOCK

## Director Lineage
- **Jonathan Blow (*Braid*)**: Temporal consequence & worldline echoes (`Braid Worldline Twin`, `Overclock Time-Dilation`).
- **Edmund McMillen (*The Binding of Isaac*)**: Risk-reward sacrificial pacts & combinatorial roguelite item synergies (`Martyr Blood-Capacitor`, `Supercritical Siphon`).
- **Vlambeer (*Nuclear Throne* / *Luftrausers*)**: Non-negotiable physical game feel—40ms heavy strike hitstop, 120ms Boss kill freeze, `trauma²` screenshake with rotational kick, recoil impulse surfing (`Heavy Kickback Cannon`).
- **Nicholas TenHueg**: Crystal-clear spatial/systemic legibility, immediate zero-filler flow state, and tight feedback loops.

## The 6 Design Imperatives
1. **The Genre + The One Twist**:
   - **Genre**: Twin-Stick Kinetic Bullet-Heaven / Polarity Graze Roguelite.
   - **The Signature Twist**: Your primary Rail-Capacitors have **zero ammo**—they only fire rapid, high-velocity volleys when you **graze within 44px of enemy projectiles or hulls**, charging your **Overclock Meter (`0–100%`)** to unleash bullet-vaporizing **Phase-Shatter Novas**.
2. **The First 5 Seconds**:
   - Zero tutorial text walls. Boots directly into Wave 1 on Frame 1 (`status: 'playing'`) with an immediate incoming plasma ring ready to graze.
3. **The Scarce Resource & Risk-Reward Friction**:
   - **Volatile Flux Gems** decay over **4.0 seconds**. Harvesting them within their **1.5s White-Hot Supercritical Window** grants **2× XP**, **+14% Overclock**, and **+1 Combo**; letting them expire at 4.0s detonates them into a 5-bullet shrapnel ring.
4. **"The Juice" (Non-Negotiable Game Feel)**:
   - **Hitstop**: `40ms` on heavy strikes/crits/shatters, `120ms` on Elite/Boss kills.
   - **Screenshake**: Trauma-based shake with quadratic decay (`trauma²`) and rotational camera kick (`±0.048 rad`).
   - **Particles & Callouts**: Bouncing floating crit callouts, drag sparks, lingering smoke puffs, shockwave expansion rings, and procedural Web Audio API sound effects + a 4-track adaptive synthwave loop (`120–150 BPM`).
5. **The Roguelite Draft Loop**:
   - 8 escalating waves with Wave 4 Mid-Boss (*HEX-WARDEN VEX*) and Wave 8 Apex Boss (*CHRONO-SERAPH OMEGA*).
   - 3-choice Augment Draft on every level-up and wave clear across 16 perks (`Common`, `Rare`, `Epic`, `Legendary`), 3 unlockable Chassis Loadouts, and versioned `localStorage` persistence.
6. **Technical Discipline**:
   - Pure deterministic 60 FPS simulation step (`src/simulation.ts`), seeded PRNG (`src/rng.ts`), and responsive desktop + mobile touch fallback.
