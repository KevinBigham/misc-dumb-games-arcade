# GameKit 2.1 wiring brief (turn the features on, per game)

Kevin asked to turn on, in every game: the shared settings panel ("Play your way": motion levels, flash limit, text size, sound volume, plus speed assist for real-time and rhythm games), a first-touch coach hint, the studio colors on kit surfaces, a 12px text floor, and climbing combo sounds where a game has combos. Keep each game's own world and art. Where a game already has its own version of a feature, merge it rather than add a second copy.

## Hard rules
- You are a helper. Never message the user and never call any mcp__hearthbot__ tool. Your final message is your report.
- Do not edit gamekit.js or any tool in games/kit/rollout/. If one needs a fix, stop that game and report what and why.
- Never change a game's save keys or save format. Player settings live in the kit's own `gk.prefs.v1`. You may READ a game's old setting once to seed the kit setting (see Merge), never delete or rewrite it.
- Never overwrite `<id>.pre-kit.html`, `<id>.pre-v2.html` or `<id>.pre-wire.html` once made.
- Publish only to the exact URL given for each game. Never create a new artifact. Post nothing anywhere else. Never install anything, never download code, never install or launch a browser.
- Do not touch Gloamrush, Lantern Drum, Pip Hop, Dual Meet, Loopskate or the older Stormglass (AFspzaC6rF8BXmLYf4cURk).
- Other helpers work in /mnt/project-files at the same time. Write only in your own games' folders and in your scratch dir. Run tests from your scratch dir.
- Small, safe changes only. No redesigns, no new mechanics, no art changes. At 100% speed and Full motion a game must play exactly as before.

## Kit 2.1 API (all inline in the page as `GK`)
- `GK.studio()` once at boot: studio colors on kit surfaces (panel, toasts, coach ring). Game art untouched.
- Settings entry, one of:
  - `GK.ui.gear({ corner: 'tr'|'tl'|'br'|'bl', panel: {...}, onOpen, onClose })`: a 44px button in a safe-area corner. Pick the corner that covers no HUD or control. `onOpen` pauses the game, `onClose` resumes it. The return value has `.show(bool)`.
  - `GK.ui.prefsButton({ panel: {...}, onOpen, onClose, className })`: a "Play your way" button you append inside the game's OWN settings or pause menu. Use this when the game has one (that is the merge).
- Panel options: `{ text: true, speed: <true for real-time/rhythm>, music: <true only if the game has separate music and effects gains you hook up>, sound: <false if the game keeps its own volume controls>, extras: [{label, get(), set(v)}] }`.
- Read settings: `GK.prefs.motion()` ('full'|'calm'|'still'; Auto follows the phone), `GK.prefs.motionScale()` (1, .35, 0), `GK.prefs.speed()` (1, .75, .5), `GK.prefs.text()` (1, 1.25, 1.5), `GK.prefs.vol('master'|'music'|'sfx')`, `GK.prefs.on(fn(key))` for live changes.
- `GK.flash.allow(a)`: call ONCE when a flash starts (not per frame); returns the strength to draw, 0 = skip. At most 3 per second, capped at .7, softer under Soft/Calm, off under Still.
- Text: `GK.ui.floor(px)` = max(12, px) × text size (CSS px). `GK.ui.text(ctx, str, x, y, {size, color, align, ...})` draws outlined canvas text with the floor. CSS: `font-size: calc(max(12px, 11px) * var(--gk-text-scale, 1))`.
- `GK.coach.create('<id>-first', [{ target: element | () => element | () => ({x, y, r}) in viewport CSS px, text: 'Tap to ...', done: () => bool }], { when: () => bool })`: a pulsing ring on the first step not yet done; retires for good once done.
- `GK.audio.ladder(n)`: pitch factor for streak step n (0-based), pentatonic, capped at two octaves. Multiply the combo note's frequency or playbackRate by it; no random jitter on that note.
- `GK.wired(name, note)`: declare each feature you turned on: 'motion', 'flash', 'speed', 'text', 'combo' (panel, gear, coach and theme declare themselves). The final report is built from these.

