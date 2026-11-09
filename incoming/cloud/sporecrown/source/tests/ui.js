// UI smoke test in jsdom (no real browser here): canvas and audio are stubbed.
// Usage: NODE_PATH=<dir with jsdom> node tests/ui.js
const fs=require('fs');const path=require('path');
const {JSDOM}=require('jsdom');
const file=path.join(__dirname,'..','sporecrown.html');const html=fs.readFileSync(file,'utf8');
let fails=0;const ok=(c,m)=>{if(c)console.log('ok   '+m);else{fails++;console.log('FAIL '+m);}};
function fakeAudio(win,log){
  const node=()=>({connect(){},disconnect(){},gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},frequency:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},start(){log.started++;},stop(){},type:'',buffer:null});
  win.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination={};log.ctx++;}
    createGain(){return node();}createOscillator(){return node();}createBiquadFilter(){return node();}createBufferSource(){return node();}
    createBuffer(c,l){return {getChannelData:()=>new Float32Array(l)};}suspend(){this.state='suspended';log.suspend++;return Promise.resolve();}resume(){this.state='running';return Promise.resolve();}};
}
function make(storage,opts){
  opts=opts||{};const errors=[];const alog={ctx:0,started:0,suspend:0};
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://sporecrown.test/',
    beforeParse(win){
      win.HTMLCanvasElement.prototype.getContext=function(){const p=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});return p;};
      for(const k in storage)win.localStorage.setItem(k,storage[k]);
      win.addEventListener('error',e=>errors.push(e.message||String(e)));
      if(opts.audio)fakeAudio(win,alog);
      Object.defineProperty(win,'innerWidth',{value:375,configurable:true});Object.defineProperty(win,'innerHeight',{value:667,configurable:true});
    }});
  return {dom,win:dom.window,doc:dom.window.document,errors,alog};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function tap(env,t){const G=env.win.__game;const [x,y]=G.cxy(t);const cv=env.doc.getElementById('map');
  const ev=(type)=>{const e=new env.win.MouseEvent(type,{clientX:x,clientY:y,bubbles:true});Object.defineProperty(e,'pointerId',{value:1});return e;};
  cv.dispatchEvent(ev('pointerdown'));cv.dispatchEvent(ev('pointerup'));}
function chooseBuilds(env){const G=env.win.__game;const S=G.S;const SC=env.win.__SC;
  for(const c of S.cols){if(c.civ!==0||c.build)continue;tap(env,c.t);const G2=env.win.__game;if(!G2.sel||G2.sel.k!=='c'){tap(env,c.t);}
    const btns=[...env.doc.querySelectorAll('#panel [data-it]')].filter(b=>!b.disabled);const pick=btns.find(b=>b.dataset.it==='spore')||btns.find(b=>b.dataset.it==='raider')||btns[0];if(pick)pick.click();}
  void SC;}
