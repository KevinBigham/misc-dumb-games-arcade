// Pure deterministic simulation for AEGIS: VOLT-LASH // Kinetic Parry & Tether Arena

export type GameStatus = 'PLAYING' | 'DRAFT_UPGRADE' | 'VICTORY' | 'DEFEAT';

export type UpgradeId =
  | 'tether_lightning'
  | 'parry_shards'
  | 'kill_implosion'
  | 'triangle_cage'
  | 'graze_halo'
  | 'anchor_nova'
  | 'redline_trail'
  | 'mirror_orbitals';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  tag: string;
  icon: string;
  color: string;
  description: string;
  synergyHint: string;
}

export const UPGRADE_CATALOG: readonly UpgradeDef[] = [
  {
    id: 'tether_lightning',
    name: 'High-Voltage Tether',
    tag: 'GEOMETRY // TETHER',
    icon: '⚡',
    color: '#38bdf8',
    description:
      'Dashing stretches an overcharged lightning tether for 3.2s that zaps enemies every 0.15s and vaporizes enemy bullets on contact.',
    synergyHint: 'Synergizes with Triangle Cage Protocol & Boomerang Anchor',
  },
  {
    id: 'parry_shards',
    name: 'Prism Shatter-Parry',
    tag: 'DEFLECTION // SPLIT',
    icon: '💠',
    color: '#f472b6',
    description:
      'Every parried projectile splits into 3 homing plasma shards that seek out and pierce the nearest threats.',
    synergyHint: 'Triples parry damage output and builds Combo 3x faster',
  },
  {
    id: 'kill_implosion',
    name: 'Singularity Implosion',
    tag: 'CHAIN // VORTEX',
    icon: '🌀',
    color: '#c084fc',
    description:
      'Kills trigger a gravity implosion vortex that drags nearby enemies into your tether lines and vacuums XP shards.',
    synergyHint: 'Clusters enemies tightly for multi-kill Tether clotheslines',
  },
  {
    id: 'triangle_cage',
    name: 'Triangle Cage Protocol',
    tag: 'GEOMETRY // ENCLOSURE',
    icon: '🔺',
    color: '#fbbf24',
    description:
      'Having 2+ active Dash Tethers links their anchors into a closed plasma polygon, incinerating all enemies inside the geometry.',
    synergyHint: 'Chain dashes to trap bosses and elite packs inside plasma triangles',
  },
  {
    id: 'graze_halo',
    name: 'Tesla Graze Halo',
    tag: 'RISK // COUNTER-ARC',
    icon: '🧲',
    color: '#34d399',
    description:
      'Grazing enemy projectiles fires an instant counter-lightning arc at the attacker and grants +60% Volt-Surge gain.',
    synergyHint: 'Makes close-calls lethal and accelerates Redline Overdrive',
  },
  {
    id: 'anchor_nova',
    name: 'Anchor Super-Nova',
    tag: 'BLAST // DETONATION',
    icon: '💥',
    color: '#fb7185',
    description:
      'Dash anchors detonate in a shockwave when spawned or when you Bank Surge [E], deflecting nearby bullets into homing bolts.',
    synergyHint: 'Turns every dash start point and Surge Bank into a bomb',
  },
  {
    id: 'redline_trail',
    name: 'Redline Afterburner',
    tag: 'OVERDRIVE // WAKE',
    icon: '🔥',
    color: '#f97316',
    description:
      'Above 40% Volt-Surge, leave a searing plasma wake behind you and launch 2 homing sidewinder missiles on every Dash.',
    synergyHint: 'Rewards riding high Surge with relentless passive firepower',
  },
  {
    id: 'mirror_orbitals',
    name: 'Mirror Aegis Blades',
    tag: 'ORBITAL // PARRY',
    icon: '🛡️',
    color: '#2dd4bf',
    description:
      'Spawns 2 orbiting reflector blades around your hull that automatically parry enemy bullets and slice close enemies.',
    synergyHint: 'Triggers Prism Shatter-Parry automatically on orbital deflections',
  },
];

export type EnemyKind = 'drifter' | 'sniper' | 'charger' | 'mortar' | 'boss';

export type TelegraphType = 'none' | 'radial_burst' | 'laser_line' | 'dash_lane' | 'ground_zone';

export interface TelegraphState {
  type: TelegraphType;
  timerMs: number;
  durationMs: number;
  targetX: number;
  targetY: number;
  angle: number;
  radius: number;
}

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  cooldownMs: number;
  telegraph: TelegraphState;
  dashTimeMs: number;
  dashVx: number;
  dashVy: number;
  bossPhase: 1 | 2 | 3;
  hitFlashMs: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayerOwned: boolean;
  isParried: boolean;
  isHoming: boolean;
  pierceCount: number;
  lifeMs: number;
  maxLifeMs: number;
  color: string;
  sourceName: string;
  grazed: boolean;
  trail: Array<{ x: number; y: number }>;
}

export interface TetherSegment {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lifeMs: number;
  maxLifeMs: number;
  zapTimerMs: number;
  color: string;
}

export interface HazardZone {
  id: number;
  x: number;
  y: number;
  radius: number;
  windupMs: number;
  maxWindupMs: number;
  activeMs: number;
  damage: number;
  sourceName: string;
}

export interface WakeNode {
  x: number;
  y: number;
  radius: number;
  lifeMs: number;
  maxLifeMs: number;
}

export interface ImplosionVortex {
  x: number;
  y: number;
  radius: number;
  lifeMs: number;
  maxLifeMs: number;
}

export interface XpShard {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  lifeMs: number;
}

export type SimEventType =
  | 'DASH'
  | 'PARRY'
  | 'GRAZE'
  | 'HIT_ENEMY'
  | 'KILL_ENEMY'
  | 'PLAYER_HURT'
  | 'BANK_HEAL'
  | 'SUPERNOVA_OVERDRIVE'
  | 'WAVE_CLEAR'
  | 'BOSS_PHASE'
  | 'UPGRADE_PICKED'
  | 'TRIANGLE_CAGE'
  | 'GAME_END';

export interface SimEvent {
  type: SimEventType;
  x: number;
  y: number;
  dirX?: number;
  dirY?: number;
  amount?: number;
  combo?: number;
  label?: string;
  color?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimX: number;
  aimY: number;
  radius: number;
  grazeRadius: number;
  hp: number;
  maxHp: number;
  dashCooldownMs: number;
  maxDashCooldownMs: number;
  dashActiveMs: number;
  parryWindowMs: number;
  invulnMs: number;
  overdriveMs: number;
  fireCooldownMs: number;
  orbitalAngle: number;
  trail: Array<{ x: number; y: number }>;
}

export interface VoltLashState {
  seed: number;
  rngState: number;
  status: GameStatus;
  arenaWidth: number;
  arenaHeight: number;
  elapsedMs: number;
  wave: number;
  maxWaves: number;
  waveTimerMs: number;
  waveDurationMs: number;
  spawnTimerMs: number;
  hitStopMs: number;

  // Risk vs Reward Tension: Volt-Surge & Combo Multiplier
  surge: number; // 0 to 100
  combo: number;
  peakCombo: number;
  multiplier: number; // 1.0 to 8.0
  peakMultiplier: number;
  comboDecayMs: number;
  maxComboDecayMs: number;
  score: number;
  xp: number;
  xpToNextDraft: number;
  level: number;

