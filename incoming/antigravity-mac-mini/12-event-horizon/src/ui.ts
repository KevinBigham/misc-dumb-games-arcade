import { HorizonAudioEngine } from './audio';
import { HORIZON_CONFIG } from './config';
import {
  ASTRO_RELIC_CATALOG,
  AstroRelicId,
  HORIZON_VERDICTS,
  HorizonGameMode,
  SHIP_CHASSIS_CATALOG,
  ShipChassisId,
  TRICKSHOT_PUZZLES,
} from './content';
import { HorizonCareerStats } from './persistence';
import {
  HorizonGameState,
  HorizonInputAction,
  HorizonSimEvent,
  predictShipTrajectory,
  runHorizonCounterfactuals,
} from './simulation';

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

export interface HorizonUICallbacks {
  onAction: (action: HorizonInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
}

export class HorizonUIController {
  private container: HTMLElement;
  private audio: HorizonAudioEngine;
  private callbacks: HorizonUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;
  private announcerEl!: HTMLElement | null;

  // HUD DOM elements
  private scoreEl!: HTMLElement;
  private highScoreEl!: HTMLElement;
  private sectorEl!: HTMLElement;
  private gammaEl!: HTMLElement;
  private hullEl!: HTMLElement;
  private energyBarEl!: HTMLElement;
  private energyTextEl!: HTMLElement;
  private chronoEl!: HTMLElement;
  private polygonsEl!: HTMLElement;
  private subtitleEl!: HTMLElement;
  private hintEl!: HTMLElement;
  private relicStripEl!: HTMLElement;
  private logListEl!: HTMLElement;
  private overlayHostEl!: HTMLElement;
  private debugPanelEl!: HTMLElement;
  private labBodyEl!: HTMLElement;

