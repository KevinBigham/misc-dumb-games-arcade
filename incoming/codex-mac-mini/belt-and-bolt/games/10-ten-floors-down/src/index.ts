import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { GAME_CONFIG } from './config';
import { loadActiveRun, saveActiveRun } from './persistence';
import { getDailySeedNumber, getDailySeedString } from './rng';
import { createInitialGameState } from './simulation';
import { TenFloorsDownUI } from './ui';

export const metadata: ArgonGameMetadata = {
  id: GAME_CONFIG.ID,
  number: 10,
  title: GAME_CONFIG.TITLE,
  subtitle: GAME_CONFIG.SUBTITLE,
  genre: 'Turn-Based Tactical Roguelike / Alchemy Dungeon Crawler',
  primaryReference: 'Shattered Pixel Dungeon',
  supportingReference: 'Brogue',
  oneSentenceLoop:
    'Descend 10 procedural dungeon floors where every step, strike, and item costs Action Ticks, 6 Potion Colors are shuffled per seed until identified by drinking, throwing, or Alchemy Desks, and permadeath ends with a cause-of-death combat recap.',
  shortGoal:
    'Identify unknown potion colors, upgrade your gear, and defeat The Iron Warden on Floor 5.',
  longGoal:
    'Survive all 10 floors, destroy The Abyssal Core final boss on Floor 10, and conquer the Daily Seed!',
  controlsSummary:
    'WASD/Arrows or Tap tile to Move/Attack • Space: Wait • 1-6: Drink/Throw Potions & Upgrade Scrolls • Q: Class Ability • E: Alchemy Desk • >: Descend Stairs',
  accentColor: GAME_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  let initialState =
    options?.initialSeed !== undefined ? null : loadActiveRun();

  if (!initialState) {
    const dailyStr = getDailySeedString();
    const seed =
      options?.initialSeed !== undefined
        ? options.initialSeed
        : getDailySeedNumber(dailyStr);
    const seedLabel =
      options?.initialSeed !== undefined
        ? String(options.initialSeed)
        : `DAILY-${dailyStr}`;

    initialState = createInitialGameState({
      seed,
      seedLabel,
      heroClass: 'vanguard',
      debug: options?.debug,
    });
    saveActiveRun(initialState);
  } else if (options?.debug !== undefined) {
    initialState.debugRevealAll = options.debug;
  }

  const ui = new TenFloorsDownUI(container, initialState);

  return {
    destroy() {
      ui.destroy();
    },
    getStateSnapshot() {
      return JSON.parse(JSON.stringify(ui.getState()));
    },
    restartWithSeed(seed: number) {
      ui.restartWithSeed(seed, String(seed));
    },
    toggleDebug(force?: boolean) {
      ui.toggleDebug(force);
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
