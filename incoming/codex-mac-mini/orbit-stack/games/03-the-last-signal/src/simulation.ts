import {
  AutomationRuleId,
  ChapterId,
  DEFAULT_SEED,
  EndingId,
  GAME_CONFIG,
  InitialRepairId,
  ResourceId,
  StationId,
} from './config';
import {
  AUTOMATION_RULES,
  CHAPTERS,
  ENDINGS,
  INITIAL_REPAIRS,
  MESSAGE_EVENTS,
  MessageEventDefinition,
  REMOTE_STATIONS,
  ResourceCost,
} from './content';
import { SeededRng } from './rng';

export interface StationState {
  id: StationId;
  unlocked: boolean;
  activated: boolean;
  powered: boolean;
  throttledByShedder: boolean;
}

export interface AutomationRuleState {
  id: AutomationRuleId;
  unlocked: boolean;
  enabled: boolean;
  lastTriggeredCycle: number | null;
  lastStatus: string;
}

export interface AutomationCycleResult {
  ruleId: AutomationRuleId;
  triggered: boolean;
  reason: string;
  conditionSummary: string;
  inputSummary: string;
  outputSummary: string;
}

export interface EventLogEntry {
  eventId: string;
  oneTimeFlag: string;
  choiceId: string;
  cycle: number;
  outcomeLog: string;
}

export interface LogMessage {
  id: number;
  cycle: number;
  category: 'system' | 'signal' | 'automation' | 'chapter' | 'warning';
  text: string;
}

export interface GameState {
  seed: number;
  rngState: number;
  cycle: number;
  chapter: ChapterId;
  resources: Record<ResourceId, number>;
  maxResources: Record<ResourceId, number>;
  unlockedResources: Record<ResourceId, boolean>;
  capabilities: {
    receiverWarmed: boolean;
    oscilloscopeUnlocked: boolean;
    radarUnlocked: boolean;
    automationUnlocked: boolean;
    convergenceUnlocked: boolean;
  };
  repairs: Record<InitialRepairId, boolean>;
  stations: Record<StationId, StationState>;
  automationRules: Record<AutomationRuleId, AutomationRuleState>;
  lastCycleRuleResults: AutomationCycleResult[];
  signalLock: number;
  harmonicPhase: number;
  decodedEvents: string[];
  completedEvents: string[];
  eventLog: EventLogEntry[];
  networkIntegrity: number;
  convoyReadiness: number;
  brownoutCount: number;
  endingReached: EndingId | null;
  logs: LogMessage[];
  nextLogId: number;
}

export interface ActionResult {
  ok: boolean;
  reason: string;
}

export function createInitialState(seed: number = DEFAULT_SEED): GameState {
  const rng = new SeededRng(seed);
  const initialPhase = rng.nextInt(15, 85);

  const state: GameState = {
    seed,
    rngState: rng.getState(),
    cycle: 0,
    chapter: 1,
    resources: {
      watts: GAME_CONFIG.initialWatts,
      alloy: GAME_CONFIG.initialAlloy,
      cipher: GAME_CONFIG.initialCipher,
    },
    maxResources: {
      watts: GAME_CONFIG.initialMaxWatts,
      alloy: GAME_CONFIG.initialMaxAlloy,
      cipher: GAME_CONFIG.initialMaxCipher,
    },
    unlockedResources: {
      watts: true,
      alloy: false,
      cipher: false,
    },
    capabilities: {
      receiverWarmed: false,
      oscilloscopeUnlocked: false,
      radarUnlocked: false,
      automationUnlocked: false,
      convergenceUnlocked: false,
    },
    repairs: {
      repair_rectifier: false,
      repair_winch: false,
    },
    stations: {
      north_reef: {
        id: 'north_reef',
        unlocked: false,
        activated: false,
        powered: false,
        throttledByShedder: false,
      },
      sunken_dredge: {
        id: 'sunken_dredge',
        unlocked: false,
        activated: false,
        powered: false,
        throttledByShedder: false,
      },
      weather_buoy: {
        id: 'weather_buoy',
        unlocked: false,
        activated: false,
        powered: false,
        throttledByShedder: false,
      },
      convoy_meridian: {
        id: 'convoy_meridian',
        unlocked: false,
        activated: false,
        powered: false,
        throttledByShedder: false,
      },
    },
    automationRules: {
      auto_crank: {
        id: 'auto_crank',
        unlocked: false,
        enabled: false,
        lastTriggeredCycle: null,
        lastStatus: 'Locked (Unlocks in Chapter 2)',
      },
      signal_scrubber: {
        id: 'signal_scrubber',
        unlocked: false,
        enabled: false,
        lastTriggeredCycle: null,
        lastStatus: 'Locked (Unlocks in Chapter 2)',
      },
      hull_salvage_drone: {
        id: 'hull_salvage_drone',
        unlocked: false,
        enabled: false,
        lastTriggeredCycle: null,
        lastStatus: 'Locked (Unlocks in Chapter 2)',
      },
      emergency_load_shedder: {
        id: 'emergency_load_shedder',
        unlocked: false,
        enabled: false,
        lastTriggeredCycle: null,
        lastStatus: 'Locked (Unlocks in Chapter 2)',
      },
    },
    lastCycleRuleResults: [],
    signalLock: 25,
    harmonicPhase: initialPhase,
    decodedEvents: [],
    completedEvents: [],
    eventLog: [],
    networkIntegrity: 0,
    convoyReadiness: 0,
    brownoutCount: 0,
    endingReached: null,
    logs: [],
    nextLogId: 1,
  };

  appendLog(
    state,
    'chapter',
    `${CHAPTERS[1].title} — ${CHAPTERS[1].openingLog}`
  );
  return state;
}

