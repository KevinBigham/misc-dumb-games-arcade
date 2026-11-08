// Balance harness: win rates for several bot styles across fixed seeds.
import { loadCore, smartBot, passiveBot, randomBot, play, makeRng } from './lib.mjs';
const T = loadCore();
const N = +(process.argv[2] || 200);
const allKnown = () => { const m = T.newMeta(); m.known = T.DATA.RECIPES.map(r => r.id); return m; };

function run(label, mkBot, mkMeta) {
  let wins = 0, sols = 0, steps = 0; const causes = {}; let early = 0; let maxScore = 0;
  for (let i = 0; i < N; i++) {
    const r = makeRng(1000 + i);
    const res = play(T, mkBot(r), { seed: 'bal' + i, meta: mkMeta() });
    if (res.s.result.win) { wins++; if (res.s.rescueSol < 12) early++; } else causes[res.s.result.cause] = (causes[res.s.result.cause] || 0) + 1;
    sols += res.s.result.win ? res.s.rescueSol : res.s.sol - 1; steps += res.steps; maxScore = Math.max(maxScore, res.s.result.score);
  }
  console.log(label.padEnd(26), 'win', (100 * wins / N).toFixed(0) + '%', ' early', early, ' avgSols', (sols / N).toFixed(1), ' avgActions', (steps / N).toFixed(0), ' maxScore', maxScore, ' causes', JSON.stringify(causes));
}
run('passive', () => passiveBot(), () => T.newMeta());
run('random', r => randomBot(T, r), () => T.newMeta());
run('expert turtle', r => smartBot(T, r, { strategy: 'turtle', explore: false }), allKnown);
run('expert beacon', r => smartBot(T, r, { strategy: 'beacon', explore: false }), allKnown);
run('first-run novice', r => smartBot(T, r, { strategy: 'turtle', explore: true }), () => T.newMeta());

for (let L = 1; L < T.CONFIG.LEVELS.length; L++) {
  run('expert turtle L' + L, r => smartBot(T, r, { strategy: 'turtle', explore: false }), () => { const m = allKnown(); m.unlocked = L; return m; });
  run('expert beacon L' + L, r => smartBot(T, r, { strategy: 'beacon', explore: false }), () => { const m = allKnown(); m.unlocked = L; return m; });
}
// learning curve: one novice keeps its journal across 8 runs
const curve = [];
for (let trial = 0; trial < 40; trial++) {
  let m = T.newMeta(); const r = makeRng(77 + trial);
  for (let k = 0; k < 8; k++) {
    const res = play(T, smartBot(T, r, { strategy: k >= 3 ? 'beacon' : 'turtle', explore: true }), { seed: 'lc' + trial + '-' + k, meta: m });
    m = res.meta; curve[k] = curve[k] || { w: 0, known: 0 };
    if (res.s.result.win) curve[k].w++; curve[k].known += m.known.length;
  }
}
console.log('learning curve (run#: win% / recipes known):', curve.map((c, k) => (k + 1) + ':' + Math.round(100 * c.w / 40) + '%/' + (c.known / 40).toFixed(1)).join('  '));
