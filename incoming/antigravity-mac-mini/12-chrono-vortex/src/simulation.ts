import { CHRONO_CONFIG } from './config';
import {
  BumperElement,
  ENEMY_ARCHETYPES,
  EnemyArchetypeId,
  GOD_FORGE_RELICS,
  SECTORS,
  STRIKER_CHASSIS,
  StrikerChassisId,
} from './content';
import { createRng, nextFloat, nextInt, pickRandom, SeededRngState } from './rng';

export type ChronoGameStatus = 'PLAYING' | 'RELIC_DRAFT' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export interface EchoSample {
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  isDashing: boolean;
  isParrying: boolean;
}

export interface ChronoGhostEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  isDashing: boolean;
  isParrying: boolean;
  samples: EchoSample[];
  sampleIndex: number;
  sampleAccumulatorMs: number;
  remainingMs: number;
  maxDurationMs: number;
  boltCooldownMs: number;
}

export interface ArenaBumper {
  id: number;
  x: number;
  y: number;
  radius: number;
  element: BumperElement;
  label: string;
  pulseTimerMs: number;
  hitCount: number;
}

export interface EnemyEntity {
  id: number;
  type: EnemyArchetypeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  mass: number;
  facingAngle: number;
  fireTimerMs: number;
  knockbackTimerMs: number;
  burnTimerMs: number;
  chillTimerMs: number;
  flashTimerMs: number;
  bossPhase: 1 | 2 | 3;
  summonTimerMs: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isAllied: boolean;
  isHoming: boolean;
  pierceLeft: number;
  color: string;
  ttlMs: number;
  sourceName: string;
}

export interface ChronoSimulationEvent {
  type:
    | 'DASH_SLAM'
    | 'BUMPER_RICOCHET'
    | 'WALL_SLAM'
    | 'DOMINO_COLLISION'
    | 'PARRY_DEFLECT'
    | 'ECHO_SPAWNED'
    | 'OVERDRIVE_TRIGGERED'
    | 'ENEMY_SHATTERED'
    | 'PLAYER_DAMAGED'
    | 'BOSS_PHASE_SHIFT'
    | 'SECTOR_CLEARED'
    | 'RELIC_CLAIMED'
    | 'VICTORY'
    | 'GAME_OVER';
  x: number;
  y: number;
  text: string;
  color: string;
  intensity: number;
}

export interface CombatCausalLedger {
  kineticSlamDamage: number;
  bumperNovaDamage: number;
  parryAlchemyDamage: number;
  chronoEchoDamage: number;
  totalBankShots: number;
  totalParries: number;
  totalEchoesSpawned: number;
  totalWallSlams: number;
  lastDamageBy: string;
}

export interface ChronoPlayerState {
  chassisId: StrikerChassisId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  aimAngle: number;
  moveDirX: number;
  moveDirY: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  dashTimerMs: number;
  dashCooldownMs: number;
  parryTimerMs: number;
  parryCooldownMs: number;
  echoCooldownMs: number;
  invulnTimerMs: number;
  overdriveMeter: number;
  overdriveTimerMs: number;
  bouncesThisDash: number;
  baseDamageMultiplier: number;
}

export interface ChronoGameState {
  seed: number;
  rng: SeededRngState;
  status: ChronoGameStatus;
  sector: number;
  sectorKills: number;
  sectorTargetKills: number;
  totalKills: number;
  score: number;
  elapsedMs: number;
  comboCount: number;
  comboMultiplier: number;
  comboTimerMs: number;
  bestComboChain: number;
  hitStopMs: number;
  nextEntityId: number;
  player: ChronoPlayerState;
  echoHistory: EchoSample[];
  echoRecordTimerMs: number;
  ghosts: ChronoGhostEntity[];
  bumpers: ArenaBumper[];
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  relicIds: string[];
  draftOptions: string[];
  spawnTimerMs: number;
  overdriveBoltTimerMs: number;
  ledger: CombatCausalLedger;
  events: ChronoSimulationEvent[];
}

export type ChronoInputAction =
  | { type: 'SET_MOVE'; dx: number; dy: number }
  | { type: 'SET_AIM'; worldX: number; worldY: number }
  | { type: 'DASH_STRIKE'; targetX?: number; targetY?: number }
  | { type: 'PULSE_PARRY' }
  | { type: 'SPAWN_ECHO'; rewindPlayer?: boolean }
  | { type: 'ACTIVATE_OVERDRIVE' }
  | { type: 'SELECT_RELIC'; relicId: string }
  | { type: 'SACRIFICE_RELIC_FOR_UPGRADE' }
  | { type: 'SWITCH_CHASSIS'; chassisId: StrikerChassisId }
  | { type: 'TOGGLE_PAUSE' };

export function getChassisDef(chassisId: StrikerChassisId) {
  return STRIKER_CHASSIS.find((c) => c.id === chassisId) ?? STRIKER_CHASSIS[0];
}

export function getSectorDef(sector: number) {
  const idx = Math.max(0, Math.min(SECTORS.length - 1, sector - 1));
  return SECTORS[idx];
}

export function hasRelic(state: ChronoGameState, relicId: string): boolean {
  return state.relicIds.includes(relicId);
}

function pushEvent(
  state: ChronoGameState,
  type: ChronoSimulationEvent['type'],
  x: number,
  y: number,
  text: string,
  color: string,
  intensity = 1
): void {
  state.events.push({ type, x, y, text, color, intensity });
}

function buildSectorBumpers(sector: number): ArenaBumper[] {
  const def = getSectorDef(sector);
  return def.bumpers.map((b, idx) => ({
    id: idx + 1,
    x: CHRONO_CONFIG.ARENA_CENTER_X + b.xOffset,
    y: CHRONO_CONFIG.ARENA_CENTER_Y + b.yOffset,
    radius: b.radius,
    element: b.element,
    label: b.label,
    pulseTimerMs: 0,
    hitCount: 0,
  }));
}

export function createInitialChronoState(
  seed: number = CHRONO_CONFIG.DEFAULT_SEED,
  chassisId: StrikerChassisId = 'vanguard-g'
): ChronoGameState {
  const rng = createRng(seed);
  const chassis = getChassisDef(chassisId);
  const sectorDef = getSectorDef(1);

  const state: ChronoGameState = {
    seed: rng.seed,
    rng,
    status: 'PLAYING',
    sector: 1,
    sectorKills: 0,
    sectorTargetKills: sectorDef.targetKills,
    totalKills: 0,
    score: 0,
    elapsedMs: 0,
    comboCount: 0,
    comboMultiplier: 1,
    comboTimerMs: 0,
    bestComboChain: 0,
    hitStopMs: 0,
    nextEntityId: 100,
    player: {
      chassisId: chassis.id,
      x: CHRONO_CONFIG.ARENA_CENTER_X,
      y: CHRONO_CONFIG.ARENA_CENTER_Y + 125,
      vx: 0,
      vy: 0,
      radius: CHRONO_CONFIG.PLAYER_BASE_RADIUS,
      aimAngle: -Math.PI / 2,
      moveDirX: 0,
      moveDirY: 0,
      hp: chassis.maxHp,
      maxHp: chassis.maxHp,
      stamina: 100,
      maxStamina: 100,
      dashTimerMs: 0,
      dashCooldownMs: 0,
      parryTimerMs: 0,
      parryCooldownMs: 0,
      echoCooldownMs: 0,
      invulnTimerMs: 0,
      overdriveMeter: 25,
      overdriveTimerMs: 0,
      bouncesThisDash: 0,
      baseDamageMultiplier: 1.0,
    },
    echoHistory: [],
    echoRecordTimerMs: 0,
    ghosts: [],
    bumpers: buildSectorBumpers(1),
    enemies: [],
    projectiles: [],
    relicIds: [],
    draftOptions: [],
    spawnTimerMs: 400,
    overdriveBoltTimerMs: 0,
    ledger: {
      kineticSlamDamage: 0,
      bumperNovaDamage: 0,
      parryAlchemyDamage: 0,
      chronoEchoDamage: 0,
      totalBankShots: 0,
      totalParries: 0,
      totalEchoesSpawned: 0,
      totalWallSlams: 0,
      lastDamageBy: 'None',
    },
    events: [],
  };

  // Seed initial echo samples so player can immediately test Chrono-Echo on frame 1!
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    state.echoHistory.push({
      x: CHRONO_CONFIG.ARENA_CENTER_X + Math.cos(angle) * 65,
      y: CHRONO_CONFIG.ARENA_CENTER_Y + Math.sin(angle) * 65,
      vx: -Math.sin(angle) * 260,
      vy: Math.cos(angle) * 260,
      aimAngle: angle + Math.PI / 2,
      isDashing: i % 6 === 0,
      isParrying: i % 10 === 0,
    });
  }

  // Spawn initial wave of 3 enemies so the arena is immediately alive and playable in < 2 seconds
  spawnSectorEnemy(state, 'gear-hound', CHRONO_CONFIG.ARENA_CENTER_X - 90, CHRONO_CONFIG.ARENA_CENTER_Y - 110);
  spawnSectorEnemy(state, 'gear-hound', CHRONO_CONFIG.ARENA_CENTER_X + 90, CHRONO_CONFIG.ARENA_CENTER_Y - 110);
  spawnSectorEnemy(state, 'prism-sniper', CHRONO_CONFIG.ARENA_CENTER_X, CHRONO_CONFIG.ARENA_CENTER_Y - 165);

  return state;
}

