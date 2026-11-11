import { AegisAudioEngine } from './audio';
import { AEGIS_CONFIG } from './config';
import { AUGMENT_POOL, LOADOUT_CHASSIS, WAVE_SCHEDULE } from './content';
import {
  loadAegisSave,
  recordCompletedRun,
  selectLoadoutChassis,
  type AegisSaveDataV1,
} from './persistence';
import {
  buildRunTelemetryRecord,
  createInitialSimulationState,
  getCameraShakeOffset,
  selectAugment,
  stepSimulation,
  triggerShatterOrDash,
  type AegisSimulationState,
  type PlayerInputState,
} from './simulation';

export interface AegisUiController {
  destroy(): void;
  getStateSnapshot(): AegisSimulationState;
  restartWithSeed(seed: number, loadoutId?: string): void;
  toggleDebug(force?: boolean): void;
}

export function mountAegisZeroUi(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): AegisUiController {
  let saveData: AegisSaveDataV1 = loadAegisSave();
  let currentSeed = options?.initialSeed ?? 20261108;
  let debugMode = options?.debug ?? false;
  let simState: AegisSimulationState = createInitialSimulationState(
    currentSeed,
    saveData.selectedLoadoutId
  );
  let runRecordedForCurrentState = false;
  let isOffscreenPaused = false;

  const audio = new AegisAudioEngine();

  container.innerHTML = `
    <style>
      .aegis-root {
        content-visibility: auto;
        contain-intrinsic-size: auto none auto 720px;
        background: radial-gradient(circle at 50% 20%, #0b132b 0%, #050814 70%, #02040a 100%);
        color: #f8fafc;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 14px;
        max-width: 1120px;
        margin: 0 auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.14);
        user-select: none;
      }
      .aegis-topbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        padding: 8px 12px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.28);
        border-radius: 10px;
      }
      .aegis-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .aegis-badge {
        background: linear-gradient(135deg, #38bdf8, #a855f7);
        color: #020617;
        font-weight: 900;
        font-size: 0.72rem;
        padding: 3px 8px;
        border-radius: 999px;
        letter-spacing: 1px;
      }
      .aegis-title {
        font-size: 1.05rem;
        font-weight: 900;
        letter-spacing: 0.5px;
        margin: 0;
        color: #f8fafc;
      }
      .aegis-twist-pill {
        font-size: 0.78rem;
        color: #bae6fd;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.35);
        padding: 4px 10px;
        border-radius: 999px;
        font-weight: 700;
      }
      .aegis-controls-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .aegis-btn {
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 7px;
        padding: 5px 10px;
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: border-color 0.15s, transform 0.1s;
      }
      .aegis-btn:hover {
        border-color: #38bdf8;
        color: #ffffff;
      }
      .aegis-btn-primary {
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: #020617;
        border-color: #7dd3fc;
        font-weight: 900;
      }
      .aegis-hud-strip {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
        margin-bottom: 10px;
      }
      .aegis-stat-card {
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 6px 10px;
      }
      .aegis-stat-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #94a3b8;
        margin-bottom: 3px;
      }
      .aegis-stat-val {
        font-size: 0.96rem;
        font-weight: 800;
        color: #f8fafc;
      }
      .aegis-bar-track {
        width: 100%;
        height: 7px;
        background: #090d16;
        border-radius: 99px;
        overflow: hidden;
        margin-top: 4px;
      }
      .aegis-bar-fill {
        height: 100%;
        transition: width 0.08s linear;
      }
      .aegis-stage-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        max-height: 620px;
        background: #030712;
        border: 2px solid #1e293b;
        border-radius: 12px;
        overflow: hidden;
        touch-action: none;
      }
      .aegis-canvas {
        width: 100%;
        height: 100%;
        display: block;
        cursor: crosshair;
      }
      .aegis-overlay {
        position: absolute;
        inset: 0;
        background: rgba(2, 6, 23, 0.86);
        backdrop-filter: blur(6px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        z-index: 10;
      }
      .aegis-overlay[hidden] {
        display: none !important;
      }
      .aegis-draft-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        width: 100%;
        max-width: 820px;
        margin-top: 14px;
      }
      .aegis-draft-card {
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 24, 0.98));
        border: 2px solid var(--aug-color, #38bdf8);
        border-radius: 12px;
        padding: 14px;
        text-align: left;
        cursor: pointer;
        color: #f8fafc;
        transition: transform 0.14s ease, box-shadow 0.14s ease;
      }
      .aegis-draft-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
      }
      .aegis-recap-box {
        background: rgba(15, 23, 42, 0.95);
        border: 2px solid #38bdf8;
        border-radius: 14px;
        padding: 20px;
        max-width: 640px;
        width: 100%;
      }
      .aegis-recap-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px 16px;
        margin: 14px 0;
        font-size: 0.86rem;
      }
      .aegis-bottom-dock {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid #1e293b;
        font-size: 0.78rem;
        color: #94a3b8;
      }
      .aegis-loadout-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .aegis-touch-bar {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .aegis-track-pill {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 800;
        background: #0f172a;
        color: #475569;
        border: 1px solid #1e293b;
      }
      .aegis-track-pill.active {
        background: rgba(56, 189, 248, 0.18);
        color: #38bdf8;
        border-color: #38bdf8;
      }
    </style>

    <div class="aegis-root" id="aegis-zero-component">
      <div class="aegis-topbar">
        <div class="aegis-brand">
          <span class="aegis-badge">GAME #13 // DIRECTOR'S CUT</span>
          <h2 class="aegis-title">⚡ AEGIS-ZERO: GRAZE OVERCLOCK</h2>
          <span class="aegis-twist-pill">
            TWIST: Zero Ammo — Graze Within 44px of Enemy Fire to Shoot &amp; Charge Shatter!
          </span>
        </div>
        <div class="aegis-controls-row">
          <button type="button" class="aegis-btn aegis-btn-primary" id="btn-aegis-shatter">
            ⚡ Phase Shatter [SPACE]
          </button>
          <button type="button" class="aegis-btn" id="btn-aegis-mute">
            🔊 Synth Audio: ON [M]
          </button>
          <button type="button" class="aegis-btn" id="btn-aegis-restart">
            ↻ New Run [R]
          </button>
        </div>
      </div>

      <div class="aegis-hud-strip">
        <div class="aegis-stat-card">
          <div class="aegis-stat-label">Hull Integrity</div>
          <div class="aegis-stat-val" id="hud-aegis-hp">100 / 100</div>
          <div class="aegis-bar-track">
            <div class="aegis-bar-fill" id="bar-aegis-hp" style="width: 100%; background: #10b981;"></div>
          </div>
        </div>

        <div class="aegis-stat-card">
          <div class="aegis-stat-label">Graze Overclock [SPACE ≥ 30%]</div>
          <div class="aegis-stat-val" id="hud-aegis-overclock">35% READY</div>
          <div class="aegis-bar-track">
            <div class="aegis-bar-fill" id="bar-aegis-overclock" style="width: 35%; background: #38bdf8;"></div>
          </div>
        </div>

        <div class="aegis-stat-card">
          <div class="aegis-stat-label">Volatile Flux XP (4.0s Decay)</div>
          <div class="aegis-stat-val" id="hud-aegis-xp">LVL 1 · 0 / 100</div>
          <div class="aegis-bar-track">
            <div class="aegis-bar-fill" id="bar-aegis-xp" style="width: 0%; background: #a855f7;"></div>
          </div>
        </div>

        <div class="aegis-stat-card">
          <div class="aegis-stat-label">Wave &amp; Combo Multiplier</div>
          <div class="aegis-stat-val" id="hud-aegis-score">0 pts · ×1 COMBO</div>
          <div style="font-size: 0.72rem; color: #fde047; margin-top: 2px;" id="hud-aegis-wave">
            WAVE 1 / 8 · Best: 0
          </div>
        </div>

        <div class="aegis-stat-card">
          <div class="aegis-stat-label">4-Track Adaptive Synth Loop</div>
          <div class="aegis-stat-val" id="hud-aegis-bpm">122 BPM</div>
          <div style="display:flex; gap:3px; margin-top:3px;" id="hud-aegis-tracks">
            <span class="aegis-track-pill active">BASS</span>
            <span class="aegis-track-pill">ARP</span>
            <span class="aegis-track-pill">PERC</span>
            <span class="aegis-track-pill">LEAD</span>
          </div>
        </div>
      </div>

      <div class="aegis-stage-wrap" id="aegis-stage-wrap">
        <canvas
          id="aegis-canvas"
          class="aegis-canvas"
          width="${AEGIS_CONFIG.ARENA_WIDTH}"
          height="${AEGIS_CONFIG.ARENA_HEIGHT}"
          aria-label="Aegis-Zero: Graze Overclock Arcade Arena"
        ></canvas>

        <!-- 3-CHOICE ROGUELITE AUGMENT DRAFT OVERLAY -->
        <div class="aegis-overlay" id="aegis-draft-overlay" hidden>
          <div style="font-size: 0.76rem; font-weight: 900; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase;">
            ★ OVERCLOCK LEVEL-UP // 3-CHOICE SYNERGY DRAFT
          </div>
          <h3 style="margin: 4px 0 2px; font-size: 1.4rem; color: #f8fafc;">
            Select 1 Augment Module (Keys [1] [2] [3] or Click)
          </h3>
          <p style="margin: 0; font-size: 0.82rem; color: #94a3b8;">
            Drafting an augment also repairs +15 Hull Integrity immediately.
          </p>
          <div class="aegis-draft-grid" id="aegis-draft-cards"></div>
        </div>

        <!-- POST-RUN TELEMETRY RECAP OVERLAY -->
        <div class="aegis-overlay" id="aegis-recap-overlay" hidden>
          <div class="aegis-recap-box" id="aegis-recap-content"></div>
        </div>
      </div>

      <div class="aegis-bottom-dock">
        <div class="aegis-loadout-strip" id="aegis-loadout-strip"></div>
        <div class="aegis-touch-bar">
          <span>Controls: <strong>WASD/Arrows</strong> Move · <strong>Mouse/Touch</strong> Aim · <strong>SPACE</strong> Phase-Shatter</span>
        </div>
      </div>
    </div>
  `;

  const rootComponent = container.querySelector<HTMLElement>('#aegis-zero-component')!;
  const canvas = container.querySelector<HTMLCanvasElement>('#aegis-canvas')!;
  const ctx = canvas.getContext('2d');

  const hpText = container.querySelector<HTMLElement>('#hud-aegis-hp')!;
  const hpBar = container.querySelector<HTMLElement>('#bar-aegis-hp')!;
  const overclockText = container.querySelector<HTMLElement>('#hud-aegis-overclock')!;
  const overclockBar = container.querySelector<HTMLElement>('#bar-aegis-overclock')!;
  const xpText = container.querySelector<HTMLElement>('#hud-aegis-xp')!;
  const xpBar = container.querySelector<HTMLElement>('#bar-aegis-xp')!;
  const scoreText = container.querySelector<HTMLElement>('#hud-aegis-score')!;
  const waveText = container.querySelector<HTMLElement>('#hud-aegis-wave')!;
  const bpmText = container.querySelector<HTMLElement>('#hud-aegis-bpm')!;
  const tracksContainer = container.querySelector<HTMLElement>('#hud-aegis-tracks')!;

  const draftOverlay = container.querySelector<HTMLElement>('#aegis-draft-overlay')!;
  const draftCardsContainer = container.querySelector<HTMLElement>('#aegis-draft-cards')!;
  const recapOverlay = container.querySelector<HTMLElement>('#aegis-recap-overlay')!;
  const recapContent = container.querySelector<HTMLElement>('#aegis-recap-content')!;
  const loadoutStrip = container.querySelector<HTMLElement>('#aegis-loadout-strip')!;

  const btnShatter = container.querySelector<HTMLButtonElement>('#btn-aegis-shatter')!;
  const btnMute = container.querySelector<HTMLButtonElement>('#btn-aegis-mute')!;
  const btnRestart = container.querySelector<HTMLButtonElement>('#btn-aegis-restart')!;

  // Input Tracking (Keyboard + Mouse + Mobile Touch Fallback)
  const keysDown = new Set<string>();
  let pointerAimX = AEGIS_CONFIG.ARENA_WIDTH * 0.5;
  let pointerAimY = 120;
  let touchTargetX: number | null = null;
  let touchTargetY: number | null = null;
  let queuedShatterPress = false;

  function renderLoadoutButtons(): void {
    loadoutStrip.innerHTML = `<strong style="color:#e2e8f0;">Chassis Loadout:</strong>`;
    for (const chassis of LOADOUT_CHASSIS) {
      const isSelected = saveData.selectedLoadoutId === chassis.id;
      const isUnlocked = saveData.unlockedLoadoutIds.includes(chassis.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aegis-btn';
      btn.style.borderColor = isSelected ? chassis.color : '#334155';
      btn.style.color = isSelected ? chassis.color : '#cbd5e1';
      btn.textContent = `${isSelected ? '● ' : ''}${chassis.name}${isUnlocked ? '' : ' (Try)'}`;
      btn.title = `${chassis.title} — ${chassis.description}`;
      btn.addEventListener('click', () => {
        saveData = selectLoadoutChassis(saveData, chassis.id);
        restartRun(currentSeed + 1, chassis.id);
      });
      loadoutStrip.appendChild(btn);
    }
  }

  function renderDraftOverlay(): void {
    if (simState.status !== 'draft') {
      draftOverlay.hidden = true;
      return;
    }
    draftOverlay.hidden = false;
    draftCardsContainer.innerHTML = '';

    simState.draftChoices.forEach((aug, idx) => {
      const stacks = simState.augments[aug.id] ?? 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aegis-draft-card';
      btn.style.setProperty('--aug-color', aug.accentColor);
      btn.setAttribute('data-draft-index', String(idx));
      btn.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.7rem; font-weight:900; text-transform:uppercase; color:${aug.accentColor}; letter-spacing:1px;">
            [${idx + 1}] ${aug.rarity} · ${aug.lineageTag}
          </span>
          <span style="font-size:0.7rem; color:#94a3b8;">Stacks: ${stacks}</span>
        </div>
        <div style="font-size:1.05rem; font-weight:900; color:#f8fafc; margin-bottom:6px;">
          ${aug.name}
        </div>
        <p style="font-size:0.82rem; color:#cbd5e1; margin:0 0 8px; line-height:1.35;">
          ${aug.description}
        </p>
        <div style="font-size:0.74rem; color:#fde047; font-weight:600;">
          💡 ${aug.synergyHint}
        </div>
      `;
      btn.addEventListener('click', () => {
        handleDraftSelection(idx);
      });
      draftCardsContainer.appendChild(btn);
    });
  }

  function handleDraftSelection(idx: number): void {
    if (selectAugment(simState, idx)) {
      audio.playAugmentPick();
      if (simState.status === 'draft') {
        renderDraftOverlay();
      } else {
        draftOverlay.hidden = true;
      }
      updateHudDOM();
    }
  }

  function renderRecapOverlay(): void {
    if (simState.status !== 'victory' && simState.status !== 'defeat') {
      recapOverlay.hidden = true;
      return;
    }
    if (!runRecordedForCurrentState) {
      runRecordedForCurrentState = true;
      const record = buildRunTelemetryRecord(simState);
      saveData = recordCompletedRun(saveData, record);
      renderLoadoutButtons();
    }

    recapOverlay.hidden = false;
    const isVictory = simState.status === 'victory';
    const bannerColor = isVictory ? '#fde047' : '#f43f5e';
    const augmentNames = simState.augmentHistory
      .map((id) => AUGMENT_POOL.find((a) => a.id === id)?.name ?? id)
      .join(' · ');

    recapContent.style.borderColor = bannerColor;
    recapContent.innerHTML = `
      <div style="font-size:0.75rem; font-weight:900; letter-spacing:2px; color:${bannerColor}; text-transform:uppercase;">
        ${isVictory ? '👑 APEX VICTORY // CHRONO-SERAPH OMEGA OBLITERATED' : '💥 HULL BREACH // RUN TELEMETRY RECAP'}
      </div>
      <h3 style="margin:6px 0 4px; font-size:1.45rem; color:#f8fafc;">
        ${isVictory ? 'All 8 Sectors Cleared in Flow State!' : simState.causeOfEnd}
      </h3>
      <div class="aegis-recap-grid">
        <div><strong>Final Score:</strong> <span style="color:#fde047; font-weight:900;">${simState.score.toLocaleString()}</span></div>
        <div><strong>All-Time Best:</strong> ${saveData.bestScore.toLocaleString()}</div>
        <div><strong>Peak Combo:</strong> ×${simState.peakCombo}</div>
        <div><strong>Wave Reached:</strong> Wave ${simState.wave} / ${AEGIS_CONFIG.MAX_WAVES}</div>
        <div><strong>Total Damage Dealt:</strong> ${simState.totalDamageDealt.toLocaleString()}</div>
        <div><strong>Bullets Grazed (44px):</strong> <span style="color:#38bdf8; font-weight:800;">${simState.bulletsGrazed}</span></div>
        <div><strong>Bullets Shattered:</strong> ${simState.bulletsShattered}</div>
        <div><strong>Supercritical Gems (<1.5s):</strong> ${simState.supercriticalGemsCollected}</div>
        <div><strong>Deterministic Seed:</strong> <code>${simState.seed}</code></div>
        <div><strong>Run Duration:</strong> ${simState.elapsedRunTimeS.toFixed(1)}s</div>
      </div>
      <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:14px;">
        <strong>Drafted Synergy Build (${simState.augmentHistory.length}):</strong> ${augmentNames}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <button type="button" class="aegis-btn aegis-btn-primary" id="btn-recap-new-seed">
          ▶ Launch New Run [R]
        </button>
        <button type="button" class="aegis-btn" id="btn-recap-same-seed">
          ↺ Replay Exact Seed (${simState.seed})
        </button>
      </div>
    `;

    recapContent
      .querySelector<HTMLButtonElement>('#btn-recap-new-seed')
      ?.addEventListener('click', () => {
        restartRun(currentSeed + 7, saveData.selectedLoadoutId);
      });
    recapContent
      .querySelector<HTMLButtonElement>('#btn-recap-same-seed')
      ?.addEventListener('click', () => {
        restartRun(simState.seed, saveData.selectedLoadoutId);
      });
  }

  function restartRun(seed: number, loadoutId: string = saveData.selectedLoadoutId): void {
    currentSeed = seed;
    runRecordedForCurrentState = false;
    simState = createInitialSimulationState(currentSeed, loadoutId);
    draftOverlay.hidden = true;
    recapOverlay.hidden = true;
    renderLoadoutButtons();
    updateHudDOM();
    renderCanvasFrame();
  }

  function buildCurrentInput(): PlayerInputState {
    let moveX = 0;
    let moveY = 0;
    if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) moveX -= 1;
    if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) moveX += 1;
    if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) moveY -= 1;
    if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) moveY += 1;

    if (moveX === 0 && moveY === 0 && touchTargetX !== null && touchTargetY !== null) {
      const dx = touchTargetX - simState.player.x;
      const dy = touchTargetY - simState.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        moveX = dx / dist;
        moveY = dy / dist;
      }
    }

    const dashPressed = queuedShatterPress;
    queuedShatterPress = false;

    return {
      moveX,
      moveY,
      aimX: pointerAimX,
      aimY: pointerAimY,
      dashOrShatterPressed: dashPressed,
    };
  }

  function processFrameAudio(): void {
    const fa = simState.frameAudio;
    if (fa.grazeSpark) {
      audio.playGrazeSpark(simState.player.overclock, simState.comboMultiplier);
    }
    if (fa.railShotCrit !== null) {
      audio.playRailShot(fa.railShotCrit);
    }
    if (fa.heavyStrike) {
      audio.playHeavyStrike(fa.heavyStrike.isKill, fa.heavyStrike.isBoss);
    }
    if (fa.shatterBulletsCleared > 0) {
      audio.playShatterDischarge(fa.shatterBulletsCleared);
    }
    if (fa.gemPickupSupercritical !== null) {
      audio.playGemPickup(fa.gemPickupSupercritical, simState.comboMultiplier);
    }
    if (fa.playerHit) {
      audio.playPlayerHit();
    }

    const hasBoss = simState.enemies.some((e) => e.isBoss && e.hp > 0);
    audio.updateMusicIntensity({
      comboMultiplier: simState.comboMultiplier,
      overclockPct: simState.player.overclock,
      isBossActive: hasBoss,
      wave: simState.wave,
      isPaused: simState.status !== 'playing' || isOffscreenPaused,
    });
  }

  function updateHudDOM(): void {
    const p = simState.player;
    const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    hpBar.style.width = `${hpPct}%`;
    hpBar.style.background = hpPct > 50 ? '#10b981' : hpPct > 25 ? '#f59e0b' : '#f43f5e';

    const ocPct = Math.round(p.overclock);
    overclockText.textContent =
      ocPct >= 30 ? `${ocPct}% [SPACE READY!]` : `${ocPct}% (Graze to 30%)`;
    overclockBar.style.width = `${ocPct}%`;
    overclockBar.style.background = ocPct >= 75 ? '#fde047' : ocPct >= 30 ? '#38bdf8' : '#64748b';

    const xpPct = Math.min(100, Math.round((simState.xp / simState.xpToNextLevel) * 100));
    xpText.textContent = `LVL ${simState.level} · ${simState.xp} / ${simState.xpToNextLevel}`;
    xpBar.style.width = `${xpPct}%`;

    scoreText.textContent = `${simState.score.toLocaleString()} pts · ×${simState.comboMultiplier}`;
    waveText.textContent = `WAVE ${simState.wave} / ${AEGIS_CONFIG.MAX_WAVES} · Best: ${Math.max(saveData.bestScore, simState.score).toLocaleString()}`;

    const musicTel = audio.getMusicTelemetry();
    bpmText.textContent = `${musicTel.bpm} BPM`;
    const pills = tracksContainer.querySelectorAll('.aegis-track-pill');
    pills.forEach((pill, i) => {
      pill.classList.toggle('active', Boolean(musicTel.activeTracks[i]));
    });
  }

  function renderCanvasFrame(): void {
    if (!ctx) return;
    const W = AEGIS_CONFIG.ARENA_WIDTH;
    const H = AEGIS_CONFIG.ARENA_HEIGHT;

    ctx.save();

    // Background Grid & Hitstop Flash
    ctx.fillStyle = simState.hitstopMs > 0 ? '#0d152c' : '#040711';
    ctx.fillRect(0, 0, W, H);

    // Apply Trauma² Screenshake & Subtle Rotational Camera Kick
    const shake = getCameraShakeOffset(simState);
    if (shake.shakeIntensity > 0.0001) {
      ctx.translate(W * 0.5 + shake.offsetX, H * 0.5 + shake.offsetY);
      ctx.rotate(shake.angleRad);
      ctx.translate(-W * 0.5, -H * 0.5);
    }

    // Tactical Cyber Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
    ctx.lineWidth = 1;
    const gridStep = 48;
    for (let x = 0; x <= W; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 1. Render Lingering Smoke Puffs
    for (const sm of simState.smokePuffs) {
      const alpha = Math.max(0, 1 - sm.ageS / sm.maxAgeS) * 0.32;
      ctx.fillStyle = sm.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Render Shockwave Expansion Rings
    for (const sw of simState.shockwaves) {
      const alpha = Math.max(0, 1 - sw.ageS / sw.maxAgeS);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = sw.lineWidth * alpha + 1;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 3. Render Volatile Flux Gems (with 4.0s Decay Ring & 1.5s White-Hot Supercritical Halo)
    for (const gem of simState.fluxGems) {
      const lifeRatio = Math.max(0, 1 - gem.ageS / gem.maxAgeS);
      const isSupercritical = gem.ageS <= AEGIS_CONFIG.GEM_SUPERCRITICAL_WINDOW_S;

      // Outer decay countdown ring
      ctx.strokeStyle = isSupercritical ? '#fde047' : lifeRatio < 0.3 ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = isSupercritical ? 2.2 : 1.5;
      ctx.beginPath();
      ctx.arc(gem.x, gem.y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
      ctx.stroke();

      // Diamond core
      ctx.fillStyle = isSupercritical ? '#fef08a' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(gem.x, gem.y - 6);
      ctx.lineTo(gem.x + 6, gem.y);
      ctx.lineTo(gem.x, gem.y + 6);
      ctx.lineTo(gem.x - 6, gem.y);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Render Braid Temporal Ghosts (Jonathan Blow Worldline Twins)
    for (const g of simState.temporalGhosts) {
      const alpha = Math.max(0.2, (g.remainingS / g.maxDurationS) * 0.75);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.grazeRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Render Player Graze Halo & Ship
    const p = simState.player;
    ctx.save();

    // Overclock Time-Dilation Field (if augment active & Overclock >= 75%)
    if ((simState.augments['overclock-singularity'] ?? 0) > 0 && p.overclock >= 75) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 145, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // THE SIGNATURE 44px+ GRAZE HALO
    const haloColor = p.isCurrentlyGrazing
      ? '#fde047'
      : p.overclock >= 30
        ? '#38bdf8'
        : 'rgba(148, 163, 184, 0.55)';
    ctx.fillStyle = p.isCurrentlyGrazing
      ? 'rgba(253, 224, 71, 0.14)'
      : 'rgba(56, 189, 248, 0.06)';
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = p.isCurrentlyGrazing ? 2.8 : 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.grazeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Overclock Arc Gauge around Graze Halo
    if (p.overclock > 0) {
      ctx.strokeStyle = p.overclock >= 75 ? '#fde047' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        p.grazeRadius + 4,
        -Math.PI / 2,
        -Math.PI / 2 + (p.overclock / 100) * Math.PI * 2
      );
      ctx.stroke();
    }

    // Ship Delta Wings oriented toward Aim Cursor
    const aimAngle = Math.atan2(pointerAimY - p.y, pointerAimX - p.x);
    ctx.translate(p.x, p.y);
    ctx.rotate(aimAngle);

    ctx.fillStyle = p.invulnTimerS > 0 ? '#fef08a' : '#0ea5e9';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-11, -11);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-11, 11);
    ctx.closePath();
    ctx.fill();

    // Lethal 7px Core Hitbox (Crystal clear shmup readability)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6. Render Graze & Tesla Lightning Arcs
    for (const arc of simState.lightningArcs) {
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      const midX = (arc.x1 + arc.x2) * 0.5 + ( (simState.tick % 2 === 0) ? 7 : -7 );
      const midY = (arc.y1 + arc.y2) * 0.5 + ( (simState.tick % 3 === 0) ? -7 : 7 );
      ctx.lineTo(midX, midY);
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
    }

    // 7. Render Enemies & Bosses
    for (const e of simState.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);

      ctx.fillStyle = e.hitFlashS > 0 ? '#ffffff' : e.color;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = e.isBoss ? 3 : 1.5;

      // Octagon / Hexagon geometric hull
      const sides = e.isBoss ? 8 : e.isElite ? 6 : 5;
      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        const a = e.phaseAngle + (s / sides) * Math.PI * 2;
        const rx = Math.cos(a) * e.radius;
        const ry = Math.sin(a) * e.radius;
        if (s === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // HP Bar above Elite / Damaged Enemies
      if (e.isBoss || e.isElite || e.hp < e.maxHp) {
        const bw = e.radius * 2.1;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(-bw / 2, -e.radius - 12, bw, 5);
        ctx.fillStyle = e.isBoss ? '#fde047' : '#f43f5e';
        ctx.fillRect(-bw / 2, -e.radius - 12, bw * Math.max(0, e.hp / e.maxHp), 5);
      }
      ctx.restore();
    }

    // 8. Render Bullets (Player Rail-Shards vs. Enemy Plasma Orbs)
    for (const b of simState.bullets) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      if (!b.isPlayer) {
        // Bright inner core for enemy bullets
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 9. Render Sparks with Velocity Drag
    for (const sp of simState.sparks) {
      const alpha = Math.max(0, 1 - sp.ageS / sp.maxAgeS);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(sp.x - sp.size * 0.5, sp.y - sp.size * 0.5, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;

    // 10. Render Floating Visual Numbers (Crit Callouts & Bounce Physics)
    ctx.textAlign = 'center';
    for (const ft of simState.floatingTexts) {
      const alpha = Math.max(0, 1 - (ft.ageS / ft.maxAgeS) * 0.75);
      ctx.globalAlpha = alpha;
      ctx.font = `${ft.isCrit ? '900 15px' : '700 12px'} Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#020617';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    // 11. Top Canvas Wave / Boss Banner & First-5-Seconds Onboarding Callout
    const waveDef =
      WAVE_SCHEDULE[Math.min(WAVE_SCHEDULE.length - 1, simState.wave - 1)] ?? WAVE_SCHEDULE[0]!;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.76)';
    ctx.fillRect(14, 12, 430, 44);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeRect(14, 12, 430, 44);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 12px Inter, system-ui, sans-serif';
    ctx.fillText(`${waveDef.title} (${Math.max(0, Math.ceil(simState.waveDurationS - simState.waveTimerS))}s)`, 24, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.fillText(waveDef.subtitle, 24, 47);

    if (debugMode) {
      ctx.fillStyle = '#fde047';
      ctx.font = '700 11px monospace';
      ctx.fillText(
        `DEBUG // Tick:${simState.tick} Seed:${simState.seed} Trauma:${simState.trauma.toFixed(2)} Hitstop:${Math.round(simState.hitstopMs)}ms Bullets:${simState.bullets.length}`,
        16,
        H - 12
      );
    }

    ctx.restore();
  }

  // Event Listeners
  const onKeyDown = (e: KeyboardEvent): void => {
    if (simState.status === 'draft') {
      if (e.key === '1') {
        e.preventDefault();
        handleDraftSelection(0);
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        handleDraftSelection(1);
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        handleDraftSelection(2);
        return;
      }
    }

    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'BUTTON'
      ) {
        e.preventDefault();
      }
      queuedShatterPress = true;
      audio.startMusicLoop();
      return;
    }

    if (e.code === 'KeyR' && document.activeElement?.tagName !== 'INPUT') {
      restartRun(currentSeed + 1, saveData.selectedLoadoutId);
      return;
    }

    if (e.code === 'KeyM' && document.activeElement?.tagName !== 'INPUT') {
      const nextMute = !audio.isMuted();
      audio.setMuted(nextMute);
      btnMute.textContent = nextMute ? '🔇 Synth Audio: OFF [M]' : '🔊 Synth Audio: ON [M]';
      return;
    }

    keysDown.add(e.code);
    audio.startMusicLoop();
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    keysDown.delete(e.code);
  };

  const updatePointerCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = AEGIS_CONFIG.ARENA_WIDTH / Math.max(1, rect.width);
    const scaleY = AEGIS_CONFIG.ARENA_HEIGHT / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  canvas.addEventListener('pointermove', (e) => {
    const pt = updatePointerCoords(e.clientX, e.clientY);
    pointerAimX = pt.x;
    pointerAimY = pt.y;
    if (e.pointerType === 'touch' && e.buttons > 0) {
      touchTargetX = pt.x;
      touchTargetY = pt.y;
    }
  });

  canvas.addEventListener('pointerdown', (e) => {
    audio.startMusicLoop();
    const pt = updatePointerCoords(e.clientX, e.clientY);
    pointerAimX = pt.x;
    pointerAimY = pt.y;
    if (e.button === 2) {
      e.preventDefault();
      queuedShatterPress = true;
    } else if (e.pointerType === 'touch') {
      touchTargetX = pt.x;
      touchTargetY = pt.y;
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') {
      touchTargetX = null;
      touchTargetY = null;
    }
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  btnShatter.addEventListener('click', () => {
    audio.startMusicLoop();
    triggerShatterOrDash(simState, buildCurrentInput());
    processFrameAudio();
    updateHudDOM();
    renderCanvasFrame();
  });

  btnMute.addEventListener('click', () => {
    const nextMute = !audio.isMuted();
    audio.setMuted(nextMute);
    btnMute.textContent = nextMute ? '🔇 Synth Audio: OFF [M]' : '🔊 Synth Audio: ON [M]';
  });

  btnRestart.addEventListener('click', () => {
    restartRun(currentSeed + 1, saveData.selectedLoadoutId);
  });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Modern Web Guidance: efficient-background-processing
  // Pause/resume 60 FPS canvas loop when browser skips rendering off-screen content
  const onContentVisibilityChange = (event: Event): void => {
    const cvEvent = event as Event & { skipped?: boolean };
    isOffscreenPaused = Boolean(cvEvent.skipped);
  };
  rootComponent.addEventListener('contentvisibilityautostatechange', onContentVisibilityChange);

  let intersectionObserver: IntersectionObserver | null = null;
  if (
    typeof document !== 'undefined' &&
    !('contentVisibility' in document.documentElement.style) &&
    typeof IntersectionObserver !== 'undefined'
  ) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isOffscreenPaused = !entry.isIntersecting;
        }
      },
      { rootMargin: '200px' }
    );
    intersectionObserver.observe(rootComponent);
  }

  // Deterministic 60 FPS Fixed-Timestep Loop
  let rafId: number | null = null;
  let lastTimeMs = performance.now();
  let accumulatorS = 0;

  function frameLoop(nowMs: number): void {
    const rawDeltaS = Math.min(0.1, Math.max(0, (nowMs - lastTimeMs) / 1000));
    lastTimeMs = nowMs;

    if (!isOffscreenPaused) {
      accumulatorS += rawDeltaS;
      while (accumulatorS >= AEGIS_CONFIG.FIXED_DT) {
        accumulatorS -= AEGIS_CONFIG.FIXED_DT;
        const prevStatus = simState.status;
        stepSimulation(simState, buildCurrentInput(), AEGIS_CONFIG.FIXED_DT);
        processFrameAudio();

        if (simState.status !== prevStatus) {
          if (simState.status === 'draft') {
            renderDraftOverlay();
          } else if (simState.status === 'victory' || simState.status === 'defeat') {
            renderRecapOverlay();
          }
        }
      }
      updateHudDOM();
      renderCanvasFrame();
    }

    rafId = requestAnimationFrame(frameLoop);
  }

  renderLoadoutButtons();
  updateHudDOM();
  renderCanvasFrame();
  rafId = requestAnimationFrame(frameLoop);

  return {
    destroy(): void {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      rootComponent.removeEventListener(
        'contentvisibilityautostatechange',
        onContentVisibilityChange
      );
      intersectionObserver?.disconnect();
      audio.destroy();
      container.innerHTML = '';
    },
    getStateSnapshot(): AegisSimulationState {
      return simState;
    },
    restartWithSeed(seed: number, loadoutId?: string): void {
      restartRun(seed, loadoutId ?? saveData.selectedLoadoutId);
    },
    toggleDebug(force?: boolean): void {
      debugMode = force !== undefined ? force : !debugMode;
      renderCanvasFrame();
    },
  };
}
