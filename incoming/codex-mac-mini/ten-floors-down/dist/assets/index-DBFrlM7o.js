class qe{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(t){this.muted=t}isMuted(){return this.muted}playPlaceClank(){const t=this.ensureContext();if(!t)return;const n=t.currentTime,r=t.createOscillator(),o=t.createGain();r.type="triangle",r.frequency.setValueAtTime(190,n),r.frequency.exponentialRampToValueAtTime(95,n+.08),o.gain.setValueAtTime(.12,n),o.gain.exponentialRampToValueAtTime(.001,n+.09),r.connect(o),o.connect(t.destination),r.start(n),r.stop(n+.09)}playDemolish(){const t=this.ensureContext();if(!t)return;const n=t.currentTime,r=t.createOscillator(),o=t.createGain();r.type="sawtooth",r.frequency.setValueAtTime(240,n),r.frequency.exponentialRampToValueAtTime(70,n+.12),o.gain.setValueAtTime(.09,n),o.gain.exponentialRampToValueAtTime(.001,n+.13),r.connect(o),o.connect(t.destination),r.start(n),r.stop(n+.13)}playTurretPulse(t=!1){const n=this.ensureContext();if(!n)return;const r=n.currentTime,o=n.createOscillator(),s=n.createGain();o.type=t?"sawtooth":"square",o.frequency.setValueAtTime(t?640:420,r),o.frequency.exponentialRampToValueAtTime(t?110:160,r+.07),s.gain.setValueAtTime(t?.1:.06,r),s.gain.exponentialRampToValueAtTime(.001,r+.075),o.connect(s),s.connect(n.destination),o.start(r),o.stop(r+.075)}playSmelterHiss(){const t=this.ensureContext();if(!t)return;const n=t.currentTime,r=t.createOscillator(),o=t.createGain();r.type="sine",r.frequency.setValueAtTime(520,n),r.frequency.exponentialRampToValueAtTime(780,n+.06),o.gain.setValueAtTime(.04,n),o.gain.exponentialRampToValueAtTime(.001,n+.065),r.connect(o),o.connect(t.destination),r.start(n),r.stop(n+.065)}playWaveKlaxon(t=!1){const n=this.ensureContext();if(!n)return;const r=n.currentTime,o=n.createOscillator(),s=n.createGain();o.type="sawtooth",o.frequency.setValueAtTime(t?220:330,r),o.frequency.setValueAtTime(t?310:440,r+.14),s.gain.setValueAtTime(.11,r),s.gain.exponentialRampToValueAtTime(.001,r+.3),o.connect(s),s.connect(n.destination),o.start(r),o.stop(r+.3)}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const U=["N","E","S","W"],L={N:{dx:0,dy:-1},E:{dx:1,dy:0},S:{dx:0,dy:1},W:{dx:-1,dy:0}};function F(e){switch(e){case"N":return"E";case"E":return"S";case"S":return"W";case"W":return"N"}}function Ve(e){switch(e){case"N":return"S";case"E":return"W";case"S":return"N";case"W":return"E"}}const x={GRID_SIZE:12,CORE_DEFAULT_X:5,CORE_DEFAULT_Y:5,CORE_MAX_HP:500,INITIAL_CREDITS:150,REFUND_RATIO:.75,SHORT_GOAL_WAVE:10,CAMPAIGN_MAX_WAVE:30,TICK_INTERVAL_MS:220,WAVE_PREP_TICKS:25,EARLY_WAVE_BONUS_BASE:20,MINER_INTERVAL_TICKS:1,SMELTER_PROCESS_TICKS:1,SMELTER_INPUT_CAPACITY:3,SILO_CAPACITY:12,AMMO_PER_DELIVERED_ITEM:2,QUOTA_MILESTONES:[15,60,200,600],QUOTA_MILESTONE_REWARDS:[45,90,180,350],TECH_UNLOCK_WAVES:[1,3,6,9,12],STORAGE_KEY:"argon_game09_belt_and_bolt_save_v1"},O={CuCircle:{id:"CuCircle",code:"CuCu",name:"Raw Copper Circle",tier:"raw",color:"#f97316",strokeColor:"#fdba74",shapeKind:"circle",creditValue:4,quotaValue:1,damageMultiplier:1,pierceBonus:0,refinedInto:"CutHalf",description:"Standard kinetic round (1.0x turret dmg) or 4 Core credits."},FeSquare:{id:"FeSquare",code:"FeFe",name:"Raw Iron Square",tier:"raw",color:"#60a5fa",strokeColor:"#bfdbfe",shapeKind:"square",creditValue:6,quotaValue:2,damageMultiplier:1.4,pierceBonus:0,refinedInto:"BoltedAlloy",description:"Dense iron slug (1.4x turret dmg) or refine in Smelter -> BoltedAlloy."},AuStar:{id:"AuStar",code:"AuAu",name:"Crystal Star Ore",tier:"raw",color:"#facc15",strokeColor:"#fef08a",shapeKind:"star",creditValue:10,quotaValue:4,damageMultiplier:1.8,pierceBonus:1,refinedInto:"BoltedAlloy",description:"High-value crystal star (1.8x turret dmg, 10 Core credits)."},CutHalf:{id:"CutHalf",code:"CuHalf",name:"Cut Copper Wedge",tier:"refined",color:"#fb923c",strokeColor:"#ffedd5",shapeKind:"wedge",creditValue:8,quotaValue:3,damageMultiplier:2,pierceBonus:1,refinedInto:null,description:"Precision-cut copper wedge (2.0x turret dmg, 2x Core credit value)."},BoltedAlloy:{id:"BoltedAlloy",code:"FeBolt",name:"Refined Bolt Ammo",tier:"refined",color:"#38bdf8",strokeColor:"#e0f2fe",shapeKind:"bolt",creditValue:12,quotaValue:5,damageMultiplier:2.5,pierceBonus:2,refinedInto:null,description:"Smelted hyper-velocity bolt (2.5x turret dmg + armor pierce, 2x Core credit value)."}},ve={none:"CuCircle",copper_vein:"CuCircle",iron_vein:"FeSquare",crystal_vein:"AuStar"},_={empty:{id:"empty",name:"Empty Deck",shortLabel:"",hotkey:"",cost:0,maxHp:0,unlockWave:1,category:"logistics",color:"#111827",accentColor:"#1f2937",rotatable:!1,isTurret:!1,description:"Open industrial deck tile."},core:{id:"core",name:"Central Command Core",shortLabel:"CORE",hotkey:"",cost:0,maxHp:x.CORE_MAX_HP,unlockWave:1,category:"core",color:"#0ea5e9",accentColor:"#bae6fd",rotatable:!1,isTurret:!1,description:"Accepts ore & refined shapes from all 4 sides for Credits + Quota Progress. Lose if HP hits 0."},miner:{id:"miner",name:"Extractor Miner",shortLabel:"MINER",hotkey:"1",cost:20,maxHp:90,unlockWave:1,category:"production",color:"#d97706",accentColor:"#fde68a",rotatable:!0,isTurret:!1,description:"Extracts geometric ore from veins (or trace CuCircle on deck) and pushes into facing belt."},belt:{id:"belt",name:"Conveyor Belt",shortLabel:"BELT",hotkey:"2",cost:4,maxHp:50,unlockWave:1,category:"logistics",color:"#334155",accentColor:"#94a3b8",rotatable:!0,isTurret:!1,description:"Moves 1 item/tick in facing direction. Jams visibly if downstream tile is full."},splitter:{id:"splitter",name:"1:1 Splitter",shortLabel:"SPLIT",hotkey:"3",cost:14,maxHp:75,unlockWave:3,category:"logistics",color:"#7c3aed",accentColor:"#ddd6fe",rotatable:!0,isTurret:!1,description:"Alternates incoming items 50/50 (or toggleable 2:1) between open downstream paths."},overclock_belt:{id:"overclock_belt",name:"Overclocked Belt (2x)",shortLabel:"2X BELT",hotkey:"4",cost:10,maxHp:65,unlockWave:3,category:"logistics",color:"#0284c7",accentColor:"#7dd3fc",rotatable:!0,isTurret:!1,description:"High-speed magnetic conveyor that shunts items up to 2 tiles per tick."},smelter:{id:"smelter",name:"Alloy Cutter/Smelter",shortLabel:"SMELT",hotkey:"5",cost:35,maxHp:110,unlockWave:6,category:"processing",color:"#ea580c",accentColor:"#fed7aa",rotatable:!0,isTurret:!1,description:"Refines FeSquare -> BoltedAlloy (2.5x turret dmg, 2x Core value) and CuCircle -> CutHalf."},silo:{id:"silo",name:"Capacitor Buffer Silo",shortLabel:"SILO",hotkey:"6",cost:28,maxHp:130,unlockWave:9,category:"processing",color:"#0d9488",accentColor:"#99f6e4",rotatable:!0,isTurret:!1,description:"Stores up to 12 items to absorb belt congestion spikes and auto-feeds adjacent turrets."},bolt_turret:{id:"bolt_turret",name:"Bolt Turret",shortLabel:"BOLT",hotkey:"7",cost:30,maxHp:120,unlockWave:1,category:"defense",color:"#16a34a",accentColor:"#bbf7d0",rotatable:!1,isTurret:!0,turretRange:3.8,turretBaseDamage:16,turretFireIntervalTicks:1,turretMaxAmmo:10,turretTargetsPerShot:1,turretAntiBossMultiplier:1,description:"Starter kinetic turret. Must be fed ammo via belt or silo (up to 2.5x dmg with BoltedAlloy)."},scatter_turret:{id:"scatter_turret",name:"Twin-Barrel Scatter Turret",shortLabel:"SCATTER",hotkey:"8",cost:55,maxHp:150,unlockWave:9,category:"defense",color:"#ca8a04",accentColor:"#fef08a",rotatable:!1,isTurret:!0,turretRange:3.4,turretBaseDamage:14,turretFireIntervalTicks:1,turretMaxAmmo:14,turretTargetsPerShot:2,turretAntiBossMultiplier:1.1,description:"Fires twin flak bursts at up to 2 enemies simultaneously. Ideal against Swarm Waves."},arc_railgun:{id:"arc_railgun",name:"Arc Railgun Turret",shortLabel:"RAILGUN",hotkey:"9",cost:85,maxHp:180,unlockWave:12,category:"defense",color:"#2563eb",accentColor:"#bfdbfe",rotatable:!1,isTurret:!0,turretRange:5.5,turretBaseDamage:38,turretFireIntervalTicks:1,turretMaxAmmo:8,turretTargetsPerShot:1,turretAntiBossMultiplier:2,description:"Long-range magnetic railgun. Deals 2x bonus damage to Bosses & Shielded units."},wall:{id:"wall",name:"Repair Wall",shortLabel:"WALL",hotkey:"0",cost:12,maxHp:240,unlockWave:1,category:"defense",color:"#475569",accentColor:"#cbd5e1",rotatable:!1,isTurret:!1,description:"Reinforced industrial bulkhead that absorbs enemy attacks and regenerates hull between waves."}},ne=["miner","belt","splitter","overclock_belt","smelter","silo","bolt_turret","scatter_turret","arc_railgun","wall"],X=[{wave:1,title:"Tier 0: Pioneer Starter Kit",unlockedBlocks:["miner","belt","bolt_turret","wall"],description:"Basic extraction, 1x conveyors, kinetic Bolt Turrets, and defensive Repair Walls."},{wave:3,title:"Tier 1: Logistics Routing & Overclock",unlockedBlocks:["splitter","overclock_belt"],description:"Unlocks 1:1 Splitters to balance Core vs. Turret routing and 2x Overclocked Belts."},{wave:6,title:"Tier 2: Geometric Alloy Refinement",unlockedBlocks:["smelter"],description:"Unlocks Alloy Cutter/Smelter (FeSquare -> BoltedAlloy with 2.5x turret damage & 2x Core value)."},{wave:9,title:"Tier 3: Flak Defense & Surge Buffering",unlockedBlocks:["scatter_turret","silo"],description:"Unlocks Twin-Barrel Scatter Turrets and 12-slot Capacitor Buffer Silos."},{wave:12,title:"Tier 4: High-Voltage Boss Suppression",unlockedBlocks:["arc_railgun"],description:"Unlocks long-range Arc Railgun Turrets with 2.0x anti-boss/shield penetration."}],ce={scout_drone:{id:"scout_drone",name:"Scout Drone",maxHp:28,speedTilesPerTick:.42,coreDamage:18,wallDamage:12,bountyCredits:8,isBoss:!1,isShielded:!1,color:"#ef4444",radiusRatio:.26},swarm_wasp:{id:"swarm_wasp",name:"Swarm Wasp",maxHp:20,speedTilesPerTick:.58,coreDamage:12,wallDamage:8,bountyCredits:6,isBoss:!1,isShielded:!1,color:"#f97316",radiusRatio:.22},armored_bruiser:{id:"armored_bruiser",name:"Armored Bruiser",maxHp:85,speedTilesPerTick:.3,coreDamage:35,wallDamage:24,bountyCredits:16,isBoss:!1,isShielded:!0,color:"#a855f7",radiusRatio:.32},siege_crawler:{id:"siege_crawler",name:"Siege Crawler (Boss)",maxHp:320,speedTilesPerTick:.22,coreDamage:95,wallDamage:50,bountyCredits:65,isBoss:!0,isShielded:!0,color:"#dc2626",radiusRatio:.42},shielded_dreadnought:{id:"shielded_dreadnought",name:"Shielded Dreadnought (Boss)",maxHp:560,speedTilesPerTick:.2,coreDamage:130,wallDamage:75,bountyCredits:110,isBoss:!0,isShielded:!0,color:"#7c3aed",radiusRatio:.45},apex_goliath:{id:"apex_goliath",name:"Apex Goliath (Final Boss)",maxHp:980,speedTilesPerTick:.18,coreDamage:220,wallDamage:110,bountyCredits:250,isBoss:!0,isShielded:!0,color:"#be123c",radiusRatio:.48}};function xe(){const e=[];for(let t=1;t<=x.CAMPAIGN_MAX_WAVE;t++){const n=X.find(r=>r.wave===t);if(t===15)e.push({wave:t,title:"Wave 15: Siege Crawler Assault",isBossWave:!0,rewardCredits:90,earlyLaunchBonus:35,spawns:[{enemyType:"scout_drone",count:4,spacingTicks:2},{enemyType:"siege_crawler",count:1,spacingTicks:4},{enemyType:"armored_bruiser",count:2,spacingTicks:3}]});else if(t===20)e.push({wave:t,title:"Wave 20: Shielded Dreadnought Vanguard",isBossWave:!0,rewardCredits:120,earlyLaunchBonus:45,spawns:[{enemyType:"swarm_wasp",count:6,spacingTicks:2},{enemyType:"shielded_dreadnought",count:1,spacingTicks:4},{enemyType:"armored_bruiser",count:3,spacingTicks:3}]});else if(t===25)e.push({wave:t,title:"Wave 25: Twin Dreadnought Siege",isBossWave:!0,rewardCredits:160,earlyLaunchBonus:55,spawns:[{enemyType:"armored_bruiser",count:4,spacingTicks:2},{enemyType:"shielded_dreadnought",count:2,spacingTicks:5},{enemyType:"swarm_wasp",count:8,spacingTicks:1}]});else if(t===30)e.push({wave:t,title:"Wave 30: Apex Goliath Final Reckoning",isBossWave:!0,rewardCredits:300,earlyLaunchBonus:80,spawns:[{enemyType:"armored_bruiser",count:4,spacingTicks:2},{enemyType:"siege_crawler",count:1,spacingTicks:4},{enemyType:"apex_goliath",count:1,spacingTicks:5}]});else{const r=[],o=Math.min(8,2+Math.floor(t*.45));r.push({enemyType:"scout_drone",count:o,spacingTicks:2}),t>=4&&r.push({enemyType:"swarm_wasp",count:1+Math.floor((t-3)*.5),spacingTicks:2}),t>=7&&r.push({enemyType:"armored_bruiser",count:1+Math.floor((t-6)*.35),spacingTicks:3}),e.push({wave:t,title:n?`Wave ${t}: ${n.title}`:`Wave ${t}: Sector Patrol`,isBossWave:!1,techUnlockNote:n?.title,rewardCredits:20+t*4,earlyLaunchBonus:12+t*2,spawns:r})}}return e}const ie=xe();function G(e){if(e>=1&&e<=ie.length)return ie[e-1];const t=Math.max(1,e-30);return{wave:e,title:`Wave ${e}: Endless Overdrive +${t}`,isBossWave:e%5===0,rewardCredits:180+t*15,earlyLaunchBonus:50+t*5,spawns:[{enemyType:"swarm_wasp",count:6+t,spacingTicks:1},{enemyType:"armored_bruiser",count:3+Math.floor(t*.6),spacingTicks:2},...e%5===0?[{enemyType:"apex_goliath",count:1+Math.floor(t/5),spacingTicks:4}]:[]]}}function de(e){let t=e>>>0;t===0&&(t=1831565813);const n=()=>{t=t+1831565813>>>0;let r=Math.imul(t^t>>>15,1|t);return r=r+Math.imul(r^r>>>7,61|r)^r,((r^r>>>14)>>>0)/4294967296};return{next:n,nextInt(r,o){const s=Math.max(1,o-r+1);return r+Math.floor(n()*s)},pick(r){if(r.length===0)throw new Error("Cannot pick from an empty array");const o=Math.floor(n()*r.length);return r[o]},getState(){return t>>>0}}}function K(e,t,n="none"){return{x:e,y:t,vein:n,block:"empty",direction:"E",hp:0,maxHp:0,item:null,inputBuffer:[],craftProgress:0,congested:!1,splitterToggle:0,splitterRatio:"1:1",ammoCount:0,maxAmmo:0,loadedAmmoType:null,cooldown:0}}function z(e){const t=e?.seed??9092026,n=de(t),r=x.GRID_SIZE,o=e?.coreX??x.CORE_DEFAULT_X,s=e?.coreY??x.CORE_DEFAULT_Y,p=[];for(let c=0;c<r;c++){const f=[];for(let T=0;T<r;T++)f.push(K(T,c,"none"));p.push(f)}const l=[{x:Math.max(0,o-2),y:s,vein:"copper_vein"},{x:Math.max(0,o-3),y:Math.max(0,s-1),vein:"copper_vein"},{x:o,y:Math.max(0,s-2),vein:"iron_vein"},{x:Math.min(r-1,o+2),y:s,vein:"iron_vein"},{x:o,y:Math.min(r-1,s+2),vein:"copper_vein"},{x:Math.min(r-1,o+3),y:Math.min(r-1,s+2),vein:"crystal_vein"},{x:Math.max(0,o-2),y:Math.min(r-1,s+3),vein:"iron_vein"},{x:Math.min(r-1,o+2),y:Math.max(0,s-3),vein:"crystal_vein"}];for(const c of l)(c.x!==o||c.y!==s)&&(p[c.y][c.x].vein=c.vein);const b=["copper_vein","iron_vein","crystal_vein"];for(let c=0;c<8;c++){const f=n.nextInt(1,r-2),T=n.nextInt(1,r-2);Math.abs(f-o)+Math.abs(T-s)>=2&&p[T][f].vein==="none"&&(p[T][f].vein=n.pick(b))}const i=p[s][o];i.vein="none",i.block="core",i.hp=x.CORE_MAX_HP,i.maxHp=x.CORE_MAX_HP;const h=[...X[0].unlockedBlocks];return{seed:t,rngState:n.getState(),tick:0,gridSize:r,corePos:{x:o,y:s},coreHp:x.CORE_MAX_HP,coreMaxHp:x.CORE_MAX_HP,credits:x.INITIAL_CREDITS,quotaProgress:0,claimedQuotaMilestones:[],wave:1,waveActive:!1,wavePrepTicksRemaining:x.WAVE_PREP_TICKS,queuedSpawns:[],waveSpawnTimer:0,enemies:[],activeShots:[],unlockedBlocks:h,unlockedTechWaves:[1],coreInventory:{CuCircle:0,FeSquare:0,AuStar:0,CutHalf:0,BoltedAlloy:0},grid:p,status:"playing",endlessMode:!1,nextItemId:1,nextEnemyId:1,nextShotId:1,stats:{itemsMined:0,itemsDeliveredToCore:0,itemsRefined:0,ammoLoaded:0,shotsFired:0,totalDamageDealt:0,enemiesDestroyed:0,totalCreditsEarned:0,congestionTicks:0,wavesCleared:0},lastEventMessage:"Command Core online. Place Miners and Belts to feed Core Quota & Perimeter Turrets."}}function E(e,t,n){return t<0||n<0||t>=e.gridSize||n>=e.gridSize?null:e.grid[n][t]}function j(e,t){return t==="empty"||t==="core"?!0:e.unlockedBlocks.includes(t)}function q(e,t){const n=[];for(const r of X)if(r.wave<=t){e.unlockedTechWaves.includes(r.wave)||e.unlockedTechWaves.push(r.wave);for(const o of r.unlockedBlocks)e.unlockedBlocks.includes(o)||(e.unlockedBlocks.push(o),n.push(o))}if(n.length>0){const r=n.map(o=>_[o].name).join(" + ");e.lastEventMessage=`Tech Unlocked (Wave ${t}): ${r}!`}return n}function P(e,t){const n=E(e,t.x,t.y);if(!n)return{ok:!1,reason:"out_of_bounds"};if(t.type==="rotate")return n.block==="empty"||n.block==="core"?{ok:!1,reason:"not_rotatable"}:(n.direction=t.direction??F(n.direction),{ok:!0});if(t.type==="toggle_splitter_ratio"){if(n.block!=="splitter")return{ok:!1,reason:"not_splitter"};const r=["1:1","2:1_A","2:1_B"],o=r.indexOf(n.splitterRatio);return n.splitterRatio=r[(o+1)%r.length],{ok:!0}}if(t.type==="demolish"){if(n.block==="empty")return{ok:!1,reason:"already_empty"};if(n.block==="core")return{ok:!1,reason:"cannot_demolish_core"};const r=_[n.block],o=Math.floor(r.cost*x.REFUND_RATIO);e.credits+=o;const s=n.vein;return e.grid[n.y][n.x]=K(n.x,n.y,s),{ok:!0,refundedCredits:o}}if(t.type==="place"){const r=t.blockType;if(!r||r==="empty")return{ok:!1,reason:"invalid_block"};if(n.block==="core")return{ok:!1,reason:"cannot_overwrite_core"};if(t.respectTechLock&&!j(e,r))return{ok:!1,reason:"tech_locked"};const o=_[r],s=n.block===r,p=n.block!=="empty"&&!s?Math.floor(_[n.block].cost*x.REFUND_RATIO):0,l=t.free||s?0:Math.max(0,o.cost-p);if(!t.free&&e.credits<l)return{ok:!1,reason:"insufficient_credits"};if(e.credits-=l,s)return t.direction?n.direction=t.direction:n.direction=F(n.direction),t.produceOverride&&(n.produceOverride=t.produceOverride),{ok:!0,costPaid:0};const b=n.vein,i=K(n.x,n.y,b);return i.block=r,i.direction=t.direction??"E",i.hp=o.maxHp,i.maxHp=o.maxHp,i.maxAmmo=o.turretMaxAmmo??0,t.produceOverride&&(i.produceOverride=t.produceOverride),r==="core"&&(e.corePos={x:n.x,y:n.y}),e.grid[n.y][n.x]=i,{ok:!0,costPaid:l}}return{ok:!1,reason:"unknown_command"}}function se(e){return e==="core"||e==="belt"||e==="overclock_belt"||e==="splitter"||e==="smelter"||e==="silo"||e==="bolt_turret"||e==="scatter_turret"||e==="arc_railgun"}function J(e,t,n){if(e.block!=="belt"&&e.block!=="overclock_belt"&&e.block!=="miner"&&e.block!=="smelter")return!1;const r=L[e.direction];return e.x+r.dx===t&&e.y+r.dy===n}function H(e,t,n,r,o,s){const p=E(e,t,n);if(!p||o!==void 0&&s!==void 0&&(p.block==="belt"||p.block==="overclock_belt")&&J(p,o,s))return!1;switch(p.block){case"core":return!0;case"belt":case"overclock_belt":case"splitter":return p.item===null;case"smelter":return p.inputBuffer.length<x.SMELTER_INPUT_CAPACITY;case"silo":return p.inputBuffer.length<x.SILO_CAPACITY;case"bolt_turret":case"scatter_turret":case"arc_railgun":return p.ammoCount<p.maxAmmo;default:return!1}}function Ne(e){for(let t=0;t<x.QUOTA_MILESTONES.length;t++){const n=x.QUOTA_MILESTONES[t];if(e.quotaProgress>=n&&!e.claimedQuotaMilestones.includes(n)){e.claimedQuotaMilestones.push(n);const r=x.QUOTA_MILESTONE_REWARDS[t]??50;e.credits+=r,e.stats.totalCreditsEarned+=r,e.lastEventMessage=`Core Quota Milestone (${n}) reached! +${r} Bonus Credits!`}}}function $(e,t,n){switch(t.block){case"core":{const r=O[n.type];e.credits+=r.creditValue,e.quotaProgress+=r.quotaValue,e.coreInventory[n.type]=(e.coreInventory[n.type]??0)+1,e.stats.itemsDeliveredToCore+=1,e.stats.totalCreditsEarned+=r.creditValue,Ne(e);return}case"belt":case"overclock_belt":case"splitter":{t.item={...n,progress:1};return}case"smelter":case"silo":{t.inputBuffer.push(n.type);return}case"bolt_turret":case"scatter_turret":case"arc_railgun":{t.ammoCount=Math.min(t.maxAmmo,t.ammoCount+x.AMMO_PER_DELIVERED_ITEM),(!t.loadedAmmoType||O[n.type].damageMultiplier>=O[t.loadedAmmoType].damageMultiplier)&&(t.loadedAmmoType=n.type),e.stats.ammoLoaded+=x.AMMO_PER_DELIVERED_ITEM;return}default:return}}function re(e,t){const n=L[t.direction],r=t.x+n.dx,o=t.y+n.dy,s=E(e,r,o);if(s&&se(s.block)&&!J(s,t.x,t.y))return{x:r,y:o};for(const p of U){const l=L[p],b=t.x+l.dx,i=t.y+l.dy,h=E(e,b,i);if(h&&se(h.block)&&!J(h,t.x,t.y))return{x:b,y:i}}return{x:r,y:o}}function ze(e,t){const n=U.indexOf(t.direction),r=[];for(let o=0;o<4;o++){const s=U[(n+o)%4],p=L[s],l=t.x+p.dx,b=t.y+p.dy,i=E(e,l,b);i&&se(i.block)&&(J(i,t.x,t.y)||r.push({x:l,y:b}))}return r}function Ue(e,t,n){const r=ze(e,t);if(r.length===0)return null;if(r.length===1){const s=r[0];return H(e,s.x,s.y,n,t.x,t.y)?(t.splitterToggle=(t.splitterToggle+1)%2,s):null}let o=0;if(t.splitterRatio==="1:1")o=t.splitterToggle%r.length;else if(t.splitterRatio==="2:1_A"){const s=[0,0,1];o=s[t.splitterToggle%s.length]%r.length}else{const s=[0,1,1];o=s[t.splitterToggle%s.length]%r.length}for(let s=0;s<r.length;s++){const p=(o+s)%r.length,l=r[p];if(H(e,l.x,l.y,n,t.x,t.y))return t.splitterToggle+=1,l}return null}function ae(e){if(e.status!=="playing")return e;e.tick+=1,e.activeShots=e.activeShots.map(l=>({...l,ttlTicks:l.ttlTicks-1})).filter(l=>l.ttlTicks>0);const t=new Map,n=new Map;for(let l=0;l<e.gridSize;l++)for(let b=0;b<e.gridSize;b++){const i=e.grid[l][b];if(i.congested=!1,i.item){const h=i.block==="overclock_belt"?2:1;t.set(i.item.id,h),n.set(i,i.item.id)}}const r=new Set;let o=!0,s=0;const p=e.gridSize*e.gridSize*2;for(;o&&s<p;){o=!1,s+=1;for(let l=0;l<e.gridSize;l++)for(let b=0;b<e.gridSize;b++){const i=e.grid[l][b];if((i.block==="belt"||i.block==="overclock_belt")&&i.item!==null){const h=t.get(i.item.id)??0;if(h>0){const c=L[i.direction],f=i.x+c.dx,T=i.y+c.dy;if(H(e,f,T,i.item.type,i.x,i.y)){const a=i.item,w=E(e,f,T);i.item=null,$(e,w,a);const V=w.block==="overclock_belt"||i.block==="overclock_belt"?h-1:0;t.set(a.id,Math.max(0,V)),o=!0}}}else if(i.block==="splitter"&&i.item!==null){if((t.get(i.item.id)??0)>0){const c=Ue(e,i,i.item.type);if(c){const f=i.item,T=E(e,c.x,c.y);i.item=null,$(e,T,f),t.set(f.id,0),o=!0}}}else if(i.block==="smelter"&&i.item!==null){if((t.get(i.item.id)??0)>0){const c=re(e,i);if(H(e,c.x,c.y,i.item.type,i.x,i.y)){const f=i.item,T=E(e,c.x,c.y);i.item=null,$(e,T,f),t.set(f.id,0),o=!0}}}else if(i.block==="silo"&&i.inputBuffer.length>0){const h=`${i.x},${i.y}`;if(!r.has(h)){const c=i.inputBuffer[0];let f=null;for(const T of U){const a=L[T],w=E(e,i.x+a.dx,i.y+a.dy);if(w&&_[w.block].isTurret&&w.ammoCount<w.maxAmmo){f=w;break}}if(!f){const T=L[i.direction],a=i.x+T.dx,w=i.y+T.dy;H(e,a,w,c,i.x,i.y)&&(f=E(e,a,w))}if(f){i.inputBuffer.shift();const T={id:e.nextItemId++,type:c,progress:1};t.set(T.id,0),$(e,f,T),r.add(h),o=!0}}}}}for(const[l,b]of n.entries())l.item!==null&&l.item.id===b&&(l.congested=!0,e.stats.congestionTicks+=1);for(let l=0;l<e.gridSize;l++)for(let b=0;b<e.gridSize;b++){const i=e.grid[l][b];if(i.block==="smelter"&&i.item===null&&i.inputBuffer.length>0&&(i.craftProgress+=1,i.craftProgress>=x.SMELTER_PROCESS_TICKS)){i.craftProgress=0;const h=i.inputBuffer.shift(),c=O[h].refinedInto??"BoltedAlloy",f={id:e.nextItemId++,type:c,progress:1};e.stats.itemsRefined+=1;const T=re(e,i);if(H(e,T.x,T.y,f.type,i.x,i.y)){const a=E(e,T.x,T.y);$(e,a,f),t.set(f.id,0)}else i.item=f,i.congested=!0}}for(let l=0;l<e.gridSize;l++)for(let b=0;b<e.gridSize;b++){const i=e.grid[l][b];if(i.block!=="miner")continue;const h=i.produceOverride??ve[i.vein]??"CuCircle";if(i.item===null&&(i.craftProgress+=1,i.craftProgress>=x.MINER_INTERVAL_TICKS&&(i.craftProgress=0,i.item={id:e.nextItemId++,type:h,progress:0},e.stats.itemsMined+=1)),i.item!==null){const c=re(e,i);if(H(e,c.x,c.y,i.item.type,i.x,i.y)){const f=E(e,c.x,c.y),T=i.item;i.item=null,i.congested=!1,$(e,f,T),t.set(T.id,0)}else i.congested=!0,e.stats.congestionTicks+=1}}return!e.waveActive&&e.enemies.length===0?e.wavePrepTicksRemaining>0&&(e.wavePrepTicksRemaining-=1):Te(e),e}function ue(e,t,n,r){const o=ce[t],s=de(e.rngState);let p=n,l=r;if(p===void 0||l===void 0){const c=s.nextInt(0,3),f=s.nextInt(1,e.gridSize-2);c===0?(p=f,l=0):c===1?(p=e.gridSize-1,l=f):c===2?(p=f,l=e.gridSize-1):(p=0,l=f)}e.rngState=s.getState();const b=1+Math.max(0,e.wave-1)*.06,i=Math.round(o.maxHp*b),h={id:e.nextEnemyId++,type:t,name:o.name,x:p,y:l,hp:i,maxHp:i,speedTilesPerTick:o.speedTilesPerTick,coreDamage:o.coreDamage,wallDamage:o.wallDamage,bountyCredits:o.bountyCredits,isBoss:o.isBoss,isShielded:o.isShielded};return e.enemies.push(h),h}function le(e,t){if(e.status!=="playing")return e;t?.waveNumber!==void 0&&(e.wave=t.waveNumber),q(e,e.wave);const n=G(e.wave);t?.earlyBonus&&!e.waveActive&&e.wavePrepTicksRemaining>0&&(e.credits+=n.earlyLaunchBonus,e.stats.totalCreditsEarned+=n.earlyLaunchBonus);const r=[];for(const o of n.spawns)for(let s=0;s<o.count;s++)r.push({enemyType:o.enemyType,delayTicks:s===0?0:o.spacingTicks});if(e.queuedSpawns=r,e.waveSpawnTimer=0,e.waveActive=!0,e.wavePrepTicksRemaining=0,e.lastEventMessage=`${n.title} incoming! Keep turret magazines supplied!`,e.queuedSpawns.length>0){const o=e.queuedSpawns.shift();ue(e,o.enemyType),e.queuedSpawns.length>0&&(e.waveSpawnTimer=e.queuedSpawns[0].delayTicks)}return e}function Te(e){if(e.status!=="playing")return e;if(e.waveActive&&e.queuedSpawns.length>0&&(e.waveSpawnTimer>0&&(e.waveSpawnTimer-=1),e.waveSpawnTimer<=0&&e.queuedSpawns.length>0)){const r=e.queuedSpawns.shift();ue(e,r.enemyType),e.queuedSpawns.length>0&&(e.waveSpawnTimer=e.queuedSpawns[0].delayTicks)}for(let r=0;r<e.gridSize;r++)for(let o=0;o<e.gridSize;o++){const s=e.grid[r][o],p=_[s.block];if(!p.isTurret||(s.cooldown>0&&(s.cooldown-=1),s.ammoCount<=0||s.cooldown>0||e.enemies.length===0))continue;const l=p.turretRange??3.8,b=e.enemies.map(a=>{const w=Math.hypot(a.x-s.x,a.y-s.y),V=Math.hypot(a.x-e.corePos.x,a.y-e.corePos.y);return{enemy:a,distToTurret:w,distToCore:V}}).filter(a=>a.distToTurret<=l&&a.enemy.hp>0).sort((a,w)=>a.distToCore-w.distToCore);if(b.length===0)continue;const i=p.turretTargetsPerShot??1,h=b.slice(0,i),c=s.loadedAmmoType??"CuCircle",f=O[c],T=p.turretBaseDamage??15;s.ammoCount=Math.max(0,s.ammoCount-1),s.ammoCount===0&&(s.loadedAmmoType=null),s.cooldown=Math.max(0,(p.turretFireIntervalTicks??1)-1),e.stats.shotsFired+=1;for(const{enemy:a}of h){let w=Math.round(T*f.damageMultiplier);(a.isBoss||a.isShielded)&&(p.turretAntiBossMultiplier??1)>1&&(w=Math.round(w*(p.turretAntiBossMultiplier??1))),a.hp-=w,e.stats.totalDamageDealt+=w,e.activeShots.push({id:e.nextShotId++,fromX:s.x,fromY:s.y,toX:a.x,toY:a.y,color:f.color,ttlTicks:2})}}const t=[];for(const r of e.enemies)r.hp<=0?(e.credits+=r.bountyCredits,e.stats.totalCreditsEarned+=r.bountyCredits,e.stats.enemiesDestroyed+=1):t.push(r);e.enemies=t;const n=[];for(const r of e.enemies){const o=e.corePos.x-r.x,s=e.corePos.y-r.y,p=Math.hypot(o,s);if(p<=.85){if(e.coreHp=Math.max(0,e.coreHp-r.coreDamage),e.lastEventMessage=`WARNING: ${r.name} struck the Command Core (-${r.coreDamage} HP)!`,e.coreHp<=0){e.coreHp=0,e.status="defeat",e.waveActive=!1,e.lastEventMessage="CRITICAL FAILURE: Command Core Hull reached 0 HP!";break}r.isBoss&&n.push(r);continue}const l=Math.min(p,r.speedTilesPerTick),b=r.x+o/p*l,i=r.y+s/p*l,h=E(e,Math.round(b),Math.round(i));if(h&&h.block==="wall"&&h.hp>0){if(h.hp-=r.wallDamage,h.hp<=0){const c=h.vein;e.grid[h.y][h.x]=K(h.x,h.y,c)}n.push(r)}else r.x=b,r.y=i,n.push(r)}if(e.status==="defeat")return e;if(e.enemies=n,e.waveActive&&e.queuedSpawns.length===0&&e.enemies.length===0&&e.coreHp>0){const r=e.wave,o=G(r);e.waveActive=!1,e.stats.wavesCleared+=1,e.credits+=o.rewardCredits,e.stats.totalCreditsEarned+=o.rewardCredits;for(let s=0;s<e.gridSize;s++)for(let p=0;p<e.gridSize;p++){const l=e.grid[s][p];l.block==="wall"&&l.hp>0&&l.hp<l.maxHp&&(l.hp=Math.min(l.maxHp,l.hp+40))}r>=x.CAMPAIGN_MAX_WAVE&&!e.endlessMode?(e.status="victory",e.lastEventMessage=`CAMPAIGN VICTORY! All ${x.CAMPAIGN_MAX_WAVE} Waves survived!`):(e.wave=r+1,e.wavePrepTicksRemaining=x.WAVE_PREP_TICKS,q(e,e.wave).length===0&&(e.lastEventMessage=`Wave ${r} cleared (+${o.rewardCredits} Credits)! Prepare for Wave ${e.wave}.`))}return e}function ke(e){const t=[],n=[],r=[];for(let l=0;l<e.gridSize;l++)for(let b=0;b<e.gridSize;b++){const i=e.grid[l][b];if(i.congested){const h=L[i.direction],c=E(e,i.x+h.dx,i.y+h.dy);let f="Downstream capacity full";!c||c.block==="empty"?f="Belt ends at open deck (no receiver)":_[c.block].isTurret&&c.ammoCount>=c.maxAmmo?f=`${_[c.block].shortLabel} magazine full (${c.ammoCount}/${c.maxAmmo})`:c.block==="smelter"&&(f="Smelter input buffer full"),t.push({x:b,y:l,block:i.block,reason:f})}_[i.block].isTurret&&i.ammoCount===0&&n.push({x:b,y:l,block:i.block}),i.block==="smelter"&&i.inputBuffer.length===0&&i.item===null&&r.push({x:b,y:l})}const o=Math.max(1,e.tick),s=Math.round(6e4/x.TICK_INTERVAL_MS),p=Math.round(e.stats.itemsDeliveredToCore/o*s);return{congestedTiles:t,dryTurrets:n,starvedSmelters:r,coreThroughputPerMin:p}}function Se(e){const t=e.corePos.x,n=e.corePos.y;P(e,{type:"place",x:t-2,y:n,blockType:"miner",direction:"E"}),P(e,{type:"place",x:t-1,y:n,blockType:"belt",direction:"E"}),P(e,{type:"place",x:t,y:n-2,blockType:"miner",direction:"S"}),P(e,{type:"place",x:t,y:n-1,blockType:"belt",direction:"S"}),P(e,{type:"place",x:t,y:n+2,blockType:"miner",direction:"S"}),P(e,{type:"place",x:t,y:n+3,blockType:"bolt_turret",direction:"S"}),e.lastEventMessage="Starter Blueprint deployed: 2 Core Economy lines + 1 Perimeter Bolt Turret line active!"}const pe=1,me={bestWaveReached:1,bestQuotaProgress:0,bestCreditsEarned:0,campaignsWon:0};function we(e){return JSON.parse(JSON.stringify(e))}function Ce(e,t){const n=t??be(e,me),r={schemaVersion:pe,savedAtIso:new Date().toISOString(),state:we(e),bestRecord:n};return JSON.stringify(r)}function Ee(e){try{const t=JSON.parse(e);if(!t||t.schemaVersion!==pe||!t.state||typeof t.state.gridSize!="number"||!Array.isArray(t.state.grid))return null;const r={...z({seed:t.state.seed??9092026}),...we(t.state)},o={...me,...t.bestRecord??{}};return{state:r,bestRecord:o}}catch{return null}}function be(e,t){return{bestWaveReached:Math.max(t.bestWaveReached,e.wave),bestQuotaProgress:Math.max(t.bestQuotaProgress,e.quotaProgress),bestCreditsEarned:Math.max(t.bestCreditsEarned,e.stats.totalCreditsEarned),campaignsWon:t.campaignsWon+(e.status==="victory"&&t.campaignsWon===0?1:0)}}function N(e,t=x.STORAGE_KEY){try{if(typeof window>"u"||!window.localStorage)return!1;const n=fe(t)?.bestRecord??me,r=be(e,n),o=Ce(e,r);return window.localStorage.setItem(t,o),!0}catch{return!1}}function fe(e=x.STORAGE_KEY){try{if(typeof window>"u"||!window.localStorage)return null;const t=window.localStorage.getItem(e);return t?Ee(t):null}catch{return null}}function _e(e=x.STORAGE_KEY){try{if(typeof window>"u"||!window.localStorage)return;window.localStorage.removeItem(e)}catch{}}function Fe(e,t){const n=new qe,r=t?.initialSeed===void 0?fe():null;let o=r?r.state:z({seed:t?.initialSeed??9092026}),s="miner",p="E",l=null,b=!1,i=!!t?.debug,h=0;e.innerHTML="";const c=document.createElement("div");c.className="bb-root",c.innerHTML=`
    <style>
      .bb-root {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #0b0f19;
        color: #e2e8f0;
        min-height: 100%;
        padding: 12px;
        box-sizing: border-box;
        user-select: none;
      }
      .bb-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 12px;
      }
      .bb-title-wrap h1 {
        margin: 0;
        font-size: 1.2rem;
        letter-spacing: 0.04em;
        color: #38bdf8;
      }
      .bb-title-wrap p {
        margin: 2px 0 0;
        font-size: 0.78rem;
        color: #94a3b8;
      }
      .bb-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .bb-metric {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px 10px;
        min-width: 92px;
      }
      .bb-metric-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        color: #94a3b8;
      }
      .bb-metric-value {
        font-size: 1rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .bb-layout {
        display: grid;
        grid-template-columns: minmax(280px, 540px) minmax(260px, 1fr);
        gap: 14px;
        align-items: start;
      }
      @media (max-width: 860px) {
        .bb-layout {
          grid-template-columns: 1fr;
        }
      }
      .bb-canvas-card {
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .bb-canvas {
        width: 100%;
        max-width: 516px;
        aspect-ratio: 1 / 1;
        background: #090d16;
        border: 2px solid #334155;
        border-radius: 8px;
        cursor: crosshair;
        touch-action: none;
      }
      .bb-event-banner {
        width: 100%;
        margin-top: 8px;
        padding: 7px 10px;
        background: #0f172a;
        border-left: 3px solid #38bdf8;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #bae6fd;
        box-sizing: border-box;
      }
      .bb-side {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bb-panel {
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .bb-panel h2 {
        margin: 0 0 8px;
        font-size: 0.86rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #38bdf8;
      }
      .bb-toolbar-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
        gap: 6px;
      }
      .bb-tool-btn {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 7px;
        color: #f1f5f9;
        padding: 7px 8px;
        text-align: left;
        cursor: pointer;
        font-size: 0.76rem;
        transition: border-color 0.15s, background 0.15s;
      }
      .bb-tool-btn:hover:not(:disabled) {
        border-color: #38bdf8;
      }
      .bb-tool-btn.active {
        background: #0c4a6e;
        border-color: #38bdf8;
        box-shadow: 0 0 0 1px #38bdf8 inset;
      }
      .bb-tool-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }
      .bb-action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .bb-btn {
        background: #1e293b;
        border: 1px solid #475569;
        color: #f8fafc;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
      }
      .bb-btn.primary {
        background: #0284c7;
        border-color: #38bdf8;
      }
      .bb-btn.warn {
        background: #b45309;
        border-color: #f59e0b;
      }
      .bb-tech-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.76rem;
      }
      .bb-tech-item {
        padding: 5px 8px;
        border-radius: 6px;
        background: #0f172a;
        border: 1px solid #1e293b;
      }
      .bb-tech-item.unlocked {
        border-color: #10b981;
        color: #a7f3d0;
      }
      .bb-diag-box {
        font-size: 0.76rem;
        line-height: 1.45;
        color: #cbd5e1;
      }
      .bb-badge-jam {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        background: #7f1d1d;
        color: #fecaca;
        font-weight: 700;
        font-size: 0.7rem;
      }
    </style>

    <div class="bb-header">
      <div class="bb-title-wrap">
        <h1>BELT &amp; BOLT // INDUSTRIAL LOGISTICS DEFENSE</h1>
        <p>Route Mined Ore to Central Core (Credits + Tech Quota) OR Perimeter Turrets (Wave Ammo)</p>
      </div>
      <div class="bb-metrics">
        <div class="bb-metric">
          <div class="bb-metric-label">Core Hull</div>
          <div class="bb-metric-value" data-bb="core-hp">500 / 500</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Credits</div>
          <div class="bb-metric-value" data-bb="credits">150</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Core Quota</div>
          <div class="bb-metric-value" data-bb="quota">0 / 15</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Wave</div>
          <div class="bb-metric-value" data-bb="wave">1 / 30</div>
        </div>
      </div>
    </div>

    <div class="bb-layout">
      <div class="bb-canvas-card">
        <canvas class="bb-canvas" width="528" height="528"></canvas>
        <div class="bb-event-banner" data-bb="event-banner">Command Core online.</div>
      </div>

      <div class="bb-side">
        <div class="bb-panel">
          <h2>Build Toolbar ([1..0] Select, [R] Rotate: <span data-bb="dir-label">E</span>, [X] Demolish)</h2>
          <div class="bb-toolbar-grid" data-bb="toolbar"></div>
          <div class="bb-action-row">
            <button type="button" class="bb-btn" data-bb="btn-rotate">[R] Rotate Dir (E)</button>
            <button type="button" class="bb-btn" data-bb="btn-demolish">[X] Demolish (75% Refund)</button>
            <button type="button" class="bb-btn primary" data-bb="btn-wave">[Space] Launch Wave</button>
            <button type="button" class="bb-btn warn" data-bb="btn-blueprint">Starter Blueprint</button>
            <button type="button" class="bb-btn" data-bb="btn-pause">[P] Pause</button>
            <button type="button" class="bb-btn" data-bb="btn-reset">Reset Factory</button>
          </div>
        </div>

        <div class="bb-panel">
          <h2>Bottleneck &amp; Tile Diagnostic Inspector</h2>
          <div class="bb-diag-box" data-bb="inspector">Hover or click any tile on the 12x12 grid to inspect flow, backpressure, or splitter ratios.</div>
        </div>

        <div class="bb-panel">
          <h2>Tech Tree Unlocks (Every 3 Waves) &amp; Shape Grammar</h2>
          <div class="bb-tech-list" data-bb="tech-list"></div>
        </div>

        <div class="bb-panel" data-bb="debug-panel" style="display: none;">
          <h2>Engineering Debug &amp; Telemetry ([D])</h2>
          <div class="bb-action-row">
            <button type="button" class="bb-btn" data-bb="dbg-credits">+250 Credits</button>
            <button type="button" class="bb-btn" data-bb="dbg-unlock">Unlock All Tech</button>
            <button type="button" class="bb-btn" data-bb="dbg-step">Step 1 Tick</button>
            <button type="button" class="bb-btn" data-bb="dbg-wave12">Jump Wave 12</button>
            <button type="button" class="bb-btn" data-bb="dbg-wave30">Jump Wave 30</button>
          </div>
        </div>
      </div>
    </div>
  `,e.appendChild(c);const f=c.querySelector(".bb-canvas"),a=typeof navigator<"u"&&/jsdom/i.test(navigator.userAgent)?null:f.getContext("2d"),w=c.querySelector('[data-bb="core-hp"]'),V=c.querySelector('[data-bb="credits"]'),Re=c.querySelector('[data-bb="quota"]'),Ie=c.querySelector('[data-bb="wave"]'),Be=c.querySelector('[data-bb="event-banner"]'),Pe=c.querySelector('[data-bb="dir-label"]'),ge=c.querySelector('[data-bb="toolbar"]'),Le=c.querySelector('[data-bb="inspector"]'),De=c.querySelector('[data-bb="tech-list"]'),We=c.querySelector('[data-bb="debug-panel"]'),ye=c.querySelector('[data-bb="btn-rotate"]'),Z=c.querySelector('[data-bb="btn-demolish"]'),Y=c.querySelector('[data-bb="btn-wave"]'),Oe=c.querySelector('[data-bb="btn-blueprint"]'),ee=c.querySelector('[data-bb="btn-pause"]'),He=c.querySelector('[data-bb="btn-reset"]');function M(){ge.innerHTML="";for(const d of ne){const g=_[d],u=j(o,d),y=document.createElement("button");y.type="button",y.className=`bb-tool-btn${s===d?" active":""}`,y.disabled=!u;const k=u?`${g.cost}c`:`Wave ${g.unlockWave}`;y.innerHTML=`
        <div><strong>[${g.hotkey}] ${g.shortLabel}</strong> <span style="float:right;color:#38bdf8">${k}</span></div>
        <div style="font-size:0.68rem;color:#94a3b8;margin-top:2px;">${g.name}</div>
      `,y.addEventListener("click",()=>{u&&(s=d,Z.classList.remove("active"),M())}),ge.appendChild(y)}Z.classList.toggle("active",s==="demolish")}function D(){De.innerHTML=X.map(d=>{const g=o.unlockedTechWaves.includes(d.wave);return`
        <div class="bb-tech-item ${g?"unlocked":""}">
          <strong>${g?"UNLOCKED":`LOCKED (Wave ${d.wave})`} — ${d.title}</strong>
          <div style="color:#94a3b8;margin-top:2px;">${d.description}</div>
        </div>
      `}).join("")}function C(){w.textContent=`${o.coreHp} / ${o.coreMaxHp}`,w.style.color=o.coreHp<=150?"#f87171":"#f8fafc",V.textContent=`${o.credits}`;const d=x.QUOTA_MILESTONES.find(m=>o.quotaProgress<m)??x.QUOTA_MILESTONES[x.QUOTA_MILESTONES.length-1];Re.textContent=`${o.quotaProgress} / ${d}`,Ie.textContent=o.status==="victory"?"VICTORY (30/30)":o.status==="defeat"?`DEFEATED (W${o.wave})`:`${o.wave} / ${x.CAMPAIGN_MAX_WAVE}`,Be.textContent=o.lastEventMessage,Pe.textContent=p,ye.textContent=`[R] Rotate Dir (${p})`;const g=G(o.wave);o.status==="victory"?Y.textContent="Enter Endless Overdrive":o.waveActive?Y.textContent=`Wave ${o.wave} Active (${o.enemies.length+o.queuedSpawns.length} hostiles)`:Y.textContent=`[Space] Launch Wave ${o.wave} (+${g.earlyLaunchBonus}c)`;const u=ke(o);let y="";if(l){const m=E(o,l.x,l.y);if(m){const S=_[m.block],I=m.item?`${O[m.item.type].name} (${O[m.item.type].code})`:"None",A=m.vein==="none"?"Deck Steel":m.vein.replace("_"," ").toUpperCase(),B=S.isTurret?` | Ammo: <strong>${m.ammoCount}/${m.maxAmmo}</strong> (${m.loadedAmmoType??"Empty"})`:m.block==="splitter"?` | Ratio: <strong>${m.splitterRatio}</strong> (Click splitter again to cycle)`:m.block==="smelter"||m.block==="silo"?` | Buffer: <strong>${m.inputBuffer.length}</strong> items`:"";y=`
          <div style="margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #1e293b;">
            <strong>Tile (${m.x}, ${m.y})</strong> — ${S.name} [Dir: ${m.direction}] | Vein: ${A} | Item: ${I}${B}
            ${m.congested?'<span class="bb-badge-jam">BACKPRESSURE JAM</span>':""}
          </div>
        `}}const k=u.congestedTiles.length===0?'<span style="color:#34d399;">0 Congested Belts (Smooth Flow)</span>':`<span class="bb-badge-jam">${u.congestedTiles.length} Congested Tile(s)</span> — ${u.congestedTiles.slice(0,2).map(m=>`(${m.x},${m.y}) ${m.reason}`).join("; ")}`,v=u.dryTurrets.length===0?'<span style="color:#34d399;">All Turrets Supplied</span>':`<span style="color:#fbbf24;font-weight:700;">${u.dryTurrets.length} Dry Turret(s) Need Belt Ammo!</span>`;Le.innerHTML=`
      ${y}
      <div><strong>Flow Diagnostics:</strong> ${k} | ${v}</div>
      <div style="margin-top:4px;color:#94a3b8;">
        Core Deliveries: <strong>${o.stats.itemsDeliveredToCore}</strong> (${u.coreThroughputPerMin}/min) |
        Refined Shapes: <strong>${o.stats.itemsRefined}</strong> |
        Enemies Destroyed: <strong>${o.stats.enemiesDestroyed}</strong>
      </div>
    `,We.style.display=i?"block":"none"}function te(d,g,u,y,k){const v=O[g];if(d.save(),d.fillStyle=v.color,d.strokeStyle=v.strokeColor,d.lineWidth=1.5,v.shapeKind==="circle")d.beginPath(),d.arc(u,y,k,0,Math.PI*2),d.fill(),d.stroke();else if(v.shapeKind==="square")d.beginPath(),d.rect(u-k,y-k,k*2,k*2),d.fill(),d.stroke();else if(v.shapeKind==="star"){d.beginPath();for(let m=0;m<5;m++){const S=m*2*Math.PI/5-Math.PI/2,I=S+Math.PI/5,A=u+Math.cos(S)*(k*1.15),B=y+Math.sin(S)*(k*1.15),W=u+Math.cos(I)*(k*.5),Q=y+Math.sin(I)*(k*.5);m===0?d.moveTo(A,B):d.lineTo(A,B),d.lineTo(W,Q)}d.closePath(),d.fill(),d.stroke()}else if(v.shapeKind==="wedge")d.beginPath(),d.arc(u,y,k*1.1,-Math.PI*.6,Math.PI*.6),d.closePath(),d.fill(),d.stroke();else{d.beginPath();for(let m=0;m<6;m++){const S=m*Math.PI/3,I=u+Math.cos(S)*(k*1.15),A=y+Math.sin(S)*(k*1.15);m===0?d.moveTo(I,A):d.lineTo(I,A)}d.closePath(),d.fill(),d.stroke()}d.restore()}function R(){if(!a)return;const d=f.width,g=f.height,u=d/o.gridSize;h=(h+.08)%1,a.clearRect(0,0,d,g);for(let y=0;y<o.gridSize;y++)for(let k=0;k<o.gridSize;k++){const v=o.grid[y][k],m=k*u,S=y*u,I=m+u/2,A=S+u/2;if(a.fillStyle=(k+y)%2===0?"#0f172a":"#111827",a.fillRect(m,S,u,u),a.strokeStyle="#1e293b",a.lineWidth=1,a.strokeRect(m,S,u,u),v.vein!=="none"){const B=v.vein==="copper_vein"?"CuCircle":v.vein==="iron_vein"?"FeSquare":"AuStar";a.save(),a.globalAlpha=v.block==="empty"?.78:.32,te(a,B,m+u*.3,S+u*.32,4.5),te(a,B,m+u*.68,S+u*.65,4.5),a.restore()}if(v.block!=="empty"){const B=_[v.block];if(a.fillStyle=B.color,a.fillRect(m+3,S+3,u-6,u-6),a.strokeStyle=v.congested?"#ef4444":B.accentColor,a.lineWidth=v.congested?2.5:1.5,a.strokeRect(m+3,S+3,u-6,u-6),B.rotatable){const W=L[v.direction];a.fillStyle=B.accentColor,a.beginPath(),a.arc(I+W.dx*(u*.28),A+W.dy*(u*.28),3.5,0,Math.PI*2),a.fill()}if(a.fillStyle="#f8fafc",a.font="bold 9px Inter, sans-serif",a.textAlign="center",a.fillText(B.shortLabel,I,S+13),B.isTurret){const W=v.maxAmmo>0?v.ammoCount/v.maxAmmo:0;a.fillStyle="#090d16",a.fillRect(m+6,S+u-10,u-12,5),a.fillStyle=W>0?"#22c55e":"#ef4444",a.fillRect(m+6,S+u-10,(u-12)*W,5),v.ammoCount===0&&(a.fillStyle="#fca5a5",a.font="bold 8px Inter, sans-serif",a.fillText("NO AMMO",I,A+5))}if(v.item){const W=L[v.direction],Q=v.congested?0:(h-.5)*6;te(a,v.item.type,I+W.dx*Q,A+4+W.dy*Q,6.5)}}}if(l){const y=l.x*u,k=l.y*u;a.strokeStyle="#38bdf8",a.lineWidth=2,a.strokeRect(y+1,k+1,u-2,u-2);const v=E(o,l.x,l.y),m=v&&_[v.block].isTurret?v.block:s!=="demolish"&&_[s].isTurret?s:null;if(m){const S=(_[m].turretRange??3.8)*u;a.save(),a.strokeStyle="rgba(56, 189, 248, 0.45)",a.fillStyle="rgba(56, 189, 248, 0.08)",a.beginPath(),a.arc(y+u/2,k+u/2,S,0,Math.PI*2),a.fill(),a.stroke(),a.restore()}}for(const y of o.activeShots)a.save(),a.strokeStyle=y.color,a.lineWidth=2.5,a.beginPath(),a.moveTo((y.fromX+.5)*u,(y.fromY+.5)*u),a.lineTo((y.toX+.5)*u,(y.toY+.5)*u),a.stroke(),a.restore();for(const y of o.enemies){const k=ce[y.type],v=(y.x+.5)*u,m=(y.y+.5)*u,S=u*k.radiusRatio;a.save(),a.fillStyle=k.color,a.strokeStyle=y.isShielded?"#38bdf8":"#fecaca",a.lineWidth=y.isBoss?3:1.5,a.beginPath(),a.arc(v,m,S,0,Math.PI*2),a.fill(),a.stroke();const I=Math.max(0,y.hp/y.maxHp),A=u*.75;a.fillStyle="#090d16",a.fillRect(v-A/2,m-S-7,A,4),a.fillStyle=y.isBoss?"#f43f5e":"#22c55e",a.fillRect(v-A/2,m-S-7,A*I,4),a.restore()}}function oe(d){const g=f.getBoundingClientRect();if(g.width<=0||g.height<=0)return null;const u=d.clientX-g.left,y=d.clientY-g.top,k=Math.floor(u/g.width*o.gridSize),v=Math.floor(y/g.height*o.gridSize);return k<0||v<0||k>=o.gridSize||v>=o.gridSize?null:{x:k,y:v}}f.addEventListener("mousemove",d=>{l=oe(d),C(),R()}),f.addEventListener("click",d=>{const g=oe(d);if(!g)return;const u=E(o,g.x,g.y);s==="demolish"?P(o,{type:"demolish",x:g.x,y:g.y}).ok&&n.playDemolish():u&&u.block==="splitter"&&s==="splitter"?(P(o,{type:"toggle_splitter_ratio",x:g.x,y:g.y}),n.playPlaceClank()):P(o,{type:"place",x:g.x,y:g.y,blockType:s,direction:p,respectTechLock:!0}).ok&&n.playPlaceClank(),N(o),M(),C(),R()}),f.addEventListener("contextmenu",d=>{d.preventDefault();const g=oe(d);if(!g)return;P(o,{type:"demolish",x:g.x,y:g.y}).ok&&(n.playDemolish(),N(o),C(),R())}),ye.addEventListener("click",()=>{p=F(p),l&&P(o,{type:"rotate",x:l.x,y:l.y}),C(),R()}),Z.addEventListener("click",()=>{s=s==="demolish"?"miner":"demolish",M()}),Y.addEventListener("click",()=>{if(o.status==="victory"&&(o.endlessMode=!0,o.status="playing",o.wave+=1),!o.waveActive){const d=G(o.wave);le(o,{earlyBonus:!0}),n.playWaveKlaxon(d.isBossWave),M(),D(),C(),R()}}),Oe.addEventListener("click",()=>{Se(o),n.playPlaceClank(),N(o),C(),R()}),ee.addEventListener("click",()=>{b=!b,ee.textContent=b?"[P] Resume":"[P] Pause"}),He.addEventListener("click",()=>{_e(),o=z({seed:o.seed}),M(),D(),C(),R()}),c.querySelector('[data-bb="dbg-credits"]')?.addEventListener("click",()=>{o.credits+=250,C()}),c.querySelector('[data-bb="dbg-unlock"]')?.addEventListener("click",()=>{q(o,12),M(),D(),C()}),c.querySelector('[data-bb="dbg-step"]')?.addEventListener("click",()=>{ae(o),M(),D(),C(),R()}),c.querySelector('[data-bb="dbg-wave12"]')?.addEventListener("click",()=>{o.wave=12,q(o,12),M(),D(),C()}),c.querySelector('[data-bb="dbg-wave30"]')?.addEventListener("click",()=>{o.wave=30,q(o,30),M(),D(),C()});const he=d=>{if(d.target instanceof HTMLInputElement||d.target instanceof HTMLTextAreaElement)return;const g=d.key.toLowerCase();if(g==="r")p=F(p),l&&P(o,{type:"rotate",x:l.x,y:l.y}),C(),R();else if(g==="x")l?P(o,{type:"demolish",x:l.x,y:l.y}):s=s==="demolish"?"miner":"demolish",M(),C(),R();else if(g===" ")d.preventDefault(),!o.waveActive&&o.status==="playing"&&(le(o,{earlyBonus:!0}),M(),D(),C(),R());else if(g==="p")b=!b,ee.textContent=b?"[P] Resume":"[P] Pause";else if(g==="d")i=!i,C();else for(const u of ne)if(_[u].hotkey===g&&j(o,u)){s=u,M();break}};window.addEventListener("keydown",he);const $e=window.setInterval(()=>{if(b||o.status!=="playing")return;const d=o.stats.shotsFired,g=o.stats.itemsRefined,u=o.unlockedBlocks.length;ae(o),o.stats.shotsFired>d&&n.playTurretPulse(),o.stats.itemsRefined>g&&n.playSmelterHiss(),o.unlockedBlocks.length>u&&(M(),D()),o.tick%10===0&&N(o),C(),R()},x.TICK_INTERVAL_MS);return M(),D(),C(),R(),{destroy(){window.clearInterval($e),window.removeEventListener("keydown",he),n.destroy(),e.innerHTML=""},getState(){return o},restartWithSeed(d){o=z({seed:d}),M(),D(),C(),R()},toggleDebug(d){i=d!==void 0?d:!i,C()}}}const Ae={id:"09-belt-and-bolt",number:9,title:"Belt & Bolt",subtitle:"Geometric Ore Conveyor Logistics & Perimeter Turret Wave Defense",genre:"Factory Automation + Tower Defense (Mindustry + shapez)",primaryReference:"Mindustry",supportingReference:"shapez",oneSentenceLoop:"Place Miners, Conveyors, Splitters, and Alloy Smelters on a 12x12 grid so mined geometric ore physically travels along belts to either feed Perimeter Defense Turrets or deliver into the Central Command Core across a 30-wave campaign.",shortGoal:"Survive Wave 10 and complete the first 3 Tech Unlocks (Waves 3, 6, 9).",longGoal:"Survive all 30 Waves (including Siege Crawler, Shielded Dreadnought, and Apex Goliath bosses) and unlock Endless Overdrive Factory Mode.",controlsSummary:"Click/Tap grid to place block | [1..0] Select Block | [R] Rotate Direction | [X] Right-Click Demolish | [Space] Launch Wave Early | [P] Pause | [D] Debug",accentColor:"#38bdf8"};function Me(e,t){const n=Fe(e,t);return{destroy(){n.destroy()},getStateSnapshot(){return n.getState()},restartWithSeed(r){n.restartWithSeed(r)},toggleDebug(r){n.toggleDebug(r)}}}const Ge={metadata:Ae,mountGame:Me},Ke=Object.freeze(Object.defineProperty({__proto__:null,BLOCKS:_,BUILDABLE_BLOCK_ORDER:ne,CONFIG:x,DIRECTION_DELTAS:L,DIRECTION_ORDER:U,ENEMY_TYPES:ce,ITEMS:O,SAVE_SCHEMA_VERSION:pe,TECH_TREE_UNLOCKS:X,VEIN_TO_ITEM:ve,WAVE_TABLE:ie,applyBuildCommand:P,buildWaveTable:xe,canTileAcceptItem:H,clearSavedGame:_e,computeUpdatedBestRecord:be,createEmptyTile:K,createInitialState:z,default:Ge,deployStarterBlueprint:Se,deserializeGameState:Ee,diagnoseBottlenecks:ke,getTile:E,getWaveDefinition:G,isBlockUnlocked:j,loadGameFromStorage:fe,metadata:Ae,mountGame:Me,mulberry32:de,oppositeDirection:Ve,rotateDirectionCW:F,saveGameToStorage:N,serializeGameState:Ce,spawnEnemy:ue,stepFactoryTick:ae,stepWaveCombat:Te,triggerNextWave:le,unlockTechForWave:q},Symbol.toStringTag,{value:"Module"}));export{Ke as g,Me as m};
