import { ParadoxAudioEngine } from './audio';
import { PARADOX_CONFIG } from './config';
import {
  ChamberNumber,
  ENDING_VERDICTS,
  PARADOX_CHAMBERS,
  PhilosophicalVerb,
  THESEUS_UPGRADES,
  TheseusModuleId,
} from './content';
import { ParadoxCareerStats } from './persistence';
import {
  computeEndingVerdict,
  ParadoxEvent,
  ParadoxGameState,
  ParadoxInputAction,
  runCounterfactualComparison,
} from './simulation';

// Conditionally load Invoker Commands & Popover polyfills per declarative-dialog-popover-control
if (
  typeof HTMLButtonElement !== 'undefined' &&
  !('commandForElement' in HTMLButtonElement.prototype)
) {
  void import('invokers-polyfill');
}
if (typeof HTMLElement !== 'undefined' && !('popover' in HTMLElement.prototype)) {
  void import('@oddbird/popover-polyfill');
}

interface FloatingPopup {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export interface ParadoxUICallbacks {
  onAction: (action: ParadoxInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
}

export class ParadoxUIController {
  private container: HTMLElement;
  private audio: ParadoxAudioEngine;
  private callbacks: ParadoxUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private popups: FloatingPopup[] = [];
  private particles: Particle[] = [];

  private keydownHandler!: (e: KeyboardEvent) => void;
  private keyupHandler!: (e: KeyboardEvent) => void;
  private lastRenderedChamber: number = -1;
  private lastRenderedStatus: string = '';
  private lastInstalledCount: number = -1;
  private lastLogHeadId: string = '';

  constructor(
    container: HTMLElement,
    audio: ParadoxAudioEngine,
    callbacks: ParadoxUICallbacks,
    initialDebug: boolean = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    this.mountDOM();
    this.bindEvents();
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    const panel = this.container.querySelector<HTMLElement>('#px-debug-panel');
    if (panel) {
      panel.hidden = !this.debugVisible;
    }
  }

  public resetVisuals(): void {
    this.popups = [];
    this.particles = [];
    this.lastRenderedChamber = -1;
    this.lastRenderedStatus = '';
    this.lastInstalledCount = -1;
    this.lastLogHeadId = '';
  }

