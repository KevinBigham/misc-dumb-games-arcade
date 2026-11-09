// A "decent human" bot: mostly reads right, slower and messier execution. Run: node test/humanish.cjs [n] [iron]
const C = require('../src/core.js'); const B = require('./bots.cjs');
const human = {
  call: (s, R, o) => { const d = B.BOTS.smart.call(s, R, o); if (d.play && R() < 0.3) { const L = C.legalPlays(s); d.play = L[Math.floor(R() * L.length)]; } return d; },
  input: (s, P, R, mem) => {
    if (mem.tt === undefined) { mem.tt = 0.8 + R() * 1.0; mem.sloppy = R() < 0.3; }
    const qb = P.E[P.ix.QB]; const car = C.carrierOf(P);
    if (P.kind === 'pass' && car === qb && !P.thrown && !P.scramble) {
      if (P.t < mem.tt) return {};
      const i = B.BOTS.smart.input(s, P, R, {}); const k = mem.sloppy ? ['X', 'Y', 'Z', 'RB'][Math.floor(R() * 4)] : (i.throwTo || 'X');
      return { throwTo: k };
    }
    if (car && car !== qb || (car === qb && P.scramble)) { const i = B.BOTS.smart.input(s, P, R, mem); if (R() < 0.5) delete i.juke; if (R() < 0.4) i.steer = { x: 0, y: 1 }; return i; }
    return {};
  },
  def: (s, R) => R() < 0.7 ? B.BOTS.smart.def(s, R) : B.BOTS.random.def(s, R),
};
const n = +process.argv[2] || 40; const iron = process.argv[3] === 'iron'; const rows = [];
for (const t of C.TEAMS) { let w = 0, pf = 0, pa = 0; for (let i = 1; i <= n; i++) { const r = B.playGame(i * 71 + 3, t.id, human, { iron, flea: iron }); w += r.res === 'W'; pf += r.me; pa += r.op; } rows.push({ team: t.id, iron, win: +(w / n).toFixed(2), pf: +(pf / n).toFixed(1), pa: +(pa / n).toFixed(1) }); }
console.table(rows);
module.exports = { human };
