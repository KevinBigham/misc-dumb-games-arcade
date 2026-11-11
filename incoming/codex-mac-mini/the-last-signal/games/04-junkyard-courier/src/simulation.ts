import { GAME_CONFIG, LOADOUT_PRESETS, LoadoutPresetId } from './config.ts';
import {
  ARCHIPELAGO_EDGES,
  ARCHIPELAGO_NODES,
  BOAT_MODULES,
  CONTRACT_TEMPLATES,
  ContractTypeId,
  getModuleById,
  getNodeById,
  HAZARDS,
  HazardChoicePreview,
  HazardTypeId,
  ModuleId,
} from './content.ts';
import { SeededRng } from './rng.ts';

export type ContractStatus = 'OFFERED' | 'ACCEPTED' | 'DELIVERED' | 'FAILED';

export interface ContractInstance {
  id: string;
  templateId: ContractTypeId;
  categoryName: string;
  cargoName: string;
  originNodeId: string;
  destinationNodeId: string;
  cargoSlots: number;
  basePayout: number;
  accumulatedPenalty: number;
  fragile: boolean;
  bulky: boolean;
  urgentMaxHops: number | null;
  hopsTaken: number;
  status: ContractStatus;
  paidOut: boolean;
  description: string;
}

export interface EdgeRuntimeState {
  id: string;
  from: string;
  to: string;
  baseFuelCost: number;
  hazardId: HazardTypeId;
  channelType: 'OUTER_SAFE' | 'INNER_SHORTCUT' | 'CROSS_LINK';
  timesTraversed: number;
  lastResolvedChoice: HazardChoicePreview['id'] | null;
}

export interface PendingEncounterState {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  baseFuelPaid: number;
  hazardId: HazardTypeId;
}

export interface FailureDiagnostic {
  cause: 'HULL_ZERO' | 'FUEL_STRANDED';
  title: string;
  summary: string;
  mistakeCategory: 'UNCOUNTERED_HAZARD' | 'SKIPPED_REPAIR' | 'FUEL_MISCALCULATION' | 'OVERLOADED_DETOUR';
  failedNodeId: string;
  lastEdgeId: string | null;
  lastHazardId: HazardTypeId | null;
  recommendation: string;
}

export interface HoldSlotBreakdown {
  cargoSlots: number;
  moduleSlots: number;
  fuelDrumSlots: number;
  repairKitSlots: number;
  usedSlots: number;
  maxSlots: number;
  freeSlots: number;
}

export interface LoadoutValidationResult {
  valid: boolean;
  usedSlots: number;
  maxSlots: number;
  breakdown: HoldSlotBreakdown;
  reason?: string;
}

export interface VoyageLogEntry {
  turn: number;
  nodeId: string;
  edgeId: string | null;
  hazardId: HazardTypeId | null;
  choiceId: HazardChoicePreview['id'] | null;
  fuelDelta: number;
  hullDelta: number;
  creditsDelta: number;
  message: string;
}

export interface RunState {
  version: number;
  seed: number;
  rngState: number;
  turn: number;
  runStatus: 'IN_PROGRESS' | 'VICTORY' | 'LOSS';
  currentNodeId: string;
  hull: number;
  maxHull: number;
  fuel: number;
  maxFuel: number;
  credits: number;
  fuelDrums: number;
  repairKits: number;
  maxHoldSlots: number;
  installedModules: ModuleId[];
  contracts: ContractInstance[];
  deliveredContractIds: string[];
  deliveriesCompleted: number;
  edges: EdgeRuntimeState[];
  pendingEncounter: PendingEncounterState | null;
  pendingUpgradeChoices: ModuleId[];
  selectedNodeId: string | null;
  failureDiagnostic: FailureDiagnostic | null;
  log: VoyageLogEntry[];
  nextContractSeq: number;
}

export interface RouteEvaluation {
  pathNodeIds: string[];
  edgeIds: string[];
  totalBaseFuel: number;
  expectedExtraFuel: number;
  totalExpectedFuel: number;
  expectedHullDamage: number;
  expectedCargoPenalty: number;
  expectedScrapBonus: number;
  score: number;
}

export function computeHoldSlotBreakdown(params: {
  installedModules: readonly ModuleId[];
  acceptedContracts: readonly Pick<ContractInstance, 'cargoSlots'>[];
  fuelDrums: number;
  repairKits: number;
  maxHoldSlots?: number;
}): HoldSlotBreakdown {
  const maxSlots = params.maxHoldSlots ?? GAME_CONFIG.maxHoldSlots;
  const cargoSlots = params.acceptedContracts.reduce((sum, c) => sum + Math.max(0, c.cargoSlots), 0);
  const moduleSlots = params.installedModules.reduce((sum, modId) => sum + getModuleById(modId).slotCost, 0);
  const fuelDrumSlots = Math.max(0, params.fuelDrums);
  const repairKitSlots = Math.max(0, params.repairKits);
  const usedSlots = cargoSlots + moduleSlots + fuelDrumSlots + repairKitSlots;
  return {
    cargoSlots,
    moduleSlots,
    fuelDrumSlots,
    repairKitSlots,
    usedSlots,
    maxSlots,
    freeSlots: maxSlots - usedSlots,
  };
}

export function validateLoadout(params: {
  installedModules: readonly ModuleId[];
  acceptedContracts: readonly Pick<ContractInstance, 'cargoSlots'>[];
  fuelDrums: number;
  repairKits: number;
  maxHoldSlots?: number;
}): LoadoutValidationResult {
  if (params.fuelDrums < 0 || params.repairKits < 0) {
    const breakdown = computeHoldSlotBreakdown(params);
    return {
      valid: false,
      usedSlots: breakdown.usedSlots,
      maxSlots: breakdown.maxSlots,
      breakdown,
      reason: 'Supply counts cannot be negative.',
    };
  }
  const breakdown = computeHoldSlotBreakdown(params);
  if (breakdown.usedSlots > breakdown.maxSlots) {
    return {
      valid: false,
      usedSlots: breakdown.usedSlots,
      maxSlots: breakdown.maxSlots,
      breakdown,
      reason: `Hold capacity exceeded: requires ${breakdown.usedSlots}/${breakdown.maxSlots} Hold Slots (Cargo ${breakdown.cargoSlots} + Modules ${breakdown.moduleSlots} + Drums ${breakdown.fuelDrumSlots} + Kits ${breakdown.repairKitSlots}).`,
    };
  }
  return {
    valid: true,
    usedSlots: breakdown.usedSlots,
    maxSlots: breakdown.maxSlots,
    breakdown,
  };
}

