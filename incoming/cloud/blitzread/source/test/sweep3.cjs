const C=require('../src/core.js');const B=require('./bots.cjs');
const mixes={smart:B.BOTS.smart, random:B.BOTS.random, smartO_randD:{call:B.BOTS.smart.call,input:B.BOTS.smart.input,def:B.BOTS.random.def}, randO_smartD:{call:B.BOTS.random.call,input:B.BOTS.random.input,def:B.BOTS.smart.def}, smartCall_noSteer:{call:B.BOTS.smart.call,def:B.BOTS.smart.def,input:(s,P,R,m)=>{const i=B.BOTS.smart.input(s,P,R,m);delete i.steer;delete i.juke;return i;}}};
const n=+process.argv[2]||40; const rows=[];
for(const t of (process.argv[3]?[process.argv[3]]:C.TEAMS.map(t=>t.id))) for(const m in mixes){let w=0,pf=0,pa=0,pl=0,rt=0;for(let i=1;i<=n;i++){const r=B.playGame(i*31+5,t,mixes[m]);w+=r.res==='W';pf+=r.me;pa+=r.op;pl+=r.plays;rt+=r.realT;}rows.push({team:t,bot:m,win:+(w/n).toFixed(2),pf:+(pf/n).toFixed(1),pa:+(pa/n).toFixed(1),plays:+(pl/n).toFixed(1),min:+(rt/n/60).toFixed(1)});}
console.table(rows);
