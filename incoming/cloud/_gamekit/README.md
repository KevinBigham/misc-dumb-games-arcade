# GameKit 2.0

One plain JavaScript file (`gamekit.js`, about 49 KB) for single-file phone games. No build step, no network, no CDN. Paste it inline in a `<script id="gamekit">` before the game's own script and use the global `GK`. The same file also loads in node (`require('./gamekit.js')`), so game rules and bots can share it.

Everything here is **bot-tested only** until someone plays it on a real phone. The parts most likely to behave differently on a real iPhone are marked "phone check".

## Files

| File | What it is |
|---|---|
| `gamekit.js` | The kit. |
| `gk-bots.js` | Node-only balance harness (seed sweeps, round-robin, never-picked choices). |
| `demo/demo.html` | Pip Hop, a one-button demo that uses every module. Built from `demo/demo.src.html` + `demo/pip-sim.js`. |
| `pilots/lantern-drum.*` | Lantern Drum with the kit (`.src.html`, built `.html`, and the `.pre-kit.html` rollback copy). |
| `rollout/` | Tools that put the kit into a finished game: `retrofit.js`, `smoke.mjs` (before/after bot test), `livebody.js`, `livecmp.js`, and `BRIEF.md` (the step list). |
| `build.js` | `node build.js` inlines the kit into the demo and Lantern Drum and parse-checks the result. |
| `test/` | `stubdom.js` (fake browser) and the tests: `test-kit.js` (102), `test-kit2.js` (56, the 2.0 parts), `test-bots.js` (10), `test-demo.js` (19), `test-lantern.js` (23, run with `TZ=America/Chicago`). |

Gloamrush's kit build lives with its own source: `gloamrush-2026-11-05/src/build-kit.sh` (run with `sh build-kit.sh`), rollback copy `gloamrush.pre-kit.html` and `src.pre-kit/`.

## What's new in 2.0
Rollback copy of the old kit: `gamekit-1.1.1.js` (and `rollout/smoke-1.1.1.mjs`). Everything below is bot-tested only.

**Automatic for every retrofit game** (no game code changes; turn one off with `GK.retrofit({ ..., dpr: false | hideAudio: false | limiter: false | fps: false })`):
- Sharpness cap: `window.devicePixelRatio` reads at most 2 (`GK.perf.capDPR(2)`), so a 3x iPhone draws about 55% fewer pixels. `GK.perf.realDPR` keeps the true value.
- Hidden page: sound fades out and the context is suspended 0.2 s after the page hides, and fades back on return. A pause the game made itself still wins.
- Master bus: everything the game sends to the speakers goes through one gain and a limiter (DynamicsCompressor, threshold -4 dB, ratio 12, attack 3 ms). Stops clipping when many sounds stack. Adds a few milliseconds of latency; rhythm games absorb it in their own offset setting. Phone check.
- `?fps=30` (or `#fps=30`, or localStorage `gk.fps`) holds the game at 30 fps, like an iPhone in Low Power Mode. Only 10 to 59 is accepted.

