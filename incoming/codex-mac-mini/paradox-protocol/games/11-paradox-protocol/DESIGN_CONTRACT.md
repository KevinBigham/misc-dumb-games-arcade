# DESIGN CONTRACT — GAME 11: PARADOX PROTOCOL (THE MIRROR ENGINE)

## 1. Core Loop & Philosophical Hook
- **One-Sentence Core Loop:** Navigate 5 iconic philosophical thought-experiment arenas (*The Trolley Reactor*, *Newcomb's Quantum Vault*, *Ship of Theseus Overdrive*, *The Prisoner's Multiverse*, and *Laplace's Singularity*) while an AI Oracle (**Laplace-9**) predicts your moves in real time and spawns an **Act B Mirror Echo-Clone** trained on the exact moral choices you just made in Act A!
- **Playable in < 3 Seconds:** Opens directly into the live 60fps 2D tactical cyber-arena with immediate WASD / Arrow / Pointer navigation and 3 tactile Philosophical Verbs (`[1/Q] Intervene`, `[2/E] Siphon`, `[3/Space] Quantum Swerve`).

## 2. Signature Consequential Tradeoffs
1. **Altruistic Intervention (`[1/Q]`) vs. Egoist Siphon (`[2/E]`):**
   - Intervening flips reactor switches, shields vulnerable Colonist Pods, and trains your Act B Echo-Clone to protect the arena—at the cost of personal energy overdrive.
   - Siphoning drains raw energy & high score multipliers from the crisis—but teaches your own reflection to hunt you and defect against the Sanctuary Core in Act B and Chamber IV.
2. **Coherence vs. Existential Surprise (`[3/Space] Quantum Swerve`):**
   - Laplace-9 tracks your spatial quadrants and verb frequencies to project a live **Prediction Lock (%)**. Spending 18W on a Quantum Swerve teleports perpendicular to your predicted trajectory, shattering Laplace's determinism for +250 bonus points.
3. **Ship of Theseus Cybernetic Upgrades vs. Biological Humanity:**
   - Installing any of the 4 Cybernetic Upgrades (*Tachyon Optics*, *Sub-Millisecond Clock*, *Vampiric Condenser*, *Laplace Sovereign Kernel*) grants massive arcade speed and weapon firepower, but permanently deletes 25% of your **Humanity Index** and a cherished human memory.

## 3. Verification & Determinism
- Pure deterministic simulation boundary (`src/simulation.ts`) backed by `SeededRng` (`src/rng.ts`).
- Versioned local save recovery with idempotent run completion keys (`src/persistence.ts`).
- Side-by-side Counterfactual Timeline Simulator (`runCounterfactualComparison`) comparing your actual run against 3 philosophical archetypes on the exact same seed.
