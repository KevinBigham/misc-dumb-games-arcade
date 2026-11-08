const NS = +process.argv[3] || 3;
const t0 = Date.now();
const S = newLeague({ userTid: 5, games: +process.argv[4] || 82 });
const tick = (m) => console.log(`[${((Date.now()-t0)/1000).toFixed(1)}s] ${m}`);
for (let n = 0; n < NS; n++) {
  tick(`Season ${S.season} preseason. players=${S.players.length} retired=${S.retired.length} FA=${S.players.filter(p=>p.tid===-1).length}`);
  // camp
  for (const p of roster(S, S.user).slice(0, 4)) campApply(S, p.pid, U.pick(Object.keys(DRILLS)), campSimGrade(S, p));
  startRegularSeason(S);
  let guard = 0;
  while (S.phase === PH.REG && guard++ < 400) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
  tick(`Reg season done day=${S.day}. games=${S.sched.length}`);
  const st = standings(S).slice(0, 3).map(t => `${t.abbr} ${t.rec.w}-${t.rec.l}`).join(', ');
  const wst = standings(S).slice(-2).map(t => `${t.abbr} ${t.rec.w}-${t.rec.l}`).join(', ');
  console.log('  best:', st, '| worst:', wst);
  const A = S.seasonAwards; console.log('  MVP', pname(P(S, A.mvp)), P(S,A.mvp).ovr, 'ROY', A.roy!=null?pname(P(S,A.roy)):'-', 'DPOY', pname(P(S,A.dpoy)));
  const sc = P(S, A.lead.pts); console.log('  scoring champ', pname(sc), perGame(seasonTotals(sc, S.season)).ppg.toFixed(1));
  guard = 0;
  while (S.phase === PH.PO && guard++ < 200) simDay(S);
  const h = S.history[S.history.length-1];
  tick(`Champion: ${h.champName} over ${h.runnerName} ${h.series}, FMVP ${h.fmvpN}`);
  const ut = S.teams[S.user]; const fh = ut.finHist[ut.finHist.length-1];
  console.log('  user fin: rev', U.money(ledgerTotal(fh.rev)), 'exp', U.money(ledgerTotal(fh.exp)), 'profit', U.money(fh.profit), 'att', fh.att, 'fan', fh.fan, 'hype', fh.hype);
  const profits = S.teams.map(t => t.finHist[t.finHist.length-1].profit); console.log('  league profit avg', U.money(U.avg(profits)), 'min', U.money(Math.min(...profits)), 'max', U.money(Math.max(...profits)));
  const off = startOffseason(S);
  console.log('  retired', off.retired.length, 'user prog', S.progReport.slice(0,3).map(r=>`${r.n} ${r.before}->${r.after}`).join('; '));
  runLottery(S); S.phase = PH.DRAFT;
  console.log('  lottery #1:', S.teams[S.lottery.results[0].tid].abbr, 'seed', S.lottery.results[0].seed);
  finishDraft(S);
  toResign(S);
  // user acts like AI for re-signing in test
  const savedUser = S.user; S.user = -99; aiResign(S); S.user = savedUser;
  toFreeAgencyPhase(S);
  for (let d = 0; d < 9; d++) faAdvanceDay(S);
  endFA(S);
  aiTrimRoster(S, S.user); aiFillRoster(S, S.user);
  const counts = S.teams.map(t => roster(S, t.tid).length);
  console.log('  roster sizes min', Math.min(...counts), 'max', Math.max(...counts), 'payroll avg', U.money(U.avg(S.teams, t => payroll(S, t.tid))), 'trades', S.trans.filter(x=>x.type==='trade' && x.s===S.season).length, 'news', S.news.length);
  newSeason(S);
  const ovrs = S.players.filter(p => p.tid >= 0).map(p => p.ovr).sort((a,b)=>b-a);
  console.log('  ovr top5', ovrs.slice(0,5).join(','), 'median', ovrs[Math.floor(ovrs.length/2)], '90+', ovrs.filter(o=>o>=90).length, '80+', ovrs.filter(o=>o>=80).length);
}
const js = JSON.stringify(S); tick('save size ' + (js.length/1024).toFixed(0) + ' KB');
