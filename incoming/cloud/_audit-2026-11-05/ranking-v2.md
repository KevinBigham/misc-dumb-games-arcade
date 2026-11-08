# Games audit v2: 20-game ranking (2026-11-05)

An independent second audit. It was written without relying on deep-audit.md, which is left untouched. The bar is Kevin's: "fun and addicting as HELL", and phone-first (touch, portrait, one hand, the pull to play one more run).

**Source.** Every game was read from its current published version with the Artifact tool's read action. That covers all 20, including Nine Lives Overdrive (version 1793768462-2b34, 188.1 KB), which was added mid-audit at the coordinator's request. Line numbers below are HTML line numbers in those current copies.

---

## 1. Method

1. **Syntax.** I pulled every inline script out of each game and ran `node --check` on it. All 20 games pass.
2. **Smoke test, headless.**
   - The harness is jsdom 24.1.3 with stubs for:
     - the canvas 2D context (a Proxy), AudioContext, Path2D, CanvasRenderingContext2D and matchMedia
     - the phone profile: a 390x844 viewport, devicePixelRatio 3 and maxTouchPoints 5
   - Each game boots fresh. Then it gets synthetic touch, pointer and mouse input: taps, drags and holds across the screen, plus its start buttons.
   - Errors are caught from window.onerror, unhandled rejections and console.error.
   - A localStorage spy finds each game's save keys.
3. **Corrupt saves.** There were 122 jobs. Each save key was preset to:
   - broken JSON, `[]`, `null`, `42`, `{"x":1}`, `"hello"`
   - type-corrupted versions of real saves
4. **Balance sims.** I lifted pure game logic into Node and drove it with bots, or used a game's own bot hooks:
   - **Extracted cores:**

     | Game | Extracted part |
     |---|---|
     | Gloamrush | core, plus its own tests |
     | Comet Orchard | economy |
     | Lantern Drum | pure chart core |
     | Spore Siege | simulation |
     | Moonpond Angler | fishing logic |
     | Kettle Crawl | KC module |
     | Gravity Moth | module.exports core |
     | Lagoon Flip | LagoonCore |
     | Bug Brawl | API |

   - **Nine Lives:** I used its own `window.__bot` and `window.__speed` hooks inside jsdom.
5. **Code read.** I read every game for its input handlers, visibility handling, DPR caps, save validation, daily logic and unlock pacing.

**Scoring.** There are seven axes, each out of 10 (70 total):

- Hook: the first 30 seconds
- Loop: how the core loop feels
- Depth: depth and progression
- Pull: the one-more-run pull
- Phone: phone fitness
- Polish
- Bugs: higher means cleaner

The scores are my judgement, grounded in the measurements above. Bots stand in for players; they are not players.

---

## 2. Ranking

| # | Game | Hook | Loop | Depth | Pull | Phone | Polish | Bugs | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Gloamrush | 9 | 9 | 8 | 8 | 9 | 9 | 9 | **61** |
| 2 | Gravity Moth | 9 | 8 | 5 | 8 | 10 | 8 | 9 | **57** |
| 3 | Stormglass | 9 | 9 | 6 | 8 | 9 | 8 | 7 | **56** |
| 4 | Moonpond Angler | 8 | 6 | 7 | 8 | 8 | 8 | 9 | **54** |
| 5 | Nine Lives Overdrive | 8 | 8 | 8 | 7 | 7 | 8 | 8 | **54** |
| 6 | Spore Storm | 8 | 8 | 7 | 6 | 8 | 8 | 9 | **54** |
| 7 | Kettle Crawl | 7 | 8 | 8 | 7 | 8 | 8 | 7 | **53** |
| 8 | Kiln Words | 7 | 8 | 6 | 7 | 8 | 8 | 9 | **53** |
| 9 | Spore Siege | 7 | 7 | 6 | 6 | 8 | 8 | 9 | **51** |
| 10 | Bug Brawl | 7 | 7 | 6 | 7 | 8 | 7 | 9 | **51** |
| 11 | Comet Orchard | 8 | 6 | 6 | 7 | 9 | 8 | 6 | **50** |
| 12 | Shardstorm Depths | 6 | 7 | 7 | 6 | 8 | 7 | 9 | **50** |
| 13 | Clockbreak | 7 | 7 | 6 | 6 | 8 | 7 | 9 | **50** |
| 14 | Lagoon Flip | 7 | 7 | 5 | 6 | 7 | 8 | 9 | **49** |
| 15 | Glowtail Rumble | 8 | 7 | 4 | 6 | 8 | 7 | 9 | **49** |
| 16 | Nebula Greens | 7 | 7 | 5 | 4 | 8 | 8 | 9 | **48** |
| 17 | Wobble Bakery | 8 | 7 | 3 | 6 | 9 | 7 | 6 | **46** |
| 18 | Lantern Drum | 6 | 7 | 4 | 6 | 7 | 8 | 8 | **46** |
| 19 | Slipstreak | 6 | 6 | 5 | 5 | 7 | 7 | 9 | **45** |
| 20 | Frostbore | 6 | 6 | 6 | 6 | 5 | 6 | 8 | **43** |

