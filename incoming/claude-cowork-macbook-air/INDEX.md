# Incoming: Claude (Cowork) on Kevin's MacBook Air — recheck, Nov 8 evening (updated Nov 8 night)

Checked against `main` at e71c496 (76 games in `games/`, plus CATALOG.md). Every Claude-built game on this MacBook lives as a claude.ai artifact, so each artifact's current live file was downloaded and its SHA-256 compared with every `games/*/index.html` on main. Gameplay was compared by hand where the hash didn't match.

Runs = opened from file:// in headless Chromium, clicked, sent arrow keys/Space: "yes" means it drew a full scene and threw no errors. Not a full playthrough.

## To add

| Game | Group | Matches existing folder | Original path | Last modified | Runs | Notes |
|---|---|---|---|---|---|---|
| The Moon Wants a Sandwich | NEW | none | https://claude.ai/artifact/QgM6EQ5fVSjMDU9oyWJYHJ | 2026-11-08 (21:03 UTC) | yes | Balance-stacking game: a chef on a unicycle stacks sandwich layers and objects to feed the moon. 5 courses. Not the same game as `please-feed-the-moon` (a Codex arcade shooter), despite the moon theme. No real names, no external files. Single 120 KB `index.html`. |
| Lane Four | NEWER BUILD | `games/negative-split/` | https://claude.ai/artifact/1bCrtsFPtDX5UuLrdTEb5t | 2026-11-09 (00:53 UTC; Nov 8 evening Central) | yes | Short-course freestyle racer, same core as Negative Split (blocks → underwater → strokes → turns, oxygen and flow meters) but rebuilt: on-the-beat stroke timing, breathing, flip turns with a 15-yard underwater limit, AI field, PB ghost and a season ladder (Dual Meet → Conference → Sectionals → State). Main's Negative Split freezes at the race start; this one runs. 72 KB vs 32 KB. Swimmer names and team codes are invented. Not the same thing as the old "Lane Four" water toy held in PR #2 — that one is an interactive toy and this is a game, so the name is reused. Loads Google Fonts. |
| Kinetic Chain | NEW | none | https://claude.ai/artifact/1Aq6ujuvvrZhSphzMfoWCJ | 2026-11-09 (00:48 UTC; Nov 8 evening Central) | yes | One-input arcade dasher: time slows while you aim, you dash through enemies, and every hit refunds a dash. Waves plus pick-one upgrades. Closest arcade games (Voidbreaker, Echo Requiem, Gloamrush) are shooters/survivors, not this. Loads Google Fonts. |

No NEEDS RENAME this time.

## Duplicates skipped (byte-identical to the file already on main)

Negative Split's own artifact (https://claude.ai/artifact/AjY8xXfTc1bQE7nMcdDxhx) is also identical to main; Lane Four above is the build that would replace it.

