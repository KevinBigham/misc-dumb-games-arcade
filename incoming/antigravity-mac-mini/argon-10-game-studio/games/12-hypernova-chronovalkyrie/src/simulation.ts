import { HYPERNOVA_CONFIG, type ComboGrade } from './config';
import {
  AUGMENT_REGISTRY,
  CHASSIS_REGISTRY,
  ENEMY_REGISTRY,
  WAVE_SCHEDULES,
  WEAPON_REGISTRY,
  type AugmentDef,
  type ChassisId,
  type EnemyArchetypeId,
  type WeaponId,
} from './content';
import { HypernovaRNG } from './rng';

export interface PlayerWeaponSlot {
  weaponId: WeaponId;
  level: number;
  cooldownTimer: number;
}

export interface PlayerAugmentSlot {
  augmentId: string;
  rank: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  chassisId: ChassisId;

  hull: number;
  maxHull: number;
  shield: number;
  maxShield: number;
  shieldRegenTimer: number;

  chronoEnergy: number;
  maxChronoEnergy: number;
  isDrifting: boolean;
  driftTimer: number;

  isDashing: boolean;
  dashTimer: number;
  dashCooldownTimer: number;
  dashCharges: number;
  maxDashCharges: number;

  invulnerableTimer: number;
  rewindAvailable: boolean;

  weapons: PlayerWeaponSlot[];
  augments: PlayerAugmentSlot[];

  level: number;
  xp: number;
  xpNext: number;
}

export interface EnemyEntity {
  id: number;
  archetype: EnemyArchetypeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  radius: number;
  angle: number;
  shootCooldown: number;
  sniperChargeTimer: number;
  spiralPhase: number;
  shieldActive: boolean;
  isBoss: boolean;
}

export interface ProjectileEntity {
  id: number;
  fromPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  pierce: number;
  radius: number;
  color: string;
  duration: number;
  isHoming: boolean;
  homingTargetId?: number;
  weaponType?: WeaponId;
  special?: 'SINGULARITY' | 'PARRIED_BEAM' | 'ENEMY_BOLT' | 'ENEMY_SNIPER' | 'ENEMY_SPIRAL';
}

export interface XpGemEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
}

export interface NaniteCellEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  healAmount: number;
}

export interface DecoyEntity {
  id: number;
  x: number;
  y: number;
  duration: number;
  hp: number;
}

export interface GrazeRecord {
  projectileId: number;
  timestampSec: number;
}

export type HypernovaSimEventType =
  | 'PLAYER_HIT'
  | 'SHIELD_BREAK'
  | 'GRAZE'
  | 'KILL'
  | 'CRIT_HIT'
  | 'LEVEL_UP'
  | 'WAVE_START'
  | 'BOSS_SPAWN'
  | 'BOSS_KILL'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'DASH'
  | 'CHRONO_DRIFT_START'
  | 'CHRONO_DRIFT_END'
  | 'PARRY'
  | 'REWIND_TRIGGERED'
  | 'AUGMENT_SELECTED';

export interface HypernovaSimEvent {
  type: HypernovaSimEventType;
  x?: number;
  y?: number;
  value?: number;
  text?: string;
  data?: unknown;
}

export type GameRunStatus =
  | 'READY'
  | 'PLAYING'
  | 'DRAFTING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface HypernovaGameState {
  seed: number;
  tickCount: number;
  elapsedSec: number;
  status: GameRunStatus;

  player: PlayerState;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  xpGems: XpGemEntity[];
  naniteCells: NaniteCellEntity[];
  decoys: DecoyEntity[];

  // Wave & Spawning
  currentWave: number;
  waveTimer: number;
  waveDuration: number;
  waveSpawnTimers: Record<string, number>;
  activeBossId: number | null;
  endlessMode: boolean;

  // Combo Engine
  comboPoints: number;
  comboGrade: ComboGrade;
  comboMultiplier: number;
  comboDecayTimer: number;
  totalGrazes: number;
  totalKills: number;
  totalDamageDealt: number;
  highestComboGrade: ComboGrade;
  score: number;

  // Drafting
  pendingDraftChoices: AugmentDef[];

  // Internals
  recentGrazes: GrazeRecord[];
  events: HypernovaSimEvent[];
  nextEntityId: number;
  rngState: number;
}

export interface HypernovaInputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  aimX: number; // arena coords
  aimY: number; // arena coords
  firing: boolean;
  dashRequested: boolean;
  chronoRequested: boolean;
  draftChoiceIndex?: number; // 0, 1, 2
}

/**
 * Creates the initial pure deterministic game state.
 */
export function createInitialHypernovaState(
  seed: number = HYPERNOVA_CONFIG.DEFAULT_SEED,
  chassisId: ChassisId = 'interceptor'
): HypernovaGameState {
  const rng = new HypernovaRNG(seed);
  const chassis = CHASSIS_REGISTRY[chassisId];

  const player: PlayerState = {
    x: HYPERNOVA_CONFIG.ARENA_WIDTH / 2,
    y: HYPERNOVA_CONFIG.ARENA_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: 14,
    rotation: -Math.PI / 2,
    chassisId,

    hull: chassis.baseHull,
    maxHull: chassis.baseHull,
    shield: chassis.baseShield,
    maxShield: chassis.baseShield,
    shieldRegenTimer: 0,

    chronoEnergy: HYPERNOVA_CONFIG.CHRONO_ENERGY_MAX,
    maxChronoEnergy: HYPERNOVA_CONFIG.CHRONO_ENERGY_MAX,
    isDrifting: false,
    driftTimer: 0,

    isDashing: false,
    dashTimer: 0,
    dashCooldownTimer: 0,
    dashCharges: chassisId === 'interceptor' ? 2 : 1,
    maxDashCharges: chassisId === 'interceptor' ? 2 : 1,

    invulnerableTimer: 0,
    rewindAvailable: true,

    weapons: [{ weaponId: chassis.startingWeaponId, level: 1, cooldownTimer: 0 }],
    augments: [],

    level: 1,
    xp: 0,
    xpNext: HYPERNOVA_CONFIG.XP_BASE_REQUIRED,
  };

  return {
    seed,
    tickCount: 0,
    elapsedSec: 0,
    status: 'READY',

    player,
    enemies: [],
    projectiles: [],
    xpGems: [],
    naniteCells: [],
    decoys: [],

    currentWave: 1,
    waveTimer: 0,
    waveDuration: WAVE_SCHEDULES[0].durationSec,
    waveSpawnTimers: {},
    activeBossId: null,
    endlessMode: false,

    comboPoints: 0,
    comboGrade: 'D',
    comboMultiplier: 1.0,
    comboDecayTimer: 0,
    totalGrazes: 0,
    totalKills: 0,
    totalDamageDealt: 0,
    highestComboGrade: 'D',
    score: 0,

    pendingDraftChoices: [],

    recentGrazes: [],
    events: [],
    nextEntityId: 1,
    rngState: rng.getState(),
  };
}

/**
 * Calculates current player derived stats by folding chassis base and all installed augments.
 */
