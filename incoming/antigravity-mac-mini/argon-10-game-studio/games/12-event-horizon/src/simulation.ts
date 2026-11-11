import { HORIZON_CONFIG } from './config';
import {
  ASTRO_RELIC_CATALOG,
  AstroRelicId,
  BumperKind,
  EnemyKind,
  GravityWellKind,
  HORIZON_VERDICTS,
  HorizonGameMode,
  ODYSSEY_SECTORS,
  SHIP_CHASSIS_CATALOG,
  ShipChassisId,
  TRICKSHOT_PUZZLES,
} from './content';
import { SeededRng } from './rng';

export interface WorldlineSample {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface HorizonEchoState {
  active: boolean;
  frames: WorldlineSample[];
  frameIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface HorizonGravityWell {
  id: string;
  name: string;
  kind: GravityWellKind;
  x: number;
  y: number;
  mass: number;
  coreRadius: number;
  skimRadius: number;
  pairedWellId?: string;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitAngularSpeed?: number;
  orbitPhase?: number;
  pulsePhase: number;
}

export interface HorizonBumper {
  id: string;
  kind: BumperKind;
  x: number;
  y: number;
  radius: number;
  restitution: number;
  harmonicNoteIndex: number;
  hitFlashMs: number;
  activatedInChain: boolean;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitAngularSpeed?: number;
  orbitPhase?: number;
}

export interface HorizonEnemy {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  shielded: boolean;
  fireCooldownMs: number;
  hitFlashMs: number;
  orbitAngle: number;
}

export interface HorizonProjectile {
  id: string;
  friendly: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  ttlMs: number;
  color: string;
}

export interface HorizonStarMote {
  id: string;
  kind: 'STARDUST' | 'CHRONO_SHARD' | 'HULL_CELL';
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  ttlMs: number;
}

export interface HorizonConstellationPolygon {
  id: string;
  vertices: Array<{ x: number; y: number }>;
  areaPx2: number;
  enemiesHit: number;
  scoreAwarded: number;
  ttlMs: number;
  maxTtlMs: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  hitBumperId?: string;
  skimWellId?: string;
}

export type HorizonSimEventType =
  | 'SLINGSHOT_LAUNCH'
  | 'BUMPER_RICOCHET'
  | 'CONSTELLATION_ENCLOSED'
  | 'EVENT_HORIZON_SKIM'
  | 'WORMHOLE_TRANSIT'
  | 'ROCHE_CRUSH'
  | 'SUPERNOVA_PULSE'
  | 'CHRONO_REWIND'
  | 'ENEMY_DESTROYED'
  | 'SHIP_DAMAGED'
  | 'RELIC_DRAFTED'
  | 'SECTOR_CLEARED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface HorizonSimEvent {
  type: HorizonSimEventType;
  x: number;
  y: number;
  text: string;
  color: string;
  noteIndex?: number;
  magnitude?: number;
}

export interface HorizonShipState {
  chassis: ShipChassisId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hull: number;
  maxHull: number;
  hawkingEnergy: number;
  maxHawkingEnergy: number;
  chronoCharges: number;
  maxChronoCharges: number;
  lorentzGamma: number;
  peakLorentzGamma: number;
  isAiming: boolean;
  aimAngleRad: number;
  aimPowerPct: number;
  tetherTargetId: string | null;
  tetherKind: 'WELL' | 'BUMPER' | null;
  invulnerableMs: number;
  wormholeCooldownMs: number;
  supernovaCooldownMs: number;
  skimSoundCooldownMs: number;
  bounceChain: number;
  constellationVertices: Array<{ id: string; x: number; y: number }>;
}

export interface HorizonRunStats {
  enemiesVaporized: number;
  rocheCrushes: number;
  polygonsEnclosed: number;
  totalPolygonAreaPx2: number;
  wormholeTransits: number;
  skimsPerformed: number;
  rewindsUsed: number;
  supernovasUsed: number;
  bumperRicochets: number;
}

export interface HorizonGameState {
  seed: number;
  rngState: number;
  mode: HorizonGameMode;
  status: 'PLAYING' | 'RELIC_DRAFT' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';
  sector: number;
  sectorTitle: string;
  sectorSubtitle: string;
  sectorHint: string;
  tick: number;
  elapsedMs: number;
  score: number;
  launchesUsed: number;
  sectorLaunchesUsed: number;
  parLaunches: number | null;
  ship: HorizonShipState;
  worldlineHistory: WorldlineSample[];
  activeEcho: HorizonEchoState | null;
  wells: HorizonGravityWell[];
  bumpers: HorizonBumper[];
  enemies: HorizonEnemy[];
  projectiles: HorizonProjectile[];
  starMotes: HorizonStarMote[];
  activePolygons: HorizonConstellationPolygon[];
  relics: AstroRelicId[];
  relicDraftChoices: AstroRelicId[];
  stats: HorizonRunStats;
  verdictId: string | null;
  log: string[];
  events: HorizonSimEvent[];
}

export type HorizonInputAction =
  | { type: 'BEGIN_AIM'; angleRad?: number; powerPct?: number }
  | { type: 'UPDATE_AIM'; angleRad: number; powerPct: number }
  | { type: 'CANCEL_AIM' }
  | { type: 'LAUNCH_SLINGSHOT'; angleRad?: number; powerPct?: number }
  | { type: 'NUDGE_THRUST'; dx: number; dy: number }
  | { type: 'TOGGLE_TETHER' }
  | { type: 'TRIGGER_SUPERNOVA' }
  | { type: 'TRIGGER_REWIND' }
  | { type: 'TRIGGER_AI_COACH' }
  | { type: 'SELECT_RELIC'; relicId: AstroRelicId }
  | { type: 'SELECT_CHASSIS'; chassis: ShipChassisId }
  | { type: 'SELECT_MODE'; mode: HorizonGameMode; sectorOrPuzzle?: number }
  | { type: 'TOGGLE_PAUSE' };

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computePolygonAreaShoelace(vertices: ReadonlyArray<{ x: number; y: number }>): number {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const cur = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    sum += cur.x * next.y - next.x * cur.y;
  }
  return Math.abs(sum) * 0.5;
}

export function isPointInPolygon(
  px: number,
  py: number,
  vertices: ReadonlyArray<{ x: number; y: number }>
): boolean {
  if (vertices.length < 3) return false;
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq <= 1e-6) {
    return Math.hypot(px - x1, py - y1);
  }
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export function computeLorentzGamma(speed: number, bounceChain: number, hasNoether: boolean): number {
  const beta = clamp(speed / HORIZON_CONFIG.SPEED_OF_LIGHT_CAP, 0, 0.965);
  const kinematicGamma = 1 / Math.sqrt(1 - beta * beta);
  const chainBonus = bounceChain * (hasNoether ? 0.4 : 0.22);
  return Number(clamp(kinematicGamma + chainBonus, 1.0, 8.0).toFixed(2));
}

function makeEnemyFromBlueprint(
  bp: { kind: EnemyKind; x: number; y: number; vx?: number; vy?: number; hp?: number },
  index: number,
  sectorScale: number = 1
): HorizonEnemy {
  const baseHpMap: Record<EnemyKind, number> = {
    VOID_DRONE: 45,
    PHASE_FRIGATE: 95,
    ENTROPY_COMET: 70,
    TESSERA_WARDEN: 135,
    KARDASHEV_BOSS: 440,
  };
  const radiusMap: Record<EnemyKind, number> = {
    VOID_DRONE: 15,
    PHASE_FRIGATE: 20,
    ENTROPY_COMET: 17,
    TESSERA_WARDEN: 23,
    KARDASHEV_BOSS: 44,
  };
  const hp = Math.round((bp.hp ?? baseHpMap[bp.kind]) * sectorScale);
  return {
    id: `enemy-${index}-${bp.kind.toLowerCase()}`,
    kind: bp.kind,
    x: bp.x,
    y: bp.y,
    vx: bp.vx ?? 0,
    vy: bp.vy ?? 0,
    radius: radiusMap[bp.kind],
    hp,
    maxHp: hp,
    shielded: bp.kind === 'TESSERA_WARDEN' || bp.kind === 'KARDASHEV_BOSS',
    fireCooldownMs: 1800 + (index % 4) * 450,
    hitFlashMs: 0,
    orbitAngle: (index * Math.PI) / 3,
  };
}