export function validateStateHoldCapacity(state: RunState): LoadoutValidationResult {
  const accepted = state.contracts.filter((c) => c.status === 'ACCEPTED');
  return validateLoadout({
    installedModules: state.installedModules,
    acceptedContracts: accepted,
    fuelDrums: state.fuelDrums,
    repairKits: state.repairKits,
    maxHoldSlots: state.maxHoldSlots,
  });
}

export function getMaxFuelForModules(installedModules: readonly ModuleId[]): number {
  const hasAux = installedModules.includes('mod-aux-tank');
  return GAME_CONFIG.baseMaxFuel + (hasAux ? GAME_CONFIG.auxTankFuelBonus : 0);
}

export function buildSeededArchipelagoEdges(rng: SeededRng): EdgeRuntimeState[] {
  const outerPool: HazardTypeId[] = ['silt_fogbank', 'rogue_wake'];
  const innerShortcutPool: HazardTypeId[] = [
    'scrap_reef',
    'cross_current_riptide',
    'acid_squall',
    'floating_minefield',
  ];

  return ARCHIPELAGO_EDGES.map((edgeDef) => {
    let hazardId: HazardTypeId = edgeDef.defaultHazard;
    // Keep critical opening routes consistent and readable while applying deterministic seeded variation on deeper links
    const lockedOpeningEdges = new Set([
      'edge-01-02',
      'edge-02-05',
      'edge-01-04',
      'edge-04-07',
      'edge-01-03',
      'edge-03-05',
      'edge-03-06',
      'edge-03-07',
    ]);
    if (!lockedOpeningEdges.has(edgeDef.id)) {
      if (edgeDef.channelType === 'OUTER_SAFE') {
        hazardId = rng.pick(outerPool);
      } else if (edgeDef.channelType === 'INNER_SHORTCUT') {
        // Keep default hazard 65% of the time so map identity stays strong
        if (rng.next() > 0.65) {
          hazardId = rng.pick(innerShortcutPool);
        }
      }
    }
    return {
      id: edgeDef.id,
      from: edgeDef.from,
      to: edgeDef.to,
      baseFuelCost: edgeDef.baseFuelCost,
      hazardId,
      channelType: edgeDef.channelType,
      timesTraversed: 0,
      lastResolvedChoice: null,
    };
  });
}

export function getConnectedEdges(state: RunState, nodeId: string): EdgeRuntimeState[] {
  return state.edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

export function getEdgeBetween(state: RunState, nodeA: string, nodeB: string): EdgeRuntimeState | undefined {
  return state.edges.find(
    (e) => (e.from === nodeA && e.to === nodeB) || (e.from === nodeB && e.to === nodeA),
  );
}

export function getNeighborNodeId(edge: EdgeRuntimeState, currentNodeId: string): string {
  return edge.from === currentNodeId ? edge.to : edge.from;
}

function createContractInstance(
  seq: number,
  templateId: ContractTypeId,
  originNodeId: string,
  destinationNodeId: string,
  payoutBonus = 0,
): ContractInstance {
  const tpl = CONTRACT_TEMPLATES.find((t) => t.id === templateId)!;
  return {
    id: `contract-${seq}`,
    templateId: tpl.id,
    categoryName: tpl.categoryName,
    cargoName: tpl.cargoName,
    originNodeId,
    destinationNodeId,
    cargoSlots: tpl.cargoSlots,
    basePayout: tpl.basePayout + payoutBonus,
    accumulatedPenalty: 0,
    fragile: tpl.fragile,
    bulky: tpl.bulky,
    urgentMaxHops: tpl.urgentMaxHops,
    hopsTaken: 0,
    status: 'OFFERED',
    paidOut: false,
    description: tpl.description,
  };
}

export function computeHopDistances(state: RunState, startNodeId: string): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(startNodeId, 0);
  const queue: string[] = [startNodeId];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currDist = dist.get(curr)!;
    for (const edge of getConnectedEdges(state, curr)) {
      const next = getNeighborNodeId(edge, curr);
      if (!dist.has(next)) {
        dist.set(next, currDist + 1);
        queue.push(next);
      }
    }
  }
  return dist;
}

export function ensurePortContractOffers(state: RunState): void {
  const currentOffers = state.contracts.filter(
    (c) => c.status === 'OFFERED' && c.originNodeId === state.currentNodeId,
  );
  if (currentOffers.length >= GAME_CONFIG.offersPerPort) {
    return;
  }

  const rng = new SeededRng(state.rngState);
  const hopMap = computeHopDistances(state, state.currentNodeId);
  const candidateTargets = ARCHIPELAGO_NODES.filter((n) => {
    const d = hopMap.get(n.id) ?? 0;
    return n.id !== state.currentNodeId && d >= 2 && d <= 3;
  });
  const fallbackTargets = ARCHIPELAGO_NODES.filter((n) => n.id !== state.currentNodeId);
  const pool = candidateTargets.length > 0 ? candidateTargets : fallbackTargets;

  // Ensure every port always offers:
  // 1) A 1-Slot safe modest contract
  // 2) A 3-Slot bulky/fragile high-payout contract
  // 3) A 1-2 Slot specialist/express contract
  const needed = GAME_CONFIG.offersPerPort - currentOffers.length;
  for (let i = 0; i < needed; i++) {
    const slotIndex = currentOffers.length + i;
    let templateId: ContractTypeId;
    if (slotIndex === 0) {
      templateId = 'ctype-safe-ballast';
    } else if (slotIndex === 1) {
      templateId = rng.pick(['ctype-fragile-isotopes', 'ctype-bulky-turbine'] as const);
    } else {
      templateId = rng.pick([
        'ctype-precision-optics',
        'ctype-tide-express',
        'ctype-corrosive-sludge',
        'ctype-salvage-plate',
        'ctype-cryo-meds',
      ] as const);
    }
    const dest = rng.pick(pool);
    const hops = hopMap.get(dest.id) ?? 2;
    const distanceBonus = Math.max(0, (hops - 2) * 10);
    const contract = createContractInstance(
      state.nextContractSeq++,
      templateId,
      state.currentNodeId,
      dest.id,
      distanceBonus,
    );
    state.contracts.push(contract);
  }
  state.rngState = rng.getState();
}

