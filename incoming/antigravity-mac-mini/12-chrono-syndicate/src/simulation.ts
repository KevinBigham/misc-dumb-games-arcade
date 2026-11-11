import { CHRONO_CONFIG } from './config';
import {
  HEIST_STAGE_BLUEPRINTS,
  HeistRigModDef,
  HeistStageBlueprint,
  SYNDICATE_RANKS,
  SyndicateRankDef,
  WallRect,
} from './content';
import { SeededRng, SeededRngState } from './rng';

export type HeistAbilityVerb = 'EMP_PULSE' | 'DEPLOY_DECOY' | 'PHASE_BLINK';

export interface EchoFrameSnapshot {
  tick: number;
  x: number;
  y: number;
  facingRad: number;
  triggeredVerb: HeistAbilityVerb | null;
}

export interface RecordedEchoTimeline {
  echoIndex: number;
  color: string;
  label: string;
  frames: EchoFrameSnapshot[];
}

export interface ActiveEchoGhost {
  echoIndex: number;
  color: string;
  label: string;
  x: number;
  y: number;
  facingRad: number;
  active: boolean;
}

export interface SwitchPlateState {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  targetGateId: string;
  stayOpenTicks: number;
  pressed: boolean;
  holdTimerTicks: number;
  activatedByLabel: string | null;
}

export interface LaserGateState {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  isOpen: boolean;
  empDisabledTicks: number;
}

export interface TerminalNodeState {
  id: string;
  label: string;
  x: number;
  y: number;
  hackTicksRequired: number;
  progressTicks: number;
  hacked: boolean;
  hackedByLabel: string | null;
  hackedAtTick: number | null;
}

export interface PatrolSentinelState {
  id: string;
  name: string;
  waypoints: Array<{ x: number; y: number }>;
  currentWaypointIdx: number;
  x: number;
  y: number;
  facingRad: number;
  speed: number;
  visionRange: number;
  visionAngleRad: number;
  stunnedTicks: number;
  alerted: boolean;
  distractedByDecoyId: string | null;
}

export interface HoloDecoyEntity {
  id: string;
  ownerLabel: string;
  x: number;
  y: number;
  remainingTicks: number;
}

export interface EmpPulseVisual {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  remainingTicks: number;
  color: string;
}

export interface ChronoTelemetryEvent {
  tick: number;
  loopNumber: number;
  actor: string;
  kind:
    | 'PLATE_HELD'
    | 'TERMINAL_DECRYPTED'
    | 'EMP_DETONATED'
    | 'DECOY_DEPLOYED'
    | 'PHASE_BLINK'
    | 'CORE_SEIZED'
    | 'REWIND_COMMITTED'
    | 'SENTINEL_ALERT'
    | 'STAGE_EXTRACTED';
  message: string;
}

export interface ChronoGameEvent {
  type:
    | 'EMP'
    | 'DECOY'
    | 'BLINK'
    | 'HACK_COMPLETE'
    | 'GATE_OPEN'
    | 'CORE_GRABBED'
    | 'REWIND'
    | 'ALERT'
    | 'STAGE_CLEAR'
    | 'VICTORY'
    | 'PARADOX_COLLAPSE';
  text: string;
  x?: number;
  y?: number;
}

export interface ActiveAgentState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  moveDirX: number;
  moveDirY: number;
  targetPoint: { x: number; y: number } | null;
  facingRad: number;
  energy: number;
  maxEnergy: number;
  blinkCooldownTicks: number;
  triggeredVerbThisTick: HeistAbilityVerb | null;
}

export interface StageSummaryRecord {
  stageNumber: number;
  title: string;
  echoesUsed: number;
  parEchoCount: number;
  ticksUsed: number;
  paradoxPeak: number;
  stageScore: number;
}

export interface ChronoGameState {
  seed: number;
  rngState: SeededRngState;
  status: 'PLAYING' | 'STAGE_CLEAR' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';
  stageNumber: number;
  loopNumber: number;
  tick: number;
  totalTicksElapsed: number;
  score: number;
  paradoxInstability: number;
  peakInstabilityThisStage: number;
  temporalResonanceActive: boolean;
  resonanceBonusAccumulated: number;

  installedMods: Array<HeistRigModDef['id']>;

  agent: ActiveAgentState;
  currentLoopRecording: EchoFrameSnapshot[];
  recordedEchoes: RecordedEchoTimeline[];
  activeGhosts: ActiveEchoGhost[];

  switches: SwitchPlateState[];
  laserGates: LaserGateState[];
  terminals: TerminalNodeState[];
  sentinels: PatrolSentinelState[];
  decoys: HoloDecoyEntity[];
  empPulses: EmpPulseVisual[];

  vaultUnlocked: boolean;
  coreCarrierLabel: string | null;
  corePos: { x: number; y: number };
  coreExtracted: boolean;

  stageSummaries: StageSummaryRecord[];
  telemetryLog: ChronoTelemetryEvent[];
  events: ChronoGameEvent[];
  finalRankId: SyndicateRankDef['id'] | null;
}

