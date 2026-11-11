import { TEAMS, rngFrom, hashSeed, getTeam } from './data.js';
import { BasketballGame } from './simulation.js';
import { createLeague, ensureLeague, rosterFor, availableRoster, updateMorale } from './franchise.js';

export const REGULAR_SEASON_GAMES=82;
const ROUND_NAMES=['FIRST ROUND','CONFERENCE SEMIFINALS','CONFERENCE FINALS','THE FINALS'];
const sum=(items,key)=>items.reduce((total,item)=>total+(item[key]||0),0);
const pct=(wins,losses)=>wins+losses?wins/(wins+losses):0;

export function conferenceOf(teamId){return TEAMS.findIndex(t=>t.id===teamId)<15?'EAST':'WEST';}
export function formatSeasonDate(value){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value)).toUpperCase();}

export function generateSchedule(year=2027){
  const ids=TEAMS.map(t=>t.id),rounds=[];
  const circle=[...ids];
  for(let round=0;round<29;round++){
    const games=[];
    for(let i=0;i<15;i++){
      const a=circle[i],b=circle[29-i],flip=(round+i)%2===0;
      games.push({homeId:flip?a:b,awayId:flip?b:a});
    }
    rounds.push(games);
    circle.splice(1,0,circle.pop());
  }
  const schedule=[];
  for(let round=0;round<82;round++){
    const base=rounds[round%29],second=round>=29&&round<58;
    const games=base.map((game,index)=>({id:`R${round+1}-G${index+1}`,round,homeId:second?game.awayId:game.homeId,awayId:second?game.homeId:game.awayId,date:Date.UTC(year-1,9,15+round*2+1),played:false}));
    schedule.push({round,date:games[0].date,games});
  }
  return schedule;
}

