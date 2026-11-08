import {
  CONFIG,
  getClearedBlocksForLevel,
  getDifficultyForLevel,
} from './config';
import {
  BLOCK_ARCHETYPES,
  BlockColorId,
  getCoreStageInfo,
  WAVE_PATTERNS,
} from './content';
import { OrbitAudioEngine } from './audio';
import { OrbitCareerStats } from './persistence';
import {
  getTargetFaceForLane,
  getWorldLaneForFace,
  OrbitGameState,
  OrbitInputAction,
  SimulationEvent,
} from './simulation';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  lifeMs: number;
  maxLifeMs: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext?: string;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

interface ShockwaveRing {
  radius: number;
  maxRadius: number;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
}

export interface OrbitUIControllerCallbacks {
  onAction: (action: OrbitInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
}

export class OrbitUIController {
  private container: HTMLElement;
  private audio: OrbitAudioEngine;
  private callbacks: OrbitUIControllerCallbacks;

  private rootEl!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  // HUD DOM elements
  private scoreValEl!: HTMLElement;
  private highScoreValEl!: HTMLElement;
  private levelValEl!: HTMLElement;
  private coreBadgeEl!: HTMLElement;
  private clearsValEl!: HTMLElement;
  private comboValEl!: HTMLElement;
  private pulseFillEl!: HTMLElement;
  private pulseBtnEl!: HTMLButtonElement;
  private pauseBtnEl!: HTMLButtonElement;
  private muteBtnEl!: HTMLButtonElement;
  private debugBtnEl!: HTMLButtonElement;
  private liveAnnouncerEl!: HTMLElement;
  private overlayEl!: HTMLElement;
  private debugPanelEl!: HTMLElement;

  // Visual interpolation & FX state
  private visualAngleRad: number = 0;
  private screenShakeMs: number = 0;
  private screenShakeMagnitude: number = 0;
  private morphBannerTimerMs: number = 0;
  private morphBannerText: string = '';
  private particles: Particle[] = [];
  private popups: FloatingPopup[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private debugVisible: boolean = false;
  private lastAnnouncedStatus: string = '';
  private lastAnnouncedLevel: number = 1;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundResize: () => void;

  constructor(
    container: HTMLElement,
    audio: OrbitAudioEngine,
    callbacks: OrbitUIControllerCallbacks,
    initialDebug: boolean = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundResize = this.handleResize.bind(this);

    this.buildDOM();
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);
    this.handleResize();
  }