**Tie-breaks.** Where totals tie, I ordered by Pull, then Phone, because those two are Kevin's bar.

**Tiers.**
- **Gloamrush** is alone at the top.
- **Gravity Moth and Stormglass** form a clear second tier.
- **Ranks 4 to 8** are close together.
- **The bottom five** each have one structural problem that holds them back.

---

## 3. Per-game evidence

### 1. Gloamrush (61)
- **Its own suite passes on the current artifact:** 31 core tests and 38 app tests.
- **Fresh bot, 12 seeds:** 4 wins, with an average run of 191 s. Milestones:
  - first level-up at about 5 to 8 s
  - first wildfire at about 55 s
  - first evolution at about 95 s
  - an evolution before 180 s in 11 of 12 runs
- **Pacing.** That is excellent: something new happens every few seconds and a power spike lands inside the first two minutes.
- **Controls.** A floating stick works anywhere on screen (radius 52). The 3-minute run and the 3-phase boss at 180 s make it truly one-thumb.
- **Content:**
  - 30 moths: 15 common, 8 uncommon, 5 rare and 2 mythic
  - rarity weights 70/22/7/1, with mythic raised to 6 in Long Night
  - unlocks gated by act, hero, wildfire, evolutions, Long Night and boss
  - a Long Night vs cash-out choice at the end
- **Weakness: meta progression is short.**
  - META (line 309) costs 5,410 glow in total: wax 900, pot 1,200, wings 700, reach 500, wide 540, start 720, reroll 450, wind 400. Heroes cost 350 and 800.
  - The progression sim maxed all META in 6 runs on one seed and 8 runs on the other. A winning run pays about 860 to 1,286 glow.
  - META and heroes are the only glow sinks.
  - Nothing raises the difficulty after a win; Long Night is the only extension.
  - From about run 8, glow, missions and offline income (capped at 67/h for 8 h, so 536) have nothing left to buy.

### 2. Gravity Moth (57)
- **Controls.** Tapping anywhere is the whole control (a window pointerdown). It is the best one-hand fit of the 20 games, so Phone gets a 10.
- **Wing thresholds** are 2,600, 9,000 and 22,000 px. The bot reached them at 13.4 s, 39.2 s and 79.6 s.
- **Speed** approaches a ceiling of 400 (it was 397 by 179 s).
- **Content ends at 80 s.** After the last wing at about 80 s, nothing new appears. The lookahead bot hit the 10-minute cap in 2 of 4 runs, so a skilled run turns into a long, flat survival stretch.
- **Characters** cost 3,370 pollen in total, at about 1.2 pollen/s, so roughly 47 minutes of play unlocks everything.

