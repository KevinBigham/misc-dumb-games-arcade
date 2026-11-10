# Turn & Tide — build log

## Design plan
- One versioned state holds the seed/RNG, teams, adult swimmers, schedule, contracts, draft assets, history, compact swim evidence, settings and career.
- Pure public engine commands return a new state; internal reducers mutate only their private copy. All simulation randomness advances the state RNG. The UI only replays completed results.
- Stroke/distance profiles share one underlying speed curve. Starts, turns, underwaters, exchanges, consistency, durability, taper response and hidden growth modify performance.
- Times use the supplied sex/event benchmarks. Splits use stroke-specific 50-yard pacing curves, scaled and apportioned to exactly sum in hundredths. IM changes stroke; relay legs use actual swimmer times and exchange advantages.
- Calibration measures actual swims, unique performers, training comparisons, relay exchanges and DQs, season outcomes and age changes. No record-time normalization after races.
- State stores evidence only for retained PBs/boards, season bests and current results; headless audit additionally retains every swim.

## Passes
- [x] Engine core and calibration
- [x] Schedule, lineups, training, postseason
- [x] Franchise and at least 25-season health run
- [x] Complete offline interface
- [x] Exact-file ship checks and report

Initial status was unverified. The measured results below supersede it. TodoWrite is unavailable in this environment; this checklist is the progress tracker.

## Core gate — measured
50 fresh seeds, all swimmers rested: every sex/event average within 1% of the benchmark; every eighth performer 1.5–3% back and every fiftieth 4–6% back. Exact split arithmetic and both dual/final lineup coverage passed. See `core-gate.json`. Subsequently testing a stronger starting talent distribution to remove the recruitment-driven change in league depth; this requires rerunning the core gate.

## First 30-season run — measured, not accepted
Zero structural invariant violations across 30 seasons; 13 champions. Most individual/relay averages near target. Last-relay openness approximately 15%; favorite wins approximately 75%, with several seasons low. Projected-close frequency only about 14% (target 40%). Recruitment improved the 50th performer by roughly 1.4% from the first five to last five seasons (target <=0.5%). Raw save 14.6 MB. Added lossless PB evidence packing: all PBs and exact splits round-trip; compressed export approximately 2.1 MB. A second calibration run is in progress. `first-30-results.json` preserves the first run.


## Verified full-evidence run
30 seasons / 939,068 official swims. Every retained PB progression entry, team record, league record and top-ten entry traced to the in-memory swim log. Zero structural errors; 15 champions; no unsigned >=950-point swimmers; zero swims under the specified all-time marks. Save/export/import/continue hashes matched, including compressed 30-year histories. Save size 2.037 MB. Actual paired season-best aging: -0.808%, +0.038%, +0.429%, +0.979% for the four age groups.

Season gate: favorites 79.62%; last relay open 19.73%; projected margin <=15 points 45.19%; untapered vs taper 2.138%; DQs 0.970%; flying advantage 0.548 s. Overall first/last-five drift +0.289% fastest, -0.494% at 50th. Two event depth cells narrowly missed; several relay averages were 1.1–1.3% fast. Changed the underlying freestyle roster mix and sprint/middle ability curve, plus the actual 50-yard stroke model, rather than applying a relay multiplier. Rechecking.

Projection is an expected points model based on season-best times and 3.2% form uncertainty. It is explicitly distinguished in the UI from today's time projection. Actual event scoring always uses the exact prescribed point scales.


## Engine gate accepted
`gate-all-cpu.log` / `full-gate-results.json`: 30 seasons, every club CPU-run (including extensions and trades), all 28 event fastest/depth rows and all 12 relay averages in range. All aging and aggregate league-health checks pass. Favorites 79.697%; final relay open 18.390%; close projections 43.977%; rest 2.139%; DQs 1.022%; exchanges 0.550 s. 17 champions; no unsigned stars or structural violations; zero all-time-mark breaches. First/last-five overall fastest drift +0.094%, depth -0.341%. Save 2.033 MB, exact evidence round-trip. Beginning UI pass. Per-event drift remains separately visible; stochastic individual seasons are not forced into target bands.


