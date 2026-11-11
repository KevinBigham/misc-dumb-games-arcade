import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ARCADE_GAMES_REGISTRY, mountArcadeHub } from '../src/arcade-hub';

describe('Argon 10-Game Studio Master Integration Suite', () => {
  beforeEach(() => {
    // Provide a mock 2D canvas context for JSDOM when mounting Canvas-based games
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 48 })),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('registers all 10 original Argon games in sequential order (01 to 10)', () => {
    expect(ARCADE_GAMES_REGISTRY).toHaveLength(10);
    expect(ARCADE_GAMES_REGISTRY.map((g) => g.metadata.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(ARCADE_GAMES_REGISTRY.map((g) => g.metadata.id)).toEqual([
      '01-one-more-season',
      '02-blackout-dispatch',
      '03-the-last-signal',
      '04-junkyard-courier',
      '05-beatline-salvage',
      '06-roommate-republic',
      '07-merge-kitchen',
      '08-orbit-stack',
      '09-belt-and-bolt',
      '10-ten-floors-down',
    ]);

    for (const mod of ARCADE_GAMES_REGISTRY) {
      expect(mod.metadata.title.length).toBeGreaterThan(2);
      expect(mod.metadata.oneSentenceLoop.length).toBeGreaterThan(20);
      expect(mod.metadata.shortGoal.length).toBeGreaterThan(10);
      expect(mod.metadata.longGoal.length).toBeGreaterThan(10);
      expect(typeof mod.mountGame).toBe('function');
    }
  });

  it('mounts, reseeds, toggles debug, snapshots, and cleanly destroys all 10 games', () => {
    for (const mod of ARCADE_GAMES_REGISTRY) {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const instance = mod.mountGame(container, {
        initialSeed: 20261105,
        debug: false,
      });

      expect(container.innerHTML.length).toBeGreaterThan(20);
      expect(typeof instance.destroy).toBe('function');

      if (instance.getStateSnapshot) {
        expect(instance.getStateSnapshot()).toBeTruthy();
      }
      if (instance.toggleDebug) {
        instance.toggleDebug(true);
        instance.toggleDebug(false);
      }
      if (instance.restartWithSeed) {
        instance.restartWithSeed(424242);
      }

      instance.destroy();
      container.remove();
    }
  });

  it('mounts the unified Arcade Hub and switches between Catalog and individual games', () => {
    const hubRoot = document.createElement('div');
    hubRoot.innerHTML = `
      <div id="hub-live-announcer"></div>
      <button id="btn-show-catalog"></button>
      <input id="hub-seed-input" value="20261105" />
      <button id="btn-apply-seed"></button>
      <button id="btn-toggle-debug"></button>
      <a id="btn-open-standalone" hidden></a>
      <ul id="hub-nav-list"></ul>
      <dialog id="design-contract-dialog" closedby="any">
        <h2 id="dialog-contract-title"></h2>
        <div id="contract-dialog-body"></div>
      </dialog>
      <section id="hub-catalog-section"><ul id="hub-catalog-grid"></ul></section>
      <section id="hub-stage-wrapper" hidden><div id="hub-stage-mount"></div></section>
    `;
    document.body.appendChild(hubRoot);

    const controller = mountArcadeHub(hubRoot);
    expect(controller.getActiveGameId()).toBeNull();
    expect(hubRoot.querySelectorAll('#hub-catalog-grid > li')).toHaveLength(10);
    expect(hubRoot.querySelectorAll('#hub-nav-list > li')).toHaveLength(10);

    controller.launchGame('01-one-more-season', { seed: 202601 });
    expect(controller.getActiveGameId()).toBe('01-one-more-season');

    controller.launchGame('02-blackout-dispatch', { seed: 202602 });
    expect(controller.getActiveGameId()).toBe('02-blackout-dispatch');

    controller.showCatalog();
    expect(controller.getActiveGameId()).toBeNull();

    controller.destroy();
    hubRoot.remove();
  });
});
