import { VoltLashAudioEngine } from './audio';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  EnemyEntity,
  hasUpgrade,
  InputSnapshot,
  isRedlined,
  SimEvent,
  UPGRADE_CATALOG,
  UpgradeId,
  VoltLashState,
} from './simulation';

interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  lifeMs: number;
  maxLifeMs: number;
  color: string;
}

interface ShockRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  lifeMs: number;
  maxLifeMs: number;
  color: string;
  lineWidth: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  lifeMs: number;
  maxLifeMs: number;
  // Spring physics for juicy scale pop
  scale: number;
  targetScale: number;
  scaleVel: number;
}

export interface VoltLashUICallbacks {
  onRestart: (newSeed?: number) => void;
  onSelectUpgrade: (index: number) => void;
  onBankOrOverdrive: () => void;
  onDashTrigger: () => void;
}

export class VoltLashUIController {
  private container: HTMLElement;
  private audio: VoltLashAudioEngine;
  private callbacks: VoltLashUICallbacks;
  private debugVisible: boolean;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private announcerEl!: HTMLElement;

  // Minimal HUD elements
  private hpFillEl!: HTMLElement;
  private hpTextEl!: HTMLElement;
  private surgeFillEl!: HTMLElement;
  private surgeLabelEl!: HTMLElement;
  private comboBadgeEl!: HTMLElement;
  private waveTextEl!: HTMLElement;
  private scoreTextEl!: HTMLElement;
  private muteBtnEl!: HTMLButtonElement;
  private bankBtnEl!: HTMLButtonElement;

  // Overlays
  private draftOverlayEl!: HTMLElement;
  private draftCardsContainerEl!: HTMLElement;
  private endOverlayEl!: HTMLElement;
  private endCardEl!: HTMLElement;
  private debugPanelEl!: HTMLElement;

  // Input state
  private keysDown = new Set<string>();
  private aimX = ARENA_WIDTH * 0.5;
  private aimY = ARENA_HEIGHT * 0.3;
  private pendingDash = false;
  private pendingBank = false;
  private pendingDraftIndex: number | undefined = undefined;

  // Juice state (Particles, Rings, Spring Popups, Directional Camera Shake)
  private particles: VisualParticle[] = [];
  private rings: ShockRing[] = [];
  private popups: FloatingPopup[] = [];
  private shakeX = 0;
  private shakeY = 0;
  private shakeVelX = 0;
  private shakeVelY = 0;
  private screenFlashAlpha = 0;
  private screenFlashColor = '#38bdf8';

  private lastRenderedStatus = '';
  private lastDraftSignature = '';

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    audio: VoltLashAudioEngine,
    callbacks: VoltLashUICallbacks,
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
        .vl-root {
          --vl-bg: #040711;
          --vl-panel: rgba(9, 14, 28, 0.88);
          --vl-border: rgba(56, 189, 248, 0.28);
          --vl-cyan: #38bdf8;
          --vl-emerald: #34d399;
          --vl-amber: #fbbf24;
          --vl-crimson: #f43f5e;
          --vl-text: #f8fafc;
          --vl-muted: #94a3b8;
          display: flex;
          flex-direction: column;
          inline-size: 100%;
          block-size: 100%;
          min-block-size: 86dvh;
          background: var(--vl-bg);
          color: var(--vl-text);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          user-select: none;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid var(--vl-border);
          box-shadow: 0 0 40px rgba(2, 6, 23, 0.9);
        }

        .vl-root .visually-hidden:where(:not(:focus-within, :active)) {
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

        .vl-hud {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-block: 8px;
          padding-inline: 14px;
          background: rgba(6, 10, 22, 0.94);
          border-block-end: 1px solid rgba(56, 189, 248, 0.24);
          z-index: 10;
          flex-wrap: wrap;
        }

        .vl-hud-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vl-meter {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-inline-size: 145px;
        }

        .vl-meter-Surge {
          min-inline-size: 230px;
        }

        .vl-meter-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .vl-bar-track {
          inline-size: 100%;
          block-size: 10px;
          background: rgba(15, 23, 42, 0.95);
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          overflow: hidden;
          position: relative;
        }

        .vl-bar-fill {
          block-size: 100%;
          border-radius: 999px;
          transition: inline-size 80ms linear, background-color 140ms ease;
        }

        .vl-combo-pill {
          padding-block: 4px;
          padding-inline: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          background: rgba(56, 189, 248, 0.14);
          border: 1px solid var(--vl-cyan);
          color: var(--vl-cyan);
          white-space: nowrap;
        }

        .vl-stat-pill {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--vl-text);
          padding-block: 4px;
          padding-inline: 8px;
          border-radius: 6px;
          background: rgba(30, 41, 59, 0.65);
        }

        .vl-btn {
          appearance: none;
          background: rgba(15, 23, 42, 0.9);
          color: var(--vl-text);
          border: 1px solid rgba(56, 189, 248, 0.45);
          border-radius: 7px;
          padding-block: 5px;
          padding-inline: 10px;
          min-block-size: 28px;
          min-inline-size: 28px;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 90ms ease, background-color 120ms ease;
        }

