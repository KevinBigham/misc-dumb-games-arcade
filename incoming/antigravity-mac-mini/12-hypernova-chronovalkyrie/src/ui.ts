import { HYPERNOVA_CONFIG } from './config';
import {
  AUGMENT_REGISTRY,
  CHASSIS_REGISTRY,
  type ChassisId,
} from './content';
import { HypernovaAudioEngine } from './audio';
import type { HypernovaCareerStats } from './persistence';
import {
  getPlayerDerivedStats,
  selectDraftChoice,
  type HypernovaGameState,
  type HypernovaInputState,
} from './simulation';

interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
}

interface ChronoAfterimage {
  x: number;
  y: number;
  rotation: number;
  alpha: number;
  color: string;
}

export interface HypernovaUICallbacks {
  onRestart: (chassisId: ChassisId, seed?: number) => void;
  onRunEnd: (state: HypernovaGameState) => void;
}

export class HypernovaUIController {
  private container: HTMLElement;
  private audio: HypernovaAudioEngine;
  private callbacks: HypernovaUICallbacks;
  private career: HypernovaCareerStats;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;

  // Visual FX systems
  private particles: VisualParticle[] = [];
  private floatingTexts: FloatingText[] = [];
  private stars: Star[] = [];
  private afterimages: ChronoAfterimage[] = [];
  private trauma: number = 0;
  private hitstopMs: number = 0;
  private lastTimeMs: number = 0;
  private crtEnabled: boolean = true;
  private autoFireEnabled: boolean = true;
  private debugMode: boolean = false;

  // Active Input State
  private keys: Record<string, boolean> = {};
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isMouseDown: boolean = false;
  private rightMouseDown: boolean = false;

  // UI DOM Elements
  private overlayRoot!: HTMLElement;
  private startMenuEl!: HTMLElement;
  private draftingModalEl!: HTMLElement;
  private pauseMenuEl!: HTMLElement;
  private gameOverEl!: HTMLElement;

  // Selected Chassis for next launch
  private selectedChassisId: ChassisId = 'interceptor';

  constructor(
    container: HTMLElement,
    audio: HypernovaAudioEngine,
    career: HypernovaCareerStats,
    callbacks: HypernovaUICallbacks
  ) {
    this.container = container;
    this.audio = audio;
    this.career = career;
    this.callbacks = callbacks;

    this.initDOM();
    this.initStars();
    this.initEventListeners();
  }

  private initDOM(): void {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.minHeight = '720px';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = '#05070f';
    this.container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    this.container.style.userSelect = 'none';

    // 1. Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = HYPERNOVA_CONFIG.ARENA_WIDTH;
    this.canvas.height = HYPERNOVA_CONFIG.ARENA_HEIGHT;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '50%';
    this.canvas.style.top = '50%';
    this.canvas.style.transform = 'translate(-50%, -50%)';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.boxShadow = '0 0 50px rgba(0, 240, 255, 0.15)';
    this.canvas.style.border = '1px solid rgba(0, 240, 255, 0.2)';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;

    // 2. DOM Overlay for Menus, HUD, and Modals
    this.overlayRoot = document.createElement('div');
    this.overlayRoot.style.position = 'absolute';
    this.overlayRoot.style.inset = '0';
    this.overlayRoot.style.pointerEvents = 'none';
    this.container.appendChild(this.overlayRoot);

    this.buildHUDDOM();
    this.buildStartMenuDOM();
    this.buildDraftingModalDOM();
    this.buildPauseMenuDOM();
    this.buildGameOverDOM();
  }