export function cloneChronoState(state: ChronoGameState): ChronoGameState {
  return structuredClone(state);
}

export function spawnSectorEnemy(
  state: ChronoGameState,
  forcedType?: EnemyArchetypeId,
  forcedX?: number,
  forcedY?: number
): EnemyEntity {
  const sectorDef = getSectorDef(state.sector);
  let chosenType: EnemyArchetypeId = forcedType ?? 'gear-hound';

  if (!forcedType) {
    const totalWeight = sectorDef.enemyWeights.reduce((acc, w) => acc + w.weight, 0);
    let roll = nextFloat(state.rng, 0, totalWeight);
    for (const entry of sectorDef.enemyWeights) {
      roll -= entry.weight;
      if (roll <= 0) {
        chosenType = entry.type;
        break;
      }
    }
  }

  const arch = ENEMY_ARCHETYPES[chosenType];
  let x = forcedX;
  let y = forcedY;

  if (x === undefined || y === undefined) {
    const spawnAngle = nextFloat(state.rng, 0, Math.PI * 2);
    const spawnDist = nextFloat(state.rng, 145, CHRONO_CONFIG.ARENA_RADIUS - 36);
    x = CHRONO_CONFIG.ARENA_CENTER_X + Math.cos(spawnAngle) * spawnDist;
    y = CHRONO_CONFIG.ARENA_CENTER_Y + Math.sin(spawnAngle) * spawnDist;

    // Ensure not spawning directly on top of player
    const dx = x - state.player.x;
    const dy = y - state.player.y;
    if (Math.hypot(dx, dy) < 95) {
      x = CHRONO_CONFIG.ARENA_CENTER_X - Math.cos(spawnAngle) * spawnDist;
      y = CHRONO_CONFIG.ARENA_CENTER_Y - Math.sin(spawnAngle) * spawnDist;
    }
  }

  const sectorHpScale = 1 + (state.sector - 1) * 0.14;
  const maxHp = Math.round(arch.baseHp * sectorHpScale);

  const enemy: EnemyEntity = {
    id: state.nextEntityId++,
    type: chosenType,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: arch.radius,
    hp: maxHp,
    maxHp,
    mass: arch.mass,
    facingAngle: Math.atan2(state.player.y - y, state.player.x - x),
    fireTimerMs: arch.fireCooldownMs > 0 ? nextFloat(state.rng, 700, arch.fireCooldownMs) : 0,
    knockbackTimerMs: 0,
    burnTimerMs: 0,
    chillTimerMs: 0,
    flashTimerMs: 0,
    bossPhase: 1,
    summonTimerMs: 4200,
  };

  state.enemies.push(enemy);
  return enemy;
}

function addCombo(state: ChronoGameState, amount: number, x: number, y: number): void {
  state.comboCount += amount;
  state.comboTimerMs = CHRONO_CONFIG.COMBO_DECAY_MS;
  if (state.comboCount > state.bestComboChain) {
    state.bestComboChain = state.comboCount;
  }
  if (state.comboCount >= 18) {
    state.comboMultiplier = 16;
  } else if (state.comboCount >= 11) {
    state.comboMultiplier = 8;
  } else if (state.comboCount >= 6) {
    state.comboMultiplier = 4;
  } else if (state.comboCount >= 2) {
    state.comboMultiplier = 2;
  } else {
    state.comboMultiplier = 1;
  }

  state.player.overdriveMeter = Math.min(
    CHRONO_CONFIG.OVERDRIVE_MAX,
    state.player.overdriveMeter + amount * 4.5
  );

  if (
    state.player.overdriveMeter >= CHRONO_CONFIG.OVERDRIVE_MAX &&
    state.player.overdriveTimerMs <= 0
  ) {
    triggerOverdrive(state, x, y);
  }
}

function triggerOverdrive(state: ChronoGameState, x: number, y: number): void {
  state.player.overdriveMeter = 0;
  state.player.overdriveTimerMs = CHRONO_CONFIG.OVERDRIVE_DURATION_MS;
  state.player.stamina = state.player.maxStamina;
  pushEvent(
    state,
    'OVERDRIVE_TRIGGERED',
    x,
    y,
    '⚡ GOD-FORGE OVERDRIVE UNLEASHED! ⚡',
    '#fde047',
    2.0
  );
}

function spawnAlliedHomingBolt(
  state: ChronoGameState,
  x: number,
  y: number,
  angle: number,
  baseDamage: number,
  sourceTag: 'PARRY' | 'ECHO' | 'KINETIC'
): void {
  const pierce = hasRelic(state, 'philosophers-ricochet') ? 2 : 1;
  const dmgBoost =
    sourceTag === 'PARRY' && hasRelic(state, 'philosophers-ricochet') ? 1.75 : 1.0;
  const speed = 440;
  state.projectiles.push({
    id: state.nextEntityId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 7,
    damage: Math.round(baseDamage * dmgBoost * state.player.baseDamageMultiplier),
    isAllied: true,
    isHoming: true,
    pierceLeft: pierce,
    color: sourceTag === 'PARRY' ? '#2dd4bf' : sourceTag === 'ECHO' ? '#38bdf8' : '#fde047',
    ttlMs: 2600,
    sourceName: sourceTag,
  });
}

