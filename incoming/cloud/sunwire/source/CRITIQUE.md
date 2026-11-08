# Sunwire — blunt self-critique of v1 (after bot testing)

Bot-tested only in a headless browser stand-in (jsdom + a real Canvas 2D renderer at 375×667). Nobody has played it on a real phone.

## What works
- The loop reads in one glance: drag town to town, a car starts shuttling, coins pop at the far end.
- First order lands in about month 3 (24 seconds at 1×), so the first win comes fast.
- Every daily seed tested (8) is winnable by the bot; a lazy one-line player runs out of time; overbuilding wins later than smart play. Strategy matters.
- Saves are validated field by field; corrupt saves start fresh and keep a backup.

## What is wrong (v1)
1. **The "wait to fill" order is a fake choice.** Upkeep is per month, so waiting for a full load saves nothing. A button that never matters breaks the report's rule about consequential tradeoffs.
2. **Warnings cry wolf.** Profitable lines with a backlog show the same yellow "!" as lines that lose money. In the mid-game screenshot most lines had a "!", so the marker means nothing.
3. **First month looks like failure.** Towns start empty, so the very first line shows a red −$21 badge with a warning. Bad first impression for a 10-second read.
4. **Sheet buttons can miss taps.** The bottom sheet rebuilds its HTML every 0.5 s. A tap that straddles a rebuild loses its click. Classic broken-touch bug.
5. **Badges collide with labels.** Profit pills sit at the exact midpoint and cover names ("Verdigris Mine" was hidden) and the month ledger floats over the bottom mesas.
6. **"Moved" counts loads, not deliveries.** One sheet showed "Moved 24, Earned $0", which looks like a bug to a player.
7. **The route preview shows cost but not reward.** The OpenTTD lesson says preview expected payoff before commit; v1 only shows price and cargo.
8. **Bankrupt while profitable (fixed during v1 testing).** Spending to $0 then paying upkeep counted as a strike; the spendthrift bot went bankrupt with +$5,800/month profit. Now a strike needs both red cash and a losing month, and the credit line scales with upkeep.
9. **Charter was instant (fixed during v1 testing).** At $30k net worth the charter completed the same month as order 4. Raised to $60k.

## Fix plan for v2
- Per-trip running cost (fuel) on each departure, with lower monthly upkeep, so wait-to-fill genuinely saves money on trickle routes and costs throughput on busy ones.
- Split status markers: green ▲ "room to grow" for backlog, yellow ! only for losing, empty, oversupplied or slow lines.
- Producers start with one month of stock so the first trip pays.
- Never replace sheet buttons while a finger is down on the sheet, and skip rebuilds when nothing changed.
- Badge placement avoids labels; month ledger moves to the top of the map.
- "Delivered" stat counts arrivals; preview shows estimated pay per unit and trip time.

## v2 results (after fixes, bot-tested only)
- 76 automated checks pass (rules, saves, corrupt-save recovery, hidden-tab audio, first drag, sheet taps, 375px and wide renders).
- Classic map: smart bot wins the charter at month 40–42; spendthrift wins at month 52; lazy one-line player runs out of time at month 60; idle never starts (no soft lock, no free money).
- All 8 daily seeds tested are winnable (smart wins around month 40–43).
- Freeplay income levels off near $7k/month, so there's no runaway farm loop.
- First line now opens with a paid trip instead of a red badge; "!" only shows on lines that need attention.

## Still wrong in v2
- Wait-to-fill is now a real choice, but a small one (about 2% on a trickle line). It may need a bigger fuel share to feel worth thinking about.
- Cars and labels can still overlap near busy towns.
- Bottom sheets and menus were checked through the DOM, not by eye.
- No real-phone play yet: touch feel, text size and pace are unverified.

## Best next idea
A transfer hub: one site per map where cargo can switch cables, so players build real networks instead of separate shuttles.
