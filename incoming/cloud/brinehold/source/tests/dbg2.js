const G=require('./load.js')(process.argv[2]); const {Rules:R,CONFIG}=G;
// reuse sim plan via require of sim internals: quick copy
const src=require('fs').readFileSync('./sim.js','utf8'); const plansSrc=src.slice(src.indexOf('const plans='),src.indexOf('function run'));
const plans=eval(plansSrc+';plans'); const greedy=require('./greedy.js')(G);
const s=R.newGame(1); const plan=plans.creek; let i=0; const seen={};
while(s.phase==='play'&&s.t<3000){
  while(i<plan.length){const [k,x,y,d]=plan[i];const c=R.canPlace(s,k,x,y);if(c.ok){R.place(s,k,x,y,d==null?1:d);i++;continue;}if(/salt|unlocked/i.test(c.why))break;i++;}
  if(i>=plan.length)greedy(s,{});
  R.step(s,CONFIG.dt);
  for(const e of s.events) if(e.ev==='leak') console.log('leak',e.foe,'wave',s.wave,'t',s.t.toFixed(0));
  s.events.length=0;
  if(s.wave>=29 && Math.abs(s.t%5)<CONFIG.dt){let st=0,tot=0,inr=0;s.grid.forEach(b=>{if(b&&b.ammo!=null){tot++;if(b.ammo<1)st++;}});console.log('t',s.t.toFixed(0),'w',s.wave,'starving',st,'/',tot,'foes',s.foes.length);}
  for(const f of s.foes) if(f.foe==='tyrant'){ const k=Math.floor(f.prog/4); if(!seen[f.id+'_'+k]){seen[f.id+'_'+k]=1; console.log('tyrant',f.id,'w',s.wave,'prog',f.prog.toFixed(1),'hp',f.hp,'/',f.max);} }
}
const c={};s.grid.forEach(b=>{if(b)c[b.k]=(c[b.k]||0)+1});console.log(JSON.stringify(c));
