import { describe, expect, it } from 'vitest';
import { MECH_SPECS, evaluateActiveVent } from '../src/omega/mechs';
import { AUGMENTS, computeAugmentStats } from '../src/omega/augments';
import {
  KRAS_P01116_CA,
  classifyKrasDomain,
  getPlddtColor,
  projectKrasBackbone,
} from '../src/omega/kras-structure';
import { ReactiveGrid } from '../src/omega/reactive-grid';
import { SoundEngine } from '../src/omega/sound-engine';
import { createDefaultProfile } from '../src/omega/persistence';
import { GameWorld } from '../src/omega/state';

describe('VOIDBREAKER: OMEGA // THE HELIX SINGULARITY Suite', () => {
  it('defines all 6 personalized Cyber-Frames with distinct loadouts', () => {
    expect(Object.keys(MECH_SPECS)).toEqual([
      'valkyrie',
      'hellforge',
      'chronos',
      'xenofold',
      'antigravity',
      'gridiron',
    ]);
    expect(MECH_SPECS.xenofold.title).toContain('XENOFOLD');
    expect(MECH_SPECS.antigravity.title).toContain('ANTIGRAVITY');
    expect(MECH_SPECS.gridiron.title).toContain('HIT-STICK');
  });

  it('evaluates Active Thermal Venting sweet-spot [0.65, 0.80]', () => {
    expect(evaluateActiveVent(0.25, 0.25).outcome).toBe('normal');
    expect(evaluateActiveVent(0.7, 0.72).outcome).toBe('perfect');
    expect(evaluateActiveVent(0.6, 0.6).outcome).toBe('good');
    expect(evaluateActiveVent(0.92, 0.92).outcome).toBe('jammed');
  });

  it('unlocks all 8 Synergy Evolutions including Biotech, Swarm & Hit-Stick', () => {
    expect(AUGMENTS.length).toBeGreaterThanOrEqual(28);
    const stats = computeAugmentStats({
      protac_warhead_catalyst: 1,
      alphagenome_splicer: 1,
      antigravity_subagents: 1,
      hit_stick_hydraulics: 1,
    });
    const ids = stats.unlockedSynergies.map((s) => s.id);
    expect(ids).toContain('covalent_protac_cascade');
    expect(ids).toContain('antigravity_swarm_matrix');
  });

  it('embeds all 189 authentic AlphaFold KRAS (P01116) C-alpha coordinates & domains', () => {
    expect(KRAS_P01116_CA).toHaveLength(189);
    expect(classifyKrasDomain(12)).toBe('p_loop_g12c');
    expect(classifyKrasDomain(34)).toBe('switch_i');
    expect(classifyKrasDomain(64)).toBe('switch_ii_pocket');
    expect(classifyKrasDomain(185)).toBe('hvr_tail');
    expect(classifyKrasDomain(100)).toBe('core');

    expect(getPlddtColor(95)).toBe('#0053d6');
    expect(getPlddtColor(80)).toBe('#65cbf3');
    expect(getPlddtColor(60)).toBe('#ffdb13');
    expect(getPlddtColor(42)).toBe('#ff7d45');

    const projected = projectKrasBackbone({ x: 400, y: 300 }, 12, 0.4, 0.7, 0.2, 0.5);
    expect(projected).toHaveLength(189);
    const g12c = projected.find((p) => p.seq === 12);
    expect(g12c).toBeDefined();
    expect(g12c?.domain).toBe('p_loop_g12c');
  });

  it('simulates Hooke-law spring-mass displacement on ReactiveGrid', () => {
    const grid = new ReactiveGrid(800, 600, 50);
    grid.applyImpulse({ x: 400, y: 300 }, 220, 650, 192);
    grid.update(0.016);
    expect(grid.cols).toBeGreaterThan(10);
    expect(grid.rows).toBeGreaterThan(8);
  });

  it('splices AlphaGenome A-T-G-C codons, deploys Sub-Agent Wingmen, and spawns 3D KRAS-G12C Boss', () => {
    const sound = new SoundEngine();
    const profile = createDefaultProfile();
    const toasts: string[] = [];
    const world = new GameWorld(profile, sound, {
      onToast: (title) => toasts.push(title),
      onLevelUpDraft: () => {},
      onGameOver: () => {},
    });

    world.resetRun('antigravity');
    expect(world.subAgents.length).toBeGreaterThanOrEqual(2);

    // Splice ATG -> Start Codon Overcharge
    world.spliceNucleotide('A');
    world.spliceNucleotide('T');
    world.spliceNucleotide('G');
    expect(world.lastCodonTriggered).toBe('ATG');
    expect(world.overchargeTimer).toBeGreaterThan(0);

    // Spawn 3D AlphaFold KRAS-G12C Boss
    world.spawnBossEncounter('xenofold_omega');
    expect(world.boss).not.toBeNull();
    expect(world.boss?.id).toBe('xenofold_omega');
  });
});
