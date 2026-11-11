import { AstralAudioEngine } from './audio';
import { ASTRAL_CONFIG } from './config';
import {
  ASTRAL_RELICS,
  ASTRAL_SOCKET_BLUEPRINTS,
  AstralSocketNodeType,
} from './content';
import { AstralCareerStats } from './persistence';
import {
  AstralGameState,
  AstralInputAction,
  AstralSimEvent,
  computeOptimalLaunchHint,
  computeTrajectoryPreview,
  evaluateAstralVerdict,
  OptimalLaunchRecommendation,
  runAstralCounterfactuals,
} from './simulation';

// Conditionally load Invoker Commands & Popover polyfills per declarative-dialog-popover-control
if (
  typeof HTMLButtonElement !== 'undefined' &&
  !('commandForElement' in HTMLButtonElement.prototype)
) {
  void import('invokers-polyfill');
}
if (
  typeof HTMLElement !== 'undefined' &&
  !('popover' in HTMLElement.prototype)
) {
  void import('@oddbird/popover-polyfill');
}

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

interface LightningBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lifeMs: number;
}

export interface AstralUICallbacks {
  onAction: (action: AstralInputAction) => void;
  onRestart: (seed?: number) => void;
  onToggleDebug: () => void;
  onVisibilityPausedChange?: (paused: boolean) => void;
}

const NODE_TYPES_ORDER: readonly AstralSocketNodeType[] = [
  'PRISM_SPLITTER',
  'TESLA_PYLON',
  'GRAVITY_WELL',
  'FORGE_ANVIL',
  'WORMHOLE_RELAY',
  'HARMONIC_BELL',
];

export class AstralUIController {
  private container: HTMLElement;
  private audio: AstralAudioEngine;
  private callbacks: AstralUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  private popups: FloatingPopup[] = [];
  private rings: ShockwaveRing[] = [];
  private beams: LightningBeam[] = [];
  private coachHint: OptimalLaunchRecommendation | null = null;
  private showCoachOverlay = false;

  private keydownHandler!: (e: KeyboardEvent) => void;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(
    container: HTMLElement,
    audio: AstralAudioEngine,
    callbacks: AstralUICallbacks,
    initialDebug: boolean = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    this.buildDOM();
    this.bindEvents();
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    const dbgEl = this.container.querySelector<HTMLElement>('#ap-debug-panel');
    if (dbgEl) {
      dbgEl.hidden = !this.debugVisible;
    }
  }

  public resetVisuals(): void {
    this.popups = [];
    this.rings = [];
    this.beams = [];
    this.coachHint = null;
  }