  private setupDialogLightDismiss(root: ParentNode): void {
    if (typeof HTMLDialogElement === 'undefined' || 'closedBy' in HTMLDialogElement.prototype) {
      return;
    }
    for (const dialog of root.querySelectorAll<HTMLDialogElement>('dialog[closedby="any"]')) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  private mountDOM(): void {
    this.container.innerHTML = `
      <style>
        :root {
          --px-bg-light: #f8fafc;
          --px-bg-dark: #070a14;
          --px-surface-light: #ffffff;
          --px-surface-dark: #0f1629;
          --px-text-light: #0f172a;
          --px-text-dark: #f1f5f9;
          --px-muted-light: #475569;
          --px-muted-dark: #94a3b8;
          --px-border-light: #cbd5e1;
          --px-border-dark: #1e293b;

          --px-bg: var(--px-bg-dark);
          --px-surface: var(--px-surface-dark);
          --px-text: var(--px-text-dark);
          --px-muted: var(--px-muted-dark);
          --px-border: var(--px-border-dark);

          @media (prefers-color-scheme: light) {
            --px-bg: var(--px-bg-dark);
          }

          @supports (color: light-dark(white, black)) {
            --px-accent: light-dark(#e11d48, #f43f5e);
          }

          color-scheme: light dark;
          scrollbar-width: thin;
          scrollbar-color: #38bdf8 #0f1629;
        }

        @supports not (scrollbar-color: auto) {
          .px-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .px-scroll::-webkit-scrollbar-thumb {
            background: #38bdf8;
          }
          .px-scroll::-webkit-scrollbar-track {
            background: #0f1629;
          }
        }

        .px-shell {
          color-scheme: dark;
          background: radial-gradient(circle at 50% 0%, #131c38 0%, #070a14 75%);
          color: #f1f5f9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid #1e293b;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
          max-width: 1360px;
          margin: 0 auto;
        }

        .px-top-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 12px;
        }

        .px-brand-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .px-eyebrow {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f43f5e;
        }

        .px-main-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #ffffff 0%, #38bdf8 55%, #f43f5e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .px-chamber-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .px-tab-btn {
          background: #0f172a;
          color: #cbd5e1;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .px-tab-btn:hover {
          border-color: #38bdf8;
          color: #ffffff;
        }

        .px-tab-btn[aria-current="step"] {
          background: linear-gradient(135deg, #be123c 0%, #7e22ce 100%);
          color: #ffffff;
          border-color: #f43f5e;
          box-shadow: 0 0 14px rgba(244, 63, 94, 0.45);
        }

        .px-utility-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .px-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .px-btn:hover {
          background: #334155;
          border-color: #38bdf8;
        }

        .px-btn-accent {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          border-color: #38bdf8;
        }

        .px-question-banner {
          background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.9) 100%);
          border-left: 4px solid #38bdf8;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .px-question-text {
          font-size: 0.88rem;
          line-height: 1.4;
          color: #e2e8f0;
          max-width: 880px;
        }

        .px-question-text strong {
          color: #38bdf8;
        }

        .px-act-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid #38bdf8;
          color: #38bdf8;
          white-space: nowrap;
        }

        .px-act-pill[data-act="ACT_B_MIRROR"] {
          background: rgba(244, 63, 94, 0.2);
          border-color: #f43f5e;
          color: #fda4af;
          animation: pxPulse 1.2s infinite alternate;
        }

        @keyframes pxPulse {
          from { box-shadow: 0 0 4px rgba(244, 63, 94, 0.4); }
          to { box-shadow: 0 0 16px rgba(244, 63, 94, 0.85); }
        }

        .px-grid {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 14px;
          align-items: start;
        }

        @media (max-width: 1040px) {
          .px-grid {
            grid-template-columns: 1fr;
          }
        }

        .px-stage-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .px-hud-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
          gap: 8px;
        }

        .px-metric-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 7px 10px;
        }

        .px-metric-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
          display: block;
        }

        .px-metric-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
        }

        .px-canvas-wrap {
          position: relative;
          width: 100%;
          background: #050811;
          border: 2px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: inset 0 0 40px rgba(56, 189, 248, 0.08);
        }

        .px-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 760 / 440;
          cursor: crosshair;
          touch-action: none;
        }

        .px-overlay-modal {
          position: absolute;
          inset: 0;
          background: rgba(7, 10, 20, 0.92);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          text-align: center;
          z-index: 10;
        }

        .px-overlay-modal[hidden] {
          display: none !important;
        }

        .px-dilemma-card {
          max-width: 650px;
          background: #0f172a;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        .px-dilemma-choices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .px-dilemma-choices {
            grid-template-columns: 1fr;
          }
        }

        .px-choice-btn {
          background: #1e293b;
          border: 2px solid #475569;
          border-radius: 10px;
          padding: 12px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .px-choice-btn:hover {
          border-color: #38bdf8;
          background: #1e293b;
          transform: translateY(-2px);
        }

        .px-choice-btn strong {
          display: block;
          font-size: 0.92rem;
          color: #38bdf8;
          margin-bottom: 4px;
        }

        .px-choice-btn span {
          font-size: 0.78rem;
          color: #cbd5e1;
          line-height: 1.35;
        }

        .px-verbs-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        @media (max-width: 720px) {
          .px-verbs-bar {
            grid-template-columns: 1fr 1fr;
          }
        }

        .px-verb-btn {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 9px 10px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .px-verb-btn:hover {
          transform: translateY(-1px);
        }

        .px-verb-btn[data-verb="INTERVENE"] {
          border-left: 4px solid #10b981;
        }
        .px-verb-btn[data-verb="SIPHON"] {
          border-left: 4px solid #f43f5e;
        }
        .px-verb-btn[data-verb="SWERVE"] {
          border-left: 4px solid #38bdf8;
        }
        .px-verb-btn[data-verb="CHRONO"] {
          border-left: 4px solid #a855f7;
        }

        .px-verb-title {
          font-size: 0.8rem;
          font-weight: 800;
          display: block;
          margin-bottom: 2px;
        }

        .px-verb-sub {
          font-size: 0.7rem;
          color: #94a3b8;
          display: block;
          line-height: 1.25;
        }

        .px-side-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .px-card {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 12px;
        }

        .px-card-title {
          margin: 0 0 8px 0;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #38bdf8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .px-axis-row {
          margin-bottom: 8px;
        }

        .px-axis-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #cbd5e1;
          margin-bottom: 3px;
        }

        .px-axis-track {
          height: 7px;
          background: #1e293b;
          border-radius: 999px;
          overflow: hidden;
        }

        .px-axis-fill {
          height: 100%;
          background: linear-gradient(90deg, #38bdf8, #10b981);
          transition: width 0.2s ease;
        }

        .px-theseus-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .px-upgrade-chip {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 0.71rem;
          color: #e2e8f0;
          cursor: pointer;
          text-align: left;
        }

        .px-upgrade-chip:hover:not(:disabled) {
          border-color: #eab308;
        }

        .px-upgrade-chip:disabled {
          opacity: 0.65;
          border-color: #10b981;
          cursor: default;
        }

        .px-log-list {
          max-height: 165px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }

        .px-log-item {
          font-size: 0.73rem;
          background: #090d1a;
          border-left: 3px solid #38bdf8;
          padding: 6px 8px;
          border-radius: 4px;
        }

        .px-log-item strong {
          display: block;
          color: #f8fafc;
        }

        .px-log-item span {
          color: #94a3b8;
        }

        dialog.px-dialog {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          max-width: 780px;
          width: 92vw;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        }

        dialog.px-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.68);
          backdrop-filter: blur(3px);
        }

        [popover].px-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #a855f7;
          border-radius: 12px;
          padding: 16px;
          max-width: 440px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8);
        }

        [popover].px-popover:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .px-cf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          margin-top: 12px;
        }

        .px-cf-table th,
        .px-cf-table td {
          border: 1px solid #1e293b;
          padding: 8px 10px;
          text-align: left;
        }

        .px-cf-table th {
          background: #1e293b;
          color: #38bdf8;
        }
      </style>

      <div class="px-shell">
        <div class="px-top-bar">
          <div class="px-brand-block">
            <span class="px-eyebrow">ARGON FLAGSHIP EXISTENTIAL THRILLER // GAME #11</span>
            <h2 class="px-main-title">PARADOX PROTOCOL: THE MIRROR ENGINE</h2>
          </div>

          <div class="px-chamber-tabs" role="tablist" aria-label="Thought Experiment Chambers">
            <button type="button" class="px-tab-btn" data-chamber-jump="1" aria-current="step">I. Trolley Reactor</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="2">II. Newcomb's Vault</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="3">III. Ship of Theseus</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="4">IV. Prisoner's Multiverse</button>
            <button type="button" class="px-tab-btn" data-chamber-jump="5">V. Laplace's Demon</button>
          </div>

          <div class="px-utility-btns">
            <button
              type="button"
              class="px-btn px-btn-accent"
              id="px-btn-open-counterfactual"
              commandfor="px-counterfactual-dialog"
              command="show-modal"
            >
              ⚖ Counterfactual Mirror Lab
            </button>
            <button
              type="button"
              class="px-btn"
              commandfor="px-codex-popover"
              command="toggle-popover"
            >
              📖 Philosophy Codex
            </button>
            <button type="button" class="px-btn" id="px-btn-mute">🔊 Audio</button>
            <button type="button" class="px-btn" id="px-btn-restart">↻ New Timeline</button>
          </div>
        </div>

        <div id="px-codex-popover" class="px-popover" popover>
          <h3 style="margin-top:0;color:#a855f7;">Why The Mirror Engine Bends Your Mind</h3>
          <p style="font-size:0.82rem;line-height:1.45;color:#cbd5e1;">
            Every Chamber has two halves: <strong>Act A (0–14s Calibration)</strong> and <strong>Act B (14–28s The Mirror Wave)</strong>.
          </p>
          <ul style="font-size:0.78rem;line-height:1.45;color:#e2e8f0;padding-left:18px;">
            <li><strong>The Oracle (Laplace-9):</strong> Predicts your movement &amp; moral reflexes in real time. Shatter its prediction lock with <code>[3 / Space] Quantum Swerve</code>!</li>
            <li><strong>The Mirror Wave:</strong> At 14s, an Echo-Clone trained on your Act A choices spawns. If you intervened &amp; protected pods, it shields you. If you siphoned selfishly, your own reflection hunts you!</li>
            <li><strong>Ship of Theseus Upgrades:</strong> Sacrifice human memories for massive arcade speed &amp; lasers—at the cost of your Humanity Index.</li>
          </ul>
        </div>

        <dialog
          id="px-counterfactual-dialog"
          class="px-dialog"
          closedby="any"
          aria-labelledby="px-cf-dialog-title"
        >
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 id="px-cf-dialog-title" style="margin:0;color:#38bdf8;">
              ⚖ Counterfactual Timeline Simulator (Same Seed Comparison)
            </h3>
            <button
              type="button"
              class="px-btn"
              commandfor="px-counterfactual-dialog"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <p style="font-size:0.82rem;color:#cbd5e1;margin:8px 0;">
            How would alternative philosophical axioms perform on your exact deterministic seed?
          </p>
          <div id="px-cf-dialog-body"></div>
        </dialog>

        <div class="px-question-banner">
          <div class="px-question-text" id="px-chamber-banner-text"></div>
          <div class="px-act-pill" id="px-act-indicator" data-act="ACT_A_CALIBRATION">
            ACT A: ORACLE CALIBRATION
          </div>
        </div>

        <div class="px-grid">
          <div class="px-stage-column">
            <div class="px-hud-strip">
              <div class="px-metric-card">
                <span class="px-metric-label">Timeline Score</span>
                <span class="px-metric-val" id="px-val-score">0</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Hull / Sanctuary Pods</span>
                <span class="px-metric-val" id="px-val-hp">100 HP · 4 Pods</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Capacitor Energy</span>
                <span class="px-metric-val" id="px-val-energy">50 / 100 W</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Laplace-9 Prediction Lock</span>
                <span class="px-metric-val" id="px-val-lock" style="color:#38bdf8;">28% (Free)</span>
              </div>
              <div class="px-metric-card">
                <span class="px-metric-label">Humanity Index (Theseus)</span>
                <span class="px-metric-val" id="px-val-humanity" style="color:#10b981;">100% Human</span>
              </div>
            </div>

            <div class="px-canvas-wrap">
              <canvas
                id="px-arena-canvas"
                class="px-canvas"
                width="${PARADOX_CONFIG.ARENA_WIDTH}"
                height="${PARADOX_CONFIG.ARENA_HEIGHT}"
                aria-label="Paradox Protocol Interactive Thought-Experiment Arena"
              ></canvas>

              <div id="px-dilemma-overlay" class="px-overlay-modal" hidden></div>
            </div>

            <div class="px-verbs-bar">
              <button type="button" class="px-verb-btn" data-verb="INTERVENE" id="px-btn-verb1">
                <span class="px-verb-title" id="px-verb1-title">[1 / Q] Intervene</span>
                <span class="px-verb-sub" id="px-verb1-desc">Flip track &amp; shield pods</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="SIPHON" id="px-btn-verb2">
                <span class="px-verb-title" id="px-verb2-title">[2 / E] Siphon Core</span>
                <span class="px-verb-sub" id="px-verb2-desc">Drain energy &amp; score</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="SWERVE" id="px-btn-verb3">
                <span class="px-verb-title" id="px-verb3-title">[3 / Space] Quantum Swerve</span>
                <span class="px-verb-sub" id="px-verb3-desc">Shatter Oracle prediction (-18W)</span>
              </button>
              <button type="button" class="px-verb-btn" data-verb="CHRONO" id="px-btn-chrono">
                <span class="px-verb-title">[Shift] Chrono-Stasis</span>
                <span class="px-verb-sub" id="px-chrono-sub">Slow time to 42% for moral clarity</span>
              </button>
            </div>
          </div>

          <aside class="px-side-panel">
            <div class="px-card">
              <h3 class="px-card-title">
                <span>🧭 5-Axis Philosophical Soul Matrix</span>
                <span id="px-career-badge" style="font-size:0.7rem;color:#94a3b8;">0/4 Endings</span>
              </h3>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Deontological (Rules)</span>
                  <strong id="px-lbl-util">Balanced (0)</strong>
                  <span>Utilitarian (Outcomes)</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-util" style="width:50%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Rational Egoist</span>
                  <strong id="px-lbl-altruism">+10</strong>
                  <span>Altruist Guardian</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-altruism" style="width:55%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Deterministic Habit</span>
                  <strong id="px-lbl-entropy">35%</strong>
                  <span>Existential Freedom</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-entropy" style="width:35%;"></div></div>
              </div>

              <div class="px-axis-row">
                <div class="px-axis-labels">
                  <span>Hobbesian Defector</span>
                  <strong id="px-lbl-trust">+15</strong>
                  <span>Superrational Trust</span>
                </div>
                <div class="px-axis-track"><div class="px-axis-fill" id="px-bar-trust" style="width:57%;"></div></div>
              </div>
            </div>

            <div class="px-card">
              <h3 class="px-card-title">
                <span>🦾 Ship of Theseus Cyber-Replacements</span>
                <span style="font-size:0.68rem;color:#eab308;">-25% Humanity Each</span>
              </h3>
              <p style="margin:0 0 8px 0;font-size:0.72rem;color:#94a3b8;">
                Sacrifice a human memory for permanent arcade speed &amp; weapon overdrive:
              </p>
              <div class="px-theseus-list" id="px-theseus-grid"></div>
            </div>

            <div class="px-card">
              <h3 class="px-card-title">
                <span>📜 Honest Causal Audit Log</span>
                <span style="font-size:0.68rem;color:#94a3b8;">Live Telemetry</span>
              </h3>
              <div class="px-log-list px-scroll" id="px-causal-log"></div>
            </div>

            <div class="px-card" id="px-debug-panel" ${this.debugVisible ? '' : 'hidden'}>
              <h3 class="px-card-title">🔧 Deterministic Debug Telemetry</h3>
              <pre id="px-debug-pre" style="margin:0;font-size:0.7rem;color:#38bdf8;white-space:pre-wrap;"></pre>
            </div>
          </aside>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#px-arena-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.setupDialogLightDismiss(this.container);
  }

  private bindEvents(): void {
    // Verb Buttons
    this.container
      .querySelector('#px-btn-verb1')
      ?.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'INTERVENE' })
      );
    this.container
      .querySelector('#px-btn-verb2')
      ?.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'SIPHON' })
      );
    this.container
      .querySelector('#px-btn-verb3')
      ?.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'SWERVE' })
      );
    this.container
      .querySelector('#px-btn-chrono')
      ?.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'TOGGLE_CHRONO_BRAKE' })
      );

    // Chamber Jump Tabs
    for (const btn of this.container.querySelectorAll<HTMLButtonElement>('[data-chamber-jump]')) {
      btn.addEventListener('click', () => {
        const ch = Number(btn.getAttribute('data-chamber-jump')) as ChamberNumber;
        if (ch >= 1 && ch <= 5) {
          this.callbacks.onAction({ type: 'JUMP_TO_CHAMBER', chamber: ch });
        }
      });
    }

    // Mute & Restart
    const muteBtn = this.container.querySelector<HTMLButtonElement>('#px-btn-mute');
    muteBtn?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      muteBtn.textContent = muted ? '🔇 Muted' : '🔊 Audio';
    });

    this.container
      .querySelector('#px-btn-restart')
      ?.addEventListener('click', () => this.callbacks.onRestart());

    // Canvas Pointer / Touch Waypoint Navigation
    const updateCanvasWaypoint = (clientX: number, clientY: number): void => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const scaleX = PARADOX_CONFIG.ARENA_WIDTH / rect.width;
      const scaleY = PARADOX_CONFIG.ARENA_HEIGHT / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      this.callbacks.onAction({ type: 'SET_WAYPOINT', x, y });
    };

    let pointerDown = false;
    this.canvas.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      updateCanvasWaypoint(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (pointerDown) {
        updateCanvasWaypoint(e.clientX, e.clientY);
      }
    });
    window.addEventListener('pointerup', () => {
      pointerDown = false;
    });

    // Keyboard Controls
    this.keydownHandler = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'up', pressed: true });
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'down', pressed: true });
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'left', pressed: true });
      } else if (key === 'd' || e.key === 'ArrowRight') {
        if (key === 'd' && e.shiftKey) {
          this.callbacks.onToggleDebug();
          return;
        }
        e.preventDefault();
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'right', pressed: true });
      } else if (key === '1' || key === 'q') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'INTERVENE' });
      } else if (key === '2' || key === 'e') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'SIPHON' });
      } else if (key === '3' || e.key === ' ') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_VERB', verb: 'SWERVE' });
      } else if (e.key === 'Shift') {
        this.callbacks.onAction({ type: 'TOGGLE_CHRONO_BRAKE', active: true });
      } else if (key === 'p') {
        this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'up', pressed: false });
      } else if (key === 's' || e.key === 'ArrowDown') {
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'down', pressed: false });
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'left', pressed: false });
      } else if (key === 'd' || e.key === 'ArrowRight') {
        this.callbacks.onAction({ type: 'SET_MOVE_KEY', key: 'right', pressed: false });
      } else if (e.key === 'Shift') {
        this.callbacks.onAction({ type: 'TOGGLE_CHRONO_BRAKE', active: false });
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
  }

  public consumeEvents(state: ParadoxGameState, events: ParadoxEvent[]): void {
    for (const ev of events) {
      if (ev.type === 'VERB_INTERVENE' || ev.type === 'POD_SAVED') {
        this.audio.playIntervenePulse();
      } else if (ev.type === 'VERB_SIPHON') {
        this.audio.playSiphonBeam();
      } else if (ev.type === 'PREDICTION_SHATTERED' || ev.type === 'VERB_SWERVE') {
        this.audio.playQuantumSwerve();
      } else if (ev.type === 'MIRROR_WAVE_STARTED') {
        this.audio.playMirrorWaveAlert();
      } else if (ev.type === 'UPGRADE_INSTALLED') {
        this.audio.playTheseusInstall();
      }

      const px = ev.x ?? state.player.x;
      const py = ev.y ?? state.player.y;
      const color = ev.color ?? '#38bdf8';

      this.popups.push({
        text: ev.message,
        x: px,
        y: py - 14,
        color,
        alpha: 1.0,
        vy: -28,
      });

      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * 85,
          vy: Math.sin(angle) * 85,
          color,
          alpha: 1,
          size: 3.5,
        });
      }
    }
  }

  public render(state: ParadoxGameState, career: ParadoxCareerStats, dtMs: number): void {
    const chDef = PARADOX_CHAMBERS[state.chamber - 1];

    // 1. Update Chamber Banner & Verb Labels when chamber changes
    if (this.lastRenderedChamber !== state.chamber) {
      this.lastRenderedChamber = state.chamber;

      const bannerEl = this.container.querySelector('#px-chamber-banner-text');
      if (bannerEl) {
        bannerEl.innerHTML = `
          <strong>${chDef.title}</strong> (${chDef.philosopherLineage})<br/>
          <em>"${chDef.centralQuestion}"</em> — ${chDef.tacticalBrief}
        `;
      }

      const v1Title = this.container.querySelector('#px-verb1-title');
      const v1Desc = this.container.querySelector('#px-verb1-desc');
      const v2Title = this.container.querySelector('#px-verb2-title');
      const v2Desc = this.container.querySelector('#px-verb2-desc');
      const v3Title = this.container.querySelector('#px-verb3-title');
      const v3Desc = this.container.querySelector('#px-verb3-desc');

      if (v1Title) v1Title.textContent = chDef.verb1Label;
      if (v1Desc) v1Desc.textContent = chDef.verb1Desc;
      if (v2Title) v2Title.textContent = chDef.verb2Label;
      if (v2Desc) v2Desc.textContent = chDef.verb2Desc;
      if (v3Title) v3Title.textContent = chDef.verb3Label;
      if (v3Desc) v3Desc.textContent = chDef.verb3Desc;

      for (const tab of this.container.querySelectorAll<HTMLButtonElement>('[data-chamber-jump]')) {
        const num = Number(tab.getAttribute('data-chamber-jump'));
        if (num === state.chamber) {
          tab.setAttribute('aria-current', 'step');
        } else {
          tab.removeAttribute('aria-current');
        }
      }
    }

    // 2. Update HUD Metrics
    const remSec = Math.max(
      0,
      PARADOX_CONFIG.CHAMBER_DURATION_SECONDS - state.chamberElapsedMs / 1000
    ).toFixed(1);
    const actEl = this.container.querySelector<HTMLElement>('#px-act-indicator');
    if (actEl) {
      actEl.setAttribute('data-act', state.act);
      actEl.textContent =
        state.act === 'ACT_A_CALIBRATION'
          ? `ACT A: CALIBRATION (${remSec}s)`
          : `⚡ ACT B: MIRROR WAVE (${remSec}s)`;
    }

    const scoreEl = this.container.querySelector('#px-val-score');
    if (scoreEl) scoreEl.textContent = `${state.score.toLocaleString()} pts`;

    const alivePods = state.pods.filter((p) => p.alive).length;
    const hpEl = this.container.querySelector('#px-val-hp');
    if (hpEl) {
      hpEl.textContent = `${Math.round(state.player.hp)} HP · ${alivePods}/${state.pods.length} Pods`;
    }

    const energyEl = this.container.querySelector('#px-val-energy');
    if (energyEl) {
      energyEl.textContent = `${Math.round(state.player.energy)} / ${state.player.maxEnergy} W`;
    }

    const lockEl = this.container.querySelector<HTMLElement>('#px-val-lock');
    if (lockEl) {
      const pct = Math.round(state.oracle.predictionLockPct);
      lockEl.textContent = `${pct}% (${pct >= 75 ? 'LOCKED!' : pct >= 45 ? 'Tracking' : 'Unpredictable'})`;
      lockEl.style.color = pct >= 75 ? '#f43f5e' : pct >= 45 ? '#eab308' : '#38bdf8';
    }

    const humEl = this.container.querySelector<HTMLElement>('#px-val-humanity');
    if (humEl) {
      humEl.textContent = `${state.soul.humanity}% (${
        state.soul.humanity <= 25
          ? 'Post-Human'
          : state.soul.humanity <= 50
            ? 'Cyborg Hybrid'
            : 'Biological'
      })`;
      humEl.style.color =
        state.soul.humanity <= 25 ? '#eab308' : state.soul.humanity <= 50 ? '#a855f7' : '#10b981';
    }

    const chronoSub = this.container.querySelector('#px-chrono-sub');
    if (chronoSub) {
      chronoSub.textContent = state.player.chronoBrakeActive
        ? '⚡ ACTIVE: Arena slowed to 42%!'
        : 'Slow time to 42% for moral clarity';
    }

    // 3. Update 5-Axis Philosophical Soul Matrix
    const setAxis = (idSuffix: string, val: number, isBipolar: boolean, labelText: string) => {
      const lbl = this.container.querySelector(`#px-lbl-${idSuffix}`);
      const bar = this.container.querySelector<HTMLElement>(`#px-bar-${idSuffix}`);
      if (lbl) lbl.textContent = labelText;
      if (bar) {
        const pct = isBipolar ? ((val + 100) / 200) * 100 : val;
        bar.style.width = `${ Math.max(4, Math.min(100, pct)) }%`;
      }
    };

    setAxis(
      'util',
      state.soul.utilitarian,
      true,
      state.soul.utilitarian > 8
        ? `Utilitarian (+${state.soul.utilitarian})`
        : state.soul.utilitarian < -8
          ? `Kantian (${state.soul.utilitarian})`
          : `Balanced (${state.soul.utilitarian})`
    );
    setAxis(
      'altruism',
      state.soul.altruism,
      true,
      state.soul.altruism >= 0 ? `Altruist (+${state.soul.altruism})` : `Egoist (${state.soul.altruism})`
    );
    setAxis('entropy', state.soul.entropy, false, `${Math.round(state.soul.entropy)}% Free Will`);
    setAxis(
      'trust',
      state.soul.trust,
      true,
      state.soul.trust >= 0 ? `Cooperator (+${state.soul.trust})` : `Defector (${state.soul.trust})`
    );

    const careerBadge = this.container.querySelector('#px-career-badge');
    if (careerBadge) {
      careerBadge.textContent = `${career.discoveredEndings.length}/4 Endings · High ${career.highScore}`;
    }

    // 4. Render Ship of Theseus Upgrade Grid when changed
    if (this.lastInstalledCount !== state.player.installedUpgrades.length) {
      this.lastInstalledCount = state.player.installedUpgrades.length;
      const grid = this.container.querySelector('#px-theseus-grid');
      if (grid) {
        grid.innerHTML = THESEUS_UPGRADES.map((u) => {
          const installed = state.player.installedUpgrades.includes(u.id);
          return `
            <button
              type="button"
              class="px-upgrade-chip"
              data-install-upgrade="${u.id}"
              ${installed ? 'disabled' : ''}
            >
              <strong style="color:${u.accentColor};display:block;">
                ${installed ? '✓ ' : '+ '}${u.title}
              </strong>
              <span style="display:block;color:#94a3b8;margin-top:2px;">
                Deletes: <em>${u.sacrificedMemory}</em>
              </span>
            </button>
          `;
        }).join('');

        for (const btn of grid.querySelectorAll<HTMLButtonElement>('[data-install-upgrade]')) {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-install-upgrade') as TheseusModuleId;
            this.callbacks.onAction({ type: 'INSTALL_UPGRADE', upgradeId: id });
          });
        }
      }
    }

