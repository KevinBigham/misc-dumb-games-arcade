import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { DEFAULT_SEED } from './config';
import { loadOrInitializeState, saveToLocalStorage } from './persistence';
import { createInitialState } from './simulation';
import { EmberRelayUI } from './ui';

export const metadata: ArgonGameMetadata = {
  id: '03-the-last-signal',
  number: 3,
  title: 'The Last Signal: Ember Relay',
  subtitle: 'Staged Discovery & Automation Narrative Incremental',
  genre: 'Brief C ("The Last Signal") + Premise 2 ("Ember") — Narrative Incremental',
  primaryReference: 'A Dark Room',
  supportingReference: 'Universal Paperclips & Factorio Circuit Rules',
  oneSentenceLoop:
    'Crank the hand-dynamo, restore coastal relay hardware, configure safe declarative automation rules, and triage 12 Solstice distress transmissions across 4 archipelago stations.',
  shortGoal:
    'Warm the vacuum receiver, complete your first structural repair to bring the Frequency Oscilloscope online, and answer North Reef’s SOS.',
  longGoal:
    'Guide Ember Point Relay through all 3 Chapters to reach either Ending A (The Archival Beacon) or Ending B (The Exodus Convoy).',
  controlsSummary:
    'Mouse/Touch buttons or Keyboard: [C] Crank Dynamo, [S] Haul Salvage, [T] Tune Harmonic, [N] Step Cycle, [D] Debug Inspector',
  accentColor: '#f59e0b',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const initialState =
    options?.initialSeed !== undefined
      ? createInitialState(options.initialSeed)
      : loadOrInitializeState(DEFAULT_SEED);

  saveToLocalStorage(initialState);
  const ui = new EmberRelayUI(container, initialState, {
    debug: options?.debug,
  });

  return {
    destroy(): void {
      ui.destroy();
    },
    getStateSnapshot(): unknown {
      return structuredClone(ui.getState());
    },
    restartWithSeed(seed: number): void {
      ui.restartWithSeed(seed);
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

export * from './config';
export * from './content';
export * from './persistence';
export * from './rng';
export * from './simulation';
export * from './ui';