export function getPlayerDerivedStats(player: PlayerState): {
  speed: number;
  damageMultiplier: number;
  fireRateMultiplier: number;
  critChance: number;
  critMultiplier: number;
  shieldRegenRate: number;
  chronoDriftDuration: number;
  grazeBonusMultiplier: number;
  extraProjectiles: number;
  pierceBonus: number;
  hasChainLightning: boolean;
  hasAegisNova: boolean;
  hasGravitonCrit: boolean;
  hasBulletMirror: boolean;
  hasNaniteHarvest: boolean;
  hasThrusterBurn: boolean;
  hasChronosRewind: boolean;
  hasApexOverdrive: boolean;
} {
  const chassis = CHASSIS_REGISTRY[player.chassisId];

  let damageMultiplier = 1.0;
  let fireRateMultiplier = 1.0;
  let speedMultiplier = chassis.speedMultiplier;
  let critChance = chassis.critChance;
  let critMultiplier = chassis.critMultiplier;
  let shieldRegenRate = HYPERNOVA_CONFIG.SHIELD_REGEN_RATE;
  let chronoDriftDuration = HYPERNOVA_CONFIG.CHRONO_DRIFT_DURATION_SEC;
  let grazeBonusMultiplier = 1.0;
  let extraProjectiles = 0;
  let pierceBonus = 0;

  let hasChainLightning = false;
  let hasAegisNova = false;
  let hasGravitonCrit = false;
  let hasBulletMirror = false;
  let hasNaniteHarvest = false;
  let hasThrusterBurn = false;
  let hasChronosRewind = false;
  let hasApexOverdrive = false;

  for (const augSlot of player.augments) {
    const def = AUGMENT_REGISTRY.find((a) => a.id === augSlot.augmentId);
    if (!def) continue;

    const rank = augSlot.rank;
    if (def.statModifiers.damageMultiplier) damageMultiplier += def.statModifiers.damageMultiplier * rank;
    if (def.statModifiers.fireRateMultiplier) fireRateMultiplier *= Math.pow(def.statModifiers.fireRateMultiplier, rank);
    if (def.statModifiers.speedMultiplier) speedMultiplier += def.statModifiers.speedMultiplier * rank;
    if (def.statModifiers.critChanceDelta) critChance += def.statModifiers.critChanceDelta * rank;
    if (def.statModifiers.critMultiplierDelta) critMultiplier += def.statModifiers.critMultiplierDelta * rank;
    if (def.statModifiers.shieldRegenMultiplier) shieldRegenRate *= Math.pow(def.statModifiers.shieldRegenMultiplier, rank);
    if (def.statModifiers.chronoDurationDelta) chronoDriftDuration += def.statModifiers.chronoDurationDelta * rank;
    if (def.statModifiers.grazeBonusMultiplier) grazeBonusMultiplier += (def.statModifiers.grazeBonusMultiplier - 1) * rank;
    if (def.statModifiers.extraProjectiles) extraProjectiles += def.statModifiers.extraProjectiles * rank;
    if (def.statModifiers.pierceDelta) pierceBonus += def.statModifiers.pierceDelta * rank;

    if (def.specialEffect === 'CHAIN_LIGHTNING') hasChainLightning = true;
    if (def.specialEffect === 'AEGIS_NOVA') hasAegisNova = true;
    if (def.specialEffect === 'GRAVITON_CRIT') hasGravitonCrit = true;
    if (def.specialEffect === 'BULLET_MIRROR') hasBulletMirror = true;
    if (def.specialEffect === 'NANITE_HARVEST') hasNaniteHarvest = true;
    if (def.specialEffect === 'THRUSTER_BURN') hasThrusterBurn = true;
    if (def.specialEffect === 'CHRONOS_REWIND') hasChronosRewind = true;
    if (def.specialEffect === 'APEX_OVERDRIVE') hasApexOverdrive = true;
  }

  return {
    speed: HYPERNOVA_CONFIG.BASE_SPEED * speedMultiplier,
    damageMultiplier,
    fireRateMultiplier,
    critChance: Math.min(0.9, critChance),
    critMultiplier,
    shieldRegenRate,
    chronoDriftDuration,
    grazeBonusMultiplier,
    extraProjectiles,
    pierceBonus,
    hasChainLightning,
    hasAegisNova,
    hasGravitonCrit,
    hasBulletMirror,
    hasNaniteHarvest,
    hasThrusterBurn,
    hasChronosRewind,
    hasApexOverdrive,
  };
}

/**
 * Updates combo grade & multiplier based on current combo points.
 */
export function updateComboStatus(state: HypernovaGameState): void {
  const tiers = HYPERNOVA_CONFIG.COMBO_TIERS;
  let activeTier: (typeof HYPERNOVA_CONFIG.COMBO_TIERS)[number] = tiers[0];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (state.comboPoints >= tiers[i].threshold) {
      activeTier = tiers[i];
      break;
    }
  }

  state.comboGrade = activeTier.grade;
  state.comboMultiplier = activeTier.multiplier;

  // Track personal peak combo grade
  const tierOrder = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'APEX'];
  if (tierOrder.indexOf(state.comboGrade) > tierOrder.indexOf(state.highestComboGrade)) {
    state.highestComboGrade = state.comboGrade;
  }
}

/**
 * Adds combo points with anti-decay protection.
 */
export function addComboPoints(state: HypernovaGameState, points: number): void {
  state.comboPoints += points;
  state.comboDecayTimer = HYPERNOVA_CONFIG.COMBO_DECAY_DELAY_SEC;
  updateComboStatus(state);
}

/**
 * Generate 3 randomized upgrade cards for leveling up.
 */
export function generateDraftChoices(state: HypernovaGameState): AugmentDef[] {
  const rng = new HypernovaRNG(state.rngState);
  const availableAugments = AUGMENT_REGISTRY.filter((aug) => {
    const existing = state.player.augments.find((a) => a.augmentId === aug.id);
    return !existing || existing.rank < aug.maxRank;
  });

  const shuffled = rng.shuffle(availableAugments);
  const choices = shuffled.slice(0, HYPERNOVA_CONFIG.MAX_AUGMENT_CHOICES);
  state.rngState = rng.getState();
  return choices;
}

/**
 * Applies player selection of a draft choice.
 */
