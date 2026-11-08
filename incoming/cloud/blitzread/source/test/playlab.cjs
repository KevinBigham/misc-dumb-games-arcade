// Play lab: one play vs one forced defense at a given heat. node test/playlab.cjs SLANT MAN [heat] [team]
const C = require('../src/core.js'); const B = require('./bots.cjs');
const [pid, call, heat, team] = [process.argv[2] || 'SLANT', process.argv[3] || 'MAN', +(process.argv[4] || 0), process.argv[5] || 'wardens'];
let n = 0, yd = [], inc = 0, int = 0, sack = 0;
for (let i = 1; i <= 300; i++) {
  const s = C.newGame({ seed: i * 977, oppId: team, flea: true }); s.defCall = call; s.look = call; s.heat[pid] = heat; s.los = 30; s.ltg = 40;
  C.callPlay(s, pid); const P = s.play; const R = (() => { let a = i; return () => (a = (a * 16807) % 2147483647) / 2147483647; })(); const mem = {};
  let k = 0; while (!P.result && k++ < 2000) C.tick(s, C.CONFIG.DT, B.BOTS.smart.input(s, P, R, mem));
  const r = C.finishPlay(s); n++; if (r.type === 'inc') inc++; if (r.type === 'int') int++; if (r.type === 'sack') sack++; yd.push(r.type === 'int' ? -15 : r.gained);
}
yd.sort((a, b) => a - b); const mean = yd.reduce((a, b) => a + b, 0) / n;
console.log(pid, 'vs', call, 'heat', heat, 'mean', mean.toFixed(1), 'med', yd[n >> 1], 'inc', (inc / n).toFixed(2), 'int', (int / n).toFixed(3), 'sack', (sack / n).toFixed(2), '>=15', (yd.filter(x => x >= 15).length / n).toFixed(2));
