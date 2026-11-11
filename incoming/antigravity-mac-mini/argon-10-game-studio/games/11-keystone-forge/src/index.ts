import type { ArgonGameInstance, ArgonGameMetadata } from '../../shared-contract';
import { mountKeystoneForgeUI } from './ui';

export * from './config';
export * from './content';
export * from './rng';
export * from './simulation';
export * from './persistence';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: '11-keystone-forge',
  number: 11,
  title: 'Keystone Forge',
  subtitle: 'Flush Silhouette Fitting, Input Finesse & Cavity Downstacking',
  genre: 'Spatial Silhouette & Finesse Puzzle',
  primaryReference: 'Tetris (7-Bag, Hold, Finesse & Parity)',
  supportingReference: 'Keystone Die-Press & Cavity Dojo',
  oneSentenceLoop:
    'Read the 6-column anvil skyline, rotate and slide polyomino keystones with minimal Finesse inputs to stamp 0-overhang Flush Fits, and chisel through buried voids.',
  shortGoal: 'Forge 20 Ingot Rows in Sprint Mode or solve all 5 Cavity Dojo lessons with 0 buried voids.',
  longGoal: 'Sustain a 15× Flush Streak with 100% Optimal Finesse and master 4-Row Quad Keystones.',
  controlsSummary:
    '←/→ or A/D: Slide · ↑/W/R/Z: Rotate · Space/Enter: Stamp · C/Shift: Hold · X/E: Laser Chisel · H: Coach Hint',
  accentColor: '#06b6d4',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  return mountKeystoneForgeUI(container, options);
}
