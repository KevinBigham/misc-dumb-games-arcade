import {
  CONFIG,
  FlowDirectionConstraint,
  GridCoord,
  LinkStatus,
  LinkType,
  coordKey,
  formatEdgeLabel,
  getUpgradeCostMat,
  isOrthogonallyAdjacent,
  makeEdgeId,
  parseCoordKey,
  parseEdgeId,
} from './config.ts';
import {
  DistrictSpec,
  SCENARIO_1_HARBOR_SQUALL,
  ScenarioSpec,
  StormStrike,
  isBlockedCoord,
} from './content.ts';

export interface BoardLink {
  id: string;
  type: LinkType;
  status: LinkStatus;
  directionConstraint: FlowDirectionConstraint;
}

export interface BoardState {
  links: Record<string, BoardLink>;
}

export type DiagnosticReason =
  | 'OK'
  | 'DISCONNECTED_NO_PATH'
  | 'DAMAGED_LINE_OUTAGE'
  | 'CAPACITY_BOTTLENECK'
  | 'GENERATOR_CAPACITY_EXHAUSTED';

export interface DistrictDiagnostic {
  districtId: DistrictSpec['id'];
  districtName: string;
  priority: number;
  reason: DiagnosticReason;
  demandMW: number;
  deliveredMW: number;
  unmetMW: number;
  bottleneckEdgeIds: string[];
  explanation: string;
}

export interface EdgeFlowAllocation {
  edgeId: string;
  type: LinkType;
  status: LinkStatus;
  capacityMW: number;
  flowMW: number;
  fromNode: string;
  toNode: string;
  isSaturated: boolean;
  isDamagedBottleneck: boolean;
  contributors: Array<{ districtId: DistrictSpec['id']; mw: number }>;
}

export interface PowerFlowResult {
  generatorOutputMW: number;
  generatorUsedMW: number;
  totalDemandMW: number;
  totalDeliveredMW: number;
  totalUnmetMW: number;
  edgeFlows: Record<string, EdgeFlowAllocation>;
  districtAllocations: Record<
    DistrictSpec['id'],
    {
      demandMW: number;
      deliveredMW: number;
      unmetMW: number;
      paths: string[][];
    }
  >;
  diagnostics: Record<DistrictSpec['id'], DistrictDiagnostic>;
  energizedRelayIds: string[];
  hasDirectedCycle: boolean;
}

export interface StrikeResolutionReport {
  edgeId: string;
  severity: StormStrike['severity'];
  label: string;
  outcome: 'damaged' | 'deflected' | 'missed_no_link' | 'already_damaged';
  linkType?: LinkType;
}

export interface TurnPreview {
  turn: number;
  imminentStrikes: StrikeResolutionReport[];
  postStrikeBoard: BoardState;
  flow: PowerFlowResult;
  projectedMaterialIncome: number;
  projectedCityCumulativeUnmetMW: number;
  willFailCity: boolean;
  failingDistrictIds: DistrictSpec['id'][];
}

export type StagedActionType = 'place' | 'repair' | 'upgrade' | 'reroute';

export interface StagedActionRecord {
  type: StagedActionType;
  description: string;
  edgeId: string;
  targetEdgeId?: string;
  linkType?: LinkType;
  costMat: number;
  previousBoard: BoardState;
  previousMaterials: number;
  previousActionsRemaining: number;
}

export interface DistrictState {
  id: DistrictSpec['id'];
  name: string;
  shortCode: string;
  priority: DistrictSpec['priority'];
  row: number;
  col: number;
  demandCurve: DistrictSpec['demandCurve'];
  unmetLimitMW: number;
  cumulativeUnmetMW: number;
  lastTurnDeliveredMW: number;
  lastTurnUnmetMW: number;
}

export interface TurnHistoryEntry {
  turn: number;
  strikes: StrikeResolutionReport[];
  totalDemandMW: number;
  totalDeliveredMW: number;
  totalUnmetMW: number;
  materialIncome: number;
  diagnostics: Record<DistrictSpec['id'], DistrictDiagnostic>;
}

export interface GameState {
  rulesVersion: string;
  scenarioId: string;
  scenario: ScenarioSpec;
  turn: number; // 1..12
  status: 'playing' | 'won' | 'lost';
  lossReason: string | null;
  materials: number;
  actionsRemaining: number;
  board: BoardState;
  districts: Record<DistrictSpec['id'], DistrictState>;
  cityCumulativeUnmetMW: number;
  stagedActions: StagedActionRecord[];
  turnStartSnapshot: {
    board: BoardState;
    materials: number;
    actionsRemaining: number;
  };
  preview: TurnPreview;
  history: TurnHistoryEntry[];
}

export function cloneBoard(board: BoardState): BoardState {
  const links: Record<string, BoardLink> = {};
  for (const [id, link] of Object.entries(board.links)) {
    links[id] = { ...link };
  }
  return { links };
}

function getAllGridNodes(): string[] {
  const nodes: string[] = [];
  for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
    for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
      nodes.push(coordKey(r, c));
    }
  }
  return nodes;
}

function canTraverseDirected(
  link: BoardLink,
  u: string,
  v: string,
): boolean {
  const { nodeA, nodeB } = parseEdgeId(link.id);
  if (link.directionConstraint === 'forward') {
    return u === nodeA && v === nodeB;
  }
  if (link.directionConstraint === 'reverse') {
    return u === nodeB && v === nodeA;
  }
  return (u === nodeA && v === nodeB) || (u === nodeB && v === nodeA);
}

/**
 * Pure deterministic directed-graph power flow resolver.
 * - Allocates generator output strictly by district priority (1 -> 5).
 * - Uses shortest augmenting paths (BFS hops, lexicographic node coordinate tie-breaking).
 * - Cancels any directed cycles so energy is NEVER created by a cycle.
 * - Produces exact min-cut / reachability diagnostics for any disconnected or overloaded edge.
 */
