import type {
  ArgonGameInstance,
  ArgonGameMetadata,
} from '../../shared-contract';
import { VaultAudioEngine } from './audio';
import {
  RenderTransform,
  computeArenaTransform,
  renderRicochetVault,
} from './renderer';
import {
  RicochetVaultState,
  VAULT_RADIUS,
  bankUnbankedPot,
  createInitialState,
  launchStriker,
  nudgeInFlightStrikers,
  selectUpgradeAndStartNextRound,
  stepSimulation,
  updateAimDrag,
} from './simulation';

export const metadata: ArgonGameMetadata = {
  id: '13-ricochet-vault',
  number: 13,
  title: 'RICOCHET VAULT // GREED BREAKER',
  subtitle: 'Toy-First Kinetic Slingshot & Push-Your-Luck Combo Breaker',
  genre: 'Kinetic Pinball-Breaker / Push-Your-Luck Action Toy',
  primaryReference: 'Peggle + Holedown',
  supportingReference: 'Ball x Pit + Downwell',
  oneSentenceLoop:
    'Slingshot your Striker across musical prism pegs to build an escalating Unbanked Combo Pot, then choose every 5 seconds whether to Slam-Bank your multiplier safely or risk one more bounce before Thermal Overload or Hazard Saws shatter your greed.',
  shortGoal: 'Fill the outer Vault Quota Ring within the 45-second round timer.',
  longGoal:
    'Chain emergent rule-bending synergies (Prism Splitters, Tesla Arcs, Sawblade Orbitals, Wormhole Walls) across escalating rounds.',
  controlsSummary:
    'Mouse: Left-Drag & Release to Slingshot, Right-Click (or Click Center Vault) to Bank Combo. Keyboard: WASD/Arrows + Spacebar.',
  accentColor: '#38bdf8',
};

