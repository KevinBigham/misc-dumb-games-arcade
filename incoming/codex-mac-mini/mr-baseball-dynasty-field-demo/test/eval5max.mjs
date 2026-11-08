// Fable 5 Max evaluation playtest: human-driven segment + full 3-inning CPU game
// with stats + screenshots at key moments.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/tmp/node_modules/playwright/index.js');
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'eval_shots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('file://' + path.join(here, '..', 'index.html'));
await page.waitForTimeout(600);
const shot = (n) => page.screenshot({ path: path.join(outDir, n + '.png') });
const S = () => page.evaluate(() => ({ scene: Shell.state.scene, phase: Shell.state.phase, cam: Shell.state.camera.mode, ball: Shell.state.ball.mode, score: Shell.state.score, half: Shell.state.half, inning: Shell.state.inning, outs: Shell.state.outs, balls: Shell.state.balls, strikes: Shell.state.strikes }));
async function press(code, hold) { await page.keyboard.down(code); await page.waitForTimeout(hold || 60); await page.keyboard.up(code); }

// ── 1. Title / menu / matchup ──
await shot('e01_title');
await press('Enter'); await page.waitForTimeout(350);
await shot('e02_matchup');
await press('Enter'); await page.waitForTimeout(600);
await shot('e03_prepitch');
console.log('after start:', await S());

// ── 2. Pitch with steering (human pitches: hold LEFT chord for pitch type, Z to throw) ──
await page.keyboard.down('ArrowLeft');            // pitch-type chord
await press('KeyZ', 80);                           // commit pitch
await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(500);                    // mid-windup (84f ≈ 1.4s)
await shot('e04_windup_legkick');
await page.waitForTimeout(650);                    // release
await page.keyboard.down('ArrowRight');            // steer in flight
await page.waitForTimeout(220);
await page.keyboard.up('ArrowRight');
await shot('e05_pitch_flight_steered');
await page.waitForTimeout(900);
await shot('e06_result');
console.log('after pitch:', await S());

// ── 3. A few more pitches to see calls/count texture ──
for (let i = 0; i < 3; i++) {
  await press('KeyZ', 70);
  await page.waitForTimeout(2300);
}
await shot('e07_count_texture');
console.log('count after 4 pitches:', await S());

// ── 4. Swing side: flip to batting, swing at one ──
await page.evaluate(() => { const st = Shell.state; st.half = 1; MBD.startHalf(st); });
await page.waitForTimeout(400);
await shot('e08_we_bat');
// CPU pitches to us; wait for windup, time a swing
await page.waitForTimeout(1600);
await press('KeyZ', 100);                          // swing
await page.waitForTimeout(500);
await shot('e09_swing_or_contact');
const s9 = await S(); console.log('after swing:', s9);
await page.waitForTimeout(2000);
await shot('e10_play_result');
console.log('play result:', await S());

// ── 5. Full 3-inning CPU-vs-CPU game, fast-forwarded via direct ticks ──
await page.evaluate(() => {
  window.__evalGame = MBD.newGame({ scene: 'GAME', demo: true, seed: [3, 1, 4, 1, 5] });
  window.__evalGame.scene = 'GAME';
  MBD.startHalf(window.__evalGame);
  window.__evalLog = [];
  window.__origState = Shell.state;
  Shell.state = window.__evalGame;               // render this game
});
let snapCount = 0, lastKey = '';
for (let batch = 0; batch < 400; batch++) {
  const st = await page.evaluate(() => {
    const st = window.__evalGame;
    for (let i = 0; i < 240 && st.scene !== 'FINAL'; i++) {
      MBD.tick(st, [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]);
      for (const e of st.events) window.__evalLog.push(e);
      st.events.length = 0;
    }
    return { scene: st.scene, inning: st.inning, half: st.half, score: st.score, frame: st.frame, ball: st.ball.mode, phase: st.phase };
  });
  const key = st.inning + '-' + st.half;
  if (key !== lastKey && st.scene === 'GAME') {
    lastKey = key;
    await page.waitForTimeout(60);
    await shot('e2' + String(snapCount).padStart(2, '0') + '_cpu_inn' + st.inning + '_half' + st.half);
    snapCount++;
  }
  if (st.scene === 'FINAL') break;
}
await page.waitForTimeout(100);
await shot('e30_final');
const log = await page.evaluate(() => window.__evalLog.map(e => e.t));
const counts = {};
for (const t of log) counts[t] = (counts[t] || 0) + 1;
console.log('FULL CPU GAME event mix:', JSON.stringify(counts));
console.log('final:', await S());

await browser.close();
console.log('EVAL SHOTS DONE →', outDir);