### 3. Stormglass (56)
- **Strengths.** The merge-drop hook is immediate and readable, with a strong "one more" pull and a daily.
- **Bug: the preview is wrong.**
  - The NEXT box draws `st.nextTiers[0]` (line 933). That is the orb you are holding now: drop uses `nextTiers[0]` (line 360) and the hover orb uses it too (line 835).
  - The Forecast corner draws `nextTiers[1]` (line 937). That is the real next orb, but it is gated behind the Forecast perk (4,000 best score).
  - The perk is labelled "see 2 drops ahead" (line 170), but it shows only 1 ahead.
  - So without the perk, players never see what comes next. For a merge game, that is the main strategic information.

### 4. Moonpond Angler (54)
- **Hook.** The first bite is forced at 1.5 to 2.5 s with a +0.15 window, which is a great first 30 seconds.
- **Collection** is the hook:
  - dex 20 at night 8
  - dex 28 at night 29
  - dex 30 at night 88
  - gear costs 11,140 in total and was maxed at night 30
- **Weakness: fights are too easy.** A sensible tension policy never lost a fight, so the loop has little skill tension.

### 5. Nine Lives Overdrive (54)
- **Status.** Read successfully. 0 errors on a fresh boot and on all corrupt-save variants except one, described below.
- **Content is the deepest of the action games:**
  - 5 sectors: sector 1 lasts 75 s and the others 95 s, each ending in a boss (1,500 to 20,000 hp)
  - 11 enemy types; 7 weapons in 4 slots; 30+ upgrades
  - 5 cats costing 0, 250, 400, 600 and 1,500 fish (Sofie needs a win)
  - 3 difficulties; endless mode after a win
- **Economy:**
  - XP curve: `6+(l-1)*6+(l-1)^1.6*0.9`
  - the SHOP costs 11,040 fish in total
  - fish earned = kills/18 + 55 per boss + 5 per fish pickup + 150 per win, times the difficulty multiplier
- **Balance: the default difficulty is too easy.**
  - The game's own `__bot` with zero meta won 3 of 3 runs on Alley Cat, the default. Each took about 11 minutes, with about 8,000 kills, level 50, and 1,042 to 1,291 fish per win.
  - On Feral it died in sector 2 (151 s) and in sector 1 (109 s).
- **Phone:**
  - The stick only starts where `clientX < W*0.6` (line 2432).
  - DASH (86 px) and ZOOMIES (72 px) buttons sit on the right, so the game needs two thumbs.
  - Auto-aim on touch is good. The pause button is 44 px, and upgrade cards switch to 1 column under 760 px.
  - An 11-minute run is long for phone sessions.
- **Bugs:**
  - **Background audio.** visibilitychange only calls pauseGame (line 2415) and never suspends the AudioContext. Music runs on `setInterval(25)`.
  - **Tampered save.** A save with `"diff":"abc"` crashes the select screen: `DIFFS[save.diff].desc` is undefined (line 2201).
- **Against Gloamrush.** It has more per run than Gloamrush, but fits the phone worse.

### 6. Spore Storm (54)
- **Code.** Same core formulas as Gloamrush, which descends from it.
- **Meta:**
  - META costs 6,650 plus 1,150 for heroes
  - glow per run = score/30 + 150 on a win + a bonus
- **Gaps.** No daily, and less moment-to-moment texture than Gloamrush.

### 7. Kettle Crawl (53)
- **Content.** A deckbuilder with 38 cards, 17 relics, 2 witches and 13 unlocks up to 480 leaves.
- **Run shape.** A single 8-layer act.
- **Boss wall.** A naive bot won 1 run in 60, while 46 of 60 reached the boss: the Iron Samovar, 72 hp, then a 92 hp phase.
- **Meta.** Leaves = 3 x cleared + 5 x elites + kills/2 + 6, +25 on a win.
- **Bug: music runs while hidden.** Music uses `setInterval(musTick,90)` (line 568), and this is the only game with no visibilitychange handler at all.

### 8. Kiln Words (53)
- **Content.** A 17,814-word dictionary (3 to 8 letters, profanity filtered) on a 6x9 grid.
- **Pacing.** The rise timer is `max(3, 8-0.022t)`, a clean pressure ramp.
- **Phone.** A strong fit for portrait.

### 9. Spore Siege (51)
- **Naive bot:**
  - Map 0: a win with 20/20 lives
  - Map 1: a win with 6/20 lives
  - Map 2: a loss at wave 15
  - Endless: reaches about wave 24
  - Early-send loses
