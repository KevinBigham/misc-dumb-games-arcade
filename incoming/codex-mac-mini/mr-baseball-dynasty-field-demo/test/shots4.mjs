// v0.2 visual pass: title menu, stadium plate view, leg kick, bunt, HR fireworks
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/home/claude/.npm-global/lib/node_modules/playwright/index.js');
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'shots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('file://' + path.join(here, '..', 'index.html'));
await page.waitForTimeout(500);
const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 60); await page.keyboard.up(code); }

await shot('40_title_menu');
await press('Enter'); await page.waitForTimeout(300);
await press('Enter'); await page.waitForTimeout(500);
await shot('41_plate_stadium');
// windup: capture the leg kick mid-hold
await press('KeyZ');
await page.waitForTimeout(600);
await shot('42_leg_kick');
await page.waitForTimeout(900);
await shot('43_release_or_result');
await page.waitForTimeout(1400);

// bunt stance: flip to bottom half so we bat, hold A
await page.evaluate(() => { const st = Shell.state; st.half = 1; st.scene = 'GAME'; MBD.startHalf(st); });
await page.waitForTimeout(400);
await page.keyboard.down('KeyX');
await page.waitForTimeout(400);
await shot('44_bunt_stance');
await page.keyboard.up('KeyX');

// HR: inject a monster launch and let the fireworks fly
await page.evaluate(() => {
  const st = Shell.state;
  const elevRad = ((672 - 512) / 2048) * Math.PI * 2;
  const speedU = 190 / 16;
  const planar = speedU * Math.cos(elevRad);
  const rad = (-60 / 2048) * Math.PI * 2;
  const launch = {
    vxS: Math.round(Math.sin(rad) * planar * 256),
    vyS: -Math.round(Math.cos(rad) * planar * 256),
    vzS: Math.round(Math.sin(elevRad) * speedU * 256),
  };
  st.phase = 'PITCH';
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
});
await page.waitForTimeout(2600);
const s = await page.evaluate(() => ({ banner: Shell.state.banner && Shell.state.banner.text, phase: Shell.state.phase }));
console.log('HR state:', s);
await shot('45_hr_fireworks');
await browser.close();
console.log('done');
