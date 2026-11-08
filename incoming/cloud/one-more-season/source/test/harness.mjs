// One More Season — seeded headless harness. Run: node test/harness.mjs
import { CONFIG } from '../src/config.mjs';
import { validateContent, OPPONENTS, TACTIC_ORDER } from '../src/content.mjs';
import { newSeason, reduce, record, validateState, seasonRecap, applyPrep, PHASES } from '../src/game.mjs';
import { matchPreview, renderEvent, templateFor } from '../src/sim.mjs';
import { loadSave, writeSave, KEYS } from '../src/storage.mjs';
import { rotateRead, trainRide, starsGas, randomStrategy, playSeason, bestLineup } from './strategies.mjs';

let pass = 0, fail = 0;
const out = [];
function check(name, cond, detail = '') {
  if (cond) pass++; else fail++;
  out.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`);
}
const J = x => JSON.stringify(x);
class FakeStorage { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }

// 1. Content validation
check('content validates (8 players, 6 opponents, 12 templates, rows sum 100)', validateContent(CONFIG).length === 0, validateContent(CONFIG).join('; '));

// 2. Probability rows: every logged possession across many seasons and all strategies
let rows = 0, badRows = 0, capHits = 0, templatesSeen = new Set();
const SEEDS = Array.from({ length: 20 }, (_, i) => 'seed-' + (i + 1)); // the documented fixed seed set
const strategies = [rotateRead, trainRide, starsGas];
const ends = {};
for (const st of [...strategies, null]) {
  const name = st ? st.name : 'Random';
  ends[name] = SEEDS.map(seed => playSeason(newSeason(seed), st || randomStrategy(seed)));
  for (const e of ends[name]) for (const r of e.results) for (const ev of r.events) {
    rows++;
    const sum = ev.dist[0] + ev.dist[1] + ev.dist[2];
    if (sum !== 100 || ev.dist.some(x => x < 0 || x > 100) || Math.abs(ev.shift) > CONFIG.maxShift) badRows++;
    if (Math.abs(ev.shift) === CONFIG.maxShift) capHits++;
    templatesSeen.add(templateFor(ev).id);
    const b = CONFIG.base[ev.tactic];
    if (ev.dist[1] !== b[1] || ev.dist[0] !== b[0] - ev.shift) badRows++;
  }
}
check(`probability rows sum to 100 and stay in range (${rows} logged possessions)`, badRows === 0, `${badRows} bad, ${capHits} hit the ±${CONFIG.maxShift} cap`);
check('all 12 recap templates fire across the seed set', templatesSeen.size === 12, [...templatesSeen].join(','));

// 3. Determinism
{
  const a = playSeason(newSeason('det-1'), rotateRead), b = playSeason(newSeason('det-1'), rotateRead);
  const c = playSeason(newSeason('det-2'), rotateRead);
  check('same seed + same decisions = identical season (full state)', J(a) === J(b));
  check('different seed gives a different season', J(a.results) !== J(c.results));
  const r1 = playSeason(newSeason('det-1'), trainRide);
  check('same seed + different decisions diverges', J(r1.results.map(r => r.scoreYou)) !== J(a.results.map(r => r.scoreYou)) || J(r1.results.map(r => r.starters)) !== J(a.results.map(r => r.starters)));
}

// 4. Legal transitions: every command is rejected outside its phase, and rejection leaves state untouched
{
  const cmds = [
    { type: 'COMMIT', starters: ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'], prep: {}, tactic: 'balanced' },
    { type: 'FINISH_MATCH' }, { type: 'CONTINUE' }, { type: 'DEVELOP', playerId: 'danner', attr: 'attack' }, { type: 'MARK_HISTORY' },
  ];
  const allowedIn = { COMMIT: 'prep', FINISH_MATCH: 'match', CONTINUE: 'review', DEVELOP: 'develop', MARK_HISTORY: 'recap' };
  const seen = {};
  let violations = 0, mutations = 0;
  playSeason(newSeason('legal-1'), rotateRead, st => {
    seen[st.phase] = true;
    for (const c of cmds) {
      const before = J(st);
      const res = reduce(st, c);
      if (J(st) !== before) mutations++;
      if (allowedIn[c.type] !== st.phase && res.ok) violations++;
    }
  });
  check('illegal commands rejected in every phase', violations === 0 && PHASES.every(p => seen[p]), `${violations} violations; phases seen ${Object.keys(seen).join(',')}`);
  check('reduce() never mutates its input state', mutations === 0);
  const s0 = newSeason('legal-2');
  const bad = [
    { starters: ['reyke', 'marrow', 'abara', 'hollis'], prep: {}, tactic: 'balanced' },
    { starters: ['reyke', 'reyke', 'abara', 'hollis', 'ostrova'], prep: {}, tactic: 'balanced' },
    { starters: ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'], prep: { reyke: 'rest', marrow: 'rest', abara: 'rest' }, tactic: 'balanced' },
    { starters: ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'], prep: { reyke: 'train:speed' }, tactic: 'balanced' },
    { starters: ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'], prep: {}, tactic: 'yolo' },
  ];
  check('bad lineups / prep / plans are refused at commit', bad.every(d => !reduce(s0, { type: 'COMMIT', ...d }).ok));
  // attribute cap: train an attribute already at 10
  const s10 = JSON.parse(J(s0)); s10.roster[0].attack = 10;
  check('training a 10 is refused', !reduce(s10, { type: 'COMMIT', starters: ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'], prep: { reyke: 'train:attack' }, tactic: 'balanced' }).ok);
}

// 5. Fatigue and prep math
{
  const s = newSeason('fat-1');
  const res = reduce(s, { type: 'COMMIT', starters: ['reyke', 'marrow', 'abara', 'hollis', 'danner'], prep: { reyke: 'rest', danner: 'train:attack' }, tactic: 'patient' });
  const k = res.state.results[0].rosterAtKickoff;
  const by = id => k.find(p => p.id === id);
  check('rest = -24 fatigue, train = +1 attribute and +8 fatigue', by('reyke').fatigue === 40 && by('danner').fatigue === 8 && by('danner').attack === 7);
  const f = reduce(res.state, { type: 'FINISH_MATCH' }).state;
  const after = id => f.roster.find(p => p.id === id).fatigue;
  check('after match: starters +(24-Stamina), reserves -18, clamped at 0', after('reyke') === 59 && after('danner') === 25 && after('ostrova') === 12 && after('brask') === 0, `reyke ${after('reyke')} danner ${after('danner')} ostrova ${after('ostrova')} brask ${after('brask')}`);
  const again = reduce(f, { type: 'FINISH_MATCH' });
  check('fatigue update cannot be applied twice', !again.ok && J(again.state) === J(f));
}

// 6. Save / reload at every phase: reload mid-season, continue, and reach the identical end state
{
  const ls = new FakeStorage();
  let phasesReloaded = new Set(), roundTripFail = 0;
  const reloaded = playSeason(newSeason('save-1'), rotateRead, (st, label) => {
    writeSave(ls, st);
    const { state, problem } = loadSave(ls);
    if (problem || J(state) !== J(st)) roundTripFail++;
    phasesReloaded.add(st.phase);
    return state; // continue from the reloaded copy, like a page refresh
  });
  const straight = playSeason(newSeason('save-1'), rotateRead);
  check('save -> reload round-trips at every phase', roundTripFail === 0 && PHASES.every(p => phasesReloaded.has(p)), [...phasesReloaded].join(','));
  check('a season reloaded after every command ends identical to an uninterrupted one', J(reloaded) === J(straight));

  // reload during match playback: stored result is reused, never re-rolled
  const s = reduce(newSeason('save-2'), { type: 'COMMIT', ...rotateRead.decide(newSeason('save-2')) }).state;
  writeSave(ls, s);
  const back = loadSave(ls).state;
  check('reload in match phase keeps the stored result and RNG (no re-roll)', back.phase === 'match' && J(back.results[0].events) === J(s.results[0].events) && back.rng === s.rng);
  // double development
  let st = reduce(reduce(back, { type: 'FINISH_MATCH' }).state, { type: 'CONTINUE' }).state;
  const dev = reduce(st, { type: 'DEVELOP', playerId: 'danner', attr: 'attack' }).state;
  writeSave(ls, dev);
  const d2 = reduce(loadSave(ls).state, { type: 'DEVELOP', playerId: 'danner', attr: 'attack' });
  check('development choice cannot be applied twice (even after reload)', !d2.ok && dev.roster.find(p => p.id === 'danner').attack === 7);

  // corruption: damaged save falls back to previous good save, and the damaged text is kept
  ls.setItem(KEYS.save, '{"version":1,"phase":"bogus"');
  const rec = loadSave(ls);
  check('corrupt save restores previous good save and keeps a backup', rec.state && !validateState(rec.state).length && ls.getItem(KEYS.backup) === '{"version":1,"phase":"bogus"' && !!rec.problem);
  const ls2 = new FakeStorage(); ls2.setItem(KEYS.save, 'garbage');
  const r2 = loadSave(ls2);
  check('unreadable save with no fallback is kept, not deleted', r2.state === null && ls2.getItem(KEYS.save) === 'garbage' && ls2.getItem(KEYS.backup) === 'garbage');
  // a tampered-but-parseable save that would double-apply fatigue is rejected
  const tampered = JSON.parse(J(back)); tampered.phase = 'review';
  check('save claiming review without fatigue applied fails validation', validateState(tampered).length > 0);
}

// 7. Terminal outcomes: a winning and a losing season both reach the recap
{
  const all = Object.values(ends).flat();
  const win = all.find(e => record(e).w >= CONFIG.winTarget), lose = all.find(e => record(e).w < CONFIG.winTarget);
  const rw = win && seasonRecap(win), rl = lose && seasonRecap(lose);
  check('a winning season (4+ wins) reaches the recap', win && win.phase === 'recap' && rw.success, win ? `${win.seed}: ${record(win).w}W` : 'none found');
  check('a losing season (3 or fewer wins) reaches the recap', lose && lose.phase === 'recap' && !rl.success, lose ? `${lose.seed}: ${record(lose).w}W` : 'none found');
  // recap lines point at recorded events
  let ok = true;
  for (const e of [win, lose]) for (const r of e.results) for (const i of r.decisive) if (!r.events[i]) ok = false;
  check('every decisive event index points to a logged possession', ok);
}

// 8. Fatigue changes an actual decision (fixture 1)
{
  const s = newSeason('fx1');
  const opp = OPPONENTS[0];
  const pick = ids => ids.map(id => s.roster.find(p => p.id === id));
  const star = matchPreview(pick(['reyke', 'marrow', 'abara', 'hollis', 'ostrova']), opp, 'patient');
  const rested = matchPreview(pick(['reyke', 'marrow', 'abara', 'hollis', 'ostrova']).map(p => p.id === 'reyke' ? { ...p, fatigue: 40 } : p), opp, 'patient');
  const bench = matchPreview(pick(['danner', 'marrow', 'abara', 'hollis', 'ostrova']), opp, 'patient');
  const fresh = matchPreview(pick(['reyke', 'marrow', 'abara', 'hollis', 'ostrova']).map(p => p.id === 'reyke' ? { ...p, fatigue: 0 } : p), opp, 'patient');
  out.push(`INFO  fixture 1 expected margin (Patient): tired Reyke ${(star.evYou - star.evThem).toFixed(2)}, rested Reyke ${(rested.evYou - rested.evThem).toFixed(2)}, Danner instead ${(bench.evYou - bench.evThem).toFixed(2)}, hypothetical fresh Reyke ${(fresh.evYou - fresh.evThem).toFixed(2)}`);
  const d = rotateRead.decide(s);
  out.push(`INFO  Rotate & Read fixture 1 call: start ${d.starters.join(',')}; prep ${J(d.prep)}; plan ${d.tactic}`);
  // decision change: replay the same optimizer with every player's fatigue zeroed and count lineups that differ
  let differ = 0, total = 0;
  for (const e of ends['Rotate & Read']) for (const r of e.results) {
    total++;
    const st = { ...e, fixture: r.fixture, roster: r.rosterAtKickoff };
    const real = bestLineup(st, r.rosterAtKickoff, 0.06);
    const fresh = bestLineup(st, r.rosterAtKickoff.map(p => ({ ...p, fatigue: 0 })), 0.06);
    if (J(real.starters.slice().sort()) !== J(fresh.starters.slice().sort())) differ++;
  }
  check('fatigue changes decisions: same optimizer picks a different five once fatigue is counted', differ > 0, `${differ}/${total} fixtures differ`);
  const prevFat = ends['Rotate & Read'].flatMap(e => e.results.map(r => r.preview.you.fatigueFactor));
  out.push(`INFO  Rotate & Read average starting strength across fixtures: ${(prevFat.reduce((a, b) => a + b, 0) / prevFat.length * 100).toFixed(1)}%`);
}

// 9. Strategy comparison on the same fixed seed set
out.push('');
out.push(`STRATEGY COMPARISON on the documented seed set (${SEEDS[0]} .. ${SEEDS[SEEDS.length - 1]}, ${SEEDS.length} seasons each)`);
const table = [];
for (const [name, list] of Object.entries(ends)) {
  const recs = list.map(record);
  const succ = list.filter((e, i) => recs[i].w >= CONFIG.winTarget);
  const avg = k => (recs.reduce((a, r) => a + r[k], 0) / recs.length).toFixed(2);
  const pf = (list.reduce((a, e) => a + e.results.reduce((x, r) => x + r.scoreYou, 0), 0) / list.length).toFixed(1);
  const pa = (list.reduce((a, e) => a + e.results.reduce((x, r) => x + r.scoreThem, 0), 0) / list.length).toFixed(1);
  const fat = (list.reduce((a, e) => a + e.results.reduce((x, r) => x + r.preview.you.fatigueFactor, 0) / 6, 0) / list.length * 100).toFixed(0);
  const tact = {}; for (const e of list) for (const r of e.results) tact[r.tactic] = (tact[r.tactic] || 0) + 1;
  table.push({ name, success: `${succ.length}/${list.length}`, avgW: avg('w'), avgD: avg('d'), pf, pa, strength: fat + '%', plans: TACTIC_ORDER.map(t => `${t[0].toUpperCase()}${tact[t] || 0}`).join(' '), winSeeds: succ.slice(0, 4).map(e => e.seed).join(',') });
}
out.push('strategy        | 4+ wins | avg W | avg D | pts for | pts against | avg strength | plans P/B/A | example winning seeds');
for (const t of table) out.push(`${t.name.padEnd(15)} | ${t.success.padEnd(7)} | ${t.avgW.padEnd(5)} | ${t.avgD.padEnd(5)} | ${t.pf.padEnd(7)} | ${t.pa.padEnd(11)} | ${t.strength.padEnd(12)} | ${t.plans.padEnd(11)} | ${t.winSeeds}`);
check('Rotate & Read reaches 4 wins on at least one documented seed', ends['Rotate & Read'].some(e => record(e).w >= 4));
check('Train & Ride reaches 4 wins on at least one documented seed', ends['Train & Ride'].some(e => record(e).w >= 4));

// 10. Sample recap from real simulated events
{
  const e = ends['Rotate & Read'][0];
  const R = seasonRecap(e);
  out.push('');
  out.push(`SAMPLE RECAP (seed ${e.seed}, Rotate & Read): ${R.rec.w}W ${R.rec.d}D ${R.rec.l}L, scored ${R.pf}, conceded ${R.pa}, ${R.success ? 'job kept' : 'fell short'}`);
  for (const l of R.lines) out.push(`  F${l.fixture} ${l.outcome} ${l.score} vs ${l.opp} (${l.tactic}): ${l.key}`);
  const r0 = e.results[0], opp = OPPONENTS[0];
  out.push('  Fixture 1 decisive moments:');
  for (const i of r0.decisive) out.push('   - ' + renderEvent(r0.events[i], { tactic: r0.tactic, oppName: opp.name, oppShort: 'Harbor' }).text);
}

console.log(out.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
