import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract.ts';
import { MergeKitchenController } from './ui.ts';

export const metadata: ArgonGameMetadata = {
  id: '07-merge-kitchen',
  number: 7,
  title: 'Merge Kitchen',
  subtitle: '2048 Bistro Prep & Customer Order Service',
  genre: 'Sliding-Tile Merge Puzzle & Culinary Order Management',
  primaryReference: '2048 (Gabriele Cirulli)',
  supportingReference: 'Overcooked! / Threes!',
  oneSentenceLoop:
    'Swipe a 4x4 kitchen prep board in four directions to slide and merge culinary ingredients up an 11-tier Recipe Chain while serving requested dishes to an active 3-Ticket Customer Order Rail to free board space and build Rush-Hour tip multipliers.',
  shortGoal:
    'Serve 10 Customer Orders (or craft the Tier 10 Michelin Grand Feast [1024]) to earn your Michelin Star Victory.',
  longGoal:
    "Continue in Endless Dinner Service to craft Tier 11: Chef's Legend [2048] with a 5x+ Rush Streak.",
  controlsSummary:
    'Arrow Keys / WASD or Touch Swipe to slide 4x4 board · Keys [1], [2], [3] or Click to Serve Customer Tickets · [R] Restart',
  accentColor: '#e06d2b',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const controller = new MergeKitchenController(container, options);
  return {
    destroy(): void {
      controller.destroy();
    },
    getStateSnapshot(): unknown {
      return controller.getState();
    },
    restartWithSeed(seed: number): void {
      controller.restartWithSeed(seed);
    },
    toggleDebug(force?: boolean): void {
      controller.toggleDebug(force);
    },
  };
}

const gameModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default gameModule;

export * from './config.ts';
export * from './rng.ts';
export * from './content.ts';
export * from './simulation.ts';
export * from './persistence.ts';
export * from './ui.ts';