export type ChronoInputAction =
  | { type: 'SET_MOVE'; dirX: number; dirY: number }
  | { type: 'SET_TARGET_POINT'; x: number; y: number }
  | { type: 'TRIGGER_ABILITY'; verb: HeistAbilityVerb }
  | { type: 'COMMIT_LOOP_REWIND' }
  | { type: 'PURGE_LAST_ECHO' }
  | { type: 'INSTALL_MOD'; modId: HeistRigModDef['id'] }
  | { type: 'NEXT_STAGE' }
  | { type: 'JUMP_TO_STAGE'; stageNumber: number }
  | { type: 'SCRUB_TICK'; tick: number }
  | { type: 'TOGGLE_PAUSE' };

const ECHO_PALETTE = ['#38bdf8', '#f59e0b', '#a855f7', '#f472b6'];

export function getStageBlueprint(stageNumber: number): HeistStageBlueprint {
  const idx = Math.max(0, Math.min(HEIST_STAGE_BLUEPRINTS.length - 1, stageNumber - 1));
  return HEIST_STAGE_BLUEPRINTS[idx];
}

export function createInitialChronoState(
  seed: number = CHRONO_CONFIG.DEFAULT_SEED,
  stageNumber: number = 1,
  installedMods: Array<HeistRigModDef['id']> = [],
  carryScore: number = 0,
  carrySummaries: StageSummaryRecord[] = []
): ChronoGameState {
  const rng = new SeededRng(seed + stageNumber * 7919);
  const bp = getStageBlueprint(stageNumber);

  const hasCapacitor = installedMods.includes('PHASE_CAPACITOR');
  const maxEnergy = hasCapacitor
    ? CHRONO_CONFIG.AGENT_MAX_ENERGY + 35
    : CHRONO_CONFIG.AGENT_MAX_ENERGY;

  const sentinels: PatrolSentinelState[] = bp.sentinels.map((s) => {
    const w0 = s.waypoints[0];
    const w1 = s.waypoints[1] ?? w0;
    const t = rng.nextRange(0.05, 0.35);
    const startX = w0.x + (w1.x - w0.x) * t;
    const startY = w0.y + (w1.y - w0.y) * t;
    const facing = Math.atan2(w1.y - w0.y, w1.x - w0.x);
    return {
      id: s.id,
      name: s.name,
      waypoints: s.waypoints.map((pt) => ({ ...pt })),
      currentWaypointIdx: 1 % s.waypoints.length,
      x: startX,
      y: startY,
      facingRad: facing,
      speed: s.speed,
      visionRange: s.visionRange,
      visionAngleRad: s.visionAngleRad,
      stunnedTicks: 0,
      alerted: false,
      distractedByDecoyId: null,
    };
  });

  return {
    seed: (Math.floor(Math.abs(seed)) || CHRONO_CONFIG.DEFAULT_SEED) >>> 0,
    rngState: rng.snapshot(),
    status: 'PLAYING',
    stageNumber: bp.stageNumber,
    loopNumber: 1,
    tick: 0,
    totalTicksElapsed: 0,
    score: carryScore,
    paradoxInstability: 0,
    peakInstabilityThisStage: 0,
    temporalResonanceActive: false,
    resonanceBonusAccumulated: 0,
    installedMods: [...installedMods],
    agent: {
      x: bp.spawnPos.x,
      y: bp.spawnPos.y,
      vx: 0,
      vy: 0,
      moveDirX: 0,
      moveDirY: 0,
      targetPoint: null,
      facingRad: 0,
      energy: maxEnergy,
      maxEnergy,
      blinkCooldownTicks: 0,
      triggeredVerbThisTick: null,
    },
    currentLoopRecording: [],
    recordedEchoes: [],
    activeGhosts: [],
    switches: bp.switches.map((sw) => ({
      ...sw,
      pressed: false,
      holdTimerTicks: 0,
      activatedByLabel: null,
    })),
    laserGates: bp.laserGates.map((g) => ({
      ...g,
      isOpen: false,
      empDisabledTicks: 0,
    })),
    terminals: bp.terminals.map((t) => ({
      ...t,
      progressTicks: 0,
      hacked: false,
      hackedByLabel: null,
      hackedAtTick: null,
    })),
    sentinels,
    decoys: [],
    empPulses: [],
    vaultUnlocked: false,
    coreCarrierLabel: null,
    corePos: { x: bp.vaultPos.x, y: bp.vaultPos.y },
    coreExtracted: false,
    stageSummaries: carrySummaries.map((s) => ({ ...s })),
    telemetryLog: [
      {
        tick: 0,
        loopNumber: 1,
        actor: 'ARCHITECT',
        kind: 'REWIND_COMMITTED',
        message: `Timeline Loop #1 initialized in ${bp.codeName}.`,
      },
    ],
    events: [],
    finalRankId: null,
  };
}

export function cloneChronoState(state: ChronoGameState): ChronoGameState {
  return JSON.parse(JSON.stringify(state)) as ChronoGameState;
}

