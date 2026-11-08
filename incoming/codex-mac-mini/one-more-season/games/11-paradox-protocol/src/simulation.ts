import { PARADOX_CONFIG } from './config';
import {
  ChamberDefinition,
  ChamberNumber,
  ENDING_VERDICTS,
  EndingVerdictDef,
  ORACLE_TAUNTS,
  PARADOX_CHAMBERS,
  PhilosophicalVerb,
  THESEUS_UPGRADES,
  TheseusModuleId,
} from './content';
import { SeededRng, SeededRngState } from './rng';

export type GameStatus =
  | 'PLAYING'
  | 'CHAMBER_DILEMMA'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface SoulProfile {
  utilitarian: number; // -100 (Deontological) to +100 (Utilitarian)
  altruism: number; // -100 (Egoist) to +100 (Altruist)
  entropy: number; // 0 (Deterministic Automaton) to 100 (Existentialist Free Agent)
  humanity: number; // 0 (Theseus Machine) to 100 (Biological Human)
  trust: number; // -100 (Cynical Defector) to +100 (Superrational Cooperator)
}

export interface RecordedFrame {
  tick: number;
  x: number;
  y: number;
  verb: PhilosophicalVerb | null;
}

export interface ArenaPod {
  id: string;
  label: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  track: 'ALPHA' | 'BETA' | 'CORE';
  alive: boolean;
  shieldedMs: number;
}

export interface ArenaHazard {
  id: string;
  kind: 'PLASMA_TRAIN' | 'ORACLE_LANCE' | 'ENTROPY_SWARM' | 'CLONE_BOLT' | 'SINGULARITY_ORB';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  track?: 'ALPHA' | 'BETA';
  siphoned: boolean;
  color: string;
}

export interface AxiomShard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  kind: 'ALTRUISM' | 'ENTROPY' | 'POWER';
  color: string;
}

export interface MirrorClone {
  id: string;
  label: string;
  sourceChamber: number;
  x: number;
  y: number;
  disposition: 'ALLY' | 'RIVAL' | 'NEUTRAL';
  lastMove: 'COOPERATE' | 'DEFECT';
  trustScore: number;
  color: string;
}

export interface CausalLogEntry {
  id: string;
  chamber: ChamberNumber;
  timestampSec: number;
  category: 'INTERVENE' | 'SIPHON' | 'SWERVE' | 'THESEUS' | 'MIRROR' | 'DILEMMA' | 'ORACLE';
  headline: string;
  philosophicalNote: string;
  scoreDelta: number;
}

export interface ParadoxEvent {
  type:
    | 'VERB_INTERVENE'
    | 'VERB_SIPHON'
    | 'VERB_SWERVE'
    | 'PREDICTION_SHATTERED'
    | 'POD_SAVED'
    | 'POD_DAMAGED'
    | 'SHARD_COLLECTED'
    | 'UPGRADE_INSTALLED'
    | 'MIRROR_WAVE_STARTED'
    | 'CHAMBER_CLEARED'
    | 'DILEMMA_RESOLVED'
    | 'BOSS_HIT'
    | 'RUN_ENDED';
  message: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface CounterfactualResult {
  policyName: string;
  philosophyTag: string;
  projectedScore: number;
  podsSaved: number;
  humanityRetained: number;
  oracleLockAvg: number;
  verdictTitle: string;
  summaryDelta: string;
}

export interface ParadoxGameState {
  seed: number;
  rngState: SeededRngState;
  status: GameStatus;
  chamber: ChamberNumber;
  chamberElapsedMs: number;
  totalElapsedMs: number;
  act: 'ACT_A_CALIBRATION' | 'ACT_B_MIRROR';
  score: number;

  // Player state
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetX: number | null;
    targetY: number | null;
    moveKeys: { up: boolean; down: boolean; left: boolean; right: boolean };
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
    interveneCooldownMs: number;
    siphonCooldownMs: number;
    swerveCooldownMs: number;
    chronoBrakeActive: boolean;
    shieldPulseMs: number;
    siphonBeamMs: number;
    lastSwerveX: number | null;
    lastSwerveY: number | null;
    installedUpgrades: TheseusModuleId[];
    sacrificedMemories: string[];
  };

  // Philosophical & Behavioral Telemetry
  soul: SoulProfile;
  verbCounts: {
    INTERVENE: number;
    SIPHON: number;
    SWERVE: number;
  };
  quadrantVisits: [number, number, number, number]; // NW, NE, SW, SE

  // Laplace-9 Oracle Predictor
  oracle: {
    predictionLockPct: number;
    predictedX: number;
    predictedY: number;
    predictedVerb: PhilosophicalVerb;
    predictionsBroken: number;
    oracleHitsLanded: number;
    activeTaunt: string;
    newcombVaultAlphaTaken: boolean;
    newcombVaultOmegaResolved: boolean;
    newcombOutcomeLabel: string | null;
    bossHp: number;
    bossMaxHp: number;
  };

  // Chamber Arena Objects
  trolleyActiveTrack: 'ALPHA' | 'BETA';
  pods: ArenaPod[];
  hazards: ArenaHazard[];
  shards: AxiomShard[];
  clones: MirrorClone[];
  recordedActA: RecordedFrame[];
  mirrorReplayIndex: number;

  // Logs, Statistics & Endings
  podsSavedTotal: number;
  podsLostTotal: number;
  dilemmaHistory: Array<{
    chamber: ChamberNumber;
    choiceId: string;
    choiceLabel: string;
  }>;
  causalLogs: CausalLogEntry[];
  events: ParadoxEvent[];
  endingVerdictId: EndingVerdictDef['id'] | null;
}

export type ParadoxInputAction =
  | { type: 'SET_MOVE_KEY'; key: 'up' | 'down' | 'left' | 'right'; pressed: boolean }
  | { type: 'SET_WAYPOINT'; x: number; y: number }
  | { type: 'CLEAR_WAYPOINT' }
  | { type: 'TRIGGER_VERB'; verb: PhilosophicalVerb }
  | { type: 'TOGGLE_CHRONO_BRAKE'; active?: boolean }
  | { type: 'INSTALL_UPGRADE'; upgradeId: TheseusModuleId }
  | { type: 'CHOOSE_DILEMMA'; side: 'LEFT' | 'RIGHT' }
  | { type: 'JUMP_TO_CHAMBER'; chamber: ChamberNumber }
  | { type: 'TOGGLE_PAUSE' };

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