export function appendLog(
  state: GameState,
  category: LogMessage['category'],
  text: string
): void {
  state.logs.unshift({
    id: state.nextLogId++,
    cycle: state.cycle,
    category,
    text,
  });
  if (state.logs.length > 60) {
    state.logs.length = 60;
  }
}

export function clampResources(state: GameState): void {
  (['watts', 'alloy', 'cipher'] as ResourceId[]).forEach((resId) => {
    const max = state.maxResources[resId];
    const current = state.resources[resId];
    state.resources[resId] = Math.max(0, Math.min(max, Math.round(current)));
  });
}

export function canAfford(state: GameState, cost: ResourceCost): boolean {
  if (cost.watts && state.resources.watts < cost.watts) return false;
  if (cost.alloy && state.resources.alloy < cost.alloy) return false;
  if (cost.cipher && state.resources.cipher < cost.cipher) return false;
  return true;
}

export function spendResources(state: GameState, cost: ResourceCost): void {
  if (cost.watts) state.resources.watts -= cost.watts;
  if (cost.alloy) state.resources.alloy -= cost.alloy;
  if (cost.cipher) state.resources.cipher -= cost.cipher;
  clampResources(state);
}

export function addResources(state: GameState, gain: ResourceCost): void {
  if (gain.watts) state.resources.watts += gain.watts;
  if (gain.alloy) {
    state.unlockedResources.alloy = true;
    state.resources.alloy += gain.alloy;
  }
  if (gain.cipher) {
    state.unlockedResources.cipher = true;
    state.resources.cipher += gain.cipher;
  }
  clampResources(state);
}

export function getCompletedRepairCount(state: GameState): number {
  return Object.values(state.repairs).filter(Boolean).length;
}

export function getPoweredStationCount(state: GameState): number {
  return Object.values(state.stations).filter((s) => s.powered).length;
}

export function isEventAvailable(
  state: GameState,
  eventDef: MessageEventDefinition
): boolean {
  if (state.completedEvents.includes(eventDef.id)) return false;
  if (
    state.eventLog.some(
      (entry) =>
        entry.eventId === eventDef.id ||
        entry.oneTimeFlag === eventDef.oneTimeFlag
    )
  ) {
    return false;
  }

  const prereq = eventDef.prerequisites;
  if (prereq.receiverWarmed && !state.capabilities.receiverWarmed) {
    return false;
  }
  if (
    prereq.minCompletedRepairs !== undefined &&
    getCompletedRepairCount(state) < prereq.minCompletedRepairs
  ) {
    return false;
  }
  if (prereq.minChapter !== undefined && state.chapter < prereq.minChapter) {
    return false;
  }
  if (prereq.requiredEventIds) {
    for (const reqId of prereq.requiredEventIds) {
      if (!state.completedEvents.includes(reqId)) {
        return false;
      }
    }
  }
  return true;
}