export function createInitialRunState(seed: number = GAME_CONFIG.defaultSeed): RunState {
  const rng = new SeededRng(seed);
  const edges = buildSeededArchipelagoEdges(rng);

  // Curated First-Two-Minutes opening contracts at Anchorhead Drydock (Node 01):
  // Offer 1: 1-Slot Safe Modest Freight to Cinder-Barge Wharf (Node 05)
  // Offer 2: 3-Slot Bulky/Fragile Isotope Consignment to Cinder-Barge Wharf (Node 05)
  // Offer 3: 1-Slot Urgent Tide-Window Express to Rust-Chain Atoll (Node 07)
  const openingContracts: ContractInstance[] = [
    createContractInstance(1, 'ctype-safe-ballast', 'node-01-anchorhead', 'node-05-cinder-wharf', 0),
    createContractInstance(2, 'ctype-fragile-isotopes', 'node-01-anchorhead', 'node-05-cinder-wharf', 0),
    createContractInstance(3, 'ctype-tide-express', 'node-01-anchorhead', 'node-07-rust-atoll', 0),
  ];

  const state: RunState = {
    version: GAME_CONFIG.saveVersion,
    seed,
    rngState: rng.getState(),
    turn: 1,
    runStatus: 'IN_PROGRESS',
    currentNodeId: GAME_CONFIG.startNodeId,
    hull: GAME_CONFIG.baseMaxHull,
    maxHull: GAME_CONFIG.baseMaxHull,
    fuel: GAME_CONFIG.baseMaxFuel,
    maxFuel: GAME_CONFIG.baseMaxFuel,
    credits: GAME_CONFIG.startingCredits,
    fuelDrums: GAME_CONFIG.startingFuelDrums,
    repairKits: GAME_CONFIG.startingRepairKits,
    maxHoldSlots: GAME_CONFIG.maxHoldSlots,
    installedModules: [],
    contracts: openingContracts,
    deliveredContractIds: [],
    deliveriesCompleted: 0,
    edges,
    pendingEncounter: null,
    pendingUpgradeChoices: [],
    selectedNodeId: 'node-05-cinder-wharf',
    failureDiagnostic: null,
    log: [
      {
        turn: 1,
        nodeId: GAME_CONFIG.startNodeId,
        edgeId: null,
        hazardId: null,
        choiceId: null,
        fuelDelta: 0,
        hullDelta: 0,
        creditsDelta: 0,
        message:
          'Moored at Anchorhead Drydock. Inspect the 8-Slot Hold Grid, accept up to 2 contracts, and chart your route.',
      },
    ],
    nextContractSeq: 4,
  };

  return state;
}

export function previewHazardOutcome(
  state: RunState,
  hazardId: HazardTypeId,
  choiceId: HazardChoicePreview['id'],
): {
  extraFuel: number;
  hullDamage: number;
  cargoPenaltyPerFragile: number;
  scrapCreditBonus: number;
  repairKitsSpent: number;
  summaryNote: string;
} {
  const mods = new Set(state.installedModules);
  const hasProw = mods.has('mod-icebreaker-prow');
  const hasTwinProp = mods.has('mod-twin-prop');
  const hasGyro = mods.has('mod-gyro-cradle');
  const hasWinch = mods.has('mod-salvage-winch');
  const hasBilge = mods.has('mod-bilge-rig');

  if (choiceId === 'patch_brace') {
    if (state.repairKits > 0) {
      return {
        extraFuel: 0,
        hullDamage: 0,
        cargoPenaltyPerFragile: 0,
        scrapCreditBonus: 0,
        repairKitsSpent: 1,
        summaryNote: 'Used 1 Repair Kit to brace bulkheads & fenders (0 Hull damage, cargo safe).',
      };
    }
    // Fallback to press_on if player attempted patch_brace without a kit
  }

  if (choiceId === 'evade_burn') {
    switch (hazardId) {
      case 'scrap_reef':
        return {
          extraFuel: 2,
          hullDamage: 0,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'Swung wide around the Scrap Reef (+2 Fuel burn, 0 Hull damage).',
        };
      case 'cross_current_riptide':
        return {
          extraFuel: hasTwinProp ? 0 : 1,
          hullDamage: 0,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'High-RPM ferry glide across Riptide (+1 Fuel burn, 0 Hull damage).',
        };
      case 'acid_squall':
        return {
          extraFuel: 2,
          hullDamage: 0,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'Outran the Acid Squall curtain (+2 Fuel burn, 0 Hull damage).',
        };
      case 'floating_minefield':
        return {
          extraFuel: 2,
          hullDamage: hasProw ? 0 : 2,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'Sonar slalom through Minefield (+2 Fuel burn, minimal grazing).',
        };
      case 'silt_fogbank':
        return {
          extraFuel: 1,
          hullDamage: 0,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'Radar sweep guided the skiff cleanly through the Silt Fogbank (+1 Fuel).',
        };
      case 'rogue_wake':
        return {
          extraFuel: 1,
          hullDamage: 0,
          cargoPenaltyPerFragile: 0,
          scrapCreditBonus: 0,
          repairKitsSpent: 0,
          summaryNote: 'Quartered into the Rogue Wake (+1 Fuel burn, 0 Hull damage).',
        };
    }
  }

  // Default: press_on
  switch (hazardId) {
    case 'scrap_reef': {
      const hullDamage = hasProw ? 0 : 10;
      const cargoPenaltyPerFragile = hasProw || hasGyro ? 0 : 14;
      const scrapCreditBonus = hasWinch ? 14 : 0;
      return {
        extraFuel: 0,
        hullDamage,
        cargoPenaltyPerFragile,
        scrapCreditBonus,
        repairKitsSpent: 0,
        summaryNote: hasProw
          ? 'Reinforced Icebreaker Prow crushed through the Scrap Reef with 0 Hull damage!'
          : 'Scraped across submerged rebar (-10 Hull).',
      };
    }
    case 'cross_current_riptide': {
      const extraFuel = hasTwinProp ? 0 : 2;
      const hullDamage = hasTwinProp ? 0 : 4;
      return {
        extraFuel,
        hullDamage,
        cargoPenaltyPerFragile: 0,
        scrapCreditBonus: 0,
        repairKitsSpent: 0,
        summaryNote: hasTwinProp
          ? 'Twin-Prop Outrigger held course effortlessly through the Riptide (0 extra Fuel, 0 Hull)!'
          : 'Cross-Current Riptide dragged the skiff (+2 Fuel burn, -4 Hull).',
      };
    }
    case 'acid_squall': {
      let hullDamage = 7;
      if (hasGyro) hullDamage -= 3;
      if (hasBilge) hullDamage -= 3;
      hullDamage = Math.max(1, hullDamage);
      const cargoPenaltyPerFragile = hasGyro ? 0 : 16;
      return {
        extraFuel: 0,
        hullDamage,
        cargoPenaltyPerFragile,
        scrapCreditBonus: 0,
        repairKitsSpent: 0,
        summaryNote: hasGyro
          ? `Gyro-Shock Cradle stabilized fragile cargo through the Acid Squall (-${hullDamage} Hull).`
          : `Acid Squall corroded plating (-${hullDamage} Hull) and jolted uncradled fragile crates.`,
      };
    }
    case 'floating_minefield': {
      const hullDamage = hasProw ? 4 : 12;
      const cargoPenaltyPerFragile = hasGyro || hasProw ? 0 : 18;
      const scrapCreditBonus = hasWinch ? 18 : 0;
      return {
        extraFuel: 0,
        hullDamage,
        cargoPenaltyPerFragile,
        scrapCreditBonus,
        repairKitsSpent: 0,
        summaryNote: hasProw
          ? 'Icebreaker Prow deflected mine tethers (-4 Hull).'
          : 'Mine tether detonation scorched the hull (-12 Hull)!',
      };
    }
    case 'silt_fogbank': {
      const extraFuel = 1;
      const hullDamage = 3;
      const scrapCreditBonus = hasWinch ? 12 : 0;
      return {
        extraFuel,
        hullDamage,
        cargoPenaltyPerFragile: 0,
        scrapCreditBonus,
        repairKitsSpent: 0,
        summaryNote: 'Crawled through Silt Fogbank (+1 Fuel drift, -3 Hull).',
      };
    }
    case 'rogue_wake': {
      const hullDamage = hasGyro || hasTwinProp ? 1 : 5;
      const cargoPenaltyPerFragile = hasGyro ? 0 : 12;
      return {
        extraFuel: 0,
        hullDamage,
        cargoPenaltyPerFragile,
        scrapCreditBonus: 0,
        repairKitsSpent: 0,
        summaryNote: hasGyro
          ? 'Gyro-Shock Cradle absorbed the Rogue Wake (-1 Hull, cargo untouched).'
          : 'Slammed into Rogue Wake crest (-5 Hull).',
      };
    }
  }
}

