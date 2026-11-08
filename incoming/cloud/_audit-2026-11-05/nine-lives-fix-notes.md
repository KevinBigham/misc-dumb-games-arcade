# Nine Lives Overdrive: two fixes to hand over

Read from the live version 1793768462-2b34 (https://claude.ai/artifact/YH8QamaprSBMbhUCQnX3Ux) on Nov 5, 2026. Line numbers are HTML lines in that version. Nothing was published to it.

## 1. Music keeps running in the background

Cause: line 2415 only pauses the game when the tab hides. The AudioContext keeps running, so the 25 ms music timer (MU.play, `setInterval(() => this.tick(), 25)`) keeps scheduling notes. MU.tick already skips work when `c.state !== 'running'`, so suspending the context is enough to silence it.

Fix: replace line 2415 with:

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (APP === 'play') pauseGame();
    if (AU.ctx && AU.ctx.state === 'running') AU.ctx.suspend().catch(() => { });
    if (MU.timer) { clearInterval(MU.timer); MU.timer = null; }
  } else {
    if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => { });
    if (MU.name && !MU.timer) MU.timer = setInterval(() => MU.tick(), 25);
  }
});
window.addEventListener('pagehide', () => {
  if (AU.ctx && AU.ctx.state === 'running') AU.ctx.suspend().catch(() => { });
  if (MU.timer) { clearInterval(MU.timer); MU.timer = null; }
});
window.addEventListener('pageshow', () => {
  if (document.hidden) return;
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => { });
  if (MU.name && !MU.timer) MU.timer = setInterval(() => MU.tick(), 25);
});
```

MU.tick already re-anchors `this.next` when it falls behind (`if (this.next < c.currentTime - 0.25)`), so music picks up cleanly on return. If the browser refuses resume() without a gesture, AU.init() (already called on taps) resumes it on the next tap.

Test: hide the tab mid-run, confirm ctx.suspend() ran and no new oscillators are created; show it again, confirm one interval and music resumes.

## 2. A bad difficulty value crashes the select screen

Cause: loadSave (line 318) copies `diff` from the save without checking it. A save with `"diff":"abc"` (or 5, or "2") makes `DIFFS[save.diff]` undefined, and line 2201 `DIFFS[save.diff].desc` throws. newRun (line 2244, used at line 768 `diff: DIFFS[diff]`) would also get undefined.

Fix, two lines:

In loadSave, right after `save.unlocked = Object.assign(...)`:
```js
      { const d = +save.diff; save.diff = Number.isInteger(d) && DIFFS[d] ? d : 1; }
```
(DIFFS is defined before loadSave() is first called at line 2516, so this is safe.)

Belt and braces at line 2201:
```js
  $('diffNote').textContent = (DIFFS[save.diff] || DIFFS[1]).desc;
```

Optional same pass: the rest of loadSave also echoes wrong types back (fish, best, wins, runs, kills as strings; settings values). A per-field check that resets any non-finite number to its default, `meta` and `unlocked` to plain objects, and settings to numbers in 0..1 (aim must be 'mouse' or 'auto') would match what was done for the other games.

Test: load with `{"diff":"abc"}`, `{"diff":7}`, `{"diff":"2"}`; the select screen opens, shows ALLEY CAT (or FERAL for "2"), and a run starts.
