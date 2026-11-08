global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js'); const B = require('./bots.js');
const N = +process.argv[2] || 30;
for (const ae of (process.argv[3]||'0.03,0.06,0.09').split(',').map(Number)) {
  const rows=[];
  for (let i=0;i<N;i++){ const M=DM.makeMeet('bal-'+i,{quick:true,awayEdge:ae,revealInd:+(process.argv[4]||3)});
    const s=DM.swim(M,B.scout(M)).margin, f=DM.swim(M,B.fixer(M)).margin;
    rows.push({d:M.defaultMargin,b:M.best.margin,s,f}); }
  const q=(k,p)=>{const a=rows.map(r=>r[k]).sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]};
  const w=k=>(rows.filter(r=>r[k]>0).length/N*100).toFixed(0)+'%';
  console.log('ae',ae,'| default med',q('d',.5),'win',w('d'),'| fixer med',q('f',.5),'win',w('f'),'| scout med',q('s',.5),'win',w('s'),'| best med',q('b',.5),'win',w('b'));
}
