global.GK = require('../src/gamekit.vendor.js');
const DM = require('../src/rules.js'); const B=require('./bots.js');
let bad=0,n=0; const R=GK.rng.make('fc');
for (let i=0;i<15;i++){ const M=DM.makeMeet('fc-'+i,{quick:true});
  const f=DM.fastScorer(M.home,M.noiseA,M.luB,M.tB);
  let lu=M.defA.slice();
  for(let k=0;k<300;k++){ const si=R.int(0,DM.NS-1), p=R.int(-1,11); const nx=DM.setSlot(lu,si,p); if(nx){ if(!DM.valid(nx)){bad++;console.log('INVALID',DM.problems(nx));} lu=nx; }
    const slow=DM.swim(M,lu).margin, fast=Math.round(f(lu)); n++;
    // soft term < 1 point; compare rounded margin with exact
    const fv=f(lu); if (Math.abs(fv-slow)>0.99){bad++; console.log('MISMATCH',slow,fv);} }
}
console.log('checked',n,'bad',bad);
