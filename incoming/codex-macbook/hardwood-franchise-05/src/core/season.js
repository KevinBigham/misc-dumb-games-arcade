// ===== season.js — calendar, playoffs, awards, offseason =====
const LINE_KEYS = ['min', 'pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'orb', 'drb', 'ast', 'stl', 'blk', 'tov', 'pf'];

function todaysGames(S) {
  if (S.phase === PH.REG) return S.sched.filter(g => g.day === S.day);
  if (S.phase === PH.PO) return poToday(S);
  return [];
}
function userGameToday(S) { return todaysGames(S).find(g => g.hs == null && (g.h === S.user || g.a === S.user)); }
function seasonOver(S) { return S.phase === PH.REG && S.sched.every(g => g.hs != null); }

function playGame(S, g, sim) {
  if (!sim) { sim = new GameSim(S, g, {}); sim.simToEnd(); }
  applyResult(S, g, sim);
  return sim;
}

function applyResult(S, g, sim) {
  const po = S.phase === PH.PO;
  g.hs = sim.score[0]; g.as = sim.score[1]; g.ot = Math.max(0, sim.q - 4);
  for (const s of [0, 1]) {
    const T = sim.T[s];
    for (const gp of T.ps) {
      if (gp.st.min <= 0) continue;
      const c0 = po ? 0 : careerPts(gp.p);
      if (c0 && Math.floor((c0 + gp.st.pts) / 5000) > Math.floor(c0 / 5000) && c0 + gp.st.pts >= 10000) { const m = Math.floor((c0 + gp.st.pts) / 5000) * 5000; addNews(S, { type: 'milestone', tids: [T.tid], pids: [gp.pid], h: `${pname(gp.p)} reaches ${m.toLocaleString()} career points`, b: `He got there with ${gp.st.pts} against ${S.teams[sim.T[1 - s].tid].name}.`, imp: m >= 20000 ? 4 : 3, local: T.tid === S.user }); }
      const row = seasonRow(gp.p, S.season, T.tid, po ? 1 : 0);
      row.gp++; if (gp.starter) row.gs++;
      for (const k of LINE_KEYS) row[k] += gp.st[k];
      row.min = Math.round(row.min * 10) / 10;
    }
  }
  for (const tid of [g.h, g.a]) for (const p of roster(S, tid)) {
    if (p.inj && p.inj.games > 0) {
      p.inj.games--;
      if (p.inj.games <= 0) { const long = (p.inj.len || 9) >= 5; p.inj = null; if (tid === S.user && long) inbox(S, { from: `Head Trainer ${staffName(S.teams[tid].staff.trainer)}`, subj: `${pname(p)} cleared to play`, body: `${pname(p)} is healthy and available.` }); if (tid === S.user || !S.teams[tid].autoRot) ensureRotation(S, tid); }
    }
  }
  for (const inj of sim.injuries) {
    const p = P(S, inj.pid);
    p.inj = { type: inj.type, games: inj.games, len: inj.games, d: S.day };
    if (p.tid < 0) continue;
    if (p.tid === S.user && inj.games >= 3) inbox(S, { from: `Head Trainer ${staffName(S.teams[p.tid].staff.trainer)}`, subj: `Injury: ${pname(p)}`, body: `${pname(p)} suffered a ${inj.type.toLowerCase()}. Expected to miss ${inj.games} game${inj.games > 1 ? 's' : ''}.${S.teams[S.user].autoRot ? ' Rotation adjusted automatically.' : ' Check your rotation.'}` });
    if (inj.games >= 8 && (p.ovr >= 78 || p.tid === S.user)) addNews(S, { type: 'injury', tids: [p.tid], pids: [p.pid], h: `${pname(p)} out ${inj.games >= 60 ? 'for the season' : inj.games + ' games'} with ${inj.type.toLowerCase()}`, b: `A tough blow for the ${S.teams[p.tid].name}.`, imp: p.ovr >= 85 ? 3 : 2, local: p.tid === S.user });
    ensureRotation(S, p.tid);
  }
  const H = S.teams[g.h], A = S.teams[g.a];
  const hw = g.hs > g.as;
  if (!po) {
    recUpdate(H, A, hw, g.hs, g.as, true);
    recUpdate(A, H, !hw, g.as, g.hs, false);
    (hw ? H : A).staff.hc.wins++; (hw ? A : H).staff.hc.losses++;
  } else poAfterGame(S, g);
  hypeAfterGame(S, H, hw, Math.abs(g.hs - g.as), po);
  hypeAfterGame(S, A, !hw, Math.abs(g.hs - g.as), po);
  gameFinances(S, g, po);
  gameStories(S, g, sim, po);
  const isUser = g.h === S.user || g.a === S.user;
  const b = sim.box(); b.s = S.season; b.d = S.day; b.po = po; b.h = g.h; b.a = g.a;
  if (!isUser) delete b.shots;
  if (isUser) for (const k in S.box) { const o = S.box[k]; if (o.log && (o.h === S.user || o.a === S.user) && S.day - o.d > 14) { delete o.log; delete o.shots; } }
  if (isUser) b.log = sim.log.filter(e => e.type !== 'sub' || !e.quiet).map(e => [e.q, Math.round(e.clk), e.side, e.text, e.sc[0], e.sc[1], e.type === 'shot' && e.made ? 1 : 0]);
  S.box[g.gid] = b;
}
function recUpdate(t, o, won, pf, pa, home) {
  const r = t.rec;
  if (won) { r.w++; home ? r.hw++ : r.aw++; } else { r.l++; home ? r.hl++ : r.al++; }
  if (t.conf === o.conf) won ? r.cw++ : r.cl++;
  if (t.div === o.div) won ? r.dw++ : r.dl++;
  r.pf += pf; r.pa += pa;
  r.str = won ? (r.str > 0 ? r.str + 1 : 1) : (r.str < 0 ? r.str - 1 : -1);
  r.l10.push(won ? 1 : 0); if (r.l10.length > 10) r.l10.shift();
}
function pruneBoxes(S) {
  for (const gid in S.box) {
    const b = S.box[gid];
    if (b.s !== S.season) { delete S.box[gid]; continue; }
    if (!b.po && b.h !== S.user && b.a !== S.user && S.day - b.d > 3) delete S.box[gid];
  }
}

// one full day: every unplayed game today, then the calendar moves
function simDay(S) {
  if (S.allStar && !S.allStar.finished) return 'allstar';
  if (S.phase !== PH.REG && S.phase !== PH.PO) return 'phase';
  for (const g of todaysGames(S)) if (g.hs == null) playGame(S, g);
  return endDay(S);
}
function endDay(S) {
  if (S.phase === PH.REG) {
    for (const t of S.teams) if (t.tid !== S.user) aiFillRoster(S, t.tid);
    if (S.day % 7 === 0) weekly(S);
    if (S.day === S.deadlineDay) {
      addNews(S, { type: 'league', tids: [], h: 'The trade deadline has passed', b: 'Rosters are set for the stretch run. Free agents can still be signed.', imp: 2 });
      inbox(S, { from: 'League Office', subj: 'Trade deadline passed', body: 'No more trades until after the playoffs. You can still sign free agents.' });
    }
    if (S.day === S.deadlineDay - 3) inbox(S, { from: 'League Office', subj: 'Trade deadline in 3 days', body: `The deadline is after Day ${S.deadlineDay}. Get your deals done.` });
    S.day++;
    pruneBoxes(S);
    if (S.day === S.allStarDay) allStarSelect(S);
    if (seasonOver(S)) { endRegularSeason(S); return 'season-end'; }
    return 'ok';
  }
  if (S.phase === PH.PO) {
    poEndDay(S);
    S.day++;
    if (S.playoffs.champ != null) return 'champ';
    return 'ok';
  }
  return 'phase';
}
function careerPts(p) { let s = 0; for (const r of p.stats) if (!r.po) s += r.pts; return s; }
function playerOfWeek(S) {
  const snap = S.wk || {};
  const next = {};
  const best = [null, null];
  for (const p of S.players) {
    if (p.tid < 0) continue;
    const t = seasonTotals(p, S.season, 0);
    next[p.pid] = [t.gp, t.pts, t.orb + t.drb, t.ast, t.stl + t.blk];
    const o = snap[p.pid] || [0, 0, 0, 0, 0];
    const gp = t.gp - o[0];
    if (gp < 2) continue;
    const recent = p.awards.filter(a => a.t === 'POW' && a.s === S.season && S.day - (a.d || 0) < 28).length;
    const v = ((t.pts - o[1]) + (t.orb + t.drb - o[2]) * 0.7 + (t.ast - o[3]) * 0.8 + (t.stl + t.blk - o[4])) / gp + winPct(S.teams[p.tid].rec) * 4 - recent * 6;
    const c = S.teams[p.tid].conf;
    if (!best[c] || v > best[c].v) best[c] = { p, v, gp, pts: (t.pts - o[1]) / gp, reb: (t.orb + t.drb - o[2]) / gp, ast: (t.ast - o[3]) / gp };
  }
  S.wk = next;
  for (const b of best) {
    if (!b) continue;
    b.p.awards.push({ s: S.season, t: 'POW', d: S.day });
    addNews(S, { type: 'award', tids: [b.p.tid], pids: [b.p.pid], h: `${pname(b.p)} named ${CONFS[S.teams[b.p.tid].conf]} Player of the Week`, b: `${b.pts.toFixed(1)} points, ${b.reb.toFixed(1)} rebounds and ${b.ast.toFixed(1)} assists over ${b.gp} games.`, imp: 2, local: b.p.tid === S.user });
  }
}
function agentCalls(S) {
  if (S.day < 14 || S.day > S.deadlineDay + 20) return;
  for (const p of roster(S, S.user)) {
    if (p.contract.exp !== S.season || p.extAsked === S.season || p.ovr < 72) continue;
    if (Math.random() > 0.25) continue;
    p.extAsked = S.season;
    const a = contractAsk(S, p, p.tid);
    inbox(S, { from: `${pname(p)}'s agent`, subj: `Extension talks for ${pname(p)}?`, body: `My client is in the last year of his deal and would consider an extension in the neighborhood of ${U.money(a.amt)} a year for ${a.yrs} years. ${resignStatus(S, p) === 'willing' ? 'He likes it here.' : 'Frankly, he is curious about the open market.'}`, act: { kind: 'ext', pid: p.pid } });
  }
}
function weekly(S) {
  updateMorale(S);
  if (S.day >= 7) playerOfWeek(S); else S.wk = null;
  agentCalls(S);
  weeklyNews(S);
  radioShow(S);
  tradeBlockOffers(S);
  if (Math.random() < 0.6) aiAiTrade(S);
}

// ---------- All-Star Weekend ----------
function allStarScore(S, p) {
  const t = seasonTotals(p, S.season, 0); if (t.gp < 5) return 0;
  const pg = perGame(t);
  const team = S.teams[p.tid];
  return pg.eff * (0.8 + winPct(team.rec) * 0.4) + pg.ppg * 0.25 + (p.ovr - 75) * 0.15 + Math.log(1 + team.pop) * 0.4 + U.rf(0, 1.5);
}
function allStarSelect(S) {
  const sel = [[], []], starters = [[], []];
  for (const c of [0, 1]) {
    const pool = U.sortBy(S.players.filter(p => p.tid >= 0 && S.teams[p.tid].conf === c && !(p.inj && p.inj.games > 10)), p => allStarScore(S, p));
    const g = pool.filter(p => p.pos === 'PG' || p.pos === 'SG').slice(0, 2);
    const f = pool.filter(p => !g.includes(p) && (p.pos === 'SF' || p.pos === 'PF' || p.pos === 'C')).slice(0, 3);
    starters[c] = g.concat(f).map(p => p.pid);
    const res = pool.filter(p => !starters[c].includes(p.pid)).slice(0, 7);
    sel[c] = starters[c].concat(res.map(p => p.pid));
    for (const pid of sel[c]) P(S, pid).awards.push({ s: S.season, t: 'AS' });
  }
  const all = S.players.filter(p => p.tid >= 0 && !(p.inj && p.inj.games > 0));
  const three = U.sortBy(all, p => p.r.tpt * 1.5 + seasonTotals(p, S.season).tpm / 3 + U.rf(0, 4)).slice(0, 6).map(p => p.pid);
  const dunk = U.sortBy(all.filter(p => p.age <= 29), p => p.r.jmp * 1.4 + p.r.ins * 0.3 + U.rf(0, 12)).slice(0, 4).map(p => p.pid);
  S.allStar = { s: S.season, sel, starters, three, dunk, done: {}, res: {}, finished: false };
  const ut = sel[0].concat(sel[1]).filter(pid => P(S, pid).tid === S.user);
  addNews(S, { type: 'allstar', tids: [], h: 'All-Star rosters announced', b: `East starters: ${starters[0].map(id => pname(P(S, id))).join(', ')}. West starters: ${starters[1].map(id => pname(P(S, id))).join(', ')}.`, imp: 3 });
  if (ut.length) inbox(S, { from: 'League Office', subj: 'All-Star selection', body: `Congratulations: ${ut.map(id => pname(P(S, id))).join(', ')} ${ut.length > 1 ? 'were' : 'was'} named to the All-Star team.` });
}
function allStarGame(S) {
  const A = S.allStar;
  const mins = {};
  const ros = [0, 1].map(c => {
    const ids = A.sel[c].filter(id => { const p = P(S, id); return !p.inj || p.inj.games <= 0; });
    ids.forEach((id, i) => mins[id] = i < 5 ? 26 : 16);
    return { pids: ids, mins, abbr: c === 0 ? 'EAST' : 'WEST', name: c === 0 ? 'East' : 'West' };
  });
  const sim = new GameSim(S, { gid: 0, h: -1, a: -2 }, { allStar: true, rosters: ros });
  return sim;
}
function allStarFinish(S, sim) {
  const A = S.allStar;
  const w = sim.score[0] > sim.score[1] ? 0 : 1;
  const mvp = U.maxBy(sim.T[w].ps, g => g.st.pts + (g.st.orb + g.st.drb) * 0.7 + g.st.ast * 0.8);
  A.res.game = { score: sim.score.slice(), mvp: mvp.pid, box: sim.box() };
  delete A.res.game.box.shots;
  A.done.game = true;
  mvp.p.awards.push({ s: S.season, t: 'ASMVP' });
  addNews(S, { type: 'allstar', tids: [], pids: [mvp.pid], h: `${w === 0 ? 'East' : 'West'} win the All-Star Game ${Math.max(...sim.score)}-${Math.min(...sim.score)}; ${pname(mvp.p)} named MVP`, b: `${pname(mvp.p)} had ${mvp.st.pts} points, ${mvp.st.orb + mvp.st.drb} rebounds and ${mvp.st.ast} assists.`, imp: 3 });
  checkAllStarDone(S);
}
function threeRound(p) {
  // 25 balls: 5 racks, last ball of each is the money ball
  const pm = U.clamp(0.28 + (p.r.tpt - 50) * 0.0095, 0.2, 0.72);
  const racks = [];
  let tot = 0;
  for (let r = 0; r < 5; r++) { const rack = []; for (let b = 0; b < 5; b++) { const m = Math.random() < pm; rack.push(m ? 1 : 0); if (m) tot += b === 4 ? 2 : 1; } racks.push(rack); }
  return { pid: p.pid, racks, tot };
}
function threeContest(S, userScores) {
  // userScores: {pid: {racks, tot}} for rounds played by the user (round 1 / final)
  const A = S.allStar;
  const r1 = A.three.map(id => (userScores && userScores.r1 && userScores.r1[id]) || threeRound(P(S, id)));
  const fin = r1.slice().sort((a, b) => b.tot - a.tot).slice(0, 3);
  const r2 = fin.map(x => (userScores && userScores.r2 && userScores.r2[x.pid]) || threeRound(P(S, x.pid)));
  r2.sort((a, b) => b.tot - a.tot);
  A.res.three = { r1, r2, winner: r2[0].pid };
  A.done.three = true;
  P(S, r2[0].pid).awards.push({ s: S.season, t: '3PT' });
  addNews(S, { type: 'allstar', tids: [P(S, r2[0].pid).tid], pids: [r2[0].pid], h: `${pname(P(S, r2[0].pid))} wins the Three-Point Shootout`, b: `He posted ${r2[0].tot} in the final round.`, imp: 2 });
  checkAllStarDone(S);
}
const DUNKS = ['a windmill from the baseline', 'a 360 reverse jam', 'a between-the-legs slam', 'an off-the-backboard self-alley-oop', 'a two-hand tomahawk over a mascot', 'a free-throw-line takeoff', 'a behind-the-back dunk', 'a cradle rock jam', 'a double-pump reverse', 'an elbow-in-the-rim hang'];
function dunkContest(S) {
  const A = S.allStar;
  const score = p => { const base = 34 + (p.r.jmp - 60) * 0.28 + U.gauss(0, 4.5); return U.clamp(Math.round(base), 28, 50); };
  const r1 = A.dunk.map(id => { const p = P(S, id); const d1 = { dunk: U.pick(DUNKS), s: score(p) }, d2 = { dunk: U.pick(DUNKS), s: score(p) }; return { pid: id, d: [d1, d2], tot: d1.s + d2.s }; });
  const fin = r1.slice().sort((a, b) => b.tot - a.tot).slice(0, 2);
  const r2 = fin.map(x => { const p = P(S, x.pid); const d1 = { dunk: U.pick(DUNKS), s: score(p) }, d2 = { dunk: U.pick(DUNKS), s: score(p) }; return { pid: x.pid, d: [d1, d2], tot: d1.s + d2.s }; });
  if (r2[0].tot === r2[1].tot) r2[0].tot++;
  r2.sort((a, b) => b.tot - a.tot);
  A.res.dunk = { r1, r2, winner: r2[0].pid };
  A.done.dunk = true;
  P(S, r2[0].pid).awards.push({ s: S.season, t: 'DUNK' });
  addNews(S, { type: 'allstar', tids: [P(S, r2[0].pid).tid], pids: [r2[0].pid], h: `${pname(P(S, r2[0].pid))} wins the Slam Dunk Contest`, b: `His clincher: ${r2[0].d[1].dunk} for a ${r2[0].d[1].s}.`, imp: 2 });
  checkAllStarDone(S);
}
function checkAllStarDone(S) { const d = S.allStar.done; if (d.game && d.three && d.dunk) S.allStar.finished = true; }
function allStarAuto(S) {
  if (!S.allStar.done.dunk) dunkContest(S);
  if (!S.allStar.done.three) threeContest(S);
  if (!S.allStar.done.game) { const sim = allStarGame(S); sim.simToEnd(); allStarFinish(S, sim); }
}

// ---------- awards ----------
function computeAwards(S) {
  const G = S.settings.games, season = S.season;
  const rows = S.players.filter(p => p.tid >= 0).map(p => { const t = seasonTotals(p, season, 0); return { p, t, pg: perGame(t), team: S.teams[p.tid] }; }).filter(x => x.t.gp >= G * 0.5);
  const mvpS = x => x.pg.eff * (0.72 + winPct(x.team.rec) * 0.56) + x.pg.ppg * 0.18;
  const dS = x => x.pg.spg * 2.2 + x.pg.bpg * 2.4 + x.pg.rpg * 0.35 + (x.p.r.pdf + x.p.r.idf) / 40 + winPct(x.team.rec) * 3 + x.pg.mpg / 15;
  const byM = U.sortBy(rows, mvpS), byD = U.sortBy(rows, dS);
  const rook = U.sortBy(rows.filter(x => x.p.yrsPro === 0), x => x.pg.eff + x.pg.ppg * 0.3);
  const sixth = U.sortBy(rows.filter(x => x.t.gs < x.t.gp * 0.35), x => x.pg.ppg * 0.6 + x.pg.eff * 0.5);
  const mip = U.sortBy(rows.filter(x => x.p.yrsPro >= 1).map(x => { const prev = seasonTotals(x.p, season - 1, 0); if (prev.gp < G * 0.3) return null; const pp = perGame(prev); return Object.assign({ d: (x.pg.eff - pp.eff) + (x.pg.ppg - pp.ppg) * 0.6 }, x); }).filter(Boolean), x => x.d);
  const teams = (list, n) => {
    const out = []; const used = new Set();
    for (let k = 0; k < n; k++) {
      const team = []; const need = { G: 2, F: 2, C: 1 };
      for (const x of list) {
        if (used.has(x.p.pid)) continue;
        const grp = x.p.pos === 'PG' || x.p.pos === 'SG' ? 'G' : x.p.pos === 'C' ? 'C' : 'F';
        let slot = need[grp] > 0 ? grp : (grp === 'F' && x.p.pos === 'PF' && need.C > 0 ? 'C' : null);
        if (!slot) continue;
        need[slot]--; team.push(x.p.pid); used.add(x.p.pid);
        if (team.length === 5) break;
      }
      out.push(team);
    }
    return out;
  };
  const coy = U.maxBy(S.teams, t => { const prev = t.hist[t.hist.length - 1]; const exp = prev ? prev.w / Math.max(1, prev.w + prev.l) : 0.5; return winPct(t.rec) - exp * 0.7 + winPct(t.rec) * 0.3; });
  const lead = k => { const r = U.maxBy(rows.filter(x => x.t.gp >= G * 0.7), x => x.pg[k]); return r ? r.p.pid : null; };
  const A = {
    mvp: byM[0] && byM[0].p.pid, dpoy: byD[0] && byD[0].p.pid, roy: rook[0] && rook[0].p.pid, smoy: sixth[0] && sixth[0].p.pid, mip: mip[0] && mip[0].p.pid,
    coy: { tid: coy.tid, n: staffName(coy.staff.hc) }, all: teams(byM, 3), alld: teams(byD, 2), allr: rook.slice(0, 5).map(x => x.p.pid),
    lead: { pts: lead('ppg'), reb: lead('rpg'), ast: lead('apg'), stl: lead('spg'), blk: lead('bpg') }, mvpVote: byM.slice(0, 5).map(x => x.p.pid),
  };
  const give = (pid, t) => { if (pid != null) P(S, pid).awards.push({ s: season, t }); };
  give(A.mvp, 'MVP'); give(A.dpoy, 'DPOY'); give(A.roy, 'ROY'); give(A.smoy, '6MOY'); give(A.mip, 'MIP');
  A.all.forEach((tm, i) => tm.forEach(pid => give(pid, 'ALL' + (i + 1)))); A.alld.forEach((tm, i) => tm.forEach(pid => give(pid, 'ALLD' + (i + 1))));
  A.allr.forEach(pid => give(pid, 'ALLR')); give(A.lead.pts, 'SCOR');
  coy.staff.hc.coy = (coy.staff.hc.coy || 0) + 1;
  // season records
  for (const x of rows) {
    pushRecord(S.records.season.ppg, { v: Math.round(x.pg.ppg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
    pushRecord(S.records.season.rpg, { v: Math.round(x.pg.rpg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
    pushRecord(S.records.season.apg, { v: Math.round(x.pg.apg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
  }
  for (const t of S.teams) pushRecord(S.records.team.wins, { v: t.rec.w, l: t.rec.l, tid: t.tid, n: tname(t), s: season, g: G });
  return A;
}
const AWARD_NAMES = { POW: 'Player of the Week', MVP: 'Most Valuable Player', DPOY: 'Defensive Player of the Year', ROY: 'Rookie of the Year', '6MOY': 'Sixth Man of the Year', MIP: 'Most Improved Player', FMVP: 'Finals MVP', ALL1: 'All-League 1st Team', ALL2: 'All-League 2nd Team', ALL3: 'All-League 3rd Team', ALLD1: 'All-Defense 1st Team', ALLD2: 'All-Defense 2nd Team', ALLR: 'All-Rookie Team', AS: 'All-Star', ASMVP: 'All-Star Game MVP', CHAMP: 'Champion', SCOR: 'Scoring Title', '3PT': 'Three-Point Shootout Winner', DUNK: 'Slam Dunk Champion' };

function endRegularSeason(S) {
  S.seasonAwards = computeAwards(S);
  const A = S.seasonAwards;
  const t = S.teams;
  const best = standings(S)[0];
  addNews(S, { type: 'league', tids: [best.tid], h: `Regular season wraps: ${tname(best)} finish with the league's best record (${best.rec.w}-${best.rec.l})`, b: 'The playoff bracket is set.', imp: 3 });
  if (A.mvp != null) { const p = P(S, A.mvp); const pg = perGame(seasonTotals(p, S.season)); addNews(S, { type: 'award', tids: [p.tid], pids: [p.pid], h: `${pname(p)} named league MVP`, b: `${pg.ppg.toFixed(1)} points, ${pg.rpg.toFixed(1)} rebounds and ${pg.apg.toFixed(1)} assists for the ${S.teams[p.tid].name}.`, imp: 5 }); }
  setupPlayoffs(S);
}

// ---------- playoffs ----------
function setupPlayoffs(S) {
  const seeds = [confSeeds(S, 0).slice(0, 8).map(t => t.tid), confSeeds(S, 1).slice(0, 8).map(t => t.tid)];
  const r1 = [];
  for (const c of [0, 1]) { const s = seeds[c]; for (const [a, b] of [[0, 7], [3, 4], [2, 5], [1, 6]]) r1.push({ hi: s[a], lo: s[b], w: [0, 0], g: 0, conf: c, winner: null }); }
  S.playoffs = { seeds, round: 0, rounds: [r1], games: [], champ: null, today: null, todayDay: -1 };
  S.phase = PH.PO; S.day = 1;
  const ut = seeds.flat().indexOf(S.user);
  const t = S.teams[S.user];
  if (ut >= 0) { const c = t.conf, seed = seeds[c].indexOf(S.user) + 1; inbox(S, { from: 'League Office', subj: 'You\'re in the playoffs!', body: `The ${t.name} are the No. ${seed} seed in the ${CONFS[c]}.` }); t.hype = Math.min(100, t.hype + 6); }
  else inbox(S, { from: 'Front Office', subj: 'Season over', body: `The ${t.name} missed the playoffs at ${t.rec.w}-${t.rec.l}. The lottery awaits.` });
}
function seedOf(S, tid) { const PO = S.playoffs; for (const c of [0, 1]) { const i = PO.seeds[c].indexOf(tid); if (i >= 0) return i + 1; } return 99; }
function poToday(S) {
  const PO = S.playoffs;
  if (PO.todayDay === S.day) return PO.today;
  const games = [];
  for (const sr of PO.rounds[PO.round]) {
    if (sr.winner != null) continue;
    const n = sr.g + 1;
    const hiHome = [1, 2, 5, 7].includes(n);
    games.push({ gid: S.nextGid++, day: S.day, h: hiHome ? sr.hi : sr.lo, a: hiHome ? sr.lo : sr.hi, hs: null, as: null, ot: 0, po: true, n, round: PO.round });
  }
  PO.today = games; PO.todayDay = S.day;
  return games;
}
function seriesOf(S, a, b) { return S.playoffs.rounds[S.playoffs.round].find(x => (x.hi === a && x.lo === b) || (x.hi === b && x.lo === a)); }
const ROUND_NAMES = ['First Round', 'Conference Semifinals', 'Conference Finals', 'Finals'];
function poAfterGame(S, g) {
  const PO = S.playoffs;
  const sr = seriesOf(S, g.h, g.a);
  sr.g++;
  const winTid = g.hs > g.as ? g.h : g.a;
  sr.w[winTid === sr.hi ? 0 : 1]++;
  PO.games.push({ gid: g.gid, round: PO.round, h: g.h, a: g.a, hs: g.hs, as: g.as, ot: g.ot, n: g.n });
  if (sr.w[0] === 4 || sr.w[1] === 4) {
    sr.winner = sr.w[0] === 4 ? sr.hi : sr.lo;
    const w = S.teams[sr.winner], l = S.teams[sr.winner === sr.hi ? sr.lo : sr.hi];
    const res = `${Math.max(...sr.w)}-${Math.min(...sr.w)}`;
    if (PO.round < 3) addNews(S, { type: 'playoffs', tids: [w.tid, l.tid], h: `${tname(w)} eliminate ${l.name} ${res} in the ${ROUND_NAMES[PO.round]}`, b: `${seedOf(S, w.tid) > seedOf(S, l.tid) ? 'An upset!' : 'Chalk holds.'} ${w.name} advance.`, imp: 3, local: w.tid === S.user || l.tid === S.user });
  }
}
function poEndDay(S) {
  const PO = S.playoffs;
  const cur = PO.rounds[PO.round];
  if (!cur.every(x => x.winner != null)) return;
  if (PO.round === 3) { PO.champ = cur[0].winner; finishPlayoffs(S); return; }
  const w = cur.map(x => x.winner);
  let next = [];
  if (PO.round < 2) { for (let i = 0; i < w.length; i += 2) next.push(mkSeries(S, w[i], w[i + 1], cur[i].conf)); }
  else next = [mkSeries(S, w[0], w[1], -1)];
  PO.rounds.push(next); PO.round++;
}
function mkSeries(S, a, b, conf) {
  let hiA;
  if (conf >= 0) hiA = seedOf(S, a) < seedOf(S, b);
  else { const ra = S.teams[a].rec, rb = S.teams[b].rec; hiA = winPct(ra) > winPct(rb) || (winPct(ra) === winPct(rb) && Math.random() < 0.5); }
  return { hi: hiA ? a : b, lo: hiA ? b : a, w: [0, 0], g: 0, conf, winner: null };
}
function poRoundReached(S, tid) {
  const PO = S.playoffs; if (!PO) return 0;
  if (PO.champ === tid) return 5;
  let r = 0;
  PO.rounds.forEach((rd, i) => { if (rd.some(x => x.hi === tid || x.lo === tid)) r = i + 1; });
  return r;
}
const PO_RESULT = ['Missed playoffs', 'Lost 1st round', 'Lost conf. semis', 'Lost conf. finals', 'Lost Finals', 'Champions'];
function finishPlayoffs(S) {
  const PO = S.playoffs;
  const champ = S.teams[PO.champ];
  const fin = PO.rounds[3][0];
  const runner = S.teams[fin.winner === fin.hi ? fin.lo : fin.hi];
  // Finals MVP from finals box scores
  const tally = {};
  for (const g of PO.games.filter(x => x.round === 3)) {
    const b = S.box[g.gid]; if (!b) continue;
    for (const T of b.teams) if (T.tid === champ.tid) for (const l of T.ps) { tally[l.pid] = (tally[l.pid] || 0) + l.pts + (l.orb + l.drb) * 0.7 + l.ast * 0.8 + l.stl + l.blk; }
  }
  const fmvp = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  if (fmvp) P(S, +fmvp).awards.push({ s: S.season, t: 'FMVP' });
  for (const p of roster(S, champ.tid)) p.awards.push({ s: S.season, t: 'CHAMP' });
  champ.staff.hc.titles++;
  champ.hype = Math.min(100, champ.hype + 15);
  addNews(S, { type: 'champ', tids: [champ.tid], h: `${tname(champ).toUpperCase()} ARE CHAMPIONS!`, b: `The ${champ.name} beat the ${runner.name} ${Math.max(...fin.w)}-${Math.min(...fin.w)} in the Finals.${fmvp ? ' ' + pname(P(S, +fmvp)) + ' is Finals MVP.' : ''}`, imp: 5 });
  for (const t of S.teams) {
    t.hist.push({ s: S.season, w: t.rec.w, l: t.rec.l, po: poRoundReached(S, t.tid), seed: PO.seeds[t.conf].indexOf(t.tid) + 1, coach: staffName(t.staff.hc) });
  }
  const A = S.seasonAwards || {};
  S.history.push({
    s: S.season, champ: champ.tid, champName: tname(champ), runner: runner.tid, runnerName: tname(runner), series: `${Math.max(...fin.w)}-${Math.min(...fin.w)}`,
    fmvp: fmvp ? +fmvp : null, fmvpN: fmvp ? pname(P(S, +fmvp)) : '', mvp: A.mvp, mvpN: A.mvp != null ? pname(P(S, A.mvp)) : '', roy: A.roy, royN: A.roy != null ? pname(P(S, A.roy)) : '',
    dpoy: A.dpoy, dpoyN: A.dpoy != null ? pname(P(S, A.dpoy)) : '', smoyN: A.smoy != null ? pname(P(S, A.smoy)) : '', mipN: A.mip != null ? pname(P(S, A.mip)) : '', coy: A.coy,
    user: { w: S.teams[S.user].rec.w, l: S.teams[S.user].rec.l, po: poRoundReached(S, S.user) }, best: standings(S)[0].tid,
  });
  closeSeasonBooks(S);
  S.phase = PH.END;
  const ur = poRoundReached(S, S.user);
  inbox(S, { from: 'Front Office', subj: `Season review: ${U.seasonLabel(S.season)}`, body: `Final record ${S.teams[S.user].rec.w}-${S.teams[S.user].rec.l}. ${PO_RESULT[ur]}. Check the Season Review for awards, finances and your offseason plan.` });
}

// ---------- offseason ----------
function hofScore(p) {
  const c = careerTotals(p, 0);
  const aw = t => p.awards.filter(a => a.t === t).length;
  return c.pts / 1000 * 2 + (c.orb + c.drb) / 1000 * 1.1 + c.ast / 1000 * 1.6 + aw('MVP') * 10 + aw('FMVP') * 4 + aw('ALL1') * 4 + (aw('ALL2') + aw('ALL3')) * 2 + aw('AS') * 1.5 + aw('CHAMP') * 1.5 + aw('DPOY') * 3;
}
function startOffseason(S) {
  // progression
  const report = [];
  for (const p of S.players.filter(x => x.tid >= -1)) {
    const t = p.tid >= 0 ? S.teams[p.tid] : null;
    const mpg = p.tid >= 0 ? currentMpg(S, p) : 0;
    const before = p.ovr;
    progressPlayer(p, { coachDev: t ? t.staff.hc.r.dev : 45, facility: t ? t.arena.up.prac : 0, asst: t ? t.staff.asst.r.dev : 45, mpg: mpg || 0 });
    p.hist.push({ s: S.season, ovr: p.ovr, tid: p.tid });
    if (p.tid === S.user) report.push({ pid: p.pid, n: pname(p), pos: p.pos, age: p.age, before, after: p.ovr, pot: p.pot });
  }
  for (const p of S.players.filter(x => x.tid === -2)) { const d = U.ri(0, 3); devPlayer(p, d); p.pot = Math.max(p.pot, p.ovr + 1); }
  normalizeLeague(S);
  for (const r of report) r.after = P(S, r.pid).ovr;
  S.progReport = report.sort((a, b) => (b.after - b.before) - (a.after - a.before));
  // retirements
  const retired = [];
  for (const p of S.players.filter(x => x.tid >= -1)) {
    let pr = 0;
    if (p.age >= 33) pr = 0.06 + (p.age - 33) * 0.14;
    if (p.age >= 30 && p.ovr < 63) pr += 0.3;
    if (p.tid === -1 && p.age >= 27 && p.ovr < 68) pr += 0.4;
    if (p.tid === -1 && (p.faYrs || 0) >= 2) pr += 0.5;
    if (p.age >= 39) pr = 0.95;
    if (p.ovr >= 85 && p.age < 37) pr *= 0.3;
    if (p.tid >= 0 && p.contract.exp > S.season && p.age < 37) pr *= 0.35;
    if (Math.random() < pr) retired.push(p);
  }
  for (const p of retired) retirePlayer(S, p);
  for (const p of S.players) p.faYrs = p.tid === -1 ? (p.faYrs || 0) + 1 : 0;
  // keep the free-agent pool a sane size
  const fas = U.sortBy(S.players.filter(p => p.tid === -1), p => playerWorth(p));
  for (const p of fas.slice(90)) retirePlayer(S, p);
  // hall of fame
  for (const p of S.retired.filter(x => x.hofEligible === S.season)) {
    if (hofScore(p) >= 40) { p.hof = S.season; S.hof.push(p.pid); addNews(S, { type: 'hof', tids: [], pids: [p.pid], h: `${pname(p)} elected to the Hall of Fame`, b: `A career of ${careerTotals(p).pts.toLocaleString()} points and ${p.awards.filter(a => a.t === 'AS').length} All-Star selections.`, imp: 3 }); }
  }
  // staff: AI teams hire and fire
  for (const t of S.teams) {
    const h = t.hist[t.hist.length - 1];
    if (t.tid !== S.user) {
      const bad = h && h.w / Math.max(1, h.w + h.l) < 0.36;
      if ((bad && Math.random() < 0.55) || (t.staff.hc.exp <= S.season && Math.random() < 0.5)) {
        const old = t.staff.hc;
        t.staff.hc = genStaff(S, 'hc', U.gauss(62, 10)); t.staff.hc.exp = S.season + U.ri(2, 4);
        t.strat.pace = t.staff.hc.pace; t.strat.def = t.staff.hc.scheme;
        addNews(S, { type: 'coach', tids: [t.tid], h: `${tname(t)} ${bad ? 'fire' : 'part ways with'} coach ${staffName(old)}`, b: `${staffName(t.staff.hc)} takes over.`, imp: 2 });
      }
      for (const k of ['hc', 'asst', 'trainer', 'scout']) if (t.staff[k].exp <= S.season) t.staff[k].exp = S.season + U.ri(1, 3);
    } else {
      const exp = Object.values(t.staff).filter(s => s.exp <= S.season);
      if (exp.length) inbox(S, { from: 'Front Office', subj: 'Staff contracts expiring', body: `${exp.map(s => staffName(s) + ' (' + STAFF_ROLES[s.role] + ')').join(', ')} ${exp.length > 1 ? 'are' : 'is'} out of contract. Re-sign or replace them on the Staff screen before next season.` });
    }
  }
  S.staffPool = genStaffPool(S);
  for (let i = 0; i < 3; i++) aiAiTrade(S);
  S.tradeBlock = S.tradeBlock.filter(id => { const p = P(S, id); return p && p.tid === S.user; });
  S.offers = [];
  S.phase = PH.LOTTERY;
  return { report: S.progReport, retired };
}
function topMean(S) { return U.avg(U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr).slice(0, 60), p => p.ovr); }
// keeps talent levels steady across decades: nudges everyone if the league drifts
function normalizeLeague(S) {
  if (S.ovrTarget == null) return;
  const ps = U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr);
  const topM = U.avg(ps.slice(0, 60), p => p.ovr), depM = U.avg(ps.slice(60, 360), p => p.ovr);
  if (S.depTarget == null) S.depTarget = depM;
  const dTop = -(topM - S.ovrTarget) * 0.7, dDep = -(depM - S.depTarget) * 0.7;
  const shiftP = (p, sh) => {
    if (Math.abs(sh) < 0.5) return;
    for (const k in OVR_W[p.pos]) p.r[k] = Math.round(U.clamp(p.r[k] + sh, 15, 99));
    p.ovr = calcOvr(p.r, p.pos);
    p.pot = Math.round(U.clamp(p.pot + sh, 30, 99));
  };
  ps.forEach((p, i) => { const f = i < 60 ? 0 : i < 120 ? (i - 60) / 60 : 1; shiftP(p, dTop * (1 - f) + dDep * f); });
  for (const p of S.players.filter(x => x.tid === -2)) shiftP(p, dDep * 0.5);
}
const STAFF_ROLES = { hc: 'Head Coach', asst: 'Asst. Coach', trainer: 'Head Trainer', scout: 'Head Scout' };
function genStaffPool(S) {
  const pool = [];
  for (const role of ['hc', 'hc', 'hc', 'hc', 'hc', 'asst', 'asst', 'asst', 'asst', 'trainer', 'trainer', 'trainer', 'scout', 'scout', 'scout']) pool.push(genStaff(S, role, U.gauss(58, 14)));
  return pool;
}
function retirePlayer(S, p) {
  const was = p.tid;
  p.retiredTid = was; p.tid = -3; p.retired = S.season; p.hofEligible = S.season + 3;
  S.players = S.players.filter(x => x !== p);
  S.retired.push(p);
  S.tradeBlock = S.tradeBlock.filter(x => x !== p.pid);
  const c = careerTotals(p);
  if (c.pts >= 12000 || p.awards.some(a => a.t === 'MVP') || was === S.user) addNews(S, { type: 'retire', tids: was >= 0 ? [was] : [], pids: [p.pid], h: `${pname(p)} announces his retirement`, b: `${p.yrsPro} seasons, ${c.pts.toLocaleString()} points, ${(c.orb + c.drb).toLocaleString()} rebounds, ${c.ast.toLocaleString()} assists.`, imp: c.pts >= 20000 ? 4 : 2, local: was === S.user });
  // slim down forgettable careers to keep the save small
  if (hofScore(p) < 15 && was !== S.user && !p.awards.length) {
    const reg = careerTotals(p, 0), po = careerTotals(p, 1);
    p.stats = [Object.assign({ s: 0, tid: -1, po: 0 }, reg)];
    if (po.gp) p.stats.push(Object.assign({ s: 0, tid: -1, po: 1 }, po));
    p.hist = []; p.r = null;
  }
}
function toResign(S) {
  S.phase = PH.RESIGN;
  for (const p of roster(S, S.user).filter(x => x.contract.exp <= S.season)) { p.neg = 0; p.askYrs = null; }
  const n = roster(S, S.user).filter(x => x.contract.exp <= S.season).length;
  if (n) inbox(S, { from: 'Front Office', subj: `${n} contract${n > 1 ? 's' : ''} expiring`, body: 'Head to Re-sign Players. Anyone you don\'t sign hits free agency.' });
}
function toFreeAgencyPhase(S) {
  aiResign(S);
  toFreeAgency(S);
  startFA(S);
  S.phase = PH.FA;
  addNews(S, { type: 'fa', tids: [], h: 'Free agency opens', b: `Top names on the market: ${U.sortBy(S.players.filter(p => p.tid === -1), p => p.ovr).slice(0, 4).map(p => pname(p) + ' (' + p.ovr + ')').join(', ')}.`, imp: 3 });
}
function newSeason(S) {
  S.season++;
  S.phase = PH.PRE; S.day = 0;
  S.cap = Math.round(S.cap * U.rf(1.02, 1.055) / 100) * 100;
  S.tax = Math.round(S.cap * 1.246 / 100) * 100; S.mle = Math.round(S.cap * 0.101 / 10) * 10;
  S.minSal = Math.round(S.cap * 0.0081 / 10) * 10; S.maxSal = Math.round(S.cap * 0.35 / 10) * 10;
  for (const p of S.players) {
    p.age++;
    if (p.tid !== -2 && !(p.draft && p.draft.year === S.season)) p.yrsPro++;
    p.prom = null; p.neg = 0; p.noResign = false; p.askYrs = null; p.lastGripe = null; p.campYr = null;
    if (p.contract && p.contract.next) { p.contract.amt = p.contract.next; delete p.contract.next; }
    if (p.tid === -1) { const a = contractAsk(S, p, -1); p.ask = { amt: Math.round(a.amt * 0.85 / 10) * 10, yrs: a.yrs, base: a.amt }; p.contract = { amt: p.ask.amt, exp: S.season }; }
  }
  for (const p of S.players.filter(x => x.tid === -2 && x.yrsPro > 0)) p.yrsPro = 0;
  for (const t of S.teams) {
    t.rec = newRec(); t.mle = false; t.dead = t.dead.filter(d => d.exp >= S.season);
    for (const k of ['hc', 'asst', 'trainer', 'scout']) {
      const st = t.staff[k];
      if (st.exp < S.season) {
        if (t.tid === S.user) { t.staff[k] = genStaff(S, k, U.gauss(45, 8)); t.staff[k].exp = S.season; inbox(S, { from: 'Front Office', subj: `Interim ${STAFF_ROLES[k]} named`, body: `${staffName(st)} left when his contract expired. ${staffName(t.staff[k])} is the interim ${STAFF_ROLES[k].toLowerCase()} on a one-year deal.` }); }
        else st.exp = S.season + U.ri(1, 3);
      }
    }
    if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); }
    ensureRotation(S, t.tid);
  }
  finishArenas(S);
  seasonMaintenance(S);
  genSchedule(S);
  genPicks(S);
  genDraftClass(S, S.season + 2);
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  S.camp = { left: 4, log: [] };
  S.box = {}; S.allStar = null; S.seasonAwards = null; S.playoffs = null; S.lottery = null; S.draft = null; S.power = null; S.progReport = null;
  for (const t of S.teams) initFinances(S, t);
  const ut = S.teams[S.user];
  addNews(S, { type: 'league', tids: [], h: `Training camps open for the ${U.seasonLabel(S.season)} season`, b: `The salary cap is ${U.money(S.cap)}, the luxury tax line ${U.money(S.tax)}.`, imp: 2 });
  inbox(S, { from: `Coach ${staffName(ut.staff.hc)}`, subj: 'Welcome to camp', body: `We've got ${S.camp.left} training camp sessions before the opener. Pick your guys and drills — young players get the most out of it.` });
  radioShow(S);
}
function startRegularSeason(S) {
  S.phase = PH.REG; S.day = 1;
  for (const t of S.teams) { if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); } ensureRotation(S, t.tid); }
  powerRankings(S);
  addNews(S, { type: 'league', tids: [], h: `Opening night: the ${U.seasonLabel(S.season)} season tips off`, b: `Preseason favorites: ${S.power.slice(0, 3).map(x => tname(S.teams[x.tid])).join(', ')}.`, imp: 3 });
}
function userRosterIssues(S) {
  const n = roster(S, S.user).length;
  const iss = [];
  if (n > ROSTER_MAX) iss.push(`You have ${n} players. Release or trade down to ${ROSTER_MAX}.`);
  if (n < ROSTER_MIN) iss.push(`You have ${n} players. Sign free agents to reach ${ROSTER_MIN}.`);
  return iss;
}

// ---------- training camp ----------
const DRILLS = {
  shoot: { n: 'Shooting Clinic', keys: ['mid', 'tpt', 'ft'], game: 'shoot', d: 'Timing drill. Boosts mid-range, three-point and free throw.' },
  handle: { n: 'Ball-Handling Gauntlet', keys: ['bhd', 'pas', 'iq'], game: 'handle', d: 'Combo-input drill. Boosts handling, passing and IQ.' },
  defense: { n: 'Defensive Slides', keys: ['pdf', 'stl', 'spd'], game: 'defense', d: 'Stay in front of the ball. Boosts perimeter D, steals and speed.' },
  post: { n: 'Post Moves', keys: ['ins', 'str', 'idf'], game: null, d: 'Simulated drill. Boosts inside scoring, strength and interior D.' },
  boards: { n: 'Rebounding Drill', keys: ['orb', 'drb', 'blk'], game: null, d: 'Simulated drill. Boosts rebounding and shot blocking.' },
  cond: { n: 'Conditioning', keys: ['sta', 'dur', 'jmp'], game: null, d: 'Simulated drill. Boosts stamina, durability and vertical.' },
};
function campSimGrade(S, p) { return U.clamp(Math.round(U.gauss(55 + (p.r.iq - 55) * 0.3 + (p.pers === 'gymrat' ? 8 : 0), 14)), 5, 98); }
function campApply(S, pid, drill, grade) {
  const p = P(S, pid);
  if (!S.camp || S.camp.left <= 0) return null;
  const ageF = p.age <= 22 ? 1.3 : p.age <= 26 ? 1.0 : p.age <= 30 ? 0.7 : 0.45;
  const base = (grade - 35) / 18 * ageF * (1 + S.teams[S.user].staff.asst.r.dev / 400);
  const gains = {};
  for (const k of DRILLS[drill].keys) { const g = Math.max(0, Math.round(base + U.rf(-0.6, 0.6))); p.r[k] = Math.min(99, p.r[k] + g); gains[k] = g; }
  const before = p.ovr; p.ovr = calcOvr(p.r, p.pos); if (p.pot < p.ovr) p.pot = p.ovr;
  p.campYr = S.season;
  S.camp.left--;
  const res = { pid, n: pname(p), drill, grade, gains, d: p.ovr - before };
  S.camp.log.push(res);
  return res;
}
