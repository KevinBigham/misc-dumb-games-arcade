// Visual playtest: drive the real browser build with scripted keys, screenshot
// every scene/phase for review.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/home/claude/.npm-global/lib/node_modules/playwright/index.js');
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'shots');
import fs from 'fs';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('file://' + path.join(here, '..', 'index.html'));
await page.waitForTimeout(700);

const shot = (name) => page.screenshot({ path: path.join(outDir, name + '.png') });
const S = async (st) => await page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, frame: Shell.state.frame, cam: Shell.state.camera.mode, ball: Shell.state.ball.mode }));

await shot('01_title');
await page.keyboard.press('Enter');            // → matchup
await page.waitForTimeout(400);
await shot('02_matchup');
await page.keyboard.press('Enter');            // → game (human fields first)
await page.waitForTimeout(600);
await shot('03_prepitch_plate');
console.log('state:', await S());

// human pitches: hold Down (fastball) + Z
await page.keyboard.down('ArrowDown');
await page.keyboard.press('KeyZ');
await page.keyboard.up('ArrowDown');
await page.waitForTimeout(500);                 // mid-windup
await shot('04_windup');
await page.waitForTimeout(500);                 // pitch flight / resolution
await shot('05_pitch_or_result');
console.log('state:', await S());
await page.waitForTimeout(1400);

// pitch again, steer hard left
await page.keyboard.press('KeyZ');
await page.waitForTimeout(1030);                // windup 62f ≈ 1.03s
await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(320);
await page.keyboard.up('ArrowLeft');
await shot('06_steered_pitch_result');
console.log('state:', await S());

// let CPU-vs-CPU attract run for contact/field views: reset to title, wait for demo
await page.evaluate(() => { Shell.state = MBD.newGame({ scene: 'GAME', demo: true, seed: [4, 4, 4, 4, 4] }); Shell.state.scene = 'GAME'; MBD.startHalf(Shell.state); });
// wait for a crack event, then capture field view
let got = null;
for (let i = 0; i < 240; i++) {
  await page.waitForTimeout(100);
  got = await page.evaluate(() => {
    const st = Shell.state;
    if (st.phase === 'LIVE') return { phase: st.phase, cam: st.camera.mode, ball: st.ball.mode };
    return null;
  });
  if (got) break;
}
console.log('live state:', got);
await shot('07_field_live');
await page.waitForTimeout(900);
await shot('08_field_live2');

// drive until between-innings card
let card = false;
for (let i = 0; i < 600; i++) {
  await page.waitForTimeout(150);
  const sc = await page.evaluate(() => Shell.state.scene);
  if (sc === 'CARD') { card = true; break; }
  if (sc === 'FINAL') break;
}
await shot(card ? '09_card' : '09_no_card');
console.log('card reached:', card);

// force final screen for capture
await page.evaluate(() => {
  const st = Shell.state;
  st.score = [3, 5]; st.hits = [7, 9]; st.errs = [1, 0];
  st.lineScore = [[1, 0, 2], [2, 3, 0]];
  st.walkoff = true;
  st.scene = 'FINAL'; st.gameOver = true;
});
await page.waitForTimeout(300);
await shot('10_final');

await browser.close();
console.log('shots written to', outDir);
