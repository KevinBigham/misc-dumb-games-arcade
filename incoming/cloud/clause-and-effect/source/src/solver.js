// Brute-force: enumerate routine line choices + clause choices (+face) and report winners.
const C=require('./core.js');
function lineOptions(lv){
  const out=[{cmd:null}];
  for(const c of lv.palette){
    if(c==='repeat'){for(const n of C.CONFIG.REPEAT_COUNTS)for(const a of C.ACTIONS)out.push({cmd:'repeat',n,act:a});}
    else if(c==='if'){for(const se of (lv.senses||['wall']))for(const t of C.ACTIONS)for(const e of C.ACTIONS)if(t!==e)out.push({cmd:'if',sense:se,then:t,else:e});}
    else out.push({cmd:c});
  }
  return out;
}
function* product(arrs,i=0,acc=[]){ if(i===arrs.length){yield acc.slice();return;} for(const v of arrs[i]){acc.push(v);yield* product(arrs,i+1,acc);acc.pop();}}
function solve(id,{limit=Infinity, report=8}={}){
  const lv=C.LEVELS.find(l=>l.id===id);
  const routineSlots=lv.routine.map(l=>l.lock?[{...l}]:lineOptions(lv));
  const clauseSlots=lv.clauses.map(c=>(c.lock||C.isLocked(lv,'clause',c.key))?[c.v]:Object.keys(C.CLAUSES[c.key].opts));
  const faceSlots=lv.face.lock?[lv.face.v]:['north','east','south','west'];
  const strikeSlots=lv.strikable?lv.seals.filter(s=>s!=='pen').map(()=>[false,true]):[];
  let wins=[], voids={}, n=0, best=null;
  for(const face of faceSlots)for(const cl of product(clauseSlots))for(const st of product(strikeSlots))for(const r of product(routineSlots)){
    if(++n>limit) break;
    const led=C.freshLedger(lv); led.face=face; lv.clauses.forEach((c,i)=>led.clauses[c.key]=cl[i]);
    if(lv.strikable) lv.seals.filter(s=>s!=='pen').forEach((s,i)=>{if(st[i])led.struck[s]=true});
    led.routine=r.map(x=>Object.assign({n:3,act:'step',sense:'wall',then:'right',else:'step'},x));
    const s=C.runAll(lv,led);
    if(s.status==='win'){const d=desc(lv,led,s); wins.push(d); if(!best||s.tick<best.t||(s.tick===best.t&&C.usedLines(led)<best.l))best={t:s.tick,l:C.usedLines(led),d};}
    else if(s.status==='void'){voids[s.reason]=(voids[s.reason]||0)+1;}
  }
  return {id,n,wins:wins.length,sample:wins.slice(0,report),best,voids};
}
function desc(lv,led,s){
  const r=led.routine.filter(l=>l.cmd).map(l=>l.cmd==='repeat'?`rep${l.n}:${l.act}`:l.cmd==='if'?`if ${l.sense}?${l.then}:${l.else}`:l.cmd).join(' | ');
  const cl=lv.clauses.filter(c=>led.clauses[c.key]!==c.v).map(c=>c.key+'='+led.clauses[c.key]).join(',');
  const st=Object.keys(led.struck).join(',');
  return `t${s.tick} face=${led.face} [${r}] ${cl} ${st?'strike:'+st:''}`;
}
module.exports={solve};
if(require.main===module){ for(const id of process.argv.slice(2)) console.log(JSON.stringify(solve(id),null,1)); }
