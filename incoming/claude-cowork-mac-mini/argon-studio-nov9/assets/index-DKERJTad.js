const re=[261.63,293.66,329.63,369.99,392,440,493.88,523.25,587.33,659.25,739.99,783.99,880,987.77,1046.5];class se{ctx=null;muted=!1;isMuted(){return this.muted}setMuted(o){this.muted=o}toggleMute(){return this.muted=!this.muted,this.muted}ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const o=window.AudioContext||window.webkitAudioContext;if(o)try{this.ctx=new o}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playTone(o,s,i="sine",l=.09,t){const d=this.ensureContext();if(d)try{const h=d.currentTime,p=d.createOscillator(),E=d.createGain();p.type=i,p.frequency.setValueAtTime(o,h),t&&p.frequency.exponentialRampToValueAtTime(Math.max(20,t),h+s),E.gain.setValueAtTime(1e-4,h),E.gain.linearRampToValueAtTime(l,h+.012),E.gain.exponentialRampToValueAtTime(1e-4,h+s),p.connect(E),E.connect(d.destination),p.start(h),p.stop(h+s+.02)}catch{}}playEvent(o){if(!this.muted)switch(o.type){case"SLINGSHOT_LAUNCH":this.playTone(180,.18,"triangle",.08,520);break;case"BUMPER_RICOCHET":{const s=Math.max(0,Math.min(re.length-1,o.noteIndex??0)),i=re[s];this.playTone(i,.24,"sine",.1),this.playTone(i*1.5,.16,"triangle",.045);break}case"CONSTELLATION_ENCLOSED":{[523.25,659.25,783.99,987.77].forEach((i,l)=>{setTimeout(()=>this.playTone(i,.42,"triangle",.075),l*45)});break}case"EVENT_HORIZON_SKIM":this.playTone(310,.15,"sine",.065,620);break;case"WORMHOLE_TRANSIT":this.playTone(110,.35,"sawtooth",.09,880);break;case"ROCHE_CRUSH":this.playTone(440,.28,"sine",.09,130);break;case"SUPERNOVA_PULSE":this.playTone(150,.42,"sawtooth",.11,55),this.playTone(587.33,.28,"triangle",.08,293.66);break;case"CHRONO_REWIND":this.playTone(880,.32,"triangle",.09,220);break;case"ENEMY_DESTROYED":this.playTone(392,.18,"square",.06,783.99);break;case"SHIP_DAMAGED":this.playTone(140,.26,"sawtooth",.1,65);break;case"RELIC_DRAFTED":case"SECTOR_CLEARED":case"VICTORY":{[523.25,659.25,783.99,1046.5].forEach((i,l)=>{setTimeout(()=>this.playTone(i,.38,"triangle",.085),l*65)});break}case"GAME_OVER":this.playTone(220,.55,"sawtooth",.09,73.42);break}}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const a={GAME_ID:"12-event-horizon",GAME_NUMBER:12,TITLE:"Event Horizon: Singularity Slingshot",SUBTITLE:"Relativistic Orbital Billiards, Bullet-Time Gravity Tether & Constellation Relic Deckbuilder",ACCENT_COLOR:"#38bdf8",DEFAULT_SEED:20261108,SAVE_KEY:"argon_game12_event_horizon_save_v1",SAVE_VERSION:1,FIXED_STEP_MS:1e3/60,ARENA_WIDTH:960,ARENA_HEIGHT:600,WALL_MARGIN:24,WALL_RESTITUTION:.88,SHIP_RADIUS:13,BASE_MAX_HULL:5,MAX_HAWKING_ENERGY:100,INITIAL_HAWKING_ENERGY:75,PASSIVE_ENERGY_REGEN_PER_SEC:7,SKIM_ENERGY_GAIN_PER_SEC:36,BUMPER_ENERGY_GAIN:12,MIN_SLINGSHOT_SPEED:220,MAX_SLINGSHOT_SPEED:640,SPEED_OF_LIGHT_CAP:780,THRUST_ACCEL:340,SPACE_DRAG:.9965,BULLET_TIME_SCALE:.16,AIM_ENERGY_DRAIN_PER_SEC:8,PREDICTION_STEPS:75,PREDICTION_STEP_DT:.016,TETHER_MAX_RANGE:270,TETHER_CENTRIPETAL_BOOST:420,TETHER_TANGENTIAL_ACCEL:210,TETHER_BEAM_DPS:45,SUPERNOVA_ENERGY_COST:35,SUPERNOVA_BASE_RADIUS:185,SUPERNOVA_DAMAGE:65,SUPERNOVA_KNOCKBACK:440,SUPERNOVA_COOLDOWN_MS:900,WORLDLINE_BUFFER_TICKS:120,REWIND_ENERGY_COST:40,INITIAL_CHRONO_CHARGES:2,MAX_CHRONO_CHARGES:4,ECHO_RADIUS:11,ECHO_DAMAGE_MULT:1.25,MIN_CONSTELLATION_VERTICES:3,CONSTELLATION_BASE_DAMAGE:85,CONSTELLATION_AREA_SCORE_FACTOR:.018,CONSTELLATION_FLASH_DURATION_MS:1400,BASE_BUMPER_SCORE:60,SKIM_SCORE_PER_TICK:8,ROCHE_CRUSH_SCORE:320,ROCHE_CRUSH_HEAL:1,TOTAL_CAMPAIGN_SECTORS:5,ENDLESS_SPEED_CAP_WAVE:35},V={VANGUARD:{id:"VANGUARD",name:"Vanguard Lance",tagline:"Balanced Relativistic Interceptor · +25% Tether Range & Extended Trajectory Sight",mass:1,maxHull:5,bumperElasticityBonus:1,tetherRangeMult:1.25,supernovaRadiusMult:1,predictionStepsBonus:25,color:"#38bdf8",accentColor:"#bae6fd"},PHOTON_WISP:{id:"PHOTON_WISP",name:"Photon Wisp",tagline:"Featherweight Tachyon Skimmer · +30% Bumper Ricochet Speed & Empowered Worldline Echo",mass:.78,maxHull:4,bumperElasticityBonus:1.3,tetherRangeMult:1.1,supernovaRadiusMult:.95,predictionStepsBonus:15,color:"#f472b6",accentColor:"#fbcfe8"},STAR_HAMMER:{id:"STAR_HAMMER",name:"Juggernaut Star-Hammer",tagline:"Heavy Siege Dreadnought · 6 Hull, Crushes Shields on Ram & +40% Supernova Shockwave",mass:1.32,maxHull:6,bumperElasticityBonus:.95,tetherRangeMult:1,supernovaRadiusMult:1.4,predictionStepsBonus:0,color:"#f59e0b",accentColor:"#fde68a"}},W=[{id:"KEPLER_SCYTHE",name:"Kepler's Area Scythe",symbol:"📐",rarity:"MYTHIC",color:"#38bdf8",shortHook:"+65% Constellation Polygon Damage & +1.5x Score Mult per Triangle",description:"Sweeping 3+ Constellation Pegs into a closed geometric polygon deals +65% laser damage and adds +1.5x to your launch multiplier."},{id:"HAWKING_PRISM",name:"Hawking Radiation Prism",symbol:"🌈",rarity:"EPIC",color:"#f472b6",shortHook:"Event Horizon Skims Fire 3 Homing Photon Lances",description:"Skimming inside any Singularity Photon Sphere emits 3 homing Photon Lances that strike the nearest enemies for 28 damage each."},{id:"NOETHER_DYNAMO",name:"Noether's Symmetry Dynamo",symbol:"⚡",rarity:"RARE",color:"#fbbf24",shortHook:"+0.4x Lorentz Mult & +10 Hawking Energy per Bumper Bounce",description:"Conservation of angular momentum grants +0.4x relativistic combo multiplier and +10 Hawking Energy every time you ricochet off a bumper."},{id:"SCHRODINGER_ECHO",name:"Schrödinger's Wavefunction",symbol:"👻",rarity:"MYTHIC",color:"#a855f7",shortHook:"Chrono-Rewind Echo Deals 2.2x Damage & Triggers Bumpers",description:"Rewinding your worldline spawns a superposed Quantum Echo that deals 2.2x ram damage and refunds 15 Hawking Energy."},{id:"ROCHE_CRUSHER",name:"Roche Limit Tidal Crusher",symbol:"🌀",rarity:"EPIC",color:"#10b981",shortHook:"Crushing Enemies in a Singularity Heals +1 Hull & +500 Score",description:"Enemies pulled or knocked into a Gravity Well core are tidally shredded, restoring +1 Ship Hull and awarding +500 bonus points."},{id:"TACHYON_RAIL",name:"Tachyon Rail-Capacitor",symbol:"🚀",rarity:"RARE",color:"#22d3ee",shortHook:"+30% Slingshot Launch Speed & Piercing Relativistic Ram",description:"Slingshot launches start +30% faster and your ship slices straight through non-boss enemies without losing momentum."},{id:"DYSON_HARMONIC",name:"Dyson Harmonic Resonator",symbol:"🔗",rarity:"EPIC",color:"#f97316",shortHook:"Quantum Tether Beam Slices Enemies for +80% Plasma DPS",description:"While tethered ([Q]), the quantum cable between your ship and the anchor becomes a searing plasma wire that cuts through every enemy in its path."},{id:"SUPERNOVA_CORE",name:"Chandrasekhar Limit Core",symbol:"💥",rarity:"MYTHIC",color:"#ef4444",shortHook:"+50% Supernova Radius & Free Auto-Nova Every 4th Bounce",description:"Supernova Discharge ([E]) expands +50% wider, and every 4th consecutive bumper bounce in a single flight triggers a free Supernova pulse!"},{id:"CHRONO_HOURGLASS",name:"Minkowski Light-Cone Glass",symbol:"⏳",rarity:"RARE",color:"#818cf8",shortHook:"0-Cost Bullet-Time Aiming & +1 Max Chrono-Rewind Charge",description:"Aiming in Bullet-Time drains zero Hawking Energy, extends trajectory sight by 35 steps, and immediately grants +1 Chrono-Charge."},{id:"BINARY_ATTRACTOR",name:"Lagrange Point Magnetar",symbol:"🧲",rarity:"RARE",color:"#34d399",shortHook:"Global Stardust Magnet & +50% Shard Score Value",description:"Stardust motes and Chrono-Shards across the entire sector accelerate toward your ship automatically and grant +50% bonus score."},{id:"LORENTZ_AEGIS",name:"Lorentz Relativistic Aegis",symbol:"🛡️",rarity:"EPIC",color:"#60a5fa",shortHook:"Invulnerable to Damage While Lorentz γ ≥ 2.0x",description:"Relativistic time dilation shields your hull: whenever your Lorentz factor γ is 2.0x or higher, incoming hazards and projectiles deal 0 damage."},{id:"OMEGA_MONOLITH",name:"Kardashev Type-III Monolith",symbol:"👑",rarity:"MYTHIC",color:"#fde047",shortHook:"x1.35 Multiplicative Score Bonus per Equipped Astro-Relic",description:"Resonates with your entire Relic Constellation: multiplies all bumper, ram, and polygon scores by 1.35x for each Astro-Relic you hold."}],Z=[{sectorNumber:1,id:"sector-1-kepler-nursery",title:"Sector I · The Kepler Nursery",subtitle:"Golden Proto-Singularity & Hexagonal Constellation Ring",loreBrief:"Slingshot around the central Proto-Star! Skim its golden Photon Sphere to build Lorentz γ, and bounce across 3+ Constellation Pegs to enclose a laser triangle!",ambientHue:"#0ea5e9",wells:[{id:"well-kepler-alpha",name:"Kepler Proto-Singularity",kind:"BLACK_HOLE",x:480,y:300,mass:31e5,coreRadius:28,skimRadius:96}],bumpers:[{id:"bmp-1",kind:"CONSTELLATION_PEG",x:310,y:170,radius:20,restitution:1.18,harmonicNoteIndex:0},{id:"bmp-2",kind:"CONSTELLATION_PEG",x:650,y:170,radius:20,restitution:1.18,harmonicNoteIndex:1},{id:"bmp-3",kind:"CONSTELLATION_PEG",x:710,y:300,radius:20,restitution:1.18,harmonicNoteIndex:2},{id:"bmp-4",kind:"CONSTELLATION_PEG",x:650,y:430,radius:20,restitution:1.18,harmonicNoteIndex:3},{id:"bmp-5",kind:"CONSTELLATION_PEG",x:310,y:430,radius:20,restitution:1.18,harmonicNoteIndex:4},{id:"bmp-6",kind:"OVERCHARGE_ANVIL",x:250,y:300,radius:22,restitution:1.26,harmonicNoteIndex:5}],enemies:[{kind:"VOID_DRONE",x:480,y:125},{kind:"VOID_DRONE",x:615,y:245},{kind:"VOID_DRONE",x:615,y:355},{kind:"VOID_DRONE",x:480,y:475},{kind:"PHASE_FRIGATE",x:355,y:245}]},{sectorNumber:2,id:"sector-2-roche-foundry",title:"Sector II · The Roche Foundry",subtitle:"Twin Binary Gravity Wells & Figure-8 Slingshot Corridor",loreBrief:"Two coupled Singularities create a Lagrange corridor down the center. Thread the figure-8 or use Supernova ([E]) to knock armored Frigates into the Roche Limit!",ambientHue:"#f59e0b",wells:[{id:"well-roche-west",name:"Castor Gravity Well",kind:"BLACK_HOLE",x:330,y:300,mass:255e4,coreRadius:25,skimRadius:88},{id:"well-roche-east",name:"Pollux Gravity Well",kind:"NEUTRON_STAR",x:630,y:300,mass:255e4,coreRadius:25,skimRadius:88}],bumpers:[{id:"bmp-r1",kind:"CONSTELLATION_PEG",x:480,y:145,radius:20,restitution:1.2,harmonicNoteIndex:0},{id:"bmp-r2",kind:"CONSTELLATION_PEG",x:480,y:455,radius:20,restitution:1.2,harmonicNoteIndex:2},{id:"bmp-r3",kind:"CONSTELLATION_PEG",x:185,y:195,radius:19,restitution:1.18,harmonicNoteIndex:3},{id:"bmp-r4",kind:"CONSTELLATION_PEG",x:775,y:195,radius:19,restitution:1.18,harmonicNoteIndex:4},{id:"bmp-r5",kind:"CONSTELLATION_PEG",x:185,y:405,radius:19,restitution:1.18,harmonicNoteIndex:5},{id:"bmp-r6",kind:"CONSTELLATION_PEG",x:775,y:405,radius:19,restitution:1.18,harmonicNoteIndex:6},{id:"bmp-r7",kind:"CHRONO_CRYSTAL",x:480,y:300,radius:21,restitution:1.28,harmonicNoteIndex:7}],enemies:[{kind:"VOID_DRONE",x:330,y:155},{kind:"VOID_DRONE",x:630,y:155},{kind:"PHASE_FRIGATE",x:330,y:445},{kind:"PHASE_FRIGATE",x:630,y:445},{kind:"ENTROPY_COMET",x:205,y:300},{kind:"ENTROPY_COMET",x:755,y:300}]},{sectorNumber:3,id:"sector-3-dyson-choir",title:"Sector III · The Dyson Choir",subtitle:"Orbiting Resonance Bumpers & Tessera Shield Wardens",loreBrief:"Tessera Wardens project frontal shields that deflect low-speed impacts. Whip on your Quantum Tether ([Q]) to reach Lorentz γ ≥ 2.0x or enclose them inside a Constellation Polygon!",ambientHue:"#a855f7",wells:[{id:"well-dyson-core",name:"Dyson Pulsar Core",kind:"NEUTRON_STAR",x:480,y:300,mass:34e5,coreRadius:26,skimRadius:98}],bumpers:[{id:"bmp-d1",kind:"CONSTELLATION_PEG",x:480,y:120,radius:19,restitution:1.22,harmonicNoteIndex:0,orbitCenterX:480,orbitCenterY:300,orbitRadius:185,orbitAngularSpeed:.45,orbitPhase:0},{id:"bmp-d2",kind:"CONSTELLATION_PEG",x:640,y:390,radius:19,restitution:1.22,harmonicNoteIndex:2,orbitCenterX:480,orbitCenterY:300,orbitRadius:185,orbitAngularSpeed:.45,orbitPhase:Math.PI*2/3},{id:"bmp-d3",kind:"CONSTELLATION_PEG",x:320,y:390,radius:19,restitution:1.22,harmonicNoteIndex:4,orbitCenterX:480,orbitCenterY:300,orbitRadius:185,orbitAngularSpeed:.45,orbitPhase:Math.PI*4/3},{id:"bmp-d4",kind:"OVERCHARGE_ANVIL",x:210,y:170,radius:22,restitution:1.28,harmonicNoteIndex:5},{id:"bmp-d5",kind:"OVERCHARGE_ANVIL",x:750,y:170,radius:22,restitution:1.28,harmonicNoteIndex:6},{id:"bmp-d6",kind:"CONSTELLATION_PEG",x:210,y:430,radius:20,restitution:1.2,harmonicNoteIndex:7},{id:"bmp-d7",kind:"CONSTELLATION_PEG",x:750,y:430,radius:20,restitution:1.2,harmonicNoteIndex:8}],enemies:[{kind:"TESSERA_WARDEN",x:350,y:195},{kind:"TESSERA_WARDEN",x:610,y:195},{kind:"TESSERA_WARDEN",x:480,y:435},{kind:"PHASE_FRIGATE",x:255,y:300},{kind:"PHASE_FRIGATE",x:705,y:300},{kind:"VOID_DRONE",x:480,y:165}]},{sectorNumber:4,id:"sector-4-wormhole-binary",title:"Sector IV · The Chrono-Shear Wormhole",subtitle:"Einstein-Rosen Black Hole / White Hole Relativistic Cannon",loreBrief:"Dive directly into the western Black Hole core to erupt out of the eastern White Hole at 1.65x relativistic velocity with a free shockwave!",ambientHue:"#ec4899",wells:[{id:"well-wormhole-in",name:"Charybdis Singularity (Wormhole Entry)",kind:"BLACK_HOLE",x:290,y:300,mass:29e5,coreRadius:30,skimRadius:94,pairedWellId:"well-wormhole-out"},{id:"well-wormhole-out",name:"Scylla White Hole (Relativistic Exit)",kind:"WHITE_HOLE",x:670,y:300,mass:-14e5,coreRadius:28,skimRadius:92,pairedWellId:"well-wormhole-in"}],bumpers:[{id:"bmp-w1",kind:"CONSTELLATION_PEG",x:480,y:130,radius:20,restitution:1.22,harmonicNoteIndex:0},{id:"bmp-w2",kind:"CONSTELLATION_PEG",x:480,y:470,radius:20,restitution:1.22,harmonicNoteIndex:1},{id:"bmp-w3",kind:"CONSTELLATION_PEG",x:790,y:165,radius:20,restitution:1.22,harmonicNoteIndex:2},{id:"bmp-w4",kind:"CONSTELLATION_PEG",x:790,y:435,radius:20,restitution:1.22,harmonicNoteIndex:3},{id:"bmp-w5",kind:"CHRONO_CRYSTAL",x:170,y:165,radius:21,restitution:1.25,harmonicNoteIndex:4},{id:"bmp-w6",kind:"CHRONO_CRYSTAL",x:170,y:435,radius:21,restitution:1.25,harmonicNoteIndex:5},{id:"bmp-w7",kind:"REPULSOR_COIL",x:480,y:300,radius:22,restitution:1.32,harmonicNoteIndex:6}],enemies:[{kind:"TESSERA_WARDEN",x:540,y:210},{kind:"TESSERA_WARDEN",x:540,y:390},{kind:"ENTROPY_COMET",x:770,y:300},{kind:"PHASE_FRIGATE",x:390,y:180},{kind:"PHASE_FRIGATE",x:390,y:420},{kind:"VOID_DRONE",x:670,y:155},{kind:"VOID_DRONE",x:670,y:445}]},{sectorNumber:5,id:"sector-5-omega-architect",title:"Sector V · BOSS: KARDASHEV-IX DYSON SOVEREIGN",subtitle:"The Omega Singularity Ring & 4 Harmonic Anchor Pylons",loreBrief:"KARDASHEV-IX guards the Omega Singularity! Ricochet across the 8 Resonance Bumpers to enclose Constellation Polygons around the Boss or ram it at high Lorentz γ!",ambientHue:"#f43f5e",wells:[{id:"well-omega-heart",name:"Omega Singularity Heart",kind:"BLACK_HOLE",x:480,y:300,mass:35e5,coreRadius:27,skimRadius:102}],bumpers:[{id:"bmp-b1",kind:"CONSTELLATION_PEG",x:280,y:140,radius:20,restitution:1.24,harmonicNoteIndex:0},{id:"bmp-b2",kind:"CONSTELLATION_PEG",x:680,y:140,radius:20,restitution:1.24,harmonicNoteIndex:1},{id:"bmp-b3",kind:"CONSTELLATION_PEG",x:770,y:300,radius:20,restitution:1.24,harmonicNoteIndex:2},{id:"bmp-b4",kind:"CONSTELLATION_PEG",x:680,y:460,radius:20,restitution:1.24,harmonicNoteIndex:3},{id:"bmp-b5",kind:"CONSTELLATION_PEG",x:280,y:460,radius:20,restitution:1.24,harmonicNoteIndex:4},{id:"bmp-b6",kind:"CONSTELLATION_PEG",x:190,y:300,radius:20,restitution:1.24,harmonicNoteIndex:5},{id:"bmp-b7",kind:"OVERCHARGE_ANVIL",x:480,y:115,radius:22,restitution:1.3,harmonicNoteIndex:6},{id:"bmp-b8",kind:"CHRONO_CRYSTAL",x:480,y:485,radius:22,restitution:1.3,harmonicNoteIndex:7}],enemies:[{kind:"KARDASHEV_BOSS",x:480,y:185,hp:420},{kind:"TESSERA_WARDEN",x:335,y:235},{kind:"TESSERA_WARDEN",x:625,y:235},{kind:"PHASE_FRIGATE",x:355,y:385},{kind:"PHASE_FRIGATE",x:605,y:385}]}],U=[{puzzleNumber:1,id:"dojo-1-kepler-triangle",title:"Dojo I · The Sacred Triangle",subtitle:"1-Launch Par · Bounce off 3 Constellation Pegs to Enclose the Drone Squadron",hint:"Aim toward the top-left Constellation Peg (or press [C] AI Coach) so the central Singularity bends your path around all 3 pegs!",parLaunches:1,shipStartX:160,shipStartY:300,recommendedAimDeg:-32,recommendedPowerPct:.92,wells:[{id:"dojo1-well",name:"Dojo Singularity",kind:"BLACK_HOLE",x:480,y:300,mass:28e5,coreRadius:24,skimRadius:90}],bumpers:[{id:"d1-b1",kind:"CONSTELLATION_PEG",x:350,y:150,radius:24,restitution:1.22,harmonicNoteIndex:0},{id:"d1-b2",kind:"CONSTELLATION_PEG",x:660,y:180,radius:24,restitution:1.22,harmonicNoteIndex:2},{id:"d1-b3",kind:"CONSTELLATION_PEG",x:580,y:445,radius:24,restitution:1.22,harmonicNoteIndex:4}],targets:[{kind:"VOID_DRONE",x:520,y:245,hp:40},{kind:"VOID_DRONE",x:560,y:310,hp:40}]},{puzzleNumber:2,id:"dojo-2-wormhole-snipe",title:"Dojo II · Einstein-Rosen Bankshot",subtitle:"1-Launch Par · Dive Into the Black Hole Wormhole to Erupt Through the Eastern Prism Ring",hint:"Aim straight into the western Black Hole core — you will exit the eastern White Hole at 1.65x speed directly into the target cluster!",parLaunches:1,shipStartX:140,shipStartY:300,recommendedAimDeg:0,recommendedPowerPct:.85,wells:[{id:"dojo2-bh",name:"Wormhole Entry",kind:"BLACK_HOLE",x:310,y:300,mass:26e5,coreRadius:34,skimRadius:88,pairedWellId:"dojo2-wh"},{id:"dojo2-wh",name:"White Hole Exit",kind:"WHITE_HOLE",x:620,y:300,mass:-9e5,coreRadius:28,skimRadius:84,pairedWellId:"dojo2-bh"}],bumpers:[{id:"d2-b1",kind:"CONSTELLATION_PEG",x:760,y:220,radius:24,restitution:1.24,harmonicNoteIndex:1},{id:"d2-b2",kind:"CONSTELLATION_PEG",x:760,y:380,radius:24,restitution:1.24,harmonicNoteIndex:3},{id:"d2-b3",kind:"OVERCHARGE_ANVIL",x:840,y:300,radius:25,restitution:1.28,harmonicNoteIndex:5}],targets:[{kind:"VOID_DRONE",x:730,y:300,hp:40},{kind:"VOID_DRONE",x:790,y:300,hp:40}]},{puzzleNumber:3,id:"dojo-3-lagrange-slingshot",title:"Dojo III · The Figure-8 Lagrange Whip",subtitle:"1-Launch Par · Thread Between Twin Gravity Wells to Strike Both Outer Beacons",hint:"Launch slightly upward through the central Lagrange saddle so the upper well bends you right and the lower well bends you back!",parLaunches:1,shipStartX:170,shipStartY:420,recommendedAimDeg:-26,recommendedPowerPct:.95,wells:[{id:"dojo3-w1",name:"Upper Binary Star",kind:"BLACK_HOLE",x:480,y:195,mass:25e5,coreRadius:24,skimRadius:82},{id:"dojo3-w2",name:"Lower Binary Star",kind:"BLACK_HOLE",x:480,y:405,mass:25e5,coreRadius:24,skimRadius:82}],bumpers:[{id:"d3-b1",kind:"CONSTELLATION_PEG",x:350,y:300,radius:23,restitution:1.25,harmonicNoteIndex:0},{id:"d3-b2",kind:"CONSTELLATION_PEG",x:610,y:300,radius:23,restitution:1.25,harmonicNoteIndex:2},{id:"d3-b3",kind:"CONSTELLATION_PEG",x:770,y:205,radius:24,restitution:1.25,harmonicNoteIndex:4}],targets:[{kind:"VOID_DRONE",x:480,y:300,hp:40},{kind:"VOID_DRONE",x:710,y:250,hp:40}]},{puzzleNumber:4,id:"dojo-4-prism-diamond",title:"Dojo IV · The Grand Diamond Enclosure",subtitle:"1-Launch Par · Ricochet Around the 4-Peg Diamond Ring to Vaporize the Core Fleet",hint:"Aim into the top diamond peg at steep angle — the angled bumper geometry naturally chains all 4 vertices around the Singularity!",parLaunches:1,shipStartX:220,shipStartY:300,recommendedAimDeg:-42,recommendedPowerPct:.94,wells:[{id:"dojo4-well",name:"Diamond Singularity",kind:"NEUTRON_STAR",x:520,y:300,mass:29e5,coreRadius:24,skimRadius:90}],bumpers:[{id:"d4-b1",kind:"CONSTELLATION_PEG",x:520,y:120,radius:24,restitution:1.26,harmonicNoteIndex:0},{id:"d4-b2",kind:"CONSTELLATION_PEG",x:730,y:300,radius:24,restitution:1.26,harmonicNoteIndex:2},{id:"d4-b3",kind:"CONSTELLATION_PEG",x:520,y:480,radius:24,restitution:1.26,harmonicNoteIndex:4},{id:"d4-b4",kind:"CONSTELLATION_PEG",x:340,y:300,radius:22,restitution:1.26,harmonicNoteIndex:6}],targets:[{kind:"VOID_DRONE",x:615,y:220,hp:40},{kind:"VOID_DRONE",x:615,y:380,hp:40},{kind:"VOID_DRONE",x:430,y:220,hp:40}]},{puzzleNumber:5,id:"dojo-5-syzygy-master",title:"Dojo V · Grandmaster Syzygy",subtitle:"1-Launch Par · Combine Wormhole Acceleration + Constellation Triangle to Shatter the Warden",hint:"Use the [C] AI Trickshot Coach or launch through the top bumper into the Wormhole so your 1.65x exit encloses the Warden!",parLaunches:1,shipStartX:150,shipStartY:460,recommendedAimDeg:-38,recommendedPowerPct:.96,wells:[{id:"dojo5-bh",name:"Syzygy Black Hole",kind:"BLACK_HOLE",x:370,y:260,mass:27e5,coreRadius:32,skimRadius:88,pairedWellId:"dojo5-wh"},{id:"dojo5-wh",name:"Syzygy White Hole",kind:"WHITE_HOLE",x:650,y:260,mass:-1e6,coreRadius:26,skimRadius:84,pairedWellId:"dojo5-bh"}],bumpers:[{id:"d5-b1",kind:"CONSTELLATION_PEG",x:260,y:170,radius:24,restitution:1.25,harmonicNoteIndex:0},{id:"d5-b2",kind:"CONSTELLATION_PEG",x:770,y:170,radius:24,restitution:1.25,harmonicNoteIndex:2},{id:"d5-b3",kind:"CONSTELLATION_PEG",x:750,y:420,radius:24,restitution:1.25,harmonicNoteIndex:4},{id:"d5-b4",kind:"OVERCHARGE_ANVIL",x:540,y:430,radius:24,restitution:1.28,harmonicNoteIndex:6}],targets:[{kind:"TESSERA_WARDEN",x:720,y:290,hp:70},{kind:"VOID_DRONE",x:640,y:380,hp:40}]}],K={SACRED_GEOMETER:{id:"SACRED_GEOMETER",title:"Architect of the Sacred Constellation",badge:"📐 MYTHIC GEOMETER",summary:"You turned the cosmos into a Euclidean laser loom, enclosing entire Void Armadas inside glowing Shoelace Polygons."},HORIZON_DAREDEVIL:{id:"HORIZON_DAREDEVIL",title:"Photon-Sphere Daredevil",badge:"🌀 RELATIVISTIC ACE",summary:"You danced along the razor edge of the Event Horizon, riding Hawking radiation and Lorentz time dilation above 4.0x γ."},WORLDLINE_WEAVER:{id:"WORLDLINE_WEAVER",title:"Chrono-Worldline Paradox Weaver",badge:"⏳ TEMPORAL TWIN",summary:"You folded your own spacetime worldline back upon itself, letting your Phantom Echo double-strike across causality."},KARDASHEV_SOVEREIGN:{id:"KARDASHEV_SOVEREIGN",title:"Sovereign of Kardashev Type-III",badge:"👑 DYSON CONQUEROR",summary:"You shattered the Dyson Architect and mastered orbital momentum across every Singularity in the sector."},ENTROPIC_DRIFT:{id:"ENTROPIC_DRIFT",title:"Claimed by the Singularity",badge:"🌑 TIDAL COLLAPSE",summary:"Gravitational shear overcame your hull—study the Counterfactual Trajectory Lab to see how another orbital archetype conquers this seed!"}};class j{state;constructor(o=20261108){this.state=o>>>0||322420463}getState(){return this.state>>>0}setState(o){this.state=o>>>0||322420463}next(){let o=this.state+=1831565813;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),((o^o>>>14)>>>0)/4294967296}nextFloat(o,s){return o+this.next()*(s-o)}nextInt(o,s){const i=Math.ceil(o),l=Math.floor(s);return l<=i?i:i+Math.floor(this.next()*(l-i+1))}pick(o){if(o.length===0)throw new Error("Cannot pick from empty array");return o[this.nextInt(0,o.length-1)]}shuffle(o){const s=[...o];for(let i=s.length-1;i>0;i--){const l=this.nextInt(0,i),t=s[i];s[i]=s[l],s[l]=t}return s}}function L(e,o,s){return Math.max(o,Math.min(s,e))}function te(e){if(e.length<3)return 0;let o=0;for(let s=0;s<e.length;s++){const i=e[s],l=e[(s+1)%e.length];o+=i.x*l.y-l.x*i.y}return Math.abs(o)*.5}function le(e,o,s){if(s.length<3)return!1;let i=!1;for(let l=0,t=s.length-1;l<s.length;t=l++){const d=s[l].x,h=s[l].y,p=s[t].x,E=s[t].y;h>o!=E>o&&e<(p-d)*(o-h)/(E-h+1e-9)+d&&(i=!i)}return i}function ee(e,o,s,i,l,t){const d=l-s,h=t-i,p=d*d+h*h;if(p<=1e-6)return Math.hypot(e-s,o-i);const E=L(((e-s)*d+(o-i)*h)/p,0,1),u=s+E*d,f=i+E*h;return Math.hypot(e-u,o-f)}function ae(e,o,s){const i=L(e/a.SPEED_OF_LIGHT_CAP,0,.965),l=1/Math.sqrt(1-i*i),t=o*(s?.4:.22);return Number(L(l+t,1,8).toFixed(2))}function J(e,o,s=1){const i={VOID_DRONE:45,PHASE_FRIGATE:95,ENTROPY_COMET:70,TESSERA_WARDEN:135,KARDASHEV_BOSS:440},l={VOID_DRONE:15,PHASE_FRIGATE:20,ENTROPY_COMET:17,TESSERA_WARDEN:23,KARDASHEV_BOSS:44},t=Math.round((e.hp??i[e.kind])*s);return{id:`enemy-${o}-${e.kind.toLowerCase()}`,kind:e.kind,x:e.x,y:e.y,vx:e.vx??0,vy:e.vy??0,radius:l[e.kind],hp:t,maxHp:t,shielded:e.kind==="TESSERA_WARDEN"||e.kind==="KARDASHEV_BOSS",fireCooldownMs:1800+o%4*450,hitFlashMs:0,orbitAngle:o*Math.PI/3}}function B(e=a.DEFAULT_SEED,o){const s=e>>>0||a.DEFAULT_SEED,i=new j(s),l=o?.mode??"ODYSSEY",t=o?.chassis??"VANGUARD",d=V[t],h=o?.startSector??1,p={seed:s,rngState:i.getState(),mode:l,status:"PLAYING",sector:h,sectorTitle:"",sectorSubtitle:"",sectorHint:"",tick:0,elapsedMs:0,score:0,launchesUsed:0,sectorLaunchesUsed:0,parLaunches:null,ship:{chassis:t,x:190,y:300,vx:30,vy:-135,radius:a.SHIP_RADIUS,hull:d.maxHull,maxHull:d.maxHull,hawkingEnergy:a.INITIAL_HAWKING_ENERGY,maxHawkingEnergy:a.MAX_HAWKING_ENERGY,chronoCharges:a.INITIAL_CHRONO_CHARGES,maxChronoCharges:a.MAX_CHRONO_CHARGES,lorentzGamma:1.05,peakLorentzGamma:1.05,isAiming:!1,aimAngleRad:-.45,aimPowerPct:.85,tetherTargetId:null,tetherKind:null,invulnerableMs:0,wormholeCooldownMs:0,supernovaCooldownMs:0,skimSoundCooldownMs:0,bounceChain:0,constellationVertices:[]},worldlineHistory:[],activeEcho:null,wells:[],bumpers:[],enemies:[],projectiles:[],starMotes:[],activePolygons:[],relics:[],relicDraftChoices:[],stats:{enemiesVaporized:0,rocheCrushes:0,polygonsEnclosed:0,totalPolygonAreaPx2:0,wormholeTransits:0,skimsPerformed:0,rewindsUsed:0,supernovasUsed:0,bumperRicochets:0},verdictId:null,log:[],events:[]};return X(p,h),p}function X(e,o){const s=new j(e.rngState^o*2654435769);if(e.sector=o,e.sectorLaunchesUsed=0,e.projectiles=[],e.starMotes=[],e.activePolygons=[],e.activeEcho=null,e.ship.tetherTargetId=null,e.ship.tetherKind=null,e.ship.bounceChain=0,e.ship.constellationVertices=[],e.ship.isAiming=!1,e.mode==="TRICKSHOT_DOJO"){const d=L(o-1,0,U.length-1),h=U[d];e.sectorTitle=h.title,e.sectorSubtitle=h.subtitle,e.sectorHint=h.hint,e.parLaunches=h.parLaunches,e.ship.x=h.shipStartX,e.ship.y=h.shipStartY,e.ship.vx=0,e.ship.vy=0,e.ship.aimAngleRad=h.recommendedAimDeg*Math.PI/180,e.ship.aimPowerPct=h.recommendedPowerPct,e.wells=h.wells.map(p=>({...p,pulsePhase:0})),e.bumpers=h.bumpers.map(p=>({...p,hitFlashMs:0,activatedInChain:!1})),e.enemies=h.targets.map((p,E)=>J(p,E,1)),e.worldlineHistory=[{x:e.ship.x,y:e.ship.y,vx:0,vy:0}],e.log.unshift(`Loaded ${h.title} (Par: ${h.parLaunches} Launch).`),e.rngState=s.getState();return}const i=(o-1)%Z.length,l=Z[i],t=e.mode==="ENDLESS_SINGULARITY"?1+Math.min(o-1,a.ENDLESS_SPEED_CAP_WAVE)*.14:1+(o-1)*.08;if(e.sectorTitle=e.mode==="ENDLESS_SINGULARITY"?`Endless Wave ${o} · ${l.title.split("·")[1]?.trim()??l.title}`:l.title,e.sectorSubtitle=l.subtitle,e.sectorHint=l.loreBrief,e.parLaunches=null,e.ship.x=155,e.ship.y=300,e.ship.vx=25,e.ship.vy=-140,e.ship.aimAngleRad=-.35,e.ship.aimPowerPct=.88,e.wells=l.wells.map(d=>({...d,pulsePhase:0})),e.bumpers=l.bumpers.map(d=>({...d,hitFlashMs:0,activatedInChain:!1})),e.enemies=l.enemies.map((d,h)=>J(d,h,t)),e.mode==="ENDLESS_SINGULARITY"&&o>1){const d=Math.min(4,Math.floor(o/2));for(let h=0;h<d;h++){const p=s.nextFloat(0,Math.PI*2),E=s.nextFloat(150,230),u=L(480+Math.cos(p)*E,120,840),f=L(300+Math.sin(p)*E,100,500),A=["VOID_DRONE","PHASE_FRIGATE","ENTROPY_COMET","TESSERA_WARDEN"],r=s.pick(A);e.enemies.push(J({kind:r,x:u,y:f},l.enemies.length+h,t))}}e.worldlineHistory=[{x:e.ship.x,y:e.ship.y,vx:e.ship.vx,vy:e.ship.vy}],e.log.unshift(`Entered ${e.sectorTitle}.`),e.rngState=s.getState()}function F(e){return JSON.parse(JSON.stringify(e))}function O(e,o){return e.relics.includes(o)}function $(e){let o=1;return O(e,"OMEGA_MONOLITH")&&(o*=Math.pow(1.35,e.relics.length)),o}function ie(e,o,s){let i=0,l=0,t=null,d=1/0;for(const h of s){const p=h.x-e,E=h.y-o,u=Math.hypot(p,E);u<d&&(d=u,t=h);const f=Math.max(u*u,(h.coreRadius+16)*(h.coreRadius+16)),A=h.mass/f;u>1e-4&&(i+=p/u*A,l+=E/u*A)}return{ax:i,ay:l,nearestWell:t,nearestDist:d}}function oe(e,o=e.ship.aimAngleRad,s=e.ship.aimPowerPct){const i=V[e.ship.chassis],l=i.predictionStepsBonus+(O(e,"CHRONO_HOURGLASS")?35:0),t=a.PREDICTION_STEPS+l,d=a.PREDICTION_STEP_DT,h=O(e,"TACHYON_RAIL")?1.3:1,p=(a.MIN_SLINGSHOT_SPEED+(a.MAX_SLINGSHOT_SPEED-a.MIN_SLINGSHOT_SPEED)*L(s,.15,1))*h;let E=e.ship.x,u=e.ship.y,f=Math.cos(o)*p,A=Math.sin(o)*p,r=0;const c=[{x:E,y:u}];for(let R=0;R<t;R++){const{ax:S,ay:b,nearestWell:_,nearestDist:N}=ie(E,u,e.wells);f=(f+S*d)*a.SPACE_DRAG,A=(A+b*d)*a.SPACE_DRAG,E+=f*d,u+=A*d;let C,n;if(_&&N<=_.skimRadius&&(n=_.id,N<=_.coreRadius+e.ship.radius&&_.pairedWellId&&r<=0)){const I=e.wells.find(x=>x.id===_.pairedWellId);if(I){const x=Math.hypot(f,A)*1.65,v=Math.atan2(A,f);E=I.x+Math.cos(v)*(I.coreRadius+e.ship.radius+6),u=I.y+Math.sin(v)*(I.coreRadius+e.ship.radius+6),f=Math.cos(v)*Math.min(x,a.SPEED_OF_LIGHT_CAP),A=Math.sin(v)*Math.min(x,a.SPEED_OF_LIGHT_CAP),r=15}}r>0&&r--;for(const I of e.bumpers){const x=E-I.x,v=u-I.y,k=Math.hypot(x,v),H=e.ship.radius+I.radius;if(k<H&&k>1e-4){const P=x/k,D=v/k;E=I.x+P*(H+1),u=I.y+D*(H+1);const w=f*P+A*D;if(w<0){const M=I.restitution*i.bumperElasticityBonus;f=(f-2*w*P)*M,A=(A-2*w*D)*M}C=I.id;break}}const m=a.WALL_MARGIN+e.ship.radius,y=a.ARENA_WIDTH-a.WALL_MARGIN-e.ship.radius,g=a.WALL_MARGIN+e.ship.radius,T=a.ARENA_HEIGHT-a.WALL_MARGIN-e.ship.radius;E<m?(E=m,f=Math.abs(f)*a.WALL_RESTITUTION):E>y&&(E=y,f=-Math.abs(f)*a.WALL_RESTITUTION),u<g?(u=g,A=Math.abs(A)*a.WALL_RESTITUTION):u>T&&(u=T,A=-Math.abs(A)*a.WALL_RESTITUTION),c.push({x:E,y:u,hitBumperId:C,skimWellId:n})}return c}function he(e){if(e.mode==="TRICKSHOT_DOJO"){const l=L(e.sector-1,0,U.length-1),t=U[l];if(e.sectorLaunchesUsed===0)return{angleRad:t.recommendedAimDeg*Math.PI/180,powerPct:t.recommendedPowerPct,expectedHits:t.targets.length+3}}let o=e.ship.aimAngleRad,s=.92,i=-1/0;for(let l=0;l<36;l++){const t=-Math.PI+l*Math.PI*2/36,d=.92,h=oe(e,t,d),p=new Set,E=new Set;let u=0;for(const r of h){r.hitBumperId&&p.add(r.hitBumperId),r.skimWellId&&(u+=1);for(const c of e.enemies)Math.hypot(r.x-c.x,r.y-c.y)<=c.radius+e.ship.radius+10&&E.add(c.id)}const f=p.size>=3?450:0,A=E.size*180+p.size*110+f+Math.min(u,20)*4;A>i&&(i=A,o=t,s=d)}return{angleRad:o,powerPct:s,expectedHits:Math.max(1,Math.round(i/150))}}function Y(e,o,s){e.stats.enemiesVaporized+=1;const i=$(e),l=o.kind==="KARDASHEV_BOSS"?1500:o.kind==="TESSERA_WARDEN"?260:o.kind==="PHASE_FRIGATE"?180:120,t=Math.round(l*e.ship.lorentzGamma*i);e.score+=t,e.events.push({type:"ENEMY_DESTROYED",x:o.x,y:o.y,text:`${s} +${t}`,color:s==="CONSTELLATION"?"#38bdf8":s==="ROCHE"?"#10b981":"#fbbf24",magnitude:o.kind==="KARDASHEV_BOSS"?3:1.4}),e.starMotes.push({id:`mote-${e.tick}-${o.id}`,kind:o.kind==="TESSERA_WARDEN"?"CHRONO_SHARD":"STARDUST",x:o.x,y:o.y,vx:(o.x-480)*.15,vy:(o.y-300)*.15,value:75,ttlMs:9e3})}function de(e,o=!1){const s=V[e.ship.chassis];if(!o){if(e.ship.hawkingEnergy<a.SUPERNOVA_ENERGY_COST||e.ship.supernovaCooldownMs>0)return;e.ship.hawkingEnergy=Math.max(0,e.ship.hawkingEnergy-a.SUPERNOVA_ENERGY_COST),e.ship.supernovaCooldownMs=a.SUPERNOVA_COOLDOWN_MS,e.stats.supernovasUsed+=1}const i=O(e,"SUPERNOVA_CORE")?1.5:1,l=a.SUPERNOVA_BASE_RADIUS*s.supernovaRadiusMult*i,t=Math.round(a.SUPERNOVA_DAMAGE*e.ship.lorentzGamma);e.projectiles=e.projectiles.filter(h=>h.friendly?!0:Math.hypot(h.x-e.ship.x,h.y-e.ship.y)>l);for(const h of e.enemies){const p=h.x-e.ship.x,E=h.y-e.ship.y,u=Math.hypot(p,E);if(u<=l+h.radius){h.shielded=!1,h.hp-=t,h.hitFlashMs=220;const f=u>.001?p/u:1,A=u>.001?E/u:0;h.vx+=f*a.SUPERNOVA_KNOCKBACK,h.vy+=A*a.SUPERNOVA_KNOCKBACK}}const d=[];for(const h of e.enemies)h.hp<=0?Y(e,h,"SUPERNOVA"):d.push(h);e.enemies=d,e.events.push({type:"SUPERNOVA_PULSE",x:e.ship.x,y:e.ship.y,text:o?"AUTO-SUPERNOVA!":"SUPERNOVA SHOCKWAVE!",color:"#f97316",magnitude:l}),e.log.unshift(`${o?"Chandrasekhar Auto-Nova":"Supernova Shockwave"} erupted (${Math.round(l)}px radius).`)}function ye(e){const o=e.ship.constellationVertices;if(o.length<a.MIN_CONSTELLATION_VERTICES)return;const s=o.slice(-Math.min(o.length,4)).map(c=>({x:c.x,y:c.y})),i=te(s);if(i<1200)return;e.stats.polygonsEnclosed+=1,e.stats.totalPolygonAreaPx2+=Math.round(i);const l=O(e,"KEPLER_SCYTHE");l&&(e.ship.lorentzGamma=L(Number((e.ship.lorentzGamma+1.5).toFixed(2)),1,8),e.ship.peakLorentzGamma=Math.max(e.ship.peakLorentzGamma,e.ship.lorentzGamma));const t=(l?1.65:1)*e.ship.lorentzGamma,d=Math.round(a.CONSTELLATION_BASE_DAMAGE*t);let h=0;for(const c of e.enemies){const R=le(c.x,c.y,s);let S=!1;for(let b=0;b<s.length;b++){const _=s[b],N=s[(b+1)%s.length];if(ee(c.x,c.y,_.x,_.y,N.x,N.y)<=c.radius+46){S=!0;break}}(R||S)&&(c.shielded=!1,c.hp-=d,c.hitFlashMs=280,h+=1)}const p=[];for(const c of e.enemies)c.hp<=0?Y(e,c,"CONSTELLATION"):p.push(c);e.enemies=p;const E=$(e),u=Math.round((i*a.CONSTELLATION_AREA_SCORE_FACTOR+h*180)*e.ship.lorentzGamma*E);e.score+=u;const f=s.reduce((c,R)=>c+R.x,0)/s.length,A=s.reduce((c,R)=>c+R.y,0)/s.length;e.activePolygons.push({id:`poly-${e.tick}-${e.stats.polygonsEnclosed}`,vertices:s,areaPx2:Math.round(i),enemiesHit:h,scoreAwarded:u,ttlMs:a.CONSTELLATION_FLASH_DURATION_MS,maxTtlMs:a.CONSTELLATION_FLASH_DURATION_MS}),e.events.push({type:"CONSTELLATION_ENCLOSED",x:f,y:A,text:`📐 CONSTELLATION ENCLOSED! +${u}`,color:"#38bdf8",magnitude:2.2}),e.log.unshift(`Enclosed Constellation Polygon (${Math.round(i).toLocaleString()} px², ${h} targets struck, +${u} pts)!`);const r=o[o.length-1];e.ship.constellationVertices=r?[r]:[];for(const c of e.bumpers)c.activatedInChain=c.id===r?.id}function G(e,o){if(o.type==="TOGGLE_PAUSE"){e.status==="PLAYING"?e.status="PAUSED":e.status==="PAUSED"&&(e.status="PLAYING");return}if(o.type==="SELECT_CHASSIS"){const s=V[o.chassis];e.ship.chassis=o.chassis,e.ship.maxHull=s.maxHull,e.ship.hull=s.maxHull,e.log.unshift(`Selected Ship Chassis: ${s.name}.`);return}if(o.type==="SELECT_MODE"){const s=B(e.seed,{mode:o.mode,chassis:e.ship.chassis,startSector:o.sectorOrPuzzle??1});Object.assign(e,s);return}if(o.type==="SELECT_RELIC"){if(e.status!=="RELIC_DRAFT")return;e.relics.includes(o.relicId)||e.relics.push(o.relicId),o.relicId==="CHRONO_HOURGLASS"&&(e.ship.maxChronoCharges+=1,e.ship.chronoCharges=Math.min(e.ship.maxChronoCharges,e.ship.chronoCharges+1));const s=W.find(i=>i.id===o.relicId);e.events.push({type:"RELIC_DRAFTED",x:e.ship.x,y:e.ship.y,text:`RELIC: ${s?.name??o.relicId}`,color:s?.color??"#38bdf8"}),e.log.unshift(`Drafted Astro-Relic: ${s?.name??o.relicId}.`),e.relicDraftChoices=[],e.status="PLAYING",X(e,e.sector+1);return}if(e.status==="PLAYING")switch(o.type){case"BEGIN_AIM":{e.ship.isAiming=!0,typeof o.angleRad=="number"&&(e.ship.aimAngleRad=o.angleRad),typeof o.powerPct=="number"&&(e.ship.aimPowerPct=L(o.powerPct,.15,1));break}case"UPDATE_AIM":{e.ship.isAiming=!0,e.ship.aimAngleRad=o.angleRad,e.ship.aimPowerPct=L(o.powerPct,.15,1);break}case"CANCEL_AIM":{e.ship.isAiming=!1;break}case"LAUNCH_SLINGSHOT":{const s=o.angleRad??e.ship.aimAngleRad,i=L(o.powerPct??e.ship.aimPowerPct,.15,1),l=O(e,"TACHYON_RAIL")?1.3:1,t=(a.MIN_SLINGSHOT_SPEED+(a.MAX_SLINGSHOT_SPEED-a.MIN_SLINGSHOT_SPEED)*i)*l;e.ship.vx=Math.cos(s)*t,e.ship.vy=Math.sin(s)*t,e.ship.isAiming=!1,e.ship.tetherTargetId=null,e.ship.tetherKind=null,e.ship.bounceChain=0,e.ship.constellationVertices=[];for(const d of e.bumpers)d.activatedInChain=!1;e.launchesUsed+=1,e.sectorLaunchesUsed+=1,e.events.push({type:"SLINGSHOT_LAUNCH",x:e.ship.x,y:e.ship.y,text:`LAUNCH ${Math.round(t)} u/s`,color:"#38bdf8"});break}case"NUDGE_THRUST":{const s=Math.hypot(o.dx,o.dy);if(s>1e-4){const i=o.dx/s,l=o.dy/s;e.ship.vx+=i*42,e.ship.vy+=l*42;const t=Math.hypot(e.ship.vx,e.ship.vy);t>a.SPEED_OF_LIGHT_CAP&&(e.ship.vx=e.ship.vx/t*a.SPEED_OF_LIGHT_CAP,e.ship.vy=e.ship.vy/t*a.SPEED_OF_LIGHT_CAP)}break}case"TOGGLE_TETHER":{if(e.ship.tetherTargetId){e.ship.tetherTargetId=null,e.ship.tetherKind=null;break}const s=V[e.ship.chassis],i=a.TETHER_MAX_RANGE*s.tetherRangeMult;let l=null,t=null,d=i;for(const h of e.wells){const p=Math.hypot(h.x-e.ship.x,h.y-e.ship.y);p<=d&&(d=p,l=h.id,t="WELL")}for(const h of e.bumpers){const p=Math.hypot(h.x-e.ship.x,h.y-e.ship.y);p<=d&&(d=p,l=h.id,t="BUMPER")}l&&t&&(e.ship.tetherTargetId=l,e.ship.tetherKind=t,e.ship.isAiming=!1);break}case"TRIGGER_SUPERNOVA":{de(e,!1);break}case"TRIGGER_REWIND":{if(e.worldlineHistory.length<6)break;const s=e.ship.chronoCharges>0,i=e.ship.hawkingEnergy>=a.REWIND_ENERGY_COST;if(!s&&!i)break;s?e.ship.chronoCharges-=1:e.ship.hawkingEnergy-=a.REWIND_ENERGY_COST,O(e,"SCHRODINGER_ECHO")&&(e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+15));const l=[...e.worldlineHistory],t=l[0];e.activeEcho={active:!0,frames:l,frameIndex:0,x:t.x,y:t.y,vx:t.vx,vy:t.vy,radius:a.ECHO_RADIUS},e.ship.x=t.x,e.ship.y=t.y,e.ship.vx=t.vx,e.ship.vy=t.vy,e.ship.invulnerableMs=Math.max(e.ship.invulnerableMs,900),e.stats.rewindsUsed+=1,e.events.push({type:"CHRONO_REWIND",x:e.ship.x,y:e.ship.y,text:"⏳ WORLDLINE REWIND + PHANTOM ECHO!",color:"#a855f7",magnitude:2}),e.log.unshift("Rewound 2.0s along spacetime worldline & spawned Phantom Echo Twin!");break}case"TRIGGER_AI_COACH":{const s=he(e);e.ship.aimAngleRad=s.angleRad,e.ship.aimPowerPct=s.powerPct,G(e,{type:"LAUNCH_SLINGSHOT",angleRad:s.angleRad,powerPct:s.powerPct}),e.log.unshift(`AI Trickshot Coach executed optimal vector (${Math.round(s.angleRad*180/Math.PI)}°, ${Math.round(s.powerPct*100)}% power).`);break}}}function Se(e){const o=new j(e.rngState^e.tick*73244475);if(e.mode==="TRICKSHOT_DOJO"){e.sector>=U.length?(e.status="VICTORY",e.verdictId="SACRED_GEOMETER",e.events.push({type:"VICTORY",x:e.ship.x,y:e.ship.y,text:"DOJO GRANDMASTER VICTORY!",color:"#38bdf8"}),e.log.unshift("Completed all 5 Constellation Trickshot Dojo puzzles!")):X(e,e.sector+1),e.rngState=o.getState();return}if(e.mode==="ODYSSEY"&&e.sector>=a.TOTAL_CAMPAIGN_SECTORS){e.status="VICTORY",e.verdictId=q(e),e.events.push({type:"VICTORY",x:e.ship.x,y:e.ship.y,text:"👑 KARDASHEV-IX DEFEATED · ODYSSEY VICTORY!",color:"#fde047",magnitude:3.5}),e.log.unshift("Shattered KARDASHEV-IX and conquered the Event Horizon Odyssey!"),e.rngState=o.getState();return}const s=W.filter(l=>!e.relics.includes(l.id)).map(l=>l.id),i=s.length>=3?s:W.map(l=>l.id);e.relicDraftChoices=o.shuffle(i).slice(0,3),e.status="RELIC_DRAFT",e.events.push({type:"SECTOR_CLEARED",x:e.ship.x,y:e.ship.y,text:`SECTOR ${e.sector} CLEARED! CHOOSE AN ASTRO-RELIC`,color:"#10b981"}),e.rngState=o.getState()}function q(e){return e.status==="GAME_OVER"?"ENTROPIC_DRIFT":e.stats.polygonsEnclosed>=4?"SACRED_GEOMETER":e.ship.peakLorentzGamma>=3.8||e.stats.skimsPerformed>=20?"HORIZON_DAREDEVIL":e.stats.rewindsUsed>=2?"WORLDLINE_WEAVER":"KARDASHEV_SOVEREIGN"}function ne(e,o=a.FIXED_STEP_MS){if(e.status!=="PLAYING")return;const s=e.ship.isAiming?a.BULLET_TIME_SCALE:1,i=o*s,l=i/1e3;e.tick+=1,e.elapsedMs+=i;const t=V[e.ship.chassis];e.ship.invulnerableMs=Math.max(0,e.ship.invulnerableMs-i),e.ship.wormholeCooldownMs=Math.max(0,e.ship.wormholeCooldownMs-i),e.ship.supernovaCooldownMs=Math.max(0,e.ship.supernovaCooldownMs-i),e.ship.skimSoundCooldownMs=Math.max(0,e.ship.skimSoundCooldownMs-o),e.ship.isAiming?O(e,"CHRONO_HOURGLASS")||(e.ship.hawkingEnergy=Math.max(0,e.ship.hawkingEnergy-a.AIM_ENERGY_DRAIN_PER_SEC*(o/1e3)),e.ship.hawkingEnergy<=0&&(e.ship.isAiming=!1)):e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+a.PASSIVE_ENERGY_REGEN_PER_SEC*l);for(const n of e.wells)n.pulsePhase+=l*2.4,n.orbitCenterX!==void 0&&n.orbitCenterY!==void 0&&n.orbitRadius!==void 0&&n.orbitAngularSpeed!==void 0&&(n.orbitPhase=(n.orbitPhase??0)+n.orbitAngularSpeed*l,n.x=n.orbitCenterX+Math.cos(n.orbitPhase)*n.orbitRadius,n.y=n.orbitCenterY+Math.sin(n.orbitPhase)*n.orbitRadius);for(const n of e.bumpers)n.hitFlashMs=Math.max(0,n.hitFlashMs-o),n.orbitCenterX!==void 0&&n.orbitCenterY!==void 0&&n.orbitRadius!==void 0&&n.orbitAngularSpeed!==void 0&&(n.orbitPhase=(n.orbitPhase??0)+n.orbitAngularSpeed*l,n.x=n.orbitCenterX+Math.cos(n.orbitPhase)*n.orbitRadius,n.y=n.orbitCenterY+Math.sin(n.orbitPhase)*n.orbitRadius);if(e.worldlineHistory.push({x:e.ship.x,y:e.ship.y,vx:e.ship.vx,vy:e.ship.vy}),e.worldlineHistory.length>a.WORLDLINE_BUFFER_TICKS&&e.worldlineHistory.shift(),e.activeEcho&&e.activeEcho.active){const n=e.activeEcho;if(n.frameIndex<n.frames.length){const m=n.frames[n.frameIndex];n.x=m.x,n.y=m.y,n.vx=m.vx,n.vy=m.vy,n.frameIndex+=1;const y=a.ECHO_DAMAGE_MULT*(O(e,"SCHRODINGER_ECHO")?1.8:1)*(e.ship.chassis==="PHOTON_WISP"?1.25:1);for(const g of e.enemies)Math.hypot(g.x-n.x,g.y-n.y)<=g.radius+n.radius&&g.hitFlashMs<=0&&(g.shielded=!1,g.hp-=Math.round(38*y),g.hitFlashMs=150)}else e.activeEcho=null}const{ax:d,ay:h,nearestWell:p,nearestDist:E}=ie(e.ship.x,e.ship.y,e.wells),u=e.mode==="TRICKSHOT_DOJO"&&e.sectorLaunchesUsed===0;if(u||(e.ship.vx+=d/t.mass*l,e.ship.vy+=h/t.mass*l),e.ship.tetherTargetId){const n=e.wells.find(m=>m.id===e.ship.tetherTargetId)??e.bumpers.find(m=>m.id===e.ship.tetherTargetId);if(n){const m=n.x-e.ship.x,y=n.y-e.ship.y,g=Math.hypot(m,y);if(g>.001){const T=m/g,I=y/g,x=-I,v=T,H=e.ship.vx*x+e.ship.vy*v>=0?1:-1,P=x*H,D=v*H;e.ship.vx+=(T*a.TETHER_CENTRIPETAL_BOOST+P*a.TETHER_TANGENTIAL_ACCEL)*l,e.ship.vy+=(I*a.TETHER_CENTRIPETAL_BOOST+D*a.TETHER_TANGENTIAL_ACCEL)*l;const w=a.TETHER_BEAM_DPS*(O(e,"DYSON_HARMONIC")?1.85:1);for(const M of e.enemies)ee(M.x,M.y,e.ship.x,e.ship.y,n.x,n.y)<=M.radius+8&&(M.shielded=!1,M.hp-=w*l,M.hitFlashMs=Math.max(M.hitFlashMs,90))}}else e.ship.tetherTargetId=null,e.ship.tetherKind=null}e.ship.vx*=Math.pow(a.SPACE_DRAG,s),e.ship.vy*=Math.pow(a.SPACE_DRAG,s);const f=Math.hypot(e.ship.vx,e.ship.vy);if(f>a.SPEED_OF_LIGHT_CAP&&(e.ship.vx=e.ship.vx/f*a.SPEED_OF_LIGHT_CAP,e.ship.vy=e.ship.vy/f*a.SPEED_OF_LIGHT_CAP),e.ship.lorentzGamma=ae(Math.hypot(e.ship.vx,e.ship.vy),e.ship.bounceChain,O(e,"NOETHER_DYNAMO")),e.ship.peakLorentzGamma=Math.max(e.ship.peakLorentzGamma,e.ship.lorentzGamma),u||(e.ship.x+=e.ship.vx*l,e.ship.y+=e.ship.vy*l),p&&!u){if(E<=p.skimRadius&&E>p.coreRadius+e.ship.radius&&(e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+a.SKIM_ENERGY_GAIN_PER_SEC*l),e.score+=Math.round(a.SKIM_SCORE_PER_TICK*e.ship.lorentzGamma),e.ship.skimSoundCooldownMs<=0&&(e.ship.skimSoundCooldownMs=380,e.stats.skimsPerformed+=1,e.events.push({type:"EVENT_HORIZON_SKIM",x:e.ship.x,y:e.ship.y,text:`PHOTON SKIM γ=${e.ship.lorentzGamma.toFixed(1)}x`,color:"#fbbf24"}),O(e,"HAWKING_PRISM")&&e.enemies.length>0)))for(let n=0;n<Math.min(3,e.enemies.length);n++){const m=e.enemies[n%e.enemies.length],y=Math.atan2(m.y-e.ship.y,m.x-e.ship.x);e.projectiles.push({id:`lance-${e.tick}-${n}`,friendly:!0,x:e.ship.x,y:e.ship.y,vx:Math.cos(y)*460,vy:Math.sin(y)*460,radius:6,damage:30,ttlMs:2200,color:"#f472b6"})}if(E<=p.coreRadius+e.ship.radius){if(p.pairedWellId&&e.ship.wormholeCooldownMs<=0){const n=e.wells.find(m=>m.id===p.pairedWellId);if(n){const m=Math.max(320,Math.hypot(e.ship.vx,e.ship.vy))*1.65,y=Math.atan2(e.ship.vy,e.ship.vx);e.ship.x=n.x+Math.cos(y)*(n.coreRadius+e.ship.radius+8),e.ship.y=n.y+Math.sin(y)*(n.coreRadius+e.ship.radius+8),e.ship.vx=Math.cos(y)*Math.min(m,a.SPEED_OF_LIGHT_CAP),e.ship.vy=Math.sin(y)*Math.min(m,a.SPEED_OF_LIGHT_CAP),e.ship.wormholeCooldownMs=650,e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+25),e.stats.wormholeTransits+=1,e.events.push({type:"WORMHOLE_TRANSIT",x:e.ship.x,y:e.ship.y,text:"🌀 WORMHOLE CANNON 1.65x!",color:"#ec4899",magnitude:2.2}),e.log.unshift(`Transited Wormhole into ${n.name} at 1.65x velocity!`)}}else if(e.ship.wormholeCooldownMs<=0){const n=e.ship.x-p.x,m=e.ship.y-p.y,y=Math.hypot(n,m)||1,g=n/y,T=m/y;e.ship.x=p.x+g*(p.coreRadius+e.ship.radius+6),e.ship.y=p.y+T*(p.coreRadius+e.ship.radius+6),e.ship.vx=g*320-T*220,e.ship.vy=T*320+g*220;const I=O(e,"LORENTZ_AEGIS")&&e.ship.lorentzGamma>=2;e.ship.invulnerableMs<=0&&!I&&e.mode!=="TRICKSHOT_DOJO"&&p.kind!=="WHITE_HOLE"&&(e.ship.hull-=1,e.ship.invulnerableMs=1100,e.events.push({type:"SHIP_DAMAGED",x:e.ship.x,y:e.ship.y,text:"HORIZON SHEAR -1 HULL",color:"#ef4444"}))}}}for(const n of e.bumpers){const m=e.ship.x-n.x,y=e.ship.y-n.y,g=Math.hypot(m,y),T=e.ship.radius+n.radius;if(g<T&&g>1e-4){const I=m/g,x=y/g;e.ship.x=n.x+I*(T+1),e.ship.y=n.y+x*(T+1);const v=e.ship.vx*I+e.ship.vy*x;if(v<0){const w=n.restitution*t.bumperElasticityBonus;e.ship.vx=(e.ship.vx-2*v*I)*w,e.ship.vy=(e.ship.vy-2*v*x)*w;const M=Math.hypot(e.ship.vx,e.ship.vy);M<290&&(e.ship.vx=e.ship.vx/(M||1)*290,e.ship.vy=e.ship.vy/(M||1)*290)}n.hitFlashMs=320,n.activatedInChain=!0,e.ship.bounceChain+=1,e.stats.bumperRicochets+=1;const k=a.BUMPER_ENERGY_GAIN+(O(e,"NOETHER_DYNAMO")?10:0);e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+k),n.kind==="CHRONO_CRYSTAL"&&(e.ship.chronoCharges=Math.min(e.ship.maxChronoCharges,e.ship.chronoCharges+1));const H=$(e),P=Math.round(a.BASE_BUMPER_SCORE*e.ship.bounceChain*e.ship.lorentzGamma*H);e.score+=P,e.events.push({type:"BUMPER_RICOCHET",x:n.x,y:n.y,text:`x${e.ship.bounceChain} +${P}`,color:"#38bdf8",noteIndex:n.harmonicNoteIndex+e.ship.bounceChain-1});const D=e.ship.constellationVertices;(D.length===0||D[D.length-1].id!==n.id)&&(D.some(w=>w.id===n.id)||D.push({id:n.id,x:n.x,y:n.y})),O(e,"SUPERNOVA_CORE")&&e.ship.bounceChain%4===0&&de(e,!0),e.ship.constellationVertices.length>=a.MIN_CONSTELLATION_VERTICES&&ye(e)}}const A=a.WALL_MARGIN+e.ship.radius,r=a.ARENA_WIDTH-a.WALL_MARGIN-e.ship.radius,c=a.WALL_MARGIN+e.ship.radius,R=a.ARENA_HEIGHT-a.WALL_MARGIN-e.ship.radius;e.ship.x<A?(e.ship.x=A,e.ship.vx=Math.abs(e.ship.vx)*a.WALL_RESTITUTION):e.ship.x>r&&(e.ship.x=r,e.ship.vx=-Math.abs(e.ship.vx)*a.WALL_RESTITUTION),e.ship.y<c?(e.ship.y=c,e.ship.vy=Math.abs(e.ship.vy)*a.WALL_RESTITUTION):e.ship.y>R&&(e.ship.y=R,e.ship.vy=-Math.abs(e.ship.vy)*a.WALL_RESTITUTION);const S=[];for(const n of e.enemies){if(n.hitFlashMs=Math.max(0,n.hitFlashMs-o),e.mode!=="TRICKSHOT_DOJO"){n.orbitAngle+=l*(n.kind==="ENTROPY_COMET"?1.45:.55);const x=n.kind==="ENTROPY_COMET"?55:22;if(n.vx=n.vx*.94+Math.cos(n.orbitAngle)*x*.06,n.vy=n.vy*.94+Math.sin(n.orbitAngle)*x*.06,n.x=L(n.x+n.vx*l,65,a.ARENA_WIDTH-65),n.y=L(n.y+n.vy*l,65,a.ARENA_HEIGHT-65),n.fireCooldownMs-=i,n.fireCooldownMs<=0&&(n.kind==="PHASE_FRIGATE"||n.kind==="TESSERA_WARDEN"||n.kind==="KARDASHEV_BOSS")){n.fireCooldownMs=n.kind==="KARDASHEV_BOSS"?1550:2800;const v=Math.atan2(e.ship.y-n.y,e.ship.x-n.x);e.projectiles.push({id:`proj-${e.tick}-${n.id}`,friendly:!1,x:n.x,y:n.y,vx:Math.cos(v)*210,vy:Math.sin(v)*210,radius:6,damage:1,ttlMs:3600,color:"#f43f5e"})}}let m=!1;for(const x of e.wells){if(x.kind==="WHITE_HOLE")continue;if(Math.hypot(n.x-x.x,n.y-x.y)<=x.coreRadius+n.radius*.85&&n.kind!=="KARDASHEV_BOSS"){m=!0,e.stats.rocheCrushes+=1;const k=O(e,"ROCHE_CRUSHER")?500:a.ROCHE_CRUSH_SCORE;e.score+=k,(O(e,"ROCHE_CRUSHER")||e.stats.rocheCrushes%2===0)&&(e.ship.hull=Math.min(e.ship.maxHull,e.ship.hull+1)),e.events.push({type:"ROCHE_CRUSH",x:x.x,y:x.y,text:`🌀 ROCHE TIDAL CRUSH! +${k}`,color:"#10b981",magnitude:2}),Y(e,n,"ROCHE");break}}if(m)continue;const y=n.x-e.ship.x,g=n.y-e.ship.y,T=Math.hypot(y,g),I=n.radius+e.ship.radius;if(T<=I){const x=Math.hypot(e.ship.vx,e.ship.vy),v=e.ship.chassis==="STAR_HAMMER"||e.ship.lorentzGamma>=1.45||x>=240||O(e,"TACHYON_RAIL");if(n.shielded&&!v){const k=T>.001?y/T:1,H=T>.001?g/T:0;e.ship.vx=-k*240,e.ship.vy=-H*240}else{n.shielded=!1;const k=Math.round((48+x*.14)*e.ship.lorentzGamma*t.mass);n.hp-=k,n.hitFlashMs=200;const H=T>.001?y/T:1,P=T>.001?g/T:0;n.vx+=H*280,n.vy+=P*280,(!O(e,"TACHYON_RAIL")||n.hp>0)&&(e.ship.x=n.x-H*(I+2),e.ship.y=n.y-P*(I+2),e.ship.vx=-e.ship.vx*.72,e.ship.vy=-e.ship.vy*.72)}}n.hp<=0?Y(e,n,"RAM"):S.push(n)}e.enemies=S;const b=[];for(const n of e.projectiles){if(n.ttlMs-=i,n.ttlMs<=0)continue;if(n.friendly&&e.enemies.length>0){const y=e.enemies[0],g=Math.atan2(y.y-n.y,y.x-n.x);n.vx=n.vx*.88+Math.cos(g)*460*.12,n.vy=n.vy*.88+Math.sin(g)*460*.12}n.x+=n.vx*l,n.y+=n.vy*l;let m=!1;if(n.friendly){for(const y of e.enemies)if(Math.hypot(y.x-n.x,y.y-n.y)<=y.radius+n.radius){y.shielded=!1,y.hp-=n.damage,y.hitFlashMs=160,m=!0;break}}else if(Math.hypot(e.ship.x-n.x,e.ship.y-n.y)<=e.ship.radius+n.radius){m=!0;const y=O(e,"LORENTZ_AEGIS")&&e.ship.lorentzGamma>=2;e.ship.invulnerableMs<=0&&!y&&(e.ship.hull-=n.damage,e.ship.invulnerableMs=1e3,e.events.push({type:"SHIP_DAMAGED",x:e.ship.x,y:e.ship.y,text:"PLASMA HIT -1 HULL",color:"#ef4444"}))}m||b.push(n)}if(e.projectiles=b,e.enemies.some(n=>n.hp<=0)){const n=[];for(const m of e.enemies)m.hp<=0?Y(e,m,"PHOTON_LANCE"):n.push(m);e.enemies=n}const _=O(e,"BINARY_ATTRACTOR")?900:175,N=O(e,"BINARY_ATTRACTOR")?1.5:1,C=[];for(const n of e.starMotes){if(n.ttlMs-=i,n.ttlMs<=0)continue;const m=e.ship.x-n.x,y=e.ship.y-n.y,g=Math.hypot(m,y);if(g<=e.ship.radius+16){const T=Math.round(n.value*N*$(e));e.score+=T,e.ship.hawkingEnergy=Math.min(e.ship.maxHawkingEnergy,e.ship.hawkingEnergy+8),n.kind==="CHRONO_SHARD"&&(e.ship.chronoCharges=Math.min(e.ship.maxChronoCharges,e.ship.chronoCharges+1));continue}g<=_&&g>.001&&(n.vx+=m/g*520*l,n.vy+=y/g*520*l),n.x+=n.vx*l,n.y+=n.vy*l,C.push(n)}if(e.starMotes=C,e.activePolygons=e.activePolygons.map(n=>({...n,ttlMs:n.ttlMs-o})).filter(n=>n.ttlMs>0),e.ship.hull<=0){e.ship.hull=0,e.status="GAME_OVER",e.verdictId=q(e),e.events.push({type:"GAME_OVER",x:e.ship.x,y:e.ship.y,text:"HULL BREACHED · SINGULARITY COLLAPSE",color:"#ef4444"}),e.log.unshift("Hull integrity collapsed under gravitational shear.");return}e.enemies.length===0&&Se(e)}function Q(e){return[{id:"SACRED_GEOMETER_AI",name:"Euclidean Trickshot Geometer",chassis:"VANGUARD",relicPref:"KEPLER_SCYTHE",philosophy:"Prioritizes 3-bumper Constellation Polygon enclosures & AI Coach trickshots.",useTether:!1,useRewind:!1},{id:"HORIZON_DAREDEVIL_AI",name:"Relativistic Tether Daredevil",chassis:"STAR_HAMMER",relicPref:"ROCHE_CRUSHER",philosophy:"Whips on Quantum Tethers ([Q]) & triggers Supernovas ([E]) for Roche Crushes.",useTether:!0,useRewind:!1},{id:"CHRONO_WEAVER_AI",name:"Worldline Paradox Weaver",chassis:"PHOTON_WISP",relicPref:"SCHRODINGER_ECHO",philosophy:"Chains high-elasticity bumper bounces and rewinds spacetime ([R]) for Echo hits.",useTether:!1,useRewind:!0}].map(s=>{const i=B(e,{mode:"ODYSSEY",chassis:s.chassis,startSector:1});i.relics.push(s.relicPref);for(let t=0;t<360&&!(i.status==="VICTORY"||i.status==="GAME_OVER");t++){if(i.status==="RELIC_DRAFT"){const d=i.relicDraftChoices[0]??"NOETHER_DYNAMO";G(i,{type:"SELECT_RELIC",relicId:d})}t%45===0&&G(i,{type:"TRIGGER_AI_COACH"}),s.useTether&&t%30===15&&G(i,{type:"TOGGLE_TETHER"}),s.useTether&&t%60===40&&G(i,{type:"TRIGGER_SUPERNOVA"}),s.useRewind&&t%75===50&&G(i,{type:"TRIGGER_REWIND"}),ne(i,a.FIXED_STEP_MS)}const l=q(i);return{archetypeId:s.id,archetypeName:s.name,philosophy:s.philosophy,finalScore:i.score,polygonsEnclosed:i.stats.polygonsEnclosed,peakLorentzGamma:i.ship.peakLorentzGamma,sectorsCleared:i.sector,verdictTitle:K[l]?.title??l}})}function ce(){return{highScore:0,bestLorentzGamma:1,runsPlayed:0,odysseyVictories:0,dojoCompletions:0,totalPolygonsEnclosed:0,totalEnemiesVaporized:0,relicsUnlocked:[],verdictsUnlocked:[],completedRunKeys:[]}}function pe(e=typeof localStorage<"u"?localStorage:null){const o={version:a.SAVE_VERSION,career:ce(),activeRun:null};if(!e)return o;try{const s=e.getItem(a.SAVE_KEY);if(!s)return o;const i=JSON.parse(s);if(!i||i.version!==a.SAVE_VERSION||!i.career)return o;const l=i.career;return{version:a.SAVE_VERSION,career:{highScore:Number.isFinite(l.highScore)?l.highScore:0,bestLorentzGamma:Number.isFinite(l.bestLorentzGamma)?l.bestLorentzGamma:1,runsPlayed:Number.isFinite(l.runsPlayed)?l.runsPlayed:0,odysseyVictories:Number.isFinite(l.odysseyVictories)?l.odysseyVictories:0,dojoCompletions:Number.isFinite(l.dojoCompletions)?l.dojoCompletions:0,totalPolygonsEnclosed:Number.isFinite(l.totalPolygonsEnclosed)?l.totalPolygonsEnclosed:0,totalEnemiesVaporized:Number.isFinite(l.totalEnemiesVaporized)?l.totalEnemiesVaporized:0,relicsUnlocked:Array.isArray(l.relicsUnlocked)?[...l.relicsUnlocked]:[],verdictsUnlocked:Array.isArray(l.verdictsUnlocked)?[...l.verdictsUnlocked]:[],completedRunKeys:Array.isArray(l.completedRunKeys)?[...l.completedRunKeys]:[]},activeRun:i.activeRun&&typeof i.activeRun.seed=="number"&&i.activeRun.ship&&Array.isArray(i.activeRun.wells)?F(i.activeRun):null}}catch{return o}}function z(e,o,s=typeof localStorage<"u"?localStorage:null){const i={...e,relicsUnlocked:[...e.relicsUnlocked],verdictsUnlocked:[...e.verdictsUnlocked],completedRunKeys:[...e.completedRunKeys]};if(o){i.highScore=Math.max(i.highScore,o.score),i.bestLorentzGamma=Math.max(i.bestLorentzGamma,o.ship.peakLorentzGamma);for(const t of o.relics)i.relicsUnlocked.includes(t)||i.relicsUnlocked.push(t);if(o.status==="VICTORY"||o.status==="GAME_OVER"){const t=`${o.seed}:${o.mode}:${o.tick}:${o.status}`;i.completedRunKeys.includes(t)||(i.completedRunKeys.push(t),i.completedRunKeys.length>60&&i.completedRunKeys.shift(),i.runsPlayed+=1,i.totalPolygonsEnclosed+=o.stats.polygonsEnclosed,i.totalEnemiesVaporized+=o.stats.enemiesVaporized,o.status==="VICTORY"&&(o.mode==="ODYSSEY"&&(i.odysseyVictories+=1),o.mode==="TRICKSHOT_DOJO"&&(i.dojoCompletions+=1)),o.verdictId&&!i.verdictsUnlocked.includes(o.verdictId)&&i.verdictsUnlocked.push(o.verdictId))}}const l={version:a.SAVE_VERSION,career:i,activeRun:o&&o.status!=="VICTORY"&&o.status!=="GAME_OVER"?F(o):null};if(s)try{s.setItem(a.SAVE_KEY,JSON.stringify(l))}catch{}return l}class ue{container;audio;callbacks;debugVisible;canvas;ctx;announcerEl;scoreEl;highScoreEl;sectorEl;gammaEl;hullEl;energyBarEl;energyTextEl;chronoEl;polygonsEl;subtitleEl;hintEl;relicStripEl;logListEl;overlayHostEl;debugPanelEl;labBodyEl;popups=[];shockwaves=[];stars=[];pointerDown=!1;lastModalKey="";keydownHandler;constructor(o,s,i,l=!1){this.container=o,this.audio=s,this.callbacks=i,this.debugVisible=l;for(let t=0;t<70;t++)this.stars.push({x:t*137.5%1*a.ARENA_WIDTH,y:t*293.7%1*a.ARENA_HEIGHT,size:1+t%3*.75,alpha:.25+t%5*.14,speed:4+t%4*3});this.keydownHandler=t=>this.handleKeyDown(t),this.mountDOM(),typeof window<"u"&&window.addEventListener("keydown",this.keydownHandler)}isDebugVisible(){return this.debugVisible}setDebugVisible(o){this.debugVisible=o,this.debugPanelEl&&(this.debugPanelEl.hidden=!o)}resetVisuals(){this.popups=[],this.shockwaves=[],this.lastModalKey="",this.overlayHostEl&&(this.overlayHostEl.innerHTML="",this.overlayHostEl.hidden=!0)}announce(o){this.announcerEl&&(this.announcerEl.textContent=o)}mountDOM(){this.container.innerHTML=`
      <style>
        .eh-root {
          --eh-bg-light: #060913;
          --eh-bg-dark: #050711;
          --eh-bg: var(--eh-bg-dark);
          --eh-surface-light: #0f172a;
          --eh-surface-dark: #0b1120;
          --eh-surface: var(--eh-surface-dark);
          --eh-border: #1e293b;
          --eh-accent: #38bdf8;
          --eh-gold: #fbbf24;
          --eh-violet: #a855f7;
          --eh-emerald: #10b981;
          --eh-rose: #f43f5e;
          --eh-text: #f8fafc;
          --eh-muted: #94a3b8;
          color-scheme: light dark;
          container-type: inline-size;
          container-name: ehstage;
          background: radial-gradient(circle at 50% 15%, #0c1938 0%, var(--eh-bg) 72%);
          color: var(--eh-text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0.85rem;
          border-radius: 0.85rem;
          border: 1px solid #1e3a5f;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
        }

        @supports (color: light-dark(white, black)) {
          .eh-root {
            --eh-bg: light-dark(var(--eh-bg-light), var(--eh-bg-dark));
            --eh-surface: light-dark(var(--eh-surface-light), var(--eh-surface-dark));
          }
        }

        .eh-root :where(button, select, input):focus-visible {
          outline: 3px solid var(--eh-accent);
          outline-offset: 2px;
        }

        .eh-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          margin-block-end: 0.7rem;
          padding-block-end: 0.6rem;
          border-block-end: 1px solid var(--eh-border);
        }

        .eh-title-block h2 {
          margin: 0;
          font-size: clamp(1.1rem, 0.9rem + 1vw, 1.55rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #38bdf8, #fbbf24, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .eh-title-block p {
          margin: 0.15rem 0 0;
          font-size: 0.8rem;
          color: var(--eh-muted);
        }

        .eh-mode-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
        }

        .eh-btn {
          min-block-size: 28px;
          min-inline-size: 28px;
          padding: 0.35rem 0.7rem;
          border-radius: 0.45rem;
          border: 1px solid #334155;
          background: #111c33;
          color: var(--eh-text);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        @media (pointer: coarse) {
          .eh-btn {
            min-block-size: 44px;
            min-inline-size: 44px;
          }
        }

        .eh-btn:hover {
          border-color: var(--eh-accent);
          background: #1e293b;
        }

        .eh-btn-accent {
          background: linear-gradient(135deg, #0284c7, #2563eb);
          border-color: #38bdf8;
          color: #ffffff;
        }

        .eh-btn-gold {
          background: linear-gradient(135deg, #d97706, #b45309);
          border-color: #fbbf24;
          color: #ffffff;
        }

        .eh-hud-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
          margin-block-end: 0.65rem;
        }

        @media (min-width: 720px) {
          .eh-hud-strip {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 680px) {
            .eh-hud-strip {
              grid-template-columns: repeat(6, 1fr);
            }
          }
        }

        .eh-metric {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 0.5rem;
          padding: 0.4rem 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .eh-metric-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--eh-muted);
          font-weight: 700;
        }

        .eh-metric-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.96rem;
          font-weight: 800;
        }

        .eh-energy-track {
          inline-size: 100%;
          block-size: 6px;
          background: #090d16;
          border-radius: 999px;
          overflow: hidden;
          margin-block-start: 2px;
        }

        .eh-energy-fill {
          block-size: 100%;
          background: linear-gradient(90deg, #38bdf8, #a855f7);
          transition: inline-size 0.08s linear;
        }

        /* Main Layout Grid */
        .eh-layout {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 980px) {
          .eh-layout {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 920px) {
            .eh-layout {
              flex-direction: row;
              align-items: flex-start;
            }
          }
        }

        .eh-canvas-col {
          flex: 1 1 auto;
          min-inline-size: 0;
        }

        .eh-canvas-wrap {
          position: relative;
          inline-size: 100%;
          aspect-ratio: 960 / 600;
          background: #03060c;
          border-radius: 0.65rem;
          border: 1px solid #334155;
          overflow: hidden;
          box-shadow: inset 0 0 40px rgba(14, 165, 233, 0.12);
        }

        .eh-canvas {
          display: block;
          inline-size: 100%;
          block-size: 100%;
          touch-action: none;
          cursor: crosshair;
        }

        .eh-overlay-host {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 18, 0.86);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 20;
        }

        .eh-overlay-host[hidden] {
          display: none !important;
        }

        .eh-modal-card {
          max-inline-size: 680px;
          inline-size: 100%;
          background: #0f172a;
          border: 1px solid #38bdf8;
          border-radius: 0.75rem;
          padding: 1.15rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        .eh-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.65rem;
          margin-block-start: 0.75rem;
        }

        .eh-relic-choice {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 0.35rem;
          padding: 0.75rem;
          border-radius: 0.6rem;
          border: 1px solid #334155;
          background: #131c31;
          color: var(--eh-text);
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease;
        }

        .eh-relic-choice:hover {
          transform: translateY(-2px);
          border-color: #38bdf8;
          background: #1e293b;
        }

        .eh-action-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.45rem;
          margin-block-start: 0.55rem;
          padding: 0.5rem 0.65rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #1e293b;
          border-radius: 0.55rem;
        }

        .eh-side-col {
          inline-size: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 920px) {
            .eh-side-col {
              inline-size: 310px;
              flex: 0 0 310px;
            }
          }
        }

        .eh-panel {
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid #1e293b;
          border-radius: 0.6rem;
          padding: 0.7rem;
        }

        .eh-panel h3 {
          margin: 0 0 0.45rem;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #38bdf8;
        }

        .eh-relic-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .eh-relic-pill {
          font-size: 0.74rem;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          background: #1e293b;
          border: 1px solid #38bdf8;
          font-weight: 700;
        }

        .eh-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-block-size: 135px;
          overflow-y: auto;
          font-size: 0.74rem;
          color: var(--eh-muted);
          display: grid;
          gap: 0.25rem;
          scrollbar-width: thin;
          scrollbar-color: #334155 #090d16;
        }
      </style>

      <div class="eh-root">
        <div id="eh-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <header class="eh-header">
          <div class="eh-title-block">
            <h2>🪐⚡ EVENT HORIZON: SINGULARITY SLINGSHOT</h2>
            <p id="eh-sector-subtitle">Relativistic Orbital Billiards, Bullet-Time Gravity Tether &amp; Constellation Relic Deckbuilder</p>
          </div>

          <div class="eh-mode-bar" role="group" aria-label="Game Mode & Hull Selection">
            <button type="button" class="eh-btn eh-btn-accent" data-eh-mode="ODYSSEY">
              🌌 Odyssey (5 Sectors)
            </button>
            <button type="button" class="eh-btn" data-eh-mode="TRICKSHOT_DOJO">
              📐 Trickshot Dojo (5 Puzzles)
            </button>
            <button type="button" class="eh-btn" data-eh-mode="ENDLESS_SINGULARITY">
              ♾️ Endless Singularity
            </button>

            <label for="eh-chassis-select" class="visually-hidden">Ship Chassis</label>
            <select id="eh-chassis-select" class="eh-btn" aria-label="Select Ship Chassis">
              <option value="VANGUARD">🚀 Vanguard Lance (Balanced)</option>
              <option value="PHOTON_WISP">✨ Photon Wisp (High Bounce + Echo)</option>
              <option value="STAR_HAMMER">🔨 Star-Hammer (Heavy Ram + Nova)</option>
            </select>

            <button type="button" class="eh-btn" id="eh-btn-mute">🔊 Audio</button>
            <button type="button" class="eh-btn" id="eh-btn-restart">↻ New Run</button>
          </div>
        </header>

        <div class="eh-hud-strip" role="region" aria-label="Relativistic Flight Telemetry">
          <div class="eh-metric">
            <span class="eh-metric-label">Score / High</span>
            <span class="eh-metric-val"><span id="eh-score">0</span> <small style="color:#64748b">/ <span id="eh-high">0</span></small></span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Sector / Wave</span>
            <span class="eh-metric-val" id="eh-sector" style="color:#38bdf8">Sector 1 / 5</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Lorentz Factor (γ)</span>
            <span class="eh-metric-val" id="eh-gamma" style="color:#fbbf24">1.05x γ</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Ship Hull Integrity</span>
            <span class="eh-metric-val" id="eh-hull" style="color:#10b981">♥♥♥♥♥ (5/5)</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Hawking Energy <span id="eh-energy-text">75/100</span></span>
            <div class="eh-energy-track"><div id="eh-energy-bar" class="eh-energy-fill" style="inline-size:75%"></div></div>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Chrono / Polygons</span>
            <span class="eh-metric-val"><span id="eh-chrono" style="color:#a855f7">⏳×2</span> · <span id="eh-polygons" style="color:#38bdf8">📐 0</span></span>
          </div>
        </div>

        <div class="eh-layout">
          <div class="eh-canvas-col">
            <div class="eh-canvas-wrap">
              <canvas
                id="eh-canvas"
                class="eh-canvas"
                width="${a.ARENA_WIDTH}"
                height="${a.ARENA_HEIGHT}"
                aria-label="Event Horizon Orbital Slingshot Arena"
              ></canvas>
              <div id="eh-overlay-host" class="eh-overlay-host" hidden></div>
            </div>

            <div class="eh-action-bar" role="toolbar" aria-label="Relativistic Ship Abilities">
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button type="button" class="eh-btn eh-btn-gold" id="eh-act-coach">
                  🎯 [C] AI Trickshot Launch
                </button>
                <button type="button" class="eh-btn eh-btn-accent" id="eh-act-launch">
                  🚀 [Space] Slingshot Fire
                </button>
                <button type="button" class="eh-btn" id="eh-act-tether">
                  🔗 [Q] Quantum Tether Whip
                </button>
                <button type="button" class="eh-btn" id="eh-act-nova">
                  💥 [E] Supernova (35W)
                </button>
                <button type="button" class="eh-btn" id="eh-act-rewind">
                  ⏳ [R] Chrono-Rewind + Echo
                </button>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8;">
                <strong>Controls:</strong> Click-Drag on Arena to Bullet-Time Aim &amp; Slingshot · WASD/Arrows Thrust
              </div>
            </div>
          </div>

          <aside class="eh-side-col" aria-label="Mission Briefing, Relics, and Trajectory Lab">
            <div class="eh-panel">
              <h3>🛰️ Tactical Briefing</h3>
              <p id="eh-hint-text" style="margin:0; font-size:0.78rem; color:#cbd5e1; line-height:1.45;"></p>
            </div>

            <div class="eh-panel">
              <h3>👑 Active Astro-Relics</h3>
              <ul id="eh-relic-strip" class="eh-relic-pills" role="list">
                <li style="font-size:0.75rem; color:#64748b;">Clear a sector to draft multiplicative Astro-Relics!</li>
              </ul>
            </div>

            <div class="eh-panel">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-block-end:0.35rem;">
                <h3 style="margin:0;">🔬 Counterfactual Lab</h3>
                <button type="button" class="eh-btn" id="eh-btn-run-lab" style="padding:0.2rem 0.5rem; font-size:0.72rem;">
                  Simulate 3 AI Builds
                </button>
              </div>
              <div id="eh-lab-body" style="font-size:0.74rem; color:#94a3b8;">
                Compare Euclidean Geometer, Tether Daredevil, and Worldline Weaver on this exact seed.
              </div>
            </div>

            <div class="eh-panel">
              <h3>📡 Telemetry Log</h3>
              <ul id="eh-log-list" class="eh-log-list" role="list"></ul>
            </div>

            <div id="eh-debug-panel" class="eh-panel" hidden></div>
          </aside>
        </div>
      </div>
    `,this.canvas=this.container.querySelector("#eh-canvas"),this.ctx=this.canvas.getContext("2d"),this.announcerEl=this.container.querySelector("#eh-announcer"),this.scoreEl=this.container.querySelector("#eh-score"),this.highScoreEl=this.container.querySelector("#eh-high"),this.sectorEl=this.container.querySelector("#eh-sector"),this.gammaEl=this.container.querySelector("#eh-gamma"),this.hullEl=this.container.querySelector("#eh-hull"),this.energyBarEl=this.container.querySelector("#eh-energy-bar"),this.energyTextEl=this.container.querySelector("#eh-energy-text"),this.chronoEl=this.container.querySelector("#eh-chrono"),this.polygonsEl=this.container.querySelector("#eh-polygons"),this.subtitleEl=this.container.querySelector("#eh-sector-subtitle"),this.hintEl=this.container.querySelector("#eh-hint-text"),this.relicStripEl=this.container.querySelector("#eh-relic-strip"),this.logListEl=this.container.querySelector("#eh-log-list"),this.overlayHostEl=this.container.querySelector("#eh-overlay-host"),this.debugPanelEl=this.container.querySelector("#eh-debug-panel"),this.labBodyEl=this.container.querySelector("#eh-lab-body"),this.debugPanelEl.hidden=!this.debugVisible,this.bindEvents()}bindEvents(){const o=(t,d)=>{const h=this.canvas.getBoundingClientRect(),p=a.ARENA_WIDTH/Math.max(1,h.width),E=a.ARENA_HEIGHT/Math.max(1,h.height);return{x:(t-h.left)*p,y:(d-h.top)*E}};this.canvas.addEventListener("pointerdown",t=>{if(t.button===2){t.preventDefault(),this.callbacks.onAction({type:"TOGGLE_TETHER"});return}this.pointerDown=!0;const d=o(t.clientX,t.clientY);this.updateAimFromPoint(d.x,d.y,!0)}),this.canvas.addEventListener("pointermove",t=>{if(!this.pointerDown)return;const d=o(t.clientX,t.clientY);this.updateAimFromPoint(d.x,d.y,!1)});const s=t=>{if(!this.pointerDown)return;this.pointerDown=!1;const d=o(t.clientX,t.clientY),{angleRad:h,powerPct:p}=this.computeAimVector(d.x,d.y);this.callbacks.onAction({type:"LAUNCH_SLINGSHOT",angleRad:h,powerPct:p})};this.canvas.addEventListener("pointerup",s),this.canvas.addEventListener("contextmenu",t=>t.preventDefault());for(const t of this.container.querySelectorAll("button[data-eh-mode]"))t.addEventListener("click",()=>{const d=t.getAttribute("data-eh-mode");this.resetVisuals(),this.callbacks.onAction({type:"SELECT_MODE",mode:d,sectorOrPuzzle:1}),this.announce(`Switched to ${d} mode`)});const i=this.container.querySelector("#eh-chassis-select");i?.addEventListener("change",()=>{const t=i.value;this.callbacks.onAction({type:"SELECT_CHASSIS",chassis:t}),this.announce(`Selected ${t} ship chassis`)}),this.container.querySelector("#eh-act-coach")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_AI_COACH"})),this.container.querySelector("#eh-act-launch")?.addEventListener("click",()=>this.callbacks.onAction({type:"LAUNCH_SLINGSHOT"})),this.container.querySelector("#eh-act-tether")?.addEventListener("click",()=>this.callbacks.onAction({type:"TOGGLE_TETHER"})),this.container.querySelector("#eh-act-nova")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_SUPERNOVA"})),this.container.querySelector("#eh-act-rewind")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_REWIND"}));const l=this.container.querySelector("#eh-btn-mute");l?.addEventListener("click",()=>{const t=this.audio.toggleMute();l.textContent=t?"🔇 Muted":"🔊 Audio"}),this.container.querySelector("#eh-btn-restart")?.addEventListener("click",()=>{this.resetVisuals(),this.callbacks.onRestart()}),this.container.querySelector("#eh-btn-run-lab")?.addEventListener("click",()=>{this.renderCounterfactualLab()})}lastRenderedShipX=190;lastRenderedShipY=300;lastRenderedSeed=a.DEFAULT_SEED;computeAimVector(o,s){const i=o-this.lastRenderedShipX,l=s-this.lastRenderedShipY,t=Math.hypot(i,l),d=Math.atan2(l,i),h=Math.max(.25,Math.min(1,t/240));return{angleRad:d,powerPct:h}}updateAimFromPoint(o,s,i){const{angleRad:l,powerPct:t}=this.computeAimVector(o,s);i?this.callbacks.onAction({type:"BEGIN_AIM",angleRad:l,powerPct:t}):this.callbacks.onAction({type:"UPDATE_AIM",angleRad:l,powerPct:t})}renderCounterfactualLab(){if(!this.labBodyEl)return;const o=Q(this.lastRenderedSeed);this.labBodyEl.innerHTML=o.map(s=>`
        <div style="padding:0.35rem 0; border-bottom:1px solid #1e293b;">
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#f8fafc;">
            <span>${s.archetypeName}</span>
            <span style="color:#fbbf24;">${s.finalScore.toLocaleString()} pts</span>
          </div>
          <div style="font-size:0.7rem; color:#94a3b8;">
            📐 ${s.polygonsEnclosed} Polygons · Peak γ=${s.peakLorentzGamma.toFixed(2)}x · ${s.verdictTitle}
          </div>
        </div>
      `).join("")}handleKeyDown(o){const s=o.target?.tagName;if(s==="INPUT"||s==="SELECT"||s==="TEXTAREA")return;const i=o.key.toLowerCase();i==="q"?(o.preventDefault(),this.callbacks.onAction({type:"TOGGLE_TETHER"})):i==="e"?(o.preventDefault(),this.callbacks.onAction({type:"TRIGGER_SUPERNOVA"})):i==="r"?(o.preventDefault(),this.callbacks.onAction({type:"TRIGGER_REWIND"})):i==="c"?(o.preventDefault(),this.callbacks.onAction({type:"TRIGGER_AI_COACH"})):i===" "?(o.preventDefault(),this.callbacks.onAction({type:"LAUNCH_SLINGSHOT"})):i==="w"||o.key==="ArrowUp"?(o.preventDefault(),this.callbacks.onAction({type:"NUDGE_THRUST",dx:0,dy:-1})):i==="s"||o.key==="ArrowDown"?(o.preventDefault(),this.callbacks.onAction({type:"NUDGE_THRUST",dx:0,dy:1})):i==="a"||o.key==="ArrowLeft"?(o.preventDefault(),this.callbacks.onAction({type:"NUDGE_THRUST",dx:-1,dy:0})):i==="d"||o.key==="ArrowRight"?(o.preventDefault(),this.callbacks.onAction({type:"NUDGE_THRUST",dx:1,dy:0})):i==="p"&&(o.preventDefault(),this.callbacks.onAction({type:"TOGGLE_PAUSE"}))}consumeEvents(o,s){for(const i of s)this.audio.playEvent(i),this.popups.push({x:i.x,y:i.y,vy:-36,text:i.text,color:i.color,alpha:1}),(i.type==="SUPERNOVA_PULSE"||i.type==="CONSTELLATION_ENCLOSED"||i.type==="WORMHOLE_TRANSIT"||i.type==="ROCHE_CRUSH")&&this.shockwaves.push({x:i.x,y:i.y,radius:18,maxRadius:i.type==="SUPERNOVA_PULSE"?i.magnitude??190:145,color:i.color,alpha:.9}),(i.type==="CONSTELLATION_ENCLOSED"||i.type==="SECTOR_CLEARED"||i.type==="VICTORY"||i.type==="GAME_OVER")&&this.announce(i.text)}render(o,s,i){this.lastRenderedShipX=o.ship.x,this.lastRenderedShipY=o.ship.y,this.lastRenderedSeed=o.seed,this.scoreEl.textContent=o.score.toLocaleString(),this.highScoreEl.textContent=Math.max(s.highScore,o.score).toLocaleString(),o.mode==="TRICKSHOT_DOJO"?this.sectorEl.textContent=`Dojo ${o.sector}/${U.length} (Shots: ${o.sectorLaunchesUsed}/${o.parLaunches??1})`:o.mode==="ODYSSEY"?this.sectorEl.textContent=`Sector ${o.sector} / ${a.TOTAL_CAMPAIGN_SECTORS}`:this.sectorEl.textContent=`Wave ${o.sector} (Endless)`,this.gammaEl.textContent=`${o.ship.lorentzGamma.toFixed(2)}x γ`;const l="♥".repeat(Math.max(0,o.ship.hull))+"♡".repeat(Math.max(0,o.ship.maxHull-o.ship.hull));this.hullEl.textContent=`${l} (${o.ship.hull}/${o.ship.maxHull})`;const t=Math.round(o.ship.hawkingEnergy/o.ship.maxHawkingEnergy*100);this.energyBarEl.style.inlineSize=`${t}%`,this.energyTextEl.textContent=`${Math.round(o.ship.hawkingEnergy)}/${o.ship.maxHawkingEnergy}`,this.chronoEl.textContent=`⏳×${o.ship.chronoCharges}`,this.polygonsEl.textContent=`📐 ${o.stats.polygonsEnclosed}`,this.subtitleEl.textContent=`${o.sectorTitle} — ${o.sectorSubtitle}`,this.hintEl.textContent=o.sectorHint,o.relics.length===0?this.relicStripEl.innerHTML='<li style="font-size:0.74rem; color:#64748b;">Clear a sector to draft multiplicative Astro-Relics!</li>':this.relicStripEl.innerHTML=o.relics.map(d=>{const h=W.find(p=>p.id===d);return`<li class="eh-relic-pill" style="border-color:${h?.color??"#38bdf8"}" title="${h?.description??""}">${h?.symbol??"★"} ${h?.name??d}</li>`}).join(""),this.logListEl.innerHTML=o.log.slice(0,8).map(d=>`<li>• ${d}</li>`).join(""),this.debugVisible?(this.debugPanelEl.hidden=!1,this.debugPanelEl.innerHTML=`
        <h3>🔧 Deterministic Debug</h3>
        <div style="font-family:monospace; font-size:0.72rem; display:grid; gap:0.2rem;">
          <div>Seed: ${o.seed} · RNG: 0x${o.rngState.toString(16)}</div>
          <div>Tick: ${o.tick} · Status: ${o.status}</div>
          <div>Ship Pos: (${o.ship.x.toFixed(1)}, ${o.ship.y.toFixed(1)})</div>
          <div>Ship Vel: (${o.ship.vx.toFixed(1)}, ${o.ship.vy.toFixed(1)})</div>
          <div>Bounce Chain: ${o.ship.bounceChain} · Vertices: ${o.ship.constellationVertices.length}</div>
        </div>
      `):this.debugPanelEl.hidden=!0,this.renderOverlayModal(o,s),this.renderCanvas(o,i)}renderOverlayModal(o,s){const i=`${o.status}:${o.sector}:${o.relicDraftChoices.join(",")}`;if(o.status==="PLAYING"){this.overlayHostEl.hidden=!0,this.lastModalKey="";return}if(this.lastModalKey!==i){if(this.lastModalKey=i,this.overlayHostEl.hidden=!1,o.status==="RELIC_DRAFT"){const l=o.relicDraftChoices.map(t=>{const d=W.find(h=>h.id===t);return`
            <button type="button" class="eh-relic-choice" data-draft-relic="${d.id}">
              <span style="font-size:1.4rem;">${d.symbol} <strong style="font-size:0.95rem; color:${d.color};">${d.name}</strong></span>
              <span style="font-size:0.76rem; font-weight:700; color:#e2e8f0;">${d.shortHook}</span>
              <span style="font-size:0.72rem; color:#94a3b8;">${d.description}</span>
            </button>
          `}).join("");this.overlayHostEl.innerHTML=`
        <div class="eh-modal-card" role="dialog" aria-label="Draft an Astro-Relic">
          <h3 style="margin:0 0 0.25rem; font-size:1.25rem; color:#38bdf8;">
            🌟 SECTOR ${o.sector} CLEARED — DRAFT AN ASTRO-RELIC
          </h3>
          <p style="margin:0; font-size:0.84rem; color:#cbd5e1;">
            Choose 1 synergistic Constellation Relic before warping to Sector ${o.sector+1}:
          </p>
          <div class="eh-relic-grid">${l}</div>
        </div>
      `;for(const t of this.overlayHostEl.querySelectorAll("button[data-draft-relic]"))t.addEventListener("click",()=>{const d=t.getAttribute("data-draft-relic");this.callbacks.onAction({type:"SELECT_RELIC",relicId:d})});return}if(o.status==="VICTORY"||o.status==="GAME_OVER"){const l=K[o.verdictId??"KARDASHEV_SOVEREIGN"]??K.KARDASHEV_SOVEREIGN,t=Q(o.seed);this.overlayHostEl.innerHTML=`
        <div class="eh-modal-card" role="dialog" aria-label="Run Summary and Verdict">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
            <span style="font-size:0.76rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px; background:#1e293b; color:#fbbf24;">
              ${l.badge}
            </span>
            <span style="font-family:monospace; font-size:0.78rem; color:#94a3b8;">SEED: ${o.seed}</span>
          </div>
          <h3 style="margin:0.4rem 0 0.2rem; font-size:1.35rem; color:${o.status==="VICTORY"?"#10b981":"#f43f5e"};">
            ${o.status==="VICTORY"?"🏆 COSMIC ODYSSEY CONQUERED:":"🌑 EVENT HORIZON COLLAPSE:"} ${l.title}
          </h3>
          <p style="margin:0 0 0.75rem; font-size:0.84rem; color:#cbd5e1;">${l.summary}</p>

          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.45rem; margin-block-end:0.85rem; background:#090d16; padding:0.6rem; border-radius:0.5rem;">
            <div><div class="eh-metric-label">Final Score</div><div class="eh-metric-val" style="color:#fbbf24;">${o.score.toLocaleString()}</div></div>
            <div><div class="eh-metric-label">Peak Lorentz γ</div><div class="eh-metric-val" style="color:#38bdf8;">${o.ship.peakLorentzGamma.toFixed(2)}x</div></div>
            <div><div class="eh-metric-label">Polygons Enclosed</div><div class="eh-metric-val" style="color:#10b981;">📐 ${o.stats.polygonsEnclosed}</div></div>
            <div><div class="eh-metric-label">Career Victories</div><div class="eh-metric-val" style="color:#a855f7;">${s.odysseyVictories+s.dojoCompletions}</div></div>
          </div>

          <div style="margin-block-end:0.85rem;">
            <div style="font-size:0.75rem; font-weight:700; color:#38bdf8; margin-block-end:0.35rem;">
              🔬 SAME-SEED COUNTERFACTUAL ARCHETYPE COMPARISON:
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.45rem;">
              ${t.map(d=>`
                  <div style="background:#131c31; border:1px solid #334155; border-radius:0.45rem; padding:0.5rem; font-size:0.72rem;">
                    <div style="font-weight:800; color:#f8fafc;">${d.archetypeName}</div>
                    <div style="color:#fbbf24; font-weight:700;">${d.finalScore.toLocaleString()} pts</div>
                    <div style="color:#94a3b8;">📐 ${d.polygonsEnclosed} · γ=${d.peakLorentzGamma.toFixed(1)}x</div>
                  </div>
                `).join("")}
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            <button type="button" class="eh-btn eh-btn-accent" id="eh-modal-restart">
              ▶ Launch New Seed Run
            </button>
            <button type="button" class="eh-btn" id="eh-modal-replay-seed">
              ↻ Replay Exact Same Seed (${o.seed})
            </button>
          </div>
        </div>
      `,this.overlayHostEl.querySelector("#eh-modal-restart")?.addEventListener("click",()=>{this.resetVisuals(),this.callbacks.onRestart()}),this.overlayHostEl.querySelector("#eh-modal-replay-seed")?.addEventListener("click",()=>{this.resetVisuals(),this.callbacks.onRestart(o.seed)})}}}renderCanvas(o,s){const i=this.ctx;if(!i)return;const l=a.ARENA_WIDTH,t=a.ARENA_HEIGHT,d=s/1e3;i.fillStyle=o.ship.isAiming?"#040b1d":"#03060f",i.fillRect(0,0,l,t),i.save(),i.strokeStyle=o.ship.isAiming?"rgba(56, 189, 248, 0.16)":"rgba(51, 65, 85, 0.22)",i.lineWidth=1;const h=48;for(let r=h;r<l;r+=h){i.beginPath();for(let c=0;c<=t;c+=24){let R=r,S=c;for(const b of o.wells){const _=b.x-r,N=b.y-c,C=Math.hypot(_,N);if(C<220&&C>8){const n=(b.mass>0?1:-1)*18*(1-C/220);R+=_/C*n,S+=N/C*n}}c===0?i.moveTo(R,S):i.lineTo(R,S)}i.stroke()}for(let r=h;r<t;r+=h){i.beginPath();for(let c=0;c<=l;c+=24){let R=c,S=r;for(const b of o.wells){const _=b.x-c,N=b.y-r,C=Math.hypot(_,N);if(C<220&&C>8){const n=(b.mass>0?1:-1)*18*(1-C/220);R+=_/C*n,S+=N/C*n}}c===0?i.moveTo(R,S):i.lineTo(R,S)}i.stroke()}i.restore();for(const r of this.stars)r.x=(r.x-r.speed*d+l)%l,i.fillStyle=`rgba(226, 232, 240, ${r.alpha})`,i.beginPath(),i.arc(r.x,r.y,r.size,0,Math.PI*2),i.fill();i.save(),i.strokeStyle="rgba(56, 189, 248, 0.35)",i.lineWidth=2,i.strokeRect(a.WALL_MARGIN,a.WALL_MARGIN,l-a.WALL_MARGIN*2,t-a.WALL_MARGIN*2),i.restore();for(const r of o.wells)if(r.pairedWellId&&r.kind==="BLACK_HOLE"){const c=o.wells.find(R=>R.id===r.pairedWellId);c&&(i.save(),i.strokeStyle="rgba(236, 72, 153, 0.38)",i.lineWidth=3,i.setLineDash([8,8]),i.beginPath(),i.moveTo(r.x,r.y),i.lineTo(c.x,c.y),i.stroke(),i.restore())}for(const r of o.wells){i.save();const c=i.createRadialGradient(r.x,r.y,r.coreRadius,r.x,r.y,r.skimRadius);r.kind==="WHITE_HOLE"?(c.addColorStop(0,"rgba(244, 114, 182, 0.55)"),c.addColorStop(.6,"rgba(56, 189, 248, 0.18)"),c.addColorStop(1,"rgba(56, 189, 248, 0)")):r.kind==="NEUTRON_STAR"?(c.addColorStop(0,"rgba(168, 85, 247, 0.55)"),c.addColorStop(.6,"rgba(56, 189, 248, 0.18)"),c.addColorStop(1,"rgba(56, 189, 248, 0)")):(c.addColorStop(0,"rgba(251, 191, 36, 0.5)"),c.addColorStop(.65,"rgba(249, 115, 22, 0.16)"),c.addColorStop(1,"rgba(249, 115, 22, 0)")),i.fillStyle=c,i.beginPath(),i.arc(r.x,r.y,r.skimRadius,0,Math.PI*2),i.fill(),i.strokeStyle=r.kind==="WHITE_HOLE"?"rgba(244, 114, 182, 0.55)":"rgba(251, 191, 36, 0.48)",i.lineWidth=1.5,i.setLineDash([5,5]),i.beginPath(),i.arc(r.x,r.y,r.skimRadius,0,Math.PI*2),i.stroke(),i.setLineDash([]),i.fillStyle=r.kind==="WHITE_HOLE"?"#fdf4ff":"#020617",i.strokeStyle=r.kind==="WHITE_HOLE"?"#f472b6":r.kind==="NEUTRON_STAR"?"#a855f7":"#fbbf24",i.lineWidth=3,i.beginPath(),i.arc(r.x,r.y,r.coreRadius,0,Math.PI*2),i.fill(),i.stroke(),i.fillStyle="#e2e8f0",i.font="bold 10px Inter, sans-serif",i.textAlign="center",i.fillText(r.name,r.x,r.y+r.skimRadius+13),i.restore()}for(const r of o.activePolygons){const c=Math.max(0,r.ttlMs/r.maxTtlMs);i.save(),i.fillStyle=`rgba(56, 189, 248, ${.28*c})`,i.strokeStyle=`rgba(186, 230, 253, ${.95*c})`,i.lineWidth=3.5,i.beginPath(),r.vertices.forEach((R,S)=>{S===0?i.moveTo(R.x,R.y):i.lineTo(R.x,R.y)}),i.closePath(),i.fill(),i.stroke(),i.restore()}if(o.ship.constellationVertices.length>0&&(i.save(),i.strokeStyle="rgba(56, 189, 248, 0.85)",i.lineWidth=2.5,i.beginPath(),o.ship.constellationVertices.forEach((r,c)=>{c===0?i.moveTo(r.x,r.y):i.lineTo(r.x,r.y)}),i.lineTo(o.ship.x,o.ship.y),i.stroke(),i.restore()),o.ship.isAiming||o.mode==="TRICKSHOT_DOJO"&&o.sectorLaunchesUsed===0){const r=oe(o,o.ship.aimAngleRad,o.ship.aimPowerPct);i.save(),i.strokeStyle="rgba(56, 189, 248, 0.78)",i.lineWidth=2.2,i.setLineDash([6,5]),i.beginPath(),r.forEach((c,R)=>{R===0?i.moveTo(c.x,c.y):i.lineTo(c.x,c.y)}),i.stroke(),i.setLineDash([]);for(const c of r)c.hitBumperId&&(i.fillStyle="#fbbf24",i.beginPath(),i.arc(c.x,c.y,5,0,Math.PI*2),i.fill());i.restore()}for(const r of o.bumpers){i.save();const c=r.kind==="OVERCHARGE_ANVIL"?"#f59e0b":r.kind==="CHRONO_CRYSTAL"?"#a855f7":r.kind==="REPULSOR_COIL"?"#ec4899":"#38bdf8",R=r.hitFlashMs>0?r.radius+4:r.radius;i.fillStyle=r.activatedInChain?c:"#0f172a",i.strokeStyle=r.hitFlashMs>0?"#ffffff":c,i.lineWidth=r.activatedInChain?3.5:2.5,i.beginPath(),i.arc(r.x,r.y,R,0,Math.PI*2),i.fill(),i.stroke(),i.fillStyle=r.activatedInChain?"#020617":"#e2e8f0",i.font="bold 11px Inter, sans-serif",i.textAlign="center",i.textBaseline="middle";const S=r.kind==="OVERCHARGE_ANVIL"?"⚡":r.kind==="CHRONO_CRYSTAL"?"⏳":r.kind==="REPULSOR_COIL"?"◎":"◇";i.fillText(S,r.x,r.y),i.restore()}for(const r of o.starMotes)i.save(),i.fillStyle=r.kind==="CHRONO_SHARD"?"#a855f7":"#fbbf24",i.beginPath(),i.arc(r.x,r.y,5.5,0,Math.PI*2),i.fill(),i.restore();for(const r of o.enemies){i.save();const c=r.kind==="KARDASHEV_BOSS",R=c?"#f43f5e":r.kind==="TESSERA_WARDEN"?"#a855f7":r.kind==="PHASE_FRIGATE"?"#f97316":"#ef4444";if(r.shielded&&(i.strokeStyle="rgba(56, 189, 248, 0.8)",i.lineWidth=2.5,i.beginPath(),i.arc(r.x,r.y,r.radius+5,0,Math.PI*2),i.stroke()),i.fillStyle=r.hitFlashMs>0?"#ffffff":R,i.strokeStyle="#fecdd3",i.lineWidth=2,i.beginPath(),i.arc(r.x,r.y,r.radius,0,Math.PI*2),i.fill(),i.stroke(),r.maxHp>50){const S=r.radius*1.8,b=Math.max(0,r.hp/r.maxHp);i.fillStyle="#090d16",i.fillRect(r.x-S/2,r.y-r.radius-10,S,5),i.fillStyle=c?"#fbbf24":"#ef4444",i.fillRect(r.x-S/2,r.y-r.radius-10,S*b,5)}i.restore()}for(const r of o.projectiles)i.save(),i.fillStyle=r.color,i.beginPath(),i.arc(r.x,r.y,r.radius,0,Math.PI*2),i.fill(),i.restore();if(o.worldlineHistory.length>2&&(i.save(),i.strokeStyle="rgba(56, 189, 248, 0.28)",i.lineWidth=2,i.beginPath(),o.worldlineHistory.forEach((r,c)=>{c===0?i.moveTo(r.x,r.y):i.lineTo(r.x,r.y)}),i.stroke(),i.restore()),o.activeEcho&&o.activeEcho.active&&(i.save(),i.strokeStyle="#a855f7",i.fillStyle="rgba(168, 85, 247, 0.45)",i.lineWidth=2.5,i.beginPath(),i.arc(o.activeEcho.x,o.activeEcho.y,o.activeEcho.radius,0,Math.PI*2),i.fill(),i.stroke(),i.restore()),o.ship.tetherTargetId){const r=o.wells.find(c=>c.id===o.ship.tetherTargetId)??o.bumpers.find(c=>c.id===o.ship.tetherTargetId);r&&(i.save(),i.strokeStyle="#fbbf24",i.lineWidth=3,i.beginPath(),i.moveTo(o.ship.x,o.ship.y),i.lineTo(r.x,r.y),i.stroke(),i.restore())}const E=V[o.ship.chassis],u=o.ship.isAiming?o.ship.aimAngleRad:Math.atan2(o.ship.vy,o.ship.vx);i.save(),i.translate(o.ship.x,o.ship.y),i.rotate(u),o.ship.lorentzGamma>=1.8&&(i.strokeStyle=o.ship.lorentzGamma>=2.5?"#fbbf24":"#38bdf8",i.lineWidth=2,i.beginPath(),i.arc(0,0,o.ship.radius+5,0,Math.PI*2),i.stroke()),i.fillStyle=E.color,i.strokeStyle="#ffffff",i.lineWidth=2,i.beginPath(),i.moveTo(o.ship.radius+4,0),i.lineTo(-o.ship.radius,-o.ship.radius*.82),i.lineTo(-o.ship.radius*.55,0),i.lineTo(-o.ship.radius,o.ship.radius*.82),i.closePath(),i.fill(),i.stroke(),i.restore();const f=[];for(const r of this.shockwaves)r.radius+=340*d,r.alpha-=1.45*d,r.alpha>0&&r.radius<=r.maxRadius&&(i.save(),i.strokeStyle=r.color,i.globalAlpha=Math.max(0,r.alpha),i.lineWidth=3,i.beginPath(),i.arc(r.x,r.y,r.radius,0,Math.PI*2),i.stroke(),i.restore(),f.push(r));this.shockwaves=f;const A=[];for(const r of this.popups)r.y+=r.vy*d,r.alpha-=.85*d,r.alpha>0&&(i.save(),i.globalAlpha=Math.max(0,r.alpha),i.font="bold 12px Inter, sans-serif",i.fillStyle=r.color,i.textAlign="center",i.fillText(r.text,r.x,r.y),i.restore(),A.push(r));this.popups=A}destroy(){typeof window<"u"&&window.removeEventListener("keydown",this.keydownHandler),this.container.innerHTML=""}}const Ee={id:a.GAME_ID,number:a.GAME_NUMBER,title:a.TITLE,subtitle:a.SUBTITLE,genre:"Kinetic Gravity-Pinball Action Roguelite & Trickshot Puzzle Sandbox",primaryReference:"Outer Wilds (Orbital Gravity) · Peggle / Pinball · Balatro",supportingReference:"Superhot (Bullet-Time Aim) · Geometry Wars · Katana ZERO",oneSentenceLoop:"Dilate time to aim a relativistic orbital trajectory around a live Singularity, slingshot your Star-Breaker ship across musical Prism Bumpers to enclose laser Constellation Polygons that vaporize Void Armadas, rewind your own spacetime worldline to spawn a twin Phantom Echo, and draft multiplicative Astro-Relics across 5 cosmic sectors!",shortGoal:"Conquer all 5 Cosmic Sectors and shatter KARDASHEV-IX in Odyssey Mode, or solve all 5 Constellation Trickshot Dojo puzzles within the 1-Launch Par.",longGoal:"Unlock all 12 Synergistic Astro-Relics, master all 3 Ship Hulls, sustain Lorentz γ ≥ 6.0x, and compare your trajectory against the 3 Counterfactual AI Archetypes.",controlsSummary:"Click-Drag: Bullet-Time Aim & Slingshot · [Space]: Launch · [C]: AI Trickshot Coach · [Q]: Quantum Tether · [E]: Supernova · [R]: Chrono-Rewind + Echo · WASD/Arrows: Thrust",accentColor:a.ACCENT_COLOR};function me(e,o){const s=pe();let i={...s.career,relicsUnlocked:[...s.career.relicsUnlocked],verdictsUnlocked:[...s.career.verdictsUnlocked],completedRunKeys:[...s.career.completedRunKeys]};const l=o?.initialSeed??a.DEFAULT_SEED;let t=o?.initialSeed===void 0&&s.activeRun&&s.activeRun.status!=="VICTORY"&&s.activeRun.status!=="GAME_OVER"?F(s.activeRun):B(l);const d=new se,h=S=>{G(t,S),t.events.length>0&&(u.consumeEvents(t,t.events),t.events=[]),i=z(i,t).career,u.render(t,i,a.FIXED_STEP_MS)},p=S=>{const b=typeof S=="number"?S:t.seed+104729>>>0;t=B(b,{mode:t.mode,chassis:t.ship.chassis,startSector:1}),u.resetVisuals(),i=z(i,t).career,u.render(t,i,a.FIXED_STEP_MS)},E=S=>{const b=typeof S=="boolean"?S:!u.isDebugVisible();u.setDebugVisible(b)},u=new ue(e,d,{onAction:h,onRestart:p,onToggleDebug:()=>E()},!!o?.debug);let f=0,A=performance.now(),r=0,c=!1;const R=S=>{if(c)return;const b=Math.min(100,Math.max(0,S-A));A=S,r+=b;const _=t.status,N=t.sector;for(;r>=a.FIXED_STEP_MS;)ne(t,a.FIXED_STEP_MS),t.events.length>0&&(u.consumeEvents(t,t.events),t.events=[]),r-=a.FIXED_STEP_MS;(t.status!==_||t.sector!==N||t.score>i.highScore)&&(i=z(i,t).career),u.render(t,i,b||a.FIXED_STEP_MS),f=window.requestAnimationFrame(R)};return u.render(t,i,a.FIXED_STEP_MS),f=window.requestAnimationFrame(R),{destroy(){c=!0,window.cancelAnimationFrame(f),z(i,t),d.destroy(),u.destroy()},getStateSnapshot(){return F(t)},restartWithSeed(S){p(S)},toggleDebug(S){E(S),u.render(t,i,a.FIXED_STEP_MS)}}}const fe={metadata:Ee,mountGame:me},Re=Object.freeze(Object.defineProperty({__proto__:null,ASTRO_RELIC_CATALOG:W,HORIZON_CONFIG:a,HORIZON_VERDICTS:K,HorizonAudioEngine:se,HorizonUIController:ue,ODYSSEY_SECTORS:Z,SHIP_CHASSIS_CATALOG:V,SeededRng:j,TRICKSHOT_PUZZLES:U,applyHorizonInput:G,clamp:L,cloneHorizonState:F,computeGravitationalAcceleration:ie,computeLorentzGamma:ae,computeOptimalLaunchVector:he,computePolygonAreaShoelace:te,computeRelicScoreMultiplier:$,createDefaultHorizonCareer:ce,createInitialHorizonState:B,default:fe,determineHorizonVerdict:q,hasRelic:O,isPointInPolygon:le,loadHorizonSave:pe,loadSectorOrPuzzle:X,metadata:Ee,mountGame:me,pointToSegmentDistance:ee,predictShipTrajectory:oe,runHorizonCounterfactuals:Q,saveHorizonState:z,stepHorizonState:ne},Symbol.toStringTag,{value:"Module"}));export{Ee as a,Re as g,me as m};
