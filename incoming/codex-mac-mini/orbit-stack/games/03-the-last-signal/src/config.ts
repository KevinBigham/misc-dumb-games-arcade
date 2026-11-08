export const STORAGE_KEY = 'argon_game03_the_last_signal_save_v1';
export const SAVE_VERSION = 1;
export const DEFAULT_SEED = 30307;

export type ResourceId = 'watts' | 'alloy' | 'cipher';
export type ChapterId = 1 | 2 | 3;

export type StationId =
  | 'north_reef'
  | 'sunken_dredge'
  | 'weather_buoy'
  | 'convoy_meridian';

export type AutomationRuleId =
  | 'auto_crank'
  | 'signal_scrubber'
  | 'hull_salvage_drone'
  | 'emergency_load_shedder';

export type InitialRepairId = 'repair_rectifier' | 'repair_winch';

export type EndingId = 'ending_a_archival_beacon' | 'ending_b_exodus_convoy';

export const GAME_CONFIG = {
  initialWatts: 0,
  initialMaxWatts: 60,
  rectifierBonusMaxWatts: 40,
  chapter2BonusMaxWatts: 20,

  initialAlloy: 0,
  initialMaxAlloy: 60,
  winchBonusMaxAlloy: 30,

  initialCipher: 0,
  initialMaxCipher: 30,

  receiverWarmupWatts: 8,
  initialScrapDiscoveryAlloy: 6,

  baseDynamoWatts: 5,
  rectifierDynamoWatts: 9,

  baseSalvageAlloy: 4,
  winchSalvageAlloy: 7,
  salvageWinchWattCost: 2,

  tuneSignalLockGain: 35,
  tuneCipherWattCost: 3,

  chapter2RequiredEvents: 2,
  chapter3RequiredEvents: 7,
  chapter3RequiredPoweredStations: 2,

  endingARequiredPoweredStations: 4,
  endingARequiredNetworkScore: 3,
  endingAWattCost: 25,
  endingACipherCost: 4,

  endingBRequiredConvoyScore: 3,
  endingBWattCost: 25,
  endingBAlloyCost: 12,
  endingBCipherCost: 3,
} as const;