/**
 * Evaluates a candidate path for the current boat configuration and active cargo.
 */
export function evaluateRouteForLoadout(
  state: RunState,
  pathNodeIds: readonly string[],
  choicePolicy: 'press_on' | 'smart' = 'press_on',
): RouteEvaluation {
  const edgeIds: string[] = [];
  let totalBaseFuel = 0;
  let expectedExtraFuel = 0;
  let expectedHullDamage = 0;
  let expectedCargoPenalty = 0;
  let expectedScrapBonus = 0;

  const fragileCount = state.contracts.filter((c) => c.status === 'ACCEPTED' && c.fragile).length;

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const from = pathNodeIds[i];
    const to = pathNodeIds[i + 1];
    const edge = getEdgeBetween(state, from, to);
    if (!edge) {
      throw new Error(`No edge connecting ${from} and ${to}`);
    }
    edgeIds.push(edge.id);
    totalBaseFuel += edge.baseFuelCost;

    const pressPreview = previewHazardOutcome(state, edge.hazardId, 'press_on');
    let chosenPreview = pressPreview;

    if (choicePolicy === 'smart') {
      const evadePreview = previewHazardOutcome(state, edge.hazardId, 'evade_burn');
      const pressCost =
        pressPreview.hullDamage * 3.5 +
        pressPreview.extraFuel * 4 +
        pressPreview.cargoPenaltyPerFragile * fragileCount * 1.2 -
        pressPreview.scrapCreditBonus;
      const evadeCost =
        evadePreview.hullDamage * 3.5 +
        evadePreview.extraFuel * 4 +
        evadePreview.cargoPenaltyPerFragile * fragileCount * 1.2;
      if (evadeCost < pressCost && state.maxFuel >= 12) {
        chosenPreview = evadePreview;
      }
    }

    expectedExtraFuel += chosenPreview.extraFuel;
    expectedHullDamage += chosenPreview.hullDamage;
    expectedCargoPenalty += chosenPreview.cargoPenaltyPerFragile * fragileCount;
    expectedScrapBonus += chosenPreview.scrapCreditBonus;
  }

  const totalExpectedFuel = totalBaseFuel + expectedExtraFuel;
  // Weighted hazard/resource score (lower is better):
  // Hull damage is heavily weighted (3.5 per point), fuel is weighted inversely to maxFuel capacity,
  // and fragile cargo penalty is weighted.
  const fuelWeight = state.installedModules.includes('mod-aux-tank') ? 2.2 : 4.2;
  const score =
    expectedHullDamage * 3.8 +
    totalExpectedFuel * fuelWeight +
    expectedCargoPenalty * 1.5 -
    expectedScrapBonus * 0.5;

  return {
    pathNodeIds: [...pathNodeIds],
    edgeIds,
    totalBaseFuel,
    expectedExtraFuel,
    totalExpectedFuel,
    expectedHullDamage,
    expectedCargoPenalty,
    expectedScrapBonus,
    score,
  };
}

/**
 * Finds all simple paths up to maxHops between startNodeId and targetNodeId and returns the optimal RouteEvaluation.
 */
