// Headless bot harness for BLITZREAD. Run: node test/bots.cjs [games]
const path = require('path');
const C = require(path.join(__dirname, '..', 'src', 'core.js'));
const N = +process.argv[2] || 120;

function mk(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- smart reader ----------
function posterior(s) {
  const sc = C.scout(s); const d = sc.disguise;
  const w = C.DEFS.map((c, i) => (sc.pct[i] + 1) * (c === s.look ? 1 - d : d / 3));
  const t = w.reduce((a, b) => a + b, 0); return w.map(x => x / t);
}
function smartPace(s) {
  const diff = s.score.me - s.score.op;
  if (s.half === 2 && s.clock < 160) return diff > 0 ? 'milk' : diff < 0 ? 'hurry' : 'normal';
  if (s.half === 1 && s.clock < 50) return 'hurry';
  return 'normal';
}
function smartCall(s, R, opts) {
  s.pace = smartPace(s);
  const togo = s.ltg - s.los, diff = s.score.me - s.score.op;
  const late = s.half === 2 && s.clock < 120;
  if (C.canFG(s) && C.fgDist(s) <= 50) {
    if (s.down === 4 && !(late && diff < -3)) return { kick: 0.55 + R() * 0.45 };
    if (s.half === 1 && s.clock < 12) return { kick: 0.55 + R() * 0.45 };
    if (s.half === 2 && s.clock < 12 && diff >= -3) return { kick: 0.55 + R() * 0.45 };
    if (s.half === 3 && s.down >= 3 && diff >= -3 && diff <= 0) return { kick: 0.6 + R() * 0.4 };
  }
  if (s.down === 4 && C.canPunt(s)) {
    const go = (togo <= 2 && s.los >= 45) || (late && diff < 0) || (s.half === 2 && s.clock < 200 && diff < -7);
    if (!go) return { punt: true };
  }
  const post = posterior(s);
  let best = null, bv = -1e9;
  for (const p of C.legalPlays(s)) {
    if (opts && opts.only && p !== opts.only) continue;
    let v = 0; C.DEFS.forEach((c, i) => v += post[i] * C.MATCH[p][c]);
    v -= 0.45 * (s.heat[p] || 0);
    const kind = C.PLAYS[p].kind;
    if (togo >= 8 && kind === 'pass') v += 0.15;
    if (togo <= 2 && kind === 'run') v += 0.15;
    if (p === 'DEEP' && togo >= 12) v += 0.1;
    v += R() * 0.05;
    if (v > bv) { bv = v; best = p; }
  }
  return { play: best };
}
function smartInput(s, P, R, mem) {
  const inp = {}; const qb = P.E[P.ix.QB]; const car = C.carrierOf(P);
  if (P.kind === 'pass' && car === qb && !P.thrown && !P.scramble && P.t > 0.2 && (!P.fleaAt || P.fleaBack)) {
    let best = null, bs = -1e9;
    for (const k of ['X', 'Y', 'Z', 'RB']) {
      const r = P.E[P.ix[k]]; const A = C.aimFor(P, r); const T = A.T, ax = A.x, ay = A.y;
      let open = 99; for (const d of P.E) if (d.team === 'D') { const dd = Math.hypot(d.x - ax, d.y - ay) - d.spd * T * 0.35; if (dd < open) open = dd; }
      const sc = Math.min(open, 6) + (ay - P.los) * 0.06 - (ax < 1 || ax > 39 ? 5 : 0);
      if (sc > bs) { bs = sc; best = { k, open }; }
    }
    let press = 99; for (const d of P.E) if (d.team === 'D') press = Math.min(press, dist(d, qb));
    if ((P.t > 0.45 && best.open > 2.3) || (press < 2.4 && P.t > 0.3) || P.t > 2.7) inp.throwTo = best.k;
    return inp;
  }
  if (car && !(car === qb && P.kind === 'pass' && !P.scramble)) {
    let bd = null, bsc = -1e9;
    for (let a = -80; a <= 80; a += 16) {
      const r = a * Math.PI / 180; const dx = Math.sin(r), dy = Math.cos(r); const px = car.x + dx * 2.5, py = car.y + dy * 2.5;
      let md = 99; for (const d of P.E) if (d.team === 'D' && d.eng < 0) md = Math.min(md, Math.hypot(d.x - px, d.y - py));
      let sc = dy * 1.2 + Math.min(md, 5) * 0.6; if (px < 1.5 || px > 38.5) sc -= 3;
      if (sc > bsc) { bsc = sc; bd = { x: dx, y: dy }; }
    }
    inp.steer = bd;
    let near = null, nd = 99; for (const d of P.E) if (d.team === 'D' && d.eng < 0) { const x = dist(d, car); if (x < nd) { nd = x; near = d; } }
    if (near && nd < 1.9 && near.y > car.y - 0.5) inp.juke = { x: near.x > car.x ? -1 : 1, y: 0.4 };
  }
  return inp;
}
// pick the defense with the lowest expected yards against the visible tendency (what a reading human would do)
const EVY = { RUN: o => 4.2 + 4 * o, QUICK: o => (0.72 + 0.17 * o) * (6.2 + 3.8 * o), DEEP: o => (0.52 + 0.2 * o) * (22 + 6 * o) };
function smartDef(s) {
  const sc = C.oppScout(s); let best = null, bv = 1e9;
  for (const d of C.DEFS) { let v = 0; C.CATS.forEach((c, i) => v += sc.pct[i] * EVY[c](C.DEF_O[d][c])); v += 25 * (s.defHeat[d] || 0); if (v < bv) { bv = v; best = d; } }
  return best;
}
// ---------- random ----------
function randCall(s, R) {
  s.pace = ['milk', 'normal', 'hurry'][Math.floor(R() * 3)];
  if (s.down === 4) { const x = R(); if (x < 0.33 && C.canPunt(s)) return { punt: true }; if (x < 0.66 && C.canFG(s)) return { kick: R() }; }
  const L = C.legalPlays(s); return { play: L[Math.floor(R() * L.length)] };
}
function randInput(s, P, R, mem) {
  const inp = {};
  if (mem.throwAt === undefined) mem.throwAt = 0.4 + R() * 2.2;
  if (P.kind === 'pass' && P.t >= mem.throwAt && !P.thrown) { inp.throwTo = ['X', 'Y', 'Z', 'RB'][Math.floor(R() * 4)]; mem.throwAt = 99; }
  if (R() < 0.01) inp.juke = { x: R() - 0.5, y: R() };
  return inp;
}
function randDef(s, R) { return C.DEFS[Math.floor(R() * 4)]; }
// "do nothing" bot: calls plays, never throws or steers (soft-lock check)
function idleInput() { return {}; }

const BOTS = {
  smart: { call: smartCall, input: smartInput, def: smartDef },
  random: { call: randCall, input: randInput, def: randDef },
  idle: { call: randCall, input: idleInput, def: randDef },
};
function playGame(seed, oppId, bot, opts) {
  opts = opts || {};
  const R = mk(seed * 7 + 3);
  let s = C.newGame({ seed, oppId, iron: opts.iron, flea: opts.flea, team: opts.team });
  let guard = 0, realT = 0, plays = 0;
  const perPlay = opts.perPlay;
  while (s.phase !== 'final' && guard++ < 3000) {
    if (opts.saveEvery && s.phase !== 'final') { const j = JSON.stringify(s); s = JSON.parse(j); if (!C.validState(s)) throw new Error('invalid save at ' + s.phase); }
    if (s.phase === 'call') {
      const d = (opts.callFn || bot.call)(s, R, opts);
      realT += 2.5;
      if (d.kick !== undefined) { C.kickFG(s, d.kick); realT += 2; continue; }
      if (d.punt) { C.punt(s); realT += 1.5; continue; }
      const los = s.los, call = s.defCall;
      if (!C.callPlay(s, d.play)) throw new Error('illegal play ' + d.play);
      const P = s.play; const mem = {};
      let n = 0;
      while (!P.result && n++ < 2000) C.tick(s, C.CONFIG.DT, bot.input(s, P, R, mem));
      if (!P.result) throw new Error('play never ended');
      realT += P.t + 1.5; plays++;
      const res = C.finishPlay(s);
      if (perPlay) { const k = d.play + '/' + call; (perPlay[k] = perPlay[k] || []).push(res.type === 'int' ? -15 : res.gained); }
    } else if (s.phase === 'defcall') {
      const r = C.callDefense(s, bot.def(s, R)); realT += 3.5;
      if (!r) throw new Error('defense call failed');
    } else if (s.phase === 'live') throw new Error('stuck live');
  }
  if (s.phase !== 'final') throw new Error('game never ended seed ' + seed);
  return Object.assign({ realT, plays }, s.final);
}
function run(botName, oppId, n, opts) {
  let w = 0, l = 0, t = 0, pf = 0, pa = 0, rt = 0, pl = 0;
  for (let i = 1; i <= n; i++) { const r = playGame(i * 101 + 7, oppId, BOTS[botName], opts); if (r.res === 'W') w++; else if (r.res === 'L') l++; else t++; pf += r.me; pa += r.op; rt += r.realT; pl += r.plays; }
  return { bot: botName + (opts && opts.only ? ':' + opts.only : ''), opp: oppId, win: +(w / n).toFixed(2), loss: +(l / n).toFixed(2), tie: t, pf: +(pf / n).toFixed(1), pa: +(pa / n).toFixed(1), mins: +(rt / n / 60).toFixed(1), plays: +(pl / n).toFixed(1) };
}
module.exports = { playGame, run, BOTS, smartCall };

if (require.main === module) {
  const out = [];
  for (const t of C.TEAMS) { out.push(run('smart', t.id, N)); out.push(run('random', t.id, N)); }
  console.table(out);
  // single-play exploit check: smart execution but one fixed play
  const ex = [];
  for (const p of C.PLAY_IDS) ex.push(run('smart', 'wardens', Math.round(N / 2), { only: p }));
  ex.push(run('smart', 'wardens', Math.round(N / 2)));
  console.table(ex);
  // yards by play x call (smart execution, smart calls), Kestrels
  const per = {}; for (let i = 1; i <= N; i++) { BOTS.smart._ = 0; playGame(i * 13 + 1, 'kestrels', BOTS.smart, { perPlay: per, callFn: (s, R) => { const d = smartCall(s, R); if (d.play) d.play = C.PLAY_IDS[Math.floor(R() * 6)]; return d; } }); }
  const rows = []; for (const p of C.PLAY_IDS) { const r = { play: p }; for (const c of C.DEFS) { const a = per[p + '/' + c] || []; r[c] = a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + ' (' + a.length + ')' : '-'; } rows.push(r); }
  console.table(rows);
  // soft-lock: idle bot must still finish games
  let ok = 0; for (let i = 1; i <= 30; i++) { playGame(i, 'anvils', BOTS.idle); ok++; } console.log('idle bot finished', ok, 'games');
  // determinism + save roundtrip
  const a = playGame(999, 'anvils', BOTS.smart), b = playGame(999, 'anvils', BOTS.smart), c = playGame(999, 'anvils', BOTS.smart, { saveEvery: true });
  console.log('determinism', a.me === b.me && a.op === b.op ? 'OK' : 'FAIL', ' save-roundtrip', a.me === c.me && a.op === c.op ? 'OK' : 'FAIL', a.me + '-' + a.op, c.me + '-' + c.op);
}
if (require.main === module && process.argv[3] === 'dist') {
  const all = []; for (let i = 1; i <= 60; i++) { const per = {}; playGame(i * 17, 'wardens', BOTS.smart, { perPlay: per }); for (const k in per) all.push(...per[k]); }
  all.sort((a, b) => a - b); const q = f => all[Math.floor(all.length * f)];
  console.log('n', all.length, 'p10', q(.1), 'p25', q(.25), 'med', q(.5), 'p75', q(.75), 'p90', q(.9), '>=20:', (all.filter(x => x >= 20).length / all.length).toFixed(2), 'mean', (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1));
}
