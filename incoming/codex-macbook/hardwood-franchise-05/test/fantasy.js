const S = newLeague({ userTid: 3 });
startFantasyDraft(S);
while (!S.fdraft.done) fdAI(S);
const sizes = S.teams.map(t => roster(S, t.tid).length);
console.log('roster sizes', Math.min(...sizes), Math.max(...sizes), 'pool->FA', S.players.filter(p => p.tid === -1).length, 'stray -4', S.players.filter(p => p.tid === -4).length);
const str = S.teams.map(t => teamStrength(S, t.tid)).sort((a,b)=>a-b); console.log('strength', str[0].toFixed(1), str[29].toFixed(1));
const pays = S.teams.map(t => payroll(S, t.tid)).sort((a,b)=>a-b); console.log('payroll', U.money(pays[0]), U.money(pays[29]));
startRegularSeason(S);
while (S.phase === PH.REG) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
console.log('season ok; best', standings(S)[0].abbr, standings(S)[0].rec.w);
