import {
  CONFIG,
  GridCoord,
  LinkType,
  coordKey,
  formatEdgeLabel,
  getUpgradeCostMat,
  makeEdgeId,
  parseEdgeId,
} from './config.ts';
import {
  HANDCRAFTED_SCENARIOS,
  ScenarioSpec,
  getScenarioById,
  isBlockedCoord,
} from './content.ts';
import {
  GameState,
  SCENARIO_1_EFFICIENT_TRUNK_SCRIPT,
  SCENARIO_1_NEGLECT_LOSS_SCRIPT,
  SCENARIO_1_REDUNDANT_LOOP_SCRIPT,
  StrategyScript,
  commitTurn,
  createInitialGameState,
  getForecastStrikes,
  resetStagedActions,
  stagePlaceLink,
  stageRepairLink,
  stageRerouteLink,
  stageUpgradeLink,
  undoLastStagedAction,
} from './simulation.ts';
import {
  clearSavedGameState,
  deserializeGameState,
  loadGameStateFromStorage,
  saveGameStateToStorage,
  serializeGameState,
} from './persistence.ts';
import { DispatchAudioEngine } from './audio.ts';

export type DispatchTool =
  | 'auto-smart'
  | 'place-standard'
  | 'place-heavy'
  | 'place-shielded'
  | 'upgrade-heavy'
  | 'upgrade-shielded'
  | 'repair'
  | 'reroute';

export interface BlackoutDispatchUIController {
  destroy(): void;
  getState(): GameState;
  restartWithSeed(seed: number): void;
  toggleDebug(force?: boolean): void;
}

const STYLES = `
.bd-root {
  container-type: inline-size;
  container-name: dispatch-shell;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #09111e;
  color: #e2e8f0;
  min-block-size: 100dvh;
  padding: clamp(0.5rem, 1.5vw, 1.25rem);
  box-sizing: border-box;
}

.bd-root *, .bd-root *::before, .bd-root *::after {
  box-sizing: border-box;
}

.bd-visually-hidden:where(:not(:focus-within, :active)) {
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

.bd-root :where(button, select, input, [role="button"]):focus-visible {
  outline: 3px solid #38bdf8;
  outline-offset: 2px;
}

.bd-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-block-end: 0.75rem;
}

.bd-title-block h1 {
  margin: 0;
  font-size: clamp(1.1rem, 0.9rem + 1vw, 1.55rem);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bd-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.bd-top-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bd-btn, .bd-select, .bd-input {
  min-block-size: 32px;
  min-inline-size: 32px;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.bd-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #64748b;
}

.bd-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bd-btn-primary {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

.bd-btn-primary:hover:not(:disabled) {
  background: #0369a1;
}

.bd-btn-commit {
  background: #059669;
  border-color: #34d399;
  color: #ffffff;
  font-size: 0.92rem;
  padding: 0.45rem 1rem;
}

.bd-btn-commit:hover:not(:disabled) {
  background: #047857;
}

.bd-btn-warn {
  background: #b45309;
  border-color: #fbbf24;
  color: #ffffff;
}

.bd-hud-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 0.5rem;
  margin-block-end: 0.75rem;
}

.bd-metric-card {
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.bd-metric-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  display: block;
}

.bd-metric-value {
  font-size: clamp(1rem, 0.85rem + 0.6vw, 1.3rem);
  font-weight: 800;
  color: #f8fafc;
}

.bd-banner {
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  margin-block-end: 0.75rem;
  font-size: 0.86rem;
  line-height: 1.4;
  border-left: 4px solid #38bdf8;
  background: #0c192c;
}

.bd-banner-ok {
  border-left-color: #10b981;
  background: #06221c;
  color: #d1fae5;
}

.bd-banner-warn {
  border-left-color: #f59e0b;
  background: #271a07;
  color: #fef3c7;
}

.bd-banner-danger {
  border-left-color: #ef4444;
  background: #2a0d12;
  color: #fee2e2;
}

.bd-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}

@container dispatch-shell (min-width: 900px) {
  .bd-layout {
    grid-template-columns: minmax(480px, 1.25fr) minmax(350px, 0.95fr);
    align-items: start;
  }
}

.bd-panel {
  background: #0f1b2d;
  border: 1px solid #1e3a5f;
  border-radius: 10px;
  padding: 0.8rem;
}

.bd-panel h2 {
  margin: 0 0 0.55rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bd-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-end: 0.65rem;
}

.bd-tool-btn {
  flex: 1 1 auto;
  min-block-size: 34px;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #162235;
  color: #cbd5e1;
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.bd-tool-btn[aria-pressed="true"] {
  background: #0369a1;
  border-color: #38bdf8;
  color: #ffffff;
}

.bd-board-wrapper {
  width: 100%;
  overflow-x: auto;
}

.bd-svg-board {
  width: 100%;
  max-width: 680px;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  margin: 0 auto;
  background: #070e1a;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  user-select: none;
}

.bd-corridor-hit {
  cursor: pointer;
}

.bd-corridor-hit:hover .bd-corridor-hover-ring {
  opacity: 0.95;
}

.bd-inspector {
  margin-block-start: 0.65rem;
  padding: 0.65rem;
  background: #091322;
  border: 1px solid #264063;
  border-radius: 8px;
}

.bd-inspector-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-block-start: 0.45rem;
}

.bd-action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-block-start: 0.65rem;
  padding-block-start: 0.65rem;
  border-top: 1px solid #1e3a5f;
}

.bd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

.bd-table caption {
  text-align: left;
  font-weight: 700;
  color: #cbd5e1;
  margin-block-end: 0.35rem;
  font-size: 0.85rem;
}

.bd-table th, .bd-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid #1e293b;
  text-align: left;
}

.bd-table th {
  color: #94a3b8;
  font-weight: 600;
  background: #091322;
}

.bd-badge {
  display: inline-block;
  padding: 0.12rem 0.42rem;
  border-radius: 4px;
  font-size: 0.71rem;
  font-weight: 700;
}

.bd-badge-lit {
  background: #064e3b;
  color: #6ee7b7;
  border: 1px solid #10b981;
}

.bd-badge-short {
  background: #78350f;
  color: #fde68a;
  border: 1px solid #f59e0b;
}

.bd-badge-out {
  background: #7f1d1d;
  color: #fecaca;
  border: 1px solid #ef4444;
}

.bd-forecast-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bd-forecast-item {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  background: #091322;
  border: 1px solid #1e3a5f;
  font-size: 0.79rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.bd-dialog {
  background: #0f1b2d;
  color: #f1f5f9;
  border: 1px solid #38bdf8;
  border-radius: 10px;
  padding: 1rem;
  max-width: 520px;
  width: 92vw;
}

.bd-dialog::backdrop {
  background: rgba(2, 6, 23, 0.78);
}

.bd-textarea {
  width: 100%;
  min-height: 110px;
  background: #070e1a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.78rem;
  margin-block: 0.5rem;
}
`;

