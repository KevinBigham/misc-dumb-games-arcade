import { ASTRAL_CONFIG } from './config';
import {
  ASTRAL_RELICS,
  ASTRAL_SOCKET_BLUEPRINTS,
  ASTRAL_SOCKET_SLOTS,
  ASTRAL_VERDICTS,
  AstralRelicId,
  AstralSocketNodeType,
  AstralVerdict,
  BOSS_SECTORS,
} from './content';
import { SeededRng } from './rng';

export type AstralGameMode = 'CAMPAIGN' | 'SANDBOX' | 'DAILY_BLITZ';

export type AstralGameStatus =
  | 'AIMING'
  | 'IN_VOLLEY'
  | 'SECTOR_CLEARED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface AstralComet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseChips: number;
  isSupernova: boolean;
  splitGeneration: number;
  color: string;
  lastSocketHitId: number | null;
  socketCooldownMs: number;
  trail: Array<{ x: number; y: number }>;
}

export interface AstralSocketState {
  slotIndex: number;
  label: string;
  x: number;
  y: number;
  zone: 'UPPER_CROWN' | 'MID_CRUCIBLE' | 'LOWER_SLING';
  nodeType: AstralSocketNodeType | null;
  level: number;
  chargeCount: number;
  pulseAnimMs: number;
  totalHits: number;
  totalDamageGenerated: number;
}

export interface AstralBossNode {
  id: number;
  label: string;
  angleOffsetRad: number;
  orbitRadius: number;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export interface AstralBossState {
  sector: number;
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  coreX: number;
  coreY: number;
  coreRadius: number;
  orbitAngleRad: number;
  orbitSpeedRadPerSec: number;
  hazardIntervalMs: number;
  hazardTimerMs: number;
  hazardSpeed: number;
  stardustReward: number;
  color: string;
  secondaryColor: string;
  loreQuote: string;
  mechanicSummary: string;
  hitFlashMs: number;
  nodes: AstralBossNode[];
}

export interface AstralHazard {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  kind: 'VOID_METEOR' | 'HAWKING_LANCE';
  reflected: boolean;
}

export interface AstralSimEvent {
  type:
    | 'COMET_LAUNCHED'
    | 'SOCKET_HIT'
    | 'PRISM_SPLIT'
    | 'LIGHTNING_ARC'
    | 'WORMHOLE_WARP'
    | 'SONIC_NOVA'
    | 'BOSS_HIT'
    | 'NODE_DESTROYED'
    | 'FLIPPER_BOUNCE'
    | 'PERFECT_PARRY'
    | 'MAGNET_PULSE'
    | 'CHRONO_OVERDRIVE'
    | 'SUPERNOVA_CAST'
    | 'HULL_DAMAGED'
    | 'SECTOR_VICTORY'
    | 'GAME_VICTORY'
    | 'GAME_OVER';
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  value?: number;
  label?: string;
  color?: string;
  comboCount?: number;
}

export interface AstralGameState {
  seed: number;
  rngState: number;
  runId: string;
  mode: AstralGameMode;
  status: AstralGameStatus;
  sector: number;
  tick: number;
  elapsedMs: number;
  sectorElapsedMs: number;

  volleysRemaining: number;
  volleysFired: number;
  aegisHull: number;
  maxAegisHull: number;
  stardust: number;
  flux: number;
  maxFlux: number;

  // Multiplicative Balatro-style Score & Damage State
  totalScore: number;
  bestVolleyScore: number;
  currentVolleyScore: number;
  currentVolleyChips: number;
  currentComboMult: number;
  currentRelicMult: number;
  currentVolleyBounces: number;
  maxComboBounces: number;

  totalSplitsTriggered: number;
  totalPerfectParries: number;
  totalLightningChains: number;
  totalBossDamageDealt: number;

  // Aiming & Flipper Controls
  aimAngleDeg: number;
  paddleX: number;
  leftFlipperSwingMs: number;
  rightFlipperSwingMs: number;
  parryWindowMs: number;
  chronoOverdriveMs: number;
  hitStopMs: number;
  ouroborosSaveUsedThisVolley: boolean;
  selectedBuildType: AstralSocketNodeType;

