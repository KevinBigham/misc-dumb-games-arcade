import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract.ts';
import { GAME_CONFIG } from './config.ts';
import { createInitialRunState } from './simulation.ts';
import { JunkyardCourierUI } from './ui.ts';

export * from './config.ts';
export * from './rng.ts';
export * from './content.ts';
export * from './simulation.ts';
export * from './persistence.ts';
export * from './audio.ts';
export * from './ui.ts';

export const metadata: ArgonGameMetadata = {
  id: '04-junkyard-courier',
  number: 4,
  title: 'Junkyard Courier',
  subtitle: 'The Rustwater Shallows — Boat Loadout & Route Roguelite',
  genre: 'Archipelago Loadout & Route Strategy Roguelite',
  primaryReference: 'Sunless Sea / Dredge',
  supportingReference: 'FTL: Faster Than Light',
  oneSentenceLoop:
    'Pack your 8-slot workboat hold with salvage cargo, modules, fuel drums, and repair kits, then thread a 12-node flooded industrial archipelago where every route leg trades fuel burn against visible sea hazards.',
  shortGoal: 'Complete your first port-to-port salvage delivery and claim a Boat Module Upgrade.',
  longGoal:
    'Complete 3 salvage deliveries across The Rustwater Shallows without sinking (0 Hull) or running out of diesel at sea (0 Fuel).',
  controlsSummary:
    'Mouse / Touch to accept contracts, configure the 8-Slot Hold, click connected archipelago nodes to sail, resolve hazard cards, and press [D] for the Debug Inspector.',
  accentColor: '#f3b34c',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  const seed = options?.initialSeed ?? GAME_CONFIG.defaultSeed;
  const initialState = createInitialRunState(seed);
  const ui = new JunkyardCourierUI(container, initialState, {
    debug: options?.debug,
  });

  return {
    destroy(): void {
      ui.destroy();
    },
    getStateSnapshot(): unknown {
      return structuredClone(ui.getState());
    },
    restartWithSeed(nextSeed: number): void {
      ui.restartWithSeed(nextSeed);
    },
    toggleDebug(force?: boolean): void {
      ui.toggleDebug(force);
    },
  };
}

const gameModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default gameModule;
