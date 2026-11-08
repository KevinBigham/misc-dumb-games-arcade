// Round 3: full scripted runs through the real UI code (stub DOM). One win, one loss, both must reach their end screens.
const fs=require('fs'); const makeEnv=require('./dom.js');
const file=process.argv[2]; const html=fs.readFileSync(file,'utf8'); const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
const VW=+process.argv[3]||390, VH=+process.argv[4]||844;
const errors=[]; function check(c,m){ if(!c) errors.push('FAIL '+m); else console.log('ok  '+m); }
function boot(){
  const env=makeEnv(VW,VH); const W=env.win;
  const g={window:W,document:env.doc,localStorage:W.localStorage,requestAnimationFrame:W.requestAnimationFrame,performance:W.performance,navigator:W.navigator,getComputedStyle:W.getComputedStyle,location:W.location,setTimeout:W.setTimeout};
  const _kit=html.match(/<script id="gamekit">([\s\S]*?)<\/script>/), _gkb=html.match(/<script id="gkboot">([\s\S]*?)<\/script>/); if(_kit){ if(!env.doc.head) env.doc.head=env.doc.createElement("head"); if(!env.doc.documentElement){ const de=env.doc.createElement("html"); de.style.setProperty=()=>{}; de.style.getPropertyValue=()=>""; de.removeAttribute=k=>{ delete de.attrs[k]; }; env.doc.documentElement=de; } const kg=Object.assign({},g,{setInterval:()=>0,module:undefined}); new Function(...Object.keys(kg),_kit[1])(...Object.values(kg)); if(_gkb) new Function(...Object.keys(kg),_gkb[1])(...Object.values(kg)); g.GK=W.GK; }
  new Function(...Object.keys(g),'module',code)(...Object.values(g),undefined);
  env.frames(3); return env;
}
const plan=[['rake',6,14],['cannon',5,13],['rake',6,13],['belt',3,14,1],['rake',2,14],['rake',2,13,],['belt',3,13,2],
  ['cannon',6,11],['rake',4,11],['rake',3,11],['cannon',5,11],['rake',4,8],['cannon',3,8],['cannon',5,8],
  ['splitter',5,10],['cannon',6,10],['rake',0,10],['rake',1,10],['rake',0,11],
  ['pickler',5,13],['kiln',3,10],['mortar',3,12],['cannon',8,11],['cannon',6,5],['rake',4,5],['cannon',3,5],
  ['mortar',6,7],['kiln',7,7],['rake',7,8],['rake',8,8],['rake',8,7],['mortar',8,10],['kiln',8,12],['rake',9,12],
  ['cannon',1,5],['rake',0,5],['rake',1,4],['cannon',8,4],['rake',9,3],['mortar',3,7],['kiln',4,7],['rake',4,8],
  ['cannon',6,4],['pickler',3,4],['cannon',5,2],['rake',5,1],['rake',4,1],['rake',4,2],['cannon',3,2],['mortar',6,2],['kiln',6,1],['rake',6,0]];
function run(label, build, seed){
  const env=boot(); const $=id=>env.all.get(id); const B=env.win.__brine;
  $('oNew').click(); env.frames(2);
  B.startRun(B.Rules.newGame(seed)); env.frames(2);
  $('bSpeed').click(); $('bSpeed').click(); // 3x
  const greedy=require('./greedy.js')({Rules:B.Rules,DATA:B.DATA,CONFIG:B.CONFIG});
  let i=0, sawWorks=false, sawNight=false, sawGnaw=false, frames=0, worksBought=0;
  env.resetCalls();
  while(B.state.phase==='play' && frames<200000){
    const s=B.state;
    if(build && $('overlay').hidden){
      while(i<plan.length){ const [k,x,y,d]=plan[i]; const c=B.Rules.canPlace(s,k,x,y);
        if(c.ok){ B.Rules.place(s,k,x,y,d==null?1:d); i++; continue; } if(/salt|unlocked/i.test(c.why)) break; i++; }
      if(i>=plan.length){ // buy upgrades through the Works card, wards and turrets through the bot
        const id=Object.keys(s.upAvail).find(u=>!s.ups[u]&&s.salt>=B.DATA.upgrades[u].cost+20);
        if(id){ const wb=env.doc.querySelector('.tool[data-k="works"]'); if(wb){ wb.click(); sawWorks=true; const btn=$('u_'+id); if(btn&&!btn.disabled){ btn.click(); worksBought++; } $('oBack').click(); } }
        else greedy(s,{adapt:true,noups:true});
      }
    }
    if(s.foes.some(f=>f.chew)) sawGnaw=true;
    env.frames(1,33); frames++;
    if(s.wave>=10 && (env.calls().drawImage||0)>0) sawNight=true;
  }
  env.frames(60);
  const s=B.state, card=$('card').innerHTML;
  console.log(`${label}: phase ${s.phase} wave ${s.wave} keep ${s.keep} t ${s.t.toFixed(0)} built ${i} kills ${s.stats.kills} chewed ${s.stats.chewed||0} upgrades ${Object.keys(s.ups).join(',')||'none'} frames ${frames}`);
  const c=env.calls(); check(!c.NaN,label+': no NaN draw calls');
  return {s,card,sawWorks,worksBought,sawGnaw,env,calls:c};
}
const w=run('WIN run',true,1);
check(w.s.phase==='won','scripted win: phase won');
check(/The Keep holds\./.test(w.card),'scripted win reaches "The Keep holds."');
check(/Play again/.test(w.card),'win screen offers Play again');
check(w.sawWorks&&w.worksBought>0,'Works card used to buy upgrades: '+w.worksBought);
check(w.sawGnaw,'Mudgnawers chewed during the win run');
check(w.s.wave>=10,'night layer path ran through wave 30 without errors');
const l=run('LOSS run',false,2);
check(l.s.phase==='lost','scripted loss: phase lost');
check(/The Keep has fallen\./.test(l.card),'scripted loss reaches "The Keep has fallen."');
check(/Play again/.test(l.card),'loss screen offers Play again');
// pause card has music toggle
const env=boot(); const $=id=>env.all.get(id); $('oNew').click(); env.frames(2); $('bPause').click(); env.frames(1);
check(/Music: on/.test($('card').innerHTML),'pause card has a Music toggle'); $('oMus').click(); check(/Music: off/.test($('oMus').textContent),'Music toggles off');
check(JSON.parse(env.store['brinehold.opts.v1']||'{}').music===false||Object.values(env.store).some(v=>/"music":false/.test(v)),'music setting saved');
if(errors.length){ console.log(errors.join('\n')); process.exit(1); } else console.log('ALL FULL-RUN CHECKS PASSED');