  private buildDOM(): void {
    this.container.innerHTML = '';

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .orbit-stack-shell {
        --os-bg: #070b19;
        --os-panel: #0f172a;
        --os-border: #334155;
        --os-text: #f8fafc;
        --os-muted: #cbd5e1;
        --os-accent: #22d3ee;
        --os-warn: #f43f5e;
        color-scheme: dark;
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
        background: radial-gradient(circle at 50% 35%, #111c38 0%, #070b19 72%);
        color: var(--os-text);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        gap: 8px;
        user-select: none;
      }
      .orbit-stack-shell *, .orbit-stack-shell *::before, .orbit-stack-shell *::after {
        box-sizing: border-box;
      }
      .os-visually-hidden:where(:not(:focus-within, :active)) {
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
      .os-header {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: rgba(15, 23, 42, 0.88);
        border: 1.5px solid var(--os-border);
        border-radius: 12px;
        padding: 8px 12px;
      }
      .os-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .os-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #f8fafc;
      }
      .os-core-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(6, 182, 212, 0.18);
        border: 1.5px solid #22d3ee;
        color: #ecfeff;
        letter-spacing: 0.04em;
      }
      .os-stats-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .os-stat {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .os-stat-label {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--os-muted);
      }
      .os-stat-value {
        font-size: 0.98rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: #ffffff;
      }
      .os-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .os-btn {
        appearance: none;
        background: #1e293b;
        color: #f8fafc;
        border: 1.5px solid #64748b;
        border-radius: 8px;
        padding: 6px 11px;
        min-block-size: 36px;
        min-inline-size: 36px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: background 120ms ease, transform 80ms ease, border-color 120ms ease;
      }
      .os-btn:hover {
        background: #334155;
        border-color: #94a3b8;
      }
      .os-btn:active {
        transform: scale(0.97);
      }
      .os-btn:focus-visible {
        outline: 3px solid #38bdf8;
        outline-offset: 3px;
      }
      .os-btn[aria-pressed="true"] {
        background: #0e7490;
        border-color: #67e8f9;
        color: #ffffff;
      }
      .os-main {
        position: relative;
        width: 100%;
        max-width: 820px;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 340px;
      }
      .os-canvas-wrap {
        position: relative;
        width: min(100%, 500px);
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .os-canvas {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 16px;
        touch-action: none;
      }
      .os-overlay {
        position: absolute;
        inset: 0;
        background: rgba(7, 11, 25, 0.86);
        backdrop-filter: blur(5px);
        border: 1.5px solid #475569;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        z-index: 10;
      }
      .os-overlay[hidden] {
        display: none !important;
      }
      .os-overlay-title {
        margin: 0 0 6px;
        font-size: 1.45rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #f8fafc;
      }
      .os-overlay-desc {
        margin: 0 0 16px;
        max-width: 360px;
        font-size: 0.88rem;
        line-height: 1.45;
        color: #cbd5e1;
      }
      .os-overlay-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
      .os-btn-primary {
        background: #0284c7;
        border-color: #7dd3fc;
        color: #ffffff;
        padding: 9px 16px;
        font-size: 0.86rem;
      }
      .os-btn-primary:hover {
        background: #0369a1;
      }
      .os-footer {
        width: 100%;
        max-width: 820px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .os-controls-bar {
        display: grid;
        grid-template-columns: 1fr 1fr 1.15fr 1fr;
        gap: 8px;
        width: 100%;
      }
      .os-action-btn {
        min-block-size: 44px;
        font-size: 0.84rem;
        border-radius: 10px;
      }
      .os-pulse-btn {
        position: relative;
        overflow: hidden;
        background: #1e1b4b;
        border-color: #818cf8;
      }
      .os-pulse-btn[data-ready="true"] {
        background: #4c1d95;
        border-color: #ddd6fe;
        box-shadow: 0 0 12px rgba(167, 139, 250, 0.45);
      }
      .os-pulse-fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: 50%;
        background: rgba(139, 92, 246, 0.32);
        pointer-events: none;
        transition: width 120ms linear;
      }
      .os-pulse-label {
        position: relative;
        z-index: 1;
      }
      .os-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.72rem;
        color: var(--os-muted);
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px 10px;
      }
      .os-glyph-list {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .os-glyph-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 5px;
        font-weight: 700;
        font-size: 0.7rem;
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid #475569;
      }
      .os-debug-panel {
        width: 100%;
        max-width: 820px;
        background: rgba(2, 6, 23, 0.92);
        border: 1.5px solid #38bdf8;
        border-radius: 8px;
        padding: 8px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.72rem;
        color: #bae6fd;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 6px;
      }
      .os-debug-panel[hidden] {
        display: none !important;
      }
      @media (pointer: coarse) {
        .os-btn {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
        .os-action-btn {
          min-block-size: 50px;
        }
      }
      @media (forced-colors: active) {
        .os-btn, .os-header, .os-overlay, .os-legend {
          border: 2px solid ButtonText;
        }
      }
    `;
    this.container.appendChild(styleEl);

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'orbit-stack-shell';
    this.rootEl.innerHTML = `
      <div class="os-visually-hidden" aria-live="polite" aria-atomic="true" data-role="live-announcer"></div>

      <header class="os-header">
        <div class="os-brand">
          <h1 class="os-title">Orbit Stack</h1>
          <span class="os-core-badge" data-role="core-badge">HEX CORE (6 SIDES)</span>
        </div>

        <div class="os-stats-row">
          <div class="os-stat">
            <span class="os-stat-label">Score</span>
            <span class="os-stat-value" data-role="score-val">0</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Best</span>
            <span class="os-stat-value" data-role="best-val">0</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Level</span>
            <span class="os-stat-value" data-role="level-val">1</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Cleared</span>
            <span class="os-stat-value" data-role="clears-val">0 / 100</span>
          </div>
          <div class="os-stat">
            <span class="os-stat-label">Combo</span>
            <span class="os-stat-value" data-role="combo-val">x1</span>
          </div>
        </div>

        <div class="os-toolbar">
          <button type="button" class="os-btn" data-role="pause-btn" aria-pressed="false">Pause (P)</button>
          <button type="button" class="os-btn" data-role="mute-btn" aria-pressed="false">Audio On</button>
          <button type="button" class="os-btn" data-role="debug-btn" aria-pressed="${this.debugVisible}">Debug (D)</button>
          <button type="button" class="os-btn" data-role="restart-btn">Restart</button>
        </div>
      </header>

      <main class="os-main">
        <div class="os-canvas-wrap">
          <canvas class="os-canvas" width="540" height="540" aria-label="Orbit Stack radial polygon puzzle board"></canvas>
          <div class="os-overlay" data-role="overlay" role="dialog" aria-labelledby="os-overlay-heading" hidden>
            <h2 class="os-overlay-title" id="os-overlay-heading" data-role="overlay-title">PAUSED</h2>
            <p class="os-overlay-desc" data-role="overlay-desc">Orbital shard streams suspended.</p>
            <div class="os-overlay-actions" data-role="overlay-actions"></div>
          </div>
        </div>
      </main>

      <aside class="os-debug-panel" data-role="debug-panel" aria-label="Debug Telemetry" ${this.debugVisible ? '' : 'hidden'}></aside>

      <footer class="os-footer">
        <div class="os-controls-bar">
          <button type="button" class="os-btn os-action-btn" data-role="rot-left-btn">⟲ Rotate Left (A / ←)</button>
          <button type="button" class="os-btn os-action-btn" data-role="slam-btn">⚡ Slam Shard (Space / ↓)</button>
          <button type="button" class="os-btn os-action-btn os-pulse-btn" data-role="pulse-btn" data-ready="false">
            <span class="os-pulse-fill" data-role="pulse-fill"></span>
            <span class="os-pulse-label" data-role="pulse-label">✦ Pulse 50% (Shift / ↑)</span>
          </button>
          <button type="button" class="os-btn os-action-btn" data-role="rot-right-btn">Rotate Right (D / →) ⟳</button>
        </div>
        <div class="os-legend">
          <span><strong>Goal:</strong> Match 3+ connected shards (radial or adjacent faces). Morphs 6 → 7 (Lv4) → 8 sides (Lv7).</span>
          <div class="os-glyph-list" aria-label="Colorblind Shard Key">
            <span class="os-glyph-chip" style="color:#67e8f9">▲ Cyan</span>
            <span class="os-glyph-chip" style="color:#fde68a">● Amber</span>
            <span class="os-glyph-chip" style="color:#fbcfe8">■ Magenta</span>
            <span class="os-glyph-chip" style="color:#a7f3d0">◆ Emerald</span>
            <span class="os-glyph-chip" style="color:#ddd6fe">★ Violet (Lv4+)</span>
          </div>
        </div>
      </footer>
    `;

    this.container.appendChild(this.rootEl);

    this.canvas = this.rootEl.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.scoreValEl = this.rootEl.querySelector('[data-role="score-val"]')!;
    this.highScoreValEl = this.rootEl.querySelector('[data-role="best-val"]')!;
    this.levelValEl = this.rootEl.querySelector('[data-role="level-val"]')!;
    this.coreBadgeEl = this.rootEl.querySelector('[data-role="core-badge"]')!;
    this.clearsValEl = this.rootEl.querySelector('[data-role="clears-val"]')!;
    this.comboValEl = this.rootEl.querySelector('[data-role="combo-val"]')!;
    this.pulseFillEl = this.rootEl.querySelector('[data-role="pulse-fill"]')!;
    this.pulseBtnEl = this.rootEl.querySelector('[data-role="pulse-btn"]')!;
    this.pauseBtnEl = this.rootEl.querySelector('[data-role="pause-btn"]')!;
    this.muteBtnEl = this.rootEl.querySelector('[data-role="mute-btn"]')!;
    this.debugBtnEl = this.rootEl.querySelector('[data-role="debug-btn"]')!;
    this.liveAnnouncerEl = this.rootEl.querySelector('[data-role="live-announcer"]')!;
    this.overlayEl = this.rootEl.querySelector('[data-role="overlay"]')!;
    this.debugPanelEl = this.rootEl.querySelector('[data-role="debug-panel"]')!;

    // Bind button events
    this.rootEl
      .querySelector('[data-role="rot-left-btn"]')!
      .addEventListener('click', () => {
        this.callbacks.onAction({ type: 'ROTATE_LEFT' });
      });
    this.rootEl
      .querySelector('[data-role="rot-right-btn"]')!
      .addEventListener('click', () => {
        this.callbacks.onAction({ type: 'ROTATE_RIGHT' });
      });
    this.rootEl
      .querySelector('[data-role="slam-btn"]')!
      .addEventListener('click', () => {
        this.callbacks.onAction({ type: 'SLAM_INWARD' });
      });
    this.pulseBtnEl.addEventListener('click', () => {
      this.callbacks.onAction({ type: 'PHASE_PULSE' });
    });
    this.pauseBtnEl.addEventListener('click', () => {
      this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
    });
    this.muteBtnEl.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      this.muteBtnEl.setAttribute('aria-pressed', String(muted));
      this.muteBtnEl.textContent = muted ? 'Audio Muted' : 'Audio On';
    });
    this.debugBtnEl.addEventListener('click', () => {
      this.callbacks.onToggleDebug();
    });
    this.rootEl
      .querySelector('[data-role="restart-btn"]')!
      .addEventListener('click', () => {
        this.callbacks.onRestart();
      });

    // Direct canvas tap/click left vs right half for ergonomic mobile play
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const distFromCenter = Math.hypot(relX - cx, relY - cy);

      if (distFromCenter < rect.width * 0.14) {
        // Center core tap triggers Slam (or Phase Pulse if ready)
        this.callbacks.onAction({ type: 'SLAM_INWARD' });
      } else if (relX < cx) {
        this.callbacks.onAction({ type: 'ROTATE_LEFT' });
      } else {
        this.callbacks.onAction({ type: 'ROTATE_RIGHT' });
      }
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this.callbacks.onAction({ type: 'ROTATE_LEFT' });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (e.shiftKey || e.altKey) {
          this.callbacks.onToggleDebug();
        } else {
          this.callbacks.onAction({ type: 'ROTATE_RIGHT' });
        }
        break;
      case ' ':
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        this.callbacks.onAction({ type: 'SLAM_INWARD' });
        break;
      case 'Shift':
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        this.callbacks.onAction({ type: 'PHASE_PULSE' });
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
        break;
      case 'i':
      case 'I':
      case '`':
      case 'F3':
        e.preventDefault();
        this.callbacks.onToggleDebug();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        this.callbacks.onRestart();
        break;
    }
  }