- **Meta.** Perks cost 327 mycelium in total, so the meta is short.

### 10. Bug Brawl (51)
- **Difficulty.** The naive bot dies in rounds 9 to 16.
- **Unlocks.** All 9 unlocks (8 to 260 amber) come in about 25 runs.
- **Mute icon.** It is an emoji drawn with fillText, so it depends on the device's font.

### 11. Comet Orchard (50)
- **Hook.** Great: the first buy comes at 5 s.
- **Bug: the economy runs away.** At 2 or 5 taps/s:
  - first Supernova at 15 to 17 min
  - seeds: 16 at about 90 min, 705 at 105 min, millions by 114 min
  - the tree completes (10/10, 42 seeds) at about 80 to 120 min
  - 35 of 36 achievements by 2 h
  - 7e20 per second by 120 min
- **Cause:**
  - `globalMult` (line 365) is 1 + 0.1 x seeds. It is linear, and spent seeds still count.
  - `seedGain` (line 379) is `floor(sqrt(runEarned/SEED_K))`.
  - Milestones also give x2 at 8 thresholds per tier.
- **Result.** The game is functionally finished in an evening.

### 12. Shardstorm Depths (50)
- **Strength.** Match-and-descend with a reshuffle on deadlock (freshGridWithMove / reshuffleGrid), so it never soft-locks.
- **Weakness.** A slower hook than the rest of the top half.

### 13. Clockbreak (50)
- **Meta.** Unlocks cost 2,790 cogs in total. The floor bonus is 2+n (+2), and salvage is bricks/8.
- **Overall.** Competent, with no standout hook.

### 14. Lagoon Flip (49)
- **Balance.** A crude pinball bot scored a median of about 0.8 to 1.0 M and a maximum of 12.8 M, with games lasting 1 to 2 min.
- **Weakness.** Cosmetic unlocks sit at 750 K to 10 M, so they arrive almost at once.
- **Phone.** Two flipper zones need two thumbs, which is fine but not one-handed.

### 15. Glowtail Rumble (49)
- **Strengths.** A fast, punchy hook.
- **Weakness.** Shallow progression.
- **Save issue.** It echoes type-corrupt fields back into the save (low severity).

### 16. Nebula Greens (48)
- **Strength.** A clean mini-golf loop.
- **Weakness.** The weakest one-more-run pull of the set, because finishing a course is a natural stopping point.
- **Save issue.** Type-echo save issue (low severity).

### 17. Wobble Bakery (46)
- **Strengths.** A physics-stacking hook that works well on phones.
- **Weaknesses:**
  - Themes cost 60 to 550 lifetime, which is shallow.
  - The Strawberry theme's tolerance is 12 against the standard 8.
- **Risk.** It has a hard dependency on cdnjs Matter.js 0.19.0 (line 127).
  - It degrades gracefully, showing "Oven's still cold".
  - Still, if the CDN is blocked, the game cannot be played.

### 18. Lantern Drum (46)
- **Start and ramp.** It starts at 96 BPM (70 notes in the first 45 s). A new tier comes every 16 bars, up to 184 BPM at bar 177 (about 326 s, 1,396 notes).
- **Calibration** and an offset nudge exist, which is good.
- **Kits** unlock at 400, 1,200 and 3,000 notes; three kits is thin.
- **Bug: the daily uses UTC.** It uses `todayUTC()` via toISOString (line 311), so it rolls over at UTC midnight, not local midnight.

### 19. Slipstreak (45)
- **Overall.** Playable and clean, but generic, with a weak pull.

### 20. Frostbore (43)
- **Phone flaw.** During a dive, only touches inside `inDpad` work: a radius of 2r at the bottom-left (line 376).
- **Cause.** The comment at line 387 says "keep simple: nothing" for touches anywhere else, so most of the screen does nothing during the core loop.

---

## 4. Bugs (game, symptom, cause, fix)