  // Run telemetry for "One More Run" breakdown
  totalParries: number;
  totalGrazes: number;
  totalKills: number;
  totalTetherKills: number;
  totalBanks: number;
  killedBy: string;

  // 3-second onboarding prompt tracking
  hasMoved: boolean;
  hasDashed: boolean;
  tutorialPromptAlpha: number;

  // Entities
  nextEntityId: number;
  player: PlayerState;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  tethers: TetherSegment[];
  hazardZones: HazardZone[];
  wakeNodes: WakeNode[];
  vortices: ImplosionVortex[];
  shards: XpShard[];

  // Upgrades & Draft
  upgrades: UpgradeId[];
  draftChoices: UpgradeId[];

  // Events emitted during step for UI & Web Audio
  events: SimEvent[];
}

export interface InputSnapshot {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  dashPressed: boolean;
  bankPressed: boolean;
  draftIndex?: number; // 0, 1, or 2
}

export const ARENA_WIDTH = 1200;
export const ARENA_HEIGHT = 720;
export const FIXED_DT_MS = 16.6667;

/**
 * Deterministic Mulberry32 PRNG step stored directly on state.rngState
 */
export function nextRandom(state: VoltLashState): number {
  let t = (state.rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  state.rngState = t >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomRange(state: VoltLashState, min: number, max: number): number {
  return min + nextRandom(state) * (max - min);
}

export function hasUpgrade(state: VoltLashState, id: UpgradeId): boolean {
  return state.upgrades.includes(id);
}

export function computeMultiplier(combo: number, surge: number, overdriveMs: number): number {
  const comboBonus = Math.min(4.0, Math.floor(combo / 3) * 0.5);
  const surgeBonus = surge >= 80 ? 2.5 : surge >= 50 ? 1.25 : surge >= 25 ? 0.5 : 0;
  const overdriveBonus = overdriveMs > 0 ? 1.5 : 0;
  return Number(Math.min(8.0, 1.0 + comboBonus + surgeBonus + overdriveBonus).toFixed(2));
}

export function isRedlined(state: VoltLashState): boolean {
  return state.surge >= 80 && state.player.overdriveMs <= 0;
}

export function createInitialVoltLashState(seed = 20261108): VoltLashState {
  const cleanSeed = (Math.abs(Math.floor(seed)) || 20261108) >>> 0;
  const state: VoltLashState = {
    seed: cleanSeed,
    rngState: cleanSeed,
    status: 'PLAYING',
    arenaWidth: ARENA_WIDTH,
    arenaHeight: ARENA_HEIGHT,
    elapsedMs: 0,
    wave: 1,
    maxWaves: 5,
    waveTimerMs: 0,
    waveDurationMs: 42000, // ~42s per wave so 5 waves = brisk ~3.5-5 min run
    spawnTimerMs: 600,
    hitStopMs: 0,

    surge: 0,
    combo: 0,
    peakCombo: 0,
    multiplier: 1.0,
    peakMultiplier: 1.0,
    comboDecayMs: 0,
    maxComboDecayMs: 4200,
    score: 0,
    xp: 0,
    xpToNextDraft: 120,
    level: 1,

    totalParries: 0,
    totalGrazes: 0,
    totalKills: 0,
    totalTetherKills: 0,
    totalBanks: 0,
    killedBy: '',

    hasMoved: false,
    hasDashed: false,
    tutorialPromptAlpha: 1.0,

    nextEntityId: 1,
    player: {
      x: ARENA_WIDTH * 0.5,
      y: ARENA_HEIGHT * 0.55,
      vx: 0,
      vy: 0,
      aimX: ARENA_WIDTH * 0.5,
      aimY: ARENA_HEIGHT * 0.25,
      radius: 13,
      grazeRadius: 42,
      hp: 100,
      maxHp: 100,
      dashCooldownMs: 0,
      maxDashCooldownMs: 680,
      dashActiveMs: 0,
      parryWindowMs: 0,
      invulnMs: 0,
      overdriveMs: 0,
      fireCooldownMs: 0,
      orbitalAngle: 0,
      trail: [],
    },
    enemies: [],
    projectiles: [],
    tethers: [],
    hazardZones: [],
    wakeNodes: [],
    vortices: [],
    shards: [],
    upgrades: [],
    draftChoices: [],
    events: [],
  };

  // Spawn an immediate starter pack of enemies so the player has action in < 1 second
  spawnWavePack(state, 3);
  return state;
}

export function cloneVoltLashState(state: VoltLashState): VoltLashState {
  return JSON.parse(JSON.stringify(state)) as VoltLashState;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Shortest distance squared from point (px, py) to segment (x1, y1)-(x2, y2)
 */
export function pointToSegmentDistSq(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = distSq(x1, y1, x2, y2);
  if (l2 === 0) return distSq(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = clamp(t, 0, 1);
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return distSq(px, py, projX, projY);
}

/**
 * Point in triangle test for Triangle Cage Protocol synergy
 */
export function isPointInTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

export function spawnEnemy(
  state: VoltLashState,
  kind: EnemyKind,
  x: number,
  y: number
): EnemyEntity {
  const waveScale = 1 + (state.wave - 1) * 0.22;
  let name = 'Pulse Drifter';
  let hp = Math.round(32 * waveScale);
  let radius = 16;
  let color = '#fb7185';
  let cooldownMs = 1100;

  if (kind === 'sniper') {
    name = 'Rail Sniper';
    hp = Math.round(42 * waveScale);
    radius = 15;
    color = '#f43f5e';
    cooldownMs = 1600;
  } else if (kind === 'charger') {
    name = 'Volt Bull';
    hp = Math.round(64 * waveScale);
    radius = 20;
    color = '#f97316';
    cooldownMs = 1500;
  } else if (kind === 'mortar') {
    name = 'Plasma Weaver';
    hp = Math.round(54 * waveScale);
    radius = 18;
    color = '#a855f7';
    cooldownMs = 1800;
  } else if (kind === 'boss') {
    name = 'ARCHON-V // SINGULARITY CORE';
    hp = 950;
    radius = 40;
    color = '#ef4444';
    cooldownMs = 1100;
  }

  const enemy: EnemyEntity = {
    id: state.nextEntityId++,
    kind,
    name,
    x,
    y,
    vx: 0,
    vy: 0,
    radius,
    hp,
    maxHp: hp,
    color,
    cooldownMs,
    telegraph: {
      type: 'none',
      timerMs: 0,
      durationMs: 0,
      targetX: x,
      targetY: y,
      angle: 0,
      radius: 0,
    },
    dashTimeMs: 0,
    dashVx: 0,
    dashVy: 0,
    bossPhase: 1,
    hitFlashMs: 0,
  };

  state.enemies.push(enemy);
  return enemy;
}

function spawnWavePack(state: VoltLashState, count: number): void {
  const margin = 65;
  for (let i = 0; i < count; i++) {
    // Pick perimeter spawn away from player
    let sx = randomRange(state, margin, state.arenaWidth - margin);
    let sy = randomRange(state, margin, state.arenaHeight - margin);
    const edge = Math.floor(nextRandom(state) * 4);
    if (edge === 0) sy = margin;
    else if (edge === 1) sy = state.arenaHeight - margin;
    else if (edge === 2) sx = margin;
    else sx = state.arenaWidth - margin;

    // Ensure minimum safe distance from player
    if (distSq(sx, sy, state.player.x, state.player.y) < 180 * 180) {
      sx = state.player.x > state.arenaWidth * 0.5 ? margin : state.arenaWidth - margin;
    }

    const roll = nextRandom(state);
    let kind: EnemyKind = 'drifter';
    if (state.wave === 1) {
      kind = roll < 0.72 ? 'drifter' : 'charger';
    } else if (state.wave === 2) {
      kind = roll < 0.45 ? 'drifter' : roll < 0.75 ? 'sniper' : 'charger';
    } else if (state.wave === 3) {
      kind = roll < 0.35 ? 'drifter' : roll < 0.6 ? 'sniper' : roll < 0.82 ? 'charger' : 'mortar';
    } else {
      kind = roll < 0.25 ? 'drifter' : roll < 0.5 ? 'sniper' : roll < 0.75 ? 'charger' : 'mortar';
    }

    spawnEnemy(state, kind, sx, sy);
  }
}

export function rollDraftChoices(state: VoltLashState): UpgradeId[] {
  const unowned = UPGRADE_CATALOG.map((u) => u.id).filter((id) => !state.upgrades.includes(id));
  const pool = unowned.length >= 3 ? [...unowned] : UPGRADE_CATALOG.map((u) => u.id);
  const picked: UpgradeId[] = [];
  while (picked.length < 3 && pool.length > 0) {
    const idx = Math.floor(nextRandom(state) * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

export function selectUpgrade(state: VoltLashState, choiceIndex: number): boolean {
  if (state.status !== 'DRAFT_UPGRADE' || state.draftChoices.length === 0) {
    return false;
  }
  const idx = clamp(choiceIndex, 0, state.draftChoices.length - 1);
  const chosen = state.draftChoices[idx];
  if (!state.upgrades.includes(chosen)) {
    state.upgrades.push(chosen);
  }
  const def = UPGRADE_CATALOG.find((u) => u.id === chosen);
  state.draftChoices = [];
  state.status = 'PLAYING';
  // Grant brief invulnerability and slight heal on draft pick
  state.player.invulnMs = Math.max(state.player.invulnMs, 900);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 12);
  state.events.push({
    type: 'UPGRADE_PICKED',
    x: state.player.x,
    y: state.player.y,
    label: def ? `${def.icon} ${def.name}` : chosen,
    color: def?.color ?? '#38bdf8',
  });
  return true;
}

function addComboAndSurge(
  state: VoltLashState,
  comboAdd: number,
  surgeAdd: number,
  baseScore: number
): void {
  state.combo += comboAdd;
  if (state.combo > state.peakCombo) {
    state.peakCombo = state.combo;
  }
  state.comboDecayMs = state.maxComboDecayMs;
  state.surge = clamp(state.surge + surgeAdd, 0, 100);
  state.multiplier = computeMultiplier(state.combo, state.surge, state.player.overdriveMs);
  if (state.multiplier > state.peakMultiplier) {
    state.peakMultiplier = state.multiplier;
  }
  state.score += Math.round(baseScore * state.multiplier);
}

function spawnHomingShards(
  state: VoltLashState,
  x: number,
  y: number,
  baseAngle: number,
  count: number,
  damage: number,
  color: string
): void {
  for (let i = 0; i < count; i++) {
    const spread = (i - (count - 1) * 0.5) * 0.42;
    const angle = baseAngle + spread;
    const speed = 0.56;
    state.projectiles.push({
      id: state.nextEntityId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 6,
      damage,
      isPlayerOwned: true,
      isParried: true,
      isHoming: true,
      pierceCount: 2,
      lifeMs: 2200,
      maxLifeMs: 2200,
      color,
      sourceName: 'Prism Shard',
      grazed: true,
      trail: [],
    });
  }
}

export function parryProjectile(
  state: VoltLashState,
  proj: ProjectileEntity,
  deflectX: number,
  deflectY: number
): void {
  // Aim toward nearest enemy if one exists, otherwise reflect away from deflection source
  let targetAngle = Math.atan2(-proj.vy, -proj.vx);
  let bestDistSq = Infinity;
  for (const enemy of state.enemies) {
    const d2 = distSq(proj.x, proj.y, enemy.x, enemy.y);
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      targetAngle = Math.atan2(enemy.y - proj.y, enemy.x - proj.x);
    }
  }

  const speed = 0.68;
  proj.isPlayerOwned = true;
  proj.isParried = true;
  proj.isHoming = true;
  proj.vx = Math.cos(targetAngle) * speed;
  proj.vy = Math.sin(targetAngle) * speed;
  proj.damage = Math.round(34 * state.multiplier);
  proj.radius = 8;
  proj.pierceCount = 2;
  proj.lifeMs = 2400;
  proj.maxLifeMs = 2400;
  proj.color = '#38bdf8';

  state.totalParries += 1;
  state.hitStopMs = Math.max(state.hitStopMs, 42); // Tactile micro hit-stop!
  addComboAndSurge(state, 2, 14, 75);

  state.events.push({
    type: 'PARRY',
    x: proj.x,
    y: proj.y,
    dirX: Math.cos(targetAngle),
    dirY: Math.sin(targetAngle),
    combo: state.combo,
    label: `PARRY! x${state.multiplier}`,
    color: '#38bdf8',
  });

  if (hasUpgrade(state, 'parry_shards')) {
    spawnHomingShards(state, proj.x, proj.y, targetAngle, 3, 22, '#f472b6');
  }
}

function triggerAnchorNova(state: VoltLashState, x: number, y: number): void {
  const blastRadius = 125;
  for (const enemy of state.enemies) {
    if (distSq(x, y, enemy.x, enemy.y) <= (blastRadius + enemy.radius) ** 2) {
      damageEnemy(state, enemy, 28, x, y, 'Anchor Nova');
    }
  }
  for (const proj of state.projectiles) {
    if (!proj.isPlayerOwned && distSq(x, y, proj.x, proj.y) <= blastRadius ** 2) {
      parryProjectile(state, proj, x, y);
    }
  }
}

export function triggerDashParry(state: VoltLashState, input: InputSnapshot): boolean {
  const p = state.player;
  if (p.dashCooldownMs > 0 || state.status !== 'PLAYING') {
    return false;
  }

  state.hasDashed = true;

  // Determine dash direction from movement or aim
  let dx = input.moveX;
  let dy = input.moveY;
  if (Math.hypot(dx, dy) < 0.1) {
    dx = input.aimX - p.x;
    dy = input.aimY - p.y;
  }
  const len = Math.hypot(dx, dy) || 1;
  const dirX = dx / len;
  const dirY = dy / len;

  const startX = p.x;
  const startY = p.y;
  const dashDist = p.overdriveMs > 0 ? 195 : 165;
  const endX = clamp(startX + dirX * dashDist, 28, state.arenaWidth - 28);
  const endY = clamp(startY + dirY * dashDist, 28, state.arenaHeight - 28);

  p.x = endX;
  p.y = endY;
  p.vx = dirX * 0.42;
  p.vy = dirY * 0.42;
  p.dashCooldownMs = p.overdriveMs > 0 ? 340 : p.maxDashCooldownMs;
  p.dashActiveMs = 190;
  p.parryWindowMs = 220;
  p.invulnMs = Math.max(p.invulnMs, 240);

  // Create high-voltage Tether between start and end point
  const tetherDuration = hasUpgrade(state, 'tether_lightning') ? 3200 : 1900;
  state.tethers.push({
    id: state.nextEntityId++,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    lifeMs: tetherDuration,
    maxLifeMs: tetherDuration,
    zapTimerMs: 0,
    color: hasUpgrade(state, 'tether_lightning') ? '#38bdf8' : '#22d3ee',
  });

  state.events.push({
    type: 'DASH',
    x: endX,
    y: endY,
    dirX,
    dirY,
    color: '#22d3ee',
  });

  // Immediate Dash-Parry deflection around dash path & endpoints
  const parryRadius = 64;
  for (const proj of state.projectiles) {
    if (proj.isPlayerOwned) continue;
    const d2 = pointToSegmentDistSq(proj.x, proj.y, startX, startY, endX, endY);
    if (d2 <= (parryRadius + proj.radius) ** 2) {
      parryProjectile(state, proj, endX, endY);
    }
  }

  // Immediate Dash-Slash damage to enemies crossed by the dash
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    const d2 = pointToSegmentDistSq(enemy.x, enemy.y, startX, startY, endX, endY);
    if (d2 <= (enemy.radius + 26) ** 2) {
      damageEnemy(state, enemy, 30, endX, endY, 'Lash Dash');
    }
  }

  // Synergy: Anchor Nova
  if (hasUpgrade(state, 'anchor_nova')) {
    triggerAnchorNova(state, startX, startY);
  }

  // Synergy: Redline Afterburner launches homing missiles on dash when Surge >= 40%
  if (hasUpgrade(state, 'redline_trail') && state.surge >= 40) {
    const baseAngle = Math.atan2(dirY, dirX);
    spawnHomingShards(state, endX, endY, baseAngle, 2, 26, '#f97316');
  }

  // Synergy: Triangle Cage Protocol when 2+ tethers exist
  if (hasUpgrade(state, 'triangle_cage') && state.tethers.length >= 2) {
    const prev = state.tethers[state.tethers.length - 2];
    const ax = prev.x1;
    const ay = prev.y1;
    const bx = startX;
    const by = startY;
    const cx = endX;
    const cy = endY;

    let cagedCount = 0;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (
        isPointInTriangle(enemy.x, enemy.y, ax, ay, bx, by, cx, cy) ||
        pointToSegmentDistSq(enemy.x, enemy.y, ax, ay, cx, cy) <= (enemy.radius + 24) ** 2
      ) {
        cagedCount++;
        damageEnemy(state, enemy, 55, (ax + bx + cx) / 3, (ay + by + cy) / 3, 'Triangle Cage');
      }
    }
    if (cagedCount > 0) {
      state.hitStopMs = Math.max(state.hitStopMs, 48);
      state.events.push({
        type: 'TRIANGLE_CAGE',
        x: (ax + bx + cx) / 3,
        y: (ay + by + cy) / 3,
        amount: cagedCount,
        label: 'TRIANGLE CAGE!',
        color: '#fbbf24',
      });
    }
  }

  return true;
}

/**
 * Risk vs. Reward Cash-Out:
 * - At 35%..99% Surge: BANK SURGE for safety (+30 HP heal + defensive bullet clear), resetting Surge & Combo.
 * - At 100% Surge: APEX SUPERNOVA OVERDRIVE (screen-wide detonation + 4.5s Hyper-Overdrive + 22 HP heal, keeping combo!).
 */
export function triggerBankOrOverdrive(state: VoltLashState): boolean {
  if (state.status !== 'PLAYING' || state.surge < 35) {
    return false;
  }

  const p = state.player;
  state.totalBanks += 1;

  if (state.surge >= 100) {
    // 100% APEX SUPERNOVA GAMBIT PAYOFF!
    state.surge = 0;
    p.overdriveMs = 4500;
    p.invulnMs = Math.max(p.invulnMs, 1200);
    p.hp = Math.min(p.maxHp, p.hp + 22);
    p.dashCooldownMs = 0;
    state.hitStopMs = Math.max(state.hitStopMs, 60);

    // Parry every enemy bullet on screen and blast all enemies
    for (const proj of state.projectiles) {
      if (!proj.isPlayerOwned) {
        parryProjectile(state, proj, p.x, p.y);
      }
    }
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      damageEnemy(state, state.enemies[i], 65, p.x, p.y, 'Supernova Overdrive');
    }

    state.events.push({
      type: 'SUPERNOVA_OVERDRIVE',
      x: p.x,
      y: p.y,
      amount: 22,
      combo: state.combo,
      label: '⚡ SUPERNOVA OVERDRIVE! +22 HP',
      color: '#fde047',
    });
  } else {
    // SAFETY CASH-OUT: Heal +30 HP & clear nearby bullets, but sacrifice Surge & Combo multiplier
    const healAmount = 30;
    p.hp = Math.min(p.maxHp, p.hp + healAmount);
    p.invulnMs = Math.max(p.invulnMs, 600);
    state.surge = 0;
    state.combo = 0;
    state.multiplier = computeMultiplier(0, 0, p.overdriveMs);
    state.hitStopMs = Math.max(state.hitStopMs, 35);

    // Clear enemy projectiles within 240px safety ring
    state.projectiles = state.projectiles.filter(
      (proj) => proj.isPlayerOwned || distSq(p.x, p.y, proj.x, proj.y) > 240 * 240
    );

    if (hasUpgrade(state, 'anchor_nova')) {
      triggerAnchorNova(state, p.x, p.y);
    }

    state.events.push({
      type: 'BANK_HEAL',
      x: p.x,
      y: p.y,
      amount: healAmount,
      label: `SURGE BANKED! +${healAmount} HP`,
      color: '#34d399',
    });
  }

  return true;
}

export function damageEnemy(
  state: VoltLashState,
  enemy: EnemyEntity,
  rawDamage: number,
  sourceX: number,
  sourceY: number,
  cause: string
): void {
  const idx = state.enemies.indexOf(enemy);
  if (idx === -1) return;

  const surgeScale = 1 + (state.surge / 100) * 0.45;
  const dmg = Math.max(1, Math.round(rawDamage * surgeScale));
  enemy.hp -= dmg;
  enemy.hitFlashMs = 110;

  const dx = enemy.x - sourceX;
  const dy = enemy.y - sourceY;
  const len = Math.hypot(dx, dy) || 1;

  // Boss phase transitions
  if (enemy.kind === 'boss' && enemy.hp > 0) {
    const ratio = enemy.hp / enemy.maxHp;
    const nextPhase: 1 | 2 | 3 = ratio <= 0.34 ? 3 : ratio <= 0.67 ? 2 : 1;
    if (nextPhase !== enemy.bossPhase) {
      enemy.bossPhase = nextPhase;
      state.hitStopMs = Math.max(state.hitStopMs, 58);
      state.events.push({
        type: 'BOSS_PHASE',
        x: enemy.x,
        y: enemy.y,
        amount: nextPhase,
        label: `ARCHON-V PHASE ${nextPhase}!`,
        color: '#facc15',
      });
    }
  }

  if (enemy.hp <= 0) {
    state.enemies.splice(idx, 1);
    state.totalKills += 1;
    if (cause.includes('Tether')) {
      state.totalTetherKills += 1;
    }

    const isBoss = enemy.kind === 'boss';
    state.hitStopMs = Math.max(state.hitStopMs, isBoss ? 65 : 32);
    addComboAndSurge(state, isBoss ? 10 : 1, isBoss ? 35 : 8, isBoss ? 1500 : 100);

    // Drop XP shards multiplied by current Surge greed tier
    const shardCount = isBoss ? 12 : state.surge >= 80 ? 3 : state.surge >= 50 ? 2 : 1;
    for (let s = 0; s < shardCount; s++) {
      const ang = randomRange(state, 0, Math.PI * 2);
      const spd = randomRange(state, 0.08, 0.24);
      state.shards.push({
        id: state.nextEntityId++,
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        value: Math.round(18 * (state.surge >= 80 ? 1.5 : 1)),
        lifeMs: 9000,
      });
    }

    // Synergy: Singularity Implosion on kill
    if (hasUpgrade(state, 'kill_implosion')) {
      state.vortices.push({
        x: enemy.x,
        y: enemy.y,
        radius: 155,
        lifeMs: 1100,
        maxLifeMs: 1100,
      });
    }

    state.events.push({
      type: 'KILL_ENEMY',
      x: enemy.x,
      y: enemy.y,
      dirX: dx / len,
      dirY: dy / len,
      amount: dmg,
      combo: state.combo,
      label: isBoss ? 'BOSS OBLITERATED!' : `+${Math.round(100 * state.multiplier)}`,
      color: enemy.color,
    });

    if (isBoss) {
      state.status = 'VICTORY';
      state.killedBy = 'VICTORY — ARCHON-V OBLITERATED';
      state.events.push({
        type: 'GAME_END',
        x: enemy.x,
        y: enemy.y,
        label: 'VICTORY!',
        color: '#fde047',
      });
    }
  } else {
    // Knockback on non-boss enemies
    if (enemy.kind !== 'boss') {
      enemy.x = clamp(enemy.x + (dx / len) * 8, enemy.radius, state.arenaWidth - enemy.radius);
      enemy.y = clamp(enemy.y + (dy / len) * 8, enemy.radius, state.arenaHeight - enemy.radius);
    }
    state.events.push({
      type: 'HIT_ENEMY',
      x: enemy.x,
      y: enemy.y,
      dirX: dx / len,
      dirY: dy / len,
      amount: dmg,
      color: enemy.color,
    });
  }
}

function hurtPlayer(
  state: VoltLashState,
  rawDamage: number,
  sourceX: number,
  sourceY: number,
  sourceDescription: string
): void {
  const p = state.player;
  if (p.invulnMs > 0 || p.overdriveMs > 0 || state.status !== 'PLAYING') {
    return;
  }

  // Redline Risk/Reward penalty: taking a hit at >=80% Surge deals +50% damage!
  const redlined = isRedlined(state);
  const finalDamage = redlined ? Math.round(rawDamage * 1.5) : rawDamage;
  p.hp = Math.max(0, p.hp - finalDamage);
  p.invulnMs = 650;
  state.hitStopMs = Math.max(state.hitStopMs, 50);

  // Taking damage halves combo and drops Surge by 25
  state.combo = Math.floor(state.combo * 0.5);
  state.surge = Math.max(0, state.surge - 25);
  state.multiplier = computeMultiplier(state.combo, state.surge, p.overdriveMs);

  const dx = p.x - sourceX;
  const dy = p.y - sourceY;
  const len = Math.hypot(dx, dy) || 1;

  state.events.push({
    type: 'PLAYER_HURT',
    x: p.x,
    y: p.y,
    dirX: dx / len,
    dirY: dy / len,
    amount: finalDamage,
    label: redlined ? `REDLINE HIT! -${finalDamage}` : `-${finalDamage} HP`,
    color: '#ef4444',
  });

  if (p.hp <= 0) {
    state.status = 'DEFEAT';
    state.killedBy = redlined
      ? `${sourceDescription} (Caught Redlined at ${Math.round(state.surge + 25)}% Surge)`
      : sourceDescription;
    state.events.push({
      type: 'GAME_END',
      x: p.x,
      y: p.y,
      label: 'DEFEAT',
      color: '#ef4444',
    });
  }
}

function updateEnemies(state: VoltLashState, dtMs: number): void {
  const p = state.player;

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (!enemy) continue;

    if (enemy.hitFlashMs > 0) {
      enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - dtMs);
    }

    const dx = p.x - enemy.x;
    const dy = p.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;

    // Active charger dash movement
    if (enemy.dashTimeMs > 0) {
      enemy.dashTimeMs = Math.max(0, enemy.dashTimeMs - dtMs);
      enemy.x = clamp(enemy.x + enemy.dashVx * dtMs, enemy.radius, state.arenaWidth - enemy.radius);
      enemy.y = clamp(
        enemy.y + enemy.dashVy * dtMs,
        enemy.radius,
        state.arenaHeight - enemy.radius
      );
      if (dist <= enemy.radius + p.radius) {
        if (p.parryWindowMs > 0) {
          damageEnemy(state, enemy, 45, p.x, p.y, 'Dash Counter');
          enemy.dashTimeMs = 0;
        } else {
          hurtPlayer(state, 20, enemy.x, enemy.y, `${enemy.name} — Kinetic Lunge`);
        }
      }
      continue;
    }

    // Handle active wind-up telegraph (always >= 500ms so attacks are 100% fair and readable!)
    if (enemy.telegraph.type !== 'none') {
      enemy.telegraph.timerMs -= dtMs;
      if (enemy.telegraph.timerMs <= 0) {
        executeTelegraphedAttack(state, enemy);
        enemy.telegraph.type = 'none';
      }
      continue;
    }

    // Standard positioning movement
    const moveSpeed =
      enemy.kind === 'boss'
        ? 0.085
        : enemy.kind === 'sniper'
          ? dist < 260
            ? -0.07
            : 0.08
          : 0.11;
    enemy.vx = dirX * moveSpeed;
    enemy.vy = dirY * moveSpeed;
    enemy.x = clamp(enemy.x + enemy.vx * dtMs, enemy.radius + 12, state.arenaWidth - enemy.radius - 12);
    enemy.y = clamp(
      enemy.y + enemy.vy * dtMs,
      enemy.radius + 12,
      state.arenaHeight - enemy.radius - 12
    );

    enemy.cooldownMs -= dtMs;
    if (enemy.cooldownMs <= 0) {
      startEnemyTelegraph(state, enemy, dirX, dirY);
    }
  }
}

