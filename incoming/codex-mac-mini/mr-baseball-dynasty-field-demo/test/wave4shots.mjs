// wave4 verification shots: fielder sprite redraw 14x20 → 16x24.
// Poses: idle defense, run cycle (chaser moving), throw, catch, dive, prone
// (dive/prone via render-only state pokes), runner slide + crowded painter
// sort, plate-view tiny distance figures (should be UNCHANGED 8x12 set).
// Human = team 1 = HOME: pitches TOP, fields TOP. Freezes via Shell.paused;
// pause-overlay fillRect patched out; FADE.t zeroed after freeze so the
// INIDISP step fade doesn't darken the capture. Timeouts on all waits.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/tmp/node_modules/playwright/index.js');
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'vshots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
await page.goto('file://' + path.join(here, '..', 'index.html'));
await page.waitForTimeout(600);
const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 80); await page.keyboard.up(code); }

await page.evaluate(() => {
  const proto = CanvasRenderingContext2D.prototype;
  const orig = proto.fillRect;
  proto.fillRect = function (...a) { if (/^rgba\(0,\s*0,\s*0,\s*0\.55\)$/.test(this.fillStyle)) return; return orig.apply(this, a); };
  const oc = centerText;   // drop the frozen-frame PAUSE labels so they don't cover actors
  centerText = function (ctx, text, ...rest) { if (text === 'PAUSE' || text === 'ESC TO RESUME') return; return oc.call(this, ctx, text, ...rest); };
});
const state = () => page.evaluate(() => { const st = Shell.state; return st.scene + ' half=' + st.half + ' phase=' + st.phase + ' phaseT=' + st.phaseT + ' ballT=' + st.ball.t + ' cam=' + st.camera.mode + ' chaser=' + st.chaser + ' heldBy=' + st.ball.heldBy; });
let freezeSeq = 0;
async function tryFreeze(cond, ms) {
  const id = ++freezeSeq;
  const r = await Promise.race([
    page.evaluate(`new Promise(res => { window.__fz = window.__fz || {}; window.__fz[${id}] = setInterval(() => {
      const st = Shell.state; if (!st) return;
      if (${cond}) { Shell.paused = true; clearInterval(window.__fz[${id}]); delete window.__fz[${id}]; res(true); } }, 3); })`).then(() => 'frozen'),
    page.waitForTimeout(ms).then(() => 'timeout'),
  ]);
  if (r === 'timeout') {   // cancel the losing interval so it can't zombie-pause a later play
    await page.evaluate(`{ const iv = (window.__fz || {})[${id}]; if (iv) { clearInterval(iv); delete window.__fz[${id}]; } }`);
    console.log('  tryFreeze TIMEOUT —', await state());
  }
  return r === 'frozen';
}
const unfreeze = () => page.evaluate(() => {
  for (const k in (window.__fz || {})) clearInterval(window.__fz[k]);
  window.__fz = {};
  Shell.paused = false;
});
async function frozenShot(name) {           // kill the fade, let one clean frame render, shoot
  await page.evaluate(() => { FADE.t = 0; });
  await page.waitForTimeout(80);
  await shot(name);
  console.log('  shot', name, '—', await state());
}

// start 1P game — human is HOME (team 1): pitches TOP, bats BOTTOM
await press('Enter'); await page.waitForTimeout(350);
await press('Enter'); await page.waitForTimeout(900);
console.log('start:', await state());

// plate view: tiny staged distance fielders must be the unchanged 8x12 set
await page.evaluate(() => { FADE.t = 0; });
await page.waitForTimeout(120);
await shot('w4_00_plate_tiny');
console.log('  shot w4_00_plate_tiny —', await state());

/* force a batted ball (wave3 technique) so the field cam comes up */
for (let i = 0; i < 30; i++) {
  const ph = await page.evaluate(() => Shell.state.phase);
  if (ph === 'PITCH') break;
  if (ph === 'PREPITCH') await press('KeyZ', 90);
  await page.waitForTimeout(300);
}
await page.evaluate(() => {
  const st = Shell.state;
  const elevRad = ((610 - 512) / 2048) * Math.PI * 2;
  const speedU = 150 / 16;
  const planar = speedU * Math.cos(elevRad);
  const rad = (100 / 2048) * Math.PI * 2;
  const launch = {
    vxS: Math.round(Math.sin(rad) * planar * 256),
    vyS: -Math.round(Math.cos(rad) * planar * 256),
    vzS: Math.round(Math.sin(elevRad) * speedU * 256),
  };
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
});

