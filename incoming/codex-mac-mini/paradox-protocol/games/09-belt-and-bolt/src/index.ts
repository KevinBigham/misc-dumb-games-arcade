import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { createBeltAndBoltUI } from './ui';

export const metadata: ArgonGameMetadata = {
  id: '09-belt-and-bolt',
  number: 9,
  title: 'Belt & Bolt',
  subtitle: 'Geometric Ore Conveyor Logistics & Perimeter Turret Wave Defense',
  genre: 'Factory Automation + Tower Defense (Mindustry + shapez)',
  primaryReference: 'Mindustry',
  supportingReference: 'shapez',
  oneSentenceLoop:
    'Place Miners, Conveyors, Splitters, and Alloy Smelters on a 12x12 grid so mined geometric ore physically travels along belts to either feed Perimeter Defense Turrets or deliver into the Central Command Core across a 30-wave campaign.',
  shortGoal: 'Survive Wave 10 and complete the first 3 Tech Unlocks (Waves 3, 6, 9).',
  longGoal:
    'Survive all 30 Waves (including Siege Crawler, Shielded Dreadnought, and Apex Goliath bosses) and unlock Endless Overdrive Factory Mode.',
  controlsSummary:
    'Click/Tap grid to place block | [1..0] Select Block | [R] Rotate Direction | [X] Right-Click Demolish | [Space] Launch Wave Early | [P] Pause | [D] Debug',
  accentColor: '#38bdf8',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const controller = createBeltAndBoltUI(container, options);
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
export * from './config';
export * from './content';
export * from './persistence';
export * from './rng';
export * from './simulation';
