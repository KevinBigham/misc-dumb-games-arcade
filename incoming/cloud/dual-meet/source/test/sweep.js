global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
const N = +process.argv[2] || 30;
for (const ae of (process.argv[3]||'0,0.03,0.06').split(',').map(Number)) {
  const d=[], b=[]; let t0=Date.now();
  for (let i=0;i<N;i++){ const M=DM.makeMeet('sw-'+i,{quick:true,awayEdge:ae}); d.push(M.defaultMargin); b.push(M.best.margin); }
  const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]};
  console.log('awayEdge',ae,'default p10/50/90',q(d,.1),q(d,.5),q(d,.9),'best p10/50/90',q(b,.1),q(b,.5),q(b,.9),'best<2',b.filter(x=>x<2).length,'ms/meet',((Date.now()-t0)/N).toFixed(0));
}
