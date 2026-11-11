const S = newLeague({ userTid: 0 });
S.diff = 1;
const g = { gid: 1, h: 0, a: 1 };
function run(off, def, n = 300, feed) {
  let pts = 0, opp = 0, top = 0, w = 0, topMax = 0;
  for (let i = 0; i < n; i++) {
    const sim = new GameSim(S, g, {});
    sim.T[0].strat.off = off; if (def) sim.T[0].strat.def = def;
    if (feed) sim.T[0].feed = U.maxBy(sim.T[0].ps, x => x.use).pid;
    sim.simToEnd();
    pts += sim.score[0]; opp += sim.score[1]; if (sim.score[0] > sim.score[1]) w++;
    const t = Math.max(...sim.T[0].ps.map(x => x.st.pts)); top += t; topMax = Math.max(topMax, t);
  }
  console.log(`${off.padEnd(9)} ${String(def || '').padEnd(6)} ${feed ? 'feed' : '    '} pts ${(pts / n).toFixed(1)} opp ${(opp / n).toFixed(1)} win ${(w / n).toFixed(3)} topScorer avg ${(top / n).toFixed(1)} max ${topMax}`);
}
for (const off of Object.keys(OFF_PLAYS)) run(off);
for (const d of Object.keys(DEF_SCHEMES)) run('balanced', d);
run('balanced', null, 300, true);
run('iso', null, 300, true);
