// Rules + bot tests. node test/run-tests.js
const H = require('./harness'); const LW = H.loadLW();
let pass = 0, fail = 0; const out = [];
const ok = (c, msg) => { if (c) pass++; else { fail++; out.push('FAIL ' + msg); } };
const log = (...a) => out.push(a.join(' '));
const run = (ev, bot, extra = {}) => H.runRace(LW, Object.assign({ event: ev, seed: 42, tier: 3 }, extra), bot);

// 1. determinism: same seed + same inputs => same result, field and finish
{ const a = run('free-100', H.rhythmBot({ sd: 0.04, seed: 9 })), b = run('free-100', H.rhythmBot({ sd: 0.04, seed: 9 }));
  ok(a.p.finish === b.p.finish && JSON.stringify(a.opps) === JSON.stringify(b.opps), 'determinism'); }

// 2. good rhythm beats mashing in every event, by a lot; mashers bonk
for (const ev of LW.EVENTS) {
  const g = run(ev, H.rhythmBot({ sd: 0.05 })), m = run(ev, H.masherBot());
  ok(g.p.phase === 'done', ev + ' rhythm finishes');
  ok(m.p.phase !== 'done' || m.p.finish > g.p.finish * 1.5, ev + ' masher much slower (' + m.p.finish + ' vs ' + g.p.finish + ')');
  ok(m.p.log.bonkAt != null, ev + ' masher bonks');
}
// 2b. a steady "half-masher" (fixed 0.4 s taps, ignores the ring) is clearly slower than rhythm
function steadyBot(gap) { let next = 0, side = 'L', ups = []; return (LW_, r) => { const t = r.t, o = []; ups = ups.filter(u => { if (t >= u.t) { o.push({ t, type: 'up', side: u.s }); return false; } return true; }); if (r.p.phase === 'stand' || r.p.phase === 'marks') return o; if (t >= next) { o.push({ t, type: 'down', side }); ups.push({ t: t + 0.05, s: side }); side = side === 'L' ? 'R' : 'L'; next = t + gap; } return o; }; }
{ const g = run('free-100', H.rhythmBot({ sd: 0.05 })), s4 = run('free-100', steadyBot(0.4)), s5 = run('free-100', steadyBot(0.52));
  log('steady 0.40s tapper', s4.p.finish ?? s4.p.phase, ' steady 0.52s', s5.p.finish ?? s5.p.phase, ' rhythm', g.p.finish);
  ok((s4.p.finish ?? 999) > g.p.finish * 1.08, 'steady 0.4 tapper slower than rhythm by >8%'); }

// 3. idle never soft-locks: every event ends (DNF) and auto start / drift / auto walls fire
for (const ev of LW.EVENTS) { const r = run(ev, H.idleBot()); ok(r.over && r.p.phase === 'dnf', ev + ' idle ends in DNF'); }
// 3b. kicker who never breaks out gets forced up at 15 m, every wall
{ const r = run('free-100', H.rhythmBot({ uwTo: 99 })); ok(r.p.phase === 'done' && r.p.log.breakouts.every(b => b.why === 'limit' && b.m >= 14.9 && b.m <= 15.2), 'forced breakout at 15 m'); }

// 4. false start = DQ; recall in rookie fields
{ const bot = (LW_, r) => (r.p.phase === 'marks' && r.t > r.beepT - 0.3 && !r._d) ? (r._d = 1, [{ t: r.t, type: 'down', side: 'L' }]) : [];
  const r = run('free-50', bot, { tier: 3 }); ok(r.p.phase === 'dq' && r.over, 'false start DQ at tier 3');
  const rb = H.rhythmBot({}); const r0 = run('free-50', (LW_, rr) => { if (rr.p.phase === 'marks' && rr.t > rr.beepT - 0.3 && !rr._d) { rr._d = 1; return [{ t: rr.t, type: 'down', side: 'L' }]; } return rb(LW_, rr); }, { tier: 0 });
  ok(r0.p.phase === 'done' && r0.p.log.recalls === 1, 'false start recalled at tier 0, race still finishes'); }

