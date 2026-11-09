import { AEGIS_CONFIG } from './config';
import {
  AUGMENT_POOL,
  ENEMY_ARCHETYPES,
  LOADOUT_CHASSIS,
  WAVE_SCHEDULE,
  type AugmentDefinition,
  type EnemyArchetypeId,
} from './content';
import type { RunTelemetryRecord } from './persistence';
import { SeededRng } from './rng';

export interface PlayerInputState {
  moveX: number; // -1..1
  moveY: number; // -1..1
  aimX: number;
  aimY: number;
  dashOrShatterPressed: boolean;
}

export interface PlayerEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  coreRadius: number;
  grazeRadius: number;
  speed: number;
  overclock: number; // 0..100
  dashTimerS: number;
  dashCooldownS: number;
  invulnTimerS: number;
  grazeFireCooldownS: number;
  passiveFireCooldownS: number;
  isCurrentlyGrazing: boolean;
  grazeChainCounter: number;
}

export interface TemporalGhost {
  id: number;
  x: number;
  y: number;
  grazeRadius: number;
  remainingS: number;
  maxDurationS: number;
  fireCooldownS: number;
}

export interface EnemyEntity {
  id: number;
  archetypeId: EnemyArchetypeId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  fireCooldownS: number;
  phaseAngle: number;
  isElite: boolean;
  isBoss: boolean;
  bossPhase: 1 | 2 | 3;
  color: string;
  hitFlashS: number;
}

export interface BulletEntity {
  id: number;
  isPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isCrit: boolean;
  pierceLeft: number;
  ricochetLeft: number;
  homing: boolean;
  grazedByPlayer: boolean;
  grazedTickCooldown: number;
  color: string;
  ageS: number;
  maxAgeS: number;
}

export interface FluxGemEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  xpValue: number;
  ageS: number;
  maxAgeS: number;
}

export interface FloatingNumberEntity {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  floorY: number;
  color: string;
  isCrit: boolean;
  scale: number;
  ageS: number;
  maxAgeS: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  ageS: number;
  maxAgeS: number;
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  ageS: number;
  maxAgeS: number;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  lineWidth: number;
  ageS: number;
  maxAgeS: number;
}

export interface LightningArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  ageS: number;
  maxAgeS: number;
}

export interface SimulationAudioEvents {
  grazeSpark: boolean;
  railShotCrit: boolean | null; // null = no shot, false = normal, true = crit
  heavyStrike: { isKill: boolean; isBoss: boolean } | null;
  shatterBulletsCleared: number;
  gemPickupSupercritical: boolean | null;
  playerHit: boolean;
  augmentPicked: boolean;
}

export interface AegisSimulationState {
  seed: number;
  rng: SeededRng;
  runKey: string;
  loadoutId: string;
  status: 'playing' | 'draft' | 'victory' | 'defeat';
  tick: number;
  elapsedRunTimeS: number;

  // Wave & Leveling
  wave: number;
  waveTimerS: number;
  waveDurationS: number;
  spawnCooldownS: number;
  bossSpawnedThisWave: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  pendingDraftCount: number;
  draftChoices: AugmentDefinition[];
  augments: Record<string, number>;
  augmentHistory: string[];

  // Score & Combo
  score: number;
  comboMultiplier: number;
  peakCombo: number;
  comboDecayTimerS: number;

  // Juice State (Hitstop & Trauma² Screenshake)
  hitstopMs: number;
  trauma: number;
  cameraPhase: number;

  // Entities
  player: PlayerEntity;
  temporalGhosts: TemporalGhost[];
  enemies: EnemyEntity[];
  bullets: BulletEntity[];
  fluxGems: FluxGemEntity[];

  // Visual Juice Entities
  floatingTexts: FloatingNumberEntity[];
  sparks: SparkParticle[];
  smokePuffs: SmokeParticle[];
  shockwaves: ShockwaveRing[];
  lightningArcs: LightningArc[];

  // Telemetry Counters
  nextEntityId: number;
  totalDamageDealt: number;
  bulletsGrazed: number;
  bulletsShattered: number;
  supercriticalGemsCollected: number;
  expiredGemsDetonated: number;
  causeOfEnd: string;

  // Frame Audio Events
  frameAudio: SimulationAudioEvents;
}

function emptyAudioEvents(): SimulationAudioEvents {
  return {
    grazeSpark: false,
    railShotCrit: null,
    heavyStrike: null,
    shatterBulletsCleared: 0,
    gemPickupSupercritical: null,
    playerHit: false,
    augmentPicked: false,
  };
}

export function createInitialSimulationState(
  seed: number = 20261108,
  loadoutId: string = 'vanguard-zero'
): AegisSimulationState {
  const rng = new SeededRng(seed);
  const chassis = LOADOUT_CHASSIS.find((c) => c.id === loadoutId) ?? LOADOUT_CHASSIS[0]!;
  const waveDef = WAVE_SCHEDULE[0]!;

  const augments: Record<string, number> = {
    [chassis.startingAugmentId]: 1,
  };

  const baseGraze =
    AEGIS_CONFIG.PLAYER_BASE_GRAZE_RADIUS *
    chassis.grazeRadiusMult *
    (augments['arc-capacitor'] ? 1.22 : 1.0);

  const state: AegisSimulationState = {
    seed,
    rng,
    runKey: `aegis-${seed}-${loadoutId}`,
    loadoutId: chassis.id,
    status: 'playing',
    tick: 0,
    elapsedRunTimeS: 0,

    wave: 1,
    waveTimerS: 0,
    waveDurationS: waveDef.durationS,
    spawnCooldownS: 0.4,
    bossSpawnedThisWave: false,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    pendingDraftCount: 0,
    draftChoices: [],
    augments,
    augmentHistory: [chassis.startingAugmentId],

    score: 0,
    comboMultiplier: 1,
    peakCombo: 1,
    comboDecayTimerS: 0,

    hitstopMs: 0,
    trauma: 0,
    cameraPhase: 0,

    player: {
      x: AEGIS_CONFIG.ARENA_WIDTH * 0.5,
      y: AEGIS_CONFIG.ARENA_HEIGHT * 0.58,
      vx: 0,
      vy: 0,
      hp: chassis.baseHp,
      maxHp: chassis.baseHp,
      coreRadius: AEGIS_CONFIG.PLAYER_CORE_RADIUS,
      grazeRadius: baseGraze,
      speed: AEGIS_CONFIG.PLAYER_BASE_SPEED * chassis.speedMult,
      overclock: 35, // Start with 35% Overclock so SPACE works on frame 1!
      dashTimerS: 0,
      dashCooldownS: 0,
      invulnTimerS: 0,
      grazeFireCooldownS: 0,
      passiveFireCooldownS: 0.15,
      isCurrentlyGrazing: false,
      grazeChainCounter: 0,
    },
    temporalGhosts: [],
    enemies: [],
    bullets: [],
    fluxGems: [],

    floatingTexts: [],
    sparks: [],
    smokePuffs: [],
    shockwaves: [],
    lightningArcs: [],

    nextEntityId: 1,
    totalDamageDealt: 0,
    bulletsGrazed: 0,
    bulletsShattered: 0,
    supercriticalGemsCollected: 0,
    expiredGemsDetonated: 0,
    causeOfEnd: 'In Progress',
    frameAudio: emptyAudioEvents(),
  };

  // Spawn an immediate Wave 1 greeting trio + readable plasma curtain so the First 5 Seconds are electric!
  spawnEnemy(state, 'pulse-drone', AEGIS_CONFIG.ARENA_WIDTH * 0.5, 110);
  spawnEnemy(state, 'pulse-drone', AEGIS_CONFIG.ARENA_WIDTH * 0.28, 150);
  spawnEnemy(state, 'pulse-drone', AEGIS_CONFIG.ARENA_WIDTH * 0.72, 150);

  // Fire an initial slow, welcoming ring of enemy plasma orbs toward the center so the player can graze immediately
  const starterEnemy = state.enemies[0]!;
  fireEnemyRadialBurst(state, starterEnemy, 7, 135);

  return state;
}

