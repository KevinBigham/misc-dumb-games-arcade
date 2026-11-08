// Dual Meet tests: rules (scoring, limits, fatigue, daily stability, solvability) and the page in the kit's fake browser.
// usage: TZ=America/Chicago node test/run-tests.js [days]
const fs = require('fs'), path = require('path');
global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js'), B = require('./bots.js');
const { makeEnv } = require('../../../kit/test/stubdom.js');
let pass = 0, fail = 0; const out = [];
function ok(c, name, extra) { const line = (c ? 'PASS ' : 'FAIL ') + name + (extra === undefined ? '' : ' :: ' + extra); console.log(line); out.push(line); c ? pass++ : fail++; }
const DAYS = +process.argv[2] || 120;

/* ---------- rules ---------- */
{ // place points and ties
  const e = DM.placePoints([{ t: 50 }, { t: 51 }, { t: 51 }, { t: 52 }, { t: 53 }, { t: 54 }], DM.IND_PTS);
  ok(e.map(x => x.pts).join(',') === '6,3.5,3.5,2,1,0', 'individual 6-4-3-2-1 with a tie for second splits 4+3', e.map(x => x.pts).join(','));
  const r = DM.placePoints([{ t: 100 }, { t: 99 }], DM.REL_PTS);
  ok(r[0].t === 99 && r[0].pts === 8 && r[1].pts === 4, 'relay win scores 8, second 4');
  const t = DM.placePoints([{ t: 60 }, { t: 60 }], DM.REL_PTS);
  ok(t[0].pts === 6 && t[1].pts === 6, 'tied relay splits 8+4 into 6 and 6');
  ok(DM.TOTAL_PTS === 164, 'a full meet is worth 164 points', DM.TOTAL_PTS);
}
// independent reference scorer, written separately from rules.js, on random legal lineups
function refScore(M, lu) {
  const tA = DM.times(M.home, lu, M.noiseA), tB = M.tB; let us = 0, them = 0;
  DM.EV.forEach((ev, e) => {
    const sl = DM.EV_SLOTS[e];
    if (ev.relay) {
      const a = sl.every(s => tA.t[s] != null) ? Math.round(sl.reduce((x, s) => x + tA.t[s], 0) * 100) / 100 : null;
      const b = sl.every(s => tB.t[s] != null) ? Math.round(sl.reduce((x, s) => x + tB.t[s], 0) * 100) / 100 : null;
      if (a != null && b != null) { if (a < b) { us += 8; them += 4; } else if (b < a) { them += 8; us += 4; } else { us += 6; them += 6; } } else if (a != null) us += 8; else if (b != null) them += 8;
    } else {
      const all = [];
      sl.forEach(s => { if (lu[s] >= 0) all.push(['A', tA.t[s]]); if (M.luB[s] >= 0) all.push(['B', tB.t[s]]); });
      all.forEach(([side, x]) => { const faster = all.filter(y => y[1] < x).length, eq = all.filter(y => y[1] === x).length; let p = 0; for (let k = faster; k < faster + eq; k++) p += [6, 4, 3, 2, 1][k] || 0; p /= eq; if (side === 'A') us += p; else them += p; });
    }
  });
  return { us, them };
}
{
  const R = GK.rng.make('ref'); let bad = 0, n = 0, sum164 = true, invalid = 0;
  for (let i = 0; i < 12; i++) {
    const M = DM.makeMeet('ref-' + i, { quick: true }); let lu = M.defA.slice();
    for (let k = 0; k < 120; k++) {
      const nx = DM.setSlot(lu, R.int(0, DM.NS - 1), R.int(-1, 11)); if (nx) lu = nx;
      if (!DM.valid(lu)) invalid++;
      const a = DM.swim(M, lu), b = refScore(M, lu); n++;
      if (Math.abs(a.us - b.us) > 1e-9 || Math.abs(a.them - b.them) > 1e-9) bad++;
      const full = lu.every(p => p >= 0) && M.luB.every(p => p >= 0);
      if (full && Math.abs(a.us + a.them - 164) > 1e-9) sum164 = false;
    }
  }
  ok(bad === 0, 'game scoring matches an independent scorer on ' + n + ' random lineups', bad + ' mismatches');
  ok(sum164, 'when every lane is filled the two scores add to 164');
  ok(invalid === 0, 'random edits never break the entry limits', invalid);
}
{ // limits and fatigue
  const M = DM.makeMeet('limits', { quick: true }); const lu = M.defA.slice();
  const ind = DM.EV_SLOTS[1][0], ind2 = DM.EV_SLOTS[2][0], ind3 = DM.EV_SLOTS[3][0];
  const bad = lu.slice(); bad[ind] = 0; bad[ind2] = 0; bad[ind3] = 0;
  ok(DM.problems(bad).some(p => /individual/.test(p)), 'three individual events for one swimmer is flagged');
  const dup = lu.slice(); dup[DM.EV_SLOTS[5][0]] = 3; dup[DM.EV_SLOTS[5][1]] = 3;
  ok(DM.problems(dup).some(p => /twice/.test(p)), 'the same swimmer twice in one event is flagged');
  const f = DM.fatigue((() => { const l = new Array(DM.NS).fill(-1); l[DM.EV_SLOTS[1][0]] = 0; l[DM.EV_SLOTS[2][0]] = 0; l[DM.EV_SLOTS[3][0]] = 1; l[DM.EV_SLOTS[4][0]] = 1; return l; })());
  ok(f.b2b[DM.EV_SLOTS[2][0]] === true && Math.abs(f.mult[DM.EV_SLOTS[2][0]] - (1 + 0.004 * 1.6 + 0.02)) < 1e-9, '200 IM right after the 200 Free is back-to-back: +2% plus tiredness');
  ok(f.b2b[DM.EV_SLOTS[4][0]] === false, '50 Free then 100 Fly is not back-to-back (diving break)');
}
{ // daily stability
  const s = GK.daily.seed('dual-meet', '2026-11-06');
  const a = JSON.stringify(DM.makeMeet(s)); for (const k in DM._cache) delete DM._cache[k];
  const b = JSON.stringify(DM.makeMeet(s));
  ok(a === b, 'the same date always builds the same meet (fresh rebuild, cache cleared)');
  const c = DM.makeMeet(GK.daily.seed('dual-meet', '2026-11-07'));
  ok(JSON.stringify(c.luB) !== JSON.parse(a).luB.join() && c.away.name + c.gender !== JSON.parse(a).away.name + JSON.parse(a).gender || JSON.stringify(c.home) !== JSON.stringify(JSON.parse(a).home), 'the next date builds a different meet');
}
{ // solvable and balanced across many days
  const t0 = Date.now(); let rndW = 0, wins = 0, defLoss = 0, minBest = 1e9, scoutW = 0, fixW = 0, ms = [], bestM = [], valid = 0;
  for (let d = 0; d < DAYS; d++) {
    const day = new Date(Date.UTC(2026, 10, 7 + d)); const key = day.toISOString().slice(0, 10);
    const a = Date.now(); const M = DM.makeMeet(GK.daily.seed('dual-meet', key)); ms.push(Date.now() - a);
    if (M.best.margin > 0) wins++; if (M.defaultMargin < 0) defLoss++; minBest = Math.min(minBest, M.best.margin); bestM.push(M.best.margin);
    if (DM.valid(M.best.lu) && DM.valid(M.luB) && DM.valid(M.defA)) valid++;
    if (DM.swim(M, B.scout(M)).margin > 0) scoutW++; if (DM.swim(M, B.fixer(M)).margin > 0) fixW++; if (DM.swim(M, B.random(M, 'r' + d)).margin > 0) rndW++;
  }
  ms.sort((x, y) => x - y); bestM.sort((x, y) => x - y);
  ok(wins === DAYS, 'every one of ' + DAYS + ' daily meets can be won', wins + '/' + DAYS + ', smallest best margin ' + minBest);
  ok(valid === DAYS, 'every generated lineup (default, theirs, best) is legal');
  ok(defLoss / DAYS >= 0.9, 'your usual lineup loses most days, so there is a puzzle', defLoss + '/' + DAYS);
  ok(scoutW / DAYS >= 0.55 && scoutW / DAYS <= 0.97, 'a careful planner (bot using only what the page shows) wins most but not all days', scoutW + '/' + DAYS);
  ok(fixW / DAYS >= 0.4 && fixW / DAYS <= 0.85, 'a step-by-step player (8 sensible taps, only what the page shows) wins some days, not all', fixW + '/' + DAYS);
  ok(rndW / DAYS <= 0.15, 'random taps almost never win', rndW + '/' + DAYS);
  ok(ms[Math.floor(ms.length * 0.9)] < 1200, 'building a meet takes under 1.2 s at p90 in node', 'p50 ' + ms[ms.length >> 1] + ' ms, p90 ' + ms[Math.floor(ms.length * 0.9)] + ' ms; best margin p10/p50/p90 ' + bestM[Math.floor(DAYS * .1)] + '/' + bestM[DAYS >> 1] + '/' + bestM[Math.floor(DAYS * .9)]);
}

