# Swim dynasty sim — build log
## Plan
- State: single league object L {v, seed, rng[4] (sfc32, lives in state), season, week, phase, teams[24], sw{id:swimmer}, fa[], dc[], sched, recs, top, hist, news...}. Engine = functions over L, no DOM. UI uses a separate cosmetic RNG.
- Swimmer: q (quality gap %), st[4] stroke offsets, pk (free distance peak idx), sp (stroke distance peak), wd (range), im, start/turn/exchange/taper/consistency/durability/clutch, hidden peakAge/devRate.
- Time: T = bench[sex][event] * (1 + softfloor(gap + CAL)/100); gap = q + strokeOffset + 0.9*(|eventIdx-peak|/width)^1.7 + start/turn terms. Swim = T * form(fatigue, fitness, taper sharpness) * (1+meet fatigue) * home * clutch * (1+noise). Splits: per-event shape fractions from the brief's reference swims, tilted by swimmer profile, cumulative-rounded so they sum exactly.
- Benchmarks: the brief's table (fixed forever); CAL per event from headless calibration runs.
- Calibrate: headless multi-season runs; tune CAL so avg fastest-of-season = bench, generator mix for depth.
## Gates
- Gate 1/2/3 (engine, headless, 30 seasons seed gate30b, all CPU): 0 invariant violations; fastest within 0.5% of table in all events; 8th ~2%, 50th 4.7-6.5% (50 free over by ~0.4); relays within 1%; rest 2.4%; flying 0.45s; DQ 0.67%; aging -1.10/-0.28/+0.34/+0.82; sprint peak 26.1 vs distance 24.4; drift 0.09/-0.02; records 123 vs 120 predicted; 0 all-time-mark swims; 17 champions; save 1.40 MB.
- Dual stats: favorite 75-82% by seed; open at last relay 19-24%; close-projected-and-open 33-42% (target 40+, MISS on most seeds: limited by season-best projection error, not dice).
- Determinism: same seed -> same hash; save/load mid-season -> identical hash.
- Open: UI (pass 4), ship check (pass 5).
- Pass 4 UI built (u01-u04 + style.css). Pass 5 ship check on dist/black-line-dynasty.html: script extracted and rerun headless 30 seasons (seed ship30): 0 violations; 4 flags (W 50 free 50th 6.11%, W 1650 50th 6.04%, M 200 FR relay -1.32%, close-and-open 35.7% vs 40%). Same-seed hash equal; save/load hash equal. Playwright drive: 30/30 checks, 0 console errors, 0 network requests, phone width no overflow.
- Rebuild: ./build.sh ; tests: test/run.js, test/det.js, test/ui2.js, test/calib.js
