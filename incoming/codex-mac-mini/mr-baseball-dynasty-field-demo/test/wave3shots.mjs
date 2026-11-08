// wave3 verification shots: pitcher redraw poses (rock/kick/stride/release/
// follow-through) in the plate view + field view dirt lanes and chaser chevron.
// Human = team 1 = HOME: pitches TOP half (plate view), fields TOP (field view).
// Freezes via Shell.paused; pause-overlay fillRect patched out. Timeouts on all waits.
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
});
const state = () => page.evaluate(() => { const st = Shell.state; return st.scene + ' half=' + st.half + ' phase=' + st.phase + ' phaseT=' + st.phaseT + ' ballT=' + st.ball.t + ' cam=' + st.camera.mode + ' chaser=' + st.chaser; });
async function tryFreeze(cond, ms) {
  const r = await Promise.race([
    page.evaluate(`new Promise(res => { const iv = setInterval(() => {
      const st = Shell.state; if (!st) return;
      if (${cond}) { Shell.paused = true; clearInterval(iv); res(true); } }, 3); })`).then(() => 'frozen'),
    page.waitForTimeout(ms).then(() => 'timeout'),
  ]);
  if (r === 'timeout') console.log('  tryFreeze TIMEOUT —', await state());
  return r === 'frozen';
}
const unfreeze = () => page.evaluate(() => { Shell.paused = false; });

// start 1P game — human is HOME (team 1): pitches TOP, bats BOTTOM
await press('Enter'); await page.waitForTimeout(350);
await press('Enter'); await page.waitForTimeout(900);
console.log('start:', await state());

// idle pitcher at PREPITCH
await shot('w3_00_prepitch_idle');

/* delivery arc — human pitches with Z. Freeze at each pose window. */
{
  let ok = false;
  for (let i = 0; i < 10 && !ok; i++) {
    const ph = await page.evaluate(() => Shell.state.phase);
    if (ph === 'PREPITCH') await press('KeyZ', 90);
    ok = await tryFreeze(`st.phase === 'WINDUP' && st.phaseT >= 6 && st.phaseT < 14`, 3000);
    if (ok) { console.log('rock frozen:', await state()); await shot('w3_01_rock'); await unfreeze(); }
  }
  if (await tryFreeze(`st.phase === 'WINDUP' && st.phaseT >= 28 && st.phaseT < 48`, 4000)) {
    console.log('kick frozen:', await state()); await shot('w3_02_kick'); await unfreeze();
  }
  if (await tryFreeze(`st.phase === 'WINDUP' && st.phaseT >= 58 && st.phaseT < 70`, 4000)) {
    console.log('stride frozen:', await state()); await shot('w3_03_stride'); await unfreeze();
  }
  if (await tryFreeze(`st.phase === 'WINDUP' && st.phaseT >= 78`, 4000)) {
    console.log('release frozen:', await state()); await shot('w3_04_release'); await unfreeze();
  }
  if (await tryFreeze(`st.phase === 'PITCH' && st.ball.t >= 8 && st.ball.t < 19`, 4000)) {
    console.log('follow frozen:', await state()); await shot('w3_05_follow'); await unfreeze();
  }
}

/* field view: force a batted ball (vshots technique), catch the field cam + chevron */
{
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
  if (await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE' && st.chaser >= 0 && st.ball.heldBy < 0`, 8000)) {
    console.log('field frozen:', await state()); await shot('w3_06_field_lanes_chevron');
    await unfreeze();
  }
  await page.waitForTimeout(700);
  if (await tryFreeze(`st.camera.mode === 'field' && st.phase === 'LIVE' && st.chaser >= 0 && st.ball.heldBy < 0`, 6000)) {
    console.log('field late frozen:', await state()); await shot('w3_07_field_late');
    await unfreeze();
  } else {
    await shot('w3_07_field_late');
    console.log('field late (unfrozen):', await state());
  }
}

await browser.close();
console.log('WAVE3 SHOTS DONE');
