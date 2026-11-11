import { VaultAudioEngine } from './audio';
import { UPGRADE_CATALOG, UpgradeId, UpgradeSpec, getUpgradeSpec } from './upgrades';

export const ARENA_RADIUS = 380;
export const VAULT_RADIUS = 52;
export const STRIKER_RADIUS = 14;
export const ROUND_DURATION_SEC = 45;

export type PegKind = 'crystal' | 'prism' | 'jackpot' | 'hazard';

export interface ArenaPeg {
  id: number;
  kind: PegKind;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  respawnTimer: number;
  // Spring squash & stretch
  scale: number;
  scaleVel: number;
  hitFlash: number;
  rotation: number;
  lastHitTime: number;
}

export interface StrikerBall {
  id: number;
  isPhantom: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  // Hooke's Law Squash & Stretch
  squashParallel: number;
  squashPerp: number;
  velParallel: number;
  velPerp: number;
  squashAngle: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
  bouncesThisShot: number;
}

export interface VelocityParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  prevX: number;
  prevY: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export interface LightningArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;
  life: number;
}

export interface FloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext?: string;
  color: string;
  scale: number;
  scaleVel: number;
  alpha: number;
  life: number;
}

export interface GravityVortex {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface GridNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type GamePhase = 'aiming' | 'in_flight' | 'upgrade_draft' | 'game_over';

export interface RicochetVaultState {
  seed: number;
  rngState: number;
  phase: GamePhase;
  round: number;
  roundTimerSec: number;
  roundQuota: number;
  bankedScore: number;
  totalRunScore: number;
  bestRunScore: number;

  // Diegetic Health on the Center Vault Core
  shields: number;
  maxShields: number;

  // Push-Your-Luck Unbanked State
  unbankedChips: number;
  comboMult: number;
  chainHits: number;
  heat: number; // 0.0 -> 1.0 (at 1.0 = Thermal Bust!)
  flightTime: number;
  lastBustAmount: number;
  lastBustReason: string;
  lastBankedAmount: number;

  // Wind-up / Aiming State
  isDraggingAim: boolean;
  aimDirX: number;
  aimDirY: number;
  aimTension: number; // 0.0 -> 1.0
  lastWindupTickTension: number;
  lastShotDirX: number;
  lastShotDirY: number;
  lastShotPower: number;
  hasFiredFirstShot: boolean;
  onboardingPulseTime: number;

  // Real 40-60ms Hit-Stop & Directional Screen-Shake
  hitStopMs: number;
  hitStopTotalTriggered: number;
  hitStopLastDurationMs: number;
  hitStopVibrationPhase: number;
  shakeX: number;
  shakeY: number;
  shakeVX: number;
  shakeVY: number;
  wallFlexAngle: number;
  wallFlexAmount: number;
  wallFlexVel: number;

  // Entities
  strikers: StrikerBall[];
  pegs: ArenaPeg[];
  particles: VelocityParticle[];
  shockwaves: ShockwaveRing[];
  lightningArcs: LightningArc[];
  callouts: FloatingCallout[];
  vortices: GravityVortex[];
  gridNodes: GridNode[];