export function getAugmentStacks(state: AegisSimulationState, id: string): number {
  return state.augments[id] ?? 0;
}

export function getCameraShakeOffset(state: AegisSimulationState): {
  offsetX: number;
  offsetY: number;
  angleRad: number;
  shakeIntensity: number;
} {
  // Trauma-based shake with strictly quadratic decay (trauma²)
  const t = Math.max(0, Math.min(1, state.trauma));
  const shake = t * t;
  const phase = state.cameraPhase;
  const offsetX = Math.sin(phase * 37.3) * AEGIS_CONFIG.MAX_SHAKE_OFFSET_PX * shake;
  const offsetY = Math.cos(phase * 43.7) * AEGIS_CONFIG.MAX_SHAKE_OFFSET_PX * shake;
  const angleRad = Math.sin(phase * 29.1) * AEGIS_CONFIG.MAX_SHAKE_ANGLE_RAD * shake;
  return { offsetX, offsetY, angleRad, shakeIntensity: shake };
}

export function addTrauma(state: AegisSimulationState, amount: number): void {
  state.trauma = Math.min(1.0, state.trauma + amount);
}

export function triggerHitstop(state: AegisSimulationState, durationMs: number): void {
  state.hitstopMs = Math.max(state.hitstopMs, durationMs);
}

export function spawnFloatingText(
  state: AegisSimulationState,
  text: string,
  x: number,
  y: number,
  color: string,
  isCrit: boolean = false
): void {
  if (state.floatingTexts.length > 48) {
    state.floatingTexts.shift();
  }
  const vx = state.rng.nextRange(-48, 48);
  const vy = isCrit ? -155 : -115;
  state.floatingTexts.push({
    id: state.nextEntityId++,
    text,
    x,
    y,
    vx,
    vy,
    floorY: y + 18,
    color,
    isCrit,
    scale: isCrit ? 1.32 : 1.0,
    ageS: 0,
    maxAgeS: isCrit ? 0.95 : 0.72,
  });
}

export function spawnSparks(
  state: AegisSimulationState,
  x: number,
  y: number,
  color: string,
  count: number,
  speedMin: number = 90,
  speedMax: number = 320
): void {
  for (let i = 0; i < count; i++) {
    if (state.sparks.length > 180) {
      state.sparks.shift();
    }
    const angle = state.rng.nextRange(0, Math.PI * 2);
    const spd = state.rng.nextRange(speedMin, speedMax);
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      color,
      size: state.rng.nextRange(2, 4.2),
      ageS: 0,
      maxAgeS: state.rng.nextRange(0.24, 0.55),
    });
  }
}

export function spawnSmoke(
  state: AegisSimulationState,
  x: number,
  y: number,
  color: string,
  count: number = 3
): void {
  for (let i = 0; i < count; i++) {
    if (state.smokePuffs.length > 65) {
      state.smokePuffs.shift();
    }
    const angle = state.rng.nextRange(0, Math.PI * 2);
    const spd = state.rng.nextRange(12, 45);
    state.smokePuffs.push({
      x: x + state.rng.nextRange(-8, 8),
      y: y + state.rng.nextRange(-8, 8),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 14,
      radius: state.rng.nextRange(7, 13),
      color,
      ageS: 0,
      maxAgeS: state.rng.nextRange(0.45, 0.85),
    });
  }
}

export function spawnShockwave(
  state: AegisSimulationState,
  x: number,
  y: number,
  maxRadius: number,
  color: string,
  lineWidth: number = 4
): void {
  if (state.shockwaves.length > 18) {
    state.shockwaves.shift();
  }
  state.shockwaves.push({
    x,
    y,
    radius: 8,
    maxRadius,
    color,
    lineWidth,
    ageS: 0,
    maxAgeS: 0.36,
  });
}

export function spawnEnemy(
  state: AegisSimulationState,
  archetypeId: EnemyArchetypeId,
  customX?: number,
  customY?: number
): EnemyEntity {
  const arch = ENEMY_ARCHETYPES[archetypeId];
  let x = customX ?? 0;
  let y = customY ?? 0;

  if (customX === undefined || customY === undefined) {
    // Spawn around arena perimeter away from player
    const edge = state.rng.nextInt(0, 3);
    const margin = 36;
    if (edge === 0) {
      x = state.rng.nextRange(margin, AEGIS_CONFIG.ARENA_WIDTH - margin);
      y = margin;
    } else if (edge === 1) {
      x = AEGIS_CONFIG.ARENA_WIDTH - margin;
      y = state.rng.nextRange(margin, AEGIS_CONFIG.ARENA_HEIGHT - margin);
    } else if (edge === 2) {
      x = state.rng.nextRange(margin, AEGIS_CONFIG.ARENA_WIDTH - margin);
      y = AEGIS_CONFIG.ARENA_HEIGHT - margin;
    } else {
      x = margin;
      y = state.rng.nextRange(margin, AEGIS_CONFIG.ARENA_HEIGHT - margin);
    }
  }

  const waveHpScale = 1 + (state.wave - 1) * 0.16;
  const maxHp = Math.round(arch.maxHp * waveHpScale);

  const enemy: EnemyEntity = {
    id: state.nextEntityId++,
    archetypeId,
    name: arch.name,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: maxHp,
    maxHp,
    radius: arch.radius,
    speed: arch.speed,
    fireCooldownS: state.rng.nextRange(0.35, arch.fireIntervalS),
    phaseAngle: state.rng.nextRange(0, Math.PI * 2),
    isElite: arch.isElite,
    isBoss: arch.isBoss,
    bossPhase: 1,
    color: arch.color,
    hitFlashS: 0,
  };
  state.enemies.push(enemy);
  return enemy;
}

function fireEnemyRadialBurst(
  state: AegisSimulationState,
  enemy: EnemyEntity,
  count: number,
  speed: number,
  angleOffset: number = 0
): void {
  for (let i = 0; i < count; i++) {
    const angle = angleOffset + (i / count) * Math.PI * 2;
    state.bullets.push({
      id: state.nextEntityId++,
      isPlayer: false,
      x: enemy.x + Math.cos(angle) * (enemy.radius + 4),
      y: enemy.y + Math.sin(angle) * (enemy.radius + 4),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5.5,
      damage: enemy.isBoss ? 18 : 14,
      isCrit: false,
      pierceLeft: 0,
      ricochetLeft: 0,
      homing: false,
      grazedByPlayer: false,
      grazedTickCooldown: 0,
      color: enemy.color,
      ageS: 0,
      maxAgeS: 7.5,
    });
  }
}

