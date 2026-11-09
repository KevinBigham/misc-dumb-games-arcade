// Per-game diagnostics: when techs land, captures, kills, colony counts.
const SC=require('./load.js')();
const games=+process.argv[2]||20;const seats=['bal','bloom','war','grow'];
let caps=0,kills=0,att=0;const tech4={},cols={},milEnd={};
for(let g=0;g<games;g++){
  const S=SC.newGame({seed:5000+g*131,rivals:3,allAI:true,pers0:seats[g%4]});
  while(!S.over){const ev=[];for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}if(!S.over)SC.endRound(S,ev);
    for(const e of ev){if(e.e==='cap')caps++;if(e.e==='die')kills++;if(e.e==='atk')att++;if(e.e==='tech'&&S.civs[e.civ].techs.length===4){(tech4[S.civs[e.civ].pers]=tech4[S.civs[e.civ].pers]||[]).push(S.turn);}}
    if(S.turn===20)for(const c of S.civs){(cols[c.pers]=cols[c.pers]||[]).push(SC.civStats(S,c.id).cols+'/'+SC.civStats(S,c.id).pop+'/'+SC.milCount(S,c.id));}
  }
}
console.log('per game: captures',(caps/games).toFixed(2),'kills',(kills/games).toFixed(2),'attacks',(att/games).toFixed(1));
for(const p in tech4)console.log('tier4 turn',p,tech4[p].sort((a,b)=>a-b).join(','));
for(const p in cols)console.log('T20 cols/pop/mil',p,cols[p].slice(0,12).join(' '));
