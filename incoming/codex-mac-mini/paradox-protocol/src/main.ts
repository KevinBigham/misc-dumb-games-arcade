import { SoundEngine } from './omega/sound-engine';
import { MECH_SPECS, MechId } from './omega/mechs';
import { AUGMENTS, AugmentSpec, SYNERGY_EVOLUTIONS } from './omega/augments';
import { BossId } from './omega/bosses';
import {
  ACHIEVEMENTS,
  ARMORY_UPGRADES,
  getArmoryUpgradeCost,
  loadProfile,
  purchaseArmoryUpgrade,
  saveProfile,
} from './omega/persistence';
import { Holodeck3DViewer } from './omega/holodeck-3d';
import { GameWorld, NucleotideBase, StyleRank } from './omega/state';

// 1. Conditionally load Invoker Commands & Popover polyfills per declarative-dialog-popover-control
if (typeof HTMLButtonElement !== 'undefined' && !('commandForElement' in HTMLButtonElement.prototype)) {
  void import('invokers-polyfill');
}
if (typeof HTMLElement !== 'undefined' && !('popover' in HTMLElement.prototype)) {
  void import('@oddbird/popover-polyfill');
}

// 2. Top-layer exit transition probe & helper per animate-to-from-top-layer guide
let supportsDisplayTransition: boolean | undefined;
function canTransitionDisplay(): boolean {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit(): boolean {
  return Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
}

async function closeTopLayer(dialog: HTMLDialogElement): Promise<void> {
  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }
  dialog.close();
}

// 3. Light-dismiss fallback for <dialog closedby="any"> where native closedBy is missing
function setupDialogClosedByFallback(): void {
  if ('closedBy' in HTMLDialogElement.prototype) return;

  const outside = (e: PointerEvent, dialog: HTMLDialogElement): boolean => {
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => {
      pressedOutside = outside(e, dialog);
    });
    dialog.addEventListener('pointerup', (e) => {
      if (pressedOutside && outside(e, dialog)) {
        void closeTopLayer(dialog);
      }
    });
  }
}

const BOSS_ORDER: readonly BossId[] = ['seraph', 'leviathan', 'xenofold_omega', 'architect'];

const STYLE_RANK_INFO: Record<StyleRank, { label: string; cssClass: string }> = {
  D: { label: 'DORMANT', cssClass: 'rank-d' },
  C: { label: 'CHARGED', cssClass: 'rank-c' },
  B: { label: 'BALLISTIC', cssClass: 'rank-b' },
  A: { label: 'ANNIHILATOR', cssClass: 'rank-a' },
  S: { label: 'SAVAGE', cssClass: 'rank-s' },
  SS: { label: 'SUPERNOVA', cssClass: 'rank-ss' },
  VOIDBREAKER: { label: 'OMEGA HELIX', cssClass: 'rank-sss' },
};

