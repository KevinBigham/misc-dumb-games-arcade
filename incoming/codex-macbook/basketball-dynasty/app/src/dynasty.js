import { TEAMS, generateRoster, getTeam, rngFrom } from './data.js';
import { createSeason, standings, seasonChecksum } from './season.js';
import { ensureLeague, rosterFor, DEFAULT_MINUTES } from './franchise.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const money=v=>Math.round(v*10)/10;

export function ensureDynasty(season){
  season.dynasty||={number:Math.max(1,season.year-2026),history:[],titles:0,playoffAppearances:0,championships:[],transactions:0};
  season.dynasty.history||=[];season.dynasty.championships||=[];
  return season.dynasty;
}

export function draftOrder(season){
  const ranked=standings(season).map(t=>t.id),champion=season.playoffs?.championId;
  return [...ranked.filter(id=>id!==champion).reverse(),...(champion?[champion]:[])];
}

export function generateDraftClass(seed,year){
  const players=[];
  for(let i=0;i<60;i++){
    const source=generateRoster(TEAMS[i%30],`${seed}|draft|${year}|${Math.floor(i/30)}`)[Math.floor(i/30)];
    const rand=rngFrom(`${seed}|prospect|${year}|${i}`),overall=56+Math.floor(rand()*24);
    players.push({...source,id:`rookie-${year}-${i}`,age:19+Math.floor(rand()*4),overall,potential:clamp(overall+4+Math.floor(rand()*20),65,99),offense:clamp(overall+Math.floor(rand()*9)-4,48,95),defense:clamp(overall+Math.floor(rand()*9)-4,48,95),salary:money(1.2+(60-i)*.075),years:3,morale:80,starter:false,rookie:true,draftYear:null,draftPick:null,draftedBy:null,prospectTeam:TEAMS[i%30].id});
  }
  return players;
}

export function prepareOffseason(season,teamId){
  if(season.phase!=='complete')return {ok:false,reason:'Finish the championship first.'};
  const dynasty=ensureDynasty(season),record=season.records[teamId],champion=season.playoffs.championId;
  if(!dynasty.history.some(h=>h.year===season.year))dynasty.history.push({year:season.year,teamId,wins:record.wins,losses:record.losses,championId:champion,userChampion:champion===teamId,mvp:season.awards?.mvp?.name||null,checksum:seasonChecksum(season)});
  dynasty.titles=dynasty.history.filter(h=>h.userChampion).length;
  dynasty.playoffAppearances=dynasty.history.filter(h=>h.teamId===teamId).length;
  if(champion===teamId&&!dynasty.championships.includes(season.year))dynasty.championships.push(season.year);
  const order=draftOrder(season);
  season.offseason={stage:'scouting',scoutingPoints:8,scouted:[],order,pick:0,draftClass:generateDraftClass(season.seed,season.year+1),draftLog:[],startedYear:season.year+1};
  season.phase='offseason';
  return {ok:true,offseason:season.offseason};
}

export function scoutProspect(season,playerId){
  const off=season.offseason,player=off?.draftClass.find(p=>p.id===playerId);
  if(!off||off.stage!=='scouting'||!player)return {ok:false,reason:'This prospect is not available to scout.'};
  if(off.scouted.includes(playerId))return {ok:true,player,already:true};
  if(off.scoutingPoints<1)return {ok:false,reason:'No scouting visits remain.'};
  off.scoutingPoints--;off.scouted.push(playerId);return {ok:true,player};
}

export function prospectReport(season,player){
  const scouted=season.offseason?.scouted.includes(player.id),rand=rngFrom(`${season.seed}|scout-grade|${player.id}`),estimate=clamp(player.overall+Math.floor(rand()*9)-4,45,99);
  return {scouted,overall:scouted?player.overall:estimate,potential:scouted?player.potential:null,offense:scouted?player.offense:null,defense:scouted?player.defense:null,label:scouted?'FULL REPORT':'REGIONAL REPORT'};
}

export function openDraft(season,teamId){
  const off=season.offseason;if(!off||off.stage!=='scouting')return {ok:false,reason:'The draft is not ready.'};
  off.stage='draft';simulateToUser(season,teamId);return {ok:true,currentTeamId:off.order[off.pick]};
}

function chooseAI(season,teamId){
  const off=season.offseason,roster=rosterFor(season,teamId),rand=rngFrom(`${season.seed}|${season.year}|ai-draft|${teamId}`);
  const counts=Object.fromEntries(['PG','SG','SF','PF','C'].map(pos=>[pos,roster.filter(p=>p.pos===pos).length]));
  return off.draftClass.filter(p=>!p.draftedBy).map(p=>({player:p,score:p.overall+p.potential*.18-counts[p.pos]*1.4+rand()*2})).sort((a,b)=>b.score-a.score||a.player.id.localeCompare(b.player.id))[0]?.player;
}

function commitPick(season,teamId,player){
  const off=season.offseason,pick=off.pick+1,roster=rosterFor(season,teamId),slot=Math.min(11,roster.length);
  player.draftedBy=teamId;player.draftYear=off.startedYear;player.draftPick=pick;player.rookie=true;player.rookieYear=off.startedYear;player.starter=false;
  roster.push(player);ensureLeague(season).rotations[teamId].splice(slot,0,6);
  off.draftLog.push({pick,year:off.startedYear,teamId,playerId:player.id,name:player.name,overall:player.overall,pos:player.pos});off.pick++;
}

