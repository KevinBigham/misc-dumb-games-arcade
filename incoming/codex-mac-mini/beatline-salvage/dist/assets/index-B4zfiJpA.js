const T="1.0.0";const O="argon_game01_one_more_season_save_v1",I=["attack","defense","control","stamina"],A={attack:"Attack",defense:"Defense",control:"Control",stamina:"Stamina"},se=["Patient","Balanced","Aggressive"],c={rulesVersion:T,saveSchemaVersion:1,defaultSeed:202601,clubName:"Ironvale Rovers FC",clubNickname:"The Ironworks Five",seasonFixtures:6,seasonWinTarget:4,rosterSize:8,startersCount:5,reservesCount:3,prepPointsPerFixture:2,restFatigueDelta:-24,trainFatigueDelta:8,trainAttributeDelta:1,postMatchDevAttributeDelta:1,minAttribute:1,maxAttribute:10,minFatigue:0,maxFatigue:100,effectiveFatigueDivisor:200,postMatchStarterFatigueBase:24,postMatchReserveFatigueDelta:-18,possessionsPerTeam:8,totalPossessions:16,maxProbabilityShift:.15,attributeDeltaShiftScale:.008,basePlanDistributions:{Patient:{p0:.25,p3:.55,p7:.2},Balanced:{p0:.35,p3:.35,p7:.3},Aggressive:{p0:.5,p3:.1,p7:.4}},documentedStrategySeeds:[202601,202602,202605,202609]};function L(a,t,e){return Math.max(t,Math.min(e,a))}function F(a){return L(Math.round(a),c.minFatigue,c.maxFatigue)}function B(a){return L(Math.round(a),c.minAttribute,c.maxAttribute)}function $(a){return 1-F(a)/c.effectiveFatigueDivisor}function S(a,t){return Number((a*$(t)).toFixed(4))}function q(a){return Math.max(0,c.postMatchStarterFatigueBase-a)}const W=[{id:"p1",name:"Kaelen Vance",number:9,role:"FWD",roleTitle:"Star Finisher",bio:"Deadly top-corner striker who carried Ironvale last month—enters Fixture 1 carrying heavy leg fatigue (56).",attack:9,defense:4,control:7,stamina:5,initialFatigue:56,defaultStarter:!0},{id:"p2",name:"Mira Solis",number:8,role:"MID",roleTitle:"Deep Playmaker",bio:"Threads laser passes through congested five-a-side lanes; dictates Ironvale’s tempo and Control rating.",attack:7,defense:5,control:9,stamina:6,initialFatigue:10,defaultStarter:!0},{id:"p3",name:"Bram Thorne",number:4,role:"DEF",roleTitle:"Iron Sweeper",bio:"Uncompromising last-ditch tackler who anchors the defensive arc and shuts down 7-point breakaways.",attack:4,defense:9,control:6,stamina:7,initialFatigue:8,defaultStarter:!0},{id:"p4",name:"Tariq Osei",number:6,role:"MID",roleTitle:"Box-to-Box Engine",bio:"Relentless two-way runner with high Stamina (8) who absorbs heavy fixture congestion without wilting.",attack:7,defense:7,control:7,stamina:8,initialFatigue:6,defaultStarter:!0},{id:"p5",name:"Soren Lindqvist",number:11,role:"MID",roleTitle:"Wing Metronome",bio:"Composed wide distributor who recycles possession and links defense to attack under heavy pressure.",attack:6,defense:6,control:8,stamina:6,initialFatigue:14,defaultStarter:!0},{id:"p6",name:"Juno Reyes",number:10,role:"FWD",roleTitle:"Fresh Poacher",bio:"Explosive second striker waiting on the bench at 0 Fatigue—ready to deputize whenever Vance needs rest.",attack:8,defense:4,control:7,stamina:7,initialFatigue:0,defaultStarter:!1},{id:"p7",name:"Callum Ward",number:5,role:"DEF",roleTitle:"Half-Back Shield",bio:"Disciplined defensive stopper with iron lungs (Stamina 8) who locks down counter-attacking opponents.",attack:4,defense:8,control:6,stamina:8,initialFatigue:0,defaultStarter:!1},{id:"p8",name:"Dara Novak",number:14,role:"UTL",roleTitle:"Utility Catalyst",bio:"Versatile all-rounder who slots seamlessly into midfield or defense when rotation is required.",attack:6,defense:6,control:7,stamina:7,initialFatigue:0,defaultStarter:!1}],G=[{id:"Patient",name:"Patient Build-Up",tagline:"High-floor possession triangles (55% base 3-pt rate)",description:"Works the ball methodically until a high-percentage 3-point angle opens, minimizing 0-point turnovers (25% base) while waiting for clean 7-point cutbacks (20% base).",baseDistribution:c.basePlanDistributions.Patient,bestWhen:"Facing overeager high presses or wild transition teams that lose shape when starved of the ball."},{id:"Balanced",name:"Balanced Tempo",tagline:"Measured two-way rhythm (35% 0-pt / 35% 3-pt / 30% 7-pt)",description:"Mixes controlled circulation with timely vertical switches, offering steady 3-point pressure and reliable 7-point threat without overcommitting numbers.",baseDistribution:c.basePlanDistributions.Balanced,bestWhen:"Facing asymmetric mid-blocks or disciplined man-marking sides where adaptability punishes over-rotation."},{id:"Aggressive",name:"Aggressive Direct",tagline:"High-ceiling blitz (40% base 7-pt rate, 50% base 0-pt risk)",description:"Launches immediate vertical balls and central overloads chasing 7-point breakthroughs, accepting frequent 0-point turnovers and bypassing 3-point safety (10% base).",baseDistribution:c.basePlanDistributions.Aggressive,bestWhen:"Cracking passive low blocks, exploiting fragile high defensive lines, or riding a rested high-Attack lineup."}],ae=[{id:"opp-1",fixtureNumber:1,name:"Cinderwick Athletic",shortName:"CIN",nickname:"The Ash-Hounds",primaryColor:"#d97706",secondaryColor:"#fef3c7",attack:27,defense:26,control:29,defaultPlan:"Patient",scoutingReport:"Cinderwick sprint out in an Overeager High Press on every whistle. They leave wide-open passing triangles behind their front line—vulnerable to Patient build-up, while reckless Aggressive passes feed their traps.",tacticalHint:"Recommended: Choose Patient (+9% shift to 7-pt breakthroughs) and either Rest tired star Kaelen Vance (Fatigue 56 -> 32) or swap in fresh striker Juno Reyes.",tendency:{id:"tend-1",name:"Overeager High Press",vulnerableTo:"Patient",summary:"Leaves central pockets open vs Patient (+9% 7-pt shift); traps Aggressive (-4% shift).",clubPlanModifier:{Patient:.09,Balanced:.03,Aggressive:-.04},opponentPossessionModifier:{Patient:-.05,Balanced:-.02,Aggressive:.03}}},{id:"opp-2",fixtureNumber:2,name:"Docklands United",shortName:"DOC",nickname:"The Harbor Wall",primaryColor:"#0284c7",secondaryColor:"#e0f2fe",attack:26,defense:30,control:29,defaultPlan:"Patient",scoutingReport:"Docklands park four defenders on the edge of their D-arc in a Low-Block Harbor Wall. Slow perimeter passing gets absorbed, whereas direct Aggressive strikes or crisp Balanced switches fracture their low block.",tacticalHint:"Recommended: Aggressive (+9% 7-pt shift) or Balanced (+4% shift) with high Attack starters.",tendency:{id:"tend-2",name:"Low-Block Harbor Wall",vulnerableTo:"Aggressive",summary:"Vulnerable to Aggressive vertical strikes (+9% 7-pt shift); absorbs Patient play (-2%).",clubPlanModifier:{Patient:-.02,Balanced:.04,Aggressive:.09},opponentPossessionModifier:{Patient:-.03,Balanced:-.03,Aggressive:-.04}}},{id:"opp-3",fixtureNumber:3,name:"Millgate Foundry FC",shortName:"MIL",nickname:"The Smelters",primaryColor:"#dc2626",secondaryColor:"#fee2e2",attack:29,defense:28,control:30,defaultPlan:"Balanced",scoutingReport:"Millgate overload the strong-side touchline in a Split-Midfield Gamble. A Balanced tempo switches play into the weak-side channel before their pivot can slide across.",tacticalHint:"Recommended: Balanced (+9% 7-pt shift, -5% opponent shift) while watching mid-season starter fatigue.",tendency:{id:"tend-3",name:"Split-Midfield Gamble",vulnerableTo:"Balanced",summary:"Punished by Balanced weak-side switches (+9% 7-pt shift); solid vs Aggressive (+4%).",clubPlanModifier:{Patient:.03,Balanced:.09,Aggressive:.04},opponentPossessionModifier:{Patient:-.03,Balanced:-.05,Aggressive:.01}}},{id:"opp-4",fixtureNumber:4,name:"Redmoor Rangers",shortName:"RED",nickname:"The Moorland Raiders",primaryColor:"#9333ea",secondaryColor:"#f3e8ff",attack:31,defense:27,control:29,defaultPlan:"Aggressive",scoutingReport:"Redmoor thrive on chaotic end-to-end transitions with a Wild Counter-Blitz. Starving them with Patient control denies their runners oxygen and exposes their undisciplined back line.",tacticalHint:"Recommended: Patient (+10% 7-pt shift and -6% to Redmoor’s breakaways) with high-Control midfielders.",tendency:{id:"tend-4",name:"Wild Counter-Blitz",vulnerableTo:"Patient",summary:"Starved by Patient control (+10% 7-pt shift, -6% opp shift); dangerous in open firefights.",clubPlanModifier:{Patient:.1,Balanced:.04,Aggressive:.03},opponentPossessionModifier:{Patient:-.06,Balanced:-.03,Aggressive:.03}}},{id:"opp-5",fixtureNumber:5,name:"Glassworks Dynamo",shortName:"GLA",nickname:"The Prisms",primaryColor:"#0d9488",secondaryColor:"#ccfbf1",attack:30,defense:28,control:31,defaultPlan:"Balanced",scoutingReport:"Dynamo push their sweepers up to the halfway line in a Fragile High Line. Early Aggressive balls in behind or sharp Balanced through-balls create clean 1-on-1 breakaways.",tacticalHint:"Recommended: Aggressive (+10% 7-pt shift) or Balanced (+6% shift) with rested forwards.",tendency:{id:"tend-5",name:"Fragile High Line",vulnerableTo:"Aggressive",summary:"Exposed by Aggressive direct runs (+10% 7-pt shift) and Balanced switches (+6%).",clubPlanModifier:{Patient:.03,Balanced:.06,Aggressive:.1},opponentPossessionModifier:{Patient:-.03,Balanced:-.04,Aggressive:-.03}}},{id:"opp-6",fixtureNumber:6,name:"Sovereign City FC",shortName:"SOV",nickname:"The Royals",primaryColor:"#eab308",secondaryColor:"#fef9c3",attack:31,defense:30,control:31,defaultPlan:"Balanced",scoutingReport:"The division pacesetters lock man-to-man across the pitch in a Title-Chasing Man-Mark. A composed Balanced structure—or an overpowering, well-trained attack—drags their markers out of shape in the season finale.",tacticalHint:"Finale: Empty the tank! Spend both Prep Points on your strongest five and exploit Balanced (+9% shift) or your highest-trained style.",tendency:{id:"tend-6",name:"Title-Chasing Man-Mark",vulnerableTo:"Balanced",summary:"Outmaneuvered by Balanced tempo (+9% 7-pt shift) or high-stat Aggressive/Patient play (+6%).",clubPlanModifier:{Patient:.06,Balanced:.09,Aggressive:.06},opponentPossessionModifier:{Patient:-.04,Balanced:-.05,Aggressive:-.02}}}],_=[{id:"tpl-01",title:"Top-Corner Breakthrough (7 Pts)",category:"club_breakthrough_7",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.keyPlayerName} rifles a 7-pt breakthrough (${a.clubScoreAfter}–${a.opponentScoreAfter})`,renderBody:a=>`Executing Ironvale's ${a.tacticalPlan} plan against ${a.opponentName}'s ${a.tendencyName}, ${a.supportPlayerName} slipped ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) into the box. With a ${a.totalShiftPct} matchup shift (roll ${a.rollDisplay}), Ironvale converted a decisive 7-point strike.`},{id:"tpl-02",title:"Tactical Tendency Shredded (7 Pts)",category:"tendency_exploit",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.tacticalPlan} shape Carves ${a.opponentName}'s ${a.tendencyName} for 7 pts`,renderBody:a=>`The scouting report paid off in Half ${a.half}. ${a.keyPlayerName} exploited ${a.opponentName}'s ${a.tendencyName} directly, turning a ${a.totalShiftPct} probability boost (roll ${a.rollDisplay}) into a clean 7-point finish with ${a.supportPlayerName} providing the screen.`},{id:"tpl-03",title:"Clinical Combination Play (3 Pts)",category:"club_clinical_3",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.keyPlayerName} & ${a.supportPlayerName} work a 3-pt conversion (${a.clubScoreAfter}–${a.opponentScoreAfter})`,renderBody:a=>`Under ${a.tacticalPlan} tempo in Half ${a.half}, ${a.keyPlayerName} (${a.keyPlayerRole}) linked up with ${a.supportPlayerName} at the edge of the arc to bank 3 points (roll ${a.rollDisplay}, matchup shift ${a.totalShiftPct}).`},{id:"tpl-04",title:"Metronome Pressure Pays Off (3 Pts)",category:"club_clinical_3",renderHeadline:a=>`Possession #${a.possessionIndex}: Patient angles from ${a.keyPlayerName} secure 3 points`,renderBody:a=>`Refusing to force a low-percentage shot against ${a.opponentName}, ${a.keyPlayerName} (at ${a.keyPlayerFatigue}% fatigue) recycled the ball to ${a.supportPlayerName} for a textbook 3-point conversion (roll ${a.rollDisplay}).`},{id:"tpl-05",title:"Fatigue-Heavy Turnover (0 Pts)",category:"fatigue_swing",renderHeadline:a=>`Possession #${a.possessionIndex}: Heavy legs on ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) stall the attack (0 pts)`,renderBody:a=>`Fatigue bit into Ironvale's effective ratings on Possession #${a.possessionIndex}. ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) couldn't separate from ${a.opponentName}'s marker under ${a.tacticalPlan} play, resulting in a 0-point turnover (roll ${a.rollDisplay}, shift ${a.totalShiftPct}).`},{id:"tpl-06",title:"Attack Repelled at the Arc (0 Pts)",category:"club_stalled_0",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.opponentName} closes the lane on ${a.keyPlayerName} (0 pts)`,renderBody:a=>`Ironvale pushed forward in Half ${a.half} using ${a.tacticalPlan} tempo, but ${a.opponentName}'s ${a.tendencyName} cut off the passing angle to ${a.supportPlayerName} (roll ${a.rollDisplay}, shift ${a.totalShiftPct}), leaving the score at ${a.clubScoreAfter}–${a.opponentScoreAfter}.`},{id:"tpl-07",title:"Ironvale Defensive Stand (0 Pts Allowed)",category:"club_defensive_stand_0",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.keyPlayerName} slams the door on ${a.opponentName} (0 pts allowed)`,renderBody:a=>`With ${a.opponentName} pressing in Half ${a.half}, ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) and ${a.supportPlayerName} held a compact defensive line (shift ${a.totalShiftPct}, roll ${a.rollDisplay}) to force a 0-point empty possession.`},{id:"tpl-08",title:"Sweeper Interception in the Box (0 Pts Allowed)",category:"club_defensive_stand_0",renderHeadline:a=>`Possession #${a.possessionIndex}: Clean tackle by ${a.keyPlayerName} preserves the ${a.clubScoreAfter}–${a.opponentScoreAfter} line`,renderBody:a=>`${a.opponentName} probed for an opening, but Ironvale's effective Defense + Control rating (${a.totalShiftPct} modifier) allowed ${a.keyPlayerName} to dispossess their runner cleanly (roll ${a.rollDisplay}).`},{id:"tpl-09",title:"Opponent Counter-Punish (7 Pts Allowed)",category:"opponent_punish_7",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.opponentName} breaks through for 7 pts (${a.clubScoreAfter}–${a.opponentScoreAfter})`,renderBody:a=>`${a.opponentName} capitalized on an opening in Half ${a.half}, beating ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) on roll ${a.rollDisplay} (modifier ${a.totalShiftPct}) for a costly 7-point swing.`},{id:"tpl-10",title:"Defensive Gap Exploited (7 Pts Allowed)",category:"opponent_punish_7",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.opponentName}'s ${a.tendencyName} carves out a 7-pt goal`,renderBody:a=>`Despite ${a.supportPlayerName}'s recovery run, ${a.opponentName} found space behind ${a.keyPlayerName} to convert a 7-point possession (roll ${a.rollDisplay}, shift ${a.totalShiftPct}), making it ${a.clubScoreAfter}–${a.opponentScoreAfter}.`},{id:"tpl-11",title:"Opponent Perimeter Conversion (3 Pts Allowed)",category:"opponent_chip_3",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.opponentName} chips in 3 pts past ${a.keyPlayerName}`,renderBody:a=>`Ironvale denied the 7-point lane through ${a.supportPlayerName}, but ${a.opponentName} settled for a 3-point perimeter conversion in Half ${a.half} (roll ${a.rollDisplay}, shift ${a.totalShiftPct}).`},{id:"tpl-12",title:"Late-Half Momentum Swing",category:"tendency_exploit",renderHeadline:a=>`Possession #${a.possessionIndex}: ${a.team==="club"?a.keyPlayerName:a.opponentName} swings Half ${a.half} (${a.points} pts, ${a.clubScoreAfter}–${a.opponentScoreAfter})`,renderBody:a=>`A pivotal Half ${a.half} possession under Ironvale's ${a.tacticalPlan} setup vs ${a.opponentName}'s ${a.tendencyName}: ${a.keyPlayerName} (${a.keyPlayerFatigue}% fatigue) was at the center of the action as roll ${a.rollDisplay} (shift ${a.totalShiftPct}) produced ${a.points} points.`}];function E(a){const t=ae.find(e=>e.fixtureNumber===a);if(!t)throw new Error(`No opponent configured for fixture ${a}`);return t}function ye(a){const t=G.find(e=>e.id===a);if(!t)throw new Error(`Unknown tactical plan: ${a}`);return t}class ie{ctx=null;muted=!1;isMuted(){return this.muted}setMuted(t){this.muted=t}toggleMute(){return this.muted=!this.muted,this.muted}getContext(){if(this.muted||typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;if(!t)return null;if(!this.ctx)try{this.ctx=new t}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playClick(t=520){const e=this.getContext();if(e)try{const s=e.currentTime,i=e.createOscillator(),o=e.createGain();i.type="triangle",i.frequency.setValueAtTime(t,s),i.frequency.exponentialRampToValueAtTime(t*1.35,s+.045),o.gain.setValueAtTime(.08,s),o.gain.exponentialRampToValueAtTime(.001,s+.055),i.connect(o),o.connect(e.destination),i.start(s),i.stop(s+.06)}catch{}}playWhistle(){const t=this.getContext();if(t)try{const e=t.currentTime,s=t.createOscillator(),i=t.createOscillator(),o=t.createGain();s.type="sine",i.type="triangle",s.frequency.setValueAtTime(2680,e),i.frequency.setValueAtTime(2745,e),o.gain.setValueAtTime(.001,e),o.gain.linearRampToValueAtTime(.09,e+.02),o.gain.setValueAtTime(.04,e+.08),o.gain.linearRampToValueAtTime(.1,e+.14),o.gain.exponentialRampToValueAtTime(.001,e+.34),s.connect(o),i.connect(o),o.connect(t.destination),s.start(e),i.start(e),s.stop(e+.36),i.stop(e+.36)}catch{}}playPossessionChime(t,e){const s=this.getContext();if(s)try{const i=s.currentTime;if(e===0){const r=s.createOscillator(),n=s.createGain();r.type="sine",r.frequency.setValueAtTime(t==="club"?240:320,i),r.frequency.exponentialRampToValueAtTime(180,i+.09),n.gain.setValueAtTime(.05,i),n.gain.exponentialRampToValueAtTime(.001,i+.1),r.connect(n),n.connect(s.destination),r.start(i),r.stop(i+.11);return}(t==="club"?e===7?[440,554.37,659.25,880]:[392,493.88,587.33]:e===7?[311.13,277.18,220]:[329.63,293.66]).forEach((r,n)=>{const d=s.createOscillator(),p=s.createGain();d.type=t==="club"?"triangle":"sawtooth";const f=i+n*.055;d.frequency.setValueAtTime(r,f),p.gain.setValueAtTime(.07,f),p.gain.exponentialRampToValueAtTime(.001,f+.18),d.connect(p),p.connect(s.destination),d.start(f),d.stop(f+.19)})}catch{}}}function J(a){return(Number.isFinite(a)?Math.floor(a):202601)>>>0||1}function K(a){let t=J(a);function e(){t=t+1831565813>>>0;let r=Math.imul(t^t>>>15,1|t);return r=r+Math.imul(r^r>>>7,61|r)^r,((r^r>>>14)>>>0)/4294967296}function s(r,n){const d=Math.ceil(Math.min(r,n)),p=Math.floor(Math.max(r,n));return d>=p?d:d+Math.floor(e()*(p-d+1))}function i(){return t>>>0}function o(){return K(t)}return{nextFloat:e,nextInt:s,getState:i,clone:o}}function Y(a){return JSON.parse(JSON.stringify(a))}function w(a=c.defaultSeed){const t=J(a),e=W.map(i=>({id:i.id,name:i.name,number:i.number,role:i.role,roleTitle:i.roleTitle,bio:i.bio,attack:i.attack,defense:i.defense,control:i.control,stamina:i.stamina,fatigue:i.initialFatigue,matchesStarted:0,matchesBenched:0})),s=W.filter(i=>i.defaultStarter).map(i=>i.id);return{rulesVersion:T,seed:t,rngState:t,fixtureNumber:1,phase:"preparation",roster:e,selectedStarterIds:s,selectedPlan:"Balanced",prepPointsRemaining:c.prepPointsPerFixture,prepActionsThisFixture:[],currentMatch:null,seasonHistory:[],commandLog:[]}}function H(a,t){const e=new Set(t),s=a.filter(l=>e.has(l.id)).map(l=>{const u=$(l.fatigue);return{id:l.id,name:l.name,role:l.role,fatigue:l.fatigue,effectiveMultiplier:u,rawAttack:l.attack,rawDefense:l.defense,rawControl:l.control,stamina:l.stamina,effectiveAttack:S(l.attack,l.fatigue),effectiveDefense:S(l.defense,l.fatigue),effectiveControl:S(l.control,l.fatigue)}}),i=s.reduce((l,u)=>l+u.rawAttack,0),o=s.reduce((l,u)=>l+u.rawDefense,0),r=s.reduce((l,u)=>l+u.rawControl,0),n=Number(s.reduce((l,u)=>l+u.effectiveAttack,0).toFixed(4)),d=Number(s.reduce((l,u)=>l+u.effectiveDefense,0).toFixed(4)),p=Number(s.reduce((l,u)=>l+u.effectiveControl,0).toFixed(4)),f=s.length>0?Number((s.reduce((l,u)=>l+u.fatigue,0)/s.length).toFixed(2)):0;return{starters:s,rawAttack:i,rawDefense:o,rawControl:r,effectiveAttack:n,effectiveDefense:d,effectiveControl:p,averageFatigue:f}}function P(a){const{team:t,clubPlan:e,teamRatings:s,opponent:i}=a,o=t==="club"?e:i.defaultPlan,r=c.basePlanDistributions[o],n=Number(t==="club"?(s.effectiveAttack+s.effectiveControl).toFixed(4):(i.attack+i.control).toFixed(4)),d=Number(t==="club"?(i.defense+i.control).toFixed(4):(s.effectiveDefense+s.effectiveControl).toFixed(4)),p=Number((n-d).toFixed(4)),f=Number((p*c.attributeDeltaShiftScale).toFixed(6)),l=t==="club"?i.tendency.clubPlanModifier[e]:i.tendency.opponentPossessionModifier[e],u=Number((f+l).toFixed(6)),b=Math.min(c.maxProbabilityShift,r.p0,1-r.p7),g=-Math.min(c.maxProbabilityShift,r.p7,1-r.p0),h=Number(L(u,g,b).toFixed(6)),N=Number((r.p7+h).toFixed(6)),M=Number(r.p3.toFixed(6)),R=Number((1-N-M).toFixed(6));return{team:t,tacticalPlanUsed:o,clubSelectedPlan:e,baseDistribution:{...r},offenseRating:n,defenseRating:d,attributeDelta:p,attributeShift:f,tendencyShift:l,rawShift:u,totalShift:h,probabilities:{p0:R,p3:M,p7:N}}}function j(a,t){return a<t.p0?0:a<t.p0+t.p3?3:7}function ve(a,t,e){const s=[...a].sort((n,d)=>{if(t==="club"){const p=n.effectiveAttack*1.4+n.effectiveControl;return d.effectiveAttack*1.4+d.effectiveControl-p}else{const p=n.effectiveDefense*1.4+n.effectiveControl;return d.effectiveDefense*1.4+d.effectiveControl-p}}),i=(e-1)%Math.min(3,s.length),o=(i+1+Math.floor((e-1)/2))%s.length,r=o===i?(i+1)%s.length:o;return{keyPlayer:s[i],supportPlayer:s[r]}}function xe(a){const t=(a*100).toFixed(1);return a>=0?`+${t}%`:`${t}%`}function re(a,t,e){const s=a.map(r=>{let n=0;const d=Math.sign(r.clubScoreBefore-r.opponentScoreBefore),p=Math.sign(r.clubScoreAfter-r.opponentScoreAfter);return d!==p&&(n+=32),r.wasShiftedSwing&&(n+=36),r.points===7?n+=26:r.points===3?n+=14:r.team==="opponent"&&r.points===0?n+=12:r.team==="club"&&r.points===0&&r.keyPlayerFatigue>=35&&(n+=18),r.half===2&&(n+=6),{pos:r,priority:n}});s.sort((r,n)=>n.priority!==r.priority?n.priority-r.priority:n.pos.possessionIndex-r.pos.possessionIndex);const i=s.slice(0,3).map(r=>r.pos).sort((r,n)=>r.possessionIndex-n.possessionIndex),o=new Set;return i.map((r,n)=>{const d=_.filter(u=>o.has(u.id)?!1:r.team==="club"&&r.points===7?u.category==="club_breakthrough_7"||u.category==="tendency_exploit":r.team==="club"&&r.points===3?u.category==="club_clinical_3":r.team==="club"&&r.points===0?r.keyPlayerFatigue>=30?u.category==="fatigue_swing"||u.category==="club_stalled_0":u.category==="club_stalled_0"||u.category==="fatigue_swing":r.team==="opponent"&&r.points===0?u.category==="club_defensive_stand_0":r.team==="opponent"&&r.points===7?u.category==="opponent_punish_7":r.team==="opponent"&&r.points===3?u.category==="opponent_chip_3":!0),p=_.filter(u=>!o.has(u.id)),f=d[0]??p[0]??_[0];o.add(f.id);const l={possessionIndex:r.possessionIndex,half:r.half,team:r.team,points:r.points,tacticalPlan:e,opponentName:t.name,tendencyName:t.tendency.name,keyPlayerName:r.keyPlayerName,keyPlayerRole:r.keyPlayerRole,keyPlayerFatigue:r.keyPlayerFatigue,supportPlayerName:r.supportPlayerName,clubScoreAfter:r.clubScoreAfter,opponentScoreAfter:r.opponentScoreAfter,totalShiftPct:xe(r.totalShift),rollDisplay:r.roll.toFixed(3)};return{eventIndex:n+1,possessionIndex:r.possessionIndex,templateId:f.id,templateTitle:f.title,category:f.category,headline:f.renderHeadline(l),body:f.renderBody(l),team:r.team,points:r.points,roll:r.roll,totalShift:r.totalShift,probabilities:{...r.probabilities}}})}function oe(a){const{fixtureNumber:t,roster:e,starterIds:s,clubPlan:i,prepActions:o,rngState:r}=a;if(s.length!==c.startersCount)throw new Error(`Expected ${c.startersCount} starters, got ${s.length}`);const n=E(t),d=H(e,s),p=K(r),f=p.getState(),l=P({team:"club",clubPlan:i,teamRatings:d,opponent:n}),u=P({team:"opponent",clubPlan:i,teamRatings:d,opponent:n}),b=[];let g=0,h=0;for(let m=1;m<=c.totalPossessions;m++){const x=m%2===1?"club":"opponent",z=m<=8?1:2,v=x==="club"?l:u,V=Number(p.nextFloat().toFixed(6)),D=j(V,v.probabilities),te=j(V,v.baseDistribution),he=D!==te,me=g,be=h;x==="club"?g+=D:h+=D;const k=ve(d.starters,x,m);b.push({possessionIndex:m,half:z,team:x,tacticalPlanUsed:v.tacticalPlanUsed,clubSelectedPlan:i,offenseRating:v.offenseRating,defenseRating:v.defenseRating,attributeDelta:v.attributeDelta,attributeShift:v.attributeShift,tendencyShift:v.tendencyShift,totalShift:v.totalShift,baseProbabilities:{...v.baseDistribution},probabilities:{...v.probabilities},roll:V,points:D,baseOutcomeWithoutShift:te,wasShiftedSwing:he,clubScoreBefore:me,opponentScoreBefore:be,clubScoreAfter:g,opponentScoreAfter:h,keyPlayerId:k.keyPlayer.id,keyPlayerName:k.keyPlayer.name,keyPlayerRole:k.keyPlayer.role,keyPlayerFatigue:k.keyPlayer.fatigue,supportPlayerId:k.supportPlayer.id,supportPlayerName:k.supportPlayer.name})}const N=p.getState(),M=g>h?"W":g<h?"L":"D",R=new Set(s),ue=e.filter(m=>!R.has(m.id)).map(m=>m.id),fe=e.map(m=>{const x=R.has(m.id),z=x?q(m.stamina):c.postMatchReserveFatigueDelta,v=F(m.fatigue+z);return{playerId:m.id,playerName:m.name,wasStarter:x,stamina:m.stamina,fatigueBefore:m.fatigue,fatigueDelta:v-m.fatigue,fatigueAfter:v}}),ge=re(b,n,i);return{matchResult:{fixtureNumber:t,opponentId:n.id,opponentName:n.name,opponentShortName:n.shortName,tendencyName:n.tendency.name,clubPlan:i,opponentPlan:n.defaultPlan,starterIds:[...s],reserveIds:ue,prepActions:o.map(m=>({...m})),teamRatingsAtKickoff:d,opponentRatings:{attack:n.attack,defense:n.defense,control:n.control},rngStateBeforeMatch:f,rngStateAfterMatch:N,possessions:b,clubScore:g,opponentScore:h,outcome:M,decisiveEvents:ge,fatigueTransitions:fe,fatigueApplied:!1,devChoiceApplied:!1,devChoice:null},nextRngState:N}}function y(a,t){const e=Y(a);switch(t.type){case"SET_STARTERS":{if(e.phase!=="preparation")throw new Error("Can only change starters during preparation phase.");const s=Array.from(new Set(t.starterIds));if(s.length!==c.startersCount)throw new Error(`Must select exactly ${c.startersCount} distinct starters.`);const i=new Set(e.roster.map(o=>o.id));for(const o of s)if(!i.has(o))throw new Error(`Unknown player ID in starter list: ${o}`);return e.selectedStarterIds=s,e.commandLog.push(t),e}case"SWAP_STARTER":{if(e.phase!=="preparation")throw new Error("Can only swap starters during preparation phase.");const s=e.selectedStarterIds.indexOf(t.starterId);if(s===-1)throw new Error(`Player ${t.starterId} is not currently a starter.`);if(e.selectedStarterIds.includes(t.reserveId))throw new Error(`Player ${t.reserveId} is already a starter.`);if(!e.roster.some(o=>o.id===t.reserveId))throw new Error(`Unknown reserve player ID: ${t.reserveId}`);return e.selectedStarterIds[s]=t.reserveId,e.commandLog.push(t),e}case"SET_TACTICAL_PLAN":{if(e.phase!=="preparation")throw new Error("Can only change tactical plan during preparation phase.");if(!c.basePlanDistributions[t.plan])throw new Error(`Invalid tactical plan: ${t.plan}`);return e.selectedPlan=t.plan,e.commandLog.push(t),e}case"SPEND_PREP_REST":{if(e.phase!=="preparation")throw new Error("Can only spend preparation points during preparation phase.");if(e.prepPointsRemaining<=0)throw new Error("No preparation points remaining for this fixture.");if(e.prepActionsThisFixture.some(r=>r.playerId===t.playerId))throw new Error("Each player may receive at most one preparation action per fixture.");const s=e.roster.find(r=>r.id===t.playerId);if(!s)throw new Error(`Unknown player ID: ${t.playerId}`);const i=s.fatigue,o=F(s.fatigue+c.restFatigueDelta);return s.fatigue=o,e.prepPointsRemaining-=1,e.prepActionsThisFixture.push({playerId:s.id,playerName:s.name,kind:"rest",fatigueBefore:i,fatigueAfter:o}),e.commandLog.push(t),e}case"SPEND_PREP_TRAIN":{if(e.phase!=="preparation")throw new Error("Can only spend preparation points during preparation phase.");if(e.prepPointsRemaining<=0)throw new Error("No preparation points remaining for this fixture.");if(e.prepActionsThisFixture.some(d=>d.playerId===t.playerId))throw new Error("Each player may receive at most one preparation action per fixture.");if(!I.includes(t.attribute))throw new Error(`Invalid attribute: ${t.attribute}`);const s=e.roster.find(d=>d.id===t.playerId);if(!s)throw new Error(`Unknown player ID: ${t.playerId}`);const i=s[t.attribute];if(i>=c.maxAttribute)throw new Error(`${s.name}'s ${t.attribute} is already at maximum (${c.maxAttribute}).`);const o=B(i+c.trainAttributeDelta),r=s.fatigue,n=F(r+c.trainFatigueDelta);return s[t.attribute]=o,s.fatigue=n,e.prepPointsRemaining-=1,e.prepActionsThisFixture.push({playerId:s.id,playerName:s.name,kind:"train",attribute:t.attribute,fatigueBefore:r,fatigueAfter:n,attributeBefore:i,attributeAfter:o}),e.commandLog.push(t),e}case"RESET_PREP_ACTIONS":{if(e.phase!=="preparation")throw new Error("Can only reset preparation actions during preparation phase.");for(let s=e.prepActionsThisFixture.length-1;s>=0;s--){const i=e.prepActionsThisFixture[s],o=e.roster.find(r=>r.id===i.playerId);o&&(o.fatigue=i.fatigueBefore,i.kind==="train"&&i.attribute&&i.attributeBefore!==void 0&&(o[i.attribute]=i.attributeBefore))}return e.prepActionsThisFixture=[],e.prepPointsRemaining=c.prepPointsPerFixture,e.commandLog.push(t),e}case"COMMIT_MATCH":{if(e.phase!=="preparation")throw new Error("Can only commit match from preparation phase.");const{matchResult:s,nextRngState:i}=oe({fixtureNumber:e.fixtureNumber,roster:e.roster,starterIds:e.selectedStarterIds,clubPlan:e.selectedPlan,prepActions:e.prepActionsThisFixture,rngState:e.rngState});if(e.rngState=i,!s.fatigueApplied){const o=new Set(e.selectedStarterIds);for(const r of e.roster){const n=s.fatigueTransitions.find(d=>d.playerId===r.id);n&&(r.fatigue=n.fatigueAfter),o.has(r.id)?r.matchesStarted+=1:r.matchesBenched+=1}s.fatigueApplied=!0}return e.currentMatch=s,e.seasonHistory.push(s),e.phase="match_review",e.commandLog.push(t),e}case"PROCEED_FROM_MATCH":{if(e.phase!=="match_review")throw new Error("Can only proceed from match_review phase.");return e.fixtureNumber<c.seasonFixtures?e.phase="development":e.phase="season_recap",e.commandLog.push(t),e}case"APPLY_DEVELOPMENT":{if(e.phase!=="development")throw new Error("Can only apply post-match development during development phase.");if(!e.currentMatch)throw new Error("No active match record for post-match development.");if(e.currentMatch.devChoiceApplied)throw new Error("Post-match development has already been applied for this fixture.");if(!I.includes(t.attribute))throw new Error(`Invalid attribute: ${t.attribute}`);const s=e.roster.find(d=>d.id===t.playerId);if(!s)throw new Error(`Unknown player ID: ${t.playerId}`);const i=s[t.attribute];if(i>=c.maxAttribute)throw new Error(`${s.name}'s ${t.attribute} is already at maximum (${c.maxAttribute}).`);const o=B(i+c.postMatchDevAttributeDelta);s[t.attribute]=o;const r={playerId:s.id,playerName:s.name,attribute:t.attribute,beforeValue:i,afterValue:o};e.currentMatch.devChoiceApplied=!0,e.currentMatch.devChoice=r;const n=e.seasonHistory[e.seasonHistory.length-1];return n&&n.fixtureNumber===e.currentMatch.fixtureNumber&&(n.devChoiceApplied=!0,n.devChoice=r),e.fixtureNumber+=1,e.prepPointsRemaining=c.prepPointsPerFixture,e.prepActionsThisFixture=[],e.phase="preparation",e.commandLog.push(t),e}default:{const s=t;throw new Error(`Unhandled command: ${JSON.stringify(s)}`)}}}function Z(a){let t=0,e=0,s=0,i=0,o=0;for(const d of a.seasonHistory)i+=d.clubScore,o+=d.opponentScore,d.outcome==="W"?t+=1:d.outcome==="D"?e+=1:s+=1;const r=a.seasonHistory.length>=c.seasonFixtures,n=t>=c.seasonWinTarget;return{wins:t,draws:e,losses:s,pointsFor:i,pointsAgainst:o,targetWins:c.seasonWinTarget,isComplete:r,succeeded:n}}function U(a,t){let e=w(a);for(;e.phase!=="season_recap";){const o=E(e.fixtureNumber);if(t==="Rotated Patient Matchup"){const n=[...e.roster].sort((l,u)=>{const b=(l.attack+l.defense+l.control*1.25)*$(l.fatigue);return(u.attack+u.defense+u.control*1.25)*$(u.fatigue)-b}).slice(0,5).map(l=>l.id);e=y(e,{type:"SET_STARTERS",starterIds:n});const d=e.roster.filter(l=>e.selectedStarterIds.includes(l.id)).sort((l,u)=>u.fatigue-l.fatigue);for(const l of d){if(e.prepPointsRemaining<=0)break;l.fatigue>=18&&(e=y(e,{type:"SPEND_PREP_REST",playerId:l.id}))}const p=e.roster.filter(l=>e.selectedStarterIds.includes(l.id)&&!e.prepActionsThisFixture.some(u=>u.playerId===l.id)).sort((l,u)=>l.fatigue-u.fatigue);for(const l of p){if(e.prepPointsRemaining<=0)break;const u=l.control<10?"control":l.attack<10?"attack":"defense";l[u]<10&&(e=y(e,{type:"SPEND_PREP_TRAIN",playerId:l.id,attribute:u}))}const f=o.tendency.vulnerableTo==="Aggressive"?o.tendency.clubPlanModifier.Balanced>=.05?"Balanced":"Aggressive":o.tendency.vulnerableTo;e=y(e,{type:"SET_TACTICAL_PLAN",plan:f})}else if(t==="Star-Heavy Aggressive Push"){const n=["p1","p2","p6","p4","p3","p5","p8","p7"].map(g=>e.roster.find(h=>h.id===g)).filter(g=>g.fatigue<=58),d=(n.length>=5?n.slice(0,5):[...e.roster].sort((g,h)=>h.attack+h.control-(g.attack+g.control)).slice(0,5)).map(g=>g.id);e=y(e,{type:"SET_STARTERS",starterIds:d});const p=e.roster.filter(g=>d.includes(g.id)).sort((g,h)=>h.fatigue-g.fatigue),f=p[0];f.fatigue>=24&&e.prepPointsRemaining>0&&(e=y(e,{type:"SPEND_PREP_REST",playerId:f.id}));const l=p[1];l&&l.fatigue>=44&&e.prepPointsRemaining>0&&(e=y(e,{type:"SPEND_PREP_REST",playerId:l.id}));const u=e.roster.filter(g=>d.includes(g.id)&&!e.prepActionsThisFixture.some(h=>h.playerId===g.id)).sort((g,h)=>h.attack-g.attack||g.fatigue-h.fatigue);for(const g of u){if(e.prepPointsRemaining<=0)break;const h=g.attack<10?"attack":g.control<10?"control":"defense";g[h]<10&&(e=y(e,{type:"SPEND_PREP_TRAIN",playerId:g.id,attribute:h}))}const b=o.tendency.clubPlanModifier.Aggressive>=.06?"Aggressive":"Balanced";e=y(e,{type:"SET_TACTICAL_PLAN",plan:b})}else{const r=[...e.roster].sort((d,p)=>p.fatigue-d.fatigue||d.defense-p.defense).slice(0,5).map(d=>d.id);e=y(e,{type:"SET_STARTERS",starterIds:r});for(const d of r.slice(0,2)){const p=e.roster.find(l=>l.id===d),f=p.stamina<10?"stamina":"defense";p[f]<10&&e.prepPointsRemaining>0&&(e=y(e,{type:"SPEND_PREP_TRAIN",playerId:d,attribute:f}))}const n=o.tendency.vulnerableTo==="Patient"?"Aggressive":"Patient";e=y(e,{type:"SET_TACTICAL_PLAN",plan:n})}if(e=y(e,{type:"COMMIT_MATCH"}),e=y(e,{type:"PROCEED_FROM_MATCH"}),e.phase==="development"){const r=t==="Star-Heavy Aggressive Push"?"p1":t==="Rotated Patient Matchup"?"p2":"p7",n=e.roster.find(p=>p.id===r&&p.control<10)??e.roster.find(p=>p.attack<10)??e.roster[0],d=t==="Star-Heavy Aggressive Push"?n.attack<10?"attack":"control":n.control<10?"control":"attack";e=y(e,{type:"APPLY_DEVELOPMENT",playerId:n.id,attribute:d})}}const s=Z(e),i=e.seasonHistory.reduce((o,r)=>o+r.teamRatingsAtKickoff.averageFatigue,0)/e.seasonHistory.length;return{strategy:t,seed:a,wins:s.wins,draws:s.draws,losses:s.losses,succeeded:s.succeeded,totalPointsFor:s.pointsFor,totalPointsAgainst:s.pointsAgainst,averageStarterFatigue:Number(i.toFixed(2)),finalState:e}}function Pe(a=c.documentedStrategySeeds){return{rotatedPatient:a.map(t=>U(t,"Rotated Patient Matchup")),starAggressive:a.map(t=>U(t,"Star-Heavy Aggressive Push"))}}function X(a){if(!a||typeof a!="object")throw new Error("Save data is not a valid object.");const t=a;if(t.rulesVersion!==T)throw new Error(`Incompatible rulesVersion: expected ${T}, got ${String(t.rulesVersion)}`);if(typeof t.seed!="number"||typeof t.rngState!="number"||typeof t.fixtureNumber!="number"||t.fixtureNumber<1||t.fixtureNumber>c.seasonFixtures)throw new Error("Invalid seed, rngState, or fixtureNumber in save state.");const e=["preparation","match_review","development","season_recap"];if(!t.phase||!e.includes(t.phase))throw new Error(`Invalid game phase: ${String(t.phase)}`);if(!Array.isArray(t.roster)||t.roster.length!==c.rosterSize)throw new Error(`Roster must contain exactly ${c.rosterSize} players.`);for(const s of t.roster){if(!s||typeof s.id!="string"||typeof s.name!="string")throw new Error("Invalid player entry in roster.");for(const i of I){if(typeof s[i]!="number")throw new Error(`Player ${s.id} missing numeric attribute ${i}.`);s[i]=B(s[i])}if(typeof s.fatigue!="number")throw new Error(`Player ${s.id} missing numeric fatigue.`);s.fatigue=F(s.fatigue)}if(!Array.isArray(t.selectedStarterIds)||new Set(t.selectedStarterIds).size!==c.startersCount)throw new Error(`selectedStarterIds must contain ${c.startersCount} unique IDs.`);if(!t.selectedPlan||!se.includes(t.selectedPlan))throw new Error(`Invalid selectedPlan: ${String(t.selectedPlan)}`);if(t.currentMatch&&(t.currentMatch.fatigueApplied=!!t.currentMatch.fatigueApplied,t.currentMatch.devChoiceApplied=!!t.currentMatch.devChoiceApplied),Array.isArray(t.seasonHistory))for(const s of t.seasonHistory)s.fatigueApplied=!!s.fatigueApplied,s.devChoiceApplied=!!s.devChoiceApplied;else t.seasonHistory=[];return Y(t)}function Q(a){const t=X(a),e={schemaVersion:1,rulesVersion:T,savedAtIso:new Date().toISOString(),state:t};return JSON.stringify(e,null,2)}function ee(a){let t;try{t=JSON.parse(a)}catch{throw new Error("Corrupted save JSON: unable to parse.")}if(!t||typeof t!="object")throw new Error("Save payload must be a JSON object.");const e=t;if(e.schemaVersion!==1)throw new Error(`Unsupported save schemaVersion: expected 1, got ${String(e.schemaVersion)}`);return X(e.state)}function C(a,t=O){try{if(typeof window>"u"||!window.localStorage)return!1;const e=Q(a);return window.localStorage.setItem(t,e),!0}catch{return!1}}function ne(a=c.defaultSeed,t=O){try{if(typeof window>"u"||!window.localStorage)return{state:w(a),loadedFromSave:!1};const e=window.localStorage.getItem(t);return e?{state:ee(e),loadedFromSave:!0}:{state:w(a),loadedFromSave:!1}}catch(e){const s=e instanceof Error?e.message:"Unknown save error";try{window.localStorage.removeItem(t)}catch{}return{state:w(a),loadedFromSave:!1,recoveredFromError:s}}}function le(a=O){try{typeof window<"u"&&window.localStorage&&window.localStorage.removeItem(a)}catch{}}class de{container;state;debugMode;sound;statusToast=null;selectedPossessionIdx=16;inspectedPossessionIdx=1;playbackTimer=null;isPlayingBack=!1;showSaveModal=!1;importBuffer="";keydownHandler;constructor(t,e){if(this.container=t,this.debugMode=!!e?.debug,this.sound=new ie,e?.initialSeed!==void 0)this.state=w(e.initialSeed),C(this.state);else{const s=ne(c.defaultSeed);this.state=s.state,s.recoveredFromError&&(this.statusToast={text:`Recovered from invalid save data (${s.recoveredFromError}). Started fresh season.`,kind:"warn"})}if(this.state.currentMatch){this.selectedPossessionIdx=this.state.currentMatch.possessions.length;const s=this.state.currentMatch.decisiveEvents[0]?.possessionIndex??1;this.inspectedPossessionIdx=s}this.keydownHandler=s=>{s.target instanceof HTMLInputElement||s.target instanceof HTMLTextAreaElement||s.target instanceof HTMLSelectElement||(s.key==="d"||s.key==="D")&&(s.preventDefault(),this.toggleDebug())},typeof window<"u"&&window.addEventListener("keydown",this.keydownHandler),this.injectStyles(),this.render()}destroy(){this.stopPlayback(),typeof window<"u"&&window.removeEventListener("keydown",this.keydownHandler),this.container.innerHTML=""}getStateSnapshot(){return JSON.parse(JSON.stringify(this.state))}restartWithSeed(t){this.stopPlayback(),this.state=w(t),le(),C(this.state),this.statusToast={text:`Started new 6-fixture season with Seed #${this.state.seed}.`,kind:"good"},this.render()}toggleDebug(t){this.debugMode=t!==void 0?t:!this.debugMode,this.sound.playClick(640),this.render()}dispatch(t,e){try{if(this.state=y(this.state,t),C(this.state),e?this.statusToast={text:e,kind:"good"}:this.statusToast=null,t.type==="COMMIT_MATCH"){this.sound.playWhistle(),this.startAnimatedPlayback();return}else this.sound.playClick();this.render()}catch(s){const i=s instanceof Error?s.message:String(s);this.statusToast={text:i,kind:"warn"},this.render()}}startAnimatedPlayback(){if(this.stopPlayback(),!this.state.currentMatch){this.render();return}this.isPlayingBack=!0,this.selectedPossessionIdx=1,this.inspectedPossessionIdx=1,this.render();const t=this.state.currentMatch.possessions[0];t&&this.sound.playPossessionChime(t.team,t.points),typeof window<"u"&&(this.playbackTimer=window.setInterval(()=>{if(!this.state.currentMatch){this.stopPlayback();return}if(this.selectedPossessionIdx<c.totalPossessions){this.selectedPossessionIdx+=1,this.inspectedPossessionIdx=this.selectedPossessionIdx;const e=this.state.currentMatch.possessions[this.selectedPossessionIdx-1];e&&this.sound.playPossessionChime(e.team,e.points),this.render()}else{this.stopPlayback();const e=this.state.currentMatch.decisiveEvents[0]?.possessionIndex??16;this.inspectedPossessionIdx=e,this.sound.playWhistle(),this.render()}},280))}stopPlayback(){this.playbackTimer!==null&&typeof window<"u"&&window.clearInterval(this.playbackTimer),this.playbackTimer=null,this.isPlayingBack=!1}skipToFullTime(){this.stopPlayback(),this.selectedPossessionIdx=c.totalPossessions,this.state.currentMatch&&(this.inspectedPossessionIdx=this.state.currentMatch.decisiveEvents[0]?.possessionIndex??16),this.sound.playWhistle(),this.render()}injectStyles(){if(typeof document>"u"||document.getElementById("oms-game01-styles"))return;const t=document.createElement("style");t.id="oms-game01-styles",t.textContent=`
      .oms-root {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: radial-gradient(circle at top, #13221d 0%, #0b1411 55%, #070c0a 100%);
        color: #f1f5f9;
        min-height: 100%;
        padding: 14px;
        box-sizing: border-box;
      }
      .oms-shell {
        max-width: 1240px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .oms-topbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        background: rgba(15, 29, 24, 0.92);
        border: 1px solid rgba(52, 211, 153, 0.28);
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
      .oms-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .oms-crest {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
      }
      .oms-title-group h1 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #ecfdf5;
      }
      .oms-title-group p {
        margin: 2px 0 0;
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .oms-record-pills {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .oms-pill {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 999px;
        padding: 5px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #e2e8f0;
      }
      .oms-pill.accent {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(52, 211, 153, 0.45);
        color: #6ee7b7;
      }
      .oms-pill.warn {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(251, 191, 36, 0.45);
        color: #fde68a;
      }
      .oms-btn {
        cursor: pointer;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: #1e293b;
        color: #f8fafc;
        border-radius: 8px;
        padding: 6px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        transition: all 0.14s ease;
      }
      .oms-btn:hover:not(:disabled) {
        background: #334155;
        border-color: #94a3b8;
      }
      .oms-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }
      .oms-btn.primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: #34d399;
        color: #022c22;
        font-weight: 800;
      }
      .oms-btn.primary:hover:not(:disabled) {
        filter: brightness(1.08);
      }
      .oms-btn.amber {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(251, 191, 36, 0.55);
        color: #fde68a;
      }
      .oms-btn.sky {
        background: rgba(14, 165, 233, 0.2);
        border-color: rgba(56, 189, 248, 0.55);
        color: #bae6fd;
      }
      .oms-toast {
        padding: 9px 14px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .oms-toast.good {
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(52, 211, 153, 0.45);
        color: #a7f3d0;
      }
      .oms-toast.warn {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(251, 191, 36, 0.5);
        color: #fde68a;
      }
      .oms-toast.info {
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(96, 165, 250, 0.45);
        color: #bfdbfe;
      }
      .oms-fixture-track {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
      }
      .oms-fixture-step {
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
        padding: 7px 9px;
        font-size: 0.74rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .oms-fixture-step.current {
        border-color: #34d399;
        background: rgba(16, 185, 129, 0.14);
      }
      .oms-badge-w { color: #34d399; font-weight: 800; }
      .oms-badge-d { color: #fbbf24; font-weight: 800; }
      .oms-badge-l { color: #f87171; font-weight: 800; }
      .oms-main-grid {
        display: grid;
        grid-template-columns: 1.08fr 0.92fr;
        gap: 14px;
      }
      @media (max-width: 960px) {
        .oms-main-grid {
          grid-template-columns: 1fr;
        }
        .oms-fixture-track {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .oms-panel {
        background: rgba(15, 25, 22, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .oms-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        padding-bottom: 8px;
      }
      .oms-panel-header h2 {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .oms-scouting-box {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        padding: 11px 13px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .oms-roster-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-player-card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-player-card.starter {
        border-color: rgba(52, 211, 153, 0.55);
        background: rgba(6, 78, 59, 0.24);
      }
      .oms-player-card.tired-warn {
        border-color: rgba(251, 191, 36, 0.65);
      }
      .oms-player-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .oms-role-tag {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        background: #334155;
        color: #e2e8f0;
      }
      .oms-role-tag.FWD { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
      .oms-role-tag.MID { background: rgba(59, 130, 246, 0.25); color: #93c5fd; }
      .oms-role-tag.DEF { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; }
      .oms-role-tag.UTL { background: rgba(168, 85, 247, 0.25); color: #d8b4fe; }
      .oms-stats-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
        font-size: 0.75rem;
      }
      .oms-stat-chip {
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 6px;
        padding: 4px 6px;
        text-align: center;
      }
      .oms-stat-chip .eff {
        color: #34d399;
        font-weight: 700;
      }
      .oms-fatigue-bar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
      }
      .oms-fatigue-bar {
        flex: 1;
        height: 7px;
        background: #1e293b;
        border-radius: 999px;
        overflow: hidden;
      }
      .oms-fatigue-fill {
        height: 100%;
        border-radius: 999px;
      }
      .oms-prep-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: center;
      }
      .oms-plan-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      @media (max-width: 600px) {
        .oms-plan-grid {
          grid-template-columns: 1fr;
        }
      }
      .oms-plan-card {
        cursor: pointer;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 9px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: all 0.14s ease;
      }
      .oms-plan-card.selected {
        border-color: #34d399;
        background: rgba(16, 185, 129, 0.18);
        box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.4);
      }
      .oms-pitch-canvas {
        width: 100%;
        height: 250px;
        border-radius: 10px;
        border: 1px solid rgba(52, 211, 153, 0.35);
        background: #0d3b29;
        display: block;
      }
      .oms-possession-strip {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 6px;
      }
      .oms-pos-pill {
        cursor: pointer;
        border-radius: 7px;
        padding: 6px 4px;
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 23, 42, 0.85);
      }
      .oms-pos-pill.active {
        outline: 2px solid #f8fafc;
      }
      .oms-pos-pill.club-7 { background: rgba(16, 185, 129, 0.32); border-color: #34d399; color: #a7f3d0; }
      .oms-pos-pill.club-3 { background: rgba(16, 185, 129, 0.16); border-color: rgba(52, 211, 153, 0.45); color: #6ee7b7; }
      .oms-pos-pill.club-0 { background: rgba(30, 41, 59, 0.7); color: #94a3b8; }
      .oms-pos-pill.opp-7 { background: rgba(239, 68, 68, 0.32); border-color: #f87171; color: #fecaca; }
      .oms-pos-pill.opp-3 { background: rgba(245, 158, 11, 0.22); border-color: #fbbf24; color: #fde68a; }
      .oms-pos-pill.opp-0 { background: rgba(16, 185, 129, 0.12); color: #cbd5e1; }
      .oms-decisive-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-decisive-card {
        background: rgba(15, 23, 42, 0.85);
        border-left: 4px solid #34d399;
        border-radius: 8px;
        padding: 10px 12px;
      }
      .oms-debug-panel {
        background: rgba(9, 13, 22, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.45);
        border-radius: 10px;
        padding: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.74rem;
        overflow-x: auto;
      }
      .oms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.74rem;
      }
      .oms-table th, .oms-table td {
        padding: 5px 7px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        text-align: left;
      }
      .oms-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 16px;
      }
      .oms-modal {
        background: #0f172a;
        border: 1px solid rgba(52, 211, 153, 0.45);
        border-radius: 12px;
        max-width: 640px;
        width: 100%;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .oms-textarea {
        width: 100%;
        min-height: 160px;
        background: #020617;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 8px;
        font-family: monospace;
        font-size: 0.74rem;
        box-sizing: border-box;
      }
    `,document.head.appendChild(t)}render(){const t=Z(this.state),e=E(this.state.fixtureNumber);this.container.innerHTML=`
      <div class="oms-root" data-game-id="01-one-more-season" data-phase="${this.state.phase}">
        <div class="oms-shell">
          ${this.renderTopBar(t)}
          ${this.statusToast?`<div class="oms-toast ${this.statusToast.kind}"><span>${this.escapeHtml(this.statusToast.text)}</span><button class="oms-btn" data-action="dismiss-toast">✕</button></div>`:""}
          ${this.renderFixtureTrack()}
          ${this.state.phase==="preparation"?this.renderPreparationView(e):""}
          ${this.state.phase==="match_review"?this.renderMatchReviewView(e):""}
          ${this.state.phase==="development"?this.renderDevelopmentView(e):""}
          ${this.state.phase==="season_recap"?this.renderSeasonRecapView(t):""}
          ${this.debugMode?this.renderDebugInspector(e):""}
          ${this.showSaveModal?this.renderSaveModal():""}
        </div>
      </div>
    `,this.drawPitchCanvas(e),this.bindEvents()}renderTopBar(t){return`
      <header class="oms-topbar">
        <div class="oms-brand">
          <svg class="oms-crest" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M8 10 L32 4 L56 10 L56 34 C56 48 32 58 32 60 C32 58 8 48 8 34 Z" fill="#065f46" stroke="#34d399" stroke-width="3"/>
            <circle cx="32" cy="30" r="11" fill="#10b981" opacity="0.25"/>
            <path d="M22 36 L32 18 L42 36 Z" fill="#fbbf24"/>
          </svg>
          <div class="oms-title-group">
            <h1>${c.clubName} — One More Season</h1>
            <p>Five-a-Side Club Management • Win ≥ ${c.seasonWinTarget} of ${c.seasonFixtures} Fixtures (Draws = 0 Wins)</p>
          </div>
        </div>
        <div class="oms-record-pills">
          <span class="oms-pill accent" data-testid="season-record">Record: ${t.wins}W - ${t.draws}D - ${t.losses}L</span>
          <span class="oms-pill ${t.wins>=c.seasonWinTarget?"accent":"warn"}">Target: ${t.wins}/${c.seasonWinTarget} Wins</span>
          <span class="oms-pill">Fixture ${this.state.fixtureNumber}/${c.seasonFixtures}</span>
          <span class="oms-pill">Seed #${this.state.seed}</span>
          <button class="oms-btn ${this.debugMode?"sky":""}" data-action="toggle-debug" title="Keyboard shortcut: [D]">
            ${this.debugMode?"Hide [D] Math":"[D] Math Inspector"}
          </button>
          <button class="oms-btn" data-action="toggle-mute">
            ${this.sound.isMuted()?"🔇 Muted":"🔊 Audio"}
          </button>
          <button class="oms-btn" data-action="open-save-modal">Save / Seed</button>
        </div>
      </header>
    `}renderFixtureTrack(){const t=[];for(let e=1;e<=c.seasonFixtures;e++){const s=E(e),i=this.state.seasonHistory.find(n=>n.fixtureNumber===e),o=e===this.state.fixtureNumber&&this.state.phase!=="season_recap";let r='<span style="color:#64748b">Upcoming</span>';i&&(r=`<span class="${i.outcome==="W"?"oms-badge-w":i.outcome==="D"?"oms-badge-d":"oms-badge-l"}">${i.outcome} ${i.clubScore}–${i.opponentScore}</span>`),t.push(`
        <div class="oms-fixture-step ${o?"current":""}">
          <div>
            <strong>F${e}: ${s.shortName}</strong>
            <div style="font-size:0.68rem;color:#94a3b8">${s.tendency.vulnerableTo} weak</div>
          </div>
          ${r}
        </div>
      `)}return`<section class="oms-fixture-track">${t.join("")}</section>`}renderPreparationView(t){const e=H(this.state.roster,this.state.selectedStarterIds),s=P({team:"club",clubPlan:this.state.selectedPlan,teamRatings:e,opponent:t}),i=P({team:"opponent",clubPlan:this.state.selectedPlan,teamRatings:e,opponent:t}),o=this.state.roster.filter(d=>this.state.selectedStarterIds.includes(d.id)),r=this.state.roster.filter(d=>!this.state.selectedStarterIds.includes(d.id)),n=o.filter(d=>d.fatigue>=40);return`
      <div class="oms-main-grid">
        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>1. Squad Selection & Preparation (${this.state.prepPointsRemaining}/${c.prepPointsPerFixture} Prep Points Left)</h2>
            <div style="display:flex;gap:6px;align-items:center">
              ${this.state.prepActionsThisFixture.length>0?`<button class="oms-btn" data-action="reset-prep">Undo Prep (${this.state.prepActionsThisFixture.length})</button>`:""}
            </div>
          </div>

          <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.4">
            Choose <strong>5 starters</strong> (gain <code>24 - Stamina</code> fatigue after match) and <strong>3 reserves</strong> (recover <code>-18</code> fatigue).
            Spend up to <strong>2 Prep Points</strong> (max 1 per player): <strong>Rest (-24 Fatigue)</strong> or <strong>Train (+1 Stat, +8 Fatigue)</strong>.
          </div>

          ${n.length>0?`<div class="oms-toast warn" style="padding:7px 11px">
                  <span>⚠️ Starter Fatigue Alert: ${n.map(d=>`${d.name} (${d.fatigue}% fatigue → ${($(d.fatigue)*100).toFixed(0)}% eff.)`).join(", ")}. Consider Resting (-24) or swapping in a fresh Reserve!</span>
                </div>`:""}

          <div style="font-size:0.8rem;font-weight:700;color:#6ee7b7">Starting Lineup (5 of 8)</div>
          <div class="oms-roster-list">
            ${o.map(d=>this.renderPlayerCard(d,!0,r)).join("")}
          </div>

          <div style="font-size:0.8rem;font-weight:700;color:#94a3b8;margin-top:4px">Bench Reserves (3 of 8 — Auto-Rest -18 Fatigue After Match)</div>
          <div class="oms-roster-list">
            ${r.map(d=>this.renderPlayerCard(d,!1,o)).join("")}
          </div>
        </div>

        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>2. Fixture ${this.state.fixtureNumber} Scouting & Tactical Plan</h2>
            <span class="oms-pill warn">Tendency: ${t.tendency.name}</span>
          </div>

          <div class="oms-scouting-box">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <strong style="font-size:0.95rem;color:#fef3c7">vs ${t.name} (${t.nickname})</strong>
              <span style="font-size:0.76rem;color:#fde68a">Vulnerable to: <strong>${t.tendency.vulnerableTo}</strong></span>
            </div>
            <div style="font-size:0.8rem;color:#e2e8f0;line-height:1.45">${t.scoutingReport}</div>
            <div style="font-size:0.76rem;color:#6ee7b7;font-weight:600">${t.tacticalHint}</div>
            <div style="display:flex;gap:12px;font-size:0.75rem;color:#94a3b8;margin-top:2px">
              <span>Opp Attack: <strong>${t.attack}</strong></span>
              <span>Opp Defense: <strong>${t.defense}</strong></span>
              <span>Opp Control: <strong>${t.control}</strong></span>
              <span>Opp Base Style: <strong>${t.defaultPlan}</strong></span>
            </div>
          </div>

          <canvas id="oms-pitch-canvas" class="oms-pitch-canvas" width="600" height="260"></canvas>

          <div style="font-size:0.82rem;font-weight:700;color:#f8fafc">Choose Tactical Plan (8 Possessions Each)</div>
          <div class="oms-plan-grid">
            ${G.map(d=>{const p=this.state.selectedPlan===d.id,f=t.tendency.clubPlanModifier[d.id],l=f>=0?`+${(f*100).toFixed(0)}%`:`${(f*100).toFixed(0)}%`;return`
                <div class="oms-plan-card ${p?"selected":""}" data-action="select-plan" data-plan="${d.id}">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <strong>${d.id}</strong>
                    <span class="oms-pill ${f>.05?"accent":f<0?"warn":""}" style="padding:2px 7px;font-size:0.7rem">
                      Tendency ${l}
                    </span>
                  </div>
                  <div style="font-size:0.72rem;color:#cbd5e1">${d.description}</div>
                  <div style="font-size:0.7rem;color:#94a3b8">
                    Base: 0pt ${(d.baseDistribution.p0*100).toFixed(0)}% • 3pt ${(d.baseDistribution.p3*100).toFixed(0)}% • 7pt ${(d.baseDistribution.p7*100).toFixed(0)}%
                  </div>
                </div>
              `}).join("")}
          </div>

          <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(52,211,153,0.3);border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem">
              <span><strong>Live Possession Odds Preview</strong> (${this.state.selectedPlan})</span>
              <span style="color:#6ee7b7">Shift: ${s.totalShift>=0?"+":""}${(s.totalShift*100).toFixed(1)}% (Cap ±15%)</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.75rem">
              <div>
                <div style="color:#94a3b8;margin-bottom:2px">Ironvale Attack (${e.effectiveAttack.toFixed(1)} ATK + ${e.effectiveControl.toFixed(1)} CTL vs ${t.defense+t.control})</div>
                <div>0 pts: <strong>${(s.probabilities.p0*100).toFixed(1)}%</strong> • 3 pts: <strong>${(s.probabilities.p3*100).toFixed(1)}%</strong> • 7 pts: <strong style="color:#34d399">${(s.probabilities.p7*100).toFixed(1)}%</strong></div>
              </div>
              <div>
                <div style="color:#94a3b8;margin-bottom:2px">${t.shortName} Attack (${t.attack+t.control} vs Ironvale ${e.effectiveDefense.toFixed(1)} DEF + ${e.effectiveControl.toFixed(1)} CTL)</div>
                <div>0 pts: <strong>${(i.probabilities.p0*100).toFixed(1)}%</strong> • 3 pts: <strong>${(i.probabilities.p3*100).toFixed(1)}%</strong> • 7 pts: <strong style="color:#f87171">${(i.probabilities.p7*100).toFixed(1)}%</strong></div>
              </div>
            </div>
          </div>

          <button class="oms-btn primary" style="padding:12px;font-size:0.95rem" data-action="commit-match" data-testid="commit-match-btn">
            ⚽ Commit Lineup & Kick Off Fixture ${this.state.fixtureNumber} (16 Possessions)
          </button>
        </div>
      </div>
    `}renderPlayerCard(t,e,s){const i=$(t.fatigue),o=S(t.attack,t.fatigue),r=S(t.defense,t.fatigue),n=S(t.control,t.fatigue),d=this.state.prepActionsThisFixture.find(l=>l.playerId===t.id),p=this.state.prepPointsRemaining>0&&!d,f=t.fatigue>=45?"#f59e0b":t.fatigue>=25?"#38bdf8":"#10b981";return`
      <div class="oms-player-card ${e?"starter":""} ${e&&t.fatigue>=45?"tired-warn":""}" data-player-id="${t.id}">
        <div class="oms-player-top">
          <div style="display:flex;align-items:center;gap:7px">
            <span class="oms-role-tag ${t.role}">${t.role}</span>
            <strong>#${t.number} ${t.name}</strong>
            <span style="font-size:0.72rem;color:#94a3b8">(${t.roleTitle})</span>
            ${d?`<span class="oms-pill accent" style="padding:1px 7px;font-size:0.68rem">Prepped: ${d.kind==="rest"?"Rested -24":`Trained +1 ${d.attribute}`}</span>`:""}
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${e?`<select class="oms-btn" style="padding:3px 7px;font-size:0.72rem" data-action="swap-starter-select" data-starter-id="${t.id}" aria-label="Swap starter ${t.name}">
                    <option value="">Swap with Reserve...</option>
                    ${s.map(l=>`<option value="${l.id}">⇄ #${l.number} ${l.name} (${l.role}, Fat ${l.fatigue}%)</option>`).join("")}
                  </select>`:`<button class="oms-btn" style="padding:3px 8px;font-size:0.72rem" data-action="quick-sub-in" data-reserve-id="${t.id}">
                    Sub In for Most Tired Starter
                  </button>`}
          </div>
        </div>

        <div class="oms-stats-row">
          <div class="oms-stat-chip" title="Effective Attack = Attack × (1 - Fatigue/200)">
            ATK <strong>${t.attack}</strong> <span class="eff">(${o.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Effective Defense = Defense × (1 - Fatigue/200)">
            DEF <strong>${t.defense}</strong> <span class="eff">(${r.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Effective Control = Control × (1 - Fatigue/200)">
            CTL <strong>${t.control}</strong> <span class="eff">(${n.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Stamina reduces post-match starter fatigue gain (24 - Stamina)">
            STA <strong>${t.stamina}</strong> <span style="color:#94a3b8">(+${q(t.stamina)}/gm)</span>
          </div>
        </div>

        <div class="oms-fatigue-bar-wrap">
          <span>Fatigue: <strong>${t.fatigue}%</strong> (${(i*100).toFixed(1)}% eff.)</span>
          <div class="oms-fatigue-bar">
            <div class="oms-fatigue-fill" style="width:${t.fatigue}%;background:${f}"></div>
          </div>
        </div>

        <div class="oms-prep-actions">
          <button class="oms-btn amber" style="padding:3px 8px;font-size:0.71rem"
            data-action="prep-rest" data-player-id="${t.id}"
            ${!p||t.fatigue===0?"disabled":""}>
            Rest (-24 Fat)
          </button>
          ${I.map(l=>`
            <button class="oms-btn sky" style="padding:3px 7px;font-size:0.71rem"
              data-action="prep-train" data-player-id="${t.id}" data-attr="${l}"
              ${!p||t[l]>=c.maxAttribute?"disabled":""}>
              +1 ${A[l].slice(0,3).toUpperCase()} (+8 Fat)
            </button>
          `).join("")}
        </div>
      </div>
    `}renderMatchReviewView(t){const e=this.state.currentMatch;if(!e)return"";const s=e.possessions.slice(0,this.selectedPossessionIdx),i=s[s.length-1]??e.possessions[0],o=e.possessions[Math.min(this.inspectedPossessionIdx,this.selectedPossessionIdx)-1]??i,r=e.outcome==="W"?"VICTORY (+1 Win Toward Target)":e.outcome==="D"?"DRAW (0 Wins Toward Target)":"DEFEAT (0 Wins Toward Target)";return`
      <div class="oms-main-grid">
        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>Fixture ${e.fixtureNumber} Tactical Playback — ${c.clubName} vs ${e.opponentName}</h2>
            <div style="display:flex;gap:6px">
              ${this.selectedPossessionIdx<c.totalPossessions?`<button class="oms-btn" data-action="step-possession">Step +1 (${this.selectedPossessionIdx}/16)</button>
                     <button class="oms-btn primary" data-action="skip-playback">Full Time (All 16)</button>`:'<span class="oms-pill accent">Full Time (16/16 Possessions)</span>'}
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(15,23,42,0.9);padding:12px 16px;border-radius:10px;border:1px solid rgba(52,211,153,0.3)">
            <div>
              <div style="font-size:0.75rem;color:#94a3b8">${c.clubName} (${e.clubPlan})</div>
              <div style="font-size:1.65rem;font-weight:900;color:#34d399" data-testid="match-club-score">${i.clubScoreAfter}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:0.75rem;color:#cbd5e1">Possession ${i.possessionIndex} of 16 (Half ${i.half})</div>
              <div style="font-size:0.86rem;font-weight:800;color:#fbbf24">${this.selectedPossessionIdx===16?r:"Match in Progress..."}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.75rem;color:#94a3b8">${e.opponentName} (${e.opponentPlan})</div>
              <div style="font-size:1.65rem;font-weight:900;color:#f87171" data-testid="match-opp-score">${i.opponentScoreAfter}</div>
            </div>
          </div>

          <canvas id="oms-pitch-canvas" class="oms-pitch-canvas" width="600" height="260"></canvas>

          <div style="font-size:0.78rem;font-weight:700;color:#cbd5e1">16-Possession Timeline (Click any possession to inspect roll & math)</div>
          <div class="oms-possession-strip">
            ${e.possessions.map(n=>{if(!(n.possessionIndex<=this.selectedPossessionIdx))return`<div class="oms-pos-pill" style="opacity:0.3">#${n.possessionIndex}<br/>—</div>`;const p=`${n.team==="club"?"club":"opp"}-${n.points}`,f=n.possessionIndex===o.possessionIndex;return`
                <button class="oms-pos-pill ${p} ${f?"active":""}"
                  data-action="inspect-possession" data-pos-idx="${n.possessionIndex}">
                  #${n.possessionIndex} ${n.team==="club"?"IRV":e.opponentShortName}<br/>
                  +${n.points} pts
                </button>
              `}).join("")}
          </div>

          <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.25);border-radius:8px;padding:10px 12px;font-size:0.78rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <strong>Possession #${o.possessionIndex} Breakdown (${o.team==="club"?c.clubName:e.opponentName} — ${o.tacticalPlanUsed})</strong>
              <span class="oms-pill">${o.points} Points Scored</span>
            </div>
            <div style="color:#cbd5e1">
              Actors: <strong>${o.keyPlayerName}</strong> (${o.keyPlayerFatigue}% fatigue) & <strong>${o.supportPlayerName}</strong> •
              Offense <code>${o.offenseRating.toFixed(1)}</code> vs Defense <code>${o.defenseRating.toFixed(1)}</code> •
              Attr Shift <code>${(o.attributeShift*100).toFixed(1)}%</code> + Tendency <code>${(o.tendencyShift*100).toFixed(1)}%</code> =
              Total Shift <strong>${o.totalShift>=0?"+":""}${(o.totalShift*100).toFixed(1)}%</strong>
            </div>
            <div style="color:#94a3b8;margin-top:3px">
              Probabilities: 0pt <code>${(o.probabilities.p0*100).toFixed(1)}%</code> | 3pt <code>${(o.probabilities.p3*100).toFixed(1)}%</code> | 7pt <code>${(o.probabilities.p7*100).toFixed(1)}%</code> •
              RNG Roll: <code>${o.roll.toFixed(4)}</code>
              ${o.wasShiftedSwing?`<strong style="color:#fbbf24"> ★ Matchup/Fatigue Shift Changed Outcome (Base would be ${o.baseOutcomeWithoutShift} pts)!</strong>`:""}
            </div>
          </div>
        </div>

        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>3 Decisive Match Events & Fatigue Update</h2>
            <span class="oms-pill">12 Recap Templates</span>
          </div>

          <div class="oms-decisive-list">
            ${e.decisiveEvents.map(n=>`
              <div class="oms-decisive-card" data-testid="decisive-event-card" data-template-id="${n.templateId}">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:#6ee7b7;margin-bottom:3px">
                  <span>Decisive Event #${n.eventIndex} • ${n.templateTitle} (${n.templateId})</span>
                  <span>Roll ${n.roll.toFixed(3)} • Shift ${n.totalShift>=0?"+":""}${(n.totalShift*100).toFixed(1)}%</span>
                </div>
                <div style="font-weight:700;font-size:0.86rem;color:#f8fafc;margin-bottom:4px">${this.escapeHtml(n.headline)}</div>
                <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.4">${this.escapeHtml(n.body)}</div>
              </div>
            `).join("")}
          </div>

          <div style="font-size:0.8rem;font-weight:700;color:#cbd5e1;margin-top:4px">
            Post-Match Fatigue Ledger (Starters: +[24 − Stamina] • Reserves: −18)
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;font-size:0.74rem">
            ${e.fatigueTransitions.map(n=>`
              <div style="background:rgba(15,23,42,0.75);padding:6px 8px;border-radius:6px;display:flex;justify-content:space-between">
                <span>${n.playerName} (${n.wasStarter?`Starter, STA ${n.stamina}`:"Reserve"})</span>
                <strong style="color:${n.fatigueDelta>0?"#fbbf24":"#34d399"}">
                  ${n.fatigueBefore}% → ${n.fatigueAfter}% (${n.fatigueDelta>=0?`+${n.fatigueDelta}`:n.fatigueDelta})
                </strong>
              </div>
            `).join("")}
          </div>

          <button class="oms-btn primary" style="padding:12px;font-size:0.95rem;margin-top:auto" data-action="proceed-from-match" data-testid="proceed-from-match-btn">
            ${this.state.fixtureNumber<c.seasonFixtures?"Continue to Post-Match Development (+1 Attribute, 0 Fatigue) →":"Finish Fixture 6 & View Season Recap →"}
          </button>
        </div>
      </div>
    `}renderDevelopmentView(t){return`
      <div class="oms-panel">
        <div class="oms-panel-header">
          <h2>Fixture ${this.state.fixtureNumber} Post-Match Breakthrough (Zero Fatigue Cost)</h2>
          <span class="oms-pill accent">1 Bounded Choice before Fixture ${this.state.fixtureNumber+1}</span>
        </div>
        <div style="font-size:0.84rem;color:#cbd5e1">
          Following the match against <strong>${t.name}</strong>, award <strong>+1 Attribute</strong> (up to 10) to one player on your squad at <strong>0 fatigue cost</strong>.
        </div>
        <div class="oms-roster-list">
          ${this.state.roster.map(e=>`
            <div class="oms-player-card" data-dev-player-id="${e.id}">
              <div class="oms-player-top">
                <div>
                  <span class="oms-role-tag ${e.role}">${e.role}</span>
                  <strong>#${e.number} ${e.name}</strong>
                  <span style="font-size:0.74rem;color:#94a3b8"> • Fatigue: ${e.fatigue}%</span>
                </div>
                <div class="oms-prep-actions">
                  ${I.map(s=>`
                    <button class="oms-btn primary" style="padding:5px 10px;font-size:0.75rem"
                      data-action="apply-dev" data-player-id="${e.id}" data-attr="${s}"
                      ${e[s]>=c.maxAttribute?"disabled":""}>
                      +1 ${A[s]} (${e[s]} → ${Math.min(10,e[s]+1)})
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `}renderSeasonRecapView(t){return`
      <div class="oms-panel" data-testid="season-recap-panel">
        <div class="oms-panel-header">
          <h2>Season Complete — ${c.clubName} Six-Fixture Verdict</h2>
          <span class="oms-pill ${t.succeeded?"accent":"warn"}">
            ${t.succeeded?"🏆 SEASON TARGET ACHIEVED (≥ 4 WINS)":"⚠️ SEASON TARGET MISSED (< 4 WINS)"}
          </span>
        </div>

        <div style="background:rgba(15,23,42,0.88);border:1px solid ${t.succeeded?"#34d399":"#f59e0b"};border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:1.3rem;font-weight:900;color:${t.succeeded?"#34d399":"#fde68a"}">
              Final Record: ${t.wins} Wins – ${t.draws} Draws – ${t.losses} Losses
            </div>
            <div style="font-size:0.84rem;color:#cbd5e1;margin-top:4px">
              ${t.succeeded?`The Supporters' Trust renews Ironvale Rovers FC! You secured ${t.wins} wins across 6 fixtures (${t.pointsFor} pts scored, ${t.pointsAgainst} pts allowed).`:`Ironvale Rovers FC finished with ${t.wins} wins (Draws count as 0 wins toward the 4-win target). Total score: ${t.pointsFor}–${t.pointsAgainst}.`}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="oms-btn primary" style="padding:10px 16px;font-size:0.9rem" data-action="new-season-next-seed" data-testid="play-again-btn">
              🔄 Play One More Season (Seed #${this.state.seed+1})
            </button>
            <button class="oms-btn" style="padding:10px 14px" data-action="replay-same-seed">
              Replay Seed #${this.state.seed}
            </button>
          </div>
        </div>

        <div style="font-size:0.86rem;font-weight:700;color:#f8fafc">Six-Fixture Campaign Ledger</div>
        <table class="oms-table">
          <thead>
            <tr>
              <th>Fixture</th>
              <th>Opponent & Tendency</th>
              <th>Club Plan</th>
              <th>Score</th>
              <th>Result</th>
              <th>Post-Match Breakthrough</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.seasonHistory.map(e=>`
              <tr>
                <td>F${e.fixtureNumber}</td>
                <td>${e.opponentName} <span style="color:#94a3b8">(${e.tendencyName})</span></td>
                <td>${e.clubPlan}</td>
                <td><strong>${e.clubScore} – ${e.opponentScore}</strong></td>
                <td><span class="oms-badge-${e.outcome.toLowerCase()}">${e.outcome}</span></td>
                <td>${e.devChoice?`${e.devChoice.playerName} +1 ${A[e.devChoice.attribute]} (${e.devChoice.beforeValue}→${e.devChoice.afterValue})`:"Season Finale"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}renderDebugInspector(t){const e=H(this.state.roster,this.state.selectedStarterIds),s=P({team:"club",clubPlan:this.state.selectedPlan,teamRatings:e,opponent:t}),i=P({team:"opponent",clubPlan:this.state.selectedPlan,teamRatings:e,opponent:t}),o=this.state.currentMatch;return`
      <section class="oms-debug-panel" data-testid="debug-inspector">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:#38bdf8">🔍 MATH & COUNTERFACTUAL INSPECTOR (Rules v${c.rulesVersion})</strong>
          <span>Seed: <code>${this.state.seed}</code> • RNG State: <code>${this.state.rngState}</code> • Commands Logged: <code>${this.state.commandLog.length}</code></span>
        </div>
        <div style="margin-bottom:8px;color:#cbd5e1">
          Formula Contract: <code>effectiveStat = rawStat × (1 - fatigue / 200)</code> |
          Post-Match Fatigue: <code>Starters +(24 - Stamina), Reserves -18</code> |
          Shift: <code>clamp((Offense - Defense) × 0.008 + tendencyModifier, -0.15, +0.15)</code>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div style="background:rgba(15,23,42,0.9);padding:8px;border-radius:6px">
            <strong>Club Possession Math (${this.state.selectedPlan})</strong><br/>
            Offense (ATK+CTL): ${s.offenseRating.toFixed(2)} vs Opp Def (DEF+CTL): ${s.defenseRating.toFixed(2)}<br/>
            AttrShift: ${(s.attributeShift*100).toFixed(2)}% | TendencyShift: ${(s.tendencyShift*100).toFixed(2)}% | TotalShift: ${(s.totalShift*100).toFixed(2)}%<br/>
            P(0)=${(s.probabilities.p0*100).toFixed(2)}% | P(3)=${(s.probabilities.p3*100).toFixed(2)}% | P(7)=${(s.probabilities.p7*100).toFixed(2)}% (Sum=${((s.probabilities.p0+s.probabilities.p3+s.probabilities.p7)*100).toFixed(1)}%)
          </div>
          <div style="background:rgba(15,23,42,0.9);padding:8px;border-radius:6px">
            <strong>Opponent Possession Math (${t.defaultPlan})</strong><br/>
            Opp Offense (ATK+CTL): ${i.offenseRating.toFixed(2)} vs Club Def (DEF+CTL): ${i.defenseRating.toFixed(2)}<br/>
            AttrShift: ${(i.attributeShift*100).toFixed(2)}% | TendencyShift: ${(i.tendencyShift*100).toFixed(2)}% | TotalShift: ${(i.totalShift*100).toFixed(2)}%<br/>
            P(0)=${(i.probabilities.p0*100).toFixed(2)}% | P(3)=${(i.probabilities.p3*100).toFixed(2)}% | P(7)=${(i.probabilities.p7*100).toFixed(2)}% (Sum=${((i.probabilities.p0+i.probabilities.p3+i.probabilities.p7)*100).toFixed(1)}%)
          </div>
        </div>
        ${o?`<table class="oms-table">
                <thead>
                  <tr>
                    <th>#</th><th>Team</th><th>Plan</th><th>Off/Def</th><th>Shift</th><th>P(0)/P(3)/P(7)</th><th>Roll</th><th>Pts (Base)</th>
                  </tr>
                </thead>
                <tbody>
                  ${o.possessions.map(r=>`
                    <tr>
                      <td>${r.possessionIndex}</td>
                      <td>${r.team}</td>
                      <td>${r.tacticalPlanUsed}</td>
                      <td>${r.offenseRating.toFixed(1)}/${r.defenseRating.toFixed(1)}</td>
                      <td>${(r.totalShift*100).toFixed(1)}%</td>
                      <td>${(r.probabilities.p0*100).toFixed(0)}/${(r.probabilities.p3*100).toFixed(0)}/${(r.probabilities.p7*100).toFixed(0)}%</td>
                      <td>${r.roll.toFixed(4)}</td>
                      <td><strong>${r.points}</strong> (${r.baseOutcomeWithoutShift})${r.wasShiftedSwing?" ★":""}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>`:""}
      </section>
    `}renderSaveModal(){const t=Q(this.state);return`
      <div class="oms-modal-backdrop">
        <div class="oms-modal">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>Save / Import / Seed Controls</strong>
            <button class="oms-btn" data-action="close-save-modal">Close</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label style="font-size:0.78rem">New Season Seed:</label>
            <input id="oms-seed-input" type="number" value="${this.state.seed}" style="background:#020617;color:#f8fafc;border:1px solid #334155;border-radius:6px;padding:5px 8px;width:120px"/>
            <button class="oms-btn primary" data-action="apply-custom-seed">Start Season with Seed</button>
            ${c.documentedStrategySeeds.map(e=>`<button class="oms-btn" data-action="quick-seed" data-seed="${e}">Seed #${e}</button>`).join("")}
          </div>
          <div style="font-size:0.76rem;color:#94a3b8">Export / Import JSON Save State (Schema v${c.saveSchemaVersion}):</div>
          <textarea id="oms-save-textarea" class="oms-textarea">${this.escapeHtml(this.importBuffer||t)}</textarea>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button class="oms-btn sky" data-action="import-save-json">Import JSON State</button>
          </div>
        </div>
      </div>
    `}drawPitchCanvas(t){if(typeof document>"u"||typeof navigator<"u"&&/jsdom/i.test(navigator.userAgent||""))return;const e=this.container.querySelector("#oms-pitch-canvas");if(!e)return;let s=null;try{s=e.getContext("2d")}catch{return}if(!s)return;const i=e.width,o=e.height;for(let l=0;l<6;l++)s.fillStyle=l%2===0?"#0d3b29":"#0f4430",s.fillRect(l*i/6,0,i/6,o);s.strokeStyle="rgba(255, 255, 255, 0.35)",s.lineWidth=2,s.strokeRect(16,14,i-32,o-28),s.beginPath(),s.moveTo(i/2,14),s.lineTo(i/2,o-14),s.stroke(),s.beginPath(),s.arc(i/2,o/2,34,0,Math.PI*2),s.stroke(),s.beginPath(),s.arc(16,o/2,54,-Math.PI/2,Math.PI/2),s.stroke(),s.beginPath(),s.arc(i-16,o/2,54,Math.PI/2,Math.PI*3/2),s.stroke();const r=this.state.phase==="match_review"&&this.state.currentMatch?this.state.currentMatch.clubPlan:this.state.selectedPlan,n=r==="Patient"?[[78,o/2],[155,62],[155,o-62],[235,o/2],[310,o/2-24]]:r==="Aggressive"?[[82,o/2],[185,68],[185,o-68],[345,76],[385,o/2]]:[[80,o/2],[165,66],[165,o-66],[275,o/2-42],[335,o/2+18]],d=[[i-75,o/2],[i-165,65],[i-165,o-65],[i-255,o/2-40],[i-295,o/2+35]];let p=null;if(this.state.phase==="match_review"&&this.state.currentMatch){const l=Math.min(this.inspectedPossessionIdx,this.selectedPossessionIdx);p=this.state.currentMatch.possessions[l-1]??null}if(p){if(s.save(),s.strokeStyle=p.team==="club"?"#34d399":t.primaryColor,s.lineWidth=3,s.setLineDash([6,4]),s.beginPath(),p.team==="club"){s.moveTo(n[3][0],n[3][1]),s.lineTo(n[4][0],n[4][1]);const l=p.points===7?i-24:p.points===3?i-82:i-165;s.lineTo(l,o/2)}else{s.moveTo(d[3][0],d[3][1]),s.lineTo(d[4][0],d[4][1]);const l=p.points===7?24:p.points===3?82:165;s.lineTo(l,o/2)}s.stroke(),s.restore()}for(let l=0;l<d.length;l++){const[u,b]=d[l];s.beginPath(),s.arc(u,b,12,0,Math.PI*2),s.fillStyle=t.primaryColor,s.fill(),s.strokeStyle="#ffffff",s.lineWidth=1.5,s.stroke(),s.fillStyle="#ffffff",s.font="bold 10px sans-serif",s.textAlign="center",s.textBaseline="middle",s.fillText(t.shortName[0]??"O",u,b)}this.state.roster.filter(l=>this.state.selectedStarterIds.includes(l.id)).forEach((l,u)=>{const[b,g]=n[u%n.length];s.beginPath(),s.arc(b,g,16,0,Math.PI*2),s.strokeStyle=l.fatigue>=45?"#f59e0b":l.fatigue>=25?"#38bdf8":"#34d399",s.lineWidth=2.5,s.stroke(),s.beginPath(),s.arc(b,g,13,0,Math.PI*2),s.fillStyle="#065f46",s.fill(),s.strokeStyle="#ecfdf5",s.lineWidth=1.5,s.stroke(),s.fillStyle="#ecfdf5",s.font="bold 10px sans-serif",s.textAlign="center",s.textBaseline="middle",s.fillText(`#${l.number}`,b,g),s.fillStyle="#e2e8f0",s.font="600 10px sans-serif",s.fillText(l.name.split(" ")[1]??l.name,b,g+24)})}bindEvents(){this.container.querySelectorAll("[data-action]").forEach(t=>{const e=t.dataset.action;if(t.tagName==="SELECT"){t.addEventListener("change",s=>{const i=s.currentTarget;if(e==="swap-starter-select"&&i.value){const o=i.dataset.starterId;this.dispatch({type:"SWAP_STARTER",starterId:o,reserveId:i.value},"Updated starting five.")}});return}t.addEventListener("click",()=>{switch(e){case"dismiss-toast":this.statusToast=null,this.render();break;case"toggle-debug":this.toggleDebug();break;case"toggle-mute":this.sound.toggleMute(),this.render();break;case"open-save-modal":this.showSaveModal=!0,this.importBuffer="",this.render();break;case"close-save-modal":this.showSaveModal=!1,this.render();break;case"apply-custom-seed":{const s=this.container.querySelector("#oms-seed-input"),i=Number(s?.value??c.defaultSeed);this.showSaveModal=!1,this.restartWithSeed(i);break}case"quick-seed":{const s=Number(t.dataset.seed??c.defaultSeed);this.showSaveModal=!1,this.restartWithSeed(s);break}case"import-save-json":{const s=this.container.querySelector("#oms-save-textarea");if(!s)break;try{const i=ee(s.value);this.state=i,C(this.state),this.showSaveModal=!1,this.statusToast={text:"Save state imported and verified.",kind:"good"},this.render()}catch(i){const o=i instanceof Error?i.message:String(i);this.statusToast={text:o,kind:"warn"},this.render()}break}case"quick-sub-in":{const s=t.dataset.reserveId,o=this.state.roster.filter(r=>this.state.selectedStarterIds.includes(r.id)).sort((r,n)=>n.fatigue-r.fatigue)[0];o&&this.dispatch({type:"SWAP_STARTER",starterId:o.id,reserveId:s},`Swapped in reserve for ${o.name}.`);break}case"prep-rest":{const s=t.dataset.playerId;this.dispatch({type:"SPEND_PREP_REST",playerId:s},"Applied Rest (-24 Fatigue).");break}case"prep-train":{const s=t.dataset.playerId,i=t.dataset.attr;this.dispatch({type:"SPEND_PREP_TRAIN",playerId:s,attribute:i},`Trained +1 ${A[i]} (+8 Fatigue).`);break}case"reset-prep":{this.dispatch({type:"RESET_PREP_ACTIONS"},"Reverted preparation actions for this fixture.");break}case"select-plan":{const s=t.dataset.plan;this.dispatch({type:"SET_TACTICAL_PLAN",plan:s});break}case"commit-match":{this.dispatch({type:"COMMIT_MATCH"});break}case"step-possession":{this.stopPlayback(),this.selectedPossessionIdx<c.totalPossessions&&(this.selectedPossessionIdx+=1,this.inspectedPossessionIdx=this.selectedPossessionIdx),this.render();break}case"skip-playback":{this.skipToFullTime();break}case"inspect-possession":{const s=Number(t.dataset.posIdx??1);this.inspectedPossessionIdx=s,this.sound.playClick(460),this.render();break}case"proceed-from-match":{this.stopPlayback(),this.dispatch({type:"PROCEED_FROM_MATCH"});break}case"apply-dev":{const s=t.dataset.playerId,i=t.dataset.attr;this.dispatch({type:"APPLY_DEVELOPMENT",playerId:s,attribute:i},`Awarded post-match +1 ${A[i]} breakthrough (0 fatigue)!`);break}case"new-season-next-seed":{this.restartWithSeed(this.state.seed+1);break}case"replay-same-seed":{this.restartWithSeed(this.state.seed);break}}})})}escapeHtml(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}}const ce={id:"01-one-more-season",number:1,title:"One More Season",subtitle:"Ironvale Rovers FC — Five-a-Side Club Management",genre:"Compact Season-Loop Sports Management & Tactical Preparation",primaryReference:"Football Manager (Streamlined Match Prep & Squad Rotation)",supportingReference:"Nintendo Pocket Football Club / Out of the Park Baseball",oneSentenceLoop:"Scout the next opponent, balance 5 starters and 2 preparation points between Rest and Training, pick a tactical plan for 16 alternating possessions, and develop your 8-player squad to win at least 4 of 6 fixtures.",shortGoal:"Read Cinderwick Athletic’s press tendency, manage tired star striker Kaelen Vance (Fatigue 56), and win Fixture 1.",longGoal:"Guide Ironvale Rovers FC to at least 4 wins across the 6-fixture season using either Rotated Patient Matchup or Star-Heavy Aggressive Push.",controlsSummary:"Mouse/Touch to swap starters, spend 2 Prep Points (Rest -24 Fat / Train +1 Stat +8 Fat), pick Tactical Plan, inspect 16 possessions, and press [D] for the Math Inspector.",accentColor:"#10b981"};function pe(a,t){const e=new de(a,t);return{destroy:()=>e.destroy(),getStateSnapshot:()=>e.getStateSnapshot(),restartWithSeed:s=>e.restartWithSeed(s),toggleDebug:s=>e.toggleDebug(s)}}const Se={metadata:ce,mountGame:pe},$e=Object.freeze(Object.defineProperty({__proto__:null,ATTRIBUTE_KEYS:I,ATTRIBUTE_LABELS:A,CONFIG:c,INITIAL_ROSTER:W,OPPONENTS:ae,OneMoreSeasonUI:de,RECAP_TEMPLATES:_,RULES_VERSION:T,SAVE_SCHEMA_VERSION:1,STORAGE_KEY:O,SoundController:ie,TACTICAL_PLANS:G,TACTICAL_PLAN_IDS:se,applyCommand:y,clamp:L,clampAttribute:B,clampFatigue:F,clearSavedState:le,cloneState:Y,computeEffectiveMultiplier:$,computeEffectiveStat:S,computePossessionProbabilities:P,computeStarterPostMatchFatigueDelta:q,computeTeamEffectiveRatings:H,createInitialState:w,createRng:K,default:Se,generateDecisiveEvents:re,getOpponentForFixture:E,getSeasonSummary:Z,getTacticalPlanDefinition:ye,loadStateFromStorage:ne,metadata:ce,mountGame:pe,normalizeSeed:J,parseSaveEnvelope:ee,resolvePointsFromRoll:j,runAutomatedSeason:U,runSeasonStrategyHarness:Pe,saveStateToStorage:C,serializeSaveEnvelope:Q,simulateMatch:oe,validateAndSanitizeState:X},Symbol.toStringTag,{value:"Module"}));export{$e as g,pe as m};
