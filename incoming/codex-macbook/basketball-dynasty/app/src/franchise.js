import { TEAMS, generateRoster, getTeam, rngFrom } from './data.js';

export const SALARY_CAP=112;
export const DEFAULT_MINUTES=[32,31,30,29,28,18,18,16,14,12,8,4];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const round1=value=>Math.round(value*10)/10;
export const payroll=players=>round1(players.reduce((sum,p)=>sum+p.salary,0));

function freeAgentClass(seed,pool,base){
  const template={...TEAMS[0],id:`${pool}-class`,offense:base,defense:base};
  return generateRoster(template,`${seed}|${pool}`).map((p,index)=>({...p,id:`${pool}-${index}`,starter:false,years:0,ask:round1(Math.max(2.1,p.salary*.82)),morale:70+index%18}));
}
export function createLeague(seed){
  const rosters=Object.fromEntries(TEAMS.map(team=>{const roster=generateRoster(team,seed),rookie=[...roster].sort((a,b)=>a.age-b.age||a.id.localeCompare(b.id))[0];rookie.rookie=true;rookie.rookieYear=2027;return [team.id,roster];}));
  return {rosters,rotations:Object.fromEntries(TEAMS.map(team=>[team.id,[...DEFAULT_MINUTES]])),freeAgents:[...freeAgentClass(seed,'veteran',76),...freeAgentClass(seed,'prospect',69)],tradeLog:[],transactions:0};
}
export function ensureLeague(season){
  if(!season.league?.rosters)season.league=createLeague(season.seed);
  for(const team of TEAMS){
    if(!season.league.rotations[team.id]?.length)season.league.rotations[team.id]=[...DEFAULT_MINUTES];
    season.league.rotations[team.id]=season.league.rosters[team.id].map((p,i)=>season.league.rotations[team.id][i]??DEFAULT_MINUTES[i]??4);
  }
  return season.league;
}
export function rosterFor(season,teamId){return ensureLeague(season).rosters[teamId];}
export function availableRoster(season,teamId){
  const roster=rosterFor(season,teamId),minutes=ensureLeague(season).rotations[teamId];
  return roster.filter(p=>(season.injuries[p.id]||0)<=0).map(p=>{const index=roster.findIndex(x=>x.id===p.id),morale=(p.morale-75)*.045;return {...p,targetMinutes:minutes[index]??8,offense:clamp(Math.round(p.offense+morale),45,99),defense:clamp(Math.round(p.defense+morale),45,99)};});
}
export function setRotationMinutes(season,teamId,playerId,target){
  const league=ensureLeague(season),roster=league.rosters[teamId],minutes=league.rotations[teamId],index=roster.findIndex(p=>p.id===playerId);
  if(index<0)return false;
  const desired=clamp(Math.round(Number(target)),0,40),old=minutes[index],delta=desired-old;
  if(!delta)return true;
  const others=minutes.map((_,i)=>i).filter(i=>i!==index);
  let remaining=Math.abs(delta);
  for(let pass=0;pass<3&&remaining>0;pass++){
    const capacity=i=>delta>0?minutes[i]:40-minutes[i],total=others.reduce((s,i)=>s+capacity(i),0);if(!total)break;
    for(const i of others){const amount=Math.min(capacity(i),remaining*capacity(i)/total);minutes[i]+=delta>0?-amount:amount;}
    const sum=minutes.reduce((s,v)=>s+v,0);minutes[index]=desired;remaining=Math.abs(240-sum);
  }
  minutes[index]=desired;
  // Integer targets are displayed in the UI; distribute any rounding residue without changing the 240-minute plan.
  let rounded=minutes.map(v=>Math.round(v)),residue=240-rounded.reduce((s,v)=>s+v,0),cursor=0;
  while(residue!==0&&cursor<100){const i=(index+1+cursor)%minutes.length,change=Math.sign(residue);if(rounded[i]+change>=0&&rounded[i]+change<=40){rounded[i]+=change;residue-=change;}cursor++;}
  league.rotations[teamId]=rounded;league.rotations[teamId][index]=desired;
  // If pinning the requested value created a one-minute residue, absorb it in the largest flexible rotation.
  const difference=240-league.rotations[teamId].reduce((s,v)=>s+v,0);
  if(difference){const i=league.rotations[teamId].map((v,i)=>({i,v})).filter(x=>x.i!==index).sort((a,b)=>difference>0?b.v-a.v:a.v-b.v)[0].i;league.rotations[teamId][i]+=difference;}
  return true;
}
export function setStarter(season,teamId,playerId){
  const roster=rosterFor(season,teamId),index=roster.findIndex(p=>p.id===playerId);if(index<0)return false;
  if(index<5)return true;
  const [player]=roster.splice(index,1);roster.splice(4,0,player);
  const minutes=ensureLeague(season).rotations[teamId],[planned]=minutes.splice(index,1);minutes.splice(4,0,planned);
  player.starter=true;roster.forEach((p,i)=>p.starter=i<5);return true;
}
export function updateMorale(season,teamId,box,won){
  const roster=rosterFor(season,teamId),ranked=[...roster].sort((a,b)=>b.overall-a.overall),changes=[];
  for(const player of roster){
    const stat=box.find(p=>p.id===player.id),rank=ranked.findIndex(p=>p.id===player.id),expected=rank<5?27:rank<8?15:7,actual=stat?.minutes||0;
    const delta=clamp((actual-expected)*.055,-1.4,1)+(won?.35:-.18),before=player.morale;
    player.morale=clamp(round1(player.morale+delta),35,99);if(player.morale!==before)changes.push({playerId:player.id,delta:round1(player.morale-before)});
  }
  return changes;
}
export function teamChemistry(season,teamId){const roster=rosterFor(season,teamId);return Math.round(roster.reduce((s,p)=>s+p.morale,0)/roster.length);}