function firePlayerGrazeVolley(
  state: AegisSimulationState,
  originX: number,
  originY: number,
  aimX: number,
  aimY: number,
  isPassivePulse: boolean = false
): void {
  const chassis = LOADOUT_CHASSIS.find((c) => c.id === state.loadoutId) ?? LOADOUT_CHASSIS[0]!;
  // Determine target angle: toward aim cursor, or nearest enemy if cursor is right on top of ship
  let targetX = aimX;
  let targetY = aimY;
  const distToAim = Math.hypot(targetX - originX, targetY - originY);
  if (distToAim < 12 && state.enemies.length > 0) {
    let bestDist = Infinity;
    for (const e of state.enemies) {
      const d = Math.hypot(e.x - originX, e.y - originY);
      if (d < bestDist) {
        bestDist = d;
        targetX = e.x;
        targetY = e.y;
      }
    }
  }

  const baseAngle = Math.atan2(targetY - originY, targetX - originX);

  const recoilStacks = getAugmentStacks(state, 'vlambeer-recoil');
  const throneStacks = getAugmentStacks(state, 'throne-bullet-heaven');
  const tungstenStacks = getAugmentStacks(state, 'tungsten-shards');
  const bloodStacks = getAugmentStacks(state, 'blood-capacitor');
  const prismStacks = getAugmentStacks(state, 'ricochet-prism');

  let shotCount = isPassivePulse ? 1 : 2 + recoilStacks * 2;
  if (!isPassivePulse && throneStacks > 0) {
    shotCount *= 2;
  }

  const lowHpBoost =
    bloodStacks > 0 && state.player.hp <= state.player.maxHp * 0.6 ? 1 + 0.45 * bloodStacks : 1.0;
  const overclockDamageBoost = 1 + (state.player.overclock / 100) * 0.45;
  const baseDamage =
    (isPassivePulse ? 18 : 28) *
    chassis.damageMult *
    (1 + tungstenStacks * 0.25) *
    lowHpBoost *
    overclockDamageBoost;

  const critChance = Math.min(
    0.85,
    0.14 + tungstenStacks * 0.15 + (state.player.overclock >= 80 ? 0.2 : 0)
  );
  const critMult = 1.85 + recoilStacks * 0.3 + throneStacks * 0.35;

  const spreadStep = 0.11;
  const startOffset = -((shotCount - 1) * spreadStep) / 2;

  let anyCrit = false;
  const bulletSpeed = (isPassivePulse ? 560 : 740) * (1 + prismStacks * 0.2);

  for (let i = 0; i < shotCount; i++) {
    const angle = baseAngle + startOffset + i * spreadStep;
    const isCrit = !isPassivePulse && state.rng.next() < critChance;
    if (isCrit) anyCrit = true;
    const dmg = Math.round(baseDamage * (isCrit ? critMult : 1));

    state.bullets.push({
      id: state.nextEntityId++,
      isPlayer: true,
      x: originX + Math.cos(angle) * 14,
      y: originY + Math.sin(angle) * 14,
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      radius: isCrit ? 6.5 : 4.5,
      damage: dmg,
      isCrit,
      pierceLeft: prismStacks,
      ricochetLeft: prismStacks,
      homing: false,
      grazedByPlayer: false,
      grazedTickCooldown: 0,
      color: isCrit ? '#fde047' : '#38bdf8',
      ageS: 0,
      maxAgeS: 1.8,
    });
  }

  if (!isPassivePulse) {
    state.frameAudio.railShotCrit = anyCrit;
    // Vlambeer physical recoil kickback when firing heavy graze volleys
    if (recoilStacks > 0) {
      const recoilStrength = 48 * recoilStacks;
      state.player.vx -= Math.cos(baseAngle) * recoilStrength;
      state.player.vy -= Math.sin(baseAngle) * recoilStrength;
    }
  }
}

export function triggerShatterOrDash(
  state: AegisSimulationState,
  input: PlayerInputState
): boolean {
  const p = state.player;
  const bloodStacks = getAugmentStacks(state, 'blood-capacitor');
  const canBloodCast =
    bloodStacks > 0 && p.overclock < AEGIS_CONFIG.SHATTER_MIN_OVERCLOCK && p.hp > 15;
  const hasOverclockForShatter = p.overclock >= AEGIS_CONFIG.SHATTER_MIN_OVERCLOCK || canBloodCast;

  if (p.dashCooldownS > 0 && !hasOverclockForShatter) {
    return false;
  }

  // Determine dash/recoil direction
  let dirX = input.moveX;
  let dirY = input.moveY;
  if (Math.hypot(dirX, dirY) < 0.1) {
    // Recoil opposite to aim direction (Vlambeer kickback!)
    const aimAngle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    dirX = -Math.cos(aimAngle);
    dirY = -Math.sin(aimAngle);
  } else {
    const len = Math.hypot(dirX, dirY);
    dirX /= len;
    dirY /= len;
  }

  // Spawn Braid Temporal Twin if augment is active
  const braidStacks = getAugmentStacks(state, 'braid-temporal-twin');
  if (braidStacks > 0) {
    state.temporalGhosts.push({
      id: state.nextEntityId++,
      x: p.x,
      y: p.y,
      grazeRadius: p.grazeRadius * 0.95,
      remainingS: 3.5 + (braidStacks - 1) * 1.0,
      maxDurationS: 3.5 + (braidStacks - 1) * 1.0,
      fireCooldownS: 0.05,
    });
    spawnFloatingText(state, 'TEMPORAL TWIN!', p.x, p.y - 22, '#c084fc', true);
  }

  // Execute Phase-Dash
  const thrusterStacks = getAugmentStacks(state, 'kinetic-thrusters');
  p.dashTimerS = AEGIS_CONFIG.PLAYER_DASH_DURATION_S;
  p.dashCooldownS = AEGIS_CONFIG.PLAYER_DASH_COOLDOWN_S * Math.pow(0.8, thrusterStacks);
  p.invulnTimerS = Math.max(p.invulnTimerS, 0.28);
  p.vx = dirX * AEGIS_CONFIG.PLAYER_DASH_SPEED;
  p.vy = dirY * AEGIS_CONFIG.PLAYER_DASH_SPEED;

  spawnSmoke(state, p.x, p.y, '#38bdf8', 5);

  // If Overclock >= 30% (or Martyr Blood-Capacitor active), unleash SHATTER DISCHARGE NOVA
  if (hasOverclockForShatter) {
    if (canBloodCast && p.overclock < AEGIS_CONFIG.SHATTER_MIN_OVERCLOCK) {
      p.hp = Math.max(1, p.hp - 12);
      spawnFloatingText(state, 'BLOOD PACT -12 HP!', p.x, p.y - 28, '#f43f5e', true);
    }

    const consumedOverclock = Math.max(30, p.overclock);
    p.overclock = 0;

    const shatterRadius =
      AEGIS_CONFIG.SHATTER_BASE_RADIUS * (1 + (consumedOverclock / 100) * 0.55);
    spawnShockwave(state, p.x, p.y, shatterRadius, '#38bdf8', 6);
    addTrauma(state, AEGIS_CONFIG.TRAUMA_HEAVY_STRIKE);

    const alchemyStacks = getAugmentStacks(state, 'shatter-alchemy');
    let clearedCount = 0;

    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i]!;
      if (b.isPlayer) continue;
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d <= shatterRadius) {
        clearedCount++;
        state.bulletsShattered++;
        spawnSparks(state, b.x, b.y, '#38bdf8', 4, 80, 220);

        if (alchemyStacks > 0) {
          // Convert enemy bullet into a friendly homing plasma shard!
          b.isPlayer = true;
          b.homing = true;
          b.damage = 42 * alchemyStacks;
          b.isCrit = true;
          b.color = '#fde047';
          b.ageS = 0;
          b.maxAgeS = 2.6;
        } else {
          state.bullets.splice(i, 1);
        }
      }
    }

    // Also damage enemies inside the Shatter Nova
    const novaDamage = Math.round(55 * (1 + consumedOverclock / 100));
    for (const enemy of state.enemies) {
      const d = Math.hypot(enemy.x - p.x, enemy.y - p.y);
      if (d <= shatterRadius + enemy.radius) {
        damageEnemy(state, enemy, novaDamage, true);
      }
    }

    if (clearedCount > 0) {
      triggerHitstop(state, AEGIS_CONFIG.HITSTOP_HEAVY_MS);
      const bonusScore = clearedCount * 45 * state.comboMultiplier;
      state.score += bonusScore;
      spawnFloatingText(
        state,
        `SHATTER ×${clearedCount}! +${bonusScore}`,
        p.x,
        p.y - 34,
        '#fde047',
        true
      );
    } else {
      spawnFloatingText(state, 'PHASE SHATTER!', p.x, p.y - 26, '#38bdf8', false);
    }

    state.frameAudio.shatterBulletsCleared = Math.max(1, clearedCount);
  }

  return true;
}

