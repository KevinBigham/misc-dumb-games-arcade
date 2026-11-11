import { ChronoAudioEngine } from './audio';
import { CHRONO_CONFIG } from './config';
import {
  HEIST_RIG_MODS,
  HEIST_STAGE_BLUEPRINTS,
  HeistRigModDef,
  SYNDICATE_RANKS,
} from './content';
import { ChronoCareerStats } from './persistence';
import {
  ChronoGameEvent,
  ChronoGameState,
  ChronoInputAction,
  computeSyndicateRank,
  getStageBlueprint,
  HeistAbilityVerb,
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

export interface ChronoUICallbacks {
  onAction: (action: ChronoInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
  onVisibilityPausedChange?: (paused: boolean) => void;
}

export class ChronoUIController {
  private container: HTMLElement;
  private audio: ChronoAudioEngine;
  private callbacks: ChronoUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private popups: FloatingPopup[] = [];
  private pressedKeys: Set<string> = new Set();

  private keydownHandler!: (e: KeyboardEvent) => void;
  private keyupHandler!: (e: KeyboardEvent) => void;
  private intersectionObserver: IntersectionObserver | null = null;

  private lastRenderedStage: number = -1;
  private lastRenderedStatus: string = '';
  private lastRenderedLoop: number = -1;
  private lastModsKey: string = '';
  private lastLogHead: string = '';

  constructor(
    container: HTMLElement,
    audio: ChronoAudioEngine,
    callbacks: ChronoUICallbacks,
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
    const panel = this.container.querySelector<HTMLElement>('#cs-debug-panel');
    if (panel) {
      panel.hidden = !this.debugVisible;
    }
  }

  public resetVisuals(): void {
    this.popups = [];
    this.lastRenderedStage = -1;
    this.lastRenderedStatus = '';
    this.lastRenderedLoop = -1;
    this.lastModsKey = '';
    this.lastLogHead = '';
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

  private setupBackgroundProcessingGuard(targetEl: HTMLElement): void {
    targetEl.addEventListener('contentvisibilityautostatechange', (event: Event) => {
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
      this.intersectionObserver.observe(targetEl);
    }
  }

  private mountDOM(): void {
    this.container.innerHTML = `
      <style>
        :root {
          --cs-accent-light: #059669;
          --cs-accent-dark: #10b981;
          --cs-accent: var(--cs-accent-dark);
          color-scheme: light dark;
          scrollbar-width: thin;
          scrollbar-color: #10b981 #090d16;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --cs-accent: var(--cs-accent-dark);
          }
        }

        @supports (color: light-dark(white, black)) {
          :root {
            --cs-accent: light-dark(var(--cs-accent-light), var(--cs-accent-dark));
          }
        }

        .cs-root {
          content-visibility: auto;
          contain-intrinsic-size: auto none auto 760px;
          background: radial-gradient(circle at 15% 10%, #0d1f2d 0%, #070b14 55%, #04070d 100%);
          color: #f1f5f9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
        }

        [popover]:is(:popover-open, .\\:popover-open) {
          display: block;
        }

        .cs-popover {
          background: #0b1324;
          color: #f1f5f9;
          border: 1px solid #10b981;
          border-radius: 12px;
          padding: 16px 20px;
          max-width: 500px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
        }

        .cs-dialog {
          background: #0b1324;
          color: #f1f5f9;
          border: 1px solid #38bdf8;
          border-radius: 14px;
          padding: 20px;
          max-width: 620px;
          width: 92vw;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
        }
        .cs-dialog::backdrop {
          background: rgba(3, 7, 18, 0.78);
          backdrop-filter: blur(4px);
        }

        .cs-topbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #1e293b;
        }

        .cs-badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.16);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.45);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          border-radius: 999px;
          text-transform: uppercase;
        }

        .cs-title {
          margin: 2px 0 0;
          font-size: 1.28rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f8fafc;
        }

        .cs-stage-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cs-btn {
          background: #131c31;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .cs-btn:hover {
          border-color: #10b981;
          background: #17253f;
        }
        .cs-btn[aria-current="step"] {
          background: rgba(16, 185, 129, 0.22);
          border-color: #10b981;
          color: #6ee7b7;
        }
        .cs-btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #04130e;
          border-color: #34d399;
          font-weight: 800;
        }
        .cs-btn-primary:hover {
          filter: brightness(1.08);
        }
        .cs-btn-rewind {
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          color: #041019;
          border-color: #7dd3fc;
          font-weight: 800;
        }

        .cs-kpi-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .cs-kpi-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 11px;
        }
        .cs-kpi-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }
        .cs-kpi-val {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin-top: 2px;
        }

        .cs-workspace {
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 1080px) {
          .cs-workspace {
            grid-template-columns: 1fr;
          }
        }

        .cs-canvas-card {
          background: #050912;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 10px;
          position: relative;
        }

        .cs-briefing-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 7px 11px;
          margin-bottom: 8px;
          font-size: 0.78rem;
          color: #d1fae5;
        }

        #cs-heist-canvas {
          width: 100%;
          max-width: 760px;
          height: auto;
          aspect-ratio: 760 / 440;
          display: block;
          margin: 0 auto;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: #060b16;
          cursor: crosshair;
        }

        .cs-scrubber-box {
          margin-top: 10px;
          background: #0b1322;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 9px 12px;
        }
        .cs-scrubber-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .cs-scrubber-tracks {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 6px;
        }
        .cs-track-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
        }
        .cs-track-bar {
          flex: 1;
          height: 8px;
          background: #1e293b;
          border-radius: 999px;
          position: relative;
          overflow: hidden;
        }
        .cs-track-fill {
          height: 100%;
          border-radius: 999px;
        }

        .cs-action-deck {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .cs-sidebar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cs-panel {
          background: #0b1322;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 11px 13px;
        }
        .cs-panel-title {
          margin: 0 0 8px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #38bdf8;
        }

        .cs-mod-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .cs-mod-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          background: #111c33;
          border: 1px solid #1e293b;
          font-size: 0.74rem;
        }

        .cs-log-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 165px;
          overflow-y: auto;
          scrollbar-gutter: stable;
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cs-log-list li {
          padding: 4px 7px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.7);
          border-left: 3px solid #10b981;
          color: #cbd5e1;
        }

        .cs-overlay-banner {
          margin-top: 10px;
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.18));
          border: 1px solid #10b981;
        }
      </style>

      <div class="cs-root" id="cs-root-surface">
        <div class="cs-topbar">
          <div>
            <span class="cs-badge">★ FLAGSHIP #12 · 4D TIME-LOOP TACTICAL HEIST</span>
            <h2 class="cs-title">Chrono-Syndicate: The 15-Second Heist</h2>
          </div>

          <div class="cs-stage-pills" role="group" aria-label="Heist Sector Selector">
            ${HEIST_STAGE_BLUEPRINTS.map(
              (bp) => `
              <button type="button" class="cs-btn" data-stage-jump="${bp.stageNumber}">
                Sector ${bp.stageNumber}: ${bp.title}
              </button>
            `
            ).join('')}
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" class="cs-btn" commandfor="cs-manual-popover" command="toggle-popover">
              ❓ 4D Heist Manual
            </button>
            <button type="button" class="cs-btn" commandfor="cs-dossier-dialog" command="show-modal">
              🎖️ Syndicate Dossier
            </button>
            <button type="button" class="cs-btn" id="cs-btn-mute">🔊 Audio: ON</button>
            <button type="button" class="cs-btn" id="cs-btn-reset-run">↻ New Seed Run</button>
          </div>
        </div>

        <div id="cs-manual-popover" class="cs-popover" popover>
          <h3 style="margin-top:0; color:#10b981;">⏱️ How 15-Second Ghost-Echo Co-Op Works</h3>
          <ol style="padding-left:18px; line-height:1.5; font-size:0.84rem;">
            <li><strong>Every Loop is 15.0 Seconds (300 Ticks):</strong> Everything you do—standing on Pressure Plates, decrypting Cipher Terminals, firing EMPs, or dropping Holo-Decoys—is recorded frame-by-frame.</li>
            <li><strong>Press [R] or "Commit Loop &amp; Rewind" Anytime:</strong> Time rewinds to <code>T = 0.0s</code> and your previous run materializes as an autonomous <strong>Ghost Echo</strong> that replays your exact path and actions!</li>
            <li><strong>Cooperate With Yourself:</strong> Have <em>Echo #1</em> hold open the North Pressure Plate &amp; stun the Sentinel at <code>T=4.5s</code> while <em>Operative #2</em> walks straight through the disabled Laser Gate to grab the Chronos Core!</li>
            <li><strong>Temporal Resonance:</strong> Moving within <code>68px</code> of any of your Ghost Echoes forms a 4D Resonance Tether (+Score &amp; Paradox stabilization).</li>
          </ol>
        </div>

        <dialog id="cs-dossier-dialog" class="cs-dialog" closedby="any" aria-labelledby="cs-dossier-title">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 id="cs-dossier-title" style="margin:0; color:#38bdf8;">🎖️ Chrono-Syndicate Career Dossier &amp; 4D Ranks</h3>
            <button type="button" class="cs-btn" commandfor="cs-dossier-dialog" command="close">Close [Esc]</button>
          </div>
          <div id="cs-dossier-body" style="font-size:0.84rem; line-height:1.5;"></div>
        </dialog>

        <div class="cs-kpi-strip">
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Active Sector</div>
            <div class="cs-kpi-val" id="cs-kpi-sector">SECTOR I</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">15s Loop Clock</div>
            <div class="cs-kpi-val" id="cs-kpi-clock" style="color:#38bdf8;">0.0s / 15.0s</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Active Timelines</div>
            <div class="cs-kpi-val" id="cs-kpi-loop">Loop #1 (0 Echoes)</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Rig Capacitor</div>
            <div class="cs-kpi-val" id="cs-kpi-energy" style="color:#10b981;">100 / 100 EN</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Paradox Instability</div>
            <div class="cs-kpi-val" id="cs-kpi-paradox">0% (STABLE)</div>
          </div>
          <div class="cs-kpi-card">
            <div class="cs-kpi-label">Syndicate Score</div>
            <div class="cs-kpi-val" id="cs-kpi-score" style="color:#f59e0b;">0</div>
          </div>
        </div>

        <div class="cs-workspace">
          <div class="cs-canvas-card">
            <div class="cs-briefing-bar">
              <span id="cs-briefing-text">Loading sector briefing...</span>
              <span id="cs-objective-pill" class="cs-badge">1. DECRYPT CIPHERS</span>
            </div>

            <canvas
              id="cs-heist-canvas"
              width="${CHRONO_CONFIG.ARENA_WIDTH}"
              height="${CHRONO_CONFIG.ARENA_HEIGHT}"
              aria-label="Chrono-Syndicate 4D Tactical Heist Arena"
            ></canvas>

            <div class="cs-action-deck">
              <button type="button" class="cs-btn cs-btn-rewind" id="cs-btn-rewind" title="Record current path as a Ghost Echo and rewind to T=0.0s [Key: R]">
                ⏪ Commit Loop &amp; Rewind to T=0.0s [R]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-emp" title="Discharge EMP Pulse: Stuns Sentinels &amp; Laser Gates for 3.2s [Key: 1 or Q]">
                ⚡ EMP Pulse (-${CHRONO_CONFIG.EMP_COST} EN) [1 / Q]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-decoy" title="Deploy Holo-Decoy: Holds Pressure Plates &amp; lures Sentinels [Key: 2 or E]">
                🎭 Holo-Decoy (-${CHRONO_CONFIG.DECOY_COST} EN) [2 / E]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-blink" title="Phase-Blink 105px forward across lasers [Key: 3 or Space]">
                ✨ Phase-Blink (-${CHRONO_CONFIG.BLINK_COST} EN) [3 / Space]
              </button>
              <button type="button" class="cs-btn" id="cs-btn-purge" title="Remove most recent Ghost Echo">
                🗑️ Undo Last Echo [Z]
              </button>
            </div>

            <div class="cs-scrubber-box">
              <div class="cs-scrubber-header">
                <span>🎞️ 4D Multi-Track Timeline Ribbon (0.0s → 15.0s)</span>
                <label style="display:flex; align-items:center; gap:6px;">
                  <span>Scrub Tick:</span>
                  <input
                    type="range"
                    id="cs-timeline-scrubber"
                    min="0"
                    max="${CHRONO_CONFIG.TIMELINE_DURATION_TICKS - 1}"
                    value="0"
                    style="accent-color:#10b981; width:150px;"
                  />
                </label>
              </div>
              <div id="cs-tracks-container" class="cs-scrubber-tracks"></div>
            </div>

            <div id="cs-stage-clear-banner" class="cs-overlay-banner" hidden></div>
          </div>

          <aside class="cs-sidebar">
            <div class="cs-panel">
              <h3 class="cs-panel-title">🎯 Sector Objectives &amp; Hints</h3>
              <div id="cs-objectives-list" style="font-size:0.78rem; line-height:1.5;"></div>
              <p id="cs-hint-box" style="margin:8px 0 0; font-size:0.73rem; color:#94a3b8; border-top:1px solid #1e293b; padding-top:6px;"></p>
            </div>

            <div class="cs-panel">
              <h3 class="cs-panel-title">🛠️ Quantum Rig Loadout (Free Toggle)</h3>
              <div id="cs-mod-list" class="cs-mod-grid"></div>
            </div>

            <div class="cs-panel">
              <h3 class="cs-panel-title">📡 Causality Telemetry Feed</h3>
              <ul id="cs-telemetry-log" class="cs-log-list"></ul>
            </div>

            <div class="cs-panel" id="cs-debug-panel" ${this.debugVisible ? '' : 'hidden'}>
              <h3 class="cs-panel-title">🐞 Deterministic Debug Inspector</h3>
              <pre id="cs-debug-pre" style="margin:0; font-size:0.7rem; color:#6ee7b7; white-space:pre-wrap;"></pre>
            </div>
          </aside>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector<HTMLCanvasElement>('#cs-heist-canvas')!;
    this.ctx = this.canvas.getContext('2d');

    const rootSurface = this.container.querySelector<HTMLElement>('#cs-root-surface');
    if (rootSurface) {
      this.setupBackgroundProcessingGuard(rootSurface);
    }
    this.setupDialogLightDismiss(this.container);
  }

  private bindEvents(): void {
    // Stage jump buttons
    for (const btn of this.container.querySelectorAll<HTMLButtonElement>('[data-stage-jump]')) {
      btn.addEventListener('click', () => {
        const st = Number(btn.getAttribute('data-stage-jump'));
        this.callbacks.onAction({ type: 'JUMP_TO_STAGE', stageNumber: st });
      });
    }

    // Action deck buttons
    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-rewind')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'COMMIT_LOOP_REWIND' });
      });

    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-emp')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'EMP_PULSE' });
      });

    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-decoy')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'DEPLOY_DECOY' });
      });

    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-blink')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'PHASE_BLINK' });
      });

    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-purge')
      ?.addEventListener('click', () => {
        this.callbacks.onAction({ type: 'PURGE_LAST_ECHO' });
      });

    const muteBtn = this.container.querySelector<HTMLButtonElement>('#cs-btn-mute');
    muteBtn?.addEventListener('click', () => {
      const nextMute = !this.audio.isMuted();
      this.audio.setMuted(nextMute);
      muteBtn.textContent = nextMute ? '🔇 Audio: OFF' : '🔊 Audio: ON';
    });

    this.container
      .querySelector<HTMLButtonElement>('#cs-btn-reset-run')
      ?.addEventListener('click', () => {
        this.callbacks.onRestart();
      });

    const scrubber = this.container.querySelector<HTMLInputElement>('#cs-timeline-scrubber');
    scrubber?.addEventListener('input', () => {
      const targetTick = Number(scrubber.value);
      this.callbacks.onAction({ type: 'SCRUB_TICK', tick: targetTick });
    });

    // Canvas click/drag movement
    const getCanvasCoords = (ev: MouseEvent): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / Math.max(1, rect.width);
      const scaleY = this.canvas.height / Math.max(1, rect.height);
      return {
        x: (ev.clientX - rect.left) * scaleX,
        y: (ev.clientY - rect.top) * scaleY,
      };
    };

    let pointerDown = false;
    this.canvas.addEventListener('mousedown', (ev) => {
      pointerDown = true;
      const pt = getCanvasCoords(ev);
      this.callbacks.onAction({ type: 'SET_TARGET_POINT', x: pt.x, y: pt.y });
    });
    this.canvas.addEventListener('mousemove', (ev) => {
      if (!pointerDown) return;
      const pt = getCanvasCoords(ev);
      this.callbacks.onAction({ type: 'SET_TARGET_POINT', x: pt.x, y: pt.y });
    });
    window.addEventListener('mouseup', () => {
      pointerDown = false;
    });

    // Keyboard controls
    const syncKeyboardVector = (): void => {
      let dx = 0;
      let dy = 0;
      if (this.pressedKeys.has('KeyW') || this.pressedKeys.has('ArrowUp')) dy -= 1;
      if (this.pressedKeys.has('KeyS') || this.pressedKeys.has('ArrowDown')) dy += 1;
      if (this.pressedKeys.has('KeyA') || this.pressedKeys.has('ArrowLeft')) dx -= 1;
      if (this.pressedKeys.has('KeyD') || this.pressedKeys.has('ArrowRight')) dx += 1;
      this.callbacks.onAction({ type: 'SET_MOVE', dirX: dx, dirY: dy });
    };

    this.keydownHandler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        if (e.code.startsWith('Arrow')) e.preventDefault();
        this.pressedKeys.add(e.code);
        syncKeyboardVector();
        return;
      }

      if (e.code === 'KeyQ' || e.code === 'Digit1') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'EMP_PULSE' });
      } else if (e.code === 'KeyE' || e.code === 'Digit2') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'DEPLOY_DECOY' });
      } else if (e.code === 'Space' || e.code === 'Digit3') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'TRIGGER_ABILITY', verb: 'PHASE_BLINK' });
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'COMMIT_LOOP_REWIND' });
      } else if (e.code === 'KeyZ') {
        e.preventDefault();
        this.callbacks.onAction({ type: 'PURGE_LAST_ECHO' });
      } else if (e.code === 'KeyN' || e.code === 'Enter') {
        this.callbacks.onAction({ type: 'NEXT_STAGE' });
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      if (this.pressedKeys.has(e.code)) {
        this.pressedKeys.delete(e.code);
        syncKeyboardVector();
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
  }

  public consumeEvents(state: ChronoGameState, events: readonly ChronoGameEvent[]): void {
    for (const ev of events) {
      let color = '#10b981';
      if (ev.type === 'EMP') {
        color = '#38bdf8';
        this.audio.playEmp();
      } else if (ev.type === 'DECOY') {
        color = '#f59e0b';
        this.audio.playDecoy();
      } else if (ev.type === 'BLINK') {
        color = '#a855f7';
        this.audio.playBlink();
      } else if (ev.type === 'GATE_OPEN') {
        color = '#34d399';
        this.audio.playGateOpen();
      } else if (ev.type === 'HACK_COMPLETE') {
        color = '#38bdf8';
        this.audio.playHackComplete();
      } else if (ev.type === 'CORE_GRABBED') {
        color = '#f59e0b';
        this.audio.playCoreGrabbed();
      } else if (ev.type === 'REWIND') {
        color = '#38bdf8';
        this.audio.playRewind();
      } else if (ev.type === 'ALERT' || ev.type === 'PARADOX_COLLAPSE') {
        color = '#f43f5e';
        this.audio.playAlert();
      } else if (ev.type === 'STAGE_CLEAR' || ev.type === 'VICTORY') {
        color = '#10b981';
        this.audio.playStageClear();
      }

      this.popups.push({
        text: ev.text,
        x: ev.x ?? state.agent.x,
        y: (ev.y ?? state.agent.y) - 18,
        color,
        alpha: 1.0,
        vy: -24,
      });
    }
  }

  public render(state: ChronoGameState, career: ChronoCareerStats, dtMs: number): void {
    const bp = getStageBlueprint(state.stageNumber);

    // Update top KPIs
    const kpiSector = this.container.querySelector<HTMLElement>('#cs-kpi-sector');
    if (kpiSector) kpiSector.textContent = `SECTOR ${state.stageNumber} / ${CHRONO_CONFIG.TOTAL_STAGES}`;

    const kpiClock = this.container.querySelector<HTMLElement>('#cs-kpi-clock');
    if (kpiClock) {
      const sec = (state.tick * (CHRONO_CONFIG.FIXED_STEP_MS / 1000)).toFixed(1);
      kpiClock.textContent = `${sec}s / 15.0s`;
    }

    const kpiLoop = this.container.querySelector<HTMLElement>('#cs-kpi-loop');
    if (kpiLoop) {
      kpiLoop.textContent = `Loop #${state.loopNumber} (${state.recordedEchoes.length} Echo${
        state.recordedEchoes.length === 1 ? '' : 'es'
      })`;
    }

    const kpiEnergy = this.container.querySelector<HTMLElement>('#cs-kpi-energy');
    if (kpiEnergy) {
      kpiEnergy.textContent = `${Math.round(state.agent.energy)} / ${state.agent.maxEnergy} EN`;
    }

    const kpiParadox = this.container.querySelector<HTMLElement>('#cs-kpi-paradox');
    if (kpiParadox) {
      const pct = Math.round(state.paradoxInstability);
      kpiParadox.textContent = `${pct}% ${
        pct >= 70 ? '⚠️ CRITICAL' : state.temporalResonanceActive ? '✨ RESONANCE' : 'STABLE'
      }`;
      kpiParadox.style.color =
        pct >= 70 ? '#f43f5e' : state.temporalResonanceActive ? '#38bdf8' : '#10b981';
    }

    const kpiScore = this.container.querySelector<HTMLElement>('#cs-kpi-score');
    if (kpiScore) {
      kpiScore.textContent = state.score.toLocaleString();
    }

    const scrubber = this.container.querySelector<HTMLInputElement>('#cs-timeline-scrubber');
    if (scrubber && document.activeElement !== scrubber) {
      scrubber.value = String(state.tick);
    }

    // Update objective status pill
    const objPill = this.container.querySelector<HTMLElement>('#cs-objective-pill');
    if (objPill) {
      if (state.coreCarrierLabel) {
        objPill.textContent = `3. EXTRACT TO HELIPAD (${state.coreCarrierLabel})`;
        objPill.style.borderColor = '#f59e0b';
        objPill.style.color = '#fcd34d';
      } else if (state.vaultUnlocked) {
        objPill.textContent = `2. SEIZE CHRONOS CORE AT EAST VAULT!`;
        objPill.style.borderColor = '#10b981';
        objPill.style.color = '#6ee7b7';
      } else {
        const hackedCount = state.terminals.filter((t) => t.hacked).length;
        objPill.textContent = `1. DECRYPT CIPHERS (${hackedCount}/${state.terminals.length})`;
        objPill.style.borderColor = '#38bdf8';
        objPill.style.color = '#7dd3fc';
      }
    }

    // Update stage briefing & pills when stage changes
    if (this.lastRenderedStage !== state.stageNumber) {
      this.lastRenderedStage = state.stageNumber;
      const briefingEl = this.container.querySelector<HTMLElement>('#cs-briefing-text');
      if (briefingEl) {
        briefingEl.innerHTML = `<strong>${bp.codeName} — ${bp.title}:</strong> ${bp.architectBriefing}`;
      }
      const hintEl = this.container.querySelector<HTMLElement>('#cs-hint-box');
      if (hintEl) {
        hintEl.textContent = bp.tacticalHint;
      }
      for (const btn of this.container.querySelectorAll<HTMLButtonElement>('[data-stage-jump]')) {
        const st = Number(btn.getAttribute('data-stage-jump'));
        if (st === state.stageNumber) {
          btn.setAttribute('aria-current', 'step');
        } else {
          btn.removeAttribute('aria-current');
        }
      }
    }

    this.renderObjectivesSidebar(state);
    this.renderRigModsSidebar(state);
    this.renderTimelineRibbon(state);
    this.renderTelemetryLog(state);
    this.renderOverlayBanner(state, career);
    this.renderDossierModal(state, career);

    if (this.debugVisible) {
      const dbgPre = this.container.querySelector<HTMLElement>('#cs-debug-pre');
      if (dbgPre) {
        dbgPre.textContent = JSON.stringify(
          {
            seed: state.seed,
            stage: state.stageNumber,
            loop: state.loopNumber,
            tick: state.tick,
            agent: {
              x: Math.round(state.agent.x),
              y: Math.round(state.agent.y),
              energy: Math.round(state.agent.energy),
            },
            echoes: state.recordedEchoes.length,
            vaultUnlocked: state.vaultUnlocked,
            coreCarrier: state.coreCarrierLabel,
            rngCalls: state.rngState.calls,
          },
          null,
          2
        );
      }
    }

    this.drawCanvas(state, bp, dtMs);
  }

  private renderObjectivesSidebar(state: ChronoGameState): void {
    const el = this.container.querySelector<HTMLElement>('#cs-objectives-list');
    if (!el) return;

    const switchRows = state.switches
      .map(
        (sw) =>
          `<div>• <strong>${sw.label}:</strong> ${
            sw.pressed || sw.holdTimerTicks > 0
              ? `<span style="color:#10b981;">OPEN (${sw.activatedByLabel ?? 'HOLD'})</span>`
              : `<span style="color:#94a3b8;">Stand or Drop Decoy</span>`
          }</div>`
      )
      .join('');

    const termRows = state.terminals
      .map(
        (t) =>
          `<div>• <strong>${t.label}:</strong> ${
            t.hacked
              ? `<span style="color:#38bdf8;">DECRYPTED (${t.hackedByLabel})</span>`
              : `<span style="color:#f59e0b;">${Math.round(
                  (t.progressTicks / t.hackTicksRequired) * 100
                )}% Decrypted</span>`
          }</div>`
      )
      .join('');

    const coreStatus = state.coreExtracted
      ? `<span style="color:#10b981;">EXTRACTED!</span>`
      : state.coreCarrierLabel
      ? `<span style="color:#f59e0b;">Carried by ${state.coreCarrierLabel} → Go to Extraction!</span>`
      : state.vaultUnlocked
      ? `<span style="color:#10b981;">VAULT OPEN — Grab the Core!</span>`
      : `<span style="color:#94a3b8;">Locked (Decrypt all Ciphers)</span>`;

    el.innerHTML = `
      ${switchRows}
      ${termRows}
      <div style="margin-top:4px;">• <strong>Chronos Core:</strong> ${coreStatus}</div>
    `;
  }

  private renderRigModsSidebar(state: ChronoGameState): void {
    const key = state.installedMods.join(',');
    if (this.lastModsKey === key) return;
    this.lastModsKey = key;

    const listEl = this.container.querySelector<HTMLElement>('#cs-mod-list');
    if (!listEl) return;

    listEl.innerHTML = HEIST_RIG_MODS.map((mod: HeistRigModDef) => {
      const installed = state.installedMods.includes(mod.id);
      return `
        <div class="cs-mod-item" style="border-color:${installed ? mod.badgeColor : '#1e293b'};">
          <div>
            <div style="font-weight:800; color:${installed ? mod.badgeColor : '#e2e8f0'};">
              ${mod.name}
            </div>
            <div style="color:#94a3b8; font-size:0.69rem;">${mod.tagline}</div>
          </div>
          <button
            type="button"
            class="cs-btn"
            data-install-mod="${mod.id}"
            ${installed ? 'disabled style="opacity:0.7; border-color:#10b981; color:#10b981;"' : ''}
          >
            ${installed ? '✓ Active' : '+ Equip'}
          </button>
        </div>
      `;
    }).join('');

    for (const btn of listEl.querySelectorAll<HTMLButtonElement>('[data-install-mod]')) {
      btn.addEventListener('click', () => {
        const modId = btn.getAttribute('data-install-mod') as HeistRigModDef['id'];
        this.callbacks.onAction({ type: 'INSTALL_MOD', modId });
      });
    }
  }

  private renderTimelineRibbon(state: ChronoGameState): void {
    const tracksEl = this.container.querySelector<HTMLElement>('#cs-tracks-container');
    if (!tracksEl) return;

    const progressPct = Math.min(
      100,
      Math.round((state.tick / CHRONO_CONFIG.TIMELINE_DURATION_TICKS) * 100)
    );

    const echoRows = state.recordedEchoes
      .map((rec) => {
        const recPct = Math.min(
          100,
          Math.round((rec.frames.length / CHRONO_CONFIG.TIMELINE_DURATION_TICKS) * 100)
        );
        return `
          <div class="cs-track-row">
            <span style="width:78px; font-weight:700; color:${rec.color};">${rec.label}</span>
            <div class="cs-track-bar">
              <div class="cs-track-fill" style="width:${recPct}%; background:${rec.color}; opacity:0.65;"></div>
            </div>
            <span style="width:45px; text-align:right; color:#94a3b8;">${(
              rec.frames.length * 0.05
            ).toFixed(1)}s</span>
          </div>
        `;
      })
      .join('');

    const liveRow = `
      <div class="cs-track-row">
        <span style="width:78px; font-weight:800; color:#10b981;">LIVE #${state.loopNumber}</span>
        <div class="cs-track-bar">
          <div class="cs-track-fill" style="width:${progressPct}%; background:#10b981;"></div>
        </div>
        <span style="width:45px; text-align:right; color:#10b981;">${(state.tick * 0.05).toFixed(
          1
        )}s</span>
      </div>
    `;

    tracksEl.innerHTML = echoRows + liveRow;
  }

  private renderTelemetryLog(state: ChronoGameState): void {
    const head = state.telemetryLog[0]
      ? `${state.telemetryLog[0].tick}-${state.telemetryLog[0].message}`
      : '';
    if (this.lastLogHead === head) return;
    this.lastLogHead = head;

    const logEl = this.container.querySelector<HTMLUListElement>('#cs-telemetry-log');
    if (!logEl) return;

    logEl.innerHTML = state.telemetryLog
      .slice(0, 12)
      .map(
        (entry) => `
        <li>
          <strong style="color:#38bdf8;">[T=${(entry.tick * 0.05).toFixed(1)}s]</strong>
          ${entry.message}
        </li>
      `
      )
      .join('');
  }

  private renderOverlayBanner(state: ChronoGameState, career: ChronoCareerStats): void {
    if (
      this.lastRenderedStatus === state.status &&
      this.lastRenderedLoop === state.loopNumber
    ) {
      return;
    }
    this.lastRenderedStatus = state.status;
    this.lastRenderedLoop = state.loopNumber;

    const banner = this.container.querySelector<HTMLElement>('#cs-stage-clear-banner');
    if (!banner) return;

    if (state.status === 'STAGE_CLEAR') {
      const latest = state.stageSummaries[state.stageSummaries.length - 1];
      banner.hidden = false;
      banner.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <h3 style="margin:0 0 4px; color:#10b981;">
              🚁 SECTOR ${state.stageNumber} EXTRACTED! (+${latest?.stageScore ?? 0} PTS)
            </h3>
            <p style="margin:0; font-size:0.82rem; color:#e2e8f0;">
              Cracked in <strong>${((latest?.ticksUsed ?? 0) * 0.05).toFixed(1)}s</strong> using
              <strong>${latest?.echoesUsed ?? 1} Timeline(s)</strong> (Par: ${latest?.parEchoCount ?? 2}).
            </p>
          </div>
          <button type="button" class="cs-btn cs-btn-primary" id="cs-btn-advance-stage">
            ▶ Deploy to Sector ${state.stageNumber + 1} [Enter]
          </button>
        </div>
      `;
      banner
        .querySelector<HTMLButtonElement>('#cs-btn-advance-stage')
        ?.addEventListener('click', () => {
          this.callbacks.onAction({ type: 'NEXT_STAGE' });
        });
    } else if (state.status === 'VICTORY' || state.status === 'GAME_OVER') {
      const rank = computeSyndicateRank(state);
      banner.hidden = false;
      banner.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div>
            <span class="cs-badge" style="border-color:${rank.accentColor}; color:${rank.accentColor};">
              ${state.status === 'VICTORY' ? '🏆 GRAND 4D HEIST COMPLETE' : '💥 TIMELINE COLLAPSED'}
            </span>
            <h3 style="margin:4px 0; color:${rank.accentColor};">
              Rank Earned: ${rank.title} — ${rank.subtitle}
            </h3>
            <p style="margin:0 0 6px; font-size:0.82rem; color:#cbd5e1;">${rank.summary}</p>
            <div style="font-size:0.76rem; color:#94a3b8;">
              Final Score: <strong>${state.score.toLocaleString()}</strong> · Career High: <strong>${career.highScore.toLocaleString()}</strong> · Vaults Cracked: <strong>${state.stageSummaries.length}/${CHRONO_CONFIG.TOTAL_STAGES}</strong>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="cs-btn cs-btn-primary" id="cs-btn-play-again">
              ↻ Run New Seed Heist
            </button>
          </div>
        </div>
      `;
      banner
        .querySelector<HTMLButtonElement>('#cs-btn-play-again')
        ?.addEventListener('click', () => {
          this.callbacks.onRestart();
        });
    } else {
      banner.hidden = true;
    }
  }

  private renderDossierModal(state: ChronoGameState, career: ChronoCareerStats): void {
    const body = this.container.querySelector<HTMLElement>('#cs-dossier-body');
    if (!body) return;

    const rankCards = Object.values(SYNDICATE_RANKS)
      .map((r) => {
        const unlocked = career.discoveredRanks.includes(r.id);
        return `
          <div style="padding:8px 10px; border-radius:8px; border:1px solid ${
            unlocked ? r.accentColor : '#1e293b'
          }; background:#0f172a; margin-bottom:6px;">
            <div style="font-weight:800; color:${unlocked ? r.accentColor : '#64748b'};">
              ${unlocked ? '★ ' : '🔒 '}${r.title} (${r.subtitle})
            </div>
            <div style="font-size:0.75rem; color:#cbd5e1;">${r.summary}</div>
          </div>
        `;
      })
      .join('');

    body.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; margin-bottom:12px;">
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Career High Score</div>
          <div class="cs-kpi-val">${career.highScore.toLocaleString()}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Grand Heists Completed</div>
          <div class="cs-kpi-val">${career.heistsCompleted}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Total Vaults Cracked</div>
          <div class="cs-kpi-val">${career.totalVaultsCracked}</div>
        </div>
        <div class="cs-kpi-card">
          <div class="cs-kpi-label">Ghost Echoes Deployed</div>
          <div class="cs-kpi-val">${career.totalEchoesDeployed}</div>
        </div>
      </div>
      <h4 style="margin:8px 0 6px; color:#e2e8f0;">4D Syndicate Master Ranks (${career.discoveredRanks.length}/4 Unlocked)</h4>
      ${rankCards}
    `;
  }

  private drawCanvas(
    state: ChronoGameState,
    bp: ReturnType<typeof getStageBlueprint>,
    dtMs: number
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const W = CHRONO_CONFIG.ARENA_WIDTH;
    const H = CHRONO_CONFIG.ARENA_HEIGHT;

    ctx.clearRect(0, 0, W, H);

    // 1. Tactical Blueprint Grid Background
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
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

    // 2. Draw Extraction Helipad Zone
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      bp.extractionPos.x,
      bp.extractionPos.y,
      CHRONO_CONFIG.EXTRACTION_PAD_RADIUS,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = state.coreCarrierLabel
      ? 'rgba(16, 185, 129, 0.22)'
      : 'rgba(56, 189, 248, 0.09)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = state.coreCarrierLabel ? '#10b981' : '#38bdf8';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('EXTRACT PAD', bp.extractionPos.x - 34, bp.extractionPos.y + 4);
    ctx.restore();

    // 3. Draw Recorded Ghost-Echo Breadcrumb Trails
    for (const rec of state.recordedEchoes) {
      if (rec.frames.length < 2) continue;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < rec.frames.length; i += 2) {
        const pt = rec.frames[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = rec.color;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Pressure Switch Plates
    for (const sw of state.switches) {
      const isOpen = sw.pressed || sw.holdTimerTicks > 0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, CHRONO_CONFIG.SWITCH_INTERACT_RADIUS - 6, 0, Math.PI * 2);
      ctx.fillStyle = isOpen ? 'rgba(16, 185, 129, 0.28)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isOpen ? '#10b981' : sw.color;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(sw.label, sw.x - 36, sw.y - 32);
      ctx.restore();
    }

    // 5. Draw Cipher Terminals
    for (const term of state.terminals) {
      const ratio = Math.min(1, term.progressTicks / term.hackTicksRequired);
      ctx.save();
      ctx.beginPath();
      ctx.arc(term.x, term.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = term.hacked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.16)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = term.hacked ? '#10b981' : '#38bdf8';
      ctx.stroke();

      // Progress ring
      if (!term.hacked && ratio > 0) {
        ctx.beginPath();
        ctx.arc(term.x, term.y, 23, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = term.hacked ? '#6ee7b7' : '#bae6fd';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(
        term.hacked ? `✓ ${term.label}` : `${term.label} (${Math.round(ratio * 100)}%)`,
        term.x - 42,
        term.y - 26
      );
      ctx.restore();
    }

    // 6. Draw Walls
    for (const w of bp.walls) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    // 7. Draw Laser Security Gates
    for (const gate of state.laserGates) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(gate.x1, gate.y1);
      ctx.lineTo(gate.x2, gate.y2);
      if (gate.isOpen) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
      }
      ctx.stroke();
      ctx.restore();
    }

    // 8. Draw Vault & Quantum Chronos Core
    if (!state.coreExtracted) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(state.corePos.x, state.corePos.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = state.vaultUnlocked
        ? 'rgba(245, 158, 11, 0.35)'
        : 'rgba(244, 63, 94, 0.2)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = state.vaultUnlocked ? '#f59e0b' : '#f43f5e';
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(
        state.coreCarrierLabel
          ? '💎 CORE ACTIVE'
          : state.vaultUnlocked
          ? '💎 CHRONOS CORE (OPEN)'
          : '🔒 VAULT LOCKED',
        state.corePos.x - 48,
        state.corePos.y - 22
      );
      ctx.restore();
    }

    // 9. Draw Holo-Decoys
    for (const dec of state.decoys) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('🎭 DECOY', dec.x - 22, dec.y - 16);
      ctx.restore();
    }

    // 10. Draw EMP Pulses
    for (const p of state.empPulses) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = Math.max(0.1, p.remainingTicks / 14);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 11. Draw Patrol Sentinels & Sight Cones
    for (const sent of state.sentinels) {
      ctx.save();
      if (sent.stunnedTicks <= 0) {
        ctx.beginPath();
        ctx.moveTo(sent.x, sent.y);
        ctx.arc(
          sent.x,
          sent.y,
          sent.visionRange,
          sent.facingRad - sent.visionAngleRad * 0.5,
          sent.facingRad + sent.visionAngleRad * 0.5
        );
        ctx.closePath();
        ctx.fillStyle = sent.alerted
          ? 'rgba(244, 63, 94, 0.28)'
          : 'rgba(244, 63, 94, 0.11)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sent.x, sent.y, 13, 0, Math.PI * 2);
      ctx.fillStyle =
        sent.stunnedTicks > 0 ? '#38bdf8' : sent.alerted ? '#f43f5e' : '#e11d48';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fda4af';
      ctx.stroke();

      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(
        sent.stunnedTicks > 0 ? `⚡ STUNNED (${(sent.stunnedTicks * 0.05).toFixed(1)}s)` : sent.name,
        sent.x - 36,
        sent.y - 18
      );
      ctx.restore();
    }

    // 12. Draw Temporal Resonance Beams & Active Ghost Echoes
    for (const ghost of state.activeGhosts) {
      if (!ghost.active) continue;

      const distToPlayer = Math.hypot(state.agent.x - ghost.x, state.agent.y - ghost.y);
      if (distToPlayer <= CHRONO_CONFIG.TEMPORAL_RESONANCE_RADIUS) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(state.agent.x, state.agent.y);
        ctx.lineTo(ghost.x, ghost.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, CHRONO_CONFIG.AGENT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = ghost.color;
      ctx.globalAlpha = 0.72;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = ghost.color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(ghost.label, ghost.x - 24, ghost.y - 18);
      ctx.restore();
    }

    // 13. Draw Live Player Operative
    ctx.save();
    ctx.beginPath();
    ctx.arc(state.agent.x, state.agent.y, CHRONO_CONFIG.AGENT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ecfdf5';
    ctx.stroke();

    // Direction indicator
    ctx.beginPath();
    ctx.moveTo(state.agent.x, state.agent.y);
    ctx.lineTo(
      state.agent.x + Math.cos(state.agent.facingRad) * 18,
      state.agent.y + Math.sin(state.agent.facingRad) * 18
    );
    ctx.strokeStyle = '#ecfdf5';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(`YOU (#${state.loopNumber})`, state.agent.x - 24, state.agent.y - 18);
    ctx.restore();

    // 14. Draw Floating Action Popups
    const dtSec = dtMs / 1000;
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y += p.vy * dtSec;
      p.alpha -= 0.75 * dtSec;
      if (p.alpha <= 0) {
        this.popups.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(p.text, Math.max(12, Math.min(W - 180, p.x - 40)), Math.max(18, p.y));
      ctx.restore();
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    window.removeEventListener('keyup', this.keyupHandler);
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.container.innerHTML = '';
  }
}