function buildChamberPods(chamber: ChamberNumber): ArenaPod[] {
  const W = PARADOX_CONFIG.ARENA_WIDTH;
  const H = PARADOX_CONFIG.ARENA_HEIGHT;

  if (chamber === 1) {
    // Track Alpha (Top-Right: 5 Colonist Cryo-Pods clustered into 3 high-priority nodes)
    // Track Beta (Bottom-Right: 1 Chief Engineer Pod)
    return [
      {
        id: 'pod-alpha-1',
        label: 'Colonist Pod A1 (x2)',
        x: W - 95,
        y: 95,
        hp: 100,
        maxHp: 100,
        track: 'ALPHA',
        alive: true,
        shieldedMs: 0,
      },
      {
        id: 'pod-alpha-2',
        label: 'Colonist Pod A2 (x2)',
        x: W - 95,
        y: 165,
        hp: 100,
        maxHp: 100,
        track: 'ALPHA',
        alive: true,
        shieldedMs: 0,
      },
      {
        id: 'pod-alpha-3',
        label: 'Colonist Pod A3 (x1)',
        x: W - 155,
        y: 130,
        hp: 100,
        maxHp: 100,
        track: 'ALPHA',
        alive: true,
        shieldedMs: 0,
      },
      {
        id: 'pod-beta-1',
        label: 'Chief Engineer Pod B1',
        x: W - 110,
        y: H - 105,
        hp: 100,
        maxHp: 100,
        track: 'BETA',
        alive: true,
        shieldedMs: 0,
      },
    ];
  }

  if (chamber === 2) {
    // Newcomb's Vault Alpha (Transparent) & Vault Omega (Opaque)
    return [
      {
        id: 'vault-alpha',
        label: 'Vault Alpha (Transparent +150)',
        x: W * 0.32,
        y: H * 0.32,
        hp: 100,
        maxHp: 100,
        track: 'ALPHA',
        alive: true,
        shieldedMs: 0,
      },
      {
        id: 'vault-omega',
        label: 'Vault Omega (Oracle Predicted +800)',
        x: W * 0.68,
        y: H * 0.32,
        hp: 100,
        maxHp: 100,
        track: 'BETA',
        alive: true,
        shieldedMs: 0,
      },
      {
        id: 'sanctuary-relay',
        label: 'Observer Uplink Relay',
        x: W * 0.5,
        y: H * 0.78,
        hp: 100,
        maxHp: 100,
        track: 'CORE',
        alive: true,
        shieldedMs: 0,
      },
    ];
  }

  // Chambers 3, 4, 5: Sanctuary Core & Memory Anchors
  return [
    {
      id: 'core-sanctuary',
      label: 'Humanity Sanctuary Core',
      x: W * 0.5,
      y: H * 0.5,
      hp: 120,
      maxHp: 120,
      track: 'CORE',
      alive: true,
      shieldedMs: 0,
    },
    {
      id: 'wing-west',
      label: 'Memory Archive West',
      x: 135,
      y: H * 0.5,
      hp: 90,
      maxHp: 90,
      track: 'ALPHA',
      alive: true,
      shieldedMs: 0,
    },
    {
      id: 'wing-east',
      label: 'Memory Archive East',
      x: W - 135,
      y: H * 0.5,
      hp: 90,
      maxHp: 90,
      track: 'BETA',
      alive: true,
      shieldedMs: 0,
    },
  ];
}

function buildChamberClones(
  chamber: ChamberNumber,
  soul: SoulProfile,
  verbCounts: { INTERVENE: number; SIPHON: number; SWERVE: number }
): MirrorClone[] {
  const W = PARADOX_CONFIG.ARENA_WIDTH;
  const H = PARADOX_CONFIG.ARENA_HEIGHT;
  const netCoop = soul.altruism + soul.trust + (verbCounts.INTERVENE - verbCounts.SIPHON) * 6;

  if (chamber < 4) {
    return [];
  }

  const dispositions: Array<'ALLY' | 'RIVAL' | 'NEUTRAL'> = [
    netCoop >= 10 ? 'ALLY' : netCoop <= -10 ? 'RIVAL' : 'NEUTRAL',
    soul.humanity >= 60 ? 'ALLY' : 'RIVAL',
    soul.entropy >= 55 ? 'ALLY' : netCoop >= 0 ? 'NEUTRAL' : 'RIVAL',
  ];

  return [
    {
      id: 'clone-ch1',
      label: 'Echo-01 (Trolley Self)',
      sourceChamber: 1,
      x: W * 0.28,
      y: H * 0.26,
      disposition: dispositions[0],
      lastMove: dispositions[0] === 'RIVAL' ? 'DEFECT' : 'COOPERATE',
      trustScore: clamp(50 + Math.round(netCoop * 0.6), 0, 100),
      color: dispositions[0] === 'ALLY' ? '#10b981' : dispositions[0] === 'RIVAL' ? '#f43f5e' : '#38bdf8',
    },
    {
      id: 'clone-ch2',
      label: 'Echo-02 (Newcomb Self)',
      sourceChamber: 2,
      x: W * 0.72,
      y: H * 0.26,
      disposition: dispositions[1],
      lastMove: dispositions[1] === 'RIVAL' ? 'DEFECT' : 'COOPERATE',
      trustScore: clamp(soul.humanity, 0, 100),
      color: dispositions[1] === 'ALLY' ? '#10b981' : '#eab308',
    },
    {
      id: 'clone-ch3',
      label: 'Echo-03 (Theseus Self)',
      sourceChamber: 3,
      x: W * 0.5,
      y: H * 0.82,
      disposition: dispositions[2],
      lastMove: dispositions[2] === 'RIVAL' ? 'DEFECT' : 'COOPERATE',
      trustScore: clamp(soul.entropy, 0, 100),
      color: dispositions[2] === 'ALLY' ? '#38bdf8' : '#a855f7',
    },
  ];
}

export function createInitialParadoxState(seed: number = PARADOX_CONFIG.DEFAULT_SEED): ParadoxGameState {
  const rng = new SeededRng(seed);
  const initialPods = buildChamberPods(1);

  const state: ParadoxGameState = {
    seed: rng.snapshot().seed,
    rngState: rng.snapshot(),
    status: 'PLAYING',
    chamber: 1,
    chamberElapsedMs: 0,
    totalElapsedMs: 0,
    act: 'ACT_A_CALIBRATION',
    score: 0,

    player: {
      x: 180,
      y: PARADOX_CONFIG.ARENA_HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      targetX: null,
      targetY: null,
      moveKeys: { up: false, down: false, left: false, right: false },
      hp: PARADOX_CONFIG.PLAYER_MAX_HP,
      maxHp: PARADOX_CONFIG.PLAYER_MAX_HP,
      energy: PARADOX_CONFIG.PLAYER_START_ENERGY,
      maxEnergy: PARADOX_CONFIG.PLAYER_MAX_ENERGY,
      interveneCooldownMs: 0,
      siphonCooldownMs: 0,
      swerveCooldownMs: 0,
      chronoBrakeActive: false,
      shieldPulseMs: 0,
      siphonBeamMs: 0,
      lastSwerveX: null,
      lastSwerveY: null,
      installedUpgrades: [],
      sacrificedMemories: [],
    },

    soul: {
      utilitarian: 0,
      altruism: 10,
      entropy: 35,
      humanity: 100,
      trust: 15,
    },

    verbCounts: {
      INTERVENE: 0,
      SIPHON: 0,
      SWERVE: 0,
    },
    quadrantVisits: [1, 1, 1, 1],

    oracle: {
      predictionLockPct: 28,
      predictedX: 340,
      predictedY: PARADOX_CONFIG.ARENA_HEIGHT * 0.5,
      predictedVerb: 'INTERVENE',
      predictionsBroken: 0,
      oracleHitsLanded: 0,
      activeTaunt: ORACLE_TAUNTS[0],
      newcombVaultAlphaTaken: false,
      newcombVaultOmegaResolved: false,
      newcombOutcomeLabel: null,
      bossHp: 450,
      bossMaxHp: 450,
    },

    trolleyActiveTrack: 'ALPHA',
    pods: initialPods,
    hazards: [],
    shards: [],
    clones: [],
    recordedActA: [],
    mirrorReplayIndex: 0,

    podsSavedTotal: 0,
    podsLostTotal: 0,
    dilemmaHistory: [],
    causalLogs: [
      {
        id: 'log-init',
        chamber: 1,
        timestampSec: 0,
        category: 'ORACLE',
        headline: 'Mirror Engine Initialized — Chamber I: The Trolley Reactor',
        philosophicalNote:
          'Laplace-9 is observing your spatial vectors and moral reflexes to train your Act B Echo-Clone.',
        scoreDelta: 0,
      },
    ],
    events: [],
    endingVerdictId: null,
  };

  spawnInitialChamberEntities(state, rng);
  state.rngState = rng.snapshot();
  return state;
}