function startEnemyTelegraph(
  state: VoltLashState,
  enemy: EnemyEntity,
  dirX: number,
  dirY: number
): void {
  const p = state.player;
  const angle = Math.atan2(dirY, dirX);

  if (enemy.kind === 'drifter') {
    enemy.telegraph = {
      type: 'radial_burst',
      timerMs: 520,
      durationMs: 520,
      targetX: p.x,
      targetY: p.y,
      angle,
      radius: 36,
    };
    enemy.cooldownMs = 1550;
  } else if (enemy.kind === 'sniper') {
    enemy.telegraph = {
      type: 'laser_line',
      timerMs: 620,
      durationMs: 620,
      targetX: p.x,
      targetY: p.y,
      angle,
      radius: 12,
    };
    enemy.cooldownMs = 1900;
  } else if (enemy.kind === 'charger') {
    enemy.telegraph = {
      type: 'dash_lane',
      timerMs: 560,
      durationMs: 560,
      targetX: clamp(enemy.x + dirX * 260, 40, state.arenaWidth - 40),
      targetY: clamp(enemy.y + dirY * 260, 40, state.arenaHeight - 40),
      angle,
      radius: enemy.radius,
    };
    enemy.cooldownMs = 1800;
  } else if (enemy.kind === 'mortar') {
    // Spawns a 650ms telegraphed ground danger zone at player's predicted position
    state.hazardZones.push({
      id: state.nextEntityId++,
      x: clamp(p.x + p.vx * 180, 70, state.arenaWidth - 70),
      y: clamp(p.y + p.vy * 180, 70, state.arenaHeight - 70),
      radius: 72,
      windupMs: 650,
      maxWindupMs: 650,
      activeMs: 220,
      damage: 22,
      sourceName: `${enemy.name} — Plasma Mortar Zone`,
    });
    enemy.cooldownMs = 2000;
  } else if (enemy.kind === 'boss') {
    // Multi-phase Boss telegraphs (all >= 550ms)
    if (enemy.bossPhase === 1) {
      enemy.telegraph = {
        type: 'radial_burst',
        timerMs: 560,
        durationMs: 560,
        targetX: p.x,
        targetY: p.y,
        angle,
        radius: 68,
      };
      enemy.cooldownMs = 1250;
    } else if (enemy.bossPhase === 2) {
      enemy.telegraph = {
        type: 'dash_lane',
        timerMs: 600,
        durationMs: 600,
        targetX: clamp(enemy.x + dirX * 340, 60, state.arenaWidth - 60),
        targetY: clamp(enemy.y + dirY * 340, 60, state.arenaHeight - 60),
        angle,
        radius: enemy.radius,
      };
      // Also drop 2 telegraphed mortar hazard zones
      for (let m = -1; m <= 1; m += 2) {
        state.hazardZones.push({
          id: state.nextEntityId++,
          x: clamp(p.x + m * 110, 80, state.arenaWidth - 80),
          y: clamp(p.y, 80, state.arenaHeight - 80),
          radius: 68,
          windupMs: 650,
          maxWindupMs: 650,
          activeMs: 220,
          damage: 24,
          sourceName: 'ARCHON-V — Singularity Mortar',
        });
      }
      enemy.cooldownMs = 1350;
    } else {
      enemy.telegraph = {
        type: 'laser_line',
        timerMs: 550,
        durationMs: 550,
        targetX: p.x,
        targetY: p.y,
        angle,
        radius: 20,
      };
      enemy.cooldownMs = 950;
    }
  }
}

