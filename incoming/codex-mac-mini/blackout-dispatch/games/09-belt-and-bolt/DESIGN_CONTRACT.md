# DESIGN CONTRACT — Game 09: Belt & Bolt

## 1. Player Fantasy & Core Identity
- **Title**: Belt & Bolt: Geometric Ore Logistics & Perimeter Wave Defense
- **Primary Reference**: *Mindustry* (Anuken — conveyor logistics feeding turret ammunition magazines under escalating wave pressure)
- **Supporting Reference**: *shapez* (Tobias Springer — clean geometric ore grammar, cutters/smelters, splitters, and escalating core shape quotas)
- **One-Sentence Core Loop**: Place **Extractor Miners**, **Conveyor Belts**, **1:1 Splitters**, and **Alloy Cutters/Smelters** on a **12x12 industrial grid** so mined geometric ore (`CuCircle`, `FeSquare`, `AuStar`) physically travels tile-by-tile along belts to either feed **Perimeter Defense Turrets** (ammo against incoming enemy waves) or deliver into the **Central Command Core** (currency + shape quotas that unlock tech tiers every 3 waves across a 30-wave campaign).

## 2. Repeated Core Decision & Meaningful Tradeoff
- **System A Feeds System B**: Every single item on a belt is both **money/tech progress** (if routed into the Command Core) and **bullets** (if routed into a Turret magazine).
- **The Repeated Decision**: On every wave cycle, the player inspects visible conveyor flow and decides:
  1. **Where to tap ore veins** (`CuCircle` Copper, `FeSquare` Iron, `AuStar` Crystal) and whether to route raw ore directly or refine it through an **Alloy Cutter/Smelter** (`2.5x` turret damage & `2x` Core value, at the cost of space and processing ticks).
  2. **How to split throughput** with **1:1 Splitters** between the **Command Core** (to afford expansions and hit Quota Milestones `15 -> 60 -> 200 -> 600`) and **Perimeter Turrets** (so magazines do not run dry mid-wave).
  3. **How to clear downstream congestion**: When a turret magazine (`10/10`) or processor buffer fills up, items physically back up along the belt line (`CONGESTED`), visually telegraphing where a **Splitter** or **Capacitor Buffer Silo** is needed.

## 3. Scarce Resources & Loss / Victory Conditions
- **Scarce Resources**:
  1. **Grid Space & Routing Topology (12x12 tiles)**: Belts cannot cross without replacing tiles; every smelter, splitter, and turret competes for prime routing corridors around the Command Core.
  2. **Ore Throughput (Items/Tick)**: Mined items are conserved 1-for-1 on belts; routing 100% of ore to the Core leaves turrets dry (`0 Ammo`), while routing 100% to turrets starves economy and tech upgrades.
  3. **Core Credits & Tech Tier Quotas**: Needed to construct advanced buildings (`Overclocked Belt`, `Alloy Smelter`, `Scatter Turret`, `Arc Railgun`).
- **Short Goal**: Survive **Wave 10** and unlock the first **3 Tech Tiers** (Waves 3, 6, and 9).
- **Long Goal (Campaign Victory)**: Survive all **30 Waves** (defeating the Wave 15 `Siege Crawler`, Wave 20/25 `Shielded Dreadnought`, and Wave 30 `Apex Goliath`), with an optional **Endless Overdrive Factory Mode** afterward.
- **Loss Condition**: Central Command Core Hull reaches `0 HP`.

## 4. Two Plausible Winning Strategies
1. **Strategy A — Greedy Core-Quota Rush + Late Railguns**:
   - Route 80% of early `CuCircle` and `FeSquare` veins straight into the Command Core during Waves 1–5, defending with a single minimally supplied `Bolt Turret` and cheap `Repair Walls`.
   - Hit the `60` and `200` Core Quota Milestones early to amass a large credit reserve by Wave 6–12, then transition into `Alloy Smelters` (`FeSquare -> BoltedAlloy`) feeding long-range `Arc Railguns` (`2.5x` ammo multiplier) that snipe bosses across the map.
2. **Strategy B — Early Splitter Perimeter Bunker**:
   - Immediately at Wave 3, place `1:1 Splitters` on every miner line so exactly 50% of production feeds a ring of `Bolt Turrets` and `Twin-Barrel Scatter Turrets` backed by `Capacitor Buffer Silos`.
   - Upgrade main arteries to `Overclocked Belts (2x speed)` to eliminate backpressure and maintain continuous full-magazine fire against high-count swarm waves.

## 5. First 60 Seconds Onboarding Experience
- **0–15s**: The player sees the **12x12 Industrial Grid** with the pulsing **Command Core** at `(5, 5)`, glowing geometric ore veins (`CuCircle` Copper, `FeSquare` Iron, `AuStar` Crystal), and a pre-built starter **Extractor Miner -> Conveyor Belt -> Command Core** line already moving copper circles into the Core.
- **15–35s**: The player selects `[1] Miner` and `[2] Conveyor Belt` (rotating with `[R]`) to connect a second vein to a pre-positioned **Bolt Turret** before the Wave 1 countdown finishes.
- **35–60s**: Wave 1 `Scout Drones` enter from the perimeter. The player sees their `Bolt Turret` consume loaded `CuCircle` ammo to destroy the drones, earns wave bonus credits, and sees the **Tech Tree Progress Bar** advance toward the **Wave 3 Unlock (`1:1 Splitter` + `Overclocked Belt`)**.

## 6. Out-of-Scope Features
- Fluid pipe networks, power grid voltage ratios, or multi-planet campaign maps (keeps 100% focus on readable single-screen 12x12 belt backpressure and ammo vs. quota routing).
- Freeform unit RTS pathfinding commands for player units (defense is strictly tower/turret + wall + logistics driven).

## 7. Playtest Script & Next Experiment
- **Playtest Script**:
  1. Verify that a new player can trace every item from Miner -> Belt -> Splitter -> Smelter -> Turret/Core purely from visual tile animations.
  2. Intentionally disconnect a belt feeding a turret and verify the `NO AMMO` badge and Bottleneck Inspector immediately pinpoint the dry turret and jammed belt.
  3. Trigger Wave 3, 6, 9, and 12 and confirm each new building tier unlocks in the toolbar with audio/visual confirmation.
- **Next Experiment**: Test whether players prefer automatic 1:1 Splitter alternation vs. manually toggling a 2:1 priority bias toward Turrets during Boss Waves (15, 20, 25, 30).