// 5. timing window boundaries
{ const W = LW.CONFIG.WIN;
  const at = dt => { const r = LW.createRace({ event: 'free-50', seed: 1 }); LW.stepTo(r, 30); r.p.phase = 'swim'; r.p.lx = 10; r.p.readyT = 30.5; r.p.lastStrokeT = 29.9; LW.raceInput(r, { t: 30.5 + dt, type: 'down', side: r.p.nextArm }); return r.p.log.strokes[0].g; };
  ok(at(-W.pEarly + 1e-4) === 'perfect' && at(W.pLate - 1e-4) === 'perfect', 'perfect window edges');
  ok(at(-W.pEarly - 0.01) === 'good' && at(W.pLate + 0.01) === 'good', 'good just outside perfect');
  ok(at(-W.gEarly - 0.01) === 'rush' && at(W.gLate + 0.01) === 'late', 'rush / late beyond good'); }

// 6. pacing matters in the 200: all-out push bonks and loses to a paced swim; cruise-only also loses
{ const paced = run('free-200', H.rhythmBot({ sd: 0.03, pushAt: 0.5 })), all = run('free-200', H.rhythmBot({ sd: 0.03, pushAt: 0 })), none = run('free-200', H.rhythmBot({ sd: 0.03, push: false }));
  log('200 free paced', paced.p.finish, 'all-push', all.p.finish, '(bonk', all.p.log.bonkAt, ') cruise', none.p.finish);
  ok(all.p.log.bonkAt != null && all.p.finish > paced.p.finish, '200: all-push bonks and loses'); ok(none.p.finish > paced.p.finish, '200: never pushing loses'); }
// 6b. breathing matters: no-breath freestyle gasps and is slower
{ const br = run('free-100', H.rhythmBot({ sd: 0.03 })), nb = run('free-100', H.rhythmBot({ sd: 0.03, breathe: false })), lazy = run('free-100', H.rhythmBot({ sd: 0.03, breatheEvery: 999 }));
  log('100 free breathing', br.p.finish, 'never-breathe', nb.p.finish, 'gasps', nb.p.log.gasps, 'breathe-only-when-low', lazy.p.finish);
  ok(nb.p.log.gasps > 0, 'no-breath gasps'); ok(nb.p.finish > br.p.finish + 0.5, 'never breathing loses clearly'); }
// 6c. walls matter: bad flips cost time
{ const good = run('free-100', H.rhythmBot({ sd: 0.03, flipErr: 0 })), bad = run('free-100', H.rhythmBot({ sd: 0.03, flipErr: 0.9, seed: 3 }));
  log('100 free clean walls', good.p.finish, 'sloppy walls', bad.p.finish); ok(bad.p.finish > good.p.finish, 'sloppy walls slower'); }

// 7. one-thumb assist completes and does not beat a skilled two-thumb swimmer
{ const a = run('free-100', H.rhythmBot({ sd: 0.03 }), { assist: true }), b = run('free-100', H.rhythmBot({ sd: 0.03 }));
  log('assist', a.p.finish, 'two-thumb', b.p.finish); ok(a.p.phase === 'done', 'assist finishes'); ok(a.p.finish >= b.p.finish - 0.05, 'assist not faster than skilled two-thumb'); }

// 8. save validation fuzz: never throws, always a usable save
{ const r = H.mkr(5); let threw = 0;
  const junk = () => { const k = r(); if (k < 0.15) return null; if (k < 0.3) return Math.floor(r() * 1e6) - 5e5; if (k < 0.45) return 'x' + r(); if (k < 0.55) return [1, 'a', null]; if (k < 0.65) return true; const o = {}; const n = Math.floor(r() * 6); for (let i = 0; i < n; i++) o[['v', 'rung', 'best', 'medals', 'settings', 'stats', 'daily', 'free-50', 'ghost', 'time', '__proto__'][Math.floor(r() * 11)]] = r() < 0.5 ? junk() : r() * 100; return o; };
  for (let i = 0; i < 4000; i++) { try { const s = LW.validateSave(junk()).save; if (typeof s.rung !== 'number' || !s.settings || typeof s.best !== 'object') threw++; } catch (e) { threw++; } }
  ok(threw === 0, 'save fuzz 4000 cases'); const v = LW.validateSave(LW.defaultSave()); ok(v.ok, 'default save valid');
  const big = LW.defaultSave(); big.best['free-50'] = { time: 30, ghost: new Array(20000).fill(1) }; ok(LW.validateSave(big).save.best['free-50'].ghost === null, 'oversized ghost dropped'); }

