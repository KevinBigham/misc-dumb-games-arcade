// Level solver bot: proves each level is beatable and hunts unintended cheese.
// usage: node solve.js [levelId,...] [--step 20] [--depth 3] [--beam 5]
// For each board state it fires every launch on a velocity grid (game-identical quantization),
// keeps the best distinct resulting boards (no keeper broken), and searches for the fewest shots.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const { load, grid } = require('./lib.js');

if (!isMainThread) {
  const K = load();
  parentPort.on('message', (m) => {
    const lvl = m.custom || K.LEVELS.find(l => l.id === m.id);
    const base = K.replay(lvl, m.prefix);
    const k0 = K.boardKey(base);
    const out = [];
    for (const v of m.vecs) {
      const w = K.cloneWorld(base);
      const r = K.runShot(w, v[0], v[1]);
      if (r.keeper) { out.push([v[0], v[1], -1, '']); continue; }
      const k = K.boardKey(w); out.push([v[0], v[1], r.broke, k === k0 ? '' : k]);
    }
    parentPort.postMessage(out);
  });
  return;
}

const NW = 4;
let workers = [];
function startWorkers() { workers = Array.from({ length: NW }, () => new Worker(__filename)); }
function stopWorkers() { workers.forEach(w => w.terminate()); }
function fireAll(id, prefix, vecs, custom) {
  const chunks = Array.from({ length: NW }, () => []);
  vecs.forEach((v, i) => chunks[i % NW].push(v));
  return Promise.all(workers.map((wk, i) => new Promise(res => {
    wk.once('message', res); wk.postMessage({ id, prefix, vecs: chunks[i], custom });
  }))).then(parts => parts.flat());
}

// a shot is 'robust' (human-repeatable) if at least 3 of its 8 grid neighbours give the identical board
function robustSet(res, step) {
  const m = new Map(); for (const r of res) m.set(r[0] + ',' + r[1], r);
  const out = new Set();
  for (const r of res) {
    if (r[2] < 0 || !r[3]) continue; let same = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue; const q = m.get((r[0] + dx * step) + ',' + (r[1] + dy * step));
      if (q && q[2] === r[2] && q[3] === r[3]) same++;
    }
    if (same >= 3) out.add(r[0] + ',' + r[1]);
  }
  return out;
}
async function solveLevel(K, lvl, opts) {
  const vecs = grid(opts.step, K);
  const total = K.secondsTotal(K.makeWorld(lvl));
  // depth-1 analysis
  const r1 = await fireAll(lvl.id, [], vecs, opts.custom);
  const rob1 = robustSet(r1, opts.step);
  const win1 = r1.filter(r => r[2] === total && (!opts.robust || rob1.has(r[0] + ',' + r[1])));
  const keeperBreaks = r1.filter(r => r[2] === -1).length;
  // beam search over distinct boards
  let frontier = [{ prefix: [], left: total }];
  let best = null, depth = 0, seen = new Set();
  if (win1.length) best = { shots: 1, line: [[win1[0][0], win1[0][1]]] };
  while (!best && depth < opts.depth) {
    depth++;
    const next = [];
    for (const st of frontier) {
      const res = depth === 1 ? r1 : await fireAll(lvl.id, st.prefix, vecs, opts.custom);
      const byKey = new Map();
      const robust = opts.robust ? robustSet(res, opts.step) : null;
      for (const r of res) {
        if (robust && !robust.has(r[0] + ',' + r[1])) continue;
        if (r[2] < 0 || !r[3]) continue;
        const left = st.left - r[2];
        if (left === 0) { best = best || { shots: depth, line: st.prefix.concat([[r[0], r[1]]]) }; }
        const k = r[3];
        if (!byKey.has(k)) byKey.set(k, { prefix: st.prefix.concat([[r[0], r[1]]]), left, count: 0, key: k });
        byKey.get(k).count++;
      }
      for (const [k, v] of byKey) if (!seen.has(k)) { seen.add(k); next.push(v); }
      if (best) break;
    }
    // prefer fewest left, then the widest (most forgiving) window
    next.sort((a, b) => a.left - b.left || b.count - a.count);
    // keep the best few overall, plus the best two for each door configuration (latch-only shots matter)
    const keep = new Set(next.slice(0, opts.beam)); const perGate = new Map();
    for (const n of next) { const g = n.key.split('#')[1]; const c = perGate.get(g) || 0; if (c < 2) { keep.add(n); perGate.set(g, c + 1); } }
    frontier = next.filter(n => keep.has(n));
    if (!frontier.length) break;
  }
  return { id: lvl.id, name: lvl.name, par: lvl.par, total, gridN: vecs.length, oneShotWins: win1.length, keeperBreaks, best, depth1: r1 };
}

async function main() {
  const K = load();
  const args = process.argv.slice(2);
  const opt = { step: 20, depth: 4, beam: 6, robust: false };
  const ids = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--step') opt.step = +args[++i];
    else if (args[i] === '--depth') opt.depth = +args[++i];
    else if (args[i] === '--beam') opt.beam = +args[++i];
    else if (args[i] === '--robust') opt.robust = true;
    else ids.push(...args[i].split(','));
  }
  const levels = ids.length ? K.LEVELS.filter(l => ids.includes(l.id)) : K.LEVELS;
  startWorkers();
  const report = [];
  for (const l of levels) {
    const t0 = Date.now();
    const r = await solveLevel(K, l, opt);
    const s = r.best ? r.best.shots : 'UNSOLVED';
    const flag = !r.best ? 'FAIL unsolved' : (r.best.shots < l.par ? 'CHEESE (beats par ' + l.par + ')' : (r.best.shots > l.par ? 'PAR TOO LOW? best ' + r.best.shots : 'ok'));
    console.log(`${l.id} ${l.name.padEnd(20)} par ${l.par} best ${s}  1-shot wins ${r.oneShotWins}/${r.gridN} (${(100 * r.oneShotWins / r.gridN).toFixed(2)}%)  keeper-breaks ${r.keeperBreaks}  ${flag}  [${Date.now() - t0}ms]` + (r.best ? '  line ' + JSON.stringify(r.best.line) : ''));
    report.push({ id: l.id, par: l.par, best: r.best, oneShotWins: r.oneShotWins, gridN: r.gridN, keeperBreaks: r.keeperBreaks, flag });
  }
  stopWorkers();
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { solveLevel, startWorkers, stopWorkers };
