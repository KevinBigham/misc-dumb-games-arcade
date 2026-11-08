// probe: why don't runs score? trace hits with runner advancement + every run
import { loadGame } from './load.mjs';
const MBD = loadGame();
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
const st = MBD.newGame({ demo: true, scene: 'GAME', seed: [3, 7, 1, 9, 2] });
st.scene = 'GAME'; MBD.startHalf(st);
let guard = 0, lastBases = '';
while (!st.gameOver && guard++ < 120000) {
  MBD.tick(st, mkPads());
  for (const e of st.events) {
    if (e.type === 'playDead' && e.data.result && ['1B', '2B', '3B', 'HR', 'E'].includes(e.data.result)) {
      console.log(`${st.half ? 'BOT' : 'TOP'}${st.inning} ${e.data.result}  bases-were ${lastBases || '---'}  score ${st.score}`);
    }
    if (e.type === 'run') console.log(`   >>> RUN scored (${st.score}) bases-were ${lastBases || '---'}`);
    if (e.type === 'out' || e.type === 'call:out') console.log(`   out: ${e.data && e.data.kind}`);
  }
  lastBases = [1, 2, 3].map(i => st.bases[i] ? 'X' : '-').join('');
  st.events.length = 0;
}
console.log('final', st.score);