**For games that opt in** (pilots first):
- `GK.prefs`: one shared settings store (`gk.prefs.v1`): motion `auto | full | calm | still` (auto follows the phone's Reduce Motion, live), flash `normal | soft`, speed `1 | 0.75 | 0.5`, text `1 | 1.25 | 1.5`, volumes `master | music | sfx`, tips, and `x` for game extras. Bad values are refused. Lands on `<html>` as `data-gk-motion`, `data-gk-flash`, `data-gk-text`, `data-gk-assist` and `--gk-text-scale`. `on(fn)`, `exportCode/importCode`, `reset()`, `assisted()`.
- `GK.prefs.panel({ speed, text, music, extras, save, onClose })`: the "Play your way" sheet (Move, Read, Hear, More). Only the rows the game asks for show.
- `GK.flash.allow(strength)`: returns the strength to draw, at most 3 flashes in any second, capped at 0.7, halved for Soft, trimmed for Calm, off for Still.
- `GK.juice.create({})` without `reducedMotion` now follows `GK.prefs` live (`J.mscale()`, `J.flashOK()`). Games that pass `reducedMotion` keep the 1.x behavior.
- `GK.loop(update, render, { assist: true })` runs game time at the chosen speed.
- Sound: separate `music` and `sfx` buses (`play(name, { bus: 'music' })`), `duck(to, hold)` dips music under a big moment, a 'hit' that's audible on phone speakers, `combo(n)` climbs a pentatonic scale (capped two octaves up) and `comboBreak()`.
- First minute: `GK.coach.create(id, [{ target, text, done }])` draws a pulsing ring on the next thing to tap and retires for good once each step is done (`gk.coach.<id>`); `GK.hints.once(id, text)` shows a tip once, at most one every 20 s.
- Look: `GK.theme.set({ signal, panel, text, ... })` sets `--gk-*` colors the kit's own sheets use (`studio` gold preset included); `GK.ui.text(ctx, str, x, y, { size })` draws HUD text with an outline and never below 12px; `GK.popups.create()` pools and merges number popups; `GK.roll(start)` is a rolling score.
- `GK.ui.lockout(el, 400)` ignores taps on an end screen button for the first 0.4 s, so a mistap doesn't skip it.

## Modules

### `GK.audio`: sound that survives iPhone
- `GK.audio.init({ create, onUnlock, onState })` arms unlock listeners on every gesture (pointerdown, pointerup, touchend, click, keydown). It sets `navigator.audioSession.type = 'playback'` so sound plays with the ringer switch on silent, plays a tiny silent clip once, resumes the context and keeps retrying until the context is really running. When iOS interrupts audio (a call, Siri, another app) it re-arms and resumes on the next tap, on focus and on return to the page.
- `create: false` when the game builds its own AudioContext. Then hand it over with `GK.audio.adopt(ctx, outputNode)` and call `GK.audio.unlockNow()` inside the tap. One context per page, never two.
- `GK.audio.ensure()` returns the kit's context (creating it), for games that let the kit own audio.
- `GK.audio.define(name, spec)` / `GK.audio.std()` build small synth sounds (tap, success, fail, combo, win, hit). `GK.audio.play(name, { vol, rate, jitter = 0.05, gap = 25, voices = 4 })` varies pitch a little each time and caps overlapping copies.
- Shows "No sound? Check the ringer switch" once on iPhone (remembered).
- Phone check: ringer switch on silent, a phone call mid-game, locking the screen and coming back.

### `GK.input`: touch that feels fair
- `GK.input.attach(el, { onDown, onMove, onUp, stick })` uses pointer events with capture, blocks long-press menus, text selection, pinch and double-tap zoom on the play area. `drain()` returns taps since the last frame. `stick: { dead, radius, follow }` gives a floating thumbstick.
- `GK.input.buffer(0.1)`: a tap up to 0.1 s too early still counts (`press(t)`, `consume(t)`).
- `GK.input.coyote(0.1)`: a jump up to 0.1 s after leaving a ledge still works (`ground(t)`, `can(t)`, `use()`).
- `GK.input.keys()` for desktop testing.

### `GK.juice`: feel, with every effect switchable
- `const J = GK.juice.create({ maxShake: 10, maxRot: 0.03, decay: 0.8, freq: 15 })`.
- `J.addTrauma(0..1)` shakes by trauma squared with smooth noise; `J.update(dt)` gives `J.x`, `J.y`, `J.rot`; `J.apply(ctx)` applies them to a canvas.
- `J.hitstop(seconds)` freezes time; `J.scale(dt)` returns the time scale for the game step.
- `J.squash('jump' | 'land' | 'hit')` and `J.squashStep(dt)` for stretch on sprites.
- `J.haptic('tap' | 'success' | 'fail')`: vibration on Android; on iPhone a hidden switch control gives a light tick, but only inside a real tap. Phone check.
- `J.on.shake / hitstop / squash / haptics / particles / flash / numbers` turn each effect off. Reduced motion lowers shake and turns flashes off.
- `GK.juice.panel(J, extras, { keys })` is a hidden tuning panel: open with `?juice` or `#juice` in the address, or five quick taps in the top-left corner. It has toggles and a frame-rate meter.
- `GK.ease` (quadOut, cubicOut, backOut, `smooth(cur, target, k, dt)`).

### `GK.rng`: seeds that replay
- `GK.rng.make(seed)` gives `next, float(a,b), int(a,b), chance(p), pick, sign, shuffle, weighted, sub(label), state/load`.
- `GK.rng.seedFor(base, label, n)` makes sub-seeds, so adding a new random call in one system doesn't change another. `GK.rng.streams(seed)` gives `{ game, fx }`: use `fx` for cosmetics so particles never change the level.
- `GK.rng.code()` makes a shareable seed like `KTR-BLM-SWP`; `normalize()` reads one back. `GK.rng.mulberry32` matches the generator the shipped games already use.

### `GK.daily`: one puzzle a day, on the player's own clock
- `GK.daily.key()` is the player's local date as `YYYY-MM-DD` (it resets at their midnight, not 6 PM Central). `{ tz }` pins a zone if a game ever wants one shared reset.
- `GK.daily.seed(gameId)`, `msToNext()`, `countdown()` ("3h 05m"), `mark(state)` counts days played (never resets, no streak guilt), `label(key)` ("Nov 6"), `shareLine({ game, score, grid, tail })`.

### `GK.badges`: achievements
- `const BD = GK.badges.create(defs, save.badges, { toast })` where `defs = [{ id, name, desc, test?, hidden?, funny? }]`. Earned badges are stored as `save.badges[id] = time`.
- `BD.earn(id)`, `BD.fail(id)` (for "lost it this run"), `BD.startRun()`, `BD.check(stats)` returns newly earned defs, `BD.list()`, `BD.render(el)`, `BD.count()`, `BD.onEarn(fn)`.
- `GK.badges.milestones([10, 50], [3, 10])` makes "play N" and "win N" badges so less skilled players still progress.

### `GK.save`: saves that don't get lost
- `GK.save.protect(key, { validate, keep: 3 })` keeps three rolling backups (`key.bak1..3`) in the game's own format, rotated once per visit. A missing or broken save comes back from the newest good backup. `exportCode()` / `importCode(code)` move a save between phones (`GK1.` codes with a checksum).
- `GK.save.store(key, { version, defaults, migrate })` is a full versioned store (`{ v, t, d }`) with defaults, type repair and migrations, for new games.
- `GK.save.onHide(fn)` saves when the page is hidden or closed (the only moment iPhone reliably allows).
- Note: Safari can clear a page's storage after 7 days without a visit. Export is the player's safety net, so offer it in Settings.

### `GK.share`: a share button that always does something
- `GK.share.text(text, { title })` tries the share sheet, then clipboard, then old-style copy, then a sheet with selectable text. Resolves to `shared`, `copied`, `sheet` or `cancel`. `GK.share.button(el, getText)` wires a button.
- Phone check: the share sheet inside the claude.ai frame may be blocked, so the copy fallback will be what most players see.

### `GK.view`, `GK.ui`, `GK.loop`
- `GK.view.init()` adds `viewport-fit=cover` and reads the safe-area insets (`GK.view.insets`). `onResize`, `dpr()` capped at 2, `fit(designW, designH, w, h, 'fit' | 'fill' | 'fitfill')`, `canvas()`.
- `GK.ui.toast`, `GK.ui.sheet`, `GK.ui.saveTools(protectHandle, { onImported })` give ready Export and Import sheets.
- `GK.loop` is a fixed-step game loop that respects hitstop and pauses while hidden.

### `gk-bots.js`: balance in node
- `sweep({ knob, values, seeds: 1000, run, csv })` runs every value across many seeds and writes a CSV, a summary (means and p10/p50/p90) and 1% outliers at each end.
- `roundRobin({ strategies, games: 200, play, dominant: 0.6 })` flags a strategy that beats the field over 60%.
- `usage(counts, ids)` lists choices no bot ever picked.
- Example on the demo: course gap 0.8 / 1 / 1.25 gives the smart bot 0.8% / 66% / 100% survival, so the demo ships at 1.15 (96.6%).

### `GK.retrofit`: saves and sound for a finished game, with no code changes (1.1)
- Put the kit, then `<script id="gkboot">GK.retrofit({ game: 'id', saves: ['key1', 'key2'] })</script>`, before the game's first script. `node rollout/retrofit.js game.html --id id --saves key1,key2` does it (idempotent, parse-checks; `--dry` lists the storage and audio lines to find the keys).
- Saves: each key gets `GK.save.protect` (three rolling backups, restore when missing or broken). Never list a key the game uses as its own quarantine copy (`.bad`, `.corrupt`).
- Sound: it wraps `AudioContext`, adopts the first context the game makes and arms the iPhone unlock. The game keeps its own context, so there is still one per page.
- 1.1.1: a game's own `ctx.suspend()` (pause, mute, hidden tab) is a hold. Taps and focus never resume it; only the game's own `resume()` does. smoke.mjs checks this.
- A game with a build step (src to dist) needs `retrofit.js` run again on the built file after each rebuild.
- Test: `sh /home/user/gk-deps/run.sh rollout/smoke.mjs pre-kit.html kit.html key1,key2 [seed.json]` (needs jsdom and @napi-rs/canvas; the run.sh helper lives in the container only).
- Each game keeps `<id>.pre-kit.html` (the live page before the kit) for rollback.

## Retrofit checklist (per game)
1. Copy the live file to `<game>.pre-kit.html` for rollback.
2. Paste `gamekit.js` in a `<script id="gamekit">` before the game's script.
3. Saves: `GK.save.protect(KEY, { validate })` before the first load; add any new fields with safe defaults; `GK.save.onHide(save)`. Keep the same key and format.
4. Audio: `GK.audio.init()`; if the game owns its context, `create: false` then `adopt` + `unlockNow` in the tap. Add pitch jitter on sound effects only, never on melodic notes.
5. Daily: replace any UTC date code with `GK.daily.key()`; keep the game's existing seed string so today's puzzle doesn't change.
6. Juice: route shake through `addTrauma`, gate hitstop, particles and flashes with `J.on`, add `GK.juice.panel`.
7. Badges (6 to 10, two funny), Export/Import in Settings, Share on the result screen, a daily countdown on the title.
8. Build, parse-check, run the game's own tests plus an old-save load test, then republish to the same link.
