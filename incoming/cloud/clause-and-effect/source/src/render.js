const fs=require('fs'),path=require('path');const {JSDOM,VirtualConsole}=require('jsdom');const {createCanvas}=require('@napi-rs/canvas');
const css=fs.readFileSync('style.css','utf8');
function tokens(dark){const blk=dark?css.match(/:root\[data-theme="dark"\] \{([^}]*)\}/)[1]:css.match(/:root \{([^}]*)\}/)[1];const o={};blk.replace(/--([\w-]+):\s*([^;]+);/g,(m,k,v)=>{o[k]=v.trim().split(/\s*\/\*/)[0]});return o;}
(async()=>{
 const dark=process.argv[2]==='dark';
 const html=fs.readFileSync('dist/clause-and-effect.html','utf8');
 const vc=new VirtualConsole(); vc.on('error',e=>console.log('ERR',e));
 const dom=new JSDOM(`<!doctype html><html><body>${html}</body></html>`,{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
   Object.defineProperty(w,'innerWidth',{value:390});Object.defineProperty(w,'innerHeight',{value:844});
   w.matchMedia=q=>({matches:false,addEventListener(){}});
   w.HTMLCanvasElement.prototype.getContext=function(){const c=createCanvas(this.width||300,this.height||150);this._napi=c;return c.getContext('2d');};
 }});
 await new Promise(r=>setTimeout(r,30));
 const w=dom.window;w.eval('CONFIG.TICK_MS=12');
 const T=tokens(dark); w.__T=T;
 const shots=[];
 async function shot(label,setup,ticks=0){
   w.eval(setup);
   const cv=w.document.querySelector('#board');
   // the board wrap has no layout in jsdom: force a phone-sized cell
   w.eval(`Render.cell=Math.floor(Math.min(CONFIG.CELL_MAX,(390-48)/Render.w, 844*0.4/Render.h)); Render.cv.width=Render.cell*Render.w*2; Render.cv.height=Render.cell*Render.h*2; Render.dpr=2; Render.g=Render.cv.getContext('2d'); Object.assign(Render.colors, Object.fromEntries(Object.entries(window.__T)));`);
   for(let i=0;i<ticks;i++){w.eval('ensureSim(); advance(); Render.anim=null;');}
   w.eval('Render.frame(performance.now())');
   shots.push({label,img:cv._napi});
 }
 const lv=n=>`openLevel(${n});`;
 await shot('1 Facing Facts',lv(0));
 await shot('3 Stairwell, tick 5',lv(2)+`State.ledger=applySol(LEVELS[2],LEVELS[2].sol);`,5);
 await shot('5 Bolted Down',lv(4));
 await shot('6 Anyone May Enter',lv(5));
 await shot('9 Night Shift, tick 2',lv(8)+`State.ledger=applySol(LEVELS[8],LEVELS[8].sol);`,2);
 await shot('11 Ink Marsh',lv(10));
 await shot('12 Fine Print (wall wins)',lv(11)+`State.ledger.clauses.winOn='wall';`);
 await shot('13 Long Stride (stride 2)',lv(12)+`State.ledger.clauses.stride='2';`);
 await shot('14 The Pen, tick 3',lv(13)+`State.ledger=applySol(LEVELS[13],LEVELS[13].sol);`,3);
 await shot('15 Audit (soft walls, nap)',lv(14)+`State.ledger.clauses.walls='soft';State.ledger.clauses.guards='asleep';`);
 // compose
 const W=420,pad=10; let H=0; const rows=shots.map(s=>{const h=s.img.height/2+28;H+=h;return h});
 const out=createCanvas(W*2,(H+pad)*1); const g=out.getContext('2d'); g.fillStyle=T.paper; g.fillRect(0,0,W*2,H+pad);
 let y=pad; g.font='16px sans-serif';
 shots.forEach((s,i)=>{const col=i%2, x=col*W+10; if(col===0&&i>0) y+=Math.max(rows[i-2]||0,rows[i-1]||0); g.fillStyle=T.ink; g.fillText(s.label,x,y+16); g.drawImage(s.img,x,y+22,s.img.width/2,s.img.height/2);});
 fs.writeFileSync(dark?'shots-dark.png':'shots.png',out.toBuffer('image/png'));console.log('saved');
 w.close();
})();
