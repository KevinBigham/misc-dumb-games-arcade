import './style.css';
import { Arena } from './arena.js';
import { BasketballGame } from './simulation.js';
import { simcastView, updateSimcastDOM, resultModal, boxScoreModal } from './simcast-ui.js';
import { TEAMS, SAVE_KEY, SAVE_VERSION, getTeam, teamOverall, logoSVG, generateRoster, portraitSVG, ownerPortraitSVG, money, rngFrom } from './data.js';
import { createSeason, getUserFixture, completeUserGame, simulateNext, simulateRegularSeason, simulatePlayoffs, standings, formatSeasonDate, playoffName, seasonChecksum, seasonTotals } from './season.js';
import { SALARY_CAP, ensureLeague, rosterFor, availableRoster, payroll, setRotationMinutes, setStarter, teamChemistry, tradeOffers, acceptTrade, extensionQuote, extendContract, signFreeAgent } from './franchise.js';
import { ensureDynasty, prepareOffseason, scoutProspect, openDraft, draftProspect, finalizeOffseason, careerSummary, exportSave, validateImport } from './dynasty.js';
import { offseasonView, historyPanel } from './dynasty-ui.js';
import { audio } from './audio.js';

const app = document.getElementById('app');
const DEFAULT_SEED = 'DYNASTY-2027';
let save = loadSave();
let state = { screen:'title', tab:'overview', leagueMode:'standings', rosterMode:'rotation', draftFilter:'ALL', draftPage:0, seed:save?.seed || DEFAULT_SEED, teamId:save?.teamId || TEAMS[0].id, playerId:null, stance:save?.stance||'uncommitted', lastResult:save?.lastResult||null };
let season=save?.season?.schedule?.length===82?save.season:createSeason(state.seed);
season.seed ||= state.seed;ensureLeague(season);ensureDynasty(season);
let roster = rosterFor(season,state.teamId);
let activeGame=null,simSpeed=1,simPaused=false,coachOpen=false,lastSimUi=0,lastAudioEvent=0;
const arena = new Arena(document.getElementById('arena'),getTeam(state.teamId));

