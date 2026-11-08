// v0.3 outcome-mix audit: N CPU games → per-game K/BB/HBP/runs/hits/steals/outs mix
// [v0.7] per-game variance block added (documented reason): the roadmap asked
// for a larger-sample balance audit "with variance" — small-N band misses
// (e.g. BB 0.63 at 8 games vs 1.22 at 36) needed the per-game sd to be read
// as noise vs signal. Output above the variance block is unchanged.
import { loadGame } from './load.mjs';
const MBD = loadGame();
const N = +(process.argv[2] || 20);
const agg = { runs: 0, games: 0, ev: {}, res: {}, longest: 0 };
const perGame = [];   // per-game counters for the variance block
for (let g = 0; g < N; g++) {
  const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [g + 1, 2, 3, 4, 5] });
  st.scene = 'GAME'; MBD.startHalf(st);
  const empty = [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }];
  let guard = 0;
  const pg = { K: 0, BB: 0, HBP: 0, runs: 0, steal: 0, stolen: 0 };
  while (st.scene !== 'FINAL' && guard++ < 250000) {
    MBD.tick(st, empty);
    for (const e of st.events) {
      agg.ev[e.type] = (agg.ev[e.type] || 0) + 1;
      if (e.type === 'call:strikeout') pg.K++;
      if (e.type === 'call:walk') pg.BB++;
      if (e.type === 'call:hbp') pg.HBP++;
      if (e.type === 'steal') pg.steal++;
      if (e.type === 'stolen') pg.stolen++;
      if (e.type === 'playDead' && e.data) agg.res[e.data.result || 'none'] = (agg.res[e.data.result || 'none'] || 0) + 1;
    }
    st.events.length = 0;
  }
  if (guard >= 250000) console.log('GAME', g, 'DID NOT FINISH', st.scene, st.inning, st.half, st.phase, st.ball.mode);
  pg.runs = st.score[0] + st.score[1];
  perGame.push(pg);
  agg.runs += pg.runs; agg.games++;
  agg.longest = Math.max(agg.longest, st.frame);
}
const per = (k) => +((agg.ev[k] || 0) / agg.games).toFixed(2);
console.log(`── ${N} CPU games ──`);
console.log('runs/game(total):', (agg.runs / agg.games).toFixed(2), '· longest', (agg.longest / 60.1 / 60).toFixed(1), 'min');
console.log('K:', per('call:strikeout'), ' BB:', per('call:walk'), ' HBP:', per('call:hbp'), ' pitches:', per('release'));
console.log('swings:', per('swing'), ' contacts:', per('crack'), ' contact%:', Math.round(100 * (agg.ev.crack || 0) / (agg.ev.swing || 1)));
console.log('steals:', per('steal'), ' stolen(safe):', per('stolen'), ' pickoffThrows:', per('pickoff'), ' fouls:', per('call:foul'));
console.log('HR:', per('hr'), ' wall:', per('wall'), ' grd:', per('grd'), ' flyouts:', per('flyout'), ' forceTag outs:', per('call:out'), ' errors:', per('error'));
console.log('PA results/game:', Object.fromEntries(Object.entries(agg.res).map(([k, v]) => [k, +(v / agg.games).toFixed(2)])));
// variance block: mean ± per-game sd, and the standard error an 8-game audit
// of this metric would carry (band misses within ~2 se are sample noise)
const stats = (key) => {
  const xs = perGame.map(p => p[key]);
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, xs.length - 1));
  return `${m.toFixed(2)} ± ${sd.toFixed(2)} (se@8g ${(sd / Math.sqrt(8)).toFixed(2)})`;
};
console.log('variance —', 'runs:', stats('runs'), '· K:', stats('K'), '· BB:', stats('BB'), '· HBP:', stats('HBP'), '· stealAtt:', stats('steal'), '· stolen:', stats('stolen'));