export function selectDraftChoice(state: HypernovaGameState, choiceIndex: number): boolean {
  if (state.status !== 'DRAFTING') return false;
  const choice = state.pendingDraftChoices[choiceIndex];
  if (!choice) return false;

  const existing = state.player.augments.find((a) => a.augmentId === choice.id);
  if (existing) {
    existing.rank += 1;
  } else {
    state.player.augments.push({ augmentId: choice.id, rank: 1 });
  }

  // Recalculate max hull / shield if modified
  if (choice.statModifiers.hullMaxDelta) {
    state.player.maxHull += choice.statModifiers.hullMaxDelta;
    state.player.hull += choice.statModifiers.hullMaxDelta;
  }
  if (choice.statModifiers.shieldMaxDelta) {
    state.player.maxShield += choice.statModifiers.shieldMaxDelta;
    state.player.shield += choice.statModifiers.shieldMaxDelta;
  }

  // Also offer weapon unlocks if certain thresholds reached
  if (state.player.level === 3 && !state.player.weapons.some((w) => w.weaponId === 'railgun')) {
    state.player.weapons.push({ weaponId: 'railgun', level: 1, cooldownTimer: 0 });
  } else if (state.player.level === 5 && !state.player.weapons.some((w) => w.weaponId === 'swarm_missiles')) {
    state.player.weapons.push({ weaponId: 'swarm_missiles', level: 1, cooldownTimer: 0 });
  } else if (state.player.level === 7 && !state.player.weapons.some((w) => w.weaponId === 'singularity')) {
    state.player.weapons.push({ weaponId: 'singularity', level: 1, cooldownTimer: 0 });
  } else if (state.player.level === 9 && !state.player.weapons.some((w) => w.weaponId === 'energy_blade')) {
    state.player.weapons.push({ weaponId: 'energy_blade', level: 1, cooldownTimer: 0 });
  }

  state.events.push({
    type: 'AUGMENT_SELECTED',
    text: `Equipped: ${choice.name} (Tier ${choice.rarity})`,
    data: choice,
  });

  state.pendingDraftChoices = [];
  state.status = 'PLAYING';
  return true;
}

/**
 * Pure simulation advance by delta time in milliseconds.
 */
export function stepHypernovaState(
  state: HypernovaGameState,
  input: HypernovaInputState,
  deltaMs: number
): void {
  state.events = [];
  if (state.status !== 'PLAYING') {
    if (state.status === 'READY') {
      state.status = 'PLAYING';
      state.events.push({
        type: 'WAVE_START',
        value: state.currentWave,
        text: WAVE_SCHEDULES[0].name,
      });
    } else if (state.status === 'DRAFTING' && input.draftChoiceIndex !== undefined) {
      selectDraftChoice(state, input.draftChoiceIndex);
    }
    return;
  }

  const dtSec = Math.min(deltaMs, HYPERNOVA_CONFIG.MAX_DELTA_MS) / 1000.0;
  state.elapsedSec += dtSec;
  state.tickCount++;

  const rng = new HypernovaRNG(state.rngState);
  const derived = getPlayerDerivedStats(state.player);

  // 1. Chrono-Drift (Bullet-Time) state management
  if (input.chronoRequested && !state.player.isDrifting && state.player.chronoEnergy >= HYPERNOVA_CONFIG.CHRONO_ENERGY_COST) {
    state.player.isDrifting = true;
    state.player.driftTimer = derived.chronoDriftDuration;
    state.player.chronoEnergy -= HYPERNOVA_CONFIG.CHRONO_ENERGY_COST;
    state.events.push({
      type: 'CHRONO_DRIFT_START',
      text: 'CHRONO-DRIFT ENGAGED [0.2x TIME DILATION]',
    });
  }

  if (state.player.isDrifting) {
    state.player.driftTimer -= dtSec;
    if (state.player.driftTimer <= 0) {
      state.player.isDrifting = false;
      state.player.driftTimer = 0;
      state.events.push({
        type: 'CHRONO_DRIFT_END',
        text: 'TIMESTREAM RESTORED',
      });
    }
  } else {
    // Passive chrono energy recharge
    state.player.chronoEnergy = Math.min(
      state.player.maxChronoEnergy,
      state.player.chronoEnergy + HYPERNOVA_CONFIG.CHRONO_ENERGY_RECHARGE_RATE * dtSec
    );
  }

  // Determine world timescale: when Chrono-Drift is active, world moves at 22% speed!
  const worldTimeScale = state.player.isDrifting ? HYPERNOVA_CONFIG.CHRONO_DRIFT_TIMESCALE : 1.0;
  const worldDtSec = dtSec * worldTimeScale;

  // 2. Dash / Phase Shift
  if (state.player.dashCooldownTimer > 0) {
    state.player.dashCooldownTimer -= dtSec;
  }

  if (
    input.dashRequested &&
    !state.player.isDashing &&
    state.player.dashCooldownTimer <= 0 &&
    state.player.dashCharges > 0
  ) {
    state.player.isDashing = true;
    state.player.dashTimer = HYPERNOVA_CONFIG.DASH_DURATION_SEC;
    state.player.dashCharges--;
    state.player.dashCooldownTimer =
      HYPERNOVA_CONFIG.DASH_COOLDOWN_SEC * CHASSIS_REGISTRY[state.player.chassisId].dashCooldownMultiplier;
    state.player.invulnerableTimer = Math.max(state.player.invulnerableTimer, HYPERNOVA_CONFIG.DASH_DURATION_SEC);

    state.events.push({
      type: 'DASH',
      x: state.player.x,
      y: state.player.y,
      text: 'PHASE DASH',
    });

    // Colossus shockwave deflect
    if (state.player.chassisId === 'colossus') {
      deflectNearbyProjectiles(state, 140);
    }

    // Phantom decoy deploy
    if (state.player.chassisId === 'phantom') {
      state.decoys.push({
        id: state.nextEntityId++,
        x: state.player.x,
        y: state.player.y,
        duration: 3.5,
        hp: 120,
      });
    }

    // Bullet Mirror augment check
    if (derived.hasBulletMirror) {
      deflectNearbyProjectiles(state, 120, true);
    }
  }

  if (state.player.isDashing) {
    state.player.dashTimer -= dtSec;
    if (state.player.dashTimer <= 0) {
      state.player.isDashing = false;
      state.player.dashTimer = 0;
      if (state.player.dashCharges < state.player.maxDashCharges && state.player.dashCooldownTimer <= 0) {
        state.player.dashCharges = state.player.maxDashCharges;
      }
    }
  } else if (state.player.dashCooldownTimer <= 0 && state.player.dashCharges < state.player.maxDashCharges) {
    state.player.dashCharges = state.player.maxDashCharges;
  }

  // 3. Player Movement & Rotation
  const moveMag = Math.hypot(input.moveX, input.moveY);
  const currentSpeed = state.player.isDashing
    ? derived.speed * HYPERNOVA_CONFIG.DASH_SPEED_MULTIPLIER
    : derived.speed;

  if (moveMag > 0.05) {
    const normX = input.moveX / moveMag;
    const normY = input.moveY / moveMag;
    state.player.vx = normX * currentSpeed;
    state.player.vy = normY * currentSpeed;
  } else {
    state.player.vx *= 0.82;
    state.player.vy *= 0.82;
  }

  state.player.x += state.player.vx * dtSec;
  state.player.y += state.player.vy * dtSec;

  // Clamp within arena boundaries
  const margin = state.player.radius + 6;
  state.player.x = Math.max(margin, Math.min(HYPERNOVA_CONFIG.ARENA_WIDTH - margin, state.player.x));
  state.player.y = Math.max(margin, Math.min(HYPERNOVA_CONFIG.ARENA_HEIGHT - margin, state.player.y));

  // Aim rotation toward mouse / target
  const aimDx = input.aimX - state.player.x;
  const aimDy = input.aimY - state.player.y;
  if (Math.hypot(aimDx, aimDy) > 5) {
    state.player.rotation = Math.atan2(aimDy, aimDx);
  }

  // 4. Shield Regeneration & Invulnerability
  if (state.player.invulnerableTimer > 0) {
    state.player.invulnerableTimer -= dtSec;
  }

  if (state.player.shieldRegenTimer > 0) {
    state.player.shieldRegenTimer -= dtSec;
  } else if (state.player.shield < state.player.maxShield) {
    state.player.shield = Math.min(
      state.player.maxShield,
      state.player.shield + derived.shieldRegenRate * dtSec
    );
  }

  // 5. Decoys Update
  for (let i = state.decoys.length - 1; i >= 0; i--) {
    const decoy = state.decoys[i];
    decoy.duration -= worldDtSec;
    if (decoy.duration <= 0 || decoy.hp <= 0) {
      // Detonate decoy with explosion
      detonateAreaDamage(state, decoy.x, decoy.y, 90, 80);
      state.decoys.splice(i, 1);
    }
  }

  // 6. Player Weapons Firing
  const isFiring = input.firing;
  for (const slot of state.player.weapons) {
    const weaponDef = WEAPON_REGISTRY[slot.weaponId];
    if (!weaponDef) continue;

    if (slot.cooldownTimer > 0) {
      slot.cooldownTimer -= dtSec;
    }

    if (isFiring && slot.cooldownTimer <= 0) {
      firePlayerWeapon(state, slot, weaponDef, derived, rng);
      slot.cooldownTimer = weaponDef.cooldownSec * derived.fireRateMultiplier;
    }
  }

  // 7. Projectiles Update (Player and Enemy)
  updateProjectiles(state, dtSec, worldDtSec, rng, derived);

  // 8. Enemies AI, Movement & Spawning
  updateEnemies(state, worldDtSec, rng);

  // 9. XP Gems & Nanites Magnetism & Collection
  updatePickups(state, dtSec);

  // 10. Graze System Check
  checkBulletGraze(state, derived);

  // 11. Collisions: Player vs Enemy / Bullets
  checkPlayerCollisions(state, derived);

  // 12. Combo Decay Timer
  if (state.comboDecayTimer > 0) {
    state.comboDecayTimer -= dtSec;
  } else if (state.comboPoints > 0) {
    const decayAmount = HYPERNOVA_CONFIG.COMBO_DECAY_RATE_PER_SEC * dtSec;
    state.comboPoints = Math.max(0, state.comboPoints - decayAmount);
    updateComboStatus(state);
  }

  // 13. Wave Progression
  updateWaveProgression(state, dtSec, rng);

  state.rngState = rng.getState();
}

