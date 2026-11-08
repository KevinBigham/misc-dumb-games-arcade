import {
  CALIBRATION_LIMITS_MS,
  ChartDifficultyId,
  JUDGMENT_WINDOWS_MS,
  LaneId,
  SONG_SECTIONS,
  SectionId,
   getComboMultiplier,
  getSectionForTimeMs,
} from './config.ts';
import { ChartDefinition } from './content.ts';
import { BeatlineSaveData } from './persistence.ts';
import { BeatlineSimulation, ResultsSummary } from './simulation.ts';

export interface BeatlineUICallbacks {
  onSelectDifficulty: (id: ChartDifficultyId) => void;
  onSelectPracticeSection: (sectionId: SectionId | null) => void;
  onStartOrResume: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onLaneInput: (lane: LaneId) => void;
  onShuntInput: () => void;
  onCalibrationChange: (offsetMs: number) => void;
  onToggleNoFail: (enabled: boolean) => void;
  onToggleMute: () => void;
  onOpenCalibrationModal: (open: boolean) => void;
  onCalibrationTap: () => void;
}

export class BeatlineUI {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: BeatlineUICallbacks;

  private hudScoreEl!: HTMLElement;
  private hudComboEl!: HTMLElement;
  private hudMultEl!: HTMLElement;
  private hudRouteEl!: HTMLElement;
  private hudStabilityBarEl!: HTMLElement;
  private hudStabilityValEl!: HTMLElement;
  private hudTimeEl!: HTMLElement;
  private hudSectionEl!: HTMLElement;
  private calibrationBadgeEl!: HTMLElement;
  private startBtnEl!: HTMLButtonElement;
  private pauseBtnEl!: HTMLButtonElement;
  private muteBtnEl!: HTMLButtonElement;
  private noFailCheckEl!: HTMLInputElement;
  private diffButtons: Map<ChartDifficultyId, HTMLButtonElement> = new Map();
  private sectionSelectEl!: HTMLSelectElement;

  private overlayContainerEl!: HTMLElement;
  private calibrationModalEl!: HTMLElement;
  private calSliderEl!: HTMLInputElement;
  private calValueLabelEl!: HTMLElement;
  private calTapStatusEl!: HTMLElement;
  private debugPanelEl!: HTMLElement;

  private leftFlashUntilMs = 0;
  private rightFlashUntilMs = 0;
  private shuntFlashUntilMs = 0;

