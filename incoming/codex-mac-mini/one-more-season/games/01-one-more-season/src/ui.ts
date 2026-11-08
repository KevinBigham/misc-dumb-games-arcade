import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  AttributeKey,
  computeEffectiveMultiplier,
  computeEffectiveStat,
  computeStarterPostMatchFatigueDelta,
  CONFIG,
  TACTICAL_PLAN_IDS,
  TacticalPlanId,
} from './config.ts';
import {
  getOpponentForFixture,
  getTacticalPlanDefinition,
  OpponentClub,
  TACTICAL_PLANS,
} from './content.ts';
import { SoundController } from './audio.ts';
import {
  clearSavedState,
  loadStateFromStorage,
  parseSaveEnvelope,
  saveStateToStorage,
  serializeSaveEnvelope,
} from './persistence.ts';
import {
  applyCommand,
  computePossessionProbabilities,
  computeTeamEffectiveRatings,
  createInitialState,
  GameCommand,
  GameState,
  getSeasonSummary,
  PossessionEvent,
} from './simulation.ts';

export interface OneMoreSeasonUIOptions {
  initialSeed?: number;
  debug?: boolean;
}

export class OneMoreSeasonUI {
  private container: HTMLElement;
  private state: GameState;
  private debugMode: boolean;
  private sound: SoundController;
  private statusToast: { text: string; kind: 'info' | 'warn' | 'good' } | null =
    null;
  private selectedPossessionIdx = 16; // 1..16 revealed during playback
  private inspectedPossessionIdx = 1; // 1..16 focused in detail view
  private playbackTimer: number | null = null;
  private isPlayingBack = false;
  private showSaveModal = false;
  private importBuffer = '';
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, options?: OneMoreSeasonUIOptions) {
    this.container = container;
    this.debugMode = Boolean(options?.debug);
    this.sound = new SoundController();

    if (options?.initialSeed !== undefined) {
      this.state = createInitialState(options.initialSeed);
      saveStateToStorage(this.state);
    } else {
      const loaded = loadStateFromStorage(CONFIG.defaultSeed);
      this.state = loaded.state;
      if (loaded.recoveredFromError) {
        this.statusToast = {
          text: `Recovered from invalid save data (${loaded.recoveredFromError}). Started fresh season.`,
          kind: 'warn',
        };
      }
    }

    if (this.state.currentMatch) {
      this.selectedPossessionIdx = this.state.currentMatch.possessions.length;
      const firstDecisive =
        this.state.currentMatch.decisiveEvents[0]?.possessionIndex ?? 1;
      this.inspectedPossessionIdx = firstDecisive;
    }

    this.keydownHandler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.toggleDebug();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keydownHandler);
    }

    this.injectStyles();
    this.render();
  }

  public destroy(): void {
    this.stopPlayback();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    this.container.innerHTML = '';
  }

  public getStateSnapshot(): GameState {
    return JSON.parse(JSON.stringify(this.state)) as GameState;
  }

  public restartWithSeed(seed: number): void {
    this.stopPlayback();
    this.state = createInitialState(seed);
    clearSavedState();
    saveStateToStorage(this.state);
    this.statusToast = {
      text: `Started new 6-fixture season with Seed #${this.state.seed}.`,
      kind: 'good',
    };
    this.render();
  }

  public toggleDebug(force?: boolean): void {
    this.debugMode = force !== undefined ? force : !this.debugMode;
    this.sound.playClick(640);
    this.render();
  }

  private dispatch(command: GameCommand, toastText?: string): void {
    try {
      this.state = applyCommand(this.state, command);
      saveStateToStorage(this.state);
      if (toastText) {
        this.statusToast = { text: toastText, kind: 'good' };
      } else {
        this.statusToast = null;
      }

      if (command.type === 'COMMIT_MATCH') {
        this.sound.playWhistle();
        this.startAnimatedPlayback();
        return;
      } else {
        this.sound.playClick();
      }

      this.render();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.statusToast = { text: msg, kind: 'warn' };
      this.render();
    }
  }

  private startAnimatedPlayback(): void {
    this.stopPlayback();
    if (!this.state.currentMatch) {
      this.render();
      return;
    }
    this.isPlayingBack = true;
    this.selectedPossessionIdx = 1;
    this.inspectedPossessionIdx = 1;
    this.render();

    const firstPos = this.state.currentMatch.possessions[0];
    if (firstPos) {
      this.sound.playPossessionChime(firstPos.team, firstPos.points);
    }

    if (typeof window !== 'undefined') {
      this.playbackTimer = window.setInterval(() => {
        if (!this.state.currentMatch) {
          this.stopPlayback();
          return;
        }
        if (this.selectedPossessionIdx < CONFIG.totalPossessions) {
          this.selectedPossessionIdx += 1;
          this.inspectedPossessionIdx = this.selectedPossessionIdx;
          const pos =
            this.state.currentMatch.possessions[this.selectedPossessionIdx - 1];
          if (pos) {
            this.sound.playPossessionChime(pos.team, pos.points);
          }
          this.render();
        } else {
          this.stopPlayback();
          const firstDecisive =
            this.state.currentMatch.decisiveEvents[0]?.possessionIndex ?? 16;
          this.inspectedPossessionIdx = firstDecisive;
          this.sound.playWhistle();
          this.render();
        }
      }, 280);
    }
  }

  private stopPlayback(): void {
    if (this.playbackTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.playbackTimer);
    }
    this.playbackTimer = null;
    this.isPlayingBack = false;
  }

  private skipToFullTime(): void {
    this.stopPlayback();
    this.selectedPossessionIdx = CONFIG.totalPossessions;
    if (this.state.currentMatch) {
      this.inspectedPossessionIdx =
        this.state.currentMatch.decisiveEvents[0]?.possessionIndex ?? 16;
    }
    this.sound.playWhistle();
    this.render();
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById('oms-game01-styles')) return;

    const style = document.createElement('style');
    style.id = 'oms-game01-styles';
    style.textContent = `
      .oms-root {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: radial-gradient(circle at top, #13221d 0%, #0b1411 55%, #070c0a 100%);
        color: #f1f5f9;
        min-height: 100%;
        padding: 14px;
        box-sizing: border-box;
      }
      .oms-shell {
        max-width: 1240px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .oms-topbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        background: rgba(15, 29, 24, 0.92);
        border: 1px solid rgba(52, 211, 153, 0.28);
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
      .oms-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .oms-crest {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
      }
      .oms-title-group h1 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #ecfdf5;
      }
      .oms-title-group p {
        margin: 2px 0 0;
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .oms-record-pills {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .oms-pill {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 999px;
        padding: 5px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #e2e8f0;
      }
      .oms-pill.accent {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(52, 211, 153, 0.45);
        color: #6ee7b7;
      }
      .oms-pill.warn {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(251, 191, 36, 0.45);
        color: #fde68a;
      }
      .oms-btn {
        cursor: pointer;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: #1e293b;
        color: #f8fafc;
        border-radius: 8px;
        padding: 6px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        transition: all 0.14s ease;
      }
      .oms-btn:hover:not(:disabled) {
        background: #334155;
        border-color: #94a3b8;
      }
      .oms-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }
      .oms-btn.primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: #34d399;
        color: #022c22;
        font-weight: 800;
      }
      .oms-btn.primary:hover:not(:disabled) {
        filter: brightness(1.08);
      }
      .oms-btn.amber {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(251, 191, 36, 0.55);
        color: #fde68a;
      }
      .oms-btn.sky {
        background: rgba(14, 165, 233, 0.2);
        border-color: rgba(56, 189, 248, 0.55);
        color: #bae6fd;
      }
      .oms-toast {
        padding: 9px 14px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .oms-toast.good {
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(52, 211, 153, 0.45);
        color: #a7f3d0;
      }
      .oms-toast.warn {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(251, 191, 36, 0.5);
        color: #fde68a;
      }
      .oms-toast.info {
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(96, 165, 250, 0.45);
        color: #bfdbfe;
      }
      .oms-fixture-track {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
      }
      .oms-fixture-step {
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 8px;
        padding: 7px 9px;
        font-size: 0.74rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .oms-fixture-step.current {
        border-color: #34d399;
        background: rgba(16, 185, 129, 0.14);
      }
      .oms-badge-w { color: #34d399; font-weight: 800; }
      .oms-badge-d { color: #fbbf24; font-weight: 800; }
      .oms-badge-l { color: #f87171; font-weight: 800; }
      .oms-main-grid {
        display: grid;
        grid-template-columns: 1.08fr 0.92fr;
        gap: 14px;
      }
      @media (max-width: 960px) {
        .oms-main-grid {
          grid-template-columns: 1fr;
        }
        .oms-fixture-track {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .oms-panel {
        background: rgba(15, 25, 22, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .oms-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        padding-bottom: 8px;
      }
      .oms-panel-header h2 {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .oms-scouting-box {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        padding: 11px 13px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .oms-roster-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-player-card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-player-card.starter {
        border-color: rgba(52, 211, 153, 0.55);
        background: rgba(6, 78, 59, 0.24);
      }
      .oms-player-card.tired-warn {
        border-color: rgba(251, 191, 36, 0.65);
      }
      .oms-player-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .oms-role-tag {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        background: #334155;
        color: #e2e8f0;
      }
      .oms-role-tag.FWD { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
      .oms-role-tag.MID { background: rgba(59, 130, 246, 0.25); color: #93c5fd; }
      .oms-role-tag.DEF { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; }
      .oms-role-tag.UTL { background: rgba(168, 85, 247, 0.25); color: #d8b4fe; }
      .oms-stats-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
        font-size: 0.75rem;
      }
      .oms-stat-chip {
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 6px;
        padding: 4px 6px;
        text-align: center;
      }
      .oms-stat-chip .eff {
        color: #34d399;
        font-weight: 700;
      }
      .oms-fatigue-bar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.74rem;
      }
      .oms-fatigue-bar {
        flex: 1;
        height: 7px;
        background: #1e293b;
        border-radius: 999px;
        overflow: hidden;
      }
      .oms-fatigue-fill {
        height: 100%;
        border-radius: 999px;
      }
      .oms-prep-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: center;
      }
      .oms-plan-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      @media (max-width: 600px) {
        .oms-plan-grid {
          grid-template-columns: 1fr;
        }
      }
      .oms-plan-card {
        cursor: pointer;
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 9px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: all 0.14s ease;
      }
      .oms-plan-card.selected {
        border-color: #34d399;
        background: rgba(16, 185, 129, 0.18);
        box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.4);
      }
      .oms-pitch-canvas {
        width: 100%;
        height: 250px;
        border-radius: 10px;
        border: 1px solid rgba(52, 211, 153, 0.35);
        background: #0d3b29;
        display: block;
      }
      .oms-possession-strip {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 6px;
      }
      .oms-pos-pill {
        cursor: pointer;
        border-radius: 7px;
        padding: 6px 4px;
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(15, 23, 42, 0.85);
      }
      .oms-pos-pill.active {
        outline: 2px solid #f8fafc;
      }
      .oms-pos-pill.club-7 { background: rgba(16, 185, 129, 0.32); border-color: #34d399; color: #a7f3d0; }
      .oms-pos-pill.club-3 { background: rgba(16, 185, 129, 0.16); border-color: rgba(52, 211, 153, 0.45); color: #6ee7b7; }
      .oms-pos-pill.club-0 { background: rgba(30, 41, 59, 0.7); color: #94a3b8; }
      .oms-pos-pill.opp-7 { background: rgba(239, 68, 68, 0.32); border-color: #f87171; color: #fecaca; }
      .oms-pos-pill.opp-3 { background: rgba(245, 158, 11, 0.22); border-color: #fbbf24; color: #fde68a; }
      .oms-pos-pill.opp-0 { background: rgba(16, 185, 129, 0.12); color: #cbd5e1; }
      .oms-decisive-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .oms-decisive-card {
        background: rgba(15, 23, 42, 0.85);
        border-left: 4px solid #34d399;
        border-radius: 8px;
        padding: 10px 12px;
      }
      .oms-debug-panel {
        background: rgba(9, 13, 22, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.45);
        border-radius: 10px;
        padding: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.74rem;
        overflow-x: auto;
      }
      .oms-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.74rem;
      }
      .oms-table th, .oms-table td {
        padding: 5px 7px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        text-align: left;
      }
      .oms-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 16px;
      }
      .oms-modal {
        background: #0f172a;
        border: 1px solid rgba(52, 211, 153, 0.45);
        border-radius: 12px;
        max-width: 640px;
        width: 100%;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .oms-textarea {
        width: 100%;
        min-height: 160px;
        background: #020617;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 8px;
        font-family: monospace;
        font-size: 0.74rem;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  private render(): void {
    const summary = getSeasonSummary(this.state);
    const opponent = getOpponentForFixture(this.state.fixtureNumber);

    this.container.innerHTML = `
      <div class="oms-root" data-game-id="01-one-more-season" data-phase="${this.state.phase}">
        <div class="oms-shell">
          ${this.renderTopBar(summary)}
          ${this.statusToast ? `<div class="oms-toast ${this.statusToast.kind}"><span>${this.escapeHtml(this.statusToast.text)}</span><button class="oms-btn" data-action="dismiss-toast">✕</button></div>` : ''}
          ${this.renderFixtureTrack()}
          ${this.state.phase === 'preparation' ? this.renderPreparationView(opponent) : ''}
          ${this.state.phase === 'match_review' ? this.renderMatchReviewView(opponent) : ''}
          ${this.state.phase === 'development' ? this.renderDevelopmentView(opponent) : ''}
          ${this.state.phase === 'season_recap' ? this.renderSeasonRecapView(summary) : ''}
          ${this.debugMode ? this.renderDebugInspector(opponent) : ''}
          ${this.showSaveModal ? this.renderSaveModal() : ''}
        </div>
      </div>
    `;

    this.drawPitchCanvas(opponent);
    this.bindEvents();
  }

  private renderTopBar(summary: ReturnType<typeof getSeasonSummary>): string {
    return `
      <header class="oms-topbar">
        <div class="oms-brand">
          <svg class="oms-crest" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M8 10 L32 4 L56 10 L56 34 C56 48 32 58 32 60 C32 58 8 48 8 34 Z" fill="#065f46" stroke="#34d399" stroke-width="3"/>
            <circle cx="32" cy="30" r="11" fill="#10b981" opacity="0.25"/>
            <path d="M22 36 L32 18 L42 36 Z" fill="#fbbf24"/>
          </svg>
          <div class="oms-title-group">
            <h1>${CONFIG.clubName} — One More Season</h1>
            <p>Five-a-Side Club Management • Win ≥ ${CONFIG.seasonWinTarget} of ${CONFIG.seasonFixtures} Fixtures (Draws = 0 Wins)</p>
          </div>
        </div>
        <div class="oms-record-pills">
          <span class="oms-pill accent" data-testid="season-record">Record: ${summary.wins}W - ${summary.draws}D - ${summary.losses}L</span>
          <span class="oms-pill ${summary.wins >= CONFIG.seasonWinTarget ? 'accent' : 'warn'}">Target: ${summary.wins}/${CONFIG.seasonWinTarget} Wins</span>
          <span class="oms-pill">Fixture ${this.state.fixtureNumber}/${CONFIG.seasonFixtures}</span>
          <span class="oms-pill">Seed #${this.state.seed}</span>
          <button class="oms-btn ${this.debugMode ? 'sky' : ''}" data-action="toggle-debug" title="Keyboard shortcut: [D]">
            ${this.debugMode ? 'Hide [D] Math' : '[D] Math Inspector'}
          </button>
          <button class="oms-btn" data-action="toggle-mute">
            ${this.sound.isMuted() ? '🔇 Muted' : '🔊 Audio'}
          </button>
          <button class="oms-btn" data-action="open-save-modal">Save / Seed</button>
        </div>
      </header>
    `;
  }

  private renderFixtureTrack(): string {
    const items: string[] = [];
    for (let f = 1; f <= CONFIG.seasonFixtures; f++) {
      const opp = getOpponentForFixture(f);
      const historyMatch = this.state.seasonHistory.find(
        (m) => m.fixtureNumber === f,
      );
      const isCurrent =
        f === this.state.fixtureNumber && this.state.phase !== 'season_recap';
      let resultBadge = `<span style="color:#64748b">Upcoming</span>`;
      if (historyMatch) {
        const cls =
          historyMatch.outcome === 'W'
            ? 'oms-badge-w'
            : historyMatch.outcome === 'D'
              ? 'oms-badge-d'
              : 'oms-badge-l';
        resultBadge = `<span class="${cls}">${historyMatch.outcome} ${historyMatch.clubScore}–${historyMatch.opponentScore}</span>`;
      }
      items.push(`
        <div class="oms-fixture-step ${isCurrent ? 'current' : ''}">
          <div>
            <strong>F${f}: ${opp.shortName}</strong>
            <div style="font-size:0.68rem;color:#94a3b8">${opp.tendency.vulnerableTo} weak</div>
          </div>
          ${resultBadge}
        </div>
      `);
    }
    return `<section class="oms-fixture-track">${items.join('')}</section>`;
  }

  private renderPreparationView(opponent: OpponentClub): string {
    const teamRatings = computeTeamEffectiveRatings(
      this.state.roster,
      this.state.selectedStarterIds,
    );
    const clubOdds = computePossessionProbabilities({
      team: 'club',
      clubPlan: this.state.selectedPlan,
      teamRatings,
      opponent,
    });
    const oppOdds = computePossessionProbabilities({
      team: 'opponent',
      clubPlan: this.state.selectedPlan,
      teamRatings,
      opponent,
    });

    const starters = this.state.roster.filter((p) =>
      this.state.selectedStarterIds.includes(p.id),
    );
    const reserves = this.state.roster.filter(
      (p) => !this.state.selectedStarterIds.includes(p.id),
    );

    const tiredStarters = starters.filter((p) => p.fatigue >= 40);

    return `
      <div class="oms-main-grid">
        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>1. Squad Selection & Preparation (${this.state.prepPointsRemaining}/${CONFIG.prepPointsPerFixture} Prep Points Left)</h2>
            <div style="display:flex;gap:6px;align-items:center">
              ${
                this.state.prepActionsThisFixture.length > 0
                  ? `<button class="oms-btn" data-action="reset-prep">Undo Prep (${this.state.prepActionsThisFixture.length})</button>`
                  : ''
              }
            </div>
          </div>

          <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.4">
            Choose <strong>5 starters</strong> (gain <code>24 - Stamina</code> fatigue after match) and <strong>3 reserves</strong> (recover <code>-18</code> fatigue).
            Spend up to <strong>2 Prep Points</strong> (max 1 per player): <strong>Rest (-24 Fatigue)</strong> or <strong>Train (+1 Stat, +8 Fatigue)</strong>.
          </div>

          ${
            tiredStarters.length > 0
              ? `<div class="oms-toast warn" style="padding:7px 11px">
                  <span>⚠️ Starter Fatigue Alert: ${tiredStarters.map((p) => `${p.name} (${p.fatigue}% fatigue → ${(computeEffectiveMultiplier(p.fatigue) * 100).toFixed(0)}% eff.)`).join(', ')}. Consider Resting (-24) or swapping in a fresh Reserve!</span>
                </div>`
              : ''
          }

          <div style="font-size:0.8rem;font-weight:700;color:#6ee7b7">Starting Lineup (5 of 8)</div>
          <div class="oms-roster-list">
            ${starters.map((p) => this.renderPlayerCard(p, true, reserves)).join('')}
          </div>

          <div style="font-size:0.8rem;font-weight:700;color:#94a3b8;margin-top:4px">Bench Reserves (3 of 8 — Auto-Rest -18 Fatigue After Match)</div>
          <div class="oms-roster-list">
            ${reserves.map((p) => this.renderPlayerCard(p, false, starters)).join('')}
          </div>
        </div>

        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>2. Fixture ${this.state.fixtureNumber} Scouting & Tactical Plan</h2>
            <span class="oms-pill warn">Tendency: ${opponent.tendency.name}</span>
          </div>

          <div class="oms-scouting-box">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <strong style="font-size:0.95rem;color:#fef3c7">vs ${opponent.name} (${opponent.nickname})</strong>
              <span style="font-size:0.76rem;color:#fde68a">Vulnerable to: <strong>${opponent.tendency.vulnerableTo}</strong></span>
            </div>
            <div style="font-size:0.8rem;color:#e2e8f0;line-height:1.45">${opponent.scoutingReport}</div>
            <div style="font-size:0.76rem;color:#6ee7b7;font-weight:600">${opponent.tacticalHint}</div>
            <div style="display:flex;gap:12px;font-size:0.75rem;color:#94a3b8;margin-top:2px">
              <span>Opp Attack: <strong>${opponent.attack}</strong></span>
              <span>Opp Defense: <strong>${opponent.defense}</strong></span>
              <span>Opp Control: <strong>${opponent.control}</strong></span>
              <span>Opp Base Style: <strong>${opponent.defaultPlan}</strong></span>
            </div>
          </div>

          <canvas id="oms-pitch-canvas" class="oms-pitch-canvas" width="600" height="260"></canvas>

          <div style="font-size:0.82rem;font-weight:700;color:#f8fafc">Choose Tactical Plan (8 Possessions Each)</div>
          <div class="oms-plan-grid">
            ${TACTICAL_PLANS.map((plan) => {
              const selected = this.state.selectedPlan === plan.id;
              const mod = opponent.tendency.clubPlanModifier[plan.id];
              const modStr =
                mod >= 0
                  ? `+${(mod * 100).toFixed(0)}%`
                  : `${(mod * 100).toFixed(0)}%`;
              return `
                <div class="oms-plan-card ${selected ? 'selected' : ''}" data-action="select-plan" data-plan="${plan.id}">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <strong>${plan.id}</strong>
                    <span class="oms-pill ${mod > 0.05 ? 'accent' : mod < 0 ? 'warn' : ''}" style="padding:2px 7px;font-size:0.7rem">
                      Tendency ${modStr}
                    </span>
                  </div>
                  <div style="font-size:0.72rem;color:#cbd5e1">${plan.description}</div>
                  <div style="font-size:0.7rem;color:#94a3b8">
                    Base: 0pt ${(plan.baseDistribution.p0 * 100).toFixed(0)}% • 3pt ${(plan.baseDistribution.p3 * 100).toFixed(0)}% • 7pt ${(plan.baseDistribution.p7 * 100).toFixed(0)}%
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(52,211,153,0.3);border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem">
              <span><strong>Live Possession Odds Preview</strong> (${this.state.selectedPlan})</span>
              <span style="color:#6ee7b7">Shift: ${clubOdds.totalShift >= 0 ? '+' : ''}${(clubOdds.totalShift * 100).toFixed(1)}% (Cap ±15%)</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.75rem">
              <div>
                <div style="color:#94a3b8;margin-bottom:2px">Ironvale Attack (${teamRatings.effectiveAttack.toFixed(1)} ATK + ${teamRatings.effectiveControl.toFixed(1)} CTL vs ${opponent.defense + opponent.control})</div>
                <div>0 pts: <strong>${(clubOdds.probabilities.p0 * 100).toFixed(1)}%</strong> • 3 pts: <strong>${(clubOdds.probabilities.p3 * 100).toFixed(1)}%</strong> • 7 pts: <strong style="color:#34d399">${(clubOdds.probabilities.p7 * 100).toFixed(1)}%</strong></div>
              </div>
              <div>
                <div style="color:#94a3b8;margin-bottom:2px">${opponent.shortName} Attack (${opponent.attack + opponent.control} vs Ironvale ${teamRatings.effectiveDefense.toFixed(1)} DEF + ${teamRatings.effectiveControl.toFixed(1)} CTL)</div>
                <div>0 pts: <strong>${(oppOdds.probabilities.p0 * 100).toFixed(1)}%</strong> • 3 pts: <strong>${(oppOdds.probabilities.p3 * 100).toFixed(1)}%</strong> • 7 pts: <strong style="color:#f87171">${(oppOdds.probabilities.p7 * 100).toFixed(1)}%</strong></div>
              </div>
            </div>
          </div>

          <button class="oms-btn primary" style="padding:12px;font-size:0.95rem" data-action="commit-match" data-testid="commit-match-btn">
            ⚽ Commit Lineup & Kick Off Fixture ${this.state.fixtureNumber} (16 Possessions)
          </button>
        </div>
      </div>
    `;
  }

  private renderPlayerCard(
    p: GameState['roster'][number],
    isStarter: boolean,
    swapTargets: GameState['roster'],
  ): string {
    const mult = computeEffectiveMultiplier(p.fatigue);
    const effAtk = computeEffectiveStat(p.attack, p.fatigue);
    const effDef = computeEffectiveStat(p.defense, p.fatigue);
    const effCtl = computeEffectiveStat(p.control, p.fatigue);
    const alreadyPrepped = this.state.prepActionsThisFixture.find(
      (a) => a.playerId === p.id,
    );
    const canSpendPrep =
      this.state.prepPointsRemaining > 0 && !alreadyPrepped;

    const fatigueColor =
      p.fatigue >= 45 ? '#f59e0b' : p.fatigue >= 25 ? '#38bdf8' : '#10b981';

    return `
      <div class="oms-player-card ${isStarter ? 'starter' : ''} ${isStarter && p.fatigue >= 45 ? 'tired-warn' : ''}" data-player-id="${p.id}">
        <div class="oms-player-top">
          <div style="display:flex;align-items:center;gap:7px">
            <span class="oms-role-tag ${p.role}">${p.role}</span>
            <strong>#${p.number} ${p.name}</strong>
            <span style="font-size:0.72rem;color:#94a3b8">(${p.roleTitle})</span>
            ${
              alreadyPrepped
                ? `<span class="oms-pill accent" style="padding:1px 7px;font-size:0.68rem">Prepped: ${alreadyPrepped.kind === 'rest' ? 'Rested -24' : `Trained +1 ${alreadyPrepped.attribute}`}</span>`
                : ''
            }
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${
              isStarter
                ? `<select class="oms-btn" style="padding:3px 7px;font-size:0.72rem" data-action="swap-starter-select" data-starter-id="${p.id}" aria-label="Swap starter ${p.name}">
                    <option value="">Swap with Reserve...</option>
                    ${swapTargets.map((r) => `<option value="${r.id}">⇄ #${r.number} ${r.name} (${r.role}, Fat ${r.fatigue}%)</option>`).join('')}
                  </select>`
                : `<button class="oms-btn" style="padding:3px 8px;font-size:0.72rem" data-action="quick-sub-in" data-reserve-id="${p.id}">
                    Sub In for Most Tired Starter
                  </button>`
            }
          </div>
        </div>

        <div class="oms-stats-row">
          <div class="oms-stat-chip" title="Effective Attack = Attack × (1 - Fatigue/200)">
            ATK <strong>${p.attack}</strong> <span class="eff">(${effAtk.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Effective Defense = Defense × (1 - Fatigue/200)">
            DEF <strong>${p.defense}</strong> <span class="eff">(${effDef.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Effective Control = Control × (1 - Fatigue/200)">
            CTL <strong>${p.control}</strong> <span class="eff">(${effCtl.toFixed(1)})</span>
          </div>
          <div class="oms-stat-chip" title="Stamina reduces post-match starter fatigue gain (24 - Stamina)">
            STA <strong>${p.stamina}</strong> <span style="color:#94a3b8">(+${computeStarterPostMatchFatigueDelta(p.stamina)}/gm)</span>
          </div>
        </div>

        <div class="oms-fatigue-bar-wrap">
          <span>Fatigue: <strong>${p.fatigue}%</strong> (${(mult * 100).toFixed(1)}% eff.)</span>
          <div class="oms-fatigue-bar">
            <div class="oms-fatigue-fill" style="width:${p.fatigue}%;background:${fatigueColor}"></div>
          </div>
        </div>

        <div class="oms-prep-actions">
          <button class="oms-btn amber" style="padding:3px 8px;font-size:0.71rem"
            data-action="prep-rest" data-player-id="${p.id}"
            ${!canSpendPrep || p.fatigue === 0 ? 'disabled' : ''}>
            Rest (-24 Fat)
          </button>
          ${ATTRIBUTE_KEYS.map(
            (attr) => `
            <button class="oms-btn sky" style="padding:3px 7px;font-size:0.71rem"
              data-action="prep-train" data-player-id="${p.id}" data-attr="${attr}"
              ${!canSpendPrep || p[attr] >= CONFIG.maxAttribute ? 'disabled' : ''}>
              +1 ${ATTRIBUTE_LABELS[attr].slice(0, 3).toUpperCase()} (+8 Fat)
            </button>
          `,
          ).join('')}
        </div>
      </div>
    `;
  }

  private renderMatchReviewView(opponent: OpponentClub): string {
    const match = this.state.currentMatch;
    if (!match) return '';

    const visiblePossessions = match.possessions.slice(
      0,
      this.selectedPossessionIdx,
    );
    const lastVisible =
      visiblePossessions[visiblePossessions.length - 1] ??
      match.possessions[0]!;
    const inspected =
      match.possessions[
        Math.min(this.inspectedPossessionIdx, this.selectedPossessionIdx) - 1
      ] ?? lastVisible;

    const outcomeLabel =
      match.outcome === 'W'
        ? 'VICTORY (+1 Win Toward Target)'
        : match.outcome === 'D'
          ? 'DRAW (0 Wins Toward Target)'
          : 'DEFEAT (0 Wins Toward Target)';

    return `
      <div class="oms-main-grid">
        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>Fixture ${match.fixtureNumber} Tactical Playback — ${CONFIG.clubName} vs ${match.opponentName}</h2>
            <div style="display:flex;gap:6px">
              ${
                this.selectedPossessionIdx < CONFIG.totalPossessions
                  ? `<button class="oms-btn" data-action="step-possession">Step +1 (${this.selectedPossessionIdx}/16)</button>
                     <button class="oms-btn primary" data-action="skip-playback">Full Time (All 16)</button>`
                  : `<span class="oms-pill accent">Full Time (16/16 Possessions)</span>`
              }
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(15,23,42,0.9);padding:12px 16px;border-radius:10px;border:1px solid rgba(52,211,153,0.3)">
            <div>
              <div style="font-size:0.75rem;color:#94a3b8">${CONFIG.clubName} (${match.clubPlan})</div>
              <div style="font-size:1.65rem;font-weight:900;color:#34d399" data-testid="match-club-score">${lastVisible.clubScoreAfter}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:0.75rem;color:#cbd5e1">Possession ${lastVisible.possessionIndex} of 16 (Half ${lastVisible.half})</div>
              <div style="font-size:0.86rem;font-weight:800;color:#fbbf24">${this.selectedPossessionIdx === 16 ? outcomeLabel : 'Match in Progress...'}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.75rem;color:#94a3b8">${match.opponentName} (${match.opponentPlan})</div>
              <div style="font-size:1.65rem;font-weight:900;color:#f87171" data-testid="match-opp-score">${lastVisible.opponentScoreAfter}</div>
            </div>
          </div>

          <canvas id="oms-pitch-canvas" class="oms-pitch-canvas" width="600" height="260"></canvas>

          <div style="font-size:0.78rem;font-weight:700;color:#cbd5e1">16-Possession Timeline (Click any possession to inspect roll & math)</div>
          <div class="oms-possession-strip">
            ${match.possessions.map((pos) => {
              const revealed = pos.possessionIndex <= this.selectedPossessionIdx;
              if (!revealed) {
                return `<div class="oms-pos-pill" style="opacity:0.3">#${pos.possessionIndex}<br/>—</div>`;
              }
              const cls = `${pos.team === 'club' ? 'club' : 'opp'}-${pos.points}`;
              const active = pos.possessionIndex === inspected.possessionIndex;
              return `
                <button class="oms-pos-pill ${cls} ${active ? 'active' : ''}"
                  data-action="inspect-possession" data-pos-idx="${pos.possessionIndex}">
                  #${pos.possessionIndex} ${pos.team === 'club' ? 'IRV' : match.opponentShortName}<br/>
                  +${pos.points} pts
                </button>
              `;
            }).join('')}
          </div>

          <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.25);border-radius:8px;padding:10px 12px;font-size:0.78rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <strong>Possession #${inspected.possessionIndex} Breakdown (${inspected.team === 'club' ? CONFIG.clubName : match.opponentName} — ${inspected.tacticalPlanUsed})</strong>
              <span class="oms-pill">${inspected.points} Points Scored</span>
            </div>
            <div style="color:#cbd5e1">
              Actors: <strong>${inspected.keyPlayerName}</strong> (${inspected.keyPlayerFatigue}% fatigue) & <strong>${inspected.supportPlayerName}</strong> •
              Offense <code>${inspected.offenseRating.toFixed(1)}</code> vs Defense <code>${inspected.defenseRating.toFixed(1)}</code> •
              Attr Shift <code>${(inspected.attributeShift * 100).toFixed(1)}%</code> + Tendency <code>${(inspected.tendencyShift * 100).toFixed(1)}%</code> =
              Total Shift <strong>${inspected.totalShift >= 0 ? '+' : ''}${(inspected.totalShift * 100).toFixed(1)}%</strong>
            </div>
            <div style="color:#94a3b8;margin-top:3px">
              Probabilities: 0pt <code>${(inspected.probabilities.p0 * 100).toFixed(1)}%</code> | 3pt <code>${(inspected.probabilities.p3 * 100).toFixed(1)}%</code> | 7pt <code>${(inspected.probabilities.p7 * 100).toFixed(1)}%</code> •
              RNG Roll: <code>${inspected.roll.toFixed(4)}</code>
              ${inspected.wasShiftedSwing ? `<strong style="color:#fbbf24"> ★ Matchup/Fatigue Shift Changed Outcome (Base would be ${inspected.baseOutcomeWithoutShift} pts)!</strong>` : ''}
            </div>
          </div>
        </div>

        <div class="oms-panel">
          <div class="oms-panel-header">
            <h2>3 Decisive Match Events & Fatigue Update</h2>
            <span class="oms-pill">12 Recap Templates</span>
          </div>

          <div class="oms-decisive-list">
            ${match.decisiveEvents
              .map(
                (ev) => `
              <div class="oms-decisive-card" data-testid="decisive-event-card" data-template-id="${ev.templateId}">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:#6ee7b7;margin-bottom:3px">
                  <span>Decisive Event #${ev.eventIndex} • ${ev.templateTitle} (${ev.templateId})</span>
                  <span>Roll ${ev.roll.toFixed(3)} • Shift ${ev.totalShift >= 0 ? '+' : ''}${(ev.totalShift * 100).toFixed(1)}%</span>
                </div>
                <div style="font-weight:700;font-size:0.86rem;color:#f8fafc;margin-bottom:4px">${this.escapeHtml(ev.headline)}</div>
                <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.4">${this.escapeHtml(ev.body)}</div>
              </div>
            `,
              )
              .join('')}
          </div>

          <div style="font-size:0.8rem;font-weight:700;color:#cbd5e1;margin-top:4px">
            Post-Match Fatigue Ledger (Starters: +[24 − Stamina] • Reserves: −18)
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;font-size:0.74rem">
            ${match.fatigueTransitions
              .map(
                (ft) => `
              <div style="background:rgba(15,23,42,0.75);padding:6px 8px;border-radius:6px;display:flex;justify-content:space-between">
                <span>${ft.playerName} (${ft.wasStarter ? `Starter, STA ${ft.stamina}` : 'Reserve'})</span>
                <strong style="color:${ft.fatigueDelta > 0 ? '#fbbf24' : '#34d399'}">
                  ${ft.fatigueBefore}% → ${ft.fatigueAfter}% (${ft.fatigueDelta >= 0 ? `+${ft.fatigueDelta}` : ft.fatigueDelta})
                </strong>
              </div>
            `,
              )
              .join('')}
          </div>

          <button class="oms-btn primary" style="padding:12px;font-size:0.95rem;margin-top:auto" data-action="proceed-from-match" data-testid="proceed-from-match-btn">
            ${
              this.state.fixtureNumber < CONFIG.seasonFixtures
                ? `Continue to Post-Match Development (+1 Attribute, 0 Fatigue) →`
                : `Finish Fixture 6 & View Season Recap →`
            }
          </button>
        </div>
      </div>
    `;
  }

  private renderDevelopmentView(opponent: OpponentClub): string {
    return `
      <div class="oms-panel">
        <div class="oms-panel-header">
          <h2>Fixture ${this.state.fixtureNumber} Post-Match Breakthrough (Zero Fatigue Cost)</h2>
          <span class="oms-pill accent">1 Bounded Choice before Fixture ${this.state.fixtureNumber + 1}</span>
        </div>
        <div style="font-size:0.84rem;color:#cbd5e1">
          Following the match against <strong>${opponent.name}</strong>, award <strong>+1 Attribute</strong> (up to 10) to one player on your squad at <strong>0 fatigue cost</strong>.
        </div>
        <div class="oms-roster-list">
          ${this.state.roster
            .map(
              (p) => `
            <div class="oms-player-card" data-dev-player-id="${p.id}">
              <div class="oms-player-top">
                <div>
                  <span class="oms-role-tag ${p.role}">${p.role}</span>
                  <strong>#${p.number} ${p.name}</strong>
                  <span style="font-size:0.74rem;color:#94a3b8"> • Fatigue: ${p.fatigue}%</span>
                </div>
                <div class="oms-prep-actions">
                  ${ATTRIBUTE_KEYS.map(
                    (attr) => `
                    <button class="oms-btn primary" style="padding:5px 10px;font-size:0.75rem"
                      data-action="apply-dev" data-player-id="${p.id}" data-attr="${attr}"
                      ${p[attr] >= CONFIG.maxAttribute ? 'disabled' : ''}>
                      +1 ${ATTRIBUTE_LABELS[attr]} (${p[attr]} → ${Math.min(10, p[attr] + 1)})
                    </button>
                  `,
                  ).join('')}
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderSeasonRecapView(
    summary: ReturnType<typeof getSeasonSummary>,
  ): string {
    return `
      <div class="oms-panel" data-testid="season-recap-panel">
        <div class="oms-panel-header">
          <h2>Season Complete — ${CONFIG.clubName} Six-Fixture Verdict</h2>
          <span class="oms-pill ${summary.succeeded ? 'accent' : 'warn'}">
            ${summary.succeeded ? '🏆 SEASON TARGET ACHIEVED (≥ 4 WINS)' : '⚠️ SEASON TARGET MISSED (< 4 WINS)'}
          </span>
        </div>

        <div style="background:rgba(15,23,42,0.88);border:1px solid ${summary.succeeded ? '#34d399' : '#f59e0b'};border-radius:10px;padding:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:1.3rem;font-weight:900;color:${summary.succeeded ? '#34d399' : '#fde68a'}">
              Final Record: ${summary.wins} Wins – ${summary.draws} Draws – ${summary.losses} Losses
            </div>
            <div style="font-size:0.84rem;color:#cbd5e1;margin-top:4px">
              ${
                summary.succeeded
                  ? `The Supporters' Trust renews Ironvale Rovers FC! You secured ${summary.wins} wins across 6 fixtures (${summary.pointsFor} pts scored, ${summary.pointsAgainst} pts allowed).`
                  : `Ironvale Rovers FC finished with ${summary.wins} wins (Draws count as 0 wins toward the 4-win target). Total score: ${summary.pointsFor}–${summary.pointsAgainst}.`
              }
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="oms-btn primary" style="padding:10px 16px;font-size:0.9rem" data-action="new-season-next-seed" data-testid="play-again-btn">
              🔄 Play One More Season (Seed #${this.state.seed + 1})
            </button>
            <button class="oms-btn" style="padding:10px 14px" data-action="replay-same-seed">
              Replay Seed #${this.state.seed}
            </button>
          </div>
        </div>

        <div style="font-size:0.86rem;font-weight:700;color:#f8fafc">Six-Fixture Campaign Ledger</div>
        <table class="oms-table">
          <thead>
            <tr>
              <th>Fixture</th>
              <th>Opponent & Tendency</th>
              <th>Club Plan</th>
              <th>Score</th>
              <th>Result</th>
              <th>Post-Match Breakthrough</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.seasonHistory
              .map(
                (m) => `
              <tr>
                <td>F${m.fixtureNumber}</td>
                <td>${m.opponentName} <span style="color:#94a3b8">(${m.tendencyName})</span></td>
                <td>${m.clubPlan}</td>
                <td><strong>${m.clubScore} – ${m.opponentScore}</strong></td>
                <td><span class="oms-badge-${m.outcome.toLowerCase()}">${m.outcome}</span></td>
                <td>${m.devChoice ? `${m.devChoice.playerName} +1 ${ATTRIBUTE_LABELS[m.devChoice.attribute]} (${m.devChoice.beforeValue}→${m.devChoice.afterValue})` : 'Season Finale'}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderDebugInspector(opponent: OpponentClub): string {
    const teamRatings = computeTeamEffectiveRatings(
      this.state.roster,
      this.state.selectedStarterIds,
    );
    const clubOdds = computePossessionProbabilities({
      team: 'club',
      clubPlan: this.state.selectedPlan,
      teamRatings,
      opponent,
    });
    const oppOdds = computePossessionProbabilities({
      team: 'opponent',
      clubPlan: this.state.selectedPlan,
      teamRatings,
      opponent,
    });

    const match = this.state.currentMatch;

    return `
      <section class="oms-debug-panel" data-testid="debug-inspector">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:#38bdf8">🔍 MATH & COUNTERFACTUAL INSPECTOR (Rules v${CONFIG.rulesVersion})</strong>
          <span>Seed: <code>${this.state.seed}</code> • RNG State: <code>${this.state.rngState}</code> • Commands Logged: <code>${this.state.commandLog.length}</code></span>
        </div>
        <div style="margin-bottom:8px;color:#cbd5e1">
          Formula Contract: <code>effectiveStat = rawStat × (1 - fatigue / 200)</code> |
          Post-Match Fatigue: <code>Starters +(24 - Stamina), Reserves -18</code> |
          Shift: <code>clamp((Offense - Defense) × 0.008 + tendencyModifier, -0.15, +0.15)</code>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div style="background:rgba(15,23,42,0.9);padding:8px;border-radius:6px">
            <strong>Club Possession Math (${this.state.selectedPlan})</strong><br/>
            Offense (ATK+CTL): ${clubOdds.offenseRating.toFixed(2)} vs Opp Def (DEF+CTL): ${clubOdds.defenseRating.toFixed(2)}<br/>
            AttrShift: ${(clubOdds.attributeShift * 100).toFixed(2)}% | TendencyShift: ${(clubOdds.tendencyShift * 100).toFixed(2)}% | TotalShift: ${(clubOdds.totalShift * 100).toFixed(2)}%<br/>
            P(0)=${(clubOdds.probabilities.p0 * 100).toFixed(2)}% | P(3)=${(clubOdds.probabilities.p3 * 100).toFixed(2)}% | P(7)=${(clubOdds.probabilities.p7 * 100).toFixed(2)}% (Sum=${((clubOdds.probabilities.p0 + clubOdds.probabilities.p3 + clubOdds.probabilities.p7) * 100).toFixed(1)}%)
          </div>
          <div style="background:rgba(15,23,42,0.9);padding:8px;border-radius:6px">
            <strong>Opponent Possession Math (${opponent.defaultPlan})</strong><br/>
            Opp Offense (ATK+CTL): ${oppOdds.offenseRating.toFixed(2)} vs Club Def (DEF+CTL): ${oppOdds.defenseRating.toFixed(2)}<br/>
            AttrShift: ${(oppOdds.attributeShift * 100).toFixed(2)}% | TendencyShift: ${(oppOdds.tendencyShift * 100).toFixed(2)}% | TotalShift: ${(oppOdds.totalShift * 100).toFixed(2)}%<br/>
            P(0)=${(oppOdds.probabilities.p0 * 100).toFixed(2)}% | P(3)=${(oppOdds.probabilities.p3 * 100).toFixed(2)}% | P(7)=${(oppOdds.probabilities.p7 * 100).toFixed(2)}% (Sum=${((oppOdds.probabilities.p0 + oppOdds.probabilities.p3 + oppOdds.probabilities.p7) * 100).toFixed(1)}%)
          </div>
        </div>
        ${
          match
            ? `<table class="oms-table">
                <thead>
                  <tr>
                    <th>#</th><th>Team</th><th>Plan</th><th>Off/Def</th><th>Shift</th><th>P(0)/P(3)/P(7)</th><th>Roll</th><th>Pts (Base)</th>
                  </tr>
                </thead>
                <tbody>
                  ${match.possessions
                    .map(
                      (pos) => `
                    <tr>
                      <td>${pos.possessionIndex}</td>
                      <td>${pos.team}</td>
                      <td>${pos.tacticalPlanUsed}</td>
                      <td>${pos.offenseRating.toFixed(1)}/${pos.defenseRating.toFixed(1)}</td>
                      <td>${(pos.totalShift * 100).toFixed(1)}%</td>
                      <td>${(pos.probabilities.p0 * 100).toFixed(0)}/${(pos.probabilities.p3 * 100).toFixed(0)}/${(pos.probabilities.p7 * 100).toFixed(0)}%</td>
                      <td>${pos.roll.toFixed(4)}</td>
                      <td><strong>${pos.points}</strong> (${pos.baseOutcomeWithoutShift})${pos.wasShiftedSwing ? ' ★' : ''}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>`
            : ''
        }
      </section>
    `;
  }

  private renderSaveModal(): string {
    const exported = serializeSaveEnvelope(this.state);
    return `
      <div class="oms-modal-backdrop">
        <div class="oms-modal">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>Save / Import / Seed Controls</strong>
            <button class="oms-btn" data-action="close-save-modal">Close</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label style="font-size:0.78rem">New Season Seed:</label>
            <input id="oms-seed-input" type="number" value="${this.state.seed}" style="background:#020617;color:#f8fafc;border:1px solid #334155;border-radius:6px;padding:5px 8px;width:120px"/>
            <button class="oms-btn primary" data-action="apply-custom-seed">Start Season with Seed</button>
            ${CONFIG.documentedStrategySeeds
              .map(
                (s) =>
                  `<button class="oms-btn" data-action="quick-seed" data-seed="${s}">Seed #${s}</button>`,
              )
              .join('')}
          </div>
          <div style="font-size:0.76rem;color:#94a3b8">Export / Import JSON Save State (Schema v${CONFIG.saveSchemaVersion}):</div>
          <textarea id="oms-save-textarea" class="oms-textarea">${this.escapeHtml(this.importBuffer || exported)}</textarea>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button class="oms-btn sky" data-action="import-save-json">Import JSON State</button>
          </div>
        </div>
      </div>
    `;
  }

  private drawPitchCanvas(opponent: OpponentClub): void {
    if (typeof document === 'undefined') return;
    if (
      typeof navigator !== 'undefined' &&
      /jsdom/i.test(navigator.userAgent || '')
    ) {
      return;
    }
    const canvas = this.container.querySelector(
      '#oms-pitch-canvas',
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Turf stripes
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#0d3b29' : '#0f4430';
      ctx.fillRect((i * w) / 6, 0, w / 6, h);
    }

    // Pitch lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 14, w - 32, h - 28);

    // Halfway line & center circle
    ctx.beginPath();
    ctx.moveTo(w / 2, 14);
    ctx.lineTo(w / 2, h - 14);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 34, 0, Math.PI * 2);
    ctx.stroke();

    // 5-a-side penalty D-arcs
    ctx.beginPath();
    ctx.arc(16, h / 2, 54, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w - 16, h / 2, 54, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.stroke();

    // Formation coordinates for 5 starters based on plan
    const plan =
      this.state.phase === 'match_review' && this.state.currentMatch
        ? this.state.currentMatch.clubPlan
        : this.state.selectedPlan;

    const clubCoords: Array<[number, number]> =
      plan === 'Patient'
        ? [
            [78, h / 2],
            [155, 62],
            [155, h - 62],
            [235, h / 2],
            [310, h / 2 - 24],
          ]
        : plan === 'Aggressive'
          ? [
              [82, h / 2],
              [185, 68],
              [185, h - 68],
              [345, 76],
              [385, h / 2],
            ]
          : [
              [80, h / 2],
              [165, 66],
              [165, h - 66],
              [275, h / 2 - 42],
              [335, h / 2 + 18],
            ];

    const oppCoords: Array<[number, number]> = [
      [w - 75, h / 2],
      [w - 165, 65],
      [w - 165, h - 65],
      [w - 255, h / 2 - 40],
      [w - 295, h / 2 + 35],
    ];

    // If in match_review, draw ball path for the inspected possession
    let activePos: PossessionEvent | null = null;
    if (this.state.phase === 'match_review' && this.state.currentMatch) {
      const idx = Math.min(
        this.inspectedPossessionIdx,
        this.selectedPossessionIdx,
      );
      activePos = this.state.currentMatch.possessions[idx - 1] ?? null;
    }

    if (activePos) {
      ctx.save();
      ctx.strokeStyle =
        activePos.team === 'club' ? '#34d399' : opponent.primaryColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      if (activePos.team === 'club') {
        ctx.moveTo(clubCoords[3]![0], clubCoords[3]![1]);
        ctx.lineTo(clubCoords[4]![0], clubCoords[4]![1]);
        const endX =
          activePos.points === 7
            ? w - 24
            : activePos.points === 3
              ? w - 82
              : w - 165;
        ctx.lineTo(endX, h / 2);
      } else {
        ctx.moveTo(oppCoords[3]![0], oppCoords[3]![1]);
        ctx.lineTo(oppCoords[4]![0], oppCoords[4]![1]);
        const endX =
          activePos.points === 7 ? 24 : activePos.points === 3 ? 82 : 165;
        ctx.lineTo(endX, h / 2);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw opponent tokens
    for (let i = 0; i < oppCoords.length; i++) {
      const [ox, oy] = oppCoords[i]!;
      ctx.beginPath();
      ctx.arc(ox, oy, 12, 0, Math.PI * 2);
      ctx.fillStyle = opponent.primaryColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opponent.shortName[0] ?? 'O', ox, oy);
    }

    // Draw Ironvale starters
    const starters = this.state.roster.filter((p) =>
      this.state.selectedStarterIds.includes(p.id),
    );
    starters.forEach((player, idx) => {
      const [px, py] = clubCoords[idx % clubCoords.length]!;

      // Fatigue halo
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.strokeStyle =
        player.fatigue >= 45
          ? '#f59e0b'
          : player.fatigue >= 25
            ? '#38bdf8'
            : '#34d399';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Player token
      ctx.beginPath();
      ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#065f46';
      ctx.fill();
      ctx.strokeStyle = '#ecfdf5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ecfdf5';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${player.number}`, px, py);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 10px sans-serif';
      ctx.fillText(player.name.split(' ')[1] ?? player.name, px, py + 24);
    });
  }

  private bindEvents(): void {
    this.container
      .querySelectorAll<HTMLElement>('[data-action]')
      .forEach((el) => {
        const action = el.dataset.action;
        if (el.tagName === 'SELECT') {
          el.addEventListener('change', (e) => {
            const target = e.currentTarget as HTMLSelectElement;
            if (action === 'swap-starter-select' && target.value) {
              const starterId = target.dataset.starterId!;
              this.dispatch(
                {
                  type: 'SWAP_STARTER',
                  starterId,
                  reserveId: target.value,
                },
                'Updated starting five.',
              );
            }
          });
          return;
        }

        el.addEventListener('click', () => {
          switch (action) {
            case 'dismiss-toast':
              this.statusToast = null;
              this.render();
              break;
            case 'toggle-debug':
              this.toggleDebug();
              break;
            case 'toggle-mute':
              this.sound.toggleMute();
              this.render();
              break;
            case 'open-save-modal':
              this.showSaveModal = true;
              this.importBuffer = '';
              this.render();
              break;
            case 'close-save-modal':
              this.showSaveModal = false;
              this.render();
              break;
            case 'apply-custom-seed': {
              const input = this.container.querySelector(
                '#oms-seed-input',
              ) as HTMLInputElement | null;
              const val = Number(input?.value ?? CONFIG.defaultSeed);
              this.showSaveModal = false;
              this.restartWithSeed(val);
              break;
            }
            case 'quick-seed': {
              const seed = Number(el.dataset.seed ?? CONFIG.defaultSeed);
              this.showSaveModal = false;
              this.restartWithSeed(seed);
              break;
            }
            case 'import-save-json': {
              const area = this.container.querySelector(
                '#oms-save-textarea',
              ) as HTMLTextAreaElement | null;
              if (!area) break;
              try {
                const imported = parseSaveEnvelope(area.value);
                this.state = imported;
                saveStateToStorage(this.state);
                this.showSaveModal = false;
                this.statusToast = {
                  text: 'Save state imported and verified.',
                  kind: 'good',
                };
                this.render();
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.statusToast = { text: msg, kind: 'warn' };
                this.render();
              }
              break;
            }
            case 'quick-sub-in': {
              const reserveId = el.dataset.reserveId!;
              const starters = this.state.roster
                .filter((p) => this.state.selectedStarterIds.includes(p.id))
                .sort((a, b) => b.fatigue - a.fatigue);
              const mostTired = starters[0];
              if (mostTired) {
                this.dispatch(
                  {
                    type: 'SWAP_STARTER',
                    starterId: mostTired.id,
                    reserveId,
                  },
                  `Swapped in reserve for ${mostTired.name}.`,
                );
              }
              break;
            }
            case 'prep-rest': {
              const playerId = el.dataset.playerId!;
              this.dispatch(
                { type: 'SPEND_PREP_REST', playerId },
                'Applied Rest (-24 Fatigue).',
              );
              break;
            }
            case 'prep-train': {
              const playerId = el.dataset.playerId!;
              const attribute = el.dataset.attr as AttributeKey;
              this.dispatch(
                { type: 'SPEND_PREP_TRAIN', playerId, attribute },
                `Trained +1 ${ATTRIBUTE_LABELS[attribute]} (+8 Fatigue).`,
              );
              break;
            }
            case 'reset-prep': {
              this.dispatch(
                { type: 'RESET_PREP_ACTIONS' },
                'Reverted preparation actions for this fixture.',
              );
              break;
            }
            case 'select-plan': {
              const plan = el.dataset.plan as TacticalPlanId;
              this.dispatch({ type: 'SET_TACTICAL_PLAN', plan });
              break;
            }
            case 'commit-match': {
              this.dispatch({ type: 'COMMIT_MATCH' });
              break;
            }
            case 'step-possession': {
              this.stopPlayback();
              if (this.selectedPossessionIdx < CONFIG.totalPossessions) {
                this.selectedPossessionIdx += 1;
                this.inspectedPossessionIdx = this.selectedPossessionIdx;
              }
              this.render();
              break;
            }
            case 'skip-playback': {
              this.skipToFullTime();
              break;
            }
            case 'inspect-possession': {
              const idx = Number(el.dataset.posIdx ?? 1);
              this.inspectedPossessionIdx = idx;
              this.sound.playClick(460);
              this.render();
              break;
            }
            case 'proceed-from-match': {
              this.stopPlayback();
              this.dispatch({ type: 'PROCEED_FROM_MATCH' });
              break;
            }
            case 'apply-dev': {
              const playerId = el.dataset.playerId!;
              const attribute = el.dataset.attr as AttributeKey;
              this.dispatch(
                { type: 'APPLY_DEVELOPMENT', playerId, attribute },
                `Awarded post-match +1 ${ATTRIBUTE_LABELS[attribute]} breakthrough (0 fatigue)!`,
              );
              break;
            }
            case 'new-season-next-seed': {
              this.restartWithSeed(this.state.seed + 1);
              break;
            }
            case 'replay-same-seed': {
              this.restartWithSeed(this.state.seed);
              break;
            }
          }
        });
      });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