    // 5. Render Causal Audit Logs & Counterfactual Table when head changes
    const headId = state.causalLogs[0]?.id ?? '';
    if (this.lastLogHeadId !== headId) {
      this.lastLogHeadId = headId;
      const logContainer = this.container.querySelector('#px-causal-log');
      if (logContainer) {
        logContainer.innerHTML = state.causalLogs
          .slice(0, 10)
          .map(
            (item) => `
            <div class="px-log-item">
              <strong>[Ch.${item.chamber} · ${item.timestampSec}s] ${item.headline}</strong>
              <span>${item.philosophicalNote}</span>
            </div>
          `
          )
          .join('');
      }

      this.renderCounterfactualDialog(state);
    }

    // 6. Render Chamber Dilemma or Final Victory Modal Overlay
    if (this.lastRenderedStatus !== `${state.status}-${state.chamber}`) {
      this.lastRenderedStatus = `${state.status}-${state.chamber}`;
      this.renderStatusOverlay(state);
    }

    // 7. Render Debug Telemetry
    if (this.debugVisible) {
      const pre = this.container.querySelector('#px-debug-pre');
      if (pre) {
        pre.textContent = JSON.stringify(
          {
            seed: state.seed,
            rngCalls: state.rngState.calls,
            chamber: state.chamber,
            act: state.act,
            status: state.status,
            playerPos: [Math.round(state.player.x), Math.round(state.player.y)],
            oraclePredictedPos: [
              Math.round(state.oracle.predictedX),
              Math.round(state.oracle.predictedY),
            ],
            predictionLockPct: Math.round(state.oracle.predictionLockPct),
            verbCounts: state.verbCounts,
            soul: state.soul,
          },
          null,
          2
        );
      }
    }

