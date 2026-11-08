// debug one contested steal race frame-by-frame
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { BTN } = MBD;
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [9, 9, 2, 3, 4] });
st.scene = 'GAME'; MBD.startHalf(st);
st.half = 1; MBD.startHalf(st);
st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; st.phaseT = 0; MBD.newPA(st);
for (let f = 0; f < 50; f++) MBD.tick(st, mkPads());
const p = mkPads(); p[0].pressed = BTN.A; p[0].held = BTN.A | BTN.UP;
MBD.tick(st, p);
const r = st.runners.find(x => x.stealing);
console.log('stealer spd', r.player.ratings.spd, 'toBase', r.toBase);
let log = 0;
for (let f = 0; f < 400 && st.runners.includes(r); f++) {
  MBD.tick(st, mkPads());
  const b = st.ball;
  const h = b.heldBy >= 0 ? st.fielders[b.heldBy] : null;
  if (st.phase === 'LIVE' && h && log++ % 5 === 0) {
    const d = Math.hypot((h.xS >> 8) - (r.xS >> 8), (h.yS >> 8) - (r.yS >> 8));
    console.log(`f${f} phase ${st.phase} holder ${h.posId}@(${(h.xS >> 8)},${(h.yS >> 8)}) runner@(${(r.xS >> 8)},${(r.yS >> 8)}) d ${d.toFixed(0)} rstate ${r.state} playTimer ${st.playTimer}`);
  }
  for (const e of st.events) if (['throw', 'catchpop', 'stolen', 'call:out', 'playDead'].includes(e.type))
    console.log(`  f${f} EV ${e.type}`, e.data ? JSON.stringify(e.data) : '');
  st.events.length = 0;
}
console.log('final runner state:', r.state, 'outs', st.outs);