export function getAvailableMessageEvents(
  state: GameState
): MessageEventDefinition[] {
  return MESSAGE_EVENTS.filter((evt) => isEventAvailable(state, evt));
}

export function evaluateChapterProgression(state: GameState): void {
  // Chapter 1 -> Chapter 2 gate:
  // Requires at least 1 initial repair completed AND at least 2 Chapter-1 events resolved (or sig_03_harbor_charter resolved)
  if (state.chapter === 1) {
    const repairsDone = getCompletedRepairCount(state);
    const ch1EventsDone =
      state.completedEvents.includes('sig_03_harbor_charter') ||
      (repairsDone >= 1 &&
        state.completedEvents.length >= GAME_CONFIG.chapter2RequiredEvents &&
        state.capabilities.oscilloscopeUnlocked);

    if (repairsDone >= 1 && ch1EventsDone) {
      state.chapter = 2;
      state.unlockedResources.alloy = true;
      state.unlockedResources.cipher = true;
      state.capabilities.radarUnlocked = true;
      state.capabilities.automationUnlocked = true;
      state.maxResources.watts += GAME_CONFIG.chapter2BonusMaxWatts;

      // Unlock the 4 remote stations on the Archipelago Radar Map
      (Object.keys(state.stations) as StationId[]).forEach((stId) => {
        state.stations[stId].unlocked = true;
      });

      // Update automation rule status hints
      (Object.keys(state.automationRules) as AutomationRuleId[]).forEach(
        (ruleId) => {
          if (!state.automationRules[ruleId].unlocked) {
            state.automationRules[ruleId].lastStatus =
              'Ready to fabricate in Rule Rack';
          }
        }
      );

      appendLog(
        state,
        'chapter',
        `${CHAPTERS[2].title} — ${CHAPTERS[2].openingLog}`
      );
    }
  }

  // Chapter 2 -> Chapter 3 gate:
  // Requires Chapter 2, and either sig_08_mainland_silence completed OR (>= 6 completed events AND >= 2 powered stations)
  if (state.chapter === 2) {
    const poweredCount = getPoweredStationCount(state);
    const readyForCh3 =
      state.completedEvents.includes('sig_08_mainland_silence') ||
      (state.completedEvents.length >= GAME_CONFIG.chapter3RequiredEvents &&
        poweredCount >= GAME_CONFIG.chapter3RequiredPoweredStations);

    if (readyForCh3) {
      state.chapter = 3;
      state.capabilities.convergenceUnlocked = true;
      appendLog(
        state,
        'chapter',
        `${CHAPTERS[3].title} — ${CHAPTERS[3].openingLog}`
      );
    }
  }
}

export function crankDynamo(state: GameState): ActionResult {
  if (state.endingReached) {
    return { ok: false, reason: 'Transmission convergence already completed.' };
  }

  const gain = state.repairs.repair_rectifier
    ? GAME_CONFIG.rectifierDynamoWatts
    : GAME_CONFIG.baseDynamoWatts;

  state.resources.watts += gain;
  clampResources(state);

  if (
    !state.capabilities.receiverWarmed &&
    state.resources.watts >= GAME_CONFIG.receiverWarmupWatts
  ) {
    state.capabilities.receiverWarmed = true;
    state.unlockedResources.alloy = true;
    state.resources.alloy += GAME_CONFIG.initialScrapDiscoveryAlloy;
    clampResources(state);

    appendLog(
      state,
      'signal',
      `Pilot lamp ignited! The vacuum tubes warm up, revealing a distress carrier on 118.4 MHz and +${GAME_CONFIG.initialScrapDiscoveryAlloy} Salvage Alloy beside the cracked rectifier housing.`
    );
    return {
      ok: true,
      reason: `Cranked Dynamo (+${gain}W). Receiver warmed up & Salvage Alloy unlocked!`,
    };
  }

  appendLog(
    state,
    'system',
    `Hand-Dynamo cranked: +${gain} Watts (${state.resources.watts}/${state.maxResources.watts}W).`
  );
  return { ok: true, reason: `Generated +${gain} Watts.` };
}

