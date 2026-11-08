const NS = +process.argv[3] || 10;
const t0 = Date.now();
const S = newLeague({ userTid: 5, games: +process.argv[4] || 82 });
for (let n = 0; n < NS; n++) {
  for (const p of roster(S, S.user).slice(0, 4)) campApply(S, p.pid, U.pick(Object.keys(DRILLS)), campSimGrade(S, p));
  startRegularSeason(S);
  while (S.phase === PH.REG) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
  const ws = S.teams.map(t => t.rec.w); const sd = Math.sqrt(U.avg(ws.map(w => (w - 41) ** 2)));
  const st0 = standings(S); const best = { abbr: st0[0].abbr, rec: Object.assign({}, st0[0].rec) }, worst = { abbr: st0[29].abbr, rec: Object.assign({}, st0[29].rec) };
  const A = S.seasonAwards; const mvp = P(S, A.mvp); const sc = P(S, A.lead.pts);
  while (S.phase === PH.PO) simDay(S);
  const h = S.history[S.history.length - 1];
  const prof = U.avg(S.teams, t => t.finHist[t.finHist.length - 1].profit);
  startOffseason(S); runLottery(S); S.phase = PH.DRAFT; finishDraft(S); toResign(S);
  const su = S.user; S.user = -99; aiResign(S); S.user = su;
  toFreeAgencyPhase(S); for (let d = 0; d < 9; d++) faAdvanceDay(S); endFA(S);
  aiTrimRoster(S, S.user); aiFillRoster(S, S.user);
  const trades = S.trans.filter(x => x.type === 'trade' && x.s === S.season).length;
  newSeason(S);
  const ovrs = S.players.filter(p => p.tid >= 0).map(p => p.ovr).sort((a, b) => b - a);
  console.log(`${S.season - 1}: best ${best.abbr} ${best.rec.w}-${best.rec.l} worst ${worst.abbr} ${worst.rec.w}-${worst.rec.l} sdW ${sd.toFixed(1)} | champ ${S.teams[h.champ].abbr} | MVP ${mvp.ovr} ${perGame(seasonTotals(mvp, S.season - 1)).ppg.toFixed(1)}ppg | scorer ${perGame(seasonTotals(sc, S.season - 1)).ppg.toFixed(1)} | trades ${trades} | profit ${U.money(prof)} | top ${ovrs.slice(0, 3).join('/')} 90+ ${ovrs.filter(o => o >= 90).length} 80+ ${ovrs.filter(o => o >= 80).length} med ${ovrs[Math.floor(ovrs.length / 2)]} | FA ${S.players.filter(p => p.tid === -1).length} ret ${S.retired.length} | cap ${U.money(S.cap)} pay ${U.money(U.avg(S.teams, t => payroll(S, t.tid)))}`);
}
console.log('save KB', (JSON.stringify(S).length / 1024).toFixed(0), 'time', ((Date.now() - t0) / 1000).toFixed(0) + 's');