/**
 * Fires player weapons based on definition and augment modifiers.
 */
function firePlayerWeapon(
  state: HypernovaGameState,
  slot: PlayerWeaponSlot,
  def: (typeof WEAPON_REGISTRY)[WeaponId],
  derived: ReturnType<typeof getPlayerDerivedStats>,
  rng: HypernovaRNG
): void {
  const baseAngle = state.player.rotation;
  const count = def.projectileCount + derived.extraProjectiles;
  const pierce = def.pierce + derived.pierceBonus;

  if (def.id === 'vulcan') {
    const spread = def.spreadRad;
    const startAngle = baseAngle - (spread * (count - 1)) / 2;
    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * spread + rng.rangeFloat(-0.02, 0.02);
      const isCrit = rng.chance(derived.critChance);
      const damage = Math.round(
        def.damage * derived.damageMultiplier * (isCrit ? derived.critMultiplier : 1.0)
      );

      state.projectiles.push({
        id: state.nextEntityId++,
        fromPlayer: true,
        x: state.player.x + Math.cos(angle) * 16,
        y: state.player.y + Math.sin(angle) * 16,
        vx: Math.cos(angle) * def.projectileSpeed,
        vy: Math.sin(angle) * def.projectileSpeed,
        damage,
        pierce,
        radius: def.radius,
        color: isCrit ? '#fde047' : def.color,
        duration: def.durationSec,
        isHoming: false,
        weaponType: def.id,
      });

      if (isCrit) {
        state.events.push({ type: 'CRIT_HIT', value: damage });
      }
    }
  } else if (def.id === 'railgun') {
    const isCrit = rng.chance(derived.critChance);
    const damage = Math.round(
      def.damage * derived.damageMultiplier * (isCrit ? derived.critMultiplier : 1.0)
    );

    state.projectiles.push({
      id: state.nextEntityId++,
      fromPlayer: true,
      x: state.player.x + Math.cos(baseAngle) * 20,
      y: state.player.y + Math.sin(baseAngle) * 20,
      vx: Math.cos(baseAngle) * def.projectileSpeed,
      vy: Math.sin(baseAngle) * def.projectileSpeed,
      damage,
      pierce: 99,
      radius: def.radius,
      color: '#00f0ff',
      duration: def.durationSec,
      isHoming: false,
      weaponType: def.id,
    });
  } else if (def.id === 'swarm_missiles') {
    for (let i = 0; i < count; i++) {
      const offsetAngle = baseAngle + rng.rangeFloat(-0.5, 0.5);
      const isCrit = rng.chance(derived.critChance);
      const damage = Math.round(
        def.damage * derived.damageMultiplier * (isCrit ? derived.critMultiplier : 1.0)
      );

      state.projectiles.push({
        id: state.nextEntityId++,
        fromPlayer: true,
        x: state.player.x + Math.cos(offsetAngle) * 12,
        y: state.player.y + Math.sin(offsetAngle) * 12,
        vx: Math.cos(offsetAngle) * def.projectileSpeed * 0.5,
        vy: Math.sin(offsetAngle) * def.projectileSpeed * 0.5,
        damage,
        pierce: 1,
        radius: def.radius,
        color: def.color,
        duration: def.durationSec,
        isHoming: true,
        weaponType: def.id,
      });
    }
  } else if (def.id === 'singularity') {
    const damage = Math.round(def.damage * derived.damageMultiplier);
    state.projectiles.push({
      id: state.nextEntityId++,
      fromPlayer: true,
      x: state.player.x + Math.cos(baseAngle) * 24,
      y: state.player.y + Math.sin(baseAngle) * 24,
      vx: Math.cos(baseAngle) * def.projectileSpeed,
      vy: Math.sin(baseAngle) * def.projectileSpeed,
      damage,
      pierce: 1,
      radius: def.radius,
      color: def.color,
      duration: def.durationSec,
      isHoming: false,
      weaponType: def.id,
      special: 'SINGULARITY',
    });
  }
}

/**
 * Updates all projectile physics, homing logic, enemy collision, and lifetimes.
 */
