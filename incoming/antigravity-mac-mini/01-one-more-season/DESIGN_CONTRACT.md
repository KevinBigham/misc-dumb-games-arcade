# DESIGN CONTRACT — Game 01: One More Season (Ironvale Rovers FC)

## 1. Player Fantasy
You are the Newly Appointed Gaffer of **Ironvale Rovers FC**, a gritty five-a-side industrial-town football club given one final **six-fixture season** by the Supporters' Trust to win at least **four matches** and save the ground. You don't twitch-dribble on the pitch; you win matches in the dressing room and on the chalkboard—balancing a thin eight-player squad's fatigue, drilling targeted attributes, and reading each opponent's tactical tendency before the whistle blows.

## 2. Core Repeated Decision
Every fixture (1 through 6), the player makes four linked decisions before committing to kick-off:
1. **Lineup Selection (5 of 8)**: Pick five starters (who contribute their fatigue-adjusted `Attack`, `Defense`, and `Control` to the match and gain `24 - Stamina` fatigue afterward) and leave three reserves on the bench (who recover `-18` fatigue).
2. **Preparation Point Allocation (2 Points)**: Spend up to two non-carryover preparation points across the roster (max one action per player per fixture):
   - **Rest (`-24` Fatigue, clamped `0..100`)**: Restore a key starter's sharpness before kick-off.
   - **Train (`+1` Attribute up to `10`, `+8` Fatigue)**: Permanently sharpen `Attack`, `Defense`, `Control`, or `Stamina` at the cost of immediate match freshness.
3. **Tactical Plan (`Patient`, `Balanced`, `Aggressive`)**: Choose the possession risk profile (`0`, `3`, or `7` points per possession) that best exploits the opponent's scouted tendency and matches your current lineup's effective strength.
4. **Post-Match Development (Fixtures 1–5)**: After reviewing the 16-possession playback and 3 decisive events, award a single zero-fatigue `+1` attribute breakthrough to one player before advancing to the next week.

## 3. Scarce Resources
- **Squad Freshness (Fatigue `0..100`)**: Every point of fatigue reduces a starter's effective `Attack`, `Defense`, and `Control` by `0.5%` (`attr * (1 - fatigue / 200)`). A starter at `60` fatigue loses `30%` of their match output.
- **Preparation Points (`2` per fixture, no carryover)**: Every point spent training (`+1` attribute, `+8` fatigue) is a point not spent resting (`-24` fatigue).
- **Starter Slots (`5` per match) & Season Runway (`6` fixtures, `16` possessions per match)**: Draws count as `0` wins toward the `4`-win survival target, forcing calculated risk when facing defensively stubborn clubs.

## 4. Win & Loss Conditions
- **Match Outcome**: Each team resolves **8 alternating possessions** (16 total). Each possession yields `0`, `3`, or `7` points. Highest total after 16 possessions wins (`W` / `D` / `L`).
- **Season Victory**: Finish the 6-fixture campaign with **`>= 4` wins**.
- **Season Loss Condition**: Finish the 6-fixture campaign with **`<= 3` wins** (including draws, which award 0 wins toward the 4-win target).

## 5. Target Session Length
- **8 to 12 minutes** for a complete 6-fixture season (~90 seconds per fixture across scouting, prep, animated/stepped 16-possession playback, decisive event inspection, and post-match breakthrough).

## 6. Two Plausible Contrasting Strategies
1. **Strategy A — `Rotated Patient Matchup`**:
   - Rotates tired starters (such as benching or resting Fatigue-56 striker Kaelen Vance in Fixture 1 while starting fresh reserve poacher Juno Reyes), prioritizes `Rest` (`-24` fatigue) on high-minute creators, and selects the tactical plan that directly counters each opponent's scouted tendency (`Patient` vs high-press/transition traps, `Balanced` vs reactive mid-blocks).
   - **Tradeoff**: Keeps team average fatigue low (`< 22`) and maximizes `+tendencyShift` and steady `3`-point conversions, but sacrifices raw attribute ceiling late in the season.
