# HUNDREDTHS — Swim Dynasty

A self-contained browser franchise game. Founders' Night ("Draft your first team") → exhibition → season → playoffs → offseason → the next season, indefinitely.

## Play

Open `index.html` in a current browser (double-click works; so does any static host). No build step, account, network or external assets. Careers save in the browser (IndexedDB; the game says so if it has to fall back to localStorage or memory).

## Rebuild from source

```
node build.js        # writes dist/index.html and dist/engine.cjs
```

`src/` is concatenated in filename order into one script inside one HTML file:

| Files | Section |
|---|---|
| `e1_core.js` … `e9_history_game.js` | **Engine** — no DOM. Rules, RNG streams, athlete/time model, generation, lineups, meet simulation, draft, season, offseason, history, integrity checks |
| `p1_store.js` | **Persistence** — slots, autosave, recovery snapshot, export/import, cross-tab guard |
| `u1_base.js` … `u7_league_market_history.js` | **UI** — rendering, dialogs and sheets, Founders' Night workspace, clubhouse, team, Meet Center, league, market, history. `u2b_ptable.js` is the shared sortable player table (Sort-by list, order button, sortable headings) used on every screen that lists several swimmers |
| `style.css` | Styles |

State is one plain JSON object with an explicit `phase` (`draft`, `founding`, `exhib`, `season`, `offseason`) and, in season, a `step` (`prepare`, `enter`, `reveal`, `report`). Ownership is derived only from each swimmer's `club` + `status`, so nobody can be in two places.

Randomness: every draw comes from `H.rng(seed, purpose, key…)` — a fresh stream per purpose and key (athlete id, scouting stage, pick number, season, meet id). There is no shared cursor, so viewing, sorting, scouting and replay speed cannot change a rival decision or a result, and a reload cannot reroll one.

## The Founders' Night workspace (`u3_draft.js`)

The board is the home view at every width; nothing replaces it.

| Width | Layout |
|---|---|
| ≥ 1280px | Your team · the board · the decision, side by side |
| 900–1279px | Your team · the board; a swimmer opens in a side sheet (the roster stays visible) |
| 760–899px | The board (table); a swimmer, your team, a comparison and rival picks open as sheets over it and close back to the same row |
| < 760px | **The ranked list** (`u3b_phone.js`, below) with the same sheets; “Switch to the table” brings back the table and needs strip, and the choice is remembered |
| height < 560px (a phone held sideways) | Single column, and nothing tall is pinned: the header and needs strip scroll away, the list keeps one slim rank-by row |

Pinned above the board is the **needs strip**: 8 individual events × women/men, read off the same legal projected lineup the impact estimates use (`D.base` — two lanes per event, at most two individual swims per swimmer). `○○` open · `●○` one entry · `●●` two entries · `●●+` strong (6+ of the 8 points two swimmers can win against the reference field). Tapping a cell ranks the available swimmers of that sex in that event; tapping again restores the previous view. The table adds a **Could fill** column (events where the swimmer would take an open lane at scoring pace) and, in Times, ① / ② marks (would be your fastest / second entry in an event you already swim).

### On a phone: the ranked list (`u3b_phone.js`)

A table with twenty columns cannot answer "who do I take?" on a 390px screen, so under 760px the board is one numbered list and the **rank-by chips** pinned above it decide the order. Nothing scrolls sideways except the chip row itself.

| Chip | Ranks available swimmers by |
|---|---|
| ★ Best for me (default) | estimated points per meet over a typical later pick, in your legal projected lineup (`D.impact`, see “Women, men and money”) — ordered by the number shown, with women and men alternating inside a tie (thinner side of your roster first); computed in the background for every available swimmer; until it finishes the list is the coach's board and says so. The coach's three sit above it. |
| 50 Fr … 200 IM | time in that event, fastest first, one sex at a time (from "All" it picks the sex where you have fewer swimmers entered). Your own entered swimmers and the scoring pace are shown *in place* in the order. Chips are coloured by your lanes: open / 1 of 2 / 2 of 2 / strong. |
| Value · Price · Age · Upside · Coach's board | market value minus asking salary · salary · age · development outlook · the coach's rating of everyone on one scale (`D.ranked(…, { rating: true })`) |

