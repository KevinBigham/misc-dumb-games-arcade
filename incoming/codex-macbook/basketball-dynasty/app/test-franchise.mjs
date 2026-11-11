import assert from 'node:assert/strict';
import { TEAMS,getTeam } from './src/data.js';
import { BasketballGame } from './src/simulation.js';
import { createSeason,simulateNext,getUserFixture,completeUserGame,seasonChecksum } from './src/season.js';
import { SALARY_CAP,availableRoster,payroll,setRotationMinutes,setStarter,tradeOffers,acceptTrade,extendContract,signFreeAgent } from './src/franchise.js';

const season=createSeason('FRANCHISE-TEST'),roster=season.league.rosters.miami;
assert.equal(roster.length,12);assert.equal(season.league.rotations.miami.reduce((a,b)=>a+b,0),240);
setRotationMinutes(season,'miami',roster[0].id,34);assert.equal(season.league.rotations.miami[0],34);assert.equal(season.league.rotations.miami.reduce((a,b)=>a+b,0),240);
setStarter(season,'miami',roster[8].id);assert(roster[4].starter);assert.equal(roster.filter(p=>p.starter).length,5);
const quick=createSeason('FRANCHISE-TEST'),watched=createSeason('FRANCHISE-TEST');simulateNext(quick,'miami');
const fixture=getUserFixture(watched,'miami'),game=new BasketballGame({seed:`${watched.seed}|${watched.year}|${fixture.id}`,homeTeam:getTeam(fixture.homeId),awayTeam:getTeam(fixture.awayId),homeRoster:availableRoster(watched,fixture.homeId),awayRoster:availableRoster(watched,fixture.awayId)});
const replay=new BasketballGame({seed:game.seed,homeTeam:game.homeTeam,awayTeam:game.awayTeam,homeRoster:availableRoster(watched,fixture.homeId),awayRoster:availableRoster(watched,fixture.awayId)});game.runToEnd();replay.runToEnd();assert.deepEqual(game.result,replay.result);
for(const side of ['home','away']){const box=game.boxScore()[side];assert.equal(box.filter(p=>p.seconds>0).length,12);assert(Math.abs(box.reduce((s,p)=>s+p.seconds,0)-game.state.period*12*60*5)<.001);}
completeUserGame(watched,'miami',game);assert.deepEqual(watched.results,quick.results);assert.equal(seasonChecksum(watched),seasonChecksum(quick));
const moraleBefore=quick.league.rosters.miami.map(p=>p.morale);simulateNext(quick,'miami');assert(quick.league.rosters.miami.some((p,i)=>p.morale!==moraleBefore[i]));

let traded=null;
for(const team of TEAMS){const test=createSeason('TRADE-LEGAL'),offer=tradeOffers(test,team.id)[0];if(!offer)continue;const give=test.league.rosters[team.id].find(p=>p.id===offer.giveId),receive=test.league.rosters[offer.partnerId].find(p=>p.id===offer.receiveId),result=acceptTrade(test,team.id,offer.id);assert(result.ok);assert(test.league.rosters[team.id].includes(receive));assert(test.league.rosters[offer.partnerId].includes(give));assert(payroll(test.league.rosters[team.id])<=SALARY_CAP);assert.equal(test.league.tradeLog.length,1);traded=true;break;}assert(traded);
let extended=false;
for(const team of TEAMS){const test=createSeason('EXTENSION'),player=test.league.rosters[team.id].find(p=>p.years<=2&&payroll(test.league.rosters[team.id])+p.salary*.12<=SALARY_CAP);if(!player)continue;const result=extendContract(test,team.id,player.id);assert(result.ok);assert.equal(player.years,3);extended=true;break;}assert(extended);
let signed=false;
for(const team of TEAMS){const test=createSeason('SIGNING'),fa=test.league.freeAgents.find(p=>p.ask<=3),outgoing=[...test.league.rosters[team.id]].sort((a,b)=>b.salary-a.salary)[0];if(!fa||payroll(test.league.rosters[team.id])-outgoing.salary+fa.ask>SALARY_CAP)continue;const result=signFreeAgent(test,team.id,fa.id,outgoing.id);assert(result.ok);assert(test.league.rosters[team.id].some(p=>p.id===fa.id));assert(test.league.freeAgents.some(p=>p.id===outgoing.id));assert.equal(test.league.rosters[team.id].length,12);signed=true;break;}assert(signed);
const a=createSeason('ROSTER-REPLAY'),b=createSeason('ROSTER-REPLAY');for(let i=0;i<4;i++){simulateNext(a,'seattle');simulateNext(b,'seattle');}assert.equal(seasonChecksum(a),seasonChecksum(b));assert.deepEqual(a.league,b.league);assert.deepEqual(JSON.parse(JSON.stringify(a)).league,a.league);
console.log(JSON.stringify({passed:true,rotations:12,totalMinutes:240,watchedQuickIdentical:true,trade:true,extension:true,freeAgentSigning:true,checksum:seasonChecksum(a)},null,2));
