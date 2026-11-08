class J{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;const i=window.AudioContext||window.webkitAudioContext;if(!i)return null;if(!this.ctx)try{this.ctx=new i}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}isMuted(){return this.muted}setMuted(i){this.muted=i}playGrabPluck(){const i=this.ensureContext();if(!i)return;const t=i.currentTime,o=i.createOscillator(),n=i.createGain();o.type="triangle",o.frequency.setValueAtTime(310,t),o.frequency.exponentialRampToValueAtTime(590,t+.08),n.gain.setValueAtTime(.11,t),n.gain.exponentialRampToValueAtTime(.001,t+.09),o.connect(n),n.connect(i.destination),o.start(t),o.stop(t+.09)}playSliceCrunch(){const i=this.ensureContext();if(!i)return;const t=i.currentTime;[523.25,783.99,1174.66].forEach((n,r)=>{const c=i.createOscillator(),d=i.createGain();c.type=r%2===0?"sawtooth":"square",c.frequency.setValueAtTime(n,t+r*.02),c.frequency.exponentialRampToValueAtTime(n*.55,t+r*.02+.08),d.gain.setValueAtTime(.09,t+r*.02),d.gain.exponentialRampToValueAtTime(.001,t+r*.02+.09),c.connect(d),d.connect(i.destination),c.start(t+r*.02),c.stop(t+r*.02+.09)})}playHybridSplice(){const i=this.ensureContext();if(!i)return;const t=i.currentTime;[261.63,329.63,466.16,587.33,739.99].forEach((n,r)=>{const c=i.createOscillator(),d=i.createGain();c.type="triangle",c.frequency.setValueAtTime(n*.96,t+r*.018),c.frequency.exponentialRampToValueAtTime(n,t+r*.018+.06),d.gain.setValueAtTime(.08,t+r*.018),d.gain.exponentialRampToValueAtTime(.001,t+.35),c.connect(d),d.connect(i.destination),c.start(t+r*.018),c.stop(t+.36)})}playVortexBoil(){const i=this.ensureContext();if(!i)return;const t=i.currentTime;[196,246.94,293.66,392,493.88].forEach((n,r)=>{const c=i.createOscillator(),d=i.createGain();c.type="sine",c.frequency.setValueAtTime(n,t+r*.03),c.frequency.exponentialRampToValueAtTime(n*1.25,t+r*.03+.07),d.gain.setValueAtTime(.1,t+r*.03),d.gain.exponentialRampToValueAtTime(.001,t+r*.03+.09),c.connect(d),d.connect(i.destination),c.start(t+r*.03),c.stop(t+r*.03+.09)})}playPatronSatisfied(i){const t=this.ensureContext();if(!t)return;const o=t.currentTime,n=1+Math.min(.5,(i-1)*.07);[329.63,415.3,493.88,659.25,830.61].forEach((c,d)=>{const p=t.createOscillator(),E=t.createGain();p.type="triangle",p.frequency.setValueAtTime(c*n,o+d*.045),E.gain.setValueAtTime(.11,o+d*.045),E.gain.exponentialRampToValueAtTime(.001,o+d*.045+.22),p.connect(E),E.connect(t.destination),p.start(o+d*.045),p.stop(o+d*.045+.23)})}playDecreeWarp(){const i=this.ensureContext();if(!i)return;const t=i.currentTime,o=i.createOscillator(),n=i.createGain();o.type="sawtooth",o.frequency.setValueAtTime(440,t),o.frequency.linearRampToValueAtTime(185,t+.16),o.frequency.linearRampToValueAtTime(370,t+.34),n.gain.setValueAtTime(.09,t),n.gain.exponentialRampToValueAtTime(.001,t+.36),o.connect(n),n.connect(i.destination),o.start(t),o.stop(t+.36)}playAlarmBuzzer(){const i=this.ensureContext();if(!i)return;const t=i.currentTime,o=i.createOscillator(),n=i.createGain();o.type="sawtooth",o.frequency.setValueAtTime(155,t),o.frequency.linearRampToValueAtTime(110,t+.25),n.gain.setValueAtTime(.12,t),n.gain.exponentialRampToValueAtTime(.001,t+.26),o.connect(n),n.connect(i.destination),o.start(t),o.stop(t+.26)}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const a={GAME_ID:"11-metaphysical-deli",STORAGE_KEY:"argon_game11_metaphysical_deli_save_v1",DEFAULT_SEED:20261107,FIXED_STEP_MS:50,CHAMBER_WIDTH:840,CHAMBER_HEIGHT:520,VORTEX_X:420,VORTEX_Y:435,VORTEX_RADIUS:78,PENDULUM_PIVOT_X:420,PENDULUM_PIVOT_Y:85,PENDULUM_LENGTH:215,PENDULUM_BLADE_RADIUS:36,HAND_SPEED_PX_PER_SEC:460,HAND_GRAB_RADIUS:72,HAND_FLING_SPEED:540,INITIAL_SANITY:100,MAX_SANITY:100,INITIAL_EGO_COINS:45,PATRONS_FOR_VICTORY:12,MAX_DIFFICULTY_LEVEL:35,PATRONS_PER_FEVER_TIER:2,MAX_FLOATING_INGREDIENTS:11,BASE_SPAWN_INTERVAL_MS:2200,MIN_SPAWN_INTERVAL_MS:680,NUM_BOOTHS:3,BASE_PATRON_PATIENCE_MS:38e3,MIN_PATRON_PATIENCE_MS:14e3,PATRON_IMPATIENCE_SANITY_PENALTY:16,SERVE_SANITY_RESTORE:12,DECREE_DURATION_MS:24e3,PARADOX_MAX_CHARGE:100,PARADOX_FREEZE_DURATION_MS:4500,COST_SUMMON_ANOMALY:15,COST_OVERCLOCK_PENDULUM:25,COST_LIQUID_FRIDAY:30,COST_INVERT_DECREE:40};function V(e){const i=Math.max(1,Math.min(a.MAX_DIFFICULTY_LEVEL,Math.floor(e))),t=(i-1)/(a.MAX_DIFFICULTY_LEVEL-1),o=Number((1+t*1.65).toFixed(4)),n=Math.round(a.BASE_SPAWN_INTERVAL_MS-t*(a.BASE_SPAWN_INTERVAL_MS-a.MIN_SPAWN_INTERVAL_MS)),r=Math.round(a.BASE_PATRON_PATIENCE_MS-t*(a.BASE_PATRON_PATIENCE_MS-a.MIN_PATRON_PATIENCE_MS)),c=Number((1.45+t*2.35).toFixed(4)),d=Number((.08+t*.27).toFixed(4));return{effectiveLevel:i,speedMultiplier:o,spawnIntervalMs:n,patronPatienceMs:r,pendulumSpeedRadPerSec:c,hazardChance:d}}const H=1;function ee(){return{highScore:0,maxFeverTier:1,maxComboReached:1,totalPatronsFedLifetime:0,hybridsDiscovered:[],gamesPlayed:0,victoriesUnlocked:0}}function P(e){return{...e,vortexFlavors:{...e.vortexFlavors},lastBoiledSymbols:[...e.lastBoiledSymbols],ingredients:e.ingredients.map(i=>({...i,flavors:{...i.flavors}})),booths:e.booths.map(i=>({...i})),discoveredHybrids:[...e.discoveredHybrids],events:[]}}function ie(e,i){const t={schemaVersion:H,gameId:a.GAME_ID,updatedAtIso:new Date().toISOString(),career:{...e,hybridsDiscovered:[...e.hybridsDiscovered]},activeRun:i?P(i):null};return JSON.stringify(t)}function X(e){try{const i=JSON.parse(e);if(!i||i.schemaVersion!==H||i.gameId!==a.GAME_ID||!i.career)return null;const t={highScore:Math.max(0,Number(i.career.highScore)||0),maxFeverTier:Math.max(1,Number(i.career.maxFeverTier)||1),maxComboReached:Math.max(1,Number(i.career.maxComboReached)||1),totalPatronsFedLifetime:Math.max(0,Number(i.career.totalPatronsFedLifetime)||0),hybridsDiscovered:Array.isArray(i.career.hybridsDiscovered)?i.career.hybridsDiscovered.filter(n=>typeof n=="string"):[],gamesPlayed:Math.max(0,Number(i.career.gamesPlayed)||0),victoriesUnlocked:Math.max(0,Number(i.career.victoriesUnlocked)||0)};let o=null;return i.activeRun&&typeof i.activeRun.seed=="number"&&Array.isArray(i.activeRun.ingredients)&&Array.isArray(i.activeRun.booths)&&(o=P(i.activeRun)),{schemaVersion:H,gameId:a.GAME_ID,updatedAtIso:typeof i.updatedAtIso=="string"?i.updatedAtIso:new Date().toISOString(),career:t,activeRun:o}}catch{return null}}function oe(e=a.STORAGE_KEY){try{if(typeof window<"u"&&window.localStorage){const i=window.localStorage.getItem(e);if(i){const t=X(i);if(t)return t}}}catch{}return{schemaVersion:H,gameId:a.GAME_ID,updatedAtIso:new Date().toISOString(),career:ee(),activeRun:null}}function L(e,i,t=a.STORAGE_KEY){const o=new Set(e.hybridsDiscovered);if(i)for(const c of i.discoveredHybrids)o.add(c);const n={highScore:Math.max(e.highScore,i?.score??0),maxFeverTier:Math.max(e.maxFeverTier,i?.feverTier??1),maxComboReached:Math.max(e.maxComboReached,i?.maxComboReached??1),totalPatronsFedLifetime:Math.max(e.totalPatronsFedLifetime,i?.patronsFed??0),hybridsDiscovered:Array.from(o),gamesPlayed:e.gamesPlayed,victoriesUnlocked:Math.max(e.victoriesUnlocked,i?.victoryUnlocked?1:0)},r=ie(n,i);try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem(t,r)}catch{}return X(r)}const R=[{id:"baby_tooth",name:"Sentient Baby Tooth",symbol:"🦷",tier:1,color:"#fef08a",glowColor:"#facc15",flavors:{crunch:26,nostalgia:10,static:2,chutzpah:6},radius:23,bounciness:.86,slicedBonusAxis:"crunch",whisper:"I remember chewing 1998!",lore:"Still holds a grudge against the Tooth Fairy for paying only $0.50."},{id:"melting_watch",name:"Salvador's Pocketwatch",symbol:"🕰️",tier:1,color:"#fbbf24",glowColor:"#f59e0b",flavors:{crunch:6,nostalgia:28,static:4,chutzpah:8},radius:25,bounciness:.72,slicedBonusAxis:"nostalgia",whisper:"It is currently 4:73 PM.",lore:"Drips warm Tuesday afternoons onto the linoleum floor."},{id:"jazz_lobster",name:"Bebop Cocktail Lobster",symbol:"🦞",tier:1,color:"#fb7185",glowColor:"#f43f5e",flavors:{crunch:12,nostalgia:4,static:8,chutzpah:28},radius:26,bounciness:.9,slicedBonusAxis:"chutzpah",whisper:"Skibidibop-PINCH!",lore:"Plays unlicensed alto-sax solos in 11/8 time and respects no authority."},{id:"victorian_regret",name:"Bottled Victorian Tear",symbol:"😭",tier:1,color:"#60a5fa",glowColor:"#3b82f6",flavors:{crunch:2,nostalgia:30,static:8,chutzpah:4},radius:23,bounciness:.68,slicedBonusAxis:"nostalgia",whisper:"Alas, my gazebo...",lore:"Distilled from 140-year-old unsent apology letters found in a damp velvet trunk."},{id:"glass_eye",name:"Unblinking Glass Oracle",symbol:"👁️",tier:1,color:"#34d399",glowColor:"#10b981",flavors:{crunch:18,nostalgia:8,static:16,chutzpah:14},radius:24,bounciness:.88,slicedBonusAxis:"static",whisper:"Fix your posture, mortal.",lore:"Stares directly through the fourth wall and judges your cursor trajectory."},{id:"static_toast",name:"Numbers-Station Rye",symbol:"📻",tier:1,color:"#c084fc",glowColor:"#a855f7",flavors:{crunch:14,nostalgia:6,static:28,chutzpah:6},radius:25,bounciness:.78,slicedBonusAxis:"static",whisper:"SEVEN... NINE... MARGARINE.",lore:"Burnt sourdough slice broadcasting encrypted shortwave frequencies at 4625 kHz."},{id:"klein_worm",name:"Klein-Bottle Gummy Worm",symbol:"🪱",tier:1,color:"#f472b6",glowColor:"#ec4899",flavors:{crunch:8,nostalgia:12,static:18,chutzpah:22},radius:24,bounciness:.94,slicedBonusAxis:"chutzpah",whisper:"My inside IS my outside!",lore:"A non-orientable confection that digests the spoon you stir it with."},{id:"tax_auditor",name:"Pocket IRS Apparition",symbol:"💼",tier:1,color:"#94a3b8",glowColor:"#cbd5e1",flavors:{crunch:20,nostalgia:2,static:18,chutzpah:20},radius:25,bounciness:.76,slicedBonusAxis:"crunch",whisper:"Is that ladle deductible?",lore:"Demands receipts for your dreams; boil immediately to convert into Deductible Bisque."}],G=[{id:"deja_vu_brittle",name:"Déjà Vu Peanut Brittle",symbol:"🍬",tier:2,color:"#fde047",glowColor:"#eab308",flavors:{crunch:48,nostalgia:46,static:12,chutzpah:20},radius:29,bounciness:.85,slicedBonusAxis:"crunch",whisper:"Didn’t you just eat me tomorrow?",lore:"Fused from a Baby Tooth and a Melting Watch. Crunches 3 seconds before your teeth touch it."},{id:"subpoena_thermidor",name:"Subpoena Lobster Thermidor",symbol:"⚖️",tier:2,color:"#fb7185",glowColor:"#e11d48",flavors:{crunch:34,nostalgia:14,static:26,chutzpah:54},radius:30,bounciness:.88,slicedBonusAxis:"chutzpah",whisper:"YOU ARE SERVED (WITH BUTTER)!",lore:"Bebop Lobster + IRS Apparition. Legally obligates the customer’s tastebuds to applaud."},{id:"panopticon_bruschetta",name:"Panopticon Bruschetta",symbol:"👁️‍🗨️",tier:2,color:"#2dd4bf",glowColor:"#14b8a6",flavors:{crunch:36,nostalgia:20,static:52,chutzpah:28},radius:29,bounciness:.84,slicedBonusAxis:"static",whisper:"THE GARLIC SEES ALL.",lore:"Glass Oracle + Numbers-Station Rye. Watches the customer chew from six angles."},{id:"grandmas_dialtone",name:"Grandma's Rotary Dialtone",symbol:"☎️",tier:2,color:"#818cf8",glowColor:"#6366f1",flavors:{crunch:18,nostalgia:56,static:44,chutzpah:14},radius:29,bounciness:.8,slicedBonusAxis:"nostalgia",whisper:"Bzzzzzt... eat your sweater...",lore:"Victorian Tear + Numbers-Station Rye. Tastes like wood paneling and Sunday evening dread."},{id:"chronos_calamari",name:"Mobius Strip Calamari",symbol:"🌀",tier:2,color:"#e879f9",glowColor:"#d946ef",flavors:{crunch:22,nostalgia:46,static:30,chutzpah:40},radius:30,bounciness:.92,slicedBonusAxis:"nostalgia",whisper:"Chew clockwise to rewind!",lore:"Melting Watch + Klein Worm. Only has one side, so the marinara sauce is infinite."},{id:"velvet_chatterbox",name:"Scat-Singing Dentures",symbol:"👄",tier:2,color:"#f43f5e",glowColor:"#be123c",flavors:{crunch:46,nostalgia:18,static:16,chutzpah:50},radius:29,bounciness:.9,slicedBonusAxis:"chutzpah",whisper:"Zebedee-bop-CHOMP!",lore:"Baby Tooth + Bebop Lobster. Harmonizes with the customer’s uvula on the way down."},{id:"omega_monolith_meatball",name:"5th-Dimensional Monolith Meatball",symbol:"🌌",tier:3,color:"#38bdf8",glowColor:"#f472b6",flavors:{crunch:65,nostalgia:65,static:65,chutzpah:65},radius:34,bounciness:.92,slicedBonusAxis:"chutzpah",whisper:"MY FULL OF STARS (AND OREGANO).",lore:"Tier-3 Transcendental Singularity. Contains every soup ever spilled across all parallel timelines."}],z=[{id:"red_tape_stamp",name:"Bureaucratic Red-Tape Stamp",symbol:"🚫",tier:1,color:"#ef4444",glowColor:"#dc2626",flavors:{crunch:-12,nostalgia:-12,static:10,chutzpah:-15},radius:22,bounciness:.92,slicedBonusAxis:"chutzpah",whisper:"FORM 27B/6 MISSING!",lore:"Fired by the Grand Comptroller! Slice or fling away before it falls into the Broth Vortex!",isHazard:!0}],x=new Map([...R,...G,...z].map(e=>[e.id,e])),$=[{id:"recipe_deja_vu",ingredientA:"baby_tooth",ingredientB:"melting_watch",resultId:"deja_vu_brittle",discoveryHeadline:"SYNTHESIZED: Déjà Vu Peanut Brittle (Tooth + Pocketwatch)!"},{id:"recipe_subpoena",ingredientA:"jazz_lobster",ingredientB:"tax_auditor",resultId:"subpoena_thermidor",discoveryHeadline:"SYNTHESIZED: Subpoena Lobster Thermidor (Lobster + Auditor)!"},{id:"recipe_panopticon",ingredientA:"glass_eye",ingredientB:"static_toast",resultId:"panopticon_bruschetta",discoveryHeadline:"SYNTHESIZED: Panopticon Bruschetta (Glass Eye + Static Rye)!"},{id:"recipe_dialtone",ingredientA:"victorian_regret",ingredientB:"static_toast",resultId:"grandmas_dialtone",discoveryHeadline:"SYNTHESIZED: Grandma's Rotary Dialtone (Tear + Static Rye)!"},{id:"recipe_calamari",ingredientA:"melting_watch",ingredientB:"klein_worm",resultId:"chronos_calamari",discoveryHeadline:"SYNTHESIZED: Mobius Strip Calamari (Watch + Klein Worm)!"},{id:"recipe_chatterbox",ingredientA:"baby_tooth",ingredientB:"jazz_lobster",resultId:"velvet_chatterbox",discoveryHeadline:"SYNTHESIZED: Scat-Singing Dentures (Tooth + Bebop Lobster)!"}];function te(e,i){if(e.tier>=2||i.tier>=2)return{template:x.get("omega_monolith_meatball"),headline:`COSMIC SINGULARITY: ${e.name} + ${i.name} → 5TH-DIMENSIONAL MONOLITH MEATBALL!`};for(const n of $){const r=n.ingredientA===e.id&&n.ingredientB===i.id,c=n.ingredientA===i.id&&n.ingredientB===e.id;if(r||c)return{template:x.get(n.resultId),headline:n.discoveryHeadline}}const t={crunch:e.flavors.crunch+i.flavors.crunch,nostalgia:e.flavors.nostalgia+i.flavors.nostalgia,static:e.flavors.static+i.flavors.static,chutzpah:e.flavors.chutzpah+i.flavors.chutzpah};if(t.crunch>=t.nostalgia&&t.crunch>=t.static){const n=x.get("velvet_chatterbox");return{template:n,headline:`ALCHEMY SPLICE: ${e.symbol}+${i.symbol} → ${n.name}!`}}if(t.nostalgia>=t.static&&t.nostalgia>=t.chutzpah){const n=x.get("chronos_calamari");return{template:n,headline:`ALCHEMY SPLICE: ${e.symbol}+${i.symbol} → ${n.name}!`}}if(t.static>=t.chutzpah){const n=x.get("panopticon_bruschetta");return{template:n,headline:`ALCHEMY SPLICE: ${e.symbol}+${i.symbol} → ${n.name}!`}}const o=x.get("subpoena_thermidor");return{template:o,headline:`ALCHEMY SPLICE: ${e.symbol}+${i.symbol} → ${o.name}!`}}const D=[{id:"landlord_tuesday",name:"The Seven-Eyed Landlord of Tuesday",title:" Duke of Expired Leases",avatarEmoji:"👁️‍🗨️",eyeCount:7,auraColor:"#facc15",primaryAxis:"crunch",secondaryAxis:"nostalgia",minTotalFlavor:38,baseRewardCoins:24,baseScore:320,greetingQuotes:["Rent on your pineal gland is due! Serve me a broth with violent CRUNCH and 1990s NOSTALGIA.","I require a soup that sounds like a xylophone falling down a carpeted staircase."],satisfiedQuotes:["EXQUISITE! My fourth eyelid is weeping with osteo-acoustic joy!","Your lease on consciousness is renewed through Thursday!"],impatientQuotes:["My seven pupils are dilating with impatience, chef!","Where is my crunchy temporal bisque?!"]},{id:"baroness_static",name:"Baroness Von Static",title:"Duchess of Channel 3 Snow",avatarEmoji:"📺",eyeCount:3,auraColor:"#c084fc",primaryAxis:"static",secondaryAxis:"crunch",minTotalFlavor:40,baseRewardCoins:26,baseScore:350,greetingQuotes:["Tune my soup to 4625 kHz! I crave high-voltage STATIC and toasted enamel CRUNCH.","Make it taste like touching a CRT television screen in a wool sweater!"],satisfiedQuotes:["BZZZZT—MAGNIFICENT! My antennae are vibrating in Technicolor!","Pure white noise perfection! Keep the change in kilohertz!"],impatientQuotes:["I am losing vertical hold! Feed me STATIC before I degauss your kitchen!"]},{id:"trenchcoat_bees",name:"4,000 Bees in a Damp Trenchcoat",title:"Definitely One Normal Human",avatarEmoji:"🐝",eyeCount:5,auraColor:"#fb7185",primaryAxis:"chutzpah",secondaryAxis:"static",minTotalFlavor:42,baseRewardCoins:28,baseScore:380,greetingQuotes:["HELLO FELLOW VERTEBRATE. WE REQUIRE MAXIMUM CHUTZPAH AND BUZZING STATIC.","ONE BOWL OF AUDACITY, PLEASE. DO NOT INQUIRE WHY OUR LAPELS ARE HUMMING."],satisfiedQuotes:["THE HIVE APPROVES THIS UMAMI! OUR QUEEN SENDS HER REGARDS!","DELICIOUS! WE SHALL NOT STING YOUR SUBCONSCIOUS TODAY!"],impatientQuotes:["OUR TRENCHCOAT IS VIBRATING AT DANGEROUS DECIBELS, CHEF!"]},{id:"astral_gym_teacher",name:"Coach Henderson's Astral Projection",title:"Spectral Dodgeball Coordinator",avatarEmoji:"🎽",eyeCount:2,auraColor:"#38bdf8",primaryAxis:"nostalgia",secondaryAxis:"chutzpah",minTotalFlavor:40,baseRewardCoins:25,baseScore:340,greetingQuotes:["DROP AND GIVE ME 40 MILLILITERS OF PURE NOSTALGIA WITH 110% CHUTZPAH!","I want a soup that smells like a freshly waxed gymnasium floor in 1996!"],satisfiedQuotes:["THAT IS VARSITY-GRADE BROTH, KID! TAKE A VICTORY LAP AROUND THE KLEIN BOTTLE!"],impatientQuotes:["TWEET! DELAY OF SOUP PENALTY! HUSTLE UP WITH THAT LADLE!"]},{id:"delayed_train",name:"The Concept of the 5:15 Express",title:"Non-Linear Commuter Entity",avatarEmoji:"🚆",eyeCount:4,auraColor:"#34d399",primaryAxis:"nostalgia",secondaryAxis:"static",minTotalFlavor:44,baseRewardCoins:30,baseScore:410,greetingQuotes:["We apologize for the existential delay. Please ladle melted time (NOSTALGIA) and rail STATIC.","Next stop: Your Frontal Lobe. Stand clear of the closing soup bowl."],satisfiedQuotes:["CHOO-CHOO OF ENLIGHTENMENT ACHIEVED! We are now arriving 12 years early!"],impatientQuotes:["SIGNAL FAILURE AT BOOTH #2! OUR PASSENGERS ARE BECOMING ABSTRACT!"]},{id:"grand_comptroller",name:"THE GRAND COMPTROLLER OF THE SUBCONSCIOUS",title:"Supreme Boss Auditor of Unlicensed Dreams",avatarEmoji:"🎩",eyeCount:6,auraColor:"#f43f5e",primaryAxis:"chutzpah",secondaryAxis:"crunch",minTotalFlavor:60,baseRewardCoins:55,baseScore:850,isBossAuditor:!0,greetingQuotes:["AUDIT IN PROGRESS! Your broth lacks Form 88-Paradox! Feed me colossal CHUTZPAH & CRUNCH or be liquidated!","I AM GARNISHING YOUR GRAVITY! Slice my Red-Tape Stamps if you dare, mortal cook!"],satisfiedQuotes:["BY THE GREAT GOLDEN MONOCLE... THIS SOUP IS COMPLETELY TAX-EXEMPT! AUDIT PASSED!"],impatientQuotes:["PENALTY NOTICE ISSUED! YOUR EGO SANITY IS SUBJECT TO IMMEDIATE FORECLOSURE!"]}],U=[{id:"EUCLIDEAN_LULLABY",title:"DECREE #01: NOMINAL SUBCONSCIOUS GRAVITY",ministryCode:"ONT-200-OK",description:"Ingredients drift downward at a polite Victorian pace. Enjoy it while it lasts.",gravityX:0,gravityY:62,bounceChutzpahBonus:1,pendulumSpeedMult:1,ingredientsFleeHand:!1,bannerColor:"#38bdf8"},{id:"LATERAL_PINBALL",title:"DECREE #02: GRAVITY IS NOW SIDEWAYS",ministryCode:"ONT-90-DEG",description:'The Ministry rotated "Down" by 90 degrees! Ingredients fall toward the East Wall like pinballs!',gravityX:88,gravityY:14,bounceChutzpahBonus:3,pendulumSpeedMult:1.15,ingredientsFleeHand:!1,bannerColor:"#f59e0b"},{id:"CEILING_DRIP",title:"DECREE #03: REVERSE AUSTRALIAN CEILING RAIN",ministryCode:"ONT-UP-DOWN",description:"Gravity is inverted! Ingredients float toward the ceiling booths unless flung downward into the Vat!",gravityX:0,gravityY:-74,bounceChutzpahBonus:2,pendulumSpeedMult:1.1,ingredientsFleeHand:!1,bannerColor:"#a855f7"},{id:"MANDATORY_JAZZ_TAX",title:"DECREE #04: MANDATORY BEBOP RICOCHET ACT",ministryCode:"ONT-52-ST",description:"Every wall bounce plays an unlicensed jazz chord and injects +6 Chutzpah into the ingredient!",gravityX:-28,gravityY:58,bounceChutzpahBonus:6,pendulumSpeedMult:1.25,ingredientsFleeHand:!1,bannerColor:"#fb7185"},{id:"PARANOID_PANTRY",title:"DECREE #05: SENTIENT INGREDIENT UNION STRIKE",ministryCode:"ONT-404-FLEE",description:"Ingredients have realized they are soup! They actively dodge The Third Hand unless Time-Frozen [Q]!",gravityX:0,gravityY:50,bounceChutzpahBonus:4,pendulumSpeedMult:1.2,ingredientsFleeHand:!0,bannerColor:"#10b981"},{id:"HYPER_PENDULUM",title:"DECREE #06: GUILLOTINE OVERTIME PROTOCOL",ministryCode:"ONT-SLICE-2X",description:"The Non-Euclidean Laser Pendulum swings at 2.1x hyper-speed, bisecting everything in its arc!",gravityX:18,gravityY:66,bounceChutzpahBonus:3,pendulumSpeedMult:2.1,ingredientsFleeHand:!1,bannerColor:"#ef4444"}],W=["REMINDER: Do not make eye contact with the Glass Oracle for more than 4 consecutive seconds.","LOST & FOUND: Someone left a 1997 childhood memory near Booth #2. It is dripping.","HEALTH CODE NOTICE: All Klein-Bottle worms must be washed on both their inside-outside and outside-inside.","WEATHER REPORT: 80% chance of heavy Victorian nostalgia followed by scattered saxophone solos.","MINISTRY BULLETIN: Tuesday has been temporarily rescheduled to late Wednesday afternoon.","KITCHEN TIP: Collide two ingredients at high velocity or press [E] to splice Forbidden Hybrid Delicacies!","AUDITOR WARNING: If a Pocket IRS Apparition touches your Third Hand, boil him into Deductible Bisque!"];function B(e){let i=e>>>0||322420463;const t=()=>{i=i+1831565813>>>0;let r=Math.imul(i^i>>>15,1|i);return r=r+Math.imul(r^r>>>7,61|r)^r,((r^r>>>14)>>>0)/4294967296},o=(r,c)=>c<=r?r:r+Math.floor(t()*(c-r));return{getState:()=>i>>>0,setState:r=>{i=r>>>0||322420463},nextFloat:t,nextInt:o,pick:r=>{if(r.length===0)throw new Error("Cannot pick from an empty array");return r[o(0,r.length)]}}}function O(e){return Math.max(0,e.crunch)+Math.max(0,e.nostalgia)+Math.max(0,e.static)+Math.max(0,e.chutzpah)}function w(e){return U.find(i=>i.id===e.activeDecreeId)??U[0]}function q(e){const i=a.PENDULUM_PIVOT_X+Math.sin(e)*a.PENDULUM_LENGTH,t=a.PENDULUM_PIVOT_Y+Math.cos(e)*a.PENDULUM_LENGTH;return{x:Number(i.toFixed(2)),y:Number(t.toFixed(2))}}function _(e,i,t,o,n,r,c=!1){return{uid:e,templateId:i.id,name:i.name,symbol:i.symbol,tier:i.tier,color:i.color,glowColor:i.glowColor,x:Number(t.toFixed(2)),y:Number(o.toFixed(2)),vx:Number(n.toFixed(2)),vy:Number(r.toFixed(2)),radius:i.radius,bounciness:i.bounciness,flavors:{...i.flavors},slicedBonusAxis:i.slicedBonusAxis,isSlicedHalf:!1,isGilded:c,isHazard:!!i.isHazard,bounceCount:0,whisper:i.whisper,whisperTimerMs:2800,ageMs:0}}function j(e,i,t,o=!1){const n=V(i),r=D.filter(l=>!l.isBossAuditor),c=D.find(l=>l.isBossAuditor),d=o?c:t.pick(r),p=1+Math.min(1.2,(i-1)*.08),E=Math.round(d.minTotalFlavor*p),m=d.isBossAuditor?Math.round(n.patronPatienceMs*1.15):n.patronPatienceMs;return{boothIndex:e,archetypeId:d.id,name:d.name,title:d.title,avatarEmoji:d.avatarEmoji,eyeCount:d.eyeCount,auraColor:d.auraColor,primaryAxis:d.primaryAxis,secondaryAxis:d.secondaryAxis,minTotalFlavor:E,baseRewardCoins:d.baseRewardCoins,baseScore:d.baseScore,patienceMs:m,maxPatienceMs:m,activeQuote:t.pick(d.greetingQuotes),isBossAuditor:!!d.isBossAuditor,servedCountInBooth:0}}function Y(e=a.DEFAULT_SEED){const i=e>>>0||a.DEFAULT_SEED,t=B(i),o=-.55,n=q(o),r=[];for(let m=0;m<a.NUM_BOOTHS;m++)r.push(j(m,1,t,!1));const c=[];let d=1;const p=[{x:210,y:210,vx:38,vy:-18},{x:330,y:250,vx:-32,vy:22},{x:520,y:230,vx:28,vy:15},{x:640,y:205,vx:-42,vy:-12}];for(let m=0;m<p.length;m++){const l=R[m%R.length],u=p[m];c.push(_(d++,l,u.x,u.y,u.vx,u.vy,!1))}const E=t.pick(W);return{seed:i,rngState:t.getState(),status:"PLAYING",elapsedMs:0,score:0,sanity:a.INITIAL_SANITY,maxSanity:a.MAX_SANITY,egoCoins:a.INITIAL_EGO_COINS,feverTier:1,patronsFed:0,patronsStormedOut:0,comboCount:0,comboMultiplier:1,maxComboReached:1,totalSlices:0,totalSplices:0,victoryUnlocked:!1,gameOverReason:null,handX:a.CHAMBER_WIDTH/2,handY:280,heldIngredientUid:null,lastHandActionText:"THE THIRD HAND AWAITS YOUR COMMAND",pendulumAngle:o,pendulumBladeX:n.x,pendulumBladeY:n.y,overclockPendulumMs:0,activeDecreeId:"EUCLIDEAN_LULLABY",decreeTimerMs:a.DECREE_DURATION_MS,realityDecreesSurvived:0,paradoxCharge:50,paradoxFreezeMs:0,goldenFeverMs:0,vortexFlavors:{crunch:12,nostalgia:12,static:8,chutzpah:10},vortexIngredientsCount:1,lastBoiledSymbols:["🦷"],nextEntityUid:d,spawnTimerMs:1400,bossHazardTimerMs:4500,ingredients:c,booths:r,discoveredHybrids:[],activeTickerText:E,tickerTimerMs:9e3,events:[]}}function k(e,i){const t=e.ingredients.findIndex(c=>c.uid===i.uid);if(t===-1)return;if(e.heldIngredientUid===i.uid&&(e.heldIngredientUid=null),e.ingredients.splice(t,1),e.totalSlices+=1,i.isHazard){e.egoCoins+=18,e.score+=180*e.comboMultiplier,e.paradoxCharge=Math.min(a.PARADOX_MAX_CHARGE,e.paradoxCharge+25),e.lastHandActionText="SHREDDED BUREAUCRATIC RED-TAPE STAMP (+18₡)!",e.events.push({type:"HAZARD_DESTROYED",message:"RED-TAPE SHREDDED! +18₡ & +25 PARADOX!",x:i.x,y:i.y,color:"#4ade80",amount:18});return}const o=i.isGilded||e.overclockPendulumMs>0,n=i.slicedBonusAxis,r=c=>{const d={crunch:Math.round(i.flavors.crunch*.68),nostalgia:Math.round(i.flavors.nostalgia*.68),static:Math.round(i.flavors.static*.68),chutzpah:Math.round(i.flavors.chutzpah*.68)};return d[n]+=o?22:14,{uid:e.nextEntityUid++,templateId:i.templateId,name:`½ ${i.name.replace(/^½\s+/,"")}`,symbol:i.symbol,tier:i.tier,color:o?"#fde047":i.color,glowColor:o?"#f59e0b":i.glowColor,x:Number((i.x+c*18).toFixed(2)),y:Number((i.y+6).toFixed(2)),vx:Number((i.vx*.5+c*135).toFixed(2)),vy:Number((i.vy-65).toFixed(2)),radius:Math.max(16,Math.round(i.radius*.82)),bounciness:i.bounciness,flavors:d,slicedBonusAxis:i.slicedBonusAxis,isSlicedHalf:!0,isGilded:o,isHazard:!1,bounceCount:i.bounceCount,whisper:o?"GILDED BISECTION!":`SLICED +${n.toUpperCase()}!`,whisperTimerMs:2400,ageMs:0}};e.ingredients.length<a.MAX_FLOATING_INGREDIENTS+3?e.ingredients.push(r(-1),r(1)):e.ingredients.push(r(1)),e.score+=(o?95:55)*e.comboMultiplier,e.paradoxCharge=Math.min(a.PARADOX_MAX_CHARGE,e.paradoxCharge+12),e.lastHandActionText=`BISECTED ${i.name.toUpperCase()} INTO TWIN SUB-CONCEPTS!`,e.events.push({type:"INGREDIENT_SLICED",message:`SLICED ${i.symbol} (+${n.toUpperCase()})!`,x:i.x,y:i.y,color:o?"#fde047":i.glowColor})}function K(e,i,t){if(i.uid===t.uid||i.isHazard||t.isHazard)return null;const o=x.get(i.templateId)??R[0],n=x.get(t.templateId)??R[1],{template:r,headline:c}=te(o,n),d=e.ingredients.filter(y=>y.uid!==i.uid&&y.uid!==t.uid);e.ingredients=d,(e.heldIngredientUid===i.uid||e.heldIngredientUid===t.uid)&&(e.heldIngredientUid=null);const p=(i.x+t.x)*.5,E=(i.y+t.y)*.5,m=i.isGilded||t.isGilded||e.overclockPendulumMs>0,l=_(e.nextEntityUid++,r,p,E,(i.vx+t.vx)*.35,-85,m);l.flavors.crunch=Math.max(l.flavors.crunch,Math.round((i.flavors.crunch+t.flavors.crunch)*.85)),l.flavors.nostalgia=Math.max(l.flavors.nostalgia,Math.round((i.flavors.nostalgia+t.flavors.nostalgia)*.85)),l.flavors.static=Math.max(l.flavors.static,Math.round((i.flavors.static+t.flavors.static)*.85)),l.flavors.chutzpah=Math.max(l.flavors.chutzpah,Math.round((i.flavors.chutzpah+t.flavors.chutzpah)*.85)),e.ingredients.push(l),e.totalSplices+=1,e.discoveredHybrids.includes(r.id)||e.discoveredHybrids.push(r.id);const u=(r.tier===3?420:210)*e.comboMultiplier;return e.score+=u,e.egoCoins+=r.tier===3?16:8,e.paradoxCharge=Math.min(a.PARADOX_MAX_CHARGE,e.paradoxCharge+22),e.lastHandActionText=c,e.events.push({type:"HYBRID_SYNTHESIZED",message:c,x:p,y:E,color:r.glowColor,amount:u}),l}function Q(e,i){const t=e.ingredients.findIndex(r=>r.uid===i.uid);if(t!==-1&&e.ingredients.splice(t,1),e.heldIngredientUid===i.uid&&(e.heldIngredientUid=null),i.isHazard){e.sanity=Math.max(0,e.sanity-12),e.vortexFlavors.crunch=Math.max(0,Math.round(e.vortexFlavors.crunch*.8)),e.vortexFlavors.chutzpah=Math.max(0,Math.round(e.vortexFlavors.chutzpah*.8)),e.comboCount=0,e.comboMultiplier=1,e.lastHandActionText="CONTAMINATION! RED-TAPE STAMP FELL INTO THE PRIMORDIAL BROTH (-12 SANITY)!",e.events.push({type:"HAZARD_CONTAMINATED",message:"RED-TAPE CONTAMINATED THE SOUP! -12 SANITY!",x:a.VORTEX_X,y:a.VORTEX_Y,color:"#ef4444"}),e.sanity<=0&&(e.status="GAME_OVER",e.gameOverReason="Your subconscious kitchen was foreclosed by Bureaucratic Red-Tape contamination.",e.events.push({type:"GAME_OVER",message:e.gameOverReason}));return}const o=(i.isGilded?1.5:1)*(e.goldenFeverMs>0?2.5:1);e.vortexFlavors.crunch+=Math.round(i.flavors.crunch*o),e.vortexFlavors.nostalgia+=Math.round(i.flavors.nostalgia*o),e.vortexFlavors.static+=Math.round(i.flavors.static*o),e.vortexFlavors.chutzpah+=Math.round(i.flavors.chutzpah*o),e.vortexIngredientsCount+=1,e.lastBoiledSymbols.push(i.symbol),e.lastBoiledSymbols.length>7&&e.lastBoiledSymbols.shift();const n=Math.round(O(i.flavors)*2.5*o*e.comboMultiplier);e.score+=n,e.paradoxCharge=Math.min(a.PARADOX_MAX_CHARGE,e.paradoxCharge+14),i.templateId==="tax_auditor"?(e.egoCoins+=12,e.lastHandActionText="BOILED IRS APPARITION INTO TAX-DEDUCTIBLE BISQUE (+12₡)!"):e.lastHandActionText=`BOILED ${i.symbol} ${i.name.toUpperCase()} INTO THE PRIMORDIAL VORTEX!`,e.events.push({type:"BROTH_BOILED",message:`BOILED ${i.symbol} ${i.name}! (+${n} PTS)`,x:a.VORTEX_X,y:a.VORTEX_Y,color:i.glowColor,amount:n})}function C(e,i){const t=O(e),o=e[i.primaryAxis],n=e[i.secondaryAxis],r=Math.round(t+o*.65+n*.35),c=t>=i.minTotalFlavor;return{totalRaw:t,weightedHarmony:r,isSatisfied:c,primaryMatch:o,secondaryMatch:n}}function ne(e,i){if(O(e.vortexFlavors)<15||e.booths.length===0)return e.lastHandActionText="THE VAT IS TOO THIN! BOIL MORE SURREAL INGREDIENTS FIRST!",!1;const o=B(e.rngState);let n;if(typeof i=="number"&&e.booths[i]?n=e.booths[i]:n=[...e.booths].sort((h,f)=>{const b=C(e.vortexFlavors,h),g=C(e.vortexFlavors,f);return b.isSatisfied!==g.isSatisfied?b.isSatisfied?-1:1:g.weightedHarmony-b.weightedHarmony})[0],!n)return!1;const r=C(e.vortexFlavors,n),c=D.find(s=>s.id===n.archetypeId)??D[0],d=Math.min(2.5,Math.max(.45,r.weightedHarmony/Math.max(1,n.minTotalFlavor)));e.comboCount+=1,e.comboMultiplier=Math.min(8,1+Math.floor(e.comboCount/2)),e.maxComboReached=Math.max(e.maxComboReached,e.comboMultiplier);const p=e.goldenFeverMs>0?2.5:1,E=Math.max(6,Math.round(n.baseRewardCoins*d*(e.goldenFeverMs>0?1.5:1))),m=Math.round(n.baseScore*d*e.comboMultiplier*p);e.egoCoins+=E,e.score+=m,e.sanity=Math.min(e.maxSanity,e.sanity+(r.isSatisfied?a.SERVE_SANITY_RESTORE:Math.round(a.SERVE_SANITY_RESTORE*.5))),e.patronsFed+=1;const l=Math.min(a.MAX_DIFFICULTY_LEVEL,1+Math.floor(e.patronsFed/a.PATRONS_PER_FEVER_TIER)),u=l>e.feverTier;e.feverTier=l;const y=o.pick(c.satisfiedQuotes);e.lastHandActionText=`SERVED ${n.name.toUpperCase()}: "${y}" (+${E}₡, +${m} PTS)`,e.events.push({type:"PATRON_SERVED",message:`SERVED BOOTH #${n.boothIndex+1}! +${E}₡ · x${e.comboMultiplier} COMBO!`,x:160+n.boothIndex*260,y:70,color:n.auraColor,amount:m}),!e.victoryUnlocked&&e.patronsFed>=a.PATRONS_FOR_VICTORY&&(e.victoryUnlocked=!0,e.egoCoins+=50,e.score+=1500,e.events.push({type:"VICTORY_UNLOCKED",message:"TRANSCENDENTAL CULINARY LICENSE GRANTED! 12 SURREAL ENTITIES FED! ENDLESS FEVER UNLOCKED!",x:a.CHAMBER_WIDTH/2,y:a.CHAMBER_HEIGHT/2,color:"#fde047",amount:1500})),e.vortexFlavors={crunch:Math.round(e.vortexFlavors.crunch*.15),nostalgia:Math.round(e.vortexFlavors.nostalgia*.15),static:Math.round(e.vortexFlavors.static*.15),chutzpah:Math.round(e.vortexFlavors.chutzpah*.15)},e.vortexIngredientsCount=0,e.lastBoiledSymbols=[];const A=!e.booths.some((s,h)=>h!==n.boothIndex&&s.isBossAuditor)&&(e.feverTier===4||e.feverTier===8||u&&e.feverTier%4===0),T=j(n.boothIndex,e.feverTier,o,A);return T.servedCountInBooth=n.servedCountInBooth+1,e.booths[n.boothIndex]=T,T.isBossAuditor&&e.events.push({type:"BOSS_AUDITOR_ARRIVED",message:"ALERT: THE GRAND COMPTROLLER OF THE SUBCONSCIOUS HAS ENTERED FOR AN ONTOLOGICAL AUDIT!",x:a.CHAMBER_WIDTH/2,y:90,color:"#f43f5e"}),e.rngState=o.getState(),!0}function re(e,i){if(i.type==="TOGGLE_PAUSE"){e.status==="PLAYING"?e.status="PAUSED":e.status==="PAUSED"&&(e.status="PLAYING");return}if(e.status==="PLAYING")switch(i.type){case"SET_HAND_POS":{if(e.handX=Math.max(40,Math.min(a.CHAMBER_WIDTH-40,i.x)),e.handY=Math.max(105,Math.min(a.CHAMBER_HEIGHT-36,i.y)),e.heldIngredientUid!==null){const t=e.ingredients.find(o=>o.uid===e.heldIngredientUid);t&&(t.x=e.handX,t.y=e.handY,t.vx=0,t.vy=0)}break}case"NUDGE_HAND":{if(e.handX=Math.max(40,Math.min(a.CHAMBER_WIDTH-40,e.handX+i.dx)),e.handY=Math.max(105,Math.min(a.CHAMBER_HEIGHT-36,e.handY+i.dy)),e.heldIngredientUid!==null){const t=e.ingredients.find(o=>o.uid===e.heldIngredientUid);t&&(t.x=e.handX,t.y=e.handY,t.vx=0,t.vy=0)}break}case"GRAB_OR_FLING":{if(e.heldIngredientUid!==null){const n=e.ingredients.find(r=>r.uid===e.heldIngredientUid);if(e.heldIngredientUid=null,n){const r=i.targetX??a.VORTEX_X,c=i.targetY??a.VORTEX_Y,d=r-n.x,p=c-n.y,E=Math.hypot(d,p)||1;n.vx=Number((d/E*a.HAND_FLING_SPEED).toFixed(2)),n.vy=Number((p/E*a.HAND_FLING_SPEED).toFixed(2)),e.lastHandActionText=`FLUNG ${n.symbol} ${n.name.toUpperCase()} AT MACH-SOUP!`,e.events.push({type:"INGREDIENT_FLUNG",message:`FLUNG ${n.symbol}!`,x:n.x,y:n.y,color:n.glowColor})}return}if(e.ingredients.length===0)return;let t=e.ingredients[0],o=Math.hypot(t.x-e.handX,t.y-e.handY);for(const n of e.ingredients){const r=Math.hypot(n.x-e.handX,n.y-e.handY);r<o&&(o=r,t=n)}e.heldIngredientUid=t.uid,t.x=e.handX,t.y=e.handY,t.vx=0,t.vy=0,e.lastHandActionText=`GRABBED ${t.symbol} ${t.name.toUpperCase()} ("${t.whisper}")`,e.events.push({type:"INGREDIENT_GRABBED",message:`GRABBED ${t.symbol} ${t.name}`,x:t.x,y:t.y,color:t.glowColor});break}case"DUNK_NEAREST":{let t;if(e.heldIngredientUid!==null&&(t=e.ingredients.find(o=>o.uid===e.heldIngredientUid)),!t){const o=e.ingredients.filter(n=>!n.isHazard);o.length>0&&(o.sort((n,r)=>Math.hypot(n.x-e.handX,n.y-e.handY)-Math.hypot(r.x-e.handX,r.y-e.handY)),t=o[0])}t&&Q(e,t);break}case"SLICE_PULSE":{if(e.ingredients.length===0)return;const o=[...e.ingredients].sort((n,r)=>{const c=Math.min(Math.hypot(n.x-e.handX,n.y-e.handY),Math.hypot(n.x-e.pendulumBladeX,n.y-e.pendulumBladeY)),d=Math.min(Math.hypot(r.x-e.handX,r.y-e.handY),Math.hypot(r.x-e.pendulumBladeX,r.y-e.pendulumBladeY));return c-d}).slice(0,2);for(const n of o)k(e,n);break}case"TRANSMOGRIFY_SPLICE":{const t=e.ingredients.filter(o=>!o.isHazard);if(t.length<2){e.lastHandActionText="NEED AT LEAST 2 INGREDIENTS IN THE CHAMBER TO SPLICE A FORBIDDEN HYBRID!";return}t.sort((o,n)=>Math.hypot(o.x-e.handX,o.y-e.handY)-Math.hypot(n.x-e.handX,n.y-e.handY)),K(e,t[0],t[1]);break}case"SERVE_BOOTH":{ne(e,i.boothIndex);break}case"PARADOX_FREEZE":{if(e.paradoxCharge<35){e.lastHandActionText=`PARADOX CAPACITOR AT ${Math.floor(e.paradoxCharge)}% (NEED 35% TO FREEZE TIME)!`;return}e.paradoxCharge=0,e.paradoxFreezeMs=a.PARADOX_FREEZE_DURATION_MS;for(const t of[...e.ingredients])if(t.isHazard)k(e,t);else{const o=a.VORTEX_X-t.x,n=a.VORTEX_Y-t.y;t.vx=Number((o*.9).toFixed(2)),t.vy=Number((n*.9).toFixed(2))}e.lastHandActionText="PARADOX PULSE ENGAGED! TIME FROZEN & INGREDIENTS MAGNETIZED TO VORTEX!",e.events.push({type:"PARADOX_ACTIVATED",message:"PARADOX TIME-FREEZE ENGAGED!",x:e.handX,y:e.handY,color:"#38bdf8"});break}case"VENDING_ACTION":{const t=B(e.rngState);if(i.item==="SUMMON_ANOMALY"){if(e.egoCoins<a.COST_SUMMON_ANOMALY){e.lastHandActionText=`NEED ${a.COST_SUMMON_ANOMALY}₡ TO SUMMON ANOMALY INGREDIENT!`;return}e.egoCoins-=a.COST_SUMMON_ANOMALY;const o=t.pick(G),n=t.pick(R);e.ingredients.push(_(e.nextEntityUid++,o,280+t.nextInt(-60,60),190,t.nextInt(-50,50),20,!0),_(e.nextEntityUid++,n,540+t.nextInt(-60,60),190,t.nextInt(-50,50),20,!1)),e.lastHandActionText=`VENDING MACHINE DISPENSED GILDED ${o.name.toUpperCase()}!`,e.events.push({type:"VENDING_PURCHASED",message:`DISPENSED GILDED ${o.symbol} ${o.name}!`,x:a.CHAMBER_WIDTH/2,y:190,color:"#fde047"})}else if(i.item==="OVERCLOCK_PENDULUM"){if(e.egoCoins<a.COST_OVERCLOCK_PENDULUM){e.lastHandActionText=`NEED ${a.COST_OVERCLOCK_PENDULUM}₡ TO OVERCLOCK LASER PENDULUM!`;return}e.egoCoins-=a.COST_OVERCLOCK_PENDULUM,e.overclockPendulumMs=12e3,e.lastHandActionText="PENDULUM OVERCLOCKED FOR 12s! ALL SLICED HALVES BECOME GILDED (1.5x)!",e.events.push({type:"VENDING_PURCHASED",message:"GILDED LASER PENDULUM OVERCLOCK (12s)!",x:a.PENDULUM_PIVOT_X,y:a.PENDULUM_PIVOT_Y+80,color:"#f59e0b"})}else if(i.item==="POUR_LIQUID_FRIDAY"){if(e.egoCoins<a.COST_LIQUID_FRIDAY){e.lastHandActionText=`NEED ${a.COST_LIQUID_FRIDAY}₡ TO POUR LIQUID FRIDAY!`;return}e.egoCoins-=a.COST_LIQUID_FRIDAY,e.sanity=Math.min(e.maxSanity,e.sanity+20),e.vortexFlavors.nostalgia+=32,e.vortexFlavors.chutzpah+=22;for(const o of e.booths)o.patienceMs=o.maxPatienceMs;e.lastHandActionText="POURED LIQUID FRIDAY! PATRONS PACIFIED, +20 SANITY, +32 NOSTALGIA & +22 CHUTZPAH!",e.events.push({type:"VENDING_PURCHASED",message:"LIQUID FRIDAY POURED! +20 SANITY & PATRONS CALMED!",x:a.VORTEX_X,y:a.VORTEX_Y,color:"#38bdf8"})}else if(i.item==="INVERT_DECREE"){if(e.egoCoins<a.COST_INVERT_DECREE){e.lastHandActionText=`NEED ${a.COST_INVERT_DECREE}₡ TO INVERT REALITY DECREE!`;return}e.egoCoins-=a.COST_INVERT_DECREE,e.goldenFeverMs=1e4;const o=t.pick(U);e.activeDecreeId=o.id,e.decreeTimerMs=a.DECREE_DURATION_MS,e.lastHandActionText="ONTOLOGICAL INVERTER FIRED! 2.5x GOLDEN FEVER FOR 10 SECONDS!",e.events.push({type:"VENDING_PURCHASED",message:"2.5x GOLDEN FEVER ENGAGED FOR 10s!",x:a.CHAMBER_WIDTH/2,y:a.CHAMBER_HEIGHT/2,color:"#fde047"})}e.rngState=t.getState();break}}}function ae(e,i){if(e.status!=="PLAYING"||i<=0)return;const t=i/1e3;e.elapsedMs+=i;const o=B(e.rngState),n=V(e.feverTier),r=w(e);if(e.overclockPendulumMs>0&&(e.overclockPendulumMs=Math.max(0,e.overclockPendulumMs-i)),e.paradoxFreezeMs>0&&(e.paradoxFreezeMs=Math.max(0,e.paradoxFreezeMs-i)),e.goldenFeverMs>0&&(e.goldenFeverMs=Math.max(0,e.goldenFeverMs-i)),e.tickerTimerMs-=i,e.tickerTimerMs<=0&&(e.tickerTimerMs=8500,e.activeTickerText=o.pick(W)),e.decreeTimerMs-=i,e.decreeTimerMs<=0){e.decreeTimerMs=a.DECREE_DURATION_MS,e.realityDecreesSurvived+=1;const s=U.filter(f=>f.id!==e.activeDecreeId),h=o.pick(s);e.activeDecreeId=h.id,e.lastHandActionText=`${h.title}: ${h.description}`,e.events.push({type:"DECREE_SHIFTED",message:`${h.title} [${h.ministryCode}]`,x:a.CHAMBER_WIDTH/2,y:125,color:h.bannerColor})}const c=r.pendulumSpeedMult*(e.overclockPendulumMs>0?1.45:1),d=n.pendulumSpeedRadPerSec*c,p=e.elapsedMs/1e3*d;e.pendulumAngle=Number((Math.sin(p)*1.08).toFixed(4));const E=q(e.pendulumAngle);if(e.pendulumBladeX=E.x,e.pendulumBladeY=E.y,e.spawnTimerMs-=i,e.spawnTimerMs<=0&&e.ingredients.length<a.MAX_FLOATING_INGREDIENTS){e.spawnTimerMs=n.spawnIntervalMs;const h=o.nextFloat()<.14?o.pick(G.filter(M=>M.tier===2)):o.pick(R),f=o.nextInt(95,a.CHAMBER_WIDTH-95),b=o.nextInt(135,225),g=o.nextInt(-85,86),I=o.nextInt(-30,45),S=_(e.nextEntityUid++,h,f,b,g,I,e.goldenFeverMs>0);e.ingredients.push(S),e.events.push({type:"INGREDIENT_SPAWNED",message:`SPAWNED ${S.symbol} ${S.name}`,x:f,y:b,color:S.glowColor})}const m=e.booths.find(s=>s.isBossAuditor);if(m&&e.paradoxFreezeMs<=0&&(e.bossHazardTimerMs-=i,e.bossHazardTimerMs<=0&&e.ingredients.length<a.MAX_FLOATING_INGREDIENTS+2)){e.bossHazardTimerMs=Math.max(2400,4800-e.feverTier*150);const s=z[0],h=160+m.boothIndex*260,f=a.VORTEX_X-h,b=a.VORTEX_Y-120,g=Math.hypot(f,b)||1,I=135,S=_(e.nextEntityUid++,s,h,130,f/g*I,b/g*I,!1);e.ingredients.push(S)}const l=36,u=a.CHAMBER_WIDTH-36,y=115,v=a.CHAMBER_HEIGHT-34,A=[],T=[];for(const s of e.ingredients){if(s.ageMs+=i,s.whisperTimerMs>0&&(s.whisperTimerMs=Math.max(0,s.whisperTimerMs-i)),e.heldIngredientUid===s.uid){s.x=e.handX,s.y=e.handY,s.vx=0,s.vy=0;continue}if(e.paradoxFreezeMs>0){const b=a.VORTEX_X-s.x,g=a.VORTEX_Y-s.y;s.x=Number((s.x+b*t*1.8).toFixed(2)),s.y=Number((s.y+g*t*1.8).toFixed(2))}else{if(s.vx+=r.gravityX*t,s.vy+=r.gravityY*t,r.ingredientsFleeHand&&!s.isHazard){const N=s.x-e.handX,Z=s.y-e.handY,F=Math.hypot(N,Z);F>1&&F<165&&(s.vx+=N/F*190*t,s.vy+=Z/F*190*t)}const b=a.VORTEX_X-s.x,g=a.VORTEX_Y-s.y,I=Math.hypot(b,g);if(I<a.VORTEX_RADIUS*2.1&&I>1){const N=125*(1-I/(a.VORTEX_RADIUS*2.1));s.vx+=b/I*N*t,s.vy+=g/I*N*t}const S=Math.hypot(s.vx,s.vy);S>620&&(s.vx=s.vx/S*620,s.vy=s.vy/S*620),s.x=Number((s.x+s.vx*t).toFixed(2)),s.y=Number((s.y+s.vy*t).toFixed(2));let M=!1;s.x-s.radius<l?(s.x=l+s.radius,s.vx=Math.abs(s.vx)*s.bounciness,M=!0):s.x+s.radius>u&&(s.x=u-s.radius,s.vx=-Math.abs(s.vx)*s.bounciness,M=!0),s.y-s.radius<y?(s.y=y+s.radius,s.vy=Math.abs(s.vy)*s.bounciness,M=!0):s.y+s.radius>v&&(s.y=v-s.radius,s.vy=-Math.abs(s.vy)*s.bounciness,M=!0),M&&!s.isHazard&&(s.bounceCount+=1,s.flavors.chutzpah+=r.bounceChutzpahBonus)}if(Math.hypot(s.x-e.pendulumBladeX,s.y-e.pendulumBladeY)<=s.radius+a.PENDULUM_BLADE_RADIUS&&(!s.isSlicedHalf||s.isHazard)&&s.ageMs>350){A.push(s);continue}Math.hypot(s.x-a.VORTEX_X,s.y-a.VORTEX_Y)<=a.VORTEX_RADIUS&&T.push(s)}for(const s of A)k(e,s);for(const s of T)if(Q(e,s),e.status==="GAME_OVER"){e.rngState=o.getState();return}e:for(let s=0;s<e.ingredients.length;s++){const h=e.ingredients[s];if(!(h.isHazard||h.ageMs<250))for(let f=s+1;f<e.ingredients.length;f++){const b=e.ingredients[f];if(b.isHazard||b.ageMs<250)continue;const g=Math.hypot(h.x-b.x,h.y-b.y);if(g<=h.radius+b.radius)if(Math.hypot(h.vx-b.vx,h.vy-b.vy)>=185&&h.tier<3&&b.tier<3){K(e,h,b);break e}else{const S=(b.x-h.x)/(g||1),M=(b.y-h.y)/(g||1);h.vx-=S*45,h.vy-=M*45,b.vx+=S*45,b.vy+=M*45}}}if(e.paradoxFreezeMs<=0)for(let s=0;s<e.booths.length;s++){const h=e.booths[s];if(h.patienceMs-=i,h.patienceMs<=h.maxPatienceMs*.35&&h.patienceMs+i>h.maxPatienceMs*.35){const f=D.find(b=>b.id===h.archetypeId)??D[0];h.activeQuote=o.pick(f.impatientQuotes)}if(h.patienceMs<=0){e.patronsStormedOut+=1,e.comboCount=0,e.comboMultiplier=1;const f=h.isBossAuditor?a.PATRON_IMPATIENCE_SANITY_PENALTY+10:a.PATRON_IMPATIENCE_SANITY_PENALTY;if(e.sanity=Math.max(0,e.sanity-f),e.lastHandActionText=`${h.name.toUpperCase()} STORMED OUT IN EXISTENTIAL FURY (-${f} SANITY)!`,e.events.push({type:"PATRON_STORMED_OUT",message:`BOOTH #${s+1} STORMED OUT! -${f} EGO SANITY!`,x:160+s*260,y:70,color:"#ef4444"}),e.sanity<=0){e.status="GAME_OVER",e.gameOverReason=`${h.name} revoked your Deli Ontology Permit after Ego Sanity hit 0.`,e.events.push({type:"GAME_OVER",message:e.gameOverReason}),e.rngState=o.getState();return}e.booths[s]=j(s,e.feverTier,o,!1)}}e.rngState=o.getState()}class se{container;audio;callbacks;debugVisible;canvas;ctx=null;elScore;elSanity;elCoins;elFeverTier;elCombo;elPatronsFed;elDecreeTitle;elDecreeDesc;elDecreeTimer;elVortexTotal;elVortexAxes;elActionBanner;elTickerText;elParadoxBtn;elBoothsContainer;elGrimoireList;elDebugPanel;elOverlayModal;elMuteBtn;particles=[];banners=[];screenShakeMs=0;boundKeyDown;constructor(i,t,o,n=!1){this.container=i,this.audio=t,this.callbacks=o,this.debugVisible=n,this.boundKeyDown=r=>this.handleKeyDown(r),this.buildDOM(),window.addEventListener("keydown",this.boundKeyDown)}isDebugVisible(){return this.debugVisible}setDebugVisible(i){this.debugVisible=i,this.elDebugPanel&&(this.elDebugPanel.hidden=!i)}resetVisuals(){this.particles=[],this.banners=[],this.screenShakeMs=0}buildDOM(){this.container.innerHTML=`
      <style>
        .deli-root {
          width: 100%;
          min-height: 100%;
          background: radial-gradient(circle at 50% 15%, #1e1035 0%, #090514 55%, #04020a 100%);
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0.85rem 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-sizing: border-box;
        }
        .deli-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          background: rgba(19, 11, 38, 0.9);
          border: 1px solid #a855f7;
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.22);
        }
        .deli-brand-title {
          margin: 0;
          font-size: clamp(1.05rem, 0.9rem + 0.7vw, 1.38rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #fde047, #f472b6, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .deli-brand-sub {
          margin: 0.1rem 0 0;
          font-size: 0.76rem;
          color: #cbd5e1;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-stats-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          align-items: center;
        }
        .deli-stat-pill {
          background: rgba(9, 5, 20, 0.85);
          border: 1px solid #4c1d95;
          border-radius: 0.5rem;
          padding: 0.3rem 0.65rem;
          display: flex;
          flex-direction: column;
          min-width: 78px;
        }
        .deli-stat-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #c4b5fd;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-stat-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-decree-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.45rem 0.9rem;
          border-radius: 0.65rem;
          background: linear-gradient(90deg, rgba(88, 28, 135, 0.45), rgba(15, 23, 42, 0.85));
          border-left: 4px solid #f472b6;
          border-right: 1px solid #334155;
          border-top: 1px solid #334155;
          border-bottom: 1px solid #334155;
        }
        .deli-decree-title {
          font-weight: 800;
          font-size: 0.85rem;
          color: #fde047;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-decree-desc {
          font-size: 0.8rem;
          color: #e2e8f0;
        }
        .deli-workspace {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          align-items: start;
        }
        @media (min-width: 1080px) {
          .deli-workspace {
            grid-template-columns: minmax(0, 1.65fr) minmax(330px, 1fr);
          }
        }
        .deli-stage-card {
          position: relative;
          background: #070312;
          border: 2px solid #7e22ce;
          border-radius: 0.85rem;
          overflow: hidden;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.75);
        }
        .deli-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 840 / 520;
          cursor: crosshair;
          touch-action: none;
        }
        .deli-action-deck {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          padding: 0.6rem 0.75rem;
          background: rgba(15, 7, 30, 0.95);
          border-top: 1px solid #4c1d95;
          align-items: center;
          justify-content: space-between;
        }
        .deli-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.42rem 0.75rem;
          min-block-size: 32px;
          min-inline-size: 32px;
          border-radius: 0.45rem;
          border: 1px solid #6d28d9;
          background: #1e1035;
          color: #f8fafc;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .deli-btn:hover {
          background: #3b0764;
          border-color: #f472b6;
          transform: translateY(-1px);
        }
        .deli-btn:focus-visible {
          outline: 3px solid #fde047;
          outline-offset: 2px;
        }
        .deli-btn-hot {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border-color: #f9a8d4;
          color: #ffffff;
        }
        .deli-btn-gold {
          background: linear-gradient(135deg, #eab308, #f97316);
          border-color: #fef08a;
          color: #090514;
          font-weight: 800;
        }
        .deli-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .deli-panel {
          background: rgba(17, 10, 34, 0.92);
          border: 1px solid #4c1d95;
          border-radius: 0.75rem;
          padding: 0.75rem 0.85rem;
        }
        .deli-panel-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.84rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #f472b6;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .deli-booths-grid {
          display: grid;
          gap: 0.5rem;
        }
        .deli-booth-card {
          background: rgba(9, 5, 20, 0.85);
          border: 1px solid #334155;
          border-left: 4px solid var(--booth-color, #38bdf8);
          border-radius: 0.55rem;
          padding: 0.55rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .deli-booth-card.is-ready {
          border-color: #fde047;
          box-shadow: 0 0 14px rgba(253, 224, 71, 0.28);
        }
        .deli-booth-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .deli-booth-quote {
          margin: 0;
          font-size: 0.74rem;
          color: #cbd5e1;
          font-style: italic;
        }
        .deli-booth-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-vending-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
        }
        .deli-ticker-bar {
          background: #05020c;
          border: 1px solid #3b0764;
          border-radius: 0.5rem;
          padding: 0.4rem 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #a7f3d0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .deli-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 3, 15, 0.88);
          backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
          z-index: 20;
        }
        .deli-overlay[hidden] {
          display: none !important;
        }
        dialog.deli-grimoire-dialog {
          max-inline-size: min(680px, 92dvw);
          background: #130b26;
          color: #f8fafc;
          border: 2px solid #f472b6;
          border-radius: 0.85rem;
          padding: 1.2rem;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85);
        }
        dialog.deli-grimoire-dialog::backdrop {
          background: rgba(4, 2, 10, 0.78);
          backdrop-filter: blur(4px);
        }
      </style>

      <div class="deli-root">
        <div class="deli-topbar">
          <div>
            <h2 class="deli-brand-title">👁️🦷 THE METAPHYSICAL DELI AT THE END OF YOUR FOREHEAD</h2>
            <p class="deli-brand-sub">Non-Euclidean Soup Cauldron · Laser Pendulum Bisector · Forbidden Hybrid Alchemy</p>
          </div>

          <div class="deli-stats-strip">
            <div class="deli-stat-pill">
              <span class="deli-stat-label">SCORE</span>
              <span class="deli-stat-val" id="deli-stat-score">0</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">EGO SANITY</span>
              <span class="deli-stat-val" id="deli-stat-sanity">100%</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">EGO COINS</span>
              <span class="deli-stat-val" id="deli-stat-coins">45₡</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">FEVER TIER</span>
              <span class="deli-stat-val" id="deli-stat-fever">TIER 1</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">COMBO</span>
              <span class="deli-stat-val" id="deli-stat-combo">x1</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">FED</span>
              <span class="deli-stat-val" id="deli-stat-fed">0 / 12</span>
            </div>
            <button
              type="button"
              class="deli-btn"
              commandfor="deli-grimoire-modal"
              command="show-modal"
            >
              📖 Forbidden Grimoire
            </button>
            <button type="button" class="deli-btn" id="deli-btn-mute" aria-pressed="false">
              🔊 Synth: ON
            </button>
            <button type="button" class="deli-btn" id="deli-btn-restart">
              ↻ New Fever Dream
            </button>
          </div>
        </div>

        <div class="deli-decree-bar" aria-live="polite">
          <div>
            <div class="deli-decree-title" id="deli-decree-title">DECREE #01: NOMINAL SUBCONSCIOUS GRAVITY</div>
            <div class="deli-decree-desc" id="deli-decree-desc">Ingredients drift downward at a polite Victorian pace.</div>
          </div>
          <div class="deli-stat-val" id="deli-decree-timer">24.0s</div>
        </div>

        <div class="deli-workspace">
          <div class="deli-stage-card">
            <canvas
              id="deli-canvas"
              class="deli-canvas"
              width="${a.CHAMBER_WIDTH}"
              height="${a.CHAMBER_HEIGHT}"
              aria-label="The Metaphysical Deli Interactive Soup Chamber"
            ></canvas>

            <div id="deli-overlay-modal" class="deli-overlay" hidden></div>

            <div class="deli-action-deck">
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button type="button" class="deli-btn deli-btn-hot" id="deli-act-grab">
                  ✋ Grab / Fling [Space]
                </button>
                <button type="button" class="deli-btn deli-btn-gold" id="deli-act-dunk">
                  🍲 Boil in Vortex [D]
                </button>
                <button type="button" class="deli-btn" id="deli-act-slice">
                  ⚡ Laser Bisect [S]
                </button>
                <button type="button" class="deli-btn" id="deli-act-splice">
                  🧬 Splice Hybrid [E]
                </button>
                <button type="button" class="deli-btn" id="deli-act-paradox">
                  ❄️ Paradox Freeze [Q] (50%)
                </button>
              </div>
              <button type="button" class="deli-btn deli-btn-gold" id="deli-act-serve-best">
                🍽️ Ladle Broth to Best Booth [Enter]
              </button>
            </div>
          </div>

          <div class="deli-sidebar">
            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>🍲 Primordial Broth Potency</span>
                <span id="deli-vortex-total" style="color:#fde047;">42 FLAVOR</span>
              </h3>
              <div id="deli-vortex-axes" style="font-family:'JetBrains Mono',monospace; font-size:0.78rem; color:#e2e8f0;"></div>
            </div>

            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>👁️ 3 Subconscious Patron Booths</span>
                <span style="font-size:0.7rem; color:#94a3b8;">[Z / X / C]</span>
              </h3>
              <div id="deli-booths-container" class="deli-booths-grid"></div>
            </div>

            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>🎰 Vending Machine of Questionable Laws</span>
                <span style="font-size:0.7rem; color:#94a3b8;">[Keys 1–4]</span>
              </h3>
              <div class="deli-vending-grid">
                <button type="button" class="deli-btn" data-vend="SUMMON_ANOMALY">
                  [1] Summon Hybrid (${a.COST_SUMMON_ANOMALY}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="OVERCLOCK_PENDULUM">
                  [2] Gild Laser (${a.COST_OVERCLOCK_PENDULUM}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="POUR_LIQUID_FRIDAY">
                  [3] Liquid Friday (${a.COST_LIQUID_FRIDAY}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="INVERT_DECREE">
                  [4] 2.5x Gold Fever (${a.COST_INVERT_DECREE}₡)
                </button>
              </div>
            </div>

            <pre id="deli-debug-panel" class="deli-panel" style="margin:0; font-size:0.72rem; color:#38bdf8; overflow-x:auto;" hidden></pre>
          </div>
        </div>

        <div class="deli-ticker-bar">
          <span id="deli-action-banner" style="color:#fde047; font-weight:700;">THE THIRD HAND AWAITS YOUR COMMAND</span>
          <span id="deli-ticker-text">WEATHER REPORT: 80% chance of heavy Victorian nostalgia.</span>
        </div>

        <dialog
          id="deli-grimoire-modal"
          class="deli-grimoire-dialog"
          closedby="any"
          aria-labelledby="deli-grimoire-title"
        >
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #4c1d95; padding-bottom:0.6rem; margin-bottom:0.8rem;">
            <h2 id="deli-grimoire-title" style="margin:0; font-size:1.15rem; color:#fde047;">
              📖 Forbidden Culinary Grimoire &amp; Hybrid Combos
            </h2>
            <button
              type="button"
              class="deli-btn"
              commandfor="deli-grimoire-modal"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <p style="margin:0 0 0.75rem; font-size:0.84rem; color:#cbd5e1;">
            Collide two floating ingredients at high speed or press <strong>[E] Splice Hybrid</strong> to fuse Tier-2 Forbidden Delicacies! Splice any Tier-2 Hybrid with another ingredient to birth the <strong>🌌 5th-Dimensional Monolith Meatball</strong>!
          </p>
          <div id="deli-grimoire-list" style="display:grid; gap:0.5rem; font-size:0.82rem;"></div>
        </dialog>
      </div>
    `,this.canvas=this.container.querySelector("#deli-canvas"),this.ctx=this.canvas.getContext("2d"),this.elScore=this.container.querySelector("#deli-stat-score"),this.elSanity=this.container.querySelector("#deli-stat-sanity"),this.elCoins=this.container.querySelector("#deli-stat-coins"),this.elFeverTier=this.container.querySelector("#deli-stat-fever"),this.elCombo=this.container.querySelector("#deli-stat-combo"),this.elPatronsFed=this.container.querySelector("#deli-stat-fed"),this.elDecreeTitle=this.container.querySelector("#deli-decree-title"),this.elDecreeDesc=this.container.querySelector("#deli-decree-desc"),this.elDecreeTimer=this.container.querySelector("#deli-decree-timer"),this.elVortexTotal=this.container.querySelector("#deli-vortex-total"),this.elVortexAxes=this.container.querySelector("#deli-vortex-axes"),this.elActionBanner=this.container.querySelector("#deli-action-banner"),this.elTickerText=this.container.querySelector("#deli-ticker-text"),this.elParadoxBtn=this.container.querySelector("#deli-act-paradox"),this.elBoothsContainer=this.container.querySelector("#deli-booths-container"),this.elGrimoireList=this.container.querySelector("#deli-grimoire-list"),this.elDebugPanel=this.container.querySelector("#deli-debug-panel"),this.elOverlayModal=this.container.querySelector("#deli-overlay-modal"),this.elMuteBtn=this.container.querySelector("#deli-btn-mute"),this.elDebugPanel.hidden=!this.debugVisible;const i=this.container.querySelector("#deli-grimoire-modal");i&&typeof HTMLDialogElement<"u"&&!("closedBy"in HTMLDialogElement.prototype)&&i.addEventListener("click",o=>{if(o.target!==i)return;const n=i.getBoundingClientRect();n.top<=o.clientY&&o.clientY<=n.top+n.height&&n.left<=o.clientX&&o.clientX<=n.left+n.width||i.close()}),this.container.querySelector("#deli-act-grab")?.addEventListener("click",()=>{this.audio.playGrabPluck(),this.callbacks.onAction({type:"GRAB_OR_FLING"})}),this.container.querySelector("#deli-act-dunk")?.addEventListener("click",()=>{this.callbacks.onAction({type:"DUNK_NEAREST"})}),this.container.querySelector("#deli-act-slice")?.addEventListener("click",()=>{this.audio.playSliceCrunch(),this.callbacks.onAction({type:"SLICE_PULSE"})}),this.container.querySelector("#deli-act-splice")?.addEventListener("click",()=>{this.callbacks.onAction({type:"TRANSMOGRIFY_SPLICE"})}),this.elParadoxBtn?.addEventListener("click",()=>{this.callbacks.onAction({type:"PARADOX_FREEZE"})}),this.container.querySelector("#deli-act-serve-best")?.addEventListener("click",()=>{this.callbacks.onAction({type:"SERVE_BOOTH"})}),this.container.querySelector("#deli-btn-restart")?.addEventListener("click",()=>{this.callbacks.onRestart()}),this.elMuteBtn?.addEventListener("click",()=>{const o=!this.audio.isMuted();this.audio.setMuted(o),this.elMuteBtn.setAttribute("aria-pressed",String(o)),this.elMuteBtn.textContent=o?"🔇 Synth: OFF":"🔊 Synth: ON"});for(const o of this.container.querySelectorAll("button[data-vend]"))o.addEventListener("click",()=>{const n=o.getAttribute("data-vend");this.callbacks.onAction({type:"VENDING_ACTION",item:n})});const t=(o,n)=>{const r=this.canvas.getBoundingClientRect(),c=a.CHAMBER_WIDTH/Math.max(1,r.width),d=a.CHAMBER_HEIGHT/Math.max(1,r.height);return{x:(o-r.left)*c,y:(n-r.top)*d}};this.canvas.addEventListener("pointermove",o=>{const n=t(o.clientX,o.clientY);this.callbacks.onAction({type:"SET_HAND_POS",x:n.x,y:n.y})}),this.canvas.addEventListener("pointerdown",o=>{const n=t(o.clientX,o.clientY);if(n.y<105){const r=Math.min(2,Math.max(0,Math.floor(n.x/(a.CHAMBER_WIDTH/3))));this.callbacks.onAction({type:"SERVE_BOOTH",boothIndex:r});return}if(Math.hypot(n.x-a.VORTEX_X,n.y-a.VORTEX_Y)<=a.VORTEX_RADIUS*1.15){this.callbacks.onAction({type:"DUNK_NEAREST"});return}this.callbacks.onAction({type:"SET_HAND_POS",x:n.x,y:n.y}),this.audio.playGrabPluck(),this.callbacks.onAction({type:"GRAB_OR_FLING",targetX:a.VORTEX_X,targetY:a.VORTEX_Y})})}handleKeyDown(i){if(i.target instanceof HTMLInputElement||i.target instanceof HTMLTextAreaElement)return;const t=36;switch(i.key.toLowerCase()){case"arrowleft":case"a":i.preventDefault(),this.callbacks.onAction({type:"NUDGE_HAND",dx:-t,dy:0});break;case"arrowright":case"d":i.preventDefault(),i.shiftKey?this.callbacks.onAction({type:"DUNK_NEAREST"}):this.callbacks.onAction({type:"NUDGE_HAND",dx:t,dy:0});break;case"arrowup":case"w":i.preventDefault(),this.callbacks.onAction({type:"NUDGE_HAND",dx:0,dy:-t});break;case"arrowdown":i.preventDefault(),this.callbacks.onAction({type:"NUDGE_HAND",dx:0,dy:t});break;case" ":i.preventDefault(),this.audio.playGrabPluck(),this.callbacks.onAction({type:"GRAB_OR_FLING"});break;case"b":i.preventDefault(),this.callbacks.onAction({type:"DUNK_NEAREST"});break;case"s":i.preventDefault(),this.audio.playSliceCrunch(),this.callbacks.onAction({type:"SLICE_PULSE"});break;case"e":i.preventDefault(),this.callbacks.onAction({type:"TRANSMOGRIFY_SPLICE"});break;case"q":i.preventDefault(),this.callbacks.onAction({type:"PARADOX_FREEZE"});break;case"enter":i.preventDefault(),this.callbacks.onAction({type:"SERVE_BOOTH"});break;case"z":i.preventDefault(),this.callbacks.onAction({type:"SERVE_BOOTH",boothIndex:0});break;case"x":i.preventDefault(),this.callbacks.onAction({type:"SERVE_BOOTH",boothIndex:1});break;case"c":i.preventDefault(),this.callbacks.onAction({type:"SERVE_BOOTH",boothIndex:2});break;case"1":i.preventDefault(),this.callbacks.onAction({type:"VENDING_ACTION",item:"SUMMON_ANOMALY"});break;case"2":i.preventDefault(),this.callbacks.onAction({type:"VENDING_ACTION",item:"OVERCLOCK_PENDULUM"});break;case"3":i.preventDefault(),this.callbacks.onAction({type:"VENDING_ACTION",item:"POUR_LIQUID_FRIDAY"});break;case"4":i.preventDefault(),this.callbacks.onAction({type:"VENDING_ACTION",item:"INVERT_DECREE"});break;case"p":i.preventDefault(),this.callbacks.onAction({type:"TOGGLE_PAUSE"});break}}consumeEvents(i,t){for(const o of t){const n=o.x??a.CHAMBER_WIDTH/2,r=o.y??a.CHAMBER_HEIGHT/2,c=o.color??"#fde047";if(o.type==="INGREDIENT_SLICED"||o.type==="HYBRID_SYNTHESIZED"||o.type==="BROTH_BOILED"||o.type==="PATRON_SERVED"||o.type==="DECREE_SHIFTED"||o.type==="HAZARD_DESTROYED"||o.type==="HAZARD_CONTAMINATED"||o.type==="VICTORY_UNLOCKED"){this.banners.push({text:o.message,x:n,y:r,color:c,lifeMs:0,maxLifeMs:1650});for(let d=0;d<12;d++){const p=Math.PI*2*d/12,E=45+d%3*35;this.particles.push({x:n,y:r,vx:Math.cos(p)*E,vy:Math.sin(p)*E,color:c,size:4+d%3,alpha:1,lifeMs:0,maxLifeMs:550})}}switch(o.type){case"INGREDIENT_SLICED":case"HAZARD_DESTROYED":this.audio.playSliceCrunch();break;case"HYBRID_SYNTHESIZED":this.audio.playHybridSplice(),this.screenShakeMs=180;break;case"BROTH_BOILED":this.audio.playVortexBoil();break;case"PATRON_SERVED":case"VICTORY_UNLOCKED":this.audio.playPatronSatisfied(i.comboMultiplier),this.screenShakeMs=140;break;case"DECREE_SHIFTED":case"PARADOX_ACTIVATED":this.audio.playDecreeWarp();break;case"PATRON_STORMED_OUT":case"HAZARD_CONTAMINATED":this.audio.playAlarmBuzzer(),this.screenShakeMs=260;break}}}render(i,t,o){const n=w(i),r=O(i.vortexFlavors);this.elScore.textContent=i.score.toLocaleString(),this.elSanity.textContent=`${Math.max(0,Math.round(i.sanity))}%`,this.elSanity.style.color=i.sanity<=30?"#ef4444":i.sanity<=60?"#fbbf24":"#4ade80",this.elCoins.textContent=`${i.egoCoins}₡`,this.elFeverTier.textContent=`TIER ${i.feverTier}`,this.elCombo.textContent=`x${i.comboMultiplier}`,this.elPatronsFed.textContent=`${i.patronsFed} / ${a.PATRONS_FOR_VICTORY}`,this.elDecreeTitle.textContent=i.goldenFeverMs>0?"🌟 GOLDEN FEVER OVERRIDE (2.5x SCORE & FLAVOR!)":`${n.title} [${n.ministryCode}]`,this.elDecreeDesc.textContent=n.description,this.elDecreeTimer.textContent=`${(i.decreeTimerMs/1e3).toFixed(1)}s`,this.elVortexTotal.textContent=`${r} POTENCY`,this.elVortexAxes.innerHTML=`
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:0.3rem;">
        <div>🦷 CRUNCH: <strong style="color:#fde047">${i.vortexFlavors.crunch}</strong></div>
        <div>🕰️ NOSTALGIA: <strong style="color:#60a5fa">${i.vortexFlavors.nostalgia}</strong></div>
        <div>📻 STATIC: <strong style="color:#c084fc">${i.vortexFlavors.static}</strong></div>
        <div>🦞 CHUTZPAH: <strong style="color:#fb7185">${i.vortexFlavors.chutzpah}</strong></div>
      </div>
      <div style="margin-top:0.35rem; font-size:0.72rem; color:#94a3b8;">
        Boiled in Vat: ${i.lastBoiledSymbols.length>0?i.lastBoiledSymbols.join(" "):"Simmering base stock..."}
      </div>
    `,this.elActionBanner.textContent=i.lastHandActionText,this.elTickerText.textContent=i.activeTickerText,this.elParadoxBtn.textContent=i.paradoxFreezeMs>0?`❄️ FROZEN (${(i.paradoxFreezeMs/1e3).toFixed(1)}s)`:`❄️ Paradox Freeze [Q] (${Math.floor(i.paradoxCharge)}%)`;const c=["Z","X","C"];this.elBoothsContainer.innerHTML=i.booths.map((d,p)=>{const E=C(i.vortexFlavors,d),m=Math.max(0,Math.min(100,Math.round(d.patienceMs/d.maxPatienceMs*100)));return`
          <div class="deli-booth-card ${E.isSatisfied?"is-ready":""}" style="--booth-color:${d.auraColor}">
            <div class="deli-booth-header">
              <span>${d.avatarEmoji} #${p+1} ${d.name}</span>
              <span style="color:${m<35?"#ef4444":"#a7f3d0"}">${m}%⏳</span>
            </div>
            <p class="deli-booth-quote">"${d.activeQuote}"</p>
            <div class="deli-booth-footer">
              <span>Craves: <strong>${d.primaryAxis.toUpperCase()} + ${d.secondaryAxis.toUpperCase()}</strong> (Need ${d.minTotalFlavor})</span>
              <button
                type="button"
                class="deli-btn ${E.isSatisfied?"deli-btn-gold":""}"
                data-serve-booth="${p}"
                style="padding:0.2rem 0.5rem; font-size:0.72rem;"
              >
                🍽️ Serve [${c[p]}]
              </button>
            </div>
          </div>
        `}).join("");for(const d of this.elBoothsContainer.querySelectorAll("button[data-serve-booth]"))d.addEventListener("click",()=>{const p=Number(d.getAttribute("data-serve-booth"));this.callbacks.onAction({type:"SERVE_BOOTH",boothIndex:p})});if(this.elGrimoireList.innerHTML=$.map(d=>{const p=x.get(d.ingredientA),E=x.get(d.ingredientB),m=x.get(d.resultId),l=i.discoveredHybrids.includes(m.id)||t.hybridsDiscovered.includes(m.id);return`
        <div style="background:rgba(9,5,20,0.85); border:1px solid ${l?"#fde047":"#334155"}; border-radius:0.5rem; padding:0.5rem 0.7rem; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <strong>${p.symbol} ${p.name} + ${E.symbol} ${E.name} → ${m.symbol} ${m.name}</strong>
            <div style="font-size:0.74rem; color:#94a3b8;">${m.lore}</div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:${l?"#fde047":"#64748b"};">
            ${l?"★ DISCOVERED":"UNDISCOVERED"}
          </span>
        </div>
      `}).join(""),i.status==="GAME_OVER"?(this.elOverlayModal.hidden=!1,this.elOverlayModal.innerHTML=`
        <h2 style="margin:0 0 0.5rem; font-size:1.8rem; color:#f43f5e;">
          👁️ ONTOLOGICAL PERMIT REVOKED (GAME OVER)
        </h2>
        <p style="max-width:52ch; color:#e2e8f0; margin:0 0 1rem;">
          ${i.gameOverReason??"Your Ego Sanity evaporated into the 5th Dimension."}
        </p>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.9rem; color:#fde047; margin-bottom:1.2rem;">
          Final Score: ${i.score.toLocaleString()} · Patrons Fed: ${i.patronsFed} · Max Combo: x${i.maxComboReached} · Career High: ${t.highScore.toLocaleString()}
        </div>
        <button type="button" class="deli-btn deli-btn-gold" id="deli-overlay-restart">
          ↻ Re-Open the Metaphysical Deli
        </button>
      `,this.elOverlayModal.querySelector("#deli-overlay-restart")?.addEventListener("click",()=>this.callbacks.onRestart())):i.status==="PAUSED"?(this.elOverlayModal.hidden=!1,this.elOverlayModal.innerHTML=`
        <h2 style="margin:0 0 0.5rem; font-size:1.6rem; color:#38bdf8;">
          ⏸ SUBCONSCIOUS PAUSED
        </h2>
        <p style="color:#cbd5e1; margin:0 0 1rem;">
          The baby teeth and jazz lobsters are patiently suspended in non-linear time.
        </p>
        <button type="button" class="deli-btn deli-btn-hot" id="deli-overlay-resume">
          ▶ Resume Cooking [P]
        </button>
      `,this.elOverlayModal.querySelector("#deli-overlay-resume")?.addEventListener("click",()=>this.callbacks.onAction({type:"TOGGLE_PAUSE"}))):this.elOverlayModal.hidden=!0,this.debugVisible){const d=V(i.feverTier);this.elDebugPanel.textContent=JSON.stringify({seed:i.seed,rngState:i.rngState,feverTier:i.feverTier,speedMult:d.speedMultiplier,decree:i.activeDecreeId,floatingCount:i.ingredients.length,heldUid:i.heldIngredientUid,vortexFlavors:i.vortexFlavors,discoveredHybrids:i.discoveredHybrids},null,2)}this.renderCanvasStage(i,o)}renderCanvasStage(i,t){const o=this.ctx;if(!o)return;const n=a.CHAMBER_WIDTH,r=a.CHAMBER_HEIGHT,c=i.elapsedMs/1e3,d=w(i);if(this.screenShakeMs>0&&(this.screenShakeMs=Math.max(0,this.screenShakeMs-t)),o.save(),o.clearRect(0,0,n,r),this.screenShakeMs>0){const l=this.screenShakeMs/260*6;o.translate(Math.sin(c*90)*l,Math.cos(c*75)*l)}const p=o.createLinearGradient(0,0,0,r);i.goldenFeverMs>0?(p.addColorStop(0,"#422006"),p.addColorStop(.5,"#1e1b4b"),p.addColorStop(1,"#090514")):i.paradoxFreezeMs>0?(p.addColorStop(0,"#082f49"),p.addColorStop(.5,"#0f172a"),p.addColorStop(1,"#020617")):(p.addColorStop(0,"#1a0b2e"),p.addColorStop(.55,"#0d061a"),p.addColorStop(1,"#05020a")),o.fillStyle=p,o.fillRect(0,0,n,r),o.strokeStyle=i.goldenFeverMs>0?"rgba(250, 204, 21, 0.16)":"rgba(168, 85, 247, 0.14)",o.lineWidth=1;for(let l=0;l<=n;l+=60){o.beginPath();const u=Math.sin(c*2+l*.02)*18;o.moveTo(l,100),o.quadraticCurveTo(n/2+u,r/2,l,r),o.stroke()}for(let l=110;l<=r;l+=55)o.beginPath(),o.moveTo(0,l),o.lineTo(n,l),o.stroke();const E=250;for(let l=0;l<i.booths.length;l++){const u=i.booths[l],y=35+l*265,v=12,A=C(i.vortexFlavors,u);o.save(),o.fillStyle=A.isSatisfied?"rgba(234, 179, 8, 0.22)":"rgba(15, 23, 42, 0.85)",o.strokeStyle=A.isSatisfied?"#fde047":u.auraColor,o.lineWidth=A.isSatisfied?2.5:1.5,o.beginPath(),o.roundRect(y,v,E,84,10),o.fill(),o.stroke();for(let s=0;s<Math.min(7,u.eyeCount);s++){const h=y+22+s*14,f=v+24;o.fillStyle="#ffffff",o.beginPath(),o.arc(h,f,5.5,0,Math.PI*2),o.fill();const b=Math.atan2(i.handY-f,i.handX-h);o.fillStyle="#090514",o.beginPath(),o.arc(h+Math.cos(b)*2.2,f+Math.sin(b)*2.2,2.5,0,Math.PI*2),o.fill()}o.fillStyle="#f8fafc",o.font="bold 12px Inter, sans-serif",o.fillText(`${u.avatarEmoji} ${u.name.slice(0,22)}`,y+12,v+48),o.fillStyle=A.isSatisfied?"#fde047":"#cbd5e1",o.font="bold 11px JetBrains Mono, monospace",o.fillText(A.isSatisfied?`★ READY TO SERVE! [CLICK / ${["Z","X","C"][l]}]`:`Wants ${u.primaryAxis.toUpperCase()}+${u.secondaryAxis.toUpperCase()} (${A.totalRaw}/${u.minTotalFlavor})`,y+12,v+66);const T=Math.max(0,u.patienceMs/u.maxPatienceMs);o.fillStyle=T<.35?"#ef4444":u.auraColor,o.fillRect(y+10,v+74,(E-20)*T,5),o.restore()}o.save();for(let l=3;l>=1;l--){const u=a.VORTEX_RADIUS*(l/2.4),y=o.createRadialGradient(a.VORTEX_X,a.VORTEX_Y,8,a.VORTEX_X,a.VORTEX_Y,u);i.goldenFeverMs>0?(y.addColorStop(0,"#fef08a"),y.addColorStop(.6,"rgba(234, 179, 8, 0.45)"),y.addColorStop(1,"rgba(234, 179, 8, 0)")):(y.addColorStop(0,"#f472b6"),y.addColorStop(.55,"rgba(168, 85, 247, 0.42)"),y.addColorStop(1,"rgba(56, 189, 248, 0)")),o.fillStyle=y,o.beginPath(),o.arc(a.VORTEX_X,a.VORTEX_Y,u,0,Math.PI*2),o.fill()}o.strokeStyle=i.goldenFeverMs>0?"#fde047":"#e879f9",o.lineWidth=3,o.setLineDash([10,6]),o.beginPath(),o.arc(a.VORTEX_X,a.VORTEX_Y,a.VORTEX_RADIUS,c*2,c*2+Math.PI*2),o.stroke(),o.setLineDash([]);const m=O(i.vortexFlavors);o.fillStyle="#ffffff",o.font="bold 13px JetBrains Mono, monospace",o.textAlign="center",o.fillText(`🍲 PRIMORDIAL BROTH (${m})`,a.VORTEX_X,a.VORTEX_Y-6),o.fillStyle="#fde047",o.font="12px Inter, sans-serif",o.fillText(i.lastBoiledSymbols.length>0?i.lastBoiledSymbols.join(" "):"FLING OR CLICK [D] TO BOIL!",a.VORTEX_X,a.VORTEX_Y+14),o.restore(),o.save(),o.strokeStyle=i.overclockPendulumMs>0?"#fde047":"#f43f5e",o.lineWidth=i.overclockPendulumMs>0?4:2.5,o.beginPath(),o.moveTo(a.PENDULUM_PIVOT_X,a.PENDULUM_PIVOT_Y),o.lineTo(i.pendulumBladeX,i.pendulumBladeY),o.stroke(),o.translate(i.pendulumBladeX,i.pendulumBladeY),o.rotate(c*7),o.fillStyle=i.overclockPendulumMs>0?"rgba(250, 204, 21, 0.35)":"rgba(244, 63, 94, 0.28)",o.strokeStyle=i.overclockPendulumMs>0?"#fef08a":"#fb7185",o.lineWidth=2.5,o.beginPath(),o.arc(0,0,a.PENDULUM_BLADE_RADIUS,0,Math.PI*2),o.fill(),o.stroke(),o.rotate(-c*7),o.fillStyle="#ffffff",o.font="18px sans-serif",o.textAlign="center",o.textBaseline="middle",o.fillText("⚙️",0,0),o.restore();for(const l of i.ingredients){if(o.save(),d.ingredientsFleeHand&&!l.isHazard){o.strokeStyle="#4ade80",o.lineWidth=2;const u=Math.sin(c*18+l.uid)*7;o.beginPath(),o.moveTo(l.x-8,l.y+l.radius-2),o.lineTo(l.x-12+u,l.y+l.radius+11),o.moveTo(l.x+8,l.y+l.radius-2),o.lineTo(l.x+12-u,l.y+l.radius+11),o.stroke()}o.fillStyle=l.isHazard?"rgba(239, 68, 68, 0.28)":l.isGilded?"rgba(250, 204, 21, 0.32)":"rgba(30, 16, 53, 0.86)",o.strokeStyle=l.isGilded?"#fde047":l.glowColor,o.lineWidth=l.tier>=2||l.isGilded?3:2,o.beginPath(),o.arc(l.x,l.y,l.radius,0,Math.PI*2),o.fill(),o.stroke(),o.font=`${Math.round(l.radius*1.05)}px sans-serif`,o.textAlign="center",o.textBaseline="middle",o.fillText(l.symbol,l.x,l.y),o.fillStyle=l.isGilded?"#fde047":"#f8fafc",o.font="bold 10px JetBrains Mono, monospace",o.fillText(l.isSlicedHalf?`½ ${l.name.slice(2,14)}`:l.name.slice(0,15),l.x,l.y+l.radius+11),l.whisperTimerMs>0&&(o.fillStyle="rgba(9, 5, 20, 0.9)",o.font="10px Inter, sans-serif",o.fillStyle="#fde047",o.fillText(`"${l.whisper}"`,l.x,l.y-l.radius-8)),o.restore()}if(o.save(),i.ingredients.length>0){let l=i.ingredients.find(u=>u.uid===i.heldIngredientUid);l||(l=[...i.ingredients].sort((u,y)=>Math.hypot(u.x-i.handX,u.y-i.handY)-Math.hypot(y.x-i.handX,y.y-i.handY))[0]),l&&(o.strokeStyle=i.heldIngredientUid!==null?"#fde047":"rgba(56, 189, 248, 0.38)",o.lineWidth=i.heldIngredientUid!==null?3:1.5,o.setLineDash([5,5]),o.beginPath(),o.moveTo(i.handX,i.handY),o.lineTo(l.x,l.y),o.stroke(),o.setLineDash([]))}o.strokeStyle="#38bdf8",o.fillStyle="rgba(56, 189, 248, 0.2)",o.lineWidth=2.5,o.beginPath(),o.arc(i.handX,i.handY,24,0,Math.PI*2),o.fill(),o.stroke(),o.font="22px sans-serif",o.textAlign="center",o.textBaseline="middle",o.fillText(i.heldIngredientUid!==null?"✊":"✋",i.handX,i.handY),o.restore();for(let l=this.particles.length-1;l>=0;l--){const u=this.particles[l];if(u.lifeMs+=t,u.lifeMs>=u.maxLifeMs){this.particles.splice(l,1);continue}u.x+=u.vx*t/1e3,u.y+=u.vy*t/1e3,u.alpha=1-u.lifeMs/u.maxLifeMs,o.save(),o.globalAlpha=Math.max(0,u.alpha),o.fillStyle=u.color,o.beginPath(),o.arc(u.x,u.y,u.size,0,Math.PI*2),o.fill(),o.restore()}for(let l=this.banners.length-1;l>=0;l--){const u=this.banners[l];if(u.lifeMs+=t,u.lifeMs>=u.maxLifeMs){this.banners.splice(l,1);continue}u.y-=22*t/1e3;const y=1-u.lifeMs/u.maxLifeMs;o.save(),o.globalAlpha=Math.max(0,y),o.fillStyle=u.color,o.font="bold 13px JetBrains Mono, monospace",o.textAlign="center",o.fillText(u.text,u.x,u.y),o.restore()}o.restore()}destroy(){window.removeEventListener("keydown",this.boundKeyDown),this.container.innerHTML=""}}const le={id:"11-metaphysical-deli",number:11,title:"The Metaphysical Deli",subtitle:"Non-Euclidean Soup Cauldron & Forbidden Hybrid Alchemy",genre:"Surreal Physics-Action Culinary Fever Dream",primaryReference:"Jazzpunk / Hylics / WarioWare",supportingReference:"Overcooked · Fruit Ninja · SpaceChem",oneSentenceLoop:"Pilot The Third Hand across a warping 4th-dimensional delicatessen to grab, laser-bisect, high-velocity splice, and boil sentient baby teeth, melting pocketwatches, and bebop lobsters into the Primordial Broth Vortex to appease 3 multi-eyed subconscious entities before Reality Decrees invert gravity!",shortGoal:"Satisfy 12 Surreal Entities across shifting Ministry of Ontology Reality Decrees and survive the Grand Comptroller Audit to earn your Transcendental Culinary License.",longGoal:"Discover all 7 Forbidden Hybrid Delicacies (including the 5th-Dimensional Monolith Meatball), chain x8 Digestion Combos, and master Fever Tier 35.",controlsSummary:"Mouse / WASD: Move Third Hand · Click / Space: Grab & Fling · D: Boil in Vortex · S: Laser Bisect · E: Splice Hybrid · Q: Paradox Freeze · Z/X/C or Enter: Serve Booth · 1–4: Vending Machine",accentColor:"#f472b6"};function de(e,i){const t=oe();let o={...t.career,hybridsDiscovered:[...t.career.hybridsDiscovered]};const n=i?.initialSeed??a.DEFAULT_SEED;let r=i?.initialSeed===void 0&&t.activeRun&&t.activeRun.status!=="GAME_OVER"?P(t.activeRun):Y(n);const c=new J,d=T=>{re(r,T),r.events.length>0&&(m.consumeEvents(r,r.events),r.events=[]),(r.status==="PAUSED"||T.type==="SERVE_BOOTH")&&(o=L(o,r).career)},p=T=>{const s=typeof T=="number"?T:r.seed+104729>>>0;o.gamesPlayed+=1,r=Y(s),m.resetVisuals(),o=L(o,r).career},E=T=>{const s=typeof T=="boolean"?T:!m.isDebugVisible();m.setDebugVisible(s)},m=new se(e,c,{onAction:d,onRestart:p,onToggleDebug:()=>E()},!!i?.debug);let l=0,u=performance.now(),y=0,v=!1;const A=T=>{if(v)return;const s=Math.min(100,Math.max(0,T-u));u=T,y+=s;const h=r.feverTier,f=r.status;for(;y>=a.FIXED_STEP_MS;)ae(r,a.FIXED_STEP_MS),r.events.length>0&&(m.consumeEvents(r,r.events),r.events=[]),y-=a.FIXED_STEP_MS;(r.feverTier!==h||r.status!==f||r.score>o.highScore)&&(o=L(o,r.status==="GAME_OVER"?null:r).career),m.render(r,o,s||a.FIXED_STEP_MS),l=window.requestAnimationFrame(A)};return m.render(r,o,a.FIXED_STEP_MS),l=window.requestAnimationFrame(A),{destroy(){v=!0,window.cancelAnimationFrame(l),L(o,r.status==="GAME_OVER"?null:r),c.destroy(),m.destroy()},getStateSnapshot(){return P(r)},restartWithSeed(T){p(T),m.render(r,o,a.FIXED_STEP_MS)},toggleDebug(T){E(T),m.render(r,o,a.FIXED_STEP_MS)}}}const ce={metadata:le,mountGame:de},ue=Object.freeze(Object.defineProperty({__proto__:null,ALL_INGREDIENTS_MAP:x,BASE_INGREDIENTS:R,CONFIG:a,DeliAudioEngine:J,DeliUIController:se,FUSION_RECIPES:$,HAZARD_INGREDIENTS:z,HYBRID_INGREDIENTS:G,PATRON_ARCHETYPES:D,REALITY_DECREES:U,SAVE_SCHEMA_VERSION:H,SUBCONSCIOUS_TICKER_MESSAGES:W,applyInput:re,boilIngredientIntoVortex:Q,cloneDeliState:P,computePendulumBladePosition:q,createDefaultCareerStats:ee,createInitialState:Y,createSeededRng:B,default:ce,deserializeDeliEnvelope:X,evaluateBoothHarmony:C,fuseTwoIngredients:K,getActiveDecreeDef:w,getDifficultyForLevel:V,getTotalFlavorMagnitude:O,loadDeliSave:oe,metadata:le,mountGame:de,resolveFusionResult:te,saveDeliState:L,serializeDeliEnvelope:ie,servePatronBooth:ne,sliceIngredientEntity:k,stepDeliState:ae},Symbol.toStringTag,{value:"Module"}));export{le as a,ue as g,de as m};
