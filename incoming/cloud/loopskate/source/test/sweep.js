// Trail fade sweep with the kit's balance harness: node test/sweep.js  (writes test/out/trail-sweep.csv)
const fs = require('fs'), path = require('path');
const bots = require('../../../kit/gk-bots.js'), B = require('./bots.js');
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
const res = bots.sweep({
  knob: 'TRAIL_LIFE', values: [2, 2.5, 3, 3.5, 4.5], seeds: 200,
  run: (p, seed) => { const W = B.run(seed, B.orbitBot({ seed: B.LS.hash(seed) % 1000, noise: 0.25, react: 0.15 }), { cfg: { TRAIL_LIFE: p.TRAIL_LIFE } }); return { score: W.score, waves: W.stats.waves, secs: Math.round(W.t), cuts: W.stats.cuts, water: W.cause === 'water' ? 1 : 0, maxLoop: W.stats.maxLoop }; },
  csv: path.join(__dirname, 'out', 'trail-sweep.csv')
});
res.summary.forEach(r => console.log('trail', r.TRAIL_LIFE, 's: waves', r.waves_mean, 'score', Math.round(r.score_mean), 'run', Math.round(r.secs_mean), 's, cuts', r.cuts_mean, 'water deaths', Math.round(r.water_mean * 100) + '%', 'best loop', r.maxLoop_mean));
