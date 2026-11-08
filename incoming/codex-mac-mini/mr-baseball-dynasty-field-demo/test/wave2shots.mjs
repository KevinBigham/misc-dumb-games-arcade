// wave2 verification shots: aim cursor + call pop (human pitches, top half),
// stride + call pop (human bats, bottom half). Human = team 1 = HOME.
// Freezes via Shell.paused for frame-exact captures; pause overlay fillRect
// patched out so shots stay clean. Every freeze has a timeout.
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
  proto.fillRect = function (...a) { if (this.fillStyle === 'rgba(0,0,0,0.55)') return; return orig.apply(this, a); };
});
const state = () => page.evaluate(() => { const st = Shell.state; return st.scene + ' half=' + st.half + ' phase=' + st.phase + ' phaseT=' + st.phaseT + (st.banner ? ' banner=' + st.banner.text : ''); });
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
console.log('start:', await state(), '· humanTeam:', await page.evaluate(() => Shell.state.humanTeam));

/* 1. AIM CURSOR — human pitching: B to start the windup, hold LEFT, freeze late */
{
  let ok = false;
  for (let i = 0; i < 8 && !ok; i++) {
    const ph = await page.evaluate(() => Shell.state.phase);
    if (ph === 'PREPITCH') await press('KeyZ', 90);
    ok = await tryFreeze(`st.phase === 'WINDUP' && st.phaseT > 5`, 3000);
    await unfreeze();
  }
  if (ok) {
    await page.keyboard.down('ArrowLeft');
    const ok2 = await tryFreeze(`st.phase === 'WINDUP' && st.phaseT > 60`, 6000);
    const aim = await page.evaluate(() => Shell.state.pitchInfo && (Shell.state.pitchInfo.targetX - MBD.CONST.PLATE_X));
    console.log('aim windup frozen:', ok2, '· targetX offset (expect ~-40):', aim);
    await shot('w2_01_aim_left');
    await unfreeze();
    // keep LEFT held through the release so the aimed pitch shows in the call
  }
}

/* 2. CALL POP (pitch result) — freeze on the umpire call banner */
{
  const ok = await tryFreeze(`st.banner && (st.banner.text === 'STRIKE!' || st.banner.text === 'BALL')`, 20000);
  console.log('pitch call frozen:', ok, await page.evaluate(() => Shell.state.banner && Shell.state.banner.text));
  await shot('w2_02_pitch_call');
  await unfreeze();
  await page.keyboard.up('ArrowLeft');
}

/* 3. STRIDE — flip to bottom half (human bats), swing at a pitch, freeze windup */
await page.evaluate(() => { const st = Shell.state; st.half = 1; MBD.startHalf(st); });
await page.waitForTimeout(300);
console.log('flipped:', await state());
{
  if (await tryFreeze(`st.phase === 'PITCH'`, 30000)) {
    await unfreeze();
    await page.keyboard.down('KeyZ');
    const ok = await tryFreeze(`st.swing && st.swing.state === 'windup'`, 4000);
    await page.keyboard.up('KeyZ');
    console.log('stride frozen:', ok);
    await shot('w2_03_stride');
    await unfreeze();
  }
}

/* 4. CALL POP (batting side) — take pitches until a call banner shows */
{
  let ok = false;
  for (let i = 0; i < 4 && !ok; i++) ok = await tryFreeze(`st.banner && (st.banner.text === 'STRIKE!' || st.banner.text === 'BALL' || st.banner.text === 'FOUL BALL')`, 12000);
  console.log('bat-side call frozen:', ok, await page.evaluate(() => Shell.state.banner && Shell.state.banner.text));
  await shot('w2_04_bat_call');
  await unfreeze();
}

await browser.close();
console.log('WAVE2 SHOTS DONE');
