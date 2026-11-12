import type { ArgonGameInstance, ArgonGameMetadata } from '../../shared-contract';
import './style.css';
import { SnapLanceSynth } from './audio';
import {
  SnapLanceEngine,
  UPGRADE_CATALOG,
  WAVE_DURATION_SECONDS,
  type EnemyEntity,
  type UpgradeCardSpec,
} from './engine';

export { SnapLanceEngine, SnapLanceSynth, UPGRADE_CATALOG, WAVE_DURATION_SECONDS };

export const metadata: ArgonGameMetadata = {
  id: '13-snap-lance',
  number: 13,
  title: 'SNAP-LANCE',
  subtitle: 'Tactile Kinetic Ricochet Arena',
  genre: 'Tactile Kinetic Ricochet Arena',
  primaryReference: 'HoI / Hyper Light Dash + Pinball Billiards',
  supportingReference: 'Disc Room / Geometry Wars',
  oneSentenceLoop:
    'Hold to coil and aim multi-wall ricochets while crimson threats close in, then release to snap-launch through targets in a harmonic combo streak.',
  shortGoal: 'Survive each 30-second wave and draft game-changing ricochet upgrades.',
  longGoal: 'Chain multi-bounce Apex trickshots for an unbroken harmonic combo streak.',
  controlsSummary: 'Mouse Move + Hold/Release Left Click (or Arrow/WASD + Spacebar)',
  accentColor: '#00f2fe',
};

const STORAGE_KEY = 'argon.snapLance.v1';

const COLORS = {
  bgDeep: '#0b0e14',
  bgGrid: '#121824',
  wallBorder: '#223049',
  cyanPower: '#00f2fe',
  cyanSoft: 'rgba(0, 242, 254, 0.24)',
  cyanGlow: 'rgba(0, 242, 254, 0.65)',
  goldApex: '#fde047',
  goldSoft: 'rgba(253, 224, 71, 0.28)',
  crimsonDanger: '#ff2a5f',
  crimsonSoft: 'rgba(255, 42, 95, 0.24)',
  white: '#f8fafc',
  mutedText: '#475569',
} as const;

export interface SnapLanceInstance extends ArgonGameInstance {
  engine: SnapLanceEngine;
}

