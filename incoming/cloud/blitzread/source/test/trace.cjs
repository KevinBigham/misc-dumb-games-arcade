const C=require('../src/core.js');const B=require('./bots.cjs');
const [pid,call,bot]=[process.argv[2],process.argv[3],process.argv[4]||'none'];
for(let seed=1;seed<200;seed++){const s=C.newGame({seed,oppId:'wardens'}); if(s.defCall!==call) continue;
 C.callPlay(s,pid);const P=s.play;const R=()=>0.5;const mem={};
 for(let i=0;i<900&&!P.result;i++){ const inp= bot==='smart'?B.BOTS.smart.input(s,P,R,mem):(pid=='CROSS'||pid=='SLANT'||pid=='DEEP')&&i==50?{throwTo:'X'}:{}; C.tick(s,1/60,inp); if(i%15==0){const c=C.carrierOf(P);console.log(P.t.toFixed(2),P.pursuit?'P':'-',c?c.key+'@'+c.x.toFixed(1)+','+(c.y-P.los).toFixed(1):'air', P.E.map(d=>d.key+':'+d.x.toFixed(0)+','+(d.y-P.los).toFixed(0)+(d.eng>=0?'E':'')+(P.t<d.stunUntil?'S':'')).join(' '));}}
 console.log(P.result, 'look',s.look); break;}
