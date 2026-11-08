// SIM SUITE — determinism · CPU-vs-CPU full game smoke · liveness fuzzer ·
// contact-window sweep · statistical physics fits (spec §10 acceptance)
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { CONST, TUNE, BTN } = MBD;
let failures = 0;
const check = (ok, label, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
};
const pads = () => [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }];

/* ── 1. determinism: identical seed + script → identical event log & state ── */
function runScripted(seed, frames) {
  const st = MBD.newGame({ scene: 'GAME', demo: true, seed });
  st.scene = 'GAME'; MBD.startHalf(st);
  for (let i = 0; i < frames; i++) {
    const r = MBD.tick(st, pads());
    if (r === 'RESET' || st.gameOver) break;
  }
  return st;
}
{
  const a = runScripted([1, 2, 3, 4, 5], 36000);
  const b = runScripted([1, 2, 3, 4, 5], 36000);
  const la = a.log.join('|'), lb = b.log.join('|');
  check(la === lb, 'determinism: 10-min CPU game event logs identical', `${a.log.length} events`);
  check(a.frame === b.frame && a.score.join() === b.score.join(),
    'determinism: final frame + score identical', `score ${a.score.join('-')} @f${a.frame}`);
  const c = runScripted([9, 9, 9, 9, 1], 36000);
  check(c.log.join('|') !== la, 'determinism: different seed → different game');
}

/* ── 2. full-game smoke: CPU vs CPU games complete, rules hold ── */
{
  let done = 0, totalFrames = 0, totalRuns = 0, totalHits = 0, totalK = 0, totalBB = 0, totalHR = 0;
  for (let g = 0; g < 6; g++) {
    const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [g + 1, 7, g * 3 + 1, 9, 2] });
    st.scene = 'GAME'; MBD.startHalf(st);
    let f = 0;
    for (; f < 60 * 60 * 40 && !st.gameOver; f++) MBD.tick(st, pads());
    if (st.gameOver) done++;
    totalFrames += f;
    totalRuns += st.score[0] + st.score[1];
    totalHits += st.hits[0] + st.hits[1];
    totalK += st.log.filter(l => l.includes('call:strikeout')).length;
    totalBB += st.log.filter(l => l.includes('call:walk')).length;
    totalHR += st.log.filter(l => l.endsWith(':hr')).length;
  }
  check(done === 6, 'smoke: 6/6 CPU-vs-CPU games reach FINAL', `avg ${(totalFrames / 6 / 60 / 60).toFixed(1)} min/game (3-inning)`);
  console.log(`      per-game avgs: runs ${(totalRuns / 6).toFixed(1)} · hits ${(totalHits / 6).toFixed(1)} · K ${(totalK / 6).toFixed(1)} · BB ${(totalBB / 6).toFixed(1)} · HR ${(totalHR / 6).toFixed(2)}`);
  check(totalHits > 6, 'smoke: hits occur', String(totalHits));
  check(totalK > 0, 'smoke: strikeouts occur', String(totalK));
}

/* ── 3. liveness fuzzer: 50 random batted balls all resolve [spec §10.4] ── */
{
  let resolved = 0, maxT = 0;
  for (let i = 0; i < 50; i++) {
    const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [i + 1, 13, 55, i * 7 + 1, 3] });
    st.scene = 'GAME'; MBD.startHalf(st);
    // drive to a live batted ball by force-feeding a launch
    for (let f = 0; f < 400 && st.phase !== 'PITCH'; f++) MBD.tick(st, pads());
    // inject: put the game in LIVE with a randomized launch
    const q = [4, 2, 0][i % 3];
    const launch = MBD.computeLaunch(st.rng, q, (i * 5) % 100 - 50, (i * 7) % 80 - 40, i % 2 ? 'R' : 'L', i % 16);
    MBD.applyContact(st.ball, launch);
    st.phase = 'BLANK'; st.phaseT = 0;
    st.stats.contacts++;
    let f = 0, ok = false;
    for (; f < 60 * 45; f++) {
      MBD.tick(st, pads());
      if (st.phase === 'RESOLVE' || st.phase === 'PREPITCH' || st.scene !== 'GAME') { ok = true; break; }
    }
    if (ok) { resolved++; if (f > maxT) maxT = f; }
  }
  check(resolved === 50, 'liveness: 50/50 injected batted balls resolve', `slowest ${(maxT / 60).toFixed(1)}s (kill bar ${CONST.LIVENESS_KILL / 60}s)`);
}

