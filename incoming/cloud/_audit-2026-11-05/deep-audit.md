# Deep Feature Audit: 21 Phone-First Browser Games

Date: 2026-11-05
Scope: all 21 games, current published versions.
Goal: (1) find the best retention and feel features across the catalog, (2) design the best possible game by combining them.

> **This is a code read, not hands-on play.** I fetched each game's live source and read it, and I syntax-checked every script with Node. Nothing here comes from playing on a phone. Tuning numbers come from the code's constants. "Feels great" means "the code does what usually feels great". The ratings are design judgment and need a 10-minute phone playtest to confirm.

---

## 0. Method and scorecard

**Sources.** Each game's current page file was fetched on 2026-11-05 with the Artifact read action (versions below). The earlier reviewer's copies were used only to diff the games that changed:
- Spore Storm gained the Evolution system.
- Stormglass gained Hold/Swap and finer aiming.
- Gravity Moth gained the Wing biome tiers.
- Bug Brawl got a one-line tap fix.

The other eight Opus games match the earlier copies byte for byte in their scripts.

**Static checks.** All 21 scripts parse cleanly in Node `vm.Script`. Two games load from a CDN:
- Wobble Bakery needs `matter-js 0.19.0`.
- Franchise Dynasty needs `lz-string 1.5.0`.

No headless browser was available, so I ran no runtime smoke tests.

| Game | Version read | Genre (from code) |
|---|---|---|
| Comet Orchard | 1793854216-55e2 | Idle/incremental, tap + prestige |
| Lantern Drum | 1793854570-0f09 | Procedural 4-lane rhythm |
| Wobble Bakery | 1793854894-1ed3 | Physics stacker (Matter.js) |
| Gravity Moth | 1793883620-e948 | One-tap gravity-flip runner |
| Kettle Crawl | 1793855238-f44c | Card-battler roguelike |
| Spore Siege | 1793878465-38a4 | Tower defense, 3 maps |
| Lagoon Flip | 1793879081-365a | Pinball with full rule set + DMD |
| Kiln Words | 1793879317-ef9d | Word-path puzzle with rising pressure |
| Moonpond Angler | 1793878169-3662 | Night fishing + collection |
| Stormglass | 1793884659-fe2f | Drop-and-merge physics puzzle |
| Spore Storm | 1793885400-6614 | Arena auto-shooter survival roguelite |
| Nebula Greens | 1793855022-bff1 | Mini golf, 18 holes |
| Glowtail Rumble | 1793854711-92e9 | 3-minute growth arena vs bots |
| Shardstorm Depths | 1793855241-f744 | Match-3 RPG battler |
| Bug Brawl | 1793883555-c362 | Merge auto-battler |
| Slipstreak | 1793878238-d4f9 | Top-down drift time-trial with ghosts |
| Frostbore | 1793881635-1881 | Dig-down push-your-luck miner |
| Clockbreak | 1793878587-7397 | Brick-breaker roguelite |
| Franchise Dynasty | 1793852831-eec4 | Football GM sim (text) |
| Negative Split | 1793852116-1596 | Swim-race cadence game |
| Nine Lives Overdrive | 1793768462-2b34 | Large survivor roguelite, 5 bosses |

### My scorecard (code read, out of 70)

Seven axes at 10 points each: **Hook** (first 30 s), **Feel** (juice), **Depth** (meaningful choices), **Meta** (long-term progression), **Return** (daily, offline or streak reasons to come back tomorrow), **Thumb** (phone controls), **Audio**.

| Rank | Game | Hook | Feel | Depth | Meta | Return | Thumb | Audio | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Comet Orchard | 10 | 8 | 7 | 10 | 8 | 9 | 6 | **58** |
| 2 | Gravity Moth | 9 | 8 | 6 | 8 | 9 | 10 | 7 | **57** |
| 3 | Spore Storm | 9 | 10 | 9 | 9 | 1 | 9 | 9 | **56** |
| 3 | Moonpond Angler | 8 | 8 | 7 | 9 | 9 | 9 | 6 | **56** |
| 5 | Stormglass | 9 | 8 | 7 | 7 | 8 | 9 | 7 | **55** |
| 5 | Lantern Drum | 8 | 8 | 6 | 6 | 9 | 8 | 10 | **55** |
| 7 | Lagoon Flip | 7 | 8 | 9 | 6 | 9 | 8 | 7 | **54** |
| 8 | Kiln Words | 6 | 8 | 8 | 8 | 9 | 8 | 6 | **53** |
| 9 | Nine Lives Overdrive | 7 | 10 | 10 | 8 | 1 | 7 | 8 | **51** |
| 10 | Clockbreak | 8 | 8 | 8 | 6 | 1 | 8 | 8 | **47** |
| 10 | Shardstorm Depths | 7 | 9 | 8 | 6 | 1 | 9 | 7 | **47** |
| 10 | Wobble Bakery | 9 | 9 | 5 | 5 | 1 | 10 | 8 | **47** |
| 10 | Nebula Greens | 8 | 8 | 6 | 7 | 2 | 9 | 7 | **47** |
| 14 | Kettle Crawl | 5 | 6 | 10 | 7 | 3 | 7 | 6 | **44** |
| 15 | Spore Siege | 6 | 6 | 8 | 7 | 2 | 7 | 6 | **42** |
| 15 | Glowtail Rumble | 8 | 8 | 5 | 5 | 1 | 8 | 7 | **42** |
| 17 | Frostbore | 6 | 7 | 7 | 8 | 1 | 5 | 7 | **41** |
| 18 | Slipstreak | 7 | 7 | 6 | 7 | 1 | 7 | 5 | **40** |
| 19 | Bug Brawl | 5 | 6 | 8 | 5 | 1 | 6 | 6 | **37** |
| 20 | Franchise Dynasty | 4 | 1 | 10 | 8 | 3 | 5 | 0 | **31** |
| 21 | Negative Split | 5 | 3 | 6 | 3 | 1 | 5 | 6 | **29** |

How this compares with the prior ranking:
- **Spore Storm has the best moment-to-moment play in the catalog.** It loses only on Return: it has no daily, no streak and no offline hook. Adding a daily run plus 3 daily missions would lift it to about 64 and make it the clear number one.
- **Comet Orchard ranks first** because its return loop is the strongest in the set.
- **Clockbreak drops** from the prior 58. Its level-up offers are pure uniform random (`offerPicks`) and it has no reason to come back tomorrow.

---

## 1. Feature catalog

The strength score (1-10) rates how strong the best implementation in the catalog is, not the average one. Function names are cited so a builder can open the code and copy it.

### A. Moment-to-moment feel and juice

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Hitstop scaled to how big the event is** | Spore Storm `hitstop()` (capped at 0.12 s, 0.014 per kill, 0.06 per brute, 0.32 for an evolution); Stormglass `doMerge` sets `st.freeze` by tier (`0.03+t*0.012` for tier 3 and up); Frostbore `breakTile` (0.09/0.14 by ore value, 0.16 for a relic); Glowtail `onPlayerKill` (0.13); Shardstorm `hitstop(70)` on big hits; Comet `catchComet` (`R.hitstop=0.09`); Lagoon `jackpot` (`g.freeze=.18`) | Best: Spore Storm. One helper takes the maximum of the current and requested pause and caps it, so stacked kills never freeze the game. Small events get micro-stops; big events get long ones. | 9 |
| **Screen shake with a cap** | Nearly all; Spore Storm `shake(a)` caps at 26; Clockbreak `addShake`; Nine Lives `shake()` with an OFF/LOW/FULL setting | Best: Nine Lives, because the player can scale shake in Settings. Spore Storm has the best per-event tuning. | 8 |
| **Delayed "ghost" damage bar** | Nine Lives `P.ghostHp`; Shardstorm `mon.shownHp/targetShown` | The real bar drops at once and a pale bar drains behind it, so big hits read clearly. Cheap to add. | 7 |
| **Squash and stretch on contact** | Wobble `processLanding` (`p.sqv`; jelly pieces squash about 2x); Clockbreak `reflectOffPaddle` (`pad.sq=1`); Comet `harvest` (`R.kickV` tree kick) | Wobble's squash also scales with landing speed and drops to 0.4x under reduced motion. | 8 |
| **Slow motion for rare moments** | Moonpond `landFish` (`G.timeScale=0.28` for 0.85 s on rare or better, colored flash); Nebula `lipOut` (0.55) and hole-in-one (0.9); Wobble `gameOver` (Matter `timeScale=0.3` while the tower falls); Nine Lives `loseLife` (`G.slow=0.25`) | Best: Moonpond. It is gated by rarity, so the slow-mo itself tells you "this one is special". | 9 |
| **Floating score pops and praise** | Shardstorm `resolveBoard` (combo 2+ gives NICE / GREAT / AWESOME / UNREAL); Nebula `scoreName` (BIRDIE / EAGLE / ALBATROSS / HOLE IN ONE); Wobble `PERFECT!` plus a streak pop; Stormglass `popup` (size grows with tier) | A praise ladder turns a number into a feeling. Shardstorm's version is the template. | 7 |
| **Big-moment announcement banners** | Spore Storm `announce()` (wave names like "BEETLE WALL", plus a subtitle); Nine Lives `callout()`/`banner()`; Stormglass `setBanner` ("NEW SKY: CYCLONE", "next up: ???") | Banners double as tutorial lines ("auto-fire is on. move!"). | 8 |
| **Card pop-in with staggered timing** | Spore Storm CSS `.card` with an `@keyframes pop` delay per card; evolution cards get a gold `evoGlow` pulse and an EVOLUTION tag | Makes level-up feel like a reward rather than a menu. | 7 |
| **Off-screen arrows** | Nine Lives `drawIndicators` (chests, boss) | Needed in any arena larger than the screen. | 6 |
| **Aim preview** | Nebula `previewPath` (simulates one bounce off walls and bumpers) | Removes "I didn't know it would do that" frustration in aim games. | 8 |