  nextEntityId: number;
  comets: AstralComet[];
  sockets: AstralSocketState[];
  boss: AstralBossState;
  hazards: AstralHazard[];
  relics: AstralRelicId[];
  relicChoices: AstralRelicId[];
  events: AstralSimEvent[];
  recentLog: string[];
}

export type AstralInputAction =
  | { type: 'SET_AIM_ANGLE'; angleDeg: number }
  | { type: 'ADJUST_AIM_ANGLE'; deltaDeg: number }
  | { type: 'MOVE_PADDLE'; x: number }
  | { type: 'NUDGE_PADDLE'; dx: number }
  | { type: 'LAUNCH_COMET'; angleDeg?: number }
  | { type: 'FLIP_SWING'; side?: 'LEFT' | 'RIGHT' | 'BOTH' }
  | { type: 'CAST_MAGNET_PULSE' }
  | { type: 'CAST_CHRONO_OVERDRIVE' }
  | { type: 'CAST_SUPERNOVA_MULTIBALL' }
  | { type: 'SELECT_BUILD_TYPE'; nodeType: AstralSocketNodeType }
  | { type: 'BUILD_OR_UPGRADE_SOCKET'; slotIndex: number; nodeType?: AstralSocketNodeType }
  | { type: 'SELL_SOCKET'; slotIndex: number }
  | { type: 'DRAFT_RELIC'; relicId: AstralRelicId }
  | { type: 'ADVANCE_NEXT_SECTOR' }
  | { type: 'SWITCH_MODE'; mode: AstralGameMode; seed?: number };

export interface TrajectoryPreviewPoint {
  x: number;
  y: number;
  isBounce: boolean;
}

export interface OptimalLaunchRecommendation {
  bestAngleDeg: number;
  expectedDamage: number;
  expectedBounces: number;
  rationale: string;
  previewPoints: TrajectoryPreviewPoint[];
}

export interface CounterfactualArchetypeResult {
  archetypeId: 'SNIPER_PHYSICIST' | 'PRISM_ALCHEMIST' | 'PARRY_VIRTUOSO';
  title: string;
  strategySummary: string;
  sectorsCleared: number;
  totalScore: number;
  bestVolleyScore: number;
  maxComboBounces: number;
  verdictTitle: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pushLog(state: AstralGameState, message: string): void {
  state.recentLog.unshift(message);
  if (state.recentLog.length > 18) {
    state.recentLog.length = 18;
  }
}

export function computeRelicMultiplier(relics: readonly AstralRelicId[]): number {
  let mult = 1.0;
  for (const rId of relics) {
    const bp = ASTRAL_RELICS.find((r) => r.id === rId);
    if (bp) {
      mult *= bp.relicMultFactor;
    }
  }
  return Number(mult.toFixed(2));
}

export function createBossForSector(sectorNum: number): AstralBossState {
  const index = clamp(sectorNum - 1, 0, BOSS_SECTORS.length - 1);
  const bp = BOSS_SECTORS[index];
  const nodes: AstralBossNode[] = bp.nodes.map((n, idx) => {
    const angleRad = (n.offsetAngleDeg * Math.PI) / 180;
    const nodeHp = Math.round(bp.maxHp * n.hpRatio);
    return {
      id: idx + 1,
      label: n.label,
      angleOffsetRad: angleRad,
      orbitRadius: n.orbitRadius,
      x: bp.coreX + Math.cos(angleRad) * n.orbitRadius,
      y: bp.coreY + Math.sin(angleRad) * n.orbitRadius,
      radius: n.nodeRadius,
      hp: nodeHp,
      maxHp: nodeHp,
      alive: true,
    };
  });

  return {
    sector: bp.sector,
    id: bp.id,
    name: bp.name,
    title: bp.title,
    hp: bp.maxHp,
    maxHp: bp.maxHp,
    coreX: bp.coreX,
    coreY: bp.coreY,
    coreRadius: bp.coreRadius,
    orbitAngleRad: 0,
    orbitSpeedRadPerSec: bp.orbitSpeedRadPerSec,
    hazardIntervalMs: bp.hazardIntervalMs,
    hazardTimerMs: bp.hazardIntervalMs,
    hazardSpeed: bp.hazardSpeed,
    stardustReward: bp.stardustReward,
    color: bp.color,
    secondaryColor: bp.secondaryColor,
    loreQuote: bp.loreQuote,
    mechanicSummary: bp.mechanicSummary,
    hitFlashMs: 0,
    nodes,
  };
}

export function rollRelicDraftChoices(
  rng: SeededRng,
  ownedRelics: readonly AstralRelicId[]
): AstralRelicId[] {
  const available = ASTRAL_RELICS.map((r) => r.id).filter((id) => !ownedRelics.includes(id));
  if (available.length === 0) return [];
  const shuffled = rng.shuffle(available);
  return shuffled.slice(0, 3);
}

export function createInitialAstralState(
  seed: number = ASTRAL_CONFIG.DEFAULT_SEED,
  mode: AstralGameMode = 'CAMPAIGN'
): AstralGameState {
  const rng = new SeededRng(seed);
  const sockets: AstralSocketState[] = ASTRAL_SOCKET_SLOTS.map((slot) => ({
    slotIndex: slot.slotIndex,
    label: slot.label,
    x: slot.x,
    y: slot.y,
    zone: slot.zone,
    nodeType: slot.defaultType,
    level: 1,
    chargeCount: 0,
    pulseAnimMs: 0,
    totalHits: 0,
    totalDamageGenerated: 0,
  }));

  const starterRelic: AstralRelicId =
    mode === 'SANDBOX' ? 'CHROMATIC_PRISM' : 'NEWTON_THIRD_LAW';

  const initialRelics: AstralRelicId[] = [starterRelic];

  const state: AstralGameState = {
    seed: rng.getState(),
    rngState: rng.getState(),
    runId: `astral-${seed}-${mode}-${rng.nextUint32()}`,
    mode,
    status: 'AIMING',
    sector: 1,
    tick: 0,
    elapsedMs: 0,
    sectorElapsedMs: 0,

    volleysRemaining: mode === 'SANDBOX' ? 99 : ASTRAL_CONFIG.STARTING_VOLLEYS,
    volleysFired: 0,
    aegisHull: ASTRAL_CONFIG.STARTING_AEGIS_HULL,
    maxAegisHull: ASTRAL_CONFIG.MAX_AEGIS_HULL,
    stardust: mode === 'SANDBOX' ? 999 : ASTRAL_CONFIG.STARTING_STARDUST,
    flux: ASTRAL_CONFIG.STARTING_FLUX,
    maxFlux: ASTRAL_CONFIG.MAX_FLUX,

    totalScore: 0,
    bestVolleyScore: 0,
    currentVolleyScore: 0,
    currentVolleyChips: 0,
    currentComboMult: 1.0,
    currentRelicMult: computeRelicMultiplier(initialRelics),
    currentVolleyBounces: 0,
    maxComboBounces: 0,

    totalSplitsTriggered: 0,
    totalPerfectParries: 0,
    totalLightningChains: 0,
    totalBossDamageDealt: 0,

    aimAngleDeg: -14,
    paddleX: ASTRAL_CONFIG.LAUNCH_ORIGIN_X,
    leftFlipperSwingMs: 0,
    rightFlipperSwingMs: 0,
    parryWindowMs: 0,
    chronoOverdriveMs: 0,
    hitStopMs: 0,
    ouroborosSaveUsedThisVolley: false,
    selectedBuildType: 'PRISM_SPLITTER',

    nextEntityId: 100,
    comets: [],
    sockets,
    boss: createBossForSector(1),
    hazards: [],
    relics: initialRelics,
    relicChoices: [],
    events: [],
    recentLog: [
      '☄️ Star-Comet chambered in the Aegis Slingshot. Aim and press [SPACE] or Click to launch!',
    ],
  };

  state.rngState = rng.getState();
  return state;
}

export function cloneAstralState(state: AstralGameState): AstralGameState {
  return structuredClone(state);
}

function dealBossDamage(
  state: AstralGameState,
  rawDamage: number,
  sourceLabel: string,
  hitX: number,
  hitY: number
): number {
  if (state.boss.hp <= 0) return 0;
  const dmg = Math.max(1, Math.round(rawDamage));
  state.boss.hp = Math.max(0, state.boss.hp - dmg);
  state.boss.hitFlashMs = 140;
  state.totalBossDamageDealt += dmg;
  state.currentVolleyScore += dmg;
  state.totalScore += dmg;
  if (state.currentVolleyScore > state.bestVolleyScore) {
    state.bestVolleyScore = state.currentVolleyScore;
  }

  state.events.push({
    type: 'BOSS_HIT',
    x: hitX,
    y: hitY,
    value: dmg,
    label: `${sourceLabel} -${dmg}`,
    color: '#f59e0b',
    comboCount: state.currentVolleyBounces,
  });

  if (state.boss.hp <= 0) {
    handleSectorCleared(state);
  }
  return dmg;
}

function handleSectorCleared(state: AstralGameState): void {
  if (state.status === 'SECTOR_CLEARED' || state.status === 'VICTORY') return;

  const fluxBonusStardust = Math.floor(state.flux / 5);
  const ledgerMultiplier = state.relics.includes('COMPOUND_LEDGER') ? 1.4 : 1.0;
  const rewardStardust = Math.round(
    (state.boss.stardustReward + fluxBonusStardust * 4) * ledgerMultiplier
  );

  state.stardust += rewardStardust;
  state.comets = [];
  state.hazards = [];

  if (state.sector >= ASTRAL_CONFIG.MAX_SECTORS && state.mode === 'CAMPAIGN') {
    state.status = 'VICTORY';
    const clearBonus = state.volleysRemaining * 2500 + state.aegisHull * 50;
    state.totalScore += clearBonus;
    state.events.push({
      type: 'GAME_VICTORY',
      x: state.boss.coreX,
      y: state.boss.coreY,
      value: state.totalScore,
      label: 'OROBOROS SINGULARITY CONQUERED!',
      color: '#fde047',
    });
    pushLog(
      state,
      `👑 OMEGA VICTORY! Shattered ${state.boss.name} (+${rewardStardust}✦ Stardust, +${clearBonus} Mastery Score)!`
    );
    return;
  }

  const rng = new SeededRng(state.rngState);
  state.relicChoices = rollRelicDraftChoices(rng, state.relics);
  state.rngState = rng.getState();
  state.status = 'SECTOR_CLEARED';

  state.events.push({
    type: 'SECTOR_VICTORY',
    x: state.boss.coreX,
    y: state.boss.coreY,
    value: rewardStardust,
    label: `${state.boss.name} Shattered! +${rewardStardust}✦`,
    color: '#10b981',
  });

  pushLog(
    state,
    `🌟 SECTOR ${state.sector} CLEARED! Earned +${rewardStardust}✦ Stardust. Draft a Relic to ascend!`
  );
}

function triggerTeslaChain(
  state: AstralGameState,
  socket: AstralSocketState,
  comet: AstralComet
): void {
  const hasMaxwell = state.relics.includes('MAXWELL_COIL');
  const maxTargets = (hasMaxwell ? 4 : 2) + (socket.level - 1);
  const arcBaseDamage =
    (comet.baseChips + 28 * socket.level) *
    state.currentComboMult *
    state.currentRelicMult *
    (hasMaxwell ? 1.45 : 1.0);

  if (hasMaxwell) {
    state.flux = Math.min(state.maxFlux, state.flux + 5);
  }

  // Gather candidate targets: living boss nodes, hazards, and boss core
  const candidates: Array<{
    kind: 'NODE' | 'CORE' | 'HAZARD';
    x: number;
    y: number;
    dist: number;
    refId: number;
  }> = [];

  for (const node of state.boss.nodes) {
    if (node.alive) {
      const d = Math.hypot(node.x - socket.x, node.y - socket.y);
      candidates.push({ kind: 'NODE', x: node.x, y: node.y, dist: d, refId: node.id });
    }
  }
  for (const haz of state.hazards) {
    if (!haz.reflected) {
      const d = Math.hypot(haz.x - socket.x, haz.y - socket.y);
      candidates.push({ kind: 'HAZARD', x: haz.x, y: haz.y, dist: d, refId: haz.id });
    }
  }
  candidates.push({
    kind: 'CORE',
    x: state.boss.coreX,
    y: state.boss.coreY,
    dist: Math.hypot(state.boss.coreX - socket.x, state.boss.coreY - socket.y),
    refId: 0,
  });

  candidates.sort((a, b) => a.dist - b.dist);
  const chosen = candidates.slice(0, maxTargets);

  for (const target of chosen) {
    state.totalLightningChains += 1;
    state.events.push({
      type: 'LIGHTNING_ARC',
      x: socket.x,
      y: socket.y,
      targetX: target.x,
      targetY: target.y,
      value: Math.round(arcBaseDamage),
      color: '#38bdf8',
    });

    if (target.kind === 'HAZARD') {
      state.hazards = state.hazards.filter((h) => h.id !== target.refId);
      state.currentVolleyChips += 25;
    } else if (target.kind === 'NODE') {
      const node = state.boss.nodes.find((n) => n.id === target.refId);
      if (node && node.alive) {
        const dmg = Math.round(arcBaseDamage * 0.75);
        node.hp -= dmg;
        socket.totalDamageGenerated += dmg;
        dealBossDamage(state, dmg * 0.55, '⚡ Tesla Arc', node.x, node.y);
        if (node.hp <= 0) {
          node.alive = false;
          state.stardust += 12;
          state.currentVolleyChips += 120;
          state.events.push({
            type: 'NODE_DESTROYED',
            x: node.x,
            y: node.y,
            label: `${node.label} Broken!`,
            color: '#38bdf8',
          });
        }
      }
    } else {
      const dmg = dealBossDamage(state, arcBaseDamage * 0.85, '⚡ Tesla Core Arc', target.x, target.y);
      socket.totalDamageGenerated += dmg;
    }
    if (state.status !== 'IN_VOLLEY') break;
  }
}

function triggerSonicNova(state: AstralGameState, socket: AstralSocketState): void {
  const novaDamage = Math.round(
    (220 * socket.level + state.currentVolleyChips * 0.5) *
      state.currentComboMult *
      state.currentRelicMult
  );

  // Vaporize all active enemy hazards
  const clearedHazards = state.hazards.length;
  state.hazards = [];
  state.currentVolleyChips += clearedHazards * 35;

  // Damage all living boss nodes
  for (const node of state.boss.nodes) {
    if (node.alive) {
      node.hp -= Math.round(novaDamage * 0.5);
      if (node.hp <= 0) {
        node.alive = false;
        state.stardust += 12;
      }
    }
  }

  state.events.push({
    type: 'SONIC_NOVA',
    x: socket.x,
    y: socket.y,
    value: novaDamage,
    label: `🔔 SONIC NOVA! ${novaDamage}`,
    color: '#fde047',
  });

  const dealt = dealBossDamage(
    state,
    novaDamage,
    '🔔 Sonic Nova',
    state.boss.coreX,
    state.boss.coreY
  );
  socket.totalDamageGenerated += dealt;
  pushLog(
    state,
    `🔔 Harmonic Bell unleashed a Sonic Nova for ${dealt} Boss Damage and cleared ${clearedHazards} hazards!`
  );
}

function handleSocketCollision(
  state: AstralGameState,
  comet: AstralComet,
  socket: AstralSocketState,
  rng: SeededRng
): void {
  if (!socket.nodeType) return;
  const bp = ASTRAL_SOCKET_BLUEPRINTS[socket.nodeType];

  // Normal reflection vector from socket center to comet
  let nx = comet.x - socket.x;
  let ny = comet.y - socket.y;
  const dist = Math.hypot(nx, ny) || 1;
  nx /= dist;
  ny /= dist;

  // Push comet outside socket radius
  const overlap = comet.radius + bp.radius + 2 - dist;
  if (overlap > 0) {
    comet.x += nx * overlap;
    comet.y += ny * overlap;
  }

  const speed = Math.hypot(comet.vx, comet.vy);
  const dot = comet.vx * nx + comet.vy * ny;
  const newtonBonus = state.relics.includes('NEWTON_THIRD_LAW') ? 1.12 : 1.0;
  const targetSpeed = clamp(
    speed * bp.elasticity * newtonBonus,
    ASTRAL_CONFIG.MIN_COMET_SPEED + 40,
    ASTRAL_CONFIG.MAX_COMET_SPEED
  );

  let rvx = comet.vx - 2 * dot * nx;
  let rvy = comet.vy - 2 * dot * ny;
  // Add tiny deterministic angular jitter to prevent vertical infinite traps
  const jitter = (rng.nextFloat() - 0.5) * 0.14;
  const cosJ = Math.cos(jitter);
  const sinJ = Math.sin(jitter);
  const jvx = rvx * cosJ - rvy * sinJ;
  const jvy = rvx * sinJ + rvy * cosJ;
  const rMag = Math.hypot(jvx, jvy) || 1;
  comet.vx = (jvx / rMag) * targetSpeed;
  comet.vy = (jvy / rMag) * targetSpeed;

  comet.lastSocketHitId = socket.slotIndex;
  comet.socketCooldownMs = 110;

  // Apply Chips & Multiplier alchemy
  const levelScale = 1 + (socket.level - 1) * 0.35;
  const newtonChipBonus = state.relics.includes('NEWTON_THIRD_LAW') ? 15 : 0;
  const keplerChipBonus =
    state.relics.includes('KEPLER_PERIHELION') && targetSpeed > 380 ? 22 : 0;

  const chipsGained = Math.round(
    (bp.baseChipsBonus * levelScale + newtonChipBonus + keplerChipBonus) *
      (comet.isSupernova ? 1.3 : 1.0)
  );
  const multGained = Number((bp.comboMultBonus * levelScale).toFixed(2));

  comet.baseChips += Math.round(chipsGained * 0.35);
  state.currentVolleyChips += chipsGained;
  state.currentComboMult = Number((state.currentComboMult + multGained).toFixed(2));
  state.currentVolleyBounces += 1;
  if (state.currentVolleyBounces > state.maxComboBounces) {
    state.maxComboBounces = state.currentVolleyBounces;
  }
  state.flux = Math.min(state.maxFlux, state.flux + 4);

  socket.pulseAnimMs = 220;
  socket.totalHits += 1;

  const bounceScore = Math.round(
    chipsGained * state.currentComboMult * state.currentRelicMult
  );
  state.currentVolleyScore += bounceScore;
  state.totalScore += bounceScore;
  if (state.currentVolleyScore > state.bestVolleyScore) {
    state.bestVolleyScore = state.currentVolleyScore;
  }

  state.events.push({
    type: 'SOCKET_HIT',
    x: socket.x,
    y: socket.y,
    value: bounceScore,
    label: `${bp.symbol} +${chipsGained} Chips · ${state.currentComboMult.toFixed(1)}×`,
    color: bp.color,
    comboCount: state.currentVolleyBounces,
  });

  // Philosopher's Stone relic check: every 8th bounce spawns a Golden Comet & +18 Stardust
  if (
    state.relics.includes('PHILOSOPHER_STONE') &&
    state.currentVolleyBounces % 8 === 0 &&
    state.comets.length < ASTRAL_CONFIG.MAX_ACTIVE_COMETS
  ) {
    state.stardust += 18;
    state.comets.push({
      id: state.nextEntityId++,
      x: socket.x,
      y: socket.y - 16,
      vx: -comet.vx * 0.95,
      vy: -Math.abs(comet.vy),
      radius: ASTRAL_CONFIG.COMET_RADIUS,
      baseChips: comet.baseChips + 25,
      isSupernova: true,
      splitGeneration: comet.splitGeneration + 1,
      color: '#fde047',
      lastSocketHitId: socket.slotIndex,
      socketCooldownMs: 140,
      trail: [],
    });
  }

  // Node-specific alchemy
  switch (socket.nodeType) {
    case 'PRISM_SPLITTER': {
      const hasCrown = state.relics.includes('CHROMATIC_PRISM');
      if (hasCrown) {
        state.currentComboMult = Number((state.currentComboMult + 0.75).toFixed(2));
      }
      if (
        state.comets.length < ASTRAL_CONFIG.MAX_ACTIVE_COMETS &&
        comet.splitGeneration < 3
      ) {
        const angle = Math.atan2(comet.vy, comet.vx);
        const spread = 0.38; // ~22 degrees
        const cSpeed = Math.hypot(comet.vx, comet.vy);
        comet.vx = Math.cos(angle - spread) * cSpeed;
        comet.vy = Math.sin(angle - spread) * cSpeed;
        comet.splitGeneration += 1;

        const twinChips = hasCrown ? comet.baseChips : Math.round(comet.baseChips * 0.85);
        state.comets.push({
          id: state.nextEntityId++,
          x: comet.x,
          y: comet.y,
          vx: Math.cos(angle + spread) * cSpeed,
          vy: Math.sin(angle + spread) * cSpeed,
          radius: ASTRAL_CONFIG.COMET_RADIUS,
          baseChips: twinChips,
          isSupernova: comet.isSupernova,
          splitGeneration: comet.splitGeneration,
          color: '#f472b6',
          lastSocketHitId: socket.slotIndex,
          socketCooldownMs: 140,
          trail: [],
        });
        state.totalSplitsTriggered += 1;
        state.events.push({
          type: 'PRISM_SPLIT',
          x: socket.x,
          y: socket.y,
          label: '❖ PRISM MULTIBALL SPLIT!',
          color: '#ec4899',
        });
      }
      break;
    }

    case 'TESLA_PYLON': {
      triggerTeslaChain(state, socket, comet);
      break;
    }

    case 'GRAVITY_WELL': {
      // Redirect comet toward the Boss Core with +32% slingshot acceleration
      const toCoreX = state.boss.coreX - comet.x;
      const toCoreY = state.boss.coreY - comet.y;
      const dCore = Math.hypot(toCoreX, toCoreY) || 1;
      const slingSpeed = clamp(targetSpeed * 1.32, 320, ASTRAL_CONFIG.MAX_COMET_SPEED);
      comet.vx = (toCoreX / dCore) * slingSpeed;
      comet.vy = (toCoreY / dCore) * slingSpeed;
      break;
    }

    case 'FORGE_ANVIL': {
      const forgedBonus = 14 * socket.level;
      comet.baseChips += forgedBonus;
      comet.isSupernova = true;
      comet.color = '#fb923c';
      break;
    }

    case 'WORMHOLE_RELAY': {
      // Teleport comet to the Zenith Crown above the Boss Core!
      comet.x = state.boss.coreX + (rng.nextFloat() - 0.5) * 90;
      comet.y = 66;
      const aimX = state.boss.coreX - comet.x;
      const aimY = state.boss.coreY - comet.y;
      const aimMag = Math.hypot(aimX, aimY) || 1;
      const warpSpeed = clamp(targetSpeed * 1.15, 340, ASTRAL_CONFIG.MAX_COMET_SPEED);
      comet.vx = (aimX / aimMag) * warpSpeed;
      comet.vy = (aimY / aimMag) * warpSpeed;
      comet.isSupernova = true;
      state.events.push({
        type: 'WORMHOLE_WARP',
        x: socket.x,
        y: socket.y,
        targetX: comet.x,
        targetY: comet.y,
        label: '⏳ ZENITH WARP!',
        color: '#10b981',
      });
      break;
    }

    case 'HARMONIC_BELL': {
      socket.chargeCount += 1;
      const threshold = state.relics.includes('PYTHAGOREAN_CHORD') ? 2 : 3;
      if (state.relics.includes('PYTHAGOREAN_CHORD')) {
        state.currentComboMult = Number((state.currentComboMult + 0.5).toFixed(2));
      }
      if (socket.chargeCount >= threshold) {
        socket.chargeCount = 0;
        triggerSonicNova(state, socket);
      }
      break;
    }
  }
}

export function applyAstralInput(
  state: AstralGameState,
  action: AstralInputAction
): void {
  const rng = new SeededRng(state.rngState);

  switch (action.type) {
    case 'SET_AIM_ANGLE': {
      state.aimAngleDeg = clamp(action.angleDeg, -72, 72);
      break;
    }

    case 'ADJUST_AIM_ANGLE': {
      state.aimAngleDeg = clamp(state.aimAngleDeg + action.deltaDeg, -72, 72);
      break;
    }

    case 'MOVE_PADDLE': {
      state.paddleX = clamp(action.x, 140, ASTRAL_CONFIG.TABLE_WIDTH - 140);
      break;
    }

    case 'NUDGE_PADDLE': {
      state.paddleX = clamp(
        state.paddleX + action.dx,
        140,
        ASTRAL_CONFIG.TABLE_WIDTH - 140
      );
      break;
    }

    case 'SELECT_BUILD_TYPE': {
      state.selectedBuildType = action.nodeType;
      break;
    }

    case 'BUILD_OR_UPGRADE_SOCKET': {
      const socket = state.sockets.find((s) => s.slotIndex === action.slotIndex);
      if (!socket) break;
      const targetType = action.nodeType ?? state.selectedBuildType;
      const bp = ASTRAL_SOCKET_BLUEPRINTS[targetType];

      if (socket.nodeType === targetType) {
        if (socket.level >= 3) break;
        const upgradeCost = Math.round(bp.costStardust * 0.85 * socket.level);
        if (state.stardust < upgradeCost && state.mode !== 'SANDBOX') break;
        if (state.mode !== 'SANDBOX') state.stardust -= upgradeCost;
        socket.level += 1;
        socket.pulseAnimMs = 260;
        pushLog(
          state,
          `🔨 Upgraded ${bp.name} at ${socket.label} to Lv.${socket.level}!`
        );
      } else {
        const cost = bp.costStardust;
        if (state.stardust < cost && state.mode !== 'SANDBOX') break;
        if (state.mode !== 'SANDBOX') state.stardust -= cost;
        socket.nodeType = targetType;
        socket.level = 1;
        socket.chargeCount = 0;
        socket.pulseAnimMs = 260;
        pushLog(state, `✨ Wired ${bp.name} (${bp.symbol}) into ${socket.label}!`);
      }
      break;
    }

    case 'SELL_SOCKET': {
      const socket = state.sockets.find((s) => s.slotIndex === action.slotIndex);
      if (!socket || !socket.nodeType) break;
      const bp = ASTRAL_SOCKET_BLUEPRINTS[socket.nodeType];
      const refund = Math.round(bp.costStardust * 0.65 * socket.level);
      if (state.mode !== 'SANDBOX') {
        state.stardust += refund;
      }
      pushLog(
        state,
        `♻️ Salvaged ${bp.name} from ${socket.label} for +${refund}✦ Stardust.`
      );
      socket.nodeType = null;
      socket.level = 1;
      socket.chargeCount = 0;
      break;
    }

    case 'LAUNCH_COMET': {
      if (state.status !== 'AIMING' && state.comets.length > 0) break;
      if (state.volleysRemaining <= 0 && state.mode !== 'SANDBOX') break;

      if (typeof action.angleDeg === 'number') {
        state.aimAngleDeg = clamp(action.angleDeg, -72, 72);
      }

      if (state.mode !== 'SANDBOX') {
        state.volleysRemaining -= 1;
      }
      state.volleysFired += 1;
      state.status = 'IN_VOLLEY';
      state.ouroborosSaveUsedThisVolley = false;

      const hasSupernovaCore = state.relics.includes('SUPERNOVA_IGNITER');
      const startChips =
        ASTRAL_CONFIG.BASE_COMET_CHIPS + (hasSupernovaCore ? 35 : 0);
      state.currentVolleyScore = 0;
      state.currentVolleyChips = startChips;
      state.currentComboMult = hasSupernovaCore ? 1.6 : 1.0;
      state.currentRelicMult = computeRelicMultiplier(state.relics);
      state.currentVolleyBounces = 0;

      // Angle 0deg is straight up (-PI/2)
      const rad = ((state.aimAngleDeg - 90) * Math.PI) / 180;
      const vx = Math.cos(rad) * ASTRAL_CONFIG.LAUNCH_SPEED;
      const vy = Math.sin(rad) * ASTRAL_CONFIG.LAUNCH_SPEED;

      const launchX = clamp(state.paddleX, 160, ASTRAL_CONFIG.TABLE_WIDTH - 160);
      const launchY = ASTRAL_CONFIG.LAUNCH_ORIGIN_Y;

      state.comets.push({
        id: state.nextEntityId++,
        x: launchX,
        y: launchY,
        vx,
        vy,
        radius: ASTRAL_CONFIG.COMET_RADIUS,
        baseChips: startChips,
        isSupernova: hasSupernovaCore,
        splitGeneration: 0,
        color: hasSupernovaCore ? '#fde047' : '#38bdf8',
        lastSocketHitId: null,
        socketCooldownMs: 0,
        trail: [],
      });

      state.events.push({
        type: 'COMET_LAUNCHED',
        x: launchX,
        y: launchY,
        label: `☄️ Volley Launched (${state.aimAngleDeg.toFixed(0)}°)`,
        color: '#38bdf8',
      });
      pushLog(
        state,
        `☄️ Launched Star-Comet at ${state.aimAngleDeg.toFixed(0)}° (${startChips} Base Chips × ${state.currentRelicMult}× Relic Mult).`
      );
      break;
    }

    case 'FLIP_SWING': {
      const side = action.side ?? 'BOTH';
      if (side === 'LEFT' || side === 'BOTH') {
        state.leftFlipperSwingMs = ASTRAL_CONFIG.FLIPPER_SWING_DURATION_MS;
      }
      if (side === 'RIGHT' || side === 'BOTH') {
        state.rightFlipperSwingMs = ASTRAL_CONFIG.FLIPPER_SWING_DURATION_MS;
      }
      state.parryWindowMs = ASTRAL_CONFIG.PARRY_WINDOW_MS;

      // Active Magnetic Flipper Scoop: any comet or hazard near the flipper zone is immediately parried!
      for (const comet of state.comets) {
        const dy = Math.abs(comet.y - ASTRAL_CONFIG.PADDLE_Y);
        const dx = comet.x - state.paddleX;
        if (dy <= 68 && Math.abs(dx) <= ASTRAL_CONFIG.PADDLE_HALF_WIDTH + 48 && comet.vy > -60) {
          executeFlipperDeflection(state, comet, true);
        }
      }
      for (const haz of state.hazards) {
        const dy = Math.abs(haz.y - ASTRAL_CONFIG.PADDLE_Y);
        const dx = haz.x - state.paddleX;
        if (dy <= 72 && Math.abs(dx) <= ASTRAL_CONFIG.PADDLE_HALF_WIDTH + 50 && !haz.reflected) {
          reflectHazardWithParry(state, haz);
        }
      }
      break;
    }

    case 'CAST_MAGNET_PULSE': {
      if (state.status !== 'IN_VOLLEY' || state.comets.length === 0) break;
      if (state.flux < ASTRAL_CONFIG.FLUX_COST_MAGNET && state.mode !== 'SANDBOX') break;
      if (state.mode !== 'SANDBOX') {
        state.flux -= ASTRAL_CONFIG.FLUX_COST_MAGNET;
      }
      state.currentComboMult = Number((state.currentComboMult + 0.8).toFixed(2));

      // Redirect all active comets toward either the nearest Prism/Tesla socket or the Boss Core!
      for (const comet of state.comets) {
        const speed = clamp(
          Math.hypot(comet.vx, comet.vy) * 1.22,
          360,
          ASTRAL_CONFIG.MAX_COMET_SPEED
        );
        const dx = state.boss.coreX - comet.x;
        const dy = state.boss.coreY - comet.y;
        const dist = Math.hypot(dx, dy) || 1;
        comet.vx = (dx / dist) * speed;
        comet.vy = (dy / dist) * speed;
        comet.isSupernova = true;
        comet.lastSocketHitId = null;
      }

      state.events.push({
        type: 'MAGNET_PULSE',
        x: state.boss.coreX,
        y: state.boss.coreY,
        label: '🧲 SINGULARITY MAGNET PULSE (+0.8× Mult)',
        color: '#a855f7',
      });
      pushLog(
        state,
        `🧲 Cast Singularity Magnet Pulse! Comets locked onto ${state.boss.name} (+0.8× Combo Mult).`
      );
      break;
    }

    case 'CAST_CHRONO_OVERDRIVE': {
      if (state.flux < ASTRAL_CONFIG.FLUX_COST_CHRONO && state.mode !== 'SANDBOX') break;
      if (state.mode !== 'SANDBOX') {
        state.flux -= ASTRAL_CONFIG.FLUX_COST_CHRONO;
      }
      state.chronoOverdriveMs = 4000;
      state.currentVolleyChips += 35;
      for (const comet of state.comets) {
        comet.baseChips += 25;
      }
      state.events.push({
        type: 'CHRONO_OVERDRIVE',
        x: state.paddleX,
        y: ASTRAL_CONFIG.PADDLE_Y,
        label: '⏱️ CHRONO-DILATION OVERDRIVE (+25 Comet Chips)',
        color: '#38bdf8',
      });
      pushLog(
        state,
        '⏱️ Activated Chrono-Dilation! Hazards slowed to 35% and Aegis auto-tracks incoming comets!'
      );
      break;
    }

    case 'CAST_SUPERNOVA_MULTIBALL': {
      if (state.status !== 'IN_VOLLEY' || state.comets.length === 0) break;
      if (state.flux < ASTRAL_CONFIG.FLUX_COST_SUPERNOVA && state.mode !== 'SANDBOX') break;
      if (state.mode !== 'SANDBOX') {
        state.flux -= ASTRAL_CONFIG.FLUX_COST_SUPERNOVA;
      }
      state.currentComboMult = Number((state.currentComboMult + 1.1).toFixed(2));

      const primary = state.comets[0];
      for (const c of state.comets) {
        c.isSupernova = true;
        c.baseChips += 20;
        c.color = '#fde047';
      }

      if (state.comets.length < ASTRAL_CONFIG.MAX_ACTIVE_COMETS && primary) {
        state.comets.push({
          id: state.nextEntityId++,
          x: primary.x,
          y: primary.y,
          vx: -primary.vx || 240,
          vy: -Math.abs(primary.vy) || -360,
          radius: ASTRAL_CONFIG.COMET_RADIUS,
          baseChips: primary.baseChips,
          isSupernova: true,
          splitGeneration: primary.splitGeneration + 1,
          color: '#fde047',
          lastSocketHitId: null,
          socketCooldownMs: 0,
          trail: [],
        });
        state.totalSplitsTriggered += 1;
      }

      state.events.push({
        type: 'SUPERNOVA_CAST',
        x: primary.x,
        y: primary.y,
        label: '☀️ SUPERNOVA MULTIBALL OVERCHARGE!',
        color: '#fde047',
      });
      pushLog(
        state,
        '☀️ Ignited Supernova Multiball Overcharge! All comets empowered and cloned (+1.1× Mult)!'
      );
      break;
    }

    case 'DRAFT_RELIC': {
      if (!state.relics.includes(action.relicId)) {
        state.relics.push(action.relicId);
        state.currentRelicMult = computeRelicMultiplier(state.relics);
        const bp = ASTRAL_RELICS.find((r) => r.id === action.relicId);
        if (bp) {
          pushLog(
            state,
            `🏺 Bound Astral Relic: ${bp.symbol} ${bp.name} (Relic Mult now ${state.currentRelicMult.toFixed(2)}×)!`
          );
        }
      }
      state.relicChoices = [];
      if (state.status === 'SECTOR_CLEARED') {
        advanceToNextSector(state);
      }
      break;
    }

    case 'ADVANCE_NEXT_SECTOR': {
      if (state.status === 'SECTOR_CLEARED') {
        if (state.relicChoices.length > 0 && !state.relics.includes(state.relicChoices[0])) {
          state.relics.push(state.relicChoices[0]);
          state.currentRelicMult = computeRelicMultiplier(state.relics);
          state.relicChoices = [];
        }
        advanceToNextSector(state);
      }
      break;
    }

    case 'SWITCH_MODE': {
      const nextSeed = action.seed ?? state.seed;
      const fresh = createInitialAstralState(nextSeed, action.mode);
      Object.assign(state, fresh);
      return;
    }
  }

  state.rngState = rng.getState();
}

function advanceToNextSector(state: AstralGameState): void {
  state.sector = Math.min(ASTRAL_CONFIG.MAX_SECTORS, state.sector + 1);
  state.boss = createBossForSector(state.sector);
  state.status = 'AIMING';
  state.sectorElapsedMs = 0;
  state.volleysRemaining = Math.min(9, state.volleysRemaining + 3);
  state.aegisHull = Math.min(state.maxAegisHull, state.aegisHull + 25);
  state.flux = Math.min(state.maxFlux, state.flux + 30);
  pushLog(
    state,
    `🌌 Arrived at Sector ${state.sector}: ${state.boss.name} (+3 Volleys, +25 Hull repaired).`
  );
}

function executeFlipperDeflection(
  state: AstralGameState,
  comet: AstralComet,
  forcePerfectParry: boolean
): void {
  const isParry = forcePerfectParry || state.parryWindowMs > 0;
  const offsetRatio = clamp(
    (comet.x - state.paddleX) / ASTRAL_CONFIG.PADDLE_HALF_WIDTH,
    -0.85,
    0.85
  );
  const bounceAngleRad = (offsetRatio * 55 - 90) * (Math.PI / 180);
  const currentSpeed = Math.hypot(comet.vx, comet.vy);
  const boost = isParry ? 1.28 : 1.08;
  const newSpeed = clamp(
    Math.max(currentSpeed * boost, 430),
    400,
    ASTRAL_CONFIG.MAX_COMET_SPEED
  );

  comet.y = ASTRAL_CONFIG.PADDLE_Y - comet.radius - 6;
  comet.vx = Math.cos(bounceAngleRad) * newSpeed;
  comet.vy = Math.sin(bounceAngleRad) * newSpeed;
  comet.lastSocketHitId = null;

  const hasLaplace = state.relics.includes('LAPLACE_PENDULUM');
  if (hasLaplace) {
    state.currentComboMult = Number((state.currentComboMult + 0.85).toFixed(2));
    state.flux = Math.min(state.maxFlux, state.flux + 12);
  } else {
    state.currentComboMult = Number((state.currentComboMult + 0.3).toFixed(2));
    state.flux = Math.min(state.maxFlux, state.flux + 5);
  }

  if (isParry) {
    comet.isSupernova = true;
    comet.baseChips += 22;
    comet.color = '#fde047';
    state.currentComboMult = Number((state.currentComboMult * 1.22 + 0.4).toFixed(2));
    state.totalPerfectParries += 1;
    state.hitStopMs = 32;
    state.flux = Math.min(state.maxFlux, state.flux + 12);

    state.events.push({
      type: 'PERFECT_PARRY',
      x: comet.x,
      y: ASTRAL_CONFIG.PADDLE_Y,
      value: Math.round(comet.baseChips * state.currentComboMult),
      label: `⚡ PERFECT PARRY! (${state.currentComboMult.toFixed(1)}× Mult)`,
      color: '#fde047',
    });

    if (state.relics.includes('HAWKING_MIRROR')) {
      const lanceDmg = Math.round(260 * state.currentRelicMult);
      dealBossDamage(
        state,
        lanceDmg,
        '🛡️ Hawking Parry Lance',
        state.boss.coreX,
        state.boss.coreY
      );
    }
  } else {
    state.events.push({
      type: 'FLIPPER_BOUNCE',
      x: comet.x,
      y: ASTRAL_CONFIG.PADDLE_Y,
      label: 'Flipper Return',
      color: '#38bdf8',
    });
  }
}

function reflectHazardWithParry(state: AstralGameState, haz: AstralHazard): void {
  haz.reflected = true;
  const dx = state.boss.coreX - haz.x;
  const dy = state.boss.coreY - haz.y;
  const dist = Math.hypot(dx, dy) || 1;
  haz.vx = (dx / dist) * 520;
  haz.vy = (dy / dist) * 520;
  state.totalPerfectParries += 1;
  state.currentComboMult = Number((state.currentComboMult + 0.6).toFixed(2));
  state.flux = Math.min(state.maxFlux, state.flux + 10);

  state.events.push({
    type: 'PERFECT_PARRY',
    x: haz.x,
    y: haz.y,
    label: '🛡️ HAZARD PARRIED TO BOSS!',
    color: '#10b981',
  });
}

export function stepAstralState(state: AstralGameState, dtMs: number): void {
  if (
    state.status === 'VICTORY' ||
    state.status === 'GAME_OVER' ||
    state.status === 'SECTOR_CLEARED'
  ) {
    return;
  }

  if (state.hitStopMs > 0) {
    state.hitStopMs = Math.max(0, state.hitStopMs - dtMs);
    return;
  }

  const rng = new SeededRng(state.rngState);
  const dtSec = dtMs / 1000;

  state.tick += 1;
  state.elapsedMs += dtMs;
  state.sectorElapsedMs += dtMs;

  if (state.leftFlipperSwingMs > 0) {
    state.leftFlipperSwingMs = Math.max(0, state.leftFlipperSwingMs - dtMs);
  }
  if (state.rightFlipperSwingMs > 0) {
    state.rightFlipperSwingMs = Math.max(0, state.rightFlipperSwingMs - dtMs);
  }
  if (state.parryWindowMs > 0) {
    state.parryWindowMs = Math.max(0, state.parryWindowMs - dtMs);
  }
  if (state.chronoOverdriveMs > 0) {
    state.chronoOverdriveMs = Math.max(0, state.chronoOverdriveMs - dtMs);
  }
  if (state.boss.hitFlashMs > 0) {
    state.boss.hitFlashMs = Math.max(0, state.boss.hitFlashMs - dtMs);
  }

  for (const sock of state.sockets) {
    if (sock.pulseAnimMs > 0) {
      sock.pulseAnimMs = Math.max(0, sock.pulseAnimMs - dtMs);
    }
  }

  // Rotate Boss Constellation Nodes
  const timeScale = state.chronoOverdriveMs > 0 ? 0.35 : 1.0;
  state.boss.orbitAngleRad += state.boss.orbitSpeedRadPerSec * dtSec * timeScale;
  for (const node of state.boss.nodes) {
    if (!node.alive) continue;
    const totalAngle = state.boss.orbitAngleRad + node.angleOffsetRad;
    node.x = state.boss.coreX + Math.cos(totalAngle) * node.orbitRadius;
    node.y = state.boss.coreY + Math.sin(totalAngle) * node.orbitRadius;
  }

  if (state.status !== 'IN_VOLLEY') {
    state.rngState = rng.getState();
    return;
  }

  // Chrono-Overdrive auto-aligns the Aegis Paddle toward the lowest descending comet
  if (state.chronoOverdriveMs > 0 && state.comets.length > 0) {
    let lowestComet = state.comets[0];
    for (const c of state.comets) {
      if (c.y > lowestComet.y) lowestComet = c;
    }
    const dx = lowestComet.x - state.paddleX;
    state.paddleX = clamp(
      state.paddleX + clamp(dx, -420 * dtSec, 420 * dtSec),
      140,
      ASTRAL_CONFIG.TABLE_WIDTH - 140
    );
  }

  // Spawn Boss Hazards periodically during active volleys
  state.boss.hazardTimerMs -= dtMs * timeScale;
  if (state.boss.hazardTimerMs <= 0 && state.hazards.length < 5) {
    state.boss.hazardTimerMs = state.boss.hazardIntervalMs;
    const targetX = state.paddleX + (rng.nextFloat() - 0.5) * 140;
    const dx = targetX - state.boss.coreX;
    const dy = ASTRAL_CONFIG.PADDLE_Y - state.boss.coreY;
    const dist = Math.hypot(dx, dy) || 1;
    state.hazards.push({
      id: state.nextEntityId++,
      x: state.boss.coreX,
      y: state.boss.coreY + state.boss.coreRadius,
      vx: (dx / dist) * state.boss.hazardSpeed,
      vy: (dy / dist) * state.boss.hazardSpeed,
      radius: 11,
      kind: state.sector >= 4 ? 'HAWKING_LANCE' : 'VOID_METEOR',
      reflected: false,
    });
  }

  // Step Enemy Hazards
  const survivingHazards: AstralHazard[] = [];
  for (const haz of state.hazards) {
    const hScale = haz.reflected ? 1.0 : timeScale;
    haz.x += haz.vx * dtSec * hScale;
    haz.y += haz.vy * dtSec * hScale;

    // Event Horizon Lens Relic pulls hazards into Gravity Wells
    if (!haz.reflected && state.relics.includes('EVENT_HORIZON_LENS')) {
      let absorbed = false;
      for (const sock of state.sockets) {
        if (sock.nodeType === 'GRAVITY_WELL') {
          const d = Math.hypot(haz.x - sock.x, haz.y - sock.y);
          if (d < 95) {
            state.currentVolleyChips += 30;
            absorbed = true;
            break;
          }
        }
      }
      if (absorbed) continue;
    }

    // If reflected back to the Boss Core
    if (haz.reflected) {
      const dBoss = Math.hypot(haz.x - state.boss.coreX, haz.y - state.boss.coreY);
      if (dBoss <= state.boss.coreRadius + haz.radius + 8) {
        dealBossDamage(
          state,
          185 * state.currentRelicMult,
          '☄️ Reflected Lance',
          haz.x,
          haz.y
        );
        continue;
      }
    }

    // Check collision with active comets (comets smash enemy hazards!)
    let smashedByComet = false;
    for (const comet of state.comets) {
      if (Math.hypot(comet.x - haz.x, comet.y - haz.y) <= comet.radius + haz.radius + 4) {
        state.currentVolleyChips += 28;
        smashedByComet = true;
        break;
      }
    }
    if (smashedByComet) continue;

    // Check flipper parry or hull impact at bottom
    if (haz.y >= ASTRAL_CONFIG.PADDLE_Y - 14 && !haz.reflected) {
      const withinPaddle =
        Math.abs(haz.x - state.paddleX) <= ASTRAL_CONFIG.PADDLE_HALF_WIDTH + 24;
      if (withinPaddle && state.parryWindowMs > 0) {
        reflectHazardWithParry(state, haz);
        survivingHazards.push(haz);
        continue;
      } else if (withinPaddle) {
        state.aegisHull = Math.max(0, state.aegisHull - 10);
        state.events.push({
          type: 'HULL_DAMAGED',
          x: haz.x,
          y: ASTRAL_CONFIG.PADDLE_Y,
          value: 10,
          label: '-10 Aegis Hull',
          color: '#f43f5e',
        });
        if (state.aegisHull <= 0 && state.mode !== 'SANDBOX') {
          state.status = 'GAME_OVER';
          state.events.push({
            type: 'GAME_OVER',
            x: state.paddleX,
            y: ASTRAL_CONFIG.PADDLE_Y,
            label: 'AEGIS HULL BREACHED',
            color: '#f43f5e',
          });
          pushLog(state, '💥 Aegis Hull breached by Void Fire! Run concluded.');
          state.rngState = rng.getState();
          return;
        }
        continue;
      }
    }

    if (haz.y > ASTRAL_CONFIG.TABLE_HEIGHT + 20 || haz.y < -20) {
      continue;
    }
    survivingHazards.push(haz);
  }
  state.hazards = survivingHazards;

  // Step Comets
  const survivingComets: AstralComet[] = [];
  for (const comet of state.comets) {
    if (comet.socketCooldownMs > 0) {
      comet.socketCooldownMs = Math.max(0, comet.socketCooldownMs - dtMs);
      if (comet.socketCooldownMs === 0) {
        comet.lastSocketHitId = null;
      }
    }

    // Apply gentle table slope gravity
    comet.vy += ASTRAL_CONFIG.GRAVITY_Y * dtSec;

    // Apply continuous orbital curvature from nearby GRAVITY_WELL sockets
    for (const sock of state.sockets) {
      if (sock.nodeType === 'GRAVITY_WELL') {
        const dx = sock.x - comet.x;
        const dy = sock.y - comet.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 24 && dist < 145) {
          const pullStrength = (210 * sock.level) / Math.max(45, dist);
          // Combine radial pull with slight tangential orbital swirl
          const nx = dx / dist;
          const ny = dy / dist;
          comet.vx += (nx * 0.82 - ny * 0.35) * pullStrength * dtSec * 60;
          comet.vy += (ny * 0.82 + nx * 0.35) * pullStrength * dtSec * 60;
        }
      }
    }

    // Clamp comet velocity
    const curSpeed = Math.hypot(comet.vx, comet.vy);
    if (curSpeed > ASTRAL_CONFIG.MAX_COMET_SPEED) {
      comet.vx = (comet.vx / curSpeed) * ASTRAL_CONFIG.MAX_COMET_SPEED;
      comet.vy = (comet.vy / curSpeed) * ASTRAL_CONFIG.MAX_COMET_SPEED;
    } else if (curSpeed < ASTRAL_CONFIG.MIN_COMET_SPEED) {
      const safeMag = curSpeed || 1;
      comet.vx = (comet.vx / safeMag) * ASTRAL_CONFIG.MIN_COMET_SPEED;
      comet.vy = (comet.vy / safeMag) * ASTRAL_CONFIG.MIN_COMET_SPEED;
    }

    comet.x += comet.vx * dtSec;
    comet.y += comet.vy * dtSec;

    // Record ribbon trail
    comet.trail.unshift({ x: comet.x, y: comet.y });
    if (comet.trail.length > 14) {
      comet.trail.length = 14;
    }

    // 1. Left & Right Table Walls
    const leftWall = 68 + comet.radius;
    const rightWall = ASTRAL_CONFIG.TABLE_WIDTH - 68 - comet.radius;
    const topWall = 46 + comet.radius;

    if (comet.x < leftWall) {
      comet.x = leftWall;
      comet.vx = Math.abs(comet.vx) * 0.98;
    } else if (comet.x > rightWall) {
      comet.x = rightWall;
      comet.vx = -Math.abs(comet.vx) * 0.98;
    }

    if (comet.y < topWall) {
      comet.y = topWall;
      comet.vy = Math.abs(comet.vy) * 0.98;
    }

    // Upper corner 45-degree cathedral arch deflectors (prevents corner trapping)
    if (comet.x < 155 && comet.y < 125 && comet.x + comet.y < 235) {
      const sp = Math.hypot(comet.vx, comet.vy);
      comet.vx = Math.abs(sp * 0.72);
      comet.vy = Math.abs(sp * 0.68);
    } else if (
      comet.x > ASTRAL_CONFIG.TABLE_WIDTH - 155 &&
      comet.y < 125 &&
      ASTRAL_CONFIG.TABLE_WIDTH - comet.x + comet.y < 235
    ) {
      const sp = Math.hypot(comet.vx, comet.vy);
      comet.vx = -Math.abs(sp * 0.72);
      comet.vy = Math.abs(sp * 0.68);
    }

    // Lower Slingshot Funnel Rails (funnel balls from outer walls toward the flipper zone)
    if (comet.y > 430 && comet.y < 548) {
      const railRatio = (comet.y - 430) / (548 - 430);
      const leftRailX = 68 + railRatio * 145;
      const rightRailX = ASTRAL_CONFIG.TABLE_WIDTH - 68 - railRatio * 145;
      if (comet.x < leftRailX + comet.radius) {
        comet.x = leftRailX + comet.radius;
        const sp = Math.hypot(comet.vx, comet.vy);
        comet.vx = Math.abs(sp * 0.75);
        comet.vy = -Math.abs(sp * 0.55);
      } else if (comet.x > rightRailX - comet.radius) {
        comet.x = rightRailX - comet.radius;
        const sp = Math.hypot(comet.vx, comet.vy);
        comet.vx = -Math.abs(sp * 0.75);
        comet.vy = -Math.abs(sp * 0.55);
      }
    }

    // 2. Socket Node Collisions
    for (const sock of state.sockets) {
      if (!sock.nodeType) continue;
      if (comet.lastSocketHitId === sock.slotIndex && comet.socketCooldownMs > 0) {
        continue;
      }
      const bp = ASTRAL_SOCKET_BLUEPRINTS[sock.nodeType];
      const dist = Math.hypot(comet.x - sock.x, comet.y - sock.y);
      if (dist <= comet.radius + bp.radius) {
        handleSocketCollision(state, comet, sock, rng);
        break;
      }
    }
    if (state.status !== 'IN_VOLLEY') break;

    // 3. Orbiting Boss Shield Nodes Collisions
    for (const node of state.boss.nodes) {
      if (!node.alive) continue;
      const dist = Math.hypot(comet.x - node.x, comet.y - node.y);
      if (dist <= comet.radius + node.radius) {
        let nx = (comet.x - node.x) / (dist || 1);
        let ny = (comet.y - node.y) / (dist || 1);
        comet.x = node.x + nx * (comet.radius + node.radius + 2);
        comet.y = node.y + ny * (comet.radius + node.radius + 2);

        const dot = comet.vx * nx + comet.vy * ny;
        comet.vx = (comet.vx - 2 * dot * nx) * 1.08;
        comet.vy = (comet.vy - 2 * dot * ny) * 1.08;

        state.currentComboMult = Number((state.currentComboMult + 0.4).toFixed(2));
        state.currentVolleyBounces += 1;
        if (state.currentVolleyBounces > state.maxComboBounces) {
          state.maxComboBounces = state.currentVolleyBounces;
        }

        const nodeHitDmg = Math.round(
          (comet.baseChips + 30) *
            state.currentComboMult *
            state.currentRelicMult *
            (comet.isSupernova ? 1.35 : 1.0)
        );
        node.hp -= nodeHitDmg;
        dealBossDamage(
          state,
          nodeHitDmg * 0.5,
          `⚙️ ${node.label}`,
          node.x,
          node.y
        );

        if (node.hp <= 0) {
          node.alive = false;
          state.stardust += 15;
          state.currentVolleyChips += 150;
          state.currentComboMult = Number((state.currentComboMult + 0.75).toFixed(2));
          state.events.push({
            type: 'NODE_DESTROYED',
            x: node.x,
            y: node.y,
            value: 150,
            label: `💥 ${node.label} Shattered! (+15✦)`,
            color: '#f59e0b',
          });
        }
        break;
      }
    }
    if (state.status !== 'IN_VOLLEY') break;

    // 4. Boss Core Direct Collision
    const distCore = Math.hypot(
      comet.x - state.boss.coreX,
      comet.y - state.boss.coreY
    );
    if (distCore <= comet.radius + state.boss.coreRadius) {
      const nx = (comet.x - state.boss.coreX) / (distCore || 1);
      const ny = (comet.y - state.boss.coreY) / (distCore || 1);
      comet.x =
        state.boss.coreX + nx * (comet.radius + state.boss.coreRadius + 3);
      comet.y =
        state.boss.coreY + ny * (comet.radius + state.boss.coreRadius + 3);

      const dot = comet.vx * nx + comet.vy * ny;
      comet.vx = (comet.vx - 2 * dot * nx) * 1.12;
      comet.vy = (comet.vy - 2 * dot * ny) * 1.12;

      state.currentComboMult = Number((state.currentComboMult + 0.6).toFixed(2));
      state.currentVolleyBounces += 1;
      if (state.currentVolleyBounces > state.maxComboBounces) {
        state.maxComboBounces = state.currentVolleyBounces;
      }
      state.flux = Math.min(state.maxFlux, state.flux + 8);

      const coreHitDmg = Math.round(
        (comet.baseChips + 48) *
          state.currentComboMult *
          state.currentRelicMult *
          (comet.isSupernova ? 1.5 : 1.0)
      );
      dealBossDamage(state, coreHitDmg, '☄️ Core Impact', comet.x, comet.y);
      if (state.status !== 'IN_VOLLEY') break;
    }

    // 5. Twin Plasma Flippers & Aegis Paddle Deflection
    if (
      comet.vy > 0 &&
      comet.y >= ASTRAL_CONFIG.PADDLE_Y - comet.radius - 10 &&
      comet.y <= ASTRAL_CONFIG.PADDLE_Y + 22
    ) {
      const paddleReach =
        ASTRAL_CONFIG.PADDLE_HALF_WIDTH +
        (state.chronoOverdriveMs > 0 ? 28 : 12);
      if (Math.abs(comet.x - state.paddleX) <= paddleReach) {
        executeFlipperDeflection(state, comet, false);
      }
    }

    // 6. Bottom Drain Check & Ouroboros Tail-Eater Relic Rescue
    if (comet.y > ASTRAL_CONFIG.TABLE_HEIGHT + 16) {
      if (
        state.relics.includes('OUROBOROS_TAIL') &&
        !state.ouroborosSaveUsedThisVolley
      ) {
        state.ouroborosSaveUsedThisVolley = true;
        comet.x = state.boss.coreX;
        comet.y = 66;
        comet.vx = (rng.nextFloat() - 0.5) * 160;
        comet.vy = 380;
        comet.isSupernova = true;
        comet.color = '#10b981';
        state.currentComboMult = Number((state.currentComboMult + 1.0).toFixed(2));
        state.events.push({
          type: 'WORMHOLE_WARP',
          x: state.paddleX,
          y: ASTRAL_CONFIG.PADDLE_Y,
          targetX: comet.x,
          targetY: comet.y,
          label: '🐍 OUROBOROS ETERNAL RESCUE!',
          color: '#10b981',
        });
        survivingComets.push(comet);
      }
      continue;
    }

    survivingComets.push(comet);
  }

