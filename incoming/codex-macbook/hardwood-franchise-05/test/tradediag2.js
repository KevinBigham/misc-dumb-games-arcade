const S = newLeague({ userTid: 5 });
startRegularSeason(S);
for (let d = 0; d < 30; d++) simDay(S);
const reasons = {}; const note = r => reasons[r] = (reasons[r] || 0) + 1;
for (let i = 0; i < 300; i++) {
  const ai = S.teams.filter(t => t.tid !== S.user);
  const buyers = ai.filter(t => teamMode(S, t.tid) === 'contend'), sellers = ai.filter(t => teamMode(S, t.tid) === 'rebuild');
  const b = U.pick(buyers), s = U.pick(sellers);
  const vet = U.sortBy(roster(S, s.tid).filter(p => p.age >= 27 && p.ovr >= 72), p => p.ovr)[U.ri(0, 2)];
  if (!vet) { note('no vet'); continue; }
  const val = tradeValue(S, vet, teamMode(S, b.tid));
  const sellerMax = teamPay(S, s.tid) - vet.contract.amt <= S.cap ? Infinity : vet.contract.amt * 1.25 + 100; const { pkg } = buildPackage(S, b.tid, val * 0.98, [], sellerMax);
  if (!pkg.pids.length && !pkg.picks.length) { note('empty pkg (val ' + Math.round(val) + ')'); continue; }
  const give = { pids: [vet.pid], picks: [] };
  matchSalary(S, b.tid, pkg, vet.contract.amt, [], sellerMax);
  const pr = tradeProblems(S, s.tid, b.tid, give, pkg);
  if (pr.length) { note('problem ' + (pr[0].startsWith(S.teams[s.tid].abbr) ? 'seller' : 'buyer') + ' ' + pr[0].split(':')[0].replace(/^[A-Z]+ /, '')); continue; }
  const v1 = aiTradeVerdict(S, s.tid, give, pkg, 1.0), v2 = aiTradeVerdict(S, b.tid, pkg, give, 0.95);
  if (!v1.ok) note('seller no'); else if (!v2.ok) note('buyer no'); else note('OK');
}
console.log(reasons);
