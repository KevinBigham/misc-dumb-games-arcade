# Kimi Work / MacBook Air — incoming games (2026-11-08)

Compared title, folder, gameplay, and source/build files against `origin/main` at `e71c496` (all 76 published game folders, plus the held/source-only entries in `CATALOG.md`). This update removes the stale duplicate snapshots previously carried by draft PR #7.

## Included games

| Name | Group | Existing folder matched | Original path | Last modified | Runs |
|---|---|---|---|---|---|
| STAMP DUTY: Executive Disorder | NEW | None — distinct 3D slam/bank arena game, not the 2D launch-based Stamp Duty | `/Users/kevin/Documents/Kimi/Workspaces/games/executive-disorder` | 2026-11-08 | **Yes** — production build passed; Chromium render/start/pause/console smoke check passed. |
| Piñata Panic | **NEEDS RENAME** | None | `/Users/kevin/Documents/Kimi/Workspaces/games/pinata-panic` | 2026-11-08 | **Yes** — TypeScript check and production build passed; Chromium render/start/pause/console smoke check passed. |
| STAMP DUTY: OVERQUALIFIED | NEW | None — newer, more complete build of local `stamp-duty` | `/Users/kevin/Documents/Kimi/Workspaces/games/stamp-duty-overqualified` | 2026-11-08 | **Yes** — TypeScript check and production build passed; Chromium render/start/pause/console smoke check passed. |

### Rename required before publication

- **Piñata Panic:** `src/game/content.ts` names an upgrade **SOUR PATCH**, a real candy brand. Rename that upgrade before adding this game to the published arcade.

## Duplicates checked and skipped

| Name | Existing match | Original path | Last modified | Why skipped |
|---|---|---|---|---|
| Kimi app prototype (HUSH//PULSE mixed prototype) | Prior PR #7 `app`; listed source-only in `CATALOG.md` | `/Users/kevin/Documents/Kimi/Workspaces/games/app` | 2026-11-07 | **DUPLICATE** — same source snapshot; no later source changes and no working browser build. |
| HUSH//PULSE | `games/hush-pulse` | `/Users/kevin/Documents/Kimi/Workspaces/games/hush-pulse` | 2026-11-08 | **DUPLICATE** — same source snapshot already submitted in PR #7 and published; no later source changes. |
| PRISM PRESS | `games/prism-press` | `/Users/kevin/Documents/Kimi/Workspaces/games/prism-press` | 2026-11-08 | **DUPLICATE** — same source snapshot already submitted in PR #7 and published; no later source changes. |
| SOUPERMARKET SWEEP: Aisles of the Damned | `games/soupermarket-sweep` | `/Users/kevin/Documents/Kimi/Workspaces/games/soupermarket-sweep` | 2026-11-08 | **DUPLICATE** — same source snapshot already submitted in PR #7 and published; no later source changes. |
| STAMP DUTY: OVERQUALIFIED (older `stamp-duty` folder) | Newer local `stamp-duty-overqualified` included above | `/Users/kevin/Documents/Kimi/Workspaces/games/stamp-duty` | 2026-11-08 | **DUPLICATE** — same 2D charge/launch/stamp/bank game; older source with fewer validation/build fixes. |

No `NEWER BUILD` replacements were found. Mr. Football Dynasty, Mr. Baseball Dynasty, and Last Bell are not included. `node_modules`, build caches, browser-test screenshots, logs, and files over 50 MB are excluded. No folder under published `games/` was changed.
