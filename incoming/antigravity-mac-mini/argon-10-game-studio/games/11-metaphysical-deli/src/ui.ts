import { DeliAudioEngine } from './audio';
import { CONFIG, getDifficultyForLevel } from './config';
import {
  ALL_INGREDIENTS_MAP,
  FUSION_RECIPES,
  HYBRID_INGREDIENTS,
} from './content';
import { DeliCareerStats } from './persistence';
import {
  DeliGameState,
  DeliInputAction,
  DeliSimEvent,
  evaluateBoothHarmony,
  getActiveDecreeDef,
  getTotalFlavorMagnitude,
  VendingActionType,
} from './simulation';

export interface DeliUICallbacks {
  onAction: (action: DeliInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  lifeMs: number;
  maxLifeMs: number;
}

interface FloatingBannerText {
  text: string;
  x: number;
  y: number;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

export class DeliUIController {
  private container: HTMLElement;
  private audio: DeliAudioEngine;
  private callbacks: DeliUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  // DOM HUD refs
  private elScore!: HTMLElement;
  private elSanity!: HTMLElement;
  private elCoins!: HTMLElement;
  private elFeverTier!: HTMLElement;
  private elCombo!: HTMLElement;
  private elPatronsFed!: HTMLElement;
  private elDecreeTitle!: HTMLElement;
  private elDecreeDesc!: HTMLElement;
  private elDecreeTimer!: HTMLElement;
  private elVortexTotal!: HTMLElement;
  private elVortexAxes!: HTMLElement;
  private elActionBanner!: HTMLElement;
  private elTickerText!: HTMLElement;
  private elParadoxBtn!: HTMLButtonElement;
  private elBoothsContainer!: HTMLElement;
  private elGrimoireList!: HTMLElement;
  private elDebugPanel!: HTMLElement;
  private elOverlayModal!: HTMLElement;
  private elMuteBtn!: HTMLButtonElement;

  private particles: FloatingParticle[] = [];
  private banners: FloatingBannerText[] = [];
  private screenShakeMs = 0;

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    audio: DeliAudioEngine,
    callbacks: DeliUICallbacks,
    initialDebug = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    this.boundKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.buildDOM();
    window.addEventListener('keydown', this.boundKeyDown);
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    if (this.elDebugPanel) {
      this.elDebugPanel.hidden = !visible;
    }
  }

  public resetVisuals(): void {
    this.particles = [];
    this.banners = [];
    this.screenShakeMs = 0;
  }

