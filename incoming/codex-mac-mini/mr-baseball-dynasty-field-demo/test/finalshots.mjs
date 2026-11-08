// v0.6 final package screenshots
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/tmp/node_modules/playwright/index.js');
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', '..', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('file://' + path.join(here, '..', 'index.html'));
await page.waitForTimeout(600);
const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 70); await page.keyboard.up(code); }

await shot('v06_01_title');
// [v0.6 P1-3] innings selector: down x3 to the INNINGS row, right to pick 6
await press('ArrowDown'); await page.waitForTimeout(120);
await press('ArrowDown'); await page.waitForTimeout(120);
await press('ArrowDown'); await page.waitForTimeout(120);
await press('ArrowRight'); await page.waitForTimeout(200);
await shot('v06_02_title_innings6');
console.log('menu state:', await page.evaluate(() => ({ menuSel: Shell.state.menuSel, innings: Shell.state.innings })));
// back to 1P VS CPU and start the 6-inning game
await press('ArrowUp'); await page.waitForTimeout(120);
await press('ArrowUp'); await page.waitForTimeout(120);
await press('ArrowUp'); await page.waitForTimeout(120);
await press('Enter'); await page.waitForTimeout(350);
await shot('v06_03_matchup_6inn');
console.log('matchup state:', await page.evaluate(() => ({ scene: Shell.state.scene, innings: Shell.state.innings })));
await press('Enter'); await page.waitForTimeout(700);
await shot('v06_04_plate_scene');
await press('KeyZ', 80);
await page.waitForTimeout(720);
await shot('v06_05_leg_kick');
await page.waitForTimeout(700);
await shot('v06_06_pitch_flight');
await page.waitForTimeout(1800);

// deep drive for the oblique field money shot
await page.evaluate(() => {
  const st = Shell.state;
  const elevRad = ((640 - 512) / 2048) * Math.PI * 2;
  const speedU = 160 / 16;
  const planar = speedU * Math.cos(elevRad);
  const rad = (-140 / 2048) * Math.PI * 2;
  const launch = {
    vxS: Math.round(Math.sin(rad) * planar * 256),
    vyS: -Math.round(Math.cos(rad) * planar * 256),
    vzS: Math.round(Math.sin(elevRad) * speedU * 256),
  };
  st.ball.xS = MBD.CONST.PLATE_X << 8; st.ball.yS = MBD.CONST.PLATE_Y << 8;
  st.phase = 'PITCH';
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
});
await page.waitForTimeout(700);
await shot('v06_07_field_oblique');
await page.waitForTimeout(1100);
await shot('v06_08_field_play');
await page.waitForTimeout(2400);

// steal race: stage a runner, launch a steal, catch the throw-down
await page.evaluate(() => {
  const st = Shell.state;
  st.half = 1; MBD.startHalf(st);              // we bat (bottom)
  st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; st.phaseT = 0; MBD.newPA(st);
});
await page.waitForTimeout(900);                 // lead builds
await page.keyboard.down('ArrowUp');
await press('KeyX', 90);                        // A+UP = steal 2B
await page.keyboard.up('ArrowUp');
await page.waitForTimeout(200);
await shot('v06_09_steal_go');
await page.waitForTimeout(2600);
await shot('v06_10_steal_result');
console.log('state:', await page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, cam: Shell.state.camera.mode, banner: Shell.state.banner && Shell.state.banner.text })));
await browser.close();
console.log('FINAL SHOTS DONE');
