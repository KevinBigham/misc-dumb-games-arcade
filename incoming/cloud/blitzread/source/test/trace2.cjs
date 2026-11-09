const C=require('../src/core.js');const B=require('./bots.cjs');
const [pid,call,key,at]=[process.argv[2],process.argv[3],process.argv[4],+process.argv[5]||1.0];
for(let seed=1;seed<300;seed++){const s=C.newGame({seed,oppId:'wardens'}); if(s.defCall!==call||s.look!==call) continue;
 C.callPlay(s,pid);const P=s.play;
 for(let i=0;i<900&&!P.result;i++){ C.tick(s,1/60,Math.abs(P.t-at)<0.01?{throwTo:key}:{}); if(i%12==0){const c=C.carrierOf(P);console.log(P.t.toFixed(2),P.pursuit?'P':'-',c?c.key+'@'+c.x.toFixed(1)+','+(c.y-P.los).toFixed(1)+' v'+c.vx.toFixed(1)+','+c.vy.toFixed(1):'air', P.E.filter(e=>e.team=='D').map(d=>d.key+':'+d.x.toFixed(0)+','+(d.y-P.los).toFixed(0)+(d.eng>=0?'E':'')+(P.t<d.stunUntil?'S':'')).join(' '));}}
 console.log(P.result); break;}
