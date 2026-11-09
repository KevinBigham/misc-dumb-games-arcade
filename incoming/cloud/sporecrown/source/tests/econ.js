// Economy snapshot by personality: average sap/chitin/lore income, pop and colonies at chosen turns.
const SC=require('./load.js')();
const games=+process.argv[2]||30;const at=[10,20,30];const acc={};
for(let g=0;g<games;g++){const S=SC.newGame({seed:9000+g*37,rivals:3,allAI:true,pers0:['bal','bloom','war','grow'][g%4]});
  while(!S.over){const ev=[];for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}if(!S.over)SC.endRound(S,ev);
    if(at.includes(S.turn))for(const c of S.civs){if(!c.alive)continue;const y=SC.civYields(S,c.id).tot;const st=SC.civStats(S,c.id);const k=c.pers+'@'+S.turn;const a=acc[k]=acc[k]||{n:0,sap:0,chit:0,lore:0,pop:0,cols:0,mil:0};
      a.n++;a.sap+=y.sap-y.eat;a.chit+=y.chit;a.lore+=y.lore;a.pop+=st.pop;a.cols+=st.cols;a.mil+=st.mil;}}}
for(const k of Object.keys(acc).sort()){const a=acc[k];console.log(k.padEnd(10),['sap','chit','lore','pop','cols','mil'].map(f=>f+' '+(a[f]/a.n).toFixed(1)).join('  '));}
