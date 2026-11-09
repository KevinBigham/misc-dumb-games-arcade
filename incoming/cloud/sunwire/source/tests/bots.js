// Strategy bots driving pure Rules. node bots.js [mode] [seed]
const H=require('./harness')(); const {G}=H; const R=G.Rules,C=G.CONFIG,D=G.DATA;
function sim(st,months,policy){
  const log=[]; let lastTier=0;
  const stepsPerTick=Math.round(C.MONTH_SEC/2/C.STEP);
  for(let tick=0;tick<months*2&&!st.over;tick++){
    policy(st);
    if(!st.started) { log.push('never started'); break; }
    for(let i=0;i<stepsPerTick&&!st.over;i++) R.step(st,C.STEP);
    st.ev.length=0;
    if(st.tier!==lastTier){ log.push('order'+lastTier+'@m'+st.month); lastTier=st.tier; }
  }
  return {month:st.month,cash:Math.round(st.cash),worth:R.netWorth(st),tier:st.tier,won:st.won,wonMonth:st.wonMonth,over:st.over,cables:st.cables.length,
    cars:st.cables.reduce((a,c)=>a+c.cars.length,0),log:log.join(' '),last:st.last.profit};
}
function pairs(st){const o=[];for(let i=0;i<st.sites.length;i++)for(let j=i+1;j<st.sites.length;j++){const save=st.cash;st.cash=1e12;const p=R.plan(st,i,j);st.cash=save;if(p.ok)o.push({i,j,p});}return o;}
function value(st,x){ // rough priority
  const a=st.sites[x.i],b=st.sites[x.j],o=R.curOrder(st); let v=0;
  for(const [f,c] of x.p.carry){ v+=D.cargo[c].rate*(c==='R'?1:2); if(o&&o.c===c) v+=200; if(c==='C'&&o&&o.c==='J') v+=150; if(c==='O'&&o&&o.c==='T') v+=150; }
  return v*Math.pow(x.p.len/25,0.9)-x.p.cost*0.05;
}
const smart=(reserve=150)=>st=>{
  const cand=pairs(st).map(x=>({...x,v:value(st,x)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  if(cand[0]&&st.cash>=cand[0].p.cost+reserve) R.build(st,cand[0].i,cand[0].j);
  for(const cb of st.cables){const s=cb.status;if(!s)continue;
    if(s.k==='backlog'){ if(cb.cars.length<R.maxCars(cb)&&st.cash>=R.carCost(cb)+reserve) R.addCar(st,cb.id);
      else { const u=R.upCost(cb); if(u!==null&&D.classes[cb.cls+1].tier<=st.tier&&st.cash>=u+reserve) R.upgrade(st,cb.id);} }
    if(s.k==='empty'&&!cb.wait) R.toggleWait(st,cb.id);
    else if((s.k==='empty'||s.k==='loss')&&cb.cars.length>1) R.sellCar(st,cb.id);
  }
};
const lazy=st=>{ if(!st.cables.length) R.build(st,0,1); };
const spend=st=>{ smart(0)(st); for(const cb of st.cables){ while(cb.cars.length<R.maxCars(cb)&&st.cash>=R.carCost(cb)) R.addCar(st,cb.id); const u=R.upCost(cb); if(u!==null&&D.classes[cb.cls+1].tier<=st.tier&&st.cash>=u) R.upgrade(st,cb.id);} };
const idle=st=>{};
module.exports={sim,smart,lazy,spend,idle,G,H,pairs};
if(require.main===module){
const mode=process.argv[2]||'classic';
const seeds=mode==='daily'?[20261106,20261107,20261108,20261109,20261110,20261111,20261112,20261113]:[G.st.seed];
for(const seed of seeds){
  for(const [name,pol,m] of [['smart',smart(),72],['smart-tight',smart(40),72],['lazy',lazy,72],['spendthrift',spend,72],['idle',idle,12]]){
    const st=G.newState(mode,seed); const r=sim(st,m,pol); console.log(mode,seed,name.padEnd(12),JSON.stringify(r));
  }
}
// trajectory
{ const st=G.newState(mode,seeds[0]); const pol=smart(); const out=[];
  for(let m=0;m<60&&!st.over;m++){ for(let h=0;h<2;h++){pol(st); for(let i=0;i<Math.round(C.MONTH_SEC/2/C.STEP);i++)R.step(st,C.STEP); st.ev.length=0;}
    if(m%6===5) out.push('m'+st.month+':w'+R.netWorth(st)+'/p'+st.last.profit+'/t'+st.tier); }
  console.log('traj',out.join(' ')); }
}
