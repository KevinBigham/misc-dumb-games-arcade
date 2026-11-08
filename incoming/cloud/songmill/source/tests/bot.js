const H=require('./harness.js'); const {G,rafQ,els}=H;
const R=G.Rules, C=G.CONFIG;
let fail=0; const ok=(c,m)=>{ if(!c){fail++;console.log('FAIL',m)} else console.log('ok  ',m) };
// --- unit rules
ok(R.mix('R','Y')==='O','R+Y=O'); ok(R.mix('Y','B')==='G','Y+B=G'); ok(R.mix('O','B')==='W','O+B=W'); ok(R.mix('RY','BB')==='PG','RY mix BB = PG');
ok(R.mix('YR','BBBB')==='GPBB','mix uneven lengths keeps tail'); ok(R.join('RY','BBB')==='RYBB','join truncates at 4'); ok(R.echo('GP')==='GPGP','echo'); ok(R.flip('GP')==='PG','flip');
// --- run a few frames through the real loop
let t=0; function frames(n){ for(let i=0;i<n;i++){ const f=rafQ.shift(); t+=16.7; f(t); } }
frames(5); ok(true,'frames run without exceptions');
// --- drive Input like a finger: drag from red well (1,3) to the hub
let st=G.st; const I=G.Input;
function drag(cells){ I.down(cells[0][0],cells[0][1],0); for(let k=1;k<cells.length;k++) I.move(cells[k][0],cells[k][1]); I.up(); }
// start ON the well, drag right, then down to row 6 then right into hub
drag([[1,3],[2,3],[2,4],[2,5],[2,6],[3,6],[4,6]]);
const b=st.grid; const at=(x,y)=>b[y*10+x];
ok(at(2,3)&&at(2,3).t==='belt'&&at(2,3).d===2,'belt (2,3) points down after turning the corner');
ok(at(3,6)&&at(3,6).d===1,'last belt points into the Mill');
ok(at(2,3).d===2 && at(2,6).d===1,'corner belt aims right');
// well (1,3) east neighbor (2,3) points S, not away from well -> well must NOT feed it. Check: simulate
function sim(sec){ const n=Math.round(sec/C.STEP); for(let i=0;i<n;i++) R.step(st,C.STEP); st.ev.length=0; }
sim(10); ok(st.prog>0,'L-shaped drag straight out of a well works (prog '+st.prog+')');
// fix: start from the well heading right first
I.doUndo(); ok(!at(2,3),'undo removes the whole drag');
drag([[1,3],[2,3],[3,3],[3,4],[3,5]]); drag([[3,5],[3,6],[4,6]]);
ok(at(2,3).d===1,'first belt points away from well');
sim(20); ok(st.prog>=10||st.tier>=1,'tier 1 (R x10) completes from one finger drag: prog '+st.prog+' tier '+st.tier);
frames(3);
console.log('tier now',st.tier,'hum',st.hum);
// tap-to-rotate and machine aim-by-drag
G.UI.selectTool('join'); I.down(8,5,0); I.move(8,6); I.up(); ok(at(8,5)&&at(8,5).t==='join'&&at(8,5).d===2,'machine placed and aimed by drag (down)');
I.down(8,5,0); I.up(); ok(at(8,5).d===3,'tap rotates machine');
G.UI.selectTool('erase'); I.down(8,5,0); I.up(); ok(!at(8,5),'erase works');
// persistence
G.Game.save(); const saved=JSON.parse(H.store['songmill.v1']); ok(saved.tier===st.tier && saved.b.length>0,'save written ('+saved.b.length+' buildings)');
const st2=R.deserialize(saved); ok(st2.tier===st.tier && R.buildList(st2).length===saved.b.length,'load restores tier and buildings');
// corrupt save tolerance
ok(R.deserialize({v:1,b:[[999,'belt',0],['x']],tier:'a'}).tier===0,'corrupt save does not crash');
console.log(fail?('FAILURES: '+fail):'ALL OK'); process.exitCode=fail?1:0;
