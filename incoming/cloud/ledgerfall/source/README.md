# Ledgerfall

One-file falling-block puzzle about a monthly budget. Original name, art, text and music (all drawn and synthesized in code).

**Loop:** expense blocks fall into the month; fill a row to pay it; gold Savings cells in a paid row are banked and earn interest every payday.
**Twist:** compound interest works both ways. Savings grows 5% a game-month; the card (skip a block) grows 15% and comes back as red debt rows. On payday you pick next month's budget (needs fixed at half; you split the rest between wants and savings). Pink wants keep Joy up; high Joy slows the fall, low Joy speeds it up, zero Joy forces an impulse buy on the card.

- Short goal: pay each month's bills. Long goal: finish 12 months (then endless). Score = net worth (savings minus card debt).
- Unlocks: month 2 card + budget plans, month 3 surprise bills, month 4 Super saver plan.
- Daily ledger: date-seeded, same blocks for everyone that day, separate best.
- Debug overlay: open with `?debug=1`.

## Run
Open `ledgerfall.html` in any browser. No build, no network, no assets.

## Tests
- `node tests/rules.test.mjs` — pure rules (no deps): determinism, bag mix, idle top-out, lock-delay cap, card rules and charge-spam farm check, perfect-row scoring, emergencies, impulse buys, payday idempotency, debt rows, save validation (12 corrupt cases), 48 bot runs with invariants every step, endless mode, budget plans.
- `node tests/ui.test.mjs` — real page in jsdom (needs `jsdom` and `@napi-rs/canvas`; the loader points at the scratch install): first tap, drag, flick, pad hold, keyboard, hidden-tab pause and audio stop, reload/continue, corrupt-save recovery, payday flow, plan picker, charge button, game over, daily seed, mute, 6000 random UI steps.
- `node tests/plans.mjs` — balance comparison of the four budget plans (30 seeds each).

## Architecture (single file)
`<script id="core">` holds CONFIG, DATA (shapes, items, plans, tips), seeded RNG (mulberry32, state in the save), pure `step(state, action) -> {s, ev}`, and `validate()`. `<script id="ui">` holds Storage (try/catch, autosave on every lock and on hide), Audio (WebAudio, starts on first gesture, stops on hidden tab), Renderer (canvas), Input (pointer + keys), screens and the loop.

## Tunables worth playtesting
`SPEEDS`, `GOAL_BASE/GOAL_CAP`, `JOY_DECAY`, `JOY_WANT_CELL`, `RELAXED_MULT/STRESSED_MULT`, `SAVINGS_RATE`, `CARD_RATE`, `EMERGENCY_BASE/PER_MONTH`, `DEBT_ROW_PER`, `PLANS[].bag`.

## Asset manifest
All graphics are canvas paths and CSS; all sound is generated WebAudio (original I-vi-IV-V loop in F). Fonts are system stacks. Nothing third-party.

## Playtest script (5 minutes)
1. Play month 1 without reading help. Can you say what gold blocks do by the first payday?
2. At payday, pick Saver. Does Joy dropping and blocks speeding up feel fair or cheap?
3. In month 2, charge one awkward block. At the next payday, find the card interest line.
4. Ask: which payday choice would you change next run, and why?