| # | Game | Symptom | Cause | Fix |
|---|---|---|---|---|
| 1 | Stormglass | NEXT shows the orb you already hold; Forecast shows 1 ahead, not the 2 its label promises | NEXT draws `nextTiers[0]` (l.933), which is the current drop (l.360, l.835); Forecast draws `nextTiers[1]` (l.937) | NEXT draws `nextTiers[1]`; grow the queue to 3 and have Forecast draw `nextTiers[2]` |
| 2 | Comet Orchard | Economy runs away after about 90 min; everything done in about 2 h | Linear, uncapped `globalMult = 1+0.1*seeds` (spent seeds count) against sqrt `seedGain`, plus x2 milestones | Diminishing seed bonus (for example `1+k*sqrt(seeds)`) or cube-root gain; add late content |
| 3 | Kettle Crawl | Music keeps scheduling while the tab is hidden; likely audible in the background on Android | `setInterval(musTick,90)` (l.568) and no visibilitychange handler | On visibilitychange or pagehide, call `ctx.suspend()` and clear the interval; resume on visible |
| 4 | Nine Lives Overdrive | Same background-audio issue | visibilitychange only calls pauseGame (l.2415); the AudioContext is not suspended; music on `setInterval(25)` | Same fix as Kettle |
| 5 | Frostbore | During dives, most of the screen ignores touch | Only touches inside `inDpad` (l.376) are handled; elsewhere "keep simple: nothing" (l.387) | A floating D-pad anchored where the thumb lands, or swipe-to-dig |
| 6 | Lantern Drum | Daily rolls over at UTC midnight | `todayUTC()` uses toISOString (l.311) | Use a local-date key, as the other games do |
| 7 | Wobble Bakery | Cannot be played if cdnjs is unreachable | External Matter.js script (l.127) | Inline Matter.js, or keep a bundled copy as a fallback |
| 8 | Nine Lives Overdrive | A tampered `diff` value crashes the select screen | `DIFFS[save.diff].desc` is undefined (l.2201) | Check `save.diff` against DIFFS on load and reset it to the default |
| 9 | Glowtail, Nebula, Spore Storm, Stormglass | Hand-edited wrong types are written back into the save | No per-field type checks on load | Per-field type and range checks on load (low severity; ordinary play never hits it) |

**Clean results.**
- A fresh boot with touch input threw 0 runtime errors in all 20 games.
- The structural corrupt-save variants (bad JSON, `[]`, `null`, `42`, `{"x":1}`, `"hello"`) were clean in all 20.
- Every game caps devicePixelRatio at 2 to 3.

---

## 5. Balance summary

| Game | Finding |
|---|---|
| Gloamrush | META maxed after 6 and 8 runs; no post-win difficulty ladder |
| Nine Lives Overdrive | Its own naive bot beats the default difficulty on run 1 with zero meta |
| Kettle Crawl | Boss wall: 1 win in 60 with 46 of 60 reaching the boss; only one act |
| Gravity Moth | Content plateaus at about 80 s; a skilled run can last 10+ minutes with nothing new |
| Moonpond Angler | Fights are forgiving; dex 30 needs about 88 nights, which is a good long tail |
| Comet Orchard | Runaway economy, as above |
| Lagoon Flip, Bug Brawl | Unlocks arrive fast: immediately for Lagoon, about 25 runs for Bug Brawl |
| Lantern Drum | Slow start at 96 BPM; only 3 kits |
| Spore Siege | Fair curve on maps 0 and 1, and map 2 is a real wall; meta short at 327 |

---

## 6. Highest-leverage upgrade for each of the top 3

1. **Gloamrush.** Add a post-win difficulty ladder: "Nights" heat levels, each adding enemy or boss modifiers with a higher glow payout.
   - Reprice META geometrically, or add a new glow sink.
   - That way glow, missions and offline income still matter after about run 8, when they currently go hollow.
2. **Gravity Moth.** Add content after the 80-second mark: a wing V, later chunk pools and new hazards, plus unlocks gated by distance.
   - The skill ceiling is already there; give the long run something to find.
