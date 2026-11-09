global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
let w=0, n=+process.argv[2]||30, steps=[], ms=[];
for (let d=0; d<n; d++){ const M=DM.makeMeet('dual-meet|2026-12-'+String(d+1).padStart(2,'0'));
  let lu=M.defA.slice(), k=0; const t=Date.now(); for(;k<40;k++){ const h=DM.hint(M,lu); if(!h) break; lu=h.lu; }
  ms.push(Date.now()-t); steps.push(k); const m=DM.swim(M,lu).margin; if(m>0) w++; }
console.log('greedy hill-climb on visible info wins',w,'/',n,'avg taps',(steps.reduce((a,b)=>a+b)/n).toFixed(1),'ms per hint', (ms.reduce((a,b)=>a+b)/steps.reduce((a,b)=>a+b)).toFixed(1));