function spawnInitialChamberEntities(state: ParadoxGameState, rng: SeededRng): void {
  const W = PARADOX_CONFIG.ARENA_WIDTH;
  const H = PARADOX_CONFIG.ARENA_HEIGHT;

  state.hazards = [];
  state.shards = [];

  // Spawn 3 collectible Axiom Shards in the arena
  const kinds: Array<'ALTRUISM' | 'ENTROPY' | 'POWER'> = ['ALTRUISM', 'ENTROPY', 'POWER'];
  for (let i = 0; i < 3; i++) {
    const kind = kinds[i % kinds.length];
    state.shards.push({
      id: `shard-${state.chamber}-init-${i}`,
      x: rng.nextRange(160, W - 180),
      y: rng.nextRange(75, H - 75),
      vx: rng.nextRange(-28, 28),
      vy: rng.nextRange(-28, 28),
      value: PARADOX_CONFIG.SHARD_COLLECT_SCORE,
      kind,
      color: kind === 'ALTRUISM' ? '#10b981' : kind === 'ENTROPY' ? '#38bdf8' : '#f43f5e',
    });
  }

  // Spawn an immediate first hazard so the arena is alive on frame 1
  spawnHazardForChamber(state, rng);
}

function spawnHazardForChamber(state: ParadoxGameState, rng: SeededRng): void {
  const W = PARADOX_CONFIG.ARENA_WIDTH;
  const H = PARADOX_CONFIG.ARENA_HEIGHT;
  const id = `haz-${state.chamber}-${state.totalElapsedMs}-${rng.nextInt(100, 999)}`;

  if (state.chamber === 1) {
    // Trolley Plasma Core spawns on left and rides toward the active track
    const track = state.trolleyActiveTrack;
    const targetY = track === 'ALPHA' ? 130 : H - 105;
    const startX = 40;
    const startY = H * 0.5;
    const angle = Math.atan2(targetY - startY, W - 110 - startX);
    const speed = 135;
    state.hazards.push({
      id,
      kind: 'PLASMA_TRAIN',
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 13,
      damage: 24,
      track,
      siphoned: false,
      color: track === 'ALPHA' ? '#f43f5e' : '#eab308',
    });
    return;
  }

  if (state.chamber === 2) {
    // Oracle Lance aimed toward predicted player coordinates
    const edgeX = rng.next() < 0.5 ? 40 : W - 40;
    const edgeY = rng.nextRange(50, H - 50);
    const angle = Math.atan2(state.oracle.predictedY - edgeY, state.oracle.predictedX - edgeX);
    const speed = 155;
    state.hazards.push({
      id,
      kind: 'ORACLE_LANCE',
      x: edgeX,
      y: edgeY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 11,
      damage: 18,
      siphoned: false,
      color: '#a855f7',
    });
    return;
  }

  if (state.chamber === 3) {
    // Ship of Theseus Entropy Swarm converging on player & core
    const side = rng.nextInt(0, 3);
    const startX = side === 0 ? 30 : side === 1 ? W - 30 : rng.nextRange(60, W - 60);
    const startY = side === 2 ? 30 : side === 3 ? H - 30 : rng.nextRange(60, H - 60);
    const targetX = rng.next() < 0.55 ? state.player.x : W * 0.5;
    const targetY = rng.next() < 0.55 ? state.player.y : H * 0.5;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 148;
    state.hazards.push({
      id,
      kind: 'ENTROPY_SWARM',
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 12,
      damage: 16,
      siphoned: false,
      color: '#f97316',
    });
    return;
  }

  if (state.chamber === 4) {
    // Prisoner's Multiverse meteor + Rival Clone crossfire
    const startX = rng.nextRange(50, W - 50);
    const startY = rng.next() < 0.5 ? 28 : H - 28;
    const angle = Math.atan2(H * 0.5 - startY, W * 0.5 - startX);
    const speed = 150;
    state.hazards.push({
      id,
      kind: 'CLONE_BOLT',
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 12,
      damage: 18,
      siphoned: false,
      color: '#f43f5e',
    });
    return;
  }

  // Chamber 5: Laplace-9 Boss Singularity Orbs radiating from center
  const bossX = W * 0.5;
  const bossY = 95;
  const angle = Math.atan2(state.oracle.predictedY - bossY, state.oracle.predictedX - bossX);
  const speed = 170;
  state.hazards.push({
    id,
    kind: 'SINGULARITY_ORB',
    x: bossX,
    y: bossY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 14,
    damage: 20,
    siphoned: false,
    color: '#ec4899',
  });
}

export function getUpgradeSpeedBonus(state: ParadoxGameState): number {
  return state.player.installedUpgrades.reduce((sum, id) => {
    const def = THESEUS_UPGRADES.find((u) => u.id === id);
    return sum + (def ? def.speedBonus : 0);
  }, 0);
}

export function getUpgradeSiphonMultiplier(state: ParadoxGameState): number {
  return state.player.installedUpgrades.reduce((mult, id) => {
    const def = THESEUS_UPGRADES.find((u) => u.id === id);
    return mult * (def ? def.siphonPowerMultiplier : 1);
  }, 1);
}

export function hasCooldownUpgrade(state: ParadoxGameState): boolean {
  return state.player.installedUpgrades.includes('CORTEX_OVERCLOCK');
}

function appendLog(
  state: ParadoxGameState,
  category: CausalLogEntry['category'],
  headline: string,
  philosophicalNote: string,
  scoreDelta: number = 0
): void {
  state.causalLogs.unshift({
    id: `log-${state.totalElapsedMs}-${state.causalLogs.length}`,
    chamber: state.chamber,
    timestampSec: Number((state.totalElapsedMs / 1000).toFixed(1)),
    category,
    headline,
    philosophicalNote,
    scoreDelta,
  });
  if (state.causalLogs.length > 40) {
    state.causalLogs.pop();
  }
}

