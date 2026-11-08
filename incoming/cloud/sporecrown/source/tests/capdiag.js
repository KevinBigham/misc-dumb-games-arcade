// Who captures what: heartcap captures by personality, and max hearts held.
const SC=require('./load.js')();const games=+process.argv[2]||40,rivals=+process.argv[3]||3;const seats=['bal','bloom','war','grow'];
const hc={},cc={};let maxHeld=0;const heldHist={};
for(let g=0;g<games;g++){const S=SC.newGame({seed:5000+g*131,rivals,allAI:true,pers0:seats[g%4]});let mh=0;
  while(!S.over){const ev=[];for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}if(!S.over)SC.endRound(S,ev);
    for(const e of ev)if(e.e==='cap'){const p=S.civs[e.to].pers;(e.heart?hc:cc)[p]=((e.heart?hc:cc)[p]||0)+1;}
    for(const c of S.civs){const h=SC.civStats(S,c.id).caps;if(h>mh)mh=h;}}
  heldHist[mh]=(heldHist[mh]||0)+1;}
console.log('heart captures',hc,'other captures',cc,'max hearts held per game',heldHist);