  private buildDOM(): void {
    const uid = Math.random().toString(36).slice(2, 7);
    const popoverId = `ap-almanac-popover-${uid}`;
    const dialogId = `ap-audit-dialog-${uid}`;
    const dialogTitleId = `ap-audit-title-${uid}`;

    this.container.innerHTML = `
      <style>
        .ap-root {
          /* Defer rendering work when off-screen per efficient-background-processing */
          content-visibility: auto;
          contain-intrinsic-size: auto none auto 680px;
          background: radial-gradient(circle at 50% 12%, #131b38 0%, #070a17 65%, #04060e 100%);
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 14px;
          max-width: 1380px;
          margin: 0 auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
        }

        .ap-top-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1e293b;
          margin-bottom: 10px;
        }

        .ap-brand-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #fde047, #f59e0b, #ec4899, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-brand-sub {
          margin: 2px 0 0;
          font-size: 0.76rem;
          color: #94a3b8;
        }

        .ap-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .ap-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 7px;
          padding: 5px 10px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }

        .ap-btn:hover {
          background: #334155;
          border-color: #38bdf8;
        }

        .ap-btn-gold {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #020617;
          border-color: #fde047;
        }

        .ap-btn-gold:hover {
          background: linear-gradient(135deg, #fde047, #f59e0b);
        }

        /* Balatro-Style Multiplicative Equation Ribbon */
        .ap-equation-ribbon {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: rgba(9, 13, 28, 0.92);
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 12px;
        }

        .ap-eq-formula {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .ap-pill-chips {
          background: rgba(56, 189, 248, 0.18);
          border: 1px solid #38bdf8;
          color: #7dd3fc;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-mult {
          background: rgba(236, 72, 153, 0.2);
          border: 1px solid #ec4899;
          color: #f472b6;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-relic {
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid #a855f7;
          color: #d8b4fe;
          padding: 3px 9px;
          border-radius: 6px;
        }

        .ap-pill-total {
          background: rgba(245, 158, 11, 0.22);
          border: 1px solid #f59e0b;
          color: #fde047;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .ap-stats-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
        }

        .ap-stat-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Main 2-Column Layout */
        .ap-workspace {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          align-items: start;
        }

        @media (min-width: 1080px) {
          .ap-workspace {
            grid-template-columns: minmax(580px, 920px) 1fr;
          }
        }

        .ap-canvas-stage {
          position: relative;
          width: 100%;
          background: #050814;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .ap-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 920 / 600;
          cursor: crosshair;
          touch-action: none;
        }

        .ap-overlay-card {
          position: absolute;
          inset: 14% 10%;
          background: rgba(10, 15, 32, 0.96);
          border: 2px solid #f59e0b;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
          z-index: 15;
        }

        .ap-overlay-card[hidden] {
          display: none !important;
        }

        .ap-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 10px;
        }

        .ap-relic-choice {
          background: #131c36;
          border: 1px solid #475569;
          border-radius: 9px;
          padding: 10px;
          text-align: left;
          color: #f8fafc;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ap-relic-choice:hover {
          border-color: #fde047;
          background: #1e293b;
        }

        /* Right Sidebar Architect & Tactical Controls */
        .ap-sidebar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ap-panel {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .ap-panel-title {
          margin: 0 0 8px 0;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #38bdf8;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ap-verbs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .ap-node-palette {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .ap-node-btn {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 7px;
          padding: 6px 8px;
          color: #e2e8f0;
          text-align: left;
          font-size: 0.74rem;
          cursor: pointer;
        }

        .ap-node-btn[aria-pressed="true"] {
          border-color: #fde047;
          background: rgba(245, 158, 11, 0.16);
          box-shadow: 0 0 0 1px #fde047;
        }

        .ap-sockets-quickgrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
          margin-top: 8px;
        }

        .ap-socket-pill {
          background: #090d1a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 4px 7px;
          font-size: 0.71rem;
          color: #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .ap-socket-pill:hover {
          border-color: #38bdf8;
        }

        .ap-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 125px;
          overflow-y: auto;
          font-size: 0.73rem;
          color: #cbd5e1;
          display: grid;
          gap: 4px;
        }

        /* Native Dialog & Popover per declarative-dialog-popover-control & light-dismiss-a-dialog */
        dialog.ap-dialog {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 12px;
          padding: 18px;
          max-width: min(760px, 94vw);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        }

        dialog.ap-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
        }

        [popover].ap-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #f59e0b;
          border-radius: 10px;
          padding: 14px;
          max-width: 430px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8);
        }

        [popover].ap-popover:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .ap-cf-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.76rem;
          margin-top: 10px;
        }

        .ap-cf-table th,
        .ap-cf-table td {
          border: 1px solid #334155;
          padding: 6px 8px;
          text-align: left;
        }

        .ap-cf-table th {
          background: #1e293b;
          color: #fde047;
        }
      </style>

      <div class="ap-root" id="ap-simulation-root">
        <div class="ap-top-bar">
          <div>
            <h2 class="ap-brand-title">☄️ OROBOROS: THE PINBALL SINGULARITY</h2>
            <p class="ap-brand-sub" id="ap-sector-subtitle">
              SECTOR I // THE CLOCKWORK ASTROLABE — Wire Astral Sockets, Launch Star-Comets &amp; Parry with Twin Plasma Flippers
            </p>
          </div>

          <div class="ap-toolbar">
            <button type="button" class="ap-btn ap-btn-gold" id="ap-btn-launch">
              ☄️ Launch Volley [Space]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-coach">
              🔮 Oracle Shot Hint [H]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-mode">
              Mode: Campaign
            </button>
            <button
              type="button"
              class="ap-btn"
              commandfor="${popoverId}"
              command="toggle-popover"
            >
              📖 Synergy Almanac
            </button>
            <button
              type="button"
              class="ap-btn"
              id="ap-btn-open-audit"
              commandfor="${dialogId}"
              command="show-modal"
            >
              📊 Counterfactual Audit
            </button>
            <button type="button" class="ap-btn" id="ap-btn-mute">
              🔊 Audio: ON [M]
            </button>
            <button type="button" class="ap-btn" id="ap-btn-restart">
              ↻ New Run [R]
            </button>
          </div>
        </div>

        <div class="ap-equation-ribbon">
          <div class="ap-eq-formula">
            <span class="ap-pill-chips" id="ap-eq-chips">CHIPS: 30</span>
            <span>×</span>
            <span class="ap-pill-mult" id="ap-eq-mult">COMBO MULT: 1.00×</span>
            <span>×</span>
            <span class="ap-pill-relic" id="ap-eq-relic">RELIC MULT: 1.20×</span>
            <span>=</span>
            <span class="ap-pill-total" id="ap-eq-volley">VOLLEY: 0 PTS</span>
          </div>

          <div class="ap-stats-strip">
            <span class="ap-stat-item" id="ap-stat-boss">👑 Boss HP: 1,600/1,600</span>
            <span class="ap-stat-item" id="ap-stat-volleys">☄️ Volleys: 5</span>
            <span class="ap-stat-item" id="ap-stat-hull">🛡️ Aegis Hull: 100%</span>
            <span class="ap-stat-item" id="ap-stat-stardust">✦ Stardust: 110</span>
            <span class="ap-stat-item" id="ap-stat-flux">⚡ Aether Flux: 60/100</span>
            <span class="ap-stat-item" id="ap-stat-score">🏆 Total: 0</span>
          </div>
        </div>

        <div class="ap-workspace">
          <div class="ap-canvas-stage">
            <canvas
              id="ap-canvas"
              class="ap-canvas"
              width="${ASTRAL_CONFIG.TABLE_WIDTH}"
              height="${ASTRAL_CONFIG.TABLE_HEIGHT}"
              aria-label="Oroboros Pinball Singularity Cosmos Table"
            ></canvas>

            <!-- Sector Cleared / Relic Draft Overlay -->
            <div class="ap-overlay-card" id="ap-relic-overlay" hidden>
              <div>
                <h3 style="margin:0 0 4px; color:#fde047;" id="ap-overlay-title">
                  🌟 SECTOR CLEARED! CHOOSE AN ASTRAL RELIC
                </h3>
                <p style="margin:0; font-size:0.82rem; color:#cbd5e1;" id="ap-overlay-sub">
                  Bind 1 Relic to permanently multiply your Chips × Mult engine and advance to the next Boss Constellation.
                </p>
              </div>
              <div class="ap-relic-grid" id="ap-relic-choices-grid"></div>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="ap-btn ap-btn-gold" id="ap-btn-skip-relic">
                  Ascend to Next Sector →
                </button>
              </div>
            </div>
          </div>

          <aside class="ap-sidebar">
            <!-- Active Tactical Pinball & Flux Verbs -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>⚡ Active Tactical Controls</span>
                <span id="ap-aim-readout">Aim: -14°</span>
              </h3>
              <div class="ap-verbs-grid">
                <button type="button" class="ap-btn ap-btn-gold" id="ap-verb-flip">
                  🛡️ Flipper Parry [Space/Click]
                </button>
                <button type="button" class="ap-btn" id="ap-verb-magnet">
                  🧲 Magnet Pulse [E] (25⚡)
                </button>
                <button type="button" class="ap-btn" id="ap-verb-chrono">
                  ⏱️ Chrono-Dilation [Q] (30⚡)
                </button>
                <button type="button" class="ap-btn" id="ap-verb-supernova">
                  ☀️ Supernova Split [F] (45⚡)
                </button>
              </div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:0.74rem;">
                <label for="ap-aim-slider">Launch Angle:</label>
                <input
                  type="range"
                  id="ap-aim-slider"
                  min="-72"
                  max="72"
                  step="1"
                  value="-14"
                  style="flex:1;"
                />
              </div>
            </div>

            <!-- Live Socket Architect Palette -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>🛠️ Socket Architect Forge</span>
                <span id="ap-stardust-badge">✦ 110 Stardust</span>
              </h3>
              <p style="margin:0 0 6px; font-size:0.72rem; color:#94a3b8;">
                Select an Astral Node below, then click any Socket on the table (or a slot pill) to wire or upgrade it:
              </p>
              <div class="ap-node-palette" id="ap-node-palette"></div>
              <div class="ap-sockets-quickgrid" id="ap-sockets-quickgrid"></div>
            </div>

            <!-- Bound Relics & Career -->
            <div class="ap-panel">
              <h3 class="ap-panel-title">
                <span>🏺 Bound Relics &amp; Telemetry</span>
                <span id="ap-career-best">Best: 0</span>
              </h3>
              <div id="ap-owned-relics" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; font-size:0.73rem;"></div>
              <ul class="ap-log-list" id="ap-log-list"></ul>
            </div>

            <div class="ap-panel" id="ap-debug-panel" ${this.debugVisible ? '' : 'hidden'}>
              <h3 class="ap-panel-title"><span>🔬 Deterministic Debug State</span></h3>
              <pre id="ap-debug-pre" style="margin:0; font-size:0.7rem; color:#38bdf8; overflow-x:auto;"></pre>
            </div>
          </aside>
        </div>

        <!-- Declarative Popover Almanac -->
        <div id="${popoverId}" class="ap-popover" popover>
          <h3 style="margin:0 0 6px; color:#fde047;">📖 Astral Pinball Synergy Almanac</h3>
          <p style="margin:0 0 8px; font-size:0.78rem; color:#cbd5e1;">
            Every socket bounce increases both <strong>Base Chips</strong> and <strong>Combo Mult</strong>. Total Damage = <code>Chips × Combo Mult × Relic Mult</code>.
          </p>
          <ul style="margin:0; padding-left:16px; font-size:0.75rem; color:#e2e8f0; display:grid; gap:4px;">
            <li><strong>❖ Bifrost Prism Gate (45✦):</strong> Splits 1 comet into 2 chromatic twin comets!</li>
            <li><strong>⚡ Tesla Resonance Pylon (40✦):</strong> Chains arc-lightning to up to 3 Boss Nodes/Hazards.</li>
            <li><strong>🌀 Kerr Gravity Well (50✦):</strong> Curves comets into an orbital slingshot toward the Boss Core.</li>
            <li><strong>🔥 Solar Forge Anvil (35✦):</strong> Permanently tempers the comet (+14 Base Chips + Supernova).</li>
            <li><strong>⏳ Ouroboros Wormhole (55✦):</strong> Warps lower-table comets back to the Zenith Crown!</li>
            <li><strong>🔔 Harmonic Bell (50✦):</strong> Every 3rd chime unleashes a full-screen 240-dmg Sonic Nova!</li>
          </ul>
        </div>

        <!-- Light-Dismiss Counterfactual Audit Modal Dialog -->
        <dialog
          id="${dialogId}"
          class="ap-dialog"
          closedby="any"
          aria-labelledby="${dialogTitleId}"
        >
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid #334155; padding-bottom:8px;">
            <h3 id="${dialogTitleId}" style="margin:0; color:#38bdf8;">
              📊 Seeded Counterfactual Archetype Benchmark
            </h3>
            <button
              type="button"
              class="ap-btn"
              commandfor="${dialogId}"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <div id="ap-audit-dialog-body" style="margin-top:10px; font-size:0.82rem;"></div>
        </dialog>
      </div>
    `;

    const canvasEl = this.container.querySelector<HTMLCanvasElement>('#ap-canvas');
    if (canvasEl) {
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext('2d');
    }

    // Light-dismiss dialog fallback per light-dismiss-a-dialog
    const dialogEl = this.container.querySelector<HTMLDialogElement>(`#${dialogId}`);
    if (
      dialogEl &&
      typeof HTMLDialogElement !== 'undefined' &&
      !('closedBy' in HTMLDialogElement.prototype)
    ) {
      dialogEl.addEventListener('click', (event) => {
        if (event.target !== dialogEl) return;
        const rect = dialogEl.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialogEl.close();
      });
    }

    // Efficient Background Processing listener per efficient-background-processing
    const rootEl = this.container.querySelector<HTMLElement>('#ap-simulation-root');
    if (rootEl) {
      rootEl.addEventListener('contentvisibilityautostatechange', (event: Event) => {
        const cvEvent = event as Event & { skipped?: boolean };
        this.callbacks.onVisibilityPausedChange?.(Boolean(cvEvent.skipped));
      });

      if (
        typeof document !== 'undefined' &&
        !('contentVisibility' in document.documentElement.style) &&
        typeof IntersectionObserver !== 'undefined'
      ) {
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              this.callbacks.onVisibilityPausedChange?.(!entry.isIntersecting);
            }
          },
          { rootMargin: '200px' }
        );
        this.intersectionObserver.observe(rootEl);
      }
    }

    this.renderNodePalette('PRISM_SPLITTER');
  }

  private renderNodePalette(selected: AstralSocketNodeType): void {
    const paletteEl = this.container.querySelector<HTMLElement>('#ap-node-palette');
    if (!paletteEl) return;
    paletteEl.innerHTML = '';
    for (const nType of NODE_TYPES_ORDER) {
      const bp = ASTRAL_SOCKET_BLUEPRINTS[nType];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ap-node-btn';
      btn.setAttribute('data-node-type', nType);
      btn.setAttribute('aria-pressed', String(nType === selected));
      btn.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-weight:800; color:${bp.color};">
          <span>${bp.symbol} ${bp.shortLabel}</span>
          <span>${bp.costStardust}✦</span>
        </div>
        <div style="font-size:0.67rem; color:#94a3b8; margin-top:2px;">
          +${bp.baseChipsBonus} Chips · +${bp.comboMultBonus.toFixed(2)}×
        </div>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'SELECT_BUILD_TYPE', nodeType: nType });
      });
      paletteEl.appendChild(btn);
    }
  }

  private bindEvents(): void {
    const btnLaunch = this.container.querySelector<HTMLButtonElement>('#ap-btn-launch');
    btnLaunch?.addEventListener('click', () => {
      this.callbacks.onAction({ type: 'LAUNCH_COMET' });
    });

    const btnCoach = this.container.querySelector<HTMLButtonElement>('#ap-btn-coach');
    btnCoach?.addEventListener('click', () => {
      this.showCoachOverlay = !this.showCoachOverlay;
      this.coachHint = null;
    });

    const btnMode = this.container.querySelector<HTMLButtonElement>('#ap-btn-mode');
    btnMode?.addEventListener('click', () => {
      const currentText = btnMode.textContent ?? '';
      const nextMode = currentText.includes('Campaign') ? 'SANDBOX' : 'CAMPAIGN';
      this.callbacks.onAction({ type: 'SWITCH_MODE', mode: nextMode });
    });

    const btnMute = this.container.querySelector<HTMLButtonElement>('#ap-btn-mute');
    btnMute?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      btnMute.textContent = muted ? '🔇 Audio: OFF [M]' : '🔊 Audio: ON [M]';
    });

    const btnRestart = this.container.querySelector<HTMLButtonElement>('#ap-btn-restart');
    btnRestart?.addEventListener('click', () => {
      this.callbacks.onRestart();
    });

    const btnSkipRelic = this.container.querySelector<HTMLButtonElement>('#ap-btn-skip-relic');
    btnSkipRelic?.addEventListener('click', () => {
      this.callbacks.onAction({ type: 'ADVANCE_NEXT_SECTOR' });
    });

    const aimSlider = this.container.querySelector<HTMLInputElement>('#ap-aim-slider');
    aimSlider?.addEventListener('input', () => {
      this.callbacks.onAction({
        type: 'SET_AIM_ANGLE',
        angleDeg: Number(aimSlider.value),
      });
    });

    this.container
      .querySelector<HTMLButtonElement>('#ap-verb-flip')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'FLIP_SWING', side: 'BOTH' });
      });
    this.container
      .querySelector<HTMLButtonElement>('#ap-verb-magnet')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'CAST_MAGNET_PULSE' });
      });
    this.container
      .querySelector<HTMLButtonElement>('#ap-verb-chrono')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'CAST_CHRONO_OVERDRIVE' });
      });
    this.container
      .querySelector<HTMLButtonElement>('#ap-verb-supernova')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'CAST_SUPERNOVA_MULTIBALL' });
      });

    // Canvas Pointer Interaction (Aiming, Moving Flipper Paddle, Clicking Sockets, Flipper Parry)
    if (this.canvas) {
      this.canvas.addEventListener('pointermove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width <= 0) return;
        const scaleX = ASTRAL_CONFIG.TABLE_WIDTH / rect.width;
        const scaleY = ASTRAL_CONFIG.TABLE_HEIGHT / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;

        this.callbacks.onAction({ type: 'MOVE_PADDLE', x: cx });
        if (cy < ASTRAL_CONFIG.LAUNCH_ORIGIN_Y - 25) {
          const dx = cx - ASTRAL_CONFIG.LAUNCH_ORIGIN_X;
          const dy = ASTRAL_CONFIG.LAUNCH_ORIGIN_Y - cy;
          const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
          this.callbacks.onAction({ type: 'SET_AIM_ANGLE', angleDeg: deg });
        }
      });

      this.canvas.addEventListener('pointerdown', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width > 0 ? ASTRAL_CONFIG.TABLE_WIDTH / rect.width : 1;
        const scaleY = rect.height > 0 ? ASTRAL_CONFIG.TABLE_HEIGHT / rect.height : 1;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;

        // Check if user clicked directly on one of the 10 Astral Sockets to build/upgrade!
        const clickedSlot = this.findSocketAtPoint(cx, cy);
        if (clickedSlot !== null) {
          if (e.button === 2 || e.shiftKey) {
            this.callbacks.onAction({ type: 'SELL_SOCKET', slotIndex: clickedSlot });
          } else {
            this.callbacks.onAction({
              type: 'BUILD_OR_UPGRADE_SOCKET',
              slotIndex: clickedSlot,
            });
          }
          return;
        }

        this.callbacks.onAction({ type: 'FLIP_SWING', side: 'BOTH' });
        this.callbacks.onAction({ type: 'LAUNCH_COMET' });
      });
    }

    this.keydownHandler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          this.callbacks.onAction({ type: 'FLIP_SWING', side: 'BOTH' });
          this.callbacks.onAction({ type: 'LAUNCH_COMET' });
          break;
        case 'arrowleft':
        case 'a':
          this.callbacks.onAction({ type: 'NUDGE_PADDLE', dx: -28 });
          this.callbacks.onAction({ type: 'ADJUST_AIM_ANGLE', deltaDeg: -4 });
          this.callbacks.onAction({ type: 'FLIP_SWING', side: 'LEFT' });
          break;
        case 'arrowright':
        case 'd':
          this.callbacks.onAction({ type: 'NUDGE_PADDLE', dx: 28 });
          this.callbacks.onAction({ type: 'ADJUST_AIM_ANGLE', deltaDeg: 4 });
          this.callbacks.onAction({ type: 'FLIP_SWING', side: 'RIGHT' });
          break;
        case 'e':
          this.callbacks.onAction({ type: 'CAST_MAGNET_PULSE' });
          break;
        case 'q':
          this.callbacks.onAction({ type: 'CAST_CHRONO_OVERDRIVE' });
          break;
        case 'f':
          this.callbacks.onAction({ type: 'CAST_SUPERNOVA_MULTIBALL' });
          break;
        case 'h':
          this.showCoachOverlay = !this.showCoachOverlay;
          this.coachHint = null;
          break;
        case 'm': {
          const muted = this.audio.toggleMute();
          const btnMuteEl =
            this.container.querySelector<HTMLButtonElement>('#ap-btn-mute');
          if (btnMuteEl) {
            btnMuteEl.textContent = muted ? '🔇 Audio: OFF [M]' : '🔊 Audio: ON [M]';
          }
          break;
        }
        case 'r':
          this.callbacks.onRestart();
          break;
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  private lastStateSockets: AstralGameState['sockets'] = [];

  private findSocketAtPoint(x: number, y: number): number | null {
    for (const sock of this.lastStateSockets) {
      if (Math.hypot(x - sock.x, y - sock.y) <= 28) {
        return sock.slotIndex;
      }
    }
    return null;
  }

  public consumeEvents(_state: AstralGameState, events: readonly AstralSimEvent[]): void {
    this.audio.playEvents(events);
    for (const ev of events) {
      if (ev.label) {
        this.popups.push({
          x: ev.x,
          y: ev.y - 10,
          vy: -38,
          text: ev.label,
          color: ev.color ?? '#fde047',
          lifeMs: 950,
          maxLifeMs: 950,
        });
      }

      if (ev.type === 'LIGHTNING_ARC' && ev.targetX !== undefined && ev.targetY !== undefined) {
        this.beams.push({
          x1: ev.x,
          y1: ev.y,
          x2: ev.targetX,
          y2: ev.targetY,
          color: ev.color ?? '#38bdf8',
          lifeMs: 180,
        });
      }

      if (
        ev.type === 'PRISM_SPLIT' ||
        ev.type === 'SONIC_NOVA' ||
        ev.type === 'PERFECT_PARRY' ||
        ev.type === 'WORMHOLE_WARP' ||
        ev.type === 'SECTOR_VICTORY'
      ) {
        this.rings.push({
          x: ev.x,
          y: ev.y,
          radius: 12,
          maxRadius: ev.type === 'SONIC_NOVA' ? 380 : 95,
          color: ev.color ?? '#fde047',
          lifeMs: 420,
          maxLifeMs: 420,
        });
      }
    }
  }

  public render(
    state: AstralGameState,
    career: AstralCareerStats,
    dtMs: number
  ): void {
    this.lastStateSockets = state.sockets;
    this.stepVisualParticles(dtMs);
    this.updateHUD(state, career);
    this.drawCanvas(state);
  }

  private stepVisualParticles(dtMs: number): void {
    const dtSec = dtMs / 1000;
    this.popups = this.popups.filter((p) => {
      p.y += p.vy * dtSec;
      p.lifeMs -= dtMs;
      return p.lifeMs > 0;
    });
    this.rings = this.rings.filter((r) => {
      r.lifeMs -= dtMs;
      const progress = 1 - Math.max(0, r.lifeMs) / r.maxLifeMs;
      r.radius = 12 + progress * (r.maxRadius - 12);
      return r.lifeMs > 0;
    });
    this.beams = this.beams.filter((b) => {
      b.lifeMs -= dtMs;
      return b.lifeMs > 0;
    });
  }

  private updateHUD(state: AstralGameState, career: AstralCareerStats): void {
    const setText = (selector: string, text: string) => {
      const el = this.container.querySelector<HTMLElement>(selector);
      if (el && el.textContent !== text) el.textContent = text;
    };

    setText(
      '#ap-sector-subtitle',
      `${state.boss.title} — ${state.boss.mechanicSummary}`
    );
    setText('#ap-eq-chips', `CHIPS: ${state.currentVolleyChips}`);
    setText('#ap-eq-mult', `COMBO MULT: ${state.currentComboMult.toFixed(2)}×`);
    setText('#ap-eq-relic', `RELIC MULT: ${state.currentRelicMult.toFixed(2)}×`);
    setText('#ap-eq-volley', `VOLLEY: ${state.currentVolleyScore.toLocaleString()} PTS`);

    setText(
      '#ap-stat-boss',
      `👑 ${state.boss.name}: ${state.boss.hp.toLocaleString()}/${state.boss.maxHp.toLocaleString()} HP`
    );
    setText(
      '#ap-stat-volleys',
      `☄️ Volleys: ${state.mode === 'SANDBOX' ? '∞' : state.volleysRemaining}`
    );
    setText('#ap-stat-hull', `🛡️ Aegis Hull: ${state.aegisHull}%`);
    setText('#ap-stat-stardust', `✦ Stardust: ${state.stardust}`);
    setText('#ap-stat-flux', `⚡ Flux: ${state.flux}/${state.maxFlux}`);
    setText('#ap-stat-score', `🏆 Score: ${state.totalScore.toLocaleString()}`);
    setText('#ap-aim-readout', `Aim: ${state.aimAngleDeg.toFixed(0)}°`);
    setText('#ap-stardust-badge', `✦ ${state.stardust} Stardust`);
    setText(
      '#ap-career-best',
      `Best: ${Math.max(career.highScore, state.totalScore).toLocaleString()}`
    );

    const btnMode = this.container.querySelector<HTMLButtonElement>('#ap-btn-mode');
    if (btnMode) {
      btnMode.textContent =
        state.mode === 'SANDBOX' ? 'Mode: Architect Sandbox' : 'Mode: Campaign';
    }

    const aimSlider = this.container.querySelector<HTMLInputElement>('#ap-aim-slider');
    if (aimSlider && document.activeElement !== aimSlider) {
      aimSlider.value = String(Math.round(state.aimAngleDeg));
    }

    // Update selected node button state
    for (const btn of this.container.querySelectorAll<HTMLButtonElement>(
      '.ap-node-btn[data-node-type]'
    )) {
      const nType = btn.getAttribute('data-node-type');
      btn.setAttribute('aria-pressed', String(nType === state.selectedBuildType));
    }

    // Render 10 Quick-Build Socket Pills
    const quickGrid =
      this.container.querySelector<HTMLElement>('#ap-sockets-quickgrid');
    if (quickGrid) {
      quickGrid.innerHTML = state.sockets
        .map((s) => {
          const bp = s.nodeType ? ASTRAL_SOCKET_BLUEPRINTS[s.nodeType] : null;
          return `
            <button type="button" class="ap-socket-pill" data-slot-idx="${s.slotIndex}">
              <span>#${s.slotIndex + 1} ${s.label}</span>
              <strong style="color:${bp ? bp.color : '#64748b'};">
                ${bp ? `${bp.symbol} Lv.${s.level}` : '+ Wire'}
              </strong>
            </button>
          `;
        })
        .join('');
      for (const pill of quickGrid.querySelectorAll<HTMLButtonElement>(
        'button[data-slot-idx]'
      )) {
        pill.addEventListener('click', () => {
          const idx = Number(pill.getAttribute('data-slot-idx'));
          this.callbacks.onAction({ type: 'BUILD_OR_UPGRADE_SOCKET', slotIndex: idx });
        });
      }
    }

    // Render Owned Relics
    const ownedEl = this.container.querySelector<HTMLElement>('#ap-owned-relics');
    if (ownedEl) {
      ownedEl.innerHTML = state.relics
        .map((rId) => {
          const r = ASTRAL_RELICS.find((x) => x.id === rId);
          if (!r) return '';
          return `<span style="background:#1e293b; border:1px solid #475569; border-radius:5px; padding:2px 6px;" title="${r.description}">${r.symbol} ${r.name}</span>`;
        })
        .join('');
    }

    // Render Telemetry Log
    const logList = this.container.querySelector<HTMLElement>('#ap-log-list');
    if (logList) {
      logList.innerHTML = state.recentLog
        .slice(0, 7)
        .map((msg) => `<li>${msg}</li>`)
        .join('');
    }

    // Render Overlay for SECTOR_CLEARED / VICTORY / GAME_OVER
    const overlay = this.container.querySelector<HTMLElement>('#ap-relic-overlay');
    const overlayTitle = this.container.querySelector<HTMLElement>('#ap-overlay-title');
    const overlaySub = this.container.querySelector<HTMLElement>('#ap-overlay-sub');
    const choicesGrid =
      this.container.querySelector<HTMLElement>('#ap-relic-choices-grid');
    const skipBtn = this.container.querySelector<HTMLButtonElement>('#ap-btn-skip-relic');

    if (overlay && overlayTitle && overlaySub && choicesGrid && skipBtn) {
      if (state.status === 'SECTOR_CLEARED') {
        overlay.hidden = false;
        overlayTitle.textContent = `🌟 SECTOR ${state.sector} SHATTERED! DRAFT AN ASTRAL RELIC`;
        overlaySub.textContent =
          'Select 1 Relic to permanently compound your Chips × Mult alchemy before ascending:';
        skipBtn.textContent = 'Ascend to Next Sector →';
        choicesGrid.innerHTML = state.relicChoices
          .map((rId) => {
            const r = ASTRAL_RELICS.find((x) => x.id === rId);
            if (!r) return '';
            return `
              <button type="button" class="ap-relic-choice" data-draft-relic="${r.id}">
                <div style="font-weight:800; color:#fde047;">${r.symbol} ${r.name} (×${r.relicMultFactor.toFixed(2)})</div>
                <div style="font-size:0.75rem; color:#e2e8f0;">${r.description}</div>
                <div style="font-size:0.68rem; color:#94a3b8; font-style:italic;">${r.flavor}</div>
              </button>
            `;
          })
          .join('');
        for (const btn of choicesGrid.querySelectorAll<HTMLButtonElement>(
          'button[data-draft-relic]'
        )) {
          btn.addEventListener('click', () => {
            const rId = btn.getAttribute('data-draft-relic') as AstralGameState['relics'][number];
            this.callbacks.onAction({ type: 'DRAFT_RELIC', relicId: rId });
          });
        }
      } else if (state.status === 'VICTORY' || state.status === 'GAME_OVER') {
        overlay.hidden = false;
        const verdict = evaluateAstralVerdict(state);
        overlayTitle.textContent =
          state.status === 'VICTORY'
            ? `👑 OMEGA SINGULARITY VICTORY — ${verdict.title}`
            : `🌑 RUN CONCLUDED — ${verdict.title}`;
        overlaySub.textContent = `${verdict.description} Final Score: ${state.totalScore.toLocaleString()} · Best Volley: ${state.bestVolleyScore.toLocaleString()} · Max Combo: ${state.maxComboBounces} bounces.`;
        choicesGrid.innerHTML = '';
        skipBtn.textContent = '↻ Launch New Seeded Run';
        skipBtn.onclick = () => this.callbacks.onRestart();
      } else {
        overlay.hidden = true;
      }
    }

    // Update Counterfactual Audit Dialog body
    const auditBody =
      this.container.querySelector<HTMLElement>('#ap-audit-dialog-body');
    if (auditBody && auditBody.innerHTML === '') {
      const cfResults = runAstralCounterfactuals(state.seed);
      auditBody.innerHTML = `
        <p style="margin:0 0 8px; color:#cbd5e1;">
          Deterministic simulation of 3 philosophical &amp; tactical pinball archetypes on Seed <code>${state.seed}</code>:
        </p>
        <table class="ap-cf-table">
          <thead>
            <tr>
              <th>Archetype</th>
              <th>Strategy</th>
              <th>Total Score</th>
              <th>Best Volley</th>
              <th>Max Bounces</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            ${cfResults
              .map(
                (r) => `
              <tr>
                <td><strong>${r.title}</strong></td>
                <td>${r.strategySummary}</td>
                <td>${r.totalScore.toLocaleString()}</td>
                <td>${r.bestVolleyScore.toLocaleString()}</td>
                <td>${r.maxComboBounces}</td>
                <td>${r.verdictTitle}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (this.debugVisible) {
      const dbgPre = this.container.querySelector<HTMLElement>('#ap-debug-pre');
      if (dbgPre) {
        dbgPre.textContent = JSON.stringify(
          {
            seed: state.seed,
            rngState: state.rngState,
            tick: state.tick,
            status: state.status,
            sector: state.sector,
            comets: state.comets.length,
            bossHp: state.boss.hp,
            comboMult: state.currentComboMult,
            relicMult: state.currentRelicMult,
          },
          null,
          2
        );
      }
    }
  }

  private drawCanvas(state: AstralGameState): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const W = ASTRAL_CONFIG.TABLE_WIDTH;
    const H = ASTRAL_CONFIG.TABLE_HEIGHT;

    ctx.clearRect(0, 0, W, H);

    // 1. Deep Nebula Backdrop & Sacred Geometry Grid
    const bgGrad = ctx.createRadialGradient(
      state.boss.coreX,
      state.boss.coreY,
      20,
      W / 2,
      H / 2,
      540
    );
    bgGrad.addColorStop(0, 'rgba(88, 28, 135, 0.32)');
    bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.92)');
    bgGrad.addColorStop(1, '#04060e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle sacred geometry orbital rings
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (const r of [120, 220, 330, 440]) {
      ctx.beginPath();
      ctx.arc(state.boss.coreX, state.boss.coreY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Pinball Cathedral Walls & Slingshot Funnel Rails
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Left wall & upper cathedral bevel
    ctx.moveTo(213, 548);
    ctx.lineTo(68, 430);
    ctx.lineTo(68, 125);
    ctx.lineTo(155, 46);
    // Top arch
    ctx.lineTo(W - 155, 46);
    // Right upper bevel & wall
    ctx.lineTo(W - 68, 125);
    ctx.lineTo(W - 68, 430);
    ctx.lineTo(W - 213, 548);
    ctx.stroke();
    ctx.restore();

    // 3. Relativistic Trajectory Preview (during AIMING or Coach Hint)
    if (state.status === 'AIMING' || this.showCoachOverlay) {
      const previewPts = computeTrajectoryPreview(state, state.aimAngleDeg, 85);
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(state.paddleX, ASTRAL_CONFIG.LAUNCH_ORIGIN_Y);
      for (const pt of previewPts) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      for (const pt of previewPts) {
        if (pt.isBounce) {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      if (this.showCoachOverlay) {
        if (!this.coachHint) {
          this.coachHint = computeOptimalLaunchHint(state);
        }
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(state.paddleX, ASTRAL_CONFIG.LAUNCH_ORIGIN_Y);
        for (const pt of this.coachHint.previewPoints) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          `🔮 Oracle Optimal Angle: ${this.coachHint.bestAngleDeg}° (~${this.coachHint.expectedBounces} bounces)`,
          180,
          34
        );
        ctx.restore();
      }
    }

    // 4. Draw 10 Customizable Astral Sockets
    for (const sock of state.sockets) {
      ctx.save();
      if (!sock.nodeType) {
        // Empty buildable socket ring
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(sock.x, sock.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${sock.label}`, sock.x, sock.y + 4);
      } else {
        const bp = ASTRAL_SOCKET_BLUEPRINTS[sock.nodeType];
        const pulseBoost = sock.pulseAnimMs > 0 ? (sock.pulseAnimMs / 220) * 7 : 0;
        const r = bp.radius + pulseBoost;

        if (sock.nodeType === 'GRAVITY_WELL') {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sock.x, sock.y, 85, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = bp.glowColor;
        ctx.beginPath();
        ctx.arc(sock.x, sock.y, r + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#090d1a';
        ctx.strokeStyle = bp.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sock.x, sock.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bp.symbol, sock.x, sock.y + 4);

        ctx.fillStyle = bp.color;
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(`Lv.${sock.level}`, sock.x, sock.y + r + 12);
      }
      ctx.restore();
    }

    // 5. Draw Boss Constellation (Core + Orbiting Shield Nodes)
    const boss = state.boss;
    ctx.save();
    // Orbit ring
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(boss.coreX, boss.coreY, 82, 0, Math.PI * 2);
    ctx.stroke();

    // Boss Core
    const coreColor = boss.hitFlashMs > 0 ? '#ffffff' : boss.color;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.arc(boss.coreX, boss.coreY, boss.coreRadius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(boss.coreX, boss.coreY, boss.coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Boss HP % inside Core
    const hpPct = Math.max(0, Math.round((boss.hp / boss.maxHp) * 100));
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${hpPct}%`, boss.coreX, boss.coreY + 4);

    // Orbiting Boss Nodes
    for (const node of boss.nodes) {
      if (!node.alive) continue;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = boss.secondaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 6. Draw Enemy Hazards
    for (const haz of state.hazards) {
      ctx.save();
      ctx.fillStyle = haz.reflected ? '#10b981' : '#f43f5e';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(haz.x, haz.y, haz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 7. Draw Twin Plasma Flippers & Aegis Deflector Paddle
    ctx.save();
    const py = ASTRAL_CONFIG.PADDLE_Y;
    const px = state.paddleX;
    const hw =
      ASTRAL_CONFIG.PADDLE_HALF_WIDTH + (state.chronoOverdriveMs > 0 ? 24 : 0);
    const isParryActive =
      state.parryWindowMs > 0 ||
      state.leftFlipperSwingMs > 0 ||
      state.rightFlipperSwingMs > 0;

    ctx.strokeStyle = isParryActive ? '#fde047' : '#38bdf8';
    ctx.fillStyle = isParryActive
      ? 'rgba(253, 224, 71, 0.35)'
      : 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = isParryActive ? 4 : 3;

    ctx.beginPath();
    ctx.roundRect(px - hw, py - 8, hw * 2, 16, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      isParryActive ? '⚡ PARRY OVERDRIVE ⚡' : 'AEGIS FLIPPER ARRAY [SPACE]',
      px,
      py + 4
    );
    ctx.restore();

    // 8. Draw Active Comets & Chromatic Ribbon Trails
    for (const comet of state.comets) {
      ctx.save();
      if (comet.trail.length > 1) {
        ctx.strokeStyle = comet.isSupernova
          ? 'rgba(253, 224, 71, 0.55)'
          : 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = comet.isSupernova ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        for (const t of comet.trail) {
          ctx.lineTo(t.x, t.y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = comet.isSupernova ? '#fde047' : comet.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // If AIMING, draw chambered comet on launcher
    if (state.status === 'AIMING') {
      ctx.save();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(
        state.paddleX,
        ASTRAL_CONFIG.LAUNCH_ORIGIN_Y,
        ASTRAL_CONFIG.COMET_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // 9. Draw Lightning Arcs, Shockwave Rings & Floating Popups
    for (const beam of this.beams) {
      ctx.save();
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      const midX = (beam.x1 + beam.x2) / 2 + (Math.sin(beam.lifeMs) * 14);
      const midY = (beam.y1 + beam.y2) / 2 - (Math.cos(beam.lifeMs) * 14);
      ctx.lineTo(midX, midY);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.restore();
    }

    for (const ring of this.rings) {
      ctx.save();
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = Math.max(0.1, ring.lifeMs / ring.maxLifeMs);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const pop of this.popups) {
      ctx.save();
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.max(0.15, pop.lifeMs / pop.maxLifeMs);
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.container.innerHTML = '';
  }
}