2. **Strategy B — `Star-Heavy Aggressive Push`**:
   - Keeps the highest-rated core stars (`Kaelen Vance`, `Mira Solis`, `Bram Thorne`, `Tariq Osei`, `Juno Reyes`) on the pitch nearly every week, spends preparation points aggressively on `Train` (`+1` `Attack`/`Control`) alongside emergency `Rest` on Vance, and leans into high-variance `Aggressive` (`40%` base `7`-point conversion) or `Balanced` plans to overpower opponents on raw `Attack + Control`.
   - **Tradeoff**: Builds a high raw attribute ceiling by Fixture 5–6, but suffers steep mid-season fatigue penalties (`1 - fatigue/200`) and `0`-point turnover streaks when opponent tendencies punish reckless tempo.

## 7. First 60 Seconds (Fixture 1 Onboarding)
- The player opens directly on **Fixture 1 vs Cinderwick Athletic** (`Overeager High Press` tendency — visibly vulnerable to **`Patient`** buildup, `+8%` shift toward 7-point breakthroughs).
- Star striker **Kaelen Vance** (`Attack 9, Control 7`) starts in the lineup with **Fatigue 56** (highlighted in amber warning: effective multiplier `0.72x`, dropping his effective `Attack` from `9.0` to `6.48`).
- Within 60 seconds on a single screen, the player can:
  1. Either spend 1 Prep Point to **Rest** Kaelen Vance (`56 -> 32` fatigue, jumping his effective multiplier to `0.84x`) OR **Swap** him with fresh reserve striker **Juno Reyes** (`Attack 8`, Fatigue `0` -> `8.00` effective Attack, while Vance recovers `-18` on the bench).
  2. Spend the remaining Prep Point to **Train** playmaker Mira Solis or engine Tariq Osei (`+1 Control`, `+8` fatigue).
  3. Switch the Tactical Plan to **`Patient`** and watch the live Possession Odds Preview update immediately before clicking **Commit & Kick Off**.

## 8. Explicitly Out-of-Scope Features
- Player transfers, contracts, wage budgets, or free-agent markets.
- Mid-match substitutions or real-time reflex/arcade ball physics.
- Injuries, red cards, or morale systems separate from the `0..100` Fatigue mechanic.
- Multi-league promotion pyramids or procedural infinite seasons (strictly a self-contained 6-fixture authored season with seed replayability).

## 9. Playtest Script
1. Launch **One More Season** (`seed = 202601`). Verify Fixture 1 scouting banner shows **Cinderwick Athletic** and their vulnerability to **`Patient`** play.
2. Inspect **Kaelen Vance** (`Fatigue 56`). Observe his effective `Attack` (`6.48`) vs raw `Attack` (`9`).
3. Click **Rest (-24 Fatigue)** on Kaelen Vance (or swap in **Juno Reyes**), spend the second prep point to **Train +1 Control** on **Mira Solis**, select **`Patient`**, and press **Commit & Kick Off**.
4. Watch or step through the **16 alternating possessions** on the 2D 5-a-side tactical pitch. Press **`[D]`** (or toggle the Math Inspector button) to inspect the exact probability breakdown (`P(0)`, `P(3)`, `P(7)`), attribute delta, tendency shift, and RNG float roll for each possession.
5. Review the **3 Decisive Events** generated from the recorded possessions, then proceed to the **Post-Match Development** step and award **`+1 Attack`** or **`+1 Control`** at zero fatigue cost.
6. Complete all 6 fixtures and verify the **Season Recap** ledger, strategy comparison summary, and one-click **Play Another Season (New Seed)** loop.

## 10. Single Most Useful Next Experiment
- **Half-Time Tactical Pivot (After Possession 8 of 16)**: Test whether allowing a single mid-match tactical plan switch (`Patient` / `Balanced` / `Aggressive`) at half-time (after 4 possessions per side) deepens comeback agency when trailing early, or whether it dilutes pre-match scouting commitment.