  private buildHUDDOM(): void {
    const hud = document.createElement('div');
    hud.id = 'hypernova-hud';
    hud.style.position = 'absolute';
    hud.style.top = '12px';
    hud.style.left = '16px';
    hud.style.right = '16px';
    hud.style.display = 'flex';
    hud.style.justifyContent = 'space-between';
    hud.style.alignItems = 'flex-start';
    hud.style.color = '#f1f5f9';
    hud.style.pointerEvents = 'none';
    hud.style.zIndex = '10';

    hud.innerHTML = `
      <!-- Left Vitals -->
      <div style="display:flex; flex-direction:column; gap:6px; min-width:240px; background:rgba(7,10,20,0.75); padding:10px 14px; border-radius:8px; border:1px solid rgba(56,189,248,0.3); backdrop-filter:blur(6px);">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#94a3b8; letter-spacing:1px;">
          <span id="hud-chassis-label">CHASSIS: INTERCEPTOR</span>
          <span id="hud-level-label" style="color:#00f0ff;">LVL 1</span>
        </div>

        <!-- Hull Bar -->
        <div style="display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600;">
            <span style="color:#f43f5e;">HULL</span>
            <span id="hud-hull-val">100 / 100</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
            <div id="hud-hull-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #f43f5e, #fb7185); transition:width 0.15s ease;"></div>
          </div>
        </div>

        <!-- Shield Bar -->
        <div style="display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600;">
            <span style="color:#38bdf8;">SHIELD</span>
            <span id="hud-shield-val">80 / 80</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
            <div id="hud-shield-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #0284c7, #38bdf8); transition:width 0.15s ease;"></div>
          </div>
        </div>

        <!-- Chrono Drift Bar -->
        <div style="display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600;">
            <span style="color:#00f0ff;">CHRONO-DRIFT [SPACE]</span>
            <span id="hud-chrono-status">READY</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
            <div id="hud-chrono-bar" style="width:100%; height:100%; background:linear-gradient(90deg, #00f0ff, #a855f7); transition:width 0.1s linear;"></div>
          </div>
        </div>
      </div>

      <!-- Center Wave Telemetry -->
      <div style="display:flex; flex-direction:column; align-items:center; background:rgba(7,10,20,0.75); padding:8px 20px; border-radius:8px; border:1px solid rgba(168,85,247,0.3); backdrop-filter:blur(6px);">
        <div id="hud-wave-title" style="font-size:14px; font-weight:800; color:#e2e8f0; letter-spacing:1.5px;">WAVE 01: PERIMETER INTRUSION</div>
        <div style="display:flex; align-items:center; gap:12px; margin-top:4px;">
          <div id="hud-wave-timer" style="font-size:13px; font-weight:700; color:#00f0ff; font-variant-numeric:tabular-nums;">00:35</div>
          <div style="font-size:12px; color:#94a3b8;">SCORE: <strong id="hud-score" style="color:#fde047;">0</strong></div>
        </div>
      </div>

      <!-- Right Combo & Overdrive Gauge -->
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; min-width:180px; background:rgba(7,10,20,0.75); padding:10px 14px; border-radius:8px; border:1px solid rgba(244,63,94,0.3); backdrop-filter:blur(6px);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1px;">OVERDRIVE</span>
          <div id="hud-combo-badge" style="font-size:20px; font-weight:900; color:#94a3b8; text-shadow:0 0 10px currentColor;">D</div>
        </div>
        <div style="font-size:13px; font-weight:700; color:#fde047;">
          <span id="hud-combo-mult">x1.0</span> MULTIPLIER
        </div>
        <div style="font-size:11px; color:#cbd5e1;">
          GRAZES: <strong id="hud-grazes-count" style="color:#00f0ff;">0</strong>
        </div>
      </div>
    `;

    this.overlayRoot.appendChild(hud);
  }

  private buildStartMenuDOM(): void {
    this.startMenuEl = document.createElement('div');
    this.startMenuEl.style.position = 'absolute';
    this.startMenuEl.style.inset = '0';
    this.startMenuEl.style.display = 'flex';
    this.startMenuEl.style.flexDirection = 'column';
    this.startMenuEl.style.justifyContent = 'center';
    this.startMenuEl.style.alignItems = 'center';
    this.startMenuEl.style.background = 'radial-gradient(circle at center, rgba(15,23,42,0.85) 0%, rgba(3,7,18,0.96) 100%)';
    this.startMenuEl.style.backdropFilter = 'blur(10px)';
    this.startMenuEl.style.zIndex = '50';
    this.startMenuEl.style.pointerEvents = 'auto';

    this.startMenuEl.innerHTML = `
      <div style="max-width:760px; width:90%; text-align:center; display:flex; flex-direction:column; gap:20px; color:#f8fafc;">
        <div>
          <div style="display:inline-block; font-size:11px; font-weight:800; letter-spacing:2px; color:#00f0ff; background:rgba(0,240,255,0.1); border:1px solid #00f0ff; padding:4px 12px; border-radius:999px; margin-bottom:8px;">
            ARGON 10X APEX FLAGSHIP // GAME 12
          </div>
          <h1 style="margin:0; font-size:42px; font-weight:900; letter-spacing:2px; background:linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #f43f5e 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; text-shadow:0 0 30px rgba(0,240,255,0.3);">
            HYPERNOVA: CHRONO-VALKYRIE
          </h1>
          <p style="margin:6px 0 0 0; font-size:16px; color:#94a3b8; font-weight:500;">
            Apex Overdrive Bullet-Time Roguelite · Twin-Stick Graze Arena
          </p>
        </div>

        <!-- Frame Chassis Selection -->
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
          <div style="font-size:12px; font-weight:700; color:#38bdf8; letter-spacing:1px;">SELECT VALKYRIE CHASSIS:</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;" id="chassis-card-grid">
            <!-- Cards will be populated by render -->
          </div>
        </div>

        <div style="display:flex; justify-content:center; align-items:center; gap:16px; margin-top:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <label for="start-seed-input" style="font-size:12px; font-weight:700; color:#94a3b8;">RUN SEED:</label>
            <input type="number" id="start-seed-input" value="${HYPERNOVA_CONFIG.DEFAULT_SEED}" style="width:110px; background:#0f172a; border:1px solid #334155; color:#f8fafc; padding:6px 10px; border-radius:6px; font-size:12px; font-family:monospace;" />
          </div>

          <button type="button" id="btn-launch-run" style="background:linear-gradient(135deg, #00f0ff, #3b82f6); border:none; color:#030712; font-size:16px; font-weight:800; letter-spacing:1px; padding:12px 32px; border-radius:8px; cursor:pointer; box-shadow:0 0 25px rgba(0,240,255,0.4); transition:all 0.15s ease;">
            ▶ LAUNCH SORTIE [ENTER]
          </button>
        </div>

        <!-- Controls Guide -->
        <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(51,65,85,0.5); padding:10px 16px; border-radius:8px; font-size:12px; color:#94a3b8; display:flex; justify-content:space-around;">
          <span>🕹️ <strong>WASD / Arrows:</strong> Vector Thrust</span>
          <span>🖱️ <strong>Mouse:</strong> Aim & Fire</span>
          <span>⚡ <strong>Space / Right-Click:</strong> Chrono-Drift (0.2x Bullet-Time)</span>
          <span>🛡️ <strong>Near Misses:</strong> Graze (+Energy & Multiplier)</span>
        </div>
      </div>
    `;

    this.overlayRoot.appendChild(this.startMenuEl);
    this.renderChassisSelectionCards();
  }

