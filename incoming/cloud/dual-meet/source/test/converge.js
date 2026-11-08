// Is the in-game "best lineup" really the best? Compare it with a much heavier search from many fresh starts.
global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
const from = +process.argv[2] || 0, to = +process.argv[3] || 40, pre = process.argv[4] || 'conv-'; let same = 0, worse = [], t = 0;
for (let i = from; i < to; i++) {
  const t0 = Date.now(); const M = DM.makeMeet(pre + i); t += Date.now() - t0;
  const heavy = DM.optimize(M.home, M.noiseA, M.luB, M.tB, { asA: true, seed: 'heavy-' + i, iters: 60000, restarts: 16, starts: [M.defA, M.best.lu] });
  const hm = DM.swim(M, heavy.lu).margin;
  if (hm <= M.best.margin) same++; else worse.push({ i, game: M.best.margin, heavy: hm });
}
console.log(JSON.stringify({ from, to, same, n: to - from, buildMs: +(t / (to - from)).toFixed(0), worse }));
