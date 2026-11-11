import { ChronoAudioEngine } from './audio';
import { CHRONO_CONFIG } from './config';
import {
  BumperElement,
  ENEMY_ARCHETYPES,
  GOD_FORGE_RELICS,
  SECTORS,
  STRIKER_CHASSIS,
  StrikerChassisId,
} from './content';
import { ChronoCareerStats } from './persistence';
import {
  ChronoGameState,
  ChronoInputAction,
  ChronoSimulationEvent,
  getChassisDef,
  getSectorDef,
} from './simulation';

// Polyfill checks per declarative-dialog-popover-control guidance
if (
  typeof HTMLButtonElement !== 'undefined' &&
  !('commandForElement' in HTMLButtonElement.prototype)
) {
  void import('invokers-polyfill').catch(() => {});
}
if (typeof HTMLElement !== 'undefined' && !('popover' in HTMLElement.prototype)) {
  void import('@oddbird/popover-polyfill').catch(() => {});
}

interface FloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

interface ParticleSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface ChronoUICallbacks {
  onAction: (action: ChronoInputAction) => void;
  onRestart: (newSeed?: number) => void;
  onToggleDebug: () => void;
}

export class ChronoUIController {
  private container: HTMLElement;
  private audio: ChronoAudioEngine;
  private callbacks: ChronoUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;
  private announcerEl!: HTMLElement | null;
  private hudSectorEl!: HTMLElement | null;
  private hudScoreEl!: HTMLElement | null;
  private hudComboEl!: HTMLElement | null;
  private hudHpBarEl!: HTMLElement | null;
  private hudHpTextEl!: HTMLElement | null;
  private hudStaminaBarEl!: HTMLElement | null;
  private hudOverdriveBarEl!: HTMLElement | null;
  private hudRelicsListEl!: HTMLElement | null;
  private draftOverlayEl!: HTMLElement | null;
  private endOverlayEl!: HTMLElement | null;
  private debugPanelEl!: HTMLElement | null;
  private telemetryPopoverBodyEl!: HTMLElement | null;
  private chassisButtons: HTMLButtonElement[] = [];