/* ── 4. contact-window sweep [BUILD_PLAN M2 acceptance] ──
   Ball-transit width through the depth window ≈ 4.4–5.7f; slower pitch more
   forgiving by ~1.3f; press-window = transit + D − 1. */
{
  function transitWindow(typeIdx) {
    // measure the shadow-space crossing rate near the plate → window = 116/rate
    // (sub-frame honest; discrete counts alias 4.4 vs 5.5 into the same integer)
    const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [3, 3, 3, 3, 3] });
    st.scene = 'GAME'; MBD.startHalf(st);
    for (let f = 0; f < 500 && st.phase !== 'PREPITCH'; f++) MBD.tick(st, pads());
    MBD.startWindup(st, typeIdx, CONST.PLATE_X);
    st.cpu.batPlan = { press: -1, swing: false, reeval: false };   // no CPU swing — pure transit
    while (st.phase === 'WINDUP') { MBD.tick(st, pads()); st.cpu.batPlan = { press: -1, swing: false, reeval: false }; }
    let lastShadow = null, rates = [], discrete = 0;
    for (let f = 0; f < 200 && st.phase === 'PITCH'; f++) {
      const b = st.ball;
      const shadowY = MBD.toInt(b.yS) - 2 * MBD.toInt(b.zS);
      const dDepth = shadowY - (CONST.PLATE_Y - 2 * CONST.BAT_PLANE_Z);
      if (Math.abs(dDepth) <= CONST.DEPTH_WINDOW_HALF) discrete++;
      if (dDepth > -300 && lastShadow !== null) rates.push(shadowY - lastShadow);
      lastShadow = shadowY;
      MBD.tick(st, pads());
    }
    rates.sort((a, b) => a - b);
    const rate = rates[rates.length >> 1];
    return { w: (CONST.DEPTH_WINDOW_HALF * 2 + 1) / rate, discrete };
  }
  const fast = transitWindow(0);   // fastball
  const slow = transitWindow(3);   // changeup
  check(fast.w >= 4.0 && fast.w <= 5.0, 'window: fastball transit in spec band', `${fast.w.toFixed(2)}f (spec ≈4.4, discrete ${fast.discrete})`);
  check(slow.w >= 5.1 && slow.w <= 6.3, 'window: changeup transit in spec band', `${slow.w.toFixed(2)}f (spec ≈5.7, discrete ${slow.discrete})`);
  check(slow.w - fast.w >= 0.8, 'window: slower pitch measurably more forgiving', `+${(slow.w - fast.w).toFixed(2)}f (spec ≈+1.3)`);
  console.log(`      press-acceptance ≈ transit + D − 1 ≈ ${(fast.w + TUNE.SWING_D - 1).toFixed(1)}f fast / ${(slow.w + TUNE.SWING_D - 1).toFixed(1)}f slow`);
}

/* ── 5. swing-offset sweep: timing→outcome curve (the twin's swing lab!) ── */
{
  function swingAt(offset) {
    const st = MBD.newGame({ scene: 'GAME', demo: false, humanTeam: 1, seed: [8, 8, 8, 8, 8] });
    st.scene = 'GAME'; st.half = 1; MBD.startHalf(st);   // human bats (home, bottom)
    for (let f = 0; f < 600 && st.phase !== 'PREPITCH'; f++) MBD.tick(st, pads());
    // CPU won't pitch to... we ARE home batting; away CPU pitches. run to PITCH:
    for (let f = 0; f < 800 && st.phase !== 'PITCH'; f++) MBD.tick(st, pads());
    if (st.phase !== 'PITCH') return { res: 'nopitch' };
    const T = st.ball.pitch.T;
    const press = T - TUNE.SWING_L - Math.ceil(TUNE.SWING_D / 2) + offset;
    let pressed = false, contactQ = null;
    for (let f = 0; f < 300 && (st.phase === 'PITCH' || st.phase === 'BLANK'); f++) {
      const p = pads();
      if (!pressed && st.ball.pitch && st.ball.pitch.t >= press) { p[0].pressed = BTN.B; p[0].held = BTN.B; pressed = true; }
      MBD.tick(st, p);
      const crack = st.events.find(e => e.type === 'crack');
      if (crack) { contactQ = crack.data.q; break; }
    }
    return { res: contactQ === null ? 'miss' : 'q' + contactQ };
  }
  const curve = [];
  for (let off = -9; off <= 9; off++) curve.push(swingAt(off).res);
  const contacts = curve.filter(r => r.startsWith('q')).length;
  const flushIdx = curve.findIndex(r => r === 'q4');
  console.log('      offset sweep −9..+9:', curve.join(' '));
  check(contacts >= 5 && contacts <= 13, 'swing lab: bounded contact window inside sweep', `${contacts} contact offsets`);
  check(flushIdx !== -1, 'swing lab: flush (q4) tier reachable');
  check(curve[0] === 'miss' && curve[curve.length - 1] === 'miss', 'swing lab: whiffs bracket the window');
}