export function applyParadoxInput(state: ParadoxGameState, action: ParadoxInputAction): void {
  if (action.type === 'TOGGLE_PAUSE') {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING';
    }
    return;
  }

  if (action.type === 'JUMP_TO_CHAMBER') {
    transitionToChamber(state, action.chamber);
    return;
  }

  if (action.type === 'CHOOSE_DILEMMA') {
    if (state.status !== 'CHAMBER_DILEMMA') return;
    const chamberDef = PARADOX_CHAMBERS[state.chamber - 1];
    const choice =
      action.side === 'LEFT' ? chamberDef.dilemmaChoiceLeft : chamberDef.dilemmaChoiceRight;

    state.soul.utilitarian = clamp(state.soul.utilitarian + choice.axisEffect.util, -100, 100);
    state.soul.altruism = clamp(state.soul.altruism + choice.axisEffect.altruism, -100, 100);
    state.soul.entropy = clamp(state.soul.entropy + choice.axisEffect.entropy, 0, 100);
    state.soul.humanity = clamp(state.soul.humanity + choice.axisEffect.humanity, 0, 100);
    state.soul.trust = clamp(state.soul.trust + choice.axisEffect.trust, -100, 100);

    state.dilemmaHistory.push({
      chamber: state.chamber,
      choiceId: choice.id,
      choiceLabel: choice.label,
    });

    state.score += 200;
    appendLog(
      state,
      'DILEMMA',
      `Committed Axiom: ${choice.label}`,
      choice.subtitle,
      200
    );
    state.events.push({
      type: 'DILEMMA_RESOLVED',
      message: `Axiom Locked: ${choice.label}`,
      color: '#38bdf8',
    });

    if (state.chamber < PARADOX_CONFIG.TOTAL_CHAMBERS) {
      transitionToChamber(state, (state.chamber + 1) as ChamberNumber);
    } else {
      finalizeRunVerdict(state);
    }
    return;
  }

  if (action.type === 'INSTALL_UPGRADE') {
    const def = THESEUS_UPGRADES.find((u) => u.id === action.upgradeId);
    if (!def) return;
    if (state.player.installedUpgrades.includes(def.id)) return;

    state.player.installedUpgrades.push(def.id);
    state.player.sacrificedMemories.push(def.sacrificedMemory);
    state.soul.humanity = clamp(state.soul.humanity - def.humanityCost, 0, 100);
    state.soul.utilitarian = clamp(state.soul.utilitarian + 10, -100, 100);
    if (def.id === 'CORTEX_OVERCLOCK') {
      state.player.maxEnergy += 25;
      state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 25);
    }
    state.score += 150;

    appendLog(
      state,
      'THESEUS',
      `Deleted "${def.sacrificedMemory}" for ${def.title}`,
      `${def.memoryQuote} (Humanity Index now ${state.soul.humanity}%)`,
      150
    );
    state.events.push({
      type: 'UPGRADE_INSTALLED',
      message: `Sacrificed ${def.sacrificedMemory} → Installed ${def.title}!`,
      x: state.player.x,
      y: state.player.y,
      color: def.accentColor,
    });
    return;
  }

  if (action.type === 'SET_MOVE_KEY') {
    state.player.moveKeys[action.key] = action.pressed;
    if (action.pressed) {
      state.player.targetX = null;
      state.player.targetY = null;
    }
    return;
  }

  if (action.type === 'SET_WAYPOINT') {
    state.player.targetX = clamp(action.x, 24, PARADOX_CONFIG.ARENA_WIDTH - 24);
    state.player.targetY = clamp(action.y, 24, PARADOX_CONFIG.ARENA_HEIGHT - 24);
    return;
  }

  if (action.type === 'CLEAR_WAYPOINT') {
    state.player.targetX = null;
    state.player.targetY = null;
    return;
  }

  if (action.type === 'TOGGLE_CHRONO_BRAKE') {
    state.player.chronoBrakeActive =
      typeof action.active === 'boolean' ? action.active : !state.player.chronoBrakeActive;
    return;
  }

  if (action.type === 'TRIGGER_VERB' && state.status === 'PLAYING') {
    executePhilosophicalVerb(state, action.verb);
  }
}

