// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTOMATION_RULES,
  CHAPTERS,
  ENDINGS,
  MESSAGE_EVENTS,
  REMOTE_STATIONS,
  RESOURCES,
  alignFrequency,
  crankDynamo,
  createInitialState,
  decodeMessageEvent,
  deserializeState,
  gatherSalvage,
  metadata,
  mountGame,
  performInitialRepair,
  resolveMessageEventChoice,
  serializeState,
  stepCycle,
  toggleAutomationRule,
  toggleRemoteStation,
  triggerEnding,
  unlockAutomationRule,
} from '../src/index';

describe('Game 03 — The Last Signal: Ember Relay', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.innerHTML = '';
  });

  it('enforces first-playable scope caps: 3 chapters, 3 resources, 4 remote stations, 12 events, 4 safe automation rules, 2 endings', () => {
    expect(Object.keys(CHAPTERS)).toHaveLength(3);
    expect(Object.keys(RESOURCES)).toHaveLength(3);
    expect(Object.keys(REMOTE_STATIONS)).toHaveLength(4);
    expect(MESSAGE_EVENTS).toHaveLength(12);
    expect(Object.keys(AUTOMATION_RULES)).toHaveLength(4);
    expect(Object.keys(ENDINGS)).toHaveLength(2);

    const uniqueIds = new Set(MESSAGE_EVENTS.map((e) => e.id));
    const uniqueFlags = new Set(MESSAGE_EVENTS.map((e) => e.oneTimeFlag));
    expect(uniqueIds.size).toBe(12);
    expect(uniqueFlags.size).toBe(12);
    expect(metadata.id).toBe('03-the-last-signal');
    expect(metadata.number).toBe(3);
  });

  it('verifies progressive reveal gates from Chapter 1 sparse start through Chapter 2 and Chapter 3', () => {
    const state = createInitialState(101);

    // Stage 0: Only Watts unlocked, receiver cold
    expect(state.chapter).toBe(1);
    expect(state.unlockedResources).toEqual({
      watts: true,
      alloy: false,
      cipher: false,
    });
    expect(state.capabilities.receiverWarmed).toBe(false);
    expect(state.capabilities.oscilloscopeUnlocked).toBe(false);
    expect(state.capabilities.radarUnlocked).toBe(false);
    expect(state.capabilities.automationUnlocked).toBe(false);

    // 2 dynamo cranks -> 10 Watts -> warms receiver & unlocks Salvage Alloy
    crankDynamo(state);
    expect(state.capabilities.receiverWarmed).toBe(false);
    crankDynamo(state);
    expect(state.capabilities.receiverWarmed).toBe(true);
    expect(state.unlockedResources.alloy).toBe(true);
    expect(state.resources.alloy).toBeGreaterThanOrEqual(6);

    // Complete first repair -> unlocks Oscilloscope (first visible station transformation)
    const repairRes = performInitialRepair(state, 'repair_rectifier');
    expect(repairRes.ok).toBe(true);
    expect(state.capabilities.oscilloscopeUnlocked).toBe(true);

    // Pump resources actively to resolve Chapter 1 signals (sig_01, sig_02)
    for (let i = 0; i < 4; i++) crankDynamo(state);
    expect(decodeMessageEvent(state, 'sig_01_reef_sos').ok).toBe(true);
    expect(
      resolveMessageEventChoice(
        state,
        'sig_01_reef_sos',
        'stabilize_reef_carrier'
      ).ok
    ).toBe(true);

    expect(decodeMessageEvent(state, 'sig_02_dredge_beacon').ok).toBe(true);
    expect(
      resolveMessageEventChoice(
        state,
        'sig_02_dredge_beacon',
        'calibrate_dredge_cable'
      ).ok
    ).toBe(true);

    // Chapter 2 should now be unlocked!
    expect(state.chapter).toBe(2);
    expect(state.unlockedResources.cipher).toBe(true);
    expect(state.capabilities.radarUnlocked).toBe(true);
    expect(state.capabilities.automationUnlocked).toBe(true);
    expect(state.stations.north_reef.unlocked).toBe(true);
    expect(state.stations.convoy_meridian.unlocked).toBe(true);
  });

  it('reaches Ending A (The Archival Beacon) deterministically via active commands without waiting', () => {
    const state = createInitialState(2026);

    const topUpResources = () => {
      for (let i = 0; i < 6; i++) crankDynamo(state);
      for (let i = 0; i < 4; i++) gatherSalvage(state);
      if (state.capabilities.oscilloscopeUnlocked) {
        for (let i = 0; i < 4; i++) alignFrequency(state);
      }
      for (let i = 0; i < 4; i++) crankDynamo(state);
    };

    // Warm receiver & complete both repairs
    topUpResources();
    expect(performInitialRepair(state, 'repair_rectifier').ok).toBe(true);
    topUpResources();
    expect(performInitialRepair(state, 'repair_winch').ok).toBe(true);

    // Resolve signals 1..8 choosing Network Integrity options (choice index 0)
    const firstEightIds = MESSAGE_EVENTS.slice(0, 8).map((e) => e.id);
    for (const evtId of firstEightIds) {
      topUpResources();
      const evtDef = MESSAGE_EVENTS.find((e) => e.id === evtId)!;
      expect(decodeMessageEvent(state, evtId).ok).toBe(true);
      expect(
        resolveMessageEventChoice(state, evtId, evtDef.choices[0].id).ok
      ).toBe(true);
    }

    // Should now be in Chapter 3
    expect(state.chapter).toBe(3);
    expect(state.capabilities.convergenceUnlocked).toBe(true);

    // Activate & power all 4 remote stations
    for (const stId of [
      'north_reef',
      'sunken_dredge',
      'weather_buoy',
      'convoy_meridian',
    ] as const) {
      topUpResources();
      if (!state.stations[stId].powered) {
        expect(toggleRemoteStation(state, stId, true).ok).toBe(true);
      }
    }

    // Trigger Ending A: The Archival Beacon
    topUpResources();
    const endARes = triggerEnding(state, 'ending_a_archival_beacon');
    expect(endARes.ok).toBe(true);
    expect(state.endingReached).toBe('ending_a_archival_beacon');
  });

  it('reaches Ending B (The Exodus Convoy) deterministically via active commands without waiting', () => {
    const state = createInitialState(7777);

    const topUpResources = () => {
      for (let i = 0; i < 6; i++) crankDynamo(state);
      for (let i = 0; i < 4; i++) gatherSalvage(state);
      if (state.capabilities.oscilloscopeUnlocked) {
        for (let i = 0; i < 4; i++) alignFrequency(state);
      }
      for (let i = 0; i < 4; i++) crankDynamo(state);
    };

    topUpResources();
    expect(performInitialRepair(state, 'repair_rectifier').ok).toBe(true);

    // Resolve signals 1..8 choosing Convoy Readiness options (choice index 1)
    const firstEightIds = MESSAGE_EVENTS.slice(0, 8).map((e) => e.id);
    for (const evtId of firstEightIds) {
      topUpResources();
      const evtDef = MESSAGE_EVENTS.find((e) => e.id === evtId)!;
      expect(decodeMessageEvent(state, evtId).ok).toBe(true);
      expect(
        resolveMessageEventChoice(state, evtId, evtDef.choices[1].id).ok
      ).toBe(true);
    }

    expect(state.chapter).toBe(3);
    expect(state.convoyReadiness).toBeGreaterThanOrEqual(3);

    topUpResources();
    const endBRes = triggerEnding(state, 'ending_b_exodus_convoy');
    expect(endBRes.ok).toBe(true);
    expect(state.endingReached).toBe('ending_b_exodus_convoy');
  });

  it('prevents duplicate rewards from completed message events before and after save/reload', () => {
    const state = createInitialState(505);
    crankDynamo(state);
    crankDynamo(state);
    crankDynamo(state);

    expect(decodeMessageEvent(state, 'sig_01_reef_sos').ok).toBe(true);
    expect(
      resolveMessageEventChoice(state, 'sig_01_reef_sos', 'strip_reef_coils').ok
    ).toBe(true);

    const snapshotAlloy = state.resources.alloy;
    const snapshotWatts = state.resources.watts;

    // Attempting to decode or resolve again immediately must fail and grant 0 resources
    const dupDecode = decodeMessageEvent(state, 'sig_01_reef_sos');
    expect(dupDecode.ok).toBe(false);
    const dupResolve = resolveMessageEventChoice(
      state,
      'sig_01_reef_sos',
      'strip_reef_coils'
    );
    expect(dupResolve.ok).toBe(false);
    expect(state.resources.alloy).toBe(snapshotAlloy);
    expect(state.resources.watts).toBe(snapshotWatts);

    // Save & reload round-trip, then attempt again
    const raw = serializeState(state);
    const reloaded = deserializeState(raw)!;
    expect(reloaded).not.toBeNull();
    expect(reloaded.completedEvents).toContain('sig_01_reef_sos');
    expect(reloaded.eventLog).toHaveLength(1);

    const reloadDup = resolveMessageEventChoice(
      reloaded,
      'sig_01_reef_sos',
      'strip_reef_coils'
    );
    expect(reloadDup.ok).toBe(false);
    expect(reloaded.resources.alloy).toBe(snapshotAlloy);
  });

  it('executes all 4 safe automation rules deterministically and explains inputs, outputs, and conditions', () => {
    const state = createInitialState(808);
    // Advance to Chapter 2
    state.chapter = 2;
    state.capabilities.receiverWarmed = true;
    state.capabilities.oscilloscopeUnlocked = true;
    state.capabilities.radarUnlocked = true;
    state.capabilities.automationUnlocked = true;
    state.unlockedResources = { watts: true, alloy: true, cipher: true };
    state.maxResources = { watts: 100, alloy: 60, cipher: 30 };
    state.resources = { watts: 80, alloy: 50, cipher: 10 };
    state.stations.north_reef.unlocked = true;
    state.stations.sunken_dredge.unlocked = true;

    // Unlock all 4 automation rules
    expect(unlockAutomationRule(state, 'auto_crank').ok).toBe(true);
    expect(unlockAutomationRule(state, 'signal_scrubber').ok).toBe(true);
    expect(unlockAutomationRule(state, 'hull_salvage_drone').ok).toBe(true);
    expect(unlockAutomationRule(state, 'emergency_load_shedder').ok).toBe(true);

    // 1. Test Auto-Crank Regulator (Power < 40%: 1 Alloy -> +6 Watts)
    toggleAutomationRule(state, 'auto_crank', true);
    toggleAutomationRule(state, 'signal_scrubber', false);
    toggleAutomationRule(state, 'hull_salvage_drone', false);
    toggleAutomationRule(state, 'emergency_load_shedder', false);

    state.resources.watts = 30; // 30% of 100W (< 40%)
    state.resources.alloy = 10;
    stepCycle(state);

    const crankReport = state.lastCycleRuleResults.find(
      (r) => r.ruleId === 'auto_crank'
    )!;
    expect(crankReport.triggered).toBe(true);
    expect(crankReport.conditionSummary).toContain('40%');
    expect(state.resources.alloy).toBe(9);
    expect(state.resources.watts).toBe(36);

    // 2. Test Signal Scrubber (Power >= 50%: -4 Watts -> +1 Cipher Key) + Hull Salvage Drone (North Reef powered: -2W -> +2 Alloy)
    toggleAutomationRule(state, 'auto_crank', false);
    toggleAutomationRule(state, 'signal_scrubber', true);
    toggleAutomationRule(state, 'hull_salvage_drone', true);

    state.stations.north_reef.activated = true;
    state.stations.north_reef.powered = true;
    state.resources.watts = 60; // 60% (>= 50%)
    state.resources.alloy = 10;
    state.resources.cipher = 5;

    stepCycle(state);
    const scrubberReport = state.lastCycleRuleResults.find(
      (r) => r.ruleId === 'signal_scrubber'
    )!;
    const droneReport = state.lastCycleRuleResults.find(
      (r) => r.ruleId === 'hull_salvage_drone'
    )!;
    expect(scrubberReport.triggered).toBe(true);
    expect(droneReport.triggered).toBe(true);
    expect(state.resources.cipher).toBe(6);
    // Alloy: 10 + 2 (drone) + 1 (North Reef passive) = 13
    expect(state.resources.alloy).toBe(13);

    // 3. Test Emergency Load Shedder (Power < 20%: throttles non-critical stations & recovers +5W)
    toggleAutomationRule(state, 'signal_scrubber', false);
    toggleAutomationRule(state, 'hull_salvage_drone', false);
    toggleAutomationRule(state, 'emergency_load_shedder', true);

    state.stations.sunken_dredge.activated = true;
    state.stations.sunken_dredge.powered = true;
    state.resources.watts = 15; // 15% (< 20%)

    stepCycle(state);
    const shedderReport = state.lastCycleRuleResults.find(
      (r) => r.ruleId === 'emergency_load_shedder'
    )!;
    expect(shedderReport.triggered).toBe(true);
    expect(state.stations.sunken_dredge.powered).toBe(false);
    expect(state.stations.sunken_dredge.throttledByShedder).toBe(true);
    expect(state.brownoutCount).toBe(0);
  });

  it('mounts Progressive-Reveal DOM UI starting with a single action button in Chapter 1', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 42 });

    // Initially only 1 primary action button (#btn-crank-dynamo) is present in #ember-controls-panel
    const controlsPanel = container.querySelector('#ember-controls-panel')!;
    const initialButtons = controlsPanel.querySelectorAll('button');
    expect(initialButtons).toHaveLength(1);
    expect(initialButtons[0].textContent).toContain(
      'Strike Match / Crank Dynamo'
    );
    expect(container.querySelector('#ember-radar-panel')).toBeNull();
    expect(container.querySelector('#ember-automation-panel')).toBeNull();

    // Click crank button twice -> reveals Salvage Winch, Repairs panel, and Signals panel
    initialButtons[0].click();
    (
      container.querySelector('#btn-crank-dynamo') as HTMLButtonElement
    ).click();

    expect(container.querySelector('#btn-gather-salvage')).not.toBeNull();
    expect(container.querySelector('#ember-repairs-panel')).not.toBeNull();
    expect(container.querySelector('#ember-signals-panel')).not.toBeNull();

    instance.destroy();
  });
});