// 1: idle defense alignment + chaser chevron over the taller sprite
if (await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE' && st.chaser >= 0 && st.ball.heldBy < 0 && FADE.t <= 0`, 8000)) {
  await frozenShot('w4_01_field_idle_chevron');
  await unfreeze();
}
// 2: run cycle — chaser moving (speedS > 60), mid-flight
if (await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE' && st.chaser >= 0 && st.fielders[st.chaser].speedS > 60 && FADE.t <= 0`, 6000)) {
  await frozenShot('w4_02_field_run');
  await unfreeze();
}

/* grounder → infielder fields (catch pose) → throw to 1B (throw pose) →
   poke dive/prone/slide on a frozen LIVE frame during the throw flight.
   Retried across fresh grounders if a window is missed. */
async function forceGrounder() {
  await unfreeze();   // clear any zombie intervals / stale pause before staging
  for (let i = 0; i < 30; i++) {
    const ph = await page.evaluate(() => Shell.state.phase);
    if (ph === 'PITCH') break;
    if (ph === 'PREPITCH') await press('KeyZ', 90);
    await page.waitForTimeout(300);
  }
  await page.evaluate(() => {
    const st = Shell.state;
    const elevRad = ((430 - 512) / 2048) * Math.PI * 2;   // below horizon → grounder
    const speedU = 135 / 16;
    const planar = speedU * Math.cos(elevRad);
    const rad = (100 / 2048) * Math.PI * 2;
    const launch = {
      vxS: Math.round(Math.sin(rad) * planar * 256),
      vyS: -Math.round(Math.cos(rad) * planar * 256),
      vzS: Math.round(Math.sin(elevRad) * speedU * 256),
    };
    MBD.applyContact(st.ball, launch);
    st.phase = 'BLANK'; st.phaseT = 0;
  });
}
let gotCatch = false, gotThrow = false, gotPokes = false;
for (let attempt = 0; attempt < 3 && !(gotCatch && gotThrow && gotPokes); attempt++) {
  await forceGrounder();
  // 3: catch pose — ball just secured
  if (!gotCatch && await tryFreeze(`st.camera.mode === 'field' && st.ball.heldBy >= 0 && st.heldTimer < 14`, 6000)) {
    await frozenShot('w4_03_field_catch');
    gotCatch = true;
    await unfreeze();
  }
  // 4: throw pose — staged via render-only poke (CPU fielder often holds the ball)
  if (!gotThrow && await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE'`, 4000)) {
    await page.evaluate(() => {
      const st = Shell.state;
      const idx = st.chaser >= 0 ? st.chaser : 4;
      st._w4 = { m: st.ball.mode, tb: st.ball.thrownBy, t: st.ball.t };
      st.ball.mode = 'throw'; st.ball.thrownBy = idx; st.ball.t = 0;
    });
    await frozenShot('w4_04_field_throw');
    await page.evaluate(() => { const st = Shell.state; st.ball.mode = st._w4.m; st.ball.thrownBy = st._w4.tb; st.ball.t = st._w4.t; delete st._w4; });
    gotThrow = true;
    await unfreeze();
  }
  /* 5/6/7: dive + prone + slide pokes on a frozen LIVE field frame */
  if (!gotPokes && await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE'`, 4000)) {
    await page.evaluate(() => { const st = Shell.state; const f = st.fielders[st.chaser >= 0 ? st.chaser : 4]; f.diveT = 12; });
    await frozenShot('w4_05_dive');
    await page.evaluate(() => { const st = Shell.state; const f = st.fielders[st.chaser >= 0 ? st.chaser : 4]; f.diveT = 0; f.proneT = 12; });
    await frozenShot('w4_06_prone');
    await page.evaluate(() => { const st = Shell.state; const f = st.fielders[st.chaser >= 0 ? st.chaser : 4]; f.proneT = 0; });
    const slid = await page.evaluate(() => {
      const st = Shell.state;
      const r = st.runners.find(x => x.state !== 'out' && x.state !== 'scored');
      if (!r) return 'no-runner';
      const bc = GEO.bases[2];
      r.state = 'run'; r.toBase = 2; r.fromBase = 1;
      r.xS = (bc.x + 38) << 8; r.yS = (bc.y + 25) << 8;
      return 'staged';
    });
    console.log('  slide stage:', slid);
    await frozenShot('w4_07_slide_crowd');
    gotPokes = true;
    await unfreeze();
  }
  if (!(gotCatch && gotThrow && gotPokes)) {   // let the play die, then retry
    console.log('  retry: catch=' + gotCatch, 'throw=' + gotThrow, 'pokes=' + gotPokes, '—', await state());
    await page.waitForTimeout(2500);
  }
}

await browser.close();
console.log('WAVE4 SHOTS DONE');