function blankRecords(){return Object.fromEntries(TEAMS.map(t=>[t.id,{wins:0,losses:0,pointsFor:0,pointsAgainst:0,streak:0}]));}
function blankPlayerStats(){return {gp:0,points:0,reb:0,ast:0,stl:0,tov:0,fgm:0,fga:0,tpm:0,tpa:0,seconds:0};}
function addPlayerStats(season,box){
  for(const side of ['home','away'])for(const stat of box[side]){
    if(stat.seconds<=0)continue;
    const current=season.playerStats[stat.id]||blankPlayerStats();current.gp++;
    for(const key of ['points','reb','ast','stl','tov','fgm','fga','tpm','tpa','seconds'])current[key]+=stat[key]||0;
    season.playerStats[stat.id]=current;
  }
}
function lineupFor(season,teamId){return availableRoster(season,teamId);}
function applyResult(season,fixture,result,box){
  if(season.results[fixture.id])return;
  const home=season.records[fixture.homeId],away=season.records[fixture.awayId],homeWin=result.homeScore>result.awayScore;
  if(!fixture.seriesId){
    home.wins+=homeWin?1:0;home.losses+=homeWin?0:1;away.wins+=homeWin?0:1;away.losses+=homeWin?1:0;
    home.pointsFor+=result.homeScore;home.pointsAgainst+=result.awayScore;away.pointsFor+=result.awayScore;away.pointsAgainst+=result.homeScore;
    home.streak=homeWin?Math.max(1,home.streak+1):Math.min(-1,home.streak-1);away.streak=homeWin?Math.min(-1,away.streak-1):Math.max(1,away.streak+1);
  }
  season.results[fixture.id]={...fixture,homeScore:result.homeScore,awayScore:result.awayScore,winnerId:homeWin?fixture.homeId:fixture.awayId,period:result.period,checksum:result.checksum};
  addPlayerStats(season,box);updateMorale(season,fixture.homeId,box.home,homeWin);updateMorale(season,fixture.awayId,box.away,!homeWin);
}
function injuryDraw(season,fixture,box){
  const rand=rngFrom(`${season.seed}|${season.year}|${fixture.id}|injuries`);
  for(const side of ['home','away']){
    const teamId=fixture[`${side}Id`];
    if(rand()<.022){
      const candidates=box[side],pick=candidates[Math.floor(rand()*candidates.length)],games=2+Math.floor(rand()*7);
      if(pick){season.injuries[pick.id]=games;season.injuryLog.unshift({id:`${fixture.id}-${side}`,playerId:pick.id,name:pick.name,teamId,games,round:fixture.round??-1});}
    }
  }
}
function simulateFixture(season,fixture){
  if(season.results[fixture.id])return season.results[fixture.id];
  const homeRoster=lineupFor(season,fixture.homeId),awayRoster=lineupFor(season,fixture.awayId);
  const game=new BasketballGame({seed:`${season.seed}|${season.year}|${fixture.id}`,homeTeam:getTeam(fixture.homeId),awayTeam:getTeam(fixture.awayId),homeRoster,awayRoster});
  const result=game.runToEnd(),box=game.boxScore();applyResult(season,fixture,result,box);injuryDraw(season,fixture,box);
  return season.results[fixture.id];
}
function tickInjuries(season){for(const id of Object.keys(season.injuries)){season.injuries[id]--;if(season.injuries[id]<=0)delete season.injuries[id];}}
function computeAwards(season){
  const players=TEAMS.flatMap(team=>rosterFor(season,team.id).map(player=>({player,team,stats:season.playerStats[player.id]}))).filter(x=>x.stats?.gp>=20);
  const perGame=(x,key)=>x.stats[key]/x.stats.gp;
  const mvp=[...players].sort((a,b)=>(perGame(b,'points')+perGame(b,'reb')*.7+perGame(b,'ast')*.8+season.records[b.team.id].wins*.025)-(perGame(a,'points')+perGame(a,'reb')*.7+perGame(a,'ast')*.8+season.records[a.team.id].wins*.025))[0];
  const defensive=[...players].sort((a,b)=>(b.player.defense+perGame(b,'reb')+perGame(b,'stl')*3)-(a.player.defense+perGame(a,'reb')+perGame(a,'stl')*3))[0];
  const rookie=[...players].filter(x=>x.player.rookie===true&&x.player.rookieYear===season.year).sort((a,b)=>perGame(b,'points')-perGame(a,'points'))[0]||mvp;
  const pack=x=>({playerId:x.player.id,name:x.player.name,teamId:x.team.id,points:+(x.stats.points/x.stats.gp).toFixed(1),reb:+(x.stats.reb/x.stats.gp).toFixed(1),ast:+(x.stats.ast/x.stats.gp).toFixed(1)});
  return {mvp:pack(mvp),defensive:pack(defensive),rookie:pack(rookie)};
}
function seedPlayoffs(season){
  const series=[];
  for(const conference of ['EAST','WEST']){
    const ranked=standings(season,conference),pairs=[[0,7],[3,4],[2,5],[1,6]];
    pairs.forEach(([a,b],index)=>series.push(makeSeries(season,0,conference,index,ranked[a].id,ranked[b].id)));
  }
  season.playoffs={round:0,series,championId:null};season.phase='playoffs';
}
function makeSeries(season,round,conference,index,homeId,awayId){return {id:`P${round}-${conference}-${index}`,round,conference,index,homeId,awayId,homeWins:0,awayWins:0,gameNo:0,winnerId:null,games:[]};}
function playoffFixture(series){
  const gameNo=series.gameNo,homeId=[0,1,4,6].includes(gameNo)?series.homeId:series.awayId;
  return {id:`${series.id}-G${gameNo+1}`,seriesId:series.id,homeId,awayId:homeId===series.homeId?series.awayId:series.homeId,date:Date.UTC(2027,3,18+gameNo*2),played:false};
}
function simSeriesGame(season,series){
  if(series.winnerId)return;
  const fixture=playoffFixture(series),result=simulateFixture(season,fixture);series.gameNo++;
  if(result.winnerId===series.homeId)series.homeWins++;else series.awayWins++;
  series.games.push(result.id);
  if(series.homeWins===4||series.awayWins===4)series.winnerId=series.homeWins===4?series.homeId:series.awayId;
}
function advancePlayoffs(season){
  const playoffs=season.playoffs;if(!playoffs||playoffs.series.some(s=>!s.winnerId))return;
  if(playoffs.round===3){playoffs.championId=playoffs.series[0].winnerId;season.phase='complete';return;}
  const old=playoffs.series,nextRound=playoffs.round+1,series=[];
  if(nextRound<3){
    for(const conference of ['EAST','WEST']){
      const winners=old.filter(s=>s.conference===conference).sort((a,b)=>a.index-b.index).map(s=>s.winnerId),pairs=nextRound===1?[[winners[0],winners[3]],[winners[1],winners[2]]]:[[winners[0],winners[1]]];
      pairs.forEach(([a,b],index)=>{const [homeId,awayId]=seedOrder(season,a,b);series.push(makeSeries(season,nextRound,conference,index,homeId,awayId));});
    }
  }else{const [a,b]=old.map(s=>s.winnerId),[homeId,awayId]=seedOrder(season,a,b);series.push(makeSeries(season,3,'FINALS',0,homeId,awayId));}
  playoffs.round=nextRound;playoffs.series=series;
}
function seedOrder(season,a,b){const rank=standings(season);return rank.findIndex(t=>t.id===a)<rank.findIndex(t=>t.id===b)?[a,b]:[b,a];}
function finishRound(season){
  tickInjuries(season);
  if(season.phase==='regular'){season.round++;if(season.round>=82)computeAwardsAndSeed(season);}
  else advancePlayoffs(season);
}
function computeAwardsAndSeed(season){season.awards=computeAwards(season);seedPlayoffs(season);}