  if (state.status === 'IN_VOLLEY') {
    state.comets = survivingComets;
    if (state.comets.length === 0) {
      // Volley finished! Calculate Flux Interest Stardust
      const interestStardust = Math.floor(state.flux / 5) * 3;
      const ledgerMult = state.relics.includes('COMPOUND_LEDGER') ? 1.4 : 1.0;
      const totalStardustEarned = Math.round((15 + interestStardust) * ledgerMult);
      state.stardust += totalStardustEarned;
      state.hazards = [];

      if (state.volleysRemaining <= 0 && state.mode !== 'SANDBOX') {
        state.status = 'GAME_OVER';
        state.events.push({
          type: 'GAME_OVER',
          x: state.boss.coreX,
          y: state.boss.coreY,
          label: 'ALL STAR-COMETS EXPENDED',
          color: '#f43f5e',
        });
        pushLog(
          state,
          `🌑 All volleys expended against ${state.boss.name}. Final Score: ${state.totalScore.toLocaleString()}.`
        );
      } else {
        state.status = 'AIMING';
        pushLog(
          state,
          `✨ Volley Complete! Dealt ${state.currentVolleyScore.toLocaleString()} pts (${state.currentVolleyBounces} bounces) & banked +${totalStardustEarned}✦ Stardust.`
        );
      }
    }
  }

