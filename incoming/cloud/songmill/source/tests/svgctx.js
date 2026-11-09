// Minimal Canvas2D -> SVG recorder (flattens arcs; enough to eyeball the game's drawing).
function mul(m,n){return [m[0]*n[0]+m[2]*n[1], m[1]*n[0]+m[3]*n[1], m[0]*n[2]+m[2]*n[3], m[1]*n[2]+m[3]*n[3], m[0]*n[4]+m[2]*n[5]+m[4], m[1]*n[4]+m[3]*n[5]+m[5]];}
function makeCtx(W,H){
  const out=[]; let m=[1,0,0,1,0,0]; const stack=[]; let path=[]; let cur=null;
  const st={fillStyle:'#000',strokeStyle:'#000',lineWidth:1,globalAlpha:1,font:'10px sans-serif',textAlign:'start',textBaseline:'alphabetic',lineCap:'butt',lineJoin:'miter'};
  const P=(x,y)=>[m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]];
  const sc=()=>Math.sqrt(Math.abs(m[0]*m[3]-m[1]*m[2]));
  const col=c=>typeof c==='string'?c:(c&&c._c)||'#000';
  const ctx={
    canvas:{width:W,height:H},
    save(){stack.push([m.slice(),Object.assign({},st)]);}, restore(){const s=stack.pop(); if(s){m=s[0]; Object.assign(st,s[1]);}},
    setTransform(a,b,c,d,e,f){m=[a,b,c,d,e,f];}, translate(x,y){m=mul(m,[1,0,0,1,x,y]);}, scale(x,y){m=mul(m,[x,0,0,y,0,0]);},
    rotate(a){const c=Math.cos(a),s=Math.sin(a); m=mul(m,[c,s,-s,c,0,0]);},
    beginPath(){path=[];cur=null;}, moveTo(x,y){const p=P(x,y); path.push('M'+p[0].toFixed(2)+' '+p[1].toFixed(2)); cur=[x,y];},
    lineTo(x,y){const p=P(x,y); path.push((cur?'L':'M')+p[0].toFixed(2)+' '+p[1].toFixed(2)); cur=[x,y];},
    closePath(){path.push('Z');},
    arc(x,y,r,a0,a1,ccw){ let da=a1-a0; if(!ccw){ while(da<0) da+=2*Math.PI; if(a1-a0>=2*Math.PI) da=2*Math.PI; } else { while(da>0) da-=2*Math.PI; if(a0-a1>=2*Math.PI) da=-2*Math.PI; }
      const n=Math.max(8,Math.ceil(Math.abs(da)*12)); for(let i=0;i<=n;i++){const a=a0+da*i/n; const px=x+Math.cos(a)*r, py=y+Math.sin(a)*r; if(i===0 && !cur) ctx.moveTo(px,py); else ctx.lineTo(px,py);} },
    arcTo(x1,y1,x2,y2,r){ // approximate rounded corner
      const [x0,y0]=cur||[x1,y1]; const v1=[x0-x1,y0-y1], v2=[x2-x1,y2-y1]; const l1=Math.hypot(...v1)||1, l2=Math.hypot(...v2)||1;
      const u1=[v1[0]/l1,v1[1]/l1], u2=[v2[0]/l2,v2[1]/l2]; const t1=[x1+u1[0]*r,y1+u1[1]*r], t2=[x1+u2[0]*r,y1+u2[1]*r];
      ctx.lineTo(t1[0],t1[1]); for(let i=1;i<=6;i++){const t=i/6; const a=(1-t)*(1-t), b=2*(1-t)*t, c=t*t; ctx.lineTo(a*t1[0]+b*x1+c*t2[0], a*t1[1]+b*y1+c*t2[1]);} },
    rect(x,y,w,h){ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();},
    fill(){ if(path.length) out.push(`<path d="${path.join('')}" fill="${col(st.fillStyle)}" fill-opacity="${st.globalAlpha}"/>`); },
    stroke(){ if(path.length) out.push(`<path d="${path.join('')}" fill="none" stroke="${col(st.strokeStyle)}" stroke-opacity="${st.globalAlpha}" stroke-width="${(st.lineWidth*sc()).toFixed(2)}" stroke-linecap="${st.lineCap}" stroke-linejoin="${st.lineJoin}"/>`); },
    fillRect(x,y,w,h){ const sv=path; ctx.beginPath(); ctx.rect(x,y,w,h); ctx.fill(); path=sv; },
    clearRect(){}, strokeRect(){},
    fillText(t,x,y){ const p=P(x,y); const fs=parseFloat((st.font.match(/(\d+(\.\d+)?)px/)||[0,10])[1])*sc(); const anchor=st.textAlign==='center'?'middle':st.textAlign==='right'?'end':'start';
      out.push(`<text x="${p[0].toFixed(1)}" y="${(p[1]+(st.textBaseline==='middle'?fs*0.35:0)).toFixed(1)}" font-family="sans-serif" font-weight="700" font-size="${fs.toFixed(1)}" fill="${col(st.fillStyle)}" fill-opacity="${st.globalAlpha}" text-anchor="${anchor}">${String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`); },
    measureText(t){return {width:String(t).length*6};},
    createRadialGradient(){ const g={_c:'#13292a',addColorStop(o,c){ if(o===0) g._c=c; }}; return g; }, createLinearGradient(){return ctx.createRadialGradient();},
    drawImage(img){ if(img && img._svg) out.push(...img._svg()); },
    _svg:()=>out,
  };
  return new Proxy(ctx,{get(t,k){ if(k in t) return t[k]; if(k in st) return st[k]; return ()=>{}; }, set(t,k,v){ st[k]=v; return true; }});
}
module.exports={makeCtx};
