// Full test suite. Run: NODE_PATH=<dir with jsdom,@napi-rs/canvas> node tests.js
const mk=require('./harness'); const B=require('./bots');
const canon=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(x=>[x,v[x]])):v);
let fail=0,pass=0; const ok=(c,m)=>{ if(!c){fail++;console.log('FAIL',m);} else {pass++;console.log('ok  ',m);} };
const OUT=process.env.OUT||'/tmp/claude-0/sw';
// 1. first touch: fresh load, drag between first two towns
{ const H=mk(); const {G,frames,errors,doc}=H; frames(3);
  ok(errors.length===0,'loads with no errors'); ok(doc.getElementById('hint').textContent.includes('Drag from'),'first hint tells you what to drag');
  ok(H.AC.inst===undefined,'no AudioContext before a gesture');
  const m0=G.st.month; frames(300); ok(G.st.month===m0&&!G.st.started,'time does not run before the first line');
  H.dragSites(0,1); frames(2); ok(G.st.cables.length===1,'first drag builds a line'); ok(!!H.AC.inst,'audio starts on first gesture');
  ok(G.st.cash<1000&&G.st.started,'line costs money and starts the clock');
  frames(600); ok(G.st.month>=1,'months advance after building'); ok(errors.length===0,'no frame errors after a month');
  H.png(OUT+'/t-first-month.png');
  // tap the line -> cable sheet
  const cb=G.st.cables[0], a=H.sitePx(0), b=H.sitePx(1); const R=G.Renderer;
  const k=R.ctrl(G.st.sites[0],G.st.sites[1],cb), p=R.bez(G.st.sites[0],k,G.st.sites[1],0.3);
  H.tap(R.X(p.x),R.Y(p.y)); frames(1); ok(G.UI.sheet&&G.UI.sheet.kind==='cable','tapping a line opens its sheet');
  const cars=cb.cars.length; H.click('[data-act="add"]'); ok(cb.cars.length===cars+1,'+ Car adds a car');
  const up=doc.querySelector('[data-act="up"]'); ok(up.disabled,'Coach upgrade is locked before order 1');
  H.click('[data-act="wait"]'); ok(cb.wait===true,'order toggle switches to wait-to-fill');
  H.click('[data-act="sell"]'); ok(cb.cars.length===cars,'- Car sells a car');
  // a rebuild must never swap the button under a finger
  const btn=doc.querySelector('[data-act="add"]'); btn.dispatchEvent(new H.win.Event('pointerdown',{bubbles:true})); G.st.cash+=1; frames(60);
  ok(doc.querySelector('[data-act="add"]')===btn,'sheet does not rebuild while a finger is down'); btn.dispatchEvent(new H.win.Event('pointerup',{bubbles:true}));
  H.click('[data-act="remove"]'); ok(G.st.cables.length===1,'remove needs a second tap'); H.click('[data-act="remove"]');
  ok(G.st.cables.length===0,'second tap removes the line');
  // tap a site
  H.tap(a.x,a.y); frames(1); ok(G.UI.sheet&&G.UI.sheet.kind==='site'&&G.UI.sheet.id===0,'tapping a town opens its sheet');
  H.png(OUT+'/t-site-sheet.png');
}
// 2. invalid builds explain why
{ const H=mk(); const {G,frames,doc}=H; frames(2); const R=G.Rules, st=G.st;
  st.tier=3; for(const s of st.sites) if(s.kind==='town') s.want={P:10,J:10,T:10};
  let p=R.plan(st,3,2); ok(!p.ok&&/Nothing to carry/.test(p.reason),'pit–orchard refused: nothing to carry');
  st.tier=2; p=R.plan(st,5,8); ok(!p.ok&&/dust/.test(p.reason),'line to a dusty mesa refused'); st.tier=3; p=R.plan(st,5,8); ok(!p.ok&&/Too long|Blocked/.test(p.reason),'very long line refused ('+p.reason+')');
  ok(R.build(st,0,1).ok,'build Ochreton–Redfern');
  const big=G.newState('classic',st.seed); B.sim(big,40,B.smart()); big.cash=1e9; let crossFound=null;
  for(let i=0;i<big.sites.length;i++)for(let j=i+1;j<big.sites.length;j++){const q=R.plan(big,i,j);if(/cross/.test(q.reason))crossFound=q.reason;}
  ok(!!crossFound,'crossing lines are refused: '+crossFound);
  st.cash=10; p=R.plan(st,0,5); ok(!p.ok&&p.short,'not enough money is refused with the cost');
  H.dragSites(2,3); frames(1); ok(/Nothing to carry|Blocked|cross|Too long/.test(doc.getElementById('toast').textContent),'failed drag shows a reason toast: '+doc.getElementById('toast').textContent);
}
// 3. keyboard building
{ const H=mk(); const {G,frames}=H; frames(2);
  H.key('ArrowRight'); ok(G.UI.focus===0,'arrow focuses first place'); H.key('Enter'); ok(G.UI.from===0,'Enter picks start'); H.key('ArrowRight'); H.key('Enter');
  ok(G.st.cables.length===1,'keyboard builds a line'); H.key(' '); ok(G.UI.paused,'space pauses'); const m=G.st.t; frames(60); ok(G.st.t===m,'paused time stands still'); H.key(' ');
  H.key('3'); ok(G.UI.speed===2,'3 sets 4x speed');
}
// 4. determinism + save mid-month resumes exactly
{ const H=mk(); const {G}=H; const R=G.Rules,C=G.CONFIG;
  const runA=G.newState('daily',20261106), runB=G.newState('daily',20261106); const pol=B.smart();
  function adv(st,n){for(let i=0;i<n;i++)R.step(st,C.STEP);st.ev.length=0;}
  for(let k=0;k<30;k++){pol(runA);adv(runA,113);}
  for(let k=0;k<15;k++){pol(runB);adv(runB,113);}
  const json=JSON.stringify(R.serialize(runB)); const runC=R.deserialize(JSON.parse(json));
  ok(!!runC,'mid-month save loads'); ok(canon(R.serialize(runC))===canon(JSON.parse(json)),'load→save is lossless');
  for(let k=15;k<30;k++){pol(runC);adv(runC,113);}
  ok(canon(R.serialize(runA))===canon(R.serialize(runC)),'save/load mid-run then continue == uninterrupted run (deterministic)');
}
// 5. unsafe save loading
{ const bad=[ 'not json{', JSON.stringify({v:99}), JSON.stringify({v:1,sites:[],cables:[]}), null ];
  const H0=mk(); const G=H0.G; const st=G.newState('classic',1); G.Rules.build(st,0,1);
  const good=G.Rules.serialize(st);
  const t1=JSON.parse(JSON.stringify(good)); t1.cash='lots'; t1.cables[0].cars=Array(40).fill(t1.cables[0].cars[0]); t1.sites[0].piles={R:1e9,X:5};
  const t2=JSON.parse(JSON.stringify(good)); t2.cables.push({id:9,a:0,b:6,cls:0,cars:[{p:0}]});
  const t3=JSON.parse(JSON.stringify(good)); t3.cables[0].cls=3;
  bad.push(JSON.stringify(t2),JSON.stringify(t3));
  for(const raw of bad){ const store={}; if(raw!==null) store['sunwire.run.v1']=raw; const H=mk({store}); H.frames(2);
    ok(H.errors.length===0&&H.G.st&&H.G.st.cables.length===0,'bad save '+(raw?raw.slice(0,24):'(none)')+'… → fresh run, no crash');
    if(raw) ok(store['sunwire.run.v1.bad']===raw,'  …and the damaged save is kept as a backup'); }
  const r1=G.Rules.deserialize(t1); ok(r1&&r1.cash===1000&&r1.cables[0].cars.length===G.Rules.maxCars(r1.cables[0])&&r1.sites[0].piles.R===G.CONFIG.PILE_CAP&&!('X' in r1.sites[0].piles),'out-of-range fields are clamped, not trusted');
  const store={'sunwire.run.v1':JSON.stringify(good)}; const H=mk({store}); H.frames(2); ok(H.G.st.cables.length===1&&H.G.st.started,'valid save restores the run');
}
// 6. hidden tab: sim pauses, audio suspends, no tones while hidden
{ const H=mk(); const {G,frames}=H; frames(2); H.dragSites(0,1); frames(30);
  G.Audio.setMusic(true); H.setHidden(true); const t=G.st.clock; const n=H.tones.length; frames(300);
  ok(G.st.clock===t,'hidden tab freezes the sim'); ok(H.AC.inst.state==='suspended','hidden tab suspends audio');
  G.Audio.tick(); ok(H.tones.length===n,'no notes scheduled while hidden');
  H.setHidden(false); frames(30); ok(G.st.clock>t,'visible again resumes'); ok(H.AC.inst.state==='running','audio resumes');
}
// 7. soft lock: remove everything when you cannot afford a new line
{ const H=mk(); const {G,frames}=H; frames(2); H.dragSites(0,1); frames(2); const st=G.st;
  st.cash=-200; const r=G.Rules.remove(st,st.cables[0].id); frames(60);
  ok(st.over==='broke','no lines and no money ends the run (no soft lock)'); ok(G.UI.modal==='over','game-over card appears');
  H.click('[data-m="retry"]'); ok(!G.st.over&&G.st.cables.length===0&&G.st.cash===1000,'Try again starts a fresh run on the same map');
}
// 8. bankruptcy and overdraft rules
{ const H=mk(); const G=H.G,R=G.Rules,C=G.CONFIG; const st=G.newState('classic',1); R.build(st,0,1);
  for(let i=0;i<5;i++) R.addCar(st,st.cables[0].id);
  st.cash=-50; st.last.profit=500; // profitable but overdrawn
  for(let i=0;i<Math.round(C.MONTH_SEC/C.STEP)*3+2;i++) R.step(st,C.STEP);
  ok(!st.over,'profitable network that dips below $0 is not bankrupt');
  const s2=G.newState('classic',1); R.build(s2,0,1); s2.cash=-(C.CREDIT+50); s2.t=C.MONTH_SEC-C.STEP/2; R.step(s2,C.STEP);
  ok(s2.over==='bankrupt','past the credit line → bankrupt');
  const s3=G.newState('classic',1); R.build(s3,0,1); s3.cables[0].cars.forEach(c=>{c.st='dwell';c.tm=1e9;});
  s3.cash=-10; for(let m=0;m<4&&!s3.over;m++) for(let i=0;i<Math.round(C.MONTH_SEC/C.STEP)+1;i++) R.step(s3,C.STEP);
  ok(s3.over==='bankrupt'&&s3.strikes>=3,'three losing months in the red → bankrupt');
}
// 9. full winning run via UI-less bot, then freeplay; losing (lazy) run expires
{ const {G}=mk(); const st=G.newState('classic',G.st.seed); const r=B.sim(st,72,B.smart());
  ok(r.won&&r.wonMonth<=60,'smart strategy signs the charter (month '+r.wonMonth+')'); ok(st.free&&st.free.type==='deliver','freeplay hands out boom orders');
  const lz=G.newState('classic',G.st.seed); const r2=B.sim(lz,72,B.lazy); ok(r2.over==='expired','one-line strategy runs out of time (loss reachable)');
  const sp=G.newState('classic',G.st.seed); const r3=B.sim(sp,72,B.spend); ok(r3.wonMonth>r.wonMonth,'overbuilding is slower than smart play ('+r3.wonMonth+' vs '+r.wonMonth+')');
}
// 9b. the order toggle is a real tradeoff
{ const {G}=mk(); const R=G.Rules,C=G.CONFIG; const res={};
  for(const w of [false,true]){ const st=G.newState('classic',G.st.seed); st.tier=1; st.cash=1e5; R.build(st,1,2); const cb=st.cables[0]; for(let i=0;i<3;i++)R.addCar(st,cb.id); R.upgrade(st,cb.id); cb.wait=w; const c0=st.cash;
    for(let i=0;i<Math.round(C.MONTH_SEC/C.STEP)*8;i++)R.step(st,C.STEP); res[w]={cash:Math.round(st.cash-c0),n:st.delivered.P}; }
  ok(res[true].cash>res[false].cash,'wait-to-fill earns more on a trickle line with too many cars ('+res[true].cash+' vs '+res[false].cash+')');
  const busy={}; for(const w of [false,true]){ const st=G.newState('classic',G.st.seed); st.cash=1e5; R.build(st,0,1); const cb=st.cables[0]; cb.wait=w; st.sites[0].pop=400; st.sites[1].pop=400;
    for(let i=0;i<Math.round(C.MONTH_SEC/C.STEP)*6;i++)R.step(st,C.STEP); busy[w]=st.delivered.R; }
  ok(busy[false]>=busy[true],'leave-on-time moves at least as much on a busy line ('+busy[false]+' vs '+busy[true]+')');
  const st=G.newState('classic',1); ok(st.sites[0].piles.R>=5&&st.sites[1].piles.R>=5,'towns start with riders waiting so the first trip pays');
}
// 10. farming: growth is bounded in long freeplay
{ const {G}=mk(); const R=G.Rules,C=G.CONFIG; const st=G.newState('classic',G.st.seed); const pol=B.smart(); const prof=[];
  for(let m=0;m<200;m++){ for(let h=0;h<2;h++){pol(st);for(let i=0;i<120;i++)R.step(st,C.STEP);st.ev.length=0;} if(m>=100) prof.push(st.last.profit); }
  const a=prof.slice(0,30).reduce((x,y)=>x+y,0)/30, b=prof.slice(-30).reduce((x,y)=>x+y,0)/30;
  ok(b<a*1.25,'income plateaus in long freeplay (m100-130 avg '+Math.round(a)+' vs m170-200 avg '+Math.round(b)+')');
  ok(st.sites.every(s=>s.pop<=C.POP_CAP&&s.mul<=C.MUL_CAP),'town size and output stay under their caps');
  ok(st.cables.every(c=>c.cars.length<=R.maxCars(c)),'no line exceeds its car limit');
}
// 11. expiry → keep building
{ const H=mk(); const {G,frames}=H; frames(2); H.dragSites(0,1); frames(2); const st=G.st; st.month=G.CONFIG.DEADLINE-1; st.t=G.CONFIG.MONTH_SEC-0.05; frames(10);
  ok(st.over==='expired','deadline ends the charter'); frames(60); ok(G.UI.modal==='over','expired card shows');
  H.click('[data-m="free"]'); frames(30); ok(!G.st.over&&G.st.expired&&!G.UI.modal,'Keep building continues the run');
}
// 12. order complete reveals new mesas + win modal
{ const H=mk(); const {G,frames}=H; frames(2); H.dragSites(0,1); frames(2); const st=G.st; st.prog=39.9; st.cash=5000;
  frames(1200); ok(st.tier>=1&&G.Rules.isRev(st,st.sites[2]),'finishing order 1 opens Peachwood');
  st.tier=4; st.cash=70000; G.Rules.afterAction(st); frames(120); ok(st.won&&G.UI.modal==='win','reaching the charter shows the win card');
  H.png(OUT+'/t-win.png'); H.click('[data-m="free"]'); ok(!G.UI.modal,'freeplay closes the card');
}
// 13. 375px screenshot of a busy mid-game + phone landscape-ish wide
{ const store={}; const {G}=mk(); const st=G.newState('classic',G.st.seed); B.sim(st,30,B.smart()); store['sunwire.run.v1']=JSON.stringify(G.Rules.serialize(st));
  const H=mk({store}); H.frames(40); ok(H.errors.length===0,'mid-game save renders cleanly at 375px'); H.png(OUT+'/t-mid-375.png');
  const cb=H.G.st.cables.find(c=>c.status&&c.status.k!=='good')||H.G.st.cables[0]; H.G.UI.openSheet('cable',cb.id); H.frames(2); H.png(OUT+'/t-cable-sheet.png');
  const W=mk({store,w:820,h:600,hud:110}); W.frames(5); ok(W.errors.length===0,'wide screen renders'); W.png(OUT+'/t-wide.png');
}
console.log('\n'+pass+' passed, '+fail+' failed'); process.exitCode=fail?1:0;
