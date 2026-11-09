const H=require('./harness.js'); const {G}=H; const R=G.Rules, C=G.CONFIG;
let st=G.newState(); G.st=st;
const set=(x,y,t,d)=>{ st.grid[y*10+x]=null; if(!R.place(st,x,y,t,d)) throw new Error('place fail '+[x,y,t]); };
const N=0,E=1,S=2,W=3;
function path(list){ for(const [x,y,d] of list) set(x,y,'belt',d); }
function clear(){ R.applyBuildList(st,[]); }
const L={
 0(){ path([[2,3,E],[3,3,S],[3,4,S],[3,5,S],[3,6,E]]); path([[8,9,N],[8,8,W],[7,8,W],[6,8,W],[5,8,N]]); },
 1(m='join'){ set(3,6,m,E); path([[2,3,S],[2,4,S],[2,5,S],[2,6,E]]); path([[1,9,N],[1,8,E],[2,8,E],[3,8,N],[3,7,N]]);
   set(6,7,m,W); path([[8,9,N],[8,8,N],[8,7,W],[7,7,W]]); path([[8,4,S],[8,5,W],[7,5,W],[6,5,S],[6,6,S]]); },
 2(){ L[1]('mix'); },
 3(){ path([[2,1,S],[2,2,S],[2,3,S],[2,4,S]]); set(2,5,'mix',S); path([[1,4,S],[1,5,E],[2,6,E]]); set(3,6,'join',E); path([[0,7,S],[0,8,E],[1,8,E],[2,8,E],[3,8,N],[3,7,N]]);
   path([[7,1,S],[7,2,S],[7,3,S],[7,4,S]]); set(7,5,'mix',S); path([[8,4,S],[8,5,W],[7,6,S],[7,7,W]]); set(6,7,'join',W); path([[9,8,S],[9,9,W],[8,9,W],[7,9,W],[6,9,N],[6,8,N]]); },
 4(){ path([[2,1,S],[2,2,S],[2,3,S],[2,4,S]]); set(2,5,'mix',S); path([[1,4,S],[1,5,E],[1,6,E]]); set(2,6,'mix',E); set(3,6,'echo',E);
   path([[8,4,S]]); set(8,5,'mix',S); path([[7,1,S],[7,2,S],[7,3,S],[7,4,S],[7,5,E],[8,6,W],[8,7,W],[7,7,N]]); set(7,6,'mix',W); set(6,6,'echo',W); },
 5(){ set(2,1,'join',S); path([[1,2,N],[1,1,E],[2,2,S],[2,3,S],[2,4,S]]); set(2,5,'join',S);
   path([[2,12,N],[2,11,N]]); set(2,10,'join',N); path([[2,9,E],[3,9,N],[3,8,N]]); set(3,7,'cross',0); path([[3,6,N],[3,5,W],[2,6,S]]);
   set(0,7,'echo',S); set(0,8,'echo',E); path([[1,8,N],[1,7,E]]); set(2,7,'mix',E); },
};
L[6]=function(){
  set(7,1,'echo',S); path([[7,2,S],[7,3,S]]); set(7,4,'join',S); set(8,4,'join',W); path([[9,6,N],[9,5,N],[9,4,W],[7,5,W],[6,5,W]]); set(5,5,'mix',S);
  set(1,1,'mix',E); path([[1,0,S],[3,2,W],[2,2,W],[1,2,W],[0,2,N],[0,1,E]]); set(2,1,'join',E); set(3,1,'flip',E); path([[4,1,E],[5,1,S],[5,2,S],[5,3,S],[5,4,S]]);
};
const order=[0,1,2,3,4,5,6,7];
let total=0; const res=[];
for(const tier of order){
  if(st.tier!==tier){ console.log('tier mismatch',st.tier,tier); break; }
  clear(); (L[tier]||L[6])();
  let t=0; const o=R.order(st); let bought=[];
  while(st.tier===tier && t<3600){
    for(let i=0;i<120;i++) R.step(st,C.STEP); t+=1; st.ev.length=0;
    // greedy: buy cheapest affordable
    let best=null; for(const id of ['well','mach','belt']){ const c=R.upCost(st.up[id]); if(st.up[id]<R.upCap(st) && st.hum>=c && (!best||c<best.c)) best={id,c}; }
    if(best){ R.buy(st,best.id); bought.push(best.id[0]); }
  }
  total+=t; res.push({tier:tier+1, order:o.order, qty:o.qty, simSec:t, at4x:Math.round(t/4), up:JSON.stringify(st.up), hum:Math.round(st.hum), done:st.tier>tier});
  console.log(JSON.stringify(res[res.length-1]));
}
console.log('total sim minutes', (total/60).toFixed(1), ' at 4x:', (total/240).toFixed(1));
