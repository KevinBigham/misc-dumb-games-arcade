const M=[{id:0,name:"Cyan Apex",shortLabel:"CYN",symbol:"▲",fillHex:"#06b6d4",strokeHex:"#a5f3fc",glowHex:"rgba(34, 211, 238, 0.55)",textHex:"#042f2e",baseFreqHz:261.63},{id:1,name:"Amber Pulse",shortLabel:"AMB",symbol:"●",fillHex:"#f59e0b",strokeHex:"#fde68a",glowHex:"rgba(251, 191, 36, 0.55)",textHex:"#271300",baseFreqHz:293.66},{id:2,name:"Magenta Core",shortLabel:"MAG",symbol:"■",fillHex:"#ec4899",strokeHex:"#fbcfe8",glowHex:"rgba(244, 114, 182, 0.55)",textHex:"#31071f",baseFreqHz:329.63},{id:3,name:"Emerald Prism",shortLabel:"EMR",symbol:"◆",fillHex:"#10b981",strokeHex:"#a7f3d0",glowHex:"rgba(52, 211, 153, 0.55)",textHex:"#022c22",baseFreqHz:392},{id:4,name:"Violet Nova",shortLabel:"VIO",symbol:"★",fillHex:"#8b5cf6",strokeHex:"#ddd6fe",glowHex:"rgba(167, 139, 250, 0.6)",textHex:"#1e1b4b",baseFreqHz:440}],R={SINGLE_STREAM:{type:"SINGLE_STREAM",label:"Single Stream",description:"1–2 shards along a focused orbital lane.",minLevel:1},DOUBLE_OPPOSING:{type:"DOUBLE_OPPOSING",label:"Double Opposing",description:"Simultaneous shards arriving on opposite sides of the polygon.",minLevel:2},SPIRAL_CASCADE:{type:"SPIRAL_CASCADE",label:"Spiral Cascade",description:"3 sequential shards sweeping clockwise or counter-clockwise around the core.",minLevel:4},CROSSING_PAIR:{type:"CROSSING_PAIR",label:"Crossing Pair",description:"Two staggered pairs of matching/contrasting shards testing cross-face chains.",minLevel:6}};function G(o,e,t,a,r,s){const i=["SINGLE_STREAM"];e>=R.DOUBLE_OPPOSING.minLevel&&i.push("DOUBLE_OPPOSING"),e>=R.SPIRAL_CASCADE.minLevel&&i.push("SPIRAL_CASCADE"),e>=R.CROSSING_PAIR.minLevel&&i.push("CROSSING_PAIR");const l=e===1?"SINGLE_STREAM":o.pick(i),n=()=>o.nextInt(0,a),u=o.nextInt(0,t),d=[];if(l==="SINGLE_STREAM"){const A=n();if(d.push({lane:u,color:A,delayMs:0}),e>=2&&o.nextFloat()<.35){const S=o.nextFloat()<.5?1:t-1;d.push({lane:(u+S)%t,color:o.nextFloat()<.55?A:n(),delayMs:s})}return{pattern:l,shards:d,durationMs:r+(d.length>1?s:0)}}if(l==="DOUBLE_OPPOSING"){const A=(u+Math.floor(t/2))%t,S=n(),y=o.nextFloat()<.45?S:n();return d.push({lane:u,color:S,delayMs:0}),d.push({lane:A,color:y,delayMs:Math.round(s*.45)}),{pattern:l,shards:d,durationMs:Math.round(r*1.18)}}if(l==="SPIRAL_CASCADE"){const A=o.nextFloat()<.5?1:-1,S=e>=9?4:3,y=n();for(let c=0;c<S;c++){const f=(u+c*A+t*4)%t,b=c<2&&o.nextFloat()<.6?y:n();d.push({lane:f,color:b,delayMs:c*s})}return{pattern:l,shards:d,durationMs:r+(S-1)*s}}const v=u,p=(u+2)%t,m=n(),g=n();return d.push({lane:v,color:m,delayMs:0}),d.push({lane:p,color:g,delayMs:0}),d.push({lane:(v+1)%t,color:m,delayMs:s}),{pattern:l,shards:d,durationMs:r+s}}function I(o){switch(o){case 6:return{numSides:6,title:"HEX CORE (6 SIDES)",subtitle:"4 Frequencies Active · Standard 60° Lattice",badgeColor:"#06b6d4"};case 7:return{numSides:7,title:"HEPTA CORE (7 SIDES)",subtitle:"5th Frequency (★ Violet) Unlocked · 51.4° Asymmetric Lattice",badgeColor:"#8b5cf6"};case 8:return{numSides:8,title:"OCTA CORE (8 SIDES)",subtitle:"Full 8-Face Orbital Matrix · Spiral & Crossing Waves Active",badgeColor:"#f59e0b"}}}class K{ctx=null;muted=!1;isMuted(){return this.muted}setMuted(e){this.muted=e}toggleMute(){return this.muted=!this.muted,this.muted}ensureContext(){if(this.muted||typeof window>"u")return null;const e=window.AudioContext||window.webkitAudioContext;if(!e)return null;if(!this.ctx)try{this.ctx=new e}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playRotateTick(){const e=this.ensureContext();if(!e)return;const t=e.currentTime,a=e.createOscillator(),r=e.createGain();a.type="triangle",a.frequency.setValueAtTime(520,t),a.frequency.exponentialRampToValueAtTime(760,t+.032),r.gain.setValueAtTime(.06,t),r.gain.exponentialRampToValueAtTime(.001,t+.035),a.connect(r),r.connect(e.destination),a.start(t),a.stop(t+.038)}playShardLock(e=0,t=0){const a=this.ensureContext();if(!a)return;const r=a.currentTime,s=a.createOscillator(),i=a.createGain(),l=95+t*12+e*6;s.type="sine",s.frequency.setValueAtTime(l*1.4,r),s.frequency.exponentialRampToValueAtTime(l*.65,r+.085),i.gain.setValueAtTime(.14,r),i.gain.exponentialRampToValueAtTime(.001,r+.09),s.connect(i),i.connect(a.destination),s.start(r),s.stop(r+.095)}playMatchChord(e=0,t=3,a=1,r=1){const s=this.ensureContext();if(!s)return;const l=(M[e]??M[0]).baseFreqHz*Math.pow(1.06,Math.min(8,a-1+(r-1)*2)),n=[1,1.25,1.5,t>=5?2:1.875],u=s.currentTime;n.forEach((d,v)=>{const p=s.createOscillator(),m=s.createGain();p.type=v%2===0?"triangle":"sine";const g=u+v*.035,A=.22;p.frequency.setValueAtTime(l*d,g),p.frequency.exponentialRampToValueAtTime(l*d*1.015,g+A),m.gain.setValueAtTime(.09,g),m.gain.exponentialRampToValueAtTime(.001,g+A),p.connect(m),m.connect(s.destination),p.start(g),p.stop(g+A+.01)})}playMorphFanfare(e){const t=this.ensureContext();if(!t)return;const a=e===7?[330,440,554.37,659.25]:[392,523.25,659.25,783.99],r=t.currentTime;a.forEach((s,i)=>{const l=t.createOscillator(),n=t.createGain();l.type="sawtooth";const u=r+i*.055;l.frequency.setValueAtTime(s,u),n.gain.setValueAtTime(.07,u),n.gain.exponentialRampToValueAtTime(.001,u+.26),l.connect(n),n.connect(t.destination),l.start(u),l.stop(u+.27)})}playPhasePulse(){const e=this.ensureContext();if(!e)return;const t=e.currentTime,a=e.createOscillator(),r=e.createGain();a.type="sawtooth",a.frequency.setValueAtTime(180,t),a.frequency.exponentialRampToValueAtTime(680,t+.18),a.frequency.exponentialRampToValueAtTime(110,t+.36),r.gain.setValueAtTime(.14,t),r.gain.exponentialRampToValueAtTime(.001,t+.38),a.connect(r),r.connect(e.destination),a.start(t),a.stop(t+.39)}playContainmentBreach(){const e=this.ensureContext();if(!e)return;const t=e.currentTime;[220,185,146.8].forEach((a,r)=>{const s=e.createOscillator(),i=e.createGain();s.type="sawtooth";const l=t+r*.11;s.frequency.setValueAtTime(a,l),i.gain.setValueAtTime(.1,l),i.gain.exponentialRampToValueAtTime(.001,l+.25),s.connect(i),i.connect(e.destination),s.start(l),s.stop(l+.26)})}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const h={GAME_ID:"08-orbit-stack",STORAGE_KEY:"argon_game08_orbit_stack_v1",DEFAULT_SEED:80802026,FIXED_STEP_MS:1e3/60,MAX_STACK_DEPTH:7,DANGER_STACK_DEPTH:5,MIN_MATCH_COUNT:3,HEX_SIDES:6,HEPTA_SIDES:7,OCTA_SIDES:8,HEPTA_UNLOCK_LEVEL:4,OCTA_UNLOCK_LEVEL:7,VICTORY_TARGET_LEVEL:8,VICTORY_TARGET_CLEARS:100,MAX_DIFFICULTY_LEVEL:35,BLOCK_RADIAL_THICKNESS:.105,SPAWN_RADIAL_DISTANCE:1,SLAM_SPEED_MULTIPLIER:5.5,SLAM_SCORE_BONUS_PER_BLOCK:15,GRAVITY_SETTLE_SPEED_PER_SEC:3.4,COMBO_WINDOW_MS:2600,MAX_COMBO_MULTIPLIER:8,PHASE_PULSE_MAX_CHARGE:100,PHASE_PULSE_INITIAL_CHARGE:50,PHASE_PULSE_CHARGE_PER_BLOCK:7,PHASE_PULSE_CROSS_FACE_BONUS:14,PHASE_PULSE_SCORE_BONUS:150,BASE_BLOCK_SCORE:50,CROSS_FACE_BONUS_MULTIPLIER:1.5,CASCADE_BONUS_MULTIPLIER:1.35};function O(o){return o>=h.OCTA_UNLOCK_LEVEL?h.OCTA_SIDES:o>=h.HEPTA_UNLOCK_LEVEL?h.HEPTA_SIDES:h.HEX_SIDES}function q(o){return o>=h.HEPTA_UNLOCK_LEVEL?5:4}function D(o){if(o<=1)return 0;let e=0;for(let t=1;t<o;t++)e+=4+Math.min(14,t);return e}function B(o){let e=1;for(;D(e+1)<=o;)e++;return e}function H(o){const e=Math.max(1,Math.floor(o)),t=Math.min(h.MAX_DIFFICULTY_LEVEL,e);let a=0;if(t<=10)a=(t-1)/9*.62;else{const n=(t-10)/(h.MAX_DIFFICULTY_LEVEL-10);a=.62+(1-Math.pow(1-n,1.65))*.38}const r=Number((1+a*1.45).toFixed(4)),s=Number((.26*r).toFixed(4)),i=Math.round(1580-a*860),l=Math.round(340-a*155);return{level:e,effectiveLevel:t,numSides:O(e),activeColorCount:q(e),fallSpeedPerSec:s,waveIntervalMs:i,intraWaveStepMs:l,speedMultiplier:r}}const _=1;function z(){return{highScore:0,maxLevelReached:1,maxComboReached:1,totalBlocksClearedLifetime:0,gamesPlayed:0,victoriesUnlocked:0}}function L(o){return{...o,stacks:o.stacks.map(e=>e.map(t=>({...t}))),fallingShards:o.fallingShards.map(e=>({...e})),waveQueue:o.waveQueue.map(e=>({...e})),events:[]}}function $(o,e){const t={schemaVersion:_,gameId:h.GAME_ID,updatedAtIso:new Date().toISOString(),career:{...o},activeRun:e?L(e):null};return JSON.stringify(t)}function N(o){try{const e=JSON.parse(o);if(!e||e.schemaVersion!==_||e.gameId!==h.GAME_ID||!e.career)return null;const t={highScore:Math.max(0,Number(e.career.highScore)||0),maxLevelReached:Math.max(1,Number(e.career.maxLevelReached)||1),maxComboReached:Math.max(1,Number(e.career.maxComboReached)||1),totalBlocksClearedLifetime:Math.max(0,Number(e.career.totalBlocksClearedLifetime)||0),gamesPlayed:Math.max(0,Number(e.career.gamesPlayed)||0),victoriesUnlocked:Math.max(0,Number(e.career.victoriesUnlocked)||0)};let a=null;return e.activeRun&&typeof e.activeRun.seed=="number"&&Array.isArray(e.activeRun.stacks)&&(e.activeRun.numSides===6||e.activeRun.numSides===7||e.activeRun.numSides===8)&&(a=L(e.activeRun)),{schemaVersion:_,gameId:h.GAME_ID,updatedAtIso:typeof e.updatedAtIso=="string"?e.updatedAtIso:new Date().toISOString(),career:t,activeRun:a}}catch{return null}}function Y(o=h.STORAGE_KEY){try{if(typeof window<"u"&&window.localStorage){const e=window.localStorage.getItem(o);if(e){const t=N(e);if(t)return t}}}catch{}return{schemaVersion:_,gameId:h.GAME_ID,updatedAtIso:new Date().toISOString(),career:z(),activeRun:null}}function T(o,e,t=h.STORAGE_KEY){const a={highScore:Math.max(o.highScore,e?.score??0),maxLevelReached:Math.max(o.maxLevelReached,e?.level??1),maxComboReached:Math.max(o.maxComboReached,e?.maxComboReached??1),totalBlocksClearedLifetime:o.totalBlocksClearedLifetime,gamesPlayed:o.gamesPlayed,victoriesUnlocked:o.victoriesUnlocked+(e?.victoryUnlocked?1:0)},r=$(a,e);try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(t,r)}catch{}return N(r)}function V(o){let e=o>>>0||322420463;const t=()=>{e=e+1831565813>>>0;let s=Math.imul(e^e>>>15,1|e);return s=s+Math.imul(s^s>>>7,61|s)^s,((s^s>>>14)>>>0)/4294967296},a=(s,i)=>i<=s?s:s+Math.floor(t()*(i-s));return{getState:()=>e>>>0,setState:s=>{e=s>>>0||322420463},nextFloat:t,nextInt:a,pick:s=>{if(s.length===0)throw new Error("Cannot pick from an empty array");return s[a(0,s.length)]}}}function U(o,e,t){return((o-e)%t+t)%t}function X(o,e,t){return((o+e)%t+t)%t}function w(o=h.DEFAULT_SEED){const e=V(o),t=h.HEX_SIDES,a=Array.from({length:t},()=>[]);return{seed:o,rngState:e.getState(),status:"PLAYING",elapsedMs:0,level:1,numSides:t,coreRotationIndex:0,visualRotationSteps:0,stacks:a,fallingShards:[],waveQueue:[],currentWavePattern:"SINGLE_STREAM",nextWaveCooldownMs:350,nextEntityId:1,gravitySettleTimerMs:0,pendingCascadeDepth:0,score:0,totalClearedBlocks:0,comboCount:0,comboMultiplier:1,comboTimerMs:0,maxComboReached:1,phasePulseCharge:h.PHASE_PULSE_INITIAL_CHARGE,phasePulsesUsed:0,victoryUnlocked:!1,victoryAcknowledged:!1,breachedFace:null,events:[]}}function W(o,e,t=h.MIN_MATCH_COUNT){const a=new Set,r=[],s=(i,l)=>`${i}:${l}`;for(let i=0;i<e;i++){const l=o[i]??[];for(let n=0;n<l.length;n++){const u=s(i,n);if(a.has(u))continue;const d=l[n].color,v=[{f:i,d:n}];a.add(u);const p=[],m=new Set;for(;v.length>0;){const g=v.shift(),A=o[g.f]?.[g.d];if(!A)continue;p.push({face:g.f,depth:g.d,color:A.color,blockId:A.id}),m.add(g.f);const S=(g.f-1+e)%e,y=(g.f+1)%e,c=[{f:g.f,d:g.d-1},{f:g.f,d:g.d+1},{f:S,d:g.d},{f:y,d:g.d}];for(const f of c){if(f.d<0)continue;const b=o[f.f];if(!b||f.d>=b.length)continue;const E=s(f.f,f.d);a.has(E)||b[f.d].color===d&&(a.add(E),v.push(f))}}p.length>=t&&r.push({color:d,cells:p,facesInvolved:Array.from(m).sort((g,A)=>g-A),isCrossFace:m.size>1})}}return r}function F(o,e){if(!(e<=o.numSides)){for(;o.stacks.length<e;)o.stacks.push([]);o.numSides=e,o.coreRotationIndex=(o.coreRotationIndex%e+e)%e;for(const t of o.fallingShards)t.lane=(t.lane%e+e)%e;for(const t of o.waveQueue)t.lane=(t.lane%e+e)%e;o.events.push({type:"POLYGON_MORPHED",newSides:e})}}function k(o,e=1){const t=W(o.stacks,o.numSides);if(t.length===0)return{clearedBlocks:0,outerBlocksDropped:!1};const a=new Map;let r=0,s=!1;const i=[];for(const S of t){S.isCrossFace&&(s=!0);for(const y of S.cells){a.has(y.face)||a.set(y.face,new Set);const c=a.get(y.face);c.has(y.depth)||(c.add(y.depth),r++,i.push(y))}}let l=!1;for(const[S,y]of a.entries()){const c=o.stacks[S],f=[];let b=0;for(let E=0;E<c.length;E++)if(y.has(E))b++;else{const x=c[E];b>0&&(l=!0,x.radialOffset+=b*h.BLOCK_RADIAL_THICKNESS),f.push(x)}o.stacks[S]=f}o.comboCount+=1,o.comboTimerMs=h.COMBO_WINDOW_MS;const n=s&&r>=4?1:0;o.comboMultiplier=Math.min(h.MAX_COMBO_MULTIPLIER,1+Math.floor((o.comboCount+n)/1)),o.comboMultiplier>o.maxComboReached&&(o.maxComboReached=o.comboMultiplier);const u=s?h.CROSS_FACE_BONUS_MULTIPLIER:1,d=e>1?Math.pow(h.CASCADE_BONUS_MULTIPLIER,e-1):1,v=r>3?1+(r-3)*.25:1,p=Math.round(r*h.BASE_BLOCK_SCORE*o.comboMultiplier*u*d*v);o.score+=p,o.totalClearedBlocks+=r;const m=r*h.PHASE_PULSE_CHARGE_PER_BLOCK+(s?h.PHASE_PULSE_CROSS_FACE_BONUS:0);o.phasePulseCharge=Math.min(h.PHASE_PULSE_MAX_CHARGE,o.phasePulseCharge+m);const g=i[0];o.events.push({type:e>1?"CASCADE_CLEARED":"MATCH_CLEARED",face:g?.face,depth:g?.depth,color:g?.color,clearedCount:r,scoreDelta:p,comboMultiplier:o.comboMultiplier,cascadeDepth:e,cells:i});const A=B(o.totalClearedBlocks);if(A>o.level){o.level=A;const S=O(o.level);S>o.numSides&&F(o,S)}return!o.victoryUnlocked&&o.level>=h.VICTORY_TARGET_LEVEL&&o.totalClearedBlocks>=h.VICTORY_TARGET_CLEARS&&(o.victoryUnlocked=!0,o.victoryAcknowledged||(o.status="VICTORY"),o.events.push({type:"VICTORY_UNLOCKED"})),{clearedBlocks:r,outerBlocksDropped:l}}function ae(o){let e=1,t=0;for(;e<=12;){const a=k(o,e);if(a.clearedBlocks===0)break;t+=a.clearedBlocks;for(const r of o.stacks)for(const s of r)s.radialOffset=0;if(!a.outerBlocksDropped)break;e++}return o.gravitySettleTimerMs=0,o.pendingCascadeDepth=0,t}function j(o){for(let e=0;e<o.numSides;e++){const t=o.stacks[e];if(t&&t.length>h.MAX_STACK_DEPTH)return o.status="GAME_OVER",o.breachedFace=e,o.events.push({type:"GAME_OVER",face:e}),!0}return!1}function Q(o,e){if(e.type==="TOGGLE_PAUSE")return o.status==="PLAYING"?o.status="PAUSED":o.status==="PAUSED"&&(o.status="PLAYING"),o;if(e.type==="CONTINUE_ENDLESS")return o.status==="VICTORY"&&(o.victoryAcknowledged=!0,o.status="PLAYING"),o;if(o.status!=="PLAYING")return o;if(e.type==="ROTATE_LEFT")return o.coreRotationIndex=(o.coreRotationIndex-1+o.numSides)%o.numSides,o.visualRotationSteps-=1,o.events.push({type:"ROTATED"}),o;if(e.type==="ROTATE_RIGHT")return o.coreRotationIndex=(o.coreRotationIndex+1)%o.numSides,o.visualRotationSteps+=1,o.events.push({type:"ROTATED"}),o;if(e.type==="SLAM_INWARD"){if(o.fallingShards.length>0){let t=o.fallingShards[0];for(const a of o.fallingShards)!a.slammed&&a.distance<t.distance&&(t=a);t.slammed=!0}return o}if(e.type==="PHASE_PULSE"){if(o.phasePulseCharge>=h.PHASE_PULSE_MAX_CHARGE){o.phasePulseCharge=0,o.phasePulsesUsed+=1;let t=0;const a=[];for(let l=0;l<o.numSides;l++){const n=o.stacks[l];if(n&&n.length>0){const u=n.shift();t++,a.push({face:l,depth:0,color:u.color,blockId:u.id});for(const d of n)d.radialOffset+=h.BLOCK_RADIAL_THICKNESS}}const r=Math.max(h.PHASE_PULSE_SCORE_BONUS,t*45);o.score+=r,o.totalClearedBlocks+=t,o.events.push({type:"PHASE_PULSE_FIRED",clearedCount:t,scoreDelta:r,cells:a});const s=B(o.totalClearedBlocks);if(s>o.level){o.level=s;const l=O(o.level);l>o.numSides&&F(o,l)}k(o,2).outerBlocksDropped&&(o.gravitySettleTimerMs=95,o.pendingCascadeDepth=3)}return o}return o}function J(o,e){if(o.status!=="PLAYING"||e<=0)return o;o.elapsedMs+=e;const t=H(o.level),a=V(o.seed);a.setState(o.rngState),o.comboTimerMs>0&&(o.comboTimerMs=Math.max(0,o.comboTimerMs-e),o.comboTimerMs===0&&(o.comboCount=0,o.comboMultiplier=1));const r=h.GRAVITY_SETTLE_SPEED_PER_SEC*e/1e3;for(let l=0;l<o.numSides;l++){const n=o.stacks[l];if(n)for(const u of n)u.radialOffset>0&&(u.radialOffset=Math.max(0,u.radialOffset-r))}if(o.gravitySettleTimerMs>0&&(o.gravitySettleTimerMs=Math.max(0,o.gravitySettleTimerMs-e),o.gravitySettleTimerMs===0&&o.pendingCascadeDepth>0)){const l=o.pendingCascadeDepth;o.pendingCascadeDepth=0,k(o,l).outerBlocksDropped&&(o.gravitySettleTimerMs=95,o.pendingCascadeDepth=l+1)}for(let l=o.waveQueue.length-1;l>=0;l--){const n=o.waveQueue[l];n.spawnTimerMs-=e,n.spawnTimerMs<=0&&(o.fallingShards.push({id:o.nextEntityId++,lane:n.lane%o.numSides,color:n.color,distance:h.SPAWN_RADIAL_DISTANCE,slammed:!1}),o.waveQueue.splice(l,1))}if(o.nextWaveCooldownMs-=e,o.nextWaveCooldownMs<=0&&o.waveQueue.length===0){const l=G(a,o.level,o.numSides,t.activeColorCount,t.waveIntervalMs,t.intraWaveStepMs);o.currentWavePattern=l.pattern,o.nextWaveCooldownMs=l.durationMs;for(const n of l.shards)n.delayMs<=0?o.fallingShards.push({id:o.nextEntityId++,lane:n.lane%o.numSides,color:n.color,distance:h.SPAWN_RADIAL_DISTANCE,slammed:!1}):o.waveQueue.push({lane:n.lane%o.numSides,color:n.color,spawnTimerMs:n.delayMs})}o.fallingShards.sort((l,n)=>l.distance-n.distance);const s=[];let i=!1;for(const l of o.fallingShards){const n=t.fallSpeedPerSec*(l.slammed?h.SLAM_SPEED_MULTIPLIER:1);l.distance-=n*e/1e3;const u=U(l.lane,o.coreRotationIndex,o.numSides),d=o.stacks[u],v=(d.length+1)*h.BLOCK_RADIAL_THICKNESS;if(l.distance<=v){const p={id:l.id,color:l.color,radialOffset:0};d.push(p),i=!0,l.slammed&&(o.score+=h.SLAM_SCORE_BONUS_PER_BLOCK),o.events.push({type:"SHARD_LOCKED",face:u,depth:d.length-1,color:l.color})}else s.push(l)}return o.fallingShards=s,i&&(k(o,1).outerBlocksDropped&&(o.gravitySettleTimerMs=95,o.pendingCascadeDepth=2),j(o)),o.rngState=a.getState(),o}class Z{container;audio;callbacks;rootEl;canvas;ctx;scoreValEl;highScoreValEl;levelValEl;coreBadgeEl;clearsValEl;comboValEl;pulseFillEl;pulseBtnEl;pauseBtnEl;muteBtnEl;debugBtnEl;liveAnnouncerEl;overlayEl;debugPanelEl;visualAngleRad=0;screenShakeMs=0;screenShakeMagnitude=0;morphBannerTimerMs=0;morphBannerText="";particles=[];popups=[];shockwaves=[];debugVisible=!1;lastAnnouncedStatus="";lastAnnouncedLevel=1;boundKeyDown;boundResize;constructor(e,t,a,r=!1){this.container=e,this.audio=t,this.callbacks=a,this.debugVisible=r,this.boundKeyDown=this.handleKeyDown.bind(this),this.boundResize=this.handleResize.bind(this),this.buildDOM(),window.addEventListener("keydown",this.boundKeyDown),window.addEventListener("resize",this.boundResize),this.handleResize()}buildDOM(){this.container.innerHTML="";const e=document.createElement("style");e.textContent=`
      .orbit-stack-shell {
        --os-bg: #070b19;
        --os-panel: #0f172a;
        --os-border: #334155;
        --os-text: #f8fafc;
        --os-muted: #cbd5e1;
        --os-accent: #22d3ee;
        --os-warn: #f43f5e;
        color-scheme: dark;
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
        background: radial-gradient(circle at 50% 35%, #111c38 0%, #070b19 72%);
        color: var(--os-text);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        gap: 8px;
        user-select: none;
      }
      .orbit-stack-shell *, .orbit-stack-shell *::before, .orbit-stack-shell *::after {
        box-sizing: border-box;
      }
      .os-visually-hidden:where(:not(:focus-within, :active)) {
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
      .os-header {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: rgba(15, 23, 42, 0.88);
        border: 1.5px solid var(--os-border);
        border-radius: 12px;
        padding: 8px 12px;
      }
      .os-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .os-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #f8fafc;
      }
      .os-core-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(6, 182, 212, 0.18);
        border: 1.5px solid #22d3ee;
        color: #ecfeff;
        letter-spacing: 0.04em;
      }
      .os-stats-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .os-stat {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .os-stat-label {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--os-muted);
      }
      .os-stat-value {
        font-size: 0.98rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: #ffffff;
      }
      .os-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .os-btn {
        appearance: none;
        background: #1e293b;
        color: #f8fafc;
        border: 1.5px solid #64748b;
        border-radius: 8px;
        padding: 6px 11px;
        min-block-size: 36px;
        min-inline-size: 36px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: background 120ms ease, transform 80ms ease, border-color 120ms ease;
      }
      .os-btn:hover {
        background: #334155;
        border-color: #94a3b8;
      }
      .os-btn:active {
        transform: scale(0.97);
      }
      .os-btn:focus-visible {
        outline: 3px solid #38bdf8;
        outline-offset: 3px;
      }
      .os-btn[aria-pressed="true"] {
        background: #0e7490;
        border-color: #67e8f9;
        color: #ffffff;
      }
      .os-main {
        position: relative;
        width: 100%;
        max-width: 820px;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 340px;
      }
      .os-canvas-wrap {
        position: relative;
        width: min(100%, 500px);
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .os-canvas {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 16px;
        touch-action: none;
      }
      .os-overlay {
        position: absolute;
        inset: 0;
        background: rgba(7, 11, 25, 0.86);
        backdrop-filter: blur(5px);
        border: 1.5px solid #475569;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        z-index: 10;
      }
      .os-overlay[hidden] {
        display: none !important;
      }
      .os-overlay-title {
        margin: 0 0 6px;
        font-size: 1.45rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #f8fafc;
      }
      .os-overlay-desc {
        margin: 0 0 16px;
        max-width: 360px;
        font-size: 0.88rem;
        line-height: 1.45;
        color: #cbd5e1;
      }
      .os-overlay-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
      .os-btn-primary {
        background: #0284c7;
        border-color: #7dd3fc;
        color: #ffffff;
        padding: 9px 16px;
        font-size: 0.86rem;
      }
      .os-btn-primary:hover {
        background: #0369a1;
      }
      .os-footer {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .os-controls-bar {
        display: grid;
        grid-template-columns: 1fr 1fr 1.15fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .os-action-btn {
        min-block-size: 44px;
        font-size: 0.84rem;
        border-radius: 10px;
      }
      .os-pulse-btn {
        position: relative;
        overflow: hidden;
        background: #1e1b4b;
        border-color: #818cf8;
      }
      .os-pulse-btn[data-ready="true"] {
        background: #4c1d95;
        border-color: #ddd6fe;
        box-shadow: 0 0 12px rgba(167, 139, 250, 0.45);
      }
      .os-pulse-fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: 50%;
        background: rgba(139, 92, 246, 0.32);
        pointer-events: none;
        transition: width 120ms linear;
      }
      .os-pulse-label {
        position: relative;
        z-index: 1;
      }
      .os-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.72rem;
        color: var(--os-muted);
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px 10px;
      }
      .os-glyph-list {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .os-glyph-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 5px;
        font-weight: 700;
        font-size: 0.7rem;
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid #475569;
      }
      .os-debug-panel {
        width: 100%;
        max-width: 820px;
        background: rgba(2, 6, 23, 0.92);
        border: 1.5px solid #38bdf8;
        border-radius: 8px;
        padding: 8px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        color: #bae6fd;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 6px;
      }
      .os-debug-panel[hidden] {
        display: none !important;
      }
      @media (pointer: coarse) {
        .os-btn {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
        .os-action-btn {
          min-block-size: 50px;
        }
      }
      @media (forced-colors: active) {
        .os-btn, .os-header, .os-overlay, .os-legend {
          border: 2px solid ButtonText;
        }
      }
    `,this.container.appendChild(e),this.rootEl=document.createElement("div"),this.rootEl.className="orbit-stack-shell",this.rootEl.innerHTML=`
      <div class="os-visually-hidden" aria-live="polite" aria-atomic="true" data-role="live-announcer"></div>

      <header class="os-header">
        <div class="os-brand">
          <h1 class="os-title">Orbit Stack</h1>
          <span class="os-core-badge" data-role="core-badge">HEX CORE (6 SIDES)</span>
        </div>

        <div class="os-stats-row">
          <div class="os-stat">
            <span class="os-stat-label">Score</span>
            <span class="os-stat-value" data-role="score-val">0</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Best</span>
            <span class="os-stat-value" data-role="best-val">0</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Level</span>
            <span class="os-stat-value" data-role="level-val">1</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Cleared</span>
            <span class="os-stat-value" data-role="clears-val">0 / 100</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Combo</span>
            <span class="os-stat-value" data-role="combo-val">x1</span>
          </div>
        </div>

        <div class="os-toolbar">
          <button type="button" class="os-btn" data-role="pause-btn" aria-pressed="false">Pause (P)</button>
          <button type="button" class="os-btn" data-role="mute-btn" aria-pressed="false">Audio On</button>
          <button type="button" class="os-btn" data-role="debug-btn" aria-pressed="${this.debugVisible}">Debug (D)</button>
          <button type="button" class="os-btn" data-role="restart-btn">Restart</button>
        </div>
      </header>

      <main class="os-main">
        <div class="os-canvas-wrap">
          <canvas class="os-canvas" width="540" height="540" aria-label="Orbit Stack radial polygon puzzle board"></canvas>
          <div class="os-overlay" data-role="overlay" role="dialog" aria-labelledby="os-overlay-heading" hidden>
            <h2 class="os-overlay-title" id="os-overlay-heading" data-role="overlay-title">PAUSED</h2>
            <p class="os-overlay-desc" data-role="overlay-desc">Orbital shard streams suspended.</p>
            <div class="os-overlay-actions" data-role="overlay-actions"></div>
          </div>
        </div>
      </main>

      <aside class="os-debug-panel" data-role="debug-panel" aria-label="Debug Telemetry" ${this.debugVisible?"":"hidden"}></aside>

      <footer class="os-footer">
        <div class="os-controls-bar">
          <button type="button" class="os-btn os-action-btn" data-role="rot-left-btn">⟲ Rotate Left (A / ←)</button>
          <button type="button" class="os-btn os-action-btn" data-role="slam-btn">⚡ Slam Shard (Space / ↓)</button>
          <button type="button" class="os-btn os-action-btn os-pulse-btn" data-role="pulse-btn" data-ready="false">
            <span class="os-pulse-fill" data-role="pulse-fill"></span>
            <span class="os-pulse-label" data-role="pulse-label">✦ Pulse 50% (Shift / ↑)</span>
          </button>
          <button type="button" class="os-btn os-action-btn" data-role="rot-right-btn">Rotate Right (D / →) ⟳</button>
        </div>
        <div class="os-legend">
          <span><strong>Goal:</strong> Match 3+ connected shards (radial or adjacent faces). Morphs 6 → 7 (Lv4) → 8 sides (Lv7).</span>
          <div class="os-glyph-list" aria-label="Colorblind Shard Key">
            <span class="os-glyph-chip" style="color:#67e8f9">▲ Cyan</span>
            <span class="os-glyph-chip" style="color:#fde68a">● Amber</span>
            <span class="os-glyph-chip" style="color:#fbcfe8">■ Magenta</span>
            <span class="os-glyph-chip" style="color:#a7f3d0">◆ Emerald</span>
            <span class="os-glyph-chip" style="color:#ddd6fe">★ Violet (Lv4+)</span>
          </div>
        </div>
      </footer>
    `,this.container.appendChild(this.rootEl),this.canvas=this.rootEl.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),this.scoreValEl=this.rootEl.querySelector('[data-role="score-val"]'),this.highScoreValEl=this.rootEl.querySelector('[data-role="best-val"]'),this.levelValEl=this.rootEl.querySelector('[data-role="level-val"]'),this.coreBadgeEl=this.rootEl.querySelector('[data-role="core-badge"]'),this.clearsValEl=this.rootEl.querySelector('[data-role="clears-val"]'),this.comboValEl=this.rootEl.querySelector('[data-role="combo-val"]'),this.pulseFillEl=this.rootEl.querySelector('[data-role="pulse-fill"]'),this.pulseBtnEl=this.rootEl.querySelector('[data-role="pulse-btn"]'),this.pauseBtnEl=this.rootEl.querySelector('[data-role="pause-btn"]'),this.muteBtnEl=this.rootEl.querySelector('[data-role="mute-btn"]'),this.debugBtnEl=this.rootEl.querySelector('[data-role="debug-btn"]'),this.liveAnnouncerEl=this.rootEl.querySelector('[data-role="live-announcer"]'),this.overlayEl=this.rootEl.querySelector('[data-role="overlay"]'),this.debugPanelEl=this.rootEl.querySelector('[data-role="debug-panel"]'),this.rootEl.querySelector('[data-role="rot-left-btn"]').addEventListener("click",()=>{this.callbacks.onAction({type:"ROTATE_LEFT"})}),this.rootEl.querySelector('[data-role="rot-right-btn"]').addEventListener("click",()=>{this.callbacks.onAction({type:"ROTATE_RIGHT"})}),this.rootEl.querySelector('[data-role="slam-btn"]').addEventListener("click",()=>{this.callbacks.onAction({type:"SLAM_INWARD"})}),this.pulseBtnEl.addEventListener("click",()=>{this.callbacks.onAction({type:"PHASE_PULSE"})}),this.pauseBtnEl.addEventListener("click",()=>{this.callbacks.onAction({type:"TOGGLE_PAUSE"})}),this.muteBtnEl.addEventListener("click",()=>{const t=this.audio.toggleMute();this.muteBtnEl.setAttribute("aria-pressed",String(t)),this.muteBtnEl.textContent=t?"Audio Muted":"Audio On"}),this.debugBtnEl.addEventListener("click",()=>{this.callbacks.onToggleDebug()}),this.rootEl.querySelector('[data-role="restart-btn"]').addEventListener("click",()=>{this.callbacks.onRestart()}),this.canvas.addEventListener("pointerdown",t=>{const a=this.canvas.getBoundingClientRect(),r=t.clientX-a.left,s=t.clientY-a.top,i=a.width/2,l=a.height/2;Math.hypot(r-i,s-l)<a.width*.14?this.callbacks.onAction({type:"SLAM_INWARD"}):r<i?this.callbacks.onAction({type:"ROTATE_LEFT"}):this.callbacks.onAction({type:"ROTATE_RIGHT"})})}handleKeyDown(e){if(e.defaultPrevented)return;const t=e.target;if(!(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable)))switch(e.key){case"ArrowLeft":case"a":case"A":e.preventDefault(),this.callbacks.onAction({type:"ROTATE_LEFT"});break;case"ArrowRight":case"d":case"D":e.preventDefault(),e.shiftKey||e.altKey?this.callbacks.onToggleDebug():this.callbacks.onAction({type:"ROTATE_RIGHT"});break;case" ":case"ArrowDown":case"s":case"S":e.preventDefault(),this.callbacks.onAction({type:"SLAM_INWARD"});break;case"Shift":case"ArrowUp":case"w":case"W":e.preventDefault(),this.callbacks.onAction({type:"PHASE_PULSE"});break;case"p":case"P":e.preventDefault(),this.callbacks.onAction({type:"TOGGLE_PAUSE"});break;case"i":case"I":case"`":case"F3":e.preventDefault(),this.callbacks.onToggleDebug();break;case"r":case"R":e.preventDefault(),this.callbacks.onRestart();break}}handleResize(){if(!this.canvas)return;const e=this.canvas.getBoundingClientRect(),t=Math.min(2,window.devicePixelRatio||1),a=Math.max(300,Math.floor(Math.min(e.width,e.height)*t));(this.canvas.width!==a||this.canvas.height!==a)&&(this.canvas.width=a,this.canvas.height=a)}setDebugVisible(e){this.debugVisible=e,this.debugPanelEl&&(this.debugPanelEl.hidden=!e),this.debugBtnEl&&this.debugBtnEl.setAttribute("aria-pressed",String(e))}isDebugVisible(){return this.debugVisible}resetVisuals(){this.visualAngleRad=0,this.particles=[],this.popups=[],this.shockwaves=[],this.screenShakeMs=0,this.morphBannerTimerMs=0}consumeEvents(e,t){const a=this.canvas.width/2,r=this.canvas.height/2,s=this.canvas.width*.44,i=s*.25,l=s-i;for(const n of t)if(n.type==="ROTATED")this.audio.playRotateTick();else if(n.type==="SHARD_LOCKED")this.audio.playShardLock(n.color??0,n.depth??0),this.screenShakeMs=Math.max(this.screenShakeMs,55),this.screenShakeMagnitude=Math.max(this.screenShakeMagnitude,2.2);else if(n.type==="MATCH_CLEARED"||n.type==="CASCADE_CLEARED"){if(this.audio.playMatchChord(n.color??0,n.clearedCount??3,n.comboMultiplier??1,n.cascadeDepth??1),this.screenShakeMs=Math.max(this.screenShakeMs,130),this.screenShakeMagnitude=Math.max(this.screenShakeMagnitude,(n.clearedCount??3)>=5?6.5:4),n.cells&&n.cells.length>0){let u=0,d=0;const v=Math.PI*2/e.numSides;for(const y of n.cells){const c=X(y.face,e.coreRotationIndex,e.numSides),f=-Math.PI/2+c*v,b=i+(y.depth+.5)*h.BLOCK_RADIAL_THICKNESS*l,E=a+Math.cos(f)*b,x=r+Math.sin(f)*b;u+=E,d+=x,this.spawnBurstParticles(E,x,y.color,9)}const p=u/n.cells.length,m=d/n.cells.length,g=M[n.color??0]??M[0],A=n.type==="CASCADE_CLEARED"?`CASCADE +${n.scoreDelta}`:`+${n.scoreDelta}`,S=(n.comboMultiplier??1)>1?`${g.symbol} x${n.comboMultiplier} COMBO!`:void 0;this.popups.push({x:p,y:m,vy:-42,text:A,subtext:S,color:g.strokeHex,lifeMs:950,maxLifeMs:950})}}else if(n.type==="POLYGON_MORPHED"){this.audio.playMorphFanfare(n.newSides??7);const u=I(n.newSides??7);this.morphBannerText=`MORPH UNLOCKED: ${u.title}`,this.morphBannerTimerMs=2600,this.shockwaves.push({radius:i,maxRadius:s*1.05,color:u.badgeColor,lifeMs:650,maxLifeMs:650})}else n.type==="PHASE_PULSE_FIRED"?(this.audio.playPhasePulse(),this.screenShakeMs=190,this.screenShakeMagnitude=7.5,this.shockwaves.push({radius:i*.8,maxRadius:s*1.08,color:"#a78bfa",lifeMs:520,maxLifeMs:520}),this.popups.push({x:a,y:r-i*.9,vy:-36,text:`PHASE PULSE +${n.scoreDelta??150}`,subtext:"INNER RING VAPORIZED",color:"#ddd6fe",lifeMs:1100,maxLifeMs:1100})):n.type==="GAME_OVER"&&(this.audio.playContainmentBreach(),this.screenShakeMs=280,this.screenShakeMagnitude=9)}spawnBurstParticles(e,t,a,r){const s=M[a]??M[0];for(let i=0;i<r;i++){const l=Math.PI*2*i/r+(Math.random()-.5)*.4,n=45+Math.random()*115,u=340+Math.random()*260;this.particles.push({x:e,y:t,vx:Math.cos(l)*n,vy:Math.sin(l)*n,radius:2.8+Math.random()*3,color:i%2===0?s.fillHex:s.strokeHex,alpha:1,lifeMs:u,maxLifeMs:u})}}render(e,t,a){const r=I(e.numSides);this.scoreValEl.textContent=e.score.toLocaleString(),this.highScoreValEl.textContent=Math.max(t.highScore,e.score).toLocaleString(),this.levelValEl.textContent=String(e.level),this.coreBadgeEl.textContent=r.title,this.coreBadgeEl.style.borderColor=r.badgeColor,this.clearsValEl.textContent=`${e.totalClearedBlocks} / ${h.VICTORY_TARGET_CLEARS}`,this.comboValEl.textContent=`x${e.comboMultiplier}`;const s=Math.min(100,Math.round(e.phasePulseCharge/h.PHASE_PULSE_MAX_CHARGE*100)),i=e.phasePulseCharge>=h.PHASE_PULSE_MAX_CHARGE;this.pulseFillEl.style.width=`${s}%`,this.pulseBtnEl.setAttribute("data-ready",String(i));const l=this.pulseBtnEl.querySelector('[data-role="pulse-label"]');l&&(l.textContent=i?"✦ PHASE PULSE READY! (Shift / ↑)":`✦ Pulse ${s}% (Shift / ↑)`);const n=e.status==="PAUSED";if(this.pauseBtnEl.setAttribute("aria-pressed",String(n)),this.pauseBtnEl.textContent=n?"Resume (P)":"Pause (P)",(e.status!==this.lastAnnouncedStatus||e.level!==this.lastAnnouncedLevel)&&(this.lastAnnouncedStatus=e.status,this.lastAnnouncedLevel=e.level,e.status==="GAME_OVER"?this.liveAnnouncerEl.textContent=`Containment Breach! Game Over at Level ${e.level} with score ${e.score}.`:e.status==="VICTORY"?this.liveAnnouncerEl.textContent=`Octa-Core Mastery Achieved! Level ${e.level}, ${e.totalClearedBlocks} shards cleared.`:e.level>1&&(this.liveAnnouncerEl.textContent=`Level ${e.level} reached. ${r.title}.`)),this.updateOverlay(e),this.debugVisible){const p=H(e.level),m=e.stacks.map((g,A)=>`F${A}:${g.length}`).join(" ");this.debugPanelEl.innerHTML=`
        <div><strong>SEED:</strong> ${e.seed}</div>
        <div><strong>RNG:</strong> 0x${e.rngState.toString(16).toUpperCase()}</div>
        <div><strong>SIDES:</strong> ${e.numSides} (RotIdx: ${e.coreRotationIndex})</div>
        <div><strong>WAVE:</strong> ${R[e.currentWavePattern].label}</div>
        <div><strong>SPEED:</strong> ${p.speedMultiplier.toFixed(2)}x (Lv${p.effectiveLevel}/35)</div>
        <div><strong>STACKS:</strong> ${m}</div>
      `}const u=Math.PI*2/e.numSides,d=e.visualRotationSteps*u,v=1-Math.exp(-18*a/1e3);this.visualAngleRad+=(d-this.visualAngleRad)*v,this.screenShakeMs>0&&(this.screenShakeMs=Math.max(0,this.screenShakeMs-a)),this.morphBannerTimerMs>0&&(this.morphBannerTimerMs=Math.max(0,this.morphBannerTimerMs-a));for(let p=this.particles.length-1;p>=0;p--){const m=this.particles[p];m.lifeMs-=a,m.lifeMs<=0?this.particles.splice(p,1):(m.x+=m.vx*a/1e3,m.y+=m.vy*a/1e3,m.alpha=Math.max(0,m.lifeMs/m.maxLifeMs))}for(let p=this.popups.length-1;p>=0;p--){const m=this.popups[p];m.lifeMs-=a,m.lifeMs<=0?this.popups.splice(p,1):m.y+=m.vy*a/1e3}for(let p=this.shockwaves.length-1;p>=0;p--){const m=this.shockwaves[p];m.lifeMs-=a,m.lifeMs<=0&&this.shockwaves.splice(p,1)}this.drawBoard(e)}updateOverlay(e){if(e.status==="PLAYING"){this.overlayEl.hidden=!0;return}this.overlayEl.hidden=!1;const t=this.overlayEl.querySelector('[data-role="overlay-title"]'),a=this.overlayEl.querySelector('[data-role="overlay-desc"]'),r=this.overlayEl.querySelector('[data-role="overlay-actions"]');if(r.innerHTML="",e.status==="PAUSED"){t.textContent="ORBIT PAUSED",a.textContent="Rotate the polygon core so 3+ matching shards connect radially or across adjacent faces.";const s=document.createElement("button");s.type="button",s.className="os-btn os-btn-primary",s.textContent="Resume Orbit (P)",s.addEventListener("click",()=>this.callbacks.onAction({type:"TOGGLE_PAUSE"})),r.appendChild(s)}else if(e.status==="VICTORY"){t.textContent="OCTA-CORE MASTERY!",a.textContent=`You reached Level ${e.level} (8-Sided Octa Core) and cleared ${e.totalClearedBlocks} orbital shards! Score: ${e.score.toLocaleString()}.`;const s=document.createElement("button");s.type="button",s.className="os-btn os-btn-primary",s.textContent="Continue Endless Orbit (To Lv 35)",s.addEventListener("click",()=>this.callbacks.onAction({type:"CONTINUE_ENDLESS"}));const i=document.createElement("button");i.type="button",i.className="os-btn",i.textContent="New Seeded Run",i.addEventListener("click",()=>this.callbacks.onRestart()),r.appendChild(s),r.appendChild(i)}else if(e.status==="GAME_OVER"){t.textContent="CONTAINMENT BREACH",a.textContent=`Face ${(e.breachedFace??0)+1} exceeded the ${h.MAX_STACK_DEPTH}-shard containment perimeter! Final Score: ${e.score.toLocaleString()} · Level ${e.level} · Max Combo x${e.maxComboReached}.`;const s=document.createElement("button");s.type="button",s.className="os-btn os-btn-primary",s.textContent="Play Again (R)",s.addEventListener("click",()=>this.callbacks.onRestart()),r.appendChild(s)}}drawBoard(e){const t=this.ctx,a=this.canvas.width,r=this.canvas.height,s=a/2,i=r/2;if(t.save(),t.clearRect(0,0,a,r),this.screenShakeMs>0){const c=this.screenShakeMs/200*this.screenShakeMagnitude;t.translate((Math.random()-.5)*c*2,(Math.random()-.5)*c*2)}const l=e.numSides,n=Math.PI*2/l,u=a*.45,d=u*.25,v=u-d,p=d+h.MAX_STACK_DEPTH*h.BLOCK_RADIAL_THICKNESS*v;for(let c=0;c<l;c++){const f=-Math.PI/2+c*n,b=f-n/2,E=f+n/2;t.beginPath(),t.moveTo(s+Math.cos(b)*d,i+Math.sin(b)*d),t.lineTo(s+Math.cos(b)*u,i+Math.sin(b)*u),t.lineTo(s+Math.cos(E)*u,i+Math.sin(E)*u),t.lineTo(s+Math.cos(E)*d,i+Math.sin(E)*d),t.closePath(),t.fillStyle=c%2===0?"rgba(15, 23, 42, 0.45)":"rgba(30, 41, 59, 0.28)",t.fill(),t.beginPath(),t.moveTo(s+Math.cos(b)*d,i+Math.sin(b)*d),t.lineTo(s+Math.cos(b)*u,i+Math.sin(b)*u),t.strokeStyle="rgba(148, 163, 184, 0.22)",t.lineWidth=1.25,t.stroke()}const m=e.stacks.some(c=>c.length>=h.DANGER_STACK_DEPTH);t.beginPath();for(let c=0;c<l;c++){const f=-Math.PI/2+c*n-n/2,b=s+Math.cos(f)*p,E=i+Math.sin(f)*p;c===0?t.moveTo(b,E):t.lineTo(b,E)}t.closePath(),t.strokeStyle=m?"rgba(244, 63, 94, 0.92)":"rgba(244, 63, 94, 0.48)",t.lineWidth=m?3:2,t.setLineDash([7,5]),t.stroke(),t.setLineDash([]);for(const c of e.fallingShards){const f=U(c.lane,e.coreRotationIndex,l),b=e.stacks[f]?.length??0,E=d+b*h.BLOCK_RADIAL_THICKNESS*v,x=E+h.BLOCK_RADIAL_THICKNESS*v*.92,C=-Math.PI/2+c.lane*n,P=M[c.color]??M[0];this.drawTrapezoidShard(t,s,i,C,n*.92,E,x,P,!0)}for(let c=0;c<l;c++){const f=-Math.PI/2+c*n+this.visualAngleRad,b=e.stacks[c]??[];if(b.length>=h.DANGER_STACK_DEPTH){const E=f-n/2,x=f+n/2;t.beginPath(),t.moveTo(s+Math.cos(E)*d,i+Math.sin(E)*d),t.lineTo(s+Math.cos(E)*p,i+Math.sin(E)*p),t.lineTo(s+Math.cos(x)*p,i+Math.sin(x)*p),t.lineTo(s+Math.cos(x)*d,i+Math.sin(x)*d),t.closePath(),t.fillStyle="rgba(244, 63, 94, 0.16)",t.fill()}for(let E=0;E<b.length;E++){const x=b[E],C=E*h.BLOCK_RADIAL_THICKNESS+x.radialOffset,P=d+C*v+1.5,oe=P+h.BLOCK_RADIAL_THICKNESS*v-3,se=M[x.color]??M[0];this.drawTrapezoidShard(t,s,i,f,n*.94,P,oe,se,!1)}}for(const c of e.fallingShards){const f=-Math.PI/2+c.lane*n,b=d+c.distance*v,E=b-h.BLOCK_RADIAL_THICKNESS*v+2.5,x=M[c.color]??M[0];this.drawTrapezoidShard(t,s,i,f,n*.92,Math.max(d,E),b,x,!1)}const g=I(l);t.beginPath();for(let c=0;c<l;c++){const f=-Math.PI/2+c*n-n/2+this.visualAngleRad,b=s+Math.cos(f)*d,E=i+Math.sin(f)*d;c===0?t.moveTo(b,E):t.lineTo(b,E)}t.closePath(),t.fillStyle="#0f172a",t.fill(),t.lineWidth=3.2,t.strokeStyle=g.badgeColor,t.stroke();const A=-Math.PI/2+this.visualAngleRad,S=d*.72;if(t.beginPath(),t.arc(s+Math.cos(A)*S,i+Math.sin(A)*S,4.5,0,Math.PI*2),t.fillStyle="#38bdf8",t.fill(),e.comboTimerMs>0){const c=e.comboTimerMs/h.COMBO_WINDOW_MS;t.beginPath(),t.arc(s,i,d*.56,-Math.PI/2,-Math.PI/2+Math.PI*2*c),t.strokeStyle="#fbbf24",t.lineWidth=4,t.stroke()}t.fillStyle="#f8fafc",t.textAlign="center",t.textBaseline="middle",t.font=`900 ${Math.round(a*.042)}px Inter, sans-serif`,t.fillText(e.comboMultiplier>1?`x${e.comboMultiplier}`:`${l}-GON`,s,i-a*.015);const y=D(e.level+1);t.fillStyle="#94a3b8",t.font=`700 ${Math.round(a*.022)}px Inter, sans-serif`,t.fillText(`LV ${e.level} · ${e.totalClearedBlocks}/${y}`,s,i+a*.024);for(const c of this.shockwaves){const f=1-c.lifeMs/c.maxLifeMs,b=c.radius+(c.maxRadius-c.radius)*f;t.beginPath(),t.arc(s,i,b,0,Math.PI*2),t.strokeStyle=c.color,t.globalAlpha=Math.max(0,1-f),t.lineWidth=4.5*(1-f*.6),t.stroke(),t.globalAlpha=1}for(const c of this.particles)t.beginPath(),t.arc(c.x,c.y,c.radius,0,Math.PI*2),t.fillStyle=c.color,t.globalAlpha=c.alpha,t.fill();t.globalAlpha=1;for(const c of this.popups){const f=Math.min(1,c.lifeMs/c.maxLifeMs*1.4);t.globalAlpha=f,t.font=`800 ${Math.round(a*.032)}px Inter, sans-serif`,t.fillStyle="#020617",t.fillText(c.text,c.x+1.5,c.y+1.5),t.fillStyle=c.color,t.fillText(c.text,c.x,c.y),c.subtext&&(t.font=`700 ${Math.round(a*.022)}px Inter, sans-serif`,t.fillStyle="#fde68a",t.fillText(c.subtext,c.x,c.y+a*.03))}if(t.globalAlpha=1,this.morphBannerTimerMs>0){const c=Math.min(1,this.morphBannerTimerMs/400);t.globalAlpha=c,t.fillStyle="rgba(15, 23, 42, 0.92)";const f=a*.72,b=r*.085;t.fillRect(s-f/2,r*.05,f,b),t.strokeStyle=g.badgeColor,t.lineWidth=2,t.strokeRect(s-f/2,r*.05,f,b),t.fillStyle="#f8fafc",t.font=`800 ${Math.round(a*.028)}px Inter, sans-serif`,t.fillText(this.morphBannerText,s,r*.05+b/2),t.globalAlpha=1}t.restore()}drawTrapezoidShard(e,t,a,r,s,i,l,n,u){const d=r-s/2,v=r+s/2,p=t+Math.cos(d)*i,m=a+Math.sin(d)*i,g=t+Math.cos(d)*l,A=a+Math.sin(d)*l,S=t+Math.cos(v)*l,y=a+Math.sin(v)*l,c=t+Math.cos(v)*i,f=a+Math.sin(v)*i;if(e.beginPath(),e.moveTo(p,m),e.lineTo(g,A),e.lineTo(S,y),e.lineTo(c,f),e.closePath(),u){e.fillStyle=n.fillHex,e.globalAlpha=.16,e.fill(),e.globalAlpha=.45,e.strokeStyle=n.strokeHex,e.lineWidth=1.4,e.stroke(),e.globalAlpha=1;return}e.fillStyle=n.fillHex,e.fill(),e.strokeStyle=n.strokeHex,e.lineWidth=1.75,e.stroke();const b=(i+l)/2,E=t+Math.cos(r)*b,x=a+Math.sin(r)*b,C=Math.max(10,Math.round((l-i)*.58));e.font=`900 ${C}px Inter, sans-serif`,e.textAlign="center",e.textBaseline="middle",e.fillStyle=n.textHex,e.fillText(n.symbol,E,x)}destroy(){window.removeEventListener("keydown",this.boundKeyDown),window.removeEventListener("resize",this.boundResize),this.container.innerHTML=""}}const ee={id:"08-orbit-stack",number:8,title:"Orbit Stack",subtitle:"Morphing Polygon Ring Matcher (6 → 7 → 8 Sides)",genre:"Radial Action-Puzzle",primaryReference:"Hextris (Engstrom, Finucane, Moroze, Yang)",supportingReference:"Super Hexagon (Terry Cavanagh)",oneSentenceLoop:"Colored orbital shards fly inward toward a rotating central polygon core; rotate the core (Left/Right) or trigger a Phase Pulse (Shift/Up) and Slam (Space/Down) so 3+ connected same-color blocks match and clear before any side breaches the outer containment ring!",shortGoal:"Reach Level 8 (Octa-Core Mastery) and survive 100 cleared shards to unlock Victory and Endless Orbit.",longGoal:"Master the 6 → 7 → 8 polygon morph transitions, chain x8 cross-face cascades, and conquer the Level 35 asymptotic speed cap.",controlsSummary:"Left/Right (A/D): Rotate Polygon · Space/Down: Slam Shard · Shift/Up: Phase Pulse · P: Pause",accentColor:"#22d3ee"};function te(o,e){const t=Y();let a={...t.career};const r=e?.initialSeed??h.DEFAULT_SEED;let s=e?.initialSeed===void 0&&t.activeRun&&t.activeRun.status!=="GAME_OVER"?L(t.activeRun):w(r);const i=new K,l=S=>{Q(s,S),s.events.length>0&&(d.consumeEvents(s,s.events),s.events=[]),s.status==="PAUSED"&&(a=T(a,s).career)},n=S=>{const y=typeof S=="number"?S:s.seed+104729>>>0;a.gamesPlayed+=1,s=w(y),d.resetVisuals(),a=T(a,s).career},u=S=>{const y=typeof S=="boolean"?S:!d.isDebugVisible();d.setDebugVisible(y)},d=new Z(o,i,{onAction:l,onRestart:n,onToggleDebug:()=>u()},!!e?.debug);let v=0,p=performance.now(),m=0,g=!1;const A=S=>{if(g)return;const y=Math.min(100,Math.max(0,S-p));p=S,m+=y;const c=s.level,f=s.status;for(;m>=h.FIXED_STEP_MS;)J(s,h.FIXED_STEP_MS),s.events.length>0&&(d.consumeEvents(s,s.events),s.events=[]),m-=h.FIXED_STEP_MS;(s.level!==c||s.status!==f||s.score>a.highScore)&&(a=T(a,s.status==="GAME_OVER"?null:s).career),d.render(s,a,y||h.FIXED_STEP_MS),v=window.requestAnimationFrame(A)};return d.render(s,a,h.FIXED_STEP_MS),v=window.requestAnimationFrame(A),{destroy(){g=!0,window.cancelAnimationFrame(v),T(a,s.status==="GAME_OVER"?null:s),i.destroy(),d.destroy()},getStateSnapshot(){return L(s)},restartWithSeed(S){n(S),d.render(s,a,h.FIXED_STEP_MS)},toggleDebug(S){u(S),d.render(s,a,h.FIXED_STEP_MS)}}}const ne={metadata:ee,mountGame:te},le=Object.freeze(Object.defineProperty({__proto__:null,BLOCK_ARCHETYPES:M,CONFIG:h,OrbitAudioEngine:K,OrbitUIController:Z,SAVE_SCHEMA_VERSION:_,WAVE_PATTERNS:R,applyInput:Q,checkContainmentBreach:j,cloneOrbitState:L,createDefaultCareerStats:z,createInitialState:w,createSeededRng:V,default:ne,deserializeOrbitEnvelope:N,findConnectedMatches:W,generateOrbitalWave:G,getClearedBlocksForLevel:D,getColorCountForLevel:q,getCoreStageInfo:I,getDifficultyForLevel:H,getLevelFromClearedBlocks:B,getSidesForLevel:O,getTargetFaceForLane:U,getWorldLaneForFace:X,loadOrbitSave:Y,metadata:ee,morphPolygonSides:F,mountGame:te,resolveAllCascades:ae,resolveMatchesStep:k,saveOrbitState:T,serializeOrbitEnvelope:$,stepOrbitState:J},Symbol.toStringTag,{value:"Module"}));export{le as g,te as m};
