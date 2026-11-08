# 26 — Doing My Best

A cozy, funny, occasionally too-real quarter-life strategy game. You have a job,
a small apartment, a cat named Miso, and one free evening per day. Make it through
28 days without reducing your entire life to either a bank balance or a group chat.

## Play

- **No setup:** open `twenty-six.html` in Chrome, Safari, Edge, or Firefox.
- **Mac shortcut:** double-click `Play-26.command`.
- **Development:** `npm run dev`, then visit `http://localhost:4173/twenty-six.html`.
- **Unbundled development:** visit `/src/twenty-six.html` on the same server.
- **Production build:** `npm run build`; the portable game is `dist/twenty-six.html`.

The portable edition is self-contained. It needs no server, network requests,
libraries, remote fonts, images, account, or API key. Actual browser acceptance was
performed in Chromium; other modern browsers have not been individually certified.

## The game

Choose one of three plans each evening, or go to bed for free. Your day job runs
in the background. Work, food, friendships, hobbies, bad dates, laundry, and saying
no all have costs and benefits. The apartment reflects what you have been doing.

- **28 evenings:** one action per fixed day; no timer and no reaction test.
- **18 activities:** from cooking and side gigs to dating-app roulette and simply
  becoming horizontal.
- **16 authored surprises:** eight different events per month, three responses
  each. Friends move away. Invitations are expensive. Your laundry unionizes.
- **Five combos:** cook → socialize; move → create; work → rest; admin → rest;
  socialize → set a boundary. Setups offer useful follow-ups; rest is always available.
- **Six upgrades:** choose one after each of the first three weeks.
- **Eight playstyle titles:** a month can become your Boundary Renaissance,
  Invoice Goblin era, or a Professional Horizontal situation.
- **A changing apartment:** friends visit, the character rests, meals appear,
  laundry clears, and memories go on the wall.
- **Miso:** one free cat interaction per day, worth +3 peace.
- **Month codes:** replay your ending’s seed, or enter a friend’s seed under
  New month. Decisions still affect later random draws, so a shared seed is an
  identical starting point, not a promise of identical offers under different choices.
- **A souvenir:** download your month recap as a PNG. It is generated locally;
  nothing is posted or uploaded.

## Economy and goals

Start with $650, 70 energy, 58 peace, and 52 connection.

| Rule | Amount |
| --- | --- |
| Friday pay | +$420 |
| Sunday groceries, utilities, transport, and ordinary bills | −$250 |
| Rent after evening 28 | −$1,200 |
| Weekday energy upkeep | −8 |
| Weekend energy upkeep | −4 |
| Daily peace / connection upkeep | −3 / −3 |
| Stocked meal | Uses one meal; reduces energy upkeep by 4 |
| Tidy apartment | +2 peace at day-end while its tidy counter lasts |
| Rethink the three plans | Once per day; −5 peace |

Your bank balance is spendable. Rent coverage is a visual guide, not a protected
account. The final day charges both the Sunday bills and rent, exactly once.

The four goals are: pay rent, collect at least four distinct memories, set at least
three boundaries, and finish with energy, peace, and connection all at 25 or more.
At zero energy or peace, a helping-hand reset restores some reserves. Being human
does not end the run. Missing rent has its own honest ending and a new-month option.

## Controls

| Control | Action |
| --- | --- |
| Click / tap | Choose plans and responses |
| 1 / 2 / 3 | Choose the matching plan, event response, or upgrade |
| 4 | Go to bed during normal play |
| M | Toggle sound outside dialogs |
| Escape | Close optional dialogs |

Mandatory events and upgrade choices must be resolved. Every surprise has a
cash-free option. Sound begins muted. Reduced-motion preferences are respected.
The four resource meters remain visible while scrolling.

## Saves and technical design

- The independent save namespace is `twenty-six.run`, schema v1. Existing games’
  profiles and campaigns are never read or written by this game.
- Every action validates before changing state. Save data is checked before load.
- Unknown versions and malformed saves remain untouched; play can continue in a
  temporary session with an explicit warning.
- A stale tab cannot overwrite a newer save. Reload the stale tab to use the
  newer progress. File and HTTP editions, browsers, and devices can have separate
  storage; private browsing may limit persistence.
- Simulation uses the existing seeded RNG and fixed days. Browser time, rendering,
  audio, and export do not affect simulation state.
- The build packs the same source into one HTML file. It preserves literal dollar
  templates and performs no transpilation or minification.

## Source map

| File | Responsibility |
| --- | --- |
| `src/sim/quarterlife.js` | Deterministic economy, actions, combos, progression, endings, validation |
| `src/sim/quarterlife-data.js` | Plans, events, upgrades, daily writing |
| `src/quarterlife-view.js` | Read-only HTML and apartment illustration |
| `src/quarterlife.css` | Responsive presentation and reduced motion |
| `src/quarterlife-main.js` | Input, dialogs, sound, orchestration |
| `src/quarterlife-storage.js` | Protected and concurrency-aware autosave |
| `src/quarterlife-recap.js` | Read-only weekly and playstyle selectors |
| `src/quarterlife-share.js` | Local PNG keepsake generation |
| `scripts/build-quarterlife.mjs` | Portable HTML bundler |
| `tests/quarterlife.test.js` | Simulation, storage, rendering, and bundle regression coverage |
| `tests/browser-quarterlife.mjs` | Playwright acceptance against source and portable editions |

Run `npm test`, `npm run check`, and `npm run build` for project validation.
To rebuild only this game, run `node scripts/build-quarterlife.mjs`.

During this build the default Homebrew Node binary had a missing `simdjson` library.
The installed Node 22 runtime worked:

```sh
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm test
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run check
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run build
```

This machine-specific workaround is only for development. The portable game has
no Node dependency. SIDELINE remains the repository’s default entry point.
