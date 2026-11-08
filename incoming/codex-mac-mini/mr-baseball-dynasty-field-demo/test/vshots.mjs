// v0.3 visual iteration shots: plate scene, windup, field view after contact
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

await press('Enter'); await page.waitForTimeout(350);
await press('Enter'); await page.waitForTimeout(700);
await shot('v01_plate');
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 60); await page.keyboard.up(code); }
await press('KeyZ', 80);
await page.waitForTimeout(700);
await shot('v02_windup_kick');
await page.waitForTimeout(700);
await shot('v03_release');
await page.waitForTimeout(1600);

// force a solid contact into the outfield to see the new field view
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
  st.phase = 'PITCH';
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
});
await page.waitForTimeout(300);
await shot('v04_field_flight');
await page.waitForTimeout(900);
await shot('v05_field_mid');
await page.waitForTimeout(1200);
await shot('v06_field_late');
await page.waitForTimeout(1800);
await shot('v07_after_play');
console.log('state:', await page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, cam: Shell.state.camera.mode })));
await browser.close();
console.log('VSHOTS DONE');
