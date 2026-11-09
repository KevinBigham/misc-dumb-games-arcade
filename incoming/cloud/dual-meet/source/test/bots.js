// Player bots for balance: what a thoughtful coach could reach with only what the game shows.
global.GK = global.GK || require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
// assumed opponent: their assistant lineup, with the scouted events replaced by what was revealed
function assumedOpp(M) {
  const lu = DM.defaultLineup(M.away);
  M.reveal.forEach(ei => DM.EV_SLOTS[ei].forEach(si => { lu[si] = M.luB[si]; }));
  return lu;
}
// scout bot: plans against the assumed opponent with seed times only (no race-day swing), then swims for real
function scout(M, o) {
  o = o || {};
  const opp = assumedOpp(M), tOpp = DM.times(M.away, opp, null);
  const r = DM.optimize(M.home, null, opp, tOpp, { asA: true, seed: M.seed + '/scoutbot', iters: o.iters || 2500, restarts: o.restarts || 2, starts: [M.defA] });
  return r.lu;
}
// fixer bot: starts from the default and takes the first-play hint until there is none (a casual player)
function fixer(M) {
  let lu = M.defA.slice();
  for (let i = 0; i < 8; i++) { const h = DM.hint(M, lu); if (!h) break; lu = h.lu; }
  return lu;
}
// random tapper: 8 random legal taps from the default
function random(M, seed) { const R = GK.rng.make(seed); let lu = M.defA.slice(); for (let i = 0; i < 8; i++) { const t = DM.taps(lu); lu = R.pick(t).lu; } return lu; }
module.exports = { scout, fixer, random, assumedOpp };
