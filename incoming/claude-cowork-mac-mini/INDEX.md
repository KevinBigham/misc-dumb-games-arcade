# claude-cowork-mac-mini — incoming games

Collected 2026-11-08 by Claude (Cowork) from uncle-ts-mac-mini-local. Originals were copied, not moved, renamed or deleted.
"Runs" = opened in headless Chromium over a local http server: page loaded, game UI or canvas rendered, no JS errors.
Dates are the original entry file's last-modified date (Central time).

| Game | Copied to | Original path | Last modified | Runs |
|---|---|---|---|---|
| Echo Requiem | game-lab/echo.html | ~/Game/echo.html (+ src/main.js) | 2026-11-04 | yes |
| Sideline — Franchise Football | game-lab/index.html | ~/Game/index.html (+ src/franchise-main.js) | 2026-11-08 | yes |
| Crossblock | game-lab/crossblock.html (single file: crossblock-play.html) | ~/Game/crossblock.html | 2026-11-08 | yes |
| Please Feed the Moon | game-lab/moon.html (single file: moon-play.html) | ~/Game/moon.html | 2026-11-07 | yes |
| The Last Light | game-lab/last-light.html (single file: dist/last-light-standalone.html) | ~/Game/last-light.html | 2026-11-08 | yes |
| 26 — Doing My Best (Quarterlife) | game-lab/twenty-six.html | ~/Game/twenty-six.html | 2026-11-08 | yes |
| Honk If You're Employed | game-lab/src/honk/Honk_If_Youre_Employed.html | ~/Game/src/honk/ | 2026-11-08 | yes |
| Gridiron Blitz '00 | gridiron-blitz-00/index.html | Cowork live artifact "gridiron-blitz-00" (desktop app sidebar) | 2026-08-01 | yes |
| Gridiron Overdrive | gridiron-overdrive/dist-artifact/gridiron-overdrive.html | ~/Downloads/mfd-playable-3d-standalone-main.zip (extracted) | 2026-08-03 | yes |
| Mr. Football Dynasty (MFD) | mr-football-dynasty/ | ~/Downloads/MFD-main 2/ | 2026-08-08 | untested (needs `pnpm install` + build) |

## Notes

- The first seven games share one codebase (~/Game), so they were copied once as `game-lab/` instead of split into separate folders. Run `node scripts/serve.mjs` in `game-lab/` (or double-click Play.command) and open the file listed above.
- ~/Game was being edited by another agent during collection (files changed as recently as 9:43 AM Central). This copy is a snapshot from about 9:41 AM Central; ~/Game itself has 132 uncommitted changes.
- MFD and Gridiron Overdrive already have their own GitHub repos (KevinBigham/MFD, KevinBigham/mfd-playable-3d-standalone). Both were built by several agents, not only Claude.

## Skipped

- ~/Game/.git (6.7 MB): git history, not copied, so this folder isn't nested inside another repo
- ~/Game/.playwright-mcp (4.8 MB), ~/Game/.playwright-cli (0.8 MB), ~/Game/output (5.3 MB): Playwright test caches and output
- ~/Downloads/MFD-main 2/.git: git history (no node_modules were present)
- node_modules: none in the copied folders
- Files over 50 MB: none in the copied folders

## Found but not copied (built by other agents, not Claude)

- ~/Downloads/Game1/: Gemini "Argon 10-Game Studio" plus VOIDBREAKER: OVERDRIVE (remote KevinBigham/voidbreaker-overdrive)
- ~/Documents/Codex/: Codex task workspaces (for example 2026-10-13/task-3/game-delivery-20261104)
