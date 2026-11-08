global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js');
const ids=[16,24,38,2,11,14,29,5,7,9];
const target={}; // heavy reference
for(const i of ids){ const M=DM.makeMeet('conv-'+i); const h=DM.optimize(M.home,M.noiseA,M.luB,M.tB,{seed:'hv'+i,iters:80000,restarts:12,starts:[M.defA,M.best.lu]}); target[i]=Math.max(DM.swim(M,h.lu).margin,M.best.margin); }
for (const [sw,t0,it,rs] of [[0,2.2,16000,8],[0.35,2.2,16000,8],[0.35,4,16000,8],[0.35,2.2,32000,4],[0.5,3,16000,8]]) {
  DM._tune('swap',sw); DM._tune('t0',t0); let hit=0,t=Date.now();
  for(const i of ids){ const M=DM.makeMeet('conv-'+i); const r=DM.optimize(M.home,M.noiseA,M.luB,M.tB,{seed:'v'+i,iters:it,restarts:rs,starts:[M.defA]}); if(DM.swim(M,r.lu).margin>=target[i]) hit++; }
  console.log('swap',sw,'t0',t0,'iters',it,'restarts',rs,'hit',hit,'/',ids.length,'ms each',((Date.now()-t)/ids.length).toFixed(0));
}
console.log(JSON.stringify(target));
