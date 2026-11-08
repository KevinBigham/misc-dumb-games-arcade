import {
  CONFIG,
  FlowDirectionConstraint,
  GridCoord,
  LinkStatus,
  LinkType,
  coordKey,
  makeEdgeId,
} from './config.ts';
import { createSeededRng } from './rng.ts';

export type StormSeverity = 'wind' | 'lightning';

export interface StormStrike {
  turn: number; // 1..12
  edgeId: string;
  severity: StormSeverity;
  label: string;
}

export interface DistrictSpec {
  id: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
  name: string;
  shortCode: string;
  priority: 1 | 2 | 3 | 4 | 5;
  row: number;
  col: number;
  demandCurve: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  unmetLimitMW: number;
}

export interface RelaySpec {
  id: string;
  name: string;
  row: number;
  col: number;
}

export interface InitialLinkSpec {
  from: GridCoord;
  to: GridCoord;
  type: LinkType;
  status?: LinkStatus;
  directionConstraint?: FlowDirectionConstraint;
}

export interface ScenarioSpec {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  briefing: string;
  onboardingHintTurn1: string;
  onboardingHintTurn2: string;
  generator: {
    row: number;
    col: number;
    outputMW: number;
    name: string;
  };
  startingMaterials: number;
  cityOutageThresholdMW: number;
  relays: readonly RelaySpec[];
  blockedCells: readonly GridCoord[];
  districts: readonly [DistrictSpec, DistrictSpec, DistrictSpec, DistrictSpec, DistrictSpec];
  initialLinks: readonly InitialLinkSpec[];
  stormStrikes: readonly StormStrike[];
  isSeeded?: boolean;
  seed?: number;
}

