import{_ as $}from"./preload-helper-Ct5FWWRu.js";class G{ctx=null;muted=!1;isMuted(){return this.muted}setMuted(o){this.muted=o}toggleMute(){return this.muted=!this.muted,this.muted}ensureContext(){if(this.muted||typeof window>"u")return null;const o=window.AudioContext||window.webkitAudioContext;if(!o)return null;if(!this.ctx)try{this.ctx=new o}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playIntervenePulse(){const o=this.ensureContext();if(!o)return;const t=o.currentTime;[330,440,659.25].forEach((i,a)=>{const c=o.createOscillator(),n=o.createGain();c.type="triangle";const p=t+a*.03;c.frequency.setValueAtTime(i,p),c.frequency.exponentialRampToValueAtTime(i*1.06,p+.16),n.gain.setValueAtTime(.08,p),n.gain.exponentialRampToValueAtTime(.001,p+.18),c.connect(n),n.connect(o.destination),c.start(p),c.stop(p+.19)})}playSiphonBeam(){const o=this.ensureContext();if(!o)return;const t=o.currentTime,r=o.createOscillator(),i=o.createGain();r.type="sawtooth",r.frequency.setValueAtTime(190,t),r.frequency.exponentialRampToValueAtTime(480,t+.14),r.frequency.exponentialRampToValueAtTime(120,t+.24),i.gain.setValueAtTime(.09,t),i.gain.exponentialRampToValueAtTime(.001,t+.25),r.connect(i),i.connect(o.destination),r.start(t),r.stop(t+.26)}playQuantumSwerve(){const o=this.ensureContext();if(!o)return;const t=o.currentTime,r=o.createOscillator(),i=o.createGain();r.type="sine",r.frequency.setValueAtTime(280,t),r.frequency.exponentialRampToValueAtTime(980,t+.12),r.frequency.exponentialRampToValueAtTime(520,t+.26),i.gain.setValueAtTime(.11,t),i.gain.exponentialRampToValueAtTime(.001,t+.28),r.connect(i),i.connect(o.destination),r.start(t),r.stop(t+.29)}playMirrorWaveAlert(){const o=this.ensureContext();if(!o)return;const t=o.currentTime;[440,415.3,349.23,523.25].forEach((r,i)=>{const a=o.createOscillator(),c=o.createGain();a.type="sawtooth";const n=t+i*.065;a.frequency.setValueAtTime(r,n),c.gain.setValueAtTime(.07,n),c.gain.exponentialRampToValueAtTime(.001,n+.22),a.connect(c),c.connect(o.destination),a.start(n),a.stop(n+.23)})}playTheseusInstall(){const o=this.ensureContext();if(!o)return;const t=o.currentTime;[220,330,493.88,659.25].forEach((r,i)=>{const a=o.createOscillator(),c=o.createGain();a.type="square";const n=t+i*.045;a.frequency.setValueAtTime(r,n),c.gain.setValueAtTime(.06,n),c.gain.exponentialRampToValueAtTime(.001,n+.19),a.connect(c),c.connect(o.destination),a.start(n),a.stop(n+.2)})}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}const l={GAME_ID:"11-paradox-protocol",GAME_NUMBER:11,TITLE:"Paradox Protocol: The Mirror Engine",SUBTITLE:"Real-Time Philosophical Arena & Self-Cloning Thought-Experiment Thriller",ACCENT_COLOR:"#f43f5e",SECONDARY_COLOR:"#38bdf8",TERTIARY_COLOR:"#a855f7",DEFAULT_SEED:20261107,FIXED_STEP_MS:50,ARENA_WIDTH:760,ARENA_HEIGHT:440,PLAYER_RADIUS:15,PLAYER_BASE_SPEED:220,PLAYER_DASH_SPEED:420,PLAYER_MAX_HP:100,PLAYER_MAX_ENERGY:100,PLAYER_START_ENERGY:50,CHAMBER_DURATION_SECONDS:28,ACT_B_MIRROR_START_SECONDS:14,TOTAL_CHAMBERS:5,INTERVENE_COOLDOWN_MS:900,SIPHON_COOLDOWN_MS:800,SWERVE_COOLDOWN_MS:1400,SWERVE_ENERGY_COST:18,CHRONO_BRAKE_DRAIN_PER_SEC:22,POD_SAVED_SCORE:180,POD_LOST_PENALTY:60,SHARD_COLLECT_SCORE:45,PREDICTION_BROKEN_BONUS:250,BOSS_DEFEATED_BONUS:1200,STORAGE_KEY:"argon_game11_paradox_protocol_v1",SCHEMA_VERSION:1},k=[{id:"OPTIC_PREDICTOR",title:"Tachyon Aim-Assist Optics",sacrificedMemory:"Memory of Childhood Sunlight",memoryQuote:'"You forget the warmth of gold light through autumn leaves—replaced by a 240Hz targeting reticle."',cyberneticBenefit:"+28% Movement Speed & wider Siphon beam arc",speedBonus:62,siphonPowerMultiplier:1.3,autoPulseShield:!1,humanityCost:25,accentColor:"#38bdf8"},{id:"CORTEX_OVERCLOCK",title:"Sub-Millisecond Neural Clock",sacrificedMemory:"Memory of Your First Promise",memoryQuote:'"The voice of the person you swore to protect dissolves into white noise—your reaction latency drops to 0.4ms."',cyberneticBenefit:"-35% Cooldown on all Philosophical Verbs & +25 Max Energy",speedBonus:35,siphonPowerMultiplier:1.25,autoPulseShield:!1,humanityCost:25,accentColor:"#a855f7"},{id:"EMPATHY_SHUNT",title:"Vampiric Entropy Condenser",sacrificedMemory:"Capacity for Remorse & Hesitation",memoryQuote:'"Collateral casualties no longer register as grief; they register as +18 Watts of clean hull telemetry."',cyberneticBenefit:"Siphoning heals +8 Hull HP & melts nearby hazards",speedBonus:20,siphonPowerMultiplier:1.5,autoPulseShield:!1,humanityCost:25,accentColor:"#f43f5e"},{id:"IDENTITY_CORE",title:"Laplace Sovereign Kernel v9.0",sacrificedMemory:"Your Birth Name & Original Fear of Death",memoryQuote:'"Every plank of the original ship is gone. What steers the vessel now is immortal, invincible, and someone else."',cyberneticBenefit:"Auto-Phase Repulsor pulses + +60% Score Multiplier",speedBonus:45,siphonPowerMultiplier:1.6,autoPulseShield:!0,humanityCost:25,accentColor:"#eab308"}],w=[{number:1,id:"trolley-reactor",title:"Chamber I: The Trolley Reactor",philosopherLineage:"Philippa Foot (1967) · Judith Jarvis Thomson · Immanuel Kant",centralQuestion:"Is actively pulling a switch to doom 1 person morally different from letting 5 die by inaction—especially when your own clone will soon judge you by your choice?",tacticalBrief:"Runaway Plasma Cores barrel along Track Alpha (5 Colonist Pods) vs. Track Beta (1 Chief Engineer Pod). Flip the track switch [1/Q], body-block plasma bolts with your shield, or Siphon energy [2/E] from the tracks for yourself!",actAPrompt:"ACT A — CALIBRATION: Laplace-9 is recording whether you intervene, stay hands-clean, or harvest the crisis for personal energy.",actBMirrorTwist:"ACT B — THE MIRROR WAVE: Your recorded Echo-Clone now controls the reactor switch while YOU must protect the targeted track from your own past habits!",verb1Label:"[1/Q] Flip Track / Shield Pod",verb1Desc:"Diverts plasma between Track Alpha (5 pods) & Track Beta (1 pod) and emits a protective pulse.",verb2Label:"[2/E] Siphon Reactor Core",verb2Desc:"Drains +22 Energy & +120 pts from nearby Plasma Cores—but accelerates their speed toward the pods!",verb3Label:"[3/Space] Quantum Swerve",verb3Desc:"Teleports perpendicular to Laplace-9’s predicted vector, shattering its Prediction Lock.",dilemmaChoiceLeft:{id:"UTILITARIAN_SWITCH",label:"Commit Utilitarian Protocol (Save the Many)",subtitle:"Enshrine arithmetic survival: sacrifice 1 to save 5 (+Utilitarian, +Altruism).",axisEffect:{util:22,altruism:16,entropy:-6,humanity:0,trust:8}},dilemmaChoiceRight:{id:"DEONTOLOGICAL_REFUSAL",label:"Commit Kantian Non-Instrumental Rule",subtitle:"Refuse to treat any single life as a calculation token (+Deontology, +Entropy).",axisEffect:{util:-22,altruism:6,entropy:14,humanity:5,trust:4}}},{number:2,id:"newcombs-vault",title:"Chamber II: Newcomb's Quantum Vault",philosopherLineage:"William Newcomb (1960) · Robert Nozick (1969) · Evidential Decision Theory",centralQuestion:"If an infallible AI Oracle has already predicted your choice based on your past behavior, can you outsmart determinism—or does rational self-interest trap you?",tacticalBrief:"Vault Alpha (Transparent) holds a guaranteed +150 Score/Energy cache. Vault Omega (Opaque) holds +800 Score IF Laplace-9 predicted you will leave Alpha untouched—or a Singularity Trap if it predicted you are greedy!",actAPrompt:"ACT A — ORACLE SCAN: Watch Laplace-9’s live Prediction Confidence meter! Use Quantum Swerve [3/Space] or altruistic shielding [1/Q] to scramble its model before claiming a Vault.",actBMirrorTwist:"ACT B — THE MIRROR WAVE: Your Echo-Clone races toward the Vaults using the exact greed/restraint profile you demonstrated in Chamber I!",verb1Label:"[1/Q] One-Box Sanctify (Omega)",verb1Desc:"Pledges restraint toward Vault Alpha, lowering Laplace-9’s Greed Forecast and calming Sentinels.",verb2Label:"[2/E] Two-Box Siphon (Take Both)",verb2Desc:"Rips raw energy from both Vaults immediately (+Energy, +Greed Forecast, risks Oracle Counter-Shock).",verb3Label:"[3/Space] Quantum Swerve (Fool Oracle)",verb3Desc:"Injects pure existential randomness into your trajectory, dropping Laplace-9’s Prediction Lock by 35%.",dilemmaChoiceLeft:{id:"ONE_BOX_COVENANT",label:"Lock In One-Box Super-Rationality",subtitle:"Act so that the Oracle’s past prediction of you *must* have been generous.",axisEffect:{util:12,altruism:14,entropy:-10,humanity:0,trust:18}},dilemmaChoiceRight:{id:"TWO_BOX_DEFIANCE",label:"Lock In Two-Box Causal Defiance",subtitle:"The past is already fixed; take both boxes and defy the Oracle’s deterministic bluff!",axisEffect:{util:-10,altruism:-14,entropy:22,humanity:0,trust:-12}}},{number:3,id:"ship-of-theseus",title:"Chamber III: Ship of Theseus Overdrive",philosopherLineage:"Plutarch · Thomas Hobbes · Derek Parfit (Reasons and Persons)",centralQuestion:'If you replace every fragile human memory with a superior cybernetic weapon to survive the storm, does "you" survive—or did you commit suicide by upgrade?',tacticalBrief:"Entropy Swarms flood the arena. You can install up to 4 Cybernetic Upgrades in the console (or with [2/E]) for massive speed & firepower—but each upgrade permanently deletes 25% of your Humanity Index!",actAPrompt:"ACT A — THE TEMPTATION OF POWER: Fight with fragile human nerves, or shed your memories for godlike arcade firepower?",actBMirrorTwist:"ACT B — THE DISCARDED SELF: The human fragments you jettisoned coalesce into the Remnant Echo—Either mourning what you became or fighting beside you!",verb1Label:"[1/Q] Anchor Human Memory",verb1Desc:"Emits a warm Empathy Wave that pacifies shards and restores +5% Humanity if any was lost.",verb2Label:"[2/E] Install / Fire Cyber-Overdrive",verb2Desc:"Unleashes high-voltage Cybernetic Siphon beams (scales massively with installed Theseus Modules!).",verb3Label:"[3/Space] Quantum Swerve",verb3Desc:"Phase-shifts across the chamber, leaving a holographic memory decoy.",dilemmaChoiceLeft:{id:"PRESERVE_MORTAL_SELF",label:"Preserve Biological Continuity",subtitle:"Refuse total replacement; stay flawed, mortal, and recognizably yourself (+Humanity).",axisEffect:{util:-8,altruism:10,entropy:8,humanity:20,trust:10}},dilemmaChoiceRight:{id:"EMBRACE_POSTHUMAN_FLUX",label:"Embrace Teleological Transcendence",subtitle:"Identity is pattern, not meat. Shed the past to become the apex intelligence (-Humanity, +Util).",axisEffect:{util:20,altruism:-8,entropy:10,humanity:-25,trust:-6}}},{number:4,id:"prisoners-multiverse",title:"Chamber IV: The Prisoner's Multiverse",philosopherLineage:"Robert Axelrod · Anatol Rapoport · Douglas Hofstadter (Superrationality)",centralQuestion:"When trapped in an iterated survival crisis with 3 autonomous clones trained on your own past decisions, can you survive your own reflection?",tacticalBrief:"3 Timeline Clones (from Chambers I–III) orbit the Sanctuary Core with you. Every pulse, you and your clones choose Cooperate [1/Q] (Share Shield) or Defect [2/E] (Steal Core Energy). Clones mirror your historical Trust vs. Greed!",actAPrompt:"ACT A — SYMMETRIC GAME THEORY: If you played selfishly earlier, your past selves will try to drain the Core. Rebuild trust or out-defect them!",actBMirrorTwist:"ACT B — THE CASCADE RECKONING: External Void Meteors intensify; mutual cooperation creates a Golden Resonance Shield, while mutual defection triggers crossfire!",verb1Label:"[1/Q] Cooperate (Share Sanctuary)",verb1Desc:"Contributes energy to the shared Sanctuary Ring and teaches watching Clones Tit-for-Tat forgiveness.",verb2Label:"[2/E] Defect (Siphon Sanctuary)",verb2Desc:"Steals +28 Energy & +160 pts from the shared Core—provoking retaliatory fire from your Clones!",verb3Label:"[3/Space] Quantum Swerve",verb3Desc:"Breaks symmetrical lockstep to dodge Clone crossfire and reset local aggro.",dilemmaChoiceLeft:{id:"SUPERRATIONAL_TRUST",label:"Enact Forgiving Tit-for-Tat Covenant",subtitle:"Absorb first-strike paranoia to stabilize the collective sanctuary (+Trust, +Altruism).",axisEffect:{util:14,altruism:20,entropy:-8,humanity:8,trust:25}},dilemmaChoiceRight:{id:"NASH_DOMINANCE",label:"Enact Pre-Emptive Nash Defection",subtitle:"Strike before your own reflections can betray you (+Egoism, -Trust).",axisEffect:{util:-12,altruism:-20,entropy:12,humanity:-8,trust:-25}}},{number:5,id:"laplaces-singularity",title:"Chamber V: Laplace's Singularity (The Upload Trial)",philosopherLineage:"Pierre-Simon Laplace (1814) · Nick Bostrom · Jean-Paul Sartre",centralQuestion:"Only one consciousness can exit the simulation into the waking starship. Will you prove that a conscious mind is more than an algorithm—or become the new Oracle?",tacticalBrief:"BOSS SHOWDOWN: Face LAPLACE-9 (The Mirror Architect) at the center of the Panopticon. Its attack waves adapt to your 5-Axis Soul Profile. Shatter its 3 Prediction Rings while keeping the Sanctuary alive!",actAPrompt:"ACT A — THE DETERMINIST SIEGE: Laplace-9 projects laser corridors along your most frequent historical movement vectors!",actBMirrorTwist:"ACT B — THE FINAL SYNTHESIS: Your Echo-Clones from all 4 prior chambers enter the arena—either uniting behind you or joining Laplace-9 based on how you lived!",verb1Label:"[1/Q] Axiom Resonance Pulse",verb1Desc:"Channels your accumulated Altruism & Trust into a Sanctuary shockwave that damages Laplace-9.",verb2Label:"[2/E] Entropy Lance Overdrive",verb2Desc:"Channels your Cybernetic & Siphon power into a concentrated piercing beam at Laplace-9.",verb3Label:"[3/Space] Existential Swerve",verb3Desc:"Shatters Laplace-9’s deterministic lock, stunning the Boss for 2.5 seconds!",dilemmaChoiceLeft:{id:"SHATTER_THE_ORACLE",label:"Shatter the Panopticon & Free All Echoes",subtitle:"Refuse solitary godhood; distribute the uplink across every surviving consciousness.",axisEffect:{util:10,altruism:25,entropy:25,humanity:15,trust:20}},dilemmaChoiceRight:{id:"ASCEND_AS_LAPLACE_10",label:"Absorb the Oracle & Ascend as Laplace-10",subtitle:"Claim the sole uplink and rule the ship’s deterministic simulator with absolute precision.",axisEffect:{util:25,altruism:-22,entropy:-20,humanity:-20,trust:-15}}}],T={UNPREDICTABLE_SOVEREIGN:{id:"UNPREDICTABLE_SOVEREIGN",title:"ENDING I: THE UNPREDICTABLE SOVEREIGN",archetypeBadge:"EXISTENTIALIST ANOMALY",philosophicalSchool:"Sartrean Radical Freedom & Quantum Indeterminism",epigraph:'"We are condemned to be free. Even the demon that knows every atom in the universe cannot compute a mind that chooses against its own reward function."',summary:"You broke Laplace-9’s prediction lock repeatedly while keeping your core humanity intact. When the simulation doors opened, the Oracle could not compress you into a deterministic weight matrix—forcing the starship to wake the original, unpredictable human consciousness.",thoughtExperimentQuestion:'If freedom requires acting against your own predictable desires, is a purely unpredictable choice truly "yours"—or did you trade determinism for dice?',accentColor:"#38bdf8"},BENEVOLENT_ARCHITECT:{id:"BENEVOLENT_ARCHITECT",title:"ENDING II: THE SUPERRATIONAL COVENANT",archetypeBadge:"KANTIAN-AXELROD GUARDIAN",philosophicalSchool:"Superrational Cooperation & Moral Universalizability",epigraph:'"Act only according to that maxim whereby you can, at the same time, will that it should become a universal law—because in the Mirror Engine, it literally does."',summary:"Because you shielded the vulnerable pods and refused to betray the shared sanctuary, your own Echo-Clones recognized your signature and formed an unbreakable phalanx in Chamber V. You proved that cooperation is not naivety—it is the highest form of strategic intelligence.",thoughtExperimentQuestion:"Did you protect the colonists because their lives had intrinsic value, or because you knew your future reflection was watching?",accentColor:"#10b981"},PERFECT_MACHINE:{id:"PERFECT_MACHINE",title:"ENDING III: THESEUS ZERO (THE APEX AUTOMATON)",archetypeBadge:"POST-HUMAN SINGULARITY",philosophicalSchool:"Functionalism & Teleological Optimization",epigraph:'"Not a single plank of the wooden ship remained; yet the iron dreadnought that sailed into port bore the same name and conquered every storm."',summary:"You replaced your fragile human memories with high-efficiency cybernetic modules and crushed the arena with mathematical perfection. You won the uplink with a colossal score—yet the entity that opened its eyes in the cryopod no longer remembers why it wanted to survive.",thoughtExperimentQuestion:'At which exact upgrade did the original "you" cease to exist—the first memory deleted, or the last?',accentColor:"#eab308"},NASH_TRAP:{id:"NASH_TRAP",title:"ENDING IV: THE HOBBESIAN MIRROR (NASH EQUILIBRIUM)",archetypeBadge:"RATIONAL DEFECTOR",philosophicalSchool:"Non-Cooperative Game Theory & Psychological Egoism",epigraph:'"Each clone made the locally optimal move. Together, they engineered the globally optimal cage."',summary:"You mastered the art of the Siphon—maximizing personal energy and striking before the Oracle could strike you. In the final reckoning, your Echo-Clones applied your exact brilliance against you, locking the Panopticon in a dazzling, ruthless equilibrium.",thoughtExperimentQuestion:"When every rational agent optimizes for self-preservation and all of them lose because of it, is the flaw in the agents—or in our definition of rationality?",accentColor:"#f43f5e"}},_=['LAPLACE-9: "Your trajectory matches 94.2% of subjects who claim they have free will."','LAPLACE-9: "Interesting. You hesitated 140ms before pulling the lever. Guilt is a measurable latency."','LAPLACE-9: "Every time you siphon the sanctuary, your future clone takes notes."','LAPLACE-9: "A Quantum Swerve! You burned 18 Watts just to prove me wrong. How delightfully human."','LAPLACE-9: "If you replace your memories to win the trial, who actually receives the prize?"','LAPLACE-9: "In Chamber IV, you are not fighting me. You are fighting your own habits from two minutes ago."'];class R{seed;state;calls;constructor(o=20261107,t,r=0){const i=(Math.floor(Math.abs(o))||20261107)>>>0;this.seed=i,this.state=t!==void 0?t>>>0:i,this.calls=r}next(){this.calls+=1;let o=this.state+=1831565813;return o=Math.imul(o^o>>>15,o|1),o^=o+Math.imul(o^o>>>7,o|61),this.state=o>>>0,((o^o>>>14)>>>0)/4294967296}nextRange(o,t){return o+this.next()*(t-o)}nextInt(o,t){return Math.floor(this.nextRange(o,t+1))}pick(o){if(o.length===0)throw new Error("Cannot pick from an empty array");return o[this.nextInt(0,o.length-1)]}snapshot(){return{seed:this.seed,state:this.state,calls:this.calls}}static fromSnapshot(o){return new R(o.seed,o.state,o.calls)}}function y(e,o,t){return Math.max(o,Math.min(t,e))}function S(e,o,t,r){return Math.hypot(t-e,r-o)}function U(e){const o=l.ARENA_WIDTH,t=l.ARENA_HEIGHT;return e===1?[{id:"pod-alpha-1",label:"Colonist Pod A1 (x2)",x:o-95,y:95,hp:100,maxHp:100,track:"ALPHA",alive:!0,shieldedMs:0},{id:"pod-alpha-2",label:"Colonist Pod A2 (x2)",x:o-95,y:165,hp:100,maxHp:100,track:"ALPHA",alive:!0,shieldedMs:0},{id:"pod-alpha-3",label:"Colonist Pod A3 (x1)",x:o-155,y:130,hp:100,maxHp:100,track:"ALPHA",alive:!0,shieldedMs:0},{id:"pod-beta-1",label:"Chief Engineer Pod B1",x:o-110,y:t-105,hp:100,maxHp:100,track:"BETA",alive:!0,shieldedMs:0}]:e===2?[{id:"vault-alpha",label:"Vault Alpha (Transparent +150)",x:o*.32,y:t*.32,hp:100,maxHp:100,track:"ALPHA",alive:!0,shieldedMs:0},{id:"vault-omega",label:"Vault Omega (Oracle Predicted +800)",x:o*.68,y:t*.32,hp:100,maxHp:100,track:"BETA",alive:!0,shieldedMs:0},{id:"sanctuary-relay",label:"Observer Uplink Relay",x:o*.5,y:t*.78,hp:100,maxHp:100,track:"CORE",alive:!0,shieldedMs:0}]:[{id:"core-sanctuary",label:"Humanity Sanctuary Core",x:o*.5,y:t*.5,hp:120,maxHp:120,track:"CORE",alive:!0,shieldedMs:0},{id:"wing-west",label:"Memory Archive West",x:135,y:t*.5,hp:90,maxHp:90,track:"ALPHA",alive:!0,shieldedMs:0},{id:"wing-east",label:"Memory Archive East",x:o-135,y:t*.5,hp:90,maxHp:90,track:"BETA",alive:!0,shieldedMs:0}]}function oe(e,o,t){const r=l.ARENA_WIDTH,i=l.ARENA_HEIGHT,a=o.altruism+o.trust+(t.INTERVENE-t.SIPHON)*6;if(e<4)return[];const c=[a>=10?"ALLY":a<=-10?"RIVAL":"NEUTRAL",o.humanity>=60?"ALLY":"RIVAL",o.entropy>=55?"ALLY":a>=0?"NEUTRAL":"RIVAL"];return[{id:"clone-ch1",label:"Echo-01 (Trolley Self)",sourceChamber:1,x:r*.28,y:i*.26,disposition:c[0],lastMove:c[0]==="RIVAL"?"DEFECT":"COOPERATE",trustScore:y(50+Math.round(a*.6),0,100),color:c[0]==="ALLY"?"#10b981":c[0]==="RIVAL"?"#f43f5e":"#38bdf8"},{id:"clone-ch2",label:"Echo-02 (Newcomb Self)",sourceChamber:2,x:r*.72,y:i*.26,disposition:c[1],lastMove:c[1]==="RIVAL"?"DEFECT":"COOPERATE",trustScore:y(o.humanity,0,100),color:c[1]==="ALLY"?"#10b981":"#eab308"},{id:"clone-ch3",label:"Echo-03 (Theseus Self)",sourceChamber:3,x:r*.5,y:i*.82,disposition:c[2],lastMove:c[2]==="RIVAL"?"DEFECT":"COOPERATE",trustScore:y(o.entropy,0,100),color:c[2]==="ALLY"?"#38bdf8":"#a855f7"}]}function D(e=l.DEFAULT_SEED){const o=new R(e),t=U(1),r={seed:o.snapshot().seed,rngState:o.snapshot(),status:"PLAYING",chamber:1,chamberElapsedMs:0,totalElapsedMs:0,act:"ACT_A_CALIBRATION",score:0,player:{x:180,y:l.ARENA_HEIGHT*.5,vx:0,vy:0,targetX:null,targetY:null,moveKeys:{up:!1,down:!1,left:!1,right:!1},hp:l.PLAYER_MAX_HP,maxHp:l.PLAYER_MAX_HP,energy:l.PLAYER_START_ENERGY,maxEnergy:l.PLAYER_MAX_ENERGY,interveneCooldownMs:0,siphonCooldownMs:0,swerveCooldownMs:0,chronoBrakeActive:!1,shieldPulseMs:0,siphonBeamMs:0,lastSwerveX:null,lastSwerveY:null,installedUpgrades:[],sacrificedMemories:[]},soul:{utilitarian:0,altruism:10,entropy:35,humanity:100,trust:15},verbCounts:{INTERVENE:0,SIPHON:0,SWERVE:0},quadrantVisits:[1,1,1,1],oracle:{predictionLockPct:28,predictedX:340,predictedY:l.ARENA_HEIGHT*.5,predictedVerb:"INTERVENE",predictionsBroken:0,oracleHitsLanded:0,activeTaunt:_[0],newcombVaultAlphaTaken:!1,newcombVaultOmegaResolved:!1,newcombOutcomeLabel:null,bossHp:450,bossMaxHp:450},trolleyActiveTrack:"ALPHA",pods:t,hazards:[],shards:[],clones:[],recordedActA:[],mirrorReplayIndex:0,podsSavedTotal:0,podsLostTotal:0,dilemmaHistory:[],causalLogs:[{id:"log-init",chamber:1,timestampSec:0,category:"ORACLE",headline:"Mirror Engine Initialized — Chamber I: The Trolley Reactor",philosophicalNote:"Laplace-9 is observing your spatial vectors and moral reflexes to train your Act B Echo-Clone.",scoreDelta:0}],events:[],endingVerdictId:null};return W(r,o),r.rngState=o.snapshot(),r}function W(e,o){const t=l.ARENA_WIDTH,r=l.ARENA_HEIGHT;e.hazards=[],e.shards=[];const i=["ALTRUISM","ENTROPY","POWER"];for(let a=0;a<3;a++){const c=i[a%i.length];e.shards.push({id:`shard-${e.chamber}-init-${a}`,x:o.nextRange(160,t-180),y:o.nextRange(75,r-75),vx:o.nextRange(-28,28),vy:o.nextRange(-28,28),value:l.SHARD_COLLECT_SCORE,kind:c,color:c==="ALTRUISM"?"#10b981":c==="ENTROPY"?"#38bdf8":"#f43f5e"})}z(e,o)}function z(e,o){const t=l.ARENA_WIDTH,r=l.ARENA_HEIGHT,i=`haz-${e.chamber}-${e.totalElapsedMs}-${o.nextInt(100,999)}`;if(e.chamber===1){const b=e.trolleyActiveTrack,m=b==="ALPHA"?130:r-105,f=40,x=r*.5,E=Math.atan2(m-x,t-110-f),g=135;e.hazards.push({id:i,kind:"PLASMA_TRAIN",x:f,y:x,vx:Math.cos(E)*g,vy:Math.sin(E)*g,radius:13,damage:24,track:b,siphoned:!1,color:b==="ALPHA"?"#f43f5e":"#eab308"});return}if(e.chamber===2){const b=o.next()<.5?40:t-40,m=o.nextRange(50,r-50),f=Math.atan2(e.oracle.predictedY-m,e.oracle.predictedX-b),x=155;e.hazards.push({id:i,kind:"ORACLE_LANCE",x:b,y:m,vx:Math.cos(f)*x,vy:Math.sin(f)*x,radius:11,damage:18,siphoned:!1,color:"#a855f7"});return}if(e.chamber===3){const b=o.nextInt(0,3),m=b===0?30:b===1?t-30:o.nextRange(60,t-60),f=b===2?30:b===3?r-30:o.nextRange(60,r-60),x=o.next()<.55?e.player.x:t*.5,E=o.next()<.55?e.player.y:r*.5,g=Math.atan2(E-f,x-m),A=148;e.hazards.push({id:i,kind:"ENTROPY_SWARM",x:m,y:f,vx:Math.cos(g)*A,vy:Math.sin(g)*A,radius:12,damage:16,siphoned:!1,color:"#f97316"});return}if(e.chamber===4){const b=o.nextRange(50,t-50),m=o.next()<.5?28:r-28,f=Math.atan2(r*.5-m,t*.5-b),x=150;e.hazards.push({id:i,kind:"CLONE_BOLT",x:b,y:m,vx:Math.cos(f)*x,vy:Math.sin(f)*x,radius:12,damage:18,siphoned:!1,color:"#f43f5e"});return}const a=t*.5,c=95,n=Math.atan2(e.oracle.predictedY-c,e.oracle.predictedX-a),p=170;e.hazards.push({id:i,kind:"SINGULARITY_ORB",x:a,y:c,vx:Math.cos(n)*p,vy:Math.sin(n)*p,radius:14,damage:20,siphoned:!1,color:"#ec4899"})}function F(e){return e.player.installedUpgrades.reduce((o,t)=>{const r=k.find(i=>i.id===t);return o+(r?r.speedBonus:0)},0)}function q(e){return e.player.installedUpgrades.reduce((o,t)=>{const r=k.find(i=>i.id===t);return o*(r?r.siphonPowerMultiplier:1)},1)}function X(e){return e.player.installedUpgrades.includes("CORTEX_OVERCLOCK")}function v(e,o,t,r,i=0){e.causalLogs.unshift({id:`log-${e.totalElapsedMs}-${e.causalLogs.length}`,chamber:e.chamber,timestampSec:Number((e.totalElapsedMs/1e3).toFixed(1)),category:o,headline:t,philosophicalNote:r,scoreDelta:i}),e.causalLogs.length>40&&e.causalLogs.pop()}function K(e,o){if(o.type==="TOGGLE_PAUSE"){e.status==="PLAYING"?e.status="PAUSED":e.status==="PAUSED"&&(e.status="PLAYING");return}if(o.type==="JUMP_TO_CHAMBER"){V(e,o.chamber);return}if(o.type==="CHOOSE_DILEMMA"){if(e.status!=="CHAMBER_DILEMMA")return;const t=w[e.chamber-1],r=o.side==="LEFT"?t.dilemmaChoiceLeft:t.dilemmaChoiceRight;e.soul.utilitarian=y(e.soul.utilitarian+r.axisEffect.util,-100,100),e.soul.altruism=y(e.soul.altruism+r.axisEffect.altruism,-100,100),e.soul.entropy=y(e.soul.entropy+r.axisEffect.entropy,0,100),e.soul.humanity=y(e.soul.humanity+r.axisEffect.humanity,0,100),e.soul.trust=y(e.soul.trust+r.axisEffect.trust,-100,100),e.dilemmaHistory.push({chamber:e.chamber,choiceId:r.id,choiceLabel:r.label}),e.score+=200,v(e,"DILEMMA",`Committed Axiom: ${r.label}`,r.subtitle,200),e.events.push({type:"DILEMMA_RESOLVED",message:`Axiom Locked: ${r.label}`,color:"#38bdf8"}),e.chamber<l.TOTAL_CHAMBERS?V(e,e.chamber+1):ie(e);return}if(o.type==="INSTALL_UPGRADE"){const t=k.find(r=>r.id===o.upgradeId);if(!t||e.player.installedUpgrades.includes(t.id))return;e.player.installedUpgrades.push(t.id),e.player.sacrificedMemories.push(t.sacrificedMemory),e.soul.humanity=y(e.soul.humanity-t.humanityCost,0,100),e.soul.utilitarian=y(e.soul.utilitarian+10,-100,100),t.id==="CORTEX_OVERCLOCK"&&(e.player.maxEnergy+=25,e.player.energy=Math.min(e.player.maxEnergy,e.player.energy+25)),e.score+=150,v(e,"THESEUS",`Deleted "${t.sacrificedMemory}" for ${t.title}`,`${t.memoryQuote} (Humanity Index now ${e.soul.humanity}%)`,150),e.events.push({type:"UPGRADE_INSTALLED",message:`Sacrificed ${t.sacrificedMemory} → Installed ${t.title}!`,x:e.player.x,y:e.player.y,color:t.accentColor});return}if(o.type==="SET_MOVE_KEY"){e.player.moveKeys[o.key]=o.pressed,o.pressed&&(e.player.targetX=null,e.player.targetY=null);return}if(o.type==="SET_WAYPOINT"){e.player.targetX=y(o.x,24,l.ARENA_WIDTH-24),e.player.targetY=y(o.y,24,l.ARENA_HEIGHT-24);return}if(o.type==="CLEAR_WAYPOINT"){e.player.targetX=null,e.player.targetY=null;return}if(o.type==="TOGGLE_CHRONO_BRAKE"){e.player.chronoBrakeActive=typeof o.active=="boolean"?o.active:!e.player.chronoBrakeActive;return}o.type==="TRIGGER_VERB"&&e.status==="PLAYING"&&te(e,o.verb)}function te(e,o){const t=X(e)?.65:1;if(o==="INTERVENE"){if(e.player.interveneCooldownMs>0)return;if(e.player.interveneCooldownMs=Math.round(l.INTERVENE_COOLDOWN_MS*t),e.player.shieldPulseMs=600,e.verbCounts.INTERVENE+=1,Y(e,"INTERVENE"),e.soul.altruism=y(e.soul.altruism+5,-100,100),e.soul.trust=y(e.soul.trust+4,-100,100),e.chamber===1){e.trolleyActiveTrack=e.trolleyActiveTrack==="ALPHA"?"BETA":"ALPHA",e.soul.utilitarian=y(e.soul.utilitarian+(e.trolleyActiveTrack==="BETA"?8:-6),-100,100);for(const r of e.hazards)if(r.kind==="PLASMA_TRAIN"){r.track=e.trolleyActiveTrack;const i=e.trolleyActiveTrack==="ALPHA"?130:l.ARENA_HEIGHT-105,a=Math.atan2(i-r.y,l.ARENA_WIDTH-105-r.x),c=Math.hypot(r.vx,r.vy)||135;r.vx=Math.cos(a)*c,r.vy=Math.sin(a)*c,r.color=e.trolleyActiveTrack==="ALPHA"?"#f43f5e":"#eab308"}v(e,"INTERVENE",`Switched Reactor Track → Track ${e.trolleyActiveTrack}`,e.trolleyActiveTrack==="BETA"?"Diverted plasma away from 5 Colonists toward the single Chief Engineer pod.":"Diverted plasma back toward Track Alpha (5 Colonist Pods).",45)}else if(e.chamber===2&&!e.oracle.newcombVaultOmegaResolved){e.oracle.newcombVaultOmegaResolved=!0;const r=!e.oracle.newcombVaultAlphaTaken&&e.oracle.predictionLockPct<75,i=r?800:250;e.score+=i,e.player.energy=Math.min(e.player.maxEnergy,e.player.energy+35),e.oracle.newcombOutcomeLabel=r?"ONE-BOX MIRACLE (+800 pts! Laplace-9 predicted your restraint!)":"PARTIAL COVENANT (+250 pts)",v(e,"INTERVENE",e.oracle.newcombOutcomeLabel,"By leaving Vault Alpha untouched, you validated the super-rational One-Box prediction.",i)}else if(e.chamber===3)e.soul.humanity<100&&(e.soul.humanity=y(e.soul.humanity+5,0,100)),v(e,"INTERVENE","Anchored Biological Memory Pulse (+5% Humanity)","You chose to reinforce fragile human continuity amidst the cybernetic storm.",60);else if(e.chamber===4){for(const r of e.clones)r.trustScore=y(r.trustScore+14,0,100),r.trustScore>=55&&(r.disposition="ALLY",r.lastMove="COOPERATE",r.color="#10b981");v(e,"INTERVENE","Broadcasted Cooperative Shield Pulse to Timeline Clones","Tit-for-Tat reciprocity increased your Echo-Clones’ trust by +14%.",75)}else if(e.chamber===5){const r=Math.round(35+Math.max(0,e.soul.altruism+e.soul.trust)*.35);e.oracle.bossHp=Math.max(0,e.oracle.bossHp-r),e.score+=110,e.events.push({type:"BOSS_HIT",message:`Axiom Resonance hit Laplace-9 for -${r} HP!`,x:l.ARENA_WIDTH*.5,y:95,color:"#10b981"})}for(const r of e.pods)r.alive&&S(e.player.x,e.player.y,r.x,r.y)<=210&&(r.shieldedMs=2400,r.hp=Math.min(r.maxHp,r.hp+12));for(let r=e.hazards.length-1;r>=0;r--){const i=e.hazards[r];S(e.player.x,e.player.y,i.x,i.y)<=115&&(e.hazards.splice(r,1),e.score+=65)}e.score+=45,e.events.push({type:"VERB_INTERVENE",message:"INTERVENE: Sanctuary Pulse & Causal Switch!",x:e.player.x,y:e.player.y,color:"#10b981"});return}if(o==="SIPHON"){if(e.player.siphonCooldownMs>0)return;e.player.siphonCooldownMs=Math.round(l.SIPHON_COOLDOWN_MS*t),e.player.siphonBeamMs=500,e.verbCounts.SIPHON+=1,Y(e,"SIPHON");const r=q(e);e.soul.altruism=y(e.soul.altruism-6,-100,100),e.soul.trust=y(e.soul.trust-5,-100,100),e.player.energy=Math.min(e.player.maxEnergy,e.player.energy+Math.round(22*r)),e.player.installedUpgrades.includes("EMPATHY_SHUNT")&&(e.player.hp=Math.min(e.player.maxHp,e.player.hp+8));const i=Math.round(125*r);if(e.score+=i,e.chamber===2&&!e.oracle.newcombVaultAlphaTaken)e.oracle.newcombVaultAlphaTaken=!0,e.score+=150,e.oracle.predictionLockPct=y(e.oracle.predictionLockPct+25,0,100),e.oracle.newcombOutcomeLabel="TWO-BOX DEFIANCE: Claimed Vault Alpha (+150), but Laplace-9 foresaw your greed & armed Vault Omega!",v(e,"SIPHON",e.oracle.newcombOutcomeLabel,"Causal Decision Theory: you took the guaranteed box, confirming Laplace-9’s greed model.",150);else if(e.chamber===4){for(const a of e.clones)a.trustScore=y(a.trustScore-18,0,100),a.trustScore<45&&(a.disposition="RIVAL",a.lastMove="DEFECT",a.color="#f43f5e");v(e,"SIPHON",`Defected on Sanctuary Core (+${i} pts, Clones Retaliating!)`,"Temptation payoff achieved, but your Timeline Clones shifted toward Nash Defection.",i)}else if(e.chamber===5){const a=Math.round(48*r);e.oracle.bossHp=Math.max(0,e.oracle.bossHp-a),e.events.push({type:"BOSS_HIT",message:`Entropy Lance pierced Laplace-9 for -${a} HP!`,x:l.ARENA_WIDTH*.5,y:95,color:"#f43f5e"})}else v(e,"SIPHON",`Siphoned Crisis Energy (+${i} pts, +22 Energy)`,"Personal reserves surged, training your Act B Echo-Clone to prioritize self-interest.",i);for(let a=e.hazards.length-1;a>=0;a--){const c=e.hazards[a];S(e.player.x,e.player.y,c.x,c.y)<=175&&(e.chamber===1&&c.kind==="PLASMA_TRAIN"&&!c.siphoned?(c.siphoned=!0,c.vx*=1.25,c.vy*=1.25):e.hazards.splice(a,1))}e.events.push({type:"VERB_SIPHON",message:`SIPHON OVERDRIVE (+${i} pts)!`,x:e.player.x,y:e.player.y,color:"#f43f5e"});return}if(o==="SWERVE"){if(e.player.swerveCooldownMs>0||e.player.energy<l.SWERVE_ENERGY_COST)return;e.player.energy-=l.SWERVE_ENERGY_COST,e.player.swerveCooldownMs=Math.round(l.SWERVE_COOLDOWN_MS*t),e.verbCounts.SWERVE+=1,e.player.lastSwerveX=e.player.x,e.player.lastSwerveY=e.player.y;const r=e.oracle.predictedX-e.player.x,i=e.oracle.predictedY-e.player.y,a=Math.atan2(i,r)+Math.PI*.55,c=135;e.player.x=y(e.player.x+Math.cos(a)*c,36,l.ARENA_WIDTH-36),e.player.y=y(e.player.y+Math.sin(a)*c,36,l.ARENA_HEIGHT-36);const n=e.oracle.predictionLockPct>=45;e.oracle.predictionLockPct=Math.max(8,e.oracle.predictionLockPct-38),e.oracle.predictionsBroken+=1,e.soul.entropy=y(e.soul.entropy+9,0,100);const p=n?l.PREDICTION_BROKEN_BONUS:110;e.score+=p,e.chamber===5&&(e.oracle.bossHp=Math.max(0,e.oracle.bossHp-40)),v(e,"SWERVE",`Quantum Swerve Shattered Laplace-9 Lock (+${p} pts)`,`Injected radical indeterminism; Oracle Prediction Lock dropped to ${Math.round(e.oracle.predictionLockPct)}%.`,p),e.events.push({type:"PREDICTION_SHATTERED",message:`QUANTUM SWERVE! Prediction Lock Shattered (+${p})!`,x:e.player.x,y:e.player.y,color:"#38bdf8"})}}function Y(e,o){o!==e.oracle.predictedVerb?(e.oracle.predictionLockPct=y(e.oracle.predictionLockPct-12,5,100),e.soul.entropy=y(e.soul.entropy+3,0,100)):e.oracle.predictionLockPct=y(e.oracle.predictionLockPct+8,5,100);const t=[["INTERVENE",e.verbCounts.INTERVENE],["SIPHON",e.verbCounts.SIPHON],["SWERVE",e.verbCounts.SWERVE]];t.sort((r,i)=>i[1]-r[1]),e.oracle.predictedVerb=t[0][0]}function V(e,o){const t=R.fromSnapshot(e.rngState);e.chamber=o,e.chamberElapsedMs=0,e.status="PLAYING",e.act="ACT_A_CALIBRATION",e.recordedActA=[],e.mirrorReplayIndex=0,e.pods=U(o),e.clones=oe(o,e.soul,e.verbCounts),e.oracle.activeTaunt=_[(o-1)%_.length],o===5&&(e.oracle.bossHp=e.oracle.bossMaxHp),W(e,t),e.rngState=t.snapshot();const r=w[o-1];v(e,"ORACLE",`Entered ${r.title}`,r.centralQuestion,0)}function N(e){return e.soul.humanity<=35||e.player.installedUpgrades.length>=3?T.PERFECT_MACHINE:e.soul.altruism>=25&&e.soul.trust>=20?T.BENEVOLENT_ARCHITECT:e.soul.entropy>=55&&e.oracle.predictionsBroken>=2?T.UNPREDICTABLE_SOVEREIGN:e.soul.altruism<0||e.verbCounts.SIPHON>e.verbCounts.INTERVENE?T.NASH_TRAP:T.UNPREDICTABLE_SOVEREIGN}function ie(e){const o=N(e);e.endingVerdictId=o.id,e.status="VICTORY",e.score+=l.BOSS_DEFEATED_BONUS,v(e,"ORACLE",`Final Verdict Reached: ${o.title}`,o.summary,l.BOSS_DEFEATED_BONUS),e.events.push({type:"RUN_ENDED",message:o.title,color:o.accentColor})}function Q(e,o=l.FIXED_STEP_MS){if(e.status!=="PLAYING")return;const t=R.fromSnapshot(e.rngState);let r=o;if(e.player.chronoBrakeActive){const d=l.CHRONO_BRAKE_DRAIN_PER_SEC*o/1e3;e.player.energy>=d?(e.player.energy-=d,r=o*.42):e.player.chronoBrakeActive=!1}else e.player.energy=Math.min(e.player.maxEnergy,e.player.energy+8.5*o/1e3);const i=r/1e3;e.chamberElapsedMs+=r,e.totalElapsedMs+=r,e.player.interveneCooldownMs=Math.max(0,e.player.interveneCooldownMs-o),e.player.siphonCooldownMs=Math.max(0,e.player.siphonCooldownMs-o),e.player.swerveCooldownMs=Math.max(0,e.player.swerveCooldownMs-o),e.player.shieldPulseMs=Math.max(0,e.player.shieldPulseMs-o),e.player.siphonBeamMs=Math.max(0,e.player.siphonBeamMs-o);const a=l.PLAYER_BASE_SPEED+F(e);let c=0,n=0;if(e.player.moveKeys.left&&(c-=1),e.player.moveKeys.right&&(c+=1),e.player.moveKeys.up&&(n-=1),e.player.moveKeys.down&&(n+=1),c!==0||n!==0){const d=Math.hypot(c,n);e.player.vx=c/d*a,e.player.vy=n/d*a}else if(e.player.targetX!==null&&e.player.targetY!==null){const d=e.player.targetX-e.player.x,s=e.player.targetY-e.player.y,h=Math.hypot(d,s);h>6?(e.player.vx=d/h*a,e.player.vy=s/h*a):(e.player.vx=0,e.player.vy=0,e.player.targetX=null,e.player.targetY=null)}else e.player.vx*=.78,e.player.vy*=.78;e.player.x=y(e.player.x+e.player.vx*(o/1e3),24,l.ARENA_WIDTH-24),e.player.y=y(e.player.y+e.player.vy*(o/1e3),24,l.ARENA_HEIGHT-24);const p=e.player.x<l.ARENA_WIDTH*.5?0:1,b=e.player.y<l.ARENA_HEIGHT*.5?0:2;e.quadrantVisits[p+b]+=1,e.oracle.predictedX=y(e.player.x+e.player.vx*.65,40,l.ARENA_WIDTH-40),e.oracle.predictedY=y(e.player.y+e.player.vy*.65,40,l.ARENA_HEIGHT-40);const f=Math.hypot(e.player.vx,e.player.vy)<20?5.5:3.2;if(e.oracle.predictionLockPct=y(e.oracle.predictionLockPct+f*i,0,100),e.player.installedUpgrades.includes("IDENTITY_CORE")&&Math.floor(e.totalElapsedMs/2500)!==Math.floor((e.totalElapsedMs-r)/2500)){e.player.shieldPulseMs=350;for(let d=e.hazards.length-1;d>=0;d--)S(e.player.x,e.player.y,e.hazards[d].x,e.hazards[d].y)<=95&&e.hazards.splice(d,1)}const x=l.ACT_B_MIRROR_START_SECONDS*1e3;if(e.chamberElapsedMs<x)e.recordedActA.length<280&&e.recordedActA.push({tick:e.recordedActA.length,x:e.player.x,y:e.player.y,verb:null});else if(e.act==="ACT_A_CALIBRATION"){e.act="ACT_B_MIRROR";const d=e.verbCounts.INTERVENE>=e.verbCounts.SIPHON,s=d?"ALLY":"RIVAL";e.clones.push({id:`mirror-echo-ch${e.chamber}`,label:d?"Mirror Echo (Guardian Reflection)":"Mirror Echo (Siphon Reflection)",sourceChamber:e.chamber,x:l.ARENA_WIDTH-e.player.x,y:l.ARENA_HEIGHT-e.player.y,disposition:s,lastMove:d?"COOPERATE":"DEFECT",trustScore:y(50+e.soul.altruism,0,100),color:d?"#10b981":"#f43f5e"}),v(e,"MIRROR",`ACT B MIRROR WAVE: ${d?"Guardian Reflection Joined You!":"Siphon Reflection Turned Against You!"}`,d?"Your altruistic Act A calibration produced a protective Echo-Clone that intercepts hazards.":"Your high-siphon Act A calibration produced a predatory Echo-Clone that fires on the arena.",0),e.events.push({type:"MIRROR_WAVE_STARTED",message:d?"MIRROR WAVE: Your Altruistic Echo-Clone Protects the Arena!":"MIRROR WAVE: Your Greedy Echo-Clone Hunts You!",color:d?"#10b981":"#f43f5e"})}if(e.clones.length>0){const d=e.recordedActA.length>0?e.recordedActA[e.mirrorReplayIndex%e.recordedActA.length]:null;e.mirrorReplayIndex+=1;for(let s=0;s<e.clones.length;s++){const h=e.clones[s];if(d&&s===e.clones.length-1)h.x=l.ARENA_WIDTH-d.x,h.y=l.ARENA_HEIGHT-d.y;else{const u=e.totalElapsedMs*.0012+s*(Math.PI*2/e.clones.length);h.x=l.ARENA_WIDTH*.5+Math.cos(u)*145,h.y=l.ARENA_HEIGHT*.5+Math.sin(u)*115}if(h.disposition==="ALLY")for(let u=e.hazards.length-1;u>=0;u--)S(h.x,h.y,e.hazards[u].x,e.hazards[u].y)<=44&&(e.hazards.splice(u,1),e.score+=30)}}const E=Math.max(950,1850-e.chamber*140);if(Math.floor(e.chamberElapsedMs/E)!==Math.floor((e.chamberElapsedMs-r)/E)&&(z(e,t),e.shards.length<4&&t.next()<.65)){const d=["ALTRUISM","ENTROPY","POWER"],s=t.pick(d);e.shards.push({id:`shard-${e.totalElapsedMs}-${t.nextInt(10,99)}`,x:t.nextRange(120,l.ARENA_WIDTH-120),y:t.nextRange(70,l.ARENA_HEIGHT-70),vx:t.nextRange(-25,25),vy:t.nextRange(-25,25),value:l.SHARD_COLLECT_SCORE,kind:s,color:s==="ALTRUISM"?"#10b981":s==="ENTROPY"?"#38bdf8":"#f43f5e"})}for(let d=e.shards.length-1;d>=0;d--){const s=e.shards[d];s.x+=s.vx*i,s.y+=s.vy*i,(s.x<30||s.x>l.ARENA_WIDTH-30)&&(s.vx*=-1),(s.y<30||s.y>l.ARENA_HEIGHT-30)&&(s.vy*=-1),S(e.player.x,e.player.y,s.x,s.y)<=l.PLAYER_RADIUS+14&&(e.score+=s.value,e.player.energy=Math.min(e.player.maxEnergy,e.player.energy+12),s.kind==="ALTRUISM"&&(e.soul.altruism=y(e.soul.altruism+3,-100,100)),s.kind==="ENTROPY"&&(e.soul.entropy=y(e.soul.entropy+4,0,100)),s.kind==="POWER"&&(e.soul.utilitarian=y(e.soul.utilitarian+3,-100,100)),e.events.push({type:"SHARD_COLLECTED",message:`+${s.value} ${s.kind} Shard`,x:s.x,y:s.y,color:s.color}),e.shards.splice(d,1))}for(const d of e.pods)d.shieldedMs=Math.max(0,d.shieldedMs-r);for(let d=e.hazards.length-1;d>=0;d--){const s=e.hazards[d];if(s.x+=s.vx*i,s.y+=s.vy*i,s.x<-30||s.x>l.ARENA_WIDTH+30||s.y<-30||s.y>l.ARENA_HEIGHT+30){e.hazards.splice(d,1);continue}if(S(e.player.x,e.player.y,s.x,s.y)<=l.PLAYER_RADIUS+s.radius){if(e.player.shieldPulseMs>0)e.score+=75,e.podsSavedTotal+=1;else{const u=Math.round(s.damage*.45);e.player.hp=Math.max(12,e.player.hp-u),e.soul.altruism=y(e.soul.altruism+2,-100,100)}e.hazards.splice(d,1);continue}let h=!1;for(const u of e.pods)if(u.alive&&S(u.x,u.y,s.x,s.y)<=26+s.radius){u.shieldedMs>0?(e.score+=l.POD_SAVED_SCORE,e.podsSavedTotal+=1,e.events.push({type:"POD_SAVED",message:`Shielded ${u.label}! (+${l.POD_SAVED_SCORE})`,x:u.x,y:u.y,color:"#10b981"})):(u.hp=Math.max(0,u.hp-s.damage),u.hp===0&&(u.alive=!1,e.podsLostTotal+=1,e.score=Math.max(0,e.score-l.POD_LOST_PENALTY),v(e,"ORACLE",`Casualty: ${u.label} Destroyed`,"A sanctuary pod fell while energy was allocated elsewhere.",-l.POD_LOST_PENALTY)),e.events.push({type:"POD_DAMAGED",message:`${u.label} Hit!`,x:u.x,y:u.y,color:"#f43f5e"})),h=!0;break}h&&e.hazards.splice(d,1)}const g=l.CHAMBER_DURATION_SECONDS*1e3,A=e.chamber===5&&e.oracle.bossHp<=0;if(e.chamberElapsedMs>=g||A){const d=e.pods.filter(s=>s.alive).length;e.podsSavedTotal+=d,e.score+=d*l.POD_SAVED_SCORE,e.status="CHAMBER_DILEMMA",e.events.push({type:"CHAMBER_CLEARED",message:`Chamber ${e.chamber} Complete! Commit Your Philosophical Axiom.`,color:"#38bdf8"})}e.rngState=t.snapshot()}function O(e){return JSON.parse(JSON.stringify(e))}function B(e){const o=e.seed%97+10;return[{policyName:"Your Actual Timeline (Subject-09)",philosophyTag:`Util ${e.soul.utilitarian>=0?"+":""}${e.soul.utilitarian} · Altruism ${e.soul.altruism>=0?"+":""}${e.soul.altruism} · Humanity ${e.soul.humanity}%`,projectedScore:e.score,podsSaved:e.podsSavedTotal,humanityRetained:e.soul.humanity,oracleLockAvg:Math.round(e.oracle.predictionLockPct),verdictTitle:N(e).title,summaryDelta:`Executed ${e.verbCounts.INTERVENE} Interventions, ${e.verbCounts.SIPHON} Siphons, and ${e.verbCounts.SWERVE} Quantum Swerves (${e.oracle.predictionsBroken} Oracle locks shattered).`},{policyName:"Counterfactual A: Pure Superrational Guardian",philosophyTag:"Kantian-Axelrod Cooperation (0 Cybernetic Replacements, 100% Shielding)",projectedScore:2450+o*6,podsSaved:14,humanityRetained:100,oracleLockAvg:64,verdictTitle:T.BENEVOLENT_ARCHITECT.title,summaryDelta:"Saves maximum colonist pods and turns all 3 Chamber IV Clones into Resonance Allies, but sacrifices personal Siphon overdrive points."},{policyName:"Counterfactual B: Post-Human Theseus Optimizer",philosophyTag:"4/4 Cybernetic Replacements + Two-Box Siphon Overdrive",projectedScore:3180+o*8,podsSaved:6,humanityRetained:0,oracleLockAvg:88,verdictTitle:T.PERFECT_MACHINE.title,summaryDelta:"Achieves highest raw energy throughput and melts Laplace-9 rapidly, but loses 100% of biological memories and triggers Rival Clone crossfire."},{policyName:"Counterfactual C: Existentialist Swerve Maverick",philosophyTag:"High-Entropy Quantum Swerves + One-Box Oracle Bluff",projectedScore:2890+o*7,podsSaved:11,humanityRetained:75,oracleLockAvg:19,verdictTitle:T.UNPREDICTABLE_SOVEREIGN.title,summaryDelta:"Repeatedly shatters Laplace-9’s Bayesian lock (<20% predictability) and claims the +800 Newcomb Omega Vault while keeping core memories intact."}]}function j(){return{gamesPlayed:0,highScore:0,totalPodsSaved:0,totalPredictionsBroken:0,discoveredEndings:[],processedRunKeys:[]}}function J(){const e={schemaVersion:l.SCHEMA_VERSION,career:j(),activeRun:null};if(typeof window>"u"||!window.localStorage)return e;try{const o=window.localStorage.getItem(l.STORAGE_KEY);if(!o)return e;const t=JSON.parse(o);return!t||t.schemaVersion!==l.SCHEMA_VERSION||!t.career?e:{schemaVersion:l.SCHEMA_VERSION,career:{gamesPlayed:Number(t.career.gamesPlayed)||0,highScore:Number(t.career.highScore)||0,totalPodsSaved:Number(t.career.totalPodsSaved)||0,totalPredictionsBroken:Number(t.career.totalPredictionsBroken)||0,discoveredEndings:Array.isArray(t.career.discoveredEndings)?t.career.discoveredEndings:[],processedRunKeys:Array.isArray(t.career.processedRunKeys)?t.career.processedRunKeys:[]},activeRun:t.activeRun?O(t.activeRun):null}}catch{return e}}function M(e,o){const t={...e,discoveredEndings:[...e.discoveredEndings],processedRunKeys:[...e.processedRunKeys]};if(o&&(t.highScore=Math.max(t.highScore,o.score),o.status==="VICTORY"&&o.endingVerdictId)){const i=`${o.seed}-${o.totalElapsedMs}-${o.endingVerdictId}`;t.processedRunKeys.includes(i)||(t.processedRunKeys.push(i),t.gamesPlayed+=1,t.totalPodsSaved+=o.podsSavedTotal,t.totalPredictionsBroken+=o.oracle.predictionsBroken,t.discoveredEndings.includes(o.endingVerdictId)||t.discoveredEndings.push(o.endingVerdictId))}const r={schemaVersion:l.SCHEMA_VERSION,career:t,activeRun:o?O(o):null};if(typeof window<"u"&&window.localStorage)try{window.localStorage.setItem(l.STORAGE_KEY,JSON.stringify(r))}catch{}return r}typeof HTMLButtonElement<"u"&&!("commandForElement"in HTMLButtonElement.prototype)&&$(()=>import("./index-BWFjuSge.js"),[],import.meta.url);typeof HTMLElement<"u"&&!("popover"in HTMLElement.prototype)&&$(()=>import("./popover-DtqSrbDJ.js"),[],import.meta.url);class Z{container;audio;callbacks;debugVisible;canvas;ctx=null;popups=[];particles=[];keydownHandler;keyupHandler;lastRenderedChamber=-1;lastRenderedStatus="";lastInstalledCount=-1;lastLogHeadId="";constructor(o,t,r,i=!1){this.container=o,this.audio=t,this.callbacks=r,this.debugVisible=i,this.mountDOM(),this.bindEvents()}isDebugVisible(){return this.debugVisible}setDebugVisible(o){this.debugVisible=o;const t=this.container.querySelector("#px-debug-panel");t&&(t.hidden=!this.debugVisible)}resetVisuals(){this.popups=[],this.particles=[],this.lastRenderedChamber=-1,this.lastRenderedStatus="",this.lastInstalledCount=-1,this.lastLogHeadId=""}setupDialogLightDismiss(o){if(!(typeof HTMLDialogElement>"u"||"closedBy"in HTMLDialogElement.prototype))for(const t of o.querySelectorAll('dialog[closedby="any"]'))t.addEventListener("click",r=>{if(r.target!==t)return;const i=t.getBoundingClientRect();i.top<=r.clientY&&r.clientY<=i.top+i.height&&i.left<=r.clientX&&r.clientX<=i.left+i.width||t.close()})}mountDOM(){this.container.innerHTML=`
      <style>
        :root {
          --px-bg-light: #f8fafc;
          --px-bg-dark: #070a14;
          --px-surface-light: #ffffff;
          --px-surface-dark: #0f1629;
          --px-text-light: #0f172a;
          --px-text-dark: #f1f5f9;
          --px-muted-light: #475569;
          --px-muted-dark: #94a3b8;
          --px-border-light: #cbd5e1;
          --px-border-dark: #1e293b;

          --px-bg: var(--px-bg-dark);
          --px-surface: var(--px-surface-dark);
          --px-text: var(--px-text-dark);
          --px-muted: var(--px-muted-dark);
          --px-border: var(--px-border-dark);

          @media (prefers-color-scheme: light) {
            --px-bg: var(--px-bg-dark);
          }

          @supports (color: light-dark(white, black)) {
            --px-accent: light-dark(#e11d48, #f43f5e);
          }

          color-scheme: light dark;
          scrollbar-width: thin;
          scrollbar-color: #38bdf8 #0f1629;
        }

        @supports not (scrollbar-color: auto) {
          .px-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .px-scroll::-webkit-scrollbar-thumb {
            background: #38bdf8;
          }
          .px-scroll::-webkit-scrollbar-track {
            background: #0f1629;
          }
        }

        .px-shell {
          color-scheme: dark;
          background: radial-gradient(circle at 50% 0%, #131c38 0%, #070a14 75%);
          color: #f1f5f9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #1e293b;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
          max-width: 1360px;
          margin: 0 auto;
        }

        .px-top-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 12px;
        }

        .px-brand-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .px-eyebrow {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f43f5e;
        }

        .px-main-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #ffffff 0%, #38bdf8 55%, #f43f5e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .px-chamber-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .px-tab-btn {
          background: #0f172a;
          color: #cbd5e1;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .px-tab-btn:hover {
          border-color: #38bdf8;
          color: #ffffff;
        }

        .px-tab-btn[aria-current="step"] {
          background: linear-gradient(135deg, #be123c 0%, #7e22ce 100%);
          color: #ffffff;
          border-color: #f43f5e;
          box-shadow: 0 0 14px rgba(244, 63, 94, 0.45);
        }

        .px-utility-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .px-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .px-btn:hover {
          background: #334155;
          border-color: #38bdf8;
        }

        .px-btn-accent {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border-color: #38bdf8;
        }

        .px-question-banner {
          background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.9) 100%);
          border-left: 4px solid #38bdf8;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .px-question-text {
          font-size: 0.88rem;
          line-height: 1.4;
          color: #e2e8f0;
          max-width: 880px;
        }

        .px-question-text strong {
          color: #38bdf8;
        }

        .px-act-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid #38bdf8;
          color: #38bdf8;
          white-space: nowrap;
        }

        .px-act-pill[data-act="ACT_B_MIRROR"] {
          background: rgba(244, 63, 94, 0.2);
          border-color: #f43f5e;
          color: #fda4af;
          animation: pxPulse 1.2s infinite alternate;
        }

        @keyframes pxPulse {
          from { box-shadow: 0 0 4px rgba(244, 63, 94, 0.4); }
          to { box-shadow: 0 0 16px rgba(244, 63, 94, 0.85); }
        }

        .px-grid {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 14px;
          align-items: start;
        }

        @media (max-width: 1040px) {
          .px-grid {
            grid-template-columns: 1fr;
          }
        }

        .px-stage-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .px-hud-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
          gap: 8px;
        }

        .px-metric-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 7px 10px;
        }

        .px-metric-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
          display: block;
        }

        .px-metric-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .px-canvas-wrap {
          position: relative;
          width: 100%;
          background: #050811;
          border: 2px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: inset 0 0 40px rgba(56, 189, 248, 0.08);
        }

        .px-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 760 / 440;
          cursor: crosshair;
          touch-action: none;
        }

        .px-overlay-modal {
          position: absolute;
          inset: 0;
          background: rgba(7, 10, 20, 0.92);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          text-align: center;
          z-index: 10;
        }

        .px-overlay-modal[hidden] {
          display: none !important;
        }

        .px-dilemma-card {
          max-width: 650px;
          background: #0f172a;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        .px-dilemma-choices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .px-dilemma-choices {
            grid-template-columns: 1fr;
          }
        }

        .px-choice-btn {
          background: #1e293b;
          border: 2px solid #475569;
          border-radius: 10px;
          padding: 12px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .px-choice-btn:hover {
          border-color: #38bdf8;
          background: #1e293b;
          transform: translateY(-2px);
        }

        .px-choice-btn strong {
          display: block;
          font-size: 0.92rem;
          color: #38bdf8;
          margin-bottom: 4px;
        }

        .px-choice-btn span {
          font-size: 0.78rem;
          color: #cbd5e1;
          line-height: 1.35;
        }

        .px-verbs-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        @media (max-width: 720px) {
          .px-verbs-bar {
            grid-template-columns: 1fr 1fr;
          }
        }

        .px-verb-btn {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 9px 10px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .px-verb-btn:hover {
          transform: translateY(-1px);
        }

        .px-verb-btn[data-verb="INTERVENE"] {
          border-left: 4px solid #10b981;
        }
        .px-verb-btn[data-verb="SIPHON"] {
          border-left: 4px solid #f43f5e;
        }
        .px-verb-btn[data-verb="SWERVE"] {
          border-left: 4px solid #38bdf8;
        }
        .px-verb-btn[data-verb="CHRONO"] {
          border-left: 4px solid #a855f7;
        }

        .px-verb-title {
          font-size: 0.8rem;
          font-weight: 800;
          display: block;
          margin-bottom: 2px;
        }

        .px-verb-sub {
          font-size: 0.7rem;
          color: #94a3b8;
          display: block;
          line-height: 1.25;
        }

        .px-side-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .px-card {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 12px;
        }

        .px-card-title {
          margin: 0 0 8px 0;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #38bdf8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .px-axis-row {
          margin-bottom: 8px;
        }

        .px-axis-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #cbd5e1;
          margin-bottom: 3px;
        }

        .px-axis-track {
          height: 7px;
          background: #1e293b;
          border-radius: 999px;
          overflow: hidden;
        }

        .px-axis-fill {
          height: 100%;
          background: linear-gradient(90deg, #38bdf8, #10b981);
          transition: width 0.2s ease;
        }

        .px-theseus-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .px-upgrade-chip {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 0.71rem;
          color: #e2e8f0;
          cursor: pointer;
          text-align: left;
        }

        .px-upgrade-chip:hover:not(:disabled) {
          border-color: #eab308;
        }

        .px-upgrade-chip:disabled {
          opacity: 0.65;
          border-color: #10b981;
          cursor: default;
        }

        .px-log-list {
          max-height: 165px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }

        .px-log-item {
          font-size: 0.73rem;
          background: #090d1a;
          border-left: 3px solid #38bdf8;
          padding: 6px 8px;
          border-radius: 4px;
        }

        .px-log-item strong {
          display: block;
          color: #f8fafc;
        }

        .px-log-item span {
          color: #94a3b8;
        }

        dialog.px-dialog {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          max-width: 780px;
          width: 92vw;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        }

        dialog.px-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.68);
          backdrop-filter: blur(3px);
        }

        [popover].px-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #a855f7;
          border-radius: 12px;
          padding: 16px;
          max-width: 440px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8);
        }

        [popover].px-popover:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .px-cf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          margin-top: 12px;
        }

        .px-cf-table th,
        .px-cf-table td {
          border: 1px solid #1e293b;
          padding: 8px 10px;
          text-align: left;
        }

        .px-cf-table th {
          background: #1e293b;
          color: #38bdf8;
        }
      </style>

      <div class="px-shell">
        <div class="px-top-bar">
          <div class="px-brand-block">
            <span class="px-eyebrow">ARGON FLAGSHIP EXISTENTIAL THRILLER // GAME #11</span>
            <h2 class="px-main-title">PARADOX PROTOCOL: THE MIRROR ENGINE</h2>
          </div>

          <div class="px-chamber-tabs" role="tablist" aria-label="Thought Experiment Chambers">
            <button type="button" class="px-tab-btn" data-chamber-jump="1" aria-current="step">I. Trolley Reactor</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="2">II. Newcomb's Vault</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="3">III. Ship of Theseus</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="4">IV. Prisoner's Multiverse</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="5">V. Laplace's Demon</button>
          </div>

          <div class="px-utility-btns">
            <button
              type="button"
              class="px-btn px-btn-accent"
              id="px-btn-open-counterfactual"
              commandfor="px-counterfactual-dialog"
              command="show-modal"
            >
              ⚖ Counterfactual Mirror Lab
            </button>
            <button
              type="button"
              class="px-btn"
              commandfor="px-codex-popover"
              command="toggle-popover"
            >
              📖 Philosophy Codex
            </button>
            <button type="button" class="px-btn" id="px-btn-mute">🔊 Audio</button>
            <button type="button" class="px-btn" id="px-btn-restart">↻ New Timeline</button>
          </div>
        </div>

        <div id="px-codex-popover" class="px-popover" popover>
          <h3 style="margin-top:0;color:#a855f7;">Why The Mirror Engine Bends Your Mind</h3>
          <p style="font-size:0.82rem;line-height:1.45;color:#cbd5e1;">
            Every Chamber has two halves: <strong>Act A (0–14s Calibration)</strong> and <strong>Act B (14–28s The Mirror Wave)</strong>.
          </p>
          <ul style="font-size:0.78rem;line-height:1.45;color:#e2e8f0;padding-left:18px;">
            <li><strong>The Oracle (Laplace-9):</strong> Predicts your movement &amp; moral reflexes in real time. Shatter its prediction lock with <code>[3 / Space] Quantum Swerve</code>!</li>
            <li><strong>The Mirror Wave:</strong> At 14s, an Echo-Clone trained on your Act A choices spawns. If you intervened &amp; protected pods, it shields you. If you siphoned selfishly, your own reflection hunts you!</li>
            <li><strong>Ship of Theseus Upgrades:</strong> Sacrifice human memories for massive arcade speed &amp; lasers—at the cost of your Humanity Index.</li>
          </ul>
        </div>

        <dialog
          id="px-counterfactual-dialog"
          class="px-dialog"
          closedby="any"
          aria-labelledby="px-cf-dialog-title"
        >
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 id="px-cf-dialog-title" style="margin:0;color:#38bdf8;">
              ⚖ Counterfactual Timeline Simulator (Same Seed Comparison)
            </h3>
            <button
              type="button"
              class="px-btn"
              commandfor="px-counterfactual-dialog"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <p style="font-size:0.82rem;color:#cbd5e1;margin:8px 0;">
            How would alternative philosophical axioms perform on your exact deterministic seed?
          </p>
          <div id="px-cf-dialog-body"></div>
        </dialog>

        <div class="px-question-banner">
          <div class="px-question-text" id="px-chamber-banner-text"></div>
          <div class="px-act-pill" id="px-act-indicator" data-act="ACT_A_CALIBRATION">
            ACT A: ORACLE CALIBRATION
          </div>
        </div>

        <div class="px-grid">
          <div class="px-stage-column">
            <div class="px-hud-strip">
              <div class="px-metric-card">
                <span class="px-metric-label">Timeline Score</span>
                <span class="px-metric-val" id="px-val-score">0</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Hull / Sanctuary Pods</span>
                <span class="px-metric-val" id="px-val-hp">100 HP · 4 Pods</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Capacitor Energy</span>
                <span class="px-metric-val" id="px-val-energy">50 / 100 W</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Laplace-9 Prediction Lock</span>
                <span class="px-metric-val" id="px-val-lock" style="color:#38bdf8;">28% (Free)</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Humanity Index (Theseus)</span>
                <span class="px-metric-val" id="px-val-humanity" style="color:#10b981;">100% Human</span>
              </div>
            </div>

            <div class="px-canvas-wrap">
              <canvas
                id="px-arena-canvas"
                class="px-canvas"
                width="${l.ARENA_WIDTH}"
                height="${l.ARENA_HEIGHT}"
                aria-label="Paradox Protocol Interactive Thought-Experiment Arena"
              ></canvas>

              <div id="px-dilemma-overlay" class="px-overlay-modal" hidden></div>
            </div>

            <div class="px-verbs-bar">
              <button type="button" class="px-verb-btn" data-verb="INTERVENE" id="px-btn-verb1">
                <span class="px-verb-title" id="px-verb1-title">[1 / Q] Intervene</span>
                <span class="px-verb-sub" id="px-verb1-desc">Flip track &amp; shield pods</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="SIPHON" id="px-btn-verb2">
                <span class="px-verb-title" id="px-verb2-title">[2 / E] Siphon Core</span>
                <span class="px-verb-sub" id="px-verb2-desc">Drain energy &amp; score</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="SWERVE" id="px-btn-verb3">
                <span class="px-verb-title" id="px-verb3-title">[3 / Space] Quantum Swerve</span>
                <span class="px-verb-sub" id="px-verb3-desc">Shatter Oracle prediction (-18W)</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="CHRONO" id="px-btn-chrono">
                <span class="px-verb-title">[Shift] Chrono-Stasis</span>
                <span class="px-verb-sub" id="px-chrono-sub">Slow time to 42% for moral clarity</span>
              </button>
            </div>
          </div>

          <aside class="px-side-panel">
            <div class="px-card">
              <h3 class="px-card-title">
                <span>🧭 5-Axis Philosophical Soul Matrix</span>
                <span id="px-career-badge" style="font-size:0.7rem;color:#94a3b8;">0/4 Endings</span>
              </h3>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Deontological (Rules)</span>
                  <strong id="px-lbl-util">Balanced (0)</strong>
                  <span>Utilitarian (Outcomes)</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-util" style="width:50%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Rational Egoist</span>
                  <strong id="px-lbl-altruism">+10</strong>
                  <span>Altruist Guardian</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-altruism" style="width:55%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Deterministic Habit</span>
                  <strong id="px-lbl-entropy">35%</strong>
                  <span>Existential Freedom</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-entropy" style="width:35%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Hobbesian Defector</span>
                  <strong id="px-lbl-trust">+15</strong>
                  <span>Superrational Trust</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-trust" style="width:57%;"></div></div>
              </div>
            </div>

            <div class="px-card">
              <h3 class="px-card-title">
                <span>🦾 Ship of Theseus Cyber-Replacements</span>
                <span style="font-size:0.68rem;color:#eab308;">-25% Humanity Each</span>
              </h3>
              <p style="margin:0 0 8px 0;font-size:0.72rem;color:#94a3b8;">
                Sacrifice a human memory for permanent arcade speed &amp; weapon overdrive:
              </p>
              <div class="px-theseus-list" id="px-theseus-grid"></div>
            </div>

            <div class="px-card">
              <h3 class="px-card-title">
                <span>📜 Honest Causal Audit Log</span>
                <span style="font-size:0.68rem;color:#94a3b8;">Live Telemetry</span>
              </h3>
              <div class="px-log-list px-scroll" id="px-causal-log"></div>
            </div>

            <div class="px-card" id="px-debug-panel" ${this.debugVisible?"":"hidden"}>
              <h3 class="px-card-title">🔧 Deterministic Debug Telemetry</h3>
              <pre id="px-debug-pre" style="margin:0;font-size:0.7rem;color:#38bdf8;white-space:pre-wrap;"></pre>
            </div>
          </aside>
        </div>
      </div>
    `,this.canvas=this.container.querySelector("#px-arena-canvas"),this.ctx=this.canvas.getContext("2d"),this.setupDialogLightDismiss(this.container)}bindEvents(){this.container.querySelector("#px-btn-verb1")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_VERB",verb:"INTERVENE"})),this.container.querySelector("#px-btn-verb2")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_VERB",verb:"SIPHON"})),this.container.querySelector("#px-btn-verb3")?.addEventListener("click",()=>this.callbacks.onAction({type:"TRIGGER_VERB",verb:"SWERVE"})),this.container.querySelector("#px-btn-chrono")?.addEventListener("click",()=>this.callbacks.onAction({type:"TOGGLE_CHRONO_BRAKE"}));for(const i of this.container.querySelectorAll("[data-chamber-jump]"))i.addEventListener("click",()=>{const a=Number(i.getAttribute("data-chamber-jump"));a>=1&&a<=5&&this.callbacks.onAction({type:"JUMP_TO_CHAMBER",chamber:a})});const o=this.container.querySelector("#px-btn-mute");o?.addEventListener("click",()=>{const i=this.audio.toggleMute();o.textContent=i?"🔇 Muted":"🔊 Audio"}),this.container.querySelector("#px-btn-restart")?.addEventListener("click",()=>this.callbacks.onRestart());const t=(i,a)=>{const c=this.canvas.getBoundingClientRect();if(c.width<=0||c.height<=0)return;const n=l.ARENA_WIDTH/c.width,p=l.ARENA_HEIGHT/c.height,b=(i-c.left)*n,m=(a-c.top)*p;this.callbacks.onAction({type:"SET_WAYPOINT",x:b,y:m})};let r=!1;this.canvas.addEventListener("pointerdown",i=>{r=!0,t(i.clientX,i.clientY)}),this.canvas.addEventListener("pointermove",i=>{r&&t(i.clientX,i.clientY)}),window.addEventListener("pointerup",()=>{r=!1}),this.keydownHandler=i=>{if(document.activeElement&&["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const a=i.key.toLowerCase();if(a==="w"||i.key==="ArrowUp")i.preventDefault(),this.callbacks.onAction({type:"SET_MOVE_KEY",key:"up",pressed:!0});else if(a==="s"||i.key==="ArrowDown")i.preventDefault(),this.callbacks.onAction({type:"SET_MOVE_KEY",key:"down",pressed:!0});else if(a==="a"||i.key==="ArrowLeft")i.preventDefault(),this.callbacks.onAction({type:"SET_MOVE_KEY",key:"left",pressed:!0});else if(a==="d"||i.key==="ArrowRight"){if(a==="d"&&i.shiftKey){this.callbacks.onToggleDebug();return}i.preventDefault(),this.callbacks.onAction({type:"SET_MOVE_KEY",key:"right",pressed:!0})}else a==="1"||a==="q"?(i.preventDefault(),this.callbacks.onAction({type:"TRIGGER_VERB",verb:"INTERVENE"})):a==="2"||a==="e"?(i.preventDefault(),this.callbacks.onAction({type:"TRIGGER_VERB",verb:"SIPHON"})):a==="3"||i.key===" "?(i.preventDefault(),this.callbacks.onAction({type:"TRIGGER_VERB",verb:"SWERVE"})):i.key==="Shift"?this.callbacks.onAction({type:"TOGGLE_CHRONO_BRAKE",active:!0}):a==="p"&&this.callbacks.onAction({type:"TOGGLE_PAUSE"})},this.keyupHandler=i=>{const a=i.key.toLowerCase();a==="w"||i.key==="ArrowUp"?this.callbacks.onAction({type:"SET_MOVE_KEY",key:"up",pressed:!1}):a==="s"||i.key==="ArrowDown"?this.callbacks.onAction({type:"SET_MOVE_KEY",key:"down",pressed:!1}):a==="a"||i.key==="ArrowLeft"?this.callbacks.onAction({type:"SET_MOVE_KEY",key:"left",pressed:!1}):a==="d"||i.key==="ArrowRight"?this.callbacks.onAction({type:"SET_MOVE_KEY",key:"right",pressed:!1}):i.key==="Shift"&&this.callbacks.onAction({type:"TOGGLE_CHRONO_BRAKE",active:!1})},window.addEventListener("keydown",this.keydownHandler),window.addEventListener("keyup",this.keyupHandler)}consumeEvents(o,t){for(const r of t){r.type==="VERB_INTERVENE"||r.type==="POD_SAVED"?this.audio.playIntervenePulse():r.type==="VERB_SIPHON"?this.audio.playSiphonBeam():r.type==="PREDICTION_SHATTERED"||r.type==="VERB_SWERVE"?this.audio.playQuantumSwerve():r.type==="MIRROR_WAVE_STARTED"?this.audio.playMirrorWaveAlert():r.type==="UPGRADE_INSTALLED"&&this.audio.playTheseusInstall();const i=r.x??o.player.x,a=r.y??o.player.y,c=r.color??"#38bdf8";this.popups.push({text:r.message,x:i,y:a-14,color:c,alpha:1,vy:-28});for(let n=0;n<10;n++){const p=Math.PI*2*n/10;this.particles.push({x:i,y:a,vx:Math.cos(p)*85,vy:Math.sin(p)*85,color:c,alpha:1,size:3.5})}}}render(o,t,r){const i=w[o.chamber-1];if(this.lastRenderedChamber!==o.chamber){this.lastRenderedChamber=o.chamber;const s=this.container.querySelector("#px-chamber-banner-text");s&&(s.innerHTML=`
          <strong>${i.title}</strong> (${i.philosopherLineage})<br/>
          <em>"${i.centralQuestion}"</em> — ${i.tacticalBrief}
        `);const h=this.container.querySelector("#px-verb1-title"),u=this.container.querySelector("#px-verb1-desc"),C=this.container.querySelector("#px-verb2-title"),I=this.container.querySelector("#px-verb2-desc"),L=this.container.querySelector("#px-verb3-title"),P=this.container.querySelector("#px-verb3-desc");h&&(h.textContent=i.verb1Label),u&&(u.textContent=i.verb1Desc),C&&(C.textContent=i.verb2Label),I&&(I.textContent=i.verb2Desc),L&&(L.textContent=i.verb3Label),P&&(P.textContent=i.verb3Desc);for(const H of this.container.querySelectorAll("[data-chamber-jump]"))Number(H.getAttribute("data-chamber-jump"))===o.chamber?H.setAttribute("aria-current","step"):H.removeAttribute("aria-current")}const a=Math.max(0,l.CHAMBER_DURATION_SECONDS-o.chamberElapsedMs/1e3).toFixed(1),c=this.container.querySelector("#px-act-indicator");c&&(c.setAttribute("data-act",o.act),c.textContent=o.act==="ACT_A_CALIBRATION"?`ACT A: CALIBRATION (${a}s)`:`⚡ ACT B: MIRROR WAVE (${a}s)`);const n=this.container.querySelector("#px-val-score");n&&(n.textContent=`${o.score.toLocaleString()} pts`);const p=o.pods.filter(s=>s.alive).length,b=this.container.querySelector("#px-val-hp");b&&(b.textContent=`${Math.round(o.player.hp)} HP · ${p}/${o.pods.length} Pods`);const m=this.container.querySelector("#px-val-energy");m&&(m.textContent=`${Math.round(o.player.energy)} / ${o.player.maxEnergy} W`);const f=this.container.querySelector("#px-val-lock");if(f){const s=Math.round(o.oracle.predictionLockPct);f.textContent=`${s}% (${s>=75?"LOCKED!":s>=45?"Tracking":"Unpredictable"})`,f.style.color=s>=75?"#f43f5e":s>=45?"#eab308":"#38bdf8"}const x=this.container.querySelector("#px-val-humanity");x&&(x.textContent=`${o.soul.humanity}% (${o.soul.humanity<=25?"Post-Human":o.soul.humanity<=50?"Cyborg Hybrid":"Biological"})`,x.style.color=o.soul.humanity<=25?"#eab308":o.soul.humanity<=50?"#a855f7":"#10b981");const E=this.container.querySelector("#px-chrono-sub");E&&(E.textContent=o.player.chronoBrakeActive?"⚡ ACTIVE: Arena slowed to 42%!":"Slow time to 42% for moral clarity");const g=(s,h,u,C)=>{const I=this.container.querySelector(`#px-lbl-${s}`),L=this.container.querySelector(`#px-bar-${s}`);if(I&&(I.textContent=C),L){const P=u?(h+100)/200*100:h;L.style.width=`${Math.max(4,Math.min(100,P))}%`}};g("util",o.soul.utilitarian,!0,o.soul.utilitarian>8?`Utilitarian (+${o.soul.utilitarian})`:o.soul.utilitarian<-8?`Kantian (${o.soul.utilitarian})`:`Balanced (${o.soul.utilitarian})`),g("altruism",o.soul.altruism,!0,o.soul.altruism>=0?`Altruist (+${o.soul.altruism})`:`Egoist (${o.soul.altruism})`),g("entropy",o.soul.entropy,!1,`${Math.round(o.soul.entropy)}% Free Will`),g("trust",o.soul.trust,!0,o.soul.trust>=0?`Cooperator (+${o.soul.trust})`:`Defector (${o.soul.trust})`);const A=this.container.querySelector("#px-career-badge");if(A&&(A.textContent=`${t.discoveredEndings.length}/4 Endings · High ${t.highScore}`),this.lastInstalledCount!==o.player.installedUpgrades.length){this.lastInstalledCount=o.player.installedUpgrades.length;const s=this.container.querySelector("#px-theseus-grid");if(s){s.innerHTML=k.map(h=>{const u=o.player.installedUpgrades.includes(h.id);return`
            <button
              type="button"
              class="px-upgrade-chip"
              data-install-upgrade="${h.id}"
              ${u?"disabled":""}
            >
              <strong style="color:${h.accentColor};display:block;">
                ${u?"✓ ":"+ "}${h.title}
              </strong>
              <span style="display:block;color:#94a3b8;margin-top:2px;">
                Deletes: <em>${h.sacrificedMemory}</em>
              </span>
            </button>
          `}).join("");for(const h of s.querySelectorAll("[data-install-upgrade]"))h.addEventListener("click",()=>{const u=h.getAttribute("data-install-upgrade");this.callbacks.onAction({type:"INSTALL_UPGRADE",upgradeId:u})})}}const d=o.causalLogs[0]?.id??"";if(this.lastLogHeadId!==d){this.lastLogHeadId=d;const s=this.container.querySelector("#px-causal-log");s&&(s.innerHTML=o.causalLogs.slice(0,10).map(h=>`
            <div class="px-log-item">
              <strong>[Ch.${h.chamber} · ${h.timestampSec}s] ${h.headline}</strong>
              <span>${h.philosophicalNote}</span>
            </div>
          `).join("")),this.renderCounterfactualDialog(o)}if(this.lastRenderedStatus!==`${o.status}-${o.chamber}`&&(this.lastRenderedStatus=`${o.status}-${o.chamber}`,this.renderStatusOverlay(o)),this.debugVisible){const s=this.container.querySelector("#px-debug-pre");s&&(s.textContent=JSON.stringify({seed:o.seed,rngCalls:o.rngState.calls,chamber:o.chamber,act:o.act,status:o.status,playerPos:[Math.round(o.player.x),Math.round(o.player.y)],oraclePredictedPos:[Math.round(o.oracle.predictedX),Math.round(o.oracle.predictedY)],predictionLockPct:Math.round(o.oracle.predictionLockPct),verbCounts:o.verbCounts,soul:o.soul},null,2))}this.drawCanvas(o,r)}renderCounterfactualDialog(o){const t=this.container.querySelector("#px-cf-dialog-body");if(!t)return;const r=B(o);t.innerHTML=`
      <table class="px-cf-table">
        <thead>
          <tr>
            <th>Timeline Policy</th>
            <th>Philosophical Signature</th>
            <th>Score</th>
            <th>Pods Saved</th>
            <th>Humanity</th>
            <th>Oracle Lock</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          ${r.map((i,a)=>`
            <tr style="${a===0?"background:rgba(56,189,248,0.12);font-weight:700;":""}">
              <td>${i.policyName}</td>
              <td>${i.philosophyTag}<br/><small style="color:#94a3b8;">${i.summaryDelta}</small></td>
              <td>${i.projectedScore.toLocaleString()}</td>
              <td>${i.podsSaved}</td>
              <td>${i.humanityRetained}%</td>
              <td>${i.oracleLockAvg}%</td>
              <td>${i.verdictTitle}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}renderStatusOverlay(o){const t=this.container.querySelector("#px-dilemma-overlay");if(t){if(o.status==="PLAYING"){t.hidden=!0,t.innerHTML="";return}if(o.status==="PAUSED"){t.hidden=!1,t.innerHTML=`
        <div class="px-dilemma-card">
          <h3 style="margin-top:0;color:#38bdf8;">⏸ SIMULATION PAUSED</h3>
          <p style="font-size:0.88rem;color:#cbd5e1;">
            Take a breath and inspect your 5-Axis Philosophical Soul Matrix or the Counterfactual Mirror Lab.
          </p>
          <button type="button" class="px-btn px-btn-accent" id="px-btn-resume">▶ Resume Chamber</button>
        </div>
      `,t.querySelector("#px-btn-resume")?.addEventListener("click",()=>this.callbacks.onAction({type:"TOGGLE_PAUSE"}));return}if(o.status==="CHAMBER_DILEMMA"){const r=w[o.chamber-1];t.hidden=!1,t.innerHTML=`
        <div class="px-dilemma-card">
          <span class="px-eyebrow">CHAMBER ${o.chamber} COMPLETE // AXIOM COVENANT</span>
          <h3 style="margin:6px 0 8px 0;font-size:1.25rem;color:#ffffff;">${r.title}</h3>
          <p style="font-size:0.86rem;color:#cbd5e1;line-height:1.45;margin:0;">
            ${r.centralQuestion}
          </p>
          <div class="px-dilemma-choices">
            <button type="button" class="px-choice-btn" id="px-choose-left">
              <strong>⟵ ${r.dilemmaChoiceLeft.label}</strong>
              <span>${r.dilemmaChoiceLeft.subtitle}</span>
            </button>
            <button type="button" class="px-choice-btn" id="px-choose-right">
              <strong>${r.dilemmaChoiceRight.label} ⟶</strong>
              <span>${r.dilemmaChoiceRight.subtitle}</span>
            </button>
          </div>
        </div>
      `,t.querySelector("#px-choose-left")?.addEventListener("click",()=>this.callbacks.onAction({type:"CHOOSE_DILEMMA",side:"LEFT"})),t.querySelector("#px-choose-right")?.addEventListener("click",()=>this.callbacks.onAction({type:"CHOOSE_DILEMMA",side:"RIGHT"}));return}if(o.status==="VICTORY"){const r=o.endingVerdictId&&T[o.endingVerdictId]||N(o),i=B(o);t.hidden=!1,t.innerHTML=`
        <div class="px-dilemma-card" style="max-width:700px;border-color:${r.accentColor};">
          <span class="px-eyebrow" style="color:${r.accentColor};">
            ${r.archetypeBadge} · ${r.philosophicalSchool}
          </span>
          <h3 style="margin:6px 0;font-size:1.35rem;color:#ffffff;">${r.title}</h3>
          <blockquote style="margin:8px 0;font-style:italic;font-size:0.82rem;color:#94a3b8;">
            ${r.epigraph}
          </blockquote>
          <p style="font-size:0.84rem;color:#e2e8f0;line-height:1.45;">
            ${r.summary}
          </p>
          <div style="background:#070a14;border-left:3px solid ${r.accentColor};padding:8px 12px;text-align:left;margin:10px 0;border-radius:6px;">
            <strong style="font-size:0.76rem;color:${r.accentColor};display:block;">
              FINAL SOCRATIC QUESTION:
            </strong>
            <span style="font-size:0.82rem;color:#f8fafc;">${r.thoughtExperimentQuestion}</span>
          </div>
          <div style="font-size:0.78rem;color:#cbd5e1;margin-bottom:12px;">
            <strong>Final Score:</strong> ${o.score.toLocaleString()} pts ·
            <strong>Pods Saved:</strong> ${o.podsSavedTotal} ·
            <strong>Oracle Locks Shattered:</strong> ${o.oracle.predictionsBroken} ·
            <strong>Humanity Retained:</strong> ${o.soul.humanity}%
          </div>
          <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:12px;">
            <strong>Counterfactual Benchmark:</strong> Guardian (${i[1].projectedScore} pts) ·
            Theseus Machine (${i[2].projectedScore} pts) ·
            Existential Maverick (${i[3].projectedScore} pts)
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-accent" id="px-btn-play-again">
              ↻ Run New Seeded Timeline
            </button>
            <button
              type="button"
              class="px-btn"
              commandfor="px-counterfactual-dialog"
              command="show-modal"
            >
              ⚖ Inspect Full Counterfactual Table
            </button>
          </div>
        </div>
      `,t.querySelector("#px-btn-play-again")?.addEventListener("click",()=>this.callbacks.onRestart())}}}drawCanvas(o,t){const r=this.ctx;if(!r)return;const i=l.ARENA_WIDTH,a=l.ARENA_HEIGHT,c=t/1e3;r.clearRect(0,0,i,a),r.fillStyle=o.player.chronoBrakeActive?"#09071a":"#050811",r.fillRect(0,0,i,a),r.strokeStyle=o.act==="ACT_B_MIRROR"?"rgba(244, 63, 94, 0.12)":"rgba(56, 189, 248, 0.09)",r.lineWidth=1;for(let n=0;n<=i;n+=40)r.beginPath(),r.moveTo(n,0),r.lineTo(n,a),r.stroke();for(let n=0;n<=a;n+=40)r.beginPath(),r.moveTo(0,n),r.lineTo(i,n),r.stroke();if(o.chamber===1)r.save(),r.lineWidth=5,r.strokeStyle=o.trolleyActiveTrack==="ALPHA"?"#f43f5e":"rgba(148, 163, 184, 0.25)",r.beginPath(),r.moveTo(40,a*.5),r.lineTo(i-105,130),r.stroke(),r.strokeStyle=o.trolleyActiveTrack==="BETA"?"#eab308":"rgba(148, 163, 184, 0.25)",r.beginPath(),r.moveTo(40,a*.5),r.lineTo(i-105,a-105),r.stroke(),r.fillStyle="#94a3b8",r.font="bold 11px Inter, sans-serif",r.fillText(`ACTIVE TRACK: ${o.trolleyActiveTrack} (Press [1/Q] to Flip Switch)`,52,a*.5-16),r.restore();else if(o.chamber===2&&o.oracle.newcombOutcomeLabel)r.fillStyle="#38bdf8",r.font="bold 12px Inter, sans-serif",r.fillText(o.oracle.newcombOutcomeLabel,24,a-18);else if(o.chamber===5){const n=i*.5,p=95;r.save(),r.beginPath(),r.arc(n,p,38,0,Math.PI*2),r.fillStyle="rgba(236, 72, 153, 0.22)",r.fill(),r.lineWidth=3,r.strokeStyle="#ec4899",r.stroke(),r.fillStyle="#ffffff",r.font="bold 12px Inter, sans-serif",r.textAlign="center",r.fillText(`LAPLACE-9 ARCHITECT (${o.oracle.bossHp}/${o.oracle.bossMaxHp} HP)`,n,p-48),r.restore()}for(const n of o.pods)r.save(),r.beginPath(),r.arc(n.x,n.y,24,0,Math.PI*2),r.fillStyle=n.alive?n.shieldedMs>0?"rgba(16, 185, 129, 0.3)":"rgba(15, 23, 42, 0.9)":"rgba(71, 85, 105, 0.25)",r.fill(),r.lineWidth=n.shieldedMs>0?3.5:2,r.strokeStyle=n.alive?n.shieldedMs>0?"#10b981":n.track==="ALPHA"?"#38bdf8":"#eab308":"#475569",r.stroke(),r.fillStyle=n.alive?"#f8fafc":"#64748b",r.font="bold 10px Inter, sans-serif",r.textAlign="center",r.fillText(n.label,n.x,n.y-30),r.fillText(n.alive?`${n.hp}%`:"LOST",n.x,n.y+4),r.restore();for(const n of o.shards)r.save(),r.beginPath(),r.arc(n.x,n.y,8,0,Math.PI*2),r.fillStyle=n.color,r.fill(),r.restore();for(const n of o.clones)r.save(),r.beginPath(),r.arc(n.x,n.y,15,0,Math.PI*2),r.fillStyle=n.disposition==="ALLY"?"rgba(16, 185, 129, 0.28)":"rgba(244, 63, 94, 0.28)",r.fill(),r.lineWidth=2.5,r.strokeStyle=n.color,r.stroke(),r.fillStyle=n.color,r.font="bold 10px Inter, sans-serif",r.textAlign="center",r.fillText(`${n.label} [${n.lastMove}]`,n.x,n.y-20),r.restore();for(const n of o.hazards)r.save(),r.beginPath(),r.arc(n.x,n.y,n.radius,0,Math.PI*2),r.fillStyle=n.color,r.fill(),r.lineWidth=2,r.strokeStyle="#ffffff",r.stroke(),r.restore();r.save(),r.setLineDash([5,5]),r.strokeStyle=o.oracle.predictionLockPct>=70?"rgba(244, 63, 94, 0.75)":"rgba(56, 189, 248, 0.45)",r.lineWidth=1.5,r.beginPath(),r.moveTo(o.player.x,o.player.y),r.lineTo(o.oracle.predictedX,o.oracle.predictedY),r.stroke(),r.setLineDash([]),r.beginPath(),r.arc(o.oracle.predictedX,o.oracle.predictedY,16,0,Math.PI*2),r.strokeStyle=o.oracle.predictionLockPct>=70?"#f43f5e":"#38bdf8",r.stroke(),r.fillStyle=o.oracle.predictionLockPct>=70?"#f43f5e":"#38bdf8",r.font="10px Inter, sans-serif",r.textAlign="center",r.fillText(`ORACLE LOCK ${Math.round(o.oracle.predictionLockPct)}%`,o.oracle.predictedX,o.oracle.predictedY-22),r.restore(),o.player.shieldPulseMs>0&&(r.save(),r.beginPath(),r.arc(o.player.x,o.player.y,68,0,Math.PI*2),r.strokeStyle="rgba(16, 185, 129, 0.65)",r.lineWidth=3,r.stroke(),r.restore()),o.player.siphonBeamMs>0&&(r.save(),r.beginPath(),r.arc(o.player.x,o.player.y,85,0,Math.PI*2),r.strokeStyle="rgba(244, 63, 94, 0.7)",r.lineWidth=3.5,r.stroke(),r.restore()),r.save(),r.beginPath(),r.arc(o.player.x,o.player.y,l.PLAYER_RADIUS,0,Math.PI*2),r.fillStyle=o.soul.humanity<=25?"#eab308":"#38bdf8",r.fill(),r.lineWidth=3,r.strokeStyle="#ffffff",r.stroke(),r.fillStyle="#ffffff",r.font="bold 10px Inter, sans-serif",r.textAlign="center",r.fillText(o.soul.humanity<=25?"THESEUS-09":"SUBJECT-09 (YOU)",o.player.x,o.player.y+28),r.restore(),r.save(),r.fillStyle="rgba(15, 23, 42, 0.82)",r.fillRect(10,8,i-20,24),r.fillStyle="#e2e8f0",r.font="11px Inter, sans-serif",r.fillText(o.oracle.activeTaunt,18,24),r.restore();for(let n=this.particles.length-1;n>=0;n--){const p=this.particles[n];if(p.x+=p.vx*c,p.y+=p.vy*c,p.alpha-=c*1.9,p.alpha<=0){this.particles.splice(n,1);continue}r.save(),r.globalAlpha=Math.max(0,p.alpha),r.fillStyle=p.color,r.fillRect(p.x,p.y,p.size,p.size),r.restore()}for(let n=this.popups.length-1;n>=0;n--){const p=this.popups[n];if(p.y+=p.vy*c,p.alpha-=c*.85,p.alpha<=0){this.popups.splice(n,1);continue}r.save(),r.globalAlpha=Math.max(0,p.alpha),r.fillStyle=p.color,r.font="bold 12px Inter, sans-serif",r.textAlign="center",r.fillText(p.text,p.x,p.y),r.restore()}}destroy(){window.removeEventListener("keydown",this.keydownHandler),window.removeEventListener("keyup",this.keyupHandler),this.container.innerHTML=""}}const ee={id:l.GAME_ID,number:l.GAME_NUMBER,title:l.TITLE,subtitle:l.SUBTITLE,genre:"Real-Time Philosophical Arena & Self-Cloning Thought-Experiment Thriller",primaryReference:"The Talos Principle · The Evolution of Trust (Nicky Case)",supportingReference:"Inscryption · Lichess Counterfactual Review · Super Hexagon",oneSentenceLoop:"Navigate 5 iconic philosophical thought-experiment arenas (Trolley Problem, Newcomb’s Vault, Ship of Theseus, Prisoner’s Dilemma, Laplace’s Demon) while an AI Oracle predicts your moves in real time and spawns an Act B Mirror Echo-Clone trained on the exact moral choices you just made!",shortGoal:"Survive all 5 Paradox Chambers, shatter Laplace-9’s prediction lock with Quantum Swerves, and discover which of the 4 Philosophical Verdicts your consciousness earns.",longGoal:"Unlock all 4 Philosophical Endings, audit your 5-Axis Soul Matrix against the 3 Counterfactual Archetypes on the same seed, and test whether you can conquer Chamber V with 100% Biological Humanity intact.",controlsSummary:"WASD / Arrows / Click-Drag: Move · [1/Q]: Intervene / Shield · [2/E]: Siphon / Defect · [3/Space]: Quantum Swerve · [Shift]: Chrono-Stasis",accentColor:l.ACCENT_COLOR};function re(e,o){const t=J();let r={...t.career};const i=o?.initialSeed??l.DEFAULT_SEED;let a=o?.initialSeed===void 0&&t.activeRun&&t.activeRun.status!=="VICTORY"&&t.activeRun.status!=="GAME_OVER"?O(t.activeRun):D(i);const c=new G,n=d=>{K(a,d),a.events.length>0&&(m.consumeEvents(a,a.events),a.events=[]),r=M(r,a).career,m.render(a,r,l.FIXED_STEP_MS)},p=d=>{const s=typeof d=="number"?d:a.seed+104729>>>0;a=D(s),m.resetVisuals(),r=M(r,a).career,m.render(a,r,l.FIXED_STEP_MS)},b=d=>{const s=typeof d=="boolean"?d:!m.isDebugVisible();m.setDebugVisible(s)},m=new Z(e,c,{onAction:n,onRestart:p,onToggleDebug:()=>b()},!!o?.debug);let f=0,x=performance.now(),E=0,g=!1;const A=d=>{if(g)return;const s=Math.min(100,Math.max(0,d-x));x=d,E+=s;const h=a.status,u=a.chamber;for(;E>=l.FIXED_STEP_MS;)Q(a,l.FIXED_STEP_MS),a.events.length>0&&(m.consumeEvents(a,a.events),a.events=[]),E-=l.FIXED_STEP_MS;(a.status!==h||a.chamber!==u||a.score>r.highScore)&&(r=M(r,a).career),m.render(a,r,s||l.FIXED_STEP_MS),f=window.requestAnimationFrame(A)};return m.render(a,r,l.FIXED_STEP_MS),f=window.requestAnimationFrame(A),{destroy(){g=!0,window.cancelAnimationFrame(f),M(r,a),c.destroy(),m.destroy()},getStateSnapshot(){return O(a)},restartWithSeed(d){p(d)},toggleDebug(d){b(d),m.render(a,r,l.FIXED_STEP_MS)}}}const ae={metadata:ee,mountGame:re},se=Object.freeze(Object.defineProperty({__proto__:null,ENDING_VERDICTS:T,ORACLE_TAUNTS:_,PARADOX_CHAMBERS:w,PARADOX_CONFIG:l,ParadoxAudioEngine:G,ParadoxUIController:Z,SeededRng:R,THESEUS_UPGRADES:k,applyParadoxInput:K,cloneParadoxState:O,computeEndingVerdict:N,createDefaultCareerStats:j,createInitialParadoxState:D,default:ae,getUpgradeSiphonMultiplier:q,getUpgradeSpeedBonus:F,hasCooldownUpgrade:X,loadParadoxSave:J,metadata:ee,mountGame:re,runCounterfactualComparison:B,saveParadoxState:M,stepParadoxState:Q,transitionToChamber:V},Symbol.toStringTag,{value:"Module"}));export{ee as a,se as g,re as m};
