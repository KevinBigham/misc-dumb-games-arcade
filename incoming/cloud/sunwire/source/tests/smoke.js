const H=require('./harness')(); const {G,frames,errors}=H;
frames(5); console.log('errors',errors); console.log('st sites',G.st.sites.length,'cash',G.st.cash);
H.dragSites(0,1); frames(3); console.log('cables',G.st.cables.length, H.doc.getElementById('toast').textContent);
frames(600); console.log('month',G.st.month,'cash',G.st.cash,'prog',G.st.prog, errors.slice(0,3));
H.png('/tmp/claude-0/sw/smoke.png');
