const S = newLeague({ userTid: 5 });
for (let n = 0; n < 5; n++) {
  startRegularSeason(S);
  while (S.phase === PH.REG) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
  while (S.phase === PH.PO) simDay(S);
  startOffseason(S); runLottery(S); S.phase = PH.DRAFT; finishDraft(S); toResign(S);
  const su = S.user; S.user = -99; aiResign(S); S.user = su;
  toFreeAgencyPhase(S); for (let d = 0; d < 9; d++) faAdvanceDay(S); endFA(S);
  aiTrimRoster(S, S.user); aiFillRoster(S, S.user); newSeason(S);
}
for (const k of Object.keys(S)) { const n = JSON.stringify(S[k]).length; if (n > 5000) console.log(k.padEnd(12), (n/1024).toFixed(0), 'KB'); }
const p = S.players.find(p => p.tid >= 0 && p.stats.length > 4); console.log('sample player KB', (JSON.stringify(p).length/1024).toFixed(1));