Tapping the current chip reverses it. Each row carries the ranked number large (with a verdict in event rankings: *takes an open lane*, *would be your fastest*, *would be your second*, *third for you*, *off scoring pace*), the price and contract, the points they would add, the role or next-best event, a shortlist star, and a **Draft** button when you are on the clock (it opens the same review-and-confirm step as everywhere else). **All events at a glance** lists the eight events for one sex: your lanes, your entries, and the fastest swimmer left with their price. The swimmer sheet adds "#n of N available" for each of their events and for points added. The bottom bar holds My team, whose turn it is, and Coach's pick / Review pick / Skip ahead.

It is a view only: it uses the same sort state as the table (`UI.pt.draft`), reads the same engine functions, and changes nothing in the career.

Paced rival picks never redraw the page under the user: they wait while a pointer is down (4 s at most), while anything is scrolling, or while a dropdown is open; they continue under a sheet and resume when an ordinary dialog closes. Pacing is presentation only — a rival's choice is a pure function of the saved career.

## Women, men and money (v1.2.0)

Two reports from play: in the middle and late rounds the rankings of remaining swimmers were full of men, and the cap ran out with picks still to make. Measured on v1.1.0 before changing anything (`tests/t_balance.js` prints the same measurements for the current build):

| | v1.1.0 | v1.2.0 |
|---|---|---|
| Pool, 60 all-GM drafts: women minus men at scoring pace, each round | mean ≈ 0, SD 5.3–6.6 | mean ≈ 0, SD 3.1–4.3 |
| Coach's board, top ten 8–2 or worse (rounds 1–4 / 5–8 / 9–12) | 48% / 89% / 59% | 3% / 10% / 9% |
| Best for me, top ten 8–2 or worse (same rounds) | 16% / 42% / 25% | 5% / 34% / 20% |
| Player's roster 4–1 or 5–0 after five picks | 83% | 54% |
| GM clubs whose free cap never ran out | 15% | 100% |
| Cap left per GM club at the end | $21K | $1.41M |
| Of the best 160 swimmers, drafted | 108 | 153 |
| Player: drafts where free cap never ran out | 0 of 24 (gone after 8–13 picks) | 20 of 24 (the others after 15–18 picks) |
| Player: late-round turns (15–20) with a choice above the minimum salary | 1% | 95% |
| Player: cap left at the end | $0 | $494K on average |

"Player" = the same 24 seeds and the same behaviour in both columns: always take the top row of "Best for me", which is close to the most expensive way to draft. List figures are for turns where both sides of the roster are still open.

**The pool was never tilted** — on average both sides were level in every round. What a player saw was three other things, each now addressed:

1. **Luck of the seed.** The women's and men's pools were drawn separately, so one side could simply be deeper. Now there is one talent ladder (`G.ladder`): each rung — peak level, specialty, base age, individual peak offset, durability — is drawn once and used for one woman and one man (founding pool and every rookie class). Names, strokes and every other attribute are still separate draws; nobody is a copy.
2. **Empty spots counted as value.** An open roster spot used to be a replacement-level placeholder, so the emptier side of a roster looked far more valuable than it was, and relays jumped when a fourth real swimmer arrived. An open spot is now a *typical later pick* (`D.later`): in every event, the swimmer ranked halfway between the next one off the board and the last one drafted, the same rank for both sexes. Est. points therefore mean "what this swimmer adds over the one you would otherwise end up with".
3. **The board showed the picking order, not a rating.** A GM who has two more women than men takes a man next, and the picking order said so by ranking every man first. Rivals, the assistant and a delegated draft still pick that way (it measurably builds better teams; rival drafting is byte-for-byte unchanged). What the player reads as "Coach's board" is now the same judgement with the roster-balance part removed (`{ rating: true }`).

