# Turn & Tide — shipped-file verification

[Open the standalone game](Turn-and-Tide.html). Double-click it; no installation or internet connection is needed. Space advances a week. Export JSON backups from the top bar.

## Exact artifact

- HTML: 404,409 bytes; one inline script and stylesheet.
- SHA-256: `0f2a12684f32d5f02ff6fef9a93d520ad4a9c8384177e36492408d81af81ea7c`
- Save schema: version 3; version 1/2 migration fixtures exercised.
- Headless seed: `MERIDIAN-30`; 30 completed seasons, all 24 clubs CPU-managed.
- Full audit log: 938,085 official swims held in memory for provenance checking.
- The final HTML's extracted script was executed directly by `gate.js Turn-and-Tide.html 30`.

## What is included

All 24 requested clubs, 14 women and 14 men per active roster, every requested SCY event and relay, two six-lane dual cards, the 14-week schedule, 12-team playoffs, and the three-day, eight-lane Meridian Cup. Training groups, two taper cycles, injuries and injured-list replacements, editable blind lineups, scouting, race playback, contracts, salary cap, four-round lottery draft, competitive free agency, swimmer/pick trades, owner expectations and new jobs are implemented.

Records retain the actual meet and 50 splits. Swimmers retain every official PB improvement. Team and league boards, all-time top ten, season titles, awards, Hall of Currents, draft retrospectives, banners and the GM résumé persist across seasons. The in-game League Health tool runs an isolated copy and displays real measurements and flags.

## Actually run

- Fifty fresh-league calibration seeds: all 28 average fastest/depth tests passed. Reference pacing shapes, exact hundredth arithmetic, dual/final lane seeding, exchange limits, schedule and legal coverage passed.
- Thirty complete seasons on the shipped script: zero roster, cap, event-limit, nonfinite/undefined-state, score/split/leg arithmetic, record-order or win/loss violations. Every retained PB progression, team/league record and top-ten mark traced to the full swim log.
- Same-seed state hashes matched. Export/import/continue hashes matched; the entire year-30 state round-tripped. The uncompressed fallback codec also round-tripped and continued identically.
- Chromium browser tests opened all 13 screens; edited training, individual and mixed-relay lineups; submitted and watched meets; verified replay left league state byte-for-byte unchanged; simulated the season; made four draft picks, a free-agent signing and a trade; completed cuts into year two.
- Additional browser tests exercised extensions, release/replacement, playoff host card choice, deadline and playoff simulation, Space advance, record/depth filters, sorting, exact record evidence, old/retired profiles, 30-year history, health export/cancellation, and a low-trust owner fixture followed by taking another job.
- Health simulation left the live league unchanged. JSON download/import and autosave reload matched. Both blocked localStorage and full-storage failures displayed an export option; export worked after the full-storage failure.
- Phone width 390 px: no page-level horizontal overflow; dense tables scroll within their containers. Player dialogs, navigation and race view checked.
- Zero browser console/page errors in the final three suites; zero network requests. Script parsed, file ended correctly, and static inspection found no external resources or network APIs.
- A fresh season through the final took 1.01 seconds in a separate Node speed check on this Mac. Long health runs yield between league steps.

Not tested: Safari, Firefox, physical phones, keyboard/screen-reader accessibility across every interaction, or an extended human-coach playtest. No claim is made that every possible manual roster, offer or lineup combination was exhaustively tested.

## Last full-run League Health

Values below average each season's unique performers, not the single all-time leaderboard. Times are hundredths; signed drift compares the last five seasons with the first five.