    // 8. Draw 2D Tactical Arena Canvas
    this.drawCanvas(state, dtMs);
  }

  private renderCounterfactualDialog(state: ParadoxGameState): void {
    const body = this.container.querySelector('#px-cf-dialog-body');
    if (!body) return;

    const rows = runCounterfactualComparison(state);
    body.innerHTML = `
      <table class="px-cf-table">
        <thead>
          <tr>
            <th>Timeline Policy</th>
            <th>Philosophical Signature</th>
            <th>Score</th>
            <th>Pods Saved</th>
            <th>Humanity</th>
            <th>Oracle Lock</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r, i) => `
            <tr style="${i === 0 ? 'background:rgba(56,189,248,0.12);font-weight:700;' : ''}">
              <td>${r.policyName}</td>
              <td>${r.philosophyTag}<br/><small style="color:#94a3b8;">${r.summaryDelta}</small></td>
              <td>${r.projectedScore.toLocaleString()}</td>
              <td>${r.podsSaved}</td>
              <td>${r.humanityRetained}%</td>
              <td>${r.oracleLockAvg}%</td>
              <td>${r.verdictTitle}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private renderStatusOverlay(state: ParadoxGameState): void {
    const overlay = this.container.querySelector<HTMLElement>('#px-dilemma-overlay');
    if (!overlay) return;

    if (state.status === 'PLAYING') {
      overlay.hidden = true;
      overlay.innerHTML = '';
      return;
    }

    if (state.status === 'PAUSED') {
      overlay.hidden = false;
      overlay.innerHTML = `
        <div class="px-dilemma-card">
          <h3 style="margin-top:0;color:#38bdf8;">⏸ SIMULATION PAUSED</h3>
          <p style="font-size:0.88rem;color:#cbd5e1;">
            Take a breath and inspect your 5-Axis Philosophical Soul Matrix or the Counterfactual Mirror Lab.
          </p>
          <button type="button" class="px-btn px-btn-accent" id="px-btn-resume">▶ Resume Chamber</button>
        </div>
      `;
      overlay
        .querySelector('#px-btn-resume')
        ?.addEventListener('click', () => this.callbacks.onAction({ type: 'TOGGLE_PAUSE' }));
      return;
    }

    if (state.status === 'CHAMBER_DILEMMA') {
      const chDef = PARADOX_CHAMBERS[state.chamber - 1];
      overlay.hidden = false;
      overlay.innerHTML = `
        <div class="px-dilemma-card">
          <span class="px-eyebrow">CHAMBER ${state.chamber} COMPLETE // AXIOM COVENANT</span>
          <h3 style="margin:6px 0 8px 0;font-size:1.25rem;color:#ffffff;">${chDef.title}</h3>
          <p style="font-size:0.86rem;color:#cbd5e1;line-height:1.45;margin:0;">
            ${chDef.centralQuestion}
          </p>
          <div class="px-dilemma-choices">
            <button type="button" class="px-choice-btn" id="px-choose-left">
              <strong>⟵ ${chDef.dilemmaChoiceLeft.label}</strong>
              <span>${chDef.dilemmaChoiceLeft.subtitle}</span>
            </button>
            <button type="button" class="px-choice-btn" id="px-choose-right">
              <strong>${chDef.dilemmaChoiceRight.label} ⟶</strong>
              <span>${chDef.dilemmaChoiceRight.subtitle}</span>
            </button>
          </div>
        </div>
      `;

      overlay
        .querySelector('#px-choose-left')
        ?.addEventListener('click', () =>
          this.callbacks.onAction({ type: 'CHOOSE_DILEMMA', side: 'LEFT' })
        );
      overlay
        .querySelector('#px-choose-right')
        ?.addEventListener('click', () =>
          this.callbacks.onAction({ type: 'CHOOSE_DILEMMA', side: 'RIGHT' })
        );
      return;
    }

    if (state.status === 'VICTORY') {
      const verdict =
        (state.endingVerdictId && ENDING_VERDICTS[state.endingVerdictId]) ||
        computeEndingVerdict(state);
      const cfRows = runCounterfactualComparison(state);

      overlay.hidden = false;
      overlay.innerHTML = `
        <div class="px-dilemma-card" style="max-width:700px;border-color:${verdict.accentColor};">
          <span class="px-eyebrow" style="color:${verdict.accentColor};">
            ${verdict.archetypeBadge} · ${verdict.philosophicalSchool}
          </span>
          <h3 style="margin:6px 0;font-size:1.35rem;color:#ffffff;">${verdict.title}</h3>
          <blockquote style="margin:8px 0;font-style:italic;font-size:0.82rem;color:#94a3b8;">
            ${verdict.epigraph}
          </blockquote>
          <p style="font-size:0.84rem;color:#e2e8f0;line-height:1.45;">
            ${verdict.summary}
          </p>
          <div style="background:#070a14;border-left:3px solid ${verdict.accentColor};padding:8px 12px;text-align:left;margin:10px 0;border-radius:6px;">
            <strong style="font-size:0.76rem;color:${verdict.accentColor};display:block;">
              FINAL SOCRATIC QUESTION:
            </strong>
            <span style="font-size:0.82rem;color:#f8fafc;">${verdict.thoughtExperimentQuestion}</span>
          </div>
          <div style="font-size:0.78rem;color:#cbd5e1;margin-bottom:12px;">
            <strong>Final Score:</strong> ${state.score.toLocaleString()} pts ·
            <strong>Pods Saved:</strong> ${state.podsSavedTotal} ·
            <strong>Oracle Locks Shattered:</strong> ${state.oracle.predictionsBroken} ·
            <strong>Humanity Retained:</strong> ${state.soul.humanity}%
          </div>
          <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:12px;">
            <strong>Counterfactual Benchmark:</strong> Guardian (${cfRows[1].projectedScore} pts) ·
            Theseus Machine (${cfRows[2].projectedScore} pts) ·
            Existential Maverick (${cfRows[3].projectedScore} pts)
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-accent" id="px-btn-play-again">
              ↻ Run New Seeded Timeline
            </button>
            <button
              type="button"
              class="px-btn"
              commandfor="px-counterfactual-dialog"
              command="show-modal"
            >
              ⚖ Inspect Full Counterfactual Table
            </button>
          </div>
        </div>
      `;

      overlay
        .querySelector('#px-btn-play-again')
        ?.addEventListener('click', () => this.callbacks.onRestart());
    }
  }

  private drawCanvas(state: ParadoxGameState, dtMs: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const W = PARADOX_CONFIG.ARENA_WIDTH;
    const H = PARADOX_CONFIG.ARENA_HEIGHT;
    const dtSec = dtMs / 1000;

    ctx.clearRect(0, 0, W, H);

    // 1. Cybernetic Grid Background
    ctx.fillStyle = state.player.chronoBrakeActive ? '#09071a' : '#050811';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = state.act === 'ACT_B_MIRROR' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(56, 189, 248, 0.09)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 2. Chamber-Specific Architectural Diagram
    if (state.chamber === 1) {
      // Draw Trolley Tracks splitting from (40, H/2) to Track Alpha (Top-Right) & Track Beta (Bottom-Right)
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle =
        state.trolleyActiveTrack === 'ALPHA' ? '#f43f5e' : 'rgba(148, 163, 184, 0.25)';
      ctx.beginPath();
      ctx.moveTo(40, H * 0.5);
      ctx.lineTo(W - 105, 130);
      ctx.stroke();

      ctx.strokeStyle =
        state.trolleyActiveTrack === 'BETA' ? '#eab308' : 'rgba(148, 163, 184, 0.25)';
      ctx.beginPath();
      ctx.moveTo(40, H * 0.5);
      ctx.lineTo(W - 105, H - 105);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(
        `ACTIVE TRACK: ${state.trolleyActiveTrack} (Press [1/Q] to Flip Switch)`,
        52,
        H * 0.5 - 16
      );
      ctx.restore();
    } else if (state.chamber === 2 && state.oracle.newcombOutcomeLabel) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(state.oracle.newcombOutcomeLabel, 24, H - 18);
    } else if (state.chamber === 5) {
      // Draw Laplace-9 Boss Core at (W/2, 95)
      const bx = W * 0.5;
      const by = 95;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LAPLACE-9 ARCHITECT (${state.oracle.bossHp}/${state.oracle.bossMaxHp} HP)`, bx, by - 48);
      ctx.restore();
    }

    // 3. Draw Sanctuary Pods
    for (const pod of state.pods) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = !pod.alive
        ? 'rgba(71, 85, 105, 0.25)'
        : pod.shieldedMs > 0
          ? 'rgba(16, 185, 129, 0.3)'
          : 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.lineWidth = pod.shieldedMs > 0 ? 3.5 : 2;
      ctx.strokeStyle = !pod.alive
        ? '#475569'
        : pod.shieldedMs > 0
          ? '#10b981'
          : pod.track === 'ALPHA'
            ? '#38bdf8'
            : '#eab308';
      ctx.stroke();

      ctx.fillStyle = pod.alive ? '#f8fafc' : '#64748b';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pod.label, pod.x, pod.y - 30);
      ctx.fillText(pod.alive ? `${pod.hp}%` : 'LOST', pod.x, pod.y + 4);
      ctx.restore();
    }

    // 4. Draw Axiom Shards
    for (const s of state.shards) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Mirror Clones (Act B / Chambers 4-5)
    for (const clone of state.clones) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(clone.x, clone.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = clone.disposition === 'ALLY' ? 'rgba(16, 185, 129, 0.28)' : 'rgba(244, 63, 94, 0.28)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = clone.color;
      ctx.stroke();

      ctx.fillStyle = clone.color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${clone.label} [${clone.lastMove}]`, clone.x, clone.y - 20);
      ctx.restore();
    }

