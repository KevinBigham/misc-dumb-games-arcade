// Headless bots for Prismwheel core. Usage: node bot.js [runs] [style]
const P = require(process.env.CORE || './core.js');
const { CONFIG } = P;

function evalSide(st, s, f) {
  const g = st.grid, n = st.sides, h = g[s].length;
  if (h >= CONFIG.maxRows) return -999;
  let v = -h * 0.7;
  const fake = (b) => b && (b.kind === 'prism' || f.kind === 'prism' || (b.kind === 'shard' && f.kind === 'shard' && b.c === f.c));
  if (fake(g[s][h - 1])) v += 3;
  if (fake(g[(s + 1) % n][h])) v += 2.2;
  if (fake(g[(s - 1 + n) % n][h])) v += 2.2;
  if (h >= CONFIG.maxRows - 2) v -= 4;
  return v;
}
function makeBot(style) {
  let cd = 0, target = null;
  const apm = style === 'sloppy' ? 5 : style === 'slow' ? 4 : style === 'human' ? 7 : 12; // turns per second
  let mistakeFor = -1, mistakeR = 0;
  return function (st, dt) {
    cd -= dt; if (cd > 0) return null;
    if (style === 'flare' || style !== 'noflare') if (st.flare >= 1 && P.maxHeight(st) >= 5) { cd = 0.15; return 'flare'; }
    if (!st.falling.length) return null;
    const f = st.falling.reduce((a, b) => (a.d < b.d ? a : b));
    const n = st.sides;
    let best = -1e9, bestR = st.rot;
    for (let r = 0; r < n; r++) {
      const s = ((f.lane - r) % n + n) % n;
      let dist = ((r - st.rot) % n + n) % n; if (dist > n / 2) dist -= n;
      const v = evalSide(st, s, f) - Math.abs(dist) * (style === 'slow' ? 0.6 : 0.25);
      if (v > best) { best = v; bestR = r; }
    }
    if (style === 'sloppy') { // misreads ~25% of shards and reacts late
      if (f.d > 0.75) return null;
      if (mistakeFor !== f.id) { mistakeFor = f.id; mistakeR = Math.random() < 0.25 ? Math.floor(Math.random() * n) : -1; }
      if (mistakeR >= 0) bestR = mistakeR;
    }
    let dist = ((bestR - st.rot) % n + n) % n; if (dist > n / 2) dist -= n;
    if (dist === 0) return null;
    cd = 1 / apm;
    return dist > 0 ? 1 : -1;
  };
}
function run(seed, style, maxT) {
  const st = P.newState({ seed });
  const bot = makeBot(style);
  const ev = { clear: 0, ringup: 0, flare: 0, land: 0 };
  const ringTimes = [];
  while (!st.over && st.t < (maxT || 1500)) {
    const a = bot(st, CONFIG.step);
    if (a === 'flare') P.flare(st); else if (a) P.rotate(st, a);
    P.step(st, CONFIG.step);
    for (const e of st.events) { if (ev[e.type] !== undefined) ev[e.type]++; if (e.type === 'ringup') ringTimes.push(Math.round(st.t)); }
    st.events.length = 0;
  }
  return { seed, t: Math.round(st.t), score: st.score, ring: st.ringIdx, diff: +st.diff.toFixed(1), cleared: st.stats.cleared, chain: st.stats.bestChain, combo: st.stats.bestCombo, ringTimes, ...ev };
}
if (require.main === module) {
  const runs = +process.argv[2] || 8, style = process.argv[3] || 'human';
  const res = []; for (let i = 0; i < runs; i++) res.push(run(1000 + i * 7919, style));
  for (const r of res) console.log(JSON.stringify(r));
  const avg = k => (res.reduce((a, r) => a + r[k], 0) / res.length).toFixed(1);
  console.log(style, 'avg t', avg('t'), 'score', avg('score'), 'ring', avg('ring'), 'cleared', avg('cleared'));
}
module.exports = { run, makeBot };