  private renderChassisSelectionCards(): void {
    const grid = this.startMenuEl.querySelector('#chassis-card-grid');
    if (!grid) return;

    grid.innerHTML = (['interceptor', 'colossus', 'phantom'] as ChassisId[])
      .map((id) => {
        const chassis = CHASSIS_REGISTRY[id];
        const isSelected = this.selectedChassisId === id;
        return `
          <div data-chassis-id="${id}" style="cursor:pointer; background:${isSelected ? 'rgba(0,240,255,0.12)' : 'rgba(15,23,42,0.8)'}; border:2px solid ${isSelected ? chassis.accentColor : 'rgba(51,65,85,0.6)'}; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px; transition:all 0.15s ease; box-shadow:${isSelected ? '0 0 20px rgba(0,240,255,0.2)' : 'none'};">
            <div style="font-size:11px; font-weight:800; color:${chassis.accentColor}; letter-spacing:1px;">${chassis.designation}</div>
            <div style="font-size:14px; font-weight:700; color:#f8fafc;">${chassis.name}</div>
            <div style="font-size:11px; color:#cbd5e1; line-height:1.4;">${chassis.passiveDescription}</div>
            <div style="margin-top:auto; font-size:10px; color:#64748b; font-weight:600;">PRIMARY: ${chassis.startingWeaponId.toUpperCase()}</div>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-chassis-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-chassis-id') as ChassisId;
        this.selectedChassisId = id;
        this.renderChassisSelectionCards();
        this.audio.playVulcan();
      });
    });
  }

  private buildDraftingModalDOM(): void {
    this.draftingModalEl = document.createElement('div');
    this.draftingModalEl.style.position = 'absolute';
    this.draftingModalEl.style.inset = '0';
    this.draftingModalEl.style.display = 'none';
    this.draftingModalEl.style.flexDirection = 'column';
    this.draftingModalEl.style.justifyContent = 'center';
    this.draftingModalEl.style.alignItems = 'center';
    this.draftingModalEl.style.background = 'rgba(5,7,15,0.88)';
    this.draftingModalEl.style.backdropFilter = 'blur(12px)';
    this.draftingModalEl.style.zIndex = '60';
    this.draftingModalEl.style.pointerEvents = 'auto';

    this.draftingModalEl.innerHTML = `
      <div style="max-width:880px; width:92%; display:flex; flex-direction:column; gap:20px; text-align:center; color:#f8fafc;">
        <div>
          <div style="font-size:12px; font-weight:800; letter-spacing:2px; color:#00f0ff;">QUANTUM RESONANCE DETECTED</div>
          <h2 style="margin:4px 0 0 0; font-size:32px; font-weight:900; letter-spacing:1px; background:linear-gradient(135deg, #00f0ff, #f43f5e); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            DRAFT SYNERGISTIC AUGMENTATION
          </h2>
          <p style="margin:4px 0 0 0; font-size:14px; color:#94a3b8;">Choose 1 upgrade matrix to install into your Valkyrie frame [Keys 1, 2, or 3]</p>
        </div>

        <div id="draft-cards-container" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;"></div>
      </div>
    `;

    this.overlayRoot.appendChild(this.draftingModalEl);
  }

  private buildPauseMenuDOM(): void {
    this.pauseMenuEl = document.createElement('div');
    this.pauseMenuEl.style.position = 'absolute';
    this.pauseMenuEl.style.inset = '0';
    this.pauseMenuEl.style.display = 'none';
    this.pauseMenuEl.style.flexDirection = 'column';
    this.pauseMenuEl.style.justifyContent = 'center';
    this.pauseMenuEl.style.alignItems = 'center';
    this.pauseMenuEl.style.background = 'rgba(5,7,15,0.85)';
    this.pauseMenuEl.style.backdropFilter = 'blur(8px)';
    this.pauseMenuEl.style.zIndex = '55';
    this.pauseMenuEl.style.pointerEvents = 'auto';

    this.pauseMenuEl.innerHTML = `
      <div style="background:#0f172a; border:1px solid #334155; padding:28px; border-radius:12px; max-width:440px; width:88%; display:flex; flex-direction:column; gap:16px; color:#f8fafc; text-align:center;">
        <h2 style="margin:0; font-size:24px; font-weight:800; color:#00f0ff; letter-spacing:1px;">TACTICAL PAUSE</h2>

        <div style="display:flex; flex-direction:column; gap:10px; text-align:left; font-size:13px;">
          <button type="button" id="btn-toggle-sound" style="background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600;">
            🔊 Sound: ON
          </button>
          <button type="button" id="btn-toggle-crt" style="background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600;">
            📺 CRT Scanlines: ON
          </button>
          <button type="button" id="btn-toggle-autofire" style="background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:10px 16px; border-radius:6px; cursor:pointer; font-weight:600;">
            ⚡ Auto-Fire: ON
          </button>
        </div>

        <div style="display:flex; gap:12px; margin-top:8px;">
          <button type="button" id="btn-resume-run" style="flex:1; background:#00f0ff; color:#030712; font-weight:800; padding:10px; border-radius:6px; border:none; cursor:pointer;">
            RESUME [ESC]
          </button>
          <button type="button" id="btn-abandon-run" style="flex:1; background:#ef4444; color:#ffffff; font-weight:800; padding:10px; border-radius:6px; border:none; cursor:pointer;">
            ABANDON
          </button>
        </div>
      </div>
    `;

    this.overlayRoot.appendChild(this.pauseMenuEl);
  }

  private buildGameOverDOM(): void {
    this.gameOverEl = document.createElement('div');
    this.gameOverEl.style.position = 'absolute';
    this.gameOverEl.style.inset = '0';
    this.gameOverEl.style.display = 'none';
    this.gameOverEl.style.flexDirection = 'column';
    this.gameOverEl.style.justifyContent = 'center';
    this.gameOverEl.style.alignItems = 'center';
    this.gameOverEl.style.background = 'radial-gradient(circle at center, rgba(15,23,42,0.92) 0%, rgba(3,7,18,0.98) 100%)';
    this.gameOverEl.style.backdropFilter = 'blur(12px)';
    this.gameOverEl.style.zIndex = '70';
    this.gameOverEl.style.pointerEvents = 'auto';

    this.gameOverEl.innerHTML = `
      <div style="max-width:620px; width:90%; background:#0b0f19; border:2px solid #334155; padding:32px; border-radius:12px; display:flex; flex-direction:column; gap:20px; text-align:center; color:#f8fafc; box-shadow:0 0 50px rgba(0,0,0,0.8);">
        <div id="game-over-title-badge" style="font-size:12px; font-weight:800; letter-spacing:2px; color:#f43f5e;">SORTIE TERMINATED</div>
        <h2 id="game-over-headline" style="margin:0; font-size:36px; font-weight:900; letter-spacing:1px; color:#f8fafc;">
          VALKYRIE DOWN
        </h2>

        <!-- Telemetry Breakdown -->
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; text-align:left; background:rgba(15,23,42,0.8); padding:16px; border-radius:8px; border:1px solid #1e293b; font-size:13px;">
          <div>FINAL SCORE: <strong id="recap-score" style="color:#fde047;">0</strong></div>
          <div>PEAK COMBO: <strong id="recap-combo" style="color:#00f0ff;">D</strong></div>
          <div>ENEMIES DEFEATED: <strong id="recap-kills" style="color:#38bdf8;">0</strong></div>
          <div>TOTAL GRAZES: <strong id="recap-grazes" style="color:#a855f7;">0</strong></div>
          <div>WAVE REACHED: <strong id="recap-wave" style="color:#f43f5e;">1</strong></div>
          <div>TIME SURVIVED: <strong id="recap-time" style="color:#cbd5e1;">00:00</strong></div>
        </div>

        <div style="display:flex; justify-content:center; gap:16px;">
          <button type="button" id="btn-relaunch-run" style="background:linear-gradient(135deg, #00f0ff, #3b82f6); border:none; color:#030712; font-size:15px; font-weight:800; letter-spacing:1px; padding:12px 28px; border-radius:8px; cursor:pointer;">
            LAUNCH NEXT RUN [ENTER]
          </button>
        </div>
      </div>
    `;

    this.overlayRoot.appendChild(this.gameOverEl);
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 180; i++) {
      this.stars.push({
        x: Math.random() * HYPERNOVA_CONFIG.ARENA_WIDTH,
        y: Math.random() * HYPERNOVA_CONFIG.ARENA_HEIGHT,
        speed: 20 + Math.random() * 80,
        size: Math.random() > 0.85 ? 2.0 : 1.0,
        color: Math.random() > 0.7 ? '#38bdf8' : Math.random() > 0.4 ? '#a855f7' : '#ffffff',
      });
    }
  }

  private initEventListeners(): void {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const choiceIdx = parseInt(e.key, 10) - 1;
        this.triggerDraftByIndex(choiceIdx);
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        this.togglePause();
      }

      if (e.key.toLowerCase() === 'd') {
        this.debugMode = !this.debugMode;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    // Mouse inputs on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
        this.audio.resume();
      } else if (e.button === 2) {
        this.rightMouseDown = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isMouseDown = false;
      if (e.button === 2) this.rightMouseDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent context menu so right-click is dash/chrono
    });

    // Start Menu Launch
    const launchBtn = this.startMenuEl.querySelector('#btn-launch-run');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        const seedInput = this.startMenuEl.querySelector<HTMLInputElement>('#start-seed-input');
        const seed = seedInput ? parseInt(seedInput.value, 10) || HYPERNOVA_CONFIG.DEFAULT_SEED : HYPERNOVA_CONFIG.DEFAULT_SEED;
        this.startMenuEl.style.display = 'none';
        this.audio.startMusic();
        this.callbacks.onRestart(this.selectedChassisId, seed);
      });
    }

    // Pause menu buttons
    const btnResume = this.pauseMenuEl.querySelector('#btn-resume-run');
    if (btnResume) {
      btnResume.addEventListener('click', () => this.togglePause(false));
    }

    const btnSound = this.pauseMenuEl.querySelector('#btn-toggle-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const muted = this.audio.toggleMute();
        btnSound.textContent = muted ? '🔇 Sound: MUTED' : '🔊 Sound: ON';
      });
    }

    const btnCrt = this.pauseMenuEl.querySelector('#btn-toggle-crt');
    if (btnCrt) {
      btnCrt.addEventListener('click', () => {
        this.crtEnabled = !this.crtEnabled;
        btnCrt.textContent = this.crtEnabled ? '📺 CRT Scanlines: ON' : '📺 CRT Scanlines: OFF';
      });
    }

    const btnAuto = this.pauseMenuEl.querySelector('#btn-toggle-autofire');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        this.autoFireEnabled = !this.autoFireEnabled;
        btnAuto.textContent = this.autoFireEnabled ? '⚡ Auto-Fire: ON' : '⚡ Auto-Fire: OFF';
      });
    }

    const btnAbandon = this.pauseMenuEl.querySelector('#btn-abandon-run');
    if (btnAbandon) {
      btnAbandon.addEventListener('click', () => {
        this.pauseMenuEl.style.display = 'none';
        this.startMenuEl.style.display = 'flex';
      });
    }

    // Game Over relaunch
    const btnRelaunch = this.gameOverEl.querySelector('#btn-relaunch-run');
    if (btnRelaunch) {
      btnRelaunch.addEventListener('click', () => {
        this.gameOverEl.style.display = 'none';
        this.callbacks.onRestart(this.selectedChassisId);
      });
    }
  }

  private triggerDraftByIndex(index: number): void {
    const cards = this.draftingModalEl.querySelectorAll<HTMLElement>('.draft-card');
    if (cards[index]) {
      cards[index].click();
    }
  }

  public togglePause(force?: boolean): void {
    const isVisible = this.pauseMenuEl.style.display === 'flex';
    const next = force !== undefined ? force : !isVisible;
    this.pauseMenuEl.style.display = next ? 'flex' : 'none';
  }

  public gatherInput(state: HypernovaGameState): HypernovaInputState {
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Normalise
    const mag = Math.hypot(moveX, moveY);
    if (mag > 0) {
      moveX /= mag;
      moveY /= mag;
    }

    const dashRequested = Boolean(this.keys['shift'] || this.keys[' ']);
    const chronoRequested = Boolean(this.keys['e'] || this.rightMouseDown);
    const firing = this.autoFireEnabled || this.isMouseDown || Boolean(this.keys['j']);

    return {
      moveX,
      moveY,
      aimX: this.mouseX,
      aimY: this.mouseY,
      firing,
      dashRequested,
      chronoRequested,
    };
  }

  public handleSimulationEvents(state: HypernovaGameState): void {
    for (const evt of state.events) {
      switch (evt.type) {
        case 'PLAYER_HIT': {
          this.trauma = Math.min(HYPERNOVA_CONFIG.MAX_TRAUMA, this.trauma + 0.35);
          if (evt.value) {
            this.spawnFloatingText(state.player.x, state.player.y - 20, `-${evt.value}`, '#f43f5e', 1.2);
          }
          this.audio.playVulcan();
          break;
        }

        case 'CRIT_HIT': {
          this.hitstopMs = HYPERNOVA_CONFIG.HITSTOP_CRIT_MS;
          this.trauma = Math.min(HYPERNOVA_CONFIG.MAX_TRAUMA, this.trauma + 0.15);
          if (evt.text && evt.x && evt.y) {
            this.spawnFloatingText(evt.x, evt.y - 24, evt.text, '#fde047', 1.4);
          }
          this.audio.playRailgun();
          break;
        }

        case 'SHIELD_BREAK': {
          this.trauma = Math.min(HYPERNOVA_CONFIG.MAX_TRAUMA, this.trauma + 0.5);
          this.spawnFloatingText(state.player.x, state.player.y - 30, 'SHIELD COLLAPSE', '#38bdf8', 1.4);
          this.audio.playShieldBreak();
          break;
        }

        case 'GRAZE': {
          if (evt.x && evt.y) {
            this.spawnFloatingText(evt.x, evt.y - 12, 'GRAZE', '#00f0ff', 1.0);
            this.spawnSparks(evt.x, evt.y, '#00f0ff', 6);
          }
          this.audio.playGraze();
          break;
        }

        case 'KILL': {
          if (evt.x && evt.y) {
            this.spawnSparks(evt.x, evt.y, '#f97316', 12);
          }
          this.audio.playExplosion(false);
          break;
        }

        case 'BOSS_KILL': {
          this.hitstopMs = HYPERNOVA_CONFIG.HITSTOP_BOSS_KILL_MS;
          this.trauma = HYPERNOVA_CONFIG.MAX_TRAUMA;
          if (evt.x && evt.y) {
            this.spawnSparks(evt.x, evt.y, '#f43f5e', 40);
          }
          this.audio.playExplosion(true);
          break;
        }

        case 'LEVEL_UP': {
          this.audio.playLevelUp();
          this.showDraftModal(state);
          break;
        }

        case 'DASH': {
          this.audio.playDash();
          this.spawnAfterimage(state.player.x, state.player.y, state.player.rotation, '#00f0ff');
          break;
        }

        case 'PARRY': {
          this.audio.playParry();
          this.spawnFloatingText(state.player.x, state.player.y - 28, evt.text ?? 'PARRY', '#facc15', 1.3);
          break;
        }

        case 'CHRONO_DRIFT_START': {
          this.audio.setChronoDriftFilter(true);
          this.trauma = 0.2;
          break;
        }

        case 'CHRONO_DRIFT_END': {
          this.audio.setChronoDriftFilter(false);
          break;
        }

        case 'REWIND_TRIGGERED': {
          this.audio.playRewind();
          this.trauma = HYPERNOVA_CONFIG.MAX_TRAUMA;
          this.spawnFloatingText(state.player.x, state.player.y - 35, 'REALITY REWOUND!', '#00f0ff', 1.6);
          break;
        }

        case 'VICTORY':
        case 'GAME_OVER': {
          this.showGameOverModal(state, evt.type === 'VICTORY');
          this.callbacks.onRunEnd(state);
          break;
        }
      }
    }
  }

  private showDraftModal(state: HypernovaGameState): void {
    const container = this.draftingModalEl.querySelector('#draft-cards-container');
    if (!container) return;

    container.innerHTML = state.pendingDraftChoices
      .map((choice, idx) => {
        const rarityColors: Record<string, string> = {
          COMMON: '#94a3b8',
          RARE: '#38bdf8',
          EPIC: '#c084fc',
          LEGENDARY: '#fde047',
        };
        const color = rarityColors[choice.rarity] || '#00f0ff';

        return `
          <div class="draft-card" data-choice-index="${idx}" style="cursor:pointer; background:rgba(15,23,42,0.9); border:2px solid ${color}; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:10px; text-align:left; transition:all 0.15s ease; box-shadow:0 0 25px ${color}33;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:10px; font-weight:800; color:${color}; letter-spacing:1px; background:${color}22; padding:2px 8px; border-radius:4px;">
                ${choice.rarity} [KEY ${idx + 1}]
              </span>
              <span style="font-size:11px; font-weight:700; color:#64748b;">${choice.synergyTag}</span>
            </div>
            <div style="font-size:16px; font-weight:800; color:#f8fafc;">${choice.name}</div>
            <div style="font-size:12px; color:#cbd5e1; line-height:1.45;">${choice.description}</div>
            <div style="margin-top:auto; font-size:11px; font-weight:700; color:${color}; text-align:center; padding:8px; background:${color}18; border-radius:6px;">
              SELECT MATRIX [${idx + 1}]
            </div>
          </div>
        `;
      })
      .join('');

    container.querySelectorAll('.draft-card').forEach((card) => {
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-choice-index') || '0', 10);
        selectDraftChoice(state, index);
        this.draftingModalEl.style.display = 'none';
        this.audio.playVulcan();
      });
    });

    this.draftingModalEl.style.display = 'flex';
  }

  private showGameOverModal(state: HypernovaGameState, isVictory: boolean): void {
    const headline = this.gameOverEl.querySelector<HTMLElement>('#game-over-headline');
    const badge = this.gameOverEl.querySelector<HTMLElement>('#game-over-title-badge');

    if (headline && badge) {
      if (isVictory) {
        headline.textContent = 'CHRONOS SINGULARITY PURGED';
        headline.style.color = '#00f0ff';
        badge.textContent = 'SUPREME MISSION COMPLETE // VICTORY';
        badge.style.color = '#34d399';
      } else {
        headline.textContent = 'VALKYRIE DESTROYED IN COMBAT';
        headline.style.color = '#f43f5e';
        badge.textContent = 'SORTIE TERMINATED';
        badge.style.color = '#f43f5e';
      }
    }

    const setVal = (id: string, val: string | number) => {
      const el = this.gameOverEl.querySelector(`#${id}`);
      if (el) el.textContent = String(val);
    };

    setVal('recap-score', state.score.toLocaleString());
    setVal('recap-combo', state.highestComboGrade);
    setVal('recap-kills', state.totalKills);
    setVal('recap-grazes', state.totalGrazes);
    setVal('recap-wave', state.currentWave);

    const mins = Math.floor(state.elapsedSec / 60);
    const secs = Math.floor(state.elapsedSec % 60);
    setVal('recap-time', `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

    this.gameOverEl.style.display = 'flex';
  }

  public updateHUD(state: HypernovaGameState): void {
    const setVal = (id: string, val: string | number) => {
      const el = this.overlayRoot.querySelector(`#${id}`);
      if (el) el.textContent = String(val);
    };

    setVal('hud-chassis-label', `CHASSIS: ${CHASSIS_REGISTRY[state.player.chassisId].name.toUpperCase()}`);
    setVal('hud-level-label', `LVL ${state.player.level}`);
    setVal('hud-hull-val', `${Math.max(0, Math.round(state.player.hull))} / ${state.player.maxHull}`);
    setVal('hud-shield-val', `${Math.max(0, Math.round(state.player.shield))} / ${state.player.maxShield}`);
    setVal('hud-score', state.score.toLocaleString());
    setVal('hud-combo-badge', state.comboGrade);
    setVal('hud-combo-mult', `x${state.comboMultiplier.toFixed(1)}`);
    setVal('hud-grazes-count', state.totalGrazes);

    // Bars
    const hullBar = this.overlayRoot.querySelector<HTMLElement>('#hud-hull-bar');
    if (hullBar) {
      hullBar.style.width = `${Math.max(0, Math.min(100, (state.player.hull / state.player.maxHull) * 100))}%`;
    }

    const shieldBar = this.overlayRoot.querySelector<HTMLElement>('#hud-shield-bar');
    if (shieldBar) {
      shieldBar.style.width = `${Math.max(0, Math.min(100, (state.player.shield / state.player.maxShield) * 100))}%`;
    }

    const chronoBar = this.overlayRoot.querySelector<HTMLElement>('#hud-chrono-bar');
    if (chronoBar) {
      chronoBar.style.width = `${Math.max(0, Math.min(100, (state.player.chronoEnergy / state.player.maxChronoEnergy) * 100))}%`;
    }

    const chronoStatus = this.overlayRoot.querySelector<HTMLElement>('#hud-chrono-status');
    if (chronoStatus) {
      if (state.player.isDrifting) {
        chronoStatus.textContent = 'DRIFTING';
        chronoStatus.style.color = '#f43f5e';
      } else if (state.player.chronoEnergy >= HYPERNOVA_CONFIG.CHRONO_ENERGY_COST) {
        chronoStatus.textContent = 'READY';
        chronoStatus.style.color = '#00f0ff';
      } else {
        chronoStatus.textContent = 'CHARGING';
        chronoStatus.style.color = '#64748b';
      }
    }

    // Audio intensity update
    this.audio.updateMusicIntensity(state.comboGrade, state.activeBossId !== null);
  }

  public render(state: HypernovaGameState, deltaMs: number): void {
    if (this.hitstopMs > 0) {
      this.hitstopMs -= deltaMs;
      return;
    }

    const ctx = this.ctx;
    const dt = deltaMs / 1000;

    // Decay trauma
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - HYPERNOVA_CONFIG.TRAUMA_DECAY_PER_SEC * dt);
    }