export function resolvePowerFlow(
  board: BoardState,
  scenario: ScenarioSpec,
  demandOverrides?: Partial<Record<DistrictSpec['id'], number>>,
  turnIndex = 0,
): PowerFlowResult {
  const genNode = coordKey(scenario.generator.row, scenario.generator.col);
  const clampedTurnIdx = Math.max(0, Math.min(CONFIG.TOTAL_TURNS - 1, turnIndex));

  const sortedDistricts = [...scenario.districts].sort((a, b) => a.priority - b.priority);

  // Track directed flow on each edge: key "u->v" -> mw
  const directedEdgeFlow = new Map<string, number>();
  const edgeContributors = new Map<string, Map<DistrictSpec['id'], number>>();
  const edgeIdsByUndirected = new Map<string, BoardLink>();

  for (const link of Object.values(board.links)) {
    edgeIdsByUndirected.set(link.id, link);
    edgeContributors.set(link.id, new Map());
  }

  const getDirKey = (u: string, v: string) => `${u}->${v}`;
  const getDirectedFlow = (u: string, v: string) => directedEdgeFlow.get(getDirKey(u, v)) ?? 0;
  const setDirectedFlow = (u: string, v: string, val: number) => {
    if (val <= 0) {
      directedEdgeFlow.delete(getDirKey(u, v));
    } else {
      directedEdgeFlow.set(getDirKey(u, v), val);
    }
  };

  // Build adjacency list of built links
  const adj = new Map<string, Array<{ neighbor: string; link: BoardLink }>>();
  for (const node of getAllGridNodes()) {
    adj.set(node, []);
  }
  for (const link of Object.values(board.links)) {
    const { nodeA, nodeB } = parseEdgeId(link.id);
    adj.get(nodeA)?.push({ neighbor: nodeB, link });
    adj.get(nodeB)?.push({ neighbor: nodeA, link });
  }
  // Sort adjacency lists deterministically by neighbor key
  for (const list of adj.values()) {
    list.sort((a, b) => a.neighbor.localeCompare(b.neighbor));
  }

  let remainingGenMW = scenario.generator.outputMW;
  const districtAllocations: PowerFlowResult['districtAllocations'] = {
    D1: { demandMW: 0, deliveredMW: 0, unmetMW: 0, paths: [] },
    D2: { demandMW: 0, deliveredMW: 0, unmetMW: 0, paths: [] },
    D3: { demandMW: 0, deliveredMW: 0, unmetMW: 0, paths: [] },
    D4: { demandMW: 0, deliveredMW: 0, unmetMW: 0, paths: [] },
    D5: { demandMW: 0, deliveredMW: 0, unmetMW: 0, paths: [] },
  };

  for (const d of sortedDistricts) {
    const demandMW =
      demandOverrides?.[d.id] !== undefined
        ? demandOverrides[d.id]!
        : d.demandCurve[clampedTurnIdx];
    const targetNode = coordKey(d.row, d.col);
    let deliveredMW = 0;
    const pathsUsed: string[][] = [];

    let needed = Math.min(demandMW, remainingGenMW);
    while (needed > 0) {
      // BFS for shortest augmenting path from genNode to targetNode
      // Only traverse intact links where:
      // - reverse flow is 0 (single-direction flow along each physical link)
      // - forward residual capacity > 0
      const queue: string[] = [genNode];
      const parent = new Map<string, { prev: string; link: BoardLink }>();
      const visited = new Set<string>([genNode]);

      while (queue.length > 0 && !visited.has(targetNode)) {
        const u = queue.shift()!;
        const neighbors = adj.get(u) ?? [];
        for (const { neighbor: v, link } of neighbors) {
          if (visited.has(v)) continue;
          if (link.status !== 'intact') continue;
          if (!canTraverseDirected(link, u, v)) continue;

          const cap = CONFIG.LINKS[link.type].capacityMW;
          const revFlow = getDirectedFlow(v, u);
          const fwdFlow = getDirectedFlow(u, v);
          const residual = cap - fwdFlow + revFlow;
          if (residual <= 0) continue;

          visited.add(v);
          parent.set(v, { prev: u, link });
          queue.push(v);
        }
      }

      if (!visited.has(targetNode)) {
        break;
      }

      // Reconstruct path and find bottleneck residual capacity
      const pathNodes: string[] = [targetNode];
      const pathSteps: Array<{ u: string; v: string; link: BoardLink }> = [];
      let curr = targetNode;
      let pathResidual = needed;

      while (curr !== genNode) {
        const step = parent.get(curr)!;
        pathSteps.push({ u: step.prev, v: curr, link: step.link });
        pathNodes.push(step.prev);
        const cap = CONFIG.LINKS[step.link.type].capacityMW;
        const fwdFlow = getDirectedFlow(step.prev, curr);
        const revFlow = getDirectedFlow(curr, step.prev);
        pathResidual = Math.min(pathResidual, cap - fwdFlow + revFlow);
        curr = step.prev;
      }

      pathNodes.reverse();
      pathSteps.reverse();

      const pushMW = Math.min(needed, pathResidual);
      if (pushMW <= 0) break;

      for (const step of pathSteps) {
        const currentFwd = getDirectedFlow(step.u, step.v);
        const currentRev = getDirectedFlow(step.v, step.u);
        const net = currentFwd - currentRev + pushMW;
        if (net >= 0) {
          setDirectedFlow(step.u, step.v, net);
          setDirectedFlow(step.v, step.u, 0);
        } else {
          setDirectedFlow(step.u, step.v, 0);
          setDirectedFlow(step.v, step.u, -net);
        }
        const contribMap = edgeContributors.get(step.link.id)!;
        contribMap.set(d.id, (contribMap.get(d.id) ?? 0) + pushMW);
      }

      deliveredMW += pushMW;
      needed -= pushMW;
      remainingGenMW -= pushMW;
      pathsUsed.push(pathNodes);
    }

    districtAllocations[d.id] = {
      demandMW,
      deliveredMW,
      unmetMW: Math.max(0, demandMW - deliveredMW),
      paths: pathsUsed,
    };
  }

  // Cycle cancellation & DAG verification pass:
  // If any directed cycle of positive flow exists, cancel it so energy never circulates in a loop.
  let hasDirectedCycle = false;
  const cancelDirectedCycles = () => {
    const activeNodes = getAllGridNodes();
    while (true) {
      const state = new Map<string, 0 | 1 | 2>(); // 0 unvisited, 1 visiting, 2 visited
      const parentNode = new Map<string, string>();
      let cycleStart: string | null = null;
      let cycleEnd: string | null = null;

      const dfs = (u: string): boolean => {
        state.set(u, 1);
        const neighbors = adj.get(u) ?? [];
        for (const { neighbor: v } of neighbors) {
          if (getDirectedFlow(u, v) <= 0) continue;
          const vState = state.get(v) ?? 0;
          if (vState === 1) {
            cycleStart = v;
            cycleEnd = u;
            return true;
          }
          if (vState === 0) {
            parentNode.set(v, u);
            if (dfs(v)) return true;
          }
        }
        state.set(u, 2);
        return false;
      };

      let found = false;
      for (const node of activeNodes) {
        if ((state.get(node) ?? 0) === 0) {
          if (dfs(node)) {
            found = true;
            break;
          }
        }
      }

      if (!found || !cycleStart || !cycleEnd) break;

      // Reconstruct cycle edges and subtract minimum flow around the cycle
      const cyclePairs: Array<{ u: string; v: string }> = [
        { u: cycleEnd, v: cycleStart },
      ];
      let cur: string = cycleEnd;
      while (cur !== cycleStart) {
        const prev = parentNode.get(cur)!;
        cyclePairs.push({ u: prev, v: cur });
        cur = prev;
      }
      let minCycleFlow = Infinity;
      for (const pair of cyclePairs) {
        minCycleFlow = Math.min(minCycleFlow, getDirectedFlow(pair.u, pair.v));
      }
      if (minCycleFlow <= 0 || !Number.isFinite(minCycleFlow)) break;
      for (const pair of cyclePairs) {
        setDirectedFlow(pair.u, pair.v, getDirectedFlow(pair.u, pair.v) - minCycleFlow);
      }
    }
  };
  cancelDirectedCycles();

  // Verify DAG property (hasDirectedCycle === false)
  {
    const state = new Map<string, 0 | 1 | 2>();
    const checkDfs = (u: string): boolean => {
      state.set(u, 1);
      for (const { neighbor: v } of adj.get(u) ?? []) {
        if (getDirectedFlow(u, v) <= 0) continue;
        const s = state.get(v) ?? 0;
        if (s === 1) return true;
        if (s === 0 && checkDfs(v)) return true;
      }
      state.set(u, 2);
      return false;
    };
    for (const node of getAllGridNodes()) {
      if ((state.get(node) ?? 0) === 0 && checkDfs(node)) {
        hasDirectedCycle = true;
        break;
      }
    }
  }

  // Build EdgeFlowAllocation records
  const edgeFlows: Record<string, EdgeFlowAllocation> = {};
  for (const link of Object.values(board.links)) {
    const { nodeA, nodeB } = parseEdgeId(link.id);
    const flowAB = getDirectedFlow(nodeA, nodeB);
    const flowBA = getDirectedFlow(nodeB, nodeA);
    const flowMW = Math.max(flowAB, flowBA);
    const fromNode = flowBA > flowAB ? nodeB : nodeA;
    const toNode = flowBA > flowAB ? nodeA : nodeB;
    const capacityMW = link.status === 'intact' ? CONFIG.LINKS[link.type].capacityMW : 0;

    const contribMap = edgeContributors.get(link.id)!;
    const contributors: Array<{ districtId: DistrictSpec['id']; mw: number }> = [];
    for (const [dId, mw] of contribMap.entries()) {
      if (mw > 0) contributors.push({ districtId: dId, mw });
    }

    edgeFlows[link.id] = {
      edgeId: link.id,
      type: link.type,
      status: link.status,
      capacityMW,
      flowMW,
      fromNode,
      toNode,
      isSaturated: link.status === 'intact' && flowMW >= capacityMW && capacityMW > 0,
      isDamagedBottleneck: false,
      contributors,
    };
  }

  // Compute exact diagnostics for each district
  const diagnostics = {} as Record<DistrictSpec['id'], DistrictDiagnostic>;

  // Helper: find shortest path in physical built graph (ignoring damage & saturation)
  const findBuiltPath = (targetNode: string, intactOnly: boolean): BoardLink[] | null => {
    const q: string[] = [genNode];
    const vis = new Set<string>([genNode]);
    const par = new Map<string, { prev: string; link: BoardLink }>();
    while (q.length > 0 && !vis.has(targetNode)) {
      const u = q.shift()!;
      for (const { neighbor: v, link } of adj.get(u) ?? []) {
        if (vis.has(v)) continue;
        if (intactOnly && link.status !== 'intact') continue;
        if (!canTraverseDirected(link, u, v)) continue;
        vis.add(v);
        par.set(v, { prev: u, link });
        q.push(v);
      }
    }
    if (!vis.has(targetNode)) return null;
    const links: BoardLink[] = [];
    let cur = targetNode;
    while (cur !== genNode) {
      const step = par.get(cur)!;
      links.push(step.link);
      cur = step.prev;
    }
    links.reverse();
    return links;
  };

  // Compute residual reachable set S from genNode on intact links
  const residualReachable = new Set<string>([genNode]);
  {
    const q: string[] = [genNode];
    while (q.length > 0) {
      const u = q.shift()!;
      for (const { neighbor: v, link } of adj.get(u) ?? []) {
        if (residualReachable.has(v)) continue;
        if (link.status !== 'intact') continue;
        if (!canTraverseDirected(link, u, v)) continue;
        const cap = CONFIG.LINKS[link.type].capacityMW;
        const revFlow = getDirectedFlow(v, u);
        const fwdFlow = getDirectedFlow(u, v);
        if (cap - fwdFlow + revFlow <= 0) continue;
        residualReachable.add(v);
        q.push(v);
      }
    }
  }

  for (const d of sortedDistricts) {
    const alloc = districtAllocations[d.id];
    const targetNode = coordKey(d.row, d.col);

    if (alloc.unmetMW <= 0) {
      diagnostics[d.id] = {
        districtId: d.id,
        districtName: d.name,
        priority: d.priority,
        reason: 'OK',
        demandMW: alloc.demandMW,
        deliveredMW: alloc.deliveredMW,
        unmetMW: 0,
        bottleneckEdgeIds: [],
        explanation: `${d.id} (${d.name}, P${d.priority}) is fully powered (${alloc.deliveredMW}/${alloc.demandMW} MW).`,
      };
      continue;
    }

    const builtPathAll = findBuiltPath(targetNode, false);
    const builtPathIntact = findBuiltPath(targetNode, true);

    if (!builtPathAll) {
      diagnostics[d.id] = {
        districtId: d.id,
        districtName: d.name,
        priority: d.priority,
        reason: 'DISCONNECTED_NO_PATH',
        demandMW: alloc.demandMW,
        deliveredMW: alloc.deliveredMW,
        unmetMW: alloc.unmetMW,
        bottleneckEdgeIds: [],
        explanation: `${d.id} (${d.name}, P${d.priority}) is DISCONNECTED (${alloc.deliveredMW}/${alloc.demandMW} MW): no link path reaches (${targetNode}).`,
      };
      continue;
    }

    if (!builtPathIntact) {
      const damagedEdges = builtPathAll
        .filter((l) => l.status === 'damaged')
        .map((l) => l.id);
      for (const eId of damagedEdges) {
        if (edgeFlows[eId]) edgeFlows[eId].isDamagedBottleneck = true;
      }
      const edgeLabels = damagedEdges.map(formatEdgeLabel).join(', ');
      diagnostics[d.id] = {
        districtId: d.id,
        districtName: d.name,
        priority: d.priority,
        reason: 'DAMAGED_LINE_OUTAGE',
        demandMW: alloc.demandMW,
        deliveredMW: alloc.deliveredMW,
        unmetMW: alloc.unmetMW,
        bottleneckEdgeIds: damagedEdges,
        explanation: `${d.id} (${d.name}, P${d.priority}) is CUT OFF by storm damage on ${edgeLabels} (short ${alloc.unmetMW} MW). Repair the damaged link or complete a bypass loop.`,
      };
      continue;
    }

    if (remainingGenMW <= 0 && residualReachable.has(targetNode)) {
      diagnostics[d.id] = {
        districtId: d.id,
        districtName: d.name,
        priority: d.priority,
        reason: 'GENERATOR_CAPACITY_EXHAUSTED',
        demandMW: alloc.demandMW,
        deliveredMW: alloc.deliveredMW,
        unmetMW: alloc.unmetMW,
        bottleneckEdgeIds: [],
        explanation: `${d.id} (${d.name}, P${d.priority}) is short ${alloc.unmetMW} MW: Central Generator output (${scenario.generator.outputMW} MW) is exhausted by higher-priority districts.`,
      };
      continue;
    }

    // Otherwise, find exact saturated or damaged bottleneck cut edges along paths from genNode to targetNode!
    // Look at the shortest intact path(s) to targetNode and find where they cross out of residualReachable:
    const bottleneckEdgeIds: string[] = [];
    for (const link of builtPathIntact) {
      const ef = edgeFlows[link.id];
      if (ef && ef.isSaturated && !bottleneckEdgeIds.includes(link.id)) {
        bottleneckEdgeIds.push(link.id);
      }
    }
    // Also check if a damaged parallel path existed that could have relieved the bottleneck
    for (const link of builtPathAll) {
      if (link.status === 'damaged' && !bottleneckEdgeIds.includes(link.id)) {
        bottleneckEdgeIds.push(link.id);
        if (edgeFlows[link.id]) edgeFlows[link.id].isDamagedBottleneck = true;
      }
    }
    if (bottleneckEdgeIds.length === 0) {
      // Fallback: any saturated edge leaving residualReachable
      for (const u of residualReachable) {
        for (const { neighbor: v, link } of adj.get(u) ?? []) {
          if (!residualReachable.has(v) && edgeFlows[link.id]?.isSaturated) {
            if (!bottleneckEdgeIds.includes(link.id)) {
              bottleneckEdgeIds.push(link.id);
            }
          }
        }
      }
    }

    const firstEdgeId = bottleneckEdgeIds[0];
    const firstEdgeFlow = firstEdgeId ? edgeFlows[firstEdgeId] : undefined;
    const edgeDesc = firstEdgeId
      ? `${formatEdgeLabel(firstEdgeId)} (${firstEdgeFlow?.flowMW ?? 0}/${firstEdgeFlow?.capacityMW ?? 0} MW)`
      : 'upstream feeder';

    diagnostics[d.id] = {
      districtId: d.id,
      districtName: d.name,
      priority: d.priority,
      reason: 'CAPACITY_BOTTLENECK',
      demandMW: alloc.demandMW,
      deliveredMW: alloc.deliveredMW,
      unmetMW: alloc.unmetMW,
      bottleneckEdgeIds,
      explanation: `${d.id} (${d.name}, P${d.priority}) short by ${alloc.unmetMW} MW (${alloc.deliveredMW}/${alloc.demandMW} MW): shared link ${edgeDesc} is saturated. Upgrade to Heavy Trunk (8 MW) or add a bypass loop.`,
    };
  }

  // Determine which Substation Relays are energized (connected to genNode via intact links)
  const intactReachable = new Set<string>([genNode]);
  {
    const q: string[] = [genNode];
    while (q.length > 0) {
      const u = q.shift()!;
      for (const { neighbor: v, link } of adj.get(u) ?? []) {
        if (intactReachable.has(v)) continue;
        if (link.status !== 'intact') continue;
        intactReachable.add(v);
        q.push(v);
      }
    }
  }
  const energizedRelayIds = scenario.relays
    .filter((r) => intactReachable.has(coordKey(r.row, r.col)))
    .map((r) => r.id);

  let totalDemandMW = 0;
  let totalDeliveredMW = 0;
  let totalUnmetMW = 0;
  for (const d of sortedDistricts) {
    const a = districtAllocations[d.id];
    totalDemandMW += a.demandMW;
    totalDeliveredMW += a.deliveredMW;
    totalUnmetMW += a.unmetMW;
  }

  return {
    generatorOutputMW: scenario.generator.outputMW,
    generatorUsedMW: totalDeliveredMW,
    totalDemandMW,
    totalDeliveredMW,
    totalUnmetMW,
    edgeFlows,
    districtAllocations,
    diagnostics,
    energizedRelayIds,
    hasDirectedCycle,
  };
}

