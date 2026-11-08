const B=require('./bots'); const {G}=B; const R=G.Rules,C=G.CONFIG,D=G.DATA;
const st=G.newState(process.argv[2]||'classic',+process.argv[3]||G.st.seed); const pol=B.smart();
for(let m=0;m<+(process.argv[4]||40);m++){ for(let h=0;h<2;h++){pol(st); for(let i=0;i<120;i++)R.step(st,C.STEP); st.ev.length=0;}
  const s=st.sites; console.log('m'+st.month,'t'+st.tier,'prog',Math.round(st.prog),'$'+Math.round(st.cash),'p'+st.last.profit,st.cables.map(c=>s[c.a].name.slice(0,4)+'-'+s[c.b].name.slice(0,4)+':'+c.cars.length+D.classes[c.cls].name[0]).join(' '),'| J',Math.round(s[4].piles.J||0),'C',Math.round(s[3].piles.C||0),'T',Math.round(s[7].piles.T||0),'O',Math.round(s[6].piles.O||0));
}
