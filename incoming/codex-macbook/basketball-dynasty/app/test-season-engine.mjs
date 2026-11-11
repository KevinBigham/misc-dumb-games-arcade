import assert from 'node:assert/strict';
import { createSeason, generateSchedule, simulateRegularSeason, simulatePlayoffs, simulateNext, standings, seasonChecksum, getUserFixture, completeUserGame } from './src/season.js';
import { TEAMS, generateRoster, getTeam } from './src/data.js';
import { BasketballGame } from './src/simulation.js';
import { availableRoster } from './src/franchise.js';

const schedule=generateSchedule(2027);assert.equal(schedule.length,82);assert(schedule.every(r=>r.games.length===15));
for(const team of TEAMS){const games=schedule.flatMap(r=>r.games).filter(g=>g.homeId===team.id||g.awayId===team.id);assert.equal(games.length,82,team.id);assert.equal(new Set(games.map(g=>g.id)).size,82);}
const started=performance.now(),a=createSeason('SEASON-REPLAY'),b=createSeason('SEASON-REPLAY');
for(let i=0;i<3;i++){const fixture=getUserFixture(a,'miami');simulateNext(a,'miami');assert(fixture);}
assert.equal(standings(a).find(t=>t.id==='miami').wins+standings(a).find(t=>t.id==='miami').losses,3);
simulateRegularSeason(a);simulateRegularSeason(b);assert.notEqual(seasonChecksum(a),seasonChecksum(createSeason('wrong')));
assert(a.awards?.mvp&&a.awards?.defensive&&a.awards?.rookie);assert(standings(a).every(t=>t.wins+t.losses===82));assert.equal(Object.keys(a.results).length,1230);
for(const game of a.schedule.flatMap(r=>r.games))assert(b.results[game.id]);
assert.deepEqual(a.records,b.records);assert.deepEqual(a.playerStats,b.playerStats);assert.deepEqual(a.injuries,b.injuries);assert.deepEqual(a.awards,b.awards);
simulatePlayoffs(a);simulatePlayoffs(b);assert.equal(a.phase,'complete');assert.equal(b.phase,'complete');assert(a.playoffs.championId);assert.equal(seasonChecksum(a),seasonChecksum(b));
const playoffGames=Object.values(a.results).filter(r=>r.seriesId);assert(playoffGames.length>=70&&playoffGames.length<=105);assert(standings(a).every(t=>t.wins+t.losses===82),'playoffs must not alter regular-season records');
// A watched game must be interchangeable with the same quick-simmed fixture, regardless of insertion order.
const quick=createSeason('SEASON-REPLAY'),watched=createSeason('SEASON-REPLAY');for(let i=0;i<4;i++)simulateNext(quick,'miami');for(let i=0;i<3;i++)simulateNext(watched,'miami');
const fixture=getUserFixture(watched,'miami'),lineup=id=>availableRoster(watched,id);
const game=new BasketballGame({seed:`${watched.seed}|${watched.year}|${fixture.id}`,homeTeam:getTeam(fixture.homeId),awayTeam:getTeam(fixture.awayId),homeRoster:lineup(fixture.homeId),awayRoster:lineup(fixture.awayId)});game.runToEnd();completeUserGame(watched,'miami',game);
assert.deepEqual(watched.results,quick.results);assert.deepEqual(watched.records,quick.records);assert.equal(seasonChecksum(watched),seasonChecksum(quick));
simulateRegularSeason(watched);simulatePlayoffs(watched);assert.equal(seasonChecksum(watched),seasonChecksum(a));
console.log(JSON.stringify({passed:true,durationMs:Math.round(performance.now()-started),regularGames:1230,playoffGames:playoffGames.length,checksum:seasonChecksum(a),champion:a.playoffs.championId,awards:a.awards,injuries:a.injuryLog.length,watchedQuickIdentical:true},null,2));