export function resolveStormStrikesForTurn(
  board: BoardState,
  scenario: ScenarioSpec,
  turn: number,
): { postStrikeBoard: BoardState; reports: StrikeResolutionReport[] } {
  const postStrikeBoard = cloneBoard(board);
  const strikes = scenario.stormStrikes.filter((s) => s.turn === turn);
  const reports: StrikeResolutionReport[] = [];

  for (const strike of strikes) {
    const link = postStrikeBoard.links[strike.edgeId];
    if (!link) {
      reports.push({
        edgeId: strike.edgeId,
        severity: strike.severity,
        label: strike.label,
        outcome: 'missed_no_link',
      });
      continue;
    }
    if (link.status === 'damaged') {
      reports.push({
        edgeId: strike.edgeId,
        severity: strike.severity,
        label: strike.label,
        outcome: 'already_damaged',
        linkType: link.type,
      });
      continue;
    }
    if (strike.severity === 'wind' && CONFIG.LINKS[link.type].windImmune) {
      reports.push({
        edgeId: strike.edgeId,
        severity: strike.severity,
        label: strike.label,
        outcome: 'deflected',
        linkType: link.type,
      });
      continue;
    }
    link.status = 'damaged';
    reports.push({
      edgeId: strike.edgeId,
      severity: strike.severity,
      label: strike.label,
      outcome: 'damaged',
      linkType: link.type,
    });
  }

  return { postStrikeBoard, reports };
}

