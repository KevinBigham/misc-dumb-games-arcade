// Pure-rules tests: determinism, invariants, exploits, saves, every terminal outcome.
import { loadCore, playRun } from './core.mjs';
const L = loadCore(); const CF = L.CONFIG, C = CF.COLS, R = CF.ROWS;
const out = []; let fails = 0;
const check = (name, cond, extra = '') => { out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`); if (!cond) fails++; };
const run = (s, acts) => { for (const a of acts) s = L.step(s, a).s; return s; };
const tickUntil = (s, pred, max = 5000, a = { type: 'tick', dt: 50 }) => { let i = 0; while (!pred(s) && i++ < max) s = L.step(s, a).s; return [s, i]; };

// 1 determinism
{ const script = []; for (let i = 0; i < 400; i++) script.push([{ type: 'left' }, { type: 'rotate' }, { type: 'right' }, { type: 'hard' }, { type: 'tick', dt: 33 }][i % 5]);
  const a = run(L.newGame('det', 'classic'), script), b = run(L.newGame('det', 'classic'), script);
  check('same seed + same inputs = same state', JSON.stringify(a) === JSON.stringify(b));
  const c = run(L.newGame('det2', 'classic'), script); check('different seed differs', JSON.stringify(a) !== JSON.stringify(c)); }

// 2 bag fairness: 50/30/20 and 7-bag
{ let s = L.newGame('bag', 'classic'); const cats = { 1: 0, 2: 0, 3: 0 }, shapes = {};
  for (let i = 0; i < 700; i++) { cats[s.piece.cat]++; shapes[s.piece.k] = (shapes[s.piece.k] || 0) + 1; s = L.step(s, { type: 'hard' }).s; if (s.phase !== 'play') s = L.newGame('bag' + i, 'classic'); }
  check('category mix near 50/30/20', Math.abs(cats[1] / 700 - 0.5) < 0.06 && Math.abs(cats[3] / 700 - 0.2) < 0.06, JSON.stringify(cats)); }

// 3 idle player: no soft lock, the run must end by itself
{ let [s, n] = tickUntil(L.newGame('idle', 'classic'), s => s.phase === 'over', 200000, { type: 'tick', dt: 100 });
  check('idle play tops out (no stall)', s.phase === 'over' && s.over === 'topout', `${n} ticks, pieces ${s.pieces}`);
  check('idle play earns nothing', L.netWorth(s) <= 0, 'nw ' + L.netWorth(s)); }

// 4 lock-delay reset cap: spamming rotate/move on the floor cannot hold a piece forever
{ let s = L.newGame('lock', 'classic'); s = L.step(s, { type: 'hard' }).s; // first piece done
  for (let i = 0; i < 30; i++) s = L.step(s, { type: 'soft' }).s;
  let [s2] = tickUntil(s, x => L.collides(x, { ...x.piece, y: x.piece.y + 1 }), 500, { type: 'soft' });
  const pieces0 = s2.pieces; let i = 0;
  while (s2.pieces === pieces0 && i < 2000) { s2 = L.step(s2, { type: i % 2 ? 'rotate' : (i % 4 ? 'left' : 'right') }).s; s2 = L.step(s2, { type: 'tick', dt: 60 }).s; i++; }
  check('stalling on the floor still locks', s2.pieces > pieces0, `${i} loops (~${Math.round(i * 60)}ms)`); }

// 5 card rules
{ let s = L.newGame('card', 'classic');
  check('card locked in month 1', L.chargeBlockReason(s) === 'locked');
  s.month = 2; while (s.piece.cat === 3) s = L.step(s, { type: 'hard' }).s;
  const d0 = s.debt, cost = s.piece.cost; s = L.step(s, { type: 'charge' }).s;
  check('charge adds the block cost to debt', s.debt === d0 + cost, `${d0}->${s.debt}`);
  const d1 = s.debt; s = L.step(s, { type: 'charge' }).s;
  check('cannot charge twice before placing a block', s.debt === d1);
  // savings piece cannot be charged
  let s3 = L.newGame('card3', 'classic'); s3.month = 2; let g = 0; while (s3.piece.cat !== 3 && g++ < 200) s3 = L.step(s3, { type: 'hard' }).s;
  if (s3.piece && s3.piece.cat === 3) { const d = s3.debt; s3 = L.step(s3, { type: 'charge' }).s; check('savings blocks cannot be charged', s3.debt === d); }
  // farming: charge-skip forever cannot raise net worth
  let s4 = L.newGame('farm', 'classic'); s4.month = 2; let worst = 0;
  for (let i = 0; i < 300 && s4.phase === 'play'; i++) { s4 = L.step(s4, { type: 'charge' }).s; s4 = L.step(s4, { type: 'hard' }).s; worst = Math.max(worst, L.netWorth(s4)); }
  check('charge+drop spam never raises net worth', worst <= 0, 'max nw ' + worst); }

// 6 row scoring: perfect budget + balanced + combo
{ let s = L.newGame('perf', 'classic'); s.board.fill(0);
  const y = R - 1; const row = [1, 1, 1, 1, 1, 2, 2, 2, 3, 0]; row.forEach((v, x) => s.board[y * C + x] = v);
  // vertical I piece into column 9: put an I rotated
  s.piece = { k: 0, r: 1, x: 7, y: 0, cat: 3, label: 'Savings', cost: 0, imp: false }; // r1 of I occupies column x+2
  const cx = L.cells(s.piece).map(c => c[0]); check('test setup: vertical I in column 9', cx.every(v => v === 9), cx.join());
  const sv0 = s.savings; const r = L.step(s, { type: 'hard' }); const e = r.ev.find(e => e.t === 'clear');
  check('perfect 5/3/2 row detected', e && e.rowInfo[0].perf && e.rowInfo[0].bal, JSON.stringify(e && e.rowInfo[0]));
  check('perfect row pays cells + bonuses', r.s.savings - sv0 === 2 * CF.SAVE_CELL + CF.BALANCED_BONUS + CF.PERFECT_BONUS, 'got ' + (r.s.savings - sv0)); }

// 7 emergencies: covered by savings vs charged with a junk row
{ let s = L.newGame('em', 'classic'); s.month = 3; s.savings = 1000; s.emerg = [s.piecesMonth + 1];
  let r = L.step(s, { type: 'hard' }); let e = r.ev.find(e => e.t === 'emergency');
  check('emergency paid from savings when it can', e && e.rest === 0 && r.s.savings === 1000 - e.cost && r.s.debt === 0, e && `${e.label} $${e.cost}`);
  s = L.newGame('em2', 'classic'); s.month = 3; s.savings = 10; s.emerg = [1];
  r = L.step(s, { type: 'hard' }); e = r.ev.find(e => e.t === 'emergency');
  const junk = r.s.board.filter(v => v === 5).length;
  check('emergency without savings: rest charged + junk row', e && e.rest === e.cost - 10 && r.s.savings === 0 && junk === C - 1, `rest ${e && e.rest}, junk cells ${junk}`); }

// 8 joy -> impulse buy
{ let s = L.newGame('joy', 'classic'); s.joy = 3; const d = s.debt; const r = L.step(s, { type: 'hard' });
  const imp = r.ev.some(e => e.t === 'impulse');
  check('joy at zero triggers an impulse buy', imp && r.s.piece.imp && r.s.debt === d + CF.IMPULSE_COST && r.s.joy === CF.JOY_AFTER_IMPULSE, r.s.piece && r.s.piece.label);
  const r2 = L.step(r.s, { type: 'charge' }); check('impulse piece cannot be charged again', r2.s.debt === r.s.debt); }

// 9 payday: interest once, pay card once, reload cannot double-apply
{ let s = L.newGame('pay', 'classic'); s.savings = 1000; s.debt = 400; s.rowsGoal = 1;
  s.board.fill(0); for (let x = 0; x < 9; x++) s.board[(R - 1) * C + x] = 1;
  s.piece = { k: 0, r: 1, x: 7, y: 0, cat: 1, label: 'Rent', cost: 90, imp: false };
  let r = L.step(s, { type: 'hard' });
  check('full row pays -> payday', r.s.phase === 'payday');
  check('interest applied at payday', r.s.savings === 1050 && r.s.debt === 460, `${r.s.savings}/${r.s.debt}`);
  const reloaded = L.validate(JSON.parse(JSON.stringify(r.s)));
  check('payday save reloads in payday without reapplying interest', reloaded && reloaded.phase === 'payday' && reloaded.savings === 1050 && reloaded.debt === 460);
  let p = L.step(r.s, { type: 'payCard' }).s; p = L.step(p, { type: 'payCard' }).s;
  check('pay card from savings applies once', p.savings === 590 && p.debt === 0 && p.log.paidCard === 460, `${p.savings}/${p.debt}`);
  const t = L.step(p, { type: 'tick', dt: 50 }).s; check('no ticks during payday', t.phase === 'payday');
  const m = L.step(p, { type: 'startMonth' }).s; check('start month advances once', m.month === 2 && m.phase === 'play');
  const m2 = L.step(m, { type: 'startMonth' }).s; check('startMonth ignored mid-month', m2.month === 2); }

// 10 debt rows at month start + game over by debt
{ let s = L.newGame('debt', 'classic'); s.phase = 'payday'; s.piece = null; s.debt = 450;
  const m = L.step(s, { type: 'startMonth' }).s; const debtCells = m.board.filter(v => v === 4).length;
  check('card balance adds ceil(debt/200) red rows', debtCells === 3 * (C - 1), 'cells ' + debtCells);
  let b = L.newGame('debt2', 'classic'); b.phase = 'payday'; b.piece = null; b.debt = 5000; for (let i = 0; i < C * R; i++) if (Math.floor(i / C) >= 3) b.board[i] = (i % C === 0) ? 0 : 1;
  const mb = L.step(b, { type: 'startMonth' }).s; check('debt rows can bury you', mb.phase === 'over' && mb.over === 'debt', mb.over); }

// 11 saves: corrupt inputs are rejected; valid round trip is exact
{ const good = L.newGame('save', 'classic'); const rt = L.validate(JSON.parse(JSON.stringify(good)));
  check('valid save round-trips', rt && JSON.stringify(rt.board) === JSON.stringify(good.board) && rt.piece.k === good.piece.k && rt.rng === good.rng);
  const bads = { null: null, str: 'hello', wrongVersion: { ...good, v: 99 }, shortBoard: { ...good, board: [1, 2] }, badCell: { ...good, board: good.board.map((v, i) => i === 5 ? 9 : v) },
    nanMoney: { ...good, savings: NaN }, negDebt: { ...good, debt: -5 }, overlap: { ...good, board: good.board.map(() => 1) }, noPiece: { ...good, piece: null },
    badNext: { ...good, next: [{ k: 99 }] }, overSave: { ...good, phase: 'over' }, hugeLabel: { ...good, piece: { ...good.piece, label: 'x'.repeat(500) } } };
  const accepted = Object.entries(bads).filter(([k, v]) => L.validate(JSON.parse(JSON.stringify(v))) !== null).map(([k]) => k);
  check('corrupt saves rejected', accepted.length === 0, accepted.join(',') || 'all 12 rejected');
  const jsonNaN = JSON.parse(JSON.stringify({ ...good, savings: NaN })); check('NaN survives JSON as null and is rejected', L.validate(jsonNaN) === null); }

// 12 full bot runs: invariants every step, wins and losses both reachable
{ const inv = []; const check1 = s => {
    if (!s.board.every(v => Number.isInteger(v) && v >= 0 && v <= 5)) inv.push('cell');
    if (!(Number.isFinite(s.savings) && Number.isFinite(s.debt) && s.savings >= 0 && s.debt >= 0)) inv.push('money ' + s.savings + '/' + s.debt);
    if (s.joy < 0 || s.joy > CF.JOY_MAX) inv.push('joy');
    if (s.phase === 'play' && (!s.piece || L.collides(s, s.piece))) inv.push('piece');
    if (s.phase !== 'play' && s.piece) inv.push('stray piece'); };
  const res = { A: [], B: [] };
  for (let i = 0; i < 24; i++) {
    res.A.push(playRun(L, 'A' + i, { check: check1 }).s);
    res.B.push(playRun(L, 'A' + i, { check: check1, charge: true, chargeBelow: -14, payCard: false }).s);
  }
  check('no invariant breaks in 48 bot runs', inv.length === 0, [...new Set(inv)].slice(0, 5).join(';'));
  const sum = arr => { const won = arr.filter(s => s.over === 'finished').length; const nw = arr.map(L.netWorth).sort((a, b) => a - b); const mo = arr.map(s => s.month).sort((a, b) => a - b);
    return { won, medNW: nw[nw.length >> 1], minNW: nw[0], maxNW: nw[nw.length - 1], medMonth: mo[mo.length >> 1], minMonth: mo[0] }; };
  const A = sum(res.A), B = sum(res.B);
  out.push('INFO saver bot (no charging, pays card): ' + JSON.stringify(A));
  out.push('INFO charger bot (charges bad fits, never pays card): ' + JSON.stringify(B));
  check('a careful bot can finish the year', A.won > 0);
  check('runs can also be lost', res.A.concat(res.B).some(s => s.over !== 'finished'));
  check('saver bot beats charger bot on median net worth', A.medNW > B.medNW, `${A.medNW} vs ${B.medNW}`);
  const nwA = res.A.filter(s => s.over === 'finished').map(L.netWorth); out.push('INFO saver finishers net worth: ' + nwA.join(', '));
}
// 13 endless mode keeps going and money stays finite
{ const r = playRun(L, 'endless', { maxMonths: 40 }); check('endless months stay finite', Number.isFinite(r.s.savings) && Number.isFinite(r.s.debt), `month ${r.s.month}, nw ${L.netWorth(r.s)}, over ${r.s.over}`); }


// 14 budget plans: gated by month, change the bag, survive save/load; new pieces spawn fully visible
{ let s = L.newGame('plan', 'classic'); s.phase = 'payday'; s.piece = null;
  check('plan cannot change mid-month', L.step(L.newGame('p2', 'classic'), { type: 'plan', id: 'saver' }).s.plan === 'balanced');
  check('super saver locked before month 4', L.step(s, { type: 'plan', id: 'super' }).s.plan === 'balanced');
  s = L.step(s, { type: 'plan', id: 'super' === 'x' ? 'x' : 'saver' }).s; check('saver plan picked at payday', s.plan === 'saver' && s.cbag.length === 0);
  s = L.step(s, { type: 'startMonth' }).s; const cats = { 1: 0, 2: 0, 3: 0 };
  for (let i = 0; i < 400; i++) { if (s.phase !== 'play') { s.phase = 'play'; } if (!s.piece.imp) cats[s.piece.cat]++; s.board.fill(0); s.joy = 90; s = L.step(s, { type: 'hard' }).s; if (s.phase === 'payday') { s = L.step(s, { type: 'startMonth' }).s; } }
  check('saver bag is about 50/20/30', Math.abs(cats[3] / 400 - 0.3) < 0.06 && Math.abs(cats[2] / 400 - 0.2) < 0.06, JSON.stringify(cats));
  const v = L.validate(JSON.parse(JSON.stringify(s))); check('plan survives save/load', v && v.plan === 'saver');
  const bad = L.validate(JSON.parse(JSON.stringify({ ...s, plan: 'hack' }))); check('unknown plan falls back to balanced', bad && bad.plan === 'balanced');
  let ok = true; for (let i = 0; i < 50; i++) { const g = L.newGame('vis' + i, 'classic'); if (!L.cells(g.piece).every(([x, y]) => y >= CF.HIDDEN)) ok = false; }
  check('new pieces spawn fully visible', ok);
  const relaxed = { ...L.newGame('m', 'classic'), joy: 90 }, stressed = { ...relaxed, joy: 10 };
  check('Joy changes fall speed', L.speed(relaxed) > L.speed(stressed), `${L.speed(relaxed)}ms vs ${L.speed(stressed)}ms`); }

console.log(out.join('\n')); console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
