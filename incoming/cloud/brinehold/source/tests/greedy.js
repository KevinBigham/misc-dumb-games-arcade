// Greedy spender: after a scripted opening, keeps buying fed turrets at the best-coverage bank cells.
module.exports=function(G){
  const {Rules,DATA}=G; const R=Rules;
  const cover=(x,y,range)=>{let n=0;for(const p of R.path){if(!Number.isInteger(p.y))continue;const d=Math.hypot(p.x-x,p.y-y);if(d<=range)n++;}return n;};
  const free=(s,x,y)=>x>=0&&y>=0&&x<R.W&&y<R.H&&!s.grid[R.idx(x,y)]&&(R.T(x,y)==='g'||R.T(x,y)==='s');
  const nb=(x,y)=>[[x,y-1],[x+1,y],[x,y+1],[x-1,y]];
  const pathCells=R.path.filter(p=>Number.isInteger(p.y)&&p.y>=0);
  function wards(s){ if(!s.unlocked.ward) return false;
    for(const pc of pathCells){ if(s.salt<8) return false;
      const ns=nb(pc.x,pc.y).filter(([x,y])=>x>=0&&y>=0&&x<R.W&&y<R.H);
      const blds=ns.filter(([x,y])=>s.grid[R.idx(x,y)]); if(!blds.length) continue;
      if(blds.some(([x,y])=>s.grid[R.idx(x,y)].k==='ward')) continue;
      const spot=ns.find(([x,y])=>free(s,x,y)&&R.T(x,y)!=='s'); if(spot){R.place(s,'ward',spot[0],spot[1]);return true;} }
    return false; }
  function ups(s){ for(const id of (process.env.UPS?process.env.UPS.split(','):['quickBelts','deepRakes','bellows','heavyBricks'])) if(s.upAvail[id]&&!s.ups[id]&&s.salt>=DATA.upgrades[id].cost+20){R.buyUpgrade(s,id);return true;} return false; }
  return function step(s,opts){
    if(opts.adapt){ if(!opts.noups&&ups(s)) return true; if(wards(s)) return true; }
    const mortarOK=s.unlocked.mortar&&s.unlocked.kiln&&s.wave>=6&&(opts.mix!==false);
    const cnt=k=>s.grid.filter(b=>b&&b.k===k).length;
    const wantMortar=mortarOK&&(cnt('mortar')*2<cnt('cannon')||opts.heavy);
    if(wantMortar&&s.salt>=80){
      let best=null;
      for(let y=0;y<R.H;y++)for(let x=0;x<R.W;x++){ if(!free(s,x,y))continue; const c=cover(x,y,DATA.buildings.mortar.range); if(c<6)continue;
        for(const [kx,ky] of nb(x,y)){ if(!free(s,kx,ky))continue; const rakes=nb(kx,ky).filter(([rx,ry])=>free(s,rx,ry)&&R.T(rx,ry)==='s'&&!(rx===x&&ry===y)); if(!rakes.length)continue;
          const sc=c+rakes.length*3; if(!best||sc>best.sc)best={sc,x,y,kx,ky,rakes};}}
      if(best){R.place(s,'mortar',best.x,best.y);R.place(s,'kiln',best.kx,best.ky);for(const [rx,ry] of best.rakes.slice(0,2))R.place(s,'rake',rx,ry);return true;}
    }
    if(s.salt>=(opts.oneRake?30:40) && !(wantMortar && s.salt<80 && !opts.noWait)){
      let best=null;
      for(let y=0;y<R.H;y++)for(let x=0;x<R.W;x++){ if(!free(s,x,y)||R.T(x,y)==='s')continue; const c=cover(x,y,DATA.buildings.cannon.range); if(c<3)continue;
        const rakes=nb(x,y).filter(([rx,ry])=>free(s,rx,ry)&&R.T(rx,ry)==='s'); if(rakes.length<(opts.oneRake?1:2))continue; const sc=c+rakes.length;
        if(!best||sc>best.sc)best={sc,x,y,rakes};}
      if(best){R.place(s,'cannon',best.x,best.y);for(const [rx,ry] of best.rakes.slice(0,2))R.place(s,'rake',rx,ry);return true;}
    }
    return false;
  };
};
