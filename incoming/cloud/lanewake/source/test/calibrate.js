// Reference ("par") swimmer = rhythm bot, 30 ms timing noise, sensible pacing. Prints PAR to paste into rules.js.
const H = require('./harness'); const LW = H.loadLW();
const pushFor = d => d === 50 ? 0 : d === 100 ? 0.3 : 0.55;
const out = {};
for (const ev of LW.EVENTS) {
  const e = LW.parseEvent(ev); let s = 0, n = 6;
  for (let k = 0; k < n; k++) s += H.runRace(LW, { event: ev, seed: 100 + k, tier: 3 }, H.rhythmBot({ sd: 0.03, seed: 50 + k, pushAt: pushFor(e.dist) })).p.finish;
  out[ev] = +(s / n).toFixed(1);
}
console.log(JSON.stringify(out));
