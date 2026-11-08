// Action captures: pitch flight (no CPU swing), human batting swing + contact,
// batted-ball steering toward a home run.
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
const S = () => page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, ball: Shell.state.ball.mode, banner: Shell.state.banner && Shell.state.banner.text, score: Shell.state.score.join('-') }));
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 60); await page.keyboard.up(code); }

await press('Enter'); await page.waitForTimeout(250);
await press('Enter'); await page.waitForTimeout(400);

// A) pitch flight capture: force CPU batter to take, then pitch and steer
await page.evaluate(() => { window.__noswing = setInterval(() => { if (Shell.state.cpu) Shell.state.cpu.batPlan = { press: -1, swing: false, reeval: false }; }, 15); });
await press('KeyZ');                                 // straight ball
await page.waitForTimeout(1060);                     // ~64f windup
await page.keyboard.down('ArrowRight');              // steer right
await page.waitForTimeout(180);
await shot('20_pitch_flight');
console.log('flight:', await S());
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(700);
await shot('21_take_call');
console.log('call:', await S());
await page.evaluate(() => clearInterval(window.__noswing));

// B) human batting: jump to bottom half, CPU pitches to us
await page.evaluate(() => {
  const st = Shell.state;
  st.half = 1; st.scene = 'GAME';
  MBD.startHalf(st);
});
await page.waitForTimeout(300);
await shot('22_prepitch_batting');
// wait for CPU release, then swing near arrival
let released = false;
for (let i = 0; i < 80; i++) {
  await page.waitForTimeout(60);
  const b = await page.evaluate(() => ({ mode: Shell.state.ball.mode, t: Shell.state.ball.t, T: Shell.state.ball.pitch ? Shell.state.ball.pitch.T : 0 }));
  if (b.mode === 'pitch') { released = true;
    const waitMs = Math.max(0, (b.T - b.t - 11) * 16.6);
    await page.waitForTimeout(waitMs);
    await page.keyboard.down('KeyZ');
    await page.waitForTimeout(40);
    await shot('23_swing');
    await page.keyboard.up('KeyZ');
    break;
  }
}
console.log('swing attempt:', released, await S());
await page.waitForTimeout(1200);
await shot('24_swing_result');
console.log('result:', await S());

// C) forced HR flight: inject a deep launch, steer with d-pad, watch the banner
await page.evaluate(() => {
  const st = Shell.state;
  if (st.scene !== 'GAME') { st.scene = 'GAME'; MBD.startHalf(st); }
  st.phase = 'PITCH'; st.phaseT = 0;   // pretend a pitch was live
  const launch = { vxS: 0, vyS: 0, vzS: 0 };
  // hand-build: az 40 steps toward RF, elevation 660 (26°), speed 178 (11.1 u/f)
  const elevRad = ((660 - 512) / 2048) * Math.PI * 2;
  const speedU = 178 / 16;
  const planar = speedU * Math.cos(elevRad);
  const rad = (40 / 2048) * Math.PI * 2;
  launch.vxS = Math.round(Math.sin(rad) * planar * 256);
  launch.vyS = -Math.round(Math.cos(rad) * planar * 256);
  launch.vzS = Math.round(Math.sin(elevRad) * speedU * 256);
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
});
await page.waitForTimeout(400);
await page.keyboard.down('ArrowUp');                 // steer deeper
await page.waitForTimeout(900);
await shot('25_deep_fly_steered');
console.log('deep fly:', await S());
await page.waitForTimeout(1500);
await page.keyboard.up('ArrowUp');
await shot('26_hr_or_wall');
console.log('outcome:', await S());
await page.waitForTimeout(1400);
await shot('27_after');
await browser.close();
console.log('done');
