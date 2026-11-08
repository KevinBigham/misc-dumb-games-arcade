// How much does the defensive call matter? Smart offense fixed, vary the defense policy. Run: node test/defcheck.cjs [n]
const C = require('../src/core.js'); const B = require('./bots.cjs');
const n = +process.argv[2] || 40; const rows = [];
const pol = { smart: B.BOTS.smart.def, random: B.BOTS.random.def };
for (const d of C.DEFS) pol['always_' + d] = () => d;
pol.worst = s => { const sc = C.oppScout(s); const i = sc.pct.indexOf(Math.max(...sc.pct)); return { RUN: 'SHELL', QUICK: 'BLITZ', DEEP: 'MAN' }[C.CATS[i]]; };
for (const t of process.argv[3] ? [process.argv[3]] : ['thistle', 'wardens', 'anvils']) for (const k in pol) {
  let pa = 0, w = 0; for (let i = 1; i <= n; i++) { const r = B.playGame(i * 53 + 9, t, { call: B.BOTS.smart.call, input: B.BOTS.smart.input, def: pol[k] }); pa += r.op; w += r.res === 'W'; }
  rows.push({ team: t, def: k, pa: +(pa / n).toFixed(1), win: +(w / n).toFixed(2) });
}
console.table(rows);
