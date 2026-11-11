import{_ as K}from"./preload-helper-Ct5FWWRu.js";const q=[261.63,293.66,329.63,369.99,392,440,493.88,523.25,587.33,659.25,739.99,783.99,880,987.77,1046.5];class J{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}isMuted(){return this.muted}setMuted(t){this.muted=t}toggleMute(){return this.muted=!this.muted,this.muted}playTone(t,o,r="sine",a=.08,l){const d=this.ensureContext();if(d)try{const i=d.currentTime,c=d.createOscillator(),u=d.createGain();c.type=r,c.frequency.setValueAtTime(t,i),l&&c.frequency.exponentialRampToValueAtTime(Math.max(40,l),i+o),u.gain.setValueAtTime(.001,i),u.gain.linearRampToValueAtTime(a,i+.012),u.gain.exponentialRampToValueAtTime(8e-4,i+o),c.connect(u),u.connect(d.destination),c.start(i),c.stop(i+o+.02)}catch{}}playEvents(t){if(!(this.muted||t.length===0))for(const o of t.slice(0,5))switch(o.type){case"COMET_LAUNCHED":this.playTone(220,.18,"triangle",.09,587.33);break;case"SOCKET_HIT":{const r=Math.min(q.length-1,Math.max(0,(o.comboCount??1)-1)),a=q[r];this.playTone(a,.14,"triangle",.075);break}case"PRISM_SPLIT":this.playTone(523.25,.2,"sine",.08,1046.5),this.playTone(659.25,.22,"triangle",.07,1318.5);break;case"LIGHTNING_ARC":this.playTone(740,.09,"sawtooth",.045,370);break;case"PERFECT_PARRY":this.playTone(440,.22,"triangle",.1,880),this.playTone(659.25,.25,"sine",.08,1318.5);break;case"FLIPPER_BOUNCE":this.playTone(196,.1,"triangle",.07,392);break;case"SONIC_NOVA":this.playTone(261.63,.45,"sine",.1),this.playTone(392,.45,"triangle",.08),this.playTone(659.25,.45,"sine",.08);break;case"BOSS_HIT":this.playTone(146.83,.12,"sawtooth",.06,98);break;case"SECTOR_VICTORY":case"GAME_VICTORY":this.playTone(523.25,.45,"triangle",.1),this.playTone(659.25,.45,"triangle",.09),this.playTone(783.99,.55,"sine",.1);break}}destroy(){if(this.ctx){try{this.ctx.close()}catch{}this.ctx=null}}}const s={GAME_ID:"12-astral-pinball",GAME_NUMBER:12,TITLE:"Oroboros: The Pinball Singularity",SUBTITLE:"Relativistic Pinball Roguelike, Orbital Gravity Wells & Multiplicative Chip×Mult Alchemy",ACCENT_COLOR:"#f59e0b",DEFAULT_SEED:20261108,TABLE_WIDTH:920,TABLE_HEIGHT:600,FIXED_STEP_MS:16,GRAVITY_Y:165,MAX_COMET_SPEED:680,MIN_COMET_SPEED:145,COMET_RADIUS:10,MAX_ACTIVE_COMETS:14,LAUNCH_ORIGIN_X:460,LAUNCH_ORIGIN_Y:538,LAUNCH_SPEED:470,PADDLE_Y:556,PADDLE_HALF_WIDTH:84,FLIPPER_SWING_DURATION_MS:160,PARRY_WINDOW_MS:150,STARTING_VOLLEYS:5,STARTING_AEGIS_HULL:100,MAX_AEGIS_HULL:100,STARTING_STARDUST:110,STARTING_FLUX:60,MAX_FLUX:100,FLUX_COST_MAGNET:25,FLUX_COST_CHRONO:30,FLUX_COST_SUPERNOVA:45,BASE_COMET_CHIPS:30,MAX_SECTORS:5},I={PRISM_SPLITTER:{type:"PRISM_SPLITTER",name:"Bifrost Prism Gate",shortLabel:"Prism Gate",symbol:"❖",costStardust:45,radius:24,elasticity:1.08,baseChipsBonus:18,comboMultBonus:.35,color:"#ec4899",glowColor:"rgba(236, 72, 153, 0.45)",summary:"Splits a striking comet into 2 chromatic twin comets (+18 Chips, +0.35× Mult).",synergyTip:"Place in upper-mid sockets so split comets cascade through Tesla Pylons below."},TESLA_PYLON:{type:"TESLA_PYLON",name:"Tesla Resonance Pylon",shortLabel:"Tesla Pylon",symbol:"⚡",costStardust:40,radius:22,elasticity:1.15,baseChipsBonus:26,comboMultBonus:.5,color:"#38bdf8",glowColor:"rgba(56, 189, 248, 0.45)",summary:"Arcs chain-lightning to up to 3 Boss Nodes/Meteors on hit (+26 Chips, +0.50× Mult).",synergyTip:"Pairs explosively with Bifrost Prisms—multiball hits trigger rapid-fire lightning storms."},GRAVITY_WELL:{type:"GRAVITY_WELL",name:"Kerr Micro-Singularity",shortLabel:"Gravity Well",symbol:"🌀",costStardust:50,radius:26,elasticity:1.22,baseChipsBonus:22,comboMultBonus:.65,color:"#a855f7",glowColor:"rgba(168, 85, 247, 0.48)",summary:"Curves nearby comets into a relativistic orbital slingshot (+32% speed, +0.65× Mult).",synergyTip:"Bends trajectories around Boss shield rings to snipe exposed rear weak points."},FORGE_ANVIL:{type:"FORGE_ANVIL",name:"Solar Forge Anvil",shortLabel:"Forge Anvil",symbol:"🔥",costStardust:35,radius:25,elasticity:1.32,baseChipsBonus:38,comboMultBonus:.25,color:"#f59e0b",glowColor:"rgba(245, 158, 11, 0.45)",summary:"High-impulse kinetic anvil that permanently temper-forges the comet (+14 permanent Comet Chips).",synergyTip:"Hit early in a volley so every subsequent bounce multiplies a higher Base Chip value."},WORMHOLE_RELAY:{type:"WORMHOLE_RELAY",name:"Ouroboros Wormhole Portal",shortLabel:"Wormhole",symbol:"⏳",costStardust:55,radius:24,elasticity:1.18,baseChipsBonus:20,comboMultBonus:.85,color:"#10b981",glowColor:"rgba(16, 185, 129, 0.45)",summary:"Teleports comets straight back to the Zenith Crown above the Boss (+0.85× Combo Mult).",synergyTip:"Wire into lower flank sockets to rescue draining comets and sustain 50+ bounce loops!"},HARMONIC_BELL:{type:"HARMONIC_BELL",name:"Celestial Bell Condenser",shortLabel:"Harmonic Bell",symbol:"🔔",costStardust:50,radius:24,elasticity:1.2,baseChipsBonus:30,comboMultBonus:.55,color:"#fde047",glowColor:"rgba(253, 224, 71, 0.45)",summary:"Rings a Lydian chord; every 3rd hit unleashes a full-table Sonic Nova (240 AoE damage + clears hazards).",synergyTip:"Essential against Sector III Drone Swarms and Sector IV Hawking Lances."}},Q=[{slotIndex:0,label:"NW Crown",x:205,y:175,zone:"UPPER_CROWN",defaultType:"FORGE_ANVIL"},{slotIndex:1,label:"NE Crown",x:715,y:175,zone:"UPPER_CROWN",defaultType:"TESLA_PYLON"},{slotIndex:2,label:"West Crucible",x:265,y:278,zone:"MID_CRUCIBLE",defaultType:"PRISM_SPLITTER"},{slotIndex:3,label:"Center Singularity",x:460,y:295,zone:"MID_CRUCIBLE",defaultType:"GRAVITY_WELL"},{slotIndex:4,label:"East Crucible",x:655,y:278,zone:"MID_CRUCIBLE",defaultType:"TESLA_PYLON"},{slotIndex:5,label:"Far West Wing",x:145,y:315,zone:"MID_CRUCIBLE",defaultType:null},{slotIndex:6,label:"Far East Wing",x:775,y:315,zone:"MID_CRUCIBLE",defaultType:null},{slotIndex:7,label:"SW Sling Gate",x:235,y:412,zone:"LOWER_SLING",defaultType:"HARMONIC_BELL"},{slotIndex:8,label:"SE Sling Gate",x:685,y:412,zone:"LOWER_SLING",defaultType:"WORMHOLE_RELAY"},{slotIndex:9,label:"Aegis Keystone",x:460,y:428,zone:"LOWER_SLING",defaultType:null}],D=[{id:"NEWTON_THIRD_LAW",name:"Newton's Principia Anvil",symbol:"⚖️",rarity:"COMMON",relicMultFactor:1.2,description:"+15 Base Chips on every socket bumper bounce and +12% bounce elasticity.",flavor:"For every action, an equal and multiplicative over-reaction."},{id:"MAXWELL_COIL",name:"Maxwell's Demon Induction",symbol:"⚡",rarity:"RARE",relicMultFactor:1.25,description:"Tesla Pylons strike +2 additional targets, deal +45% arc damage, and restore +5 Aether Flux.",flavor:"Sorting hot electrons from cold vacuum without spending entropy."},{id:"CHROMATIC_PRISM",name:"Newtonian Spectral Crown",symbol:"🌈",rarity:"LEGENDARY",relicMultFactor:1.35,description:"Bifrost Prism Gates grant +0.75× Combo Mult on split and twin comets inherit 100% of parent Chips.",flavor:"White light broken into seven lethal vectors."},{id:"HAWKING_MIRROR",name:"Hawking Reflection Foil",symbol:"🛡️",rarity:"RARE",relicMultFactor:1.25,description:"Perfect Flipper Parries fire a 260-damage Antimatter Lance directly into the Boss Core.",flavor:"What falls toward the horizon can be reflected at relativistic interest."},{id:"KEPLER_PERIHELION",name:"Kepler's Perihelion Spur",symbol:"☄️",rarity:"COMMON",relicMultFactor:1.2,description:"Comets traveling above 380 px/s gain +22 Chips per hit and ×1.20 Relic Mult.",flavor:"Equal areas swept in unequal violence."},{id:"OUROBOROS_TAIL",name:"Ouroboros Eternal Loop",symbol:"🐍",rarity:"LEGENDARY",relicMultFactor:1.4,description:"The first comet to drain each volley automatically respawns at the Zenith Crown in Supernova State!",flavor:"The end of the table is merely the jaws of the launcher."},{id:"LAPLACE_PENDULUM",name:"Laplace's Escapement",symbol:"⏱️",rarity:"COMMON",relicMultFactor:1.2,description:"Every Flipper or Aegis Paddle deflection adds +0.85× Combo Mult and +12 Aether Flux.",flavor:"Give me the position and momentum of every flipper."},{id:"PHILOSOPHER_STONE",name:"Alchemical Prima Materia",symbol:"🜚",rarity:"RARE",relicMultFactor:1.3,description:"Every 8th bounce in a volley spawns a Golden Comet and mints +18 Stardust immediately.",flavor:"Lead trajectories transmuted into solar gold."},{id:"EVENT_HORIZON_LENS",name:"Schwarzschild Gravity Lens",symbol:"🕳️",rarity:"RARE",relicMultFactor:1.25,description:"Gravity Wells pull in nearby enemy Void Meteors, vaporizing them into +30 Volley Chips.",flavor:"Even hostile fire bends to curvature."},{id:"PYTHAGOREAN_CHORD",name:"Pythagorean Sphere Resonator",symbol:"🎵",rarity:"RARE",relicMultFactor:1.28,description:"Harmonic Bells trigger Sonic Nova every 2 hits instead of 3 and grant +0.5× Combo Mult.",flavor:"There is geometry in the humming of the strings."},{id:"SUPERNOVA_IGNITER",name:"Chandrasekhar Limit Core",symbol:"☀️",rarity:"LEGENDARY",relicMultFactor:1.38,description:"All launched comets start in Supernova State (+35 starting Base Chips and +0.6× starting Mult).",flavor:"1.44 solar masses compressed into a 10-millimeter pinball."},{id:"COMPOUND_LEDGER",name:"Medici Star-Bank Astrolabe",symbol:"💎",rarity:"COMMON",relicMultFactor:1.18,description:"End-of-volley Stardust rewards and Flux interest are increased by +40%.",flavor:"Compound interest is the eighth force of the cosmos."}],U=[{sector:1,id:"clockwork-astrolabe",name:"The Clockwork Astrolabe",title:"SECTOR I // BRASS CELESTIAL AUTOMATON",maxHp:1600,coreX:460,coreY:132,coreRadius:34,orbitSpeedRadPerSec:.75,hazardIntervalMs:4200,hazardSpeed:135,stardustReward:95,color:"#38bdf8",secondaryColor:"#f59e0b",loreQuote:'"Before the stars burned hydrogen, they turned on brass teeth."',mechanicSummary:"3 rotating Astrolabe Shield Nodes orbit the core. Curve comets through the Mid Crucible or shatter the nodes for +150 bonus Chips!",nodes:[{offsetAngleDeg:0,orbitRadius:74,nodeRadius:16,hpRatio:.22,label:"Vernal Gear"},{offsetAngleDeg:120,orbitRadius:74,nodeRadius:16,hpRatio:.22,label:"Solstice Gear"},{offsetAngleDeg:240,orbitRadius:74,nodeRadius:16,hpRatio:.22,label:"Equinox Gear"}]},{sector:2,id:"gemini-pulsar",name:"The Gemini Binary Pulsar",title:"SECTOR II // TWIN MAGNETAR RESONANCE",maxHp:3600,coreX:460,coreY:134,coreRadius:36,orbitSpeedRadPerSec:-1.05,hazardIntervalMs:3600,hazardSpeed:155,stardustReward:125,color:"#ec4899",secondaryColor:"#38bdf8",loreQuote:'"Two hearts beating at 700 revolutions per second; strike one alone and the other remembers."',mechanicSummary:"Protected by 4 rapid Binary Satellites. Split your comet through a Bifrost Prism Gate to overwhelm both flanks simultaneously!",nodes:[{offsetAngleDeg:0,orbitRadius:82,nodeRadius:17,hpRatio:.2,label:"Castor Lobe"},{offsetAngleDeg:90,orbitRadius:82,nodeRadius:15,hpRatio:.18,label:"Pollux Lobe"},{offsetAngleDeg:180,orbitRadius:82,nodeRadius:17,hpRatio:.2,label:"Castor Mirror"},{offsetAngleDeg:270,orbitRadius:82,nodeRadius:15,hpRatio:.18,label:"Pollux Mirror"}]},{sector:3,id:"hydra-dyson-swarm",name:"The Hydra Dyson Swarm",title:"SECTOR III // SELF-REPLICATING SOLAR LATTICE",maxHp:7200,coreX:460,coreY:136,coreRadius:38,orbitSpeedRadPerSec:1.2,hazardIntervalMs:3e3,hazardSpeed:170,stardustReward:160,color:"#10b981",secondaryColor:"#fde047",loreQuote:'"A billion hexagonal mirrors drinking the sun drop by drop."',mechanicSummary:"5 Dyson Collector Nodes fire Void Meteors toward your Aegis rail. Use Tesla Pylons and Harmonic Bells to clear the swarm!",nodes:[{offsetAngleDeg:0,orbitRadius:86,nodeRadius:15,hpRatio:.18,label:"Hex Array α"},{offsetAngleDeg:72,orbitRadius:86,nodeRadius:15,hpRatio:.18,label:"Hex Array β"},{offsetAngleDeg:144,orbitRadius:86,nodeRadius:15,hpRatio:.18,label:"Hex Array γ"},{offsetAngleDeg:216,orbitRadius:86,nodeRadius:15,hpRatio:.18,label:"Hex Array δ"},{offsetAngleDeg:288,orbitRadius:86,nodeRadius:15,hpRatio:.18,label:"Hex Array ε"}]},{sector:4,id:"event-horizon-leviathan",name:"The Event Horizon Leviathan",title:"SECTOR IV // GRAVITATIONAL ABYSS SOVEREIGN",maxHp:13500,coreX:460,coreY:138,coreRadius:40,orbitSpeedRadPerSec:-1.35,hazardIntervalMs:2600,hazardSpeed:190,stardustReward:210,color:"#a855f7",secondaryColor:"#f43f5e",loreQuote:'"Look into the accretion disk: every comet you ever lost is still falling."',mechanicSummary:"Warps upper-table trajectories and launches Hawking Lances. Parry Lances with your Flippers and wire Ouroboros Wormholes for infinite zenith drops!",nodes:[{offsetAngleDeg:30,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang I"},{offsetAngleDeg:90,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang II"},{offsetAngleDeg:150,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang III"},{offsetAngleDeg:210,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang IV"},{offsetAngleDeg:270,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang V"},{offsetAngleDeg:330,orbitRadius:90,nodeRadius:16,hpRatio:.17,label:"Accretion Fang VI"}]},{sector:5,id:"oroboros-grand-architect",name:"OROBOROS, THE SINGULARITY ENGINE",title:"SECTOR V // OMEGA ARCHITECT OF ETERNAL RETURN",maxHp:25e3,coreX:460,coreY:140,coreRadius:44,orbitSpeedRadPerSec:1.55,hazardIntervalMs:2200,hazardSpeed:210,stardustReward:350,color:"#f59e0b",secondaryColor:"#ec4899",loreQuote:'"The universe is a pinball table that builds its own bumpers out of dead stars."',mechanicSummary:"6 Celestial Seals guard the Omega Core. Combine Multiball Splits, Wormhole Loops, Magnet Pulses, and Flipper Parries for a 10,000+ damage Singularity Volley!",nodes:[{offsetAngleDeg:0,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Chronos"},{offsetAngleDeg:60,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Aether"},{offsetAngleDeg:120,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Prism"},{offsetAngleDeg:180,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Volt"},{offsetAngleDeg:240,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Mass"},{offsetAngleDeg:300,orbitRadius:94,nodeRadius:17,hpRatio:.16,label:"Seal of Return"}]}],P={SINGULARITY_SOVEREIGN:{id:"SINGULARITY_SOVEREIGN",title:"Grand Architect of the Singularity",badge:"👑 OMEGA ARCHITECT",description:"You shattered all 5 Cosmic Boss Constellations and engineered a self-sustaining relativistic pinball engine."},MULTIBALL_ALCHEMIST:{id:"MULTIBALL_ALCHEMIST",title:"Chromatic Multiball Alchemist",badge:"🌈 PRISM SAVANT",description:"Your Bifrost Prism cascades and Tesla lightning chains turned single comets into exponential storms."},PARRY_VIRTUOSO:{id:"PARRY_VIRTUOSO",title:"Relativistic Flipper Virtuoso",badge:"⚡ PARRY MASTER",description:"With razor-sharp Perfect Parries and Magnet Pulses, you reflected the cosmos back upon itself."},ENTROPY_PILGRIM:{id:"ENTROPY_PILGRIM",title:"Initiate of the Astral Table",badge:"☄️ STARFORGE INITIATE",description:"Every drained comet teaches the geometry of the stars. Re-wire your upper sockets and launch again!"}};class B{state;constructor(t){const o=Number.isFinite(t)?Math.floor(Math.abs(t)):20261108;this.state=(o===0?1831565813:o)>>>0}getState(){return this.state>>>0}setState(t){this.state=(t===0?1831565813:t)>>>0}nextUint32(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),(t^t>>>14)>>>0}nextFloat(){return this.nextUint32()/4294967296}nextRange(t,o){return t+this.nextFloat()*(o-t)}nextInt(t,o){if(o<=t)return t;const r=o-t+1;return t+this.nextUint32()%r}pick(t){if(t.length===0)throw new Error("Cannot pick from empty array");return t[this.nextInt(0,t.length-1)]}shuffle(t){const o=[...t];for(let r=o.length-1;r>0;r--){const a=this.nextInt(0,r),l=o[r];o[r]=o[a],o[a]=l}return o}}function A(e,t,o){return Math.max(t,Math.min(o,e))}function x(e,t){e.recentLog.unshift(t),e.recentLog.length>18&&(e.recentLog.length=18)}function k(e){let t=1;for(const o of e){const r=D.find(a=>a.id===o);r&&(t*=r.relicMultFactor)}return Number(t.toFixed(2))}function X(e){const t=A(e-1,0,U.length-1),o=U[t],r=o.nodes.map((a,l)=>{const d=a.offsetAngleDeg*Math.PI/180,i=Math.round(o.maxHp*a.hpRatio);return{id:l+1,label:a.label,angleOffsetRad:d,orbitRadius:a.orbitRadius,x:o.coreX+Math.cos(d)*a.orbitRadius,y:o.coreY+Math.sin(d)*a.orbitRadius,radius:a.nodeRadius,hp:i,maxHp:i,alive:!0}});return{sector:o.sector,id:o.id,name:o.name,title:o.title,hp:o.maxHp,maxHp:o.maxHp,coreX:o.coreX,coreY:o.coreY,coreRadius:o.coreRadius,orbitAngleRad:0,orbitSpeedRadPerSec:o.orbitSpeedRadPerSec,hazardIntervalMs:o.hazardIntervalMs,hazardTimerMs:o.hazardIntervalMs,hazardSpeed:o.hazardSpeed,stardustReward:o.stardustReward,color:o.color,secondaryColor:o.secondaryColor,loreQuote:o.loreQuote,mechanicSummary:o.mechanicSummary,hitFlashMs:0,nodes:r}}function Z(e,t){const o=D.map(a=>a.id).filter(a=>!t.includes(a));return o.length===0?[]:e.shuffle(o).slice(0,3)}function H(e=s.DEFAULT_SEED,t="CAMPAIGN"){const o=new B(e),r=Q.map(i=>({slotIndex:i.slotIndex,label:i.label,x:i.x,y:i.y,zone:i.zone,nodeType:i.defaultType,level:1,chargeCount:0,pulseAnimMs:0,totalHits:0,totalDamageGenerated:0})),l=[t==="SANDBOX"?"CHROMATIC_PRISM":"NEWTON_THIRD_LAW"],d={seed:o.getState(),rngState:o.getState(),runId:`astral-${e}-${t}-${o.nextUint32()}`,mode:t,status:"AIMING",sector:1,tick:0,elapsedMs:0,sectorElapsedMs:0,volleysRemaining:t==="SANDBOX"?99:s.STARTING_VOLLEYS,volleysFired:0,aegisHull:s.STARTING_AEGIS_HULL,maxAegisHull:s.MAX_AEGIS_HULL,stardust:t==="SANDBOX"?999:s.STARTING_STARDUST,flux:s.STARTING_FLUX,maxFlux:s.MAX_FLUX,totalScore:0,bestVolleyScore:0,currentVolleyScore:0,currentVolleyChips:0,currentComboMult:1,currentRelicMult:k(l),currentVolleyBounces:0,maxComboBounces:0,totalSplitsTriggered:0,totalPerfectParries:0,totalLightningChains:0,totalBossDamageDealt:0,aimAngleDeg:-14,paddleX:s.LAUNCH_ORIGIN_X,leftFlipperSwingMs:0,rightFlipperSwingMs:0,parryWindowMs:0,chronoOverdriveMs:0,hitStopMs:0,ouroborosSaveUsedThisVolley:!1,selectedBuildType:"PRISM_SPLITTER",nextEntityId:100,comets:[],sockets:r,boss:X(1),hazards:[],relics:l,relicChoices:[],events:[],recentLog:["☄️ Star-Comet chambered in the Aegis Slingshot. Aim and press [SPACE] or Click to launch!"]};return d.rngState=o.getState(),d}function _(e){return structuredClone(e)}function L(e,t,o,r,a){if(e.boss.hp<=0)return 0;const l=Math.max(1,Math.round(t));return e.boss.hp=Math.max(0,e.boss.hp-l),e.boss.hitFlashMs=140,e.totalBossDamageDealt+=l,e.currentVolleyScore+=l,e.totalScore+=l,e.currentVolleyScore>e.bestVolleyScore&&(e.bestVolleyScore=e.currentVolleyScore),e.events.push({type:"BOSS_HIT",x:r,y:a,value:l,label:`${o} -${l}`,color:"#f59e0b",comboCount:e.currentVolleyBounces}),e.boss.hp<=0&&pe(e),l}function pe(e){if(e.status==="SECTOR_CLEARED"||e.status==="VICTORY")return;const t=Math.floor(e.flux/5),o=e.relics.includes("COMPOUND_LEDGER")?1.4:1,r=Math.round((e.boss.stardustReward+t*4)*o);if(e.stardust+=r,e.comets=[],e.hazards=[],e.sector>=s.MAX_SECTORS&&e.mode==="CAMPAIGN"){e.status="VICTORY";const l=e.volleysRemaining*2500+e.aegisHull*50;e.totalScore+=l,e.events.push({type:"GAME_VICTORY",x:e.boss.coreX,y:e.boss.coreY,value:e.totalScore,label:"OROBOROS SINGULARITY CONQUERED!",color:"#fde047"}),x(e,`👑 OMEGA VICTORY! Shattered ${e.boss.name} (+${r}✦ Stardust, +${l} Mastery Score)!`);return}const a=new B(e.rngState);e.relicChoices=Z(a,e.relics),e.rngState=a.getState(),e.status="SECTOR_CLEARED",e.events.push({type:"SECTOR_VICTORY",x:e.boss.coreX,y:e.boss.coreY,value:r,label:`${e.boss.name} Shattered! +${r}✦`,color:"#10b981"}),x(e,`🌟 SECTOR ${e.sector} CLEARED! Earned +${r}✦ Stardust. Draft a Relic to ascend!`)}function he(e,t,o){const r=e.relics.includes("MAXWELL_COIL"),a=(r?4:2)+(t.level-1),l=(o.baseChips+28*t.level)*e.currentComboMult*e.currentRelicMult*(r?1.45:1);r&&(e.flux=Math.min(e.maxFlux,e.flux+5));const d=[];for(const c of e.boss.nodes)if(c.alive){const u=Math.hypot(c.x-t.x,c.y-t.y);d.push({kind:"NODE",x:c.x,y:c.y,dist:u,refId:c.id})}for(const c of e.hazards)if(!c.reflected){const u=Math.hypot(c.x-t.x,c.y-t.y);d.push({kind:"HAZARD",x:c.x,y:c.y,dist:u,refId:c.id})}d.push({kind:"CORE",x:e.boss.coreX,y:e.boss.coreY,dist:Math.hypot(e.boss.coreX-t.x,e.boss.coreY-t.y),refId:0}),d.sort((c,u)=>c.dist-u.dist);const i=d.slice(0,a);for(const c of i){if(e.totalLightningChains+=1,e.events.push({type:"LIGHTNING_ARC",x:t.x,y:t.y,targetX:c.x,targetY:c.y,value:Math.round(l),color:"#38bdf8"}),c.kind==="HAZARD")e.hazards=e.hazards.filter(u=>u.id!==c.refId),e.currentVolleyChips+=25;else if(c.kind==="NODE"){const u=e.boss.nodes.find(y=>y.id===c.refId);if(u&&u.alive){const y=Math.round(l*.75);u.hp-=y,t.totalDamageGenerated+=y,L(e,y*.55,"⚡ Tesla Arc",u.x,u.y),u.hp<=0&&(u.alive=!1,e.stardust+=12,e.currentVolleyChips+=120,e.events.push({type:"NODE_DESTROYED",x:u.x,y:u.y,label:`${u.label} Broken!`,color:"#38bdf8"}))}}else{const u=L(e,l*.85,"⚡ Tesla Core Arc",c.x,c.y);t.totalDamageGenerated+=u}if(e.status!=="IN_VOLLEY")break}}function be(e,t){const o=Math.round((220*t.level+e.currentVolleyChips*.5)*e.currentComboMult*e.currentRelicMult),r=e.hazards.length;e.hazards=[],e.currentVolleyChips+=r*35;for(const l of e.boss.nodes)l.alive&&(l.hp-=Math.round(o*.5),l.hp<=0&&(l.alive=!1,e.stardust+=12));e.events.push({type:"SONIC_NOVA",x:t.x,y:t.y,value:o,label:`🔔 SONIC NOVA! ${o}`,color:"#fde047"});const a=L(e,o,"🔔 Sonic Nova",e.boss.coreX,e.boss.coreY);t.totalDamageGenerated+=a,x(e,`🔔 Harmonic Bell unleashed a Sonic Nova for ${a} Boss Damage and cleared ${r} hazards!`)}function ye(e,t,o,r){if(!o.nodeType)return;const a=I[o.nodeType];let l=t.x-o.x,d=t.y-o.y;const i=Math.hypot(l,d)||1;l/=i,d/=i;const c=t.radius+a.radius+2-i;c>0&&(t.x+=l*c,t.y+=d*c);const u=Math.hypot(t.vx,t.vy),y=t.vx*l+t.vy*d,g=e.relics.includes("NEWTON_THIRD_LAW")?1.12:1,m=A(u*a.elasticity*g,s.MIN_COMET_SPEED+40,s.MAX_COMET_SPEED);let n=t.vx-2*y*l,b=t.vy-2*y*d;const h=(r.nextFloat()-.5)*.14,p=Math.cos(h),f=Math.sin(h),S=n*p-b*f,C=n*f+b*p,V=Math.hypot(S,C)||1;t.vx=S/V*m,t.vy=C/V*m,t.lastSocketHitId=o.slotIndex,t.socketCooldownMs=110;const F=1+(o.level-1)*.35,se=e.relics.includes("NEWTON_THIRD_LAW")?15:0,ce=e.relics.includes("KEPLER_PERIHELION")&&m>380?22:0,G=Math.round((a.baseChipsBonus*F+se+ce)*(t.isSupernova?1.3:1)),de=Number((a.comboMultBonus*F).toFixed(2));t.baseChips+=Math.round(G*.35),e.currentVolleyChips+=G,e.currentComboMult=Number((e.currentComboMult+de).toFixed(2)),e.currentVolleyBounces+=1,e.currentVolleyBounces>e.maxComboBounces&&(e.maxComboBounces=e.currentVolleyBounces),e.flux=Math.min(e.maxFlux,e.flux+4),o.pulseAnimMs=220,o.totalHits+=1;const Y=Math.round(G*e.currentComboMult*e.currentRelicMult);switch(e.currentVolleyScore+=Y,e.totalScore+=Y,e.currentVolleyScore>e.bestVolleyScore&&(e.bestVolleyScore=e.currentVolleyScore),e.events.push({type:"SOCKET_HIT",x:o.x,y:o.y,value:Y,label:`${a.symbol} +${G} Chips · ${e.currentComboMult.toFixed(1)}×`,color:a.color,comboCount:e.currentVolleyBounces}),e.relics.includes("PHILOSOPHER_STONE")&&e.currentVolleyBounces%8===0&&e.comets.length<s.MAX_ACTIVE_COMETS&&(e.stardust+=18,e.comets.push({id:e.nextEntityId++,x:o.x,y:o.y-16,vx:-t.vx*.95,vy:-Math.abs(t.vy),radius:s.COMET_RADIUS,baseChips:t.baseChips+25,isSupernova:!0,splitGeneration:t.splitGeneration+1,color:"#fde047",lastSocketHitId:o.slotIndex,socketCooldownMs:140,trail:[]})),o.nodeType){case"PRISM_SPLITTER":{const E=e.relics.includes("CHROMATIC_PRISM");if(E&&(e.currentComboMult=Number((e.currentComboMult+.75).toFixed(2))),e.comets.length<s.MAX_ACTIVE_COMETS&&t.splitGeneration<3){const M=Math.atan2(t.vy,t.vx),R=.38,v=Math.hypot(t.vx,t.vy);t.vx=Math.cos(M-R)*v,t.vy=Math.sin(M-R)*v,t.splitGeneration+=1;const ue=E?t.baseChips:Math.round(t.baseChips*.85);e.comets.push({id:e.nextEntityId++,x:t.x,y:t.y,vx:Math.cos(M+R)*v,vy:Math.sin(M+R)*v,radius:s.COMET_RADIUS,baseChips:ue,isSupernova:t.isSupernova,splitGeneration:t.splitGeneration,color:"#f472b6",lastSocketHitId:o.slotIndex,socketCooldownMs:140,trail:[]}),e.totalSplitsTriggered+=1,e.events.push({type:"PRISM_SPLIT",x:o.x,y:o.y,label:"❖ PRISM MULTIBALL SPLIT!",color:"#ec4899"})}break}case"TESLA_PYLON":{he(e,o,t);break}case"GRAVITY_WELL":{const E=e.boss.coreX-t.x,M=e.boss.coreY-t.y,R=Math.hypot(E,M)||1,v=A(m*1.32,320,s.MAX_COMET_SPEED);t.vx=E/R*v,t.vy=M/R*v;break}case"FORGE_ANVIL":{const E=14*o.level;t.baseChips+=E,t.isSupernova=!0,t.color="#fb923c";break}case"WORMHOLE_RELAY":{t.x=e.boss.coreX+(r.nextFloat()-.5)*90,t.y=66;const E=e.boss.coreX-t.x,M=e.boss.coreY-t.y,R=Math.hypot(E,M)||1,v=A(m*1.15,340,s.MAX_COMET_SPEED);t.vx=E/R*v,t.vy=M/R*v,t.isSupernova=!0,e.events.push({type:"WORMHOLE_WARP",x:o.x,y:o.y,targetX:t.x,targetY:t.y,label:"⏳ ZENITH WARP!",color:"#10b981"});break}case"HARMONIC_BELL":{o.chargeCount+=1;const E=e.relics.includes("PYTHAGOREAN_CHORD")?2:3;e.relics.includes("PYTHAGOREAN_CHORD")&&(e.currentComboMult=Number((e.currentComboMult+.5).toFixed(2))),o.chargeCount>=E&&(o.chargeCount=0,be(e,o));break}}}function T(e,t){const o=new B(e.rngState);switch(t.type){case"SET_AIM_ANGLE":{e.aimAngleDeg=A(t.angleDeg,-72,72);break}case"ADJUST_AIM_ANGLE":{e.aimAngleDeg=A(e.aimAngleDeg+t.deltaDeg,-72,72);break}case"MOVE_PADDLE":{e.paddleX=A(t.x,140,s.TABLE_WIDTH-140);break}case"NUDGE_PADDLE":{e.paddleX=A(e.paddleX+t.dx,140,s.TABLE_WIDTH-140);break}case"SELECT_BUILD_TYPE":{e.selectedBuildType=t.nodeType;break}case"BUILD_OR_UPGRADE_SOCKET":{const r=e.sockets.find(d=>d.slotIndex===t.slotIndex);if(!r)break;const a=t.nodeType??e.selectedBuildType,l=I[a];if(r.nodeType===a){if(r.level>=3)break;const d=Math.round(l.costStardust*.85*r.level);if(e.stardust<d&&e.mode!=="SANDBOX")break;e.mode!=="SANDBOX"&&(e.stardust-=d),r.level+=1,r.pulseAnimMs=260,x(e,`🔨 Upgraded ${l.name} at ${r.label} to Lv.${r.level}!`)}else{const d=l.costStardust;if(e.stardust<d&&e.mode!=="SANDBOX")break;e.mode!=="SANDBOX"&&(e.stardust-=d),r.nodeType=a,r.level=1,r.chargeCount=0,r.pulseAnimMs=260,x(e,`✨ Wired ${l.name} (${l.symbol}) into ${r.label}!`)}break}case"SELL_SOCKET":{const r=e.sockets.find(d=>d.slotIndex===t.slotIndex);if(!r||!r.nodeType)break;const a=I[r.nodeType],l=Math.round(a.costStardust*.65*r.level);e.mode!=="SANDBOX"&&(e.stardust+=l),x(e,`♻️ Salvaged ${a.name} from ${r.label} for +${l}✦ Stardust.`),r.nodeType=null,r.level=1,r.chargeCount=0;break}case"LAUNCH_COMET":{if(e.status!=="AIMING"&&e.comets.length>0||e.volleysRemaining<=0&&e.mode!=="SANDBOX")break;typeof t.angleDeg=="number"&&(e.aimAngleDeg=A(t.angleDeg,-72,72)),e.mode!=="SANDBOX"&&(e.volleysRemaining-=1),e.volleysFired+=1,e.status="IN_VOLLEY",e.ouroborosSaveUsedThisVolley=!1;const r=e.relics.includes("SUPERNOVA_IGNITER"),a=s.BASE_COMET_CHIPS+(r?35:0);e.currentVolleyScore=0,e.currentVolleyChips=a,e.currentComboMult=r?1.6:1,e.currentRelicMult=k(e.relics),e.currentVolleyBounces=0;const l=(e.aimAngleDeg-90)*Math.PI/180,d=Math.cos(l)*s.LAUNCH_SPEED,i=Math.sin(l)*s.LAUNCH_SPEED,c=A(e.paddleX,160,s.TABLE_WIDTH-160),u=s.LAUNCH_ORIGIN_Y;e.comets.push({id:e.nextEntityId++,x:c,y:u,vx:d,vy:i,radius:s.COMET_RADIUS,baseChips:a,isSupernova:r,splitGeneration:0,color:r?"#fde047":"#38bdf8",lastSocketHitId:null,socketCooldownMs:0,trail:[]}),e.events.push({type:"COMET_LAUNCHED",x:c,y:u,label:`☄️ Volley Launched (${e.aimAngleDeg.toFixed(0)}°)`,color:"#38bdf8"}),x(e,`☄️ Launched Star-Comet at ${e.aimAngleDeg.toFixed(0)}° (${a} Base Chips × ${e.currentRelicMult}× Relic Mult).`);break}case"FLIP_SWING":{const r=t.side??"BOTH";(r==="LEFT"||r==="BOTH")&&(e.leftFlipperSwingMs=s.FLIPPER_SWING_DURATION_MS),(r==="RIGHT"||r==="BOTH")&&(e.rightFlipperSwingMs=s.FLIPPER_SWING_DURATION_MS),e.parryWindowMs=s.PARRY_WINDOW_MS;for(const a of e.comets){const l=Math.abs(a.y-s.PADDLE_Y),d=a.x-e.paddleX;l<=68&&Math.abs(d)<=s.PADDLE_HALF_WIDTH+48&&a.vy>-60&&ee(e,a,!0)}for(const a of e.hazards){const l=Math.abs(a.y-s.PADDLE_Y),d=a.x-e.paddleX;l<=72&&Math.abs(d)<=s.PADDLE_HALF_WIDTH+50&&!a.reflected&&oe(e,a)}break}case"CAST_MAGNET_PULSE":{if(e.status!=="IN_VOLLEY"||e.comets.length===0||e.flux<s.FLUX_COST_MAGNET&&e.mode!=="SANDBOX")break;e.mode!=="SANDBOX"&&(e.flux-=s.FLUX_COST_MAGNET),e.currentComboMult=Number((e.currentComboMult+.8).toFixed(2));for(const r of e.comets){const a=A(Math.hypot(r.vx,r.vy)*1.22,360,s.MAX_COMET_SPEED),l=e.boss.coreX-r.x,d=e.boss.coreY-r.y,i=Math.hypot(l,d)||1;r.vx=l/i*a,r.vy=d/i*a,r.isSupernova=!0,r.lastSocketHitId=null}e.events.push({type:"MAGNET_PULSE",x:e.boss.coreX,y:e.boss.coreY,label:"🧲 SINGULARITY MAGNET PULSE (+0.8× Mult)",color:"#a855f7"}),x(e,`🧲 Cast Singularity Magnet Pulse! Comets locked onto ${e.boss.name} (+0.8× Combo Mult).`);break}case"CAST_CHRONO_OVERDRIVE":{if(e.flux<s.FLUX_COST_CHRONO&&e.mode!=="SANDBOX")break;e.mode!=="SANDBOX"&&(e.flux-=s.FLUX_COST_CHRONO),e.chronoOverdriveMs=4e3,e.currentVolleyChips+=35;for(const r of e.comets)r.baseChips+=25;e.events.push({type:"CHRONO_OVERDRIVE",x:e.paddleX,y:s.PADDLE_Y,label:"⏱️ CHRONO-DILATION OVERDRIVE (+25 Comet Chips)",color:"#38bdf8"}),x(e,"⏱️ Activated Chrono-Dilation! Hazards slowed to 35% and Aegis auto-tracks incoming comets!");break}case"CAST_SUPERNOVA_MULTIBALL":{if(e.status!=="IN_VOLLEY"||e.comets.length===0||e.flux<s.FLUX_COST_SUPERNOVA&&e.mode!=="SANDBOX")break;e.mode!=="SANDBOX"&&(e.flux-=s.FLUX_COST_SUPERNOVA),e.currentComboMult=Number((e.currentComboMult+1.1).toFixed(2));const r=e.comets[0];for(const a of e.comets)a.isSupernova=!0,a.baseChips+=20,a.color="#fde047";e.comets.length<s.MAX_ACTIVE_COMETS&&r&&(e.comets.push({id:e.nextEntityId++,x:r.x,y:r.y,vx:-r.vx||240,vy:-Math.abs(r.vy)||-360,radius:s.COMET_RADIUS,baseChips:r.baseChips,isSupernova:!0,splitGeneration:r.splitGeneration+1,color:"#fde047",lastSocketHitId:null,socketCooldownMs:0,trail:[]}),e.totalSplitsTriggered+=1),e.events.push({type:"SUPERNOVA_CAST",x:r.x,y:r.y,label:"☀️ SUPERNOVA MULTIBALL OVERCHARGE!",color:"#fde047"}),x(e,"☀️ Ignited Supernova Multiball Overcharge! All comets empowered and cloned (+1.1× Mult)!");break}case"DRAFT_RELIC":{if(!e.relics.includes(t.relicId)){e.relics.push(t.relicId),e.currentRelicMult=k(e.relics);const r=D.find(a=>a.id===t.relicId);r&&x(e,`🏺 Bound Astral Relic: ${r.symbol} ${r.name} (Relic Mult now ${e.currentRelicMult.toFixed(2)}×)!`)}e.relicChoices=[],e.status==="SECTOR_CLEARED"&&j(e);break}case"ADVANCE_NEXT_SECTOR":{e.status==="SECTOR_CLEARED"&&(e.relicChoices.length>0&&!e.relics.includes(e.relicChoices[0])&&(e.relics.push(e.relicChoices[0]),e.currentRelicMult=k(e.relics),e.relicChoices=[]),j(e));break}case"SWITCH_MODE":{const r=t.seed??e.seed,a=H(r,t.mode);Object.assign(e,a);return}}e.rngState=o.getState()}function j(e){e.sector=Math.min(s.MAX_SECTORS,e.sector+1),e.boss=X(e.sector),e.status="AIMING",e.sectorElapsedMs=0,e.volleysRemaining=Math.min(9,e.volleysRemaining+3),e.aegisHull=Math.min(e.maxAegisHull,e.aegisHull+25),e.flux=Math.min(e.maxFlux,e.flux+30),x(e,`🌌 Arrived at Sector ${e.sector}: ${e.boss.name} (+3 Volleys, +25 Hull repaired).`)}function ee(e,t,o){const r=o||e.parryWindowMs>0,l=(A((t.x-e.paddleX)/s.PADDLE_HALF_WIDTH,-.85,.85)*55-90)*(Math.PI/180),d=Math.hypot(t.vx,t.vy),c=A(Math.max(d*(r?1.28:1.08),430),400,s.MAX_COMET_SPEED);if(t.y=s.PADDLE_Y-t.radius-6,t.vx=Math.cos(l)*c,t.vy=Math.sin(l)*c,t.lastSocketHitId=null,e.relics.includes("LAPLACE_PENDULUM")?(e.currentComboMult=Number((e.currentComboMult+.85).toFixed(2)),e.flux=Math.min(e.maxFlux,e.flux+12)):(e.currentComboMult=Number((e.currentComboMult+.3).toFixed(2)),e.flux=Math.min(e.maxFlux,e.flux+5)),r){if(t.isSupernova=!0,t.baseChips+=22,t.color="#fde047",e.currentComboMult=Number((e.currentComboMult*1.22+.4).toFixed(2)),e.totalPerfectParries+=1,e.hitStopMs=32,e.flux=Math.min(e.maxFlux,e.flux+12),e.events.push({type:"PERFECT_PARRY",x:t.x,y:s.PADDLE_Y,value:Math.round(t.baseChips*e.currentComboMult),label:`⚡ PERFECT PARRY! (${e.currentComboMult.toFixed(1)}× Mult)`,color:"#fde047"}),e.relics.includes("HAWKING_MIRROR")){const y=Math.round(260*e.currentRelicMult);L(e,y,"🛡️ Hawking Parry Lance",e.boss.coreX,e.boss.coreY)}}else e.events.push({type:"FLIPPER_BOUNCE",x:t.x,y:s.PADDLE_Y,label:"Flipper Return",color:"#38bdf8"})}function oe(e,t){t.reflected=!0;const o=e.boss.coreX-t.x,r=e.boss.coreY-t.y,a=Math.hypot(o,r)||1;t.vx=o/a*520,t.vy=r/a*520,e.totalPerfectParries+=1,e.currentComboMult=Number((e.currentComboMult+.6).toFixed(2)),e.flux=Math.min(e.maxFlux,e.flux+10),e.events.push({type:"PERFECT_PARRY",x:t.x,y:t.y,label:"🛡️ HAZARD PARRIED TO BOSS!",color:"#10b981"})}function w(e,t){if(e.status==="VICTORY"||e.status==="GAME_OVER"||e.status==="SECTOR_CLEARED")return;if(e.hitStopMs>0){e.hitStopMs=Math.max(0,e.hitStopMs-t);return}const o=new B(e.rngState),r=t/1e3;e.tick+=1,e.elapsedMs+=t,e.sectorElapsedMs+=t,e.leftFlipperSwingMs>0&&(e.leftFlipperSwingMs=Math.max(0,e.leftFlipperSwingMs-t)),e.rightFlipperSwingMs>0&&(e.rightFlipperSwingMs=Math.max(0,e.rightFlipperSwingMs-t)),e.parryWindowMs>0&&(e.parryWindowMs=Math.max(0,e.parryWindowMs-t)),e.chronoOverdriveMs>0&&(e.chronoOverdriveMs=Math.max(0,e.chronoOverdriveMs-t)),e.boss.hitFlashMs>0&&(e.boss.hitFlashMs=Math.max(0,e.boss.hitFlashMs-t));for(const i of e.sockets)i.pulseAnimMs>0&&(i.pulseAnimMs=Math.max(0,i.pulseAnimMs-t));const a=e.chronoOverdriveMs>0?.35:1;e.boss.orbitAngleRad+=e.boss.orbitSpeedRadPerSec*r*a;for(const i of e.boss.nodes){if(!i.alive)continue;const c=e.boss.orbitAngleRad+i.angleOffsetRad;i.x=e.boss.coreX+Math.cos(c)*i.orbitRadius,i.y=e.boss.coreY+Math.sin(c)*i.orbitRadius}if(e.status!=="IN_VOLLEY"){e.rngState=o.getState();return}if(e.chronoOverdriveMs>0&&e.comets.length>0){let i=e.comets[0];for(const u of e.comets)u.y>i.y&&(i=u);const c=i.x-e.paddleX;e.paddleX=A(e.paddleX+A(c,-420*r,420*r),140,s.TABLE_WIDTH-140)}if(e.boss.hazardTimerMs-=t*a,e.boss.hazardTimerMs<=0&&e.hazards.length<5){e.boss.hazardTimerMs=e.boss.hazardIntervalMs;const c=e.paddleX+(o.nextFloat()-.5)*140-e.boss.coreX,u=s.PADDLE_Y-e.boss.coreY,y=Math.hypot(c,u)||1;e.hazards.push({id:e.nextEntityId++,x:e.boss.coreX,y:e.boss.coreY+e.boss.coreRadius,vx:c/y*e.boss.hazardSpeed,vy:u/y*e.boss.hazardSpeed,radius:11,kind:e.sector>=4?"HAWKING_LANCE":"VOID_METEOR",reflected:!1})}const l=[];for(const i of e.hazards){const c=i.reflected?1:a;if(i.x+=i.vx*r*c,i.y+=i.vy*r*c,!i.reflected&&e.relics.includes("EVENT_HORIZON_LENS")){let y=!1;for(const g of e.sockets)if(g.nodeType==="GRAVITY_WELL"&&Math.hypot(i.x-g.x,i.y-g.y)<95){e.currentVolleyChips+=30,y=!0;break}if(y)continue}if(i.reflected&&Math.hypot(i.x-e.boss.coreX,i.y-e.boss.coreY)<=e.boss.coreRadius+i.radius+8){L(e,185*e.currentRelicMult,"☄️ Reflected Lance",i.x,i.y);continue}let u=!1;for(const y of e.comets)if(Math.hypot(y.x-i.x,y.y-i.y)<=y.radius+i.radius+4){e.currentVolleyChips+=28,u=!0;break}if(!u){if(i.y>=s.PADDLE_Y-14&&!i.reflected){const y=Math.abs(i.x-e.paddleX)<=s.PADDLE_HALF_WIDTH+24;if(y&&e.parryWindowMs>0){oe(e,i),l.push(i);continue}else if(y){if(e.aegisHull=Math.max(0,e.aegisHull-10),e.events.push({type:"HULL_DAMAGED",x:i.x,y:s.PADDLE_Y,value:10,label:"-10 Aegis Hull",color:"#f43f5e"}),e.aegisHull<=0&&e.mode!=="SANDBOX"){e.status="GAME_OVER",e.events.push({type:"GAME_OVER",x:e.paddleX,y:s.PADDLE_Y,label:"AEGIS HULL BREACHED",color:"#f43f5e"}),x(e,"💥 Aegis Hull breached by Void Fire! Run concluded."),e.rngState=o.getState();return}continue}}i.y>s.TABLE_HEIGHT+20||i.y<-20||l.push(i)}}e.hazards=l;const d=[];for(const i of e.comets){i.socketCooldownMs>0&&(i.socketCooldownMs=Math.max(0,i.socketCooldownMs-t),i.socketCooldownMs===0&&(i.lastSocketHitId=null)),i.vy+=s.GRAVITY_Y*r;for(const n of e.sockets)if(n.nodeType==="GRAVITY_WELL"){const b=n.x-i.x,h=n.y-i.y,p=Math.hypot(b,h);if(p>24&&p<145){const f=210*n.level/Math.max(45,p),S=b/p,C=h/p;i.vx+=(S*.82-C*.35)*f*r*60,i.vy+=(C*.82+S*.35)*f*r*60}}const c=Math.hypot(i.vx,i.vy);if(c>s.MAX_COMET_SPEED)i.vx=i.vx/c*s.MAX_COMET_SPEED,i.vy=i.vy/c*s.MAX_COMET_SPEED;else if(c<s.MIN_COMET_SPEED){const n=c||1;i.vx=i.vx/n*s.MIN_COMET_SPEED,i.vy=i.vy/n*s.MIN_COMET_SPEED}i.x+=i.vx*r,i.y+=i.vy*r,i.trail.unshift({x:i.x,y:i.y}),i.trail.length>14&&(i.trail.length=14);const u=68+i.radius,y=s.TABLE_WIDTH-68-i.radius,g=46+i.radius;if(i.x<u?(i.x=u,i.vx=Math.abs(i.vx)*.98):i.x>y&&(i.x=y,i.vx=-Math.abs(i.vx)*.98),i.y<g&&(i.y=g,i.vy=Math.abs(i.vy)*.98),i.x<155&&i.y<125&&i.x+i.y<235){const n=Math.hypot(i.vx,i.vy);i.vx=Math.abs(n*.72),i.vy=Math.abs(n*.68)}else if(i.x>s.TABLE_WIDTH-155&&i.y<125&&s.TABLE_WIDTH-i.x+i.y<235){const n=Math.hypot(i.vx,i.vy);i.vx=-Math.abs(n*.72),i.vy=Math.abs(n*.68)}if(i.y>430&&i.y<548){const n=(i.y-430)/118,b=68+n*145,h=s.TABLE_WIDTH-68-n*145;if(i.x<b+i.radius){i.x=b+i.radius;const p=Math.hypot(i.vx,i.vy);i.vx=Math.abs(p*.75),i.vy=-Math.abs(p*.55)}else if(i.x>h-i.radius){i.x=h-i.radius;const p=Math.hypot(i.vx,i.vy);i.vx=-Math.abs(p*.75),i.vy=-Math.abs(p*.55)}}for(const n of e.sockets){if(!n.nodeType||i.lastSocketHitId===n.slotIndex&&i.socketCooldownMs>0)continue;const b=I[n.nodeType];if(Math.hypot(i.x-n.x,i.y-n.y)<=i.radius+b.radius){ye(e,i,n,o);break}}if(e.status!=="IN_VOLLEY")break;for(const n of e.boss.nodes){if(!n.alive)continue;const b=Math.hypot(i.x-n.x,i.y-n.y);if(b<=i.radius+n.radius){let h=(i.x-n.x)/(b||1),p=(i.y-n.y)/(b||1);i.x=n.x+h*(i.radius+n.radius+2),i.y=n.y+p*(i.radius+n.radius+2);const f=i.vx*h+i.vy*p;i.vx=(i.vx-2*f*h)*1.08,i.vy=(i.vy-2*f*p)*1.08,e.currentComboMult=Number((e.currentComboMult+.4).toFixed(2)),e.currentVolleyBounces+=1,e.currentVolleyBounces>e.maxComboBounces&&(e.maxComboBounces=e.currentVolleyBounces);const S=Math.round((i.baseChips+30)*e.currentComboMult*e.currentRelicMult*(i.isSupernova?1.35:1));n.hp-=S,L(e,S*.5,`⚙️ ${n.label}`,n.x,n.y),n.hp<=0&&(n.alive=!1,e.stardust+=15,e.currentVolleyChips+=150,e.currentComboMult=Number((e.currentComboMult+.75).toFixed(2)),e.events.push({type:"NODE_DESTROYED",x:n.x,y:n.y,value:150,label:`💥 ${n.label} Shattered! (+15✦)`,color:"#f59e0b"}));break}}if(e.status!=="IN_VOLLEY")break;const m=Math.hypot(i.x-e.boss.coreX,i.y-e.boss.coreY);if(m<=i.radius+e.boss.coreRadius){const n=(i.x-e.boss.coreX)/(m||1),b=(i.y-e.boss.coreY)/(m||1);i.x=e.boss.coreX+n*(i.radius+e.boss.coreRadius+3),i.y=e.boss.coreY+b*(i.radius+e.boss.coreRadius+3);const h=i.vx*n+i.vy*b;i.vx=(i.vx-2*h*n)*1.12,i.vy=(i.vy-2*h*b)*1.12,e.currentComboMult=Number((e.currentComboMult+.6).toFixed(2)),e.currentVolleyBounces+=1,e.currentVolleyBounces>e.maxComboBounces&&(e.maxComboBounces=e.currentVolleyBounces),e.flux=Math.min(e.maxFlux,e.flux+8);const p=Math.round((i.baseChips+48)*e.currentComboMult*e.currentRelicMult*(i.isSupernova?1.5:1));if(L(e,p,"☄️ Core Impact",i.x,i.y),e.status!=="IN_VOLLEY")break}if(i.vy>0&&i.y>=s.PADDLE_Y-i.radius-10&&i.y<=s.PADDLE_Y+22){const n=s.PADDLE_HALF_WIDTH+(e.chronoOverdriveMs>0?28:12);Math.abs(i.x-e.paddleX)<=n&&ee(e,i,!1)}if(i.y>s.TABLE_HEIGHT+16){e.relics.includes("OUROBOROS_TAIL")&&!e.ouroborosSaveUsedThisVolley&&(e.ouroborosSaveUsedThisVolley=!0,i.x=e.boss.coreX,i.y=66,i.vx=(o.nextFloat()-.5)*160,i.vy=380,i.isSupernova=!0,i.color="#10b981",e.currentComboMult=Number((e.currentComboMult+1).toFixed(2)),e.events.push({type:"WORMHOLE_WARP",x:e.paddleX,y:s.PADDLE_Y,targetX:i.x,targetY:i.y,label:"🐍 OUROBOROS ETERNAL RESCUE!",color:"#10b981"}),d.push(i));continue}d.push(i)}if(e.status==="IN_VOLLEY"&&(e.comets=d,e.comets.length===0)){const i=Math.floor(e.flux/5)*3,c=e.relics.includes("COMPOUND_LEDGER")?1.4:1,u=Math.round((15+i)*c);e.stardust+=u,e.hazards=[],e.volleysRemaining<=0&&e.mode!=="SANDBOX"?(e.status="GAME_OVER",e.events.push({type:"GAME_OVER",x:e.boss.coreX,y:e.boss.coreY,label:"ALL STAR-COMETS EXPENDED",color:"#f43f5e"}),x(e,`🌑 All volleys expended against ${e.boss.name}. Final Score: ${e.totalScore.toLocaleString()}.`)):(e.status="AIMING",x(e,`✨ Volley Complete! Dealt ${e.currentVolleyScore.toLocaleString()} pts (${e.currentVolleyBounces} bounces) & banked +${u}✦ Stardust.`))}e.rngState=o.getState()}function W(e,t,o=95){const r=_(e);r.status="AIMING",r.comets=[];const a=t??e.aimAngleDeg;T(r,{type:"LAUNCH_COMET",angleDeg:a});const l=[];let d=0;for(let i=0;i<o;i++){w(r,s.FIXED_STEP_MS);const c=r.comets[0];if(!c)break;(i%2===0||r.currentVolleyBounces!==d)&&(l.push({x:c.x,y:c.y,isBounce:r.currentVolleyBounces!==d}),d=r.currentVolleyBounces)}return l}function te(e){let t=e.aimAngleDeg,o=-1,r=0;for(let l=-60;l<=60;l+=6){const d=_(e);d.status="AIMING",d.comets=[],T(d,{type:"LAUNCH_COMET",angleDeg:l});for(let c=0;c<140&&(w(d,s.FIXED_STEP_MS),d.status==="IN_VOLLEY");c++);const i=d.currentVolleyScore+d.currentVolleyBounces*120+d.totalSplitsTriggered*450;i>o&&(o=i,t=l,r=d.currentVolleyBounces)}const a=W(e,t,95);return{bestAngleDeg:t,expectedDamage:Math.max(150,Math.round(o)),expectedBounces:Math.max(2,r),rationale:`Launching at ${t}° routes through high-value sockets for ~${Math.max(2,r)} rapid bounces and maximum Chips × Mult cascade.`,previewPoints:a}}function $(e){return e.status==="VICTORY"||e.sector>=5?P.SINGULARITY_SOVEREIGN:e.totalSplitsTriggered>=4?P.MULTIBALL_ALCHEMIST:e.totalPerfectParries>=3?P.PARRY_VIRTUOSO:P.ENTROPY_PILGRIM}function re(e){return[{id:"SNIPER_PHYSICIST",title:"Kepler Trajectory Sniper",summary:"Prioritizes Forge Anvils & Gravity Wells, banking Flux for compound Stardust interest.",buildType:"FORGE_ANVIL",preferredSlot:5,angleSweep:[-18,18,-8,12],useMagnet:!1,useParry:!1},{id:"PRISM_ALCHEMIST",title:"Bifrost Multiball Alchemist",summary:"Wires Prism Splitters & Tesla Pylons, casting Supernova Multiball to flood the crucible.",buildType:"PRISM_SPLITTER",preferredSlot:6,angleSweep:[-26,24,-14,16],useMagnet:!0,useParry:!0},{id:"PARRY_VIRTUOSO",title:"Hawking Flipper Virtuoso",summary:"Chains timed Flipper Parries and Ouroboros Wormholes for high Combo Multiplier volleys.",buildType:"WORMHOLE_RELAY",preferredSlot:9,angleSweep:[0,-22,22,-10],useMagnet:!0,useParry:!0}].map(o=>{const r=H(e,"CAMPAIGN");T(r,{type:"BUILD_OR_UPGRADE_SOCKET",slotIndex:o.preferredSlot,nodeType:o.buildType});for(let l=0;l<4&&(r.status==="SECTOR_CLEARED"&&T(r,{type:"ADVANCE_NEXT_SECTOR"}),r.status==="AIMING");l++){const d=o.angleSweep[l%o.angleSweep.length];T(r,{type:"LAUNCH_COMET",angleDeg:d});for(let i=0;i<190&&(o.useMagnet&&i===45&&r.flux>=s.FLUX_COST_MAGNET&&T(r,{type:"CAST_MAGNET_PULSE"}),o.useParry&&i%32===0&&r.comets[0]&&(T(r,{type:"MOVE_PADDLE",x:r.comets[0].x}),T(r,{type:"FLIP_SWING",side:"BOTH"})),w(r,s.FIXED_STEP_MS),r.status==="IN_VOLLEY");i++);}const a=$(r);return{archetypeId:o.id,title:o.title,strategySummary:o.summary,sectorsCleared:r.status==="VICTORY"?5:Math.max(0,r.sector-(r.boss.hp>0?1:0)),totalScore:r.totalScore,bestVolleyScore:r.bestVolleyScore,maxComboBounces:r.maxComboBounces,verdictTitle:a.title}})}const z="argon_game12_astral_pinball_v1";function O(){return{version:1,highScore:0,bestVolleyScore:0,maxSectorReached:1,totalSectorsCleared:0,totalRunsCompleted:0,totalVictories:0,totalSplits:0,totalPerfectParries:0,unlockedRelics:["NEWTON_THIRD_LAW"],completedRunIds:[]}}function ie(){try{if(typeof localStorage>"u")return{version:1,career:O(),activeRun:null};const e=localStorage.getItem(z);if(!e)return{version:1,career:O(),activeRun:null};const t=JSON.parse(e);return!t||t.version!==1||!t.career?{version:1,career:O(),activeRun:null}:{version:1,career:{...O(),...t.career,unlockedRelics:Array.isArray(t.career.unlockedRelics)?t.career.unlockedRelics:["NEWTON_THIRD_LAW"],completedRunIds:Array.isArray(t.career.completedRunIds)?t.career.completedRunIds.slice(-30):[]},activeRun:t.activeRun?_(t.activeRun):null}}catch{return{version:1,career:O(),activeRun:null}}}function N(e,t){const o={...e,highScore:Math.max(e.highScore,t.totalScore),bestVolleyScore:Math.max(e.bestVolleyScore,t.bestVolleyScore),maxSectorReached:Math.max(e.maxSectorReached,t.sector),unlockedRelics:Array.from(new Set([...e.unlockedRelics,...t.relics])),completedRunIds:[...e.completedRunIds]};(t.status==="VICTORY"||t.status==="GAME_OVER")&&!o.completedRunIds.includes(t.runId)&&(o.completedRunIds.push(t.runId),o.completedRunIds.length>30&&o.completedRunIds.shift(),o.totalRunsCompleted+=1,t.status==="VICTORY"?(o.totalVictories+=1,o.totalSectorsCleared+=5):o.totalSectorsCleared+=Math.max(0,t.sector-1),o.totalSplits+=t.totalSplitsTriggered,o.totalPerfectParries+=t.totalPerfectParries);const a={version:1,career:o,activeRun:_(t)};try{typeof localStorage<"u"&&localStorage.setItem(z,JSON.stringify(a))}catch{}return a}typeof HTMLButtonElement<"u"&&!("commandForElement"in HTMLButtonElement.prototype)&&K(()=>import("./index-BWFjuSge.js"),[],import.meta.url);typeof HTMLElement<"u"&&!("popover"in HTMLElement.prototype)&&K(()=>import("./popover-DtqSrbDJ.js"),[],import.meta.url);const fe=["PRISM_SPLITTER","TESLA_PYLON","GRAVITY_WELL","FORGE_ANVIL","WORMHOLE_RELAY","HARMONIC_BELL"];class ne{container;audio;callbacks;debugVisible;canvas;ctx=null;popups=[];rings=[];beams=[];coachHint=null;showCoachOverlay=!1;keydownHandler;intersectionObserver=null;constructor(t,o,r,a=!1){this.container=t,this.audio=o,this.callbacks=r,this.debugVisible=a,this.buildDOM(),this.bindEvents()}isDebugVisible(){return this.debugVisible}setDebugVisible(t){this.debugVisible=t;const o=this.container.querySelector("#ap-debug-panel");o&&(o.hidden=!this.debugVisible)}resetVisuals(){this.popups=[],this.rings=[],this.beams=[],this.coachHint=null}buildDOM(){const t=Math.random().toString(36).slice(2,7),o=`ap-almanac-popover-${t}`,r=`ap-audit-dialog-${t}`,a=`ap-audit-title-${t}`;this.container.innerHTML=`
      <style>
        .ap-root {
          /* Defer rendering work when off-screen per efficient-background-processing */
          content-visibility: auto;
          contain-intrinsic-size: auto none auto 680px;
          background: radial-gradient(circle at 50% 12%, #131b38 0%, #070a17 65%, #04060e 100%);
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 14px;
          max-width: 1380px;
          margin: 0 auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
        }

        .ap-top-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 10px;
        }

        .ap-brand-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #fde047, #f59e0b, #ec4899, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-brand-sub {
          margin: 2px 0 0;
          font-size: 0.76rem;
          color: #94a3b8;
        }

        .ap-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .ap-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 7px;
          padding: 5px 10px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .ap-btn:hover {
          background: #334155;
          border-color: #38bdf8;
        }

        .ap-btn-gold {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #020617;
          border-color: #fde047;
        }

        .ap-btn-gold:hover {
          background: linear-gradient(135deg, #fde047, #f59e0b);
        }

        /* Balatro-Style Multiplicative Equation Ribbon */
        .ap-equation-ribbon {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: rgba(9, 13, 28, 0.92);
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 12px;
        }

        .ap-eq-formula {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .ap-pill-chips {
          background: rgba(56, 189, 248, 0.18);
          border: 1px solid #38bdf8;
          color: #7dd3fc;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-mult {
          background: rgba(236, 72, 153, 0.2);
          border: 1px solid #ec4899;
          color: #f472b6;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-relic {
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid #a855f7;
          color: #d8b4fe;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-total {
          background: rgba(245, 158, 11, 0.22);
          border: 1px solid #f59e0b;
          color: #fde047;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .ap-stats-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
        }

        .ap-stat-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Main 2-Column Layout */
        .ap-workspace {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          align-items: start;
        }

        @media (min-width: 1080px) {
          .ap-workspace {
            grid-template-columns: minmax(580px, 920px) 1fr;
          }
        }

        .ap-canvas-stage {
          position: relative;
          width: 100%;
          background: #050814;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .ap-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 920 / 600;
          cursor: crosshair;
          touch-action: none;
        }

        .ap-overlay-card {
          position: absolute;
          inset: 14% 10%;
          background: rgba(10, 15, 32, 0.96);
          border: 2px solid #f59e0b;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
          z-index: 15;
        }

        .ap-overlay-card[hidden] {
          display: none !important;
        }

        .ap-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 10px;
        }

        .ap-relic-choice {
          background: #131c36;
          border: 1px solid #475569;
          border-radius: 9px;
          padding: 10px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ap-relic-choice:hover {
          border-color: #fde047;
          background: #1e293b;
        }

        /* Right Sidebar Architect & Tactical Controls */
        .ap-sidebar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ap-panel {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .ap-panel-title {
          margin: 0 0 8px 0;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #38bdf8;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ap-verbs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .ap-node-palette {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .ap-node-btn {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 7px;
          padding: 6px 8px;
          color: #e2e8f0;
          text-align: left;
          font-size: 0.74rem;
          cursor: pointer;
        }

        .ap-node-btn[aria-pressed="true"] {
          border-color: #fde047;
          background: rgba(245, 158, 11, 0.16);
          box-shadow: 0 0 0 1px #fde047;
        }

        .ap-sockets-quickgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
          margin-top: 8px;
        }

        .ap-socket-pill {
          background: #090d1a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 4px 7px;
          font-size: 0.71rem;
          color: #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .ap-socket-pill:hover {
          border-color: #38bdf8;
        }

        .ap-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 125px;
          overflow-y: auto;
          font-size: 0.73rem;
          color: #cbd5e1;
          display: grid;
          gap: 4px;
        }

        /* Native Dialog & Popover per declarative-dialog-popover-control & light-dismiss-a-dialog */
        dialog.ap-dialog {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 12px;
          padding: 18px;
          max-width: min(760px, 94vw);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        }

        dialog.ap-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
        }

        [popover].ap-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #f59e0b;
          border-radius: 10px;
          padding: 14px;
          max-width: 430px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8);
        }

        [popover].ap-popover:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .ap-cf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.76rem;
          margin-top: 10px;
        }

        .ap-cf-table th,
        .ap-cf-table td {
          border: 1px solid #334155;
          padding: 6px 8px;
          text-align: left;
        }

        .ap-cf-table th {
          background: #1e293b;
          color: #fde047;
        }
      </style>

      <div class="ap-root" id="ap-simulation-root">
        <div class="ap-top-bar">
          <div>
            <h2 class="ap-brand-title">☄️ OROBOROS: THE PINBALL SINGULARITY</h2>
            <p class="ap-brand-sub" id="ap-sector-subtitle">
              SECTOR I // THE CLOCKWORK ASTROLABE — Wire Astral Sockets, Launch Star-Comets &amp; Parry with Twin Plasma Flippers
            </p>
          </div>

          <div class="ap-toolbar">
            <button type="button" class="ap-btn ap-btn-gold" id="ap-btn-launch">
              ☄️ Launch Volley [Space]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-coach">
              🔮 Oracle Shot Hint [H]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-mode">
              Mode: Campaign
            </button>
            <button
              type="button"
              class="ap-btn"
              commandfor="${o}"
              command="toggle-popover"
            >
              📖 Synergy Almanac
            </button>
            <button
              type="button"
              class="ap-btn"
              id="ap-btn-open-audit"
              commandfor="${r}"
              command="show-modal"
            >
              📊 Counterfactual Audit
            </button>
            <button type="button" class="ap-btn" id="ap-btn-mute">
              🔊 Audio: ON [M]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-restart">
              ↻ New Run [R]
            </button>
          </div>
        </div>

        <div class="ap-equation-ribbon">
          <div class="ap-eq-formula">
            <span class="ap-pill-chips" id="ap-eq-chips">CHIPS: 30</span>
            <span>×</span>
            <span class="ap-pill-mult" id="ap-eq-mult">COMBO MULT: 1.00×</span>
            <span>×</span>
            <span class="ap-pill-relic" id="ap-eq-relic">RELIC MULT: 1.20×</span>
            <span>=</span>
            <span class="ap-pill-total" id="ap-eq-volley">VOLLEY: 0 PTS</span>
          </div>

          <div class="ap-stats-strip">
            <span class="ap-stat-item" id="ap-stat-boss">👑 Boss HP: 1,600/1,600</span>
            <span class="ap-stat-item" id="ap-stat-volleys">☄️ Volleys: 5</span>
            <span class="ap-stat-item" id="ap-stat-hull">🛡️ Aegis Hull: 100%</span>
            <span class="ap-stat-item" id="ap-stat-stardust">✦ Stardust: 110</span>
            <span class="ap-stat-item" id="ap-stat-flux">⚡ Aether Flux: 60/100</span>
            <span class="ap-stat-item" id="ap-stat-score">🏆 Total: 0</span>
          </div>
        </div>

        <div class="ap-workspace">
          <div class="ap-canvas-stage">
            <canvas
              id="ap-canvas"
              class="ap-canvas"
              width="${s.TABLE_WIDTH}"
              height="${s.TABLE_HEIGHT}"
              aria-label="Oroboros Pinball Singularity Cosmos Table"
            ></canvas>

            <!-- Sector Cleared / Relic Draft Overlay -->
            <div class="ap-overlay-card" id="ap-relic-overlay" hidden>
              <div>
                <h3 style="margin:0 0 4px; color:#fde047;" id="ap-overlay-title">
                  🌟 SECTOR CLEARED! CHOOSE AN ASTRAL RELIC
                </h3>
                <p style="margin:0; font-size:0.82rem; color:#cbd5e1;" id="ap-overlay-sub">
                  Bind 1 Relic to permanently multiply your Chips × Mult engine and advance to the next Boss Constellation.
                </p>
              </div>
              <div class="ap-relic-grid" id="ap-relic-choices-grid"></div>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="ap-btn ap-btn-gold" id="ap-btn-skip-relic">
                  Ascend to Next Sector →
                </button>
              </div>
            </div>
          </div>

          <aside class="ap-sidebar">
            <!-- Active Tactical Pinball & Flux Verbs -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>⚡ Active Tactical Controls</span>
                <span id="ap-aim-readout">Aim: -14°</span>
              </h3>
              <div class="ap-verbs-grid">
                <button type="button" class="ap-btn ap-btn-gold" id="ap-verb-flip">
                  🛡️ Flipper Parry [Space/Click]
                </button>
                <button type="button" class="ap-btn" id="ap-verb-magnet">
                  🧲 Magnet Pulse [E] (25⚡)
                </button>
                <button type="button" class="ap-btn" id="ap-verb-chrono">
                  ⏱️ Chrono-Dilation [Q] (30⚡)
                </button>
                <button type="button" class="ap-btn" id="ap-verb-supernova">
                  ☀️ Supernova Split [F] (45⚡)
                </button>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:0.74rem;">
                <label for="ap-aim-slider">Launch Angle:</label>
                <input
                  type="range"
                  id="ap-aim-slider"
                  min="-72"
                  max="72"
                  step="1"
                  value="-14"
                  style="flex:1;"
                />
              </div>
            </div>

            <!-- Live Socket Architect Palette -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>🛠️ Socket Architect Forge</span>
                <span id="ap-stardust-badge">✦ 110 Stardust</span>
              </h3>
              <p style="margin:0 0 6px; font-size:0.72rem; color:#94a3b8;">
                Select an Astral Node below, then click any Socket on the table (or a slot pill) to wire or upgrade it:
              </p>
              <div class="ap-node-palette" id="ap-node-palette"></div>
              <div class="ap-sockets-quickgrid" id="ap-sockets-quickgrid"></div>
            </div>

            <!-- Bound Relics & Career -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>🏺 Bound Relics &amp; Telemetry</span>
                <span id="ap-career-best">Best: 0</span>
              </h3>
              <div id="ap-owned-relics" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; font-size:0.73rem;"></div>
              <ul class="ap-log-list" id="ap-log-list"></ul>
            </div>

            <div class="ap-panel" id="ap-debug-panel" ${this.debugVisible?"":"hidden"}>
              <h3 class="ap-panel-title"><span>🔬 Deterministic Debug State</span></h3>
              <pre id="ap-debug-pre" style="margin:0; font-size:0.7rem; color:#38bdf8; overflow-x:auto;"></pre>
            </div>
          </aside>
        </div>

        <!-- Declarative Popover Almanac -->
        <div id="${o}" class="ap-popover" popover>
          <h3 style="margin:0 0 6px; color:#fde047;">📖 Astral Pinball Synergy Almanac</h3>
          <p style="margin:0 0 8px; font-size:0.78rem; color:#cbd5e1;">
            Every socket bounce increases both <strong>Base Chips</strong> and <strong>Combo Mult</strong>. Total Damage = <code>Chips × Combo Mult × Relic Mult</code>.
          </p>
          <ul style="margin:0; padding-left:16px; font-size:0.75rem; color:#e2e8f0; display:grid; gap:4px;">
            <li><strong>❖ Bifrost Prism Gate (45✦):</strong> Splits 1 comet into 2 chromatic twin comets!</li>
            <li><strong>⚡ Tesla Resonance Pylon (40✦):</strong> Chains arc-lightning to up to 3 Boss Nodes/Hazards.</li>
            <li><strong>🌀 Kerr Gravity Well (50✦):</strong> Curves comets into an orbital slingshot toward the Boss Core.</li>
            <li><strong>🔥 Solar Forge Anvil (35✦):</strong> Permanently tempers the comet (+14 Base Chips + Supernova).</li>
            <li><strong>⏳ Ouroboros Wormhole (55✦):</strong> Warps lower-table comets back to the Zenith Crown!</li>
            <li><strong>🔔 Harmonic Bell (50✦):</strong> Every 3rd chime unleashes a full-screen 240-dmg Sonic Nova!</li>
          </ul>
        </div>

        <!-- Light-Dismiss Counterfactual Audit Modal Dialog -->
        <dialog
          id="${r}"
          class="ap-dialog"
          closedby="any"
          aria-labelledby="${a}"
        >
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid #334155; padding-bottom:8px;">
            <h3 id="${a}" style="margin:0; color:#38bdf8;">
              📊 Seeded Counterfactual Archetype Benchmark
            </h3>
            <button
              type="button"
              class="ap-btn"
              commandfor="${r}"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <div id="ap-audit-dialog-body" style="margin-top:10px; font-size:0.82rem;"></div>
        </dialog>
      </div>
    `;const l=this.container.querySelector("#ap-canvas");l&&(this.canvas=l,this.ctx=l.getContext("2d"));const d=this.container.querySelector(`#${r}`);d&&typeof HTMLDialogElement<"u"&&!("closedBy"in HTMLDialogElement.prototype)&&d.addEventListener("click",c=>{if(c.target!==d)return;const u=d.getBoundingClientRect();u.top<=c.clientY&&c.clientY<=u.top+u.height&&u.left<=c.clientX&&c.clientX<=u.left+u.width||d.close()});const i=this.container.querySelector("#ap-simulation-root");i&&(i.addEventListener("contentvisibilityautostatechange",c=>{const u=c;this.callbacks.onVisibilityPausedChange?.(!!u.skipped)}),typeof document<"u"&&!("contentVisibility"in document.documentElement.style)&&typeof IntersectionObserver<"u"&&(this.intersectionObserver=new IntersectionObserver(c=>{for(const u of c)this.callbacks.onVisibilityPausedChange?.(!u.isIntersecting)},{rootMargin:"200px"}),this.intersectionObserver.observe(i))),this.renderNodePalette("PRISM_SPLITTER")}renderNodePalette(t){const o=this.container.querySelector("#ap-node-palette");if(o){o.innerHTML="";for(const r of fe){const a=I[r],l=document.createElement("button");l.type="button",l.className="ap-node-btn",l.setAttribute("data-node-type",r),l.setAttribute("aria-pressed",String(r===t)),l.innerHTML=`
        <div style="display:flex; justify-content:space-between; font-weight:800; color:${a.color};">
          <span>${a.symbol} ${a.shortLabel}</span>
          <span>${a.costStardust}✦</span>
        </div>
        <div style="font-size:0.67rem; color:#94a3b8; margin-top:2px;">
          +${a.baseChipsBonus} Chips · +${a.comboMultBonus.toFixed(2)}×
        </div>
      `,l.addEventListener("click",()=>{this.callbacks.onAction({type:"SELECT_BUILD_TYPE",nodeType:r})}),o.appendChild(l)}}}bindEvents(){this.container.querySelector("#ap-btn-launch")?.addEventListener("click",()=>{this.callbacks.onAction({type:"LAUNCH_COMET"})}),this.container.querySelector("#ap-btn-coach")?.addEventListener("click",()=>{this.showCoachOverlay=!this.showCoachOverlay,this.coachHint=null});const r=this.container.querySelector("#ap-btn-mode");r?.addEventListener("click",()=>{const u=(r.textContent??"").includes("Campaign")?"SANDBOX":"CAMPAIGN";this.callbacks.onAction({type:"SWITCH_MODE",mode:u})});const a=this.container.querySelector("#ap-btn-mute");a?.addEventListener("click",()=>{const c=this.audio.toggleMute();a.textContent=c?"🔇 Audio: OFF [M]":"🔊 Audio: ON [M]"}),this.container.querySelector("#ap-btn-restart")?.addEventListener("click",()=>{this.callbacks.onRestart()}),this.container.querySelector("#ap-btn-skip-relic")?.addEventListener("click",()=>{this.callbacks.onAction({type:"ADVANCE_NEXT_SECTOR"})});const i=this.container.querySelector("#ap-aim-slider");i?.addEventListener("input",()=>{this.callbacks.onAction({type:"SET_AIM_ANGLE",angleDeg:Number(i.value)})}),this.container.querySelector("#ap-verb-flip")?.addEventListener("click",()=>{this.callbacks.onAction({type:"FLIP_SWING",side:"BOTH"})}),this.container.querySelector("#ap-verb-magnet")?.addEventListener("click",()=>{this.callbacks.onAction({type:"CAST_MAGNET_PULSE"})}),this.container.querySelector("#ap-verb-chrono")?.addEventListener("click",()=>{this.callbacks.onAction({type:"CAST_CHRONO_OVERDRIVE"})}),this.container.querySelector("#ap-verb-supernova")?.addEventListener("click",()=>{this.callbacks.onAction({type:"CAST_SUPERNOVA_MULTIBALL"})}),this.canvas&&(this.canvas.addEventListener("pointermove",c=>{const u=this.canvas.getBoundingClientRect();if(u.width<=0)return;const y=s.TABLE_WIDTH/u.width,g=s.TABLE_HEIGHT/u.height,m=(c.clientX-u.left)*y,n=(c.clientY-u.top)*g;if(this.callbacks.onAction({type:"MOVE_PADDLE",x:m}),n<s.LAUNCH_ORIGIN_Y-25){const b=m-s.LAUNCH_ORIGIN_X,h=s.LAUNCH_ORIGIN_Y-n,p=Math.atan2(b,h)*180/Math.PI;this.callbacks.onAction({type:"SET_AIM_ANGLE",angleDeg:p})}}),this.canvas.addEventListener("pointerdown",c=>{const u=this.canvas.getBoundingClientRect(),y=u.width>0?s.TABLE_WIDTH/u.width:1,g=u.height>0?s.TABLE_HEIGHT/u.height:1,m=(c.clientX-u.left)*y,n=(c.clientY-u.top)*g,b=this.findSocketAtPoint(m,n);if(b!==null){c.button===2||c.shiftKey?this.callbacks.onAction({type:"SELL_SOCKET",slotIndex:b}):this.callbacks.onAction({type:"BUILD_OR_UPGRADE_SOCKET",slotIndex:b});return}this.callbacks.onAction({type:"FLIP_SWING",side:"BOTH"}),this.callbacks.onAction({type:"LAUNCH_COMET"})})),this.keydownHandler=c=>{if(!(c.target instanceof HTMLInputElement||c.target instanceof HTMLTextAreaElement))switch(c.key.toLowerCase()){case" ":c.preventDefault(),this.callbacks.onAction({type:"FLIP_SWING",side:"BOTH"}),this.callbacks.onAction({type:"LAUNCH_COMET"});break;case"arrowleft":case"a":this.callbacks.onAction({type:"NUDGE_PADDLE",dx:-28}),this.callbacks.onAction({type:"ADJUST_AIM_ANGLE",deltaDeg:-4}),this.callbacks.onAction({type:"FLIP_SWING",side:"LEFT"});break;case"arrowright":case"d":this.callbacks.onAction({type:"NUDGE_PADDLE",dx:28}),this.callbacks.onAction({type:"ADJUST_AIM_ANGLE",deltaDeg:4}),this.callbacks.onAction({type:"FLIP_SWING",side:"RIGHT"});break;case"e":this.callbacks.onAction({type:"CAST_MAGNET_PULSE"});break;case"q":this.callbacks.onAction({type:"CAST_CHRONO_OVERDRIVE"});break;case"f":this.callbacks.onAction({type:"CAST_SUPERNOVA_MULTIBALL"});break;case"h":this.showCoachOverlay=!this.showCoachOverlay,this.coachHint=null;break;case"m":{const u=this.audio.toggleMute(),y=this.container.querySelector("#ap-btn-mute");y&&(y.textContent=u?"🔇 Audio: OFF [M]":"🔊 Audio: ON [M]");break}case"r":this.callbacks.onRestart();break}},window.addEventListener("keydown",this.keydownHandler)}lastStateSockets=[];findSocketAtPoint(t,o){for(const r of this.lastStateSockets)if(Math.hypot(t-r.x,o-r.y)<=28)return r.slotIndex;return null}consumeEvents(t,o){this.audio.playEvents(o);for(const r of o)r.label&&this.popups.push({x:r.x,y:r.y-10,vy:-38,text:r.label,color:r.color??"#fde047",lifeMs:950,maxLifeMs:950}),r.type==="LIGHTNING_ARC"&&r.targetX!==void 0&&r.targetY!==void 0&&this.beams.push({x1:r.x,y1:r.y,x2:r.targetX,y2:r.targetY,color:r.color??"#38bdf8",lifeMs:180}),(r.type==="PRISM_SPLIT"||r.type==="SONIC_NOVA"||r.type==="PERFECT_PARRY"||r.type==="WORMHOLE_WARP"||r.type==="SECTOR_VICTORY")&&this.rings.push({x:r.x,y:r.y,radius:12,maxRadius:r.type==="SONIC_NOVA"?380:95,color:r.color??"#fde047",lifeMs:420,maxLifeMs:420})}render(t,o,r){this.lastStateSockets=t.sockets,this.stepVisualParticles(r),this.updateHUD(t,o),this.drawCanvas(t)}stepVisualParticles(t){const o=t/1e3;this.popups=this.popups.filter(r=>(r.y+=r.vy*o,r.lifeMs-=t,r.lifeMs>0)),this.rings=this.rings.filter(r=>{r.lifeMs-=t;const a=1-Math.max(0,r.lifeMs)/r.maxLifeMs;return r.radius=12+a*(r.maxRadius-12),r.lifeMs>0}),this.beams=this.beams.filter(r=>(r.lifeMs-=t,r.lifeMs>0))}updateHUD(t,o){const r=(h,p)=>{const f=this.container.querySelector(h);f&&f.textContent!==p&&(f.textContent=p)};r("#ap-sector-subtitle",`${t.boss.title} — ${t.boss.mechanicSummary}`),r("#ap-eq-chips",`CHIPS: ${t.currentVolleyChips}`),r("#ap-eq-mult",`COMBO MULT: ${t.currentComboMult.toFixed(2)}×`),r("#ap-eq-relic",`RELIC MULT: ${t.currentRelicMult.toFixed(2)}×`),r("#ap-eq-volley",`VOLLEY: ${t.currentVolleyScore.toLocaleString()} PTS`),r("#ap-stat-boss",`👑 ${t.boss.name}: ${t.boss.hp.toLocaleString()}/${t.boss.maxHp.toLocaleString()} HP`),r("#ap-stat-volleys",`☄️ Volleys: ${t.mode==="SANDBOX"?"∞":t.volleysRemaining}`),r("#ap-stat-hull",`🛡️ Aegis Hull: ${t.aegisHull}%`),r("#ap-stat-stardust",`✦ Stardust: ${t.stardust}`),r("#ap-stat-flux",`⚡ Flux: ${t.flux}/${t.maxFlux}`),r("#ap-stat-score",`🏆 Score: ${t.totalScore.toLocaleString()}`),r("#ap-aim-readout",`Aim: ${t.aimAngleDeg.toFixed(0)}°`),r("#ap-stardust-badge",`✦ ${t.stardust} Stardust`),r("#ap-career-best",`Best: ${Math.max(o.highScore,t.totalScore).toLocaleString()}`);const a=this.container.querySelector("#ap-btn-mode");a&&(a.textContent=t.mode==="SANDBOX"?"Mode: Architect Sandbox":"Mode: Campaign");const l=this.container.querySelector("#ap-aim-slider");l&&document.activeElement!==l&&(l.value=String(Math.round(t.aimAngleDeg)));for(const h of this.container.querySelectorAll(".ap-node-btn[data-node-type]")){const p=h.getAttribute("data-node-type");h.setAttribute("aria-pressed",String(p===t.selectedBuildType))}const d=this.container.querySelector("#ap-sockets-quickgrid");if(d){d.innerHTML=t.sockets.map(h=>{const p=h.nodeType?I[h.nodeType]:null;return`
            <button type="button" class="ap-socket-pill" data-slot-idx="${h.slotIndex}">
              <span>#${h.slotIndex+1} ${h.label}</span>
              <strong style="color:${p?p.color:"#64748b"};">
                ${p?`${p.symbol} Lv.${h.level}`:"+ Wire"}
              </strong>
            </button>
          `}).join("");for(const h of d.querySelectorAll("button[data-slot-idx]"))h.addEventListener("click",()=>{const p=Number(h.getAttribute("data-slot-idx"));this.callbacks.onAction({type:"BUILD_OR_UPGRADE_SOCKET",slotIndex:p})})}const i=this.container.querySelector("#ap-owned-relics");i&&(i.innerHTML=t.relics.map(h=>{const p=D.find(f=>f.id===h);return p?`<span style="background:#1e293b; border:1px solid #475569; border-radius:5px; padding:2px 6px;" title="${p.description}">${p.symbol} ${p.name}</span>`:""}).join(""));const c=this.container.querySelector("#ap-log-list");c&&(c.innerHTML=t.recentLog.slice(0,7).map(h=>`<li>${h}</li>`).join(""));const u=this.container.querySelector("#ap-relic-overlay"),y=this.container.querySelector("#ap-overlay-title"),g=this.container.querySelector("#ap-overlay-sub"),m=this.container.querySelector("#ap-relic-choices-grid"),n=this.container.querySelector("#ap-btn-skip-relic");if(u&&y&&g&&m&&n)if(t.status==="SECTOR_CLEARED"){u.hidden=!1,y.textContent=`🌟 SECTOR ${t.sector} SHATTERED! DRAFT AN ASTRAL RELIC`,g.textContent="Select 1 Relic to permanently compound your Chips × Mult alchemy before ascending:",n.textContent="Ascend to Next Sector →",m.innerHTML=t.relicChoices.map(h=>{const p=D.find(f=>f.id===h);return p?`
              <button type="button" class="ap-relic-choice" data-draft-relic="${p.id}">
                <div style="font-weight:800; color:#fde047;">${p.symbol} ${p.name} (×${p.relicMultFactor.toFixed(2)})</div>
                <div style="font-size:0.75rem; color:#e2e8f0;">${p.description}</div>
                <div style="font-size:0.68rem; color:#94a3b8; font-style:italic;">${p.flavor}</div>
              </button>
            `:""}).join("");for(const h of m.querySelectorAll("button[data-draft-relic]"))h.addEventListener("click",()=>{const p=h.getAttribute("data-draft-relic");this.callbacks.onAction({type:"DRAFT_RELIC",relicId:p})})}else if(t.status==="VICTORY"||t.status==="GAME_OVER"){u.hidden=!1;const h=$(t);y.textContent=t.status==="VICTORY"?`👑 OMEGA SINGULARITY VICTORY — ${h.title}`:`🌑 RUN CONCLUDED — ${h.title}`,g.textContent=`${h.description} Final Score: ${t.totalScore.toLocaleString()} · Best Volley: ${t.bestVolleyScore.toLocaleString()} · Max Combo: ${t.maxComboBounces} bounces.`,m.innerHTML="",n.textContent="↻ Launch New Seeded Run",n.onclick=()=>this.callbacks.onRestart()}else u.hidden=!0;const b=this.container.querySelector("#ap-audit-dialog-body");if(b&&b.innerHTML===""){const h=re(t.seed);b.innerHTML=`
        <p style="margin:0 0 8px; color:#cbd5e1;">
          Deterministic simulation of 3 philosophical &amp; tactical pinball archetypes on Seed <code>${t.seed}</code>:
        </p>
        <table class="ap-cf-table">
          <thead>
            <tr>
              <th>Archetype</th>
              <th>Strategy</th>
              <th>Total Score</th>
              <th>Best Volley</th>
              <th>Max Bounces</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            ${h.map(p=>`
              <tr>
                <td><strong>${p.title}</strong></td>
                <td>${p.strategySummary}</td>
                <td>${p.totalScore.toLocaleString()}</td>
                <td>${p.bestVolleyScore.toLocaleString()}</td>
                <td>${p.maxComboBounces}</td>
                <td>${p.verdictTitle}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}if(this.debugVisible){const h=this.container.querySelector("#ap-debug-pre");h&&(h.textContent=JSON.stringify({seed:t.seed,rngState:t.rngState,tick:t.tick,status:t.status,sector:t.sector,comets:t.comets.length,bossHp:t.boss.hp,comboMult:t.currentComboMult,relicMult:t.currentRelicMult},null,2))}}drawCanvas(t){const o=this.ctx;if(!o)return;const r=s.TABLE_WIDTH,a=s.TABLE_HEIGHT;o.clearRect(0,0,r,a);const l=o.createRadialGradient(t.boss.coreX,t.boss.coreY,20,r/2,a/2,540);l.addColorStop(0,"rgba(88, 28, 135, 0.32)"),l.addColorStop(.5,"rgba(15, 23, 42, 0.92)"),l.addColorStop(1,"#04060e"),o.fillStyle=l,o.fillRect(0,0,r,a),o.save(),o.strokeStyle="rgba(148, 163, 184, 0.08)",o.lineWidth=1;for(const n of[120,220,330,440])o.beginPath(),o.arc(t.boss.coreX,t.boss.coreY,n,0,Math.PI*2),o.stroke();if(o.restore(),o.save(),o.strokeStyle="#38bdf8",o.lineWidth=3,o.beginPath(),o.moveTo(213,548),o.lineTo(68,430),o.lineTo(68,125),o.lineTo(155,46),o.lineTo(r-155,46),o.lineTo(r-68,125),o.lineTo(r-68,430),o.lineTo(r-213,548),o.stroke(),o.restore(),t.status==="AIMING"||this.showCoachOverlay){const n=W(t,t.aimAngleDeg,85);o.save(),o.strokeStyle="rgba(56, 189, 248, 0.65)",o.lineWidth=2,o.setLineDash([5,6]),o.beginPath(),o.moveTo(t.paddleX,s.LAUNCH_ORIGIN_Y);for(const b of n)o.lineTo(b.x,b.y);o.stroke(),o.setLineDash([]);for(const b of n)b.isBounce&&(o.fillStyle="#fde047",o.beginPath(),o.arc(b.x,b.y,4.5,0,Math.PI*2),o.fill());if(o.restore(),this.showCoachOverlay){this.coachHint||(this.coachHint=te(t)),o.save(),o.strokeStyle="rgba(16, 185, 129, 0.85)",o.lineWidth=2.5,o.setLineDash([3,4]),o.beginPath(),o.moveTo(t.paddleX,s.LAUNCH_ORIGIN_Y);for(const b of this.coachHint.previewPoints)o.lineTo(b.x,b.y);o.stroke(),o.setLineDash([]),o.fillStyle="#10b981",o.font="bold 12px Inter, sans-serif",o.fillText(`🔮 Oracle Optimal Angle: ${this.coachHint.bestAngleDeg}° (~${this.coachHint.expectedBounces} bounces)`,180,34),o.restore()}}for(const n of t.sockets){if(o.save(),!n.nodeType)o.strokeStyle="rgba(148, 163, 184, 0.35)",o.lineWidth=1.5,o.setLineDash([4,4]),o.beginPath(),o.arc(n.x,n.y,20,0,Math.PI*2),o.stroke(),o.setLineDash([]),o.fillStyle="rgba(148, 163, 184, 0.55)",o.font="10px Inter, sans-serif",o.textAlign="center",o.fillText(`+${n.label}`,n.x,n.y+4);else{const b=I[n.nodeType],h=n.pulseAnimMs>0?n.pulseAnimMs/220*7:0,p=b.radius+h;n.nodeType==="GRAVITY_WELL"&&(o.strokeStyle="rgba(168, 85, 247, 0.22)",o.lineWidth=1.5,o.beginPath(),o.arc(n.x,n.y,85,0,Math.PI*2),o.stroke()),o.fillStyle=b.glowColor,o.beginPath(),o.arc(n.x,n.y,p+6,0,Math.PI*2),o.fill(),o.fillStyle="#090d1a",o.strokeStyle=b.color,o.lineWidth=2.5,o.beginPath(),o.arc(n.x,n.y,p,0,Math.PI*2),o.fill(),o.stroke(),o.fillStyle="#f8fafc",o.font="bold 14px Inter, sans-serif",o.textAlign="center",o.fillText(b.symbol,n.x,n.y+4),o.fillStyle=b.color,o.font="bold 9px JetBrains Mono, monospace",o.fillText(`Lv.${n.level}`,n.x,n.y+p+12)}o.restore()}const d=t.boss;o.save(),o.strokeStyle="rgba(245, 158, 11, 0.22)",o.lineWidth=1.5,o.beginPath(),o.arc(d.coreX,d.coreY,82,0,Math.PI*2),o.stroke();const i=d.hitFlashMs>0?"#ffffff":d.color;o.fillStyle="rgba(245, 158, 11, 0.2)",o.beginPath(),o.arc(d.coreX,d.coreY,d.coreRadius+10,0,Math.PI*2),o.fill(),o.fillStyle="#0f172a",o.strokeStyle=i,o.lineWidth=3.5,o.beginPath(),o.arc(d.coreX,d.coreY,d.coreRadius,0,Math.PI*2),o.fill(),o.stroke();const c=Math.max(0,Math.round(d.hp/d.maxHp*100));o.fillStyle="#fde047",o.font="bold 12px JetBrains Mono, monospace",o.textAlign="center",o.fillText(`${c}%`,d.coreX,d.coreY+4);for(const n of d.nodes)n.alive&&(o.fillStyle="#1e293b",o.strokeStyle=d.secondaryColor,o.lineWidth=2,o.beginPath(),o.arc(n.x,n.y,n.radius,0,Math.PI*2),o.fill(),o.stroke());o.restore();for(const n of t.hazards)o.save(),o.fillStyle=n.reflected?"#10b981":"#f43f5e",o.strokeStyle="#ffffff",o.lineWidth=1.5,o.beginPath(),o.arc(n.x,n.y,n.radius,0,Math.PI*2),o.fill(),o.stroke(),o.restore();o.save();const u=s.PADDLE_Y,y=t.paddleX,g=s.PADDLE_HALF_WIDTH+(t.chronoOverdriveMs>0?24:0),m=t.parryWindowMs>0||t.leftFlipperSwingMs>0||t.rightFlipperSwingMs>0;o.strokeStyle=m?"#fde047":"#38bdf8",o.fillStyle=m?"rgba(253, 224, 71, 0.35)":"rgba(56, 189, 248, 0.22)",o.lineWidth=m?4:3,o.beginPath(),o.roundRect(y-g,u-8,g*2,16,8),o.fill(),o.stroke(),o.fillStyle="#f8fafc",o.font="bold 10px JetBrains Mono, monospace",o.textAlign="center",o.fillText(m?"⚡ PARRY OVERDRIVE ⚡":"AEGIS FLIPPER ARRAY [SPACE]",y,u+4),o.restore();for(const n of t.comets){if(o.save(),n.trail.length>1){o.strokeStyle=n.isSupernova?"rgba(253, 224, 71, 0.55)":"rgba(56, 189, 248, 0.45)",o.lineWidth=n.isSupernova?6:4,o.beginPath(),o.moveTo(n.x,n.y);for(const b of n.trail)o.lineTo(b.x,b.y);o.stroke()}o.fillStyle=n.isSupernova?"#fde047":n.color,o.strokeStyle="#ffffff",o.lineWidth=2,o.beginPath(),o.arc(n.x,n.y,n.radius,0,Math.PI*2),o.fill(),o.stroke(),o.restore()}t.status==="AIMING"&&(o.save(),o.fillStyle="#fde047",o.beginPath(),o.arc(t.paddleX,s.LAUNCH_ORIGIN_Y,s.COMET_RADIUS,0,Math.PI*2),o.fill(),o.restore());for(const n of this.beams){o.save(),o.strokeStyle=n.color,o.lineWidth=2.5,o.beginPath(),o.moveTo(n.x1,n.y1);const b=(n.x1+n.x2)/2+Math.sin(n.lifeMs)*14,h=(n.y1+n.y2)/2-Math.cos(n.lifeMs)*14;o.lineTo(b,h),o.lineTo(n.x2,n.y2),o.stroke(),o.restore()}for(const n of this.rings)o.save(),o.strokeStyle=n.color,o.lineWidth=2.5,o.globalAlpha=Math.max(.1,n.lifeMs/n.maxLifeMs),o.beginPath(),o.arc(n.x,n.y,n.radius,0,Math.PI*2),o.stroke(),o.restore();for(const n of this.popups)o.save(),o.fillStyle=n.color,o.font="bold 12px JetBrains Mono, monospace",o.textAlign="center",o.globalAlpha=Math.max(.15,n.lifeMs/n.maxLifeMs),o.fillText(n.text,n.x,n.y),o.restore()}destroy(){window.removeEventListener("keydown",this.keydownHandler),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),this.container.innerHTML=""}}const le={id:s.GAME_ID,number:s.GAME_NUMBER,title:s.TITLE,subtitle:s.SUBTITLE,genre:"Relativistic Pinball-Roguelike × Orbital Alchemist × Multiplicative Synergy Engine",primaryReference:"Space Cadet 3D Pinball · Balatro (Chips × Mult × Relic Synergy)",supportingReference:"Peglin · Into the Breach (Trajectory Oracle) · Arkanoid (Parry Flipper)",oneSentenceLoop:"Launch relativistic star-comets into a customizable cosmos of prism splitters, gravity wells, and Tesla bumpers, actively deflecting them with twin plasma flippers and magnetic pulses to shatter 5 Cosmic Boss Constellations in multiplicative Chips × Mult chain reactions.",shortGoal:"Shatter Sector I (The Clockwork Astrolabe) and wire a Bifrost Prism + Tesla Pylon multiball chain.",longGoal:"Conquer all 5 Cosmic Boss Constellations (up to OROBOROS, The Grand Architect), bind 5+ Astral Relics, and benchmark your trajectory efficiency against the 3-Archetype Counterfactual Simulator.",controlsSummary:"Mouse / A-D / ←-→: Aim & Move Flipper Array · Space / Click: Launch & Flipper Parry · [E]: Magnet Pulse · [Q]: Chrono-Dilation · [F]: Supernova Split · [H]: Oracle Hint",accentColor:s.ACCENT_COLOR};function ae(e,t){const o=ie();let r={...o.career};const a=t?.initialSeed??s.DEFAULT_SEED;let l=t?.initialSeed===void 0&&o.activeRun&&o.activeRun.status!=="VICTORY"&&o.activeRun.status!=="GAME_OVER"?_(o.activeRun):H(a,"CAMPAIGN");const d=new J;let i=!1;const c=f=>{T(l,f),l.events.length>0&&(g.consumeEvents(l,l.events),l.events=[]),r=N(r,l).career,g.render(l,r,s.FIXED_STEP_MS)},u=f=>{const S=typeof f=="number"?f:l.seed+104729>>>0;l=H(S,l.mode),g.resetVisuals(),r=N(r,l).career,g.render(l,r,s.FIXED_STEP_MS)},y=f=>{const S=typeof f=="boolean"?f:!g.isDebugVisible();g.setDebugVisible(S)},g=new ne(e,d,{onAction:c,onRestart:u,onToggleDebug:()=>y(),onVisibilityPausedChange:f=>{i=f,n=performance.now()}},!!t?.debug);let m=0,n=performance.now(),b=0,h=!1;const p=f=>{if(h)return;if(i){n=f,m=window.requestAnimationFrame(p);return}const S=Math.min(100,Math.max(0,f-n));n=f,b+=S;const C=l.status,V=l.sector;for(;b>=s.FIXED_STEP_MS;)w(l,s.FIXED_STEP_MS),l.events.length>0&&(g.consumeEvents(l,l.events),l.events=[]),b-=s.FIXED_STEP_MS;(l.status!==C||l.sector!==V||l.totalScore>r.highScore)&&(r=N(r,l).career),g.render(l,r,S||s.FIXED_STEP_MS),m=window.requestAnimationFrame(p)};return g.render(l,r,s.FIXED_STEP_MS),m=window.requestAnimationFrame(p),{destroy(){h=!0,window.cancelAnimationFrame(m),N(r,l),d.destroy(),g.destroy()},getStateSnapshot(){return _(l)},restartWithSeed(f){u(f)},toggleDebug(f){y(f),g.render(l,r,s.FIXED_STEP_MS)}}}const ge={metadata:le,mountGame:ae},Se=Object.freeze(Object.defineProperty({__proto__:null,ASTRAL_CONFIG:s,ASTRAL_RELICS:D,ASTRAL_SAVE_KEY:z,ASTRAL_SOCKET_BLUEPRINTS:I,ASTRAL_SOCKET_SLOTS:Q,ASTRAL_VERDICTS:P,AstralAudioEngine:J,AstralUIController:ne,BOSS_SECTORS:U,SeededRng:B,applyAstralInput:T,cloneAstralState:_,computeOptimalLaunchHint:te,computeRelicMultiplier:k,computeTrajectoryPreview:W,createBossForSector:X,createDefaultAstralCareer:O,createInitialAstralState:H,default:ge,evaluateAstralVerdict:$,loadAstralSave:ie,metadata:le,mountGame:ae,rollRelicDraftChoices:Z,runAstralCounterfactuals:re,saveAstralState:N,stepAstralState:w},Symbol.toStringTag,{value:"Module"}));export{le as a,Se as g,ae as m};
