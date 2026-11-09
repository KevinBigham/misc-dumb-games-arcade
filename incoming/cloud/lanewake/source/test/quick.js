const H = require('./harness'); const LW = H.loadLW();
for (const ev of LW.EVENTS) {
  const rows = [];
  for (const [name, bot] of [['perfect', () => H.rhythmBot({ sd: 0.0, flipErr: 0 })], ['good', () => H.rhythmBot({ sd: 0.03 })], ['human', () => H.rhythmBot({ sd: 0.06, flipErr: 0.35, seed: 11 })], ['nopush', () => H.rhythmBot({ sd: 0.03, push: false })], ['allpush', () => H.rhythmBot({ sd: 0.03, pushAt: 0 })], ['masher', () => H.masherBot()], ['idle', () => H.idleBot()]]) {
    const r = H.runRace(LW, { event: ev, seed: 42, tier: 3 }, bot());
    const p = r.p; rows.push(name + ':' + (p.finish ?? p.phase) + (p.log.bonkAt != null ? '(bonk@' + p.log.bonkAt + ')' : '') + ' tank' + p.log.tankMin.toFixed(0));
  }
  console.log(ev.padEnd(10), rows.join('  '));
}
