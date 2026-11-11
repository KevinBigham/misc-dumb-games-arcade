import { SoundEngine } from './audio/sound-engine';
import { MECH_SPECS, MechId } from './game/mechs';
import { AUGMENTS, AugmentSpec, SYNERGY_EVOLUTIONS } from './game/augments';
import {
  ACHIEVEMENTS,
  ARMORY_UPGRADES,
  getArmoryUpgradeCost,
  loadProfile,
  purchaseArmoryUpgrade,
  saveProfile,
} from './game/persistence';
import { GameWorld } from './game/state';

// 1. Conditionally load Invoker Commands polyfill per modern-web-guidance
if (typeof HTMLButtonElement !== 'undefined' && !('commandForElement' in HTMLButtonElement.prototype)) {
  void import('invokers-polyfill');
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

function bootstrapGame(): void {
  const viewport = document.getElementById('game-viewport') as HTMLElement;
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement;
  const radarCtx = radarCanvas.getContext('2d')!;

  const hangarDialog = document.getElementById('hangar-dialog') as HTMLDialogElement;
  const augmentDialog = document.getElementById('augment-dialog') as HTMLDialogElement;
  const armoryDialog = document.getElementById('armory-dialog') as HTMLDialogElement;
  const codexDialog = document.getElementById('codex-dialog') as HTMLDialogElement;
  const gameoverDialog = document.getElementById('gameover-dialog') as HTMLDialogElement;

  const allDialogs = [hangarDialog, augmentDialog, armoryDialog, codexDialog, gameoverDialog];

  const profile = loadProfile();
  const sound = new SoundEngine();

  let currentDraftChoices: AugmentSpec[] = [];
  let toastTimeout = 0;

  const showToast = (title: string, subtitle: string, accentColor = '#00f2fe') => {
    const banner = document.getElementById('toast-banner')!;
    const titleEl = document.getElementById('toast-title')!;
    const subEl = document.getElementById('toast-subtitle')!;
    banner.hidden = false;
    banner.style.borderColor = accentColor;
    titleEl.style.color = accentColor;
    titleEl.textContent = title;
    subEl.textContent = subtitle;
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      banner.hidden = true;
    }, 3600);
  };

  const world = new GameWorld(profile, sound, {
    onLevelUpDraft: (choices) => {
      currentDraftChoices = choices;
      renderAugmentDraftChoices(choices);
      if (!augmentDialog.open) {
        augmentDialog.showModal();
      }
    },
    onGameOver: (victory) => {
      renderGameOverModal(victory);
      if (!gameoverDialog.open) {
        gameoverDialog.showModal();
      }
    },
    onToast: showToast,
  });

  // Resize handler
  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Pause simulation whenever any modal dialog is open
  const syncDialogPauseState = () => {
    const anyOpen = allDialogs.some((d) => d.open);
    world.paused = anyOpen;
  };

  for (const d of allDialogs) {
    d.addEventListener('close', () => {
      // Reset returnValue per dialog guidance to prevent stale values leaking
      d.returnValue = '';
      syncDialogPauseState();
    });
    d.addEventListener('cancel', (event) => {
      if (d.getAttribute('closedby') === 'none') {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      void closeTopLayer(d);
    });
  }

  setupDialogClosedByFallback();

  // Efficient background processing via contentvisibilityautostatechange
  let renderSkipped = false;
  viewport.addEventListener('contentvisibilityautostatechange', (event) => {
    const cvEvent = event as Event & { skipped?: boolean };
    renderSkipped = Boolean(cvEvent.skipped);
  });

  if (!('contentVisibility' in document.documentElement.style) && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          renderSkipped = !entry.isIntersecting;
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(viewport);
  }

  // Input state
  const keys = new Set<string>();
  const mouseScreen = { x: window.innerWidth * 0.6, y: window.innerHeight * 0.5 };
  let mouseDownLeft = false;

  window.addEventListener('keydown', (e) => {
    sound.unlock();
    const code = e.code;
    keys.add(code);

    // Hotkeys 1, 2, 3 inside Neural Augment draft dialog
    if (augmentDialog.open && currentDraftChoices.length > 0) {
      if (code === 'Digit1' && currentDraftChoices[0]) {
        selectAugmentChoice(currentDraftChoices[0].id);
        return;
      }
      if (code === 'Digit2' && currentDraftChoices[1]) {
        selectAugmentChoice(currentDraftChoices[1].id);
        return;
      }
      if (code === 'Digit3' && currentDraftChoices[2]) {
        selectAugmentChoice(currentDraftChoices[2].id);
        return;
      }
    }

    if (world.paused || world.gameOver) return;

    if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      e.preventDefault();
      world.triggerDash(getMoveInputVector());
    } else if (code === 'KeyE') {
      const aimWorld = world.camera.screenToWorld(
        mouseScreen.x,
        mouseScreen.y,
        window.innerWidth,
        window.innerHeight
      );
      world.triggerAltFire(aimWorld);
    } else if (code === 'KeyQ') {
      world.triggerUltimate();
    } else if (code === 'KeyR') {
      world.triggerActiveVent();
    } else if (code === 'KeyC') {
      toggleAutoAim();
    } else if (code === 'KeyF') {
      toggleAutoFire();
    } else if (code === 'Escape' || code === 'KeyP') {
      renderHangarCards();
      if (!hangarDialog.open) {
        hangarDialog.showModal();
        syncDialogPauseState();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  canvas.addEventListener('pointermove', (e) => {
    mouseScreen.x = e.clientX;
    mouseScreen.y = e.clientY;
  });

  canvas.addEventListener('pointerdown', (e) => {
    sound.unlock();
    mouseScreen.x = e.clientX;
    mouseScreen.y = e.clientY;
    if (e.button === 0) {
      mouseDownLeft = true;
    } else if (e.button === 2) {
      const aimWorld = world.camera.screenToWorld(
        mouseScreen.x,
        mouseScreen.y,
        window.innerWidth,
        window.innerHeight
      );
      world.triggerAltFire(aimWorld);
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (e.button === 0) mouseDownLeft = false;
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  function getMoveInputVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;

    // Optional Gamepad API thumbstick support
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.18) x += gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.18) y += gp.axes[1];
    }
    return { x, y };
  }

  // UI Button Handlers
  const btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
  btnMute.addEventListener('click', () => {
    sound.unlock();
    const isOn = sound.toggleMute();
    btnMute.textContent = isOn ? 'AUDIO: ON' : 'AUDIO: MUTED';
    btnMute.setAttribute('aria-pressed', String(!isOn));
  });

  const btnAutoAim = document.getElementById('btn-auto-aim') as HTMLButtonElement;
  const stateAutoAim = document.getElementById('state-auto-aim')!;
  function toggleAutoAim(): void {
    world.autoAim = !world.autoAim;
    btnAutoAim.setAttribute('aria-pressed', String(world.autoAim));
    stateAutoAim.textContent = world.autoAim ? 'ENGAGED' : 'MANUAL';
  }
  btnAutoAim.addEventListener('click', toggleAutoAim);

  const btnAutoFire = document.getElementById('btn-auto-fire') as HTMLButtonElement;
  const stateAutoFire = document.getElementById('state-auto-fire')!;
  function toggleAutoFire(): void {
    world.autoFire = !world.autoFire;
    btnAutoFire.setAttribute('aria-pressed', String(world.autoFire));
    stateAutoFire.textContent = world.autoFire ? 'ENGAGED' : 'MANUAL';
  }
  btnAutoFire.addEventListener('click', toggleAutoFire);

  // Render Mech Hangar Cards
  function renderHangarCards(): void {
    const container = document.getElementById('mech-cards-grid')!;
    container.innerHTML = '';

    (Object.keys(MECH_SPECS) as MechId[]).forEach((id) => {
      const spec = MECH_SPECS[id];
      const card = document.createElement('div');
      card.className = `mech-select-card ${profile.selectedMech === id ? 'is-selected' : ''}`;
      card.style.borderColor = profile.selectedMech === id ? spec.accentColor : '';
      card.innerHTML = `
        <div class="mech-card-top">
          <span class="badge-code" style="color:${spec.accentColor};border-color:${spec.accentColor}">${spec.codeName}</span>
          <strong>${spec.title}</strong>
        </div>
        <div class="mech-card-role" style="color:${spec.accentColor}">${spec.role}</div>
        <ul class="mech-Loadout-list">
          <li><strong>HULL / AEGIS:</strong> ${spec.maxHp} HP / ${spec.maxShield} Shield</li>
          <li><strong>PRIMARY:</strong> ${spec.primaryName} — ${spec.primaryDesc}</li>
          <li><strong>ALT-FIRE:</strong> ${spec.altName} — ${spec.altDesc}</li>
          <li><strong>ULTIMATE:</strong> ${spec.ultimateName} — ${spec.ultimateDesc}</li>
        </ul>
      `;
      card.addEventListener('click', () => {
        profile.selectedMech = id;
        saveProfile(profile);
        renderHangarCards();
      });
      container.appendChild(card);
    });
  }

  document.getElementById('btn-launch-run')!.addEventListener('click', () => {
    sound.unlock();
    world.resetRun(profile.selectedMech);
    void closeTopLayer(hangarDialog);
  });

  document.getElementById('btn-daily-seed')!.addEventListener('click', () => {
    sound.unlock();
    const todaySeed = new Date().toISOString().slice(0, 10);
    world.resetRun(profile.selectedMech, `DAILY-${todaySeed}`);
    showToast(`DAILY SEED SORTIE: ${todaySeed}`, 'Deterministic sector seed engaged!', '#facc15');
    void closeTopLayer(hangarDialog);
  });

  // Render Neural Augment Level-Up Draft
  function renderAugmentDraftChoices(choices: AugmentSpec[]): void {
    const container = document.getElementById('augment-choices-grid')!;
    container.innerHTML = '';

    choices.forEach((aug, idx) => {
      const currentRank = world.augmentRanks[aug.id] || 0;
      // Check if picking this augment completes a Synergy Evolution!
      const completesSynergy = SYNERGY_EVOLUTIONS.find(
        (syn) =>
          syn.requiredAugments.includes(aug.id) &&
          syn.requiredAugments.some(
            (otherId) => otherId !== aug.id && (world.augmentRanks[otherId] || 0) > 0
          )
      );

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'augment-card';
      if (idx === 0) btn.autofocus = true;

      btn.innerHTML = `
        <div class="augment-card-header">
          <span class="augment-icon">${aug.icon}</span>
          <span class="rarity-tag rarity-${aug.rarity}">${aug.rarity} // RANK ${currentRank + 1}/${aug.maxStacks}</span>
        </div>
        <h3>[${idx + 1}] ${aug.name}</h3>
        <p style="color:#cbd5e1;font-size:0.84rem;line-height:1.45">${aug.description}</p>
        ${
          completesSynergy
            ? `<div class="synergy-hint-pill">★ UNLOCKS SYNERGY: ${completesSynergy.name}</div>`
            : ''
        }
      `;
      btn.addEventListener('click', () => selectAugmentChoice(aug.id));
      container.appendChild(btn);
    });

    const strip = document.getElementById('active-synergies-strip')!;
    if (world.stats.unlockedSynergies.length > 0) {
      strip.innerHTML = `<div class="synergy-hint-pill">ACTIVE EVOLUTIONS: ${world.stats.unlockedSynergies
        .map((s) => s.name)
        .join(' • ')}</div>`;
    } else {
      strip.innerHTML = '';
    }
  }

  function selectAugmentChoice(augmentId: string): void {
    world.applyAugment(augmentId);
    void closeTopLayer(augmentDialog);
  }

  // Render Armory Meta-Progression Upgrades
  function renderArmoryModal(): void {
    document.getElementById('armory-cores-count')!.textContent = String(profile.voidCores);
    const grid = document.getElementById('armory-grid')!;
    grid.innerHTML = '';

    for (const spec of ARMORY_UPGRADES) {
      const rank = profile.armoryRanks[spec.id] || 0;
      const isMax = rank >= spec.maxRank;
      const cost = getArmoryUpgradeCost(spec, rank);
      const canAfford = !isMax && profile.voidCores >= cost;

      const card = document.createElement('div');
      card.className = 'armory-card';
      card.innerHTML = `
        <div>
          <div class="augment-card-header" style="margin-bottom:6px">
            <span class="augment-icon">${spec.icon}</span>
            <span class="badge-code">RANK ${rank} / ${spec.maxRank}</span>
          </div>
          <h3 style="font-family:var(--font-mono);font-size:0.95rem;margin-bottom:4px">${spec.name}</h3>
          <p style="font-size:0.8rem;color:#cbd5e1">${spec.description}</p>
        </div>
        <button type="button" class="cyber-btn" ${!canAfford ? 'disabled style="opacity:0.45;cursor:not-allowed"' : ''}>
          ${isMax ? 'MAX RANK ACHIEVED' : `UPGRADE (${cost} CORES)`}
        </button>
      `;

      const btn = card.querySelector('button')!;
      if (canAfford) {
        btn.addEventListener('click', () => {
          const res = purchaseArmoryUpgrade(profile, spec.id);
          if (res.success) {
            sound.playLevelUp();
            world.stats = world.applyAugment('__refresh__') ? world.stats : world.stats;
            renderArmoryModal();
          }
        });
      }
      grid.appendChild(card);
    }
  }

  // Render Codex & Achievements Modal
  function renderCodexModal(): void {
    const synList = document.getElementById('codex-synergies-list')!;
    synList.innerHTML = '';
    for (const syn of SYNERGY_EVOLUTIONS) {
      const a1 = AUGMENTS.find((a) => a.id === syn.requiredAugments[0])?.name ?? syn.requiredAugments[0];
      const a2 = AUGMENTS.find((a) => a.id === syn.requiredAugments[1])?.name ?? syn.requiredAugments[1];
      const div = document.createElement('div');
      div.className = 'codex-item';
      div.innerHTML = `
        <strong style="color:${syn.bannerColor};font-family:var(--font-mono)">${syn.icon} ${syn.name}</strong>
        <div style="font-size:0.75rem;color:#94a3b8;margin:3px 0">REQUIRES: ${a1} + ${a2}</div>
        <p>${syn.description}</p>
      `;
      synList.appendChild(div);
    }

    const achList = document.getElementById('codex-achievements-list')!;
    achList.innerHTML = '';
    for (const ach of ACHIEVEMENTS) {
      const unlocked = profile.unlockedAchievements.includes(ach.id);
      const div = document.createElement('div');
      div.className = `codex-item ${unlocked ? 'is-unlocked' : ''}`;
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-family:var(--font-mono)">
          <strong>${ach.icon} ${ach.title}</strong>
          <span style="color:${unlocked ? '#facc15' : '#64748b'}">${
        unlocked ? 'UNLOCKED' : `+${ach.rewardCores} CORES`
      }</span>
        </div>
        <p style="margin-top:4px;color:#cbd5e1">${ach.description}</p>
      `;
      achList.appendChild(div);
    }
  }

  // Render Game Over / Victory Summary Modal
  function renderGameOverModal(victory: boolean): void {
    const eyebrow = document.getElementById('gameover-eyebrow')!;
    const title = document.getElementById('gameover-title')!;
    const btnEndless = document.getElementById('btn-endless-continue') as HTMLButtonElement;

    if (victory) {
      eyebrow.textContent = 'ARCHITECT PRIME VANQUISHED // SECTOR SOVEREIGN';
      title.textContent = 'MISSION ACCOMPLISHED: VOIDBREAKER';
      title.style.color = '#facc15';
      btnEndless.hidden = false;
    } else {
      eyebrow.textContent = 'SORTIE TELEMETRY REPORT';
      title.textContent = 'SIGNAL LOST // MECH DESTROYED';
      title.style.color = '#ff0844';
      btnEndless.hidden = true;
    }

    const statsGrid = document.getElementById('gameover-stats-grid')!;
    statsGrid.innerHTML = `
      <div class="stat-tile"><span>FINAL SCORE</span><strong>${world.score.toLocaleString()}</strong></div>
      <div class="stat-tile"><span>WAVE REACHED</span><strong>WAVE 0${world.wave}</strong></div>
      <div class="stat-tile"><span>HOSTILES ELIMINATED</span><strong>${world.kills}</strong></div>
      <div class="stat-tile"><span>MAX COMBO</span><strong>${world.maxCombo} HIT</strong></div>
      <div class="stat-tile"><span>CORES HARVESTED</span><strong style="color:#d8b4fe">+${world.coresCollectedThisRun}</strong></div>
    `;
  }

  document.getElementById('btn-play-again')!.addEventListener('click', () => {
    world.resetRun(profile.selectedMech);
    void closeTopLayer(gameoverDialog);
  });

  document.getElementById('btn-endless-continue')!.addEventListener('click', () => {
    world.endlessMode = true;
    world.gameOver = false;
    world.running = true;
    world.wave++;
    void closeTopLayer(gameoverDialog);
  });

  document.getElementById('btn-gameover-armory')!.addEventListener('click', () => {
    void closeTopLayer(gameoverDialog).then(() => {
      renderArmoryModal();
      armoryDialog.showModal();
    });
  });

  // Sync Armory & Codex content whenever opened
  const observer = new MutationObserver(() => {
    if (armoryDialog.open) renderArmoryModal();
    if (codexDialog.open) renderCodexModal();
    if (hangarDialog.open) renderHangarCards();
    syncDialogPauseState();
  });
  for (const d of allDialogs) {
    observer.observe(d, { attributes: true, attributeFilter: ['open'] });
  }

  // HUD DOM elements cache
  const elMechCode = document.getElementById('hud-mech-code')!;
  const elMechName = document.getElementById('hud-mech-name')!;
  const elLevel = document.getElementById('hud-level')!;
  const elHpText = document.getElementById('hud-hp-text')!;
  const elHpFill = document.getElementById('hud-hp-fill')!;
  const elShieldText = document.getElementById('hud-shield-text')!;
  const elShieldFill = document.getElementById('hud-shield-fill')!;
  const elHeatState = document.getElementById('hud-heat-state')!;
  const elHeatFill = document.getElementById('hud-heat-fill')!;
  const elWaveTitle = document.getElementById('hud-wave-title')!;
  const elXpFill = document.getElementById('hud-xp-fill')!;
  const elBossHud = document.getElementById('boss-hud')!;
  const elBossName = document.getElementById('boss-name')!;
  const elBossSub = document.getElementById('boss-subtitle')!;
  const elBossHpFill = document.getElementById('boss-hp-fill')!;
  const elComboText = document.getElementById('hud-combo-text')!;
  const elStyleRank = document.getElementById('hud-style-rank')!;
  const elScore = document.getElementById('hud-score')!;
  const elKills = document.getElementById('hud-kills')!;
  const elCores = document.getElementById('hud-cores')!;
  const elCdDash = document.getElementById('cd-dash')!;
  const elLabelAlt = document.getElementById('label-alt')!;
  const elCdAlt = document.getElementById('cd-alt')!;
  const elLabelUlt = document.getElementById('label-ult')!;
  const elCdUlt = document.getElementById('cd-ult')!;

  function updateHudDOM(): void {
    elMechCode.textContent = world.mech.codeName;
    elMechName.textContent = world.mech.title;
    elLevel.textContent = `LVL ${String(world.level).padStart(2, '0')}`;

    elHpText.textContent = `${Math.ceil(world.hp)} / ${world.maxHp}`;
    elHpFill.style.width = `${Math.max(0, (world.hp / world.maxHp) * 100)}%`;

    elShieldText.textContent = `${Math.ceil(world.shield)} / ${world.maxShield}`;
    elShieldFill.style.width = `${Math.max(0, (world.shield / world.maxShield) * 100)}%`;

    elHeatFill.style.width = `${world.heat}%`;
    if (world.overheatedLockout > 0) {
      elHeatState.textContent = 'OVERHEATED!';
      elHeatState.style.color = '#ff0844';
    } else if (world.overchargeTimer > 0) {
      elHeatState.textContent = 'OVERCHARGED!';
      elHeatState.style.color = '#facc15';
    } else if (world.heat >= 65 && world.heat <= 80) {
      elHeatState.textContent = 'PRESS [R] SWEET-SPOT!';
      elHeatState.style.color = '#00f2fe';
    } else {
      elHeatState.textContent = `${Math.round(world.heat)}%`;
      elHeatState.style.color = '#94a3b8';
    }

    const sectorNum = Math.min(3, Math.ceil(world.wave / 3));
    elWaveTitle.textContent =
      world.witchTimeTimer > 0
        ? `⏳ TACHYON WITCH-TIME // ${world.witchTimeTimer.toFixed(1)}s`
        : `SECTOR 0${sectorNum} // WAVE 0${world.wave}`;
    elXpFill.style.width = `${Math.min(100, (world.xp / world.xpToNext) * 100)}%`;

    if (world.boss) {
      elBossHud.hidden = false;
      elBossName.textContent = `${world.boss.name} [PHASE ${world.boss.phase}]`;
      elBossSub.textContent = world.boss.subtitle;
      elBossHpFill.style.width = `${Math.max(0, (world.boss.hp / world.boss.maxHp) * 100)}%`;
    } else {
      elBossHud.hidden = true;
    }

    const rank = world.getStyleRank();
    elStyleRank.textContent = rank;
    elStyleRank.setAttribute('data-rank', rank);
    elComboText.textContent = `${world.combo} HIT COMBO`;

    elScore.textContent = world.score.toLocaleString();
    elKills.textContent = String(world.kills);
    elCores.textContent = String(profile.voidCores);

    elCdDash.textContent =
      world.dashCooldown > 0 ? `${world.dashCooldown.toFixed(1)}s` : 'READY';
    elLabelAlt.textContent = world.mech.altName.split(' (')[0].toUpperCase();
    elCdAlt.textContent =
      world.altCooldown > 0 ? `${world.altCooldown.toFixed(1)}s` : 'READY';
    elLabelUlt.textContent = world.mech.ultimateName.split(' (')[0];
    elCdUlt.textContent =
      world.ultimateCharge >= 100
        ? '100% READY [Q]'
        : `${Math.floor(world.ultimateCharge)}%`;
  }

  function renderRadarMinimap(): void {
    const rw = radarCanvas.width;
    const rh = radarCanvas.height;
    radarCtx.clearRect(0, 0, rw, rh);

    // Radar grid crosshairs
    radarCtx.strokeStyle = 'rgba(0, 242, 254, 0.18)';
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.moveTo(rw * 0.5, 0);
    radarCtx.lineTo(rw * 0.5, rh);
    radarCtx.moveTo(0, rh * 0.5);
    radarCtx.lineTo(rw, rh * 0.5);
    radarCtx.stroke();

    const sx = rw / world.arenaWidth;
    const sy = rh / world.arenaHeight;

    // Shards
    radarCtx.fillStyle = '#b721ff';
    for (const s of world.shards) {
      if (s.voidCore > 0) {
        radarCtx.fillRect(s.pos.x * sx - 1.5, s.pos.y * sy - 1.5, 3, 3);
      }
    }

    // Enemies
    for (const e of world.enemies) {
      radarCtx.fillStyle = e.type === 'pylon' ? '#00f2fe' : '#ff2a85';
      radarCtx.fillRect(e.pos.x * sx - 1.5, e.pos.y * sy - 1.5, 3, 3);
    }

    // Boss
    if (world.boss) {
      radarCtx.fillStyle = '#facc15';
      radarCtx.beginPath();
      radarCtx.arc(
        world.boss.pos.x * sx,
        world.boss.pos.y * sy,
        4.5,
        0,
        Math.PI * 2
      );
      radarCtx.fill();
    }

    // Player
    radarCtx.fillStyle = '#00f2fe';
    radarCtx.beginPath();
    radarCtx.arc(
      world.playerPos.x * sx,
      world.playerPos.y * sy,
      3.5,
      0,
      Math.PI * 2
    );
    radarCtx.fill();
  }

  // Open Mech Hangar on initial boot so the player can pick their Cyber-Frame or immediately press Enter/Click
  renderHangarCards();
  hangarDialog.showModal();
  syncDialogPauseState();

  // Main 60-120 FPS Animation Loop
  let lastTime = performance.now();
  function frame(now: number): void {
    const rawDt = (now - lastTime) / 1000;
    lastTime = now;

    if (!renderSkipped && !document.hidden) {
      const aimWorld = world.camera.screenToWorld(
        mouseScreen.x,
        mouseScreen.y,
        window.innerWidth,
        window.innerHeight
      );
      world.update(
        rawDt,
        getMoveInputVector(),
        aimWorld,
        mouseDownLeft,
        window.innerWidth,
        window.innerHeight
      );
      world.render(ctx, window.innerWidth, window.innerHeight);
      updateHudDOM();
      renderRadarMinimap();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapGame);
  } else {
    bootstrapGame();
  }
}
