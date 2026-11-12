# claude-cowork-mac-mini-2 — incoming games (batch 2)

Collected the evening of 2026-11-08 (Central) by Claude (Cowork) on uncle-ts-mac-mini-local. Nothing was moved, renamed or deleted from the originals.
Antigravity (Gemini Argon) built all of these in ~/Downloads/Game1 between 8:08 and 8:12 PM Central. None were committed in Game1, and three had never been built.
Each `<slug>/` is a standalone Vite build (index.html + assets/, relative paths) that Claude built from the game's own source. The source is in `<slug>/source/`. Serve over http; file:// won't work.
"Runs" means it opened in headless Chromium, the canvas rendered, a run started, and there were no JS errors. The games' own Vitest suites pass (38/38 across all six, including the held one).

| Game | Folder | Original path | Last modified | Runs |
|---|---|---|---|---|
| Aegis: Volt-Lash | volt-lash/ | ~/Downloads/Game1/games/13-aegis-volt-lash/ | 2026-11-08 | yes |
| Ricochet Vault // Greed Breaker | ricochet-vault/ | ~/Downloads/Game1/games/13-ricochet-vault/ | 2026-11-08 | yes |
| SLINGCORE | slingcore/ | ~/Downloads/Game1/games/13-slingcore/ | 2026-11-08 | yes |
| SNAP-LANCE | snap-lance/ | ~/Downloads/Game1/games/13-snap-lance/ | 2026-11-08 | yes |
| SNAPBACK: Kinetic Tether | snapback/ | ~/Downloads/Game1/games/13-snapback/ | 2026-11-08 | yes |

## NEEDS RENAME (held, not in this folder)

- **Aegis-Zero: Graze Overclock** (~/Downloads/Game1/games/13-aegis-zero/). The game runs, but players can see real game names in it: a chassis called "Phantom-Braid", an augment called "Braid Worldline Twin", and an upgrade called "Nuclear Throne Cataclysm". A built copy is held at ~/Desktop/game-collect/_held/aegis-zero/.

## Before publishing

- Strip the inspiration credits in each game's src/index.ts metadata (primaryReference/supportingReference): Hyper Light Drifter, Geometry Wars, Nuclear Throne, Vampire Survivors, Ikaruga, Peggle, Holedown, Ball x Pit, Downwell, Disc Room. Also remove the code comment in ricochet-vault/source/src/audio.ts that names Peggle/Mario.

## Build notes

- ricochet-vault's index.html used an absolute script path (/games/13-ricochet-vault/src/index.ts). The build copy was changed to ./src/index.ts so it works as a standalone folder. The original is unchanged.

## Skipped

- Game1/node_modules and .git
- Anything already on main or in an open incoming/fold-in PR, including the 5 Nov 8 Argon games from PR #15
- Newer edits to ~/Game titles (26, Crossblock, Moon and others): those games are already in the arcade, so this is an update, not a new game
- Codex's arcade working copies in ~/Documents/Codex/2026-11-08/ (copies of existing arcade games)
- MFD, MBD, Last Bell: excluded by arcade rule
- Files over 50 MB: none
