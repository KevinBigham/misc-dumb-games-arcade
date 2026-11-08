// GOLDEN MASTER — the in-engine integrator must reproduce real captured
// SNES flight segments frame-for-frame (acceptance: canonical ≥61/62 exact z).
import path from 'path';
import { loadGame, readCsv, TELEMETRY } from './load.mjs';
const MBD = loadGame();

const SEGMENTS = [
  ['i6_play03.csv', 481, 543, 61],   // canonical (README quickstart bar)
  ['q2_play02.csv', 300, 420, 110],
  ['m2_play02.csv', 330, 450, 102],
  ['m2_play03.csv', 302, 360, 57],
  ['q1_play10.csv', 596, 677, 74],
];

// fit initial subunit state to observed ints, then REPLAY THROUGH THE ENGINE's
// ballStep (not a local law) and count exact frames — proves the engine core.
function fitAndReplay(obs) {
  let best = null;
  const n = obs.length;
  const vGuess = Math.round((obs[1] - obs[0]) * 256);
  for (let frac = 0; frac < 256; frac++) {
    for (let v0 = vGuess - 300; v0 <= vGuess + 300; v0++) {
      // closed-form replay of the engine law for fitting speed
      let p = (obs[0] << 8) | frac, v = v0, exact = 0, err = 0;
      for (let i = 0; i < n; i++) {
        const e = Math.abs((p >> 8) - obs[i]);
        if (e > err) err = e; if (e === 0) exact++;
        v += MBD.CONST.GRAVITY_SUB; p += v;
      }
      if (!best || err < best.err || (err === best.err && exact > best.exact)) best = { err, exact, frac, v0 };
    }
  }
  // now verify THROUGH the engine ballStep with the fitted launch state
  const b = MBD.newBall();
  b.mode = 'flight'; b.batted = true;
  b.zS = (obs[0] << 8) | best.frac; b.vzS = best.v0;
  b.xS = 512 << 8; b.yS = 512 << 8; b.vxS = 0; b.vyS = 0;
  let engineExact = 0;
  for (let i = 0; i < n; i++) {
    if (MBD.toInt(b.zS) === obs[i]) engineExact++;
    MBD.ballStep(b, null, 0, 0);
    if (b.mode !== 'flight') break;    // ground event ends the pure-arc segment
  }
  return { fitExact: best.exact, engineExact, n };
}

let pass = true;
for (const [file, a, bEnd, minExact] of SEGMENTS) {
  const rows = readCsv(path.join(TELEMETRY, file));
  const Z = rows.slice(a, bEnd).map(r => r[3]);
  const r = fitAndReplay(Z);
  const ok = r.engineExact >= minExact;
  pass = pass && ok;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file} [${a}:${bEnd}]  engine ${r.engineExact}/${r.n} exact (fit ${r.fitExact}, bar ${minExact})`);
}
console.log(pass ? '\nGOLDEN MASTER: ALL PASS' : '\nGOLDEN MASTER: FAILURES');
process.exit(pass ? 0 : 1);
