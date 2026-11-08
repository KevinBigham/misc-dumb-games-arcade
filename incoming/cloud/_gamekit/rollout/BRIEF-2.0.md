# GameKit 2.0 re-roll brief (publish helpers)

What changed: kit 2.0 adds automatic wins for finished games: drawing sharpness capped at 2x, sound fades and pauses while the page is hidden (a pause the game makes still wins), all game sound goes through one master limiter, and a `?fps=30` test switch. Saves code is unchanged from 1.1.1. No game code changes.

Already done for you (by the session that started you): each game's `<folder>/<id>.kit-publish.html` now holds kit 2.0 with the same id and save keys. `<folder>/<id>.pre-v2.html` is the page that is live now (kit 1.1.1), kept as the rollback. `<folder>/<id>.pre-kit.html` is the game before any kit. The first smoke run's log is in `/tmp/claude-0/-home-user/675d63ea-d574-55a8-9f25-fd0338219a39/scratchpad/r2/<id>.log`.

## Hard rules
- You are a helper. Never message the user and never call any mcp__hearthbot__ tool. Your final message is your report.
- Do not edit gamekit.js or any tool in games/kit/rollout/. If one needs a fix, stop that game and report what and why.
- Never overwrite `<id>.pre-kit.html` or `<id>.pre-v2.html`. Never change game code, save keys or save format.
- Publish only to the exact URL given for each game. Never create a new artifact. Post nothing anywhere else. Never install anything, never download code, never install or launch a browser.
- Do not touch Gloamrush, Lantern Drum, Pip Hop, Dual Meet, Loopskate or the older Stormglass (AFspzaC6rF8BXmLYf4cURk).
- Other helpers work in /mnt/project-files at the same time. Write only in your own games' folders and in your own scratch dir: `/tmp/claude-0/-home-user/675d63ea-d574-55a8-9f25-fd0338219a39/scratchpad/h-<your group>/`. Run tests from there.

## Tools
- Test runner (jsdom and @napi-rs/canvas are installed, test use only): `sh /home/user/gk-deps/run.sh <script> ...`
- Smoke: `sh /home/user/gk-deps/run.sh /mnt/project-files/games/kit/rollout/smoke.mjs <pre-kit> <kit-publish> <keys> [seed.json]`
- Keys and options: `grep -o '<script id="gkboot">[^<]*' <kit-publish>` shows `{"game":..,"saves":[..]}` (plus `"limiter":false` for rhythm games).
- `node /mnt/project-files/games/kit/rollout/retrofit.js <file> --id <id> --saves k1,k2 [--opts '{"limiter":false}']` swaps the kit block (idempotent).
- `node .../rollout/samegame.js <saved live> <pre-kit>` and `node .../rollout/livecmp.js <saved live> <local>`.

## Steps per game
1. Smoke must be all PASS. If the log says "the bot wrote no save", build a seed file `{"<key>":"<stored string>"}` from the game's own default save / validator (read the game's save code; make the smallest valid save) and rerun smoke with it. Every check must pass, including "old save loads unchanged", "a backup ... is made" and "a broken save comes back from the backup". If a key can't be seeded, say why.
2. Local copies: for any other html in the game's folder or its dist/ (not pre-kit, pre-v2, kit-publish) that contains `id="gamekit"`: copy it to your scratch dir first, run the game's own tests (its test/ or tests/ folder, with run.sh, pointing any output path at your scratch dir) for a baseline count, then run retrofit.js on the local file with the same id, keys and opts, and rerun the tests. The after count must equal the baseline. If tests fail only because of kit 2, put the scratch copy back, do NOT publish that game, and report it.
3. Publish: Artifact publish, `url` = the game's URL, `file_path` = the kit-publish file, label "GameKit 2.0". The first try is refused and saves the live source to a file: Read every line of that file (chunks of about 400 lines), then run samegame.js on it against pre-kit. It must say SAME GAME (live kit 1.1.1). If DIFFERENT, the game changed live: do not publish, report it. Then publish again from the same file; if refused as identical/unchanged, send it once more as the refusal says.
4. Artifact read the URL once more and run livecmp.js on the new saved copy against the kit-publish file: must be SAME.

## Report (final message): one line per game
`<Game>: published 2.0 | NOT published, smoke N/N (seed used?), own tests before/after or none, live check ok|diff, notes`. Then a short list of anything that broke or could not be tested.
