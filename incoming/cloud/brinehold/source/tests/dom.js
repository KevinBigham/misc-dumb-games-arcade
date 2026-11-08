// Minimal headless DOM + canvas stub, enough to boot Brinehold's real UI code in Node.
// Viewport model: phone 390x844. Not a real browser: no layout engine, no pixels.
module.exports=function makeEnv(VW=390,VH=844){
  const handlers=new Map(); const all=new Map(); let calls={};
  class CL{constructor(){this.s=new Set()} add(c){this.s.add(c)} remove(c){this.s.delete(c)} toggle(c,v){v===undefined?(this.s.has(c)?this.s.delete(c):this.s.add(c)):(v?this.s.add(c):this.s.delete(c))} contains(c){return this.s.has(c)}}
  function ctx2d(){ return new Proxy({},{get(t,k){ if(k in t) return t[k]; if(k==='createLinearGradient'||k==='createRadialGradient') return ()=>({addColorStop(){}}); if(k==='measureText') return ()=>({width:10});
      return (...a)=>{calls[k]=(calls[k]||0)+1; for(const v of a) if(typeof v==='number'&&!isFinite(v)) {calls.NaN=(calls.NaN||0)+1;} }; }, set(t,k,v){t[k]=v;return true;}}); }
  class El{
    constructor(tag,id){this.tagName=tag.toUpperCase();this.id=id||'';this.children=[];this.style={};this.classList=new CL();this.dataset={};this._text='';this.hidden=false;this.attrs={};this.parent=null;this.ev={};this.rect=null;this.disabled=false;
      if(tag==='canvas'){this.width=300;this.height=150;this._ctx=ctx2d();} if(id) all.set(id,this);}
    getContext(){return this._ctx}
    set className(v){this.classList=new CL();v.split(/\s+/).filter(Boolean).forEach(c=>this.classList.add(c))} get className(){return [...this.classList.s].join(' ')}
    set textContent(v){this._text=String(v);this.children=[]} get textContent(){return this._text+this.children.map(c=>c.textContent).join('')}
    set innerHTML(h){this.children=[];this._html=h;this._text='';
      // create child elements for every id="..." so getElementById and onclick work
      const re=/<(\w+)([^>]*)>/g; let m; while((m=re.exec(h))){const id=(m[2].match(/id="([^"]+)"/)||[])[1]; const el=new El(m[1],id); el._open=m[0]; const cls=(m[2].match(/class="([^"]+)"/)||[])[1]; if(cls) el.className=cls; this.appendChild(el);
        const after=h.slice(re.lastIndex); const t=after.match(/^([^<]*)/); el._text=t?t[1]:''; }}
    get innerHTML(){return this._html||''}
    appendChild(c){c.parent=this;this.children.push(c);if(c.id)all.set(c.id,c);return c}
    get lastElementChild(){return this.children[this.children.length-1]}
    setAttribute(k,v){this.attrs[k]=v} getAttribute(k){return this.attrs[k]}
    addEventListener(t,f){(this.ev[t]=this.ev[t]||[]).push(f)}
    dispatch(t,e={}){e.type=t;e.preventDefault=e.preventDefault||(()=>{});(this.ev[t]||[]).forEach(f=>f(e)); if(t==='click'&&this.onclick)this.onclick(e)}
    click(){ if(!this.disabled) this.dispatch('click',{}) }
    focus(){} scrollIntoView(){} setPointerCapture(){}
    querySelectorAll(sel){const out=[];const walk=n=>{for(const c of n.children){if(match(c,sel))out.push(c);walk(c)}};walk(this);return out}
    querySelector(sel){return this.querySelectorAll(sel)[0]||null}
    getBoundingClientRect(){return this.rect||{left:0,top:0,width:VW,height:VH,right:VW,bottom:VH}}
  }
  function match(el,sel){ let m;
    if((m=sel.match(/^\.(\w+)\[data-k="(\w+)"\]$/))) return el.classList.contains(m[1])&&el.dataset.k===m[2];
    if((m=sel.match(/^\.(\w+)$/))) return el.classList.contains(m[1]);
    return el.tagName===sel.toUpperCase(); }
  const body=new El('body');
  // Build the static DOM from the page markup
  const ids=['app','hud','hSalt','hKeep','hWave','hNext','stage','cv','coach','coachTxt','tray','actions','bPause','bSpeed','bCall','overlay','card'];
  for(const id of ids){const tag=id==='cv'?'canvas':(id[0]==='b'?'button':'div');const e=new El(tag,id);body.appendChild(e);}
  for(const h of ['hSalt','hKeep','hWave','hNext']){all.get(h).appendChild(new El('b'));all.get(h).appendChild(new El('span'));}
  all.get('overlay').hidden=true;
  // layout model for a 390x844 phone: hud 52, coach 42, tray 70, actions 58, side padding 8
  const stageH=VH-46-54-70, stageW=VW-16;
  all.get('stage').rect={left:8,top:52,width:stageW,height:stageH};
  const doc={getElementById:id=>all.get(id)||null,createElement:t=>new El(t),querySelectorAll:s=>body.querySelectorAll(s),querySelector:s=>body.querySelector(s),body,hidden:false,addEventListener(t,f){(handlers.get('doc'+t)||handlers.set('doc'+t,[]).get('doc'+t)).push(f)}};
  const winH={};
  let rafQ=[]; let now=0;
  const store={};
  const win={document:doc,location:{search:'',hash:''},devicePixelRatio:3,addEventListener(t,f){(winH[t]=winH[t]||[]).push(f)},
    localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
    requestAnimationFrame:f=>{rafQ.push(f)}, AudioContext:undefined, navigator:{}, getComputedStyle:()=>({getPropertyValue:()=>'sans-serif'}),
    performance:{now:()=>now}, setTimeout:(f,ms)=>{timers.push({f,at:now+ms})}};
  const timers=[];
  function frames(n,ms=16.67){for(let i=0;i<n;i++){now+=ms;const q=rafQ;rafQ=[];q.forEach(f=>f(now));for(const t of timers.slice()) if(t.at<=now){timers.splice(timers.indexOf(t),1);t.f();}}}
  function key(k,extra={}){(winH.keydown||[]).forEach(f=>f(Object.assign({key:k,preventDefault(){}},extra)))}
  return {win,doc,all,frames,key,store,calls:()=>calls,resetCalls(){calls={}},get now(){return now}};
};