function executeTelegraphedAttack(state: VoltLashState, enemy: EnemyEntity): void {
  const tel = enemy.telegraph;

  if (enemy.kind === 'drifter') {
    const spreadCount = state.wave >= 3 ? 3 : 1;
    for (let i = 0; i < spreadCount; i++) {
      const ang = tel.angle + (i - (spreadCount - 1) * 0.5) * 0.25;
      const spd = 0.31;
      state.projectiles.push({
        id: state.nextEntityId++,
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: 7,
        damage: 14,
        isPlayerOwned: false,
        isParried: false,
        isHoming: false,
        pierceCount: 0,
        lifeMs: 3600,
        maxLifeMs: 3600,
        color: '#fb7185',
        sourceName: `${enemy.name} — Pulse Bolt`,
        grazed: false,
        trail: [],
      });
    }
  } else if (enemy.kind === 'sniper') {
    const spd = 0.52;
    state.projectiles.push({
      id: state.nextEntityId++,
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(tel.angle) * spd,
      vy: Math.sin(tel.angle) * spd,
      radius: 8,
      damage: 22,
      isPlayerOwned: false,
      isParried: false,
      isHoming: false,
      pierceCount: 0,
      lifeMs: 3000,
      maxLifeMs: 3000,
      color: '#f43f5e',
      sourceName: `${enemy.name} — High-Velocity Rail Shot`,
      grazed: false,
      trail: [],
    });
  } else if (enemy.kind === 'charger') {
    enemy.dashTimeMs = 340;
    enemy.dashVx = Math.cos(tel.angle) * 0.72;
    enemy.dashVy = Math.sin(tel.angle) * 0.72;
  } else if (enemy.kind === 'boss') {
    if (tel.type === 'radial_burst') {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const ang = tel.angle + (i * Math.PI * 2) / count;
        const spd = 0.32;
        state.projectiles.push({
          id: state.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 8,
          damage: 18,
          isPlayerOwned: false,
          isParried: false,
          isHoming: false,
          pierceCount: 0,
          lifeMs: 4200,
          maxLifeMs: 4200,
          color: '#ef4444',
          sourceName: 'ARCHON-V — Orbital Ring Volley',
          grazed: false,
          trail: [],
        });
      }
    } else if (tel.type === 'dash_lane') {
      enemy.dashTimeMs = 380;
      enemy.dashVx = Math.cos(tel.angle) * 0.82;
      enemy.dashVy = Math.sin(tel.angle) * 0.82;
    } else if (tel.type === 'laser_line') {
      // Phase 3 spiral + aimed lance burst
      for (let i = -2; i <= 2; i++) {
        const ang = tel.angle + i * 0.16;
        const spd = 0.45;
        state.projectiles.push({
          id: state.nextEntityId++,
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 8,
          damage: 20,
          isPlayerOwned: false,
          isParried: false,
          isHoming: false,
          pierceCount: 0,
          lifeMs: 3600,
          maxLifeMs: 3600,
          color: '#facc15',
          sourceName: 'ARCHON-V — Singularity Lance',
          grazed: false,
          trail: [],
        });
      }
    }
  }
}

