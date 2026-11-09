import type {
  ArgonGameInstance,
  ArgonGameMetadata,
} from '../../shared-contract';
import { getUpgradeCardRects, renderSnapbackFrame } from './renderer';
import { SNAPBACK_CONFIG, SnapbackSimulation } from './sim';

export { computeHarmonicComboFreq, SnapbackSynth } from './synth';
export { UPGRADE_CATALOG, pickThreeUpgrades, type UpgradeId, type UpgradeSpec } from './upgrades';
export { SNAPBACK_CONFIG, SnapbackSimulation } from './sim';

export const metadata: ArgonGameMetadata = {
  id: '13-snapback',
  number: 13,
  title: 'SNAPBACK: Kinetic Tether',
  subtitle: '60fps Elastic Slingshot Ricochet & Push-Your-Luck Combo Arena',
  genre: 'Tactile Kinetic Action / Slingshot Billiards',
  primaryReference: 'Hyper-Tactile Slingshot Toy',
  supportingReference: 'Geometry Wars × Holedown',
  oneSentenceLoop:
    'Steer a weighty Kinetic Core, hold to coil an elastic slingshot dash while enemies close in, release to ricochet across the arena, and pause to bank your multiplier pot before taking a hit.',
  shortGoal: 'Survive 30-second waves and draft 1-sentence kinetic behavior upgrades.',
  longGoal: 'Chain high-risk Sweet-Spot ricochets and bank massive x20+ multiplier pots.',
  controlsSummary: 'Mouse Move + Hold/Release Click (or WASD/Arrows + Hold/Release Space)',
  accentColor: '#00f2fe',
};

