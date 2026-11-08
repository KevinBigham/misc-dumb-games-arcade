// probe: instrument CPU steal races — positions, margins, outcomes
// [v0.7] attribution repair (documented reason for changing this instrument):
// the v0.6 probe left `cur` open when a race ended with NO resolution event —
// a foul recalling the thief, or the play dying with him mid-flight — so a
// LATER, unrelated out closed the record ("races" with totals of 5000f+, all
// counted caught). That inflated caughtRate to ~39-43%. Now a race only
// closes on its own resolution ('stolen', or a tag-kind 'call:out' while the
// race is open); 'call:foul' and 'playDead' VOID an unresolved race. Voids
// are reported separately and the caught rate carries a binomial 95% CI.
import { loadGame } from './load.mjs';
const MBD = loadGame();
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
let races = [], voided = { foul: 0, playDead: 0 };
// sample count: default 12 (fast gate-friendly); pass e.g. `node probe_steal.mjs 36`
// for a heavier balance audit. Seeds are stable, so a given N is reproducible.
const GAMES = Math.max(1, parseInt(process.argv[2], 10) || 12);
for (let g = 0; g < GAMES; g++) {
  const st = MBD.newGame({ demo: true, scene: 'GAME', seed: [g + 1, 7, 3, 5, 11] });
  st.scene = 'GAME'; MBD.startHalf(st);
  let cur = null, guard = 0;
  while (!st.gameOver && guard++ < 120000) {
    MBD.tick(st, mkPads());
    for (const e of st.events) {
      if (e.type === 'steal') { const r = st.runners.find(x => x.stealing); cur = { from: e.data.from, spd: r ? r.player.ratings.spd : -1, t0: st.frame, contested: false }; }
      if (e.type === 'throw' && cur && cur.T === undefined) {
        cur.T = st.ball.throwT; cur.framesToThrow = st.frame - cur.t0; cur.contested = true;
      }
      if (e.type === 'stolen' && cur) { cur.out = 'safe'; cur.frames = st.frame - cur.t0; races.push(cur); cur = null; }
      else if (e.type === 'call:out' && cur && e.data && e.data.kind === 'tag') { cur.out = 'out'; cur.frames = st.frame - cur.t0; races.push(cur); cur = null; }
      else if (e.type === 'call:foul' && cur) { voided.foul++; cur = null; }        // foul recalls the thief — no race
      else if (e.type === 'playDead' && cur) { voided.playDead++; cur = null; }     // play died with the race unresolved
    }
    st.events.length = 0;
  }
}
const safe = races.filter(r => r.out === 'safe').length;
const caught = races.length - safe;
const n = Math.max(1, races.length);
const p = caught / n, se = Math.sqrt(p * (1 - p) / n);
const lo = Math.max(0, p - 1.96 * se), hi = Math.min(1, p + 1.96 * se);
const contested = races.filter(r => r.contested);
const cCaught = contested.filter(r => r.out === 'out').length;
console.log('races:', races.length, 'safe:', safe, 'caught:', caught,
  'caughtRate:', (p * 100).toFixed(0) + '%', `(95% CI ${(lo * 100).toFixed(0)}-${(hi * 100).toFixed(0)}%)`);
console.log('contested (throw-down):', contested.length, 'of', races.length,
  '· caught-if-contested:', contested.length ? (100 * cCaught / contested.length).toFixed(0) + '%' : '-',
  '· voided: foul', voided.foul, '/ playDead', voided.playDead);
for (const r of races.slice(0, 14)) console.log(`  spd ${r.spd}  jump→throw ${r.framesToThrow ?? '-'}f  throwT ${r.T ?? '-'}  total ${r.frames}f  ${r.out}`);
