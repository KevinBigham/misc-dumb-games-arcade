# Game 07: Merge Kitchen — Design Contract

## 1. Identity & References
- **Title**: Merge Kitchen: 2048 Bistro Service
- **Genre**: Culinary Sliding-Tile Merge Puzzle & Order Management
- **Primary Reference**: *2048* (Gabriele Cirulli, 2014) — deterministic 4x4 directional sliding, strict traversal order, single-merge-per-turn invariant, and blocked-move no-spawn rule.
- **Supporting Reference**: *Overcooked!* / *Threes!* — active 3-Ticket Customer Order Rail that turns intermediate merged dishes into spatial relief valves and Rush-Hour tip multipliers.
- **One-Sentence Core Loop**: Swipe a **4x4 kitchen prep board** in four directions so matching culinary ingredients slide and merge up an **11-tier Recipe Chain** (`Fresh Egg [2]` to `Chef's Legend [2048]`), while serving requested dishes to an active **3-Ticket Customer Order Rail** to clear crowded board space and trigger Rush-Hour tip multipliers.

## 2. Core Design Pillars
- **Player Fantasy**: Head Chef running a bustling French bistro kitchen during dinner rush—simultaneously building multi-course haute cuisine masterpieces on the prep table while ringing the service bell to plate hot dishes for waiting tables.
- **Repeated Core Decision**: Should you **keep two mid-tier dishes on the board** to merge them toward the `Michelin Grand Feast [1024]`, or **serve one immediately** to an active Customer Ticket to free up a scarce board cell, bank a Rush-Hour tip multiplier, and prevent board gridlock?
- **Scarce Resource**: **Empty prep cells on the 4x4 grid** (and remaining **Customer Ticket Patience turns** before tip bonuses decay).
- **Short Goal (5-Minute Victory)**: Serve **10 Customer Orders** (or craft the `Tier 10: Michelin Grand Feast [1024]`), unlocking the celebratory Michelin Star Victory screen with a **"Keep Cooking (Endless Service)"** option.
- **Long Goal (Mastery)**: Reach `Tier 11: Chef's Legend [2048]` while maintaining a `5x+` Rush-Hour Service Streak and maximizing total Bistro Score.
- **Loss Condition**: The 4x4 prep board is **100% full** (0 empty cells), **no adjacent equal tiles** remain in any row or column (`UP/DOWN/LEFT/RIGHT` are all blocked), AND **no tile currently on the board matches any active Customer Ticket** on the 3-ticket rail.
- **Target Session Length**: 4–8 minutes for a standard 10-order dinner service; 12–20 minutes for Endless Grand Feast mastery.

## 3. Two Plausible Winning Strategies
1. **Strategy A — Aggressive Order Turnover ("Rapid Line Cook")**:
   - Prioritize crafting `Tier 3 (Golden Omelet [8])` through `Tier 6 (Bistro Brunch [64])` dishes and immediately ringing the service bell (`[1]`, `[2]`, `[3]`) whenever a ticket lights up.
   - Keeps 6–9 empty cells open on the prep board at all times, chains high Rush-Hour tip multipliers (`1.5x–2.5x`), and clears the 10-order Short Goal rapidly with minimal lockup risk.
2. **Strategy B — Corner-Anchored Grand Feast Builder ("Michelin Sous-Chef")**:
   - Anchor your highest-tier dish in a fixed corner (e.g., bottom-right) by restricting slides to two primary axes (`DOWN` and `RIGHT`), building a monotonic chain (`512 -> 256 -> 128 -> 64`).
   - Hold off on serving mid-tier tickets unless the board drops below 3 empty cells or a duplicate high-tier tile is stranded out of position—using `SERVE_ORDER` as a surgical board-pruning tool to fix parity jams.

## 4. First 60 Seconds Experience
- **0–10s**: The player sees a warm copper-and-parchment 4x4 prep board with 2 starting ingredients (`Fresh Egg [2]`) and 3 Customer Tickets pinned to the top order rail (`Ticket A [1]`, `Ticket B [2]`, `Ticket C [3]`).
- **10–30s**: Swiping or pressing arrow keys slides tiles across the prep board with crisp pan-sizzle audio and scale-pop merge animations (`Fresh Egg [2] + Fresh Egg [2] -> Whisked Batter [4] -> Golden Omelet [8]`).
- **30–60s**: As soon as a `Golden Omelet [8]` or `Brioche Toast [16]` forms on the board, the matching Customer Ticket glows gold with a **"Serve Dish! [1]"** prompt. Serving it rings the service bell, plucks that tile directly off the 4x4 grid, awards a Rush Tip bonus, and advances the `Orders Served: 1 / 10` counter.

## 5. Out-of-Scope Features
- No real-time countdown clocks that force frantic twitch errors (all ticket patience and kitchen progression are strictly turn-based per valid slide).
- No multi-board scrolling or inventory crafting grids outside the 4x4 prep table and 3-ticket order rail.
- No gacha timers, energy bars, or external asset dependencies.

## 6. Playtest Script & Verification Checklist
1. Launch Merge Kitchen and press `ArrowLeft` / `ArrowUp` to slide starting `Fresh Egg [2]` tiles together into `Whisked Batter [4]` and `Golden Omelet [8]`.
2. Attempt a slide in a direction where all tiles are already flush against the wall and cannot merge; verify the board flashes a subtle "Blocked" indicator and **no new tile spawns**.
3. Line up `[2, 2, 4, 0]` in a row and slide toward the `[2, 2]` side; verify it merges once into `[4, 4, 0, 0]` ( plus 1 newly spawned tile), respecting the single-merge-per-turn invariant.
4. When a board tile matches Ticket A, B, or C, press `1`, `2`, or `3` (or click the glowing **Serve Dish!** button / tile); verify the tile disappears from the 4x4 grid, score increases with tip multiplier, and `Orders Served` increments.
5. Refresh the browser mid-run; verify the exact 4x4 board, active customer tickets, score, and RNG state restore seamlessly from `localStorage`.

## 7. Next Design Experiment
- Test a **Daily Chef's Special Modifier** (e.g., "Soufflé Night: Tier 5 dishes award double tips but collapse if left unserved for 8 turns") to evaluate whether temporary tier-specific incentives shift players between Strategy A and Strategy B.