### B. Combos, chains and power meters

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Near-miss chain** | Gravity Moth `nearReward` + `collide` loop (`NEAR=17` px, `CHAIN_WIN=2.6` s, multiplier `min(5,chain)`); flags a hazard while you are close, and **pays only once the hazard is fully behind a living moth** | The cleanest near-miss in the catalog, and it never rewards a near-miss that kills you. It turns fear into points. | 10 |
| **Meter that fills into a power state** | Gravity Moth `addGlow` then `startDash` (4 s Lamplight dash: smash hazards, 2.4x magnet); Nine Lives `activateZoomies` (7 s invincible, triple fire, ram); Stormglass bolt meter (`st.static` gives `boltNext`, `boltBlast` zaps tier 2 and below); Lantern `startFever` (combo 50, double points); Comet `catchComet` frenzies; Shardstorm hero charge then `heroUlts` | Best: Gravity Moth. Skill (grazes) feeds the meter, and the payoff (smashing the obstacles that scared you) answers the tension directly. Nine Lives has the best visual and audio payoff. | 10 |
| **Pickup chain with rising pitch** | Spore Storm `updateGems` + `AU.gem(n)` (`740*1.059^(n%10)`, 0.6 s window); Nine Lives `SFX.gem(P.pickStreak)`; Clockbreak `sfx.brick(combo)` (`2^(min(combo,18)/12)`); Glowtail `sfxEat(eatStreak)`; Wobble `sfx.chime(combo)`; Comet `sfxHarvest(combo)` | The cheapest, highest-return juice there is: the ear hears the combo build. Spore Storm's version is a one-liner. | 9 |
| **Combo multiplier with a timeout** | Stormglass `bumpCombo` (1.6 s window, up to x5); Comet tap combo (0.75 s); Clockbreak `scoreFor` (+10% per brick, reset on paddle touch); Glowtail kill combo (5 s); Lantern `multFor` (x2/x3/x4 at 10/25/50) | Clockbreak's "the combo resets when the ball touches the paddle" rule is elegant because it rewards long rallies. | 8 |
| **Chain reactions** | Clockbreak fuse bricks (`run.pending` explosions, chain freeze-frames at 4/8/12); Kiln ember/gold specials queue (`submit`); Spore Storm Wildfire Bloom evolution (each kill blooms, capped at 60 per frame); Shardstorm cascades | Chains plus a freeze-frame at milestones make one move feel like ten. | 9 |
| **Specials earned from big moves** | Kiln: 5 letters makes Ember (burns the row), 6 makes Glass (x2), 7+ makes Gold (3x3 blast) plus a pot; Shardstorm prism specials (`trySwap` prism logic) | The skill ceiling pays out in tools, not just points. | 8 |