On the phone list a line under the heading reads "Best woman left +x · best man left +y", and when the top ten is still 8–2 or worse it says why (usually: that side of your roster has more open lanes).

**Cap: $10M → $12.5M.** The 160 best swimmers cost $89.3M at asking price against a league-wide cap of $80M, so every club — rivals too — was down to minimum-salary picks for the last five or six rounds and 26 swimmers priced above $300K went undrafted. At $12.5M (league $100M) every GM club finishes with money, and a player who buys the top of the list every single time still has a real choice in 95% of late-round turns. Prices, minimum salary, the completion reserve and rookie deals are unchanged. Careers saved on v1.1.0 load as they are and simply get the larger cap.

Honest limits: “Best for me” is still 8–2 or worse about a third of the time in rounds 5–8. That is the roster talking, not the pool: after four women and one man, men fit more of your open events, and when the roster is level the figure is 17%. Late in a draft (rounds 13–20) lists are often one-sided for a plainer reason — one side of the roster is nearly full. And the game is easier for a player who uses the list. Rival GMs draft exactly as before and leave about $1.5M of the larger cap unspent, while a player who takes the top of “Best for me” every pick spends nearly all of it on better swimmers: over 32 drafts that player projects +5.1 points a meet over the average rival and won the Season 1 title 15 times (v1.1.0 at $10M: +1.7 and 3 titles, because the old cap forced nine minimum-salary picks). Making the rival GMs draft with the same lineup arithmetic is the obvious next step and is not in this version.

## One club renamed (v1.2.1)

The eighth club preset is now **Northmere Loons SC** (still `NLS`, same colours). The name it had before turned out to belong to a real swim club, and every club here except the editable Blue Springs Power Cats preset is meant to be made up. That is the whole change: the built engine differs from v1.2.0 in two lines, that name and the version number. Checked rather than assumed: eight careers (draft, exhibition, a season, an offseason and a second season) run on both engines came out identical apart from that name and the version, so a club's name feeds nothing; and eight careers saved by v1.2.0 in Week 6 opened in v1.2.1 unchanged and played on through the offseason.

A career started before v1.2.1 keeps the club names it was created with. The same display name was replaced inside the four save fixtures in `tests/fixtures/` (same length, nothing else touched), so they are no longer byte-for-byte what the v1.0.0 and v1.1.0 engines wrote. Every batch and suite below was run again on this build.

## Age model (v1.1.0, `e1_core.js` → "Age")

Ages are calibrated against the real world top 10 in each event (`tests/real_ages_2026.json`: World Aquatics 2026 long-course rankings, ages only, read 11 Nov 2026; `tests/t_ages.js` measures the game against it).

