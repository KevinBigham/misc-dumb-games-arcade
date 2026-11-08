# HONK IF YOU’RE EMPLOYED — The Chairperson Edition

An original offline arcade comedy. You lied on LinkedIn. You are a goose. Your career plan is to bowl through meetings with office furniture and become CEO before HR notices.

## Play immediately

Double-click **`src/honk/Honk_If_Youre_Employed.html`**. It contains the complete game, original Canvas illustrations, styles, simulation, and synthesized audio. No server, download of assets, account, or installation is required.

For development, run `npm run dev` and open `http://localhost:4173/src/honk/index.html`. The normal build also includes the portable file at `dist/src/honk/Honk_If_Youre_Employed.html`.

| Action | Control |
|---|---|
| Waddle | WASD or arrow keys |
| Honk repeatedly / launch nearby chairs | Hold Space or left mouse button |
| Dash through danger | Shift |
| Office-wide Reply All | E with a full meter |
| Pause / resume | Escape or P |
| Choose a promotion | Click a card, or press 1, 2, or 3 |
| Play with automatic honking | Personnel File → Auto-honk |

Desktop keyboard play is the primary experience. Touch buttons appear on devices with a coarse pointer. Personnel File also includes reduced motion, earned ties, achievements, and shared office codes. Choose **Casual Friday** on the title screen for more health, slower enemies and emails, and a weaker HR boss.

## What happens at work

A complete career takes roughly two minutes, plus time choosing promotions:

1. Survive a 30-second probation. Break three pieces of equipment for the optional KPI.
2. Choose a corporate superpower. Survive 35 seconds in Middle Mismanagement; cancel ten meetings for its KPI.
3. Choose another superpower. HR arrives ten seconds into the 55-second final shift. Defeat HR before the clock expires.
4. Enjoy your promotion to Chief Executive Goose, or voluntarily accept **Unpaid Overtime**. Overtime restores health and Reply All, preserves powers and score, brings HR back sooner, and increases difficulty. Each victory offers another round.

Honk loose orange chairs to launch them away from the goose. They bounce off furniture and bowl through coworkers; hit three coworkers with one launch for a strike. Security guards telegraph their charges. Sidestep them, interrupt them with a honk, or let them charge into a desk.

Company announcements change the action:

- **Compensation: Pizza:** pizza heals extra and distracts coworkers. Eating all of it ends their distraction early.
- **Mandatory Fun:** pink meeting zones warn before activating. Move out of them or dash through them.
- **Reply-All Apocalypse:** email senders fire fans of messages. Honking those emails charges your special.

HR has three health-based phases: “We’re like a family,” Performance Improvement Plan, and Exit Interview. Later phases mark your position with delayed meeting attacks; the final phase fires more paperwork. Reply All clears active emails and meeting hazards as well as damaging the whole office. The special cannot charge itself.

Sandwiches heal one health; pizza heals two. Lunch Acquisition adds one more and increases pickup range. Promotions heal two health, while Dental increases maximum health and fully heals. Optional KPIs award 500 points and one health. Rapid chains increase the score multiplier up to ×5; damage breaks the chain. Defeating HR early gives 25 points per remaining second.

## Nine promotion perks

| Perk | Effect |
|---|---|
| Executive volume | 35% more honk range, +1 damage |
| Unpaid espresso | 18% faster movement, 25% shorter honk cooldown |
| Dental, somehow | +2 maximum health, full heal |
| Reply-all privileges | Double charge from coworker hits, immediately fill Reply All |
| Emotional support tie | Dash twice as often; dashes damage coworkers |
| Lunch acquisition | Much larger snack magnet; snacks heal one extra |
| Chairman of the board | Chairs hit twice as hard and roll farther |
| Inbox zero | Honked-away emails add 4% Reply All charge |
| Union-mandated break | +1 maximum health; taking damage stuns nearby coworkers |

## Records and replay

Nine career awards and four tie colors provide longer-term goals. Awards and records are banked at a career ending and after overtime rounds. Career and Casual Friday keep separate best scores and overtime records. Ties are cosmetic.

**Today’s Grievance** gives everyone on the same local calendar date the same Career seed. A shared office code such as `G-7321-C` or `G-7321-F` reproduces the seed and difficulty. Enter it in Personnel File while outside an active career. Identical actions reproduce identical outcomes; decisions can change later randomness and promotion offers. Replay the same office or try another from the performance review.

Settings and completed-career records use only `honk.profile`, schema version 1. The first HONK edition had no persistent profile; this is the initial save format. It never reads or writes SIDELINE, ECHO REQUIEM, or other games’ saves. Unknown versions and malformed existing profiles remain untouched. If browser storage is blocked or full, the game retains session progress and shows the storage status. **Active workdays are not saved.** Pause → Clock Out Early abandons that workday without recording a loss.

## Implementation

- `src/sim/honk.js`: seeded RNG, fixed 60 Hz ticks, collisions, chair physics, enemy navigation, combat, incidents, promotions, scoring, and overtime. No browser APIs.
- `src/sim/honk-content.js`: modes, incidents, achievement predicates, tie unlocks, and performance-review text.
- `src/contracts.js`: `HONK`, `HONK_PROFILE_VERSION`, and `HONK_PROFILE_KEY` shared contracts.
- `src/honk/main.js`: overlays, focus/visibility pause, settings, records, and the fixed-step accumulator.
- `src/honk/input.js`: keyboard and pointer sampling; short taps survive until the next fixed tick, held actions repeat, and losing focus clears all queued input.
- `src/honk/renderer.js`: procedural office illustration, characters, chairs, warning zones, effects, and reduced-motion presentation. Never mutates simulation state or RNG.
- `src/honk/audio.js`: bounded synthesized effects; no autoplay before interaction; active voices stop on pause, blur, or mute. A late browser resume cannot undo a newer pause.
- `src/honk/storage.js`: validated, independent profile copies, protected unknown formats, latest-record merging, and session fallback.
- `scripts/build-honk.mjs`: generates the portable file from source, validates bundled JavaScript syntax, and embeds every asset.

Edit source modules, then regenerate the portable file. Do not hand-edit the generated HTML. No game libraries were added. The existing games remain separate.

## Verification

```sh
node --test tests/honk*.test.js
npm test
npm run check
npm run build
```

The HONK suite contains mechanics, persistence, audio, read-only renderer, deterministic full-career, and endurance checks. The endurance pilot uses ordinary simulation actions across twenty combinations of seed and difficulty, then plays overtime. It also completes a keyboard-direction run and two additional bosses. These are simulation tests, not substitutes for browser acceptance or human difficulty testing.

### Playwright acceptance

`tests/browser-honk.mjs` is a standalone acceptance runner using an existing Playwright installation. It launches an isolated context, sends keyboard/mouse/touch input, reads copied game snapshots, and collects screenshots and a JSON report under `output/playwright/honk/`. It has no force-win or world-write path.

```sh
HONK_BROWSER_CHANNEL=chrome node tests/browser-honk.mjs
```

If Playwright is installed outside this repository, set `HONK_PLAYWRIGHT_MODULE` to its absolute `index.mjs` path. `HONK_HEADED=1` shows the browser; `HONK_URL` can target the development server instead of the portable file. The runner covers controls, settings, promotions, victory, overtime, save persistence, daily play, narrow layouts, and touch controls. A report of `blocked` or `failed` is not acceptance.

See `docs/HONK_VALIDATION.md` for the actual results and environment limitations from this build. No CI, commit, push, or remote release is implied by local validation.