/* ── 6. statistical physics fits on generated play [spec §10.2] ── */
{
  const rng = new MBD.RNG([5, 4, 3, 2, 1]);
  let gravEsts = [], bounceRatios = [], rollFactors = [];
  for (let i = 0; i < 100; i++) {
    const q = [4, 4, 2, 2, 0][i % 5];
    const launch = MBD.computeLaunch(rng, q, (i * 3) % 90 - 45, (i * 11) % 80 - 40, i % 2 ? 'R' : 'L', i % 16);
    const b = MBD.newBall();
    b.xS = MBD.toSub(1536); b.yS = MBD.toSub(3100);
    MBD.applyContact(b, launch);
    let prevVz = null, zs = [];
    for (let f = 0; f < 1400 && b.mode !== 'settled'; f++) {
      const vzBefore = b.vzS, zBefore = b.zS, modeBefore = b.mode;
      MBD.ballStep(b, null, 0, 0);
      if (modeBefore === 'flight' && b.zS > 0 && zBefore > 0) zs.push({ vzAfter: b.vzS, vzBefore });
      if (modeBefore === 'flight' && b.zS === 0 && b.mode === 'flight' && vzBefore < 0 && b.vzS > 0) {
        bounceRatios.push(b.vzS / -vzBefore);
      }
      if (b.mode === 'rolling' && modeBefore === 'rolling') {
        const sp0 = Math.abs(vzBefore); // unused
      }
    }
    // gravity fit: vz deltas during flight
    for (const s of zs) gravEsts.push(s.vzAfter - s.vzBefore);
    // roll factor: fresh rolling ball
    const rb = MBD.newBall();
    rb.mode = 'rolling'; rb.vxS = 2000 + (i * 37) % 800; rb.vyS = -(1500 + (i * 53) % 700);
    rb.xS = MBD.toSub(1500); rb.yS = MBD.toSub(2500);
    let prevSp = Math.hypot(rb.vxS, rb.vyS);
    for (let f = 0; f < 40 && rb.mode === 'rolling'; f++) {
      MBD.ballStep(rb, null, 0, 0);
      const sp = Math.hypot(rb.vxS, rb.vyS);
      if (sp > 300) rollFactors.push(sp / prevSp);
      prevSp = sp;
    }
  }
  const gAvg = gravEsts.reduce((a, c) => a + c, 0) / gravEsts.length;
  const gU = gAvg / 256;   // units/f²
  check(Math.abs(gU - (-0.046875)) < 0.002, 'stat fit: gravity −0.0469 ± 0.002 u/f²', gU.toFixed(5));
  bounceRatios.sort((a, c) => a - c);
  const bMed = bounceRatios[bounceRatios.length >> 1];
  check(Math.abs(bMed - 0.25) < 0.045, 'stat fit: bounce restitution median ≈ 0.25', `${bMed.toFixed(3)} (n=${bounceRatios.length})`);
  const rAvg = rollFactors.reduce((a, c) => a + c, 0) / rollFactors.length;
  check(Math.abs(rAvg - CONST.ROLL_FACTOR) < 0.003, 'stat fit: roll factor ≈ 0.9894', `${rAvg.toFixed(4)} (n=${rollFactors.length})`);
}

/* ── 7. RNG reference cross-check (first outputs from a known seed) ── */
{
  const r = new MBD.RNG([0x01, 0x00, 0x00, 0x00, 0x00]);
  const seq = Array.from({ length: 8 }, () => r.next());
  // recompute with an independent implementation of the recurrence
  let s = [0x01, 0x00, 0x00, 0x00, 0x00];
  const ref = [];
  for (let i = 0; i < 8; i++) {
    const fb = (((s[1] >> 4) | ((s[2] << 4) & 0xFF)) ^ (((s[4] & 1) << 7) | (s[3] >> 1))) & 0xFF;
    s = [fb, s[0], s[1], s[2], s[3]];
    ref.push(fb);
  }
  check(seq.join() === ref.join(), 'RNG: engine matches reference recurrence', seq.map(v => v.toString(16)).join(','));
}

console.log(failures === 0 ? '\nSIM SUITE: ALL PASS' : `\nSIM SUITE: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