| Sex / event | Benchmark | Fastest | 8th | 50th | Fastest Δ | 8th gap | 50th gap | Fast drift | 50th drift |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| W 50 Free | 21.00 | 21.04 | 21.45 | 22.15 | 0.18% | 1.97% | 5.30% | -0.12% | -0.75% **FLAG** |
| M 50 Free | 18.20 | 18.18 | 18.55 | 19.26 | -0.12% | 2.04% | 5.97% | 1.08% **FLAG** | -0.56% **FLAG** |
| W 100 Free | 46.20 | 46.49 | 47.24 | 48.49 | 0.62% | 1.62% | 4.32% | -0.15% | 0.09% |
| M 100 Free | 40.80 | 40.93 | 41.72 | 42.94 | 0.31% | 1.95% | 4.92% | 1.64% **FLAG** | -0.03% |
| W 200 Free | 1:41.00 | 1:40.72 | 1:42.62 | 1:45.58 | -0.27% | 1.88% | 4.82% | 1.21% **FLAG** | -0.17% |
| M 200 Free | 1:30.00 | 1:30.09 | 1:31.90 | 1:34.15 | 0.10% | 2.01% | 4.51% | 2.31% **FLAG** | -0.46% |
| W 500 Free | 4:31.00 | 4:30.33 | 4:34.64 | 4:43.34 | -0.25% | 1.60% | 4.82% | 1.08% **FLAG** | -0.38% |
| M 500 Free | 4:07.00 | 4:06.03 | 4:11.39 | 4:18.34 | -0.39% | 2.18% | 5.01% | 0.25% | -0.34% |
| W 1000 Free | 9:27.00 | 9:23.91 | 9:34.68 | 9:52.57 | -0.55% | 1.91% | 5.09% | 0.84% **FLAG** | -0.51% **FLAG** |
| M 1000 Free | 8:45.00 | 8:41.40 | 8:52.18 | 9:09.08 | -0.68% | 2.07% | 5.31% | -0.43% | -0.34% |
| W 1650 Free | 15:35.00 | 15:39.73 | 15:56.02 | 16:26.39 | 0.51% | 1.74% | 4.97% | 1.02% **FLAG** | -0.38% |
| M 1650 Free | 14:25.00 | 14:26.74 | 14:44.42 | 15:13.28 | 0.20% | 2.04% | 5.37% | -0.41% | -0.19% |
| W 100 Back | 49.30 | 49.24 | 50.14 | 51.80 | -0.12% | 1.82% | 5.20% | -0.24% | -0.00% |
| M 100 Back | 44.00 | 43.96 | 44.87 | 46.34 | -0.10% | 2.08% | 5.43% | -0.50% **FLAG** | -0.33% |
| W 200 Back | 1:48.50 | 1:48.19 | 1:50.13 | 1:53.56 | -0.28% | 1.79% | 4.96% | -0.39% | 0.02% |
| M 200 Back | 1:37.50 | 1:37.13 | 1:39.14 | 1:42.25 | -0.38% | 2.08% | 5.28% | -0.38% | -0.39% |
| W 100 Breast | 56.80 | 56.63 | 57.81 | 59.71 | -0.29% | 2.08% | 5.43% | 0.42% | -0.66% **FLAG** |
| M 100 Breast | 50.30 | 50.28 | 51.16 | 52.90 | -0.05% | 1.76% | 5.23% | -0.65% **FLAG** | -0.74% **FLAG** |
| W 200 Breast | 2:03.50 | 2:03.01 | 2:05.45 | 2:09.04 | -0.39% | 1.98% | 4.90% | 0.71% **FLAG** | -0.58% **FLAG** |
| M 200 Breast | 1:49.50 | 1:49.29 | 1:51.18 | 1:54.49 | -0.19% | 1.74% | 4.76% | -0.28% | -0.37% |
| W 100 Fly | 49.30 | 49.20 | 50.17 | 51.94 | -0.20% | 1.98% | 5.57% | -0.01% | -0.23% |
| M 100 Fly | 44.00 | 43.96 | 44.95 | 46.42 | -0.10% | 2.26% | 5.61% | -0.25% | -0.22% |
| W 200 Fly | 1:50.50 | 1:49.86 | 1:52.10 | 1:55.95 | -0.58% | 2.05% | 5.55% | 0.14% | -0.12% |
| M 200 Fly | 1:38.50 | 1:38.08 | 1:40.16 | 1:43.40 | -0.42% | 2.12% | 5.42% | -0.41% | -0.34% |
| W 200 IM | 1:51.50 | 1:51.81 | 1:54.08 | 1:56.98 | 0.28% | 2.03% | 4.63% | -0.32% | -0.26% |
| M 200 IM | 1:39.00 | 1:39.31 | 1:41.33 | 1:44.03 | 0.31% | 2.04% | 4.76% | 0.86% **FLAG** | -0.36% |
| W 400 IM | 3:59.00 | 3:59.24 | 4:05.41 | 4:12.09 | 0.10% | 2.58% | 5.37% | -0.09% | -0.20% |
| M 400 IM | 3:35.00 | 3:35.61 | 3:41.16 | 3:47.01 | 0.28% | 2.58% | 5.29% | 0.62% **FLAG** | -0.28% |

