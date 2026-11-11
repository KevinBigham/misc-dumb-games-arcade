import { KitchenAudioEngine } from './audio.ts';
import { MERGE_KITCHEN_CONFIG } from './config.ts';
import { getRecipeByTier, getRecipeByValue, RECIPE_TIERS } from './content.ts';
import {
  exportSaveString,
  importSaveString,
  loadGameState,
  loadProfile,
  MergeKitchenProfile,
  saveGameState,
  saveProfile,
  syncProfileWithState,
} from './persistence.ts';
import {
  applyCommand,
  computeRushMultiplier,
  computeTicketTipMultiplier,
  createInitialState,
  getServableTickets,
  MergeKitchenCommand,
  MergeKitchenState,
  SlideDirection,
} from './simulation.ts';

export interface MergeKitchenUIOptions {
  initialSeed?: number;
  debug?: boolean;
}

const STYLES = `
.mk-root {
  --mk-bg: #1c1410;
  --mk-panel: #281d17;
  --mk-panel-border: #4a3528;
  --mk-board-bg: #3b281e;
  --mk-cell-empty: #2a1c14;
  --mk-accent: #e06d2b;
  --mk-gold: #f59e0b;
  --mk-text: #fdf6ec;
  --mk-muted: #cbb59d;
  --mk-success: #22c55e;
  --mk-danger: #ef4444;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--mk-text);
  background: radial-gradient(circle at top, #2f2018 0%, #160f0c 100%);
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
}

.mk-root *, .mk-root *::before, .mk-root *::after {
  box-sizing: border-box;
}

.mk-shell {
  width: 100%;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mk-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.mk-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mk-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mk-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff7ed;
}

.mk-badge {
  background: linear-gradient(135deg, #e06d2b, #b45309);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--mk-muted);
}

.mk-stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mk-stat-box {
  background: #1a120e;
  border: 1px solid #443024;
  border-radius: 8px;
  padding: 5px 10px;
  min-width: 78px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mk-stat-label {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mk-muted);
}

.mk-stat-val {
  font-size: 1.02rem;
  font-weight: 800;
  color: #fef3c7;
}

.mk-stat-box--rush .mk-stat-val {
  color: #fbbf24;
}

.mk-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.mk-goal-bar {
  flex: 1 1 220px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 9px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mk-goal-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  font-weight: 600;
  color: #fde68a;
}

.mk-progress-track {
  width: 100%;
  height: 7px;
  background: #160f0c;
  border-radius: 999px;
  overflow: hidden;
}

.mk-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e06d2b 0%, #fbbf24 100%);
  transition: width 0.2s ease;
}

.mk-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mk-btn {
  background: #36261d;
  color: #fef3c7;
  border: 1px solid #573d2e;
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.mk-btn:hover {
  background: #483226;
}

.mk-btn:active {
  transform: translateY(1px);
}

.mk-btn--primary {
  background: linear-gradient(135deg, #e06d2b 0%, #c2410c 100%);
  border-color: #fb923c;
  color: #ffffff;
}

.mk-btn--primary:hover {
  background: linear-gradient(135deg, #ea580c 0%, #9a3412 100%);
}

/* 3-Ticket Customer Order Rail */
.mk-rail-section {
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.mk-rail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--mk-muted);
}

.mk-rail-title {
  font-weight: 800;
  color: #fde68a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-tickets-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 560px) {
  .mk-tickets-grid {
    grid-template-columns: 1fr;
  }
}

.mk-ticket {
  background: #1f1611;
  border: 1.5px solid #473225;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
}

.mk-ticket--servable {
  border-color: #fbbf24;
  background: linear-gradient(160deg, #2d2013 0%, #1f1611 100%);
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.25), 0 6px 14px rgba(0, 0, 0, 0.35);
}

.mk-ticket-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--mk-muted);
}

.mk-patron {
  font-weight: 700;
  color: #fff7ed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-hotkey-pill {
  background: #36261d;
  color: #fde68a;
  border: 1px solid #5c4030;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-weight: 800;
}

.mk-ticket-dish {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mk-ticket-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 8px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-ticket-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mk-ticket-dish-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-ticket-tier-meta {
  font-size: 0.68rem;
  color: #fcd34d;
  font-weight: 600;
}

.mk-patience-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.66rem;
  color: var(--mk-muted);
}

.mk-patience-bar {
  width: 100%;
  height: 4px;
  background: #120c09;
  border-radius: 999px;
  overflow: hidden;
}

.mk-patience-fill {
  height: 100%;
  transition: width 0.2s ease;
}

.mk-serve-btn {
  width: 100%;
  border-radius: 7px;
  padding: 6px 8px;
  font-size: 0.73rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid #4c3628;
  background: #2b1f18;
  color: #a89078;
  transition: all 0.15s ease;
}

.mk-serve-btn--ready {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #fef08a;
  color: #1c1108;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.mk-serve-btn--ready:hover {
  filter: brightness(1.08);
}

/* Status Callout Banner */
.mk-callout {
  background: #231812;
  border: 1px solid #473225;
  border-radius: 9px;
  padding: 7px 12px;
  font-size: 0.79rem;
  font-weight: 600;
  color: #fde68a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 34px;
}

.mk-callout--blocked {
  border-color: #ef4444;
  color: #fca5a5;
}

.mk-callout--served {
  border-color: #22c55e;
  color: #86efac;
}

/* Main Play Area: 4x4 Prep Board + Controls */
.mk-board-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mk-grid-wrapper {
  width: 100%;
  max-width: 440px;
  aspect-ratio: 1 / 1;
  background: var(--mk-board-bg);
  border: 3px solid #6b4832;
  border-radius: 16px;
  padding: 10px;
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.55), 0 10px 26px rgba(0, 0, 0, 0.45);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 9px;
  touch-action: none;
  position: relative;
}

.mk-cell {
  background: var(--mk-cell-empty);
  border: 1.5px solid #483123;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  overflow: hidden;
}

.mk-tile {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  position: relative;
}

.mk-tile--servable {
  cursor: pointer;
  box-shadow: 0 0 0 2.5px #fbbf24, 0 5px 14px rgba(245, 158, 11, 0.45);
}

@keyframes mkPopMerge {
  0% { transform: scale(0.82); }
  55% { transform: scale(1.11); }
  100% { transform: scale(1); }
}

@keyframes mkSpawnIn {
  0% { transform: scale(0.45); opacity: 0.3; }
  100% { transform: scale(1); opacity: 1; }
}

.mk-root:not(.mk-reduced-motion) .mk-tile--merged {
  animation: mkPopMerge 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.mk-root:not(.mk-reduced-motion) .mk-tile--spawned {
  animation: mkSpawnIn 0.18s ease-out;
}

.mk-tile-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1;
}

.mk-tile-val {
  background: rgba(0, 0, 0, 0.22);
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 0.72rem;
}

.mk-tile-tier {
  opacity: 0.85;
  font-size: 0.6rem;
}

.mk-tile-icon {
  width: 44%;
  height: 44%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-tile-name {
  font-size: 0.66rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.05;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-tile-serve-pill {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: #f59e0b;
  color: #1c1108;
  font-size: 0.54rem;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

/* D-Pad & Controls Row */
.mk-controls-bar {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 8px 12px;
}

.mk-dpad {
  display: grid;
  grid-template-columns: repeat(3, 42px);
  grid-template-rows: repeat(2, 34px);
  gap: 4px;
}

.mk-dpad-btn {
  background: #38271e;
  color: #fff7ed;
  border: 1px solid #5e4232;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mk-dpad-btn:hover {
  background: #4d3528;
}

.mk-controls-hint {
  flex: 1;
  font-size: 0.72rem;
  color: var(--mk-muted);
  line-height: 1.35;
}

/* Recipe Chain Reference Drawer */
.mk-drawer {
  background: var(--mk-panel);
  border: 1px solid var(--mk-panel-border);
  border-radius: 12px;
  padding: 10px 12px;
}

.mk-drawer-title {
  margin: 0 0 8px 0;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fde68a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mk-recipe-chain {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 6px;
}

.mk-recipe-chip {
  background: #1c130e;
  border: 1px solid #432f23;
  border-radius: 8px;
  padding: 5px 7px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.55;
}

.mk-recipe-chip--discovered {
  opacity: 1;
  border-color: #d97706;
}

.mk-recipe-chip-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.mk-recipe-chip-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mk-recipe-chip-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mk-recipe-chip-val {
  font-size: 0.62rem;
  color: #fbbf24;
}

/* Overlay Modal for Victory / Loss */
.mk-overlay {
  position: absolute;
  inset: 0;
  background: rgba(18, 12, 9, 0.88);
  backdrop-filter: blur(4px);
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  z-index: 15;
}

.mk-overlay-title {
  margin: 0 0 6px 0;
  font-size: 1.45rem;
  font-weight: 900;
  color: #fef08a;
}

.mk-overlay-desc {
  margin: 0 0 14px 0;
  font-size: 0.85rem;
  color: #fed7aa;
  max-width: 320px;
  line-height: 1.4;
}

.mk-overlay-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.mk-debug-panel {
  background: #120c09;
  border: 1px dashed #f59e0b;
  border-radius: 10px;
  padding: 10px;
  font-family: monospace;
  font-size: 0.72rem;
  color: #fde68a;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 420px) {
  .mk-root {
    padding: 6px;
  }
  .mk-grid-wrapper {
    padding: 7px;
    gap: 6px;
  }
  .mk-tile-name {
    font-size: 0.58rem;
  }
}
`;