function damageEnemy(
  state: AegisSimulationState,
  enemy: EnemyEntity,
  damage: number,
  isCrit: boolean
): void {
  if (enemy.hp <= 0) return;
  enemy.hp -= damage;
  enemy.hitFlashS = 0.1;
  state.totalDamageDealt += damage;

  spawnFloatingText(
    state,
    isCrit ? `CRIT! ${damage}` : `${damage}`,
    enemy.x + state.rng.nextRange(-10, 10),
    enemy.y - enemy.radius - 6,
    isCrit ? '#fde047' : '#f8fafc',
    isCrit
  );
  spawnSparks(state, enemy.x, enemy.y, isCrit ? '#fde047' : enemy.color, isCrit ? 7 : 4);

  if (isCrit) {
    triggerHitstop(state, AEGIS_CONFIG.HITSTOP_HEAVY_MS);
    addTrauma(state, 0.18);
    state.frameAudio.heavyStrike = { isKill: enemy.hp <= 0, isBoss: enemy.isBoss };
  }

  // Legendary Throne Cataclysm drops live Flux Gems on Boss/Elite hits
  if (
    (enemy.isBoss || enemy.isElite) &&
    getAugmentStacks(state, 'throne-bullet-heaven') > 0 &&
    state.rng.next() < 0.35
  ) {
    spawnFluxGem(state, enemy.x, enemy.y, 28);
  }

  if (enemy.hp <= 0) {
    handleEnemyKill(state, enemy, isCrit);
  }
}

function handleEnemyKill(
  state: AegisSimulationState,
  enemy: EnemyEntity,
  killedByCrit: boolean
): void {
  const arch = ENEMY_ARCHETYPES[enemy.archetypeId];
  const scoreGain = arch.scoreValue * state.comboMultiplier;
  state.score += scoreGain;

  // Increment Combo
  state.comboMultiplier = Math.min(
    AEGIS_CONFIG.MAX_COMBO_MULTIPLIER,
    state.comboMultiplier + (enemy.isElite ? 2 : 1)
  );
  state.peakCombo = Math.max(state.peakCombo, state.comboMultiplier);
  state.comboDecayTimerS = AEGIS_CONFIG.COMBO_DECAY_TIME_S;

  // Hitstop & Screenshake on Elite / Boss Kills (120ms Boss/Elite kill hitstop!)
  if (enemy.isBoss || enemy.isElite) {
    triggerHitstop(state, AEGIS_CONFIG.HITSTOP_BOSS_KILL_MS);
    addTrauma(state, enemy.isBoss ? AEGIS_CONFIG.TRAUMA_BOSS_KILL : 0.65);
    spawnShockwave(state, enemy.x, enemy.y, enemy.isBoss ? 260 : 150, enemy.color, 7);
    spawnSmoke(state, enemy.x, enemy.y, enemy.color, enemy.isBoss ? 14 : 7);
    spawnSparks(state, enemy.x, enemy.y, '#fde047', enemy.isBoss ? 36 : 18, 120, 420);
    state.frameAudio.heavyStrike = { isKill: true, isBoss: true };
  } else {
    addTrauma(state, 0.22);
    spawnShockwave(state, enemy.x, enemy.y, 75, enemy.color, 3);
    spawnSmoke(state, enemy.x, enemy.y, enemy.color, 3);
    spawnSparks(state, enemy.x, enemy.y, enemy.color, 10);
    if (!state.frameAudio.heavyStrike) {
      state.frameAudio.heavyStrike = { isKill: true, isBoss: false };
    }
  }

  // Drop Volatile Flux Gems (4.0s decay!)
  for (let i = 0; i < arch.gemDrops; i++) {
    spawnFluxGem(state, enemy.x, enemy.y, 35);
  }

  // Detonation Chain-Reaction augment: Crit kills explode for AoE damage
  const bloomStacks = getAugmentStacks(state, 'volatile-corpse-bloom');
  if (killedByCrit && bloomStacks > 0) {
    const bloomRadius = 110;
    spawnShockwave(state, enemy.x, enemy.y, bloomRadius, '#a855f7', 5);
    for (const other of state.enemies) {
      if (other.id !== enemy.id && other.hp > 0) {
        const d = Math.hypot(other.x - enemy.x, other.y - enemy.y);
        if (d <= bloomRadius + other.radius) {
          other.hp -= 95 * bloomStacks;
          state.totalDamageDealt += 95 * bloomStacks;
        }
      }
    }
  }
}

export function spawnFluxGem(
  state: AegisSimulationState,
  x: number,
  y: number,
  xpValue: number
): void {
  const angle = state.rng.nextRange(0, Math.PI * 2);
  const speed = state.rng.nextRange(35, 115);
  const stabilizerStacks = getAugmentStacks(state, 'flux-stabilizer');
  state.fluxGems.push({
    id: state.nextEntityId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    xpValue: Math.round(xpValue * (1 + stabilizerStacks * 0.25)),
    ageS: 0,
    maxAgeS: AEGIS_CONFIG.GEM_LIFETIME_S + stabilizerStacks * 1.5,
  });
}

export function rollAugmentChoices(state: AegisSimulationState): AugmentDefinition[] {
  const shuffled = state.rng.shuffle(AUGMENT_POOL);
  return shuffled.slice(0, 3);
}