export function createInitialHorizonState(
  seed: number = HORIZON_CONFIG.DEFAULT_SEED,
  options?: {
    mode?: HorizonGameMode;
    chassis?: ShipChassisId;
    startSector?: number;
  }
): HorizonGameState {
  const cleanSeed = (seed >>> 0) || HORIZON_CONFIG.DEFAULT_SEED;
  const rng = new SeededRng(cleanSeed);
  const mode = options?.mode ?? 'ODYSSEY';
  const chassisId = options?.chassis ?? 'VANGUARD';
  const chassis = SHIP_CHASSIS_CATALOG[chassisId];
  const startSector = options?.startSector ?? 1;

  const state: HorizonGameState = {
    seed: cleanSeed,
    rngState: rng.getState(),
    mode,
    status: 'PLAYING',
    sector: startSector,
    sectorTitle: '',
    sectorSubtitle: '',
    sectorHint: '',
    tick: 0,
    elapsedMs: 0,
    score: 0,
    launchesUsed: 0,
    sectorLaunchesUsed: 0,
    parLaunches: null,
    ship: {
      chassis: chassisId,
      x: 190,
      y: 300,
      vx: 30,
      vy: -135,
      radius: HORIZON_CONFIG.SHIP_RADIUS,
      hull: chassis.maxHull,
      maxHull: chassis.maxHull,
      hawkingEnergy: HORIZON_CONFIG.INITIAL_HAWKING_ENERGY,
      maxHawkingEnergy: HORIZON_CONFIG.MAX_HAWKING_ENERGY,
      chronoCharges: HORIZON_CONFIG.INITIAL_CHRONO_CHARGES,
      maxChronoCharges: HORIZON_CONFIG.MAX_CHRONO_CHARGES,
      lorentzGamma: 1.05,
      peakLorentzGamma: 1.05,
      isAiming: false,
      aimAngleRad: -0.45,
      aimPowerPct: 0.85,
      tetherTargetId: null,
      tetherKind: null,
      invulnerableMs: 0,
      wormholeCooldownMs: 0,
      supernovaCooldownMs: 0,
      skimSoundCooldownMs: 0,
      bounceChain: 0,
      constellationVertices: [],
    },
    worldlineHistory: [],
    activeEcho: null,
    wells: [],
    bumpers: [],
    enemies: [],
    projectiles: [],
    starMotes: [],
    activePolygons: [],
    relics: [],
    relicDraftChoices: [],
    stats: {
      enemiesVaporized: 0,
      rocheCrushes: 0,
      polygonsEnclosed: 0,
      totalPolygonAreaPx2: 0,
      wormholeTransits: 0,
      skimsPerformed: 0,
      rewindsUsed: 0,
      supernovasUsed: 0,
      bumperRicochets: 0,
    },
    verdictId: null,
    log: [],
    events: [],
  };

  loadSectorOrPuzzle(state, startSector);
  return state;
}

export function loadSectorOrPuzzle(state: HorizonGameState, sectorNumber: number): void {
  const rng = new SeededRng(state.rngState ^ (sectorNumber * 0x9e3779b9));
  state.sector = sectorNumber;
  state.sectorLaunchesUsed = 0;
  state.projectiles = [];
  state.starMotes = [];
  state.activePolygons = [];
  state.activeEcho = null;
  state.ship.tetherTargetId = null;
  state.ship.tetherKind = null;
  state.ship.bounceChain = 0;
  state.ship.constellationVertices = [];
  state.ship.isAiming = false;

  if (state.mode === 'TRICKSHOT_DOJO') {
    const puzzleIndex = clamp(sectorNumber - 1, 0, TRICKSHOT_PUZZLES.length - 1);
    const puz = TRICKSHOT_PUZZLES[puzzleIndex];
    state.sectorTitle = puz.title;
    state.sectorSubtitle = puz.subtitle;
    state.sectorHint = puz.hint;
    state.parLaunches = puz.parLaunches;

    state.ship.x = puz.shipStartX;
    state.ship.y = puz.shipStartY;
    state.ship.vx = 0;
    state.ship.vy = 0;
    state.ship.aimAngleRad = (puz.recommendedAimDeg * Math.PI) / 180;
    state.ship.aimPowerPct = puz.recommendedPowerPct;

    state.wells = puz.wells.map((w) => ({
      ...w,
      pulsePhase: 0,
    }));
    state.bumpers = puz.bumpers.map((b) => ({
      ...b,
      hitFlashMs: 0,
      activatedInChain: false,
    }));
    state.enemies = puz.targets.map((t, idx) => makeEnemyFromBlueprint(t, idx, 1));
    state.worldlineHistory = [{ x: state.ship.x, y: state.ship.y, vx: 0, vy: 0 }];
    state.log.unshift(`Loaded ${puz.title} (Par: ${puz.parLaunches} Launch).`);
    state.rngState = rng.getState();
    return;
  }

  // ODYSSEY or ENDLESS_SINGULARITY
  const bpIndex = (sectorNumber - 1) % ODYSSEY_SECTORS.length;
  const bp = ODYSSEY_SECTORS[bpIndex];
  const waveScale =
    state.mode === 'ENDLESS_SINGULARITY'
      ? 1 + Math.min(sectorNumber - 1, HORIZON_CONFIG.ENDLESS_SPEED_CAP_WAVE) * 0.14
      : 1 + (sectorNumber - 1) * 0.08;

  state.sectorTitle =
    state.mode === 'ENDLESS_SINGULARITY'
      ? `Endless Wave ${sectorNumber} · ${bp.title.split('·')[1]?.trim() ?? bp.title}`
      : bp.title;
  state.sectorSubtitle = bp.subtitle;
  state.sectorHint = bp.loreBrief;
  state.parLaunches = null;

  state.ship.x = 155;
  state.ship.y = 300;
  state.ship.vx = 25;
  state.ship.vy = -140;
  state.ship.aimAngleRad = -0.35;
  state.ship.aimPowerPct = 0.88;

  state.wells = bp.wells.map((w) => ({
    ...w,
    pulsePhase: 0,
  }));
  state.bumpers = bp.bumpers.map((b) => ({
    ...b,
    hitFlashMs: 0,
    activatedInChain: false,
  }));
  state.enemies = bp.enemies.map((e, idx) => makeEnemyFromBlueprint(e, idx, waveScale));

  if (state.mode === 'ENDLESS_SINGULARITY' && sectorNumber > 1) {
    const extraCount = Math.min(4, Math.floor(sectorNumber / 2));
    for (let i = 0; i < extraCount; i++) {
      const angle = rng.nextFloat(0, Math.PI * 2);
      const dist = rng.nextFloat(150, 230);
      const ex = clamp(480 + Math.cos(angle) * dist, 120, 840);
      const ey = clamp(300 + Math.sin(angle) * dist, 100, 500);
      const kinds: EnemyKind[] = ['VOID_DRONE', 'PHASE_FRIGATE', 'ENTROPY_COMET', 'TESSERA_WARDEN'];
      const kind = rng.pick(kinds);
      state.enemies.push(makeEnemyFromBlueprint({ kind, x: ex, y: ey }, bp.enemies.length + i, waveScale));
    }
  }

  state.worldlineHistory = [
    { x: state.ship.x, y: state.ship.y, vx: state.ship.vx, vy: state.ship.vy },
  ];
  state.log.unshift(`Entered ${state.sectorTitle}.`);
  state.rngState = rng.getState();
}

export function cloneHorizonState(state: HorizonGameState): HorizonGameState {
  return JSON.parse(JSON.stringify(state)) as HorizonGameState;
}

export function hasRelic(state: HorizonGameState, relicId: AstroRelicId): boolean {
  return state.relics.includes(relicId);
}

export function computeRelicScoreMultiplier(state: HorizonGameState): number {
  let mult = 1.0;
  if (hasRelic(state, 'OMEGA_MONOLITH')) {
    mult *= Math.pow(1.35, state.relics.length);
  }
  return mult;
}

export function computeGravitationalAcceleration(
  x: number,
  y: number,
  wells: ReadonlyArray<HorizonGravityWell>
): { ax: number; ay: number; nearestWell: HorizonGravityWell | null; nearestDist: number } {
  let ax = 0;
  let ay = 0;
  let nearestWell: HorizonGravityWell | null = null;
  let nearestDist = Infinity;

  for (const well of wells) {
    const dx = well.x - x;
    const dy = well.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestWell = well;
    }
    const softDistSq = Math.max(dist * dist, (well.coreRadius + 16) * (well.coreRadius + 16));
    const accelMag = well.mass / softDistSq;
    if (dist > 1e-4) {
      ax += (dx / dist) * accelMag;
      ay += (dy / dist) * accelMag;
    }
  }

  return { ax, ay, nearestWell, nearestDist };
}

/**
 * Predicts the exact curved relativistic trajectory for the aiming HUD and AI Coach.
 */
