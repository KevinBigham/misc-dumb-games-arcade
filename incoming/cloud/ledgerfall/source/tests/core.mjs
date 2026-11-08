// Loads the DOM-free core script from ledgerfall.html into a Node vm.
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
export const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ledgerfall.html');
export function loadCore() {
  const html = fs.readFileSync(FILE, 'utf8');
  const m = html.match(/<script id="core">([\s\S]*?)<\/script>/);
  const ctx = { console }; ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(m[1], ctx);
  return ctx.Ledger;
}
// Heuristic bot: picks rotation+column by board shape (holes, height, bumpiness), with a few money habits.
export function makeBot(L, opts = {}) {
  const { COLS: C, ROWS: R } = L.CONFIG;
  function evalBoard(b, s) {
    const h = new Array(C).fill(0); let holes = 0;
    for (let x = 0; x < C; x++) { let seen = false; for (let y = 0; y < R; y++) { const v = b[y * C + x]; if (v && !seen) { seen = true; h[x] = R - y; } else if (!v && seen) holes++; } }
    let bump = 0; for (let x = 0; x < C - 1; x++) bump += Math.abs(h[x] - h[x + 1]);
    const agg = h.reduce((a, c) => a + c, 0), max = Math.max(...h);
    return -0.51 * agg - 0.36 * holes * 2 - 0.18 * bump - (max > R - 6 ? 3 * (max - (R - 6)) : 0);
  }
  function place(s, p) {
    const b = s.board.slice();
    for (const [x, y] of L.cells(p)) b[y * C + x] = p.imp ? 2 : p.cat;
    let lines = 0, gold = 0; const keep = [];
    for (let y = 0; y < R; y++) { let f = true; for (let x = 0; x < C; x++) if (!b[y * C + x]) f = false; if (f) { lines++; for (let x = 0; x < C; x++) if (b[y * C + x] === 3) gold++; } else keep.push(...b.slice(y * C, y * C + C)); }
    return { b: new Array(lines * C).fill(0).concat(keep), lines, gold };
  }
  function best(s) {
    let bestScore = -1e9, bestMove = null;
    for (let r = 0; r < 4; r++) for (let x = -3; x < C + 1; x++) {
      const p = { ...s.piece, r, x };
      if (L.collides(s, p)) continue;
      while (!L.collides(s, { ...p, y: p.y + 1 })) p.y++;
      const res = place(s, p);
      const sc = evalBoard(res.b, s) + 0.76 * res.lines * 2 + res.gold * 0.3;
      if (sc > bestScore) { bestScore = sc; bestMove = { r, x, score: sc }; }
    }
    return bestMove;
  }
  // returns list of actions for current piece
  return function decide(s) {
    if (s.phase === 'payday') {
      if (opts.payCard !== false && s.debt > 0 && s.savings > 0 && !s.log.paidCard) return [{ type: 'payCard' }];
      if (opts.plan && s.plan !== opts.plan && L.CONFIG.PLANS.find(p => p.id === opts.plan).unlock <= s.month + 1) return [{ type: 'plan', id: opts.plan }];
      return [{ type: 'startMonth' }];
    }
    if (s.phase !== 'play' || !s.piece) return [];
    const mv = best(s);
    if (opts.charge && L.chargeBlockReason(s) === '' && (!mv || mv.score < opts.chargeBelow)) return [{ type: 'charge' }];
    if (!mv) return [{ type: 'hard' }];
    const acts = [];
    for (let i = 0; i < mv.r; i++) acts.push({ type: 'rotate' });
    acts.push({ type: 'goto', x: mv.x });
    acts.push({ type: 'hard' });
    return acts;
  };
}
// Play a full run with the bot. Returns final state + trace info.
export function playRun(L, seed, opts = {}) {
  const decide = makeBot(L, opts);
  let s = L.newGame(seed, 'classic'); let guard = 0; const evCount = {};
  const maxMonths = opts.maxMonths || 12;
  while (s.phase !== 'over' && guard++ < 20000) {
    if (s.phase === 'payday' && s.month >= maxMonths && s.log.yearEnd) { s = L.step(s, { type: 'finish' }).s; break; }
    const acts = decide(s);
    for (const a of acts) {
      if (a.type === 'goto') {
        let n = 0; while (s.piece && s.piece.x !== a.x && n++ < 12) { const r = L.step(s, { type: s.piece.x < a.x ? 'right' : 'left' }); if (!r.ev.some(e => e.t === 'move')) break; s = r.s; }
        continue;
      }
      const r = L.step(s, a); s = r.s; for (const e of r.ev) evCount[e.t] = (evCount[e.t] || 0) + 1;
      if (opts.check) opts.check(s);
    }
    // a little gravity between pieces so tick paths are exercised
    if (s.phase === 'play') { const r = L.step(s, { type: 'tick', dt: 16 }); s = r.s; }
  }
  return { s, evCount, guard };
}
