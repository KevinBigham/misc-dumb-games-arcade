import{_ as $}from"./preload-helper-Ct5FWWRu.js";class V{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const o=window.AudioContext||window.webkitAudioContext;if(o)try{this.ctx=new o}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(o){this.muted=o}isMuted(){return this.muted}playTone(o,n,r,t="sine",c=.08){const a=this.ensureContext();if(a)try{const d=a.currentTime,i=a.createOscillator(),p=a.createGain();i.type=t,i.frequency.setValueAtTime(o,d),i.frequency.exponentialRampToValueAtTime(Math.max(20,n),d+r),p.gain.setValueAtTime(.001,d),p.gain.linearRampToValueAtTime(c,d+.015),p.gain.exponentialRampToValueAtTime(1e-4,d+r),i.connect(p),p.connect(a.destination),i.start(d),i.stop(d+r+.02)}catch{}}playEmp(){this.playTone(620,75,.28,"sawtooth",.1)}playDecoy(){this.playTone(340,680,.16,"triangle",.08)}playBlink(){this.playTone(480,960,.12,"sine",.09)}playGateOpen(){this.playTone(440,660,.14,"triangle",.07)}playHackComplete(){this.playTone(523.25,1046.5,.22,"triangle",.1)}playCoreGrabbed(){this.playTone(587.33,1174.66,.3,"sine",.12)}playRewind(){this.playTone(880,220,.26,"sawtooth",.09)}playAlert(){this.playTone(290,210,.14,"square",.06)}playStageClear(){this.playTone(440,880,.35,"triangle",.12)}destroy(){if(this.ctx){try{this.ctx.close()}catch{}this.ctx=null}}}const l={GAME_ID:"12-chrono-syndicate",GAME_NUMBER:12,TITLE:"Chrono-Syndicate: The 15-Second Heist",SUBTITLE:"4D Cooperative Time-Loop Tactical Heist & Ghost-Echo Orchestrator",ACCENT_COLOR:"#10b981",SECONDARY_COLOR:"#38bdf8",TERTIARY_COLOR:"#f59e0b",DANGER_COLOR:"#f43f5e",DEFAULT_SEED:20261108,FIXED_STEP_MS:50,ARENA_WIDTH:760,ARENA_HEIGHT:440,TIMELINE_DURATION_TICKS:300,MAX_ECHOS_PER_STAGE:4,AGENT_RADIUS:13,AGENT_BASE_SPEED:235,AGENT_DASH_SPEED:460,AGENT_MAX_ENERGY:100,AGENT_START_ENERGY:100,EMP_COST:30,EMP_RADIUS:118,EMP_STUN_TICKS:65,DECOY_COST:25,DECOY_DURATION_TICKS:90,DECOY_ATTRACT_RADIUS:190,BLINK_COST:22,BLINK_DISTANCE:105,BLINK_COOLDOWN_TICKS:16,SWITCH_INTERACT_RADIUS:34,TERMINAL_HACK_RADIUS:38,VAULT_EXTRACT_RADIUS:36,EXTRACTION_PAD_RADIUS:42,PARADOX_MAX_INSTABILITY:100,SIGHT_INSTABILITY_PER_TICK:3.2,LASER_INSTABILITY_HIT:42,TEMPORAL_RESONANCE_RADIUS:68,SCORE_TERMINAL_HACKED:450,SCORE_CORE_EXTRACTED:1200,SCORE_STAGE_CLEAR_BASE:1800,SCORE_UNUSED_ECHO_BONUS:600,SCORE_TICK_REMAINING_BONUS:8,SCORE_PARADOX_FREE_BONUS:750,TOTAL_STAGES:4,STORAGE_KEY:"argon_game12_chrono_syndicate_v1",SCHEMA_VERSION:1},Y=[{id:"PHASE_CAPACITOR",name:"Phase Capacitor Mk.IV",tagline:"+35 Max Energy & -20% Blink Cost",description:"Expands your rig capacitor to 135 Energy and reduces Phase-Blink cost so you can chain wall-bypasses.",badgeColor:"#38bdf8"},{id:"RESONANCE_COIL",name:"4D Resonance Coil",tagline:"+50% Hack Speed & Echo Synergy Shield",description:"Terminals decrypt 50% faster, and standing within 70px of any past Ghost Echo drains Timeline Instability.",badgeColor:"#10b981"},{id:"GHOST_OVERDRIVE",name:"Chrono-Boots Overdrive",tagline:"+22% Movement Speed & Extended Plate Hold",description:"Boosts sprint velocity by 22% and causes pressure plates to stay open for 2.5s after an agent steps off.",badgeColor:"#f59e0b"},{id:"OPTIC_CLOAK",name:"Refractive Holo-Mesh",tagline:"-45% Sentinel Detection Rate & Longer EMP",description:"Bends Panopticon sightcones, reducing Paradox Instability buildup by 45% and extending EMP Stun duration by 2s.",badgeColor:"#a855f7"}],k={OMNISCIENT_ARCHITECT:{id:"OMNISCIENT_ARCHITECT",title:"OMNISCIENT 4D ARCHITECT",subtitle:"Supreme Master of Simultaneous Causality",summary:"You choreographed past and present selves like a single four-dimensional organism—cracking every quantum vault under par with surgical precision.",accentColor:"#10b981"},FOURTH_DIMENSIONAL_PHANTOM:{id:"FOURTH_DIMENSIONAL_PHANTOM",title:"FOURTH-DIMENSIONAL PHANTOM",subtitle:"Ghost in the Panopticon Clockwork",summary:"Your Echoes held every laser gate and stunned every sentinel right on cue. Security logs show four infiltrators, yet the biometric scanner only ever read one heartbeat.",accentColor:"#38bdf8"},TEMPORAL_TACTICIAN:{id:"TEMPORAL_TACTICIAN",title:"TEMPORAL HEIST TACTICIAN",subtitle:"Veteran of the 15-Second Loop",summary:"Through clever Rewinds, Decoys, and EMP bursts, you bent the 15-second horizon to your will and escaped with the Chronos Core.",accentColor:"#f59e0b"},LOOP_OPERATIVE:{id:"LOOP_OPERATIVE",title:"CAUSALITY LOOP OPERATIVE",subtitle:"Survivor of the Temporal Maelstrom",summary:"Alarms blared and timelines fractured, but your squad of Echoes brute-forced the vault locks before reality collapsed.",accentColor:"#f43f5e"}},L=[{stageNumber:1,codeName:"SECTOR I // BIFURCATED VAULT",title:"The Twin-Key Atrium",subtitle:"Learn 2-Echo Co-Op: Hold the North Plate in Loop 1, Loot the South Vault in Loop 2",architectBriefing:"Welcome to Chrono-Syndicate. No single operative can hold the North Pressure Plate AND cross the South Laser Gate in 15 seconds. Use Loop 1 to hold Plate A & hack Terminal Alpha, press [R] to Rewind & Spawn Echo #2, and walk straight through the gate your past self opens!",tacticalHint:"TIP: Or press [E] to drop a Holo-Decoy onto Plate A—Holo-Decoys weigh down pressure plates AND distract sentinels!",parEchoCount:2,spawnPos:{x:76,y:220},extractionPos:{x:84,y:365},vaultPos:{x:668,y:220},walls:[{x:250,y:0,w:22,h:145},{x:250,y:295,w:22,h:145},{x:510,y:0,w:22,h:165},{x:510,y:275,w:22,h:165}],switches:[{id:"SW_ALPHA",label:"PLATE A (Vault Gate)",x:165,y:86,color:"#38bdf8",targetGateId:"GATE_VAULT_1",stayOpenTicks:40}],laserGates:[{id:"GATE_VAULT_1",label:"LASER GATE A",x1:521,y1:165,x2:521,y2:275,color:"#38bdf8"}],terminals:[{id:"TERM_1",label:"CIPHER NODE α",x:380,y:95,hackTicksRequired:24,unlocksVault:!0}],sentinels:[{id:"SENT_1",name:"Aegis Drone 01",waypoints:[{x:380,y:155},{x:380,y:345}],speed:115,visionRange:145,visionAngleRad:.95}]},{stageNumber:2,codeName:"SECTOR II // CROSSFIRE GALLERY",title:"The Dual-Lock Faraday Cage",subtitle:"2 Cipher Terminals & Interlocking Laser Corridors",architectBriefing:"The Faraday Vault requires BOTH Cipher Nodes (North & South) decrypted within the same 15-second window. Send Echo #1 North to hack Node Alpha & hold Switch A; send Echo #2 South to hack Node Beta, grab the Chronos Core, and Blink to Extraction!",tacticalHint:"TIP: Press [Q] or [1] near any Sentinel to trigger an EMP Blast (stuns drones for 3.2s and disables nearby lasers)!",parEchoCount:2,spawnPos:{x:72,y:220},extractionPos:{x:72,y:78},vaultPos:{x:675,y:220},walls:[{x:215,y:110,w:22,h:220},{x:470,y:0,w:22,h:155},{x:470,y:285,w:22,h:155}],switches:[{id:"SW_NORTH",label:"PLATE A (Inner Gate)",x:345,y:74,color:"#38bdf8",targetGateId:"GATE_VAULT_2",stayOpenTicks:45},{id:"SW_SOUTH",label:"PLATE B (Shortcut)",x:345,y:366,color:"#f59e0b",targetGateId:"GATE_SHORTCUT_2",stayOpenTicks:55}],laserGates:[{id:"GATE_VAULT_2",label:"VAULT LASER A",x1:481,y1:155,x2:481,y2:285,color:"#38bdf8"},{id:"GATE_SHORTCUT_2",label:"NORTH SHORTCUT B",x1:226,y1:0,x2:226,y2:110,color:"#f59e0b"}],terminals:[{id:"TERM_2A",label:"CIPHER NODE α",x:345,y:140,hackTicksRequired:24,unlocksVault:!0},{id:"TERM_2B",label:"CIPHER NODE β",x:345,y:300,hackTicksRequired:24,unlocksVault:!0}],sentinels:[{id:"SENT_2A",name:"Hunter-Seeker Alpha",waypoints:[{x:290,y:220},{x:435,y:220}],speed:135,visionRange:150,visionAngleRad:.9},{id:"SENT_2B",name:"Vault Warden Beta",waypoints:[{x:585,y:110},{x:585,y:330}],speed:130,visionRange:145,visionAngleRad:.9}]},{stageNumber:3,codeName:"SECTOR III // TESSERACT ROTUNDA",title:"The Panopticon Gyroscope",subtitle:"3 Rotating Sentinels & Synchronized Dual-Gate Vault",architectBriefing:"Three overlapping Sentinel patrols sweep the central rotunda. Use Echo #1 to draw aggro with a Holo-Decoy and hack the West & East Ciphers, while your subsequent timeline slips through the center corridor to extract the Core!",tacticalHint:"TIP: Use [Space] Phase-Blink to teleport 105px straight across laser beams or thin security bulkheads without triggering alarms!",parEchoCount:3,spawnPos:{x:68,y:370},extractionPos:{x:68,y:74},vaultPos:{x:678,y:220},walls:[{x:185,y:85,w:20,h:270},{x:375,y:0,w:20,h:135},{x:375,y:305,w:20,h:135},{x:545,y:75,w:20,h:100},{x:545,y:265,w:20,h:100}],switches:[{id:"SW_3A",label:"PLATE A (Center Gate)",x:280,y:74,color:"#38bdf8",targetGateId:"GATE_3_CENTER",stayOpenTicks:48},{id:"SW_3B",label:"PLATE B (Vault Gate)",x:465,y:368,color:"#10b981",targetGateId:"GATE_3_VAULT",stayOpenTicks:48}],laserGates:[{id:"GATE_3_CENTER",label:"ROTUNDA LASER A",x1:385,y1:135,x2:385,y2:305,color:"#38bdf8"},{id:"GATE_3_VAULT",label:"INNER VAULT LASER B",x1:555,y1:175,x2:555,y2:265,color:"#10b981"}],terminals:[{id:"TERM_3A",label:"CIPHER NODE α",x:280,y:365,hackTicksRequired:24,unlocksVault:!0},{id:"TERM_3B",label:"CIPHER NODE β",x:465,y:78,hackTicksRequired:24,unlocksVault:!0}],sentinels:[{id:"SENT_3A",name:"West Corridor Drone",waypoints:[{x:280,y:135},{x:280,y:310}],speed:145,visionRange:148,visionAngleRad:.92},{id:"SENT_3B",name:"East Rotunda Drone",waypoints:[{x:465,y:140},{x:465,y:305}],speed:150,visionRange:148,visionAngleRad:.92},{id:"SENT_3C",name:"Sanctum Sentinel",waypoints:[{x:618,y:95},{x:618,y:345}],speed:140,visionRange:140,visionAngleRad:.88}]},{stageNumber:4,codeName:"SECTOR IV // GRAND OMEGA SINGULARITY",title:"The Chronos Crown Sanctorum",subtitle:"Final 4D Heist: 3 Quantum Ciphers, 3 Interlocked Laser Gates & The Omega Warden",architectBriefing:"This is the ultimate 15-second heist. Three Cipher Terminals guard the Omega Singularity Core behind triple-layered security gates. Orchestrate your Ghost Echoes across all 4 timelines—disable the Warden, open the gates in sequence, seize the Crown Core, and extract before T=15.0s!",tacticalHint:"MASTER TIP: Standing near any of your Ghost Echoes triggers Temporal Resonance, boosting score and stabilizing the timeline!",parEchoCount:3,spawnPos:{x:66,y:220},extractionPos:{x:66,y:70},vaultPos:{x:685,y:220},walls:[{x:175,y:0,w:20,h:150},{x:175,y:290,w:20,h:150},{x:355,y:95,w:20,h:250},{x:535,y:0,w:20,h:155},{x:535,y:285,w:20,h:155}],switches:[{id:"SW_4A",label:"PLATE A (West Gate)",x:115,y:375,color:"#38bdf8",targetGateId:"GATE_4A",stayOpenTicks:50},{id:"SW_4B",label:"PLATE B (Sanctum Gate)",x:445,y:68,color:"#f59e0b",targetGateId:"GATE_4B",stayOpenTicks:50}],laserGates:[{id:"GATE_4A",label:"WEST GATE A",x1:185,y1:150,x2:185,y2:290,color:"#38bdf8"},{id:"GATE_4B",label:"SANCTUM GATE B",x1:545,y1:155,x2:545,y2:285,color:"#f59e0b"}],terminals:[{id:"TERM_4A",label:"OMEGA CIPHER α",x:270,y:74,hackTicksRequired:22,unlocksVault:!0},{id:"TERM_4B",label:"OMEGA CIPHER β",x:270,y:366,hackTicksRequired:22,unlocksVault:!0},{id:"TERM_4C",label:"OMEGA CIPHER γ",x:445,y:366,hackTicksRequired:22,unlocksVault:!0}],sentinels:[{id:"SENT_4A",name:"Outer Bastion Drone",waypoints:[{x:270,y:145},{x:270,y:295}],speed:155,visionRange:150,visionAngleRad:.92},{id:"SENT_4B",name:"Inner Bastion Drone",waypoints:[{x:445,y:120},{x:445,y:310}],speed:155,visionRange:150,visionAngleRad:.92},{id:"SENT_4C",name:"Omega Chronos Warden",waypoints:[{x:615,y:95},{x:615,y:345}],speed:165,visionRange:155,visionAngleRad:.95}]}];class P{seed;state;calls;constructor(o=20261108,n,r=0){const t=(Math.floor(Math.abs(o))||20261108)>>>0;this.seed=t,this.state=n!==void 0?n>>>0:t,this.calls=r}next(){this.calls+=1;let o=this.state+=1831565813;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),this.state=o>>>0,((o^o>>>14)>>>0)/4294967296}nextRange(o,n){return o+this.next()*(n-o)}nextInt(o,n){return Math.floor(this.nextRange(o,n+1))}snapshot(){return{seed:this.seed,state:this.state,calls:this.calls}}static fromSnapshot(o){return new P(o.seed,o.state,o.calls)}}const U=["#38bdf8","#f59e0b","#a855f7","#f472b6"];function R(e){const o=Math.max(0,Math.min(L.length-1,e-1));return L[o]}function O(e=l.DEFAULT_SEED,o=1,n=[],r=0,t=[]){const c=new P(e+o*7919),a=R(o),i=n.includes("PHASE_CAPACITOR")?l.AGENT_MAX_ENERGY+35:l.AGENT_MAX_ENERGY,p=a.sentinels.map(u=>{const h=u.waypoints[0],b=u.waypoints[1]??h,E=c.nextRange(.05,.35),x=h.x+(b.x-h.x)*E,A=h.y+(b.y-h.y)*E,S=Math.atan2(b.y-h.y,b.x-h.x);return{id:u.id,name:u.name,waypoints:u.waypoints.map(f=>({...f})),currentWaypointIdx:1%u.waypoints.length,x,y:A,facingRad:S,speed:u.speed,visionRange:u.visionRange,visionAngleRad:u.visionAngleRad,stunnedTicks:0,alerted:!1,distractedByDecoyId:null}});return{seed:(Math.floor(Math.abs(e))||l.DEFAULT_SEED)>>>0,rngState:c.snapshot(),status:"PLAYING",stageNumber:a.stageNumber,loopNumber:1,tick:0,totalTicksElapsed:0,score:r,paradoxInstability:0,peakInstabilityThisStage:0,temporalResonanceActive:!1,resonanceBonusAccumulated:0,installedMods:[...n],agent:{x:a.spawnPos.x,y:a.spawnPos.y,vx:0,vy:0,moveDirX:0,moveDirY:0,targetPoint:null,facingRad:0,energy:i,maxEnergy:i,blinkCooldownTicks:0,triggeredVerbThisTick:null},currentLoopRecording:[],recordedEchoes:[],activeGhosts:[],switches:a.switches.map(u=>({...u,pressed:!1,holdTimerTicks:0,activatedByLabel:null})),laserGates:a.laserGates.map(u=>({...u,isOpen:!1,empDisabledTicks:0})),terminals:a.terminals.map(u=>({...u,progressTicks:0,hacked:!1,hackedByLabel:null,hackedAtTick:null})),sentinels:p,decoys:[],empPulses:[],vaultUnlocked:!1,coreCarrierLabel:null,corePos:{x:a.vaultPos.x,y:a.vaultPos.y},coreExtracted:!1,stageSummaries:t.map(u=>({...u})),telemetryLog:[{tick:0,loopNumber:1,actor:"ARCHITECT",kind:"REWIND_COMMITTED",message:`Timeline Loop #1 initialized in ${a.codeName}.`}],events:[],finalRankId:null}}function N(e){return JSON.parse(JSON.stringify(e))}function D(e){const o=R(e.stageNumber),n=new P(e.seed+e.stageNumber*7919);e.tick=0,e.paradoxInstability=Math.max(0,e.paradoxInstability*.25),e.temporalResonanceActive=!1;const t=e.installedMods.includes("PHASE_CAPACITOR")?l.AGENT_MAX_ENERGY+35:l.AGENT_MAX_ENERGY,c=(e.loopNumber-1)*Math.PI/2,a=e.loopNumber>1?14:0;e.agent={x:o.spawnPos.x+Math.cos(c)*a,y:o.spawnPos.y+Math.sin(c)*a,vx:0,vy:0,moveDirX:0,moveDirY:0,targetPoint:null,facingRad:0,energy:t,maxEnergy:t,blinkCooldownTicks:0,triggeredVerbThisTick:null},e.currentLoopRecording=[],e.activeGhosts=e.recordedEchoes.map(d=>{const i=d.frames[0]??{x:o.spawnPos.x,y:o.spawnPos.y,facingRad:0};return{echoIndex:d.echoIndex,color:d.color,label:d.label,x:i.x,y:i.y,facingRad:i.facingRad,active:!0}}),e.switches=o.switches.map(d=>({...d,pressed:!1,holdTimerTicks:0,activatedByLabel:null})),e.laserGates=o.laserGates.map(d=>({...d,isOpen:!1,empDisabledTicks:0})),e.terminals=o.terminals.map(d=>({...d,progressTicks:0,hacked:!1,hackedByLabel:null,hackedAtTick:null})),e.sentinels=o.sentinels.map(d=>{const i=d.waypoints[0],p=d.waypoints[1]??i,u=n.nextRange(.05,.35),h=i.x+(p.x-i.x)*u,b=i.y+(p.y-i.y)*u,E=Math.atan2(p.y-i.y,p.x-i.x);return{id:d.id,name:d.name,waypoints:d.waypoints.map(x=>({...x})),currentWaypointIdx:1%d.waypoints.length,x:h,y:b,facingRad:E,speed:d.speed,visionRange:d.visionRange,visionAngleRad:d.visionAngleRad,stunnedTicks:0,alerted:!1,distractedByDecoyId:null}}),e.decoys=[],e.empPulses=[],e.vaultUnlocked=!1,e.coreCarrierLabel=null,e.corePos={x:o.vaultPos.x,y:o.vaultPos.y},e.coreExtracted=!1}function w(e){if(e.status==="PLAYING"){if(e.currentLoopRecording.length>0&&e.recordedEchoes.length<l.MAX_ECHOS_PER_STAGE-1){const o=e.recordedEchoes.length+1,n=U[(o-1)%U.length],r=`ECHO #${o}`;e.recordedEchoes.push({echoIndex:o,color:n,label:r,frames:e.currentLoopRecording.map(t=>({...t}))}),e.loopNumber=e.recordedEchoes.length+1,e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:r,kind:"REWIND_COMMITTED",message:`${r} recorded (${e.currentLoopRecording.length} frames). Rewinding to T=0.0s for Loop #${e.loopNumber}!`}),e.events.push({type:"REWIND",text:`⏪ REWIND! ${r} Locked Into Timeline`,x:e.agent.x,y:e.agent.y})}else e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:"OPERATIVE",kind:"REWIND_COMMITTED",message:`Timeline reset to T=0.0s with ${e.recordedEchoes.length} active Echoes.`}),e.events.push({type:"REWIND",text:"⏪ TIMELINE RESET TO T=0.0s",x:e.agent.x,y:e.agent.y});D(e)}}function K(e,o,n,r,t,c,a){const d=e.installedMods.includes("OPTIC_CLOAK"),i=e.installedMods.includes("PHASE_CAPACITOR");if(c==="EMP_PULSE"){if(a){if(e.agent.energy<l.EMP_COST)return;e.agent.energy-=l.EMP_COST,e.agent.triggeredVerbThisTick="EMP_PULSE"}const p=d?l.EMP_STUN_TICKS+40:l.EMP_STUN_TICKS;let u=0;for(const h of e.sentinels)Math.hypot(h.x-n,h.y-r)<=l.EMP_RADIUS&&(h.stunnedTicks=Math.max(h.stunnedTicks,p),h.alerted=!1,u+=1);for(const h of e.laserGates){const b=(h.x1+h.x2)*.5,E=(h.y1+h.y2)*.5;Math.hypot(b-n,E-r)<=l.EMP_RADIUS+35&&(h.empDisabledTicks=Math.max(h.empDisabledTicks,Math.floor(p*.8)))}e.empPulses.push({x:n,y:r,radius:14,maxRadius:l.EMP_RADIUS,remainingTicks:14,color:a?"#10b981":"#38bdf8"}),e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:o,kind:"EMP_DETONATED",message:`${o} discharged EMP Pulse (${u} sentinel(s) stunned).`}),e.events.push({type:"EMP",text:`⚡ ${o}: EMP PULSE!`,x:n,y:r})}else if(c==="DEPLOY_DECOY"){if(a){if(e.agent.energy<l.DECOY_COST)return;e.agent.energy-=l.DECOY_COST,e.agent.triggeredVerbThisTick="DEPLOY_DECOY"}const p=`DECOY_${o}_${e.tick}`;e.decoys.push({id:p,ownerLabel:o,x:n,y:r,remainingTicks:l.DECOY_DURATION_TICKS}),e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:o,kind:"DECOY_DEPLOYED",message:`${o} deployed a Holo-Decoy at (${Math.round(n)}, ${Math.round(r)}).`}),e.events.push({type:"DECOY",text:`🎭 ${o}: HOLO-DECOY!`,x:n,y:r})}else if(c==="PHASE_BLINK"&&a){const p=i?Math.floor(l.BLINK_COST*.8):l.BLINK_COST;if(e.agent.energy<p||e.agent.blinkCooldownTicks>0)return;e.agent.energy-=p,e.agent.blinkCooldownTicks=l.BLINK_COOLDOWN_TICKS,e.agent.triggeredVerbThisTick="PHASE_BLINK";const u=Math.max(l.AGENT_RADIUS+8,Math.min(l.ARENA_WIDTH-l.AGENT_RADIUS-8,e.agent.x+Math.cos(t)*l.BLINK_DISTANCE)),h=Math.max(l.AGENT_RADIUS+8,Math.min(l.ARENA_HEIGHT-l.AGENT_RADIUS-8,e.agent.y+Math.sin(t)*l.BLINK_DISTANCE)),b=W(u,h,l.AGENT_RADIUS,R(e.stageNumber).walls);e.agent.x=b.x,e.agent.y=b.y,e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:o,kind:"PHASE_BLINK",message:`${o} Phase-Blinked across space-time.`}),e.events.push({type:"BLINK",text:"✨ PHASE BLINK!",x:e.agent.x,y:e.agent.y})}}function X(e,o){if(o.type==="TOGGLE_PAUSE"){e.status==="PLAYING"?e.status="PAUSED":e.status==="PAUSED"&&(e.status="PLAYING");return}if(o.type==="JUMP_TO_STAGE"){const n=Math.max(1,Math.min(l.TOTAL_STAGES,o.stageNumber)),r=O(e.seed,n,e.installedMods,e.score,e.stageSummaries);Object.assign(e,r);return}if(o.type==="INSTALL_MOD"){if(!e.installedMods.includes(o.modId)){e.installedMods.push(o.modId);const n=e.installedMods.includes("PHASE_CAPACITOR");e.agent.maxEnergy=n?l.AGENT_MAX_ENERGY+35:l.AGENT_MAX_ENERGY,e.agent.energy=e.agent.maxEnergy}return}if(o.type==="NEXT_STAGE"){if(e.stageNumber<l.TOTAL_STAGES){const n=O(e.seed,e.stageNumber+1,e.installedMods,e.score,e.stageSummaries);Object.assign(e,n)}else e.status="VICTORY",e.finalRankId=M(e).id;return}if(o.type==="PURGE_LAST_ECHO"){e.recordedEchoes.length>0&&(e.recordedEchoes.pop(),e.loopNumber=e.recordedEchoes.length+1,D(e));return}if(o.type==="COMMIT_LOOP_REWIND"){w(e);return}if(o.type==="SCRUB_TICK"){const n=Math.max(0,Math.min(l.TIMELINE_DURATION_TICKS-1,Math.floor(o.tick)));D(e);for(let r=0;r<n;r++)G(e,l.FIXED_STEP_MS);return}if(e.status==="PLAYING"){if(o.type==="SET_MOVE")e.agent.moveDirX=Math.max(-1,Math.min(1,o.dirX)),e.agent.moveDirY=Math.max(-1,Math.min(1,o.dirY)),(e.agent.moveDirX!==0||e.agent.moveDirY!==0)&&(e.agent.targetPoint=null,e.agent.facingRad=Math.atan2(e.agent.moveDirY,e.agent.moveDirX));else if(o.type==="SET_TARGET_POINT")e.agent.targetPoint={x:Math.max(20,Math.min(l.ARENA_WIDTH-20,o.x)),y:Math.max(20,Math.min(l.ARENA_HEIGHT-20,o.y))};else if(o.type==="TRIGGER_ABILITY"){const n=`OPERATIVE #${e.loopNumber}`;K(e,n,e.agent.x,e.agent.y,e.agent.facingRad,o.verb,!0)}}}function W(e,o,n,r){let t=Math.max(n+6,Math.min(l.ARENA_WIDTH-n-6,e)),c=Math.max(n+6,Math.min(l.ARENA_HEIGHT-n-6,o));for(const a of r){const d=Math.max(a.x,Math.min(t,a.x+a.w)),i=Math.max(a.y,Math.min(c,a.y+a.h)),p=t-d,u=c-i,h=p*p+u*u;if(h<n*n){const b=Math.sqrt(h)||.001,E=n-b;t+=p/b*E,c+=u/b*E}}return{x:t,y:c}}function Z(e,o,n,r,t,c){const a=(t-n)*(t-n)+(c-r)*(c-r);if(a===0)return Math.hypot(e-n,o-r);let d=((e-n)*(t-n)+(o-r)*(c-r))/a;d=Math.max(0,Math.min(1,d));const i=n+d*(t-n),p=r+d*(c-r);return Math.hypot(e-i,o-p)}function G(e,o=l.FIXED_STEP_MS){if(e.status!=="PLAYING")return;const n=o/1e3,r=R(e.stageNumber),t=e.installedMods.includes("GHOST_OVERDRIVE"),c=e.installedMods.includes("RESONANCE_COIL"),a=e.installedMods.includes("OPTIC_CLOAK"),d=l.AGENT_BASE_SPEED*(t?1.22:1);let i=e.agent.moveDirX,p=e.agent.moveDirY;if(i===0&&p===0&&e.agent.targetPoint){const s=e.agent.targetPoint.x-e.agent.x,g=e.agent.targetPoint.y-e.agent.y,y=Math.hypot(s,g);y>6?(i=s/y,p=g/y,e.agent.facingRad=Math.atan2(p,i)):e.agent.targetPoint=null}const u=Math.hypot(i,p);u>1&&(i/=u,p/=u),e.agent.vx=i*d,e.agent.vy=p*d;const h=e.agent.x+e.agent.vx*n,b=e.agent.y+e.agent.vy*n,E=W(h,b,l.AGENT_RADIUS,r.walls);let x=!1;for(const s of e.laserGates)if(!s.isOpen&&s.empDisabledTicks<=0&&Z(E.x,E.y,s.x1,s.y1,s.x2,s.y2)<l.AGENT_RADIUS+3){x=!0,e.paradoxInstability=Math.min(l.PARADOX_MAX_INSTABILITY,e.paradoxInstability+l.LASER_INSTABILITY_HIT*.25),e.events.push({type:"ALERT",text:"🚨 LASER BARRIER! Hold Switch or Blink Across!",x:E.x,y:E.y});break}x||(e.agent.x=E.x,e.agent.y=E.y),e.agent.blinkCooldownTicks>0&&(e.agent.blinkCooldownTicks-=1),e.agent.energy=Math.min(e.agent.maxEnergy,e.agent.energy+9*n),e.currentLoopRecording.push({tick:e.tick,x:e.agent.x,y:e.agent.y,facingRad:e.agent.facingRad,triggeredVerb:e.agent.triggeredVerbThisTick}),e.agent.triggeredVerbThisTick=null;for(let s=0;s<e.recordedEchoes.length;s++){const g=e.recordedEchoes[s],y=e.activeGhosts[s];if(y)if(e.tick<g.frames.length){const m=g.frames[e.tick];y.x=m.x,y.y=m.y,y.facingRad=m.facingRad,y.active=!0,m.triggeredVerb&&K(e,y.label,y.x,y.y,y.facingRad,m.triggeredVerb,!1)}else y.active=!0}const A=[{label:`OPERATIVE #${e.loopNumber}`,x:e.agent.x,y:e.agent.y,canHack:!0,canCarryCore:!0},...e.activeGhosts.map(s=>({label:s.label,x:s.x,y:s.y,canHack:!0,canCarryCore:!0})),...e.decoys.map(s=>({label:`DECOY (${s.ownerLabel})`,x:s.x,y:s.y,canHack:!1,canCarryCore:!1}))];e.temporalResonanceActive=!1;for(const s of e.activeGhosts)if(Math.hypot(e.agent.x-s.x,e.agent.y-s.y)<=l.TEMPORAL_RESONANCE_RADIUS){e.temporalResonanceActive=!0,e.score+=3,e.resonanceBonusAccumulated+=3,c&&(e.paradoxInstability=Math.max(0,e.paradoxInstability-.8));break}const S=t?50:0;for(const s of e.switches){let g=null;for(const y of A)if(Math.hypot(y.x-s.x,y.y-s.y)<=l.SWITCH_INTERACT_RADIUS){g=y.label;break}if(g){const y=s.pressed||s.holdTimerTicks>0;s.pressed=!0,s.holdTimerTicks=s.stayOpenTicks+S,s.activatedByLabel=g,y||(e.events.push({type:"GATE_OPEN",text:`🔓 ${g} Opened ${s.label}!`,x:s.x,y:s.y}),e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:g,kind:"PLATE_HELD",message:`${g} engaged ${s.label} -> ${s.targetGateId} unlocked.`}))}else s.pressed=!1,s.holdTimerTicks>0?s.holdTimerTicks-=1:s.activatedByLabel=null}for(const s of e.laserGates){s.empDisabledTicks>0&&(s.empDisabledTicks-=1);const y=e.switches.filter(m=>m.targetGateId===s.id).some(m=>m.pressed||m.holdTimerTicks>0);s.isOpen=y||s.empDisabledTicks>0}const f=c?1.5:1;for(const s of e.terminals)if(!s.hacked){for(const g of A)if(g.canHack&&Math.hypot(g.x-s.x,g.y-s.y)<=l.TERMINAL_HACK_RADIUS){s.progressTicks=Math.min(s.hackTicksRequired,s.progressTicks+f),s.progressTicks>=s.hackTicksRequired&&(s.hacked=!0,s.hackedByLabel=g.label,s.hackedAtTick=e.tick,e.score+=l.SCORE_TERMINAL_HACKED,e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:g.label,kind:"TERMINAL_DECRYPTED",message:`${g.label} decrypted ${s.label} at T=${(e.tick*.05).toFixed(1)}s!`}),e.events.push({type:"HACK_COMPLETE",text:`💻 ${s.label} DECRYPTED BY ${g.label}!`,x:s.x,y:s.y}));break}}e.vaultUnlocked=e.terminals.every(s=>s.hacked);for(let s=e.decoys.length-1;s>=0;s--)e.decoys[s].remainingTicks-=1,e.decoys[s].remainingTicks<=0&&e.decoys.splice(s,1);for(let s=e.empPulses.length-1;s>=0;s--){const g=e.empPulses[s];g.remainingTicks-=1,g.radius=g.maxRadius*(1-g.remainingTicks/14),g.remainingTicks<=0&&e.empPulses.splice(s,1)}for(const s of e.sentinels){if(s.stunnedTicks>0){s.stunnedTicks-=1,s.alerted=!1;continue}let g=null,y=null;s.distractedByDecoyId=null;for(const T of e.decoys)if(Math.hypot(T.x-s.x,T.y-s.y)<=l.DECOY_ATTRACT_RADIUS){g=T.x,y=T.y,s.distractedByDecoyId=T.id;break}if(g===null||y===null){const T=s.waypoints[s.currentWaypointIdx]??s.waypoints[0];g=T.x,y=T.y,Math.hypot(g-s.x,y-s.y)<10&&(s.currentWaypointIdx=(s.currentWaypointIdx+1)%s.waypoints.length)}const m=g-s.x,v=y-s.y,C=Math.hypot(m,v);if(C>1){s.facingRad=Math.atan2(v,m);const T=(s.distractedByDecoyId?s.speed*.65:s.speed)*n;s.x+=m/C*T,s.y+=v/C*T}s.alerted=!1;for(const T of A){if(!T.canCarryCore)continue;const H=T.x-s.x,B=T.y-s.y;if(Math.hypot(H,B)<=s.visionRange){let I=Math.atan2(B,H)-s.facingRad;for(;I>Math.PI;)I-=Math.PI*2;for(;I<-Math.PI;)I+=Math.PI*2;if(Math.abs(I)<=s.visionAngleRad*.5){s.alerted=!0;const J=l.SIGHT_INSTABILITY_PER_TICK*(a?.55:1);e.paradoxInstability=Math.min(l.PARADOX_MAX_INSTABILITY,e.paradoxInstability+J),e.tick%12===0&&e.events.push({type:"ALERT",text:`👁️ ${s.name} Spotted ${T.label}!`,x:T.x,y:T.y})}}}}if(e.sentinels.some(s=>s.alerted)||(e.paradoxInstability=Math.max(0,e.paradoxInstability-.35)),e.peakInstabilityThisStage=Math.max(e.peakInstabilityThisStage,e.paradoxInstability),e.paradoxInstability>=l.PARADOX_MAX_INSTABILITY){e.status="GAME_OVER",e.finalRankId=M(e).id,e.events.push({type:"PARADOX_COLLAPSE",text:"💥 PARADOX COLLAPSE! Panopticon Locked Your Timeline!",x:e.agent.x,y:e.agent.y});return}if(e.vaultUnlocked&&!e.coreCarrierLabel&&!e.coreExtracted){for(const s of A)if(s.canCarryCore&&Math.hypot(s.x-e.corePos.x,s.y-e.corePos.y)<=l.VAULT_EXTRACT_RADIUS){e.coreCarrierLabel=s.label,e.score+=l.SCORE_CORE_EXTRACTED,e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:s.label,kind:"CORE_SEIZED",message:`${s.label} seized the Quantum Chronos Core! Head to Extraction!`}),e.events.push({type:"CORE_GRABBED",text:`💎 ${s.label} SEIZED THE CHRONOS CORE!`,x:e.corePos.x,y:e.corePos.y});break}}if(e.coreCarrierLabel){const s=A.find(g=>g.label===e.coreCarrierLabel);if(s&&(e.corePos.x=s.x,e.corePos.y=s.y,Math.hypot(s.x-r.extractionPos.x,s.y-r.extractionPos.y)<=l.EXTRACTION_PAD_RADIUS)){e.coreExtracted=!0;const y=e.recordedEchoes.length+1,m=Math.max(0,l.MAX_ECHOS_PER_STAGE-y)*l.SCORE_UNUSED_ECHO_BONUS,v=Math.max(0,l.TIMELINE_DURATION_TICKS-e.tick)*l.SCORE_TICK_REMAINING_BONUS,C=e.peakInstabilityThisStage<25?l.SCORE_PARADOX_FREE_BONUS:0,T=l.SCORE_STAGE_CLEAR_BASE+m+v+C;e.score+=T,e.stageSummaries.push({stageNumber:e.stageNumber,title:r.title,echoesUsed:y,parEchoCount:r.parEchoCount,ticksUsed:e.tick,paradoxPeak:Math.round(e.peakInstabilityThisStage),stageScore:T}),e.telemetryLog.unshift({tick:e.tick,loopNumber:e.loopNumber,actor:s.label,kind:"STAGE_EXTRACTED",message:`${s.label} extracted the Chronos Core in ${(e.tick*.05).toFixed(1)}s using ${y} timeline(s)!`}),e.stageNumber>=l.TOTAL_STAGES?(e.status="VICTORY",e.finalRankId=M(e).id,e.events.push({type:"VICTORY",text:"🏆 GRAND HEIST COMPLETE! All 4 Quantum Vaults Cracked!",x:s.x,y:s.y})):(e.status="STAGE_CLEAR",e.events.push({type:"STAGE_CLEAR",text:`🚁 SECTOR ${e.stageNumber} EXTRACTED! (+${T} PTS)`,x:s.x,y:s.y}));return}}e.tick+=1,e.totalTicksElapsed+=1,e.tick>=l.TIMELINE_DURATION_TICKS&&w(e)}function M(e){const o=e.stageSummaries.reduce((r,t)=>r+t.echoesUsed,0),n=e.stageSummaries.reduce((r,t)=>r+t.parEchoCount,0);return e.status==="VICTORY"&&o<=n&&e.score>=12500?k.OMNISCIENT_ARCHITECT:e.status==="VICTORY"&&e.score>=9500?k.FOURTH_DIMENSIONAL_PHANTOM:e.stageSummaries.length>=2||e.score>=4500?k.TEMPORAL_TACTICIAN:k.LOOP_OPERATIVE}function q(){return{heistsCompleted:0,highScore:0,totalVaultsCracked:0,totalEchoesDeployed:0,discoveredRanks:[],processedRunKeys:[]}}function F(){const e={schemaVersion:l.SCHEMA_VERSION,career:q(),activeRun:null};if(typeof window>"u"||!window.localStorage)return e;try{const o=window.localStorage.getItem(l.STORAGE_KEY);if(!o)return e;const n=JSON.parse(o);return!n||n.schemaVersion!==l.SCHEMA_VERSION||!n.career?e:{schemaVersion:l.SCHEMA_VERSION,career:{heistsCompleted:Number(n.career.heistsCompleted)||0,highScore:Number(n.career.highScore)||0,totalVaultsCracked:Number(n.career.totalVaultsCracked)||0,totalEchoesDeployed:Number(n.career.totalEchoesDeployed)||0,discoveredRanks:Array.isArray(n.career.discoveredRanks)?n.career.discoveredRanks:[],processedRunKeys:Array.isArray(n.career.processedRunKeys)?n.career.processedRunKeys:[]},activeRun:n.activeRun?N(n.activeRun):null}}catch{return e}}function _(e,o){const n={...e,discoveredRanks:[...e.discoveredRanks],processedRunKeys:[...e.processedRunKeys]};if(o&&(n.highScore=Math.max(n.highScore,o.score),(o.status==="VICTORY"||o.status==="GAME_OVER")&&o.finalRankId)){const t=`${o.seed}-${o.totalTicksElapsed}-${o.finalRankId}`;n.processedRunKeys.includes(t)||(n.processedRunKeys.push(t),o.status==="VICTORY"&&(n.heistsCompleted+=1),n.totalVaultsCracked+=o.stageSummaries.length,n.totalEchoesDeployed+=o.stageSummaries.reduce((c,a)=>c+a.echoesUsed,0),n.discoveredRanks.includes(o.finalRankId)||n.discoveredRanks.push(o.finalRankId))}const r={schemaVersion:l.SCHEMA_VERSION,career:n,activeRun:o?N(o):null};if(typeof window<"u"&&window.localStorage)try{window.localStorage.setItem(l.STORAGE_KEY,JSON.stringify(r))}catch{}return r}typeof HTMLButtonElement<"u"&&!("commandForElement"in HTMLButtonElement.prototype)&&$(()=>import("./index-BWFjuSge.js"),[],import.meta.url);typeof HTMLElement<"u"&&!("popover"in HTMLElement.prototype)&&$(()=>import("./popover-DtqSrbDJ.js"),[],import.meta.url);class j{container;audio;callbacks;debugVisible;canvas;ctx=null;popups=[];pressedKeys=new Set;keydownHandler;keyupHandler;intersectionObserver=null;lastRenderedStage=-1;lastRenderedStatus="";lastRenderedLoop=-1;lastModsKey="";lastLogHead="";constructor(o,n,r,t=!1){this.container=o,this.audio=n,this.callbacks=r,this.debugVisible=t,this.mountDOM(),this.bindEvents()}isDebugVisible(){return this.debugVisible}setDebugVisible(o){this.debugVisible=o;const n=this.container.querySelector("#cs-debug-panel");n&&(n.hidden=!this.debugVisible)}resetVisuals(){this.popups=[],this.lastRenderedStage=-1,this.lastRenderedStatus="",this.lastRenderedLoop=-1,this.lastModsKey="",this.lastLogHead=""}setupDialogLightDismiss(o){if(!(typeof HTMLDialogElement>"u"||"closedBy"in HTMLDialogElement.prototype))for(const n of o.querySelectorAll('dialog[closedby="any"]'))n.addEventListener("click",r=>{if(r.target!==n)return;const t=n.getBoundingClientRect();t.top<=r.clientY&&r.clientY<=t.top+t.height&&t.left<=r.clientX&&r.clientX<=t.left+t.width||n.close()})}setupBackgroundProcessingGuard(o){o.addEventListener("contentvisibilityautostatechange",n=>{const r=n;this.callbacks.onVisibilityPausedChange?.(!!r.skipped)}),typeof document<"u"&&!("contentVisibility"in document.documentElement.style)&&typeof IntersectionObserver<"u"&&(this.intersectionObserver=new IntersectionObserver(n=>{for(const r of n)this.callbacks.onVisibilityPausedChange?.(!r.isIntersecting)},{rootMargin:"200px"}),this.intersectionObserver.observe(o))}mountDOM(){this.container.innerHTML=`
      <style>
        :root {
          --cs-accent-light: #059669;
          --cs-accent-dark: #10b981;
          --cs-accent: var(--cs-accent-dark);
          color-scheme: light dark;
          scrollbar-width: thin;
          scrollbar-color: #10b981 #090d16;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --cs-accent: var(--cs-accent-dark);
          }
        }

        @supports (color: light-dark(white, black)) {
          :root {
            --cs-accent: light-dark(var(--cs-accent-light), var(--cs-accent-dark));
          }
        }

        .cs-root {
          content-visibility: auto;
          contain-intrinsic-size: auto none auto 760px;
          background: radial-gradient(circle at 15% 10%, #0d1f2d 0%, #070b14 55%, #04070d 100%);
          color: #f1f5f9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
        }

        [popover]:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .cs-popover {
          background: #0b1324;
          color: #f1f5f9;
          border: 1px solid #10b981;
          border-radius: 12px;
          padding: 16px 20px;
          max-width: 500px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
        }

        .cs-dialog {
          background: #0b1324;
          color: #f1f5f9;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          max-width: 620px;
          width: 92vw;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
        }
        .cs-dialog::backdrop {
          background: rgba(3, 7, 18, 0.78);
          backdrop-filter: blur(4px);
        }

        .cs-topbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #1e293b;
        }

        .cs-badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.16);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.45);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          border-radius: 999px;
          text-transform: uppercase;
        }

        .cs-title {
          margin: 2px 0 0;
          font-size: 1.28rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f8fafc;
        }

        .cs-stage-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cs-btn {
          background: #131c31;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .cs-btn:hover {
          border-color: #10b981;
          background: #17253f;
        }
        .cs-btn[aria-current="step"] {
          background: rgba(16, 185, 129, 0.22);
          border-color: #10b981;
          color: #6ee7b7;
        }
        .cs-btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #04130e;
          border-color: #34d399;
          font-weight: 800;
        }
        .cs-btn-primary:hover {
          filter: brightness(1.08);
        }
        .cs-btn-rewind {
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          color: #041019;
          border-color: #7dd3fc;
          font-weight: 800;
        }

        .cs-kpi-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .cs-kpi-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 11px;
        }
        .cs-kpi-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .cs-kpi-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin-top: 2px;
        }

        .cs-workspace {
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 1080px) {
          .cs-workspace {
            grid-template-columns: 1fr;
          }
        }

        .cs-canvas-card {
          background: #050912;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 10px;
          position: relative;
        }

        .cs-briefing-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 7px 11px;
          margin-bottom: 8px;
          font-size: 0.78rem;
          color: #d1fae5;
        }

        #cs-heist-canvas {
          width: 100%;
          max-width: 760px;
          height: auto;
          aspect-ratio: 760 / 440;
          display: block;
          margin: 0 auto;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #060b16;
          cursor: crosshair;
        }

        .cs-scrubber-box {
          margin-top: 10px;
          background: #0b1322;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 9px 12px;
        }
        .cs-scrubber-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .cs-scrubber-tracks {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 6px;
        }
        .cs-track-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
        }
        .cs-track-bar {
          flex: 1;
          height: 8px;
          background: #1e293b;
          border-radius: 999px;
          position: relative;
          overflow: hidden;
        }
        .cs-track-fill {
          height: 100%;
          border-radius: 999px;
        }

        .cs-action-deck {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .cs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cs-panel {
          background: #0b1322;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 11px 13px;
        }
        .cs-panel-title {
          margin: 0 0 8px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #38bdf8;
        }

        .cs-mod-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .cs-mod-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          background: #111c33;
          border: 1px solid #1e293b;
          font-size: 0.74rem;
        }

        .cs-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 165px;
          overflow-y: auto;
          scrollbar-gutter: stable;
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cs-log-list li {
          padding: 4px 7px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.7);
          border-left: 3px solid #10b981;
          color: #cbd5e1;
        }

        .cs-overlay-banner {
          margin-top: 10px;
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.18));
          border: 1px solid #10b981;
        }
      </style>

      <div class="cs-root" id="cs-root-surface">
        <div class="cs-topbar">
          <div>
            <span class="cs-badge">★ FLAGSHIP #12 · 4D TIME-LOOP TACTICAL HEIST</span>
            <h2 class="cs-title">Chrono-Syndicate: The 15-Second Heist</h2>
          </div>

          <div class="cs-stage-pills" role="group" aria-label="Heist Sector Selector">
            ${L.map(n=>`
              <button type="button" class="cs-btn" data-stage-jump="${n.stageNumber}">
                Sector ${n.stageNumber}: ${n.title}
              </button>
            `).join("")}
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" class="cs-btn" commandfor="cs-manual-popover" command="toggle-popover">
              ❓ 4D Heist Manual
            </button>
            <button type="button" class="cs-btn" commandfor="cs-dossier-dialog" command="show-modal">
              🎖️ Syndicate Dossier
            </button>
            <button type="button" class="cs-btn" id="cs-btn-mute">🔊 Audio: ON</button>
            <button type="button" class="cs-btn" id="cs-btn-reset-run">↻ New Seed Run</button>
          </div>
        </div>

        <div id="cs-manual-popover" class="cs-popover" popover>
          <h3 style="margin-top:0; color:#10b981;">⏱️ How 15-Second Ghost-Echo Co-Op Works</h3>
          <ol style="padding-left:18px; line-height:1.5; font-size:0.84rem;">
            <li><strong>Every Loop is 15.0 Seconds (300 Ticks):</strong> Everything you do—standing on Pressure Plates, decrypting Cipher Terminals, firing EMPs, or dropping Holo-Decoys—is recorded frame-by-frame.</li>
            <li><strong>Press [R] or "Commit Loop &amp; Rewind" Anytime:</strong> Time rewinds to <code>T = 0.0s</code> and your previous run materializes as an autonomous <strong>Ghost Echo</strong> that replays your exact path and actions!</li>
            <li><strong>Cooperate With Yourself:</strong> Have <em>Echo #1</em> hold open the North Pressure Plate &amp; stun the Sentinel at <code>T=4.5s</code> while <em>Operative #2</em> walks straight through the disabled Laser Gate to grab the Chronos Core!</li>
            <li><strong>Temporal Resonance:</strong> Moving within <code>68px</code> of any of your Ghost Echoes forms a 4D Resonance Tether (+Score &amp; Paradox stabilization).</li>
          </ol>
        </div>

        <dialog id="cs-dossier-dialog" class="cs-dialog" closedby="any" aria-labelledby="cs-dossier-title">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 id="cs-dossier-title" style="margin:0; color:#38bdf8;">🎖️ Chrono-Syndicate Career Dossier &amp; 4D Ranks</h3>
            <button type="button" class="cs-btn" commandfor="cs-dossier-dialog" command="close">Close [Esc]</button>
          </div>
          <div id="cs-dossier-body" style="font-size:0.84rem; line-height:1.5;"></div>
        </dialog>

        <div class="cs-kpi-strip">
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Active Sector</div>
            <div class="cs-kpi-val" id="cs-kpi-sector">SECTOR I</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">15s Loop Clock</div>
            <div class="cs-kpi-val" id="cs-kpi-clock" style="color:#38bdf8;">0.0s / 15.0s</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Active Timelines</div>
            <div class="cs-kpi-val" id="cs-kpi-loop">Loop #1 (0 Echoes)</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Rig Capacitor</div>
            <div class="cs-kpi-val" id="cs-kpi-energy" style="color:#10b981;">100 / 100 EN</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Paradox Instability</div>
            <div class="cs-kpi-val" id="cs-kpi-paradox">0% (STABLE)</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Syndicate Score</div>
            <div class="cs-kpi-val" id="cs-kpi-score" style="color:#f59e0b;">0</div>
          </div>
        </div>

        <div class="cs-workspace">
          <div class="cs-canvas-card">
            <div class="cs-briefing-bar">
              <span id="cs-briefing-text">Loading sector briefing...</span>
              <span id="cs-objective-pill" class="cs-badge">1. DECRYPT CIPHERS</span>
            </div>

            <canvas
              id="cs-heist-canvas"
              width="${l.ARENA_WIDTH}"
              height="${l.ARENA_HEIGHT}"
              aria-label="Chrono-Syndicate 4D Tactical Heist Arena"
            ></canvas>

            <div class="cs-action-deck">
              <button type="button" class="cs-btn cs-btn-rewind" id="cs-btn-rewind" title="Record current path as a Ghost Echo and rewind to T=0.0s [Key: R]">
                ⏪ Commit Loop &amp; Rewind to T=0.0s [R]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-emp" title="Discharge EMP Pulse: Stuns Sentinels &amp; Laser Gates for 3.2s [Key: 1 or Q]">
                ⚡ EMP Pulse (-${l.EMP_COST} EN) [1 / Q]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-decoy" title="Deploy Holo-Decoy: Holds Pressure Plates &amp; lures Sentinels [Key: 2 or E]">
                🎭 Holo-Decoy (-${l.DECOY_COST} EN) [2 / E]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-blink" title="Phase-Blink 105px forward across lasers [Key: 3 or Space]">
                ✨ Phase-Blink (-${l.BLINK_COST} EN) [3 / Space]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-purge" title="Remove most recent Ghost Echo">
                🗑️ Undo Last Echo [Z]
              </button>
            </div>

            <div class="cs-scrubber-box">
              <div class="cs-scrubber-header">
                <span>🎞️ 4D Multi-Track Timeline Ribbon (0.0s → 15.0s)</span>
                <label style="display:flex; align-items:center; gap:6px;">
                  <span>Scrub Tick:</span>
                  <input
                    type="range"
                    id="cs-timeline-scrubber"
                    min="0"
                    max="${l.TIMELINE_DURATION_TICKS-1}"
                    value="0"
                    style="accent-color:#10b981; width:150px;"
                  />
                </label>
              </div>
              <div id="cs-tracks-container" class="cs-scrubber-tracks"></div>
            </div>

            <div id="cs-stage-clear-banner" class="cs-overlay-banner" hidden></div>
          </div>

          <aside class="cs-sidebar">
            <div class="cs-panel">
              <h3 class="cs-panel-title">🎯 Sector Objectives &amp; Hints</h3>
              <div id="cs-objectives-list" style="font-size:0.78rem; line-height:1.5;"></div>
              <p id="cs-hint-box" style="margin:8px 0 0; font-size:0.73rem; color:#94a3b8; border-top:1px solid #1e293b; padding-top:6px;"></p>
            </div>

            <div class="cs-panel">
              <h3 class="cs-panel-title">🛠️ Quantum Rig Loadout (Free Toggle)</h3>
              <div id="cs-mod-list" class="cs-mod-grid"></div>
            </div>

            <div class="cs-panel">
              <h3 class="cs-panel-title">📡 Causality Telemetry Feed</h3>
              <ul id="cs-telemetry-log" class="cs-log-list"></ul>
            </div>

            <div class="cs-panel" id="cs-debug-panel" ${this.debugVisible?"":"hidden"}>
              <h3 class="cs-panel-title">🐞 Deterministic Debug Inspector</h3>
              <pre id="cs-debug-pre" style="margin:0; font-size:0.7rem; color:#6ee7b7; white-space:pre-wrap;"></pre>
            </div>
          </aside>
        </div>
      </div>
    `,this.canvas=this.container.querySelector("#cs-heist-canvas"),this.ctx=this.canvas.getContext("2d");const o=this.container.querySelector("#cs-root-surface");o&&this.setupBackgroundProcessingGuard(o),this.setupDialogLightDismiss(this.container)}bindEvents(){for(const a of this.container.querySelectorAll("[data-stage-jump]"))a.addEventListener("click",()=>{const d=Number(a.getAttribute("data-stage-jump"));this.callbacks.onAction({type:"JUMP_TO_STAGE",stageNumber:d})});this.container.querySelector("#cs-btn-rewind")?.addEventListener("click",()=>{this.callbacks.onAction({type:"COMMIT_LOOP_REWIND"})}),this.container.querySelector("#cs-btn-emp")?.addEventListener("click",()=>{this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"EMP_PULSE"})}),this.container.querySelector("#cs-btn-decoy")?.addEventListener("click",()=>{this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"DEPLOY_DECOY"})}),this.container.querySelector("#cs-btn-blink")?.addEventListener("click",()=>{this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"PHASE_BLINK"})}),this.container.querySelector("#cs-btn-purge")?.addEventListener("click",()=>{this.callbacks.onAction({type:"PURGE_LAST_ECHO"})});const o=this.container.querySelector("#cs-btn-mute");o?.addEventListener("click",()=>{const a=!this.audio.isMuted();this.audio.setMuted(a),o.textContent=a?"🔇 Audio: OFF":"🔊 Audio: ON"}),this.container.querySelector("#cs-btn-reset-run")?.addEventListener("click",()=>{this.callbacks.onRestart()});const n=this.container.querySelector("#cs-timeline-scrubber");n?.addEventListener("input",()=>{const a=Number(n.value);this.callbacks.onAction({type:"SCRUB_TICK",tick:a})});const r=a=>{const d=this.canvas.getBoundingClientRect(),i=this.canvas.width/Math.max(1,d.width),p=this.canvas.height/Math.max(1,d.height);return{x:(a.clientX-d.left)*i,y:(a.clientY-d.top)*p}};let t=!1;this.canvas.addEventListener("mousedown",a=>{t=!0;const d=r(a);this.callbacks.onAction({type:"SET_TARGET_POINT",x:d.x,y:d.y})}),this.canvas.addEventListener("mousemove",a=>{if(!t)return;const d=r(a);this.callbacks.onAction({type:"SET_TARGET_POINT",x:d.x,y:d.y})}),window.addEventListener("mouseup",()=>{t=!1});const c=()=>{let a=0,d=0;(this.pressedKeys.has("KeyW")||this.pressedKeys.has("ArrowUp"))&&(d-=1),(this.pressedKeys.has("KeyS")||this.pressedKeys.has("ArrowDown"))&&(d+=1),(this.pressedKeys.has("KeyA")||this.pressedKeys.has("ArrowLeft"))&&(a-=1),(this.pressedKeys.has("KeyD")||this.pressedKeys.has("ArrowRight"))&&(a+=1),this.callbacks.onAction({type:"SET_MOVE",dirX:a,dirY:d})};this.keydownHandler=a=>{const d=a.target?.tagName;if(!(d==="INPUT"||d==="TEXTAREA"||d==="SELECT")){if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(a.code)){a.code.startsWith("Arrow")&&a.preventDefault(),this.pressedKeys.add(a.code),c();return}a.code==="KeyQ"||a.code==="Digit1"?(a.preventDefault(),this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"EMP_PULSE"})):a.code==="KeyE"||a.code==="Digit2"?(a.preventDefault(),this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"DEPLOY_DECOY"})):a.code==="Space"||a.code==="Digit3"?(a.preventDefault(),this.callbacks.onAction({type:"TRIGGER_ABILITY",verb:"PHASE_BLINK"})):a.code==="KeyR"?(a.preventDefault(),this.callbacks.onAction({type:"COMMIT_LOOP_REWIND"})):a.code==="KeyZ"?(a.preventDefault(),this.callbacks.onAction({type:"PURGE_LAST_ECHO"})):(a.code==="KeyN"||a.code==="Enter")&&this.callbacks.onAction({type:"NEXT_STAGE"})}},this.keyupHandler=a=>{this.pressedKeys.has(a.code)&&(this.pressedKeys.delete(a.code),c())},window.addEventListener("keydown",this.keydownHandler),window.addEventListener("keyup",this.keyupHandler)}consumeEvents(o,n){for(const r of n){let t="#10b981";r.type==="EMP"?(t="#38bdf8",this.audio.playEmp()):r.type==="DECOY"?(t="#f59e0b",this.audio.playDecoy()):r.type==="BLINK"?(t="#a855f7",this.audio.playBlink()):r.type==="GATE_OPEN"?(t="#34d399",this.audio.playGateOpen()):r.type==="HACK_COMPLETE"?(t="#38bdf8",this.audio.playHackComplete()):r.type==="CORE_GRABBED"?(t="#f59e0b",this.audio.playCoreGrabbed()):r.type==="REWIND"?(t="#38bdf8",this.audio.playRewind()):r.type==="ALERT"||r.type==="PARADOX_COLLAPSE"?(t="#f43f5e",this.audio.playAlert()):(r.type==="STAGE_CLEAR"||r.type==="VICTORY")&&(t="#10b981",this.audio.playStageClear()),this.popups.push({text:r.text,x:r.x??o.agent.x,y:(r.y??o.agent.y)-18,color:t,alpha:1,vy:-24})}}render(o,n,r){const t=R(o.stageNumber),c=this.container.querySelector("#cs-kpi-sector");c&&(c.textContent=`SECTOR ${o.stageNumber} / ${l.TOTAL_STAGES}`);const a=this.container.querySelector("#cs-kpi-clock");if(a){const E=(o.tick*(l.FIXED_STEP_MS/1e3)).toFixed(1);a.textContent=`${E}s / 15.0s`}const d=this.container.querySelector("#cs-kpi-loop");d&&(d.textContent=`Loop #${o.loopNumber} (${o.recordedEchoes.length} Echo${o.recordedEchoes.length===1?"":"es"})`);const i=this.container.querySelector("#cs-kpi-energy");i&&(i.textContent=`${Math.round(o.agent.energy)} / ${o.agent.maxEnergy} EN`);const p=this.container.querySelector("#cs-kpi-paradox");if(p){const E=Math.round(o.paradoxInstability);p.textContent=`${E}% ${E>=70?"⚠️ CRITICAL":o.temporalResonanceActive?"✨ RESONANCE":"STABLE"}`,p.style.color=E>=70?"#f43f5e":o.temporalResonanceActive?"#38bdf8":"#10b981"}const u=this.container.querySelector("#cs-kpi-score");u&&(u.textContent=o.score.toLocaleString());const h=this.container.querySelector("#cs-timeline-scrubber");h&&document.activeElement!==h&&(h.value=String(o.tick));const b=this.container.querySelector("#cs-objective-pill");if(b)if(o.coreCarrierLabel)b.textContent=`3. EXTRACT TO HELIPAD (${o.coreCarrierLabel})`,b.style.borderColor="#f59e0b",b.style.color="#fcd34d";else if(o.vaultUnlocked)b.textContent="2. SEIZE CHRONOS CORE AT EAST VAULT!",b.style.borderColor="#10b981",b.style.color="#6ee7b7";else{const E=o.terminals.filter(x=>x.hacked).length;b.textContent=`1. DECRYPT CIPHERS (${E}/${o.terminals.length})`,b.style.borderColor="#38bdf8",b.style.color="#7dd3fc"}if(this.lastRenderedStage!==o.stageNumber){this.lastRenderedStage=o.stageNumber;const E=this.container.querySelector("#cs-briefing-text");E&&(E.innerHTML=`<strong>${t.codeName} — ${t.title}:</strong> ${t.architectBriefing}`);const x=this.container.querySelector("#cs-hint-box");x&&(x.textContent=t.tacticalHint);for(const A of this.container.querySelectorAll("[data-stage-jump]"))Number(A.getAttribute("data-stage-jump"))===o.stageNumber?A.setAttribute("aria-current","step"):A.removeAttribute("aria-current")}if(this.renderObjectivesSidebar(o),this.renderRigModsSidebar(o),this.renderTimelineRibbon(o),this.renderTelemetryLog(o),this.renderOverlayBanner(o,n),this.renderDossierModal(o,n),this.debugVisible){const E=this.container.querySelector("#cs-debug-pre");E&&(E.textContent=JSON.stringify({seed:o.seed,stage:o.stageNumber,loop:o.loopNumber,tick:o.tick,agent:{x:Math.round(o.agent.x),y:Math.round(o.agent.y),energy:Math.round(o.agent.energy)},echoes:o.recordedEchoes.length,vaultUnlocked:o.vaultUnlocked,coreCarrier:o.coreCarrierLabel,rngCalls:o.rngState.calls},null,2))}this.drawCanvas(o,t,r)}renderObjectivesSidebar(o){const n=this.container.querySelector("#cs-objectives-list");if(!n)return;const r=o.switches.map(a=>`<div>• <strong>${a.label}:</strong> ${a.pressed||a.holdTimerTicks>0?`<span style="color:#10b981;">OPEN (${a.activatedByLabel??"HOLD"})</span>`:'<span style="color:#94a3b8;">Stand or Drop Decoy</span>'}</div>`).join(""),t=o.terminals.map(a=>`<div>• <strong>${a.label}:</strong> ${a.hacked?`<span style="color:#38bdf8;">DECRYPTED (${a.hackedByLabel})</span>`:`<span style="color:#f59e0b;">${Math.round(a.progressTicks/a.hackTicksRequired*100)}% Decrypted</span>`}</div>`).join(""),c=o.coreExtracted?'<span style="color:#10b981;">EXTRACTED!</span>':o.coreCarrierLabel?`<span style="color:#f59e0b;">Carried by ${o.coreCarrierLabel} → Go to Extraction!</span>`:o.vaultUnlocked?'<span style="color:#10b981;">VAULT OPEN — Grab the Core!</span>':'<span style="color:#94a3b8;">Locked (Decrypt all Ciphers)</span>';n.innerHTML=`
      ${r}
      ${t}
      <div style="margin-top:4px;">• <strong>Chronos Core:</strong> ${c}</div>
    `}renderRigModsSidebar(o){const n=o.installedMods.join(",");if(this.lastModsKey===n)return;this.lastModsKey=n;const r=this.container.querySelector("#cs-mod-list");if(r){r.innerHTML=Y.map(t=>{const c=o.installedMods.includes(t.id);return`
        <div class="cs-mod-item" style="border-color:${c?t.badgeColor:"#1e293b"};">
          <div>
            <div style="font-weight:800; color:${c?t.badgeColor:"#e2e8f0"};">
              ${t.name}
            </div>
            <div style="color:#94a3b8; font-size:0.69rem;">${t.tagline}</div>
          </div>
          <button
            type="button"
            class="cs-btn"
            data-install-mod="${t.id}"
            ${c?'disabled style="opacity:0.7; border-color:#10b981; color:#10b981;"':""}
          >
            ${c?"✓ Active":"+ Equip"}
          </button>
        </div>
      `}).join("");for(const t of r.querySelectorAll("[data-install-mod]"))t.addEventListener("click",()=>{const c=t.getAttribute("data-install-mod");this.callbacks.onAction({type:"INSTALL_MOD",modId:c})})}}renderTimelineRibbon(o){const n=this.container.querySelector("#cs-tracks-container");if(!n)return;const r=Math.min(100,Math.round(o.tick/l.TIMELINE_DURATION_TICKS*100)),t=o.recordedEchoes.map(a=>{const d=Math.min(100,Math.round(a.frames.length/l.TIMELINE_DURATION_TICKS*100));return`
          <div class="cs-track-row">
            <span style="width:78px; font-weight:700; color:${a.color};">${a.label}</span>
            <div class="cs-track-bar">
              <div class="cs-track-fill" style="width:${d}%; background:${a.color}; opacity:0.65;"></div>
            </div>
            <span style="width:45px; text-align:right; color:#94a3b8;">${(a.frames.length*.05).toFixed(1)}s</span>
          </div>
        `}).join(""),c=`
      <div class="cs-track-row">
        <span style="width:78px; font-weight:800; color:#10b981;">LIVE #${o.loopNumber}</span>
        <div class="cs-track-bar">
          <div class="cs-track-fill" style="width:${r}%; background:#10b981;"></div>
        </div>
        <span style="width:45px; text-align:right; color:#10b981;">${(o.tick*.05).toFixed(1)}s</span>
      </div>
    `;n.innerHTML=t+c}renderTelemetryLog(o){const n=o.telemetryLog[0]?`${o.telemetryLog[0].tick}-${o.telemetryLog[0].message}`:"";if(this.lastLogHead===n)return;this.lastLogHead=n;const r=this.container.querySelector("#cs-telemetry-log");r&&(r.innerHTML=o.telemetryLog.slice(0,12).map(t=>`
        <li>
          <strong style="color:#38bdf8;">[T=${(t.tick*.05).toFixed(1)}s]</strong>
          ${t.message}
        </li>
      `).join(""))}renderOverlayBanner(o,n){if(this.lastRenderedStatus===o.status&&this.lastRenderedLoop===o.loopNumber)return;this.lastRenderedStatus=o.status,this.lastRenderedLoop=o.loopNumber;const r=this.container.querySelector("#cs-stage-clear-banner");if(r)if(o.status==="STAGE_CLEAR"){const t=o.stageSummaries[o.stageSummaries.length-1];r.hidden=!1,r.innerHTML=`
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <h3 style="margin:0 0 4px; color:#10b981;">
              🚁 SECTOR ${o.stageNumber} EXTRACTED! (+${t?.stageScore??0} PTS)
            </h3>
            <p style="margin:0; font-size:0.82rem; color:#e2e8f0;">
              Cracked in <strong>${((t?.ticksUsed??0)*.05).toFixed(1)}s</strong> using
              <strong>${t?.echoesUsed??1} Timeline(s)</strong> (Par: ${t?.parEchoCount??2}).
            </p>
          </div>
          <button type="button" class="cs-btn cs-btn-primary" id="cs-btn-advance-stage">
            ▶ Deploy to Sector ${o.stageNumber+1} [Enter]
          </button>
        </div>
      `,r.querySelector("#cs-btn-advance-stage")?.addEventListener("click",()=>{this.callbacks.onAction({type:"NEXT_STAGE"})})}else if(o.status==="VICTORY"||o.status==="GAME_OVER"){const t=M(o);r.hidden=!1,r.innerHTML=`
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <span class="cs-badge" style="border-color:${t.accentColor}; color:${t.accentColor};">
              ${o.status==="VICTORY"?"🏆 GRAND 4D HEIST COMPLETE":"💥 TIMELINE COLLAPSED"}
            </span>
            <h3 style="margin:4px 0; color:${t.accentColor};">
              Rank Earned: ${t.title} — ${t.subtitle}
            </h3>
            <p style="margin:0 0 6px; font-size:0.82rem; color:#cbd5e1;">${t.summary}</p>
            <div style="font-size:0.76rem; color:#94a3b8;">
              Final Score: <strong>${o.score.toLocaleString()}</strong> · Career High: <strong>${n.highScore.toLocaleString()}</strong> · Vaults Cracked: <strong>${o.stageSummaries.length}/${l.TOTAL_STAGES}</strong>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="cs-btn cs-btn-primary" id="cs-btn-play-again">
              ↻ Run New Seed Heist
            </button>
          </div>
        </div>
      `,r.querySelector("#cs-btn-play-again")?.addEventListener("click",()=>{this.callbacks.onRestart()})}else r.hidden=!0}renderDossierModal(o,n){const r=this.container.querySelector("#cs-dossier-body");if(!r)return;const t=Object.values(k).map(c=>{const a=n.discoveredRanks.includes(c.id);return`
          <div style="padding:8px 10px; border-radius:8px; border:1px solid ${a?c.accentColor:"#1e293b"}; background:#0f172a; margin-bottom:6px;">
            <div style="font-weight:800; color:${a?c.accentColor:"#64748b"};">
              ${a?"★ ":"🔒 "}${c.title} (${c.subtitle})
            </div>
            <div style="font-size:0.75rem; color:#cbd5e1;">${c.summary}</div>
          </div>
        `}).join("");r.innerHTML=`
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-bottom:12px;">
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Career High Score</div>
          <div class="cs-kpi-val">${n.highScore.toLocaleString()}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Grand Heists Completed</div>
          <div class="cs-kpi-val">${n.heistsCompleted}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Total Vaults Cracked</div>
          <div class="cs-kpi-val">${n.totalVaultsCracked}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Ghost Echoes Deployed</div>
          <div class="cs-kpi-val">${n.totalEchoesDeployed}</div>
        </div>
      </div>
      <h4 style="margin:8px 0 6px; color:#e2e8f0;">4D Syndicate Master Ranks (${n.discoveredRanks.length}/4 Unlocked)</h4>
      ${t}
    `}drawCanvas(o,n,r){const t=this.ctx;if(!t)return;const c=l.ARENA_WIDTH,a=l.ARENA_HEIGHT;t.clearRect(0,0,c,a),t.fillStyle="#050a14",t.fillRect(0,0,c,a),t.strokeStyle="rgba(56, 189, 248, 0.07)",t.lineWidth=1;for(let i=0;i<=c;i+=40)t.beginPath(),t.moveTo(i,0),t.lineTo(i,a),t.stroke();for(let i=0;i<=a;i+=40)t.beginPath(),t.moveTo(0,i),t.lineTo(c,i),t.stroke();t.save(),t.beginPath(),t.arc(n.extractionPos.x,n.extractionPos.y,l.EXTRACTION_PAD_RADIUS,0,Math.PI*2),t.fillStyle=o.coreCarrierLabel?"rgba(16, 185, 129, 0.22)":"rgba(56, 189, 248, 0.09)",t.fill(),t.lineWidth=2,t.setLineDash([6,4]),t.strokeStyle=o.coreCarrierLabel?"#10b981":"#38bdf8",t.stroke(),t.setLineDash([]),t.fillStyle="#93c5fd",t.font="bold 10px Inter, sans-serif",t.fillText("EXTRACT PAD",n.extractionPos.x-34,n.extractionPos.y+4),t.restore();for(const i of o.recordedEchoes)if(!(i.frames.length<2)){t.save(),t.beginPath();for(let p=0;p<i.frames.length;p+=2){const u=i.frames[p];p===0?t.moveTo(u.x,u.y):t.lineTo(u.x,u.y)}t.strokeStyle=i.color,t.globalAlpha=.25,t.lineWidth=2,t.setLineDash([4,4]),t.stroke(),t.restore()}for(const i of o.switches){const p=i.pressed||i.holdTimerTicks>0;t.save(),t.beginPath(),t.arc(i.x,i.y,l.SWITCH_INTERACT_RADIUS-6,0,Math.PI*2),t.fillStyle=p?"rgba(16, 185, 129, 0.28)":"rgba(15, 23, 42, 0.85)",t.fill(),t.lineWidth=2.5,t.strokeStyle=p?"#10b981":i.color,t.stroke(),t.fillStyle="#e2e8f0",t.font="bold 10px Inter, sans-serif",t.fillText(i.label,i.x-36,i.y-32),t.restore()}for(const i of o.terminals){const p=Math.min(1,i.progressTicks/i.hackTicksRequired);t.save(),t.beginPath(),t.arc(i.x,i.y,18,0,Math.PI*2),t.fillStyle=i.hacked?"rgba(16, 185, 129, 0.3)":"rgba(56, 189, 248, 0.16)",t.fill(),t.lineWidth=2.5,t.strokeStyle=i.hacked?"#10b981":"#38bdf8",t.stroke(),!i.hacked&&p>0&&(t.beginPath(),t.arc(i.x,i.y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*p),t.strokeStyle="#f59e0b",t.lineWidth=3,t.stroke()),t.fillStyle=i.hacked?"#6ee7b7":"#bae6fd",t.font="bold 10px Inter, sans-serif",t.fillText(i.hacked?`✓ ${i.label}`:`${i.label} (${Math.round(p*100)}%)`,i.x-42,i.y-26),t.restore()}for(const i of n.walls)t.fillStyle="#1e293b",t.fillRect(i.x,i.y,i.w,i.h),t.strokeStyle="#334155",t.lineWidth=1.5,t.strokeRect(i.x,i.y,i.w,i.h);for(const i of o.laserGates)t.save(),t.beginPath(),t.moveTo(i.x1,i.y1),t.lineTo(i.x2,i.y2),i.isOpen?(t.strokeStyle="rgba(16, 185, 129, 0.28)",t.setLineDash([4,6]),t.lineWidth=2):(t.strokeStyle="#f43f5e",t.lineWidth=4),t.stroke(),t.restore();o.coreExtracted||(t.save(),t.beginPath(),t.arc(o.corePos.x,o.corePos.y,16,0,Math.PI*2),t.fillStyle=o.vaultUnlocked?"rgba(245, 158, 11, 0.35)":"rgba(244, 63, 94, 0.2)",t.fill(),t.lineWidth=2.5,t.strokeStyle=o.vaultUnlocked?"#f59e0b":"#f43f5e",t.stroke(),t.fillStyle="#fef08a",t.font="bold 10px Inter, sans-serif",t.fillText(o.coreCarrierLabel?"💎 CORE ACTIVE":o.vaultUnlocked?"💎 CHRONOS CORE (OPEN)":"🔒 VAULT LOCKED",o.corePos.x-48,o.corePos.y-22),t.restore());for(const i of o.decoys)t.save(),t.beginPath(),t.arc(i.x,i.y,12,0,Math.PI*2),t.fillStyle="rgba(245, 158, 11, 0.35)",t.fill(),t.strokeStyle="#f59e0b",t.lineWidth=2,t.setLineDash([3,3]),t.stroke(),t.setLineDash([]),t.fillStyle="#fde68a",t.font="bold 9px Inter, sans-serif",t.fillText("🎭 DECOY",i.x-22,i.y-16),t.restore();for(const i of o.empPulses)t.save(),t.beginPath(),t.arc(i.x,i.y,i.radius,0,Math.PI*2),t.strokeStyle=i.color,t.globalAlpha=Math.max(.1,i.remainingTicks/14),t.lineWidth=3,t.stroke(),t.restore();for(const i of o.sentinels)t.save(),i.stunnedTicks<=0&&(t.beginPath(),t.moveTo(i.x,i.y),t.arc(i.x,i.y,i.visionRange,i.facingRad-i.visionAngleRad*.5,i.facingRad+i.visionAngleRad*.5),t.closePath(),t.fillStyle=i.alerted?"rgba(244, 63, 94, 0.28)":"rgba(244, 63, 94, 0.11)",t.fill()),t.beginPath(),t.arc(i.x,i.y,13,0,Math.PI*2),t.fillStyle=i.stunnedTicks>0?"#38bdf8":i.alerted?"#f43f5e":"#e11d48",t.fill(),t.lineWidth=2,t.strokeStyle="#fda4af",t.stroke(),t.fillStyle="#fecdd3",t.font="bold 9px Inter, sans-serif",t.fillText(i.stunnedTicks>0?`⚡ STUNNED (${(i.stunnedTicks*.05).toFixed(1)}s)`:i.name,i.x-36,i.y-18),t.restore();for(const i of o.activeGhosts){if(!i.active)continue;Math.hypot(o.agent.x-i.x,o.agent.y-i.y)<=l.TEMPORAL_RESONANCE_RADIUS&&(t.save(),t.beginPath(),t.moveTo(o.agent.x,o.agent.y),t.lineTo(i.x,i.y),t.strokeStyle="#38bdf8",t.lineWidth=2.5,t.setLineDash([4,3]),t.stroke(),t.restore()),t.save(),t.beginPath(),t.arc(i.x,i.y,l.AGENT_RADIUS,0,Math.PI*2),t.fillStyle=i.color,t.globalAlpha=.72,t.fill(),t.globalAlpha=1,t.lineWidth=2,t.strokeStyle="#ffffff",t.stroke(),t.fillStyle=i.color,t.font="bold 10px Inter, sans-serif",t.fillText(i.label,i.x-24,i.y-18),t.restore()}t.save(),t.beginPath(),t.arc(o.agent.x,o.agent.y,l.AGENT_RADIUS,0,Math.PI*2),t.fillStyle="#10b981",t.fill(),t.lineWidth=2.5,t.strokeStyle="#ecfdf5",t.stroke(),t.beginPath(),t.moveTo(o.agent.x,o.agent.y),t.lineTo(o.agent.x+Math.cos(o.agent.facingRad)*18,o.agent.y+Math.sin(o.agent.facingRad)*18),t.strokeStyle="#ecfdf5",t.lineWidth=2,t.stroke(),t.fillStyle="#6ee7b7",t.font="bold 10px Inter, sans-serif",t.fillText(`YOU (#${o.loopNumber})`,o.agent.x-24,o.agent.y-18),t.restore();const d=r/1e3;for(let i=this.popups.length-1;i>=0;i--){const p=this.popups[i];if(p.y+=p.vy*d,p.alpha-=.75*d,p.alpha<=0){this.popups.splice(i,1);continue}t.save(),t.globalAlpha=Math.max(0,p.alpha),t.fillStyle=p.color,t.font="bold 11px Inter, sans-serif",t.fillText(p.text,Math.max(12,Math.min(c-180,p.x-40)),Math.max(18,p.y)),t.restore()}}destroy(){window.removeEventListener("keydown",this.keydownHandler),window.removeEventListener("keyup",this.keyupHandler),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),this.container.innerHTML=""}}const z={id:l.GAME_ID,number:l.GAME_NUMBER,title:l.TITLE,subtitle:l.SUBTITLE,genre:"4D Cooperative Time-Loop Tactical Heist & Ghost-Echo Orchestrator",primaryReference:"",supportingReference:"",oneSentenceLoop:"Infiltrate high-security Quantum Vaults in 15-second time loops where every move, EMP blast, and Holo-Decoy you deploy is recorded—then rewind to T=0.0s so your autonomous Ghost Echoes hold open laser gates, decrypt dual terminals, and stun sentinels alongside your present self!",shortGoal:"Crack all 4 Panopticon Vault Sectors by choreographing up to 4 simultaneous Ghost Echoes of yourself within the same 15-second timeline.",longGoal:"Earn the Omniscient 4D Architect rank by clearing every sector at or below Par Echo count, unlocking all 4 Syndicate Ranks, and mastering the 4D Timeline Scrubber.",controlsSummary:"WASD / Arrows / Click-Drag: Move · [R]: Commit Loop & Rewind to T=0.0s · [1/Q]: EMP Pulse · [2/E]: Holo-Decoy · [3/Space]: Phase-Blink · [Z]: Undo Last Echo",accentColor:l.ACCENT_COLOR};function Q(e,o){const n=F();let r={...n.career,discoveredRanks:[...n.career.discoveredRanks],processedRunKeys:[...n.career.processedRunKeys]};const t=o?.initialSeed??l.DEFAULT_SEED;let c=o?.initialSeed===void 0&&n.activeRun&&n.activeRun.status!=="VICTORY"&&n.activeRun.status!=="GAME_OVER"?N(n.activeRun):O(t);const a=new V;let d=!1;const i=f=>{X(c,f),c.events.length>0&&(h.consumeEvents(c,c.events),c.events=[]),r=_(r,c).career,h.render(c,r,l.FIXED_STEP_MS)},p=f=>{const s=typeof f=="number"?f:c.seed+104729>>>0;c=O(s),h.resetVisuals(),r=_(r,c).career,h.render(c,r,l.FIXED_STEP_MS)},u=f=>{const s=typeof f=="boolean"?f:!h.isDebugVisible();h.setDebugVisible(s)},h=new j(e,a,{onAction:i,onRestart:p,onToggleDebug:()=>u(),onVisibilityPausedChange:f=>{d=f}},!!o?.debug);let b=0,E=performance.now(),x=0,A=!1;const S=f=>{if(A)return;const s=Math.min(100,Math.max(0,f-E));if(E=f,!d){x+=s;const g=c.status,y=c.stageNumber;for(;x>=l.FIXED_STEP_MS;)G(c,l.FIXED_STEP_MS),c.events.length>0&&(h.consumeEvents(c,c.events),c.events=[]),x-=l.FIXED_STEP_MS;(c.status!==g||c.stageNumber!==y||c.score>r.highScore)&&(r=_(r,c).career),h.render(c,r,s||l.FIXED_STEP_MS)}b=window.requestAnimationFrame(S)};return h.render(c,r,l.FIXED_STEP_MS),b=window.requestAnimationFrame(S),{destroy(){A=!0,window.cancelAnimationFrame(b),_(r,c),a.destroy(),h.destroy()},getStateSnapshot(){return N(c)},restartWithSeed(f){p(f)},toggleDebug(f){u(f),h.render(c,r,l.FIXED_STEP_MS)}}}const ee={metadata:z,mountGame:Q},ne=Object.freeze(Object.defineProperty({__proto__:null,CHRONO_CONFIG:l,ChronoAudioEngine:V,ChronoUIController:j,HEIST_RIG_MODS:Y,HEIST_STAGE_BLUEPRINTS:L,SYNDICATE_RANKS:k,SeededRng:P,applyChronoInput:X,cloneChronoState:N,commitLoopAndRewind:w,computeSyndicateRank:M,createDefaultChronoCareer:q,createInitialChronoState:O,default:ee,getStageBlueprint:R,loadChronoSave:F,metadata:z,mountGame:Q,saveChronoState:_,stepChronoState:G},Symbol.toStringTag,{value:"Module"}));export{z as a,ne as g,Q as m};