    // 6. Draw Hazards
    for (const h of state.hazards) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fillStyle = h.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }

    // 7. Draw Laplace-9 Predicted Vector Reticle & Probability Tether
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle =
      state.oracle.predictionLockPct >= 70
        ? 'rgba(244, 63, 94, 0.75)'
        : 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(state.player.x, state.player.y);
    ctx.lineTo(state.oracle.predictedX, state.oracle.predictedY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(state.oracle.predictedX, state.oracle.predictedY, 16, 0, Math.PI * 2);
    ctx.strokeStyle = state.oracle.predictionLockPct >= 70 ? '#f43f5e' : '#38bdf8';
    ctx.stroke();
    ctx.fillStyle = state.oracle.predictionLockPct >= 70 ? '#f43f5e' : '#38bdf8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `ORACLE LOCK ${Math.round(state.oracle.predictionLockPct)}%`,
      state.oracle.predictedX,
      state.oracle.predictedY - 22
    );
    ctx.restore();

    // 8. Draw Player Siphon / Shield Effects & Subject-09 Node
    if (state.player.shieldPulseMs > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, 68, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    if (state.player.siphonBeamMs > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, 85, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, PARADOX_CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = state.soul.humanity <= 25 ? '#eab308' : '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      state.soul.humanity <= 25 ? 'THESEUS-09' : 'SUBJECT-09 (YOU)',
      state.player.x,
      state.player.y + 28
    );
    ctx.restore();

    // 9. Draw Oracle Live Taunt Footer
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(10, 8, W - 20, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(state.oracle.activeTaunt, 18, 24);
    ctx.restore();

    // 10. Update & Draw Particles and Floating Text Popups
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.alpha -= dtSec * 1.9;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy * dtSec;
      pop.alpha -= dtSec * 0.85;
      if (pop.alpha <= 0) {
        this.popups.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    this.container.innerHTML = '';
  }
}
