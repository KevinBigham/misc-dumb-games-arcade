// ===== fantasy.js — fantasy draft: every rostered player goes into one pool =====
function startFantasyDraft(S) {
  const pool = S.players.filter(p => p.tid >= 0);
  for (const p of pool) { p.tid = -4; p.num = 0; }
  const order = U.shuffle(S.teams.map(t => t.tid));
  const rounds = 13;
  const picks = [];
  for (let r = 0; r < rounds; r++) { const ord = r % 2 ? order.slice().reverse() : order; ord.forEach(tid => picks.push({ rd: r + 1, tid })); }
  S.fdraft = { picks, cur: 0, done: false, order };
  S.tradeBlock = [];
}
function fdPool(S) { return S.players.filter(p => p.tid === -4); }
function fdPick(S, pid) {
  const F = S.fdraft, pk = F.picks[F.cur], p = P(S, pid);
  p.tid = pk.tid; p.joined = S.season; pk.pid = pid;
  F.cur++;
  if (F.cur >= F.picks.length) finishFantasyDraft(S);
  return p;
}
function fdValue(S, tid, p) {
  const ros = roster(S, tid);
  const posCount = ros.filter(x => x.pos === p.pos).length;
  const need = posCount === 0 ? 4 : posCount === 1 ? 1.5 : posCount >= 3 ? -3 : 0;
  const yrs = Math.max(1, p.contract.exp - S.season + 1);
  const capHit = (p.contract.amt - marketSalary(S, p)) / 1000 * Math.min(yrs, 3) * 0.25;
  return playerWorth(p) + need - capHit + U.rf(-1.5, 1.5);
}
function fdAI(S) {
  const F = S.fdraft, pk = F.picks[F.cur];
  const best = U.maxBy(fdPool(S), p => fdValue(S, pk.tid, p));
  return fdPick(S, best.pid);
}
function finishFantasyDraft(S) {
  const F = S.fdraft;
  F.done = true;
  for (const p of fdPool(S)) { p.tid = -1; p.ask = null; const a = contractAsk(S, p, -1); p.contract = { amt: a.amt, exp: S.season }; }
  for (const t of S.teams) {
    assignNumbers(S, t.tid);
    for (const p of roster(S, t.tid)) p.morale = U.ri(55, 75);
    autoRotation(S, t.tid);
    if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); }
  }
  addNews(S, { type: 'league', tids: [], h: 'Fantasy draft complete: a brand-new league', b: `Every roster was rebuilt from scratch. First overall: ${pname(P(S, F.picks[0].pid))} to the ${S.teams[F.picks[0].tid].name}.`, imp: 4 });
}