function damageEnemy(
  state: ChronoGameState,
  enemy: EnemyEntity,
  rawDamage: number,
  sourceCategory: 'KINETIC' | 'BUMPER' | 'PARRY' | 'ECHO',
  label?: string
): void {
  if (enemy.hp <= 0) return;

  let multiplier = state.player.baseDamageMultiplier * (1 + (state.comboMultiplier - 1) * 0.18);
  if (state.player.overdriveTimerMs > 0) {
    multiplier *= 1.35;
  }
  if (hasRelic(state, 'god-forge-crown')) {
    multiplier *= 1.2;
  }
  if (enemy.chillTimerMs > 0 && hasRelic(state, 'absolute-zero-lens')) {
    multiplier *= 1.4;
  }

  const finalDamage = Math.max(1, Math.round(rawDamage * multiplier));
  enemy.hp -= finalDamage;
  enemy.flashTimerMs = 130;

  if (sourceCategory === 'KINETIC') state.ledger.kineticSlamDamage += finalDamage;
  else if (sourceCategory === 'BUMPER') state.ledger.bumperNovaDamage += finalDamage;
  else if (sourceCategory === 'PARRY') state.ledger.parryAlchemyDamage += finalDamage;
  else if (sourceCategory === 'ECHO') state.ledger.chronoEchoDamage += finalDamage;

  if (label) {
    pushEvent(
      state,
      sourceCategory === 'BUMPER' ? 'BUMPER_RICOCHET' : 'DASH_SLAM',
      enemy.x,
      enemy.y - enemy.radius,
      `${label} -${finalDamage}`,
      sourceCategory === 'BUMPER'
        ? '#fde047'
        : sourceCategory === 'PARRY'
        ? '#2dd4bf'
        : sourceCategory === 'ECHO'
        ? '#38bdf8'
        : '#fb923c',
      1.1
    );
  }

  // Check Kronos-Omega Boss Phase transitions
  if (enemy.type === 'kronos-omega' && enemy.hp > 0) {
    const hpRatio = enemy.hp / enemy.maxHp;
    if (hpRatio <= 0.66 && enemy.bossPhase === 1) {
      enemy.bossPhase = 2;
      pushEvent(
        state,
        'BOSS_PHASE_SHIFT',
        enemy.x,
        enemy.y,
        '⚠️ KRONOS PHASE II: SINGULARITY OVERCLOCK!',
        '#f43f5e',
        2.0
      );
      spawnSectorEnemy(state, 'gear-hound');
      spawnSectorEnemy(state, 'prism-sniper');
    } else if (hpRatio <= 0.33 && enemy.bossPhase === 2) {
      enemy.bossPhase = 3;
      pushEvent(
        state,
        'BOSS_PHASE_SHIFT',
        enemy.x,
        enemy.y,
        '🔥 KRONOS PHASE III: ETERNITY SUPERNOVA!',
        '#fde047',
        2.4
      );
      spawnSectorEnemy(state, 'gear-hound');
      spawnSectorEnemy(state, 'chrono-warden');
    }
  }

  if (enemy.hp <= 0) {
    handleEnemyDefeated(state, enemy);
  }
}

function handleEnemyDefeated(state: ChronoGameState, enemy: EnemyEntity): void {
  const arch = ENEMY_ARCHETYPES[enemy.type];
  const scoreGain = arch.scoreValue * state.comboMultiplier;
  state.score += scoreGain;
  state.totalKills += 1;

  if (enemy.type === 'kronos-omega') {
    state.sectorKills = state.sectorTargetKills;
  } else if (!getSectorDef(state.sector).isBossSector) {
    state.sectorKills += 1;
  }

  state.hitStopMs = Math.max(state.hitStopMs, enemy.type === 'kronos-omega' ? 140 : 32);

  pushEvent(
    state,
    'ENEMY_SHATTERED',
    enemy.x,
    enemy.y,
    `💥 ${arch.name.split(' ')[0]} SHATTERED! +${scoreGain}`,
    arch.outlineColor,
    enemy.type === 'kronos-omega' ? 2.5 : 1.35
  );

  // Vampiric Gyroscope healing on 4x+ combo
  if (hasRelic(state, 'vampiric-gyroscope') && state.comboMultiplier >= 4) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 5);
    state.player.overdriveMeter = Math.min(
      CHRONO_CONFIG.OVERDRIVE_MAX,
      state.player.overdriveMeter + 12
    );
  }

  // Supernova Crucible death explosion for burning enemies
  if (enemy.burnTimerMs > 0 && hasRelic(state, 'supernova-crucible')) {
    for (const other of state.enemies) {
      if (other.id !== enemy.id && other.hp > 0) {
        const d = Math.hypot(other.x - enemy.x, other.y - enemy.y);
        if (d <= 115) {
          damageEnemy(state, other, 28, 'BUMPER', 'IGNITE NOVA');
        }
      }
    }
  }

  // Arc-Weaver discharges chain lightning on death
  if (enemy.type === 'arc-weaver') {
    for (const other of state.enemies) {
      if (other.id !== enemy.id && other.hp > 0) {
        const d = Math.hypot(other.x - enemy.x, other.y - enemy.y);
        if (d <= 125) {
          damageEnemy(state, other, 22, 'KINETIC', 'ARC DISCHARGE');
        }
      }
    }
  }
}

function triggerBumperResonance(
  state: ChronoGameState,
  bumper: ArenaBumper,
  triggerSource: 'PLAYER' | 'GHOST' | 'ENEMY'
): void {
  bumper.pulseTimerMs = 340;
  bumper.hitCount += 1;
  state.ledger.totalBankShots += 1;
  state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + 16);

  addCombo(state, 1, bumper.x, bumper.y);

  const novaRadius = hasRelic(state, 'celestial-bumper-spurs') ? 138 : 108;
  const baseNovaDmg =
    (triggerSource === 'ENEMY' ? 28 : 20) *
    (hasRelic(state, 'celestial-bumper-spurs') ? 1.55 : 1.0);

  const colorMap: Record<BumperElement, string> = {
    SOLAR: '#f59e0b',
    CRYO: '#06b6d4',
    ARC: '#2dd4bf',
    VOID: '#a855f7',
  };

  pushEvent(
    state,
    'BUMPER_RICOCHET',
    bumper.x,
    bumper.y,
    `${bumper.element} BANK ${state.comboMultiplier}x!`,
    colorMap[bumper.element],
    1.25
  );

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dist = Math.hypot(enemy.x - bumper.x, enemy.y - bumper.y);
    if (dist <= novaRadius + enemy.radius) {
      if (bumper.element === 'SOLAR') {
        enemy.burnTimerMs = 3000;
      } else if (bumper.element === 'CRYO') {
        enemy.chillTimerMs = 3500;
      } else if (bumper.element === 'VOID') {
        // Pull enemy toward the bumper center for pinball clusters!
        const angleToBumper = Math.atan2(bumper.y - enemy.y, bumper.x - enemy.x);
        enemy.vx += Math.cos(angleToBumper) * 190;
        enemy.vy += Math.sin(angleToBumper) * 190;
      } else if (bumper.element === 'ARC') {
        enemy.knockbackTimerMs = Math.max(enemy.knockbackTimerMs, 260);
      }
      damageEnemy(state, enemy, baseNovaDmg, 'BUMPER', `${bumper.element} PULSE`);
    }
  }
}

export function triggerPulseParry(
  state: ChronoGameState,
  originX: number,
  originY: number,
  isFromEcho = false
): number {
  const chassis = getChassisDef(state.player.chassisId);
  const relicScale = hasRelic(state, 'mirror-aegis-capacitor') ? 1.35 : 1.0;
  const parryRadius = CHRONO_CONFIG.PARRY_RADIUS * chassis.parryRadiusMultiplier * relicScale;

  let convertedCount = 0;

  for (const proj of state.projectiles) {
    if (proj.isAllied) continue;
    const dist = Math.hypot(proj.x - originX, proj.y - originY);
    if (dist <= parryRadius + proj.radius) {
      proj.isAllied = true;
      proj.isHoming = true;
      proj.color = '#2dd4bf';
      proj.ttlMs = 2800;
      proj.pierceLeft = hasRelic(state, 'philosophers-ricochet') ? 2 : 1;
      const boost = hasRelic(state, 'philosophers-ricochet') ? 1.75 : 1.25;
      proj.damage = Math.round(proj.damage * 2.4 * boost * state.player.baseDamageMultiplier);
      proj.vx = -proj.vx * 1.45;
      proj.vy = -proj.vy * 1.45;
      convertedCount += 1;

      if (state.player.chassisId === 'prism-9') {
        const baseAngle = Math.atan2(proj.vy, proj.vx);
        spawnAlliedHomingBolt(state, proj.x, proj.y, baseAngle + 0.35, 24, 'PARRY');
      }
    }
  }

  // Also knock back adjacent enemies slightly on parry pulse
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const dx = enemy.x - originX;
    const dy = enemy.y - originY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist <= parryRadius + enemy.radius) {
      const nx = dx / dist;
      const ny = dy / dist;
      enemy.vx += nx * (260 / enemy.mass);
      enemy.vy += ny * (260 / enemy.mass);
      enemy.knockbackTimerMs = Math.max(enemy.knockbackTimerMs, 350);
    }
  }

  if (convertedCount > 0) {
    state.ledger.totalParries += convertedCount;
    addCombo(state, convertedCount, originX, originY);
    applyParryScoreBonus(state, convertedCount);
    if (hasRelic(state, 'mirror-aegis-capacitor')) {
      state.player.dashCooldownMs = 0;
      state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + 25);
    }
    pushEvent(
      state,
      'PARRY_DEFLECT',
      originX,
      originY,
      `🛡️ ALCHEMY PARRY x${convertedCount}!`,
      '#2dd4bf',
      1.5
    );
  } else if (!isFromEcho) {
    pushEvent(state, 'PARRY_DEFLECT', originX, originY, 'PULSE AEGIS', '#38bdf8', 0.8);
  }

  return convertedCount;
}

