# DESIGN CONTRACT — Game 02: Blackout Dispatch

## 1. Player Fantasy & Core Pillar
You are the Chief Grid Dispatcher in a coastal metropolis during a 12-turn severe storm. Working on an illuminated 8x8 municipal dispatch board, you read 2-turn weather radar forecasts, calculate megawatt throughput across transmission corridors, stage infrastructure work orders, inspect live deterministic flow previews, and keep 5 critical city districts energized before cascading blackouts overwhelm the city.

- **Genre**: Turn-Based Power Grid Logistics & Network Flow Puzzle
- **Primary Reference**: *Mini Metro* / *Into the Breach* (perfect-information 2-turn threat telegraphing + network routing)
- **Supporting Reference**: *Factorio* power grid / classic max-flow min-cut dispatch puzzles

## 2. Core Loop & Repeated Decision
Every turn (`Turn 1` through `Turn 12`):
1. **Inspect**: Check current and next-turn MW demands across all **5 Priority-Ranked Districts (`P1..P5`)** and inspect the **2-Turn Storm Forecast** (`Imminent This Turn`, `T+1`, and `T+2` target links and strike severities).
2. **Stage Actions (Up to 2 Actions + Material Reserve)**:
   - **Place Link**: Build a `Standard Line` (4 MW, 10 Mat), `Heavy Trunk` (8 MW, 20 Mat), or `Storm-Shielded Conduit` (5 MW, 25 Mat, immune to wind strikes) between orthogonally adjacent cells.
   - **Upgrade Link**: Upgrade an existing link to a higher capacity or storm-shielded tier (`10–15 Mat`, also restores damaged links).
   - **Repair Link**: Restore a storm-damaged link (`5–10 Mat`).
   - **Reroute Link**: Relocate an existing link to an adjacent corridor (`5 Mat` labor) or toggle its directional flow gate (`Auto / A→B / B→A`).
3. **Preview & Undo**: Every staged action immediately updates the deterministic directed-graph power flow preview on the board — showing exact edge loads (`6/8 MW`), directional flow chevrons, and pinpoint bottleneck diagnostics. Staged actions can be undone or reset freely before committing the turn.
4. **Commit Turn**: Resolve imminent storm strikes, allocate generator output (`MW`) in strict priority order (`P1 → P5`) along shortest residual paths without ever creating energy in cycles, replenish material reserves (`+15 Mat` base + `+2 Mat` per energized Substation Relay), and verify that no district exceeds its cumulative unmet-demand blackout threshold.

## 3. Scarce Resources & Loss Condition
- **Scarce Resources**:
  - **Dispatch Crew Actions**: Strictly **2 Actions per turn** (`24 Actions` across a 12-turn storm).
  - **Cable & Material Reserve (`Mat`)**: Starts at `65 Mat` with `+15 Mat/turn` base replenishment (`+2 Mat` bonus per energized Substation Relay).
  - **Edge Throughput Capacity (`MW`)**: Each grid edge has a strict MW ceiling (`4 MW`, `8 MW`, or `5 MW`).
- **Win Condition**: Survive all **12 turns** with all 5 districts below their critical unmet-demand limit (`unmetLimitMW`) and total city unmet demand below `cityOutageThresholdMW`.
- **Loss Condition**: Any single district's cumulative unmet demand exceeds its `unmetLimitMW` (e.g., `St. Jude Hospital > 4 MW` cumulative shortfall) or city-wide cumulative unmet demand exceeds `cityOutageThresholdMW`.

## 4. Two Plausible Winning Strategies
1. **Strategy A — Single Trunk Efficiency (`Efficient Trunk`)**:
   - Concentrates Actions and Materials along the shortest radial corridors from the Central Generator, upgrading shared bottleneck stems to `Heavy Trunk (8 MW)` and hardening storm-targeted segments with `Storm-Shielded Conduits (5 MW)`.
   - *Pros*: Uses fewer total links and preserves high material reserves.
   - *Cons*: Zero path redundancy; a single unshielded trunk outage or supercell lightning strike cuts off all downstream districts.
2. **Strategy B — Redundant Storm Loop (`Redundant Loop`)**:
   - Invests early Actions to cross-tie the North, Central, and South corridors into interconnected ring topologies (`(4,4)↔(3,4)`, `(3,5)↔(2,5)`, `(4,3)↔(4,4)`).
   - *Pros*: Survives forecast wind and lightning strikes without spending 25 Mat on shielded conduits — power automatically reroutes around damaged edges via the residual loop.
   - *Cons*: Requires careful management of shared loop capacities as late-turn demands peak.

## 5. First 60–120 Seconds (Onboarding Script)
- **Turn 1 (Connectivity)**: In `Scenario 1: Harbor Squall`, `D1 (St. Jude Hospital, P1)` at `(3,3)` and `D2 (Harbor Waterworks, P2)` at `(3,5)` start unlinked. The player places two `Standard Lines` (`(3,2)↔(3,3)` and `(3,3)↔(3,4)`). Both districts immediately light up (`4/4 MW` flowing through `(3,2)↔(3,3)`).
- **Turn 2 (Throughput vs. Redundancy)**: `D1` and `D2` each surge to `3 MW` (`6 MW` total). Because they share the `4 MW` `Standard Line` at `(3,2)↔(3,3)`, the live preview highlights `(3,2)↔(3,3)` as `4/4 MW SATURATED` and warns that `D2` is short by `2 MW`. The player immediately learns the core tradeoff: **Upgrade** `(3,2)↔(3,3)` to a `Heavy Trunk (8 MW)` OR **Loop** `(4,4)↔(3,4)` from the South feeder to split the load.

## 6. Out-of-Scope Features (First Playable Caps)
- No continuous real-time clock or reflex clicking (100% turn-based deterministic puzzle).
- No AC reactive phase-angle differential equations (pure deterministic directed-graph max-flow allocation with explicit priority ordering).
- Fixed 8x8 grid, 1 Central Generator, 5 Districts, 3 Link Types, and 12 turns per scenario.

## 7. Playtest Verification & Next Experiment
- **Automated Verification**: `tests/blackout-dispatch.test.ts` verifies energy conservation across cyclic graphs, priority-order allocation, exact preview/undo restoration, seeded PRNG replay determinism, pinpoint bottleneck/disconnection diagnostics, and full 12-turn playthrough scripts for both `Efficient Trunk` and `Redundant Loop` strategies plus a documented blackout loss script.
- **Next Experiment**: Test adding a 1-use Emergency Battery Capacitor action that injects `+4 MW` at a Substation Relay for 1 turn during Category-4 Supercell double-lightning turns.
