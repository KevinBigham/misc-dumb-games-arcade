const {G,els,rafQ}=require('./render.js'); const R=G.Rules,C=G.CONFIG; const fs=require('fs');
const scene=process.env.SCENE||'mid';
let st=G.newState(); 
const N=0,E=1,S=2,W=3; const set=(x,y,t,d)=>{st.grid[y*10+x]=null;R.place(st,x,y,t,d)}; const path=l=>l.forEach(([x,y,d])=>set(x,y,'belt',d));
if(scene==='mid'){ st.tier=4; st.hum=1234; st.prog=611;
  path([[2,1,S],[2,2,S],[2,3,S],[2,4,S]]); set(2,5,'mix',S); path([[1,4,S],[1,5,E],[1,6,E]]); set(2,6,'mix',E); set(3,6,'echo',E);
  path([[8,4,S]]); set(8,5,'mix',S); path([[7,1,S],[7,2,S],[7,3,S],[7,4,S],[7,5,E],[8,6,W],[8,7,W],[7,7,N]]); set(7,6,'mix',W); set(6,6,'echo',W);
  set(4,10,'fork',N); set(3,11,'cross',0); path([[4,11,N],[2,11,E]]);
  for(let i=0;i<600;i++) R.step(st,C.STEP);
}
if(scene==='join'){ st.tier=1; st.hum=88; st.prog=17; set(3,6,'join',E); path([[2,3,S],[2,4,S],[2,5,S],[2,6,E]]); path([[1,9,N],[1,8,E],[2,8,E],[3,8,N],[3,7,N]]); for(let i=0;i<500;i++) R.step(st,C.STEP); }
G.st=st; st.ev.length=0;
let t=0; for(let i=0;i<3;i++){ const f=rafQ.shift(); t+=16.7; f(t); }
const cv=els.board; const BW=parseFloat(cv.style.width), BH=parseFloat(cv.style.height);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}"><rect width="100%" height="100%" fill="#0e1b1a"/>${cv._svg().join('')}</svg>`;
fs.writeFileSync('/tmp/claude-0/sm/board-'+scene+'.svg',svg);
// tool icons strip
let icons=''; let x=0; for(const k in els){ if(k.startsWith('_canvas')&&els[k]._ctx&&els[k].width===26){ icons+=`<g transform="translate(${x},0)"><rect width="30" height="30" fill="#19332f"/>${els[k]._svg().join('')}</g>`; x+=32; } }
fs.writeFileSync('/tmp/claude-0/sm/icons.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="30">${icons}</svg>`);
console.log("board",BW,"x",BH,'cs',G.Renderer.cs, 'hint:', els.hint.innerHTML.slice(0,80), '| qty', els.qtyN.textContent, '| rate', els.rate.textContent);
