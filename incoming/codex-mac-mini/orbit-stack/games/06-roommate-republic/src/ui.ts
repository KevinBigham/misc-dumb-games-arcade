import {
  GAME_CONFIG,
  PolicyId,
  RoommateId,
  ROOMMATE_ORDER,
  ScenarioId,
  WeekNumber,
} from './config.ts';
import {
  createDefaultAssumptions,
  DEBRIEF_PROMPTS,
  POLICIES,
  POLICY_LIST,
  ROOMMATE_PROFILES,
  SCENARIOS,
  SCENARIO_LIST,
} from './content.ts';
import {
  comparePoliciesOnSameEvents,
  generateExternalEventSchedule,
  gradePrediction,
  HouseholdRunResult,
  PolicyComparisonResult,
  PredictionGradeResult,
  simulateHouseholdRun,
} from './simulation.ts';
import {
  exportStateToJson,
  importStateFromJson,
  loadPersistedState,
  RoommateRepublicPersistedState,
  savePersistedState,
} from './persistence.ts';
import { RoommateAudio } from './audio.ts';

const ROOMMATE_SVGS: Record<RoommateId, string> = {
  maya: `<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Maya avatar">
    <circle cx="32" cy="32" r="30" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#d97706"/>
    <circle cx="32" cy="26" r="11" fill="#fde68a" stroke="#92400e" stroke-width="1.8"/>
    <path d="M20 24 C20 14 44 14 44 24 C41 19 23 19 20 24 Z" fill="#78350f"/>
    <rect x="23" y="23" width="7" height="5" rx="1.5" fill="none" stroke="#451a03" stroke-width="1.6"/>
    <rect x="34" y="23" width="7" height="5" rx="1.5" fill="none" stroke="#451a03" stroke-width="1.6"/>
    <line x1="30" y1="25" x2="34" y2="25" stroke="#451a03" stroke-width="1.6"/>
    <path d="M28 32 Q32 35 36 32" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  devon: `<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Devon avatar">
    <circle cx="32" cy="32" r="30" fill="#d1fae5" stroke="#059669" stroke-width="2.5"/>
    <path d="M15 54 C15 41 49 41 49 54" fill="#059669"/>
    <circle cx="32" cy="26" r="11" fill="#a7f3d0" stroke="#065f46" stroke-width="1.8"/>
    <path d="M21 21 C22 13 42 13 43 21 Z" fill="#064e3b"/>
    <circle cx="28" cy="26" r="1.7" fill="#064e3b"/>
    <circle cx="36" cy="26" r="1.7" fill="#064e3b"/>
    <path d="M28 32 Q32 34 36 32" fill="none" stroke="#064e3b" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="42" y="42" width="9" height="10" rx="2" fill="#ffffff" stroke="#065f46" stroke-width="1.5"/>
  </svg>`,
  priya: `<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Priya avatar">
    <circle cx="32" cy="32" r="30" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#7c3aed"/>
    <circle cx="32" cy="26" r="11" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.8"/>
    <path d="M19 26 A13 13 0 0 1 45 26" fill="none" stroke="#5b21b6" stroke-width="3"/>
    <rect x="17" y="23" width="4" height="7" rx="2" fill="#5b21b6"/>
    <rect x="43" y="23" width="4" height="7" rx="2" fill="#5b21b6"/>
    <circle cx="28" cy="26" r="1.8" fill="#4c1d95"/>
    <circle cx="36" cy="26" r="1.8" fill="#4c1d95"/>
    <path d="M28 32 Q32 36 36 32" fill="none" stroke="#4c1d95" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  leo: `<svg viewBox="0 0 64 64" width="48" height="48" role="img" aria-label="Leo avatar">
    <circle cx="32" cy="32" r="30" fill="#ffe4e6" stroke="#e11d48" stroke-width="2.5"/>
    <path d="M16 54 C16 42 48 42 48 54" fill="#e11d48"/>
    <circle cx="32" cy="26" r="11" fill="#fecdd3" stroke="#881337" stroke-width="1.8"/>
    <path d="M22 19 L32 14 L42 19 Z" fill="#881337"/>
    <circle cx="28" cy="25" r="1.8" fill="#881337"/>
    <circle cx="36" cy="25" r="1.8" fill="#881337"/>
    <path d="M27 32 Q33 35 38 30" fill="none" stroke="#881337" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
};

const STYLES = `
:root {
  --rr-brand-color: #b45309;
  --rr-bg: #faf7f2;
  --rr-surface: #ffffff;
  --rr-surface-alt: #f4efe6;
  --rr-border: #d6cbb9;
  --rr-text: #1c1917;
  --rr-text-muted: #57534e;
  --rr-success: #047857;
  --rr-success-bg: #ecfdf5;
  --rr-danger: #be123c;
  --rr-danger-bg: #fff1f2;
  --rr-warn: #b45309;
  --rr-warn-bg: #fffbeb;
  --rr-accent-purple: #6d28d9;
}

@media (prefers-color-scheme: dark) {
  :root {
    --rr-brand-color: #f59e0b;
  }
}

.rr-root {
  color-scheme: light dark;
  accent-color: var(--rr-brand-color);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--rr-bg);
  color: var(--rr-text);
  min-block-size: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  line-height: 1.45;
}

.rr-container {
  max-inline-size: 1280px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.rr-header {
  background: var(--rr-surface);
  border: 2px solid var(--rr-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(28, 25, 23, 0.05);
}

.rr-title-block h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  letter-spacing: -0.02em;
  color: #1c1917;
}

.rr-title-block p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--rr-text-muted);
}

.rr-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.rr-btn {
  appearance: none;
  border: 1.5px solid var(--rr-border);
  background: var(--rr-surface-alt);
  color: var(--rr-text);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
}

.rr-btn:hover {
  background: #e7dfd1;
  border-color: #a89984;
}

.rr-btn:focus-visible {
  outline: 2px solid var(--rr-brand-color);
  outline-offset: 2px;
}

.rr-btn-primary {
  background: #b45309;
  color: #ffffff;
  border-color: #92400e;
}

.rr-btn-primary:hover {
  background: #92400e;
  color: #ffffff;
}

.rr-btn-active {
  background: #1c1917;
  color: #ffffff;
  border-color: #1c1917;
}

.rr-scenario-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}

.rr-scenario-tab {
  text-align: left;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 2px solid var(--rr-border);
  background: var(--rr-surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rr-scenario-tab[aria-selected="true"] {
  border-color: #b45309;
  background: #fffbeb;
  box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.15);
}

.rr-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--rr-surface-alt);
  color: var(--rr-text);
}

.rr-badge-shock {
  background: var(--rr-danger-bg);
  color: var(--rr-danger);
  border: 1px solid #fecdd3;
}

.rr-badge-ok {
  background: var(--rr-success-bg);
  color: var(--rr-success);
  border: 1px solid #a7f3d0;
}

.rr-section {
  background: var(--rr-surface);
  border: 1.5px solid var(--rr-border);
  border-radius: 12px;
  padding: 1.15rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.rr-section-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-block-end: 0.85rem;
  border-block-end: 1px solid var(--rr-surface-alt);
  padding-block-end: 0.5rem;
}

.rr-section-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.rr-roommate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 0.85rem;
}

.rr-roommate-card {
  border: 1.5px solid var(--rr-border);
  border-radius: 10px;
  padding: 0.85rem;
  background: #fdfcfa;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rr-roommate-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rr-stat-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 0.65rem;
  font-size: 0.8rem;
  background: var(--rr-surface-alt);
  padding: 0.55rem;
  border-radius: 8px;
}

.rr-grid-2col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.rr-policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.75rem;
}

