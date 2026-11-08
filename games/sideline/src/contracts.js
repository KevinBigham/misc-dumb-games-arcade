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

/** 26: DOING MY BEST. Independent save, integer dollars, one action per fixed day.
 * sim/quarterlife.js owns state mutations and all seeded random choices.
 * phase: playing | event | upgrade | ended. Views only read state.
 * Actions: playCard, rerollPlans, petCat, resolveLifeEvent, chooseLifeUpgrade.
 * Profile v1 is initial schema; unsupported saves are preserved, never overwritten.
 */
export const QUARTERLIFE_VERSION = 1;
export const QUARTERLIFE_KEY = 'twenty-six.run';
export const QUARTERLIFE_DAYS = 28;
export const QUARTERLIFE_RENT = 1200;

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

/** CROSSBLOCK is independent of both existing games. Simulation owns board, hand,
 * seeded draws, scoring, rotation, and undo. Views only read. Each placement is
 * one fixed turn; no clock or browser APIs enter the simulation.
 * Board: 64 cells, 0 = empty, 1..6 = color. Hand: three Piece|null entries.
 * Piece: {name, cells:[[x,y]], color}; coordinates are normalized to (0,0).
 * Events: placed {cells,color}, cleared {cells,rows,columns,points,cross,chain},
 * perfect-clear, dealt, game-over, rotated, undone. Coordinates are cell indices.
 * Profile v1 is a new namespace; only best score and sound preference persist.
 */
export const CROSSBLOCK_SIZE = 8;
export const CROSSBLOCK_PROFILE_VERSION = 1;
export const CROSSBLOCK_PROFILE_KEY = 'crossblock.profile';
/** Run saves are independent of the unchanged best-score/sound profile v1.
 * Session v1 = {version,revision,mode,free,daily,completedDaily:{key,score}|null}.
 * Each world includes mode: free|daily and puzzleKey: null|YYYY-MM-DD.
 * Daily mode deals exactly three pieces, then ends won|over. All daily templates
 * have a provable clear. The UI supplies the local date; simulation has no clock.
 */
export const CROSSBLOCK_SESSION_VERSION = 1;
export const CROSSBLOCK_SESSION_KEY = 'crossblock.session';

/** PLEASE FEED THE MOON uses an independent version-one records/settings profile.
 * sim/moon.js owns all game mutations. A step is 1/60 second; render/audio only read.
 * Input: {x,y,aimX,aimY,fire,dash,burp}; dash/burp are one-shot presses.
 * Phase: playing|upgrade|won|lost. Events: shot|pop|hurt|dash|pickup|feed|burp|
 * law|upgrade|boss|win|lose|badge|portal|reflect|block|blast|heal|boss-attack|overtime.
 * createMoonWorld(seed,{loadout,difficulty,mode}) normalizes configuration.
 * chooseMoonUpgrade validates phase and offer identity. continueMoonOvertime only
 * accepts a won free run. cycle increments difficulty; shift remains 1..4.
 * World owns moving moon, portals, telegraphed hazards, orbital shields and stats.
 * Live runs are ephemeral. Only settings, records, discoveries and badges persist.
 */
export const MOON = Object.freeze({ width: 1280, height: 640, x: 640, y: 300, radius: 80, step: 1 / 60, quotas: Object.freeze([8, 14, 20]), shiftTicks: 3000, maxEnemies: 44, maxShots: 240, maxDrops: 100 });
export const MOON_PROFILE_KEY = 'please-feed-the-moon.profile';
export const MOON_PROFILE_VERSION = 1;

/** HONK IF YOU'RE EMPLOYED is independent. Career profile v1 is a new namespace.
 * sim/honk.js owns mutations, seeded randomness, collisions and fixed 60 Hz time.
 * Input: {x,y,honk,dash,reply}; honk may be held, dash/reply are edge-triggered.
 * Phase: playing|promotion|won|lost. chooseHonkUpgrade validates phase and ID.
 * Chairs, meeting stamps, incidents, security charges, and boss stages use fixed ticks.
 * Mode career|casual; overtime counts optional post-victory shifts. continueHonkOvertime
 * validates a won run before advancing. Profile persists results/settings, never live worlds.
 * Events are transient presentation data; rendering/audio must never mutate state.
 */
export const HONK = Object.freeze({ width: 1200, height: 640, rate: 60, maxEnemies: 22, maxPapers: 100, maxStamps: 8, shiftTicks: Object.freeze([1800, 2100, 3300]) });
export const HONK_PROFILE_VERSION = 1;
export const HONK_PROFILE_KEY = 'honk.profile';

/** THE LAST LIGHT: independent runs; no writes to other games’ profiles.
 * Fixed 60 Hz. Simulation owns mutations; render/audio consume returned events.
 * stepLight(world, {moveX,moveY,aimX?,aimY?,manualAim?,dashPressed?,pulsePressed?}).
 * phase: playing|council|ending|won|lost; wave: 1..5; choice actions validate phase.
 * memories: {id,name,role,text,status:'kept'|'burned'|'released',reason?}[];
 * burning a memory never kills its person. field people become rescued or missed.
 * Event types: shot|hit|kill|hurt|dash|dash-hit|rescue|follow|pulse|burn|wave|council|end|notice
 * |repair|person-lost|promise-broken|beam-warning|boss-phase.
 * chooseLight(world,id), finishLight(world,'keep'|'release'), protectMemory(world,id).
 */
export const LIGHT = Object.freeze({ width: 1100, height: 740, hz: 60, waveTicks: 2700, finalTicks: 3300, waves: 5, beaconX: 550, beaconY: 370 });

/** Last Light profile v1 is an independent new namespace. Safe-point checkpoints
 * only: wave start, council, or final decision. Unknown/malformed versions are
 * preserved. Revisions prevent a stale tab from overwriting another run.
 * New world fields: promise, missing[], nights[], nightStart, journal[], sparks[],
 * beams[], seenKinds[]. Dash damage is limited to one hit per target per dash.
 * Warden capture is fixed-tick and stops on recruitment; boss beams telegraph
 * their locked angle before damage. History records contain facts, not morality.
 */
export const LIGHT_PROFILE_KEY = 'last-light.profile';
export const LIGHT_PROFILE_VERSION = 1;
export const LIGHT_CHECKPOINT_VERSION = 1;