export function predictShipTrajectory(
  state: HorizonGameState,
  angleRad: number = state.ship.aimAngleRad,
  powerPct: number = state.ship.aimPowerPct
): TrajectoryPoint[] {
  const chassis = SHIP_CHASSIS_CATALOG[state.ship.chassis];
  const bonusSteps =
    chassis.predictionStepsBonus + (hasRelic(state, 'CHRONO_HOURGLASS') ? 35 : 0);
  const totalSteps = HORIZON_CONFIG.PREDICTION_STEPS + bonusSteps;
  const dt = HORIZON_CONFIG.PREDICTION_STEP_DT;

  const speedMult = hasRelic(state, 'TACHYON_RAIL') ? 1.3 : 1.0;
  const speed =
    (HORIZON_CONFIG.MIN_SLINGSHOT_SPEED +
      (HORIZON_CONFIG.MAX_SLINGSHOT_SPEED - HORIZON_CONFIG.MIN_SLINGSHOT_SPEED) *
        clamp(powerPct, 0.15, 1.0)) *
    speedMult;

  let x = state.ship.x;
  let y = state.ship.y;
  let vx = Math.cos(angleRad) * speed;
  let vy = Math.sin(angleRad) * speed;
  let wormholeLock = 0;

  const points: TrajectoryPoint[] = [{ x, y }];

  for (let i = 0; i < totalSteps; i++) {
    const { ax, ay, nearestWell, nearestDist } = computeGravitationalAcceleration(
      x,
      y,
      state.wells
    );
    vx = (vx + ax * dt) * HORIZON_CONFIG.SPACE_DRAG;
    vy = (vy + ay * dt) * HORIZON_CONFIG.SPACE_DRAG;
    x += vx * dt;
    y += vy * dt;

    let hitBumperId: string | undefined;
    let skimWellId: string | undefined;

    if (nearestWell && nearestDist <= nearestWell.skimRadius) {
      skimWellId = nearestWell.id;
      if (
        nearestDist <= nearestWell.coreRadius + state.ship.radius &&
        nearestWell.pairedWellId &&
        wormholeLock <= 0
      ) {
        const exitWell = state.wells.find((w) => w.id === nearestWell.pairedWellId);
        if (exitWell) {
          const curSpeed = Math.hypot(vx, vy) * 1.65;
          const dirAngle = Math.atan2(vy, vx);
          x = exitWell.x + Math.cos(dirAngle) * (exitWell.coreRadius + state.ship.radius + 6);
          y = exitWell.y + Math.sin(dirAngle) * (exitWell.coreRadius + state.ship.radius + 6);
          vx = Math.cos(dirAngle) * Math.min(curSpeed, HORIZON_CONFIG.SPEED_OF_LIGHT_CAP);
          vy = Math.sin(dirAngle) * Math.min(curSpeed, HORIZON_CONFIG.SPEED_OF_LIGHT_CAP);
          wormholeLock = 15;
        }
      }
    }
    if (wormholeLock > 0) wormholeLock--;

    // Check bumper ricochets
    for (const bmp of state.bumpers) {
      const dx = x - bmp.x;
      const dy = y - bmp.y;
      const dist = Math.hypot(dx, dy);
      const minDist = state.ship.radius + bmp.radius;
      if (dist < minDist && dist > 1e-4) {
        const nx = dx / dist;
        const ny = dy / dist;
        x = bmp.x + nx * (minDist + 1);
        y = bmp.y + ny * (minDist + 1);
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
          const rest = bmp.restitution * chassis.bumperElasticityBonus;
          vx = (vx - 2 * dot * nx) * rest;
          vy = (vy - 2 * dot * ny) * rest;
        }
        hitBumperId = bmp.id;
        break;
      }
    }

    // Arena walls
    const minX = HORIZON_CONFIG.WALL_MARGIN + state.ship.radius;
    const maxX = HORIZON_CONFIG.ARENA_WIDTH - HORIZON_CONFIG.WALL_MARGIN - state.ship.radius;
    const minY = HORIZON_CONFIG.WALL_MARGIN + state.ship.radius;
    const maxY = HORIZON_CONFIG.ARENA_HEIGHT - HORIZON_CONFIG.WALL_MARGIN - state.ship.radius;

    if (x < minX) {
      x = minX;
      vx = Math.abs(vx) * HORIZON_CONFIG.WALL_RESTITUTION;
    } else if (x > maxX) {
      x = maxX;
      vx = -Math.abs(vx) * HORIZON_CONFIG.WALL_RESTITUTION;
    }
    if (y < minY) {
      y = minY;
      vy = Math.abs(vy) * HORIZON_CONFIG.WALL_RESTITUTION;
    } else if (y > maxY) {
      y = maxY;
      vy = -Math.abs(vy) * HORIZON_CONFIG.WALL_RESTITUTION;
    }

    points.push({ x, y, hitBumperId, skimWellId });
  }

  return points;
}

/**
 * Evaluates 36 candidate launch angles to find the highest-value trickshot vector.
 */
export function computeOptimalLaunchVector(state: HorizonGameState): {
  angleRad: number;
  powerPct: number;
  expectedHits: number;
} {
  if (state.mode === 'TRICKSHOT_DOJO') {
    const puzIndex = clamp(state.sector - 1, 0, TRICKSHOT_PUZZLES.length - 1);
    const puz = TRICKSHOT_PUZZLES[puzIndex];
    if (state.sectorLaunchesUsed === 0) {
      return {
        angleRad: (puz.recommendedAimDeg * Math.PI) / 180,
        powerPct: puz.recommendedPowerPct,
        expectedHits: puz.targets.length + 3,
      };
    }
  }

  let bestAngle = state.ship.aimAngleRad;
  let bestPower = 0.92;
  let bestScore = -Infinity;

  for (let i = 0; i < 36; i++) {
    const angle = -Math.PI + (i * Math.PI * 2) / 36;
    const power = 0.92;
    const path = predictShipTrajectory(state, angle, power);
    const uniqueBumpers = new Set<string>();
    const hitEnemies = new Set<string>();
    let skimSteps = 0;

    for (const pt of path) {
      if (pt.hitBumperId) uniqueBumpers.add(pt.hitBumperId);
      if (pt.skimWellId) skimSteps += 1;
      for (const enemy of state.enemies) {
        if (Math.hypot(pt.x - enemy.x, pt.y - enemy.y) <= enemy.radius + state.ship.radius + 10) {
          hitEnemies.add(enemy.id);
        }
      }
    }

    const polygonBonus = uniqueBumpers.size >= 3 ? 450 : 0;
    const candidateScore =
      hitEnemies.size * 180 + uniqueBumpers.size * 110 + polygonBonus + Math.min(skimSteps, 20) * 4;

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestAngle = angle;
      bestPower = power;
    }
  }

  return {
    angleRad: bestAngle,
    powerPct: bestPower,
    expectedHits: Math.max(1, Math.round(bestScore / 150)),
  };
}

function awardEnemyKill(
  state: HorizonGameState,
  enemy: HorizonEnemy,
  cause: 'RAM' | 'CONSTELLATION' | 'ROCHE' | 'SUPERNOVA' | 'TETHER' | 'PHOTON_LANCE'
): void {
  state.stats.enemiesVaporized += 1;
  const relicMult = computeRelicScoreMultiplier(state);
  const baseBounty =
    enemy.kind === 'KARDASHEV_BOSS'
      ? 1500
      : enemy.kind === 'TESSERA_WARDEN'
        ? 260
        : enemy.kind === 'PHASE_FRIGATE'
          ? 180
          : 120;
  const points = Math.round(baseBounty * state.ship.lorentzGamma * relicMult);
  state.score += points;

  state.events.push({
    type: 'ENEMY_DESTROYED',
    x: enemy.x,
    y: enemy.y,
    text: `${cause} +${points}`,
    color: cause === 'CONSTELLATION' ? '#38bdf8' : cause === 'ROCHE' ? '#10b981' : '#fbbf24',
    magnitude: enemy.kind === 'KARDASHEV_BOSS' ? 3 : 1.4,
  });

  // Drop collectible Star Motes
  state.starMotes.push({
    id: `mote-${state.tick}-${enemy.id}`,
    kind: enemy.kind === 'TESSERA_WARDEN' ? 'CHRONO_SHARD' : 'STARDUST',
    x: enemy.x,
    y: enemy.y,
    vx: (enemy.x - 480) * 0.15,
    vy: (enemy.y - 300) * 0.15,
    value: 75,
    ttlMs: 9000,
  });
}

function triggerSupernovaPulse(state: HorizonGameState, freeAutoNova: boolean = false): void {
  const chassis = SHIP_CHASSIS_CATALOG[state.ship.chassis];
  if (!freeAutoNova) {
    if (
      state.ship.hawkingEnergy < HORIZON_CONFIG.SUPERNOVA_ENERGY_COST ||
      state.ship.supernovaCooldownMs > 0
    ) {
      return;
    }
    state.ship.hawkingEnergy = Math.max(
      0,
      state.ship.hawkingEnergy - HORIZON_CONFIG.SUPERNOVA_ENERGY_COST
    );
    state.ship.supernovaCooldownMs = HORIZON_CONFIG.SUPERNOVA_COOLDOWN_MS;
    state.stats.supernovasUsed += 1;
  }

  const relicRadiusMult = hasRelic(state, 'SUPERNOVA_CORE') ? 1.5 : 1.0;
  const radius =
    HORIZON_CONFIG.SUPERNOVA_BASE_RADIUS * chassis.supernovaRadiusMult * relicRadiusMult;
  const damage = Math.round(HORIZON_CONFIG.SUPERNOVA_DAMAGE * state.ship.lorentzGamma);

  // Clear enemy projectiles inside shockwave
  state.projectiles = state.projectiles.filter((p) => {
    if (p.friendly) return true;
    const d = Math.hypot(p.x - state.ship.x, p.y - state.ship.y);
    return d > radius;
  });

  // Damage and knock back enemies (potentially into a Gravity Well for Roche Crush!)
  for (const enemy of state.enemies) {
    const dx = enemy.x - state.ship.x;
    const dy = enemy.y - state.ship.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= radius + enemy.radius) {
      enemy.shielded = false;
      enemy.hp -= damage;
      enemy.hitFlashMs = 220;
      const nx = dist > 1e-3 ? dx / dist : 1;
      const ny = dist > 1e-3 ? dy / dist : 0;
      enemy.vx += nx * HORIZON_CONFIG.SUPERNOVA_KNOCKBACK;
      enemy.vy += ny * HORIZON_CONFIG.SUPERNOVA_KNOCKBACK;
    }
  }

  const remaining: HorizonEnemy[] = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      awardEnemyKill(state, enemy, 'SUPERNOVA');
    } else {
      remaining.push(enemy);
    }
  }
  state.enemies = remaining;

  state.events.push({
    type: 'SUPERNOVA_PULSE',
    x: state.ship.x,
    y: state.ship.y,
    text: freeAutoNova ? 'AUTO-SUPERNOVA!' : 'SUPERNOVA SHOCKWAVE!',
    color: '#f97316',
    magnitude: radius,
  });
  state.log.unshift(
    `${freeAutoNova ? 'Chandrasekhar Auto-Nova' : 'Supernova Shockwave'} erupted (${Math.round(radius)}px radius).`
  );
}