export function gatherSalvage(state: GameState): ActionResult {
  if (state.endingReached) {
    return { ok: false, reason: 'Transmission convergence already completed.' };
  }
  if (!state.unlockedResources.alloy) {
    return {
      ok: false,
      reason: 'Warm up the receiver lamp first to inspect cliffside salvage.',
    };
  }

  const baseYield = state.repairs.repair_winch
    ? GAME_CONFIG.winchSalvageAlloy
    : GAME_CONFIG.baseSalvageAlloy;

  if (state.resources.watts >= GAME_CONFIG.salvageWinchWattCost) {
    state.resources.watts -= GAME_CONFIG.salvageWinchWattCost;
    state.resources.alloy += baseYield;
    clampResources(state);
    appendLog(
      state,
      'system',
      `Powered winch haul (-${GAME_CONFIG.salvageWinchWattCost}W): recovered +${baseYield} Salvage Alloy.`
    );
    return {
      ok: true,
      reason: `Winch hauled +${baseYield} Salvage Alloy (-${GAME_CONFIG.salvageWinchWattCost}W).`,
    };
  } else {
    const manualYield = Math.max(2, Math.floor(baseYield / 2));
    state.resources.alloy += manualYield;
    clampResources(state);
    appendLog(
      state,
      'system',
      `Manual cliffside salvage haul: recovered +${manualYield} Salvage Alloy.`
    );
    return {
      ok: true,
      reason: `Manually hauled +${manualYield} Salvage Alloy.`,
    };
  }
}

export function alignFrequency(state: GameState): ActionResult {
  if (state.endingReached) {
    return { ok: false, reason: 'Transmission convergence already completed.' };
  }
  if (!state.capabilities.receiverWarmed) {
    return { ok: false, reason: 'Warm up the receiver first.' };
  }

  const rng = new SeededRng(state.rngState);
  state.harmonicPhase = (state.harmonicPhase + rng.nextInt(17, 33)) % 100;
  state.rngState = rng.getState();

  state.signalLock = Math.min(
    100,
    state.signalLock + GAME_CONFIG.tuneSignalLockGain
  );

  // In Chapter 2+, aligning the harmonic tuner when watts >= 3 also synthesizes +1 Cipher Key
  if (
    state.unlockedResources.cipher &&
    state.resources.watts >= GAME_CONFIG.tuneCipherWattCost &&
    state.resources.cipher < state.maxResources.cipher
  ) {
    state.resources.watts -= GAME_CONFIG.tuneCipherWattCost;
    state.resources.cipher += 1;
    clampResources(state);
    appendLog(
      state,
      'signal',
      `Harmonic carrier phase-locked (${state.signalLock}%): synthesized +1 Cipher Key (-${GAME_CONFIG.tuneCipherWattCost}W).`
    );
    return {
      ok: true,
      reason: `Signal lock ${state.signalLock}% & synthesized +1 Cipher Key.`,
    };
  }

  appendLog(
    state,
    'signal',
    `Frequency dial aligned: Signal Lock at ${state.signalLock}%.`
  );
  return { ok: true, reason: `Signal Lock increased to ${state.signalLock}%.` };
}

export function performInitialRepair(
  state: GameState,
  repairId: InitialRepairId
): ActionResult {
  const def = INITIAL_REPAIRS[repairId];
  if (!def) {
    return { ok: false, reason: 'Unknown repair ID.' };
  }
  if (!state.capabilities.receiverWarmed) {
    return { ok: false, reason: 'Receiver must be warmed up first.' };
  }
  if (state.repairs[repairId]) {
    return { ok: false, reason: `${def.name} is already completed.` };
  }
  if (!canAfford(state, def.cost)) {
    return {
      ok: false,
      reason: `Insufficient resources for ${def.name}.`,
    };
  }

  const wasFirstRepair = getCompletedRepairCount(state) === 0;
  spendResources(state, def.cost);
  state.repairs[repairId] = true;

  if (repairId === 'repair_rectifier') {
    state.maxResources.watts += GAME_CONFIG.rectifierBonusMaxWatts;
  } else if (repairId === 'repair_winch') {
    state.maxResources.alloy += GAME_CONFIG.winchBonusMaxAlloy;
  }

  if (wasFirstRepair) {
    state.capabilities.oscilloscopeUnlocked = true;
    appendLog(
      state,
      'chapter',
      `STATION TRANSFORMATION: ${def.name} complete! The Frequency Oscilloscope & Harmonic Decoder console comes online.`
    );
  } else {
    appendLog(state, 'system', `Completed structural upgrade: ${def.name}.`);
  }

  evaluateChapterProgression(state);
  return { ok: true, reason: `Completed ${def.name}.` };
}

