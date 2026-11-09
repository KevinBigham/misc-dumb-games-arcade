const G=require('./load.js')(process.argv[2]);
const {Rules,DATA,CONFIG}=G;
const greedy=require('./greedy.js')(G);
// scripted build orders: list of [kind,x,y,dir]
const plans={
 nothing:[],
 creek:[ // Strategy B: rakes touching cannons along the bends
  ['rake',6,14],['cannon',5,13],['rake',6,13],['belt',3,14,1],['rake',2,14],['rake',2,13,],['belt',3,13,2],
  ['cannon',6,11],['rake',4,11],['rake',3,11],['cannon',5,11],['rake',4,8],['cannon',3,8],['cannon',5,8],
  ['splitter',5,10],['cannon',6,10],['rake',0,10],['rake',1,10],['rake',0,11],
  ['pickler',5,13],['kiln',3,10],['mortar',3,12],['cannon',8,11],['cannon',6,5],['rake',4,5],['cannon',3,5],
  ['mortar',6,7],['kiln',7,7],['rake',7,8],['rake',8,8],['rake',8,7],['mortar',8,10],['kiln',8,12],['rake',9,12],
  ['cannon',1,5],['rake',0,5],['rake',1,4],['cannon',8,4],['rake',9,3],['mortar',3,7],['kiln',4,7],['rake',4,8],
  ['cannon',6,4],['pickler',3,4],['cannon',5,2],['rake',5,1],['rake',4,1],['rake',4,2],['cannon',3,2],['mortar',6,2],['kiln',6,1],['rake',6,0],
 ],
};
plans.weak=plans.creek.slice(0,8);
plans.half=plans.creek.slice(0,26);
plans.bank=[['rake',6,14],['belt',3,14,1],['rake',2,14],['rake',2,13],['belt',3,13,2],['rake',6,13],['belt',5,13,3],['belt',4,13]].concat([['rake',3,11],['rake',4,11],['belt',5,11,2],['belt',5,12,2]]).concat(plans.creek.slice(1));

function run(name,seed,opts={}){
  const s=Rules.newGame(seed); const plan=(plans[name]||[]).slice(); let i=0;
  const T=opts.maxT||3000; let lastWave=0; const log=[];
  while(s.phase==='play' && s.t<T){
    // place next item if affordable and unlocked; skip impossible
    while(i<plan.length){
      const [k,x,y,d]=plan[i]; const c=Rules.canPlace(s,k,x,y);
      if(c.ok){Rules.place(s,k,x,y,d==null?1:d);i++;continue;}
      if(/salt|unlocked/i.test(c.why)) break; // wait
      if(!opts.quiet&&seed===1) console.log('skip',plan[i].join(','),c.why); i++; // skip invalid
    }
    if(i>=plan.length && opts.greedy) greedy(s,opts);
    if(opts.call && !s.spawnQ.length && s.foes.length===0 && s.wave>0) Rules.callWave(s);
    Rules.step(s,CONFIG.dt); s.events.length=0;
    if(s.wave!==lastWave){lastWave=s.wave; log.push(`w${s.wave} t${s.t.toFixed(0)} keep${s.keep} salt${Math.floor(s.salt)} built${i}`);}
  }
  return {name,seed,phase:s.phase,wave:s.wave,keep:s.keep,t:s.t.toFixed(0),leakBy:s.stats.leakBy,kills:s.stats.kills,built:i,log};
}
const name=process.argv[3]||'creek';
for(const seed of [1,2,3]){const r=run(name,seed,{call:process.argv.includes('call'),greedy:process.argv.includes('greedy'),quiet:true,heavy:process.argv.includes('heavy'),mix:!process.argv.includes('nomortar'),adapt:process.argv.includes('adapt'),noups:process.argv.includes('noups')});console.log(JSON.stringify({...r,log:undefined}));if(seed===1)console.log(r.log.join('\n'));}