export function previewTurnOutcome(state: GameState): TurnPreview {
  const turnIdx = Math.max(0, Math.min(CONFIG.TOTAL_TURNS - 1, state.turn - 1));
  const { postStrikeBoard, reports } = resolveStormStrikesForTurn(
    state.board,
    state.scenario,
    state.turn,
  );
  const flow = resolvePowerFlow(postStrikeBoard, state.scenario, undefined, turnIdx);
  const projectedMaterialIncome =
    CONFIG.BASE_MATERIAL_INCOME_PER_TURN +
    flow.energizedRelayIds.length * CONFIG.RELAY_MATERIAL_BONUS_PER_TURN;

  const projectedCityCumulativeUnmetMW = state.cityCumulativeUnmetMW + flow.totalUnmetMW;
  const willFailCity = projectedCityCumulativeUnmetMW > state.scenario.cityOutageThresholdMW;

  const failingDistrictIds: DistrictSpec['id'][] = [];
  for (const d of state.scenario.districts) {
    const currentCum = state.districts[d.id].cumulativeUnmetMW;
    const turnUnmet = flow.districtAllocations[d.id].unmetMW;
    if (currentCum + turnUnmet > d.unmetLimitMW) {
      failingDistrictIds.push(d.id);
    }
  }

  return {
    turn: state.turn,
    imminentStrikes: reports,
    postStrikeBoard,
    flow,
    projectedMaterialIncome,
    projectedCityCumulativeUnmetMW,
    willFailCity,
    failingDistrictIds,
  };
}

