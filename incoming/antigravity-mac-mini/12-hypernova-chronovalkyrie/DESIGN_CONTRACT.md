# DESIGN CONTRACT: Hypernova: Chrono-Valkyrie // Apex Overdrive

## 1. Title & High Concept
- **ID:** `12-hypernova-chronovalkyrie`
- **Number:** 12
- **Title:** Hypernova: Chrono-Valkyrie
- **Subtitle:** Apex Overdrive Bullet-Time Roguelite
- **Genre:** Twin-Stick Bullet-Hell Roguelite & Chrono-Drift Arena Action
- **Primary References:** *Vampire Survivors* · *Geometry Wars: Retro Evolved* · *Hades*
- **Supporting References:** *Ikaruga* (Graze Mechanics) · *Hotline Miami* (Audio/Game Juice) · *Touhou Project*
- **Accent Color:** `#00f0ff` (Electric Cyan)

## 2. The 12 Open-Source Fun Principles Conformance
1. **One-Sentence Core Loop:**
   Pilot the experimental Chrono-Valkyrie frame across 10 intense escalating waves, triggering bullet-time Chrono-Drift to graze projectiles and parry laser barrages while drafting synergistic weapons and augments to achieve SSS-Rank Apex Overdrive and vanquish the Singularity Titan.
2. **Playable in 5 Seconds:**
   Starts with immediate responsive vector movement and auto-fire/click aim. First enemy engagement within 3 seconds of wave launch.
3. **Consequential Tradeoffs:**
   - Chrono-Drift drains energy that is recharged via dangerous projectile grazing.
   - High speed and damage vs. fragile hull integrity.
   - Choosing aggressive offense augments vs defensive survivability.
4. **Visible World Feedback:**
   - Floating combat numbers (crit golden callouts, damage, shields, grazes).
   - Real-time procedural screenshake decaying by quadratic trauma.
   - Hitstop freeze frames on critical strikes and boss kills.
   - Dynamic chromatic afterimages during Chrono-Drift.
5. **Short Goal + Long Goal:**
   - *Short Goal:* Clear the first 5 waves to defeat the Mid-Boss *HYPERION THE SUN-DEVOURER*.
   - *Long Goal:* Vanquish Wave 10 Boss *CHRONOS THE SINGULARITY WEAVER*, unlock all 3 Valkyrie Chassis frames, reach APEX Overdrive multiplier (x10), and conquer Endless Overdrive Mode.
6. **Tunable Difficulty Curve:**
   Smooth ramp across 10 distinct authored wave schedules, culminating in bullet hell spirals, sniper telegraph lasers, and multi-phase titan battles.
7. **Familiar Genre + One Twist:**
   Familiar arena roguelite twin-stick controls elevated by the *Chrono-Drift* time dilation & *Bullet Graze* energy loop.
8. **Progressive Reveal:**
   - New weapons automatically unlock as level thresholds are met.
   - 3-card synergistic augment draft on every level up.
   - Multi-phase boss transformations at 50% HP.
9. **Honest Explanations:**
   Clear cause-of-death recap breaking down total score, peak combo rank, enemies vaporized, and grazes performed.
10. **Short Runs, Permanent Learning:**
    5-10 minute intense sorties where positioning and graze timing mastery permanently improve player performance.
11. **Versioned Local Persistence:**
    LocalStorage envelope recording high scores, career kills, unlocked frames, and peak combo ranks.
12. **Pure Simulation Boundary:**
    100% deterministic simulation in `src/simulation.ts` powered by seeded Mulberry32 PRNG in `src/rng.ts`.