function updateProjectiles(
  state: HypernovaGameState,
  playerDtSec: number,
  worldDtSec: number,
  rng: HypernovaRNG,
  derived: ReturnType<typeof getPlayerDerivedStats>
): void {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    const dt = proj.fromPlayer ? playerDtSec : worldDtSec;

    proj.duration -= dt;
    if (proj.duration <= 0) {
      if (proj.special === 'SINGULARITY') {
        detonateAreaDamage(state, proj.x, proj.y, 110, proj.damage * 1.5);
      }
      state.projectiles.splice(i, 1);
      continue;
    }

    // Homing micro-missiles tracking nearest enemy
    if (proj.isHoming && proj.fromPlayer && state.enemies.length > 0) {
      let closestEnemy: EnemyEntity | null = null;
      let closestDist = 999999;
      for (const enemy of state.enemies) {
        const d = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (d < closestDist) {
          closestDist = d;
          closestEnemy = enemy;
        }
      }

      if (closestEnemy) {
        const targetAngle = Math.atan2(closestEnemy.y - proj.y, closestEnemy.x - proj.x);
        const currentAngle = Math.atan2(proj.vy, proj.vx);
        let diff = targetAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        const turnSpeed = 6.5 * dt;
        const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
        const speed = Math.hypot(proj.vx, proj.vy) * 1.02;
        proj.vx = Math.cos(newAngle) * Math.min(speed, 650);
        proj.vy = Math.sin(newAngle) * Math.min(speed, 650);
      }
    }

    // Singularity vortex gravity pull on nearby foes
    if (proj.special === 'SINGULARITY') {
      const pullRadius = 140;
      for (const enemy of state.enemies) {
        const d = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (d < pullRadius && d > 8) {
          const pullStrength = (1 - d / pullRadius) * 280 * dt;
          enemy.x += ((proj.x - enemy.x) / d) * pullStrength;
          enemy.y += ((proj.y - enemy.y) / d) * pullStrength;
        }
      }
    }

    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;

    // Check bounds
    if (
      proj.x < -40 ||
      proj.x > HYPERNOVA_CONFIG.ARENA_WIDTH + 40 ||
      proj.y < -40 ||
      proj.y > HYPERNOVA_CONFIG.ARENA_HEIGHT + 40
    ) {
      state.projectiles.splice(i, 1);
      continue;
    }

    // Player projectile collision vs Enemies
    if (proj.fromPlayer) {
      for (let eIdx = state.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = state.enemies[eIdx];
        const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);

        if (dist <= proj.radius + enemy.radius) {
          // Shield check for Bulwark Cruiser
          let effectiveDamage = proj.damage;
          if (enemy.archetype === 'bulwark_cruiser' && enemy.shieldActive) {
            const angleToProj = Math.atan2(proj.y - enemy.y, proj.x - enemy.x);
            let angleDiff = Math.abs(angleToProj - enemy.angle);
            while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
            if (angleDiff < Math.PI / 3) {
              // Hit frontal shield
              effectiveDamage = Math.round(effectiveDamage * 0.15);
              state.events.push({
                type: 'CRIT_HIT',
                x: enemy.x,
                y: enemy.y,
                text: 'SHIELDED (85% REDUCED)',
              });
            }
          }

          enemy.hp -= effectiveDamage;
          state.totalDamageDealt += effectiveDamage;
          addComboPoints(state, Math.round(effectiveDamage * 0.4));

          state.events.push({
            type: 'PLAYER_HIT',
            x: enemy.x,
            y: enemy.y,
            value: effectiveDamage,
          });

          // Graviton Collapse perk check
          if (derived.hasGravitonCrit && rng.chance(0.2)) {
            pullSurroundingEnemies(state, enemy.x, enemy.y, 160, 200);
          }

          // Enemy Death
          if (enemy.hp <= 0) {
            handleEnemyKill(state, enemy, eIdx, rng, derived);
          }

          proj.pierce--;
          if (proj.pierce <= 0) {
            state.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }
}

/**
 * Pulls surrounding enemies toward an impact point.
 */
function pullSurroundingEnemies(
  state: HypernovaGameState,
  originX: number,
  originY: number,
  radius: number,
  force: number
): void {
  for (const enemy of state.enemies) {
    const d = Math.hypot(enemy.x - originX, enemy.y - originY);
    if (d < radius && d > 6) {
      const pull = ((radius - d) / radius) * force * 0.05;
      enemy.x += ((originX - enemy.x) / d) * pull;
      enemy.y += ((originY - enemy.y) / d) * pull;
    }
  }
}

/**
 * Handles slain enemy rewards, XP drops, chain lightning, and boss victories.
 */
function handleEnemyKill(
  state: HypernovaGameState,
  enemy: EnemyEntity,
  enemyIndex: number,
  rng: HypernovaRNG,
  derived: ReturnType<typeof getPlayerDerivedStats>
): void {
  state.enemies.splice(enemyIndex, 1);
  state.totalKills++;

  const enemyDef = ENEMY_REGISTRY[enemy.archetype];
  const scoreGained = Math.round(enemyDef.scoreValue * state.comboMultiplier);
  state.score += scoreGained;
  addComboPoints(state, enemyDef.scoreValue);

  // Drop XP Gem
  state.xpGems.push({
    id: state.nextEntityId++,
    x: enemy.x,
    y: enemy.y,
    vx: rng.rangeFloat(-40, 40),
    vy: rng.rangeFloat(-40, 40),
    value: enemyDef.xpValue,
  });

  // Drop Nanite repair cell if augment equipped
  if (derived.hasNaniteHarvest && rng.chance(0.25)) {
    state.naniteCells.push({
      id: state.nextEntityId++,
      x: enemy.x,
      y: enemy.y,
      vx: rng.rangeFloat(-20, 20),
      vy: rng.rangeFloat(-20, 20),
      healAmount: 12,
    });
  }

  // Superconductor Chain Lightning augment
  if (derived.hasChainLightning) {
    chainLightningDischarge(state, enemy.x, enemy.y, 3, 40);
  }

  // Boss kill handling
  if (enemy.isBoss) {
    state.activeBossId = null;
    state.events.push({
      type: 'BOSS_KILL',
      x: enemy.x,
      y: enemy.y,
      text: `${enemyDef.name} OBLITERATED!`,
    });

    if (enemy.archetype === 'boss_chronos') {
      state.status = 'VICTORY';
      state.events.push({
        type: 'VICTORY',
        text: 'TIMESTREAM ANOMALY PURGED — OMEGA VICTORY!',
      });
    }
  } else {
    state.events.push({
      type: 'KILL',
      x: enemy.x,
      y: enemy.y,
      value: scoreGained,
    });
  }
}

/**
 * Arcs lightning from an origin point to nearby foes.
 */
function chainLightningDischarge(
  state: HypernovaGameState,
  originX: number,
  originY: number,
  targetsCount: number,
  damage: number
): void {
  let struck = 0;
  for (const target of state.enemies) {
    if (struck >= targetsCount) break;
    const d = Math.hypot(target.x - originX, target.y - originY);
    if (d < 240) {
      target.hp -= damage;
      state.totalDamageDealt += damage;
      state.events.push({
        type: 'CRIT_HIT',
        x: target.x,
        y: target.y,
        text: `⚡ CHAIN ${damage}`,
      });
      struck++;
    }
  }
}

/**
 * Explodes damage in a localized circular area.
 */
function detonateAreaDamage(
  state: HypernovaGameState,
  x: number,
  y: number,
  radius: number,
  damage: number
): void {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    const d = Math.hypot(enemy.x - x, enemy.y - y);
    if (d <= radius + enemy.radius) {
      enemy.hp -= damage;
      state.totalDamageDealt += damage;
      if (enemy.hp <= 0) {
        const rng = new HypernovaRNG(state.rngState);
        const derived = getPlayerDerivedStats(state.player);
        handleEnemyKill(state, enemy, i, rng, derived);
        state.rngState = rng.getState();
      }
    }
  }
}

/**
 * Deflects nearby enemy projectiles away from the player.
 */
function deflectNearbyProjectiles(
  state: HypernovaGameState,
  radius: number,
  turnToPlayerLaser: boolean = false
): void {
  for (const proj of state.projectiles) {
    if (!proj.fromPlayer) {
      const d = Math.hypot(proj.x - state.player.x, proj.y - state.player.y);
      if (d <= radius) {
        if (turnToPlayerLaser) {
          proj.fromPlayer = true;
          proj.vx = -proj.vx * 1.5;
          proj.vy = -proj.vy * 1.5;
          proj.damage = Math.round(proj.damage * 2.5);
          proj.color = '#00f0ff';
          state.events.push({
            type: 'PARRY',
            x: proj.x,
            y: proj.y,
            text: 'BULLET MIRROR PARRY!',
          });
        } else {
          proj.vx = -proj.vx * 1.2;
          proj.vy = -proj.vy * 1.2;
          state.events.push({
            type: 'PARRY',
            x: proj.x,
            y: proj.y,
            text: 'KINETIC DEFLECTION',
          });
        }
      }
    }
  }
}

/**
 * Updates AI behavior, steering, aiming, and firing for all active enemies.
 */
function updateEnemies(
  state: HypernovaGameState,
  worldDtSec: number,
  rng: HypernovaRNG
): void {
  // Target: Decoy if present, else Player
  const targetX = state.decoys.length > 0 ? state.decoys[0].x : state.player.x;
  const targetY = state.decoys.length > 0 ? state.decoys[0].y : state.player.y;

  for (const enemy of state.enemies) {
    const def = ENEMY_REGISTRY[enemy.archetype];
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const distToTarget = Math.hypot(dx, dy);

    enemy.angle = Math.atan2(dy, dx);
    enemy.shootCooldown -= worldDtSec;

    switch (def.behavior) {
      case 'SWARM': {
        // Direct relentless bee-line pursuit
        if (distToTarget > 6) {
          enemy.vx = (dx / distToTarget) * def.speed;
          enemy.vy = (dy / distToTarget) * def.speed;
        }
        break;
      }

      case 'STRAFE_SHOOT': {
        // Approaches to medium distance, then strafes and shoots dual plasma
        const desiredDist = 280;
        if (distToTarget > desiredDist + 30) {
          enemy.vx = (dx / distToTarget) * def.speed;
          enemy.vy = (dy / distToTarget) * def.speed;
        } else if (distToTarget < desiredDist - 30) {
          enemy.vx = -(dx / distToTarget) * def.speed;
          enemy.vy = -(dy / distToTarget) * def.speed;
        } else {
          // Strafe tangentially
          const perpX = -dy / distToTarget;
          const perpY = dx / distToTarget;
          enemy.vx = perpX * def.speed * 0.9;
          enemy.vy = perpY * def.speed * 0.9;
        }

        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 2.4;
          // Fire twin bolts
          const spread = 0.12;
          for (const s of [-spread, spread]) {
            const angle = enemy.angle + s;
            state.projectiles.push({
              id: state.nextEntityId++,
              fromPlayer: false,
              x: enemy.x + Math.cos(angle) * 16,
              y: enemy.y + Math.sin(angle) * 16,
              vx: Math.cos(angle) * 360,
              vy: Math.sin(angle) * 360,
              damage: 14,
              pierce: 1,
              radius: 4,
              color: '#38bdf8',
              duration: 3.5,
              isHoming: false,
              special: 'ENEMY_BOLT',
            });
          }
        }
        break;
      }

      case 'SNIPER_CHARGE': {
        // Keeps long distance, telegraphs laser, fires hyper beam
        const desiredDist = 420;
        if (distToTarget < desiredDist) {
          enemy.vx = -(dx / distToTarget) * def.speed;
          enemy.vy = -(dy / distToTarget) * def.speed;
        } else {
          enemy.vx = (dx / distToTarget) * def.speed * 0.4;
          enemy.vy = (dy / distToTarget) * def.speed * 0.4;
        }

        enemy.sniperChargeTimer += worldDtSec;
        if (enemy.sniperChargeTimer >= 2.8) {
          enemy.sniperChargeTimer = 0;
          // Fire sniper beam shot
          state.projectiles.push({
            id: state.nextEntityId++,
            fromPlayer: false,
            x: enemy.x + Math.cos(enemy.angle) * 20,
            y: enemy.y + Math.sin(enemy.angle) * 20,
            vx: Math.cos(enemy.angle) * 950,
            vy: Math.sin(enemy.angle) * 950,
            damage: 32,
            pierce: 1,
            radius: 5,
            color: '#facc15',
            duration: 2.0,
            isHoming: false,
            special: 'ENEMY_SNIPER',
          });
        }
        break;
      }

      case 'SHIELD_CHARGE': {
        // Bulwark: slow march forward with impenetrable frontal shield
        enemy.vx = (dx / distToTarget) * def.speed;
        enemy.vy = (dy / distToTarget) * def.speed;
        enemy.shieldActive = true;
        break;
      }

      case 'SPIRAL_WEAVE': {
        // Vortex Weaver: wanders arena, continuously spins and fires bullet hell spirals
        enemy.spiralPhase += worldDtSec * 2.5;
        enemy.vx = Math.cos(enemy.spiralPhase) * def.speed;
        enemy.vy = Math.sin(enemy.spiralPhase * 0.7) * def.speed;

        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 0.28;
          const arms = 3;
          for (let a = 0; a < arms; a++) {
            const angle = enemy.spiralPhase + (a * (Math.PI * 2)) / arms;
            state.projectiles.push({
              id: state.nextEntityId++,
              fromPlayer: false,
              x: enemy.x + Math.cos(angle) * 18,
              y: enemy.y + Math.sin(angle) * 18,
              vx: Math.cos(angle) * 240,
              vy: Math.sin(angle) * 240,
              damage: 12,
              pierce: 1,
              radius: 4,
              color: '#c084fc',
              duration: 4.0,
              isHoming: false,
              special: 'ENEMY_SPIRAL',
            });
          }
        }
        break;
      }

      case 'BOSS_HYPERION': {
        // Sun-Devourer Boss AI
        enemy.vx = (dx / distToTarget) * def.speed * 0.7;
        enemy.vy = (dy / distToTarget) * def.speed * 0.7;

        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 2.2;
          // Cluster barrage of 8 radial bullets + 2 homing rockets
          for (let b = 0; b < 8; b++) {
            const angle = enemy.angle + (b * Math.PI) / 4;
            state.projectiles.push({
              id: state.nextEntityId++,
              fromPlayer: false,
              x: enemy.x + Math.cos(angle) * 45,
              y: enemy.y + Math.sin(angle) * 45,
              vx: Math.cos(angle) * 310,
              vy: Math.sin(angle) * 310,
              damage: 18,
              pierce: 1,
              radius: 5,
              color: '#f97316',
              duration: 3.5,
              isHoming: false,
            });
          }
        }
        break;
      }

      case 'BOSS_CHRONOS': {
        // Chronos Singularity Weaver Final Boss
        enemy.vx = (dx / distToTarget) * def.speed * 0.5;
        enemy.vy = (dy / distToTarget) * def.speed * 0.5;
        enemy.spiralPhase += worldDtSec * 1.8;

        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 0.45;
          // 4-arm rotating hyper spirals
          for (let arm = 0; arm < 4; arm++) {
            const angle = enemy.spiralPhase + (arm * Math.PI) / 2;
            state.projectiles.push({
              id: state.nextEntityId++,
              fromPlayer: false,
              x: enemy.x + Math.cos(angle) * 55,
              y: enemy.y + Math.sin(angle) * 55,
              vx: Math.cos(angle) * 270,
              vy: Math.sin(angle) * 270,
              damage: 16,
              pierce: 1,
              radius: 5,
              color: '#06b6d4',
              duration: 4.5,
              isHoming: false,
            });
          }
        }
        break;
      }
    }

    enemy.x += enemy.vx * worldDtSec;
    enemy.y += enemy.vy * worldDtSec;
  }
}