### C. Run structure and in-run choice

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Pick 1 of 3 upgrade cards on level-up** | Spore Storm `rollChoices`/`renderCards`/`chooseUpgrade`; Nine Lives `rollChoices`; Clockbreak `offerPicks`; Shardstorm `showUpgrade`; Kettle `rewardPick` | Best: Spore Storm, with three layers: (1) a ready evolution always takes slot 1 and survives rerolls; (2) a guaranteed "build slot" for your most-invested recipe ingredient; (3) weighting of `1+0.5*stacks`, tripled for the missing half of a half-maxed recipe. Clockbreak's uniform random pick is the weak version. | 10 |
| **Fusion evolutions** | Spore Storm `EVOS` + `evoReady`/`evoHint`/`applyEvo` (6 recipes: two maxed upgrades fuse into a super-weapon); Nine Lives (7 evolutions, `u.req()`) | Spore Storm's `chooseUpgrade` announces "MAX · evolves with X or Y". That teaches the recipe at the exact moment it matters. `applyEvo` fires a full juice package (0.32 s hitstop, flash, shake 22, fanfare, 300+ particles, a shockwave clearing enemy bullets). | 10 |
| **Rerolls as a meta resource** | Spore Storm (`META.reroll`, `reroll()`); Nine Lives (`rerolls: 1+meta`); Bug Brawl `reroll` + free-reroll unlock | Gives a "save my run" lever and a meta sink. | 7 |
| **Scripted wave beats on top of a spawn curve** | Spore Storm `WAVES` (named rings at 25/50/75/100/125 s, boss warning at 145 s, boss at 150 s); Nine Lives `updateDirector` (events every 28-40 s, elites every 20-30 s); Lantern tier every 16 bars (+8 BPM, up to 184) | Named beats give a run a story shape and natural stopping points. | 8 |
| **Multi-phase boss with telegraphs** | Spore Storm `updateBoss` (chase, telegraph, charge, rest; rings, spirals, aimed fans; phase changes at 66% and 33% with roar and music change); Nine Lives `drawBossTelegraphs`; Shardstorm countdown badge plus `monsterAttack` windup; Kettle `intentInfo` | Telegraphs make deaths feel fair; phase changes give mid-fight peaks. | 9 |
| **Visible enemy intents** | Kettle `intentInfo` ("Attack for 12 x2", "Something huge is coming next turn!"); Shardstorm monster countdown | Essential in turn-based play: it creates the plan, then the payoff. | 8 |
| **Elites that drop better loot** | Nine Lives elite crates use `rollChoices(minR)` with a rarity floor | Gives the player a reason to hunt danger. | 7 |
| **Push-your-luck banking** | Slipstreak `bank` (drift points stay pending and are banked by multiplier; a wall hit loses them); Frostbore `retHeat` (the heat bar shows a "need" marker for the trip home; `endDive('frozen')` keeps 50%); Spore Siege `sendEarly` (`earlyBonus = timer*(1+.12*wave)`); Nine Lives endless "KEEP GOING / CASH OUT" | Best: Frostbore. It shows you the risk explicitly (the return-heat marker plus a danger flag when heat drops below 1.15x the return cost). Slipstreak is a close second for feel. | 9 |
| **Queue control** | Stormglass `holdSwap` (one hold per drop; bolts can't be held); Stormglass "Forecast" perk shows 2 drops ahead | Turns luck into a plan. | 6 |
| **Anti-stall helper** | Clockbreak `reflectOffPaddle` (after 6 s without breaking a brick, the ball bends toward the remaining bricks) | Invisible to the player; prevents the boring tail end of a level. | 6 |
| **Biome or act tiers with a "first visit" banner** | Gravity Moth Wing tiers (`tierAt`: 2600/9000/22000 distance; `WING n · FIRST VISIT`); Spore Storm music mode change at the boss | Distance becomes discovery. | 7 |

### D. Meta progression

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **"Next unlock" progress bar on the results screen** | Stormglass `nextUnlock` (picks the unlock **closest to done by ratio**, animated bar, "X pts to go"); Spore Storm `endRun` unlock box ("READY in the Armory!"); Spore Siege, Wobble, Bug Brawl, Clockbreak, Lantern, Slipstreak `nextUnlock` variants; Comet `goalInfo` (always-visible next goal with an ETA) | Best: Stormglass, for picking the closest goal, plus Comet's in-session `goalInfo` with an ETA. This is the strongest "one more run" device in the catalog. | 10 |
| **Permanent upgrade shop** | Spore Storm `META` (7 lines, cost `base*(lvl+1)`); Nine Lives Scratching Post; Frostbore 5 lines; Moonpond gear (rod, reel, bait, lantern; shows `cheapestNext`); Spore Siege perks; Shardstorm Forge (one-time purchases only) | Spore Storm's "Head Start" (a free pick at run start) and "Second Wind" (revive) are the most exciting purchases. Shardstorm's one-shot perks are the shallowest. | 8 |
| **Unlockable characters with one distinct perk each** | Gravity Moth `CHARS` (6: magnet, glow speed, dash length, shell, pollen value); Spore Storm `HEROES` (3); Nine Lives characters | Gravity Moth's "one perk per character" model is the cleanest: each one is a play-style hint. | 8 |
| **Stars or medals that gate content** | Nebula `starsFor` (3 for under par; 54 stars unlock 10 balls); Spore Siege 3-star by lives left (`showEnd`), towers unlocked by stars; Slipstreak medal times unlock tracks | Gives completionists replay on finished content. | 7 |
| **Prestige reset** | Comet `doNova`/`fireNova` (Seeds = `sqrt(runEarned/SEED_K)`, +10% each, Starseed tree) | Correct square-root curve, a big boom effect, and a clear explanation modal. | 8 |
| **Achievements that grant power** | Comet `checkAch` (each feat gives +% growth) | Better than cosmetic badges because each one moves the main number. | 7 |
| **Cosmetics** | Stormglass themes; Wobble themes; Glowtail skins; Nebula balls; Clockbreak workshop (paddle, ball); Slipstreak cars and paints; Lantern drum kits (these change the sound) | Lantern's kits are the best because they change the audio, not just the look. | 6 |
| **Mid-run save and resume** | Kettle `saveRun` (after every action); Spore Siege `sporeSiege.v1.run`; Nebula "RESUME HOLE" | Mandatory for runs over 5 minutes on a phone. | 7 |

### E. Return hooks

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Three rotating daily missions** | Gravity Moth `ensureMissions` (shuffles `MPOOL` with a date seed; 3 missions with tiered targets and rewards; mixes in-run and whole-day missions such as "Fly 5 runs today"); `missionsLive` tracks progress | The best daily system in the catalog. Day-scope missions pull you back for several sessions, not just one. | 9 |
| **Seeded daily run, "same for everyone"** | Lantern "Tonight's River" (`todayUTC`, `createGenerator` seed); Stormglass `startRun(true)` (`hashStr('stormglass-'+todayKey())`, separate gust RNG); Kiln "Tonight's Firing" `dailyLetters` | Stormglass splits its RNG streams (`rng`, `rngGust`) so the daily stays stable. Lantern has a rollover bug (section 4). | 9 |
| **Daily challenge with a badge streak** | Lagoon `dailyChallenge` (7 challenge kinds, FNV-1a + xorshift on the date) + `onBadge` (streak = yesterday's badge + 1) | **The only day-streak in all 21 games.** | 8 |
| **Daily bounty plus first-session bonus** | Moonpond `bountyFor` (a WANTED fish, 30% rare, 120/260 coins) + `endNight` first-night daily bonus | "Today's target" is a concrete hunting goal for a collection game. | 8 |
| **Offline gains with a "Welcome back" modal** | Comet `applyOffline` (up to 8 h at 50%; the Starseed node "deep" raises it to 12 h at 100%); handles tab gaps over 3 s and clamps clock rollback (`min(lastSave, now)`) | Solid. The "Gather it" button plays a fly-in burst, so collecting feels physical. | 9 |
| **Pause-safe pressure** | Kiln "Kiln banked" (nothing rises while you are away); `visibilitychange` auto-pause in 18 of 21 games | Hygiene, but its absence would be a reason to quit. | 6 |

### F. Collection and discovery

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Species book with rarity and personal bests** | Moonpond Pondpedia (`recordCatch` stores count + best kg; `isNew`/`isPB`; 30 species + junk "Oddments"; `renderDex`; spawns vary by zone, phase of night and bait via `spawnTable`) | The deepest collection. Phase-gated spawns make each night of play different. | 9 |
| **Generative collectible made from the player's own play** | Kiln Pottery Shelf (`addPot`/`potName`: every 7+ letter word becomes a uniquely named pot, kept with its date) | The most original feature in the catalog. Each item is personal, so the collection is never "done". | 9 |
| **Recipe book with ??? slots** | Spore Storm `renderEvoRow`/`renderEvoStrip` ("max Nova + ???", NEW tags, +60 glow per first discovery, saved at once in `applyEvo`) | Curiosity gap plus a reward for discovering. | 9 |
| **Tier ladder showing the next tier as ???** | Stormglass `refreshTitle` ladder dots ("6/11 skies discovered · next: ???") + "NEW SKY" banner | Turns a merge chain into exploration. | 8 |
| **First-find bonus** | Frostbore relics (`isNew` doubles value, "NEW RELIC!" plus hitstop); Spore Storm `EVO_GLOW` | Makes novelty pay. | 7 |
| **Golden variable-reward event** | Comet golden comet (`cometInterval` 60-120 s; `catchComet`: Starfall 55%, Windfall 30%, Comet Hands 15%); Wobble golden piece every 8th drop (x3); Lagoon skill shot | Comet's version is a textbook variable-ratio reward with a short timer to grab it. | 9 |

### G. Failure handling

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Second chance with a shockwave** | Nine Lives `loseLife` (full heal, 3 s invulnerable, 0.25 slow-mo, kills non-elites within 340 px, clears bullets); Spore Storm `hurtPlayer` revive branch (Second Wind meta, half HP, bullets cleared, 900 knockback); Shardstorm second wind; Gravity Moth Velvet Beetle shell; Lagoon ball save (8 s on launch, 12 s in multiball) | A death becomes a highlight instead of a stop. | 9 |
| **Partial keep on failure** | Frostbore `endDive('frozen')` keeps 50%; every roguelite here pays meta currency win or lose | Loss still moves the bar, so "one more" still feels productive. | 8 |
| **Instant restart** | Spore Storm (Enter/Space/R), Stormglass (R/Enter), Gravity Moth (tap anywhere outside the panel), Kiln (Space/Enter), Wobble (Space/Enter) | On phones the restart should be one big thumb-reach button. Gravity Moth's "tap anywhere" is the best. | 9 |
| **Tips on defeat** | Spore Siege `hintFor` (5 tactical tips) | Turns a loss into learning. Cheap. | 6 |
| **Adaptive rival** | Negative Split `finishRace` (`save.rival` gets faster when you beat Dax, slower when you lose, clamped 0.965-1.06) | A nemesis who keeps pace is a strong personal hook. Unique in the catalog. | 7 |

### H. Phone controls

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Floating joystick anywhere, with auto-fire** | Spore Storm canvas `pointerdown` handler (joystick origin at the touch point, radius 52, origin follows the thumb, pointer capture) + `findTarget` auto-aim with boss priority | One thumb, no HUD buttons, nothing covered. The gold standard for action games here. | 10 |
| **One-tap with coyote time and an input buffer** | Gravity Moth `mothStep` (`COYOTE`, `BUFFER`) | Forgives taps a frame early or late. | 10 |
| **Relative drag with gain** | Clockbreak `onMove` (`pad.target += dx*1.6`) | The thumb never covers the paddle. | 9 |
| **Hold left or right half of the screen** | Lagoon flippers; Slipstreak `gatherInput` (bottom halves steer, top or both = boost); Negative Split | Fine for 2-input games. | 7 |
| **Drag back to aim with a power line** | Nebula `endAim`/`drawAim`/`previewPath`; Stormglass drag then release to drop | Natural on glass. | 8 |
| **Hold to reel in a tension zone** | Moonpond `stepFight` (hold raises tension; stay in the sweet zone from `gs.lo` to `gs.hi`; snap above 1, slack below 0.08) | Single-input depth. | 8 |
| **Swipe or tap-tap swaps** | Shardstorm; Kiln path drag (diagonals count) | Standard and solid. | 7 |
| **On-screen D-pad** | Frostbore `dpadFromPoint` | The weakest action control here: small, fixed, and blind to the thumb. Should be swipe-to-dig. | 3 |
| **Haptics** | **Only Moonpond** (`vib()` wrapper) | A big missing piece on phones (section 4). | 3 |

### I. Audio

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Music that reacts to danger** | Lantern `setDanger` (a low-pass filter on the music bus: below 40 health the cutoff drops to `500+health*55` Hz; otherwise 18 kHz) | The single best audio idea in the catalog: you *hear* yourself dying. | 10 |
| **Music modes by game state** | Spore Storm `AU.setMusicMode` (title 104 BPM, fight 128, boss 146 with snare and sawtooth bass); Wobble `musicIntensity` (by pieces placed) + `musicDuck` on failure; Nine Lives `MU.intensity`; Shardstorm `Music.setMode`; Glowtail `setMusicLevel` | Spore Storm's 3-mode sequencer is the best reusable engine. | 9 |
| **Your hits play the melody** | Lantern `voiceHit(n.midi, …)` (each hit plays the note in the current kit's voice) | Rhythm games feel like music only when hits are notes. | 9 |
| **Impact-scaled sound** | Stormglass `Audio.sfx.land(clamp(impact/220,…))`; Frostbore `SFX.crack(hardness)`/`SFX.ore(val)` | Volume and pitch follow the physics, so it sounds real. | 7 |
| **Speeding-up danger tick** | Stormglass `gameUpdate` danger tick (interval shrinks from 0.55 s to 0.18 s as time over the line grows) | Classic tension builder. | 7 |
| **Latency calibration** | Lantern `heardNow` (uses `getOutputTimestamp`) + `calTap`/`finishCal` (median of 10 taps, ±200 ms) | Required for any timing game on Bluetooth headphones. | 7 |
| **Procedural synth SFX, no assets** | Every game; Spore Storm `AU.tone/noise` is the cleanest API | Keeps each game a single file. | 7 |

### J. Onboarding

| Mechanic | Games (functions) | Implementation notes | Str |
|---|---|---|---|
| **Easy first encounter** | Moonpond `makeBite(..., first)` (1.5-2.5 s wait, no fake nibbles, +0.15 s hook window); Stormglass `st.grace` (2.5 s, +1 with the perk); Lantern `INTRO_BARS`; Spore Storm opening banner "auto-fire is on. move!" | Makes the first 10 seconds a guaranteed win. | 8 |
| **One-time how-to** | Kiln `seenHow` (shown before the first endless game only); Spore Siege `meta.hinted`; Shardstorm idle hint (`G.hintPair`) | Shardstorm's idle hint is the best pattern: it helps only when the player is stuck. | 7 |
| **Attract and demo mode** | Slipstreak `startDemo` (AI drives behind the menu); Nine Lives `renderAttract`; Lagoon DMD idle loop | Shows the fantasy before the first tap. | 5 |

### K. Platform and engineering (not player-facing, but they matter)

| Practice | Games | Note | Str |
|---|---|---|---|
| Defensive save merge and validation | Gravity Moth `loadSave` (type-checks each key, clamps values, filters unknown character IDs); Spore Storm `loadSave`; Comet `sanitize` | Prevents a corrupt save from bricking the game. | 8 |
| Headless-testable simulation | Gravity Moth (`module.exports` of `makeWorld/worldStep/mothStep/...`); Moonpond `ML.*` pure functions; Kettle `KC.*` | Lets a builder AI test tuning without a browser. Copy this pattern. | 8 |
| Pause on hide | 18 of 21 (missing in Kettle, Franchise and Negative Split, though Kettle saves after every action) | | 7 |
| Reduced motion | 11 of 21 honor `prefers-reduced-motion` (Moonpond's `RM` gates slow-mo and flash); Nine Lives has in-game settings | | 6 |
| Object pools + spatial grid | Spore Storm `Pool`, `buildGrid/queryNear` (220 enemies, 600 bullets, 1400 particles); Nine Lives `initGrid/query` | Needed for 60 fps on phones. | 8 |

---

## 2. Top 15 features, ranked

Each entry gives the mechanic, why it hooks, the implementation to copy, and the trap to avoid.

**1. Fusion evolutions with a recipe book and a guaranteed build slot** (Spore Storm)
- Why it works: it stacks four drives. A curiosity gap (??? slots). The goal-gradient effect (one half maxed, the other half visibly close). Mastery (learning recipes across runs). A big power fantasy payoff. The build-slot guarantee removes the worst roguelite feeling, which is "the game never offered what I needed".
- Copy: `rollChoices` (evolution in slot 1 that survives rerolls; build slot; weight `1+0.5*stacks`, x3 for the missing half), `evoHint`, `chooseUpgrade`'s "MAX · evolves with" announcement, `applyEvo`'s juice package, and `renderEvoRow` with immediate `persist()`.
- Trap: recipes that need 3+ items, or that only show up after the boss. Spore Storm's design comment ("so a committed build can actually reach its evolution before the Rotking") is the right rule.

**2. Near-miss chain that fills a power meter** (Gravity Moth, plus Nine Lives for the payoff)
- Why it works: it reverses the brain's threat response. The moment you nearly died becomes the moment you got paid. That drives skilled risk-taking, which feels like mastery. The power state then answers the tension with "now *I'm* the danger".
- Copy: the `collide` loop's near flag and pass rule, `nearReward` (`CHAIN_WIN 2.6 s`, multiplier capped at 5), `addGlow` then `startDash`. For the payoff juice, `activateZoomies` (callout, ring, area damage pulse).
- Trap: paying on proximity alone (farmable), or paying on a near-miss that ended in a hit. Moth already avoids both.

**3. Pickup chains with rising pitch** (Spore Storm `AU.gem(n)`, Clockbreak `sfx.brick(combo)`)
- Why it works: a sound that climbs is an anticipation curve the player hears without reading anything. Every pickup is a tiny "and another!" Near-zero cost for a large lift.
- Copy: `tone(740*1.059^(n%10))` with a 0.6 s chain window. Clockbreak's `2^(min(combo,18)/12)` rises a full octave over 12 bricks.
- Trap: never cap the pitch, and it gets shrill. Spore Storm wraps every 10 steps; Clockbreak caps at combo 18.

**4. Hitstop, shake and flash scaled to magnitude** (Spore Storm `hitstop`/`shake`, Stormglass tier freeze)
- Why it works: hitstop gives the brain about 50-300 ms to register cause and effect, which is why hits feel weighty. Scaling it to the event teaches what matters without words.
- Copy: Spore Storm's max-and-cap helpers (`hitstop` capped at 0.12 normally, 0.32 for evolutions) plus Stormglass's per-tier freeze formula. Add Nine Lives' shake setting.
- Trap: hitstop on every small kill in a horde game. Spore Storm uses 0.014 s for ordinary kills, which is right.

**5. Drag-anywhere floating joystick with auto-fire** (Spore Storm)
- Why it works: it removes everything between intent and action. On a phone a fixed stick or buttons cost attention and cover the screen. With auto-fire, the only skill is positioning, and that is the fun part.
- Copy: Spore Storm's `pointerdown/move/up` handlers (origin at the touch, origin follows past radius 52, pointer capture) and `findTarget` (boss priority, 700 px range).
- Trap: a fixed-position joystick or required buttons. If a power must be activated by hand, put it on a second-finger tap anywhere, not on a button.

**6. Three rotating daily missions, including day-scope ones** (Gravity Moth `ensureMissions`)
- Why it works: small, achievable goals that change daily (the goal-gradient effect plus the Zeigarnik effect, where unfinished tasks nag at you). Day-scope missions ("5 runs today") produce several sessions a day.
- Copy: `MPOOL` with tiered `[target, reward]` pairs, a date-seeded shuffle, validation on load, and `missionsLive` for live HUD progress.
- Trap: missions the player can't affect, or ones that need a rare drop.

**7. Seeded daily run that is the same for everyone** (Stormglass, Lantern, Kiln)
- Why it works: a fresh puzzle every day, comparable with friends, with an appointment-like rhythm.
- Copy: Stormglass `startRun(daily)` (date-hash seed; **separate RNG streams** for drops and gusts) and Lantern's "Today's best" line.
- Trap: rolling over at UTC midnight for a US player (Lantern's bug), and not offering a share line (nobody does).

**8. A "next unlock" bar that picks the closest goal** (Stormglass `nextUnlock`, Comet `goalInfo`)
- Why it works: the goal-gradient effect at the moment of decision. The results screen says "you are 82% of the way". The player was about to put the phone down; now they tap again.
- Copy: Stormglass picks the locked item with the highest `stat/goal` ratio and animates the bar from 0. Comet's `goalInfo` adds an ETA in-session.
- Trap: showing the cheapest unlock instead of the closest one, or one that is far away.

**9. Collection book with silhouettes and personal bests** (Moonpond Pondpedia, Kiln Shelf, Stormglass ladder)
- Why it works: completion drive plus variable reward (what will bite?). The personal-best weight keeps old entries alive. Kiln's pots make every entry personal.
- Copy: `recordCatch` (count + best, `isNew`/`isPB`), `spawnTable` gating by zone, phase and bait (so the night of play matters), `renderDex` with percent complete. Copy `addPot`/`potName` for generative entries.
- Trap: a linear book where only grinding fills the last slot. Gate the rare ones by *conditions* (time, loadout), not just odds.

**10. Rare-reveal slow motion** (Moonpond `landFish`)
- Why it works: it marks a peak (the peak-end rule says people remember peaks and endings). Slow-mo plus the rarity color is the "loot beam" moment.
- Copy: `G.timeScale=0.28` for 0.85 s, flash in the rarity color, shake `6+r*2`, sparkle count by rarity, all gated by `RM` (reduced motion).
- Trap: using it on common events. It must stay rare to keep its meaning.

**11. Golden event with a variable reward** (Comet golden comet)
- Why it works: a variable-ratio schedule plus a short window to act equals attention capture. It makes the player watch the screen.
- Copy: `cometInterval` (60-120 s), `spawnComet` (6.5-8 s crossing, whoosh), `catchComet` (55/30/15 outcome table, banner, hitstop 0.09).
- Trap: a reward so big that skipping one feels like a loss. That breeds anxiety, not fun.

**12. Second chance with a shockwave** (Nine Lives `loseLife`, Spore Storm Second Wind)
- Why it works: it softens loss aversion and creates a comeback story. The death screen becomes a highlight.
- Copy: Nine Lives' sequence (slow-mo 0.25, white flash, ring, kill nearby non-elites, delete nearby bullets, 3 s invulnerable) and Spore Storm's meta purchase gating (`META.wind`, one per run).
- Trap: unlimited revives, which kill tension.

**13. In-world record marker, celebrated mid-run** (Wobble `drawBest` + `celebrateRecord`; Slipstreak ghost)
- Why it works: you race your past self, and the moment you pass it is celebrated *during* play, not on the results screen. That creates a mid-run peak.
- Copy: Wobble's dashed line with a waving flag ("BEST 214cm", becoming "OLD BEST" when passed) plus fireworks. Slipstreak records the ghost at 10 Hz, up to 4000 samples.
- Trap: celebrating a record on the very first run (Wobble requires `heightCm>=4` and a previous best).

**14. Push-your-luck banking with visible risk** (Frostbore `retHeat`, Slipstreak `bank`)
- Why it works: every second is a decision ("one more ore?"). Showing the cost (the return marker) makes loss feel fair and greed feel chosen.
- Copy: the Frostbore heat bar with its "need" marker plus a danger flag at `heat < 1.15*return+6`. Slipstreak's pending-points display turns gold when the edge bonus is active.
- Trap: hidden risk. If players can't see the cliff, it feels like a cheat.

**15. Music that reacts to danger** (Lantern `setDanger`, Spore Storm music modes)
- Why it works: it reports state without anything to read. Your eyes stay on the action while your ears report health. It also gives the danger state a sound that is uncomfortable to sit in.
- Copy: Lantern's low-pass on the music bus with `setTargetAtTime`, plus Spore Storm's 3-mode sequencer.
- Trap: muffling the sound effects too. Keep SFX dry so feedback stays clear.

Honorable mentions: Kiln's generative named pots (most original), Moonpond's fake-out nibbles (`makeBite` nibbles plus `judgeTap` "scare"), Negative Split's adaptive rival and shoutable coach cues, Comet's offline gains, and Lagoon's day-streak badge.

---

## 3. Cross-cutting patterns: what the top games share

### First 30 seconds

**Top games:** one tap from load to play. Comet has zero taps, because the tree *is* the title. Spore Storm, Stormglass, Gravity Moth and Wobble take one tap.

The first reward lands within about 5 seconds:
- Spore Storm: first kill, then first level-up around 10-15 s (`xpFor(1)=18`).
- Moonpond: first bite in 1.5-2.5 s.
- Gravity Moth: the first flip is the whole game.

**Bottom games:**
- Kettle Crawl takes about 4 screens before the first decision (title, select, map, node, combat).
- Franchise Dynasty starts with a team-picking wall of text.
- Negative Split uses tap-to-highlight then tap-to-confirm menus that are only explained in a keyboard hint (`press()` with `menuIdx`).
- Kiln shows a how-to modal before the first word (once, but at the worst moment).

### Session length (estimated from constants)

| Band | Games |
|---|---|
| Under 1 min | Gravity Moth, Negative Split, Slipstreak race, Wobble |
| 2-4 min | Spore Storm (2:30 + boss), Glowtail (3:00), Moonpond night (180 s), Stormglass, Lantern, Kiln, Frostbore dive, Lagoon game |
| 5-15 min | Nine Lives (5 sectors of 75-95 s + bosses), Shardstorm (boss every 6 floors), Spore Siege (15 waves), Bug Brawl, Nebula 9 holes |
| 20 min+ | Kettle Crawl, Franchise Dynasty |
| Sessionless | Comet Orchard |

The top games sit at **2-4 minutes with a visible end** (timer, night, run). On a phone that is the sweet spot: short enough for "one more", long enough for a story arc. The longer games survive only with resume support (Kettle and Spore Siege have it; Nine Lives and Shardstorm don't).

### Meta progression

Every top game has **three layers**:
1. In-run growth (cards, combos, tiers).
2. A permanent currency with a visible next goal (glow, pollen, coins).
3. A *collection* (evolutions, species, skies, pots).

The bottom games tend to have only best scores (Negative Split), only cosmetics (Glowtail skins by stat), or one-shot perks (Shardstorm Forge).

### Feedback and juice

The top action games all use the same five tools:
- Magnitude-scaled hitstop.
- Capped shake.
- Rising-pitch chains.
- Banners for named beats.
- A special super-moment (evolution, dash, rare catch).

The bottom games miss two or more: Negative Split has no particles, shake or hitstop; Franchise has none; Spore Siege has no hitstop; Bug Brawl's fights are mostly toasts.

### Phone controls

The top games use **one gesture** that the whole screen accepts:
- Drag anywhere (Spore Storm, Glowtail).
- Tap anywhere (Gravity Moth, Wobble).
- Drag and release (Stormglass, Nebula).
- Hold (Moonpond).

The worst is Frostbore's fixed D-pad. Haptics are missing everywhere except Moonpond. That is the single most common gap on phones.

### Audio

The top three audio games (Lantern, Spore Storm, Wobble) all **change the music with game state**. Comet Orchard and Moonpond Angler have no music at all; given their otherwise high quality, that is a missed opportunity. Franchise Dynasty has no audio.

### The one-line pattern

> The top games make **every 10 seconds** pay (a chain or a pop), **every minute** offer a choice or a discovery, **every run end** show how close the next unlock is, and **every day** offer something new. The bottom games do one or two of those four.

---

## 4. Anti-patterns and bugs

### Bugs found in the code

1. **Lantern Drum: "Tonight's River" rolls over at UTC midnight.**
   - Where: `todayUTC()` returns `toISOString().slice(0,10)`; `dateLabel()` uses `timeZone:'UTC'`.
   - Effect: in Kansas City the "tonight" river changes at **6:00 pm Central** (7:00 pm in daylight time), in the middle of evening play. The label then shows tomorrow's date. A player who sets a score at 5:55 pm sees it vanish at 6:01.
   - Fix: use a local date key with a 4:00 am rollover, or keep UTC and rename it "Today's River".
2. **Franchise Dynasty: possible save loss if the CDN fails.**
   - Saves are written compressed with an `LZ:` prefix when `LZString` is present.
   - If the CDN script fails on a later visit, `decompress()` catches the error and returns the raw `LZ:` string, `deserialize` throws, and `UI.load` returns false. The game then looks like a fresh install.
   - If the player starts a new game, the next autosave overwrites the dynasty.
   - Fix: when the stored string starts with `LZ:` and `LZString` is missing, refuse to save and show "can't load your save, check your connection".
3. **Wobble Bakery: hard dependency on a CDN.**
   - Matter.js comes from cdnjs. `typeof Matter==='undefined'` shows a clean "Oven's still cold" screen, but the game is unplayable offline or on flaky networks.
   - This is the only game where a network failure means no game. Inline a minified physics core or write a small rigid-body solver.
4. **Kiln Words: "Same board for everyone today" uses the local date** (`dateKey` uses `getFullYear/getMonth/getDate`).
   - It is the same board for everyone on the same *local* date, not at the same moment.
   - Low impact, since there are no leaderboards, but the claim is slightly off. Stormglass, Gravity Moth, Moonpond and Lagoon also use local dates, which is the right call for a personal daily.
5. **Bug Brawl: the tap fix compares hit targets by `kind`, not identity.**
   - `pointerUp` uses `h.kind===ptr.hit.kind`. All buttons share `kind:'btn'`.
   - The 10 px move threshold makes a press-on-one, release-on-another nearly impossible, so this is low risk.
   - A stable `id` per hit target would be the robust fix.
6. **Comet Orchard: setting the clock forward grants offline gains.**
   - Universal to local idle games. Rollback is already clamped. Acceptable; noted only for completeness.

No syntax errors in any game. Runtime errors could not be tested without a browser.

### Design anti-patterns

- **No haptics in 20 of 21 games.** Phones have vibration for free. Light pulses (8-12 ms) on grazes and pickups and heavier ones on big hits add a feedback channel players feel. Moonpond's `vib()` wrapper is ready to copy. iOS Safari ignores `navigator.vibrate`, so make it a bonus, never the only cue.
- **No share hook anywhere.** No `navigator.share` or clipboard result card in any game, including the six with dailies. A text result line ("Tonight's River · 412,300 · x187 combo") is the lowest-cost viral loop available.
- **Only one day-streak in 21 games** (Lagoon), and it is buried. Dailies exist in only six games (Stormglass, Gravity Moth, Lantern, Kiln, Moonpond, Lagoon). The four strongest action games (Spore Storm, Nine Lives, Clockbreak, Shardstorm) have no reason to return tomorrow.
- **Uniform-random upgrade offers.** Clockbreak's `offerPicks` and Shardstorm's `showUpgrade` (shuffle, take 3) ignore what the player is building. Copy Spore Storm's weighting and build slot.
- **One-time meta purchases.** Shardstorm's Forge `PERKS` are owned or not owned, so the meta runs dry fast. Use leveled lines (Spore Storm `META`).
- **Weak controls on the one game that needs precision.** Frostbore's fixed D-pad. Swipe-to-dig, or tap the tile to dig toward it, fits the phone.
- **Slow first decision.** Kettle (about 4 screens) and Nine Lives (title, character select, start) put menus before fun. Add a "Quick Start" that remembers the last character.
- **No music in two otherwise top-tier games** (Comet, Moonpond). A low ambient bed that shifts with phase of night (Moonpond) or frenzy (Comet) would raise both.
- **Long runs without resume** (Nine Lives about 12 min, Shardstorm). A phone call ends the run. Kettle's `saveRun` pattern fixes it.
- **Keyboard-first UI on a phone game** (Negative Split: arrow-key menus, tap halves for strokes, no visible buttons).
- **Silent, flat sim** (Franchise Dynasty). Its narrative systems are strong (`weeklyStories`, `radio`, `hofScore`), but there is zero audio and no animation. It is a different product category from the rest.
- **Small concern (wellbeing, given the "addicting as HELL" goal).** None of the games use paid loot boxes or punishing streaks, which is good. Keep it that way: forgive missed days (a streak freeze), keep session ends natural (timers, nights), and never put the rarest rewards behind daily logins alone.

---

## 5. The Best Game Possible: **GLOAMRUSH**

> Name note: original as far as I know. Do a quick store and web search before publishing.

### Pitch

You are **Wick**, a firefly knight carrying the last flame through the Gloam, a twilight garden overrun by the Hush. Each run is one three-minute dusk:
- Drag anywhere to fly. Your spark auto-fires at the nearest shadow.
- Skim past enemy shots to build a graze chain that fills your Flare. When it's full you burst into **Wildfire** and ram through the swarm that was just trying to kill you.
- Level-ups offer three cards. Max two partners to fuse an evolution and fill your book's ??? slots.
- Rare moths flit across the field. Catch one and time slows while its rarity flashes. It joins your **Mothbook**, and your moths gather glow for you overnight.
- Survive to 3:00, break the Hush, see the dawn.
- Every day brings a fresh seeded Dusk that's the same for everyone, three missions, and a streak flame.

**One thumb, three minutes, one more run.**

### Design pillars (in priority order)

1. **One thumb, zero friction.** No buttons are needed during play. Restart is one tap.
2. **Danger pays.** Grazing is the main source of power, not a side bonus.
3. **Every run teaches a recipe.** The evolution book always has a visible next step.
4. **Something new every night.** Rare moths gated by act, hero and loadout.
5. **A reason to come back tomorrow.** Daily Dusk, 3 missions, streak, overnight glow.

### Core loops

| Loop | What happens | Feeling |
|---|---|---|
| **10 s** | Drag to dodge, auto-fire kills, embers pop with rising pitch, graze sparks for chain ticks | "I'm good at this" |
| **30 s** | Flare fills, Wildfire for 4 s (ram, 2.4x magnet), ends in a nova ring | "Now I'm the danger" |
| **60 s** | 3-5 level-ups, card picks toward a recipe, one rare moth on average, a named wave beat | "I'm building something" |
| **Run (3-4 min)** | 3 acts (Dusk, Gloaming, Midnight), boss at 3:00, dawn | A story with a peak and an ending |
| **Day** | Daily Dusk + 3 missions + streak + "your moths gathered X glow" | An appointment |
| **Weeks** | Mothbook (30), Evolution Book (8), 3 heroes, Hearth upgrades, lantern skins | Long-term mastery and completion |

### Controls

- **Move:** floating joystick anywhere (Spore Storm handler, `R=52`, origin follows the thumb). WASD or arrows on desktop.
- **Fire:** automatic at the nearest target, with boss priority (Spore Storm `findTarget`). Desktop can hold the mouse to aim.
- **Wildfire:** triggers automatically when Flare is full (Gravity Moth `startDash`). No button.
- **HUD buttons:** pause and mute only, 44 px, top-right in the safe area.
- **Level-up:** the game pauses; tap one of 3 stacked full-width cards on phones (Spore Storm's mobile `.card` layout). Reroll button underneath.
- **Haptics** (setting, default on; `vib()` wrapper):

  | Event | Pulse |
  |---|---|
  | Graze | 8 ms |
  | Ember chain at x10 | 12 ms |
  | Brute kill | 20 ms |
  | Hit taken | 35 ms |
  | Wildfire | [20, 30, 40] |
  | Evolution | [30, 40, 30, 40, 80] |
  | Rare catch | [15, 60, 15] |

### Run structure (3:00 + boss)

| Time | Beat | Source pattern |
|---|---|---|
| 0:00 | "DRAG ANYWHERE TO FLY" banner; slow mites from one side | Spore Storm `announce` |
| 0:08 | First level-up (first run only: `xpFor(1)=12`, curated cards) | Spore Storm `xpFor`, `openLevelUp` |
| 0:12 | Spitters fire slow wide fans: the first graze lesson | New tutorial beat |
| 0:25 | Wave: "THE MITES SWARM" (ring of 14) | Spore Storm `WAVES` |
| 0:45 | First rare moth flits across (first run: a guaranteed common) | Moonpond `pickCatch` |
| 1:00 | **Act 2: GLOAMING** banner + first **Hearth Stone** (bank glow) | Gravity Moth Wing "FIRST VISIT" + new |
| 1:15-2:20 | Named waves every ~25 s; Comet Moth roughly every 60-120 s | Spore Storm `WAVES`, Comet `cometInterval` |
| 2:00 | **Act 3: MIDNIGHT** + second Hearth Stone; music shifts | Spore Storm music modes |
| 2:55 | "THE HUSH WAKES" warning, shake | Spore Storm `bossWarned` |
| 3:00 | **The Hush**: 3 phases (66% / 33%), telegraphed charges, ring and spiral patterns | Spore Storm `updateBoss` |
| Win | Dawn sequence, all glow banked x1.5; choice of **"Stay for the Long Night"** (endless, glow multiplier +10%/min) or **Cash Out** | Nine Lives KEEP GOING / CASH OUT |

### Systems

**Graze (the signature system)**
- Each enemy bullet and each enemy body carries a `grazed` flag.
- While the bullet is within `r + NEAR` (start `NEAR = 16` px) of the player and not touching, set `grazed = true`.
- When that bullet leaves the zone or expires **and the player is alive and was not hit in the last 0.2 s**, pay the graze. This is Gravity Moth's pass rule.
- Chain: `CHAIN_WIN = 2.6` s; multiplier `min(5, chain)`.
- Each graze adds `+0.06 * chainMult^0.5` Flare and `25*mult` score.
- Anti-farm: each bullet can only be grazed once, and at most 8 graze payouts per second.
- Feedback: a tick sound rising one semitone per chain step, a "GRAZE x3" pop beside the player, an 8 ms haptic, and a brief white rim on Wick.

**Flare and Wildfire**
- The meter fills from grazes (the main source), Comet Moth "Starfall", and 1% per kill (minor).
- At 100%: 4 s Wildfire.
  - Invincible.
  - Ram damage `40*dmg` per contact every 0.3 s, with knockback 700.
  - Magnet x2.4.
  - Fire rate x1.5.
  - Warm screen tint.
  - Music layer added (an extra arpeggio and doubled hats).
  - "WILDFIRE!" callout.
- At the end: a free nova ring (Spore Storm `doNova`).
- Flare does not fill during Wildfire (Moth rule).

**XP and level-up**
- Embers come in 4 tiers (1/3/6/20, Spore Storm `GEM_TIERS`).
- `xpFor(l)=10+7l+1.1l²`, which gives about 18-24 level-ups per run.
- Use Spore Storm's `rollChoices` unchanged, re-themed.

**Upgrades (16 + 2 graze cards)**
- The 16 base upgrades: Spore Storm's `UPG` list re-themed (Twin Sparks, Quickcast, Dense Flame, Gust, Needlelight, Light Wings, Thick Wax, Wick Reach, Sharp Ember, Orbiting Lantern, Flare Nova, Ash Trail, Frost Dust, Bloom Burst, Mend, Ricochet).
- New graze cards:
  - **Moth Wings**: +25% graze radius per level, max 3.
  - **Static Veil**: each graze fires a homing spark, max 3.

**Evolutions (8: Spore Storm's 6 re-themed + 2 graze recipes)**
- Glacial Crown: nova + frost.
- Wildfire Bloom: bloom + dense.
- Thornwheel: orbit + thorns.
- Hunter's Volley: homing + crit.
- Needle Tempest: pierce + ricochet.
- Ash Garden: trail + mend.
- **Phantom Wing** (Moth Wings + Light Wings): grazes during the 0.5 s after a graze chain don't break your invulnerability frames, and graze radius doubles while moving.
- **Stormveil** (Static Veil + Orbiting Lantern): each graze makes your orbit pulse a shock ring.

**Rare moths and the Mothbook**
- 30 species in 4 rarities (Common 15, Uncommon 8, Rare 5, Mythic 2).
- Use a Moonpond-style `RAR` table and a `spawnTable(act, hero, flags)`.
- A moth spawns every 35-60 s and flutters across in 6-9 s (Comet `spawnComet` path, plus a sine flutter).
- Touch it to catch:
  - Common: pop and chime.
  - Rare or better: `timeScale 0.28` for 0.85 s, rarity-color flash, sparkle, and a "NEW: Ember Lacewing 7/30" banner (Moonpond `landFish`).
- Each catch records count and best wingspan in mm (Moonpond `recordCatch` with `isNew`/`isPB`).
- **Condition-gated rares**, so the book drives play-style variety:
  - Mythic "Dawnmoth" appears only in the Long Night.
  - "Cinder Sphinx" appears only during Wildfire.
  - "Hollow Hawk" appears only with 2+ evolutions active.
  - "Bolete Moth" appears only with the Beetle hero.

**Comet Moth (golden event)**
- Every 60-120 s a gold moth streaks across in 6.5-8 s.
- Catch outcomes (Comet `catchComet` table):

  | Chance | Outcome |
  |---|---|
  | 55% | Starfall: XP x2 for 20 s, +30% Flare |
  | 30% | Windfall: a glow lump |
  | 15% | Swarm Hands: fire rate x3 for 10 s |

**Hearth Stones (light push-your-luck)**
- At 1:00 and 2:00 a ring spawns about 320 px away for 12 s.
- Stand in it for 1.5 s total to **bank** all in-run glow.
- Unbanked glow on death: keep 50% (Frostbore `endDive('frozen')` ratio).
- The HUD shows banked vs. at-risk glow, colored like Slipstreak's pending points.
- This is the first system to cut if scope is tight.

**Soft failure**
- **Second Wind**: a Hearth purchase, once per run, revives at 50% HP. Use the Nine Lives `loseLife` shockwave sequence (slow-mo 0.25, ring, kill non-elites within 340 px, clear bullets, 3 s invulnerable).

### Meta progression

- **Glow** (currency).
  - Formula: `score/30 + catches + mission rewards + 150 for a win + 60 per new evolution + 40 per new moth`.
  - The banking rules above apply.
- **The Hearth** (permanent upgrades). Spore Storm `META` re-themed, cost `base*(lvl+1)`:

  | Line | Max level |
  |---|---|
  | Thick Wax (HP) | 5 |
  | Potent Flame (damage) | 5 |
  | Quick Wings (speed) | 4 |
  | Long Glow (pickup range) | 4 |
  | Head Start (free pick) | 3 |
  | Second Thoughts (reroll) | 2 |
  | Second Wind (revive) | 1 |
  | **Wide Wings (graze radius)** | 3 |

- **Heroes (3).** One perk each, Gravity Moth style:

  | Hero | Cost | Stats and perk |
  |---|---|---|
  | Wick | free | Balanced |
  | Dusk Lacewing | 350 | Fragile, 2 shots, +15% graze radius |
  | Bolete Beetle | 800 | Tank, starts with 2 orbit lanterns, graze radius -10% |

- **Evolution Book (8)** with ??? slots and hints (Spore Storm `renderEvoRow` + `renderEvoStrip`).
- **Mothbook milestones** unlock lantern skins and trails at 5/10/15/20/25/30 (Nebula ball-unlock pattern).
- **Overnight moth glow** (light idle hook). Each species you have caught gathers glow per hour (Common 1, Uncommon 2, Rare 4, Mythic 8), up to 8 h.
- On return: a "While you were away your moths gathered +X glow" modal with a "Gather it" fly-in (Comet `applyOffline`, with its clock-rollback clamp).
- **Results screen** (Spore Storm `endRun` layout):
  - Big stats.
  - Evolution row.
  - New moths row.
  - **The next unlock closest to done by ratio, animated** (Stormglass `nextUnlock`).
  - Mission ticks.
  - A large "FLY AGAIN" button in the bottom third.

### Daily hook

- **Tonight's Dusk.**
  - Seed: `mulberry32(hashStr('gloamrush:' + localDayKey))`, where `localDayKey` rolls over at **4:00 am local time** (fixes the Lantern bug).
  - Separate RNG streams (Stormglass pattern): `rngSpawn` (waves and spawn positions), `rngCards` (seeded per level index, so the same build path sees the same offers), `rngMoth` (species and timing), `rngComet`.
  - Everyone gets the same dusk; the player's choices create the difference.
  - Unlimited attempts; "Today's best" is saved.
  - The first completed daily each day gives +100 glow.
- **3 Daily Missions** (Gravity Moth `ensureMissions` + `MPOOL` re-themed):
  - "Graze 30 times in one run", "Reach a x5 graze chain", "Trigger 3 Wildfires in one run", "Catch 4 moths today", "Evolve once", "Survive 2:00 without Second Wind", "Fly 5 runs today".
  - Tiered `[target, reward]` pairs; progress shows live in the HUD (`missionsLive`).
- **Streak flame.**
  - Completing at least 1 mission marks the day (Lagoon `onBadge` yesterday check).
  - The flame on the title screen grows at 3/7/14/30 days.
  - **One free "ember shield" per 7 days** forgives a missed day (healthy streak).
- **Share line** (new; no current game has it):
  - Text: "GLOAMRUSH · Tonight's Dusk Nov 5 · survived 3:00 · Hush broken · Glacial Crown · 3 moths · best graze x5".
  - Uses `navigator.share` with a clipboard fallback.
  - No personal data.

### Juice list (with sources)

1. Hitstop: max-and-cap helper. 0.014 s per kill, 0.06 per brute, 0.1 boss phase, 0.32 evolution (Spore Storm `hitstop`).
2. Shake: capped at 26, with an OFF/LOW/FULL setting (Spore Storm `shake` + Nine Lives settings).
3. Rising-pitch ember chain, `740*1.059^(n%10)` (Spore Storm `AU.gem`).
4. Graze tick rising one semitone per chain step, plus a white rim on Wick.
5. Card pop-in stagger; evolution cards with a gold pulse and EVOLUTION tag (Spore Storm CSS).
6. Evolution moment: 0.32 s hitstop, full flash, shockwave, 300 particles, fanfare (Spore Storm `applyEvo`).
7. Rare-catch slow-mo with rarity flash (Moonpond `landFish`).
8. Delayed ghost HP bar on player and boss (Nine Lives `ghostHp`).
9. Damage numbers, crits larger and yellow (Spore Storm `dnum`); toggle in settings.
10. Named wave banners and act "FIRST VISIT" banners (Spore Storm `announce`, Gravity Moth Wing).
11. Off-screen arrows for the boss, Comet Moth and rare moths (Nine Lives `drawIndicators`).
12. Mid-run "NEW BEST" when your survival time or score passes your record: fireworks and a HUD pill turning gold (Wobble `celebrateRecord`).
13. Boss telegraphs: red pulse and a line before charges (Spore Storm `tele` state).
14. Hearth ring filling with an amber sweep and a chime when banked.
15. Haptic tiers (see Controls).
16. Reduced motion: one flag (`RM`) that disables slow-mo, flashes and shake (Moonpond pattern).

### Audio

- **Engine:** Spore Storm's `AU` object (`tone`, `noise`, scheduled `playStep` sequencer). Music and SFX buses go into one master.
- **Music modes:**

  | Mode | Tempo | Notes |
  |---|---|---|
  | Title | 104 BPM, pads | |
  | Dusk | 120 | |
  | Gloaming | 128 | Adds arpeggio |
  | Midnight | 136 | Adds hats |
  | Boss | 146 | Snare + sawtooth bass |
  | Wildfire layer | (on top of current) | Doubled hats + bright arpeggio |

- **Danger filter:** below 35% HP, sweep a low-pass on the music bus only to `500 + hp%*55` Hz with `setTargetAtTime(…, 0.12)` (Lantern `setDanger`). SFX stay dry.
- **Duck** music to 0.1 on death; restore on restart (Wobble `musicDuck`).
- **Stingers:**
  - Evolution: Spore Storm `AU.evolve`.
  - Rare catch: a Lantern `sfxChime`-style 4-note arpeggio, higher for higher rarity.
  - Comet Moth: a whoosh in, a sparkle out.
  - Boss roar: Spore Storm `AU.roar`.
- Audio unlocks on the first tap (all games do this).

### First 60 seconds, beat by beat (first-ever launch)

| t | Player sees / hears | Design intent |
|---|---|---|
| 0.0 s | Title: GLOAMRUSH logo, Wick glowing, one huge **FLY** button, a soft pad hum | No choices on first launch |
| 0.5 s | Tap FLY: audio unlocks, the screen dissolves into the garden; banner "DRAG ANYWHERE TO FLY" with a ghost-thumb animation | One gesture, taught in the world |
| 2 s | Player drags; Wick follows. Three slow mites drift in from the left | First movement feels responsive |
| 3 s | Auto-fire kills the first mite: micro-hitstop, burst, the first ember | Reward without asking |
| 4 s | Ember pickup chain: three rising notes | The ear learns "more is better" |
| 8 s | **LEVEL 2: CHOOSE ONE.** Curated first offer: Twin Sparks, Quickcast, Moth Wings | First choice: all good, one teaches grazing |
| 12 s | Two spitters fire a slow, wide fan; a pulsing ring around Wick plus the line "SKIM THE SPARKS" | Teach grazing safely |
| 14 s | First graze: tick, "GRAZE" pop, 8 ms buzz, Flare bar jumps | Danger paid out |
| 18 s | Graze x3 chain: the tick climbs, "x3" in gold | Chain shown in sound |
| 22 s | Flare full: **WILDFIRE!** callout, warm tint, music layer, Wick rams 8 mites, nova ring at the end | The first power fantasy in under 25 s |
| 25 s | Wave banner **"THE MITES SWARM"**, ring of 14 | A named beat, danger rises |
| 32 s | Level 3; one card reads "Moth Wings II · evolves with Light Wings" | Seed the recipe idea |
| 40 s | A pale moth flutters across (scripted Common). Player touches it: chime, "NEW MOTH: Dusk Miller 1/30" | The collection starts |
| 48 s | Mission toast: "Graze 5 times ✓ +40 glow" | A daily system shown while playing |
| 55 s | Level 4; HUD timer reads 2:05 left | Pace check |
| 60 s | **ACT 2: GLOAMING · FIRST VISIT** banner; a Hearth Stone ring appears off-screen with an arrow | The next minute has a goal |

### Build spec for a builder AI

**Format:** one self-contained HTML file. No external scripts or fonts. 2D canvas plus a DOM overlay layer for menus and cards. DPR capped at 2. Target 60 fps on a mid-range phone with 220 enemies, 600 player bullets, 500 enemy bullets and 1400 particles. Safe-area padding (`env(safe-area-inset-*)`).

**Architecture:** a pure simulation core (`makeWorld`, `step(world, input, dt)`, `rollChoices`, `grazeStep`, `pickMoth`) with **no DOM access**, exported for Node tests through `module.exports` (Gravity Moth pattern). The DOM layer handles rendering, input, audio, overlays and the save.

**Modules and where to borrow each one:**

| # | Module | Borrow from | Notes |
|---|---|---|---|
| 1 | Overlays and CSS (title, level-up cards, pause, results, Hearth, Mothbook, Settings) | **Spore Storm** markup + CSS (`.ov`, `.panel`, `.card`, `.card.evo`, `.evogrid`, `.bigstats`, `.bar`) | Re-skin to dusk colors. Keep the mobile one-column card layout under 560 px |
| 2 | Save | **Spore Storm** `defSave/loadSave/persist` + **Gravity Moth** type-checked merge loop | Key `gloamrush.save.v1`. Save immediately on discoveries (`applyEvo` pattern) |
| 3 | RNG and daily | **Stormglass** `mulberry32`, `hashStr`, `startRun(daily)` with split streams | New: `localDayKey()` with 4 am rollover |
| 4 | Missions | **Gravity Moth** `MPOOL`, `ensureMissions`, `missionText`, `missionValue`, `missionsLive` | Re-theme the 7-9 mission types |
| 5 | Streak | **Lagoon** `onBadge` | Add an `emberShield` counter refilled weekly |
| 6 | Pools and spatial grid | **Spore Storm** `Pool`, `buildGrid`, `queryNear` | Same caps |
| 7 | Input | **Spore Storm** pointer handlers + keyboard + `visibilitychange` pause | Add the haptics wrapper from **Moonpond** `vib()` |
| 8 | Player and weapons | **Spore Storm** `updatePlayer`, `fire`, `doNova`, `updateOrbit`, `updatePuddles`, thorns block, `findTarget` | Re-theme |
| 9 | Graze | **Gravity Moth** near/passed logic in `collide` + `nearReward` | Per-bullet `grazed` flag; pay on exit while alive; 8 per second cap |
| 10 | Flare and Wildfire | **Gravity Moth** `addGlow/startDash` + **Nine Lives** `activateZoomies` juice | 4 s duration |
| 11 | Enemies, waves, boss | **Spore Storm** `ETYPES`, `pickType`, `WAVES`, `spawnRing`, `spawnBoss/updateBoss/damageBoss/bossDie` | Boss at 180 s instead of 150; add Spitter fans in the first 15 s for the lesson |
| 12 | Level-up and evolutions | **Spore Storm** `rollChoices`, `applyEvo`, `evoReady`, `evoHint`, `evoPartnersOf`, `chooseUpgrade`, `reroll`, `renderCards`, `renderEvoRow`, `renderEvoStrip` | Add 2 graze upgrades and 2 graze evolutions |
| 13 | Rare moths and Mothbook | **Moonpond** `RAR`, `SPECIES` shape, `spawnTable`, `pickCatch`, `recordCatch`, `landFish` slow-mo, `renderDex`; **Stormglass** ladder dots for the title strip | Spawn path from **Comet** `spawnComet` plus a sine flutter |
| 14 | Comet Moth | **Comet Orchard** `cometInterval`, `spawnComet`, `catchComet`, `frenzyLen` | 55/30/15 outcome table |
| 15 | Hearth Stones | New glue; banking semantics from **Slipstreak** `bank`, keep ratio from **Frostbore** `endDive` | Cut first if scope is tight |
| 16 | Second Wind | **Spore Storm** `hurtPlayer` revive branch + **Nine Lives** `loseLife` shockwave | |
| 17 | Results and next unlock | **Spore Storm** `endRun` + **Stormglass** `nextUnlock` (closest by ratio) + **Wobble** `celebrateRecord` for mid-run records | |
| 18 | Offline moth glow | **Comet Orchard** `applyOffline` + load clamp `min(lastSave, now)` | Cap 8 h |
| 19 | Audio | **Spore Storm** `AU` (tone, noise, sequencer, modes) + **Lantern** `setDanger` + **Wobble** `musicDuck` | Add the Wildfire layer |
| 20 | Settings and accessibility | **Nine Lives** `buildSettings` (music/SFX volume, shake OFF/LOW/FULL, damage numbers, flashes) + **Moonpond** `RM` | Add a haptics toggle |
| 21 | Share | New: `navigator.share` with a `navigator.clipboard.writeText` fallback, in try/catch | Text only |

**Save schema:**
```js
{ v:1, glow:0, banked:0, bestTime:0, bestScore:0, wins:0, runs:0, kills:0,
  meta:{wax:0,pot:0,wings:0,reach:0,start:0,reroll:0,wind:0,wide:0},
  heroes:{wick:true}, hero:'wick',
  evolutions:[], moths:{ /* id:{n,bestMm,first:'YYYY-MM-DD'} */ },
  daily:{ key:'', best:0, firstDone:false }, mis:null,
  streak:{ n:0, last:'', shields:1, shieldWeek:'' },
  lastSave:0, settings:{ music:.6, sfx:.8, shake:2, nums:1, flash:1, haptics:1 }, muted:false }
```

**Starting tuning numbers:**

| Item | Values |
|---|---|
| Player | 100 HP, speed 215, base fire interval 0.42 s, bullet speed 520 |
| Graze | `NEAR` 16 px, chain window 2.6 s, Flare per graze `0.06*sqrt(mult)`, Wildfire 4 s |
| Enemies | Spore Storm `ETYPES` numbers. Spawn interval lerps from 0.8 s to 0.25 s over 180 s. HP x(1+t/60*0.4) |
| Moths | Every 35-60 s. Rarity weights 70/22/7/1 before conditions |
| Comet Moth | Every 60-120 s |
| Boss | 2600 HP; phases at 66% and 33% |

**Acceptance tests** (Node headless where possible, plus one phone playtest):
1. The same `localDayKey` produces an identical spawn schedule and moth schedule across two sims, and identical card offers for identical picks.
2. A graze never pays if the player is hit within 0.2 s after the bullet enters the graze zone. A bullet pays at most once.
3. When both halves of a recipe are maxed, the evolution card appears in slot 1 at the next level-up 100% of the time and survives rerolls.
4. Over 200 simulated "focused" runs (always picking recipe ingredients), at least 50% reach an evolution before 3:00.
5. A first-run sim with an idle-dodge bot reaches its first level-up at 6-10 s and its first Wildfire before 30 s.
6. Average session lasts 3:00-4:00. Restart from the results screen takes 1 tap and under 1 s.
7. A corrupt save (wrong types, NaN, unknown IDs) loads to defaults without throwing.
8. Offline gain is capped at 8 h, and is 0 when the clock is rolled back.
9. Under the 220/600/500/1400 caps, frame time stays below 16 ms on a mid-range phone (manual check).
10. Reduced motion on: no slow-mo, no full-screen flash, shake at 0.

**Phased build plan:**

| Phase | Contents | Gate |
|---|---|---|
| P1 core | Arena, joystick, auto-fire, 4 enemy types, embers, 10 upgrades, results screen, instant restart, basic SFX | The first 60 seconds are fun without graze |
| P2 signature | Graze, Flare, Wildfire, full juice pass, music modes, danger filter, haptics | |
| P3 depth | All 18 upgrades, 8 evolutions with book, boss, Hearth meta, 3 heroes, Second Wind | |
| P4 discovery | Mothbook (30), Comet Moth, Hearth Stones, overnight glow | |
| P5 return | Daily Dusk, missions, streak, share, results-screen next unlock | |
| P6 polish | Settings, reduced motion, tests above, balance pass with sim telemetry (time-to-evolution, death times) | |

**Scope cuts, in order, if needed:** Hearth Stones, then the Long Night endless mode, then heroes 2-3, then share. Never cut: graze, evolutions, the daily, rising-pitch chains, instant restart.

> **Fastest path:** fork **Spore Storm**. It already contains modules 1, 2, 6, 7, 8, 11, 12, 16, 17 and 19. Add Gravity Moth's graze, dash and missions, Moonpond's catch and dex, and Comet's golden event and offline gains. That is perhaps 40% new code, not 100%.

---

## 6. Addictiveness checklist (reuse for every build)

**First 30 seconds**
- [ ] One tap from load to play (zero if possible). Audio unlocks on that tap.
- [ ] First reward in under 5 s; first choice or level-up in under 15 s.
- [ ] Teach with one in-world banner, not a modal. Show a how-to once, only if needed.
- [ ] The first encounter is rigged to succeed (Moonpond's first bite, Stormglass grace).

**Every 10 seconds**
- [ ] A chain with rising pitch (pickups, hits or combo).
- [ ] Hitstop and shake scaled to how big the event is, capped, with a setting.
- [ ] A risk the player can choose to take that pays more (near-miss, graze, bank, combo window).

**Every minute**
- [ ] A meaningful pick-1-of-3, weighted toward the current build, with a guaranteed build slot.
- [ ] A named beat (wave, act or tier) with a banner and a music change.
- [ ] A rare thing worth chasing (golden event, rare spawn) with a short window to grab it.

**Every run end (the "one more" screen)**
- [ ] Session lasts 2-4 minutes with a visible end (timer, night, boss).
- [ ] Meta currency paid win or lose.
- [ ] **The next unlock closest to done, as an animated bar.**
- [ ] New discoveries listed with NEW tags; personal best called out (mid-run if possible).
- [ ] Restart is one big thumb-reach button and takes under 1 s.

**Every day**
- [ ] A seeded daily, labeled with local-date rollover (not UTC for a US player).
- [ ] 3 rotating missions, at least one day-scope ("5 runs today").
- [ ] A streak with a built-in forgiveness token.
- [ ] A share line for the daily result.
- [ ] Optional: a small offline gain tied to the collection.

**Long term**
- [ ] A collection with ??? slots, condition-gated rares and personal bests.
- [ ] Leveled meta upgrades (not one-shot), plus characters with one clear perk each.
- [ ] A recipe or evolution book that teaches combos as you max ingredients.

**Phone**
- [ ] One gesture that works anywhere on screen (drag, tap or hold); no fixed D-pads.
- [ ] Coyote time and input buffering on timing inputs.
- [ ] Haptic tiers (with a toggle; iOS will ignore them, so never the only cue).
- [ ] Pause on `visibilitychange`; resume for runs over 5 minutes.
- [ ] Safe-area padding; 44 px minimum targets; reduced-motion support.

**Audio**
- [ ] Music modes that follow game state, plus a danger filter at low health.
- [ ] Player hits that sound musical (pitch chains, notes).
- [ ] Duck music on failure; a stinger for every rare moment.

**Engineering**
- [ ] A single file with no CDN dependencies.
- [ ] A defensive save merge, and immediate saves on discoveries.
- [ ] A pure simulation core exported for headless tuning tests.

**Healthy hooks**
- [ ] No paid randomness, no punishing streaks, natural stopping points.
- [ ] The rarest rewards come from skill or conditions, not log-in counts.
