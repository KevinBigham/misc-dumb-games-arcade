class de{ctx=null;enabled=!0;constructor(e=!0){this.enabled=e}setEnabled(e){this.enabled=e}isEnabled(){return this.enabled}getContext(){if(!this.enabled||typeof window>"u")return null;try{if(!this.ctx){const e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e)}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume(),this.ctx}catch{return null}}playSlide(){const e=this.getContext();if(e)try{const t=e.currentTime,r=e.createOscillator(),i=e.createGain();r.type="triangle",r.frequency.setValueAtTime(175,t),r.frequency.exponentialRampToValueAtTime(290,t+.055),i.gain.setValueAtTime(.08,t),i.gain.exponentialRampToValueAtTime(.001,t+.06),r.connect(i),i.connect(e.destination),r.start(t),r.stop(t+.065)}catch{}}playMerge(e){const t=this.getContext();if(t)try{const r=t.currentTime,i=261.63*Math.pow(1.09,Math.min(11,e)),s=t.createOscillator(),n=t.createGain();s.type="sine",s.frequency.setValueAtTime(i,r),s.frequency.exponentialRampToValueAtTime(i*1.35,r+.11),n.gain.setValueAtTime(.14,r),n.gain.exponentialRampToValueAtTime(.001,r+.13),s.connect(n),n.connect(t.destination),s.start(r),s.stop(r+.14);const o=Math.floor(t.sampleRate*.09),d=t.createBuffer(1,o,t.sampleRate),c=d.getChannelData(0);for(let k=0;k<o;k+=1)c[k]=(Math.random()*2-1)*(1-k/o);const l=t.createBufferSource();l.buffer=d;const f=t.createBiquadFilter();f.type="bandpass",f.frequency.setValueAtTime(3200,r);const h=t.createGain();h.gain.setValueAtTime(.05,r),h.gain.exponentialRampToValueAtTime(.001,r+.09),l.connect(f),f.connect(h),h.connect(t.destination),l.start(r)}catch{}}playOrderServed(e){const t=this.getContext();if(t)try{const r=t.currentTime,i=1+Math.min(6,e)*.04;[1046.5*i,1567.98*i].forEach((n,o)=>{const d=t.createOscillator(),c=t.createGain();d.type="sine",d.frequency.setValueAtTime(n,r+o*.03),c.gain.setValueAtTime(.14/(o+1),r+o*.03),c.gain.exponentialRampToValueAtTime(.001,r+.35+o*.04),d.connect(c),c.connect(t.destination),d.start(r+o*.03),d.stop(r+.4)})}catch{}}playBlocked(){const e=this.getContext();if(e)try{const t=e.currentTime,r=e.createOscillator(),i=e.createGain();r.type="sine",r.frequency.setValueAtTime(110,t),r.frequency.exponentialRampToValueAtTime(65,t+.08),i.gain.setValueAtTime(.09,t),i.gain.exponentialRampToValueAtTime(.001,t+.09),r.connect(i),i.connect(e.destination),r.start(t),r.stop(t+.095)}catch{}}playVictory(){const e=this.getContext();if(e)try{const t=e.currentTime;[523.25,659.25,783.99,1046.5].forEach((i,s)=>{const n=e.createOscillator(),o=e.createGain();n.type="triangle",n.frequency.setValueAtTime(i,t+s*.09),o.gain.setValueAtTime(.14,t+s*.09),o.gain.exponentialRampToValueAtTime(.001,t+s*.09+.35),n.connect(o),o.connect(e.destination),n.start(t+s*.09),n.stop(t+s*.09+.36)})}catch{}}playGameOver(){const e=this.getContext();if(e)try{const t=e.currentTime;[349.23,311.13,261.63].forEach((i,s)=>{const n=e.createOscillator(),o=e.createGain();n.type="sawtooth",n.frequency.setValueAtTime(i,t+s*.13),o.gain.setValueAtTime(.07,t+s*.13),o.gain.exponentialRampToValueAtTime(.001,t+s*.13+.28),n.connect(o),o.connect(e.destination),n.start(t+s*.13),n.stop(t+s*.13+.3)})}catch{}}destroy(){if(this.ctx){try{this.ctx.close()}catch{}this.ctx=null}}}const p={GAME_ID:"07-merge-kitchen",SAVE_VERSION:1,STORAGE_KEY_STATE:"argon_07_merge_kitchen_state_v1",STORAGE_KEY_PROFILE:"argon_07_merge_kitchen_profile_v1",GRID_SIZE:4,INITIAL_TILES:2,DEFAULT_SEED:204807,SPAWN_TIER_1_PROBABILITY:.9,SPAWN_TIER_1_VALUE:2,SPAWN_TIER_2_VALUE:4,ORDER_SLOT_COUNT:3,SHORT_GOAL_ORDERS:10,SHORT_GOAL_RECIPE_TIER:10,MAX_RECIPE_TIER:11,BASE_TIP_FRESH:1.5,BASE_TIP_WARM:1.25,BASE_TIP_LATE:1,RUSH_COMBO_STEP:.15,RUSH_COMBO_MAX_BONUS:1,RUSH_WINDOW_TURNS:8},E=[{tier:1,value:2,name:"Fresh Egg",shortName:"Fresh Egg",courseTag:"Mise en Place",description:"Farm-fresh pasture egg, ready to crack onto the copper prep station.",baseServeScore:15,bgGradient:"linear-gradient(145deg, #fffdf7 0%, #f5ebd6 100%)",borderColor:"#d9c398",textColor:"#4a3520",accentColor:"#d99b26",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="26" rx="13" ry="16" fill="#fff8ea" stroke="#c89d54" stroke-width="2.5"/>
      <circle cx="24" cy="28" r="6.5" fill="#f59e0b"/>
      <circle cx="22" cy="26" r="2" fill="#fef08a"/>
    </svg>`},{tier:2,value:4,name:"Whisked Batter",shortName:"Batter",courseTag:"Mise en Place",description:"Velvety egg and cream batter aerated in a hammered copper mixing bowl.",baseServeScore:30,bgGradient:"linear-gradient(145deg, #fff7e0 0%, #f3dca8 100%)",borderColor:"#d4ab58",textColor:"#4a3214",accentColor:"#c77d15",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M10 24 H38 A14 13 0 0 1 10 24 Z" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
      <ellipse cx="24" cy="24" rx="14" ry="4" fill="#fde68a" stroke="#78350f" stroke-width="2"/>
      <path d="M29 10 L22 23 M33 12 L25 24" stroke="#78350f" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`},{tier:3,value:8,name:"Golden Omelet",shortName:"Omelet",courseTag:"Café Classic",description:"French rolled omelet glazed with Normandy butter and snipped chives.",baseServeScore:60,bgGradient:"linear-gradient(145deg, #ffefc2 0%, #f8c963 100%)",borderColor:"#d99316",textColor:"#3f2708",accentColor:"#b45309",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="28" rx="17" ry="10" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>
      <path d="M12 27 C14 17, 34 17, 36 27 C31 32, 17 32, 12 27 Z" fill="#facc15" stroke="#a16207" stroke-width="2.2"/>
      <circle cx="20" cy="25" r="1.6" fill="#15803d"/>
      <circle cx="25" cy="24" r="1.6" fill="#15803d"/>
      <circle cx="29" cy="26" r="1.6" fill="#15803d"/>
    </svg>`},{tier:4,value:16,name:"Brioche Toast",shortName:"Brioche",courseTag:"Bakery Warmth",description:"Thick-cut golden brioche griddled crisp with a melting sea-salt butter medallion.",baseServeScore:120,bgGradient:"linear-gradient(145deg, #fed7aa 0%, #f59e56 100%)",borderColor:"#c25e1a",textColor:"#3b1806",accentColor:"#9a3412",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M13 20 C10 15, 16 11, 24 13 C32 11, 38 15, 35 20 L34 35 C34 37, 32 38, 30 38 H18 C16 38, 14 37, 14 35 Z" fill="#ea580c" stroke="#7c2d12" stroke-width="2.2"/>
      <path d="M16 21 C14 17, 19 14, 24 16 C29 14, 34 17, 32 21 L31 33 H17 Z" fill="#fde047"/>
      <rect x="20" y="22" width="8" height="7" rx="1.5" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.6"/>
    </svg>`},{tier:5,value:32,name:"Eggs Benedict",shortName:"Benedict",courseTag:"Brunch Star",description:"Poached eggs atop toasted brioche and smoked ham, draped in silky hollandaise.",baseServeScore:240,bgGradient:"linear-gradient(145deg, #fecaca 0%, #f47252 100%)",borderColor:"#b93822",textColor:"#ffffff",accentColor:"#7f1d1d",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="33" rx="17" ry="6" fill="#fff7ed" stroke="#7c2d12" stroke-width="2"/>
      <rect x="13" y="26" width="22" height="6" rx="3" fill="#d97706"/>
      <path d="M14 26 C14 18, 23 18, 24 25 C25 18, 34 18, 34 26 Z" fill="#fef08a" stroke="#a16207" stroke-width="2"/>
      <path d="M13 23 Q19 28 24 23 Q29 28 35 23" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    </svg>`},{tier:6,value:64,name:"Bistro Brunch",shortName:"Brunch",courseTag:"Brunch Star",description:"Cast-iron skillet feast with herb-roasted potatoes, confit tomatoes, and artisan charcuterie.",baseServeScore:480,bgGradient:"linear-gradient(145deg, #f87171 0%, #dc2626 100%)",borderColor:"#991b1b",textColor:"#ffffff",accentColor:"#fef08a",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx="22" cy="25" r="14" fill="#292524" stroke="#f59e0b" stroke-width="2.2"/>
      <path d="M35 20 L44 15" stroke="#292524" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="18" cy="22" r="4.5" fill="#fef08a"/>
      <circle cx="18" cy="22" r="2" fill="#f97316"/>
      <circle cx="27" cy="23" r="3.5" fill="#ef4444"/>
      <circle cx="23" cy="30" r="3.5" fill="#84cc16"/>
    </svg>`},{tier:7,value:128,name:"Truffle Risotto",shortName:"Risotto",courseTag:"Premier Course",description:"Aged Carnaroli rice simmered in parmesan brodo and crowned with shaved Périgord black truffle.",baseServeScore:950,bgGradient:"linear-gradient(145deg, #c084fc 0%, #7e22ce 100%)",borderColor:"#581c87",textColor:"#ffffff",accentColor:"#fde047",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="26" rx="17" ry="12" fill="#faf5ff" stroke="#581c87" stroke-width="2.2"/>
      <ellipse cx="24" cy="26" rx="11.5" ry="7.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.6"/>
      <circle cx="21" cy="25" r="2.8" fill="#27272a"/>
      <circle cx="26" cy="24" r="2.6" fill="#27272a"/>
      <circle cx="24" cy="28" r="2.4" fill="#3f3f46"/>
    </svg>`},{tier:8,value:256,name:"Wellington Roast",shortName:"Wellington",courseTag:"Chef Signature",description:"Center-cut tenderloin and mushroom duxelles wrapped in golden lattice puff pastry.",baseServeScore:1900,bgGradient:"linear-gradient(145deg, #60a5fa 0%, #1d4ed8 100%)",borderColor:"#1e3a8a",textColor:"#ffffff",accentColor:"#fde047",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="33" rx="18" ry="6" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
      <path d="M11 31 C11 17, 37 17, 37 31 Z" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
      <path d="M16 21 L24 31 M24 19 L31 31 M31 21 L23 31 M23 19 L16 31" stroke="#fde68a" stroke-width="1.6"/>
      <circle cx="24" cy="27" r="4.5" fill="#dc2626" stroke="#450a0a" stroke-width="1.5"/>
    </svg>`},{tier:9,value:512,name:"Tasting Menu",shortName:"Tasting",courseTag:"Haute Cuisine",description:"Seven-course silver-cloche degustation paired with vintage sommelier pours.",baseServeScore:3800,bgGradient:"linear-gradient(145deg, #34d399 0%, #047857 100%)",borderColor:"#064e3b",textColor:"#ffffff",accentColor:"#fef08a",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="8" y="32" width="32" height="4" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
      <path d="M11 32 A13 13 0 0 1 37 32 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
      <circle cx="24" cy="16" r="3" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/>
      <path d="M18 26 Q24 21 30 26" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    </svg>`},{tier:10,value:1024,name:"Michelin Grand Feast",shortName:"Grand Feast",courseTag:"3-Star Crown",description:"Three-Michelin-Star royal banquet service that cements your kitchen among culinary legends!",baseServeScore:8e3,bgGradient:"linear-gradient(145deg, #fbbf24 0%, #d97706 55%, #7c2d12 100%)",borderColor:"#fef08a",textColor:"#ffffff",accentColor:"#fef08a",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <polygon points="24,7 28,17 39,17 30,23 33,34 24,28 15,34 18,23 9,17 20,17" fill="#fde047" stroke="#78350f" stroke-width="2.2"/>
      <circle cx="24" cy="22" r="4.5" fill="#fffbeb"/>
    </svg>`},{tier:11,value:2048,name:"Chef's Legend",shortName:"Legend",courseTag:"Immortal Toque",description:"The mythical Golden Toque 2048 creation—pinnacle of gastronomic perfection!",baseServeScore:18e3,bgGradient:"linear-gradient(145deg, #fde047 0%, #f59e0b 45%, #9333ea 100%)",borderColor:"#ffffff",textColor:"#ffffff",accentColor:"#fde047",svgIcon:`<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M15 26 C10 24, 10 15, 17 15 C19 10, 29 10, 31 15 C38 15, 38 24, 33 26 L32 35 H16 Z" fill="#fef9c3" stroke="#78350f" stroke-width="2.2"/>
      <rect x="16" y="33" width="16" height="5" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
      <path d="M21 20 L24 14 L27 20 Z" fill="#eab308"/>
    </svg>`}],pe=new Map(E.map(a=>[a.tier,a])),ue=new Map(E.map(a=>[a.value,a]));function M(a){const e=Math.max(1,Math.min(E.length,Math.round(a)));return pe.get(e)??E[0]}function P(a){const e=ue.get(a);if(e)return e;const t=S(a);return M(t)}function S(a){if(a<=0)return 0;const e=Math.round(Math.log2(a));return Math.max(1,Math.min(E.length,e))}function q(a){return a<=0?0:Math.pow(2,a)}const U=[{id:"critic-moreau",patronName:"Inspector Moreau",tableLabel:"Table 1 · Window",orderQuote:"Crisp plating and hot pan sear, Chef!",avatarBadge:"🎩"},{id:"chef-colette",patronName:"Madame Colette",tableLabel:"Table 2 · Banquette",orderQuote:"My regulars swear by this house specialty.",avatarBadge:"🥂"},{id:"baron-henri",patronName:"Baron Henri",tableLabel:"Table 3 · Chef Counter",orderQuote:"Worth a double tip if served fresh off the pass!",avatarBadge:"🍷"},{id:"sommelier-luc",patronName:"Sommelier Luc",tableLabel:"Table 4 · Cellar Alcove",orderQuote:"I have the Burgundy uncorked and waiting.",avatarBadge:"🍇"},{id:"duchess-elodie",patronName:"Duchess Élodie",tableLabel:"Table 5 · Terrace",orderQuote:"Send it straight from the copper skillet!",avatarBadge:"👑"},{id:"journalist-remy",patronName:"Critic Rémy",tableLabel:"Table 6 · Salon",orderQuote:"Show me why this kitchen earned its stars.",avatarBadge:"✒️"}];function K(a,e){return a<2?e===0?[3]:[3,4]:a<5?e===0?[3,4]:e===1?[4,5]:[3,4,5]:a<9?e===0?[3,4]:e===1?[4,5]:[5,6]:e===0?[4,5]:e===1?[5,6,7]:[6,7,8]}class C{seed;state;calls;constructor(e,t,r=0){const i=(Number.isFinite(e)?Math.floor(e):204807)>>>0;this.seed=i===0?204807:i,this.state=t!==void 0?t>>>0:this.seed,this.calls=r}static fromSnapshot(e){return new C(e.seed,e.state,e.calls)}getSnapshot(){return{seed:this.seed,state:this.state>>>0,calls:this.calls}}clone(){return C.fromSnapshot(this.getSnapshot())}nextFloat(){this.calls+=1;let e=this.state+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),this.state=this.state>>>0,((e^e>>>14)>>>0)/4294967296}nextInt(e,t){if(t<=e)return e;const r=t-e+1;return e+Math.floor(this.nextFloat()*r)}pick(e){if(e.length===0)throw new Error("Cannot pick from an empty array");const t=this.nextInt(0,e.length-1);return e[t]}}function G(a=p.GRID_SIZE){return Array.from({length:a},()=>Array.from({length:a},()=>0))}function j(a){return a.map(e=>[...e])}function Y(a){const e=[];for(let t=0;t<a.length;t+=1)for(let r=0;r<a[t].length;r+=1)a[t][r]===0&&e.push({row:t,col:r});return e}function $(a,e){const t=Y(a);if(t.length===0)return null;const r=t[e.nextInt(0,t.length-1)],s=e.nextFloat()<p.SPAWN_TIER_1_PROBABILITY?p.SPAWN_TIER_1_VALUE:p.SPAWN_TIER_2_VALUE,n=S(s);return a[r.row][r.col]=s,{row:r.row,col:r.col,value:s,tier:n}}function V(a,e,t,r){const i=K(t,e),s=a.pick(i),n=M(s),o=a.pick(U),d=8+s*3;return{id:`ticket-${r}`,slotIndex:e,patronId:o.id,patronName:o.patronName,tableLabel:o.tableLabel,avatarBadge:o.avatarBadge,orderQuote:o.orderQuote,requiredTier:s,requiredValue:n.value,dishName:n.name,baseScore:n.baseServeScore,patienceTurns:d,maxPatienceTurns:d}}function O(a){const e=a.length,t=[],r=[],i=[],s=[];let n=0;for(let d=0;d<e;d+=1){const c=a[d];if(c===0)continue;const l=t.length-1;if(l>=0&&t[l]===c&&!r[l]){const f=c*2;t[l]=f,r[l]=!0,i.push(l),s.push(f),n+=f}else t.push(c),r.push(!1)}for(;t.length<e;)t.push(0);let o=!1;for(let d=0;d<e;d+=1)if(t[d]!==a[d]){o=!0;break}return{line:t,scoreDelta:n,mergedIndices:i,mergedValues:s,moved:o}}function Z(a,e){const t=a.length,r=G(t);let i=!1,s=0;const n=[];if(e==="LEFT")for(let o=0;o<t;o+=1){const d=a[o],c=O(d);c.moved&&(i=!0),s+=c.scoreDelta;for(let l=0;l<t;l+=1)r[o][l]=c.line[l];for(let l=0;l<c.mergedIndices.length;l+=1){const f=c.mergedIndices[l],h=c.mergedValues[l];n.push({row:o,col:f,value:h,tier:S(h),scoreAwarded:h})}}else if(e==="RIGHT")for(let o=0;o<t;o+=1){const d=[...a[o]].reverse(),c=O(d);c.moved&&(i=!0),s+=c.scoreDelta;for(let l=0;l<t;l+=1){const f=t-1-l;r[o][f]=c.line[l]}for(let l=0;l<c.mergedIndices.length;l+=1){const f=t-1-c.mergedIndices[l],h=c.mergedValues[l];n.push({row:o,col:f,value:h,tier:S(h),scoreAwarded:h})}}else if(e==="UP")for(let o=0;o<t;o+=1){const d=[];for(let l=0;l<t;l+=1)d.push(a[l][o]);const c=O(d);c.moved&&(i=!0),s+=c.scoreDelta;for(let l=0;l<t;l+=1)r[l][o]=c.line[l];for(let l=0;l<c.mergedIndices.length;l+=1){const f=c.mergedIndices[l],h=c.mergedValues[l];n.push({row:f,col:o,value:h,tier:S(h),scoreAwarded:h})}}else if(e==="DOWN")for(let o=0;o<t;o+=1){const d=[];for(let l=t-1;l>=0;l-=1)d.push(a[l][o]);const c=O(d);c.moved&&(i=!0),s+=c.scoreDelta;for(let l=0;l<t;l+=1){const f=t-1-l;r[f][o]=c.line[l]}for(let l=0;l<c.mergedIndices.length;l+=1){const f=t-1-c.mergedIndices[l],h=c.mergedValues[l];n.push({row:f,col:o,value:h,tier:S(h),scoreAwarded:h})}}return{grid:r,moved:i,scoreDelta:s,mergedCells:n}}function F(a,e){const t=q(e),r=[];for(let i=0;i<a.length;i+=1)for(let s=0;s<a[i].length;s+=1)a[i][s]===t&&r.push({row:i,col:s});return r}function W(a){const e=[];for(let t=0;t<a.tickets.length;t+=1){const r=a.tickets[t],i=F(a.grid,r.requiredTier);i.length>0&&e.push({ticketIndex:t,ticket:r,matchingCells:i})}return e}function Q(a){const e=a.length;for(let t=0;t<e;t+=1)for(let r=0;r<e;r+=1){const i=a[t][r];if(i===0||t+1<e&&a[t+1][r]===i||r+1<e&&a[t][r+1]===i)return!0}return!1}function L(a){return Q(a.grid)?!1:W(a).length===0}function z(a){return a.patienceTurns>Math.floor(a.maxPatienceTurns*.5)?p.BASE_TIP_FRESH:a.patienceTurns>0?p.BASE_TIP_WARM:p.BASE_TIP_LATE}function H(a){if(a<=1)return 1;const e=Math.min(p.RUSH_COMBO_MAX_BONUS,(a-1)*p.RUSH_COMBO_STEP);return Number((1+e).toFixed(2))}function X(a,e){let t=e;for(let r=0;r<a.length;r+=1)for(let i=0;i<a[r].length;i+=1)a[r][i]>t&&(t=a[r][i]);return{highestValue:t,highestTier:S(t)}}function J(a,e){const t=new Set(e);for(let r=0;r<a.length;r+=1)for(let i=0;i<a[r].length;i+=1){const s=a[r][i];s>0&&t.add(S(s))}return Array.from(t).sort((r,i)=>r-i)}function T(a=p.DEFAULT_SEED){const e=new C(a),t=G(p.GRID_SIZE);let r=null;for(let c=0;c<p.INITIAL_TILES;c+=1)r=$(t,e);let i=1;const s=[];for(let c=0;c<p.ORDER_SLOT_COUNT;c+=1)s.push(V(e,c,0,i)),i+=1;const{highestValue:n,highestTier:o}=X(t,2),d=J(t,[1]);return{version:p.SAVE_VERSION,grid:t,score:0,turnCount:0,ordersServed:0,highestValue:n,highestTier:o,discoveredTiers:d,rushCombo:0,turnsSinceLastServe:0,tickets:s,ticketSeq:i,status:"PLAYING",won:!1,keepPlaying:!1,lastMoveChangedBoard:!0,lastAction:{type:"INIT",changed:!0,scoreDelta:0,mergedCells:[],spawnedTile:r},rng:e.getSnapshot()}}function ee(a,e){if(e.type==="RESTART"){const t=e.seed??a.rng.seed,r=T(t);return{...r,lastAction:{...r.lastAction,type:"RESTART"}}}if(e.type==="KEEP_PLAYING"){if(!a.won)return a;const t=L(a)?"LOST":"PLAYING";return{...a,keepPlaying:!0,status:t,lastMoveChangedBoard:!1,lastAction:{type:"KEEP_PLAYING",changed:!0,scoreDelta:0,mergedCells:[],spawnedTile:null}}}if(a.status==="LOST"||a.status==="WON"&&!a.keepPlaying)return{...a,lastMoveChangedBoard:!1};if(e.type==="SLIDE"){const t=Z(a.grid,e.direction);if(!t.moved)return{...a,lastMoveChangedBoard:!1,lastAction:{type:"BLOCKED_SLIDE",changed:!1,direction:e.direction,scoreDelta:0,mergedCells:[],spawnedTile:null}};const r=C.fromSnapshot(a.rng),i=t.grid,s=$(i,r),n=a.tickets.map(g=>({...g,patienceTurns:Math.max(0,g.patienceTurns-1)})),o=a.turnsSinceLastServe+1;let d=a.rushCombo;d>0&&o>=p.RUSH_WINDOW_TURNS&&(d=Math.max(0,d-1));const{highestValue:c,highestTier:l}=X(i,a.highestValue),f=J(i,a.discoveredTiers),h=a.score+t.scoreDelta,k=a.turnCount+1,R=a.ordersServed>=p.SHORT_GOAL_ORDERS||l>=p.SHORT_GOAL_RECIPE_TIER,u=a.won||R;let m="PLAYING";return u&&!a.keepPlaying?m="WON":L({grid:i,tickets:n})&&(m="LOST"),{...a,grid:i,score:h,turnCount:k,highestValue:c,highestTier:l,discoveredTiers:f,rushCombo:d,turnsSinceLastServe:o,tickets:n,status:m,won:u,lastMoveChangedBoard:!0,lastAction:{type:"SLIDE",changed:!0,direction:e.direction,scoreDelta:t.scoreDelta,mergedCells:t.mergedCells,spawnedTile:s},rng:r.getSnapshot()}}if(e.type==="SERVE_ORDER"){const{ticketIndex:t,row:r,col:i}=e;if(t<0||t>=a.tickets.length)return{...a,lastMoveChangedBoard:!1,lastAction:{type:"INVALID_SERVE",changed:!1,scoreDelta:0,mergedCells:[],spawnedTile:null}};const s=a.tickets[t],n=F(a.grid,s.requiredTier);if(n.length===0)return{...a,lastMoveChangedBoard:!1,lastAction:{type:"INVALID_SERVE",changed:!1,scoreDelta:0,mergedCells:[],spawnedTile:null}};let o=n[0];if(r!==void 0&&i!==void 0){const I=n.find(D=>D.row===r&&D.col===i);I&&(o=I)}const d=C.fromSnapshot(a.rng),c=j(a.grid);c[o.row][o.col]=0;const l=c.flat().filter(I=>I>0).length;let f=null;l===0&&(f=$(c,d));const h=a.ordersServed+1,k=a.rushCombo+1,R=z(s),u=H(k),m=P(s.requiredValue),g=Math.round(m.baseServeScore*R*u),x=a.ticketSeq+1,b=V(d,t,h,a.ticketSeq),w=a.tickets.map((I,D)=>D===t?b:I),A=h>=p.SHORT_GOAL_ORDERS||a.highestTier>=p.SHORT_GOAL_RECIPE_TIER,v=a.won||A;let y="PLAYING";return v&&!a.keepPlaying?y="WON":L({grid:c,tickets:w})&&(y="LOST"),{...a,grid:c,score:a.score+g,ordersServed:h,rushCombo:k,turnsSinceLastServe:0,tickets:w,ticketSeq:x,status:y,won:v,lastMoveChangedBoard:!0,lastAction:{type:"SERVE_ORDER",changed:!0,scoreDelta:g,mergedCells:[],spawnedTile:f,servedTicket:{slotIndex:t,dishName:s.dishName,tier:s.requiredTier,value:s.requiredValue,row:o.row,col:o.col,scoreAwarded:g,tipMultiplier:Number((R*u).toFixed(2)),rushCombo:k}},rng:d.getSnapshot()}}return a}function te(){return{version:p.SAVE_VERSION,bestScore:0,mostOrdersServed:0,highestTierReached:1,highestValueReached:2,gamesPlayed:1,totalWins:0,soundEnabled:!0,reducedMotion:!1}}function he(a){if(!Array.isArray(a)||a.length!==p.GRID_SIZE)return!1;for(const e of a){if(!Array.isArray(e)||e.length!==p.GRID_SIZE)return!1;for(const t of e)if(typeof t!="number"||!Number.isFinite(t)||t<0)return!1}return!0}function N(a){if(!a||typeof a!="object")return!1;const e=a;return!(e.version!==p.SAVE_VERSION||!he(e.grid)||typeof e.score!="number"||typeof e.ordersServed!="number"||!Array.isArray(e.tickets)||e.tickets.length!==p.ORDER_SLOT_COUNT||!e.rng||typeof e.rng.seed!="number")}function B(a,e=typeof window<"u"?window.localStorage:null){if(!e)return!1;try{return e.setItem(p.STORAGE_KEY_STATE,JSON.stringify(a)),!0}catch{return!1}}function re(a=p.DEFAULT_SEED,e=typeof window<"u"?window.localStorage:null){if(!e)return{state:T(a),restoredFromSave:!1,recoveredFromCorruption:!1};try{const t=e.getItem(p.STORAGE_KEY_STATE);if(!t)return{state:T(a),restoredFromSave:!1,recoveredFromCorruption:!1};const r=JSON.parse(t);return N(r)?{state:r,restoredFromSave:!0,recoveredFromCorruption:!1}:(e.removeItem(p.STORAGE_KEY_STATE),{state:T(a),restoredFromSave:!1,recoveredFromCorruption:!0})}catch{try{e.removeItem(p.STORAGE_KEY_STATE)}catch{}return{state:T(a),restoredFromSave:!1,recoveredFromCorruption:!0}}}function ae(a=typeof window<"u"?window.localStorage:null){const e=te();if(!a)return e;try{const t=a.getItem(p.STORAGE_KEY_PROFILE);if(!t)return e;const r=JSON.parse(t);return!r||typeof r!="object"?e:{version:p.SAVE_VERSION,bestScore:typeof r.bestScore=="number"?Math.max(0,r.bestScore):0,mostOrdersServed:typeof r.mostOrdersServed=="number"?Math.max(0,r.mostOrdersServed):0,highestTierReached:typeof r.highestTierReached=="number"?Math.max(1,r.highestTierReached):1,highestValueReached:typeof r.highestValueReached=="number"?Math.max(2,r.highestValueReached):2,gamesPlayed:typeof r.gamesPlayed=="number"?Math.max(1,r.gamesPlayed):1,totalWins:typeof r.totalWins=="number"?Math.max(0,r.totalWins):0,soundEnabled:typeof r.soundEnabled=="boolean"?r.soundEnabled:!0,reducedMotion:typeof r.reducedMotion=="boolean"?r.reducedMotion:!1}}catch{return e}}function _(a,e=typeof window<"u"?window.localStorage:null){if(!e)return!1;try{return e.setItem(p.STORAGE_KEY_PROFILE,JSON.stringify(a)),!0}catch{return!1}}function ie(a,e,t=!1){return{...a,bestScore:Math.max(a.bestScore,e.score),mostOrdersServed:Math.max(a.mostOrdersServed,e.ordersServed),highestTierReached:Math.max(a.highestTierReached,e.highestTier),highestValueReached:Math.max(a.highestValueReached,e.highestValue),totalWins:t?a.totalWins+1:a.totalWins}}function oe(a,e){const t={gameId:p.GAME_ID,version:p.SAVE_VERSION,exportedAt:new Date().toISOString(),state:a,profile:e};return JSON.stringify(t)}function se(a){try{const e=JSON.parse(a);return e&&N(e.state)?{ok:!0,state:e.state,profile:e.profile}:N(e)?{ok:!0,state:e}:{ok:!1,error:"Invalid Merge Kitchen save structure or version mismatch."}}catch{return{ok:!1,error:"Could not parse save JSON string."}}}const fe=`
.mk-root {
  --mk-bg: #1c1410;
  --mk-panel: #281d17;
  --mk-panel-border: #4a3528;
  --mk-board-bg: #3b281e;
  --mk-cell-empty: #2a1c14;
  --mk-accent: #e06d2b;
  --mk-gold: #f59e0b;
  --mk-text: #fdf6ec;
  --mk-muted: #cbb59d;
  --mk-success: #22c55e;
  --mk-danger: #ef4444;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--mk-text);
  background: radial-gradient(circle at top, #2f2018 0%, #160f0c 100%);
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
}

.mk-root *, .mk-root *::before, .mk-root *::after {
  box-sizing: border-box;
}

.mk-shell {
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mk-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.mk-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mk-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mk-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff7ed;
}

.mk-badge {
  background: linear-gradient(135deg, #e06d2b, #b45309);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--mk-muted);
}

.mk-stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mk-stat-box {
  background: #1a120e;
  border: 1px solid #443024;
  border-radius: 8px;
  padding: 5px 10px;
  min-width: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mk-stat-label {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mk-muted);
}

.mk-stat-val {
  font-size: 1.02rem;
  font-weight: 800;
  color: #fef3c7;
}

.mk-stat-box--rush .mk-stat-val {
  color: #fbbf24;
}

.mk-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.mk-goal-bar {
  flex: 1 1 220px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 9px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mk-goal-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  font-weight: 600;
  color: #fde68a;
}

.mk-progress-track {
  width: 100%;
  height: 7px;
  background: #160f0c;
  border-radius: 999px;
  overflow: hidden;
}

.mk-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e06d2b 0%, #fbbf24 100%);
  transition: width 0.2s ease;
}

.mk-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mk-btn {
  background: #36261d;
  color: #fef3c7;
  border: 1px solid #573d2e;
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.mk-btn:hover {
  background: #483226;
}

.mk-btn:active {
  transform: translateY(1px);
}

.mk-btn--primary {
  background: linear-gradient(135deg, #e06d2b 0%, #c2410c 100%);
  border-color: #fb923c;
  color: #ffffff;
}

.mk-btn--primary:hover {
  background: linear-gradient(135deg, #ea580c 0%, #9a3412 100%);
}

/* 3-Ticket Customer Order Rail */
.mk-rail-section {
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.mk-rail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--mk-muted);
}

.mk-rail-title {
  font-weight: 800;
  color: #fde68a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-tickets-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 560px) {
  .mk-tickets-grid {
    grid-template-columns: 1fr;
  }
}

.mk-ticket {
  background: #1f1611;
  border: 1.5px solid #473225;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
}

.mk-ticket--servable {
  border-color: #fbbf24;
  background: linear-gradient(160deg, #2d2013 0%, #1f1611 100%);
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.25), 0 6px 14px rgba(0, 0, 0, 0.35);
}

.mk-ticket-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--mk-muted);
}

.mk-patron {
  font-weight: 700;
  color: #fff7ed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-hotkey-pill {
  background: #36261d;
  color: #fde68a;
  border: 1px solid #5c4030;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-weight: 800;
}

.mk-ticket-dish {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mk-ticket-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 8px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-ticket-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mk-ticket-dish-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-ticket-tier-meta {
  font-size: 0.68rem;
  color: #fcd34d;
  font-weight: 600;
}

.mk-patience-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.66rem;
  color: var(--mk-muted);
}

.mk-patience-bar {
  width: 100%;
  height: 4px;
  background: #120c09;
  border-radius: 999px;
  overflow: hidden;
}

.mk-patience-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.mk-serve-btn {
  width: 100%;
  border-radius: 7px;
  padding: 6px 8px;
  font-size: 0.73rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid #4c3628;
  background: #2b1f18;
  color: #a89078;
  transition: all 0.15s ease;
}

.mk-serve-btn--ready {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fef08a;
  color: #1c1108;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.mk-serve-btn--ready:hover {
  filter: brightness(1.08);
}

/* Status Callout Banner */
.mk-callout {
  background: #231812;
  border: 1px solid #473225;
  border-radius: 9px;
  padding: 7px 12px;
  font-size: 0.79rem;
  font-weight: 600;
  color: #fde68a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 34px;
}

.mk-callout--blocked {
  border-color: #ef4444;
  color: #fca5a5;
}

.mk-callout--served {
  border-color: #22c55e;
  color: #86efac;
}

/* Main Play Area: 4x4 Prep Board + Controls */
.mk-board-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mk-grid-wrapper {
  width: 100%;
  max-width: 440px;
  aspect-ratio: 1 / 1;
  background: var(--mk-board-bg);
  border: 3px solid #6b4832;
  border-radius: 16px;
  padding: 10px;
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.55), 0 10px 26px rgba(0, 0, 0, 0.45);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 9px;
  touch-action: none;
  position: relative;
}

.mk-cell {
  background: var(--mk-cell-empty);
  border: 1.5px solid #483123;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  overflow: hidden;
}

.mk-tile {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  position: relative;
}

.mk-tile--servable {
  cursor: pointer;
  box-shadow: 0 0 0 2.5px #fbbf24, 0 5px 14px rgba(245, 158, 11, 0.45);
}

@keyframes mkPopMerge {
  0% { transform: scale(0.82); }
  55% { transform: scale(1.11); }
  100% { transform: scale(1); }
}

@keyframes mkSpawnIn {
  0% { transform: scale(0.45); opacity: 0.3; }
  100% { transform: scale(1); opacity: 1; }
}

.mk-root:not(.mk-reduced-motion) .mk-tile--merged {
  animation: mkPopMerge 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.mk-root:not(.mk-reduced-motion) .mk-tile--spawned {
  animation: mkSpawnIn 0.18s ease-out;
}

.mk-tile-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
}

.mk-tile-val {
  background: rgba(0, 0, 0, 0.22);
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 0.72rem;
}

.mk-tile-tier {
  opacity: 0.85;
  font-size: 0.6rem;
}

.mk-tile-icon {
  width: 44%;
  height: 44%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-tile-name {
  font-size: 0.66rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.05;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-tile-serve-pill {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: #f59e0b;
  color: #1c1108;
  font-size: 0.54rem;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

/* D-Pad & Controls Row */
.mk-controls-bar {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 8px 12px;
}

.mk-dpad {
  display: grid;
  grid-template-columns: repeat(3, 42px);
  grid-template-rows: repeat(2, 34px);
  gap: 4px;
}

.mk-dpad-btn {
  background: #38271e;
  color: #fff7ed;
  border: 1px solid #5e4232;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-dpad-btn:hover {
  background: #4d3528;
}

.mk-controls-hint {
  flex: 1;
  font-size: 0.72rem;
  color: var(--mk-muted);
  line-height: 1.35;
}

/* Recipe Chain Reference Drawer */
.mk-drawer {
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 10px 12px;
}

.mk-drawer-title {
  margin: 0 0 8px 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fde68a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-recipe-chain {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 6px;
}

.mk-recipe-chip {
  background: #1c130e;
  border: 1px solid #432f23;
  border-radius: 8px;
  padding: 5px 7px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.55;
}

.mk-recipe-chip--discovered {
  opacity: 1;
  border-color: #d97706;
}

.mk-recipe-chip-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.mk-recipe-chip-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mk-recipe-chip-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-recipe-chip-val {
  font-size: 0.62rem;
  color: #fbbf24;
}

/* Overlay Modal for Victory / Loss */
.mk-overlay {
  position: absolute;
  inset: 0;
  background: rgba(18, 12, 9, 0.88);
  backdrop-filter: blur(4px);
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  z-index: 15;
}

.mk-overlay-title {
  margin: 0 0 6px 0;
  font-size: 1.45rem;
  font-weight: 900;
  color: #fef08a;
}

.mk-overlay-desc {
  margin: 0 0 14px 0;
  font-size: 0.85rem;
  color: #fed7aa;
  max-width: 320px;
  line-height: 1.4;
}

.mk-overlay-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.mk-debug-panel {
  background: #120c09;
  border: 1px dashed #f59e0b;
  border-radius: 10px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.72rem;
  color: #fde68a;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 420px) {
  .mk-root {
    padding: 6px;
  }
  .mk-grid-wrapper {
    padding: 7px;
    gap: 6px;
  }
  .mk-tile-name {
    font-size: 0.58rem;
  }
}
`;class ne{container;state;profile;audio;debugOpen;recipeDrawerOpen=!0;saveDrawerOpen=!1;statusBannerText="Swipe or use Arrow/WASD keys to slide & merge ingredients. Press [1], [2], or [3] to serve ready customer tickets!";statusBannerTone="normal";touchStartX=0;touchStartY=0;keydownHandler;constructor(e,t){if(this.container=e,this.profile=ae(),this.audio=new de(this.profile.soundEnabled),this.debugOpen=!!t?.debug,t?.initialSeed!==void 0)this.state=T(t.initialSeed),B(this.state);else{const r=re(p.DEFAULT_SEED);this.state=r.state,r.restoredFromSave&&(this.statusBannerText="Welcome back, Chef! Restored your active dinner service from autosave.")}this.keydownHandler=r=>this.handleKeyDown(r),window.addEventListener("keydown",this.keydownHandler),this.mountDom(),this.render()}getState(){return this.state}dispatch(e){const t=this.state.won,r=ee(this.state,e);this.state=r;const i=r.lastAction;if(i.type==="BLOCKED_SLIDE")this.audio.playBlocked(),this.statusBannerTone="blocked",this.statusBannerText=`Blocked! No tiles can slide ${i.direction} — try another direction or serve a ready ticket.`;else if(i.type==="SLIDE")if(i.mergedCells.length>0){const n=Math.max(...i.mergedCells.map(d=>d.tier));this.audio.playMerge(n);const o=M(n);this.statusBannerTone="normal",this.statusBannerText=`Merged ${o.name} [${o.value}]! +${i.scoreDelta} pts`}else this.audio.playSlide(),this.statusBannerTone="normal",this.statusBannerText=`Slid ${i.direction} — prep board updated.`;else if(i.type==="SERVE_ORDER"&&i.servedTicket){const n=i.servedTicket;this.audio.playOrderServed(n.rushCombo),this.statusBannerTone="served",this.statusBannerText=`🔔 Order Up! Plated ${n.dishName} [${n.value}] for +${n.scoreAwarded} pts (${n.tipMultiplier}x Tip · Rush ${n.rushCombo}x)!`}else i.type==="INVALID_SERVE"?(this.audio.playBlocked(),this.statusBannerTone="blocked",this.statusBannerText="That dish is not on the prep board yet — merge up to the requested recipe tier first!"):i.type==="KEEP_PLAYING"?(this.statusBannerTone="normal",this.statusBannerText="Endless Dinner Service unlocked — aim for Tier 11: Chef’s Legend [2048]!"):i.type==="RESTART"&&(this.profile={...this.profile,gamesPlayed:this.profile.gamesPlayed+1},this.statusBannerTone="normal",this.statusBannerText="Fresh kitchen prep board ready, Chef!");const s=!t&&r.won;return s?this.audio.playVictory():r.status==="LOST"&&this.audio.playGameOver(),this.profile=ie(this.profile,r,s),B(this.state),_(this.profile),this.render(),this.state}restartWithSeed(e){this.dispatch({type:"RESTART",seed:e})}toggleDebug(e){this.debugOpen=e!==void 0?e:!this.debugOpen,this.render()}destroy(){window.removeEventListener("keydown",this.keydownHandler),this.audio.destroy(),this.container.innerHTML=""}handleKeyDown(e){const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return;const r=e.key.toLowerCase();if(e.key==="ArrowUp"||r==="w")e.preventDefault(),this.dispatch({type:"SLIDE",direction:"UP"});else if(e.key==="ArrowDown"||r==="s")e.preventDefault(),this.dispatch({type:"SLIDE",direction:"DOWN"});else if(e.key==="ArrowLeft"||r==="a")e.preventDefault(),this.dispatch({type:"SLIDE",direction:"LEFT"});else if(e.key==="ArrowRight"||r==="d"){if(e.shiftKey){e.preventDefault(),this.toggleDebug();return}e.preventDefault(),this.dispatch({type:"SLIDE",direction:"RIGHT"})}else if(r==="1"||r==="2"||r==="3"){e.preventDefault();const i=Number(r)-1;this.dispatch({type:"SERVE_ORDER",ticketIndex:i})}else r==="r"?(e.preventDefault(),this.dispatch({type:"RESTART"})):(r==="`"||r==="f2")&&(e.preventDefault(),this.toggleDebug())}mountDom(){this.container.innerHTML="";const e=document.createElement("style");e.textContent=fe,this.container.appendChild(e);const t=document.createElement("div");t.className="mk-root",t.setAttribute("data-testid","merge-kitchen-root"),this.container.appendChild(t)}render(){const e=this.container.querySelector(".mk-root");if(!e)return;e.classList.toggle("mk-reduced-motion",this.profile.reducedMotion);const t=W(this.state),r=new Map,i=new Map;for(const u of t){r.set(u.ticketIndex,u.matchingCells);for(const m of u.matchingCells){const g=`${m.row},${m.col}`;i.has(g)||i.set(g,u.ticketIndex)}}const s=new Set(this.state.lastAction.mergedCells.map(u=>`${u.row},${u.col}`)),n=this.state.lastAction.spawnedTile?`${this.state.lastAction.spawnedTile.row},${this.state.lastAction.spawnedTile.col}`:null,o=Math.min(100,Math.round(this.state.ordersServed/p.SHORT_GOAL_ORDERS*100)),d=H(this.state.rushCombo),c=M(this.state.highestTier),l=this.state.tickets.map((u,m)=>{const g=M(u.requiredTier),x=r.has(m),b=z(u),w=Number((b*d).toFixed(2)),A=Math.round(g.baseServeScore*w),v=Math.max(0,Math.min(100,Math.round(u.patienceTurns/u.maxPatienceTurns*100))),y=v>50?"#22c55e":v>0?"#f59e0b":"#ef4444";return`
          <div class="mk-ticket ${x?"mk-ticket--servable":""}" data-ticket-slot="${m}">
            <div class="mk-ticket-top">
              <span class="mk-patron">${u.avatarBadge} ${u.patronName}</span>
              <span class="mk-hotkey-pill">Key [${m+1}]</span>
            </div>
            <div class="mk-ticket-dish">
              <div class="mk-ticket-icon" style="background:${g.bgGradient}; border:1.5px solid ${g.borderColor};">
                ${g.svgIcon}
              </div>
              <div class="mk-ticket-info">
                <span class="mk-ticket-dish-name">${g.name} [${g.value}]</span>
                <span class="mk-ticket-tier-meta">Tier ${g.tier} · +${A} pts (${w}x)</span>
              </div>
            </div>
            <div class="mk-patience-row">
              <span>${u.tableLabel}</span>
              <span>${u.patienceTurns>0?`${u.patienceTurns}t left (${b}x tip)`:"Base Tip (1.0x)"}</span>
            </div>
            <div class="mk-patience-bar">
              <div class="mk-patience-fill" style="width:${v}%; background:${y};"></div>
            </div>
            <button
              type="button"
              class="mk-serve-btn ${x?"mk-serve-btn--ready":""}"
              data-action="serve-ticket"
              data-ticket-index="${m}"
              ${x?"":"disabled"}
            >
              ${x?`🔔 Serve Dish! (+${A}) [${m+1}]`:`Waiting for [${g.value}] ${g.shortName}`}
            </button>
          </div>
        `}).join("");let f="";for(let u=0;u<p.GRID_SIZE;u+=1)for(let m=0;m<p.GRID_SIZE;m+=1){const g=this.state.grid[u][m],x=`${u},${m}`;if(g===0)f+=`<div class="mk-cell" data-row="${u}" data-col="${m}" data-val="0"></div>`;else{const b=P(g),w=s.has(x),A=n===x,v=i.get(x),y=v!==void 0;f+=`
            <div class="mk-cell" data-row="${u}" data-col="${m}" data-val="${g}">
              <div
                class="mk-tile ${w?"mk-tile--merged":""} ${A?"mk-tile--spawned":""} ${y?"mk-tile--servable":""}"
                style="background:${b.bgGradient}; border-color:${b.borderColor}; color:${b.textColor};"
                ${y?`data-action="serve-cell" data-ticket-index="${v}" data-row="${u}" data-col="${m}" title="Click to serve ${b.name} to Ticket #${v+1}"`:""}
              >
                <div class="mk-tile-top">
                  <span class="mk-tile-val">${b.value}</span>
                  <span class="mk-tile-tier">T${b.tier}</span>
                </div>
                <div class="mk-tile-icon">${b.svgIcon}</div>
                <div class="mk-tile-name">${b.shortName}</div>
                ${y?`<span class="mk-tile-serve-pill">🔔 #${v+1}</span>`:""}
              </div>
            </div>
          `}}let h="";this.state.status==="WON"&&!this.state.keepPlaying?h=`
        <div class="mk-overlay" data-testid="victory-modal">
          <h2 class="mk-overlay-title">⭐⭐⭐ Michelin Star Victory!</h2>
          <p class="mk-overlay-desc">
            Bravo, Chef! You served <strong>${this.state.ordersServed} Customer Orders</strong> and crafted up to
            <strong>${c.name} [${c.value}]</strong> with a score of <strong>${this.state.score}</strong>!
          </p>
          <div class="mk-overlay-actions">
            <button type="button" class="mk-btn mk-btn--primary" data-action="keep-playing">
              Keep Cooking (Endless Service)
            </button>
            <button type="button" class="mk-btn" data-action="restart">
              New Dinner Service
            </button>
          </div>
        </div>
      `:this.state.status==="LOST"&&(h=`
        <div class="mk-overlay" data-testid="gameover-modal">
          <h2 class="mk-overlay-title">🍳 Kitchen Prep Locked Up!</h2>
          <p class="mk-overlay-desc">
            Every prep station is full, no adjacent ingredients can merge, and no active ticket matches a dish on the pass.
            Final Score: <strong>${this.state.score}</strong> · Orders Served: <strong>${this.state.ordersServed}</strong>.
          </p>
          <div class="mk-overlay-actions">
            <button type="button" class="mk-btn mk-btn--primary" data-action="restart">
              Try Another Service [R]
            </button>
          </div>
        </div>
      `);const k=E.map(u=>`
        <div class="mk-recipe-chip ${this.state.discoveredTiers.includes(u.tier)?"mk-recipe-chip--discovered":""}">
          <div class="mk-recipe-chip-icon">${u.svgIcon}</div>
          <div class="mk-recipe-chip-meta">
            <span class="mk-recipe-chip-name">T${u.tier} · ${u.shortName}</span>
            <span class="mk-recipe-chip-val">[${u.value}] · Serve +${u.baseServeScore}</span>
          </div>
        </div>
      `).join(""),R=this.statusBannerTone==="blocked"?"mk-callout--blocked":this.statusBannerTone==="served"?"mk-callout--served":"";e.innerHTML=`
      <div class="mk-shell">
        <header class="mk-header">
          <div class="mk-brand">
            <div class="mk-title-row">
              <h1 class="mk-title">Merge Kitchen</h1>
              <span class="mk-badge">2048 Bistro</span>
            </div>
            <p class="mk-subtitle">Slide &amp; merge up the 11-tier Recipe Chain · Serve Customer Tickets to free board space!</p>
          </div>
          <div class="mk-stats-row">
            <div class="mk-stat-box">
              <span class="mk-stat-label">Score</span>
              <span class="mk-stat-val" data-testid="score-value">${this.state.score}</span>
            </div>
            <div class="mk-stat-box">
              <span class="mk-stat-label">Best</span>
              <span class="mk-stat-val" data-testid="best-score-value">${this.profile.bestScore}</span>
            </div>
            <div class="mk-stat-box">
              <span class="mk-stat-label">Orders</span>
              <span class="mk-stat-val" data-testid="orders-served-value">${this.state.ordersServed}/${p.SHORT_GOAL_ORDERS}</span>
            </div>
            <div class="mk-stat-box mk-stat-box--rush">
              <span class="mk-stat-label">Rush Streak</span>
              <span class="mk-stat-val">${this.state.rushCombo}x (${d}x)</span>
            </div>
          </div>
        </header>

        <div class="mk-toolbar">
          <div class="mk-goal-bar">
            <div class="mk-goal-top">
              <span>⭐ Short Goal: Serve 10 Orders or Craft [1024] Grand Feast</span>
              <span>Top Dish: ${c.shortName} [${c.value}]</span>
            </div>
            <div class="mk-progress-track">
              <div class="mk-progress-fill" style="width:${o}%;"></div>
            </div>
          </div>
          <div class="mk-btn-group">
            <button type="button" class="mk-btn mk-btn--primary" data-action="restart">New Service [R]</button>
            <button type="button" class="mk-btn" data-action="toggle-recipes">${this.recipeDrawerOpen?"Hide Recipes":"Recipe Chain"}</button>
            <button type="button" class="mk-btn" data-action="toggle-sound">${this.profile.soundEnabled?"🔊 SFX On":"🔇 Muted"}</button>
            <button type="button" class="mk-btn" data-action="toggle-motion">${this.profile.reducedMotion?"Motion: Reduced":"Motion: Full"}</button>
            <button type="button" class="mk-btn" data-action="toggle-save">Save/Load</button>
          </div>
        </div>

        <section class="mk-rail-section" aria-label="Customer Order Rail">
          <div class="mk-rail-header">
            <span class="mk-rail-title">🛎️ Active Customer Order Rail (Serving Clears Dish Tile From Board!)</span>
            <span>Turns: ${this.state.turnCount}</span>
          </div>
          <div class="mk-tickets-grid">
            ${l}
          </div>
        </section>

        <div class="mk-callout ${R}" role="status" aria-live="polite">
          <span>${this.statusBannerText}</span>
        </div>

        <div class="mk-board-stage">
          <div class="mk-grid-wrapper" data-testid="prep-board">
            ${f}
            ${h}
          </div>

          <div class="mk-controls-bar">
            <div class="mk-dpad" role="group" aria-label="Directional Slide Controls">
              <div></div>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="UP" aria-label="Slide Up">▲</button>
              <div></div>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="LEFT" aria-label="Slide Left">◀</button>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="DOWN" aria-label="Slide Down">▼</button>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="RIGHT" aria-label="Slide Right">▶</button>
            </div>
            <div class="mk-controls-hint">
              <strong>Controls:</strong> Swipe board or press <code>Arrow Keys / WASD</code> to slide &amp; merge.<br/>
              Press <code>[1] [2] [3]</code> or click a glowing dish to plate &amp; free a cell!
            </div>
          </div>
        </div>

        ${this.recipeDrawerOpen?`
          <section class="mk-drawer" aria-label="11-Tier Recipe Chain">
            <h2 class="mk-drawer-title">📖 11-Tier Bistro Recipe Chain (Discovered: ${this.state.discoveredTiers.length}/11)</h2>
            <div class="mk-recipe-chain">
              ${k}
            </div>
          </section>
        `:""}

        ${this.saveDrawerOpen?`
          <section class="mk-drawer" aria-label="Save Export and Import">
            <h2 class="mk-drawer-title">💾 Save Export / Import (Autosaved on Every Move)</h2>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <textarea id="mk-save-textarea" rows="3" style="width:100%; background:#140d0a; color:#fde68a; border:1px solid #4c3628; border-radius:6px; padding:6px; font-family:monospace; font-size:0.7rem;">${oe(this.state,this.profile)}</textarea>
              <div class="mk-btn-group">
                <button type="button" class="mk-btn mk-btn--primary" data-action="import-save">Import JSON Save</button>
              </div>
            </div>
          </section>
        `:""}

        ${this.debugOpen?`
          <section class="mk-debug-panel" data-testid="debug-panel">
            <div><strong>[DEBUG INSPECTOR]</strong> Seed: ${this.state.rng.seed} · RNG Calls: ${this.state.rng.calls} · Status: ${this.state.status}</div>
            <div>Empty Cells: ${this.state.grid.flat().filter(u=>u===0).length} · Servable Tickets: ${t.length}</div>
            <div class="mk-btn-group">
              <button type="button" class="mk-btn" data-action="debug-seed">Reset Seed 204807</button>
              <button type="button" class="mk-btn" data-action="toggle-debug">Close Debug</button>
            </div>
          </section>
        `:""}
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelectorAll("[data-action]").forEach(r=>{r.addEventListener("click",i=>{i.stopPropagation();const s=r.dataset.action;if(s==="slide"){const n=r.dataset.dir;this.dispatch({type:"SLIDE",direction:n})}else if(s==="serve-ticket"){const n=Number(r.dataset.ticketIndex);this.dispatch({type:"SERVE_ORDER",ticketIndex:n})}else if(s==="serve-cell"){const n=Number(r.dataset.ticketIndex),o=Number(r.dataset.row),d=Number(r.dataset.col);this.dispatch({type:"SERVE_ORDER",ticketIndex:n,row:o,col:d})}else if(s==="restart")this.dispatch({type:"RESTART"});else if(s==="keep-playing")this.dispatch({type:"KEEP_PLAYING"});else if(s==="toggle-recipes")this.recipeDrawerOpen=!this.recipeDrawerOpen,this.render();else if(s==="toggle-sound")this.profile.soundEnabled=!this.profile.soundEnabled,this.audio.setEnabled(this.profile.soundEnabled),_(this.profile),this.render();else if(s==="toggle-motion")this.profile.reducedMotion=!this.profile.reducedMotion,_(this.profile),this.render();else if(s==="toggle-save")this.saveDrawerOpen=!this.saveDrawerOpen,this.render();else if(s==="import-save"){const n=e.querySelector("#mk-save-textarea");if(n){const o=se(n.value.trim());o.ok?(this.state=o.state,o.profile&&(this.profile=o.profile,_(this.profile)),B(this.state),this.statusBannerTone="served",this.statusBannerText="Save state imported successfully!",this.render()):(this.statusBannerTone="blocked",this.statusBannerText=o.error,this.render())}}else s==="debug-seed"?this.restartWithSeed(p.DEFAULT_SEED):s==="toggle-debug"&&this.toggleDebug(!1)})});const t=e.querySelector(".mk-grid-wrapper");t&&(t.addEventListener("touchstart",r=>{r.touches.length>0&&(this.touchStartX=r.touches[0].clientX,this.touchStartY=r.touches[0].clientY)},{passive:!0}),t.addEventListener("touchend",r=>{if(r.changedTouches.length===0)return;const i=r.changedTouches[0].clientX-this.touchStartX,s=r.changedTouches[0].clientY-this.touchStartY,n=Math.abs(i),o=Math.abs(s);Math.max(n,o)<24||(n>o?this.dispatch({type:"SLIDE",direction:i>0?"RIGHT":"LEFT"}):this.dispatch({type:"SLIDE",direction:s>0?"DOWN":"UP"}))},{passive:!0}))}}const le={id:"07-merge-kitchen",number:7,title:"Merge Kitchen",subtitle:"2048 Bistro Prep & Customer Order Service",genre:"Sliding-Tile Merge Puzzle & Culinary Order Management",primaryReference:"2048 (Gabriele Cirulli)",supportingReference:"Overcooked! / Threes!",oneSentenceLoop:"Swipe a 4x4 kitchen prep board in four directions to slide and merge culinary ingredients up an 11-tier Recipe Chain while serving requested dishes to an active 3-Ticket Customer Order Rail to free board space and build Rush-Hour tip multipliers.",shortGoal:"Serve 10 Customer Orders (or craft the Tier 10 Michelin Grand Feast [1024]) to earn your Michelin Star Victory.",longGoal:"Continue in Endless Dinner Service to craft Tier 11: Chef's Legend [2048] with a 5x+ Rush Streak.",controlsSummary:"Arrow Keys / WASD or Touch Swipe to slide 4x4 board · Keys [1], [2], [3] or Click to Serve Customer Tickets · [R] Restart",accentColor:"#e06d2b"};function ce(a,e){const t=new ne(a,e);return{destroy(){t.destroy()},getStateSnapshot(){return t.getState()},restartWithSeed(r){t.restartWithSeed(r)},toggleDebug(r){t.toggleDebug(r)}}}const me={metadata:le,mountGame:ce},ge=Object.freeze(Object.defineProperty({__proto__:null,CUSTOMER_PATRONS:U,MERGE_KITCHEN_CONFIG:p,MergeKitchenController:ne,RECIPE_TIERS:E,SeededRng:C,applyCommand:ee,canSlideAnyDirection:Q,cloneGrid:j,computeRushMultiplier:H,computeTicketTipMultiplier:z,createCustomerTicket:V,createDefaultProfile:te,createEmptyGrid:G,createInitialState:T,default:me,exportSaveString:oe,findMatchingBoardCells:F,getEmptyCells:Y,getRecipeByTier:M,getRecipeByValue:P,getServableTickets:W,getTicketTierPoolForProgress:K,importSaveString:se,isTerminalLoss:L,isValidGameState:N,loadGameState:re,loadProfile:ae,metadata:le,mountGame:ce,saveGameState:B,saveProfile:_,slideGrid:Z,slideLineWithSingleMerge:O,spawnRandomIngredient:$,syncProfileWithState:ie,tierToValue:q,valueToTier:S},Symbol.toStringTag,{value:"Module"}));export{ge as g,ce as m};