/**
 * Magnetizes and collects XP gems and nanite cells.
 */
function updatePickups(state: HypernovaGameState, dtSec: number): void {
  const magnetRadius = 140;

  // XP Gems
  for (let i = state.xpGems.length - 1; i >= 0; i--) {
    const gem = state.xpGems[i];
    const dx = state.player.x - gem.x;
    const dy = state.player.y - gem.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magnetRadius) {
      const pullSpeed = 520 * dtSec;
      gem.x += (dx / dist) * pullSpeed;
      gem.y += (dy / dist) * pullSpeed;
    }

    if (dist <= state.player.radius + 12) {
      state.player.xp += gem.value;
      state.xpGems.splice(i, 1);

      // Level up check
      if (state.player.xp >= state.player.xpNext) {
        triggerLevelUp(state);
      }
    }
  }

  // Nanite Health Cells
  for (let i = state.naniteCells.length - 1; i >= 0; i--) {
    const cell = state.naniteCells[i];
    const dx = state.player.x - cell.x;
    const dy = state.player.y - cell.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magnetRadius) {
      const pullSpeed = 480 * dtSec;
      cell.x += (dx / dist) * pullSpeed;
      cell.y += (dy / dist) * pullSpeed;
    }

    if (dist <= state.player.radius + 12) {
      state.player.hull = Math.min(state.player.maxHull, state.player.hull + cell.healAmount);
      state.events.push({
        type: 'PLAYER_HIT',
        x: state.player.x,
        y: state.player.y,
        text: `+${cell.healAmount} HULL`,
      });
      state.naniteCells.splice(i, 1);
    }
  }
}