function resetEntitiesForLoopStart(state: ChronoGameState): void {
  const bp = getStageBlueprint(state.stageNumber);
  const rng = new SeededRng(state.seed + state.stageNumber * 7919);

  state.tick = 0;
  state.paradoxInstability = Math.max(0, state.paradoxInstability * 0.25);
  state.temporalResonanceActive = false;

  const hasCapacitor = state.installedMods.includes('PHASE_CAPACITOR');
  const maxEnergy = hasCapacitor
    ? CHRONO_CONFIG.AGENT_MAX_ENERGY + 35
    : CHRONO_CONFIG.AGENT_MAX_ENERGY;

  const offsetAngle = ((state.loopNumber - 1) * Math.PI) / 2;
  const offsetDist = state.loopNumber > 1 ? 14 : 0;

  state.agent = {
    x: bp.spawnPos.x + Math.cos(offsetAngle) * offsetDist,
    y: bp.spawnPos.y + Math.sin(offsetAngle) * offsetDist,
    vx: 0,
    vy: 0,
    moveDirX: 0,
    moveDirY: 0,
    targetPoint: null,
    facingRad: 0,
    energy: maxEnergy,
    maxEnergy,
    blinkCooldownTicks: 0,
    triggeredVerbThisTick: null,
  };

  state.currentLoopRecording = [];
  state.activeGhosts = state.recordedEchoes.map((rec) => {
    const f0 = rec.frames[0] ?? { x: bp.spawnPos.x, y: bp.spawnPos.y, facingRad: 0 };
    return {
      echoIndex: rec.echoIndex,
      color: rec.color,
      label: rec.label,
      x: f0.x,
      y: f0.y,
      facingRad: f0.facingRad,
      active: true,
    };
  });

  state.switches = bp.switches.map((sw) => ({
    ...sw,
    pressed: false,
    holdTimerTicks: 0,
    activatedByLabel: null,
  }));

  state.laserGates = bp.laserGates.map((g) => ({
    ...g,
    isOpen: false,
    empDisabledTicks: 0,
  }));

  state.terminals = bp.terminals.map((t) => ({
    ...t,
    progressTicks: 0,
    hacked: false,
    hackedByLabel: null,
    hackedAtTick: null,
  }));

  state.sentinels = bp.sentinels.map((s) => {
    const w0 = s.waypoints[0];
    const w1 = s.waypoints[1] ?? w0;
    const t = rng.nextRange(0.05, 0.35);
    const startX = w0.x + (w1.x - w0.x) * t;
    const startY = w0.y + (w1.y - w0.y) * t;
    const facing = Math.atan2(w1.y - w0.y, w1.x - w0.x);
    return {
      id: s.id,
      name: s.name,
      waypoints: s.waypoints.map((pt) => ({ ...pt })),
      currentWaypointIdx: 1 % s.waypoints.length,
      x: startX,
      y: startY,
      facingRad: facing,
      speed: s.speed,
      visionRange: s.visionRange,
      visionAngleRad: s.visionAngleRad,
      stunnedTicks: 0,
      alerted: false,
      distractedByDecoyId: null,
    };
  });

  state.decoys = [];
  state.empPulses = [];
  state.vaultUnlocked = false;
  state.coreCarrierLabel = null;
  state.corePos = { x: bp.vaultPos.x, y: bp.vaultPos.y };
  state.coreExtracted = false;
}

export function commitLoopAndRewind(state: ChronoGameState): void {
  if (state.status !== 'PLAYING') return;

  if (
    state.currentLoopRecording.length > 0 &&
    state.recordedEchoes.length < CHRONO_CONFIG.MAX_ECHOS_PER_STAGE - 1
  ) {
    const echoIdx = state.recordedEchoes.length + 1;
    const color = ECHO_PALETTE[(echoIdx - 1) % ECHO_PALETTE.length];
    const label = `ECHO #${echoIdx}`;
    state.recordedEchoes.push({
      echoIndex: echoIdx,
      color,
      label,
      frames: state.currentLoopRecording.map((f) => ({ ...f })),
    });
    state.loopNumber = state.recordedEchoes.length + 1;
    state.telemetryLog.unshift({
      tick: state.tick,
      loopNumber: state.loopNumber,
      actor: label,
      kind: 'REWIND_COMMITTED',
      message: `${label} recorded (${state.currentLoopRecording.length} frames). Rewinding to T=0.0s for Loop #${state.loopNumber}!`,
    });
    state.events.push({
      type: 'REWIND',
      text: `⏪ REWIND! ${label} Locked Into Timeline`,
      x: state.agent.x,
      y: state.agent.y,
    });
  } else {
    state.telemetryLog.unshift({
      tick: state.tick,
      loopNumber: state.loopNumber,
      actor: 'OPERATIVE',
      kind: 'REWIND_COMMITTED',
      message: `Timeline reset to T=0.0s with ${state.recordedEchoes.length} active Echoes.`,
    });
    state.events.push({
      type: 'REWIND',
      text: `⏪ TIMELINE RESET TO T=0.0s`,
      x: state.agent.x,
      y: state.agent.y,
    });
  }

  resetEntitiesForLoopStart(state);
}