  state.rngState = rng.getState();
}

export function computeTrajectoryPreview(
  state: AstralGameState,
  overrideAngleDeg?: number,
  maxSteps: number = 95
): TrajectoryPreviewPoint[] {
  const sim = cloneAstralState(state);
  sim.status = 'AIMING';
  sim.comets = [];
  const angle = overrideAngleDeg ?? state.aimAngleDeg;
  applyAstralInput(sim, { type: 'LAUNCH_COMET', angleDeg: angle });

  const points: TrajectoryPreviewPoint[] = [];
  let prevBounces = 0;

  for (let i = 0; i < maxSteps; i++) {
    stepAstralState(sim, ASTRAL_CONFIG.FIXED_STEP_MS);
    const primary = sim.comets[0];
    if (!primary) break;
    if (i % 2 === 0 || sim.currentVolleyBounces !== prevBounces) {
      points.push({
        x: primary.x,
        y: primary.y,
        isBounce: sim.currentVolleyBounces !== prevBounces,
      });
      prevBounces = sim.currentVolleyBounces;
    }
  }

  return points;
}

export function computeOptimalLaunchHint(
  state: AstralGameState
): OptimalLaunchRecommendation {
  let bestAngleDeg = state.aimAngleDeg;
  let bestDamage = -1;
  let bestBounces = 0;

  for (let angle = -60; angle <= 60; angle += 6) {
    const sim = cloneAstralState(state);
    sim.status = 'AIMING';
    sim.comets = [];
    applyAstralInput(sim, { type: 'LAUNCH_COMET', angleDeg: angle });

    for (let step = 0; step < 140; step++) {
      stepAstralState(sim, ASTRAL_CONFIG.FIXED_STEP_MS);
      if ((sim.status as AstralGameStatus) !== 'IN_VOLLEY') break;
    }

    const scoreMetric =
      sim.currentVolleyScore +
      sim.currentVolleyBounces * 120 +
      sim.totalSplitsTriggered * 450;
    if (scoreMetric > bestDamage) {
      bestDamage = scoreMetric;
      bestAngleDeg = angle;
      bestBounces = sim.currentVolleyBounces;
    }
  }

  const previewPoints = computeTrajectoryPreview(state, bestAngleDeg, 95);
  return {
    bestAngleDeg,
    expectedDamage: Math.max(150, Math.round(bestDamage)),
    expectedBounces: Math.max(2, bestBounces),
    rationale: `Launching at ${bestAngleDeg}° routes through high-value sockets for ~${Math.max(2, bestBounces)} rapid bounces and maximum Chips × Mult cascade.`,
    previewPoints,
  };
}

export function evaluateAstralVerdict(state: AstralGameState): AstralVerdict {
  if (state.status === 'VICTORY' || state.sector >= 5) {
    return ASTRAL_VERDICTS.SINGULARITY_SOVEREIGN;
  }
  if (state.totalSplitsTriggered >= 4) {
    return ASTRAL_VERDICTS.MULTIBALL_ALCHEMIST;
  }
  if (state.totalPerfectParries >= 3) {
    return ASTRAL_VERDICTS.PARRY_VIRTUOSO;
  }
  return ASTRAL_VERDICTS.ENTROPY_PILGRIM;
}

export function runAstralCounterfactuals(
  seed: number
): CounterfactualArchetypeResult[] {
  const archetypes: Array<{
    id: CounterfactualArchetypeResult['archetypeId'];
    title: string;
    summary: string;
    buildType: AstralSocketNodeType;
    preferredSlot: number;
    angleSweep: number[];
    useMagnet: boolean;
    useParry: boolean;
  }> = [
    {
      id: 'SNIPER_PHYSICIST',
      title: 'Kepler Trajectory Sniper',
      summary: 'Prioritizes Forge Anvils & Gravity Wells, banking Flux for compound Stardust interest.',
      buildType: 'FORGE_ANVIL',
      preferredSlot: 5,
      angleSweep: [-18, 18, -8, 12],
      useMagnet: false,
      useParry: false,
    },
    {
      id: 'PRISM_ALCHEMIST',
      title: 'Bifrost Multiball Alchemist',
      summary: 'Wires Prism Splitters & Tesla Pylons, casting Supernova Multiball to flood the crucible.',
      buildType: 'PRISM_SPLITTER',
      preferredSlot: 6,
      angleSweep: [-26, 24, -14, 16],
      useMagnet: true,
      useParry: true,
    },
    {
      id: 'PARRY_VIRTUOSO',
      title: 'Hawking Flipper Virtuoso',
      summary: 'Chains timed Flipper Parries and Ouroboros Wormholes for high Combo Multiplier volleys.',
      buildType: 'WORMHOLE_RELAY',
      preferredSlot: 9,
      angleSweep: [0, -22, 22, -10],
      useMagnet: true,
      useParry: true,
    },
  ];

  return archetypes.map((arc) => {
    const sim = createInitialAstralState(seed, 'CAMPAIGN');
    applyAstralInput(sim, {
      type: 'BUILD_OR_UPGRADE_SOCKET',
      slotIndex: arc.preferredSlot,
      nodeType: arc.buildType,
    });

    for (let v = 0; v < 4; v++) {
      if (sim.status === 'SECTOR_CLEARED') {
        applyAstralInput(sim, { type: 'ADVANCE_NEXT_SECTOR' });
      }
      if (sim.status !== 'AIMING') break;

      const angle = arc.angleSweep[v % arc.angleSweep.length];
      applyAstralInput(sim, { type: 'LAUNCH_COMET', angleDeg: angle });

      for (let step = 0; step < 190; step++) {
        if (arc.useMagnet && step === 45 && sim.flux >= ASTRAL_CONFIG.FLUX_COST_MAGNET) {
          applyAstralInput(sim, { type: 'CAST_MAGNET_PULSE' });
        }
        if (arc.useParry && step % 32 === 0 && sim.comets[0]) {
          applyAstralInput(sim, { type: 'MOVE_PADDLE', x: sim.comets[0].x });
          applyAstralInput(sim, { type: 'FLIP_SWING', side: 'BOTH' });
        }
        stepAstralState(sim, ASTRAL_CONFIG.FIXED_STEP_MS);
        if ((sim.status as AstralGameStatus) !== 'IN_VOLLEY') break;
      }
    }

    const verdict = evaluateAstralVerdict(sim);
    return {
      archetypeId: arc.id,
      title: arc.title,
      strategySummary: arc.summary,
      sectorsCleared: sim.status === 'VICTORY' ? 5 : Math.max(0, sim.sector - (sim.boss.hp > 0 ? 1 : 0)),
      totalScore: sim.totalScore,
      bestVolleyScore: sim.bestVolleyScore,
      maxComboBounces: sim.maxComboBounces,
      verdictTitle: verdict.title,
    };
  });
}