/**
 * Triggers level up, generates 3 draft choices, and switches status to DRAFTING.
 */
function triggerLevelUp(state: HypernovaGameState): void {
  state.player.level++;
  state.player.xp -= state.player.xpNext;
  state.player.xpNext = Math.round(
    HYPERNOVA_CONFIG.XP_BASE_REQUIRED * Math.pow(state.player.level, HYPERNOVA_CONFIG.XP_GROWTH_EXPONENT)
  );

  state.pendingDraftChoices = generateDraftChoices(state);
  state.status = 'DRAFTING';

  state.events.push({
    type: 'LEVEL_UP',
    value: state.player.level,
    text: `LEVEL UP! ASCENSION TIER ${state.player.level}`,
  });
}

/**
 * Detects near-miss bullet grazes to award energy and score multiplier.
 */
function checkBulletGraze(
  state: HypernovaGameState,
  derived: ReturnType<typeof getPlayerDerivedStats>
): void {
  const grazeOuterRadius = state.player.radius + HYPERNOVA_CONFIG.GRAZE_RADIUS;

  for (const proj of state.projectiles) {
    if (!proj.fromPlayer) {
      const d = Math.hypot(proj.x - state.player.x, proj.y - state.player.y);
      if (d > state.player.radius && d <= grazeOuterRadius) {
        // Check if recently grazed
        const alreadyGrazed = state.recentGrazes.some((g) => g.projectileId === proj.id);
        if (!alreadyGrazed) {
          state.recentGrazes.push({
            projectileId: proj.id,
            timestampSec: state.elapsedSec,
          });
          state.totalGrazes++;

          const energyBonus =
            HYPERNOVA_CONFIG.CHRONO_ENERGY_GRAZE_BONUS *
            (state.player.chassisId === 'interceptor' ? 2.0 : 1.0) *
            derived.grazeBonusMultiplier;

          state.player.chronoEnergy = Math.min(
            state.player.maxChronoEnergy,
            state.player.chronoEnergy + energyBonus
          );

          addComboPoints(state, 35);

          state.events.push({
            type: 'GRAZE',
            x: proj.x,
            y: proj.y,
            text: 'GRAZE +ENERGY',
          });
        }
      }
    }
  }

  // Prune graze records older than 2.0s
  state.recentGrazes = state.recentGrazes.filter((g) => state.elapsedSec - g.timestampSec < 2.0);
}

/**
 * Handles collisions between player, enemy contact, and hostile projectiles.
 */
function checkPlayerCollisions(
  state: HypernovaGameState,
  derived: ReturnType<typeof getPlayerDerivedStats>
): void {
  if (state.player.invulnerableTimer > 0) return;

  // 1. Hostile Projectiles vs Player
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    if (!proj.fromPlayer) {
      const d = Math.hypot(proj.x - state.player.x, proj.y - state.player.y);
      if (d <= state.player.radius + proj.radius) {
        inflictPlayerDamage(state, proj.damage, derived);
        state.projectiles.splice(i, 1);
        if (state.status === 'GAME_OVER') return;
      }
    }
  }

  // 2. Enemy physical contact vs Player
  for (const enemy of state.enemies) {
    const d = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (d <= state.player.radius + enemy.radius) {
      const contactDamage = enemy.isBoss ? 45 : 18;
      inflictPlayerDamage(state, contactDamage, derived);
      if (state.status === 'GAME_OVER') return;
      break;
    }
  }
}

/**
 * Inflicts damage to player: shields absorb first, then hull.
 * Handles Aegis Nova augment, invulnerability frames, and Chronos Rewind fail-safe.
 */