function executeAbilityForActor(
  state: ChronoGameState,
  actorLabel: string,
  x: number,
  y: number,
  facingRad: number,
  verb: HeistAbilityVerb,
  isLivePlayer: boolean
): void {
  const hasCloak = state.installedMods.includes('OPTIC_CLOAK');
  const hasCapacitor = state.installedMods.includes('PHASE_CAPACITOR');

  if (verb === 'EMP_PULSE') {
    if (isLivePlayer) {
      if (state.agent.energy < CHRONO_CONFIG.EMP_COST) return;
      state.agent.energy -= CHRONO_CONFIG.EMP_COST;
      state.agent.triggeredVerbThisTick = 'EMP_PULSE';
    }

    const stunDuration = hasCloak
      ? CHRONO_CONFIG.EMP_STUN_TICKS + 40
      : CHRONO_CONFIG.EMP_STUN_TICKS;

    let stunnedCount = 0;
    for (const sent of state.sentinels) {
      const dist = Math.hypot(sent.x - x, sent.y - y);
      if (dist <= CHRONO_CONFIG.EMP_RADIUS) {
        sent.stunnedTicks = Math.max(sent.stunnedTicks, stunDuration);
        sent.alerted = false;
        stunnedCount += 1;
      }
    }

    for (const gate of state.laserGates) {
      const midX = (gate.x1 + gate.x2) * 0.5;
      const midY = (gate.y1 + gate.y2) * 0.5;
      if (Math.hypot(midX - x, midY - y) <= CHRONO_CONFIG.EMP_RADIUS + 35) {
        gate.empDisabledTicks = Math.max(gate.empDisabledTicks, Math.floor(stunDuration * 0.8));
      }
    }

    state.empPulses.push({
      x,
      y,
      radius: 14,
      maxRadius: CHRONO_CONFIG.EMP_RADIUS,
      remainingTicks: 14,
      color: isLivePlayer ? '#10b981' : '#38bdf8',
    });

    state.telemetryLog.unshift({
      tick: state.tick,
      loopNumber: state.loopNumber,
      actor: actorLabel,
      kind: 'EMP_DETONATED',
      message: `${actorLabel} discharged EMP Pulse (${stunnedCount} sentinel(s) stunned).`,
    });

    state.events.push({
      type: 'EMP',
      text: `⚡ ${actorLabel}: EMP PULSE!`,
      x,
      y,
    });
  } else if (verb === 'DEPLOY_DECOY') {
    if (isLivePlayer) {
      if (state.agent.energy < CHRONO_CONFIG.DECOY_COST) return;
      state.agent.energy -= CHRONO_CONFIG.DECOY_COST;
      state.agent.triggeredVerbThisTick = 'DEPLOY_DECOY';
    }

    const decoyId = `DECOY_${actorLabel}_${state.tick}`;
    state.decoys.push({
      id: decoyId,
      ownerLabel: actorLabel,
      x,
      y,
      remainingTicks: CHRONO_CONFIG.DECOY_DURATION_TICKS,
    });

    state.telemetryLog.unshift({
      tick: state.tick,
      loopNumber: state.loopNumber,
      actor: actorLabel,
      kind: 'DECOY_DEPLOYED',
      message: `${actorLabel} deployed a Holo-Decoy at (${Math.round(x)}, ${Math.round(y)}).`,
    });

    state.events.push({
      type: 'DECOY',
      text: `🎭 ${actorLabel}: HOLO-DECOY!`,
      x,
      y,
    });
  } else if (verb === 'PHASE_BLINK') {
    if (isLivePlayer) {
      const blinkCost = hasCapacitor
        ? Math.floor(CHRONO_CONFIG.BLINK_COST * 0.8)
        : CHRONO_CONFIG.BLINK_COST;
      if (state.agent.energy < blinkCost || state.agent.blinkCooldownTicks > 0) return;
      state.agent.energy -= blinkCost;
      state.agent.blinkCooldownTicks = CHRONO_CONFIG.BLINK_COOLDOWN_TICKS;
      state.agent.triggeredVerbThisTick = 'PHASE_BLINK';

      const targetX = Math.max(
        CHRONO_CONFIG.AGENT_RADIUS + 8,
        Math.min(
          CHRONO_CONFIG.ARENA_WIDTH - CHRONO_CONFIG.AGENT_RADIUS - 8,
          state.agent.x + Math.cos(facingRad) * CHRONO_CONFIG.BLINK_DISTANCE
        )
      );
      const targetY = Math.max(
        CHRONO_CONFIG.AGENT_RADIUS + 8,
        Math.min(
          CHRONO_CONFIG.ARENA_HEIGHT - CHRONO_CONFIG.AGENT_RADIUS - 8,
          state.agent.y + Math.sin(facingRad) * CHRONO_CONFIG.BLINK_DISTANCE
        )
      );

      const resolved = resolveWallCollision(
        targetX,
        targetY,
        CHRONO_CONFIG.AGENT_RADIUS,
        getStageBlueprint(state.stageNumber).walls
      );
      state.agent.x = resolved.x;
      state.agent.y = resolved.y;

      state.telemetryLog.unshift({
        tick: state.tick,
        loopNumber: state.loopNumber,
        actor: actorLabel,
        kind: 'PHASE_BLINK',
        message: `${actorLabel} Phase-Blinked across space-time.`,
      });

      state.events.push({
        type: 'BLINK',
        text: `✨ PHASE BLINK!`,
        x: state.agent.x,
        y: state.agent.y,
      });
    }
  }
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

  if (action.type === 'JUMP_TO_STAGE') {
    const cleanStage = Math.max(1, Math.min(CHRONO_CONFIG.TOTAL_STAGES, action.stageNumber));
    const next = createInitialChronoState(
      state.seed,
      cleanStage,
      state.installedMods,
      state.score,
      state.stageSummaries
    );
    Object.assign(state, next);
    return;
  }

  if (action.type === 'INSTALL_MOD') {
    if (!state.installedMods.includes(action.modId)) {
      state.installedMods.push(action.modId);
      const hasCapacitor = state.installedMods.includes('PHASE_CAPACITOR');
      state.agent.maxEnergy = hasCapacitor
        ? CHRONO_CONFIG.AGENT_MAX_ENERGY + 35
        : CHRONO_CONFIG.AGENT_MAX_ENERGY;
      state.agent.energy = state.agent.maxEnergy;
    }
    return;
  }

  if (action.type === 'NEXT_STAGE') {
    if (state.stageNumber < CHRONO_CONFIG.TOTAL_STAGES) {
      const next = createInitialChronoState(
        state.seed,
        state.stageNumber + 1,
        state.installedMods,
        state.score,
        state.stageSummaries
      );
      Object.assign(state, next);
    } else {
      state.status = 'VICTORY';
      state.finalRankId = computeSyndicateRank(state).id;
    }
    return;
  }

  if (action.type === 'PURGE_LAST_ECHO') {
    if (state.recordedEchoes.length > 0) {
      state.recordedEchoes.pop();
      state.loopNumber = state.recordedEchoes.length + 1;
      resetEntitiesForLoopStart(state);
    }
    return;
  }

  if (action.type === 'COMMIT_LOOP_REWIND') {
    commitLoopAndRewind(state);
    return;
  }

  if (action.type === 'SCRUB_TICK') {
    const targetTick = Math.max(
      0,
      Math.min(CHRONO_CONFIG.TIMELINE_DURATION_TICKS - 1, Math.floor(action.tick))
    );
    resetEntitiesForLoopStart(state);
    for (let t = 0; t < targetTick; t++) {
      stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    }
    return;
  }

  if (state.status !== 'PLAYING') return;

  if (action.type === 'SET_MOVE') {
    state.agent.moveDirX = Math.max(-1, Math.min(1, action.dirX));
    state.agent.moveDirY = Math.max(-1, Math.min(1, action.dirY));
    if (state.agent.moveDirX !== 0 || state.agent.moveDirY !== 0) {
      state.agent.targetPoint = null;
      state.agent.facingRad = Math.atan2(state.agent.moveDirY, state.agent.moveDirX);
    }
  } else if (action.type === 'SET_TARGET_POINT') {
    state.agent.targetPoint = {
      x: Math.max(20, Math.min(CHRONO_CONFIG.ARENA_WIDTH - 20, action.x)),
      y: Math.max(20, Math.min(CHRONO_CONFIG.ARENA_HEIGHT - 20, action.y)),
    };
  } else if (action.type === 'TRIGGER_ABILITY') {
    const actorLabel = `OPERATIVE #${state.loopNumber}`;
    executeAbilityForActor(
      state,
      actorLabel,
      state.agent.x,
      state.agent.y,
      state.agent.facingRad,
      action.verb,
      true
    );
  }
}