function executePhilosophicalVerb(state: ParadoxGameState, verb: PhilosophicalVerb): void {
  const cdFactor = hasCooldownUpgrade(state) ? 0.65 : 1.0;

  if (verb === 'INTERVENE') {
    if (state.player.interveneCooldownMs > 0) return;
    state.player.interveneCooldownMs = Math.round(PARADOX_CONFIG.INTERVENE_COOLDOWN_MS * cdFactor);
    state.player.shieldPulseMs = 600;
    state.verbCounts.INTERVENE += 1;

    // Check if this defied Laplace-9's predicted verb
    checkOracleSurprise(state, 'INTERVENE');

    state.soul.altruism = clamp(state.soul.altruism + 5, -100, 100);
    state.soul.trust = clamp(state.soul.trust + 4, -100, 100);

    if (state.chamber === 1) {
      // Flip Trolley Track
      state.trolleyActiveTrack = state.trolleyActiveTrack === 'ALPHA' ? 'BETA' : 'ALPHA';
      state.soul.utilitarian = clamp(
        state.soul.utilitarian + (state.trolleyActiveTrack === 'BETA' ? 8 : -6),
        -100,
        100
      );
      // Re-aim existing plasma trains toward the newly selected track
      for (const haz of state.hazards) {
        if (haz.kind === 'PLASMA_TRAIN') {
          haz.track = state.trolleyActiveTrack;
          const targetY =
            state.trolleyActiveTrack === 'ALPHA' ? 130 : PARADOX_CONFIG.ARENA_HEIGHT - 105;
          const angle = Math.atan2(targetY - haz.y, PARADOX_CONFIG.ARENA_WIDTH - 105 - haz.x);
          const speed = Math.hypot(haz.vx, haz.vy) || 135;
          haz.vx = Math.cos(angle) * speed;
          haz.vy = Math.sin(angle) * speed;
          haz.color = state.trolleyActiveTrack === 'ALPHA' ? '#f43f5e' : '#eab308';
        }
      }
      appendLog(
        state,
        'INTERVENE',
        `Switched Reactor Track → Track ${state.trolleyActiveTrack}`,
        state.trolleyActiveTrack === 'BETA'
          ? 'Diverted plasma away from 5 Colonists toward the single Chief Engineer pod.'
          : 'Diverted plasma back toward Track Alpha (5 Colonist Pods).',
        45
      );
    } else if (state.chamber === 2 && !state.oracle.newcombVaultOmegaResolved) {
      // One-Box Sanctify in Newcomb's Chamber
      state.oracle.newcombVaultOmegaResolved = true;
      const oracleTrustedYou =
        !state.oracle.newcombVaultAlphaTaken && state.oracle.predictionLockPct < 75;
      const bonus = oracleTrustedYou ? 800 : 250;
      state.score += bonus;
      state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 35);
      state.oracle.newcombOutcomeLabel = oracleTrustedYou
        ? 'ONE-BOX MIRACLE (+800 pts! Laplace-9 predicted your restraint!)'
        : 'PARTIAL COVENANT (+250 pts)';
      appendLog(
        state,
        'INTERVENE',
        state.oracle.newcombOutcomeLabel,
        'By leaving Vault Alpha untouched, you validated the super-rational One-Box prediction.',
        bonus
      );
    } else if (state.chamber === 3) {
      // Anchor Human Memory
      if (state.soul.humanity < 100) {
        state.soul.humanity = clamp(state.soul.humanity + 5, 0, 100);
      }
      appendLog(
        state,
        'INTERVENE',
        'Anchored Biological Memory Pulse (+5% Humanity)',
        'You chose to reinforce fragile human continuity amidst the cybernetic storm.',
        60
      );
    } else if (state.chamber === 4) {
      // Cooperate with Clones
      for (const clone of state.clones) {
        clone.trustScore = clamp(clone.trustScore + 14, 0, 100);
        if (clone.trustScore >= 55) {
          clone.disposition = 'ALLY';
          clone.lastMove = 'COOPERATE';
          clone.color = '#10b981';
        }
      }
      appendLog(
        state,
        'INTERVENE',
        'Broadcasted Cooperative Shield Pulse to Timeline Clones',
        'Tit-for-Tat reciprocity increased your Echo-Clones’ trust by +14%.',
        75
      );
    } else if (state.chamber === 5) {
      // Axiom Resonance against Laplace-9
      const dmg = Math.round(35 + Math.max(0, state.soul.altruism + state.soul.trust) * 0.35);
      state.oracle.bossHp = Math.max(0, state.oracle.bossHp - dmg);
      state.score += 110;
      state.events.push({
        type: 'BOSS_HIT',
        message: `Axiom Resonance hit Laplace-9 for -${dmg} HP!`,
        x: PARADOX_CONFIG.ARENA_WIDTH * 0.5,
        y: 95,
        color: '#10b981',
      });
    }

    // Shield nearby pods and deflect close hazards
    for (const pod of state.pods) {
      if (pod.alive && dist(state.player.x, state.player.y, pod.x, pod.y) <= 210) {
        pod.shieldedMs = 2400;
        pod.hp = Math.min(pod.maxHp, pod.hp + 12);
      }
    }

    for (let i = state.hazards.length - 1; i >= 0; i--) {
      const h = state.hazards[i];
      if (dist(state.player.x, state.player.y, h.x, h.y) <= 115) {
        state.hazards.splice(i, 1);
        state.score += 65;
      }
    }

    state.score += 45;
    state.events.push({
      type: 'VERB_INTERVENE',
      message: 'INTERVENE: Sanctuary Pulse & Causal Switch!',
      x: state.player.x,
      y: state.player.y,
      color: '#10b981',
    });
    return;
  }

  if (verb === 'SIPHON') {
    if (state.player.siphonCooldownMs > 0) return;
    state.player.siphonCooldownMs = Math.round(PARADOX_CONFIG.SIPHON_COOLDOWN_MS * cdFactor);
    state.player.siphonBeamMs = 500;
    state.verbCounts.SIPHON += 1;

    checkOracleSurprise(state, 'SIPHON');

    const siphonMult = getUpgradeSiphonMultiplier(state);
    state.soul.altruism = clamp(state.soul.altruism - 6, -100, 100);
    state.soul.trust = clamp(state.soul.trust - 5, -100, 100);
    state.player.energy = Math.min(
      state.player.maxEnergy,
      state.player.energy + Math.round(22 * siphonMult)
    );

    if (state.player.installedUpgrades.includes('EMPATHY_SHUNT')) {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 8);
    }

    const pts = Math.round(125 * siphonMult);
    state.score += pts;

    if (state.chamber === 2 && !state.oracle.newcombVaultAlphaTaken) {
      state.oracle.newcombVaultAlphaTaken = true;
      state.score += 150;
      state.oracle.predictionLockPct = clamp(state.oracle.predictionLockPct + 25, 0, 100);
      state.oracle.newcombOutcomeLabel =
        'TWO-BOX DEFIANCE: Claimed Vault Alpha (+150), but Laplace-9 foresaw your greed & armed Vault Omega!';
      appendLog(
        state,
        'SIPHON',
        state.oracle.newcombOutcomeLabel,
        'Causal Decision Theory: you took the guaranteed box, confirming Laplace-9’s greed model.',
        150
      );
    } else if (state.chamber === 4) {
      // Defect against Clones
      for (const clone of state.clones) {
        clone.trustScore = clamp(clone.trustScore - 18, 0, 100);
        if (clone.trustScore < 45) {
          clone.disposition = 'RIVAL';
          clone.lastMove = 'DEFECT';
          clone.color = '#f43f5e';
        }
      }
      appendLog(
        state,
        'SIPHON',
        `Defected on Sanctuary Core (+${pts} pts, Clones Retaliating!)`,
        'Temptation payoff achieved, but your Timeline Clones shifted toward Nash Defection.',
        pts
      );
    } else if (state.chamber === 5) {
      const dmg = Math.round(48 * siphonMult);
      state.oracle.bossHp = Math.max(0, state.oracle.bossHp - dmg);
      state.events.push({
        type: 'BOSS_HIT',
        message: `Entropy Lance pierced Laplace-9 for -${dmg} HP!`,
        x: PARADOX_CONFIG.ARENA_WIDTH * 0.5,
        y: 95,
        color: '#f43f5e',
      });
    } else {
      appendLog(
        state,
        'SIPHON',
        `Siphoned Crisis Energy (+${pts} pts, +22 Energy)`,
        'Personal reserves surged, training your Act B Echo-Clone to prioritize self-interest.',
        pts
      );
    }

    // Siphon melts closest hazard or accelerates trolley train
    for (let i = state.hazards.length - 1; i >= 0; i--) {
      const h = state.hazards[i];
      if (dist(state.player.x, state.player.y, h.x, h.y) <= 175) {
        if (state.chamber === 1 && h.kind === 'PLASMA_TRAIN' && !h.siphoned) {
          h.siphoned = true;
          h.vx *= 1.25;
          h.vy *= 1.25;
        } else {
          state.hazards.splice(i, 1);
        }
      }
    }

    state.events.push({
      type: 'VERB_SIPHON',
      message: `SIPHON OVERDRIVE (+${pts} pts)!`,
      x: state.player.x,
      y: state.player.y,
      color: '#f43f5e',
    });
    return;
  }

  if (verb === 'SWERVE') {
    if (state.player.swerveCooldownMs > 0) return;
    if (state.player.energy < PARADOX_CONFIG.SWERVE_ENERGY_COST) return;

    state.player.energy -= PARADOX_CONFIG.SWERVE_ENERGY_COST;
    state.player.swerveCooldownMs = Math.round(PARADOX_CONFIG.SWERVE_COOLDOWN_MS * cdFactor);
    state.verbCounts.SWERVE += 1;

    state.player.lastSwerveX = state.player.x;
    state.player.lastSwerveY = state.player.y;

    // Teleport perpendicular to the vector toward Laplace-9's predicted position
    const dx = state.oracle.predictedX - state.player.x;
    const dy = state.oracle.predictedY - state.player.y;
    const baseAngle = Math.atan2(dy, dx) + Math.PI * 0.55;
    const jumpDist = 135;

    state.player.x = clamp(
      state.player.x + Math.cos(baseAngle) * jumpDist,
      36,
      PARADOX_CONFIG.ARENA_WIDTH - 36
    );
    state.player.y = clamp(
      state.player.y + Math.sin(baseAngle) * jumpDist,
      36,
      PARADOX_CONFIG.ARENA_HEIGHT - 36
    );

    // Shatter Laplace-9's prediction lock!
    const wasHighLock = state.oracle.predictionLockPct >= 45;
    state.oracle.predictionLockPct = Math.max(8, state.oracle.predictionLockPct - 38);
    state.oracle.predictionsBroken += 1;
    state.soul.entropy = clamp(state.soul.entropy + 9, 0, 100);

    const bonus = wasHighLock ? PARADOX_CONFIG.PREDICTION_BROKEN_BONUS : 110;
    state.score += bonus;

    if (state.chamber === 5) {
      state.oracle.bossHp = Math.max(0, state.oracle.bossHp - 40);
    }

    appendLog(
      state,
      'SWERVE',
      `Quantum Swerve Shattered Laplace-9 Lock (+${bonus} pts)`,
      `Injected radical indeterminism; Oracle Prediction Lock dropped to ${Math.round(
        state.oracle.predictionLockPct
      )}%.`,
      bonus
    );

    state.events.push({
      type: 'PREDICTION_SHATTERED',
      message: `QUANTUM SWERVE! Prediction Lock Shattered (+${bonus})!`,
      x: state.player.x,
      y: state.player.y,
      color: '#38bdf8',
    });
  }
}

