global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
const seeds = process.argv.slice(2).length ? process.argv.slice(2) : ['dual-meet|2026-11-06','dual-meet|2026-11-07','dual-meet|2026-11-08'];
for (const s of seeds) {
  const t0 = Date.now(); const M = DM.makeMeet(s); const ms = Date.now() - t0;
  console.log(s, M.gender, M.away.name, 'attempt', M.attempt, 'default', M.defaultMargin, 'best', M.best.margin, M.best.us + '-' + M.best.them, 'ms', ms, 'evals', M.evals, 'valid', DM.valid(M.best.lu), DM.valid(M.luB));
}
const M = DM.makeMeet(seeds[0]);
M.home.swimmers.forEach(s => console.log(s.short.padEnd(16), s.label.padEnd(13), Object.entries(s.ab).map(([k,v])=>k+' '+DM.fmt(v)).join('  ')));