    ctx.save();
    ctx.clearRect(0, 0, HYPERNOVA_CONFIG.ARENA_WIDTH, HYPERNOVA_CONFIG.ARENA_HEIGHT);

    // Apply Screen Shake
    if (this.trauma > 0) {
      const shakePower = Math.pow(this.trauma, 2);
      const shakeX = (Math.random() * 2 - 1) * HYPERNOVA_CONFIG.MAX_SHAKE_OFFSET_PX * shakePower;
      const shakeY = (Math.random() * 2 - 1) * HYPERNOVA_CONFIG.MAX_SHAKE_OFFSET_PX * shakePower;
      const shakeRot = (Math.random() * 2 - 1) * HYPERNOVA_CONFIG.MAX_SHAKE_ROTATION_RAD * shakePower;

      ctx.translate(HYPERNOVA_CONFIG.ARENA_WIDTH / 2, HYPERNOVA_CONFIG.ARENA_HEIGHT / 2);
      ctx.rotate(shakeRot);
      ctx.translate(-HYPERNOVA_CONFIG.ARENA_WIDTH / 2 + shakeX, -HYPERNOVA_CONFIG.ARENA_HEIGHT / 2 + shakeY);
    }

    // 1. Parallax Stars
    this.renderStars(ctx, dt, state.player.vx, state.player.vy);