  private keysDown = new Set<string>();
  private callouts: FloatingCallout[] = [];
  private particles: ParticleSpark[] = [];
  private rings: ShockwaveRing[] = [];
  private screenShake = 0;
  private lastDraftKey = '';
  private lastEndStatus = '';

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    audio: ChronoAudioEngine,
    callbacks: ChronoUICallbacks,
    initialDebug = false
  ) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;
    this.debugVisible = initialDebug;

    this.boundKeyDown = (e) => this.handleKeyDown(e);
    this.boundKeyUp = (e) => this.handleKeyUp(e);

    this.mountDOM();
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  private mountDOM(): void {
    this.container.innerHTML = `
      <style>
        :root, html {
          color-scheme: light dark;
          --cv-bg-light: #f8fafc;
          --cv-bg-dark: #070913;
          --cv-panel-light: rgba(255, 255, 255, 0.92);
          --cv-panel-dark: rgba(15, 20, 38, 0.92);
          --cv-text-light: #0f172a;
          --cv-text-dark: #f8fafc;
          --cv-border-light: rgba(245, 158, 11, 0.45);
          --cv-border-dark: rgba(245, 158, 11, 0.45);
          --cv-bg: var(--cv-bg-dark);
          --cv-panel: var(--cv-panel-dark);
          --cv-text: var(--cv-text-dark);
          --cv-border: var(--cv-border-dark);
          --cv-scroll-thumb: #f59e0b;
          --cv-scroll-track: #0f172a;
          scrollbar-width: thin;
          scrollbar-color: var(--cv-scroll-thumb) var(--cv-scroll-track);
        }
        @media (prefers-color-scheme: light) {
          :root {
            --cv-bg: var(--cv-bg-dark);
            --cv-panel: var(--cv-panel-dark);
            --cv-text: var(--cv-text-dark);
          }
        }
        @supports (color: light-dark(white, black)) {
          :root {
            --cv-scroll-thumb: light-dark(#d97706, #f59e0b);
            --cv-scroll-track: light-dark(#e2e8f0, #0f172a);
          }
        }
        @supports not (scrollbar-color: auto) {
          .cv-shell::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .cv-shell::-webkit-scrollbar-thumb {
            background: var(--cv-scroll-thumb);
          }
          .cv-shell::-webkit-scrollbar-track {
            background: var(--cv-scroll-track);
          }
        }
        .cv-visually-hidden:where(:not(:focus-within, :active)) {
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
        .cv-shell {
          background: radial-gradient(circle at 50% 15%, #161b36 0%, #070913 75%);
          color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          border: 1px solid rgba(245, 158, 11, 0.42);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 20px 55px rgba(0, 0, 0, 0.7);
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
        }
        .cv- shell :where(button, a:any-link):focus-visible,
        .cv-btn:focus-visible {
          outline: 3px solid #f59e0b;
          outline-offset: 3px;
        }
        .cv-topbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          margin-bottom: 12px;
        }
        .cv-brand-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          background: linear-gradient(90deg, #fde047, #f59e0b, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .cv-brand-sub {
          margin: 2px 0 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .cv-chassis-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .cv-btn {
          min-block-size: 30px;
          min-inline-size: 30px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .cv-btn:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: #fde047;
          transform: translateY(-1px);
        }
        .cv-btn[aria-pressed="true"] {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #090d16;
          border-color: #fef08a;
        }
        .cv-hud-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }
        .cv-hud-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 10px;
          padding: 8px 12px;
        }
        .cv-hud-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          display: block;
        }
        .cv-hud-value {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin-top: 2px;
        }
        .cv-meter-track {
          height: 8px;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 5px;
        }
        .cv-meter-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.08s linear;
        }
        .cv-stage-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          background: #05070f;
          border-radius: 12px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          overflow: hidden;
        }
        .cv-canvas {
          width: 100%;
          max-width: 960px;
          height: auto;
          aspect-ratio: 16 / 10;
          display: block;
          cursor: crosshair;
          touch-action: none;
        }
        .cv-overlay {
          position: absolute;
          inset: 0;
          background: rgba(7, 9, 19, 0.88);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 15;
          text-align: center;
        }
        .cv-overlay[hidden] {
          display: none !important;
        }
        .cv-relic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
          width: 100%;
          max-width: 780px;
          margin: 14px 0;
        }
        .cv-relic-card {
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          color: #f8fafc;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .cv-relic-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        .cv-bottom-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          font-size: 0.8rem;
          color: #cbd5e1;
        }
        .cv-relic-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .cv-relic-pill {
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.45);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .cv-popover {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #38bdf8;
          border-radius: 12px;
          padding: 16px;
          max-width: 420px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
        }
        [popover]:is(:popover-open, .\\:popover-open) {
          display: block;
        }
        .cv-dialog {
          background: #0b1120;
          color: #f8fafc;
          border: 1px solid #f59e0b;
          border-radius: 14px;
          padding: 20px;
          max-width: 680px;
          width: 92vw;
          max-height: 82vh;
          overflow-y: auto;
        }
        .cv-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
        }
      </style>

      <div class="cv-shell">
        <div id="cv-live-announcer" class="cv-visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <div class="cv-topbar">
          <div>
            <h2 class="cv-brand-title">⚡ CHRONO-VORTEX: THE GOD-FORGE ARENA</h2>
            <p class="cv-brand-sub">
              Kinetic Pinball-Brawler &amp; Time-Echo Bullet Alchemist · Bank-Shot Enemies off Elemental Bumpers &amp; Weave Temporal Clones!
            </p>
          </div>

          <div class="cv-chassis-bar" role="group" aria-label="Striker Chassis Selection">
            <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">CHASSIS:</span>
            ${STRIKER_CHASSIS.map(
              (c, idx) => `
              <button
                type="button"
                class="cv-btn"
                data-chassis-btn="${c.id}"
                aria-pressed="${idx === 0 ? 'true' : 'false'}"
              >
                ${c.name}
              </button>
            `
            ).join('')}
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button
              type="button"
              class="cv-btn"
              commandfor="chrono-telemetry-popover"
              command="toggle-popover"
            >
              📊 Causal Ledger
            </button>
            <button
              type="button"
              class="cv-btn"
              commandfor="chrono-codex-dialog"
              command="show-modal"
            >
              📖 Relic &amp; Pinball Codex
            </button>
            <button type="button" class="cv-btn" id="cv-btn-mute" aria-pressed="false">
              🔊 Synth: ON
            </button>
            <button type="button" class="cv-btn" id="cv-btn-restart">
              ↻ New Run
            </button>
          </div>
        </div>

        <div class="cv-hud-grid">
          <div class="cv-hud-card">
            <span class="cv-hud-label">Cosmic Crucible Sector</span>
            <div class="cv-hud-value" id="cv-hud-sector">Sector I (0 / 10)</div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Score &amp; Pinball Chain</span>
            <div class="cv-hud-value">
              <span id="cv-hud-score">0</span> ·
              <span id="cv-hud-combo" style="color:#fde047;">1x CHAIN</span>
            </div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Hull Integrity <span id="cv-hud-hp-text">130 / 130</span></span>
            <div class="cv-meter-track">
              <div id="cv-hud-hp-bar" class="cv-meter-fill" style="width:100%; background:linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
          </div>

          <div class="cv-hud-card">
            <span class="cv-hud-label">Kinetic Stamina &amp; Overdrive [F]</span>
            <div class="cv-meter-track" style="margin-bottom:4px;">
              <div id="cv-hud-stamina-bar" class="cv-meter-fill" style="width:100%; background:#38bdf8;"></div>
            </div>
            <div class="cv-meter-track">
              <div id="cv-hud-overdrive-bar" class="cv-meter-fill" style="width:25%; background:linear-gradient(90deg, #f59e0b, #fde047);"></div>
            </div>
          </div>
        </div>

        <div class="cv-stage-container">
          <canvas
            id="cv-arena-canvas"
            class="cv-canvas"
            width="${CHRONO_CONFIG.ARENA_WIDTH}"
            height="${CHRONO_CONFIG.ARENA_HEIGHT}"
            aria-label="Chrono-Vortex God-Forge Crucible Arena"
          ></canvas>

          <div id="cv-draft-overlay" class="cv-overlay" role="dialog" aria-label="God-Forge Relic Draft" hidden></div>
          <div id="cv-end-overlay" class="cv-overlay" role="dialog" aria-label="Run Outcome Summary" hidden></div>
        </div>

        <div class="cv-bottom-bar">
          <div>
            <strong>Controls:</strong>
            <code>WASD / Arrows</code> Drift ·
            <code>Click / Space</code> Kinetic Dash-Slam ·
            <code>Q / Right-Click</code> Alchemy Parry ·
            <code>E</code> Spawn Chrono-Ghost ·
            <code>R</code> Rewind &amp; Fork ·
            <code>F</code> Overdrive
          </div>
          <div class="cv-relic-pills" id="cv-relics-list">
            <span style="color:#94a3b8;">Forged Relics: None yet</span>
          </div>
        </div>

        <pre id="cv-debug-panel" style="margin-top:8px; padding:8px; background:#020617; color:#38bdf8; font-size:0.75rem; border-radius:8px;" hidden></pre>

        <div id="chrono-telemetry-popover" class="cv-popover" popover>
          <h3 style="margin:0 0 8px; color:#38bdf8;">⚡ Honest Causal Combat Ledger</h3>
          <div id="cv-telemetry-body" style="font-size:0.85rem; line-height:1.5;"></div>
        </div>

        <dialog id="chrono-codex-dialog" class="cv-dialog" closedby="any" aria-labelledby="chrono-codex-title">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h2 id="chrono-codex-title" style="margin:0; color:#fde047;">📖 God-Forge Tactical Manual &amp; Relic Codex</h2>
            <button type="button" class="cv-btn" commandfor="chrono-codex-dialog" command="close">
              Close [Esc]
            </button>
          </div>
          <p style="color:#cbd5e1; font-size:0.9rem; line-height:1.5;">
            <strong>How to Play Like a GOAT:</strong> Instead of chipping enemies down slowly, use <strong>Kinetic Dash-Slam [Space / Click]</strong> to launch enemies into the 4 <strong>Elemental Resonance Bumpers</strong>, the <strong>Octagonal Crucible Wall</strong>, or <strong>each other (Domino Collisions)</strong>! Deploy <strong>Chrono-Ghost Echoes [E]</strong> to replay your last 4 seconds of movement in parallel, and use <strong>Pulse Parry [Q / Right-Click]</strong> to transmute enemy bullets into allied homing prism shards.
          </p>
          <h3 style="color:#38bdf8; margin:14px 0 8px;">12 Synergistic God-Forge Relics</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:8px;">
            ${GOD_FORGE_RELICS.map(
              (r) => `
              <div style="padding:8px 10px; border-radius:8px; background:rgba(15,23,42,0.9); border:1px solid ${r.color};">
                <div style="font-weight:800; color:${r.color};">${r.icon} ${r.name} <small>(${r.school})</small></div>
                <div style="font-size:0.78rem; color:#cbd5e1; margin-top:3px;">${r.description}</div>
              </div>
            `
            ).join('')}
          </div>
        </dialog>
      </div>
    `;

    // Light-dismiss dialog fallback per light-dismiss-a-dialog guidance
    const dialog = this.container.querySelector<HTMLDialogElement>('#chrono-codex-dialog');
    if (dialog && typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
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

    this.canvas = this.container.querySelector('#cv-arena-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d') ?? null;
    this.announcerEl = this.container.querySelector('#cv-live-announcer');
    this.hudSectorEl = this.container.querySelector('#cv-hud-sector');
    this.hudScoreEl = this.container.querySelector('#cv-hud-score');
    this.hudComboEl = this.container.querySelector('#cv-hud-combo');
    this.hudHpBarEl = this.container.querySelector('#cv-hud-hp-bar');
    this.hudHpTextEl = this.container.querySelector('#cv-hud-hp-text');
    this.hudStaminaBarEl = this.container.querySelector('#cv-hud-stamina-bar');
    this.hudOverdriveBarEl = this.container.querySelector('#cv-hud-overdrive-bar');
    this.hudRelicsListEl = this.container.querySelector('#cv-relics-list');
    this.draftOverlayEl = this.container.querySelector('#cv-draft-overlay');
    this.endOverlayEl = this.container.querySelector('#cv-end-overlay');
    this.debugPanelEl = this.container.querySelector('#cv-debug-panel');
    this.telemetryPopoverBodyEl = this.container.querySelector('#cv-telemetry-body');

    this.chassisButtons = Array.from(
      this.container.querySelectorAll<HTMLButtonElement>('button[data-chassis-btn]')
    );
    for (const btn of this.chassisButtons) {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-chassis-btn') as StrikerChassisId;
        this.callbacks.onAction({ type: 'SWITCH_CHASSIS', chassisId: id });
      });
    }

    const btnMute = this.container.querySelector<HTMLButtonElement>('#cv-btn-mute');
    btnMute?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      btnMute.setAttribute('aria-pressed', String(muted));
      btnMute.textContent = muted ? '🔇 Synth: OFF' : '🔊 Synth: ON';
    });

    const btnRestart = this.container.querySelector<HTMLButtonElement>('#cv-btn-restart');
    btnRestart?.addEventListener('click', () => {
      this.callbacks.onRestart();
    });

    // Canvas pointer controls
    this.canvas?.addEventListener('pointermove', (e) => {
      const pt = this.toArenaCoords(e);
      this.callbacks.onAction({ type: 'SET_AIM', worldX: pt.x, worldY: pt.y });
    });

    this.canvas?.addEventListener('pointerdown', (e) => {
      const pt = this.toArenaCoords(e);
      if (e.button === 2) {
        this.callbacks.onAction({ type: 'PULSE_PARRY' });
      } else {
        this.callbacks.onAction({
          type: 'DASH_STRIKE',
          targetX: pt.x,
          targetY: pt.y,
        });
      }
    });

    this.canvas?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private toArenaCoords(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CHRONO_CONFIG.ARENA_WIDTH / Math.max(1, rect.width);
    const scaleY = CHRONO_CONFIG.ARENA_HEIGHT / Math.max(1, rect.height);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (
      document.activeElement &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    this.keysDown.add(key);
    this.syncMoveDirection();

    if (key === ' ' || key === 'k') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'DASH_STRIKE' });
    } else if (key === 'q' || key === 'j') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'PULSE_PARRY' });
    } else if (key === 'e') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'SPAWN_ECHO', rewindPlayer: false });
    } else if (key === 'r') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'SPAWN_ECHO', rewindPlayer: true });
    } else if (key === 'f') {
      e.preventDefault();
      this.callbacks.onAction({ type: 'ACTIVATE_OVERDRIVE' });
    } else if (key === 'p') {
      this.callbacks.onAction({ type: 'TOGGLE_PAUSE' });
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.key.toLowerCase());
    this.syncMoveDirection();
  }

  private syncMoveDirection(): void {
    let dx = 0;
    let dy = 0;
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) dy -= 1;
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) dy += 1;
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) dx -= 1;
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) dx += 1;
    this.callbacks.onAction({ type: 'SET_MOVE', dx, dy });
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
    this.callouts = [];
    this.particles = [];
    this.rings = [];
    this.screenShake = 0;
    this.lastDraftKey = '';
    this.lastEndStatus = '';
  }

  public consumeEvents(state: ChronoGameState, events: readonly ChronoSimulationEvent[]): void {
    for (const ev of events) {
      this.audio.playEvent(ev, state.comboCount);
      this.screenShake = Math.min(14, this.screenShake + ev.intensity * 3.5);

      this.callouts.push({
        x: ev.x,
        y: ev.y,
        vy: -42,
        text: ev.text,
        color: ev.color,
        alpha: 1,
        scale: Math.min(1.5, 0.85 + ev.intensity * 0.25),
      });

      this.rings.push({
        x: ev.x,
        y: ev.y,
        radius: 10,
        maxRadius: 45 + ev.intensity * 38,
        color: ev.color,
        alpha: 0.85,
      });

      const sparkCount = Math.min(18, Math.round(6 * ev.intensity));
      for (let i = 0; i < sparkCount; i++) {
        const ang = (i / sparkCount) * Math.PI * 2 + (i % 2) * 0.2;
        const spd = 70 + (i % 5) * 45;
        this.particles.push({
          x: ev.x,
          y: ev.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          radius: 2.5 + (i % 3),
          color: ev.color,
          alpha: 1,
          decay: 1.4 + (i % 3) * 0.4,
        });
      }

      if (
        ev.type === 'SECTOR_CLEARED' ||
        ev.type === 'VICTORY' ||
        ev.type === 'GAME_OVER' ||
        ev.type === 'RELIC_CLAIMED'
      ) {
        if (this.announcerEl) {
          this.announcerEl.textContent = ev.text;
        }
      }
    }
  }

  public render(state: ChronoGameState, career: ChronoCareerStats, dtMs: number): void {
    const dtSec = dtMs / 1000;
    const sectorDef = getSectorDef(state.sector);

    // Update HUD DOM
    if (this.hudSectorEl) {
      this.hudSectorEl.textContent = sectorDef.isBossSector
        ? `Sector V: KRONOS-OMEGA BOSS`
        : `Sector ${state.sector}/5 (${state.sectorKills}/${state.sectorTargetKills} Shattered)`;
    }
    if (this.hudScoreEl) {
      this.hudScoreEl.textContent = state.score.toLocaleString();
    }
    if (this.hudComboEl) {
      this.hudComboEl.textContent = `${state.comboMultiplier}x CHAIN (${state.comboCount})`;
    }
    if (this.hudHpTextEl) {
      this.hudHpTextEl.textContent = `${state.player.hp} / ${state.player.maxHp}`;
    }
    if (this.hudHpBarEl) {
      const pct = Math.max(0, Math.min(100, (state.player.hp / state.player.maxHp) * 100));
      this.hudHpBarEl.style.width = `${pct}%`;
    }
    if (this.hudStaminaBarEl) {
      const pct = Math.max(
        0,
        Math.min(100, (state.player.stamina / state.player.maxStamina) * 100)
      );
      this.hudStaminaBarEl.style.width = `${pct}%`;
    }
    if (this.hudOverdriveBarEl) {
      const pct =
        state.player.overdriveTimerMs > 0
          ? (state.player.overdriveTimerMs / CHRONO_CONFIG.OVERDRIVE_DURATION_MS) * 100
          : state.player.overdriveMeter;
      this.hudOverdriveBarEl.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }

    for (const btn of this.chassisButtons) {
      const id = btn.getAttribute('data-chassis-btn');
      btn.setAttribute('aria-pressed', String(id === state.player.chassisId));
    }

    if (this.hudRelicsListEl) {
      if (state.relicIds.length === 0) {
        this.hudRelicsListEl.innerHTML = `<span style="color:#94a3b8;">Forged Relics: None yet (Clear Sector to Draft!)</span>`;
      } else {
        this.hudRelicsListEl.innerHTML = state.relicIds
          .map((id) => {
            const def = GOD_FORGE_RELICS.find((r) => r.id === id);
            return `<span class="cv-relic-pill" style="border-color:${def?.color ?? '#f59e0b'}">${def?.icon ?? '✨'} ${def?.name ?? id}</span>`;
          })
          .join('');
      }
    }

    if (this.telemetryPopoverBodyEl) {
      this.telemetryPopoverBodyEl.innerHTML = `
        <div><strong>Kinetic Slam &amp; Wall Damage:</strong> ${state.ledger.kineticSlamDamage.toLocaleString()}</div>
        <div><strong>Elemental Bumper Nova Damage:</strong> ${state.ledger.bumperNovaDamage.toLocaleString()}</div>
        <div><strong>Bullet Alchemy Parry Damage:</strong> ${state.ledger.parryAlchemyDamage.toLocaleString()}</div>
        <div><strong>Chrono-Ghost Echo Damage:</strong> ${state.ledger.chronoEchoDamage.toLocaleString()}</div>
        <hr style="border-color:rgba(148,163,184,0.2); margin:6px 0;" />
        <div><strong>Bank-Shots:</strong> ${state.ledger.totalBankShots} · <strong>Wall Slams:</strong> ${state.ledger.totalWallSlams}</div>
        <div><strong>Parries:</strong> ${state.ledger.totalParries} · <strong>Echoes Spawned:</strong> ${state.ledger.totalEchoesSpawned}</div>
        <div><strong>Last Damage Source:</strong> ${state.ledger.lastDamageBy}</div>
        <div><strong>Career High Score:</strong> ${career.highScore.toLocaleString()} (${career.totalVictories} Crowns)</div>
      `;
    }

    this.syncOverlays(state, career);

    if (this.debugPanelEl) {
      this.debugPanelEl.hidden = !this.debugVisible;
      if (this.debugVisible) {
        this.debugPanelEl.textContent = JSON.stringify(
          {
            seed: state.seed,
            status: state.status,
            sector: state.sector,
            kills: `${state.sectorKills}/${state.sectorTargetKills}`,
            player: {
              chassis: state.player.chassisId,
              x: Math.round(state.player.x),
              y: Math.round(state.player.y),
              hp: state.player.hp,
              overdrive: Math.round(state.player.overdriveMeter),
            },
            enemies: state.enemies.length,
            ghosts: state.ghosts.length,
            projectiles: state.projectiles.length,
          },
          null,
          2
        );
      }
    }

    this.renderCanvas(state, dtSec);
  }

  private syncOverlays(state: ChronoGameState, career: ChronoCareerStats): void {
    // 1. Relic Draft Overlay
    if (this.draftOverlayEl) {
      if (state.status === 'RELIC_DRAFT') {
        this.draftOverlayEl.hidden = false;
        const draftKey = `${state.sector}:${state.draftOptions.join(',')}`;
        if (this.lastDraftKey !== draftKey) {
          this.lastDraftKey = draftKey;
          const cardsHtml = state.draftOptions
            .map((id, idx) => {
              const r = GOD_FORGE_RELICS.find((item) => item.id === id) ?? GOD_FORGE_RELICS[0];
              return `
                <button type="button" class="cv-relic-card" data-pick-relic="${r.id}" style="border-color:${r.color};">
                  <div style="font-size:0.72rem; text-transform:uppercase; color:${r.color}; font-weight:800;">
                    [${idx + 1}] ${r.school} · ${r.rarity}
                  </div>
                  <div style="font-size:1.1rem; font-weight:800; margin:4px 0;">
                    ${r.icon} ${r.name}
                  </div>
                  <div style="font-size:0.82rem; color:#cbd5e1; line-height:1.4;">
                    ${r.description}
                  </div>
                </button>
              `;
            })
            .join('');

          this.draftOverlayEl.innerHTML = `
            <h3 style="margin:0; font-size:1.5rem; color:#fde047;">
              🏆 SECTOR ${state.sector} CONQUERED — THE GOD-FORGE ANVIL AWAITS
            </h3>
            <p style="margin:6px 0 0; color:#cbd5e1; font-size:0.9rem;">
              Bind 1 of 3 Cosmic Relics to your Striker, or Sacrifice the draft at the Anvil for raw Titan stats:
            </p>
            <div class="cv-relic-grid">${cardsHtml}</div>
            <button type="button" class="cv-btn" id="cv-btn-sacrifice-relic" style="border-color:#f97316; background:rgba(249,115,22,0.2);">
              🔨 Anvil Smelt Sacrifice (+25 Max HP, +40 Heal &amp; +15% Base Damage)
            </button>
          `;

          for (const card of this.draftOverlayEl.querySelectorAll<HTMLButtonElement>(
            'button[data-pick-relic]'
          )) {
            card.addEventListener('click', () => {
              const relicId = card.getAttribute('data-pick-relic') ?? '';
              this.callbacks.onAction({ type: 'SELECT_RELIC', relicId });
            });
          }

          this.draftOverlayEl
            .querySelector<HTMLButtonElement>('#cv-btn-sacrifice-relic')
            ?.addEventListener('click', () => {
              this.callbacks.onAction({ type: 'SACRIFICE_RELIC_FOR_UPGRADE' });
            });
        }
      } else {
        this.draftOverlayEl.hidden = true;
        this.lastDraftKey = '';
      }
    }

    // 2. Victory / Game Over Overlay
    if (this.endOverlayEl) {
      if (state.status === 'VICTORY' || state.status === 'GAME_OVER') {
        this.endOverlayEl.hidden = false;
        const endKey = `${state.status}:${state.score}:${state.totalKills}`;
        if (this.lastEndStatus !== endKey) {
          this.lastEndStatus = endKey;
          const isWin = state.status === 'VICTORY';
          this.endOverlayEl.innerHTML = `
            <h3 style="margin:0; font-size:1.75rem; color:${isWin ? '#fde047' : '#f43f5e'};">
              ${isWin ? '👑 GOD-FORGE SOVEREIGN! KRONOS-OMEGA SHATTERED!' : '💀 TEMPORAL CORE SHATTERED'}
            </h3>
            <p style="margin:6px 0 12px; color:#cbd5e1; max-width:560px;">
              ${
                isWin
                  ? 'You mastered the octagonal pinball crucible, wove temporal echoes across 5 sectors, and conquered Eternity!'
                  : `Final blow dealt by: ${state.ledger.lastDamageBy}. Tip: Trigger Pulse Parry [Q] on incoming volleys and bank enemies into Elemental Bumpers!`
              }
            </p>
            <div style="display:grid; grid-template-columns:repeat(2, minmax(180px, 1fr)); gap:8px; background:rgba(15,23,42,0.9); padding:14px; border-radius:12px; border:1px solid rgba(148,163,184,0.25); text-align:left; font-size:0.85rem; margin-bottom:14px;">
              <div><strong>Final Score:</strong> ${state.score.toLocaleString()}</div>
              <div><strong>Best Pinball Chain:</strong> ${state.bestComboChain} (${state.comboMultiplier}x)</div>
              <div><strong>Kinetic Slam Damage:</strong> ${state.ledger.kineticSlamDamage.toLocaleString()}</div>
              <div><strong>Bumper Nova Damage:</strong> ${state.ledger.bumperNovaDamage.toLocaleString()}</div>
              <div><strong>Parry Alchemy Damage:</strong> ${state.ledger.parryAlchemyDamage.toLocaleString()}</div>
              <div><strong>Chrono-Echo Damage:</strong> ${state.ledger.chronoEchoDamage.toLocaleString()}</div>
              <div><strong>Bank-Shots / Wall Slams:</strong> ${state.ledger.totalBankShots} / ${state.ledger.totalWallSlams}</div>
              <div><strong>Career High Score:</strong> ${career.highScore.toLocaleString()}</div>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="button" class="cv-btn" id="cv-btn-replay-same-seed" style="border-color:#38bdf8;">
                ↺ Replay Exact Seed (${state.seed})
              </button>
              <button type="button" class="cv-btn" id="cv-btn-new-seed" style="background:#f59e0b; color:#090d16;">
                ▶ Launch New Crucible Run
              </button>
            </div>
          `;

          this.endOverlayEl
            .querySelector<HTMLButtonElement>('#cv-btn-replay-same-seed')
            ?.addEventListener('click', () => {
              this.callbacks.onRestart(state.seed);
            });
          this.endOverlayEl
            .querySelector<HTMLButtonElement>('#cv-btn-new-seed')
            ?.addEventListener('click', () => {
              this.callbacks.onRestart();
            });
        }
      } else {
        this.endOverlayEl.hidden = true;
        this.lastEndStatus = '';
      }
    }
  }

  private renderCanvas(state: ChronoGameState, dtSec: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const sectorDef = getSectorDef(state.sector);
    const chassis = getChassisDef(state.player.chassisId);

    this.screenShake = Math.max(0, this.screenShake - 28 * dtSec);
    const shakeX = this.screenShake > 0 ? Math.sin(state.elapsedMs * 0.09) * this.screenShake : 0;
    const shakeY = this.screenShake > 0 ? Math.cos(state.elapsedMs * 0.11) * this.screenShake : 0;

    ctx.save();
    ctx.clearRect(0, 0, CHRONO_CONFIG.ARENA_WIDTH, CHRONO_CONFIG.ARENA_HEIGHT);
    ctx.translate(shakeX, shakeY);

    // 1. Deep Space God-Forge Background
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, CHRONO_CONFIG.ARENA_WIDTH, CHRONO_CONFIG.ARENA_HEIGHT);

    // 2. Crucible Arena Circle & Sacred Octagonal Rim
    const cx = CHRONO_CONFIG.ARENA_CENTER_X;
    const cy = CHRONO_CONFIG.ARENA_CENTER_Y;
    const r = CHRONO_CONFIG.ARENA_RADIUS;

    const bgGrad = ctx.createRadialGradient(cx, cy, 18, cx, cy, r);
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.72)');
    bgGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.92)');
    bgGrad.addColorStop(1, 'rgba(7, 10, 25, 0.98)');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Rotating sacred geometry inner rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.elapsedMs * 0.00025);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.13)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 40, Math.sin(ang) * 40);
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      ctx.stroke();
    }
    ctx.restore();

    // Outer Elastic Crucible Rim
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = sectorDef.themeColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Chrono-Tape History Ribbon (shows where your Ghost Echo will spawn!)
    if (state.echoHistory.length > 2) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < state.echoHistory.length; i++) {
        const pt = state.echoHistory[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Chrono Anchor marker at the start of the tape
      const startPt = state.echoHistory[0];
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Elemental Resonance Bumpers
    const bumperColors: Record<BumperElement, string> = {
      SOLAR: '#f59e0b',
      CRYO: '#06b6d4',
      ARC: '#2dd4bf',
      VOID: '#a855f7',
    };

    for (const bumper of state.bumpers) {
      const col = bumperColors[bumper.element];
      const pulseScale = bumper.pulseTimerMs > 0 ? 1 + (bumper.pulseTimerMs / 340) * 0.26 : 1;
      const drawR = bumper.radius * pulseScale;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, drawR + 6, 0, Math.PI * 2);
      ctx.fillStyle = `${col}22`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, drawR, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = col;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bumper.element, bumper.x, bumper.y);
      ctx.restore();
    }

    // 5. Active Chrono-Ghost Echo Clones
    for (const ghost of state.ghosts) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, CHRONO_CONFIG.PLAYER_BASE_RADIUS + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, CHRONO_CONFIG.PLAYER_BASE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.65)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ECHO', ghost.x, ghost.y - 24);
      ctx.restore();
    }

    // 6. Enemies
    let activeBoss = null;
    for (const enemy of state.enemies) {
      if (enemy.type === 'kronos-omega') {
        activeBoss = enemy;
      }
      const arch = ENEMY_ARCHETYPES[enemy.type];
      ctx.save();

      // Burn / Chill aura rings
      if (enemy.burnTimerMs > 0) {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (enemy.chillTimerMs > 0) {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Chrono-Warden Frontal Shield Arc
      if (enemy.type === 'chrono-warden') {
        ctx.beginPath();
        ctx.arc(
          enemy.x,
          enemy.y,
          enemy.radius + 7,
          enemy.facingAngle - 0.85,
          enemy.facingAngle + 0.85
        );
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = enemy.flashTimerMs > 0 ? '#ffffff' : arch.color;
      ctx.fill();
      ctx.lineWidth = enemy.knockbackTimerMs > 0 ? 3.5 : 2;
      ctx.strokeStyle = enemy.knockbackTimerMs > 0 ? '#fde047' : arch.outlineColor;
      ctx.stroke();

      // Enemy Mini HP bar
      if (enemy.hp < enemy.maxHp && enemy.type !== 'kronos-omega') {
        const bw = enemy.radius * 2;
        const bx = enemy.x - enemy.radius;
        const by = enemy.y - enemy.radius - 9;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(bx, by, bw, 4);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(bx, by, bw * Math.max(0, enemy.hp / enemy.maxHp), 4);
      }

      ctx.restore();
    }

    // 7. Projectiles
    for (const proj of state.projectiles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fillStyle = proj.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }

    // 8. Player Striker & Parry / Overdrive Auras
    const { player } = state;
    ctx.save();

    if (player.overdriveTimerMs > 0) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (player.parryTimerMs > 0) {
      const parryR = CHRONO_CONFIG.PARRY_RADIUS * chassis.parryRadiusMultiplier;
      ctx.beginPath();
      ctx.arc(player.x, player.y, parryR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Aim vector line
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(
      player.x + Math.cos(player.aimAngle) * (player.radius + 18),
      player.y + Math.sin(player.aimAngle) * (player.radius + 18)
    );
    ctx.strokeStyle = chassis.secondaryColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Striker Core Body
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.dashTimerMs > 0 ? '#fde047' : chassis.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();

    // 9. Shockwave Rings & Particle Sparks
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.radius += (ring.maxRadius - ring.radius) * Math.min(1, 9 * dtSec);
      ring.alpha -= 1.8 * dtSec;
      if (ring.alpha <= 0.02) {
        this.rings.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = Math.max(0, ring.alpha);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.alpha -= p.decay * dtSec;
      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 10. Floating Combat Callouts
    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.y += c.vy * dtSec;
      c.alpha -= 0.95 * dtSec;
      if (c.alpha <= 0.02) {
        this.callouts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.font = `800 ${Math.round(13 * c.scale)}px Inter, sans-serif`;
      ctx.fillStyle = c.color;
      ctx.textAlign = 'center';
      ctx.fillText(c.text, c.x, c.y);
      ctx.restore();
    }

    // 11. Kronos-Omega Top Boss Bar
    if (activeBoss) {
      const barW = 440;
      const barH = 14;
      const bx = cx - barW / 2;
      const by = 18;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = activeBoss.bossPhase === 3 ? '#fde047' : '#f43f5e';
      ctx.fillRect(bx, by, barW * Math.max(0, activeBoss.hp / activeBoss.maxHp), barH);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, barW, barH);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `KRONOS-OMEGA (PHASE ${activeBoss.bossPhase}/3) — ${activeBoss.hp} / ${activeBoss.maxHp} HP`,
        cx,
        by + 11
      );
    }

    // 12. Sector Title Banner at bottom of canvas
    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${sectorDef.name} — ${sectorDef.subtitle}`, 18, CHRONO_CONFIG.ARENA_HEIGHT - 16);

    ctx.restore();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.container.innerHTML = '';
  }
}