function evaluateConstellationEnclosure(state: HorizonGameState): void {
  const verts = state.ship.constellationVertices;
  if (verts.length < HORIZON_CONFIG.MIN_CONSTELLATION_VERTICES) return;

  // Use the last 3 unique vertices to form a tight Constellation Triangle (or full polygon)
  const polyVerts = verts.slice(-Math.min(verts.length, 4)).map((v) => ({ x: v.x, y: v.y }));
  const area = computePolygonAreaShoelace(polyVerts);
  if (area < 1200) return;

  state.stats.polygonsEnclosed += 1;
  state.stats.totalPolygonAreaPx2 += Math.round(area);

  const hasKepler = hasRelic(state, 'KEPLER_SCYTHE');
  if (hasKepler) {
    state.ship.lorentzGamma = clamp(
      Number((state.ship.lorentzGamma + 1.5).toFixed(2)),
      1.0,
      8.0
    );
    state.ship.peakLorentzGamma = Math.max(state.ship.peakLorentzGamma, state.ship.lorentzGamma);
  }

  const damageMult = (hasKepler ? 1.65 : 1.0) * state.ship.lorentzGamma;
  const laserDamage = Math.round(HORIZON_CONFIG.CONSTELLATION_BASE_DAMAGE * damageMult);

  let enemiesHit = 0;
  for (const enemy of state.enemies) {
    const inside = isPointInPolygon(enemy.x, enemy.y, polyVerts);
    let nearEdge = false;
    for (let i = 0; i < polyVerts.length; i++) {
      const a = polyVerts[i];
      const b = polyVerts[(i + 1) % polyVerts.length];
      if (pointToSegmentDistance(enemy.x, enemy.y, a.x, a.y, b.x, b.y) <= enemy.radius + 46) {
        nearEdge = true;
        break;
      }
    }

    if (inside || nearEdge) {
      enemy.shielded = false;
      enemy.hp -= laserDamage;
      enemy.hitFlashMs = 280;
      enemiesHit += 1;
    }
  }

  const remaining: HorizonEnemy[] = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      awardEnemyKill(state, enemy, 'CONSTELLATION');
    } else {
      remaining.push(enemy);
    }
  }
  state.enemies = remaining;

  const relicMult = computeRelicScoreMultiplier(state);
  const areaBonus = Math.round(
    (area * HORIZON_CONFIG.CONSTELLATION_AREA_SCORE_FACTOR + enemiesHit * 180) *
      state.ship.lorentzGamma *
      relicMult
  );
  state.score += areaBonus;

  const cx = polyVerts.reduce((acc, v) => acc + v.x, 0) / polyVerts.length;
  const cy = polyVerts.reduce((acc, v) => acc + v.y, 0) / polyVerts.length;

  state.activePolygons.push({
    id: `poly-${state.tick}-${state.stats.polygonsEnclosed}`,
    vertices: polyVerts,
    areaPx2: Math.round(area),
    enemiesHit,
    scoreAwarded: areaBonus,
    ttlMs: HORIZON_CONFIG.CONSTELLATION_FLASH_DURATION_MS,
    maxTtlMs: HORIZON_CONFIG.CONSTELLATION_FLASH_DURATION_MS,
  });

  state.events.push({
    type: 'CONSTELLATION_ENCLOSED',
    x: cx,
    y: cy,
    text: `📐 CONSTELLATION ENCLOSED! +${areaBonus}`,
    color: '#38bdf8',
    magnitude: 2.2,
  });
  state.log.unshift(
    `Enclosed Constellation Polygon (${Math.round(area).toLocaleString()} px², ${enemiesHit} targets struck, +${areaBonus} pts)!`
  );

  // Keep only the latest vertex so the next 2 bounces form a fresh triangle!
  const lastVertex = verts[verts.length - 1];
  state.ship.constellationVertices = lastVertex ? [lastVertex] : [];
  for (const bmp of state.bumpers) {
    bmp.activatedInChain = bmp.id === lastVertex?.id;
  }
}

export function applyHorizonInput(state: HorizonGameState, action: HorizonInputAction): void {
  if (action.type === 'TOGGLE_PAUSE') {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING';
    }
    return;
  }

  if (action.type === 'SELECT_CHASSIS') {
    const spec = SHIP_CHASSIS_CATALOG[action.chassis];
    state.ship.chassis = action.chassis;
    state.ship.maxHull = spec.maxHull;
    state.ship.hull = spec.maxHull;
    state.log.unshift(`Selected Ship Chassis: ${spec.name}.`);
    return;
  }

  if (action.type === 'SELECT_MODE') {
    const fresh = createInitialHorizonState(state.seed, {
      mode: action.mode,
      chassis: state.ship.chassis,
      startSector: action.sectorOrPuzzle ?? 1,
    });
    Object.assign(state, fresh);
    return;
  }

  if (action.type === 'SELECT_RELIC') {
    if (state.status !== 'RELIC_DRAFT') return;
    if (!state.relics.includes(action.relicId)) {
      state.relics.push(action.relicId);
    }
    if (action.relicId === 'CHRONO_HOURGLASS') {
      state.ship.maxChronoCharges += 1;
      state.ship.chronoCharges = Math.min(
        state.ship.maxChronoCharges,
        state.ship.chronoCharges + 1
      );
    }
    const spec = ASTRO_RELIC_CATALOG.find((r) => r.id === action.relicId);
    state.events.push({
      type: 'RELIC_DRAFTED',
      x: state.ship.x,
      y: state.ship.y,
      text: `RELIC: ${spec?.name ?? action.relicId}`,
      color: spec?.color ?? '#38bdf8',
    });
    state.log.unshift(`Drafted Astro-Relic: ${spec?.name ?? action.relicId}.`);
    state.relicDraftChoices = [];
    state.status = 'PLAYING';
    loadSectorOrPuzzle(state, state.sector + 1);
    return;
  }

  if (state.status !== 'PLAYING') return;

  switch (action.type) {
    case 'BEGIN_AIM': {
      state.ship.isAiming = true;
      if (typeof action.angleRad === 'number') state.ship.aimAngleRad = action.angleRad;
      if (typeof action.powerPct === 'number') {
        state.ship.aimPowerPct = clamp(action.powerPct, 0.15, 1.0);
      }
      break;
    }

    case 'UPDATE_AIM': {
      state.ship.isAiming = true;
      state.ship.aimAngleRad = action.angleRad;
      state.ship.aimPowerPct = clamp(action.powerPct, 0.15, 1.0);
      break;
    }

    case 'CANCEL_AIM': {
      state.ship.isAiming = false;
      break;
    }

    case 'LAUNCH_SLINGSHOT': {
      const angle = action.angleRad ?? state.ship.aimAngleRad;
      const power = clamp(action.powerPct ?? state.ship.aimPowerPct, 0.15, 1.0);
      const speedMult = hasRelic(state, 'TACHYON_RAIL') ? 1.3 : 1.0;
      const launchSpeed =
        (HORIZON_CONFIG.MIN_SLINGSHOT_SPEED +
          (HORIZON_CONFIG.MAX_SLINGSHOT_SPEED - HORIZON_CONFIG.MIN_SLINGSHOT_SPEED) * power) *
        speedMult;

      state.ship.vx = Math.cos(angle) * launchSpeed;
      state.ship.vy = Math.sin(angle) * launchSpeed;
      state.ship.isAiming = false;
      state.ship.tetherTargetId = null;
      state.ship.tetherKind = null;
      state.ship.bounceChain = 0;
      state.ship.constellationVertices = [];
      for (const bmp of state.bumpers) {
        bmp.activatedInChain = false;
      }

      state.launchesUsed += 1;
      state.sectorLaunchesUsed += 1;
      state.events.push({
        type: 'SLINGSHOT_LAUNCH',
        x: state.ship.x,
        y: state.ship.y,
        text: `LAUNCH ${Math.round(launchSpeed)} u/s`,
        color: '#38bdf8',
      });
      break;
    }

    case 'NUDGE_THRUST': {
      const mag = Math.hypot(action.dx, action.dy);
      if (mag > 1e-4) {
        const nx = action.dx / mag;
        const ny = action.dy / mag;
        state.ship.vx += nx * 42;
        state.ship.vy += ny * 42;
        const spd = Math.hypot(state.ship.vx, state.ship.vy);
        if (spd > HORIZON_CONFIG.SPEED_OF_LIGHT_CAP) {
          state.ship.vx = (state.ship.vx / spd) * HORIZON_CONFIG.SPEED_OF_LIGHT_CAP;
          state.ship.vy = (state.ship.vy / spd) * HORIZON_CONFIG.SPEED_OF_LIGHT_CAP;
        }
      }
      break;
    }

    case 'TOGGLE_TETHER': {
      if (state.ship.tetherTargetId) {
        state.ship.tetherTargetId = null;
        state.ship.tetherKind = null;
        break;
      }
      const chassis = SHIP_CHASSIS_CATALOG[state.ship.chassis];
      const maxRange = HORIZON_CONFIG.TETHER_MAX_RANGE * chassis.tetherRangeMult;
      let bestId: string | null = null;
      let bestKind: 'WELL' | 'BUMPER' | null = null;
      let bestDist = maxRange;

      for (const well of state.wells) {
        const d = Math.hypot(well.x - state.ship.x, well.y - state.ship.y);
        if (d <= bestDist) {
          bestDist = d;
          bestId = well.id;
          bestKind = 'WELL';
        }
      }
      for (const bmp of state.bumpers) {
        const d = Math.hypot(bmp.x - state.ship.x, bmp.y - state.ship.y);
        if (d <= bestDist) {
          bestDist = d;
          bestId = bmp.id;
          bestKind = 'BUMPER';
        }
      }

      if (bestId && bestKind) {
        state.ship.tetherTargetId = bestId;
        state.ship.tetherKind = bestKind;
        state.ship.isAiming = false;
      }
      break;
    }

    case 'TRIGGER_SUPERNOVA': {
      triggerSupernovaPulse(state, false);
      break;
    }

    case 'TRIGGER_REWIND': {
      if (state.worldlineHistory.length < 6) break;
      const canUseCharge = state.ship.chronoCharges > 0;
      const canUseEnergy = state.ship.hawkingEnergy >= HORIZON_CONFIG.REWIND_ENERGY_COST;
      if (!canUseCharge && !canUseEnergy) break;

      if (canUseCharge) {
        state.ship.chronoCharges -= 1;
      } else {
        state.ship.hawkingEnergy -= HORIZON_CONFIG.REWIND_ENERGY_COST;
      }

      if (hasRelic(state, 'SCHRODINGER_ECHO')) {
        state.ship.hawkingEnergy = Math.min(
          state.ship.maxHawkingEnergy,
          state.ship.hawkingEnergy + 15
        );
      }

      const recordedFrames = [...state.worldlineHistory];
      const originFrame = recordedFrames[0];

      // Spawn the Phantom Worldline Echo at the rewind origin to replay the prior path!
      state.activeEcho = {
        active: true,
        frames: recordedFrames,
        frameIndex: 0,
        x: originFrame.x,
        y: originFrame.y,
        vx: originFrame.vx,
        vy: originFrame.vy,
        radius: HORIZON_CONFIG.ECHO_RADIUS,
      };

      // Rewind the live ship to the origin frame with preserved boost
      state.ship.x = originFrame.x;
      state.ship.y = originFrame.y;
      state.ship.vx = originFrame.vx;
      state.ship.vy = originFrame.vy;
      state.ship.invulnerableMs = Math.max(state.ship.invulnerableMs, 900);
      state.stats.rewindsUsed += 1;

      state.events.push({
        type: 'CHRONO_REWIND',
        x: state.ship.x,
        y: state.ship.y,
        text: '⏳ WORLDLINE REWIND + PHANTOM ECHO!',
        color: '#a855f7',
        magnitude: 2.0,
      });
      state.log.unshift('Rewound 2.0s along spacetime worldline & spawned Phantom Echo Twin!');
      break;
    }

    case 'TRIGGER_AI_COACH': {
      const opt = computeOptimalLaunchVector(state);
      state.ship.aimAngleRad = opt.angleRad;
      state.ship.aimPowerPct = opt.powerPct;
      applyHorizonInput(state, {
        type: 'LAUNCH_SLINGSHOT',
        angleRad: opt.angleRad,
        powerPct: opt.powerPct,
      });
      state.log.unshift(
        `AI Trickshot Coach executed optimal vector (${Math.round((opt.angleRad * 180) / Math.PI)}°, ${Math.round(opt.powerPct * 100)}% power).`
      );
      break;
    }
  }
}

