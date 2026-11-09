import type { ArgonGameInstance, ArgonGameMetadata } from '../../shared-contract';
import { SlingCoreEngine } from './engine';
import { SlingCoreRenderer } from './renderer';
import { SlingSynth } from './synth';

export const metadata: ArgonGameMetadata = {
  id: '13-slingcore',
  number: 13,
  title: 'SLINGCORE',
  subtitle: 'Elastic Ricochet & Overcharge Kinetic Arena',
  genre: 'Tactile Physics Action / Push-Your-Luck Ricochet Roguelite',
  primaryReference: 'HoIing / Hyper Light Drifter / Peggle',
  supportingReference: 'Disc Room / Geometry Wars',
  oneSentenceLoop:
    'Hold to anchor and coil your magnetic Core into the Overcharge zone while threats close in, then release to snap-launch across the arena, chaining wall ricochets and enemy smashes before banking your multiplier.',
  shortGoal: 'Survive Wave 1 (30s) and draft your first game-changing trajectory upgrade.',
  longGoal: 'Chain 10+ ricochet multipliers across all 5 progressive wave mechanics.',
  controlsSummary: 'Mouse Move + Hold/Release Left Click (or A/D/Arrows + Hold/Release Space)',
  accentColor: '#00f2fe',
};

export interface SlingCoreInstance extends ArgonGameInstance {
  engine: SlingCoreEngine;
}