export const SCENARIO_1_HARBOR_SQUALL: ScenarioSpec = {
  id: 'harbor-squall',
  number: 1,
  title: 'Scenario 1: Harbor Squall',
  subtitle: 'Coastal Gale & Arterial Bottleneck',
  briefing:
    'A coastal squall approaches Port Argon. On Turn 1, link St. Jude Hospital (D1) and Harbor Waterworks (D2) into Substation Alpha. On Turn 2, their combined 6 MW surge will exceed a single 4 MW Standard Line — forcing a choice between a Heavy Trunk upgrade or a Redundant Storm Loop.',
  onboardingHintTurn1:
    'TURN 1 DISPATCH ORDER: Place a Standard Line on (3,2)↔(3,3) to power D1 (St. Jude Hospital) and a second Standard Line on (3,3)↔(3,4) to reach D2 (Harbor Waterworks), then click Commit Turn.',
  onboardingHintTurn2:
    'TURN 2 BOTTLENECK ALERT: D1 (3 MW) + D2 (3 MW) = 6 MW, saturating (3,2)↔(3,3) at 4/4 MW! Either UPGRADE (3,2)↔(3,3) to a Heavy Trunk (8 MW) OR build a Redundant Loop at (3,4)↔(4,4) from the South corridor. Also connect D5 at (2,5)↔(2,6) before Turn 3!',
  generator: {
    row: 3,
    col: 1,
    outputMW: 26,
    name: 'Central Harbor Turbine',
  },
  startingMaterials: 65,
  cityOutageThresholdMW: 12,
  relays: [
    { id: 'R1', name: 'Substation Alpha', row: 3, col: 2 },
    { id: 'R2', name: 'Substation North', row: 1, col: 3 },
    { id: 'R3', name: 'Substation South', row: 5, col: 3 },
  ],
  blockedCells: [
    { row: 6, col: 6 },
    { row: 6, col: 7 },
    { row: 7, col: 6 },
    { row: 7, col: 7 },
  ],
  districts: [
    {
      id: 'D1',
      name: 'St. Jude Hospital',
      shortCode: 'HOSP',
      priority: 1,
      row: 3,
      col: 3,
      demandCurve: [2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],
      unmetLimitMW: 4,
    },
    {
      id: 'D2',
      name: 'Harbor Waterworks',
      shortCode: 'WATR',
      priority: 2,
      row: 3,
      col: 5,
      demandCurve: [2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
      unmetLimitMW: 5,
    },
    {
      id: 'D3',
      name: 'Midtown Transit',
      shortCode: 'TRAN',
      priority: 3,
      row: 1,
      col: 4,
      demandCurve: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
      unmetLimitMW: 6,
    },
    {
      id: 'D4',
      name: 'Dockyard Cold Storage',
      shortCode: 'DOCK',
      priority: 4,
      row: 5,
      col: 4,
      demandCurve: [2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5],
      unmetLimitMW: 6,
    },
    {
      id: 'D5',
      name: 'Northside Residential',
      shortCode: 'NRTH',
      priority: 5,
      row: 2,
      col: 6,
      demandCurve: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
      unmetLimitMW: 7,
    },
  ],
  initialLinks: [
    // Central stub
    { from: { row: 3, col: 1 }, to: { row: 3, col: 2 }, type: 'heavy' },
    { from: { row: 3, col: 4 }, to: { row: 3, col: 5 }, type: 'standard' },
    // North feeder
    { from: { row: 3, col: 1 }, to: { row: 2, col: 1 }, type: 'heavy' },
    { from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, type: 'heavy' },
    { from: { row: 1, col: 1 }, to: { row: 1, col: 2 }, type: 'heavy' },
    { from: { row: 1, col: 2 }, to: { row: 1, col: 3 }, type: 'heavy' },
    { from: { row: 1, col: 3 }, to: { row: 1, col: 4 }, type: 'standard' },
    { from: { row: 1, col: 4 }, to: { row: 2, col: 4 }, type: 'standard' },
    { from: { row: 2, col: 4 }, to: { row: 2, col: 5 }, type: 'standard' },
    // South feeder + Relay South junction stub
    { from: { row: 3, col: 1 }, to: { row: 4, col: 1 }, type: 'heavy' },
    { from: { row: 4, col: 1 }, to: { row: 5, col: 1 }, type: 'heavy' },
    { from: { row: 5, col: 1 }, to: { row: 5, col: 2 }, type: 'heavy' },
    { from: { row: 5, col: 2 }, to: { row: 5, col: 3 }, type: 'heavy' },
    { from: { row: 5, col: 3 }, to: { row: 5, col: 4 }, type: 'standard' },
    { from: { row: 5, col: 3 }, to: { row: 4, col: 3 }, type: 'heavy' },
    { from: { row: 5, col: 4 }, to: { row: 4, col: 4 }, type: 'standard' },
  ],
  stormStrikes: [
    {
      turn: 4,
      edgeId: makeEdgeId({ row: 3, col: 3 }, { row: 3, col: 4 }),
      severity: 'wind',
      label: 'Squall Line Gust (Central Spine)',
    },
    {
      turn: 6,
      edgeId: makeEdgeId({ row: 2, col: 4 }, { row: 2, col: 5 }),
      severity: 'wind',
      label: 'Northbay Crosswind (East Spur)',
    },
    {
      turn: 8,
      edgeId: makeEdgeId({ row: 5, col: 3 }, { row: 5, col: 4 }),
      severity: 'wind',
      label: 'Breakwater Gale (South Dock Feeder)',
    },
    {
      turn: 10,
      edgeId: makeEdgeId({ row: 1, col: 4 }, { row: 2, col: 4 }),
      severity: 'wind',
      label: 'Midtown Shear Gust (North-East Tie)',
    },
    {
      turn: 12,
      edgeId: makeEdgeId({ row: 4, col: 4 }, { row: 5, col: 4 }),
      severity: 'wind',
      label: 'Eye-Wall Tail Gust (South Tie)',
    },
  ],
};

export const SCENARIO_2_TWIN_RIDGE_GALE: ScenarioSpec = {
  id: 'twin-ridge-gale',
  number: 2,
  title: 'Scenario 2: Twin Ridge Gale',
  subtitle: 'Mountain Pass Choke Points & Dual-Front Winds',
  briefing:
    'Basalt ridges split the grid down Column 3, leaving only three narrow mountain passes at (1,3), (4,3), and (6,3). Dual-front ridge gales batter exposed lines starting Turn 3. Balance pass upgrades with eastern valley tie-lines.',
  onboardingHintTurn1:
    'TURN 1 DISPATCH ORDER: Link Central Pass (4,3)↔(4,4) to energize Metro Hospital (D1) and (4,4)↔(4,5) to reach Valley Foundry (D4).',
  onboardingHintTurn2:
    'TURN 2 DISPATCH ORDER: Upgrade Central Pass or cross-tie the North Pass at (1,4)↔(2,4) before Turn 3 ridge gusts strike.',
  generator: {
    row: 4,
    col: 0,
    outputMW: 28,
    name: 'West Dam Hydro Plant',
  },
  startingMaterials: 75,
  cityOutageThresholdMW: 14,
  relays: [
    { id: 'R1', name: 'North Pass Relay', row: 1, col: 3 },
    { id: 'R2', name: 'Central Pass Relay', row: 4, col: 3 },
    { id: 'R3', name: 'South Pass Relay', row: 6, col: 3 },
  ],
  blockedCells: [
    { row: 0, col: 3 },
    { row: 2, col: 3 },
    { row: 3, col: 3 },
    { row: 5, col: 3 },
    { row: 7, col: 3 },
  ],
  districts: [
    {
      id: 'D1',
      name: 'Metro General Hospital',
      shortCode: 'MHOS',
      priority: 1,
      row: 4,
      col: 4,
      demandCurve: [2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5],
      unmetLimitMW: 4,
    },
    {
      id: 'D2',
      name: 'Ridge Telecom Hub',
      shortCode: 'TCOM',
      priority: 2,
      row: 1,
      col: 5,
      demandCurve: [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5],
      unmetLimitMW: 5,
    },
    {
      id: 'D3',
      name: 'Eastport Flood Locks',
      shortCode: 'LOCK',
      priority: 3,
      row: 6,
      col: 5,
      demandCurve: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5],
      unmetLimitMW: 6,
    },
    {
      id: 'D4',
      name: 'Valley Alloy Foundry',
      shortCode: 'FNDR',
      priority: 4,
      row: 4,
      col: 6,
      demandCurve: [2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5],
      unmetLimitMW: 6,
    },
    {
      id: 'D5',
      name: 'Bayview Highrises',
      shortCode: 'BAYV',
      priority: 5,
      row: 2,
      col: 6,
      demandCurve: [0, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4],
      unmetLimitMW: 7,
    },
  ],
  initialLinks: [
    // Central pass feeder
    { from: { row: 4, col: 0 }, to: { row: 4, col: 1 }, type: 'heavy' },
    { from: { row: 4, col: 1 }, to: { row: 4, col: 2 }, type: 'heavy' },
    { from: { row: 4, col: 2 }, to: { row: 4, col: 3 }, type: 'heavy' },
    { from: { row: 4, col: 5 }, to: { row: 4, col: 6 }, type: 'standard' },
    // North pass feeder
    { from: { row: 4, col: 1 }, to: { row: 3, col: 1 }, type: 'heavy' },
    { from: { row: 3, col: 1 }, to: { row: 2, col: 1 }, type: 'heavy' },
    { from: { row: 2, col: 1 }, to: { row: 1, col: 1 }, type: 'heavy' },
    { from: { row: 1, col: 1 }, to: { row: 1, col: 2 }, type: 'heavy' },
    { from: { row: 1, col: 2 }, to: { row: 1, col: 3 }, type: 'heavy' },
    { from: { row: 1, col: 3 }, to: { row: 1, col: 4 }, type: 'standard' },
    { from: { row: 1, col: 4 }, to: { row: 1, col: 5 }, type: 'standard' },
    { from: { row: 1, col: 5 }, to: { row: 2, col: 5 }, type: 'standard' },
    // South pass feeder
    { from: { row: 4, col: 1 }, to: { row: 5, col: 1 }, type: 'heavy' },
    { from: { row: 5, col: 1 }, to: { row: 6, col: 1 }, type: 'heavy' },
    { from: { row: 6, col: 1 }, to: { row: 6, col: 2 }, type: 'heavy' },
    { from: { row: 6, col: 2 }, to: { row: 6, col: 3 }, type: 'heavy' },
    { from: { row: 6, col: 3 }, to: { row: 6, col: 4 }, type: 'standard' },
    { from: { row: 6, col: 4 }, to: { row: 6, col: 5 }, type: 'standard' },
    { from: { row: 6, col: 5 }, to: { row: 5, col: 5 }, type: 'standard' },
  ],
  stormStrikes: [
    {
      turn: 3,
      edgeId: makeEdgeId({ row: 1, col: 4 }, { row: 1, col: 5 }),
      severity: 'wind',
      label: 'North Ridge Downdraft',
    },
    {
      turn: 5,
      edgeId: makeEdgeId({ row: 4, col: 4 }, { row: 4, col: 5 }),
      severity: 'wind',
      label: 'Canyon Venturi Gust',
    },
    {
      turn: 7,
      edgeId: makeEdgeId({ row: 6, col: 4 }, { row: 6, col: 5 }),
      severity: 'wind',
      label: 'South Pass Gale',
    },
    {
      turn: 9,
      edgeId: makeEdgeId({ row: 1, col: 5 }, { row: 2, col: 5 }),
      severity: 'wind',
      label: 'Upper Valley Crosswind',
    },
    {
      turn: 11,
      edgeId: makeEdgeId({ row: 4, col: 5 }, { row: 4, col: 6 }),
      severity: 'wind',
      label: 'Foundry Basin Squall',
    },
  ],
};

