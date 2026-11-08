const B=require('./bots.js');
const cfg=process.argv[2]?JSON.parse(process.argv[2]):{};
for (const [n,mk] of [['orbit',s=>B.orbitBot({seed:s})],['human',s=>B.orbitBot({seed:s,noise:0.35,react:0.25,greed:3})],['careless',s=>B.orbitBot({seed:s,care:0})],['random',s=>B.randomBot({seed:s})],['idle',()=>B.idleBot()]]){
 let waves=[],t=[],cause={},score=[],ml=[];
 for(let s=1;s<=80;s++){const W=B.run('s'+s,mk(s),{cfg});waves.push(W.stats.waves);t.push(W.t);score.push(W.score);ml.push(W.stats.maxLoop);cause[W.cause]=(cause[W.cause]||0)+1;}
 const m=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
 console.log(n.padEnd(9),'waves',m(waves),'max',Math.max(...waves),'time',m(t),'maxT',Math.max(...t).toFixed(0),'score',m(score),'maxLoop',m(ml),JSON.stringify(cause));
}