export function createBlackoutDispatchUI(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean },
): BlackoutDispatchUIController {
  const audio = new DispatchAudioEngine();
  let debugEnabled = Boolean(options?.debug);
  let activeTool: DispatchTool = 'auto-smart';
  let selectedEdgeId: string = makeEdgeId({ row: 3, col: 2 }, { row: 3, col: 3 });
  let feedbackBanner: { text: string; kind: 'info' | 'warn' | 'error' } | null = null;

  // Initialize state from storage or initialSeed
  let state: GameState;
  const saved = loadGameStateFromStorage();
  if (options?.initialSeed !== undefined) {
    state = createInitialGameState(getScenarioById('seeded', options.initialSeed));
  } else if (saved) {
    state = saved;
  } else {
    state = createInitialGameState(HANDCRAFTED_SCENARIOS[0]);
  }

  // Inject styles once
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  container.innerHTML = '';
  container.appendChild(styleEl);

  const root = document.createElement('div');
  root.className = 'bd-root';
  container.appendChild(root);

  const persistCurrentState = () => {
    saveGameStateToStorage(state);
  };

  const handleCorridorAction = (edgeId: string, toolOverride?: DispatchTool) => {
    selectedEdgeId = edgeId;
    const tool = toolOverride ?? activeTool;
    const existing = state.board.links[edgeId];

    let res: { ok: boolean; error?: string } = { ok: false };

    if (tool === 'auto-smart') {
      if (!existing) {
        res = stagePlaceLink(state, edgeId, 'standard');
      } else if (existing.status === 'damaged') {
        res = stageRepairLink(state, edgeId);
      } else if (existing.type === 'standard') {
        res = stageUpgradeLink(state, edgeId, 'heavy');
      } else if (existing.type === 'heavy') {
        res = stageUpgradeLink(state, edgeId, 'shielded');
      } else {
        feedbackBanner = {
          text: `Selected ${formatEdgeLabel(edgeId)} (${CONFIG.LINKS[existing.type].name}). Use inspector buttons below to reroute or modify.`,
          kind: 'info',
        };
        render();
        return;
      }
    } else if (tool === 'place-standard') {
      res = existing
        ? stageUpgradeLink(state, edgeId, 'standard')
        : stagePlaceLink(state, edgeId, 'standard');
    } else if (tool === 'place-heavy' || tool === 'upgrade-heavy') {
      res = existing
        ? stageUpgradeLink(state, edgeId, 'heavy')
        : stagePlaceLink(state, edgeId, 'heavy');
    } else if (tool === 'place-shielded' || tool === 'upgrade-shielded') {
      res = existing
        ? stageUpgradeLink(state, edgeId, 'shielded')
        : stagePlaceLink(state, edgeId, 'shielded');
    } else if (tool === 'repair') {
      res = stageRepairLink(state, edgeId);
    } else if (tool === 'reroute') {
      res = stageRerouteLink(state, edgeId, {});
    }

    if (res.ok) {
      audio.playRelayClick();
      const latestAction = state.stagedActions[state.stagedActions.length - 1];
      feedbackBanner = {
        text: `STAGED: ${latestAction?.description ?? edgeId} — Live flow preview updated!`,
        kind: 'info',
      };
      persistCurrentState();
    } else if (res.error) {
      audio.playBlackoutAlarm();
      feedbackBanner = { text: res.error, kind: 'warn' };
    }
    render();
  };

  const handleCommitTurn = () => {
    if (state.status !== 'playing') return;
    const outcome = commitTurn(state);
    const nextStatus = state.status as GameState['status'];
    if (outcome.imminentStrikes.some((s) => s.outcome === 'damaged')) {
      audio.playStormStrike();
    } else {
      audio.playTurnCommitHum(outcome.flow.totalUnmetMW > 0);
    }
    if (nextStatus === 'lost') {
      audio.playBlackoutAlarm();
      feedbackBanner = {
        text: state.lossReason ?? 'Grid blackout threshold exceeded.',
        kind: 'error',
      };
    } else if (nextStatus === 'won') {
      feedbackBanner = {
        text: `VICTORY! All 12 storm turns survived with ${state.cityCumulativeUnmetMW}/${state.scenario.cityOutageThresholdMW} MW total city shortfall!`,
        kind: 'info',
      };
    } else {
      const damagedCount = outcome.imminentStrikes.filter((s) => s.outcome === 'damaged').length;
      const deflectedCount = outcome.imminentStrikes.filter(
        (s) => s.outcome === 'deflected',
      ).length;
      feedbackBanner = {
        text: `Turn ${outcome.turn} Committed: Delivered ${outcome.flow.totalDeliveredMW}/${outcome.flow.totalDemandMW} MW (+${outcome.projectedMaterialIncome} Mat). Storm strikes damaged ${damagedCount} link(s), deflected ${deflectedCount}.`,
        kind: outcome.flow.totalUnmetMW > 0 ? 'warn' : 'info',
      };
    }
    persistCurrentState();
    render();
  };

  const handleUndo = () => {
    const res = undoLastStagedAction(state);
    if (res.ok) {
      audio.playUndoClick();
      feedbackBanner = { text: 'Undid last staged action. Pre-action flow restored.', kind: 'info' };
      persistCurrentState();
    } else if (res.error) {
      feedbackBanner = { text: res.error, kind: 'warn' };
    }
    render();
  };

  const handleResetTurn = () => {
    const res = resetStagedActions(state);
    if (res.ok) {
      audio.playUndoClick();
      feedbackBanner = { text: 'Reset all staged actions for this turn.', kind: 'info' };
      persistCurrentState();
    }
    render();
  };

  const runAutomatedScript = (script: StrategyScript, label: string) => {
    state = createInitialGameState(HANDCRAFTED_SCENARIOS[0]);
    while (state.status === 'playing') {
      const actions = script[state.turn] ?? [];
      for (const act of actions) {
        const edgeId = makeEdgeId(act.from, act.to);
        if (act.kind === 'place') stagePlaceLink(state, edgeId, act.linkType);
        else if (act.kind === 'upgrade') stageUpgradeLink(state, edgeId, act.linkType);
        else stageRepairLink(state, edgeId);
      }
      commitTurn(state);
    }
    feedbackBanner = {
      text: `Executed "${label}": Status=${state.status.toUpperCase()} on Turn ${state.turn}, City Unmet=${state.cityCumulativeUnmetMW} MW.`,
      kind: state.status === 'won' ? 'info' : 'error',
    };
    persistCurrentState();
    render();
  };

  const renderBoardSvg = (): string => {
    const size = 640;
    const pad = 46;
    const step = (size - pad * 2) / (CONFIG.GRID_SIZE - 1);
    const cellX = (col: number) => pad + col * step;
    const cellY = (row: number) => pad + row * step;

    const forecast = getForecastStrikes(state.scenario, state.turn);
    const imminentSet = new Set(forecast.imminent.map((s) => s.edgeId));
    const t1Set = new Set(forecast.turnPlus1.map((s) => s.edgeId));
    const t2Set = new Set(forecast.turnPlus2.map((s) => s.edgeId));

    const bottleneckSet = new Set<string>();
    for (const diag of Object.values(state.preview.flow.diagnostics)) {
      for (const eId of diag.bottleneckEdgeIds) {
        bottleneckSet.add(eId);
      }
    }

    // Generate all orthogonal corridors on the 8x8 grid
    const corridorSvgParts: string[] = [];
    for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
      for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
        const neighbors: GridCoord[] = [];
        if (c + 1 < CONFIG.GRID_SIZE) neighbors.push({ row: r, col: c + 1 });
        if (r + 1 < CONFIG.GRID_SIZE) neighbors.push({ row: r + 1, col: c });

        for (const nb of neighbors) {
          const cA = { row: r, col: c };
          const cB = nb;
          if (isBlockedCoord(state.scenario, cA) || isBlockedCoord(state.scenario, cB)) {
            continue;
          }
          const edgeId = makeEdgeId(cA, cB);
          const x1 = cellX(cA.col);
          const y1 = cellY(cA.row);
          const x2 = cellX(cB.col);
          const y2 = cellY(cB.row);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;

          const link = state.board.links[edgeId];
          const ef = state.preview.flow.edgeFlows[edgeId];
          const isSelected = selectedEdgeId === edgeId;
          const isImminent = imminentSet.has(edgeId);
          const isT1 = t1Set.has(edgeId);
          const isT2 = t2Set.has(edgeId);
          const isBottleneck = bottleneckSet.has(edgeId);

          let strokeColor = '#1e293b';
          let strokeWidth = 3;
          let dashArray = '4,4';

          if (link) {
            dashArray = link.status === 'damaged' ? '6,4' : '';
            strokeWidth = link.type === 'heavy' ? 8 : link.type === 'shielded' ? 6 : 5;
            if (link.status === 'damaged') {
              strokeColor = '#ef4444';
            } else if (ef && ef.isSaturated) {
              strokeColor = '#f59e0b';
            } else if (ef && ef.flowMW > 0) {
              strokeColor = link.type === 'shielded' ? '#38bdf8' : '#10b981';
            } else {
              strokeColor = link.type === 'shielded' ? '#0284c7' : '#64748b';
            }
          }

          // Direction chevron
          let chevronText = '';
          if (ef && ef.flowMW > 0 && link?.status === 'intact') {
            const [fromR, fromC] = ef.fromNode.split(',').map(Number);
            const [toR, toC] = ef.toNode.split(',').map(Number);
            if (toC > fromC) chevronText = '▶';
            else if (toC < fromC) chevronText = '◀';
            else if (toR > fromR) chevronText = '▼';
            else if (toR < fromR) chevronText = '▲';
          }

          let badgeLabel = '';
          if (link) {
            const cap = CONFIG.LINKS[link.type].capacityMW;
            const flow = ef ? ef.flowMW : 0;
            const tierCode =
              link.type === 'heavy' ? 'H' : link.type === 'shielded' ? 'S🛡' : 'L';
            if (link.status === 'damaged') {
              badgeLabel = `✖DMG (${tierCode})`;
            } else {
              badgeLabel = `${ chevronText }${flow}/${cap}MW ${tierCode}`;
            }
          } else if (isImminent || isT1 || isT2) {
            badgeLabel = isImminent ? '⚡NOW' : isT1 ? '⛈T+1' : '🌧T+2';
          }

          const stormTag = isImminent
            ? '⚡NOW'
            : isT1
              ? '⛈T+1'
              : isT2
                ? '🌧T+2'
                : '';

          corridorSvgParts.push(`
            <g class="bd-corridor-hit" data-edge-id="${edgeId}">
              <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke="${isSelected ? '#38bdf8' : isBottleneck ? '#f59e0b' : 'transparent'}"
                stroke-width="${strokeWidth + 8}"
                stroke-linecap="round"
                opacity="${isSelected ? '0.55' : isBottleneck ? '0.45' : '0'}"
                class="bd-corridor-hover-ring" />
              <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                ${dashArray ? `stroke-dasharray="${dashArray}"` : ''}
                stroke-linecap="round" />
              <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                stroke="transparent"
                stroke-width="24" />
              ${
                badgeLabel
                  ? `<rect x="${mx - 28}" y="${my - 9}" width="56" height="17" rx="4"
                       fill="${
                         link?.status === 'damaged'
                           ? '#450a0a'
                           : ef?.isSaturated
                             ? '#451a03'
                             : '#091322'
                       }"
                       stroke="${
                         isSelected
                           ? '#38bdf8'
                           : link?.status === 'damaged'
                             ? '#ef4444'
                             : ef?.isSaturated
                               ? '#f59e0b'
                               : '#334155'
                       }"
                       stroke-width="1" />
                     <text x="${mx}" y="${my + 3}" text-anchor="middle" fill="#f8fafc" font-size="8.2" font-weight="700">${badgeLabel}</text>`
                  : ''
              }
              ${
                stormTag && link
                  ? `<rect x="${mx - 18}" y="${my - 21}" width="36" height="12" rx="3" fill="#7c2d12" stroke="#fb923c" stroke-width="1" />
                     <text x="${mx}" y="${my - 12.5}" text-anchor="middle" fill="#ffedd5" font-size="7.5" font-weight="800">${stormTag}</text>`
                  : ''
              }
            </g>
          `);
        }
      }
    }

    // Generate 8x8 nodes
    const nodeSvgParts: string[] = [];
    const districtMap = new Map(
      state.scenario.districts.map((d) => [coordKey(d.row, d.col), d]),
    );
    const relayMap = new Map(
      state.scenario.relays.map((r) => [coordKey(r.row, r.col), r]),
    );
    const genKey = coordKey(state.scenario.generator.row, state.scenario.generator.col);

    for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
      for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
        const key = coordKey(r, c);
        const cx = cellX(c);
        const cy = cellY(r);
        const blocked = isBlockedCoord(state.scenario, { row: r, col: c });
        const dist = districtMap.get(key);
        const relay = relayMap.get(key);

        if (blocked) {
          nodeSvgParts.push(`
            <g>
              <rect x="${cx - 16}" y="${cy - 16}" width="32" height="32" rx="5" fill="#0f172a" stroke="#1e293b" stroke-dasharray="2,2" />
              <text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="#475569" font-size="8" font-weight="700">⛰/🌊</text>
            </g>
          `);
          continue;
        }

        if (key === genKey) {
          nodeSvgParts.push(`
            <g>
              <rect x="${cx - 23}" y="${cy - 23}" width="46" height="46" rx="8" fill="#0284c7" stroke="#7dd3fc" stroke-width="2.5" />
              <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="900">⚡GEN</text>
              <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="#e0f2fe" font-size="8.5" font-weight="800">${state.preview.flow.generatorUsedMW}/${state.scenario.generator.outputMW}MW</text>
              <text x="${cx}" y="${cy + 17}" text-anchor="middle" fill="#bae6fd" font-size="7.5">(${r},${c})</text>
            </g>
          `);
          continue;
        }

        if (dist) {
          const alloc = state.preview.flow.districtAllocations[dist.id];
          const isLit = alloc.unmetMW === 0;
          const isZeroDemand = alloc.demandMW === 0;
          const fill = isLit ? '#064e3b' : alloc.deliveredMW > 0 ? '#78350f' : '#7f1d1d';
          const stroke = isLit ? '#34d399' : alloc.deliveredMW > 0 ? '#fbbf24' : '#f87171';
          const statusGlyph = isZeroDemand
            ? 'IDLE'
            : isLit
              ? 'LIT ✓'
              : alloc.deliveredMW > 0
                ? `-${alloc.unmetMW}MW ⚠`
                : 'OUT ✖';

          nodeSvgParts.push(`
            <g>
              <rect x="${cx - 24}" y="${cy - 24}" width="48" height="48" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2.2" />
              <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="900">P${dist.priority} ${dist.id} ${dist.shortCode}</text>
              <text x="${cx}" y="${cy + 2}" text-anchor="middle" fill="#f8fafc" font-size="9.5" font-weight="800">${alloc.deliveredMW}/${alloc.demandMW} MW</text>
              <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#fde68a" font-size="7.8" font-weight="800">${statusGlyph}</text>
            </g>
          `);
          continue;
        }

        if (relay) {
          const energized = state.preview.flow.energizedRelayIds.includes(relay.id);
          nodeSvgParts.push(`
            <g>
              <circle cx="${cx}" cy="${cy}" r="18" fill="${energized ? '#1e3a5f' : '#1e293b'}" stroke="${energized ? '#38bdf8' : '#64748b'}" stroke-width="2" />
              <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="800">◈${relay.id}</text>
              <text x="${cx}" y="${cy + 9}" text-anchor="middle" fill="#94a3b8" font-size="7.5">(${r},${c})</text>
            </g>
          `);
          continue;
        }

        nodeSvgParts.push(`
          <g>
            <circle cx="${cx}" cy="${cy}" r="9" fill="#0f172a" stroke="#334155" stroke-width="1.2" />
            <text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="#64748b" font-size="7">${r},${c}</text>
          </g>
        `);
      }
    }

    return `
      <svg class="bd-svg-board" viewBox="0 0 ${size} ${size}" role="img" aria-label="8 by 8 Power Grid Dispatch Board">
        <title>Port Argon 8x8 Power Grid Dispatch Board</title>
        ${corridorSvgParts.join('\n')}
        ${nodeSvgParts.join('\n')}
      </svg>
    `;
  };

  const render = () => {
    const flow = state.preview.flow;
    const forecast = getForecastStrikes(state.scenario, state.turn);
    const failingDiagnostics = Object.values(flow.diagnostics).filter(
      (d) => d.unmetMW > 0,
    );

    let onboardingText = '';
    if (state.turn === 1 && state.stagedActions.length < 2) {
      onboardingText = state.scenario.onboardingHintTurn1;
    } else if (state.turn === 2 && failingDiagnostics.length > 0) {
      onboardingText = state.scenario.onboardingHintTurn2;
    }

    const primaryDiagnosticText =
      failingDiagnostics.length > 0
        ? failingDiagnostics.map((d) => d.explanation).join(' | ')
        : `ALL 5 DISTRICTS 100% POWERED (${flow.totalDeliveredMW}/${flow.totalDemandMW} MW delivered, 0 MW shortfall). Ready to Commit Turn ${state.turn}.`;

    const selectedLink = state.board.links[selectedEdgeId];
    const selectedEf = flow.edgeFlows[selectedEdgeId];

    root.innerHTML = `
      <header class="bd-header">
        <div class="bd-title-block">
          <h1>⚡ BLACKOUT DISPATCH <span style="font-size:0.78rem;font-weight:600;color:#38bdf8;">[${state.scenario.title}]</span></h1>
          <p class="bd-subtitle">${state.scenario.briefing}</p>
        </div>
        <nav class="bd-top-controls" aria-label="Scenario and System Controls">
          <label for="bd-scenario-select" class="bd-visually-hidden">Select Scenario</label>
          <select id="bd-scenario-select" class="bd-select">
            ${HANDCRAFTED_SCENARIOS.map(
              (s) =>
                `<option value="${s.id}" ${
                  state.scenario.id === s.id ? 'selected' : ''
                }>${s.title}</option>`,
            ).join('')}
            <option value="seeded" ${state.scenario.isSeeded ? 'selected' : ''}>Seeded Storm Mode (#${state.scenario.seed ?? CONFIG.DEFAULT_SEED})</option>
          </select>
          <button type="button" class="bd-btn" id="bd-btn-new-seed" title="Generate new seeded storm">🎲 Seed</button>
          <button type="button" class="bd-btn" id="bd-btn-restart">↻ Restart</button>
          <button type="button" class="bd-btn" id="bd-btn-save-modal">💾 Save/Load</button>
          <button type="button" class="bd-btn" id="bd-btn-mute" aria-pressed="${audio.isMuted()}">${audio.isMuted() ? '🔇 Muted' : '🔊 Audio'}</button>
          <button type="button" class="bd-btn" id="bd-btn-debug" aria-pressed="${debugEnabled}"> 🛠 Debug [D]</button>
        </nav>
      </header>

      <main id="bd-main-content">
        <div class="bd-hud-strip" role="region" aria-label="Turn and Resource Telemetry">
          <div class="bd-metric-card">
            <span class="bd-metric-label">Storm Turn</span>
            <span class="bd-metric-value">${state.turn} / ${CONFIG.TOTAL_TURNS}</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Actions Left</span>
            <span class="bd-metric-value" style="color:${state.actionsRemaining > 0 ? '#38bdf8' : '#94a3b8'}">${state.actionsRemaining} / ${CONFIG.MAX_ACTIONS_PER_TURN}</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Material Reserve</span>
            <span class="bd-metric-value" style="color:#fbbf24">${state.materials} Mat <small style="font-size:0.75rem;color:#94a3b8">(+${state.preview.projectedMaterialIncome}/t)</small></span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">Preview Grid Load</span>
            <span class="bd-metric-value" style="color:${flow.totalUnmetMW === 0 ? '#34d399' : '#f87171'}">${flow.totalDeliveredMW} / ${flow.totalDemandMW} MW</span>
          </div>
          <div class="bd-metric-card">
            <span class="bd-metric-label">City Outage Meter</span>
            <span class="bd-metric-value" style="color:${state.preview.projectedCityCumulativeUnmetMW > state.scenario.cityOutageThresholdMW ? '#ef4444' : '#e2e8f0'}">${state.preview.projectedCityCumulativeUnmetMW} / ${state.scenario.cityOutageThresholdMW} MW</span>
          </div>
        </div>

        ${
          onboardingText
            ? `<div class="bd-banner bd-banner-warn" role="status"><strong>📋 DISPATCH ADVISORY:</strong> ${onboardingText}</div>`
            : ''
        }

        <div class="bd-banner ${
          state.status === 'lost'
            ? 'bd-banner-danger'
            : failingDiagnostics.length > 0
              ? 'bd-banner-warn'
              : 'bd-banner-ok'
        }" role="status" aria-live="polite">
          <strong>${
            state.status === 'lost'
              ? '🚨 GRID FAILURE:'
              : state.status === 'won'
                ? '🏆 STORM SURVIVED:'
                : failingDiagnostics.length > 0
                  ? '⚠ PREVIEW BOTTLENECK DIAGNOSTIC:'
                  : '✓ PREVIEW FLOW DIAGNOSTIC:'
          }</strong>
          ${state.status === 'lost' ? state.lossReason : primaryDiagnosticText}
          ${
            feedbackBanner
              ? `<div style="margin-top:0.3rem;font-size:0.8rem;opacity:0.92;">↳ ${feedbackBanner.text}</div>`
              : ''
          }
        </div>

        <div class="bd-layout">
          <section class="bd-panel" aria-labelledby="bd-grid-heading">
            <h2 id="bd-grid-heading">
              <span>8x8 Municipal Transmission Grid</span>
              <span style="font-size:0.76rem;font-weight:500;color:#94a3b8;">Click any corridor (r1,c1)↔(r2,c2) to stage work order</span>
            </h2>

            <div class="bd-toolbar" role="toolbar" aria-label="Dispatch Work Order Tools">
              <button type="button" class="bd-tool-btn" data-tool="auto-smart" aria-pressed="${activeTool === 'auto-smart'}">⚡ Smart Dispatch (Place/Repair/Upgrade)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-standard" aria-pressed="${activeTool === 'place-standard'}">➕ Standard Line (4MW · 10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-heavy" aria-pressed="${activeTool === 'place-heavy'}">➕/⬆ Heavy Trunk (8MW · 20m/10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="place-shielded" aria-pressed="${activeTool === 'place-shielded'}">🛡 Storm-Shielded (5MW · 25m/15m)</button>
              <button type="button" class="bd-tool-btn" data-tool="repair" aria-pressed="${activeTool === 'repair'}">🔧 Repair Damaged (5-10m)</button>
              <button type="button" class="bd-tool-btn" data-tool="reroute" aria-pressed="${activeTool === 'reroute'}">⇄ Reroute Flow Gate (5m)</button>
            </div>

            <div class="bd-board-wrapper">
              ${renderBoardSvg()}
            </div>

            <div class="bd-inspector" aria-label="Selected Corridor Inspector">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.4rem;">
                <strong>Selected Corridor: <code>${formatEdgeLabel(selectedEdgeId)}</code></strong>
                <span style="font-size:0.8rem;color:#94a3b8;">
                  ${
                    selectedLink
                      ? `${CONFIG.LINKS[selectedLink.type].name} · Status: ${selectedLink.status.toUpperCase()} · Flow: ${selectedEf?.flowMW ?? 0}/${selectedEf?.capacityMW ?? 0} MW · Gate: ${selectedLink.directionConstraint.toUpperCase()}`
                      : 'Empty Corridor (No Link Installed)'
                  }
                </span>
              </div>
              <div class="bd-inspector-actions">
                ${
                  !selectedLink
                    ? `
                      <button type="button" class="bd-btn bd-btn-primary" data-direct-action="place-standard">Place Standard (4MW · 10 Mat)</button>
                      <button type="button" class="bd-btn" data-direct-action="place-heavy">Place Heavy Trunk (8MW · 20 Mat)</button>
                      <button type="button" class="bd-btn" data-direct-action="place-shielded">Place Storm-Shielded (5MW · 25 Mat)</button>
                    `
                    : `
                      ${
                        selectedLink.status === 'damaged'
                          ? `<button type="button" class="bd-btn bd-btn-warn" data-direct-action="repair">🔧 Repair ${CONFIG.LINKS[selectedLink.type].name} (${CONFIG.LINKS[selectedLink.type].repairCostMat} Mat)</button>`
                          : ''
                      }
                      ${
                        selectedLink.type !== 'heavy'
                          ? `<button type="button" class="bd-btn bd-btn-primary" data-direct-action="upgrade-heavy">⬆ Upgrade to Heavy Trunk 8MW (${getUpgradeCostMat(selectedLink.type, 'heavy', selectedLink.status === 'damaged')} Mat)</button>`
                          : ''
                      }
                      ${
                        selectedLink.type !== 'shielded'
                          ? `<button type="button" class="bd-btn" data-direct-action="upgrade-shielded">🛡 Upgrade to Storm-Shielded 5MW (${getUpgradeCostMat(selectedLink.type, 'shielded', selectedLink.status === 'damaged')} Mat)</button>`
                          : ''
                      }
                      <button type="button" class="bd-btn" data-direct-action="reroute">⇄ Cycle Flow Gate (${CONFIG.REROUTE_COST_MAT} Mat)</button>
                    `
                }
              </div>
            </div>

            <div class="bd-action-bar">
              <div style="display:flex;gap:0.45rem;flex-wrap:wrap;align-items:center;">
                <button type="button" class="bd-btn" id="bd-btn-undo" ${state.stagedActions.length === 0 ? 'disabled' : ''}>↩ Undo Action (${state.stagedActions.length})</button>
                <button type="button" class="bd-btn" id="bd-btn-reset-turn" ${state.stagedActions.length === 0 ? 'disabled' : ''}>⟲ Reset Turn</button>
              </div>
              <button type="button" class="bd-btn bd-btn-commit" id="bd-btn-commit" ${state.status !== 'playing' ? 'disabled' : ''}>
                ✓ Commit Turn ${state.turn} (${flow.totalDeliveredMW}/${flow.totalDemandMW} MW)
              </button>
            </div>
          </section>

          <div style="display:flex;flex-direction:column;gap:0.85rem;">
            <section class="bd-panel" aria-labelledby="bd-districts-heading">
              <h2 id="bd-districts-heading">5-District Priority & Demand Schedule</h2>
              <table class="bd-table">
                <caption>Deterministic allocation follows strict Priority Order (P1 → P5)</caption>
                <thead>
                  <tr>
                    <th scope="col">Pri</th>
                    <th scope="col">District</th>
                    <th scope="col">Turn ${state.turn}</th>
                    <th scope="col">Turn ${Math.min(CONFIG.TOTAL_TURNS, state.turn + 1)}</th>
                    <th scope="col">Status</th>
                    <th scope="col">Unmet Limit</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.scenario.districts
                    .map((d) => {
                      const alloc = flow.districtAllocations[d.id];
                      const dState = state.districts[d.id];
                      const nextDemand =
                        d.demandCurve[Math.min(CONFIG.TOTAL_TURNS - 1, state.turn)];
                      const projCum = dState.cumulativeUnmetMW + alloc.unmetMW;
                      const badgeClass =
                        alloc.unmetMW === 0
                          ? 'bd-badge-lit'
                          : alloc.deliveredMW > 0
                            ? 'bd-badge-short'
                            : 'bd-badge-out';
                      const badgeText =
                        alloc.demandMW === 0
                          ? 'IDLE ✓'
                          : alloc.unmetMW === 0
                            ? 'LIT ✓'
                            : alloc.deliveredMW > 0
                              ? `SHORT -${alloc.unmetMW}MW ⚠`
                              : `OUTAGE -${alloc.unmetMW}MW ✖`;
                      return `
                        <tr>
                          <th scope="row">P${d.priority}</th>
                          <td><strong>${d.id}</strong> ${d.name} <small style="color:#94a3b8;">(${d.row},${d.col})</small></td>
                          <td><strong>${alloc.deliveredMW}/${alloc.demandMW} MW</strong></td>
                          <td>${nextDemand} MW</td>
                          <td><span class="bd-badge ${badgeClass}">${badgeText}</span></td>
                          <td style="color:${projCum > d.unmetLimitMW ? '#ef4444' : '#cbd5e1'}">${projCum} / ${d.unmetLimitMW} MW</td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </section>

            <section class="bd-panel" aria-labelledby="bd-forecast-heading">
              <h2 id="bd-forecast-heading">2-Turn Weather Radar Forecast</h2>
              <ul class="bd-forecast-list" role="list">
                ${
                  forecast.imminent.length === 0
                    ? `<li class="bd-forecast-item"><span><strong>Turn ${state.turn} (Imminent):</strong> Clear skies — no strikes this turn</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`
                    : forecast.imminent
                        .map(
                          (s) => `
                        <li class="bd-forecast-item" style="border-color:#f59e0b;">
                          <span><strong>⚡ Turn ${s.turn} (Resolves Now):</strong> ${s.label} at <code>${formatEdgeLabel(s.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${s.severity.toUpperCase()}</span>
                        </li>`,
                        )
                        .join('')
                }
                ${
                  forecast.turnPlus1.length === 0
                    ? `<li class="bd-forecast-item"><span><strong>Turn ${state.turn + 1} (T+1):</strong> No strikes forecast</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`
                    : forecast.turnPlus1
                        .map(
                          (s) => `
                        <li class="bd-forecast-item">
                          <span><strong>⛈ Turn ${s.turn} (T+1):</strong> ${s.label} at <code>${formatEdgeLabel(s.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${s.severity.toUpperCase()}</span>
                        </li>`,
                        )
                        .join('')
                }
                ${
                  forecast.turnPlus2.length === 0
                    ? `<li class="bd-forecast-item"><span><strong>Turn ${state.turn + 2} (T+2):</strong> No strikes forecast</span><span class="bd-badge bd-badge-lit">CLEAR</span></li>`
                    : forecast.turnPlus2
                        .map(
                          (s) => `
                        <li class="bd-forecast-item">
                          <span><strong>🌧 Turn ${s.turn} (T+2):</strong> ${s.label} at <code>${formatEdgeLabel(s.edgeId)}</code></span>
                          <span class="bd-badge bd-badge-short">${s.severity.toUpperCase()}</span>
                        </li>`,
                        )
                        .join('')
                }
              </ul>
            </section>

            <section class="bd-panel" aria-labelledby="bd-legend-heading">
              <h2 id="bd-legend-heading">Transmission Link Specs & Tradeoffs</h2>
              <ul class="bd-forecast-list" role="list">
                <li class="bd-forecast-item">
                  <span><strong>Standard Line (L):</strong> 4 MW Capacity · Build 10 Mat · Repair 5 Mat</span>
                  <span style="color:#94a3b8;">Vulnerable to Wind</span>
                </li>
                <li class="bd-forecast-item">
                  <span><strong>Heavy Trunk (H):</strong> 8 MW Capacity · Build 20 Mat · Upgrade 10 Mat</span>
                  <span style="color:#34d399;">High Throughput</span>
                </li>
                <li class="bd-forecast-item">
                  <span><strong>Storm-Shielded (S🛡):</strong> 5 MW Capacity · Build 25 Mat · Upgrade 15 Mat</span>
                  <span style="color:#38bdf8;">Immune to Wind</span>
                </li>
              </ul>
            </section>

            ${
              debugEnabled
                ? `
                  <section class="bd-panel" aria-labelledby="bd-debug-heading" style="border-color:#a855f7;">
                    <h2 id="bd-debug-heading" style="color:#e9d5ff;">🛠 Solver & Telemetry Debug Panel</h2>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;">
                      <button type="button" class="bd-btn" id="bd-dbg-trunk">Run Strategy A: Efficient Trunk (Win)</button>
                      <button type="button" class="bd-btn" id="bd-dbg-loop">Run Strategy B: Redundant Loop (Win)</button>
                      <button type="button" class="bd-btn bd-btn-warn" id="bd-dbg-loss">Run Neglect Script (Blackout Loss)</button>
                    </div>
                    <div style="font-family:monospace;font-size:0.74rem;color:#cbd5e1;">
                      DAG Verified (No Cycles): ${!flow.hasDirectedCycle} | Links: ${Object.keys(state.board.links).length} | Energized Relays: ${flow.energizedRelayIds.join(', ') || 'None'}
                    </div>
                  </section>
                `
                : ''
            }
          </div>
        </div>
      </main>

      <dialog id="bd-save-dialog" class="bd-dialog" aria-labelledby="bd-dialog-title">
        <h2 id="bd-dialog-title" style="margin-top:0;">Save / Export / Import Dispatch State</h2>
        <p style="font-size:0.82rem;color:#94a3b8;">Copy this JSON snapshot to back up your mid-turn dispatch state or paste a saved payload below.</p>
        <label for="bd-save-textarea" class="bd-visually-hidden">Serialized Game State JSON</label>
        <textarea id="bd-save-textarea" class="bd-textarea">${serializeGameState(state)}</textarea>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;flex-wrap:wrap;">
          <button type="button" class="bd-btn" id="bd-btn-clear-save">Clear LocalStorage</button>
          <button type="button" class="bd-btn bd-btn-primary" id="bd-btn-import-save">Import JSON</button>
          <button type="button" class="bd-btn" id="bd-btn-close-dialog">Close</button>
        </div>
      </dialog>
    `;

    // Wire event listeners
    root.querySelector('#bd-scenario-select')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const nextScenario: ScenarioSpec =
        val === 'seeded'
          ? getScenarioById('seeded', state.scenario.seed ?? CONFIG.DEFAULT_SEED)
          : getScenarioById(val);
      state = createInitialGameState(nextScenario);
      feedbackBanner = { text: `Loaded ${nextScenario.title}.`, kind: 'info' };
      persistCurrentState();
      render();
    });

    root.querySelector('#bd-btn-new-seed')?.addEventListener('click', () => {
      const nextSeed = ((state.scenario.seed ?? CONFIG.DEFAULT_SEED) + 137) >>> 0;
      state = createInitialGameState(getScenarioById('seeded', nextSeed));
      feedbackBanner = {
        text: `Generated deterministic Seeded Storm #${nextSeed}.`,
        kind: 'info',
      };
      persistCurrentState();
      render();
    });

    root.querySelector('#bd-btn-restart')?.addEventListener('click', () => {
      state = createInitialGameState(state.scenario);
      feedbackBanner = { text: `Restarted ${state.scenario.title} at Turn 1.`, kind: 'info' };
      persistCurrentState();
      render();
    });

    root.querySelector('#bd-btn-mute')?.addEventListener('click', () => {
      audio.toggleMute();
      render();
    });

    root.querySelector('#bd-btn-debug')?.addEventListener('click', () => {
      debugEnabled = !debugEnabled;
      render();
    });

    const dialog = root.querySelector('#bd-save-dialog') as HTMLDialogElement | null;
    root.querySelector('#bd-btn-save-modal')?.addEventListener('click', () => {
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
    root.querySelector('#bd-btn-close-dialog')?.addEventListener('click', () => {
      dialog?.close();
    });
    root.querySelector('#bd-btn-clear-save')?.addEventListener('click', () => {
      clearSavedGameState();
      dialog?.close();
      feedbackBanner = { text: 'Cleared saved localStorage state.', kind: 'info' };
      render();
    });
    root.querySelector('#bd-btn-import-save')?.addEventListener('click', () => {
      const raw = (root.querySelector('#bd-save-textarea') as HTMLTextAreaElement | null)?.value;
      if (!raw) return;
      const imported = deserializeGameState(raw);
      if (imported) {
        state = imported;
        persistCurrentState();
        dialog?.close();
        feedbackBanner = { text: `Imported save state at Turn ${state.turn}.`, kind: 'info' };
        render();
      } else {
        feedbackBanner = {
          text: 'Invalid or corrupted save JSON — current state preserved.',
          kind: 'error',
        };
        dialog?.close();
        render();
      }
    });

    root.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTool = (btn as HTMLElement).getAttribute('data-tool') as DispatchTool;
        render();
      });
    });

    root.querySelectorAll('[data-edge-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const edgeId = (el as HTMLElement).getAttribute('data-edge-id');
        if (edgeId) handleCorridorAction(edgeId);
      });
    });

    root.querySelectorAll('[data-direct-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = (btn as HTMLElement).getAttribute('data-direct-action') as DispatchTool;
        handleCorridorAction(selectedEdgeId, tool);
      });
    });

    root.querySelector('#bd-btn-undo')?.addEventListener('click', handleUndo);
    root.querySelector('#bd-btn-reset-turn')?.addEventListener('click', handleResetTurn);
    root.querySelector('#bd-btn-commit')?.addEventListener('click', handleCommitTurn);

    root.querySelector('#bd-dbg-trunk')?.addEventListener('click', () =>
      runAutomatedScript(SCENARIO_1_EFFICIENT_TRUNK_SCRIPT, 'Efficient Trunk Strategy'),
    );
    root.querySelector('#bd-dbg-loop')?.addEventListener('click', () =>
      runAutomatedScript(SCENARIO_1_REDUNDANT_LOOP_SCRIPT, 'Redundant Loop Strategy'),
    );
    root.querySelector('#bd-dbg-loss')?.addEventListener('click', () =>
      runAutomatedScript(SCENARIO_1_NEGLECT_LOSS_SCRIPT, 'Neglect Failure Script'),
    );
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (e.key === 'd' || e.key === 'D') {
      debugEnabled = !debugEnabled;
      render();
    } else if (e.key === 'z' || e.key === 'Z') {
      handleUndo();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  render();

  return {
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      audio.destroy();
      container.innerHTML = '';
    },
    getState() {
      return state;
    },
    restartWithSeed(seed: number) {
      state = createInitialGameState(getScenarioById('seeded', seed));
      persistCurrentState();
      render();
    },
    toggleDebug(force?: boolean) {
      debugEnabled = force !== undefined ? force : !debugEnabled;
      render();
    },
  };
}
