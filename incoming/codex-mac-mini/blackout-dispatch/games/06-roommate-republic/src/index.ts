import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract.ts';
import { GAME_CONFIG } from './config.ts';
import { createRoommateRepublicUI } from './ui.ts';

export const metadata: ArgonGameMetadata = {
  id: GAME_CONFIG.GAME_ID,
  number: GAME_CONFIG.GAME_NUMBER,
  title: GAME_CONFIG.TITLE,
  subtitle: GAME_CONFIG.SUBTITLE,
  genre: 'Incentive Prediction, Experiment & Policy Simulation Lab',
  primaryReference: 'The Evolution of Trust (Nicky Case)',
  supportingReference: 'Lichess Post-Game Counterfactual Review',
  oneSentenceLoop:
    'Inspect roommate incentive parameters, commit to a testable prediction, enact a household billing policy across 4 simulated weeks, and audit the double-entry ledger side-by-side on the exact same frozen external event schedule.',
  shortGoal:
    'Predict who pays the most and whether everyone survives the Week 3 Surprise Expense without liquidity stress.',
  longGoal:
    'Compare all 4 household policies across all 3 scenarios on frozen event schedules, test parameter sensitivity via the Assumptions Sliders, and complete the 3 Debrief Prompts.',
  controlsSummary:
    'Mouse / Touch / Keyboard: Select scenario & prediction, choose policy, click transaction ID chips to highlight ledger rows, adjust native range sliders, press [D] for Debug telemetry.',
  accentColor: GAME_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): ArgonGameInstance {
  return createRoommateRepublicUI(container, options);
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
export * from './audio.ts';
export * from './ui.ts';