function applyParryScoreBonus(state: ChronoGameState, count: number): void {
  state.score += count * 95 * state.comboMultiplier;
}

export function applyChronoInput(state: ChronoGameState, action: ChronoInputAction): void {
  if (action.type === 'TOGGLE_PAUSE') {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING';
    }
    return;
  }

  if (action.type === 'SWITCH_CHASSIS') {
    const chassis = getChassisDef(action.chassisId);
    state.player.chassisId = chassis.id;
    const hpRatio = state.player.hp / Math.max(1, state.player.maxHp);
    state.player.maxHp =
      chassis.maxHp + (hasRelic(state, 'god-forge-crown') ? 35 : 0);
    state.player.hp = Math.max(1, Math.round(state.player.maxHp * hpRatio));
    return;
  }

  if (state.status === 'RELIC_DRAFT') {
    if (action.type === 'SELECT_RELIC') {
      const chosen =
        state.draftOptions.find((id) => id === action.relicId) ?? state.draftOptions[0];
      if (chosen && !state.relicIds.includes(chosen)) {
        state.relicIds.push(chosen);
        const relicDef = GOD_FORGE_RELICS.find((r) => r.id === chosen);
        if (chosen === 'god-forge-crown') {
          state.player.maxHp += 35;
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 35);
        }
        pushEvent(
          state,
          'RELIC_CLAIMED',
          state.player.x,
          state.player.y,
          `✨ RELIC FORGED: ${relicDef?.name ?? chosen}!`,
          relicDef?.color ?? '#fde047',
          1.6
        );
      }
      advanceToNextSector(state);
    } else if (action.type === 'SACRIFICE_RELIC_FOR_UPGRADE') {
      state.player.maxHp += 25;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 40);
      state.player.baseDamageMultiplier = Number(
        (state.player.baseDamageMultiplier + 0.15).toFixed(2)
      );
      pushEvent(
        state,
        'RELIC_CLAIMED',
        state.player.x,
        state.player.y,
        '🔨 ANVIL SMELT: +25 MAX HP & +15% BASE POWER!',
        '#f59e0b',
        1.6
      );
      advanceToNextSector(state);
    }
    return;
  }

  if (state.status !== 'PLAYING') return;

  const { player } = state;

  switch (action.type) {
    case 'SET_MOVE': {
      const mag = Math.hypot(action.dx, action.dy);
      if (mag > 0.001) {
        player.moveDirX = action.dx / mag;
        player.moveDirY = action.dy / mag;
      } else {
        player.moveDirX = 0;
        player.moveDirY = 0;
      }
      break;
    }

    case 'SET_AIM': {
      const dx = action.worldX - player.x;
      const dy = action.worldY - player.y;
      if (Math.hypot(dx, dy) > 2) {
        player.aimAngle = Math.atan2(dy, dx);
      }
      break;
    }

    case 'DASH_STRIKE': {
      if (player.dashCooldownMs > 0 || player.stamina < CHRONO_CONFIG.DASH_STAMINA_COST) {
        return;
      }
      if (typeof action.targetX === 'number' && typeof action.targetY === 'number') {
        const dx = action.targetX - player.x;
        const dy = action.targetY - player.y;
        if (Math.hypot(dx, dy) > 2) {
          player.aimAngle = Math.atan2(dy, dx);
        }
      } else if (Math.hypot(player.moveDirX, player.moveDirY) > 0.1) {
        player.aimAngle = Math.atan2(player.moveDirY, player.moveDirX);
      }

      player.stamina = Math.max(0, player.stamina - CHRONO_CONFIG.DASH_STAMINA_COST);
      player.dashTimerMs = CHRONO_CONFIG.DASH_DURATION_MS;
      player.dashCooldownMs = CHRONO_CONFIG.DASH_COOLDOWN_MS;
      player.invulnTimerMs = Math.max(player.invulnTimerMs, 200);
      player.bouncesThisDash = 0;

      const chassis = getChassisDef(player.chassisId);
      const dashVel = CHRONO_CONFIG.DASH_SPEED * chassis.speedMultiplier;
      player.vx = Math.cos(player.aimAngle) * dashVel;
      player.vy = Math.sin(player.aimAngle) * dashVel;

      // Vanguard-G signature passive: radial seismic wave on dash launch
      if (player.chassisId === 'vanguard-g') {
        for (const enemy of state.enemies) {
          if (enemy.hp <= 0) continue;
          const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (dist <= 95 + enemy.radius) {
            const ang = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            enemy.vx += Math.cos(ang) * 280;
            enemy.vy += Math.sin(ang) * 280;
            enemy.knockbackTimerMs = Math.max(enemy.knockbackTimerMs, 350);
            damageEnemy(state, enemy, 18, 'KINETIC', 'TITAN TREMOR');
          }
        }
      }

      pushEvent(state, 'DASH_SLAM', player.x, player.y, 'KINETIC DASH!', chassis.color, 1.0);
      break;
    }

    case 'PULSE_PARRY': {
      if (player.parryCooldownMs > 0) return;
      player.parryTimerMs = CHRONO_CONFIG.PARRY_DURATION_MS;
      player.parryCooldownMs = CHRONO_CONFIG.PARRY_COOLDOWN_MS;
      const count = triggerPulseParry(state, player.x, player.y, false);
      if (count > 0) {
        applyParryScoreBonus(state, count);
      }
      break;
    }

    case 'SPAWN_ECHO': {
      if (player.echoCooldownMs > 0 || state.echoHistory.length === 0) return;

      const chassis = getChassisDef(player.chassisId);
      const cooldownScale =
        (player.chassisId === 'phantom-x' ? 0.75 : 1.0) *
        (hasRelic(state, 'trinity-timeline-loom') ? 0.65 : 1.0);
      player.echoCooldownMs = Math.round(CHRONO_CONFIG.ECHO_COOLDOWN_MS * cooldownScale);

      const extraDurationMs = hasRelic(state, 'mobius-tape-spool') ? 2000 : 0;
      const totalDurationMs =
        Math.round(CHRONO_CONFIG.ECHO_DURATION_MS * chassis.echoDurationMultiplier) +
        extraDurationMs;

      const recordedSamples = state.echoHistory.map((s) => ({ ...s }));
      const firstSample = recordedSamples[0];

      if (state.ghosts.length >= CHRONO_CONFIG.ECHO_MAX_ACTIVE) {
        state.ghosts.shift();
      }

      const ghost: ChronoGhostEntity = {
        id: state.nextEntityId++,
        x: firstSample.x,
        y: firstSample.y,
        vx: firstSample.vx,
        vy: firstSample.vy,
        aimAngle: firstSample.aimAngle,
        isDashing: true,
        isParrying: firstSample.isParrying,
        samples: recordedSamples,
        sampleIndex: 0,
        sampleAccumulatorMs: 0,
        remainingMs: totalDurationMs,
        maxDurationMs: totalDurationMs,
        boltCooldownMs: 600,
      };

      state.ghosts.push(ghost);
      state.ledger.totalEchoesSpawned += 1;

      if (action.rewindPlayer && recordedSamples.length > 2) {
        const anchor = recordedSamples[0];
        player.x = anchor.x;
        player.y = anchor.y;
        player.vx = anchor.vx;
        player.vy = anchor.vy;
        player.invulnTimerMs = Math.max(player.invulnTimerMs, 350);
      }

      if (hasRelic(state, 'paradox-rewind-anchor')) {
        player.hp = Math.min(player.maxHp, player.hp + 12);
        const c1 = triggerPulseParry(state, player.x, player.y, true);
        const c2 = triggerPulseParry(state, ghost.x, ghost.y, true);
        if (c1 + c2 > 0) applyParryScoreBonus(state, c1 + c2);
      }

      pushEvent(
        state,
        'ECHO_SPAWNED',
        ghost.x,
        ghost.y,
        action.rewindPlayer ? '⏪ TIMELINE REWIND & FORK!' : '⏳ CHRONO-GHOST DEPLOYED!',
        '#38bdf8',
        1.4
      );
      break;
    }

    case 'ACTIVATE_OVERDRIVE': {
      if (player.overdriveMeter >= 50 && player.overdriveTimerMs <= 0) {
        triggerOverdrive(state, player.x, player.y);
      }
      break;
    }
  }
}

