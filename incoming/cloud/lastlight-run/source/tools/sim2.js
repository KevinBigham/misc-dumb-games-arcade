// difficulty calibration: good bot, ghost-draft bot, and a "human-ish" bot (reaction lag, digital steering, late braking, no racing line)
const c=require('@sparticuz/chromium');const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:await c.executablePath(),args:c.args,headless:true});
const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]); await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const L=__LL, C=L.CONFIG;
 const mul=a=>{return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}};
 function human(i,seed,skill){const T=L.BUILT[i];let s=L.newRace(T,'race');s.phase='race';const rnd=mul(seed);const q=[];let steps=0;
  const lag=Math.round(14-skill*8);
  while(s.phase==='race'&&steps<60*400){let inp=L.botInput(s,T,null,false);
   // no racing line: aim for middle-ish unless the bot is dodging
   if(rnd()>skill*0.7) inp.steer=Math.max(-1,Math.min(1,inp.steer*0.6+(rnd()-0.5)*0.6));
   inp.steer=Math.abs(inp.steer)>0.3?Math.sign(inp.steer):0;
   if(inp.brake&&rnd()>0.4+skill*0.5) inp.brake=false;
   if(rnd()<0.004*(1-skill)) inp.steer=rnd()<0.5?-1:1;
   q.push(inp); const use=q.length>lag?q.shift():{steer:0,brake:false,boost:false};
   s=L.step(s,use,C.step,T,null).s;steps++;}
  return {win:!!(s.result&&s.result.win),t:+s.t.toFixed(1),prog:+s.prog.toFixed(2),minL:+s.minLight.toFixed(1),bumps:s.bumps,off:+s.offT.toFixed(1)};}
 const out=[];for(let i=0;i<3;i++){const g=L.sim(i),g2=L.sim(i,{ghost:g.ghost});
  const H=[0.2,0.5,0.8].map(sk=>[1,2,3,4,5,6].map(sd=>human(i,sd*17+i,sk)));
  out.push({track:i,len:g.len,gates:g.gates.length-1,start:g.startLight,bot:+g.time.toFixed(2),botGhost:+g2.time.toFixed(2),botMinL:+g.minLight.toFixed(1),
   human:H.map((arr,k)=>({skill:[0.2,0.5,0.8][k],wins:arr.filter(x=>x.win).length+'/6',times:arr.filter(x=>x.win).map(x=>x.t).join(' '),fails:arr.filter(x=>!x.win).map(x=>x.prog).join(' '),bumps:arr.map(x=>x.bumps).join(' '),off:arr.map(x=>x.off).join(' ')}))});}
 return out;});
for(const t of r){console.log(`track ${t.track}: segs ${t.len}, gates ${t.gates}, start ${t.start}s | bot ${t.bot}s (with ghost ${t.botGhost}s) minLight ${t.botMinL}`);for(const h of t.human)console.log(`   skill ${h.skill}: wins ${h.wins} times [${h.times}] fails@ [${h.fails}] bumps [${h.bumps}] offroad s [${h.off}]`);}
console.log('errors',errs);await b.close();})();