export const SCENARIO_3_CAT4_SUPERCELL: ScenarioSpec = {
  id: 'cat4-supercell',
  number: 3,
  title: 'Scenario 3: Category-4 Supercell',
  subtitle: 'Metropolitan Core & Lightning Arc Strikes',
  briefing:
    'A Category-4 Supercell passes directly over the central metropolitan hub. Standard Wind gusts are joined by high-voltage Supercell Lightning strikes on Turns 6 and 10 that penetrate even Storm-Shielded Conduits — making redundant rings or rapid repair essential.',
  onboardingHintTurn1:
    'TURN 1 DISPATCH ORDER: Connect Trauma Center (D1) at (3,4)↔(3,5) and Floodgate Array (D2) at (4,3)↔(5,3).',
  onboardingHintTurn2:
    'TURN 2 DISPATCH ORDER: Expand ring ties toward Civic Shelter (D5) at (5,5) and reinforce radial trunks.',
  generator: {
    row: 3,
    col: 3,
    outputMW: 30,
    name: 'Metro Core Reactor',
  },
  startingMaterials: 80,
  cityOutageThresholdMW: 14,
  relays: [
    { id: 'R1', name: 'East Ring Relay', row: 3, col: 4 },
    { id: 'R2', name: 'South Ring Relay', row: 4, col: 3 },
    { id: 'R3', name: 'North Ring Relay', row: 2, col: 3 },
    { id: 'R4', name: 'West Ring Relay', row: 3, col: 2 },
  ],
  blockedCells: [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 },
  ],
  districts: [
    {
      id: 'D1',
      name: 'Central Trauma Center',
      shortCode: 'TRMA',
      priority: 1,
      row: 3,
      col: 5,
      demandCurve: [3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5],
      unmetLimitMW: 4,
    },
    {
      id: 'D2',
      name: 'Seawall Floodgates',
      shortCode: 'FLOD',
      priority: 2,
      row: 5,
      col: 3,
      demandCurve: [2, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5],
      unmetLimitMW: 5,
    },
    {
      id: 'D3',
      name: 'North Rail Command',
      shortCode: 'RAIL',
      priority: 3,
      row: 1,
      col: 3,
      demandCurve: [2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
      unmetLimitMW: 6,
    },
    {
      id: 'D4',
      name: 'West Data Exchange',
      shortCode: 'DATA',
      priority: 4,
      row: 3,
      col: 1,
      demandCurve: [2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5],
      unmetLimitMW: 6,
    },
    {
      id: 'D5',
      name: 'Southeast Civic Shelter',
      shortCode: 'SHLT',
      priority: 5,
      row: 5,
      col: 5,
      demandCurve: [0, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5],
      unmetLimitMW: 7,
    },
  ],
  initialLinks: [
    // 4 inner ring relays around (3,3)
    { from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, type: 'heavy' },
    { from: { row: 3, col: 3 }, to: { row: 4, col: 3 }, type: 'heavy' },
    { from: { row: 3, col: 3 }, to: { row: 2, col: 3 }, type: 'heavy' },
    { from: { row: 3, col: 3 }, to: { row: 3, col: 2 }, type: 'heavy' },
    // North and West already linked with standard lines
    { from: { row: 2, col: 3 }, to: { row: 1, col: 3 }, type: 'standard' },
    { from: { row: 3, col: 2 }, to: { row: 3, col: 1 }, type: 'standard' },
    // Southeast partial ring stubs
    { from: { row: 3, col: 5 }, to: { row: 4, col: 5 }, type: 'standard' },
    { from: { row: 5, col: 3 }, to: { row: 5, col: 4 }, type: 'standard' },
    { from: { row: 4, col: 4 }, to: { row: 3, col: 4 }, type: 'standard' },
    { from: { row: 4, col: 4 }, to: { row: 4, col: 3 }, type: 'standard' },
  ],
  stormStrikes: [
    {
      turn: 3,
      edgeId: makeEdgeId({ row: 2, col: 3 }, { row: 1, col: 3 }),
      severity: 'wind',
      label: 'Outer Band Gust (North Feeder)',
    },
    {
      turn: 5,
      edgeId: makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 1 }),
      severity: 'wind',
      label: 'Western Shear Gust (West Feeder)',
    },
    {
      turn: 6,
      edgeId: makeEdgeId({ row: 3, col: 4 }, { row: 3, col: 5 }),
      severity: 'lightning',
      label: 'Supercell Core Lightning (Bypasses Shielding)',
    },
    {
      turn: 8,
      edgeId: makeEdgeId({ row: 4, col: 3 }, { row: 5, col: 3 }),
      severity: 'wind',
      label: 'South Seawall Gale',
    },
    {
      turn: 10,
      edgeId: makeEdgeId({ row: 4, col: 5 }, { row: 5, col: 5 }),
      severity: 'lightning',
      label: 'Mesocyclone Arc Strike (Bypasses Shielding)',
    },
    {
      turn: 12,
      edgeId: makeEdgeId({ row: 5, col: 3 }, { row: 5, col: 4 }),
      severity: 'wind',
      label: 'Trailing Eyewall Gust',
    },
  ],
};