## Final interface and ship check
All 13 screens are implemented. Browser checks exercised manual training and lineups, mixed relay order, race playback, the entire offseason, extensions, releases and replacements, free-agent signing, trades, owner firing and a new job, playoff card choice, exact historical evidence, health runs/cancellation/export, and save round-trips. Fixed two bugs discovered in the extended walkthrough: progress redraw detached the Stop button, and season-depth rows lacked a meet reference. Final three browser suites report zero page/console errors. Phone width 390 px has no page-level horizontal overflow. Blocked and full localStorage display export actions; full-storage export works.

The final HTML was extracted and rerun headlessly for 30 complete CPU-managed seasons. Zero invariant or retained-evidence provenance violations; 938,366 official swims in the audit log. All 28 run-average fastest/depth rows, all 12 relay averages, aging buckets, and aggregate gameplay/health ranges pass. Exact RNG, export/import/continue and full year-30 state hashes match. Save: 2.051016 MB. First-season speed check: 1.04 seconds through the final. Plain uncompressed save fallback also round-trips and continues identically. HTML is 404,273 bytes, one inline script, complete ending, and no network resources or calls.

## Open calibration issues — disclosed in delivery
The aggregate no-inflation measure passes, but 17 of 28 sex/event rows flag at least one first-five versus last-five drift comparison outside ±0.5%. The strict event-by-event no-inflation gate is not fully satisfied. Record cadence is variable: 14 event boards improved in season 2, 5 in season 25, and 5 in season 30. These results are displayed and reported, not suppressed or normalized. No claim is made that every requested statistical gate passed. Safari, Firefox, physical devices and sustained human-coach playtesting remain untested.

See VERIFICATION.md and SHIP-MANIFEST.json for exact artifact identity, complete measured tables, decisions and limitations. The HTML alone is the playable deliverable.


## Closing-relay and overnight-load correction
A subsequent arithmetic review found the final-relay openness statistic used a fixed 17-point allowance. Replaced it with the maximum scoring swing of the actual entered relays and verified it against every finishing-order permutation for 25 fresh meets. Championship workload now retains the 65% overnight recovery for subsequent swims, and lineup projections apply the identical per-day carry. Relay projections now use each swimmer's actual exchange advantage. Rerunning all calibration and final-file checks before delivery; the previous ship numbers above will be superseded by the final report.


## Final delivered artifact — supersedes earlier calibration numbers
Final file: Turn-and-Tide.html (404,409 bytes). SHA-256: `0f2a12684f32d5f02ff6fef9a93d520ad4a9c8384177e36492408d81af81ea7c`.

The final extracted script completed 30 all-CPU seasons and 938,085 audited official swims. Every structural/evidence invariant passed. Fifty fresh-seed core averages, all 28 season fastest/depth averages, all 12 relay averages, all four actual aging bands, and all aggregate gameplay/league-health ranges pass. Favorites: 79.811%; actual-entry last-relay openness: 15.170%; projected-close meets: 46.061%; rest: 2.138%; relay DQ: 1.024%; exchange advantage: 0.550 s. Thirteen distinct champions; no unsigned stars or all-time-mark breaches. Aggregate fastest drift +0.270%; 50th drift −0.323%. Compressed save: 2.062608 MB.

Remaining flags: 14 of 28 event rows have an event-specific five-year drift comparison outside ±0.5%; record cadence varies (13 event boards improved in season 2; 7 in season 25; 2 in season 30). These remain visible in League Health and VERIFICATION.md. The strict event-by-event drift gate is not fully met.

All three browser suites reran against this frozen HTML and passed with zero console/page errors and zero network requests. The exact-file static/codec check passed, including uncompressed fallback continuation; a season through the final took 1.01 seconds. Save migration fixtures now remove fields absent from v1/v2 and verify a legal subsequent week. Phone width and historical-player dialogs passed. No HTML edits followed these checks.

All requested implementation work is delivered in the one HTML file. VERIFICATION.md contains the actual full tables, decisions, remaining calibration flags, untested environments and five next upgrades.