  private handleResize(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.max(300, Math.floor(Math.min(rect.width, rect.height) * dpr));
    if (this.canvas.width !== size || this.canvas.height !== size) {
      this.canvas.width = size;
      this.canvas.height = size;
    }
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    if (this.debugPanelEl) {
      this.debugPanelEl.hidden = !visible;
    }
    if (this.debugBtnEl) {
      this.debugBtnEl.setAttribute('aria-pressed', String(visible));
    }
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public resetVisuals(): void {
    this.visualAngleRad = 0;
    this.particles = [];
    this.popups = [];
    this.shockwaves = [];
    this.screenShakeMs = 0;
    this.morphBannerTimerMs = 0;
  }

  public consumeEvents(state: OrbitGameState, events: SimulationEvent[]): void {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const boardRadius = this.canvas.width * 0.44;
    const coreRadius = boardRadius * 0.25;
    const playfieldSpan = boardRadius - coreRadius;

    for (const ev of events) {
      if (ev.type === 'ROTATED') {
        this.audio.playRotateTick();
      } else if (ev.type === 'SHARD_LOCKED') {
        this.audio.playShardLock(ev.color ?? 0, ev.depth ?? 0);
        this.screenShakeMs = Math.max(this.screenShakeMs, 55);
        this.screenShakeMagnitude = Math.max(this.screenShakeMagnitude, 2.2);
      } else if (ev.type === 'MATCH_CLEARED' || ev.type === 'CASCADE_CLEARED') {
        this.audio.playMatchChord(
          ev.color ?? 0,
          ev.clearedCount ?? 3,
          ev.comboMultiplier ?? 1,
          ev.cascadeDepth ?? 1
        );
        this.screenShakeMs = Math.max(this.screenShakeMs, 130);
        this.screenShakeMagnitude = Math.max(
          this.screenShakeMagnitude,
          (ev.clearedCount ?? 3) >= 5 ? 6.5 : 4.0
        );

        // Spawn particle burst for each cleared cell
        if (ev.cells && ev.cells.length > 0) {
          let sumX = 0;
          let sumY = 0;
          const stepAngle = (Math.PI * 2) / state.numSides;

          for (const cell of ev.cells) {
            const worldLane = getWorldLaneForFace(
              cell.face,
              state.coreRotationIndex,
              state.numSides
            );
            const angle = -Math.PI / 2 + worldLane * stepAngle;
            const r =
              coreRadius +
              (cell.depth + 0.5) * CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            sumX += px;
            sumY += py;
            this.spawnBurstParticles(px, py, cell.color, 9);
          }

          const avgX = sumX / ev.cells.length;
          const avgY = sumY / ev.cells.length;
          const arch = BLOCK_ARCHETYPES[ev.color ?? 0] ?? BLOCK_ARCHETYPES[0];
          const label =
            ev.type === 'CASCADE_CLEARED'
              ? `CASCADE +${ev.scoreDelta}`
              : `+${ev.scoreDelta}`;
          const sub =
            (ev.comboMultiplier ?? 1) > 1
              ? `${arch.symbol} x${ev.comboMultiplier} COMBO!`
              : undefined;
          this.popups.push({
            x: avgX,
            y: avgY,
            vy: -42,
            text: label,
            subtext: sub,
            color: arch.strokeHex,
            lifeMs: 950,
            maxLifeMs: 950,
          });
        }
      } else if (ev.type === 'POLYGON_MORPHED') {
        this.audio.playMorphFanfare(ev.newSides ?? 7);
        const stageInfo = getCoreStageInfo(ev.newSides ?? 7);
        this.morphBannerText = `MORPH UNLOCKED: ${stageInfo.title}`;
        this.morphBannerTimerMs = 2600;
        this.shockwaves.push({
          radius: coreRadius,
          maxRadius: boardRadius * 1.05,
          color: stageInfo.badgeColor,
          lifeMs: 650,
          maxLifeMs: 650,
        });
      } else if (ev.type === 'PHASE_PULSE_FIRED') {
        this.audio.playPhasePulse();
        this.screenShakeMs = 190;
        this.screenShakeMagnitude = 7.5;
        this.shockwaves.push({
          radius: coreRadius * 0.8,
          maxRadius: boardRadius * 1.08,
          color: '#a78bfa',
          lifeMs: 520,
          maxLifeMs: 520,
        });
        this.popups.push({
          x: cx,
          y: cy - coreRadius * 0.9,
          vy: -36,
          text: `PHASE PULSE +${ev.scoreDelta ?? 150}`,
          subtext: 'INNER RING VAPORIZED',
          color: '#ddd6fe',
          lifeMs: 1100,
          maxLifeMs: 1100,
        });
      } else if (ev.type === 'GAME_OVER') {
        this.audio.playContainmentBreach();
        this.screenShakeMs = 280;
        this.screenShakeMagnitude = 9.0;
      }
    }
  }

  private spawnBurstParticles(
    x: number,
    y: number,
    colorId: BlockColorId,
    count: number
  ): void {
    const arch = BLOCK_ARCHETYPES[colorId] ?? BLOCK_ARCHETYPES[0];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 45 + Math.random() * 115;
      const lifeMs = 340 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.8 + Math.random() * 3.0,
        color: i % 2 === 0 ? arch.fillHex : arch.strokeHex,
        alpha: 1,
        lifeMs,
        maxLifeMs: lifeMs,
      });
    }
  }

  public render(
    state: OrbitGameState,
    career: OrbitCareerStats,
    dtMs: number
  ): void {
    // 1. Update HUD text & states
    const stageInfo = getCoreStageInfo(state.numSides);
    this.scoreValEl.textContent = state.score.toLocaleString();
    this.highScoreValEl.textContent = Math.max(
      career.highScore,
      state.score
    ).toLocaleString();
    this.levelValEl.textContent = String(state.level);
    this.coreBadgeEl.textContent = stageInfo.title;
    this.coreBadgeEl.style.borderColor = stageInfo.badgeColor;
    this.clearsValEl.textContent = `${state.totalClearedBlocks} / ${CONFIG.VICTORY_TARGET_CLEARS}`;
    this.comboValEl.textContent = `x${state.comboMultiplier}`;

    const pulsePct = Math.min(
      100,
      Math.round((state.phasePulseCharge / CONFIG.PHASE_PULSE_MAX_CHARGE) * 100)
    );
    const pulseReady = state.phasePulseCharge >= CONFIG.PHASE_PULSE_MAX_CHARGE;
    this.pulseFillEl.style.width = `${pulsePct}%`;
    this.pulseBtnEl.setAttribute('data-ready', String(pulseReady));
    const pulseLabelEl = this.pulseBtnEl.querySelector('[data-role="pulse-label"]');
    if (pulseLabelEl) {
      pulseLabelEl.textContent = pulseReady
        ? '✦ PHASE PULSE READY! (Shift / ↑)'
        : `✦ Pulse ${pulsePct}% (Shift / ↑)`;
    }

    const isPaused = state.status === 'PAUSED';
    this.pauseBtnEl.setAttribute('aria-pressed', String(isPaused));
    this.pauseBtnEl.textContent = isPaused ? 'Resume (P)' : 'Pause (P)';

    // Live region announcements for accessibility
    if (state.status !== this.lastAnnouncedStatus || state.level !== this.lastAnnouncedLevel) {
      this.lastAnnouncedStatus = state.status;
      this.lastAnnouncedLevel = state.level;
      if (state.status === 'GAME_OVER') {
        this.liveAnnouncerEl.textContent = `Containment Breach! Game Over at Level ${state.level} with score ${state.score}.`;
      } else if (state.status === 'VICTORY') {
        this.liveAnnouncerEl.textContent = `Octa-Core Mastery Achieved! Level ${state.level}, ${state.totalClearedBlocks} shards cleared.`;
      } else if (state.level > 1) {
        this.liveAnnouncerEl.textContent = `Level ${state.level} reached. ${stageInfo.title}.`;
      }
    }

    // Overlay modal state
    this.updateOverlay(state);

    // Debug inspector telemetry
    if (this.debugVisible) {
      const diff = getDifficultyForLevel(state.level);
      const depths = state.stacks.map((s, idx) => `F${idx}:${s.length}`).join(' ');
      this.debugPanelEl.innerHTML = `
        <div><strong>SEED:</strong> ${state.seed}</div>
        <div><strong>RNG:</strong> 0x${state.rngState.toString(16).toUpperCase()}</div>
        <div><strong>SIDES:</strong> ${state.numSides} (RotIdx: ${state.coreRotationIndex})</div>
        <div><strong>WAVE:</strong> ${WAVE_PATTERNS[state.currentWavePattern].label}</div>
        <div><strong>SPEED:</strong> ${diff.speedMultiplier.toFixed(2)}x (Lv${diff.effectiveLevel}/35)</div>
        <div><strong>STACKS:</strong> ${depths}</div>
      `;
    }

    // 2. Smooth visual tweening & FX update
    const stepAngle = (Math.PI * 2) / state.numSides;
    const targetAngle = state.visualRotationSteps * stepAngle;
    const lerpFactor = 1 - Math.exp((-18 * dtMs) / 1000);
    this.visualAngleRad += (targetAngle - this.visualAngleRad) * lerpFactor;

    if (this.screenShakeMs > 0) {
      this.screenShakeMs = Math.max(0, this.screenShakeMs - dtMs);
    }
    if (this.morphBannerTimerMs > 0) {
      this.morphBannerTimerMs = Math.max(0, this.morphBannerTimerMs - dtMs);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.lifeMs -= dtMs;
      if (p.lifeMs <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.x += (p.vx * dtMs) / 1000;
        p.y += (p.vy * dtMs) / 1000;
        p.alpha = Math.max(0, p.lifeMs / p.maxLifeMs);
      }
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.lifeMs -= dtMs;
      if (pop.lifeMs <= 0) {
        this.popups.splice(i, 1);
      } else {
        pop.y += (pop.vy * dtMs) / 1000;
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.lifeMs -= dtMs;
      if (sw.lifeMs <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Draw Canvas
    this.drawBoard(state);
  }

  private updateOverlay(state: OrbitGameState): void {
    if (state.status === 'PLAYING') {
      this.overlayEl.hidden = true;
      return;
    }

    this.overlayEl.hidden = false;
    const titleEl = this.overlayEl.querySelector('[data-role="overlay-title"]')!;
    const descEl = this.overlayEl.querySelector('[data-role="overlay-desc"]')!;
    const actionsEl = this.overlayEl.querySelector('[data-role="overlay-actions"]')!;
    actionsEl.innerHTML = '';

    if (state.status === 'PAUSED') {
      titleEl.textContent = 'ORBIT PAUSED';
      descEl.textContent =
        'Rotate the polygon core so 3+ matching shards connect radially or across adjacent faces.';
      const resumeBtn = document.createElement('button');
      resumeBtn.type = 'button';
      resumeBtn.className = 'os-btn os-btn-primary';
      resumeBtn.textContent = 'Resume Orbit (P)';
      resumeBtn.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'TOGGLE_PAUSE' })
      );
      actionsEl.appendChild(resumeBtn);
    } else if (state.status === 'VICTORY') {
      titleEl.textContent = 'OCTA-CORE MASTERY!';
      descEl.textContent = `You reached Level ${state.level} (8-Sided Octa Core) and cleared ${state.totalClearedBlocks} orbital shards! Score: ${state.score.toLocaleString()}.`;

      const continueBtn = document.createElement('button');
      continueBtn.type = 'button';
      continueBtn.className = 'os-btn os-btn-primary';
      continueBtn.textContent = 'Continue Endless Orbit (To Lv 35)';
      continueBtn.addEventListener('click', () =>
        this.callbacks.onAction({ type: 'CONTINUE_ENDLESS' })
      );

      const newRunBtn = document.createElement('button');
      newRunBtn.type = 'button';
      newRunBtn.className = 'os-btn';
      newRunBtn.textContent = 'New Seeded Run';
      newRunBtn.addEventListener('click', () => this.callbacks.onRestart());

      actionsEl.appendChild(continueBtn);
      actionsEl.appendChild(newRunBtn);
    } else if (state.status === 'GAME_OVER') {
      titleEl.textContent = 'CONTAINMENT BREACH';
      descEl.textContent = `Face ${(state.breachedFace ?? 0) + 1} exceeded the ${CONFIG.MAX_STACK_DEPTH}-shard containment perimeter! Final Score: ${state.score.toLocaleString()} · Level ${state.level} · Max Combo x${state.maxComboReached}.`;

      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'os-btn os-btn-primary';
      retryBtn.textContent = 'Play Again (R)';
      retryBtn.addEventListener('click', () => this.callbacks.onRestart());
      actionsEl.appendChild(retryBtn);
    }
  }

  private drawBoard(state: OrbitGameState): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply screen shake if active
    if (this.screenShakeMs > 0) {
      const mag = (this.screenShakeMs / 200) * this.screenShakeMagnitude;
      ctx.translate(
        (Math.random() - 0.5) * mag * 2,
        (Math.random() - 0.5) * mag * 2
      );
    }

    const numSides = state.numSides;
    const stepAngle = (Math.PI * 2) / numSides;
    const boardRadius = w * 0.45;
    const coreRadius = boardRadius * 0.25;
    const playfieldSpan = boardRadius - coreRadius;
    const containmentRadius =
      coreRadius +
      CONFIG.MAX_STACK_DEPTH * CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan;

    // 1. Draw stationary world orbital lanes & sector dividers
    for (let lane = 0; lane < numSides; lane++) {
      const midAngle = -Math.PI / 2 + lane * stepAngle;
      const a0 = midAngle - stepAngle / 2;
      const a1 = midAngle + stepAngle / 2;

      // Subtle alternating sector background
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a0) * coreRadius, cy + Math.sin(a0) * coreRadius);
      ctx.lineTo(cx + Math.cos(a0) * boardRadius, cy + Math.sin(a0) * boardRadius);
      ctx.lineTo(cx + Math.cos(a1) * boardRadius, cy + Math.sin(a1) * boardRadius);
      ctx.lineTo(cx + Math.cos(a1) * coreRadius, cy + Math.sin(a1) * coreRadius);
      ctx.closePath();
      ctx.fillStyle =
        lane % 2 === 0 ? 'rgba(15, 23, 42, 0.45)' : 'rgba(30, 41, 59, 0.28)';
      ctx.fill();

      // Radial spoke divider
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a0) * coreRadius, cy + Math.sin(a0) * coreRadius);
      ctx.lineTo(cx + Math.cos(a0) * boardRadius, cy + Math.sin(a0) * boardRadius);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }

    // 2. Draw outer crimson containment perimeter polygon
    const anyFaceInDanger = state.stacks.some(
      (s) => s.length >= CONFIG.DANGER_STACK_DEPTH
    );
    ctx.beginPath();
    for (let lane = 0; lane < numSides; lane++) {
      const a0 = -Math.PI / 2 + lane * stepAngle - stepAngle / 2;
      const px = cx + Math.cos(a0) * containmentRadius;
      const py = cy + Math.sin(a0) * containmentRadius;
      if (lane === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = anyFaceInDanger
      ? 'rgba(244, 63, 94, 0.92)'
      : 'rgba(244, 63, 94, 0.48)';
    ctx.lineWidth = anyFaceInDanger ? 3 : 2;
    ctx.setLineDash([7, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw landing ghost indicators for airborne shards
    for (const shard of state.fallingShards) {
      const targetFace = getTargetFaceForLane(
        shard.lane,
        state.coreRotationIndex,
        numSides
      );
      const stackDepth = state.stacks[targetFace]?.length ?? 0;
      const rInner =
        coreRadius + stackDepth * CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan;
      const rOuter =
        rInner + CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan * 0.92;
      const midAngle = -Math.PI / 2 + shard.lane * stepAngle;
      const arch = BLOCK_ARCHETYPES[shard.color] ?? BLOCK_ARCHETYPES[0];

      this.drawTrapezoidShard(
        ctx,
        cx,
        cy,
        midAngle,
        stepAngle * 0.92,
        rInner,
        rOuter,
        arch,
        true
      );
    }

    // 4. Draw rotating polygon core & stacked shards on each face
    for (let face = 0; face < numSides; face++) {
      const faceAngle = -Math.PI / 2 + face * stepAngle + this.visualAngleRad;
      const stack = state.stacks[face] ?? [];

      // Danger lane highlight if face stack >= DANGER_STACK_DEPTH
      if (stack.length >= CONFIG.DANGER_STACK_DEPTH) {
        const a0 = faceAngle - stepAngle / 2;
        const a1 = faceAngle + stepAngle / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a0) * coreRadius, cy + Math.sin(a0) * coreRadius);
        ctx.lineTo(
          cx + Math.cos(a0) * containmentRadius,
          cy + Math.sin(a0) * containmentRadius
        );
        ctx.lineTo(
          cx + Math.cos(a1) * containmentRadius,
          cy + Math.sin(a1) * containmentRadius
        );
        ctx.lineTo(cx + Math.cos(a1) * coreRadius, cy + Math.sin(a1) * coreRadius);
        ctx.closePath();
        ctx.fillStyle = 'rgba(244, 63, 94, 0.16)';
        ctx.fill();
      }

      for (let depth = 0; depth < stack.length; depth++) {
        const block = stack[depth];
        const normDist =
          depth * CONFIG.BLOCK_RADIAL_THICKNESS + block.radialOffset;
        const rInner = coreRadius + normDist * playfieldSpan + 1.5;
        const rOuter =
          rInner + CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan - 3;
        const arch = BLOCK_ARCHETYPES[block.color] ?? BLOCK_ARCHETYPES[0];

        this.drawTrapezoidShard(
          ctx,
          cx,
          cy,
          faceAngle,
          stepAngle * 0.94,
          rInner,
          rOuter,
          arch,
          false
        );
      }
    }

    // 5. Draw airborne falling shards in world orbital lanes
    for (const shard of state.fallingShards) {
      const midAngle = -Math.PI / 2 + shard.lane * stepAngle;
      const rOuter = coreRadius + shard.distance * playfieldSpan;
      const rInner =
        rOuter - CONFIG.BLOCK_RADIAL_THICKNESS * playfieldSpan + 2.5;
      const arch = BLOCK_ARCHETYPES[shard.color] ?? BLOCK_ARCHETYPES[0];

      this.drawTrapezoidShard(
        ctx,
        cx,
        cy,
        midAngle,
        stepAngle * 0.92,
        Math.max(coreRadius, rInner),
        rOuter,
        arch,
        false
      );
    }

    // 6. Draw central rotating polygon core
    const stageInfo = getCoreStageInfo(numSides);
    ctx.beginPath();
    for (let i = 0; i < numSides; i++) {
      const vAngle =
        -Math.PI / 2 + i * stepAngle - stepAngle / 2 + this.visualAngleRad;
      const vx = cx + Math.cos(vAngle) * coreRadius;
      const vy = cy + Math.sin(vAngle) * coreRadius;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = stageInfo.badgeColor;
    ctx.stroke();

    // Orientation notch on Face 0 so player can track polygon rotation visually
    const face0Angle = -Math.PI / 2 + this.visualAngleRad;
    const notchR = coreRadius * 0.72;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(face0Angle) * notchR,
      cy + Math.sin(face0Angle) * notchR,
      4.5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Combo decay ring inside core
    if (state.comboTimerMs > 0) {
      const comboRatio = state.comboTimerMs / CONFIG.COMBO_WINDOW_MS;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        coreRadius * 0.56,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * comboRatio
      );
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Core center telemetry text (Sides + Combo / Level progress)
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(w * 0.042)}px Inter, sans-serif`;
    ctx.fillText(
      state.comboMultiplier > 1 ? `x${state.comboMultiplier}` : `${numSides}-GON`,
      cx,
      cy - w * 0.015
    );

    const nextLvClears = getClearedBlocksForLevel(state.level + 1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `700 ${Math.round(w * 0.022)}px Inter, sans-serif`;
    ctx.fillText(
      `LV ${state.level} · ${state.totalClearedBlocks}/${nextLvClears}`,
      cx,
      cy + w * 0.024
    );

    // 7. Draw shockwaves, particles, and floating score popups
    for (const sw of this.shockwaves) {
      const p = 1 - sw.lifeMs / sw.maxLifeMs;
      const r = sw.radius + (sw.maxRadius - sw.radius) * p;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.lineWidth = 4.5 * (1 - p * 0.6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const pt of this.particles) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pop of this.popups) {
      const alpha = Math.min(1, (pop.lifeMs / pop.maxLifeMs) * 1.4);
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${Math.round(w * 0.032)}px Inter, sans-serif`;
      ctx.fillStyle = '#020617';
      ctx.fillText(pop.text, pop.x + 1.5, pop.y + 1.5);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);

      if (pop.subtext) {
        ctx.font = `700 ${Math.round(w * 0.022)}px Inter, sans-serif`;
        ctx.fillStyle = '#fde68a';
        ctx.fillText(pop.subtext, pop.x, pop.y + w * 0.03);
      }
    }
    ctx.globalAlpha = 1;

    // 8. Polygon Morph Banner Announcement
    if (this.morphBannerTimerMs > 0) {
      const alpha = Math.min(1, this.morphBannerTimerMs / 400);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      const bw = w * 0.72;
      const bh = h * 0.085;
      ctx.fillRect(cx - bw / 2, h * 0.05, bw, bh);
      ctx.strokeStyle = stageInfo.badgeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - bw / 2, h * 0.05, bw, bh);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `800 ${Math.round(w * 0.028)}px Inter, sans-serif`;
      ctx.fillText(this.morphBannerText, cx, h * 0.05 + bh / 2);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private drawTrapezoidShard(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    midAngle: number,
    sectorSpanRad: number,
    rInner: number,
    rOuter: number,
    arch: (typeof BLOCK_ARCHETYPES)[number],
    isGhost: boolean
  ): void {
    const a0 = midAngle - sectorSpanRad / 2;
    const a1 = midAngle + sectorSpanRad / 2;

    const x0 = cx + Math.cos(a0) * rInner;
    const y0 = cy + Math.sin(a0) * rInner;
    const x1 = cx + Math.cos(a0) * rOuter;
    const y1 = cy + Math.sin(a0) * rOuter;
    const x2 = cx + Math.cos(a1) * rOuter;
    const y2 = cy + Math.sin(a1) * rOuter;
    const x3 = cx + Math.cos(a1) * rInner;
    const y3 = cy + Math.sin(a1) * rInner;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    if (isGhost) {
      ctx.fillStyle = arch.fillHex;
      ctx.globalAlpha = 0.16;
      ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = arch.strokeHex;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    ctx.fillStyle = arch.fillHex;
    ctx.fill();
    ctx.strokeStyle = arch.strokeHex;
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // High-contrast colorblind symbol centered inside shard
    const rMid = (rInner + rOuter) / 2;
    const gx = cx + Math.cos(midAngle) * rMid;
    const gy = cy + Math.sin(midAngle) * rMid;
    const glyphSize = Math.max(10, Math.round((rOuter - rInner) * 0.58));

    ctx.font = `900 ${glyphSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = arch.textHex;
    ctx.fillText(arch.symbol, gx, gy);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundResize);
    this.container.innerHTML = '';
  }
}