export function toggleRemoteStation(
  state: GameState,
  stationId: StationId,
  forcePowered?: boolean
): ActionResult {
  const def = REMOTE_STATIONS[stationId];
  const st = state.stations[stationId];
  if (!def || !st) {
    return { ok: false, reason: 'Unknown station.' };
  }
  if (!st.unlocked) {
    return { ok: false, reason: `${def.name} is not yet on the radar grid.` };
  }

  // If not yet activated, activating it requires its one-time activationCost
  if (!st.activated) {
    if (forcePowered === false) {
      return { ok: false, reason: `${def.name} is already offline.` };
    }
    if (!canAfford(state, def.activationCost)) {
      return {
        ok: false,
        reason: `Insufficient resources to activate ${def.name}.`,
      };
    }
    spendResources(state, def.activationCost);
    st.activated = true;
    st.powered = true;
    st.throttledByShedder = false;
    appendLog(
      state,
      'signal',
      `Remote Beacon Activated: ${def.name} is now online and linked to Ember Point!`
    );
    evaluateChapterProgression(state);
    return { ok: true, reason: `Activated and powered ${def.name}.` };
  }

  const targetPower =
    forcePowered !== undefined ? forcePowered : !st.powered;
  st.powered = targetPower;
  if (targetPower) {
    st.throttledByShedder = false;
  }
  appendLog(
    state,
    'system',
    `${def.name} beacon ${st.powered ? 'POWERED ON' : 'THROTTLED OFFLINE'}.`
  );
  evaluateChapterProgression(state);
  return {
    ok: true,
    reason: `${def.name} is now ${st.powered ? 'powered' : 'offline'}.`,
  };
}

export function unlockAutomationRule(
  state: GameState,
  ruleId: AutomationRuleId
): ActionResult {
  const def = AUTOMATION_RULES[ruleId];
  const ruleState = state.automationRules[ruleId];
  if (!def || !ruleState) {
    return { ok: false, reason: 'Unknown automation rule.' };
  }
  if (state.chapter < def.unlockChapter) {
    return {
      ok: false,
      reason: `${def.name} unlocks in Chapter ${def.unlockChapter}.`,
    };
  }
  if (ruleState.unlocked) {
    return { ok: false, reason: `${def.name} is already unlocked.` };
  }
  if (!canAfford(state, def.unlockCost)) {
    return {
      ok: false,
      reason: `Insufficient resources to fabricate ${def.name}.`,
    };
  }

  spendResources(state, def.unlockCost);
  ruleState.unlocked = true;
  ruleState.enabled = true;
  ruleState.lastStatus = 'Armed (Awaiting next cycle check)';
  appendLog(
    state,
    'automation',
    `Automation Rule Fabricated & Armed: ${def.name} (${def.conditionSummary} -> ${def.outputSummary}).`
  );
  return { ok: true, reason: `Unlocked and enabled ${def.name}.` };
}

export function toggleAutomationRule(
  state: GameState,
  ruleId: AutomationRuleId,
  forceEnabled?: boolean
): ActionResult {
  const def = AUTOMATION_RULES[ruleId];
  const ruleState = state.automationRules[ruleId];
  if (!def || !ruleState) {
    return { ok: false, reason: 'Unknown automation rule.' };
  }
  if (!ruleState.unlocked) {
    return { ok: false, reason: `Unlock ${def.name} first.` };
  }

  ruleState.enabled =
    forceEnabled !== undefined ? forceEnabled : !ruleState.enabled;
  ruleState.lastStatus = ruleState.enabled
    ? 'Armed (Awaiting cycle)'
    : 'Disabled by operator';
  appendLog(
    state,
    'automation',
    `${def.name} ${ruleState.enabled ? 'ENABLED' : 'DISABLED'}.`
  );
  return {
    ok: true,
    reason: `${def.name} ${ruleState.enabled ? 'enabled' : 'disabled'}.`,
  };
}

