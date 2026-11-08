export const GAME_CONFIG = {
  gameId: '04-junkyard-courier',
  saveStorageKey: 'argon_game04_junkyard_courier_save_v1',
  saveVersion: 1,
  defaultSeed: 404,
  maxHoldSlots: 8,
  baseMaxHull: 40,
  baseMaxFuel: 10,
  auxTankFuelBonus: 4,
  startingCredits: 60,
  startingFuelDrums: 1,
  startingRepairKits: 1,
  maxActiveContracts: 2,
  offersPerPort: 3,
  deliveriesToWin: 3,
  fuelPerDrum: 4,
  baseRepairAmount: 10,
  bilgeRigRepairAmount: 15,
  portFuelUnitCost: 3,
  portHullPointCost: 2,
  fuelDrumCost: 14,
  fuelDrumResell: 10,
  repairKitCost: 16,
  repairKitResell: 11,
  startNodeId: 'node-01-anchorhead',
} as const;

export type LoadoutPresetId = 'hauler' | 'armored_runner';

export interface LoadoutPreset {
  id: LoadoutPresetId;
  name: string;
  tagline: string;
  moduleIds: string[];
  fuelDrums: number;
  repairKits: number;
  preferredStrategy: string;
}

export const LOADOUT_PRESETS: Record<LoadoutPresetId, LoadoutPreset> = {
  hauler: {
    id: 'hauler',
    name: 'Light High-Capacity Hauler',
    tagline: 'Max cargo slots & extended internal fuel tank for multi-contract outer routes.',
    moduleIds: ['mod-aux-tank', 'mod-gyro-cradle'],
    fuelDrums: 1,
    repairKits: 1,
    preferredStrategy:
      'Leaves 4 Hold Slots open for bulky/dual contracts (3+1 Slots). Takes longer low-hazard outer channels using +4 Aux Tank fuel.',
  },
  armored_runner: {
    id: 'armored_runner',
    name: 'Armored Storm-Runner',
    tagline: 'Heavy icebreaker prow & twin-prop outrigger to punch straight through hazardous shortcuts.',
    moduleIds: ['mod-icebreaker-prow', 'mod-twin-prop', 'mod-bilge-rig'],
    fuelDrums: 1,
    repairKits: 1,
    preferredStrategy:
      'Commits 4 Hold Slots to armor & propulsion modules, leaving 2 Slots for single high-margin contracts across Scrap Reef & Riptide shortcuts.',
  },
};
