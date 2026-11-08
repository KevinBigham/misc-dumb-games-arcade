const G=require('./load.js')(process.argv[2]); const {Rules:R,CONFIG}=G; const greedy=require('./greedy.js')(G);
const s=R.newGame(1); let calls=0,placed=0;
while(s.phase==='play'&&s.t<3000){ if(s.t>40){const b=s.stats.built; greedy(s,{mix:true}); calls++; if(s.stats.built>b)placed+=s.stats.built-b;} R.step(s,CONFIG.dt); s.events.length=0;}
const c={};s.grid.forEach(b=>{if(b)c[b.k]=(c[b.k]||0)+1});
console.log(s.phase,s.wave,s.keep,Math.floor(s.salt),JSON.stringify(c),JSON.stringify(s.stats.leakBy));
// ammo states at end
let starving=0;s.grid.forEach(b=>{if(b&&b.ammo!=null&&b.ammo<1)starving++});console.log('starving',starving);