## Per-feature recipe
1. Studio colors: `GK.studio();` at boot.
2. Settings: gear or inline button as above. Panel always has motion, flash and text; add speed for real-time/rhythm. Sound: if the game has no volume control, keep the kit's Sound slider (it scales the master limiter bus). If the game has its own volume sliders, pass `sound: false`. If the game's boot line has `"limiter":false` (Fathomsong, Lanewake), the kit slider does not reach the speakers: either hook `GK.prefs.vol('master')` into the game's own master gain or pass `sound: false`.
3. Motion: scale screen shake, zoom punches, camera kicks and particle bursts by `GK.prefs.motionScale()`; under 'still' also stop purely decorative movement where that is a one-line change. If the game reads `prefers-reduced-motion` itself, replace that read with `GK.prefs.motion() !== 'full'` and follow `GK.prefs.on`. `GK.wired('motion')`.
4. Flash: route every full-screen or large flash through `GK.flash.allow` at the moment it starts. `GK.wired('flash')`. No flashes: skip and say so.
5. Speed assist (real-time and rhythm games only; skip turn-based and puzzle games): multiply the simulation dt by `GK.prefs.speed()`. If the game has a share/score line, add " · 75% speed" (or 50%) when assisted. Rhythm games: only if song tempo and note chart slow together and the timing offset stays exact; otherwise leave speed out and report why. `GK.wired('speed')`.
6. Text floor and text size: every HUD/menu text at least 12 CSS px at A, scaled by text size. Canvas: compute sizes with `GK.ui.floor(px)` in CSS px (multiply by the canvas's pixel ratio yourself if the game draws in device pixels). DOM: the calc() above. Do not scale big titles (24 px and up). If a text truly belongs to the art (a tiny label painted on a tile), you may leave it and list it in the report. `GK.wired('text')`.
7. Coach: one step on the main control the first time a player starts, done when they make their first move. `when` keeps it off menus. Short plain text, at most 6 words.
8. Combo: if the game has combos, streaks, chains or multipliers with a sound per step, run that note through `GK.audio.ladder`. `GK.wired('combo')`. No combos: skip and say so.

Merge rule: if a game already has its own motion/shake/flash/text/speed option, do not show two. Remove the game's duplicate control from its menu, make the game read the kit setting, and if `gk.prefs.v1` is missing at boot, seed the kit setting once from the game's old saved value (for example the game's own "reduced motion: on" becomes `GK.prefs.set('motion', 'calm')`). Keep the game's own option if the kit has no match (for example a timing offset or difficulty).

## Files and steps per game
Your game folders already hold: `<id>.pre-kit.html` (the game, no kit), `<id>.pre-v2.html` (kit 1.1.1 rollback), `<id>.kit-publish.html` (kit 2.0, what is live now). Seeds made earlier are in `/tmp/claude-0/-home-user/675d63ea-d574-55a8-9f25-fd0338219a39/scratchpad/h-g1..h-g8/` (find your game's).
1. `cp <id>.kit-publish.html <id>.pre-wire.html` (the rollback for this pass; skip if it exists).
2. Make `<id>.wired-src.html`: a copy of `<id>.pre-kit.html` with your code changes (the game without the kit block). If the folder has a src/ tree and a build whose output matches pre-kit, make the changes in src, build to your scratch dir, and copy that output; otherwise edit wired-src directly. Read enough of the game to find its loop, settings, HUD drawing, flashes, shake, sounds and first input.
3. `cp <id>.wired-src.html <id>.kit-publish.html` then `node /mnt/project-files/games/kit/rollout/retrofit.js <id>.kit-publish.html --id <id> --saves <same keys> [--opts <same opts>]` (read the keys and opts from `grep -o '<script id="gkboot">[^<]*' <id>.pre-wire.html`).
4. Smoke (all PASS): `sh /home/user/gk-deps/run.sh /mnt/project-files/games/kit/rollout/smoke.mjs <id>.pre-kit.html <id>.kit-publish.html <keys> [seed.json]`.
5. Wiring check (all PASS): `sh /home/user/gk-deps/run.sh /mnt/project-files/games/kit/rollout/wirecheck.mjs <id>.kit-publish.html [seed.json] [--speed] [--combo] [--flash] [--open "<selector of the game's settings button>"]`. Pass the flags for the features the game has. Keep the INFO wired line for your report. A FAIL on canvas text you left on purpose is allowed only if listed in your report with the reason.
6. Own tests: if the folder has local html copies with the kit (not pre-*, kit-publish, wired-src) and a test/ or tests/ folder, copy the local file to scratch, run the tests for a baseline, put the new kit-publish content in the local file, rerun. Counts must match. A test that checks old menu text you changed may be updated only if the change is the intended one; say so.
7. Publish: Artifact publish, `url` = the game's URL, `file_path` = kit-publish, label "GameKit 2.1 features". The first try is refused and saves the live source: Read every line of it, then `node /mnt/project-files/games/kit/rollout/livecmp.js <saved live> <id>.pre-wire.html` must say SAME (the live page is the kit 2.0 page). If not, the game changed live: do not publish, report it. Publish again from the same file; if refused as identical, send once more.
8. Artifact read the URL and `livecmp.js <new saved> <id>.kit-publish.html` must say SAME.

## Report (final message): one line per game
`<Game>: published 2.1 | NOT published; wired {..INFO line..}; settings via gear(corner)|inline(menu); smoke N/N; wirecheck N/N; own tests before/after or none; merged: <game options folded into the kit>; skipped: <feature: why>; live check ok`. Then anything that broke, could not be tested, or needs a phone (feel of motion levels, text fit at A++ on a small screen, coach ring position).

## Additions after batch 1 (these override the steps above where they differ)
- Publish check: you do not need to Read every line of the saved live page. The first refusal plus `livecmp.js <saved live> <id>.pre-wire.html` = SAME is the check. For the read-back, `Artifact read` with `path: "index.html"` and an `out_dir` in your scratch dir saves the page cheaply; then livecmp against kit-publish.
- Touch: if the game calls preventDefault on touch/pointer events at document or body level, exempt targets inside `.gk-gear, .gk-pyw, .gk-sheet, .gk-coach` (e.g. `if (e.target.closest && e.target.closest('.gk-gear,.gk-pyw,.gk-sheet')) return;`), or the kit buttons die on iPhone.
- Keyboard: game key handlers must return early while the panel is open (`if (document.querySelector('.gk-prefs')) return;`), so Esc/Enter/Space don't pause or start a run behind it.
- Own tests: if the game's test harness only evals the untagged game script (or a vm sandbox without the kit), you may change the HARNESS so it also runs the gamekit and gkboot scripts first (or exposes `window.GK`). Never change an assertion. Do it in the project's own test file so it keeps working, and say so. Run the baseline on the pre-wire page with the same harness.
- Combo: if the game already climbs in pitch on its own musical scale (in key with its music), keep it, declare `GK.wired('combo', 'own ladder kept')` and report it. Use `GK.audio.ladder` only where the game climbs without a scale, wraps, or jumps randomly. The two-octave cap is intended.
- Flash: the .7 cap is an intended change (Kevin asked for a flash limit). Note the old peak in your report (e.g. "nova was .85").
- Text: CSS `font:` shorthands take the same calc in the size slot (`font:700 calc(max(12px, 11px) * var(--gk-text-scale, 1))/1 var(--fu)`); inline `style="font-size:..."` too. Leave 24 px and up alone. A crowded HUD row may cap its own scale (`Math.min(GK.prefs.text(), 1.25)`), and say so. Canvas text drawn inside a camera zoom must be divided by that zoom when the zoom is under 1.
- Sound: a game with only on/off sound toggles (no volume slider) keeps its toggles AND keeps the kit Sound slider (it sets the level), unless `"limiter":false`. A game with its own sliders: `sound:false`, or `music:true` if you hook its music/sfx gains to `GK.prefs.vol`.
- Tips: pass `tips: false` in the panel options unless the game uses `GK.hints`.
- Pause: `onOpen`/`onClose` pause only for real-time games. Turn-based, puzzle and idle games need no pause.
- Speed: idle/clicker economies skip speed assist ("only slows income"). If the game has its own fast-forward, keep it and multiply by the kit speed.
- Hints the game already shows on first play (a toast, a ring, a line of text): keep its words; hold its own ring/toast while the kit coach ring shows, or give the coach step no `text` so the game's words stay the only words.
- wirecheck now draws offscreen canvases and treats Fly/Launch/Deal/Swim/Race as start buttons, so canvas checks are real in more games. If the bot still can't start the game, say "canvas check vacuous" in your report; a vacuous pass is not proof.
- If you change a src/ build so its output needs GK, write that in the report (the bare build no longer runs alone).
