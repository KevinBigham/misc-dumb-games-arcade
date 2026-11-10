# Codex / MacBook — additional collection, 2026-11-10

12 additional game builds collected on this MacBook. `codex-macbook` identifies the collector; source-app labels preserve provenance. Distinct Kimi and Antigravity versions are kept separately. The earlier November 8 collection remains in [draft PR #3](https://github.com/KevinBigham/misc-dumb-games-arcade/pull/3).

Original files were not edited, moved, renamed or deleted. Folder-based projects retain their contents except the exclusions below. Each standalone HTML game has its own folder and keeps its original filename. All 106 copied files (25,844,712 bytes) matched their source-copy SHA-256 fingerprints. Playable `dist/` output is retained; it is the browser entry for Basketball Dynasty.

Last-modified timestamps are the newest retained original file timestamp for each build, in America/Chicago. Browser `yes` means the copied entry opened successfully in Chrome over local HTTP and passed the bounded check listed below. These are launch/basic-interaction checks, not complete gameplay tests. See [BROWSER_CHECKS.json](BROWSER_CHECKS.json).

| Game / entry | Original path | Last modified | Opened in a browser | Check |
| --- | --- | --- | --- | --- |
| [Basketball Sim Crazy Fun Dynasty Legendary GM](basketball-dynasty/app/dist/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/basketball-dynasty` | 2026-11-09T04:39:31-06:00 | yes | Created a Boston Foundry franchise and reached the GM dashboard. |
| [EMBER LOOP](ember-loop/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/ember-loop` | 2026-11-08T23:39:44-06:00 | yes | Started a loop, supplied movement input, and opened the pause menu. |
| [SIGNAL GARDEN — Kimi build](signal-garden-kimi/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/signal-garden` | 2026-11-08T23:46:08-06:00 | yes | Entered level 1, First Light; puzzle completion not tested. |
| [TIDE CALLER — Kimi build](tide-caller-kimi/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/tide-caller` | 2026-11-08T23:42:08-06:00 | yes | Started a race, supplied four strokes and a breath; race clock advanced and oxygen restored. |
| [GRAVITY HEIST — Kimi build](gravity-heist-kimi/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/gravity-heist` | 2026-11-08T23:31:46-06:00 | yes | Started level 1 and supplied movement, jump and gravity inputs; timer advanced. |
| [PITCH TUNNEL — A Nine-Zone Mind Game](pitch-tunnel/index.html) | `/Users/kevin/Documents/kimi/Workspaces/games/pitch-tunnel` | 2026-11-08T23:44:00-06:00 | yes | Started play, selected a pitch and zone, and swung; game reported a swing and miss. |
| [CHAIRBORNE: LIVE AT 11!](chairborne-live/chairborne-live.html) | `/Users/kevin/Documents/argongames/chairborne-live.html` | 2026-11-08T16:28:00-06:00 | yes | Started play, held and released sneeze input, and opened the commercial-break pause menu. |
| [Pro Swim Dynasty](pro-swim-dynasty/pro-swim-dynasty.html) | `/Users/kevin/Documents/argongames/pro-swim-dynasty.html` | 2026-11-09T22:44:30-06:00 | yes | Launched a Blue Springs franchise and quick-simulated Week 1; advanced to Week 2 with a 0–1 record. |
| [National Pro Swimming League — Dynasty Sim](swim-dynasty/swim-dynasty.html) | `/Users/kevin/Documents/argongames/swim-dynasty.html` | 2026-11-09T23:08:03-06:00 | yes | Quick-simulated Week 1; advanced to Week 2 with a 1–0 record. |
| [SIGNAL GARDEN — Antigravity build](signal-garden-antigravity/signal-garden.html) | `/Users/kevin/Documents/argongames/signal-garden.html` | 2026-11-08T23:13:32-06:00 | yes | Opened the 16-level conservatory menu; puzzle completion not tested. |
| [GRAVITY HEIST — Antigravity build](gravity-heist-antigravity/gravity-heist.html) | `/Users/kevin/Documents/argongames/gravity-heist.html` | 2026-11-08T23:08:24-06:00 | yes | Moved, jumped and flipped gravity; character position and timer changed. |
| [TIDE CALLER — Antigravity build](tide-caller-antigravity/index.html) | `/Users/kevin/Documents/argongames/index.html` | 2026-11-08T23:09:59-06:00 | yes | Started a race, supplied four strokes and a breath; screenshot showed 13 m, 7.06 seconds and a three-stroke streak. |

To play from a local checkout, serve a game folder with `python3 -m http.server 8000` and open its linked entry at `http://localhost:8000/`. For Basketball Dynasty, serve `basketball-dynasty/app/dist/` and open `index.html`; no dependency install is needed for that retained build. The remaining entries are standalone HTML games. GitHub file previews do not execute the games.

## Skipped

Excluded dependency folders:

- `/Users/kevin/Documents/kimi/Workspaces/games/basketball-dynasty/app/node_modules` — dependency directory.
- `/Users/kevin/Documents/kimi/Workspaces/games/signal-garden/node_modules` — dependency directory.
- `/Users/kevin/Documents/kimi/Workspaces/games/tide-caller/node_modules` — dependency directory.
- `/Users/kevin/Documents/kimi/Workspaces/games/gravity-heist/node_modules` — dependency directory.

No retained candidate file exceeded 50 MB (50,000,000 bytes). No additional build/cache directories were present in the selected source folders. The copy policy also excludes Git metadata, build/runtime caches, dependency environments, generated test output, OS metadata, symlinks and local environment configuration when present.

Not recopied during this additional pass:

- `/Users/kevin/Documents/argongames/honkcourt.html` — exact SHA-256 match of `games/honkcourt/index.html` already on main.
- `/Users/kevin/Documents/argongames/accordion-courtroom.html` — exact SHA-256 match of `games/accordion-courtroom/index.html` already on main.
- Existing arcade checkout/import mirrors and earlier collections — already represented in main or pending collection PRs; this pass adds newly found builds rather than copying those mirrors.
- Earlier Mr. Football / Mr. Basketball snapshots — not new, and previously removed from PR #3 because they have separate repositories.

Search covered recent Codex workspaces/worktrees, local Projects, Downloads/Desktop, Kimi workspaces, Claude scratch/artifact folders, argongames, Antigravity scratch and Codex visualizations. The 12 added builds came from the Kimi and argongames paths above.