function openRelicDraftOrAdvance(state: HorizonGameState): void {
  const rng = new SeededRng(state.rngState ^ (state.tick * 0x45d9f3b));

  if (state.mode === 'TRICKSHOT_DOJO') {
    if (state.sector >= TRICKSHOT_PUZZLES.length) {
      state.status = 'VICTORY';
      state.verdictId = 'SACRED_GEOMETER';
      state.events.push({
        type: 'VICTORY',
        x: state.ship.x,
        y: state.ship.y,
        text: 'DOJO GRANDMASTER VICTORY!',
        color: '#38bdf8',
      });
      state.log.unshift('Completed all 5 Constellation Trickshot Dojo puzzles!');
    } else {
      loadSectorOrPuzzle(state, state.sector + 1);
    }
    state.rngState = rng.getState();
    return;
  }

  if (state.mode === 'ODYSSEY' && state.sector >= HORIZON_CONFIG.TOTAL_CAMPAIGN_SECTORS) {
    state.status = 'VICTORY';
    state.verdictId = determineHorizonVerdict(state);
    state.events.push({
      type: 'VICTORY',
      x: state.ship.x,
      y: state.ship.y,
      text: '👑 KARDASHEV-IX DEFEATED · ODYSSEY VICTORY!',
      color: '#fde047',
      magnitude: 3.5,
    });
    state.log.unshift('Shattered KARDASHEV-IX and conquered the Event Horizon Odyssey!');
    state.rngState = rng.getState();
    return;
  }

  // Offer 3 Astro-Relics not yet owned (or fallback to any if all owned)
  const unowned = ASTRO_RELIC_CATALOG.filter((r) => !state.relics.includes(r.id)).map(
    (r) => r.id
  );
  const pool = unowned.length >= 3 ? unowned : ASTRO_RELIC_CATALOG.map((r) => r.id);
  state.relicDraftChoices = rng.shuffle(pool).slice(0, 3);
  state.status = 'RELIC_DRAFT';
  state.events.push({
    type: 'SECTOR_CLEARED',
    x: state.ship.x,
    y: state.ship.y,
    text: `SECTOR ${state.sector} CLEARED! CHOOSE AN ASTRO-RELIC`,
    color: '#10b981',
  });
  state.rngState = rng.getState();
}

export function determineHorizonVerdict(state: HorizonGameState): string {
  if (state.status === 'GAME_OVER') {
    return 'ENTROPIC_DRIFT';
  }
  if (state.stats.polygonsEnclosed >= 4) {
    return 'SACRED_GEOMETER';
  }
  if (state.ship.peakLorentzGamma >= 3.8 || state.stats.skimsPerformed >= 20) {
    return 'HORIZON_DAREDEVIL';
  }
  if (state.stats.rewindsUsed >= 2) {
    return 'WORLDLINE_WEAVER';
  }
  return 'KARDASHEV_SOVEREIGN';
}

