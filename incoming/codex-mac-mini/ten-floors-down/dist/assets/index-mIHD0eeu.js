const p={RULES_VERSION:"1.0.0",STORAGE_KEY:"argon_game02_blackout_dispatch_v1",GRID_SIZE:8,TOTAL_TURNS:12,MAX_ACTIONS_PER_TURN:2,BASE_MATERIAL_INCOME_PER_TURN:15,RELAY_MATERIAL_BONUS_PER_TURN:2,REROUTE_COST_MAT:5,DEFAULT_SEED:20261106,LINKS:{standard:{type:"standard",name:"Standard Line",shortLabel:"STD 4MW",capacityMW:4,buildCostMat:10,repairCostMat:5,windImmune:!1,description:"4 MW capacity, 10 Mat. Economical feeder line; vulnerable to storm wind strikes."},heavy:{type:"heavy",name:"Heavy Trunk",shortLabel:"HVY 8MW",capacityMW:8,buildCostMat:20,repairCostMat:8,windImmune:!1,description:"8 MW capacity, 20 Mat. High-throughput arterial line; vulnerable to storm wind strikes."},shielded:{type:"shielded",name:"Storm-Shielded Conduit",shortLabel:"SHD 5MW",capacityMW:5,buildCostMat:25,repairCostMat:10,windImmune:!0,description:"5 MW capacity, 25 Mat. Armored underground/insulated conduit; IMMUNE to standard wind strikes."}}};function ye(e,t,r){return e===t?r?p.LINKS[e].repairCostMat:0:Math.max(10,p.LINKS[t].buildCostMat-p.LINKS[e].buildCostMat+(r?5:0))}function z(e,t){return`${e},${t}`}function me(e){const[t,r]=e.split(",").map(Number);return{row:t,col:r}}function v(e,t){const r=typeof e=="string"?me(e):e,n=typeof t=="string"?me(t):t,a=z(r.row,r.col),d=z(n.row,n.col);return r.row<n.row||r.row===n.row&&r.col<=n.col?`${a}--${d}`:`${d}--${a}`}function P(e){const[t,r]=e.split("--");return{nodeA:t,nodeB:r,coordA:me(t),coordB:me(r)}}function Le(e,t){return Math.abs(e.row-t.row)+Math.abs(e.col-t.col)===1}function F(e){const{nodeA:t,nodeB:r}=P(e);return`(${t})↔(${r})`}function Ne(e){const t=Math.floor(e)>>>0||1;let r=t;const n=()=>{r=r+1831565813>>>0;let o=Math.imul(r^r>>>15,1|r);return o=o+Math.imul(o^o>>>7,61|o)^o,((o^o>>>14)>>>0)/4294967296},a=(o,x)=>x<=o?o:o+Math.floor(n()*(x-o+1));return{seed:t,next:n,nextInt:a,pick:o=>{if(o.length===0)throw new Error("Cannot pick from empty array");return o[a(0,o.length-1)]},shuffle:o=>{const x=[...o];for(let A=x.length-1;A>0;A--){const y=a(0,A),M=x[A];x[A]=x[y],x[y]=M}return x}}}const fe={id:"harbor-squall",number:1,title:"Scenario 1: Harbor Squall",subtitle:"Coastal Gale & Arterial Bottleneck",briefing:"A coastal squall approaches Port Argon. On Turn 1, link St. Jude Hospital (D1) and Harbor Waterworks (D2) into Substation Alpha. On Turn 2, their combined 6 MW surge will exceed a single 4 MW Standard Line — forcing a choice between a Heavy Trunk upgrade or a Redundant Storm Loop.",onboardingHintTurn1:"TURN 1 DISPATCH ORDER: Place a Standard Line on (3,2)↔(3,3) to power D1 (St. Jude Hospital) and a second Standard Line on (3,3)↔(3,4) to reach D2 (Harbor Waterworks), then click Commit Turn.",onboardingHintTurn2:"TURN 2 BOTTLENECK ALERT: D1 (3 MW) + D2 (3 MW) = 6 MW, saturating (3,2)↔(3,3) at 4/4 MW! Either UPGRADE (3,2)↔(3,3) to a Heavy Trunk (8 MW) OR build a Redundant Loop at (3,4)↔(4,4) from the South corridor. Also connect D5 at (2,5)↔(2,6) before Turn 3!",generator:{row:3,col:1,outputMW:26,name:"Central Harbor Turbine"},startingMaterials:65,cityOutageThresholdMW:12,relays:[{id:"R1",name:"Substation Alpha",row:3,col:2},{id:"R2",name:"Substation North",row:1,col:3},{id:"R3",name:"Substation South",row:5,col:3}],blockedCells:[{row:6,col:6},{row:6,col:7},{row:7,col:6},{row:7,col:7}],districts:[{id:"D1",name:"St. Jude Hospital",shortCode:"HOSP",priority:1,row:3,col:3,demandCurve:[2,3,3,3,3,4,4,4,4,4,4,4],unmetLimitMW:4},{id:"D2",name:"Harbor Waterworks",shortCode:"WATR",priority:2,row:3,col:5,demandCurve:[2,3,3,3,3,3,4,4,4,4,4,4],unmetLimitMW:5},{id:"D3",name:"Midtown Transit",shortCode:"TRAN",priority:3,row:1,col:4,demandCurve:[2,2,3,3,3,3,4,4,4,4,4,4],unmetLimitMW:6},{id:"D4",name:"Dockyard Cold Storage",shortCode:"DOCK",priority:4,row:5,col:4,demandCurve:[2,2,2,3,3,3,4,4,4,4,5,5],unmetLimitMW:6},{id:"D5",name:"Northside Residential",shortCode:"NRTH",priority:5,row:2,col:6,demandCurve:[0,0,2,2,3,3,3,3,4,4,4,4],unmetLimitMW:7}],initialLinks:[{from:{row:3,col:1},to:{row:3,col:2},type:"heavy"},{from:{row:3,col:4},to:{row:3,col:5},type:"standard"},{from:{row:3,col:1},to:{row:2,col:1},type:"heavy"},{from:{row:2,col:1},to:{row:1,col:1},type:"heavy"},{from:{row:1,col:1},to:{row:1,col:2},type:"heavy"},{from:{row:1,col:2},to:{row:1,col:3},type:"heavy"},{from:{row:1,col:3},to:{row:1,col:4},type:"standard"},{from:{row:1,col:4},to:{row:2,col:4},type:"standard"},{from:{row:2,col:4},to:{row:2,col:5},type:"standard"},{from:{row:3,col:1},to:{row:4,col:1},type:"heavy"},{from:{row:4,col:1},to:{row:5,col:1},type:"heavy"},{from:{row:5,col:1},to:{row:5,col:2},type:"heavy"},{from:{row:5,col:2},to:{row:5,col:3},type:"heavy"},{from:{row:5,col:3},to:{row:5,col:4},type:"standard"},{from:{row:5,col:3},to:{row:4,col:3},type:"heavy"},{from:{row:5,col:4},to:{row:4,col:4},type:"standard"}],stormStrikes:[{turn:4,edgeId:v({row:3,col:3},{row:3,col:4}),severity:"wind",label:"Squall Line Gust (Central Spine)"},{turn:6,edgeId:v({row:2,col:4},{row:2,col:5}),severity:"wind",label:"Northbay Crosswind (East Spur)"},{turn:8,edgeId:v({row:5,col:3},{row:5,col:4}),severity:"wind",label:"Breakwater Gale (South Dock Feeder)"},{turn:10,edgeId:v({row:1,col:4},{row:2,col:4}),severity:"wind",label:"Midtown Shear Gust (North-East Tie)"},{turn:12,edgeId:v({row:4,col:4},{row:5,col:4}),severity:"wind",label:"Eye-Wall Tail Gust (South Tie)"}]},Ue={id:"twin-ridge-gale",number:2,title:"Scenario 2: Twin Ridge Gale",subtitle:"Mountain Pass Choke Points & Dual-Front Winds",briefing:"Basalt ridges split the grid down Column 3, leaving only three narrow mountain passes at (1,3), (4,3), and (6,3). Dual-front ridge gales batter exposed lines starting Turn 3. Balance pass upgrades with eastern valley tie-lines.",onboardingHintTurn1:"TURN 1 DISPATCH ORDER: Link Central Pass (4,3)↔(4,4) to energize Metro Hospital (D1) and (4,4)↔(4,5) to reach Valley Foundry (D4).",onboardingHintTurn2:"TURN 2 DISPATCH ORDER: Upgrade Central Pass or cross-tie the North Pass at (1,4)↔(2,4) before Turn 3 ridge gusts strike.",generator:{row:4,col:0,outputMW:28,name:"West Dam Hydro Plant"},startingMaterials:75,cityOutageThresholdMW:14,relays:[{id:"R1",name:"North Pass Relay",row:1,col:3},{id:"R2",name:"Central Pass Relay",row:4,col:3},{id:"R3",name:"South Pass Relay",row:6,col:3}],blockedCells:[{row:0,col:3},{row:2,col:3},{row:3,col:3},{row:5,col:3},{row:7,col:3}],districts:[{id:"D1",name:"Metro General Hospital",shortCode:"MHOS",priority:1,row:4,col:4,demandCurve:[2,3,3,4,4,4,4,5,5,5,5,5],unmetLimitMW:4},{id:"D2",name:"Ridge Telecom Hub",shortCode:"TCOM",priority:2,row:1,col:5,demandCurve:[2,2,3,3,3,4,4,4,4,4,5,5],unmetLimitMW:5},{id:"D3",name:"Eastport Flood Locks",shortCode:"LOCK",priority:3,row:6,col:5,demandCurve:[2,2,3,3,3,3,4,4,4,4,4,5],unmetLimitMW:6},{id:"D4",name:"Valley Alloy Foundry",shortCode:"FNDR",priority:4,row:4,col:6,demandCurve:[2,3,3,3,4,4,4,4,4,5,5,5],unmetLimitMW:6},{id:"D5",name:"Bayview Highrises",shortCode:"BAYV",priority:5,row:2,col:6,demandCurve:[0,2,2,2,3,3,3,4,4,4,4,4],unmetLimitMW:7}],initialLinks:[{from:{row:4,col:0},to:{row:4,col:1},type:"heavy"},{from:{row:4,col:1},to:{row:4,col:2},type:"heavy"},{from:{row:4,col:2},to:{row:4,col:3},type:"heavy"},{from:{row:4,col:5},to:{row:4,col:6},type:"standard"},{from:{row:4,col:1},to:{row:3,col:1},type:"heavy"},{from:{row:3,col:1},to:{row:2,col:1},type:"heavy"},{from:{row:2,col:1},to:{row:1,col:1},type:"heavy"},{from:{row:1,col:1},to:{row:1,col:2},type:"heavy"},{from:{row:1,col:2},to:{row:1,col:3},type:"heavy"},{from:{row:1,col:3},to:{row:1,col:4},type:"standard"},{from:{row:1,col:4},to:{row:1,col:5},type:"standard"},{from:{row:1,col:5},to:{row:2,col:5},type:"standard"},{from:{row:4,col:1},to:{row:5,col:1},type:"heavy"},{from:{row:5,col:1},to:{row:6,col:1},type:"heavy"},{from:{row:6,col:1},to:{row:6,col:2},type:"heavy"},{from:{row:6,col:2},to:{row:6,col:3},type:"heavy"},{from:{row:6,col:3},to:{row:6,col:4},type:"standard"},{from:{row:6,col:4},to:{row:6,col:5},type:"standard"},{from:{row:6,col:5},to:{row:5,col:5},type:"standard"}],stormStrikes:[{turn:3,edgeId:v({row:1,col:4},{row:1,col:5}),severity:"wind",label:"North Ridge Downdraft"},{turn:5,edgeId:v({row:4,col:4},{row:4,col:5}),severity:"wind",label:"Canyon Venturi Gust"},{turn:7,edgeId:v({row:6,col:4},{row:6,col:5}),severity:"wind",label:"South Pass Gale"},{turn:9,edgeId:v({row:1,col:5},{row:2,col:5}),severity:"wind",label:"Upper Valley Crosswind"},{turn:11,edgeId:v({row:4,col:5},{row:4,col:6}),severity:"wind",label:"Foundry Basin Squall"}]},Oe={id:"cat4-supercell",number:3,title:"Scenario 3: Category-4 Supercell",subtitle:"Metropolitan Core & Lightning Arc Strikes",briefing:"A Category-4 Supercell passes directly over the central metropolitan hub. Standard Wind gusts are joined by high-voltage Supercell Lightning strikes on Turns 6 and 10 that penetrate even Storm-Shielded Conduits — making redundant rings or rapid repair essential.",onboardingHintTurn1:"TURN 1 DISPATCH ORDER: Connect Trauma Center (D1) at (3,4)↔(3,5) and Floodgate Array (D2) at (4,3)↔(5,3).",onboardingHintTurn2:"TURN 2 DISPATCH ORDER: Expand ring ties toward Civic Shelter (D5) at (5,5) and reinforce radial trunks.",generator:{row:3,col:3,outputMW:30,name:"Metro Core Reactor"},startingMaterials:80,cityOutageThresholdMW:14,relays:[{id:"R1",name:"East Ring Relay",row:3,col:4},{id:"R2",name:"South Ring Relay",row:4,col:3},{id:"R3",name:"North Ring Relay",row:2,col:3},{id:"R4",name:"West Ring Relay",row:3,col:2}],blockedCells:[{row:0,col:0},{row:0,col:7},{row:7,col:0},{row:7,col:7}],districts:[{id:"D1",name:"Central Trauma Center",shortCode:"TRMA",priority:1,row:3,col:5,demandCurve:[3,3,4,4,4,4,5,5,5,5,5,5],unmetLimitMW:4},{id:"D2",name:"Seawall Floodgates",shortCode:"FLOD",priority:2,row:5,col:3,demandCurve:[2,3,3,4,4,4,4,5,5,5,5,5],unmetLimitMW:5},{id:"D3",name:"North Rail Command",shortCode:"RAIL",priority:3,row:1,col:3,demandCurve:[2,3,3,3,4,4,4,4,5,5,5,5],unmetLimitMW:6},{id:"D4",name:"West Data Exchange",shortCode:"DATA",priority:4,row:3,col:1,demandCurve:[2,2,3,3,3,4,4,4,4,5,5,5],unmetLimitMW:6},{id:"D5",name:"Southeast Civic Shelter",shortCode:"SHLT",priority:5,row:5,col:5,demandCurve:[0,2,2,3,3,3,4,4,4,4,5,5],unmetLimitMW:7}],initialLinks:[{from:{row:3,col:3},to:{row:3,col:4},type:"heavy"},{from:{row:3,col:3},to:{row:4,col:3},type:"heavy"},{from:{row:3,col:3},to:{row:2,col:3},type:"heavy"},{from:{row:3,col:3},to:{row:3,col:2},type:"heavy"},{from:{row:2,col:3},to:{row:1,col:3},type:"standard"},{from:{row:3,col:2},to:{row:3,col:1},type:"standard"},{from:{row:3,col:5},to:{row:4,col:5},type:"standard"},{from:{row:5,col:3},to:{row:5,col:4},type:"standard"},{from:{row:4,col:4},to:{row:3,col:4},type:"standard"},{from:{row:4,col:4},to:{row:4,col:3},type:"standard"}],stormStrikes:[{turn:3,edgeId:v({row:2,col:3},{row:1,col:3}),severity:"wind",label:"Outer Band Gust (North Feeder)"},{turn:5,edgeId:v({row:3,col:2},{row:3,col:1}),severity:"wind",label:"Western Shear Gust (West Feeder)"},{turn:6,edgeId:v({row:3,col:4},{row:3,col:5}),severity:"lightning",label:"Supercell Core Lightning (Bypasses Shielding)"},{turn:8,edgeId:v({row:4,col:3},{row:5,col:3}),severity:"wind",label:"South Seawall Gale"},{turn:10,edgeId:v({row:4,col:5},{row:5,col:5}),severity:"lightning",label:"Mesocyclone Arc Strike (Bypasses Shielding)"},{turn:12,edgeId:v({row:5,col:3},{row:5,col:4}),severity:"wind",label:"Trailing Eyewall Gust"}]},ue=[fe,Ue,Oe];function _e(e){const t=Ne(e),r=fe,n=[v({row:3,col:3},{row:3,col:4}),v({row:2,col:4},{row:2,col:5}),v({row:5,col:3},{row:5,col:4}),v({row:1,col:4},{row:2,col:4}),v({row:4,col:4},{row:5,col:4}),v({row:3,col:4},{row:3,col:5}),v({row:1,col:3},{row:1,col:4})],a=t.shuffle(n),d=[4,6,8,10,12],c=["Seeded Squall Front","Barometric Shear Gust","Harbor Vortex Line","Coastal Microburst","Cyclonic Tail Gust"],o=d.map((A,y)=>({turn:A,edgeId:a[y%a.length],severity:"wind",label:`${c[y]} (#${t.nextInt(10,99)})`})),x=r.districts.map(A=>{const y=A.demandCurve.map((M,V)=>{if(V<3)return M;const B=t.nextInt(-1,1);return Math.max(2,Math.min(4,M+B))});return{...A,demandCurve:y}});return{...r,id:`seeded-${t.seed}`,number:4,title:`Seeded Storm #${t.seed}`,subtitle:"Deterministic Procedural Weather Pattern",briefing:`Seeded Storm Dispatch (Seed: ${t.seed}). All storm strikes and district demand fluctuations are 100% deterministic for this seed.`,districts:x,stormStrikes:o,isSeeded:!0,seed:t.seed}}function te(e,t=p.DEFAULT_SEED){if(e==="seeded"||e.startsWith("seeded-")){const r=e.startsWith("seeded-")&&Number(e.slice(7))||t;return _e(r)}return ue.find(r=>r.id===e)??fe}function ae(e,t){const r=z(t.row,t.col);return e.blockedCells.some(n=>z(n.row,n.col)===r)}function G(e){const t={};for(const[r,n]of Object.entries(e.links))t[r]={...n};return{links:t}}function Te(){const e=[];for(let t=0;t<p.GRID_SIZE;t++)for(let r=0;r<p.GRID_SIZE;r++)e.push(z(t,r));return e}function $e(e,t,r){const{nodeA:n,nodeB:a}=P(e.id);return e.directionConstraint==="forward"?t===n&&r===a:e.directionConstraint==="reverse"?t===a&&r===n:t===n&&r===a||t===a&&r===n}function Pe(e,t,r,n=0){const a=z(t.generator.row,t.generator.col),d=Math.max(0,Math.min(p.TOTAL_TURNS-1,n)),c=[...t.districts].sort((s,i)=>s.priority-i.priority),o=new Map,x=new Map,A=new Map;for(const s of Object.values(e.links))A.set(s.id,s),x.set(s.id,new Map);const y=(s,i)=>`${s}->${i}`,M=(s,i)=>o.get(y(s,i))??0,V=(s,i,l)=>{l<=0?o.delete(y(s,i)):o.set(y(s,i),l)},B=new Map;for(const s of Te())B.set(s,[]);for(const s of Object.values(e.links)){const{nodeA:i,nodeB:l}=P(s.id);B.get(i)?.push({neighbor:l,link:s}),B.get(l)?.push({neighbor:i,link:s})}for(const s of B.values())s.sort((i,l)=>i.neighbor.localeCompare(l.neighbor));let re=t.generator.outputMW;const ne={D1:{demandMW:0,deliveredMW:0,unmetMW:0,paths:[]},D2:{demandMW:0,deliveredMW:0,unmetMW:0,paths:[]},D3:{demandMW:0,deliveredMW:0,unmetMW:0,paths:[]},D4:{demandMW:0,deliveredMW:0,unmetMW:0,paths:[]},D5:{demandMW:0,deliveredMW:0,unmetMW:0,paths:[]}};for(const s of c){const i=r?.[s.id]!==void 0?r[s.id]:s.demandCurve[d],l=z(s.row,s.col);let h=0;const S=[];let T=Math.min(i,re);for(;T>0;){const D=[a],L=new Map,m=new Set([a]);for(;D.length>0&&!m.has(l);){const g=D.shift(),H=B.get(g)??[];for(const{neighbor:R,link:U}of H){if(m.has(R)||U.status!=="intact"||!$e(U,g,R))continue;const K=p.LINKS[U.type].capacityMW,Y=M(R,g),X=M(g,R);K-X+Y<=0||(m.add(R),L.set(R,{prev:g,link:U}),D.push(R))}}if(!m.has(l))break;const f=[l],b=[];let w=l,k=T;for(;w!==a;){const g=L.get(w);b.push({u:g.prev,v:w,link:g.link}),f.push(g.prev);const H=p.LINKS[g.link.type].capacityMW,R=M(g.prev,w),U=M(w,g.prev);k=Math.min(k,H-R+U),w=g.prev}f.reverse(),b.reverse();const _=Math.min(T,k);if(_<=0)break;for(const g of b){const H=M(g.u,g.v),R=M(g.v,g.u),U=H-R+_;U>=0?(V(g.u,g.v,U),V(g.v,g.u,0)):(V(g.u,g.v,0),V(g.v,g.u,-U));const K=x.get(g.link.id);K.set(s.id,(K.get(s.id)??0)+_)}h+=_,T-=_,re-=_,S.push(f)}ne[s.id]={demandMW:i,deliveredMW:h,unmetMW:Math.max(0,i-h),paths:S}}let ie=!1;(()=>{const s=Te();for(;;){const i=new Map,l=new Map;let h=null,S=null;const T=b=>{i.set(b,1);const w=B.get(b)??[];for(const{neighbor:k}of w){if(M(b,k)<=0)continue;const _=i.get(k)??0;if(_===1)return h=k,S=b,!0;if(_===0&&(l.set(k,b),T(k)))return!0}return i.set(b,2),!1};let D=!1;for(const b of s)if((i.get(b)??0)===0&&T(b)){D=!0;break}if(!D||!h||!S)break;const L=[{u:S,v:h}];let m=S;for(;m!==h;){const b=l.get(m);L.push({u:b,v:m}),m=b}let f=1/0;for(const b of L)f=Math.min(f,M(b.u,b.v));if(f<=0||!Number.isFinite(f))break;for(const b of L)V(b.u,b.v,M(b.u,b.v)-f)}})();{const s=new Map,i=l=>{s.set(l,1);for(const{neighbor:h}of B.get(l)??[]){if(M(l,h)<=0)continue;const S=s.get(h)??0;if(S===1||S===0&&i(h))return!0}return s.set(l,2),!1};for(const l of Te())if((s.get(l)??0)===0&&i(l)){ie=!0;break}}const $={};for(const s of Object.values(e.links)){const{nodeA:i,nodeB:l}=P(s.id),h=M(i,l),S=M(l,i),T=Math.max(h,S),D=S>h?l:i,L=S>h?i:l,m=s.status==="intact"?p.LINKS[s.type].capacityMW:0,f=x.get(s.id),b=[];for(const[w,k]of f.entries())k>0&&b.push({districtId:w,mw:k});$[s.id]={edgeId:s.id,type:s.type,status:s.status,capacityMW:m,flowMW:T,fromNode:D,toNode:L,isSaturated:s.status==="intact"&&T>=m&&m>0,isDamagedBottleneck:!1,contributors:b}}const J={},u=(s,i)=>{const l=[a],h=new Set([a]),S=new Map;for(;l.length>0&&!h.has(s);){const L=l.shift();for(const{neighbor:m,link:f}of B.get(L)??[])h.has(m)||i&&f.status!=="intact"||$e(f,L,m)&&(h.add(m),S.set(m,{prev:L,link:f}),l.push(m))}if(!h.has(s))return null;const T=[];let D=s;for(;D!==a;){const L=S.get(D);T.push(L.link),D=L.prev}return T.reverse(),T},N=new Set([a]);{const s=[a];for(;s.length>0;){const i=s.shift();for(const{neighbor:l,link:h}of B.get(i)??[]){if(N.has(l)||h.status!=="intact"||!$e(h,i,l))continue;const S=p.LINKS[h.type].capacityMW,T=M(l,i),D=M(i,l);S-D+T<=0||(N.add(l),s.push(l))}}}for(const s of c){const i=ne[s.id],l=z(s.row,s.col);if(i.unmetMW<=0){J[s.id]={districtId:s.id,districtName:s.name,priority:s.priority,reason:"OK",demandMW:i.demandMW,deliveredMW:i.deliveredMW,unmetMW:0,bottleneckEdgeIds:[],explanation:`${s.id} (${s.name}, P${s.priority}) is fully powered (${i.deliveredMW}/${i.demandMW} MW).`};continue}const h=u(l,!1),S=u(l,!0);if(!h){J[s.id]={districtId:s.id,districtName:s.name,priority:s.priority,reason:"DISCONNECTED_NO_PATH",demandMW:i.demandMW,deliveredMW:i.deliveredMW,unmetMW:i.unmetMW,bottleneckEdgeIds:[],explanation:`${s.id} (${s.name}, P${s.priority}) is DISCONNECTED (${i.deliveredMW}/${i.demandMW} MW): no link path reaches (${l}).`};continue}if(!S){const f=h.filter(w=>w.status==="damaged").map(w=>w.id);for(const w of f)$[w]&&($[w].isDamagedBottleneck=!0);const b=f.map(F).join(", ");J[s.id]={districtId:s.id,districtName:s.name,priority:s.priority,reason:"DAMAGED_LINE_OUTAGE",demandMW:i.demandMW,deliveredMW:i.deliveredMW,unmetMW:i.unmetMW,bottleneckEdgeIds:f,explanation:`${s.id} (${s.name}, P${s.priority}) is CUT OFF by storm damage on ${b} (short ${i.unmetMW} MW). Repair the damaged link or complete a bypass loop.`};continue}if(re<=0&&N.has(l)){J[s.id]={districtId:s.id,districtName:s.name,priority:s.priority,reason:"GENERATOR_CAPACITY_EXHAUSTED",demandMW:i.demandMW,deliveredMW:i.deliveredMW,unmetMW:i.unmetMW,bottleneckEdgeIds:[],explanation:`${s.id} (${s.name}, P${s.priority}) is short ${i.unmetMW} MW: Central Generator output (${t.generator.outputMW} MW) is exhausted by higher-priority districts.`};continue}const T=[];for(const f of S){const b=$[f.id];b&&b.isSaturated&&!T.includes(f.id)&&T.push(f.id)}for(const f of h)f.status==="damaged"&&!T.includes(f.id)&&(T.push(f.id),$[f.id]&&($[f.id].isDamagedBottleneck=!0));if(T.length===0)for(const f of N)for(const{neighbor:b,link:w}of B.get(f)??[])!N.has(b)&&$[w.id]?.isSaturated&&(T.includes(w.id)||T.push(w.id));const D=T[0],L=D?$[D]:void 0,m=D?`${F(D)} (${L?.flowMW??0}/${L?.capacityMW??0} MW)`:"upstream feeder";J[s.id]={districtId:s.id,districtName:s.name,priority:s.priority,reason:"CAPACITY_BOTTLENECK",demandMW:i.demandMW,deliveredMW:i.deliveredMW,unmetMW:i.unmetMW,bottleneckEdgeIds:T,explanation:`${s.id} (${s.name}, P${s.priority}) short by ${i.unmetMW} MW (${i.deliveredMW}/${i.demandMW} MW): shared link ${m} is saturated. Upgrade to Heavy Trunk (8 MW) or add a bypass loop.`}}const I=new Set([a]);{const s=[a];for(;s.length>0;){const i=s.shift();for(const{neighbor:l,link:h}of B.get(i)??[])I.has(l)||h.status==="intact"&&(I.add(l),s.push(l))}}const C=t.relays.filter(s=>I.has(z(s.row,s.col))).map(s=>s.id);let W=0,E=0,ee=0;for(const s of c){const i=ne[s.id];W+=i.demandMW,E+=i.deliveredMW,ee+=i.unmetMW}return{generatorOutputMW:t.generator.outputMW,generatorUsedMW:E,totalDemandMW:W,totalDeliveredMW:E,totalUnmetMW:ee,edgeFlows:$,districtAllocations:ne,diagnostics:J,energizedRelayIds:C,hasDirectedCycle:ie}}function Ge(e,t,r){const n=G(e),a=t.stormStrikes.filter(c=>c.turn===r),d=[];for(const c of a){const o=n.links[c.edgeId];if(!o){d.push({edgeId:c.edgeId,severity:c.severity,label:c.label,outcome:"missed_no_link"});continue}if(o.status==="damaged"){d.push({edgeId:c.edgeId,severity:c.severity,label:c.label,outcome:"already_damaged",linkType:o.type});continue}if(c.severity==="wind"&&p.LINKS[o.type].windImmune){d.push({edgeId:c.edgeId,severity:c.severity,label:c.label,outcome:"deflected",linkType:o.type});continue}o.status="damaged",d.push({edgeId:c.edgeId,severity:c.severity,label:c.label,outcome:"damaged",linkType:o.type})}return{postStrikeBoard:n,reports:d}}function q(e){const t=Math.max(0,Math.min(p.TOTAL_TURNS-1,e.turn-1)),{postStrikeBoard:r,reports:n}=Ge(e.board,e.scenario,e.turn),a=Pe(r,e.scenario,void 0,t),d=p.BASE_MATERIAL_INCOME_PER_TURN+a.energizedRelayIds.length*p.RELAY_MATERIAL_BONUS_PER_TURN,c=e.cityCumulativeUnmetMW+a.totalUnmetMW,o=c>e.scenario.cityOutageThresholdMW,x=[];for(const A of e.scenario.districts){const y=e.districts[A.id].cumulativeUnmetMW,M=a.districtAllocations[A.id].unmetMW;y+M>A.unmetLimitMW&&x.push(A.id)}return{turn:e.turn,imminentStrikes:n,postStrikeBoard:r,flow:a,projectedMaterialIncome:d,projectedCityCumulativeUnmetMW:c,willFailCity:o,failingDistrictIds:x}}function Z(e=fe){const t={};for(const d of e.initialLinks){const c=v(d.from,d.to);t[c]={id:c,type:d.type,status:d.status??"intact",directionConstraint:d.directionConstraint??"auto"}}const r={links:t},n={};for(const d of e.districts)n[d.id]={id:d.id,name:d.name,shortCode:d.shortCode,priority:d.priority,row:d.row,col:d.col,demandCurve:d.demandCurve,unmetLimitMW:d.unmetLimitMW,cumulativeUnmetMW:0,lastTurnDeliveredMW:0,lastTurnUnmetMW:0};const a={rulesVersion:p.RULES_VERSION,scenarioId:e.id,scenario:e,turn:1,status:"playing",lossReason:null,materials:e.startingMaterials,actionsRemaining:p.MAX_ACTIONS_PER_TURN,board:r,districts:n,cityCumulativeUnmetMW:0,stagedActions:[],turnStartSnapshot:{board:G(r),materials:e.startingMaterials,actionsRemaining:p.MAX_ACTIONS_PER_TURN},preview:null,history:[]};return a.preview=q(a),a}function Be(e,t){const{coordA:r,coordB:n}=P(t);return r.row<0||r.row>=p.GRID_SIZE||r.col<0||r.col>=p.GRID_SIZE||n.row<0||n.row>=p.GRID_SIZE||n.col<0||n.col>=p.GRID_SIZE?{ok:!1,error:"Coordinates out of 8x8 board bounds."}:Le(r,n)?ae(e,r)||ae(e,n)?{ok:!1,error:"Cannot build across blocked harbor/ridge terrain."}:{ok:!0}:{ok:!1,error:"Links can only connect orthogonally adjacent cells."}}function oe(e,t,r){if(e.status!=="playing")return{ok:!1,error:"Game has already ended."};if(e.actionsRemaining<=0)return{ok:!1,error:"No Actions remaining this turn (max 2 per turn). Undo or Commit Turn."};const n=v(P(t).coordA,P(t).coordB),a=Be(e.scenario,n);if(!a.ok)return a;if(e.board.links[n])return{ok:!1,error:"A link already exists on this corridor. Use Upgrade or Repair instead."};const d=p.LINKS[r].buildCostMat;if(e.materials<d)return{ok:!1,error:`Insufficient Materials: need ${d} Mat, have ${e.materials} Mat.`};const c={type:"place",description:`Place ${p.LINKS[r].name} at ${F(n)} (-${d} Mat)`,edgeId:n,linkType:r,costMat:d,previousBoard:G(e.board),previousMaterials:e.materials,previousActionsRemaining:e.actionsRemaining};return e.board.links[n]={id:n,type:r,status:"intact",directionConstraint:"auto"},e.materials-=d,e.actionsRemaining-=1,e.stagedActions.push(c),e.preview=q(e),{ok:!0}}function pe(e,t){if(e.status!=="playing")return{ok:!1,error:"Game has already ended."};if(e.actionsRemaining<=0)return{ok:!1,error:"No Actions remaining this turn (max 2 per turn)."};const r=v(P(t).coordA,P(t).coordB),n=e.board.links[r];if(!n)return{ok:!1,error:"No link on this corridor to repair."};if(n.status==="intact")return{ok:!1,error:"Link is already intact."};const a=p.LINKS[n.type].repairCostMat;if(e.materials<a)return{ok:!1,error:`Insufficient Materials to repair: need ${a} Mat, have ${e.materials} Mat.`};const d={type:"repair",description:`Repair ${p.LINKS[n.type].name} at ${F(r)} (-${a} Mat)`,edgeId:r,linkType:n.type,costMat:a,previousBoard:G(e.board),previousMaterials:e.materials,previousActionsRemaining:e.actionsRemaining};return n.status="intact",e.materials-=a,e.actionsRemaining-=1,e.stagedActions.push(d),e.preview=q(e),{ok:!0}}function Q(e,t,r){if(e.status!=="playing")return{ok:!1,error:"Game has already ended."};if(e.actionsRemaining<=0)return{ok:!1,error:"No Actions remaining this turn (max 2 per turn)."};const n=v(P(t).coordA,P(t).coordB),a=e.board.links[n];if(!a)return{ok:!1,error:"No existing link on this corridor to upgrade. Use Place instead."};if(a.type===r&&a.status==="intact")return{ok:!1,error:`Link is already an intact ${p.LINKS[r].name}.`};const d=ye(a.type,r,a.status==="damaged");if(e.materials<d)return{ok:!1,error:`Insufficient Materials to upgrade: need ${d} Mat, have ${e.materials} Mat.`};const c={type:"upgrade",description:`Upgrade ${F(n)} to ${p.LINKS[r].name} (-${d} Mat)`,edgeId:n,linkType:r,costMat:d,previousBoard:G(e.board),previousMaterials:e.materials,previousActionsRemaining:e.actionsRemaining};return a.type=r,a.status="intact",e.materials-=d,e.actionsRemaining-=1,e.stagedActions.push(c),e.preview=q(e),{ok:!0}}function He(e,t,r){if(e.status!=="playing")return{ok:!1,error:"Game has already ended."};if(e.actionsRemaining<=0)return{ok:!1,error:"No Actions remaining this turn (max 2 per turn)."};const n=v(P(t).coordA,P(t).coordB),a=e.board.links[n];if(!a)return{ok:!1,error:"No link at source corridor to reroute."};const d=p.REROUTE_COST_MAT;if(e.materials<d)return{ok:!1,error:`Insufficient Materials to reroute: need ${d} Mat.`};if(r.toEdgeId){const x=v(P(r.toEdgeId).coordA,P(r.toEdgeId).coordB),A=Be(e.scenario,x);if(!A.ok)return A;if(e.board.links[x])return{ok:!1,error:"Destination corridor already has a link."};const y={type:"reroute",description:`Reroute ${p.LINKS[a.type].name} ${F(n)} → ${F(x)} (-${d} Mat)`,edgeId:n,targetEdgeId:x,linkType:a.type,costMat:d,previousBoard:G(e.board),previousMaterials:e.materials,previousActionsRemaining:e.actionsRemaining};return delete e.board.links[n],e.board.links[x]={id:x,type:a.type,status:a.status,directionConstraint:r.directionConstraint??"auto"},e.materials-=d,e.actionsRemaining-=1,e.stagedActions.push(y),e.preview=q(e),{ok:!0}}const c=r.directionConstraint??(a.directionConstraint==="auto"?"forward":a.directionConstraint==="forward"?"reverse":"auto"),o={type:"reroute",description:`Set flow gate on ${F(n)} to ${c.toUpperCase()} (-${d} Mat)`,edgeId:n,linkType:a.type,costMat:d,previousBoard:G(e.board),previousMaterials:e.materials,previousActionsRemaining:e.actionsRemaining};return a.directionConstraint=c,e.materials-=d,e.actionsRemaining-=1,e.stagedActions.push(o),e.preview=q(e),{ok:!0}}function Fe(e){const t=e.stagedActions.pop();return t?(e.board=G(t.previousBoard),e.materials=t.previousMaterials,e.actionsRemaining=t.previousActionsRemaining,e.preview=q(e),{ok:!0}):{ok:!1,error:"No staged actions to undo this turn."}}function ze(e){return e.stagedActions.length===0?{ok:!1,error:"No staged actions to reset."}:(e.board=G(e.turnStartSnapshot.board),e.materials=e.turnStartSnapshot.materials,e.actionsRemaining=e.turnStartSnapshot.actionsRemaining,e.stagedActions=[],e.preview=q(e),{ok:!0})}function he(e){if(e.status!=="playing")return e.preview;const t=q(e);e.board=G(t.postStrikeBoard),e.cityCumulativeUnmetMW=t.projectedCityCumulativeUnmetMW;for(const r of e.scenario.districts){const n=t.flow.districtAllocations[r.id],a=e.districts[r.id];a.lastTurnDeliveredMW=n.deliveredMW,a.lastTurnUnmetMW=n.unmetMW,a.cumulativeUnmetMW+=n.unmetMW}if(e.history.push({turn:e.turn,strikes:t.imminentStrikes,totalDemandMW:t.flow.totalDemandMW,totalDeliveredMW:t.flow.totalDeliveredMW,totalUnmetMW:t.flow.totalUnmetMW,materialIncome:t.projectedMaterialIncome,diagnostics:t.flow.diagnostics}),t.failingDistrictIds.length>0){const r=t.failingDistrictIds[0],n=e.districts[r],a=t.flow.diagnostics[r];return e.status="lost",e.lossReason=`CRITICAL DISTRICT BLACKOUT: ${n.id} (${n.name}) reached ${n.cumulativeUnmetMW}/${n.unmetLimitMW} MW cumulative unmet demand. ${a.explanation}`,e.stagedActions=[],t}return t.willFailCity?(e.status="lost",e.lossReason=`CITY-WIDE GRID COLLAPSE: Cumulative city unmet demand reached ${e.cityCumulativeUnmetMW}/${e.scenario.cityOutageThresholdMW} MW.`,e.stagedActions=[],t):e.turn>=p.TOTAL_TURNS?(e.status="won",e.stagedActions=[],t):(e.turn+=1,e.materials+=t.projectedMaterialIncome,e.actionsRemaining=p.MAX_ACTIONS_PER_TURN,e.stagedActions=[],e.turnStartSnapshot={board:G(e.board),materials:e.materials,actionsRemaining:p.MAX_ACTIONS_PER_TURN},e.preview=q(e),t)}function We(e,t){return{imminent:e.stormStrikes.filter(r=>r.turn===t),turnPlus1:e.stormStrikes.filter(r=>r.turn===t+1),turnPlus2:e.stormStrikes.filter(r=>r.turn===t+2)}}const je={1:[{kind:"place",from:{row:3,col:2},to:{row:3,col:3},linkType:"standard"},{kind:"place",from:{row:3,col:3},to:{row:3,col:4},linkType:"standard"}],2:[{kind:"upgrade",from:{row:3,col:2},to:{row:3,col:3},linkType:"heavy"},{kind:"place",from:{row:2,col:5},to:{row:2,col:6},linkType:"standard"}],3:[{kind:"upgrade",from:{row:1,col:3},to:{row:1,col:4},linkType:"heavy"},{kind:"upgrade",from:{row:3,col:3},to:{row:3,col:4},linkType:"shielded"}],4:[{kind:"upgrade",from:{row:2,col:4},to:{row:2,col:5},linkType:"shielded"}],5:[{kind:"upgrade",from:{row:5,col:3},to:{row:5,col:4},linkType:"shielded"}],6:[{kind:"upgrade",from:{row:1,col:4},to:{row:2,col:4},linkType:"shielded"}]},qe={1:[{kind:"place",from:{row:3,col:2},to:{row:3,col:3},linkType:"standard"},{kind:"place",from:{row:3,col:3},to:{row:3,col:4},linkType:"standard"}],2:[{kind:"place",from:{row:4,col:4},to:{row:3,col:4},linkType:"standard"},{kind:"place",from:{row:2,col:5},to:{row:2,col:6},linkType:"standard"}],3:[{kind:"place",from:{row:3,col:5},to:{row:2,col:5},linkType:"standard"},{kind:"upgrade",from:{row:5,col:3},to:{row:5,col:4},linkType:"heavy"}],4:[{kind:"upgrade",from:{row:5,col:4},to:{row:4,col:4},linkType:"heavy"},{kind:"upgrade",from:{row:4,col:4},to:{row:3,col:4},linkType:"heavy"}],5:[{kind:"upgrade",from:{row:1,col:3},to:{row:1,col:4},linkType:"heavy"},{kind:"upgrade",from:{row:3,col:4},to:{row:3,col:5},linkType:"heavy"}],6:[{kind:"repair",from:{row:3,col:3},to:{row:3,col:4}},{kind:"upgrade",from:{row:3,col:2},to:{row:3,col:3},linkType:"heavy"}],7:[{kind:"upgrade",from:{row:3,col:3},to:{row:3,col:4},linkType:"heavy"},{kind:"place",from:{row:4,col:3},to:{row:4,col:4},linkType:"heavy"}],8:[{kind:"repair",from:{row:2,col:4},to:{row:2,col:5}},{kind:"place",from:{row:1,col:3},to:{row:2,col:3},linkType:"standard"}],9:[{kind:"place",from:{row:2,col:3},to:{row:2,col:4},linkType:"standard"},{kind:"repair",from:{row:5,col:3},to:{row:5,col:4}}]},Ke={1:[{kind:"place",from:{row:3,col:2},to:{row:3,col:3},linkType:"standard"},{kind:"place",from:{row:3,col:3},to:{row:3,col:4},linkType:"standard"}]};function tt(e,t){const r=Z(e);for(;r.status==="playing";){const n=t[r.turn]??[];for(const a of n){const d=v(a.from,a.to);let c;if(a.kind==="place"?c=oe(r,d,a.linkType):a.kind==="upgrade"?c=Q(r,d,a.linkType):c=pe(r,d),!c.ok)throw new Error(`Script action failed on Turn ${r.turn}: ${c.error}`)}he(r)}return r}function xe(e){const t={rulesVersion:p.RULES_VERSION,savedAtIso:new Date().toISOString(),scenarioId:e.scenarioId,seed:e.scenario.seed,turn:e.turn,status:e.status,lossReason:e.lossReason,materials:e.materials,actionsRemaining:e.actionsRemaining,board:G(e.board),districts:JSON.parse(JSON.stringify(e.districts)),cityCumulativeUnmetMW:e.cityCumulativeUnmetMW,stagedActions:JSON.parse(JSON.stringify(e.stagedActions)),turnStartSnapshot:{board:G(e.turnStartSnapshot.board),materials:e.turnStartSnapshot.materials,actionsRemaining:e.turnStartSnapshot.actionsRemaining},history:JSON.parse(JSON.stringify(e.history))};return JSON.stringify(t)}function Ce(e){try{const t=JSON.parse(e);if(!t||typeof t!="object"||t.rulesVersion!==p.RULES_VERSION||typeof t.scenarioId!="string"||typeof t.turn!="number"||t.turn<1||t.turn>p.TOTAL_TURNS||typeof t.materials!="number"||typeof t.actionsRemaining!="number"||!t.board||typeof t.board.links!="object"||!t.districts||typeof t.districts!="object"||!t.turnStartSnapshot||typeof t.turnStartSnapshot.board?.links!="object")return null;const r=te(t.scenarioId,t.seed??p.DEFAULT_SEED),n=Z(r);n.turn=t.turn,n.status=t.status==="won"||t.status==="lost"?t.status:"playing",n.lossReason=t.lossReason??null,n.materials=t.materials,n.actionsRemaining=t.actionsRemaining,n.board=G(t.board),n.cityCumulativeUnmetMW=typeof t.cityCumulativeUnmetMW=="number"?t.cityCumulativeUnmetMW:0;for(const a of r.districts){const d=t.districts[a.id];d&&typeof d.cumulativeUnmetMW=="number"&&(n.districts[a.id]={...n.districts[a.id],cumulativeUnmetMW:d.cumulativeUnmetMW,lastTurnDeliveredMW:d.lastTurnDeliveredMW??0,lastTurnUnmetMW:d.lastTurnUnmetMW??0})}return n.stagedActions=Array.isArray(t.stagedActions)?t.stagedActions:[],n.turnStartSnapshot={board:G(t.turnStartSnapshot.board),materials:t.turnStartSnapshot.materials,actionsRemaining:t.turnStartSnapshot.actionsRemaining},n.history=Array.isArray(t.history)?t.history:[],n.preview=q(n),n}catch{return null}}function Ve(e,t=p.STORAGE_KEY){try{return typeof window>"u"||!window.localStorage?!1:(window.localStorage.setItem(t,xe(e)),!0)}catch{return!1}}function Ze(e=p.STORAGE_KEY){try{if(typeof window>"u"||!window.localStorage)return null;const t=window.localStorage.getItem(e);if(!t)return null;const r=Ce(t);return r||(window.localStorage.removeItem(e),null)}catch{return null}}function Je(e=p.STORAGE_KEY){try{if(typeof window>"u"||!window.localStorage)return;window.localStorage.removeItem(e)}catch{}}class Ye{ctx=null;muted=!1;isMuted(){return this.muted}setMuted(t){this.muted=t}toggleMute(){return this.muted=!this.muted,this.muted}getContext(){if(this.muted||typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;if(!t)return null;if(!this.ctx)try{this.ctx=new t}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playRelayClick(t=520){const r=this.getContext();if(r)try{const n=r.currentTime,a=r.createOscillator(),d=r.createGain();a.type="triangle",a.frequency.setValueAtTime(t,n),a.frequency.exponentialRampToValueAtTime(t*1.4,n+.045),d.gain.setValueAtTime(.08,n),d.gain.exponentialRampToValueAtTime(.001,n+.055),a.connect(d),d.connect(r.destination),a.start(n),a.stop(n+.06)}catch{}}playUndoClick(){this.playRelayClick(340)}playTurnCommitHum(t){const r=this.getContext();if(r)try{const n=r.currentTime,a=r.createOscillator(),d=r.createGain();a.type="sine";const c=t?110:180;a.frequency.setValueAtTime(c,n),a.frequency.exponentialRampToValueAtTime(t?82:240,n+.18),d.gain.setValueAtTime(.09,n),d.gain.exponentialRampToValueAtTime(.001,n+.2),a.connect(d),d.connect(r.destination),a.start(n),a.stop(n+.21)}catch{}}playStormStrike(){const t=this.getContext();if(t)try{const r=t.currentTime,n=t.createOscillator(),a=t.createGain();n.type="sawtooth",n.frequency.setValueAtTime(95,r),n.frequency.exponentialRampToValueAtTime(42,r+.25),a.gain.setValueAtTime(.08,r),a.gain.exponentialRampToValueAtTime(.001,r+.27),n.connect(a),a.connect(t.destination),n.start(r),n.stop(r+.28)}catch{}}playBlackoutAlarm(){const t=this.getContext();if(t)try{const r=t.currentTime;for(let n=0;n<2;n++){const a=t.createOscillator(),d=t.createGain();a.type="square";const c=r+n*.14;a.frequency.setValueAtTime(440,c),a.frequency.setValueAtTime(310,c+.07),d.gain.setValueAtTime(.06,c),d.gain.exponentialRampToValueAtTime(.001,c+.13),a.connect(d),d.connect(t.destination),a.start(c),a.stop(c+.135)}}catch{}}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const ot=`
.bd-root {
  container-type: inline-size;
  container-name: dispatch-shell;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #09111e;
  color: #e2e8f0;
  min-block-size: 100dvh;
  padding: clamp(0.5rem, 1.5vw, 1.25rem);
  box-sizing: border-box;
}

.bd-root *, .bd-root *::before, .bd-root *::after {
  box-sizing: border-box;
}

.bd-visually-hidden:where(:not(:focus-within, :active)) {
  position: absolute !important;
  clip-path: inset(50%) !important;
  overflow: hidden !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  border: 0 !important;
  white-space: nowrap !important;
}

.bd-root :where(button, select, input, [role="button"]):focus-visible {
  outline: 3px solid #38bdf8;
  outline-offset: 2px;
}

.bd-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-block-end: 0.75rem;
}

.bd-title-block h1 {
  margin: 0;
  font-size: clamp(1.1rem, 0.9rem + 1vw, 1.55rem);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bd-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.bd-top-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bd-btn, .bd-select, .bd-input {
  min-block-size: 32px;
  min-inline-size: 32px;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.bd-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #64748b;
}

.bd-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bd-btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.bd-btn-primary:hover:not(:disabled) {
  background: #0369a1;
}

.bd-btn-commit {
  background: #059669;
  border-color: #34d399;
  color: #ffffff;
  font-size: 0.92rem;
  padding: 0.45rem 1rem;
}

.bd-btn-commit:hover:not(:disabled) {
  background: #047857;
}

.bd-btn-warn {
  background: #b45309;
  border-color: #fbbf24;
  color: #ffffff;
}

.bd-hud-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 0.5rem;
  margin-block-end: 0.75rem;
}

.bd-metric-card {
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.bd-metric-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  display: block;
}

.bd-metric-value {
  font-size: clamp(1rem, 0.85rem + 0.6vw, 1.3rem);
  font-weight: 800;
  color: #f8fafc;
}

.bd-banner {
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  margin-block-end: 0.75rem;
  font-size: 0.86rem;
  line-height: 1.4;
  border-left: 4px solid #38bdf8;
  background: #0c192c;
}

.bd-banner-ok {
  border-left-color: #10b981;
  background: #06221c;
  color: #d1fae5;
}

.bd-banner-warn {
  border-left-color: #f59e0b;
  background: #271a07;
  color: #fef3c7;
}

.bd-banner-danger {
  border-left-color: #ef4444;
  background: #2a0d12;
  color: #fee2e2;
}

.bd-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@container dispatch-shell (min-width: 900px) {
  .bd-layout {
    grid-template-columns: minmax(480px, 1.25fr) minmax(350px, 0.95fr);
    align-items: start;
  }
}

.bd-panel {
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 0.8rem;
}

.bd-panel h2 {
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bd-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-end: 0.65rem;
}

.bd-tool-btn {
  flex: 1 1 auto;
  min-block-size: 34px;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #162235;
  color: #cbd5e1;
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.bd-tool-btn[aria-pressed="true"] {
  background: #0369a1;
  border-color: #38bdf8;
  color: #ffffff;
}

.bd-board-wrapper {
  width: 100%;
  overflow-x: auto;
}

.bd-svg-board {
  width: 100%;
  max-width: 680px;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  margin: 0 auto;
  background: #070e1a;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  user-select: none;
}

.bd-corridor-hit {
  cursor: pointer;
}

.bd-corridor-hit:hover .bd-corridor-hover-ring {
  opacity: 0.95;
}

.bd-inspector {
  margin-block-start: 0.65rem;
  padding: 0.65rem;
  background: #091322;
  border: 1px solid #264063;
  border-radius: 8px;
}

.bd-inspector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-start: 0.45rem;
}

.bd-action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-block-start: 0.65rem;
  padding-block-start: 0.65rem;
  border-top: 1px solid #1e3a5f;
}

.bd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

.bd-table caption {
  text-align: left;
  font-weight: 700;
  color: #cbd5e1;
  margin-block-end: 0.35rem;
  font-size: 0.85rem;
}

.bd-table th, .bd-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid #1e293b;
  text-align: left;
}

.bd-table th {
  color: #94a3b8;
  font-weight: 600;
  background: #091322;
}

.bd-badge {
  display: inline-block;
  padding: 0.12rem 0.42rem;
  border-radius: 4px;
  font-size: 0.71rem;
  font-weight: 700;
}

.bd-badge-lit {
  background: #064e3b;
  color: #6ee7b7;
  border: 1px solid #10b981;
}

.bd-badge-short {
  background: #78350f;
  color: #fde68a;
  border: 1px solid #f59e0b;
}

.bd-badge-out {
  background: #7f1d1d;
  color: #fecaca;
  border: 1px solid #ef4444;
}

.bd-forecast-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bd-forecast-item {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  background: #091322;
  border: 1px solid #1e3a5f;
  font-size: 0.79rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.bd-dialog {
  background: #0f1b2d;
  color: #f1f5f9;
  border: 1px solid #38bdf8;
  border-radius: 10px;
  padding: 1rem;
  max-width: 520px;
  width: 92vw;
}

.bd-dialog::backdrop {
  background: rgba(2, 6, 23, 0.78);
}

.bd-textarea {
  width: 100%;
  min-height: 110px;
  background: #070e1a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.78rem;
  margin-block: 0.5rem;
}
`;function Xe(e,t){const r=new Ye;let n=!!t?.debug,a="auto-smart",d=v({row:3,col:2},{row:3,col:3}),c=null,o;const x=Ze();t?.initialSeed!==void 0?o=Z(te("seeded",t.initialSeed)):x?o=x:o=Z(ue[0]);const A=document.createElement("style");A.textContent=ot,e.innerHTML="",e.appendChild(A);const y=document.createElement("div");y.className="bd-root",e.appendChild(y);const M=()=>{Ve(o)},V=(u,N)=>{d=u;const I=N??a,C=o.board.links[u];let W={ok:!1};if(I==="auto-smart")if(!C)W=oe(o,u,"standard");else if(C.status==="damaged")W=pe(o,u);else if(C.type==="standard")W=Q(o,u,"heavy");else if(C.type==="heavy")W=Q(o,u,"shielded");else{c={text:`Selected ${F(u)} (${p.LINKS[C.type].name}). Use inspector buttons below to reroute or modify.`,kind:"info"},$();return}else I==="place-standard"?W=C?Q(o,u,"standard"):oe(o,u,"standard"):I==="place-heavy"||I==="upgrade-heavy"?W=C?Q(o,u,"heavy"):oe(o,u,"heavy"):I==="place-shielded"||I==="upgrade-shielded"?W=C?Q(o,u,"shielded"):oe(o,u,"shielded"):I==="repair"?W=pe(o,u):I==="reroute"&&(W=He(o,u,{}));W.ok?(r.playRelayClick(),c={text:`STAGED: ${o.stagedActions[o.stagedActions.length-1]?.description??u} — Live flow preview updated!`,kind:"info"},M()):W.error&&(r.playBlackoutAlarm(),c={text:W.error,kind:"warn"}),$()},B=()=>{if(o.status!=="playing")return;const u=he(o),N=o.status;if(u.imminentStrikes.some(I=>I.outcome==="damaged")?r.playStormStrike():r.playTurnCommitHum(u.flow.totalUnmetMW>0),N==="lost")r.playBlackoutAlarm(),c={text:o.lossReason??"Grid blackout threshold exceeded.",kind:"error"};else if(N==="won")c={text:`VICTORY! All 12 storm turns survived with ${o.cityCumulativeUnmetMW}/${o.scenario.cityOutageThresholdMW} MW total city shortfall!`,kind:"info"};else{const I=u.imminentStrikes.filter(W=>W.outcome==="damaged").length,C=u.imminentStrikes.filter(W=>W.outcome==="deflected").length;c={text:`Turn ${u.turn} Committed: Delivered ${u.flow.totalDeliveredMW}/${u.flow.totalDemandMW} MW (+${u.projectedMaterialIncome} Mat). Storm strikes damaged ${I} link(s), deflected ${C}.`,kind:u.flow.totalUnmetMW>0?"warn":"info"}}M(),$()},re=()=>{const u=Fe(o);u.ok?(r.playUndoClick(),c={text:"Undid last staged action. Pre-action flow restored.",kind:"info"},M()):u.error&&(c={text:u.error,kind:"warn"}),$()},ne=()=>{ze(o).ok&&(r.playUndoClick(),c={text:"Reset all staged actions for this turn.",kind:"info"},M()),$()},ie=(u,N)=>{for(o=Z(ue[0]);o.status==="playing";){const I=u[o.turn]??[];for(const C of I){const W=v(C.from,C.to);C.kind==="place"?oe(o,W,C.linkType):C.kind==="upgrade"?Q(o,W,C.linkType):pe(o,W)}he(o)}c={text:`Executed "${N}": Status=${o.status.toUpperCase()} on Turn ${o.turn}, City Unmet=${o.cityCumulativeUnmetMW} MW.`,kind:o.status==="won"?"info":"error"},M(),$()},Re=()=>{const I=548/(p.GRID_SIZE-1),C=m=>46+m*I,W=m=>46+m*I,E=We(o.scenario,o.turn),ee=new Set(E.imminent.map(m=>m.edgeId)),s=new Set(E.turnPlus1.map(m=>m.edgeId)),i=new Set(E.turnPlus2.map(m=>m.edgeId)),l=new Set;for(const m of Object.values(o.preview.flow.diagnostics))for(const f of m.bottleneckEdgeIds)l.add(f);const h=[];for(let m=0;m<p.GRID_SIZE;m++)for(let f=0;f<p.GRID_SIZE;f++){const b=[];f+1<p.GRID_SIZE&&b.push({row:m,col:f+1}),m+1<p.GRID_SIZE&&b.push({row:m+1,col:f});for(const w of b){const k={row:m,col:f},_=w;if(ae(o.scenario,k)||ae(o.scenario,_))continue;const g=v(k,_),H=C(k.col),R=W(k.row),U=C(_.col),K=W(_.row),Y=(H+U)/2,X=(R+K)/2,O=o.board.links[g],j=o.preview.flow.edgeFlows[g],we=d===g,ve=ee.has(g),ke=s.has(g),Ie=i.has(g),Ae=l.has(g);let se="#1e293b",Me=3,Se="4,4";O&&(Se=O.status==="damaged"?"6,4":"",Me=O.type==="heavy"?8:O.type==="shielded"?6:5,O.status==="damaged"?se="#ef4444":j&&j.isSaturated?se="#f59e0b":j&&j.flowMW>0?se=O.type==="shielded"?"#38bdf8":"#10b981":se=O.type==="shielded"?"#0284c7":"#64748b");let de="";if(j&&j.flowMW>0&&O?.status==="intact"){const[be,ge]=j.fromNode.split(",").map(Number),[ce,De]=j.toNode.split(",").map(Number);De>ge?de="▶":De<ge?de="◀":ce>be?de="▼":ce<be&&(de="▲")}let le="";if(O){const be=p.LINKS[O.type].capacityMW,ge=j?j.flowMW:0,ce=O.type==="heavy"?"H":O.type==="shielded"?"S🛡":"L";O.status==="damaged"?le=`✖DMG (${ce})`:le=`${de}${ge}/${be}MW ${ce}`}else(ve||ke||Ie)&&(le=ve?"⚡NOW":ke?"⛈T+1":"🌧T+2");const Ee=ve?"⚡NOW":ke?"⛈T+1":Ie?"🌧T+2":"";h.push(`
            <g class="bd-corridor-hit" data-edge-id="${g}">
              <line x1="${H}" y1="${R}" x2="${U}" y2="${K}"
                stroke="${we?"#38bdf8":Ae?"#f59e0b":"transparent"}"
                stroke-width="${Me+8}"
                stroke-linecap="round"
                opacity="${we?"0.55":Ae?"0.45":"0"}"
                class="bd-corridor-hover-ring" />
              <line x1="${H}" y1="${R}" x2="${U}" y2="${K}"
                stroke="${se}"
                stroke-width="${Me}"
                ${Se?`stroke-dasharray="${Se}"`:""}
                stroke-linecap="round" />
              <line x1="${H}" y1="${R}" x2="${U}" y2="${K}"
                stroke="transparent"
                stroke-width="24" />
              ${le?`<rect x="${Y-28}" y="${X-9}" width="56" height="17" rx="4"
                       fill="${O?.status==="damaged"?"#450a0a":j?.isSaturated?"#451a03":"#091322"}"
                       stroke="${we?"#38bdf8":O?.status==="damaged"?"#ef4444":j?.isSaturated?"#f59e0b":"#334155"}"
                       stroke-width="1" />
                     <text x="${Y}" y="${X+3}" text-anchor="middle" fill="#f8fafc" font-size="8.2" font-weight="700">${le}</text>`:""}
              ${Ee&&O?`<rect x="${Y-18}" y="${X-21}" width="36" height="12" rx="3" fill="#7c2d12" stroke="#fb923c" stroke-width="1" />
                     <text x="${Y}" y="${X-12.5}" text-anchor="middle" fill="#ffedd5" font-size="7.5" font-weight="800">${Ee}</text>`:""}
            </g>
          `)}}const S=[],T=new Map(o.scenario.districts.map(m=>[z(m.row,m.col),m])),D=new Map(o.scenario.relays.map(m=>[z(m.row,m.col),m])),L=z(o.scenario.generator.row,o.scenario.generator.col);for(let m=0;m<p.GRID_SIZE;m++)for(let f=0;f<p.GRID_SIZE;f++){const b=z(m,f),w=C(f),k=W(m),_=ae(o.scenario,{row:m,col:f}),g=T.get(b),H=D.get(b);if(_){S.push(`
            <g>
              <rect x="${w-16}" y="${k-16}" width="32" height="32" rx="5" fill="#0f172a" stroke="#1e293b" stroke-dasharray="2,2" />
              <text x="${w}" y="${k+3}" text-anchor="middle" fill="#475569" font-size="8" font-weight="700">⛰/🌊</text>
            </g>
          `);continue}if(b===L){S.push(`
            <g>
              <rect x="${w-23}" y="${k-23}" width="46" height="46" rx="8" fill="#0284c7" stroke="#7dd3fc" stroke-width="2.5" />
              <text x="${w}" y="${k-6}" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="900">⚡GEN</text>
              <text x="${w}" y="${k+6}" text-anchor="middle" fill="#e0f2fe" font-size="8.5" font-weight="800">${o.preview.flow.generatorUsedMW}/${o.scenario.generator.outputMW}MW</text>
              <text x="${w}" y="${k+17}" text-anchor="middle" fill="#bae6fd" font-size="7.5">(${m},${f})</text>
            </g>
          `);continue}if(g){const R=o.preview.flow.districtAllocations[g.id],U=R.unmetMW===0,K=R.demandMW===0,Y=U?"#064e3b":R.deliveredMW>0?"#78350f":"#7f1d1d",X=U?"#34d399":R.deliveredMW>0?"#fbbf24":"#f87171",O=K?"IDLE":U?"LIT ✓":R.deliveredMW>0?`-${R.unmetMW}MW ⚠`:"OUT ✖";S.push(`
            <g>
              <rect x="${w-24}" y="${k-24}" width="48" height="48" rx="8" fill="${Y}" stroke="${X}" stroke-width="2.2" />
              <text x="${w}" y="${k-10}" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="900">P${g.priority} ${g.id} ${g.shortCode}</text>
              <text x="${w}" y="${k+2}" text-anchor="middle" fill="#f8fafc" font-size="9.5" font-weight="800">${R.deliveredMW}/${R.demandMW} MW</text>
              <text x="${w}" y="${k+14}" text-anchor="middle" fill="#fde68a" font-size="7.8" font-weight="800">${O}</text>
            </g>
          `);continue}if(H){const R=o.preview.flow.energizedRelayIds.includes(H.id);S.push(`
            <g>
              <circle cx="${w}" cy="${k}" r="18" fill="${R?"#1e3a5f":"#1e293b"}" stroke="${R?"#38bdf8":"#64748b"}" stroke-width="2" />
              <text x="${w}" y="${k-2}" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="800">◈${H.id}</text>
              <text x="${w}" y="${k+9}" text-anchor="middle" fill="#94a3b8" font-size="7.5">(${m},${f})</text>
            </g>
          `);continue}S.push(`
          <g>
            <circle cx="${w}" cy="${k}" r="9" fill="#0f172a" stroke="#334155" stroke-width="1.2" />
            <text x="${w}" y="${k+3}" text-anchor="middle" fill="#64748b" font-size="7">${m},${f}</text>
          </g>
        `)}return`
      <svg class="bd-svg-board" viewBox="0 0 640 640" role="img" aria-label="8 by 8 Power Grid Dispatch Board">
        <title>Port Argon 8x8 Power Grid Dispatch Board</title>
        ${h.join(`
`)}
        ${S.join(`
`)}
      </svg>
    `},$=()=>{const u=o.preview.flow,N=We(o.scenario,o.turn),I=Object.values(u.diagnostics).filter(i=>i.unmetMW>0);let C="";o.turn===1&&o.stagedActions.length<2?C=o.scenario.onboardingHintTurn1:o.turn===2&&I.length>0&&(C=o.scenario.onboardingHintTurn2);const W=I.length>0?I.map(i=>i.explanation).join(" | "):`ALL 5 DISTRICTS 100% POWERED (${u.totalDeliveredMW}/${u.totalDemandMW} MW delivered, 0 MW shortfall). Ready to Commit Turn ${o.turn}.`,E=o.board.links[d],ee=u.edgeFlows[d];y.innerHTML=`
      <header class="bd-header">
        <div class="bd-title-block">
          <h1>⚡ BLACKOUT DISPATCH <span style="font-size:0.78rem;font-weight:600;color:#38bdf8;">[${o.scenario.title}]</span></h1>
          <p class="bd-subtitle">${o.scenario.briefing}</p>
        </div>
        <nav class="bd-top-controls" aria-label="Scenario and System Controls">
          <label for="bd-scenario-select" class="bd-visually-hidden">Select Scenario</label>
          <select id="bd-scenario-select" class="bd-select">
            ${ue.map(i=>`<option value="${i.id}" ${o.scenario.id===i.id?"selected":""}>${i.title}</option>`).join("")}
            <option value="seeded" ${o.scenario.isSeeded?"selected":""}>Seeded Storm Mode (#${o.scenario.seed??p.DEFAULT_SEED})</option>
          </select>
          <button type="button" class="bd-btn" id="bd-btn-new-seed" title="Generate new seeded storm">🎲 Seed</button>
          <button type="button" class="bd-btn" id="bd-btn-restart">↻ Restart</button>
          <button type="button" class="bd-btn" id="bd-btn-save-modal">💾 Save/Load</button>
          <button type="button" class="bd-btn" id="bd-btn-mute" aria-pressed="${r.isMuted()}">${r.isMuted()?"🔇 Muted":"🔊 Audio"}</button>
          <button type="button" class="bd-btn" id="bd-btn-debug" aria-pressed="${n}"> 🛠 Debug [D]</button>
        </nav>
      </header>

      <main id="bd-main-content">
        <div class="bd-hud-strip" role="region" aria-label="Turn and Resource Telemetry">
          <div class="bd-metric-card">
            <span class="bd-metric-label">Storm Turn</span>
            <span class="bd-metric-value">${o.turn} / ${p.TOTAL_TURNS}</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Actions Left</span>
            <span class="bd-metric-value" style="color:${o.actionsRemaining>0?"#38bdf8":"#94a3b8"}">${o.actionsRemaining} / ${p.MAX_ACTIONS_PER_TURN}</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Material Reserve</span>
            <span class="bd-metric-value" style="color:#fbbf24">${o.materials} Mat <small style="font-size:0.75rem;color:#94a3b8">(+${o.preview.projectedMaterialIncome}/t)</small></span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Preview Grid Load</span>
            <span class="bd-metric-value" style="color:${u.totalUnmetMW===0?"#34d399":"#f87171"}">${u.totalDeliveredMW} / ${u.totalDemandMW} MW</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">City Outage Meter</span>
            <span class="bd-metric-value" style="color:${o.preview.projectedCityCumulativeUnmetMW>o.scenario.cityOutageThresholdMW?"#ef4444":"#e2e8f0"}">${o.preview.projectedCityCumulativeUnmetMW} / ${o.scenario.cityOutageThresholdMW} MW</span>
          </div>
        </div>

        ${C?`<div class="bd-banner bd-banner-warn" role="status"><strong>📋 DISPATCH ADVISORY:</strong> ${C}</div>`:""}

        <div class="bd-banner ${o.status==="lost"?"bd-banner-danger":I.length>0?"bd-banner-warn":"bd-banner-ok"}" role="status" aria-live="polite">
          <strong>${o.status==="lost"?"🚨 GRID FAILURE:":o.status==="won"?"🏆 STORM SURVIVED:":I.length>0?"⚠ PREVIEW BOTTLENECK DIAGNOSTIC:":"✓ PREVIEW FLOW DIAGNOSTIC:"}</strong>
          ${o.status==="lost"?o.lossReason:W}
          ${c?`<div style="margin-top:0.3rem;font-size:0.8rem;opacity:0.92;">↳ ${c.text}</div>`:""}
        </div>

        <div class="bd-layout">
          <section class="bd-panel" aria-labelledby="bd-grid-heading">
            <h2 id="bd-grid-heading">
              <span>8x8 Municipal Transmission Grid</span>
              <span style="font-size:0.76rem;font-weight:500;color:#94a3b8;">Click any corridor (r1,c1)↔(r2,c2) to stage work order</span>
            </h2>

            <div class="bd-toolbar" role="toolbar" aria-label="Dispatch Work Order Tools">
              <button type="button" class="bd-tool-btn" data-tool="auto-smart" aria-pressed="${a==="auto-smart"}">⚡ Smart Dispatch (Place/Repair/Upgrade)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-standard" aria-pressed="${a==="place-standard"}">➕ Standard Line (4MW · 10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-heavy" aria-pressed="${a==="place-heavy"}">➕/⬆ Heavy Trunk (8MW · 20m/10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-shielded" aria-pressed="${a==="place-shielded"}">🛡 Storm-Shielded (5MW · 25m/15m)</button>
              <button type="button" class="bd-tool-btn" data-tool="repair" aria-pressed="${a==="repair"}">🔧 Repair Damaged (5-10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="reroute" aria-pressed="${a==="reroute"}">⇄ Reroute Flow Gate (5m)</button>
            </div>

            <div class="bd-board-wrapper">
              ${Re()}
            </div>

            <div class="bd-inspector" aria-label="Selected Corridor Inspector">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.4rem;">
                <strong>Selected Corridor: <code>${F(d)}</code></strong>
                <span style="font-size:0.8rem;color:#94a3b8;">
                  ${E?`${p.LINKS[E.type].name} · Status: ${E.status.toUpperCase()} · Flow: ${ee?.flowMW??0}/${ee?.capacityMW??0} MW · Gate: ${E.directionConstraint.toUpperCase()}`:"Empty Corridor (No Link Installed)"}
                </span>
              </div>
              <div class="bd-inspector-actions">
                ${E?`
                      ${E.status==="damaged"?`<button type="button" class="bd-btn bd-btn-warn" data-direct-action="repair">🔧 Repair ${p.LINKS[E.type].name} (${p.LINKS[E.type].repairCostMat} Mat)</button>`:""}
                      ${E.type!=="heavy"?`<button type="button" class="bd-btn bd-btn-primary" data-direct-action="upgrade-heavy">⬆ Upgrade to Heavy Trunk 8MW (${ye(E.type,"heavy",E.status==="damaged")} Mat)</button>`:""}
                      ${E.type!=="shielded"?`<button type="button" class="bd-btn" data-direct-action="upgrade-shielded">🛡 Upgrade to Storm-Shielded 5MW (${ye(E.type,"shielded",E.status==="damaged")} Mat)</button>`:""}
                      <button type="button" class="bd-btn" data-direct-action="reroute">⇄ Cycle Flow Gate (${p.REROUTE_COST_MAT} Mat)</button>
                    `:`
                      <button type="button" class="bd-btn bd-btn-primary" data-direct-action="place-standard">Place Standard (4MW · 10 Mat)</button>
                      <button type="button" class="bd-btn" data-direct-action="place-heavy">Place Heavy Trunk (8MW · 20 Mat)</button>
                      <button type="button" class="bd-btn" data-direct-action="place-shielded">Place Storm-Shielded (5MW · 25 Mat)</button>
                    `}
              </div>
            </div>

            <div class="bd-action-bar">
              <div style="display:flex;gap:0.45rem;flex-wrap:wrap;align-items:center;">
                <button type="button" class="bd-btn" id="bd-btn-undo" ${o.stagedActions.length===0?"disabled":""}>↩ Undo Action (${o.stagedActions.length})</button>
                <button type="button" class="bd-btn" id="bd-btn-reset-turn" ${o.stagedActions.length===0?"disabled":""}>⟲ Reset Turn</button>
              </div>
              <button type="button" class="bd-btn bd-btn-commit" id="bd-btn-commit" ${o.status!=="playing"?"disabled":""}>
                ✓ Commit Turn ${o.turn} (${u.totalDeliveredMW}/${u.totalDemandMW} MW)
              </button>
            </div>
          </section>

          <div style="display:flex;flex-direction:column;gap:0.85rem;">
            <section class="bd-panel" aria-labelledby="bd-districts-heading">
              <h2 id="bd-districts-heading">5-District Priority & Demand Schedule</h2>
              <table class="bd-table">
                <caption>Deterministic allocation follows strict Priority Order (P1 → P5)</caption>
                <thead>
                  <tr>
                    <th scope="col">Pri</th>
                    <th scope="col">District</th>
                    <th scope="col">Turn ${o.turn}</th>
                    <th scope="col">Turn ${Math.min(p.TOTAL_TURNS,o.turn+1)}</th>
                    <th scope="col">Status</th>
                    <th scope="col">Unmet Limit</th>
                  </tr>
                </thead>
                <tbody>
                  ${o.scenario.districts.map(i=>{const l=u.districtAllocations[i.id],h=o.districts[i.id],S=i.demandCurve[Math.min(p.TOTAL_TURNS-1,o.turn)],T=h.cumulativeUnmetMW+l.unmetMW,D=l.unmetMW===0?"bd-badge-lit":l.deliveredMW>0?"bd-badge-short":"bd-badge-out",L=l.demandMW===0?"IDLE ✓":l.unmetMW===0?"LIT ✓":l.deliveredMW>0?`SHORT -${l.unmetMW}MW ⚠`:`OUTAGE -${l.unmetMW}MW ✖`;return`
                        <tr>
                          <th scope="row">P${i.priority}</th>
                          <td><strong>${i.id}</strong> ${i.name} <small style="color:#94a3b8;">(${i.row},${i.col})</small></td>
                          <td><strong>${l.deliveredMW}/${l.demandMW} MW</strong></td>
                          <td>${S} MW</td>
                          <td><span class="bd-badge ${D}">${L}</span></td>
                          <td style="color:${T>i.unmetLimitMW?"#ef4444":"#cbd5e1"}">${T} / ${i.unmetLimitMW} MW</td>
                        </tr>
                      `}).join("")}
                </tbody>
              </table>
            </section>

            <section class="bd-panel" aria-labelledby="bd-forecast-heading">
              <h2 id="bd-forecast-heading">2-Turn Weather Radar Forecast</h2>
              <ul class="bd-forecast-list" role="list">
                ${N.imminent.length===0?`<li class="bd-forecast-item"><span><strong>Turn ${o.turn} (Imminent):</strong> Clear skies — no strikes this turn</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`:N.imminent.map(i=>`
                        <li class="bd-forecast-item" style="border-color:#f59e0b;">
                          <span><strong>⚡ Turn ${i.turn} (Resolves Now):</strong> ${i.label} at <code>${F(i.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${i.severity.toUpperCase()}</span>
                        </li>`).join("")}
                ${N.turnPlus1.length===0?`<li class="bd-forecast-item"><span><strong>Turn ${o.turn+1} (T+1):</strong> No strikes forecast</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`:N.turnPlus1.map(i=>`
                        <li class="bd-forecast-item">
                          <span><strong>⛈ Turn ${i.turn} (T+1):</strong> ${i.label} at <code>${F(i.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${i.severity.toUpperCase()}</span>
                        </li>`).join("")}
                ${N.turnPlus2.length===0?`<li class="bd-forecast-item"><span><strong>Turn ${o.turn+2} (T+2):</strong> No strikes forecast</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`:N.turnPlus2.map(i=>`
                        <li class="bd-forecast-item">
                          <span><strong>🌧 Turn ${i.turn} (T+2):</strong> ${i.label} at <code>${F(i.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${i.severity.toUpperCase()}</span>
                        </li>`).join("")}
              </ul>
            </section>

            <section class="bd-panel" aria-labelledby="bd-legend-heading">
              <h2 id="bd-legend-heading">Transmission Link Specs & Tradeoffs</h2>
              <ul class="bd-forecast-list" role="list">
                <li class="bd-forecast-item">
                  <span><strong>Standard Line (L):</strong> 4 MW Capacity · Build 10 Mat · Repair 5 Mat</span>
                  <span style="color:#94a3b8;">Vulnerable to Wind</span>
                </li>
                <li class="bd-forecast-item">
                  <span><strong>Heavy Trunk (H):</strong> 8 MW Capacity · Build 20 Mat · Upgrade 10 Mat</span>
                  <span style="color:#34d399;">High Throughput</span>
                </li>
                <li class="bd-forecast-item">
                  <span><strong>Storm-Shielded (S🛡):</strong> 5 MW Capacity · Build 25 Mat · Upgrade 15 Mat</span>
                  <span style="color:#38bdf8;">Immune to Wind</span>
                </li>
              </ul>
            </section>

            ${n?`
                  <section class="bd-panel" aria-labelledby="bd-debug-heading" style="border-color:#a855f7;">
                    <h2 id="bd-debug-heading" style="color:#e9d5ff;">🛠 Solver & Telemetry Debug Panel</h2>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;">
                      <button type="button" class="bd-btn" id="bd-dbg-trunk">Run Strategy A: Efficient Trunk (Win)</button>
                      <button type="button" class="bd-btn" id="bd-dbg-loop">Run Strategy B: Redundant Loop (Win)</button>
                      <button type="button" class="bd-btn bd-btn-warn" id="bd-dbg-loss">Run Neglect Script (Blackout Loss)</button>
                    </div>
                    <div style="font-family:monospace;font-size:0.74rem;color:#cbd5e1;">
                      DAG Verified (No Cycles): ${!u.hasDirectedCycle} | Links: ${Object.keys(o.board.links).length} | Energized Relays: ${u.energizedRelayIds.join(", ")||"None"}
                    </div>
                  </section>
                `:""}
          </div>
        </div>
      </main>

      <dialog id="bd-save-dialog" class="bd-dialog" aria-labelledby="bd-dialog-title">
        <h2 id="bd-dialog-title" style="margin-top:0;">Save / Export / Import Dispatch State</h2>
        <p style="font-size:0.82rem;color:#94a3b8;">Copy this JSON snapshot to back up your mid-turn dispatch state or paste a saved payload below.</p>
        <label for="bd-save-textarea" class="bd-visually-hidden">Serialized Game State JSON</label>
        <textarea id="bd-save-textarea" class="bd-textarea">${xe(o)}</textarea>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;flex-wrap:wrap;">
          <button type="button" class="bd-btn" id="bd-btn-clear-save">Clear LocalStorage</button>
          <button type="button" class="bd-btn bd-btn-primary" id="bd-btn-import-save">Import JSON</button>
          <button type="button" class="bd-btn" id="bd-btn-close-dialog">Close</button>
        </div>
      </dialog>
    `,y.querySelector("#bd-scenario-select")?.addEventListener("change",i=>{const l=i.target.value,h=l==="seeded"?te("seeded",o.scenario.seed??p.DEFAULT_SEED):te(l);o=Z(h),c={text:`Loaded ${h.title}.`,kind:"info"},M(),$()}),y.querySelector("#bd-btn-new-seed")?.addEventListener("click",()=>{const i=(o.scenario.seed??p.DEFAULT_SEED)+137>>>0;o=Z(te("seeded",i)),c={text:`Generated deterministic Seeded Storm #${i}.`,kind:"info"},M(),$()}),y.querySelector("#bd-btn-restart")?.addEventListener("click",()=>{o=Z(o.scenario),c={text:`Restarted ${o.scenario.title} at Turn 1.`,kind:"info"},M(),$()}),y.querySelector("#bd-btn-mute")?.addEventListener("click",()=>{r.toggleMute(),$()}),y.querySelector("#bd-btn-debug")?.addEventListener("click",()=>{n=!n,$()});const s=y.querySelector("#bd-save-dialog");y.querySelector("#bd-btn-save-modal")?.addEventListener("click",()=>{s&&typeof s.showModal=="function"&&s.showModal()}),y.querySelector("#bd-btn-close-dialog")?.addEventListener("click",()=>{s?.close()}),y.querySelector("#bd-btn-clear-save")?.addEventListener("click",()=>{Je(),s?.close(),c={text:"Cleared saved localStorage state.",kind:"info"},$()}),y.querySelector("#bd-btn-import-save")?.addEventListener("click",()=>{const i=y.querySelector("#bd-save-textarea")?.value;if(!i)return;const l=Ce(i);l?(o=l,M(),s?.close(),c={text:`Imported save state at Turn ${o.turn}.`,kind:"info"},$()):(c={text:"Invalid or corrupted save JSON — current state preserved.",kind:"error"},s?.close(),$())}),y.querySelectorAll("[data-tool]").forEach(i=>{i.addEventListener("click",()=>{a=i.getAttribute("data-tool"),$()})}),y.querySelectorAll("[data-edge-id]").forEach(i=>{i.addEventListener("click",()=>{const l=i.getAttribute("data-edge-id");l&&V(l)})}),y.querySelectorAll("[data-direct-action]").forEach(i=>{i.addEventListener("click",()=>{const l=i.getAttribute("data-direct-action");V(d,l)})}),y.querySelector("#bd-btn-undo")?.addEventListener("click",re),y.querySelector("#bd-btn-reset-turn")?.addEventListener("click",ne),y.querySelector("#bd-btn-commit")?.addEventListener("click",B),y.querySelector("#bd-dbg-trunk")?.addEventListener("click",()=>ie(je,"Efficient Trunk Strategy")),y.querySelector("#bd-dbg-loop")?.addEventListener("click",()=>ie(qe,"Redundant Loop Strategy")),y.querySelector("#bd-dbg-loss")?.addEventListener("click",()=>ie(Ke,"Neglect Failure Script"))},J=u=>{u.target instanceof HTMLInputElement||u.target instanceof HTMLTextAreaElement||u.target instanceof HTMLSelectElement||(u.key==="d"||u.key==="D"?(n=!n,$()):(u.key==="z"||u.key==="Z")&&re())};return window.addEventListener("keydown",J),$(),{destroy(){window.removeEventListener("keydown",J),r.destroy(),e.innerHTML=""},getState(){return o},restartWithSeed(u){o=Z(te("seeded",u)),M(),$()},toggleDebug(u){n=u!==void 0?u:!n,$()}}}const Qe={id:"02-blackout-dispatch",number:2,title:"Blackout Dispatch",subtitle:"12-Turn Power Grid Storm Logistics Puzzle",genre:"Turn-Based Network Flow & Infrastructure Tactics",primaryReference:"Mini Metro / Into the Breach",supportingReference:"Factorio Power Grid & Max-Flow Min-Cut Dispatch",oneSentenceLoop:"Inspect the 2-turn storm radar and priority district demands, stage up to 2 link actions with live deterministic flow preview and free undo, and commit each turn to keep 5 districts powered across a 12-turn storm.",shortGoal:"Connect St. Jude Hospital (D1) and Harbor Waterworks (D2) on Turn 1 and resolve their shared 6 MW capacity bottleneck on Turn 2.",longGoal:"Survive all 12 storm turns across Harbor Squall, Twin Ridge Gale, Category-4 Supercell, and Seeded Storm modes using either Single Trunk Efficiency or Redundant Storm Loop topologies.",controlsSummary:"Click any orthogonal 8x8 corridor to Place, Upgrade, Repair, or Reroute links; [Z] Undo staged action; [D] Toggle Debug Solver Panel.",accentColor:"#38bdf8"};function et(e,t){const r=Xe(e,t);return{destroy(){r.destroy()},getStateSnapshot(){return r.getState()},restartWithSeed(n){r.restartWithSeed(n)},toggleDebug(n){r.toggleDebug(n)}}}const rt={metadata:Qe,mountGame:et},nt=Object.freeze(Object.defineProperty({__proto__:null,CONFIG:p,DispatchAudioEngine:Ye,HANDCRAFTED_SCENARIOS:ue,SCENARIO_1_EFFICIENT_TRUNK_SCRIPT:je,SCENARIO_1_HARBOR_SQUALL:fe,SCENARIO_1_NEGLECT_LOSS_SCRIPT:Ke,SCENARIO_1_REDUNDANT_LOOP_SCRIPT:qe,SCENARIO_2_TWIN_RIDGE_GALE:Ue,SCENARIO_3_CAT4_SUPERCELL:Oe,clearSavedGameState:Je,cloneBoard:G,commitTurn:he,coordKey:z,createBlackoutDispatchUI:Xe,createInitialGameState:Z,createSeededRng:Ne,default:rt,deserializeGameState:Ce,formatEdgeLabel:F,generateSeededScenario:_e,getForecastStrikes:We,getScenarioById:te,getUpgradeCostMat:ye,isBlockedCoord:ae,isOrthogonallyAdjacent:Le,loadGameStateFromStorage:Ze,makeEdgeId:v,metadata:Qe,mountGame:et,parseCoordKey:me,parseEdgeId:P,previewTurnOutcome:q,resetStagedActions:ze,resolvePowerFlow:Pe,resolveStormStrikesForTurn:Ge,runStrategyScript:tt,saveGameStateToStorage:Ve,serializeGameState:xe,stagePlaceLink:oe,stageRepairLink:pe,stageRerouteLink:He,stageUpgradeLink:Q,undoLastStagedAction:Fe},Symbol.toStringTag,{value:"Module"}));export{nt as g,et as m};