function advanceToNextSector(state: ChronoGameState): void {
  state.sector += 1;
  state.sectorKills = 0;
  const sectorDef = getSectorDef(state.sector);
  state.sectorTargetKills = sectorDef.targetKills;
  state.status = 'PLAYING';
  state.enemies = [];
  state.projectiles = [];
  state.bumpers = buildSectorBumpers(state.sector);
  state.player.x = CHRONO_CONFIG.ARENA_CENTER_X;
  state.player.y = CHRONO_CONFIG.ARENA_CENTER_Y + 135;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 20);
  state.player.stamina = state.player.maxStamina;

  if (sectorDef.isBossSector) {
    spawnSectorEnemy(
      state,
      'kronos-omega',
      CHRONO_CONFIG.ARENA_CENTER_X,
      CHRONO_CONFIG.ARENA_CENTER_Y - 110
    );
    spawnSectorEnemy(
      state,
      'gear-hound',
      CHRONO_CONFIG.ARENA_CENTER_X - 110,
      CHRONO_CONFIG.ARENA_CENTER_Y - 40
    );
    spawnSectorEnemy(
      state,
      'gear-hound',
      CHRONO_CONFIG.ARENA_CENTER_X + 110,
      CHRONO_CONFIG.ARENA_CENTER_Y - 40
    );
  } else {
    spawnSectorEnemy(state);
    spawnSectorEnemy(state);
    spawnSectorEnemy(state);
  }
}

function openRelicDraftOrVictory(state: ChronoGameState): void {
  if (state.sector >= CHRONO_CONFIG.MAX_SECTORS) {
    state.status = 'VICTORY';
    state.score += 2500 + state.player.hp * 20;
    pushEvent(
      state,
      'VICTORY',
      state.player.x,
      state.player.y,
      '👑 KRONOS-OMEGA SHATTERED! ETERNITY CONQUERED!',
      '#fde047',
      3.0
    );
    return;
  }

  state.status = 'RELIC_DRAFT';
  const unowned = GOD_FORGE_RELICS.filter((r) => !state.relicIds.includes(r.id));
  const pool = unowned.length >= 3 ? [...unowned] : [...GOD_FORGE_RELICS];
  const picks: string[] = [];
  while (picks.length < 3 && pool.length > 0) {
    const idx = nextInt(state.rng, 0, pool.length - 1);
    picks.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  state.draftOptions = picks;
  pushEvent(
    state,
    'SECTOR_CLEARED',
    state.player.x,
    state.player.y,
    `🏆 SECTOR ${state.sector} CLEARED! CHOOSE A GOD-FORGE RELIC!`,
    '#fde047',
    2.0
  );
}

function registerPinballBounceOnPlayer(state: ChronoGameState): void {
  const { player } = state;
  if (player.dashTimerMs > 0 || Math.hypot(player.vx, player.vy) > 250) {
    player.bouncesThisDash += 1;
    player.dashTimerMs = Math.min(240, player.dashTimerMs + 95);
    if (hasRelic(state, 'pinball-overdrive-core') && player.bouncesThisDash % 3 === 0) {
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        spawnAlliedHomingBolt(state, player.x, player.y, ang, 22, 'KINETIC');
      }
    }
  }
}