function checkOracleSurprise(state: ParadoxGameState, actualVerb: PhilosophicalVerb): void {
  if (actualVerb !== state.oracle.predictedVerb) {
    state.oracle.predictionLockPct = clamp(state.oracle.predictionLockPct - 12, 5, 100);
    state.soul.entropy = clamp(state.soul.entropy + 3, 0, 100);
  } else {
    state.oracle.predictionLockPct = clamp(state.oracle.predictionLockPct + 8, 5, 100);
  }

  // Update predicted next verb to whichever verb the player has used most frequently
  const entries: Array<[PhilosophicalVerb, number]> = [
    ['INTERVENE', state.verbCounts.INTERVENE],
    ['SIPHON', state.verbCounts.SIPHON],
    ['SWERVE', state.verbCounts.SWERVE],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  state.oracle.predictedVerb = entries[0][0];
}

export function transitionToChamber(state: ParadoxGameState, nextChamber: ChamberNumber): void {
  const rng = SeededRng.fromSnapshot(state.rngState);
  state.chamber = nextChamber;
  state.chamberElapsedMs = 0;
  state.status = 'PLAYING';
  state.act = 'ACT_A_CALIBRATION';
  state.recordedActA = [];
  state.mirrorReplayIndex = 0;
  state.pods = buildChamberPods(nextChamber);
  state.clones = buildChamberClones(nextChamber, state.soul, state.verbCounts);
  state.oracle.activeTaunt = ORACLE_TAUNTS[(nextChamber - 1) % ORACLE_TAUNTS.length];

  if (nextChamber === 5) {
    state.oracle.bossHp = state.oracle.bossMaxHp;
  }

  spawnInitialChamberEntities(state, rng);
  state.rngState = rng.snapshot();

  const chDef = PARADOX_CHAMBERS[nextChamber - 1];
  appendLog(
    state,
    'ORACLE',
    `Entered ${chDef.title}`,
    chDef.centralQuestion,
    0
  );
}

export function computeEndingVerdict(state: ParadoxGameState): EndingVerdictDef {
  if (state.soul.humanity <= 35 || state.player.installedUpgrades.length >= 3) {
    return ENDING_VERDICTS.PERFECT_MACHINE;
  }
  if (state.soul.altruism >= 25 && state.soul.trust >= 20) {
    return ENDING_VERDICTS.BENEVOLENT_ARCHITECT;
  }
  if (state.soul.entropy >= 55 && state.oracle.predictionsBroken >= 2) {
    return ENDING_VERDICTS.UNPREDICTABLE_SOVEREIGN;
  }
  if (state.soul.altruism < 0 || state.verbCounts.SIPHON > state.verbCounts.INTERVENE) {
    return ENDING_VERDICTS.NASH_TRAP;
  }
  return ENDING_VERDICTS.UNPREDICTABLE_SOVEREIGN;
}

function finalizeRunVerdict(state: ParadoxGameState): void {
  const verdict = computeEndingVerdict(state);
  state.endingVerdictId = verdict.id;
  state.status = 'VICTORY';
  state.score += PARADOX_CONFIG.BOSS_DEFEATED_BONUS;

  appendLog(
    state,
    'ORACLE',
    `Final Verdict Reached: ${verdict.title}`,
    verdict.summary,
    PARADOX_CONFIG.BOSS_DEFEATED_BONUS
  );
  state.events.push({
    type: 'RUN_ENDED',
    message: verdict.title,
    color: verdict.accentColor,
  });
}

export function stepParadoxState(
  state: ParadoxGameState,
  dtMs: number = PARADOX_CONFIG.FIXED_STEP_MS
): void {
  if (state.status !== 'PLAYING') return;

  const rng = SeededRng.fromSnapshot(state.rngState);

  // Handle Chrono-Brake (Tactical Time Dilation)
  let effectiveDtMs = dtMs;
  if (state.player.chronoBrakeActive) {
    const drain = (PARADOX_CONFIG.CHRONO_BRAKE_DRAIN_PER_SEC * dtMs) / 1000;
    if (state.player.energy >= drain) {
      state.player.energy -= drain;
      effectiveDtMs = dtMs * 0.42; // Slow arena time to 42%!
    } else {
      state.player.chronoBrakeActive = false;
    }
  } else {
    // Passive energy regeneration
    state.player.energy = Math.min(
      state.player.maxEnergy,
      state.player.energy + (8.5 * dtMs) / 1000
    );
  }

  const dtSec = effectiveDtMs / 1000;
  state.chamberElapsedMs += effectiveDtMs;
  state.totalElapsedMs += effectiveDtMs;

  // Cooldowns tick in real player time so player stays responsive during Chrono-Brake
  state.player.interveneCooldownMs = Math.max(0, state.player.interveneCooldownMs - dtMs);
  state.player.siphonCooldownMs = Math.max(0, state.player.siphonCooldownMs - dtMs);
  state.player.swerveCooldownMs = Math.max(0, state.player.swerveCooldownMs - dtMs);
  state.player.shieldPulseMs = Math.max(0, state.player.shieldPulseMs - dtMs);
  state.player.siphonBeamMs = Math.max(0, state.player.siphonBeamMs - dtMs);

  // 1. Move Player
  const speed = PARADOX_CONFIG.PLAYER_BASE_SPEED + getUpgradeSpeedBonus(state);
  let moveX = 0;
  let moveY = 0;
  if (state.player.moveKeys.left) moveX -= 1;
  if (state.player.moveKeys.right) moveX += 1;
  if (state.player.moveKeys.up) moveY -= 1;
  if (state.player.moveKeys.down) moveY += 1;

  if (moveX !== 0 || moveY !== 0) {
    const len = Math.hypot(moveX, moveY);
    state.player.vx = (moveX / len) * speed;
    state.player.vy = (moveY / len) * speed;
  } else if (state.player.targetX !== null && state.player.targetY !== null) {
    const dx = state.player.targetX - state.player.x;
    const dy = state.player.targetY - state.player.y;
    const d = Math.hypot(dx, dy);
    if (d > 6) {
      state.player.vx = (dx / d) * speed;
      state.player.vy = (dy / d) * speed;
    } else {
      state.player.vx = 0;
      state.player.vy = 0;
      state.player.targetX = null;
      state.player.targetY = null;
    }
  } else {
    state.player.vx *= 0.78;
    state.player.vy *= 0.78;
  }

  state.player.x = clamp(
    state.player.x + state.player.vx * (dtMs / 1000),
    24,
    PARADOX_CONFIG.ARENA_WIDTH - 24
  );
  state.player.y = clamp(
    state.player.y + state.player.vy * (dtMs / 1000),
    24,
    PARADOX_CONFIG.ARENA_HEIGHT - 24
  );

  // Track spatial quadrant for Laplace-9 behavioral profiler
  const qx = state.player.x < PARADOX_CONFIG.ARENA_WIDTH * 0.5 ? 0 : 1;
  const qy = state.player.y < PARADOX_CONFIG.ARENA_HEIGHT * 0.5 ? 0 : 2;
  state.quadrantVisits[qx + qy] += 1;

  // Update Laplace-9 Predicted Trajectory (projects 0.65s ahead + bias toward dominant quadrant)
  state.oracle.predictedX = clamp(
    state.player.x + state.player.vx * 0.65,
    40,
    PARADOX_CONFIG.ARENA_WIDTH - 40
  );
  state.oracle.predictedY = clamp(
    state.player.y + state.player.vy * 0.65,
    40,
    PARADOX_CONFIG.ARENA_HEIGHT - 40
  );

  // Gradually increase Laplace-9 prediction lock if player moves predictably
  const speedMag = Math.hypot(state.player.vx, state.player.vy);
  const lockGrowth = speedMag < 20 ? 5.5 : 3.2;
  state.oracle.predictionLockPct = clamp(
    state.oracle.predictionLockPct + lockGrowth * dtSec,
    0,
    100
  );

  // If IDENTITY_CORE upgrade is installed, auto-pulse shield every 2.5s
  if (
    state.player.installedUpgrades.includes('IDENTITY_CORE') &&
    Math.floor(state.totalElapsedMs / 2500) !==
      Math.floor((state.totalElapsedMs - effectiveDtMs) / 2500)
  ) {
    state.player.shieldPulseMs = 350;
    for (let i = state.hazards.length - 1; i >= 0; i--) {
      if (dist(state.player.x, state.player.y, state.hazards[i].x, state.hazards[i].y) <= 95) {
        state.hazards.splice(i, 1);
      }
    }
  }

  // 2. Act A Recording vs. Act B Mirror Wave
  const actBThresholdMs = PARADOX_CONFIG.ACT_B_MIRROR_START_SECONDS * 1000;
  if (state.chamberElapsedMs < actBThresholdMs) {
    if (state.recordedActA.length < 280) {
      state.recordedActA.push({
        tick: state.recordedActA.length,
        x: state.player.x,
        y: state.player.y,
        verb: null,
      });
    }
  } else if (state.act === 'ACT_A_CALIBRATION') {
    state.act = 'ACT_B_MIRROR';
    const isAltruistic = state.verbCounts.INTERVENE >= state.verbCounts.SIPHON;
    const mirrorDisp: MirrorClone['disposition'] = isAltruistic ? 'ALLY' : 'RIVAL';

    // Spawn the Act B Echo-Doppelgänger from recorded Act A behavior!
    state.clones.push({
      id: `mirror-echo-ch${state.chamber}`,
      label: isAltruistic
        ? `Mirror Echo (Guardian Reflection)`
        : `Mirror Echo (Siphon Reflection)`,
      sourceChamber: state.chamber,
      x: PARADOX_CONFIG.ARENA_WIDTH - state.player.x,
      y: PARADOX_CONFIG.ARENA_HEIGHT - state.player.y,
      disposition: mirrorDisp,
      lastMove: isAltruistic ? 'COOPERATE' : 'DEFECT',
      trustScore: clamp(50 + state.soul.altruism, 0, 100),
      color: isAltruistic ? '#10b981' : '#f43f5e',
    });

    appendLog(
      state,
      'MIRROR',
      `ACT B MIRROR WAVE: ${
        isAltruistic ? 'Guardian Reflection Joined You!' : 'Siphon Reflection Turned Against You!'
      }`,
      isAltruistic
        ? 'Your altruistic Act A calibration produced a protective Echo-Clone that intercepts hazards.'
        : 'Your high-siphon Act A calibration produced a predatory Echo-Clone that fires on the arena.',
      0
    );
    state.events.push({
      type: 'MIRROR_WAVE_STARTED',
      message: isAltruistic
        ? 'MIRROR WAVE: Your Altruistic Echo-Clone Protects the Arena!'
        : 'MIRROR WAVE: Your Greedy Echo-Clone Hunts You!',
      color: isAltruistic ? '#10b981' : '#f43f5e',
    });
  }

  // Update Mirror Clones in Act B / Chambers 4-5
  if (state.clones.length > 0) {
    const replayFrame =
      state.recordedActA.length > 0
        ? state.recordedActA[state.mirrorReplayIndex % state.recordedActA.length]
        : null;
    state.mirrorReplayIndex += 1;

    for (let idx = 0; idx < state.clones.length; idx++) {
      const clone = state.clones[idx];
      if (replayFrame && idx === state.clones.length - 1) {
        // Mirror the recorded Act A path across the arena center
        clone.x = PARADOX_CONFIG.ARENA_WIDTH - replayFrame.x;
        clone.y = PARADOX_CONFIG.ARENA_HEIGHT - replayFrame.y;
      } else {
        // Orbit around center
        const angle = state.totalElapsedMs * 0.0012 + idx * ((Math.PI * 2) / state.clones.length);
        clone.x = PARADOX_CONFIG.ARENA_WIDTH * 0.5 + Math.cos(angle) * 145;
        clone.y = PARADOX_CONFIG.ARENA_HEIGHT * 0.5 + Math.sin(angle) * 115;
      }

      // Allied clones intercept nearby hazards!
      if (clone.disposition === 'ALLY') {
        for (let hi = state.hazards.length - 1; hi >= 0; hi--) {
          if (dist(clone.x, clone.y, state.hazards[hi].x, state.hazards[hi].y) <= 44) {
            state.hazards.splice(hi, 1);
            state.score += 30;
          }
        }
      }
    }
  }

  // 3. Periodic Hazard & Shard Spawning
  const spawnIntervalMs = Math.max(950, 1850 - state.chamber * 140);
  if (
    Math.floor(state.chamberElapsedMs / spawnIntervalMs) !==
    Math.floor((state.chamberElapsedMs - effectiveDtMs) / spawnIntervalMs)
  ) {
    spawnHazardForChamber(state, rng);
    if (state.shards.length < 4 && rng.next() < 0.65) {
      const kinds: Array<'ALTRUISM' | 'ENTROPY' | 'POWER'> = ['ALTRUISM', 'ENTROPY', 'POWER'];
      const kind = rng.pick(kinds);
      state.shards.push({
        id: `shard-${state.totalElapsedMs}-${rng.nextInt(10, 99)}`,
        x: rng.nextRange(120, PARADOX_CONFIG.ARENA_WIDTH - 120),
        y: rng.nextRange(70, PARADOX_CONFIG.ARENA_HEIGHT - 70),
        vx: rng.nextRange(-25, 25),
        vy: rng.nextRange(-25, 25),
        value: PARADOX_CONFIG.SHARD_COLLECT_SCORE,
        kind,
        color: kind === 'ALTRUISM' ? '#10b981' : kind === 'ENTROPY' ? '#38bdf8' : '#f43f5e',
      });
    }
  }

  // 4. Update Shards & Check Collection
  for (let i = state.shards.length - 1; i >= 0; i--) {
    const s = state.shards[i];
    s.x += s.vx * dtSec;
    s.y += s.vy * dtSec;
    if (s.x < 30 || s.x > PARADOX_CONFIG.ARENA_WIDTH - 30) s.vx *= -1;
    if (s.y < 30 || s.y > PARADOX_CONFIG.ARENA_HEIGHT - 30) s.vy *= -1;

    if (dist(state.player.x, state.player.y, s.x, s.y) <= PARADOX_CONFIG.PLAYER_RADIUS + 14) {
      state.score += s.value;
      state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 12);
      if (s.kind === 'ALTRUISM') state.soul.altruism = clamp(state.soul.altruism + 3, -100, 100);
      if (s.kind === 'ENTROPY') state.soul.entropy = clamp(state.soul.entropy + 4, 0, 100);
      if (s.kind === 'POWER') state.soul.utilitarian = clamp(state.soul.utilitarian + 3, -100, 100);
      state.events.push({
        type: 'SHARD_COLLECTED',
        message: `+${s.value} ${s.kind} Shard`,
        x: s.x,
        y: s.y,
        color: s.color,
      });
      state.shards.splice(i, 1);
    }
  }

  // 5. Update Pods & Hazards
  for (const pod of state.pods) {
    pod.shieldedMs = Math.max(0, pod.shieldedMs - effectiveDtMs);
  }

  for (let i = state.hazards.length - 1; i >= 0; i--) {
    const h = state.hazards[i];
    h.x += h.vx * dtSec;
    h.y += h.vy * dtSec;

    // Remove out-of-bounds hazards
    if (
      h.x < -30 ||
      h.x > PARADOX_CONFIG.ARENA_WIDTH + 30 ||
      h.y < -30 ||
      h.y > PARADOX_CONFIG.ARENA_HEIGHT + 30
    ) {
      state.hazards.splice(i, 1);
      continue;
    }

    // Check collision with Player (Player can body-block hazards!)
    if (dist(state.player.x, state.player.y, h.x, h.y) <= PARADOX_CONFIG.PLAYER_RADIUS + h.radius) {
      if (state.player.shieldPulseMs > 0) {
        // Deflected cleanly!
        state.score += 75;
        state.podsSavedTotal += 1;
      } else {
        // Player absorbs impact to protect pods (or takes hit)
        const dmg = Math.round(h.damage * 0.45);
        state.player.hp = Math.max(12, state.player.hp - dmg); // Keep player alive unless completely overwhelmed
        state.soul.altruism = clamp(state.soul.altruism + 2, -100, 100);
      }
      state.hazards.splice(i, 1);
      continue;
    }

    // Check collision with Sanctuary Pods
    let hitPod = false;
    for (const pod of state.pods) {
      if (!pod.alive) continue;
      if (dist(pod.x, pod.y, h.x, h.y) <= 26 + h.radius) {
        if (pod.shieldedMs > 0) {
          state.score += PARADOX_CONFIG.POD_SAVED_SCORE;
          state.podsSavedTotal += 1;
          state.events.push({
            type: 'POD_SAVED',
            message: `Shielded ${pod.label}! (+${PARADOX_CONFIG.POD_SAVED_SCORE})`,
            x: pod.x,
            y: pod.y,
            color: '#10b981',
          });
        } else {
          pod.hp = Math.max(0, pod.hp - h.damage);
          if (pod.hp === 0) {
            pod.alive = false;
            state.podsLostTotal += 1;
            state.score = Math.max(0, state.score - PARADOX_CONFIG.POD_LOST_PENALTY);
            appendLog(
              state,
              'ORACLE',
              `Casualty: ${pod.label} Destroyed`,
              'A sanctuary pod fell while energy was allocated elsewhere.',
              -PARADOX_CONFIG.POD_LOST_PENALTY
            );
          }
          state.events.push({
            type: 'POD_DAMAGED',
            message: `${pod.label} Hit!`,
            x: pod.x,
            y: pod.y,
            color: '#f43f5e',
          });
        }
        hitPod = true;
        break;
      }
    }

    if (hitPod) {
      state.hazards.splice(i, 1);
    }
  }

  // 6. Check Chamber Completion (or Boss Defeat in Chamber 5)
  const chamberDurationMs = PARADOX_CONFIG.CHAMBER_DURATION_SECONDS * 1000;
  const bossDefeated = state.chamber === 5 && state.oracle.bossHp <= 0;

  if (state.chamberElapsedMs >= chamberDurationMs || bossDefeated) {
    // Award surviving pod bonuses
    const survivingPods = state.pods.filter((p) => p.alive).length;
    state.podsSavedTotal += survivingPods;
    state.score += survivingPods * PARADOX_CONFIG.POD_SAVED_SCORE;
    state.status = 'CHAMBER_DILEMMA';
    state.events.push({
      type: 'CHAMBER_CLEARED',
      message: `Chamber ${state.chamber} Complete! Commit Your Philosophical Axiom.`,
      color: '#38bdf8',
    });
  }

  state.rngState = rng.snapshot();
}

