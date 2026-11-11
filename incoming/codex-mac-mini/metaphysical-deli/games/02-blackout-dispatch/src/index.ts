import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract.ts';
import { createBlackoutDispatchUI } from './ui.ts';

export * from './config.ts';
export * from './rng.ts';
export * from './content.ts';
export * from './simulation.ts';
export * from './persistence.ts';
export * from './audio.ts';
export * from './ui.ts';

export const metadata: ArgonGameMetadata = {
  id: '02-blackout-dispatch',
  number: 2,
  title: 'Blackout Dispatch',
  subtitle: '12-Turn Power Grid Storm Logistics Puzzle',
  genre: 'Turn-Based Network Flow & Infrastructure Tactics',
  primaryReference: 'Mini Metro / Into the Breach',
  supportingReference: 'Factorio Power Grid & Max-Flow Min-Cut Dispatch',
  oneSentenceLoop:
    'Inspect the 2-turn storm radar and priority district demands, stage up to 2 link actions with live deterministic flow preview and free undo, and commit each turn to keep 5 districts powered across a 12-turn storm.',
  shortGoal:
    'Connect St. Jude Hospital (D1) and Harbor Waterworks (D2) on Turn 1 and resolve their shared 6 MW capacity bottleneck on Turn 2.',
  longGoal:
    'Survive all 12 storm turns across Harbor Squall, Twin Ridge Gale, Category-4 Supercell, and Seeded Storm modes using either Single Trunk Efficiency or Redundant Storm Loop topologies.',
  controlsSummary:
    'Click any orthogonal 8x8 corridor to Place, Upgrade, Repair, or Reroute links; [Z] Undo staged action; [D] Toggle Debug Solver Panel.',
  accentColor: '#38bdf8',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  const controller = createBlackoutDispatchUI(container, options);
  return {
    destroy() {
      controller.destroy();
    },
    getStateSnapshot() {
      return controller.getState();
    },
    restartWithSeed(seed: number) {
      controller.restartWithSeed(seed);
    },
    toggleDebug(force?: boolean) {
      controller.toggleDebug(force);
    },
  };
}

const gameModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default gameModule;
