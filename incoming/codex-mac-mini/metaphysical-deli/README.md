# 🎮 ARGON 10-GAME STUDIO // 10 ORIGINAL GAMES COLLECTION

**Built Overnight by 10 Staggered Gemini 4 Argon (High) Agents Using the Open-Source Game Design Principles**

Every game in this suite has its own pure deterministic simulation boundary (`src/simulation.ts`), seeded PRNG (`src/rng.ts`), validated content tables (`src/content.ts`), tunable constants (`src/config.ts`), versioned local persistence with anti-double-reward recovery (`src/persistence.ts`), procedural WebAudio sound synthesis (`src/audio.ts`), responsive browser UI (`src/ui.ts`, `375px+` mobile and desktop), `DESIGN_CONTRACT.md`, `ASSET_MANIFEST.json`, and automated Vitest verification suite (`tests/*.test.ts`).

---

## 🕹️ The 10 Argon Games

| # | Game | Directory | Reference Lineage | Core Loop & Signature Tradeoff |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **One More Season** *(Brief A)* | [`games/01-one-more-season`](./games/01-one-more-season/) | *Unciv* · *Shattered PD* · *Lichess* | Run **Ironvale Rovers FC** (5-a-side) across a 6-fixture season; balance 5 starters from an 8-player squad (`1 - fatigue/200`), 2 Prep Points (`Rest -24` vs `Train +1 Stat/+8 Fat`), 3 tactical plans (`Patient`/`Balanced`/`Aggressive`), 16 possessions (`0/3/7` pts), and 3 logged decisive events to reach `>= 4` wins. |
| **02** | **Blackout Dispatch** *(Brief B)* | [`games/02-blackout-dispatch`](./games/02-blackout-dispatch/) | *OpenTTD* · *Mindustry* | Keep 5 priority city districts powered across a 12-turn storm on an 8x8 grid with a 2-turn weather radar forecast, 3 link types (`4/8/5 MW`), live deterministic flow preview, and free undo before turn commitment. |
| **03** | **The Last Signal: Ember Relay** *(Brief C + Premise 2)* | [`games/03-the-last-signal`](./games/03-the-last-signal/) | *A Dark Room* · *Bitburner* | Restore a storm-cut coastal lighthouse & relay station across 3 progressive-reveal chapters, 3 resources (`Watts`, `Salvage Alloy`, `Cipher Keys`), 4 remote stations, 12 one-time distress events, 4 safe declarative automation rules, and 2 reachable endings. |
| **04** | **Junkyard Courier** *(Brief D)* | [`games/04-junkyard-courier`](./games/04-junkyard-courier/) | *Endless Sky* · *Shattered PD* | Pack an 8-slot workboat hold with cargo, 6 modules, fuel drums, and repair kits, then navigate a 12-node flooded industrial archipelago across 3 deliveries where every route leg trades fuel against visible sea hazards. |
| **05** | **Beatline Salvage** *(Brief E + Premise 10)* | [`games/05-beatline-salvage`](./games/05-beatline-salvage/) | *osu!lazer* · *2048* | Sort magnetic salvage cores on Left/Right induction lanes synced strictly to `AudioContext.currentTime` across 3 authored 90-second 120 BPM charts + seeded daily tracks, with `1.5x` Overdrive Shunt gates, calibration (`±150ms`), a 12-bin timing-error histogram, and a Section Practice Loop. |
| **06** | **Roommate Republic** *(Brief F)* | [`games/06-roommate-republic`](./games/06-roommate-republic/) | *The Evolution of Trust* · *Lichess* | Inspect 4 roommate incentive models across 3 scenarios, commit to a prediction, enact 1 of 4 billing policies across 4 simulated weeks (with a Week 3 surprise shock), audit the double-entry money-conserving ledger, and run side-by-side counterfactual replays on the exact same frozen event schedule. |
| **07** | **Merge Kitchen** *(Premise 1)* | [`games/07-merge-kitchen`](./games/07-merge-kitchen/) | *2048* · *Threes!* | Swipe a 4x4 prep board to slide and merge ingredients up an 11-tier Recipe Chain (`Egg [2]` → `Chef's Legend [2048]`), trading high-tier merges against serving active dishes to a 3-Ticket Customer Order Rail to free board space and build Rush multipliers. |
| **08** | **Orbit Stack** *(Premise 3)* | [`games/08-orbit-stack`](./games/08-orbit-stack/) | *Hextris* | Rotate a central polygon core to stack and clear 3+ connected same-color/symbol orbital shards across radial depth and adjacent faces while the core dynamically morphs from **6 → 7 → 8 sides** and ramps toward the Level 35 speed cap. |
| **09** | **Belt & Bolt** *(Premise 4 + 5)* | [`games/09-belt-and-bolt`](./games/09-belt-and-bolt/) | *Mindustry* · *shapez* | Place Miners, Conveyors, Splitters, and Alloy Smelters on a 12x12 grid with physical belt congestion/backpressure so mined geometric ore either feeds Perimeter Turrets against 30 enemy waves or delivers into the Command Core to unlock tech every 3 waves. |
| **10** | **Ten Floors Down** *(Premise 6)* | [`games/10-ten-floors-down`](./games/10-ten-floors-down/) | *Shattered Pixel Dungeon* | Descend 10 BFS-validated procedural dungeon floors with 3 Hero Classes, an explicit Action-Tick timeline scheduler, 6 per-seed shuffled Potion Colors identified by drinking, throwing (`3x3` AoE), or Alchemy Desks, Floor 5 & 10 Bosses, and a Permadeath Cause-of-Death Recap. |

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

### Run Typecheck, Full 90-Test Verification Suite & Multi-Page Production Build

```bash
npm run typecheck
npm test
npm run build
npm run preview
```
