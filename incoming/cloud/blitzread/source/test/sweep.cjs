const C=require('../src/core.js');const B=require('./bots.cjs');
function meas(label){const all=[];let w=0,pf=0,pa=0,pl=0,rt=0;const n=40;
 for(let i=1;i<=n;i++){const per={};const r=B.playGame(i*17,'wardens',B.BOTS.smart,{perPlay:per});for(const k in per)all.push(...per[k]);if(r.res==='W')w++;pf+=r.me;pa+=r.op;pl+=r.plays;rt+=r.realT;}
 const rr={};for(let i=1;i<=n;i++){const r=B.playGame(i*17,'wardens',B.BOTS.random,{});rr.w=(rr.w||0)+(r.res==='W');rr.pf=(rr.pf||0)+r.me;}
 all.sort((a,b)=>a-b);console.log(label.padEnd(28),'ypp',(all.reduce((a,b)=>a+b,0)/all.length).toFixed(1),'med',all[all.length>>1],'big',(all.filter(x=>x>=20).length/all.length).toFixed(2),'| smart W',w/n,'pf',(pf/n).toFixed(1),'pa',(pa/n).toFixed(1),'plays',(pl/n).toFixed(1),'min',(rt/n/60).toFixed(1),'| rand W',(rr.w/n).toFixed(2),'pf',(rr.pf/n).toFixed(1));}
const S=C.CONFIG.SPD, base=JSON.parse(JSON.stringify(C.CONFIG));
function reset(){Object.assign(C.CONFIG,JSON.parse(JSON.stringify(base)));}
meas('base');
C.CONFIG.TACKLE_R=1.3; meas('tackleR 1.3'); reset();
for(const k of ['DL','LB','CB','S'])C.CONFIG.SPD[k]*=1.05; meas('def +5%'); reset();
C.CONFIG.CLOSE_BOOST=1.2;C.CONFIG.CLOSE_R=4.5; meas('close boost 1.2/4.5'); reset();
C.CONFIG.TACKLE_R=1.3;for(const k of ['DL','LB','CB','S'])C.CONFIG.SPD[k]*=1.05;C.CONFIG.CLOSE_BOOST=1.2;C.CONFIG.CLOSE_R=4.5; meas('all three'); reset();