export function findOptimalRouteForLoadout(
  state: RunState,
  startNodeId: string,
  targetNodeId: string,
  maxHops = 5,
): RouteEvaluation {
  const candidates: RouteEvaluation[] = [];

  function dfs(current: string, path: string[]): void {
    if (path.length - 1 > maxHops) return;
    if (current === targetNodeId) {
      candidates.push(evaluateRouteForLoadout(state, path, 'press_on'));
      return;
    }
    for (const edge of getConnectedEdges(state, current)) {
      const next = getNeighborNodeId(edge, current);
      if (!path.includes(next)) {
        path.push(next);
        dfs(next, path);
        path.pop();
      }
    }
  }

  dfs(startNodeId, [startNodeId]);
  if (candidates.length === 0) {
    throw new Error(`No route found between ${startNodeId} and ${targetNodeId}`);
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates[0];
}

/**
 * Validates that a freshly generated run state has at least one guaranteed viable route
 * for the starter boat configuration without needing any pre-installed modules.
 */
export function validateStarterViableRoute(state: RunState): {
  viable: boolean;
  viableContractId: string | null;
  route: RouteEvaluation | null;
  remainingHull: number;
  remainingEffectiveFuel: number;
} {
  const effectiveStarterFuel = state.fuel + state.fuelDrums * GAME_CONFIG.fuelPerDrum;
  const offers = state.contracts.filter(
    (c) => c.status === 'OFFERED' && c.originNodeId === state.currentNodeId,
  );

  for (const offer of offers) {
    const bestRoute = findOptimalRouteForLoadout(state, state.currentNodeId, offer.destinationNodeId, 4);
    const remHull = state.hull - bestRoute.expectedHullDamage;
    const remFuel = effectiveStarterFuel - bestRoute.totalExpectedFuel;
    if (remHull >= 15 && remFuel >= 2) {
      return {
        viable: true,
        viableContractId: offer.id,
        route: bestRoute,
        remainingHull: remHull,
        remainingEffectiveFuel: remFuel,
      };
    }
  }

  return {
    viable: false,
    viableContractId: null,
    route: null,
    remainingHull: 0,
    remainingEffectiveFuel: 0,
  };
}

export function acceptContract(
  state: RunState,
  contractId: string,
): { ok: boolean; error?: string } {
  if (state.runStatus !== 'IN_PROGRESS') {
    return { ok: false, error: 'Run has already ended.' };
  }
  if (state.pendingEncounter) {
    return { ok: false, error: 'Resolve the current sea hazard encounter first.' };
  }
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract) {
    return { ok: false, error: 'Contract not found.' };
  }
  if (contract.status !== 'OFFERED') {
    return { ok: false, error: `Contract is ${contract.status}, not OFFERED.` };
  }
  if (contract.originNodeId !== state.currentNodeId) {
    return { ok: false, error: 'Must be moored at the contract origin port to load cargo.' };
  }

  const activeContracts = state.contracts.filter((c) => c.status === 'ACCEPTED');
  if (activeContracts.length >= GAME_CONFIG.maxActiveContracts) {
    return {
      ok: false,
      error: `Cannot carry more than ${GAME_CONFIG.maxActiveContracts} active contracts at once.`,
    };
  }

  const check = validateLoadout({
    installedModules: state.installedModules,
    acceptedContracts: [...activeContracts, contract],
    fuelDrums: state.fuelDrums,
    repairKits: state.repairKits,
    maxHoldSlots: state.maxHoldSlots,
  });
  if (!check.valid) {
    return { ok: false, error: check.reason };
  }

  contract.status = 'ACCEPTED';
  state.selectedNodeId = contract.destinationNodeId;
  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: 0,
    creditsDelta: 0,
    message: `Loaded "${contract.cargoName}" (${contract.cargoSlots} Hold Slot${contract.cargoSlots > 1 ? 's' : ''}) bound for ${getNodeById(contract.destinationNodeId).name}.`,
  });
  return { ok: true };
}

export function abandonContract(
  state: RunState,
  contractId: string,
): { ok: boolean; error?: string } {
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'ACCEPTED') {
    return { ok: false, error: 'Only accepted contracts can be jettisoned/abandoned.' };
  }
  contract.status = 'FAILED';
  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: 0,
    creditsDelta: 0,
    message: `Jettisoned "${contract.cargoName}" (${contract.cargoSlots} Slots freed). Contract marked FAILED.`,
  });
  ensurePortContractOffers(state);
  return { ok: true };
}

export function deliverContract(
  state: RunState,
  contractId: string,
): { ok: boolean; payout: number; error?: string } {
  if (state.pendingEncounter) {
    return { ok: false, payout: 0, error: 'Cannot deliver while resolving an encounter.' };
  }
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract) {
    return { ok: false, payout: 0, error: 'Contract does not exist.' };
  }

  // STRICT ANTI-DOUBLE-PAYOUT GUARD
  if (
    contract.paidOut ||
    contract.status === 'DELIVERED' ||
    state.deliveredContractIds.includes(contract.id)
  ) {
    return {
      ok: false,
      payout: 0,
      error: 'Contract has already been delivered and paid out.',
    };
  }

  if (contract.status !== 'ACCEPTED') {
    return {
      ok: false,
      payout: 0,
      error: `Contract cannot be delivered from status ${contract.status}.`,
    };
  }

  if (state.currentNodeId !== contract.destinationNodeId) {
    return {
      ok: false,
      payout: 0,
      error: `Must reach destination port (${getNodeById(contract.destinationNodeId).name}) to deliver.`,
    };
  }

  const urgentBonus =
    contract.urgentMaxHops !== null && contract.hopsTaken <= contract.urgentMaxHops ? 15 : 0;
  const finalPayout = Math.max(10, contract.basePayout - contract.accumulatedPenalty + urgentBonus);

  contract.status = 'DELIVERED';
  contract.paidOut = true;
  state.deliveredContractIds.push(contract.id);
  state.credits += finalPayout;
  state.deliveriesCompleted += 1;

  // Offer 1 Boat Module Upgrade selection upon delivery
  const unownedModules = BOAT_MODULES.map((m) => m.id).filter(
    (id) => !state.installedModules.includes(id),
  );
  state.pendingUpgradeChoices = unownedModules.slice(0, 3);

  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: 0,
    creditsDelta: finalPayout,
    message: `Delivered "${contract.cargoName}" at ${getNodeById(state.currentNodeId).name} for +${finalPayout}¢! (${state.deliveriesCompleted}/${GAME_CONFIG.deliveriesToWin} Deliveries)`,
  });

  if (state.deliveriesCompleted >= GAME_CONFIG.deliveriesToWin) {
    state.runStatus = 'VICTORY';
    state.log.push({
      turn: state.turn,
      nodeId: state.currentNodeId,
      edgeId: null,
      hazardId: null,
      choiceId: null,
      fuelDelta: 0,
      hullDelta: 0,
      creditsDelta: 0,
      message: `VICTORY! Completed ${state.deliveriesCompleted} salvage deliveries across The Rustwater Shallows with ${state.credits}¢ in the guild vault!`,
    });
  } else {
    ensurePortContractOffers(state);
  }

  return { ok: true, payout: finalPayout };
}

export function selectDeliveryUpgradeModule(
  state: RunState,
  moduleId: ModuleId | 'skip_for_credits',
): { ok: boolean; error?: string } {
  if (state.pendingUpgradeChoices.length === 0) {
    return { ok: false, error: 'No pending delivery upgrade available.' };
  }
  if (moduleId === 'skip_for_credits') {
    state.pendingUpgradeChoices = [];
    state.credits += 20;
    state.log.push({
      turn: state.turn,
      nodeId: state.currentNodeId,
      edgeId: null,
      hazardId: null,
      choiceId: null,
      fuelDelta: 0,
      hullDelta: 0,
      creditsDelta: 20,
      message: 'Declined module refit and claimed +20¢ guild salvage stipend.',
    });
    return { ok: true };
  }

  if (!state.pendingUpgradeChoices.includes(moduleId)) {
    return { ok: false, error: 'Module is not in the current upgrade offer.' };
  }

  const installRes = installModule(state, moduleId, { freeUpgrade: true });
  if (!installRes.ok) {
    return installRes;
  }
  state.pendingUpgradeChoices = [];
  return { ok: true };
}

