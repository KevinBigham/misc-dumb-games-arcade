# GameKit 1.1.1 re-roll brief

Why: kit 1.1.0 resumed a game's sound after the game paused it on purpose (pause screen, mute, count-in): any tap or window focus restarted the audio clock. 1.1.1 treats the game's own `ctx.suspend()` as a hold that only the game's own `resume()` lifts. smoke.mjs now checks this ("a pause the game makes stays paused after a tap") and requires kit 1.1.1. The boot line is now `window.GK.retrofit(...)`.

Every game you are given already has the kit (1.1.0) live. Replace it with 1.1.1 and republish to the SAME link.

## Hard rules (same as BRIEF.md)
- You are a helper. Never message the user and do not call any mcp__hearthbot__ tool. Your final message is your report.
- Do not edit gamekit.js or any tool in games/kit/rollout/. If one needs a fix, stop that game and report it.
- Do not touch Gloamrush, Lantern Drum, Pip Hop or the older Stormglass (AFspzaC6rF8BXmLYf4cURk). Publish only to the exact URL given. Never create a new artifact. Never install or launch a browser.
- Never change game code, save keys or save format. Never overwrite a `<id>.pre-kit.html` file (that is the rollback, the game before any kit).
- Write only inside your own games' folders and your own scratch dir. Run tests from your scratch dir; when a test has an output-path env var or default (for example OUT or a shots folder), point it at your scratch dir.

## Steps per game
1. Keys: `grep -o 'GK.retrofit([^)]*)' <folder>/<id>.kit-publish.html` shows the id and saves already chosen. Keep them exactly.
2. `node /mnt/project-files/games/kit/rollout/retrofit.js <folder>/<id>.kit-publish.html --id <id> --saves <same keys>` (idempotent: swaps the kit block).
3. Smoke: `sh /home/user/gk-deps/run.sh /mnt/project-files/games/kit/rollout/smoke.mjs <folder>/<id>.pre-kit.html <folder>/<id>.kit-publish.html <keys> [seed]`. Seeds made earlier are in `/tmp/claude-0/-home-user/d4aed79d-fdc5-5062-9eba-ffa6a5bb28f5/scratchpad/run-*/seed-*.json` (find the one for your game; build one from the game's defaults if none and the bot writes no save). Every check must pass, including the pause check and "kit 1.1.1 is on the page".
4. Local copies: if any local html file in the game's folder (other than pre-kit and kit-publish) contains `id="gamekit"`, run retrofit.js on that file too with the same keys, then rerun the game's own tests (tests/ or test/ folder) and compare with the counts given to you.
5. Publish with Artifact (url = the game's URL, file_path = the kit-publish file, label "GameKit 1.1.1 pause fix"). When refused, Read every line of the saved live source it names (chunks of about 400 lines), then run `node /mnt/project-files/games/kit/rollout/samegame.js <saved live> <folder>/<id>.pre-kit.html`. It must say SAME GAME (live kit 1.1.0 or none). If it says DIFFERENT, the game itself changed live: do NOT publish, report it. Then publish again from the same file; if refused as identical/unchanged, resend once more as the refusal says.
6. Artifact read the URL once more and run `node /mnt/project-files/games/kit/rollout/livecmp.js <new saved> <folder>/<id>.kit-publish.html`: must be SAME.

## Report: one line per game
`<Game>: published 1.1.1 | NOT published, smoke N/N (pause check result), own tests <result or none>, live check ok|diff, notes`. Then anything that broke or could not be tested.