export function executeAutomationRulesForCycle(
  state: GameState
): AutomationCycleResult[] {
  const results: AutomationCycleResult[] = [];
  const orderedIds: AutomationRuleId[] = [
    'auto_crank',
    'signal_scrubber',
    'hull_salvage_drone',
    'emergency_load_shedder',
  ];

  for (const ruleId of orderedIds) {
    const def = AUTOMATION_RULES[ruleId];
    const ruleState = state.automationRules[ruleId];

    if (!ruleState.unlocked || !ruleState.enabled) {
      results.push({
        ruleId,
        triggered: false,
        reason: !ruleState.unlocked ? 'Rule locked' : 'Rule disabled',
        conditionSummary: def.conditionSummary,
        inputSummary: def.inputSummary,
        outputSummary: def.outputSummary,
      });
      continue;
    }

    const wattsPct =
      state.maxResources.watts > 0
        ? (state.resources.watts / state.maxResources.watts) * 100
        : 0;

    let conditionMet = false;
    if (def.conditionType === 'watts_pct_below') {
      conditionMet = wattsPct < (def.thresholdPct ?? 0);
    } else if (def.conditionType === 'watts_pct_at_least') {
      conditionMet = wattsPct >= (def.thresholdPct ?? 100);
    } else if (def.conditionType === 'station_powered') {
      const reqStation = def.requiredStationId;
      conditionMet = reqStation ? state.stations[reqStation].powered : false;
    }

    if (!conditionMet) {
      const reason = `Standby: Condition (${def.conditionSummary}) not met.`;
      ruleState.lastStatus = reason;
      results.push({
        ruleId,
        triggered: false,
        reason,
        conditionSummary: def.conditionSummary,
        inputSummary: def.inputSummary,
        outputSummary: def.outputSummary,
      });
      continue;
    }

    if (!canAfford(state, def.inputs)) {
      const reason = `Blocked: Insufficient input (${def.inputSummary}).`;
      ruleState.lastStatus = reason;
      results.push({
        ruleId,
        triggered: false,
        reason,
        conditionSummary: def.conditionSummary,
        inputSummary: def.inputSummary,
        outputSummary: def.outputSummary,
      });
      continue;
    }

    // Execute rule deterministically
    spendResources(state, def.inputs);
    addResources(state, def.outputs);

    if (def.outputs.throttleNonCriticalStations) {
      (['sunken_dredge', 'weather_buoy', 'convoy_meridian'] as StationId[]).forEach(
        (stId) => {
          if (state.stations[stId].powered) {
            state.stations[stId].powered = false;
            state.stations[stId].throttledByShedder = true;
          }
        }
      );
    }

    ruleState.lastTriggeredCycle = state.cycle;
    const reason = `Fired on Cycle ${state.cycle}: ${def.conditionSummary} -> ${def.outputSummary}.`;
    ruleState.lastStatus = reason;
    appendLog(state, 'automation', `[${def.name}] ${reason}`);

    results.push({
      ruleId,
      triggered: true,
      reason,
      conditionSummary: def.conditionSummary,
      inputSummary: def.inputSummary,
      outputSummary: def.outputSummary,
    });
  }

  state.lastCycleRuleResults = results;
  return results;
}