  private buildDOM(): void {
    this.container.innerHTML = `
      <style>
        .deli-root {
          width: 100%;
          min-height: 100%;
          background: radial-gradient(circle at 50% 15%, #1e1035 0%, #090514 55%, #04020a 100%);
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 0.85rem 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-sizing: border-box;
        }
        .deli-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          background: rgba(19, 11, 38, 0.9);
          border: 1px solid #a855f7;
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          box-shadow: 0 0 24px rgba(168, 85, 247, 0.22);
        }
        .deli-brand-title {
          margin: 0;
          font-size: clamp(1.05rem, 0.9rem + 0.7vw, 1.38rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #fde047, #f472b6, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .deli-brand-sub {
          margin: 0.1rem 0 0;
          font-size: 0.76rem;
          color: #cbd5e1;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-stats-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          align-items: center;
        }
        .deli-stat-pill {
          background: rgba(9, 5, 20, 0.85);
          border: 1px solid #4c1d95;
          border-radius: 0.5rem;
          padding: 0.3rem 0.65rem;
          display: flex;
          flex-direction: column;
          min-width: 78px;
        }
        .deli-stat-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #c4b5fd;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-stat-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-decree-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.45rem 0.9rem;
          border-radius: 0.65rem;
          background: linear-gradient(90deg, rgba(88, 28, 135, 0.45), rgba(15, 23, 42, 0.85));
          border-left: 4px solid #f472b6;
          border-right: 1px solid #334155;
          border-top: 1px solid #334155;
          border-bottom: 1px solid #334155;
        }
        .deli-decree-title {
          font-weight: 800;
          font-size: 0.85rem;
          color: #fde047;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-decree-desc {
          font-size: 0.8rem;
          color: #e2e8f0;
        }
        .deli-workspace {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          align-items: start;
        }
        @media (min-width: 1080px) {
          .deli-workspace {
            grid-template-columns: minmax(0, 1.65fr) minmax(330px, 1fr);
          }
        }
        .deli-stage-card {
          position: relative;
          background: #070312;
          border: 2px solid #7e22ce;
          border-radius: 0.85rem;
          overflow: hidden;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.75);
        }
        .deli-canvas {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 840 / 520;
          cursor: crosshair;
          touch-action: none;
        }
        .deli-action-deck {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          padding: 0.6rem 0.75rem;
          background: rgba(15, 7, 30, 0.95);
          border-top: 1px solid #4c1d95;
          align-items: center;
          justify-content: space-between;
        }
        .deli-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.42rem 0.75rem;
          min-block-size: 32px;
          min-inline-size: 32px;
          border-radius: 0.45rem;
          border: 1px solid #6d28d9;
          background: #1e1035;
          color: #f8fafc;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .deli-btn:hover {
          background: #3b0764;
          border-color: #f472b6;
          transform: translateY(-1px);
        }
        .deli-btn:focus-visible {
          outline: 3px solid #fde047;
          outline-offset: 2px;
        }
        .deli-btn-hot {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          border-color: #f9a8d4;
          color: #ffffff;
        }
        .deli-btn-gold {
          background: linear-gradient(135deg, #eab308, #f97316);
          border-color: #fef08a;
          color: #090514;
          font-weight: 800;
        }
        .deli-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .deli-panel {
          background: rgba(17, 10, 34, 0.92);
          border: 1px solid #4c1d95;
          border-radius: 0.75rem;
          padding: 0.75rem 0.85rem;
        }
        .deli-panel-title {
          margin: 0 0 0.5rem 0;
          font-size: 0.84rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #f472b6;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .deli-booths-grid {
          display: grid;
          gap: 0.5rem;
        }
        .deli-booth-card {
          background: rgba(9, 5, 20, 0.85);
          border: 1px solid #334155;
          border-left: 4px solid var(--booth-color, #38bdf8);
          border-radius: 0.55rem;
          padding: 0.55rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .deli-booth-card.is-ready {
          border-color: #fde047;
          box-shadow: 0 0 14px rgba(253, 224, 71, 0.28);
        }
        .deli-booth-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .deli-booth-quote {
          margin: 0;
          font-size: 0.74rem;
          color: #cbd5e1;
          font-style: italic;
        }
        .deli-booth-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .deli-vending-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
        }
        .deli-ticker-bar {
          background: #05020c;
          border: 1px solid #3b0764;
          border-radius: 0.5rem;
          padding: 0.4rem 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #a7f3d0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .deli-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 3, 15, 0.88);
          backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
          z-index: 20;
        }
        .deli-overlay[hidden] {
          display: none !important;
        }
        dialog.deli-grimoire-dialog {
          max-inline-size: min(680px, 92dvw);
          background: #130b26;
          color: #f8fafc;
          border: 2px solid #f472b6;
          border-radius: 0.85rem;
          padding: 1.2rem;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85);
        }
        dialog.deli-grimoire-dialog::backdrop {
          background: rgba(4, 2, 10, 0.78);
          backdrop-filter: blur(4px);
        }
      </style>

      <div class="deli-root">
        <div class="deli-topbar">
          <div>
            <h2 class="deli-brand-title">👁️🦷 THE METAPHYSICAL DELI AT THE END OF YOUR FOREHEAD</h2>
            <p class="deli-brand-sub">Non-Euclidean Soup Cauldron · Laser Pendulum Bisector · Forbidden Hybrid Alchemy</p>
          </div>

          <div class="deli-stats-strip">
            <div class="deli-stat-pill">
              <span class="deli-stat-label">SCORE</span>
              <span class="deli-stat-val" id="deli-stat-score">0</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">EGO SANITY</span>
              <span class="deli-stat-val" id="deli-stat-sanity">100%</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">EGO COINS</span>
              <span class="deli-stat-val" id="deli-stat-coins">45₡</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">FEVER TIER</span>
              <span class="deli-stat-val" id="deli-stat-fever">TIER 1</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">COMBO</span>
              <span class="deli-stat-val" id="deli-stat-combo">x1</span>
            </div>
            <div class="deli-stat-pill">
              <span class="deli-stat-label">FED</span>
              <span class="deli-stat-val" id="deli-stat-fed">0 / 12</span>
            </div>
            <button
              type="button"
              class="deli-btn"
              commandfor="deli-grimoire-modal"
              command="show-modal"
            >
              📖 Forbidden Grimoire
            </button>
            <button type="button" class="deli-btn" id="deli-btn-mute" aria-pressed="false">
              🔊 Synth: ON
            </button>
            <button type="button" class="deli-btn" id="deli-btn-restart">
              ↻ New Fever Dream
            </button>
          </div>
        </div>

        <div class="deli-decree-bar" aria-live="polite">
          <div>
            <div class="deli-decree-title" id="deli-decree-title">DECREE #01: NOMINAL SUBCONSCIOUS GRAVITY</div>
            <div class="deli-decree-desc" id="deli-decree-desc">Ingredients drift downward at a polite Victorian pace.</div>
          </div>
          <div class="deli-stat-val" id="deli-decree-timer">24.0s</div>
        </div>

        <div class="deli-workspace">
          <div class="deli-stage-card">
            <canvas
              id="deli-canvas"
              class="deli-canvas"
              width="${CONFIG.CHAMBER_WIDTH}"
              height="${CONFIG.CHAMBER_HEIGHT}"
              aria-label="The Metaphysical Deli Interactive Soup Chamber"
            ></canvas>

            <div id="deli-overlay-modal" class="deli-overlay" hidden></div>

            <div class="deli-action-deck">
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button type="button" class="deli-btn deli-btn-hot" id="deli-act-grab">
                  ✋ Grab / Fling [Space]
                </button>
                <button type="button" class="deli-btn deli-btn-gold" id="deli-act-dunk">
                  🍲 Boil in Vortex [D]
                </button>
                <button type="button" class="deli-btn" id="deli-act-slice">
                  ⚡ Laser Bisect [S]
                </button>
                <button type="button" class="deli-btn" id="deli-act-splice">
                  🧬 Splice Hybrid [E]
                </button>
                <button type="button" class="deli-btn" id="deli-act-paradox">
                  ❄️ Paradox Freeze [Q] (50%)
                </button>
              </div>
              <button type="button" class="deli-btn deli-btn-gold" id="deli-act-serve-best">
                🍽️ Ladle Broth to Best Booth [Enter]
              </button>
            </div>
          </div>

          <div class="deli-sidebar">
            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>🍲 Primordial Broth Potency</span>
                <span id="deli-vortex-total" style="color:#fde047;">42 FLAVOR</span>
              </h3>
              <div id="deli-vortex-axes" style="font-family:'JetBrains Mono',monospace; font-size:0.78rem; color:#e2e8f0;"></div>
            </div>

            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>👁️ 3 Subconscious Patron Booths</span>
                <span style="font-size:0.7rem; color:#94a3b8;">[Z / X / C]</span>
              </h3>
              <div id="deli-booths-container" class="deli-booths-grid"></div>
            </div>

            <div class="deli-panel">
              <h3 class="deli-panel-title">
                <span>🎰 Vending Machine of Questionable Laws</span>
                <span style="font-size:0.7rem; color:#94a3b8;">[Keys 1–4]</span>
              </h3>
              <div class="deli-vending-grid">
                <button type="button" class="deli-btn" data-vend="SUMMON_ANOMALY">
                  [1] Summon Hybrid (${CONFIG.COST_SUMMON_ANOMALY}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="OVERCLOCK_PENDULUM">
                  [2] Gild Laser (${CONFIG.COST_OVERCLOCK_PENDULUM}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="POUR_LIQUID_FRIDAY">
                  [3] Liquid Friday (${CONFIG.COST_LIQUID_FRIDAY}₡)
                </button>
                <button type="button" class="deli-btn" data-vend="INVERT_DECREE">
                  [4] 2.5x Gold Fever (${CONFIG.COST_INVERT_DECREE}₡)
                </button>
              </div>
            </div>

            <pre id="deli-debug-panel" class="deli-panel" style="margin:0; font-size:0.72rem; color:#38bdf8; overflow-x:auto;" hidden></pre>
          </div>
        </div>

        <div class="deli-ticker-bar">
          <span id="deli-action-banner" style="color:#fde047; font-weight:700;">THE THIRD HAND AWAITS YOUR COMMAND</span>
          <span id="deli-ticker-text">WEATHER REPORT: 80% chance of heavy Victorian nostalgia.</span>
        </div>

        <dialog
          id="deli-grimoire-modal"
          class="deli-grimoire-dialog"
          closedby="any"
          aria-labelledby="deli-grimoire-title"
        >
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #4c1d95; padding-bottom:0.6rem; margin-bottom:0.8rem;">
            <h2 id="deli-grimoire-title" style="margin:0; font-size:1.15rem; color:#fde047;">
              📖 Forbidden Culinary Grimoire &amp; Hybrid Combos
            </h2>
            <button
              type="button"
              class="deli-btn"
              commandfor="deli-grimoire-modal"
              command="close"
            >
              Close [Esc]
            </button>
          </div>
          <p style="margin:0 0 0.75rem; font-size:0.84rem; color:#cbd5e1;">
            Collide two floating ingredients at high speed or press <strong>[E] Splice Hybrid</strong> to fuse Tier-2 Forbidden Delicacies! Splice any Tier-2 Hybrid with another ingredient to birth the <strong>🌌 5th-Dimensional Monolith Meatball</strong>!
          </p>
          <div id="deli-grimoire-list" style="display:grid; gap:0.5rem; font-size:0.82rem;"></div>
        </dialog>
      </div>
    `;

    this.canvas = this.container.querySelector<HTMLCanvasElement>('#deli-canvas')!;
    this.ctx = this.canvas.getContext('2d');

    this.elScore = this.container.querySelector('#deli-stat-score')!;
    this.elSanity = this.container.querySelector('#deli-stat-sanity')!;
    this.elCoins = this.container.querySelector('#deli-stat-coins')!;
    this.elFeverTier = this.container.querySelector('#deli-stat-fever')!;
    this.elCombo = this.container.querySelector('#deli-stat-combo')!;
    this.elPatronsFed = this.container.querySelector('#deli-stat-fed')!;
    this.elDecreeTitle = this.container.querySelector('#deli-decree-title')!;
    this.elDecreeDesc = this.container.querySelector('#deli-decree-desc')!;
    this.elDecreeTimer = this.container.querySelector('#deli-decree-timer')!;
    this.elVortexTotal = this.container.querySelector('#deli-vortex-total')!;
    this.elVortexAxes = this.container.querySelector('#deli-vortex-axes')!;
    this.elActionBanner = this.container.querySelector('#deli-action-banner')!;
    this.elTickerText = this.container.querySelector('#deli-ticker-text')!;
    this.elParadoxBtn = this.container.querySelector('#deli-act-paradox')!;
    this.elBoothsContainer = this.container.querySelector('#deli-booths-container')!;
    this.elGrimoireList = this.container.querySelector('#deli-grimoire-list')!;
    this.elDebugPanel = this.container.querySelector('#deli-debug-panel')!;
    this.elOverlayModal = this.container.querySelector('#deli-overlay-modal')!;
    this.elMuteBtn = this.container.querySelector('#deli-btn-mute')!;

    this.elDebugPanel.hidden = !this.debugVisible;

    // Fallback light-dismiss for browsers without native <dialog closedby="any">
    const grimoireDialog = this.container.querySelector<HTMLDialogElement>(
      '#deli-grimoire-modal'
    );
    if (
      grimoireDialog &&
      typeof HTMLDialogElement !== 'undefined' &&
      !('closedBy' in HTMLDialogElement.prototype)
    ) {
      grimoireDialog.addEventListener('click', (event) => {
        if (event.target !== grimoireDialog) return;
        const rect = grimoireDialog.getBoundingClientRect();
        const inside =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!inside) grimoireDialog.close();
      });
    }

