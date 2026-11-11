import{_ as Ee}from"./preload-helper-Ct5FWWRu.js";const l={BOARD_COLS:6,BOARD_ROWS:10,PREVIEW_COUNT:3,SPAWN_COL:1,SPAWN_ROW:0,BASE_GRAVITY_MS:5500,MIN_GRAVITY_MS:1400,GRAVITY_DECAY_PER_LEVEL_MS:320,LINES_PER_LEVEL:6,SPRINT_TARGET_LINES:20,SLAG_RISE_INTERVAL_STAMPS:6,SLAG_MAX_STACK_HEIGHT:6,INITIAL_CHISEL_CHARGES:1,MAX_CHISEL_CHARGES:3,FINESSE_STREAK_FOR_CHISEL:3,SCORE_FLUSH_BASE:30,SCORE_FLAT_SKYLINE:400,SCORE_ALL_CLEAR:1e3,SCORE_PUZZLE_CLEAR:500,FINESSE_BONUS_MULTIPLIER:1.25,LINE_CLEAR_SCORES:[0,120,320,650,1200],COMBO_BONUS_BASE:60};function Le(e){const o=Math.min(...e.map(n=>n.r)),s=Math.min(...e.map(n=>n.c));return e.map(n=>({r:n.r-o,c:n.c-s})).sort((n,r)=>n.r!==r.r?n.r-r.r:n.c-r.c)}function P(e){const o=[];let s=Le(e);for(let n=0;n<4;n++)o.push(s),s=Le(s.map(r=>({r:r.c,c:-r.r})));return o}const L={I3:{id:"I3",name:"Beam-3",color:"#06b6d4",border:"#67e8f9",glyph:"━",tip:"Flat leveler or vertical 3-deep well strike.",rotations:P([{r:0,c:0},{r:0,c:1},{r:0,c:2}]),uniqueOrientations:2},O4:{id:"O4",name:"Anvil-2x2",color:"#eab308",border:"#fde047",glyph:"■",tip:"Requires a 2-wide flat shelf for a zero-overhang flush.",rotations:P([{r:0,c:0},{r:0,c:1},{r:1,c:0},{r:1,c:1}]),uniqueOrientations:1},T4:{id:"T4",name:"Keystone-T",color:"#a855f7",border:"#d8b4fe",glyph:"┻",tip:"Parity fixer: balances jagged 1-step notches.",rotations:P([{r:0,c:1},{r:1,c:0},{r:1,c:1},{r:1,c:2}]),uniqueOrientations:4},L3:{id:"L3",name:"Corner-3",color:"#f97316",border:"#fdba74",glyph:"┗",tip:"Compact 3-cell corner that repairs 1-cell steps cleanly.",rotations:P([{r:0,c:0},{r:1,c:0},{r:1,c:1}]),uniqueOrientations:4},J4:{id:"J4",name:"Hook-J",color:"#3b82f6",border:"#93c5fd",glyph:"┛",tip:"Left hook: slots into 2-deep steps or flat 3-wide ledges.",rotations:P([{r:0,c:0},{r:1,c:0},{r:1,c:1},{r:1,c:2}]),uniqueOrientations:4},L4:{id:"L4",name:"Hook-L",color:"#10b981",border:"#6ee7b7",glyph:"┙",tip:"Right hook: slots into right-hand wells or flat ledges.",rotations:P([{r:0,c:2},{r:1,c:0},{r:1,c:1},{r:1,c:2}]),uniqueOrientations:4},S4:{id:"S4",name:"Step-S",color:"#f43f5e",border:"#fda4af",glyph:"▞",tip:"Staircase piece: rotate vertically to fit 1-step slopes without overhangs.",rotations:P([{r:0,c:1},{r:0,c:2},{r:1,c:0},{r:1,c:1}]),uniqueOrientations:2}},pe=["I3","O4","T4","L3","J4","L4","S4"],ae=[{id:"dojo-01-flat-shelf",title:"Lesson 1: The Keyed Overhang",lesson:"Rotate Hook-L 180° and slot its tooth into Column 4 to smelt both rows with 0 buried voids.",activePiece:"L4",holdPiece:"O4",bottomRows:[["I3","I3","I3",null,null,null],["J4","J4","J4",null,"J4","J4"]]},{id:"dojo-02-keystone-notch",title:"Lesson 2: The Keystone Notch",lesson:"Point the Keystone-T downward into the center notch to smelt both rows at once!",activePiece:"T4",holdPiece:"I3",bottomRows:[["O4","O4",null,null,null,"L4"],["J4","J4","J4",null,"S4","S4"]]},{id:"dojo-03-hold-discipline",title:"Lesson 3: Hold Chamber Discipline",lesson:"Anvil-2x2 would trap a buried void! Press [C] to swap for Corner-3 in Hold, then rotate 180°.",activePiece:"O4",holdPiece:"L3",bottomRows:[["I3","I3","I3",null,null,"J4"],["T4","T4","T4","T4",null,"J4"]]},{id:"dojo-04-vertical-step",title:"Lesson 4: Staircase Parity",lesson:"Stand Step-S vertically (rotate 90°) so it hugs the 1-cell step without trapping air underneath.",activePiece:"S4",holdPiece:"O4",bottomRows:[["I3","I3","I3",null,null,"L4"],["J4","J4","J4","J4",null,"L4"]]},{id:"dojo-05-deep-well-strike",title:"Lesson 5: The Vertical Well",lesson:"Rotate Beam-3 vertically and drop it into Column 6 for a clean 3-Row Triple Temper!",activePiece:"I3",holdPiece:"T4",bottomRows:[["O4","O4","J4","J4","J4",null],["O4","O4","L4","L4","L4",null],["I3","I3","I3","L3","L3",null]]}];class Ue{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;if(!this.ctx){const o=window.AudioContext||window.webkitAudioContext;if(o)try{this.ctx=new o}catch{return null}}return this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(o){this.muted=o}isMuted(){return this.muted}playMove(){this.playTone(260,.035,"triangle",.06)}playRotate(){this.playTone(390,.045,"sine",.08,520)}playHold(){this.playTone(330,.06,"sine",.08,440)}playChisel(){this.playTone(780,.11,"sawtooth",.09,220)}playStamp(o,s,n){if(o>0){const r=330+o*110;this.playTone(r,.16,"triangle",.14,r*1.5);return}if(s){const r=n?480:380;this.playTone(r,.08,"sine",.1,r*1.25)}else this.playTone(145,.11,"sawtooth",.09,110)}playTone(o,s,n,r,i){const a=this.ensureContext();if(a)try{const t=a.createOscillator(),f=a.createGain();t.type=n,t.frequency.setValueAtTime(o,a.currentTime),i&&t.frequency.exponentialRampToValueAtTime(i,a.currentTime+s),f.gain.setValueAtTime(r,a.currentTime),f.gain.exponentialRampToValueAtTime(.001,a.currentTime+s),t.connect(f),f.connect(a.destination),t.start(),t.stop(a.currentTime+s)}catch{}}}const Re="argon_game11_keystone_forge_v1";function U(){return{schemaVersion:1,highScore:0,bestFlushStreak:0,bestSprintMs:null,totalLinesForged:0,totalPerfectFinesse:0,highestDojoStage:0,recordedRunIds:[]}}function Te(){try{if(typeof localStorage>"u")return U();const e=localStorage.getItem(Re);if(!e)return U();const o=JSON.parse(e);return o.schemaVersion!==1?U():{schemaVersion:1,highScore:Number(o.highScore)||0,bestFlushStreak:Number(o.bestFlushStreak)||0,bestSprintMs:typeof o.bestSprintMs=="number"?o.bestSprintMs:null,totalLinesForged:Number(o.totalLinesForged)||0,totalPerfectFinesse:Number(o.totalPerfectFinesse)||0,highestDojoStage:Number(o.highestDojoStage)||0,recordedRunIds:Array.isArray(o.recordedRunIds)?o.recordedRunIds.slice(-30):[]}}catch{return U()}}function Fe(e){try{if(typeof localStorage>"u")return;localStorage.setItem(Re,JSON.stringify(e))}catch{}}function le(e,o){const s=`${o.seed}:${o.mode}:${o.stampsCount}`,n=e.recordedRunIds.includes(s),r={...e,highScore:Math.max(e.highScore,o.score),bestFlushStreak:Math.max(e.bestFlushStreak,o.maxFlushStreak),highestDojoStage:o.mode==="puzzle"?Math.max(e.highestDojoStage,o.puzzleIndex):e.highestDojoStage,bestSprintMs:o.mode==="sprint"&&o.status==="won"?e.bestSprintMs===null?o.elapsedMs:Math.min(e.bestSprintMs,o.elapsedMs):e.bestSprintMs,totalLinesForged:n?e.totalLinesForged:e.totalLinesForged+(o.lastStamp?.linesCleared??0),totalPerfectFinesse:n?e.totalPerfectFinesse:e.totalPerfectFinesse+(o.lastStamp?.wasPerfectFinesse?1:0),recordedRunIds:n?e.recordedRunIds:[...e.recordedRunIds.slice(-29),s]};return Fe(r),r}function ee(e){let o=(Math.floor(Math.abs(e))||20261107)>>>0;function s(){o=o+1831565813>>>0;let i=Math.imul(o^o>>>15,1|o);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}function n(i){return i<=1?0:Math.floor(s()*i)}function r(i){const a=[...i];for(let t=a.length-1;t>0;t--){const f=n(t+1),c=a[t];a[t]=a[f],a[f]=c}return a}return{next:s,nextInt:n,shuffle:r,getState:()=>o,setState:i=>{o=i>>>0}}}function ge(){return Array.from({length:l.BOARD_ROWS},()=>Array.from({length:l.BOARD_COLS},()=>null))}function z(e){return e.map(o=>[...o])}function te(e,o){const s=L[e].rotations[(o%4+4)%4];return Math.max(...s.map(n=>n.c))+1}function Ge(e,o){const s=L[e].rotations[(o%4+4)%4];return Math.max(...s.map(n=>n.r))+1}function B(e,o,s){const n=te(e,o),r=Math.max(0,l.BOARD_COLS-n);return Math.max(0,Math.min(r,s))}function H(e,o=0){const s=te(e,o);return Math.floor((l.BOARD_COLS-s)/2)}function Ie(e,o,s){const r=L[e].uniqueOrientations,i=(o%4+4)%4%r,a=i===3?1:i,t=H(e,0),f=Math.abs(s-t);return Math.min(a,4-i)+f}function W(e){const o=[];for(let s=0;s<l.BOARD_COLS;s++){let n=!1;for(let r=0;r<l.BOARD_ROWS;r++)e[r][s]!==null?n=!0:n&&o.push({r,c:s})}return{count:o.length,cells:o}}function J(e){const o=[];for(let s=0;s<l.BOARD_COLS;s++){let n=0;for(let r=0;r<l.BOARD_ROWS;r++)if(e[r][s]!==null){n=l.BOARD_ROWS-r;break}o.push(n)}return o}function me(e){const o=J(e),s=o[0];return o.every(n=>n===s)}function ce(e,o,s,n,r){const i=L[o].rotations[(s%4+4)%4];for(const a of i){const t=n+a.r,f=r+a.c;if(f<0||f>=l.BOARD_COLS||t<0||t>=l.BOARD_ROWS||e[t][f]!==null)return!1}return!0}function oe(e,o,s,n){const r=B(o,s,n);if(!ce(e,o,s,0,r))return null;let i=0;for(;ce(e,o,s,i+1,r);)i++;return i}function he(e){const o=e.filter(r=>r.some(i=>i===null)),s=l.BOARD_ROWS-o.length;return{nextBoard:[...Array.from({length:s},()=>Array.from({length:l.BOARD_COLS},()=>null)),...o],clearedCount:s}}function be(e,o,s,n,r=0){const i=(s%4+4)%4,a=B(o,i,n),t=oe(e,o,i,a);if(t===null)return null;const c=L[o].rotations[i].map(k=>({r:t+k.r,c:a+k.c})),F=W(e),w=new Set(F.cells.map(k=>`${k.r},${k.c}`)),x=z(e);for(const k of c)x[k.r][k.c]=o;const{nextBoard:R,clearedCount:y}=he(x),b=W(R),m=b.cells.filter(k=>!w.has(`${k.r},${k.c}`)),v=Ie(o,i,a);return{landingRow:t,cells:c,newBuriedVoidCells:m,totalBuriedVoidsAfter:b.count,wouldClearLines:y,isFlushFit:m.length===0,isFlatSkylineAfter:me(R),optimalMoves:v,movesUsed:r,isPerfectFinesseSoFar:r<=v}}function Z(e){return be(e.board,e.active.pieceId,e.active.rotation,e.active.col,e.active.movesUsed)}function ve(e,o){const s=ee(1);s.setState(e);let n=[...o];return n.length===0&&(n=s.shuffle(pe)),{piece:n.shift(),nextBag:n,nextRngState:s.getState()}}function de(e,o){const s=ae[o%ae.length],n=ge(),r=l.BOARD_ROWS-s.bottomRows.length;for(let i=0;i<s.bottomRows.length;i++)for(let a=0;a<l.BOARD_COLS;a++)n[r+i][a]=s.bottomRows[i][a];e.board=n,e.active={pieceId:s.activePiece,rotation:0,col:H(s.activePiece,0),movesUsed:0},e.hold=s.holdPiece,e.holdUsedThisTurn=!1,e.puzzleIndex=o,e.puzzleTitle=s.title,e.puzzleLesson=s.lesson}function G(e=20261107,o="endless"){const s=ee(e);let n=s.shuffle(pe),r=s.getState();const i=[];for(let f=0;f<l.PREVIEW_COUNT+1;f++){const c=ve(r,n);i.push(c.piece),n=c.nextBag,r=c.nextRngState}const a=i.shift(),t={seed:e,rngState:r,mode:o,status:"playing",board:ge(),active:{pieceId:a,rotation:0,col:H(a,0),movesUsed:0},hold:null,holdUsedThisTurn:!1,bag:n,nextQueue:i,score:0,linesCleared:0,level:1,stampsCount:0,flushStreak:0,maxFlushStreak:0,comboStreak:0,finesseStreak:0,perfectFinesseCount:0,totalFinesseFaults:0,chiselCharges:l.INITIAL_CHISEL_CHARGES,elapsedMs:0,gravityTimerMs:0,gravityIntervalMs:l.BASE_GRAVITY_MS,puzzleIndex:0,puzzleTitle:"",puzzleLesson:"",lastStamp:null,eventLog:["Keystone Forge initialized. Align ghost silhouette for a 0-void Flush Stamp!"]};return o==="puzzle"&&(de(t,0),t.eventLog=[`Dojo Stage 1 — ${t.puzzleTitle}: ${t.puzzleLesson}`]),t}function j(e,o){if(e.status!=="playing")return e;const s=B(e.active.pieceId,e.active.rotation,e.active.col+o);return s===e.active.col?e:{...e,active:{...e.active,col:s,movesUsed:e.active.movesUsed+1}}}function Q(e,o){if(e.status!=="playing")return e;const s=B(e.active.pieceId,e.active.rotation,o),n=Math.abs(s-e.active.col);return n===0?e:{...e,active:{...e.active,col:s,movesUsed:e.active.movesUsed+n}}}function K(e,o=1){if(e.status!=="playing")return e;const s=((e.active.rotation+o)%4+4)%4,n=B(e.active.pieceId,s,e.active.col);return oe(e.board,e.active.pieceId,s,n)===null?e:{...e,active:{...e.active,rotation:s,col:n,movesUsed:e.active.movesUsed+1}}}function ue(e){if(e.status!=="playing"||e.holdUsedThisTurn)return e;const o=e.active.pieceId;if(e.hold!==null){const i=e.hold;return{...e,active:{pieceId:i,rotation:0,col:H(i,0),movesUsed:0},hold:o,holdUsedThisTurn:!0,gravityTimerMs:0,eventLog:[`Swapped ${o} into Hold Chamber for ${i}.`,...e.eventLog.slice(0,11)]}}const s=[...e.nextQueue],n=s.shift(),r=ve(e.rngState,e.bag);return s.push(r.piece),{...e,rngState:r.nextRngState,bag:r.nextBag,nextQueue:s,active:{pieceId:n,rotation:0,col:H(n,0),movesUsed:0},hold:o,holdUsedThisTurn:!0,gravityTimerMs:0,eventLog:[`Stored ${o} in Hold Chamber; deployed ${n}.`,...e.eventLog.slice(0,11)]}}function fe(e,o){if(e.status!=="playing"||e.chiselCharges<=0)return e;const s=z(e.board);let n=-1;if(o!==void 0&&o>=0&&o<l.BOARD_COLS&&s.some(r=>r[o]!==null))n=o;else{const r=W(s);if(r.cells.length>0)n=[...r.cells].sort((a,t)=>a.r-t.r)[0].c;else{const i=J(s),a=Math.max(...i);a>0&&(n=i.indexOf(a))}}if(n===-1)return e;for(let r=0;r<l.BOARD_ROWS;r++)if(s[r][n]!==null)return s[r][n]=null,{...e,board:s,chiselCharges:e.chiselCharges-1,eventLog:[`⚡ Laser Chisel vaporized top cap in Column ${n+1} to open the cavity!`,...e.eventLog.slice(0,11)]};return e}function je(e,o){const s=z(e);for(let r=0;r<l.BOARD_ROWS-1;r++)s[r]=[...s[r+1]];const n=Array.from({length:l.BOARD_COLS},(r,i)=>i===o?null:"SLAG");return s[l.BOARD_ROWS-1]=n,s}function ke(e){if(e.status!=="playing")return e;const o=Z(e);if(!o)return{...e,status:"gameover",eventLog:["Press Head jammed at top of anvil — Forge Over!",...e.eventLog.slice(0,11)]};const s=z(e.board);for(const S of o.cells)s[S.r][S.c]=e.active.pieceId;const{nextBoard:n,clearedCount:r}=he(s),i=o.newBuriedVoidCells.length,a=i===0,t=o.movesUsed<=o.optimalMoves,f=Math.max(0,o.movesUsed-o.optimalMoves),c=me(n),F=n.every(S=>S.every(O=>O===null)),w=a?e.flushStreak+1:0,x=Math.max(e.maxFlushStreak,w),R=r>0?e.comboStreak+1:0,y=t&&a?e.finesseStreak+1:0;let b=0;if(a&&(b+=l.SCORE_FLUSH_BASE*e.level*Math.min(w,5)),r>0){const S=l.LINE_CLEAR_SCORES[Math.min(r,4)]??1200;b+=S*e.level,R>1&&(b+=l.COMBO_BONUS_BASE*(R-1)*e.level)}c&&(b+=(F?l.SCORE_ALL_CLEAR:l.SCORE_FLAT_SKYLINE)*e.level),t&&(b=Math.round(b*l.FINESSE_BONUS_MULTIPLIER));let m=e.chiselCharges;(y>0&&y%l.FINESSE_STREAK_FOR_CHISEL===0&&m<l.MAX_CHISEL_CHARGES||r>=2&&m<l.MAX_CHISEL_CHARGES)&&m++;const v=e.linesCleared+r,k=1+Math.floor(v/l.LINES_PER_LEVEL),M=e.stampsCount+1,D=["Flush Stamp","Single Forge","Double Weld","Triple Temper","QUAD KEYSTONE!"],T=[];r>0?T.push(D[Math.min(r,4)]):a?T.push(`Flush Fit ×${w}`):T.push(`+${i} Buried Void${i>1?"s":""}`),t&&T.push("⚡ Finesse"),c&&T.push("✨ Level Anvil");const C={pieceId:e.active.pieceId,linesCleared:r,newBuriedVoids:i,wasFlush:a,wasPerfectFinesse:t,wasFlatSkyline:c,movesUsed:o.movesUsed,optimalMoves:o.optimalMoves,pointsAwarded:b,headline:T.join(" · ")};if(e.mode==="puzzle"){const S={...e,score:e.score+b+(a&&r>0?l.SCORE_PUZZLE_CLEAR:0),linesCleared:v,stampsCount:M,flushStreak:w,maxFlushStreak:x,comboStreak:R,finesseStreak:y,perfectFinesseCount:e.perfectFinesseCount+(t?1:0),totalFinesseFaults:e.totalFinesseFaults+f,chiselCharges:m,lastStamp:C,gravityTimerMs:0};if(a&&r>0){const O=e.puzzleIndex+1;de(S,O),S.eventLog=[`✅ Dojo Stage ${e.puzzleIndex+1} Solved (${C.headline})! Advancing to ${S.puzzleTitle}.`,...e.eventLog.slice(0,11)]}else de(S,e.puzzleIndex),S.eventLog=[`🔄 Retry ${S.puzzleTitle}: Aim for 0 buried voids and a row clear!`,...e.eventLog.slice(0,11)];return S}if(e.mode==="sprint"&&v>=l.SPRINT_TARGET_LINES)return{...e,board:n,score:e.score+b,linesCleared:v,level:k,stampsCount:M,flushStreak:w,maxFlushStreak:x,comboStreak:R,finesseStreak:y,perfectFinesseCount:e.perfectFinesseCount+(t?1:0),totalFinesseFaults:e.totalFinesseFaults+f,chiselCharges:m,status:"won",lastStamp:C,eventLog:[`🏆 20-Line Finesse Sprint Completed in ${(e.elapsedMs/1e3).toFixed(1)}s!`,...e.eventLog.slice(0,11)]};let _=n;const $=ee(1);if($.setState(e.rngState),e.mode==="endless"&&k>=2&&M%l.SLAG_RISE_INTERVAL_STAMPS===0&&Math.max(...J(_))<=l.SLAG_MAX_STACK_HEIGHT){const O=$.nextInt(l.BOARD_COLS);_=je(_,O)}const N=[...e.nextQueue],q=N.shift(),V=ve($.getState(),e.bag);N.push(V.piece);const Y=H(q,0),se=oe(_,q,0,Y)!==null,ne=Math.max(l.MIN_GRAVITY_MS,l.BASE_GRAVITY_MS-(k-1)*l.GRAVITY_DECAY_PER_LEVEL_MS);return{...e,rngState:V.nextRngState,bag:V.nextBag,board:_,active:{pieceId:q,rotation:0,col:Y,movesUsed:0},holdUsedThisTurn:!1,nextQueue:N,score:e.score+b,linesCleared:v,level:k,stampsCount:M,flushStreak:w,maxFlushStreak:x,comboStreak:R,finesseStreak:y,perfectFinesseCount:e.perfectFinesseCount+(t?1:0),totalFinesseFaults:e.totalFinesseFaults+f,chiselCharges:m,gravityTimerMs:0,gravityIntervalMs:ne,status:se?"playing":"gameover",lastStamp:C,eventLog:[`${C.headline} (+${b} pts)`,...e.eventLog.slice(0,11)]}}function Ae(e,o){if(e.status!=="playing"||o<=0)return e;const s=e.elapsedMs+o;if(e.mode==="puzzle")return{...e,elapsedMs:s};const n=e.gravityTimerMs+o;return n>=e.gravityIntervalMs?ke({...e,elapsedMs:s,gravityTimerMs:0}):{...e,elapsedMs:s,gravityTimerMs:n}}function Me(e){const o=[],s=[{pieceId:e.active.pieceId,useHold:!1}];if(!e.holdUsedThisTurn){const r=e.hold??e.nextQueue[0];r&&r!==e.active.pieceId&&s.push({pieceId:r,useHold:!0})}for(const r of s){const i=L[r.pieceId].uniqueOrientations;for(let a=0;a<i;a++){const t=te(r.pieceId,a);for(let f=0;f<=l.BOARD_COLS-t;f++){const c=be(e.board,r.pieceId,a,f,0);if(!c)continue;const F=z(e.board);for(const v of c.cells)F[v.r][v.c]=r.pieceId;const{nextBoard:w}=he(F),x=J(w),R=Math.max(...x);let y=0;for(let v=0;v<x.length-1;v++)y+=Math.abs(x[v]-x[v+1]);const b=c.wouldClearLines*500-c.newBuriedVoidCells.length*400-c.totalBuriedVoidsAfter*80-y*25-R*15+(c.isFlatSkylineAfter?300:0)-(r.useHold?5:0),m=[];c.wouldClearLines>0&&m.push(`clears ${c.wouldClearLines} row${c.wouldClearLines>1?"s":""}`),c.newBuriedVoidCells.length===0&&m.push("0 buried voids"),c.isFlatSkylineAfter?m.push("levels the skyline"):y<=2&&m.push("keeps surface flat"),o.push({useHold:r.useHold,pieceId:r.pieceId,rotation:a,col:f,score:b,reason:m.length>0?m.join(", "):"best available contour fit"})}}}if(o.length===0)return null;o.sort((r,i)=>i.score-r.score);const n=o[0];return{useHold:n.useHold,pieceId:n.pieceId,rotation:n.rotation,col:n.col,reason:`${n.useHold?"Hold-swap [C] to ":""}${L[n.pieceId].name} @ Col ${n.col+1} (${n.rotation*90}°): ${n.reason}.`}}typeof HTMLButtonElement<"u"&&!("commandForElement"in HTMLButtonElement.prototype)&&Ee(()=>import("./index-BWFjuSge.js"),[],import.meta.url);typeof HTMLElement<"u"&&!("popover"in HTMLElement.prototype)&&Ee(()=>import("./popover-DtqSrbDJ.js"),[],import.meta.url);function Ke(e){!e||typeof HTMLDialogElement>"u"||"closedBy"in HTMLDialogElement.prototype||e.addEventListener("click",o=>{if(o.target!==e)return;const s=e.getBoundingClientRect();s.top<=o.clientY&&o.clientY<=s.top+s.height&&s.left<=o.clientX&&o.clientX<=s.left+s.width||e.close()})}function we(e,o=0){if(!e)return'<div class="kf-mini-empty">EMPTY</div>';const s=L[e],n=s.rotations[(o%4+4)%4],r=new Set(n.map(a=>`${a.r},${a.c}`));let i=`<div class="kf-mini-grid" aria-label="${s.name}">`;for(let a=0;a<3;a++)for(let t=0;t<3;t++){const f=r.has(`${a},${t}`);i+=`<span class="kf-mini-cell ${f?"is-filled":""}" style="${f?`--cell-bg:${s.color};--cell-border:${s.border};`:""}"></span>`}return i+="</div>",i}function _e(e,o){let s=o?.initialSeed??20261107,n=o?.initialMode??"endless",r=!!o?.debug,i=!0,a=!1,t=G(s,n),f=Te();const c=new Ue;e.innerHTML=`
    <style>
      .kf-root {
        --kf-bg: #0b1020;
        --kf-panel: #131c33;
        --kf-panel-border: #26355c;
        --kf-text: #f1f5f9;
        --kf-muted: #94a3b8;
        --kf-accent: #06b6d4;
        --kf-good: #10b981;
        --kf-warn: #f59e0b;
        --kf-danger: #f43f5e;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: var(--kf-text);
        background: radial-gradient(circle at 50% 0%, #17254a 0%, #090d1a 100%);
        border: 1px solid var(--kf-panel-border);
        border-radius: 14px;
        padding: 16px;
        max-width: 1140px;
        margin: 0 auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
        user-select: none;
      }
      .kf-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 12px;
        margin-bottom: 14px;
        border-bottom: 1px solid var(--kf-panel-border);
      }
      .kf-brand h2 {
        margin: 0;
        font-size: 1.35rem;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .kf-brand p {
        margin: 3px 0 0;
        font-size: 0.84rem;
        color: var(--kf-muted);
      }
      .kf-mode-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .kf-btn {
        background: #1b2848;
        color: var(--kf-text);
        border: 1px solid #33497a;
        border-radius: 8px;
        padding: 7px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.14s ease, transform 0.08s ease, border-color 0.14s ease;
      }
      .kf-btn:hover {
        background: #243763;
        border-color: #4f70b8;
      }
      .kf-btn:active {
        transform: translateY(1px);
      }
      .kf-btn[aria-pressed="true"],
      .kf-btn.is-active {
        background: #0891b2;
        border-color: #67e8f9;
        color: #ffffff;
      }
      .kf-btn-stamp {
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
        border-color: #34d399;
        color: #fff;
        font-size: 0.95rem;
        padding: 10px 18px;
      }
      .kf-btn-stamp:hover {
        background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      }
      .kf-btn-chisel {
        background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
        border-color: #fcd34d;
        color: #fff;
      }
      .kf-btn-chisel:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .kf-layout {
        display: grid;
        grid-template-columns: 270px minmax(280px, 1fr) 290px;
        gap: 16px;
        align-items: start;
      }
      @media (max-width: 920px) {
        .kf-layout {
          grid-template-columns: 1fr;
        }
      }
      .kf-card {
        background: rgba(19, 28, 51, 0.9);
        border: 1px solid var(--kf-panel-border);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
      .kf-card-title {
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--kf-muted);
        margin: 0 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .kf-mini-grid {
        display: grid;
        grid-template-columns: repeat(3, 18px);
        grid-template-rows: repeat(3, 18px);
        gap: 3px;
        justify-content: center;
        padding: 6px;
        background: #090f1f;
        border-radius: 8px;
        border: 1px solid #1e2d52;
      }
      .kf-mini-cell {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.03);
      }
      .kf-mini-cell.is-filled {
        background: var(--cell-bg, #06b6d4);
        border: 1px solid var(--cell-border, #67e8f9);
        box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.25);
      }
      .kf-mini-empty {
        height: 66px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: var(--kf-muted);
        background: #090f1f;
        border-radius: 8px;
        border: 1px dashed #293b66;
      }
      .kf-stage-center {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .kf-banner-lesson {
        width: 100%;
        box-sizing: border-box;
        background: rgba(8, 145, 178, 0.16);
        border: 1px solid #06b6d4;
        border-radius: 10px;
        padding: 9px 12px;
        margin-bottom: 10px;
        font-size: 0.85rem;
        line-height: 1.35;
      }
      .kf-gravity-bar-wrap {
        width: 100%;
        max-width: 336px;
        height: 7px;
        background: #090f1f;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 8px;
        border: 1px solid #1e293b;
      }
      .kf-gravity-bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #06b6d4 0%, #10b981 70%, #f59e0b 100%);
        transition: width 0.08s linear;
      }
      .kf-col-rail {
        display: grid;
        grid-template-columns: repeat(6, 50px);
        gap: 5px;
        margin-bottom: 5px;
      }
      .kf-col-btn {
        background: #131f3a;
        border: 1px solid #283a66;
        color: #94a3b8;
        border-radius: 6px;
        padding: 4px 0;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
      }
      .kf-col-btn:hover,
      .kf-col-btn.is-active-col {
        background: #1e3a6e;
        color: #fff;
        border-color: #60a5fa;
      }
      .kf-board {
        display: grid;
        grid-template-columns: repeat(6, 50px);
        grid-template-rows: repeat(10, 44px);
        gap: 5px;
        padding: 10px;
        background: #070b17;
        border: 2px solid #2b3f6e;
        border-radius: 12px;
        box-shadow: inset 0 0 28px rgba(0, 0, 0, 0.8);
        position: relative;
      }
      @media (max-width: 440px) {
        .kf-col-rail {
          grid-template-columns: repeat(6, 42px);
        }
        .kf-board {
          grid-template-columns: repeat(6, 42px);
          grid-template-rows: repeat(10, 38px);
        }
      }
      .kf-cell {
        position: relative;
        border-radius: 6px;
        background: #0f172a;
        border: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.06s ease, border-color 0.1s ease;
      }
      .kf-cell.is-solid {
        background: var(--cell-bg, #334155);
        border: 2px solid var(--cell-border, #94a3b8);
        box-shadow: inset 0 3px 6px rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.35);
        color: rgba(255, 255, 255, 0.92);
      }
      .kf-cell.is-slag {
        background: repeating-linear-gradient(
          45deg,
          #334155,
          #334155 6px,
          #1e293b 6px,
          #1e293b 12px
        );
        border: 2px solid #64748b;
        color: #cbd5e1;
      }
      .kf-cell.is-active-piece {
        outline: 2px solid #ffffff;
        background: var(--cell-bg, #06b6d4);
        opacity: 0.92;
        z-index: 2;
      }
      .kf-cell.is-ghost-flush {
        background: rgba(16, 185, 129, 0.26);
        border: 2px dashed #34d399;
        color: #6ee7b7;
      }
      .kf-cell.is-ghost-overhang {
        background: rgba(245, 158, 11, 0.26);
        border: 2px dashed #fbbf24;
        color: #fde68a;
      }
      .kf-cell.is-new-void {
        background: rgba(244, 63, 94, 0.28);
        border: 2px solid #f43f5e;
        color: #fda4af;
        animation: kfPulseVoid 0.9s infinite alternate;
      }
      .kf-cell.is-existing-void {
        background: rgba(244, 63, 94, 0.12);
        border: 1px dotted rgba(244, 63, 94, 0.55);
        color: rgba(244, 63, 94, 0.75);
      }
      .kf-cell.is-coach-target {
        box-shadow: inset 0 0 0 2px #fde047;
      }
      @keyframes kfPulseVoid {
        from { transform: scale(0.96); }
        to { transform: scale(1.03); }
      }
      .kf-controls-deck {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        justify-content: center;
        margin-top: 12px;
        max-width: 400px;
      }
      .kf-telemetry-pill {
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 0.83rem;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .kf-telemetry-pill.is-good {
        background: rgba(16, 185, 129, 0.16);
        border: 1px solid #10b981;
        color: #6ee7b7;
      }
      .kf-telemetry-pill.is-warn {
        background: rgba(244, 63, 94, 0.18);
        border: 1px solid #f43f5e;
        color: #fda4af;
      }
      .kf-stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .kf-stat-box {
        background: #0a1022;
        border: 1px solid #1f2e52;
        border-radius: 8px;
        padding: 8px 10px;
      }
      .kf-stat-label {
        font-size: 0.71rem;
        color: var(--kf-muted);
        text-transform: uppercase;
      }
      .kf-stat-value {
        font-size: 1.15rem;
        font-weight: 800;
        margin-top: 2px;
      }
      .kf-queue-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .kf-queue-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0a1022;
        border: 1px solid #1f2e52;
        border-radius: 8px;
        padding: 6px 10px;
      }
      .kf-queue-info {
        font-size: 0.78rem;
      }
      .kf-queue-info strong {
        display: block;
        color: #e2e8f0;
      }
      .kf-queue-info span {
        color: var(--kf-muted);
        font-size: 0.72rem;
      }
      .kf-log {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.78rem;
        color: #cbd5e1;
        max-height: 118px;
        overflow-y: auto;
      }
      .kf-log li {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .kf-dialog {
        background: #111a30;
        color: #f8fafc;
        border: 1px solid #3b82f6;
        border-radius: 12px;
        max-width: 540px;
        padding: 20px;
      }
      .kf-dialog::backdrop {
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(2px);
      }
      .kf-popover {
        background: #111a30;
        color: #f8fafc;
        border: 1px solid #06b6d4;
        border-radius: 12px;
        padding: 16px;
        max-width: 380px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
      }
      [popover]:is(:popover-open, .\\:popover-open) {
        display: block;
      }
    </style>

    <div class="kf-root" tabindex="0" id="kf-interactive-root" aria-label="Keystone Forge Spatial Puzzle Game">
      <div class="kf-topbar">
        <div class="kf-brand">
          <h2>⚒️ KEYSTONE FORGE <span style="font-size:0.78rem;font-weight:600;color:#67e8f9;background:#083344;padding:3px 8px;border-radius:99px;">TETRIS SKILL TRAINER</span></h2>
          <p>Read the anvil contour, rotate for a <strong>0-Overhang Flush Fit</strong>, and stamp with minimal <strong>Finesse</strong> inputs.</p>
        </div>

        <div class="kf-mode-tabs" role="group" aria-label="Game Modes and Reference">
          <button type="button" class="kf-btn" data-kf-mode="endless" aria-pressed="true">🔥 Endless Forge</button>
          <button type="button" class="kf-btn" data-kf-mode="sprint" aria-pressed="false">⏱️ 20-Row Sprint</button>
          <button type="button" class="kf-btn" data-kf-mode="puzzle" aria-pressed="false">🧩 Cavity Dojo</button>
          <button type="button" class="kf-btn" commandfor="kf-finesse-popover" command="toggle-popover">📐 Finesse &amp; Pieces</button>
          <button type="button" class="kf-btn" commandfor="kf-manual-dialog" command="show-modal">📖 Tetris Skills Guide</button>
        </div>
      </div>

      <div id="kf-finesse-popover" class="kf-popover" popover>
        <h3 style="margin-top:0;">📐 Finesse &amp; Surface Rules</h3>
        <p style="font-size:0.84rem;color:#cbd5e1;">
          <strong>1. Flush Fit (0 Buried Voids):</strong> Never trap empty cells underneath a stamped block. Every consecutive Flush Fit builds your <strong>Flush Streak (up to 5×)</strong>.<br/><br/>
          <strong>2. Optimal Finesse:</strong> Reach your target rotation and column using the minimum possible keystrokes (<code>Par</code>) for a <strong>1.25× Score Boost</strong> and <strong>⚡ Laser Chisel</strong> charge.<br/><br/>
          <strong>3. Level Anvil Bonus:</strong> Making all 6 columns the exact same height awards <strong>+400 × Level</strong>!
        </p>
      </div>

      <dialog id="kf-manual-dialog" class="kf-dialog" closedby="any" aria-labelledby="kf-manual-title">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 id="kf-manual-title" style="margin:0;">📖 How Keystone Forge Trains Core Tetris Mastery</h3>
          <button type="button" class="kf-btn" commandfor="kf-manual-dialog" command="close">Close [Esc]</button>
        </div>
        <div style="font-size:0.88rem;line-height:1.5;color:#e2e8f0;">
          <p>Great Tetris players rely on five mental habits that <strong>Keystone Forge</strong> makes visible in real time:</p>
          <ul>
            <li><strong>Surface &amp; Silhouette Reading:</strong> Match the underside of your piece to the exact step contour of the anvil so zero air pockets (<code>⚠️ VOID</code>) are trapped below.</li>
            <li><strong>Flat Stacking &amp; Parity:</strong> Keep column heights even so any piece (<code>O4</code>, <code>T4</code>, <code>I3</code>) always has a clean landing zone.</li>
            <li><strong>Hold Chamber Discipline (<code>[C]</code>):</strong> If the active block would force an overhang, swap it into the Hold Chamber or check your 3-piece Next Queue.</li>
            <li><strong>Input Finesse:</strong> Move and rotate directly to your chosen column without back-and-forth hesitation.</li>
            <li><strong>Downstacking / Cheese Digging (<code>[X]</code>):</strong> Use your Finesse-charged <strong>Laser Chisel</strong> to vaporize roof blocks over buried cavities and clear rising Slag Molds.</li>
          </ul>
        </div>
      </dialog>

      <div class="kf-layout">
        <!-- Left Column: Hold, Surface Diagnostics, Chisel & Coach -->
        <div>
          <div class="kf-card">
            <div class="kf-card-title">
              <span>Hold Chamber [C / Shift]</span>
              <span id="kf-hold-status" style="color:#67e8f9;">READY</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div id="kf-hold-preview" style="flex:1;"></div>
              <button type="button" class="kf-btn" id="kf-btn-hold">⇄ Hold [C]</button>
            </div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Live Surface &amp; Finesse Readout</span>
            </div>
            <div id="kf-surface-pill" class="kf-telemetry-pill is-good"></div>
            <div id="kf-finesse-pill" class="kf-telemetry-pill is-good"></div>
            <div id="kf-skyline-info" style="font-size:0.8rem;color:#cbd5e1;margin-top:4px;"></div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>⚡ Laser Chisel (Cheese Dig)</span>
              <span id="kf-chisel-count">1 / 3</span>
            </div>
            <p style="font-size:0.78rem;color:var(--kf-muted);margin:0 0 8px;">
              Vaporizes the top block above the shallowest buried void. Charged by 3 Perfect-Finesse Flush Stamps or a Double+ Weld.
            </p>
            <button type="button" class="kf-btn kf-btn-chisel" id="kf-btn-chisel" style="width:100%;">
              ⚡ Fire Laser Chisel [X]
            </button>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>🧠 Spatial Coach Hint</span>
              <button type="button" class="kf-btn" id="kf-btn-toggle-coach" style="padding:2px 8px;font-size:0.72rem;" aria-pressed="true">ON [H]</button>
            </div>
            <div id="kf-coach-text" style="font-size:0.8rem;color:#fde68a;line-height:1.35;"></div>
          </div>
        </div>

        <!-- Center Column: The 6x10 Precision Anvil -->
        <div class="kf-stage-center">
          <div id="kf-lesson-banner" class="kf-banner-lesson" hidden></div>

          <div class="kf-gravity-bar-wrap" title="Press Timer">
            <div id="kf-gravity-fill" class="kf-gravity-bar-fill"></div>
          </div>

          <div class="kf-col-rail" id="kf-col-rail" aria-label="Select Column"></div>
          <div class="kf-board" id="kf-board" role="grid" aria-label="6 by 10 Anvil Grid"></div>

          <div class="kf-controls-deck" role="group" aria-label="Forge Controls">
            <button type="button" class="kf-btn" id="kf-btn-left">◀ Left [←/A]</button>
            <button type="button" class="kf-btn" id="kf-btn-rot-ccw">⟲ CCW [Z]</button>
            <button type="button" class="kf-btn" id="kf-btn-rot-cw">⟳ Rotate [↑/W/R]</button>
            <button type="button" class="kf-btn" id="kf-btn-right">Right [→/D] ▶</button>
            <button type="button" class="kf-btn kf-btn-stamp" id="kf-btn-stamp" style="width:100%;">
              ⬇ STAMP KEYSTONE [Space / Enter]
            </button>
          </div>
        </div>

        <!-- Right Column: Scoreboard, 3-Piece Next Queue, Event Log -->
        <div>
          <div class="kf-card">
            <div class="kf-card-title">
              <span>Forge Telemetry</span>
              <button type="button" class="kf-btn" id="kf-btn-restart" style="padding:3px 8px;font-size:0.72rem;">↻ New Run</button>
            </div>
            <div class="kf-stat-grid">
              <div class="kf-stat-box">
                <div class="kf-stat-label">Score</div>
                <div class="kf-stat-value" id="kf-stat-score">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Best Score</div>
                <div class="kf-stat-value" id="kf-stat-best">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Rows Smelted</div>
                <div class="kf-stat-value" id="kf-stat-lines">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Flush Streak</div>
                <div class="kf-stat-value" id="kf-stat-flush" style="color:#34d399;">0×</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Finesse Rate</div>
                <div class="kf-stat-value" id="kf-stat-finesse" style="color:#67e8f9;">100%</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Level / Mode</div>
                <div class="kf-stat-value" id="kf-stat-level">Lv 1</div>
              </div>
            </div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Next 3 Keystones (7-Bag Lookahead)</span>
            </div>
            <div id="kf-next-queue" class="kf-queue-list"></div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Forge Log</span>
              <button type="button" class="kf-btn" id="kf-btn-mute" style="padding:2px 7px;font-size:0.7rem;">🔊 Audio</button>
            </div>
            <ul id="kf-event-log" class="kf-log"></ul>
          </div>

          <div class="kf-card" id="kf-debug-panel" hidden>
            <div class="kf-card-title"><span>Debug State</span></div>
            <pre id="kf-debug-pre" style="font-size:0.72rem;margin:0;white-space:pre-wrap;color:#93c5fd;"></pre>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector("#kf-interactive-root");const F=e.querySelector("#kf-manual-dialog");Ke(F);const w=e.querySelector("#kf-board"),x=e.querySelector("#kf-col-rail"),R=e.querySelector("#kf-hold-preview"),y=e.querySelector("#kf-hold-status"),b=e.querySelector("#kf-surface-pill"),m=e.querySelector("#kf-finesse-pill"),v=e.querySelector("#kf-skyline-info"),k=e.querySelector("#kf-chisel-count"),M=e.querySelector("#kf-btn-chisel"),D=e.querySelector("#kf-coach-text"),T=e.querySelector("#kf-btn-toggle-coach"),C=e.querySelector("#kf-lesson-banner"),_=e.querySelector("#kf-gravity-fill"),$=e.querySelector("#kf-next-queue"),N=e.querySelector("#kf-event-log"),q=e.querySelector("#kf-debug-panel"),V=e.querySelector("#kf-debug-pre"),Y=e.querySelector("#kf-stat-score"),se=e.querySelector("#kf-stat-best"),ne=e.querySelector("#kf-stat-lines"),S=e.querySelector("#kf-stat-flush"),O=e.querySelector("#kf-stat-finesse"),Oe=e.querySelector("#kf-stat-level");function p(){const u=Z(t),E=W(t.board),I=i?Me(t):null;for(const d of e.querySelectorAll("button[data-kf-mode]")){const h=d.getAttribute("data-kf-mode");d.setAttribute("aria-pressed",String(h===t.mode))}if(t.status==="won")C.hidden=!1,C.innerHTML=`🏆 <strong>SPRINT COMPLETE!</strong> 20 rows forged in ${(t.elapsedMs/1e3).toFixed(1)}s. Click <strong>↻ New Run</strong> to race again!`;else if(t.status==="gameover")C.hidden=!1,C.innerHTML=`⚠️ <strong>ANVIL JAMMED!</strong> Final Score: <strong>${t.score}</strong> · Max Flush Streak: <strong>${t.maxFlushStreak}×</strong>. Press <strong>↻ New Run</strong> to forge again!`;else if(t.mode==="puzzle")C.hidden=!1,C.innerHTML=`🧩 <strong>${t.puzzleTitle}:</strong> ${t.puzzleLesson}`;else{const d=L[t.active.pieceId];C.hidden=!1,C.innerHTML=`<strong>Active: ${d.name}</strong> (${t.active.rotation*90}°) — ${d.tip}`}const He=t.mode==="puzzle"?0:Math.min(100,Math.round(t.gravityTimerMs/t.gravityIntervalMs*100));_.style.width=`${He}%`,x.innerHTML="";for(let d=0;d<l.BOARD_COLS;d++){const h=document.createElement("button");h.type="button",h.className=`kf-col-btn ${d===t.active.col?"is-active-col":""}`,h.textContent=`C${d+1}`,h.addEventListener("click",()=>{t=Q(t,d),c.playMove(),p()}),x.appendChild(h)}const ze=L[t.active.pieceId].rotations[(t.active.rotation%4+4)%4],Be=new Set(ze.map(d=>`${d.r},${t.active.col+d.c}`)),De=new Set((u?.cells??[]).map(d=>`${d.r},${d.c}`)),$e=new Set((u?.newBuriedVoidCells??[]).map(d=>`${d.r},${d.c}`)),Ne=new Set(E.cells.map(d=>`${d.r},${d.c}`)),ye=new Set;if(I&&!I.useHold){const d=Z({...t,active:{pieceId:I.pieceId,rotation:I.rotation,col:I.col,movesUsed:0}});for(const h of d?.cells??[])ye.add(`${h.r},${h.c}`)}w.innerHTML="";const Ce=L[t.active.pieceId];for(let d=0;d<l.BOARD_ROWS;d++)for(let h=0;h<l.BOARD_COLS;h++){const A=`${d},${h}`,X=t.board[d][h],g=document.createElement("div");if(g.className="kf-cell",g.setAttribute("role","gridcell"),g.setAttribute("data-row",String(d)),g.setAttribute("data-col",String(h)),X==="SLAG")g.classList.add("is-slag"),g.textContent="▤";else if(X!==null){const ie=L[X];g.classList.add("is-solid"),g.style.setProperty("--cell-bg",ie.color),g.style.setProperty("--cell-border",ie.border),g.textContent=ie.glyph}else $e.has(A)?(g.classList.add("is-new-void"),g.textContent="⚠️",g.title="Buried Void Warning: Dropping here traps an empty hole underneath!"):De.has(A)?(g.classList.add(u?.isFlushFit?"is-ghost-flush":"is-ghost-overhang"),g.textContent=u?.isFlushFit?"✓":"!"):Be.has(A)?(g.classList.add("is-active-piece"),g.style.setProperty("--cell-bg",Ce.color),g.textContent=Ce.glyph):Ne.has(A)&&(g.classList.add("is-existing-void"),g.textContent="×");ye.has(A)&&X===null&&g.classList.add("is-coach-target"),g.addEventListener("click",()=>{t.active.col!==h&&(t=Q(t,h),c.playMove(),p())}),g.addEventListener("dblclick",()=>{re()}),w.appendChild(g)}if(R.innerHTML=we(t.hold,0),y.textContent=t.holdUsedThisTurn?"LOCKED THIS TURN":"READY [C]",y.style.color=t.holdUsedThisTurn?"#f59e0b":"#67e8f9",u){u.isFlushFit?(b.className="kf-telemetry-pill is-good",b.innerHTML="<span>✅ FLUSH FIT</span><span>0 New Voids</span>"):(b.className="kf-telemetry-pill is-warn",b.innerHTML=`<span>⚠️ OVERHANG WARNING</span><span>+${u.newBuriedVoidCells.length} Void(s)</span>`),u.isPerfectFinesseSoFar?(m.className="kf-telemetry-pill is-good",m.innerHTML=`<span>⚡ OPTIMAL FINESSE</span><span>${u.movesUsed} / Par ${u.optimalMoves}</span>`):(m.className="kf-telemetry-pill is-warn",m.innerHTML=`<span>FINESSE DRIFT</span><span>${u.movesUsed} / Par ${u.optimalMoves}</span>`);const d=[];u.wouldClearLines>0&&d.push(`🔥 Smelts <strong>${u.wouldClearLines} Row(s)</strong> on drop!`),u.isFlatSkylineAfter&&d.push(`✨ Produces a <strong>100% Level Anvil</strong> (+${l.SCORE_FLAT_SKYLINE*t.level} pts)!`),d.length===0&&d.push(`Existing buried voids on board: <strong>${E.count}</strong>`),v.innerHTML=d.join(" · ")}k.textContent=`${t.chiselCharges} / ${l.MAX_CHISEL_CHARGES}`;const qe=t.board.some(d=>d.some(h=>h!==null));M.disabled=t.chiselCharges<=0||!qe||t.status!=="playing",i?I?D.textContent=`💡 ${I.reason}`:D.textContent="No valid placements remaining.":D.textContent="Coach Hint hidden. Press [H] to enable live spatial analysis.",Y.textContent=t.score.toLocaleString(),se.textContent=Math.max(f.highScore,t.score).toLocaleString(),ne.textContent=t.mode==="sprint"?`${t.linesCleared} / ${l.SPRINT_TARGET_LINES}`:String(t.linesCleared),S.textContent=`${t.flushStreak}× (Max ${t.maxFlushStreak}×)`;const Ve=t.stampsCount===0?100:Math.round(t.perfectFinesseCount/t.stampsCount*100);O.textContent=`${Ve}%`,Oe.textContent=t.mode==="puzzle"?`Dojo #${t.puzzleIndex+1}`:`Lv ${t.level}`,$.innerHTML=t.nextQueue.slice(0,l.PREVIEW_COUNT).map((d,h)=>{const A=L[d];return`
          <div class="kf-queue-item">
            ${we(d,0)}
            <div class="kf-queue-info">
              <strong>#${h+1} ${A.name}</strong>
              <span>${A.tip}</span>
            </div>
          </div>
        `}).join(""),N.innerHTML=t.eventLog.slice(0,7).map(d=>`<li>${d}</li>`).join(""),q.hidden=!r,r&&(V.textContent=JSON.stringify({seed:t.seed,mode:t.mode,active:t.active,hold:t.hold,flushStreak:t.flushStreak,finesseStreak:t.finesseStreak,chiselCharges:t.chiselCharges,buriedVoids:E.count},null,2))}function re(){t.status==="playing"&&(t=ke(t),t.lastStamp&&(c.playStamp(t.lastStamp.linesCleared,t.lastStamp.wasFlush,t.lastStamp.wasPerfectFinesse),f=le(f,t)),p())}e.querySelector("#kf-btn-left")?.addEventListener("click",()=>{t=j(t,-1),c.playMove(),p()}),e.querySelector("#kf-btn-right")?.addEventListener("click",()=>{t=j(t,1),c.playMove(),p()}),e.querySelector("#kf-btn-rot-cw")?.addEventListener("click",()=>{t=K(t,1),c.playRotate(),p()}),e.querySelector("#kf-btn-rot-ccw")?.addEventListener("click",()=>{t=K(t,-1),c.playRotate(),p()}),e.querySelector("#kf-btn-stamp")?.addEventListener("click",()=>{re()}),e.querySelector("#kf-btn-hold")?.addEventListener("click",()=>{t=ue(t),c.playHold(),p()}),M.addEventListener("click",()=>{t=fe(t),c.playChisel(),p()}),T.addEventListener("click",()=>{i=!i,T.setAttribute("aria-pressed",String(i)),T.textContent=i?"ON [H]":"OFF [H]",p()}),e.querySelector("#kf-btn-restart")?.addEventListener("click",()=>{t=G(s,n),p()});const Se=e.querySelector("#kf-btn-mute");Se?.addEventListener("click",()=>{const u=!c.isMuted();c.setMuted(u),Se.textContent=u?"🔇 Muted":"🔊 Audio"});for(const u of e.querySelectorAll("button[data-kf-mode]"))u.addEventListener("click",()=>{const E=u.getAttribute("data-kf-mode");E&&(n=E,t=G(s,n),p())});function xe(u){const E=u.target;if(!(E&&(E.tagName==="INPUT"||E.tagName==="TEXTAREA"))&&!F?.open)switch(u.key){case"ArrowLeft":case"a":case"A":u.preventDefault(),t=j(t,-1),c.playMove(),p();break;case"ArrowRight":case"d":case"D":u.preventDefault(),t=j(t,1),c.playMove(),p();break;case"ArrowUp":case"w":case"W":case"r":case"R":u.preventDefault(),t=K(t,1),c.playRotate(),p();break;case"z":case"Z":u.preventDefault(),t=K(t,-1),c.playRotate(),p();break;case" ":case"Enter":case"ArrowDown":case"s":case"S":u.preventDefault(),re();break;case"c":case"C":case"Shift":u.preventDefault(),t=ue(t),c.playHold(),p();break;case"x":case"X":case"e":case"E":u.preventDefault(),t=fe(t),c.playChisel(),p();break;case"h":case"H":u.preventDefault(),i=!i,T.setAttribute("aria-pressed",String(i)),T.textContent=i?"ON [H]":"OFF [H]",p();break;case"1":case"2":case"3":case"4":case"5":case"6":{u.preventDefault();const I=Number(u.key)-1;t=Q(t,I),c.playMove(),p();break}}}window.addEventListener("keydown",xe);const Pe=window.setInterval(()=>{if(a||t.status!=="playing"||F?.open)return;const u=t.stampsCount;t=Ae(t,100),t.stampsCount!==u&&t.lastStamp&&(c.playStamp(t.lastStamp.linesCleared,t.lastStamp.wasFlush,t.lastStamp.wasPerfectFinesse),f=le(f,t)),p()},100);return p(),{destroy(){a=!0,window.clearInterval(Pe),window.removeEventListener("keydown",xe),e.innerHTML=""},getStateSnapshot(){return t},restartWithSeed(u,E){s=u,E&&(n=E),t=G(s,n),p()},toggleDebug(u){r=u!==void 0?u:!r,p()}}}const We={id:"11-keystone-forge",number:11,title:"Keystone Forge",subtitle:"Flush Silhouette Fitting, Input Finesse & Cavity Downstacking",genre:"Spatial Silhouette & Finesse Puzzle",primaryReference:"Tetris (7-Bag, Hold, Finesse & Parity)",supportingReference:"Keystone Die-Press & Cavity Dojo",oneSentenceLoop:"Read the 6-column anvil skyline, rotate and slide polyomino keystones with minimal Finesse inputs to stamp 0-overhang Flush Fits, and chisel through buried voids.",shortGoal:"Forge 20 Ingot Rows in Sprint Mode or solve all 5 Cavity Dojo lessons with 0 buried voids.",longGoal:"Sustain a 15× Flush Streak with 100% Optimal Finesse and master 4-Row Quad Keystones.",controlsSummary:"←/→ or A/D: Slide · ↑/W/R/Z: Rotate · Space/Enter: Stamp · C/Shift: Hold · X/E: Laser Chisel · H: Coach Hint",accentColor:"#06b6d4"};function Je(e,o){return _e(e,o)}const Xe=Object.freeze(Object.defineProperty({__proto__:null,ALL_PIECE_IDS:pe,CONFIG:l,PIECE_DEFINITIONS:L,PUZZLE_TEMPLATES:ae,canPlaceAt:ce,clampColForPiece:B,cloneBoard:z,computeDropRow:oe,computeGhostPreview:Z,computeOptimalFinesseMoves:Ie,countBoardBuriedVoids:W,createDefaultProfile:U,createEmptyBoard:ge,createGameState:G,createSeededRng:ee,evaluatePlacementOnBoard:be,findBestPlacementHint:Me,getColumnHeights:J,getPieceHeight:Ge,getPieceWidth:te,getSpawnCol:H,holdPiece:ue,isSkylineFlat:me,loadProfile:Te,metadata:We,mountGame:Je,mountKeystoneForgeUI:_e,movePiece:j,recordStampProgress:le,rotatePiece:K,saveProfile:Fe,setPieceColumn:Q,stampPiece:ke,tickTimer:Ae,useLaserChisel:fe},Symbol.toStringTag,{value:"Module"}));export{We as a,Xe as g,Je as m};
