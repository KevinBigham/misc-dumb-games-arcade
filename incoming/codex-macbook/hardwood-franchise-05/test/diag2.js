const S = newLeague({ userTid: 5 });
function dist(tag) {
  const act = S.players.filter(p => p.tid >= 0);
  const byAge = {};
  for (const p of act) { const a = p.age <= 22 ? '<=22' : p.age <= 25 ? '23-25' : p.age <= 29 ? '26-29' : p.age <= 32 ? '30-32' : '33+'; const b = byAge[a] || (byAge[a] = { n: 0, s90: 0, s80: 0, sum: 0 }); b.n++; b.sum += p.ovr; if (p.ovr >= 90) b.s90++; if (p.ovr >= 80) b.s80++; }
  console.log(tag, Object.entries(byAge).map(([k, v]) => `${k}: n${v.n} avg${(v.sum / v.n).toFixed(1)} 90+${v.s90} 80+${v.s80}`).join(' | '));
  const strs = S.teams.map(t => teamStrength(S, t.tid)).sort((a, b) => a - b);
  console.log('   team strength min', strs[0].toFixed(1), 'p25', strs[7].toFixed(1), 'med', strs[15].toFixed(1), 'p75', strs[22].toFixed(1), 'max', strs[29].toFixed(1));
}
dist('start');
for (let n = 0; n < 8; n++) {
  startRegularSeason(S);
  while (S.phase === PH.REG) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
  while (S.phase === PH.PO) simDay(S);
  startOffseason(S); runLottery(S); S.phase = PH.DRAFT;
  const top = prospects(S).sort((a,b)=>b.pot-a.pot).slice(0,5).map(p=>`${p.ovr}/${p.pot}`).join(' ');
  finishDraft(S); toResign(S);
  const su = S.user; S.user = -99; aiResign(S); S.user = su;
  toFreeAgencyPhase(S);
  const fa = U.sortBy(S.players.filter(p => p.tid === -1), p => p.ovr).slice(0, 6).map(p => p.ovr).join(',');
  for (let d = 0; d < 9; d++) faAdvanceDay(S); endFA(S);
  aiTrimRoster(S, S.user); aiFillRoster(S, S.user);
  newSeason(S);
  dist(`${S.season}`); console.log('   top prospects', top, '| top FAs', fa);
}
const worst = U.sortBy(S.teams, t => -teamStrength(S, t.tid))[0];
console.log('weakest', worst.abbr, 'cap', U.money(capSpace(S, worst.tid)), roster(S, worst.tid).map(p => `${p.pos}${p.ovr}/${p.age}`).join(' '));
const best = U.sortBy(S.teams, t => teamStrength(S, t.tid))[0];
console.log('strongest', best.abbr, 'cap', U.money(capSpace(S, best.tid)), roster(S, best.tid).map(p => `${p.pos}${p.ovr}/${p.age}`).join(' '));