export function stepHorizonState(
  state: HorizonGameState,
  dtMs: number = HORIZON_CONFIG.FIXED_STEP_MS
): void {
  if (state.status !== 'PLAYING') return;

  const timeScale = state.ship.isAiming ? HORIZON_CONFIG.BULLET_TIME_SCALE : 1.0;
  const effDtMs = dtMs * timeScale;
  const dtSec = effDtMs / 1000;

  state.tick += 1;
  state.elapsedMs += effDtMs;

  const chassis = SHIP_CHASSIS_CATALOG[state.ship.chassis];

  // Cooldowns
  state.ship.invulnerableMs = Math.max(0, state.ship.invulnerableMs - effDtMs);
  state.ship.wormholeCooldownMs = Math.max(0, state.ship.wormholeCooldownMs - effDtMs);
  state.ship.supernovaCooldownMs = Math.max(0, state.ship.supernovaCooldownMs - effDtMs);
  state.ship.skimSoundCooldownMs = Math.max(0, state.ship.skimSoundCooldownMs - dtMs);

  // Energy management during Bullet-Time vs normal flight
  if (state.ship.isAiming) {
    if (!hasRelic(state, 'CHRONO_HOURGLASS')) {
      state.ship.hawkingEnergy = Math.max(
        0,
        state.ship.hawkingEnergy - HORIZON_CONFIG.AIM_ENERGY_DRAIN_PER_SEC * (dtMs / 1000)
      );
      if (state.ship.hawkingEnergy <= 0) {
        state.ship.isAiming = false;
      }
    }
  } else {
    state.ship.hawkingEnergy = Math.min(
      state.ship.maxHawkingEnergy,
      state.ship.hawkingEnergy + HORIZON_CONFIG.PASSIVE_ENERGY_REGEN_PER_SEC * dtSec
    );
  }

  // Update orbiting bumpers & wells
  for (const well of state.wells) {
    well.pulsePhase += dtSec * 2.4;
    if (
      well.orbitCenterX !== undefined &&
      well.orbitCenterY !== undefined &&
      well.orbitRadius !== undefined &&
      well.orbitAngularSpeed !== undefined
    ) {
      well.orbitPhase = (well.orbitPhase ?? 0) + well.orbitAngularSpeed * dtSec;
      well.x = well.orbitCenterX + Math.cos(well.orbitPhase) * well.orbitRadius;
      well.y = well.orbitCenterY + Math.sin(well.orbitPhase) * well.orbitRadius;
    }
  }

  for (const bmp of state.bumpers) {
    bmp.hitFlashMs = Math.max(0, bmp.hitFlashMs - dtMs);
    if (
      bmp.orbitCenterX !== undefined &&
      bmp.orbitCenterY !== undefined &&
      bmp.orbitRadius !== undefined &&
      bmp.orbitAngularSpeed !== undefined
    ) {
      bmp.orbitPhase = (bmp.orbitPhase ?? 0) + bmp.orbitAngularSpeed * dtSec;
      bmp.x = bmp.orbitCenterX + Math.cos(bmp.orbitPhase) * bmp.orbitRadius;
      bmp.y = bmp.orbitCenterY + Math.sin(bmp.orbitPhase) * bmp.orbitRadius;
    }
  }

  // Record spacetime worldline sample
  state.worldlineHistory.push({
    x: state.ship.x,
    y: state.ship.y,
    vx: state.ship.vx,
    vy: state.ship.vy,
  });
  if (state.worldlineHistory.length > HORIZON_CONFIG.WORLDLINE_BUFFER_TICKS) {
    state.worldlineHistory.shift();
  }

  // Step Phantom Worldline Echo if active
  if (state.activeEcho && state.activeEcho.active) {
    const echo = state.activeEcho;
    if (echo.frameIndex < echo.frames.length) {
      const sample = echo.frames[echo.frameIndex];
      echo.x = sample.x;
      echo.y = sample.y;
      echo.vx = sample.vx;
      echo.vy = sample.vy;
      echo.frameIndex += 1;

      const echoDmgMult =
        HORIZON_CONFIG.ECHO_DAMAGE_MULT *
        (hasRelic(state, 'SCHRODINGER_ECHO') ? 1.8 : 1.0) *
        (state.ship.chassis === 'PHOTON_WISP' ? 1.25 : 1.0);

      for (const enemy of state.enemies) {
        const d = Math.hypot(enemy.x - echo.x, enemy.y - echo.y);
        if (d <= enemy.radius + echo.radius && enemy.hitFlashMs <= 0) {
          enemy.shielded = false;
          enemy.hp -= Math.round(38 * echoDmgMult);
          enemy.hitFlashMs = 150;
        }
      }
    } else {
      state.activeEcho = null;
    }
  }

  // Gravitational acceleration on ship
  const { ax, ay, nearestWell, nearestDist } = computeGravitationalAcceleration(
    state.ship.x,
    state.ship.y,
    state.wells
  );

  // If in Trickshot Dojo before first launch, keep ship stationary on tee!
  const isDojoTee = state.mode === 'TRICKSHOT_DOJO' && state.sectorLaunchesUsed === 0;
  if (!isDojoTee) {
    state.ship.vx += (ax / chassis.mass) * dtSec;
    state.ship.vy += (ay / chassis.mass) * dtSec;
  }

  // Quantum Tether physics ([Q])
  if (state.ship.tetherTargetId) {
    const anchor =
      state.wells.find((w) => w.id === state.ship.tetherTargetId) ??
      state.bumpers.find((b) => b.id === state.ship.tetherTargetId);
    if (anchor) {
      const dx = anchor.x - state.ship.x;
      const dy = anchor.y - state.ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1e-3) {
        const nx = dx / dist;
        const ny = dy / dist;
        // Determine tangent direction aligned with current velocity
        const tx1 = -ny;
        const ty1 = nx;
        const dot = state.ship.vx * tx1 + state.ship.vy * ty1;
        const sign = dot >= 0 ? 1 : -1;
        const tx = tx1 * sign;
        const ty = ty1 * sign;

        state.ship.vx +=
          (nx * HORIZON_CONFIG.TETHER_CENTRIPETAL_BOOST +
            tx * HORIZON_CONFIG.TETHER_TANGENTIAL_ACCEL) *
          dtSec;
        state.ship.vy +=
          (ny * HORIZON_CONFIG.TETHER_CENTRIPETAL_BOOST +
            ty * HORIZON_CONFIG.TETHER_TANGENTIAL_ACCEL) *
          dtSec;

        // Slice enemies intersecting the tether beam!
        const tetherDps =
          HORIZON_CONFIG.TETHER_BEAM_DPS * (hasRelic(state, 'DYSON_HARMONIC') ? 1.85 : 1.0);
        for (const enemy of state.enemies) {
          const beamDist = pointToSegmentDistance(
            enemy.x,
            enemy.y,
            state.ship.x,
            state.ship.y,
            anchor.x,
            anchor.y
          );
          if (beamDist <= enemy.radius + 8) {
            enemy.shielded = false;
            enemy.hp -= tetherDps * dtSec;
            enemy.hitFlashMs = Math.max(enemy.hitFlashMs, 90);
          }
        }
      }
    } else {
      state.ship.tetherTargetId = null;
      state.ship.tetherKind = null;
    }
  }

  // Clamp relativistic speed & update Lorentz Gamma
  state.ship.vx *= Math.pow(HORIZON_CONFIG.SPACE_DRAG, timeScale);
  state.ship.vy *= Math.pow(HORIZON_CONFIG.SPACE_DRAG, timeScale);
  const speed = Math.hypot(state.ship.vx, state.ship.vy);
  if (speed > HORIZON_CONFIG.SPEED_OF_LIGHT_CAP) {
    state.ship.vx = (state.ship.vx / speed) * HORIZON_CONFIG.SPEED_OF_LIGHT_CAP;
    state.ship.vy = (state.ship.vy / speed) * HORIZON_CONFIG.SPEED_OF_LIGHT_CAP;
  }

  state.ship.lorentzGamma = computeLorentzGamma(
    Math.hypot(state.ship.vx, state.ship.vy),
    state.ship.bounceChain,
    hasRelic(state, 'NOETHER_DYNAMO')
  );
  state.ship.peakLorentzGamma = Math.max(state.ship.peakLorentzGamma, state.ship.lorentzGamma);

  // Move ship
  if (!isDojoTee) {
    state.ship.x += state.ship.vx * dtSec;
    state.ship.y += state.ship.vy * dtSec;
  }

  // Check Event Horizon Skim & Wormhole / Core interaction
  if (nearestWell && !isDojoTee) {
    if (
      nearestDist <= nearestWell.skimRadius &&
      nearestDist > nearestWell.coreRadius + state.ship.radius
    ) {
      state.ship.hawkingEnergy = Math.min(
        state.ship.maxHawkingEnergy,
        state.ship.hawkingEnergy + HORIZON_CONFIG.SKIM_ENERGY_GAIN_PER_SEC * dtSec
      );
      state.score += Math.round(HORIZON_CONFIG.SKIM_SCORE_PER_TICK * state.ship.lorentzGamma);

      if (state.ship.skimSoundCooldownMs <= 0) {
        state.ship.skimSoundCooldownMs = 380;
        state.stats.skimsPerformed += 1;
        state.events.push({
          type: 'EVENT_HORIZON_SKIM',
          x: state.ship.x,
          y: state.ship.y,
          text: `PHOTON SKIM γ=${state.ship.lorentzGamma.toFixed(1)}x`,
          color: '#fbbf24',
        });

        // Hawking Radiation Prism relic fires 3 homing Photon Lances!
        if (hasRelic(state, 'HAWKING_PRISM') && state.enemies.length > 0) {
          for (let k = 0; k < Math.min(3, state.enemies.length); k++) {
            const target = state.enemies[k % state.enemies.length];
            const ang = Math.atan2(target.y - state.ship.y, target.x - state.ship.x);
            state.projectiles.push({
              id: `lance-${state.tick}-${k}`,
              friendly: true,
              x: state.ship.x,
              y: state.ship.y,
              vx: Math.cos(ang) * 460,
              vy: Math.sin(ang) * 460,
              radius: 6,
              damage: 30,
              ttlMs: 2200,
              color: '#f472b6',
            });
          }
        }
      }
    }

    // Core collision: Wormhole Transit OR Slingshot Ejection
    if (nearestDist <= nearestWell.coreRadius + state.ship.radius) {
      if (nearestWell.pairedWellId && state.ship.wormholeCooldownMs <= 0) {
        const exitWell = state.wells.find((w) => w.id === nearestWell.pairedWellId);
        if (exitWell) {
          const curSpeed = Math.max(320, Math.hypot(state.ship.vx, state.ship.vy)) * 1.65;
          const ang = Math.atan2(state.ship.vy, state.ship.vx);
          state.ship.x =
            exitWell.x + Math.cos(ang) * (exitWell.coreRadius + state.ship.radius + 8);
          state.ship.y =
            exitWell.y + Math.sin(ang) * (exitWell.coreRadius + state.ship.radius + 8);
          state.ship.vx = Math.cos(ang) * Math.min(curSpeed, HORIZON_CONFIG.SPEED_OF_LIGHT_CAP);
          state.ship.vy = Math.sin(ang) * Math.min(curSpeed, HORIZON_CONFIG.SPEED_OF_LIGHT_CAP);
          state.ship.wormholeCooldownMs = 650;
          state.ship.hawkingEnergy = Math.min(
            state.ship.maxHawkingEnergy,
            state.ship.hawkingEnergy + 25
          );
          state.stats.wormholeTransits += 1;

          state.events.push({
            type: 'WORMHOLE_TRANSIT',
            x: state.ship.x,
            y: state.ship.y,
            text: '🌀 WORMHOLE CANNON 1.65x!',
            color: '#ec4899',
            magnitude: 2.2,
          });
          state.log.unshift(`Transited Wormhole into ${exitWell.name} at 1.65x velocity!`);
        }
      } else if (state.ship.wormholeCooldownMs <= 0) {
        // Eject radially + tangentially from core
        const dx = state.ship.x - nearestWell.x;
        const dy = state.ship.y - nearestWell.y;
        const d = Math.hypot(dx, dy) || 1;
        const nx = dx / d;
        const ny = dy / d;
        state.ship.x = nearestWell.x + nx * (nearestWell.coreRadius + state.ship.radius + 6);
        state.ship.y = nearestWell.y + ny * (nearestWell.coreRadius + state.ship.radius + 6);
        state.ship.vx = (nx * 320 - ny * 220);
        state.ship.vy = (ny * 320 + nx * 220);

        const aegisProtected =
          hasRelic(state, 'LORENTZ_AEGIS') && state.ship.lorentzGamma >= 2.0;
        if (
          state.ship.invulnerableMs <= 0 &&
          !aegisProtected &&
          state.mode !== 'TRICKSHOT_DOJO' &&
          nearestWell.kind !== 'WHITE_HOLE'
        ) {
          state.ship.hull -= 1;
          state.ship.invulnerableMs = 1100;
          state.events.push({
            type: 'SHIP_DAMAGED',
            x: state.ship.x,
            y: state.ship.y,
            text: 'HORIZON SHEAR -1 HULL',
            color: '#ef4444',
          });
        }
      }
    }
  }

  // Bumper collisions & Constellation vertex logging
  for (const bmp of state.bumpers) {
    const dx = state.ship.x - bmp.x;
    const dy = state.ship.y - bmp.y;
    const dist = Math.hypot(dx, dy);
    const minDist = state.ship.radius + bmp.radius;
    if (dist < minDist && dist > 1e-4) {
      const nx = dx / dist;
      const ny = dy / dist;
      state.ship.x = bmp.x + nx * (minDist + 1);
      state.ship.y = bmp.y + ny * (minDist + 1);

      const dot = state.ship.vx * nx + state.ship.vy * ny;
      if (dot < 0) {
        const rest = bmp.restitution * chassis.bumperElasticityBonus;
        state.ship.vx = (state.ship.vx - 2 * dot * nx) * rest;
        state.ship.vy = (state.ship.vy - 2 * dot * ny) * rest;
        // Ensure minimum lively ricochet speed
        const newSpd = Math.hypot(state.ship.vx, state.ship.vy);
        if (newSpd < 290) {
          state.ship.vx = (state.ship.vx / (newSpd || 1)) * 290;
          state.ship.vy = (state.ship.vy / (newSpd || 1)) * 290;
        }
      }

      bmp.hitFlashMs = 320;
      bmp.activatedInChain = true;
      state.ship.bounceChain += 1;
      state.stats.bumperRicochets += 1;

      const energyGain =
        HORIZON_CONFIG.BUMPER_ENERGY_GAIN + (hasRelic(state, 'NOETHER_DYNAMO') ? 10 : 0);
      state.ship.hawkingEnergy = Math.min(
        state.ship.maxHawkingEnergy,
        state.ship.hawkingEnergy + energyGain
      );

      if (bmp.kind === 'CHRONO_CRYSTAL') {
        state.ship.chronoCharges = Math.min(
          state.ship.maxChronoCharges,
          state.ship.chronoCharges + 1
        );
      }

      const relicMult = computeRelicScoreMultiplier(state);
      const bounceScore = Math.round(
        HORIZON_CONFIG.BASE_BUMPER_SCORE *
          state.ship.bounceChain *
          state.ship.lorentzGamma *
          relicMult
      );
      state.score += bounceScore;

      state.events.push({
        type: 'BUMPER_RICOCHET',
        x: bmp.x,
        y: bmp.y,
        text: `x${state.ship.bounceChain} +${bounceScore}`,
        color: '#38bdf8',
        noteIndex: bmp.harmonicNoteIndex + state.ship.bounceChain - 1,
      });

      // Add vertex to Constellation chain if distinct from previous
      const verts = state.ship.constellationVertices;
      if (verts.length === 0 || verts[verts.length - 1].id !== bmp.id) {
        if (!verts.some((v) => v.id === bmp.id)) {
          verts.push({ id: bmp.id, x: bmp.x, y: bmp.y });
        }
      }

      // Check Chandrasekhar Auto-Nova every 4th bounce
      if (hasRelic(state, 'SUPERNOVA_CORE') && state.ship.bounceChain % 4 === 0) {
        triggerSupernovaPulse(state, true);
      }

      // Check if we enclosed a Constellation Polygon (3+ unique bumpers!)
      if (state.ship.constellationVertices.length >= HORIZON_CONFIG.MIN_CONSTELLATION_VERTICES) {
        evaluateConstellationEnclosure(state);
      }
    }
  }

  // Arena boundary walls
  const minX = HORIZON_CONFIG.WALL_MARGIN + state.ship.radius;
  const maxX = HORIZON_CONFIG.ARENA_WIDTH - HORIZON_CONFIG.WALL_MARGIN - state.ship.radius;
  const minY = HORIZON_CONFIG.WALL_MARGIN + state.ship.radius;
  const maxY = HORIZON_CONFIG.ARENA_HEIGHT - HORIZON_CONFIG.WALL_MARGIN - state.ship.radius;

  if (state.ship.x < minX) {
    state.ship.x = minX;
    state.ship.vx = Math.abs(state.ship.vx) * HORIZON_CONFIG.WALL_RESTITUTION;
  } else if (state.ship.x > maxX) {
    state.ship.x = maxX;
    state.ship.vx = -Math.abs(state.ship.vx) * HORIZON_CONFIG.WALL_RESTITUTION;
  }
  if (state.ship.y < minY) {
    state.ship.y = minY;
    state.ship.vy = Math.abs(state.ship.vy) * HORIZON_CONFIG.WALL_RESTITUTION;
  } else if (state.ship.y > maxY) {
    state.ship.y = maxY;
    state.ship.vy = -Math.abs(state.ship.vy) * HORIZON_CONFIG.WALL_RESTITUTION;
  }

  // Step Enemies & Ship-Enemy Ramming + Roche Limit Tidal Crushes
  const survivingEnemies: HorizonEnemy[] = [];
  for (const enemy of state.enemies) {
    enemy.hitFlashMs = Math.max(0, enemy.hitFlashMs - dtMs);

    if (state.mode !== 'TRICKSHOT_DOJO') {
      enemy.orbitAngle += dtSec * (enemy.kind === 'ENTROPY_COMET' ? 1.45 : 0.55);
      const driftSpeed = enemy.kind === 'ENTROPY_COMET' ? 55 : 22;
      enemy.vx = enemy.vx * 0.94 + Math.cos(enemy.orbitAngle) * driftSpeed * 0.06;
      enemy.vy = enemy.vy * 0.94 + Math.sin(enemy.orbitAngle) * driftSpeed * 0.06;
      enemy.x = clamp(enemy.x + enemy.vx * dtSec, 65, HORIZON_CONFIG.ARENA_WIDTH - 65);
      enemy.y = clamp(enemy.y + enemy.vy * dtSec, 65, HORIZON_CONFIG.ARENA_HEIGHT - 65);

      // Enemy firing logic
      enemy.fireCooldownMs -= effDtMs;
      if (
        enemy.fireCooldownMs <= 0 &&
        (enemy.kind === 'PHASE_FRIGATE' ||
          enemy.kind === 'TESSERA_WARDEN' ||
          enemy.kind === 'KARDASHEV_BOSS')
      ) {
        enemy.fireCooldownMs = enemy.kind === 'KARDASHEV_BOSS' ? 1550 : 2800;
        const ang = Math.atan2(state.ship.y - enemy.y, state.ship.x - enemy.x);
        state.projectiles.push({
          id: `proj-${state.tick}-${enemy.id}`,
          friendly: false,
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(ang) * 210,
          vy: Math.sin(ang) * 210,
          radius: 6,
          damage: 1,
          ttlMs: 3600,
          color: '#f43f5e',
        });
      }
    }

    // Check if enemy was pulled/knocked into a Gravity Well Roche Limit!
    let crushedByWell = false;
    for (const well of state.wells) {
      if (well.kind === 'WHITE_HOLE') continue;
      const wd = Math.hypot(enemy.x - well.x, enemy.y - well.y);
      if (wd <= well.coreRadius + enemy.radius * 0.85 && enemy.kind !== 'KARDASHEV_BOSS') {
        crushedByWell = true;
        state.stats.rocheCrushes += 1;
        const bonus = hasRelic(state, 'ROCHE_CRUSHER') ? 500 : HORIZON_CONFIG.ROCHE_CRUSH_SCORE;
        state.score += bonus;
        if (hasRelic(state, 'ROCHE_CRUSHER') || state.stats.rocheCrushes % 2 === 0) {
          state.ship.hull = Math.min(state.ship.maxHull, state.ship.hull + 1);
        }
        state.events.push({
          type: 'ROCHE_CRUSH',
          x: well.x,
          y: well.y,
          text: `🌀 ROCHE TIDAL CRUSH! +${bonus}`,
          color: '#10b981',
          magnitude: 2.0,
        });
        awardEnemyKill(state, enemy, 'ROCHE');
        break;
      }
    }
    if (crushedByWell) continue;

    // Ship-Enemy Ramming collision
    const dx = enemy.x - state.ship.x;
    const dy = enemy.y - state.ship.y;
    const dist = Math.hypot(dx, dy);
    const minDist = enemy.radius + state.ship.radius;

    if (dist <= minDist) {
      const shipSpeed = Math.hypot(state.ship.vx, state.ship.vy);
      const canBreakShield =
        state.ship.chassis === 'STAR_HAMMER' ||
        state.ship.lorentzGamma >= 1.45 ||
        shipSpeed >= 240 ||
        hasRelic(state, 'TACHYON_RAIL');

      if (enemy.shielded && !canBreakShield) {
        // Deflect off shield
        const nx = dist > 1e-3 ? dx / dist : 1;
        const ny = dist > 1e-3 ? dy / dist : 0;
        state.ship.vx = -nx * 240;
        state.ship.vy = -ny * 240;
      } else {
        enemy.shielded = false;
        const ramDamage = Math.round(
          (48 + shipSpeed * 0.14) * state.ship.lorentzGamma * chassis.mass
        );
        enemy.hp -= ramDamage;
        enemy.hitFlashMs = 200;

        const nx = dist > 1e-3 ? dx / dist : 1;
        const ny = dist > 1e-3 ? dy / dist : 0;
        enemy.vx += nx * 280;
        enemy.vy += ny * 280;

        // If ship does NOT have Tachyon Rail or enemy survived, bounce slightly
        if (!hasRelic(state, 'TACHYON_RAIL') || enemy.hp > 0) {
          state.ship.x = enemy.x - nx * (minDist + 2);
          state.ship.y = enemy.y - ny * (minDist + 2);
          state.ship.vx = -state.ship.vx * 0.72;
          state.ship.vy = -state.ship.vy * 0.72;
        }
      }
    }

    if (enemy.hp <= 0) {
      awardEnemyKill(state, enemy, 'RAM');
    } else {
      survivingEnemies.push(enemy);
    }
  }
  state.enemies = survivingEnemies;

  // Step Projectiles
  const activeProjectiles: HorizonProjectile[] = [];
  for (const proj of state.projectiles) {
    proj.ttlMs -= effDtMs;
    if (proj.ttlMs <= 0) continue;

    if (proj.friendly && state.enemies.length > 0) {
      // Homing Photon Lance steering
      const target = state.enemies[0];
      const desired = Math.atan2(target.y - proj.y, target.x - proj.x);
      proj.vx = proj.vx * 0.88 + Math.cos(desired) * 460 * 0.12;
      proj.vy = proj.vy * 0.88 + Math.sin(desired) * 460 * 0.12;
    }

    proj.x += proj.vx * dtSec;
    proj.y += proj.vy * dtSec;

    let consumed = false;
    if (proj.friendly) {
      for (const enemy of state.enemies) {
        if (Math.hypot(enemy.x - proj.x, enemy.y - proj.y) <= enemy.radius + proj.radius) {
          enemy.shielded = false;
          enemy.hp -= proj.damage;
          enemy.hitFlashMs = 160;
          consumed = true;
          break;
        }
      }
    } else {
      if (
        Math.hypot(state.ship.x - proj.x, state.ship.y - proj.y) <=
        state.ship.radius + proj.radius
      ) {
        consumed = true;
        const aegisProtected =
          hasRelic(state, 'LORENTZ_AEGIS') && state.ship.lorentzGamma >= 2.0;
        if (state.ship.invulnerableMs <= 0 && !aegisProtected) {
          state.ship.hull -= proj.damage;
          state.ship.invulnerableMs = 1000;
          state.events.push({
            type: 'SHIP_DAMAGED',
            x: state.ship.x,
            y: state.ship.y,
            text: 'PLASMA HIT -1 HULL',
            color: '#ef4444',
          });
        }
      }
    }

    if (!consumed) {
      activeProjectiles.push(proj);
    }
  }
  state.projectiles = activeProjectiles;

  // Clean up any enemies killed by friendly projectiles
  if (state.enemies.some((e) => e.hp <= 0)) {
    const stillAlive: HorizonEnemy[] = [];
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) {
        awardEnemyKill(state, enemy, 'PHOTON_LANCE');
      } else {
        stillAlive.push(enemy);
      }
    }
    state.enemies = stillAlive;
  }

  // Step Collectible Star Motes
  const magnetRadius = hasRelic(state, 'BINARY_ATTRACTOR') ? 900 : 175;
  const moteBonusMult = hasRelic(state, 'BINARY_ATTRACTOR') ? 1.5 : 1.0;
  const remainingMotes: HorizonStarMote[] = [];
  for (const mote of state.starMotes) {
    mote.ttlMs -= effDtMs;
    if (mote.ttlMs <= 0) continue;

    const dx = state.ship.x - mote.x;
    const dy = state.ship.y - mote.y;
    const d = Math.hypot(dx, dy);
    if (d <= state.ship.radius + 16) {
      const pts = Math.round(mote.value * moteBonusMult * computeRelicScoreMultiplier(state));
      state.score += pts;
      state.ship.hawkingEnergy = Math.min(
        state.ship.maxHawkingEnergy,
        state.ship.hawkingEnergy + 8
      );
      if (mote.kind === 'CHRONO_SHARD') {
        state.ship.chronoCharges = Math.min(
          state.ship.maxChronoCharges,
          state.ship.chronoCharges + 1
        );
      }
      continue;
    }

    if (d <= magnetRadius && d > 1e-3) {
      mote.vx += (dx / d) * 520 * dtSec;
      mote.vy += (dy / d) * 520 * dtSec;
    }
    mote.x += mote.vx * dtSec;
    mote.y += mote.vy * dtSec;
    remainingMotes.push(mote);
  }
  state.starMotes = remainingMotes;

  // Step active Constellation Polygons
  state.activePolygons = state.activePolygons
    .map((p) => ({ ...p, ttlMs: p.ttlMs - dtMs }))
    .filter((p) => p.ttlMs > 0);

  // Check Game Over or Sector Clear
  if (state.ship.hull <= 0) {
    state.ship.hull = 0;
    state.status = 'GAME_OVER';
    state.verdictId = determineHorizonVerdict(state);
    state.events.push({
      type: 'GAME_OVER',
      x: state.ship.x,
      y: state.ship.y,
      text: 'HULL BREACHED · SINGULARITY COLLAPSE',
      color: '#ef4444',
    });
    state.log.unshift('Hull integrity collapsed under gravitational shear.');
    return;
  }

  if (state.enemies.length === 0) {
    openRelicDraftOrAdvance(state);
  }
}

