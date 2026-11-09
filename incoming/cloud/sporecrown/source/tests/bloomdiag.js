// How contested is the Great Bloom? Counts hits, knockback and enemy armies near the bloomer.
const SC=require('./load.js')();const games=+process.argv[2]||40;const seats=['bal','bloom','war','grow'];
let bt=0,st=0,kn=0,kt=0,near=0,bl=0;const len=[];
for(let g=0;g<games;g++){const S=SC.newGame({seed:5000+g*131,rivals:3,allAI:true,pers0:seats[g%4]});let start={};
  while(!S.over){const ev=[];for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}if(!S.over)SC.endRound(S,ev);
    for(const e of ev){if(e.e==='stall')st++;if(e.e==='knock'){kn++;kt+=e.k;}}
    for(const c of S.cols)if(c.build==='bloom'){bt++;if(start[c.id]===undefined)start[c.id]=S.turn;near+=S.units.filter(u=>u.civ!==c.civ&&u.k!=='spore'&&SC.dist(u.t,c.t)<=2).length;}}
  if(S.over.type==='bloom'){bl++;const w=S.cols.filter(c=>c.civ===S.over.winner).map(c=>start[c.id]).filter(x=>x!==undefined);len.push(S.over.turn-Math.min(...w));}}
console.log('bloom turns',bt,'stalls',st,'knocks',kn,'chitin knocked',kt,'avg enemy units within 2 per bloom turn',(near/bt).toFixed(2),'bloom wins',bl,'bloom duration',len.sort((a,b)=>a-b).join(','));