export function stepChronoState(state: ChronoGameState, dtMs: number): void {
  if (state.status !== 'PLAYING') return;

  if (state.hitStopMs > 0) {
    state.hitStopMs = Math.max(0, state.hitStopMs - dtMs);
    return;
  }

  const dtSec = dtMs / 1000;
  state.elapsedMs += dtMs;

  const { player } = state;
  const chassis = getChassisDef(player.chassisId);
  const sectorDef = getSectorDef(state.sector);

  // 1. Update timers & resources
  player.dashTimerMs = Math.max(0, player.dashTimerMs - dtMs);
  player.dashCooldownMs = Math.max(0, player.dashCooldownMs - dtMs);
  player.parryTimerMs = Math.max(0, player.parryTimerMs - dtMs);
  player.parryCooldownMs = Math.max(0, player.parryCooldownMs - dtMs);
  player.echoCooldownMs = Math.max(0, player.echoCooldownMs - dtMs);
  player.invulnTimerMs = Math.max(0, player.invulnTimerMs - dtMs);

  const staminaRegenRate = player.overdriveTimerMs > 0 ? 55 : 26;
  player.stamina = Math.min(player.maxStamina, player.stamina + staminaRegenRate * dtSec);

  if (player.overdriveTimerMs > 0) {
    player.overdriveTimerMs = Math.max(0, player.overdriveTimerMs - dtMs);
    state.overdriveBoltTimerMs -= dtMs;
    if (state.overdriveBoltTimerMs <= 0) {
      state.overdriveBoltTimerMs = hasRelic(state, 'god-forge-crown') ? 320 : 520;
      spawnAlliedHomingBolt(state, player.x, player.y, player.aimAngle, 26, 'KINETIC');
    }
  }

  if (state.comboTimerMs > 0) {
    state.comboTimerMs = Math.max(0, state.comboTimerMs - dtMs);
    if (state.comboTimerMs === 0) {
      state.comboCount = 0;
      state.comboMultiplier = 1;
    }
  }

  // 2. Record Chrono-Tape sample
  state.echoRecordTimerMs += dtMs;
  if (state.echoRecordTimerMs >= CHRONO_CONFIG.ECHO_RECORD_INTERVAL_MS) {
    state.echoRecordTimerMs = 0;
    state.echoHistory.push({
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      aimAngle: player.aimAngle,
      isDashing: player.dashTimerMs > 0,
      isParrying: player.parryTimerMs > 0,
    });
    if (state.echoHistory.length > CHRONO_CONFIG.ECHO_MAX_SAMPLES) {
      state.echoHistory.shift();
    }
  }

  // 3. Player locomotion & arena physics
  if (player.dashTimerMs <= 0) {
    const moveSpeed =
      CHRONO_CONFIG.PLAYER_BASE_SPEED *
      chassis.speedMultiplier *
      (player.overdriveTimerMs > 0 ? 1.22 : 1.0);
    const accel = 1850 * dtSec;
    if (Math.hypot(player.moveDirX, player.moveDirY) > 0.05) {
      player.vx += player.moveDirX * accel;
      player.vy += player.moveDirY * accel;
      const speedMag = Math.hypot(player.vx, player.vy);
      if (speedMag > moveSpeed) {
        player.vx = (player.vx / speedMag) * moveSpeed;
        player.vy = (player.vy / speedMag) * moveSpeed;
      }
    } else {
      player.vx *= Math.pow(CHRONO_CONFIG.PLAYER_FRICTION, dtMs / 16.67);
      player.vy *= Math.pow(CHRONO_CONFIG.PLAYER_FRICTION, dtMs / 16.67);
    }
  }

  // Subtle gravity well pull in sectors with singularity
  if (sectorDef.gravityWellStrength > 0) {
    const gx = CHRONO_CONFIG.ARENA_CENTER_X - player.x;
    const gy = CHRONO_CONFIG.ARENA_CENTER_Y - player.y;
    const gDist = Math.max(45, Math.hypot(gx, gy));
    player.vx += (gx / gDist) * sectorDef.gravityWellStrength * dtSec;
    player.vy += (gy / gDist) * sectorDef.gravityWellStrength * dtSec;
  }

  player.x += player.vx * dtSec;
  player.y += player.vy * dtSec;

  // Player collision with outer Crucible boundary (elastic pinball wall bounce!)
  const distFromCenter = Math.hypot(
    player.x - CHRONO_CONFIG.ARENA_CENTER_X,
    player.y - CHRONO_CONFIG.ARENA_CENTER_Y
  );
  const maxPlayerDist = CHRONO_CONFIG.ARENA_RADIUS - player.radius;
  if (distFromCenter > maxPlayerDist) {
    const nx = (player.x - CHRONO_CONFIG.ARENA_CENTER_X) / distFromCenter;
    const ny = (player.y - CHRONO_CONFIG.ARENA_CENTER_Y) / distFromCenter;
    player.x = CHRONO_CONFIG.ARENA_CENTER_X + nx * maxPlayerDist;
    player.y = CHRONO_CONFIG.ARENA_CENTER_Y + ny * maxPlayerDist;

    const dot = player.vx * nx + player.vy * ny;
    if (dot > 0) {
      player.vx = (player.vx - 2 * dot * nx) * CHRONO_CONFIG.PLAYER_BOUNCE_RESTITUTION;
      player.vy = (player.vy - 2 * dot * ny) * CHRONO_CONFIG.PLAYER_BOUNCE_RESTITUTION;
      registerPinballBounceOnPlayer(state);
    }
  }

  // 4. Player collision with Arena Bumpers
  for (const bumper of state.bumpers) {
    if (bumper.pulseTimerMs > 0) {
      bumper.pulseTimerMs = Math.max(0, bumper.pulseTimerMs - dtMs);
    }
    const dx = player.x - bumper.x;
    const dy = player.y - bumper.y;
    const dist = Math.hypot(dx, dy);
    const minDist = player.radius + bumper.radius;
    if (dist < minDist && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      player.x = bumper.x + nx * (minDist + 2);
      player.y = bumper.y + ny * (minDist + 2);

      const spurBoost = hasRelic(state, 'celestial-bumper-spurs') ? 1.45 : 1.0;
      const bounceSpeed = Math.max(540, Math.hypot(player.vx, player.vy) * 1.25) * spurBoost;
      player.vx = nx * bounceSpeed;
      player.vy = ny * bounceSpeed;
      player.dashTimerMs = Math.max(player.dashTimerMs, 150);
      player.invulnTimerMs = Math.max(player.invulnTimerMs, 180);

      registerPinballBounceOnPlayer(state);
      triggerBumperResonance(state, bumper, 'PLAYER');
    }
  }

  // 5. Step Active Chrono-Ghost Echoes
  for (let i = state.ghosts.length - 1; i >= 0; i--) {
    const ghost = state.ghosts[i];
    ghost.remainingMs -= dtMs;
    if (ghost.remainingMs <= 0) {
      state.ghosts.splice(i, 1);
      continue;
    }

    ghost.sampleAccumulatorMs += dtMs;
    if (
      ghost.sampleAccumulatorMs >= CHRONO_CONFIG.ECHO_RECORD_INTERVAL_MS &&
      ghost.samples.length > 0
    ) {
      ghost.sampleAccumulatorMs = 0;
      ghost.sampleIndex = (ghost.sampleIndex + 1) % ghost.samples.length;
      const sample = ghost.samples[ghost.sampleIndex];
      ghost.x = sample.x;
      ghost.y = sample.y;
      ghost.vx = sample.vx;
      ghost.vy = sample.vy;
      ghost.aimAngle = sample.aimAngle;
      ghost.isDashing = sample.isDashing;
      ghost.isParrying = sample.isParrying;
    } else {
      ghost.x += ghost.vx * dtSec * 0.5;
      ghost.y += ghost.vy * dtSec * 0.5;
    }

    if (hasRelic(state, 'trinity-timeline-loom')) {
      ghost.boltCooldownMs -= dtMs;
      if (ghost.boltCooldownMs <= 0) {
        ghost.boltCooldownMs = 1150;
        spawnAlliedHomingBolt(state, ghost.x, ghost.y, ghost.aimAngle, 20, 'ECHO');
      }
    }

    // Ghost parrying projectiles
    if (ghost.isParrying) {
      const c = triggerPulseParry(state, ghost.x, ghost.y, true);
      if (c > 0) applyParryScoreBonus(state, c);
    }

    // Ghost colliding with bumpers
    for (const bumper of state.bumpers) {
      const dist = Math.hypot(ghost.x - bumper.x, ghost.y - bumper.y);
      if (dist < CHRONO_CONFIG.PLAYER_BASE_RADIUS + bumper.radius && bumper.pulseTimerMs <= 0) {
        triggerBumperResonance(state, bumper, 'GHOST');
      }
    }

    // Ghost slamming into enemies
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      const dx = enemy.x - ghost.x;
      const dy = enemy.y - ghost.y;
      const dist = Math.hypot(dx, dy);
      if (dist < enemy.radius + CHRONO_CONFIG.PLAYER_BASE_RADIUS && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        enemy.x = ghost.x + nx * (enemy.radius + CHRONO_CONFIG.PLAYER_BASE_RADIUS + 2);
        enemy.y = ghost.y + ny * (enemy.radius + CHRONO_CONFIG.PLAYER_BASE_RADIUS + 2);
        enemy.vx = nx * (360 / enemy.mass);
        enemy.vy = ny * (360 / enemy.mass);
        enemy.knockbackTimerMs = Math.max(enemy.knockbackTimerMs, 420);

        const echoRelicMult = hasRelic(state, 'mobius-tape-spool') ? 1.4 : 1.0;
        damageEnemy(
          state,
          enemy,
          Math.round(24 * echoRelicMult),
          'ECHO',
          'ECHO STRIKE'
        );
        addCombo(state, 1, enemy.x, enemy.y);
      }
    }
  }

  // 6. Spawn sector enemies to maintain kinetic action
  state.spawnTimerMs -= dtMs;
  const maxConcurrentEnemies = sectorDef.isBossSector ? 5 : 6 + state.sector;
  if (
    state.spawnTimerMs <= 0 &&
    state.enemies.length < maxConcurrentEnemies &&
    (!sectorDef.isBossSector || state.enemies.some((e) => e.type === 'kronos-omega'))
  ) {
    state.spawnTimerMs = Math.max(1250, 2600 - state.sector * 180);
    spawnSectorEnemy(state);
  }

  // 7. Update Enemies & Pinball Knockback Physics
  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i];
    if (enemy.hp <= 0) continue;

    const arch = ENEMY_ARCHETYPES[enemy.type];
    enemy.flashTimerMs = Math.max(0, enemy.flashTimerMs - dtMs);

    // Status effects
    if (enemy.burnTimerMs > 0) {
      const prevSec = Math.ceil(enemy.burnTimerMs / 500);
      enemy.burnTimerMs = Math.max(0, enemy.burnTimerMs - dtMs);
      const nextSec = Math.ceil(enemy.burnTimerMs / 500);
      if (prevSec !== nextSec) {
        damageEnemy(state, enemy, 8, 'BUMPER');
        if (enemy.hp <= 0) continue;
      }
    }
    if (enemy.chillTimerMs > 0) {
      enemy.chillTimerMs = Math.max(0, enemy.chillTimerMs - dtMs);
    }

    const chillSlow = enemy.chillTimerMs > 0 ? 0.5 : 1.0;
    const toPlayerX = player.x - enemy.x;
    const toPlayerY = player.y - enemy.y;
    const distToPlayer = Math.max(1, Math.hypot(toPlayerX, toPlayerY));
    enemy.facingAngle = Math.atan2(toPlayerY, toPlayerX);

    if (enemy.knockbackTimerMs > 0) {
      enemy.knockbackTimerMs = Math.max(0, enemy.knockbackTimerMs - dtMs);
      enemy.vx *= Math.pow(0.95, dtMs / 16.67);
      enemy.vy *= Math.pow(0.95, dtMs / 16.67);
    } else {
      const desiredSpeed = arch.speed * chillSlow;
      if (enemy.type === 'prism-sniper') {
        // Orbit at medium-long range
        const tangentX = -toPlayerY / distToPlayer;
        const tangentY = toPlayerX / distToPlayer;
        const radialFactor = distToPlayer < 170 ? -0.5 : distToPlayer > 220 ? 0.5 : 0;
        enemy.vx = (tangentX * 0.8 + (toPlayerX / distToPlayer) * radialFactor) * desiredSpeed;
        enemy.vy = (tangentY * 0.8 + (toPlayerY / distToPlayer) * radialFactor) * desiredSpeed;
      } else {
        enemy.vx = (toPlayerX / distToPlayer) * desiredSpeed;
        enemy.vy = (toPlayerY / distToPlayer) * desiredSpeed;
      }
    }

    enemy.x += enemy.vx * dtSec;
    enemy.y += enemy.vy * dtSec;

    // Enemy Firing Logic
    if (arch.fireCooldownMs > 0 && enemy.knockbackTimerMs <= 0) {
      enemy.fireTimerMs -= dtMs * chillSlow;
      if (enemy.fireTimerMs <= 0) {
        enemy.fireTimerMs =
          enemy.type === 'kronos-omega'
            ? Math.max(680, arch.fireCooldownMs - (enemy.bossPhase - 1) * 260)
            : arch.fireCooldownMs;

        if (enemy.type === 'arc-weaver') {
          for (const offset of [-0.28, 0, 0.28]) {
            const ang = enemy.facingAngle + offset;
            state.projectiles.push({
              id: state.nextEntityId++,
              x: enemy.x + Math.cos(ang) * (enemy.radius + 6),
              y: enemy.y + Math.sin(ang) * (enemy.radius + 6),
              vx: Math.cos(ang) * arch.projectileSpeed,
              vy: Math.sin(ang) * arch.projectileSpeed,
              radius: 6,
              damage: 11,
              isAllied: false,
              isHoming: false,
              pierceLeft: 1,
              color: '#f43f5e',
              ttlMs: 3600,
              sourceName: arch.name,
            });
          }
        } else if (enemy.type === 'kronos-omega') {
          const count = enemy.bossPhase === 1 ? 6 : enemy.bossPhase === 2 ? 8 : 12;
          const spinOffset = (state.elapsedMs / 450) % (Math.PI * 2);
          for (let b = 0; b < count; b++) {
            const ang = spinOffset + (b / count) * Math.PI * 2;
            state.projectiles.push({
              id: state.nextEntityId++,
              x: enemy.x + Math.cos(ang) * (enemy.radius + 8),
              y: enemy.y + Math.sin(ang) * (enemy.radius + 8),
              vx: Math.cos(ang) * arch.projectileSpeed,
              vy: Math.sin(ang) * arch.projectileSpeed,
              radius: 7,
              damage: 14,
              isAllied: false,
              isHoming: false,
              pierceLeft: 1,
              color: enemy.bossPhase === 3 ? '#fde047' : '#fb7185',
              ttlMs: 4200,
              sourceName: 'Kronos-Omega Supernova',
            });
          }
        } else {
          const ang = enemy.facingAngle;
          state.projectiles.push({
            id: state.nextEntityId++,
            x: enemy.x + Math.cos(ang) * (enemy.radius + 6),
            y: enemy.y + Math.sin(ang) * (enemy.radius + 6),
            vx: Math.cos(ang) * arch.projectileSpeed,
            vy: Math.sin(ang) * arch.projectileSpeed,
            radius: 6,
            damage: 12,
            isAllied: false,
            isHoming: false,
            pierceLeft: 1,
            color: '#fb7185',
            ttlMs: 3600,
            sourceName: arch.name,
          });
        }
      }
    }

    // Enemy collision with outer Crucible Wall (Wall-Slam Shatter Damage!)
    const eDistFromCenter = Math.hypot(
      enemy.x - CHRONO_CONFIG.ARENA_CENTER_X,
      enemy.y - CHRONO_CONFIG.ARENA_CENTER_Y
    );
    const maxEnemyDist = CHRONO_CONFIG.ARENA_RADIUS - enemy.radius;
    if (eDistFromCenter > maxEnemyDist && eDistFromCenter > 0.001) {
      const nx = (enemy.x - CHRONO_CONFIG.ARENA_CENTER_X) / eDistFromCenter;
      const ny = (enemy.y - CHRONO_CONFIG.ARENA_CENTER_Y) / eDistFromCenter;
      enemy.x = CHRONO_CONFIG.ARENA_CENTER_X + nx * maxEnemyDist;
      enemy.y = CHRONO_CONFIG.ARENA_CENTER_Y + ny * maxEnemyDist;

      const dot = enemy.vx * nx + enemy.vy * ny;
      if (dot > 0) {
        enemy.vx = (enemy.vx - 2 * dot * nx) * 0.9;
        enemy.vy = (enemy.vy - 2 * dot * ny) * 0.9;
      }

      if (enemy.knockbackTimerMs > 0) {
        state.ledger.totalWallSlams += 1;
        const newtonBonus = hasRelic(state, 'newtonian-guillotine') ? 1.65 : 1.0;
        const juggernautWeakness = enemy.type === 'void-juggernaut' ? 2.5 : 1.0;
        if (hasRelic(state, 'newtonian-guillotine')) {
          player.stamina = Math.min(player.maxStamina, player.stamina + 8);
        }
        addCombo(state, 1, enemy.x, enemy.y);
        damageEnemy(
          state,
          enemy,
          Math.round(28 * newtonBonus * juggernautWeakness),
          'KINETIC',
          'WALL SLAM!'
        );
        if (enemy.hp <= 0) continue;
      }
    }

    // Enemy collision with Arena Bumpers
    for (const bumper of state.bumpers) {
      const dx = enemy.x - bumper.x;
      const dy = enemy.y - bumper.y;
      const dist = Math.hypot(dx, dy);
      const minDist = enemy.radius + bumper.radius;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        enemy.x = bumper.x + nx * (minDist + 2);
        enemy.y = bumper.y + ny * (minDist + 2);
        enemy.vx = nx * (460 / enemy.mass);
        enemy.vy = ny * (460 / enemy.mass);

        if (enemy.knockbackTimerMs > 0) {
          const juggernautWeakness = enemy.type === 'void-juggernaut' ? 2.5 : 1.0;
          damageEnemy(
            state,
            enemy,
            Math.round(32 * juggernautWeakness),
            'BUMPER',
            'BUMPER SHATTER!'
          );
          triggerBumperResonance(state, bumper, 'ENEMY');
          if (enemy.hp <= 0) break;
        }
      }
    }
    if (enemy.hp <= 0) continue;

    // Player <-> Enemy Collision (Dash-Slam or High-Velocity Ricochet vs Contact Damage)
    const pDx = enemy.x - player.x;
    const pDy = enemy.y - player.y;
    const pDist = Math.hypot(pDx, pDy);
    const pMinDist = enemy.radius + player.radius;

    if (pDist < pMinDist && pDist > 0.001) {
      const nx = pDx / pDist;
      const ny = pDy / pDist;
      const playerSpeed = Math.hypot(player.vx, player.vy);
      const isStrikeState =
        player.dashTimerMs > 0 || player.overdriveTimerMs > 0 || playerSpeed >= 245;

      // Separate overlap
      enemy.x = player.x + nx * (pMinDist + 2);
      enemy.y = player.y + ny * (pMinDist + 2);

      if (isStrikeState) {
        // Check Chrono-Warden frontal shield
        let shieldBlocked = false;
        if (enemy.type === 'chrono-warden' && player.overdriveTimerMs <= 0) {
          const attackFromAngle = Math.atan2(-ny, -nx);
          const angleDiff = Math.abs(
            Math.atan2(
              Math.sin(attackFromAngle - enemy.facingAngle),
              Math.cos(attackFromAngle - enemy.facingAngle)
            )
          );
          if (angleDiff < 0.75 && enemy.knockbackTimerMs <= 0) {
            shieldBlocked = true;
          }
        }

        const knockForce =
          (580 * chassis.knockbackMultiplier) / Math.max(0.7, enemy.mass);
        enemy.vx = nx * knockForce;
        enemy.vy = ny * knockForce;
        enemy.knockbackTimerMs = 520;

        // Player rebounds slightly like a pinball striker
        player.vx = -nx * 240;
        player.vy = -ny * 240;
        player.invulnTimerMs = Math.max(player.invulnTimerMs, 220);
        registerPinballBounceOnPlayer(state);

        addCombo(state, 1, enemy.x, enemy.y);

        const strikeDmg = shieldBlocked ? 10 : 34;
        damageEnemy(
          state,
          enemy,
          strikeDmg,
          'KINETIC',
          shieldBlocked ? 'SHIELD GRAZE' : 'RICOCHET SLAM!'
        );
      } else if (player.invulnTimerMs <= 0) {
        // Enemy hurts player on slow un-dashed contact
        player.hp = Math.max(0, player.hp - arch.contactDamage);
        player.invulnTimerMs = 650;
        player.vx = -nx * 320;
        player.vy = -ny * 320;
        state.ledger.lastDamageBy = `${arch.name} (Melee Impact)`;
        pushEvent(
          state,
          'PLAYER_DAMAGED',
          player.x,
          player.y,
          `-${arch.contactDamage} HP (${arch.name.split(' ')[0]})`,
          '#f43f5e',
          1.4
        );
      }
    }
  }

  // 8. Enemy-to-Enemy Domino Pinball Collisions!
  for (let i = 0; i < state.enemies.length; i++) {
    const a = state.enemies[i];
    if (a.hp <= 0) continue;
    for (let j = i + 1; j < state.enemies.length; j++) {
      const b = state.enemies[j];
      if (b.hp <= 0) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        a.x -= nx * (overlap * 0.5);
        a.y -= ny * (overlap * 0.5);
        b.x += nx * (overlap * 0.5);
        b.y += ny * (overlap * 0.5);

        if (a.knockbackTimerMs > 0 || b.knockbackTimerMs > 0) {
          a.knockbackTimerMs = Math.max(a.knockbackTimerMs, 360);
          b.knockbackTimerMs = Math.max(b.knockbackTimerMs, 360);
          const dominoSpeed = 380;
          a.vx = -nx * (dominoSpeed / a.mass);
          a.vy = -ny * (dominoSpeed / a.mass);
          b.vx = nx * (dominoSpeed / b.mass);
          b.vy = ny * (dominoSpeed / b.mass);

          const newtonMult = hasRelic(state, 'newtonian-guillotine') ? 1.65 : 1.0;
          if (hasRelic(state, 'newtonian-guillotine')) {
            player.stamina = Math.min(player.maxStamina, player.stamina + 8);
          }
          addCombo(state, 1, (a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
          const dominoDmg = Math.round(30 * newtonMult);
          damageEnemy(state, a, dominoDmg, 'KINETIC', 'DOMINO CRASH!');
          damageEnemy(state, b, dominoDmg, 'KINETIC', 'DOMINO CRASH!');
        }
      }
    }
  }

  // 9. Remove defeated enemies
  state.enemies = state.enemies.filter((e) => e.hp > 0);

  // 10. Step Projectiles (Homing Allied Shards & Enemy Barrages)
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    proj.ttlMs -= dtMs;
    if (proj.ttlMs <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }

    // Active parry aura converts enemy projectiles automatically during parry window
    if (!proj.isAllied && player.parryTimerMs > 0) {
      const c = triggerPulseParry(state, player.x, player.y, true);
      if (c > 0) applyParryScoreBonus(state, c);
    }

    if (proj.isAllied && proj.isHoming && state.enemies.length > 0) {
      let nearest: EnemyEntity | null = null;
      let nearestDist = Infinity;
      for (const e of state.enemies) {
        const d = Math.hypot(e.x - proj.x, e.y - proj.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        const speed = Math.hypot(proj.vx, proj.vy) || 420;
        const desiredAngle = Math.atan2(nearest.y - proj.y, nearest.x - proj.x);
        const currentAngle = Math.atan2(proj.vy, proj.vx);
        const diff = Math.atan2(
          Math.sin(desiredAngle - currentAngle),
          Math.cos(desiredAngle - currentAngle)
        );
        const newAngle = currentAngle + diff * Math.min(1, 9.5 * dtSec);
        proj.vx = Math.cos(newAngle) * speed;
        proj.vy = Math.sin(newAngle) * speed;
      }
    }

    proj.x += proj.vx * dtSec;
    proj.y += proj.vy * dtSec;

    // Remove projectile if outside arena
    const pCenterDist = Math.hypot(
      proj.x - CHRONO_CONFIG.ARENA_CENTER_X,
      proj.y - CHRONO_CONFIG.ARENA_CENTER_Y
    );
    if (pCenterDist > CHRONO_CONFIG.ARENA_RADIUS + 16) {
      state.projectiles.splice(i, 1);
      continue;
    }

    if (proj.isAllied) {
      let hitEnemy = false;
      for (const enemy of state.enemies) {
        if (enemy.hp <= 0) continue;
        const d = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (d <= enemy.radius + proj.radius) {
          const cat =
            proj.sourceName === 'PARRY'
              ? 'PARRY'
              : proj.sourceName === 'ECHO'
              ? 'ECHO'
              : 'KINETIC';
          damageEnemy(state, enemy, proj.damage, cat, 'PRISM SHARD');
          proj.pierceLeft -= 1;
          if (proj.pierceLeft <= 0) {
            hitEnemy = true;
            break;
          }
        }
      }
      state.enemies = state.enemies.filter((e) => e.hp > 0);
      if (hitEnemy) {
        state.projectiles.splice(i, 1);
        continue;
      }
    } else {
      const dPlayer = Math.hypot(player.x - proj.x, player.y - proj.y);
      if (dPlayer <= player.radius + proj.radius) {
        state.projectiles.splice(i, 1);
        if (player.invulnTimerMs <= 0 && player.dashTimerMs <= 0) {
          player.hp = Math.max(0, player.hp - proj.damage);
          player.invulnTimerMs = 550;
          state.ledger.lastDamageBy = proj.sourceName;
          pushEvent(
            state,
            'PLAYER_DAMAGED',
            player.x,
            player.y,
            `-${proj.damage} HP (${proj.sourceName})`,
            '#f43f5e',
            1.35
          );
        }
        continue;
      }
    }
  }

  // 11. Check Player Defeat or Sector Completion
  if (player.hp <= 0) {
    player.hp = 0;
    state.status = 'GAME_OVER';
    pushEvent(
      state,
      'GAME_OVER',
      player.x,
      player.y,
      `💀 CORE SHATTERED BY ${state.ledger.lastDamageBy.toUpperCase()}`,
      '#f43f5e',
      2.5
    );
    return;
  }

  if (state.sectorKills >= state.sectorTargetKills) {
    openRelicDraftOrVictory(state);
  }
}