function loadSave() {
  try {
    const raw=localStorage.getItem(SAVE_KEY); if(!raw) return null;
    const data=JSON.parse(raw);
    if(data.version!==SAVE_VERSION || !TEAMS.some(t=>t.id===data.teamId) || typeof data.seed!=='string') return null;
    return data;
  } catch { return null; }
}
function persist() {
  save={version:SAVE_VERSION,seed:state.seed,teamId:state.teamId,stance:state.stance,lastResult:state.lastResult,season,createdAt:save?.createdAt||Date.now(),updatedAt:Date.now()};
  try { localStorage.setItem(SAVE_KEY,JSON.stringify(save)); return true; } catch { toast('Save unavailable in this browser session'); return false; }
}
function icon(name) {
  const paths={
    home:'<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    roster:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 8h5M19 5v6"/>',
    league:'<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/>',
    arrow:'<path d="m9 18 6-6-6-6"/>', back:'<path d="m15 18-6-6 6-6"/>',
    spark:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',
    cap:'<circle cx="12" cy="12" r="9"/><path d="M16 8.5A5 5 0 1 0 16 15.5M7 12h7"/>',
    news:'<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>', check:'<path d="m5 12 4 4L19 6"/>',
    court:'<rect x="2" y="4" width="20" height="16" rx="1"/><path d="M12 4v16M2 12h4M18 12h4"/><circle cx="12" cy="12" r="3"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
}
function brand(compact=false) {
  return `<div class="brand ${compact?'brand-compact':''}"><span class="brand-ball">B</span><span><b>BSCFD</b><small>LEGENDARY GM</small></span></div>`;
}
function teamIdentity(team,sub='') {
  return `${logoSVG(team)}<div class="team-identity-copy"><span>${team.city.toUpperCase()}</span><strong>${team.name.toUpperCase()}</strong>${sub?`<small>${sub}</small>`:''}</div>`;
}
function button(label,action,kind='primary',extra='') {
  return `<button class="button ${kind}" data-action="${action}" ${extra}>${label}${kind==='primary'?icon('arrow'):''}</button>`;
}
function titleView() {
  const team=save?getTeam(save.teamId):null;
  return `<main class="title-screen screen">
    <header class="title-top">${brand()}<span class="season-chip">${season.year} LEAGUE</span></header>
    <section class="hero">
      <div class="eyebrow"><span></span> THE FRONT OFFICE IS YOURS</div>
      <h1>BUILD A<br><em>DYNASTY.</em></h1>
      <p>Every contract has a consequence. Every season writes your legend.</p>
      <div class="hero-actions">
        ${button('START NEW DYNASTY','new-game')}
        ${save?`<button class="continue-card" data-action="continue"><span class="continue-logo">${logoSVG(team)}</span><span><small>CONTINUE · SEASON ${season.dynasty.number}</small><b>${team.city} ${team.name}</b><em>82-game campaign</em></span>${icon('arrow')}</button>`:''}
      </div>
      <div class="feature-line"><span>${icon('court')} 3D SIMCAST</span><span>${icon('spark')} LIVING STORIES</span><span>${icon('league')} 30 TEAMS</span></div>
    </section>
    <footer class="title-footer"><span>ORIGINAL FICTIONAL LEAGUE</span><span>SEED-SYNCED SIMULATION</span><span>v1.0</span></footer>
  </main>`;
}
function teamCard(team) {
  const selected=team.id===state.teamId;
  return `<button class="franchise-card ${selected?'selected':''}" data-action="select-team" data-team="${team.id}" style="--team:${team.primary};--accent:${team.secondary}">
    <span class="power">OVR <b>${teamOverall(team)}</b></span>${logoSVG(team)}
    <span class="franchise-city">${team.city.toUpperCase()}</span><strong>${team.name.toUpperCase()}</strong>
    <span class="mini-bars"><i style="--v:${team.offense}%"></i><i style="--v:${team.defense}%"></i></span>
    <span class="card-metrics"><small>OFF ${team.offense}</small><small>DEF ${team.defense}</small></span>
  </button>`;
}
function teamView() {
  const team=getTeam(state.teamId);
  return `<main class="team-screen screen">
    <header class="team-top"><button class="icon-button" data-action="title" aria-label="Back">${icon('back')}</button>${brand(true)}<span class="step-label">FRANCHISE SELECT <b>01 / 01</b></span></header>
    <section class="select-heading"><div><span class="eyebrow">CHOOSE YOUR LEGACY</span><h2>WHO NEEDS<br>A <em>VISIONARY?</em></h2></div>
      <label class="seed-control"><span>DYNASTY SEED</span><input id="seed-input" value="${state.seed.replace(/["<>]/g,'')}" maxlength="28" spellcheck="false" aria-label="Dynasty seed"><small>Same seed. Same world.</small></label>
    </section>
    <section class="franchise-grid">${TEAMS.map(teamCard).join('')}</section>
    <footer class="select-footer"><span><i class="live-dot"></i> 30 FRANCHISES AVAILABLE</span><span>SELECT A TEAM TO REVIEW THE ORGANIZATION</span></footer>
    <div id="team-sheet-host"></div>
  </main>`;
}
function showTeamSheet(teamId) {
  state.teamId=teamId; const team=getTeam(teamId); arena.setTeam(team);
  roster=generateRoster(team,state.seed);
  const capRoom=112-roster.reduce((sum,p)=>sum+p.salary,0);
  document.querySelectorAll('.franchise-card').forEach(el=>el.classList.toggle('selected',el.dataset.team===teamId));
  const host=document.getElementById('team-sheet-host');
  host.innerHTML=`<div class="sheet-backdrop" data-action="close-sheet"></div><aside class="team-sheet" style="--team:${team.primary};--accent:${team.secondary}">
    <button class="icon-button sheet-close" data-action="close-sheet" aria-label="Close">${icon('close')}</button>
    <div class="sheet-team">${teamIdentity(team,'EST. 1987 · SEASON 40')}</div>
    <div class="owner-quote"><span>OWNER'S BRIEF</span><p>“We don't need a caretaker. We need someone who can turn this city into a basketball capital.”</p></div>
    <div class="ratings-row"><div><span>OFFENSE</span><b>${team.offense}</b><i><em style="width:${team.offense}%"></em></i></div><div><span>DEFENSE</span><b>${team.defense}</b><i><em style="width:${team.defense}%"></em></i></div><div><span>MARKET</span><b>${team.market}</b><i><em style="width:${team.market}%"></em></i></div></div>
    <div class="sheet-info"><span><small>CAP FLEXIBILITY</small><b>${money(capRoom)}</b></span><span><small>EXPECTATION</small><b>${teamOverall(team)>84?'TITLE OR BUST':teamOverall(team)>79?'PLAYOFF PUSH':'BUILD THE CORE'}</b></span></div>
    ${button(`TAKE OVER ${team.name.toUpperCase()}`,'confirm-team')}
  </aside>`;
}
function navItem(tab,label,iconName) {
  return `<button class="nav-item ${state.tab===tab?'active':''}" data-action="tab" data-tab="${tab}">${icon(iconName)}<span>${label}</span></button>`;
}
function hubShell(content) {
  const team=getTeam(state.teamId),star=[...roster].sort((a,b)=>b.overall-a.overall)[0],record=season.records[state.teamId];
  const ticker=season.phase==='regular'?`GAME ${Math.min(82,season.round+1)} OF 82`:season.phase==='complete'?`${getTeam(season.playoffs.championId).city.toUpperCase()} CHAMPIONS`:season.phase==='offseason'?`${season.year+1} DRAFT · THE FUTURE IS YOURS`:playoffName(season.playoffs.round);
  return `<main class="hub-screen screen" style="--team:${team.primary};--accent:${team.secondary}">
    <header class="hub-top">${brand(true)}<button class="current-team" data-action="title" title="Return to title">${logoSVG(team)}<span><b>${team.city.toUpperCase()}</b><strong>${team.name.toUpperCase()}</strong></span></button><div class="top-meta"><span>SEASON <b>${String(season.dynasty.number).padStart(2,'0')}</b></span><span>YEAR <b>${season.year}</b></span><button class="audio-toggle" data-action="audio-toggle" aria-label="${audio.enabled?'Mute':'Enable'} generated arena audio" aria-pressed="${audio.enabled}" title="Arena audio (M)">${audio.enabled?'♪':'×'}</button><button class="avatar" data-action="owner" aria-label="GM profile">GM</button></div></header>
    <nav class="side-nav">${navItem('overview','Overview','home')}${navItem('roster','Roster','roster')}${navItem('league','League','league')}<div class="nav-spacer"></div><span class="seed-badge">SEED<br><b>${state.seed}</b></span></nav>
    <section class="hub-content">${content}</section>
    <div class="broadcast-ticker"><span class="ticker-brand">BSCFD <b>LIVE</b></span><span class="ticker-lead">${ticker}</span><span class="ticker-copy">${star.name} · ${record.wins}–${record.losses} · ${Object.keys(season.injuries).length} league injuries</span><span class="ticker-desk">LEAGUE DESK&nbsp;&nbsp; • &nbsp;&nbsp;30 TEAMS&nbsp;&nbsp; • &nbsp;&nbsp;ONE CHAMPION</span></div>
    <nav class="bottom-nav">${navItem('overview','Overview','home')}${navItem('roster','Roster','roster')}${navItem('league','League','league')}</nav>
    <div id="modal-host"></div><div id="toast-host"></div>
  </main>`;
}
function overviewView() {
  const team=getTeam(state.teamId),fixture=getUserFixture(season,state.teamId),record=season.records[state.teamId];
  const payroll=roster.reduce((sum,p)=>sum+p.salary,0),capRoom=112-payroll,best=[...roster].sort((a,b)=>b.overall-a.overall).slice(0,3);
  const isHome=fixture?.homeId===state.teamId,opp=fixture?getTeam(isHome?fixture.awayId:fixture.homeId):null;
  const gameLabel=season.phase==='regular'?(season.round===0?'OPENING NIGHT':`GAME ${season.round+1} OF 82`):season.phase==='playoffs'?playoffName(season.playoffs.round):'SEASON COMPLETE';
  const series=fixture?.series,seriesScore=series?`${series.homeWins} — ${series.awayWins}`:'';
  const nextPanel=fixture?`<section class="panel next-game"><div class="panel-label">NEXT GAME <span>${gameLabel}</span></div><div class="matchup"><div>${logoSVG(team)}<b>${team.short}</b><small>${isHome?'HOME':'AWAY'}</small></div><span><small>${formatSeasonDate(fixture.date)} · 7:30 PM</small><b>${series?seriesScore:'VS'}</b><em>${series?'SERIES SCORE':getTeam(fixture.homeId).city.toUpperCase()}</em></span><div>${logoSVG(opp)}<b>${opp.short}</b><small>${isHome?'AWAY':'HOME'}</small></div></div><div class="game-actions"><button class="game-strip" data-action="start-sim"><span>WATCH 3D SIMCAST ${icon('arrow')}</span><b>${gameLabel}</b></button><button class="game-strip quick" data-action="quick-sim"><span>QUICK SIM ${icon('arrow')}</span></button></div>${season.phase==='regular'?`<button class="season-sim" data-action="sim-season">SIM TO PLAYOFFS · ${82-season.round} GAMES REMAIN</button>`:''}</section>`:`<section class="panel next-game champion-panel"><div class="panel-label">THE FINALS <span>COMPLETE</span></div><div class="matchup"><div>${logoSVG(getTeam(season.playoffs.championId))}<b>${getTeam(season.playoffs.championId).short}</b><small>WORLD CHAMPIONS</small></div><span><small>${season.year} SEASON</small><b>4 WINS</b><em>LEGACY SECURED</em></span><div>${logoSVG(team)}<b>${team.short}</b><small>${season.playoffs.championId===state.teamId?'YOUR DYNASTY':'NEXT SEASON'}</small></div></div><button class="game-strip" data-action="begin-offseason"><span>BEGIN ${season.year+1} OFFSEASON ${icon('arrow')}</span></button></section>`;
  const latestInjury=season.injuryLog[0],leader=season.awards?.mvp;
  return `<div class="page-heading"><div><span class="eyebrow">GENERAL MANAGER HQ</span><h2>${season.phase==='complete'?'THE SEASON <em>IS HISTORY.</em>':'THE VISION <em>STARTS HERE.</em>'}</h2></div><div class="record-block"><small>REGULAR SEASON</small><b>${record.wins} <span>—</span> ${record.losses}</b><em>${season.phase==='regular'?`${82-season.round} GAMES REMAIN`:gameLabel}</em></div></div>
    <div class="dashboard-grid">${nextPanel}
      <section class="panel directive"><div class="panel-label">OWNER DIRECTIVE <span>${record.wins>=41?'ON TRACK':'NEW'}</span></div><div class="directive-icon">${icon('spark')}</div><h3>MAKE THE CITY<br>BELIEVE AGAIN.</h3><p>Build a top-ten offense while keeping the payroll below $112.0M.</p><div class="goal-progress"><span><b>OFFENSE #${Math.max(1,31-Math.round(team.offense/3))}</b><small>CURRENT</small></span><i><em style="width:${team.offense}%"></em></i></div><button class="text-button" data-action="owner">REVIEW BRIEF ${icon('arrow')}</button></section>
      <section class="panel finance"><div class="panel-label">FINANCIAL OUTLOOK</div><div class="cap-number"><small>PROJECTED CAP ROOM</small><b>${money(capRoom)}</b><span>+ ${money(team.market/10)} <small>local revenue</small></span></div><div class="cap-track"><i style="width:${Math.min(100,payroll/112*100)}%"></i><span></span></div><div class="cap-legend"><span>PAYROLL <b>${money(payroll)}</b></span><span>CAP <b>$112.0M</b></span></div><div class="finance-foot"><span>${icon('cap')} FLEXIBILITY GRADE</span><b>${capRoom>20?'A':capRoom>8?'B+':'C'}</b></div></section>
      <section class="panel core-panel"><div class="panel-label">THE CORE <button class="text-button" data-action="tab" data-tab="roster">FULL ROSTER ${icon('arrow')}</button></div><div class="core-list">${best.map((p,i)=>{const stats=season.playerStats[p.id],ppg=stats?(stats.points/stats.gp).toFixed(1):'—';return `<button class="core-player" data-action="player" data-player="${p.id}"><span class="rank">0${i+1}</span><span class="core-portrait">${portraitSVG(p,team)}</span><span><b>${p.name}</b><small>${p.pos} · ${ppg} PPG · ${money(p.salary)}</small></span><strong>${p.overall}<small>OVR</small></strong>${icon('arrow')}</button>`;}).join('')}</div><div class="analytics-strip">${[['STAR POWER',best[0].overall],['SHOOTING',roster.reduce((s,p)=>s+p.offense,0)/roster.length],['DEFENSE',roster.reduce((s,p)=>s+p.defense,0)/roster.length],['YOUTH',Math.max(35,112-roster.reduce((s,p)=>s+p.age,0)/roster.length*2)],['DEPTH',roster.slice(5).reduce((s,p)=>s+p.overall,0)/7]].map(([label,value])=>`<div class="analytics-factor"><span>${label}</span><b>${Math.round(value)}</b><i><em style="width:${Math.min(100,value)}%"></em></i></div>`).join('')}</div></section>
      <section class="panel league-pulse"><div class="panel-label">AROUND THE LEAGUE <span>LIVE</span></div><div class="lead-story"><div class="story-portrait">${portraitSVG(best[0],team)}</div><span>${leader?'KIA MVP':'SEASON PREVIEW'}</span><h3>${leader?leader.name.toUpperCase():'THIRTY TEAMS.<br>ONE <em>IMMORTAL.</em>'}</h3><p>${leader?`${leader.points} PTS · ${leader.reb} REB · ${leader.ast} AST per game.`:`${best[0].name} and ${team.city} enter the league's widest-open title race in years.`}</p></div>${latestInjury?`<div class="news-item">${icon('news')}<span><b>${latestInjury.name} sidelined ${latestInjury.games} games.</b><small>INJURY DESK · ${getTeam(latestInjury.teamId).short}</small></span></div>`:'<div class="news-item">'+icon('news')+'<span><b>Scouts project a historically deep 2028 draft.</b><small>LEAGUE DESK · 12 MIN AGO</small></span></div>'}<div class="news-item">${icon('spark')}<span><b>${Object.keys(season.results).length} games logged · replay ${seasonChecksum(season)}</b><small>DETERMINISTIC LEAGUE FEED</small></span></div></section>
    </div>`;
}
function tradePerson(player,team,label,compare=null){const delta=compare?player.overall-compare.overall:0;return `<div class="trade-person"><span>${label}</span><div class="trade-portrait">${portraitSVG(player,team)}</div><b>${player.name}</b><small>${team.short} · ${player.pos} · ${player.age} YEARS</small><strong>${player.overall}<small>OVR</small></strong><em>${money(player.salary)} · ${player.years}Y</em>${compare?`<div class="trade-comparison"><span>OVERALL <b class="${delta>=0?'positive':'negative'}">${delta>=0?'+':''}${delta}</b></span><span>OFFENSE <b>${player.offense}</b></span><span>DEFENSE <b>${player.defense}</b></span></div>`:''}</div>`;}
function rotationPanel(){
  const team=getTeam(state.teamId),league=ensureLeague(season),minutes=league.rotations[state.teamId],injuries=roster.filter(p=>season.injuries[p.id]).length,chemistry=teamChemistry(season,state.teamId),roleWatch=[...roster].sort((a,b)=>a.morale-b.morale)[0];
  const row=(p,i)=>{const injury=season.injuries[p.id],stats=season.playerStats[p.id],ppg=stats?(stats.points/stats.gp).toFixed(1):'—',mpg=stats?Math.round(stats.seconds/stats.gp/60):0;return `<div class="roster-row ${p.starter?'is-starter':''} ${injury?'is-injured':''}"><button class="roster-name roster-open" data-action="player" data-player="${p.id}"><i>${p.number}</i><span><b>${p.name}</b><small>${injury?`OUT ${injury} G · DAY TO DAY`:`${p.age} YRS · ${ppg} PPG · ${mpg} MPG · ${p.starter?'STARTER':'BENCH'}`}</small></span></button><span data-label="POS">${p.pos}</span><span data-label="MIN" class="minute-control"><button data-action="minutes" data-player="${p.id}" data-delta="-2" aria-label="Reduce ${p.name} minutes">−</button><b>${minutes[i]}</b><button data-action="minutes" data-player="${p.id}" data-delta="2" aria-label="Increase ${p.name} minutes">+</button></span><span data-label="OFF">${p.offense}</span><span data-label="DEF">${p.defense}</span><span data-label="MORALE"><i class="morale"><em style="width:${p.morale}%"></em></i>${Math.round(p.morale)}</span><span data-label="CONTRACT">${money(p.salary)} <small>/ ${p.years}Y</small></span><strong class="ovr">${p.overall}</strong></div>`;};
  return `<section class="panel roster-panel"><div class="roster-toolbar"><div class="legend"><span><i class="starter-dot"></i> STARTER</span><span><i></i> ROTATION</span></div><span>${injuries} INJURED · ${minutes.reduce((s,v)=>s+v,0)} MIN ASSIGNED · CHEMISTRY ${chemistry}</span></div><div class="rotation-tip">SET THE PLAN <span>Minutes rebalance automatically across the other eleven players. Roles and results affect morale.</span></div><div class="rotation-insights"><article class="minutes-insight"><div><span>ROTATION LOAD</span><b>${minutes.slice(0,5).reduce((s,v)=>s+v,0)} <small>STARTER MIN</small></b></div><div class="minutes-map">${roster.map((p,i)=>`<i class="${i<5?'starting':''}" style="width:${minutes[i]/240*100}%" title="${p.name}: ${minutes[i]} minutes"></i>`).join('')}</div><div class="minutes-axis"><span>STARTING FIVE</span><span>BENCH ${minutes.slice(5).reduce((s,v)=>s+v,0)} MIN</span></div></article><article class="chemistry-insight"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" pathLength="100"/><circle cx="21" cy="21" r="16" pathLength="100" style="stroke-dasharray:${chemistry} 100"/></svg><div><span>CHEMISTRY INDEX</span><b>${chemistry}</b><small>${roster.filter(p=>p.morale>=75).length} PLAYERS BUYING IN</small></div></article><button class="role-insight" data-action="player" data-player="${roleWatch.id}"><div>${portraitSVG(roleWatch,team)}</div><span><small>ROLE WATCH</small><b>${roleWatch.name}</b><em>${Math.round(roleWatch.morale)} MORALE · ${minutes[roster.indexOf(roleWatch)]} MIN</em></span>${icon('arrow')}</button></div>
    <div class="roster-table"><div class="roster-row roster-head"><span>PLAYER</span><span>POS</span><span>MIN</span><span>OFF</span><span>DEF</span><span>MORALE</span><span>CONTRACT</span><span>OVR</span></div>${roster.slice(0,5).map((p,i)=>row(p,i)).join('')}<details class="bench-group" ${innerWidth>700?'open':''}><summary><span>BENCH UNIT</span><b>${roster.length-5} PLAYERS · ${minutes.slice(5).reduce((s,v)=>s+v,0)} MIN</b></summary><div class="bench-rows">${roster.slice(5).map((p,i)=>row(p,i+5)).join('')}</div></details>
    </div></section>`;
}
function tradeCenter(){
  const offers=tradeOffers(season,state.teamId),team=getTeam(state.teamId),cap=SALARY_CAP-payroll(roster);
  return `<section class="front-office-intro"><div><span class="eyebrow">THE TRADE DESK</span><h3>VALUE IS A<br><em>PERSPECTIVE.</em></h3></div><p>Offers refresh every six games. Every proposal explains the other GM's logic and its cap impact.<br>Current flexibility: <b>${money(cap)}</b></p></section><div class="trade-grid">${offers.length?offers.map(offer=>{const partner=getTeam(offer.partnerId),give=roster.find(p=>p.id===offer.giveId),receive=rosterFor(season,partner.id).find(p=>p.id===offer.receiveId);return `<article class="trade-card"><div class="trade-partner">${logoSVG(partner)}<span><small>TRADE PROPOSAL</small><b>${partner.city.toUpperCase()} ${partner.name.toUpperCase()}</b></span><strong>${offer.fit} FIT</strong></div><div class="trade-people">${tradePerson(give,team,'YOU SEND')}<span class="trade-arrow">⇄</span>${tradePerson(receive,partner,'YOU RECEIVE',give)}</div><p class="trade-reason">${offer.reason}</p><div class="trade-bottom"><span>CAP CHANGE <b class="${offer.salaryDelta>0?'negative':'positive'}">${offer.salaryDelta>=0?'+':''}${money(offer.salaryDelta).replace('−','−')}</b></span><button class="button primary" data-action="accept-trade" data-offer="${offer.id}">ACCEPT TRADE ${icon('arrow')}</button></div></article>`;}).join(''):'<section class="panel empty-playoffs"><h3>NO CAP-LEGAL OFFERS.</h3><p>Create flexibility through free agency or a contract decision. The desk refreshes after the next round.</p></section>'}</div>${season.league.tradeLog.length?`<div class="transaction-log"><span>RECENT TRANSACTIONS</span>${season.league.tradeLog.slice(0,3).map(t=>`<p><b>${getTeam(t.partnerId).short}</b> · ${t.reason}</p>`).join('')}</div>`:''}`;
}
function freeAgencyPanel(){
  const agents=ensureLeague(season).freeAgents,team=getTeam(state.teamId);
  return `<section class="front-office-intro"><div><span class="eyebrow">OPEN MARKET · ${agents.length} AVAILABLE</span><h3>FIND THE<br><em>MISSING PIECE.</em></h3></div><p>Signing requires a corresponding release. Two-year offers use the listed asking salary; cap legality is checked before completion.</p></section><section class="free-agent-grid">${agents.map(p=>`<article class="free-agent-card"><div class="fa-portrait">${portraitSVG(p,team)}</div><div class="fa-copy"><span>${p.pos} · ${p.age} YEARS · ${p.height}</span><b>${p.name}</b><small>OFF ${p.offense} · DEF ${p.defense} · POT ${p.potential}</small><div><strong>${p.overall}<small>OVR</small></strong><b>${money(p.ask)}<small>ASK / 2Y</small></b></div></div><button class="button secondary" data-action="sign-open" data-player="${p.id}">SIGN & RELEASE</button></article>`).join('')}</section>`;
}
function rosterView() {
  const team=getTeam(state.teamId),cap=SALARY_CAP-payroll(roster);
  return `<div class="page-heading"><div><span class="eyebrow">PERSONNEL</span><h2>YOUR <em>ROSTER.</em></h2><p>Twelve players. Five spots. Every minute matters.</p></div><div class="roster-summary"><span><small>CHEMISTRY</small><b>${teamChemistry(season,state.teamId)}</b></span><span><small>CAP ROOM</small><b>${money(cap)}</b></span></div></div><nav class="personnel-tabs">${[['rotation','ROTATION'],['trades','TRADE CENTER'],['free-agency','FREE AGENCY']].map(([mode,label])=>`<button data-action="roster-mode" data-mode="${mode}" class="${state.rosterMode===mode?'active':''}">${label}</button>`).join('')}</nav>${state.rosterMode==='trades'?tradeCenter():state.rosterMode==='free-agency'?freeAgencyPanel():rotationPanel()}`;
}
function signingModal(playerId,releaseId=null){
  const p=ensureLeague(season).freeAgents.find(x=>x.id===playerId);if(!p)return '';
  const release=roster.find(x=>x.id===releaseId)||[...roster].sort((a,b)=>b.salary-a.salary)[0],projected=SALARY_CAP-payroll(roster)+release.salary-p.ask;
  return `<div class="modal-backdrop" data-action="close-modal"></div><section class="signing-modal"><button class="icon-button modal-close" data-action="close-modal">${icon('close')}</button><span class="eyebrow">CONTRACT DESK</span><h2>MAKE ROOM<br>FOR <em>${p.name.toUpperCase()}.</em></h2><div class="signing-summary"><b>${p.pos} · ${p.overall} OVR</b><span>${money(p.ask)} · 2 YEARS</span></div><label for="release-select">PLAYER TO RELEASE</label><select id="release-select">${roster.map(x=>`<option value="${x.id}" ${x.id===release.id?'selected':''}>${x.name} · ${x.pos} · ${money(x.salary)}</option>`).join('')}</select><input type="hidden" id="sign-player" value="${p.id}"><div class="cap-projection"><span>PROJECTED CAP ROOM</span><b id="sign-cap" class="${projected<0?'negative':'positive'}">${money(projected)}</b><small id="sign-warning">${projected<0?'Over the cap. Choose a higher-salary release.':'Cap legal. The released player enters free agency.'}</small></div><button class="button primary" data-action="sign-confirm" ${projected<0?'disabled':''}>SIGN CONTRACT ${icon('arrow')}</button></section>`;
}
function standingsPanel(){const ranked=standings(season);return `<section class="panel standings-panel"><div class="standings-head"><span>RK</span><span>FRANCHISE</span><span>RECORD</span><span>OFF</span><span>DEF</span><span>OVR</span></div>${ranked.map((t,i)=>`<div class="standing-row ${t.id===state.teamId?'user-team':''}" style="--row-team:${t.primary}"><span class="standing-rank">${String(i+1).padStart(2,'0')}</span><span class="standing-team">${logoSVG(t)}<span><b>${t.city} ${t.name}</b><small>${t.short} · ${t.streak>0?`WON ${t.streak}`:t.streak<0?`LOST ${Math.abs(t.streak)}`:'SEASON PREVIEW'}</small></span></span><span class="standing-record">${t.wins}–${t.losses}</span><span>${t.offense}</span><span>${t.defense}</span><strong>${teamOverall(t)}</strong></div>`).join('')}</section>`;}
function schedulePanel(){const start=Math.max(0,Math.min(74,season.round-2)),rounds=season.schedule.slice(start,start+8);return `<section class="schedule-list">${rounds.map(round=>{const user=round.games.find(g=>g.homeId===state.teamId||g.awayId===state.teamId),result=season.results[user.id],home=getTeam(user.homeId),away=getTeam(user.awayId);return `<article class="schedule-round ${result?'played':''}"><div class="schedule-date"><small>ROUND ${round.round+1}</small><b>${formatSeasonDate(round.date)}</b><span>${result?'FINAL':'15 GAMES'}</span></div><div class="schedule-match">${logoSVG(away)}<span><small>${away.city}</small><b>${away.short}</b></span><strong>${result?`${result.awayScore} — ${result.homeScore}`:'AT'}</strong><span><small>${home.city}</small><b>${home.short}</b></span>${logoSVG(home)}</div><div class="schedule-context"><span>${result?`${result.winnerId===state.teamId?'WIN':'LOSS'} · ${result.checksum}`:user.homeId===state.teamId?'HOME · LEGENDARY ARENA':`AWAY · ${home.city.toUpperCase()}`}</span>${!result&&round.round===season.round?'<button class="text-button" data-action="quick-sim">QUICK SIM →</button>':''}</div></article>`;}).join('')}</section>`;}
function trophySVG(team){return `<svg class="championship-trophy" viewBox="0 0 240 220" role="img" aria-label="${season.year} championship trophy"><defs><linearGradient id="trophy-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0a6"/><stop offset=".35" stop-color="${team.secondary}"/><stop offset=".7" stop-color="#9b5b11"/><stop offset="1" stop-color="#ffe28a"/></linearGradient><radialGradient id="trophy-glow"><stop stop-color="${team.secondary}" stop-opacity=".38"/><stop offset="1" stop-color="${team.secondary}" stop-opacity="0"/></radialGradient></defs><circle cx="120" cy="104" r="105" fill="url(#trophy-glow)"/><g fill="none" stroke="${team.secondary}" stroke-opacity=".32"><path d="M25 50 48 64M196 44l-23 22M18 116h35M186 116h37M56 20l17 29M172 16l-14 31"/></g><path d="M77 43h86v43c0 37-17 62-43 62S77 123 77 86Z" fill="url(#trophy-gold)" stroke="#ffe9a0" stroke-width="2"/><path d="M78 58H49v20c0 26 17 39 39 39M162 58h29v20c0 26-17 39-39 39" fill="none" stroke="url(#trophy-gold)" stroke-width="9"/><path d="M105 146h30v24h27v17H78v-17h27Z" fill="url(#trophy-gold)"/><path d="M65 187h110l13 19H52Z" fill="#172232" stroke="${team.secondary}"/><circle cx="120" cy="86" r="25" fill="#101c29" stroke="#fff0b0" stroke-width="2"/><path d="M95 86h50M120 61c-10 12-10 38 0 50M120 61c10 12 10 38 0 50" fill="none" stroke="${team.secondary}" stroke-width="2"/><path d="m91 48 9 73" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></svg>`;}
function playoffHistory(){
  if(!season.playoffs?.round)return '';
  const groups={};
  for(const game of Object.values(season.results)){
    if(!game.seriesId)continue;const round=Number(game.seriesId.match(/^P(\d+)/)?.[1]);if(round>=season.playoffs.round)continue;
    const entry=groups[game.seriesId]||={round,id:game.seriesId,games:[]};entry.games.push(game);
  }
  const rounds=Object.values(groups).sort((a,b)=>a.round-b.round||a.id.localeCompare(b.id));
  if(!rounds.length)return '';
  return `<details class="bracket-history"><summary>THE ROAD HERE <span>${new Set(rounds.map(r=>r.round)).size} ROUNDS COMPLETE</span></summary><div>${rounds.map(series=>{const first=series.games.sort((a,b)=>a.id.localeCompare(b.id))[0],home=getTeam(first.homeId),away=getTeam(first.awayId),homeWins=series.games.filter(g=>g.winnerId===home.id).length;return `<span><b>${playoffName(series.round)}</b>${home.short} ${homeWins} — ${series.games.length-homeWins} ${away.short}</span>`;}).join('')}</div></details>`;
}
function playoffsPanel(){
  const playoffs=season.playoffs;
  if(!playoffs)return `<section class="panel empty-playoffs"><span class="eyebrow">THE ROAD TO SIXTEEN</span><h3>82 GAMES.<br>ONE BRACKET.</h3><p>The top eight teams in each conference advance. Every series is first to four.</p><button class="button primary" data-action="sim-season">SIM TO PLAYOFFS</button></section>`;
  const champion=playoffs.championId?getTeam(playoffs.championId):null;
  return `${champion?`<section class="championship-banner" style="--champion:${champion.primary};--champion-accent:${champion.secondary}"><div class="championship-art">${trophySVG(champion)}${logoSVG(champion)}</div><div class="championship-copy"><span>${season.year} BSCFD CHAMPIONS</span><h2>${champion.city.toUpperCase()}<br>${champion.name.toUpperCase()}</h2><p>Sixteen wins. One immortal season.<br>The ${champion.name} stand alone.</p></div><div class="championship-legacy"><small>FRANCHISE TITLES</small><b>01</b><span>LEGACY SECURED</span></div></section>`:''}${season.awards?`<section class="awards-grid">${[['MVP',season.awards.mvp],['DEFENSIVE PLAYER',season.awards.defensive],['ROOKIE OF THE YEAR',season.awards.rookie]].map(([label,a])=>{const team=getTeam(a.teamId),player=rosterFor(season,a.teamId).find(p=>p.id===a.playerId);return `<article class="award-card" style="--winner:${team.primary};--winner-accent:${team.secondary}"><div class="award-portrait">${portraitSVG(player,team)}</div><div class="award-copy"><span>${label}</span><b>${a.name}</b><small>${team.city} · ${player.pos} · #${player.number}</small><div class="award-stats"><strong>${a.points}<small>PPG</small></strong><strong>${a.reb}<small>RPG</small></strong><strong>${a.ast}<small>APG</small></strong></div><i><em style="width:${Math.min(100,a.points/35*100)}%"></em></i></div></article>`;}).join('')}</section>`:''}<div class="playoff-heading"><span>${playoffName(playoffs.round)}</span><small>FIRST TO FOUR · ${playoffs.series.filter(s=>!s.winnerId).length} ACTIVE SERIES</small>${season.phase==='playoffs'?'<button class="text-button" data-action="sim-playoffs">SIM TO CHAMPION →</button>':''}</div><section class="series-grid">${playoffs.series.map(series=>{const home=getTeam(series.homeId),away=getTeam(series.awayId),last=season.results[series.games.at(-1)];return `<article class="series-card ${series.homeId===state.teamId||series.awayId===state.teamId?'user-series':''}"><div class="series-meta"><span>${series.conference}</span><b>${series.winnerId?'SERIES FINAL':`GAME ${series.gameNo+1}`}</b></div><div class="series-team">${logoSVG(home)}<span><b>${home.city} ${home.name}</b><small>${season.records[home.id].wins}–${season.records[home.id].losses} · HOME COURT</small></span><strong>${series.homeWins}</strong></div><div class="series-team">${logoSVG(away)}<span><b>${away.city} ${away.name}</b><small>${last?`LAST · ${last.awayScore}—${last.homeScore}`:`${season.records[away.id].wins}–${season.records[away.id].losses} · SERIES TIED`}</small></span><strong>${series.awayWins}</strong></div>${series.winnerId?`<div class="series-winner">${getTeam(series.winnerId).city.toUpperCase()} ADVANCES</div>`:''}</article>`;}).join('')}</section>${playoffHistory()}`;
}
function leagueView() {
  const totals=seasonTotals(season);
  return `<div class="page-heading"><div><span class="eyebrow">LEAGUE CENTRAL</span><h2>${state.leagueMode==='history'?'YOUR <em>LEGACY.</em>':'THE <em>COMPETITION.</em>'}</h2><p>${state.leagueMode==='history'?'The record of every choice you made.':`${totals.games} games logged across the BSCFD.`}</p></div><div class="record-block"><small>LEAGUE FILE · SEED SYNCED</small><b class="checksum">${seasonChecksum(season)}</b><em>30 TEAMS · SEASON ${season.dynasty.number}</em></div></div><nav class="league-tabs">${[['standings','STANDINGS'],['schedule','CALENDAR'],['playoffs','PLAYOFFS'],['history','LEGACY']].map(([mode,label])=>`<button data-action="league-mode" data-mode="${mode}" class="${state.leagueMode===mode?'active':''}">${label}</button>`).join('')}</nav>${state.leagueMode==='history'?historyPanel({season,state}):state.leagueMode==='schedule'?schedulePanel():state.leagueMode==='playoffs'?playoffsPanel():standingsPanel()}`;
}
function playerModal(playerId) {
  const p=roster.find(x=>x.id===playerId); if(!p) return '';
  const team=getTeam(state.teamId),quote=extensionQuote(p),stats=season.playerStats[p.id],mpg=stats?Math.round(stats.seconds/stats.gp/60):0;
  return `<div class="modal-backdrop" data-action="close-modal"></div><section class="player-modal" style="--team:${team.primary};--accent:${team.secondary}"><button class="icon-button modal-close" data-action="close-modal">${icon('close')}</button><div class="portrait-wrap">${portraitSVG(p,team)}<span class="portrait-pos">${p.pos}</span></div><div class="player-details"><span class="eyebrow">${p.starter?'STARTING FIVE':'ROTATION PLAYER'}</span><h2>${p.name}</h2><div class="player-meta">#${p.number} · ${p.height} · ${p.age} YEARS OLD · ${mpg} MPG</div><div class="big-rating"><b>${p.overall}</b><span>OVERALL<small>POTENTIAL ${p.potential}</small></span></div><div class="attribute-grid"><span>OFFENSE <b>${p.offense}</b></span><span>DEFENSE <b>${p.defense}</b></span><span>MORALE <b>${Math.round(p.morale)}</b></span><span>CONTRACT <b>${money(p.salary)} · ${p.years}Y</b></span></div><blockquote>“${p.morale>85?'I love the direction here. Let’s make some noise.':p.morale>72?'I’m ready for whatever the team needs.':'I want a bigger role. I know I can contribute.'}”</blockquote><div class="player-actions">${!p.starter?`<button class="button secondary" data-action="make-starter" data-player="${p.id}">MOVE TO STARTING FIVE</button>`:''}${p.years<=2?`<button class="button secondary" data-action="extend-contract" data-player="${p.id}">EXTEND · ${money(quote.salary)} / 3Y</button>`:''}</div><button class="button primary" data-action="close-modal">BACK TO ROSTER</button></div></section>`;
}
function ownerModal() {
  const team=getTeam(state.teamId), trust=state.stance==='contender'?78:state.stance==='rebuild'?75:72;
  return `<div class="modal-backdrop" data-action="close-modal"></div><section class="owner-modal owner-scene" style="--team:${team.primary};--accent:${team.secondary}"><button class="icon-button modal-close" data-action="close-modal">${icon('close')}</button><div class="owner-visual">${ownerPortraitSVG(team)}<div class="owner-nameplate"><small>MAJORITY OWNER</small><b>MORGAN STERLING</b><span>TRUST <strong>${trust}</strong></span></div></div><div class="owner-dialogue"><span class="eyebrow">OWNER DIRECTIVE · SEASON 1</span><h2>MAKE ${team.city.toUpperCase()} <em>BELIEVE.</em></h2><p>“I’m giving you the keys because safe decisions haven’t made us special. What kind of team are we building, GM?”</p><div class="objective-list"><span>${icon('check')} Finish with a top-ten offensive rating</span><span>${icon('check')} Keep payroll below $112.0M</span></div><div class="dialogue-choices"><button data-action="owner-stance" data-stance="contender" class="choice-button ${state.stance==='contender'?'chosen':''}"><small>WIN THE ROOM</small><b>“A contender. Right now.”</b><span>Owner trust +6</span></button><button data-action="owner-stance" data-stance="rebuild" class="choice-button ${state.stance==='rebuild'?'chosen':''}"><small>BACK YOUR VISION</small><b>“A dynasty. Built to last.”</b><span>Owner trust +3</span></button></div></div></section>`;
}
function startSim(){
  const fixture=getUserFixture(season,state.teamId);if(!fixture){simulateNext(season,state.teamId);persist();render();return;}
  const home=getTeam(fixture.homeId),away=getTeam(fixture.awayId),lineup=id=>availableRoster(season,id);
  activeGame=new BasketballGame({seed:`${state.seed}|${season.year}|${fixture.id}`,homeTeam:home,awayTeam:away,homeRoster:lineup(home.id),awayRoster:lineup(away.id)});
  activeGame.userSide=fixture.homeId===state.teamId?'home':'away';activeGame.fixtureId=fixture.id;
  simSpeed=1;simPaused=false;coachOpen=false;lastAudioEvent=0;state.screen='simcast';
  arena.setTeam(home);arena.setOpponent(away);arena.setGame(activeGame);render();
}
function leaveSim(saveResult=false){
  if(saveResult&&activeGame?.result){state.lastResult=activeGame.result;persist();}
  activeGame=null;simPaused=false;state.screen='hub';state.tab='overview';arena.setTeam(getTeam(state.teamId));arena.setWarmup();render();
}
function showGameResult(){
  if(!activeGame?.result)return;
  simPaused=true;state.lastResult=activeGame.result;
  if(!activeGame.seasonCommitted){completeUserGame(season,state.teamId,activeGame);activeGame.seasonCommitted=true;}
  persist();
  const host=document.getElementById('result-host');if(host&&!host.hasChildNodes())host.innerHTML=resultModal(activeGame);
}
function storyBeat(result){
  if(!result||season.phase!=='regular'||season.round===0||season.round%6!==0)return null;
  const rand=rngFrom(`${state.seed}|${season.year}|story|${season.round}`),star=[...roster].sort((a,b)=>b.overall-a.overall)[0],record=season.records[state.teamId],stories=[`${star.name} has become the heartbeat of ${getTeam(state.teamId).city}. The city is starting to believe.`,`Morgan Sterling: “${record.wins>=record.losses?'Keep pushing. This league is noticing us.':'I still back the vision. Now show me the response.'}”`,`The locker room votes ${star.name} its player of the month. A moment worth celebrating.`,`National broadcast alert: ${getTeam(state.teamId).city} is the league's must-watch story after ${season.round} games.`];return stories[Math.floor(rand()*stories.length)];
}
function quickSim(){const result=simulateNext(season,state.teamId),story=storyBeat(result);persist();render();toast(story||(result?`Final · ${getTeam(result.awayId).short} ${result.awayScore}, ${getTeam(result.homeId).short} ${result.homeScore}`:'The playoff round is complete.'));}
function simToast(message){
  const host=document.getElementById('sim-toast');if(!host)return;host.innerHTML=`<div class="sim-toast" role="status" aria-live="polite">${message}</div>`;setTimeout(()=>{if(host)host.innerHTML='';},1800);
}
arena.onStep=()=>{
  if(state.screen!=='simcast'||!activeGame||simPaused||activeGame.state.finished)return;
  for(let i=0;i<simSpeed&&!activeGame.state.finished;i++)activeGame.step();
  const now=performance.now();
  if(now-lastSimUi>100){updateSimcastDOM(activeGame);if(activeGame.state.eventSeq>lastAudioEvent){lastAudioEvent=activeGame.state.eventSeq;audio.event(activeGame.lastEvent);}lastSimUi=now;}
  if(activeGame.state.finished)showGameResult();
};
function render(preserveScroll=false) {
  const scroll=preserveScroll?document.querySelector('.hub-content')?.scrollTop||0:0;
  roster=rosterFor(season,state.teamId);
  if(state.screen==='title') app.innerHTML=titleView();
  else if(state.screen==='team') app.innerHTML=teamView();
  else if(state.screen==='simcast'&&activeGame){app.innerHTML=simcastView(activeGame,simSpeed,simPaused,coachOpen);updateSimcastDOM(activeGame);if(activeGame.state.finished)showGameResult();}
  else app.innerHTML=hubShell(state.tab==='roster'?rosterView():state.tab==='league'?leagueView():season.phase==='offseason'?offseasonView({season,state}):overviewView());
  document.body.dataset.screen=state.screen;if(preserveScroll)document.querySelector('.hub-content')?.scrollTo(0,scroll);
}
function toast(message) {
  requestAnimationFrame(()=>{
    const host=document.getElementById('toast-host'); if(!host) return;
    host.innerHTML=`<div class="toast" role="status" aria-live="polite">${icon('spark')}<span>${message}</span></div>`;
    setTimeout(()=>{if(host)host.innerHTML='';},3600);
  });
}
function celebrate() {
  const rand=rngFrom(`${state.seed}|welcome|${state.teamId}`);
  const host=document.getElementById('toast-host'); if(!host) return;
  const confetti=document.createElement('div'); confetti.className='confetti';
  for(let i=0;i<34;i++){const bit=document.createElement('i');bit.style.cssText=`--x:${Math.floor(rand()*100)}vw;--d:${1.8+rand()*1.8}s;--r:${Math.floor(rand()*540)}deg;--c:${rand()>.5?'var(--accent)':'var(--team)'}`;confetti.appendChild(bit);}
  host.appendChild(confetti); setTimeout(()=>confetti.remove(),4200);
  toast(`The ${getTeam(state.teamId).name} era begins. Make it legendary.`);
}

app.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]'); if(!el) return;
  const action=el.dataset.action;
  if(action==='audio-toggle'){audio.toggle();render(true);return;}
  audio.unlock();if(!['speed','minutes'].includes(action))audio.play('click');if(action==='draft-pick')audio.play('draft');
  if(action==='new-game'){state.screen='team';state.tab='overview';render();}
  else if(action==='continue'&&save){state.seed=save.seed;state.teamId=save.teamId;state.screen='hub';arena.setTeam(getTeam(state.teamId));render();}
  else if(action==='title'){state.screen='title';render();}
  else if(action==='select-team')showTeamSheet(el.dataset.team);
  else if(action==='close-sheet')document.getElementById('team-sheet-host').innerHTML='';
  else if(action==='confirm-team'){
    const input=document.getElementById('seed-input');state.seed=(input?.value.trim()||DEFAULT_SEED).toUpperCase();season=createSeason(state.seed);ensureDynasty(season);state.lastResult=null;state.leagueMode='standings';
    state.screen='hub';state.tab='overview';persist();arena.setTeam(getTeam(state.teamId));render();celebrate();
  }
  else if(action==='tab'){state.tab=el.dataset.tab;state.screen='hub';render();document.querySelector('.hub-content')?.scrollTo(0,0);}
  else if(action==='league-mode'){state.tab='league';state.leagueMode=el.dataset.mode;state.screen='hub';render();document.querySelector('.hub-content')?.scrollTo(0,0);}
  else if(action==='roster-mode'){state.rosterMode=el.dataset.mode;render();document.querySelector('.hub-content')?.scrollTo(0,0);}
  else if(action==='minutes'){const player=roster.find(p=>p.id===el.dataset.player),index=roster.indexOf(player);setRotationMinutes(season,state.teamId,player.id,season.league.rotations[state.teamId][index]+Number(el.dataset.delta));persist();render(true);}
  else if(action==='make-starter'){setStarter(season,state.teamId,el.dataset.player);persist();render(true);toast('Starting five updated. The new rotation is ready.');}
  else if(action==='extend-contract'){const result=extendContract(season,state.teamId,el.dataset.player);if(result.ok){persist();render(true);toast(`${result.player.name} signs for three more years. Morale +6.`);}else toast(result.reason);}
  else if(action==='accept-trade'){const result=acceptTrade(season,state.teamId,el.dataset.offer);if(result.ok){persist();render(true);toast(`Trade complete · ${result.receive.name} is joining ${getTeam(state.teamId).city}.`);}else toast(result.reason);}
  else if(action==='sign-open'){document.getElementById('modal-host').innerHTML=signingModal(el.dataset.player);}
  else if(action==='sign-confirm'){const result=signFreeAgent(season,state.teamId,document.getElementById('sign-player')?.value,document.getElementById('release-select')?.value);if(result.ok){persist();render(true);toast(`${result.signed.name} signs. ${result.outgoing.name} enters free agency.`);}else toast(result.reason);}
  else if(action==='player'){state.playerId=el.dataset.player;document.getElementById('modal-host').innerHTML=playerModal(state.playerId);}
  else if(action==='owner'){if(state.screen==='hub')document.getElementById('modal-host').innerHTML=ownerModal();}
  else if(action==='owner-stance'){state.stance=el.dataset.stance;persist();render();toast(state.stance==='contender'?'The owner expects a contender. The pressure is on.':'The owner backs your long-term vision.');}
  else if(action==='start-sim')startSim();
  else if(action==='quick-sim')quickSim();
  else if(action==='sim-season'&&season.phase==='regular'){simulateRegularSeason(season);state.leagueMode='playoffs';state.tab='league';persist();render();toast(`${season.awards.mvp.name} wins MVP. The playoff bracket is set.`);}
  else if(action==='sim-playoffs'&&season.phase==='playoffs'){simulatePlayoffs(season);persist();render();toast(`${getTeam(season.playoffs.championId).city} wins the ${season.year} championship.`);if(season.playoffs.championId===state.teamId)celebrate();}
  else if(action==='begin-offseason'){const result=prepareOffseason(season,state.teamId);if(result.ok){state.tab='overview';state.draftPage=0;state.draftFilter='ALL';persist();render();celebrate();}else toast(result.reason);}
  else if(action==='scout-player'){const result=scoutProspect(season,el.dataset.player);if(result.ok){persist();render(true);}else toast(result.reason);}
  else if(action==='draft-filter'){state.draftFilter=el.dataset.filter;state.draftPage=0;render(true);}
  else if(action==='draft-page'){state.draftPage=Math.max(0,state.draftPage+Number(el.dataset.delta));render(true);}
  else if(action==='open-draft'){openDraft(season,state.teamId);state.draftFilter='ALL';state.draftPage=0;persist();render();}
  else if(action==='draft-pick'){const result=draftProspect(season,state.teamId,el.dataset.player);if(result.ok){persist();render();celebrate();}else toast(result.reason);}
  else if(action==='next-season'){const result=finalizeOffseason(season,state.teamId);if(result.ok){state.lastResult=null;state.leagueMode='standings';persist();arena.setWarmup();render();toast(`Season ${season.dynasty.number} begins. Your rookie is ready.`);}else toast(result.reason);}
  else if(action==='export-save'){persist();const blob=new Blob([exportSave(save)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`BSCFD-${state.teamId}-${season.year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Dynasty exported. Keep this file somewhere safe.');}
  else if(action==='import-open')document.getElementById('save-import')?.click();
  else if(action==='exit-sim')leaveSim(false);
  else if(action==='pause-sim'){simPaused=!simPaused;render();}
  else if(action==='speed'){simSpeed=Number(el.dataset.speed)||1;render();}
  else if(action==='focus'){activeGame?.setTactics(activeGame.userSide||'home',{focus:el.dataset.focus});render();}
  else if(action==='timeout'){if(activeGame?.callTimeout(activeGame.userSide||'home')){simToast('Momentum boost active for the next three possessions.');updateSimcastDOM(activeGame);}else simToast('No timeouts remaining.');}
  else if(action==='coach-toggle'){coachOpen=!coachOpen;render();}
  else if(action==='sim-end'&&activeGame){activeGame.runToEnd();updateSimcastDOM(activeGame);showGameResult();}
  else if(action==='return-hub')leaveSim(true);
  else if(action==='box-score'&&activeGame){document.getElementById('result-host').innerHTML=boxScoreModal(activeGame);}
  else if(action==='close-box'&&activeGame){document.getElementById('result-host').innerHTML=resultModal(activeGame);}
  else if(action==='close-modal'){document.getElementById('modal-host').innerHTML='';}
});

app.addEventListener('change',async event=>{
  if(event.target.id==='release-select')document.getElementById('modal-host').innerHTML=signingModal(document.getElementById('sign-player')?.value,event.target.value);
  if(event.target.id==='save-import'){
    try{const file=event.target.files?.[0];if(!file)return;const imported=validateImport(JSON.parse(await file.text()));season=imported.season;state.seed=imported.seed;state.teamId=imported.teamId;state.stance=imported.stance||'uncommitted';state.lastResult=imported.lastResult||null;state.tab='overview';state.screen='hub';save=imported;ensureLeague(season);ensureDynasty(season);persist();arena.setTeam(getTeam(state.teamId));arena.setWarmup();render();toast('Dynasty imported. Your legacy continues.');}catch(error){toast(error.message||'That league file could not be imported.');}
  }
});

app.addEventListener('input',event=>{
  const input=event.target.closest('[data-tactic]');if(!input||!activeGame)return;
  const key=input.dataset.tactic;activeGame.setTactics(activeGame.userSide||'home',{[key]:Number(input.value)});
  const label=document.getElementById(`${key}-value`);if(label)label.textContent=input.value;
});

addEventListener('keydown',event=>{
  if(event.key.toLowerCase()==='m'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){audio.toggle();render(true);}
  if(event.key==='Escape'){document.getElementById('modal-host')?.replaceChildren();document.getElementById('team-sheet-host')?.replaceChildren();}
  if(event.key===' '&&state.screen==='title'){event.preventDefault();state.screen='team';render();}
  else if(event.key===' '&&state.screen==='simcast'&&!activeGame?.state.finished){event.preventDefault();simPaused=!simPaused;render();}
});

window.__seek=t=>arena.seek(t);
window.__play=()=>arena.play();
window.__audioProbe=()=>({enabled:audio.enabled,state:audio.context?.state||'not-created',crowd:!!audio.crowd});
window.__gameProbe=()=>{const userSide=activeGame?.userSide||'home';return {screen:state.screen,tab:state.tab,teamId:state.teamId,seed:state.seed,rosterCount:roster.length,hasSave:!!save,season:{year:season.year,phase:season.phase,round:season.round,games:Object.keys(season.results).length,checksum:seasonChecksum(season),record:season.records[state.teamId],injuries:Object.keys(season.injuries).length,championId:season.playoffs?.championId||null,playoffRound:season.playoffs?.round??null},game:activeGame?{homeScore:activeGame.state.homeScore,awayScore:activeGame.state.awayScore,period:activeGame.state.period,clock:activeGame.state.clock,finished:activeGame.state.finished,checksum:activeGame.result?.checksum||null,speed:simSpeed,paused:simPaused,focus:activeGame.tactics[userSide].focus,pace:activeGame.tactics[userSide].pace,defense:activeGame.tactics[userSide].defense,timeouts:activeGame.state.timeouts[userSide]}:null,...arena.stats()};};
render();
window.__SCENE_READY__=true;
const T=new URLSearchParams(location.search).get('t');if(T!==null)arena.seek(T);