export function stepCycle(state: GameState): ActionResult {
  if (state.endingReached) {
    return { ok: false, reason: 'Transmission convergence already completed.' };
  }

  state.cycle += 1;

  // Base passive generator trickle once at least 1 repair is completed
  if (getCompletedRepairCount(state) >= 1) {
    state.resources.watts += 2;
    clampResources(state);
  }

  // 1. Run Safe Automation Rules in deterministic order
  executeAutomationRulesForCycle(state);

  // 2. Process Remote Station Upkeep & Yields
  let totalUpkeep = 0;
  const activeStations = (Object.keys(state.stations) as StationId[]).filter(
    (id) => state.stations[id].powered
  );

  for (const stId of activeStations) {
    totalUpkeep += REMOTE_STATIONS[stId].wattUpkeepPerCycle;
  }

  if (totalUpkeep > 0) {
    if (state.resources.watts >= totalUpkeep) {
      state.resources.watts -= totalUpkeep;
      for (const stId of activeStations) {
        addResources(state, REMOTE_STATIONS[stId].passiveYieldPerCycle);
      }
      clampResources(state);
    } else {
      // Check if emergency_load_shedder is unlocked & enabled; if not, Receiver Brownout!
      const shedder = state.automationRules.emergency_load_shedder;
      if (shedder.unlocked && shedder.enabled) {
        (['sunken_dredge', 'weather_buoy', 'convoy_meridian'] as StationId[]).forEach(
          (stId) => {
            if (state.stations[stId].powered) {
              state.stations[stId].powered = false;
              state.stations[stId].throttledByShedder = true;
            }
          }
        );
        state.resources.watts = Math.min(
          state.maxResources.watts,
          state.resources.watts + 5
        );
        shedder.lastTriggeredCycle = state.cycle;
        shedder.lastStatus = `Prevented brownout on Cycle ${state.cycle}`;
        appendLog(
          state,
          'automation',
          `[Emergency Load Shedder] Throttled non-critical beacons to prevent Receiver Brownout (+5W reserve).`
        );
      } else {
        // Receiver Brownout!
        state.resources.watts = 0;
        state.brownoutCount += 1;
        state.signalLock = Math.max(10, state.signalLock - 30);
        for (const stId of activeStations) {
          state.stations[stId].powered = false;
        }
        appendLog(
          state,
          'warning',
          `RECEIVER BROWNOUT! Beacon load exceeded capacitor reserves. Remote stations tripped offline.`
        );
      }
    }
  }

  evaluateChapterProgression(state);
  return { ok: true, reason: `Advanced to Cycle ${state.cycle}.` };
}

export function decodeMessageEvent(
  state: GameState,
  eventId: string
): ActionResult {
  const eventDef = MESSAGE_EVENTS.find((e) => e.id === eventId);
  if (!eventDef) {
    return { ok: false, reason: 'Unknown signal event ID.' };
  }
  if (
    state.completedEvents.includes(eventId) ||
    state.eventLog.some(
      (entry) =>
        entry.eventId === eventId ||
        entry.oneTimeFlag === eventDef.oneTimeFlag
    )
  ) {
    return {
      ok: false,
      reason: 'Signal already resolved (recorded in persistent eventLog).',
    };
  }
  if (state.decodedEvents.includes(eventId)) {
    return { ok: false, reason: 'Signal is already decoded.' };
  }
  if (!isEventAvailable(state, eventDef)) {
    return {
      ok: false,
      reason: 'Signal prerequisites are not yet met.',
    };
  }
  if (!canAfford(state, eventDef.decodeCost)) {
    return {
      ok: false,
      reason: 'Insufficient resources to decode this transmission.',
    };
  }

  spendResources(state, eventDef.decodeCost);
  state.decodedEvents.push(eventId);
  appendLog(
    state,
    'signal',
    `Decoded transmission [${eventDef.frequencyMHz}]: "${eventDef.title}"`
  );
  return { ok: true, reason: `Decoded ${eventDef.title}.` };
}

export function resolveMessageEventChoice(
  state: GameState,
  eventId: string,
  choiceId: string
): ActionResult {
  const eventDef = MESSAGE_EVENTS.find((e) => e.id === eventId);
  if (!eventDef) {
    return { ok: false, reason: 'Unknown signal event ID.' };
  }

  // Strict Duplicate-Reward Protection via completedEvents AND eventLog oneTimeFlag
  if (
    state.completedEvents.includes(eventId) ||
    state.eventLog.some(
      (entry) =>
        entry.eventId === eventId ||
        entry.oneTimeFlag === eventDef.oneTimeFlag
    )
  ) {
    return {
      ok: false,
      reason:
        'Duplicate reward blocked: Event one-time flag already recorded in eventLog.',
    };
  }

  if (!state.decodedEvents.includes(eventId)) {
    return {
      ok: false,
      reason: 'Decode the transmission before transmitting a response.',
    };
  }

  const choice = eventDef.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { ok: false, reason: 'Invalid choice ID for this signal.' };
  }

  if (!canAfford(state, choice.costs)) {
    return {
      ok: false,
      reason: 'Insufficient resources to execute this transmission choice.',
    };
  }

  spendResources(state, choice.costs);
  addResources(state, choice.rewards);

  state.networkIntegrity += choice.networkIntegrityDelta;
  state.convoyReadiness += choice.convoyReadinessDelta;

  if (choice.powerStationId) {
    const st = state.stations[choice.powerStationId];
    if (st) {
      st.unlocked = true;
      st.activated = true;
      st.powered = true;
      st.throttledByShedder = false;
    }
  }

  state.completedEvents.push(eventId);
  state.eventLog.push({
    eventId: eventDef.id,
    oneTimeFlag: eventDef.oneTimeFlag,
    choiceId: choice.id,
    cycle: state.cycle,
    outcomeLog: choice.outcomeLog,
  });

  appendLog(state, 'signal', choice.outcomeLog);
  evaluateChapterProgression(state);

  return { ok: true, reason: choice.outcomeLog };
}