export function stepVoltLashState(
  state: VoltLashState,
  input: InputSnapshot,
  dtMs = FIXED_DT_MS
): void {
  if (state.status === 'DRAFT_UPGRADE') {
    if (typeof input.draftIndex === 'number') {
      selectUpgrade(state, input.draftIndex);
    }
    return;
  }

  if (state.status !== 'PLAYING') {
    return;
  }

  // Handle instant action triggers even during hit-stop
  if (input.dashPressed) {
    triggerDashParry(state, input);
  }
  if (input.bankPressed) {
    triggerBankOrOverdrive(state);
  }

  // Hit-stop freeze for heavy tactile impact
  if (state.hitStopMs > 0) {
    state.hitStopMs = Math.max(0, state.hitStopMs - dtMs);
    return;
  }

  state.elapsedMs += dtMs;
  const p = state.player;

  // Update aim
  if (Number.isFinite(input.aimX) && Number.isFinite(input.aimY)) {
    p.aimX = input.aimX;
    p.aimY = input.aimY;
  }

  // Track onboarding completion & fade out world prompt once player moves and dashes
  if (Math.hypot(input.moveX, input.moveY) > 0.1) {
    state.hasMoved = true;
  }
  if (state.hasMoved && state.hasDashed && state.tutorialPromptAlpha > 0) {
    state.tutorialPromptAlpha = Math.max(0, state.tutorialPromptAlpha - dtMs * 0.0022);
  }

  // Cooldowns & timers
  p.dashCooldownMs = Math.max(0, p.dashCooldownMs - dtMs);
  p.dashActiveMs = Math.max(0, p.dashActiveMs - dtMs);
  p.parryWindowMs = Math.max(0, p.parryWindowMs - dtMs);
  p.invulnMs = Math.max(0, p.invulnMs - dtMs);
  p.overdriveMs = Math.max(0, p.overdriveMs - dtMs);
  p.fireCooldownMs = Math.max(0, p.fireCooldownMs - dtMs);
  p.orbitalAngle = (p.orbitalAngle + dtMs * 0.0048) % (Math.PI * 2);

  // Combo decay
  if (state.combo > 0) {
    state.comboDecayMs -= dtMs;
    if (state.comboDecayMs <= 0) {
      state.combo = Math.max(0, state.combo - 1);
      state.comboDecayMs = 800;
      state.multiplier = computeMultiplier(state.combo, state.surge, p.overdriveMs);
    }
  }

  // Player Movement (Surge boosts speed!)
  const moveLen = Math.hypot(input.moveX, input.moveY);
  const normX = moveLen > 1 ? input.moveX / moveLen : input.moveX;
  const normY = moveLen > 1 ? input.moveY / moveLen : input.moveY;
  const surgeSpeedMult = 1 + (state.surge / 100) * 0.28 + (p.overdriveMs > 0 ? 0.25 : 0);
  const baseSpeed = 0.32 * surgeSpeedMult;

  p.vx = normX * baseSpeed;
  p.vy = normY * baseSpeed;
  p.x = clamp(p.x + p.vx * dtMs, p.radius + 10, state.arenaWidth - p.radius - 10);
  p.y = clamp(p.y + p.vy * dtMs, p.radius + 10, state.arenaHeight - p.radius - 10);

  // Record player motion trail
  p.trail.push({ x: p.x, y: p.y });
  if (p.trail.length > 10) {
    p.trail.shift();
  }

  // Synergy: Redline Afterburner plasma wake
  if (hasUpgrade(state, 'redline_trail') && state.surge >= 40 && state.elapsedMs % 64 < dtMs) {
    state.wakeNodes.push({
      x: p.x,
      y: p.y,
      radius: 24,
      lifeMs: 1100,
      maxLifeMs: 1100,
    });
  }

  // Auto-fire primary Pulse Cannon toward nearest enemy or aim point
  if (p.fireCooldownMs <= 0 && state.enemies.length > 0) {
    let targetX = p.aimX;
    let targetY = p.aimY;
    let bestD2 = Infinity;
    for (const enemy of state.enemies) {
      const d2 = distSq(p.x, p.y, enemy.x, enemy.y);
      if (d2 < bestD2) {
        bestD2 = d2;
        targetX = enemy.x;
        targetY = enemy.y;
      }
    }
    const ang = Math.atan2(targetY - p.y, targetX - p.x);
    const spd = 0.62;
    state.projectiles.push({
      id: state.nextEntityId++,
      x: p.x + Math.cos(ang) * 14,
      y: p.y + Math.sin(ang) * 14,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      radius: 5,
      damage: p.overdriveMs > 0 ? 18 : 11,
      isPlayerOwned: true,
      isParried: false,
      isHoming: false,
      pierceCount: p.overdriveMs > 0 ? 1 : 0,
      lifeMs: 1500,
      maxLifeMs: 1500,
      color: p.overdriveMs > 0 ? '#fde047' : '#38bdf8',
      sourceName: 'Pulse Cannon',
      grazed: true,
      trail: [],
    });
    const fireInterval = p.overdriveMs > 0 ? 105 : Math.max(125, 240 - state.surge * 1.1);
    p.fireCooldownMs = fireInterval;
  }

  // Update active Dash Tethers (Clothesline enemies & zap bullets!)
  for (let i = state.tethers.length - 1; i >= 0; i--) {
    const tether = state.tethers[i];
    tether.lifeMs -= dtMs;
    tether.zapTimerMs -= dtMs;
    if (tether.lifeMs <= 0) {
      state.tethers.splice(i, 1);
      continue;
    }

    if (tether.zapTimerMs <= 0) {
      tether.zapTimerMs = 150;
      const tetherDmg = hasUpgrade(state, 'tether_lightning') ? 16 : 10;
      for (let eIdx = state.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = state.enemies[eIdx];
        const d2 = pointToSegmentDistSq(enemy.x, enemy.y, tether.x1, tether.y1, tether.x2, tether.y2);
        if (d2 <= (enemy.radius + 14) ** 2) {
          damageEnemy(
            state,
            enemy,
            tetherDmg,
            (tether.x1 + tether.x2) * 0.5,
            (tether.y1 + tether.y2) * 0.5,
            'Volt Tether'
          );
        }
      }
    }

    if (hasUpgrade(state, 'tether_lightning')) {
      for (let j = state.projectiles.length - 1; j >= 0; j--) {
        const proj = state.projectiles[j];
        if (!proj.isPlayerOwned) {
          const d2 = pointToSegmentDistSq(proj.x, proj.y, tether.x1, tether.y1, tether.x2, tether.y2);
          if (d2 <= (proj.radius + 12) ** 2) {
            state.projectiles.splice(j, 1);
            addComboAndSurge(state, 1, 4, 25);
          }
        }
      }
    }
  }

  // Update Wake Nodes
  for (let i = state.wakeNodes.length - 1; i >= 0; i--) {
    const wake = state.wakeNodes[i];
    wake.lifeMs -= dtMs;
    if (wake.lifeMs <= 0) {
      state.wakeNodes.splice(i, 1);
      continue;
    }
    if (Math.floor((wake.lifeMs + dtMs) / 180) !== Math.floor(wake.lifeMs / 180)) {
      for (let eIdx = state.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = state.enemies[eIdx];
        if (distSq(wake.x, wake.y, enemy.x, enemy.y) <= (wake.radius + enemy.radius) ** 2) {
          damageEnemy(state, enemy, 9, wake.x, wake.y, 'Redline Wake');
        }
      }
    }
  }

  // Update Singularity Implosion Vortices
  for (let i = state.vortices.length - 1; i >= 0; i--) {
    const v = state.vortices[i];
    v.lifeMs -= dtMs;
    if (v.lifeMs <= 0) {
      state.vortices.splice(i, 1);
      continue;
    }
    for (const enemy of state.enemies) {
      if (enemy.kind === 'boss') continue;
      const d2 = distSq(v.x, v.y, enemy.x, enemy.y);
      if (d2 <= v.radius * v.radius && d2 > 16) {
        const d = Math.sqrt(d2);
        enemy.x += ((v.x - enemy.x) / d) * 0.19 * dtMs;
        enemy.y += ((v.y - enemy.y) / d) * 0.19 * dtMs;
      }
    }
  }

  // Update Ground Hazard Zones (0.65s windup -> active strike)
  for (let i = state.hazardZones.length - 1; i >= 0; i--) {
    const hz = state.hazardZones[i];
    if (hz.windupMs > 0) {
      hz.windupMs -= dtMs;
    } else {
      hz.activeMs -= dtMs;
      if (distSq(p.x, p.y, hz.x, hz.y) <= (hz.radius + p.radius - 4) ** 2) {
        hurtPlayer(state, hz.damage, hz.x, hz.y, hz.sourceName);
      }
      if (hz.activeMs <= 0) {
        state.hazardZones.splice(i, 1);
      }
    }
  }

  // Synergy: Mirror Aegis Orbitals
  const hasOrbitals = hasUpgrade(state, 'mirror_orbitals');
  const orbitalPositions: Array<{ x: number; y: number }> = [];
  if (hasOrbitals) {
    const orbDist = 38;
    orbitalPositions.push(
      {
        x: p.x + Math.cos(p.orbitalAngle) * orbDist,
        y: p.y + Math.sin(p.orbitalAngle) * orbDist,
      },
      {
        x: p.x + Math.cos(p.orbitalAngle + Math.PI) * orbDist,
        y: p.y + Math.sin(p.orbitalAngle + Math.PI) * orbDist,
      }
    );
  }

  // Update Projectiles, Grazing, Parrying & Collisions
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const proj = state.projectiles[i];
    proj.lifeMs -= dtMs;
    if (proj.lifeMs <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }

    // Homing steering for parried bolts & shards
    if (proj.isPlayerOwned && proj.isHoming && state.enemies.length > 0) {
      let nearest: EnemyEntity | null = null;
      let minD2 = Infinity;
      for (const enemy of state.enemies) {
        const d2 = distSq(proj.x, proj.y, enemy.x, enemy.y);
        if (d2 < minD2) {
          minD2 = d2;
          nearest = enemy;
        }
      }
      if (nearest) {
        const desiredAngle = Math.atan2(nearest.y - proj.y, nearest.x - proj.x);
        const speed = Math.hypot(proj.vx, proj.vy) || 0.6;
        const curAngle = Math.atan2(proj.vy, proj.vx);
        let diff = desiredAngle - curAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const nextAngle = curAngle + clamp(diff, -0.14, 0.14);
        proj.vx = Math.cos(nextAngle) * speed;
        proj.vy = Math.sin(nextAngle) * speed;
      }
    }

    proj.x += proj.vx * dtMs;
    proj.y += proj.vy * dtMs;
    proj.trail.push({ x: proj.x, y: proj.y });
    if (proj.trail.length > 6) {
      proj.trail.shift();
    }

    // Out of bounds check
    if (
      proj.x < -20 ||
      proj.x > state.arenaWidth + 20 ||
      proj.y < -20 ||
      proj.y > state.arenaHeight + 20
    ) {
      state.projectiles.splice(i, 1);
      continue;
    }

    if (proj.isPlayerOwned) {
      // Hit enemies
      for (let eIdx = state.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = state.enemies[eIdx];
        if (!enemy) continue;
        if (distSq(proj.x, proj.y, enemy.x, enemy.y) <= (proj.radius + enemy.radius) ** 2) {
          damageEnemy(state, enemy, proj.damage, proj.x, proj.y, proj.sourceName);
          if (proj.pierceCount > 0) {
            proj.pierceCount -= 1;
          } else {
            state.projectiles.splice(i, 1);
          }
          break;
        }
      }
    } else {
      // Check Mirror Aegis Orbital deflection
      let deflectedByOrbital = false;
      for (const orb of orbitalPositions) {
        if (distSq(proj.x, proj.y, orb.x, orb.y) <= (proj.radius + 14) ** 2) {
          parryProjectile(state, proj, orb.x, orb.y);
          deflectedByOrbital = true;
          break;
        }
      }
      if (deflectedByOrbital) continue;

      const d2ToPlayer = distSq(proj.x, proj.y, p.x, p.y);
      const hitDist = p.radius + proj.radius - 2;
      const grazeDist = p.grazeRadius + proj.radius;

      // Active Parry Window deflects incoming bullets
      if (p.parryWindowMs > 0 && d2ToPlayer <= (grazeDist + 16) ** 2) {
        parryProjectile(state, proj, p.x, p.y);
        continue;
      }

      // Direct hit on player hull
      if (d2ToPlayer <= hitDist * hitDist) {
        state.projectiles.splice(i, 1);
        hurtPlayer(state, proj.damage, proj.x, proj.y, proj.sourceName);
        continue;
      }

      // Grazing risk/reward mechanic! Passing within outer graze ring charges Volt-Surge & Combo
      if (!proj.grazed && d2ToPlayer <= grazeDist * grazeDist) {
        proj.grazed = true;
        state.totalGrazes += 1;
        const hasHalo = hasUpgrade(state, 'graze_halo');
        const surgeGain = hasHalo ? 13 : 8;
        addComboAndSurge(state, 1, surgeGain, 35);

        state.events.push({
          type: 'GRAZE',
          x: proj.x,
          y: proj.y,
          combo: state.combo,
          label: `GRAZE +${surgeGain}%`,
          color: '#34d399',
        });

        // Synergy: Tesla Graze Halo counter-zaps nearest enemy
        if (hasHalo && state.enemies.length > 0) {
          damageEnemy(state, state.enemies[0], 18, p.x, p.y, 'Tesla Graze Halo');
        }
      }
    }
  }

  // Update Enemies
  updateEnemies(state, dtMs);
  if (state.status !== 'PLAYING') return;

  // Update & Vacuum XP Shards
  const magnetRadius = hasUpgrade(state, 'kill_implosion') ? 260 : 145;
  for (let i = state.shards.length - 1; i >= 0; i--) {
    const s = state.shards[i];
    s.lifeMs -= dtMs;
    if (s.lifeMs <= 0) {
      state.shards.splice(i, 1);
      continue;
    }
    const d2 = distSq(p.x, p.y, s.x, s.y);
    if (d2 <= magnetRadius * magnetRadius) {
      const d = Math.sqrt(d2) || 1;
      s.vx = ((p.x - s.x) / d) * 0.45;
      s.vy = ((p.y - s.y) / d) * 0.45;
    } else {
      s.vx *= 0.94;
      s.vy *= 0.94;
    }
    s.x += s.vx * dtMs;
    s.y += s.vy * dtMs;

    if (d2 <= (p.radius + 14) ** 2) {
      state.xp += s.value;
      addComboAndSurge(state, 0, 3, s.value);
      state.shards.splice(i, 1);

      if (state.xp >= state.xpToNextDraft && state.upgrades.length < UPGRADE_CATALOG.length) {
        state.xp -= state.xpToNextDraft;
        state.xpToNextDraft = Math.round(state.xpToNextDraft * 1.35);
        state.level += 1;
        state.draftChoices = rollDraftChoices(state);
        if (state.draftChoices.length > 0) {
          state.status = 'DRAFT_UPGRADE';
          return;
        }
      }
    }
  }

  // Wave Escalation & Boss Spawning
  state.waveTimerMs += dtMs;
  state.spawnTimerMs -= dtMs;

  if (state.wave < state.maxWaves) {
    if (state.spawnTimerMs <= 0 && state.enemies.length < 4 + state.wave * 2) {
      spawnWavePack(state, state.wave >= 3 ? 3 : 2);
      state.spawnTimerMs = Math.max(2100, 3600 - state.wave * 320);
    }

    if (state.waveTimerMs >= state.waveDurationMs) {
      state.wave += 1;
      state.waveTimerMs = 0;
      state.events.push({
        type: 'WAVE_CLEAR',
        x: p.x,
        y: p.y,
        amount: state.wave,
        label: state.wave === state.maxWaves ? '⚠️ BOSS WAVE: ARCHON-V' : `WAVE ${state.wave}`,
        color: '#38bdf8',
      });

      if (state.wave === state.maxWaves) {
        // Clear minor stragglers and spawn Multi-Phase Boss ARCHON-V!
        state.enemies = [];
        spawnEnemy(state, 'boss', state.arenaWidth * 0.5, 130);
      }

      // Present 3-card transformative upgrade draft between waves
      state.draftChoices = rollDraftChoices(state);
      if (state.draftChoices.length > 0) {
        state.status = 'DRAFT_UPGRADE';
      }
    }
  } else {
    // Boss wave: ensure boss exists if not yet spawned
    if (!state.enemies.some((e) => e.kind === 'boss')) {
      spawnEnemy(state, 'boss', state.arenaWidth * 0.5, 130);
    }
  }
}