  // Emergent Synergies / Rule-Bending Upgrades
  activeUpgrades: UpgradeId[];
  draftChoices: UpgradeSpec[];
  orbitalAngle: number;
  flipperFlashLeft: number;
  flipperFlashRight: number;
}

export function nextRandom(state: RicochetVaultState): number {
  let t = (state.rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  state.rngState = t >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function computeComboMultiplier(chainHits: number, bonusMult = 0): number {
  if (chainHits <= 0) return 1 + bonusMult;
  if (chainHits === 1) return 1 + bonusMult;
  if (chainHits === 2) return 2 + bonusMult;
  if (chainHits === 3) return 3 + bonusMult;
  if (chainHits === 4) return 5 + bonusMult;
  if (chainHits === 5) return 7 + bonusMult;
  if (chainHits === 6) return 10 + bonusMult;
  if (chainHits === 7) return 14 + bonusMult;
  if (chainHits === 8) return 19 + bonusMult;
  return Math.min(99, 25 + (chainHits - 9) * 6 + bonusMult);
}

export function createPrimaryStriker(x = 0, y = 0, vx = 0, vy = 0, isPhantom = false): StrikerBall {
  return {
    id: Math.floor(Math.random() * 1e9),
    isPhantom,
    x,
    y,
    vx,
    vy,
    radius: isPhantom ? STRIKER_RADIUS * 0.84 : STRIKER_RADIUS,
    squashParallel: 1,
    squashPerp: 1,
    velParallel: 0,
    velPerp: 0,
    squashAngle: Math.atan2(vy || -1, vx || 0),
    trail: [],
    bouncesThisShot: 0,
  };
}

export function buildArenaPegs(state: RicochetVaultState, round: number): ArenaPeg[] {
  const pegs: ArenaPeg[] = [];
  let nextId = 1;

  // Inner Ring (Radius ~138): Fast combo starters (Crystal & Prism pegs)
  const innerCount = 8;
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2 + 0.2;
    const r = 136;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const kind: PegKind = i % 2 === 0 ? 'crystal' : 'prism';
    pegs.push({
      id: nextId++,
      kind,
      baseX: x,
      baseY: y,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: kind === 'prism' ? 19 : 17,
      hp: 2,
      maxHp: 2,
      respawnTimer: 0,
      scale: 1,
      scaleVel: 0,
      hitFlash: 0,
      rotation: angle,
      lastHitTime: -10,
    });
  }

  // Middle Ring (Radius ~232): Gold Jackpot Bumpers + Crystal clusters + 2-3 Hazard Saws
  const midCount = 12;
  const hazardCount = Math.min(4, 2 + Math.floor((round - 1) / 2));
  for (let i = 0; i < midCount; i++) {
    const angle = (i / midCount) * Math.PI * 2;
    const r = 230;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    let kind: PegKind = 'crystal';
    if (i % 3 === 0) {
      kind = 'jackpot';
    } else if (i % 4 === 1 && hazardCount > 0 && i < hazardCount * 4) {
      kind = 'hazard';
    } else if (i % 2 === 1) {
      kind = 'prism';
    }

    pegs.push({
      id: nextId++,
      kind,
      baseX: x,
      baseY: y,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: kind === 'jackpot' ? 25 : kind === 'hazard' ? 21 : 18,
      hp: kind === 'jackpot' ? 4 : 2,
      maxHp: kind === 'jackpot' ? 4 : 2,
      respawnTimer: 0,
      scale: 1,
      scaleVel: 0,
      hitFlash: 0,
      rotation: angle,
      lastHitTime: -10,
    });
  }

  // Outer Ring (Radius ~312): High-value Jackpots, Prisms & Corner Hazards
  const outerCount = 14;
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + 0.12;
    const r = 312;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    let kind: PegKind = 'crystal';
    if (i === 1 || i === 5 || i === 8 || i === 12) {
      kind = 'jackpot';
    } else if (i === 3 || i === 10) {
      kind = 'hazard';
    } else if (i % 2 === 0) {
      kind = 'prism';
    }

    pegs.push({
      id: nextId++,
      kind,
      baseX: x,
      baseY: y,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: kind === 'jackpot' ? 26 : kind === 'hazard' ? 22 : 17,
      hp: kind === 'jackpot' ? 4 : 2,
      maxHp: kind === 'jackpot' ? 4 : 2,
      respawnTimer: 0,
      scale: 1,
      scaleVel: 0,
      hitFlash: 0,
      rotation: angle,
      lastHitTime: -10,
    });
  }

  return pegs;
}

export function buildReactiveGrid(): GridNode[] {
  const nodes: GridNode[] = [];
  const step = 64;
  for (let gx = -384; gx <= 384; gx += step) {
    for (let gy = -384; gy <= 384; gy += step) {
      if (gx * gx + gy * gy <= (ARENA_RADIUS + 35) * (ARENA_RADIUS + 35)) {
        nodes.push({
          baseX: gx,
          baseY: gy,
          x: gx,
          y: gy,
          vx: 0,
          vy: 0,
        });
      }
    }
  }
  return nodes;
}

export function createInitialState(seed = 20261108): RicochetVaultState {
  const state: RicochetVaultState = {
    seed,
    rngState: seed >>> 0,
    phase: 'aiming',
    round: 1,
    roundTimerSec: ROUND_DURATION_SEC,
    roundQuota: 1200,
    bankedScore: 0,
    totalRunScore: 0,
    bestRunScore: 0,

    shields: 3,
    maxShields: 3,

    unbankedChips: 0,
    comboMult: 1,
    chainHits: 0,
    heat: 0,
    flightTime: 0,
    lastBustAmount: 0,
    lastBustReason: '',
    lastBankedAmount: 0,

    isDraggingAim: false,
    aimDirX: 0.52,
    aimDirY: -0.854,
    aimTension: 0,
    lastWindupTickTension: 0,
    lastShotDirX: 0.52,
    lastShotDirY: -0.854,
    lastShotPower: 0.85,
    hasFiredFirstShot: false,
    onboardingPulseTime: 0,

    hitStopMs: 0,
    hitStopTotalTriggered: 0,
    hitStopLastDurationMs: 0,
    hitStopVibrationPhase: 0,
    shakeX: 0,
    shakeY: 0,
    shakeVX: 0,
    shakeVY: 0,
    wallFlexAngle: 0,
    wallFlexAmount: 0,
    wallFlexVel: 0,

    strikers: [createPrimaryStriker(0, 0, 0, 0, false)],
    pegs: [],
    particles: [],
    shockwaves: [],
    lightningArcs: [],
    callouts: [],
    vortices: [],
    gridNodes: buildReactiveGrid(),

    activeUpgrades: [],
    draftChoices: [],
    orbitalAngle: 0,
    flipperFlashLeft: 0,
    flipperFlashRight: 0,
  };

  state.pegs = buildArenaPegs(state, 1);
  return state;
}

export function triggerHitStop(state: RicochetVaultState, durationMs: number): void {
  const clamped = Math.max(40, Math.min(60, durationMs));
  state.hitStopMs = Math.max(state.hitStopMs, clamped);
  state.hitStopLastDurationMs = clamped;
  state.hitStopTotalTriggered += 1;
}

export function addDirectionalShake(
  state: RicochetVaultState,
  nx: number,
  ny: number,
  intensity: number
): void {
  state.shakeVX += nx * intensity * 42;
  state.shakeVY += ny * intensity * 42;
}

export function applyGridImpulse(
  state: RicochetVaultState,
  cx: number,
  cy: number,
  radius: number,
  force: number
): void {
  const rSq = radius * radius;
  for (const node of state.gridNodes) {
    const dx = node.x - cx;
    const dy = node.y - cy;
    const dSq = dx * dx + dy * dy;
    if (dSq > 1 && dSq < rSq) {
      const dist = Math.sqrt(dSq);
      const falloff = 1 - dist / radius;
      node.vx += (dx / dist) * force * falloff;
      node.vy += (dy / dist) * force * falloff;
    }
  }
}

export function spawnImpactParticles(
  state: RicochetVaultState,
  x: number,
  y: number,
  nx: number,
  ny: number,
  inheritedVX: number,
  inheritedVY: number,
  color: string,
  count = 16
): void {
  for (let i = 0; i < count; i++) {
    const spreadAngle = (nextRandom(state) - 0.5) * 1.35;
    const baseAngle = Math.atan2(ny, nx) + spreadAngle;
    const burstSpeed = 95 + nextRandom(state) * 260;

    // Velocity Inheritance: 42% of the striker's velocity + surface reflection vector
    const vx = Math.cos(baseAngle) * burstSpeed + inheritedVX * 0.42;
    const vy = Math.sin(baseAngle) * burstSpeed + inheritedVY * 0.42;
    const maxLife = 0.28 + nextRandom(state) * 0.36;

    state.particles.push({
      x,
      y,
      vx,
      vy,
      prevX: x,
      prevY: y,
      radius: 2.2 + nextRandom(state) * 3.4,
      color,
      alpha: 1,
      life: maxLife,
      maxLife,
    });
  }
}

export function addCallout(
  state: RicochetVaultState,
  x: number,
  y: number,
  text: string,
  color: string,
  subtext?: string,
  initialScale = 1.45
): void {
  state.callouts.push({
    x,
    y,
    vy: -62,
    text,
    subtext,
    color,
    scale: initialScale,
    scaleVel: 0,
    alpha: 1,
    life: 0.95,
  });
}

export function updateAimDrag(
  state: RicochetVaultState,
  dirX: number,
  dirY: number,
  tension01: number,
  audio?: VaultAudioEngine
): void {
  if (state.phase !== 'aiming') return;
  const len = Math.hypot(dirX, dirY) || 1;
  state.aimDirX = dirX / len;
  state.aimDirY = dirY / len;
  state.aimTension = Math.max(0.15, Math.min(1, tension01));
  state.isDraggingAim = true;

  // Anticipation / Wind-up Squash & Stretch on the Striker
  const primary = state.strikers[0];
  if (primary) {
    primary.squashAngle = Math.atan2(state.aimDirY, state.aimDirX);
    primary.squashParallel = 1 + state.aimTension * 0.42;
    primary.squashPerp = 1 - state.aimTension * 0.28;
    // Slight wind-up pull-back offset inside the Vault
    primary.x = -state.aimDirX * state.aimTension * 18;
    primary.y = -state.aimDirY * state.aimTension * 18;
  }

  if (Math.abs(state.aimTension - state.lastWindupTickTension) >= 0.09) {
    state.lastWindupTickTension = state.aimTension;
    audio?.playWindupTick(state.aimTension);
  }
}

export function launchStriker(
  state: RicochetVaultState,
  dirX = state.aimDirX,
  dirY = state.aimDirY,
  power01 = state.aimTension || 0.9,
  audio?: VaultAudioEngine
): boolean {
  if (state.phase !== 'aiming') return false;

  const len = Math.hypot(dirX, dirY) || 1;
  const nx = dirX / len;
  const ny = dirY / len;
  const clampedPower = Math.max(0.35, Math.min(1, power01));
  const launchSpeed = 480 + clampedPower * 310;

  state.phase = 'in_flight';
  state.isDraggingAim = false;
  state.aimTension = 0;
  state.hasFiredFirstShot = true;

  state.unbankedChips = 0;
  state.comboMult = 1;
  state.chainHits = 0;
  state.heat = 0;
  state.flightTime = 0;
  state.lastBustAmount = 0;
  state.lastBustReason = '';

  const primary = createPrimaryStriker(
    nx * (VAULT_RADIUS + 8),
    ny * (VAULT_RADIUS + 8),
    nx * launchSpeed,
    ny * launchSpeed,
    false
  );
  // Snappy Release stretch!
  primary.squashAngle = Math.atan2(ny, nx);
  primary.squashParallel = 1.52;
  primary.squashPerp = 0.62;

  state.strikers = [primary];

  // Emergent Synergy: Chrono-Ghost Echo fires a twin along your previous shot vector
  if (state.activeUpgrades.includes('chrono_echo')) {
    const echoSpeed = launchSpeed * 0.92;
    const echoBall = createPrimaryStriker(
      state.lastShotDirX * (VAULT_RADIUS + 8),
      state.lastShotDirY * (VAULT_RADIUS + 8),
      state.lastShotDirX * echoSpeed,
      state.lastShotDirY * echoSpeed,
      true
    );
    state.strikers.push(echoBall);
  }

  state.lastShotDirX = nx;
  state.lastShotDirY = ny;
  state.lastShotPower = clampedPower;

  // Release shockwave + recoil shake
  state.shockwaves.push({
    x: primary.x,
    y: primary.y,
    radius: 12,
    maxRadius: 95,
    color: '#38bdf8',
    alpha: 0.9,
    lineWidth: 4,
  });
  addDirectionalShake(state, -nx, -ny, 5.5);
  applyGridImpulse(state, 0, 0, 180, 220);
  spawnImpactParticles(state, primary.x, primary.y, nx, ny, primary.vx * 0.5, primary.vy * 0.5, '#38bdf8', 14);
  audio?.playLaunch(clampedPower);

  return true;
}

export function bankUnbankedPot(
  state: RicochetVaultState,
  audio?: VaultAudioEngine
): number {
  if (state.phase !== 'in_flight') return 0;

  const primary = state.strikers[0];
  const bx = primary ? primary.x : 0;
  const by = primary ? primary.y : 0;

  // Emergent Synergy: Supernova Clothesline Recall slices every peg along the recall line!
  if (state.activeUpgrades.includes('supernova_recall') && primary) {
    for (const peg of state.pegs) {
      if (peg.respawnTimer > 0 || peg.kind === 'hazard') continue;
      // Point-to-segment distance from (bx, by) to (0, 0)
      const segLenSq = bx * bx + by * by;
      if (segLenSq > 1) {
        const t = Math.max(0, Math.min(1, (peg.x * bx + peg.y * by) / segLenSq));
        const projX = bx * t;
        const projY = by * t;
        const dist = Math.hypot(peg.x - projX, peg.y - projY);
        if (dist <= peg.radius + 26) {
          state.unbankedChips += 65;
          state.chainHits += 1;
          peg.scale = 1.5;
          peg.hitFlash = 1;
          state.lightningArcs.push({
            x1: bx,
            y1: by,
            x2: peg.x,
            y2: peg.y,
            color: '#34d399',
            alpha: 1,
            life: 0.28,
          });
        }
      }
    }
    state.comboMult = computeComboMultiplier(state.chainHits);
  }

  const totalBanked = Math.round(state.unbankedChips * state.comboMult);
  state.lastBankedAmount = totalBanked;

  if (totalBanked > 0) {
    state.bankedScore += totalBanked;
    state.totalRunScore += totalBanked;
    if (state.totalRunScore > state.bestRunScore) {
      state.bestRunScore = state.totalRunScore;
    }

    // Real 48ms Hit-Stop on Banking a Pot!
    triggerHitStop(state, 48);
    const len = Math.hypot(bx, by) || 1;
    addDirectionalShake(state, -bx / len, -by / len, Math.min(14, 6 + state.comboMult * 0.5));
    applyGridImpulse(state, 0, 0, 260, 380);

    state.shockwaves.push({
      x: 0,
      y: 0,
      radius: VAULT_RADIUS,
      maxRadius: Math.min(ARENA_RADIUS, 160 + state.comboMult * 14),
      color: '#facc15',
      alpha: 1,
      lineWidth: 6,
    });

    spawnImpactParticles(state, 0, 0, -bx / len, -by / len, -bx * 1.2, -by * 1.2, '#facc15', 24);

    // Heal 1 Shield Heart if Banking at x6+ Multiplier!
    let sub = `${state.unbankedChips} × ${state.comboMult}x MULT`;
    if (state.comboMult >= 6 && state.shields < state.maxShields) {
      state.shields += 1;
      sub = `+1 SHIELD HEART RESTORED!`;
    }

    // Emergent Synergy: Midas Transmuter converts nearest Red Hazard into Gold Jackpot on x6+ Bank
    if (state.activeUpgrades.includes('midas_pulse') && state.comboMult >= 6) {
      const hazard = state.pegs.find((p) => p.kind === 'hazard' && p.respawnTimer <= 0);
      if (hazard) {
        hazard.kind = 'jackpot';
        hazard.radius = 25;
        hazard.scale = 1.65;
        hazard.hitFlash = 1;
        addCallout(state, hazard.x, hazard.y, 'MIDAS GOLD!', '#fbbf24');
      }
    }

    addCallout(state, 0, -45, `BANKED +${totalBanked.toLocaleString()}!`, '#facc15', sub, 1.75);
    audio?.playBankCashIn(totalBanked, state.comboMult);
  } else {
    addCallout(state, 0, -35, 'RECALLED', '#94a3b8', undefined, 1.15);
  }

  // Dock Striker back in Center Vault
  state.unbankedChips = 0;
  state.comboMult = 1;
  state.chainHits = 0;
  state.heat = 0;
  state.flightTime = 0;
  state.vortices = [];
  state.strikers = [createPrimaryStriker(0, 0, 0, 0, false)];
  state.phase = 'aiming';

  // Check if Round Quota is met!
  if (state.bankedScore >= state.roundQuota) {
    triggerRoundClearDraft(state);
  }

  return totalBanked;
}

export function triggerGreedBust(
  state: RicochetVaultState,
  reason: string,
  impactX: number,
  impactY: number,
  audio?: VaultAudioEngine
): void {
  const lostPot = Math.max(50, Math.round(state.unbankedChips * state.comboMult));
  state.lastBustAmount = lostPot;
  state.lastBustReason = reason;

  // Real 56ms Hit-Stop on Greed Bust!
  triggerHitStop(state, 56);
  const len = Math.hypot(impactX, impactY) || 1;
  addDirectionalShake(state, impactX / len, impactY / len, 15);
  applyGridImpulse(state, impactX, impactY, 260, -420);

  state.shockwaves.push({
    x: impactX,
    y: impactY,
    radius: 14,
    maxRadius: 190,
    color: '#f43f5e',
    alpha: 1,
    lineWidth: 6,
  });

  spawnImpactParticles(
    state,
    impactX,
    impactY,
    -impactX / len,
    -impactY / len,
    0,
    0,
    '#f43f5e',
    30
  );

  addCallout(
    state,
    impactX * 0.6,
    impactY * 0.6,
    `GREED BUST! -${lostPot.toLocaleString()}`,
    '#fb7185',
    `${reason} · TOO GREEDY!`,
    1.8
  );

  state.unbankedChips = 0;
  state.comboMult = 1;
  state.chainHits = 0;
  state.heat = 0;
  state.flightTime = 0;
  state.vortices = [];
  state.shields = Math.max(0, state.shields - 1);

  audio?.playBust();

  if (state.shields <= 0) {
    state.phase = 'game_over';
    state.strikers = [createPrimaryStriker(0, 0, 0, 0, false)];
  } else {
    state.phase = 'aiming';
    state.strikers = [createPrimaryStriker(0, 0, 0, 0, false)];
  }
}

export function triggerRoundClearDraft(state: RicochetVaultState): void {
  state.phase = 'upgrade_draft';
  state.isDraggingAim = false;
  state.strikers = [createPrimaryStriker(0, 0, 0, 0, false)];
  state.vortices = [];

  // Pick 3 distinct visual Rule-Bending Upgrades (prioritizing unowned ones)
  const unowned = UPGRADE_CATALOG.filter((u) => !state.activeUpgrades.includes(u.id));
  const pool = unowned.length >= 3 ? [...unowned] : [...UPGRADE_CATALOG];

  const choices: UpgradeSpec[] = [];
  while (choices.length < 3 && pool.length > 0) {
    const idx = Math.floor(nextRandom(state) * pool.length);
    choices.push(pool.splice(idx, 1)[0]);
  }
  state.draftChoices = choices;
}

export function selectUpgradeAndStartNextRound(
  state: RicochetVaultState,
  upgradeId: UpgradeId,
  audio?: VaultAudioEngine
): void {
  if (!state.activeUpgrades.includes(upgradeId)) {
    state.activeUpgrades.push(upgradeId);
  }
  const spec = getUpgradeSpec(upgradeId);

  state.round += 1;
  state.roundTimerSec = ROUND_DURATION_SEC;
  state.bankedScore = 0;
  state.roundQuota = Math.round(1200 * Math.pow(1.48, state.round - 1));
  state.shields = Math.min(state.maxShields, state.shields + 1);
  state.phase = 'aiming';
  state.draftChoices = [];
  state.pegs = buildArenaPegs(state, state.round);
  state.strikers = [createPrimaryStriker(0, 0, 0, 0, false)];

  addCallout(
    state,
    0,
    -80,
    `UNLOCKED: ${spec.name}`,
    spec.color,
    `ROUND ${state.round} · QUOTA ${state.roundQuota.toLocaleString()}`,
    1.6
  );
  audio?.playUpgradePick();
}

export function nudgeInFlightStrikers(
  state: RicochetVaultState,
  nudgeX: number,
  nudgeY: number,
  dtSec: number
): void {
  if (state.phase !== 'in_flight') return;
  const accel = 420;
  for (const ball of state.strikers) {
    ball.vx += nudgeX * accel * dtSec;
    ball.vy += nudgeY * accel * dtSec;
  }
}

function handlePegCollision(
  state: RicochetVaultState,
  ball: StrikerBall,
  peg: ArenaPeg,
  nx: number,
  ny: number,
  audio?: VaultAudioEngine
): void {
  // If Hazard Saw & carrying an unbanked pot after initial grace period -> GREED BUST!
  if (peg.kind === 'hazard') {
    if (state.unbankedChips > 0 && state.flightTime > 0.22 && !ball.isPhantom) {
      triggerGreedBust(state, 'HIT HAZARD SAW', peg.x, peg.y, audio);
      return;
    } else {
      // Harmless warning deflection if pot is empty or phantom ball
      peg.scale = 1.42;
      peg.hitFlash = 1;
      addDirectionalShake(state, nx, ny, 5);
      spawnImpactParticles(state, peg.x, peg.y, nx, ny, ball.vx, ball.vy, '#fb7185', 10);
      return;
    }
  }

  // Score Peg Hit!
  state.chainHits += 1;
  ball.bouncesThisShot += 1;

  const isOverdriveGreed = state.heat >= 0.58;
  const greedBonusFactor = isOverdriveGreed ? 2 : 1;

  let baseChips = 30;
  let color = '#38bdf8';
  let isJackpot = false;

  if (peg.kind === 'prism') {
    baseChips = 55;
    color = '#e879f9';
  } else if (peg.kind === 'jackpot') {
    baseChips = 140;
    color = '#facc15';
    isJackpot = true;
  }

  const gainedChips = baseChips * greedBonusFactor;
  state.unbankedChips += gainedChips;

  const jackpotBonusMult = isJackpot ? 2 : 0;
  state.comboMult = computeComboMultiplier(state.chainHits) + jackpotBonusMult;

  // Increase Push-Your-Luck Thermal Risk!
  const heatStep = isJackpot ? 0.09 : 0.075;
  state.heat = Math.min(1.0, state.heat + heatStep);

  // Squash & Stretch on Ball & Peg
  ball.squashAngle = Math.atan2(ny, nx);
  ball.squashParallel = 0.54;
  ball.squashPerp = 1.48;

  peg.scale = isJackpot ? 1.62 : 1.44;
  peg.scaleVel = 3.5;
  peg.vx -= nx * 135;
  peg.vy -= ny * 135;
  peg.hitFlash = 1;
  peg.hp -= 1;

  if (peg.hp <= 0) {
    peg.respawnTimer = 3.2;
    state.unbankedChips += Math.round(baseChips * 0.6);
  }

  // Hit-Stop on Heavy Impacts (Jackpots, Every 4th Combo Milestone, or Overdrive Hits)
  if (isJackpot) {
    triggerHitStop(state, 52);
  } else if (state.chainHits % 4 === 0) {
    triggerHitStop(state, 44);
  }

  // Directional Screen-Shake & Reactive Grid Ripple
  addDirectionalShake(state, nx, ny, isJackpot ? 11 : 5.5);
  applyGridImpulse(state, peg.x, peg.y, isJackpot ? 210 : 140, isJackpot ? 310 : 185);

  // Particle Burst with Velocity Inheritance
  spawnImpactParticles(
    state,
    peg.x + nx * peg.radius,
    peg.y + ny * peg.radius,
    nx,
    ny,
    ball.vx,
    ball.vy,
    color,
    isJackpot ? 24 : 14
  );

  state.shockwaves.push({
    x: peg.x,
    y: peg.y,
    radius: peg.radius * 0.8,
    maxRadius: isJackpot ? 110 : 68,
    color,
    alpha: 0.9,
    lineWidth: isJackpot ? 4.5 : 2.5,
  });

  // Ascending Harmonic WebAudio Note!
  audio?.playComboHit(state.chainHits, isJackpot, state.heat);

  // Floating Tactile Callout
  const tag = isJackpot
    ? `JACKPOT +${gainedChips}!`
    : isOverdriveGreed
      ? `2x GREED +${gainedChips}!`
      : `+${gainedChips}`;
  addCallout(
    state,
    peg.x,
    peg.y - 16,
    tag,
    isOverdriveGreed ? '#fbbf24' : color,
    state.chainHits >= 2 ? `${state.comboMult}x CHAIN` : undefined,
    isJackpot ? 1.55 : 1.25
  );

  // --- EMERGENT SYNERGIES (Rule-Bending Upgrades) ---
  // 1. PRISM BIFURCATION: Every 3rd bounce spawns a twin Phantom Ball
  if (
    state.activeUpgrades.includes('prism_split') &&
    ball.bouncesThisShot % 3 === 0 &&
    state.strikers.length < 5
  ) {
    const speed = Math.hypot(ball.vx, ball.vy);
    const angle = Math.atan2(ball.vy, ball.vx) + (nextRandom(state) > 0.5 ? 0.48 : -0.48);
    const twin = createPrimaryStriker(
      ball.x,
      ball.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      true
    );
    state.strikers.push(twin);
    addCallout(state, ball.x, ball.y - 28, 'PRISM SPLIT!', '#38bdf8', undefined, 1.4);
  }

  // 2. TESLA ARC COIL: Zaps up to 2 nearest pegs with chain lightning
  if (state.activeUpgrades.includes('tesla_chain')) {
    const candidates = state.pegs
      .filter((p) => p.id !== peg.id && p.respawnTimer <= 0 && p.kind !== 'hazard')
      .map((p) => ({ peg: p, dist: Math.hypot(p.x - peg.x, p.y - peg.y) }))
      .filter((item) => item.dist <= 185)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2);

    for (const target of candidates) {
      state.unbankedChips += 35;
      state.chainHits += 1;
      target.peg.scale = 1.38;
      target.peg.hitFlash = 1;
      state.lightningArcs.push({
        x1: peg.x,
        y1: peg.y,
        x2: target.peg.x,
        y2: target.peg.y,
        color: '#22d3ee',
        alpha: 1,
        life: 0.22,
      });
    }
    state.comboMult = computeComboMultiplier(state.chainHits);
  }

