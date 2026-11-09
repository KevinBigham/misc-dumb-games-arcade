// Renders the real map canvas to PNG with @napi-rs/canvas inside jsdom, at phone size.
// Usage: NODE_PATH=<dir with jsdom and @napi-rs/canvas> node tests/render.js <outdir> [turns]
const fs=require('fs');const path=require('path');const {JSDOM}=require('jsdom');const NC=require('@napi-rs/canvas');
const html=fs.readFileSync(path.join(__dirname,'..','sporecrown.html'),'utf8');
const out=process.argv[2]||'.';const turns=+process.argv[3]||14;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://sporecrown.test/',beforeParse(win){
  Object.defineProperty(win,'innerWidth',{value:375,configurable:true});Object.defineProperty(win,'innerHeight',{value:667,configurable:true});
  Object.defineProperty(win,'devicePixelRatio',{value:2,configurable:true});
  const P=win.HTMLCanvasElement.prototype;
  const back=el=>{if(!el.__nc){el.__nc=NC.createCanvas(Math.max(1,el.__w||300),Math.max(1,el.__h||150));}return el.__nc;};
  for(const k of ['width','height'])Object.defineProperty(P,k,{get(){return this['__'+k[0]]||(k==='width'?300:150);},set(v){this['__'+k[0]]=v|0;if(this.__nc){this.__nc[k]=Math.max(1,v|0);}}});
  P.getContext=function(){const ctx=back(this).getContext('2d');if(this.__px)return this.__px;
    this.__px=new Proxy(ctx,{get(t,k){const v=t[k];if(k==='drawImage')return (img,...a)=>t.drawImage(img&&img.__nc?img.__nc:img,...a);if(k==='canvas')return this;return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});return this.__px;};
  Object.defineProperty(win.HTMLElement.prototype,'clientWidth',{get(){return this.id==='mapwrap'?375:0;},configurable:true});
  Object.defineProperty(win.HTMLElement.prototype,'clientHeight',{get(){return this.id==='mapwrap'?400:0;},configurable:true});
  P.getBoundingClientRect=function(){return {left:0,top:0,width:this.__w/2,height:this.__h/2,right:this.__w/2,bottom:this.__h/2,x:0,y:0};};
}});
(async()=>{const win=dom.window,doc=win.document;await sleep(50);
  doc.getElementById('tNew').click();await sleep(50);const G=win.__game,SC=win.__SC;
  // advance a realistic game: the human seat is played by the balanced AI for a while
  let S=SC.clone(G.S);S.allAI=false;
  for(let i=0;i<turns&&!S.over;i++){const ev=[];for(const c of S.civs)SC.aiPlay(S,c.id,ev);SC.endRound(S,ev);}
  if(process.argv[4]==='all')S.seen=S.seen.map(()=>1);if(process.argv[4]==='vis')S.allAI=true;
  G.S=S;win.dispatchEvent(new win.Event('resize'));await sleep(250);
  const cv=doc.getElementById('map');fs.writeFileSync(path.join(out,'map_t'+S.turn+(process.argv[4]||'')+'.png'),cv.__nc.toBuffer('image/png'));
  console.log('wrote',path.join(out,'map_t'+S.turn+(process.argv[4]||'')+'.png'),cv.__w+'x'+cv.__h,'over',JSON.stringify(S.over));
  process.exit(0);})().catch(e=>{console.log('CRASH',e.stack);process.exit(1);});