export function selectAugment(state: AegisSimulationState, choiceIndex: number): boolean {
  if (state.status !== 'draft') return false;
  const chosen = state.draftChoices[choiceIndex] ?? state.draftChoices[0];
  if (!chosen) return false;

  state.augments[chosen.id] = (state.augments[chosen.id] ?? 0) + 1;
  state.augmentHistory.push(chosen.id);
  state.frameAudio.augmentPicked = true;

  // Recompute dynamic player stats
  recomputePlayerStats(state);

  // Small hull repair on every draft
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
  spawnFloatingText(state, `+${chosen.name.toUpperCase()}!`, state.player.x, state.player.y - 30, chosen.accentColor, true);

  state.pendingDraftCount = Math.max(0, state.pendingDraftCount - 1);
  if (state.pendingDraftCount > 0) {
    state.draftChoices = rollAugmentChoices(state);
  } else {
    state.draftChoices = [];
    state.status = 'playing';
  }
  return true;
}

function recomputePlayerStats(state: AegisSimulationState): void {
  const chassis = LOADOUT_CHASSIS.find((c) => c.id === state.loadoutId) ?? LOADOUT_CHASSIS[0]!;
  const coilStacks = getAugmentStacks(state, 'arc-capacitor');
  const seraphStacks = getAugmentStacks(state, 'seraph-halo-overdrive');
  const thrusterStacks = getAugmentStacks(state, 'kinetic-thrusters');
  const magnetStacks = getAugmentStacks(state, 'magnet-core');

  state.player.grazeRadius =
    AEGIS_CONFIG.PLAYER_BASE_GRAZE_RADIUS *
    chassis.grazeRadiusMult *
    (1 + coilStacks * 0.22 + seraphStacks * 0.35);

  state.player.speed =
    AEGIS_CONFIG.PLAYER_BASE_SPEED * chassis.speedMult * (1 + thrusterStacks * 0.18);

  const newMaxHp = chassis.baseHp + magnetStacks * 10;
  if (newMaxHp > state.player.maxHp) {
    state.player.hp += newMaxHp - state.player.maxHp;
    state.player.maxHp = newMaxHp;
  }
}

