const B={PERFECT:32,GOOD:75,EARLY_LATE:120},A={MIN:-150,MAX:150,STEP:5},U={PERFECT:300,GOOD:180,EARLY:70,LATE:70,MISS:0,SHUNT_SWITCH_BONUS:250,OVERDRIVE_MULTIPLIER:1.5},L={INITIAL:100,MAX:100,MIN:0,GAIN_PERFECT:2.5,GAIN_GOOD:1,LOSS_EARLY_LATE:2,LOSS_MISS_STANDARD:8.5,LOSS_MISS_OVERDRIVE:12.5},at=[{minMs:-120,maxMs:-100,label:"-120..-100"},{minMs:-100,maxMs:-80,label:"-100..-80"},{minMs:-80,maxMs:-60,label:"-80..-60"},{minMs:-60,maxMs:-40,label:"-60..-40"},{minMs:-40,maxMs:-20,label:"-40..-20"},{minMs:-20,maxMs:0,label:"-20..0"},{minMs:0,maxMs:20,label:"0..+20"},{minMs:20,maxMs:40,label:"+20..+40"},{minMs:40,maxMs:60,label:"+40..+60"},{minMs:60,maxMs:80,label:"+60..+80"},{minMs:80,maxMs:100,label:"+80..+100"},{minMs:100,maxMs:120,label:"+100..+120"}],I=[{id:"intro-induction",index:0,title:"01 · Intro Induction",subtitle:"Magnetic baseline alignment & first shunt gate test",startTimeMs:0,endTimeMs:22500,shuntGateTimeMs:9e3,overdriveEndTimeMs:21e3},{id:"conveyor-surge",index:1,title:"02 · Conveyor Surge",subtitle:"Alternating cross-rail salvage bursts & off-beat induction",startTimeMs:22500,endTimeMs:45e3,shuntGateTimeMs:3e4,overdriveEndTimeMs:43500},{id:"high-voltage-shunt",index:2,title:"03 · High-Voltage Shunt",subtitle:"Syncopated dual-rail plasma cores & high-yield shunt window",startTimeMs:45e3,endTimeMs:67500,shuntGateTimeMs:51e3,overdriveEndTimeMs:66e3},{id:"furnace-finale",index:3,title:"04 · Furnace Finale",subtitle:"Full-foundry overdrive sprint to final lock",startTimeMs:67500,endTimeMs:9e4,shuntGateTimeMs:73500,overdriveEndTimeMs:88500}];function J(r){return r>=50?4:r>=25?3:r>=10?2:1}function Y(r){for(const t of I)if(r>=t.startTimeMs&&r<t.endTimeMs)return t;return I[I.length-1]}class nt{ctx=null;masterGain=null;muted=!1;lastScheduledSubdivisionIdx=-1;constructor(t=!1){this.muted=t}ensureContext(){if(typeof window>"u")return null;if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=this.muted?0:.28,this.masterGain.connect(this.ctx.destination)}catch{this.ctx=null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}getNowAudioMs(){return this.ctx&&this.ctx.state==="running"?this.ctx.currentTime*1e3:typeof performance<"u"?performance.now():Date.now()}setMuted(t){this.muted=t,this.masterGain&&this.ctx&&this.masterGain.gain.setValueAtTime(t?0:.28,this.ctx.currentTime)}isMuted(){return this.muted}resetScheduler(){this.lastScheduledSubdivisionIdx=-1}updateTrackMusic(t,s){if(this.muted)return;const i=this.ctx,a=this.masterGain;if(!i||!a||i.state!=="running")return;const n=Math.floor(t/250);if(n<=this.lastScheduledSubdivisionIdx)return;this.lastScheduledSubdivisionIdx=n;const e=i.currentTime,o=(n%8+8)%8,u=Y(t);o%2===0&&this.triggerKick(i,a,e,s==="overdrive"?.55:.42),(o===2||o===6)&&this.triggerSnare(i,a,e,u.index>=1?.26:.16);const d=([38,41,43,45][u.index]??38)+(s==="overdrive"?[0,12,7,15,0,12,10,19]:[0,0,7,12,0,0,10,7])[o],v=440*Math.pow(2,(d-69)/12);this.triggerBassPulse(i,a,e,v,s==="overdrive"?"sawtooth":"triangle",s==="overdrive"?.22:.15)}playHitSfx(t,s,i){if(this.muted)return;const a=this.ensureContext(),n=this.masterGain;if(!a||!n)return;const e=a.currentTime,o=a.createOscillator(),u=a.createGain();if(t==="MISS")o.type="sawtooth",o.frequency.setValueAtTime(135,e),o.frequency.exponentialRampToValueAtTime(68,e+.14),u.gain.setValueAtTime(.24,e),u.gain.exponentialRampToValueAtTime(.001,e+.15);else{const h=s==="left"?523.25:659.25,l=t==="PERFECT"?i==="overdrive"?1.5:1.25:t==="GOOD"?1:.82;o.type=i==="overdrive"?"square":"sine",o.frequency.setValueAtTime(h*l,e),o.frequency.exponentialRampToValueAtTime(h*l*1.18,e+.075),u.gain.setValueAtTime(t==="PERFECT"?.26:.18,e),u.gain.exponentialRampToValueAtTime(.001,e+.085)}o.connect(u),u.connect(n),o.start(e),o.stop(e+.16)}playShuntGateSfx(){if(this.muted)return;const t=this.ensureContext(),s=this.masterGain;if(!t||!s)return;const i=t.currentTime,a=t.createOscillator(),n=t.createGain();a.type="sawtooth",a.frequency.setValueAtTime(260,i),a.frequency.exponentialRampToValueAtTime(880,i+.22),n.gain.setValueAtTime(.28,i),n.gain.exponentialRampToValueAtTime(.001,i+.24),a.connect(n),n.connect(s),a.start(i),a.stop(i+.25)}playCalibrationPulse(t=!1){if(this.muted)return;const s=this.ensureContext(),i=this.masterGain;if(!s||!i)return;const a=s.currentTime,n=s.createOscillator(),e=s.createGain();n.type="triangle",n.frequency.setValueAtTime(t?987.77:659.25,a),e.gain.setValueAtTime(.3,a),e.gain.exponentialRampToValueAtTime(.001,a+.07),n.connect(e),e.connect(i),n.start(a),n.stop(a+.08)}triggerKick(t,s,i,a){const n=t.createOscillator(),e=t.createGain();n.type="sine",n.frequency.setValueAtTime(118,i),n.frequency.exponentialRampToValueAtTime(38,i+.11),e.gain.setValueAtTime(a,i),e.gain.exponentialRampToValueAtTime(.001,i+.12),n.connect(e),e.connect(s),n.start(i),n.stop(i+.13)}triggerSnare(t,s,i,a){const n=t.createOscillator(),e=t.createGain();n.type="triangle",n.frequency.setValueAtTime(240,i),n.frequency.exponentialRampToValueAtTime(110,i+.08),e.gain.setValueAtTime(a,i),e.gain.exponentialRampToValueAtTime(.001,i+.09),n.connect(e),e.connect(s),n.start(i),n.stop(i+.095)}triggerBassPulse(t,s,i,a,n,e){const o=t.createOscillator(),u=t.createGain();o.type=n,o.frequency.setValueAtTime(a,i),u.gain.setValueAtTime(e,i),u.gain.exponentialRampToValueAtTime(.001,i+.19),o.connect(u),u.connect(s),o.start(i),o.stop(i+.2)}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null,this.masterGain=null)}}class ot{state;constructor(t){this.state=t>>>0||1831565813}next(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}nextInt(t,s){return Math.floor(this.next()*(s-t+1))+t}pick(t){return t[this.nextInt(0,t.length-1)]}}function W(r=new Date){const t=r.getUTCFullYear(),s=r.getUTCMonth()+1,i=r.getUTCDate();return t*1e4+s*100+i}const K={easy:{id:"easy",title:"Cadet Sorter",badge:"EASY · 120 BPM",subtitle:"Steady quarter-beat magnetic induction with forgiving shunt patterns",seed:10501,description:"Designed for first-shift calibration. Clean single-beat spacing on Standard rails; Overdrive introduces rhythmic eighth-note pairs.",standardBeatStepMs:1e3,includeEighthSyncopationInStandard:!1,overdriveSubdivisionMs:500},standard:{id:"standard",title:"Shift Lead",badge:"STANDARD · 120 BPM",subtitle:"Balanced industrial groove with syncopated Overdrive cross-routing",seed:20502,description:"Full-speed orbital salvage shift. Standard route runs 120 BPM quarter pulses; Overdrive Shunt injects off-beat 250ms plasma crossovers.",standardBeatStepMs:500,includeEighthSyncopationInStandard:!1,overdriveSubdivisionMs:250},expert:{id:"expert",title:"Overclocked Foundry",badge:"EXPERT · 120 BPM",subtitle:"High-density dual-rail salvage with rapid Overdrive plasma bursts",seed:30503,description:"Maximum throughput. Syncopated Standard conveyor plus aggressive Overdrive eighth-and-sixteenth triplet bursts for top leaderboard scores.",standardBeatStepMs:500,includeEighthSyncopationInStandard:!0,overdriveSubdivisionMs:250}};function ft(){return I.map((r,t)=>({id:`gate-${t+1}-${r.id}`,sectionId:r.id,timeMs:r.shuntGateTimeMs,overdriveEndTimeMs:r.overdriveEndTimeMs,activationLeadMs:1200,activationTailMs:400}))}function z(r){const t=new ot(r.seed),s=ft(),i=[];let a=1;const n=(e,o,u,h,l)=>{i.push({id:`${r.id}-n${a++}`,timeMs:e,lane:o,sectionId:u,routeBranch:h,coreType:l})};for(const e of I){const o=e.index,u=e.startTimeMs===0?1500:e.startTimeMs+500,h=e.shuntGateTimeMs-250;let l=o%2===0?"left":"right";for(let f=u;f<=h;f+=r.standardBeatStepMs)if(o>=1&&f%1500===0?l=l==="left"?"right":"left":l=t.next()>.35?l==="left"?"right":"left":l,n(f,l,e.id,"both","ferrous"),r.includeEighthSyncopationInStandard&&o>=2&&f+250<=h&&t.next()>.55){const C=l==="left"?"right":"left";n(f+250,C,e.id,"both","cobalt")}const b=e.shuntGateTimeMs+500,d=e.overdriveEndTimeMs;let v="left";for(let f=b;f<=d;f+=r.standardBeatStepMs)if((f-b)%4e3!==3500&&(v=(f/r.standardBeatStepMs+o)%2===0?"left":"right",n(f,v,e.id,"standard","cobalt"),r.includeEighthSyncopationInStandard&&o>=1&&(f-b)%2e3===1e3)){const C=v==="left"?"right":"left";f+250<=d&&n(f+250,C,e.id,"standard","cobalt")}const m=(r.id==="easy",500);let g="right";for(let f=b;f<=d;f+=m)if(g=g==="left"?"right":"left",n(f,g,e.id,"overdrive","plasma"),(r.id==="easy"?(f-b)%1500===500:r.id==="standard"?(f-b)%1e3===500:(f-b)%1e3!==0||o>=2)&&f+r.overdriveSubdivisionMs<=d){const D=g==="left"?"right":"left";n(f+r.overdriveSubdivisionMs,D,e.id,"overdrive","plasma")}const R=e.overdriveEndTimeMs+500,N=e.endTimeMs-500;for(let f=R;f<=N;f+=500){const C=f/500%2===0?"left":"right";n(f,C,e.id,"both","ferrous")}}return i.sort((e,o)=>e.timeMs-o.timeMs||e.id.localeCompare(o.id)),{id:r.id,title:r.title,badge:r.badge,subtitle:r.subtitle,bpm:120,durationMs:9e4,seed:r.seed,description:r.description,sections:I,shuntGates:s,notes:i}}const j={easy:z(K.easy),standard:z(K.standard),expert:z(K.expert)};function Z(r=W()){const t={id:"daily",title:`Daily Foundry #${r}`,badge:`DAILY SEED · ${r}`,subtitle:"Deterministic seeded 90s salvage track for head-to-head shift comparison",seed:r,description:"Every operator running this Daily Seed faces the exact same note timestamps and Shunt Gate overdrive patterns.",standardBeatStepMs:500,includeEighthSyncopationInStandard:r%2===0,overdriveSubdivisionMs:250};return z(t)}function rt(r,t){return r==="daily"?Z(t??W()):j[r]}function pt(r){return[j.easy,j.standard,j.expert,Z(r)]}function lt(r,t){const s=I.find(n=>n.id===t)??Y(0),i=r.notes.filter(n=>n.sectionId===s.id),a=r.shuntGates.filter(n=>n.sectionId===s.id);return{...r,title:`${r.title} · [${s.title}]`,subtitle:`Section Practice Loop (${(s.startTimeMs/1e3).toFixed(1)}s – ${(s.endTimeMs/1e3).toFixed(1)}s)`,sections:[s],shuntGates:a,notes:i,practiceSectionId:s.id,practiceStartTimeMs:s.startTimeMs,practiceEndTimeMs:s.endTimeMs}}const Q="argon_game05_beatline_salvage_v1",X={S:5,A:4,B:3,C:2,D:1};function H(){const r={};for(const t of I)r[t.id]={sectionId:t.id,bestAccuracyPct:0,overdriveMastered:!1,practiceRuns:0};return{version:1,calibrationOffsetMs:0,noFailMode:!1,muted:!1,chartRecords:{},sectionMastery:r}}function ct(){try{const r=window.localStorage.getItem(Q);if(!r)return H();const t=JSON.parse(r);return tt(t)}catch{return H()}}function tt(r){const t=H();if(!r||typeof r!="object")return t;const s=typeof r.calibrationOffsetMs=="number"&&Number.isFinite(r.calibrationOffsetMs)?Math.max(A.MIN,Math.min(A.MAX,Math.round(r.calibrationOffsetMs))):0,i={};if(r.chartRecords&&typeof r.chartRecords=="object")for(const[n,e]of Object.entries(r.chartRecords))e&&typeof e=="object"&&(i[n]={chartId:n,bestScore:Number(e.bestScore)||0,bestRank:e.bestRank&&e.bestRank in X?e.bestRank:"D",bestAccuracyPct:Number(e.bestAccuracyPct)||0,maxCombo:Number(e.maxCombo)||0,plays:Number(e.plays)||0,overdriveClears:Number(e.overdriveClears)||0});const a={...t.sectionMastery};if(r.sectionMastery&&typeof r.sectionMastery=="object")for(const n of I){const e=r.sectionMastery[n.id];e&&typeof e=="object"&&(a[n.id]={sectionId:n.id,bestAccuracyPct:Number(e.bestAccuracyPct)||0,overdriveMastered:!!e.overdriveMastered,practiceRuns:Number(e.practiceRuns)||0})}return{version:1,calibrationOffsetMs:s,noFailMode:!!r.noFailMode,muted:!!r.muted,chartRecords:i,sectionMastery:a}}function _(r){try{window.localStorage.setItem(Q,JSON.stringify(r))}catch{}}function dt(r,t){const s=tt(r);if(t.practiceSectionId){const n=t.practiceSectionId,e=s.sectionMastery[n],o=t.sectionBreakdowns[0];return s.sectionMastery[n]={sectionId:n,bestAccuracyPct:Math.max(e.bestAccuracyPct,t.accuracyPct),overdriveMastered:e.overdriveMastered||t.completed&&o?.routeChosen==="overdrive"&&t.accuracyPct>=85,practiceRuns:e.practiceRuns+1},_(s),s}const i=s.chartRecords[t.chartId]??{chartId:t.chartId,bestScore:0,bestRank:"D",bestAccuracyPct:0,maxCombo:0,plays:0,overdriveClears:0},a=X[t.rank]>=X[i.bestRank]?t.rank:i.bestRank;s.chartRecords[t.chartId]={chartId:t.chartId,bestScore:Math.max(i.bestScore,t.totalScore),bestRank:a,bestAccuracyPct:Math.max(i.bestAccuracyPct,t.accuracyPct),maxCombo:Math.max(i.maxCombo,t.maxCombo),plays:i.plays+1,overdriveClears:i.overdriveClears+(t.completed&&t.shuntSwitchesActivated>0?1:0)};for(const n of t.sectionBreakdowns){const e=s.sectionMastery[n.sectionId];e&&(s.sectionMastery[n.sectionId]={sectionId:n.sectionId,bestAccuracyPct:Math.max(e.bestAccuracyPct,n.accuracyPct),overdriveMastered:e.overdriveMastered||t.completed&&n.routeChosen==="overdrive"&&n.accuracyPct>=85,practiceRuns:e.practiceRuns})}return _(s),s}function ut(r,t,s=0){const i=Math.max(A.MIN,Math.min(A.MAX,s)),a=t-i,n=a-r,e=Math.abs(n);return e<=B.PERFECT?{grade:"PERFECT",deltaMs:n,absDeltaMs:e,effectiveInputTimeMs:a}:e<=B.GOOD?{grade:"GOOD",deltaMs:n,absDeltaMs:e,effectiveInputTimeMs:a}:e<=B.EARLY_LATE?{grade:n<0?"EARLY":"LATE",deltaMs:n,absDeltaMs:e,effectiveInputTimeMs:a}:{grade:"MISS",deltaMs:n,absDeltaMs:e,effectiveInputTimeMs:a}}function ht(r,t,s){return t?r>=93&&s<=2?"S":r>=84?"A":r>=72?"B":r>=58?"C":"D":"D"}function bt(r){const t=at.map(a=>({minMs:a.minMs,maxMs:a.maxMs,label:a.label,count:0}));if(r.length===0)return{histogram:t,meanErrorMs:0};let s=0;for(const a of r){s+=a;const n=Math.max(-120,Math.min(119.999,a)),e=Math.min(t.length-1,Math.max(0,Math.floor((n+120)/20)));t[e].count+=1}const i=Math.round(s/r.length*10)/10;return{histogram:t,meanErrorMs:i}}class et{chart;settings;status="idle";anchorAudioTimeMs=0;elapsedBeforeAnchorMs=0;currentTrackTimeMs=0;pauseCount=0;noteStates=[];sectionRoutes=new Map;activatedGates=new Set;score=0;combo=0;maxCombo=0;stability=L.INITIAL;recordedInputs=[];hitDeltasMs=[];lastFeedback=null;constructor(t,s){this.chart=t,this.settings={calibrationOffsetMs:Math.max(A.MIN,Math.min(A.MAX,s?.calibrationOffsetMs??0)),noFailMode:s?.noFailMode??!1},this.resetState()}resetState(){const t=this.chart.practiceStartTimeMs??0;this.status="idle",this.anchorAudioTimeMs=0,this.elapsedBeforeAnchorMs=t,this.currentTrackTimeMs=t,this.pauseCount=0,this.score=0,this.combo=0,this.maxCombo=0,this.stability=L.INITIAL,this.recordedInputs=[],this.hitDeltasMs=[],this.lastFeedback=null,this.sectionRoutes.clear();for(const s of this.chart.sections)this.sectionRoutes.set(s.id,"standard");this.activatedGates.clear(),this.noteStates=this.chart.notes.map(s=>({note:s,judged:!1}))}setChart(t){this.chart=t,this.resetState()}getChart(){return this.chart}setCalibrationOffsetMs(t){this.settings.calibrationOffsetMs=Math.max(A.MIN,Math.min(A.MAX,Math.round(t)))}getCalibrationOffsetMs(){return this.settings.calibrationOffsetMs}setNoFailMode(t){this.settings.noFailMode=t}getNoFailMode(){return!!this.settings.noFailMode}start(t=0){this.resetState();const s=this.chart.practiceStartTimeMs??0;this.anchorAudioTimeMs=t,this.elapsedBeforeAnchorMs=s,this.currentTrackTimeMs=s,this.status="playing"}restart(t=0){this.start(t)}pause(t){this.status==="playing"&&(this.updateTrackClockOnly(t),this.elapsedBeforeAnchorMs=this.currentTrackTimeMs,this.anchorAudioTimeMs=t,this.status="paused",this.pauseCount+=1)}resume(t){this.status==="paused"&&(this.anchorAudioTimeMs=t,this.status="playing")}updateTrackClockOnly(t){const s=Math.max(0,t-this.anchorAudioTimeMs);this.currentTrackTimeMs=this.elapsedBeforeAnchorMs+s}getCalibratedTrackTimeMs(){return this.currentTrackTimeMs-this.settings.calibrationOffsetMs}getRawTrackTimeMs(){return this.currentTrackTimeMs}getStatus(){return this.status}getPauseCount(){return this.pauseCount}getScore(){return this.score}getCombo(){return this.combo}getMaxCombo(){return this.maxCombo}getStability(){return this.stability}getLastFeedback(){return this.lastFeedback}getRecordedInputs(){return this.recordedInputs}isNoteActiveOnCurrentRoute(t){if(t.routeBranch==="both")return!0;const s=this.sectionRoutes.get(t.sectionId)??"standard";return t.routeBranch===s}getCurrentRouteForTimeMs(t=this.getCalibratedTrackTimeMs()){for(const s of this.chart.shuntGates)if(this.activatedGates.has(s.id)&&t>=s.timeMs-s.activationLeadMs&&t<=s.overdriveEndTimeMs)return"overdrive";return"standard"}getUpcomingOrActiveGate(t=this.getCalibratedTrackTimeMs()){for(const s of this.chart.shuntGates){const i=this.activatedGates.has(s.id),a=!i&&t>=s.timeMs-s.activationLeadMs&&t<=s.timeMs+s.activationTailMs;if(t<=s.overdriveEndTimeMs)return{gate:s,canActivateNow:a,isActivated:i}}return null}getActiveNoteStates(){return this.noteStates.filter(t=>this.isNoteActiveOnCurrentRoute(t.note))}stepToAudioTimeMs(t){if(this.status!=="playing")return;this.updateTrackClockOnly(t);const s=this.getCalibratedTrackTimeMs();for(const a of this.noteStates)if(!a.judged&&this.isNoteActiveOnCurrentRoute(a.note)&&s>a.note.timeMs+B.EARLY_LATE&&(this.applyNoteJudgment(a,"MISS",B.EARLY_LATE+1,s),this.getStatus()==="failed"))return;const i=this.chart.practiceEndTimeMs??this.chart.durationMs;if(this.currentTrackTimeMs>=i){for(const a of this.noteStates)if(!a.judged&&this.isNoteActiveOnCurrentRoute(a.note)&&(this.applyNoteJudgment(a,"MISS",B.EARLY_LATE+1,s),this.getStatus()==="failed"))return;this.status="completed"}}handleShuntSwitchInput(t){if(this.status!=="playing")return!1;this.updateTrackClockOnly(t);const s=this.currentTrackTimeMs;this.recordedInputs.push({type:"shunt",inputAudioTimeMs:s});const i=this.getCalibratedTrackTimeMs();for(const a of this.chart.shuntGates)if(!this.activatedGates.has(a.id)&&i>=a.timeMs-a.activationLeadMs&&i<=a.timeMs+a.activationTailMs)return this.activatedGates.add(a.id),this.sectionRoutes.set(a.sectionId,"overdrive"),this.score+=U.SHUNT_SWITCH_BONUS,this.lastFeedback={text:"OVERDRIVE SHUNT ENGAGED (1.5x)",grade:"OVERDRIVE",trackTimeMs:i},!0;return!1}handleLaneInput(t,s){if(this.status!=="playing"||(this.stepToAudioTimeMs(s),this.status!=="playing"))return null;const i=this.currentTrackTimeMs;this.recordedInputs.push({type:"lane",lane:t,inputAudioTimeMs:i});const a=this.getCalibratedTrackTimeMs();let n=null,e=1/0;for(const u of this.noteStates){if(u.judged||u.note.lane!==t||!this.isNoteActiveOnCurrentRoute(u.note))continue;const h=a-u.note.timeMs,l=Math.abs(h);l<=B.EARLY_LATE&&l<e&&(n=u,e=l)}if(!n)return null;const o=ut(n.note.timeMs,i,this.settings.calibrationOffsetMs);return this.applyNoteJudgment(n,o.grade,o.deltaMs,a),o}applyNoteJudgment(t,s,i,a){t.judged=!0,t.grade=s,t.deltaMs=Math.round(i),t.judgedAtTrackMs=a;const n=this.sectionRoutes.get(t.note.sectionId)??"standard",e=t.note.routeBranch==="overdrive"||n==="overdrive";if(t.routeAtJudgment=e?"overdrive":"standard",s==="MISS"){this.combo=0,t.scoreAwarded=0;const d=e?L.LOSS_MISS_OVERDRIVE:L.LOSS_MISS_STANDARD;this.stability=Math.max(L.MIN,this.stability-d),this.lastFeedback={text:"MISS",grade:"MISS",lane:t.note.lane,trackTimeMs:a},this.stability<=0&&!this.settings.noFailMode&&(this.status="failed");return}this.hitDeltasMs.push(i),s==="PERFECT"||s==="GOOD"?(this.combo+=1,this.combo>this.maxCombo&&(this.maxCombo=this.combo)):this.combo=Math.floor(this.combo/2);const o=U[s],u=J(this.combo),h=e?U.OVERDRIVE_MULTIPLIER:1,l=Math.round(o*u*h);t.scoreAwarded=l,this.score+=l,s==="PERFECT"?this.stability=Math.min(L.MAX,this.stability+L.GAIN_PERFECT):s==="GOOD"?this.stability=Math.min(L.MAX,this.stability+L.GAIN_GOOD):this.stability=Math.max(L.MIN,this.stability-L.LOSS_EARLY_LATE);const b=Math.round(i)>=0?`+${Math.round(i)}ms`:`${Math.round(i)}ms`;this.lastFeedback={text:`${s} ${b}`,grade:s,deltaMs:Math.round(i),lane:t.note.lane,trackTimeMs:a}}getResultsSummary(){const t=this.getActiveNoteStates(),s={PERFECT:0,GOOD:0,EARLY:0,LATE:0,MISS:0};let i=0,a=0;for(const m of t){if(!m.judged||!m.grade)continue;a+=1;const g=m.grade;s[g]+=1,g==="PERFECT"?i+=1:g==="GOOD"?i+=.78:(g==="EARLY"||g==="LATE")&&(i+=.35)}const n=this.status==="completed"?t.length||1:a||1,e=Math.round(i/n*1e3)/10,{histogram:o,meanErrorMs:u}=bt(this.hitDeltasMs),h=this.chart.sections.map(m=>{const g=t.filter(y=>y.note.sectionId===m.id);let R=0,N=0,f=0,C=0,D=0,T=0,$=0;const w=[];for(const y of g){const c=y.judged&&y.grade?y.grade:"MISS";$+=y.scoreAwarded??0,c==="PERFECT"?(R+=1,T+=1,y.deltaMs!==void 0&&w.push(y.deltaMs)):c==="GOOD"?(N+=1,T+=.78,y.deltaMs!==void 0&&w.push(y.deltaMs)):c==="EARLY"?(f+=1,T+=.35,y.deltaMs!==void 0&&w.push(y.deltaMs)):c==="LATE"?(C+=1,T+=.35,y.deltaMs!==void 0&&w.push(y.deltaMs)):D+=1}const G=g.length||1,P=Math.round(T/G*1e3)/10,F=w.length>0?Math.round(w.reduce((y,c)=>y+c,0)/w.length*10)/10:0;return{sectionId:m.id,title:m.title,routeChosen:this.sectionRoutes.get(m.id)??"standard",totalNotes:g.length,perfectCount:R,goodCount:N,earlyCount:f,lateCount:C,missCount:D,accuracyPct:P,meanErrorMs:F,scoreEarned:$}});let l=h[0];for(const m of h){if(!l){l=m;continue}const g=m.missCount*2+m.earlyCount+m.lateCount,R=l.missCount*2+l.earlyCount+l.lateCount;(m.accuracyPct<l.accuracyPct||m.accuracyPct===l.accuracyPct&&g>R)&&(l=m)}const b=this.status==="completed",d=ht(e,b,s.MISS),v=Math.max(A.MIN,Math.min(A.MAX,Math.round((this.settings.calibrationOffsetMs+u)/5)*5));return{chartId:this.chart.id,chartTitle:this.chart.title,completed:b,practiceSectionId:this.chart.practiceSectionId,totalScore:this.score,rank:d,accuracyPct:e,maxCombo:this.maxCombo,finalCombo:this.combo,finalStability:Math.round(this.stability*10)/10,counts:s,shuntSwitchesActivated:this.activatedGates.size,meanErrorMs:u,suggestedCalibrationOffsetMs:v,histogram:o,sectionBreakdowns:h,weakestSectionId:l?l.sectionId:"intro-induction"}}}function gt(r,t,s){const i=new et(r,s),a=r.practiceStartTimeMs??0;i.start(a);const n=[...t].sort((o,u)=>o.inputAudioTimeMs-u.inputAudioTimeMs);for(const o of n){if(i.getStatus()!=="playing")break;o.type==="shunt"?i.handleShuntSwitchInput(o.inputAudioTimeMs):o.type==="lane"&&o.lane&&i.handleLaneInput(o.lane,o.inputAudioTimeMs)}const e=r.practiceEndTimeMs??r.durationMs;return i.getStatus()==="playing"&&i.stepToAudioTimeMs(e+500),i.getResultsSummary()}function mt(r,t,s=0){const i=[];if(t==="overdrive")for(const a of r.shuntGates)i.push({type:"shunt",inputAudioTimeMs:a.timeMs+s});for(const a of r.notes)(a.routeBranch==="both"||a.routeBranch===t)&&i.push({type:"lane",lane:a.lane,inputAudioTimeMs:a.timeMs+s});return i.sort((a,n)=>a.inputAudioTimeMs-n.inputAudioTimeMs),i}class Mt{root;canvas;ctx;callbacks;hudScoreEl;hudComboEl;hudMultEl;hudRouteEl;hudStabilityBarEl;hudStabilityValEl;hudTimeEl;hudSectionEl;calibrationBadgeEl;startBtnEl;pauseBtnEl;muteBtnEl;noFailCheckEl;diffButtons=new Map;sectionSelectEl;overlayContainerEl;calibrationModalEl;calSliderEl;calValueLabelEl;calTapStatusEl;debugPanelEl;leftFlashUntilMs=0;rightFlashUntilMs=0;shuntFlashUntilMs=0;constructor(t,s){this.callbacks=s,this.root=document.createElement("div"),this.root.className="bs-root",this.injectStyles(),this.buildDOM(),t.innerHTML="",t.appendChild(this.root),this.canvas=this.root.querySelector("#bs-canvas");const i=this.canvas.getContext("2d");if(!i)throw new Error("Failed to initialize 2D canvas context for Beatline Salvage");this.ctx=i}injectStyles(){const t=document.createElement("style");t.textContent=`
      .bs-root {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at 50% 0%, #131c31 0%, #070b14 75%);
        color: #e2e8f0;
        min-height: 100%;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        user-select: none;
        position: relative;
      }
      .bs-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 10px;
        padding: 10px 14px;
      }
      .bs-brand {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .bs-title {
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bs-title-pill {
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(0, 240, 255, 0.15);
        border: 1px solid #00f0ff;
        color: #00f0ff;
        font-weight: 700;
      }
      .bs-subtitle {
        font-size: 0.76rem;
        color: #94a3b8;
      }
      .bs-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .bs-btn {
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 6px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.12s ease;
      }
      .bs-btn:hover {
        border-color: #38bdf8;
        color: #fff;
      }
      .bs-btn.active {
        background: rgba(0, 240, 255, 0.18);
        border-color: #00f0ff;
        color: #00f0ff;
      }
      .bs-btn-primary {
        background: linear-gradient(135deg, #0284c7, #00f0ff);
        color: #041019;
        border: none;
        font-weight: 800;
      }
      .bs-btn-primary:hover {
        filter: brightness(1.1);
        color: #020617;
      }
      .bs-btn-amber {
        background: rgba(245, 158, 11, 0.18);
        border: 1px solid #f59e0b;
        color: #fbbf24;
      }
      .bs-select {
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 6px 8px;
        font-size: 0.78rem;
      }
      .bs-hud {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
        gap: 8px;
      }
      .bs-hud-card {
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .bs-hud-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #94a3b8;
      }
      .bs-hud-value {
        font-size: 1.15rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: #f8fafc;
      }
      .bs-stability-track {
        width: 100%;
        height: 8px;
        background: #090d16;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid #1e293b;
        margin-top: 2px;
      }
      .bs-stability-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #22c55e, #00f0ff);
        transition: width 0.08s linear;
      }
      .bs-stage-wrap {
        position: relative;
        width: 100%;
        max-width: 920px;
        margin: 0 auto;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: #050811;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
      }
      #bs-canvas {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
      }
      .bs-touch-deck {
        display: grid;
        grid-template-columns: 1fr 1.1fr 1fr;
        gap: 10px;
        max-width: 920px;
        width: 100%;
        margin: 0 auto;
      }
      .bs-pad {
        padding: 14px 10px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.9rem;
        letter-spacing: 0.04em;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        touch-action: manipulation;
      }
      .bs-pad-sub {
        font-size: 0.7rem;
        font-weight: 500;
        opacity: 0.82;
      }
      .bs-pad-left {
        background: rgba(0, 240, 255, 0.12);
        border: 2px solid #00f0ff;
        color: #67e8f9;
      }
      .bs-pad-left:active {
        background: rgba(0, 240, 255, 0.32);
      }
      .bs-pad-shunt {
        background: rgba(245, 158, 11, 0.14);
        border: 2px solid #f59e0b;
        color: #fcd34d;
      }
      .bs-pad-shunt:active {
        background: rgba(245, 158, 11, 0.35);
      }
      .bs-pad-right {
        background: rgba(255, 59, 139, 0.12);
        border: 2px solid #ff3b8b;
        color: #f472b6;
      }
      .bs-pad-right:active {
        background: rgba(255, 59, 139, 0.32);
      }
      .bs-overlay {
        position: absolute;
        inset: 0;
        background: rgba(6, 10, 20, 0.91);
        backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 18px;
        overflow-y: auto;
        z-index: 20;
      }
      .bs-overlay.hidden {
        display: none;
      }
      .bs-results-card {
        width: 100%;
        max-width: 780px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .bs-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 10px;
      }
      .bs-rank-badge {
        font-size: 2.1rem;
        font-weight: 900;
        padding: 4px 16px;
        border-radius: 10px;
        background: rgba(0, 240, 255, 0.14);
        border: 2px solid #00f0ff;
        color: #00f0ff;
      }
      .bs-hist-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 4px;
        align-items: end;
        height: 82px;
        padding: 8px 6px 4px;
        background: #070b14;
        border-radius: 8px;
        border: 1px solid #1e293b;
      }
      .bs-hist-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        gap: 3px;
      }
      .bs-hist-bar {
        width: 100%;
        background: #38bdf8;
        border-radius: 3px 3px 0 0;
        min-height: 2px;
      }
      .bs-hist-lbl {
        font-size: 0.56rem;
        color: #64748b;
        white-space: nowrap;
      }
      .bs-sec-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.78rem;
      }
      .bs-sec-table th, .bs-sec-table td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #1e293b;
      }
      .bs-sec-table th {
        color: #94a3b8;
        font-weight: 600;
      }
      .bs-debug {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        background: rgba(2, 6, 23, 0.92);
        border: 1px solid #38bdf8;
        color: #7dd3fc;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .bs-debug.hidden {
        display: none;
      }
    `,this.root.appendChild(t)}buildDOM(){const t=document.createElement("div");t.className="bs-topbar",t.innerHTML=`
      <div class="bs-brand">
        <div class="bs-title">
          <span>BEATLINE SALVAGE</span>
          <span class="bs-title-pill">SPLIT-SECOND LANES</span>
        </div>
        <div class="bs-subtitle">Two-Lane Magnetic Salvage Sorter · Audio-Clock Precision (±32ms PERFECT)</div>
      </div>
      <div class="bs-controls-row" id="bs-diff-row"></div>
      <div class="bs-controls-row">
        <select class="bs-select" id="bs-section-select" title="Full Shift or Section Practice Loop">
          <option value="">Full 90s Shift (All 4 Sections)</option>
          ${I.map(u=>`<option value="${u.id}">Practice: ${u.title}</option>`).join("")}
        </select>
        <button class="bs-btn bs-btn-amber" id="bs-cal-btn" type="button">Calibrate (<span id="bs-cal-badge">0ms</span>)</button>
        <label class="bs-btn" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
          <input type="checkbox" id="bs-nofail-check" /> No-Fail
        </label>
        <button class="bs-btn" id="bs-mute-btn" type="button">Audio: ON</button>
        <button class="bs-btn" id="bs-pause-btn" type="button">Pause [P]</button>
        <button class="bs-btn" id="bs-restart-btn" type="button">Restart [R]</button>
        <button class="bs-btn bs-btn-primary" id="bs-start-btn" type="button">Start Shift</button>
      </div>
    `,this.root.appendChild(t);const s=t.querySelector("#bs-diff-row"),i=[{id:"easy",label:"Cadet [Easy]"},{id:"standard",label:"Shift Lead [Std]"},{id:"expert",label:"Foundry [Expert]"},{id:"daily",label:"Daily Seed"}];for(const u of i){const h=document.createElement("button");h.type="button",h.className="bs-btn",h.textContent=u.label,h.addEventListener("click",()=>this.callbacks.onSelectDifficulty(u.id)),s.appendChild(h),this.diffButtons.set(u.id,h)}this.sectionSelectEl=t.querySelector("#bs-section-select"),this.sectionSelectEl.addEventListener("change",()=>{const u=this.sectionSelectEl.value;this.callbacks.onSelectPracticeSection(u||null)}),this.calibrationBadgeEl=t.querySelector("#bs-cal-badge"),this.startBtnEl=t.querySelector("#bs-start-btn"),this.pauseBtnEl=t.querySelector("#bs-pause-btn"),this.muteBtnEl=t.querySelector("#bs-mute-btn"),this.noFailCheckEl=t.querySelector("#bs-nofail-check"),t.querySelector("#bs-cal-btn").addEventListener("click",()=>this.callbacks.onOpenCalibrationModal(!0)),this.startBtnEl.addEventListener("click",()=>this.callbacks.onStartOrResume()),this.pauseBtnEl.addEventListener("click",()=>this.callbacks.onPauseToggle()),t.querySelector("#bs-restart-btn").addEventListener("click",()=>this.callbacks.onRestart()),this.muteBtnEl.addEventListener("click",()=>this.callbacks.onToggleMute()),this.noFailCheckEl.addEventListener("change",()=>this.callbacks.onToggleNoFail(this.noFailCheckEl.checked));const a=document.createElement("div");a.className="bs-hud",a.innerHTML=`
      <div class="bs-hud-card">
        <span class="bs-hud-label">Salvage Score</span>
        <span class="bs-hud-value" id="bs-hud-score">0</span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Combo & Multiplier</span>
        <span class="bs-hud-value"><span id="bs-hud-combo">0</span> <small id="bs-hud-mult" style="color:#00f0ff;">1x</small></span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Active Route Mode</span>
        <span class="bs-hud-value" id="bs-hud-route" style="color:#38bdf8;">STANDARD 1.0x</span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Capacitor Stability (<span id="bs-hud-stab-val">100%</span>)</span>
        <div class="bs-stability-track"><div class="bs-stability-fill" id="bs-hud-stab-bar"></div></div>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Audio Clock / Section</span>
        <span class="bs-hud-value" id="bs-hud-time" style="font-size:0.95rem;">0.0s / 90.0s</span>
        <span id="bs-hud-sec" style="font-size:0.7rem;color:#94a3b8;">01 · Intro Induction</span>
      </div>
    `,this.root.appendChild(a),this.hudScoreEl=a.querySelector("#bs-hud-score"),this.hudComboEl=a.querySelector("#bs-hud-combo"),this.hudMultEl=a.querySelector("#bs-hud-mult"),this.hudRouteEl=a.querySelector("#bs-hud-route"),this.hudStabilityBarEl=a.querySelector("#bs-hud-stab-bar"),this.hudStabilityValEl=a.querySelector("#bs-hud-stab-val"),this.hudTimeEl=a.querySelector("#bs-hud-time"),this.hudSectionEl=a.querySelector("#bs-hud-sec");const n=document.createElement("div");n.className="bs-stage-wrap",n.innerHTML=`
      <canvas id="bs-canvas" width="920" height="518"></canvas>
      <div class="bs-overlay hidden" id="bs-results-overlay"></div>
      <div class="bs-overlay hidden" id="bs-cal-modal">
        <div class="bs-results-card" style="max-width:520px;">
          <div class="bs-results-header">
            <div>
              <div style="font-weight:800;font-size:1.1rem;">4-Beat Audio-Input Offset Calibration</div>
              <div style="font-size:0.78rem;color:#94a3b8;">Compensate for Bluetooth / output latency (-150ms to +150ms)</div>
            </div>
            <button class="bs-btn" id="bs-cal-close" type="button">Done</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="font-size:0.82rem;display:flex;justify-content:space-between;">
              <span>Calibration Offset:</span>
              <strong id="bs-cal-val-label" style="color:#00f0ff;">0 ms</strong>
            </label>
            <input type="range" id="bs-cal-slider" min="${A.MIN}" max="${A.MAX}" step="5" value="0" />
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#64748b;">
              <span>-150ms (Early Audio)</span>
              <span>0ms (Direct)</span>
              <span>+150ms (Late Audio / BT)</span>
            </div>
          </div>
          <div style="background:#070b14;border:1px solid #1e293b;padding:12px;border-radius:8px;display:flex;flex-direction:column;gap:8px;">
            <div style="font-size:0.8rem;color:#cbd5e1;" id="bs-cal-tap-status">
              Tap the button below (or press F / J) in rhythm with the 120 BPM (500ms) pulse to auto-estimate your offset.
            </div>
            <div style="display:flex;gap:8px;">
              <button class="bs-btn bs-btn-primary" id="bs-cal-tap-btn" type="button">Tap Beat Pulse (120 BPM)</button>
              <button class="bs-btn" id="bs-cal-reset-btn" type="button">Reset to 0ms</button>
            </div>
          </div>
        </div>
      </div>
    `,this.root.appendChild(n),this.overlayContainerEl=n.querySelector("#bs-results-overlay"),this.calibrationModalEl=n.querySelector("#bs-cal-modal"),this.calSliderEl=n.querySelector("#bs-cal-slider"),this.calValueLabelEl=n.querySelector("#bs-cal-val-label"),this.calTapStatusEl=n.querySelector("#bs-cal-tap-status"),n.querySelector("#bs-cal-close").addEventListener("click",()=>this.callbacks.onOpenCalibrationModal(!1)),this.calSliderEl.addEventListener("input",()=>{this.callbacks.onCalibrationChange(Number(this.calSliderEl.value))}),n.querySelector("#bs-cal-tap-btn").addEventListener("click",()=>this.callbacks.onCalibrationTap()),n.querySelector("#bs-cal-reset-btn").addEventListener("click",()=>this.callbacks.onCalibrationChange(0));const e=document.createElement("div");e.className="bs-touch-deck",e.innerHTML=`
      <button class="bs-pad bs-pad-left" id="bs-pad-left" type="button">
        <span>LEFT RAIL</span>
        <span class="bs-pad-sub">[F] / [D] / [←]</span>
      </button>
      <button class="bs-pad bs-pad-shunt" id="bs-pad-shunt" type="button">
        <span>OVERDRIVE SHUNT (1.5x)</span>
        <span class="bs-pad-sub">[SPACE] AT GATE</span>
      </button>
      <button class="bs-pad bs-pad-right" id="bs-pad-right" type="button">
        <span>RIGHT RAIL</span>
        <span class="bs-pad-sub">[J] / [K] / [→]</span>
      </button>
    `,this.root.appendChild(e);const o=(u,h)=>{e.querySelector(u).addEventListener("pointerdown",b=>{b.preventDefault(),h()})};o("#bs-pad-left",()=>this.callbacks.onLaneInput("left")),o("#bs-pad-shunt",()=>this.callbacks.onShuntInput()),o("#bs-pad-right",()=>this.callbacks.onLaneInput("right")),this.debugPanelEl=document.createElement("div"),this.debugPanelEl.className="bs-debug hidden",this.root.appendChild(this.debugPanelEl)}triggerLaneFlash(t,s){t==="left"?this.leftFlashUntilMs=s+110:this.rightFlashUntilMs=s+110}triggerShuntFlash(t){this.shuntFlashUntilMs=t+240}setCalibrationModalOpen(t,s,i){this.calibrationModalEl.classList.toggle("hidden",!t),this.calSliderEl.value=String(s);const a=s>0?"+":"";this.calValueLabelEl.textContent=`${a}${s} ms`,this.calibrationBadgeEl.textContent=`${a}${s}ms`,i&&(this.calTapStatusEl.textContent=i)}hideResultsOverlay(){this.overlayContainerEl.classList.add("hidden"),this.overlayContainerEl.innerHTML=""}showResultsOverlay(t,s,i,a){const n=Math.max(1,...t.histogram.map(l=>l.count)),e=s.chartRecords[t.chartId],o=t.meanErrorMs>0?"+":"",u=Math.abs(t.meanErrorMs)<=8?"Locked-in Center Calibration":t.meanErrorMs>0?`Mean Late Bias (${o}${t.meanErrorMs}ms)`:`Mean Early Bias (${t.meanErrorMs}ms)`,h=I.find(l=>l.id===t.weakestSectionId)??I[0];this.overlayContainerEl.innerHTML=`
      <div class="bs-results-card">
        <div class="bs-results-header">
          <div>
            <div style="font-size:0.74rem;color:#38bdf8;text-transform:uppercase;font-weight:700;">
              ${t.completed?"Shift Completed · Diagnostic Report":"Capacitor Overload · Shift Halted"}
            </div>
            <div style="font-size:1.25rem;font-weight:800;color:#f8fafc;">${t.chartTitle}</div>
            <div style="font-size:0.78rem;color:#94a3b8;">
              Score: <strong style="color:#fff;">${t.totalScore.toLocaleString()}</strong> ·
              Accuracy: <strong style="color:#00f0ff;">${t.accuracyPct}%</strong> ·
              Max Combo: <strong>${t.maxCombo}x</strong> ·
              Best Saved: <strong>${(e?.bestScore??t.totalScore).toLocaleString()} (${e?.bestRank??t.rank})</strong>
            </div>
          </div>
          <div class="bs-rank-badge">${t.rank}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;text-align:center;font-size:0.76rem;">
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #00f0ff44;">
            <div style="color:#00f0ff;font-weight:700;">PERFECT</div>
            <div style="font-size:1rem;font-weight:800;">${t.counts.PERFECT}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #22c55e44;">
            <div style="color:#22c55e;font-weight:700;">GOOD</div>
            <div style="font-size:1rem;font-weight:800;">${t.counts.GOOD}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #f59e0b44;">
            <div style="color:#fbbf24;font-weight:700;">EARLY</div>
            <div style="font-size:1rem;font-weight:800;">${t.counts.EARLY}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #f9731644;">
            <div style="color:#fb923c;font-weight:700;">LATE</div>
            <div style="font-size:1rem;font-weight:800;">${t.counts.LATE}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #ef444444;">
            <div style="color:#f87171;font-weight:700;">MISS</div>
            <div style="font-size:1rem;font-weight:800;">${t.counts.MISS}</div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:0.78rem;">
            <span style="font-weight:700;color:#cbd5e1;">Timing-Error Distribution Histogram (-120ms Early .. +120ms Late)</span>
            <span style="color:#38bdf8;">${u}</span>
          </div>
          <div class="bs-hist-grid">
            ${t.histogram.map((l,b)=>{const d=Math.max(4,Math.round(l.count/n*100)),m=b===5||b===6?"#00f0ff":b>=4&&b<=7?"#22c55e":"#f59e0b";return`
                  <div class="bs-hist-col" title="${l.label}ms: ${l.count} hits">
                    <span style="font-size:0.62rem;color:#cbd5e1;">${l.count||""}</span>
                    <div class="bs-hist-bar" style="height:${d}%;background:${m};"></div>
                    <span class="bs-hist-lbl">${l.minMs>=0?"+":""}${l.minMs}</span>
                  </div>
                `}).join("")}
          </div>
        </div>

        <div>
          <div style="font-weight:700;font-size:0.78rem;color:#cbd5e1;margin-bottom:4px;">4-Section Breakdown & Overdrive Shunt Routing</div>
          <table class="bs-sec-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Route</th>
                <th>Accuracy</th>
                <th>P / G / E+L / M</th>
                <th>Mean Error</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${t.sectionBreakdowns.map(l=>{const b=l.sectionId===t.weakestSectionId;return`
                    <tr style="${b?"background:rgba(245,158,11,0.09);":""}">
                      <td><strong>${l.title}</strong> ${b?'<span style="color:#fbbf24;font-size:0.68rem;">[WEAKEST]</span>':""}</td>
                      <td style="color:${l.routeChosen==="overdrive"?"#fbbf24":"#38bdf8"};font-weight:700;">
                        ${l.routeChosen==="overdrive"?"OVERDRIVE 1.5x":"STANDARD 1.0x"}
                      </td>
                      <td>${l.accuracyPct}%</td>
                      <td>${l.perfectCount} / ${l.goodCount} / ${l.earlyCount+l.lateCount} / ${l.missCount}</td>
                      <td>${l.meanErrorMs>0?"+":""}${l.meanErrorMs}ms</td>
                      <td>
                        <button class="bs-btn bs-sec-drill-btn" data-sec="${l.sectionId}" type="button" style="padding:3px 8px;font-size:0.7rem;">
                          Drill Section
                        </button>
                      </td>
                    </tr>
                  `}).join("")}
            </tbody>
          </table>
        </div>

        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding-top:4px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="bs-btn bs-btn-amber" id="bs-res-practice-weakest" type="button">
              Practice Weakest Section (${h.title})
            </button>
            ${Math.abs(t.meanErrorMs)>=10?`<button class="bs-btn" id="bs-res-apply-cal" type="button">
                     Apply Suggested Offset (${t.suggestedCalibrationOffsetMs>=0?"+":""}${t.suggestedCalibrationOffsetMs}ms)
                   </button>`:""}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="bs-btn bs-btn-primary" id="bs-res-retry-btn" type="button">
              Retry Shift [R]
            </button>
          </div>
        </div>
      </div>
    `,this.overlayContainerEl.classList.remove("hidden"),this.overlayContainerEl.querySelector("#bs-res-practice-weakest")?.addEventListener("click",()=>{i(t.weakestSectionId)}),this.overlayContainerEl.querySelector("#bs-res-apply-cal")?.addEventListener("click",()=>{a(t.suggestedCalibrationOffsetMs)}),this.overlayContainerEl.querySelector("#bs-res-retry-btn")?.addEventListener("click",()=>{this.callbacks.onRestart()}),this.overlayContainerEl.querySelectorAll(".bs-sec-drill-btn").forEach(l=>{l.addEventListener("click",()=>{const b=l.getAttribute("data-sec");b&&i(b)})})}renderFrame(t,s,i,a,n){for(const[g,R]of this.diffButtons.entries())R.classList.toggle("active",s.id===g);this.sectionSelectEl.value=s.practiceSectionId??"";const e=i.calibrationOffsetMs>0?"+":"";this.calibrationBadgeEl.textContent=`${e}${i.calibrationOffsetMs}ms`,this.noFailCheckEl.checked=t.getNoFailMode(),this.muteBtnEl.textContent=i.muted?"Audio: MUTED":"Audio: ON";const o=t.getStatus();this.startBtnEl.textContent=o==="playing"?"Shift Running":o==="paused"?"Resume Shift":"Start Shift",this.pauseBtnEl.textContent=o==="paused"?"Resume [P]":"Pause [P]";const u=t.getCombo(),h=J(u),l=t.getCalibratedTrackTimeMs(),b=t.getCurrentRouteForTimeMs(l),d=Math.round(t.getStability()),v=Y(Math.max(0,l)),m=s.practiceEndTimeMs??s.durationMs;if(this.hudScoreEl.textContent=t.getScore().toLocaleString(),this.hudComboEl.textContent=`${u}`,this.hudMultEl.textContent=`${h}x`,this.hudRouteEl.textContent=b==="overdrive"?"OVERDRIVE SHUNT 1.5x":"STANDARD 1.0x",this.hudRouteEl.style.color=b==="overdrive"?"#fbbf24":"#38bdf8",this.hudStabilityValEl.textContent=`${d}%`,this.hudStabilityBarEl.style.width=`${d}%`,this.hudStabilityBarEl.style.background=d>50?"linear-gradient(90deg, #22c55e, #00f0ff)":d>25?"#f59e0b":"#ef4444",this.hudTimeEl.textContent=`${(Math.max(0,l)/1e3).toFixed(1)}s / ${(m/1e3).toFixed(1)}s`,this.hudSectionEl.textContent=v.title,this.drawCanvas(t,s,l,b,n),a){this.debugPanelEl.classList.remove("hidden");const g=t.getUpcomingOrActiveGate(l);this.debugPanelEl.textContent=[`STATUS=${o.toUpperCase()}`,`RAW_MS=${Math.round(t.getRawTrackTimeMs())}`,`CAL_TRACK_MS=${Math.round(l)}`,`OFFSET_MS=${t.getCalibrationOffsetMs()}`,`ROUTE=${b.toUpperCase()}`,`SECTION=${v.id}`,`GATE=${g?`${g.gate.timeMs}ms(canAct=${g.canActivateNow})`:"none"}`,`PAUSES=${t.getPauseCount()}`,`INPUTS=${t.getRecordedInputs().length}`].join(" | ")}else this.debugPanelEl.classList.add("hidden")}drawCanvas(t,s,i,a,n){const e=this.ctx,o=this.canvas.width,u=this.canvas.height;e.fillStyle=a==="overdrive"?"#130d06":"#050914",e.fillRect(0,0,o,u);const h=(Math.max(0,i)%500+500)%500,l=Math.max(0,1-h/250)*.14;e.fillStyle=a==="overdrive"?`rgba(245, 158, 11, ${l})`:`rgba(0, 240, 255, ${l})`,e.fillRect(0,0,o,u);const b=58,d=u-88,v=1800,m=o*.41,g=o*.59,R=o*.31,N=o*.69,f=p=>{const x=1-p/v;return b+x*(d-b)},C=(p,x)=>{const E=(x-b)/(d-b);return p==="left"?m+(R-m)*E:g+(N-g)*E};e.save(),e.strokeStyle=a==="overdrive"?"rgba(251, 191, 36, 0.45)":"rgba(56, 189, 248, 0.35)",e.lineWidth=2;const D=(p,x)=>{e.beginPath(),e.moveTo(p,b),e.lineTo(x,u-30),e.stroke()};D(o*.33,o*.17),D(o*.5,o*.5),D(o*.67,o*.83),e.restore();const T=Math.floor(i/500)*500;e.save();for(let p=T;p<=i+v;p+=500){const x=p-i;if(x<-120)continue;const E=f(x),O=Math.max(.15,(E-b)/(d-b)),V=o*.33+(o*.17-o*.33)*O,q=o*.67+(o*.83-o*.67)*O;e.strokeStyle=p%2e3===0?"rgba(148, 163, 184, 0.35)":"rgba(148, 163, 184, 0.14)",e.lineWidth=p%2e3===0?2:1,e.beginPath(),e.moveTo(V,E),e.lineTo(q,E),e.stroke()}e.restore();for(const p of s.shuntGates){const x=p.timeMs-i;if(x<-300||x>v)continue;const E=f(x),O=Math.max(.2,(E-b)/(d-b)),V=o*.33+(o*.17-o*.33)*O,q=o*.67+(o*.83-o*.67)*O;e.save(),e.strokeStyle="#fbbf24",e.lineWidth=4,e.setLineDash([10,6]),e.beginPath(),e.moveTo(V,E),e.lineTo(q,E),e.stroke(),e.fillStyle="#fbbf24",e.font="bold 12px Inter, sans-serif",e.textAlign="center",e.fillText("⚡ SHUNT GATE — PRESS [SPACE] FOR 1.5x OVERDRIVE ⚡",o*.5,E-8),e.restore()}const $=(p,x)=>{const E=C(p,d),O=p==="left"?"#00f0ff":"#ff3b8b";e.save(),e.beginPath(),e.arc(E,d,32,0,Math.PI*2),e.fillStyle=x?`${O}55`:"rgba(15, 23, 42, 0.85)",e.fill(),e.lineWidth=x?4:2.5,e.strokeStyle=O,e.stroke(),e.beginPath(),e.arc(E,d,14,0,Math.PI*2),e.strokeStyle=`${O}88`,e.lineWidth=1.5,e.stroke(),e.fillStyle="#cbd5e1",e.font="bold 11px Inter, sans-serif",e.textAlign="center",e.fillText(p==="left"?"F / D / ←":"J / K / →",E,d+48),e.restore()};$("left",n<this.leftFlashUntilMs),$("right",n<this.rightFlashUntilMs);const w=t.getActiveNoteStates();for(const p of w){if(p.judged)continue;const x=p.note.timeMs-i;if(x<-180||x>v)continue;const E=f(x),O=C(p.note.lane,E),V=Math.max(.42,Math.min(1.15,(E-b)/(d-b))),q=26*V,st=p.note.coreType==="plasma"||p.note.routeBranch==="overdrive",it=st?"#fbbf24":p.note.lane==="left"?"#00f0ff":"#ff3b8b";e.save(),e.beginPath(),e.arc(O,E,q,0,Math.PI*2),e.fillStyle=it,e.shadowColor=it,e.shadowBlur=14,e.fill(),e.lineWidth=2,e.strokeStyle="#ffffff",e.stroke(),st&&(e.fillStyle="#090d16",e.font=`bold ${Math.round(11*V)}px Inter, sans-serif`,e.textAlign="center",e.textBaseline="middle",e.fillText("1.5x",O,E)),e.restore()}const G=t.getUpcomingOrActiveGate(i);G&&G.canActivateNow&&(e.save(),e.fillStyle="rgba(245, 158, 11, 0.24)",e.strokeStyle="#fbbf24",e.lineWidth=2,e.beginPath(),e.roundRect(o*.5-190,14,380,32,999),e.fill(),e.stroke(),e.fillStyle="#fde68a",e.font="bold 13px Inter, sans-serif",e.textAlign="center",e.fillText("SHUNT GATE READY — PRESS [SPACE] FOR OVERDRIVE (1.5x)",o*.5,35),e.restore());const P=280,F=12,y=(o-P)/2,c=u-28;e.save(),e.fillStyle="#0f172a",e.strokeStyle="#334155",e.lineWidth=1,e.fillRect(y,c,P,F),e.strokeRect(y,c,P,F);const S=B.PERFECT/B.EARLY_LATE*(P/2);e.fillStyle="rgba(0, 240, 255, 0.28)",e.fillRect(o/2-S,c,S*2,F),e.strokeStyle="#ffffff",e.beginPath(),e.moveTo(o/2,c-3),e.lineTo(o/2,c+F+3),e.stroke();const M=t.getLastFeedback();if(M&&Math.abs(i-M.trackTimeMs)<950){if(M.deltaMs!==void 0){const p=Math.max(-120,Math.min(120,M.deltaMs)),x=o/2+p/120*(P/2);e.fillStyle=M.grade==="PERFECT"?"#00f0ff":M.grade==="GOOD"?"#22c55e":"#fbbf24",e.fillRect(x-2,c-4,4,F+8)}e.font="bold 20px Inter, sans-serif",e.textAlign="center",e.fillStyle=M.grade==="PERFECT"?"#00f0ff":M.grade==="GOOD"?"#22c55e":M.grade==="OVERDRIVE"?"#fbbf24":M.grade==="MISS"?"#ef4444":"#f59e0b",e.fillText(M.text,o*.5,d-52)}const k=t.getStatus();(k==="idle"||k==="paused")&&(e.fillStyle="rgba(5, 9, 20, 0.72)",e.fillRect(0,0,o,u),e.fillStyle="#f8fafc",e.font="bold 26px Inter, sans-serif",e.textAlign="center",e.fillText(k==="paused"?"SHIFT PAUSED — AUDIO CLOCK LOCKED":`${s.title} · READY ON CONVEYOR`,o*.5,u*.44),e.fillStyle="#94a3b8",e.font="14px Inter, sans-serif",e.fillText(k==="paused"?'Press [P] or Click "Resume Shift" — Zero Phantom Misses Guaranteed':'Press [Space] or Click "Start Shift" · Left [F/D/←] · Right [J/K/→] · Shunt [Space]',o*.5,u*.52)),e.restore()}}const vt={id:"05-beatline-salvage",number:5,title:"Beatline Salvage",subtitle:"Split-Second Lanes",genre:"Audio-Clock Two-Lane Rhythm & Salvage Machine",primaryReference:"Rhythm Doctor / Muse Dash",supportingReference:"Thumper / Hi-Fi RUSH",oneSentenceLoop:"Sort magnetic salvage cores across Left and Right induction lanes synced to a 90s industrial-synthwave audio clock, triggering Overdrive Shunt gates for 1.5x yield.",shortGoal:"Calibrate your audio offset and clear a 90-second salvage shift with high accuracy and an S/A rank.",longGoal:"Master all 4 track sections on Overdrive Shunt routes using the post-run Timing-Error Histogram and Section Practice Loop.",controlsSummary:"Left: [F]/[D]/[←] · Right: [J]/[K]/[→] · Overdrive Shunt: [Space] · Pause: [P]/[Esc] · Restart: [R]",accentColor:"#00f0ff"};function St(r,t){let s=ct(),i=t?.initialSeed??W(),a="standard",n=null,e=!!t?.debug,o=!1,u=[];const h=new nt(s.muted),l=()=>{const c=rt(a,i);return n?lt(c,n):c};let b=l();const d=new et(b,{calibrationOffsetMs:s.calibrationOffsetMs,noFailMode:s.noFailMode});let v=!1;const m=()=>{h.ensureContext();const c=h.getNowAudioMs();if(d.getStatus()==="paused"){d.resume(c),T.hideResultsOverlay();return}h.resetScheduler(),v=!1,T.hideResultsOverlay(),d.start(c)},g=()=>{h.ensureContext(),h.resetScheduler(),v=!1,T.hideResultsOverlay(),d.restart(h.getNowAudioMs())},R=()=>{const c=d.getStatus(),S=h.getNowAudioMs();c==="playing"?d.pause(S):c==="paused"&&d.resume(S)},N=c=>{h.ensureContext();const S=h.getNowAudioMs(),M=typeof performance<"u"?performance.now():Date.now();if(T.triggerLaneFlash(c,M),o){D();return}if(d.getStatus()!=="playing")return;const k=d.handleLaneInput(c,S),p=d.getCurrentRouteForTimeMs();k&&h.playHitSfx(k.grade,c,p)},f=()=>{h.ensureContext();const c=h.getNowAudioMs(),S=typeof performance<"u"?performance.now():Date.now();if(T.triggerShuntFlash(S),d.getStatus()==="idle"){m();return}if(d.getStatus()!=="playing")return;d.handleShuntSwitchInput(c)&&h.playShuntGateSfx()},C=(c,S)=>{const M=Math.max(A.MIN,Math.min(A.MAX,Math.round(c/5)*5));s.calibrationOffsetMs=M,_(s),d.setCalibrationOffsetMs(M),T.setCalibrationModalOpen(o,M,S)},D=()=>{h.ensureContext(),h.playCalibrationPulse(!0);const c=h.getNowAudioMs();u.push(c),u.length>5&&u.shift();const S=Math.round(c/500)*500,M=Math.max(-150,Math.min(150,Math.round(c-S)));C(M,`Measured tap offset: ${M>=0?"+":""}${M}ms (Applied to Audio Clock)`)},T=new Mt(r,{onSelectDifficulty:c=>{a=c,b=l(),d.setChart(b),v=!1,T.hideResultsOverlay()},onSelectPracticeSection:c=>{n=c,b=l(),d.setChart(b),v=!1,T.hideResultsOverlay()},onStartOrResume:()=>m(),onPauseToggle:()=>R(),onRestart:()=>g(),onLaneInput:c=>N(c),onShuntInput:()=>f(),onCalibrationChange:c=>C(c),onToggleNoFail:c=>{s.noFailMode=c,_(s),d.setNoFailMode(c)},onToggleMute:()=>{s.muted=!s.muted,_(s),h.setMuted(s.muted)},onOpenCalibrationModal:c=>{o=c,u=[],c&&d.getStatus()==="playing"&&d.pause(h.getNowAudioMs()),T.setCalibrationModalOpen(c,s.calibrationOffsetMs)},onCalibrationTap:()=>D()}),$=c=>{if(c.repeat)return;const S=c.key.toLowerCase();S==="f"||S==="d"||c.key==="ArrowLeft"?(c.preventDefault(),N("left")):S==="j"||S==="k"||c.key==="ArrowRight"?(c.preventDefault(),N("right")):c.code==="Space"?(c.preventDefault(),f()):S==="p"||c.key==="Escape"?(c.preventDefault(),o?(o=!1,T.setCalibrationModalOpen(!1,s.calibrationOffsetMs)):R()):S==="r"?(c.preventDefault(),g()):S==="m"?(c.preventDefault(),s.muted=!s.muted,_(s),h.setMuted(s.muted)):(c.key==="`"||c.key==="F3")&&(e=!e)},w=()=>{d.getStatus()==="playing"&&d.pause(h.getNowAudioMs())},G=()=>{document.hidden&&d.getStatus()==="playing"&&d.pause(h.getNowAudioMs())};window.addEventListener("keydown",$),window.addEventListener("blur",w),document.addEventListener("visibilitychange",G);let P=0,F=!1;const y=()=>{if(F)return;const c=h.getNowAudioMs(),S=typeof performance<"u"?performance.now():Date.now();if(d.getStatus()==="playing"){d.stepToAudioTimeMs(c);const k=d.getCalibratedTrackTimeMs(),p=d.getCurrentRouteForTimeMs(k);h.updateTrackMusic(k,p)}const M=d.getStatus();if((M==="completed"||M==="failed")&&!v){v=!0;const k=d.getResultsSummary();s=dt(s,k),T.showResultsOverlay(k,s,p=>{n=p,b=l(),d.setChart(b),m()},p=>{C(p),g()})}T.renderFrame(d,b,s,e,S),P=window.requestAnimationFrame(y)};return P=window.requestAnimationFrame(y),{destroy(){F=!0,window.cancelAnimationFrame(P),window.removeEventListener("keydown",$),window.removeEventListener("blur",w),document.removeEventListener("visibilitychange",G),h.destroy(),r.innerHTML=""},getStateSnapshot(){return{status:d.getStatus(),chartId:b.id,practiceSectionId:b.practiceSectionId??null,rawTrackTimeMs:d.getRawTrackTimeMs(),calibratedTrackTimeMs:d.getCalibratedTrackTimeMs(),calibrationOffsetMs:d.getCalibrationOffsetMs(),score:d.getScore(),combo:d.getCombo(),maxCombo:d.getMaxCombo(),stability:d.getStability(),route:d.getCurrentRouteForTimeMs()}},restartWithSeed(c){i=c,a="daily",n=null,b=l(),d.setChart(b),g()},toggleDebug(c){e=typeof c=="boolean"?c:!e}}}const yt=Object.freeze(Object.defineProperty({__proto__:null,BeatlineAudioEngine:nt,BeatlineSimulation:et,CALIBRATION_LIMITS_MS:A,HISTOGRAM_BINS:at,JUDGMENT_WINDOWS_MS:B,LEAD_IN_MS:1500,SCORE_VALUES:U,SONG_SECTIONS:I,STABILITY_CONFIG:L,STORAGE_KEY:Q,SeededRng:ot,TRACK_DURATION_MS:9e4,buildPerfectInputsForRoute:mt,computeRankGrade:ht,computeTimingHistogram:bt,createDefaultSaveData:H,createSectionPracticeChart:lt,createSeededDailyChart:Z,evaluateRecordedInputs:gt,getAllBaseCharts:pt,getChartById:rt,getComboMultiplier:J,getSectionForTimeMs:Y,getTodayDailySeed:W,judgeHit:ut,loadSaveData:ct,metadata:vt,mountGame:St,recordRunResult:dt,sanitizeSaveData:tt,saveSaveData:_},Symbol.toStringTag,{value:"Module"}));export{yt as g,St as m};
