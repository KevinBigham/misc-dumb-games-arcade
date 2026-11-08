const fs=require('fs'), vm=require('vm'); const {makeCtx}=require('./svgctx.js');
const html=fs.readFileSync(process.argv[2],'utf8'); const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
const els={}; let anon=0;
function el(id){ if(els[id]) return els[id]; const e={id,style:{},dataset:{},hidden:false,children:[],innerHTML:'',textContent:'',width:300,height:150,isConnected:true,
 classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},toggle(c,v){if(v===undefined)v=!this._s.has(c);v?this._s.add(c):this._s.delete(c)},contains(c){return this._s.has(c)}},
 addEventListener(){},appendChild(c){this.children.push(c);return c},setPointerCapture(){},
 getContext(){ if(!this._ctx){ this._ctx=makeCtx(this.width,this.height); } return this._ctx; }, _svg(){ return this._ctx?this._ctx._svg():[]; },
 getBoundingClientRect(){ if(id==='stage') return {left:16,top:90,width:358,height:+process.env.STAGEH||577}; if(id==='board') return {left:16,top:90,width:350,height:490}; return {left:0,top:0,width:100,height:30}; } };
 els[id]=e; return e; }
const document={getElementById:el,createElement:t=>el('_'+t+(anon++)),createTextNode:t=>({t}),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
const store={}; const localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
const rafQ=[]; const window={innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener(){}};
const sb={window,document,localStorage,console,performance:{now:()=>0},requestAnimationFrame:f=>rafQ.push(f),setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},Math,JSON,Object,Array,Set,Map,String,Number};
window.window=window; vm.createContext(sb);
// GameKit pages: load the kit and its boot line first (in a no-DOM context, so the kit runs headless) and expose GK to the game.
{ const kitCtx=vm.createContext({console,Math,JSON,Object,Array,Date,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage});
  for(const m of html.matchAll(/<script id="(gamekit|gkboot)">([\s\S]*?)<\/script>/g)){ if(m[1]==='gkboot') kitCtx.window=kitCtx; vm.runInContext(m[2],kitCtx); }
  if(kitCtx.GK){ sb.GK=kitCtx.GK; window.GK=kitCtx.GK; } }
vm.runInContext(code,sb);
module.exports={G:window.__songmill,els,rafQ};
