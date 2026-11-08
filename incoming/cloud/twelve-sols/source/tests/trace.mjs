import { loadCore, smartBot, play, makeRng } from './lib.mjs';
const T = loadCore();
const m = T.newMeta(); m.known = T.DATA.RECIPES.map(r => r.id);
const strat = process.argv[3] || 'turtle';
const res = play(T, smartBot(T, makeRng(5), { strategy: strat, explore: false }), { seed: process.argv[2] || 'tr1', meta: m,
  onStep: (s, mm, a, out) => console.log('S' + s.sol + ' h' + s.hour, JSON.stringify(s.needs), 'hull', s.hull, '|', JSON.stringify(a), out.fx.map(f => f.k + (f.why ? ':' + f.why : '')).join(','), '| inv', JSON.stringify(out.s.inv), JSON.stringify(out.s.builds)) });
console.log(res.s.result);