3. **Stormglass.** Fix NEXT so the true next orb shows for free, and make Forecast a genuine 2-ahead.
   - Next-piece information is the strategic core of a merge game, and right now it is hidden behind a 4,000-point perk.

---

## 7. Did Gloamrush beat the games it borrowed from?

**Yes, overall.** It is the best game in the set. But the long-term layers it borrowed are the weakest part of it.

- **Against Spore Storm (combat core): clear win.**
  - It shares the formulas: xpFor, hpMul, caps and metaCost.
  - It adds graze, chain, wildfire, hearth-stone banking, the Long Night vs cash-out choice, a 3-phase boss at 180 s and more evolutions.
  - It also inherits Spore Storm's fast meta and makes it faster: META costs 5,410 against Spore Storm's 6,650.
- **Against Gravity Moth (missions): equal or better.** Missions were ported, and a streak shield was added.
- **Against Moonpond Angler (collection): about a wash.**
  - Per catch, it is shallower: there is no fight.
  - It is better integrated: moths are gated by hero, act, Long Night and boss.
  - Moonpond's dex is still the better collection on its own.
- **Against Comet Orchard (offline income): did not land.** At most 536 glow a day means nothing once META is maxed after 6 to 8 runs.
- **Against Stormglass (unlock bar): ported** faithfully.
- **Against Nine Lives Overdrive (not a source, but the closest rival):**
  - Nine Lives has more content per run.
  - Gloamrush fits the phone better: one thumb, a stick anywhere, and 3-minute runs against 11-minute runs that need two thumbs.

**Net.** Gloamrush won on the second-to-second loop and on phone fit, and that is why it ranks first. It did not win on retention depth: the borrowed meta, offline and mission systems all run dry by about run 8.

---

## 8. What could not be tested

- **Real-device feel:** touch latency, thumb reach, frame rate on mid-range phones, haptics, and true multi-touch (the multi-touch was synthetic).
- **Sound:** all audio was stubbed. Mix, loudness and music quality are unheard.
- **Visuals:** the canvas was stubbed, so there were no screenshots and no real browser rendering.
- **Wobble Bakery physics:** I injected a local Matter.js 0.19.0 copy because the sandbox blocks cdnjs. Physics feel was not assessed.
- **Human balance:** bots are only proxies for players.
- **No balance sim** (code read only): Glowtail, Slipstreak, Clockbreak, Shardstorm, Nebula, Frostbore, Wobble, Kiln and Stormglass.

---

## 9. Reproduction

Scratchpad: `/tmp/claude-0/-home-user/d76f6040-fb94-545f-b912-b02d7858f48b/scratchpad/audit2`

| Path | Contents |
|---|---|
| `games/*.html` | The 20 current copies read with the Artifact tool |
| `scripts/<game>.N.js` | Extracted inline scripts |
| `src/harness.js` | jsdom smoke harness: fresh or corrupt mode; env LS_PRESET, DUMP_LS, EVAL, STK |
| `src/corrupt.js` | The 122 corrupt-save jobs; results in `out/corrupt.json` |
| `src/syncheck.js` | Script extraction and syntax check |
| `src/gr-core.js`, `gr-bot.js`, `gr-prog.js`, `gr-test-core.js`, `gr-test-app.js` | Gloamrush |
| `src/comet-econ.js`, `comet-sim.js` | Comet Orchard |
| `src/lantern-pure.js` | Lantern Drum |
| `src/siege-sim.js`, `siege-bot.js` | Spore Siege |
| `src/moon-logic.js`, `moon-sim.js` | Moonpond Angler |
| `src/kc-core.js`, `kc-bot.js` | Kettle Crawl |
| `src/moth-core.js`, `moth-bot.js` | Gravity Moth |
| `src/lagoon-core.js`, `lagoon-bot.js` | Lagoon Flip |
| `src/bb-core.js`, `bb-bot.js` | Bug Brawl |
| `src/nine-prog.js` | Nine Lives |
| `deps/node_modules` | jsdom 24.1.3 and matter-js 0.19.0, installed with --ignore-scripts |

Run everything with Node 22: `/opt/node22/bin/node`.