Fastest target: ±1%; 8th gap: 1.5–3%; 50th gap: 4–6%; five-year drift: ±0.5%. 28 of 28 run-average time/depth rows pass. **14 of 28 event rows flag at least one five-year drift comparison. The strict event-by-event no-inflation gate is not fully met.** Aggregate fastest drift is 0.270%, and aggregate 50th drift is -0.323%.

| League measure | Actual | Target | Result |
|---|---:|---:|---|
| Structural violations | 0 | 0–0 | PASS |
| Favorite wins % | 79.811 | 75–85 | PASS |
| Last relay open % | 15.170 | 12–25 | PASS |
| Projected within 15 % | 46.061 | 40–100 | PASS |
| Untapered vs tapered % | 2.138 | 2–3 | PASS |
| Relay DQ % | 1.024 | 0.5–1.5 | PASS |
| Flying start advantage (s) | 0.550 | 0.4–0.7 | PASS |
| Unique champions | 13 | 7–24 | PASS |
| First-to-last fastest drift % | 0.270 | -0.5–0.5 | PASS |
| First-to-last depth drift % | -0.323 | -0.5–0.5 | PASS |
| Compressed save (MB) | 2.063 | 0–2.2 | PASS |
| Swims below all-time marks | 0 | 0–2 | PASS |
| Unsigned stars on opening day | 0 | 0–0 | PASS |

| Age | Paired yearly season-best change | Target |
|---|---:|---:|
| 18–22 | -0.817% | -1.5 to -0.5% |
| 23–26 | 0.063% | -0.3 to 0.3% |
| 27–29 | 0.453% | 0 to 0.6% |
| 30+ | 0.965% | 0.5 to 1.5% |

Negative is faster. These are actual paired official season bests, not just programmed development modifiers. The intrinsic sprint aging curve is shifted two years later than the distance curve.

| Relay | Fastest average | Benchmark | Difference |
|---|---:|---:|---:|
| M 200 Medley relay | 1:21.75 | 1:22.00 | -0.300% |
| M 400 Medley relay | 3:01.78 | 3:01.00 | 0.431% |
| M 200 Free relay | 1:14.76 | 1:15.00 | -0.321% |
| M 400 Free relay | 2:46.15 | 2:47.00 | -0.510% |
| M 800 Free relay | 6:08.56 | 6:09.00 | -0.118% |
| W 200 Medley relay | 1:33.31 | 1:34.00 | -0.738% |
| W 400 Medley relay | 3:24.27 | 3:25.00 | -0.358% |
| W 200 Free relay | 1:26.06 | 1:26.00 | 0.074% |
| W 400 Free relay | 3:07.84 | 3:09.00 | -0.613% |
| W 800 Free relay | 6:51.86 | 6:54.00 | -0.516% |
| X 200 Medley relay | 1:27.38 | 1:27.30 | 0.091% |
| X 200 Free relay | 1:18.68 | 1:18.90 | -0.276% |

All ten sex-specific relay averages and both mixed relay averages fall within 1%. Flying legs are produced from the swimmer model and exchange skill; relays have no independent speed multiplier.

| Season | Record events improved | 40 / n |
|---|---:|---:|
| 1 | 40 | 40.00 |
| 2 | 13 | 20.00 |
| 3 | 8 | 13.33 |
| 4 | 9 | 10.00 |
| 5 | 10 | 8.00 |
| 6 | 6 | 6.67 |
| 7 | 7 | 5.71 |
| 8 | 9 | 5.00 |
| 9 | 2 | 4.44 |
| 10 | 1 | 4.00 |
| 11 | 2 | 3.64 |
| 12 | 1 | 3.33 |
| 13 | 2 | 3.08 |
| 14 | 12 | 2.86 |
| 15 | 3 | 2.67 |
| 16 | 6 | 2.50 |
| 17 | 1 | 2.35 |
| 18 | 0 | 2.22 |
| 19 | 1 | 2.11 |
| 20 | 2 | 2.00 |
| 21 | 1 | 1.90 |
| 22 | 0 | 1.82 |
| 23 | 0 | 1.74 |
| 24 | 1 | 1.67 |
| 25 | 7 | 1.60 |
| 26 | 1 | 1.54 |
| 27 | 0 | 1.48 |
| 28 | 1 | 1.43 |
| 29 | 1 | 1.38 |
| 30 | 2 | 1.33 |