function inflictPlayerDamage(
  state: HypernovaGameState,
  amount: number,
  derived: ReturnType<typeof getPlayerDerivedStats>
): void {
  state.player.invulnerableTimer = HYPERNOVA_CONFIG.INVULNERABILITY_AFTER_HIT_SEC;
  state.player.shieldRegenTimer = HYPERNOVA_CONFIG.SHIELD_REGEN_DELAY_SEC;

  // Combo resets on damage
  state.comboPoints = 0;
  updateComboStatus(state);

  if (state.player.shield > 0) {
    if (state.player.shield >= amount) {
      state.player.shield -= amount;
      state.events.push({
        type: 'PLAYER_HIT',
        value: amount,
        text: `-${amount} SHIELD`,
      });
      return;
    } else {
      const remainingDamage = amount - state.player.shield;
      state.player.shield = 0;

      state.events.push({
        type: 'SHIELD_BREAK',
        text: 'SHIELD COLLAPSE!',
      });

      // Aegis EMP Nova augment
      if (derived.hasAegisNova) {
        state.projectiles = state.projectiles.filter((p) => p.fromPlayer);
        detonateAreaDamage(state, state.player.x, state.player.y, 400, 50);
        state.events.push({
          type: 'PARRY',
          text: 'AEGIS EMP SHOCKWAVE DISCHARGED!',
        });
      }

      state.player.hull -= remainingDamage;
    }
  } else {
    state.player.hull -= amount;
  }

  state.events.push({
    type: 'PLAYER_HIT',
    value: amount,
    text: `-${amount} HULL`,
  });

  // Check death & Chronos Rewind
  if (state.player.hull <= 0) {
    if (derived.hasChronosRewind && state.player.rewindAvailable) {
      state.player.rewindAvailable = false;
      state.player.hull = Math.round(state.player.maxHull * 0.6);
      state.player.shield = state.player.maxShield;
      state.player.invulnerableTimer = 2.5;

      // Wipe hostile bullets
      state.projectiles = state.projectiles.filter((p) => p.fromPlayer);

      state.events.push({
        type: 'REWIND_TRIGGERED',
        text: 'PARADOX FAIL-SAFE: REALITY REWOUND!',
      });
    } else {
      state.player.hull = 0;
      state.status = 'GAME_OVER';
      state.events.push({
        type: 'GAME_OVER',
        text: 'VALKYRIE DESTROYED IN COMBAT',
      });
    }
  }
}

/**
 * Advances wave schedule, spawns enemies according to rates, and triggers boss encounters.
 */
function updateWaveProgression(
  state: HypernovaGameState,
  dtSec: number,
  rng: HypernovaRNG
): void {
  const scheduleIndex = Math.min(state.currentWave - 1, WAVE_SCHEDULES.length - 1);
  const currentSchedule = WAVE_SCHEDULES[scheduleIndex];

  state.waveTimer += dtSec;

  // Handle enemy spawns
  for (const spawn of currentSchedule.spawnRates) {
    const key = spawn.archetype;
    state.waveSpawnTimers[key] = (state.waveSpawnTimers[key] ?? 0) + dtSec;

    if (state.waveSpawnTimers[key] >= spawn.intervalSec) {
      state.waveSpawnTimers[key] = 0;

      const activeCount = state.enemies.filter((e) => e.archetype === spawn.archetype).length;
      if (activeCount < spawn.maxCount) {
        spawnEnemyAtArenaEdge(state, spawn.archetype, rng);
      }
    }
  }

  // Handle boss spawn
  if (currentSchedule.bossSpawn && !state.activeBossId) {
    const bossDef = ENEMY_REGISTRY[currentSchedule.bossSpawn];
    const bossId = state.nextEntityId++;
    state.activeBossId = bossId;

    state.enemies.push({
      id: bossId,
      archetype: currentSchedule.bossSpawn,
      x: HYPERNOVA_CONFIG.ARENA_WIDTH / 2,
      y: 90,
      vx: 0,
      vy: 0,
      hp: bossDef.maxHp,
      maxHp: bossDef.maxHp,
      radius: bossDef.radius,
      angle: Math.PI / 2,
      shootCooldown: 1.0,
      sniperChargeTimer: 0,
      spiralPhase: 0,
      shieldActive: false,
      isBoss: true,
    });

    state.events.push({
      type: 'BOSS_SPAWN',
      text: `TITAN ENGAGEMENT: ${bossDef.name}`,
    });
  }

  // Wave Completion check
  if (state.waveTimer >= currentSchedule.durationSec && (!currentSchedule.bossSpawn || !state.activeBossId)) {
    if (state.currentWave < HYPERNOVA_CONFIG.TOTAL_WAVES) {
      state.currentWave++;
      state.waveTimer = 0;
      state.waveDuration = WAVE_SCHEDULES[state.currentWave - 1].durationSec;
      state.waveSpawnTimers = {};

      state.events.push({
        type: 'WAVE_START',
        value: state.currentWave,
        text: WAVE_SCHEDULES[state.currentWave - 1].name,
      });
    } else if (!state.endlessMode && state.activeBossId === null) {
      // Enter Endless Overdrive
      state.endlessMode = true;
      state.events.push({
        type: 'WAVE_START',
        text: 'ENTERED ENDLESS HYPERNOVA OVERDRIVE!',
      });
    }
  }
}

/**
 * Spawns an enemy at a random boundary point just outside the visible arena.
 */
function spawnEnemyAtArenaEdge(
  state: HypernovaGameState,
  archetype: EnemyArchetypeId,
  rng: HypernovaRNG
): void {
  const def = ENEMY_REGISTRY[archetype];
  const side = rng.rangeInt(0, 3); // 0=Top, 1=Right, 2=Bottom, 3=Left
  let x = 0;
  let y = 0;

  switch (side) {
    case 0: // Top
      x = rng.rangeFloat(50, HYPERNOVA_CONFIG.ARENA_WIDTH - 50);
      y = -def.radius - 10;
      break;
    case 1: // Right
      x = HYPERNOVA_CONFIG.ARENA_WIDTH + def.radius + 10;
      y = rng.rangeFloat(50, HYPERNOVA_CONFIG.ARENA_HEIGHT - 50);
      break;
    case 2: // Bottom
      x = rng.rangeFloat(50, HYPERNOVA_CONFIG.ARENA_WIDTH - 50);
      y = HYPERNOVA_CONFIG.ARENA_HEIGHT + def.radius + 10;
      break;
    case 3: // Left
      x = -def.radius - 10;
      y = rng.rangeFloat(50, HYPERNOVA_CONFIG.ARENA_HEIGHT - 50);
      break;
  }

  state.enemies.push({
    id: state.nextEntityId++,
    archetype,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: def.maxHp,
    maxHp: def.maxHp,
    radius: def.radius,
    angle: 0,
    shootCooldown: rng.rangeFloat(1.0, 2.5),
    sniperChargeTimer: 0,
    spiralPhase: rng.rangeFloat(0, Math.PI * 2),
    shieldActive: archetype === 'bulwark_cruiser',
    isBoss: def.isBoss,
  });
}
