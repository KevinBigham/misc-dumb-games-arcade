// Headless harness: jsdom DOM + real Canvas2D (@napi-rs/canvas). Usage: require('./harness')({w,h,store})
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom'); const {createCanvas}=require('@napi-rs/canvas');
module.exports=function(opt={}){
  const W=opt.w||375,H=opt.h||667, HUD=opt.hud||104;
  const html=fs.readFileSync(path.join(__dirname,'..','sunwire.html'),'utf8');
  const errors=[];
  const dom=new JSDOM(html.replace(/<script>[\s\S]*<\/script>/,''),{runScripts:'outside-only',pretendToBeVisual:false,url:'https://example.test/'});
  const win=dom.window, doc=win.document;
  const store=opt.store||{};
  Object.defineProperty(win,'localStorage',{value:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}});
  win.innerWidth=W; win.innerHeight=H; win.devicePixelRatio=opt.dpr||2;
  const canv=new Map();
  win.HTMLCanvasElement.prototype.getContext=function(){ if(!canv.has(this)){const c=createCanvas(Math.max(1,this.width),Math.max(1,this.height));canv.set(this,c);} let c=canv.get(this); const x=c.getContext('2d'); if(!x.__p){const di=x.drawImage.bind(x); x.drawImage=function(img,...a){ if(canv.has(img)) img=canv.get(img); return di(img,...a); }; x.__p=1;} return x; };
  win.CanvasRenderingContext2D=function(){};
  for(const prop of ['width','height']){ const d=Object.getOwnPropertyDescriptor(win.HTMLCanvasElement.prototype,prop);
    Object.defineProperty(win.HTMLCanvasElement.prototype,prop,{get(){return d.get.call(this);},set(v){d.set.call(this,v); const c=canv.get(this); if(c){ c[prop]=Math.max(1,v|0);} }}); }
  const rects={stage:{left:0,top:HUD,width:W,height:H-HUD},cv:{left:0,top:HUD,width:W,height:H-HUD}};
  win.HTMLElement.prototype.getBoundingClientRect=function(){const r=rects[this.id]||{left:0,top:0,width:100,height:30};return Object.assign({right:r.left+r.width,bottom:r.top+r.height,x:r.left,y:r.top},r);};
  win.HTMLElement.prototype.setPointerCapture=function(){};
  const rafQ=[]; win.requestAnimationFrame=f=>{rafQ.push(f);return rafQ.length;};
  const timers=[]; const realST=win.setTimeout; win.setTimeout=(f,ms)=>{timers.push({f,at:(win.__now||0)+(ms||0)});return timers.length;};
  const ivs=[]; win.setInterval=(f)=>{ivs.push(f);return ivs.length;}; win.clearInterval=()=>{}; win.__ivs=ivs;
  // Fake AudioContext that records tones
  const tones=[]; let acState='running';
  class AC{constructor(){this.currentTime=0;this.state='running';this.destination={};AC.inst=this;}
    createGain(){return{gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
    createOscillator(){const o={type:'',frequency:{setValueAtTime(f){o.f=f},exponentialRampToValueAtTime(){}},connect(){},start(){tones.push({f:o.f,state:AC.inst.state,hidden:doc.hidden})},stop(){}};return o;}
    suspend(){this.state='suspended';return Promise.resolve();} resume(){this.state='running';return Promise.resolve();}}
  win.AudioContext=AC;
  win.onerror=(m)=>errors.push(String(m));
  const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
  for(const m of html.matchAll(/<script id="(gamekit|gkboot)">([\s\S]*?)<\/script>/g)){ try{ win.eval(m[2]); }catch(e){ errors.push("KIT "+e.stack); } }
  try{ win.eval(code); }catch(e){ errors.push('LOAD '+e.stack); }
  const G=win.__sunwire;
  let now=0;
  function frames(n,ms=16.7){for(let i=0;i<n;i++){now+=ms;win.__now=now;const q=rafQ.splice(0);for(const f of q){try{f(now);}catch(e){errors.push('FRAME '+e.stack);}}
    for(let j=timers.length-1;j>=0;j--) if(timers[j].at<=now){const t=timers.splice(j,1)[0];try{t.f();}catch(e){errors.push('TIMER '+e.stack);}}}}
  const cv=doc.getElementById('cv');
  function ptr(type,x,y){const e=new win.Event(type,{bubbles:true,cancelable:true});e.clientX=x;e.clientY=y+HUD;e.pointerId=1;cv.dispatchEvent(e);}
  function key(k){const e=new win.KeyboardEvent('keydown',{key:k,bubbles:true});doc.dispatchEvent(e);}
  function sitePx(id){const R=G.Renderer,s=G.st.sites[id];return{x:R.X(s.x),y:R.Y(s.y)};}
  function dragSites(a,b,steps=6){const p=sitePx(a),q=sitePx(b);ptr('pointerdown',p.x,p.y);for(let i=1;i<=steps;i++)ptr('pointermove',p.x+(q.x-p.x)*i/steps,p.y+(q.y-p.y)*i/steps);ptr('pointerup',q.x,q.y);}
  function tap(x,y){ptr('pointerdown',x,y);ptr('pointerup',x,y);}
  function click(sel){const b=doc.querySelector(sel);if(!b)throw new Error('no '+sel);b.click();return b;}
  function png(file){const c=canv.get(cv);fs.writeFileSync(file,c.toBuffer('image/png'));}
  function setHidden(v){Object.defineProperty(doc,'hidden',{value:v,configurable:true});doc.dispatchEvent(new win.Event('visibilitychange'));}
  return {G,win,doc,errors,store,frames,ptr,key,dragSites,tap,click,png,sitePx,tones,AC,setHidden,cv};
};
