import { DungeonAudio } from './audio';
import {
  GAME_CONFIG,
  HeroClassId,
  PotionColorId,
} from './config';
import {
  HERO_CLASSES,
  POTION_COLORS,
  POTION_EFFECTS,
} from './content';
import {
  exportRunSnapshot,
  importRunSnapshot,
  loadChronicles,
  saveActiveRun,
} from './persistence';
import {
  getDailySeedNumber,
  getDailySeedString,
  hashSeedString,
} from './rng';
import {
  applyCommand,
  createInitialGameState,
  findShortestPath,
  GameCommand,
  GameState,
  getActionTickPreview,
  getHeroAttackPower,
  getHeroAttackTicks,
  getHeroDefense,
  getHeroMoveTicks,
  getPotionDisplayName,
  GridPoint,
} from './simulation';

const TILE_PX = 30;

export class TenFloorsDownUI {
  private container: HTMLElement;
  private state: GameState;
  private audio: DungeonAudio;
  private selectedClass: HeroClassId = 'vanguard';
  private pendingThrowSlot: number | null = null;
  private hoverTile: GridPoint | null = null;
  private showImportExport = false;

  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, initialState: GameState) {
    this.container = container;
    this.state = initialState;
    this.selectedClass = initialState.hero.classId;
    this.audio = new DungeonAudio();

    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.keydownHandler);

    this.renderShell();
    this.syncUI();
  }

  public getState(): GameState {
    return this.state;
  }

  public restartWithSeed(seed: number, seedLabel?: string, heroClass?: HeroClassId): void {
    const cls = heroClass ?? this.selectedClass;
    this.selectedClass = cls;
    this.pendingThrowSlot = null;
    this.state = createInitialGameState({
      seed,
      seedLabel: seedLabel ?? String(seed),
      heroClass: cls,
      debug: this.state.debugRevealAll,
    });
    saveActiveRun(this.state);
    this.syncUI();
  }

  public toggleDebug(force?: boolean): void {
    this.state.debugRevealAll =
      force !== undefined ? force : !this.state.debugRevealAll;
    this.syncUI();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    this.audio.destroy();
    this.container.innerHTML = '';
  }

  private dispatchCommand(cmd: GameCommand): void {
    if (this.state.status !== 'playing') return;

    const prevFloor = this.state.floor.floorNumber;
    const prevIdentified = Object.values(this.state.identifiedColors).filter(Boolean).length;
    const prevUpgrades = this.state.upgradesApplied;

    applyCommand(this.state, cmd);
    saveActiveRun(this.state);

    const newIdentified = Object.values(this.state.identifiedColors).filter(Boolean).length;

    if (cmd.type === 'THROW_POTION' || cmd.type === 'DRINK_POTION') {
      this.audio.playPotionShatter();
    } else if (
      newIdentified > prevIdentified ||
      this.state.upgradesApplied > prevUpgrades ||
      this.state.floor.floorNumber > prevFloor
    ) {
      this.audio.playIdentifyOrUpgrade();
    } else if (cmd.type === 'MOVE') {
      this.audio.playStep();
    } else if (cmd.type === 'USE_CLASS_ABILITY') {
      this.audio.playStrike();
    }

    if (this.state.floor.monsters.some((m) => m.telegraph !== null)) {
      this.audio.playBossTelegraph();
    }

    this.pendingThrowSlot = null;
    this.syncUI();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'd' || e.key === 'D') {
      if (e.shiftKey) {
        e.preventDefault();
        this.toggleDebug();
        return;
      }
    }

    if (e.key === 'Escape' && this.pendingThrowSlot !== null) {
      e.preventDefault();
      this.pendingThrowSlot = null;
      this.syncUI();
      return;
    }

    if (this.state.status !== 'playing') return;

    const moveMap: Record<string, { dx: number; dy: number }> = {
      ArrowUp: { dx: 0, dy: -1 },
      w: { dx: 0, dy: -1 },
      W: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      s: { dx: 0, dy: 1 },
      S: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      a: { dx: -1, dy: 0 },
      A: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
      d: { dx: 1, dy: 0 },
      D: { dx: 1, dy: 0 },
    };

    if (moveMap[e.key]) {
      e.preventDefault();
      const { dx, dy } = moveMap[e.key];
      this.dispatchCommand({ type: 'MOVE', dx, dy });
      return;
    }

    if (e.key === ' ' || e.key === '.') {
      e.preventDefault();
      this.dispatchCommand({ type: 'WAIT' });
      return;
    }

    if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      this.dispatchCommand({ type: 'USE_CLASS_ABILITY' });
      return;
    }

    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      this.dispatchCommand({ type: 'USE_ALCHEMY_DESK' });
      return;
    }

    if (e.key === '>' || e.key === 'Enter') {
      e.preventDefault();
      this.dispatchCommand({ type: 'DESCEND_STAIRS' });
      return;
    }

    if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
      e.preventDefault();
      const slotIdx = Number(e.key) - 1;
      const item = this.state.hero.inventory[slotIdx];
      if (!item) return;
      if (item.kind === 'potion') {
        const eff = this.state.colorToEffect[item.color];
        const isKnownHarmful =
          this.state.identifiedColors[item.color] &&
          POTION_EFFECTS[eff].preferThrow;
        if (isKnownHarmful) {
          this.activateThrowMode(slotIdx);
        } else {
          this.dispatchCommand({ type: 'DRINK_POTION', slotIndex: slotIdx });
        }
      } else {
        this.dispatchCommand({
          type: 'USE_SCROLL_UPGRADE',
          slotIndex: slotIdx,
          choice: 'weapon',
        });
      }
    }
  }

  private activateThrowMode(slotIdx: number): void {
    if (this.pendingThrowSlot === slotIdx) {
      // Second click throws directly at nearest visible monster if any!
      const nearest = this.findNearestVisibleMonster();
      if (nearest) {
        this.dispatchCommand({
          type: 'THROW_POTION',
          slotIndex: slotIdx,
          targetX: nearest.x,
          targetY: nearest.y,
        });
        return;
      }
      this.pendingThrowSlot = null;
      this.syncUI();
      return;
    }
    this.pendingThrowSlot = slotIdx;
    this.syncUI();
  }

  private findNearestVisibleMonster(): GridPoint | null {
    const { hero, floor } = this.state;
    const candidates = floor.monsters
      .filter(
        (m) =>
          m.hp > 0 &&
          (floor.visible[m.y]?.[m.x] || this.state.debugRevealAll) &&
          Math.max(Math.abs(m.x - hero.x), Math.abs(m.y - hero.y)) <=
            GAME_CONFIG.THROW_RANGE,
      )
      .sort(
        (a, b) =>
          Math.abs(a.x - hero.x) +
          Math.abs(a.y - hero.y) -
          (Math.abs(b.x - hero.x) + Math.abs(b.y - hero.y)),
      );
    return candidates[0] ? { x: candidates[0].x, y: candidates[0].y } : null;
  }

  private handleCanvasClick(clientX: number, clientY: number): void {
    if (this.state.status !== 'playing') return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const tx = Math.floor(((clientX - rect.left) * scaleX) / TILE_PX);
    const ty = Math.floor(((clientY - rect.top) * scaleY) / TILE_PX);

    if (
      tx < 0 ||
      tx >= this.state.floor.width ||
      ty < 0 ||
      ty >= this.state.floor.height
    ) {
      return;
    }

    if (this.pendingThrowSlot !== null) {
      const cheb = Math.max(
        Math.abs(tx - this.state.hero.x),
        Math.abs(ty - this.state.hero.y),
      );
      if (cheb <= GAME_CONFIG.THROW_RANGE) {
        this.dispatchCommand({
          type: 'THROW_POTION',
          slotIndex: this.pendingThrowSlot,
          targetX: tx,
          targetY: ty,
        });
      }
      return;
    }

    const { hero, floor } = this.state;
    if (tx === hero.x && ty === hero.y) {
      if (
        tx === floor.stairsDownPos.x &&
        ty === floor.stairsDownPos.y
      ) {
        this.dispatchCommand({ type: 'DESCEND_STAIRS' });
      } else if (
        floor.alchemyPos &&
        tx === floor.alchemyPos.x &&
        ty === floor.alchemyPos.y &&
        floor.alchemyCharges > 0
      ) {
        this.dispatchCommand({ type: 'USE_ALCHEMY_DESK' });
      } else {
        this.dispatchCommand({ type: 'WAIT' });
      }
      return;
    }

    const dx = tx - hero.x;
    const dy = ty - hero.y;
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx === 0 || dy === 0)) {
      this.dispatchCommand({ type: 'MOVE', dx, dy });
      return;
    }

    // If user clicked a monster adjacent diagonally or clicked a distant tile, step toward it via BFS
    const path = findShortestPath(
      floor.tiles,
      { x: hero.x, y: hero.y },
      { x: tx, y: ty },
    );
    if (path && path.length >= 2) {
      const nextStep = path[1];
      this.dispatchCommand({
        type: 'MOVE',
        dx: nextStep.x - hero.x,
        dy: nextStep.y - hero.y,
      });
    } else {
      // Fallback step in cardinal direction
      if (Math.abs(dx) >= Math.abs(dy)) {
        this.dispatchCommand({ type: 'MOVE', dx: Math.sign(dx), dy: 0 });
      } else {
        this.dispatchCommand({ type: 'MOVE', dx: 0, dy: Math.sign(dy) });
      }
    }
  }

  private renderShell(): void {
    const dailyStr = getDailySeedString();
    this.container.innerHTML = `
      <style>
        .tfd-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #090d16;
          color: #e2e8f0;
          min-height: 100%;
          padding: 12px;
          box-sizing: border-box;
          user-select: none;
        }
        .tfd-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 10px;
        }
        .tfd-title-block h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tfd-title-block p {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: #94a3b8;
        }
        .tfd-seed-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .tfd-btn {
          background: #1e293b;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .tfd-btn:hover:not(:disabled) {
          background: #334155;
          border-color: #10b981;
        }
        .tfd-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .tfd-btn-primary {
          background: #059669;
          border-color: #10b981;
          color: #ffffff;
        }
        .tfd-btn-primary:hover:not(:disabled) {
          background: #10b981;
        }
        .tfd-btn-amber {
          background: #b45309;
          border-color: #f59e0b;
          color: #ffffff;
        }
        .tfd-btn-danger {
          background: #991b1b;
          border-color: #ef4444;
          color: #ffffff;
        }
        .tfd-input {
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 0.78rem;
          width: 115px;
        }
        .tfd-class-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .tfd-class-card {
          flex: 1 1 220px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .tfd-class-card.active {
          border-color: #10b981;
          background: #0f2922;
        }
        .tfd-class-card h3 {
          margin: 0 0 3px;
          font-size: 0.86rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tfd-class-card p {
          margin: 0;
          font-size: 0.73rem;
          color: #94a3b8;
          line-height: 1.3;
        }
        .tfd-hud-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
          font-size: 0.82rem;
        }
        .tfd-stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #1e293b;
          padding: 4px 9px;
          border-radius: 6px;
          font-weight: 600;
        }
        .tfd-tick-banner {
          background: #172033;
          border-left: 4px solid #38bdf8;
          border-radius: 6px;
          padding: 7px 12px;
          margin-bottom: 10px;
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .tfd-tick-banner.warning {
          background: #2c1618;
          border-left-color: #ef4444;
          color: #fecaca;
        }
        .tfd-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr);
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .tfd-main-grid {
            grid-template-columns: 1fr;
          }
        }
        .tfd-canvas-wrap {
          background: #05080f;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .tfd-canvas {
          width: 100%;
          max-width: 780px;
          height: auto;
          aspect-ratio: 26 / 18;
          border-radius: 6px;
          cursor: pointer;
          image-rendering: crisp-edges;
          background: #070a12;
        }
        .tfd-canvas-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
          font-size: 0.74rem;
          color: #94a3b8;
          justify-content: center;
        }
        .tfd-side-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tfd-card {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 10px 12px;
        }
        .tfd-card h2 {
          margin: 0 0 8px;
          font-size: 0.88rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #38bdf8;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tfd-controls-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
          max-width: 210px;
        }
        .tfd-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .tfd-inv-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tfd-inv-slot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 0.78rem;
        }
        .tfd-journal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        .tfd-journal-cell {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 0.74rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .tfd-vial-dot {
          width: 12px;
          height: 16px;
          border-radius: 3px 3px 6px 6px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.45);
        }
        .tfd-log-box {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 6px;
          padding: 8px;
          height: 135px;
          overflow-y: auto;
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.74rem;
          line-height: 1.45;
          color: #cbd5e1;
        }
        .tfd-modal-overlay {
          margin-top: 10px;
          background: #141c2f;
          border: 2px solid #ef4444;
          border-radius: 10px;
          padding: 14px;
        }
        .tfd-modal-overlay.victory {
          border-color: #10b981;
          background: #0d2621;
        }
      </style>

      <div class="tfd-root">
        <header class="tfd-header">
          <div class="tfd-title-block">
            <h1>⚗ TEN FLOORS DOWN <span style="font-size:0.75rem;color:#94a3b8;font-weight:500;">Shattered Alchemy Roguelike</span></h1>
            <p>10 Procedural Floors • 6 Shuffled Potion Colors • Action-Cost Tick Clock • Permadeath Post-Mortem</p>
          </div>
          <div class="tfd-seed-controls">
            <button class="tfd-btn tfd-btn-primary" id="tfd-daily-btn" title="Launch Today's Daily Seed Run">
              📅 Daily Seed (${dailyStr})
            </button>
            <input type="text" class="tfd-input" id="tfd-seed-input" placeholder="Seed / Word" value="${this.state.seedLabel}" />
            <button class="tfd-btn" id="tfd-new-seed-btn">🎲 Launch Seed</button>
            <button class="tfd-btn" id="tfd-debug-btn">👁 Debug [Shift+D]</button>
            <button class="tfd-btn" id="tfd-mute-btn">🔊 Audio</button>
            <button class="tfd-btn" id="tfd-io-btn">💾 Save/JSON</button>
          </div>
        </header>

        <section class="tfd-class-bar" id="tfd-class-bar"></section>

        <section class="tfd-hud-strip" id="tfd-hud-strip"></section>

        <section class="tfd-tick-banner" id="tfd-tick-banner"></section>

        <div id="tfd-io-drawer" style="display:none;margin-bottom:10px;" class="tfd-card">
          <h2>Save Snapshot Export / Import</h2>
          <textarea id="tfd-io-textarea" style="width:100%;height:70px;background:#090d16;color:#cbd5e1;border:1px solid #334155;border-radius:6px;font-size:0.74rem;padding:6px;"></textarea>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button class="tfd-btn tfd-btn-primary" id="tfd-export-btn">Copy Current Snapshot</button>
            <button class="tfd-btn tfd-btn-amber" id="tfd-import-btn">Load Snapshot JSON</button>
          </div>
        </div>

        <div class="tfd-main-grid">
          <div class="tfd-canvas-wrap">
            <canvas
              id="tfd-canvas"
              class="tfd-canvas"
              width="${GAME_CONFIG.GRID_WIDTH * TILE_PX}"
              height="${GAME_CONFIG.GRID_HEIGHT * TILE_PX}"
            ></canvas>
            <div class="tfd-canvas-legend">
              <span><strong>WASD / Arrows / Tap</strong>: Move or Melee Attack</span>
              <span><strong>Space</strong>: Wait (10t)</span>
              <span><strong>Q</strong>: Class Ability</span>
              <span><strong>E</strong>: Alchemy Desk (⚗)</span>
              <span><strong>&gt; / Enter</strong>: Descend Stairs</span>
            </div>
            <div id="tfd-epitaph-container" style="width:100%;"></div>
          </div>

          <div class="tfd-side-panel">
            <div class="tfd-card">
              <h2>
                <span>Tactical Actions & Movement</span>
                <span id="tfd-throw-status-badge" style="font-size:0.74rem;color:#f59e0b;"></span>
              </h2>
              <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
                <div class="tfd-controls-grid">
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-n">▲ N</button>
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-w">◀ W</button>
                  <button class="tfd-btn" id="tfd-move-wait" title="Wait 10 Ticks">⏳</button>
                  <button class="tfd-btn" id="tfd-move-e">E ▶</button>
                  <div></div>
                  <button class="tfd-btn" id="tfd-move-s">▼ S</button>
                  <div></div>
                </div>
                <div class="tfd-action-row" style="flex:1;flex-direction:column;align-items:stretch;">
                  <button class="tfd-btn tfd-btn-amber" id="tfd-ability-btn"></button>
                  <button class="tfd-btn" id="tfd-alchemy-btn"></button>
                  <button class="tfd-btn tfd-btn-primary" id="tfd-descend-btn"></button>
                </div>
              </div>
            </div>

            <div class="tfd-card">
              <h2>
                <span>Alchemical Pack & Scrolls (<span id="tfd-inv-count">0</span>/6)</span>
                <span style="font-size:0.7rem;color:#94a3b8;">Keys [1-6]</span>
              </h2>
              <div class="tfd-inv-list" id="tfd-inv-list"></div>
            </div>

            <div class="tfd-card">
              <h2>
                <span>Seed Potion Color Journal</span>
                <span id="tfd-journal-progress" style="font-size:0.74rem;color:#10b981;"></span>
              </h2>
              <div class="tfd-journal-grid" id="tfd-journal-grid"></div>
            </div>

            <div class="tfd-card">
              <h2>Combat & Alchemy Chronicle</h2>
              <div class="tfd-log-box" id="tfd-log-box"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#tfd-canvas') as HTMLCanvasElement;
    const isJsdom =
      typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
    if (!isJsdom && this.canvas && typeof this.canvas.getContext === 'function') {
      try {
        this.ctx = this.canvas.getContext('2d');
      } catch {
        this.ctx = null;
      }
    }

    this.canvas.addEventListener('click', (e) => {
      this.handleCanvasClick(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const tx = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_PX);
      const ty = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_PX);
      if (
        !this.hoverTile ||
        this.hoverTile.x !== tx ||
        this.hoverTile.y !== ty
      ) {
        this.hoverTile = { x: tx, y: ty };
        this.drawDungeonCanvas();
      }
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverTile = null;
      this.drawDungeonCanvas();
    });

    this.container.querySelector('#tfd-daily-btn')?.addEventListener('click', () => {
      const ds = getDailySeedString();
      const seedNum = getDailySeedNumber(ds);
      const seedInput = this.container.querySelector('#tfd-seed-input') as HTMLInputElement;
      if (seedInput) seedInput.value = `DAILY-${ds}`;
      this.restartWithSeed(seedNum, `DAILY-${ds}`, this.selectedClass);
    });

    this.container.querySelector('#tfd-new-seed-btn')?.addEventListener('click', () => {
      const seedInput = this.container.querySelector('#tfd-seed-input') as HTMLInputElement;
      const raw = seedInput?.value.trim() || String(Math.floor(Math.random() * 900000 + 100000));
      const numeric = /^\d+$/.test(raw) ? Number(raw) : hashSeedString(raw);
      this.restartWithSeed(numeric, raw, this.selectedClass);
    });

    this.container.querySelector('#tfd-debug-btn')?.addEventListener('click', () => {
      this.toggleDebug();
    });

    this.container.querySelector('#tfd-mute-btn')?.addEventListener('click', () => {
      const nextMute = !this.audio.isMuted();
      this.audio.setMuted(nextMute);
      const btn = this.container.querySelector('#tfd-mute-btn') as HTMLButtonElement;
      if (btn) btn.textContent = nextMute ? '🔇 Muted' : '🔊 Audio';
    });

    this.container.querySelector('#tfd-io-btn')?.addEventListener('click', () => {
      this.showImportExport = !this.showImportExport;
      const drawer = this.container.querySelector('#tfd-io-drawer') as HTMLElement;
      const area = this.container.querySelector('#tfd-io-textarea') as HTMLTextAreaElement;
      if (drawer) {
        drawer.style.display = this.showImportExport ? 'block' : 'none';
      }
      if (this.showImportExport && area) {
        area.value = exportRunSnapshot(this.state);
      }
    });

    this.container.querySelector('#tfd-export-btn')?.addEventListener('click', () => {
      const area = this.container.querySelector('#tfd-io-textarea') as HTMLTextAreaElement;
      if (area) {
        area.value = exportRunSnapshot(this.state);
        area.select();
      }
    });

    this.container.querySelector('#tfd-import-btn')?.addEventListener('click', () => {
      const area = this.container.querySelector('#tfd-io-textarea') as HTMLTextAreaElement;
      if (!area) return;
      const imported = importRunSnapshot(area.value);
      if (imported) {
        this.state = imported;
        this.selectedClass = imported.hero.classId;
        saveActiveRun(this.state);
        this.syncUI();
      }
    });

    this.container.querySelector('#tfd-move-n')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'MOVE', dx: 0, dy: -1 });
    });
    this.container.querySelector('#tfd-move-s')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'MOVE', dx: 0, dy: 1 });
    });
    this.container.querySelector('#tfd-move-w')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'MOVE', dx: -1, dy: 0 });
    });
    this.container.querySelector('#tfd-move-e')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'MOVE', dx: 1, dy: 0 });
    });
    this.container.querySelector('#tfd-move-wait')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'WAIT' });
    });
    this.container.querySelector('#tfd-ability-btn')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'USE_CLASS_ABILITY' });
    });
    this.container.querySelector('#tfd-alchemy-btn')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'USE_ALCHEMY_DESK' });
    });
    this.container.querySelector('#tfd-descend-btn')?.addEventListener('click', () => {
      this.dispatchCommand({ type: 'DESCEND_STAIRS' });
    });
  }

  private syncUI(): void {
    this.renderClassSelector();
    this.renderHudStrip();
    this.renderTickPreviewBanner();
    this.renderActionButtons();
    this.renderInventoryList();
    this.renderPotionJournal();
    this.renderCombatLog();
    this.renderEpitaphModal();
    this.drawDungeonCanvas();
  }

  private renderClassSelector(): void {
    const bar = this.container.querySelector('#tfd-class-bar');
    if (!bar) return;

    const classes: HeroClassId[] = ['vanguard', 'rogue', 'alchemist'];
    bar.innerHTML = classes
      .map((cid) => {
        const def = HERO_CLASSES[cid];
        const isActive = this.state.hero.classId === cid;
        return `
          <div class="tfd-class-card ${isActive ? 'active' : ''}" data-class-id="${cid}">
            <h3 style="color:${def.accentColor}">
              <span>[${def.glyph}] ${def.name}</span>
              <span style="font-size:0.72rem;color:#cbd5e1;">${isActive ? '● ACTIVE RUN' : 'Switch & Restart'}</span>
            </h3>
            <p>${def.passiveDescription}</p>
          </div>
        `;
      })
      .join('');

    bar.querySelectorAll('.tfd-class-card').forEach((el) => {
      el.addEventListener('click', () => {
        const cid = el.getAttribute('data-class-id') as HeroClassId;
        if (cid && cid !== this.state.hero.classId) {
          this.restartWithSeed(this.state.seed, this.state.seedLabel, cid);
        }
      });
    });
  }

  private renderHudStrip(): void {
    const strip = this.container.querySelector('#tfd-hud-strip');
    if (!strip) return;

    const { hero, floor } = this.state;
    const hpPct = Math.max(0, Math.min(100, Math.round((hero.hp / hero.maxHp) * 100)));
    const hpColor = hpPct > 50 ? '#10b981' : hpPct > 25 ? '#f59e0b' : '#ef4444';

    const statusTags: string[] = [];
    if (hero.invisibleTicks > 0) {
      statusTags.push(
        `<span class="tfd-stat-pill" style="background:#312e81;color:#c7d2fe;">👻 Shadow Veil (${hero.invisibleTicks}t — 2x Crit!)</span>`,
      );
    }
    if (hero.burningTicks > 0) {
      statusTags.push(
        `<span class="tfd-stat-pill" style="background:#7f1d1d;color:#fecaca;">🔥 Burning (${hero.burningTicks}t)</span>`,
      );
    }
    if (hero.poisonedTicks > 0) {
      statusTags.push(
        `<span class="tfd-stat-pill" style="background:#365314;color:#d9f99d;">☠ Poisoned (${hero.poisonedTicks}t)</span>`,
      );
    }
    if (hero.chilledTicks > 0) {
      statusTags.push(
        `<span class="tfd-stat-pill" style="background:#0c4a6e;color:#bae6fd;">❄ Chilled (${hero.chilledTicks}t)</span>`,
      );
    }
    if (hero.iceArmorHp > 0) {
      statusTags.push(
        `<span class="tfd-stat-pill" style="background:#0e7490;color:#cffafe;">🛡 Ice Shield +${hero.iceArmorHp}</span>`,
      );
    }

    strip.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
        <span class="tfd-stat-pill" style="background:#064e3b;color:#6ee7b7;">
          🪜 Floor ${floor.floorNumber} / ${GAME_CONFIG.MAX_FLOORS}
        </span>
        <span class="tfd-stat-pill">
          ⏱ Tick ${this.state.currentTick} (Turn ${this.state.turnsTaken})
        </span>
        <span class="tfd-stat-pill" style="border:1px solid ${hpColor};">
          ❤️ HP: <strong style="color:${hpColor}">${hero.hp} / ${hero.maxHp}</strong>
        </span>
        <span class="tfd-stat-pill">
          ⚔️ ATK: <strong>${getHeroAttackPower(hero)}</strong> (${hero.weapon.name}${hero.weaponUpgrades > 0 ? ` +${hero.weaponUpgrades}` : ''})
        </span>
        <span class="tfd-stat-pill">
          🛡 DEF: <strong>${getHeroDefense(hero)}</strong> (${hero.armor.name}${hero.armorUpgrades > 0 ? ` +${hero.armorUpgrades}` : ''})
        </span>
        <span class="tfd-stat-pill">
          💀 Slain: ${this.state.monstersSlain}
        </span>
        ${statusTags.join('')}
      </div>
      <div style="font-size:0.75rem;color:#94a3b8;">
        Seed: <strong>${this.state.seedLabel}</strong> ${this.state.debugRevealAll ? '<span style="color:#f59e0b;">[DEBUG ON]</span>' : ''}
      </div>
    `;
  }

  private renderTickPreviewBanner(): void {
    const banner = this.container.querySelector('#tfd-tick-banner');
    if (!banner) return;

    const preview = getActionTickPreview(this.state);
    const hasDoubleAttack = preview.doubleTurnMonstersOnAttack.length > 0;
    const bossTelegraphing = this.state.floor.monsters.find((m) => m.hp > 0 && m.telegraph);

    if (bossTelegraphing && bossTelegraphing.telegraph) {
      banner.className = 'tfd-tick-banner warning';
      banner.innerHTML = `
        <div>
          <strong>🚨 BOSS TELEGRAPH ACTIVE:</strong> ${bossTelegraphing.name} is charging
          <u>${bossTelegraphing.telegraph.name}</u> (${bossTelegraphing.telegraph.damage} dmg)!
          Step out of the pulsing red tiles or Stun/Freeze the boss immediately!
        </div>
        <div style="font-weight:700;">Move: +${preview.moveTicks}t | Strike: +${preview.attackTicks}t</div>
      `;
      return;
    }

    if (hasDoubleAttack) {
      banner.className = 'tfd-tick-banner warning';
      banner.innerHTML = `
        <div>
          <strong>⚠ ACTION-COST DOUBLE-TURN WARNING:</strong> Swinging your weapon (+${preview.attackTicks} ticks)
          allows <u>${preview.doubleTurnMonstersOnAttack.join(', ')}</u> to act TWICE before your next turn!
        </div>
        <div>Move: <strong>+${preview.moveTicks}t</strong> | Strike: <strong>+${preview.attackTicks}t</strong> | Ability: <strong>+${preview.abilityTicks}t</strong></div>
      `;
    } else {
      banner.className = 'tfd-tick-banner';
      banner.innerHTML = `
        <div>
          <strong>⏱ Action-Cost Scheduler:</strong>
          Move = <strong>+${preview.moveTicks} ticks</strong> •
          Weapon Strike = <strong>+${preview.attackTicks} ticks</strong> •
          Class Ability = <strong>+${preview.abilityTicks} ticks</strong>
        </div>
        <div style="color:#94a3b8;">No enemy double-turn on next strike</div>
      `;
    }
  }

  private renderActionButtons(): void {
    const { hero, floor } = this.state;
    const classDef = HERO_CLASSES[hero.classId];

    const abilityBtn = this.container.querySelector('#tfd-ability-btn') as HTMLButtonElement;
    if (abilityBtn) {
      if (hero.abilityCooldownTicks > 0) {
        abilityBtn.textContent = `⚡ ${classDef.abilityName} (CD: ${hero.abilityCooldownTicks}t)`;
        abilityBtn.disabled = true;
      } else {
        abilityBtn.textContent = `⚡ [Q] ${classDef.abilityName}${hero.abilityUpgrades > 0 ? ` +${hero.abilityUpgrades}` : ''} (${classDef.abilityCostTicks}t)`;
        abilityBtn.disabled = this.state.status !== 'playing';
      }
    }

    const alchemyBtn = this.container.querySelector('#tfd-alchemy-btn') as HTMLButtonElement;
    if (alchemyBtn) {
      const nearAlchemy =
        floor.alchemyPos !== null &&
        Math.max(
          Math.abs(hero.x - floor.alchemyPos.x),
          Math.abs(hero.y - floor.alchemyPos.y),
        ) <= 1;
      alchemyBtn.textContent = `⚗ [E] Test Vial at Alchemy Desk (${floor.alchemyCharges} left)`;
      alchemyBtn.disabled =
        this.state.status !== 'playing' || !nearAlchemy || floor.alchemyCharges <= 0;
    }

    const descendBtn = this.container.querySelector('#tfd-descend-btn') as HTMLButtonElement;
    if (descendBtn) {
      const onStairs =
        hero.x === floor.stairsDownPos.x && hero.y === floor.stairsDownPos.y;
      const bossAlive = floor.monsters.some((m) => m.hp > 0 && m.isBoss);
      if (floor.floorNumber === GAME_CONFIG.MAX_FLOORS) {
        descendBtn.textContent = bossAlive
          ? `🔒 Defeat The Abyssal Core to Unlock Exit`
          : `🏆 [>] Ascend Sanctuary Stairs (CLAIM VICTORY!)`;
      } else {
        descendBtn.textContent = `🪜 [>] Descend to Floor ${floor.floorNumber + 1}`;
      }
      descendBtn.disabled = this.state.status !== 'playing' || !onStairs || bossAlive;
    }

    const throwBadge = this.container.querySelector('#tfd-throw-status-badge');
    if (throwBadge) {
      if (this.pendingThrowSlot !== null) {
        throwBadge.textContent = `🎯 Click any dungeon tile (Range ${GAME_CONFIG.THROW_RANGE}) to THROW vial! [Esc to cancel]`;
      } else {
        throwBadge.textContent = '';
      }
    }
  }

  private renderInventoryList(): void {
    const list = this.container.querySelector('#tfd-inv-list');
    const countEl = this.container.querySelector('#tfd-inv-count');
    if (!list) return;

    const { inventory } = this.state.hero;
    if (countEl) countEl.textContent = String(inventory.length);

    if (inventory.length === 0) {
      list.innerHTML = `<div style="color:#64748b;font-size:0.76rem;padding:6px;">Pack is empty. Step onto dungeon vials or scrolls to pick them up.</div>`;
      return;
    }

    list.innerHTML = inventory
      .map((item, idx) => {
        if (item.kind === 'potion') {
          const colorDef = POTION_COLORS.find((c) => c.id === item.color)!;
          const disp = getPotionDisplayName(this.state, item.color);
          const effDef = POTION_EFFECTS[disp.effect];
          const isThrowingThis = this.pendingThrowSlot === idx;
          const subText = disp.identified
            ? effDef.preferThrow
              ? `Throw (3x3): ${effDef.throwSummary}`
              : `Drink: ${effDef.drinkSummary}`
            : `${colorDef.liquidDesc} — Drink, Throw, or test at Alchemy Desk (⚗)`;

          return `
            <div class="tfd-inv-slot">
              <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
                <span class="tfd-vial-dot" style="background:${colorDef.hex};"></span>
                <div style="min-width:0;">
                  <div style="font-weight:700;color:${disp.identified ? '#f8fafc' : '#fde68a'};">
                    [${idx + 1}] ${disp.title}
                  </div>
                  <div style="font-size:0.7rem;color:#94a3b8;">${subText}</div>
                </div>
              </div>
              <div style="display:flex;gap:5px;">
                <button class="tfd-btn" data-drink-slot="${idx}" title="Drink Vial (10 ticks)">
                  🧪 Drink
                </button>
                <button class="tfd-btn ${isThrowingThis ? 'tfd-btn-amber' : ''}" data-throw-slot="${idx}" title="Select tile (or click twice to throw at nearest foe)">
                  🎯 ${isThrowingThis ? 'Throw Now' : 'Throw'}
                </button>
              </div>
            </div>
          `;
        }

        return `
          <div class="tfd-inv-slot" style="border-color:#f59e0b;">
            <div>
              <div style="font-weight:700;color:#fcd34d;">[${idx + 1}] 📜 Scroll of Upgrade</div>
              <div style="font-size:0.7rem;color:#94a3b8;">Permanently empower Weapon, Armor, or Class Ability:</div>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="tfd-btn tfd-btn-amber" data-upg-slot="${idx}" data-upg-choice="weapon">+Weapon</button>
              <button class="tfd-btn tfd-btn-primary" data-upg-slot="${idx}" data-upg-choice="armor">+Armor</button>
              <button class="tfd-btn" data-upg-slot="${idx}" data-upg-choice="ability">+Ability</button>
            </div>
          </div>
        `;
      })
      .join('');

    list.querySelectorAll('[data-drink-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIndex = Number(btn.getAttribute('data-drink-slot'));
        this.dispatchCommand({ type: 'DRINK_POTION', slotIndex });
      });
    });

    list.querySelectorAll('[data-throw-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIndex = Number(btn.getAttribute('data-throw-slot'));
        this.activateThrowMode(slotIndex);
      });
    });

    list.querySelectorAll('[data-upg-slot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIndex = Number(btn.getAttribute('data-upg-slot'));
        const choice = btn.getAttribute('data-upg-choice') as
          | 'weapon'
          | 'armor'
          | 'ability';
        this.dispatchCommand({
          type: 'USE_SCROLL_UPGRADE',
          slotIndex,
          choice,
        });
      });
    });
  }

  private renderPotionJournal(): void {
    const grid = this.container.querySelector('#tfd-journal-grid');
    const prog = this.container.querySelector('#tfd-journal-progress');
    if (!grid) return;

    const identifiedCount = Object.values(this.state.identifiedColors).filter(Boolean).length;
    if (prog) {
      prog.textContent = `${identifiedCount} / 6 Identified`;
    }

    grid.innerHTML = POTION_COLORS.map((c) => {
      const disp = getPotionDisplayName(this.state, c.id);
      const effDef = POTION_EFFECTS[disp.effect];
      return `
        <div class="tfd-journal-cell">
          <span class="tfd-vial-dot" style="background:${c.hex};"></span>
          <div style="min-width:0;">
            <div style="font-weight:700;color:${disp.identified ? '#f8fafc' : '#94a3b8'};">
              ${c.label}: ${disp.identified ? `<span style="color:${effDef.preferThrow ? '#fca5a5' : '#6ee7b7'}">${effDef.shortName}</span>` : '??? Unknown'}
            </div>
            <div style="font-size:0.68rem;color:#64748b;">
              ${disp.identified ? (effDef.preferThrow ? '⚔ Throw (3x3 AoE)' : '✨ Drink (Self Buff)') : 'Unidentified'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private renderCombatLog(): void {
    const box = this.container.querySelector('#tfd-log-box');
    if (!box) return;

    const recent = this.state.combatLog.slice(-18);
    box.innerHTML = recent
      .map((line) => {
        let color = '#cbd5e1';
        if (line.includes('IDENTIFIED') || line.includes('Scroll of Upgrade')) {
          color = '#6ee7b7';
        } else if (
          line.includes('HAZARD') ||
          line.includes('WARNING') ||
          line.includes('BOSS SLAM') ||
          line.includes('PERMADEATH')
        ) {
          color = '#fca5a5';
        } else if (line.includes('AMBUSH CRIT') || line.includes('VICTORY')) {
          color = '#fde047';
        }
        return `<div style="color:${color};margin-bottom:2px;">${line}</div>`;
      })
      .join('');
    box.scrollTop = box.scrollHeight;
  }

  private renderEpitaphModal(): void {
    const host = this.container.querySelector('#tfd-epitaph-container');
    if (!host) return;

    if (this.state.status === 'playing' || !this.state.epitaph) {
      host.innerHTML = '';
      return;
    }

    const ep = this.state.epitaph;
    const isVictory = ep.outcome === 'victory';
    const chronicles = loadChronicles().slice(0, 5);

    const fullPotionTableHtml = POTION_COLORS.map((c) => {
      const eff = POTION_EFFECTS[this.state.colorToEffect[c.id]];
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:#0f172a;padding:3px 7px;border-radius:5px;font-size:0.73rem;">
        <span style="width:9px;height:9px;border-radius:50%;background:${c.hex};display:inline-block;"></span>
        <strong>${c.label}:</strong> ${eff.name}
      </span>`;
    }).join(' ');

    host.innerHTML = `
      <div class="tfd-modal-overlay ${isVictory ? 'victory' : ''}">
        <h2 style="margin:0 0 6px;font-size:1.1rem;color:${isVictory ? '#34d399' : '#f87171'};">
          ${isVictory ? '🏆 VICTORY — THE ABYSSAL CORE CONQUERED!' : '💀 PERMADEATH EPITAPH — CAUSE OF DEATH RECAP'}
        </h2>
        <p style="margin:0 0 8px;font-size:0.84rem;color:#e2e8f0;">
          <strong>${ep.heroClassName}</strong> on <strong>Floor ${ep.floorReached}</strong> (Seed: <code>${ep.seedLabel}</code>) •
          Outcome: <strong>${ep.killedBy}</strong> •
          Total Time: <strong>${ep.totalTicks} ticks</strong> (${ep.turnsTaken} turns) •
          Monsters Slain: <strong>${ep.monstersSlain}</strong> •
          Potions Identified: <strong>${ep.potionsIdentified}/6</strong>
        </p>

        <div style="background:#090d16;border:1px solid #334155;border-radius:7px;padding:8px 10px;margin-bottom:8px;">
          <div style="font-size:0.75rem;font-weight:700;color:#38bdf8;margin-bottom:4px;">
            LAST 5 TURNS COMBAT LOG REPLAY:
          </div>
          ${ep.lastFiveTurns.map((t) => `<div style="font-size:0.74rem;font-family:monospace;color:#cbd5e1;">• ${t}</div>`).join('')}
        </div>

        <div style="background:#1e293b;border-left:4px solid #f59e0b;padding:7px 10px;border-radius:5px;font-size:0.78rem;margin-bottom:8px;">
          <strong>💡 Tactical Post-Mortem Lesson:</strong> ${ep.tacticalLesson}
        </div>

        <div style="margin-bottom:10px;">
          <div style="font-size:0.74rem;color:#94a3b8;margin-bottom:4px;">Seed <code>${ep.seedLabel}</code> True Potion Table:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${fullPotionTableHtml}</div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
          <button class="tfd-btn tfd-btn-primary" id="tfd-retry-same-seed">🔄 Retry Same Seed (${ep.seedLabel})</button>
          <button class="tfd-btn tfd-btn-amber" id="tfd-play-new-random">🎲 New Random Seed</button>
        </div>

        ${
          chronicles.length > 0
            ? `<div style="font-size:0.72rem;color:#94a3b8;border-top:1px solid #334155;padding-top:6px;">
                <strong>Hall of Chronicles (Recent Runs):</strong>
                ${chronicles
                  .map(
                    (c) =>
                      `<div>• [${c.outcome.toUpperCase()}] ${c.heroClassName} — Floor ${c.floorReached} (${c.killedBy}) [Seed: ${c.seedLabel}]</div>`,
                  )
                  .join('')}
              </div>`
            : ''
        }
      </div>
    `;

    host.querySelector('#tfd-retry-same-seed')?.addEventListener('click', () => {
      this.restartWithSeed(this.state.seed, this.state.seedLabel, this.selectedClass);
    });
    host.querySelector('#tfd-play-new-random')?.addEventListener('click', () => {
      const nextSeed = Math.floor(Math.random() * 900000 + 100000);
      this.restartWithSeed(nextSeed, String(nextSeed), this.selectedClass);
    });
  }

  private drawDungeonCanvas(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const { floor, hero, debugRevealAll } = this.state;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Collect boss telegraphed tiles for quick lookup
    const telegraphSet = new Set<string>();
    for (const mon of floor.monsters) {
      if (mon.hp > 0 && mon.telegraph) {
        for (const t of mon.telegraph.tiles) {
          telegraphSet.add(`${t.x},${t.y}`);
        }
      }
    }

    // Render tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const px = x * TILE_PX;
        const py = y * TILE_PX;
        const vis = floor.visible[y][x] || debugRevealAll;
        const exp = floor.explored[y][x] || debugRevealAll;
        const tile = floor.tiles[y][x];

        if (!exp) {
          ctx.fillStyle = '#05070e';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
          continue;
        }

        if (tile === 'wall') {
          ctx.fillStyle = vis ? '#1e293b' : '#0f172a';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
          ctx.strokeStyle = vis ? '#334155' : '#1e293b';
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_PX - 1, TILE_PX - 1);
        } else {
          ctx.fillStyle = vis ? '#0f172a' : '#090d16';
          ctx.fillRect(px, py, TILE_PX, TILE_PX);
          ctx.strokeStyle = vis ? '#1e293b' : '#111827';
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_PX - 1, TILE_PX - 1);

          if (tile === 'door') {
            ctx.fillStyle = vis ? '#92400e' : '#451a03';
            ctx.fillRect(px + 4, py + 4, TILE_PX - 8, TILE_PX - 8);
          } else if (tile === 'stairs_up') {
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('<', px + TILE_PX / 2, py + TILE_PX / 2);
          } else if (tile === 'stairs_down') {
            ctx.fillStyle = '#10b981';
            ctx.fillRect(px + 3, py + 3, TILE_PX - 6, TILE_PX - 6);
            ctx.fillStyle = '#052e16';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('>', px + TILE_PX / 2, py + TILE_PX / 2);
          } else if (tile === 'alchemy_desk') {
            ctx.fillStyle = floor.alchemyCharges > 0 ? '#7e22ce' : '#334155';
            ctx.fillRect(px + 3, py + 3, TILE_PX - 6, TILE_PX - 6);
            ctx.fillStyle = '#f3e8ff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚗', px + TILE_PX / 2, py + TILE_PX / 2);
          }
        }

        // Tile hazards (Fire, Frost, Caustic Gas)
        const hazard = floor.hazards[y][x];
        if (hazard && vis) {
          if (hazard.type === 'fire') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.38)';
          } else if (hazard.type === 'frost') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          } else {
            ctx.fillStyle = 'rgba(132, 204, 22, 0.36)';
          }
          ctx.fillRect(px + 2, py + 2, TILE_PX - 4, TILE_PX - 4);
        }

        // Boss Telegraph Overlay
        if (telegraphSet.has(`${x},${y}`)) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.42)';
          ctx.fillRect(px + 1, py + 1, TILE_PX - 2, TILE_PX - 2);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, TILE_PX - 4, TILE_PX - 4);
          ctx.lineWidth = 1;
        }
      }
    }

    // Ground Items
    for (const item of floor.groundItems) {
      const vis = floor.visible[item.y]?.[item.x] || debugRevealAll;
      const exp = floor.explored[item.y]?.[item.x] || debugRevealAll;
      if (!vis && !exp) continue;

      const cx = item.x * TILE_PX + TILE_PX / 2;
      const cy = item.y * TILE_PX + TILE_PX / 2;

      if (item.kind === 'potion') {
        const cDef = POTION_COLORS.find((c) => c.id === item.color)!;
        ctx.fillStyle = cDef.hex;
        ctx.beginPath();
        ctx.arc(cx, cy + 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(cx - 2, cy - 8, 4, 4);
      } else if (item.kind === 'scroll_upgrade') {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(cx - 7, cy - 6, 14, 12);
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('UP', cx, cy);
      } else if (item.kind === 'weapon') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔', cx, cy);
      } else if (item.kind === 'armor') {
        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡', cx, cy);
      }
    }

    // Monsters
    for (const mon of floor.monsters) {
      if (mon.hp <= 0) continue;
      const vis = floor.visible[mon.y]?.[mon.x] || debugRevealAll;
      if (!vis) continue;

      const px = mon.x * TILE_PX;
      const py = mon.y * TILE_PX;
      const cx = px + TILE_PX / 2;
      const cy = py + TILE_PX / 2;

      ctx.fillStyle = mon.isBoss ? '#450a0a' : '#1e1b4b';
      ctx.beginPath();
      ctx.arc(cx, cy, mon.isBoss ? 12 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = mon.color;
      ctx.lineWidth = mon.isBoss ? 2.5 : 1.5;
      ctx.stroke();
      ctx.lineWidth = 1;

      ctx.fillStyle = mon.color;
      ctx.font = `bold ${mon.isBoss ? 15 : 13}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mon.glyph, cx, cy);

      // Monster HP bar
      const hpRatio = Math.max(0, mon.hp / mon.maxHp);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(px + 3, py + 2, TILE_PX - 6, 4);
      ctx.fillStyle = mon.isBoss ? '#f43f5e' : '#ef4444';
      ctx.fillRect(px + 3, py + 2, Math.round((TILE_PX - 6) * hpRatio), 4);

      if (mon.stunnedTicks > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('STUN', cx, py + TILE_PX - 3);
      }
    }

    // Hero
    const hpx = hero.x * TILE_PX;
    const hpy = hero.y * TILE_PX;
    const hcx = hpx + TILE_PX / 2;
    const hcy = hpy + TILE_PX / 2;
    const classDef = HERO_CLASSES[hero.classId];

    ctx.save();
    if (hero.invisibleTicks > 0) {
      ctx.globalAlpha = 0.6;
    }
    ctx.fillStyle = classDef.accentColor;
    ctx.beginPath();
    ctx.arc(hcx, hcy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', hcx, hcy);
    ctx.restore();

    // Throw-Target 3x3 Preview Reticle
    if (this.pendingThrowSlot !== null && this.hoverTile) {
      const { x: hx, y: hy } = this.hoverTile;
      const inRange =
        Math.max(Math.abs(hx - hero.x), Math.abs(hy - hero.y)) <=
        GAME_CONFIG.THROW_RANGE;
      ctx.strokeStyle = inRange ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 2;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const rx = hx + dx;
          const ry = hy + dy;
          if (rx >= 0 && rx < floor.width && ry >= 0 && ry < floor.height) {
            ctx.strokeRect(
              rx * TILE_PX + 2,
              ry * TILE_PX + 2,
              TILE_PX - 4,
              TILE_PX - 4,
            );
          }
        }
      }
      ctx.lineWidth = 1;
    }
  }
}