  // 3. SINGULARITY ANCHOR: 2nd bounce deploys a Gravity Well Vortex
  if (
    state.activeUpgrades.includes('gravity_well') &&
    ball.bouncesThisShot === 2 &&
    state.vortices.length < 2
  ) {
    state.vortices.push({
      x: peg.x,
      y: peg.y,
      radius: 155,
      life: 4.0,
      maxLife: 4.0,
    });
    addCallout(state, peg.x, peg.y, 'SINGULARITY WELL!', '#c084fc', undefined, 1.45);
  }
}

export function stepSimulation(
  state: RicochetVaultState,
  dtMs: number,
  audio?: VaultAudioEngine
): void {
  const clampedMs = Math.max(0, Math.min(50, dtMs));
  const dtSec = clampedMs / 1000;

  state.onboardingPulseTime += dtSec;
  state.orbitalAngle += dtSec * (3.4 + state.comboMult * 0.18);
  state.flipperFlashLeft = Math.max(0, state.flipperFlashLeft - dtSec * 3.5);
  state.flipperFlashRight = Math.max(0, state.flipperFlashRight - dtSec * 3.5);

  // Camera directional spring-damper shake updates even during hit-stop for crisp impact feel
  const shakeSpringK = 360;
  const shakeDamping = 17;
  state.shakeVX += (-shakeSpringK * state.shakeX - shakeDamping * state.shakeVX) * dtSec;
  state.shakeVY += (-shakeSpringK * state.shakeY - shakeDamping * state.shakeVY) * dtSec;
  state.shakeX += state.shakeVX * dtSec;
  state.shakeY += state.shakeVY * dtSec;

  // Wall flex spring
  state.wallFlexVel += (-320 * state.wallFlexAmount - 14 * state.wallFlexVel) * dtSec;
  state.wallFlexAmount += state.wallFlexVel * dtSec;

  // REAL 40-60ms HIT-STOP FREEZE FRAMES
  if (state.hitStopMs > 0) {
    state.hitStopMs = Math.max(0, state.hitStopMs - clampedMs);
    state.hitStopVibrationPhase += clampedMs * 0.85;
    return;
  }

  // Update Reactive Background Spring Grid
  for (const node of state.gridNodes) {
    const dx = node.baseX - node.x;
    const dy = node.baseY - node.y;
    node.vx = (node.vx + dx * 180 * dtSec) * Math.pow(0.08, dtSec);
    node.vy = (node.vy + dy * 180 * dtSec) * Math.pow(0.08, dtSec);
    node.x += node.vx * dtSec;
    node.y += node.vy * dtSec;
  }

  // Update Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.prevX = p.x;
    p.prevY = p.y;
    p.x += p.vx * dtSec;
    p.y += p.vy * dtSec;
    p.vx *= Math.pow(0.22, dtSec);
    p.vy *= Math.pow(0.22, dtSec);
    p.life -= dtSec;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // Update Shockwaves
  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const sw = state.shockwaves[i];
    sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dtSec * 11);
    sw.alpha -= dtSec * 2.6;
    if (sw.alpha <= 0) {
      state.shockwaves.splice(i, 1);
    }
  }

  // Update Lightning Arcs
  for (let i = state.lightningArcs.length - 1; i >= 0; i--) {
    const arc = state.lightningArcs[i];
    arc.life -= dtSec;
    arc.alpha = Math.max(0, arc.life / 0.25);
    if (arc.life <= 0) {
      state.lightningArcs.splice(i, 1);
    }
  }

  // Update Floating Callouts (with spring scale)
  for (let i = state.callouts.length - 1; i >= 0; i--) {
    const c = state.callouts[i];
    c.y += c.vy * dtSec;
    c.vy *= Math.pow(0.18, dtSec);
    c.scaleVel += (-260 * (c.scale - 1) - 14 * c.scaleVel) * dtSec;
    c.scale += c.scaleVel * dtSec;
    c.life -= dtSec;
    c.alpha = Math.max(0, Math.min(1, c.life * 2.2));
    if (c.life <= 0) {
      state.callouts.splice(i, 1);
    }
  }

  // Update Pegs (Spring Squash/Stretch + Respawn + Hazard drift during high Greed)
  for (const peg of state.pegs) {
    if (peg.respawnTimer > 0) {
      peg.respawnTimer = Math.max(0, peg.respawnTimer - dtSec);
      if (peg.respawnTimer === 0) {
        peg.hp = peg.maxHp;
        peg.scale = 0.2;
        peg.scaleVel = 8;
      }
    }

    // Hooke's law spring scale
    peg.scaleVel += (-310 * (peg.scale - 1) - 13 * peg.scaleVel) * dtSec;
    peg.scale += peg.scaleVel * dtSec;
    peg.hitFlash = Math.max(0, peg.hitFlash - dtSec * 4.5);

    if (peg.kind === 'hazard') {
      peg.rotation += dtSec * (2.6 + state.heat * 4.5);
      // When player is in high Greed Overdrive (heat >= 0.55), Hazard Saws subtly prowl
      if (state.phase === 'in_flight' && state.heat >= 0.55 && state.strikers[0]) {
        const target = state.strikers[0];
        const dx = target.x - peg.x;
        const dy = target.y - peg.y;
        const dist = Math.hypot(dx, dy) || 1;
        peg.vx += (dx / dist) * 58 * dtSec;
        peg.vy += (dy / dist) * 58 * dtSec;
      }
    } else {
      peg.rotation += dtSec * 0.45;
    }

    // Spring back toward baseX, baseY
    peg.vx += ((peg.baseX - peg.x) * 140 - peg.vx * 9) * dtSec;
    peg.vy += ((peg.baseY - peg.y) * 140 - peg.vy * 9) * dtSec;
    peg.x += peg.vx * dtSec;
    peg.y += peg.vy * dtSec;
  }

  if (state.phase === 'upgrade_draft' || state.phase === 'game_over') {
    return;
  }

  // 45-Second Round Countdown Timer (once player has fired their first shot)
  if (state.hasFiredFirstShot) {
    state.roundTimerSec = Math.max(0, state.roundTimerSec - dtSec);
    if (state.roundTimerSec <= 0) {
      if (state.bankedScore + state.unbankedChips * state.comboMult >= state.roundQuota) {
        if (state.phase === 'in_flight' && state.unbankedChips > 0) {
          bankUnbankedPot(state, audio);
        } else {
          triggerRoundClearDraft(state);
        }
        return;
      } else {
        // Out of time -> lose a shield heart & reset timer for another push, or Game Over
        state.shields = Math.max(0, state.shields - 1);
        if (state.shields <= 0) {
          state.phase = 'game_over';
          return;
        } else {
          state.roundTimerSec = ROUND_DURATION_SEC;
          addCallout(state, 0, 0, 'TIME EXPIRED! -1 SHIELD', '#fb7185', 'TIMER RESET · KEEP PUSHING!', 1.6);
          audio?.playBust();
        }
      }
    }
  }

  // Update Striker Spring Physics even in aiming mode
  for (const ball of state.strikers) {
    if (!state.isDraggingAim) {
      ball.velParallel += (-280 * (ball.squashParallel - 1) - 14 * ball.velParallel) * dtSec;
      ball.velPerp += (-280 * (ball.squashPerp - 1) - 14 * ball.velPerp) * dtSec;
      ball.squashParallel += ball.velParallel * dtSec;
      ball.squashPerp += ball.velPerp * dtSec;
    }
  }

  if (state.phase !== 'in_flight') {
    return;
  }

  state.flightTime += dtSec;

  // Passive Thermal Tension after 1.2s in flight: pushes the greedy player to either hit more or Bank!
  if (state.flightTime > 1.2 && state.unbankedChips > 0) {
    state.heat = Math.min(1.0, state.heat + dtSec * 0.085);
    if (state.heat >= 1.0) {
      const primary = state.strikers[0];
      triggerGreedBust(
        state,
        '100% THERMAL OVERLOAD',
        primary ? primary.x : 0,
        primary ? primary.y : 0,
        audio
      );
      return;
    }
  }

  // Update Gravity Vortices
  for (let i = state.vortices.length - 1; i >= 0; i--) {
    const v = state.vortices[i];
    v.life -= dtSec;
    if (v.life <= 0) {
      state.vortices.splice(i, 1);
      continue;
    }
    for (const ball of state.strikers) {
      const dx = v.x - ball.x;
      const dy = v.y - ball.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < v.radius) {
        // Tangential + inward swirl
        const pull = (1 - dist / v.radius) * 520;
        ball.vx += ((dx / dist) * pull - (dy / dist) * pull * 0.45) * dtSec;
        ball.vy += ((dy / dist) * pull + (dx / dist) * pull * 0.45) * dtSec;
      }
    }
  }

  // Sub-stepped Ball Physics (2 substeps for crisp high-speed collision accuracy)
  const subSteps = 2;
  const subDt = dtSec / subSteps;

  for (let step = 0; step < subSteps; step++) {
    for (let bIdx = state.strikers.length - 1; bIdx >= 0; bIdx--) {
      const ball = state.strikers[bIdx];
      if (!ball) continue;

      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Maintain minimum lively speed so the ball never feels sluggish
      const curSpeed = Math.hypot(ball.vx, ball.vy);
      if (curSpeed > 1 && curSpeed < 440) {
        const boost = 440 / curSpeed;
        ball.vx *= boost;
        ball.vy *= boost;
      } else if (curSpeed > 920) {
        const cap = 920 / curSpeed;
        ball.vx *= cap;
        ball.vy *= cap;
      }

      // Record trail
      if (step === 0) {
        ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 1 });
        if (ball.trail.length > 16) {
          ball.trail.pop();
        }
        for (let t = 0; t < ball.trail.length; t++) {
          ball.trail[t].alpha = 1 - t / ball.trail.length;
        }
      }

      // Emergent Synergy: Sawblade Orbitals slice nearby pegs
      if (!ball.isPhantom && state.activeUpgrades.includes('orbital_blades')) {
        const orbitRadius = 38 + Math.min(48, state.comboMult * 2.4);
        for (let arm = 0; arm < 2; arm++) {
          const a = state.orbitalAngle + arm * Math.PI;
          const ox = ball.x + Math.cos(a) * orbitRadius;
          const oy = ball.y + Math.sin(a) * orbitRadius;
          for (const peg of state.pegs) {
            if (peg.respawnTimer > 0 || peg.kind === 'hazard') continue;
            if (
              state.flightTime - peg.lastHitTime > 0.25 &&
              Math.hypot(ox - peg.x, oy - peg.y) <= peg.radius + 10
            ) {
              peg.lastHitTime = state.flightTime;
              peg.scale = 1.38;
              peg.hitFlash = 1;
              state.unbankedChips += 35;
              state.chainHits += 1;
              state.comboMult = computeComboMultiplier(state.chainHits);
              spawnImpactParticles(state, peg.x, peg.y, 0, -1, ball.vx, ball.vy, '#f472b6', 8);
              audio?.playComboHit(state.chainHits, false, state.heat);
            }
          }
        }
      }

      // Emergent Synergy: Plasma Pinball Flippers at bottom of arena
      if (
        state.activeUpgrades.includes('pinball_flippers') &&
        ball.y > ARENA_RADIUS * 0.62 &&
        ball.vy > 0 &&
        Math.abs(ball.x) < 155
      ) {
        ball.vy = -Math.abs(ball.vy) * 1.15;
        ball.vx += (ball.x >= 0 ? 1 : -1) * 90;
        state.comboMult += 3;
        state.heat = Math.max(0, state.heat - 0.25);
        if (ball.x < 0) state.flipperFlashLeft = 1;
        else state.flipperFlashRight = 1;
        ball.squashAngle = -Math.PI / 2;
        ball.squashParallel = 1.5;
        ball.squashPerp = 0.6;
        addCallout(state, ball.x, ball.y - 20, 'FLIPPER PARRY! +3x', '#facc15', '-25% HEAT', 1.5);
        audio?.playComboHit(state.chainHits + 2, true, state.heat);
      }

      // Check Return to Central Bank Vault Ring (Natural Pass-Through Banking!)
      const distFromCenter = Math.hypot(ball.x, ball.y);
      if (
        !ball.isPhantom &&
        state.flightTime > 0.36 &&
        state.unbankedChips > 0 &&
        distFromCenter <= VAULT_RADIUS - 4
      ) {
        bankUnbankedPot(state, audio);
        return;
      }

      // Check Collisions with Pegs & Bumpers
      for (const peg of state.pegs) {
        if (peg.respawnTimer > 0) continue;
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const minDist = ball.radius + peg.radius;
        const dSq = dx * dx + dy * dy;

        if (dSq < minDist * minDist) {
          const dist = Math.sqrt(dSq) || 1;
          const nx = dx / dist;
          const ny = dy / dist;

          // Separate ball from peg
          const overlap = minDist - dist;
          ball.x += nx * (overlap + 1);
          ball.y += ny * (overlap + 1);

          // Reflect velocity across normal with lively elasticity
          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            const elasticity = peg.kind === 'prism' ? 1.14 : peg.kind === 'jackpot' ? 1.18 : 1.04;
            ball.vx = (ball.vx - 2 * dot * nx) * elasticity;
            ball.vy = (ball.vy - 2 * dot * ny) * elasticity;
          }

          handlePegCollision(state, ball, peg, nx, ny, audio);
          if (state.phase !== 'in_flight') return;
        }
      }

      // Check Arena Outer Boundary Collision
      const boundaryDist = Math.hypot(ball.x, ball.y);
      if (boundaryDist + ball.radius >= ARENA_RADIUS) {
        const nx = -ball.x / (boundaryDist || 1);
        const ny = -ball.y / (boundaryDist || 1);

        // Emergent Synergy: Wormhole Walls warp ball to opposite side on horizontal wall hits!
        if (
          state.activeUpgrades.includes('wormhole_walls') &&
          Math.abs(ball.x) > Math.abs(ball.y)
        ) {
          const entryX = ball.x;
          const entryY = ball.y;
          ball.x = -ball.x * 0.92;
          ball.vx *= 1.2;
          ball.vy *= 1.2;
          state.comboMult += 2;
          state.lightningArcs.push({
            x1: entryX,
            y1: entryY,
            x2: ball.x,
            y2: ball.y,
            color: '#818cf8',
            alpha: 1,
            life: 0.26,
          });
          addCallout(state, ball.x * 0.7, ball.y * 0.7, 'WORMHOLE +2x!', '#818cf8');
          audio?.playComboHit(state.chainHits + 1, false, state.heat);
        } else {
          // Standard elastic wall ricochet + local wall flex spring
          ball.x = -nx * (ARENA_RADIUS - ball.radius - 1);
          ball.y = -ny * (ARENA_RADIUS - ball.radius - 1);

          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            ball.vx -= 2 * dot * nx;
            ball.vy -= 2 * dot * ny;
          }

          ball.squashAngle = Math.atan2(ny, nx);
          ball.squashParallel = 0.62;
          ball.squashPerp = 1.38;

          state.wallFlexAngle = Math.atan2(ball.y, ball.x);
          state.wallFlexAmount = 16;

          addDirectionalShake(state, nx, ny, 4);
          spawnImpactParticles(state, ball.x, ball.y, nx, ny, ball.vx, ball.vy, '#64748b', 8);
          audio?.playWallBounce(Math.hypot(ball.vx, ball.vy) / 800);
        }
      }
    }
  }
}
