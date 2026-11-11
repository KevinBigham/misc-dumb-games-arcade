import { describe, expect, it } from 'vitest';
import { MECH_SPECS, evaluateActiveVent } from '../src/game/mechs';
import { computeAugmentStats } from '../src/game/augments';

describe('Cyber-Frames & Active Venting', () => {
  it('defines all three playable Cyber-Frames with distinct weapon profiles', () => {
    expect(MECH_SPECS.valkyrie.title).toBe('VALKYRIE');
    expect(MECH_SPECS.hellforge.title).toBe('HELLFORGE');
    expect(MECH_SPECS.chronos.title).toBe('CHRONOS');
  });

  it('grants Perfect Overcharge when venting in the [0.65, 0.80] sweet spot', () => {
    const perfect = evaluateActiveVent(0.72, 0.72);
    expect(perfect.outcome).toBe('perfect');
    expect(perfect.overchargeDuration).toBeGreaterThan(4);

    const jammed = evaluateActiveVent(0.95, 0.95);
    expect(jammed.outcome).toBe('jammed');
    expect(jammed.lockoutDuration).toBeGreaterThan(1);
  });
});

describe('Neural Augments & Weapon Synergy Evolutions', () => {
  it('unlocks Stormbringer Overload when combining Tesla Arc Conductor and Plasma Supercharger', () => {
    const stats = computeAugmentStats({
      arc_conductor: 1,
      plasma_supercharger: 1,
    });
    expect(stats.unlockedSynergies.map((s) => s.id)).toContain('stormbringer_overload');
    expect(stats.chainLightningChance).toBe(1.0);
    expect(stats.chainTargets).toBeGreaterThanOrEqual(5);
  });

  it('unlocks Phantom Blade Protocol and Event Horizon Grinder when prerequisites are met', () => {
    const stats = computeAugmentStats({
      witch_time_dilator: 1,
      katana_resonator: 2,
      orbital_blades: 1,
      singularity_rounds: 1,
    });
    const ids = stats.unlockedSynergies.map((s) => s.id);
    expect(ids).toContain('phantom_assassin_protocol');
    expect(ids).toContain('event_horizon_saw');
    expect(stats.orbitalBladesCount).toBe(4);
  });
});
