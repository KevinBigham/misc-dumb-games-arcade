// wave5 verification shots: title glow-up (portrait + layered logo lockup),
// menu nav state, attract demo still firing (sceneT poked near the 15s line),
// plus a plate-view regression frame.
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
const state = () => page.evaluate(() => { const st = Shell.state; return st.scene + ' sel=' + st.menuSel + ' sceneT=' + st.sceneT + ' demo=' + !!st.demo; });

// fresh boot title — kill the INIDISP fade so the capture is clean
await page.evaluate(() => { FADE.t = 0; });
await page.waitForTimeout(120);
await shot('w5_00_title_fresh');
console.log('  shot w5_00_title_fresh —', await state());

// menu nav: Down to 2P VS, Down to WATCH DEMO
await press('ArrowDown', 75); await page.waitForTimeout(150);
await shot('w5_01_title_nav1');
console.log('  shot w5_01_title_nav1 —', await state());
await press('ArrowDown', 75); await page.waitForTimeout(150);
await shot('w5_02_title_nav2');
console.log('  shot w5_02_title_nav2 —', await state());

// attract demo: poke sceneT just past the 15s line, confirm the demo game boots
await page.evaluate(() => { Shell.state.sceneT = 60 * 15 + 2; });
await page.waitForTimeout(900);
console.log('  attract state —', await state());
await page.evaluate(() => { FADE.t = 0; });
await page.waitForTimeout(120);
await shot('w5_03_attract_demo');
console.log('  shot w5_03_attract_demo —', await state());

// exit attract (any key), then start a 1P game for a plate-view regression frame
await press('Escape', 75); await page.waitForTimeout(400);      // exits demo → fresh title
await press('Enter', 75); await page.waitForTimeout(350);       // title → matchup
await press('Enter', 75); await page.waitForTimeout(900);       // matchup → game
console.log('  game state —', await state());
await page.evaluate(() => { FADE.t = 0; });
await page.waitForTimeout(120);
await shot('w5_04_plate_regression');
console.log('  shot w5_04_plate_regression —', await state());

// field-view regression frame (forced batted ball, same technique as wave3/4)
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
  MBD.applyContact(st.ball, {
    vxS: Math.round(Math.sin(rad) * planar * 256),
    vyS: -Math.round(Math.cos(rad) * planar * 256),
    vzS: Math.round(Math.sin(elevRad) * speedU * 256),
  });
  st.phase = 'BLANK'; st.phaseT = 0;
});
await page.waitForTimeout(700);
await page.evaluate(() => { FADE.t = 0; });
await page.waitForTimeout(120);
await shot('w5_05_field_regression');
console.log('  shot w5_05_field_regression —', await state());

await browser.close();
console.log('WAVE5 SHOTS DONE');