export function mountGame(
  container: HTMLElement,
  options: { initialSeed?: number; debug?: boolean } = {}
): SnapLanceInstance {
  const synth = new SnapLanceSynth();
  const engine = new SnapLanceEngine(synth, options.initialSeed ?? 20261108);

  // Rule 2: Start with ONLY the canvas and at most 2 HUD numbers.
  container.innerHTML = `
    <div class="sl-viewport" id="sl-viewport">
      <div class="sl-hud" aria-live="off">
        <span id="sl-hud-score" class="sl-hud-number sl-hud-score">0</span>
        <span id="sl-hud-timer" class="sl-hud-number sl-hud-timer">30</span>
      </div>
      <canvas id="sl-canvas" class="sl-canvas"></canvas>
      <div id="sl-upgrade-overlay" class="sl-overlay" hidden>
        <h2 id="sl-overlay-title" class="sl-overlay-title">PICK 1 UPGRADE</h2>
        <div id="sl-cards-row" class="sl-cards-row"></div>
      </div>
    </div>
  `;

  const viewport = container.querySelector<HTMLElement>('#sl-viewport')!;
  const canvas = container.querySelector<HTMLCanvasElement>('#sl-canvas')!;
  const scoreEl = container.querySelector<HTMLElement>('#sl-hud-score')!;
  const timerEl = container.querySelector<HTMLElement>('#sl-hud-timer')!;
  const overlayEl = container.querySelector<HTMLElement>('#sl-upgrade-overlay')!;
  const overlayTitleEl = container.querySelector<HTMLElement>('#sl-overlay-title')!;
  const cardsRowEl = container.querySelector<HTMLElement>('#sl-cards-row')!;

  const ctx = canvas.getContext('2d');

  let lastRenderedPhase: SnapLanceEngine['phase'] = 'playing';
  let animFrameId: number | null = null;
  let lastTimestamp = 0;
  let hasDashedOnce = false;

  const heldKeys = new Set<string>();

  function syncCanvasSize(): void {
    const rect = viewport.getBoundingClientRect();
    const w = rect.width > 100 ? Math.round(rect.width) : 960;
    const h = rect.height > 100 ? Math.round(rect.height) : 600;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      engine.resize(w, h);
    }
  }

  syncCanvasSize();

  function updateKeyboardAim(): void {
    let kx = 0;
    let ky = 0;
    if (heldKeys.has('ArrowLeft') || heldKeys.has('KeyA')) kx -= 1;
    if (heldKeys.has('ArrowRight') || heldKeys.has('KeyD')) kx += 1;
    if (heldKeys.has('ArrowUp') || heldKeys.has('KeyW')) ky -= 1;
    if (heldKeys.has('ArrowDown') || heldKeys.has('KeyS')) ky += 1;
    engine.keyAimX = kx;
    engine.keyAimY = ky;
  }

  function renderUpgradeOverlay(cards: UpgradeCardSpec[]): void {
    overlayTitleEl.textContent = `WAVE ${engine.wave} CLEAR — PICK 1 UPGRADE`;
    cardsRowEl.innerHTML = cards
      .map(
        (c, idx) => `
        <button type="button" class="sl-upgrade-card" data-upgrade-index="${idx}" data-upgrade-id="${c.id}">
          <span class="sl-card-tag">[${idx + 1}] ${c.tag}</span>
          <span class="sl-card-name">${c.title}</span>
          <p class="sl-card-desc">${c.description}</p>
        </button>
      `
      )
      .join('');
    overlayEl.hidden = false;
  }

  function renderGameOverOverlay(): void {
    try {
      const prevBest = Number(localStorage.getItem(STORAGE_KEY) || '0');
      if (engine.score > prevBest) {
        localStorage.setItem(STORAGE_KEY, String(engine.score));
      }
    } catch {
      // Ignore storage failures in restricted contexts
    }

    overlayTitleEl.textContent = `CORE SHATTERED — SCORE ${engine.score.toLocaleString()}`;
    cardsRowEl.innerHTML = `
      <button type="button" id="sl-btn-restart" class="sl-restart-btn">
        CLICK OR PRESS SPACE TO PLAY AGAIN
      </button>
    `;
    overlayEl.hidden = false;
  }

  const onOverlayClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const cardBtn = target.closest<HTMLButtonElement>('[data-upgrade-index]');
    if (cardBtn && engine.phase === 'upgrade_draft') {
      const idx = Number(cardBtn.dataset.upgradeIndex);
      if (engine.selectUpgrade(idx)) {
        overlayEl.hidden = true;
        lastRenderedPhase = 'playing';
      }
      return;
    }

    if (engine.phase === 'gameover') {
      engine.resetRun();
      overlayEl.hidden = true;
      lastRenderedPhase = 'playing';
    }
  };

  overlayEl.addEventListener('click', onOverlayClick);

  const onPointerMove = (e: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      engine.pointerX = ((e.clientX - rect.left) / rect.width) * engine.width;
      engine.pointerY = ((e.clientY - rect.top) / rect.height) * engine.height;
    } else {
      engine.pointerX = e.clientX;
      engine.pointerY = e.clientY;
    }
    engine.pointerActive = true;
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    onPointerMove(e);
    if (engine.phase === 'gameover') {
      engine.resetRun();
      overlayEl.hidden = true;
      lastRenderedPhase = 'playing';
      return;
    }
    engine.beginCharge();
  };

  const onPointerUp = (): void => {
    if (engine.isHoldingCharge || engine.player.state === 'charging') {
      hasDashedOnce = true;
      engine.releaseCharge();
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (engine.phase === 'upgrade_draft') {
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        if (engine.selectUpgrade(idx)) {
          overlayEl.hidden = true;
          lastRenderedPhase = 'playing';
        }
      }
      return;
    }

    if (engine.phase === 'gameover' && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      engine.resetRun();
      overlayEl.hidden = true;
      lastRenderedPhase = 'playing';
      return;
    }

    if (
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'KeyW' ||
      e.code === 'KeyA' ||
      e.code === 'KeyS' ||
      e.code === 'KeyD'
    ) {
      heldKeys.add(e.code);
      updateKeyboardAim();
    }

    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      engine.beginCharge();
    }
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    if (heldKeys.has(e.code)) {
      heldKeys.delete(e.code);
      updateKeyboardAim();
    }
    if (e.code === 'Space') {
      e.preventDefault();
      hasDashedOnce = true;
      engine.releaseCharge();
    }
  };

  const onResize = (): void => {
    syncCanvasSize();
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onResize);

  function drawEnemy(c: CanvasRenderingContext2D, e: EnemyEntity): void {
    c.save();
    c.translate(e.x, e.y);

    // 1. Honest shrinking spawn ring telegraph before enemy becomes active
    if (e.spawnTelegraph > 0) {
      const ratio = e.spawnTelegraph / e.spawnMax;
      const ringRadius = e.radius + ratio * 38;
      c.strokeStyle = COLORS.crimsonDanger;
      c.lineWidth = 2;
      c.globalAlpha = 0.75 * (1 - ratio * 0.5);
      c.beginPath();
      c.arc(0, 0, ringRadius, 0, Math.PI * 2);
      c.stroke();

      c.fillStyle = COLORS.crimsonSoft;
      c.beginPath();
      c.arc(0, 0, e.radius * (1 - ratio * 0.6), 0, Math.PI * 2);
      c.fill();
      c.restore();
      return;
    }

    // 2. Charger attack lock-on sightline telegraph
    if (e.kind === 'charger' && e.attackTelegraph > 0) {
      c.save();
      c.strokeStyle = COLORS.crimsonDanger;
      c.lineWidth = 2.5;
      c.setLineDash([7, 6]);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(e.lungeDirX * 260, e.lungeDirY * 260);
      c.stroke();
      c.restore();
    }

    // 3. Pulsar expanding blast ring telegraph
    if (e.kind === 'pulsar' && e.attackTelegraph > 0) {
      const progress = Math.min(1, e.attackTelegraph / 1.45);
      c.strokeStyle = COLORS.crimsonDanger;
      c.lineWidth = 1.8;
      c.beginPath();
      c.arc(0, 0, 115, 0, Math.PI * 2);
      c.stroke();

      c.fillStyle = COLORS.crimsonSoft;
      c.beginPath();
      c.arc(0, 0, 115 * progress, 0, Math.PI * 2);
      c.fill();
    }

    // Apply squash & stretch
    c.rotate(e.stretchAngle || e.facingAngle);
    c.scale(e.scaleX, e.scaleY);

    c.fillStyle = COLORS.crimsonDanger;
    c.strokeStyle = COLORS.white;
    c.lineWidth = 2;

    if (e.kind === 'charger') {
      // Crisp aggressive crimson wedge
      const r = e.radius * 1.15;
      c.beginPath();
      c.moveTo(r, 0);
      c.lineTo(-r * 0.8, -r * 0.78);
      c.lineTo(-r * 0.45, 0);
      c.lineTo(-r * 0.8, r * 0.78);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (e.kind === 'pulsar') {
      // Hexagonal crimson pulsar
      c.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        const px = Math.cos(a) * e.radius;
        const py = Math.sin(a) * e.radius;
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.stroke();
    } else {
      // Honest circular body for Drifter & Shielded Guard
      c.beginPath();
      c.arc(0, 0, e.radius, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }

    // Frontal arc armor for Shielded Guard
    if (e.kind === 'shielded') {
      c.strokeStyle = COLORS.white;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(0, 0, e.radius + 6, -0.95, 0.95);
      c.stroke();
    }

    c.restore();
  }

  function renderFrame(): void {
    if (!ctx) return;

    const w = engine.width;
    const h = engine.height;
    const pad = engine.wallPadding;
    const p = engine.player;

    // Update the ONLY 2 HUD numbers (Score & Wave Timer)
    scoreEl.textContent = String(engine.score);
    timerEl.textContent = String(Math.ceil(engine.waveTimeRemaining));

    // Handle phase overlay transitions
    if (engine.phase !== lastRenderedPhase) {
      lastRenderedPhase = engine.phase;
      if (engine.phase === 'upgrade_draft') {
        renderUpgradeOverlay(engine.offeredUpgrades);
      } else if (engine.phase === 'gameover') {
        renderGameOverOverlay();
      } else {
        overlayEl.hidden = true;
      }
    }

    ctx.save();
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(0, 0, w, h);

    // Apply directional spring camera shake
    ctx.translate(engine.shakeX, engine.shakeY);

    // Subtle geometric arena grid
    ctx.strokeStyle = COLORS.bgGrid;
    ctx.lineWidth = 1;
    const gridStep = 64;
    ctx.beginPath();
    for (let x = pad; x <= w - pad; x += gridStep) {
      ctx.moveTo(x, pad);
      ctx.lineTo(x, h - pad);
    }
    for (let y = pad; y <= h - pad; y += gridStep) {
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
    }
    ctx.stroke();

    // Reactive Arena Boundary Walls (flexing outward on bounces!)
    const leftX = pad - engine.wallFlexLeft * 8;
    const rightX = w - pad + engine.wallFlexRight * 8;
    const topY = pad - engine.wallFlexTop * 8;
    const bottomY = h - pad + engine.wallFlexBottom * 8;

    ctx.strokeStyle =
      engine.wallFlexLeft + engine.wallFlexRight + engine.wallFlexTop + engine.wallFlexBottom > 0.15
        ? COLORS.cyanPower
        : COLORS.wallBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(leftX, topY, rightX - leftX, bottomY - topY);

    // Subtle floor etching on Wave 1 before first dash (0 tutorial walls!)
    if (engine.wave === 1 && !hasDashedOnce && p.state !== 'dash') {
      ctx.save();
      ctx.fillStyle = COLORS.mutedText;
      ctx.font = '800 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HOLD & RELEASE TO SNAP-LANCE', w * 0.5, h - pad - 18);
      ctx.restore();
    }

    // Live Combo Streak floor badge in center of arena when streak >= 2
    if (engine.comboStreak >= 2) {
      ctx.save();
      ctx.fillStyle =
        engine.comboStreak >= 6 ? 'rgba(253, 224, 71, 0.13)' : 'rgba(0, 242, 254, 0.10)';
      ctx.font = '900 92px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${engine.comboStreak}x`, w * 0.5, h * 0.5);
      ctx.restore();
    }

    // Multi-Bounce Raycast Sightline when charging (or subtle short sightline when gliding)
    if (p.state === 'charging' || p.state === 'glide') {
      const bouncesToPreview =
        p.state === 'charging' ? (p.chargeTier === 3 ? 5 : p.chargeTier === 2 ? 3 : 1) : 0;
      const segments = engine.computeRaycastBouncePath(bouncesToPreview);
      const isApex = p.chargeTier === 3;

      ctx.save();
      ctx.strokeStyle = isApex ? COLORS.goldApex : COLORS.cyanPower;
      ctx.lineWidth = p.state === 'charging' ? (isApex ? 3 : 2) : 1.2;
      ctx.setLineDash(p.state === 'charging' ? [10, 8] : [4, 10]);

      segments.forEach((seg, idx) => {
        ctx.globalAlpha =
          p.state === 'charging' ? Math.max(0.2, 0.85 - idx * 0.14) : 0.22;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();

        if (p.state === 'charging' && idx < segments.length - 1) {
          ctx.fillStyle = isApex ? COLORS.goldApex : COLORS.cyanPower;
          ctx.beginPath();
          ctx.arc(seg.x2, seg.y2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // Render Arena Resonance Bumpers
    for (const b of engine.bumpers) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.squash, b.squash);
      ctx.fillStyle = COLORS.cyanSoft;
      ctx.strokeStyle = COLORS.cyanPower;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, b.radius * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Tapered Velocity Ribbon Trail
    if (engine.trail.length > 1) {
      for (let i = 1; i < engine.trail.length; i++) {
        const prev = engine.trail[i - 1];
        const curr = engine.trail[i];
        const ratio = i / engine.trail.length;
        ctx.strokeStyle =
          curr.isDash && p.isApexDash ? COLORS.goldApex : COLORS.cyanPower;
        ctx.globalAlpha = ratio * (curr.isDash ? 0.65 : 0.28);
        ctx.lineWidth = Math.max(2, curr.radius * 1.35 * ratio);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Render Dash Afterimage Silhouettes
    for (const a of engine.afterimages) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle);
      ctx.scale(a.scaleX, a.scaleY);
      ctx.globalAlpha = a.alpha * 0.5;
      ctx.fillStyle = p.isApexDash ? COLORS.goldApex : COLORS.cyanPower;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Friendly Shards & Boomerang Orbs
    for (const s of engine.shards) {
      ctx.save();
      ctx.fillStyle = COLORS.cyanPower;
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Render Phantom Echo Ghosts
    for (const ph of engine.phantoms) {
      if (ph.delayTimer > 0) continue;
      ctx.save();
      ctx.translate(ph.x, ph.y);
      ctx.rotate(ph.angle);
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = COLORS.cyanPower;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, ph.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Enemies
    for (const e of engine.enemies) {
      drawEnemy(ctx, e);
    }

    // Render Orbiting Sawblade Upgrade
    if (engine.activeUpgrades.has('sawblade_orbit')) {
      const orbitDist = p.state === 'dash' ? 66 : 46;
      const bx = p.x + Math.cos(p.orbitAngle) * orbitDist;
      const by = p.y + Math.sin(p.orbitAngle) * orbitDist;
      ctx.save();
      ctx.strokeStyle = COLORS.cyanSoft;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, orbitDist, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = COLORS.cyanPower;
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Render Player Core (with Anticipation Pullback, Squash-and-Stretch, and Orbiting Shield Petals)
    ctx.save();
    const chargeRatio = Math.min(1, p.chargeTime / p.maxChargeTime);
    const pullback = p.state === 'charging' ? chargeRatio * 10 : 0;
    const jitterX =
      p.state === 'charging' ? (Math.sin(p.chargeTime * 75) * chargeRatio * 2.2) : 0;
    const jitterY =
      p.state === 'charging' ? (Math.cos(p.chargeTime * 85) * chargeRatio * 2.2) : 0;

    const renderX = p.x - Math.cos(p.aimAngle) * pullback + jitterX;
    const renderY = p.y - Math.sin(p.aimAngle) * pullback + jitterY;

    // Charge Tension Ring around player when holding
    if (p.state === 'charging') {
      const ringColor = p.chargeTier === 3 ? COLORS.goldApex : COLORS.cyanPower;
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = p.chargeTier === 3 ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        p.radius + 14,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * chargeRatio
      );
      ctx.stroke();
    }

    // Orbiting Shield Petals (Visual Integrity on the core itself — zero health bars needed!)
    for (let s = 0; s < p.shields; s++) {
      const petalAngle = p.orbitAngle * 0.6 + (s * Math.PI * 2) / p.maxShields;
      const px = renderX + Math.cos(petalAngle) * (p.radius + 9);
      const py = renderY + Math.sin(petalAngle) * (p.radius + 9);
      ctx.fillStyle = COLORS.cyanPower;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(renderX, renderY);
    ctx.rotate(p.stretchAngle);
    ctx.scale(p.scaleX, p.scaleY);

    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const coreColor =
      (p.state === 'charging' && p.chargeTier === 3) ||
      (p.state === 'dash' && p.isApexDash)
        ? COLORS.goldApex
        : COLORS.cyanPower;

    ctx.fillStyle = coreColor;
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 2.5;

    // Sleek directional lance-head core geometry
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner directional pointer chevron inside the core
    ctx.fillStyle = COLORS.bgDeep;
    ctx.beginPath();
    ctx.moveTo(p.radius * 0.65, 0);
    ctx.lineTo(-p.radius * 0.35, -p.radius * 0.45);
    ctx.lineTo(-p.radius * 0.15, 0);
    ctx.lineTo(-p.radius * 0.35, p.radius * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Render Shock Rings
    for (const r of engine.shockRings) {
      ctx.save();
      ctx.strokeStyle =
        r.color === 'gold'
          ? COLORS.goldApex
          : r.color === 'crimson'
            ? COLORS.crimsonDanger
            : COLORS.cyanPower;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = r.lineWidth;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Impact Slash Flashes
    for (const f of engine.slashFlashes) {
      ctx.save();
      ctx.strokeStyle =
        f.color === 'gold'
          ? COLORS.goldApex
          : f.color === 'crimson'
            ? COLORS.crimsonDanger
            : COLORS.white;
      ctx.globalAlpha = Math.max(0, f.alpha);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x1, f.y1);
      ctx.lineTo(f.x2, f.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Physical Bouncing Sparks
    for (const sp of engine.sparks) {
      ctx.save();
      ctx.strokeStyle =
        sp.color === 'gold'
          ? COLORS.goldApex
          : sp.color === 'crimson'
            ? COLORS.crimsonDanger
            : sp.color === 'white'
              ? COLORS.white
              : COLORS.cyanPower;
      ctx.globalAlpha = Math.max(0, sp.life / sp.maxLife);
      ctx.lineWidth = sp.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sp.prevX, sp.prevY);
      ctx.lineTo(sp.x, sp.y);
      ctx.stroke();
      ctx.restore();
    }

    // Render Floating Callouts
    for (const c of engine.callouts) {
      ctx.save();
      ctx.fillStyle =
        c.color === 'gold'
          ? COLORS.goldApex
          : c.color === 'crimson'
            ? COLORS.crimsonDanger
            : COLORS.cyanPower;
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.font = `900 ${Math.round(15 * c.scale)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(c.text, c.x, c.y);
      ctx.restore();
    }

    ctx.restore();
  }

  function loop(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    engine.step(dt);
    renderFrame();

    animFrameId = requestAnimationFrame(loop);
  }

  renderFrame();
  if (typeof requestAnimationFrame !== 'undefined') {
    animFrameId = requestAnimationFrame(loop);
  }

  return {
    engine,
    destroy(): void {
      if (animFrameId !== null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(animFrameId);
      }
      overlayEl.removeEventListener('click', onOverlayClick);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      container.innerHTML = '';
    },
    restartWithSeed(seed: number): void {
      engine.resetRun(seed);
      overlayEl.hidden = true;
      lastRenderedPhase = 'playing';
      renderFrame();
    },
    toggleDebug(): void {
      // Zero debug UI bloat per Rule 2
    },
    getStateSnapshot(): Record<string, unknown> {
      return {
        score: engine.score,
        comboStreak: engine.comboStreak,
        wave: engine.wave,
        waveTimeRemaining: engine.waveTimeRemaining,
        phase: engine.phase,
        playerState: engine.player.state,
        shields: engine.player.shields,
        activeUpgrades: Array.from(engine.activeUpgrades),
      };
    },
  };
}