export function stepSimulation(
  state: AegisSimulationState,
  input: PlayerInputState,
  dt: number = AEGIS_CONFIG.FIXED_DT
): void {
  state.frameAudio = emptyAudioEvents();

  if (state.status !== 'playing') {
    return;
  }

  // Update camera shake phase & trauma decay even during hitstop so screen vibrates!
  state.cameraPhase += dt;
  state.trauma = Math.max(0, state.trauma - AEGIS_CONFIG.TRAUMA_DECAY_PER_SEC * dt);

  // Check Hitstop (40ms heavy strike / 120ms boss kill freeze)
  if (state.hitstopMs > 0) {
    state.hitstopMs = Math.max(0, state.hitstopMs - dt * 1000);
    // Allow shockwaves to subtly shimmer during hitstop
    for (const sw of state.shockwaves) {
      sw.ageS += dt * 0.35;
      sw.radius = (sw.ageS / sw.maxAgeS) * sw.maxRadius;
    }
    return;
  }

  state.tick++;
  state.elapsedRunTimeS += dt;

  // Handle Dash / Shatter input
  if (input.dashOrShatterPressed) {
    triggerShatterOrDash(state, input);
  }

  const p = state.player;
  p.dashCooldownS = Math.max(0, p.dashCooldownS - dt);
  p.invulnTimerS = Math.max(0, p.invulnTimerS - dt);
  p.grazeFireCooldownS = Math.max(0, p.grazeFireCooldownS - dt);
  p.passiveFireCooldownS = Math.max(0, p.passiveFireCooldownS - dt);

  // Player Movement
  if (p.dashTimerS > 0) {
    p.dashTimerS = Math.max(0, p.dashTimerS - dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (state.tick % 2 === 0) {
      spawnSparks(state, p.x, p.y, '#38bdf8', 2, 30, 90);
    }
  } else {
    const moveLen = Math.hypot(input.moveX, input.moveY);
    const nx = moveLen > 1 ? input.moveX / moveLen : input.moveX;
    const ny = moveLen > 1 ? input.moveY / moveLen : input.moveY;

    // Blend input velocity with any recoil impulse
    p.vx = p.vx * 0.82 + nx * p.speed * 0.18;
    p.vy = p.vy * 0.82 + ny * p.speed * 0.18;
    p.x += (nx * p.speed * 0.82 + p.vx * 0.18) * dt;
    p.y += (ny * p.speed * 0.82 + p.vy * 0.18) * dt;
  }

  // Clamp player inside arena
  const pad = 18;
  p.x = Math.max(pad, Math.min(AEGIS_CONFIG.ARENA_WIDTH - pad, p.x));
  p.y = Math.max(pad, Math.min(AEGIS_CONFIG.ARENA_HEIGHT - pad, p.y));

  // Combo decay
  if (state.comboMultiplier > 1) {
    state.comboDecayTimerS -= dt;
    if (state.comboDecayTimerS <= 0) {
      state.comboMultiplier = Math.max(1, state.comboMultiplier - 1);
      state.comboDecayTimerS = AEGIS_CONFIG.COMBO_DECAY_TIME_S * 0.75;
    }
  }

  // Update Temporal Ghosts (Jonathan Blow Braid Worldline Twins)
  for (let i = state.temporalGhosts.length - 1; i >= 0; i--) {
    const g = state.temporalGhosts[i]!;
    g.remainingS -= dt;
    g.fireCooldownS = Math.max(0, g.fireCooldownS - dt);
    if (g.remainingS <= 0) {
      state.temporalGhosts.splice(i, 1);
    }
  }

  // Wave & Enemy Spawning
  const currentWaveDef =
    WAVE_SCHEDULE[Math.min(WAVE_SCHEDULE.length - 1, state.wave - 1)] ?? WAVE_SCHEDULE[0]!;
  state.waveTimerS += dt;
  state.spawnCooldownS -= dt;

  if (currentWaveDef.bossId && !state.bossSpawnedThisWave && state.waveTimerS >= 2.0) {
    state.bossSpawnedThisWave = true;
    const boss = spawnEnemy(
      state,
      currentWaveDef.bossId,
      AEGIS_CONFIG.ARENA_WIDTH * 0.5,
      96
    );
    spawnShockwave(state, boss.x, boss.y, 220, boss.color, 6);
    spawnFloatingText(state, `WARNING: ${boss.name}`, boss.x, boss.y + 48, boss.color, true);
    addTrauma(state, 0.55);
  }

  const maxConcurrentEnemies = 12 + state.wave * 2;
  if (state.spawnCooldownS <= 0 && state.enemies.length < maxConcurrentEnemies) {
    const pickId = state.rng.pick(currentWaveDef.enemyPool);
    spawnEnemy(state, pickId);
    state.spawnCooldownS = currentWaveDef.spawnIntervalS;
  }

  // Update Enemies & Bullet Curtain Patterns
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i]!;
    if (e.hp <= 0) {
      state.enemies.splice(i, 1);
      continue;
    }
    e.hitFlashS = Math.max(0, e.hitFlashS - dt);
    e.phaseAngle += dt * (e.isBoss ? 1.85 : 1.2);

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    if (e.isBoss) {
      // Boss phase transitions
      const hpRatio = e.hp / e.maxHp;
      e.bossPhase = hpRatio < 0.35 ? 3 : hpRatio < 0.7 ? 2 : 1;
      // Orbit around upper-center arena
      const targetX = AEGIS_CONFIG.ARENA_WIDTH * 0.5 + Math.cos(e.phaseAngle * 0.7) * 210;
      const targetY = 155 + Math.sin(e.phaseAngle * 1.1) * 65;
      e.x += (targetX - e.x) * 2.2 * dt;
      e.y += (targetY - e.y) * 2.2 * dt;
    } else {
      // Approach player up to preferred firing standoff distance
      const preferredDist = e.archetypeId === 'spiral-weaver' ? 170 : 115;
      if (dist > preferredDist) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
      } else {
        // Strafe orbitally around player
        e.x += (-dy / dist) * e.speed * 0.65 * dt;
        e.y += (dx / dist) * e.speed * 0.65 * dt;
      }
    }

    // Enemy Firing Logic
    e.fireCooldownS -= dt;
    if (e.fireCooldownS <= 0) {
      const arch = ENEMY_ARCHETYPES[e.archetypeId];
      e.fireCooldownS = arch.fireIntervalS / (e.isBoss ? 1 + (e.bossPhase - 1) * 0.28 : 1);
      const aimAngle = Math.atan2(dy, dx);

      if (e.archetypeId === 'pulse-drone') {
        fireEnemyRadialBurst(state, e, 5, 155, aimAngle);
      } else if (e.archetypeId === 'spiral-weaver') {
        fireEnemyRadialBurst(state, e, 8, 165, e.phaseAngle);
      } else if (e.archetypeId === 'rail-sniper') {
        for (let s = -1; s <= 1; s++) {
          const a = aimAngle + s * 0.14;
          state.bullets.push({
            id: state.nextEntityId++,
            isPlayer: false,
            x: e.x,
            y: e.y,
            vx: Math.cos(a) * 245,
            vy: Math.sin(a) * 245,
            radius: 5.5,
            damage: 16,
            isCrit: false,
            pierceLeft: 0,
            ricochetLeft: 0,
            homing: false,
            grazedByPlayer: false,
            grazedTickCooldown: 0,
            color: '#fbbf24',
            ageS: 0,
            maxAgeS: 6.0,
          });
        }
      } else if (e.archetypeId === 'void-carrier') {
        fireEnemyRadialBurst(state, e, 12, 150, e.phaseAngle * 0.5);
      } else if (e.isBoss) {
        const ringCount = e.bossPhase === 1 ? 12 : e.bossPhase === 2 ? 16 : 20;
        fireEnemyRadialBurst(state, e, ringCount, 175 + e.bossPhase * 15, e.phaseAngle);
      }
    }
  }

  // SIGNATURE TWIST: Check Graze Halo against Enemy Bullets & Enemy Hulls!
  let grazedThisFrame = false;
  const coilStacks = getAugmentStacks(state, 'arc-capacitor');
  const seraphStacks = getAugmentStacks(state, 'seraph-halo-overdrive');
  const dilationStacks = getAugmentStacks(state, 'overclock-singularity');
  const teslaStacks = getAugmentStacks(state, 'chain-tesla');

  const chargeMultiplier = 1 + coilStacks * 0.2;
  const fireInterval =
    AEGIS_CONFIG.GRAZE_FIRE_INTERVAL_S / (1 + seraphStacks * 0.4 + (p.overclock / 100) * 0.35);

  // Also check if player is grazing close to an enemy chassis directly
  for (const e of state.enemies) {
    const distToEnemy = Math.hypot(e.x - p.x, e.y - p.y);
    if (distToEnemy <= p.grazeRadius + e.radius) {
      grazedThisFrame = true;
      p.overclock = Math.min(100, p.overclock + 28 * chargeMultiplier * dt);
    }
    // Core collision with enemy hull
    if (distToEnemy <= p.coreRadius + e.radius * 0.78 && p.invulnTimerS <= 0 && p.dashTimerS <= 0) {
      applyPlayerDamage(state, 18, `Collision with ${e.name}`);
    }
  }

  // Update Bullets + Graze Detection
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i]!;
    b.ageS += dt;
    if (b.ageS >= b.maxAgeS) {
      state.bullets.splice(i, 1);
      continue;
    }

    // Homing behavior for Shatter Alchemy bullets
    if (b.isPlayer && b.homing && state.enemies.length > 0) {
      let nearest = state.enemies[0]!;
      let bestD = Infinity;
      for (const e of state.enemies) {
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if (d < bestD) {
          bestD = d;
          nearest = e;
        }
      }
      const desiredAngle = Math.atan2(nearest.y - b.y, nearest.x - b.x);
      const speed = Math.max(420, Math.hypot(b.vx, b.vy));
      b.vx = b.vx * 0.86 + Math.cos(desiredAngle) * speed * 0.14;
      b.vy = b.vy * 0.86 + Math.sin(desiredAngle) * speed * 0.14;
    }

    // Overclock Time-Dilation augment slows enemy bullets near player when Overclock >= 75%
    let speedScale = 1.0;
    if (!b.isPlayer && dilationStacks > 0 && p.overclock >= 75) {
      const distToP = Math.hypot(b.x - p.x, b.y - p.y);
      if (distToP <= 145) {
        speedScale = 0.55;
      }
    }

    b.x += b.vx * speedScale * dt;
    b.y += b.vy * speedScale * dt;

    // Arena wall collision / Ricochet Prism
    if (
      b.x < 6 ||
      b.x > AEGIS_CONFIG.ARENA_WIDTH - 6 ||
      b.y < 6 ||
      b.y > AEGIS_CONFIG.ARENA_HEIGHT - 6
    ) {
      if (b.isPlayer && b.ricochetLeft > 0) {
        b.ricochetLeft--;
        if (b.x < 6 || b.x > AEGIS_CONFIG.ARENA_WIDTH - 6) b.vx = -b.vx * 1.1;
        if (b.y < 6 || b.y > AEGIS_CONFIG.ARENA_HEIGHT - 6) b.vy = -b.vy * 1.1;
        b.x = Math.max(8, Math.min(AEGIS_CONFIG.ARENA_WIDTH - 8, b.x));
        b.y = Math.max(8, Math.min(AEGIS_CONFIG.ARENA_HEIGHT - 8, b.y));
        spawnSparks(state, b.x, b.y, '#38bdf8', 3, 60, 150);
      } else if (
        b.x < -25 ||
        b.x > AEGIS_CONFIG.ARENA_WIDTH + 25 ||
        b.y < -25 ||
        b.y > AEGIS_CONFIG.ARENA_HEIGHT + 25
      ) {
        state.bullets.splice(i, 1);
        continue;
      }
    }

    if (b.isPlayer) {
      // Check hit against Enemies
      for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(b.x - e.x, b.y - e.y);
        if (d <= b.radius + e.radius) {
          damageEnemy(state, e, b.damage, b.isCrit);
          if (b.pierceLeft > 0) {
            b.pierceLeft--;
          } else {
            state.bullets.splice(i, 1);
          }
          break;
        }
      }
    } else {
      // Enemy Bullet: Check Player Lethal Core vs. Graze Halo!
      if (b.grazedTickCooldown > 0) {
        b.grazedTickCooldown--;
      }

      const distToPlayer = Math.hypot(b.x - p.x, b.y - p.y);

      // 1. Lethal Core Hit Check (unless dashing or invulnerable)
      if (distToPlayer <= p.coreRadius + b.radius * 0.75 && p.dashTimerS <= 0) {
        if (p.invulnTimerS <= 0) {
          applyPlayerDamage(state, b.damage, 'Direct Plasma Impact');
        }
        state.bullets.splice(i, 1);
        continue;
      }

      // 2. GRAZE HALO CHECK (Within 44px+ Halo!)
      if (distToPlayer <= p.grazeRadius + b.radius) {
        grazedThisFrame = true;
        p.overclock = Math.min(
          100,
          p.overclock + AEGIS_CONFIG.GRAZE_CHARGE_PER_BULLET_SEC * chargeMultiplier * dt
        );

        if (!b.grazedByPlayer || b.grazedTickCooldown === 0) {
          b.grazedByPlayer = true;
          b.grazedTickCooldown = 14; // Can re-graze every 14 ticks while surfing a bullet!
          state.bulletsGrazed++;
          state.score += 15 * state.comboMultiplier;
          state.comboDecayTimerS = AEGIS_CONFIG.COMBO_DECAY_TIME_S;
          state.frameAudio.grazeSpark = true;

          // Visual Lightning Arc from Bullet to Player Hull
          if (state.lightningArcs.length < 28) {
            state.lightningArcs.push({
              x1: b.x,
              y1: b.y,
              x2: p.x,
              y2: p.y,
              color: p.overclock >= 80 ? '#fde047' : '#38bdf8',
              ageS: 0,
              maxAgeS: 0.09,
            });
          }
          spawnSparks(state, b.x, b.y, '#38bdf8', 2, 50, 140);

          // Tesla Graze Arc augment: every 3rd grazed bullet zaps nearby enemies
          p.grazeChainCounter++;
          if (teslaStacks > 0 && p.grazeChainCounter % 3 === 0 && state.enemies.length > 0) {
            const targets = state.enemies.slice(0, 2);
            for (const t of targets) {
              damageEnemy(state, t, 45 * teslaStacks, false);
              state.lightningArcs.push({
                x1: p.x,
                y1: p.y,
                x2: t.x,
                y2: t.y,
                color: '#f59e0b',
                ageS: 0,
                maxAgeS: 0.14,
              });
            }
          }

          // Legendary Aegis-Omega Halo Array: 20% chance to vaporize grazed bullet immediately
          if (seraphStacks > 0 && state.rng.next() < 0.2) {
            p.overclock = Math.min(100, p.overclock + 5);
            spawnFloatingText(state, 'ABSORBED!', b.x, b.y, '#fde047', false);
            state.bullets.splice(i, 1);
            continue;
          }
        }
      }

      // 3. Also check Braid Temporal Ghosts grazing enemy bullets!
      for (const g of state.temporalGhosts) {
        const dGhost = Math.hypot(b.x - g.x, b.y - g.y);
        if (dGhost <= g.grazeRadius + b.radius) {
          p.overclock = Math.min(100, p.overclock + 20 * dt);
          if (g.fireCooldownS <= 0) {
            g.fireCooldownS = fireInterval * 1.15;
            firePlayerGrazeVolley(state, g.x, g.y, input.aimX, input.aimY, false);
          }
        }
      }
    }
  }

  p.isCurrentlyGrazing = grazedThisFrame;

  // Trigger Graze-Powered Weapons!
  if (grazedThisFrame && p.grazeFireCooldownS <= 0) {
    p.grazeFireCooldownS = fireInterval;
    firePlayerGrazeVolley(state, p.x, p.y, input.aimX, input.aimY, false);
  } else if (!grazedThisFrame && p.passiveFireCooldownS <= 0 && state.enemies.length > 0) {
    // Low-power baseline pulse so player is never softlocked when an enemy temporarily pauses firing
    p.passiveFireCooldownS = AEGIS_CONFIG.PASSIVE_SUPPORT_FIRE_INTERVAL_S;
    firePlayerGrazeVolley(state, p.x, p.y, input.aimX, input.aimY, true);
  }

  // Update Volatile Flux Gems (4.0s Decay & 1.5s Supercritical Window)
  const magnetRadius =
    AEGIS_CONFIG.GEM_BASE_MAGNET_RADIUS * (1 + getAugmentStacks(state, 'magnet-core') * 0.65);
  const vampStacks = getAugmentStacks(state, 'supercritical-vamp');
  const bloomStacks = getAugmentStacks(state, 'volatile-corpse-bloom');

  for (let i = state.fluxGems.length - 1; i >= 0; i--) {
    const gem = state.fluxGems[i]!;
    gem.ageS += dt;

    // Velocity drag
    gem.vx *= 0.92;
    gem.vy *= 0.92;
    gem.x += gem.vx * dt;
    gem.y += gem.vy * dt;

    const distToP = Math.hypot(p.x - gem.x, p.y - gem.y);
    if (distToP <= magnetRadius) {
      const pullSpeed = 340 * (1 - distToP / (magnetRadius + 10)) + 160;
      gem.x += ((p.x - gem.x) / Math.max(1, distToP)) * pullSpeed * dt;
      gem.y += ((p.y - gem.y) / Math.max(1, distToP)) * pullSpeed * dt;
    }

    // Collect Gem
    if (distToP <= p.coreRadius + 16) {
      const isSupercritical = gem.ageS <= AEGIS_CONFIG.GEM_SUPERCRITICAL_WINDOW_S;
      const xpGain = isSupercritical ? gem.xpValue * 2 : gem.xpValue;
      state.xp += xpGain;
      state.score += (isSupercritical ? 80 : 35) * state.comboMultiplier;

      if (isSupercritical) {
        state.supercriticalGemsCollected++;
        p.overclock = Math.min(100, p.overclock + 14);
        state.comboMultiplier = Math.min(
          AEGIS_CONFIG.MAX_COMBO_MULTIPLIER,
          state.comboMultiplier + 1
        );
        state.peakCombo = Math.max(state.peakCombo, state.comboMultiplier);
        state.comboDecayTimerS = AEGIS_CONFIG.COMBO_DECAY_TIME_S;
        spawnFloatingText(
          state,
          `SUPERCRITICAL +${xpGain} XP!`,
          gem.x,
          gem.y - 12,
          '#fde047',
          true
        );

        if (vampStacks > 0) {
          p.hp = Math.min(p.maxHp, p.hp + 4 * vampStacks);
          spawnShockwave(state, p.x, p.y, 85, '#34d399', 3);
        }
      } else {
        p.overclock = Math.min(100, p.overclock + 6);
        spawnFloatingText(state, `+${xpGain} XP`, gem.x, gem.y - 10, '#38bdf8', false);
      }

      state.frameAudio.gemPickupSupercritical = isSupercritical;
      state.fluxGems.splice(i, 1);

      // Check Level-Up
      while (state.xp >= state.xpToNextLevel) {
        state.xp -= state.xpToNextLevel;
        state.level++;
        state.xpToNextLevel = Math.round(state.xpToNextLevel * 1.28 + 30);
        state.pendingDraftCount++;
      }
      continue;
    }

    // 4.0s Decay Detonation! Uncollected gems explode into shrapnel!
    if (gem.ageS >= gem.maxAgeS) {
      state.expiredGemsDetonated++;
      const isFriendlyShrapnel = bloomStacks > 0;
      spawnShockwave(
        state,
        gem.x,
        gem.y,
        46,
        isFriendlyShrapnel ? '#a855f7' : '#f43f5e',
        3
      );
      for (let s = 0; s < AEGIS_CONFIG.GEM_SHRAPNEL_COUNT_ON_DECAY; s++) {
        const a = (s / AEGIS_CONFIG.GEM_SHRAPNEL_COUNT_ON_DECAY) * Math.PI * 2;
        state.bullets.push({
          id: state.nextEntityId++,
          isPlayer: isFriendlyShrapnel,
          x: gem.x,
          y: gem.y,
          vx: Math.cos(a) * 195,
          vy: Math.sin(a) * 195,
          radius: 4.5,
          damage: isFriendlyShrapnel ? 38 : 12,
          isCrit: isFriendlyShrapnel,
          pierceLeft: 0,
          ricochetLeft: 0,
          homing: false,
          grazedByPlayer: false,
          grazedTickCooldown: 0,
          color: isFriendlyShrapnel ? '#a855f7' : '#f43f5e',
          ageS: 0,
          maxAgeS: 4.0,
        });
      }
      state.fluxGems.splice(i, 1);
    }
  }

  // Update Visual Juice Particles (Sparks with Drag, Lingering Smoke, Shockwaves, Bounce Numbers)
  updateVisualJuiceEntities(state, dt);

  // Check Wave Progression / Boss Victory
  const activeBoss = state.enemies.find((e) => e.isBoss && e.hp > 0);
  const waveTimeComplete = state.waveTimerS >= state.waveDurationS && !activeBoss;

  if (waveTimeComplete) {
    if (state.wave >= AEGIS_CONFIG.MAX_WAVES) {
      state.status = 'victory';
      state.causeOfEnd = 'Obliterated CHRONO-SERAPH OMEGA and cleared all 8 Waves!';
      return;
    }
    state.wave++;
    const nextWaveDef =
      WAVE_SCHEDULE[Math.min(WAVE_SCHEDULE.length - 1, state.wave - 1)] ?? WAVE_SCHEDULE[0]!;
    state.waveTimerS = 0;
    state.waveDurationS = nextWaveDef.durationS;
    state.bossSpawnedThisWave = false;
    state.pendingDraftCount++;
    spawnFloatingText(
      state,
      `WAVE ${state.wave - 1} CLEARED!`,
      p.x,
      p.y - 40,
      '#34d399',
      true
    );
  }

  // Enter 3-Choice Augment Draft if queued
  if (state.pendingDraftCount > 0 && state.status === 'playing') {
    state.status = 'draft';
    state.draftChoices = rollAugmentChoices(state);
  }
}

