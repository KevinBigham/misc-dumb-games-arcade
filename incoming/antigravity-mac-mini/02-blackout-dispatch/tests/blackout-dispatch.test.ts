import { describe, expect, it, beforeEach } from 'vitest';
import {
  CONFIG,
  SCENARIO_1_EFFICIENT_TRUNK_SCRIPT,
  SCENARIO_1_HARBOR_SQUALL,
  SCENARIO_1_NEGLECT_LOSS_SCRIPT,
  SCENARIO_1_REDUNDANT_LOOP_SCRIPT,
  SCENARIO_2_TWIN_RIDGE_GALE,
  SCENARIO_3_CAT4_SUPERCELL,
  commitTurn,
  coordKey,
  createInitialGameState,
  createSeededRng,
  deserializeGameState,
  generateSeededScenario,
  loadGameStateFromStorage,
  makeEdgeId,
  metadata,
  mountGame,
  parseEdgeId,
  resetStagedActions,
  resolvePowerFlow,
  runStrategyScript,
  saveGameStateToStorage,
  serializeGameState,
  stagePlaceLink,
  stageRepairLink,
  stageRerouteLink,
  stageUpgradeLink,
  undoLastStagedAction,
} from '../src/index.ts';

describe('Game 02: Blackout Dispatch — Simulation, Solver & Contract Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('1. conserves energy strictly across cyclic topologies and never creates energy in cycles', () => {
    const state = createInitialGameState(SCENARIO_1_HARBOR_SQUALL);

    // Build multiple intersecting cycles (North-Central-South loops + inner 2x2 square cycle)
    const cyclicPairs: Array<[{ row: number; col: number }, { row: number; col: number }]> = [
      [{ row: 3, col: 2 }, { row: 3, col: 3 }],
      [{ row: 3, col: 3 }, { row: 3, col: 4 }],
      [{ row: 2, col: 2 }, { row: 3, col: 2 }],
      [{ row: 2, col: 2 }, { row: 2, col: 3 }],
      [{ row: 2, col: 3 }, { row: 3, col: 3 }],
      [{ row: 2, col: 3 }, { row: 2, col: 4 }],
      [{ row: 2, col: 4 }, { row: 3, col: 4 }],
      [{ row: 3, col: 4 }, { row: 4, col: 4 }],
      [{ row: 3, col: 5 }, { row: 2, col: 5 }],
      [{ row: 2, col: 5 }, { row: 2, col: 6 }],
    ];

    for (const [a, b] of cyclicPairs) {
      const id = makeEdgeId(a, b);
      state.board.links[id] = {
        id,
        type: 'heavy',
        status: 'intact',
        directionConstraint: 'auto',
      };
    }

    const flow = resolvePowerFlow(
      state.board,
      state.scenario,
      { D1: 6, D2: 6, D3: 5, D4: 5, D5: 5 },
      11,
    );

    expect(flow.hasDirectedCycle).toBe(false);
    expect(flow.totalDeliveredMW).toBe(flow.generatorUsedMW);
    expect(flow.totalDeliveredMW).toBeLessThanOrEqual(flow.generatorOutputMW);

    // Verify edge capacity invariant on every link
    for (const ef of Object.values(flow.edgeFlows)) {
      expect(ef.flowMW).toBeGreaterThanOrEqual(0);
      expect(ef.flowMW).toBeLessThanOrEqual(ef.capacityMW);
    }

    // Verify Kirchhoff nodal conservation at every non-generator node:
    // inflow(node) === outflow(node) + districtDelivered(node)
    const genNode = coordKey(state.scenario.generator.row, state.scenario.generator.col);
    const districtByNode = new Map(
      state.scenario.districts.map((d) => [coordKey(d.row, d.col), d.id]),
    );

    const inflowByNode = new Map<string, number>();
    const outflowByNode = new Map<string, number>();

    for (const ef of Object.values(flow.edgeFlows)) {
      if (ef.flowMW <= 0) continue;
      outflowByNode.set(ef.fromNode, (outflowByNode.get(ef.fromNode) ?? 0) + ef.flowMW);
      inflowByNode.set(ef.toNode, (inflowByNode.get(ef.toNode) ?? 0) + ef.flowMW);
    }

    for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
      for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
        const node = coordKey(r, c);
        if (node === genNode) {
          expect((outflowByNode.get(node) ?? 0) - (inflowByNode.get(node) ?? 0)).toBe(
            flow.totalDeliveredMW,
          );
          continue;
        }
        const dId = districtByNode.get(node);
        const consumed = dId ? flow.districtAllocations[dId].deliveredMW : 0;
        const inflow = inflowByNode.get(node) ?? 0;
        const outflow = outflowByNode.get(node) ?? 0;
        expect(inflow).toBe(outflow + consumed);
      }
    }
  });

  it('2. allocates power strictly according to displayed district priority order (P1 -> P5)', () => {
    const state = createInitialGameState(SCENARIO_1_HARBOR_SQUALL);
    // Connect D1 (P1 at 3,3) and D2 (P2 at 3,5) through a single 4 MW Standard Line at (3,2)--(3,3)
    stagePlaceLink(state, makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 3 }), 'standard');
    stagePlaceLink(state, makeEdgeId({ row: 3, col: 3 }, { row: 3, col: 4 }), 'standard');

    // Demand 3 MW for D1 (P1) and 3 MW for D2 (P2) across the 4 MW shared trunk
    const flow = resolvePowerFlow(state.board, state.scenario, {
      D1: 3,
      D2: 3,
      D3: 2,
      D4: 2,
      D5: 0,
    });

    // D1 (Priority 1) receives its full 3 MW first; D2 (Priority 2) receives the remaining 1 MW
    expect(flow.districtAllocations.D1.deliveredMW).toBe(3);
    expect(flow.districtAllocations.D1.unmetMW).toBe(0);
    expect(flow.districtAllocations.D2.deliveredMW).toBe(1);
    expect(flow.districtAllocations.D2.unmetMW).toBe(2);
  });

  it('3. previews exact post-action flow and restores exact pre-action state on Undo and Reset', () => {
    const state = createInitialGameState(SCENARIO_1_HARBOR_SQUALL);
    const initialSnap = serializeGameState(state);
    const initialD1Delivered = state.preview.flow.districtAllocations.D1.deliveredMW;
    expect(initialD1Delivered).toBe(0);

    // Stage action 1: connect D1
    const edge1 = makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 3 });
    const res1 = stagePlaceLink(state, edge1, 'standard');
    expect(res1.ok).toBe(true);
    expect(state.actionsRemaining).toBe(1);
    expect(state.materials).toBe(SCENARIO_1_HARBOR_SQUALL.startingMaterials - 10);
    expect(state.preview.flow.districtAllocations.D1.deliveredMW).toBe(2);

    const afterOneActionSnap = serializeGameState(state);

    // Stage action 2: connect D2
    const edge2 = makeEdgeId({ row: 3, col: 3 }, { row: 3, col: 4 });
    const res2 = stagePlaceLink(state, edge2, 'standard');
    expect(res2.ok).toBe(true);
    expect(state.actionsRemaining).toBe(0);
    expect(state.preview.flow.districtAllocations.D2.deliveredMW).toBe(2);

    // Undo Action 2 -> must match afterOneActionSnap
    const undo2 = undoLastStagedAction(state);
    expect(undo2.ok).toBe(true);
    expect(JSON.parse(serializeGameState(state))).toEqual({
      ...JSON.parse(afterOneActionSnap),
      savedAtIso: expect.any(String),
    });

    // Undo Action 1 -> must match initialSnap
    const undo1 = undoLastStagedAction(state);
    expect(undo1.ok).toBe(true);
    expect(JSON.parse(serializeGameState(state))).toEqual({
      ...JSON.parse(initialSnap),
      savedAtIso: expect.any(String),
    });

    // Stage two actions then Reset Turn -> must match initialSnap
    stagePlaceLink(state, edge1, 'standard');
    stageUpgradeLink(state, edge1, 'heavy');
    expect(state.actionsRemaining).toBe(0);
    const resetRes = resetStagedActions(state);
    expect(resetRes.ok).toBe(true);
    expect(JSON.parse(serializeGameState(state))).toEqual({
      ...JSON.parse(initialSnap),
      savedAtIso: expect.any(String),
    });
  });

  it('4. guarantees identical seeded PRNG & replay determinism', () => {
    const seed = 987654321;
    const rngA = createSeededRng(seed);
    const rngB = createSeededRng(seed);

    const seqA = Array.from({ length: 20 }, () => rngA.nextInt(1, 1000));
    const seqB = Array.from({ length: 20 }, () => rngB.nextInt(1, 1000));
    expect(seqA).toEqual(seqB);

    const scenA = generateSeededScenario(seed);
    const scenB = generateSeededScenario(seed);
    expect(scenA).toEqual(scenB);

    const runA = runStrategyScript(SCENARIO_1_HARBOR_SQUALL, SCENARIO_1_EFFICIENT_TRUNK_SCRIPT);
    const runB = runStrategyScript(SCENARIO_1_HARBOR_SQUALL, SCENARIO_1_EFFICIENT_TRUNK_SCRIPT);
    expect(runA.history).toEqual(runB.history);
    expect(runA.board).toEqual(runB.board);
    expect(runA.materials).toBe(runB.materials);
  });

  it('5. pinpoints the exact disconnected, saturated bottleneck, or storm-damaged edge in diagnostics', () => {
    const state = createInitialGameState(SCENARIO_1_HARBOR_SQUALL);

    // Turn 1 initial board: D1 and D2 have no built path
    expect(state.preview.flow.diagnostics.D1.reason).toBe('DISCONNECTED_NO_PATH');
    expect(state.preview.flow.diagnostics.D2.reason).toBe('DISCONNECTED_NO_PATH');

    // Connect D1 and D2 on Turn 1 and commit
    const trunkEdge = makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 3 });
    const midEdge = makeEdgeId({ row: 3, col: 3 }, { row: 3, col: 4 });
    stagePlaceLink(state, trunkEdge, 'standard');
    stagePlaceLink(state, midEdge, 'standard');
    commitTurn(state);

    // Turn 2: D1 (3 MW) + D2 (3 MW) = 6 MW > 4 MW capacity on (3,2)--(3,3)
    const turn2DiagD2 = state.preview.flow.diagnostics.D2;
    expect(turn2DiagD2.reason).toBe('CAPACITY_BOTTLENECK');
    expect(turn2DiagD2.unmetMW).toBe(2);
    expect(turn2DiagD2.bottleneckEdgeIds).toContain(trunkEdge);

    // Upgrade (3,2)--(3,3) to Heavy Trunk (8 MW) -> bottleneck resolved!
    stageUpgradeLink(state, trunkEdge, 'heavy');
    expect(state.preview.flow.diagnostics.D2.reason).toBe('OK');
    expect(state.preview.flow.diagnostics.D2.unmetMW).toBe(0);

    // Advance to Turn 4 where a wind strike hits (3,3)--(3,4)
    commitTurn(state); // End Turn 2
    commitTurn(state); // End Turn 3
    expect(state.turn).toBe(4);

    // On Turn 4 preview, imminent wind strike damages unshielded (3,3)--(3,4), cutting off D2!
    const turn4DiagD2 = state.preview.flow.diagnostics.D2;
    expect(turn4DiagD2.reason).toBe('DAMAGED_LINE_OUTAGE');
    expect(turn4DiagD2.bottleneckEdgeIds).toContain(midEdge);
  });

  it('6. solves Scenario 1 with Strategy A (Single Trunk Efficiency) AND Strategy B (Redundant Storm Loop), while Strategy C (Neglect) fails', () => {
    // Strategy A: Single Trunk Efficiency
    const trunkWin = runStrategyScript(
      SCENARIO_1_HARBOR_SQUALL,
      SCENARIO_1_EFFICIENT_TRUNK_SCRIPT,
    );
    expect(trunkWin.status).toBe('won');
    expect(trunkWin.turn).toBe(12);
    expect(trunkWin.cityCumulativeUnmetMW).toBe(0);

    // Verify Strategy A used Storm-Shielded Conduits and did NOT build the (4,4)--(3,4) loop
    const loopEdge = makeEdgeId({ row: 4, col: 4 }, { row: 3, col: 4 });
    expect(trunkWin.board.links[loopEdge]).toBeUndefined();
    const shieldedCountA = Object.values(trunkWin.board.links).filter(
      (l) => l.type === 'shielded',
    ).length;
    expect(shieldedCountA).toBeGreaterThanOrEqual(3);

    // Strategy B: Redundant Storm Loop
    const loopWin = runStrategyScript(
      SCENARIO_1_HARBOR_SQUALL,
      SCENARIO_1_REDUNDANT_LOOP_SCRIPT,
    );
    if (loopWin.status !== 'won') {
      throw new Error(`Loop failed on Turn ${loopWin.turn}: ${loopWin.lossReason}`);
    }
    expect(loopWin.status).toBe('won');
    expect(loopWin.turn).toBe(12);
    expect(loopWin.cityCumulativeUnmetMW).toBe(0);

    // Verify Strategy B built the (4,4)--(3,4) loop and used ZERO Storm-Shielded Conduits
    expect(loopWin.board.links[loopEdge]).toBeDefined();
    const shieldedCountB = Object.values(loopWin.board.links).filter(
      (l) => l.type === 'shielded',
    ).length;
    expect(shieldedCountB).toBe(0);

    // Strategy C: Neglect script fails with a documented district blackout
    const neglectLoss = runStrategyScript(
      SCENARIO_1_HARBOR_SQUALL,
      SCENARIO_1_NEGLECT_LOSS_SCRIPT,
    );
    expect(neglectLoss.status).toBe('lost');
    expect(neglectLoss.lossReason).toContain('CRITICAL DISTRICT BLACKOUT');
    expect(neglectLoss.lossReason).toContain('D2');
  });

  it('7. supports rerouting links, mid-turn persistence, corruption recovery, Scenario 2 & 3, and ArgonGameModule mounting', () => {
    const state = createInitialGameState(SCENARIO_1_HARBOR_SQUALL);
    const edgeA = makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 3 });
    stagePlaceLink(state, edgeA, 'standard');

    // Reroute flow gate constraint on edgeA
    const rerouteRes = stageRerouteLink(state, edgeA, { directionConstraint: 'forward' });
    expect(rerouteRes.ok).toBe(true);
    expect(state.board.links[edgeA].directionConstraint).toBe('forward');

    // Save mid-turn and reload from storage
    expect(saveGameStateToStorage(state)).toBe(true);
    const loaded = loadGameStateFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.stagedActions.length).toBe(2);
    expect(loaded?.board.links[edgeA].directionConstraint).toBe('forward');

    // Corruption recovery returns null without throwing
    expect(deserializeGameState('{not-valid-json')).toBeNull();
    expect(deserializeGameState(JSON.stringify({ rulesVersion: '0.0.0' }))).toBeNull();

    // Verify Scenario 2 and Scenario 3 initialize and resolve cleanly
    const s2 = createInitialGameState(SCENARIO_2_TWIN_RIDGE_GALE);
    const s3 = createInitialGameState(SCENARIO_3_CAT4_SUPERCELL);
    expect(s2.preview.flow.hasDirectedCycle).toBe(false);
    expect(s3.preview.flow.hasDirectedCycle).toBe(false);

    // Verify ArgonGameModule mountGame contract in jsdom
    expect(metadata.id).toBe('02-blackout-dispatch');
    expect(metadata.number).toBe(2);
    const container = document.createElement('div');
    const instance = mountGame(container, { initialSeed: 4242, debug: true });
    expect(container.querySelector('.bd-svg-board')).not.toBeNull();
    expect(instance.getStateSnapshot?.()).toBeDefined();
    instance.restartWithSeed?.(7777);
    instance.toggleDebug?.(false);
    instance.destroy();
    expect(container.innerHTML).toBe('');
  });
});