        .vl-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.22);
          transform: translateY(-1px);
        }

        .vl-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .vl-btn:focus-visible {
          outline: 3px solid var(--vl-amber);
          outline-offset: 2px;
        }

        .vl-arena-wrap {
          position: relative;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 50%, #091326 0%, #03060c 100%);
          overflow: hidden;
          min-block-size: 560px;
        }

        .vl-canvas {
          inline-size: 100%;
          block-size: 100%;
          max-inline-size: 1200px;
          max-block-size: 720px;
          aspect-ratio: 1200 / 720;
          display: block;
          cursor: crosshair;
          touch-action: none;
        }

        .vl-overlay {
          position: absolute;
          inset: 0;
          background: rgba(3, 7, 18, 0.82);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 25;
        }

        .vl-overlay[hidden] {
          display: none !important;
        }

        .vl-draft-header {
          text-align: center;
          margin-block-end: 18px;
        }

        .vl-draft-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #fde047;
          margin: 0 0 6px 0;
          text-transform: uppercase;
        }

        .vl-draft-sub {
          font-size: 0.9rem;
          color: var(--vl-muted);
          margin: 0;
        }

        .vl-draft-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          inline-size: 100%;
          max-inline-size: 880px;
        }

        .vl-draft-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: start;
          padding: 18px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.95);
          border: 2px solid var(--card-color, #38bdf8);
          box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
          color: var(--vl-text);
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .vl-draft-card:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 0 28px var(--card-color, #38bdf8);
        }

        .vl-draft-card:focus-visible {
          outline: 3px solid #fde047;
          outline-offset: 3px;
        }

        .vl-end-card {
          max-inline-size: 560px;
          inline-size: 100%;
          background: rgba(10, 16, 32, 0.96);
          border: 2px solid var(--vl-cyan);
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 0 45px rgba(0, 0, 0, 0.85);
        }

        .vl-debug {
          position: absolute;
          inset-block-start: 56px;
          inset-inline-end: 12px;
          background: rgba(2, 6, 23, 0.92);
          border: 1px solid #38bdf8;
          border-radius: 8px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 0.74rem;
          color: #bae6fd;
          z-index: 20;
          pointer-events: none;
        }
      </style>

      <div class="vl-root">
        <div id="vl-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>

        <header class="vl-hud" aria-label="Volt-Lash Telemetry HUD">
          <div class="vl-hud-group">
            <div class="vl-meter">
              <div class="vl-meter-label">
                <span>HULL INTEGRITY</span>
                <span id="vl-hp-text">100 / 100</span>
              </div>
              <div class="vl-bar-track">
                <div id="vl-hp-fill" class="vl-bar-fill" style="inline-size: 100%; background: #34d399;"></div>
              </div>
            </div>

            <div class="vl-meter vl-meter-Surge">
              <div class="vl-meter-label">
                <span>VOLT-SURGE [RISK / REWARD]</span>
                <span id="vl-surge-label" style="color: #38bdf8;">0% // SAFE</span>
              </div>
              <div class="vl-bar-track">
                <div id="vl-surge-fill" class="vl-bar-fill" style="inline-size: 0%; background: #38bdf8;"></div>
              </div>
            </div>

            <button type="button" id="vl-bank-btn" class="vl-btn" disabled>
              [E] Bank Surge (+30 HP)
            </button>
          </div>

          <div class="vl-hud-group">
            <div id="vl-combo-badge" class="vl-combo-pill">0 COMBO · x1.0</div>
            <div id="vl-wave-text" class="vl-stat-pill">WAVE 1 / 5</div>
            <div id="vl-score-text" class="vl-stat-pill">SCORE 0</div>
            <button type="button" id="vl-mute-btn" class="vl-btn" aria-pressed="false">
              🔊 Audio [M]
            </button>
            <button type="button" id="vl-restart-btn" class="vl-btn">
              ↻ Restart [R]
            </button>
          </div>
        </header>

        <div class="vl-arena-wrap">
          <canvas
            id="vl-canvas"
            class="vl-canvas"
            width="${ARENA_WIDTH}"
            height="${ARENA_HEIGHT}"
            aria-label="Aegis: Volt-Lash Interactive Combat Arena"
          ></canvas>

          <div id="vl-debug-panel" class="vl-debug" hidden></div>

          <!-- 3-Card Transformative Upgrade Draft Overlay -->
          <div
            id="vl-draft-overlay"
            class="vl-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-draft-heading"
            hidden
          >
            <div class="vl-draft-header">
              <h2 id="vl-draft-heading" class="vl-draft-title">⚡ Transformative Reactor Draft</h2>
              <p class="vl-draft-sub">Choose 1 geometry-altering module — Press [1], [2], or [3] or Click</p>
            </div>
            <div id="vl-draft-cards" class="vl-draft-grid"></div>
          </div>

          <!-- Instant One-More-Run End Overlay -->
          <div
            id="vl-end-overlay"
            class="vl-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vl-end-heading"
            hidden
          >
            <div id="vl-end-card" class="vl-end-card"></div>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#vl-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.announcerEl = this.container.querySelector('#vl-announcer') as HTMLElement;

    this.hpFillEl = this.container.querySelector('#vl-hp-fill') as HTMLElement;
    this.hpTextEl = this.container.querySelector('#vl-hp-text') as HTMLElement;
    this.surgeFillEl = this.container.querySelector('#vl-surge-fill') as HTMLElement;
    this.surgeLabelEl = this.container.querySelector('#vl-surge-label') as HTMLElement;
    this.comboBadgeEl = this.container.querySelector('#vl-combo-badge') as HTMLElement;
    this.waveTextEl = this.container.querySelector('#vl-wave-text') as HTMLElement;
    this.scoreTextEl = this.container.querySelector('#vl-score-text') as HTMLElement;
    this.muteBtnEl = this.container.querySelector('#vl-mute-btn') as HTMLButtonElement;
    this.bankBtnEl = this.container.querySelector('#vl-bank-btn') as HTMLButtonElement;

    this.draftOverlayEl = this.container.querySelector('#vl-draft-overlay') as HTMLElement;
    this.draftCardsContainerEl = this.container.querySelector('#vl-draft-cards') as HTMLElement;
    this.endOverlayEl = this.container.querySelector('#vl-end-overlay') as HTMLElement;
    this.endCardEl = this.container.querySelector('#vl-end-card') as HTMLElement;
    this.debugPanelEl = this.container.querySelector('#vl-debug-panel') as HTMLElement;

    this.muteBtnEl.addEventListener('click', () => this.toggleMute());
    this.bankBtnEl.addEventListener('click', () => {
      this.pendingBank = true;
      this.callbacks.onBankOrOverdrive();
    });

    const restartBtn = this.container.querySelector('#vl-restart-btn') as HTMLButtonElement;
    restartBtn.addEventListener('click', () => this.callbacks.onRestart());

    // Pointer aim & click controls on canvas
    this.canvas.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.aimX = ((e.clientX - rect.left) / rect.width) * ARENA_WIDTH;
        this.aimY = ((e.clientY - rect.top) / rect.height) * ARENA_HEIGHT;
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.aimX = ((e.clientX - rect.left) / rect.width) * ARENA_WIDTH;
        this.aimY = ((e.clientY - rect.top) / rect.height) * ARENA_HEIGHT;
      }
      if (e.button === 2) {
        e.preventDefault();
        this.pendingBank = true;
        this.callbacks.onBankOrOverdrive();
      } else {
        this.pendingDash = true;
        this.callbacks.onDashTrigger();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private toggleMute(): void {
    const muted = this.audio.toggleMute();
    this.muteBtnEl.setAttribute('aria-pressed', String(muted));
    this.muteBtnEl.textContent = muted ? '🔇 Muted [M]' : '🔊 Audio [M]';
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const code = e.code;
    this.keysDown.add(code);

    if (code === 'KeyM') {
      this.toggleMute();
      return;
    }

    if (code === 'KeyR') {
      e.preventDefault();
      this.callbacks.onRestart();
      return;
    }

    if (this.lastRenderedStatus === 'DRAFT_UPGRADE') {
      if (code === 'Digit1' || code === 'Numpad1') {
        e.preventDefault();
        this.callbacks.onSelectUpgrade(0);
      } else if (code === 'Digit2' || code === 'Numpad2') {
        e.preventDefault();
        this.callbacks.onSelectUpgrade(1);
      } else if (code === 'Digit3' || code === 'Numpad3') {
        e.preventDefault();
        this.callbacks.onSelectUpgrade(2);
      }
      return;
    }

    if (this.lastRenderedStatus === 'VICTORY' || this.lastRenderedStatus === 'DEFEAT') {
      if (code === 'Space' || code === 'Enter') {
        e.preventDefault();
        this.callbacks.onRestart();
      }
      return;
    }

    if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      e.preventDefault();
      this.pendingDash = true;
      this.callbacks.onDashTrigger();
    } else if (code === 'KeyE' || code === 'KeyF') {
      e.preventDefault();
      this.pendingBank = true;
      this.callbacks.onBankOrOverdrive();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);
  }

  public sampleInput(): InputSnapshot {
    let moveX = 0;
    let moveY = 0;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) moveX -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) moveX += 1;
    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) moveY -= 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) moveY += 1;

    const snapshot: InputSnapshot = {
      moveX,
      moveY,
      aimX: this.aimX,
      aimY: this.aimY,
      dashPressed: this.pendingDash,
      bankPressed: this.pendingBank,
      draftIndex: this.pendingDraftIndex,
    };

    this.pendingDash = false;
    this.pendingBank = false;
    this.pendingDraftIndex = undefined;
    return snapshot;
  }

  private addCameraShake(dirX: number, dirY: number, intensity: number): void {
    this.shakeVelX += dirX * intensity;
    this.shakeVelY += dirY * intensity;
  }

  private spawnParticles(
    x: number,
    y: number,
    count: number,
    color: string,
    baseDirX = 0,
    baseDirY = 0,
    speedScale = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.9;
      const baseAngle =
        baseDirX !== 0 || baseDirY !== 0
          ? Math.atan2(baseDirY, baseDirX) + spread
          : Math.random() * Math.PI * 2;
      const spd = (0.12 + Math.random() * 0.36) * speedScale;
      const life = 220 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(baseAngle) * spd,
        vy: Math.sin(baseAngle) * spd,
        size: 2.5 + Math.random() * 3.5,
        lifeMs: life,
        maxLifeMs: life,
        color,
      });
    }
  }

  private spawnPopup(
    x: number,
    y: number,
    text: string,
    color: string,
    initialScale = 1.65
  ): void {
    this.popups.push({
      x,
      y,
      vy: -0.09,
      text,
      color,
      lifeMs: 850,
      maxLifeMs: 850,
      scale: initialScale,
      targetScale: 1.0,
      scaleVel: 0,
    });
  }

  public consumeEvents(state: VoltLashState, events: readonly SimEvent[]): void {
    for (const ev of events) {
      const dx = ev.dirX ?? (Math.random() - 0.5);
      const dy = ev.dirY ?? (Math.random() - 0.5);

      switch (ev.type) {
        case 'DASH':
          this.audio.playDash();
          this.addCameraShake(dx, dy, 4.5);
          this.spawnParticles(ev.x, ev.y, 12, '#22d3ee', -dx, -dy, 1.1);
          break;

        case 'PARRY':
          this.audio.playParry(ev.combo ?? state.combo);
          this.addCameraShake(dx, dy, 8.5);
          this.screenFlashAlpha = 0.22;
          this.screenFlashColor = '#38bdf8';
          this.rings.push({
            x: ev.x,
            y: ev.y,
            radius: 10,
            maxRadius: 78,
            lifeMs: 240,
            maxLifeMs: 240,
            color: '#38bdf8',
            lineWidth: 3.5,
          });
          this.spawnParticles(ev.x, ev.y, 18, '#38bdf8', dx, dy, 1.4);
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 12, ev.label, '#38bdf8', 1.85);
          }
          break;

        case 'GRAZE':
          this.audio.playGraze(ev.combo ?? state.combo);
          this.spawnParticles(ev.x, ev.y, 6, '#34d399', 0, -1, 0.8);
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 10, ev.label, '#34d399', 1.4);
          }
          break;

        case 'HIT_ENEMY':
          this.audio.playHit(state.combo);
          this.spawnParticles(ev.x, ev.y, 7, ev.color ?? '#fb7185', dx, dy, 0.9);
          if (ev.amount) {
            this.spawnPopup(ev.x, ev.y - 10, `${ev.amount}`, '#f8fafc', 1.35);
          }
          break;

        case 'KILL_ENEMY':
          this.audio.playKill(ev.combo ?? state.combo);
          this.addCameraShake(dx, dy, 10.5);
          this.rings.push({
            x: ev.x,
            y: ev.y,
            radius: 12,
            maxRadius: 96,
            lifeMs: 280,
            maxLifeMs: 280,
            color: ev.color ?? '#fb7185',
            lineWidth: 4,
          });
          this.spawnParticles(ev.x, ev.y, 24, ev.color ?? '#fb7185', dx, dy, 1.5);
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 14, ev.label, '#fde047', 1.9);
          }
          break;

        case 'PLAYER_HURT':
          this.audio.playPlayerHurt();
          this.addCameraShake(dx, dy, 14);
          this.screenFlashAlpha = 0.38;
          this.screenFlashColor = '#ef4444';
          this.spawnParticles(ev.x, ev.y, 22, '#ef4444', dx, dy, 1.4);
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 18, ev.label, '#ef4444', 2.0);
          }
          break;

        case 'BANK_HEAL':
          this.audio.playBankOrOverdrive(false);
          this.addCameraShake(0, -1, 7);
          this.screenFlashAlpha = 0.25;
          this.screenFlashColor = '#34d399';
          this.rings.push({
            x: ev.x,
            y: ev.y,
            radius: 16,
            maxRadius: 230,
            lifeMs: 360,
            maxLifeMs: 360,
            color: '#34d399',
            lineWidth: 4,
          });
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 20, ev.label, '#34d399', 1.95);
          }
          break;

        case 'SUPERNOVA_OVERDRIVE':
          this.audio.playBankOrOverdrive(true);
          this.addCameraShake(0, 1, 15);
          this.screenFlashAlpha = 0.42;
          this.screenFlashColor = '#fde047';
          this.rings.push({
            x: ev.x,
            y: ev.y,
            radius: 20,
            maxRadius: 420,
            lifeMs: 480,
            maxLifeMs: 480,
            color: '#fde047',
            lineWidth: 6,
          });
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 24, ev.label, '#fde047', 2.2);
          }
          break;

        case 'TRIANGLE_CAGE':
          this.audio.playKill(state.combo + 3);
          this.addCameraShake(0, 1, 11);
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y, ev.label, '#fbbf24', 2.1);
          }
          break;

        case 'WAVE_CLEAR':
        case 'BOSS_PHASE':
        case 'UPGRADE_PICKED':
        case 'GAME_END':
          if (ev.label) {
            this.spawnPopup(ev.x, ev.y - 24, ev.label, ev.color ?? '#fde047', 2.0);
            this.announcerEl.textContent = ev.label;
          }
          break;
      }
    }
  }

  public resetVisuals(): void {
    this.particles = [];
    this.rings = [];
    this.popups = [];
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeVelX = 0;
    this.shakeVelY = 0;
    this.screenFlashAlpha = 0;
    this.lastRenderedStatus = '';
    this.lastDraftSignature = '';
  }

  public isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public setDebugVisible(visible: boolean): void {
    this.debugVisible = visible;
    this.debugPanelEl.hidden = !visible;
  }

  private updateVisualJuice(dtMs: number): void {
    // Spring-damped directional camera shake
    const stiffness = 0.045;
    const damping = 0.78;
    this.shakeVelX += -this.shakeX * stiffness * dtMs;
    this.shakeVelY += -this.shakeY * stiffness * dtMs;
    this.shakeVelX *= damping;
    this.shakeVelY *= damping;
    this.shakeX += this.shakeVelX;
    this.shakeY += this.shakeVelY;

    if (this.screenFlashAlpha > 0) {
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - dtMs * 0.0012);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.lifeMs -= dtMs;
      if (pt.lifeMs <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dtMs;
      pt.y += pt.vy * dtMs;
      pt.vx *= 0.96;
      pt.vy *= 0.96;
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.lifeMs -= dtMs;
      if (r.lifeMs <= 0) {
        this.rings.splice(i, 1);
        continue;
      }
      const progress = 1 - r.lifeMs / r.maxLifeMs;
      r.radius = 10 + (r.maxRadius - 10) * (1 - (1 - progress) * (1 - progress));
    }

    // Spring-physics popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.lifeMs -= dtMs;
      if (pop.lifeMs <= 0) {
        this.popups.splice(i, 1);
        continue;
      }
      pop.y += pop.vy * dtMs;
      const springForce = (pop.targetScale - pop.scale) * 0.032;
      pop.scaleVel = (pop.scaleVel + springForce * dtMs) * 0.82;
      pop.scale += pop.scaleVel;
    }
  }

  private syncHUDAndOverlays(state: VoltLashState): void {
    const p = state.player;
    const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    this.hpFillEl.style.inlineSize = `${hpPct}%`;
    this.hpFillEl.style.background =
      hpPct <= 30 ? '#ef4444' : hpPct <= 60 ? '#fbbf24' : '#34d399';
    this.hpTextEl.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;

    const surgePct = Math.round(state.surge);
    this.surgeFillEl.style.inlineSize = `${surgePct}%`;

    if (p.overdriveMs > 0) {
      this.surgeFillEl.style.background = '#fde047';
      this.surgeLabelEl.style.color = '#fde047';
      this.surgeLabelEl.textContent = `⚡ OVERDRIVE (${(p.overdriveMs / 1000).toFixed(1)}s)`;
      this.bankBtnEl.disabled = true;
      this.bankBtnEl.textContent = '⚡ OVERDRIVE ACTIVE';
    } else if (surgePct >= 100) {
      this.surgeFillEl.style.background = '#fde047';
      this.surgeLabelEl.style.color = '#fde047';
      this.surgeLabelEl.textContent = '100% // ⚡ SUPERNOVA READY [E]';
      this.bankBtnEl.disabled = false;
      this.bankBtnEl.textContent = '⚡ [E] UNLEASH SUPERNOVA!';
    } else if (isRedlined(state)) {
      this.surgeFillEl.style.background = '#f43f5e';
      this.surgeLabelEl.style.color = '#f43f5e';
      this.surgeLabelEl.textContent = `${surgePct}% // ⚠️ REDLINE (+50% DMG / 3x XP)`;
      this.bankBtnEl.disabled = false;
      this.bankBtnEl.textContent = `[E] Bank Surge (+30 HP)`;
    } else if (surgePct >= 35) {
      this.surgeFillEl.style.background = '#34d399';
      this.surgeLabelEl.style.color = '#34d399';
      this.surgeLabelEl.textContent = `${surgePct}% // BANK READY [E: +30 HP]`;
      this.bankBtnEl.disabled = false;
      this.bankBtnEl.textContent = `[E] Bank Surge (+30 HP)`;
    } else {
      this.surgeFillEl.style.background = '#38bdf8';
      this.surgeLabelEl.style.color = '#38bdf8';
      this.surgeLabelEl.textContent = `${surgePct}% // GRAZE & PARRY TO CHARGE`;
      this.bankBtnEl.disabled = true;
      this.bankBtnEl.textContent = `[E] Need 35% Surge`;
    }

    this.comboBadgeEl.textContent = `${state.combo} COMBO · x${state.multiplier.toFixed(1)}`;
    this.waveTextEl.textContent =
      state.wave === state.maxWaves
        ? `BOSS WAVE 5 / 5`
        : `WAVE ${state.wave} / ${state.maxWaves}`;
    this.scoreTextEl.textContent = `SCORE ${state.score.toLocaleString()}`;

    // Upgrade Draft Overlay
    if (state.status === 'DRAFT_UPGRADE') {
      this.draftOverlayEl.hidden = false;
      const sig = state.draftChoices.join(',');
      if (sig !== this.lastDraftSignature) {
        this.lastDraftSignature = sig;
        this.renderDraftCards(state.draftChoices);
      }
    } else {
      this.draftOverlayEl.hidden = true;
      this.lastDraftSignature = '';
    }

    // End of Run Recap Overlay
    if (state.status === 'VICTORY' || state.status === 'DEFEAT') {
      this.endOverlayEl.hidden = false;
      if (this.lastRenderedStatus !== state.status) {
        this.renderEndRecap(state);
      }
    } else {
      this.endOverlayEl.hidden = true;
    }

    this.lastRenderedStatus = state.status;

    if (this.debugVisible) {
      this.debugPanelEl.hidden = false;
      this.debugPanelEl.innerHTML = `
        <div>SEED: ${state.seed} · RNG: ${state.rngState}</div>
        <div>STATUS: ${state.status} · WAVE: ${state.wave}</div>
        <div>ENEMIES: ${state.enemies.length} · PROJ: ${state.projectiles.length}</div>
        <div>HITSTOP: ${ state.hitStopMs.toFixed(1) }ms · UPGRADES: ${state.upgrades.length}</div>
      `;
    }
  }

  private renderDraftCards(choices: readonly UpgradeId[]): void {
    this.draftCardsContainerEl.innerHTML = '';
    choices.forEach((id, idx) => {
      const def = UPGRADE_CATALOG.find((u) => u.id === id);
      if (!def) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vl-draft-card';
      btn.style.setProperty('--card-color', def.color);
      btn.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-block-end:8px;">
            <span style="font-size:0.72rem; font-weight:800; color:${def.color}; letter-spacing:0.08em;">${def.tag}</span>
            <span style="font-size:0.75rem; font-weight:900; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:99px;">KEY [${idx + 1}]</span>
          </div>
          <div style="font-size:1.2rem; font-weight:900; margin-block-end:8px;">
            ${def.icon} ${def.name}
          </div>
          <p style="font-size:0.86rem; line-height:1.45; color:#e2e8f0; margin:0 0 12px 0;">
            ${def.description}
          </p>
        </div>
        <div style="font-size:0.75rem; color:#94a3b8; border-block-start:1px solid rgba(148,163,184,0.2); padding-block-start:8px;">
          ✨ ${def.synergyHint}
        </div>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onSelectUpgrade(idx);
      });
      this.draftCardsContainerEl.appendChild(btn);
    });
  }

  private renderEndRecap(state: VoltLashState): void {
    const isWin = state.status === 'VICTORY';
    const accent = isWin ? '#fde047' : '#f43f5e';
    const pickedDefs = state.upgrades
      .map((id) => UPGRADE_CATALOG.find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));

    const synergiesHtml =
      pickedDefs.length > 0
        ? pickedDefs
            .map(
              (u) =>
                `<span style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:99px; background:rgba(15,23,42,0.9); border:1px solid ${u.color}; font-size:0.78rem; font-weight:700;">${u.icon} ${u.name}</span>`
            )
            .join(' ')
        : '<span style="color:#94a3b8; font-size:0.82rem;">No Reactor Modules Drafted</span>';

    this.endCardEl.style.borderColor = accent;
    this.endCardEl.innerHTML = `
      <div style="font-size:0.78rem; font-weight:900; letter-spacing:0.12em; color:${accent}; text-transform:uppercase; margin-block-end:4px;">
        ${isWin ? '★ SINGULARITY CONQUERED ★' : '⚠️ HULL BREACH // RUN TERMINATED'}
      </div>
      <h2 id="vl-end-heading" style="font-size:1.75rem; font-weight:900; margin:0 0 8px 0; color:#f8fafc;">
        ${isWin ? 'VICTORY: ARCHON-V SHATTERED' : 'DEFEAT: ONE MORE RUN?'}
      </h2>
      <p style="font-size:0.9rem; color:#cbd5e1; margin:0 0 16px 0;">
        <strong>Cause:</strong> ${state.killedBy || 'Combat Attrition'}
      </p>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-block-end:16px; text-align:center;">
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">FINAL SCORE</div>
          <div style="font-size:1.15rem; font-weight:900; color:#fde047;">${state.score.toLocaleString()}</div>
        </div>
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">PEAK COMBO</div>
          <div style="font-size:1.15rem; font-weight:900; color:#38bdf8;">${state.peakCombo} (x${state.peakMultiplier.toFixed(1)})</div>
        </div>
        <div style="background:rgba(15,23,42,0.85); padding:10px; border-radius:8px; border:1px solid rgba(148,163,184,0.2);">
          <div style="font-size:0.7rem; color:#94a3b8;">PARRIES / GRAZES</div>
          <div style="font-size:1.15rem; font-weight:900; color:#34d399;">${state.totalParries} / ${state.totalGrazes}</div>
        </div>
      </div>

      <div style="margin-block-end:18px;">
        <div style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-block-end:8px;">
          ACTIVE BUILD SYNERGIES (${pickedDefs.length})
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
          ${synergiesHtml}
        </div>
      </div>

      <button
        type="button"
        id="vl-end-restart-btn"
        class="vl-btn"
        style="inline-size:100%; padding-block:12px; font-size:0.95rem; background:${accent}; color:#020617; border:none; font-weight:900;"
      >
        ▶ INSTANT RETRY — PRESS [R] OR [SPACE]
      </button>
    `;

    const retryBtn = this.endCardEl.querySelector('#vl-end-restart-btn') as HTMLButtonElement | null;
    retryBtn?.addEventListener('click', () => this.callbacks.onRestart());
  }

  public render(state: VoltLashState, dtMs: number): void {
    this.updateVisualJuice(dtMs);
    this.syncHUDAndOverlays(state);

    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Apply directional camera shake
    ctx.translate(this.shakeX, this.shakeY);

    // 1. Cyber Arena Grid Background
    ctx.strokeStyle = isRedlined(state)
      ? 'rgba(244, 63, 94, 0.14)'
      : state.player.overdriveMs > 0
        ? 'rgba(253, 224, 71, 0.16)'
        : 'rgba(56, 189, 248, 0.09)';
    ctx.lineWidth = 1;
    const gridStep = 60;
    for (let x = gridStep; x < ARENA_WIDTH; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ARENA_HEIGHT);
      ctx.stroke();
    }
    for (let y = gridStep; y < ARENA_HEIGHT; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ARENA_WIDTH, y);
      ctx.stroke();
    }

    // 2. Ground Hazard Zones (0.65s visual telegraph before strike!)
    for (const hz of state.hazardZones) {
      const isStriking = hz.windupMs <= 0;
      const progress = isStriking ? 1 : 1 - hz.windupMs / hz.maxWindupMs;

      ctx.save();
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fillStyle = isStriking
        ? 'rgba(239, 68, 68, 0.52)'
        : `rgba(244, 63, 94, ${0.12 + progress * 0.22})`;
      ctx.fill();
      ctx.lineWidth = isStriking ? 4 : 2;
      ctx.strokeStyle = isStriking ? '#fde047' : '#f43f5e';
      ctx.stroke();

      // Inner expanding telegraph ring
      if (!isStriking) {
        ctx.beginPath();
        ctx.arc(hz.x, hz.y, hz.radius * progress, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Singularity Implosion Vortices
    for (const v of state.vortices) {
      const alpha = Math.max(0, v.lifeMs / v.maxLifeMs);
      ctx.save();
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.radius * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.85})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Redline Plasma Wake Nodes
    for (const w of state.wakeNodes) {
      const alpha = Math.max(0, w.lifeMs / w.maxLifeMs);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.45})`;
      ctx.fill();
    }

    // 5. Triangle Cage Protocol Geometry Enclosure
    if (hasUpgrade(state, 'triangle_cage') && state.tethers.length >= 2) {
      const t1 = state.tethers[state.tethers.length - 2];
      const t2 = state.tethers[state.tethers.length - 1];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(t1.x1, t1.y1);
      ctx.lineTo(t2.x1, t2.y1);
      ctx.lineTo(t2.x2, t2.y2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 6. High-Voltage Dash Tethers
    for (const tether of state.tethers) {
      const alpha = Math.min(1, tether.lifeMs / 400);
      ctx.save();
      ctx.strokeStyle = tether.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = hasUpgrade(state, 'tether_lightning') ? 5 : 3.5;
      ctx.beginPath();
      ctx.moveTo(tether.x1, tether.y1);
      // Slight electric jitter midpoint
      const midX = (tether.x1 + tether.x2) * 0.5 + (Math.random() - 0.5) * 8;
      const midY = (tether.y1 + tether.y2) * 0.5 + (Math.random() - 0.5) * 8;
      ctx.lineTo(midX, midY);
      ctx.lineTo(tether.x2, tether.y2);
      ctx.stroke();

      // Anchor nodes
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(tether.x1, tether.y1, 5, 0, Math.PI * 2);
      ctx.arc(tether.x2, tether.y2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. XP Shards
    for (const s of state.shards) {
      ctx.save();
      ctx.fillStyle = '#34d399';
      ctx.translate(s.x, s.y);
      ctx.rotate(state.elapsedMs * 0.005);
      ctx.fillRect(-4.5, -4.5, 9, 9);
      ctx.restore();
    }

    // 8. Enemy Attack Telegraphs (0.5s+ clear warning sightlines & lanes!)
    for (const enemy of state.enemies) {
      this.renderEnemyTelegraph(ctx, enemy);
    }

    // 9. Enemies & Boss Health Bar
    for (const enemy of state.enemies) {
      this.renderEnemy(ctx, enemy);
    }

    // 10. Projectiles & Decaying Motion Trails
    for (const proj of state.projectiles) {
      if (proj.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = proj.color;
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = proj.radius * 0.9;
        ctx.beginPath();
        ctx.moveTo(proj.trail[0].x, proj.trail[0].y);
        for (let t = 1; t < proj.trail.length; t++) {
          ctx.lineTo(proj.trail[t].x, proj.trail[t].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fillStyle = proj.isParried ? '#fde047' : proj.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    // 11. Player Hull, Graze Ring, Parry Halo & Mirror Orbitals
    this.renderPlayer(ctx, state);

    // 12. Shockwave Rings & Directional Particles
    for (const r of this.rings) {
      const alpha = Math.max(0, r.lifeMs / r.maxLifeMs);
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of this.particles) {
      const alpha = Math.max(0, pt.lifeMs / pt.maxLifeMs);
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(pt.x - pt.size * 0.5, pt.y - pt.size * 0.5, pt.size, pt.size);
      ctx.restore();
    }

    // 13. Spring-Physics Floating Popups
    for (const pop of this.popups) {
      const alpha = Math.min(1, pop.lifeMs / 260);
      ctx.save();
      ctx.translate(pop.x, pop.y);
      ctx.scale(pop.scale, pop.scale);
      ctx.globalAlpha = alpha;
      ctx.font = '900 15px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3.5;
      ctx.strokeText(pop.text, 0, 0);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }

    // 14. 1-Line Floating World Onboarding Prompt (fades out once player moves & dashes)
    if (state.tutorialPromptAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = state.tutorialPromptAlpha;
      const py = Math.max(68, state.player.y - 68);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      const boxW = 670;
      const boxH = 34;
      const bx = Math.max(20, Math.min(ARENA_WIDTH - boxW - 20, state.player.x - boxW * 0.5));
      ctx.fillRect(bx, py - 22, boxW, boxH);
      ctx.strokeRect(bx, py - 22, boxW, boxH);

      ctx.font = '800 13px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(
        '[WASD / Arrows] Move & Graze Bullets   ·   [SPACE / Click] Lash-Parry Dash   ·   [E / Right-Click] Bank Surge (+30 HP)',
        bx + boxW * 0.5,
        py - 1
      );
      ctx.restore();
    }

    // Screen impact flash
    if (this.screenFlashAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = this.screenFlashColor;
      ctx.globalAlpha = this.screenFlashAlpha;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderEnemyTelegraph(ctx: CanvasRenderingContext2D, enemy: EnemyEntity): void {
    const tel = enemy.telegraph;
    if (tel.type === 'none' || tel.durationMs <= 0) return;

    const progress = 1 - Math.max(0, tel.timerMs) / tel.durationMs;

    ctx.save();
    if (tel.type === 'laser_line') {
      const endX = enemy.x + Math.cos(tel.angle) * 950;
      const endY = enemy.y + Math.sin(tel.angle) * 950;
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.28 + progress * 0.65})`;
      ctx.lineWidth = Math.max(2, (1 - progress) * 14);
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (tel.type === 'dash_lane') {
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.3 + progress * 0.6})`;
      ctx.lineWidth = enemy.radius * 1.6;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(tel.targetX, tel.targetY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tel.targetX, tel.targetY, enemy.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (tel.type === 'radial_burst') {
      const ringR = enemy.radius + (1 - progress) * 34;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 113, 133, ${0.35 + progress * 0.6})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyEntity): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fillStyle = enemy.hitFlashMs > 0 ? '#ffffff' : enemy.color;
    ctx.fill();
    ctx.lineWidth = enemy.kind === 'boss' ? 4 : 2;
    ctx.strokeStyle = enemy.kind === 'boss' ? '#fde047' : '#0f172a';
    ctx.stroke();

    // Mini health bar above damaged enemies or boss
    if (enemy.hp < enemy.maxHp || enemy.kind === 'boss') {
      const barW = enemy.kind === 'boss' ? 110 : 34;
      const barH = enemy.kind === 'boss' ? 8 : 4;
      const bx = enemy.x - barW * 0.5;
      const by = enemy.y - enemy.radius - 14;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = enemy.kind === 'boss' ? '#ef4444' : '#fb7185';
      ctx.fillRect(bx, by, barW * Math.max(0, enemy.hp / enemy.maxHp), barH);
    }
    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, state: VoltLashState): void {
    const p = state.player;

    // Decaying motion trail
    if (p.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = p.overdriveMs > 0 ? '#fde047' : isRedlined(state) ? '#f43f5e' : '#38bdf8';
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = p.radius * 1.1;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Outer Graze Ring (shows risk/reward graze radius!)
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.grazeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isRedlined(state)
      ? 'rgba(244, 63, 94, 0.38)'
      : 'rgba(52, 211, 153, 0.25)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Active Parry Deflection Halo
    if (p.parryWindowMs > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.grazeRadius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Synergy: Mirror Aegis Orbitals
    if (hasUpgrade(state, 'mirror_orbitals')) {
      const orbDist = 38;
      for (let b = 0; b < 2; b++) {
        const ang = p.orbitalAngle + b * Math.PI;
        const ox = p.x + Math.cos(ang) * orbDist;
        const oy = p.y + Math.sin(ang) * orbDist;
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#2dd4bf';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Player Ship Core Hull
    const aimAngle = Math.atan2(p.aimY - p.y, p.aimX - p.x);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(aimAngle);

    ctx.beginPath();
    ctx.moveTo(p.radius + 5, 0);
    ctx.lineTo(-p.radius, -p.radius * 0.85);
    ctx.lineTo(-p.radius * 0.5, 0);
    ctx.lineTo(-p.radius, p.radius * 0.85);
    ctx.closePath();

    ctx.fillStyle =
      p.overdriveMs > 0 ? '#fde047' : isRedlined(state) ? '#f43f5e' : '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.container.innerHTML = '';
  }
}