export const HANDCRAFTED_SCENARIOS: readonly ScenarioSpec[] = [
  SCENARIO_1_HARBOR_SQUALL,
  SCENARIO_2_TWIN_RIDGE_GALE,
  SCENARIO_3_CAT4_SUPERCELL,
];

export function generateSeededScenario(seed: number): ScenarioSpec {
  const rng = createSeededRng(seed);
  const base = SCENARIO_1_HARBOR_SQUALL;

  const candidateTargetEdges = [
    makeEdgeId({ row: 3, col: 3 }, { row: 3, col: 4 }),
    makeEdgeId({ row: 2, col: 4 }, { row: 2, col: 5 }),
    makeEdgeId({ row: 5, col: 3 }, { row: 5, col: 4 }),
    makeEdgeId({ row: 1, col: 4 }, { row: 2, col: 4 }),
    makeEdgeId({ row: 4, col: 4 }, { row: 5, col: 4 }),
    makeEdgeId({ row: 3, col: 4 }, { row: 3, col: 5 }),
    makeEdgeId({ row: 1, col: 3 }, { row: 1, col: 4 }),
  ];

  const shuffledEdges = rng.shuffle(candidateTargetEdges);
  const strikeTurns = [4, 6, 8, 10, 12];
  const gustNames = [
    'Seeded Squall Front',
    'Barometric Shear Gust',
    'Harbor Vortex Line',
    'Coastal Microburst',
    'Cyclonic Tail Gust',
  ];

  const stormStrikes: StormStrike[] = strikeTurns.map((turn, idx) => ({
    turn,
    edgeId: shuffledEdges[idx % shuffledEdges.length],
    severity: 'wind',
    label: `${gustNames[idx]} (#${rng.nextInt(10, 99)})`,
  }));

  const districts = base.districts.map((d) => {
    // Keep Turns 1-3 identical for clean onboarding, vary late turns deterministically within safe bounds
    const curve = d.demandCurve.map((val, turnIdx) => {
      if (turnIdx < 3) return val;
      const delta = rng.nextInt(-1, 1);
      return Math.max(2, Math.min(4, val + delta));
    }) as unknown as DistrictSpec['demandCurve'];
    return {
      ...d,
      demandCurve: curve,
    };
  }) as unknown as ScenarioSpec['districts'];

  return {
    ...base,
    id: `seeded-${rng.seed}`,
    number: 4,
    title: `Seeded Storm #${rng.seed}`,
    subtitle: 'Deterministic Procedural Weather Pattern',
    briefing: `Seeded Storm Dispatch (Seed: ${rng.seed}). All storm strikes and district demand fluctuations are 100% deterministic for this seed.`,
    districts,
    stormStrikes,
    isSeeded: true,
    seed: rng.seed,
  };
}

export function getScenarioById(id: string, seed: number = CONFIG.DEFAULT_SEED): ScenarioSpec {
  if (id === 'seeded' || id.startsWith('seeded-')) {
    const parsedSeed = id.startsWith('seeded-') ? Number(id.slice('seeded-'.length)) || seed : seed;
    return generateSeededScenario(parsedSeed);
  }
  return HANDCRAFTED_SCENARIOS.find((s) => s.id === id) ?? SCENARIO_1_HARBOR_SQUALL;
}

export function isBlockedCoord(scenario: ScenarioSpec, coord: GridCoord): boolean {
  const key = coordKey(coord.row, coord.col);
  return scenario.blockedCells.some((b) => coordKey(b.row, b.col) === key);
}