export interface HorizonCounterfactualResult {
  archetypeId: string;
  archetypeName: string;
  philosophy: string;
  finalScore: number;
  polygonsEnclosed: number;
  peakLorentzGamma: number;
  sectorsCleared: number;
  verdictTitle: string;
}

/**
 * Deterministic Counterfactual Trajectory & Build Lab:
 * Runs 3 distinct AI orbital playstyles on the exact same seed for side-by-side comparison.
 */
export function runHorizonCounterfactuals(seed: number): HorizonCounterfactualResult[] {
  const archetypes: Array<{
    id: string;
    name: string;
    chassis: ShipChassisId;
    relicPref: AstroRelicId;
    philosophy: string;
    useTether: boolean;
    useRewind: boolean;
  }> = [
    {
      id: 'SACRED_GEOMETER_AI',
      name: 'Euclidean Trickshot Geometer',
      chassis: 'VANGUARD',
      relicPref: 'KEPLER_SCYTHE',
      philosophy: 'Prioritizes 3-bumper Constellation Polygon enclosures & AI Coach trickshots.',
      useTether: false,
      useRewind: false,
    },
    {
      id: 'HORIZON_DAREDEVIL_AI',
      name: 'Relativistic Tether Daredevil',
      chassis: 'STAR_HAMMER',
      relicPref: 'ROCHE_CRUSHER',
      philosophy: 'Whips on Quantum Tethers ([Q]) & triggers Supernovas ([E]) for Roche Crushes.',
      useTether: true,
      useRewind: false,
    },
    {
      id: 'CHRONO_WEAVER_AI',
      name: 'Worldline Paradox Weaver',
      chassis: 'PHOTON_WISP',
      relicPref: 'SCHRODINGER_ECHO',
      philosophy: 'Chains high-elasticity bumper bounces and rewinds spacetime ([R]) for Echo hits.',
      useTether: false,
      useRewind: true,
    },
  ];

  return archetypes.map((arch) => {
    const sim = createInitialHorizonState(seed, {
      mode: 'ODYSSEY',
      chassis: arch.chassis,
      startSector: 1,
    });
    sim.relics.push(arch.relicPref);

    for (let step = 0; step < 360; step++) {
      if (sim.status === 'VICTORY' || sim.status === 'GAME_OVER') break;
      if (sim.status === 'RELIC_DRAFT') {
        const pick = sim.relicDraftChoices[0] ?? 'NOETHER_DYNAMO';
        applyHorizonInput(sim, { type: 'SELECT_RELIC', relicId: pick });
      }
      if (step % 45 === 0) {
        applyHorizonInput(sim, { type: 'TRIGGER_AI_COACH' });
      }
      if (arch.useTether && step % 30 === 15) {
        applyHorizonInput(sim, { type: 'TOGGLE_TETHER' });
      }
      if (arch.useTether && step % 60 === 40) {
        applyHorizonInput(sim, { type: 'TRIGGER_SUPERNOVA' });
      }
      if (arch.useRewind && step % 75 === 50) {
        applyHorizonInput(sim, { type: 'TRIGGER_REWIND' });
      }
      stepHorizonState(sim, HORIZON_CONFIG.FIXED_STEP_MS);
    }

    const vId = determineHorizonVerdict(sim);
    return {
      archetypeId: arch.id,
      archetypeName: arch.name,
      philosophy: arch.philosophy,
      finalScore: sim.score,
      polygonsEnclosed: sim.stats.polygonsEnclosed,
      peakLorentzGamma: sim.ship.peakLorentzGamma,
      sectorsCleared: sim.sector,
      verdictTitle: HORIZON_VERDICTS[vId]?.title ?? vId,
    };
  });
}
