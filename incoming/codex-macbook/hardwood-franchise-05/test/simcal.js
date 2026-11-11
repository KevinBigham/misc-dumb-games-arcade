const S = newLeague({ userTid: 0 });
reindex(S);
// distribution of OVR
const act = S.players.filter(p => p.tid >= 0);
const ovrs = act.map(p => p.ovr).sort((a,b)=>b-a);
console.log('players', act.length, 'top10', ovrs.slice(0,10).join(','), 'median', ovrs[Math.floor(ovrs.length/2)], 'min', ovrs[ovrs.length-1]);
const buckets = {}; for (const o of ovrs) { const b = Math.floor(o/5)*5; buckets[b]=(buckets[b]||0)+1; } console.log(JSON.stringify(buckets));
const pays = S.teams.map(t => payroll(S, t.tid)); console.log('payroll avg', Math.round(U.avg(pays)), 'min', Math.min(...pays), 'max', Math.max(...pays));
// sim N games
const N = +process.argv[3] || 300;
const agg = { pts:0, fga:0, fgm:0, tpa:0, tpm:0, fta:0, ftm:0, orb:0, drb:0, ast:0, stl:0, blk:0, tov:0, pf:0, poss:0, ot:0, homeW:0 };
const zones = {rim:[0,0], close:[0,0], mid:[0,0], three:[0,0]};
const pmap = {};
let t0 = Date.now();
for (let i = 0; i < N; i++) {
  const g = S.sched[i];
  const sim = new GameSim(S, g); sim.simToEnd();
  if (sim.score[0] > sim.score[1]) agg.homeW++;
  if (sim.q > 4) agg.ot++;
  for (const T of sim.T) for (const gp of T.ps) {
    for (const k of ['pts','fga','fgm','tpa','tpm','fta','ftm','orb','drb','ast','stl','blk','tov','pf']) agg[k] += gp.st[k];
    const m = pmap[gp.pid] || (pmap[gp.pid] = { p: gp.p, g: 0, min: 0, pts: 0, reb: 0, ast: 0, gs: 0 });
    m.g++; m.min += gp.st.min; m.pts += gp.st.pts; m.reb += gp.st.orb + gp.st.drb; m.ast += gp.st.ast;
  }
  for (const s of sim.shots) { zones[s.z][0]++; zones[s.z][1] += s.made; }
}
const tg = N * 2;
console.log('ms/game', ((Date.now()-t0)/N).toFixed(1));
console.log('per team-game: PTS %s FGA %s FG% %s 3PA %s 3P% %s FTA %s FT% %s ORB %s DRB %s AST %s STL %s BLK %s TOV %s PF %s', ...['pts','fga'].map(k=>(agg[k]/tg).toFixed(1)), (agg.fgm/agg.fga).toFixed(3), (agg.tpa/tg).toFixed(1), (agg.tpm/agg.tpa).toFixed(3), (agg.fta/tg).toFixed(1), (agg.ftm/agg.fta).toFixed(3), ...['orb','drb','ast','stl','blk','tov','pf'].map(k=>(agg[k]/tg).toFixed(1)));
console.log('home win%', (agg.homeW/N).toFixed(3), 'OT%', (agg.ot/N).toFixed(3));
const tot = Object.values(zones).reduce((a,b)=>a+b[0],0);
for (const z in zones) console.log(z, 'share', (zones[z][0]/tot).toFixed(3), 'fg%', (zones[z][1]/zones[z][0]).toFixed(3));
const list = Object.values(pmap).filter(m => m.g >= 5).map(m => ({ n: pname(m.p), pos: m.p.pos, ovr: m.p.ovr, mpg: m.min/m.g, ppg: m.pts/m.g, rpg: m.reb/m.g, apg: m.ast/m.g }));
list.sort((a,b)=>b.ppg-a.ppg);
console.log('TOP SCORERS'); list.slice(0,12).forEach(x => console.log(x.n.padEnd(22), x.pos, x.ovr, x.mpg.toFixed(1), x.ppg.toFixed(1), x.rpg.toFixed(1), x.apg.toFixed(1)));
list.sort((a,b)=>b.rpg-a.rpg); console.log('TOP REB'); list.slice(0,5).forEach(x => console.log(x.n.padEnd(22), x.pos, x.ovr, x.mpg.toFixed(1), x.ppg.toFixed(1), x.rpg.toFixed(1), x.apg.toFixed(1)));
list.sort((a,b)=>b.apg-a.apg); console.log('TOP AST'); list.slice(0,5).forEach(x => console.log(x.n.padEnd(22), x.pos, x.ovr, x.mpg.toFixed(1), x.ppg.toFixed(1), x.rpg.toFixed(1), x.apg.toFixed(1)));
// minutes distribution by rotation rank for one team
const t = S.teams[3]; console.log('Team', t.abbr, 'rotation minutes:');
t.rot.order.forEach(pid => { const m = pmap[pid]; if (m) console.log(' ', pname(m.p).padEnd(22), m.p.pos, m.p.ovr, 'tgt', t.rot.mins[pid], 'mpg', (m.min/m.g).toFixed(1), 'ppg', (m.pts/m.g).toFixed(1)); });
