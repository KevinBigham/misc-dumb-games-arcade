import assert from 'node:assert/strict';
import { createSeason, simulateRegularSeason, simulatePlayoffs, seasonChecksum, seasonTotals } from './src/season.js';
import { prepareOffseason, scoutProspect, prospectReport, openDraft, draftProspect, finalizeOffseason, careerSummary, exportSave, validateImport, ensureDynasty } from './src/dynasty.js';
import { rosterFor } from './src/franchise.js';
import { TEAMS } from './src/data.js';

function completeYear(season,teamId){
 simulateRegularSeason(season);simulatePlayoffs(season);assert.equal(season.phase,'complete');
 const first=seasonChecksum(season),prepared=prepareOffseason(season,teamId);assert.equal(prepared.ok,true);assert.equal(seasonChecksum(season),first,'archiving cannot change season results');
 const prospect=season.offseason.draftClass.find(p=>!p.draftedBy);assert.equal(prospectReport(season,prospect).scouted,false);
 assert.equal(scoutProspect(season,prospect.id).ok,true);assert.equal(prospectReport(season,prospect).overall,prospect.overall);
 const before=season.offseason.scoutingPoints;assert.equal(scoutProspect(season,prospect.id).already,true);assert.equal(season.offseason.scoutingPoints,before,'repeat scouting is free');
 assert.equal(openDraft(season,teamId).ok,true);assert.equal(season.offseason.order[season.offseason.pick],teamId);
 const pick=season.offseason.draftClass.find(p=>!p.draftedBy);assert.equal(draftProspect(season,teamId,pick.id).ok,true);
 assert.equal(season.offseason.draftLog.length,30);assert.equal(new Set(season.offseason.draftLog.map(x=>x.playerId)).size,30);
 assert.equal(pick.rookie,true);assert.equal(pick.draftYear,season.year+1);assert.ok(pick.draftPick>=1&&pick.draftPick<=30);
 const result=finalizeOffseason(season,teamId);assert.equal(result.ok,true);assert.equal(season.round,0);assert.equal(seasonTotals(season).games,0);
 for(const team of TEAMS){const roster=rosterFor(season,team.id);assert.equal(roster.length,12);assert.ok(roster.every(p=>p.years>0));assert.equal(roster.filter(p=>p.starter).length,5);}
 assert.equal(season.dynasty.history.length,ensureDynasty(season).number-1);
 return pick;
}
const seed='DYNASTY-ENGINE',teamId='aurora',season=createSeason(seed),firstRookie=completeYear(season,teamId);
assert.equal(season.year,2028);assert.equal(careerSummary(season,teamId).seasons,1);assert.equal(rosterFor(season,teamId).some(p=>p.id===firstRookie.id),true);const openingRoster=JSON.stringify(season.league.rosters);
simulateRegularSeason(season);const secondRookie=season.awards.rookie;assert.equal(rosterFor(season,secondRookie.teamId).find(p=>p.id===secondRookie.playerId).rookie,true);
simulatePlayoffs(season);const rookieSeasonChecksum=seasonChecksum(season);completeYear(season,teamId);assert.equal(season.year,2029);assert.equal(careerSummary(season,teamId).seasons,2);
const restored=validateImport(JSON.parse(exportSave({version:1,seed,teamId,season})));assert.equal(restored.season.year,2029);
const parallel=createSeason(seed);const parallelPick=completeYear(parallel,teamId);assert.equal(parallelPick.id,firstRookie.id);assert.equal(JSON.stringify(parallel.league.rosters),openingRoster,'draft and development reproduce exactly');
simulateRegularSeason(parallel);simulatePlayoffs(parallel);assert.equal(seasonChecksum(parallel),rookieSeasonChecksum,'the complete rookie season reproduces exactly');
console.log(JSON.stringify({passed:true,firstRookie:{name:firstRookie.name,pick:firstRookie.draftPick,year:firstRookie.draftYear},secondRookie:secondRookie.name,secondSeasonChecksum:rookieSeasonChecksum,currentYear:season.year,history:careerSummary(season,teamId),rosters:TEAMS.every(t=>rosterFor(season,t.id).length===12)},null,2));
