// Daily Kiln bot: builds many dates in parallel, checks determinism and solve rate,
// and (with TABLE=1) writes src/daily-table.js, a precomputed cache so phones skip the search.
// usage: node daily-test.js 2026-11-01 60   [TABLE=1]
const { Worker, isMainThread, parentPort } = require('worker_threads');
const { load } = require('./lib.js');
if (!isMainThread) {
  const K = load();
  parentPort.on('message', (date) => {
    const t0 = Date.now(); const g = K.buildDaily(date); let r; while (true) { const n = g.next(); if (n.done) { r = n.value; break; } }
    const ms = Date.now() - t0;
    // the sub-seed that was used
    const base = K.hashStr('kilnshot:' + date); let sub = -1; for (let t = 0; t < 12; t++) if ('D' + ((base + t * 7919) >>> 0) === r.id) sub = t;
    // verify the proof replays to a win from a fresh copy
    let proofWins = null; if (r.proof) { const w = K.replay(JSON.parse(JSON.stringify(r)), r.proof); proofWins = K.secondsLeft(w) === 0 && !w.keeperBroken; }
    // determinism: build again, compare
    const g2 = K.buildDaily(date); let r2; while (true) { const n = g2.next(); if (n.done) { r2 = n.value; break; } }
    parentPort.postMessage({ date, ms, par: r.par, sub, pots: r.pots.length, proof: r.proof, proofWins, same: JSON.stringify(r) === JSON.stringify(r2), fallback: !r.proof });
  });
  return;
}
const start = process.argv[2] || '2026-11-01', N = +(process.argv[3] || 30);
const dates = []; const d0 = new Date(start + 'T12:00:00Z'); for (let i = 0; i < N; i++) { const d = new Date(d0.getTime() + i * 864e5); dates.push(d.toISOString().slice(0, 10)); }
const out = []; let next = 0;
const ws = Array.from({ length: 4 }, () => new Worker(__filename));
Promise.all(ws.map(w => new Promise(res => {
  const go = () => { if (next >= dates.length) { w.terminate(); res(); return; } w.postMessage(dates[next++]); };
  w.on('message', (m) => { out.push(m); console.log(m.date, 'par', m.par, 'sub', m.sub, 'pots', m.pots, m.ms + 'ms', m.fallback ? 'FALLBACK' : (m.proofWins ? 'proof ok' : 'PROOF FAILS'), m.same ? 'deterministic' : 'NONDETERMINISTIC'); go(); });
  go();
}))).then(() => {
  out.sort((a, b) => a.date < b.date ? -1 : 1);
  const ms = out.map(o => o.ms).sort((a, b) => a - b);
  const pars = {}; out.forEach(o => pars[o.par] = (pars[o.par] || 0) + 1);
  console.log(`\n${out.length} dates  fallback ${out.filter(o => o.fallback).length}  proof fails ${out.filter(o => o.proofWins === false).length}  nondeterministic ${out.filter(o => !o.same).length}`);
  console.log(`build ms median ${ms[ms.length >> 1]} p90 ${ms[Math.floor(ms.length * 0.9)]} max ${ms[ms.length - 1]}  par spread ${JSON.stringify(pars)}`);
  if (process.env.TABLE) {
    const rows = out.map(o => o.fallback ? '0' : [o.sub, o.par, ...o.proof.flat()].join(' '));
    const js = `// Precomputed Daily Kiln cache (built by tests/daily-test.js). Day 0 = ${dates[0]}.\n// Each row: sub-seed, par, then the proof throws. The game re-checks every row by replaying it, and solves live past the end.\nconst DAILY_TABLE = { start: '${dates[0]}', rows: ${JSON.stringify(rows.join('|'))} };\n`;
    require('fs').writeFileSync(require('path').join(__dirname, '..', 'src', 'daily-table.js'), js);
    console.log('wrote daily-table.js', js.length, 'bytes');
  }
});