export function mountGame(
  container: HTMLElement,
  options: { initialSeed?: number; debug?: boolean } = {},
): SlingCoreInstance {
  container.innerHTML = '';

  const style = document.createElement('style');
  style.textContent = `
    .slingcore-stage {
      position: relative;
      width: 100%;
      height: 100dvh;
      min-height: 480px;
      background: #090d16;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      content-visibility: auto;
      contain-intrinsic-size: auto none auto 600px;
    }
    .slingcore-canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: crosshair;
      touch-action: none;
    }
    /* Strictly 2 HUD numbers: Score (top-left) and Wave (top-right) — Rule 2 */
    .slingcore-hud {
      position: absolute;
      top: 34px;
      left: 42px;
      right: 42px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      pointer-events: none;
      z-index: 2;
    }
    .slingcore-hud-num {
      font-variant-numeric: tabular-nums;
      font-weight: 900;
      font-size: clamp(1.75rem, 3.2vw, 2.6rem);
      letter-spacing: -0.03em;
      color: #f8fafc;
      text-shadow: 0 2px 16px rgba(0, 242, 254, 0.28);
      line-height: 1;
      transition: transform 0.08s ease-out;
    }
    .slingcore-hud-wave {
      color: #00f2fe;
    }
    /* Minimal Between-Wave 3-Card Upgrade Picker (Rule 7) */
    .slingcore-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(9, 13, 22, 0.84);
      backdrop-filter: blur(6px);
      z-index: 5;
      padding: 24px;
    }
    .slingcore-overlay[hidden] {
      display: none !important;
    }
    .slingcore-draft-title {
      color: #00f2fe;
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin: 0 0 20px 0;
    }
    .slingcore-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(200px, 270px));
      gap: 18px;
      max-width: 860px;
      width: 100%;
    }
    @media (max-width: 720px) {
      .slingcore-cards {
        grid-template-columns: 1fr;
      }
    }
    .slingcore-card {
      background: #0f172a;
      border: 2px solid #1e293b;
      border-radius: 14px;
      padding: 22px 18px;
      color: #f8fafc;
      text-align: left;
      cursor: pointer;
      transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .slingcore-card:hover,
    .slingcore-card:focus-visible {
      border-color: #00f2fe;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 242, 254, 0.18);
      outline: none;
    }
    .slingcore-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .slingcore-card-glyph {
      font-size: 1.5rem;
      color: #00f2fe;
    }
    .slingcore-card-key {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
    }
    .slingcore-card-name {
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #f8fafc;
      margin: 0;
    }
    .slingcore-card-desc {
      font-size: 0.88rem;
      line-height: 1.45;
      color: #cbd5e1;
      margin: 0;
    }
  `;
  container.appendChild(style);

  const stage = document.createElement('div');
  stage.className = 'slingcore-stage';
  stage.innerHTML = `
    <div class="slingcore-hud" aria-hidden="true">
      <span id="sling-hud-score" class="slingcore-hud-num">0</span>
      <span id="sling-hud-wave" class="slingcore-hud-num slingcore-hud-wave">1</span>
    </div>
    <canvas class="slingcore-canvas"></canvas>
    <div id="sling-draft-overlay" class="slingcore-overlay" hidden>
      <p id="sling-overlay-heading" class="slingcore-draft-title">WAVE CLEARED — PICK 1 UPGRADE</p>
      <div id="sling-draft-cards" class="slingcore-cards"></div>
    </div>
  `;
  container.appendChild(stage);

  const canvas = stage.querySelector<HTMLCanvasElement>('.slingcore-canvas')!;
  const ctx = canvas.getContext('2d')!;
  const scoreEl = stage.querySelector<HTMLElement>('#sling-hud-score')!;
  const waveEl = stage.querySelector<HTMLElement>('#sling-hud-wave')!;
  const overlayEl = stage.querySelector<HTMLElement>('#sling-draft-overlay')!;
  const overlayHeadingEl = stage.querySelector<HTMLElement>('#sling-overlay-heading')!;
  const cardsContainerEl = stage.querySelector<HTMLElement>('#sling-draft-cards')!;

  const synth = new SlingSynth();
  const engine = new SlingCoreEngine(options.initialSeed ?? 20261108, synth);
  const renderer = new SlingCoreRenderer();

  let lastRenderedPhase = engine.phase;
  let lastScore = -1;
  let lastWave = -1;

  function syncCanvasSize(): void {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(640, Math.floor(rect.width || window.innerWidth || 960));
    const h = Math.max(420, Math.floor(rect.height || window.innerHeight || 600));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      engine.resize(w, h);
    }
  }
  syncCanvasSize();

  function syncUI(): void {
    if (engine.score !== lastScore) {
      lastScore = engine.score;
      scoreEl.textContent = engine.score.toLocaleString();
    }
    scoreEl.style.transform = `scale(${engine.scorePopScale.toFixed(3)})`;

    if (engine.wave !== lastWave) {
      lastWave = engine.wave;
      waveEl.textContent = String(engine.wave);
    }

    if (engine.phase !== lastRenderedPhase) {
      lastRenderedPhase = engine.phase;
      if (engine.phase === 'upgrade_draft') {
        overlayHeadingEl.textContent = `WAVE ${engine.wave} CLEARED — PICK 1 UPGRADE`;
        cardsContainerEl.innerHTML = engine.draftChoices
          .map(
            (c, idx) => `
            <button type="button" class="slingcore-card" data-upgrade-idx="${idx}">
              <div class="slingcore-card-header">
                <span class="slingcore-card-glyph">${c.glyph}</span>
                <span class="slingcore-card-key">[${idx + 1}]</span>
              </div>
              <h3 class="slingcore-card-name">${c.title}</h3>
              <p class="slingcore-card-desc">${c.description}</p>
            </button>
          `,
          )
          .join('');
        overlayEl.hidden = false;
      } else if (engine.phase === 'gameover') {
        overlayHeadingEl.textContent = `CORE SHATTERED — CLICK OR PRESS SPACE TO LAUNCH AGAIN`;
        cardsContainerEl.innerHTML = '';
        overlayEl.hidden = false;
      } else {
        overlayEl.hidden = true;
      }
    }
  }

  // Event Listeners: Mouse + Touch + 2-3 Keys (Rule 2)
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || canvas.width);
    const scaleY = canvas.height / (rect.height || canvas.height);
    engine.setPointerPosition((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    onPointerMove(e);
    engine.beginPrimaryAction();
  };

  const onPointerUp = () => {
    engine.releasePrimaryAction();
  };

  const onOverlayClick = (e: MouseEvent) => {
    if (engine.phase === 'gameover') {
      engine.resetRun();
      syncUI();
      return;
    }
    const target = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-upgrade-idx]');
    if (target) {
      const idx = Number(target.dataset.upgradeIdx);
      engine.selectUpgrade(idx);
      syncUI();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (engine.phase === 'upgrade_draft') {
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        engine.selectUpgrade(Number(e.key) - 1);
        syncUI();
      }
      return;
    }
    if (engine.phase === 'gameover' && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      engine.resetRun();
      syncUI();
      return;
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      engine.pointer.usingKeyboard = true;
      engine.pointer.turnLeft = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      engine.pointer.usingKeyboard = true;
      engine.pointer.turnRight = true;
    } else if (e.code === 'Space') {
      e.preventDefault();
      if (!engine.pointer.isDown) {
        engine.beginPrimaryAction();
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      engine.pointer.turnLeft = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      engine.pointer.turnRight = false;
    } else if (e.code === 'Space') {
      e.preventDefault();
      engine.releasePrimaryAction();
    }
  };

  const onResize = () => syncCanvasSize();

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  overlayEl.addEventListener('click', onOverlayClick);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onResize);

  // 60fps loop with content-visibility background pause per efficient-background-processing
  let rafId = 0;
  let running = true;
  let lastTime = performance.now();

  function frame(now: number): void {
    if (!running) return;
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    engine.update(dt);
    renderer.render(ctx, engine);
    syncUI();

    rafId = requestAnimationFrame(frame);
  }

  function startLoop(): void {
    if (running && rafId !== 0) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop(): void {
    running = false;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    synth.updateChargeTone(false, 0, 0);
  }

  // Listen directly on stage for contentvisibilityautostatechange
  stage.addEventListener('contentvisibilityautostatechange', (event: Event) => {
    const cvEvent = event as Event & { skipped?: boolean };
    if (cvEvent.skipped) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  // Fallback for browsers without content-visibility support
  let intersectionObserver: IntersectionObserver | null = null;
  if (
    typeof document !== 'undefined' &&
    !('contentVisibility' in document.documentElement.style) &&
    typeof IntersectionObserver !== 'undefined'
  ) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        }
      },
      { rootMargin: '200px' },
    );
    intersectionObserver.observe(stage);
  }

  // Render initial frame immediately so user is playing at T=0.0s
  renderer.render(ctx, engine);
  syncUI();
  startLoop();

  return {
    engine,
    destroy() {
      stopLoop();
      intersectionObserver?.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      overlayEl.removeEventListener('click', onOverlayClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      synth.destroy();
      container.innerHTML = '';
    },
    restartWithSeed(seed: number) {
      engine.resetRun(seed);
      lastRenderedPhase = 'playing';
      overlayEl.hidden = true;
      syncUI();
    },
    toggleDebug() {
      // No visual clutter debug logs (Rule 2 & Rule 5)
    },
    getStateSnapshot() {
      return {
        wave: engine.wave,
        score: engine.score,
        chainCount: engine.chainCount,
        unbankedPoints: engine.unbankedPoints,
        hp: engine.player.hp,
        phase: engine.phase,
        upgrades: Array.from(engine.ownedUpgrades),
      };
    },
  };
}
