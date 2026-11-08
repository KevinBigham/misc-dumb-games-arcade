const SC=require('./load.js')();
const seed=+process.argv[2]||5000, who=process.argv[3]||'war';
const S=SC.newGame({seed,rivals:3,allAI:true,pers0:'bal'});
const wid=S.civs.find(c=>c.pers===who).id;
while(!S.over){const ev=[];for(const c of S.civs){if(S.over)break;SC.aiPlay(S,c.id,ev);}if(!S.over)SC.endRound(S,ev);
  const mine=S.units.filter(u=>u.civ===wid).map(u=>u.k[0]+u.t+':'+u.hp).join(' ');
  const a=ev.filter(e=>e.e==='atk'&&e.civ===wid).map(e=>(e.col?'C':'u')+e.to+'-'+e.dd+'/'+e.da).join(' ');
  const cols=SC.civStats(S,wid);
  console.log('T'+S.turn,'cols',cols.cols,'pop',cols.pop,'techs',S.civs[wid].techs.join(','),'|',mine,'| atk',a, ev.filter(e=>e.e==='cap').map(e=>'CAP '+e.name+' by '+e.to).join(' '));
}
console.log(S.over, S.civs.map(c=>c.pers+':'+SC.renown(S,c.id)));