function bootstrapGame(): void {
  const viewport = document.getElementById('game-viewport') as HTMLElement;
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement;
  const radarCtx = radarCanvas.getContext('2d')!;

  const hangarDialog = document.getElementById('hangar-dialog') as HTMLDialogElement;
  const holodeckDialog = document.getElementById('holodeck-dialog') as HTMLDialogElement;
  const augmentDialog = document.getElementById('augment-dialog') as HTMLDialogElement;
  const armoryDialog = document.getElementById('armory-dialog') as HTMLDialogElement;
  const codexDialog = document.getElementById('codex-dialog') as HTMLDialogElement;
  const gameoverDialog = document.getElementById('gameover-dialog') as HTMLDialogElement;

  const holodeckCanvas = document.getElementById('holodeck-canvas') as HTMLCanvasElement;
  const holodeckViewer = new Holodeck3DViewer(holodeckCanvas);

  const allDialogs = [
    hangarDialog,
    holodeckDialog,
    augmentDialog,
    armoryDialog,
    codexDialog,
    gameoverDialog,
  ];

  const profile = loadProfile();
  const sound = new SoundEngine();

  // Persistent Toast Notification ([popover="manual"])
  const toastEl = document.getElementById('achievement-toast') as HTMLElement;
  const toastTagEl = document.getElementById('toast-tag') as HTMLElement;
  const toastTitleEl = document.getElementById('toast-title') as HTMLElement;
  const toastDescEl = document.getElementById('toast-desc') as HTMLElement;
  let toastTimeout = 0;

  function showToast(title: string, subtitle: string, _accentColor?: string): void {
    toastTagEl.textContent = 'OMEGA TELEMETRY ALERT';
    toastTitleEl.textContent = title;
    toastDescEl.textContent = subtitle;
    try {
      if (!toastEl.matches(':popover-open')) {
        toastEl.showPopover();
      }
    } catch {
      // Ignore in headless environments
    }
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      try {
        if (toastEl.matches(':popover-open')) {
          toastEl.hidePopover();
        }
      } catch {
        // Ignore
      }
    }, 4500);
  }

  let currentDraftChoices: AugmentSpec[] = [];

  const world = new GameWorld(profile, sound, {
    onToast: (title, subtitle, accentColor) => showToast(title, subtitle, accentColor),
    onLevelUpDraft: (choices) => {
      currentDraftChoices = choices;
      renderAugmentChoices(choices);
      world.paused = true;
      if (!augmentDialog.open) {
        augmentDialog.showModal();
      }
    },
    onGameOver: (victory) => {
      world.paused = true;
      renderGameOverSummary(victory);
      if (!gameoverDialog.open) {
        gameoverDialog.showModal();
      }
    },
  });

  // Viewport & Canvas Dimensions
  let viewWidth = window.innerWidth;
  let viewHeight = window.innerHeight;

  function handleResize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewWidth = viewport.clientWidth || window.innerWidth;
    viewHeight = viewport.clientHeight || window.innerHeight;
    canvas.width = Math.floor(viewWidth * dpr);
    canvas.height = Math.floor(viewHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', handleResize);
  handleResize();

  // Dialog lifecycle synchronization & returnValue reset per dialog guide
  function syncPauseState(): void {
    const anyOpen = allDialogs.some((d) => d.open);
    world.paused = anyOpen;
  }

  for (const dialog of allDialogs) {
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
      syncPauseState();
    });
  }

  augmentDialog.addEventListener('cancel', (e) => {
    e.preventDefault();
  });

  setupDialogClosedByFallback();

  // ============================================================================
  // INPUT HANDLING (KEYBOARD, MOUSE, CODON SPLICING & GAMEPAD)
  // ============================================================================
  const keys = new Set<string>();
  let mouseScreenX = viewWidth * 0.5;
  let mouseScreenY = viewHeight * 0.5;
  let mouseDown = false;
  let runElapsedTime = 0;

  function getMoveInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    return { x, y };
  }

  function getAimWorldPos(): { x: number; y: number } {
    return world.camera.screenToWorld(
      mouseScreenX,
      mouseScreenY,
      viewWidth,
      viewHeight
    );
  }

  window.addEventListener('keydown', (e) => {
    sound.unlock();
    const code = e.code;

    if (code === 'Tab') {
      e.preventDefault();
      if (hangarDialog.open) {
        void closeTopLayer(hangarDialog);
      } else if (!allDialogs.some((d) => d.open)) {
        renderHangarCards();
        world.paused = true;
        hangarDialog.showModal();
      }
      return;
    }

    if (code === 'KeyH') {
      if (holodeckDialog.open) {
        void closeTopLayer(holodeckDialog);
      } else if (!allDialogs.some((d) => d.open)) {
        world.paused = true;
        holodeckDialog.showModal();
      }
      return;
    }

    if (code === 'KeyU' && !allDialogs.some((d) => d.open)) {
      renderArmory();
      world.paused = true;
      armoryDialog.showModal();
      return;
    }

    if (code === 'KeyC' && !allDialogs.some((d) => d.open)) {
      renderCodex();
      world.paused = true;
      codexDialog.showModal();
      return;
    }

    if (code === 'KeyM') {
      toggleAudioMute();
      return;
    }

    if (code === 'KeyP' && !allDialogs.some((d) => d.open)) {
      toggleAutoPilot();
      return;
    }

    if (world.paused) return;

    // Live AlphaGenome Codon Splicing hotkeys (1=A, 2=T, 3=G, 4=C)
    if (code === 'Digit1') {
      world.spliceNucleotide('A');
      return;
    }
    if (code === 'Digit2') {
      world.spliceNucleotide('T');
      return;
    }
    if (code === 'Digit3') {
      world.spliceNucleotide('G');
      return;
    }
    if (code === 'Digit4') {
      world.spliceNucleotide('C');
      return;
    }

    keys.add(code);

    if (code === 'Space') {
      e.preventDefault();
      world.triggerDash(getMoveInput());
    } else if (code === 'KeyQ' || code === 'KeyE') {
      world.triggerAltFire(getAimWorldPos());
    } else if (code === 'KeyR') {
      world.triggerActiveVent();
    } else if (code === 'KeyF') {
      world.triggerUltimate();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseScreenX = e.clientX - rect.left;
    mouseScreenY = e.clientY - rect.top;
  });

  canvas.addEventListener('pointerdown', (e) => {
    sound.unlock();
    if (e.button === 0) {
      mouseDown = true;
    } else if (e.button === 2) {
      world.triggerAltFire(getAimWorldPos());
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (e.button === 0) {
      mouseDown = false;
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // ============================================================================
  // CODON SPLICER BUTTONS, BOSS-RUSH CHIPS & HOLODECK CONTROLS
  // ============================================================================
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.codon-splice-btn')) {
    btn.addEventListener('click', () => {
      sound.unlock();
      const nuc = btn.dataset.nuc as NucleotideBase | undefined;
      if (nuc) {
        world.spliceNucleotide(nuc);
      }
    });
  }

  for (const chip of document.querySelectorAll<HTMLButtonElement>('.boss-spawn-chip')) {
    chip.addEventListener('click', () => {
      sound.unlock();
      const idx = Number(chip.dataset.boss ?? 2);
      const bossId = BOSS_ORDER[idx] ?? 'xenofold_omega';
      world.spawnBossEncounter(bossId);
    });
  }

  for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-holo-mode]')) {
    tab.addEventListener('click', () => {
      for (const t of document.querySelectorAll<HTMLButtonElement>('[data-holo-mode]')) {
        t.classList.remove('active-tab');
      }
      tab.classList.add('active-tab');
      holodeckViewer.model =
        tab.dataset.holoMode === 'mech'
          ? world.mech.id === 'antigravity'
            ? 'agy_swarm'
            : 'helix_mech'
          : 'kras_p01116';
    });
  }

  const spawnKrasNowBtn = document.getElementById('btn-spawn-kras-now') as HTMLButtonElement;
  spawnKrasNowBtn.addEventListener('click', () => {
    sound.unlock();
    void closeTopLayer(holodeckDialog);
    world.paused = false;
    world.spawnBossEncounter('xenofold_omega');
  });

  // ============================================================================
  // HANGAR, AUGMENT DRAFT, ARMORY & CODEX UI RENDERERS
  // ============================================================================
  let selectedMechId: MechId = profile.selectedMech;
  const mechSelectorEl = document.getElementById('mech-selector') as HTMLElement;
  const sectorModeSelect = document.getElementById('sector-mode') as HTMLSelectElement;
  const launchBtn = document.getElementById('btn-launch-run') as HTMLButtonElement;

  function renderHangarCards(): void {
    mechSelectorEl.innerHTML = '';
    for (const mech of Object.values(MECH_SPECS)) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `mech-card ${mech.id === selectedMechId ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="mech-card-header">
          <span class="mech-card-name" style="color: ${mech.accentColor}">${mech.title}</span>
          <span class="mech-card-tag">${mech.codeName} // ${mech.role}</span>
        </div>
        <p class="mech-card-desc">${mech.primaryDesc} ${mech.altDesc}</p>
        <div class="mech-stats-list">
          <span>WEAPON: <strong style="color: #f8fafc">${mech.primaryName}</strong></span>
          <span>SPECIAL: <strong style="color: ${mech.secondaryColor}">${mech.altName}</strong></span>
          <span>HULL / SHIELD: <strong>${mech.maxHp} / ${mech.maxShield}</strong></span>
          <span>SPEED / DMG: <strong>${mech.moveSpeed} / ${mech.baseDamage}</strong></span>
        </div>
      `;
      card.addEventListener('click', () => {
        selectedMechId = mech.id;
        renderHangarCards();
      });
      mechSelectorEl.appendChild(card);
    }
  }

  function startConfiguredRun(): void {
    const mode = sectorModeSelect.value;
    world.endlessMode = mode === 'endless';
    world.resetRun(selectedMechId);
    runElapsedTime = 0;
    if (mode === 'bossrush') {
      world.spawnBossEncounter('xenofold_omega');
    }
    updateAbilityDockLabels();
  }

  launchBtn.addEventListener('click', () => {
    sound.unlock();
    startConfiguredRun();
    void closeTopLayer(hangarDialog);
    world.paused = false;
  });

  function updateAbilityDockLabels(): void {
    const m = world.mech;
    (document.getElementById('hud-mech-badge') as HTMLElement).textContent =
      `${m.title} // ${m.codeName}`;
    (document.getElementById('label-primary') as HTMLElement).textContent = m.primaryName;
    (document.getElementById('label-katana') as HTMLElement).textContent = m.altName;
    (document.getElementById('label-nova') as HTMLElement).textContent = 'ACTIVE VENT [R]';
    (document.getElementById('label-overdrive') as HTMLElement).textContent = m.ultimateName;
  }

  // Augment Draft Renderer
  const augmentChoicesEl = document.getElementById('augment-choices') as HTMLElement;
  const rerollBtn = document.getElementById('btn-reroll-augments') as HTMLButtonElement;

  const RARITY_COLORS: Record<AugmentSpec['rarity'], string> = {
    common: '#38bdf8',
    rare: '#a855f7',
    epic: '#facc15',
    overdrive: '#10b981',
  };

  function renderAugmentChoices(choices: AugmentSpec[]): void {
    augmentChoicesEl.innerHTML = '';
    rerollBtn.textContent = `REROLL (25 CORES // HAVE ${profile.voidCores})`;
    rerollBtn.disabled = profile.voidCores < 25;

    for (const aug of choices) {
      const currentRank = world.augmentRanks[aug.id] || 0;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'augment-card';

      const partnerSynergy = SYNERGY_EVOLUTIONS.find(
        (syn) =>
          syn.requiredAugments.includes(aug.id) &&
          syn.requiredAugments.some(
            (otherId) => otherId !== aug.id && (world.augmentRanks[otherId] || 0) > 0
          )
      );

      card.innerHTML = `
        <div>
          <div class="augment-rarity" style="color: ${RARITY_COLORS[aug.rarity]}">
            ${aug.icon} ${aug.rarity.toUpperCase()} // RANK ${currentRank + 1}/${aug.maxStacks}
          </div>
          <h3 class="augment-title">${aug.name}</h3>
          <p class="augment-desc">${aug.description}</p>
        </div>
        ${
          partnerSynergy
            ? `<div class="augment-synergy-hint">⚡ COMPLETES SYNERGY: ${partnerSynergy.name}</div>`
            : `<div class="augment-synergy-hint" style="opacity: 0.78">CATEGORY: ${aug.category.toUpperCase()}</div>`
        }
      `;

      card.addEventListener('click', () => {
        world.applyAugment(aug.id);
        void closeTopLayer(augmentDialog);
        world.paused = false;
      });
      augmentChoicesEl.appendChild(card);
    }
  }

  rerollBtn.addEventListener('click', () => {
    if (profile.voidCores < 25) return;
    profile.voidCores -= 25;
    saveProfile(profile);
    currentDraftChoices = world.rollAugmentChoices(3);
    if (currentDraftChoices.length > 0) {
      renderAugmentChoices(currentDraftChoices);
    }
  });

  // Armory Renderer
  const armoryListEl = document.getElementById('armory-list') as HTMLElement;
  const armoryCoresEl = document.getElementById('armory-cores-count') as HTMLElement;

  function renderArmory(): void {
    armoryCoresEl.textContent = String(profile.voidCores);
    armoryListEl.innerHTML = '';

    for (const upg of ARMORY_UPGRADES) {
      const rank = profile.armoryRanks[upg.id] || 0;
      const isMax = rank >= upg.maxRank;
      const cost = getArmoryUpgradeCost(upg, rank);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'armory-card';
      card.disabled = isMax || profile.voidCores < cost;

      card.innerHTML = `
        <div>
          <div class="augment-rarity">${upg.icon} RANK ${rank} / ${upg.maxRank}</div>
          <h3 class="augment-title">${upg.name}</h3>
          <p class="augment-desc">${upg.description}</p>
        </div>
        <div class="augment-synergy-hint">
          ${isMax ? 'MAX RANK ACHIEVED' : `UPGRADE COST: ${cost} VOID CORES`}
        </div>
      `;

      card.addEventListener('click', () => {
        const res = purchaseArmoryUpgrade(profile, upg.id);
        if (res.success) {
          world.applyAugment('__refresh__');
          renderArmory();
        }
      });

      armoryListEl.appendChild(card);
    }
  }

  // Codex & Achievements Renderer
  const codexSynergiesEl = document.getElementById('codex-synergies') as HTMLElement;
  const codexStatsEl = document.getElementById('codex-stats') as HTMLElement;
  const codexAchievementsEl = document.getElementById('codex-achievements') as HTMLElement;

  function renderCodex(): void {
    codexSynergiesEl.innerHTML = '';
    for (const syn of SYNERGY_EVOLUTIONS) {
      const unlocked = world.seenSynergies.has(syn.id);
      const a1 =
        AUGMENTS.find((a) => a.id === syn.requiredAugments[0])?.name ?? syn.requiredAugments[0];
      const a2 =
        AUGMENTS.find((a) => a.id === syn.requiredAugments[1])?.name ?? syn.requiredAugments[1];
      const item = document.createElement('div');
      item.className = `codex-item ${unlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <strong style="color: ${syn.bannerColor}">${syn.icon} ${syn.name} ${
          unlocked ? ' // ACTIVE' : ''
        }</strong>
        <p style="margin: 0.2rem 0; font-size: 0.75rem; color: #cbd5e1">${syn.description}</p>
        <small style="font-family: var(--font-mono); color: #94a3b8">REQUIRES: ${a1} + ${a2}</small>
      `;
      codexSynergiesEl.appendChild(item);
    }

    codexStatsEl.innerHTML = `
      <div>HIGH SCORE: <strong style="color: #facc15">${profile.bestScore.toLocaleString()}</strong></div>
      <div>HIGHEST WAVE: <strong style="color: #00f2fe">${profile.bestWave}</strong></div>
      <div>TOTAL KILLS: <strong>${profile.totalKills.toLocaleString()}</strong></div>
      <div>TOTAL SORTIES: <strong style="color: #ff0844">${profile.totalRuns}</strong></div>
      <div>CODONS SPLICED: <strong style="color: #00ff87">${world.splicesCompleted}</strong></div>
      <div>PARRY REFLECTS: <strong style="color: #b721ff">${world.parriesCount}</strong></div>
    `;

    codexAchievementsEl.innerHTML = '';
    for (const ach of ACHIEVEMENTS) {
      const isUnlocked = profile.unlockedAchievements.includes(ach.id);
      const item = document.createElement('div');
      item.className = `codex-item ${isUnlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <strong style="color: ${isUnlocked ? '#00ff87' : '#94a3b8'}">
          ${ach.icon} ${ach.title} ${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
        </strong>
        <p style="margin: 0.2rem 0 0; font-size: 0.74rem; color: #cbd5e1">${ach.description}</p>
      `;
      codexAchievementsEl.appendChild(item);
    }
  }

  // Game Over Summary Renderer
  const gameoverEyebrowEl = document.getElementById('gameover-eyebrow') as HTMLElement;
  const gameoverTitleEl = document.getElementById('gameover-title') as HTMLElement;
  const gameoverSummaryEl = document.getElementById('gameover-summary') as HTMLElement;
  const retryBtn = document.getElementById('btn-retry-run') as HTMLButtonElement;

  function renderGameOverSummary(victory: boolean): void {
    gameoverEyebrowEl.textContent = victory
      ? 'SINGULARITY CONQUERED // OMEGA CLEARANCE'
      : 'SIGNAL LOST // HULL INTEGRITY CRITICAL';
    gameoverTitleEl.textContent = victory ? 'VICTORY TELEMETRY REPORT' : 'SORTIE TELEMETRY REPORT';
    gameoverSummaryEl.innerHTML = `
      <div class="summary-stat"><span>FINAL SCORE</span><strong>${world.score.toLocaleString()}</strong></div>
      <div class="summary-stat"><span>SECTOR REACHED</span><strong>WAVE ${world.wave}</strong></div>
      <div class="summary-stat"><span>HOSTILES TERMINATED</span><strong>${world.kills}</strong></div>
      <div class="summary-stat"><span>PILOT LEVEL</span><strong>LVL ${world.level}</strong></div>
      <div class="summary-stat"><span>SYNERGIES EVOLVED</span><strong>${world.seenSynergies.size}</strong></div>
      <div class="summary-stat"><span>VOID CORES BANKED</span><strong>${profile.voidCores}</strong></div>
    `;
  }

  retryBtn.addEventListener('click', () => {
    void closeTopLayer(gameoverDialog);
    startConfiguredRun();
    world.paused = false;
  });

  // Audio Mute & Auto-Pilot Buttons
  const muteBtn = document.getElementById('btn-mute') as HTMLButtonElement;
  function toggleAudioMute(): void {
    const nextMuted = !sound.toggleMute();
    muteBtn.setAttribute('aria-pressed', String(!nextMuted));
    muteBtn.textContent = !nextMuted ? 'AUDIO: MUTED [M]' : 'AUDIO: ON [M]';
  }
  muteBtn.addEventListener('click', () => {
    sound.unlock();
    toggleAudioMute();
  });

  const autoPilotBtn = document.getElementById('btn-autopilot') as HTMLButtonElement;
  function toggleAutoPilot(): void {
    world.autoAim = !world.autoAim;
    world.autoFire = world.autoAim;
    autoPilotBtn.classList.toggle('active', world.autoAim);
    autoPilotBtn.textContent = world.autoAim ? 'AI PILOT: ENGAGED [P]' : 'AI PILOT: OFF [P]';
    if (world.autoAim) {
      showToast(
        'AUTONOMOUS AI SWARM PILOT',
        'AI Pilot is auto-targeting hostiles, venting weapon heat & assisting combat.'
      );
    }
  }
  autoPilotBtn.addEventListener('click', () => {
    sound.unlock();
    toggleAutoPilot();
  });

  // Refresh Armory & Codex whenever opened via declarative Invoker Commands
  const observer = new MutationObserver(() => {
    if (hangarDialog.open) renderHangarCards();
    if (armoryDialog.open) renderArmory();
    if (codexDialog.open) renderCodex();
    syncPauseState();
  });
  for (const dialog of allDialogs) {
    observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }

  // ============================================================================
  // HUD TELEMETRY & RADAR SYNC
  // ============================================================================
  const hpTextEl = document.getElementById('hud-hp-text') as HTMLElement;
  const hpBarEl = document.getElementById('hud-hp-bar') as HTMLElement;
  const shieldTextEl = document.getElementById('hud-shield-text') as HTMLElement;
  const shieldBarEl = document.getElementById('hud-shield-bar') as HTMLElement;
  const heatStatusEl = document.getElementById('hud-heat-status') as HTMLElement;
  const heatBarEl = document.getElementById('hud-heat-bar') as HTMLElement;
  const xpTextEl = document.getElementById('hud-xp-text') as HTMLElement;
  const xpBarEl = document.getElementById('hud-xp-bar') as HTMLElement;
  const pilotLevelEl = document.getElementById('hud-pilot-level') as HTMLElement;
  const waveLabelEl = document.getElementById('hud-wave-label') as HTMLElement;
  const timerEl = document.getElementById('hud-timer') as HTMLElement;
  const bossHudEl = document.getElementById('boss-hud') as HTMLElement;
  const bossNameEl = document.getElementById('boss-name') as HTMLElement;
  const bossPhaseEl = document.getElementById('boss-phase') as HTMLElement;
  const bossHpBarEl = document.getElementById('boss-hp-bar') as HTMLElement;
  const bossSubtitleEl = document.getElementById('boss-subtitle') as HTMLElement;
  const synergyStripEl = document.getElementById('synergy-strip') as HTMLElement;
  const scoreEl = document.getElementById('hud-score') as HTMLElement;
  const comboEl = document.getElementById('hud-combo') as HTMLElement;
  const styleRankEl = document.getElementById('hud-style-rank') as HTMLElement;
  const coresEl = document.getElementById('hud-cores') as HTMLElement;
  const agentsEl = document.getElementById('hud-agents') as HTMLElement;
  const killsEl = document.getElementById('hud-kills') as HTMLElement;

  const codonSlotEls = [
    document.getElementById('codon-slot-0') as HTMLElement,
    document.getElementById('codon-slot-1') as HTMLElement,
    document.getElementById('codon-slot-2') as HTMLElement,
  ];
  const codonActiveLabelEl = document.getElementById('codon-active-label') as HTMLElement;

  const cdKatanaEl = document.getElementById('cd-katana') as HTMLElement;
  const cdDashEl = document.getElementById('cd-dash') as HTMLElement;
  const cdNovaEl = document.getElementById('cd-nova') as HTMLElement;
  const cdOverdriveEl = document.getElementById('cd-overdrive') as HTMLElement;

  function renderTacticalRadar(): void {
    const rw = radarCanvas.width;
    const rh = radarCanvas.height;
    const cx = rw * 0.5;
    const cy = rh * 0.5;
    const scale = (rw * 0.44) / 1400;

    radarCtx.clearRect(0, 0, rw, rh);
    radarCtx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, rw * 0.24, 0, Math.PI * 2);
    radarCtx.stroke();

    const sweepAngle = performance.now() * 0.0025;
    radarCtx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(
      cx + Math.cos(sweepAngle) * (rw * 0.45),
      cy + Math.sin(sweepAngle) * (rh * 0.45)
    );
    radarCtx.stroke();

    radarCtx.fillStyle = '#00ff87';
    for (const agent of world.subAgents) {
      const dx = (agent.pos.x - world.playerPos.x) * scale;
      const dy = (agent.pos.y - world.playerPos.y) * scale;
      radarCtx.fillRect(cx + dx - 1.5, cy + dy - 1.5, 3, 3);
    }

    for (const enemy of world.enemies) {
      const dx = (enemy.pos.x - world.playerPos.x) * scale;
      const dy = (enemy.pos.y - world.playerPos.y) * scale;
      if (dx * dx + dy * dy > rw * 0.45 * (rw * 0.45)) continue;
      radarCtx.fillStyle = enemy.type === 'juggernaut' ? '#facc15' : '#ff0844';
      radarCtx.fillRect(cx + dx - 1.5, cy + dy - 1.5, 3, 3);
    }

    if (world.boss) {
      const dx = (world.boss.pos.x - world.playerPos.x) * scale;
      const dy = (world.boss.pos.y - world.playerPos.y) * scale;
      radarCtx.fillStyle = world.boss.id === 'xenofold_omega' ? '#00ff87' : '#f43f5e';
      radarCtx.beginPath();
      radarCtx.arc(
        Math.max(6, Math.min(rw - 6, cx + dx)),
        Math.max(6, Math.min(rh - 6, cy + dy)),
        4.5,
        0,
        Math.PI * 2
      );
      radarCtx.fill();
    }

    radarCtx.fillStyle = '#00f2fe';
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 3, 0, Math.PI * 2);
    radarCtx.fill();
  }

  function updateHud(): void {
    hpTextEl.textContent = `${Math.ceil(world.hp)} / ${Math.ceil(world.maxHp)}`;
    hpBarEl.style.width = `${Math.max(0, Math.min(100, (world.hp / world.maxHp) * 100))}%`;

    shieldTextEl.textContent = `${Math.ceil(world.shield)} / ${Math.ceil(world.maxShield)}`;
    shieldBarEl.style.width = `${Math.max(0, Math.min(100, (world.shield / world.maxShield) * 100))}%`;

    heatBarEl.style.width = `${Math.max(0, Math.min(100, world.heat))}%`;
    if (world.overheatedLockout > 0) {
      heatStatusEl.textContent = 'OVERHEATED';
      heatStatusEl.style.color = '#ff0844';
    } else if (world.overchargeTimer > 0) {
      heatStatusEl.textContent = `OVERCHARGED (${world.overchargeTimer.toFixed(1)}s)`;
      heatStatusEl.style.color = '#00ff87';
    } else if (world.heat >= 65 && world.heat <= 80) {
      heatStatusEl.textContent = 'SWEET-SPOT [PRESS R!]';
      heatStatusEl.style.color = '#facc15';
    } else {
      heatStatusEl.textContent = `${Math.round(world.heat)}%`;
      heatStatusEl.style.color = '#00f2fe';
    }

    xpTextEl.textContent = `${Math.floor(world.xp)} / ${world.xpToNext}`;
    xpBarEl.style.width = `${Math.max(0, Math.min(100, (world.xp / world.xpToNext) * 100))}%`;
    pilotLevelEl.textContent = `LVL ${world.level}`;

    waveLabelEl.textContent = `SECTOR ${String(world.wave).padStart(2, '0')} // ${
      world.endlessMode ? 'ENDLESS' : 'SINGULARITY'
    }`;
    const mins = Math.floor(runElapsedTime / 60);
    const secs = Math.floor(runElapsedTime % 60);
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (world.boss) {
      bossHudEl.hidden = false;
      bossNameEl.textContent = `${world.boss.name} // ${world.boss.subtitle}`;
      bossPhaseEl.textContent = `PHASE ${world.boss.phase}`;
      bossHpBarEl.style.width = `${Math.max(
        0,
        Math.min(100, (world.boss.hp / world.boss.maxHp) * 100)
      )}%`;
      bossSubtitleEl.textContent =
        world.boss.id === 'xenofold_omega'
          ? 'ALPHAFOLD P01116 3D BOSS — TARGET G12C P-LOOP (300% CRIT) & SWITCH-II POCKET (225% CRIT)'
          : 'HIGH-THREAT DREADNOUGHT — PARRY BULLET CURTAINS & STRIKE DURING WITCH-TIME';
    } else {
      bossHudEl.hidden = true;
    }

    // Update AlphaGenome Codon Splicer HUD
    for (let i = 0; i < 3; i++) {
      const nuc = world.codonBuffer[i];
      const slot = codonSlotEls[i];
      slot.textContent = nuc ?? '-';
      slot.className = `codon-slot ${nuc ? `nuc-${nuc}` : ''}`;
    }
    codonActiveLabelEl.textContent = `LAST SPLICE: ${world.lastCodonTriggered} [KEYS 1-4]`;

    scoreEl.textContent = world.score.toLocaleString();
    comboEl.textContent = `${Math.max(1, world.combo)}x`;
    const rankKey = world.getStyleRank();
    const rankMeta = STYLE_RANK_INFO[rankKey];
    styleRankEl.textContent = `${rankKey} // ${rankMeta.label}`;
    styleRankEl.className = `style-rank ${rankMeta.cssClass}`;

    coresEl.textContent = String(profile.voidCores);
    agentsEl.textContent = String(world.subAgents.length);
    killsEl.textContent = String(world.kills);

    cdKatanaEl.style.width = `${Math.max(
      0,
      Math.min(100, (1 - world.altCooldown / Math.max(0.2, world.mech.altCooldown)) * 100)
    )}%`;
    cdDashEl.style.width = `${Math.max(
      0,
      Math.min(100, (1 - world.dashCooldown / Math.max(0.2, world.mech.dashCooldown)) * 100)
    )}%`;
    cdNovaEl.style.width = `${Math.max(0, Math.min(100, world.heat))}%`;
    cdOverdriveEl.style.width =
      world.ultimateActiveTimer > 0
        ? `${(world.ultimateActiveTimer / 5.0) * 100}%`
        : `${Math.min(100, world.ultimateCharge)}%`;

    if (synergyStripEl.childElementCount !== world.seenSynergies.size) {
      synergyStripEl.innerHTML = '';
      for (const synId of world.seenSynergies) {
        const syn = SYNERGY_EVOLUTIONS.find((s) => s.id === synId);
        if (syn) {
          const badge = document.createElement('span');
          badge.className = 'synergy-badge';
          badge.textContent = `${syn.icon} ${syn.name}`;
          synergyStripEl.appendChild(badge);
        }
      }
    }

    renderTacticalRadar();
  }

  // ============================================================================
  // MAIN GAMEPAD + 60FPS ANIMATION LOOP
  // ============================================================================
  function pollGamepadAndAI(): { move: { x: number; y: number }; aim: { x: number; y: number } } {
    let move = getMoveInput();
    let aim = getAimWorldPos();

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0];
    if (pad && !world.paused) {
      const lx = pad.axes[0] || 0;
      const ly = pad.axes[1] || 0;
      if (Math.hypot(lx, ly) > 0.22) {
        move = { x: lx, y: ly };
      }

      const rx = pad.axes[2] || 0;
      const ry = pad.axes[3] || 0;
      if (Math.hypot(rx, ry) > 0.25) {
        aim = {
          x: world.playerPos.x + rx * 350,
          y: world.playerPos.y + ry * 350,
        };
      }

      if (pad.buttons[7]?.pressed) mouseDown = true;
      if (pad.buttons[6]?.pressed) world.triggerAltFire(aim);
      if (pad.buttons[0]?.pressed) world.triggerDash(move);
      if (pad.buttons[2]?.pressed) world.triggerActiveVent();
      if (pad.buttons[5]?.pressed) world.triggerUltimate();
    }

    // Autonomous AI Swarm Pilot movement + sweet-spot venting when enabled
    if (world.autoAim && !world.paused) {
      if (world.heat >= 66 && world.heat <= 79) {
        world.triggerActiveVent();
      }
      if (move.x === 0 && move.y === 0) {
        const t = performance.now() * 0.0018;
        move = { x: Math.cos(t), y: Math.sin(t * 1.3) };
      }
    }

    return { move, aim };
  }

  let lastTime = performance.now();
  function frame(now: number): void {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const { move, aim } = pollGamepadAndAI();
    if (!world.paused && !world.gameOver) {
      runElapsedTime += dt;
    }

    world.update(dt, move, aim, mouseDown, viewWidth, viewHeight);
    world.render(ctx, viewWidth, viewHeight);
    if (holodeckDialog.open) {
      holodeckViewer.render(dt);
    }
    updateHud();

    requestAnimationFrame(frame);
  }

  // Open Hangar on initial boot so the pilot can choose their Cyber-Frame or inspect the 3D KRAS-G12C Holodeck
  renderHangarCards();
  updateAbilityDockLabels();
  world.paused = true;
  hangarDialog.showModal();

  requestAnimationFrame(frame);
}

bootstrapGame();