function applyPlayerDamage(state: AegisSimulationState, amount: number, reason: string): void {
  const p = state.player;
  p.hp = Math.max(0, p.hp - amount);
  p.invulnTimerS = AEGIS_CONFIG.PLAYER_INVULN_AFTER_HIT_S;
  state.comboMultiplier = Math.max(1, Math.floor(state.comboMultiplier * 0.5));
  state.frameAudio.playerHit = true;

  addTrauma(state, AEGIS_CONFIG.TRAUMA_PLAYER_HIT);
  triggerHitstop(state, AEGIS_CONFIG.HITSTOP_HEAVY_MS);
  spawnShockwave(state, p.x, p.y, 95, '#f43f5e', 5);
  spawnSparks(state, p.x, p.y, '#f43f5e', 16, 100, 320);
  spawnFloatingText(state, `-${amount} HULL!`, p.x, p.y - 24, '#f43f5e', true);

  if (p.hp <= 0) {
    state.status = 'defeat';
    state.causeOfEnd = `${reason} on Wave ${state.wave}`;
  }
}

function updateVisualJuiceEntities(state: AegisSimulationState, dt: number): void {
  // Floating visual numbers with gravity & floor bounce physics
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i]!;
    ft.ageS += dt;
    if (ft.ageS >= ft.maxAgeS) {
      state.floatingTexts.splice(i, 1);
      continue;
    }
    ft.vy += 380 * dt; // Gravity
    ft.x += ft.vx * dt;
    ft.y += ft.vy * dt;
    if (ft.y >= ft.floorY && ft.vy > 0) {
      ft.y = ft.floorY;
      ft.vy = -ft.vy * 0.45; // Bounce!
      ft.vx *= 0.7;
    }
  }

  // Sparks with drag & wall deflection
  for (let i = state.sparks.length - 1; i >= 0; i--) {
    const sp = state.sparks[i]!;
    sp.ageS += dt;
    if (sp.ageS >= sp.maxAgeS) {
      state.sparks.splice(i, 1);
      continue;
    }
    sp.vx *= 0.92;
    sp.vy *= 0.92;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
  }

  // Lingering smoke puffs
  for (let i = state.smokePuffs.length - 1; i >= 0; i--) {
    const sm = state.smokePuffs[i]!;
    sm.ageS += dt;
    if (sm.ageS >= sm.maxAgeS) {
      state.smokePuffs.splice(i, 1);
      continue;
    }
    sm.x += sm.vx * dt;
    sm.y += sm.vy * dt;
    sm.radius += 16 * dt;
  }

  // Shockwave expansion rings
  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const sw = state.shockwaves[i]!;
    sw.ageS += dt;
    if (sw.ageS >= sw.maxAgeS) {
      state.shockwaves.splice(i, 1);
      continue;
    }
    const progress = sw.ageS / sw.maxAgeS;
    sw.radius = 8 + (sw.maxRadius - 8) * (1 - Math.pow(1 - progress, 2));
  }

  // Lightning arcs
  for (let i = state.lightningArcs.length - 1; i >= 0; i--) {
    const arc = state.lightningArcs[i]!;
    arc.ageS += dt;
    if (arc.ageS >= arc.maxAgeS) {
      state.lightningArcs.splice(i, 1);
    }
  }
}

export function buildRunTelemetryRecord(state: AegisSimulationState): RunTelemetryRecord {
  return {
    runKey: `${state.runKey}-t${state.tick}`,
    seed: state.seed,
    loadoutId: state.loadoutId,
    outcome: state.status === 'victory' ? 'victory' : 'defeat',
    waveReached: state.wave,
    score: state.score,
    peakCombo: state.peakCombo,
    totalDamageDealt: state.totalDamageDealt,
    bulletsGrazed: state.bulletsGrazed,
    bulletsShattered: state.bulletsShattered,
    supercriticalGemsCollected: state.supercriticalGemsCollected,
    augmentsPicked: [...state.augmentHistory],
    causeOfEnd: state.causeOfEnd,
    timestampIso: new Date().toISOString(),
  };
}
