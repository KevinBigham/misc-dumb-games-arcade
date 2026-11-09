import{_ as re}from"./preload-helper-Ct5FWWRu.js";const ee=[293.66,329.63,349.23,440,493.88,523.25,587.33,659.25,698.46,880,987.77,1174.66];class ie{ctx=null;muted=!1;comboStep=0;ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const r=window.AudioContext||window.webkitAudioContext;if(r)try{this.ctx=new r}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}isMuted(){return this.muted}setMuted(r){this.muted=r}toggleMute(){return this.muted=!this.muted,this.muted}playEvent(r,t=1){const e=this.ensureContext();if(!e)return;const n=e.currentTime,a=Math.min(ee.length-1,Math.max(0,t-1)),d=ee[a]??440;try{switch(r.type){case"BUMPER_RICOCHET":{this.playTone(e,d,"triangle",.16,.14,n,d*1.25),this.playTone(e,d*1.5,"sine",.22,.08,n+.03);break}case"DASH_SLAM":case"DOMINO_COLLISION":case"WALL_SLAM":{this.playTone(e,135,"sawtooth",.14,.16,n,52),this.playTone(e,d*.75,"triangle",.12,.1,n);break}case"PARRY_DEFLECT":{this.playTone(e,660,"sine",.18,.15,n,1320),this.playTone(e,990,"triangle",.24,.11,n+.04,1480);break}case"ECHO_SPAWNED":{this.playTone(e,320,"sine",.28,.14,n,760),this.playTone(e,480,"triangle",.3,.1,n+.06,960);break}case"ENEMY_SHATTERED":{this.playTone(e,d,"sawtooth",.2,.14,n,d*1.5),this.playTone(e,95,"triangle",.22,.18,n,42);break}case"OVERDRIVE_TRIGGERED":case"SECTOR_CLEARED":case"RELIC_CLAIMED":{[293.66,440,587.33,880].forEach((p,E)=>{this.playTone(e,p,"triangle",.36,.11,n+E*.05,p*1.05)});break}case"PLAYER_DAMAGED":{this.playTone(e,160,"sawtooth",.24,.18,n,65);break}case"VICTORY":{[293.66,369.99,440,587.33,880].forEach((p,E)=>{this.playTone(e,p,"triangle",.45,.13,n+E*.08)});break}case"GAME_OVER":{[293.66,261.63,220,146.83].forEach((p,E)=>{this.playTone(e,p,"sawtooth",.35,.12,n+E*.1)});break}}}catch{}}playTone(r,t,e,n,a,d,u){const p=r.createOscillator(),E=r.createGain();p.type=e,p.frequency.setValueAtTime(t,d),u&&p.frequency.exponentialRampToValueAtTime(Math.max(20,u),d+n),E.gain.setValueAtTime(1e-4,d),E.gain.linearRampToValueAtTime(a,d+.015),E.gain.exponentialRampToValueAtTime(1e-4,d+n),p.connect(E),E.connect(r.destination),p.start(d),p.stop(d+n+.02)}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const l={GAME_ID:"12-chrono-vortex",GAME_NUMBER:12,TITLE:"Chrono-Vortex: The God-Forge Arena",SUBTITLE:"Time-Looping Kinetic Pinball-Brawler & Bullet-Alchemist Roguelite",ACCENT_COLOR:"#f59e0b",DEFAULT_SEED:20261108,SAVE_KEY:"argon_game12_chrono_vortex_v1",SAVE_VERSION:1,FIXED_STEP_MS:1e3/60,ARENA_WIDTH:960,ARENA_HEIGHT:600,ARENA_CENTER_X:480,ARENA_CENTER_Y:300,ARENA_RADIUS:272,PLAYER_BASE_RADIUS:18,PLAYER_BASE_SPEED:310,PLAYER_FRICTION:.88,PLAYER_BOUNCE_RESTITUTION:1.15,DASH_SPEED:780,DASH_DURATION_MS:180,DASH_COOLDOWN_MS:750,DASH_STAMINA_COST:30,PARRY_RADIUS:68,PARRY_DURATION_MS:240,PARRY_COOLDOWN_MS:900,ECHO_RECORD_INTERVAL_MS:50,ECHO_MAX_SAMPLES:80,ECHO_DURATION_MS:4e3,ECHO_COOLDOWN_MS:2800,ECHO_MAX_ACTIVE:3,OVERDRIVE_MAX:100,OVERDRIVE_DURATION_MS:5e3,COMBO_DECAY_MS:3600,MAX_SECTORS:5},U=[{id:"vanguard-g",name:"VANGUARD-G",title:'The "Big G" Kinetic Titan',tagline:"Heavy pinball juggernaut built for catastrophic wall-slams and multi-bank ricochets.",color:"#f59e0b",secondaryColor:"#fde047",maxHp:130,speedMultiplier:1,knockbackMultiplier:1.35,parryRadiusMultiplier:1,echoDurationMultiplier:1,signaturePassive:"Titan Impact: +35% Ricochet Knockback & Dash triggers a 95px seismic shockwave."},{id:"phantom-x",name:"PHANTOM-X",title:"Chrono-Ghost Assassin",tagline:"Hyper-agile temporal drifter that weaves up to 3 long-lasting Echo Clones simultaneously.",color:"#38bdf8",secondaryColor:"#a855f7",maxHp:100,speedMultiplier:1.18,knockbackMultiplier:1.05,parryRadiusMultiplier:1.05,echoDurationMultiplier:1.45,signaturePassive:"Time Weaver: +45% Echo Ghost lifespan & -25% Echo Cooldown."},{id:"prism-9",name:"PRISM-9",title:"Arcane Bullet Alchemist",tagline:"Transmutes enemy bullet-hell barrages into homing prism storms and elemental novas.",color:"#ec4899",secondaryColor:"#2dd4bf",maxHp:110,speedMultiplier:1.08,knockbackMultiplier:1.1,parryRadiusMultiplier:1.35,echoDurationMultiplier:1.15,signaturePassive:"Prism Refraction: +35% Parry Aura radius & Parries spawn +1 extra homing shard."}],K={"gear-hound":{id:"gear-hound",name:"Gear-Hound Automaton",role:"Kinetic Rusher (Pinball Ammo)",baseHp:42,radius:15,speed:145,mass:.8,contactDamage:10,scoreValue:120,color:"#fb923c",outlineColor:"#fed7aa",fireCooldownMs:0,projectileSpeed:0,description:"Lightweight clockwork drone. Slam it into heavier foes like a high-speed pinball!"},"prism-sniper":{id:"prism-sniper",name:"Prism-Lens Marksman",role:"Ranged Volley Artillery",baseHp:56,radius:16,speed:95,mass:1,contactDamage:12,scoreValue:180,color:"#e879f9",outlineColor:"#fae8ff",fireCooldownMs:2100,projectileSpeed:255,description:"Orbits the perimeter firing plasma orbs. Use Pulse Parry [Q/Right-Click] to reflect its shots!"},"void-juggernaut":{id:"void-juggernaut",name:"Obsidian Anvil-Golem",role:"Heavy Bruiser (Weak to Wall/Bumper Slams)",baseHp:135,radius:24,speed:68,mass:1.9,contactDamage:18,scoreValue:320,color:"#818cf8",outlineColor:"#e0e7ff",fireCooldownMs:2900,projectileSpeed:210,description:"Massive armor plating shrugs off light hits, but takes 2.5x shatter damage from Bumper & Wall impacts!"},"arc-weaver":{id:"arc-weaver",name:"Tesla-Coil Weaver",role:"Tri-Shot Disruptor",baseHp:72,radius:17,speed:112,mass:1.1,contactDamage:14,scoreValue:240,color:"#2dd4bf",outlineColor:"#ccfbf1",fireCooldownMs:2300,projectileSpeed:240,description:"Fires 3-way shock spreads. Discharges chain lightning to nearby enemies when slammed."},"chrono-warden":{id:"chrono-warden",name:"Paradox Aegis Warden",role:"Directional Shield Elite",baseHp:110,radius:20,speed:88,mass:1.4,contactDamage:16,scoreValue:380,color:"#38bdf8",outlineColor:"#bae6fd",fireCooldownMs:1950,projectileSpeed:265,description:"Projects a frontal temporal barrier. Flank it with a Chrono-Ghost Echo or bank-shot off a bumper!"},"kronos-omega":{id:"kronos-omega",name:"KRONOS-OMEGA, ARCHITECT OF ETERNITY",role:"3-Phase God-Forge Apex Boss",baseHp:950,radius:36,speed:78,mass:2.8,contactDamage:24,scoreValue:5e3,color:"#f43f5e",outlineColor:"#fde047",fireCooldownMs:1350,projectileSpeed:275,description:"Sovereign of the Chrono-Vortex. Shifts between Spiral Barrages, Gravity Wells, and Temporal Clones."}},z=[{sector:1,name:"Sector I: The Clockwork Crucible",subtitle:"Ignition of the Pinball Anvil",lore:"Bank your Striker and enemy drones into the 4 Elemental Resonance Bumpers to ignite exponential Chain Multipliers.",themeColor:"#f59e0b",accentColor:"#38bdf8",targetKills:10,isBossSector:!1,gravityWellStrength:0,bumpers:[{xOffset:-115,yOffset:-95,radius:28,element:"SOLAR",label:"Solar Anvil"},{xOffset:115,yOffset:-95,radius:28,element:"ARC",label:"Arc Coil"},{xOffset:-115,yOffset:95,radius:28,element:"CRYO",label:"Cryo Prism"},{xOffset:115,yOffset:95,radius:28,element:"SOLAR",label:"Solar Anvil"}],enemyWeights:[{type:"gear-hound",weight:55},{type:"prism-sniper",weight:35},{type:"void-juggernaut",weight:10}]},{sector:2,name:"Sector II: Astral Prism Vault",subtitle:"Bullet Alchemy & Refraction Geometry",lore:"Prism-Snipers and Arc-Weavers flood the arena. Trigger Pulse Parry [Q / Right-Click] to transmute enemy fire into Homing Shards!",themeColor:"#ec4899",accentColor:"#2dd4bf",targetKills:13,isBossSector:!1,gravityWellStrength:0,bumpers:[{xOffset:0,yOffset:-130,radius:30,element:"ARC",label:"Zenith Tesla"},{xOffset:-135,yOffset:0,radius:28,element:"CRYO",label:"West Cryo-Lens"},{xOffset:135,yOffset:0,radius:28,element:"SOLAR",label:"East Solar-Lens"},{xOffset:0,yOffset:130,radius:30,element:"VOID",label:"Nadir Void-Core"}],enemyWeights:[{type:"gear-hound",weight:30},{type:"prism-sniper",weight:35},{type:"arc-weaver",weight:25},{type:"void-juggernaut",weight:10}]},{sector:3,name:"Sector III: Singularity Foundry",subtitle:"Orbital Slingshots & Heavy Collisions",lore:"A central Void Singularity curves trajectories. Slingshot Obsidian Juggernauts into the bumpers for 2.5x Shatter Crits!",themeColor:"#8b5cf6",accentColor:"#f43f5e",targetKills:15,isBossSector:!1,gravityWellStrength:42,bumpers:[{xOffset:0,yOffset:0,radius:34,element:"VOID",label:"Singularity Core"},{xOffset:-140,yOffset:-85,radius:26,element:"SOLAR",label:"Solar Bumper"},{xOffset:140,yOffset:-85,radius:26,element:"ARC",label:"Arc Bumper"},{xOffset:-140,yOffset:85,radius:26,element:"CRYO",label:"Cryo Bumper"},{xOffset:140,yOffset:85,radius:26,element:"SOLAR",label:"Solar Bumper"}],enemyWeights:[{type:"gear-hound",weight:25},{type:"void-juggernaut",weight:30},{type:"arc-weaver",weight:25},{type:"chrono-warden",weight:20}]},{sector:4,name:"Sector IV: The Paradox Loom",subtitle:"Crossfire of the Temporal Ghosts",lore:"Paradox Wardens deflect frontal attacks. Spawn Chrono-Ghost Echoes [E] to execute 4-way temporal pincer combos!",themeColor:"#06b6d4",accentColor:"#fbbf24",targetKills:18,isBossSector:!1,gravityWellStrength:25,bumpers:[{xOffset:-85,yOffset:0,radius:30,element:"VOID",label:"Alpha Loom"},{xOffset:85,yOffset:0,radius:30,element:"VOID",label:"Omega Loom"},{xOffset:0,yOffset:-135,radius:26,element:"ARC",label:"North Conduit"},{xOffset:0,yOffset:135,radius:26,element:"SOLAR",label:"South Conduit"}],enemyWeights:[{type:"chrono-warden",weight:35},{type:"arc-weaver",weight:25},{type:"prism-sniper",weight:20},{type:"void-juggernaut",weight:20}]},{sector:5,name:"Sector V: Throne of Kronos-Omega",subtitle:"Final Reckoning in the God-Forge",lore:"Shatter Kronos-Omega across 3 cosmic phases! Parry his Supernova Rings, ricochet his Clockwork Hounds into his core, and unleash Overdrive!",themeColor:"#f43f5e",accentColor:"#fde047",targetKills:1,isBossSector:!0,gravityWellStrength:30,bumpers:[{xOffset:-130,yOffset:-100,radius:28,element:"SOLAR",label:"Solar Star-Anvil"},{xOffset:130,yOffset:-100,radius:28,element:"ARC",label:"Arc Star-Anvil"},{xOffset:-130,yOffset:100,radius:28,element:"CRYO",label:"Cryo Star-Anvil"},{xOffset:130,yOffset:100,radius:28,element:"VOID",label:"Void Star-Anvil"}],enemyWeights:[{type:"gear-hound",weight:50},{type:"prism-sniper",weight:30},{type:"chrono-warden",weight:20}]}],w=[{id:"celestial-bumper-spurs",name:"Celestial Bumper Spurs",school:"KINETIC",rarity:"RARE",icon:"⚡",color:"#f59e0b",description:"Bumper collisions grant +45% velocity and deal +55% bonus Elemental Nova damage."},{id:"newtonian-guillotine",name:"Newtonian Guillotine",school:"KINETIC",rarity:"EPIC",icon:"☄️",color:"#fb923c",description:"Enemy-into-Enemy and Wall-Slam impacts deal +65% damage and restore 8 Stamina."},{id:"pinball-overdrive-core",name:"Pinball Overdrive Core",school:"KINETIC",rarity:"MYTHIC",icon:"🔥",color:"#ef4444",description:"Every 3rd bounce in a single Dash fires a ring of 6 homing Forge Bolts."},{id:"mobius-tape-spool",name:"Möbius Tape Spool",school:"CHRONO",rarity:"RARE",icon:"⏳",color:"#38bdf8",description:"Chrono-Ghost Echoes last +2.0 seconds longer and deal +40% ramming damage."},{id:"paradox-rewind-anchor",name:"Paradox Rewind Anchor",school:"CHRONO",rarity:"EPIC",icon:"⏪",color:"#a855f7",description:"Spawning a Chrono-Ghost heals 12 HP and triggers a Free Pulse Parry at both positions."},{id:"trinity-timeline-loom",name:"Trinity Timeline Loom",school:"CHRONO",rarity:"MYTHIC",icon:"🌀",color:"#818cf8",description:"Echo cooldown reduced by 35%. Active Chrono-Ghosts fire homing bolts every 1.2s."},{id:"philosophers-ricochet",name:"Philosopher's Ricochet",school:"ALCHEMY",rarity:"RARE",icon:"💎",color:"#ec4899",description:"Parried enemy projectiles deal +75% damage and pierce through 1 additional target."},{id:"supernova-crucible",name:"Supernova Crucible",school:"ALCHEMY",rarity:"EPIC",icon:"☀️",color:"#f43f5e",description:"Solar & Arc Bumpers ignite enemies for 3s; ignited foes explode on death."},{id:"absolute-zero-lens",name:"Absolute Zero Lens",school:"ALCHEMY",rarity:"RARE",icon:"❄️",color:"#06b6d4",description:"Cryo & Void Bumpers slow enemies by 50% and make them take +40% Shatter Damage."},{id:"vampiric-gyroscope",name:"Vampiric Gyroscope",school:"AEGIS",rarity:"EPIC",icon:"🩸",color:"#10b981",description:"Eliminating an enemy while at 4x+ Combo Chain restores 5 HP and +12 Overdrive."},{id:"mirror-aegis-capacitor",name:"Mirror Aegis Capacitor",school:"AEGIS",rarity:"RARE",icon:"🛡️",color:"#2dd4bf",description:"Pulse Parry radius increased by +35% and successful parries reset Dash cooldown."},{id:"god-forge-crown",name:"Crown of the GOAT Architect",school:"AEGIS",rarity:"MYTHIC",icon:"👑",color:"#fde047",description:"+35 Max HP, +20% All Damage, and Overdrive unleashes continuous Lightning Storms."}];function te(o){const r=(Math.abs(Math.floor(o))||20261108)>>>0;return{seed:r,state:r===0?1831565813:r,calls:0}}function ae(o){o.calls+=1;let r=o.state+=1831565813;return r=Math.imul(r^r>>>15,r|1),r^=r+Math.imul(r^r>>>7,r|61),o.state=r>>>0,((r^r>>>14)>>>0)/4294967296}function N(o,r,t){return r+ae(o)*(t-r)}function Z(o,r,t){return Math.floor(N(o,r,t+1))}function ue(o,r){const t=Z(o,0,Math.max(0,r.length-1));return r[t]}function P(o){return U.find(r=>r.id===o)??U[0]}function D(o){const r=Math.max(0,Math.min(z.length-1,o-1));return z[r]}function x(o,r){return o.relicIds.includes(r)}function S(o,r,t,e,n,a,d=1){o.events.push({type:r,x:t,y:e,text:n,color:a,intensity:d})}function ne(o){return D(o).bumpers.map((t,e)=>({id:e+1,x:l.ARENA_CENTER_X+t.xOffset,y:l.ARENA_CENTER_Y+t.yOffset,radius:t.radius,element:t.element,label:t.label,pulseTimerMs:0,hitCount:0}))}function Q(o=l.DEFAULT_SEED,r="vanguard-g"){const t=te(o),e=P(r),n=D(1),a={seed:t.seed,rng:t,status:"PLAYING",sector:1,sectorKills:0,sectorTargetKills:n.targetKills,totalKills:0,score:0,elapsedMs:0,comboCount:0,comboMultiplier:1,comboTimerMs:0,bestComboChain:0,hitStopMs:0,nextEntityId:100,player:{chassisId:e.id,x:l.ARENA_CENTER_X,y:l.ARENA_CENTER_Y+125,vx:0,vy:0,radius:l.PLAYER_BASE_RADIUS,aimAngle:-Math.PI/2,moveDirX:0,moveDirY:0,hp:e.maxHp,maxHp:e.maxHp,stamina:100,maxStamina:100,dashTimerMs:0,dashCooldownMs:0,parryTimerMs:0,parryCooldownMs:0,echoCooldownMs:0,invulnTimerMs:0,overdriveMeter:25,overdriveTimerMs:0,bouncesThisDash:0,baseDamageMultiplier:1},echoHistory:[],echoRecordTimerMs:0,ghosts:[],bumpers:ne(1),enemies:[],projectiles:[],relicIds:[],draftOptions:[],spawnTimerMs:400,overdriveBoltTimerMs:0,ledger:{kineticSlamDamage:0,bumperNovaDamage:0,parryAlchemyDamage:0,chronoEchoDamage:0,totalBankShots:0,totalParries:0,totalEchoesSpawned:0,totalWallSlams:0,lastDamageBy:"None"},events:[]};for(let d=0;d<24;d++){const u=d/24*Math.PI*2;a.echoHistory.push({x:l.ARENA_CENTER_X+Math.cos(u)*65,y:l.ARENA_CENTER_Y+Math.sin(u)*65,vx:-Math.sin(u)*260,vy:Math.cos(u)*260,aimAngle:u+Math.PI/2,isDashing:d%6===0,isParrying:d%10===0})}return C(a,"gear-hound",l.ARENA_CENTER_X-90,l.ARENA_CENTER_Y-110),C(a,"gear-hound",l.ARENA_CENTER_X+90,l.ARENA_CENTER_Y-110),C(a,"prism-sniper",l.ARENA_CENTER_X,l.ARENA_CENTER_Y-165),a}function G(o){return structuredClone(o)}function C(o,r,t,e){const n=D(o.sector);let a=r??"gear-hound";if(!r){const h=n.enemyWeights.reduce((y,s)=>y+s.weight,0);let f=N(o.rng,0,h);for(const y of n.enemyWeights)if(f-=y.weight,f<=0){a=y.type;break}}const d=K[a];let u=t,p=e;if(u===void 0||p===void 0){const h=N(o.rng,0,Math.PI*2),f=N(o.rng,145,l.ARENA_RADIUS-36);u=l.ARENA_CENTER_X+Math.cos(h)*f,p=l.ARENA_CENTER_Y+Math.sin(h)*f;const y=u-o.player.x,s=p-o.player.y;Math.hypot(y,s)<95&&(u=l.ARENA_CENTER_X-Math.cos(h)*f,p=l.ARENA_CENTER_Y-Math.sin(h)*f)}const E=1+(o.sector-1)*.14,m=Math.round(d.baseHp*E),i={id:o.nextEntityId++,type:a,x:u,y:p,vx:0,vy:0,radius:d.radius,hp:m,maxHp:m,mass:d.mass,facingAngle:Math.atan2(o.player.y-p,o.player.x-u),fireTimerMs:d.fireCooldownMs>0?N(o.rng,700,d.fireCooldownMs):0,knockbackTimerMs:0,burnTimerMs:0,chillTimerMs:0,flashTimerMs:0,bossPhase:1,summonTimerMs:4200};return o.enemies.push(i),i}function H(o,r,t,e){o.comboCount+=r,o.comboTimerMs=l.COMBO_DECAY_MS,o.comboCount>o.bestComboChain&&(o.bestComboChain=o.comboCount),o.comboCount>=18?o.comboMultiplier=16:o.comboCount>=11?o.comboMultiplier=8:o.comboCount>=6?o.comboMultiplier=4:o.comboCount>=2?o.comboMultiplier=2:o.comboMultiplier=1,o.player.overdriveMeter=Math.min(l.OVERDRIVE_MAX,o.player.overdriveMeter+r*4.5),o.player.overdriveMeter>=l.OVERDRIVE_MAX&&o.player.overdriveTimerMs<=0&&se(o,t,e)}function se(o,r,t){o.player.overdriveMeter=0,o.player.overdriveTimerMs=l.OVERDRIVE_DURATION_MS,o.player.stamina=o.player.maxStamina,S(o,"OVERDRIVE_TRIGGERED",r,t,"⚡ GOD-FORGE OVERDRIVE UNLEASHED! ⚡","#fde047",2)}function F(o,r,t,e,n,a){const d=x(o,"philosophers-ricochet")?2:1,u=a==="PARRY"&&x(o,"philosophers-ricochet")?1.75:1,p=440;o.projectiles.push({id:o.nextEntityId++,x:r,y:t,vx:Math.cos(e)*p,vy:Math.sin(e)*p,radius:7,damage:Math.round(n*u*o.player.baseDamageMultiplier),isAllied:!0,isHoming:!0,pierceLeft:d,color:a==="PARRY"?"#2dd4bf":a==="ECHO"?"#38bdf8":"#fde047",ttlMs:2600,sourceName:a})}function k(o,r,t,e,n){if(r.hp<=0)return;let a=o.player.baseDamageMultiplier*(1+(o.comboMultiplier-1)*.18);o.player.overdriveTimerMs>0&&(a*=1.35),x(o,"god-forge-crown")&&(a*=1.2),r.chillTimerMs>0&&x(o,"absolute-zero-lens")&&(a*=1.4);const d=Math.max(1,Math.round(t*a));if(r.hp-=d,r.flashTimerMs=130,e==="KINETIC"?o.ledger.kineticSlamDamage+=d:e==="BUMPER"?o.ledger.bumperNovaDamage+=d:e==="PARRY"?o.ledger.parryAlchemyDamage+=d:e==="ECHO"&&(o.ledger.chronoEchoDamage+=d),n&&S(o,e==="BUMPER"?"BUMPER_RICOCHET":"DASH_SLAM",r.x,r.y-r.radius,`${n} -${d}`,e==="BUMPER"?"#fde047":e==="PARRY"?"#2dd4bf":e==="ECHO"?"#38bdf8":"#fb923c",1.1),r.type==="kronos-omega"&&r.hp>0){const u=r.hp/r.maxHp;u<=.66&&r.bossPhase===1?(r.bossPhase=2,S(o,"BOSS_PHASE_SHIFT",r.x,r.y,"⚠️ KRONOS PHASE II: SINGULARITY OVERCLOCK!","#f43f5e",2),C(o,"gear-hound"),C(o,"prism-sniper")):u<=.33&&r.bossPhase===2&&(r.bossPhase=3,S(o,"BOSS_PHASE_SHIFT",r.x,r.y,"🔥 KRONOS PHASE III: ETERNITY SUPERNOVA!","#fde047",2.4),C(o,"gear-hound"),C(o,"chrono-warden"))}r.hp<=0&&fe(o,r)}function fe(o,r){const t=K[r.type],e=t.scoreValue*o.comboMultiplier;if(o.score+=e,o.totalKills+=1,r.type==="kronos-omega"?o.sectorKills=o.sectorTargetKills:D(o.sector).isBossSector||(o.sectorKills+=1),o.hitStopMs=Math.max(o.hitStopMs,r.type==="kronos-omega"?140:32),S(o,"ENEMY_SHATTERED",r.x,r.y,`💥 ${t.name.split(" ")[0]} SHATTERED! +${e}`,t.outlineColor,r.type==="kronos-omega"?2.5:1.35),x(o,"vampiric-gyroscope")&&o.comboMultiplier>=4&&(o.player.hp=Math.min(o.player.maxHp,o.player.hp+5),o.player.overdriveMeter=Math.min(l.OVERDRIVE_MAX,o.player.overdriveMeter+12)),r.burnTimerMs>0&&x(o,"supernova-crucible"))for(const n of o.enemies)n.id!==r.id&&n.hp>0&&Math.hypot(n.x-r.x,n.y-r.y)<=115&&k(o,n,28,"BUMPER","IGNITE NOVA");if(r.type==="arc-weaver")for(const n of o.enemies)n.id!==r.id&&n.hp>0&&Math.hypot(n.x-r.x,n.y-r.y)<=125&&k(o,n,22,"KINETIC","ARC DISCHARGE")}function j(o,r,t){r.pulseTimerMs=340,r.hitCount+=1,o.ledger.totalBankShots+=1,o.player.stamina=Math.min(o.player.maxStamina,o.player.stamina+16),H(o,1,r.x,r.y);const e=x(o,"celestial-bumper-spurs")?138:108,n=(t==="ENEMY"?28:20)*(x(o,"celestial-bumper-spurs")?1.55:1),a={SOLAR:"#f59e0b",CRYO:"#06b6d4",ARC:"#2dd4bf",VOID:"#a855f7"};S(o,"BUMPER_RICOCHET",r.x,r.y,`${r.element} BANK ${o.comboMultiplier}x!`,a[r.element],1.25);for(const d of o.enemies){if(d.hp<=0)continue;if(Math.hypot(d.x-r.x,d.y-r.y)<=e+d.radius){if(r.element==="SOLAR")d.burnTimerMs=3e3;else if(r.element==="CRYO")d.chillTimerMs=3500;else if(r.element==="VOID"){const p=Math.atan2(r.y-d.y,r.x-d.x);d.vx+=Math.cos(p)*190,d.vy+=Math.sin(p)*190}else r.element==="ARC"&&(d.knockbackTimerMs=Math.max(d.knockbackTimerMs,260));k(o,d,n,"BUMPER",`${r.element} PULSE`)}}}function L(o,r,t,e=!1){const n=P(o.player.chassisId),a=x(o,"mirror-aegis-capacitor")?1.35:1,d=l.PARRY_RADIUS*n.parryRadiusMultiplier*a;let u=0;for(const p of o.projectiles){if(p.isAllied)continue;if(Math.hypot(p.x-r,p.y-t)<=d+p.radius){p.isAllied=!0,p.isHoming=!0,p.color="#2dd4bf",p.ttlMs=2800,p.pierceLeft=x(o,"philosophers-ricochet")?2:1;const m=x(o,"philosophers-ricochet")?1.75:1.25;if(p.damage=Math.round(p.damage*2.4*m*o.player.baseDamageMultiplier),p.vx=-p.vx*1.45,p.vy=-p.vy*1.45,u+=1,o.player.chassisId==="prism-9"){const i=Math.atan2(p.vy,p.vx);F(o,p.x,p.y,i+.35,24,"PARRY")}}}for(const p of o.enemies){if(p.hp<=0)continue;const E=p.x-r,m=p.y-t,i=Math.hypot(E,m);if(i>0&&i<=d+p.radius){const h=E/i,f=m/i;p.vx+=h*(260/p.mass),p.vy+=f*(260/p.mass),p.knockbackTimerMs=Math.max(p.knockbackTimerMs,350)}}return u>0?(o.ledger.totalParries+=u,H(o,u,r,t),$(o,u),x(o,"mirror-aegis-capacitor")&&(o.player.dashCooldownMs=0,o.player.stamina=Math.min(o.player.maxStamina,o.player.stamina+25)),S(o,"PARRY_DEFLECT",r,t,`🛡️ ALCHEMY PARRY x${u}!`,"#2dd4bf",1.5)):e||S(o,"PARRY_DEFLECT",r,t,"PULSE AEGIS","#38bdf8",.8),u}function $(o,r){o.score+=r*95*o.comboMultiplier}function le(o,r){if(r.type==="TOGGLE_PAUSE"){o.status==="PLAYING"?o.status="PAUSED":o.status==="PAUSED"&&(o.status="PLAYING");return}if(r.type==="SWITCH_CHASSIS"){const e=P(r.chassisId);o.player.chassisId=e.id;const n=o.player.hp/Math.max(1,o.player.maxHp);o.player.maxHp=e.maxHp+(x(o,"god-forge-crown")?35:0),o.player.hp=Math.max(1,Math.round(o.player.maxHp*n));return}if(o.status==="RELIC_DRAFT"){if(r.type==="SELECT_RELIC"){const e=o.draftOptions.find(n=>n===r.relicId)??o.draftOptions[0];if(e&&!o.relicIds.includes(e)){o.relicIds.push(e);const n=w.find(a=>a.id===e);e==="god-forge-crown"&&(o.player.maxHp+=35,o.player.hp=Math.min(o.player.maxHp,o.player.hp+35)),S(o,"RELIC_CLAIMED",o.player.x,o.player.y,`✨ RELIC FORGED: ${n?.name??e}!`,n?.color??"#fde047",1.6)}oe(o)}else r.type==="SACRIFICE_RELIC_FOR_UPGRADE"&&(o.player.maxHp+=25,o.player.hp=Math.min(o.player.maxHp,o.player.hp+40),o.player.baseDamageMultiplier=Number((o.player.baseDamageMultiplier+.15).toFixed(2)),S(o,"RELIC_CLAIMED",o.player.x,o.player.y,"🔨 ANVIL SMELT: +25 MAX HP & +15% BASE POWER!","#f59e0b",1.6),oe(o));return}if(o.status!=="PLAYING")return;const{player:t}=o;switch(r.type){case"SET_MOVE":{const e=Math.hypot(r.dx,r.dy);e>.001?(t.moveDirX=r.dx/e,t.moveDirY=r.dy/e):(t.moveDirX=0,t.moveDirY=0);break}case"SET_AIM":{const e=r.worldX-t.x,n=r.worldY-t.y;Math.hypot(e,n)>2&&(t.aimAngle=Math.atan2(n,e));break}case"DASH_STRIKE":{if(t.dashCooldownMs>0||t.stamina<l.DASH_STAMINA_COST)return;if(typeof r.targetX=="number"&&typeof r.targetY=="number"){const a=r.targetX-t.x,d=r.targetY-t.y;Math.hypot(a,d)>2&&(t.aimAngle=Math.atan2(d,a))}else Math.hypot(t.moveDirX,t.moveDirY)>.1&&(t.aimAngle=Math.atan2(t.moveDirY,t.moveDirX));t.stamina=Math.max(0,t.stamina-l.DASH_STAMINA_COST),t.dashTimerMs=l.DASH_DURATION_MS,t.dashCooldownMs=l.DASH_COOLDOWN_MS,t.invulnTimerMs=Math.max(t.invulnTimerMs,200),t.bouncesThisDash=0;const e=P(t.chassisId),n=l.DASH_SPEED*e.speedMultiplier;if(t.vx=Math.cos(t.aimAngle)*n,t.vy=Math.sin(t.aimAngle)*n,t.chassisId==="vanguard-g")for(const a of o.enemies){if(a.hp<=0)continue;if(Math.hypot(a.x-t.x,a.y-t.y)<=95+a.radius){const u=Math.atan2(a.y-t.y,a.x-t.x);a.vx+=Math.cos(u)*280,a.vy+=Math.sin(u)*280,a.knockbackTimerMs=Math.max(a.knockbackTimerMs,350),k(o,a,18,"KINETIC","TITAN TREMOR")}}S(o,"DASH_SLAM",t.x,t.y,"KINETIC DASH!",e.color,1);break}case"PULSE_PARRY":{if(t.parryCooldownMs>0)return;t.parryTimerMs=l.PARRY_DURATION_MS,t.parryCooldownMs=l.PARRY_COOLDOWN_MS;const e=L(o,t.x,t.y,!1);e>0&&$(o,e);break}case"SPAWN_ECHO":{if(t.echoCooldownMs>0||o.echoHistory.length===0)return;const e=P(t.chassisId),n=(t.chassisId==="phantom-x"?.75:1)*(x(o,"trinity-timeline-loom")?.65:1);t.echoCooldownMs=Math.round(l.ECHO_COOLDOWN_MS*n);const a=x(o,"mobius-tape-spool")?2e3:0,d=Math.round(l.ECHO_DURATION_MS*e.echoDurationMultiplier)+a,u=o.echoHistory.map(m=>({...m})),p=u[0];o.ghosts.length>=l.ECHO_MAX_ACTIVE&&o.ghosts.shift();const E={id:o.nextEntityId++,x:p.x,y:p.y,vx:p.vx,vy:p.vy,aimAngle:p.aimAngle,isDashing:!0,isParrying:p.isParrying,samples:u,sampleIndex:0,sampleAccumulatorMs:0,remainingMs:d,maxDurationMs:d,boltCooldownMs:600};if(o.ghosts.push(E),o.ledger.totalEchoesSpawned+=1,r.rewindPlayer&&u.length>2){const m=u[0];t.x=m.x,t.y=m.y,t.vx=m.vx,t.vy=m.vy,t.invulnTimerMs=Math.max(t.invulnTimerMs,350)}if(x(o,"paradox-rewind-anchor")){t.hp=Math.min(t.maxHp,t.hp+12);const m=L(o,t.x,t.y,!0),i=L(o,E.x,E.y,!0);m+i>0&&$(o,m+i)}S(o,"ECHO_SPAWNED",E.x,E.y,r.rewindPlayer?"⏪ TIMELINE REWIND & FORK!":"⏳ CHRONO-GHOST DEPLOYED!","#38bdf8",1.4);break}case"ACTIVATE_OVERDRIVE":{t.overdriveMeter>=50&&t.overdriveTimerMs<=0&&se(o,t.x,t.y);break}}}function oe(o){o.sector+=1,o.sectorKills=0;const r=D(o.sector);o.sectorTargetKills=r.targetKills,o.status="PLAYING",o.enemies=[],o.projectiles=[],o.bumpers=ne(o.sector),o.player.x=l.ARENA_CENTER_X,o.player.y=l.ARENA_CENTER_Y+135,o.player.vx=0,o.player.vy=0,o.player.hp=Math.min(o.player.maxHp,o.player.hp+20),o.player.stamina=o.player.maxStamina,r.isBossSector?(C(o,"kronos-omega",l.ARENA_CENTER_X,l.ARENA_CENTER_Y-110),C(o,"gear-hound",l.ARENA_CENTER_X-110,l.ARENA_CENTER_Y-40),C(o,"gear-hound",l.ARENA_CENTER_X+110,l.ARENA_CENTER_Y-40)):(C(o),C(o),C(o))}function ye(o){if(o.sector>=l.MAX_SECTORS){o.status="VICTORY",o.score+=2500+o.player.hp*20,S(o,"VICTORY",o.player.x,o.player.y,"👑 KRONOS-OMEGA SHATTERED! ETERNITY CONQUERED!","#fde047",3);return}o.status="RELIC_DRAFT";const r=w.filter(n=>!o.relicIds.includes(n.id)),t=r.length>=3?[...r]:[...w],e=[];for(;e.length<3&&t.length>0;){const n=Z(o.rng,0,t.length-1);e.push(t[n].id),t.splice(n,1)}o.draftOptions=e,S(o,"SECTOR_CLEARED",o.player.x,o.player.y,`🏆 SECTOR ${o.sector} CLEARED! CHOOSE A GOD-FORGE RELIC!`,"#fde047",2)}function q(o){const{player:r}=o;if((r.dashTimerMs>0||Math.hypot(r.vx,r.vy)>250)&&(r.bouncesThisDash+=1,r.dashTimerMs=Math.min(240,r.dashTimerMs+95),x(o,"pinball-overdrive-core")&&r.bouncesThisDash%3===0))for(let t=0;t<6;t++){const e=t/6*Math.PI*2;F(o,r.x,r.y,e,22,"KINETIC")}}function ce(o,r){if(o.status!=="PLAYING")return;if(o.hitStopMs>0){o.hitStopMs=Math.max(0,o.hitStopMs-r);return}const t=r/1e3;o.elapsedMs+=r;const{player:e}=o,n=P(e.chassisId),a=D(o.sector);e.dashTimerMs=Math.max(0,e.dashTimerMs-r),e.dashCooldownMs=Math.max(0,e.dashCooldownMs-r),e.parryTimerMs=Math.max(0,e.parryTimerMs-r),e.parryCooldownMs=Math.max(0,e.parryCooldownMs-r),e.echoCooldownMs=Math.max(0,e.echoCooldownMs-r),e.invulnTimerMs=Math.max(0,e.invulnTimerMs-r);const d=e.overdriveTimerMs>0?55:26;if(e.stamina=Math.min(e.maxStamina,e.stamina+d*t),e.overdriveTimerMs>0&&(e.overdriveTimerMs=Math.max(0,e.overdriveTimerMs-r),o.overdriveBoltTimerMs-=r,o.overdriveBoltTimerMs<=0&&(o.overdriveBoltTimerMs=x(o,"god-forge-crown")?320:520,F(o,e.x,e.y,e.aimAngle,26,"KINETIC"))),o.comboTimerMs>0&&(o.comboTimerMs=Math.max(0,o.comboTimerMs-r),o.comboTimerMs===0&&(o.comboCount=0,o.comboMultiplier=1)),o.echoRecordTimerMs+=r,o.echoRecordTimerMs>=l.ECHO_RECORD_INTERVAL_MS&&(o.echoRecordTimerMs=0,o.echoHistory.push({x:e.x,y:e.y,vx:e.vx,vy:e.vy,aimAngle:e.aimAngle,isDashing:e.dashTimerMs>0,isParrying:e.parryTimerMs>0}),o.echoHistory.length>l.ECHO_MAX_SAMPLES&&o.echoHistory.shift()),e.dashTimerMs<=0){const m=l.PLAYER_BASE_SPEED*n.speedMultiplier*(e.overdriveTimerMs>0?1.22:1),i=1850*t;if(Math.hypot(e.moveDirX,e.moveDirY)>.05){e.vx+=e.moveDirX*i,e.vy+=e.moveDirY*i;const h=Math.hypot(e.vx,e.vy);h>m&&(e.vx=e.vx/h*m,e.vy=e.vy/h*m)}else e.vx*=Math.pow(l.PLAYER_FRICTION,r/16.67),e.vy*=Math.pow(l.PLAYER_FRICTION,r/16.67)}if(a.gravityWellStrength>0){const m=l.ARENA_CENTER_X-e.x,i=l.ARENA_CENTER_Y-e.y,h=Math.max(45,Math.hypot(m,i));e.vx+=m/h*a.gravityWellStrength*t,e.vy+=i/h*a.gravityWellStrength*t}e.x+=e.vx*t,e.y+=e.vy*t;const u=Math.hypot(e.x-l.ARENA_CENTER_X,e.y-l.ARENA_CENTER_Y),p=l.ARENA_RADIUS-e.radius;if(u>p){const m=(e.x-l.ARENA_CENTER_X)/u,i=(e.y-l.ARENA_CENTER_Y)/u;e.x=l.ARENA_CENTER_X+m*p,e.y=l.ARENA_CENTER_Y+i*p;const h=e.vx*m+e.vy*i;h>0&&(e.vx=(e.vx-2*h*m)*l.PLAYER_BOUNCE_RESTITUTION,e.vy=(e.vy-2*h*i)*l.PLAYER_BOUNCE_RESTITUTION,q(o))}for(const m of o.bumpers){m.pulseTimerMs>0&&(m.pulseTimerMs=Math.max(0,m.pulseTimerMs-r));const i=e.x-m.x,h=e.y-m.y,f=Math.hypot(i,h),y=e.radius+m.radius;if(f<y&&f>.001){const s=i/f,c=h/f;e.x=m.x+s*(y+2),e.y=m.y+c*(y+2);const g=x(o,"celestial-bumper-spurs")?1.45:1,b=Math.max(540,Math.hypot(e.vx,e.vy)*1.25)*g;e.vx=s*b,e.vy=c*b,e.dashTimerMs=Math.max(e.dashTimerMs,150),e.invulnTimerMs=Math.max(e.invulnTimerMs,180),q(o),j(o,m,"PLAYER")}}for(let m=o.ghosts.length-1;m>=0;m--){const i=o.ghosts[m];if(i.remainingMs-=r,i.remainingMs<=0){o.ghosts.splice(m,1);continue}if(i.sampleAccumulatorMs+=r,i.sampleAccumulatorMs>=l.ECHO_RECORD_INTERVAL_MS&&i.samples.length>0){i.sampleAccumulatorMs=0,i.sampleIndex=(i.sampleIndex+1)%i.samples.length;const h=i.samples[i.sampleIndex];i.x=h.x,i.y=h.y,i.vx=h.vx,i.vy=h.vy,i.aimAngle=h.aimAngle,i.isDashing=h.isDashing,i.isParrying=h.isParrying}else i.x+=i.vx*t*.5,i.y+=i.vy*t*.5;if(x(o,"trinity-timeline-loom")&&(i.boltCooldownMs-=r,i.boltCooldownMs<=0&&(i.boltCooldownMs=1150,F(o,i.x,i.y,i.aimAngle,20,"ECHO"))),i.isParrying){const h=L(o,i.x,i.y,!0);h>0&&$(o,h)}for(const h of o.bumpers)Math.hypot(i.x-h.x,i.y-h.y)<l.PLAYER_BASE_RADIUS+h.radius&&h.pulseTimerMs<=0&&j(o,h,"GHOST");for(const h of o.enemies){if(h.hp<=0)continue;const f=h.x-i.x,y=h.y-i.y,s=Math.hypot(f,y);if(s<h.radius+l.PLAYER_BASE_RADIUS&&s>.001){const c=f/s,g=y/s;h.x=i.x+c*(h.radius+l.PLAYER_BASE_RADIUS+2),h.y=i.y+g*(h.radius+l.PLAYER_BASE_RADIUS+2),h.vx=c*(360/h.mass),h.vy=g*(360/h.mass),h.knockbackTimerMs=Math.max(h.knockbackTimerMs,420);const b=x(o,"mobius-tape-spool")?1.4:1;k(o,h,Math.round(24*b),"ECHO","ECHO STRIKE"),H(o,1,h.x,h.y)}}}o.spawnTimerMs-=r;const E=a.isBossSector?5:6+o.sector;o.spawnTimerMs<=0&&o.enemies.length<E&&(!a.isBossSector||o.enemies.some(m=>m.type==="kronos-omega"))&&(o.spawnTimerMs=Math.max(1250,2600-o.sector*180),C(o));for(let m=0;m<o.enemies.length;m++){const i=o.enemies[m];if(i.hp<=0)continue;const h=K[i.type];if(i.flashTimerMs=Math.max(0,i.flashTimerMs-r),i.burnTimerMs>0){const v=Math.ceil(i.burnTimerMs/500);i.burnTimerMs=Math.max(0,i.burnTimerMs-r);const M=Math.ceil(i.burnTimerMs/500);if(v!==M&&(k(o,i,8,"BUMPER"),i.hp<=0))continue}i.chillTimerMs>0&&(i.chillTimerMs=Math.max(0,i.chillTimerMs-r));const f=i.chillTimerMs>0?.5:1,y=e.x-i.x,s=e.y-i.y,c=Math.max(1,Math.hypot(y,s));if(i.facingAngle=Math.atan2(s,y),i.knockbackTimerMs>0)i.knockbackTimerMs=Math.max(0,i.knockbackTimerMs-r),i.vx*=Math.pow(.95,r/16.67),i.vy*=Math.pow(.95,r/16.67);else{const v=h.speed*f;if(i.type==="prism-sniper"){const M=-s/c,T=y/c,A=c<170?-.5:c>220?.5:0;i.vx=(M*.8+y/c*A)*v,i.vy=(T*.8+s/c*A)*v}else i.vx=y/c*v,i.vy=s/c*v}if(i.x+=i.vx*t,i.y+=i.vy*t,h.fireCooldownMs>0&&i.knockbackTimerMs<=0&&(i.fireTimerMs-=r*f,i.fireTimerMs<=0))if(i.fireTimerMs=i.type==="kronos-omega"?Math.max(680,h.fireCooldownMs-(i.bossPhase-1)*260):h.fireCooldownMs,i.type==="arc-weaver")for(const v of[-.28,0,.28]){const M=i.facingAngle+v;o.projectiles.push({id:o.nextEntityId++,x:i.x+Math.cos(M)*(i.radius+6),y:i.y+Math.sin(M)*(i.radius+6),vx:Math.cos(M)*h.projectileSpeed,vy:Math.sin(M)*h.projectileSpeed,radius:6,damage:11,isAllied:!1,isHoming:!1,pierceLeft:1,color:"#f43f5e",ttlMs:3600,sourceName:h.name})}else if(i.type==="kronos-omega"){const v=i.bossPhase===1?6:i.bossPhase===2?8:12,M=o.elapsedMs/450%(Math.PI*2);for(let T=0;T<v;T++){const A=M+T/v*Math.PI*2;o.projectiles.push({id:o.nextEntityId++,x:i.x+Math.cos(A)*(i.radius+8),y:i.y+Math.sin(A)*(i.radius+8),vx:Math.cos(A)*h.projectileSpeed,vy:Math.sin(A)*h.projectileSpeed,radius:7,damage:14,isAllied:!1,isHoming:!1,pierceLeft:1,color:i.bossPhase===3?"#fde047":"#fb7185",ttlMs:4200,sourceName:"Kronos-Omega Supernova"})}}else{const v=i.facingAngle;o.projectiles.push({id:o.nextEntityId++,x:i.x+Math.cos(v)*(i.radius+6),y:i.y+Math.sin(v)*(i.radius+6),vx:Math.cos(v)*h.projectileSpeed,vy:Math.sin(v)*h.projectileSpeed,radius:6,damage:12,isAllied:!1,isHoming:!1,pierceLeft:1,color:"#fb7185",ttlMs:3600,sourceName:h.name})}const g=Math.hypot(i.x-l.ARENA_CENTER_X,i.y-l.ARENA_CENTER_Y),b=l.ARENA_RADIUS-i.radius;if(g>b&&g>.001){const v=(i.x-l.ARENA_CENTER_X)/g,M=(i.y-l.ARENA_CENTER_Y)/g;i.x=l.ARENA_CENTER_X+v*b,i.y=l.ARENA_CENTER_Y+M*b;const T=i.vx*v+i.vy*M;if(T>0&&(i.vx=(i.vx-2*T*v)*.9,i.vy=(i.vy-2*T*M)*.9),i.knockbackTimerMs>0){o.ledger.totalWallSlams+=1;const A=x(o,"newtonian-guillotine")?1.65:1,_=i.type==="void-juggernaut"?2.5:1;if(x(o,"newtonian-guillotine")&&(e.stamina=Math.min(e.maxStamina,e.stamina+8)),H(o,1,i.x,i.y),k(o,i,Math.round(28*A*_),"KINETIC","WALL SLAM!"),i.hp<=0)continue}}for(const v of o.bumpers){const M=i.x-v.x,T=i.y-v.y,A=Math.hypot(M,T),_=i.radius+v.radius;if(A<_&&A>.001){const Y=M/A,X=T/A;if(i.x=v.x+Y*(_+2),i.y=v.y+X*(_+2),i.vx=Y*(460/i.mass),i.vy=X*(460/i.mass),i.knockbackTimerMs>0){const W=i.type==="void-juggernaut"?2.5:1;if(k(o,i,Math.round(32*W),"BUMPER","BUMPER SHATTER!"),j(o,v,"ENEMY"),i.hp<=0)break}}}if(i.hp<=0)continue;const R=i.x-e.x,I=i.y-e.y,O=Math.hypot(R,I),B=i.radius+e.radius;if(O<B&&O>.001){const v=R/O,M=I/O,T=Math.hypot(e.vx,e.vy),A=e.dashTimerMs>0||e.overdriveTimerMs>0||T>=245;if(i.x=e.x+v*(B+2),i.y=e.y+M*(B+2),A){let _=!1;if(i.type==="chrono-warden"&&e.overdriveTimerMs<=0){const W=Math.atan2(-M,-v);Math.abs(Math.atan2(Math.sin(W-i.facingAngle),Math.cos(W-i.facingAngle)))<.75&&i.knockbackTimerMs<=0&&(_=!0)}const Y=580*n.knockbackMultiplier/Math.max(.7,i.mass);i.vx=v*Y,i.vy=M*Y,i.knockbackTimerMs=520,e.vx=-v*240,e.vy=-M*240,e.invulnTimerMs=Math.max(e.invulnTimerMs,220),q(o),H(o,1,i.x,i.y),k(o,i,_?10:34,"KINETIC",_?"SHIELD GRAZE":"RICOCHET SLAM!")}else e.invulnTimerMs<=0&&(e.hp=Math.max(0,e.hp-h.contactDamage),e.invulnTimerMs=650,e.vx=-v*320,e.vy=-M*320,o.ledger.lastDamageBy=`${h.name} (Melee Impact)`,S(o,"PLAYER_DAMAGED",e.x,e.y,`-${h.contactDamage} HP (${h.name.split(" ")[0]})`,"#f43f5e",1.4))}}for(let m=0;m<o.enemies.length;m++){const i=o.enemies[m];if(!(i.hp<=0))for(let h=m+1;h<o.enemies.length;h++){const f=o.enemies[h];if(f.hp<=0)continue;const y=f.x-i.x,s=f.y-i.y,c=Math.hypot(y,s),g=i.radius+f.radius;if(c<g&&c>.001){const b=y/c,R=s/c,I=g-c;if(i.x-=b*(I*.5),i.y-=R*(I*.5),f.x+=b*(I*.5),f.y+=R*(I*.5),i.knockbackTimerMs>0||f.knockbackTimerMs>0){i.knockbackTimerMs=Math.max(i.knockbackTimerMs,360),f.knockbackTimerMs=Math.max(f.knockbackTimerMs,360);const O=380;i.vx=-b*(O/i.mass),i.vy=-R*(O/i.mass),f.vx=b*(O/f.mass),f.vy=R*(O/f.mass);const B=x(o,"newtonian-guillotine")?1.65:1;x(o,"newtonian-guillotine")&&(e.stamina=Math.min(e.maxStamina,e.stamina+8)),H(o,1,(i.x+f.x)*.5,(i.y+f.y)*.5);const v=Math.round(30*B);k(o,i,v,"KINETIC","DOMINO CRASH!"),k(o,f,v,"KINETIC","DOMINO CRASH!")}}}}o.enemies=o.enemies.filter(m=>m.hp>0);for(let m=o.projectiles.length-1;m>=0;m--){const i=o.projectiles[m];if(i.ttlMs-=r,i.ttlMs<=0){o.projectiles.splice(m,1);continue}if(!i.isAllied&&e.parryTimerMs>0){const f=L(o,e.x,e.y,!0);f>0&&$(o,f)}if(i.isAllied&&i.isHoming&&o.enemies.length>0){let f=null,y=1/0;for(const s of o.enemies){const c=Math.hypot(s.x-i.x,s.y-i.y);c<y&&(y=c,f=s)}if(f){const s=Math.hypot(i.vx,i.vy)||420,c=Math.atan2(f.y-i.y,f.x-i.x),g=Math.atan2(i.vy,i.vx),b=Math.atan2(Math.sin(c-g),Math.cos(c-g)),R=g+b*Math.min(1,9.5*t);i.vx=Math.cos(R)*s,i.vy=Math.sin(R)*s}}if(i.x+=i.vx*t,i.y+=i.vy*t,Math.hypot(i.x-l.ARENA_CENTER_X,i.y-l.ARENA_CENTER_Y)>l.ARENA_RADIUS+16){o.projectiles.splice(m,1);continue}if(i.isAllied){let f=!1;for(const y of o.enemies){if(y.hp<=0)continue;if(Math.hypot(y.x-i.x,y.y-i.y)<=y.radius+i.radius){const c=i.sourceName==="PARRY"?"PARRY":i.sourceName==="ECHO"?"ECHO":"KINETIC";if(k(o,y,i.damage,c,"PRISM SHARD"),i.pierceLeft-=1,i.pierceLeft<=0){f=!0;break}}}if(o.enemies=o.enemies.filter(y=>y.hp>0),f){o.projectiles.splice(m,1);continue}}else if(Math.hypot(e.x-i.x,e.y-i.y)<=e.radius+i.radius){o.projectiles.splice(m,1),e.invulnTimerMs<=0&&e.dashTimerMs<=0&&(e.hp=Math.max(0,e.hp-i.damage),e.invulnTimerMs=550,o.ledger.lastDamageBy=i.sourceName,S(o,"PLAYER_DAMAGED",e.x,e.y,`-${i.damage} HP (${i.sourceName})`,"#f43f5e",1.35));continue}}if(e.hp<=0){e.hp=0,o.status="GAME_OVER",S(o,"GAME_OVER",e.x,e.y,`💀 CORE SHATTERED BY ${o.ledger.lastDamageBy.toUpperCase()}`,"#f43f5e",2.5);return}o.sectorKills>=o.sectorTargetKills&&ye(o)}function J(){return{highScore:0,bestComboChain:0,highestSectorReached:1,totalVictories:0,totalEnemiesShattered:0,totalBankShots:0,totalParries:0,totalEchoesSpawned:0,discoveredRelics:[],rewardedRunSeeds:[]}}function de(){const o={version:l.SAVE_VERSION,career:J(),activeRun:null};if(typeof window>"u"||!window.localStorage)return o;try{const r=window.localStorage.getItem(l.SAVE_KEY);if(!r)return o;const t=JSON.parse(r);return!t||t.version!==l.SAVE_VERSION||!t.career?o:{version:l.SAVE_VERSION,career:{...J(),...t.career,discoveredRelics:Array.isArray(t.career.discoveredRelics)?[...t.career.discoveredRelics]:[],rewardedRunSeeds:Array.isArray(t.career.rewardedRunSeeds)?[...t.career.rewardedRunSeeds]:[]},activeRun:t.activeRun?G(t.activeRun):null}}catch{return o}}function V(o,r){const t={...o,discoveredRelics:[...o.discoveredRelics],rewardedRunSeeds:[...o.rewardedRunSeeds]};if(r){r.score>t.highScore&&(t.highScore=r.score),r.bestComboChain>t.bestComboChain&&(t.bestComboChain=r.bestComboChain),r.sector>t.highestSectorReached&&(t.highestSectorReached=r.sector);for(const a of r.relicIds)t.discoveredRelics.includes(a)||t.discoveredRelics.push(a);const n=`${r.seed}:${Math.round(r.elapsedMs)}`;(r.status==="VICTORY"||r.status==="GAME_OVER")&&!t.rewardedRunSeeds.includes(n)&&(t.rewardedRunSeeds.push(n),t.rewardedRunSeeds.length>50&&t.rewardedRunSeeds.shift(),r.status==="VICTORY"&&(t.totalVictories+=1),t.totalEnemiesShattered+=r.totalKills,t.totalBankShots+=r.ledger.totalBankShots,t.totalParries+=r.ledger.totalParries,t.totalEchoesSpawned+=r.ledger.totalEchoesSpawned)}const e={version:l.SAVE_VERSION,career:t,activeRun:r&&r.status!=="VICTORY"&&r.status!=="GAME_OVER"?G(r):null};if(typeof window<"u"&&window.localStorage)try{window.localStorage.setItem(l.SAVE_KEY,JSON.stringify(e))}catch{}return e}typeof HTMLButtonElement<"u"&&!("commandForElement"in HTMLButtonElement.prototype)&&re(()=>import("./index-BWFjuSge.js"),[],import.meta.url).catch(()=>{});typeof HTMLElement<"u"&&!("popover"in HTMLElement.prototype)&&re(()=>import("./popover-DtqSrbDJ.js"),[],import.meta.url).catch(()=>{});class he{container;audio;callbacks;debugVisible;canvas;ctx;announcerEl;hudSectorEl;hudScoreEl;hudComboEl;hudHpBarEl;hudHpTextEl;hudStaminaBarEl;hudOverdriveBarEl;hudRelicsListEl;draftOverlayEl;endOverlayEl;debugPanelEl;telemetryPopoverBodyEl;chassisButtons=[];keysDown=new Set;callouts=[];particles=[];rings=[];screenShake=0;lastDraftKey="";lastEndStatus="";boundKeyDown;boundKeyUp;constructor(r,t,e,n=!1){this.container=r,this.audio=t,this.callbacks=e,this.debugVisible=n,this.boundKeyDown=a=>this.handleKeyDown(a),this.boundKeyUp=a=>this.handleKeyUp(a),this.mountDOM(),window.addEventListener("keydown",this.boundKeyDown),window.addEventListener("keyup",this.boundKeyUp)}mountDOM(){this.container.innerHTML=`
      <style>
        :root, html {
          color-scheme: light dark;
          --cv-bg-light: #f8fafc;
          --cv-bg-dark: #070913;
          --cv-panel-light: rgba(255, 255, 255, 0.92);
          --cv-panel-dark: rgba(15, 20, 38, 0.92);
          --cv-text-light: #0f172a;
          --cv-text-dark: #f8fafc;
          --cv-border-light: rgba(245, 158, 11, 0.45);
          --cv-border-dark: rgba(245, 158, 11, 0.45);
          --cv-bg: var(--cv-bg-dark);
          --cv-panel: var(--cv-panel-dark);
          --cv-text: var(--cv-text-dark);
          --cv-border: var(--cv-border-dark);
          --cv-scroll-thumb: #f59e0b;
          --cv-scroll-track: #0f172a;
          scrollbar-width: thin;
          scrollbar-color: var(--cv-scroll-thumb) var(--cv-scroll-track);
        }
        @media (prefers-color-scheme: light) {
          :root {
            --cv-bg: var(--cv-bg-dark);
            --cv-panel: var(--cv-panel-dark);
            --cv-text: var(--cv-text-dark);
          }
        }
        @supports (color: light-dark(white, black)) {
          :root {
            --cv-scroll-thumb: light-dark(#d97706, #f59e0b);
            --cv-scroll-track: light-dark(#e2e8f0, #0f172a);
          }
        }
        @supports not (scrollbar-color: auto) {
          .cv-shell::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .cv-shell::-webkit-scrollbar-thumb {
            background: var(--cv-scroll-thumb);
          }
          .cv-shell::-webkit-scrollbar-track {
            background: var(--cv-scroll-track);
          }
        }
        .cv-visually-hidden:where(:not(:focus-within, :active)) {
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
        .cv-shell {
          background: radial-gradient(circle at 50% 15%, #161b36 0%, #070913 75%);
          color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          border: 1px solid rgba(245, 158, 11, 0.42);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 20px 55px rgba(0, 0, 0, 0.7);
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
        }
        .cv- shell :where(button, a:any-link):focus-visible,
        .cv-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 3px;
        }
        .cv-topbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          margin-bottom: 12px;
        }
        .cv-brand-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          background: linear-gradient(90deg, #fde047, #f59e0b, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .cv-brand-sub {
          margin: 2px 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .cv-chassis-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .cv-btn {
          min-block-size: 30px;
          min-inline-size: 30px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .cv-btn:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: #fde047;
          transform: translateY(-1px);
        }
        .cv-btn[aria-pressed="true"] {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #090d16;
          border-color: #fef08a;
        }
        .cv-hud-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }
        .cv-hud-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 10px;
          padding: 8px 12px;
        }
        .cv-hud-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          display: block;
        }
        .cv-hud-value {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin-top: 2px;
        }
        .cv-meter-track {
          height: 8px;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 5px;
        }
        .cv-meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.08s linear;
        }
        .cv-stage-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          background: #05070f;
          border-radius: 12px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          overflow: hidden;
        }
        .cv-canvas {
          width: 100%;
          max-width: 960px;
          height: auto;
          aspect-ratio: 16 / 10;
          display: block;
          cursor: crosshair;
          touch-action: none;
        }
        .cv-overlay {
          position: absolute;
          inset: 0;
          background: rgba(7, 9, 19, 0.88);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 15;
          text-align: center;
        }
        .cv-overlay[hidden] {
          display: none !important;
        }
        .cv-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
          width: 100%;
          max-width: 780px;
          margin: 14px 0;
        }
        .cv-relic-card {
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          color: #f8fafc;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .cv-relic-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        .cv-bottom-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          font-size: 0.8rem;
          color: #cbd5e1;
        }
        .cv-relic-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .cv-relic-pill {
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.45);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .cv-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 12px;
          padding: 16px;
          max-width: 420px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
        }
        [popover]:is(:popover-open, .\\:popover-open) {
          display: block;
        }
        .cv-dialog {
          background: #0b1120;
          color: #f8fafc;
          border: 1px solid #f59e0b;
          border-radius: 14px;
          padding: 20px;
          max-width: 680px;
          width: 92vw;
          max-height: 82vh;
          overflow-y: auto;
        }
        .cv-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
        }
      </style>

      <div class="cv-shell">
        <div id="cv-live-announcer" class="cv-visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <div class="cv-topbar">
          <div>
            <h2 class="cv-brand-title">⚡ CHRONO-VORTEX: THE GOD-FORGE ARENA</h2>
            <p class="cv-brand-sub">
              Kinetic Pinball-Brawler &amp; Time-Echo Bullet Alchemist · Bank-Shot Enemies off Elemental Bumpers &amp; Weave Temporal Clones!
            </p>
          </div>

          <div class="cv-chassis-bar" role="group" aria-label="Striker Chassis Selection">
            <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">CHASSIS:</span>
            ${U.map((n,a)=>`
              <button
                type="button"
                class="cv-btn"
                data-chassis-btn="${n.id}"
                aria-pressed="${a===0?"true":"false"}"
              >
                ${n.name}
              </button>
            `).join("")}
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button
              type="button"
              class="cv-btn"
              commandfor="chrono-telemetry-popover"
              command="toggle-popover"
            >
              📊 Causal Ledger
            </button>
            <button
              type="button"
              class="cv-btn"
              commandfor="chrono-codex-dialog"
              command="show-modal"
            >
              📖 Relic &amp; Pinball Codex
            </button>
            <button type="button" class="cv-btn" id="cv-btn-mute" aria-pressed="false">
              🔊 Synth: ON
            </button>
            <button type="button" class="cv-btn" id="cv-btn-restart">
              ↻ New Run
            </button>
          </div>
        </div>

        <div class="cv-hud-grid">
          <div class="cv-hud-card">
            <span class="cv-hud-label">Cosmic Crucible Sector</span>
            <div class="cv-hud-value" id="cv-hud-sector">Sector I (0 / 10)</div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Score &amp; Pinball Chain</span>
            <div class="cv-hud-value">
              <span id="cv-hud-score">0</span> ·
              <span id="cv-hud-combo" style="color:#fde047;">1x CHAIN</span>
            </div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Hull Integrity <span id="cv-hud-hp-text">130 / 130</span></span>
            <div class="cv-meter-track">
              <div id="cv-hud-hp-bar" class="cv-meter-fill" style="width:100%; background:linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Kinetic Stamina &amp; Overdrive [F]</span>
            <div class="cv-meter-track" style="margin-bottom:4px;">
              <div id="cv-hud-stamina-bar" class="cv-meter-fill" style="width:100%; background:#38bdf8;"></div>
            </div>
            <div class="cv-meter-track">
              <div id="cv-hud-overdrive-bar" class="cv-meter-fill" style="width:25%; background:linear-gradient(90deg, #f59e0b, #fde047);"></div>
            </div>
          </div>
        </div>

        <div class="cv-stage-container">
          <canvas
            id="cv-arena-canvas"
            class="cv-canvas"
            width="${l.ARENA_WIDTH}"
            height="${l.ARENA_HEIGHT}"
            aria-label="Chrono-Vortex God-Forge Crucible Arena"
          ></canvas>

          <div id="cv-draft-overlay" class="cv-overlay" role="dialog" aria-label="God-Forge Relic Draft" hidden></div>
          <div id="cv-end-overlay" class="cv-overlay" role="dialog" aria-label="Run Outcome Summary" hidden></div>
        </div>

        <div class="cv-bottom-bar">
          <div>
            <strong>Controls:</strong>
            <code>WASD / Arrows</code> Drift ·
            <code>Click / Space</code> Kinetic Dash-Slam ·
            <code>Q / Right-Click</code> Alchemy Parry ·
            <code>E</code> Spawn Chrono-Ghost ·
            <code>R</code> Rewind &amp; Fork ·
            <code>F</code> Overdrive
          </div>
          <div class="cv-relic-pills" id="cv-relics-list">
            <span style="color:#94a3b8;">Forged Relics: None yet</span>
          </div>
        </div>

        <pre id="cv-debug-panel" style="margin-top:8px; padding:8px; background:#020617; color:#38bdf8; font-size:0.75rem; border-radius:8px;" hidden></pre>

        <div id="chrono-telemetry-popover" class="cv-popover" popover>
          <h3 style="margin:0 0 8px; color:#38bdf8;">⚡ Honest Causal Combat Ledger</h3>
          <div id="cv-telemetry-body" style="font-size:0.85rem; line-height:1.5;"></div>
        </div>

        <dialog id="chrono-codex-dialog" class="cv-dialog" closedby="any" aria-labelledby="chrono-codex-title">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h2 id="chrono-codex-title" style="margin:0; color:#fde047;">📖 God-Forge Tactical Manual &amp; Relic Codex</h2>
            <button type="button" class="cv-btn" commandfor="chrono-codex-dialog" command="close">
              Close [Esc]
            </button>
          </div>
          <p style="color:#cbd5e1; font-size:0.9rem; line-height:1.5;">
            <strong>How to Play Like a GOAT:</strong> Instead of chipping enemies down slowly, use <strong>Kinetic Dash-Slam [Space / Click]</strong> to launch enemies into the 4 <strong>Elemental Resonance Bumpers</strong>, the <strong>Octagonal Crucible Wall</strong>, or <strong>each other (Domino Collisions)</strong>! Deploy <strong>Chrono-Ghost Echoes [E]</strong> to replay your last 4 seconds of movement in parallel, and use <strong>Pulse Parry [Q / Right-Click]</strong> to transmute enemy bullets into allied homing prism shards.
          </p>
          <h3 style="color:#38bdf8; margin:14px 0 8px;">12 Synergistic God-Forge Relics</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:8px;">
            ${w.map(n=>`
              <div style="padding:8px 10px; border-radius:8px; background:rgba(15,23,42,0.9); border:1px solid ${n.color};">
                <div style="font-weight:800; color:${n.color};">${n.icon} ${n.name} <small>(${n.school})</small></div>
                <div style="font-size:0.78rem; color:#cbd5e1; margin-top:3px;">${n.description}</div>
              </div>
            `).join("")}
          </div>
        </dialog>
      </div>
    `;const r=this.container.querySelector("#chrono-codex-dialog");r&&typeof HTMLDialogElement<"u"&&!("closedBy"in HTMLDialogElement.prototype)&&r.addEventListener("click",n=>{if(n.target!==r)return;const a=r.getBoundingClientRect();a.top<=n.clientY&&n.clientY<=a.top+a.height&&a.left<=n.clientX&&n.clientX<=a.left+a.width||r.close()}),this.canvas=this.container.querySelector("#cv-arena-canvas"),this.ctx=this.canvas?.getContext("2d")??null,this.announcerEl=this.container.querySelector("#cv-live-announcer"),this.hudSectorEl=this.container.querySelector("#cv-hud-sector"),this.hudScoreEl=this.container.querySelector("#cv-hud-score"),this.hudComboEl=this.container.querySelector("#cv-hud-combo"),this.hudHpBarEl=this.container.querySelector("#cv-hud-hp-bar"),this.hudHpTextEl=this.container.querySelector("#cv-hud-hp-text"),this.hudStaminaBarEl=this.container.querySelector("#cv-hud-stamina-bar"),this.hudOverdriveBarEl=this.container.querySelector("#cv-hud-overdrive-bar"),this.hudRelicsListEl=this.container.querySelector("#cv-relics-list"),this.draftOverlayEl=this.container.querySelector("#cv-draft-overlay"),this.endOverlayEl=this.container.querySelector("#cv-end-overlay"),this.debugPanelEl=this.container.querySelector("#cv-debug-panel"),this.telemetryPopoverBodyEl=this.container.querySelector("#cv-telemetry-body"),this.chassisButtons=Array.from(this.container.querySelectorAll("button[data-chassis-btn]"));for(const n of this.chassisButtons)n.addEventListener("click",()=>{const a=n.getAttribute("data-chassis-btn");this.callbacks.onAction({type:"SWITCH_CHASSIS",chassisId:a})});const t=this.container.querySelector("#cv-btn-mute");t?.addEventListener("click",()=>{const n=this.audio.toggleMute();t.setAttribute("aria-pressed",String(n)),t.textContent=n?"🔇 Synth: OFF":"🔊 Synth: ON"}),this.container.querySelector("#cv-btn-restart")?.addEventListener("click",()=>{this.callbacks.onRestart()}),this.canvas?.addEventListener("pointermove",n=>{const a=this.toArenaCoords(n);this.callbacks.onAction({type:"SET_AIM",worldX:a.x,worldY:a.y})}),this.canvas?.addEventListener("pointerdown",n=>{const a=this.toArenaCoords(n);n.button===2?this.callbacks.onAction({type:"PULSE_PARRY"}):this.callbacks.onAction({type:"DASH_STRIKE",targetX:a.x,targetY:a.y})}),this.canvas?.addEventListener("contextmenu",n=>{n.preventDefault()})}toArenaCoords(r){const t=this.canvas.getBoundingClientRect(),e=l.ARENA_WIDTH/Math.max(1,t.width),n=l.ARENA_HEIGHT/Math.max(1,t.height);return{x:(r.clientX-t.left)*e,y:(r.clientY-t.top)*n}}handleKeyDown(r){if(document.activeElement&&["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const t=r.key.toLowerCase();this.keysDown.add(t),this.syncMoveDirection(),t===" "||t==="k"?(r.preventDefault(),this.callbacks.onAction({type:"DASH_STRIKE"})):t==="q"||t==="j"?(r.preventDefault(),this.callbacks.onAction({type:"PULSE_PARRY"})):t==="e"?(r.preventDefault(),this.callbacks.onAction({type:"SPAWN_ECHO",rewindPlayer:!1})):t==="r"?(r.preventDefault(),this.callbacks.onAction({type:"SPAWN_ECHO",rewindPlayer:!0})):t==="f"?(r.preventDefault(),this.callbacks.onAction({type:"ACTIVATE_OVERDRIVE"})):t==="p"&&this.callbacks.onAction({type:"TOGGLE_PAUSE"})}handleKeyUp(r){this.keysDown.delete(r.key.toLowerCase()),this.syncMoveDirection()}syncMoveDirection(){let r=0,t=0;(this.keysDown.has("w")||this.keysDown.has("arrowup"))&&(t-=1),(this.keysDown.has("s")||this.keysDown.has("arrowdown"))&&(t+=1),(this.keysDown.has("a")||this.keysDown.has("arrowleft"))&&(r-=1),(this.keysDown.has("d")||this.keysDown.has("arrowright"))&&(r+=1),this.callbacks.onAction({type:"SET_MOVE",dx:r,dy:t})}isDebugVisible(){return this.debugVisible}setDebugVisible(r){this.debugVisible=r,this.debugPanelEl&&(this.debugPanelEl.hidden=!r)}resetVisuals(){this.callouts=[],this.particles=[],this.rings=[],this.screenShake=0,this.lastDraftKey="",this.lastEndStatus=""}consumeEvents(r,t){for(const e of t){this.audio.playEvent(e,r.comboCount),this.screenShake=Math.min(14,this.screenShake+e.intensity*3.5),this.callouts.push({x:e.x,y:e.y,vy:-42,text:e.text,color:e.color,alpha:1,scale:Math.min(1.5,.85+e.intensity*.25)}),this.rings.push({x:e.x,y:e.y,radius:10,maxRadius:45+e.intensity*38,color:e.color,alpha:.85});const n=Math.min(18,Math.round(6*e.intensity));for(let a=0;a<n;a++){const d=a/n*Math.PI*2+a%2*.2,u=70+a%5*45;this.particles.push({x:e.x,y:e.y,vx:Math.cos(d)*u,vy:Math.sin(d)*u,radius:2.5+a%3,color:e.color,alpha:1,decay:1.4+a%3*.4})}(e.type==="SECTOR_CLEARED"||e.type==="VICTORY"||e.type==="GAME_OVER"||e.type==="RELIC_CLAIMED")&&this.announcerEl&&(this.announcerEl.textContent=e.text)}}render(r,t,e){const n=e/1e3,a=D(r.sector);if(this.hudSectorEl&&(this.hudSectorEl.textContent=a.isBossSector?"Sector V: KRONOS-OMEGA BOSS":`Sector ${r.sector}/5 (${r.sectorKills}/${r.sectorTargetKills} Shattered)`),this.hudScoreEl&&(this.hudScoreEl.textContent=r.score.toLocaleString()),this.hudComboEl&&(this.hudComboEl.textContent=`${r.comboMultiplier}x CHAIN (${r.comboCount})`),this.hudHpTextEl&&(this.hudHpTextEl.textContent=`${r.player.hp} / ${r.player.maxHp}`),this.hudHpBarEl){const d=Math.max(0,Math.min(100,r.player.hp/r.player.maxHp*100));this.hudHpBarEl.style.width=`${d}%`}if(this.hudStaminaBarEl){const d=Math.max(0,Math.min(100,r.player.stamina/r.player.maxStamina*100));this.hudStaminaBarEl.style.width=`${d}%`}if(this.hudOverdriveBarEl){const d=r.player.overdriveTimerMs>0?r.player.overdriveTimerMs/l.OVERDRIVE_DURATION_MS*100:r.player.overdriveMeter;this.hudOverdriveBarEl.style.width=`${Math.max(0,Math.min(100,d))}%`}for(const d of this.chassisButtons){const u=d.getAttribute("data-chassis-btn");d.setAttribute("aria-pressed",String(u===r.player.chassisId))}this.hudRelicsListEl&&(r.relicIds.length===0?this.hudRelicsListEl.innerHTML='<span style="color:#94a3b8;">Forged Relics: None yet (Clear Sector to Draft!)</span>':this.hudRelicsListEl.innerHTML=r.relicIds.map(d=>{const u=w.find(p=>p.id===d);return`<span class="cv-relic-pill" style="border-color:${u?.color??"#f59e0b"}">${u?.icon??"✨"} ${u?.name??d}</span>`}).join("")),this.telemetryPopoverBodyEl&&(this.telemetryPopoverBodyEl.innerHTML=`
        <div><strong>Kinetic Slam &amp; Wall Damage:</strong> ${r.ledger.kineticSlamDamage.toLocaleString()}</div>
        <div><strong>Elemental Bumper Nova Damage:</strong> ${r.ledger.bumperNovaDamage.toLocaleString()}</div>
        <div><strong>Bullet Alchemy Parry Damage:</strong> ${r.ledger.parryAlchemyDamage.toLocaleString()}</div>
        <div><strong>Chrono-Ghost Echo Damage:</strong> ${r.ledger.chronoEchoDamage.toLocaleString()}</div>
        <hr style="border-color:rgba(148,163,184,0.2); margin:6px 0;" />
        <div><strong>Bank-Shots:</strong> ${r.ledger.totalBankShots} · <strong>Wall Slams:</strong> ${r.ledger.totalWallSlams}</div>
        <div><strong>Parries:</strong> ${r.ledger.totalParries} · <strong>Echoes Spawned:</strong> ${r.ledger.totalEchoesSpawned}</div>
        <div><strong>Last Damage Source:</strong> ${r.ledger.lastDamageBy}</div>
        <div><strong>Career High Score:</strong> ${t.highScore.toLocaleString()} (${t.totalVictories} Crowns)</div>
      `),this.syncOverlays(r,t),this.debugPanelEl&&(this.debugPanelEl.hidden=!this.debugVisible,this.debugVisible&&(this.debugPanelEl.textContent=JSON.stringify({seed:r.seed,status:r.status,sector:r.sector,kills:`${r.sectorKills}/${r.sectorTargetKills}`,player:{chassis:r.player.chassisId,x:Math.round(r.player.x),y:Math.round(r.player.y),hp:r.player.hp,overdrive:Math.round(r.player.overdriveMeter)},enemies:r.enemies.length,ghosts:r.ghosts.length,projectiles:r.projectiles.length},null,2))),this.renderCanvas(r,n)}syncOverlays(r,t){if(this.draftOverlayEl)if(r.status==="RELIC_DRAFT"){this.draftOverlayEl.hidden=!1;const e=`${r.sector}:${r.draftOptions.join(",")}`;if(this.lastDraftKey!==e){this.lastDraftKey=e;const n=r.draftOptions.map((a,d)=>{const u=w.find(p=>p.id===a)??w[0];return`
                <button type="button" class="cv-relic-card" data-pick-relic="${u.id}" style="border-color:${u.color};">
                  <div style="font-size:0.72rem; text-transform:uppercase; color:${u.color}; font-weight:800;">
                    [${d+1}] ${u.school} · ${u.rarity}
                  </div>
                  <div style="font-size:1.1rem; font-weight:800; margin:4px 0;">
                    ${u.icon} ${u.name}
                  </div>
                  <div style="font-size:0.82rem; color:#cbd5e1; line-height:1.4;">
                    ${u.description}
                  </div>
                </button>
              `}).join("");this.draftOverlayEl.innerHTML=`
            <h3 style="margin:0; font-size:1.5rem; color:#fde047;">
              🏆 SECTOR ${r.sector} CONQUERED — THE GOD-FORGE ANVIL AWAITS
            </h3>
            <p style="margin:6px 0 0; color:#cbd5e1; font-size:0.9rem;">
              Bind 1 of 3 Cosmic Relics to your Striker, or Sacrifice the draft at the Anvil for raw Titan stats:
            </p>
            <div class="cv-relic-grid">${n}</div>
            <button type="button" class="cv-btn" id="cv-btn-sacrifice-relic" style="border-color:#f97316; background:rgba(249,115,22,0.2);">
              🔨 Anvil Smelt Sacrifice (+25 Max HP, +40 Heal &amp; +15% Base Damage)
            </button>
          `;for(const a of this.draftOverlayEl.querySelectorAll("button[data-pick-relic]"))a.addEventListener("click",()=>{const d=a.getAttribute("data-pick-relic")??"";this.callbacks.onAction({type:"SELECT_RELIC",relicId:d})});this.draftOverlayEl.querySelector("#cv-btn-sacrifice-relic")?.addEventListener("click",()=>{this.callbacks.onAction({type:"SACRIFICE_RELIC_FOR_UPGRADE"})})}}else this.draftOverlayEl.hidden=!0,this.lastDraftKey="";if(this.endOverlayEl)if(r.status==="VICTORY"||r.status==="GAME_OVER"){this.endOverlayEl.hidden=!1;const e=`${r.status}:${r.score}:${r.totalKills}`;if(this.lastEndStatus!==e){this.lastEndStatus=e;const n=r.status==="VICTORY";this.endOverlayEl.innerHTML=`
            <h3 style="margin:0; font-size:1.75rem; color:${n?"#fde047":"#f43f5e"};">
              ${n?"👑 GOD-FORGE SOVEREIGN! KRONOS-OMEGA SHATTERED!":"💀 TEMPORAL CORE SHATTERED"}
            </h3>
            <p style="margin:6px 0 12px; color:#cbd5e1; max-width:560px;">
              ${n?"You mastered the octagonal pinball crucible, wove temporal echoes across 5 sectors, and conquered Eternity!":`Final blow dealt by: ${r.ledger.lastDamageBy}. Tip: Trigger Pulse Parry [Q] on incoming volleys and bank enemies into Elemental Bumpers!`}
            </p>
            <div style="display:grid; grid-template-columns:repeat(2, minmax(180px, 1fr)); gap:8px; background:rgba(15,23,42,0.9); padding:14px; border-radius:12px; border:1px solid rgba(148,163,184,0.25); text-align:left; font-size:0.85rem; margin-bottom:14px;">
              <div><strong>Final Score:</strong> ${r.score.toLocaleString()}</div>
              <div><strong>Best Pinball Chain:</strong> ${r.bestComboChain} (${r.comboMultiplier}x)</div>
              <div><strong>Kinetic Slam Damage:</strong> ${r.ledger.kineticSlamDamage.toLocaleString()}</div>
              <div><strong>Bumper Nova Damage:</strong> ${r.ledger.bumperNovaDamage.toLocaleString()}</div>
              <div><strong>Parry Alchemy Damage:</strong> ${r.ledger.parryAlchemyDamage.toLocaleString()}</div>
              <div><strong>Chrono-Echo Damage:</strong> ${r.ledger.chronoEchoDamage.toLocaleString()}</div>
              <div><strong>Bank-Shots / Wall Slams:</strong> ${r.ledger.totalBankShots} / ${r.ledger.totalWallSlams}</div>
              <div><strong>Career High Score:</strong> ${t.highScore.toLocaleString()}</div>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="button" class="cv-btn" id="cv-btn-replay-same-seed" style="border-color:#38bdf8;">
                ↺ Replay Exact Seed (${r.seed})
              </button>
              <button type="button" class="cv-btn" id="cv-btn-new-seed" style="background:#f59e0b; color:#090d16;">
                ▶ Launch New Crucible Run
              </button>
            </div>
          `,this.endOverlayEl.querySelector("#cv-btn-replay-same-seed")?.addEventListener("click",()=>{this.callbacks.onRestart(r.seed)}),this.endOverlayEl.querySelector("#cv-btn-new-seed")?.addEventListener("click",()=>{this.callbacks.onRestart()})}}else this.endOverlayEl.hidden=!0,this.lastEndStatus=""}renderCanvas(r,t){const e=this.ctx;if(!e)return;const n=D(r.sector),a=P(r.player.chassisId);this.screenShake=Math.max(0,this.screenShake-28*t);const d=this.screenShake>0?Math.sin(r.elapsedMs*.09)*this.screenShake:0,u=this.screenShake>0?Math.cos(r.elapsedMs*.11)*this.screenShake:0;e.save(),e.clearRect(0,0,l.ARENA_WIDTH,l.ARENA_HEIGHT),e.translate(d,u),e.fillStyle="#050814",e.fillRect(0,0,l.ARENA_WIDTH,l.ARENA_HEIGHT);const p=l.ARENA_CENTER_X,E=l.ARENA_CENTER_Y,m=l.ARENA_RADIUS,i=e.createRadialGradient(p,E,18,p,E,m);i.addColorStop(0,"rgba(30, 41, 59, 0.72)"),i.addColorStop(.75,"rgba(15, 23, 42, 0.92)"),i.addColorStop(1,"rgba(7, 10, 25, 0.98)"),e.beginPath(),e.arc(p,E,m,0,Math.PI*2),e.fillStyle=i,e.fill(),e.save(),e.translate(p,E),e.rotate(r.elapsedMs*25e-5),e.strokeStyle="rgba(148, 163, 184, 0.13)",e.lineWidth=1.5,e.beginPath(),e.arc(0,0,m*.62,0,Math.PI*2),e.stroke();for(let s=0;s<8;s++){const c=s/8*Math.PI*2;e.beginPath(),e.moveTo(Math.cos(c)*40,Math.sin(c)*40),e.lineTo(Math.cos(c)*m,Math.sin(c)*m),e.stroke()}if(e.restore(),e.beginPath(),e.arc(p,E,m,0,Math.PI*2),e.strokeStyle=n.themeColor,e.lineWidth=4,e.stroke(),r.echoHistory.length>2){e.save(),e.beginPath();for(let c=0;c<r.echoHistory.length;c++){const g=r.echoHistory[c];c===0?e.moveTo(g.x,g.y):e.lineTo(g.x,g.y)}e.strokeStyle="rgba(56, 189, 248, 0.28)",e.lineWidth=2.5,e.setLineDash([5,5]),e.stroke(),e.setLineDash([]);const s=r.echoHistory[0];e.beginPath(),e.arc(s.x,s.y,7,0,Math.PI*2),e.strokeStyle="#38bdf8",e.lineWidth=2,e.stroke(),e.restore()}const h={SOLAR:"#f59e0b",CRYO:"#06b6d4",ARC:"#2dd4bf",VOID:"#a855f7"};for(const s of r.bumpers){const c=h[s.element],g=s.pulseTimerMs>0?1+s.pulseTimerMs/340*.26:1,b=s.radius*g;e.save(),e.beginPath(),e.arc(s.x,s.y,b+6,0,Math.PI*2),e.fillStyle=`${c}22`,e.fill(),e.beginPath(),e.arc(s.x,s.y,b,0,Math.PI*2),e.fillStyle="#0f172a",e.fill(),e.lineWidth=3.5,e.strokeStyle=c,e.stroke(),e.fillStyle="#f8fafc",e.font="bold 10px Inter, sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText(s.element,s.x,s.y),e.restore()}for(const s of r.ghosts)e.save(),e.beginPath(),e.arc(s.x,s.y,l.PLAYER_BASE_RADIUS+4,0,Math.PI*2),e.fillStyle="rgba(56, 189, 248, 0.25)",e.fill(),e.beginPath(),e.arc(s.x,s.y,l.PLAYER_BASE_RADIUS,0,Math.PI*2),e.fillStyle="rgba(168, 85, 247, 0.65)",e.fill(),e.lineWidth=2.5,e.strokeStyle="#38bdf8",e.stroke(),e.fillStyle="#bae6fd",e.font="bold 9px Inter, sans-serif",e.textAlign="center",e.fillText("ECHO",s.x,s.y-24),e.restore();let f=null;for(const s of r.enemies){s.type==="kronos-omega"&&(f=s);const c=K[s.type];if(e.save(),s.burnTimerMs>0&&(e.beginPath(),e.arc(s.x,s.y,s.radius+6,0,Math.PI*2),e.strokeStyle="#f97316",e.lineWidth=2,e.stroke()),s.chillTimerMs>0&&(e.beginPath(),e.arc(s.x,s.y,s.radius+8,0,Math.PI*2),e.strokeStyle="#06b6d4",e.lineWidth=2,e.stroke()),s.type==="chrono-warden"&&(e.beginPath(),e.arc(s.x,s.y,s.radius+7,s.facingAngle-.85,s.facingAngle+.85),e.strokeStyle="#38bdf8",e.lineWidth=5,e.stroke()),e.beginPath(),e.arc(s.x,s.y,s.radius,0,Math.PI*2),e.fillStyle=s.flashTimerMs>0?"#ffffff":c.color,e.fill(),e.lineWidth=s.knockbackTimerMs>0?3.5:2,e.strokeStyle=s.knockbackTimerMs>0?"#fde047":c.outlineColor,e.stroke(),s.hp<s.maxHp&&s.type!=="kronos-omega"){const g=s.radius*2,b=s.x-s.radius,R=s.y-s.radius-9;e.fillStyle="rgba(15, 23, 42, 0.85)",e.fillRect(b,R,g,4),e.fillStyle="#f43f5e",e.fillRect(b,R,g*Math.max(0,s.hp/s.maxHp),4)}e.restore()}for(const s of r.projectiles)e.save(),e.beginPath(),e.arc(s.x,s.y,s.radius,0,Math.PI*2),e.fillStyle=s.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#ffffff",e.stroke(),e.restore();const{player:y}=r;if(e.save(),y.overdriveTimerMs>0&&(e.beginPath(),e.arc(y.x,y.y,y.radius+14,0,Math.PI*2),e.strokeStyle="#fde047",e.lineWidth=3,e.stroke()),y.parryTimerMs>0){const s=l.PARRY_RADIUS*a.parryRadiusMultiplier;e.beginPath(),e.arc(y.x,y.y,s,0,Math.PI*2),e.fillStyle="rgba(45, 212, 191, 0.18)",e.fill(),e.strokeStyle="#2dd4bf",e.lineWidth=2.5,e.stroke()}e.beginPath(),e.moveTo(y.x,y.y),e.lineTo(y.x+Math.cos(y.aimAngle)*(y.radius+18),y.y+Math.sin(y.aimAngle)*(y.radius+18)),e.strokeStyle=a.secondaryColor,e.lineWidth=3,e.stroke(),e.beginPath(),e.arc(y.x,y.y,y.radius,0,Math.PI*2),e.fillStyle=y.dashTimerMs>0?"#fde047":a.color,e.fill(),e.lineWidth=3,e.strokeStyle="#ffffff",e.stroke(),e.restore();for(let s=this.rings.length-1;s>=0;s--){const c=this.rings[s];if(c.radius+=(c.maxRadius-c.radius)*Math.min(1,9*t),c.alpha-=1.8*t,c.alpha<=.02){this.rings.splice(s,1);continue}e.save(),e.beginPath(),e.arc(c.x,c.y,c.radius,0,Math.PI*2),e.strokeStyle=c.color,e.globalAlpha=Math.max(0,c.alpha),e.lineWidth=2.5,e.stroke(),e.restore()}for(let s=this.particles.length-1;s>=0;s--){const c=this.particles[s];if(c.x+=c.vx*t,c.y+=c.vy*t,c.alpha-=c.decay*t,c.alpha<=.02){this.particles.splice(s,1);continue}e.save(),e.globalAlpha=Math.max(0,c.alpha),e.fillStyle=c.color,e.beginPath(),e.arc(c.x,c.y,c.radius,0,Math.PI*2),e.fill(),e.restore()}for(let s=this.callouts.length-1;s>=0;s--){const c=this.callouts[s];if(c.y+=c.vy*t,c.alpha-=.95*t,c.alpha<=.02){this.callouts.splice(s,1);continue}e.save(),e.globalAlpha=Math.max(0,c.alpha),e.font=`800 ${Math.round(13*c.scale)}px Inter, sans-serif`,e.fillStyle=c.color,e.textAlign="center",e.fillText(c.text,c.x,c.y),e.restore()}if(f){const g=p-220,b=18;e.fillStyle="rgba(15, 23, 42, 0.92)",e.fillRect(g,b,440,14),e.fillStyle=f.bossPhase===3?"#fde047":"#f43f5e",e.fillRect(g,b,440*Math.max(0,f.hp/f.maxHp),14),e.strokeStyle="#fde047",e.lineWidth=1.5,e.strokeRect(g,b,440,14),e.fillStyle="#f8fafc",e.font="bold 11px Inter, sans-serif",e.textAlign="center",e.fillText(`KRONOS-OMEGA (PHASE ${f.bossPhase}/3) — ${f.hp} / ${f.maxHp} HP`,p,b+11)}e.fillStyle="rgba(148, 163, 184, 0.85)",e.font="600 12px Inter, sans-serif",e.textAlign="left",e.fillText(`${n.name} — ${n.subtitle}`,18,l.ARENA_HEIGHT-16),e.restore()}destroy(){window.removeEventListener("keydown",this.boundKeyDown),window.removeEventListener("keyup",this.boundKeyUp),this.container.innerHTML=""}}const pe={id:l.GAME_ID,number:l.GAME_NUMBER,title:l.TITLE,subtitle:l.SUBTITLE,genre:"Kinetic Pinball-Brawler & Time-Echo Bullet-Alchemist Roguelite",primaryReference:"Hades · Demon’s Tilt / Peggle · Into the Breach",supportingReference:"Braid (Time-Echoes) · Ikaruga (Bullet Alchemy)",oneSentenceLoop:"Ricochet your Striker and enemy automatons off 4 Elemental Resonance Bumpers inside an octagonal Cosmic Crucible, weave up to 3 parallel Chrono-Ghost Echoes of your own past 4 seconds, and parry enemy bullet-hell volleys into homing prism storms across 5 Sectors!",shortGoal:"Shatter the 4 Crucible Sectors, draft synergistic God-Forge Relics (or smelt them at the Anvil), and topple the 3-Phase Boss Kronos-Omega.",longGoal:"Master all 3 Striker Chassis (Vanguard-G, Phantom-X, Prism-9), unlock all 12 God-Forge Relics, and sustain a 16x Pinball Overdrive Chain.",controlsSummary:"WASD / Arrows: Drift · Click / Space: Kinetic Dash-Slam · Q / Right-Click: Alchemy Parry · E: Spawn Chrono-Ghost · R: Rewind & Fork · F: Overdrive",accentColor:l.ACCENT_COLOR};function me(o,r){const t=de();let e={...t.career,discoveredRelics:[...t.career.discoveredRelics],rewardedRunSeeds:[...t.career.rewardedRunSeeds]};const n=r?.initialSeed??l.DEFAULT_SEED;let a=r?.initialSeed===void 0&&t.activeRun&&t.activeRun.status!=="VICTORY"&&t.activeRun.status!=="GAME_OVER"?G(t.activeRun):Q(n);const d=new ie,u=c=>{le(a,c),a.events.length>0&&(m.consumeEvents(a,a.events),a.events=[]),e=V(e,a).career,m.render(a,e,l.FIXED_STEP_MS)},p=c=>{const g=typeof c=="number"?c:a.seed+104729>>>0;a=Q(g,a.player.chassisId),m.resetVisuals(),e=V(e,a).career,m.render(a,e,l.FIXED_STEP_MS)},E=c=>{const g=typeof c=="boolean"?c:!m.isDebugVisible();m.setDebugVisible(g)},m=new he(o,d,{onAction:u,onRestart:p,onToggleDebug:()=>E()},!!r?.debug);let i=0,h=performance.now(),f=0,y=!1;const s=c=>{if(y)return;const g=Math.min(100,Math.max(0,c-h));h=c,f+=g;const b=a.status,R=a.sector;for(;f>=l.FIXED_STEP_MS;)ce(a,l.FIXED_STEP_MS),a.events.length>0&&(m.consumeEvents(a,a.events),a.events=[]),f-=l.FIXED_STEP_MS;(a.status!==b||a.sector!==R||a.score>e.highScore)&&(e=V(e,a).career),m.render(a,e,g||l.FIXED_STEP_MS),i=window.requestAnimationFrame(s)};return m.render(a,e,l.FIXED_STEP_MS),i=window.requestAnimationFrame(s),{destroy(){y=!0,window.cancelAnimationFrame(i),V(e,a),d.destroy(),m.destroy()},getStateSnapshot(){return G(a)},restartWithSeed(c){p(c)},toggleDebug(c){E(c),m.render(a,e,l.FIXED_STEP_MS)}}}const ge={metadata:pe,mountGame:me},be=Object.freeze(Object.defineProperty({__proto__:null,CHRONO_CONFIG:l,ChronoAudioEngine:ie,ChronoUIController:he,ENEMY_ARCHETYPES:K,GOD_FORGE_RELICS:w,SECTORS:z,STRIKER_CHASSIS:U,applyChronoInput:le,cloneChronoState:G,createDefaultChronoCareer:J,createInitialChronoState:Q,createRng:te,default:ge,getChassisDef:P,getSectorDef:D,hasRelic:x,loadChronoSave:de,metadata:pe,mountGame:me,nextFloat:N,nextInt:Z,nextRandom:ae,pickRandom:ue,saveChronoState:V,spawnSectorEnemy:C,stepChronoState:ce,triggerPulseParry:L},Symbol.toStringTag,{value:"Module"}));export{pe as a,be as g,me as m};