export function createInitialGameState(scenario: ScenarioSpec = SCENARIO_1_HARBOR_SQUALL): GameState {
  const links: Record<string, BoardLink> = {};
  for (const init of scenario.initialLinks) {
    const id = makeEdgeId(init.from, init.to);
    links[id] = {
      id,
      type: init.type,
      status: init.status ?? 'intact',
      directionConstraint: init.directionConstraint ?? 'auto',
    };
  }

  const board: BoardState = { links };
  const districts = {} as Record<DistrictSpec['id'], DistrictState>;
  for (const d of scenario.districts) {
    districts[d.id] = {
      id: d.id,
      name: d.name,
      shortCode: d.shortCode,
      priority: d.priority,
      row: d.row,
      col: d.col,
      demandCurve: d.demandCurve,
      unmetLimitMW: d.unmetLimitMW,
      cumulativeUnmetMW: 0,
      lastTurnDeliveredMW: 0,
      lastTurnUnmetMW: 0,
    };
  }

  const state: GameState = {
    rulesVersion: CONFIG.RULES_VERSION,
    scenarioId: scenario.id,
    scenario,
    turn: 1,
    status: 'playing',
    lossReason: null,
    materials: scenario.startingMaterials,
    actionsRemaining: CONFIG.MAX_ACTIONS_PER_TURN,
    board,
    districts,
    cityCumulativeUnmetMW: 0,
    stagedActions: [],
    turnStartSnapshot: {
      board: cloneBoard(board),
      materials: scenario.startingMaterials,
      actionsRemaining: CONFIG.MAX_ACTIONS_PER_TURN,
    },
    preview: null as unknown as TurnPreview,
    history: [],
  };

  state.preview = previewTurnOutcome(state);
  return state;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function validateEdgeEndpoints(scenario: ScenarioSpec, edgeId: string): ActionResult {
  const { coordA, coordB } = parseEdgeId(edgeId);
  if (
    coordA.row < 0 ||
    coordA.row >= CONFIG.GRID_SIZE ||
    coordA.col < 0 ||
    coordA.col >= CONFIG.GRID_SIZE ||
    coordB.row < 0 ||
    coordB.row >= CONFIG.GRID_SIZE ||
    coordB.col < 0 ||
    coordB.col >= CONFIG.GRID_SIZE
  ) {
    return { ok: false, error: 'Coordinates out of 8x8 board bounds.' };
  }
  if (!isOrthogonallyAdjacent(coordA, coordB)) {
    return { ok: false, error: 'Links can only connect orthogonally adjacent cells.' };
  }
  if (isBlockedCoord(scenario, coordA) || isBlockedCoord(scenario, coordB)) {
    return { ok: false, error: 'Cannot build across blocked harbor/ridge terrain.' };
  }
  return { ok: true };
}

export function stagePlaceLink(
  state: GameState,
  edgeId: string,
  linkType: LinkType,
): ActionResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game has already ended.' };
  }
  if (state.actionsRemaining <= 0) {
    return { ok: false, error: 'No Actions remaining this turn (max 2 per turn). Undo or Commit Turn.' };
  }
  const canonicalId = makeEdgeId(parseEdgeId(edgeId).coordA, parseEdgeId(edgeId).coordB);
  const valid = validateEdgeEndpoints(state.scenario, canonicalId);
  if (!valid.ok) return valid;

  if (state.board.links[canonicalId]) {
    return { ok: false, error: 'A link already exists on this corridor. Use Upgrade or Repair instead.' };
  }

  const cost = CONFIG.LINKS[linkType].buildCostMat;
  if (state.materials < cost) {
    return { ok: false, error: `Insufficient Materials: need ${cost} Mat, have ${state.materials} Mat.` };
  }

  const record: StagedActionRecord = {
    type: 'place',
    description: `Place ${CONFIG.LINKS[linkType].name} at ${formatEdgeLabel(canonicalId)} (-${cost} Mat)`,
    edgeId: canonicalId,
    linkType,
    costMat: cost,
    previousBoard: cloneBoard(state.board),
    previousMaterials: state.materials,
    previousActionsRemaining: state.actionsRemaining,
  };

  state.board.links[canonicalId] = {
    id: canonicalId,
    type: linkType,
    status: 'intact',
    directionConstraint: 'auto',
  };
  state.materials -= cost;
  state.actionsRemaining -= 1;
  state.stagedActions.push(record);
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function stageRepairLink(state: GameState, edgeId: string): ActionResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game has already ended.' };
  }
  if (state.actionsRemaining <= 0) {
    return { ok: false, error: 'No Actions remaining this turn (max 2 per turn).' };
  }
  const canonicalId = makeEdgeId(parseEdgeId(edgeId).coordA, parseEdgeId(edgeId).coordB);
  const existing = state.board.links[canonicalId];
  if (!existing) {
    return { ok: false, error: 'No link on this corridor to repair.' };
  }
  if (existing.status === 'intact') {
    return { ok: false, error: 'Link is already intact.' };
  }

  const cost = CONFIG.LINKS[existing.type].repairCostMat;
  if (state.materials < cost) {
    return { ok: false, error: `Insufficient Materials to repair: need ${cost} Mat, have ${state.materials} Mat.` };
  }

  const record: StagedActionRecord = {
    type: 'repair',
    description: `Repair ${CONFIG.LINKS[existing.type].name} at ${formatEdgeLabel(canonicalId)} (-${cost} Mat)`,
    edgeId: canonicalId,
    linkType: existing.type,
    costMat: cost,
    previousBoard: cloneBoard(state.board),
    previousMaterials: state.materials,
    previousActionsRemaining: state.actionsRemaining,
  };

  existing.status = 'intact';
  state.materials -= cost;
  state.actionsRemaining -= 1;
  state.stagedActions.push(record);
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function stageUpgradeLink(
  state: GameState,
  edgeId: string,
  targetType: LinkType,
): ActionResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game has already ended.' };
  }
  if (state.actionsRemaining <= 0) {
    return { ok: false, error: 'No Actions remaining this turn (max 2 per turn).' };
  }
  const canonicalId = makeEdgeId(parseEdgeId(edgeId).coordA, parseEdgeId(edgeId).coordB);
  const existing = state.board.links[canonicalId];
  if (!existing) {
    return { ok: false, error: 'No existing link on this corridor to upgrade. Use Place instead.' };
  }
  if (existing.type === targetType && existing.status === 'intact') {
    return { ok: false, error: `Link is already an intact ${CONFIG.LINKS[targetType].name}.` };
  }

  const cost = getUpgradeCostMat(existing.type, targetType, existing.status === 'damaged');
  if (state.materials < cost) {
    return { ok: false, error: `Insufficient Materials to upgrade: need ${cost} Mat, have ${state.materials} Mat.` };
  }

  const record: StagedActionRecord = {
    type: 'upgrade',
    description: `Upgrade ${formatEdgeLabel(canonicalId)} to ${CONFIG.LINKS[targetType].name} (-${cost} Mat)`,
    edgeId: canonicalId,
    linkType: targetType,
    costMat: cost,
    previousBoard: cloneBoard(state.board),
    previousMaterials: state.materials,
    previousActionsRemaining: state.actionsRemaining,
  };

  existing.type = targetType;
  existing.status = 'intact';
  state.materials -= cost;
  state.actionsRemaining -= 1;
  state.stagedActions.push(record);
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function stageRerouteLink(
  state: GameState,
  fromEdgeId: string,
  options: { toEdgeId?: string; directionConstraint?: FlowDirectionConstraint },
): ActionResult {
  if (state.status !== 'playing') {
    return { ok: false, error: 'Game has already ended.' };
  }
  if (state.actionsRemaining <= 0) {
    return { ok: false, error: 'No Actions remaining this turn (max 2 per turn).' };
  }
  const canonicalFrom = makeEdgeId(parseEdgeId(fromEdgeId).coordA, parseEdgeId(fromEdgeId).coordB);
  const existing = state.board.links[canonicalFrom];
  if (!existing) {
    return { ok: false, error: 'No link at source corridor to reroute.' };
  }

  const cost = CONFIG.REROUTE_COST_MAT;
  if (state.materials < cost) {
    return { ok: false, error: `Insufficient Materials to reroute: need ${cost} Mat.` };
  }

  if (options.toEdgeId) {
    const canonicalTo = makeEdgeId(
      parseEdgeId(options.toEdgeId).coordA,
      parseEdgeId(options.toEdgeId).coordB,
    );
    const valid = validateEdgeEndpoints(state.scenario, canonicalTo);
    if (!valid.ok) return valid;
    if (state.board.links[canonicalTo]) {
      return { ok: false, error: 'Destination corridor already has a link.' };
    }

    const record: StagedActionRecord = {
      type: 'reroute',
      description: `Reroute ${CONFIG.LINKS[existing.type].name} ${formatEdgeLabel(canonicalFrom)} → ${formatEdgeLabel(canonicalTo)} (-${cost} Mat)`,
      edgeId: canonicalFrom,
      targetEdgeId: canonicalTo,
      linkType: existing.type,
      costMat: cost,
      previousBoard: cloneBoard(state.board),
      previousMaterials: state.materials,
      previousActionsRemaining: state.actionsRemaining,
    };

    delete state.board.links[canonicalFrom];
    state.board.links[canonicalTo] = {
      id: canonicalTo,
      type: existing.type,
      status: existing.status,
      directionConstraint: options.directionConstraint ?? 'auto',
    };
    state.materials -= cost;
    state.actionsRemaining -= 1;
    state.stagedActions.push(record);
    state.preview = previewTurnOutcome(state);
    return { ok: true };
  }

  // Toggle direction constraint on the same edge
  const nextDir: FlowDirectionConstraint =
    options.directionConstraint ??
    (existing.directionConstraint === 'auto'
      ? 'forward'
      : existing.directionConstraint === 'forward'
        ? 'reverse'
        : 'auto');

  const record: StagedActionRecord = {
    type: 'reroute',
    description: `Set flow gate on ${formatEdgeLabel(canonicalFrom)} to ${nextDir.toUpperCase()} (-${cost} Mat)`,
    edgeId: canonicalFrom,
    linkType: existing.type,
    costMat: cost,
    previousBoard: cloneBoard(state.board),
    previousMaterials: state.materials,
    previousActionsRemaining: state.actionsRemaining,
  };

  existing.directionConstraint = nextDir;
  state.materials -= cost;
  state.actionsRemaining -= 1;
  state.stagedActions.push(record);
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function undoLastStagedAction(state: GameState): ActionResult {
  const last = state.stagedActions.pop();
  if (!last) {
    return { ok: false, error: 'No staged actions to undo this turn.' };
  }
  state.board = cloneBoard(last.previousBoard);
  state.materials = last.previousMaterials;
  state.actionsRemaining = last.previousActionsRemaining;
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function resetStagedActions(state: GameState): ActionResult {
  if (state.stagedActions.length === 0) {
    return { ok: false, error: 'No staged actions to reset.' };
  }
  state.board = cloneBoard(state.turnStartSnapshot.board);
  state.materials = state.turnStartSnapshot.materials;
  state.actionsRemaining = state.turnStartSnapshot.actionsRemaining;
  state.stagedActions = [];
  state.preview = previewTurnOutcome(state);
  return { ok: true };
}

export function commitTurn(state: GameState): TurnPreview {
  if (state.status !== 'playing') {
    return state.preview;
  }

  const outcome = previewTurnOutcome(state);
  state.board = cloneBoard(outcome.postStrikeBoard);
  state.cityCumulativeUnmetMW = outcome.projectedCityCumulativeUnmetMW;

  for (const d of state.scenario.districts) {
    const alloc = outcome.flow.districtAllocations[d.id];
    const distState = state.districts[d.id];
    distState.lastTurnDeliveredMW = alloc.deliveredMW;
    distState.lastTurnUnmetMW = alloc.unmetMW;
    distState.cumulativeUnmetMW += alloc.unmetMW;
  }

  state.history.push({
    turn: state.turn,
    strikes: outcome.imminentStrikes,
    totalDemandMW: outcome.flow.totalDemandMW,
    totalDeliveredMW: outcome.flow.totalDeliveredMW,
    totalUnmetMW: outcome.flow.totalUnmetMW,
    materialIncome: outcome.projectedMaterialIncome,
    diagnostics: outcome.flow.diagnostics,
  });

  if (outcome.failingDistrictIds.length > 0) {
    const failedId = outcome.failingDistrictIds[0];
    const dState = state.districts[failedId];
    const diag = outcome.flow.diagnostics[failedId];
    state.status = 'lost';
    state.lossReason = `CRITICAL DISTRICT BLACKOUT: ${dState.id} (${dState.name}) reached ${dState.cumulativeUnmetMW}/${dState.unmetLimitMW} MW cumulative unmet demand. ${diag.explanation}`;
    state.stagedActions = [];
    return outcome;
  }

  if (outcome.willFailCity) {
    state.status = 'lost';
    state.lossReason = `CITY-WIDE GRID COLLAPSE: Cumulative city unmet demand reached ${state.cityCumulativeUnmetMW}/${state.scenario.cityOutageThresholdMW} MW.`;
    state.stagedActions = [];
    return outcome;
  }

  if (state.turn >= CONFIG.TOTAL_TURNS) {
    state.status = 'won';
    state.stagedActions = [];
    return outcome;
  }

  state.turn += 1;
  state.materials += outcome.projectedMaterialIncome;
  state.actionsRemaining = CONFIG.MAX_ACTIONS_PER_TURN;
  state.stagedActions = [];
  state.turnStartSnapshot = {
    board: cloneBoard(state.board),
    materials: state.materials,
    actionsRemaining: CONFIG.MAX_ACTIONS_PER_TURN,
  };
  state.preview = previewTurnOutcome(state);
  return outcome;
}

export function getForecastStrikes(
  scenario: ScenarioSpec,
  currentTurn: number,
): {
  imminent: StormStrike[];
  turnPlus1: StormStrike[];
  turnPlus2: StormStrike[];
} {
  return {
    imminent: scenario.stormStrikes.filter((s) => s.turn === currentTurn),
    turnPlus1: scenario.stormStrikes.filter((s) => s.turn === currentTurn + 1),
    turnPlus2: scenario.stormStrikes.filter((s) => s.turn === currentTurn + 2),
  };
}

// ============================================================================
// Documented Strategy Scripts for Automated Verification & Solver Proof
// ============================================================================

export type ScriptedTurnAction =
  | { kind: 'place'; from: GridCoord; to: GridCoord; linkType: LinkType }
  | { kind: 'upgrade'; from: GridCoord; to: GridCoord; linkType: LinkType }
  | { kind: 'repair'; from: GridCoord; to: GridCoord };

export type StrategyScript = Record<number, ScriptedTurnAction[]>;

/**
 * Strategy 1: Single Trunk Efficiency ("Efficient Trunk")
 * Upgrades shared radial trunks to Heavy Trunk (8 MW) and armors storm-targeted
 * segments with Storm-Shielded Conduits (5 MW). Zero redundant loops built.
 */
export const SCENARIO_1_EFFICIENT_TRUNK_SCRIPT: StrategyScript = {
  1: [
    { kind: 'place', from: { row: 3, col: 2 }, to: { row: 3, col: 3 }, linkType: 'standard' },
    { kind: 'place', from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, linkType: 'standard' },
  ],
  2: [
    { kind: 'upgrade', from: { row: 3, col: 2 }, to: { row: 3, col: 3 }, linkType: 'heavy' },
    { kind: 'place', from: { row: 2, col: 5 }, to: { row: 2, col: 6 }, linkType: 'standard' },
  ],
  3: [
    { kind: 'upgrade', from: { row: 1, col: 3 }, to: { row: 1, col: 4 }, linkType: 'heavy' },
    { kind: 'upgrade', from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, linkType: 'shielded' },
  ],
  4: [
    { kind: 'upgrade', from: { row: 2, col: 4 }, to: { row: 2, col: 5 }, linkType: 'shielded' },
  ],
  5: [
    { kind: 'upgrade', from: { row: 5, col: 3 }, to: { row: 5, col: 4 }, linkType: 'shielded' },
  ],
  6: [
    { kind: 'upgrade', from: { row: 1, col: 4 }, to: { row: 2, col: 4 }, linkType: 'shielded' },
  ],
};

/**
 * Strategy 2: Redundant Storm Loop ("Redundant Loop")
 * Builds cross-corridor ring ties ((4,4)↔(3,4), (3,5)↔(2,5), (4,3)↔(4,4), (2,4)↔(3,4))
 * using ONLY Standard and Heavy links (zero Storm-Shielded Conduits used!).
 * Survives every storm strike via automatic loop rerouting and post-strike repair.
 */
export const SCENARIO_1_REDUNDANT_LOOP_SCRIPT: StrategyScript = {
  1: [
    { kind: 'place', from: { row: 3, col: 2 }, to: { row: 3, col: 3 }, linkType: 'standard' },
    { kind: 'place', from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, linkType: 'standard' },
  ],
  2: [
    { kind: 'place', from: { row: 4, col: 4 }, to: { row: 3, col: 4 }, linkType: 'standard' },
    { kind: 'place', from: { row: 2, col: 5 }, to: { row: 2, col: 6 }, linkType: 'standard' },
  ],
  3: [
    { kind: 'place', from: { row: 3, col: 5 }, to: { row: 2, col: 5 }, linkType: 'standard' },
    { kind: 'upgrade', from: { row: 5, col: 3 }, to: { row: 5, col: 4 }, linkType: 'heavy' },
  ],
  4: [
    { kind: 'upgrade', from: { row: 5, col: 4 }, to: { row: 4, col: 4 }, linkType: 'heavy' },
    { kind: 'upgrade', from: { row: 4, col: 4 }, to: { row: 3, col: 4 }, linkType: 'heavy' },
  ],
  5: [
    { kind: 'upgrade', from: { row: 1, col: 3 }, to: { row: 1, col: 4 }, linkType: 'heavy' },
    { kind: 'upgrade', from: { row: 3, col: 4 }, to: { row: 3, col: 5 }, linkType: 'heavy' },
  ],
  6: [
    { kind: 'repair', from: { row: 3, col: 3 }, to: { row: 3, col: 4 } },
    { kind: 'upgrade', from: { row: 3, col: 2 }, to: { row: 3, col: 3 }, linkType: 'heavy' },
  ],
  7: [
    { kind: 'upgrade', from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, linkType: 'heavy' },
    { kind: 'place', from: { row: 4, col: 3 }, to: { row: 4, col: 4 }, linkType: 'heavy' },
  ],
  8: [
    { kind: 'repair', from: { row: 2, col: 4 }, to: { row: 2, col: 5 } },
    { kind: 'place', from: { row: 1, col: 3 }, to: { row: 2, col: 3 }, linkType: 'standard' },
  ],
  9: [
    { kind: 'place', from: { row: 2, col: 3 }, to: { row: 2, col: 4 }, linkType: 'standard' },
    { kind: 'repair', from: { row: 5, col: 3 }, to: { row: 5, col: 4 } },
  ],
};

/**
 * Strategy 3: Neglect / Under-Built Script (Triggers documented blackout failure)
 * Connects D1 and D2 on Turn 1 with a single Standard Line (4 MW), then ignores
 * the Turn 2 capacity bottleneck and Turn 4 storm strike, causing D2 to exceed
 * its unmet-demand tolerance with an explicit bottleneck/outage diagnostic.
 */
export const SCENARIO_1_NEGLECT_LOSS_SCRIPT: StrategyScript = {
  1: [
    { kind: 'place', from: { row: 3, col: 2 }, to: { row: 3, col: 3 }, linkType: 'standard' },
    { kind: 'place', from: { row: 3, col: 3 }, to: { row: 3, col: 4 }, linkType: 'standard' },
  ],
};

export function runStrategyScript(
  scenario: ScenarioSpec,
  script: StrategyScript,
): GameState {
  const state = createInitialGameState(scenario);
  while (state.status === 'playing') {
    const actions = script[state.turn] ?? [];
    for (const act of actions) {
      const edgeId = makeEdgeId(act.from, act.to);
      let res: ActionResult;
      if (act.kind === 'place') {
        res = stagePlaceLink(state, edgeId, act.linkType);
      } else if (act.kind === 'upgrade') {
        res = stageUpgradeLink(state, edgeId, act.linkType);
      } else {
        res = stageRepairLink(state, edgeId);
      }
      if (!res.ok) {
        throw new Error(`Script action failed on Turn ${state.turn}: ${res.error}`);
      }
    }
    commitTurn(state);
  }
  return state;
}
