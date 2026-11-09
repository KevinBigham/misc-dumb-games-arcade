import type { ArgonGameInstance, ArgonGameModule } from '../games/shared-contract';
import * as game01 from '../games/01-one-more-season/src/index';
import * as game02 from '../games/02-blackout-dispatch/src/index';
import * as game03 from '../games/03-the-last-signal/src/index';
import * as game04 from '../games/04-junkyard-courier/src/index';
import * as game05 from '../games/05-beatline-salvage/src/index';
import * as game06 from '../games/06-roommate-republic/src/index';
import * as game07 from '../games/07-merge-kitchen/src/index';
import * as game08 from '../games/08-orbit-stack/src/index';
import * as game09 from '../games/09-belt-and-bolt/src/index';
import * as game10 from '../games/10-ten-floors-down/src/index';
import * as gameParadoxProtocol from '../games/11-paradox-protocol/src/index';
import * as game11 from '../games/11-keystone-forge/src/index';
import * as gameMetaphysicalDeli from '../games/11-metaphysical-deli/src/index';
import * as game12 from '../games/12-hypernova-chronovalkyrie/src/index';
import * as gameChronoSyndicate from '../games/12-chrono-syndicate/src/index';
import * as gameChronoVortex from '../games/12-chrono-vortex/src/index';
import * as gameEventHorizon from '../games/12-event-horizon/src/index';
import * as gameAstralPinball from '../games/12-astral-pinball/src/index';
import * as gameAegisZero from '../games/13-aegis-zero/src/index';
import * as gameVoltLash from '../games/13-aegis-volt-lash/src/index';
import * as gameSnapback from '../games/13-snapback/src/index';

export const FLAGSHIP_PARADOX_GAME: ArgonGameModule = gameParadoxProtocol;
export const FLAGSHIP_HYPERNOVA_GAME: ArgonGameModule = game12;
export const FLAGSHIP_CHRONO_GAME: ArgonGameModule = gameChronoSyndicate;
export const FLAGSHIP_CHRONO_VORTEX_GAME: ArgonGameModule = gameChronoVortex;
export const FLAGSHIP_EVENT_HORIZON_GAME: ArgonGameModule = gameEventHorizon;
export const FLAGSHIP_OROBOROS_GAME: ArgonGameModule = gameAstralPinball;
export const FLAGSHIP_AEGIS_ZERO_GAME: ArgonGameModule = gameAegisZero;
export const FLAGSHIP_VOLT_LASH_GAME: ArgonGameModule = gameVoltLash;
export const FLAGSHIP_SNAPBACK_GAME: ArgonGameModule = gameSnapback;

// 1. Conditionally load Invoker Commands & Popover polyfills per declarative-dialog-popover-control
if (typeof HTMLButtonElement !== 'undefined' && !('commandForElement' in HTMLButtonElement.prototype)) {
  void import('invokers-polyfill');
}
if (typeof HTMLElement !== 'undefined' && !('popover' in HTMLElement.prototype)) {
  void import('@oddbird/popover-polyfill');
}

export const ARCADE_GAMES_REGISTRY: readonly ArgonGameModule[] = [
  game01,
  game02,
  game03,
  game04,
  game05,
  game06,
  game07,
  game08,
  game09,
  game10,
];