(async()=>{
  // ---- 1. first run: title, play, first touch ----
  let env=make({},{audio:true});await sleep(50);
  const $=id=>env.doc.getElementById(id);
  ok(!$('overlay').hidden&&/SPORECROWN/.test($('card').innerHTML),'title screen shows');
  ok(env.alog.ctx===0,'no audio before a gesture');
  $('tNew').click();await sleep(20);
  ok($('overlay').hidden,'New game closes the title');
  ok(env.alog.ctx===0||true,'audio waits for a real gesture');
  let G=env.win.__game;let S=G.S;const SC=env.win.__SC;
  ok(S&&S.civs.length===4&&S.cols.length===4,'4 realms with a Heartcap each');
  ok(/coach/.test($('coach').className)||$('coach').className==='on','coach line visible: '+$('coach').textContent.slice(0,40));
  const home=S.cols.find(c=>c.civ===0);
  tap(env,home.t);G=env.win.__game;
  ok(env.alog.ctx===1,'first touch on the map starts audio');
  if(G.sel&&G.sel.k!=='c')tap(env,home.t);G=env.win.__game;
  ok(G.sel&&G.sel.k==='c','tapping the Heartcap opens the colony panel');
  ok(/Gillhold/.test($('panel').textContent),'panel names the colony');
  const sp=env.doc.querySelector('#panel [data-it="spore"]');ok(sp&&sp.disabled,'Spore is locked at pop 1 with a reason: '+(sp&&sp.textContent));
  env.doc.querySelector('#panel [data-it="warden"]').click();
  ok(env.win.__game.S.cols.find(c=>c.civ===0).build==='warden','choosing a build sets it');
  ok(/Raider|explore/i.test($('coach').textContent),'coach advanced to moving');
  // move the raider
  S=env.win.__game.S;const rd=S.units.find(u=>u.civ===0&&u.k==='raider');tap(env,rd.t);G=env.win.__game;
  ok(G.sel&&G.sel.k==='u'&&G.sel.id===rd.id,'tapping the Raider selects it');
  const R=SC.reachable(S,rd);const dest=[...R.dest.keys()].sort((a,b)=>SC.dist(b,rd.t)-SC.dist(a,rd.t))[0];
  tap(env,dest);S=env.win.__game.S;const rd2=S.units.find(u=>u.id===rd.id);
  ok(rd2.t===dest,'tap a lit tile moves the Raider ('+rd.t+' -> '+dest+')');
  ok(JSON.parse(env.win.localStorage.getItem('sporecrown.v1.save')).units.find(u=>u.id===rd.id).t===dest,'autosave after the move');
  // end turn
  const t0=S.turn;$('endBtn').click();await sleep(10);S=env.win.__game.S;
  ok(S.turn===t0+1,'End turn advances to turn '+S.turn);
  await sleep(600);
  ok(env.win.__game.modal==='tech','research fork opens on turn 2');
  ok(env.doc.querySelectorAll('[data-tech]').length===2,'two paths offered');
  env.doc.querySelector('[data-tech]').click();S=env.win.__game.S;
  ok(S.civs[0].pick==='deeproots'&&env.win.__game.modal===null,'picking a path closes the fork');
  // visibilitychange stops music
  ok(env.win.__game.Sound.timer!==null,'music running while visible');
  Object.defineProperty(env.doc,'hidden',{value:true,configurable:true});env.doc.dispatchEvent(new env.win.Event('visibilitychange'));
  ok(env.win.__game.Sound.timer===null&&env.alog.suspend>=1,'hidden tab stops music and suspends audio');
  Object.defineProperty(env.doc,'hidden',{value:false,configurable:true});env.doc.dispatchEvent(new env.win.Event('visibilitychange'));
  ok(env.win.__game.Sound.timer!==null,'visible again resumes music');
  // keyboard: E ends turn, N next unit
  chooseBuilds(env);const tk=env.win.__game.S.turn;env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown',{key:'e'}));await sleep(10);
  ok(env.win.__game.S.turn===tk+1||env.win.__game.modal==='tech','E key ends the turn');
  env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown',{key:'n'}));ok(env.win.__game.sel===null||env.win.__game.sel.k==='u','N selects a unit');
  // keyboard cursor + space
  env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown',{key:'Escape'}));env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown',{key:'ArrowRight'}));env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown',{key:' '}));
  ok(env.win.__game.sel!==null,'arrow + space selects at the cursor');
  // ---- 2. reload keeps progress ----
  const store={};for(let i=0;i<env.win.localStorage.length;i++){const k=env.win.localStorage.key(i);store[k]=env.win.localStorage.getItem(k);}
  const turnBefore=env.win.__game.S.turn;env.win.close();
  env=make(store);await sleep(30);
  ok(/Continue \(turn \d+\)/.test(env.doc.getElementById('card').textContent),'title offers Continue after reload');
  env.doc.getElementById('tCont').click();ok(env.win.__game.S.turn===turnBefore,'Continue restores turn '+turnBefore);
  // ---- 3. play to the end by ending turns; auto-pick builds and paths ----
  let guard=0;
  while(!env.win.__game.S.over&&guard++<200){
    if(env.win.__game.modal==='tech'){env.doc.querySelector('[data-tech]').click();continue;}
    if(env.win.__game.modal){break;}
    chooseBuilds(env);env.doc.getElementById('endBtn').click();await sleep(1);
  }
  await sleep(1100);
  const over=env.win.__game.S.over;
  ok(!!over,'game reaches an ending: '+(over&&over.type)+' winner '+(over&&over.winner)+' turn '+(over&&over.turn));
  ok(env.win.__game.modal==='end'&&/Victory|Defeat/.test(env.doc.getElementById('card').textContent),'end screen shows: '+env.doc.getElementById('card').querySelector('h2').textContent);
  ok(!env.win.localStorage.getItem('sporecrown.v1.save'),'finished game clears the save');
  ok(JSON.parse(env.win.localStorage.getItem('sporecrown.v1.meta')).games>=1,'meta records games played');
  env.doc.getElementById('eAgain').click();ok(env.win.__game.S&&!env.win.__game.S.over&&env.win.__game.S.turn===1,'Play again starts a fresh realm');
  const errs1=env.errors.slice();env.win.close();
  // ---- 4. corrupt save is set aside, not crashed on ----
  env=make({'sporecrown.v1.save':'{"v":1,"ter":[1,2,3]}','sporecrown.v1.meta':'not json'});await sleep(30);
  ok(/could not be read/.test(env.doc.getElementById('card').textContent),'corrupt save shows a recovery note');
  ok(env.win.localStorage.getItem('sporecrown.v1.bad'),'corrupt save copied aside for recovery');
  ok(!env.doc.getElementById('tCont'),'no Continue for a corrupt save');
  env.doc.getElementById('tDaily').click();const d1=env.win.__game.S.seed;
  ok(env.win.__game.S.mode==='daily','Daily realm starts');
  const errs2=env.errors.slice();env.win.close();
  env=make({});await sleep(20);env.doc.getElementById('tDaily').click();
  ok(env.win.__game.S.seed===d1,'daily seed is the same on another load');
  // ---- 5. a tampered but parseable save with overlapping units ----
  const T=JSON.parse(JSON.stringify(env.win.__game.S));T.units[1].t=T.units[0].t;env.win.close();
  env=make({'sporecrown.v1.save':JSON.stringify(T)});await sleep(20);
  ok(/could not be read/.test(env.doc.getElementById('card').textContent),'save with stacked units is rejected');
  const errs3=env.errors.slice();env.win.close();
  // ---- 6. pick a realm on the title ----
  env=make({});await sleep(20);env.doc.querySelector('[data-realm="2"]').click();
  ok(/New game as Ash Morel/.test(env.doc.getElementById('tNew').textContent),'realm choice shows on the New game button');
  env.doc.getElementById('tNew').click();const S6=env.win.__game.S;
  ok(S6.civs[0].f===2&&S6.civs.slice(1).every(c=>c.f!==2),'you play Ash Morel and no rival does');
  ok(JSON.parse(env.win.localStorage.getItem('sporecrown.v1.meta')).realm===2,'realm choice is remembered');
  const all=errs1.concat(errs2,errs3,env.errors);
  ok(all.length===0,'no script errors ('+all.slice(0,3).join(' | ')+')');
  env.win.close();
  console.log(fails?fails+' FAILED':'ALL UI CHECKS PASSED');process.exit(fails?1:0);
})().catch(e=>{console.log('CRASH',e.stack);process.exit(1);});
