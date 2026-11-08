# DESIGN CONTRACT — Game 04: Junkyard Courier

## 1. Player Fantasy & Core Identity
- **Title**: Junkyard Courier: The Rustwater Shallows
- **Genre**: Flooded Industrial Archipelago Boat Loadout & Route Roguelite
- **Primary Reference**: *Sunless Sea* / *Dredge* (nautical route tension, cargo space management, hazard judgment)
- **Supporting Reference**: *FTL: Faster Than Light* (node-graph routing, modular ship systems, tactical hazard choices)
- **Player Fantasy**: You are the skipper of **The Iron Skiff**, a battered diesel workboat threading between submerged refinery towers, rusted crane-barges, and silt-choked lock gates in **The Rustwater Shallows**. Every trip out of port is a calculated gamble: every Hold Slot occupied by an armored prow or spare fuel drum is a slot that cannot carry paying freight.

## 2. Core Loop & Repeated Decision
- **One-Sentence Loop**: Accept salvage contracts at port, pack your 8-slot boat hold with modules, fuel drums, repair kits, and cargo, plot a route across the 12-node archipelago map while weighing fuel burn against visible route hazards, resolve tactical encounters on each leg, and complete 3 deliveries to win the run.
- **Repeated Decision**: **Hold Slot Allocation vs. Route Risk**. Before departing any port, and at every fork on the 12-node archipelago map, the player chooses between:
  1. Packing bulky defensive modules (`Reinforced Icebreaker Prow`, `Twin-Prop Outrigger`, `Gyro-Shock Cradle`) and taking short, high-hazard shortcut channels (`Scrap Reef`, `Cross-Current Riptide`, `Acid Squall`), OR
  2. Stripping modules to maximize open Hold Slots for multi-contract or bulky cargo (`3 Slots`) + reserve `Fuel Drums`, taking longer low-hazard outer channels.

## 3. Scarce Resource & Economy
- **Hold Slot Capacity (8 Slots Shared)**:
  - **Contract Cargo**: 1 to 3 Slots per contract (up to 2 active contracts at a time).
  - **Installed Boat Modules**: 1 to 2 Slots each.
  - **Spare Fuel Drums**: 1 Slot each (can be cracked open at sea or during encounters for +4 Fuel).
  - **Repair Kits**: 1 Slot each (restores +10 Hull, or +15 Hull with `Bilge Pump & Patch Rig`).
- **Internal Tank Fuel**: Base Max 10 Fuel (+4 with `Auxiliary Reserve Tank`). Every edge on the map costs base fuel (1–3) plus potential hazard penalties.
- **Hull Integrity**: Base Max 40 Hull. Scrap reefs, floating mines, and rogue wakes chew through hull plating.
- **Credits (`¢`)**: Spent on port fuel refills, spare fuel drums, repair kits, hull patching, and installing modules; earned ONLY upon valid contract delivery (strictly guarded against double-payout) or salvaged via the `Salvage Magnet Winch`.

## 4. Victory & Loss Conditions
- **Victory Condition**: Complete **3 Contracts (`DELIVERED`)** across the archipelago within a run.
- **Loss Conditions**:
  1. **Hull reaches 0 (`SUNK`)**: The Iron Skiff breaks apart in the shallows.
  2. **Fuel reaches 0 with 0 Fuel Drums (`STRANDED`)**: Unable to pay the minimum fuel cost of any outgoing edge from the current node (or mid-leg depletion).
- **Failure Diagnostic**: Every loss triggers the **Failure Analyzer**, which inspects the run telemetry and pinpoints the exact mistake (e.g., *"Entered Scrap Reef leg without Reinforced Icebreaker Prow or Repair Kits while at 8 Hull"*, or *"Departed Anchorhead Dock with 4 Fuel on a minimum 6-Fuel route without packing a Spare Fuel Drum"*).