export function installModule(
  state: RunState,
  moduleId: ModuleId,
  options?: { freeUpgrade?: boolean },
): { ok: boolean; error?: string } {
  if (state.pendingEncounter) {
    return { ok: false, error: 'Cannot refit modules at sea during an encounter.' };
  }
  if (state.installedModules.includes(moduleId)) {
    return { ok: false, error: 'Module is already installed.' };
  }
  const modDef = getModuleById(moduleId);
  const cost = options?.freeUpgrade ? 0 : modDef.creditCost;
  if (state.credits < cost) {
    return { ok: false, error: `Insufficient credits: need ${cost}¢, have ${state.credits}¢.` };
  }

  const nextModules = [...state.installedModules, moduleId];
  const accepted = state.contracts.filter((c) => c.status === 'ACCEPTED');
  const check = validateLoadout({
    installedModules: nextModules,
    acceptedContracts: accepted,
    fuelDrums: state.fuelDrums,
    repairKits: state.repairKits,
    maxHoldSlots: state.maxHoldSlots,
  });
  if (!check.valid) {
    return { ok: false, error: check.reason };
  }

  state.credits -= cost;
  state.installedModules = nextModules;
  state.maxFuel = getMaxFuelForModules(state.installedModules);
  if (moduleId === 'mod-aux-tank') {
    state.fuel = Math.min(state.maxFuel, state.fuel + GAME_CONFIG.auxTankFuelBonus);
  }

  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: moduleId === 'mod-aux-tank' ? GAME_CONFIG.auxTankFuelBonus : 0,
    hullDelta: 0,
    creditsDelta: -cost,
    message: `Installed ${modDef.name} (${modDef.slotCost} Hold Slot${modDef.slotCost > 1 ? 's' : ''}).`,
  });
  return { ok: true };
}

export function uninstallModule(
  state: RunState,
  moduleId: ModuleId,
): { ok: boolean; error?: string } {
  if (state.pendingEncounter) {
    return { ok: false, error: 'Cannot uninstall modules during an encounter.' };
  }
  if (!state.installedModules.includes(moduleId)) {
    return { ok: false, error: 'Module is not installed.' };
  }
  const modDef = getModuleById(moduleId);
  const refund = Math.floor(modDef.creditCost * 0.65);
  state.installedModules = state.installedModules.filter((id) => id !== moduleId);
  state.maxFuel = getMaxFuelForModules(state.installedModules);
  state.fuel = Math.min(state.fuel, state.maxFuel);
  state.credits += refund;

  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: 0,
    creditsDelta: refund,
    message: `Removed ${modDef.name} (+${refund}¢ salvage refund, freed ${modDef.slotCost} Slot${modDef.slotCost > 1 ? 's' : ''}).`,
  });
  return { ok: true };
}

export function applyLoadoutPreset(
  state: RunState,
  presetId: LoadoutPresetId,
): { ok: boolean; error?: string } {
  if (state.pendingEncounter) {
    return { ok: false, error: 'Cannot swap loadout presets during a hazard encounter.' };
  }
  const preset = LOADOUT_PRESETS[presetId];
  const targetModules = preset.moduleIds as ModuleId[];
  const accepted = state.contracts.filter((c) => c.status === 'ACCEPTED');
  const check = validateLoadout({
    installedModules: targetModules,
    acceptedContracts: accepted,
    fuelDrums: preset.fuelDrums,
    repairKits: preset.repairKits,
    maxHoldSlots: state.maxHoldSlots,
  });
  if (!check.valid) {
    return { ok: false, error: check.reason };
  }

  state.installedModules = [...targetModules];
  state.fuelDrums = preset.fuelDrums;
  state.repairKits = preset.repairKits;
  state.maxFuel = getMaxFuelForModules(state.installedModules);
  state.fuel = state.maxFuel;

  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: 0,
    creditsDelta: 0,
    message: `Configured "${preset.name}" preset (${check.usedSlots}/${check.maxSlots} Hold Slots used).`,
  });
  return { ok: true };
}

export function buyFuelDrum(state: RunState): { ok: boolean; error?: string } {
  if (state.credits < GAME_CONFIG.fuelDrumCost) {
    return { ok: false, error: `Need ${GAME_CONFIG.fuelDrumCost}¢ to buy a Spare Fuel Drum.` };
  }
  const accepted = state.contracts.filter((c) => c.status === 'ACCEPTED');
  const check = validateLoadout({
    installedModules: state.installedModules,
    acceptedContracts: accepted,
    fuelDrums: state.fuelDrums + 1,
    repairKits: state.repairKits,
    maxHoldSlots: state.maxHoldSlots,
  });
  if (!check.valid) {
    return { ok: false, error: check.reason };
  }
  state.credits -= GAME_CONFIG.fuelDrumCost;
  state.fuelDrums += 1;
  return { ok: true };
}

export function sellFuelDrum(state: RunState): { ok: boolean; error?: string } {
  if (state.fuelDrums <= 0) {
    return { ok: false, error: 'No Fuel Drums in hold to unload.' };
  }
  state.fuelDrums -= 1;
  state.credits += GAME_CONFIG.fuelDrumResell;
  return { ok: true };
}

export function crackFuelDrumIntoTank(state: RunState): { ok: boolean; error?: string } {
  if (state.fuelDrums <= 0) {
    return { ok: false, error: 'No Spare Fuel Drums in hold.' };
  }
  if (state.fuel >= state.maxFuel) {
    return { ok: false, error: 'Internal fuel tank is already full.' };
  }
  const gained = Math.min(GAME_CONFIG.fuelPerDrum, state.maxFuel - state.fuel);
  state.fuelDrums -= 1;
  state.fuel += gained;
  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: gained,
    hullDelta: 0,
    creditsDelta: 0,
    message: `Cracked open 1 Spare Fuel Drum (+${gained} Fuel, freed 1 Hold Slot).`,
  });
  return { ok: true };
}

export function buyRepairKit(state: RunState): { ok: boolean; error?: string } {
  if (state.credits < GAME_CONFIG.repairKitCost) {
    return { ok: false, error: `Need ${GAME_CONFIG.repairKitCost}¢ to buy a Repair Kit.` };
  }
  const accepted = state.contracts.filter((c) => c.status === 'ACCEPTED');
  const check = validateLoadout({
    installedModules: state.installedModules,
    acceptedContracts: accepted,
    fuelDrums: state.fuelDrums,
    repairKits: state.repairKits + 1,
    maxHoldSlots: state.maxHoldSlots,
  });
  if (!check.valid) {
    return { ok: false, error: check.reason };
  }
  state.credits -= GAME_CONFIG.repairKitCost;
  state.repairKits += 1;
  return { ok: true };
}

export function sellRepairKit(state: RunState): { ok: boolean; error?: string } {
  if (state.repairKits <= 0) {
    return { ok: false, error: 'No Repair Kits in hold to unload.' };
  }
  state.repairKits -= 1;
  state.credits += GAME_CONFIG.repairKitResell;
  return { ok: true };
}

