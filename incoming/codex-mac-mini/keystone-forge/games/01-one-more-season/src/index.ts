import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract.ts';
import { OneMoreSeasonUI } from './ui.ts';

export * from './config.ts';
export * from './rng.ts';
export * from './content.ts';
export * from './simulation.ts';
export * from './persistence.ts';
export * from './audio.ts';
export * from './ui.ts';

export const metadata: ArgonGameMetadata = {
  id: '01-one-more-season',
  number: 1,
  title: 'One More Season',
  subtitle: 'Ironvale Rovers FC — Five-a-Side Club Management',
  genre: 'Compact Season-Loop Sports Management & Tactical Preparation',
  primaryReference: 'Football Manager (Streamlined Match Prep & Squad Rotation)',
  supportingReference: 'Nintendo Pocket Football Club / Out of the Park Baseball',
  oneSentenceLoop:
    'Scout the next opponent, balance 5 starters and 2 preparation points between Rest and Training, pick a tactical plan for 16 alternating possessions, and develop your 8-player squad to win at least 4 of 6 fixtures.',
  shortGoal:
    'Read Cinderwick Athletic’s press tendency, manage tired star striker Kaelen Vance (Fatigue 56), and win Fixture 1.',
  longGoal:
    'Guide Ironvale Rovers FC to at least 4 wins across the 6-fixture season using either Rotated Patient Matchup or Star-Heavy Aggressive Push.',
  controlsSummary:
    'Mouse/Touch to swap starters, spend 2 Prep Points (Rest -24 Fat / Train +1 Stat +8 Fat), pick Tactical Plan, inspect 16 possessions, and press [D] for the Math Inspector.',
  accentColor: '#10b981',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  const ui = new OneMoreSeasonUI(container, options);
  return {
    destroy: () => ui.destroy(),
    getStateSnapshot: () => ui.getStateSnapshot(),
    restartWithSeed: (seed: number) => ui.restartWithSeed(seed),
    toggleDebug: (force?: boolean) => ui.toggleDebug(force),
  };
}

const gameModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default gameModule;
