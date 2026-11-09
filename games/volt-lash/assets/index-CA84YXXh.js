var ee=Object.defineProperty;var ie=(r,i,a)=>i in r?ee(r,i,{enumerable:!0,configurable:!0,writable:!0,value:a}):r[i]=a;var p=(r,i,a)=>ie(r,typeof i!="symbol"?i+"":i,a);(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&e(o)}).observe(document,{childList:!0,subtree:!0});function a(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(t){if(t.ep)return;t.ep=!0;const n=a(t);fetch(t.href,n)}})();const $=[261.63,311.13,349.23,392,466.16,523.25,622.25,698.46,783.99,932.33,1046.5,1244.51];function H(r){const i=Math.max(0,Math.min($.length-1,Math.floor(r)));return $[i]}class re{constructor(){p(this,"ctx",null);p(this,"muted",!1)}isMuted(){return this.muted}setMuted(i){this.muted=i}toggleMute(){return this.muted=!this.muted,this.muted}ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const i=window.AudioContext||window.webkitAudioContext;if(i)try{this.ctx=new i}catch{return null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playDash(){const i=this.ensureContext();if(!i)return;const a=i.currentTime,e=i.createOscillator(),t=i.createGain();e.type="sawtooth",e.frequency.setValueAtTime(190,a),e.frequency.exponentialRampToValueAtTime(640,a+.09),t.gain.setValueAtTime(.14,a),t.gain.exponentialRampToValueAtTime(.001,a+.11),e.connect(t),t.connect(i.destination),e.start(a),e.stop(a+.12)}playParry(i=1){const a=this.ensureContext();if(!a)return;const e=a.currentTime,t=H(i),n=a.createOscillator(),o=a.createOscillator(),l=a.createGain();n.type="triangle",n.frequency.setValueAtTime(t,e),n.frequency.exponentialRampToValueAtTime(t*1.5,e+.14),o.type="sine",o.frequency.setValueAtTime(t*2,e),o.frequency.exponentialRampToValueAtTime(t*2.5,e+.16),l.gain.setValueAtTime(.22,e),l.gain.exponentialRampToValueAtTime(.001,e+.17),n.connect(l),o.connect(l),l.connect(a.destination),n.start(e),o.start(e),n.stop(e+.18),o.stop(e+.18)}playGraze(i=1){const a=this.ensureContext();if(!a)return;const e=a.currentTime,t=H(i),n=a.createOscillator(),o=a.createGain();n.type="sine",n.frequency.setValueAtTime(t,e),n.frequency.exponentialRampToValueAtTime(t*1.25,e+.07),o.gain.setValueAtTime(.11,e),o.gain.exponentialRampToValueAtTime(.001,e+.08),n.connect(o),o.connect(a.destination),n.start(e),n.stop(e+.085)}playHit(i=1){const a=this.ensureContext();if(!a)return;const e=a.currentTime,t=H(i)*.5,n=a.createOscillator(),o=a.createGain();n.type="square",n.frequency.setValueAtTime(t,e),n.frequency.exponentialRampToValueAtTime(75,e+.055),o.gain.setValueAtTime(.09,e),o.gain.exponentialRampToValueAtTime(.001,e+.06),n.connect(o),o.connect(a.destination),n.start(e),n.stop(e+.065)}playKill(i=1){const a=this.ensureContext();if(!a)return;const e=a.currentTime,t=H(i),n=a.createOscillator(),o=a.createGain();n.type="sine",n.frequency.setValueAtTime(140,e),n.frequency.exponentialRampToValueAtTime(36,e+.18),o.gain.setValueAtTime(.26,e),o.gain.exponentialRampToValueAtTime(.001,e+.19),n.connect(o),o.connect(a.destination),n.start(e),n.stop(e+.2);const l=a.createOscillator(),d=a.createGain();l.type="triangle",l.frequency.setValueAtTime(t,e),l.frequency.setValueAtTime(t*1.25,e+.05),d.gain.setValueAtTime(.16,e),d.gain.exponentialRampToValueAtTime(.001,e+.2),l.connect(d),d.connect(a.destination),l.start(e),l.stop(e+.21)}playPlayerHurt(){const i=this.ensureContext();if(!i)return;const a=i.currentTime,e=i.createOscillator(),t=i.createGain();e.type="sawtooth",e.frequency.setValueAtTime(155,a),e.frequency.linearRampToValueAtTime(48,a+.24),t.gain.setValueAtTime(.24,a),t.gain.exponentialRampToValueAtTime(.001,a+.26),e.connect(t),t.connect(i.destination),e.start(a),e.stop(a+.27)}playBankOrOverdrive(i){const a=this.ensureContext();if(!a)return;const e=a.currentTime;(i?[523.25,622.25,783.99,1046.5]:[392,466.16,523.25]).forEach((n,o)=>{const l=a.createOscillator(),d=a.createGain();l.type=i?"sawtooth":"triangle";const f=e+o*.04;l.frequency.setValueAtTime(n,f),l.frequency.exponentialRampToValueAtTime(n*1.12,f+.22),d.gain.setValueAtTime(.14,f),d.gain.exponentialRampToValueAtTime(.001,f+.25),l.connect(d),d.connect(a.destination),l.start(f),l.stop(f+.26)})}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const D=[{id:"tether_lightning",name:"High-Voltage Tether",tag:"GEOMETRY // TETHER",icon:"⚡",color:"#38bdf8",description:"Dashing stretches an overcharged lightning tether for 3.2s that zaps enemies every 0.15s and vaporizes enemy bullets on contact.",synergyHint:"Synergizes with Triangle Cage Protocol & Boomerang Anchor"},{id:"parry_shards",name:"Prism Shatter-Parry",tag:"DEFLECTION // SPLIT",icon:"💠",color:"#f472b6",description:"Every parried projectile splits into 3 homing plasma shards that seek out and pierce the nearest threats.",synergyHint:"Triples parry damage output and builds Combo 3x faster"},{id:"kill_implosion",name:"Singularity Implosion",tag:"CHAIN // VORTEX",icon:"🌀",color:"#c084fc",description:"Kills trigger a gravity implosion vortex that drags nearby enemies into your tether lines and vacuums XP shards.",synergyHint:"Clusters enemies tightly for multi-kill Tether clotheslines"},{id:"triangle_cage",name:"Triangle Cage Protocol",tag:"GEOMETRY // ENCLOSURE",icon:"🔺",color:"#fbbf24",description:"Having 2+ active Dash Tethers links their anchors into a closed plasma polygon, incinerating all enemies inside the geometry.",synergyHint:"Chain dashes to trap bosses and elite packs inside plasma triangles"},{id:"graze_halo",name:"Tesla Graze Halo",tag:"RISK // COUNTER-ARC",icon:"🧲",color:"#34d399",description:"Grazing enemy projectiles fires an instant counter-lightning arc at the attacker and grants +60% Volt-Surge gain.",synergyHint:"Makes close-calls lethal and accelerates Redline Overdrive"},{id:"anchor_nova",name:"Anchor Super-Nova",tag:"BLAST // DETONATION",icon:"💥",color:"#fb7185",description:"Dash anchors detonate in a shockwave when spawned or when you Bank Surge [E], deflecting nearby bullets into homing bolts.",synergyHint:"Turns every dash start point and Surge Bank into a bomb"},{id:"redline_trail",name:"Redline Afterburner",tag:"OVERDRIVE // WAKE",icon:"🔥",color:"#f97316",description:"Above 40% Volt-Surge, leave a searing plasma wake behind you and launch 2 homing sidewinder missiles on every Dash.",synergyHint:"Rewards riding high Surge with relentless passive firepower"},{id:"mirror_orbitals",name:"Mirror Aegis Blades",tag:"ORBITAL // PARRY",icon:"🛡️",color:"#2dd4bf",description:"Spawns 2 orbiting reflector blades around your hull that automatically parry enemy bullets and slice close enemies.",synergyHint:"Triggers Prism Shatter-Parry automatically on orbital deflections"}],w=1200,T=720,A=16.6667;function N(r){let i=r.rngState+=1831565813;return i=Math.imul(i^i>>>15,i|1),i^=i+Math.imul(i^i>>>7,i|61),r.rngState=i>>>0,((i^i>>>14)>>>0)/4294967296}function z(r,i,a){return i+N(r)*(a-i)}function E(r,i){return r.upgrades.includes(i)}function Y(r,i,a){const e=Math.min(4,Math.floor(r/3)*.5),t=i>=80?2.5:i>=50?1.25:i>=25?.5:0,n=a>0?1.5:0;return Number(Math.min(8,1+e+t+n).toFixed(2))}function C(r){return r.surge>=80&&r.player.overdriveMs<=0}function G(r=20261108){const i=(Math.abs(Math.floor(r))||20261108)>>>0,a={seed:i,rngState:i,status:"PLAYING",arenaWidth:w,arenaHeight:T,elapsedMs:0,wave:1,maxWaves:5,waveTimerMs:0,waveDurationMs:42e3,spawnTimerMs:600,hitStopMs:0,surge:0,combo:0,peakCombo:0,multiplier:1,peakMultiplier:1,comboDecayMs:0,maxComboDecayMs:4200,score:0,xp:0,xpToNextDraft:120,level:1,totalParries:0,totalGrazes:0,totalKills:0,totalTetherKills:0,totalBanks:0,killedBy:"",hasMoved:!1,hasDashed:!1,tutorialPromptAlpha:1,nextEntityId:1,player:{x:w*.5,y:T*.55,vx:0,vy:0,aimX:w*.5,aimY:T*.25,radius:13,grazeRadius:42,hp:100,maxHp:100,dashCooldownMs:0,maxDashCooldownMs:680,dashActiveMs:0,parryWindowMs:0,invulnMs:0,overdriveMs:0,fireCooldownMs:0,orbitalAngle:0,trail:[]},enemies:[],projectiles:[],tethers:[],hazardZones:[],wakeNodes:[],vortices:[],shards:[],upgrades:[],draftChoices:[],events:[]};return q(a,3),a}function ne(r){return JSON.parse(JSON.stringify(r))}function y(r,i,a){return Math.max(i,Math.min(a,r))}function M(r,i,a,e){const t=a-r,n=e-i;return t*t+n*n}function O(r,i,a,e,t,n){const o=M(a,e,t,n);if(o===0)return M(r,i,a,e);let l=((r-a)*(t-a)+(i-e)*(n-e))/o;l=y(l,0,1);const d=a+l*(t-a),f=e+l*(n-e);return M(r,i,d,f)}function ae(r,i,a,e,t,n,o,l){const d=(r-t)*(e-n)-(a-t)*(i-n),f=(r-o)*(n-l)-(t-o)*(i-l),m=(r-a)*(l-e)-(o-a)*(i-e),v=d<0||f<0||m<0,c=d>0||f>0||m>0;return!(v&&c)}function _(r,i,a,e){const t=1+(r.wave-1)*.22;let n="Pulse Drifter",o=Math.round(32*t),l=16,d="#fb7185",f=1100;i==="sniper"?(n="Rail Sniper",o=Math.round(42*t),l=15,d="#f43f5e",f=1600):i==="charger"?(n="Volt Bull",o=Math.round(64*t),l=20,d="#f97316",f=1500):i==="mortar"?(n="Plasma Weaver",o=Math.round(54*t),l=18,d="#a855f7",f=1800):i==="boss"&&(n="ARCHON-V // SINGULARITY CORE",o=950,l=40,d="#ef4444",f=1100);const m={id:r.nextEntityId++,kind:i,name:n,x:a,y:e,vx:0,vy:0,radius:l,hp:o,maxHp:o,color:d,cooldownMs:f,telegraph:{type:"none",timerMs:0,durationMs:0,targetX:a,targetY:e,angle:0,radius:0},dashTimeMs:0,dashVx:0,dashVy:0,bossPhase:1,hitFlashMs:0};return r.enemies.push(m),m}function q(r,i){for(let e=0;e<i;e++){let t=z(r,65,r.arenaWidth-65),n=z(r,65,r.arenaHeight-65);const o=Math.floor(N(r)*4);o===0?n=65:o===1?n=r.arenaHeight-65:o===2?t=65:t=r.arenaWidth-65,M(t,n,r.player.x,r.player.y)<32400&&(t=r.player.x>r.arenaWidth*.5?65:r.arenaWidth-65);const l=N(r);let d="drifter";r.wave===1?d=l<.72?"drifter":"charger":r.wave===2?d=l<.45?"drifter":l<.75?"sniper":"charger":r.wave===3?d=l<.35?"drifter":l<.6?"sniper":l<.82?"charger":"mortar":d=l<.25?"drifter":l<.5?"sniper":l<.75?"charger":"mortar",_(r,d,t,n)}}function X(r){const i=D.map(t=>t.id).filter(t=>!r.upgrades.includes(t)),a=i.length>=3?[...i]:D.map(t=>t.id),e=[];for(;e.length<3&&a.length>0;){const t=Math.floor(N(r)*a.length);e.push(a[t]),a.splice(t,1)}return e}function K(r,i){if(r.status!=="DRAFT_UPGRADE"||r.draftChoices.length===0)return!1;const a=y(i,0,r.draftChoices.length-1),e=r.draftChoices[a];r.upgrades.includes(e)||r.upgrades.push(e);const t=D.find(n=>n.id===e);return r.draftChoices=[],r.status="PLAYING",r.player.invulnMs=Math.max(r.player.invulnMs,900),r.player.hp=Math.min(r.player.maxHp,r.player.hp+12),r.events.push({type:"UPGRADE_PICKED",x:r.player.x,y:r.player.y,label:t?`${t.icon} ${t.name}`:e,color:(t==null?void 0:t.color)??"#38bdf8"}),!0}function V(r,i,a,e){r.combo+=i,r.combo>r.peakCombo&&(r.peakCombo=r.combo),r.comboDecayMs=r.maxComboDecayMs,r.surge=y(r.surge+a,0,100),r.multiplier=Y(r.combo,r.surge,r.player.overdriveMs),r.multiplier>r.peakMultiplier&&(r.peakMultiplier=r.multiplier),r.score+=Math.round(e*r.multiplier)}function j(r,i,a,e,t,n,o){for(let l=0;l<t;l++){const d=(l-(t-1)*.5)*.42,f=e+d,m=.56;r.projectiles.push({id:r.nextEntityId++,x:i,y:a,vx:Math.cos(f)*m,vy:Math.sin(f)*m,radius:6,damage:n,isPlayerOwned:!0,isParried:!0,isHoming:!0,pierceCount:2,lifeMs:2200,maxLifeMs:2200,color:o,sourceName:"Prism Shard",grazed:!0,trail:[]})}}function I(r,i,a,e){let t=Math.atan2(-i.vy,-i.vx),n=1/0;for(const l of r.enemies){const d=M(i.x,i.y,l.x,l.y);d<n&&(n=d,t=Math.atan2(l.y-i.y,l.x-i.x))}const o=.68;i.isPlayerOwned=!0,i.isParried=!0,i.isHoming=!0,i.vx=Math.cos(t)*o,i.vy=Math.sin(t)*o,i.damage=Math.round(34*r.multiplier),i.radius=8,i.pierceCount=2,i.lifeMs=2400,i.maxLifeMs=2400,i.color="#38bdf8",r.totalParries+=1,r.hitStopMs=Math.max(r.hitStopMs,42),V(r,2,14,75),r.events.push({type:"PARRY",x:i.x,y:i.y,dirX:Math.cos(t),dirY:Math.sin(t),combo:r.combo,label:`PARRY! x${r.multiplier}`,color:"#38bdf8"}),E(r,"parry_shards")&&j(r,i.x,i.y,t,3,22,"#f472b6")}function Z(r,i,a){for(const t of r.enemies)M(i,a,t.x,t.y)<=(125+t.radius)**2&&S(r,t,28,i,a,"Anchor Nova");for(const t of r.projectiles)!t.isPlayerOwned&&M(i,a,t.x,t.y)<=125**2&&I(r,t)}function J(r,i){const a=r.player;if(a.dashCooldownMs>0||r.status!=="PLAYING")return!1;r.hasDashed=!0;let e=i.moveX,t=i.moveY;Math.hypot(e,t)<.1&&(e=i.aimX-a.x,t=i.aimY-a.y);const n=Math.hypot(e,t)||1,o=e/n,l=t/n,d=a.x,f=a.y,m=a.overdriveMs>0?195:165,v=y(d+o*m,28,r.arenaWidth-28),c=y(f+l*m,28,r.arenaHeight-28);a.x=v,a.y=c,a.vx=o*.42,a.vy=l*.42,a.dashCooldownMs=a.overdriveMs>0?340:a.maxDashCooldownMs,a.dashActiveMs=190,a.parryWindowMs=220,a.invulnMs=Math.max(a.invulnMs,240);const s=E(r,"tether_lightning")?3200:1900;r.tethers.push({id:r.nextEntityId++,x1:d,y1:f,x2:v,y2:c,lifeMs:s,maxLifeMs:s,zapTimerMs:0,color:E(r,"tether_lightning")?"#38bdf8":"#22d3ee"}),r.events.push({type:"DASH",x:v,y:c,dirX:o,dirY:l,color:"#22d3ee"});const u=64;for(const h of r.projectiles){if(h.isPlayerOwned)continue;O(h.x,h.y,d,f,v,c)<=(u+h.radius)**2&&I(r,h)}for(let h=r.enemies.length-1;h>=0;h--){const g=r.enemies[h];O(g.x,g.y,d,f,v,c)<=(g.radius+26)**2&&S(r,g,30,v,c,"Lash Dash")}if(E(r,"anchor_nova")&&Z(r,d,f),E(r,"redline_trail")&&r.surge>=40){const h=Math.atan2(l,o);j(r,v,c,h,2,26,"#f97316")}if(E(r,"triangle_cage")&&r.tethers.length>=2){const h=r.tethers[r.tethers.length-2],g=h.x1,x=h.y1,b=d,k=f,P=v,L=c;let B=0;for(let W=r.enemies.length-1;W>=0;W--){const R=r.enemies[W];(ae(R.x,R.y,g,x,b,k,P,L)||O(R.x,R.y,g,x,P,L)<=(R.radius+24)**2)&&(B++,S(r,R,55,(g+b+P)/3,(x+k+L)/3,"Triangle Cage"))}B>0&&(r.hitStopMs=Math.max(r.hitStopMs,48),r.events.push({type:"TRIANGLE_CAGE",x:(g+b+P)/3,y:(x+k+L)/3,amount:B,label:"TRIANGLE CAGE!",color:"#fbbf24"}))}return!0}function Q(r){if(r.status!=="PLAYING"||r.surge<35)return!1;const i=r.player;if(r.totalBanks+=1,r.surge>=100){r.surge=0,i.overdriveMs=4500,i.invulnMs=Math.max(i.invulnMs,1200),i.hp=Math.min(i.maxHp,i.hp+22),i.dashCooldownMs=0,r.hitStopMs=Math.max(r.hitStopMs,60);for(const a of r.projectiles)a.isPlayerOwned||I(r,a,i.x,i.y);for(let a=r.enemies.length-1;a>=0;a--)S(r,r.enemies[a],65,i.x,i.y,"Supernova Overdrive");r.events.push({type:"SUPERNOVA_OVERDRIVE",x:i.x,y:i.y,amount:22,combo:r.combo,label:"⚡ SUPERNOVA OVERDRIVE! +22 HP",color:"#fde047"})}else i.hp=Math.min(i.maxHp,i.hp+30),i.invulnMs=Math.max(i.invulnMs,600),r.surge=0,r.combo=0,r.multiplier=Y(0,0,i.overdriveMs),r.hitStopMs=Math.max(r.hitStopMs,35),r.projectiles=r.projectiles.filter(e=>e.isPlayerOwned||M(i.x,i.y,e.x,e.y)>57600),E(r,"anchor_nova")&&Z(r,i.x,i.y),r.events.push({type:"BANK_HEAL",x:i.x,y:i.y,amount:30,label:"SURGE BANKED! +30 HP",color:"#34d399"});return!0}function S(r,i,a,e,t,n){const o=r.enemies.indexOf(i);if(o===-1)return;const l=1+r.surge/100*.45,d=Math.max(1,Math.round(a*l));i.hp-=d,i.hitFlashMs=110;const f=i.x-e,m=i.y-t,v=Math.hypot(f,m)||1;if(i.kind==="boss"&&i.hp>0){const c=i.hp/i.maxHp,s=c<=.34?3:c<=.67?2:1;s!==i.bossPhase&&(i.bossPhase=s,r.hitStopMs=Math.max(r.hitStopMs,58),r.events.push({type:"BOSS_PHASE",x:i.x,y:i.y,amount:s,label:`ARCHON-V PHASE ${s}!`,color:"#facc15"}))}if(i.hp<=0){r.enemies.splice(o,1),r.totalKills+=1,n.includes("Tether")&&(r.totalTetherKills+=1);const c=i.kind==="boss";r.hitStopMs=Math.max(r.hitStopMs,c?65:32),V(r,c?10:1,c?35:8,c?1500:100);const s=c?12:r.surge>=80?3:r.surge>=50?2:1;for(let u=0;u<s;u++){const h=z(r,0,Math.PI*2),g=z(r,.08,.24);r.shards.push({id:r.nextEntityId++,x:i.x,y:i.y,vx:Math.cos(h)*g,vy:Math.sin(h)*g,value:Math.round(18*(r.surge>=80?1.5:1)),lifeMs:9e3})}E(r,"kill_implosion")&&r.vortices.push({x:i.x,y:i.y,radius:155,lifeMs:1100,maxLifeMs:1100}),r.events.push({type:"KILL_ENEMY",x:i.x,y:i.y,dirX:f/v,dirY:m/v,amount:d,combo:r.combo,label:c?"BOSS OBLITERATED!":`+${Math.round(100*r.multiplier)}`,color:i.color}),c&&(r.status="VICTORY",r.killedBy="VICTORY — ARCHON-V OBLITERATED",r.events.push({type:"GAME_END",x:i.x,y:i.y,label:"VICTORY!",color:"#fde047"}))}else i.kind!=="boss"&&(i.x=y(i.x+f/v*8,i.radius,r.arenaWidth-i.radius),i.y=y(i.y+m/v*8,i.radius,r.arenaHeight-i.radius)),r.events.push({type:"HIT_ENEMY",x:i.x,y:i.y,dirX:f/v,dirY:m/v,amount:d,color:i.color})}function F(r,i,a,e,t){const n=r.player;if(n.invulnMs>0||n.overdriveMs>0||r.status!=="PLAYING")return;const o=C(r),l=o?Math.round(i*1.5):i;n.hp=Math.max(0,n.hp-l),n.invulnMs=650,r.hitStopMs=Math.max(r.hitStopMs,50),r.combo=Math.floor(r.combo*.5),r.surge=Math.max(0,r.surge-25),r.multiplier=Y(r.combo,r.surge,n.overdriveMs);const d=n.x-a,f=n.y-e,m=Math.hypot(d,f)||1;r.events.push({type:"PLAYER_HURT",x:n.x,y:n.y,dirX:d/m,dirY:f/m,amount:l,label:o?`REDLINE HIT! -${l}`:`-${l} HP`,color:"#ef4444"}),n.hp<=0&&(r.status="DEFEAT",r.killedBy=o?`${t} (Caught Redlined at ${Math.round(r.surge+25)}% Surge)`:t,r.events.push({type:"GAME_END",x:n.x,y:n.y,label:"DEFEAT",color:"#ef4444"}))}function te(r,i){const a=r.player;for(let e=r.enemies.length-1;e>=0;e--){const t=r.enemies[e];if(!t)continue;t.hitFlashMs>0&&(t.hitFlashMs=Math.max(0,t.hitFlashMs-i));const n=a.x-t.x,o=a.y-t.y,l=Math.hypot(n,o)||1,d=n/l,f=o/l;if(t.dashTimeMs>0){t.dashTimeMs=Math.max(0,t.dashTimeMs-i),t.x=y(t.x+t.dashVx*i,t.radius,r.arenaWidth-t.radius),t.y=y(t.y+t.dashVy*i,t.radius,r.arenaHeight-t.radius),l<=t.radius+a.radius&&(a.parryWindowMs>0?(S(r,t,45,a.x,a.y,"Dash Counter"),t.dashTimeMs=0):F(r,20,t.x,t.y,`${t.name} — Kinetic Lunge`));continue}if(t.telegraph.type!=="none"){t.telegraph.timerMs-=i,t.telegraph.timerMs<=0&&(oe(r,t),t.telegraph.type="none");continue}const m=t.kind==="boss"?.085:t.kind==="sniper"?l<260?-.07:.08:.11;t.vx=d*m,t.vy=f*m,t.x=y(t.x+t.vx*i,t.radius+12,r.arenaWidth-t.radius-12),t.y=y(t.y+t.vy*i,t.radius+12,r.arenaHeight-t.radius-12),t.cooldownMs-=i,t.cooldownMs<=0&&se(r,t,d,f)}}function se(r,i,a,e){const t=r.player,n=Math.atan2(e,a);if(i.kind==="drifter")i.telegraph={type:"radial_burst",timerMs:520,durationMs:520,targetX:t.x,targetY:t.y,angle:n,radius:36},i.cooldownMs=1550;else if(i.kind==="sniper")i.telegraph={type:"laser_line",timerMs:620,durationMs:620,targetX:t.x,targetY:t.y,angle:n,radius:12},i.cooldownMs=1900;else if(i.kind==="charger")i.telegraph={type:"dash_lane",timerMs:560,durationMs:560,targetX:y(i.x+a*260,40,r.arenaWidth-40),targetY:y(i.y+e*260,40,r.arenaHeight-40),angle:n,radius:i.radius},i.cooldownMs=1800;else if(i.kind==="mortar")r.hazardZones.push({id:r.nextEntityId++,x:y(t.x+t.vx*180,70,r.arenaWidth-70),y:y(t.y+t.vy*180,70,r.arenaHeight-70),radius:72,windupMs:650,maxWindupMs:650,activeMs:220,damage:22,sourceName:`${i.name} — Plasma Mortar Zone`}),i.cooldownMs=2e3;else if(i.kind==="boss")if(i.bossPhase===1)i.telegraph={type:"radial_burst",timerMs:560,durationMs:560,targetX:t.x,targetY:t.y,angle:n,radius:68},i.cooldownMs=1250;else if(i.bossPhase===2){i.telegraph={type:"dash_lane",timerMs:600,durationMs:600,targetX:y(i.x+a*340,60,r.arenaWidth-60),targetY:y(i.y+e*340,60,r.arenaHeight-60),angle:n,radius:i.radius};for(let o=-1;o<=1;o+=2)r.hazardZones.push({id:r.nextEntityId++,x:y(t.x+o*110,80,r.arenaWidth-80),y:y(t.y,80,r.arenaHeight-80),radius:68,windupMs:650,maxWindupMs:650,activeMs:220,damage:24,sourceName:"ARCHON-V — Singularity Mortar"});i.cooldownMs=1350}else i.telegraph={type:"laser_line",timerMs:550,durationMs:550,targetX:t.x,targetY:t.y,angle:n,radius:20},i.cooldownMs=950}function oe(r,i){const a=i.telegraph;if(i.kind==="drifter"){const e=r.wave>=3?3:1;for(let t=0;t<e;t++){const n=a.angle+(t-(e-1)*.5)*.25,o=.31;r.projectiles.push({id:r.nextEntityId++,x:i.x,y:i.y,vx:Math.cos(n)*o,vy:Math.sin(n)*o,radius:7,damage:14,isPlayerOwned:!1,isParried:!1,isHoming:!1,pierceCount:0,lifeMs:3600,maxLifeMs:3600,color:"#fb7185",sourceName:`${i.name} — Pulse Bolt`,grazed:!1,trail:[]})}}else if(i.kind==="sniper")r.projectiles.push({id:r.nextEntityId++,x:i.x,y:i.y,vx:Math.cos(a.angle)*.52,vy:Math.sin(a.angle)*.52,radius:8,damage:22,isPlayerOwned:!1,isParried:!1,isHoming:!1,pierceCount:0,lifeMs:3e3,maxLifeMs:3e3,color:"#f43f5e",sourceName:`${i.name} — High-Velocity Rail Shot`,grazed:!1,trail:[]});else if(i.kind==="charger")i.dashTimeMs=340,i.dashVx=Math.cos(a.angle)*.72,i.dashVy=Math.sin(a.angle)*.72;else if(i.kind==="boss"){if(a.type==="radial_burst")for(let t=0;t<10;t++){const n=a.angle+t*Math.PI*2/10,o=.32;r.projectiles.push({id:r.nextEntityId++,x:i.x,y:i.y,vx:Math.cos(n)*o,vy:Math.sin(n)*o,radius:8,damage:18,isPlayerOwned:!1,isParried:!1,isHoming:!1,pierceCount:0,lifeMs:4200,maxLifeMs:4200,color:"#ef4444",sourceName:"ARCHON-V — Orbital Ring Volley",grazed:!1,trail:[]})}else if(a.type==="dash_lane")i.dashTimeMs=380,i.dashVx=Math.cos(a.angle)*.82,i.dashVy=Math.sin(a.angle)*.82;else if(a.type==="laser_line")for(let e=-2;e<=2;e++){const t=a.angle+e*.16,n=.45;r.projectiles.push({id:r.nextEntityId++,x:i.x,y:i.y,vx:Math.cos(t)*n,vy:Math.sin(t)*n,radius:8,damage:20,isPlayerOwned:!1,isParried:!1,isHoming:!1,pierceCount:0,lifeMs:3600,maxLifeMs:3600,color:"#facc15",sourceName:"ARCHON-V — Singularity Lance",grazed:!1,trail:[]})}}}function le(r,i,a=A){if(r.status==="DRAFT_UPGRADE"){typeof i.draftIndex=="number"&&K(r,i.draftIndex);return}if(r.status!=="PLAYING")return;if(i.dashPressed&&J(r,i),i.bankPressed&&Q(r),r.hitStopMs>0){r.hitStopMs=Math.max(0,r.hitStopMs-a);return}r.elapsedMs+=a;const e=r.player;Number.isFinite(i.aimX)&&Number.isFinite(i.aimY)&&(e.aimX=i.aimX,e.aimY=i.aimY),Math.hypot(i.moveX,i.moveY)>.1&&(r.hasMoved=!0),r.hasMoved&&r.hasDashed&&r.tutorialPromptAlpha>0&&(r.tutorialPromptAlpha=Math.max(0,r.tutorialPromptAlpha-a*.0022)),e.dashCooldownMs=Math.max(0,e.dashCooldownMs-a),e.dashActiveMs=Math.max(0,e.dashActiveMs-a),e.parryWindowMs=Math.max(0,e.parryWindowMs-a),e.invulnMs=Math.max(0,e.invulnMs-a),e.overdriveMs=Math.max(0,e.overdriveMs-a),e.fireCooldownMs=Math.max(0,e.fireCooldownMs-a),e.orbitalAngle=(e.orbitalAngle+a*.0048)%(Math.PI*2),r.combo>0&&(r.comboDecayMs-=a,r.comboDecayMs<=0&&(r.combo=Math.max(0,r.combo-1),r.comboDecayMs=800,r.multiplier=Y(r.combo,r.surge,e.overdriveMs)));const t=Math.hypot(i.moveX,i.moveY),n=t>1?i.moveX/t:i.moveX,o=t>1?i.moveY/t:i.moveY,d=.32*(1+r.surge/100*.28+(e.overdriveMs>0?.25:0));if(e.vx=n*d,e.vy=o*d,e.x=y(e.x+e.vx*a,e.radius+10,r.arenaWidth-e.radius-10),e.y=y(e.y+e.vy*a,e.radius+10,r.arenaHeight-e.radius-10),e.trail.push({x:e.x,y:e.y}),e.trail.length>10&&e.trail.shift(),E(r,"redline_trail")&&r.surge>=40&&r.elapsedMs%64<a&&r.wakeNodes.push({x:e.x,y:e.y,radius:24,lifeMs:1100,maxLifeMs:1100}),e.fireCooldownMs<=0&&r.enemies.length>0){let c=e.aimX,s=e.aimY,u=1/0;for(const b of r.enemies){const k=M(e.x,e.y,b.x,b.y);k<u&&(u=k,c=b.x,s=b.y)}const h=Math.atan2(s-e.y,c-e.x),g=.62;r.projectiles.push({id:r.nextEntityId++,x:e.x+Math.cos(h)*14,y:e.y+Math.sin(h)*14,vx:Math.cos(h)*g,vy:Math.sin(h)*g,radius:5,damage:e.overdriveMs>0?18:11,isPlayerOwned:!0,isParried:!1,isHoming:!1,pierceCount:e.overdriveMs>0?1:0,lifeMs:1500,maxLifeMs:1500,color:e.overdriveMs>0?"#fde047":"#38bdf8",sourceName:"Pulse Cannon",grazed:!0,trail:[]});const x=e.overdriveMs>0?105:Math.max(125,240-r.surge*1.1);e.fireCooldownMs=x}for(let c=r.tethers.length-1;c>=0;c--){const s=r.tethers[c];if(s.lifeMs-=a,s.zapTimerMs-=a,s.lifeMs<=0){r.tethers.splice(c,1);continue}if(s.zapTimerMs<=0){s.zapTimerMs=150;const u=E(r,"tether_lightning")?16:10;for(let h=r.enemies.length-1;h>=0;h--){const g=r.enemies[h];O(g.x,g.y,s.x1,s.y1,s.x2,s.y2)<=(g.radius+14)**2&&S(r,g,u,(s.x1+s.x2)*.5,(s.y1+s.y2)*.5,"Volt Tether")}}if(E(r,"tether_lightning"))for(let u=r.projectiles.length-1;u>=0;u--){const h=r.projectiles[u];h.isPlayerOwned||O(h.x,h.y,s.x1,s.y1,s.x2,s.y2)<=(h.radius+12)**2&&(r.projectiles.splice(u,1),V(r,1,4,25))}}for(let c=r.wakeNodes.length-1;c>=0;c--){const s=r.wakeNodes[c];if(s.lifeMs-=a,s.lifeMs<=0){r.wakeNodes.splice(c,1);continue}if(Math.floor((s.lifeMs+a)/180)!==Math.floor(s.lifeMs/180))for(let u=r.enemies.length-1;u>=0;u--){const h=r.enemies[u];M(s.x,s.y,h.x,h.y)<=(s.radius+h.radius)**2&&S(r,h,9,s.x,s.y,"Redline Wake")}}for(let c=r.vortices.length-1;c>=0;c--){const s=r.vortices[c];if(s.lifeMs-=a,s.lifeMs<=0){r.vortices.splice(c,1);continue}for(const u of r.enemies){if(u.kind==="boss")continue;const h=M(s.x,s.y,u.x,u.y);if(h<=s.radius*s.radius&&h>16){const g=Math.sqrt(h);u.x+=(s.x-u.x)/g*.19*a,u.y+=(s.y-u.y)/g*.19*a}}}for(let c=r.hazardZones.length-1;c>=0;c--){const s=r.hazardZones[c];s.windupMs>0?s.windupMs-=a:(s.activeMs-=a,M(e.x,e.y,s.x,s.y)<=(s.radius+e.radius-4)**2&&F(r,s.damage,s.x,s.y,s.sourceName),s.activeMs<=0&&r.hazardZones.splice(c,1))}const f=E(r,"mirror_orbitals"),m=[];f&&m.push({x:e.x+Math.cos(e.orbitalAngle)*38,y:e.y+Math.sin(e.orbitalAngle)*38},{x:e.x+Math.cos(e.orbitalAngle+Math.PI)*38,y:e.y+Math.sin(e.orbitalAngle+Math.PI)*38});for(let c=r.projectiles.length-1;c>=0;c--){const s=r.projectiles[c];if(s.lifeMs-=a,s.lifeMs<=0){r.projectiles.splice(c,1);continue}if(s.isPlayerOwned&&s.isHoming&&r.enemies.length>0){let u=null,h=1/0;for(const g of r.enemies){const x=M(s.x,s.y,g.x,g.y);x<h&&(h=x,u=g)}if(u){const g=Math.atan2(u.y-s.y,u.x-s.x),x=Math.hypot(s.vx,s.vy)||.6,b=Math.atan2(s.vy,s.vx);let k=g-b;for(;k>Math.PI;)k-=Math.PI*2;for(;k<-Math.PI;)k+=Math.PI*2;const P=b+y(k,-.14,.14);s.vx=Math.cos(P)*x,s.vy=Math.sin(P)*x}}if(s.x+=s.vx*a,s.y+=s.vy*a,s.trail.push({x:s.x,y:s.y}),s.trail.length>6&&s.trail.shift(),s.x<-20||s.x>r.arenaWidth+20||s.y<-20||s.y>r.arenaHeight+20){r.projectiles.splice(c,1);continue}if(s.isPlayerOwned)for(let u=r.enemies.length-1;u>=0;u--){const h=r.enemies[u];if(h&&M(s.x,s.y,h.x,h.y)<=(s.radius+h.radius)**2){S(r,h,s.damage,s.x,s.y,s.sourceName),s.pierceCount>0?s.pierceCount-=1:r.projectiles.splice(c,1);break}}else{let u=!1;for(const b of m)if(M(s.x,s.y,b.x,b.y)<=(s.radius+14)**2){I(r,s,b.x,b.y),u=!0;break}if(u)continue;const h=M(s.x,s.y,e.x,e.y),g=e.radius+s.radius-2,x=e.grazeRadius+s.radius;if(e.parryWindowMs>0&&h<=(x+16)**2){I(r,s,e.x,e.y);continue}if(h<=g*g){r.projectiles.splice(c,1),F(r,s.damage,s.x,s.y,s.sourceName);continue}if(!s.grazed&&h<=x*x){s.grazed=!0,r.totalGrazes+=1;const b=E(r,"graze_halo"),k=b?13:8;V(r,1,k,35),r.events.push({type:"GRAZE",x:s.x,y:s.y,combo:r.combo,label:`GRAZE +${k}%`,color:"#34d399"}),b&&r.enemies.length>0&&S(r,r.enemies[0],18,e.x,e.y,"Tesla Graze Halo")}}}if(te(r,a),r.status!=="PLAYING")return;const v=E(r,"kill_implosion")?260:145;for(let c=r.shards.length-1;c>=0;c--){const s=r.shards[c];if(s.lifeMs-=a,s.lifeMs<=0){r.shards.splice(c,1);continue}const u=M(e.x,e.y,s.x,s.y);if(u<=v*v){const h=Math.sqrt(u)||1;s.vx=(e.x-s.x)/h*.45,s.vy=(e.y-s.y)/h*.45}else s.vx*=.94,s.vy*=.94;if(s.x+=s.vx*a,s.y+=s.vy*a,u<=(e.radius+14)**2&&(r.xp+=s.value,V(r,0,3,s.value),r.shards.splice(c,1),r.xp>=r.xpToNextDraft&&r.upgrades.length<D.length&&(r.xp-=r.xpToNextDraft,r.xpToNextDraft=Math.round(r.xpToNextDraft*1.35),r.level+=1,r.draftChoices=X(r),r.draftChoices.length>0))){r.status="DRAFT_UPGRADE";return}}r.waveTimerMs+=a,r.spawnTimerMs-=a,r.wave<r.maxWaves?(r.spawnTimerMs<=0&&r.enemies.length<4+r.wave*2&&(q(r,r.wave>=3?3:2),r.spawnTimerMs=Math.max(2100,3600-r.wave*320)),r.waveTimerMs>=r.waveDurationMs&&(r.wave+=1,r.waveTimerMs=0,r.events.push({type:"WAVE_CLEAR",x:e.x,y:e.y,amount:r.wave,label:r.wave===r.maxWaves?"⚠️ BOSS WAVE: ARCHON-V":`WAVE ${r.wave}`,color:"#38bdf8"}),r.wave===r.maxWaves&&(r.enemies=[],_(r,"boss",r.arenaWidth*.5,130)),r.draftChoices=X(r),r.draftChoices.length>0&&(r.status="DRAFT_UPGRADE"))):r.enemies.some(c=>c.kind==="boss")||_(r,"boss",r.arenaWidth*.5,130)}class de{constructor(i,a,e,t=!1){p(this,"container");p(this,"audio");p(this,"callbacks");p(this,"debugVisible");p(this,"canvas");p(this,"ctx",null);p(this,"announcerEl");p(this,"hpFillEl");p(this,"hpTextEl");p(this,"surgeFillEl");p(this,"surgeLabelEl");p(this,"comboBadgeEl");p(this,"waveTextEl");p(this,"scoreTextEl");p(this,"muteBtnEl");p(this,"bankBtnEl");p(this,"draftOverlayEl");p(this,"draftCardsContainerEl");p(this,"endOverlayEl");p(this,"endCardEl");p(this,"debugPanelEl");p(this,"keysDown",new Set);p(this,"aimX",w*.5);p(this,"aimY",T*.3);p(this,"pendingDash",!1);p(this,"pendingBank",!1);p(this,"pendingDraftIndex");p(this,"particles",[]);p(this,"rings",[]);p(this,"popups",[]);p(this,"shakeX",0);p(this,"shakeY",0);p(this,"shakeVelX",0);p(this,"shakeVelY",0);p(this,"screenFlashAlpha",0);p(this,"screenFlashColor","#38bdf8");p(this,"lastRenderedStatus","");p(this,"lastDraftSignature","");p(this,"boundKeyDown");p(this,"boundKeyUp");this.container=i,this.audio=a,this.callbacks=e,this.debugVisible=t,this.boundKeyDown=n=>this.handleKeyDown(n),this.boundKeyUp=n=>this.handleKeyUp(n),this.mountDOM(),window.addEventListener("keydown",this.boundKeyDown),window.addEventListener("keyup",this.boundKeyUp)}mountDOM(){this.container.innerHTML=`
      <style>
        .vl-root {
          --vl-bg: #040711;
          --vl-panel: rgba(9, 14, 28, 0.88);
          --vl-border: rgba(56, 189, 248, 0.28);
          --vl-cyan: #38bdf8;
          --vl-emerald: #34d399;
          --vl-amber: #fbbf24;
          --vl-crimson: #f43f5e;
          --vl-text: #f8fafc;
          --vl-muted: #94a3b8;
          display: flex;
          flex-direction: column;
          inline-size: 100%;
          block-size: 100%;
          min-block-size: 86dvh;
          background: var(--vl-bg);
          color: var(--vl-text);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          user-select: none;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid var(--vl-border);
          box-shadow: 0 0 40px rgba(2, 6, 23, 0.9);
        }

        .vl-root .visually-hidden:where(:not(:focus-within, :active)) {
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

        .vl-hud {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-block: 8px;
          padding-inline: 14px;
          background: rgba(6, 10, 22, 0.94);
          border-block-end: 1px solid rgba(56, 189, 248, 0.24);
          z-index: 10;
          flex-wrap: wrap;
        }

        .vl-hud-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vl-meter {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-inline-size: 145px;
        }

        .vl-meter-Surge {
          min-inline-size: 230px;
        }

        .vl-meter-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .vl-bar-track {
          inline-size: 100%;
          block-size: 10px;
          background: rgba(15, 23, 42, 0.95);
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          overflow: hidden;
          position: relative;
        }

        .vl-bar-fill {
          block-size: 100%;
          border-radius: 999px;
          transition: inline-size 80ms linear, background-color 140ms ease;
        }

        .vl-combo-pill {
          padding-block: 4px;
          padding-inline: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          background: rgba(56, 189, 248, 0.14);
          border: 1px solid var(--vl-cyan);
          color: var(--vl-cyan);
          white-space: nowrap;
        }

        .vl-stat-pill {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--vl-text);
          padding-block: 4px;
          padding-inline: 8px;
          border-radius: 6px;
          background: rgba(30, 41, 59, 0.65);
        }

        .vl-btn {
          appearance: none;
          background: rgba(15, 23, 42, 0.9);
          color: var(--vl-text);
          border: 1px solid rgba(56, 189, 248, 0.45);
          border-radius: 7px;
          padding-block: 5px;
          padding-inline: 10px;
          min-block-size: 28px;
          min-inline-size: 28px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 90ms ease, background-color 120ms ease;
        }

        .vl-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.22);
          transform: translateY(-1px);
        }

        .vl-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .vl-btn:focus-visible {
          outline: 3px solid var(--vl-amber);
          outline-offset: 2px;
        }

        .vl-arena-wrap {
          position: relative;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 50%, #091326 0%, #03060c 100%);
          overflow: hidden;
          min-block-size: 560px;
        }

        .vl-canvas {
          inline-size: 100%;
          block-size: 100%;
          max-inline-size: 1200px;
          max-block-size: 720px;
          aspect-ratio: 1200 / 720;
          display: block;
          cursor: crosshair;
          touch-action: none;
        }

        .vl-overlay {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 18, 0.82);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 25;
        }

        .vl-overlay[hidden] {
          display: none !important;
        }

        .vl-draft-header {
          text-align: center;
          margin-block-end: 18px;
        }

        .vl-draft-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #fde047;
          margin: 0 0 6px 0;
          text-transform: uppercase;
        }

        .vl-draft-sub {
          font-size: 0.9rem;
          color: var(--vl-muted);
          margin: 0;
        }

        .vl-draft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          inline-size: 100%;
          max-inline-size: 880px;
        }

        .vl-draft-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: start;
          padding: 18px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid var(--card-color, #38bdf8);
          box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
          color: var(--vl-text);
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .vl-draft-card:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 0 28px var(--card-color, #38bdf8);
        }

        .vl-draft-card:focus-visible {
          outline: 3px solid #fde047;
          outline-offset: 3px;
        }

        .vl-end-card {
          max-inline-size: 560px;
          inline-size: 100%;
          background: rgba(10, 16, 32, 0.96);
          border: 2px solid var(--vl-cyan);
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 0 45px rgba(0, 0, 0, 0.85);
        }

        .vl-debug {
          position: absolute;
          inset-block-start: 56px;
          inset-inline-end: 12px;
          background: rgba(2, 6, 23, 0.92);
          border: 1px solid #38bdf8;
          border-radius: 8px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 0.74rem;
          color: #bae6fd;
          z-index: 20;
          pointer-events: none;
        }
      </style>

      <div class="vl-root">
        <div id="vl-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <header class="vl-hud" aria-label="Volt-Lash Telemetry HUD">
          <div class="vl-hud-group">
            <div class="vl-meter">
              <div class="vl-meter-label">
                <span>HULL INTEGRITY</span>
                <span id="vl-hp-text">100 / 100</span>
              </div>
              <div class="vl-bar-track">
                <div id="vl-hp-fill" class="vl-bar-fill" style="inline-size: 100%; background: #34d399;"></div>
              </div>
            </div>

            <div class="vl-meter vl-meter-Surge">
              <div class="vl-meter-label">
                <span>VOLT-SURGE [RISK / REWARD]</span>
                <span id="vl-surge-label" style="color: #38bdf8;">0% // SAFE</span>
              </div>
              <div class="vl-bar-track">
                <div id="vl-surge-fill" class="vl-bar-fill" style="inline-size: 0%; background: #38bdf8;"></div>
              </div>
            </div>

            <button type="button" id="vl-bank-btn" class="vl-btn" disabled>
              [E] Bank Surge (+30 HP)
            </button>
          </div>

          <div class="vl-hud-group">
            <div id="vl-combo-badge" class="vl-combo-pill">0 COMBO · x1.0</div>
            <div id="vl-wave-text" class="vl-stat-pill">WAVE 1 / 5</div>
            <div id="vl-score-text" class="vl-stat-pill">SCORE 0</div>
            <button type="button" id="vl-mute-btn" class="vl-btn" aria-pressed="false">
              🔊 Audio [M]
            </button>
            <button type="button" id="vl-restart-btn" class="vl-btn">
              ↻ Restart [R]
            </button>
          </div>
        </header>

        <div class="vl-arena-wrap">
          <canvas
            id="vl-canvas"
            class="vl-canvas"
            width="${w}"
            height="${T}"
            aria-label="Aegis: Volt-Lash Interactive Combat Arena"
          ></canvas>

          <div id="vl-debug-panel" class="vl-debug" hidden></div>

          <!-- 3-Card Transformative Upgrade Draft Overlay -->
          <div
            id="vl-draft-overlay"
            class="vl-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-draft-heading"
            hidden
          >
            <div class="vl-draft-header">
              <h2 id="vl-draft-heading" class="vl-draft-title">⚡ Transformative Reactor Draft</h2>
              <p class="vl-draft-sub">Choose 1 geometry-altering module — Press [1], [2], or [3] or Click</p>
            </div>
            <div id="vl-draft-cards" class="vl-draft-grid"></div>
          </div>

          <!-- Instant One-More-Run End Overlay -->
          <div
            id="vl-end-overlay"
            class="vl-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-end-heading"
            hidden
          >
            <div id="vl-end-card" class="vl-end-card"></div>
          </div>
        </div>
      </div>
    `,this.canvas=this.container.querySelector("#vl-canvas"),this.ctx=this.canvas.getContext("2d"),this.announcerEl=this.container.querySelector("#vl-announcer"),this.hpFillEl=this.container.querySelector("#vl-hp-fill"),this.hpTextEl=this.container.querySelector("#vl-hp-text"),this.surgeFillEl=this.container.querySelector("#vl-surge-fill"),this.surgeLabelEl=this.container.querySelector("#vl-surge-label"),this.comboBadgeEl=this.container.querySelector("#vl-combo-badge"),this.waveTextEl=this.container.querySelector("#vl-wave-text"),this.scoreTextEl=this.container.querySelector("#vl-score-text"),this.muteBtnEl=this.container.querySelector("#vl-mute-btn"),this.bankBtnEl=this.container.querySelector("#vl-bank-btn"),this.draftOverlayEl=this.container.querySelector("#vl-draft-overlay"),this.draftCardsContainerEl=this.container.querySelector("#vl-draft-cards"),this.endOverlayEl=this.container.querySelector("#vl-end-overlay"),this.endCardEl=this.container.querySelector("#vl-end-card"),this.debugPanelEl=this.container.querySelector("#vl-debug-panel"),this.muteBtnEl.addEventListener("click",()=>this.toggleMute()),this.bankBtnEl.addEventListener("click",()=>{this.pendingBank=!0,this.callbacks.onBankOrOverdrive()}),this.container.querySelector("#vl-restart-btn").addEventListener("click",()=>this.callbacks.onRestart()),this.canvas.addEventListener("pointermove",a=>{const e=this.canvas.getBoundingClientRect();e.width>0&&e.height>0&&(this.aimX=(a.clientX-e.left)/e.width*w,this.aimY=(a.clientY-e.top)/e.height*T)}),this.canvas.addEventListener("pointerdown",a=>{const e=this.canvas.getBoundingClientRect();e.width>0&&e.height>0&&(this.aimX=(a.clientX-e.left)/e.width*w,this.aimY=(a.clientY-e.top)/e.height*T),a.button===2?(a.preventDefault(),this.pendingBank=!0,this.callbacks.onBankOrOverdrive()):(this.pendingDash=!0,this.callbacks.onDashTrigger())}),this.canvas.addEventListener("contextmenu",a=>a.preventDefault())}toggleMute(){const i=this.audio.toggleMute();this.muteBtnEl.setAttribute("aria-pressed",String(i)),this.muteBtnEl.textContent=i?"🔇 Muted [M]":"🔊 Audio [M]"}handleKeyDown(i){var t;const a=(t=i.target)==null?void 0:t.tagName;if(a==="INPUT"||a==="TEXTAREA"||a==="SELECT")return;const e=i.code;if(this.keysDown.add(e),e==="KeyM"){this.toggleMute();return}if(e==="KeyR"){i.preventDefault(),this.callbacks.onRestart();return}if(this.lastRenderedStatus==="DRAFT_UPGRADE"){e==="Digit1"||e==="Numpad1"?(i.preventDefault(),this.callbacks.onSelectUpgrade(0)):e==="Digit2"||e==="Numpad2"?(i.preventDefault(),this.callbacks.onSelectUpgrade(1)):(e==="Digit3"||e==="Numpad3")&&(i.preventDefault(),this.callbacks.onSelectUpgrade(2));return}if(this.lastRenderedStatus==="VICTORY"||this.lastRenderedStatus==="DEFEAT"){(e==="Space"||e==="Enter")&&(i.preventDefault(),this.callbacks.onRestart());return}e==="Space"||e==="ShiftLeft"||e==="ShiftRight"?(i.preventDefault(),this.pendingDash=!0,this.callbacks.onDashTrigger()):(e==="KeyE"||e==="KeyF")&&(i.preventDefault(),this.pendingBank=!0,this.callbacks.onBankOrOverdrive())}handleKeyUp(i){this.keysDown.delete(i.code)}sampleInput(){let i=0,a=0;(this.keysDown.has("KeyA")||this.keysDown.has("ArrowLeft"))&&(i-=1),(this.keysDown.has("KeyD")||this.keysDown.has("ArrowRight"))&&(i+=1),(this.keysDown.has("KeyW")||this.keysDown.has("ArrowUp"))&&(a-=1),(this.keysDown.has("KeyS")||this.keysDown.has("ArrowDown"))&&(a+=1);const e={moveX:i,moveY:a,aimX:this.aimX,aimY:this.aimY,dashPressed:this.pendingDash,bankPressed:this.pendingBank,draftIndex:this.pendingDraftIndex};return this.pendingDash=!1,this.pendingBank=!1,this.pendingDraftIndex=void 0,e}addCameraShake(i,a,e){this.shakeVelX+=i*e,this.shakeVelY+=a*e}spawnParticles(i,a,e,t,n=0,o=0,l=1){for(let d=0;d<e;d++){const f=(Math.random()-.5)*1.9,m=n!==0||o!==0?Math.atan2(o,n)+f:Math.random()*Math.PI*2,v=(.12+Math.random()*.36)*l,c=220+Math.random()*260;this.particles.push({x:i,y:a,vx:Math.cos(m)*v,vy:Math.sin(m)*v,size:2.5+Math.random()*3.5,lifeMs:c,maxLifeMs:c,color:t})}}spawnPopup(i,a,e,t,n=1.65){this.popups.push({x:i,y:a,vy:-.09,text:e,color:t,lifeMs:850,maxLifeMs:850,scale:n,targetScale:1,scaleVel:0})}consumeEvents(i,a){for(const e of a){const t=e.dirX??Math.random()-.5,n=e.dirY??Math.random()-.5;switch(e.type){case"DASH":this.audio.playDash(),this.addCameraShake(t,n,4.5),this.spawnParticles(e.x,e.y,12,"#22d3ee",-t,-n,1.1);break;case"PARRY":this.audio.playParry(e.combo??i.combo),this.addCameraShake(t,n,8.5),this.screenFlashAlpha=.22,this.screenFlashColor="#38bdf8",this.rings.push({x:e.x,y:e.y,radius:10,maxRadius:78,lifeMs:240,maxLifeMs:240,color:"#38bdf8",lineWidth:3.5}),this.spawnParticles(e.x,e.y,18,"#38bdf8",t,n,1.4),e.label&&this.spawnPopup(e.x,e.y-12,e.label,"#38bdf8",1.85);break;case"GRAZE":this.audio.playGraze(e.combo??i.combo),this.spawnParticles(e.x,e.y,6,"#34d399",0,-1,.8),e.label&&this.spawnPopup(e.x,e.y-10,e.label,"#34d399",1.4);break;case"HIT_ENEMY":this.audio.playHit(i.combo),this.spawnParticles(e.x,e.y,7,e.color??"#fb7185",t,n,.9),e.amount&&this.spawnPopup(e.x,e.y-10,`${e.amount}`,"#f8fafc",1.35);break;case"KILL_ENEMY":this.audio.playKill(e.combo??i.combo),this.addCameraShake(t,n,10.5),this.rings.push({x:e.x,y:e.y,radius:12,maxRadius:96,lifeMs:280,maxLifeMs:280,color:e.color??"#fb7185",lineWidth:4}),this.spawnParticles(e.x,e.y,24,e.color??"#fb7185",t,n,1.5),e.label&&this.spawnPopup(e.x,e.y-14,e.label,"#fde047",1.9);break;case"PLAYER_HURT":this.audio.playPlayerHurt(),this.addCameraShake(t,n,14),this.screenFlashAlpha=.38,this.screenFlashColor="#ef4444",this.spawnParticles(e.x,e.y,22,"#ef4444",t,n,1.4),e.label&&this.spawnPopup(e.x,e.y-18,e.label,"#ef4444",2);break;case"BANK_HEAL":this.audio.playBankOrOverdrive(!1),this.addCameraShake(0,-1,7),this.screenFlashAlpha=.25,this.screenFlashColor="#34d399",this.rings.push({x:e.x,y:e.y,radius:16,maxRadius:230,lifeMs:360,maxLifeMs:360,color:"#34d399",lineWidth:4}),e.label&&this.spawnPopup(e.x,e.y-20,e.label,"#34d399",1.95);break;case"SUPERNOVA_OVERDRIVE":this.audio.playBankOrOverdrive(!0),this.addCameraShake(0,1,15),this.screenFlashAlpha=.42,this.screenFlashColor="#fde047",this.rings.push({x:e.x,y:e.y,radius:20,maxRadius:420,lifeMs:480,maxLifeMs:480,color:"#fde047",lineWidth:6}),e.label&&this.spawnPopup(e.x,e.y-24,e.label,"#fde047",2.2);break;case"TRIANGLE_CAGE":this.audio.playKill(i.combo+3),this.addCameraShake(0,1,11),e.label&&this.spawnPopup(e.x,e.y,e.label,"#fbbf24",2.1);break;case"WAVE_CLEAR":case"BOSS_PHASE":case"UPGRADE_PICKED":case"GAME_END":e.label&&(this.spawnPopup(e.x,e.y-24,e.label,e.color??"#fde047",2),this.announcerEl.textContent=e.label);break}}}resetVisuals(){this.particles=[],this.rings=[],this.popups=[],this.shakeX=0,this.shakeY=0,this.shakeVelX=0,this.shakeVelY=0,this.screenFlashAlpha=0,this.lastRenderedStatus="",this.lastDraftSignature=""}isDebugVisible(){return this.debugVisible}setDebugVisible(i){this.debugVisible=i,this.debugPanelEl.hidden=!i}updateVisualJuice(i){this.shakeVelX+=-this.shakeX*.045*i,this.shakeVelY+=-this.shakeY*.045*i,this.shakeVelX*=.78,this.shakeVelY*=.78,this.shakeX+=this.shakeVelX,this.shakeY+=this.shakeVelY,this.screenFlashAlpha>0&&(this.screenFlashAlpha=Math.max(0,this.screenFlashAlpha-i*.0012));for(let t=this.particles.length-1;t>=0;t--){const n=this.particles[t];if(n.lifeMs-=i,n.lifeMs<=0){this.particles.splice(t,1);continue}n.x+=n.vx*i,n.y+=n.vy*i,n.vx*=.96,n.vy*=.96}for(let t=this.rings.length-1;t>=0;t--){const n=this.rings[t];if(n.lifeMs-=i,n.lifeMs<=0){this.rings.splice(t,1);continue}const o=1-n.lifeMs/n.maxLifeMs;n.radius=10+(n.maxRadius-10)*(1-(1-o)*(1-o))}for(let t=this.popups.length-1;t>=0;t--){const n=this.popups[t];if(n.lifeMs-=i,n.lifeMs<=0){this.popups.splice(t,1);continue}n.y+=n.vy*i;const o=(n.targetScale-n.scale)*.032;n.scaleVel=(n.scaleVel+o*i)*.82,n.scale+=n.scaleVel}}syncHUDAndOverlays(i){const a=i.player,e=Math.max(0,Math.min(100,a.hp/a.maxHp*100));this.hpFillEl.style.inlineSize=`${e}%`,this.hpFillEl.style.background=e<=30?"#ef4444":e<=60?"#fbbf24":"#34d399",this.hpTextEl.textContent=`${Math.ceil(a.hp)} / ${a.maxHp}`;const t=Math.round(i.surge);if(this.surgeFillEl.style.inlineSize=`${t}%`,a.overdriveMs>0?(this.surgeFillEl.style.background="#fde047",this.surgeLabelEl.style.color="#fde047",this.surgeLabelEl.textContent=`⚡ OVERDRIVE (${(a.overdriveMs/1e3).toFixed(1)}s)`,this.bankBtnEl.disabled=!0,this.bankBtnEl.textContent="⚡ OVERDRIVE ACTIVE"):t>=100?(this.surgeFillEl.style.background="#fde047",this.surgeLabelEl.style.color="#fde047",this.surgeLabelEl.textContent="100% // ⚡ SUPERNOVA READY [E]",this.bankBtnEl.disabled=!1,this.bankBtnEl.textContent="⚡ [E] UNLEASH SUPERNOVA!"):C(i)?(this.surgeFillEl.style.background="#f43f5e",this.surgeLabelEl.style.color="#f43f5e",this.surgeLabelEl.textContent=`${t}% // ⚠️ REDLINE (+50% DMG / 3x XP)`,this.bankBtnEl.disabled=!1,this.bankBtnEl.textContent="[E] Bank Surge (+30 HP)"):t>=35?(this.surgeFillEl.style.background="#34d399",this.surgeLabelEl.style.color="#34d399",this.surgeLabelEl.textContent=`${t}% // BANK READY [E: +30 HP]`,this.bankBtnEl.disabled=!1,this.bankBtnEl.textContent="[E] Bank Surge (+30 HP)"):(this.surgeFillEl.style.background="#38bdf8",this.surgeLabelEl.style.color="#38bdf8",this.surgeLabelEl.textContent=`${t}% // GRAZE & PARRY TO CHARGE`,this.bankBtnEl.disabled=!0,this.bankBtnEl.textContent="[E] Need 35% Surge"),this.comboBadgeEl.textContent=`${i.combo} COMBO · x${i.multiplier.toFixed(1)}`,this.waveTextEl.textContent=i.wave===i.maxWaves?"BOSS WAVE 5 / 5":`WAVE ${i.wave} / ${i.maxWaves}`,this.scoreTextEl.textContent=`SCORE ${i.score.toLocaleString()}`,i.status==="DRAFT_UPGRADE"){this.draftOverlayEl.hidden=!1;const n=i.draftChoices.join(",");n!==this.lastDraftSignature&&(this.lastDraftSignature=n,this.renderDraftCards(i.draftChoices))}else this.draftOverlayEl.hidden=!0,this.lastDraftSignature="";i.status==="VICTORY"||i.status==="DEFEAT"?(this.endOverlayEl.hidden=!1,this.lastRenderedStatus!==i.status&&this.renderEndRecap(i)):this.endOverlayEl.hidden=!0,this.lastRenderedStatus=i.status,this.debugVisible&&(this.debugPanelEl.hidden=!1,this.debugPanelEl.innerHTML=`
        <div>SEED: ${i.seed} · RNG: ${i.rngState}</div>
        <div>STATUS: ${i.status} · WAVE: ${i.wave}</div>
        <div>ENEMIES: ${i.enemies.length} · PROJ: ${i.projectiles.length}</div>
        <div>HITSTOP: ${i.hitStopMs.toFixed(1)}ms · UPGRADES: ${i.upgrades.length}</div>
      `)}renderDraftCards(i){this.draftCardsContainerEl.innerHTML="",i.forEach((a,e)=>{const t=D.find(o=>o.id===a);if(!t)return;const n=document.createElement("button");n.type="button",n.className="vl-draft-card",n.style.setProperty("--card-color",t.color),n.innerHTML=`
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-block-end:8px;">
            <span style="font-size:0.72rem; font-weight:800; color:${t.color}; letter-spacing:0.08em;">${t.tag}</span>
            <span style="font-size:0.75rem; font-weight:900; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:99px;">KEY [${e+1}]</span>
          </div>
          <div style="font-size:1.2rem; font-weight:900; margin-block-end:8px;">
            ${t.icon} ${t.name}
          </div>
          <p style="font-size:0.86rem; line-height:1.45; color:#e2e8f0; margin:0 0 12px 0;">
            ${t.description}
          </p>
        </div>
        <div style="font-size:0.75rem; color:#94a3b8; border-block-start:1px solid rgba(148,163,184,0.2); padding-block-start:8px;">
          ✨ ${t.synergyHint}
        </div>
      `,n.addEventListener("click",()=>{this.callbacks.onSelectUpgrade(e)}),this.draftCardsContainerEl.appendChild(n)})}renderEndRecap(i){const a=i.status==="VICTORY",e=a?"#fde047":"#f43f5e",t=i.upgrades.map(l=>D.find(d=>d.id===l)).filter(l=>!!l),n=t.length>0?t.map(l=>`<span style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:99px; background:rgba(15,23,42,0.9); border:1px solid ${l.color}; font-size:0.78rem; font-weight:700;">${l.icon} ${l.name}</span>`).join(" "):'<span style="color:#94a3b8; font-size:0.82rem;">No Reactor Modules Drafted</span>';this.endCardEl.style.borderColor=e,this.endCardEl.innerHTML=`
      <div style="font-size:0.78rem; font-weight:900; letter-spacing:0.12em; color:${e}; text-transform:uppercase; margin-block-end:4px;">
        ${a?"★ SINGULARITY CONQUERED ★":"⚠️ HULL BREACH // RUN TERMINATED"}
      </div>
      <h2 id="vl-end-heading" style="font-size:1.75rem; font-weight:900; margin:0 0 8px 0; color:#f8fafc;">
        ${a?"VICTORY: ARCHON-V SHATTERED":"DEFEAT: ONE MORE RUN?"}
      </h2>
      <p style="font-size:0.9rem; color:#cbd5e1; margin:0 0 16px 0;">
        <strong>Cause:</strong> ${i.killedBy||"Combat Attrition"}
      </p>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-block-end:16px; text-align:center;">
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">FINAL SCORE</div>
          <div style="font-size:1.15rem; font-weight:900; color:#fde047;">${i.score.toLocaleString()}</div>
        </div>
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">PEAK COMBO</div>
          <div style="font-size:1.15rem; font-weight:900; color:#38bdf8;">${i.peakCombo} (x${i.peakMultiplier.toFixed(1)})</div>
        </div>
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">PARRIES / GRAZES</div>
          <div style="font-size:1.15rem; font-weight:900; color:#34d399;">${i.totalParries} / ${i.totalGrazes}</div>
        </div>
      </div>

      <div style="margin-block-end:18px;">
        <div style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-block-end:8px;">
          ACTIVE BUILD SYNERGIES (${t.length})
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${n}
        </div>
      </div>

      <button
        type="button"
        id="vl-end-restart-btn"
        class="vl-btn"
        style="inline-size:100%; padding-block:12px; font-size:0.95rem; background:${e}; color:#020617; border:none; font-weight:900;"
      >
        ▶ INSTANT RETRY — PRESS [R] OR [SPACE]
      </button>
    `;const o=this.endCardEl.querySelector("#vl-end-restart-btn");o==null||o.addEventListener("click",()=>this.callbacks.onRestart())}render(i,a){this.updateVisualJuice(a),this.syncHUDAndOverlays(i);const e=this.ctx;if(!e)return;e.save(),e.clearRect(0,0,w,T),e.translate(this.shakeX,this.shakeY),e.strokeStyle=C(i)?"rgba(244, 63, 94, 0.14)":i.player.overdriveMs>0?"rgba(253, 224, 71, 0.16)":"rgba(56, 189, 248, 0.09)",e.lineWidth=1;const t=60;for(let n=t;n<w;n+=t)e.beginPath(),e.moveTo(n,0),e.lineTo(n,T),e.stroke();for(let n=t;n<T;n+=t)e.beginPath(),e.moveTo(0,n),e.lineTo(w,n),e.stroke();for(const n of i.hazardZones){const o=n.windupMs<=0,l=o?1:1-n.windupMs/n.maxWindupMs;e.save(),e.beginPath(),e.arc(n.x,n.y,n.radius,0,Math.PI*2),e.fillStyle=o?"rgba(239, 68, 68, 0.52)":`rgba(244, 63, 94, ${.12+l*.22})`,e.fill(),e.lineWidth=o?4:2,e.strokeStyle=o?"#fde047":"#f43f5e",e.stroke(),o||(e.beginPath(),e.arc(n.x,n.y,n.radius*l,0,Math.PI*2),e.strokeStyle="rgba(251, 113, 133, 0.85)",e.lineWidth=2,e.stroke()),e.restore()}for(const n of i.vortices){const o=Math.max(0,n.lifeMs/n.maxLifeMs);e.save(),e.beginPath(),e.arc(n.x,n.y,n.radius*(.4+.6*o),0,Math.PI*2),e.strokeStyle=`rgba(192, 132, 252, ${o*.85})`,e.lineWidth=3,e.stroke(),e.restore()}for(const n of i.wakeNodes){const o=Math.max(0,n.lifeMs/n.maxLifeMs);e.beginPath(),e.arc(n.x,n.y,n.radius*o,0,Math.PI*2),e.fillStyle=`rgba(249, 115, 22, ${o*.45})`,e.fill()}if(E(i,"triangle_cage")&&i.tethers.length>=2){const n=i.tethers[i.tethers.length-2],o=i.tethers[i.tethers.length-1];e.save(),e.beginPath(),e.moveTo(n.x1,n.y1),e.lineTo(o.x1,o.y1),e.lineTo(o.x2,o.y2),e.closePath(),e.fillStyle="rgba(251, 191, 36, 0.14)",e.fill(),e.strokeStyle="rgba(251, 191, 36, 0.75)",e.setLineDash([6,4]),e.lineWidth=2,e.stroke(),e.restore()}for(const n of i.tethers){const o=Math.min(1,n.lifeMs/400);e.save(),e.strokeStyle=n.color,e.globalAlpha=o,e.lineWidth=E(i,"tether_lightning")?5:3.5,e.beginPath(),e.moveTo(n.x1,n.y1);const l=(n.x1+n.x2)*.5+(Math.random()-.5)*8,d=(n.y1+n.y2)*.5+(Math.random()-.5)*8;e.lineTo(l,d),e.lineTo(n.x2,n.y2),e.stroke(),e.fillStyle="#f8fafc",e.beginPath(),e.arc(n.x1,n.y1,5,0,Math.PI*2),e.arc(n.x2,n.y2,5,0,Math.PI*2),e.fill(),e.restore()}for(const n of i.shards)e.save(),e.fillStyle="#34d399",e.translate(n.x,n.y),e.rotate(i.elapsedMs*.005),e.fillRect(-4.5,-4.5,9,9),e.restore();for(const n of i.enemies)this.renderEnemyTelegraph(e,n);for(const n of i.enemies)this.renderEnemy(e,n);for(const n of i.projectiles){if(n.trail.length>1){e.save(),e.strokeStyle=n.color,e.globalAlpha=.38,e.lineWidth=n.radius*.9,e.beginPath(),e.moveTo(n.trail[0].x,n.trail[0].y);for(let o=1;o<n.trail.length;o++)e.lineTo(n.trail[o].x,n.trail[o].y);e.stroke(),e.restore()}e.beginPath(),e.arc(n.x,n.y,n.radius,0,Math.PI*2),e.fillStyle=n.isParried?"#fde047":n.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#ffffff",e.stroke()}this.renderPlayer(e,i);for(const n of this.rings){const o=Math.max(0,n.lifeMs/n.maxLifeMs);e.save(),e.beginPath(),e.arc(n.x,n.y,n.radius,0,Math.PI*2),e.strokeStyle=n.color,e.globalAlpha=o,e.lineWidth=n.lineWidth,e.stroke(),e.restore()}for(const n of this.particles){const o=Math.max(0,n.lifeMs/n.maxLifeMs);e.save(),e.fillStyle=n.color,e.globalAlpha=o,e.fillRect(n.x-n.size*.5,n.y-n.size*.5,n.size,n.size),e.restore()}for(const n of this.popups){const o=Math.min(1,n.lifeMs/260);e.save(),e.translate(n.x,n.y),e.scale(n.scale,n.scale),e.globalAlpha=o,e.font="900 15px Inter, system-ui, sans-serif",e.textAlign="center",e.strokeStyle="#020617",e.lineWidth=3.5,e.strokeText(n.text,0,0),e.fillStyle=n.color,e.fillText(n.text,0,0),e.restore()}if(i.tutorialPromptAlpha>.01){e.save(),e.globalAlpha=i.tutorialPromptAlpha;const n=Math.max(68,i.player.y-68);e.fillStyle="rgba(2, 6, 23, 0.86)",e.strokeStyle="#38bdf8",e.lineWidth=1.5;const o=670,l=34,d=Math.max(20,Math.min(w-o-20,i.player.x-o*.5));e.fillRect(d,n-22,o,l),e.strokeRect(d,n-22,o,l),e.font="800 13px Inter, system-ui, sans-serif",e.fillStyle="#f8fafc",e.textAlign="center",e.fillText("[WASD / Arrows] Move & Graze Bullets   ·   [SPACE / Click] Lash-Parry Dash   ·   [E / Right-Click] Bank Surge (+30 HP)",d+o*.5,n-1),e.restore()}this.screenFlashAlpha>.01&&(e.save(),e.fillStyle=this.screenFlashColor,e.globalAlpha=this.screenFlashAlpha,e.fillRect(0,0,w,T),e.restore()),e.restore()}renderEnemyTelegraph(i,a){const e=a.telegraph;if(e.type==="none"||e.durationMs<=0)return;const t=1-Math.max(0,e.timerMs)/e.durationMs;if(i.save(),e.type==="laser_line"){const n=a.x+Math.cos(e.angle)*950,o=a.y+Math.sin(e.angle)*950;i.strokeStyle=`rgba(244, 63, 94, ${.28+t*.65})`,i.lineWidth=Math.max(2,(1-t)*14),i.setLineDash([10,6]),i.beginPath(),i.moveTo(a.x,a.y),i.lineTo(n,o),i.stroke()}else if(e.type==="dash_lane")i.strokeStyle=`rgba(249, 115, 22, ${.3+t*.6})`,i.lineWidth=a.radius*1.6,i.beginPath(),i.moveTo(a.x,a.y),i.lineTo(e.targetX,e.targetY),i.stroke(),i.beginPath(),i.arc(e.targetX,e.targetY,a.radius,0,Math.PI*2),i.strokeStyle="#fde047",i.lineWidth=2,i.stroke();else if(e.type==="radial_burst"){const n=a.radius+(1-t)*34;i.beginPath(),i.arc(a.x,a.y,n,0,Math.PI*2),i.strokeStyle=`rgba(251, 113, 133, ${.35+t*.6})`,i.lineWidth=3,i.stroke()}i.restore()}renderEnemy(i,a){if(i.save(),i.beginPath(),i.arc(a.x,a.y,a.radius,0,Math.PI*2),i.fillStyle=a.hitFlashMs>0?"#ffffff":a.color,i.fill(),i.lineWidth=a.kind==="boss"?4:2,i.strokeStyle=a.kind==="boss"?"#fde047":"#0f172a",i.stroke(),a.hp<a.maxHp||a.kind==="boss"){const e=a.kind==="boss"?110:34,t=a.kind==="boss"?8:4,n=a.x-e*.5,o=a.y-a.radius-14;i.fillStyle="rgba(2, 6, 23, 0.85)",i.fillRect(n,o,e,t),i.fillStyle=a.kind==="boss"?"#ef4444":"#fb7185",i.fillRect(n,o,e*Math.max(0,a.hp/a.maxHp),t)}i.restore()}renderPlayer(i,a){const e=a.player;if(e.trail.length>1){i.save(),i.strokeStyle=e.overdriveMs>0?"#fde047":C(a)?"#f43f5e":"#38bdf8",i.globalAlpha=.34,i.lineWidth=e.radius*1.1,i.beginPath(),i.moveTo(e.trail[0].x,e.trail[0].y);for(let n=1;n<e.trail.length;n++)i.lineTo(e.trail[n].x,e.trail[n].y);i.stroke(),i.restore()}if(i.save(),i.beginPath(),i.arc(e.x,e.y,e.grazeRadius,0,Math.PI*2),i.strokeStyle=C(a)?"rgba(244, 63, 94, 0.38)":"rgba(52, 211, 153, 0.25)",i.setLineDash([5,5]),i.lineWidth=1.5,i.stroke(),i.restore(),e.parryWindowMs>0&&(i.save(),i.beginPath(),i.arc(e.x,e.y,e.grazeRadius+14,0,Math.PI*2),i.strokeStyle="#38bdf8",i.fillStyle="rgba(56, 189, 248, 0.18)",i.lineWidth=3,i.fill(),i.stroke(),i.restore()),E(a,"mirror_orbitals"))for(let o=0;o<2;o++){const l=e.orbitalAngle+o*Math.PI,d=e.x+Math.cos(l)*38,f=e.y+Math.sin(l)*38;i.beginPath(),i.arc(d,f,8,0,Math.PI*2),i.fillStyle="#2dd4bf",i.fill(),i.strokeStyle="#ffffff",i.lineWidth=1.5,i.stroke()}const t=Math.atan2(e.aimY-e.y,e.aimX-e.x);i.save(),i.translate(e.x,e.y),i.rotate(t),i.beginPath(),i.moveTo(e.radius+5,0),i.lineTo(-e.radius,-e.radius*.85),i.lineTo(-e.radius*.5,0),i.lineTo(-e.radius,e.radius*.85),i.closePath(),i.fillStyle=e.overdriveMs>0?"#fde047":C(a)?"#f43f5e":"#38bdf8",i.fill(),i.lineWidth=2,i.strokeStyle="#ffffff",i.stroke(),i.restore()}destroy(){window.removeEventListener("keydown",this.boundKeyDown),window.removeEventListener("keyup",this.boundKeyUp),this.container.innerHTML=""}}function ce(r,i){const a=(i==null?void 0:i.initialSeed)??20261108;let e=G(a);const t=new re,n=()=>{e.events.length>0&&(l.consumeEvents(e,e.events),e.events=[])},o=s=>{const u=typeof s=="number"?s:e.seed+104729>>>0;e=G(u),l.resetVisuals(),l.render(e,A)},l=new de(r,t,{onRestart:o,onSelectUpgrade:s=>{K(e,s)&&(n(),l.render(e,A))},onBankOrOverdrive:()=>{Q(e)&&(n(),l.render(e,A))},onDashTrigger:()=>{const s=l.sampleInput();J(e,{...s})&&(n(),l.render(e,A))}},!!(i!=null&&i.debug));let d=0,f=typeof performance<"u"?performance.now():0,m=0,v=!1;const c=s=>{if(v)return;const u=Math.min(100,Math.max(0,s-f));for(f=s,m+=u;m>=A;){const h=l.sampleInput();le(e,h,A),n(),m-=A}l.render(e,u||A),d=window.requestAnimationFrame(c)};return l.render(e,A),typeof window<"u"&&typeof window.requestAnimationFrame=="function"&&(d=window.requestAnimationFrame(c)),{destroy(){v=!0,typeof window<"u"&&typeof window.cancelAnimationFrame=="function"&&window.cancelAnimationFrame(d),t.destroy(),l.destroy()},getStateSnapshot(){return ne(e)},restartWithSeed(s){o(s)},toggleDebug(s){const u=typeof s=="boolean"?s:!l.isDebugVisible();l.setDebugVisible(u),l.render(e,A)}}}const U=document.getElementById("volt-lash-root");U&&ce(U);
