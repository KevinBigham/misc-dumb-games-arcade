import type { ArgonGameInstance, ArgonGameMetadata } from '../../shared-contract';
import { mountAegisZeroUi } from './ui';

export const metadata: ArgonGameMetadata = {
  id: '13-aegis-zero',
  number: 13,
  title: 'Aegis-Zero: Graze Overclock',
  subtitle: 'Director’s Cut Bullet-Heaven — Zero Ammo, Graze Within 44px to Fire & Shatter',
  genre: 'Twin-Stick Kinetic Bullet-Heaven / Graze Roguelite',
  primaryReference: 'Nuclear Throne · Ikaruga',
  supportingReference: 'Braid · The Binding of Isaac · Geometry Wars',
  oneSentenceLoop:
    'Weave your 44px Resonance Halo against enemy plasma curtains to fire high-velocity Rail-Shards, dive for 4.0s decaying Volatile Flux Gems in their 1.5s White-Hot window, and trigger Phase-Shatter Novas across 8 escalating waves.',
  shortGoal: 'Reach 100% Overclock, execute a Bullet-Alchemy Shatter Nova, and defeat Wave 4 Mid-Boss HEX-WARDEN VEX.',
  longGoal: 'Unlock all 3 Chassis Loadouts (Vanguard-Zero, Phantom-Braid, Blood-Seraph) and obliterate Wave 8 Apex Boss CHRONO-SERAPH OMEGA.',
  controlsSummary:
    'WASD/Arrows: Maneuver · Mouse/Touch: Aim · SPACE/Right-Click: Phase-Dash & Shatter Nova · [1/2/3]: Draft Augment',
  accentColor: '#38bdf8',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const controller = mountAegisZeroUi(container, options);
  return {
    destroy: () => controller.destroy(),
    getStateSnapshot: () => controller.getStateSnapshot(),
    restartWithSeed: (seed: number) => controller.restartWithSeed(seed),
    toggleDebug: (force?: boolean) => controller.toggleDebug(force),
  };
}

export * from './config';
export * from './content';
export * from './persistence';
export * from './rng';
export * from './simulation';