export function draftProspect(season,teamId,playerId){
  const off=season.offseason;if(!off||off.stage!=='draft')return {ok:false,reason:'Complete the draft first.'};
  if(off.order[off.pick]!==teamId)return {ok:false,reason:'It is not your pick.'};
  const player=off.draftClass.find(p=>p.id===playerId&&!p.draftedBy);if(!player)return {ok:false,reason:'That prospect has already been selected.'};
  commitPick(season,teamId,player);simulateToUser(season,teamId,true);off.stage='review';
  return {ok:true,player,pick:off.draftLog.findLast(x=>x.playerId===playerId)?.pick};
}

export function simulateToUser(season,teamId,finish=false){
  const off=season.offseason;if(!off||off.stage!=='draft')return;
  while(off.pick<off.order.length&&(finish||off.order[off.pick]!==teamId)){
    const id=off.order[off.pick],player=chooseAI(season,id);if(!player)break;commitPick(season,id,player);
  }
  if(off.pick>=off.order.length)off.stage='review';
}

export function finalizeOffseason(season,teamId){
  const off=season.offseason;if(!off||off.stage!=='review')return {ok:false,reason:'Make your draft selection first.'};
  const oldYear=season.year,league=ensureLeague(season),rand=rngFrom(`${season.seed}|${oldYear}|development`),news=[];
  for(const team of TEAMS){
    const roster=rosterFor(season,team.id),expired=[];
    for(const p of roster){
      const before=p.overall;p.age++;p.years=Math.max(0,(p.years||1)-1);
      const growth=p.age<=23?2:p.age<=26?1:p.age<=29?0:p.age<=32?-1:p.age<=34?-2:-3;
      const swing=Math.floor(rand()*3)-1,delta=clamp(growth+swing,-4,4);
      p.overall=clamp(p.overall+delta,45,99);p.offense=clamp(p.offense+delta,45,99);p.defense=clamp(p.defense+delta,45,99);p.potential=Math.max(p.potential,p.overall);
      p.development=p.overall-before;p.morale=clamp(p.morale+(delta>0?3:0),35,99);
      if(p.years===0){p.ask=money(Math.max(2.1,p.salary*.92));expired.push(p);}
      if(p.age>=38){p.retired=true;news.push(`${p.name} retires after a legendary career.`);}
    }
    league.freeAgents.push(...expired.filter(p=>!p.retired));
    let kept=roster.filter(p=>p.years>0&&!p.retired);
    while(kept.length>12){const cut=kept.filter(p=>!p.rookie||p.draftYear!==off.startedYear).sort((a,b)=>a.overall-b.overall||b.age-a.age)[0]||kept[0];cut.ask=money(Math.max(2.1,cut.salary*.8));cut.years=0;league.freeAgents.push(cut);kept.splice(kept.indexOf(cut),1);news.push(`${team.city} waives ${cut.name} to make room for its rookie.`);}
    while(kept.length<12){const rookie=off.draftClass.filter(p=>!p.draftedBy&&!p.signedBy).sort((a,b)=>b.overall-a.overall||a.id.localeCompare(b.id))[0],signing=rookie||expired.filter(p=>!p.retired&&!p.reSigned).sort((a,b)=>b.overall-a.overall||a.id.localeCompare(b.id))[0];if(!signing)break;signing.reSigned=!rookie;signing.years=2;signing.salary=rookie?1.2:money(signing.ask);if(rookie){signing.signedBy=team.id;signing.rookie=true;signing.rookieYear=off.startedYear;}kept.push(signing);news.push(`${team.city} ${rookie?'signs undrafted rookie':'brings back'} ${signing.name}.`);}
    kept.sort((a,b)=>b.overall-a.overall);kept.forEach((p,i)=>p.starter=i<5);
    league.rosters[team.id]=kept;league.rotations[team.id]=kept.map((_,i)=>DEFAULT_MINUTES[i]??4);
  }
  const history=ensureDynasty(season).history,next=createSeason(season.seed,oldYear+1);
  next.league=league;next.league.freeAgents=next.league.freeAgents.slice(-60);next.dynasty=ensureDynasty(season);next.dynasty.number++;next.dynasty.lastOffseason={year:oldYear,draftLog:off.draftLog,news};
  for(const key of Object.keys(season))delete season[key];Object.assign(season,next);
  return {ok:true,year:season.year,history};
}

export function careerSummary(season,teamId){
  const dynasty=ensureDynasty(season),history=dynasty.history.filter(h=>h.teamId===teamId);
  return {seasons:history.length,wins:history.reduce((s,h)=>s+h.wins,0),losses:history.reduce((s,h)=>s+h.losses,0),titles:history.filter(h=>h.userChampion).length,championships:dynasty.championships};
}

export function exportSave(save){return JSON.stringify({...save,exportedAt:new Date().toISOString(),format:'BSCFD-DYNASTY'},null,2);}
export function validateImport(data){
  if(!data||typeof data.seed!=='string'||!TEAMS.some(t=>t.id===data.teamId)||!data.season?.league?.rosters||data.season.schedule?.length!==82)throw new Error('Choose a valid BSCFD dynasty save.');
  for(const team of TEAMS)if(!Array.isArray(data.season.league.rosters[team.id]))throw new Error('The roster file is incomplete.');
  return data;
}

export function draftTeamName(id){return getTeam(id).city;}
