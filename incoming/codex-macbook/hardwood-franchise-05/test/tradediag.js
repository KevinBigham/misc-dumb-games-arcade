const S = newLeague({ userTid: 5 });
startRegularSeason(S);
for (let d = 0; d < 30; d++) simDay(S);
let ok = 0; for (let i = 0; i < 100; i++) if (aiAiTryOnce(S)) ok++;
console.log('AI-AI trades executed in 100 tries:', ok);
// user block offers
S.tradeBlock = U.sortBy(roster(S, S.user), p => p.ovr).slice(1, 4).map(p => p.pid);
for (let i = 0; i < 6; i++) tradeBlockOffers(S);
console.log('offers', S.offers.length);
for (const o of S.offers.slice(0, 5)) { const v = aiTradeVerdict(S, o.tid, o.get, { pids: o.pids, picks: [] }, DIFFS[S.diff].trade); console.log(' ', S.teams[o.tid].abbr, 'gives', o.get.pids.map(id => P(S, id).ovr).join('/'), o.get.picks.length + 'pk', 'for', o.pids.map(id => P(S, id).ovr).join('/'), 'ai ok?', v.ok, 'legal?', tradeProblems(S, S.user, o.tid, { pids: o.pids, picks: [] }, o.get).length === 0); }
