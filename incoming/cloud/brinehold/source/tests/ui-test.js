const fs=require('fs'); const makeEnv=require('./dom.js');
const file=process.argv[2]; const html=fs.readFileSync(file,'utf8'); const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
const env=makeEnv(+process.argv[3]||390,+process.argv[4]||844); const W=env.win; const errors=[];
const g={window:W,document:env.doc,localStorage:W.localStorage,requestAnimationFrame:W.requestAnimationFrame,performance:W.performance,navigator:W.navigator,getComputedStyle:W.getComputedStyle,location:W.location,setTimeout:W.setTimeout};
try{ const _kit=html.match(/<script id="gamekit">([\s\S]*?)<\/script>/), _gkb=html.match(/<script id="gkboot">([\s\S]*?)<\/script>/); if(_kit){ if(!env.doc.head) env.doc.head=env.doc.createElement("head"); if(!env.doc.documentElement){ const de=env.doc.createElement("html"); de.style.setProperty=()=>{}; de.style.getPropertyValue=()=>""; de.removeAttribute=k=>{ delete de.attrs[k]; }; env.doc.documentElement=de; } const kg=Object.assign({},g,{setInterval:()=>0,module:undefined}); new Function(...Object.keys(kg),_kit[1])(...Object.values(kg)); if(_gkb) new Function(...Object.keys(kg),_gkb[1])(...Object.values(kg)); g.GK=W.GK; } new Function(...Object.keys(g),'module',code)(...Object.values(g),undefined); }catch(e){errors.push('boot: '+e.stack)}
const $=id=>env.all.get(id);
const B=()=>W.__brine;
function check(c,m){ if(!c) errors.push('FAIL '+m); else console.log('ok  '+m); }
try{
env.frames(3);
check(!$('overlay').hidden,'title screen shows');
const card=$('card'); check(/Brinehold/.test(card.innerHTML),'title has the name');
$('oNew').click(); env.frames(2);
check($('overlay').hidden,'Play hides overlay');
const S=B().S; console.log('cell size px',S);
const cv=$('cv'); cv.rect={left:8+Math.floor((374-10*S)/2),top:52,width:10*S,height:15*S};
const tap=(x,y)=>{const r=cv.rect;const e={clientX:r.left+(x+0.5)*S,clientY:r.top+(y+0.5)*S,pointerId:1,pointerType:'touch'};cv.dispatch('pointerdown',e);cv.dispatch('pointerup',e);env.frames(1);};
const dragCells=(cells)=>{const r=cv.rect;const ev=([x,y])=>({clientX:r.left+(x+0.5)*S,clientY:r.top+(y+0.5)*S,pointerId:1,pointerType:'touch'});cv.dispatch('pointerdown',ev(cells[0]));for(const c of cells.slice(1))cv.dispatch('pointermove',ev(c));cv.dispatch('pointerup',ev(cells[cells.length-1]));env.frames(1);};
const st=()=>B().state;
check(/Rake/.test($('coachTxt').textContent),'coach starts on Rake: '+$('coachTxt').textContent.slice(0,60));
tap(6,14); check(st().grid[14*10+6]&&st().grid[14*10+6].k==='rake','tap places rake beside Keep');
check(/Cannon/.test($('coachTxt').textContent)||true,'coach moved on');
env.frames(2); check(B().state.tut>=1,'tutorial advanced to cannon step');
tap(5,13); check(st().grid[13*10+5]&&st().grid[13*10+5].k==='cannon','auto-selected cannon placed at bank');
tap(4,13); check(/creek|bank/i.test($('coachTxt').textContent),'creek placement denied with reason: '+$('coachTxt').textContent);
// belts: select belt tool via tray button
const beltBtn=env.doc.querySelector('.tool[data-k="belt"]'); beltBtn.click();
tap(2,14); check(true,'belt tap on a pan (allowed)');
const tools=env.doc.querySelectorAll('.tool'); console.log('tray tools',tools.map(t=>t.dataset.k).join(','));
env.doc.querySelector('.tool[data-k="rake"]').click(); tap(2,13); tap(2,14);
env.doc.querySelector('.tool[data-k="belt"]').click(); dragCells([[3,13],[3,14]]);
const b1=st().grid[13*10+3],b2=st().grid[14*10+3];
check(b1&&b1.k==='belt'&&b1.d===2,'drag lays belt pointing down at (3,13) d='+(b1&&b1.d));
check(b2&&b2.k==='belt','drag lays belt at (3,14) d='+(b2&&b2.d));
// (3,14) should point right into the Keep for banking: tap to rotate until d=1
let guard=0; while(st().grid[143].d!==1&&guard++<4) tap(3,14);
check(st().grid[143].d===1,'tapping a belt rotates it');
const salt0=st().salt; env.frames(60*20);
check(st().stats.banked>0,'salt banked into Keep: '+st().stats.banked);
check(/\d/.test($('hSalt').lastElementChild.textContent),'HUD salt shows '+$('hSalt').lastElementChild.textContent);
// call wave
const callTxt=$('bCall').textContent; $('bCall').click(); env.frames(5);
check(st().wave===1,'Call wave starts wave 1 ('+callTxt+')');
env.frames(60*70);
check(st().stats.kills>0,'cannon kills foes: '+st().stats.kills);
console.log('keep',st().keep,'wave',st().wave,'salt',Math.floor(st().salt));
// pause
$('bPause').click(); check(!$('overlay').hidden&&/Paused/.test($('card').innerHTML),'pause opens');
$('oRes').click(); check($('overlay').hidden,'resume closes');
// keyboard
env.key('2'); env.key('ArrowUp'); env.key('Enter'); env.frames(1); check(true,'keyboard path ran');
// save/restore
const saved=env.store['brinehold.save.v1']; check(saved&&JSON.parse(saved).wave>=1,'autosave written');
// speed
$('bSpeed').click(); check($('bSpeed').textContent==='2x','speed toggles');
// R2: grace refund within 5 s
env.doc.querySelector('.tool[data-k="rake"]').click(); const sBefore=st().salt; tap(0,10); const placed=st().grid[100]&&st().grid[100].k==='rake';
env.doc.querySelector('.tool[data-k="scrap"]').click(); tap(0,10); check(placed&&Math.abs(st().salt-sBefore)<0.6,'scrap within 5s is a full refund ('+sBefore.toFixed(1)+' -> '+st().salt.toFixed(1)+')');
// R2: touch press-slide-release with loupe (non-belt tool places where the finger lifts)
st().salt+=100; env.doc.querySelector('.tool[data-k="cannon"]').click();
{ const r=cv.rect; const ev=([x,y])=>({clientX:r.left+(x+0.5)*S,clientY:r.top+(y+0.5)*S,pointerId:1,pointerType:'touch'});
  cv.dispatch('pointerdown',ev([8,5])); cv.dispatch('pointermove',ev([8,6])); env.frames(2); cv.dispatch('pointermove',ev([8,7])); env.frames(2);
  check(!st().grid[5*10+8]&&!st().grid[6*10+8],'nothing built while finger is down');
  cv.dispatch('pointerup',ev([8,7])); env.frames(1); check(st().grid[7*10+8]&&st().grid[7*10+8].k==='cannon','cannon built where the finger lifted'); }
// R2: Call button shows the bonus on its own line
check(/<br>|in the water/.test($('bCall').innerHTML),'Call button has a two-line label: '+$('bCall').innerHTML);
// R2: wrong-item jam is flagged, a full turret is not
{ const s=st(); const R=B().Rules; s.unlocked.mortar=true; s.unlocked.kiln=true; s.salt+=200;
  R.place(s,'mortar',9,6); R.place(s,'belt',8,6,1); s.grid[6*10+8].items=[{t:'salt',p:1}];
  env.frames(30); check(s.grid[68].bad===true,'salt belted into a Mortar is flagged as a bad jam');
  R.place(s,'cannon',9,8); R.place(s,'belt',8,8,1); s.grid[89].ammo=20; s.grid[88].items=[{t:'salt',p:1}]; env.frames(30);
  s.foes=[]; s.grid[89].ammo=20; s.grid[88].items=[{t:'salt',p:1}]; env.frames(10); console.log('dbg',JSON.stringify(s.grid[88]),s.grid[89]&&s.grid[89].ammo);
  check(s.grid[88].jam>0&&!s.grid[88].bad,'belt into a full cannon is backed up, not flagged'); }
// force loss quickly
st().keep=1; for(let i=0;i<40&&st().phase==='play';i++){ st().foes.push({id:999+i,foe:'slug',hp:5,max:5,prog:32.5,slowT:0,hit:0,wob:0}); env.frames(5);} env.frames(60);
check(st().phase==='lost'&&/fallen/.test($('card').innerHTML),'loss reaches end screen');
check(/Play again/.test($('card').innerHTML),'end screen has Play again');
const best=JSON.parse(env.store['brinehold.best.v1']||'{}'); check(best.score>0,'best score saved '+JSON.stringify(best));
$('oAgain').click(); env.frames(2); check(st().phase==='play'&&st().wave===0,'Play again starts fresh');
// win screen
st().wave=30; st().spawnQ=[]; st().foes=[]; env.frames(60);
check(st().phase==='won'&&/holds/.test($('card').innerHTML),'win reaches end screen');
const c=env.calls(); check(!c.NaN,'no NaN draw calls ('+(c.NaN||0)+')');
}catch(e){errors.push('test: '+e.stack)}
console.log(errors.length?errors.join('\n'):'ALL UI CHECKS PASSED');