  constructor(container: HTMLElement, callbacks: BeatlineUICallbacks) {
    this.callbacks = callbacks;
    this.root = document.createElement('div');
    this.root.className = 'bs-root';
    this.injectStyles();
    this.buildDOM();
    container.innerHTML = '';
    container.appendChild(this.root);

    this.canvas = this.root.querySelector('#bs-canvas') as HTMLCanvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to initialize 2D canvas context for Beatline Salvage');
    }
    this.ctx = context;
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .bs-root {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at 50% 0%, #131c31 0%, #070b14 75%);
        color: #e2e8f0;
        min-height: 100%;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        user-select: none;
        position: relative;
      }
      .bs-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 10px;
        padding: 10px 14px;
      }
      .bs-brand {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .bs-title {
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bs-title-pill {
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(0, 240, 255, 0.15);
        border: 1px solid #00f0ff;
        color: #00f0ff;
        font-weight: 700;
      }
      .bs-subtitle {
        font-size: 0.76rem;
        color: #94a3b8;
      }
      .bs-controls-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .bs-btn {
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 6px 11px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.12s ease;
      }
      .bs-btn:hover {
        border-color: #38bdf8;
        color: #fff;
      }
      .bs-btn.active {
        background: rgba(0, 240, 255, 0.18);
        border-color: #00f0ff;
        color: #00f0ff;
      }
      .bs-btn-primary {
        background: linear-gradient(135deg, #0284c7, #00f0ff);
        color: #041019;
        border: none;
        font-weight: 800;
      }
      .bs-btn-primary:hover {
        filter: brightness(1.1);
        color: #020617;
      }
      .bs-btn-amber {
        background: rgba(245, 158, 11, 0.18);
        border: 1px solid #f59e0b;
        color: #fbbf24;
      }
      .bs-select {
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 6px 8px;
        font-size: 0.78rem;
      }
      .bs-hud {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
        gap: 8px;
      }
      .bs-hud-card {
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .bs-hud-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #94a3b8;
      }
      .bs-hud-value {
        font-size: 1.15rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: #f8fafc;
      }
      .bs-stability-track {
        width: 100%;
        height: 8px;
        background: #090d16;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid #1e293b;
        margin-top: 2px;
      }
      .bs-stability-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #22c55e, #00f0ff);
        transition: width 0.08s linear;
      }
      .bs-stage-wrap {
        position: relative;
        width: 100%;
        max-width: 920px;
        margin: 0 auto;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: #050811;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
      }
      #bs-canvas {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
      }
      .bs-touch-deck {
        display: grid;
        grid-template-columns: 1fr 1.1fr 1fr;
        gap: 10px;
        max-width: 920px;
        width: 100%;
        margin: 0 auto;
      }
      .bs-pad {
        padding: 14px 10px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.9rem;
        letter-spacing: 0.04em;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        touch-action: manipulation;
      }
      .bs-pad-sub {
        font-size: 0.7rem;
        font-weight: 500;
        opacity: 0.82;
      }
      .bs-pad-left {
        background: rgba(0, 240, 255, 0.12);
        border: 2px solid #00f0ff;
        color: #67e8f9;
      }
      .bs-pad-left:active {
        background: rgba(0, 240, 255, 0.32);
      }
      .bs-pad-shunt {
        background: rgba(245, 158, 11, 0.14);
        border: 2px solid #f59e0b;
        color: #fcd34d;
      }
      .bs-pad-shunt:active {
        background: rgba(245, 158, 11, 0.35);
      }
      .bs-pad-right {
        background: rgba(255, 59, 139, 0.12);
        border: 2px solid #ff3b8b;
        color: #f472b6;
      }
      .bs-pad-right:active {
        background: rgba(255, 59, 139, 0.32);
      }
      .bs-overlay {
        position: absolute;
        inset: 0;
        background: rgba(6, 10, 20, 0.91);
        backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 18px;
        overflow-y: auto;
        z-index: 20;
      }
      .bs-overlay.hidden {
        display: none;
      }
      .bs-results-card {
        width: 100%;
        max-width: 780px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .bs-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 10px;
      }
      .bs-rank-badge {
        font-size: 2.1rem;
        font-weight: 900;
        padding: 4px 16px;
        border-radius: 10px;
        background: rgba(0, 240, 255, 0.14);
        border: 2px solid #00f0ff;
        color: #00f0ff;
      }
      .bs-hist-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 4px;
        align-items: end;
        height: 82px;
        padding: 8px 6px 4px;
        background: #070b14;
        border-radius: 8px;
        border: 1px solid #1e293b;
      }
      .bs-hist-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        gap: 3px;
      }
      .bs-hist-bar {
        width: 100%;
        background: #38bdf8;
        border-radius: 3px 3px 0 0;
        min-height: 2px;
      }
      .bs-hist-lbl {
        font-size: 0.56rem;
        color: #64748b;
        white-space: nowrap;
      }
      .bs-sec-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.78rem;
      }
      .bs-sec-table th, .bs-sec-table td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #1e293b;
      }
      .bs-sec-table th {
        color: #94a3b8;
        font-weight: 600;
      }
      .bs-debug {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        background: rgba(2, 6, 23, 0.92);
        border: 1px solid #38bdf8;
        color: #7dd3fc;
        padding: 8px 12px;
        border-radius: 8px;
      }
      .bs-debug.hidden {
        display: none;
      }
    `;
    this.root.appendChild(style);
  }

  private buildDOM(): void {
    const topbar = document.createElement('div');
    topbar.className = 'bs-topbar';
    topbar.innerHTML = `
      <div class="bs-brand">
        <div class="bs-title">
          <span>BEATLINE SALVAGE</span>
          <span class="bs-title-pill">SPLIT-SECOND LANES</span>
        </div>
        <div class="bs-subtitle">Two-Lane Magnetic Salvage Sorter · Audio-Clock Precision (±32ms PERFECT)</div>
      </div>
      <div class="bs-controls-row" id="bs-diff-row"></div>
      <div class="bs-controls-row">
        <select class="bs-select" id="bs-section-select" title="Full Shift or Section Practice Loop">
          <option value="">Full 90s Shift (All 4 Sections)</option>
          ${SONG_SECTIONS.map(
            (s) => `<option value="${s.id}">Practice: ${s.title}</option>`
          ).join('')}
        </select>
        <button class="bs-btn bs-btn-amber" id="bs-cal-btn" type="button">Calibrate (<span id="bs-cal-badge">0ms</span>)</button>
        <label class="bs-btn" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
          <input type="checkbox" id="bs-nofail-check" /> No-Fail
        </label>
        <button class="bs-btn" id="bs-mute-btn" type="button">Audio: ON</button>
        <button class="bs-btn" id="bs-pause-btn" type="button">Pause [P]</button>
        <button class="bs-btn" id="bs-restart-btn" type="button">Restart [R]</button>
        <button class="bs-btn bs-btn-primary" id="bs-start-btn" type="button">Start Shift</button>
      </div>
    `;
    this.root.appendChild(topbar);

    const diffRow = topbar.querySelector('#bs-diff-row') as HTMLElement;
    const diffs: { id: ChartDifficultyId; label: string }[] = [
      { id: 'easy', label: 'Cadet [Easy]' },
      { id: 'standard', label: 'Shift Lead [Std]' },
      { id: 'expert', label: 'Foundry [Expert]' },
      { id: 'daily', label: 'Daily Seed' },
    ];
    for (const d of diffs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bs-btn';
      btn.textContent = d.label;
      btn.addEventListener('click', () => this.callbacks.onSelectDifficulty(d.id));
      diffRow.appendChild(btn);
      this.diffButtons.set(d.id, btn);
    }

    this.sectionSelectEl = topbar.querySelector('#bs-section-select') as HTMLSelectElement;
    this.sectionSelectEl.addEventListener('change', () => {
      const val = this.sectionSelectEl.value as SectionId | '';
      this.callbacks.onSelectPracticeSection(val ? val : null);
    });

    this.calibrationBadgeEl = topbar.querySelector('#bs-cal-badge') as HTMLElement;
    this.startBtnEl = topbar.querySelector('#bs-start-btn') as HTMLButtonElement;
    this.pauseBtnEl = topbar.querySelector('#bs-pause-btn') as HTMLButtonElement;
    this.muteBtnEl = topbar.querySelector('#bs-mute-btn') as HTMLButtonElement;
    this.noFailCheckEl = topbar.querySelector('#bs-nofail-check') as HTMLInputElement;

    topbar
      .querySelector('#bs-cal-btn')!
      .addEventListener('click', () => this.callbacks.onOpenCalibrationModal(true));
    this.startBtnEl.addEventListener('click', () => this.callbacks.onStartOrResume());
    this.pauseBtnEl.addEventListener('click', () => this.callbacks.onPauseToggle());
    topbar
      .querySelector('#bs-restart-btn')!
      .addEventListener('click', () => this.callbacks.onRestart());
    this.muteBtnEl.addEventListener('click', () => this.callbacks.onToggleMute());
    this.noFailCheckEl.addEventListener('change', () =>
      this.callbacks.onToggleNoFail(this.noFailCheckEl.checked)
    );

    // HUD Row
    const hud = document.createElement('div');
    hud.className = 'bs-hud';
    hud.innerHTML = `
      <div class="bs-hud-card">
        <span class="bs-hud-label">Salvage Score</span>
        <span class="bs-hud-value" id="bs-hud-score">0</span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Combo & Multiplier</span>
        <span class="bs-hud-value"><span id="bs-hud-combo">0</span> <small id="bs-hud-mult" style="color:#00f0ff;">1x</small></span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Active Route Mode</span>
        <span class="bs-hud-value" id="bs-hud-route" style="color:#38bdf8;">STANDARD 1.0x</span>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Capacitor Stability (<span id="bs-hud-stab-val">100%</span>)</span>
        <div class="bs-stability-track"><div class="bs-stability-fill" id="bs-hud-stab-bar"></div></div>
      </div>
      <div class="bs-hud-card">
        <span class="bs-hud-label">Audio Clock / Section</span>
        <span class="bs-hud-value" id="bs-hud-time" style="font-size:0.95rem;">0.0s / 90.0s</span>
        <span id="bs-hud-sec" style="font-size:0.7rem;color:#94a3b8;">01 · Intro Induction</span>
      </div>
    `;
    this.root.appendChild(hud);

    this.hudScoreEl = hud.querySelector('#bs-hud-score') as HTMLElement;
    this.hudComboEl = hud.querySelector('#bs-hud-combo') as HTMLElement;
    this.hudMultEl = hud.querySelector('#bs-hud-mult') as HTMLElement;
    this.hudRouteEl = hud.querySelector('#bs-hud-route') as HTMLElement;
    this.hudStabilityBarEl = hud.querySelector('#bs-hud-stab-bar') as HTMLElement;
    this.hudStabilityValEl = hud.querySelector('#bs-hud-stab-val') as HTMLElement;
    this.hudTimeEl = hud.querySelector('#bs-hud-time') as HTMLElement;
    this.hudSectionEl = hud.querySelector('#bs-hud-sec') as HTMLElement;

    // Stage + Overlays
    const stageWrap = document.createElement('div');
    stageWrap.className = 'bs-stage-wrap';
    stageWrap.innerHTML = `
      <canvas id="bs-canvas" width="920" height="518"></canvas>
      <div class="bs-overlay hidden" id="bs-results-overlay"></div>
      <div class="bs-overlay hidden" id="bs-cal-modal">
        <div class="bs-results-card" style="max-width:520px;">
          <div class="bs-results-header">
            <div>
              <div style="font-weight:800;font-size:1.1rem;">4-Beat Audio-Input Offset Calibration</div>
              <div style="font-size:0.78rem;color:#94a3b8;">Compensate for Bluetooth / output latency (-150ms to +150ms)</div>
            </div>
            <button class="bs-btn" id="bs-cal-close" type="button">Done</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="font-size:0.82rem;display:flex;justify-content:space-between;">
              <span>Calibration Offset:</span>
              <strong id="bs-cal-val-label" style="color:#00f0ff;">0 ms</strong>
            </label>
            <input type="range" id="bs-cal-slider" min="${CALIBRATION_LIMITS_MS.MIN}" max="${CALIBRATION_LIMITS_MS.MAX}" step="5" value="0" />
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#64748b;">
              <span>-150ms (Early Audio)</span>
              <span>0ms (Direct)</span>
              <span>+150ms (Late Audio / BT)</span>
            </div>
          </div>
          <div style="background:#070b14;border:1px solid #1e293b;padding:12px;border-radius:8px;display:flex;flex-direction:column;gap:8px;">
            <div style="font-size:0.8rem;color:#cbd5e1;" id="bs-cal-tap-status">
              Tap the button below (or press F / J) in rhythm with the 120 BPM (500ms) pulse to auto-estimate your offset.
            </div>
            <div style="display:flex;gap:8px;">
              <button class="bs-btn bs-btn-primary" id="bs-cal-tap-btn" type="button">Tap Beat Pulse (120 BPM)</button>
              <button class="bs-btn" id="bs-cal-reset-btn" type="button">Reset to 0ms</button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.root.appendChild(stageWrap);

    this.overlayContainerEl = stageWrap.querySelector('#bs-results-overlay') as HTMLElement;
    this.calibrationModalEl = stageWrap.querySelector('#bs-cal-modal') as HTMLElement;
    this.calSliderEl = stageWrap.querySelector('#bs-cal-slider') as HTMLInputElement;
    this.calValueLabelEl = stageWrap.querySelector('#bs-cal-val-label') as HTMLElement;
    this.calTapStatusEl = stageWrap.querySelector('#bs-cal-tap-status') as HTMLElement;

    stageWrap
      .querySelector('#bs-cal-close')!
      .addEventListener('click', () => this.callbacks.onOpenCalibrationModal(false));
    this.calSliderEl.addEventListener('input', () => {
      this.callbacks.onCalibrationChange(Number(this.calSliderEl.value));
    });
    stageWrap
      .querySelector('#bs-cal-tap-btn')!
      .addEventListener('click', () => this.callbacks.onCalibrationTap());
    stageWrap
      .querySelector('#bs-cal-reset-btn')!
      .addEventListener('click', () => this.callbacks.onCalibrationChange(0));

    // Touch / Responsive Controls Deck
    const touchDeck = document.createElement('div');
    touchDeck.className = 'bs-touch-deck';
    touchDeck.innerHTML = `
      <button class="bs-pad bs-pad-left" id="bs-pad-left" type="button">
        <span>LEFT RAIL</span>
        <span class="bs-pad-sub">[F] / [D] / [←]</span>
      </button>
      <button class="bs-pad bs-pad-shunt" id="bs-pad-shunt" type="button">
        <span>OVERDRIVE SHUNT (1.5x)</span>
        <span class="bs-pad-sub">[SPACE] AT GATE</span>
      </button>
      <button class="bs-pad bs-pad-right" id="bs-pad-right" type="button">
        <span>RIGHT RAIL</span>
        <span class="bs-pad-sub">[J] / [K] / [→]</span>
      </button>
    `;
    this.root.appendChild(touchDeck);

    const bindPad = (selector: string, fn: () => void) => {
      const el = touchDeck.querySelector(selector) as HTMLButtonElement;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        fn();
      });
    };
    bindPad('#bs-pad-left', () => this.callbacks.onLaneInput('left'));
    bindPad('#bs-pad-shunt', () => this.callbacks.onShuntInput());
    bindPad('#bs-pad-right', () => this.callbacks.onLaneInput('right'));

    this.debugPanelEl = document.createElement('div');
    this.debugPanelEl.className = 'bs-debug hidden';
    this.root.appendChild(this.debugPanelEl);
  }

  public triggerLaneFlash(lane: LaneId, nowMs: number): void {
    if (lane === 'left') this.leftFlashUntilMs = nowMs + 110;
    else this.rightFlashUntilMs = nowMs + 110;
  }

  public triggerShuntFlash(nowMs: number): void {
    this.shuntFlashUntilMs = nowMs + 240;
  }

  public setCalibrationModalOpen(open: boolean, offsetMs: number, tapMessage?: string): void {
    this.calibrationModalEl.classList.toggle('hidden', !open);
    this.calSliderEl.value = String(offsetMs);
    const sign = offsetMs > 0 ? '+' : '';
    this.calValueLabelEl.textContent = `${sign}${offsetMs} ms`;
    this.calibrationBadgeEl.textContent = `${sign}${offsetMs}ms`;
    if (tapMessage) {
      this.calTapStatusEl.textContent = tapMessage;
    }
  }

  public hideResultsOverlay(): void {
    this.overlayContainerEl.classList.add('hidden');
    this.overlayContainerEl.innerHTML = '';
  }

  /**
   * Renders the Post-Shift Diagnostic Screen including:
   * - Timing-Error Distribution Histogram (-120ms .. +120ms)
   * - Mean early/late bias & 1-click Calibration adjustment
   * - 4-Section Breakdown table
   * - "Practice Weakest Section" 1-click loop button
   */
  public showResultsOverlay(
    summary: ResultsSummary,
    saveData: BeatlineSaveData,
    onPracticeSection: (secId: SectionId) => void,
    onApplySuggestedCal: (newOffsetMs: number) => void
  ): void {
    const maxBin = Math.max(1, ...summary.histogram.map((b) => b.count));
    const bestRec = saveData.chartRecords[summary.chartId];
    const meanSign = summary.meanErrorMs > 0 ? '+' : '';
    const biasDesc =
      Math.abs(summary.meanErrorMs) <= 8
        ? 'Locked-in Center Calibration'
        : summary.meanErrorMs > 0
        ? `Mean Late Bias (${meanSign}${summary.meanErrorMs}ms)`
        : `Mean Early Bias (${summary.meanErrorMs}ms)`;

    const weakestSecObj =
      SONG_SECTIONS.find((s) => s.id === summary.weakestSectionId) ?? SONG_SECTIONS[0];

    this.overlayContainerEl.innerHTML = `
      <div class="bs-results-card">
        <div class="bs-results-header">
          <div>
            <div style="font-size:0.74rem;color:#38bdf8;text-transform:uppercase;font-weight:700;">
              ${summary.completed ? 'Shift Completed · Diagnostic Report' : 'Capacitor Overload · Shift Halted'}
            </div>
            <div style="font-size:1.25rem;font-weight:800;color:#f8fafc;">${summary.chartTitle}</div>
            <div style="font-size:0.78rem;color:#94a3b8;">
              Score: <strong style="color:#fff;">${summary.totalScore.toLocaleString()}</strong> ·
              Accuracy: <strong style="color:#00f0ff;">${summary.accuracyPct}%</strong> ·
              Max Combo: <strong>${summary.maxCombo}x</strong> ·
              Best Saved: <strong>${(bestRec?.bestScore ?? summary.totalScore).toLocaleString()} (${bestRec?.bestRank ?? summary.rank})</strong>
            </div>
          </div>
          <div class="bs-rank-badge">${summary.rank}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;text-align:center;font-size:0.76rem;">
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #00f0ff44;">
            <div style="color:#00f0ff;font-weight:700;">PERFECT</div>
            <div style="font-size:1rem;font-weight:800;">${summary.counts.PERFECT}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #22c55e44;">
            <div style="color:#22c55e;font-weight:700;">GOOD</div>
            <div style="font-size:1rem;font-weight:800;">${summary.counts.GOOD}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #f59e0b44;">
            <div style="color:#fbbf24;font-weight:700;">EARLY</div>
            <div style="font-size:1rem;font-weight:800;">${summary.counts.EARLY}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #f9731644;">
            <div style="color:#fb923c;font-weight:700;">LATE</div>
            <div style="font-size:1rem;font-weight:800;">${summary.counts.LATE}</div>
          </div>
          <div style="background:#070b14;padding:6px;border-radius:6px;border:1px solid #ef444444;">
            <div style="color:#f87171;font-weight:700;">MISS</div>
            <div style="font-size:1rem;font-weight:800;">${summary.counts.MISS}</div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:0.78rem;">
            <span style="font-weight:700;color:#cbd5e1;">Timing-Error Distribution Histogram (-120ms Early .. +120ms Late)</span>
            <span style="color:#38bdf8;">${biasDesc}</span>
          </div>
          <div class="bs-hist-grid">
            ${summary.histogram
              .map((b, i) => {
                const heightPct = Math.max(4, Math.round((b.count / maxBin) * 100));
                const isCenter = i === 5 || i === 6;
                const color = isCenter ? '#00f0ff' : i >= 4 && i <= 7 ? '#22c55e' : '#f59e0b';
                return `
                  <div class="bs-hist-col" title="${b.label}ms: ${b.count} hits">
                    <span style="font-size:0.62rem;color:#cbd5e1;">${b.count || ''}</span>
                    <div class="bs-hist-bar" style="height:${heightPct}%;background:${color};"></div>
                    <span class="bs-hist-lbl">${b.minMs >= 0 ? '+' : ''}${b.minMs}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <div>
          <div style="font-weight:700;font-size:0.78rem;color:#cbd5e1;margin-bottom:4px;">4-Section Breakdown & Overdrive Shunt Routing</div>
          <table class="bs-sec-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Route</th>
                <th>Accuracy</th>
                <th>P / G / E+L / M</th>
                <th>Mean Error</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${summary.sectionBreakdowns
                .map((sb) => {
                  const isWeakest = sb.sectionId === summary.weakestSectionId;
                  return `
                    <tr style="${isWeakest ? 'background:rgba(245,158,11,0.09);' : ''}">
                      <td><strong>${sb.title}</strong> ${
                    isWeakest
                      ? '<span style="color:#fbbf24;font-size:0.68rem;">[WEAKEST]</span>'
                      : ''
                  }</td>
                      <td style="color:${
                        sb.routeChosen === 'overdrive' ? '#fbbf24' : '#38bdf8'
                      };font-weight:700;">
                        ${sb.routeChosen === 'overdrive' ? 'OVERDRIVE 1.5x' : 'STANDARD 1.0x'}
                      </td>
                      <td>${sb.accuracyPct}%</td>
                      <td>${sb.perfectCount} / ${sb.goodCount} / ${
                    sb.earlyCount + sb.lateCount
                  } / ${sb.missCount}</td>
                      <td>${sb.meanErrorMs > 0 ? '+' : ''}${sb.meanErrorMs}ms</td>
                      <td>
                        <button class="bs-btn bs-sec-drill-btn" data-sec="${
                          sb.sectionId
                        }" type="button" style="padding:3px 8px;font-size:0.7rem;">
                          Drill Section
                        </button>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding-top:4px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="bs-btn bs-btn-amber" id="bs-res-practice-weakest" type="button">
              Practice Weakest Section (${weakestSecObj.title})
            </button>
            ${
              Math.abs(summary.meanErrorMs) >= 10
                ? `<button class="bs-btn" id="bs-res-apply-cal" type="button">
                     Apply Suggested Offset (${
                       summary.suggestedCalibrationOffsetMs >= 0 ? '+' : ''
                     }${summary.suggestedCalibrationOffsetMs}ms)
                   </button>`
                : ''
            }
          </div>
          <div style="display:flex;gap:8px;">
            <button class="bs-btn bs-btn-primary" id="bs-res-retry-btn" type="button">
              Retry Shift [R]
            </button>
          </div>
        </div>
      </div>
    `;

    this.overlayContainerEl.classList.remove('hidden');

    this.overlayContainerEl
      .querySelector('#bs-res-practice-weakest')
      ?.addEventListener('click', () => {
        onPracticeSection(summary.weakestSectionId);
      });

    this.overlayContainerEl
      .querySelector('#bs-res-apply-cal')
      ?.addEventListener('click', () => {
        onApplySuggestedCal(summary.suggestedCalibrationOffsetMs);
      });

    this.overlayContainerEl
      .querySelector('#bs-res-retry-btn')
      ?.addEventListener('click', () => {
        this.callbacks.onRestart();
      });

    this.overlayContainerEl.querySelectorAll('.bs-sec-drill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const secId = (btn as HTMLElement).getAttribute('data-sec') as SectionId;
        if (secId) onPracticeSection(secId);
      });
    });
  }

  public renderFrame(
    sim: BeatlineSimulation,
    chart: ChartDefinition,
    saveData: BeatlineSaveData,
    debugEnabled: boolean,
    nowPerfMs: number
  ): void {
    // Update topbar buttons & HUD
    for (const [id, btn] of this.diffButtons.entries()) {
      btn.classList.toggle('active', chart.id === id);
    }
    this.sectionSelectEl.value = chart.practiceSectionId ?? '';
    const calSign = saveData.calibrationOffsetMs > 0 ? '+' : '';
    this.calibrationBadgeEl.textContent = `${calSign}${saveData.calibrationOffsetMs}ms`;
    this.noFailCheckEl.checked = sim.getNoFailMode();
    this.muteBtnEl.textContent = saveData.muted ? 'Audio: MUTED' : 'Audio: ON';

    const status = sim.getStatus();
    this.startBtnEl.textContent =
      status === 'playing'
        ? 'Shift Running'
        : status === 'paused'
        ? 'Resume Shift'
        : 'Start Shift';
    this.pauseBtnEl.textContent = status === 'paused' ? 'Resume [P]' : 'Pause [P]';

    const combo = sim.getCombo();
    const mult = getComboMultiplier(combo);
    const calTrackMs = sim.getCalibratedTrackTimeMs();
    const route = sim.getCurrentRouteForTimeMs(calTrackMs);
    const stab = Math.round(sim.getStability());
    const curSec = getSectionForTimeMs(Math.max(0, calTrackMs));
    const endMs = chart.practiceEndTimeMs ?? chart.durationMs;

    this.hudScoreEl.textContent = sim.getScore().toLocaleString();
    this.hudComboEl.textContent = `${combo}`;
    this.hudMultEl.textContent = `${mult}x`;
    this.hudRouteEl.textContent =
      route === 'overdrive' ? 'OVERDRIVE SHUNT 1.5x' : 'STANDARD 1.0x';
    this.hudRouteEl.style.color = route === 'overdrive' ? '#fbbf24' : '#38bdf8';

    this.hudStabilityValEl.textContent = `${stab}%`;
    this.hudStabilityBarEl.style.width = `${stab}%`;
    this.hudStabilityBarEl.style.background =
      stab > 50
        ? 'linear-gradient(90deg, #22c55e, #00f0ff)'
        : stab > 25
        ? '#f59e0b'
        : '#ef4444';

    this.hudTimeEl.textContent = `${(Math.max(0, calTrackMs) / 1000).toFixed(1)}s / ${(
      endMs / 1000
    ).toFixed(1)}s`;
    this.hudSectionEl.textContent = curSec.title;

    this.drawCanvas(sim, chart, calTrackMs, route, nowPerfMs);

    if (debugEnabled) {
      this.debugPanelEl.classList.remove('hidden');
      const gateInfo = sim.getUpcomingOrActiveGate(calTrackMs);
      this.debugPanelEl.textContent = [
        `STATUS=${status.toUpperCase()}`,
        `RAW_MS=${Math.round(sim.getRawTrackTimeMs())}`,
        `CAL_TRACK_MS=${Math.round(calTrackMs)}`,
        `OFFSET_MS=${sim.getCalibrationOffsetMs()}`,
        `ROUTE=${route.toUpperCase()}`,
        `SECTION=${curSec.id}`,
        `GATE=${gateInfo ? `${gateInfo.gate.timeMs}ms(canAct=${gateInfo.canActivateNow})` : 'none'}`,
        `PAUSES=${sim.getPauseCount()}`,
        `INPUTS=${sim.getRecordedInputs().length}`,
      ].join(' | ');
    } else {
      this.debugPanelEl.classList.add('hidden');
    }
  }

  private drawCanvas(
    sim: BeatlineSimulation,
    chart: ChartDefinition,
    calTrackMs: number,
    route: 'standard' | 'overdrive',
    nowPerfMs: number
  ): void {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Background industrial foundry deck
    ctx.fillStyle = route === 'overdrive' ? '#130d06' : '#050914';
    ctx.fillRect(0, 0, W, H);

    // Subtle animated 120 BPM pulse glow
    const beatPhase = ((Math.max(0, calTrackMs) % 500) + 500) % 500;
    const pulseAlpha = Math.max(0, 1 - beatPhase / 250) * 0.14;
    ctx.fillStyle =
      route === 'overdrive'
        ? `rgba(245, 158, 11, ${pulseAlpha})`
        : `rgba(0, 240, 255, ${pulseAlpha})`;
    ctx.fillRect(0, 0, W, H);

    // Conveyor geometry
    const horizonY = 58;
    const receptorY = H - 88;
    const visibleAheadMs = 1_800;
    const visibleBehindMs = 180;

    const leftLaneCenterTop = W * 0.41;
    const rightLaneCenterTop = W * 0.59;
    const leftLaneCenterBottom = W * 0.31;
    const rightLaneCenterBottom = W * 0.69;

    const projectY = (timeDeltaMs: number): number => {
      const t = 1 - timeDeltaMs / visibleAheadMs;
      return horizonY + t * (receptorY - horizonY);
    };

    const projectLaneX = (lane: LaneId, y: number): number => {
      const progress = (y - horizonY) / (receptorY - horizonY);
      return lane === 'left'
        ? leftLaneCenterTop + (leftLaneCenterBottom - leftLaneCenterTop) * progress
        : rightLaneCenterTop + (rightLaneCenterBottom - rightLaneCenterTop) * progress;
    };

    // Draw Conveyor Rails
    ctx.save();
    ctx.strokeStyle = route === 'overdrive' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    // Left outer, center divider, right outer
    const drawRailLine = (topX: number, botX: number) => {
      ctx.beginPath();
      ctx.moveTo(topX, horizonY);
      ctx.lineTo(botX, H - 30);
      ctx.stroke();
    };
    drawRailLine(W * 0.33, W * 0.17);
    drawRailLine(W * 0.5, W * 0.5);
    drawRailLine(W * 0.67, W * 0.83);
    ctx.restore();

    // Draw 500ms Beat Grid Lines on Conveyor
    const firstGridBeatMs = Math.floor(calTrackMs / 500) * 500;
    ctx.save();
    for (let bMs = firstGridBeatMs; bMs <= calTrackMs + visibleAheadMs; bMs += 500) {
      const dt = bMs - calTrackMs;
      if (dt < -120) continue;
      const y = projectY(dt);
      const progress = Math.max(0.15, (y - horizonY) / (receptorY - horizonY));
      const leftEdge = W * 0.33 + (W * 0.17 - W * 0.33) * progress;
      const rightEdge = W * 0.67 + (W * 0.83 - W * 0.67) * progress;

      ctx.strokeStyle =
        bMs % 2000 === 0 ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.14)';
      ctx.lineWidth = bMs % 2000 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(leftEdge, y);
      ctx.lineTo(rightEdge, y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw Shunt Gates
    for (const gate of chart.shuntGates) {
      const dt = gate.timeMs - calTrackMs;
      if (dt < -300 || dt > visibleAheadMs) continue;
      const y = projectY(dt);
      const progress = Math.max(0.2, (y - horizonY) / (receptorY - horizonY));
      const leftEdge = W * 0.33 + (W * 0.17 - W * 0.33) * progress;
      const rightEdge = W * 0.67 + (W * 0.83 - W * 0.67) * progress;

      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(leftEdge, y);
      ctx.lineTo(rightEdge, y);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ SHUNT GATE — PRESS [SPACE] FOR 1.5x OVERDRIVE ⚡', W * 0.5, y - 8);
      ctx.restore();
    }

    // Draw Receptors at receptorY
    const drawReceptor = (lane: LaneId, flashActive: boolean) => {
      const rx = projectLaneX(lane, receptorY);
      const color = lane === 'left' ? '#00f0ff' : '#ff3b8b';
      ctx.save();
      ctx.beginPath();
      ctx.arc(rx, receptorY, 32, 0, Math.PI * 2);
      ctx.fillStyle = flashActive ? `${color}55` : 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = flashActive ? 4 : 2.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Inner PERFECT target ring
      ctx.beginPath();
      ctx.arc(rx, receptorY, 14, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lane === 'left' ? 'F / D / ←' : 'J / K / →', rx, receptorY + 48);
      ctx.restore();
    };

    drawReceptor('left', nowPerfMs < this.leftFlashUntilMs);
    drawReceptor('right', nowPerfMs < this.rightFlashUntilMs);

    // Draw Active Unjudged Notes on Conveyor
    const activeNotes = sim.getActiveNoteStates();
    for (const ns of activeNotes) {
      if (ns.judged) continue;
      const dt = ns.note.timeMs - calTrackMs;
      if (dt < -visibleBehindMs || dt > visibleAheadMs) continue;

      const y = projectY(dt);
      const x = projectLaneX(ns.note.lane, y);
      const scale = Math.max(0.42, Math.min(1.15, (y - horizonY) / (receptorY - horizonY)));
      const radius = 26 * scale;

      const isOverdriveCore = ns.note.coreType === 'plasma' || ns.note.routeBranch === 'overdrive';
      const baseColor = isOverdriveCore
        ? '#fbbf24'
        : ns.note.lane === 'left'
        ? '#00f0ff'
        : '#ff3b8b';

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      if (isOverdriveCore) {
        ctx.fillStyle = '#090d16';
        ctx.font = `bold ${Math.round(11 * scale)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1.5x', x, y);
      }
      ctx.restore();
    }

    // Draw Upcoming Shunt Gate Alert Pill at Top Center
    const gateStatus = sim.getUpcomingOrActiveGate(calTrackMs);
    if (gateStatus && gateStatus.canActivateNow) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.24)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(W * 0.5 - 190, 14, 380, 32, 999);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHUNT GATE READY — PRESS [SPACE] FOR OVERDRIVE (1.5x)', W * 0.5, 35);
      ctx.restore();
    }

    // Draw Live Hit-Timing Error Meter (-120ms .. 0 .. +120ms) at Bottom Center
    const meterW = 280;
    const meterH = 12;
    const meterX = (W - meterW) / 2;
    const meterY = H - 28;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(meterX, meterY, meterW, meterH);
    ctx.strokeRect(meterX, meterY, meterW, meterH);

    // Perfect window zone (±32ms)
    const perfHalfW = (JUDGMENT_WINDOWS_MS.PERFECT / JUDGMENT_WINDOWS_MS.EARLY_LATE) * (meterW / 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.28)';
    ctx.fillRect(W / 2 - perfHalfW, meterY, perfHalfW * 2, meterH);

    // Center 0ms line
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(W / 2, meterY - 3);
    ctx.lineTo(W / 2, meterY + meterH + 3);
    ctx.stroke();

    // Last judgment feedback & timing needle
    const fb = sim.getLastFeedback();
    if (fb && Math.abs(calTrackMs - fb.trackTimeMs) < 950) {
      if (fb.deltaMs !== undefined) {
        const clamped = Math.max(-120, Math.min(120, fb.deltaMs));
        const needleX = W / 2 + (clamped / 120) * (meterW / 2);
        ctx.fillStyle =
          fb.grade === 'PERFECT'
            ? '#00f0ff'
            : fb.grade === 'GOOD'
            ? '#22c55e'
            : '#fbbf24';
        ctx.fillRect(needleX - 2, meterY - 4, 4, meterH + 8);
      }

      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle =
        fb.grade === 'PERFECT'
          ? '#00f0ff'
          : fb.grade === 'GOOD'
          ? '#22c55e'
          : fb.grade === 'OVERDRIVE'
          ? '#fbbf24'
          : fb.grade === 'MISS'
          ? '#ef4444'
          : '#f59e0b';
      ctx.fillText(fb.text, W * 0.5, receptorY - 52);
    }

    // Status Banner when Idle or Paused
    const status = sim.getStatus();
    if (status === 'idle' || status === 'paused') {
      ctx.fillStyle = 'rgba(5, 9, 20, 0.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        status === 'paused'
          ? 'SHIFT PAUSED — AUDIO CLOCK LOCKED'
          : `${chart.title} · READY ON CONVEYOR`,
        W * 0.5,
        H * 0.44
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(
        status === 'paused'
          ? 'Press [P] or Click "Resume Shift" — Zero Phantom Misses Guaranteed'
          : 'Press [Space] or Click "Start Shift" · Left [F/D/←] · Right [J/K/→] · Shunt [Space]',
        W * 0.5,
        H * 0.52
      );
    }
    ctx.restore();
  }
}
