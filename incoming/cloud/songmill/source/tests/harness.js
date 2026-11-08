// Headless harness: stub DOM at 390x844, load game, run bot.
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(process.argv[2],'utf8');
const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
const errors=[]; let drawCalls=0;
function ctxStub(){ return new Proxy({}, {get(t,k){ if(k in t) return t[k]; if(k==='measureText') return ()=>({width:10}); if(k==='createRadialGradient'||k==='createLinearGradient') return ()=>({addColorStop(){}}); if(k==='getImageData') return ()=>({data:[]}); return function(){drawCalls++;}; }, set(t,k,v){t[k]=v;return true;}}); }
const els={};
function el(id){ if(els[id]) return els[id]; const e={id, style:{}, dataset:{}, hidden:false, children:[], innerHTML:'', textContent:'', width:300,height:150, isConnected:true,
  classList:{_s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)}, toggle(c,v){ if(v===undefined) v=!this._s.has(c); v?this._s.add(c):this._s.delete(c)}, contains(c){return this._s.has(c)}},
  listeners:{}, addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f)}, appendChild(c){this.children.push(c); return c}, setPointerCapture(){},
  getContext(){ return this._ctx||(this._ctx=ctxStub()) },
  getBoundingClientRect(){ if(id==='stage') return {left:16,top:90,width:358,height:844-90-34-66}; if(id==='board') return {left:16,top:90,width:358,height:500}; return {left:0,top:0,width:100,height:30}; } };
  Object.defineProperty(e,'onclick',{set(f){e._click=f},get(){return e._click}}); els[id]=e; return e; }
let anon=0;
const document={ getElementById:el, createElement:(t)=>el('_'+t+(anon++)), createTextNode:t=>({t}), querySelectorAll:()=>[], querySelector:()=>null, addEventListener(){}, hidden:false };
const store={};
const localStorage={getItem:k=>k in store?store[k]:null, setItem:(k,v)=>{store[k]=String(v)}, removeItem:k=>{delete store[k]}};
const rafQ=[];
const window={ innerWidth:390, innerHeight:844, devicePixelRatio:3, addEventListener(){}, visualViewport:null };
const sandbox={window,document,localStorage,console,performance:{now:()=>0},requestAnimationFrame:f=>rafQ.push(f),setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Math,JSON,Object,Array,Set,Map,String,Number,Infinity};
window.window=window; vm.createContext(sandbox);
// GameKit pages: load the kit and its boot line first (in a no-DOM context, so the kit runs headless) and expose GK to the game.
// A page without the kit is unchanged.
{ const kitCtx=vm.createContext({console,Math,JSON,Object,Array,Date,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage});
  for(const m of html.matchAll(/<script id="(gamekit|gkboot)">([\s\S]*?)<\/script>/g)){ try{ if(m[1]==='gkboot') kitCtx.window=kitCtx; vm.runInContext(m[2],kitCtx); }catch(e){ console.log('KIT LOAD ERROR',m[1],e.stack); process.exit(1); } }
  if(kitCtx.GK){ sandbox.GK=kitCtx.GK; window.GK=kitCtx.GK; } }
try{ vm.runInContext(code,sandbox); }catch(e){ console.log('LOAD ERROR',e.stack); process.exit(1); }
const G=window.__songmill;
module.exports={G,rafQ,els,store,errors,getDraws:()=>drawCalls,sandbox};