export function mountGame(
  container: HTMLElement,
  options: { initialSeed?: number; debug?: boolean } = {}
): ArgonGameInstance {
  const initialSeed = options.initialSeed ?? 20261108;
  const sim = new SnapbackSimulation(initialSeed);

  // Rule 2: Start with ONLY the canvas and at most 2 HUD numbers (SCORE & WAVE).
  // No sidebars, no logs, no 8 buttons, 0 tutorial walls.
  container.innerHTML = `
    <div class="snapback-stage" style="
      position: relative;
      max-width: 960px;
      margin: 0 auto;
      user-select: none;
      -webkit-user-select: none;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      content-visibility: auto;
      contain-intrinsic-size: auto none auto 620px;
    ">
      <div class="snapback-hud" style="
        position: absolute;
        top: 14px;
        left: 24px;
        right: 24px;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        z-index: 2;
      ">
        <div style="
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #00f2fe;
          text-shadow: 0 2px 10px rgba(0, 242, 254, 0.35);
        ">SCORE <span id="snapback-hud-score" style="color: #f8fafc;">0</span></div>
        <div style="
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: #fbbf24;
          text-shadow: 0 2px 10px rgba(251, 191, 36, 0.35);
        ">WAVE <span id="snapback-hud-wave" style="color: #f8fafc;">1</span></div>
      </div>
      <canvas
        id="snapback-canvas"
        width="${SNAPBACK_CONFIG.WIDTH}"
        height="${SNAPBACK_CONFIG.HEIGHT}"
        style="
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 960 / 600;
          background: #080b12;
          border-radius: 12px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.65);
          cursor: crosshair;
          touch-action: none;
        "
      ></canvas>
    </div>
  `;

  const stageEl = container.querySelector<HTMLElement>('.snapback-stage')!;
  const canvas = container.querySelector<HTMLCanvasElement>('#snapback-canvas')!;
  const scoreEl = container.querySelector<HTMLElement>('#snapback-hud-score')!;
  const waveEl = container.querySelector<HTMLElement>('#snapback-hud-wave')!;
  const ctx = canvas.getContext('2d');

  let hoverCardIndex = -1;
  let rafId: number | null = null;
  let isPausedByVisibility = false;
  let lastTime = performance.now();

  function toCanvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = SNAPBACK_CONFIG.WIDTH / (rect.width || SNAPBACK_CONFIG.WIDTH);
    const scaleY = SNAPBACK_CONFIG.HEIGHT / (rect.height || SNAPBACK_CONFIG.HEIGHT);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function findHoveredUpgradeCard(cx: number, cy: number): number {
    if (sim.phase !== 'upgrade_choice') return -1;
    const rects = getUpgradeCardRects();
    for (const r of rects) {
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
        return r.index;
      }
    }
    return -1;
  }

  const onPointerMove = (e: PointerEvent): void => {
    const pt = toCanvasCoords(e.clientX, e.clientY);
    sim.setAimPosition(pt.x, pt.y);
    hoverCardIndex = findHoveredUpgradeCard(pt.x, pt.y);
  };

  const onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    const pt = toCanvasCoords(e.clientX, e.clientY);
    sim.setAimPosition(pt.x, pt.y);

    if (sim.phase === 'upgrade_choice') {
      const idx = findHoveredUpgradeCard(pt.x, pt.y);
      if (idx !== -1) {
        sim.chooseUpgrade(idx);
        hoverCardIndex = -1;
      }
      return;
    }

    sim.startCharge();
  };

  const onPointerUp = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    sim.releaseCharge();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (sim.phase === 'upgrade_choice') {
      if (e.key === '1') sim.chooseUpgrade(0);
      else if (e.key === '2') sim.chooseUpgrade(1);
      else if (e.key === '3') sim.chooseUpgrade(2);
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) {
        sim.startCharge();
      }
      return;
    }

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      sim.usingPointerAim = false;
      sim.moveKeys.up = true;
    }
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      sim.usingPointerAim = false;
      sim.moveKeys.down = true;
    }
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      sim.usingPointerAim = false;
      sim.moveKeys.left = true;
    }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      sim.usingPointerAim = false;
      sim.moveKeys.right = true;
    }
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space') {
      e.preventDefault();
      sim.releaseCharge();
      return;
    }
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') sim.moveKeys.up = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') sim.moveKeys.down = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') sim.moveKeys.left = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') sim.moveKeys.right = false;
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function updateHudAndRender(): void {
    scoreEl.textContent = String(sim.score);
    waveEl.textContent = String(sim.wave);
    if (ctx) {
      renderSnapbackFrame(ctx, sim, hoverCardIndex);
    }
  }

  function frameLoop(now: number): void {
    if (isPausedByVisibility) {
      rafId = null;
      return;
    }
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    sim.step(dt);
    updateHudAndRender();
    rafId = requestAnimationFrame(frameLoop);
  }

  function startSimulationLoop(): void {
    if (rafId !== null) return;
    isPausedByVisibility = false;
    lastTime = performance.now();
    rafId = requestAnimationFrame(frameLoop);
  }

  function stopSimulationLoop(): void {
    isPausedByVisibility = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Modern Web Guidance (efficient-background-processing):
  // Direct listener on element with content-visibility: auto, plus IntersectionObserver fallback
  const onContentVisibilityChange = (event: Event): void => {
    const cvEvent = event as Event & { skipped?: boolean };
    if (cvEvent.skipped) {
      stopSimulationLoop();
    } else {
      startSimulationLoop();
    }
  };
  stageEl.addEventListener('contentvisibilityautostatechange', onContentVisibilityChange);

  let intersectionObserver: IntersectionObserver | null = null;
  const isContentVisibilitySupported =
    typeof document !== 'undefined' &&
    'contentVisibility' in document.documentElement.style;

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
    intersectionObserver.observe(stageEl);
  }

  // Draw initial frame immediately (< 1ms) and start 60fps loop
  updateHudAndRender();
  startSimulationLoop();

  return {
    destroy(): void {
      stopSimulationLoop();
      stageEl.removeEventListener('contentvisibilityautostatechange', onContentVisibilityChange);
      intersectionObserver?.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
    restartWithSeed(seed: number): void {
      sim.resetRun(seed);
      updateHudAndRender();
    },
    getStateSnapshot(): unknown {
      return {
        score: sim.score,
        wave: sim.wave,
        phase: sim.phase,
        unbankedChips: sim.unbankedChips,
        unbankedMult: sim.unbankedMult,
        hp: sim.player.hp,
        upgrades: Array.from(sim.ownedUpgrades),
      };
    },
  };
}