- Everyone is an adult: founding pool 18–36, Next Wave rookies 18–22.
- Growth per season is read at a swimmer's **career age** = age − shift. The shift is the event group's (`H.PEAK`: sprinters and the men's stroke specialists later, 200–500 freestylers earlier) plus an individual offset (`a.lon`, hidden, drawn once).
- After the peak, the fade is scaled by **durability** (`H.slowOf(a.dur)`): the most durable lose a fifth as much per season.
- Sprint speed holds with age and endurance fades (`H.SE` per season each way).
- Clubs, contracts and retirement go by the event group's clock (`H.cage`), not raw age.
- Careers saved by v1.0.0 (schema 1) are migrated on load: existing swimmers keep the old clock (peak at 27); later rookies follow the new one (`tests/t_migrate.js`).

## The hosted page (`dist/artifact.html`, `src/h1_host.js`)

`node build.js` also writes `dist/artifact.html`: the same engine and screens, laid out the way a page-publishing tool wants it (no doctype / html / head / body of its own, the name in `<title>`), plus `src/h1_host.js` and a few CSS rules for a phone app's safe areas. `dist/index.html` is not affected by it and stays byte-for-byte what the main suites test.

A hosted page runs in a sandboxed frame that cannot start a download itself, so in that frame only: **Export** goes through the frame's own save prompt where one is offered; where it is not, the career is shown as text to copy, and **Import** takes pasted text as well as a file. Opened as an ordinary page, the same file behaves exactly like `index.html`. Careers live in each player's own browser either way.

`dist/artifact_preview.html` is a local stand-in for the published wrapper, used by `tests/b_host.js` (and by any other suite pointed at it).

## Tests (kept outside normal play)

Headless engine batches (Node 18+):

```
node tests/t_draft.js 100     # draft completeness: 100 seeds × 8 slots + stress strategies + determinism replays
node tests/t_rules.js         # legality, scratches, DQs, ties (incl. 3-way), exact scoring, 226 total
node tests/t_race.js          # one calculation per meet; viewing paths agree; applied once; no leaks at commit
node tests/t_career.js        # draft → exhibition → season → playoffs → offseason → legal season 2
node tests/t_long.js 10 20    # 10 seeds × 20 seasons: invariants, times, ratings, economy, save size
node tests/t_ages.js 12 20    # ages of the league's top 10 per event vs the real world top 10, at the draft and over 20 seasons
node tests/t_migrate.js       # v1.0.0 and v1.1.0 careers (fixtures written by those engines) load and keep playing; a v1.1.0 player
                              # who was out of cap mid-draft has room again
node tests/t_balance.js 60 24 # women/men parity of the pool round by round, how one-sided the lists a player reads are,
                              # and whether every club (and a free-spending player) finishes the draft with money left
```

Browser suites (Playwright + Chromium) run against `dist/index.html`:

```
node tests/b_tests.js         # draft persistence/reloads, reveal leak scan, storage failure, import/export,
                              # recovery, two tabs, keyboard-only, reduced motion, layout stress
node tests/b_more.js          # lineup builder, watching a whole meet, signing, trade, coach-assisted draft
node tests/b_table.js         # sortable player table: sort order vs engine values, column sets, phone layout, view-only
node tests/b_slots.js         # three career slots: fill, replace, delete, export, rename, overwrite guard
node tests/b_draftflow.js     # draft workspace: needs strip vs the engine lineup, sheets return to the same place, Sort-by list,
                              # ①/② and "Could fill" vs the engine, paced rival picks, three layouts and resizing
node tests/b_phone.js         # phone draft list (390 and 360px, touch): every ranking re-derived from the engine and compared row by row
                              # (events, own entries, scoring pace, verdicts, best-for-me, price/age/value/upside/board), events sheet,
                              # filters, search, draft → review → confirm, rival picks, list ↔ table, sideways, and a whole team drafted from the list
node tests/b_host.js          # the hosted page with a stand-in for the viewer frame: export accepted / declined / unavailable,
                              # copy-text fallback, paste import, ordinary download outside a frame, saves survive a reload
node tests/b_walk.js 390 844 m   # full walkthrough + horizontal-overflow check at a given width
node tests/b_draftshots.js 573 900 s   # screenshots of the draft table workspace at one width (into shots/)
node tests/b_phoneshots.js 390 844 p   # screenshots of the phone draft list (into shots/)
node tests/b_off.js 1440 o       # offseason walkthrough
```

The page exposes `window.__HUNDREDTHS__` (engine, UI state, store, current career) for these suites.

**Double-tap guard and test pacing.** For 450 ms after a press opens a dialog, the page ignores a second press on the same spot (a row's Draft button, or the bottom bar's Review pick, can sit exactly where Confirm appears). Scripts that click at machine speed would trip it now and then, so every suite wraps its page with `tests/_guard.js`: before each click, tap, check or select it asks the page how long the guard still has to run (`window.__HUNDREDTHS__.guard()`) and waits that out. The tests *of* the guard use `page.touchscreen.tap` and `page.dblclick`, which are not paced.

## Not included (deliberately deferred)

Facilities and staff; rival-to-rival trades; in-season rival signings; rival-initiated trades.