function resolveWallCollision(
  x: number,
  y: number,
  radius: number,
  walls: readonly WallRect[]
): { x: number; y: number } {
  let rx = Math.max(radius + 6, Math.min(CHRONO_CONFIG.ARENA_WIDTH - radius - 6, x));
  let ry = Math.max(radius + 6, Math.min(CHRONO_CONFIG.ARENA_HEIGHT - radius - 6, y));

  for (const w of walls) {
    const closestX = Math.max(w.x, Math.min(rx, w.x + w.w));
    const closestY = Math.max(w.y, Math.min(ry, w.y + w.h));
    const dx = rx - closestX;
    const dy = ry - closestY;
    const distSq = dx * dx + dy * dy;
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq) || 0.001;
      const overlap = radius - dist;
      rx += (dx / dist) * overlap;
      ry += (dy / dist) * overlap;
    }
  }
  return { x: rx, y: ry };
}

function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

export function stepChronoState(
  state: ChronoGameState,
  dtMs: number = CHRONO_CONFIG.FIXED_STEP_MS
): void {
  if (state.status !== 'PLAYING') return;

  const dtSec = dtMs / 1000;
  const bp = getStageBlueprint(state.stageNumber);
  const hasOverdrive = state.installedMods.includes('GHOST_OVERDRIVE');
  const hasResonance = state.installedMods.includes('RESONANCE_COIL');
  const hasCloak = state.installedMods.includes('OPTIC_CLOAK');

  const moveSpeed = CHRONO_CONFIG.AGENT_BASE_SPEED * (hasOverdrive ? 1.22 : 1.0);

  let dx = state.agent.moveDirX;
  let dy = state.agent.moveDirY;

  if (dx === 0 && dy === 0 && state.agent.targetPoint) {
    const toX = state.agent.targetPoint.x - state.agent.x;
    const toY = state.agent.targetPoint.y - state.agent.y;
    const dist = Math.hypot(toX, toY);
    if (dist > 6) {
      dx = toX / dist;
      dy = toY / dist;
      state.agent.facingRad = Math.atan2(dy, dx);
    } else {
      state.agent.targetPoint = null;
    }
  }

  const len = Math.hypot(dx, dy);
  if (len > 1) {
    dx /= len;
    dy /= len;
  }

  state.agent.vx = dx * moveSpeed;
  state.agent.vy = dy * moveSpeed;

  const nextX = state.agent.x + state.agent.vx * dtSec;
  const nextY = state.agent.y + state.agent.vy * dtSec;
  const resolvedPos = resolveWallCollision(nextX, nextY, CHRONO_CONFIG.AGENT_RADIUS, bp.walls);

  let blockedByLaser = false;
  for (const gate of state.laserGates) {
    if (!gate.isOpen && gate.empDisabledTicks <= 0) {
      const distToBeam = distancePointToSegment(
        resolvedPos.x,
        resolvedPos.y,
        gate.x1,
        gate.y1,
        gate.x2,
        gate.y2
      );
      if (distToBeam < CHRONO_CONFIG.AGENT_RADIUS + 3) {
        blockedByLaser = true;
        state.paradoxInstability = Math.min(
          CHRONO_CONFIG.PARADOX_MAX_INSTABILITY,
          state.paradoxInstability + CHRONO_CONFIG.LASER_INSTABILITY_HIT * 0.25
        );
        state.events.push({
          type: 'ALERT',
          text: `🚨 LASER BARRIER! Hold Switch or Blink Across!`,
          x: resolvedPos.x,
          y: resolvedPos.y,
        });
        break;
      }
    }
  }

  if (!blockedByLaser) {
    state.agent.x = resolvedPos.x;
    state.agent.y = resolvedPos.y;
  }

  if (state.agent.blinkCooldownTicks > 0) {
    state.agent.blinkCooldownTicks -= 1;
  }
  state.agent.energy = Math.min(state.agent.maxEnergy, state.agent.energy + 9 * dtSec);

  state.currentLoopRecording.push({
    tick: state.tick,
    x: state.agent.x,
    y: state.agent.y,
    facingRad: state.agent.facingRad,
    triggeredVerb: state.agent.triggeredVerbThisTick,
  });
  state.agent.triggeredVerbThisTick = null;

  for (let i = 0; i < state.recordedEchoes.length; i++) {
    const rec = state.recordedEchoes[i];
    const ghost = state.activeGhosts[i];
    if (!ghost) continue;

    if (state.tick < rec.frames.length) {
      const frame = rec.frames[state.tick];
      ghost.x = frame.x;
      ghost.y = frame.y;
      ghost.facingRad = frame.facingRad;
      ghost.active = true;

      if (frame.triggeredVerb) {
        executeAbilityForActor(
          state,
          ghost.label,
          ghost.x,
          ghost.y,
          ghost.facingRad,
          frame.triggeredVerb,
          false
        );
      }
    } else {
      ghost.active = true;
    }
  }

  const actors: Array<{
    label: string;
    x: number;
    y: number;
    canHack: boolean;
    canCarryCore: boolean;
  }> = [
    {
      label: `OPERATIVE #${state.loopNumber}`,
      x: state.agent.x,
      y: state.agent.y,
      canHack: true,
      canCarryCore: true,
    },
    ...state.activeGhosts.map((g) => ({
      label: g.label,
      x: g.x,
      y: g.y,
      canHack: true,
      canCarryCore: true,
    })),
    ...state.decoys.map((d) => ({
      label: `DECOY (${d.ownerLabel})`,
      x: d.x,
      y: d.y,
      canHack: false,
      canCarryCore: false,
    })),
  ];

  state.temporalResonanceActive = false;
  for (const ghost of state.activeGhosts) {
    const d = Math.hypot(state.agent.x - ghost.x, state.agent.y - ghost.y);
    if (d <= CHRONO_CONFIG.TEMPORAL_RESONANCE_RADIUS) {
      state.temporalResonanceActive = true;
      state.score += 3;
      state.resonanceBonusAccumulated += 3;
      if (hasResonance) {
        state.paradoxInstability = Math.max(0, state.paradoxInstability - 0.8);
      }
      break;
    }
  }

  const extraHoldTicks = hasOverdrive ? 50 : 0;
  for (const sw of state.switches) {
    let stander: string | null = null;
    for (const act of actors) {
      if (Math.hypot(act.x - sw.x, act.y - sw.y) <= CHRONO_CONFIG.SWITCH_INTERACT_RADIUS) {
        stander = act.label;
        break;
      }
    }

    if (stander) {
      const wasOpen = sw.pressed || sw.holdTimerTicks > 0;
      sw.pressed = true;
      sw.holdTimerTicks = sw.stayOpenTicks + extraHoldTicks;
      sw.activatedByLabel = stander;
      if (!wasOpen) {
        state.events.push({
          type: 'GATE_OPEN',
          text: `🔓 ${stander} Opened ${sw.label}!`,
          x: sw.x,
          y: sw.y,
        });
        state.telemetryLog.unshift({
          tick: state.tick,
          loopNumber: state.loopNumber,
          actor: stander,
          kind: 'PLATE_HELD',
          message: `${stander} engaged ${sw.label} -> ${sw.targetGateId} unlocked.`,
        });
      }
    } else {
      sw.pressed = false;
      if (sw.holdTimerTicks > 0) {
        sw.holdTimerTicks -= 1;
      } else {
        sw.activatedByLabel = null;
      }
    }
  }

  for (const gate of state.laserGates) {
    if (gate.empDisabledTicks > 0) {
      gate.empDisabledTicks -= 1;
    }
    const matchingSwitches = state.switches.filter((s) => s.targetGateId === gate.id);
    const openBySwitch = matchingSwitches.some((s) => s.pressed || s.holdTimerTicks > 0);
    gate.isOpen = openBySwitch || gate.empDisabledTicks > 0;
  }

  const hackRate = hasResonance ? 1.5 : 1.0;
  for (const term of state.terminals) {
    if (term.hacked) continue;

    for (const act of actors) {
      if (!act.canHack) continue;
      if (Math.hypot(act.x - term.x, act.y - term.y) <= CHRONO_CONFIG.TERMINAL_HACK_RADIUS) {
        term.progressTicks = Math.min(term.hackTicksRequired, term.progressTicks + hackRate);
        if (term.progressTicks >= term.hackTicksRequired) {
          term.hacked = true;
          term.hackedByLabel = act.label;
          term.hackedAtTick = state.tick;
          state.score += CHRONO_CONFIG.SCORE_TERMINAL_HACKED;
          state.telemetryLog.unshift({
            tick: state.tick,
            loopNumber: state.loopNumber,
            actor: act.label,
            kind: 'TERMINAL_DECRYPTED',
            message: `${act.label} decrypted ${term.label} at T=${(state.tick * 0.05).toFixed(1)}s!`,
          });
          state.events.push({
            type: 'HACK_COMPLETE',
            text: `💻 ${term.label} DECRYPTED BY ${act.label}!`,
            x: term.x,
            y: term.y,
          });
        }
        break;
      }
    }
  }

  state.vaultUnlocked = state.terminals.every((t) => t.hacked);

  for (let i = state.decoys.length - 1; i >= 0; i--) {
    state.decoys[i].remainingTicks -= 1;
    if (state.decoys[i].remainingTicks <= 0) {
      state.decoys.splice(i, 1);
    }
  }

  for (let i = state.empPulses.length - 1; i >= 0; i--) {
    const p = state.empPulses[i];
    p.remainingTicks -= 1;
    p.radius = p.maxRadius * (1 - p.remainingTicks / 14);
    if (p.remainingTicks <= 0) {
      state.empPulses.splice(i, 1);
    }
  }

  for (const sent of state.sentinels) {
    if (sent.stunnedTicks > 0) {
      sent.stunnedTicks -= 1;
      sent.alerted = false;
      continue;
    }

    let targetX: number | null = null;
    let targetY: number | null = null;
    sent.distractedByDecoyId = null;

    for (const dec of state.decoys) {
      if (Math.hypot(dec.x - sent.x, dec.y - sent.y) <= CHRONO_CONFIG.DECOY_ATTRACT_RADIUS) {
        targetX = dec.x;
        targetY = dec.y;
        sent.distractedByDecoyId = dec.id;
        break;
      }
    }

    if (targetX === null || targetY === null) {
      const wp = sent.waypoints[sent.currentWaypointIdx] ?? sent.waypoints[0];
      targetX = wp.x;
      targetY = wp.y;
      if (Math.hypot(targetX - sent.x, targetY - sent.y) < 10) {
        sent.currentWaypointIdx = (sent.currentWaypointIdx + 1) % sent.waypoints.length;
      }
    }

    const dirX = targetX - sent.x;
    const dirY = targetY - sent.y;
    const dist = Math.hypot(dirX, dirY);
    if (dist > 1) {
      sent.facingRad = Math.atan2(dirY, dirX);
      const stepDist = (sent.distractedByDecoyId ? sent.speed * 0.65 : sent.speed) * dtSec;
      sent.x += (dirX / dist) * stepDist;
      sent.y += (dirY / dist) * stepDist;
    }

    sent.alerted = false;
    for (const act of actors) {
      if (!act.canCarryCore) continue;
      const toActX = act.x - sent.x;
      const toActY = act.y - sent.y;
      const d = Math.hypot(toActX, toActY);
      if (d <= sent.visionRange) {
        const angleToAct = Math.atan2(toActY, toActX);
        let angleDiff = angleToAct - sent.facingRad;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) <= sent.visionAngleRad * 0.5) {
          sent.alerted = true;
          const rate = CHRONO_CONFIG.SIGHT_INSTABILITY_PER_TICK * (hasCloak ? 0.55 : 1.0);
          state.paradoxInstability = Math.min(
            CHRONO_CONFIG.PARADOX_MAX_INSTABILITY,
            state.paradoxInstability + rate
          );
          if (state.tick % 12 === 0) {
            state.events.push({
              type: 'ALERT',
              text: `👁️ ${sent.name} Spotted ${act.label}!`,
              x: act.x,
              y: act.y,
            });
          }
        }
      }
    }
  }

  if (!state.sentinels.some((s) => s.alerted)) {
    state.paradoxInstability = Math.max(0, state.paradoxInstability - 0.35);
  }
  state.peakInstabilityThisStage = Math.max(
    state.peakInstabilityThisStage,
    state.paradoxInstability
  );

  if (state.paradoxInstability >= CHRONO_CONFIG.PARADOX_MAX_INSTABILITY) {
    state.status = 'GAME_OVER';
    state.finalRankId = computeSyndicateRank(state).id;
    state.events.push({
      type: 'PARADOX_COLLAPSE',
      text: `💥 PARADOX COLLAPSE! Panopticon Locked Your Timeline!`,
      x: state.agent.x,
      y: state.agent.y,
    });
    return;
  }

  if (state.vaultUnlocked && !state.coreCarrierLabel && !state.coreExtracted) {
    for (const act of actors) {
      if (!act.canCarryCore) continue;
      if (
        Math.hypot(act.x - state.corePos.x, act.y - state.corePos.y) <=
        CHRONO_CONFIG.VAULT_EXTRACT_RADIUS
      ) {
        state.coreCarrierLabel = act.label;
        state.score += CHRONO_CONFIG.SCORE_CORE_EXTRACTED;
        state.telemetryLog.unshift({
          tick: state.tick,
          loopNumber: state.loopNumber,
          actor: act.label,
          kind: 'CORE_SEIZED',
          message: `${act.label} seized the Quantum Chronos Core! Head to Extraction!`,
        });
        state.events.push({
          type: 'CORE_GRABBED',
          text: `💎 ${act.label} SEIZED THE CHRONOS CORE!`,
          x: state.corePos.x,
          y: state.corePos.y,
        });
        break;
      }
    }
  }

  if (state.coreCarrierLabel) {
    const carrier = actors.find((a) => a.label === state.coreCarrierLabel);
    if (carrier) {
      state.corePos.x = carrier.x;
      state.corePos.y = carrier.y;

      const distToExtract = Math.hypot(
        carrier.x - bp.extractionPos.x,
        carrier.y - bp.extractionPos.y
      );
      if (distToExtract <= CHRONO_CONFIG.EXTRACTION_PAD_RADIUS) {
        state.coreExtracted = true;
        const echoesUsed = state.recordedEchoes.length + 1;
        const unusedEchoBonus =
          Math.max(0, CHRONO_CONFIG.MAX_ECHOS_PER_STAGE - echoesUsed) *
          CHRONO_CONFIG.SCORE_UNUSED_ECHO_BONUS;
        const timeRemainingBonus =
          Math.max(0, CHRONO_CONFIG.TIMELINE_DURATION_TICKS - state.tick) *
          CHRONO_CONFIG.SCORE_TICK_REMAINING_BONUS;
        const stealthBonus =
          state.peakInstabilityThisStage < 25 ? CHRONO_CONFIG.SCORE_PARADOX_FREE_BONUS : 0;

        const stageTotal =
          CHRONO_CONFIG.SCORE_STAGE_CLEAR_BASE +
          unusedEchoBonus +
          timeRemainingBonus +
          stealthBonus;

        state.score += stageTotal;
        state.stageSummaries.push({
          stageNumber: state.stageNumber,
          title: bp.title,
          echoesUsed,
          parEchoCount: bp.parEchoCount,
          ticksUsed: state.tick,
          paradoxPeak: Math.round(state.peakInstabilityThisStage),
          stageScore: stageTotal,
        });

        state.telemetryLog.unshift({
          tick: state.tick,
          loopNumber: state.loopNumber,
          actor: carrier.label,
          kind: 'STAGE_EXTRACTED',
          message: `${carrier.label} extracted the Chronos Core in ${(state.tick * 0.05).toFixed(
            1
          )}s using ${echoesUsed} timeline(s)!`,
        });

        if (state.stageNumber >= CHRONO_CONFIG.TOTAL_STAGES) {
          state.status = 'VICTORY';
          state.finalRankId = computeSyndicateRank(state).id;
          state.events.push({
            type: 'VICTORY',
            text: `🏆 GRAND HEIST COMPLETE! All 4 Quantum Vaults Cracked!`,
            x: carrier.x,
            y: carrier.y,
          });
        } else {
          state.status = 'STAGE_CLEAR';
          state.events.push({
            type: 'STAGE_CLEAR',
            text: `🚁 SECTOR ${state.stageNumber} EXTRACTED! (+${stageTotal} PTS)`,
            x: carrier.x,
            y: carrier.y,
          });
        }
        return;
      }
    }
  }

  state.tick += 1;
  state.totalTicksElapsed += 1;

  if (state.tick >= CHRONO_CONFIG.TIMELINE_DURATION_TICKS) {
    commitLoopAndRewind(state);
  }
}

export function computeSyndicateRank(state: ChronoGameState): SyndicateRankDef {
  const totalEchoes = state.stageSummaries.reduce((acc, s) => acc + s.echoesUsed, 0);
  const totalPar = state.stageSummaries.reduce((acc, s) => acc + s.parEchoCount, 0);

  if (state.status === 'VICTORY' && totalEchoes <= totalPar && state.score >= 12500) {
    return SYNDICATE_RANKS.OMNISCIENT_ARCHITECT;
  }
  if (state.status === 'VICTORY' && state.score >= 9500) {
    return SYNDICATE_RANKS.FOURTH_DIMENSIONAL_PHANTOM;
  }
  if (state.stageSummaries.length >= 2 || state.score >= 4500) {
    return SYNDICATE_RANKS.TEMPORAL_TACTICIAN;
  }
  return SYNDICATE_RANKS.LOOP_OPERATIVE;
}