.rr-policy-card {
  text-align: left;
  border: 2px solid var(--rr-border);
  border-radius: 10px;
  padding: 0.8rem;
  background: var(--rr-surface);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rr-policy-card[aria-checked="true"] {
  border-color: #b45309;
  background: #fffbeb;
}

.rr-conservation-banner {
  background: var(--rr-success-bg);
  border: 1.5px solid #6ee7b7;
  color: #065f46;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
}

.rr-tx-chip {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 5px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  cursor: pointer;
  margin-inline: 0.15rem;
}

.rr-tx-chip:hover {
  background: #fde68a;
}

/* Responsive Data Table per modern-web-guidance (responsive-table) */
.rr-table-wrapper {
  overflow: auto;
  max-inline-size: 100%;
  max-block-size: min(500px, 80vh);
  container-type: inline-size;
  border: 1px solid var(--rr-border);
  border-radius: 8px;
}

.rr-table-wrapper table {
  inline-size: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.83rem;
}

.rr-table-wrapper caption {
  text-align: left;
  padding: 0.6rem 0.85rem;
  font-weight: 700;
  background: var(--rr-surface-alt);
  border-block-end: 1px solid var(--rr-border);
}

.rr-table-wrapper thead {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  background: #eae2d3;
}

.rr-table-wrapper th,
.rr-table-wrapper td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-block-end: 1px solid #e7e0d3;
  vertical-align: top;
}

.rr-table-wrapper tbody th {
  position: sticky;
  inset-inline-start: 0;
  background: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
}

.rr-table-wrapper tr.rr-tx-highlighted th,
.rr-table-wrapper tr.rr-tx-highlighted td {
  background: #fef3c7 !important;
  transition: background 0.25s ease;
}

