import { BeltAndBoltAudio } from './audio';
import {
  BlockType,
  CONFIG,
  Direction,
  DIRECTION_DELTAS,
  ItemType,
  rotateDirectionCW,
} from './config';
import {
  BLOCKS,
  BUILDABLE_BLOCK_ORDER,
  ENEMY_TYPES,
  getWaveDefinition,
  ITEMS,
  TECH_TREE_UNLOCKS,
} from './content';
import {
  clearSavedGame,
  loadGameFromStorage,
  saveGameToStorage,
} from './persistence';
import {
  applyBuildCommand,
   createInitialState,
  deployStarterBlueprint,
  diagnoseBottlenecks,
  GameState,
  getTile,
  isBlockUnlocked,
  stepFactoryTick,
  triggerNextWave,
  unlockTechForWave,
} from './simulation';

export interface BeltAndBoltUIController {
  destroy(): void;
  getState(): GameState;
  restartWithSeed(seed: number): void;
  toggleDebug(force?: boolean): void;
}

export function createBeltAndBoltUI(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): BeltAndBoltUIController {
  const audio = new BeltAndBoltAudio();
  const saved =
    options?.initialSeed === undefined ? loadGameFromStorage() : null;

  let state: GameState = saved
    ? saved.state
    : createInitialState({ seed: options?.initialSeed ?? 9092026 });

  let selectedTool: BlockType | 'demolish' = 'miner';
  let currentDirection: Direction = 'E';
  let hoveredCell: { x: number; y: number } | null = null;
  let paused = false;
  let debugVisible = Boolean(options?.debug);
  let animPhase = 0;

  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'bb-root';
  root.innerHTML = `
    <style>
      .bb-root {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        background: #0b0f19;
        color: #e2e8f0;
        min-height: 100%;
        padding: 12px;
        box-sizing: border-box;
        user-select: none;
      }
      .bb-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 12px;
      }
      .bb-title-wrap h1 {
        margin: 0;
        font-size: 1.2rem;
        letter-spacing: 0.04em;
        color: #38bdf8;
      }
      .bb-title-wrap p {
        margin: 2px 0 0;
        font-size: 0.78rem;
        color: #94a3b8;
      }
      .bb-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .bb-metric {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 6px 10px;
        min-width: 92px;
      }
      .bb-metric-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        color: #94a3b8;
      }
      .bb-metric-value {
        font-size: 1rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .bb-layout {
        display: grid;
        grid-template-columns: minmax(280px, 540px) minmax(260px, 1fr);
        gap: 14px;
        align-items: start;
      }
      @media (max-width: 860px) {
        .bb-layout {
          grid-template-columns: 1fr;
        }
      }
      .bb-canvas-card {
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .bb-canvas {
        width: 100%;
        max-width: 516px;
        aspect-ratio: 1 / 1;
        background: #090d16;
        border: 2px solid #334155;
        border-radius: 8px;
        cursor: crosshair;
        touch-action: none;
      }
      .bb-event-banner {
        width: 100%;
        margin-top: 8px;
        padding: 7px 10px;
        background: #0f172a;
        border-left: 3px solid #38bdf8;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #bae6fd;
        box-sizing: border-box;
      }
      .bb-side {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bb-panel {
        background: #111827;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 10px 12px;
      }
      .bb-panel h2 {
        margin: 0 0 8px;
        font-size: 0.86rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #38bdf8;
      }
      .bb-toolbar-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
        gap: 6px;
      }
      .bb-tool-btn {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 7px;
        color: #f1f5f9;
        padding: 7px 8px;
        text-align: left;
        cursor: pointer;
        font-size: 0.76rem;
        transition: border-color 0.15s, background 0.15s;
      }
      .bb-tool-btn:hover:not(:disabled) {
        border-color: #38bdf8;
      }
      .bb-tool-btn.active {
        background: #0c4a6e;
        border-color: #38bdf8;
        box-shadow: 0 0 0 1px #38bdf8 inset;
      }
      .bb-tool-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }
      .bb-action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .bb-btn {
        background: #1e293b;
        border: 1px solid #475569;
        color: #f8fafc;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
      }
      .bb-btn.primary {
        background: #0284c7;
        border-color: #38bdf8;
      }
      .bb-btn.warn {
        background: #b45309;
        border-color: #f59e0b;
      }
      .bb-tech-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.76rem;
      }
      .bb-tech-item {
        padding: 5px 8px;
        border-radius: 6px;
        background: #0f172a;
        border: 1px solid #1e293b;
      }
      .bb-tech-item.unlocked {
        border-color: #10b981;
        color: #a7f3d0;
      }
      .bb-diag-box {
        font-size: 0.76rem;
        line-height: 1.45;
        color: #cbd5e1;
      }
      .bb-badge-jam {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        background: #7f1d1d;
        color: #fecaca;
        font-weight: 700;
        font-size: 0.7rem;
      }
    </style>

    <div class="bb-header">
      <div class="bb-title-wrap">
        <h1>BELT &amp; BOLT // INDUSTRIAL LOGISTICS DEFENSE</h1>
        <p>Route Mined Ore to Central Core (Credits + Tech Quota) OR Perimeter Turrets (Wave Ammo)</p>
      </div>
      <div class="bb-metrics">
        <div class="bb-metric">
          <div class="bb-metric-label">Core Hull</div>
          <div class="bb-metric-value" data-bb="core-hp">500 / 500</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Credits</div>
          <div class="bb-metric-value" data-bb="credits">150</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Core Quota</div>
          <div class="bb-metric-value" data-bb="quota">0 / 15</div>
        </div>
        <div class="bb-metric">
          <div class="bb-metric-label">Wave</div>
          <div class="bb-metric-value" data-bb="wave">1 / 30</div>
        </div>
      </div>
    </div>

    <div class="bb-layout">
      <div class="bb-canvas-card">
        <canvas class="bb-canvas" width="528" height="528"></canvas>
        <div class="bb-event-banner" data-bb="event-banner">Command Core online.</div>
      </div>

      <div class="bb-side">
        <div class="bb-panel">
          <h2>Build Toolbar ([1..0] Select, [R] Rotate: <span data-bb="dir-label">E</span>, [X] Demolish)</h2>
          <div class="bb-toolbar-grid" data-bb="toolbar"></div>
          <div class="bb-action-row">
            <button type="button" class="bb-btn" data-bb="btn-rotate">[R] Rotate Dir (E)</button>
            <button type="button" class="bb-btn" data-bb="btn-demolish">[X] Demolish (75% Refund)</button>
            <button type="button" class="bb-btn primary" data-bb="btn-wave">[Space] Launch Wave</button>
            <button type="button" class="bb-btn warn" data-bb="btn-blueprint">Starter Blueprint</button>
            <button type="button" class="bb-btn" data-bb="btn-pause">[P] Pause</button>
            <button type="button" class="bb-btn" data-bb="btn-reset">Reset Factory</button>
          </div>
        </div>

        <div class="bb-panel">
          <h2>Bottleneck &amp; Tile Diagnostic Inspector</h2>
          <div class="bb-diag-box" data-bb="inspector">Hover or click any tile on the 12x12 grid to inspect flow, backpressure, or splitter ratios.</div>
        </div>

        <div class="bb-panel">
          <h2>Tech Tree Unlocks (Every 3 Waves) &amp; Shape Grammar</h2>
          <div class="bb-tech-list" data-bb="tech-list"></div>
        </div>

        <div class="bb-panel" data-bb="debug-panel" style="display: none;">
          <h2>Engineering Debug &amp; Telemetry ([D])</h2>
          <div class="bb-action-row">
            <button type="button" class="bb-btn" data-bb="dbg-credits">+250 Credits</button>
            <button type="button" class="bb-btn" data-bb="dbg-unlock">Unlock All Tech</button>
            <button type="button" class="bb-btn" data-bb="dbg-step">Step 1 Tick</button>
            <button type="button" class="bb-btn" data-bb="dbg-wave12">Jump Wave 12</button>
            <button type="button" class="bb-btn" data-bb="dbg-wave30">Jump Wave 30</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(root);

  const canvas = root.querySelector('.bb-canvas') as HTMLCanvasElement;
  const isJsdom =
    typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
  const ctx = isJsdom ? null : canvas.getContext('2d');
  const hpEl = root.querySelector('[data-bb="core-hp"]') as HTMLElement;
  const creditsEl = root.querySelector('[data-bb="credits"]') as HTMLElement;
  const quotaEl = root.querySelector('[data-bb="quota"]') as HTMLElement;
  const waveEl = root.querySelector('[data-bb="wave"]') as HTMLElement;
  const bannerEl = root.querySelector('[data-bb="event-banner"]') as HTMLElement;
  const dirLabelEl = root.querySelector('[data-bb="dir-label"]') as HTMLElement;
  const toolbarEl = root.querySelector('[data-bb="toolbar"]') as HTMLElement;
  const inspectorEl = root.querySelector('[data-bb="inspector"]') as HTMLElement;
  const techListEl = root.querySelector('[data-bb="tech-list"]') as HTMLElement;
  const debugPanelEl = root.querySelector('[data-bb="debug-panel"]') as HTMLElement;
  const rotateBtn = root.querySelector('[data-bb="btn-rotate"]') as HTMLButtonElement;
  const demolishBtn = root.querySelector('[data-bb="btn-demolish"]') as HTMLButtonElement;
  const waveBtn = root.querySelector('[data-bb="btn-wave"]') as HTMLButtonElement;
  const blueprintBtn = root.querySelector('[data-bb="btn-blueprint"]') as HTMLButtonElement;
  const pauseBtn = root.querySelector('[data-bb="btn-pause"]') as HTMLButtonElement;
  const resetBtn = root.querySelector('[data-bb="btn-reset"]') as HTMLButtonElement;

  function renderToolbar(): void {
    toolbarEl.innerHTML = '';
    for (const blockId of BUILDABLE_BLOCK_ORDER) {
      const meta = BLOCKS[blockId];
      const unlocked = isBlockUnlocked(state, blockId);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `bb-tool-btn${selectedTool === blockId ? ' active' : ''}`;
      btn.disabled = !unlocked;
      const lockLabel = unlocked ? `${meta.cost}c` : `Wave ${meta.unlockWave}`;
      btn.innerHTML = `
        <div><strong>[${meta.hotkey}] ${meta.shortLabel}</strong> <span style="float:right;color:#38bdf8">${lockLabel}</span></div>
        <div style="font-size:0.68rem;color:#94a3b8;margin-top:2px;">${meta.name}</div>
      `;
      btn.addEventListener('click', () => {
        if (!unlocked) return;
        selectedTool = blockId;
        demolishBtn.classList.remove('active');
        renderToolbar();
      });
      toolbarEl.appendChild(btn);
    }
    demolishBtn.classList.toggle('active', selectedTool === 'demolish');
  }

  function renderTechList(): void {
    techListEl.innerHTML = TECH_TREE_UNLOCKS.map((tier) => {
      const isUnl = state.unlockedTechWaves.includes(tier.wave);
      return `
        <div class="bb-tech-item ${isUnl ? 'unlocked' : ''}">
          <strong>${isUnl ? 'UNLOCKED' : `LOCKED (Wave ${tier.wave})`} — ${tier.title}</strong>
          <div style="color:#94a3b8;margin-top:2px;">${tier.description}</div>
        </div>
      `;
    }).join('');
  }

  function updateHUD(): void {
    hpEl.textContent = `${state.coreHp} / ${state.coreMaxHp}`;
    hpEl.style.color = state.coreHp <= 150 ? '#f87171' : '#f8fafc';
    creditsEl.textContent = `${state.credits}`;

    const nextMilestone =
      CONFIG.QUOTA_MILESTONES.find((m) => state.quotaProgress < m) ??
      CONFIG.QUOTA_MILESTONES[CONFIG.QUOTA_MILESTONES.length - 1];
    quotaEl.textContent = `${state.quotaProgress} / ${nextMilestone}`;

    waveEl.textContent =
      state.status === 'victory'
        ? 'VICTORY (30/30)'
        : state.status === 'defeat'
          ? `DEFEATED (W${state.wave})`
          : `${state.wave} / ${CONFIG.CAMPAIGN_MAX_WAVE}`;

    bannerEl.textContent = state.lastEventMessage;
    dirLabelEl.textContent = currentDirection;
    rotateBtn.textContent = `[R] Rotate Dir (${currentDirection})`;

    const waveDef = getWaveDefinition(state.wave);
    if (state.status === 'victory') {
      waveBtn.textContent = 'Enter Endless Overdrive';
    } else if (state.waveActive) {
      waveBtn.textContent = `Wave ${state.wave} Active (${state.enemies.length + state.queuedSpawns.length} hostiles)`;
    } else {
      waveBtn.textContent = `[Space] Launch Wave ${state.wave} (+${waveDef.earlyLaunchBonus}c)`;
    }

    const report = diagnoseBottlenecks(state);
    let hoverHtml = '';
    if (hoveredCell) {
      const t = getTile(state, hoveredCell.x, hoveredCell.y);
      if (t) {
        const bMeta = BLOCKS[t.block];
        const itemLabel = t.item ? `${ITEMS[t.item.type].name} (${ITEMS[t.item.type].code})` : 'None';
        const veinLabel = t.vein === 'none' ? 'Deck Steel' : t.vein.replace('_', ' ').toUpperCase();
        const extra =
          bMeta.isTurret
            ? ` | Ammo: <strong>${t.ammoCount}/${t.maxAmmo}</strong> (${t.loadedAmmoType ?? 'Empty'})`
            : t.block === 'splitter'
              ? ` | Ratio: <strong>${t.splitterRatio}</strong> (Click splitter again to cycle)`
              : t.block === 'smelter' || t.block === 'silo'
                ? ` | Buffer: <strong>${t.inputBuffer.length}</strong> items`
                : '';
        hoverHtml = `
          <div style="margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #1e293b;">
            <strong>Tile (${t.x}, ${t.y})</strong> — ${bMeta.name} [Dir: ${t.direction}] | Vein: ${veinLabel} | Item: ${itemLabel}${extra}
            ${t.congested ? '<span class="bb-badge-jam">BACKPRESSURE JAM</span>' : ''}
          </div>
        `;
      }
    }

    const jamSummary =
      report.congestedTiles.length === 0
        ? '<span style="color:#34d399;">0 Congested Belts (Smooth Flow)</span>'
        : `<span class="bb-badge-jam">${report.congestedTiles.length} Congested Tile(s)</span> — ${report.congestedTiles
            .slice(0, 2)
            .map((c) => `(${c.x},${c.y}) ${c.reason}`)
            .join('; ')}`;

    const drySummary =
      report.dryTurrets.length === 0
        ? '<span style="color:#34d399;">All Turrets Supplied</span>'
        : `<span style="color:#fbbf24;font-weight:700;">${report.dryTurrets.length} Dry Turret(s) Need Belt Ammo!</span>`;

    inspectorEl.innerHTML = `
      ${hoverHtml}
      <div><strong>Flow Diagnostics:</strong> ${jamSummary} | ${drySummary}</div>
      <div style="margin-top:4px;color:#94a3b8;">
        Core Deliveries: <strong>${state.stats.itemsDeliveredToCore}</strong> (${report.coreThroughputPerMin}/min) |
        Refined Shapes: <strong>${state.stats.itemsRefined}</strong> |
        Enemies Destroyed: <strong>${state.stats.enemiesDestroyed}</strong>
      </div>
    `;

    debugPanelEl.style.display = debugVisible ? 'block' : 'none';
  }

  function drawItemShape(
    c: CanvasRenderingContext2D,
    itemType: ItemType,
    cx: number,
    cy: number,
    radius: number
  ): void {
    const meta = ITEMS[itemType];
    c.save();
    c.fillStyle = meta.color;
    c.strokeStyle = meta.strokeColor;
    c.lineWidth = 1.5;

    if (meta.shapeKind === 'circle') {
      c.beginPath();
      c.arc(cx, cy, radius, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    } else if (meta.shapeKind === 'square') {
      c.beginPath();
      c.rect(cx - radius, cy - radius, radius * 2, radius * 2);
      c.fill();
      c.stroke();
    } else if (meta.shapeKind === 'star') {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const ox = cx + Math.cos(outerAngle) * (radius * 1.15);
        const oy = cy + Math.sin(outerAngle) * (radius * 1.15);
        const ix = cx + Math.cos(innerAngle) * (radius * 0.5);
        const iy = cy + Math.sin(innerAngle) * (radius * 0.5);
        if (i === 0) c.moveTo(ox, oy);
        else c.lineTo(ox, oy);
        c.lineTo(ix, iy);
      }
      c.closePath();
      c.fill();
      c.stroke();
    } else if (meta.shapeKind === 'wedge') {
      c.beginPath();
      c.arc(cx, cy, radius * 1.1, -Math.PI * 0.6, Math.PI * 0.6);
      c.closePath();
      c.fill();
      c.stroke();
    } else {
      // BoltedAlloy hexagonal bolt
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const px = cx + Math.cos(ang) * (radius * 1.15);
        const py = cy + Math.sin(ang) * (radius * 1.15);
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  function renderCanvas(): void {
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / state.gridSize;
    animPhase = (animPhase + 0.08) % 1;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw 12x12 tiles, ore veins, and placed blocks
    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const tile = state.grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        const cx = px + cellSize / 2;
        const cy = py + cellSize / 2;

        // Base industrial floor
        ctx.fillStyle = (x + y) % 2 === 0 ? '#0f172a' : '#111827';
        ctx.fillRect(px, py, cellSize, cellSize);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellSize, cellSize);

        // Draw underlying ore vein
        if (tile.vein !== 'none') {
          const veinItem =
            tile.vein === 'copper_vein'
              ? 'CuCircle'
              : tile.vein === 'iron_vein'
                ? 'FeSquare'
                : 'AuStar';
          ctx.save();
          ctx.globalAlpha = tile.block === 'empty' ? 0.78 : 0.32;
          drawItemShape(ctx, veinItem, px + cellSize * 0.3, py + cellSize * 0.32, 4.5);
          drawItemShape(ctx, veinItem, px + cellSize * 0.68, py + cellSize * 0.65, 4.5);
          ctx.restore();
        }

        // Draw building block
        if (tile.block !== 'empty') {
          const meta = BLOCKS[tile.block];
          ctx.fillStyle = meta.color;
          ctx.fillRect(px + 3, py + 3, cellSize - 6, cellSize - 6);
          ctx.strokeStyle = tile.congested ? '#ef4444' : meta.accentColor;
          ctx.lineWidth = tile.congested ? 2.5 : 1.5;
          ctx.strokeRect(px + 3, py + 3, cellSize - 6, cellSize - 6);

          // Direction chevron for rotatable blocks
          if (meta.rotatable) {
            const d = DIRECTION_DELTAS[tile.direction];
            ctx.fillStyle = meta.accentColor;
            ctx.beginPath();
            ctx.arc(
              cx + d.dx * (cellSize * 0.28),
              cy + d.dy * (cellSize * 0.28),
              3.5,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // Block label
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(meta.shortLabel, cx, py + 13);

          // Turret magazine bar or dry indicator
          if (meta.isTurret) {
            const ratio = tile.maxAmmo > 0 ? tile.ammoCount / tile.maxAmmo : 0;
            ctx.fillStyle = '#090d16';
            ctx.fillRect(px + 6, py + cellSize - 10, cellSize - 12, 5);
            ctx.fillStyle = ratio > 0 ? '#22c55e' : '#ef4444';
            ctx.fillRect(px + 6, py + cellSize - 10, (cellSize - 12) * ratio, 5);

            if (tile.ammoCount === 0) {
              ctx.fillStyle = '#fca5a5';
              ctx.font = 'bold 8px Inter, sans-serif';
              ctx.fillText('NO AMMO', cx, cy + 5);
            }
          }

          // Draw item sitting on belt / splitter / miner / smelter
          if (tile.item) {
            const d = DIRECTION_DELTAS[tile.direction];
            const shift = tile.congested ? 0 : (animPhase - 0.5) * 6;
            drawItemShape(
              ctx,
              tile.item.type,
              cx + d.dx * shift,
              cy + 4 + d.dy * shift,
              6.5
            );
          }
        }
      }
    }

    // 2. Draw hovered tile highlight and turret range preview
    if (hoveredCell) {
      const hx = hoveredCell.x * cellSize;
      const hy = hoveredCell.y * cellSize;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 1, hy + 1, cellSize - 2, cellSize - 2);

      const hoveredTile = getTile(state, hoveredCell.x, hoveredCell.y);
      const previewBlock =
        hoveredTile && BLOCKS[hoveredTile.block].isTurret
          ? hoveredTile.block
          : selectedTool !== 'demolish' && BLOCKS[selectedTool].isTurret
            ? selectedTool
            : null;

      if (previewBlock) {
        const range = (BLOCKS[previewBlock].turretRange ?? 3.8) * cellSize;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.beginPath();
        ctx.arc(hx + cellSize / 2, hy + cellSize / 2, range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Draw active turret shots
    for (const shot of state.activeShots) {
      ctx.save();
      ctx.strokeStyle = shot.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo((shot.fromX + 0.5) * cellSize, (shot.fromY + 0.5) * cellSize);
      ctx.lineTo((shot.toX + 0.5) * cellSize, (shot.toY + 0.5) * cellSize);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw incoming enemy wave units
    for (const enemy of state.enemies) {
      const meta = ENEMY_TYPES[enemy.type];
      const ex = (enemy.x + 0.5) * cellSize;
      const ey = (enemy.y + 0.5) * cellSize;
      const rad = cellSize * meta.radiusRatio;

      ctx.save();
      ctx.fillStyle = meta.color;
      ctx.strokeStyle = enemy.isShielded ? '#38bdf8' : '#fecaca';
      ctx.lineWidth = enemy.isBoss ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(ex, ey, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Enemy HP bar
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      const barW = cellSize * 0.75;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ex - barW / 2, ey - rad - 7, barW, 4);
      ctx.fillStyle = enemy.isBoss ? '#f43f5e' : '#22c55e';
      ctx.fillRect(ex - barW / 2, ey - rad - 7, barW * hpRatio, 4);
      ctx.restore();
    }
  }

  function getCellFromPointerEvent(ev: MouseEvent): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const relX = ev.clientX - rect.left;
    const relY = ev.clientY - rect.top;
    const x = Math.floor((relX / rect.width) * state.gridSize);
    const y = Math.floor((relY / rect.height) * state.gridSize);
    if (x < 0 || y < 0 || x >= state.gridSize || y >= state.gridSize) return null;
    return { x, y };
  }

  canvas.addEventListener('mousemove', (ev) => {
    hoveredCell = getCellFromPointerEvent(ev);
    updateHUD();
    renderCanvas();
  });

  canvas.addEventListener('click', (ev) => {
    const cell = getCellFromPointerEvent(ev);
    if (!cell) return;
    const existing = getTile(state, cell.x, cell.y);

    if (selectedTool === 'demolish') {
      const res = applyBuildCommand(state, {
        type: 'demolish',
        x: cell.x,
        y: cell.y,
      });
      if (res.ok) audio.playDemolish();
    } else if (existing && existing.block === 'splitter' && selectedTool === 'splitter') {
      applyBuildCommand(state, {
        type: 'toggle_splitter_ratio',
        x: cell.x,
        y: cell.y,
      });
      audio.playPlaceClank();
    } else {
      const res = applyBuildCommand(state, {
        type: 'place',
        x: cell.x,
        y: cell.y,
        blockType: selectedTool,
        direction: currentDirection,
        respectTechLock: true,
      });
      if (res.ok) {
        audio.playPlaceClank();
      }
    }

    saveGameToStorage(state);
    renderToolbar();
    updateHUD();
    renderCanvas();
  });

  canvas.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    const cell = getCellFromPointerEvent(ev);
    if (!cell) return;
    const res = applyBuildCommand(state, { type: 'demolish', x: cell.x, y: cell.y });
    if (res.ok) {
      audio.playDemolish();
      saveGameToStorage(state);
      updateHUD();
      renderCanvas();
    }
  });

  rotateBtn.addEventListener('click', () => {
    currentDirection = rotateDirectionCW(currentDirection);
    if (hoveredCell) {
      applyBuildCommand(state, {
        type: 'rotate',
        x: hoveredCell.x,
        y: hoveredCell.y,
      });
    }
    updateHUD();
    renderCanvas();
  });

  demolishBtn.addEventListener('click', () => {
    selectedTool = selectedTool === 'demolish' ? 'miner' : 'demolish';
    renderToolbar();
  });

  waveBtn.addEventListener('click', () => {
    if (state.status === 'victory') {
      state.endlessMode = true;
      state.status = 'playing';
      state.wave += 1;
    }
    if (!state.waveActive) {
      const waveDef = getWaveDefinition(state.wave);
      triggerNextWave(state, { earlyBonus: true });
      audio.playWaveKlaxon(waveDef.isBossWave);
      renderToolbar();
      renderTechList();
      updateHUD();
      renderCanvas();
    }
  });

  blueprintBtn.addEventListener('click', () => {
    deployStarterBlueprint(state);
    audio.playPlaceClank();
    saveGameToStorage(state);
    updateHUD();
    renderCanvas();
  });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? '[P] Resume' : '[P] Pause';
  });

  resetBtn.addEventListener('click', () => {
    clearSavedGame();
    state = createInitialState({ seed: state.seed });
    renderToolbar();
    renderTechList();
    updateHUD();
    renderCanvas();
  });

  // Debug buttons
  root.querySelector('[data-bb="dbg-credits"]')?.addEventListener('click', () => {
    state.credits += 250;
    updateHUD();
  });
  root.querySelector('[data-bb="dbg-unlock"]')?.addEventListener('click', () => {
    unlockTechForWave(state, 12);
    renderToolbar();
    renderTechList();
    updateHUD();
  });
  root.querySelector('[data-bb="dbg-step"]')?.addEventListener('click', () => {
    stepFactoryTick(state);
    renderToolbar();
    renderTechList();
    updateHUD();
    renderCanvas();
  });
  root.querySelector('[data-bb="dbg-wave12"]')?.addEventListener('click', () => {
    state.wave = 12;
    unlockTechForWave(state, 12);
    renderToolbar();
    renderTechList();
    updateHUD();
  });
  root.querySelector('[data-bb="dbg-wave30"]')?.addEventListener('click', () => {
    state.wave = 30;
    unlockTechForWave(state, 30);
    renderToolbar();
    renderTechList();
    updateHUD();
  });

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
      return;
    }
    const key = ev.key.toLowerCase();
    if (key === 'r') {
      currentDirection = rotateDirectionCW(currentDirection);
      if (hoveredCell) {
        applyBuildCommand(state, {
          type: 'rotate',
          x: hoveredCell.x,
          y: hoveredCell.y,
        });
      }
      updateHUD();
      renderCanvas();
    } else if (key === 'x') {
      if (hoveredCell) {
        applyBuildCommand(state, {
          type: 'demolish',
          x: hoveredCell.x,
          y: hoveredCell.y,
        });
      } else {
        selectedTool = selectedTool === 'demolish' ? 'miner' : 'demolish';
      }
      renderToolbar();
      updateHUD();
      renderCanvas();
    } else if (key === ' ') {
      ev.preventDefault();
      if (!state.waveActive && state.status === 'playing') {
        triggerNextWave(state, { earlyBonus: true });
        renderToolbar();
        renderTechList();
        updateHUD();
        renderCanvas();
      }
    } else if (key === 'p') {
      paused = !paused;
      pauseBtn.textContent = paused ? '[P] Resume' : '[P] Pause';
    } else if (key === 'd') {
      debugVisible = !debugVisible;
      updateHUD();
    } else {
      for (const blockId of BUILDABLE_BLOCK_ORDER) {
        if (BLOCKS[blockId].hotkey === key && isBlockUnlocked(state, blockId)) {
          selectedTool = blockId;
          renderToolbar();
          break;
        }
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);

  const tickTimer = window.setInterval(() => {
    if (paused || state.status !== 'playing') return;
    const prevShots = state.stats.shotsFired;
    const prevRefined = state.stats.itemsRefined;
    const prevTechCount = state.unlockedBlocks.length;

    stepFactoryTick(state);

    if (state.stats.shotsFired > prevShots) {
      audio.playTurretPulse();
    }
    if (state.stats.itemsRefined > prevRefined) {
      audio.playSmelterHiss();
    }
    if (state.unlockedBlocks.length > prevTechCount) {
      renderToolbar();
      renderTechList();
    }
    if (state.tick % 10 === 0) {
      saveGameToStorage(state);
    }

    updateHUD();
    renderCanvas();
  }, CONFIG.TICK_INTERVAL_MS);

  renderToolbar();
  renderTechList();
  updateHUD();
  renderCanvas();

  return {
    destroy(): void {
      window.clearInterval(tickTimer);
      window.removeEventListener('keydown', onKeyDown);
      audio.destroy();
      container.innerHTML = '';
    },
    getState(): GameState {
      return state;
    },
    restartWithSeed(seed: number): void {
      state = createInitialState({ seed });
      renderToolbar();
      renderTechList();
      updateHUD();
      renderCanvas();
    },
    toggleDebug(force?: boolean): void {
      debugVisible = force !== undefined ? force : !debugVisible;
      updateHUD();
    },
  };
}
