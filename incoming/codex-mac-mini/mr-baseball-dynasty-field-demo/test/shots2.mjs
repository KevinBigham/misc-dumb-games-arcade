// Plate-view playtest with proper key hold timing (≥3 sim ticks per press)
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
await page.waitForTimeout(600);
const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
const S = () => page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, ball: Shell.state.ball.mode, banner: Shell.state.banner && Shell.state.banner.text }));
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 60); await page.keyboard.up(code); }

await press('Enter'); await page.waitForTimeout(300);
await press('Enter'); await page.waitForTimeout(500);
console.log('after enters:', await S());
await shot('11_prepitch');

// pitch 1: fastball (Down+B), then steer left mid-flight
await page.keyboard.down('ArrowDown');
await press('KeyZ');
await page.keyboard.up('ArrowDown');
await page.waitForTimeout(700);                      // mid-windup
await shot('12_windup');
await page.waitForTimeout(420);                      // ball released (~62f + few)
await page.keyboard.down('ArrowLeft');
await page.waitForTimeout(140);
await shot('13_pitch_flight_steered');
await page.keyboard.up('ArrowLeft');
console.log('pitch1:', await S());
await page.waitForTimeout(800);
await shot('14_take_result');
console.log('take:', await S());
await page.waitForTimeout(1200);

// pitch 2: changeup (Up+B), let it ride for a called strike/ball
await page.keyboard.down('ArrowUp');
await press('KeyZ');
await page.keyboard.up('ArrowUp');
await page.waitForTimeout(1500);
await shot('15_pitch2_result');
console.log('pitch2:', await S());

// keep pitching until the CPU batter makes contact → field view action
let contact = false;
for (let p = 0; p < 14 && !contact; p++) {
  await page.waitForTimeout(900);
  const st = await S();
  if (st.phase === 'PREPITCH') await press('KeyZ');
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const s2 = await S();
    if (s2.phase === 'LIVE' || s2.phase === 'BLANK') { contact = true; break; }
    if (s2.phase === 'PREPITCH' || s2.scene !== 'GAME') break;
  }
}
console.log('contact reached:', contact, await S());
if (contact) {
  await shot('16_contact_live');
  await page.waitForTimeout(1000);
  await shot('17_live_fielding');
  await page.waitForTimeout(1600);
  await shot('18_play_result');
  console.log('play:', await S());
}
await browser.close();
console.log('done');