This counts event boards improved at least once, excluding supplemental 50-yard stroke records; it does not count each incremental record swim. Record cadence is noisy: season 2 produced 13 instead of about 20, season 25 produced 7 instead of about 1–2. It is not forced to follow 40/n. The first season establishes all 40 main boards.

| Champion club | Titles |
|---|---:|
| Santa Clara Swim Club | 5 |
| Longhorn Aquatics | 5 |
| Wichita Swim Club | 3 |
| Mizzou Swim Club | 3 |
| Nation's Capital Swim Club | 3 |
| Carmel Swim Club | 3 |
| SwimMAC Carolina | 2 |
| Blue Springs Power Cats | 1 |
| CSP Tideriders | 1 |
| Rockwood Swim Club | 1 |
| Dynamo Swim Club | 1 |
| Little Rock Dolphins | 1 |
| Mission Viejo Nadadores | 1 |

## Design decisions made

- Fictional Turn & Tide Professional Swim League; neutral final at the Meridian Natatorium. Real club names only; original colors/lettermarks and generated adult swimmers/coaches.
- $30m fixed cap, $360k minimum, non-guaranteed 1–4-year veteran deals, three-year rookie deals. Injured-list salaries receive cap relief. This keeps replacement signings and long-run rosters viable.
- Distance cards in weeks 4, 8, 11 and 13; trade deadline after week 10. The four highest seeds get byes; quarterfinal pairings are reseeded. A tied championship is broken by the closing free relay.
- 144 balanced prospects per class, 96 selections; rookie salaries $600k/$520k/$440k/$360k by round. Drafted surplus competes for the final 14-and-14 roster.
- Mixed benchmarks fixed at 1:27.30 medley and 1:18.90 free after calibration. All other power-point benchmarks use the requested table.
- Race-day splits are normalized in integer hundredths so they add exactly. Overnight accumulated workload recovers by 65% per day. Start/turn/underwater skill affects the individual time; flying legs subtract the actual exchange advantage. Only legal flat-start lead-offs can become official individual marks.
- Scouting uses season marks and observed assignment habits; CPU lineups do not read the user's submitted lineup. Missing season marks use profile estimates. Season-best projected scores are expected points with form uncertainty, not a rigid predicted finish order. Last-relay openness uses the maximum legal point swing of the actual entries, excluding hypothetical DQs; an exact meet tie is winnable by winning the closing relay.
- CPU lineups reserve legal event coverage, prioritize specialists and relay combinations, then use opponent needs to fill remaining third entries. They are deterministic heuristics, not an exhaustive lineup optimizer.
- Compact saves preserve exact PB evidence with lossless packing and browser-native compression. A plain packed JSON fallback works without CompressionStream; it is larger.

## Remaining weaknesses

The per-event five-year drift gate remains flagged in 14 rows, and record frequency does not precisely track 40/n. Do not read the passing aggregate drift as a pass for every event. CPU roster/lineup/contract choices use heuristics and can be improved by a strong human coach. Live racing is a simple 2D pool broadcast, and dense phone tables require horizontal scrolling inside the table. A qualifying official swim is required before a new professional has a league PB; initial estimates and prospect marks are labeled accordingly.

## Five upgrades next

1. Stabilize event-specific talent cohorts across independent 30-year seeds while preserving rare generational swimmers.
2. Improve lineup search across the entire program, including relay sacrifice and opponent uncertainty.
3. Add a full long-course summer circuit with separate ability effects and records.
4. Add assistant-coach specialties, facilities and a development squad.
5. Expand race presentation with stroke animation, lap overlays and coaching replay analysis.

## Reproduction files

- `SHIP-AUDIT.log`, `ship-results.json`, `ship-save.json`: exact-file 30-season audit.
- `browser-results.json`, `extended-browser-results.json`, `office-browser-results.json`: final browser checks.
- `BUILD-LOG.md`: plan, calibration iterations, gates and known issues.
- `engine.js`, `codec.js`, `health.js`, `ui.js`, `style.css`, `build.js`: development sources. None are needed to play the delivered HTML.
