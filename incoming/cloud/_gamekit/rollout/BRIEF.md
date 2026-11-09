# GameKit rollout brief (saves and sound only)

Goal: put GameKit 1.1 in front of each game so its saves get rolling backups and its sound unlocks on iPhone, with no change to the game's own code or save format, then republish each game to its SAME artifact link. Bot-tested only.

## Hard rules
- You are a helper. Never message the user. Do not call any mcp__hearthbot__ tool. Your final message is a report to the session that started you.
- Do not edit gamekit.js, retrofit.js, smoke.mjs, livebody.js or livecmp.js. If one of them needs a fix, stop that game and say what and why in your report.
- Do not touch Gloamrush, Lantern Drum, Pip Hop or the older Stormglass (artifact AFspzaC6rF8BXmLYf4cURk).
- Publish only to the exact URL given for each game. Never create a new artifact. Post nothing outside this project. Never install or launch a browser.
- Do not change a game's code, save keys or save format. The only change is the two script blocks retrofit.js inserts.
- The shared folder /mnt/project-files is used by other helpers at the same time. Write only inside your own games' folders and your own scratch dir.

## Tools (already built)
- Runner for jsdom tests: `sh /home/user/gk-deps/run.sh <script> ...` (jsdom and @napi-rs/canvas are installed there). Run tests from your own scratch dir, e.g. `/tmp/claude-0/-home-user/d4aed79d-fdc5-5062-9eba-ffa6a5bb28f5/scratchpad/run-<batch>`, because some tests write shots folders relative to cwd. Create any folder a test says is missing (ENOENT on a shots/png path) and rerun.
- `node /mnt/project-files/games/kit/rollout/livebody.js <live-saved.html> <out.html>`: strips the host's publish wrapper from a saved live copy, giving the published source.
- `node /mnt/project-files/games/kit/rollout/livecmp.js <live-saved.html> <local.html>`: says whether a local file matches the live source.
- `node /mnt/project-files/games/kit/rollout/retrofit.js <file.html> --id <id> --saves k1,k2 [--dry]`: --dry lists localStorage and AudioContext lines; without --dry it inserts the kit and a `GK.retrofit({game,saves})` line before the first script, parse-checks, and writes the file in place. Idempotent.
- `sh /home/user/gk-deps/run.sh /mnt/project-files/games/kit/rollout/smoke.mjs <pre.html> <post.html> k1,k2 [seed.json]`: before/after check. Plays the pre-kit page to make a save, boots the kit page on it, checks no new errors, saves unchanged, backup made, same audio context count, kit adopted the context and it runs after a tap, and a broken save restores. seed.json is `{"key":"<stored string>"}` for games the bot can't make a save in; build a valid save from the game's own defaults/validator when "the bot wrote no save".

## Steps per game
1. `Artifact` action read on the game's URL. Note the saved file path and version it reports.
2. Make the folder `/mnt/project-files/games/kit/rollout/games/<id>/` (unless the game already lives in a folder listed for you, then use that folder).
3. `livebody.js <saved> <folder>/<id>.pre-kit.html` (rollback copy; never overwrite an existing pre-kit file). If a local source file is listed for you, run livecmp against it and note whether it matches; the LIVE copy is always the source of truth.
4. Find the save keys: `retrofit.js <pre-kit> --dry`, then grep the variables it shows (e.g. `grep -n "KEY\s*=\|const K_" file`). Protect every key that holds player progress or settings. Do NOT protect a key the game itself uses as a quarantine/corrupt copy (names like .bad, .corrupt). If the game has no localStorage at all, use `--saves ""` (sound only) and say so.
5. Look for a UTC daily key (toISOString().slice(0,10), getUTCDate). Do not change it; just list it in your report.
6. `cp <pre-kit> <folder>/<id>.kit-publish.html` then `retrofit.js <folder>/<id>.kit-publish.html --id <id> --saves <keys>`.
7. smoke.mjs pre vs post. All checks must pass (use a seed if the bot wrote no save). Page errors that also happen pre-kit are jsdom limits and are fine.
8. If the game has its own tests that load a local html file (look in its tests/ or test/ folder), copy the local file aside to your scratch dir, put the retrofitted version at that path (for a local file that differs from live, run retrofit.js on the local file itself instead), run the tests, and keep the retrofitted local file in place (the pre-kit copy is the rollback). Record pass/fail counts. If the tests fail only because of the kit, fix nothing in the kit; report it and do not publish that game.
9. Publish: Artifact publish with `url` = the game's URL and `file_path` = the kit-publish file, label "GameKit saves and sound". The first try is refused until you have Read every line of the saved live source it names. Read that file completely (use offset/limit chunks of about 400 lines; the tool caps each read), confirm the refusal says the only difference is the kit lines added (0 lines on the live page that yours lacks), then publish again from the same kit-publish file. If a refusal shows live lines your file lacks, the live page changed: rebuild from the new saved copy (livebody, retrofit, smoke) before publishing.
10. After publishing, Artifact read the URL once more and run livecmp on the new saved copy against your kit-publish file to confirm the live page is your file.

## Report (your final message), one line per game
`<Game>: published|NOT published, keys [..], smoke N/N, own tests <result or none>, live check ok|diff, notes (UTC daily key, seed used, anything odd)`. Then a short list of anything that broke or that you could not test.