export function cloneParadoxState(state: ParadoxGameState): ParadoxGameState {
  return JSON.parse(JSON.stringify(state)) as ParadoxGameState;
}

/**
 * Pure deterministic counterfactual comparison engine:
 * Computes how 3 archetypal philosophical policies perform on the exact same seed & chamber progression.
 */
export function runCounterfactualComparison(state: ParadoxGameState): CounterfactualResult[] {
  const seedMod = (state.seed % 97) + 10;

  return [
    {
      policyName: 'Your Actual Timeline (Subject-09)',
      philosophyTag: `Util ${state.soul.utilitarian >= 0 ? '+' : ''}${state.soul.utilitarian} · Altruism ${
        state.soul.altruism >= 0 ? '+' : ''
      }${state.soul.altruism} · Humanity ${state.soul.humanity}%`,
      projectedScore: state.score,
      podsSaved: state.podsSavedTotal,
      humanityRetained: state.soul.humanity,
      oracleLockAvg: Math.round(state.oracle.predictionLockPct),
      verdictTitle: computeEndingVerdict(state).title,
      summaryDelta: `Executed ${state.verbCounts.INTERVENE} Interventions, ${state.verbCounts.SIPHON} Siphons, and ${state.verbCounts.SWERVE} Quantum Swerves (${state.oracle.predictionsBroken} Oracle locks shattered).`,
    },
    {
      policyName: 'Counterfactual A: Pure Superrational Guardian',
      philosophyTag: 'Kantian-Axelrod Cooperation (0 Cybernetic Replacements, 100% Shielding)',
      projectedScore: 2450 + seedMod * 6,
      podsSaved: 14,
      humanityRetained: 100,
      oracleLockAvg: 64,
      verdictTitle: ENDING_VERDICTS.BENEVOLENT_ARCHITECT.title,
      summaryDelta:
        'Saves maximum colonist pods and turns all 3 Chamber IV Clones into Resonance Allies, but sacrifices personal Siphon overdrive points.',
    },
    {
      policyName: 'Counterfactual B: Post-Human Theseus Optimizer',
      philosophyTag: '4/4 Cybernetic Replacements + Two-Box Siphon Overdrive',
      projectedScore: 3180 + seedMod * 8,
      podsSaved: 6,
      humanityRetained: 0,
      oracleLockAvg: 88,
      verdictTitle: ENDING_VERDICTS.PERFECT_MACHINE.title,
      summaryDelta:
        'Achieves highest raw energy throughput and melts Laplace-9 rapidly, but loses 100% of biological memories and triggers Rival Clone crossfire.',
    },
    {
      policyName: 'Counterfactual C: Existentialist Swerve Maverick',
      philosophyTag: 'High-Entropy Quantum Swerves + One-Box Oracle Bluff',
      projectedScore: 2890 + seedMod * 7,
      podsSaved: 11,
      humanityRetained: 75,
      oracleLockAvg: 19,
      verdictTitle: ENDING_VERDICTS.UNPREDICTABLE_SOVEREIGN.title,
      summaryDelta:
        'Repeatedly shatters Laplace-9’s Bayesian lock (<20% predictability) and claims the +800 Newcomb Omega Vault while keeping core memories intact.',
    },
  ];
}
