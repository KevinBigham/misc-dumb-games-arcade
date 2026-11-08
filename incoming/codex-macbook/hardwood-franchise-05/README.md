# Hardwood Franchise '05

A standalone basketball franchise-mode game in the spirit of mid-2000s console franchise modes: you are the owner, GM and head coach of a team in the fictional United Basketball League.

## Play

- Open `Hardwood Franchise.html` in any modern browser (works offline; fonts load from Google Fonts when online).
- Saves live in the browser (IndexedDB). Use **Save / Load → Export Save File** to back up or move a franchise.

## Build from source

```bash
node build.js
```

Bundles `src/` into `Hardwood Franchise.html` (full document) and `dist/hardwood.html` (artifact body).

## Tests

Headless engine tests load `src/core/*` into one scope:

```bash
node test/harness.js test/simcal.js 1200   # league stat calibration
node test/harness.js test/long.js 10       # 10-season stability run
node test/harness.js test/plays.js         # play-call balance
```

## Layout

- `src/core/` — engine: players, league, possession-by-possession game sim, finances, news/radio/inbox, transactions (contracts, free agency, draft, trades), season flow, fantasy draft.
- `src/ui/` — screens, live coach-mode game view (canvas court), training-camp mini-games, saves and cloud saves.
- `src/style.css`, `src/template.html`, `build.js`.