| Game | Existing folder | Original path |
|---|---|---|
| Blitzread | `games/blitzread/` | https://claude.ai/artifact/DRu1EpVvMuxxhV3YpURiu9 |
| Brinehold | `games/brinehold/` | https://claude.ai/artifact/FWjR2VwouUpoxDULiDhkkv |
| Bug Brawl | `games/bug-brawl/` | https://claude.ai/artifact/GhCjAF8sLQ4mpGnHBUBkGi |
| Clause & Effect | `games/clause-and-effect/` | https://claude.ai/artifact/8EgNpSWt1Jf9gHJACQkXaS |
| Clockbreak | `games/clockbreak/` | https://claude.ai/artifact/2rwAMmReGsbHj3rs5u2pvg |
| Comet Orchard | `games/comet-orchard/` | https://claude.ai/artifact/WjVeUtCNUPxC5VPBKUGzsd |
| Dual Meet | `games/dual-meet/` | https://claude.ai/artifact/6v2AAmqFkefRFDdh1C7Sb5 |
| Fathomsong | `games/fathomsong/` | https://claude.ai/artifact/7mdByJ41WHcRgna6L7fGDM |
| Franchise Dynasty | `games/franchise-dynasty/` | https://claude.ai/artifact/VjZT4PvkNiyLh7HfBh5zhk |
| Frostbore | `games/frostbore/` | https://claude.ai/artifact/6w52oSkDpHTz5na52dVJuG |
| Gloamrush | `games/gloamrush/` | https://claude.ai/artifact/K21cMvqbydSbdbLV2VTn1b |
| Glowtail Rumble | `games/glowtail-rumble/` | https://claude.ai/artifact/NsW9JfsFPvBsqhomgPHwTR |
| Gravity Moth | `games/gravity-moth/` | https://claude.ai/artifact/VJAPsobA9T4bAuf7TgHCHj |
| Kettle Crawl | `games/kettle-crawl/` | https://claude.ai/artifact/PX8QbtEsS3Q7DmojWRXg88 |
| Kiln Words | `games/kiln-words/` | https://claude.ai/artifact/NCdZ7d1SWuX11Nfe84qzbk |
| Kilnshot | `games/kilnshot/` | https://claude.ai/artifact/3M4wT2bF4JPG2rifNrkgRG |
| Lagoon Flip | `games/lagoon-flip/` | https://claude.ai/artifact/EkzMkhFm3a55JPdGUnC4U9 |
| Lanewake | `games/lanewake/` | https://claude.ai/artifact/VNcPsdkpYyDyGaBQTHERSo |
| Lantern Drum | `games/lantern-drum/` | https://claude.ai/artifact/RvSLKU9ftVf4V588xDfKGp |
| Lastlight Run | `games/lastlight-run/` | https://claude.ai/artifact/NvHnhmRtpoxoJfQV2dAxoW |
| Ledgerfall | `games/ledgerfall/` | https://claude.ai/artifact/EUbgGzsdKypLzqC6Fig1Gj |
| Loopskate | `games/loopskate/` | https://claude.ai/artifact/GqxpcqdMcxTdp9AK1Cc1ty |
| Lowbell | `games/lowbell/` | https://claude.ai/artifact/B3wGstujgekmiiDKj28jNP |
| Moonpond Angler | `games/moonpond-angler/` | https://claude.ai/artifact/9VWDKPJ55yfuh7kMT2rTo4 |
| Nebula Greens | `games/nebula-greens/` | https://claude.ai/artifact/YKxfXjeUsCGweLfM8aMVcE |
| Neon Nightcap | `games/neon-nightcap/` | https://claude.ai/artifact/C1yhkGELnYhLFpThwxcyhg |
| Nine Lives Overdrive | `games/nine-lives-overdrive/` | https://claude.ai/artifact/YH8QamaprSBMbhUCQnX3Ux |
| One More Season | `games/one-more-season/` | https://claude.ai/artifact/QDYfRtfYCsPv7kveXnSFuB |
| Prismwheel | `games/prismwheel/` | https://claude.ai/artifact/SeXhoQn9FRR29Pc6vMa68i |
| Shardstorm Depths | `games/shardstorm-depths/` | https://claude.ai/artifact/C6V3zMyugvN9X5t4TgttJK |
| Skybloom | `games/skybloom/` | https://claude.ai/artifact/RXGJ9EAdd962H1gvpS89kq |
| Slipstreak | `games/slipstreak/` | https://claude.ai/artifact/WULd8t2g3w3Pu6Zhw2Kjyw |
| Snapthread | `games/snapthread/` | https://claude.ai/artifact/Nu5t2Di6phQWJAhyVmTUW2 |
| Songmill | `games/songmill/` | https://claude.ai/artifact/SuVe4oNNPWCQSyzEFD6ozX |
| Spireshade | `games/spireshade/` | https://claude.ai/artifact/SrTn2as9U34M5aZM6G6oDQ |
| Spore Siege | `games/spore-siege/` | https://claude.ai/artifact/DZgicyEoE9ZDxRy4PJfrWT |
| Spore Storm | `games/spore-storm/` | https://claude.ai/artifact/3uUqwnUAqMbroZb9iuwFTc |
| Sporecrown | `games/sporecrown/` | https://claude.ai/artifact/PafTxvKwfB1xuYNdJnwTUC |
| Stormglass | `games/stormglass/` | https://claude.ai/artifact/JGvQ6B13LKab414tQDbpbw |
| Sunwire | `games/sunwire/` | https://claude.ai/artifact/26hXrPjC9fDo5tkKHM7Dh1 |
| Thistlemarch | `games/thistlemarch/` | https://claude.ai/artifact/1kkhiHeKHit6XRrXK6xQYY |
| Twelve Sols | `games/twelve-sols/` | https://claude.ai/artifact/FjsZQFN9jRwBySYjKSgMeJ |
| Undertoll | `games/undertoll/` | https://claude.ai/artifact/FMSsajBT1aGNjeU7nbkoCJ |
| Wobble Bakery | `games/wobble-bakery/` | https://claude.ai/artifact/Sif8KFCcoVzsWBwmykKTwm |

## Duplicates skipped (same game, older build, or already held on purpose)

| Game | Existing folder / record | Original path | Why skipped |
|---|---|---|---|
| Hardwood Franchise | `games/baseline-empire/` | https://claude.ai/artifact/ULm3BHPM87EwC8stA7oygt | Older source of Baseline Empire '05; uses real league/team names that main already replaced. Not newer (last changed Nov 5). |
| Stormglass (earlier build) | CATALOG "Older versions" (cloud PR #2) | https://claude.ai/artifact/AFspzaC6rF8BXmLYf4cURk | Older, smaller build of `games/stormglass/` |
| Pip Hop Kit Demo | CATALOG "Extras" (cloud PR #2) | https://claude.ai/artifact/3ZHpLvRkS11Q6RobUVPgNA | Kit demo, already held in PR #2 |
| Lane Four | CATALOG "Extras" (cloud PR #2) | https://claude.ai/artifact/Fr23miBnn9RrTipQUHB1PA | Interactive toy, already held in PR #2 |
| Smoke Signals | CATALOG "Extras" (cloud PR #2) | https://claude.ai/artifact/GDNKDQBdMsVpkPkNgLN57A | Interactive toy, already held in PR #2 |

## Not games, left out

VIRTUAL — light blue (animated short film), Inside the Machine, Inside the Homie (doc), plus the reports, timers, planners and research pages listed in the earlier collection. No MFD, MBD or Last Bell files were touched. Nothing over 50 MB; no node_modules or build caches.

## Nov 9 update

| Game | Group | Matches existing folder | Original path | Last modified | Runs | Notes |
|---|---|---|---|---|---|---|
| Emberward | NEW | none | https://claude.ai/artifact/EBCYFEgZQmBWf64yTrWrfu | 2026-11-09 (03:21 UTC; Nov 8 night Central) | yes | Turn-based card-casting wall defense: shades drift down a 5×7 grid toward your wall; cast Spark/Lance/Flare cards, popped shades burst into neighbors. 8 nights, card drafts, relics after nights 2 and 5, daily result to copy. Different from the arcade's deckbuilders (Kettle Crawl, Snapthread) and tower defense (Spore Siege). No real names, no external files. 71 KB. Also folded into `games/emberward/` (89 on the arcade). |

Rechecked and skipped in this pass: Hardwood Franchise (unchanged since Nov 5, older source of `games/baseline-empire/`), both Lane Four artifacts (newest build is in PR #18), Kinetic Chain and The Moon Wants a Sandwich (identical to main).