## 5. Target Session & First 60 Seconds
- **Target Session Length**: 6–10 minutes for a complete 3-delivery run.
- **First 60 Seconds**:
  - The player spawns at **Anchorhead Drydock (Node 01)** with The Iron Skiff (40/40 Hull, 10/10 Fuel, 1 Fuel Drum [1 Slot], 1 Repair Kit [1 Slot], 60¢).
  - The **Port Manifest Clipboard** immediately presents 3 opening contracts, guaranteed to include:
    1. **Safe Modest Freight (`1 Slot`)** — e.g., *Sealed Ballast Bearings* to a 2-hop port via low-risk channels.
    2. **Profitable Bulky/Fragile Contract (`3 Slots`)** — e.g., *Volatile Isotope Cores* or *Heavy Turbine Rotor* paying double credits, requiring either a direct hazardous shortcut or careful Hold Slot budgeting.
    3. **Express / Mid-Weight Contract (`2 Slots`)**.
  - The **8-Slot Hold Grid** visually highlights how accepting both the 1-Slot and 3-Slot contracts leaves 4 Slots for Fuel Drums, Repair Kits, and Modules. The player can click **Accept**, adjust supplies, click an adjacent connected node on the **Interactive Archipelago Canvas**, and launch within 30 seconds.

## 6. Two Documented Viable Loadouts
1. **`Light High-Capacity Hauler` (Capacity & Detour Strategy)**
   - **Modules Installed**: `Auxiliary Reserve Tank` (1 Slot, +4 Max Fuel) + `Gyro-Shock Cradle` (1 Slot, protects fragile cargo). Total Module Slots: 2.
   - **Hold Allocation**: Up to 4–5 Slots free for stacking **2 simultaneous contracts** (e.g., 1-Slot Safe Freight + 3-Slot Bulky/Fragile Salvage) plus 1–2 Slots for Fuel Drums/Repair Kits.
   - **Optimal Route Choice**: Avoids `Scrap Reef` and `Floating Minefield` shortcuts; uses the extra +4 internal fuel capacity to take 3-hop outer calmer channels (`Silt Fogbank` / `Rogue Wake`), completing 2 deliveries in a single multi-stop voyage and winning in 2 voyages.
2. **`Armored Storm-Runner` (Direct Shortcut & Hazard-Immunity Strategy)**
   - **Modules Installed**: `Reinforced Icebreaker Prow` (2 Slots, negates `Scrap Reef` hull damage) + `Twin-Prop Outrigger` (1 Slot, negates `Cross-Current Riptide` fuel penalty) + `Bilge Pump & Patch Rig` (1 Slot, +15 Hull per Repair Kit). Total Module Slots: 4.
   - **Hold Allocation**: 4 Slots used by heavy hardware, leaving 4 Slots for 1 high-payout contract (1–2 Slots) + 1 Repair Kit + 1 Fuel Drum.
   - **Optimal Route Choice**: Punches straight through the central archipelago's `Scrap Reef` and `Cross-Current Riptide` 1-to-2 hop shortcuts where unarmored boats would sink or stall, chaining 3 rapid single-contract deliveries.

## 7. Out-of-Scope Features (Strict Caps)
- No open-world free-roam physics steering (movement is strictly node-to-node turn-based along the 12-location graph).
- No crew hunger, morale, or sanity meters (Hull, Fuel, and Hold Slots are the sole core constraints).
- No procedural infinite world generation (1 curated, seed-parameterized 12-location archipelago graph with deterministic seeded hazard & contract states).
- No combat weapons or turret crafting.

## 8. Playtest Script & Next Experiment
- **Playtest Script**:
  1. Launch run with Seed `404`. Verify the opening port offers a `1-Slot` safe contract and a `3-Slot` bulky/fragile contract.
  2. Attempt to overfill the 8-slot hold; verify the Loadout Validator blocks overloading with a clear slot badge warning.
  3. Complete a delivery with the `Light High-Capacity Hauler` preset along the outer channel, claim payout, and verify clicking claim/deliver again cannot double-pay.
  4. Switch to `Armored Storm-Runner` and traverse a `Scrap Reef` shortcut leg with 0 hull damage.
  5. Save and reload mid-run; verify all node hazards and contract offers remain identical without rerolling.
- **Next Experiment**: Introduce shifting tide windows that flip the direction of `Cross-Current Riptide` edges every 3 turns, testing whether players hold contracts in port waiting for favorable tides.
