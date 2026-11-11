import { beforeEach, describe, expect, it } from 'vitest';
import {
  ARMORY_UPGRADES,
  createDefaultProfile,
  getArmoryUpgradeCost,
  loadProfile,
  purchaseArmoryUpgrade,
  saveProfile,
} from '../src/game/persistence';

describe('Armory Meta-Progression & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('purchases Armory upgrades, deducts Void Cores, and persists to localStorage', () => {
    const profile = createDefaultProfile();
    profile.voidCores = 100;

    const spec = ARMORY_UPGRADES[0];
    const expectedCost = getArmoryUpgradeCost(spec, 0);

    const res = purchaseArmoryUpgrade(profile, spec.id);
    expect(res.success).toBe(true);
    expect(res.newRank).toBe(1);
    expect(profile.voidCores).toBe(100 - expectedCost);

    const reloaded = loadProfile();
    expect(reloaded.armoryRanks[spec.id]).toBe(1);
    expect(reloaded.voidCores).toBe(100 - expectedCost);

    saveProfile(reloaded);
  });
});