export function tradeOffers(season,teamId){
  const league=ensureLeague(season),roster=league.rosters[teamId],cycle=Math.floor((season.round||0)/6),rand=rngFrom(`${season.seed}|${season.year}|${teamId}|trade|${cycle}`),offers=[];
  const partners=TEAMS.filter(t=>t.id!==teamId),capRoom=SALARY_CAP-payroll(roster);
  const used=new Set();
  for(let n=0;n<3;n++){
    let partner=partners[Math.floor(rand()*partners.length)];while(used.has(partner.id))partner=partners[(partners.findIndex(t=>t.id===partner.id)+1)%partners.length];used.add(partner.id);
    const give=roster[5+((cycle+n*2)%Math.min(6,roster.length-5))],their=league.rosters[partner.id];
    const receive=[...their].filter(p=>p.pos===give.pos&&Math.abs(p.overall-give.overall)<=5&&p.salary-give.salary<=capRoom).sort((a,b)=>Math.abs(a.overall-give.overall)-Math.abs(b.overall-give.overall)||a.id.localeCompare(b.id))[0];
    if(!receive)continue;
    const younger=receive.age<give.age,better=receive.overall>give.overall;
    offers.push({id:`${season.year}-${cycle}-${teamId}-${partner.id}-${give.id}-${receive.id}`,partnerId:partner.id,giveId:give.id,receiveId:receive.id,reason:younger?`${getTeam(partner.id).city} offers youth for your proven rotation player.`:better?`${getTeam(partner.id).city} needs ${give.name}'s ${give.pos} skill set for a playoff push.`:`A like-for-like ${give.pos} swap balances both rotations.`,fit:Math.round((receive.offense+receive.defense)/2),salaryDelta:round1(receive.salary-give.salary)});
  }
  return offers;
}
export function acceptTrade(season,teamId,offerId){
  const league=ensureLeague(season),offer=tradeOffers(season,teamId).find(o=>o.id===offerId);if(!offer)return {ok:false,reason:'This offer is no longer available.'};
  const mine=league.rosters[teamId],theirs=league.rosters[offer.partnerId],give=mine.find(p=>p.id===offer.giveId),receive=theirs.find(p=>p.id===offer.receiveId);if(!give||!receive)return {ok:false,reason:'A player in this offer has moved.'};
  if(payroll(mine)-give.salary+receive.salary>SALARY_CAP)return {ok:false,reason:'The incoming salary would put you over the cap.'};
  const a=mine.indexOf(give),b=theirs.indexOf(receive);mine[a]=receive;theirs[b]=give;receive.starter=a<5;give.starter=b<5;
  league.tradeLog.unshift({id:offer.id,year:season.year,round:season.round,teamId,partnerId:offer.partnerId,giveId:give.id,receiveId:receive.id,reason:offer.reason});league.transactions++;
  return {ok:true,offer,give,receive};
}
export function extensionQuote(player){return {salary:round1(player.salary*1.12),years:3};}
export function extendContract(season,teamId,playerId){
  const roster=rosterFor(season,teamId),player=roster.find(p=>p.id===playerId);if(!player)return {ok:false,reason:'Player not found.'};if(player.years>2)return {ok:false,reason:'This contract is not yet eligible for an extension.'};
  const quote=extensionQuote(player);if(payroll(roster)-player.salary+quote.salary>SALARY_CAP)return {ok:false,reason:'Not enough cap room for this extension.'};
  player.salary=quote.salary;player.years=quote.years;player.morale=clamp(player.morale+6,35,99);ensureLeague(season).transactions++;return {ok:true,player};
}
export function signFreeAgent(season,teamId,freeAgentId,releaseId){
  const league=ensureLeague(season),roster=league.rosters[teamId],incoming=league.freeAgents.find(p=>p.id===freeAgentId),outgoing=roster.find(p=>p.id===releaseId);
  if(!incoming||!outgoing)return {ok:false,reason:'Choose a free agent and a player to release.'};
  const salary=incoming.ask;if(payroll(roster)-outgoing.salary+salary>SALARY_CAP)return {ok:false,reason:'That combination exceeds the $112.0M salary cap.'};
  const index=roster.indexOf(outgoing),signed={...incoming,salary,years:2,starter:outgoing.starter,morale:78};
  roster[index]=signed;league.freeAgents.splice(league.freeAgents.indexOf(incoming),1);outgoing.years=0;outgoing.ask=round1(Math.max(2.1,outgoing.salary*.8));league.freeAgents.push(outgoing);league.transactions++;
  return {ok:true,signed,outgoing};
}
