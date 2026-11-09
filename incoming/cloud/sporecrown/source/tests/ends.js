// Drives the real UI into each of the 7 ending screens (3 wins, 4 losses) from scripted states.
const fs=require('fs');const path=require('path');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','sporecrown.html'),'utf8');
let fails=0;const ok=(c,m)=>{if(c)console.log('ok   '+m);else{fails++;console.log('FAIL '+m);}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function make(){const errors=[];const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://sporecrown.test/',
  beforeParse(win){win.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});};win.addEventListener('error',e=>errors.push(e.message));}});
  return {win:dom.window,doc:dom.window.document,errors};}
function tap(env,t){const [x,y]=env.win.__game.cxy(t);const cv=env.doc.getElementById('map');for(const type of ['pointerdown','pointerup']){const e=new env.win.MouseEvent(type,{clientX:x,clientY:y,bubbles:true});cv.dispatchEvent(e);}}
async function scenario(name,setup,drive,expect){
  const env=make();await sleep(20);env.doc.getElementById('tNew').click();
  const G=env.win.__game;const SC=env.win.__SC;const S=SC.clone(G.S);
  for(const c of S.cols)if(c.civ===0&&!c.build)c.build='hoard';
  S.civs[0].pick=S.civs[0].pick||'deeproots';
  setup(S,SC);G.S=S;await drive(env,SC);await sleep(1200);
  const h=env.doc.querySelector('#card h2');const txt=h?h.textContent:'(no end screen)';
  ok(env.win.__game.modal==='end'&&expect.test(txt),name+' -> '+txt);
  ok(env.errors.length===0,name+' no script errors '+env.errors.slice(0,2).join('|'));
  env.win.close();
}
async function endT(env,n){for(let i=0;i<n;i++){if(env.win.__game.S.over)return;for(const c of env.win.__game.S.cols)if(c.civ===0&&!c.build){c.build='hoard';}if(env.win.__game.modal==='tech')env.doc.querySelector('[data-tech]').click();env.doc.getElementById('endBtn').click();await sleep(700);if(env.win.__game.modal==='tech')env.doc.querySelector('[data-tech]').click();}}
function rivalCap(S,k){return S.cols.find(c=>c.cap&&c.civ===k);}
function clearAround(S,SC,t){S.units=S.units.filter(u=>SC.dist(u.t,t)>1||S.cols.some(c=>c.t===u.t&&c.civ===0&&false));}
(async()=>{
  await scenario('win by Bloom',(S,SC)=>{const c=S.cols.find(c=>c.civ===0);S.civs[0].techs=['deeproots','glow','mesh','sporefall'];c.build='bloom';c.prod=SC.PROJ.bloom.cost-0.5;c.hitT=-1;},
    async env=>{env.doc.getElementById('endBtn').click();},/Victory: The Great Bloom/);
  await scenario('lose to a rival Bloom',(S,SC)=>{const c=rivalCap(S,1);S.civs[1].techs=['deeproots','glow','mesh','sporefall'];S.civs[1].human=false;c.build='bloom';c.prod=SC.PROJ.bloom.cost-0.5;c.hitT=-1;
      for(const k of [1,2,3])S.civs[k].pers='bloom';},
    async env=>{env.doc.getElementById('endBtn').click();},/Defeat: A rival bloomed first/);
  await scenario('win by Heartcaps',(S,SC)=>{
      S.turn=12;const a=rivalCap(S,1),b=rivalCap(S,2);
      clearAround(S,SC,b.t);const nb=SC.NB[b.t].find(n=>S.ter[n]!=='X'&&!SC.colAt(S,n));S.ter[nb]='L';
      const u={id:S.nid++,civ:0,k:'thorn',t:nb,hp:10,mv:1,did:0,att:0,fort:0,sleep:0,goal:-1};S.units.push(u);b.hp=1;S.__u=u.id;S.__t=b.t;},
    async (env)=>{const S=env.win.__game.S;const u=S.units.find(x=>x.k==='thorn'&&x.civ===0);tap(env,u.t);tap(env,S.__t);tap(env,S.__t);await endT(env,2);},/Victory: The Heartcaps are yours/);
  await scenario('lose by rival Heartcaps',(S,SC)=>{
      S.turn=12;const a=rivalCap(S,2),mine=S.cols.find(c=>c.civ===0);a.civ=1;S.own[a.t]=1;
      // give the human a second colony so this is a conquest, not an elimination
      const far=[...Array(SC.N).keys()].find(t=>S.ter[t]!=='X'&&!SC.colAt(S,t)&&!SC.unitAt(S,t)&&S.cols.every(c=>SC.dist(c.t,t)>=3));
      S.cols.push({id:S.nid++,civ:0,oc:0,name:'Tawnyridge',t:far,pop:1,food:0,prod:0,build:'hoard',focus:'bal',b:{},hp:16,home:false,cap:false,r2:false,born:2});S.own[far]=0;
      clearAround(S,SC,mine.t);const nb=SC.NB[mine.t].find(n=>S.ter[n]!=='X'&&!SC.colAt(S,n));S.ter[nb]='L';
      S.units.push({id:S.nid++,civ:1,k:'thorn',t:nb,hp:10,mv:1,did:0,att:0,fort:0,sleep:0,goal:-1});mine.hp=1;S.civs[1].pers='war';},
    async env=>{await endT(env,2);},/Defeat: The Heartcaps fell/);
  await scenario('lose by elimination',(S,SC)=>{
      S.turn=12;const mine=S.cols.find(c=>c.civ===0);
      clearAround(S,SC,mine.t);const nb=SC.NB[mine.t].find(n=>S.ter[n]!=='X'&&!SC.colAt(S,n));S.ter[nb]='L';
      S.units=S.units.filter(u=>u.civ!==0);
      S.units.push({id:S.nid++,civ:2,k:'thorn',t:nb,hp:10,mv:1,did:0,att:0,fort:0,sleep:0,goal:-1});mine.hp=1;S.civs[2].pers='war';},
    async env=>{env.doc.getElementById('endBtn').click();},/Defeat: Your mycelium went quiet/);
  await scenario('win by Renown',(S)=>{S.turn=40;const c=S.cols.find(c=>c.civ===0);c.pop=30;},
    async env=>{env.doc.getElementById('endBtn').click();},/Victory: Crowned by Renown/);
  await scenario('lose on Renown',(S)=>{S.turn=40;rivalCap(S,3).pop=30;},
    async env=>{env.doc.getElementById('endBtn').click();},/Defeat: Outshone/);
  console.log(fails?fails+' FAILED':'ALL 7 ENDINGS REACHED');process.exit(fails?1:0);
})().catch(e=>{console.log('CRASH',e.stack);process.exit(1);});
