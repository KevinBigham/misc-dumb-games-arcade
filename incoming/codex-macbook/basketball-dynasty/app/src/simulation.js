import { rngFrom, hashSeed } from './data.js';

export const FIXED_HZ=60;
export const GAME_SECONDS_PER_TICK=.2;
const REGULATION=48*60, QUARTER=12*60, OVERTIME=5*60;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function blankStats(player){return {id:player.id,name:player.name,pos:player.pos,number:player.number,points:0,fgm:0,fga:0,tpm:0,tpa:0,reb:0,ast:0,stl:0,tov:0,ftm:0,fta:0,seconds:0};}
function initialTactics(){return {pace:50,focus:'balanced',defense:50};}
function clockParts(seconds){const whole=Math.max(0,Math.ceil(seconds));return `${Math.floor(whole/60)}:${String(whole%60).padStart(2,'0')}`;}
function rotationSchedule(players){
  const defaults=[32,31,30,29,28,18,18,16,14,12,8,4],raw=players.map((p,i)=>Math.max(0,p.targetMinutes??defaults[i]??4)),total=raw.reduce((s,v)=>s+v,0)||240,target=raw.map(v=>v*240/total),allocated=players.map(()=>0),segments=[];
  for(let segment=0;segment<12;segment++){
    let chosen;
    if(segment===0)chosen=players.map((_,i)=>i).slice(0,5);
    else chosen=players.map((_,i)=>i).sort((a,b)=>(target[b]*(segment+1)/12-allocated[b])-(target[a]*(segment+1)/12-allocated[a])||a-b).slice(0,5);
    for(const i of chosen)allocated[i]+=4;segments.push(chosen.map(i=>players[i].id));
  }
  return segments;
}