export class MergeKitchenController {
  private container: HTMLElement;
  private state: MergeKitchenState;
  private profile: MergeKitchenProfile;
  private audio: KitchenAudioEngine;
  private debugOpen: boolean;
  private recipeDrawerOpen = true;
  private saveDrawerOpen = false;
  private statusBannerText =
    'Swipe or use Arrow/WASD keys to slide & merge ingredients. Press [1], [2], or [3] to serve ready customer tickets!';
  private statusBannerTone: 'normal' | 'blocked' | 'served' = 'normal';

  private touchStartX = 0;
  private touchStartY = 0;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, options?: MergeKitchenUIOptions) {
    this.container = container;
    this.profile = loadProfile();
    this.audio = new KitchenAudioEngine(this.profile.soundEnabled);
    this.debugOpen = Boolean(options?.debug);

    if (options?.initialSeed !== undefined) {
      this.state = createInitialState(options.initialSeed);
      saveGameState(this.state);
    } else {
      const loaded = loadGameState(MERGE_KITCHEN_CONFIG.DEFAULT_SEED);
      this.state = loaded.state;
      if (loaded.restoredFromSave) {
        this.statusBannerText = 'Welcome back, Chef! Restored your active dinner service from autosave.';
      }
    }

    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.keydownHandler);

    this.mountDom();
    this.render();
  }

  public getState(): MergeKitchenState {
    return this.state;
  }

  public dispatch(command: MergeKitchenCommand): MergeKitchenState {
    const prevWon = this.state.won;
    const nextState = applyCommand(this.state, command);
    this.state = nextState;

    const action = nextState.lastAction;
    if (action.type === 'BLOCKED_SLIDE') {
      this.audio.playBlocked();
      this.statusBannerTone = 'blocked';
      this.statusBannerText = `Blocked! No tiles can slide ${action.direction} — try another direction or serve a ready ticket.`;
    } else if (action.type === 'SLIDE') {
      if (action.mergedCells.length > 0) {
        const highestMerged = Math.max(...action.mergedCells.map((c) => c.tier));
        this.audio.playMerge(highestMerged);
        const topRecipe = getRecipeByTier(highestMerged);
        this.statusBannerTone = 'normal';
        this.statusBannerText = `Merged ${topRecipe.name} [${topRecipe.value}]! +${action.scoreDelta} pts`;
      } else {
        this.audio.playSlide();
        this.statusBannerTone = 'normal';
        this.statusBannerText = `Slid ${action.direction} — prep board updated.`;
      }
    } else if (action.type === 'SERVE_ORDER' && action.servedTicket) {
      const s = action.servedTicket;
      this.audio.playOrderServed(s.rushCombo);
      this.statusBannerTone = 'served';
      this.statusBannerText = `🔔 Order Up! Plated ${s.dishName} [${s.value}] for +${s.scoreAwarded} pts (${s.tipMultiplier}x Tip · Rush ${s.rushCombo}x)!`;
    } else if (action.type === 'INVALID_SERVE') {
      this.audio.playBlocked();
      this.statusBannerTone = 'blocked';
      this.statusBannerText = 'That dish is not on the prep board yet — merge up to the requested recipe tier first!';
    } else if (action.type === 'KEEP_PLAYING') {
      this.statusBannerTone = 'normal';
      this.statusBannerText = 'Endless Dinner Service unlocked — aim for Tier 11: Chef’s Legend [2048]!';
    } else if (action.type === 'RESTART') {
      this.profile = {
        ...this.profile,
        gamesPlayed: this.profile.gamesPlayed + 1,
      };
      this.statusBannerTone = 'normal';
      this.statusBannerText = 'Fresh kitchen prep board ready, Chef!';
    }

    const justWon = !prevWon && nextState.won;
    if (justWon) {
      this.audio.playVictory();
    } else if (nextState.status === 'LOST') {
      this.audio.playGameOver();
    }

    this.profile = syncProfileWithState(this.profile, nextState, justWon);
    saveGameState(this.state);
    saveProfile(this.profile);
    this.render();
    return this.state;
  }

  public restartWithSeed(seed: number): void {
    this.dispatch({ type: 'RESTART', seed });
  }

  public toggleDebug(force?: boolean): void {
    this.debugOpen = force !== undefined ? force : !this.debugOpen;
    this.render();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    this.audio.destroy();
    this.container.innerHTML = '';
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    const key = e.key.toLowerCase();
    if (e.key === 'ArrowUp' || key === 'w') {
      e.preventDefault();
      this.dispatch({ type: 'SLIDE', direction: 'UP' });
    } else if (e.key === 'ArrowDown' || key === 's') {
      e.preventDefault();
      this.dispatch({ type: 'SLIDE', direction: 'DOWN' });
    } else if (e.key === 'ArrowLeft' || key === 'a') {
      e.preventDefault();
      this.dispatch({ type: 'SLIDE', direction: 'LEFT' });
    } else if (e.key === 'ArrowRight' || key === 'd') {
      if (e.shiftKey) {
        e.preventDefault();
        this.toggleDebug();
        return;
      }
      e.preventDefault();
      this.dispatch({ type: 'SLIDE', direction: 'RIGHT' });
    } else if (key === '1' || key === '2' || key === '3') {
      e.preventDefault();
      const slot = Number(key) - 1;
      this.dispatch({ type: 'SERVE_ORDER', ticketIndex: slot });
    } else if (key === 'r') {
      e.preventDefault();
      this.dispatch({ type: 'RESTART' });
    } else if (key === '`' || key === 'f2') {
      e.preventDefault();
      this.toggleDebug();
    }
  }

  private mountDom(): void {
    this.container.innerHTML = '';
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    this.container.appendChild(styleEl);

    const root = document.createElement('div');
    root.className = 'mk-root';
    root.setAttribute('data-testid', 'merge-kitchen-root');
    this.container.appendChild(root);
  }

  private render(): void {
    const root = this.container.querySelector('.mk-root') as HTMLElement | null;
    if (!root) return;

    root.classList.toggle('mk-reduced-motion', this.profile.reducedMotion);

    const servableMatches = getServableTickets(this.state);
    const servableBySlot = new Map<number, { row: number; col: number }[]>();
    const servableCellMap = new Map<string, number>(); // "row,col" -> ticketIndex

    for (const match of servableMatches) {
      servableBySlot.set(match.ticketIndex, match.matchingCells);
      for (const cell of match.matchingCells) {
        const key = `${cell.row},${cell.col}`;
        if (!servableCellMap.has(key)) {
          servableCellMap.set(key, match.ticketIndex);
        }
      }
    }

    const mergedCoordSet = new Set<string>(
      this.state.lastAction.mergedCells.map((c) => `${c.row},${c.col}`)
    );
    const spawnedCoord = this.state.lastAction.spawnedTile
      ? `${this.state.lastAction.spawnedTile.row},${this.state.lastAction.spawnedTile.col}`
      : null;

    const orderProgressPct = Math.min(
      100,
      Math.round((this.state.ordersServed / MERGE_KITCHEN_CONFIG.SHORT_GOAL_ORDERS) * 100)
    );
    const rushMultiplier = computeRushMultiplier(this.state.rushCombo);
    const highestRecipe = getRecipeByTier(this.state.highestTier);

    const ticketsHtml = this.state.tickets
      .map((ticket, idx) => {
        const recipe = getRecipeByTier(ticket.requiredTier);
        const isServable = servableBySlot.has(idx);
        const tipMult = computeTicketTipMultiplier(ticket);
        const effectiveMult = Number((tipMult * rushMultiplier).toFixed(2));
        const projectedScore = Math.round(recipe.baseServeScore * effectiveMult);
        const patiencePct = Math.max(
          0,
          Math.min(100, Math.round((ticket.patienceTurns / ticket.maxPatienceTurns) * 100))
        );
        const patienceColor =
          patiencePct > 50 ? '#22c55e' : patiencePct > 0 ? '#f59e0b' : '#ef4444';

        return `
          <div class="mk-ticket ${isServable ? 'mk-ticket--servable' : ''}" data-ticket-slot="${idx}">
            <div class="mk-ticket-top">
              <span class="mk-patron">${ticket.avatarBadge} ${ticket.patronName}</span>
              <span class="mk-hotkey-pill">Key [${idx + 1}]</span>
            </div>
            <div class="mk-ticket-dish">
              <div class="mk-ticket-icon" style="background:${recipe.bgGradient}; border:1.5px solid ${recipe.borderColor};">
                ${recipe.svgIcon}
              </div>
              <div class="mk-ticket-info">
                <span class="mk-ticket-dish-name">${recipe.name} [${recipe.value}]</span>
                <span class="mk-ticket-tier-meta">Tier ${recipe.tier} · +${projectedScore} pts (${effectiveMult}x)</span>
              </div>
            </div>
            <div class="mk-patience-row">
              <span>${ticket.tableLabel}</span>
              <span>${ticket.patienceTurns > 0 ? `${ticket.patienceTurns}t left (${tipMult}x tip)` : 'Base Tip (1.0x)'}</span>
            </div>
            <div class="mk-patience-bar">
              <div class="mk-patience-fill" style="width:${patiencePct}%; background:${patienceColor};"></div>
            </div>
            <button
              type="button"
              class="mk-serve-btn ${isServable ? 'mk-serve-btn--ready' : ''}"
              data-action="serve-ticket"
              data-ticket-index="${idx}"
              ${isServable ? '' : 'disabled'}
            >
              ${isServable ? `🔔 Serve Dish! (+${projectedScore}) [${idx + 1}]` : `Waiting for [${recipe.value}] ${recipe.shortName}`}
            </button>
          </div>
        `;
      })
      .join('');

    let cellsHtml = '';
    for (let r = 0; r < MERGE_KITCHEN_CONFIG.GRID_SIZE; r += 1) {
      for (let c = 0; c < MERGE_KITCHEN_CONFIG.GRID_SIZE; c += 1) {
        const val = this.state.grid[r][c];
        const coordKey = `${r},${c}`;
        if (val === 0) {
          cellsHtml += `<div class="mk-cell" data-row="${r}" data-col="${c}" data-val="0"></div>`;
        } else {
          const recipe = getRecipeByValue(val);
          const isMerged = mergedCoordSet.has(coordKey);
          const isSpawned = spawnedCoord === coordKey;
          const matchingTicketIdx = servableCellMap.get(coordKey);
          const isServableTile = matchingTicketIdx !== undefined;

          cellsHtml += `
            <div class="mk-cell" data-row="${r}" data-col="${c}" data-val="${val}">
              <div
                class="mk-tile ${isMerged ? 'mk-tile--merged' : ''} ${isSpawned ? 'mk-tile--spawned' : ''} ${isServableTile ? 'mk-tile--servable' : ''}"
                style="background:${recipe.bgGradient}; border-color:${recipe.borderColor}; color:${recipe.textColor};"
                ${isServableTile ? `data-action="serve-cell" data-ticket-index="${matchingTicketIdx}" data-row="${r}" data-col="${c}" title="Click to serve ${recipe.name} to Ticket #${matchingTicketIdx + 1}"` : ''}
              >
                <div class="mk-tile-top">
                  <span class="mk-tile-val">${recipe.value}</span>
                  <span class="mk-tile-tier">T${recipe.tier}</span>
                </div>
                <div class="mk-tile-icon">${recipe.svgIcon}</div>
                <div class="mk-tile-name">${recipe.shortName}</div>
                ${isServableTile ? `<span class="mk-tile-serve-pill">🔔 #${matchingTicketIdx + 1}</span>` : ''}
              </div>
            </div>
          `;
        }
      }
    }

    let overlayHtml = '';
    if (this.state.status === 'WON' && !this.state.keepPlaying) {
      overlayHtml = `
        <div class="mk-overlay" data-testid="victory-modal">
          <h2 class="mk-overlay-title">⭐⭐⭐ Michelin Star Victory!</h2>
          <p class="mk-overlay-desc">
            Bravo, Chef! You served <strong>${this.state.ordersServed} Customer Orders</strong> and crafted up to
            <strong>${highestRecipe.name} [${highestRecipe.value}]</strong> with a score of <strong>${this.state.score}</strong>!
          </p>
          <div class="mk-overlay-actions">
            <button type="button" class="mk-btn mk-btn--primary" data-action="keep-playing">
              Keep Cooking (Endless Service)
            </button>
            <button type="button" class="mk-btn" data-action="restart">
              New Dinner Service
            </button>
          </div>
        </div>
      `;
    } else if (this.state.status === 'LOST') {
      overlayHtml = `
        <div class="mk-overlay" data-testid="gameover-modal">
          <h2 class="mk-overlay-title">🍳 Kitchen Prep Locked Up!</h2>
          <p class="mk-overlay-desc">
            Every prep station is full, no adjacent ingredients can merge, and no active ticket matches a dish on the pass.
            Final Score: <strong>${this.state.score}</strong> · Orders Served: <strong>${this.state.ordersServed}</strong>.
          </p>
          <div class="mk-overlay-actions">
            <button type="button" class="mk-btn mk-btn--primary" data-action="restart">
              Try Another Service [R]
            </button>
          </div>
        </div>
      `;
    }

    const recipeChipsHtml = RECIPE_TIERS.map((r) => {
      const discovered = this.state.discoveredTiers.includes(r.tier);
      return `
        <div class="mk-recipe-chip ${discovered ? 'mk-recipe-chip--discovered' : ''}">
          <div class="mk-recipe-chip-icon">${r.svgIcon}</div>
          <div class="mk-recipe-chip-meta">
            <span class="mk-recipe-chip-name">T${r.tier} · ${r.shortName}</span>
            <span class="mk-recipe-chip-val">[${r.value}] · Serve +${r.baseServeScore}</span>
          </div>
        </div>
      `;
    }).join('');

    const calloutToneClass =
      this.statusBannerTone === 'blocked'
        ? 'mk-callout--blocked'
        : this.statusBannerTone === 'served'
          ? 'mk-callout--served'
          : '';

    root.innerHTML = `
      <div class="mk-shell">
        <header class="mk-header">
          <div class="mk-brand">
            <div class="mk-title-row">
              <h1 class="mk-title">Merge Kitchen</h1>
              <span class="mk-badge">2048 Bistro</span>
            </div>
            <p class="mk-subtitle">Slide &amp; merge up the 11-tier Recipe Chain · Serve Customer Tickets to free board space!</p>
          </div>
          <div class="mk-stats-row">
            <div class="mk-stat-box">
              <span class="mk-stat-label">Score</span>
              <span class="mk-stat-val" data-testid="score-value">${this.state.score}</span>
            </div>
            <div class="mk-stat-box">
              <span class="mk-stat-label">Best</span>
              <span class="mk-stat-val" data-testid="best-score-value">${this.profile.bestScore}</span>
            </div>
            <div class="mk-stat-box">
              <span class="mk-stat-label">Orders</span>
              <span class="mk-stat-val" data-testid="orders-served-value">${this.state.ordersServed}/${MERGE_KITCHEN_CONFIG.SHORT_GOAL_ORDERS}</span>
            </div>
            <div class="mk-stat-box mk-stat-box--rush">
              <span class="mk-stat-label">Rush Streak</span>
              <span class="mk-stat-val">${this.state.rushCombo}x (${rushMultiplier}x)</span>
            </div>
          </div>
        </header>

        <div class="mk-toolbar">
          <div class="mk-goal-bar">
            <div class="mk-goal-top">
              <span>⭐ Short Goal: Serve 10 Orders or Craft [1024] Grand Feast</span>
              <span>Top Dish: ${highestRecipe.shortName} [${highestRecipe.value}]</span>
            </div>
            <div class="mk-progress-track">
              <div class="mk-progress-fill" style="width:${orderProgressPct}%;"></div>
            </div>
          </div>
          <div class="mk-btn-group">
            <button type="button" class="mk-btn mk-btn--primary" data-action="restart">New Service [R]</button>
            <button type="button" class="mk-btn" data-action="toggle-recipes">${this.recipeDrawerOpen ? 'Hide Recipes' : 'Recipe Chain'}</button>
            <button type="button" class="mk-btn" data-action="toggle-sound">${this.profile.soundEnabled ? '🔊 SFX On' : '🔇 Muted'}</button>
            <button type="button" class="mk-btn" data-action="toggle-motion">${this.profile.reducedMotion ? 'Motion: Reduced' : 'Motion: Full'}</button>
            <button type="button" class="mk-btn" data-action="toggle-save">Save/Load</button>
          </div>
        </div>

        <section class="mk-rail-section" aria-label="Customer Order Rail">
          <div class="mk-rail-header">
            <span class="mk-rail-title">🛎️ Active Customer Order Rail (Serving Clears Dish Tile From Board!)</span>
            <span>Turns: ${this.state.turnCount}</span>
          </div>
          <div class="mk-tickets-grid">
            ${ticketsHtml}
          </div>
        </section>

        <div class="mk-callout ${calloutToneClass}" role="status" aria-live="polite">
          <span>${this.statusBannerText}</span>
        </div>

        <div class="mk-board-stage">
          <div class="mk-grid-wrapper" data-testid="prep-board">
            ${cellsHtml}
            ${overlayHtml}
          </div>

          <div class="mk-controls-bar">
            <div class="mk-dpad" role="group" aria-label="Directional Slide Controls">
              <div></div>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="UP" aria-label="Slide Up">▲</button>
              <div></div>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="LEFT" aria-label="Slide Left">◀</button>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="DOWN" aria-label="Slide Down">▼</button>
              <button type="button" class="mk-dpad-btn" data-action="slide" data-dir="RIGHT" aria-label="Slide Right">▶</button>
            </div>
            <div class="mk-controls-hint">
              <strong>Controls:</strong> Swipe board or press <code>Arrow Keys / WASD</code> to slide &amp; merge.<br/>
              Press <code>[1] [2] [3]</code> or click a glowing dish to plate &amp; free a cell!
            </div>
          </div>
        </div>

        ${
          this.recipeDrawerOpen
            ? `
          <section class="mk-drawer" aria-label="11-Tier Recipe Chain">
            <h2 class="mk-drawer-title">📖 11-Tier Bistro Recipe Chain (Discovered: ${this.state.discoveredTiers.length}/11)</h2>
            <div class="mk-recipe-chain">
              ${recipeChipsHtml}
            </div>
          </section>
        `
            : ''
        }

        ${
          this.saveDrawerOpen
            ? `
          <section class="mk-drawer" aria-label="Save Export and Import">
            <h2 class="mk-drawer-title">💾 Save Export / Import (Autosaved on Every Move)</h2>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <textarea id="mk-save-textarea" rows="3" style="width:100%; background:#140d0a; color:#fde68a; border:1px solid #4c3628; border-radius:6px; padding:6px; font-family:monospace; font-size:0.7rem;">${exportSaveString(this.state, this.profile)}</textarea>
              <div class="mk-btn-group">
                <button type="button" class="mk-btn mk-btn--primary" data-action="import-save">Import JSON Save</button>
              </div>
            </div>
          </section>
        `
            : ''
        }

        ${
          this.debugOpen
            ? `
          <section class="mk-debug-panel" data-testid="debug-panel">
            <div><strong>[DEBUG INSPECTOR]</strong> Seed: ${this.state.rng.seed} · RNG Calls: ${this.state.rng.calls} · Status: ${this.state.status}</div>
            <div>Empty Cells: ${this.state.grid.flat().filter((v) => v === 0).length} · Servable Tickets: ${servableMatches.length}</div>
            <div class="mk-btn-group">
              <button type="button" class="mk-btn" data-action="debug-seed">Reset Seed 204807</button>
              <button type="button" class="mk-btn" data-action="toggle-debug">Close Debug</button>
            </div>
          </section>
        `
            : ''
        }
      </div>
    `;

    this.bindEvents(root);
  }

  private bindEvents(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = el.dataset.action;
        if (action === 'slide') {
          const dir = el.dataset.dir as SlideDirection;
          this.dispatch({ type: 'SLIDE', direction: dir });
        } else if (action === 'serve-ticket') {
          const idx = Number(el.dataset.ticketIndex);
          this.dispatch({ type: 'SERVE_ORDER', ticketIndex: idx });
        } else if (action === 'serve-cell') {
          const idx = Number(el.dataset.ticketIndex);
          const row = Number(el.dataset.row);
          const col = Number(el.dataset.col);
          this.dispatch({ type: 'SERVE_ORDER', ticketIndex: idx, row, col });
        } else if (action === 'restart') {
          this.dispatch({ type: 'RESTART' });
        } else if (action === 'keep-playing') {
          this.dispatch({ type: 'KEEP_PLAYING' });
        } else if (action === 'toggle-recipes') {
          this.recipeDrawerOpen = !this.recipeDrawerOpen;
          this.render();
        } else if (action === 'toggle-sound') {
          this.profile.soundEnabled = !this.profile.soundEnabled;
          this.audio.setEnabled(this.profile.soundEnabled);
          saveProfile(this.profile);
          this.render();
        } else if (action === 'toggle-motion') {
          this.profile.reducedMotion = !this.profile.reducedMotion;
          saveProfile(this.profile);
          this.render();
        } else if (action === 'toggle-save') {
          this.saveDrawerOpen = !this.saveDrawerOpen;
          this.render();
        } else if (action === 'import-save') {
          const textarea = root.querySelector('#mk-save-textarea') as HTMLTextAreaElement | null;
          if (textarea) {
            const res = importSaveString(textarea.value.trim());
            if (res.ok) {
              this.state = res.state;
              if (res.profile) {
                this.profile = res.profile;
                saveProfile(this.profile);
              }
              saveGameState(this.state);
              this.statusBannerTone = 'served';
              this.statusBannerText = 'Save state imported successfully!';
              this.render();
            } else {
              this.statusBannerTone = 'blocked';
              this.statusBannerText = res.error;
              this.render();
            }
          }
        } else if (action === 'debug-seed') {
          this.restartWithSeed(MERGE_KITCHEN_CONFIG.DEFAULT_SEED);
        } else if (action === 'toggle-debug') {
          this.toggleDebug(false);
        }
      });
    });

    const board = root.querySelector('.mk-grid-wrapper') as HTMLElement | null;
    if (board) {
      board.addEventListener(
        'touchstart',
        (e: TouchEvent) => {
          if (e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );

      board.addEventListener(
        'touchend',
        (e: TouchEvent) => {
          if (e.changedTouches.length === 0) return;
          const dx = e.changedTouches[0].clientX - this.touchStartX;
          const dy = e.changedTouches[0].clientY - this.touchStartY;
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);
          if (Math.max(absX, absY) < 24) {
            return;
          }
          if (absX > absY) {
            this.dispatch({ type: 'SLIDE', direction: dx > 0 ? 'RIGHT' : 'LEFT' });
          } else {
            this.dispatch({ type: 'SLIDE', direction: dy > 0 ? 'DOWN' : 'UP' });
          }
        },
        { passive: true }
      );
    }
  }
}