export function useRepairKitOnHull(state: RunState): { ok: boolean; restored: number; error?: string } {
  if (state.repairKits <= 0) {
    return { ok: false, restored: 0, error: 'No Repair Kits in hold.' };
  }
  if (state.hull >= state.maxHull) {
    return { ok: false, restored: 0, error: 'Hull is already at maximum integrity.' };
  }
  const perKit = state.installedModules.includes('mod-bilge-rig')
    ? GAME_CONFIG.bilgeRigRepairAmount
    : GAME_CONFIG.baseRepairAmount;
  const restored = Math.min(perKit, state.maxHull - state.hull);
  state.repairKits -= 1;
  state.hull += restored;
  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: null,
    hazardId: null,
    choiceId: null,
    fuelDelta: 0,
    hullDelta: restored,
    creditsDelta: 0,
    message: `Patched hull plating with Repair Kit (+${restored} Hull, freed 1 Hold Slot).`,
  });
  return { ok: true, restored };
}

export function refuelAtPort(state: RunState, amount?: number): { ok: boolean; added: number; error?: string } {
  const missing = state.maxFuel - state.fuel;
  if (missing <= 0) {
    return { ok: false, added: 0, error: 'Tank is already topped off.' };
  }
  const affordable = Math.floor(state.credits / GAME_CONFIG.portFuelUnitCost);
  if (affordable <= 0) {
    return { ok: false, added: 0, error: 'Insufficient credits to refuel at port.' };
  }
  const target = amount ? Math.min(amount, missing, affordable) : Math.min(missing, affordable);
  const cost = target * GAME_CONFIG.portFuelUnitCost;
  state.fuel += target;
  state.credits -= cost;
  return { ok: true, added: target };
}

export function repairHullAtPort(state: RunState, points?: number): { ok: boolean; restored: number; error?: string } {
  const missing = state.maxHull - state.hull;
  if (missing <= 0) {
    return { ok: false, restored: 0, error: 'Hull is already at 100%.' };
  }
  const affordable = Math.floor(state.credits / GAME_CONFIG.portHullPointCost);
  if (affordable <= 0) {
    return { ok: false, restored: 0, error: 'Insufficient credits for drydock hull repair.' };
  }
  const target = points ? Math.min(points, missing, affordable) : Math.min(missing, affordable);
  const cost = target * GAME_CONFIG.portHullPointCost;
  state.hull += target;
  state.credits -= cost;
  return { ok: true, restored: target };
}

export function analyzeFailure(
  state: RunState,
  cause: 'HULL_ZERO' | 'FUEL_STRANDED',
  lastEdge: EdgeRuntimeState | null,
): FailureDiagnostic {
  const nodeName = getNodeById(state.currentNodeId).name;
  const hazardDef = lastEdge ? HAZARDS[lastEdge.hazardId] : null;

  if (cause === 'HULL_ZERO') {
    if (lastEdge && hazardDef?.counterModuleId && !state.installedModules.includes(hazardDef.counterModuleId)) {
      const counterMod = getModuleById(hazardDef.counterModuleId);
      return {
        cause: 'HULL_ZERO',
        title: `Hull Breached in ${hazardDef.name} near ${nodeName}`,
        summary: `The Iron Skiff broke apart after taking unmitigated ${hazardDef.name} damage on leg ${lastEdge.id} without ${counterMod.name} installed.`,
        mistakeCategory: 'UNCOUNTERED_HAZARD',
        failedNodeId: state.currentNodeId,
        lastEdgeId: lastEdge.id,
        lastHazardId: lastEdge.hazardId,
        recommendation: `Equip ${counterMod.name} before entering ${hazardDef.name} shortcuts, or route around via the outer Silt Fogbank channels.`,
      };
    }
    return {
      cause: 'HULL_ZERO',
      title: `Sunk by Cumulative Hull Fatigue at ${nodeName}`,
      summary:
        state.repairKits > 0
          ? `Sank with ${state.repairKits} unused Repair Kit(s) still sitting in the hold instead of patching before traversal.`
          : `Pushed into ${hazardDef ? hazardDef.name : 'hazardous waters'} on critically low hull without a Repair Kit in reserve.`,
      mistakeCategory: 'SKIPPED_REPAIR',
      failedNodeId: state.currentNodeId,
      lastEdgeId: lastEdge ? lastEdge.id : null,
      lastHazardId: lastEdge ? lastEdge.hazardId : null,
      recommendation:
        'Keep at least 15 Hull buffer before entering medium/high hazards or spend a Repair Kit to brace during the encounter.',
    };
  }

  // FUEL_STRANDED
  const acceptedSlots = state.contracts
    .filter((c) => c.status === 'ACCEPTED')
    .reduce((s, c) => s + c.cargoSlots, 0);
  if (acceptedSlots >= 3 && state.fuelDrums === 0 && !state.installedModules.includes('mod-aux-tank')) {
    return {
      cause: 'FUEL_STRANDED',
      title: `Out of Diesel at ${nodeName} (Overloaded Cargo Detour)`,
      summary: `Carried ${acceptedSlots} Hold Slots of cargo without an Auxiliary Reserve Tank or Spare Fuel Drum, running dry after ${hazardDef ? hazardDef.name : 'channel'} fuel burn.`,
      mistakeCategory: 'OVERLOADED_DETOUR',
      failedNodeId: state.currentNodeId,
      lastEdgeId: lastEdge ? lastEdge.id : null,
      lastHazardId: lastEdge ? lastEdge.hazardId : null,
      recommendation:
        'When hauling 3+ Slots of cargo on outer routes, install the Auxiliary Reserve Tank (+4 Max Fuel) or pack at least 1 Spare Fuel Drum.',
    };
  }

  return {
    cause: 'FUEL_STRANDED',
    title: `Stranded Dead-in-Water at ${nodeName}`,
    summary: `Depleted all internal fuel (0/${state.maxFuel}) and 0 Spare Fuel Drums after traversing ${lastEdge ? lastEdge.id : 'the channel'}.`,
    mistakeCategory: 'FUEL_MISCALCULATION',
    failedNodeId: state.currentNodeId,
    lastEdgeId: lastEdge ? lastEdge.id : null,
    lastHazardId: lastEdge ? lastEdge.hazardId : null,
    recommendation:
      'Check each route leg’s base fuel + hazard drift cost before departure, or equip Twin-Prop Outrigger to negate Cross-Current Riptide fuel burn.',
  };
}

/**
 * Initiates travel along an adjacent edge, creating a PendingEncounterState so the player
 * can resolve the tactical hazard card (or resolves immediately if immediateChoice is passed).
 */