export class BasketballGame {
  constructor({seed,homeTeam,awayTeam,homeRoster,awayRoster}){
    this.seed=seed;this.homeTeam=homeTeam;this.awayTeam=awayTeam;
    this.teams={home:homeTeam,away:awayTeam};this.rosters={home:homeRoster.slice(0,12),away:awayRoster.slice(0,12)};
    this.random=rngFrom(`${seed}|sim-v2|${homeTeam.id}|${awayTeam.id}`);
    this.state={period:1,clock:QUARTER,homeScore:0,awayScore:0,possession:'home',possessionLeft:14,totalTime:0,finished:false,winner:null,eventSeq:0,timeouts:{home:4,away:4},momentum:{home:0,away:0}};
    this.tactics={home:initialTactics(),away:initialTactics()};
    this.stats={home:Object.fromEntries(this.rosters.home.map(p=>[p.id,blankStats(p)])),away:Object.fromEntries(this.rosters.away.map(p=>[p.id,blankStats(p)]))};
    this.rotationPlans={home:rotationSchedule(this.rosters.home),away:rotationSchedule(this.rosters.away)};this.segments={home:-1,away:-1};this.onCourt={home:[],away:[]};this.lineupVersion=0;
    this.events=[];this.shot=null;this.result=null;this.syncRotations();
    this.emit('tip',`${homeTeam.city} ${homeTeam.name} vs. ${awayTeam.city} ${awayTeam.name}`,null,'neutral');
  }
  syncRotations(){
    const elapsed=this.state.period<=4?(this.state.period-1)*QUARTER+(QUARTER-this.state.clock):REGULATION;
    for(const side of ['home','away']){
      const segment=Math.max(0,Math.min(11,Math.floor(elapsed/240)));if(segment===this.segments[side])continue;
      this.segments[side]=segment;const ids=this.rotationPlans[side][segment];this.onCourt[side]=ids.map(id=>this.rosters[side].find(p=>p.id===id)).filter(Boolean);this.lineupVersion++;
    }
  }
  rand(){return this.random();}
  emit(type,text,side='home',kind=type,extra={}){
    const event={id:++this.state.eventSeq,type,kind,text,side,period:this.state.period,clock:this.state.clock,homeScore:this.state.homeScore,awayScore:this.state.awayScore,...extra};
    this.events.push(event);if(this.events.length>240)this.events.shift();this.lastEvent=event;return event;
  }
  setTactics(side,patch){
    if(!this.tactics[side]||this.state.finished)return;
    const current=this.tactics[side];
    this.tactics[side]={pace:clamp(Number(patch.pace??current.pace),0,100),focus:['balanced','outside','inside'].includes(patch.focus)?patch.focus:current.focus,defense:clamp(Number(patch.defense??current.defense),0,100)};
  }
  callTimeout(side){
    if(this.state.finished||this.state.timeouts[side]<=0)return false;
    this.state.timeouts[side]--;this.state.momentum[side]=3;
    this.emit('timeout',`${this.teams[side].short} timeout · ${this.state.timeouts[side]} remaining`,side,'timeout');return true;
  }
  step(){
    if(this.state.finished)return;
    this.syncRotations();
    for(const side of ['home','away'])for(const player of this.onCourt[side])this.stats[side][player.id].seconds+=GAME_SECONDS_PER_TICK;
    this.state.totalTime+=GAME_SECONDS_PER_TICK;this.state.clock-=GAME_SECONDS_PER_TICK;this.state.possessionLeft-=GAME_SECONDS_PER_TICK;
    if(this.state.clock<=0){this.endPeriod();return;}
    if(this.state.possessionLeft<=0)this.resolvePossession();
  }
  endPeriod(){
    if(this.state.period>=4&&this.state.homeScore!==this.state.awayScore){this.finish();return;}
    this.state.period++;this.state.clock=this.state.period>4?OVERTIME:QUARTER;this.state.possession=this.state.period%2?'away':'home';this.state.possessionLeft=14;
    this.emit('period',this.state.period>4?`Overtime ${this.state.period-4}`:`Start of period ${this.state.period}`,this.state.possession,'period');
  }
  finish(){
    this.state.clock=0;this.state.finished=true;this.state.winner=this.state.homeScore>this.state.awayScore?'home':'away';
    this.emit('final',`Final · ${this.teams.home.short} ${this.state.homeScore}, ${this.teams.away.short} ${this.state.awayScore}`,this.state.winner,'final');
    const box=this.boxScore();this.result={homeScore:this.state.homeScore,awayScore:this.state.awayScore,winner:this.state.winner,period:this.state.period,checksum:this.checksum(),playerOfGame:[...box.home,...box.away].sort((a,b)=>b.points-a.points||b.reb-a.reb)[0]};
  }
  checksum(){
    const compact={seed:this.seed,score:[this.state.homeScore,this.state.awayScore],period:this.state.period,events:this.events.map(e=>[e.type,e.side,e.text]),stats:this.boxScore()};
    return hashSeed(JSON.stringify(compact)).toString(16).padStart(8,'0');
  }
  boxScore(){const box=side=>Object.values(this.stats[side]).map(p=>({...p,minutes:Math.floor(p.seconds/60)}));return {home:box('home'),away:box('away')};}
  playerOfGame(){return [...Object.values(this.stats.home),...Object.values(this.stats.away)].sort((a,b)=>b.points-a.points||b.reb-a.reb)[0];}
  newPossession(side,seconds=14){
    this.state.possession=side;const pace=this.tactics[side].pace;this.state.possessionLeft=clamp(18-pace*.075+this.rand()*4,7,19,seconds);this.shot=null;
    if(this.state.momentum[side]>0)this.state.momentum[side]--;
  }
  resolvePossession(){
    const offense=this.state.possession,defense=offense==='home'?'away':'home';
    const lineup=this.onCourt[offense],tactic=this.tactics[offense],defTactic=this.tactics[defense];
    const players=lineup.map(p=>({p,weight:p.offense+(tactic.focus==='outside'&&['PG','SG','SF'].includes(p.pos)?12:0)+(tactic.focus==='inside'&&['PF','C'].includes(p.pos)?12:0)}));
    let pick=this.rand()*players.reduce((s,x)=>s+x.weight,0),player=players[0].p;
    for(const entry of players){pick-=entry.weight;if(pick<=0){player=entry.p;break;}}
    const defenders=this.onCourt[defense],lineupDefense=defenders.reduce((sum,p)=>sum+p.defense,0)/Math.max(1,defenders.length);
    const stats=this.stats[offense][player.id],defRating=lineupDefense+(defTactic.defense-50)*.06;
    const momentum=this.state.momentum[offense]>0?3:0;
    if(this.rand()<clamp(.095+(defRating-80)*.0015-(tactic.pace-50)*.00025,.055,.17)){
      stats.tov++;this.emit('turnover',`${player.name} loses it · ${this.teams[defense].short} ball`,defense,'turnover',{playerId:player.id});this.newPossession(defense);return;
    }
    let type='paint';const roll=this.rand();
    const threeRate=clamp(.31+(tactic.focus==='outside'?.14:0)+(tactic.focus==='inside'?-.10:0),.12,.55);
    if(roll<threeRate)type='three';else if(roll<threeRate+.24)type='midrange';
    const foulRate=type==='paint'?.105:.055;
    if(this.rand()<foulRate){
      const shots=type==='three'?3:2;let made=0;
      for(let i=0;i<shots;i++){stats.fta++;if(this.rand()<.72+(player.offense-80)*.002){stats.ftm++;made++;this.state[`${offense}Score`]++;}}
      stats.points+=made;this.emit('foul',`${player.name} makes ${made} of ${shots} free throws`,offense,'score',{playerId:player.id,points:made});this.newPossession(defense);return;
    }
    stats.fga++;if(type==='three')stats.tpa++;
    const base=type==='three'?.345:type==='midrange'?.455:.575;
    const focusBonus=(tactic.focus===type||(tactic.focus==='outside'&&type==='three')||(tactic.focus==='inside'&&type==='paint'))?.025:0;
    const chance=clamp(base+(player.offense-80)*.0045-(defRating-80)*.0028+focusBonus+momentum*.006,.20,.76);
    const made=this.rand()<chance,points=made?(type==='three'?3:2):0;
    this.shot={type,made,playerId:player.id,side:offense,eventId:this.state.eventSeq+1};
    if(made){
      stats.fgm++;if(type==='three')stats.tpm++;stats.points+=points;this.state[`${offense}Score`]+=points;
      if(this.rand()<.62){const mates=lineup.filter(p=>p.id!==player.id),passer=mates[Math.floor(this.rand()*mates.length)];this.stats[offense][passer.id].ast++;}
      this.emit('make',`${player.name} ${type==='three'?'from deep':type==='paint'?'finishes inside':'hits the jumper'} · +${points}`,offense,'score',{playerId:player.id,points,shotType:type});this.newPossession(defense);return;
    }
    this.emit('miss',`${player.name} misses the ${type==='three'?'three':type==='paint'?'layup':'jumper'}`,offense,'miss',{playerId:player.id,shotType:type});
    if(this.rand()<.23){
      stats.reb++;this.state.possessionLeft=14;this.emit('rebound',`${player.name} tracks down the offensive board`,offense,'rebound',{playerId:player.id});
    }else{
      const rebounder=this.onCourt[defense][Math.floor(this.rand()*this.onCourt[defense].length)];this.stats[defense][rebounder.id].reb++;this.newPossession(defense);
    }
  }
  runToEnd(maxTicks=120000){let n=0;while(!this.state.finished&&n++<maxTicks)this.step();if(!this.state.finished)throw new Error('Simulation tick limit reached');return this.result;}
  snapshot(){return {...this.state,clockText:clockParts(this.state.clock),periodText:this.state.period>4?`OT${this.state.period-4}`:`Q${this.state.period}`,tactics:this.tactics,timeouts:{...this.state.timeouts}};}
}

export function formatGameClock(seconds){return clockParts(seconds);}
export function runDeterminismCheck(seed,homeTeam,awayTeam,homeRoster,awayRoster){
  const a=new BasketballGame({seed,homeTeam,awayTeam,homeRoster,awayRoster});
  const b=new BasketballGame({seed,homeTeam,awayTeam,homeRoster,awayRoster});
  a.setTactics('home',{pace:72,focus:'outside',defense:65});b.setTactics('home',{pace:72,focus:'outside',defense:65});
  for(let i=0;i<600;i++){a.step();b.step();}
  a.callTimeout('away');b.callTimeout('away');
  const ar=a.runToEnd(),br=b.runToEnd();return {identical:JSON.stringify(ar)===JSON.stringify(br),a:ar,b:br};
}
