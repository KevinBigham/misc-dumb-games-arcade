const C=require('../src/core.js');const B=require('./bots.cjs');
const mode=process.argv[2]||'smart';
const bot={call:B.BOTS.smart.call,def:B.BOTS.smart.def,input:(s,P,R,m)=>{const i=B.BOTS.smart.input(s,P,R,m); if(mode==='nosteer'){delete i.steer;delete i.juke;} if(mode==='nojuke') delete i.juke; return i;}};
const byKind={};const all=[];
for(let i=1;i<=50;i++){const per={};B.playGame(i*17,process.argv[3]||'wardens',bot,{perPlay:per});for(const k in per){all.push(...per[k]);const p=k.split('/')[0];(byKind[p]=byKind[p]||[]).push(...per[k]);}}
const st=a=>{a=a.slice().sort((x,y)=>x-y);const q=f=>a[Math.floor(a.length*f)];return 'n'+a.length+' p25 '+q(.25)+' med '+q(.5)+' p75 '+q(.75)+' mean '+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1)+' big '+(a.filter(x=>x>=20).length/a.length).toFixed(2);};
console.log(mode,'ALL',st(all));for(const k in byKind)console.log(k,st(byKind[k]));