    // Bind Action Buttons
    this.container
      .querySelector('#deli-act-grab')
      ?.addEventListener('click', () => {
        this.audio.playGrabPluck();
        this.callbacks.onAction({ type: 'GRAB_OR_FLING' });
      });

    this.container
      .querySelector('#deli-act-dunk')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'DUNK_NEAREST' });
      });

    this.container
      .querySelector('#deli-act-slice')
      ?.addEventListener('click', () => {
        this.audio.playSliceCrunch();
        this.callbacks.onAction({ type: 'SLICE_PULSE' });
      });

    this.container
      .querySelector('#deli-act-splice')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'TRANSMOGRIFY_SPLICE' });
      });

    this.elParadoxBtn?.addEventListener('click', () => {
      this.callbacks.onAction({ type: 'PARADOX_FREEZE' });
    });

    this.container
      .querySelector('#deli-act-serve-best')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'SERVE_BOOTH' });
      });

    this.container
      .querySelector('#deli-btn-restart')
      ?.addEventListener('click', () => {
        this.callbacks.onRestart();
      });

    this.elMuteBtn?.addEventListener('click', () => {
      const nextMute = !this.audio.isMuted();
      this.audio.setMuted(nextMute);
      this.elMuteBtn.setAttribute('aria-pressed', String(nextMute));
      this.elMuteBtn.textContent = nextMute ? '🔇 Synth: OFF' : '🔊 Synth: ON';
    });

    for (const btn of this.container.querySelectorAll<HTMLButtonElement>(
      'button[data-vend]'
    )) {
      btn.addEventListener('click', () => {
        const item = btn.getAttribute('data-vend') as VendingActionType;
        this.callbacks.onAction({ type: 'VENDING_ACTION', item });
      });
    }

    // Canvas Pointer Tracking & Click Interactions
    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CONFIG.CHAMBER_WIDTH / Math.max(1, rect.width);
      const scaleY = CONFIG.CHAMBER_HEIGHT / Math.max(1, rect.height);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    this.canvas.addEventListener('pointermove', (e) => {
      const pt = toCanvasCoords(e.clientX, e.clientY);
      this.callbacks.onAction({ type: 'SET_HAND_POS', x: pt.x, y: pt.y });
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      const pt = toCanvasCoords(e.clientX, e.clientY);

      // If user clicked in top booth bar (y < 105), serve that booth!
      if (pt.y < 105) {
        const boothIdx = Math.min(
          2,
          Math.max(0, Math.floor(pt.x / (CONFIG.CHAMBER_WIDTH / 3)))
        );
        this.callbacks.onAction({ type: 'SERVE_BOOTH', boothIndex: boothIdx });
        return;
      }

      // If user clicked directly on the Primordial Broth Vortex, dunk nearest/held!
      if (
        Math.hypot(pt.x - CONFIG.VORTEX_X, pt.y - CONFIG.VORTEX_Y) <=
        CONFIG.VORTEX_RADIUS * 1.15
      ) {
        this.callbacks.onAction({ type: 'DUNK_NEAREST' });
        return;
      }

      this.callbacks.onAction({ type: 'SET_HAND_POS', x: pt.x, y: pt.y });
      this.audio.playGrabPluck();
      this.callbacks.onAction({
        type: 'GRAB_OR_FLING',
        targetX: CONFIG.VORTEX_X,
        targetY: CONFIG.VORTEX_Y,
      });
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const step = 36;
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        e.preventDefault();
        this.callbacks.onAction({ type: 'NUDGE_HAND', dx: -step, dy: 0 });
        break;
      case 'arrowright':
      case 'd':
        e.preventDefault();
        if (e.shiftKey) {
          this.callbacks.onAction({ type: 'DUNK_NEAREST' });
        } else {
          this.callbacks.onAction({ type: 'NUDGE_HAND', dx: step, dy: 0 });
        }
        break;
      case 'arrowup':
      case 'w':
        e.preventDefault();
        this.callbacks.onAction({ type: 'NUDGE_HAND', dx: 0, dy: -step });
        break;
      case 'arrowdown':
        e.preventDefault();
        this.callbacks.onAction({ type: 'NUDGE_HAND', dx: 0, dy: step });
        break;
      case ' ':
        e.preventDefault();
        this.audio.playGrabPluck();
        this.callbacks.onAction({ type: 'GRAB_OR_FLING' });
        break;
      case 'b':
        e.preventDefault();
        this.callbacks.onAction({ type: 'DUNK_NEAREST' });
        break;
      case 's':
        e.preventDefault();
        this.audio.playSliceCrunch();
        this.callbacks.onAction({ type: 'SLICE_PULSE' });
        break;
      case 'e':
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRANSMOGRIFY_SPLICE' });
        break;
      case 'q':
        e.preventDefault();
        this.callbacks.onAction({ type: 'PARADOX_FREEZE' });
        break;
      case 'enter':
        e.preventDefault();
        this.callbacks.onAction({ type: 'SERVE_BOOTH' });
        break;
      case 'z':
        e.preventDefault();
        this.callbacks.onAction({ type: 'SERVE_BOOTH', boothIndex: 0 });
        break;
      case 'x':
        e.preventDefault();
        this.callbacks.onAction({ type: 'SERVE_BOOTH', boothIndex: 1 });
        break;
      case 'c':
        e.preventDefault();
        this.callbacks.onAction({ type: 'SERVE_BOOTH', boothIndex: 2 });
        break;
      case '1':
        e.preventDefault();
        this.callbacks.onAction({
          type: 'VENDING_ACTION',
          item: 'SUMMON_ANOMALY',
        });
        break;
      case '2':
        e.preventDefault();
        this.callbacks.onAction({
          type: 'VENDING_ACTION',
          item: 'OVERCLOCK_PENDULUM',
        });
        break;
      case '3':
        e.preventDefault();
        this.callbacks.onAction({
          type: 'VENDING_ACTION',
          item: 'POUR_LIQUID_FRIDAY',
        });
        break;
      case '4':
        e.preventDefault();
        this.callbacks.onAction({
          type: 'VENDING_ACTION',
          item: 'INVERT_DECREE',
        });
        break;
      case 'p':
        e.preventDefault();
        this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
        break;
    }
  }

  public consumeEvents(
    state: DeliGameState,
    events: readonly DeliSimEvent[]
  ): void {
    for (const ev of events) {
      const px = ev.x ?? CONFIG.CHAMBER_WIDTH / 2;
      const py = ev.y ?? CONFIG.CHAMBER_HEIGHT / 2;
      const col = ev.color ?? '#fde047';

      if (
        ev.type === 'INGREDIENT_SLICED' ||
        ev.type === 'HYBRID_SYNTHESIZED' ||
        ev.type === 'BROTH_BOILED' ||
        ev.type === 'PATRON_SERVED' ||
        ev.type === 'DECREE_SHIFTED' ||
        ev.type === 'HAZARD_DESTROYED' ||
        ev.type === 'HAZARD_CONTAMINATED' ||
        ev.type === 'VICTORY_UNLOCKED'
      ) {
        this.banners.push({
          text: ev.message,
          x: px,
          y: py,
          color: col,
          lifeMs: 0,
          maxLifeMs: 1650,
        });

        for (let i = 0; i < 12; i++) {
          const ang = (Math.PI * 2 * i) / 12;
          const spd = 45 + (i % 3) * 35;
          this.particles.push({
            x: px,
            y: py,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: col,
            size: 4 + (i % 3),
            alpha: 1,
            lifeMs: 0,
            maxLifeMs: 550,
          });
        }
      }

      switch (ev.type) {
        case 'INGREDIENT_SLICED':
        case 'HAZARD_DESTROYED':
          this.audio.playSliceCrunch();
          break;
        case 'HYBRID_SYNTHESIZED':
          this.audio.playHybridSplice();
          this.screenShakeMs = 180;
          break;
        case 'BROTH_BOILED':
          this.audio.playVortexBoil();
          break;
        case 'PATRON_SERVED':
        case 'VICTORY_UNLOCKED':
          this.audio.playPatronSatisfied(state.comboMultiplier);
          this.screenShakeMs = 140;
          break;
        case 'DECREE_SHIFTED':
        case 'PARADOX_ACTIVATED':
          this.audio.playDecreeWarp();
          break;
        case 'PATRON_STORMED_OUT':
        case 'HAZARD_CONTAMINATED':
          this.audio.playAlarmBuzzer();
          this.screenShakeMs = 260;
          break;
      }
    }
  }

  public render(
    state: DeliGameState,
    career: DeliCareerStats,
    dtMs: number
  ): void {
    const decree = getActiveDecreeDef(state);
    const totalSoup = getTotalFlavorMagnitude(state.vortexFlavors);

    // Update Top DOM Stats
    this.elScore.textContent = state.score.toLocaleString();
    this.elSanity.textContent = `${Math.max(0, Math.round(state.sanity))}%`;
    this.elSanity.style.color =
      state.sanity <= 30 ? '#ef4444' : state.sanity <= 60 ? '#fbbf24' : '#4ade80';
    this.elCoins.textContent = `${state.egoCoins}₡`;
    this.elFeverTier.textContent = `TIER ${state.feverTier}`;
    this.elCombo.textContent = `x${state.comboMultiplier}`;
    this.elPatronsFed.textContent = `${state.patronsFed} / ${CONFIG.PATRONS_FOR_VICTORY}`;

    this.elDecreeTitle.textContent =
      state.goldenFeverMs > 0
        ? `🌟 GOLDEN FEVER OVERRIDE (2.5x SCORE & FLAVOR!)`
        : `${decree.title} [${decree.ministryCode}]`;
    this.elDecreeDesc.textContent = decree.description;
    this.elDecreeTimer.textContent = `${(state.decreeTimerMs / 1000).toFixed(1)}s`;

    this.elVortexTotal.textContent = `${totalSoup} POTENCY`;
    this.elVortexAxes.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:0.3rem;">
        <div>🦷 CRUNCH: <strong style="color:#fde047">${state.vortexFlavors.crunch}</strong></div>
        <div>🕰️ NOSTALGIA: <strong style="color:#60a5fa">${state.vortexFlavors.nostalgia}</strong></div>
        <div>📻 STATIC: <strong style="color:#c084fc">${state.vortexFlavors.static}</strong></div>
        <div>🦞 CHUTZPAH: <strong style="color:#fb7185">${state.vortexFlavors.chutzpah}</strong></div>
      </div>
      <div style="margin-top:0.35rem; font-size:0.72rem; color:#94a3b8;">
        Boiled in Vat: ${state.lastBoiledSymbols.length > 0 ? state.lastBoiledSymbols.join(' ') : 'Simmering base stock...'}
      </div>
    `;

    this.elActionBanner.textContent = state.lastHandActionText;
    this.elTickerText.textContent = state.activeTickerText;
    this.elParadoxBtn.textContent =
      state.paradoxFreezeMs > 0
        ? `❄️ FROZEN (${(state.paradoxFreezeMs / 1000).toFixed(1)}s)`
        : `❄️ Paradox Freeze [Q] (${Math.floor(state.paradoxCharge)}%)`;

    // Render 3 Patron Booth Cards in Sidebar
    const hotkeys = ['Z', 'X', 'C'];
    this.elBoothsContainer.innerHTML = state.booths
      .map((booth, idx) => {
        const harmony = evaluateBoothHarmony(state.vortexFlavors, booth);
        const pct = Math.max(
          0,
          Math.min(100, Math.round((booth.patienceMs / booth.maxPatienceMs) * 100))
        );
        return `
          <div class="deli-booth-card ${harmony.isSatisfied ? 'is-ready' : ''}" style="--booth-color:${booth.auraColor}">
            <div class="deli-booth-header">
              <span>${booth.avatarEmoji} #${idx + 1} ${booth.name}</span>
              <span style="color:${pct < 35 ? '#ef4444' : '#a7f3d0'}">${pct}%⏳</span>
            </div>
            <p class="deli-booth-quote">"${booth.activeQuote}"</p>
            <div class="deli-booth-footer">
              <span>Craves: <strong>${booth.primaryAxis.toUpperCase()} + ${booth.secondaryAxis.toUpperCase()}</strong> (Need ${booth.minTotalFlavor})</span>
              <button
                type="button"
                class="deli-btn ${harmony.isSatisfied ? 'deli-btn-gold' : ''}"
                data-serve-booth="${idx}"
                style="padding:0.2rem 0.5rem; font-size:0.72rem;"
              >
                🍽️ Serve [${hotkeys[idx]}]
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    for (const btn of this.elBoothsContainer.querySelectorAll<HTMLButtonElement>(
      'button[data-serve-booth]'
    )) {
      btn.addEventListener('click', () => {
        const bIdx = Number(btn.getAttribute('data-serve-booth'));
        this.callbacks.onAction({ type: 'SERVE_BOOTH', boothIndex: bIdx });
      });
    }

    // Populate Forbidden Grimoire Modal List
    this.elGrimoireList.innerHTML = FUSION_RECIPES.map((rec) => {
      const a = ALL_INGREDIENTS_MAP.get(rec.ingredientA)!;
      const b = ALL_INGREDIENTS_MAP.get(rec.ingredientB)!;
      const res = ALL_INGREDIENTS_MAP.get(rec.resultId)!;
      const unlocked =
        state.discoveredHybrids.includes(res.id) ||
        career.hybridsDiscovered.includes(res.id);
      return `
        <div style="background:rgba(9,5,20,0.85); border:1px solid ${unlocked ? '#fde047' : '#334155'}; border-radius:0.5rem; padding:0.5rem 0.7rem; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <strong>${a.symbol} ${a.name} + ${b.symbol} ${b.name} → ${res.symbol} ${res.name}</strong>
            <div style="font-size:0.74rem; color:#94a3b8;">${res.lore}</div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:${unlocked ? '#fde047' : '#64748b'};">
            ${unlocked ? '★ DISCOVERED' : 'UNDISCOVERED'}
          </span>
        </div>
      `;
    }).join('');

    // Render Pause / Game Over Overlay if needed
    if (state.status === 'GAME_OVER') {
      this.elOverlayModal.hidden = false;
      this.elOverlayModal.innerHTML = `
        <h2 style="margin:0 0 0.5rem; font-size:1.8rem; color:#f43f5e;">
          👁️ ONTOLOGICAL PERMIT REVOKED (GAME OVER)
        </h2>
        <p style="max-width:52ch; color:#e2e8f0; margin:0 0 1rem;">
          ${state.gameOverReason ?? 'Your Ego Sanity evaporated into the 5th Dimension.'}
        </p>
        <div style="font-family:'JetBrains Mono',monospace; font-size:0.9rem; color:#fde047; margin-bottom:1.2rem;">
          Final Score: ${state.score.toLocaleString()} · Patrons Fed: ${state.patronsFed} · Max Combo: x${state.maxComboReached} · Career High: ${career.highScore.toLocaleString()}
        </div>
        <button type="button" class="deli-btn deli-btn-gold" id="deli-overlay-restart">
          ↻ Re-Open the Metaphysical Deli
        </button>
      `;
      this.elOverlayModal
        .querySelector('#deli-overlay-restart')
        ?.addEventListener('click', () => this.callbacks.onRestart());
    } else if (state.status === 'PAUSED') {
      this.elOverlayModal.hidden = false;
      this.elOverlayModal.innerHTML = `
        <h2 style="margin:0 0 0.5rem; font-size:1.6rem; color:#38bdf8;">
          ⏸ SUBCONSCIOUS PAUSED
        </h2>
        <p style="color:#cbd5e1; margin:0 0 1rem;">
          The baby teeth and jazz lobsters are patiently suspended in non-linear time.
        </p>
        <button type="button" class="deli-btn deli-btn-hot" id="deli-overlay-resume">
          ▶ Resume Cooking [P]
        </button>
      `;
      this.elOverlayModal
        .querySelector('#deli-overlay-resume')
        ?.addEventListener('click', () =>
          this.callbacks.onAction({ type: 'TOGGLE_PAUSE' })
        );
    } else {
      this.elOverlayModal.hidden = true;
    }

    // Debug Panel
    if (this.debugVisible) {
      const diff = getDifficultyForLevel(state.feverTier);
      this.elDebugPanel.textContent = JSON.stringify(
        {
          seed: state.seed,
          rngState: state.rngState,
          feverTier: state.feverTier,
          speedMult: diff.speedMultiplier,
          decree: state.activeDecreeId,
          floatingCount: state.ingredients.length,
          heldUid: state.heldIngredientUid,
          vortexFlavors: state.vortexFlavors,
          discoveredHybrids: state.discoveredHybrids,
        },
        null,
        2
      );
    }

    this.renderCanvasStage(state, dtMs);
  }

  private renderCanvasStage(state: DeliGameState, dtMs: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = CONFIG.CHAMBER_WIDTH;
    const h = CONFIG.CHAMBER_HEIGHT;
    const tSec = state.elapsedMs / 1000;
    const decree = getActiveDecreeDef(state);

    if (this.screenShakeMs > 0) {
      this.screenShakeMs = Math.max(0, this.screenShakeMs - dtMs);
    }

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    if (this.screenShakeMs > 0) {
      const mag = (this.screenShakeMs / 260) * 6;
      ctx.translate(
        Math.sin(tSec * 90) * mag,
        Math.cos(tSec * 75) * mag
      );
    }

    // 1. Surreal Dreamscape Background & Non-Euclidean Warping Horizon Grid
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (state.goldenFeverMs > 0) {
      bgGrad.addColorStop(0, '#422006');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#090514');
    } else if (state.paradoxFreezeMs > 0) {
      bgGrad.addColorStop(0, '#082f49');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    } else {
      bgGrad.addColorStop(0, '#1a0b2e');
      bgGrad.addColorStop(0.55, '#0d061a');
      bgGrad.addColorStop(1, '#05020a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Warping perspective lines
    ctx.strokeStyle =
      state.goldenFeverMs > 0
        ? 'rgba(250, 204, 21, 0.16)'
        : 'rgba(168, 85, 247, 0.14)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= w; gx += 60) {
      ctx.beginPath();
      const wobble = Math.sin(tSec * 2 + gx * 0.02) * 18;
      ctx.moveTo(gx, 100);
      ctx.quadraticCurveTo(w / 2 + wobble, h / 2, gx, h);
      ctx.stroke();
    }
    for (let gy = 110; gy <= h; gy += 55) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // 2. Top 3 Surreal Patron Booth Windows on Canvas
    const boothW = 250;
    for (let b = 0; b < state.booths.length; b++) {
      const booth = state.booths[b];
      const bx = 35 + b * 265;
      const by = 12;
      const harmony = evaluateBoothHarmony(state.vortexFlavors, booth);

      ctx.save();
      ctx.fillStyle = harmony.isSatisfied
        ? 'rgba(234, 179, 8, 0.22)'
        : 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = harmony.isSatisfied ? '#fde047' : booth.auraColor;
      ctx.lineWidth = harmony.isSatisfied ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, boothW, 84, 10);
      ctx.fill();
      ctx.stroke();

      // Draw blinking surreal eyeballs inside the booth!
      for (let e = 0; e < Math.min(7, booth.eyeCount); e++) {
        const ex = bx + 22 + e * 14;
        const ey = by + 24;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
        ctx.fill();

        const ang = Math.atan2(state.handY - ey, state.handX - ex);
        ctx.fillStyle = '#090514';
        ctx.beginPath();
        ctx.arc(
          ex + Math.cos(ang) * 2.2,
          ey + Math.sin(ang) * 2.2,
          2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        `${booth.avatarEmoji} ${booth.name.slice(0, 22)}`,
        bx + 12,
        by + 48
      );

      ctx.fillStyle = harmony.isSatisfied ? '#fde047' : '#cbd5e1';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(
        harmony.isSatisfied
          ? `★ READY TO SERVE! [CLICK / ${['Z', 'X', 'C'][b]}]`
          : `Wants ${booth.primaryAxis.toUpperCase()}+${booth.secondaryAxis.toUpperCase()} (${harmony.totalRaw}/${booth.minTotalFlavor})`,
        bx + 12,
        by + 66
      );

      // Patience bar at bottom of booth
      const patRatio = Math.max(0, booth.patienceMs / booth.maxPatienceMs);
      ctx.fillStyle = patRatio < 0.35 ? '#ef4444' : booth.auraColor;
      ctx.fillRect(bx + 10, by + 74, (boothW - 20) * patRatio, 5);
      ctx.restore();
    }

    // 3. The Primordial Broth Vortex (Bottom Center Swirling Cauldron)
    ctx.save();
    for (let ring = 3; ring >= 1; ring--) {
      const r = CONFIG.VORTEX_RADIUS * (ring / 2.4);
      const grad = ctx.createRadialGradient(
        CONFIG.VORTEX_X,
        CONFIG.VORTEX_Y,
        8,
        CONFIG.VORTEX_X,
        CONFIG.VORTEX_Y,
        r
      );
      if (state.goldenFeverMs > 0) {
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, 'rgba(234, 179, 8, 0.45)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      } else {
        grad.addColorStop(0, '#f472b6');
        grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.42)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(CONFIG.VORTEX_X, CONFIG.VORTEX_Y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling vortex rim
    ctx.strokeStyle = state.goldenFeverMs > 0 ? '#fde047' : '#e879f9';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(
      CONFIG.VORTEX_X,
      CONFIG.VORTEX_Y,
      CONFIG.VORTEX_RADIUS,
      tSec * 2,
      tSec * 2 + Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);

    const totalPotency = getTotalFlavorMagnitude(state.vortexFlavors);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🍲 PRIMORDIAL BROTH (${totalPotency})`,
      CONFIG.VORTEX_X,
      CONFIG.VORTEX_Y - 6
    );
    ctx.fillStyle = '#fde047';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(
      state.lastBoiledSymbols.length > 0
        ? state.lastBoiledSymbols.join(' ')
        : 'FLING OR CLICK [D] TO BOIL!',
      CONFIG.VORTEX_X,
      CONFIG.VORTEX_Y + 14
    );
    ctx.restore();

    // 4. The Non-Euclidean Laser Pendulum
    ctx.save();
    ctx.strokeStyle = state.overclockPendulumMs > 0 ? '#fde047' : '#f43f5e';
    ctx.lineWidth = state.overclockPendulumMs > 0 ? 4 : 2.5;
    ctx.beginPath();
    ctx.moveTo(CONFIG.PENDULUM_PIVOT_X, CONFIG.PENDULUM_PIVOT_Y);
    ctx.lineTo(state.pendulumBladeX, state.pendulumBladeY);
    ctx.stroke();

    // Spinning Laser Eye-Saw Blade
    ctx.translate(state.pendulumBladeX, state.pendulumBladeY);
    ctx.rotate(tSec * 7);
    ctx.fillStyle =
      state.overclockPendulumMs > 0
        ? 'rgba(250, 204, 21, 0.35)'
        : 'rgba(244, 63, 94, 0.28)';
    ctx.strokeStyle = state.overclockPendulumMs > 0 ? '#fef08a' : '#fb7185';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.PENDULUM_BLADE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-tSec * 7);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚙️', 0, 0);
    ctx.restore();

    // 5. Floating Surreal Ingredients
    for (const ing of state.ingredients) {
      ctx.save();

      // If Paranoid Pantry decree is active, draw little scrambling legs!
      if (decree.ingredientsFleeHand && !ing.isHazard) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        const legSwing = Math.sin(tSec * 18 + ing.uid) * 7;
        ctx.beginPath();
        ctx.moveTo(ing.x - 8, ing.y + ing.radius - 2);
        ctx.lineTo(ing.x - 12 + legSwing, ing.y + ing.radius + 11);
        ctx.moveTo(ing.x + 8, ing.y + ing.radius - 2);
        ctx.lineTo(ing.x + 12 - legSwing, ing.y + ing.radius + 11);
        ctx.stroke();
      }

      // Outer aura circle
      ctx.fillStyle = ing.isHazard
        ? 'rgba(239, 68, 68, 0.28)'
        : ing.isGilded
          ? 'rgba(250, 204, 21, 0.32)'
          : 'rgba(30, 16, 53, 0.86)';
      ctx.strokeStyle = ing.isGilded ? '#fde047' : ing.glowColor;
      ctx.lineWidth = ing.tier >= 2 || ing.isGilded ? 3 : 2;
      ctx.beginPath();
      ctx.arc(ing.x, ing.y, ing.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Emoji Symbol
      ctx.font = `${Math.round(ing.radius * 1.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ing.symbol, ing.x, ing.y);

      // Label below ingredient
      ctx.fillStyle = ing.isGilded ? '#fde047' : '#f8fafc';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(
        ing.isSlicedHalf ? `½ ${ing.name.slice(2, 14)}` : ing.name.slice(0, 15),
        ing.x,
        ing.y + ing.radius + 11
      );

      // Whisper bubble
      if (ing.whisperTimerMs > 0) {
        ctx.fillStyle = 'rgba(9, 5, 20, 0.9)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText(`"${ing.whisper}"`, ing.x, ing.y - ing.radius - 8);
      }

      ctx.restore();
    }

    // 6. The Third Hand (Player Controlled Surreal Velvet Glove + Palm Eye)
    ctx.save();
    // Draw tractor beam line to held or nearest ingredient
    if (state.ingredients.length > 0) {
      let target = state.ingredients.find(
        (i) => i.uid === state.heldIngredientUid
      );
      if (!target) {
        target = [...state.ingredients].sort(
          (a, b) =>
            Math.hypot(a.x - state.handX, a.y - state.handY) -
            Math.hypot(b.x - state.handX, b.y - state.handY)
        )[0];
      }
      if (target) {
        ctx.strokeStyle =
          state.heldIngredientUid !== null
            ? '#fde047'
            : 'rgba(56, 189, 248, 0.38)';
        ctx.lineWidth = state.heldIngredientUid !== null ? 3 : 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(state.handX, state.handY);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(state.handX, state.handY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      state.heldIngredientUid !== null ? '✊' : '✋',
      state.handX,
      state.handY
    );
    ctx.restore();

    // 7. Step & Render Particles and Floating Banners
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.lifeMs += dtMs;
      if (p.lifeMs >= p.maxLifeMs) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += (p.vx * dtMs) / 1000;
      p.y += (p.vy * dtMs) / 1000;
      p.alpha = 1 - p.lifeMs / p.maxLifeMs;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = this.banners.length - 1; i >= 0; i--) {
      const b = this.banners[i];
      b.lifeMs += dtMs;
      if (b.lifeMs >= b.maxLifeMs) {
        this.banners.splice(i, 1);
        continue;
      }
      b.y -= (22 * dtMs) / 1000;
      const alpha = 1 - b.lifeMs / b.maxLifeMs;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = b.color;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, b.x, b.y);
      ctx.restore();
    }

    ctx.restore();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    this.container.innerHTML = '';
  }
}
