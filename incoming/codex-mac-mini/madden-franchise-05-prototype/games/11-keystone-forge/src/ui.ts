import { CONFIG, type GameMode } from './config';
import { PIECE_DEFINITIONS, type CellOffset, type PieceId } from './content';
import { KeystoneAudioController } from './audio';
import {
  loadProfile,
  recordStampProgress,
  type KeystoneForgeProfile,
} from './persistence';
import {
  computeGhostPreview,
  countBoardBuriedVoids,
  createGameState,
  findBestPlacementHint,
  holdPiece,
  movePiece,
  rotatePiece,
  setPieceColumn,
  stampPiece,
  tickTimer,
  useLaserChisel,
  type KeystoneForgeState,
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

function attachLightDismissFallback(dialog: HTMLDialogElement | null): void {
  if (!dialog || typeof HTMLDialogElement === 'undefined') return;
  if (!('closedBy' in HTMLDialogElement.prototype)) {
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

function renderMiniPieceSvg(pieceId: PieceId | null, rotation = 0): string {
  if (!pieceId) {
    return `<div class="kf-mini-empty">EMPTY</div>`;
  }
  const def = PIECE_DEFINITIONS[pieceId];
  const cells = def.rotations[((rotation % 4) + 4) % 4];
  const cellSet = new Set(cells.map((c) => `${c.r},${c.c}`));

  let gridHtml = `<div class="kf-mini-grid" aria-label="${def.name}">`;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const filled = cellSet.has(`${r},${c}`);
      gridHtml += `<span class="kf-mini-cell ${filled ? 'is-filled' : ''}" style="${
        filled ? `--cell-bg:${def.color};--cell-border:${def.border};` : ''
      }"></span>`;
    }
  }
  gridHtml += `</div>`;
  return gridHtml;
}

export interface KeystoneForgeUIInstance {
  destroy(): void;
  getStateSnapshot(): KeystoneForgeState;
  restartWithSeed(seed: number, mode?: GameMode): void;
  toggleDebug(force?: boolean): void;
}

export function mountKeystoneForgeUI(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean; initialMode?: GameMode },
): KeystoneForgeUIInstance {
  let currentSeed = options?.initialSeed ?? 20261107;
  let currentMode: GameMode = options?.initialMode ?? 'endless';
  let debugOpen = Boolean(options?.debug);
  let showCoachHint = true;
  let paused = false;

  let state: KeystoneForgeState = createGameState(currentSeed, currentMode);
  let profile: KeystoneForgeProfile = loadProfile();
  const audio = new KeystoneAudioController();

  container.innerHTML = `
    <style>
      .kf-root {
        --kf-bg: #0b1020;
        --kf-panel: #131c33;
        --kf-panel-border: #26355c;
        --kf-text: #f1f5f9;
        --kf-muted: #94a3b8;
        --kf-accent: #06b6d4;
        --kf-good: #10b981;
        --kf-warn: #f59e0b;
        --kf-danger: #f43f5e;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: var(--kf-text);
        background: radial-gradient(circle at 50% 0%, #17254a 0%, #090d1a 100%);
        border: 1px solid var(--kf-panel-border);
        border-radius: 14px;
        padding: 16px;
        max-width: 1140px;
        margin: 0 auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
        user-select: none;
      }
      .kf-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 12px;
        margin-bottom: 14px;
        border-bottom: 1px solid var(--kf-panel-border);
      }
      .kf-brand h2 {
        margin: 0;
        font-size: 1.35rem;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .kf-brand p {
        margin: 3px 0 0;
        font-size: 0.84rem;
        color: var(--kf-muted);
      }
      .kf-mode-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .kf-btn {
        background: #1b2848;
        color: var(--kf-text);
        border: 1px solid #33497a;
        border-radius: 8px;
        padding: 7px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.14s ease, transform 0.08s ease, border-color 0.14s ease;
      }
      .kf-btn:hover {
        background: #243763;
        border-color: #4f70b8;
      }
      .kf-btn:active {
        transform: translateY(1px);
      }
      .kf-btn[aria-pressed="true"],
      .kf-btn.is-active {
        background: #0891b2;
        border-color: #67e8f9;
        color: #ffffff;
      }
      .kf-btn-stamp {
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
        border-color: #34d399;
        color: #fff;
        font-size: 0.95rem;
        padding: 10px 18px;
      }
      .kf-btn-stamp:hover {
        background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
      }
      .kf-btn-chisel {
        background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
        border-color: #fcd34d;
        color: #fff;
      }
      .kf-btn-chisel:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .kf-layout {
        display: grid;
        grid-template-columns: 270px minmax(280px, 1fr) 290px;
        gap: 16px;
        align-items: start;
      }
      @media (max-width: 920px) {
        .kf-layout {
          grid-template-columns: 1fr;
        }
      }
      .kf-card {
        background: rgba(19, 28, 51, 0.9);
        border: 1px solid var(--kf-panel-border);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 12px;
      }
      .kf-card-title {
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--kf-muted);
        margin: 0 0 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .kf-mini-grid {
        display: grid;
        grid-template-columns: repeat(3, 18px);
        grid-template-rows: repeat(3, 18px);
        gap: 3px;
        justify-content: center;
        padding: 6px;
        background: #090f1f;
        border-radius: 8px;
        border: 1px solid #1e2d52;
      }
      .kf-mini-cell {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.03);
      }
      .kf-mini-cell.is-filled {
        background: var(--cell-bg, #06b6d4);
        border: 1px solid var(--cell-border, #67e8f9);
        box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.25);
      }
      .kf-mini-empty {
        height: 66px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        color: var(--kf-muted);
        background: #090f1f;
        border-radius: 8px;
        border: 1px dashed #293b66;
      }
      .kf-stage-center {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .kf-banner-lesson {
        width: 100%;
        box-sizing: border-box;
        background: rgba(8, 145, 178, 0.16);
        border: 1px solid #06b6d4;
        border-radius: 10px;
        padding: 9px 12px;
        margin-bottom: 10px;
        font-size: 0.85rem;
        line-height: 1.35;
      }
      .kf-gravity-bar-wrap {
        width: 100%;
        max-width: 336px;
        height: 7px;
        background: #090f1f;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 8px;
        border: 1px solid #1e293b;
      }
      .kf-gravity-bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #06b6d4 0%, #10b981 70%, #f59e0b 100%);
        transition: width 0.08s linear;
      }
      .kf-col-rail {
        display: grid;
        grid-template-columns: repeat(6, 50px);
        gap: 5px;
        margin-bottom: 5px;
      }
      .kf-col-btn {
        background: #131f3a;
        border: 1px solid #283a66;
        color: #94a3b8;
        border-radius: 6px;
        padding: 4px 0;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
      }
      .kf-col-btn:hover,
      .kf-col-btn.is-active-col {
        background: #1e3a6e;
        color: #fff;
        border-color: #60a5fa;
      }
      .kf-board {
        display: grid;
        grid-template-columns: repeat(6, 50px);
        grid-template-rows: repeat(10, 44px);
        gap: 5px;
        padding: 10px;
        background: #070b17;
        border: 2px solid #2b3f6e;
        border-radius: 12px;
        box-shadow: inset 0 0 28px rgba(0, 0, 0, 0.8);
        position: relative;
      }
      @media (max-width: 440px) {
        .kf-col-rail {
          grid-template-columns: repeat(6, 42px);
        }
        .kf-board {
          grid-template-columns: repeat(6, 42px);
          grid-template-rows: repeat(10, 38px);
        }
      }
      .kf-cell {
        position: relative;
        border-radius: 6px;
        background: #0f172a;
        border: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.06s ease, border-color 0.1s ease;
      }
      .kf-cell.is-solid {
        background: var(--cell-bg, #334155);
        border: 2px solid var(--cell-border, #94a3b8);
        box-shadow: inset 0 3px 6px rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.35);
        color: rgba(255, 255, 255, 0.92);
      }
      .kf-cell.is-slag {
        background: repeating-linear-gradient(
          45deg,
          #334155,
          #334155 6px,
          #1e293b 6px,
          #1e293b 12px
        );
        border: 2px solid #64748b;
        color: #cbd5e1;
      }
      .kf-cell.is-active-piece {
        outline: 2px solid #ffffff;
        background: var(--cell-bg, #06b6d4);
        opacity: 0.92;
        z-index: 2;
      }
      .kf-cell.is-ghost-flush {
        background: rgba(16, 185, 129, 0.26);
        border: 2px dashed #34d399;
        color: #6ee7b7;
      }
      .kf-cell.is-ghost-overhang {
        background: rgba(245, 158, 11, 0.26);
        border: 2px dashed #fbbf24;
        color: #fde68a;
      }
      .kf-cell.is-new-void {
        background: rgba(244, 63, 94, 0.28);
        border: 2px solid #f43f5e;
        color: #fda4af;
        animation: kfPulseVoid 0.9s infinite alternate;
      }
      .kf-cell.is-existing-void {
        background: rgba(244, 63, 94, 0.12);
        border: 1px dotted rgba(244, 63, 94, 0.55);
        color: rgba(244, 63, 94, 0.75);
      }
      .kf-cell.is-coach-target {
        box-shadow: inset 0 0 0 2px #fde047;
      }
      @keyframes kfPulseVoid {
        from { transform: scale(0.96); }
        to { transform: scale(1.03); }
      }
      .kf-controls-deck {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        justify-content: center;
        margin-top: 12px;
        max-width: 400px;
      }
      .kf-telemetry-pill {
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 0.83rem;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .kf-telemetry-pill.is-good {
        background: rgba(16, 185, 129, 0.16);
        border: 1px solid #10b981;
        color: #6ee7b7;
      }
      .kf-telemetry-pill.is-warn {
        background: rgba(244, 63, 94, 0.18);
        border: 1px solid #f43f5e;
        color: #fda4af;
      }
      .kf-stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .kf-stat-box {
        background: #0a1022;
        border: 1px solid #1f2e52;
        border-radius: 8px;
        padding: 8px 10px;
      }
      .kf-stat-label {
        font-size: 0.71rem;
        color: var(--kf-muted);
        text-transform: uppercase;
      }
      .kf-stat-value {
        font-size: 1.15rem;
        font-weight: 800;
        margin-top: 2px;
      }
      .kf-queue-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .kf-queue-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0a1022;
        border: 1px solid #1f2e52;
        border-radius: 8px;
        padding: 6px 10px;
      }
      .kf-queue-info {
        font-size: 0.78rem;
      }
      .kf-queue-info strong {
        display: block;
        color: #e2e8f0;
      }
      .kf-queue-info span {
        color: var(--kf-muted);
        font-size: 0.72rem;
      }
      .kf-log {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.78rem;
        color: #cbd5e1;
        max-height: 118px;
        overflow-y: auto;
      }
      .kf-log li {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .kf-dialog {
        background: #111a30;
        color: #f8fafc;
        border: 1px solid #3b82f6;
        border-radius: 12px;
        max-width: 540px;
        padding: 20px;
      }
      .kf-dialog::backdrop {
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(2px);
      }
      .kf-popover {
        background: #111a30;
        color: #f8fafc;
        border: 1px solid #06b6d4;
        border-radius: 12px;
        padding: 16px;
        max-width: 380px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
      }
      [popover]:is(:popover-open, .\\:popover-open) {
        display: block;
      }
    </style>

    <div class="kf-root" tabindex="0" id="kf-interactive-root" aria-label="Keystone Forge Spatial Puzzle Game">
      <div class="kf-topbar">
        <div class="kf-brand">
          <h2>⚒️ KEYSTONE FORGE <span style="font-size:0.78rem;font-weight:600;color:#67e8f9;background:#083344;padding:3px 8px;border-radius:99px;">TETRIS SKILL TRAINER</span></h2>
          <p>Read the anvil contour, rotate for a <strong>0-Overhang Flush Fit</strong>, and stamp with minimal <strong>Finesse</strong> inputs.</p>
        </div>

        <div class="kf-mode-tabs" role="group" aria-label="Game Modes and Reference">
          <button type="button" class="kf-btn" data-kf-mode="endless" aria-pressed="true">🔥 Endless Forge</button>
          <button type="button" class="kf-btn" data-kf-mode="sprint" aria-pressed="false">⏱️ 20-Row Sprint</button>
          <button type="button" class="kf-btn" data-kf-mode="puzzle" aria-pressed="false">🧩 Cavity Dojo</button>
          <button type="button" class="kf-btn" commandfor="kf-finesse-popover" command="toggle-popover">📐 Finesse &amp; Pieces</button>
          <button type="button" class="kf-btn" commandfor="kf-manual-dialog" command="show-modal">📖 Tetris Skills Guide</button>
        </div>
      </div>

      <div id="kf-finesse-popover" class="kf-popover" popover>
        <h3 style="margin-top:0;">📐 Finesse &amp; Surface Rules</h3>
        <p style="font-size:0.84rem;color:#cbd5e1;">
          <strong>1. Flush Fit (0 Buried Voids):</strong> Never trap empty cells underneath a stamped block. Every consecutive Flush Fit builds your <strong>Flush Streak (up to 5×)</strong>.<br/><br/>
          <strong>2. Optimal Finesse:</strong> Reach your target rotation and column using the minimum possible keystrokes (<code>Par</code>) for a <strong>1.25× Score Boost</strong> and <strong>⚡ Laser Chisel</strong> charge.<br/><br/>
          <strong>3. Level Anvil Bonus:</strong> Making all 6 columns the exact same height awards <strong>+400 × Level</strong>!
        </p>
      </div>

      <dialog id="kf-manual-dialog" class="kf-dialog" closedby="any" aria-labelledby="kf-manual-title">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 id="kf-manual-title" style="margin:0;">📖 How Keystone Forge Trains Core Tetris Mastery</h3>
          <button type="button" class="kf-btn" commandfor="kf-manual-dialog" command="close">Close [Esc]</button>
        </div>
        <div style="font-size:0.88rem;line-height:1.5;color:#e2e8f0;">
          <p>Great Tetris players rely on five mental habits that <strong>Keystone Forge</strong> makes visible in real time:</p>
          <ul>
            <li><strong>Surface &amp; Silhouette Reading:</strong> Match the underside of your piece to the exact step contour of the anvil so zero air pockets (<code>⚠️ VOID</code>) are trapped below.</li>
            <li><strong>Flat Stacking &amp; Parity:</strong> Keep column heights even so any piece (<code>O4</code>, <code>T4</code>, <code>I3</code>) always has a clean landing zone.</li>
            <li><strong>Hold Chamber Discipline (<code>[C]</code>):</strong> If the active block would force an overhang, swap it into the Hold Chamber or check your 3-piece Next Queue.</li>
            <li><strong>Input Finesse:</strong> Move and rotate directly to your chosen column without back-and-forth hesitation.</li>
            <li><strong>Downstacking / Cheese Digging (<code>[X]</code>):</strong> Use your Finesse-charged <strong>Laser Chisel</strong> to vaporize roof blocks over buried cavities and clear rising Slag Molds.</li>
          </ul>
        </div>
      </dialog>

      <div class="kf-layout">
        <!-- Left Column: Hold, Surface Diagnostics, Chisel & Coach -->
        <div>
          <div class="kf-card">
            <div class="kf-card-title">
              <span>Hold Chamber [C / Shift]</span>
              <span id="kf-hold-status" style="color:#67e8f9;">READY</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div id="kf-hold-preview" style="flex:1;"></div>
              <button type="button" class="kf-btn" id="kf-btn-hold">⇄ Hold [C]</button>
            </div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Live Surface &amp; Finesse Readout</span>
            </div>
            <div id="kf-surface-pill" class="kf-telemetry-pill is-good"></div>
            <div id="kf-finesse-pill" class="kf-telemetry-pill is-good"></div>
            <div id="kf-skyline-info" style="font-size:0.8rem;color:#cbd5e1;margin-top:4px;"></div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>⚡ Laser Chisel (Cheese Dig)</span>
              <span id="kf-chisel-count">1 / 3</span>
            </div>
            <p style="font-size:0.78rem;color:var(--kf-muted);margin:0 0 8px;">
              Vaporizes the top block above the shallowest buried void. Charged by 3 Perfect-Finesse Flush Stamps or a Double+ Weld.
            </p>
            <button type="button" class="kf-btn kf-btn-chisel" id="kf-btn-chisel" style="width:100%;">
              ⚡ Fire Laser Chisel [X]
            </button>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>🧠 Spatial Coach Hint</span>
              <button type="button" class="kf-btn" id="kf-btn-toggle-coach" style="padding:2px 8px;font-size:0.72rem;" aria-pressed="true">ON [H]</button>
            </div>
            <div id="kf-coach-text" style="font-size:0.8rem;color:#fde68a;line-height:1.35;"></div>
          </div>
        </div>

        <!-- Center Column: The 6x10 Precision Anvil -->
        <div class="kf-stage-center">
          <div id="kf-lesson-banner" class="kf-banner-lesson" hidden></div>

          <div class="kf-gravity-bar-wrap" title="Press Timer">
            <div id="kf-gravity-fill" class="kf-gravity-bar-fill"></div>
          </div>

          <div class="kf-col-rail" id="kf-col-rail" aria-label="Select Column"></div>
          <div class="kf-board" id="kf-board" role="grid" aria-label="6 by 10 Anvil Grid"></div>

          <div class="kf-controls-deck" role="group" aria-label="Forge Controls">
            <button type="button" class="kf-btn" id="kf-btn-left">◀ Left [←/A]</button>
            <button type="button" class="kf-btn" id="kf-btn-rot-ccw">⟲ CCW [Z]</button>
            <button type="button" class="kf-btn" id="kf-btn-rot-cw">⟳ Rotate [↑/W/R]</button>
            <button type="button" class="kf-btn" id="kf-btn-right">Right [→/D] ▶</button>
            <button type="button" class="kf-btn kf-btn-stamp" id="kf-btn-stamp" style="width:100%;">
              ⬇ STAMP KEYSTONE [Space / Enter]
            </button>
          </div>
        </div>

        <!-- Right Column: Scoreboard, 3-Piece Next Queue, Event Log -->
        <div>
          <div class="kf-card">
            <div class="kf-card-title">
              <span>Forge Telemetry</span>
              <button type="button" class="kf-btn" id="kf-btn-restart" style="padding:3px 8px;font-size:0.72rem;">↻ New Run</button>
            </div>
            <div class="kf-stat-grid">
              <div class="kf-stat-box">
                <div class="kf-stat-label">Score</div>
                <div class="kf-stat-value" id="kf-stat-score">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Best Score</div>
                <div class="kf-stat-value" id="kf-stat-best">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Rows Smelted</div>
                <div class="kf-stat-value" id="kf-stat-lines">0</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Flush Streak</div>
                <div class="kf-stat-value" id="kf-stat-flush" style="color:#34d399;">0×</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Finesse Rate</div>
                <div class="kf-stat-value" id="kf-stat-finesse" style="color:#67e8f9;">100%</div>
              </div>
              <div class="kf-stat-box">
                <div class="kf-stat-label">Level / Mode</div>
                <div class="kf-stat-value" id="kf-stat-level">Lv 1</div>
              </div>
            </div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Next 3 Keystones (7-Bag Lookahead)</span>
            </div>
            <div id="kf-next-queue" class="kf-queue-list"></div>
          </div>

          <div class="kf-card">
            <div class="kf-card-title">
              <span>Forge Log</span>
              <button type="button" class="kf-btn" id="kf-btn-mute" style="padding:2px 7px;font-size:0.7rem;">🔊 Audio</button>
            </div>
            <ul id="kf-event-log" class="kf-log"></ul>
          </div>

          <div class="kf-card" id="kf-debug-panel" hidden>
            <div class="kf-card-title"><span>Debug State</span></div>
            <pre id="kf-debug-pre" style="font-size:0.72rem;margin:0;white-space:pre-wrap;color:#93c5fd;"></pre>
          </div>
        </div>
      </div>
    </div>
  `;

  const rootEl = container.querySelector<HTMLElement>('#kf-interactive-root')!;
  const manualDialog = container.querySelector<HTMLDialogElement>('#kf-manual-dialog');
  attachLightDismissFallback(manualDialog);

  const boardEl = container.querySelector<HTMLElement>('#kf-board')!;
  const colRailEl = container.querySelector<HTMLElement>('#kf-col-rail')!;
  const holdPreviewEl = container.querySelector<HTMLElement>('#kf-hold-preview')!;
  const holdStatusEl = container.querySelector<HTMLElement>('#kf-hold-status')!;
  const surfacePillEl = container.querySelector<HTMLElement>('#kf-surface-pill')!;
  const finessePillEl = container.querySelector<HTMLElement>('#kf-finesse-pill')!;
  const skylineInfoEl = container.querySelector<HTMLElement>('#kf-skyline-info')!;
  const chiselCountEl = container.querySelector<HTMLElement>('#kf-chisel-count')!;
  const btnChisel = container.querySelector<HTMLButtonElement>('#kf-btn-chisel')!;
  const coachTextEl = container.querySelector<HTMLElement>('#kf-coach-text')!;
  const btnToggleCoach = container.querySelector<HTMLButtonElement>('#kf-btn-toggle-coach')!;
  const lessonBannerEl = container.querySelector<HTMLElement>('#kf-lesson-banner')!;
  const gravityFillEl = container.querySelector<HTMLElement>('#kf-gravity-fill')!;
  const nextQueueEl = container.querySelector<HTMLElement>('#kf-next-queue')!;
  const eventLogEl = container.querySelector<HTMLUListElement>('#kf-event-log')!;
  const debugPanelEl = container.querySelector<HTMLElement>('#kf-debug-panel')!;
  const debugPreEl = container.querySelector<HTMLElement>('#kf-debug-pre')!;

  const statScoreEl = container.querySelector<HTMLElement>('#kf-stat-score')!;
  const statBestEl = container.querySelector<HTMLElement>('#kf-stat-best')!;
  const statLinesEl = container.querySelector<HTMLElement>('#kf-stat-lines')!;
  const statFlushEl = container.querySelector<HTMLElement>('#kf-stat-flush')!;
  const statFinesseEl = container.querySelector<HTMLElement>('#kf-stat-finesse')!;
  const statLevelEl = container.querySelector<HTMLElement>('#kf-stat-level')!;

  function render(): void {
    const ghost = computeGhostPreview(state);
    const existingVoids = countBoardBuriedVoids(state.board);
    const coach = showCoachHint ? findBestPlacementHint(state) : null;

    // Mode tabs active state
    for (const btn of container.querySelectorAll<HTMLButtonElement>('button[data-kf-mode]')) {
      const m = btn.getAttribute('data-kf-mode');
      btn.setAttribute('aria-pressed', String(m === state.mode));
    }

    // Lesson banner in Puzzle Dojo mode or Won/GameOver banner
    if (state.status === 'won') {
      lessonBannerEl.hidden = false;
      lessonBannerEl.innerHTML = `🏆 <strong>SPRINT COMPLETE!</strong> 20 rows forged in ${(
        state.elapsedMs / 1000
      ).toFixed(1)}s. Click <strong>↻ New Run</strong> to race again!`;
    } else if (state.status === 'gameover') {
      lessonBannerEl.hidden = false;
      lessonBannerEl.innerHTML = `⚠️ <strong>ANVIL JAMMED!</strong> Final Score: <strong>${state.score}</strong> · Max Flush Streak: <strong>${state.maxFlushStreak}×</strong>. Press <strong>↻ New Run</strong> to forge again!`;
    } else if (state.mode === 'puzzle') {
      lessonBannerEl.hidden = false;
      lessonBannerEl.innerHTML = `🧩 <strong>${state.puzzleTitle}:</strong> ${state.puzzleLesson}`;
    } else {
      const activeDef = PIECE_DEFINITIONS[state.active.pieceId];
      lessonBannerEl.hidden = false;
      lessonBannerEl.innerHTML = `<strong>Active: ${activeDef.name}</strong> (${
        state.active.rotation * 90
      }°) — ${activeDef.tip}`;
    }

    // Gravity progress bar
    const pct =
      state.mode === 'puzzle'
        ? 0
        : Math.min(100, Math.round((state.gravityTimerMs / state.gravityIntervalMs) * 100));
    gravityFillEl.style.width = `${pct}%`;

    // Column rail buttons
    colRailEl.innerHTML = '';
    for (let c = 0; c < CONFIG.BOARD_COLS; c++) {
      const colBtn = document.createElement('button');
      colBtn.type = 'button';
      colBtn.className = `kf-col-btn ${c === state.active.col ? 'is-active-col' : ''}`;
      colBtn.textContent = `C${c + 1}`;
      colBtn.addEventListener('click', () => {
        state = setPieceColumn(state, c);
        audio.playMove();
        render();
      });
      colRailEl.appendChild(colBtn);
    }

    // Build sets for fast cell lookup
    const activeOffsets =
      PIECE_DEFINITIONS[state.active.pieceId].rotations[
        ((state.active.rotation % 4) + 4) % 4
      ];
    const activeSet = new Set(
      activeOffsets.map((o) => `${o.r},${state.active.col + o.c}`),
    );
    const ghostSet = new Set(
      (ghost?.cells ?? []).map((c: CellOffset) => `${c.r},${c.c}`),
    );
    const newVoidSet = new Set(
      (ghost?.newBuriedVoidCells ?? []).map((c: CellOffset) => `${c.r},${c.c}`),
    );
    const existingVoidSet = new Set(
      existingVoids.cells.map((c: CellOffset) => `${c.r},${c.c}`),
    );

    const coachSet = new Set<string>();
    if (coach && !coach.useHold) {
      const coachPreview = computeGhostPreview({
        ...state,
        active: {
          pieceId: coach.pieceId,
          rotation: coach.rotation,
          col: coach.col,
          movesUsed: 0,
        },
      });
      for (const cell of coachPreview?.cells ?? []) {
        coachSet.add(`${cell.r},${cell.c}`);
      }
    }

    // Render 6x10 board
    boardEl.innerHTML = '';
    const activeDef = PIECE_DEFINITIONS[state.active.pieceId];

    for (let r = 0; r < CONFIG.BOARD_ROWS; r++) {
      for (let c = 0; c < CONFIG.BOARD_COLS; c++) {
        const key = `${r},${c}`;
        const cellVal = state.board[r][c];
        const cellDiv = document.createElement('div');
        cellDiv.className = 'kf-cell';
        cellDiv.setAttribute('role', 'gridcell');
        cellDiv.setAttribute('data-row', String(r));
        cellDiv.setAttribute('data-col', String(c));

        if (cellVal === 'SLAG') {
          cellDiv.classList.add('is-slag');
          cellDiv.textContent = '▤';
        } else if (cellVal !== null) {
          const def = PIECE_DEFINITIONS[cellVal];
          cellDiv.classList.add('is-solid');
          cellDiv.style.setProperty('--cell-bg', def.color);
          cellDiv.style.setProperty('--cell-border', def.border);
          cellDiv.textContent = def.glyph;
        } else if (newVoidSet.has(key)) {
          cellDiv.classList.add('is-new-void');
          cellDiv.textContent = '⚠️';
          cellDiv.title = 'Buried Void Warning: Dropping here traps an empty hole underneath!';
        } else if (ghostSet.has(key)) {
          cellDiv.classList.add(ghost?.isFlushFit ? 'is-ghost-flush' : 'is-ghost-overhang');
          cellDiv.textContent = ghost?.isFlushFit ? '✓' : '!';
        } else if (activeSet.has(key)) {
          cellDiv.classList.add('is-active-piece');
          cellDiv.style.setProperty('--cell-bg', activeDef.color);
          cellDiv.textContent = activeDef.glyph;
        } else if (existingVoidSet.has(key)) {
          cellDiv.classList.add('is-existing-void');
          cellDiv.textContent = '×';
        }

        if (coachSet.has(key) && cellVal === null) {
          cellDiv.classList.add('is-coach-target');
        }

        // Clicking a column on the board aligns the Press Head to that column; double-clicking stamps!
        cellDiv.addEventListener('click', () => {
          if (state.active.col !== c) {
            state = setPieceColumn(state, c);
            audio.playMove();
            render();
          }
        });
        cellDiv.addEventListener('dblclick', () => {
          handleStamp();
        });

        boardEl.appendChild(cellDiv);
      }
    }

    // Hold Chamber
    holdPreviewEl.innerHTML = renderMiniPieceSvg(state.hold, 0);
    holdStatusEl.textContent = state.holdUsedThisTurn ? 'LOCKED THIS TURN' : 'READY [C]';
    holdStatusEl.style.color = state.holdUsedThisTurn ? '#f59e0b' : '#67e8f9';

    // Surface & Finesse Telemetry
    if (ghost) {
      if (ghost.isFlushFit) {
        surfacePillEl.className = 'kf-telemetry-pill is-good';
        surfacePillEl.innerHTML = `<span>✅ FLUSH FIT</span><span>0 New Voids</span>`;
      } else {
        surfacePillEl.className = 'kf-telemetry-pill is-warn';
        surfacePillEl.innerHTML = `<span>⚠️ OVERHANG WARNING</span><span>+${ghost.newBuriedVoidCells.length} Void(s)</span>`;
      }

      if (ghost.isPerfectFinesseSoFar) {
        finessePillEl.className = 'kf-telemetry-pill is-good';
        finessePillEl.innerHTML = `<span>⚡ OPTIMAL FINESSE</span><span>${ghost.movesUsed} / Par ${ghost.optimalMoves}</span>`;
      } else {
        finessePillEl.className = 'kf-telemetry-pill is-warn';
        finessePillEl.innerHTML = `<span>FINESSE DRIFT</span><span>${ghost.movesUsed} / Par ${ghost.optimalMoves}</span>`;
      }

      const extras: string[] = [];
      if (ghost.wouldClearLines > 0) {
        extras.push(`🔥 Smelts <strong>${ghost.wouldClearLines} Row(s)</strong> on drop!`);
      }
      if (ghost.isFlatSkylineAfter) {
        extras.push(`✨ Produces a <strong>100% Level Anvil</strong> (+${CONFIG.SCORE_FLAT_SKYLINE * state.level} pts)!`);
      }
      if (extras.length === 0) {
        extras.push(
          `Existing buried voids on board: <strong>${existingVoids.count}</strong>`,
        );
      }
      skylineInfoEl.innerHTML = extras.join(' · ');
    }

    // Chisel button
    chiselCountEl.textContent = `${state.chiselCharges} / ${CONFIG.MAX_CHISEL_CHARGES}`;
    const hasBlocks = state.board.some((row) => row.some((cell) => cell !== null));
    btnChisel.disabled = state.chiselCharges <= 0 || !hasBlocks || state.status !== 'playing';

    // Coach recommendation
    if (!showCoachHint) {
      coachTextEl.textContent = 'Coach Hint hidden. Press [H] to enable live spatial analysis.';
    } else if (coach) {
      coachTextEl.textContent = `💡 ${coach.reason}`;
    } else {
      coachTextEl.textContent = 'No valid placements remaining.';
    }

    // Stats
    statScoreEl.textContent = state.score.toLocaleString();
    statBestEl.textContent = Math.max(profile.highScore, state.score).toLocaleString();
    statLinesEl.textContent =
      state.mode === 'sprint'
        ? `${state.linesCleared} / ${CONFIG.SPRINT_TARGET_LINES}`
        : String(state.linesCleared);
    statFlushEl.textContent = `${state.flushStreak}× (Max ${state.maxFlushStreak}×)`;

    const finessePct =
      state.stampsCount === 0
        ? 100
        : Math.round((state.perfectFinesseCount / state.stampsCount) * 100);
    statFinesseEl.textContent = `${finessePct}%`;
    statLevelEl.textContent =
      state.mode === 'puzzle'
        ? `Dojo #${state.puzzleIndex + 1}`
        : `Lv ${state.level}`;

    // Next Queue
    nextQueueEl.innerHTML = state.nextQueue
      .slice(0, CONFIG.PREVIEW_COUNT)
      .map((pid, idx) => {
        const def = PIECE_DEFINITIONS[pid];
        return `
          <div class="kf-queue-item">
            ${renderMiniPieceSvg(pid, 0)}
            <div class="kf-queue-info">
              <strong>#${idx + 1} ${def.name}</strong>
              <span>${def.tip}</span>
            </div>
          </div>
        `;
      })
      .join('');

    // Event log
    eventLogEl.innerHTML = state.eventLog
      .slice(0, 7)
      .map((entry) => `<li>${entry}</li>`)
      .join('');

    // Debug panel
    debugPanelEl.hidden = !debugOpen;
    if (debugOpen) {
      debugPreEl.textContent = JSON.stringify(
        {
          seed: state.seed,
          mode: state.mode,
          active: state.active,
          hold: state.hold,
          flushStreak: state.flushStreak,
          finesseStreak: state.finesseStreak,
          chiselCharges: state.chiselCharges,
          buriedVoids: existingVoids.count,
        },
        null,
        2,
      );
    }
  }

  function handleStamp(): void {
    if (state.status !== 'playing') return;
    state = stampPiece(state);
    if (state.lastStamp) {
      audio.playStamp(
        state.lastStamp.linesCleared,
        state.lastStamp.wasFlush,
        state.lastStamp.wasPerfectFinesse,
      );
      profile = recordStampProgress(profile, state);
    }
    render();
  }

  // Wire buttons
  container.querySelector('#kf-btn-left')?.addEventListener('click', () => {
    state = movePiece(state, -1);
    audio.playMove();
    render();
  });
  container.querySelector('#kf-btn-right')?.addEventListener('click', () => {
    state = movePiece(state, 1);
    audio.playMove();
    render();
  });
  container.querySelector('#kf-btn-rot-cw')?.addEventListener('click', () => {
    state = rotatePiece(state, 1);
    audio.playRotate();
    render();
  });
  container.querySelector('#kf-btn-rot-ccw')?.addEventListener('click', () => {
    state = rotatePiece(state, -1);
    audio.playRotate();
    render();
  });
  container.querySelector('#kf-btn-stamp')?.addEventListener('click', () => {
    handleStamp();
  });
  container.querySelector('#kf-btn-hold')?.addEventListener('click', () => {
    state = holdPiece(state);
    audio.playHold();
    render();
  });
  btnChisel.addEventListener('click', () => {
    state = useLaserChisel(state);
    audio.playChisel();
    render();
  });
  btnToggleCoach.addEventListener('click', () => {
    showCoachHint = !showCoachHint;
    btnToggleCoach.setAttribute('aria-pressed', String(showCoachHint));
    btnToggleCoach.textContent = showCoachHint ? 'ON [H]' : 'OFF [H]';
    render();
  });
  container.querySelector('#kf-btn-restart')?.addEventListener('click', () => {
    state = createGameState(currentSeed, currentMode);
    render();
  });

  const btnMute = container.querySelector<HTMLButtonElement>('#kf-btn-mute');
  btnMute?.addEventListener('click', () => {
    const nextMuted = !audio.isMuted();
    audio.setMuted(nextMuted);
    btnMute.textContent = nextMuted ? '🔇 Muted' : '🔊 Audio';
  });

  for (const modeBtn of container.querySelectorAll<HTMLButtonElement>('button[data-kf-mode]')) {
    modeBtn.addEventListener('click', () => {
      const m = modeBtn.getAttribute('data-kf-mode') as GameMode;
      if (m) {
        currentMode = m;
        state = createGameState(currentSeed, currentMode);
        render();
      }
    });
  }

  // Keyboard listener
  function onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    if (manualDialog?.open) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        state = movePiece(state, -1);
        audio.playMove();
        render();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        state = movePiece(state, 1);
        audio.playMove();
        render();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'r':
      case 'R':
        e.preventDefault();
        state = rotatePiece(state, 1);
        audio.playRotate();
        render();
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        state = rotatePiece(state, -1);
        audio.playRotate();
        render();
        break;
      case ' ':
      case 'Enter':
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handleStamp();
        break;
      case 'c':
      case 'C':
      case 'Shift':
        e.preventDefault();
        state = holdPiece(state);
        audio.playHold();
        render();
        break;
      case 'x':
      case 'X':
      case 'e':
      case 'E':
        e.preventDefault();
        state = useLaserChisel(state);
        audio.playChisel();
        render();
        break;
      case 'h':
      case 'H':
        e.preventDefault();
        showCoachHint = !showCoachHint;
        btnToggleCoach.setAttribute('aria-pressed', String(showCoachHint));
        btnToggleCoach.textContent = showCoachHint ? 'ON [H]' : 'OFF [H]';
        render();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6': {
        e.preventDefault();
        const colIdx = Number(e.key) - 1;
        state = setPieceColumn(state, colIdx);
        audio.playMove();
        render();
        break;
      }
    }
  }

  window.addEventListener('keydown', onKeyDown);

  const timerId = window.setInterval(() => {
    if (paused || state.status !== 'playing') return;
    if (manualDialog?.open) return;
    const prevStamps = state.stampsCount;
    state = tickTimer(state, 100);
    if (state.stampsCount !== prevStamps && state.lastStamp) {
      audio.playStamp(
        state.lastStamp.linesCleared,
        state.lastStamp.wasFlush,
        state.lastStamp.wasPerfectFinesse,
      );
      profile = recordStampProgress(profile, state);
    }
    render();
  }, 100);

  render();

  return {
    destroy(): void {
      paused = true;
      window.clearInterval(timerId);
      window.removeEventListener('keydown', onKeyDown);
      container.innerHTML = '';
    },
    getStateSnapshot(): KeystoneForgeState {
      return state;
    },
    restartWithSeed(seed: number, mode?: GameMode): void {
      currentSeed = seed;
      if (mode) currentMode = mode;
      state = createGameState(currentSeed, currentMode);
      render();
    },
    toggleDebug(force?: boolean): void {
      debugOpen = force !== undefined ? force : !debugOpen;
      render();
    },
  };
}