@container (width < 600px) {
  .rr-table-wrapper table,
  .rr-table-wrapper thead,
  .rr-table-wrapper tbody,
  .rr-table-wrapper tr,
  .rr-table-wrapper th,
  .rr-table-wrapper td {
    display: block;
  }

  .rr-table-wrapper thead {
    display: none;
  }

  .rr-table-wrapper tr {
    margin-block-end: 1rem;
    border: 1px solid var(--rr-border);
  }

  .rr-table-wrapper tbody th {
    position: sticky;
    inset-block-start: 0;
    z-index: 2;
    background: #f4efe6;
  }

  .rr-table-wrapper table {
    --label-2: "Week";
    --label-3: "Type";
    --label-4: "From -> To";
    --label-5: "Amount";
    --label-6: "Explanation & Model Drivers";
  }

  .rr-table-wrapper td:nth-child(2)::before {
    content: var(--label-2) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(3)::before {
    content: var(--label-3) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(4)::before {
    content: var(--label-4) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(5)::before {
    content: var(--label-5) ": ";
    font-weight: 700;
  }
  .rr-table-wrapper td:nth-child(6)::before {
    content: var(--label-6) ": ";
    font-weight: 700;
  }
}

/* Native Range Slider per modern-web-guidance (slider + brand-consistent-forms) */
input[type="range"].rr-slider {
  --slider-track-size: 0.45rem;
  --slider-thumb-size: 1.15rem;
  --slider-track-radius: 999px;
  --slider-thumb-radius: 50%;
  --slider-track-color: #d6cbb9;
  --slider-fill-color: var(--rr-brand-color);
  --slider-thumb-color: var(--slider-fill-color);
  --slider-direction: to right;

  --attr-min: attr(min type(<number>), 0);
  --attr-max: attr(max type(<number>), 100);
  --control-value: attr(value type(<number>), 50);
  --slider-progress: calc(
    progress(var(--control-value), var(--attr-min), var(--attr-max)) * 100%
  );

  appearance: none;
  inline-size: 100%;
  block-size: 2rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
}

input[type="range"].rr-slider:dir(rtl) {
  --slider-direction: to left;
}

@supports not (opacity: progress(1, 0, 100)) {
  input[type="range"].rr-slider {
    --slider-progress: calc(
      (var(--control-value) - var(--attr-min)) /
      (var(--attr-max) - var(--attr-min)) * 100%
    );
  }
}

input[type="range"].rr-slider::-webkit-slider-runnable-track {
  block-size: var(--slider-track-size);
  border: 0;
  border-radius: var(--slider-track-radius);
  background: linear-gradient(
    var(--slider-direction),
    var(--slider-fill-color) var(--slider-progress),
    var(--slider-track-color) var(--slider-progress)
  );
}

input[type="range"].rr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  inline-size: var(--slider-thumb-size);
  block-size: var(--slider-thumb-size);
  margin-block-start: calc(
    (var(--slider-track-size) - var(--slider-thumb-size)) / 2
  );
  border: 0;
  border-radius: var(--slider-thumb-radius);
  background: var(--slider-thumb-color);
}

input[type="range"].rr-slider::-moz-range-track {
  block-size: var(--slider-track-size);
  border: 0;
  border-radius: var(--slider-track-radius);
  background: var(--slider-track-color);
}

input[type="range"].rr-slider::-moz-range-progress {
  block-size: var(--slider-track-size);
  border-radius: var(--slider-track-radius);
  background: var(--slider-fill-color);
}

input[type="range"].rr-slider::-moz-range-thumb {
  inline-size: var(--slider-thumb-size);
  block-size: var(--slider-thumb-size);
  border: 0;
  border-radius: var(--slider-thumb-radius);
  background: var(--slider-thumb-color);
}

input[type="range"].rr-slider:focus-visible {
  outline: 2px solid var(--slider-fill-color);
  outline-offset: 4px;
}

/* Fallback for older browsers without accent-color per brand-consistent-forms */
@supports not (accent-color: var(--rr-brand-color)) {
  input[type="radio"].rr-visually-hidden {
    position: absolute !important;
    clip-path: inset(50%) !important;
    overflow: hidden !important;
    width: 1px !important;
    height: 1px !important;
    margin: -1px !important;
    padding: 0 !important;
    border: 0 !important;
    white-space: nowrap !important;
  }
}

.rr-explanation-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.85rem;
}

.rr-explanation-card {
  border: 1px solid var(--rr-border);
  border-left: 4px solid var(--rr-brand-color);
  border-radius: 8px;
  padding: 0.8rem;
  background: #fdfcfa;
  font-size: 0.85rem;
}

.rr-limitation-box {
  margin-block-start: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  background: var(--rr-surface-alt);
  color: var(--rr-text-muted);
  font-size: 0.78rem;
}

.rr-debug-drawer {
  background: #1c1917;
  color: #f5f5f4;
  padding: 1rem;
  border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  overflow-x: auto;
}
`;

export interface RoommateRepublicController {
  destroy(): void;
  getStateSnapshot(): {
    persisted: RoommateRepublicPersistedState;
    activeRun: HouseholdRunResult;
    predictionGrade: PredictionGradeResult;
    comparisonResult: PolicyComparisonResult;
    debugEnabled: boolean;
  };
  restartWithSeed(seed: number): void;
  toggleDebug(force?: boolean): void;
}

export function createRoommateRepublicUI(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): RoommateRepublicController {
  const initialSeed = options?.initialSeed ?? GAME_CONFIG.DEFAULT_SEED;
  let state: RoommateRepublicPersistedState = loadPersistedState(initialSeed);
  if (options?.initialSeed !== undefined && state.seed !== options.initialSeed) {
    state.seed = Math.floor(options.initialSeed) >>> 0;
    for (const sId of Object.keys(SCENARIOS) as ScenarioId[]) {
      state.frozenSchedulesByScenario[sId] = generateExternalEventSchedule(
        sId,
        state.seed,
      );
    }
    savePersistedState(state);
  }

  let debugEnabled = Boolean(options?.debug);
  let selectedTimelineWeek: WeekNumber | 'ALL' = 'ALL';
  let ledgerRoommateFilter: RoommateId | 'ALL' = 'ALL';
  let ledgerFlowFilter:
    | 'ALL'
    | 'EXTERNAL_INFLOW'
    | 'INTERNAL_TRANSFER'
    | 'EXTERNAL_OUTFLOW' = 'ALL';
  let ledgerTab: 'TRANSACTIONS' | 'CHORES' = 'TRANSACTIONS';
  let highlightedTxId: string | null = null;
  let showAssumptionsEditor = false;

  const audio = new RoommateAudio();

  let activeRun: HouseholdRunResult = computeActiveRun();
  let predictionGrade: PredictionGradeResult = gradePrediction(
    state.predictionsByScenario[state.activeScenarioId],
    activeRun,
  );
  let comparisonResult: PolicyComparisonResult = computeComparison();

  function computeActiveRun(): HouseholdRunResult {
    const sId = state.activeScenarioId;
    const sched =
      state.frozenSchedulesByScenario[sId] ??
      generateExternalEventSchedule(sId, state.seed);
    state.frozenSchedulesByScenario[sId] = sched;
    return simulateHouseholdRun(
      sId,
      state.activePolicyId,
      state.assumptionsByScenario[sId],
      sched,
    );
  }

  function computeComparison(): PolicyComparisonResult {
    const sId = state.activeScenarioId;
    const sched = state.frozenSchedulesByScenario[sId];
    return comparePoliciesOnSameEvents(
      sId,
      state.activePolicyId,
      state.comparisonPolicyId,
      state.assumptionsByScenario[sId],
      sched,
    );
  }

  function recomputeAll(): void {
    activeRun = computeActiveRun();
    predictionGrade = gradePrediction(
      state.predictionsByScenario[state.activeScenarioId],
      activeRun,
    );
    comparisonResult = computeComparison();
    savePersistedState(state);
  }

  function syncRangeSliders(rootEl: ParentNode): void {
    const sliders = rootEl.querySelectorAll<HTMLInputElement>(
      'input[type="range"].rr-slider',
    );
    sliders.forEach((slider) => {
      slider.style.setProperty('--attr-min', slider.min || '0');
      slider.style.setProperty('--attr-max', slider.max || '100');
      slider.style.setProperty('--control-value', slider.value);
    });
  }

  function renderTransactionChips(txIds: string[]): string {
    return txIds
      .slice(0, 4)
      .map(
        (id) =>
          `<button type="button" class="rr-tx-chip" data-action="focus-tx" data-tx-id="${id}" title="Jump to transaction ${id} in ledger">${id}</button>`,
      )
      .join(' ');
  }

  function renderWeeklyCashChart(run: HouseholdRunResult): string {
    const width = 680;
    const height = 210;
    const padLeft = 48;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let maxVal = 400;
    let minVal = 0;
    for (const snap of run.weeklySnapshots) {
      if (snap.endingHouseholdReserve > maxVal) {
        maxVal = snap.endingHouseholdReserve;
      }
      for (const rId of ROOMMATE_ORDER) {
        const c = snap.roommateStates[rId].endingCash;
        if (c > maxVal) maxVal = c;
        if (c < minVal) minVal = c;
      }
    }
    maxVal = Math.ceil((maxVal + 30) / 50) * 50;
    minVal = Math.min(0, Math.floor((minVal - 20) / 50) * 50);
    const span = Math.max(100, maxVal - minVal);

    const yFor = (val: number) =>
      padTop + plotH - ((val - minVal) / span) * plotH;

    const zeroY = yFor(0);
    const stressY = yFor(GAME_CONFIG.LIQUIDITY_STRESS_THRESHOLD);
    const groupW = plotW / 4;

    const barsSvg: string[] = [];
    run.weeklySnapshots.forEach((snap, wIdx) => {
      const gx = padLeft + wIdx * groupW;
      const barW = 22;
      ROOMMATE_ORDER.forEach((rId, rIdx) => {
        const cash = snap.roommateStates[rId].endingCash;
        const bx = gx + 14 + rIdx * (barW + 4);
        const topY = cash >= 0 ? yFor(cash) : zeroY;
        const barH = Math.max(3, Math.abs(yFor(cash) - zeroY));
        const fill = ROOMMATE_PROFILES[rId].color;
        barsSvg.push(
          `<rect x="${bx}" y="${topY.toFixed(1)}" width="${barW}" height="${barH.toFixed(1)}" rx="3" fill="${fill}">
            <title>Week ${snap.week} ${ROOMMATE_PROFILES[rId].name}: $${cash.toFixed(2)}</title>
          </rect>
          <text x="${bx + barW / 2}" y="${(topY - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="#1c1917">$${Math.round(cash)}</text>`,
        );
      });

      // Reserve bar (gold outline)
      const res = snap.endingHouseholdReserve;
      const rx = gx + 14 + 4 * (barW + 4) + 3;
      const rTop = yFor(res);
      const rH = Math.max(2, Math.abs(zeroY - rTop));
      barsSvg.push(
        `<rect x="${rx}" y="${rTop.toFixed(1)}" width="16" height="${rH.toFixed(1)}" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="1">
          <title>Week ${snap.week} Shared Household Reserve: $${res.toFixed(2)}</title>
        </rect>`,
      );

      barsSvg.push(
        `<text x="${gx + groupW / 2}" y="${height - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="#1c1917">Week ${snap.week}${snap.week === 3 ? ' ⚡' : ''}</text>`,
      );
    });

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="210" role="img" aria-label="4-Week Roommate Cash and Shared Reserve Trajectory Chart">
      <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#fdfcfa" stroke="#e7dfd1"/>
      <line x1="${padLeft}" y1="${zeroY.toFixed(1)}" x2="${width - padRight}" y2="${zeroY.toFixed(1)}" stroke="#57534e" stroke-width="1.2"/>
      <line x1="${padLeft}" y1="${stressY.toFixed(1)}" x2="${width - padRight}" y2="${stressY.toFixed(1)}" stroke="#e11d48" stroke-dasharray="4 3" stroke-width="1.2"/>
      <text x="${padLeft + 4}" y="${(stressY - 4).toFixed(1)}" font-size="9" font-weight="700" fill="#be123c">$40 Liquidity Stress Threshold</text>
      <text x="${padLeft - 6}" y="${(padTop + 8).toFixed(1)}" text-anchor="end" font-size="9" fill="#57534e">$${maxVal}</text>
      <text x="${padLeft - 6}" y="${(zeroY + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="#57534e">$0</text>
      ${barsSvg.join('\n')}
    </svg>`;
  }

  function render(): void {
    const scenario = SCENARIOS[state.activeScenarioId];
    const activePolicy = POLICIES[state.activePolicyId];
    const compPolicy = POLICIES[state.comparisonPolicyId];
    const currentPred = state.predictionsByScenario[state.activeScenarioId];
    const isCommitted =
      state.committedPredictionsByScenario[state.activeScenarioId];
    const sched = state.frozenSchedulesByScenario[state.activeScenarioId];
    const week3Shock = sched.weeks[2].surpriseExpense!;
    const cons = activeRun.conservation;

    const filteredTransactions = activeRun.transactions.filter((tx) => {
      if (selectedTimelineWeek !== 'ALL' && tx.week !== selectedTimelineWeek) {
        return false;
      }
      if (
        ledgerRoommateFilter !== 'ALL' &&
        tx.roommateId !== ledgerRoommateFilter &&
        tx.counterpartyRoommateId !== ledgerRoommateFilter
      ) {
        return false;
      }
      if (ledgerFlowFilter !== 'ALL' && tx.flowCategory !== ledgerFlowFilter) {
        return false;
      }
      return true;
    });

    const filteredChores = activeRun.choreLedger.filter((ch) => {
      if (selectedTimelineWeek !== 'ALL' && ch.week !== selectedTimelineWeek) {
        return false;
      }
      if (
        ledgerRoommateFilter !== 'ALL' &&
        ch.roommateId !== ledgerRoommateFilter
      ) {
        return false;
      }
      return true;
    });

    container.innerHTML = `
      <style>${STYLES}</style>
      <div class="rr-root" data-game-id="${GAME_CONFIG.GAME_ID}">
        <div class="rr-container">
          <!-- Header -->
          <header class="rr-header">
            <div class="rr-title-block">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span class="rr-badge" style="background:#fef3c7;color:#92400e;">GAME 06 · BRIEF F</span>
                <span class="rr-badge">Seed #${state.seed}</span>
                <span class="rr-badge" title="External event schedule is frozen so policy comparisons have zero RNG drift">${sched.scheduleSignature}</span>
              </div>
              <h1>${GAME_CONFIG.TITLE}: ${GAME_CONFIG.SUBTITLE}</h1>
              <p>Inspect household incentives, commit to a testable prediction, enact a billing policy, and audit the double-entry ledger on a frozen 4-week event schedule.</p>
            </div>
            <div class="rr-toolbar">
              <button type="button" class="rr-btn" data-action="toggle-assumptions" aria-expanded="${showAssumptionsEditor}">
                ${showAssumptionsEditor ? 'Hide Assumptions Sliders' : 'Edit Assumptions Sliders'}
              </button>
              <button type="button" class="rr-btn" data-action="new-seed">
                New Event Seed
              </button>
              <button type="button" class="rr-btn" data-action="toggle-mute">
                ${audio.isMuted() ? 'Audio: Muted' : 'Audio: On'}
              </button>
              <button type="button" class="rr-btn" data-action="export-json">
                Export Save
              </button>
              <button type="button" class="rr-btn ${debugEnabled ? 'rr-btn-active' : ''}" data-action="toggle-debug">
                Debug [D]
              </button>
            </div>
          </header>

          <!-- Scenario Selector Bar -->
          <nav class="rr-scenario-bar" aria-label="Household Scenarios">
            ${SCENARIO_LIST.map((sc) => {
              const selected = sc.id === state.activeScenarioId;
              const done = state.completedScenarios.includes(sc.id);
              return `
                <button type="button" class="rr-scenario-tab" role="tab" aria-selected="${selected}" data-action="select-scenario" data-scenario-id="${sc.id}">
                  <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                    <span style="font-weight:700;font-size:0.95rem;">${sc.title}</span>
                    ${done ? '<span class="rr-badge rr-badge-ok">Audited ✓</span>' : '<span class="rr-badge">4 Weeks</span>'}
                  </div>
                  <span style="font-size:0.8rem;color:var(--rr-text-muted);">${sc.subtitle}</span>
                </button>
              `;
            }).join('')}
          </nav>

          <!-- Scenario Premise & Frozen Week 3 Shock Banner -->
          <section class="rr-section" aria-label="Scenario Briefing">
            <div class="rr-section-header">
              <h2>${scenario.title} — ${scenario.utilityLabel}</h2>
              <span class="rr-badge rr-badge-shock">Frozen Week 3 Shock: ${week3Shock.title} ($${week3Shock.amountDollars.toFixed(2)})</span>
            </div>
            <p style="margin:0 0 0.6rem;font-size:0.92rem;">${scenario.premise}</p>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;font-size:0.82rem;color:var(--rr-text-muted);">
              <span><strong>Base Weekly Bill:</strong> $${scenario.baseWeeklyBillDollars}/wk</span>
              <span>·</span>
              <span><strong>Initial Shared Reserve:</strong> $${scenario.initialReserveDollars.toFixed(2)}</span>
              <span>·</span>
              <span><strong>Week 1–4 Weather/Demand Multipliers:</strong> ${sched.weeks.map((w) => `W${w.week}: ${w.weatherOrDemandIndex}x`).join(', ')}</span>
            </div>
          </section>

          <!-- 4 Roommate Agent Cards -->
          <section class="rr-section" aria-label="Roommate Behavioral Profiles">
            <div class="rr-section-header">
              <h2>Step 1: Inspect the 4 Roommate Behavioral Models</h2>
              <span style="font-size:0.82rem;color:var(--rr-text-muted);">All agent parameters are transparent and editable in the Assumptions Panel.</span>
            </div>
            <div class="rr-roommate-grid">
              ${ROOMMATE_ORDER.map((rId) => {
                const prof = ROOMMATE_PROFILES[rId];
                const params =
                  state.assumptionsByScenario[state.activeScenarioId].roommates[
                    rId
                  ];
                const summary = activeRun.roommateSummaries[rId];
                return `
                  <article class="rr-roommate-card" data-roommate-card="${rId}">
                    <div class="rr-roommate-top">
                      ${ROOMMATE_SVGS[rId]}
                      <div>
                        <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                          <strong style="font-size:1rem;">${prof.name}</strong>
                          <span class="rr-badge" style="border-left:3px solid ${prof.color};">${prof.badgeText}</span>
                        </div>
                        <div style="font-size:0.77rem;color:var(--rr-text-muted);">${prof.shortLabel}</div>
                      </div>
                    </div>
                    <p style="margin:0;font-size:0.8rem;color:var(--rr-text-muted);">${prof.bio}</p>
                    <div class="rr-stat-list">
                      <div><strong>Income:</strong> $${params.weeklyIncome}/wk</div>
                      <div><strong>Start Cash:</strong> $${params.initialCash}</div>
                      <div><strong>Usage Appetite:</strong> ${params.usageAppetite.toFixed(2)}x</div>
                      <div><strong>Free-Ride Tempt:</strong> ${Math.round(params.freeRideTemptation * 100)}%</div>
                      <div><strong>Audit Sensitivity:</strong> ${Math.round(params.auditSensitivity * 100)}%</div>
                      <div><strong>Fairness Floor:</strong> ${Math.round(params.fairnessThreshold * 100)}%</div>
                    </div>
                    <div style="border-top:1px dashed var(--rr-border);padding-top:0.45rem;display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;">
                      <span><strong>4-Wk Out-of-Pocket:</strong> $${summary.totalOutOfPocketPaid.toFixed(2)}</span>
                      <span class="rr-badge ${summary.experiencedLiquidityStress ? 'rr-badge-shock' : 'rr-badge-ok'}">
                        End Cash: $${summary.endingCash.toFixed(2)}
                      </span>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </section>

          <!-- Editable Assumptions Sliders Panel (Collapsible) -->
          ${
            showAssumptionsEditor
              ? `
          <section class="rr-section" aria-label="Editable Behavioral Assumptions Panel" id="rr-assumptions-panel">
            <div class="rr-section-header">
              <h2>Editable Assumptions Panel (Test Sensitivity on Same Event Schedule)</h2>
              <button type="button" class="rr-btn" data-action="reset-assumptions">Reset Default Assumptions</button>
            </div>
            <p style="margin:0 0 0.85rem;font-size:0.85rem;color:var(--rr-text-muted);">
              Adjusting these sliders changes the agent parameters while keeping the frozen External Event Schedule (${sched.scheduleSignature}) untouched.
            </p>
            <div class="rr-roommate-grid">
              ${ROOMMATE_ORDER.map((rId) => {
                const prof = ROOMMATE_PROFILES[rId];
                const p =
                  state.assumptionsByScenario[state.activeScenarioId].roommates[
                    rId
                  ];
                return `
                  <div class="rr-roommate-card">
                    <strong>${prof.name} Parameters</strong>
                    <div>
                      <label for="slider-income-${rId}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Weekly Income ($/wk)</span>
                        <span>$${p.weeklyIncome}</span>
                      </label>
                      <input type="range" id="slider-income-${rId}" class="rr-slider" min="110" max="550" step="5" value="${p.weeklyIncome}" aria-valuetext="$${p.weeklyIncome} per week" data-action="assumption-slider" data-roommate="${rId}" data-field="weeklyIncome"/>
                    </div>
                    <div>
                      <label for="slider-appetite-${rId}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Usage Appetite</span>
                        <span>${p.usageAppetite.toFixed(2)}x</span>
                      </label>
                      <input type="range" id="slider-appetite-${rId}" class="rr-slider" min="0.5" max="2.0" step="0.05" value="${p.usageAppetite}" aria-valuetext="${p.usageAppetite.toFixed(2)}x baseline usage" data-action="assumption-slider" data-roommate="${rId}" data-field="usageAppetite"/>
                    </div>
                    <div>
                      <label for="slider-freeride-${rId}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Free-Ride Temptation</span>
                        <span>${p.freeRideTemptation.toFixed(2)}</span>
                      </label>
                      <input type="range" id="slider-freeride-${rId}" class="rr-slider" min="0" max="1" step="0.05" value="${p.freeRideTemptation}" aria-valuetext="${Math.round(p.freeRideTemptation * 100)} percent free ride temptation" data-action="assumption-slider" data-roommate="${rId}" data-field="freeRideTemptation"/>
                    </div>
                    <div>
                      <label for="slider-audit-${rId}" style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:600;">
                        <span>Audit / Price Sensitivity</span>
                        <span>${p.auditSensitivity.toFixed(2)}</span>
                      </label>
                      <input type="range" id="slider-audit-${rId}" class="rr-slider" min="0" max="1" step="0.05" value="${p.auditSensitivity}" aria-valuetext="${Math.round(p.auditSensitivity * 100)} percent audit sensitivity" data-action="assumption-slider" data-roommate="${rId}" data-field="auditSensitivity"/>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
          `
              : ''
          }

          <!-- Step 2 & 3: Commit Prediction & Select Policy -->
          <div class="rr-grid-2col">
            <section class="rr-section" aria-label="Commit to a Prediction">
              <div class="rr-section-header">
                <h2>Step 2: Commit to a Prediction Before Running</h2>
                <span class="rr-badge ${isCommitted ? 'rr-badge-ok' : 'rr-badge-shock'}">
                  ${isCommitted ? `Graded: ${predictionGrade.totalCorrect}/3 Correct` : 'Awaiting Commit'}
                </span>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.86rem;">
                <div>
                  <label for="pred-highest-payer" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    1. Who will pay the highest 4-week total out-of-pocket household contribution?
                  </label>
                  <select id="pred-highest-payer" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="highestNetPayer">
                    ${ROOMMATE_ORDER.map(
                      (rId) =>
                        `<option value="${rId}" ${currentPred.highestNetPayer === rId ? 'selected' : ''}>${ROOMMATE_PROFILES[rId].name} (${ROOMMATE_PROFILES[rId].shortLabel})</option>`,
                    ).join('')}
                  </select>
                </div>

                <div>
                  <label for="pred-shock-outcome" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    2. Will everyone stay solvent (&gt;= $40 cash) through the Week 3 Surprise Expense?
                  </label>
                  <select id="pred-shock-outcome" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="week3ShockOutcome">
                    <option value="liquidity_crunch" ${currentPred.week3ShockOutcome === 'liquidity_crunch' ? 'selected' : ''}>Liquidity Crunch (&lt; $40 cash for at least one roommate)</option>
                    <option value="all_solvent_buffered" ${currentPred.week3ShockOutcome === 'all_solvent_buffered' ? 'selected' : ''}>All Roommates Stay Above $40 Stress Threshold</option>
                  </select>
                </div>

                <div>
                  <label for="pred-behavioral-shift" style="font-weight:700;display:block;margin-bottom:0.25rem;">
                    3. Who will show the largest incentive-driven behavioral shift (overconsumption, underreporting, or conservation/chore rebate)?
                  </label>
                  <select id="pred-behavioral-shift" class="rr-btn" style="width:100%;" data-action="update-prediction" data-pred-field="behavioralShift">
                    ${ROOMMATE_ORDER.map(
                      (rId) =>
                        `<option value="${rId}" ${currentPred.behavioralShift === rId ? 'selected' : ''}>${ROOMMATE_PROFILES[rId].name} (${ROOMMATE_PROFILES[rId].shortLabel})</option>`,
                    ).join('')}
                  </select>
                </div>

                <button type="button" class="rr-btn rr-btn-primary" style="padding:0.7rem 1rem;font-size:0.95rem;" data-action="commit-and-run">
                  Commit Prediction &amp; Run 4-Week Simulation
                </button>
              </div>
            </section>

            <section class="rr-section" aria-label="Choose Household Policy">
              <div class="rr-section-header">
                <h2>Step 3: Choose Active Household Policy (Policy A)</h2>
                <span class="rr-badge">${activePolicy.shortTitle}</span>
              </div>
              <div class="rr-policy-grid" role="radiogroup" aria-label="Household Billing Policies">
                ${POLICY_LIST.map((pol) => {
                  const checked = pol.id === state.activePolicyId;
                  return `
                    <button type="button" class="rr-policy-card" role="radio" aria-checked="${checked}" data-action="select-policy" data-policy-id="${pol.id}">
                      <strong style="font-size:0.9rem;">${pol.shortTitle}</strong>
                      <span style="font-size:0.78rem;color:var(--rr-text-muted);">${pol.tagline}</span>
                      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:auto;">
                        <span class="rr-badge">Marginal Price: ${Math.round(pol.marginalPriceSignal * 100)}%</span>
                        ${pol.collectsReserveBuffer ? '<span class="rr-badge rr-badge-ok">+10% Reserve</span>' : ''}
                        ${pol.chargesMeteringAdminFee ? '<span class="rr-badge rr-badge-shock">$16/wk Fee</span>' : ''}
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>
            </section>
          </div>

          <!-- Strict Money Conservation Banner -->
          <div class="rr-conservation-banner" role="status" aria-label="Strict Double-Entry Money Conservation Check">
            <div>
              <span>DOUBLE-ENTRY CONSERVATION AUDIT:</span>
              <span>Initial Cash ($${cons.initialCash.toFixed(2)}) + Total Income ($${cons.totalIncome.toFixed(2)}) - External Vendor Expenses ($${cons.totalExpenses.toFixed(2)}) = Ending Roommate Cash ($${cons.endingRoommateCash.toFixed(2)}) + Ending Household Reserve ($${cons.endingHouseholdReserve.toFixed(2)})</span>
            </div>
            <span class="rr-badge rr-badge-ok">
              Discrepancy: $${cons.discrepancyDollars.toFixed(2)} (${cons.isConserved ? '100% CONSERVED ✓' : 'ERROR'})
            </span>
          </div>

          <!-- 4-Week Animated Timeline & SVG Cash Bar Chart -->
          <section class="rr-section" aria-label="4-Week Simulation Timeline and Cash Trajectory">
            <div class="rr-section-header">
              <h2>Step 4: 4-Week Simulation Trajectory (${activePolicy.title})</h2>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button type="button" class="rr-btn ${selectedTimelineWeek === 'ALL' ? 'rr-btn-active' : ''}" data-action="filter-week" data-week="ALL">All 4 Weeks</button>
                ${([1, 2, 3, 4] as const)
                  .map(
                    (w) =>
                      `<button type="button" class="rr-btn ${selectedTimelineWeek === w ? 'rr-btn-active' : ''}" data-action="filter-week" data-week="${w}">Week ${w}${w === 3 ? ' ⚡' : ''}</button>`,
                  )
                  .join('')}
              </div>
            </div>

            <div class="rr-grid-2col" style="align-items:center;">
              <div>
                ${renderWeeklyCashChart(activeRun)}
                <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;font-size:0.78rem;margin-top:0.35rem;">
                  ${ROOMMATE_ORDER.map(
                    (rId) =>
                      `<span style="display:inline-flex;align-items:center;gap:0.3rem;"><span style="width:10px;height:10px;border-radius:2px;background:${ROOMMATE_PROFILES[rId].color};display:inline-block;"></span>${ROOMMATE_PROFILES[rId].name}</span>`,
                  ).join('')}
                  <span style="display:inline-flex;align-items:center;gap:0.3rem;"><span style="width:10px;height:10px;border-radius:2px;background:#f59e0b;border:1px solid #78350f;display:inline-block;"></span>Shared Reserve ($${cons.endingHouseholdReserve.toFixed(2)})</span>
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:0.55rem;">
                ${activeRun.weeklySnapshots
                  .map(
                    (snap) => `
                  <div style="border:1px solid var(--rr-border);border-radius:8px;padding:0.6rem 0.8rem;background:${snap.week === 3 ? '#fff1f2' : '#fdfcfa'};font-size:0.82rem;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;">
                      <span>${snap.ambientNote}</span>
                      <span>Utility Bill: $${snap.totalUtilityBill.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;color:var(--rr-text-muted);margin-top:0.2rem;flex-wrap:wrap;gap:0.4rem;">
                      <span>End Cash: Maya $${snap.roommateStates.maya.endingCash.toFixed(0)} · Devon $${snap.roommateStates.devon.endingCash.toFixed(0)} · Priya $${snap.roommateStates.priya.endingCash.toFixed(0)} · Leo $${snap.roommateStates.leo.endingCash.toFixed(0)}</span>
                      <span>Reserve: $${snap.endingHouseholdReserve.toFixed(2)} · Trust: ${snap.averageHouseholdTrust}%</span>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          </section>

          <!-- Step 5: Prediction Outcome & Trace-Backed Explanations -->
          <section class="rr-section" aria-label="Prediction Grading and Trace-Backed Ledger Explanations">
            <div class="rr-section-header">
              <h2>Step 5: Prediction Audit &amp; Trace-Backed Ledger Explanations</h2>
              <span class="rr-badge ${predictionGrade.totalCorrect >= 2 ? 'rr-badge-ok' : 'rr-badge-shock'}">
                ${predictionGrade.summaryHeadline}
              </span>
            </div>

            <div class="rr-explanation-list" style="margin-bottom:1rem;">
              ${predictionGrade.items
                .map(
                  (item) => `
                <div class="rr-explanation-card" style="border-left-color:${item.isCorrect ? '#059669' : '#e11d48'};">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                    <strong>${item.title}</strong>
                    <span class="rr-badge ${item.isCorrect ? 'rr-badge-ok' : 'rr-badge-shock'}">${item.isCorrect ? 'Predicted ✓' : 'Surprise!'}</span>
                  </div>
                  <div style="font-size:0.8rem;margin-bottom:0.3rem;">
                    <strong>Your Prediction:</strong> ${item.predictedLabel}<br/>
                    <strong>Ledger Outcome:</strong> ${item.actualLabel}
                  </div>
                  <p style="margin:0 0 0.35rem;">${item.explanation}</p>
                  <div><strong>Ledger Evidence:</strong> ${renderTransactionChips(item.evidenceTransactionIds)}</div>
                  <div class="rr-limitation-box">${item.assumptionNote}</div>
                </div>
              `,
                )
                .join('')}
            </div>

            <h3 style="font-size:0.98rem;margin:0 0 0.5rem;">Causal Ledger Trace &amp; Explicit Model Assumptions</h3>
            <div class="rr-explanation-list">
              ${activeRun.explanations
                .map(
                  (exp) => `
                <article class="rr-explanation-card">
                  <strong style="display:block;margin-bottom:0.25rem;">${exp.headline}</strong>
                  <p style="margin:0 0 0.4rem;">${exp.statement}</p>
                  <div style="margin-bottom:0.35rem;">
                    <strong>Cited Transactions:</strong> ${renderTransactionChips(exp.transactionIds)}
                  </div>
                  <div style="font-size:0.76rem;color:var(--rr-text-muted);">
                    <strong>Active Model Parameters:</strong> ${exp.assumptionRefs.join(' · ')}
                  </div>
                  <div class="rr-limitation-box">${exp.modelLimitationNote}</div>
                </article>
              `,
                )
                .join('')}
            </div>
          </section>

          <!-- Auditable Double-Entry Transaction & Chore Ledger Table -->
          <section class="rr-section" aria-label="Double-Entry Transaction and Chore Ledger">
            <div class="rr-section-header">
              <h2>Auditable Double-Entry Transaction &amp; Chore Ledger</h2>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">
                <button type="button" class="rr-btn ${ledgerTab === 'TRANSACTIONS' ? 'rr-btn-active' : ''}" data-action="set-ledger-tab" data-tab="TRANSACTIONS">
                  Financial Ledger (${filteredTransactions.length})
                </button>
                <button type="button" class="rr-btn ${ledgerTab === 'CHORES' ? 'rr-btn-active' : ''}" data-action="set-ledger-tab" data-tab="CHORES">
                  Chore &amp; Morale Ledger (${filteredChores.length})
                </button>
                <select class="rr-btn" aria-label="Filter ledger by roommate" data-action="filter-roommate">
                  <option value="ALL" ${ledgerRoommateFilter === 'ALL' ? 'selected' : ''}>All Roommates</option>
                  ${ROOMMATE_ORDER.map(
                    (rId) =>
                      `<option value="${rId}" ${ledgerRoommateFilter === rId ? 'selected' : ''}>${ROOMMATE_PROFILES[rId].name}</option>`,
                  ).join('')}
                </select>
                <select class="rr-btn" aria-label="Filter ledger by flow type" data-action="filter-flow">
                  <option value="ALL" ${ledgerFlowFilter === 'ALL' ? 'selected' : ''}>All Flow Categories</option>
                  <option value="EXTERNAL_INFLOW" ${ledgerFlowFilter === 'EXTERNAL_INFLOW' ? 'selected' : ''}>External Inflows (Income)</option>
                  <option value="INTERNAL_TRANSFER" ${ledgerFlowFilter === 'INTERNAL_TRANSFER' ? 'selected' : ''}>Internal Household Transfers</option>
                  <option value="EXTERNAL_OUTFLOW" ${ledgerFlowFilter === 'EXTERNAL_OUTFLOW' ? 'selected' : ''}>External Vendor Outflows</option>
                </select>
              </div>
            </div>

            ${
              ledgerTab === 'TRANSACTIONS'
                ? `
              <div tabindex="0" role="region" aria-labelledby="rr-ledger-caption" class="rr-table-wrapper">
                <table>
                  <caption id="rr-ledger-caption">
                    Double-Entry Household Financial Ledger (${activePolicy.shortTitle} · ${filteredTransactions.length} entries shown)
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Tx ID</th>
                      <th scope="col">Week</th>
                      <th scope="col">Type</th>
                      <th scope="col">From &rarr; To Account</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Explanation &amp; Model Parameter Drivers</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredTransactions
                      .map((tx) => {
                        const isHi = tx.id === highlightedTxId;
                        return `
                          <tr id="row-${tx.id}" class="${isHi ? 'rr-tx-highlighted' : ''}">
                            <th scope="row">${tx.id}</th>
                            <td>W${tx.week}</td>
                            <td><span class="rr-badge">${tx.type}</span></td>
                            <td style="font-family:ui-monospace,monospace;font-size:0.77rem;">${tx.fromAccount} &rarr; ${tx.toAccount}</td>
                            <td style="font-weight:700;">$${tx.amount.toFixed(2)}</td>
                            <td>
                              <div>${tx.description}</div>
                              <div style="font-size:0.74rem;color:var(--rr-text-muted);margin-top:0.15rem;">
                                Drivers: ${tx.assumptionDrivers.join(' | ')}
                              </div>
                            </td>
                          </tr>
                        `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
                : `
              <div tabindex="0" role="region" aria-labelledby="rr-chore-caption" class="rr-table-wrapper">
                <table>
                  <caption id="rr-chore-caption">
                    Weekly Kitchen &amp; Cleaning Chore Ledger (${activePolicy.shortTitle})
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Chore ID</th>
                      <th scope="col">Week</th>
                      <th scope="col">Roommate</th>
                      <th scope="col">Completed / Target</th>
                      <th scope="col">Rebate / Surcharge</th>
                      <th scope="col">Explanation &amp; Trust Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredChores
                      .map(
                        (ch) => `
                        <tr>
                          <th scope="row">${ch.id}</th>
                          <td>W${ch.week}</td>
                          <td><strong>${ROOMMATE_PROFILES[ch.roommateId].name}</strong></td>
                          <td>${ch.completedChores} / ${ch.targetChores} (${ch.choreDelta >= 0 ? '+' : ''}${ch.choreDelta})</td>
                          <td style="font-weight:700;">${ch.rebateOrPenaltyDollars >= 0 ? '+' : ''}$${ch.rebateOrPenaltyDollars.toFixed(2)}</td>
                          <td>${ch.note} (Trust delta: ${ch.trustDelta >= 0 ? '+' : ''}${ch.trustDelta})</td>
                        </tr>
                      `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
            }
          </section>

          <!-- Step 6: Side-by-Side Same-Events Counterfactual Policy Comparison View -->
          <section class="rr-section" aria-label="Same-Events Policy Comparison View">
            <div class="rr-section-header">
              <h2>Step 6: Same-Events Counterfactual Policy Comparison View</h2>
              <span class="rr-badge rr-badge-ok">
                Same Frozen Event Schedule Verified: ${comparisonResult.sameScheduleVerified ? 'YES ✓' : 'NO'} (${comparisonResult.scheduleSignature})
              </span>
            </div>
            <p style="margin:0 0 0.75rem;font-size:0.86rem;color:var(--rr-text-muted);">
              <strong>Hypothesis Prompt:</strong> ${scenario.hypothesisPrompt}
            </p>

            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;margin-bottom:0.9rem;">
              <span style="font-weight:700;font-size:0.88rem;">Compare Policy A (${activePolicy.shortTitle}) against Counterfactual Policy B:</span>
              ${POLICY_LIST.map(
                (pol) => `
                  <button type="button" class="rr-btn ${pol.id === state.comparisonPolicyId ? 'rr-btn-active' : ''}" data-action="select-comparison-policy" data-policy-id="${pol.id}">
                    ${pol.shortTitle}
                  </button>
                `,
              ).join('')}
            </div>

            <div tabindex="0" role="region" aria-labelledby="rr-comp-caption" class="rr-table-wrapper" style="margin-bottom:0.9rem;">
              <table>
                <caption id="rr-comp-caption">
                  Side-by-Side Counterfactual Outcome Table on Identical Schedule (${activePolicy.shortTitle} vs. ${compPolicy.shortTitle})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Roommate</th>
                    <th scope="col">End Cash (Policy A)</th>
                    <th scope="col">End Cash (Policy B)</th>
                    <th scope="col">Net Cash Delta (B - A)</th>
                    <th scope="col">True Usage (A &rarr; B)</th>
                    <th scope="col">Underreported (A &rarr; B)</th>
                  </tr>
                </thead>
                <tbody>
                  ${ROOMMATE_ORDER.map((rId) => {
                    const d = comparisonResult.roommateDeltas[rId];
                    const pos = d.cashDeltaBMinusA >= 0;
                    return `
                      <tr>
                        <th scope="row">${d.name}</th>
                        <td>$${d.endingCashA.toFixed(2)}</td>
                        <td>$${d.endingCashB.toFixed(2)}</td>
                        <td style="font-weight:700;color:${pos ? 'var(--rr-success)' : 'var(--rr-danger)'};">
                          ${pos ? '+' : ''}$${d.cashDeltaBMinusA.toFixed(2)}
                        </td>
                        <td>$${d.trueConsumptionA.toFixed(2)} &rarr; $${d.trueConsumptionB.toFixed(2)} (${d.consumptionDeltaBMinusA >= 0 ? '+' : ''}$${d.consumptionDeltaBMinusA.toFixed(2)})</td>
                        <td>$${d.underreportedA.toFixed(2)} &rarr; $${d.underreportedB.toFixed(2)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="rr-explanation-list">
              ${comparisonResult.comparisonInsights
                .map(
                  (ins) => `
                <div class="rr-explanation-card">
                  <strong style="display:block;margin-bottom:0.25rem;">${ins.title}</strong>
                  <p style="margin:0 0 0.35rem;">${ins.body}</p>
                  <div style="font-size:0.78rem;margin-bottom:0.25rem;">
                    <strong>Policy A Ledger Refs:</strong> ${renderTransactionChips(ins.runATransactionIds)}
                  </div>
                  <div class="rr-limitation-box">${ins.assumptionAttribution}</div>
                </div>
              `,
                )
                .join('')}
            </div>
          </section>

          <!-- Step 7: 3 Short Interactive Debrief Prompts -->
          <section class="rr-section" aria-label="Experimental Debrief Prompts">
            <div class="rr-section-header">
              <h2>Step 7: Experimental Debrief — Ledger Evidence &amp; Model Limitations</h2>
              <span class="rr-badge">
                ${Object.keys(state.debriefAnswers).length} / ${DEBRIEF_PROMPTS.length} Answered
              </span>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.9rem;">
              ${DEBRIEF_PROMPTS.map((prompt) => {
                const selectedOptId = state.debriefAnswers[prompt.id];
                const selectedOpt = prompt.options.find(
                  (o) => o.id === selectedOptId,
                );
                return `
                  <div class="rr-explanation-card" style="border-left-color:#6d28d9;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                      <strong>Prompt #${prompt.number} (${prompt.category}): ${prompt.question}</strong>
                    </div>
                    <p style="margin:0.25rem 0 0.5rem;font-size:0.79rem;color:var(--rr-text-muted);">${prompt.contextHint}</p>
                    <div style="display:flex;flex-direction:column;gap:0.4rem;">
                      ${prompt.options
                        .map((opt) => {
                          const isChosen = selectedOptId === opt.id;
                          return `
                            <label style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.45rem 0.6rem;border-radius:6px;border:1px solid ${isChosen ? '#b45309' : 'var(--rr-border)'};background:${isChosen ? '#fffbeb' : '#ffffff'};cursor:pointer;font-size:0.82rem;">
                              <input type="radio" name="debrief-${prompt.id}" value="${opt.id}" ${isChosen ? 'checked' : ''} data-action="answer-debrief" data-prompt-id="${prompt.id}" data-option-id="${opt.id}"/>
                              <span>${opt.label}</span>
                            </label>
                          `;
                        })
                        .join('')}
                    </div>
                    ${
                      selectedOpt
                        ? `
                      <div style="margin-top:0.5rem;padding:0.5rem 0.7rem;border-radius:6px;background:${selectedOpt.isCorrect ? 'var(--rr-success-bg)' : 'var(--rr-danger-bg)'};color:${selectedOpt.isCorrect ? 'var(--rr-success)' : 'var(--rr-danger)'};font-size:0.81rem;font-weight:600;">
                        ${selectedOpt.explanation}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
              }).join('')}
            </div>
          </section>

          ${
            debugEnabled
              ? `
            <section class="rr-debug-drawer" aria-label="Debug Telemetry Inspector">
              <h3 style="margin-top:0;color:#fbbf24;">DEBUG INSPECTOR [D] — Frozen Schedule &amp; Conservation Telemetry</h3>
              <pre style="margin:0;white-space:pre-wrap;">${JSON.stringify(
                {
                  seed: state.seed,
                  scenarioId: state.activeScenarioId,
                  activePolicyId: state.activePolicyId,
                  comparisonPolicyId: state.comparisonPolicyId,
                  scheduleSignature: activeRun.scheduleSignature,
                  conservation: activeRun.conservation,
                  week3SurpriseExpense: week3Shock,
                },
                null,
                2,
              )}</pre>
            </section>
          `
              : ''
          }
        </div>
      </div>
    `;

    syncRangeSliders(container);
  }

  function handleContainerClick(e: Event): void {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-action]',
    );
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'select-scenario') {
      const sId = target.dataset.scenarioId as ScenarioId;
      if (sId && sId in SCENARIOS) {
        audio.playPenClick();
        state.activeScenarioId = sId;
        state.activePolicyId = SCENARIOS[sId].defaultPolicyId;
        state.comparisonPolicyId = SCENARIOS[sId].recommendedComparisonPolicyId;
        selectedTimelineWeek = 'ALL';
        highlightedTxId = null;
        recomputeAll();
        render();
      }
    } else if (action === 'select-policy') {
      const pId = target.dataset.policyId as PolicyId;
      if (pId && pId in POLICIES) {
        audio.playPenClick();
        state.activePolicyId = pId;
        recomputeAll();
        render();
      }
    } else if (action === 'select-comparison-policy') {
      const pId = target.dataset.policyId as PolicyId;
      if (pId && pId in POLICIES) {
        audio.playPenClick();
        state.comparisonPolicyId = pId;
        if (!state.completedComparisons.includes(state.activeScenarioId)) {
          state.completedComparisons.push(state.activeScenarioId);
        }
        recomputeAll();
        render();
      }
    } else if (action === 'commit-and-run') {
      state.committedPredictionsByScenario[state.activeScenarioId] = true;
      if (!state.completedScenarios.includes(state.activeScenarioId)) {
        state.completedScenarios.push(state.activeScenarioId);
      }
      recomputeAll();
      audio.playCashChime(1);
      audio.playShockBell();
      audio.playRevealFanfare(predictionGrade.totalCorrect);
      render();
    } else if (action === 'filter-week') {
      const wRaw = target.dataset.week;
      audio.playPenClick();
      selectedTimelineWeek =
        wRaw === 'ALL' ? 'ALL' : (Number(wRaw) as WeekNumber);
      render();
    } else if (action === 'set-ledger-tab') {
      const tab = target.dataset.tab as 'TRANSACTIONS' | 'CHORES';
      audio.playPenClick();
      ledgerTab = tab;
      render();
    } else if (action === 'focus-tx') {
      const txId = target.dataset.txId;
      if (txId) {
        audio.playPenClick();
        ledgerTab = 'TRANSACTIONS';
        selectedTimelineWeek = 'ALL';
        ledgerRoommateFilter = 'ALL';
        ledgerFlowFilter = 'ALL';
        highlightedTxId = txId;
        render();
        const rowEl = container.querySelector(`#row-${txId}`);
        if (rowEl && typeof rowEl.scrollIntoView === 'function') {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else if (action === 'toggle-assumptions') {
      audio.playPenClick();
      showAssumptionsEditor = !showAssumptionsEditor;
      render();
    } else if (action === 'reset-assumptions') {
      audio.playPenClick();
      state.assumptionsByScenario[state.activeScenarioId] =
        createDefaultAssumptions();
      recomputeAll();
      render();
    } else if (action === 'new-seed') {
      const nextSeed = (state.seed + 1013) >>> 0;
      audio.playCashChime(2);
      restartWithSeed(nextSeed);
    } else if (action === 'toggle-mute') {
      audio.setMuted(!audio.isMuted());
      render();
    } else if (action === 'export-json') {
      audio.playPenClick();
      const json = exportStateToJson(state);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(json).catch(() => {});
      }
    } else if (action === 'toggle-debug') {
      toggleDebug();
    }
  }

  function handleContainerChange(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement | null;
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'update-prediction') {
      const field = target.dataset.predField as
        | 'highestNetPayer'
        | 'week3ShockOutcome'
        | 'behavioralShift';
      if (field) {
        audio.playPenClick();
        (state.predictionsByScenario[state.activeScenarioId] as any)[field] =
          target.value;
        recomputeAll();
        render();
      }
    } else if (action === 'filter-roommate') {
      ledgerRoommateFilter = target.value as RoommateId | 'ALL';
      render();
    } else if (action === 'filter-flow') {
      ledgerFlowFilter = target.value as any;
      render();
    } else if (action === 'answer-debrief') {
      const promptId = target.dataset.promptId;
      const optionId = target.dataset.optionId;
      if (promptId && optionId) {
        audio.playPenClick();
        state.debriefAnswers[promptId] = optionId;
        savePersistedState(state);
        render();
      }
    } else if (action === 'assumption-slider') {
      const rId = target.dataset.roommate as RoommateId;
      const field = target.dataset.field as
        | 'weeklyIncome'
        | 'usageAppetite'
        | 'freeRideTemptation'
        | 'auditSensitivity';
      const val = Number(target.value);
      if (rId && field && Number.isFinite(val)) {
        state.assumptionsByScenario[state.activeScenarioId].roommates[rId][
          field
        ] = val;
        recomputeAll();
        render();
      }
    }
  }

  function handleContainerInput(e: Event): void {
    const target = e.target as HTMLInputElement | null;
    if (target && target.matches('input[type="range"].rr-slider')) {
      target.style.setProperty('--attr-min', target.min || '0');
      target.style.setProperty('--attr-max', target.max || '100');
      target.style.setProperty('--control-value', target.value);
    }
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (
      e.key === 'd' ||
      e.key === 'D'
    ) {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag !== 'input' && activeTag !== 'select' && activeTag !== 'textarea') {
        toggleDebug();
      }
    }
  }

  function restartWithSeed(seed: number): void {
    const normalized = Math.floor(seed) >>> 0;
    state.seed = normalized;
    for (const sId of Object.keys(SCENARIOS) as ScenarioId[]) {
      state.frozenSchedulesByScenario[sId] = generateExternalEventSchedule(
        sId,
        normalized,
      );
    }
    recomputeAll();
    render();
  }

  function toggleDebug(force?: boolean): void {
    debugEnabled = force !== undefined ? force : !debugEnabled;
    render();
  }

  container.addEventListener('click', handleContainerClick);
  container.addEventListener('change', handleContainerChange);
  container.addEventListener('input', handleContainerInput);
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  render();

  return {
    destroy(): void {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('change', handleContainerChange);
      container.removeEventListener('input', handleContainerInput);
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
      }
      audio.destroy();
      container.innerHTML = '';
    },
    getStateSnapshot() {
      return {
        persisted: state,
        activeRun,
        predictionGrade,
        comparisonResult,
        debugEnabled,
      };
    },
    restartWithSeed,
    toggleDebug,
  };
}

export { importStateFromJson };
