const k={ID:"10-ten-floors-down",TITLE:"Ten Floors Down",SUBTITLE:"10-Floor Tactical Alchemy Roguelike",MAX_FLOORS:10,MINI_BOSS_FLOOR:5,FINAL_BOSS_FLOOR:10,GRID_WIDTH:26,GRID_HEIGHT:18,FOV_RADIUS:6,MAX_INVENTORY_SLOTS:6,THROW_RANGE:6,DEFAULT_MOVE_TICKS:10,ROGUE_MOVE_TICKS:8,WAIT_TICKS:10,POTION_USE_TICKS:10,SCROLL_USE_TICKS:10,ALCHEMY_USE_TICKS:10,STORAGE_KEY_ACTIVE_RUN:"argon_g10_ten_floors_active_run_v1",STORAGE_KEY_CHRONICLES:"argon_g10_ten_floors_chronicles_v1",ACCENT_COLOR:"#10b981"};function X(){try{if(typeof window<"u"&&window.localStorage)return window.localStorage}catch{return null}return null}function j(i){const e=X();if(e){if(i.status!=="playing"){Se(),i.epitaph&&we(i.epitaph);return}try{const t={version:1,savedAt:new Date().toISOString(),state:i};e.setItem(k.STORAGE_KEY_ACTIVE_RUN,JSON.stringify(t))}catch{}}}function ve(){const i=X();if(!i)return null;try{const e=i.getItem(k.STORAGE_KEY_ACTIVE_RUN);if(!e)return null;const t=JSON.parse(e);return t.version!==1||!t.state||t.state.status!=="playing"||!t.state.hero||!t.state.floor?null:t.state}catch{return null}}function Se(){const i=X();if(i)try{i.removeItem(k.STORAGE_KEY_ACTIVE_RUN)}catch{}}function we(i){const e=X();if(e)try{const s=de().filter(r=>r.id!==i.id);s.unshift(i);const o={version:1,epitaphs:s.slice(0,25)};e.setItem(k.STORAGE_KEY_CHRONICLES,JSON.stringify(o))}catch{}}function de(){const i=X();if(!i)return[];try{const e=i.getItem(k.STORAGE_KEY_CHRONICLES);if(!e)return[];const t=JSON.parse(e);return t.version!==1||!Array.isArray(t.epitaphs)?[]:t.epitaphs}catch{return[]}}function ce(i){const e={version:1,savedAt:new Date().toISOString(),state:i};return JSON.stringify(e,null,2)}function Ae(i){try{const e=JSON.parse(i);return e.version!==1||!e.state||typeof e.state.seed!="number"||!e.state.hero||!e.state.floor||!e.state.colorToEffect?null:e.state}catch{return null}}class fe{state;constructor(e){this.state=e>>>0||322420463}next(){let e=this.state+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),this.state=e>>>0,((e^e>>>14)>>>0)/4294967296}nextInt(e,t){return t<=e?e:e+Math.floor(this.next()*(t-e+1))}pick(e){return e[this.nextInt(0,e.length-1)]}shuffle(e){const t=[...e];for(let s=t.length-1;s>0;s--){const n=this.nextInt(0,s),o=t[s];t[s]=t[n],t[n]=o}return t}getState(){return this.state>>>0}}function he(i){let e=2166136261;const t=i.trim()||"2026-11-06";for(let s=0;s<t.length;s++)e^=t.charCodeAt(s),e=Math.imul(e,16777619);return e>>>0||101010}function J(i=new Date){const e=i.getUTCFullYear(),t=String(i.getUTCMonth()+1).padStart(2,"0"),s=String(i.getUTCDate()).padStart(2,"0");return`${e}-${t}-${s}`}function pe(i=J()){return he(`TEN_FLOORS_DAILY_${i}`)}const P=[{id:"crimson",label:"Crimson Vial",hex:"#ef4444",liquidDesc:"Swirling ruby-red alchemical fluid"},{id:"amber",label:"Amber Vial",hex:"#f59e0b",liquidDesc:"Viscous golden-ochre draught"},{id:"viridian",label:"Viridian Vial",hex:"#10b981",liquidDesc:"Luminescent emerald distillate"},{id:"azure",label:"Azure Vial",hex:"#38bdf8",liquidDesc:"Frost-rimmed sapphire tincture"},{id:"violet",label:"Violet Vial",hex:"#a855f7",liquidDesc:"Fuming amethyst vapor-essence"},{id:"obsidian",label:"Obsidian Vial",hex:"#94a3b8",liquidDesc:"Dense midnight-black suspension"}],D={mending:{id:"mending",name:"Potion of Mending",shortName:"Mending",isHarmfulToDrink:!1,preferThrow:!1,drinkSummary:"Restores 45% Max HP (min 28) & cures Poison, Burn, and Chill.",throwSummary:"Splashes restorative mist on target tile, healing any unit hit."},liquid_flame:{id:"liquid_flame",name:"Potion of Liquid Flame",shortName:"Liquid Flame",isHarmfulToDrink:!0,preferThrow:!0,drinkSummary:"HAZARD: Sets YOU on fire for 30 ticks (18 dmg), though grants +3 Fire ATK.",throwSummary:"Shatters in a 3x3 firestorm (12 fire dmg + ignites tiles & enemies for 30 ticks)."},frost_mist:{id:"frost_mist",name:"Potion of Frost Mist",shortName:"Frost Mist",isHarmfulToDrink:!0,preferThrow:!0,drinkSummary:"Chills self (+3 tick action penalty for 20 ticks, douses fire, +5 Ice Armor).",throwSummary:"Freezes enemies in a 3x3 blast (8 cold dmg + Stuns/Freezes for 20 ticks)."},might:{id:"might",name:"Potion of Might",shortName:"Might",isHarmfulToDrink:!1,preferThrow:!1,drinkSummary:"Permanently grants +2 Base Attack, +12 Max HP, and heals 12 HP.",throwSummary:"Shatters harmlessly on stone (wastes the draught, but identifies the color)."},shadow_veil:{id:"shadow_veil",name:"Potion of Shadow Veil",shortName:"Shadow Veil",isHarmfulToDrink:!1,preferThrow:!1,drinkSummary:"Grants 50 ticks of Invisibility; next strike or throw deals 2.0x Ambush Crit!",throwSummary:"Releases dark fog in 3x3 area, stunning monsters for 15 ticks."},caustic_gas:{id:"caustic_gas",name:"Potion of Caustic Gas",shortName:"Caustic Gas",isHarmfulToDrink:!0,preferThrow:!0,drinkSummary:"HAZARD: Chokes YOU with corrosive poison (21 dmg over 30 ticks).",throwSummary:"Blankets a 3x3 room area in toxic gas (9 dmg + Poison & -2 DEF for 40 ticks)."}},Ce=["mending","liquid_flame","frost_mist","might","shadow_veil","caustic_gas"],W=[{id:"iron_broadsword",name:"Iron Broadsword",tier:1,attackBonus:3,attackTicks:10,description:"Balanced legion blade (10 ticks per strike)."},{id:"twin_night_daggers",name:"Twin Night Daggers",tier:1,attackBonus:3,attackTicks:8,description:"Swift dual stilettos (8 ticks per strike; outpaces standard monsters)."},{id:"runed_catalyst_staff",name:"Runed Catalyst Staff",tier:1,attackBonus:2,attackTicks:9,description:"Channeling stave tipped with alchemical brass (9 ticks per strike)."},{id:"serrated_gladius",name:"Serrated Gladius",tier:2,attackBonus:6,attackTicks:9,description:"Fast, razor-toothed shortblade found in mid-depth vaults (9 ticks)."},{id:"warhammer_of_breach",name:"Breach Warhammer",tier:2,attackBonus:8,attackTicks:12,description:"Heavy crushing maul (12 ticks — watch the turn clock against fast foes!)."},{id:"whisper_kris",name:"Whisper Assassin Kris",tier:3,attackBonus:8,attackTicks:8,description:"Masterwork 8-tick blade that slices before monsters can counter."},{id:"executioner_greataxe",name:"Executioner Greataxe",tier:3,attackBonus:12,attackTicks:12,description:"Massive two-handed cleaver (12 ticks; devastating single hits)."},{id:"sunforged_halberd",name:"Sunforged Halberd",tier:4,attackBonus:14,attackTicks:10,description:"Relic polearm of the deep sanctuary (10 ticks, +14 ATK)."}],z=[{id:"riveted_mail",name:"Riveted Brigandine",tier:1,defenseBonus:2,maxHpBonus:0,description:"Sturdy iron-studded tunic."},{id:"shadow_cloak",name:"Shadowweave Cloak",tier:1,defenseBonus:1,maxHpBonus:4,description:"Light, soundless mantle woven for subterranean stealth."},{id:"alchemist_coat",name:"Lead-Lined Greatcoat",tier:1,defenseBonus:2,maxHpBonus:4,description:"Acid-resistant leather coat with reinforced vial loops."},{id:"warden_chainmail",name:"Warden Chainmail",tier:2,defenseBonus:4,maxHpBonus:10,description:"Interlinked steel rings forged for dungeon sentries."},{id:"dwarven_plate",name:"Dwarven Runed Plate",tier:3,defenseBonus:7,maxHpBonus:18,description:"Heavy rune-etched breastplate that shrugs off brutal blows."},{id:"abyssal_aegis",name:"Abyssal Aegis Armor",tier:4,defenseBonus:10,maxHpBonus:28,description:"Mythic obsidian carapace recovered from the lower depths."}],R={vanguard:{id:"vanguard",name:"Ironclad Vanguard",title:"Frontline Bastion",accentColor:"#f59e0b",glyph:"V",baseHp:94,baseAttack:10,baseDefense:3,moveTicks:10,startingWeapon:W[0],startingArmor:z[0],preIdentifiedEffects:["mending"],startingPotions:["mending","liquid_flame"],startsWithUpgradeScroll:!0,alchemyBonusCharges:0,thrownPotionMultiplier:1,abilityName:"Shield Bash",abilityCooldownTicks:80,abilityCostTicks:8,abilityDescription:"Slam an adjacent foe for 1.4x melee damage, Stun it for 20 ticks, and cancel any Boss Telegraph.",passiveDescription:"Starts with Potion of Mending pre-identified, high HP (94), and +1 bonus HP per Scroll of Upgrade."},rogue:{id:"rogue",name:"Shadow Rogue",title:"8-Tick Ambush Tactician",accentColor:"#38bdf8",glyph:"R",baseHp:74,baseAttack:9,baseDefense:1,moveTicks:8,startingWeapon:W[1],startingArmor:z[1],preIdentifiedEffects:["shadow_veil"],startingPotions:["shadow_veil","caustic_gas"],startsWithUpgradeScroll:!0,alchemyBonusCharges:0,thrownPotionMultiplier:1.15,abilityName:"Smoke Bomb",abilityCooldownTicks:75,abilityCostTicks:6,abilityDescription:"Vanish for 35 ticks of Shadow Veil Invisibility (next strike deals 2.0x Ambush Crit) & stun adjacent foes for 15 ticks.",passiveDescription:"Moves & strikes in 8 Ticks (vs standard 10). Starts with Potion of Shadow Veil pre-identified."},alchemist:{id:"alchemist",name:"Arcane Alchemist",title:"Master of Volatile Vials",accentColor:"#a855f7",glyph:"A",baseHp:80,baseAttack:8,baseDefense:2,moveTicks:10,startingWeapon:W[2],startingArmor:z[2],preIdentifiedEffects:["liquid_flame","frost_mist"],startingPotions:["liquid_flame","frost_mist","mending"],startsWithUpgradeScroll:!0,alchemyBonusCharges:1,thrownPotionMultiplier:1.35,abilityName:"Arcane Catalyst Bolt",abilityCooldownTicks:65,abilityCostTicks:8,abilityDescription:"Fires an arcane bolt at the nearest visible monster (range 5) for 12 + 2*Floor damage & -2 DEF.",passiveDescription:"Starts with Liquid Flame & Frost Mist pre-identified, +35% Thrown Vial damage, and +1 Alchemy Desk charge per floor."}},te=[{id:"sewer_rat",name:"Albino Sewer Rat",glyph:"r",color:"#cbd5e1",minFloor:1,maxFloor:2,maxHp:22,attack:7,defense:0,moveTicks:8,attackTicks:8,description:"Fast 8-tick scavenger that can double-attack slow weapon swingers."},{id:"gnoll_scout",name:"Gnoll Spear-Scout",glyph:"g",color:"#f59e0b",minFloor:1,maxFloor:3,maxHp:30,attack:9,defense:1,moveTicks:10,attackTicks:10,description:"Aggressive hyena-kin patrolling the upper stonework."},{id:"plague_swarm",name:"Carrion Fly Swarm",glyph:"s",color:"#84cc16",minFloor:2,maxFloor:4,maxHp:34,attack:8,defense:0,moveTicks:9,attackTicks:9,inflictsStatus:"poison",description:"Venomous insect cloud that inflicts Poison on hit."},{id:"skeleton_guard",name:"Ossuary Skeleton",glyph:"k",color:"#e2e8f0",minFloor:3,maxFloor:6,maxHp:44,attack:12,defense:3,moveTicks:10,attackTicks:10,description:"Animated legionary with hardened bone armor."},{id:"prison_brute",name:"Shackled Brute",glyph:"B",color:"#f97316",minFloor:4,maxFloor:7,maxHp:62,attack:16,defense:3,moveTicks:11,attackTicks:12,description:"Lumbering 12-tick bruiser that hits like a battering ram."},{id:"cinder_shaman",name:"Cinder Pyromancer",glyph:"c",color:"#ef4444",minFloor:6,maxFloor:9,maxHp:48,attack:14,defense:2,moveTicks:10,attackTicks:11,rangedRange:3,inflictsStatus:"burn",description:"Hurls searing embers from up to 3 tiles away."},{id:"void_stalker",name:"Void Stalker",glyph:"v",color:"#c084fc",minFloor:7,maxFloor:10,maxHp:56,attack:17,defense:3,moveTicks:8,attackTicks:8,description:"Lethal 8-tick shadow predator of the lower halls."},{id:"golem_sentinel",name:"Runic Automaton",glyph:"G",color:"#38bdf8",minFloor:8,maxFloor:10,maxHp:84,attack:21,defense:6,moveTicks:13,attackTicks:14,description:"Slow 14-tick construct with massive armor plating."},{id:"iron_warden",name:"The Iron Warden",glyph:"W",color:"#fbbf24",minFloor:5,maxFloor:5,maxHp:135,attack:18,defense:4,moveTicks:10,attackTicks:10,isBoss:!0,bossFloor:5,description:"Floor 5 Mini-Boss: Telegraphs a 3x3 Seismic Chain Slam every 3 turns. Step out of red warning tiles or stun him!"},{id:"abyssal_core",name:"The Abyssal Core",glyph:"Ω",color:"#f43f5e",minFloor:10,maxFloor:10,maxHp:210,attack:22,defense:5,moveTicks:10,attackTicks:10,isBoss:!0,bossFloor:10,description:"Floor 10 Final Boss: Ancient heart of the dungeon. Telegraphs multi-tile Abyssal Void Eruptions across the chamber."}];function Me(i){const t=new fe((i^2654435769)>>>0).shuffle(Ce),s={},n={};return P.forEach((o,r)=>{const l=t[r];s[o.id]=l,n[l]=o.id}),{colorToEffect:s,effectToColor:n}}function O(i){return i!=="wall"}function se(i,e,t){const s=i.length,n=i[0]?.length??0;if(e.x<0||e.x>=n||e.y<0||e.y>=s||t.x<0||t.x>=n||t.y<0||t.y>=s||!O(i[e.y][e.x])||!O(i[t.y][t.x]))return null;const o=Array.from({length:s},()=>Array(n).fill(!1)),r=Array.from({length:s},()=>Array(n).fill(null)),l=[{x:e.x,y:e.y}];o[e.y][e.x]=!0;const a=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];for(;l.length>0;){const u=l.shift();if(u.x===t.x&&u.y===t.y){const x=[];let d=u;for(;d;)x.push(d),d=r[d.y][d.x];return x.reverse(),x}for(const x of a){const d=u.x+x.dx,h=u.y+x.dy;d>=0&&d<n&&h>=0&&h<s&&!o[h][d]&&O(i[h][d])&&(o[h][d]=!0,r[h][d]=u,l.push({x:d,y:h}))}}return null}function ee(i,e,t,s){let n=e.x,o=e.y;const r=s.next()<.5,l=(a,u)=>{u>0&&u<i.length-1&&a>0&&a<i[0].length-1&&i[u][a]==="wall"&&(i[u][a]="floor")};if(r){for(;n!==t.x;)l(n,o),n+=n<t.x?1:-1;for(;o!==t.y;)l(n,o),o+=o<t.y?1:-1;l(t.x,t.y)}else{for(;o!==t.y;)l(n,o),o+=o<t.y?1:-1;for(;n!==t.x;)l(n,o),n+=n<t.x?1:-1;l(t.x,t.y)}}function ue(i,e,t,s="vanguard"){const n=k.GRID_WIDTH,o=k.GRID_HEIGHT,r=(e^Math.imul(i,2246822507))>>>0||1,l=new fe(r),a=Array.from({length:o},()=>Array(n).fill("wall")),u=Array.from({length:o},()=>Array(n).fill(!1)),x=Array.from({length:o},()=>Array(n).fill(!1)),d=Array.from({length:o},()=>Array(n).fill(null)),h=[{sx:1,sy:1,sw:7,sh:7},{sx:9,sy:1,sw:7,sh:7},{sx:17,sy:1,sw:8,sh:7},{sx:1,sy:9,sw:7,sh:8},{sx:9,sy:9,sw:7,sh:8},{sx:17,sy:9,sw:8,sh:8}],c=l.next()<.5?[h[0],h[3],h[1],h[4],h[2],h[5]]:[h[3],h[0],h[4],h[1],h[5],h[2]],f=[];c.forEach((y,T)=>{const S=T===c.length-1&&(i===k.MINI_BOSS_FLOOR||i===k.FINAL_BOSS_FLOOR),A=S?Math.min(y.sw,6):l.nextInt(4,Math.min(6,y.sw)),w=S?Math.min(y.sh,6):l.nextInt(4,Math.min(6,y.sh)),M=y.sx+l.nextInt(0,Math.max(0,y.sw-A)),L=y.sy+l.nextInt(0,Math.max(0,y.sh-w));let G="combat";T===0?G="entrance":T===c.length-1?G="exit":T===2?G="alchemy":T===3&&(G="vault");const Pe={x:M,y:L,w:A,h:w,kind:G};f.push(Pe);for(let Y=L;Y<L+w;Y++)for(let K=M;K<M+A;K++)Y>0&&Y<o-1&&K>0&&K<n-1&&(a[Y][K]="floor")});const b=y=>({x:Math.floor(y.x+y.w/2),y:Math.floor(y.y+y.h/2)});for(let y=0;y<f.length-1;y++)ee(a,b(f[y]),b(f[y+1]),l);ee(a,b(f[1]),b(f[4]),l),ee(a,b(f[0]),b(f[2]),l);for(const y of f)for(let T=y.x;T<y.x+y.w;T++){const S=y.y-1;S>1&&a[S][T]==="floor"&&a[S][T-1]==="wall"&&a[S][T+1]==="wall"&&(a[S][T]="door");const A=y.y+y.h;A<o-2&&a[A][T]==="floor"&&a[A][T-1]==="wall"&&a[A][T+1]==="wall"&&(a[A][T]="door")}const C=f[0],v=f[f.length-1],$=f.find(y=>y.kind==="alchemy")??f[2],F=f.find(y=>y.kind==="vault")??f[3],I=b(C),_=b(v);a[I.y][I.x]="stairs_up",a[_.y][_.x]="stairs_down",se(a,I,_)||(ee(a,I,_,l),a[I.y][I.x]="stairs_up",a[_.y][_.x]="stairs_down");const E={x:$.x+Math.min($.w-1,1),y:$.y+Math.min($.h-1,1)};(E.x===I.x&&E.y===I.y||E.x===_.x&&E.y===_.y)&&(E.x=Math.min(n-2,E.x+1)),a[E.y][E.x]="alchemy_desk";const De=1+R[s].alchemyBonusCharges,Q=new Set([`${I.x},${I.y}`,`${_.x},${_.y}`,`${E.x},${E.y}`]),U=y=>{for(let T=0;T<25;T++){const S=l.nextInt(y.x,y.x+y.w-1),A=l.nextInt(y.y,y.y+y.h-1),w=`${S},${A}`;if(!Q.has(w)&&O(a[A][S]))return Q.add(w),{x:S,y:A}}for(let T=1;T<o-1;T++)for(let S=1;S<n-1;S++){const A=`${S},${T}`;if(!Q.has(A)&&a[T][S]==="floor")return Q.add(A),{x:S,y:T}}return{x:I.x+1,y:I.y}},N=[];let q=1;const Re=l.pick([f[1],$,F]),ye=U(Re);N.push({id:`f${i}_item_${q++}`,x:ye.x,y:ye.y,kind:"potion",color:t.mending});const Z=U(F);i%2===1?N.push({id:`f${i}_item_${q++}`,x:Z.x,y:Z.y,kind:"scroll_upgrade"}):N.push({id:`f${i}_item_${q++}`,x:Z.x,y:Z.y,kind:"potion",color:t.might});const Oe=["liquid_flame","frost_mist","caustic_gas","shadow_veil"],Le=l.pick(Oe),He=l.pick([f[1],f[2],f[4]]),xe=U(He);if(N.push({id:`f${i}_item_${q++}`,x:xe.x,y:xe.y,kind:"potion",color:t[Le]}),i%2===0&&i<=8){const y=Math.min(4,Math.floor(i/2)+1),T=U(F);if(i%4===2){const S=W.filter(w=>w.tier===y),A=S.length>0?l.pick(S):W[3];N.push({id:`f${i}_item_${q++}`,x:T.x,y:T.y,kind:"weapon",weapon:A})}else{const S=z.filter(w=>w.tier===y),A=S.length>0?l.pick(S):z[3];N.push({id:`f${i}_item_${q++}`,x:T.x,y:T.y,kind:"armor",armor:A})}}const le=[];let be=1;const ke=te.filter(y=>!y.isBoss&&i>=y.minFloor&&i<=y.maxFloor),Be=ke.length>0?ke:[te[0]],Te=f.slice(1);for(let y=0;y<Te.length;y++){const T=Te[y];if(T.kind==="exit"&&(i===k.MINI_BOSS_FLOOR||i===k.FINAL_BOSS_FLOOR)){const w=te.find(L=>L.isBoss&&L.bossFloor===i),M=U(T);le.push({id:`f${i}_boss_${be++}`,templateId:w.id,name:w.name,glyph:w.glyph,color:w.color,x:M.x,y:M.y,hp:w.maxHp,maxHp:w.maxHp,attack:w.attack,defense:w.defense,moveTicks:w.moveTicks,attackTicks:w.attackTicks,isBoss:!0,nextActTick:w.moveTicks,stunnedTicks:0,burningTicks:0,poisonedTicks:0,sunderedDefense:0,telegraph:null,telegraphCooldown:0,alerted:!1});continue}const A=y===2&&i>=3?2:1;for(let w=0;w<A;w++){const M=l.pick(Be),L=U(T);le.push({id:`f${i}_mon_${be++}`,templateId:M.id,name:M.name,glyph:M.glyph,color:M.color,x:L.x,y:L.y,hp:M.maxHp,maxHp:M.maxHp,attack:M.attack,defense:M.defense,moveTicks:M.moveTicks,attackTicks:M.attackTicks,rangedRange:M.rangedRange,inflictsStatus:M.inflictsStatus,isBoss:!1,nextActTick:M.moveTicks,stunnedTicks:0,burningTicks:0,poisonedTicks:0,sunderedDefense:0,telegraph:null,telegraphCooldown:0,alerted:!1})}}return{floorNumber:i,width:n,height:o,tiles:a,explored:u,visible:x,hazards:d,rooms:f,entrancePos:I,stairsDownPos:_,alchemyPos:E,alchemyCharges:De,monsters:le,groundItems:N}}function oe(i,e,t){const s=k.FOV_RADIUS;for(let o=0;o<i.height;o++)for(let r=0;r<i.width;r++)i.visible[o][r]=!1;const n=(o,r,l,a)=>{let u=o,x=r;const d=Math.abs(l-o),h=Math.abs(a-r),g=o<l?1:-1,c=r<a?1:-1;let f=d-h;for(;;){if(u===l&&x===a)return!0;if(!(u===o&&x===r)&&(i.tiles[x][u]==="wall"||i.tiles[x][u]==="door"))return!1;const b=2*f;b>-h&&(f-=h,u+=g),b<d&&(f+=d,x+=c)}};for(let o=Math.max(0,t-s);o<=Math.min(i.height-1,t+s);o++)for(let r=Math.max(0,e-s);r<=Math.min(i.width-1,e+s);r++)(r-e)*(r-e)+(o-t)*(o-t)<=s*s&&n(e,t,r,o)&&(i.visible[o][r]=!0,i.explored[o][r]=!0)}function me(i){const e=i.seed>>>0||20261106,t=i.seedLabel??String(e),s=i.heroClass??"vanguard",n=R[s],{colorToEffect:o,effectToColor:r}=Me(e),l={crimson:!1,amber:!1,viridian:!1,azure:!1,violet:!1,obsidian:!1};for(const c of n.preIdentifiedEffects){const f=r[c];l[f]=!0}const a=[];let u=1;for(const c of n.startingPotions)a.push({id:`init_item_${u++}`,kind:"potion",color:r[c]});n.startsWithUpgradeScroll&&a.push({id:`init_item_${u++}`,kind:"scroll_upgrade"});const x=ue(1,e,r,s),d=n.baseHp+n.startingArmor.maxHpBonus,h={classId:s,name:n.name,x:x.entrancePos.x,y:x.entrancePos.y,hp:d,maxHp:d,baseAttack:n.baseAttack,baseDefense:n.baseDefense,moveTicks:n.moveTicks,weapon:{...n.startingWeapon},weaponUpgrades:0,armor:{...n.startingArmor},armorUpgrades:0,abilityUpgrades:0,abilityCooldownTicks:0,nextActTick:0,invisibleTicks:0,burningTicks:0,poisonedTicks:0,chilledTicks:0,firebrandTicks:0,iceArmorHp:0,inventory:a};oe(x,h.x,h.y);const g=n.preIdentifiedEffects.map(c=>`${D[c].name} (${r[c].toUpperCase()})`).join(", ");return{seed:e,seedLabel:t,rngState:e,status:"playing",currentTick:0,turnsTaken:0,monstersSlain:0,upgradesApplied:0,colorToEffect:o,effectToColor:r,identifiedColors:l,hero:h,floor:x,combatLog:[`[Tick 0] ${n.name} descends to Floor 1 (Seed: ${t}).`,`[Tick 0] Class Knowledge: ${g} is pre-identified!`],recentTurnSummaries:[],epitaph:null,debugRevealAll:!!i.debug}}function ae(i){const e=i.firebrandTicks>0?3:0;return i.baseAttack+i.weapon.attackBonus+i.weaponUpgrades*2+e}function ie(i){return i.baseDefense+i.armor.defenseBonus+i.armorUpgrades*2}function re(i){return Math.max(7,i.weapon.attackTicks-Math.floor(i.weaponUpgrades/2))+(i.chilledTicks>0?3:0)}function ge(i){return i.moveTicks+(i.chilledTicks>0?3:0)}function ne(i,e){const t=i.colorToEffect[e],s=i.identifiedColors[e]||i.debugRevealAll,n=P.find(o=>o.id===e);return s?{title:`${D[t].name} [${n.label}]`,identified:!0,effect:t}:{title:`Unidentified ${n.label}`,identified:!1,effect:t}}function $e(i){const e=ge(i.hero),t=re(i.hero),n=R[i.hero.classId].abilityCostTicks,o=[],r=[];for(const l of i.floor.monsters){if(l.hp<=0||l.stunnedTicks>0||!(i.floor.visible[l.y]?.[l.x]||Math.abs(l.x-i.hero.x)+Math.abs(l.y-i.hero.y)<=2))continue;const x=l.nextActTick+Math.min(l.moveTicks,l.attackTicks);x<=i.currentTick+t&&o.push(l.name),x<=i.currentTick+e&&r.push(l.name)}return{moveTicks:e,attackTicks:t,abilityTicks:n,doubleTurnMonstersOnAttack:o,doubleTurnMonstersOnMove:r}}function p(i,e){const t=`[Tick ${i.currentTick}] ${e}`;i.combatLog.push(t),i.combatLog.length>80&&i.combatLog.shift(),i.recentTurnSummaries.push(t),i.recentTurnSummaries.length>5&&i.recentTurnSummaries.shift()}function V(i,e,t){if(i.status!=="playing"||e<=0)return;let s=e;if(i.hero.iceArmorHp>0){const n=Math.min(i.hero.iceArmorHp,s);i.hero.iceArmorHp-=n,s-=n}if(s<=0){p(i,`Ice Armor absorbs ${e} damage from ${t}!`);return}i.hero.hp=Math.max(0,i.hero.hp-s),i.hero.hp<=0&&Fe(i,t)}function Fe(i,e){i.status="defeat",p(i,`PERMADEATH: Slain on Floor ${i.floor.floorNumber} by ${e}!`);const t=i.hero.inventory.some(o=>o.kind==="potion"&&i.colorToEffect[o.color]==="mending"),s=Object.values(i.identifiedColors).filter(Boolean).length;let n="Use corridor doorways to fight monsters 1-on-1 and watch the Action-Cost Tick Preview to avoid enemy double-turns.";e.includes("Potion of")?n="Drinking unknown vials at low HP is lethal if they contain Liquid Flame or Caustic Gas. Test unknown colors at an Alchemy Desk or THROW them at enemies first!":e.includes("Slam")||e.includes("Eruption")?n="Bosses telegraph multi-tile slams 1 turn in advance. Step out of red warning tiles or use Shield Bash / Frost Mist to stun the boss and cancel the slam!":t&&(n="You fell with a Potion of Mending still in your pack! Drink healing draughts before dropping into critical single-hit range."),i.epitaph={id:`epitaph_${i.seed}_${i.currentTick}`,timestamp:new Date().toISOString(),seed:i.seed,seedLabel:i.seedLabel,heroClass:i.hero.classId,heroClassName:i.hero.name,outcome:"defeat",floorReached:i.floor.floorNumber,totalTicks:i.currentTick,turnsTaken:i.turnsTaken,monstersSlain:i.monstersSlain,potionsIdentified:s,upgradesApplied:i.upgradesApplied,killedBy:e,lastFiveTurns:[...i.recentTurnSummaries],tacticalLesson:n}}function Ne(i){i.status="victory",p(i,`VICTORY! ${i.hero.name} conquered all 10 floors and ascended from the Abyssal Core!`);const e=Object.values(i.identifiedColors).filter(Boolean).length;i.epitaph={id:`victory_${i.seed}_${i.currentTick}`,timestamp:new Date().toISOString(),seed:i.seed,seedLabel:i.seedLabel,heroClass:i.hero.classId,heroClassName:i.hero.name,outcome:"victory",floorReached:i.floor.floorNumber,totalTicks:i.currentTick,turnsTaken:i.turnsTaken,monstersSlain:i.monstersSlain,potionsIdentified:e,upgradesApplied:i.upgradesApplied,killedBy:"Survived & Conquered Floor 10",lastFiveTurns:[...i.recentTurnSummaries],tacticalLesson:"Masterful alchemy and turn-tick control! Try racing the same seed with another Hero Class."}}function Ue(i){const{hero:e,floor:t}=i,s=[];for(const n of t.groundItems){if(n.x!==e.x||n.y!==e.y){s.push(n);continue}if(n.kind==="weapon"){const o=e.weapon.attackBonus-(e.weapon.attackTicks-10);n.weapon.attackBonus-(n.weapon.attackTicks-10)>=o?(e.weapon={...n.weapon},p(i,`Equipped ${n.weapon.name} (+${n.weapon.attackBonus} ATK, ${n.weapon.attackTicks}t)!`)):p(i,`Inspected ${n.weapon.name} (kept superior ${e.weapon.name}).`)}else if(n.kind==="armor")if(n.armor.defenseBonus>=e.armor.defenseBonus){const o=n.armor.maxHpBonus-e.armor.maxHpBonus;e.armor={...n.armor},o>0&&(e.maxHp+=o,e.hp+=o),p(i,`Equipped ${n.armor.name} (+${n.armor.defenseBonus} DEF, +${n.armor.maxHpBonus} Max HP)!`)}else p(i,`Inspected ${n.armor.name} (kept superior ${e.armor.name}).`);else if(e.inventory.length<k.MAX_INVENTORY_SLOTS)if(n.kind==="potion"){e.inventory.push({id:n.id,kind:"potion",color:n.color});const o=ne(i,n.color);p(i,`Picked up ${o.title}.`)}else e.inventory.push({id:n.id,kind:"scroll_upgrade"}),p(i,"Picked up Scroll of Upgrade!");else p(i,"Inventory full (6/6)! Drink or throw a vial to make room."),s.push(n)}t.groundItems=s}function B(i,e){if(!(e.hp>0)){if(i.monstersSlain+=1,e.telegraph=null,p(i,`Defeated ${e.name}!`),e.isBoss){const t=Math.min(i.hero.maxHp-i.hero.hp,24);t>0&&(i.hero.hp+=t),i.floor.floorNumber===k.MINI_BOSS_FLOOR?(i.floor.groundItems.push({id:`boss_reward_${i.currentTick}`,x:e.x,y:e.y,kind:"scroll_upgrade"}),p(i,"The Iron Warden collapses! Floor 5 Stairs unlocked & Scroll of Upgrade dropped!")):i.floor.floorNumber===k.FINAL_BOSS_FLOOR&&p(i,"THE ABYSSAL CORE SHATTERS! Step onto the Sanctuary Stairs (>) to claim Victory!")}i.floor.monsters=i.floor.monsters.filter(t=>t.hp>0)}}function qe(i,e){const{hero:t}=i,s=re(t),n=t.invisibleTicks>0;n&&(t.invisibleTicks=0);const o=ae(t),r=n?2:1,l=Math.max(0,e.defense-e.sunderedDefense),a=Math.max(2,Math.round(o*r)-l);return e.hp=Math.max(0,e.hp-a),e.alerted=!0,p(i,`${n?"AMBUSH CRIT! ":""}You strike ${e.name} with ${t.weapon.name} for ${a} dmg (${s} ticks).`),B(i,e),s}function Ve(i,e){const t=[],s=i.hero.x,n=i.hero.y;for(let o=-1;o<=1;o++)for(let r=-1;r<=1;r++){const l=s+r,a=n+o;l>=1&&l<i.floor.width-1&&a>=1&&a<i.floor.height-1&&O(i.floor.tiles[a][l])&&t.push({x:l,y:a})}if(e.templateId==="abyssal_core"){const o=[{dx:2,dy:0},{dx:-2,dy:0},{dx:0,dy:2},{dx:0,dy:-2}];for(const r of o){const l=s+r.dx,a=n+r.dy;l>=1&&l<i.floor.width-1&&a>=1&&a<i.floor.height-1&&O(i.floor.tiles[a][l])&&t.push({x:l,y:a})}return{name:"Abyssal Void Eruption",tiles:t,damage:28,stunTicks:10}}return{name:"Seismic Chain Slam",tiles:t,damage:24,stunTicks:10}}function H(i,e){const{hero:t,floor:s}=i,n=i.currentTick+e;t.nextActTick=n,i.turnsTaken+=1,t.abilityCooldownTicks>0&&(t.abilityCooldownTicks=Math.max(0,t.abilityCooldownTicks-e)),t.invisibleTicks>0&&(t.invisibleTicks=Math.max(0,t.invisibleTicks-e)),t.chilledTicks>0&&(t.chilledTicks=Math.max(0,t.chilledTicks-e)),t.firebrandTicks>0&&(t.firebrandTicks=Math.max(0,t.firebrandTicks-e));const o=s.hazards[t.y]?.[t.x];if(o?.type==="fire"?t.burningTicks=Math.max(t.burningTicks,20):o?.type==="caustic"&&(t.poisonedTicks=Math.max(t.poisonedTicks,20)),t.burningTicks>0&&(t.burningTicks=Math.max(0,t.burningTicks-e),p(i,"Flames scorch you for 5 fire damage!"),V(i,5,"Burning Flames (Potion of Liquid Flame)"),i.status!=="playing")||t.poisonedTicks>0&&(t.poisonedTicks=Math.max(0,t.poisonedTicks-e),p(i,"Caustic venom deals 5 poison damage!"),V(i,5,"Caustic Poison (Potion of Caustic Gas)"),i.status!=="playing"))return;for(let l=0;l<s.height;l++)for(let a=0;a<s.width;a++){const u=s.hazards[l][a];u&&(u.remainingTicks-=e,u.remainingTicks<=0&&(s.hazards[l][a]=null))}let r=0;for(;i.status==="playing"&&r<60;){r+=1;const l=s.monsters.filter(c=>c.hp>0&&c.nextActTick<=n).sort((c,f)=>c.nextActTick-f.nextActTick);if(l.length===0)break;const a=l[0];i.currentTick=a.nextActTick;const u=s.hazards[a.y]?.[a.x];if(u?.type==="fire"?a.burningTicks=Math.max(a.burningTicks,20):u?.type==="caustic"&&(a.poisonedTicks=Math.max(a.poisonedTicks,20),a.sunderedDefense=Math.max(a.sunderedDefense,2)),a.burningTicks>0&&(a.burningTicks=Math.max(0,a.burningTicks-10),a.hp=Math.max(0,a.hp-6),p(i,`${a.name} burns for 6 fire damage!`),a.hp<=0)){B(i,a);continue}if(a.poisonedTicks>0&&(a.poisonedTicks=Math.max(0,a.poisonedTicks-10),a.hp=Math.max(0,a.hp-6),p(i,`${a.name} takes 6 caustic gas damage!`),a.hp<=0)){B(i,a);continue}if(a.stunnedTicks>0){a.stunnedTicks=Math.max(0,a.stunnedTicks-10),a.telegraph=null,a.nextActTick+=a.moveTicks;continue}if(a.telegraph){const c=a.telegraph;if(a.telegraph=null,a.telegraphCooldown=2,c.tiles.some(b=>b.x===t.x&&b.y===t.y)){const b=Math.max(6,c.damage-Math.floor(ie(t)/2));p(i,`BOSS SLAM! ${a.name}'s ${c.name} crushes you for ${b} damage!`),V(i,b,`${a.name}'s ${c.name}`)}else p(i,`You dodged ${a.name}'s ${c.name} as it shatters the flagstones!`);a.nextActTick+=a.attackTicks;continue}const x=Math.abs(a.x-t.x)+Math.abs(a.y-t.y),d=Math.max(Math.abs(a.x-t.x),Math.abs(a.y-t.y));if(s.visible[a.y]?.[a.x]&&t.invisibleTicks<=0&&(a.alerted=!0),!a.alerted||t.invisibleTicks>0){a.nextActTick+=a.moveTicks;continue}if(a.isBoss&&d<=3)if(a.telegraphCooldown<=0){a.telegraph=Ve(i,a),p(i,`WARNING! ${a.name} raises its weapon for ${a.telegraph.name} — move out of red danger tiles!`),a.nextActTick+=a.attackTicks;continue}else a.telegraphCooldown-=1;const h=d===1,g=!!a.rangedRange&&d<=(a.rangedRange??1)&&s.visible[a.y]?.[a.x];if(h||g){const c=ie(t),f=Math.max(1,a.attack-c);p(i,`${a.name} ${g&&!h?"blasts":"strikes"} you for ${f} dmg!`),a.inflictsStatus==="poison"&&t.poisonedTicks<=0?(t.poisonedTicks=20,p(i,`${a.name} inflicts Poison!`)):a.inflictsStatus==="burn"&&t.burningTicks<=0&&(t.burningTicks=20,p(i,`${a.name}'s embers ignite you!`)),V(i,f,a.name),a.nextActTick+=a.attackTicks;continue}if(x<=12){const c=[],f=Math.sign(t.x-a.x),b=Math.sign(t.y-a.y);f!==0&&c.push({x:a.x+f,y:a.y}),b!==0&&c.push({x:a.x,y:a.y+b}),f!==0&&b!==0&&c.push({x:a.x+f,y:a.y+b});let C=!1;for(const v of c)if(v.x>=0&&v.x<s.width&&v.y>=0&&v.y<s.height&&O(s.tiles[v.y][v.x])&&!(v.x===t.x&&v.y===t.y)&&!s.monsters.some($=>$.hp>0&&$.x===v.x&&$.y===v.y)){a.x=v.x,a.y=v.y,C=!0;break}if(!C){const v=se(s.tiles,{x:a.x,y:a.y},{x:t.x,y:t.y});if(v&&v.length>=2){const $=v[1];!($.x===t.x&&$.y===t.y)&&!s.monsters.some(F=>F.hp>0&&F.x===$.x&&F.y===$.y)&&(a.x=$.x,a.y=$.y)}}}a.nextActTick+=a.moveTicks}i.currentTick=n,oe(s,t.x,t.y)}function Ie(i,e){if(i.status!=="playing")return i;const{hero:t,floor:s}=i;switch(e.type){case"MOVE":{const n=t.x+e.dx,o=t.y+e.dy;if(n<0||n>=s.width||o<0||o>=s.height)return i;const r=s.monsters.find(a=>a.hp>0&&a.x===n&&a.y===o);if(r){const a=qe(i,r);return H(i,a),i}if(!O(s.tiles[o][n]))return i;t.x=n,t.y=o,Ue(i),s.tiles[o][n]==="alchemy_desk"&&s.alchemyCharges>0?p(i,`Standing at Alchemy Desk (${s.alchemyCharges} charge${s.alchemyCharges>1?"s":""} left) — click [Identify Vial] to test an unknown potion safely!`):s.tiles[o][n]==="stairs_down"&&p(i,"Standing on Stairs Down (>) — press [>] or click [Descend Floor] to advance!");const l=ge(t);return H(i,l),i}case"WAIT":return!s.monsters.some(o=>o.hp>0&&s.visible[o.y]?.[o.x])&&t.hp<t.maxHp&&t.burningTicks===0&&t.poisonedTicks===0&&(t.hp=Math.min(t.maxHp,t.hp+1)),p(i,`You wait and steady your breathing (${k.WAIT_TICKS} ticks).`),H(i,k.WAIT_TICKS),i;case"DRINK_POTION":{const n=t.inventory[e.slotIndex];if(!n||n.kind!=="potion")return i;t.inventory.splice(e.slotIndex,1);const o=n.color,r=i.colorToEffect[o],l=i.identifiedColors[o];i.identifiedColors[o]=!0;const a=D[r];switch(l||p(i,`IDENTIFIED! ${o.toUpperCase()} VIAL is ${a.name}!`),r){case"mending":{const u=Math.max(28,Math.round(t.maxHp*.45));t.hp=Math.min(t.maxHp,t.hp+u),t.burningTicks=0,t.poisonedTicks=0,t.chilledTicks=0,p(i,`Drank ${a.name}: Restored +${u} HP and cleansed all ailments!`);break}case"might":{t.baseAttack+=2,t.maxHp+=12,t.hp=Math.min(t.maxHp,t.hp+12),p(i,`Drank ${a.name}: Permanently gained +2 Base Attack and +12 Max HP!`);break}case"shadow_veil":{t.invisibleTicks=50,p(i,`Drank ${a.name}: Cloaked in Invisibility for 50 ticks (next attack deals 2.0x Ambush Crit)!`);break}case"liquid_flame":{t.burningTicks=30,t.firebrandTicks=40,p(i,`HAZARD! Drank ${a.name} — it scorches your throat (Burning for 30t, +3 Fire ATK)! Throw this color at enemies instead!`),V(i,6,`Self-Drunk ${a.name}`);break}case"frost_mist":{t.chilledTicks=20,t.burningTicks=0,t.iceArmorHp=6,p(i,`Drank ${a.name} — chills your limbs (+3t action cost for 20t, +6 Ice Armor)! Throw this color to freeze enemies!`);break}case"caustic_gas":{t.poisonedTicks=30,p(i,`HAZARD! Drank ${a.name} — corrosive fumes choke you! Throw this color at enemy packs instead!`),V(i,7,`Self-Drunk ${a.name}`);break}}return i.status==="playing"&&H(i,k.POTION_USE_TICKS),i}case"THROW_POTION":{const n=t.inventory[e.slotIndex];if(!n||n.kind!=="potion")return i;const o=Math.max(1,Math.min(s.width-2,e.targetX)),r=Math.max(1,Math.min(s.height-2,e.targetY));t.inventory.splice(e.slotIndex,1);const l=n.color,a=i.colorToEffect[l],u=i.identifiedColors[l];i.identifiedColors[l]=!0;const x=D[a],d=R[t.classId].thrownPotionMultiplier;u||p(i,`IDENTIFIED! Thrown ${l.toUpperCase()} VIAL is ${x.name}!`);const h=[];for(let g=-1;g<=1;g++)for(let c=-1;c<=1;c++){const f=o+c,b=r+g;if(f<0||f>=s.width||b<0||b>=s.height||!O(s.tiles[b][f]))continue;a==="liquid_flame"?s.hazards[b][f]={type:"fire",remainingTicks:30}:a==="frost_mist"?s.hazards[b][f]={type:"frost",remainingTicks:20}:a==="caustic_gas"&&(s.hazards[b][f]={type:"caustic",remainingTicks:40});const C=s.monsters.find(v=>v.hp>0&&v.x===f&&v.y===b);C&&h.push(C)}switch(a){case"liquid_flame":{const g=Math.round(12*d);for(const c of h)c.hp=Math.max(0,c.hp-g),c.burningTicks=30,c.alerted=!0,B(i,c);p(i,`Threw ${x.name} at (${o},${r}): Ignited 3x3 firestorm (${g} fire dmg + 30t burn to ${h.length} foe(s))!`);break}case"frost_mist":{const g=Math.round(8*d);for(const c of h)c.hp=Math.max(0,c.hp-g),c.stunnedTicks=20,c.telegraph=null,c.alerted=!0,B(i,c);p(i,`Threw ${x.name} at (${o},${r}): Froze ${h.length} foe(s) solid for 20 ticks!`);break}case"caustic_gas":{const g=Math.round(9*d);for(const c of h)c.hp=Math.max(0,c.hp-g),c.poisonedTicks=40,c.sunderedDefense=2,c.alerted=!0,B(i,c);p(i,`Threw ${x.name} at (${o},${r}): Corrosive cloud hits ${h.length} foe(s) (${g} dmg, Poison & -2 DEF)!`);break}case"shadow_veil":{for(const g of h)g.stunnedTicks=15,g.telegraph=null;p(i,`Threw ${x.name} at (${o},${r}): Blinded ${h.length} foe(s) for 15 ticks!`);break}case"mending":{Math.abs(o-t.x)<=1&&Math.abs(r-t.y)<=1?(t.hp=Math.min(t.maxHp,t.hp+18),p(i,`Threw ${x.name} nearby: Splash mist healed +18 HP.`)):p(i,`Threw ${x.name} at (${o},${r}) — drink this color directly for full +45% HP healing!`);break}case"might":{p(i,`Threw ${x.name} at (${o},${r}) — the vial shatters! Drink this color next time for permanent +2 ATK & +12 Max HP!`);break}}return H(i,k.POTION_USE_TICKS),i}case"USE_SCROLL_UPGRADE":{const n=t.inventory[e.slotIndex];if(!n||n.kind!=="scroll_upgrade")return i;t.inventory.splice(e.slotIndex,1),i.upgradesApplied+=1;const o=t.classId==="vanguard"?2:0;if(e.choice==="weapon")t.weaponUpgrades+=1,o>0&&(t.maxHp+=o,t.hp+=o),p(i,`Scroll of Upgrade reforges ${t.weapon.name} +${t.weaponUpgrades} (+2 ATK, ${re(t)}t speed)!`);else if(e.choice==="armor"){t.armorUpgrades+=1;const r=10+o;t.maxHp+=r,t.hp=Math.min(t.maxHp,t.hp+r),p(i,`Scroll of Upgrade reinforces ${t.armor.name} +${t.armorUpgrades} (+2 DEF, +${r} Max HP)!`)}else t.abilityUpgrades+=1,t.abilityCooldownTicks=0,p(i,`Scroll of Upgrade empowers ${R[t.classId].abilityName} +${t.abilityUpgrades} & resets cooldown!`);return H(i,k.SCROLL_USE_TICKS),i}case"USE_CLASS_ABILITY":{const n=R[t.classId];if(t.abilityCooldownTicks>0)return p(i,`${n.abilityName} is on cooldown (${t.abilityCooldownTicks} ticks remaining).`),i;if(t.classId==="vanguard"){const o=s.monsters.find(l=>l.hp>0&&Math.max(Math.abs(l.x-t.x),Math.abs(l.y-t.y))<=1);if(!o)return p(i,"Shield Bash requires an adjacent monster within 1 tile!"),i;const r=Math.max(4,Math.round(ae(t)*(1.4+t.abilityUpgrades*.2))-o.defense);o.hp=Math.max(0,o.hp-r),o.stunnedTicks=20+t.abilityUpgrades*5,o.telegraph=null,t.abilityCooldownTicks=Math.max(40,n.abilityCooldownTicks-t.abilityUpgrades*10),p(i,`SHIELD BASH! Slammed ${o.name} for ${r} dmg and Stunned it for ${o.stunnedTicks} ticks!`),B(i,o)}else if(t.classId==="rogue"){t.invisibleTicks=35+t.abilityUpgrades*10;for(const o of s.monsters)o.hp>0&&Math.max(Math.abs(o.x-t.x),Math.abs(o.y-t.y))<=1&&(o.stunnedTicks=15,o.telegraph=null);t.abilityCooldownTicks=Math.max(40,n.abilityCooldownTicks-t.abilityUpgrades*10),p(i,`SMOKE BOMB! Vanished into Shadow Veil for ${t.invisibleTicks} ticks (next hit deals 2.0x Ambush Crit)!`)}else{const o=s.monsters.filter(a=>a.hp>0&&Math.max(Math.abs(a.x-t.x),Math.abs(a.y-t.y))<=5&&(s.visible[a.y]?.[a.x]||Math.abs(a.x-t.x)+Math.abs(a.y-t.y)<=2)).sort((a,u)=>Math.abs(a.x-t.x)+Math.abs(a.y-t.y)-(Math.abs(u.x-t.x)+Math.abs(u.y-t.y)));if(o.length===0)return p(i,"Arcane Catalyst Bolt requires a visible enemy within 5 tiles!"),i;const r=o[0],l=12+s.floorNumber*2+t.abilityUpgrades*5;r.hp=Math.max(0,r.hp-l),r.sunderedDefense=Math.max(r.sunderedDefense,2),r.alerted=!0,t.abilityCooldownTicks=Math.max(35,n.abilityCooldownTicks-t.abilityUpgrades*10),p(i,`ARCANE CATALYST BOLT! Blasted ${r.name} for ${l} arcane dmg & sundered -2 DEF!`),B(i,r)}return H(i,n.abilityCostTicks),i}case"USE_ALCHEMY_DESK":{if(!s.alchemyPos||s.alchemyCharges<=0)return p(i,"No active Alchemy Desk charges remaining on this floor."),i;if(Math.max(Math.abs(t.x-s.alchemyPos.x),Math.abs(t.y-s.alchemyPos.y))>1)return p(i,"Move onto or adjacent to the Alchemy Desk (⚗) to analyze a potion!"),i;let o;if(e.slotIndex!==void 0){const l=t.inventory[e.slotIndex];l&&l.kind==="potion"&&!i.identifiedColors[l.color]&&(o=l)}if(o||(o=t.inventory.find(l=>l.kind==="potion"&&!i.identifiedColors[l.color])),!o){const l=P.find(u=>!i.identifiedColors[u.id]);if(!l)return p(i,"All 6 Potion Colors are already identified for this run!"),i;i.identifiedColors[l.id]=!0,s.alchemyCharges-=1;const a=D[i.colorToEffect[l.id]];return p(i,`ALCHEMY DESK: Distilled residue reveals ${l.label.toUpperCase()} is ${a.name}!`),H(i,k.ALCHEMY_USE_TICKS),i}i.identifiedColors[o.color]=!0,s.alchemyCharges-=1;const r=D[i.colorToEffect[o.color]];return p(i,`ALCHEMY DESK: Safely tested ${o.color.toUpperCase()} VIAL — it is ${r.name}! (Vial preserved)`),H(i,k.ALCHEMY_USE_TICKS),i}case"DESCEND_STAIRS":{if(t.x!==s.stairsDownPos.x||t.y!==s.stairsDownPos.y)return p(i,"Step onto the Stairs Down (>) tile to descend!"),i;const n=s.monsters.find(l=>l.hp>0&&l.isBoss);if(n)return p(i,`The stairs are sealed by ${n.name}! Defeat the floor boss first!`),i;if(s.floorNumber>=k.MAX_FLOORS)return Ne(i),i;const o=s.floorNumber+1,r=ue(o,i.seed,i.effectToColor,t.classId);i.floor=r,t.x=r.entrancePos.x,t.y=r.entrancePos.y,t.hp=Math.min(t.maxHp,t.hp+10);for(const l of r.monsters)l.nextActTick=i.currentTick+l.moveTicks;return oe(r,t.x,t.y),p(i,`Descended to Floor ${o} (+10 HP breather recovery).${o===k.MINI_BOSS_FLOOR?" BEWARE: The Iron Warden patrols the exit chamber!":o===k.FINAL_BOSS_FLOOR?" FINAL FLOOR: The Abyssal Core awaits!":""}`),i}}}class We{ctx=null;muted=!1;ensureCtx(){if(this.muted)return null;if(this.ctx)return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx;try{const e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e)}catch{this.ctx=null}return this.ctx}setMuted(e){this.muted=e}isMuted(){return this.muted}playStep(){const e=this.ensureCtx();if(e)try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="triangle",s.frequency.setValueAtTime(110,t),s.frequency.exponentialRampToValueAtTime(52,t+.055),n.gain.setValueAtTime(.06,t),n.gain.exponentialRampToValueAtTime(.001,t+.06),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.065)}catch{}}playStrike(){const e=this.ensureCtx();if(e)try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(340,t),s.frequency.exponentialRampToValueAtTime(95,t+.12),n.gain.setValueAtTime(.12,t),n.gain.exponentialRampToValueAtTime(.001,t+.13),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.14)}catch{}}playPotionShatter(){const e=this.ensureCtx();if(e)try{const t=e.currentTime;[980,1320,1640].forEach((n,o)=>{const r=e.createOscillator(),l=e.createGain();r.type="sine",r.frequency.setValueAtTime(n,t+o*.02),r.frequency.exponentialRampToValueAtTime(n*.55,t+.16+o*.02),l.gain.setValueAtTime(.08,t+o*.02),l.gain.exponentialRampToValueAtTime(.001,t+.18+o*.02),r.connect(l),l.connect(e.destination),r.start(t+o*.02),r.stop(t+.2+o*.02)})}catch{}}playIdentifyOrUpgrade(){const e=this.ensureCtx();if(e)try{const t=e.currentTime;[440,554.37,659.25,880].forEach((n,o)=>{const r=e.createOscillator(),l=e.createGain();r.type="triangle",r.frequency.setValueAtTime(n,t+o*.055),l.gain.setValueAtTime(.09,t+o*.055),l.gain.exponentialRampToValueAtTime(.001,t+o*.055+.18),r.connect(l),l.connect(e.destination),r.start(t+o*.055),r.stop(t+o*.055+.19)})}catch{}}playBossTelegraph(){const e=this.ensureCtx();if(e)try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(75,t),s.frequency.linearRampToValueAtTime(52,t+.35),n.gain.setValueAtTime(.14,t),n.gain.exponentialRampToValueAtTime(.001,t+.36),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.38)}catch{}}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const m=30;class ze{container;state;audio;selectedClass="vanguard";pendingThrowSlot=null;hoverTile=null;showImportExport=!1;canvas;ctx=null;keydownHandler;constructor(e,t){this.container=e,this.state=t,this.selectedClass=t.hero.classId,this.audio=new We,this.keydownHandler=s=>this.handleKeyDown(s),window.addEventListener("keydown",this.keydownHandler),this.renderShell(),this.syncUI()}getState(){return this.state}restartWithSeed(e,t,s){const n=s??this.selectedClass;this.selectedClass=n,this.pendingThrowSlot=null,this.state=me({seed:e,seedLabel:t??String(e),heroClass:n,debug:this.state.debugRevealAll}),j(this.state),this.syncUI()}toggleDebug(e){this.state.debugRevealAll=e!==void 0?e:!this.state.debugRevealAll,this.syncUI()}destroy(){window.removeEventListener("keydown",this.keydownHandler),this.audio.destroy(),this.container.innerHTML=""}dispatchCommand(e){if(this.state.status!=="playing")return;const t=this.state.floor.floorNumber,s=Object.values(this.state.identifiedColors).filter(Boolean).length,n=this.state.upgradesApplied;Ie(this.state,e),j(this.state);const o=Object.values(this.state.identifiedColors).filter(Boolean).length;e.type==="THROW_POTION"||e.type==="DRINK_POTION"?this.audio.playPotionShatter():o>s||this.state.upgradesApplied>n||this.state.floor.floorNumber>t?this.audio.playIdentifyOrUpgrade():e.type==="MOVE"?this.audio.playStep():e.type==="USE_CLASS_ABILITY"&&this.audio.playStrike(),this.state.floor.monsters.some(r=>r.telegraph!==null)&&this.audio.playBossTelegraph(),this.pendingThrowSlot=null,this.syncUI()}handleKeyDown(e){const t=e.target?.tagName;if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT")return;if((e.key==="d"||e.key==="D")&&e.shiftKey){e.preventDefault(),this.toggleDebug();return}if(e.key==="Escape"&&this.pendingThrowSlot!==null){e.preventDefault(),this.pendingThrowSlot=null,this.syncUI();return}if(this.state.status!=="playing")return;const s={ArrowUp:{dx:0,dy:-1},w:{dx:0,dy:-1},W:{dx:0,dy:-1},ArrowDown:{dx:0,dy:1},s:{dx:0,dy:1},S:{dx:0,dy:1},ArrowLeft:{dx:-1,dy:0},a:{dx:-1,dy:0},A:{dx:-1,dy:0},ArrowRight:{dx:1,dy:0},d:{dx:1,dy:0},D:{dx:1,dy:0}};if(s[e.key]){e.preventDefault();const{dx:n,dy:o}=s[e.key];this.dispatchCommand({type:"MOVE",dx:n,dy:o});return}if(e.key===" "||e.key==="."){e.preventDefault(),this.dispatchCommand({type:"WAIT"});return}if(e.key==="q"||e.key==="Q"){e.preventDefault(),this.dispatchCommand({type:"USE_CLASS_ABILITY"});return}if(e.key==="e"||e.key==="E"){e.preventDefault(),this.dispatchCommand({type:"USE_ALCHEMY_DESK"});return}if(e.key===">"||e.key==="Enter"){e.preventDefault(),this.dispatchCommand({type:"DESCEND_STAIRS"});return}if(["1","2","3","4","5","6"].includes(e.key)){e.preventDefault();const n=Number(e.key)-1,o=this.state.hero.inventory[n];if(!o)return;if(o.kind==="potion"){const r=this.state.colorToEffect[o.color];this.state.identifiedColors[o.color]&&D[r].preferThrow?this.activateThrowMode(n):this.dispatchCommand({type:"DRINK_POTION",slotIndex:n})}else this.dispatchCommand({type:"USE_SCROLL_UPGRADE",slotIndex:n,choice:"weapon"})}}activateThrowMode(e){if(this.pendingThrowSlot===e){const t=this.findNearestVisibleMonster();if(t){this.dispatchCommand({type:"THROW_POTION",slotIndex:e,targetX:t.x,targetY:t.y});return}this.pendingThrowSlot=null,this.syncUI();return}this.pendingThrowSlot=e,this.syncUI()}findNearestVisibleMonster(){const{hero:e,floor:t}=this.state,s=t.monsters.filter(n=>n.hp>0&&(t.visible[n.y]?.[n.x]||this.state.debugRevealAll)&&Math.max(Math.abs(n.x-e.x),Math.abs(n.y-e.y))<=k.THROW_RANGE).sort((n,o)=>Math.abs(n.x-e.x)+Math.abs(n.y-e.y)-(Math.abs(o.x-e.x)+Math.abs(o.y-e.y)));return s[0]?{x:s[0].x,y:s[0].y}:null}handleCanvasClick(e,t){if(this.state.status!=="playing")return;const s=this.canvas.getBoundingClientRect(),n=this.canvas.width/s.width,o=this.canvas.height/s.height,r=Math.floor((e-s.left)*n/m),l=Math.floor((t-s.top)*o/m);if(r<0||r>=this.state.floor.width||l<0||l>=this.state.floor.height)return;if(this.pendingThrowSlot!==null){Math.max(Math.abs(r-this.state.hero.x),Math.abs(l-this.state.hero.y))<=k.THROW_RANGE&&this.dispatchCommand({type:"THROW_POTION",slotIndex:this.pendingThrowSlot,targetX:r,targetY:l});return}const{hero:a,floor:u}=this.state;if(r===a.x&&l===a.y){r===u.stairsDownPos.x&&l===u.stairsDownPos.y?this.dispatchCommand({type:"DESCEND_STAIRS"}):u.alchemyPos&&r===u.alchemyPos.x&&l===u.alchemyPos.y&&u.alchemyCharges>0?this.dispatchCommand({type:"USE_ALCHEMY_DESK"}):this.dispatchCommand({type:"WAIT"});return}const x=r-a.x,d=l-a.y;if(Math.abs(x)<=1&&Math.abs(d)<=1&&(x===0||d===0)){this.dispatchCommand({type:"MOVE",dx:x,dy:d});return}const h=se(u.tiles,{x:a.x,y:a.y},{x:r,y:l});if(h&&h.length>=2){const g=h[1];this.dispatchCommand({type:"MOVE",dx:g.x-a.x,dy:g.y-a.y})}else Math.abs(x)>=Math.abs(d)?this.dispatchCommand({type:"MOVE",dx:Math.sign(x),dy:0}):this.dispatchCommand({type:"MOVE",dx:0,dy:Math.sign(d)})}renderShell(){const e=J();if(this.container.innerHTML=`
      <style>
        .tfd-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #090d16;
          color: #e2e8f0;
          min-height: 100%;
          padding: 12px;
          box-sizing: border-box;
          user-select: none;
        }
        .tfd-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 10px;
        }
        .tfd-title-block h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tfd-title-block p {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: #94a3b8;
        }
        .tfd-seed-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .tfd-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .tfd-btn:hover:not(:disabled) {
          background: #334155;
          border-color: #10b981;
        }
        .tfd-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .tfd-btn-primary {
          background: #059669;
          border-color: #10b981;
          color: #ffffff;
        }
        .tfd-btn-primary:hover:not(:disabled) {
          background: #10b981;
        }
        .tfd-btn-amber {
          background: #b45309;
          border-color: #f59e0b;
          color: #ffffff;
        }
        .tfd-btn-danger {
          background: #991b1b;
          border-color: #ef4444;
          color: #ffffff;
        }
        .tfd-input {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 0.78rem;
          width: 115px;
        }
        .tfd-class-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .tfd-class-card {
          flex: 1 1 220px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .tfd-class-card.active {
          border-color: #10b981;
          background: #0f2922;
        }
        .tfd-class-card h3 {
          margin: 0 0 3px;
          font-size: 0.86rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tfd-class-card p {
          margin: 0;
          font-size: 0.73rem;
          color: #94a3b8;
          line-height: 1.3;
        }
        .tfd-hud-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
          font-size: 0.82rem;
        }
        .tfd-stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #1e293b;
          padding: 4px 9px;
          border-radius: 6px;
          font-weight: 600;
        }
        .tfd-tick-banner {
          background: #172033;
          border-left: 4px solid #38bdf8;
          border-radius: 6px;
          padding: 7px 12px;
          margin-bottom: 10px;
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .tfd-tick-banner.warning {
          background: #2c1618;
          border-left-color: #ef4444;
          color: #fecaca;
        }
        .tfd-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr);
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .tfd-main-grid {
            grid-template-columns: 1fr;
          }
        }
        .tfd-canvas-wrap {
          background: #05080f;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .tfd-canvas {
          width: 100%;
          max-width: 780px;
          height: auto;
          aspect-ratio: 26 / 18;
          border-radius: 6px;
          cursor: pointer;
          image-rendering: crisp-edges;
          background: #070a12;
        }
        .tfd-canvas-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
          font-size: 0.74rem;
          color: #94a3b8;
          justify-content: center;
        }
        .tfd-side-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tfd-card {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 10px 12px;
        }
        .tfd-card h2 {
          margin: 0 0 8px;
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #38bdf8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tfd-controls-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          max-width: 210px;
        }
        .tfd-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .tfd-inv-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tfd-inv-slot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 0.78rem;
        }
        .tfd-journal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        .tfd-journal-cell {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .tfd-vial-dot {
          width: 12px;
          height: 16px;
          border-radius: 3px 3px 6px 6px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.45);
        }
        .tfd-log-box {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 8px;
          height: 135px;
          overflow-y: auto;
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.74rem;
          line-height: 1.45;
          color: #cbd5e1;
        }
        .tfd-modal-overlay {
          margin-top: 10px;
          background: #141c2f;
          border: 2px solid #ef4444;
          border-radius: 10px;
          padding: 14px;
        }
        .tfd-modal-overlay.victory {
          border-color: #10b981;
          background: #0d2621;
        }
      </style>

      <div class="tfd-root">
        <header class="tfd-header">
          <div class="tfd-title-block">
            <h1>⚗ TEN FLOORS DOWN <span style="font-size:0.75rem;color:#94a3b8;font-weight:500;">Shattered Alchemy Roguelike</span></h1>
            <p>10 Procedural Floors • 6 Shuffled Potion Colors • Action-Cost Tick Clock • Permadeath Post-Mortem</p>
          </div>
          <div class="tfd-seed-controls">
            <button class="tfd-btn tfd-btn-primary" id="tfd-daily-btn" title="Launch Today's Daily Seed Run">
              📅 Daily Seed (${e})
            </button>
            <input type="text" class="tfd-input" id="tfd-seed-input" placeholder="Seed / Word" value="${this.state.seedLabel}" />
            <button class="tfd-btn" id="tfd-new-seed-btn">🎲 Launch Seed</button>
            <button class="tfd-btn" id="tfd-debug-btn">👁 Debug [Shift+D]</button>
            <button class="tfd-btn" id="tfd-mute-btn">🔊 Audio</button>
            <button class="tfd-btn" id="tfd-io-btn">💾 Save/JSON</button>
          </div>
        </header>

        <section class="tfd-class-bar" id="tfd-class-bar"></section>

        <section class="tfd-hud-strip" id="tfd-hud-strip"></section>

        <section class="tfd-tick-banner" id="tfd-tick-banner"></section>

        <div id="tfd-io-drawer" style="display:none;margin-bottom:10px;" class="tfd-card">
          <h2>Save Snapshot Export / Import</h2>
          <textarea id="tfd-io-textarea" style="width:100%;height:70px;background:#090d16;color:#cbd5e1;border:1px solid #334155;border-radius:6px;font-size:0.74rem;padding:6px;"></textarea>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button class="tfd-btn tfd-btn-primary" id="tfd-export-btn">Copy Current Snapshot</button>
            <button class="tfd-btn tfd-btn-amber" id="tfd-import-btn">Load Snapshot JSON</button>
          </div>
        </div>

        <div class="tfd-main-grid">
          <div class="tfd-canvas-wrap">
            <canvas
              id="tfd-canvas"
              class="tfd-canvas"
              width="${k.GRID_WIDTH*m}"
              height="${k.GRID_HEIGHT*m}"
            ></canvas>
            <div class="tfd-canvas-legend">
              <span><strong>WASD / Arrows / Tap</strong>: Move or Melee Attack</span>
              <span><strong>Space</strong>: Wait (10t)</span>
              <span><strong>Q</strong>: Class Ability</span>
              <span><strong>E</strong>: Alchemy Desk (⚗)</span>
              <span><strong>&gt; / Enter</strong>: Descend Stairs</span>
            </div>
            <div id="tfd-epitaph-container" style="width:100%;"></div>
          </div>

          <div class="tfd-side-panel">
            <div class="tfd-card">
              <h2>
                <span>Tactical Actions & Movement</span>
                <span id="tfd-throw-status-badge" style="font-size:0.74rem;color:#f59e0b;"></span>
              </h2>
              <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
                <div class="tfd-controls-grid">
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-n">▲ N</button>
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-w">◀ W</button>
                  <button class="tfd-btn" id="tfd-move-wait" title="Wait 10 Ticks">⏳</button>
                  <button class="tfd-btn" id="tfd-move-e">E ▶</button>
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-s">▼ S</button>
                  <div></div>
                </div>
                <div class="tfd-action-row" style="flex:1;flex-direction:column;align-items:stretch;">
                  <button class="tfd-btn tfd-btn-amber" id="tfd-ability-btn"></button>
                  <button class="tfd-btn" id="tfd-alchemy-btn"></button>
                  <button class="tfd-btn tfd-btn-primary" id="tfd-descend-btn"></button>
                </div>
              </div>
            </div>

            <div class="tfd-card">
              <h2>
                <span>Alchemical Pack & Scrolls (<span id="tfd-inv-count">0</span>/6)</span>
                <span style="font-size:0.7rem;color:#94a3b8;">Keys [1-6]</span>
              </h2>
              <div class="tfd-inv-list" id="tfd-inv-list"></div>
            </div>

            <div class="tfd-card">
              <h2>
                <span>Seed Potion Color Journal</span>
                <span id="tfd-journal-progress" style="font-size:0.74rem;color:#10b981;"></span>
              </h2>
              <div class="tfd-journal-grid" id="tfd-journal-grid"></div>
            </div>

            <div class="tfd-card">
              <h2>Combat & Alchemy Chronicle</h2>
              <div class="tfd-log-box" id="tfd-log-box"></div>
            </div>
          </div>
        </div>
      </div>
    `,this.canvas=this.container.querySelector("#tfd-canvas"),!(typeof navigator<"u"&&/jsdom/i.test(navigator.userAgent))&&this.canvas&&typeof this.canvas.getContext=="function")try{this.ctx=this.canvas.getContext("2d")}catch{this.ctx=null}this.canvas.addEventListener("click",s=>{this.handleCanvasClick(s.clientX,s.clientY)}),this.canvas.addEventListener("mousemove",s=>{const n=this.canvas.getBoundingClientRect(),o=this.canvas.width/n.width,r=this.canvas.height/n.height,l=Math.floor((s.clientX-n.left)*o/m),a=Math.floor((s.clientY-n.top)*r/m);(!this.hoverTile||this.hoverTile.x!==l||this.hoverTile.y!==a)&&(this.hoverTile={x:l,y:a},this.drawDungeonCanvas())}),this.canvas.addEventListener("mouseleave",()=>{this.hoverTile=null,this.drawDungeonCanvas()}),this.container.querySelector("#tfd-daily-btn")?.addEventListener("click",()=>{const s=J(),n=pe(s),o=this.container.querySelector("#tfd-seed-input");o&&(o.value=`DAILY-${s}`),this.restartWithSeed(n,`DAILY-${s}`,this.selectedClass)}),this.container.querySelector("#tfd-new-seed-btn")?.addEventListener("click",()=>{const n=this.container.querySelector("#tfd-seed-input")?.value.trim()||String(Math.floor(Math.random()*9e5+1e5)),o=/^\d+$/.test(n)?Number(n):he(n);this.restartWithSeed(o,n,this.selectedClass)}),this.container.querySelector("#tfd-debug-btn")?.addEventListener("click",()=>{this.toggleDebug()}),this.container.querySelector("#tfd-mute-btn")?.addEventListener("click",()=>{const s=!this.audio.isMuted();this.audio.setMuted(s);const n=this.container.querySelector("#tfd-mute-btn");n&&(n.textContent=s?"🔇 Muted":"🔊 Audio")}),this.container.querySelector("#tfd-io-btn")?.addEventListener("click",()=>{this.showImportExport=!this.showImportExport;const s=this.container.querySelector("#tfd-io-drawer"),n=this.container.querySelector("#tfd-io-textarea");s&&(s.style.display=this.showImportExport?"block":"none"),this.showImportExport&&n&&(n.value=ce(this.state))}),this.container.querySelector("#tfd-export-btn")?.addEventListener("click",()=>{const s=this.container.querySelector("#tfd-io-textarea");s&&(s.value=ce(this.state),s.select())}),this.container.querySelector("#tfd-import-btn")?.addEventListener("click",()=>{const s=this.container.querySelector("#tfd-io-textarea");if(!s)return;const n=Ae(s.value);n&&(this.state=n,this.selectedClass=n.hero.classId,j(this.state),this.syncUI())}),this.container.querySelector("#tfd-move-n")?.addEventListener("click",()=>{this.dispatchCommand({type:"MOVE",dx:0,dy:-1})}),this.container.querySelector("#tfd-move-s")?.addEventListener("click",()=>{this.dispatchCommand({type:"MOVE",dx:0,dy:1})}),this.container.querySelector("#tfd-move-w")?.addEventListener("click",()=>{this.dispatchCommand({type:"MOVE",dx:-1,dy:0})}),this.container.querySelector("#tfd-move-e")?.addEventListener("click",()=>{this.dispatchCommand({type:"MOVE",dx:1,dy:0})}),this.container.querySelector("#tfd-move-wait")?.addEventListener("click",()=>{this.dispatchCommand({type:"WAIT"})}),this.container.querySelector("#tfd-ability-btn")?.addEventListener("click",()=>{this.dispatchCommand({type:"USE_CLASS_ABILITY"})}),this.container.querySelector("#tfd-alchemy-btn")?.addEventListener("click",()=>{this.dispatchCommand({type:"USE_ALCHEMY_DESK"})}),this.container.querySelector("#tfd-descend-btn")?.addEventListener("click",()=>{this.dispatchCommand({type:"DESCEND_STAIRS"})})}syncUI(){this.renderClassSelector(),this.renderHudStrip(),this.renderTickPreviewBanner(),this.renderActionButtons(),this.renderInventoryList(),this.renderPotionJournal(),this.renderCombatLog(),this.renderEpitaphModal(),this.drawDungeonCanvas()}renderClassSelector(){const e=this.container.querySelector("#tfd-class-bar");if(!e)return;const t=["vanguard","rogue","alchemist"];e.innerHTML=t.map(s=>{const n=R[s],o=this.state.hero.classId===s;return`
          <div class="tfd-class-card ${o?"active":""}" data-class-id="${s}">
            <h3 style="color:${n.accentColor}">
              <span>[${n.glyph}] ${n.name}</span>
              <span style="font-size:0.72rem;color:#cbd5e1;">${o?"● ACTIVE RUN":"Switch & Restart"}</span>
            </h3>
            <p>${n.passiveDescription}</p>
          </div>
        `}).join(""),e.querySelectorAll(".tfd-class-card").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-class-id");n&&n!==this.state.hero.classId&&this.restartWithSeed(this.state.seed,this.state.seedLabel,n)})})}renderHudStrip(){const e=this.container.querySelector("#tfd-hud-strip");if(!e)return;const{hero:t,floor:s}=this.state,n=Math.max(0,Math.min(100,Math.round(t.hp/t.maxHp*100))),o=n>50?"#10b981":n>25?"#f59e0b":"#ef4444",r=[];t.invisibleTicks>0&&r.push(`<span class="tfd-stat-pill" style="background:#312e81;color:#c7d2fe;">👻 Shadow Veil (${t.invisibleTicks}t — 2x Crit!)</span>`),t.burningTicks>0&&r.push(`<span class="tfd-stat-pill" style="background:#7f1d1d;color:#fecaca;">🔥 Burning (${t.burningTicks}t)</span>`),t.poisonedTicks>0&&r.push(`<span class="tfd-stat-pill" style="background:#365314;color:#d9f99d;">☠ Poisoned (${t.poisonedTicks}t)</span>`),t.chilledTicks>0&&r.push(`<span class="tfd-stat-pill" style="background:#0c4a6e;color:#bae6fd;">❄ Chilled (${t.chilledTicks}t)</span>`),t.iceArmorHp>0&&r.push(`<span class="tfd-stat-pill" style="background:#0e7490;color:#cffafe;">🛡 Ice Shield +${t.iceArmorHp}</span>`),e.innerHTML=`
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
        <span class="tfd-stat-pill" style="background:#064e3b;color:#6ee7b7;">
          🪜 Floor ${s.floorNumber} / ${k.MAX_FLOORS}
        </span>
        <span class="tfd-stat-pill">
          ⏱ Tick ${this.state.currentTick} (Turn ${this.state.turnsTaken})
        </span>
        <span class="tfd-stat-pill" style="border:1px solid ${o};">
          ❤️ HP: <strong style="color:${o}">${t.hp} / ${t.maxHp}</strong>
        </span>
        <span class="tfd-stat-pill">
          ⚔️ ATK: <strong>${ae(t)}</strong> (${t.weapon.name}${t.weaponUpgrades>0?` +${t.weaponUpgrades}`:""})
        </span>
        <span class="tfd-stat-pill">
          🛡 DEF: <strong>${ie(t)}</strong> (${t.armor.name}${t.armorUpgrades>0?` +${t.armorUpgrades}`:""})
        </span>
        <span class="tfd-stat-pill">
          💀 Slain: ${this.state.monstersSlain}
        </span>
        ${r.join("")}
      </div>
      <div style="font-size:0.75rem;color:#94a3b8;">
        Seed: <strong>${this.state.seedLabel}</strong> ${this.state.debugRevealAll?'<span style="color:#f59e0b;">[DEBUG ON]</span>':""}
      </div>
    `}renderTickPreviewBanner(){const e=this.container.querySelector("#tfd-tick-banner");if(!e)return;const t=$e(this.state),s=t.doubleTurnMonstersOnAttack.length>0,n=this.state.floor.monsters.find(o=>o.hp>0&&o.telegraph);if(n&&n.telegraph){e.className="tfd-tick-banner warning",e.innerHTML=`
        <div>
          <strong>🚨 BOSS TELEGRAPH ACTIVE:</strong> ${n.name} is charging
          <u>${n.telegraph.name}</u> (${n.telegraph.damage} dmg)!
          Step out of the pulsing red tiles or Stun/Freeze the boss immediately!
        </div>
        <div style="font-weight:700;">Move: +${t.moveTicks}t | Strike: +${t.attackTicks}t</div>
      `;return}s?(e.className="tfd-tick-banner warning",e.innerHTML=`
        <div>
          <strong>⚠ ACTION-COST DOUBLE-TURN WARNING:</strong> Swinging your weapon (+${t.attackTicks} ticks)
          allows <u>${t.doubleTurnMonstersOnAttack.join(", ")}</u> to act TWICE before your next turn!
        </div>
        <div>Move: <strong>+${t.moveTicks}t</strong> | Strike: <strong>+${t.attackTicks}t</strong> | Ability: <strong>+${t.abilityTicks}t</strong></div>
      `):(e.className="tfd-tick-banner",e.innerHTML=`
        <div>
          <strong>⏱ Action-Cost Scheduler:</strong>
          Move = <strong>+${t.moveTicks} ticks</strong> •
          Weapon Strike = <strong>+${t.attackTicks} ticks</strong> •
          Class Ability = <strong>+${t.abilityTicks} ticks</strong>
        </div>
        <div style="color:#94a3b8;">No enemy double-turn on next strike</div>
      `)}renderActionButtons(){const{hero:e,floor:t}=this.state,s=R[e.classId],n=this.container.querySelector("#tfd-ability-btn");n&&(e.abilityCooldownTicks>0?(n.textContent=`⚡ ${s.abilityName} (CD: ${e.abilityCooldownTicks}t)`,n.disabled=!0):(n.textContent=`⚡ [Q] ${s.abilityName}${e.abilityUpgrades>0?` +${e.abilityUpgrades}`:""} (${s.abilityCostTicks}t)`,n.disabled=this.state.status!=="playing"));const o=this.container.querySelector("#tfd-alchemy-btn");if(o){const a=t.alchemyPos!==null&&Math.max(Math.abs(e.x-t.alchemyPos.x),Math.abs(e.y-t.alchemyPos.y))<=1;o.textContent=`⚗ [E] Test Vial at Alchemy Desk (${t.alchemyCharges} left)`,o.disabled=this.state.status!=="playing"||!a||t.alchemyCharges<=0}const r=this.container.querySelector("#tfd-descend-btn");if(r){const a=e.x===t.stairsDownPos.x&&e.y===t.stairsDownPos.y,u=t.monsters.some(x=>x.hp>0&&x.isBoss);t.floorNumber===k.MAX_FLOORS?r.textContent=u?"🔒 Defeat The Abyssal Core to Unlock Exit":"🏆 [>] Ascend Sanctuary Stairs (CLAIM VICTORY!)":r.textContent=`🪜 [>] Descend to Floor ${t.floorNumber+1}`,r.disabled=this.state.status!=="playing"||!a||u}const l=this.container.querySelector("#tfd-throw-status-badge");l&&(this.pendingThrowSlot!==null?l.textContent=`🎯 Click any dungeon tile (Range ${k.THROW_RANGE}) to THROW vial! [Esc to cancel]`:l.textContent="")}renderInventoryList(){const e=this.container.querySelector("#tfd-inv-list"),t=this.container.querySelector("#tfd-inv-count");if(!e)return;const{inventory:s}=this.state.hero;if(t&&(t.textContent=String(s.length)),s.length===0){e.innerHTML='<div style="color:#64748b;font-size:0.76rem;padding:6px;">Pack is empty. Step onto dungeon vials or scrolls to pick them up.</div>';return}e.innerHTML=s.map((n,o)=>{if(n.kind==="potion"){const r=P.find(d=>d.id===n.color),l=ne(this.state,n.color),a=D[l.effect],u=this.pendingThrowSlot===o,x=l.identified?a.preferThrow?`Throw (3x3): ${a.throwSummary}`:`Drink: ${a.drinkSummary}`:`${r.liquidDesc} — Drink, Throw, or test at Alchemy Desk (⚗)`;return`
            <div class="tfd-inv-slot">
              <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
                <span class="tfd-vial-dot" style="background:${r.hex};"></span>
                <div style="min-width:0;">
                  <div style="font-weight:700;color:${l.identified?"#f8fafc":"#fde68a"};">
                    [${o+1}] ${l.title}
                  </div>
                  <div style="font-size:0.7rem;color:#94a3b8;">${x}</div>
                </div>
              </div>
              <div style="display:flex;gap:5px;">
                <button class="tfd-btn" data-drink-slot="${o}" title="Drink Vial (10 ticks)">
                  🧪 Drink
                </button>
                <button class="tfd-btn ${u?"tfd-btn-amber":""}" data-throw-slot="${o}" title="Select tile (or click twice to throw at nearest foe)">
                  🎯 ${u?"Throw Now":"Throw"}
                </button>
              </div>
            </div>
          `}return`
          <div class="tfd-inv-slot" style="border-color:#f59e0b;">
            <div>
              <div style="font-weight:700;color:#fcd34d;">[${o+1}] 📜 Scroll of Upgrade</div>
              <div style="font-size:0.7rem;color:#94a3b8;">Permanently empower Weapon, Armor, or Class Ability:</div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="tfd-btn tfd-btn-amber" data-upg-slot="${o}" data-upg-choice="weapon">+Weapon</button>
              <button class="tfd-btn tfd-btn-primary" data-upg-slot="${o}" data-upg-choice="armor">+Armor</button>
              <button class="tfd-btn" data-upg-slot="${o}" data-upg-choice="ability">+Ability</button>
            </div>
          </div>
        `}).join(""),e.querySelectorAll("[data-drink-slot]").forEach(n=>{n.addEventListener("click",()=>{const o=Number(n.getAttribute("data-drink-slot"));this.dispatchCommand({type:"DRINK_POTION",slotIndex:o})})}),e.querySelectorAll("[data-throw-slot]").forEach(n=>{n.addEventListener("click",()=>{const o=Number(n.getAttribute("data-throw-slot"));this.activateThrowMode(o)})}),e.querySelectorAll("[data-upg-slot]").forEach(n=>{n.addEventListener("click",()=>{const o=Number(n.getAttribute("data-upg-slot")),r=n.getAttribute("data-upg-choice");this.dispatchCommand({type:"USE_SCROLL_UPGRADE",slotIndex:o,choice:r})})})}renderPotionJournal(){const e=this.container.querySelector("#tfd-journal-grid"),t=this.container.querySelector("#tfd-journal-progress");if(!e)return;const s=Object.values(this.state.identifiedColors).filter(Boolean).length;t&&(t.textContent=`${s} / 6 Identified`),e.innerHTML=P.map(n=>{const o=ne(this.state,n.id),r=D[o.effect];return`
        <div class="tfd-journal-cell">
          <span class="tfd-vial-dot" style="background:${n.hex};"></span>
          <div style="min-width:0;">
            <div style="font-weight:700;color:${o.identified?"#f8fafc":"#94a3b8"};">
              ${n.label}: ${o.identified?`<span style="color:${r.preferThrow?"#fca5a5":"#6ee7b7"}">${r.shortName}</span>`:"??? Unknown"}
            </div>
            <div style="font-size:0.68rem;color:#64748b;">
              ${o.identified?r.preferThrow?"⚔ Throw (3x3 AoE)":"✨ Drink (Self Buff)":"Unidentified"}
            </div>
          </div>
        </div>
      `}).join("")}renderCombatLog(){const e=this.container.querySelector("#tfd-log-box");if(!e)return;const t=this.state.combatLog.slice(-18);e.innerHTML=t.map(s=>{let n="#cbd5e1";return s.includes("IDENTIFIED")||s.includes("Scroll of Upgrade")?n="#6ee7b7":s.includes("HAZARD")||s.includes("WARNING")||s.includes("BOSS SLAM")||s.includes("PERMADEATH")?n="#fca5a5":(s.includes("AMBUSH CRIT")||s.includes("VICTORY"))&&(n="#fde047"),`<div style="color:${n};margin-bottom:2px;">${s}</div>`}).join(""),e.scrollTop=e.scrollHeight}renderEpitaphModal(){const e=this.container.querySelector("#tfd-epitaph-container");if(!e)return;if(this.state.status==="playing"||!this.state.epitaph){e.innerHTML="";return}const t=this.state.epitaph,s=t.outcome==="victory",n=de().slice(0,5),o=P.map(r=>{const l=D[this.state.colorToEffect[r.id]];return`<span style="display:inline-flex;align-items:center;gap:4px;background:#0f172a;padding:3px 7px;border-radius:5px;font-size:0.73rem;">
        <span style="width:9px;height:9px;border-radius:50%;background:${r.hex};display:inline-block;"></span>
        <strong>${r.label}:</strong> ${l.name}
      </span>`}).join(" ");e.innerHTML=`
      <div class="tfd-modal-overlay ${s?"victory":""}">
        <h2 style="margin:0 0 6px;font-size:1.1rem;color:${s?"#34d399":"#f87171"};">
          ${s?"🏆 VICTORY — THE ABYSSAL CORE CONQUERED!":"💀 PERMADEATH EPITAPH — CAUSE OF DEATH RECAP"}
        </h2>
        <p style="margin:0 0 8px;font-size:0.84rem;color:#e2e8f0;">
          <strong>${t.heroClassName}</strong> on <strong>Floor ${t.floorReached}</strong> (Seed: <code>${t.seedLabel}</code>) •
          Outcome: <strong>${t.killedBy}</strong> •
          Total Time: <strong>${t.totalTicks} ticks</strong> (${t.turnsTaken} turns) •
          Monsters Slain: <strong>${t.monstersSlain}</strong> •
          Potions Identified: <strong>${t.potionsIdentified}/6</strong>
        </p>

        <div style="background:#090d16;border:1px solid #334155;border-radius:7px;padding:8px 10px;margin-bottom:8px;">
          <div style="font-size:0.75rem;font-weight:700;color:#38bdf8;margin-bottom:4px;">
            LAST 5 TURNS COMBAT LOG REPLAY:
          </div>
          ${t.lastFiveTurns.map(r=>`<div style="font-size:0.74rem;font-family:monospace;color:#cbd5e1;">• ${r}</div>`).join("")}
        </div>

        <div style="background:#1e293b;border-left:4px solid #f59e0b;padding:7px 10px;border-radius:5px;font-size:0.78rem;margin-bottom:8px;">
          <strong>💡 Tactical Post-Mortem Lesson:</strong> ${t.tacticalLesson}
        </div>

        <div style="margin-bottom:10px;">
          <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:4px;">Seed <code>${t.seedLabel}</code> True Potion Table:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${o}</div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <button class="tfd-btn tfd-btn-primary" id="tfd-retry-same-seed">🔄 Retry Same Seed (${t.seedLabel})</button>
          <button class="tfd-btn tfd-btn-amber" id="tfd-play-new-random">🎲 New Random Seed</button>
        </div>

        ${n.length>0?`<div style="font-size:0.72rem;color:#94a3b8;border-top:1px solid #334155;padding-top:6px;">
                <strong>Hall of Chronicles (Recent Runs):</strong>
                ${n.map(r=>`<div>• [${r.outcome.toUpperCase()}] ${r.heroClassName} — Floor ${r.floorReached} (${r.killedBy}) [Seed: ${r.seedLabel}]</div>`).join("")}
              </div>`:""}
      </div>
    `,e.querySelector("#tfd-retry-same-seed")?.addEventListener("click",()=>{this.restartWithSeed(this.state.seed,this.state.seedLabel,this.selectedClass)}),e.querySelector("#tfd-play-new-random")?.addEventListener("click",()=>{const r=Math.floor(Math.random()*9e5+1e5);this.restartWithSeed(r,String(r),this.selectedClass)})}drawDungeonCanvas(){const e=this.ctx;if(!e)return;const{floor:t,hero:s,debugRevealAll:n}=this.state;e.clearRect(0,0,this.canvas.width,this.canvas.height);const o=new Set;for(const d of t.monsters)if(d.hp>0&&d.telegraph)for(const h of d.telegraph.tiles)o.add(`${h.x},${h.y}`);for(let d=0;d<t.height;d++)for(let h=0;h<t.width;h++){const g=h*m,c=d*m,f=t.visible[d][h]||n,b=t.explored[d][h]||n,C=t.tiles[d][h];if(!b){e.fillStyle="#05070e",e.fillRect(g,c,m,m);continue}C==="wall"?(e.fillStyle=f?"#1e293b":"#0f172a",e.fillRect(g,c,m,m),e.strokeStyle=f?"#334155":"#1e293b",e.strokeRect(g+.5,c+.5,m-1,m-1)):(e.fillStyle=f?"#0f172a":"#090d16",e.fillRect(g,c,m,m),e.strokeStyle=f?"#1e293b":"#111827",e.strokeRect(g+.5,c+.5,m-1,m-1),C==="door"?(e.fillStyle=f?"#92400e":"#451a03",e.fillRect(g+4,c+4,m-8,m-8)):C==="stairs_up"?(e.fillStyle="#64748b",e.font="bold 16px monospace",e.textAlign="center",e.textBaseline="middle",e.fillText("<",g+m/2,c+m/2)):C==="stairs_down"?(e.fillStyle="#10b981",e.fillRect(g+3,c+3,m-6,m-6),e.fillStyle="#052e16",e.font="bold 18px monospace",e.textAlign="center",e.textBaseline="middle",e.fillText(">",g+m/2,c+m/2)):C==="alchemy_desk"&&(e.fillStyle=t.alchemyCharges>0?"#7e22ce":"#334155",e.fillRect(g+3,c+3,m-6,m-6),e.fillStyle="#f3e8ff",e.font="bold 16px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("⚗",g+m/2,c+m/2)));const v=t.hazards[d][h];v&&f&&(v.type==="fire"?e.fillStyle="rgba(239, 68, 68, 0.38)":v.type==="frost"?e.fillStyle="rgba(56, 189, 248, 0.35)":e.fillStyle="rgba(132, 204, 22, 0.36)",e.fillRect(g+2,c+2,m-4,m-4)),o.has(`${h},${d}`)&&(e.fillStyle="rgba(244, 63, 94, 0.42)",e.fillRect(g+1,c+1,m-2,m-2),e.strokeStyle="#f43f5e",e.lineWidth=2,e.strokeRect(g+2,c+2,m-4,m-4),e.lineWidth=1)}for(const d of t.groundItems){const h=t.visible[d.y]?.[d.x]||n,g=t.explored[d.y]?.[d.x]||n;if(!h&&!g)continue;const c=d.x*m+m/2,f=d.y*m+m/2;if(d.kind==="potion"){const b=P.find(C=>C.id===d.color);e.fillStyle=b.hex,e.beginPath(),e.arc(c,f+2,7,0,Math.PI*2),e.fill(),e.strokeStyle="#ffffff",e.stroke(),e.fillStyle="#e2e8f0",e.fillRect(c-2,f-8,4,4)}else d.kind==="scroll_upgrade"?(e.fillStyle="#fde047",e.fillRect(c-7,f-6,14,12),e.fillStyle="#713f12",e.font="bold 11px monospace",e.textAlign="center",e.textBaseline="middle",e.fillText("UP",c,f)):d.kind==="weapon"?(e.fillStyle="#38bdf8",e.font="bold 15px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("⚔",c,f)):d.kind==="armor"&&(e.fillStyle="#c084fc",e.font="bold 15px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("🛡",c,f))}for(const d of t.monsters){if(d.hp<=0||!(t.visible[d.y]?.[d.x]||n))continue;const g=d.x*m,c=d.y*m,f=g+m/2,b=c+m/2;e.fillStyle=d.isBoss?"#450a0a":"#1e1b4b",e.beginPath(),e.arc(f,b,d.isBoss?12:10,0,Math.PI*2),e.fill(),e.strokeStyle=d.color,e.lineWidth=d.isBoss?2.5:1.5,e.stroke(),e.lineWidth=1,e.fillStyle=d.color,e.font=`bold ${d.isBoss?15:13}px monospace`,e.textAlign="center",e.textBaseline="middle",e.fillText(d.glyph,f,b);const C=Math.max(0,d.hp/d.maxHp);e.fillStyle="#090d16",e.fillRect(g+3,c+2,m-6,4),e.fillStyle=d.isBoss?"#f43f5e":"#ef4444",e.fillRect(g+3,c+2,Math.round((m-6)*C),4),d.stunnedTicks>0&&(e.fillStyle="#38bdf8",e.font="bold 9px sans-serif",e.fillText("STUN",f,c+m-3))}const r=s.x*m,l=s.y*m,a=r+m/2,u=l+m/2,x=R[s.classId];if(e.save(),s.invisibleTicks>0&&(e.globalAlpha=.6),e.fillStyle=x.accentColor,e.beginPath(),e.arc(a,u,11,0,Math.PI*2),e.fill(),e.strokeStyle="#ffffff",e.lineWidth=2,e.stroke(),e.fillStyle="#090d16",e.font="bold 14px monospace",e.textAlign="center",e.textBaseline="middle",e.fillText("@",a,u),e.restore(),this.pendingThrowSlot!==null&&this.hoverTile){const{x:d,y:h}=this.hoverTile,g=Math.max(Math.abs(d-s.x),Math.abs(h-s.y))<=k.THROW_RANGE;e.strokeStyle=g?"#f59e0b":"#ef4444",e.lineWidth=2;for(let c=-1;c<=1;c++)for(let f=-1;f<=1;f++){const b=d+f,C=h+c;b>=0&&b<t.width&&C>=0&&C<t.height&&e.strokeRect(b*m+2,C*m+2,m-4,m-4)}e.lineWidth=1}}}const _e={id:k.ID,number:10,title:k.TITLE,subtitle:k.SUBTITLE,genre:"Turn-Based Tactical Roguelike / Alchemy Dungeon Crawler",primaryReference:"Shattered Pixel Dungeon",supportingReference:"Brogue",oneSentenceLoop:"Descend 10 procedural dungeon floors where every step, strike, and item costs Action Ticks, 6 Potion Colors are shuffled per seed until identified by drinking, throwing, or Alchemy Desks, and permadeath ends with a cause-of-death combat recap.",shortGoal:"Identify unknown potion colors, upgrade your gear, and defeat The Iron Warden on Floor 5.",longGoal:"Survive all 10 floors, destroy The Abyssal Core final boss on Floor 10, and conquer the Daily Seed!",controlsSummary:"WASD/Arrows or Tap tile to Move/Attack • Space: Wait • 1-6: Drink/Throw Potions & Upgrade Scrolls • Q: Class Ability • E: Alchemy Desk • >: Descend Stairs",accentColor:k.ACCENT_COLOR};function Ee(i,e){let t=e?.initialSeed!==void 0?null:ve();if(t)e?.debug!==void 0&&(t.debugRevealAll=e.debug);else{const n=J(),o=e?.initialSeed!==void 0?e.initialSeed:pe(n),r=e?.initialSeed!==void 0?String(e.initialSeed):`DAILY-${n}`;t=me({seed:o,seedLabel:r,heroClass:"vanguard",debug:e?.debug}),j(t)}const s=new ze(i,t);return{destroy(){s.destroy()},getStateSnapshot(){return JSON.parse(JSON.stringify(s.getState()))},restartWithSeed(n){s.restartWithSeed(n,String(n))},toggleDebug(n){s.toggleDebug(n)}}}const Ge={metadata:_e,mountGame:Ee},Ye=Object.freeze(Object.defineProperty({__proto__:null,ARMOR_CATALOG:z,GAME_CONFIG:k,HERO_CLASSES:R,MONSTER_TEMPLATES:te,POTION_COLORS:P,POTION_EFFECTS:D,POTION_EFFECT_ORDER:Ce,SeededRng:fe,WEAPON_CATALOG:W,applyCommand:Ie,buildPotionColorMap:Me,clearActiveRun:Se,createInitialGameState:me,default:Ge,exportRunSnapshot:ce,findShortestPath:se,generateFloor:ue,getActionTickPreview:$e,getDailySeedNumber:pe,getDailySeedString:J,getHeroAttackPower:ae,getHeroAttackTicks:re,getHeroDefense:ie,getHeroMoveTicks:ge,getPotionDisplayName:ne,hashSeedString:he,importRunSnapshot:Ae,isWalkableTile:O,loadActiveRun:ve,loadChronicles:de,metadata:_e,mountGame:Ee,recordEpitaph:we,saveActiveRun:j,updateFieldOfView:oe},Symbol.toStringTag,{value:"Module"}));export{Ye as g,Ee as m};