export function createSeason(seed,year=2027){return {seed,year,phase:'regular',round:0,schedule:generateSchedule(year),records:blankRecords(),results:{},playerStats:{},injuries:{},injuryLog:[],awards:null,playoffs:null,league:createLeague(seed)};}
export function getUserFixture(season,teamId){
  if(season.phase==='regular')return season.schedule[season.round]?.games.find(g=>g.homeId===teamId||g.awayId===teamId)||null;
  if(season.phase==='playoffs'){
    const series=season.playoffs.series.find(s=>(s.homeId===teamId||s.awayId===teamId)&&!s.winnerId);
    return series?{...playoffFixture(series),series}:null;
  }
  return null;
}
export function userSeries(season,teamId){return season.playoffs?.series.find(s=>(s.homeId===teamId||s.awayId===teamId)&&!s.winnerId)||null;}
export function completeUserGame(season,teamId,game){
  const fixture=getUserFixture(season,teamId);if(!fixture||!game.result)return null;
  const expectedHome=game.homeTeam.id===fixture.homeId&&game.awayTeam.id===fixture.awayId;if(!expectedHome)return null;
  applyResult(season,fixture,game.result,game.boxScore());injuryDraw(season,fixture,game.boxScore());
  if(season.phase==='regular'){
    for(const other of season.schedule[season.round].games)if(other.id!==fixture.id)simulateFixture(season,other);
  }else{
    const series=season.playoffs.series.find(s=>s.id===fixture.seriesId);
    if(game.result.winner==='home')series.homeWins++;else series.awayWins++;
    series.gameNo++;series.games.push(fixture.id);if(series.homeWins===4||series.awayWins===4)series.winnerId=series.homeWins===4?series.homeId:series.awayId;
    for(const other of season.playoffs.series)if(other.id!==series.id)simSeriesGame(season,other);
  }
  finishRound(season);return season.results[fixture.id];
}
export function simulateNext(season,teamId){
  if(season.phase==='complete')return null;
  const fixture=getUserFixture(season,teamId);
  if(season.phase==='regular'){
    for(const game of season.schedule[season.round].games)simulateFixture(season,game);
  }else{
    for(const series of season.playoffs.series)simSeriesGame(season,series);
  }
  finishRound(season);return fixture?season.results[fixture.id]:null;
}
export function simulateRegularSeason(season){while(season.phase==='regular')simulateNext(season,null);return season.awards;}
export function simulatePlayoffs(season){while(season.phase==='playoffs')simulateNext(season,null);return season.playoffs?.championId;}
export function standings(season,conference=null){
  return TEAMS.filter(t=>!conference||conferenceOf(t.id)===conference).map(t=>({...t,...season.records[t.id],diff:season.records[t.id].pointsFor-season.records[t.id].pointsAgainst})).sort((a,b)=>pct(b.wins,b.losses)-pct(a.wins,a.losses)||b.diff-a.diff||b.wins-a.wins||a.id.localeCompare(b.id));
}
export function seasonChecksum(season){return hashSeed(JSON.stringify({seed:season.seed,results:Object.values(season.results).sort((a,b)=>a.id.localeCompare(b.id)).map(r=>[r.id,r.homeScore,r.awayScore]),awards:season.awards,champion:season.playoffs?.championId})).toString(16).padStart(8,'0');}
export function playoffName(round){return ROUND_NAMES[round]||'PLAYOFFS';}
export function teamSeasonLeaders(season,teamId){return rosterFor(season,teamId).map(player=>({...player,season:season.playerStats[player.id]||blankPlayerStats()})).sort((a,b)=>(b.season.points/Math.max(1,b.season.gp))-(a.season.points/Math.max(1,a.season.gp)));}
export function seasonTotals(season){return {games:Object.keys(season.results).length,injuries:Object.keys(season.injuries).length,points:sum(Object.values(season.records),'pointsFor')};}
