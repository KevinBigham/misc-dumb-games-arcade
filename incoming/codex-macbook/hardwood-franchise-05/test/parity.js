const S = newLeague({ userTid: 5 });
startRegularSeason(S);
const str = {}; for (const t of S.teams) str[t.tid] = teamStrength(S, t.tid);
while (S.phase === PH.REG) { const r = simDay(S); if (r === 'allstar') allStarAuto(S); }
const rows = S.teams.map(t => ({ abbr: t.abbr, s: str[t.tid], w: t.rec.w, top: U.sortBy(roster(S,t.tid), p=>p.ovr).slice(0,3).map(p=>p.ovr).join('/') })).sort((a,b)=>b.w-a.w);
rows.forEach(r => console.log(r.abbr.padEnd(4), r.s.toFixed(1), r.w, r.top));
const xs = rows.map(r=>r.s), ys = rows.map(r=>r.w); const mx = U.avg(xs), my = U.avg(ys);
const slope = U.sum(xs.map((x,i)=>(x-mx)*(ys[i]-my))) / U.sum(xs.map(x=>(x-mx)**2));
console.log('slope wins per OVR point of top-8 avg:', slope.toFixed(2), 'sd strength', Math.sqrt(U.avg(xs.map(x=>(x-mx)**2))).toFixed(2));
