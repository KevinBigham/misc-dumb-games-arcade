// AI-vs-AI bot test: many seeds, all four seats played by the AI.
// Usage: node tests/sim.js [games=200] [rivals=3]
const SC=require('./load.js')();
const games=+process.argv[2]||200, rivals=+process.argv[3]||3;
const persList=['bal','bloom','war','grow'];
const byType={},byPers={},seatWins={},lens=[];let errors=0,maxTurnMs=0,totalMs=0,turns=0;const inv=[];const appear={};
function check(S,seed){
  const tiles=new Set();
  for(const u of S.units){if(tiles.has(u.t))inv.push(seed+': two units on '+u.t);tiles.add(u.t);if(S.ter[u.t]==='X')inv.push(seed+': unit in hollow');if(!(u.hp>0&&u.hp<=10))inv.push(seed+': hp '+u.hp);}
  const ct=new Set();for(const c of S.cols){if(ct.has(c.t))inv.push(seed+': colony stack');ct.add(c.t);if(S.own[c.t]!==c.civ)inv.push(seed+': colony on foreign land');if(!(c.pop>=1))inv.push(seed+': pop');if(!isFinite(c.prod)||c.prod<0)inv.push(seed+': prod '+c.prod);if(c.prod>SC.PROJ.bloom.cost+0.5)inv.push(seed+': prod hoard '+c.prod);}
  for(const c of S.civs){if(!isFinite(c.lore)||c.lore<0)inv.push(seed+': lore');}
  if(SC.validate(S))inv.push(seed+': validate '+SC.validate(S));
}
for(let g=0;g<games;g++){
  const seed=1000+g*7919;const pers0=persList[g%4];
  try{
    const S=SC.newGame({seed,rivals,allAI:true,realm:g%4});
    let guard=0;
    while(!S.over&&guard++<SC.CONFIG.TURNS+2){
      const t0=process.hrtime.bigint();const ev=[];
      for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}
      if(!S.over)SC.endRound(S,ev);
      const ms=Number(process.hrtime.bigint()-t0)/1e6;maxTurnMs=Math.max(maxTurnMs,ms);totalMs+=ms;turns++;
      if(!S.over&&S.turn<=SC.CONFIG.TURNS)check(S,seed);
    }
    if(!S.over){inv.push(seed+': never ended');continue;}
    const w=S.over.winner;const p=w>=0?S.civs[w].pers:'none';for(const c of S.civs)appear[c.pers]=(appear[c.pers]||0)+1;
    byType[S.over.type]=(byType[S.over.type]||0)+1;byPers[p+'/'+S.over.type]=(byPers[p+'/'+S.over.type]||0)+1;
    byPers[p]=(byPers[p]||0)+1;seatWins[w]=(seatWins[w]||0)+1;lens.push(S.over.turn);
  }catch(e){errors++;if(errors<4)console.log('ERR seed',seed,e.stack);}
}
lens.sort((a,b)=>a-b);
console.log('games',games,'rivals',rivals,'errors',errors);
console.log('by victory type',byType);
console.log('by winner personality',Object.fromEntries(Object.entries(byPers).sort()));
console.log('by seat',seatWins);console.log('win rate per appearance',Object.fromEntries(Object.keys(appear).map(k=>[k,Math.round(100*(byPers[k]||0)/appear[k])+'%'])));
console.log('game length turns: min',lens[0],'median',lens[lens.length>>1],'max',lens[lens.length-1]);
console.log('AI round time ms: avg',(totalMs/turns).toFixed(2),'max',maxTurnMs.toFixed(1));
console.log('invariant problems',inv.length,inv.slice(0,8));