  // Visual Juice state
  private popups: FloatingPopup[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private stars: StarParticle[] = [];
  private pointerDown: boolean = false;
  private lastModalKey: string = '';

  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    audio: HorizonAudioEngine,
    callbacks: HorizonUICallbacks,
    initialDebug: boolean = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: ((i * 137.5) % 1) * HORIZON_CONFIG.ARENA_WIDTH,
        y: ((i * 293.7) % 1) * HORIZON_CONFIG.ARENA_HEIGHT,
        size: 1 + (i % 3) * 0.75,
        alpha: 0.25 + (i % 5) * 0.14,
        speed: 4 + (i % 4) * 3,
      });
    }

    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.mountDOM();
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keydownHandler);
    }
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    if (this.debugPanelEl) {
      this.debugPanelEl.hidden = !visible;
    }
  }

  public resetVisuals(): void {
    this.popups = [];
    this.shockwaves = [];
    this.lastModalKey = '';
    if (this.overlayHostEl) {
      this.overlayHostEl.innerHTML = '';
      this.overlayHostEl.hidden = true;
    }
  }

  private announce(msg: string): void {
    if (this.announcerEl) {
      this.announcerEl.textContent = msg;
    }
  }

  private mountDOM(): void {
    this.container.innerHTML = `
      <style>
        .eh-root {
          --eh-bg-light: #060913;
          --eh-bg-dark: #050711;
          --eh-bg: var(--eh-bg-dark);
          --eh-surface-light: #0f172a;
          --eh-surface-dark: #0b1120;
          --eh-surface: var(--eh-surface-dark);
          --eh-border: #1e293b;
          --eh-accent: #38bdf8;
          --eh-gold: #fbbf24;
          --eh-violet: #a855f7;
          --eh-emerald: #10b981;
          --eh-rose: #f43f5e;
          --eh-text: #f8fafc;
          --eh-muted: #94a3b8;
          color-scheme: light dark;
          container-type: inline-size;
          container-name: ehstage;
          background: radial-gradient(circle at 50% 15%, #0c1938 0%, var(--eh-bg) 72%);
          color: var(--eh-text);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0.85rem;
          border-radius: 0.85rem;
          border: 1px solid #1e3a5f;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
        }

        @supports (color: light-dark(white, black)) {
          .eh-root {
            --eh-bg: light-dark(var(--eh-bg-light), var(--eh-bg-dark));
            --eh-surface: light-dark(var(--eh-surface-light), var(--eh-surface-dark));
          }
        }

        .eh-root :where(button, select, input):focus-visible {
          outline: 3px solid var(--eh-accent);
          outline-offset: 2px;
        }

        .eh-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          margin-block-end: 0.7rem;
          padding-block-end: 0.6rem;
          border-block-end: 1px solid var(--eh-border);
        }

        .eh-title-block h2 {
          margin: 0;
          font-size: clamp(1.1rem, 0.9rem + 1vw, 1.55rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #38bdf8, #fbbf24, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .eh-title-block p {
          margin: 0.15rem 0 0;
          font-size: 0.8rem;
          color: var(--eh-muted);
        }

        .eh-mode-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
        }

        .eh-btn {
          min-block-size: 28px;
          min-inline-size: 28px;
          padding: 0.35rem 0.7rem;
          border-radius: 0.45rem;
          border: 1px solid #334155;
          background: #111c33;
          color: var(--eh-text);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        @media (pointer: coarse) {
          .eh-btn {
            min-block-size: 44px;
            min-inline-size: 44px;
          }
        }

        .eh-btn:hover {
          border-color: var(--eh-accent);
          background: #1e293b;
        }

        .eh-btn-accent {
          background: linear-gradient(135deg, #0284c7, #2563eb);
          border-color: #38bdf8;
          color: #ffffff;
        }

        .eh-btn-gold {
          background: linear-gradient(135deg, #d97706, #b45309);
          border-color: #fbbf24;
          color: #ffffff;
        }

        .eh-hud-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
          margin-block-end: 0.65rem;
        }

        @media (min-width: 720px) {
          .eh-hud-strip {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 680px) {
            .eh-hud-strip {
              grid-template-columns: repeat(6, 1fr);
            }
          }
        }

        .eh-metric {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 0.5rem;
          padding: 0.4rem 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .eh-metric-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--eh-muted);
          font-weight: 700;
        }

        .eh-metric-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.96rem;
          font-weight: 800;
        }

        .eh-energy-track {
          inline-size: 100%;
          block-size: 6px;
          background: #090d16;
          border-radius: 999px;
          overflow: hidden;
          margin-block-start: 2px;
        }

        .eh-energy-fill {
          block-size: 100%;
          background: linear-gradient(90deg, #38bdf8, #a855f7);
          transition: inline-size 0.08s linear;
        }

        /* Main Layout Grid */
        .eh-layout {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 980px) {
          .eh-layout {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 920px) {
            .eh-layout {
              flex-direction: row;
              align-items: flex-start;
            }
          }
        }

        .eh-canvas-col {
          flex: 1 1 auto;
          min-inline-size: 0;
        }

        .eh-canvas-wrap {
          position: relative;
          inline-size: 100%;
          aspect-ratio: 960 / 600;
          background: #03060c;
          border-radius: 0.65rem;
          border: 1px solid #334155;
          overflow: hidden;
          box-shadow: inset 0 0 40px rgba(14, 165, 233, 0.12);
        }

        .eh-canvas {
          display: block;
          inline-size: 100%;
          block-size: 100%;
          touch-action: none;
          cursor: crosshair;
        }

        .eh-overlay-host {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 18, 0.86);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 20;
        }

        .eh-overlay-host[hidden] {
          display: none !important;
        }

        .eh-modal-card {
          max-inline-size: 680px;
          inline-size: 100%;
          background: #0f172a;
          border: 1px solid #38bdf8;
          border-radius: 0.75rem;
          padding: 1.15rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        .eh-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.65rem;
          margin-block-start: 0.75rem;
        }

        .eh-relic-choice {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 0.35rem;
          padding: 0.75rem;
          border-radius: 0.6rem;
          border: 1px solid #334155;
          background: #131c31;
          color: var(--eh-text);
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease;
        }

        .eh-relic-choice:hover {
          transform: translateY(-2px);
          border-color: #38bdf8;
          background: #1e293b;
        }

        .eh-action-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.45rem;
          margin-block-start: 0.55rem;
          padding: 0.5rem 0.65rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #1e293b;
          border-radius: 0.55rem;
        }

        .eh-side-col {
          inline-size: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        @supports (container-type: inline-size) {
          @container ehstage (min-width: 920px) {
            .eh-side-col {
              inline-size: 310px;
              flex: 0 0 310px;
            }
          }
        }

        .eh-panel {
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid #1e293b;
          border-radius: 0.6rem;
          padding: 0.7rem;
        }

        .eh-panel h3 {
          margin: 0 0 0.45rem;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #38bdf8;
        }

        .eh-relic-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .eh-relic-pill {
          font-size: 0.74rem;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          background: #1e293b;
          border: 1px solid #38bdf8;
          font-weight: 700;
        }

        .eh-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-block-size: 135px;
          overflow-y: auto;
          font-size: 0.74rem;
          color: var(--eh-muted);
          display: grid;
          gap: 0.25rem;
          scrollbar-width: thin;
          scrollbar-color: #334155 #090d16;
        }
      </style>

      <div class="eh-root">
        <div id="eh-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <header class="eh-header">
          <div class="eh-title-block">
            <h2>🪐⚡ EVENT HORIZON: SINGULARITY SLINGSHOT</h2>
            <p id="eh-sector-subtitle">Relativistic Orbital Billiards, Bullet-Time Gravity Tether &amp; Constellation Relic Deckbuilder</p>
          </div>

          <div class="eh-mode-bar" role="group" aria-label="Game Mode & Hull Selection">
            <button type="button" class="eh-btn eh-btn-accent" data-eh-mode="ODYSSEY">
              🌌 Odyssey (5 Sectors)
            </button>
            <button type="button" class="eh-btn" data-eh-mode="TRICKSHOT_DOJO">
              📐 Trickshot Dojo (5 Puzzles)
            </button>
            <button type="button" class="eh-btn" data-eh-mode="ENDLESS_SINGULARITY">
              ♾️ Endless Singularity
            </button>

            <label for="eh-chassis-select" class="visually-hidden">Ship Chassis</label>
            <select id="eh-chassis-select" class="eh-btn" aria-label="Select Ship Chassis">
              <option value="VANGUARD">🚀 Vanguard Lance (Balanced)</option>
              <option value="PHOTON_WISP">✨ Photon Wisp (High Bounce + Echo)</option>
              <option value="STAR_HAMMER">🔨 Star-Hammer (Heavy Ram + Nova)</option>
            </select>

            <button type="button" class="eh-btn" id="eh-btn-mute">🔊 Audio</button>
            <button type="button" class="eh-btn" id="eh-btn-restart">↻ New Run</button>
          </div>
        </header>

        <div class="eh-hud-strip" role="region" aria-label="Relativistic Flight Telemetry">
          <div class="eh-metric">
            <span class="eh-metric-label">Score / High</span>
            <span class="eh-metric-val"><span id="eh-score">0</span> <small style="color:#64748b">/ <span id="eh-high">0</span></small></span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Sector / Wave</span>
            <span class="eh-metric-val" id="eh-sector" style="color:#38bdf8">Sector 1 / 5</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Lorentz Factor (γ)</span>
            <span class="eh-metric-val" id="eh-gamma" style="color:#fbbf24">1.05x γ</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Ship Hull Integrity</span>
            <span class="eh-metric-val" id="eh-hull" style="color:#10b981">♥♥♥♥♥ (5/5)</span>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Hawking Energy <span id="eh-energy-text">75/100</span></span>
            <div class="eh-energy-track"><div id="eh-energy-bar" class="eh-energy-fill" style="inline-size:75%"></div></div>
          </div>
          <div class="eh-metric">
            <span class="eh-metric-label">Chrono / Polygons</span>
            <span class="eh-metric-val"><span id="eh-chrono" style="color:#a855f7">⏳×2</span> · <span id="eh-polygons" style="color:#38bdf8">📐 0</span></span>
          </div>
        </div>

        <div class="eh-layout">
          <div class="eh-canvas-col">
            <div class="eh-canvas-wrap">
              <canvas
                id="eh-canvas"
                class="eh-canvas"
                width="${HORIZON_CONFIG.ARENA_WIDTH}"
                height="${HORIZON_CONFIG.ARENA_HEIGHT}"
                aria-label="Event Horizon Orbital Slingshot Arena"
              ></canvas>
              <div id="eh-overlay-host" class="eh-overlay-host" hidden></div>
            </div>

            <div class="eh-action-bar" role="toolbar" aria-label="Relativistic Ship Abilities">
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button type="button" class="eh-btn eh-btn-gold" id="eh-act-coach">
                  🎯 [C] AI Trickshot Launch
                </button>
                <button type="button" class="eh-btn eh-btn-accent" id="eh-act-launch">
                  🚀 [Space] Slingshot Fire
                </button>
                <button type="button" class="eh-btn" id="eh-act-tether">
                  🔗 [Q] Quantum Tether Whip
                </button>
                <button type="button" class="eh-btn" id="eh-act-nova">
                  💥 [E] Supernova (35W)
                </button>
                <button type="button" class="eh-btn" id="eh-act-rewind">
                  ⏳ [R] Chrono-Rewind + Echo
                </button>
              </div>
              <div style="font-size:0.75rem; color:#94a3b8;">
                <strong>Controls:</strong> Click-Drag on Arena to Bullet-Time Aim &amp; Slingshot · WASD/Arrows Thrust
              </div>
            </div>
          </div>

          <aside class="eh-side-col" aria-label="Mission Briefing, Relics, and Trajectory Lab">
            <div class="eh-panel">
              <h3>🛰️ Tactical Briefing</h3>
              <p id="eh-hint-text" style="margin:0; font-size:0.78rem; color:#cbd5e1; line-height:1.45;"></p>
            </div>

            <div class="eh-panel">
              <h3>👑 Active Astro-Relics</h3>
              <ul id="eh-relic-strip" class="eh-relic-pills" role="list">
                <li style="font-size:0.75rem; color:#64748b;">Clear a sector to draft multiplicative Astro-Relics!</li>
              </ul>
            </div>

            <div class="eh-panel">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-block-end:0.35rem;">
                <h3 style="margin:0;">🔬 Counterfactual Lab</h3>
                <button type="button" class="eh-btn" id="eh-btn-run-lab" style="padding:0.2rem 0.5rem; font-size:0.72rem;">
                  Simulate 3 AI Builds
                </button>
              </div>
              <div id="eh-lab-body" style="font-size:0.74rem; color:#94a3b8;">
                Compare Euclidean Geometer, Tether Daredevil, and Worldline Weaver on this exact seed.
              </div>
            </div>

            <div class="eh-panel">
              <h3>📡 Telemetry Log</h3>
              <ul id="eh-log-list" class="eh-log-list" role="list"></ul>
            </div>

            <div id="eh-debug-panel" class="eh-panel" hidden></div>
          </aside>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector<HTMLCanvasElement>('#eh-canvas')!;
    this.ctx = this.canvas.getContext('2d');
    this.announcerEl = this.container.querySelector<HTMLElement>('#eh-announcer');

    this.scoreEl = this.container.querySelector<HTMLElement>('#eh-score')!;
    this.highScoreEl = this.container.querySelector<HTMLElement>('#eh-high')!;
    this.sectorEl = this.container.querySelector<HTMLElement>('#eh-sector')!;
    this.gammaEl = this.container.querySelector<HTMLElement>('#eh-gamma')!;
    this.hullEl = this.container.querySelector<HTMLElement>('#eh-hull')!;
    this.energyBarEl = this.container.querySelector<HTMLElement>('#eh-energy-bar')!;
    this.energyTextEl = this.container.querySelector<HTMLElement>('#eh-energy-text')!;
    this.chronoEl = this.container.querySelector<HTMLElement>('#eh-chrono')!;
    this.polygonsEl = this.container.querySelector<HTMLElement>('#eh-polygons')!;
    this.subtitleEl = this.container.querySelector<HTMLElement>('#eh-sector-subtitle')!;
    this.hintEl = this.container.querySelector<HTMLElement>('#eh-hint-text')!;
    this.relicStripEl = this.container.querySelector<HTMLElement>('#eh-relic-strip')!;
    this.logListEl = this.container.querySelector<HTMLElement>('#eh-log-list')!;
    this.overlayHostEl = this.container.querySelector<HTMLElement>('#eh-overlay-host')!;
    this.debugPanelEl = this.container.querySelector<HTMLElement>('#eh-debug-panel')!;
    this.labBodyEl = this.container.querySelector<HTMLElement>('#eh-lab-body')!;

    this. debugPanelEl.hidden = !this.debugVisible;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Pointer aiming & slingshot launch on canvas
    const toArenaCoords = (clientX: number, clientY: number): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = HORIZON_CONFIG.ARENA_WIDTH / Math.max(1, rect.width);
      const scaleY = HORIZON_CONFIG.ARENA_HEIGHT / Math.max(1, rect.height);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TOGGLE_TETHER' });
        return;
      }
      this.pointerDown = true;
      const pt = toArenaCoords(e.clientX, e.clientY);
      this.updateAimFromPoint(pt.x, pt.y, true);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.pointerDown) return;
      const pt = toArenaCoords(e.clientX, e.clientY);
      this.updateAimFromPoint(pt.x, pt.y, false);
    });

    const releasePointer = (e: PointerEvent): void => {
      if (!this.pointerDown) return;
      this.pointerDown = false;
      const pt = toArenaCoords(e.clientX, e.clientY);
      const { angleRad, powerPct } = this.computeAimVector(pt.x, pt.y);
      this.callbacks.onAction({ type: 'LAUNCH_SLINGSHOT', angleRad, powerPct });
    };

    this.canvas.addEventListener('pointerup', releasePointer);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mode buttons
    for (const btn of this.container.querySelectorAll<HTMLButtonElement>('button[data-eh-mode]')) {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-eh-mode') as HorizonGameMode;
        this.resetVisuals();
        this.callbacks.onAction({ type: 'SELECT_MODE', mode, sectorOrPuzzle: 1 });
        this.announce(`Switched to ${mode} mode`);
      });
    }

    // Chassis selector
    const chassisSelect = this.container.querySelector<HTMLSelectElement>('#eh-chassis-select');
    chassisSelect?.addEventListener('change', () => {
      const val = chassisSelect.value as ShipChassisId;
      this.callbacks.onAction({ type: 'SELECT_CHASSIS', chassis: val });
      this.announce(`Selected ${val} ship chassis`);
    });

    // Action toolbar buttons
    this.container
      .querySelector<HTMLButtonElement>('#eh-act-coach')
      ?.addEventListener('click', () => this.callbacks.onAction({ type: 'TRIGGER_AI_COACH' }));
    this.container
      .querySelector<HTMLButtonElement>('#eh-act-launch')
      ?.addEventListener('click', () => this.callbacks.onAction({ type: 'LAUNCH_SLINGSHOT' }));
    this.container
      .querySelector<HTMLButtonElement>('#eh-act-tether')
      ?.addEventListener('click', () => this.callbacks.onAction({ type: 'TOGGLE_TETHER' }));
    this.container
      .querySelector<HTMLButtonElement>('#eh-act-nova')
      ?.addEventListener('click', () => this.callbacks.onAction({ type: 'TRIGGER_SUPERNOVA' }));
    this.container
      .querySelector<HTMLButtonElement>('#eh-act-rewind')
      ?.addEventListener('click', () => this.callbacks.onAction({ type: 'TRIGGER_REWIND' }));

    const muteBtn = this.container.querySelector<HTMLButtonElement>('#eh-btn-mute');
    muteBtn?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      muteBtn.textContent = muted ? '🔇 Muted' : '🔊 Audio';
    });

    this.container
      .querySelector<HTMLButtonElement>('#eh-btn-restart')
      ?.addEventListener('click', () => {
        this.resetVisuals();
        this.callbacks.onRestart();
      });

    this.container
      .querySelector<HTMLButtonElement>('#eh-btn-run-lab')
      ?.addEventListener('click', () => {
        this.renderCounterfactualLab();
      });
  }

  private lastRenderedShipX: number = 190;
  private lastRenderedShipY: number = 300;
  private lastRenderedSeed: number = HORIZON_CONFIG.DEFAULT_SEED;

  private computeAimVector(targetX: number, targetY: number): { angleRad: number; powerPct: number } {
    const dx = targetX - this.lastRenderedShipX;
    const dy = targetY - this.lastRenderedShipY;
    const dist = Math.hypot(dx, dy);
    const angleRad = Math.atan2(dy, dx);
    const powerPct = Math.max(0.25, Math.min(1.0, dist / 240));
    return { angleRad, powerPct };
  }

  private updateAimFromPoint(targetX: number, targetY: number, isStart: boolean): void {
    const { angleRad, powerPct } = this.computeAimVector(targetX, targetY);
    if (isStart) {
      this.callbacks.onAction({ type: 'BEGIN_AIM', angleRad, powerPct });
    } else {
      this.callbacks.onAction({ type: 'UPDATE_AIM', angleRad, powerPct });
    }
  }

  private renderCounterfactualLab(): void {
    if (!this.labBodyEl) return;
    const results = runHorizonCounterfactuals(this.lastRenderedSeed);
    this.labBodyEl.innerHTML = results
      .map(
        (r) => `
        <div style="padding:0.35rem 0; border-bottom:1px solid #1e293b;">
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#f8fafc;">
            <span>${r.archetypeName}</span>
            <span style="color:#fbbf24;">${r.finalScore.toLocaleString()} pts</span>
          </div>
          <div style="font-size:0.7rem; color:#94a3b8;">
            📐 ${r.polygonsEnclosed} Polygons · Peak γ=${r.peakLorentzGamma.toFixed(2)}x · ${r.verdictTitle}
          </div>
        </div>
      `
      )
      .join('');
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    const key = e.key.toLowerCase();
    if (key === 'q') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'TOGGLE_TETHER' });
    } else if (key === 'e') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'TRIGGER_SUPERNOVA' });
    } else if (key === 'r') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'TRIGGER_REWIND' });
    } else if (key === 'c') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'TRIGGER_AI_COACH' });
    } else if (key === ' ') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'LAUNCH_SLINGSHOT' });
    } else if (key === 'w' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'NUDGE_THRUST', dx: 0, dy: -1 });
    } else if (key === 's' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'NUDGE_THRUST', dx: 0, dy: 1 });
    } else if (key === 'a' || e.key === 'ArrowLeft') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'NUDGE_THRUST', dx: -1, dy: 0 });
    } else if (key === 'd' || e.key === 'ArrowRight') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'NUDGE_THRUST', dx: 1, dy: 0 });
    } else if (key === 'p') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
    }
  }

  public consumeEvents(state: HorizonGameState, events: readonly HorizonSimEvent[]): void {
    for (const ev of events) {
      this.audio.playEvent(ev);
      this.popups.push({
        x: ev.x,
        y: ev.y,
        vy: -36,
        text: ev.text,
        color: ev.color,
        alpha: 1.0,
      });

      if (
        ev.type === 'SUPERNOVA_PULSE' ||
        ev.type === 'CONSTELLATION_ENCLOSED' ||
        ev.type === 'WORMHOLE_TRANSIT' ||
        ev.type === 'ROCHE_CRUSH'
      ) {
        this.shockwaves.push({
          x: ev.x,
          y: ev.y,
          radius: 18,
          maxRadius: ev.type === 'SUPERNOVA_PULSE' ? ev.magnitude ?? 190 : 145,
          color: ev.color,
          alpha: 0.9,
        });
      }

      if (
        ev.type === 'CONSTELLATION_ENCLOSED' ||
        ev.type === 'SECTOR_CLEARED' ||
        ev.type === 'VICTORY' ||
        ev.type === 'GAME_OVER'
      ) {
        this.announce(ev.text);
      }
    }
  }

  public render(state: HorizonGameState, career: HorizonCareerStats, dtMs: number): void {
    this.lastRenderedShipX = state.ship.x;
    this.lastRenderedShipY = state.ship.y;
    this.lastRenderedSeed = state.seed;

    // Update HUD metrics
    this.scoreEl.textContent = state.score.toLocaleString();
    this.highScoreEl.textContent = Math.max(career.highScore, state.score).toLocaleString();

    if (state.mode === 'TRICKSHOT_DOJO') {
      this.sectorEl.textContent = `Dojo ${state.sector}/${TRICKSHOT_PUZZLES.length} (Shots: ${state.sectorLaunchesUsed}/${state.parLaunches ?? 1})`;
    } else if (state.mode === 'ODYSSEY') {
      this.sectorEl.textContent = `Sector ${state.sector} / ${HORIZON_CONFIG.TOTAL_CAMPAIGN_SECTORS}`;
    } else {
      this.sectorEl.textContent = `Wave ${state.sector} (Endless)`;
    }

    this.gammaEl.textContent = `${state.ship.lorentzGamma.toFixed(2)}x γ`;
    const hearts = '♥'.repeat(Math.max(0, state.ship.hull)) + '♡'.repeat(Math.max(0, state.ship.maxHull - state.ship.hull));
    this.hullEl.textContent = `${hearts} (${state.ship.hull}/${state.ship.maxHull})`;

    const energyPct = Math.round((state.ship.hawkingEnergy / state.ship.maxHawkingEnergy) * 100);
    this.energyBarEl.style.inlineSize = `${energyPct}%`;
    this.energyTextEl.textContent = `${Math.round(state.ship.hawkingEnergy)}/${state.ship.maxHawkingEnergy}`;
    this.chronoEl.textContent = `⏳×${state.ship.chronoCharges}`;
    this.polygonsEl.textContent = `📐 ${state.stats.polygonsEnclosed}`;

    this.subtitleEl.textContent = `${state.sectorTitle} — ${state.sectorSubtitle}`;
    this.hintEl.textContent = state.sectorHint;

    // Render Active Relics strip
    if (state.relics.length === 0) {
      this.relicStripEl.innerHTML = `<li style="font-size:0.74rem; color:#64748b;">Clear a sector to draft multiplicative Astro-Relics!</li>`;
    } else {
      this.relicStripEl.innerHTML = state.relics
        .map((id) => {
          const spec = ASTRO_RELIC_CATALOG.find((r) => r.id === id);
          return `<li class="eh-relic-pill" style="border-color:${spec?.color ?? '#38bdf8'}" title="${spec?.description ?? ''}">${spec?.symbol ?? '★'} ${spec?.name ?? id}</li>`;
        })
        .join('');
    }

    // Render Telemetry Log
    this.logListEl.innerHTML = state.log
      .slice(0, 8)
      .map((entry) => `<li>• ${entry}</li>`)
      .join('');

    // Render Debug Panel if enabled
    if (this.debugVisible) {
      this.debugPanelEl.hidden = false;
      this.debugPanelEl.innerHTML = `
        <h3>🔧 Deterministic Debug</h3>
        <div style="font-family:monospace; font-size:0.72rem; display:grid; gap:0.2rem;">
          <div>Seed: ${state.seed} · RNG: 0x${state.rngState.toString(16)}</div>
          <div>Tick: ${state.tick} · Status: ${state.status}</div>
          <div>Ship Pos: (${state.ship.x.toFixed(1)}, ${state.ship.y.toFixed(1)})</div>
          <div>Ship Vel: (${state.ship.vx.toFixed(1)}, ${state.ship.vy.toFixed(1)})</div>
          <div>Bounce Chain: ${state.ship.bounceChain} · Vertices: ${state.ship.constellationVertices.length}</div>
        </div>
      `;
    } else {
      this.debugPanelEl.hidden = true;
    }

    this.renderOverlayModal(state, career);
    this.renderCanvas(state, dtMs);
  }

  private renderOverlayModal(state: HorizonGameState, career: HorizonCareerStats): void {
    const modalKey = `${state.status}:${state.sector}:${state.relicDraftChoices.join(',')}`;
    if (state.status === 'PLAYING') {
      this.overlayHostEl.hidden = true;
      this.lastModalKey = '';
      return;
    }
    if (this.lastModalKey === modalKey) return;
    this.lastModalKey = modalKey;
    this.overlayHostEl.hidden = false;

    if (state.status === 'RELIC_DRAFT') {
      const cardsHtml = state.relicDraftChoices
        .map((id) => {
          const spec = ASTRO_RELIC_CATALOG.find((r) => r.id === id)!;
          return `
            <button type="button" class="eh-relic-choice" data-draft-relic="${spec.id}">
              <span style="font-size:1.4rem;">${spec.symbol} <strong style="font-size:0.95rem; color:${spec.color};">${spec.name}</strong></span>
              <span style="font-size:0.76rem; font-weight:700; color:#e2e8f0;">${spec.shortHook}</span>
              <span style="font-size:0.72rem; color:#94a3b8;">${spec.description}</span>
            </button>
          `;
        })
        .join('');

      this.overlayHostEl.innerHTML = `
        <div class="eh-modal-card" role="dialog" aria-label="Draft an Astro-Relic">
          <h3 style="margin:0 0 0.25rem; font-size:1.25rem; color:#38bdf8;">
            🌟 SECTOR ${state.sector} CLEARED — DRAFT AN ASTRO-RELIC
          </h3>
          <p style="margin:0; font-size:0.84rem; color:#cbd5e1;">
            Choose 1 synergistic Constellation Relic before warping to Sector ${state.sector + 1}:
          </p>
          <div class="eh-relic-grid">${cardsHtml}</div>
        </div>
      `;

      for (const btn of this.overlayHostEl.querySelectorAll<HTMLButtonElement>('button[data-draft-relic]')) {
        btn.addEventListener('click', () => {
          const relicId = btn.getAttribute('data-draft-relic') as AstroRelicId;
          this.callbacks.onAction({ type: 'SELECT_RELIC', relicId });
        });
      }
      return;
    }

    if (state.status === 'VICTORY' || state.status === 'GAME_OVER') {
      const verdict =
        HORIZON_VERDICTS[state.verdictId ?? 'KARDASHEV_SOVEREIGN'] ??
        HORIZON_VERDICTS.KARDASHEV_SOVEREIGN;
      const counterfactuals = runHorizonCounterfactuals(state.seed);

      this.overlayHostEl.innerHTML = `
        <div class="eh-modal-card" role="dialog" aria-label="Run Summary and Verdict">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
            <span style="font-size:0.76rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px; background:#1e293b; color:#fbbf24;">
              ${verdict.badge}
            </span>
            <span style="font-family:monospace; font-size:0.78rem; color:#94a3b8;">SEED: ${state.seed}</span>
          </div>
          <h3 style="margin:0.4rem 0 0.2rem; font-size:1.35rem; color:${state.status === 'VICTORY' ? '#10b981' : '#f43f5e'};">
            ${state.status === 'VICTORY' ? '🏆 COSMIC ODYSSEY CONQUERED:' : '🌑 EVENT HORIZON COLLAPSE:'} ${verdict.title}
          </h3>
          <p style="margin:0 0 0.75rem; font-size:0.84rem; color:#cbd5e1;">${verdict.summary}</p>

          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.45rem; margin-block-end:0.85rem; background:#090d16; padding:0.6rem; border-radius:0.5rem;">
            <div><div class="eh-metric-label">Final Score</div><div class="eh-metric-val" style="color:#fbbf24;">${state.score.toLocaleString()}</div></div>
            <div><div class="eh-metric-label">Peak Lorentz γ</div><div class="eh-metric-val" style="color:#38bdf8;">${state.ship.peakLorentzGamma.toFixed(2)}x</div></div>
            <div><div class="eh-metric-label">Polygons Enclosed</div><div class="eh-metric-val" style="color:#10b981;">📐 ${state.stats.polygonsEnclosed}</div></div>
            <div><div class="eh-metric-label">Career Victories</div><div class="eh-metric-val" style="color:#a855f7;">${career.odysseyVictories + career.dojoCompletions}</div></div>
          </div>

          <div style="margin-block-end:0.85rem;">
            <div style="font-size:0.75rem; font-weight:700; color:#38bdf8; margin-block-end:0.35rem;">
              🔬 SAME-SEED COUNTERFACTUAL ARCHETYPE COMPARISON:
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.45rem;">
              ${counterfactuals
                .map(
                  (c) => `
                  <div style="background:#131c31; border:1px solid #334155; border-radius:0.45rem; padding:0.5rem; font-size:0.72rem;">
                    <div style="font-weight:800; color:#f8fafc;">${c.archetypeName}</div>
                    <div style="color:#fbbf24; font-weight:700;">${c.finalScore.toLocaleString()} pts</div>
                    <div style="color:#94a3b8;">📐 ${c.polygonsEnclosed} · γ=${c.peakLorentzGamma.toFixed(1)}x</div>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            <button type="button" class="eh-btn eh-btn-accent" id="eh-modal-restart">
              ▶ Launch New Seed Run
            </button>
            <button type="button" class="eh-btn" id="eh-modal-replay-seed">
              ↻ Replay Exact Same Seed (${state.seed})
            </button>
          </div>
        </div>
      `;

      this.overlayHostEl
        .querySelector<HTMLButtonElement>('#eh-modal-restart')
        ?.addEventListener('click', () => {
          this.resetVisuals();
          this.callbacks.onRestart();
        });
      this.overlayHostEl
        .querySelector<HTMLButtonElement>('#eh-modal-replay-seed')
        ?.addEventListener('click', () => {
          this.resetVisuals();
          this.callbacks.onRestart(state.seed);
        });
    }
  }

  private renderCanvas(state: HorizonGameState, dtMs: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const W = HORIZON_CONFIG.ARENA_WIDTH;
    const H = HORIZON_CONFIG.ARENA_HEIGHT;
    const dtSec = dtMs / 1000;

    // 1. Deep Cosmic Background
    ctx.fillStyle = state.ship.isAiming ? '#040b1d' : '#03060f';
    ctx.fillRect(0, 0, W, H);

    // 2. Relativistic Warped Spacetime Grid
    ctx.save();
    ctx.strokeStyle = state.ship.isAiming
      ? 'rgba(56, 189, 248, 0.16)'
      : 'rgba(51, 65, 85, 0.22)';
    ctx.lineWidth = 1;
    const gridSpacing = 48;

    for (let gx = gridSpacing; gx < W; gx += gridSpacing) {
      ctx.beginPath();
      for (let gy = 0; gy <= H; gy += 24) {
        let wx = gx;
        let wy = gy;
        for (const well of state.wells) {
          const dx = well.x - gx;
          const dy = well.y - gy;
          const dist = Math.hypot(dx, dy);
          if (dist < 220 && dist > 8) {
            const pull = ((well.mass > 0 ? 1 : -1) * 18 * (1 - dist / 220));
            wx += (dx / dist) * pull;
            wy += (dy / dist) * pull;
          }
        }
        if (gy === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }

    for (let gy = gridSpacing; gy < H; gy += gridSpacing) {
      ctx.beginPath();
      for (let gx = 0; gx <= W; gx += 24) {
        let wx = gx;
        let wy = gy;
        for (const well of state.wells) {
          const dx = well.x - gx;
          const dy = well.y - gy;
          const dist = Math.hypot(dx, dy);
          if (dist < 220 && dist > 8) {
            const pull = ((well.mass > 0 ? 1 : -1) * 18 * (1 - dist / 220));
            wx += (dx / dist) * pull;
            wy += (dy / dist) * pull;
          }
        }
        if (gx === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 3. Parallax Stars
    for (const star of this.stars) {
      star.x = (star.x - star.speed * dtSec + W) % W;
      ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Arena Containment Frame
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      HORIZON_CONFIG.WALL_MARGIN,
      HORIZON_CONFIG.WALL_MARGIN,
      W - HORIZON_CONFIG.WALL_MARGIN * 2,
      H - HORIZON_CONFIG.WALL_MARGIN * 2
    );
    ctx.restore();

    // 5. Einstein-Rosen Wormhole Bridge Line (if paired wells exist)
    for (const well of state.wells) {
      if (well.pairedWellId && well.kind === 'BLACK_HOLE') {
        const partner = state.wells.find((w) => w.id === well.pairedWellId);
        if (partner) {
          ctx.save();
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.38)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(well.x, well.y);
          ctx.lineTo(partner.x, partner.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 6. Gravity Wells (Photon Skim Sphere + Accretion Disk + Event Horizon Core)
    for (const well of state.wells) {
      ctx.save();
      // Outer Photon Skim Sphere
      const grad = ctx.createRadialGradient(
        well.x,
        well.y,
        well.coreRadius,
        well.x,
        well.y,
        well.skimRadius
      );
      if (well.kind === 'WHITE_HOLE') {
        grad.addColorStop(0, 'rgba(244, 114, 182, 0.55)');
        grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.18)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (well.kind === 'NEUTRON_STAR') {
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
        grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.18)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.5)');
        grad.addColorStop(0.65, 'rgba(249, 115, 22, 0.16)');
        grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(well.x, well.y, well.skimRadius, 0, Math.PI * 2);
      ctx.fill();

      // Photon Sphere Skim Ring boundary
      ctx.strokeStyle =
        well.kind === 'WHITE_HOLE' ? 'rgba(244, 114, 182, 0.55)' : 'rgba(251, 191, 36, 0.48)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(well.x, well.y, well.skimRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Event Horizon Core
      ctx.fillStyle = well.kind === 'WHITE_HOLE' ? '#fdf4ff' : '#020617';
      ctx.strokeStyle =
        well.kind === 'WHITE_HOLE'
          ? '#f472b6'
          : well.kind === 'NEUTRON_STAR'
            ? '#a855f7'
            : '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(well.x, well.y, well.coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(well.name, well.x, well.y + well.skimRadius + 13);
      ctx.restore();
    }

    // 7. Active Closed Constellation Polygons (Sacred Geometry Laser Overlays!)
    for (const poly of state.activePolygons) {
      const alpha = Math.max(0, poly.ttlMs / poly.maxTtlMs);
      ctx.save();
      ctx.fillStyle = `rgba(56, 189, 248, ${0.28 * alpha})`;
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.95 * alpha})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      poly.vertices.forEach((v, idx) => {
        if (idx === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 8. In-Progress Constellation Chain Cord
    if (state.ship.constellationVertices.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      state.ship.constellationVertices.forEach((v, i) => {
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.lineTo(state.ship.x, state.ship.y);
      ctx.stroke();
      ctx.restore();
    }

    // 9. Relativistic Trajectory Predictor Curve (shown when aiming, in Dojo tee, or Coach preview)
    const showPrediction =
      state.ship.isAiming || (state.mode === 'TRICKSHOT_DOJO' && state.sectorLaunchesUsed === 0);
    if (showPrediction) {
      const points = predictShipTrajectory(
        state,
        state.ship.aimAngleRad,
        state.ship.aimPowerPct
      );
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight predicted bumper bounces along trajectory
      for (const pt of points) {
        if (pt.hitBumperId) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 10. Musical Prism Bumpers
    for (const bmp of state.bumpers) {
      ctx.save();
      const color =
        bmp.kind === 'OVERCHARGE_ANVIL'
          ? '#f59e0b'
          : bmp.kind === 'CHRONO_CRYSTAL'
            ? '#a855f7'
            : bmp.kind === 'REPULSOR_COIL'
              ? '#ec4899'
              : '#38bdf8';

      const r = bmp.hitFlashMs > 0 ? bmp.radius + 4 : bmp.radius;
      ctx.fillStyle = bmp.activatedInChain ? color : '#0f172a';
      ctx.strokeStyle = bmp.hitFlashMs > 0 ? '#ffffff' : color;
      ctx.lineWidth = bmp.activatedInChain ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(bmp.x, bmp.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = bmp.activatedInChain ? '#020617' : '#e2e8f0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sym =
        bmp.kind === 'OVERCHARGE_ANVIL'
          ? '⚡'
          : bmp.kind === 'CHRONO_CRYSTAL'
            ? '⏳'
            : bmp.kind === 'REPULSOR_COIL'
              ? '◎'
              : '◇';
      ctx.fillText(sym, bmp.x, bmp.y);
      ctx.restore();
    }

    // 11. Collectible Star Motes
    for (const mote of state.starMotes) {
      ctx.save();
      ctx.fillStyle = mote.kind === 'CHRONO_SHARD' ? '#a855f7' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 12. Enemies & Bosses
    for (const enemy of state.enemies) {
      ctx.save();
      const isBoss = enemy.kind === 'KARDASHEV_BOSS';
      const baseColor = isBoss
        ? '#f43f5e'
        : enemy.kind === 'TESSERA_WARDEN'
          ? '#a855f7'
          : enemy.kind === 'PHASE_FRIGATE'
            ? '#f97316'
            : '#ef4444';

      if (enemy.shielded) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = enemy.hitFlashMs > 0 ? '#ffffff' : baseColor;
      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // HP bar above multi-hit enemies
      if (enemy.maxHp > 50) {
        const bw = enemy.radius * 1.8;
        const pct = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(enemy.x - bw / 2, enemy.y - enemy.radius - 10, bw, 5);
        ctx.fillStyle = isBoss ? '#fbbf24' : '#ef4444';
        ctx.fillRect(enemy.x - bw / 2, enemy.y - enemy.radius - 10, bw * pct, 5);
      }
      ctx.restore();
    }

    // 13. Projectiles
    for (const proj of state.projectiles) {
      ctx.save();
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 14. Worldline History Ribbon & Active Phantom Echo Twin
    if (state.worldlineHistory.length > 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.worldlineHistory.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    if (state.activeEcho && state.activeEcho.active) {
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(
        state.activeEcho.x,
        state.activeEcho.y,
        state.activeEcho.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 15. Quantum Tether Cable ([Q])
    if (state.ship.tetherTargetId) {
      const anchor =
        state.wells.find((w) => w.id === state.ship.tetherTargetId) ??
        state.bumpers.find((b) => b.id === state.ship.tetherTargetId);
      if (anchor) {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.ship.x, state.ship.y);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 16. Player Star-Breaker Ship
    const chassis = SHIP_CHASSIS_CATALOG[state.ship.chassis];
    const shipAngle = state.ship.isAiming
      ? state.ship.aimAngleRad
      : Math.atan2(state.ship.vy, state.ship.vx);

    ctx.save();
    ctx.translate(state.ship.x, state.ship.y);
    ctx.rotate(shipAngle);

    // Lorentz Aegis / High-Gamma Halo
    if (state.ship.lorentzGamma >= 1.8) {
      ctx.strokeStyle = state.ship.lorentzGamma >= 2.5 ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, state.ship.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = chassis.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.ship.radius + 4, 0);
    ctx.lineTo(-state.ship.radius, -state.ship.radius * 0.82);
    ctx.lineTo(-state.ship.radius * 0.55, 0);
    ctx.lineTo(-state.ship.radius, state.ship.radius * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 17. Shockwave Rings & Floating Score Popups
    const nextRings: ShockwaveRing[] = [];
    for (const ring of this.shockwaves) {
      ring.radius += 340 * dtSec;
      ring.alpha -= 1.45 * dtSec;
      if (ring.alpha > 0 && ring.radius <= ring.maxRadius) {
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        nextRings.push(ring);
      }
    }
    this.shockwaves = nextRings;

    const nextPopups: FloatingPopup[] = [];
    for (const pop of this.popups) {
      pop.y += pop.vy * dtSec;
      pop.alpha -= 0.85 * dtSec;
      if (pop.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pop.alpha);
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = pop.color;
        ctx.textAlign = 'center';
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
        nextPopups.push(pop);
      }
    }
    this.popups = nextPopups;
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    this.container.innerHTML = '';
  }
}