const STORAGE_BEST_KEY = 'ricochet_vault_best_v1';

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const initialSeed = options?.initialSeed ?? 20261108;
  const audio = new VaultAudioEngine();
  let state: RicochetVaultState = createInitialState(initialSeed);

  try {
    const savedBest = Number(localStorage.getItem(STORAGE_BEST_KEY) ?? '0');
    if (Number.isFinite(savedBest) && savedBest > 0) {
      state.bestRunScore = savedBest;
    }
  } catch {
    // Ignore storage errors in sandboxed contexts
  }

  container.innerHTML = `
    <style>
      .rv-stage {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100dvh;
        background: #050814;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
        /* Efficient Background Processing per modern-web-guidance */
        content-visibility: auto;
        contain-intrinsic-size: auto none auto 720px;
      }

      .rv-canvas {
        display: block;
        width: 100%;
        height: 100%;
        cursor: crosshair;
      }

      .rv-corner-controls {
        position: absolute;
        top: 12px;
        right: 14px;
        display: flex;
        gap: 8px;
        z-index: 10;
      }

      .rv-icon-btn {
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.28);
        color: #e2e8f0;
        font: 800 11px/1 "Inter", system-ui, sans-serif;
        padding: 7px 10px;
        border-radius: 999px;
        cursor: pointer;
        backdrop-filter: blur(6px);
        transition: transform 0.14s ease, border-color 0.14s ease;
      }

      .rv-icon-btn:hover {
        border-color: #38bdf8;
        transform: scale(1.05);
      }

      @media (prefers-reduced-motion: reduce) {
        .rv-icon-btn,
        .rv-icon-btn:hover {
          transition: none;
          transform: none;
        }
      }
    </style>
    <div class="rv-stage" id="rv-stage-root">
      <canvas class="rv-canvas" id="rv-canvas" aria-label="Ricochet Vault Interactive Game Arena"></canvas>
      <div class="rv-corner-controls">
        <button type="button" class="rv-icon-btn" id="rv-btn-bank" title="Bank Combo Now [Right-Click / Space]">
          ⚡ BANK [SPACE]
        </button>
        <button type="button" class="rv-icon-btn" id="rv-btn-mute" title="Toggle WebAudio [M]">
          🔊 [M]
        </button>
        <button type="button" class="rv-icon-btn" id="rv-btn-restart" title="Instant Restart [R]">
          ↻ [R]
        </button>
      </div>
    </div>
  `;

  const stageRoot = container.querySelector<HTMLElement>('#rv-stage-root')!;
  const canvas = container.querySelector<HTMLCanvasElement>('#rv-canvas')!;
  const btnBank = container.querySelector<HTMLButtonElement>('#rv-btn-bank')!;
  const btnMute = container.querySelector<HTMLButtonElement>('#rv-btn-mute')!;
  const btnRestart = container.querySelector<HTMLButtonElement>('#rv-btn-restart')!;
  const ctx = canvas.getContext('2d')!;

  let width = 960;
  let height = 720;
  let lastRenderTransform: RenderTransform = {
    cx: 480,
    cy: 360,
    scale: 1,
    cardHitboxes: [],
  };

  const reducedMotionQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  function resizeCanvas(): void {
    const rect = stageRoot.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width || window.innerWidth || 960));
    height = Math.max(320, Math.floor(rect.height || window.innerHeight || 720));
    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Convert client pointer coordinates into Arena coordinates centered at (0, 0)
  function clientToArena(clientX: number, clientY: number): { ax: number; ay: number; px: number; py: number } {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const { cx, cy, scale } = computeArenaTransform(width, height);
    return {
      ax: (px - cx) / (scale || 1),
      ay: (py - cy) / (scale || 1),
      px,
      py,
    };
  }

  let isPointerDown = false;
  let dragStartArenaX = 0;
  let dragStartArenaY = 0;

  function onPointerDown(e: PointerEvent): void {
    if (e.button === 2) {
      // Right-Click -> Immediate Push-Your-Luck SLAM-BANK!
      e.preventDefault();
      if (state.phase === 'in_flight') {
        bankUnbankedPot(state, audio);
        persistBestScore();
      }
      return;
    }

    const { ax, ay, px, py } = clientToArena(e.clientX, e.clientY);

    if (state.phase === 'game_over') {
      restartRun(state.seed + 1);
      return;
    }

    if (state.phase === 'upgrade_draft') {
      for (const box of lastRenderTransform.cardHitboxes) {
        if (px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h) {
          selectUpgradeAndStartNextRound(state, box.spec.id, audio);
          return;
        }
      }
      return;
    }

    if (state.phase === 'in_flight') {
      // Clicking the Center Bank Vault Ring (or anywhere if carrying a pot) banks the pot!
      const distFromVault = Math.hypot(ax, ay);
      if (distFromVault <= VAULT_RADIUS * 1.45 || state.unbankedChips > 0) {
        bankUnbankedPot(state, audio);
        persistBestScore();
      }
      return;
    }

    if (state.phase === 'aiming') {
      isPointerDown = true;
      dragStartArenaX = ax;
      dragStartArenaY = ay;

      // Support both slingshot pull-back AND direct point-and-drag aiming
      const distFromCenter = Math.hypot(ax, ay);
      if (distFromCenter > 8) {
        const tension = Math.min(1, Math.max(0.35, distFromCenter / 220));
        updateAimDrag(state, ax, ay, tension, audio);
      }
    }
  }

  function onPointerMove(e: PointerEvent): void {
    if (state.phase !== 'aiming') return;
    const { ax, ay } = clientToArena(e.clientX, e.clientY);

    if (isPointerDown) {
      // Slingshot vector: if player drags away from start point, support pullback OR cursor aim
      const dragDX = dragStartArenaX - ax;
      const dragDY = dragStartArenaY - ay;
      const dragDist = Math.hypot(dragDX, dragDY);

      if (dragDist > 28 && Math.hypot(dragStartArenaX, dragStartArenaY) < VAULT_RADIUS * 1.8) {
        // Classic Angry-Birds pullback from the center Vault!
        const tension = Math.min(1, Math.max(0.3, dragDist / 160));
        updateAimDrag(state, dragDX, dragDY, tension, audio);
      } else {
        // Direct aim toward cursor with tension proportional to distance
        const dist = Math.hypot(ax, ay);
        const tension = Math.min(1, Math.max(0.35, dist / 240));
        updateAimDrag(state, ax, ay, tension, audio);
      }
    } else {
      // Hover preview so the arena responds within the first 0.5 seconds of moving the mouse!
      const dist = Math.hypot(ax, ay);
      if (dist > 10) {
        updateAimDrag(state, ax, ay, Math.min(0.9, Math.max(0.4, dist / 260)));
        state.isDraggingAim = false;
      }
    }
  }

  function onPointerUp(e: PointerEvent): void {
    if (e.button === 2) return;
    if (state.phase === 'aiming' && isPointerDown) {
      isPointerDown = false;
      launchStriker(state, state.aimDirX, state.aimDirY, Math.max(0.55, state.aimTension), audio);
    }
  }

  function onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    if (state.phase === 'in_flight') {
      bankUnbankedPot(state, audio);
      persistBestScore();
    }
  }

  // Keyboard Support (WASD / Arrows + Spacebar + 1/2/3 + M + R)
  const keysHeld = new Set<string>();

  function onKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    keysHeld.add(key);

    if (key === 'm') {
      audio.muted = !audio.muted;
      btnMute.textContent = audio.muted ? '🔇 [M]' : '🔊 [M]';
      return;
    }

    if (key === 'r') {
      restartRun(state.seed + 1);
      return;
    }

    if (state.phase === 'upgrade_draft') {
      if (key === '1' && state.draftChoices[0]) {
        selectUpgradeAndStartNextRound(state, state.draftChoices[0].id, audio);
      } else if (key === '2' && state.draftChoices[1]) {
        selectUpgradeAndStartNextRound(state, state.draftChoices[1].id, audio);
      } else if (key === '3' && state.draftChoices[2]) {
        selectUpgradeAndStartNextRound(state, state.draftChoices[2].id, audio);
      }
      return;
    }

    if (key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (state.phase === 'game_over') {
        restartRun(state.seed + 1);
      } else if (state.phase === 'aiming') {
        launchStriker(state, state.aimDirX, state.aimDirY, 0.92, audio);
      } else if (state.phase === 'in_flight') {
        bankUnbankedPot(state, audio);
        persistBestScore();
      }
    }
  }

  function onKeyUp(e: KeyboardEvent): void {
    keysHeld.delete(e.key.toLowerCase());
  }

  function applyKeyboardAimOrNudge(dtSec: number): void {
    let kx = 0;
    let ky = 0;
    if (keysHeld.has('a') || keysHeld.has('arrowleft')) kx -= 1;
    if (keysHeld.has('d') || keysHeld.has('arrowright')) kx += 1;
    if (keysHeld.has('w') || keysHeld.has('arrowup')) ky -= 1;
    if (keysHeld.has('s') || keysHeld.has('arrowdown')) ky += 1;

    if (kx === 0 && ky === 0) return;

    if (state.phase === 'aiming') {
      const curAngle = Math.atan2(state.aimDirY, state.aimDirX);
      const nextAngle = curAngle + kx * 2.6 * dtSec;
      updateAimDrag(state, Math.cos(nextAngle), Math.sin(nextAngle), 0.88);
    } else if (state.phase === 'in_flight') {
      nudgeInFlightStrikers(state, kx, ky, dtSec);
    }
  }

  function persistBestScore(): void {
    try {
      if (state.bestRunScore > 0) {
        localStorage.setItem(STORAGE_BEST_KEY, String(state.bestRunScore));
      }
    } catch {
      // Ignore storage errors
    }
  }

  function restartRun(newSeed: number): void {
    const prevBest = state.bestRunScore;
    state = createInitialState(newSeed);
    state.bestRunScore = prevBest;
  }

  btnBank.addEventListener('click', () => {
    if (state.phase === 'in_flight') {
      bankUnbankedPot(state, audio);
      persistBestScore();
    } else if (state.phase === 'aiming') {
      launchStriker(state, state.aimDirX, state.aimDirY, 0.92, audio);
    }
  });

  btnMute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    btnMute.textContent = audio.muted ? '🔇 [M]' : '🔊 [M]';
  });

  btnRestart.addEventListener('click', () => {
    restartRun(state.seed + 1);
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Animation Loop + Efficient Background Processing per modern-web-guidance
  let rafId = 0;
  let isPausedByVisibility = false;
  let lastFrameTime = performance.now();

  function frame(now: number): void {
    if (isPausedByVisibility) return;
    const dtMs = Math.min(48, Math.max(0, now - lastFrameTime));
    lastFrameTime = now;

    applyKeyboardAimOrNudge(dtMs / 1000);
    stepSimulation(state, dtMs, audio);
    lastRenderTransform = renderRicochetVault(
      ctx,
      state,
      width,
      height,
      Boolean(reducedMotionQuery?.matches)
    );

    rafId = requestAnimationFrame(frame);
  }

  function startSimulationLoop(): void {
    if (!isPausedByVisibility && rafId !== 0) return;
    isPausedByVisibility = false;
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopSimulationLoop(): void {
    isPausedByVisibility = true;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  // 1. Direct listener for contentvisibilityautostatechange (does not bubble reliably)
  const onContentVisibilityChange = (event: Event): void => {
    const cvEvent = event as Event & { skipped?: boolean };
    if (cvEvent.skipped) {
      stopSimulationLoop();
    } else {
      startSimulationLoop();
    }
  };
  stageRoot.addEventListener('contentvisibilityautostatechange', onContentVisibilityChange);

  // 2. Fallback using IntersectionObserver for older browsers without content-visibility
  let intersectionObserver: IntersectionObserver | null = null;
  const isContentVisibilitySupported =
    typeof document !== 'undefined' && 'contentVisibility' in document.documentElement.style;
  if (!isContentVisibilitySupported && typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startSimulationLoop();
          } else {
            stopSimulationLoop();
          }
        }
      },
      { rootMargin: '200px' }
    );
    intersectionObserver.observe(stageRoot);
  }

  // Initial synchronous render + start loop
  lastRenderTransform = renderRicochetVault(
    ctx,
    state,
    width,
    height,
    Boolean(reducedMotionQuery?.matches)
  );
  rafId = requestAnimationFrame(frame);

  return {
    destroy(): void {
      stopSimulationLoop();
      stageRoot.removeEventListener('contentvisibilityautostatechange', onContentVisibilityChange);
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.innerHTML = '';
    },
    restartWithSeed(seed: number): void {
      restartRun(seed);
    },
    getStateSnapshot(): unknown {
      return state;
    },
  };
}