    // 2. Arena Boundary Glow
    ctx.strokeStyle = state.player.isDrifting ? '#f43f5e' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, HYPERNOVA_CONFIG.ARENA_WIDTH - 20, HYPERNOVA_CONFIG.ARENA_HEIGHT - 20);

    // 3. Chrono Afterimages
    this.renderAfterimages(ctx, dt);

    // 4. Decoys
    for (const decoy of state.decoys) {
      ctx.save();
      ctx.translate(decoy.x, decoy.y);
      ctx.strokeStyle = '#f43f5e';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.restore();
    }

    // 5. XP Gems & Nanites
    for (const gem of state.xpGems) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(gem.x, gem.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const cell of state.naniteCells) {
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Projectiles
    ctx.shadowBlur = 10;
    for (const proj of state.projectiles) {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      // Railgun tracer line wake
      if (proj.weaponType === 'railgun') {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(proj.x - proj.vx * 0.04, proj.y - proj.vy * 0.04);
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;

    // 7. Enemies
    for (const enemy of state.enemies) {
      this.renderEnemy(ctx, enemy);
    }

    // 8. Player Valkyrie
    this.renderPlayer(ctx, state.player);

    // 9. Particles
    this.renderParticles(ctx, dt);

    // 10. Floating Texts
    this.renderFloatingTexts(ctx, dt);

    // 11. Optional CRT Scanlines
    if (this.crtEnabled) {
      this.renderCRTOverlay(ctx);
    }

    ctx.restore();
  }

  private renderStars(ctx: CanvasRenderingContext2D, dt: number, pvx: number, pvy: number): void {
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, HYPERNOVA_CONFIG.ARENA_WIDTH, HYPERNOVA_CONFIG.ARENA_HEIGHT);

    for (const star of this.stars) {
      star.y += (star.speed - pvy * 0.04) * dt;
      star.x -= pvx * 0.04 * dt;

      if (star.y > HYPERNOVA_CONFIG.ARENA_HEIGHT) star.y = 0;
      if (star.y < 0) star.y = HYPERNOVA_CONFIG.ARENA_HEIGHT;
      if (star.x > HYPERNOVA_CONFIG.ARENA_WIDTH) star.x = 0;
      if (star.x < 0) star.x = HYPERNOVA_CONFIG.ARENA_WIDTH;

      ctx.fillStyle = star.color;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, player: typeof HYPERNOVA_CONFIG extends unknown ? any : never): void {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    const chassis = CHASSIS_REGISTRY[player.chassisId as ChassisId];

    // Shield Aura
    if (player.shield > 0) {
      ctx.strokeStyle = player.isDrifting ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ship Body
    ctx.fillStyle = chassis.accentColor;
    ctx.shadowColor = chassis.accentColor;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fill();

    // Thruster Flare
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-18 - Math.random() * 8, 0);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: any): void {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = enemy.outlineColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = enemy.outlineColor;
    ctx.shadowBlur = 10;

    if (enemy.isBoss) {
      // Big Boss Cruiser
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Boss Health Bar above head
      const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-50, -enemy.radius - 16, 100 * hpPct, 6);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(-50, -enemy.radius - 16, 100, 6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sniper telegraph targeting laser line
      if (enemy.archetype === 'helios_sniper' && enemy.sniperChargeTimer > 1.2) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(enemy.angle) * 500, Math.sin(enemy.angle) * 500);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderCRTOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < HYPERNOVA_CONFIG.ARENA_HEIGHT; y += 4) {
      ctx.fillRect(0, y, HYPERNOVA_CONFIG.ARENA_WIDTH, 1.5);
    }
  }

  private spawnSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        color,
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, scale: number): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -40,
      scale,
    });
  }

  private spawnAfterimage(x: number, y: number, rotation: number, color: string): void {
    this.afterimages.push({
      x,
      y,
      rotation,
      alpha: 0.7,
      color,
    });
  }

  private renderParticles(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.alpha -= dt * 1.5;
      ft.y += ft.vy * dt;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.round(12 * ft.scale)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private renderAfterimages(ctx: CanvasRenderingContext2D, dt: number): void {
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const img = this.afterimages[i];
      img.alpha -= dt * 2.2;
      if (img.alpha <= 0) {
        this.afterimages.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = img.alpha;
      ctx.translate(img.x, img.y);
      ctx.rotate(img.rotation);
      ctx.strokeStyle = img.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
    }
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.audio.stopMusic();
    this.container.innerHTML = '';
  }
}