// 9. hold that started before a phase change never triggers breath/breakout
{ const r = LW.createRace({ event: 'free-50', seed: 3 }); LW.stepTo(r, r.beepT + 0.01); LW.raceInput(r, { t: r.t + 0.6, type: 'down', side: 'L' });
  LW.stepTo(r, r.t + 1.2); ok(r.p.phase === 'uw' && r.p.log.breakouts.length === 0, 'start hold does not break out'); }

// 10. every event: reference bot medals in Conference field; tier curve for a realistic human
{ const human = (seed) => H.rhythmBot({ sd: 0.075, flipErr: 0.45, rt: 0.78, seed, breatheEvery: 3, pushAt: 0.6, uwTo: 7 });
  const tiers = [0, 1, 2, 3, 4, 5], rows = [];
  for (const ev of ['free-50', 'free-100', 'back-50', 'breast-50', 'fly-50', 'free-200', 'im-100', 'im-200']) {
    const row = [ev.padEnd(10)];
    for (const tr of tiers) { let med = 0; for (let k = 0; k < 6; k++) { const r = run(ev, human(20 + k), { tier: tr, seed: 300 + k }); if (r.p.phase === 'done' && LW.playerPlace(r) <= 3) med++; } row.push('T' + tr + ':' + med + '/6'); }
    rows.push(row.join(' '));
  }
  log('realistic human (sd 75 ms, sloppy walls) medal rate by field tier:'); rows.forEach(r => log('  ' + r));
}
// 11. Round 3: season rival and pool records
{ const a = LW.createRace({ event: 'free-100', seed: 77, tier: 3, rival: true }), b = LW.createRace({ event: 'free-100', seed: 77, tier: 3, rival: true });
  const rv = a.opps.find(o => o.rival);
  ok(rv && rv.lane === 4 && rv.name === LW.ROSTER[LW.RIVAL].name, 'rival in lane 4');
  ok(JSON.stringify(a.opps) === JSON.stringify(b.opps), 'rival field deterministic');
  const mids = a.opps.filter(o => !o.rival).map(o => o.finish).sort((x, y) => x - y);
  ok(rv.finish < mids[2] * 1.002, 'rival quicker than the middle of the field');
  let seen = 0; for (let sd = 1; sd < 40; sd++) { const r = LW.createRace({ event: 'fly-50', seed: sd, tier: 2 }); if (r.opps.some(o => o.rival)) seen++; } ok(seen === 0, 'no rival flag without rival option');
  ok(LW.EVENTS.every(k => LW.RECORDS[k] && LW.RECORDS[k].time < LW.PAR[k] * 1.01 && typeof LW.RECORDS[k].holder === 'string'), 'pool record for every event, near par');
  const sv = LW.validateSave({ v: 1, rival: { w: 3, l: -2 } }).save; ok(sv.rival.w === 3 && sv.rival.l === 0, 'rival tally validated');
  // records are reachable but hard: skilled bot beats some, realistic human none
  let skilledBeat = 0, humanBeat = 0;
  for (const ev of ['free-50', 'free-100', 'back-50', 'fly-50']) {
    const sk = run(ev, H.rhythmBot({ sd: 0.02, flipErr: 0.08, rt: 0.62, pushAt: 0, uwTo: ev.startsWith('back') ? 13 : ev.startsWith('fly') ? 11 : 7, breatheEvery: ev === 'free-50' ? 999 : 3 }), { tier: 5 }), hu = run(ev, H.rhythmBot({ sd: 0.075, flipErr: 0.45, rt: 0.78 }), { tier: 5 });
    if (sk.p.finish < LW.RECORDS[ev].time) skilledBeat++; if (hu.p.finish < LW.RECORDS[ev].time) humanBeat++;
    log('record ' + ev, LW.RECORDS[ev].time, 'expert', sk.p.finish, 'human', hu.p.finish);
  }
  ok(skilledBeat >= 1 && humanBeat === 0, 'records reachable by expert timing only'); }
console.log(out.join('\n')); console.log('PASS', pass, 'FAIL', fail); process.exit(fail ? 1 : 0);