export function beginTravelToNode(
  state: RunState,
  targetNodeId: string,
  immediateChoice?: HazardChoicePreview['id'],
): { ok: boolean; error?: string } {
  if (state.runStatus !== 'IN_PROGRESS') {
    return { ok: false, error: 'Cannot travel: run has already concluded.' };
  }
  if (state.pendingEncounter) {
    return { ok: false, error: 'Must resolve current hazard encounter before moving again.' };
  }

  const holdCheck = validateStateHoldCapacity(state);
  if (!holdCheck.valid) {
    return { ok: false, error: holdCheck.reason };
  }

  const edge = getEdgeBetween(state, state.currentNodeId, targetNodeId);
  if (!edge) {
    return { ok: false, error: `No direct channel connects ${state.currentNodeId} to ${targetNodeId}.` };
  }

  // Auto-crack a fuel drum if internal fuel is below baseFuelCost and a drum is available
  while (state.fuel < edge.baseFuelCost && state.fuelDrums > 0) {
    crackFuelDrumIntoTank(state);
  }

  if (state.fuel < edge.baseFuelCost) {
    state.runStatus = 'LOSS';
    state.failureDiagnostic = analyzeFailure(state, 'FUEL_STRANDED', edge);
    return {
      ok: false,
      error: `Insufficient fuel: edge requires ${edge.baseFuelCost} Fuel, have ${state.fuel}.`,
    };
  }

  state.fuel -= edge.baseFuelCost;
  state.pendingEncounter = {
    edgeId: edge.id,
    fromNodeId: state.currentNodeId,
    toNodeId: targetNodeId,
    baseFuelPaid: edge.baseFuelCost,
    hazardId: edge.hazardId,
  };

  if (immediateChoice) {
    return resolvePendingEncounter(state, immediateChoice);
  }

  return { ok: true };
}

export function resolvePendingEncounter(
  state: RunState,
  choiceId: HazardChoicePreview['id'],
): { ok: boolean; error?: string } {
  const enc = state.pendingEncounter;
  if (!enc) {
    return { ok: false, error: 'No pending encounter to resolve.' };
  }

  const edge = state.edges.find((e) => e.id === enc.edgeId)!;
  const outcome = previewHazardOutcome(state, enc.hazardId, choiceId);

  if (outcome.repairKitsSpent > 0) {
    state.repairKits = Math.max(0, state.repairKits - outcome.repairKitsSpent);
  }

  // Pay extra fuel if any, cracking a spare fuel drum if needed
  let extraFuelNeeded = outcome.extraFuel;
  while (state.fuel < extraFuelNeeded && state.fuelDrums > 0) {
    crackFuelDrumIntoTank(state);
  }

  const actualExtraFuelPaid = Math.min(state.fuel, extraFuelNeeded);
  state.fuel -= actualExtraFuelPaid;
  const unpaidFuelShortfall = extraFuelNeeded - actualExtraFuelPaid;

  // Apply hull damage (plus shortfall drift damage if ran out of fuel mid-hazard)
  const totalHullLoss = outcome.hullDamage + unpaidFuelShortfall * 4;
  state.hull = Math.max(0, state.hull - totalHullLoss);

  // Apply fragile cargo penalty to accepted fragile contracts
  if (outcome.cargoPenaltyPerFragile > 0) {
    for (const c of state.contracts) {
      if (c.status === 'ACCEPTED' && c.fragile) {
        c.accumulatedPenalty += outcome.cargoPenaltyPerFragile;
      }
    }
  }

  // Apply salvage winch bonus credits
  if (outcome.scrapCreditBonus > 0) {
    state.credits += outcome.scrapCreditBonus;
  }

  // Advance boat position and contract hop counters
  state.currentNodeId = enc.toNodeId;
  state.selectedNodeId = enc.toNodeId;
  state.turn += 1;
  edge.timesTraversed += 1;
  edge.lastResolvedChoice = choiceId;
  state.pendingEncounter = null;

  for (const c of state.contracts) {
    if (c.status === 'ACCEPTED') {
      c.hopsTaken += 1;
    }
  }

  state.log.push({
    turn: state.turn,
    nodeId: state.currentNodeId,
    edgeId: edge.id,
    hazardId: enc.hazardId,
    choiceId,
    fuelDelta: -(enc.baseFuelPaid + actualExtraFuelPaid),
    hullDelta: -totalHullLoss,
    creditsDelta: outcome.scrapCreditBonus,
    message: `Arrived at ${getNodeById(state.currentNodeId).name} via ${HAZARDS[enc.hazardId].name}: ${outcome.summaryNote}`,
  });

  // Check loss conditions:
  if (state.hull <= 0) {
    state.runStatus = 'LOSS';
    state.failureDiagnostic = analyzeFailure(state, 'HULL_ZERO', edge);
    state.log.push({
      turn: state.turn,
      nodeId: state.currentNodeId,
      edgeId: edge.id,
      hazardId: enc.hazardId,
      choiceId,
      fuelDelta: 0,
      hullDelta: 0,
      creditsDelta: 0,
      message: `LOSS: ${state.failureDiagnostic.title} — ${state.failureDiagnostic.summary}`,
    });
    return { ok: true };
  }

  // Check if stranded at sea with 0 fuel, 0 drums, and unable to afford fuel or deliver a contract here
  const deliverableHere = state.contracts.some(
    (c) => c.status === 'ACCEPTED' && c.destinationNodeId === state.currentNodeId && !c.paidOut,
  );
  const minOutgoingFuel = Math.min(
    ...getConnectedEdges(state, state.currentNodeId).map((e) => e.baseFuelCost),
  );
  const effectiveFuel = state.fuel + state.fuelDrums * GAME_CONFIG.fuelPerDrum;
  const affordablePortFuel = Math.floor(state.credits / GAME_CONFIG.portFuelUnitCost);

  if (
    effectiveFuel <= 0 ||
    (effectiveFuel + affordablePortFuel < minOutgoingFuel && !deliverableHere)
  ) {
    state.runStatus = 'LOSS';
    state.failureDiagnostic = analyzeFailure(state, 'FUEL_STRANDED', edge);
    state.log.push({
      turn: state.turn,
      nodeId: state.currentNodeId,
      edgeId: edge.id,
      hazardId: enc.hazardId,
      choiceId,
      fuelDelta: 0,
      hullDelta: 0,
      creditsDelta: 0,
      message: `LOSS: ${state.failureDiagnostic.title} — ${state.failureDiagnostic.summary}`,
    });
    return { ok: true };
  }

  ensurePortContractOffers(state);
  return { ok: true };
}
