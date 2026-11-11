import { describe, expect, it } from 'vitest';
import {
  acceptContract,
  applyLoadoutPreset,
  ARCHIPELAGO_NODES,
  beginTravelToNode,
  BOAT_MODULES,
  buyFuelDrum,
  buyRepairKit,
  CONTRACT_TEMPLATES,
  createInitialRunState,
  deliverContract,
  deserializeRunState,
  findOptimalRouteForLoadout,
  GAME_CONFIG,
  HAZARDS,
  installModule,
  loadRunFromStorage,
  metadata,
  mountGame,
  refuelAtPort,
  repairHullAtPort,
   saveRunToStorage,
  serializeRunState,
  validateLoadout,
  validateStarterViableRoute,
  validateStateHoldCapacity,
} from '../src/index.ts';

describe('Game 04: Junkyard Courier — Architecture, Simulation & Loadout Verification', () => {
  it('enforces exact First Playable scope caps and First Two Minutes opening contract conflict', () => {
    expect(ARCHIPELAGO_NODES).toHaveLength(12);
    expect(BOAT_MODULES).toHaveLength(6);
    expect(CONTRACT_TEMPLATES).toHaveLength(8);
    expect(Object.keys(HAZARDS)).toHaveLength(6);
    expect(GAME_CONFIG.maxHoldSlots).toBe(8);
    expect(GAME_CONFIG.deliveriesToWin).toBe(3);

    const state = createInitialRunState(404);
    const openingOffers = state.contracts.filter(
      (c) => c.status === 'OFFERED' && c.originNodeId === 'node-01-anchorhead',
    );
    expect(openingOffers).toHaveLength(3);

    const safeOneSlot = openingOffers.find((c) => c.cargoSlots === 1 && !c.fragile);
    const bulkyThreeSlot = openingOffers.find((c) => c.cargoSlots === 3 && c.fragile && c.bulky);
    expect(safeOneSlot).toBeDefined();
    expect(bulkyThreeSlot).toBeDefined();
  });

  it('strictly guards contracts so a contract can NEVER pay out twice', () => {
    const state = createInitialRunState(404);
    const contract = state.contracts[0]; // 1-Slot Safe Ballast -> node-05-cinder-wharf
    expect(acceptContract(state, contract.id).ok).toBe(true);

    // Cannot deliver before reaching destination port
    const premature = deliverContract(state, contract.id);
    expect(premature.ok).toBe(false);
    expect(premature.payout).toBe(0);

    // Travel to node-05-cinder-wharf via node-02-siltgate
    expect(beginTravelToNode(state, 'node-02-siltgate', 'evade_burn').ok).toBe(true);
    expect(beginTravelToNode(state, 'node-05-cinder-wharf', 'evade_burn').ok).toBe(true);
    expect(state.currentNodeId).toBe('node-05-cinder-wharf');

    const creditsBefore = state.credits;
    const firstDelivery = deliverContract(state, contract.id);
    expect(firstDelivery.ok).toBe(true);
    expect(firstDelivery.payout).toBeGreaterThan(0);
    expect(state.credits).toBe(creditsBefore + firstDelivery.payout);
    expect(state.deliveriesCompleted).toBe(1);
    expect(contract.status).toBe('DELIVERED');
    expect(contract.paidOut).toBe(true);

    // Attempt to deliver the exact same contract a second and third time
    const secondDelivery = deliverContract(state, contract.id);
    expect(secondDelivery.ok).toBe(false);
    expect(secondDelivery.payout).toBe(0);
    expect(state.credits).toBe(creditsBefore + firstDelivery.payout);
    expect(state.deliveriesCompleted).toBe(1);

    // Even if someone tampers with contract.status, the deliveredContractIds & paidOut ledger blocks payout
    contract.status = 'ACCEPTED';
    const tamperedDelivery = deliverContract(state, contract.id);
    expect(tamperedDelivery.ok).toBe(false);
    expect(tamperedDelivery.payout).toBe(0);
    expect(state.credits).toBe(creditsBefore + firstDelivery.payout);
    expect(state.deliveriesCompleted).toBe(1);
  });

  it('enforces that Cargo + Modules + Fuel Drums + Repair Kits can NEVER exceed 8 Hold Slots', () => {
    const directCheck = validateLoadout({
      installedModules: ['mod-icebreaker-prow', 'mod-twin-prop', 'mod-aux-tank'], // 2 + 1 + 1 = 4 slots
      acceptedContracts: [{ cargoSlots: 3 }], // 3 slots
      fuelDrums: 1, // 1 slot -> total 8 slots
      repairKits: 1, // +1 slot -> 9 slots (INVALID)
      maxHoldSlots: 8,
    });
    expect(directCheck.valid).toBe(false);
    expect(directCheck.usedSlots).toBe(9);

    const state = createInitialRunState(404);
    state.credits = 500;
    // Starting state has 1 Fuel Drum (1 slot) + 1 Repair Kit (1 slot) = 2/8 slots used.
    // Accept 1-slot contract + 3-slot contract -> +4 slots = 6/8 slots used.
    expect(acceptContract(state, 'contract-1').ok).toBe(true);
    expect(acceptContract(state, 'contract-2').ok).toBe(true);
    expect(validateStateHoldCapacity(state).usedSlots).toBe(6);

    // Install 2-slot Reinforced Icebreaker Prow -> 8/8 slots used.
    expect(installModule(state, 'mod-icebreaker-prow').ok).toBe(true);
    expect(validateStateHoldCapacity(state).usedSlots).toBe(8);

    // Now hold is full (8/8). Any attempt to add another module, fuel drum, or repair kit MUST fail:
    expect(installModule(state, 'mod-twin-prop').ok).toBe(false);
    expect(buyFuelDrum(state).ok).toBe(false);
    expect(buyRepairKit(state).ok).toBe(false);
    expect(validateStateHoldCapacity(state).usedSlots).toBe(8);
  });

  it('guarantees starter equipment has a viable route across multiple seeds and completes a starter voyage', () => {
    for (const seed of [1, 7, 42, 99, 256, 404, 777, 1337]) {
      const st = createInitialRunState(seed);
      const check = validateStarterViableRoute(st);
      expect(check.viable).toBe(true);
      expect(check.remainingHull).toBeGreaterThanOrEqual(15);
      expect(check.remainingEffectiveFuel).toBeGreaterThanOrEqual(2);
    }

    // Execute starter voyage on seed 404 with 0 modules installed
    const starterState = createInitialRunState(404);
    expect(starterState.installedModules).toHaveLength(0);
    expect(acceptContract(starterState, 'contract-1').ok).toBe(true);
    expect(beginTravelToNode(starterState, 'node-02-siltgate', 'press_on').ok).toBe(true);
    expect(beginTravelToNode(starterState, 'node-05-cinder-wharf', 'press_on').ok).toBe(true);
    expect(starterState.hull).toBeGreaterThan(0);
    expect(starterState.fuel).toBeGreaterThan(0);
    const deliv = deliverContract(starterState, 'contract-1');
    expect(deliv.ok).toBe(true);
    expect(starterState.deliveriesCompleted).toBe(1);
  });

  it('demonstrates two contrasting loadouts (Light High-Capacity Hauler vs Armored Storm-Runner) choosing different optimal routes and both winning a 3-delivery run', () => {
    // 1. Compare optimal route choice from Anchorhead (N01) to Cinder-Barge Wharf (N05)
    const haulerState = createInitialRunState(404);
    expect(applyLoadoutPreset(haulerState, 'hauler').ok).toBe(true);
    // Hauler accepts both the 1-slot AND 3-slot fragile contracts simultaneously (4 cargo slots + 2 module slots + 1 drum + 1 kit = 8/8 slots!)
    expect(acceptContract(haulerState, 'contract-1').ok).toBe(true);
    expect(acceptContract(haulerState, 'contract-2').ok).toBe(true);
    expect(validateStateHoldCapacity(haulerState).usedSlots).toBe(8);

    const haulerRoute = findOptimalRouteForLoadout(
      haulerState,
      'node-01-anchorhead',
      'node-05-cinder-wharf',
    );
    // Hauler avoids the inner Scrap Reef shortcut (node-03-slag-reef) and routes via outer Siltgate Lock (node-02-siltgate)
    expect(haulerRoute.pathNodeIds).toEqual([
      'node-01-anchorhead',
      'node-02-siltgate',
      'node-05-cinder-wharf',
    ]);

    const armoredState = createInitialRunState(404);
    expect(applyLoadoutPreset(armoredState, 'armored_runner').ok).toBe(true);
    // Armored Runner uses 4 module slots + 1 drum + 1 kit = 6 slots, so it takes the 1-slot contract (or 2-slot)
    expect(acceptContract(armoredState, 'contract-1').ok).toBe(true);

    const armoredRoute = findOptimalRouteForLoadout(
      armoredState,
      'node-01-anchorhead',
      'node-05-cinder-wharf',
    );
    // Armored Storm-Runner punches straight through the inner Scrap Reef shortcut (node-03-slag-reef) with 0 hull damage!
    expect(armoredRoute.pathNodeIds).toEqual([
      'node-01-anchorhead',
      'node-03-slag-reef',
      'node-05-cinder-wharf',
    ]);
    expect(armoredRoute.expectedHullDamage).toBe(0);
    expect(armoredRoute.pathNodeIds).not.toEqual(haulerRoute.pathNodeIds);

    // 2. Complete a full 3-delivery winning run with Light High-Capacity Hauler
    expect(beginTravelToNode(haulerState, 'node-02-siltgate', 'evade_burn').ok).toBe(true);
    expect(beginTravelToNode(haulerState, 'node-05-cinder-wharf', 'evade_burn').ok).toBe(true);
    expect(deliverContract(haulerState, 'contract-1').ok).toBe(true);
    expect(deliverContract(haulerState, 'contract-2').ok).toBe(true);
    expect(haulerState.deliveriesCompleted).toBe(2);

    // Refuel at Cinder-Barge Wharf and accept 3rd contract to win
    refuelAtPort(haulerState);
    repairHullAtPort(haulerState);
    const thirdOfferHauler = haulerState.contracts.find(
      (c) => c.status === 'OFFERED' && c.originNodeId === haulerState.currentNodeId && c.cargoSlots <= 4,
    )!;
    expect(acceptContract(haulerState, thirdOfferHauler.id).ok).toBe(true);
    const routeToThird = findOptimalRouteForLoadout(
      haulerState,
      haulerState.currentNodeId,
      thirdOfferHauler.destinationNodeId,
    );
    for (let i = 1; i < routeToThird.pathNodeIds.length; i++) {
      refuelAtPort(haulerState);
      expect(beginTravelToNode(haulerState, routeToThird.pathNodeIds[i], 'evade_burn').ok).toBe(true);
    }
    expect(deliverContract(haulerState, thirdOfferHauler.id).ok).toBe(true);
    expect(haulerState.deliveriesCompleted).toBe(3);
    expect(haulerState.runStatus).toBe('VICTORY');

    // 3. Complete a full 3-delivery winning run with Armored Storm-Runner via direct shortcuts
    expect(beginTravelToNode(armoredState, 'node-03-slag-reef', 'press_on').ok).toBe(true);
    expect(beginTravelToNode(armoredState, 'node-05-cinder-wharf', 'press_on').ok).toBe(true);
    expect(armoredState.hull).toBe(armoredState.maxHull); // 0 damage across two Scrap Reefs!
    expect(deliverContract(armoredState, 'contract-1').ok).toBe(true);
    expect(armoredState.deliveriesCompleted).toBe(1);

    for (let d = 2; d <= 3; d++) {
      refuelAtPort(armoredState);
      repairHullAtPort(armoredState);
      const nextOffer = armoredState.contracts.find(
        (c) =>
          c.status === 'OFFERED' &&
          c.originNodeId === armoredState.currentNodeId &&
          c.cargoSlots <= 2,
      )!;
      expect(acceptContract(armoredState, nextOffer.id).ok).toBe(true);
      const shortcutRoute = findOptimalRouteForLoadout(
        armoredState,
        armoredState.currentNodeId,
        nextOffer.destinationNodeId,
      );
      for (let i = 1; i < shortcutRoute.pathNodeIds.length; i++) {
        refuelAtPort(armoredState);
        expect(beginTravelToNode(armoredState, shortcutRoute.pathNodeIds[i], 'press_on').ok).toBe(
          true,
        );
      }
      expect(deliverContract(armoredState, nextOffer.id).ok).toBe(true);
    }
    expect(armoredState.deliveriesCompleted).toBe(3);
    expect(armoredState.runStatus).toBe('VICTORY');
  });

  it('transitions to LOSS on 0 Hull or 0 Fuel and pinpoints the exact resource/navigation mistake', () => {
    // Case A: Hull reaches 0 in Scrap Reef without Reinforced Icebreaker Prow
    const hullLossState = createInitialRunState(404);
    hullLossState.hull = 8;
    hullLossState.repairKits = 0;
    expect(beginTravelToNode(hullLossState, 'node-03-slag-reef', 'press_on').ok).toBe(true);
    expect(hullLossState.hull).toBe(0);
    expect(hullLossState.runStatus).toBe('LOSS');
    expect(hullLossState.failureDiagnostic).not.toBeNull();
    expect(hullLossState.failureDiagnostic?.cause).toBe('HULL_ZERO');
    expect(hullLossState.failureDiagnostic?.mistakeCategory).toBe('UNCOUNTERED_HAZARD');
    expect(hullLossState.failureDiagnostic?.lastHazardId).toBe('scrap_reef');

    // Case B: Fuel reaches 0 while stranded without Fuel Drums or credits
    const fuelLossState = createInitialRunState(404);
    fuelLossState.fuel = 2;
    fuelLossState.fuelDrums = 0;
    fuelLossState.credits = 0;
    expect(beginTravelToNode(fuelLossState, 'node-02-siltgate', 'press_on').ok).toBe(true);
    expect(fuelLossState.fuel).toBe(0);
    expect(fuelLossState.runStatus).toBe('LOSS');
    expect(fuelLossState.failureDiagnostic).not.toBeNull();
    expect(fuelLossState.failureDiagnostic?.cause).toBe('FUEL_STRANDED');
    expect(fuelLossState.failureDiagnostic?.mistakeCategory).toBe('FUEL_MISCALCULATION');
  });

  it('saves and resumes runs without rerolling hazards, contracts, or RNG state', () => {
    const state = createInitialRunState(512);
    expect(acceptContract(state, 'contract-1').ok).toBe(true);
    expect(beginTravelToNode(state, 'node-02-siltgate', 'evade_burn').ok).toBe(true);

    const edgesSnapshotBefore = state.edges.map((e) => ({
      id: e.id,
      hazardId: e.hazardId,
      timesTraversed: e.timesTraversed,
      lastResolvedChoice: e.lastResolvedChoice,
    }));
    const rngStateBefore = state.rngState;

    const savedOk = saveRunToStorage(state);
    expect(savedOk).toBe(true);

    const resumed = loadRunFromStorage();
    expect(resumed).not.toBeNull();
    expect(resumed!.seed).toBe(512);
    expect(resumed!.rngState).toBe(rngStateBefore);
    expect(resumed!.currentNodeId).toBe('node-02-siltgate');
    expect(
      resumed!.edges.map((e) => ({
        id: e.id,
        hazardId: e.hazardId,
        timesTraversed: e.timesTraversed,
        lastResolvedChoice: e.lastResolvedChoice,
      })),
    ).toEqual(edgesSnapshotBefore);

    const rawJson = serializeRunState(state);
    const parsed = deserializeRunState(rawJson);
    expect(parsed.ok).toBe(true);
    expect(parsed.state?.edges).toEqual(state.edges);
  });

  it('mounts ArgonGameModule cleanly into a DOM container and supports debug & seed restart', () => {
    expect(metadata.id).toBe('04-junkyard-courier');
    expect(metadata.number).toBe(4);

    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 404, debug: false });
    expect(container.querySelector('[data-testid="archipelago-canvas"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="hold-slot-grid"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="debug-inspector"]')).toBeNull();

    instance.toggleDebug?.(true);
    expect(container.querySelector('[data-testid="debug-inspector"]')).not.toBeNull();

    instance.restartWithSeed?.(777);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(777);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
