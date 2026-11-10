import { logoSVG, portraitSVG } from './data.js';

function scoreTeam(game,side){const team=game.teams[side];return `<div class="score-team ${side}">${logoSVG(team)}<span><small>${team.city.toUpperCase()}</small><b>${team.short}</b></span><strong id="${side}-score">${game.state[`${side}Score`]}</strong></div>`;}
function tacticButton(label,value,current){return `<button data-action="focus" data-focus="${value}" class="${current===value?'active':''}">${label}</button>`;}
function fixtureLabel(game){
  const id=game.fixtureId||'';
  if(id.startsWith('R')){const round=Number(id.match(/^R(\d+)/)?.[1]||1);return round===1?'OPENING NIGHT':`REGULAR SEASON · GAME ${round}`;}
  if(id.startsWith('P'))return `PLAYOFFS · GAME ${Number(id.match(/-G(\d+)$/)?.[1]||1)}`;
  return 'BSCFD EXHIBITION';
}
export function simcastView(game,speed=1,paused=false,coachOpen=false){
  const snap=game.snapshot(),home=game.teams.home,away=game.teams.away,coachSide=game.userSide||'home',coach=game.teams[coachSide],t=game.tactics[coachSide];
  return `<main class="simcast-screen screen" style="--team:${coach.primary};--accent:${coach.secondary}">
    <header class="sim-top"><div class="broadcast-mark"><span>BSCFD</span><b>LIVE</b></div><div class="sim-top-actions"><button class="sim-exit" data-action="audio-toggle" aria-label="Toggle arena audio">AUDIO · M</button><button class="sim-exit" data-action="exit-sim">EXIT TO HQ</button></div></header>
    <section class="scorebug">${scoreTeam(game,'away')}<div class="game-clock"><span id="period-text">${snap.periodText}</span><b id="clock-text">${snap.clockText}</b><small id="game-status">${paused?'PAUSED':'SIMCAST'}</small></div>${scoreTeam(game,'home')}</section>
    <div class="broadcast-caption"><span>${fixtureLabel(game)}</span><b>${away.city.toUpperCase()} AT ${home.city.toUpperCase()}</b><small>LEGENDARY ARENA</small></div>
    <section class="live-feed"><div class="feed-heading"><span><i></i> PLAY-BY-PLAY</span><b id="possession-label">${home.short} BALL</b></div><div id="event-feed" data-event="0"></div></section>
    <section class="live-leader"><span>PLAYER OF THE GAME</span><div id="leader-content"></div></section>
    <aside class="coach-panel ${coachOpen?'open':''}"><div class="coach-heading"><span>GM COACHING</span><button data-action="coach-toggle" aria-label="Close coaching">×</button></div><div class="coach-team">${logoSVG(coach)}<span><b>${coach.name.toUpperCase()}</b><small>ADJUST THE NEXT POSSESSION</small></span></div>
      <label class="coach-label">SHOT SELECTION</label><div class="focus-control">${tacticButton('BALANCED','balanced',t.focus)}${tacticButton('OUTSIDE','outside',t.focus)}${tacticButton('INSIDE','inside',t.focus)}</div>
      <label class="range-label"><span>PACE</span><b id="pace-value">${t.pace}</b></label><input id="pace-input" data-tactic="pace" type="range" min="0" max="100" value="${t.pace}" aria-label="Offensive pace"><div class="range-ends"><span>CONTROL</span><span>PUSH</span></div>
      <label class="range-label"><span>DEFENSIVE PRESSURE</span><b id="defense-value">${t.defense}</b></label><input id="defense-input" data-tactic="defense" type="range" min="0" max="100" value="${t.defense}" aria-label="Defensive pressure"><div class="range-ends"><span>CONSERVE</span><span>ATTACK</span></div>
      <button class="timeout-button" data-action="timeout"><span>CALL TIMEOUT</span><b id="timeout-count">${snap.timeouts[coachSide]}</b></button><p class="coach-note">Timeouts create a three-possession momentum boost.</p>
    </aside>
    <button class="mobile-coach-button" data-action="coach-toggle">COACH</button>
    <section class="sim-controls"><button class="play-pause" data-action="pause-sim" aria-label="${paused?'Resume':'Pause'}">${paused?'▶':'Ⅱ'}</button><div class="speed-control">${[1,2,4,8].map(v=>`<button data-action="speed" data-speed="${v}" class="${speed===v?'active':''}">${v}×</button>`).join('')}</div><button class="sim-end" data-action="sim-end">SIM TO END</button></section>
    <div id="result-host"></div><div id="sim-toast"></div>
  </main>`;
}
export function updateSimcastDOM(game){
  const snap=game.snapshot();
  for(const side of ['home','away']){const el=document.getElementById(`${side}-score`);if(el)el.textContent=snap[`${side}Score`];}
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('clock-text',snap.clockText);set('period-text',snap.periodText);set('possession-label',`${game.teams[snap.possession].short} BALL`);set('timeout-count',snap.timeouts[game.userSide||'home']);
  const leader=game.playerOfGame(),leaderHost=document.getElementById('leader-content');
  if(leaderHost&&leader){const team=game.teams.home.short===leader.id.split('-')[0]?game.teams.home:game.teams.home.id===leader.id.slice(0,-2)?game.teams.home:game.teams.away;leaderHost.innerHTML=`<b>${leader.name}</b><span>${leader.points} PTS · ${leader.reb} REB · ${leader.ast} AST</span>`;}
  const feed=document.getElementById('event-feed');
  if(feed&&Number(feed.dataset.event)!==snap.eventSeq){feed.dataset.event=snap.eventSeq;feed.innerHTML=game.events.slice(-5).reverse().map(e=>`<div class="feed-event ${e.kind}"><span>${e.period>4?'OT':`Q${e.period}`} ${Math.floor(e.clock/60)}:${String(Math.floor(e.clock%60)).padStart(2,'0')}</span><p>${e.text}</p><b>${e.homeScore}–${e.awayScore}</b></div>`).join('');}
}
export function resultModal(game){
  const r=game.result,home=game.teams.home,away=game.teams.away,winner=game.teams[r.winner],p=r.playerOfGame;
  const side=game.rosters.home.some(x=>x.id===p.id)?'home':'away',player=game.rosters[side].find(x=>x.id===p.id),team=game.teams[side];
  return `<div class="result-backdrop"></div><section class="result-card"><div class="result-kicker"><span>BSCFD</span><b>POSTGAME SHOW</b><small>FINAL · ${r.period>4?'OVERTIME':'REGULATION'}</small></div><div class="result-layout"><div class="result-star"><span>PLAYER<br>OF THE<br>GAME</span>${portraitSVG(player,team)}<b>${p.name}</b><small>${team.short} · ${p.pos} · #${p.number}</small></div><div class="result-main"><span class="eyebrow">${winner.city.toUpperCase()} TAKES THE WIN</span><h2>${r.winner==='home'?'A STATEMENT<br>AT HOME.':fixtureLabel(game).startsWith('PLAYOFFS')?'A ROAD WIN.<br>A LEGACY BUILT.':'A HARD-FOUGHT<br>ROAD WIN.'}</h2><div class="final-teams"><div>${logoSVG(away)}<b>${away.short}</b><strong>${r.awayScore}</strong></div><span>FINAL</span><div>${logoSVG(home)}<b>${home.short}</b><strong>${r.homeScore}</strong></div></div><div class="game-mvp"><span>${p.name.toUpperCase()} · FINAL LINE</span><b>${p.points}<small>PTS</small> ${p.reb}<small>REB</small> ${p.ast}<small>AST</small></b></div></div></div><div class="result-banner">${winner.city.toUpperCase()} WINS · REPLAY CHECKSUM ${r.checksum}</div><div class="result-actions"><button class="button secondary" data-action="box-score">BOX SCORE</button><button class="button primary" data-action="return-hub">RETURN TO HQ</button></div></section>`;
}
export function boxScoreModal(game){
  const box=game.boxScore();
  const table=side=>`<div class="box-table"><h3>${game.teams[side].city} ${game.teams[side].name}</h3><div class="box-row box-head"><span>PLAYER</span><span>PTS</span><span>REB</span><span>AST</span><span>FG</span><span>3PT</span></div>${box[side].sort((a,b)=>b.points-a.points).map(p=>`<div class="box-row"><span><b>${p.name}</b><small>${p.pos}</small></span><strong>${p.points}</strong><span>${p.reb}</span><span>${p.ast}</span><span>${p.fgm}/${p.fga}</span><span>${p.tpm}/${p.tpa}</span></div>`).join('')}</div>`;
  return `<div class="box-backdrop" data-action="close-box"></div><section class="box-modal"><button class="icon-button modal-close" data-action="close-box">×</button><span class="eyebrow">OFFICIAL BOX SCORE</span><h2>${game.teams.away.short} ${game.state.awayScore} · ${game.teams.home.short} ${game.state.homeScore}</h2>${table('away')}${table('home')}<button class="button primary" data-action="close-box">BACK TO RESULT</button></section>`;
}