export function canTriggerEnding(
  state: GameState,
  endingId: EndingId
): { ok: boolean; reason: string } {
  if (state.endingReached) {
    return { ok: false, reason: 'An ending has already been reached.' };
  }
  if (state.chapter < 3) {
    return { ok: false, reason: 'Reach Chapter 3 first.' };
  }

  if (endingId === 'ending_a_archival_beacon') {
    const poweredStations = getPoweredStationCount(state);
    if (poweredStations < GAME_CONFIG.endingARequiredPoweredStations) {
      return {
        ok: false,
        reason: `Requires all 4 remote stations powered (${poweredStations}/4 active).`,
      };
    }
    if (state.networkIntegrity < GAME_CONFIG.endingARequiredNetworkScore) {
      return {
        ok: false,
        reason: `Requires Network Integrity >= ${GAME_CONFIG.endingARequiredNetworkScore} (currently ${state.networkIntegrity}).`,
      };
    }
    if (
      !canAfford(state, {
        watts: GAME_CONFIG.endingAWattCost,
        cipher: GAME_CONFIG.endingACipherCost,
      })
    ) {
      return {
        ok: false,
        reason: `Requires ${GAME_CONFIG.endingAWattCost}W and ${GAME_CONFIG.endingACipherCost} Cipher Keys.`,
      };
    }
    return { ok: true, reason: 'Ready to lock The Archival Beacon.' };
  }

  if (endingId === 'ending_b_exodus_convoy') {
    if (state.convoyReadiness < GAME_CONFIG.endingBRequiredConvoyScore) {
      return {
        ok: false,
        reason: `Requires Convoy Readiness >= ${GAME_CONFIG.endingBRequiredConvoyScore} (currently ${state.convoyReadiness}).`,
      };
    }
    if (
      !canAfford(state, {
        watts: GAME_CONFIG.endingBWattCost,
        alloy: GAME_CONFIG.endingBAlloyCost,
        cipher: GAME_CONFIG.endingBCipherCost,
      })
    ) {
      return {
        ok: false,
        reason: `Requires ${GAME_CONFIG.endingBWattCost}W, ${GAME_CONFIG.endingBAlloyCost} Salvage Alloy, and ${GAME_CONFIG.endingBCipherCost} Cipher Keys.`,
      };
    }
    return { ok: true, reason: 'Ready to fire The Exodus Convoy beam.' };
  }

  return { ok: false, reason: 'Unknown ending ID.' };
}

export function triggerEnding(
  state: GameState,
  endingId: EndingId
): ActionResult {
  const check = canTriggerEnding(state, endingId);
  if (!check.ok) {
    return check;
  }

  if (endingId === 'ending_a_archival_beacon') {
    spendResources(state, {
      watts: GAME_CONFIG.endingAWattCost,
      cipher: GAME_CONFIG.endingACipherCost,
    });
  } else {
    spendResources(state, {
      watts: GAME_CONFIG.endingBWattCost,
      alloy: GAME_CONFIG.endingBAlloyCost,
      cipher: GAME_CONFIG.endingBCipherCost,
    });
    // Ending B burns out the inland relays to guide the convoy
    (['north_reef', 'sunken_dredge', 'weather_buoy'] as StationId[]).forEach(
      (stId) => {
        state.stations[stId].powered = false;
      }
    );
  }

  state.endingReached = endingId;
  const endingDef = ENDINGS[endingId];
  appendLog(
    state,
    'chapter',
    `CONVERGENCE COMPLETE — ${endingDef.title}: ${endingDef.epilogue}`
  );
  return { ok: true, reason: endingDef.title };
}
