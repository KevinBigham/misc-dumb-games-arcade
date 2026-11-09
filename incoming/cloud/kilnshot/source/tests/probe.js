// Spray probe: crack one pot directly with a given hitter velocity and see what the spill breaks.
// usage: node probe.js L08 0
const { load } = require('./lib.js'); const K = load();
const [id, pi] = [process.argv[2], +process.argv[3] || 0];
const lvl = K.LEVELS.find(l => l.id === id);
const rows = [];
for (let hx = -800; hx <= 800; hx += 200) {
  let line = String(hx).padStart(5) + ' |';
  for (let hy = -800; hy <= 800; hy += 200) {
    const w = K.makeWorld(lvl); const p = w.pots[pi];
    w.inShot = true; w.shotT = 0;
    w.breakQueue.push({ p, hvx: hx, hvy: hy, off: false }); p.breaking = true;
    let g = 0; const s0 = K.secondsLeft(w);
    while (!K.shotOver(w) && g++ < 5000) { K.step(w); w.events.length = 0; }
    line += (w.keeperBroken ? ' K' : ' ' + (s0 - K.secondsLeft(w))).padStart(3);
  }
  rows.push(line);
}
console.log('hitter vx rows, vy cols -800..800 step 200; cell = seconds broken (incl. the jar), K = keeper broke');
console.log(rows.join('\n'));