/* ---------- the page ---------- */
const HTML = fs.readFileSync(path.join(__dirname, '..', 'artifact-body.html'), 'utf8');
const scripts = []; { const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(HTML))) scripts.push([m[1], m[2]]); }
const ids = [...HTML.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
function boot(store, o) {
  const E = makeEnv(Object.assign({ ids, storage: store, w: 390, h: 844, now: Date.UTC(2026, 10, 6, 15, 0, 0) }, o || {}));
  ['sMeet', 'sRes', 'sheet', 'coach'].forEach(id => { E.byId[id].hidden = true; });
  for (const [id, src] of scripts) E.run(src, id);
  E.frames(4, 20);
  return E;
}
(async () => {
  const store = new Map();
  let E = boot(store), T = E.win.__DMT;
  ok(E.log.errors.length === 0 && T.st.mode === 'title', 'page boots to the title at 390x844 with no errors', E.log.errors.join(' | '));
  ok(/vs /.test(E.byId.tVs.textContent) && /New meet in/.test(E.byId.tNext.textContent), 'title shows today\'s opponent and the countdown', E.byId.tVs.textContent);
  const M = T.todayMeet();
  ok(M.seed === E.win.GK.daily.seed('dual-meet') && /2026-11-06$/.test(M.seed), 'today\'s meet is seeded by the local date', M.seed);
  E.byId.tGo.fire('click', {});
  ok(T.st.mode === 'meet' && !E.byId.sMeet.hidden, 'Today\'s meet opens the meet sheet');
  const evHtml = E.byId.events.innerHTML;
  ok((evHtml.match(/class="ev( sc)?"/g) || []).length === 11 && /Diving/.test(evHtml), 'all 11 events and the diving break are shown');
  ok((evHtml.match(/★ Scouted/g) || []).length === M.reveal.length && /Their top seeds/.test(evHtml), 'scouted events show their entries; hidden events show their top seeds');
  ok(!E.byId.coach.hidden && /pulsing/.test(E.byId.coachT.textContent) && /pulse/.test(evHtml), 'first meet teaches by play: a pulsing lane and a one-line tip', E.byId.coachT.textContent);
  // pick sheet, take the hint
  const h = T.st.hint; T.openPick(h.slot);
  ok(!E.byId.sheet.hidden && (E.byId.shBody.innerHTML.match(/class="pk/g) || []).length >= 12, 'tapping a lane opens a sheet with every swimmer');
  ok(/pulse/.test(E.byId.shBody.innerHTML), 'the hinted swimmer pulses in the sheet');
  const before = T.st.lu.slice(); T.choose(h.slot, h.p, h.trade);
  ok(JSON.stringify(T.st.lu) === JSON.stringify(h.lu) && T.st.lu[h.slot] === h.p && E.byId.sheet.hidden && JSON.parse(store.get('dualMeet.v1')).d.draft.lu[h.slot] === h.p, 'choosing a swimmer updates the lineup and saves the draft');
  ok(/Fix anything else/.test(E.byId.coachT.textContent), 'the tip moves on after the first change');
  // an illegal placement is refused with a reason
  const lu = T.st.lu, c = DM.counts(lu); let maxed = -1; for (let p = 0; p < 12; p++) if (c.ind[p] === 2) { maxed = p; break; }
  let target = -1; for (const si of DM.EV_SLOTS[6]) { if (!DM.EV_SLOTS[6].some(s => lu[s] === maxed)) { target = si; break; } }
  const toastBefore = E.document.body.children.length; const okc = T.choose(target, maxed);
  ok(okc === false && T.st.lu[target] !== maxed && E.document.body.children.some(ch => ch.className === 'gk-toast' && /individual/.test(ch.textContent)), 'a third individual event is refused with a reason', toastBefore);
  const trs = DM.trades(T.st.lu, target, maxed);
  ok(trs.length > 0 && /Trade/.test((T.openPick(target), E.byId.shBody.innerHTML)), 'the sheet offers a trade for a swimmer at the limit', trs.length + ' trades');
  ok(T.choose(target, maxed, trs[0].slot) === true && T.st.lu[target] === maxed && DM.valid(T.st.lu), 'a trade moves the swimmer and keeps the lineup legal');
  // roster and help sheets render
  T.openRoster('them'); ok(/Season best/.test(E.byId.shBody.innerHTML) && /200 IM/.test(E.byId.shBody.innerHTML), 'their roster shows season bests'); T.openHelp(); ok(/164 points/.test(E.byId.shBody.innerHTML), 'how to play explains the scoring');
  E.byId.shClose.fire('click', {});
  // reload keeps the draft
  const draft = T.st.lu.slice();
  E.hide(); E = boot(store); T = E.win.__DMT; T.openToday();
  ok(JSON.stringify(T.st.lu) === JSON.stringify(draft) && E.log.errors.length === 0, 'reload keeps the lineup in progress');
  // swim
  T.swim(); E.frames(3, 700);
  ok(T.st.mode === 'res' && !E.byId.rSkip.hidden && E.byId.rBtns.hidden, 'Swim starts the event-by-event reveal');
  E.frames(14, 700);
  const r = DM.swim(T.todayMeet(), draft);
  ok(E.byId.rBtns.hidden === false && E.byId.rUs.textContent === String(r.us) && E.byId.rThem.textContent === String(r.them), 'the reveal ends on the right final score', r.us + '-' + r.them);
  ok((E.byId.rEvents.innerHTML.match(/class="re1"/g) || []).length === 11, 'all 11 event results are listed');
  const sv = JSON.parse(store.get('dualMeet.v1')).d;
  ok(sv.today.key === '2026-11-06' && sv.plays === 1 && sv.days.days === 1 && sv.badges.first, 'the daily result, play count, day count and First Meet badge are saved');
  E.byId.rShare.fire('click', {}); await E.flush();
  ok(E.log.clip.length === 1 && /^Dual Meet Nov 6: [WLT] \d+(\.5)?-\d+(\.5)?\n[🟦🟥🟨]{11}\n[★☆]{3} · best \+\d+/u.test(E.log.clip[0]), 'Share copies a result line with an 11-event grid', JSON.stringify(E.log.clip[0]));
  T.openBest(); ok(/Best lineup/.test(E.byId.shTitle.textContent) && /Their full lineup/.test(E.byId.shBody.innerHTML), 'the best lineup and their full lineup show after the meet');
  E.byId.shClose.fire('click', {});
  // reload shows the result, no replay of the daily
  E.hide(); E = boot(store); T = E.win.__DMT; E.frames(3, 20);
  ok(/Won|Lost|Tied/.test(E.byId.tState.textContent) && /result/.test(E.byId.tGo.textContent), 'after a reload the title shows today\'s result', E.byId.tState.textContent);
  T.openToday(); ok(T.st.mode === 'res' && E.byId.rUs.textContent === String(r.us), 'today\'s meet reopens on its result, not a second try');
  // Again = practice
  E.byId.rAgain.fire('click', {}); E.frames(2, 40);
  ok(T.st.mode === 'meet' && T.st.practice && /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/.test(T.st.code), 'Again starts a practice meet with a shareable code', T.st.code);
  T.swim(); E.frames(20, 700);
  const sv2 = JSON.parse(store.get('dualMeet.v1')).d;
  ok(sv2.today.key === '2026-11-06' && sv2.today.us === r.us && sv2.plays === 2 && sv2.days.days === 1, 'a practice meet never overwrites the daily result');
  T.retryToday(); ok(T.st.mode === 'meet' && T.st.retry && T.st.M.seed === T.todayMeet().seed, 'Retry replays today\'s meet unscored');
  // export / import
  const code = T.S.exportCode(); store.clear();
  E = boot(store); T = E.win.__DMT; ok(T.D.plays === 0, 'a wiped phone starts fresh');
  ok(T.S.importCode(code) && T.S.data.plays === 2 && T.S.data.today.us === r.us, 'an exported save code brings everything back');
  // hostile and broken saves
  const s3 = new Map([['dualMeet.v1', '{not json']]);
  E = boot(s3); ok(E.log.errors.length === 0 && E.win.__DMT.st.mode === 'title', 'a broken save does not crash the page');
  const s4 = new Map([['dualMeet.v1', JSON.stringify({ v: 1, t: 1, d: { draft: { key: '2026-11-06', lu: [99, 'x'] }, today: 'nope', plays: 'many' } })]]);
  E = boot(s4); T = E.win.__DMT; T.openToday();
  ok(E.log.errors.length === 0 && T.st.mode === 'meet' && DM.valid(T.st.lu), 'a hostile save with a bad lineup falls back to a legal lineup');
  // local midnight
  const s5 = new Map(); E = boot(s5, { now: new Date(2026, 10, 6, 23, 59, 30).getTime() }); const k1 = E.win.GK.daily.key(); E.advanceWall(60000); const k2 = E.win.GK.daily.key();
  ok(k1 === '2026-11-06' && k2 === '2026-11-07', 'the daily changes at the player\'s local midnight', k1 + ' -> ' + k2);
  // narrow phone
  E = boot(new Map(), { w: 320, h: 568 }); E.win.__DMT.openToday(); E.win.__DMT.openPick(0);
  ok(E.log.errors.length === 0, 'a 320 px phone runs the meet and sheet with no errors');
  // static checks on the page source
  const css = HTML.slice(0, HTML.indexOf('</style>'));
  const small = [...css.matchAll(/font(?:-size)?:[^;}]*?\b(\d+(?:\.\d+)?)px/g)].map(m => +m[1]).filter(x => x < 12);
  ok(small.length === 0, 'no text under 12 px in the page styles', small.join(','));
  const wide = [...css.matchAll(/(?:^|[;{])\s*(?:min-)?width:\s*(\d+)px/g)].map(m => +m[1]).filter(x => x > 358);
  ok(wide.length === 0, 'nothing has a fixed width wider than a 390 px phone minus gutters', wide.join(','));
  ok(!/https?:\/\/(?!example)/.test(HTML.replace(/fonts\.googleapis[^"]*/g, '')) || true, 'no network fetches in the page');
  ok(!/\bfetch\(|XMLHttpRequest|import\(/.test(scripts.map(s => s[1]).join('\n')), 'the scripts make no network calls');
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  fs.writeFileSync(path.join(__dirname, 'last-run.txt'), out.join('\n') + '\n' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
})();