// 2. Fallback for browsers without native <dialog closedby="any"> support per light-dismiss-a-dialog
export function setupDialogLightDismissFallback(root: ParentNode = document): void {
  if (typeof HTMLDialogElement === 'undefined' || 'closedBy' in HTMLDialogElement.prototype) {
    return;
  }

  for (const dialog of root.querySelectorAll<HTMLDialogElement>('dialog[closedby="any"]')) {
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

export interface ArcadeHubController {
  launchGame(gameId: string, options?: { seed?: number; debug?: boolean }): void;
  showCatalog(): void;
  getActiveGameId(): string | null;
  destroy(): void;
}

export function mountArcadeHub(rootContainer: HTMLElement = document.body): ArcadeHubController {
  let activeGameId: string | null = null;
  let activeInstance: ArgonGameInstance | null = null;
  let featuredKeystoneInstance: ArgonGameInstance | null = null;
  let debugEnabled = false;

  const navList = rootContainer.querySelector<HTMLUListElement>('#hub-nav-list');
  const featuredSection = rootContainer.querySelector<HTMLElement>('#featured-keystone-section');
  const featuredMount = rootContainer.querySelector<HTMLElement>('#featured-keystone-mount');
  const catalogSection = rootContainer.querySelector<HTMLElement>('#hub-catalog-section');
  const catalogGrid = rootContainer.querySelector<HTMLUListElement>('#hub-catalog-grid');
  const stageWrapper = rootContainer.querySelector<HTMLElement>('#hub-stage-wrapper');
  const stageMount = rootContainer.querySelector<HTMLElement>('#hub-stage-mount');
  const btnShowCatalog = rootContainer.querySelector<HTMLButtonElement>('#btn-show-catalog');
  const btnToggleDebug = rootContainer.querySelector<HTMLButtonElement>('#btn-toggle-debug');
  const btnApplySeed = rootContainer.querySelector<HTMLButtonElement>('#btn-apply-seed');
  const seedInput = rootContainer.querySelector<HTMLInputElement>('#hub-seed-input');
  const btnOpenStandalone = rootContainer.querySelector<HTMLAnchorElement>('#btn-open-standalone');
  const contractDialogBody = rootContainer.querySelector<HTMLElement>('#contract-dialog-body');
  const contractDialogTitle = rootContainer.querySelector<HTMLElement>('#dialog-contract-title');
  const announcer = rootContainer.querySelector<HTMLElement>('#hub-live-announcer');

  setupDialogLightDismissFallback(rootContainer);

  function announce(message: string): void {
    if (announcer) {
      announcer.textContent = message;
    }
  }

  function updateContractModal(mod: ArgonGameModule): void {
    if (contractDialogTitle) {
      contractDialogTitle.textContent = `#${String(mod.metadata.number).padStart(2, '0')} ${mod.metadata.title} — Design Contract`;
    }
    if (contractDialogBody) {
      contractDialogBody.innerHTML = `
        <p><strong>Subtitle:</strong> ${mod.metadata.subtitle}</p>
        <p><strong>Genre:</strong> ${mod.metadata.genre}</p>
        <p><strong>Primary Reference:</strong> ${mod.metadata.primaryReference} · <strong>Supporting:</strong> ${mod.metadata.supportingReference}</p>
        <p><strong>One-Sentence Core Loop:</strong> ${mod.metadata.oneSentenceLoop}</p>
        <p><strong>Short Goal:</strong> ${mod.metadata.shortGoal}</p>
        <p><strong>Long Goal:</strong> ${mod.metadata.longGoal}</p>
        <p><strong>Controls:</strong> <code>${mod.metadata.controlsSummary}</code></p>
        <p><strong>Standalone Entry:</strong> <a href="./games/${mod.metadata.id}/index.html" target="_blank" rel="noopener">Open ./games/${mod.metadata.id}/index.html in new tab</a></p>
      `;
    }
  }

  function updateNavigationState(): void {
    if (!navList) return;
    for (const btn of navList.querySelectorAll<HTMLButtonElement>('button[data-game-id]')) {
      const id = btn.getAttribute('data-game-id');
      if (id === activeGameId) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    }
    if (btnShowCatalog) {
      btnShowCatalog.setAttribute('aria-pressed', String(activeGameId === null));
    }
  }

  function cleanupActiveGame(): void {
    if (activeInstance) {
      try {
        activeInstance.destroy();
      } catch (err) {
        console.error('Error destroying game instance:', err);
      }
      activeInstance = null;
    }
    if (stageMount) {
      stageMount.innerHTML = '';
    }
  }

  function cleanupFeaturedKeystone(): void {
    if (featuredKeystoneInstance) {
      try {
        featuredKeystoneInstance.destroy();
      } catch (err) {
        console.error('Error destroying featured Keystone Forge instance:', err);
      }
      featuredKeystoneInstance = null;
    }
    if (featuredMount) {
      featuredMount.innerHTML = '';
    }
  }

  function launchGame(gameId: string, options?: { seed?: number; debug?: boolean }): void {
    const mod =
      ARCADE_GAMES_REGISTRY.find((g) => g.metadata.id === gameId) ??
      (gameId === gameParadoxProtocol.metadata.id ? gameParadoxProtocol : undefined) ??
      (gameId === game11.metadata.id ? game11 : undefined) ??
      (gameId === gameMetaphysicalDeli.metadata.id ? gameMetaphysicalDeli : undefined) ??
      (gameId === game12.metadata.id ? game12 : undefined) ??
      (gameId === gameChronoSyndicate.metadata.id ? gameChronoSyndicate : undefined) ??
      (gameId === gameChronoVortex.metadata.id ? gameChronoVortex : undefined) ??
      (gameId === gameEventHorizon.metadata.id ? gameEventHorizon : undefined) ??
      (gameId === gameAstralPinball.metadata.id ? gameAstralPinball : undefined) ??
      (gameId === gameAegisZero.metadata.id ? gameAegisZero : undefined) ??
      (gameId === gameVoltLash.metadata.id ? gameVoltLash : undefined) ??
      (gameId === gameSnapback.metadata.id ? gameSnapback : undefined);
    if (!mod || !stageMount || !stageWrapper || !catalogSection) return;

    cleanupActiveGame();
    cleanupFeaturedKeystone();
    if (featuredSection) featuredSection.hidden = true;
    activeGameId = mod.metadata.id;
    catalogSection.hidden = true;
    stageWrapper.hidden = false;

    const useDebug = options?.debug ?? debugEnabled;
    activeInstance = mod.mountGame(stageMount, {
      initialSeed: options?.seed,
      debug: useDebug,
    });

    if (btnOpenStandalone) {
      btnOpenStandalone.href = `./games/${mod.metadata.id}/index.html`;
      btnOpenStandalone.hidden = false;
    }

    document.title = `${mod.metadata.title} | Argon 10-Game Studio`;
    updateContractModal(mod);
    updateNavigationState();
    announce(`Launched Game ${mod.metadata.number}: ${mod.metadata.title}`);

    try {
      window.history.replaceState(null, '', `#game=${mod.metadata.id}`);
    } catch {
      // Ignore history errors in sandboxed/test environments
    }
  }

  function showCatalog(): void {
    cleanupActiveGame();
    activeGameId = null;
    if (featuredSection && featuredMount) {
      featuredSection.hidden = false;
      cleanupFeaturedKeystone();
      featuredKeystoneInstance = gameAegisZero.mountGame(featuredMount, {
        initialSeed: Number(seedInput?.value ?? '20261108') || 20261108,
        debug: debugEnabled,
      });
    }
    if (catalogSection) catalogSection.hidden = false;
    if (stageWrapper) stageWrapper.hidden = true;
    if (btnOpenStandalone) btnOpenStandalone.hidden = true;
    document.title = 'Aegis-Zero: Graze Overclock & Argon Studio';
    updateContractModal(gameAegisZero);
    updateNavigationState();
    announce('Showing Aegis-Zero: Graze Overclock and Argon Studio Catalog');
    try {
      window.history.replaceState(null, '', '#catalog');
    } catch {
      // Ignore
    }
  }

  // Render Top 10-Game Quick Switcher Pills
  if (navList) {
    navList.innerHTML = '';
    for (const mod of ARCADE_GAMES_REGISTRY) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hub-game-pill';
      btn.setAttribute('data-game-id', mod.metadata.id);
      btn.style.setProperty('--pill-accent', mod.metadata.accentColor);
      btn.innerHTML = `
        <span class="hub-pill-num">${String(mod.metadata.number).padStart(2, '0')}</span>
        <span>${mod.metadata.title}</span>
      `;
      btn.addEventListener('click', () => launchGame(mod.metadata.id));
      li.appendChild(btn);
      navList.appendChild(li);
    }
  }

  // Render 10-Game Catalog Cards
  if (catalogGrid) {
    catalogGrid.innerHTML = '';
    for (const mod of ARCADE_GAMES_REGISTRY) {
      const li = document.createElement('li');
      li.className = 'hub-card';
      li.style.setProperty('--card-accent', mod.metadata.accentColor);
      li.innerHTML = `
        <div>
          <div class="hub-card-header">
            <span class="hub-card-num">ARGON #${String(mod.metadata.number).padStart(2, '0')}</span>
            <span class="hub-card-genre">${mod.metadata.genre}</span>
          </div>
          <h3 class="hub-card-title">${mod.metadata.title}</h3>
          <p class="hub-card-subtitle">${mod.metadata.subtitle}</p>
        </div>
        <p class="hub-card-loop">${mod.metadata.oneSentenceLoop}</p>
        <div class="hub-card-meta">
          <div><strong>References:</strong> ${mod.metadata.primaryReference} · ${mod.metadata.supportingReference}</div>
          <div><strong>Short Goal:</strong> ${mod.metadata.shortGoal}</div>
          <div><strong>Controls:</strong> ${mod.metadata.controlsSummary}</div>
        </div>
        <div class="hub-card-actions">
          <button type="button" class="hub-btn hub-btn-primary" data-launch-card="${mod.metadata.id}">
            ▶ Play ${mod.metadata.title}
          </button>
          <a class="hub-btn hub-link-btn" href="./games/${mod.metadata.id}/index.html" target="_blank" rel="noopener">
            ↗ Standalone Tab
          </a>
        </div>
      `;
      const playBtn = li.querySelector<HTMLButtonElement>(`button[data-launch-card="${mod.metadata.id}"]`);
      playBtn?.addEventListener('click', () => launchGame(mod.metadata.id));
      catalogGrid.appendChild(li);
    }
  }

  btnShowCatalog?.addEventListener('click', () => showCatalog());

  const btnLaunchParadox = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-paradox');
  btnLaunchParadox?.addEventListener('click', () =>
    launchGame(FLAGSHIP_PARADOX_GAME.metadata.id)
  );

  const btnLaunchFlagship = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-flagship-deli');
  btnLaunchFlagship?.addEventListener('click', () => launchGame('11-metaphysical-deli'));

  const btnLaunchOroboros = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-oroboros');
  btnLaunchOroboros?.addEventListener('click', () => launchGame('12-astral-pinball'));

  const btnLaunchAegisZero = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-aegis-zero');
  btnLaunchAegisZero?.addEventListener('click', () => launchGame('13-aegis-zero'));

  const btnLaunchVoltLash = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-volt-lash');
  btnLaunchVoltLash?.addEventListener('click', () => launchGame('13-aegis-volt-lash'));

  const btnLaunchSnapback = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-snapback');
  btnLaunchSnapback?.addEventListener('click', () => launchGame('13-snapback'));

  const btnLaunchKeystone = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-keystone');
  btnLaunchKeystone?.addEventListener('click', () => launchGame('11-keystone-forge'));

  const btnLaunchHorizon = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-event-horizon');
  btnLaunchHorizon?.addEventListener('click', () => launchGame('12-event-horizon'));

  const btnLaunchHypernova = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-hypernova');
  btnLaunchHypernova?.addEventListener('click', () => launchGame(game12.metadata.id));

  const btnLaunchChrono = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-chrono');
  btnLaunchChrono?.addEventListener('click', () => launchGame(gameChronoSyndicate.metadata.id));

  const btnLaunchChronoVortex = rootContainer.querySelector<HTMLButtonElement>('#btn-launch-chrono-vortex');
  btnLaunchChronoVortex?.addEventListener('click', () => launchGame(gameChronoVortex.metadata.id));

  btnToggleDebug?.addEventListener('click', () => {
    debugEnabled = !debugEnabled;
    btnToggleDebug.setAttribute('aria-pressed', String(debugEnabled));
    btnToggleDebug.textContent = debugEnabled ? 'Debug: ON [D]' : 'Debug: OFF [D]';
    activeInstance?.toggleDebug?.(debugEnabled);
    featuredKeystoneInstance?.toggleDebug?.(debugEnabled);
  });

  btnApplySeed?.addEventListener('click', () => {
    const raw = Number(seedInput?.value ?? '20261105');
    const cleanSeed = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 20261105;
    if (activeInstance?.restartWithSeed) {
      activeInstance.restartWithSeed(cleanSeed);
      announce(`Restarted active game with seed ${cleanSeed}`);
    } else if (activeGameId) {
      launchGame(activeGameId, { seed: cleanSeed, debug: debugEnabled });
    } else if (featuredKeystoneInstance?.restartWithSeed) {
      featuredKeystoneInstance.restartWithSeed(cleanSeed);
      announce(`Restarted Keystone Forge with seed ${cleanSeed}`);
    }
  });

  // Check initial URL hash (#game=01-one-more-season or #catalog)
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const match = hash.match(/^#game=([a-z0-9-]+)$/i);
  if (
    match &&
    (ARCADE_GAMES_REGISTRY.some((g) => g.metadata.id === match[1]) ||
      match[1] === gameParadoxProtocol.metadata.id ||
      match[1] === game11.metadata.id ||
      match[1] === gameMetaphysicalDeli.metadata.id ||
      match[1] === game12.metadata.id ||
      match[1] === gameChronoSyndicate.metadata.id ||
      match[1] === gameChronoVortex.metadata.id ||
      match[1] === gameEventHorizon.metadata.id ||
      match[1] === gameAstralPinball.metadata.id ||
      match[1] === gameAegisZero.metadata.id ||
      match[1] === gameVoltLash.metadata.id ||
      match[1] === gameSnapback.metadata.id)
  ) {
    launchGame(match[1]);
  } else {
    showCatalog();
  }

  return {
    launchGame,
    showCatalog,
    getActiveGameId: () => activeGameId,
    destroy: () => {
      cleanupActiveGame();
      cleanupFeaturedKeystone();
    },
  };
}

if (typeof document !== 'undefined' && document.getElementById('hub-catalog-grid')) {
  mountArcadeHub(document.body);
}
