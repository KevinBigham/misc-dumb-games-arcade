/** Shared, frozen integration contract. Simulation owns all World mutations. */
export const WIDTH = 1280;
export const HEIGHT = 720;
export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;
export const ARENA = Object.freeze({ x: 640, y: 360, radius: 310 });
export const HISTORY_TICKS = 240;
export const MIN_HISTORY_TICKS = 60;
export const FORK_RECHARGE_TICKS = 360;
export const ACT_TICKS = 3600;
export const MAX_ENEMIES = 64;
export const MAX_PROJECTILES = 512;
export const ACT_NAMES = ['THE WAKE', 'THE FRACTURE', 'THE PROCESSION', 'THE CHOIR'];

/**
 * Input = {moveX,moveY,aimX,aimY,fire,dashPressed,forkPressed}.
 * World = {seed,rngState,tick,phase,act,actTick,arena,player,enemies,projectiles,
 *   echoes,boss,score,stats,upgradeOffers,nextId,multiplier,comboTicks}.
 * phase: playing|upgrade|won|lost. act: 1..4. arena: ARENA.
 * stats = {kills,echoKills,forks,damageDealt}; time = tick / TICK_RATE.
 * player = {x,y,prevX,prevY,aim,hp,maxHp,radius,invulnTicks,dashTicks,
 *   dashCooldown,fireCooldown,fireRate,damage,pierce,forkCharges,
 *   forkRechargeTicks,history:Frame[],upgrades:string[],echoDamage}.
 * Frame = {x,y,aim,shots:Shot[]}; Shot = {x,y,dx,dy,speed,damage,pierce}.
 * Projectile = {id,x,y,prevX,prevY,vx,vy,radius,damage,pierce,owner,ttl,hitIds}.
 * owner: player|echo|enemy. Echo = {id,x,y,prevX,prevY,aim,frames,index,bornTick}.
 * Enemy = {id,kind,x,y,prevX,prevY,aim,hp,maxHp,radius,spawnTicks,
 *   attackTicks,chargeTicks,targetX,targetY}; kind: chaser|sentry|lancer.
 * Boss = null | {id,x,y,hp,maxHp,radius,phase,angle,telegraphs:Telegraph[]}.
 * Telegraph = {kind:'beam',angle,remainingTicks,durationTicks,width,activeTicks}.
 * upgradeOffers = [{id,name,description,flavor,icon}].
 * Event = {type,tick,x?,y?,entityId?,owner?,kind?,amount?,phase?,act?,
 *   fromX?,fromY?,path?:{x,y}[]}; types: shot|hit|kill|dash|fork|player-hit|
 *   run-start|act-start|upgrade-ready|boss-phase|run-end.
 *
 * sim/world.js exports createWorld(seed), stepWorld(world,input), applyUpgrade(world,id).
 * view/renderer.js exports createRenderer(canvas):
 *   resize(cssWidth,cssHeight,dpr), screenToWorld(clientX,clientY), consume(events),
 *   draw(world,alpha,realDt), setReducedMotion(bool), destroy().
 * input.js exports createInput(canvas,screenToWorld,callbacks):
 *   sample(), clear(), destroy(). callbacks: pause(),mute(),chooseUpgrade(index),restart().
 * ui.js exports createUI(root,callbacks): update(world,settings),showScreen(name,payload),destroy().
 *   names: title|playing|paused|upgrade|won|lost.
 *   callbacks: play(seed?),chooseUpgrade(id),restartSame(),newRun(),togglePause(),
 *   toggleMute(),toggleReducedMotion(). payload: {world?,bestScore?,muted?,reducedMotion?}.
 * audio.js exports createAudio(): unlock(),consume(events),setIntensity(act,bossPhase),
 *   setMuted(bool),suspend(),destroy(). unlock resumes after pause too.
 * storage.js exports createStorage(storage?): load(),save(profile),writable getter.
 *   profile = {version:1,settings:{muted:false,reducedMotion:false},bestScore:0,lastSeed:1}.
 */
export const EMPTY_INPUT = Object.freeze({ moveX: 0, moveY: 0, aimX: 640, aimY: 160, fire: false, dashPressed: false, forkPressed: false });

/** SIDELINE is a separate campaign and storage namespace. Money is integer $1,000s.
 * The franchise simulation exclusively owns mutations. UI reads state and calls actions.
 * Save v1 is the initial football schema; Echo Requiem's v1 profile is unchanged.
 * phase: regular | playoffs | offseason | draft | preseason; weeks are fixed sim ticks.
 */
export const FRANCHISE_VERSION = 1;
export const FRANCHISE_KEY = 'sideline.franchise';
export const ROSTER_LIMIT = 53;
export const POSITIONS = Object.freeze(['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P']);
export const ROSTER_SLOTS = Object.freeze({ QB: 3, RB: 4, WR: 6, TE: 3, OL: 9, DL: 8, LB: 7, CB: 6, S: 5, K: 1, P: 1 });
export const STARTER_SLOTS = Object.freeze({ QB: 1, RB: 1, WR: 3, TE: 1, OL: 5, DL: 4, LB: 3, CB: 2, S: 2, K: 1, P: 1 });
