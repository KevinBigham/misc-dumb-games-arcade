// probe: does a thrown ball ever travel? scripted OF pickup → throw to 1B
import { loadGame } from './load.mjs';
const MBD = loadGame();
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [5, 5, 5, 5, 5] });
st.scene = 'GAME'; MBD.startHalf(st);
st.half = 1; MBD.startHalf(st);          // bottom: human bats, CPU fields
// force into LIVE with a fake held ball by the CF (slot 7)
const b = st.ball;
st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
const cf = st.fielders[7];
b.mode = 'held'; b.heldBy = 7; b.batted = true; st.chaser = 7; st.heldTimer = 0; st.playTimer = 0;
// batter-runner running to 1B (forced)
const br = MBD.makeRunner(st, st.batter.player, 0); br.forced = true;
console.log('thrower', cf.posId, 'at', cf.xS >> 8, cf.yS >> 8, '1B bag at', MBD.GEO.bases[1].x, MBD.GEO.bases[1].y);
// make the CPU throw: step until a throw event
for (let f = 0; f < 200; f++) {
  MBD.tick(st, mkPads());
  for (const e of st.events) {
    if (e.type === 'throw') console.log(`f${f} THROW T=${e.data.T} from (${b.xS >> 8},${b.yS >> 8}) mode ${b.mode} heldBy ${b.heldBy}`);
    if (e.type === 'catchpop') console.log(`f${f} CATCHPOP at (${b.xS >> 8},${b.yS >> 8}) heldBy ${b.heldBy}`);
    if (e.type === 'call:out') console.log(`f${f} OUT ${JSON.stringify(e.data)}`);
  }
  st.events.length = 0;
  if (st.phase !== 'LIVE') { console.log(`f${f} phase -> ${st.phase}`); break; }
}
