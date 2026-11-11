import { EmberAudioSynthesizer } from './audio';
import {
  AutomationRuleId,
  EndingId,
  GAME_CONFIG,
  InitialRepairId,
  ResourceId,
  StationId,
} from './config';
import {
  AUTOMATION_RULES,
  CHAPTERS,
  ENDINGS,
  INITIAL_REPAIRS,
  MESSAGE_EVENTS,
  REMOTE_STATIONS,
  RESOURCES,
  ResourceCost,
} from './content';
import {
  clearLocalStorageSave,
  deserializeState,
  saveToLocalStorage,
  serializeState,
} from './persistence';
import {
  addResources,
  alignFrequency,
  canAfford,
  canTriggerEnding,
  crankDynamo,
   createInitialState,
  decodeMessageEvent,
  evaluateChapterProgression,
  GameState,
  gatherSalvage,
  getAvailableMessageEvents,
  getCompletedRepairCount,
  getPoweredStationCount,
  performInitialRepair,
  resolveMessageEventChoice,
  stepCycle,
  toggleAutomationRule,
  toggleRemoteStation,
  triggerEnding,
  unlockAutomationRule,
} from './simulation';

function formatCost(cost: ResourceCost): string {
  const parts: string[] = [];
  if (cost.watts) parts.push(`${cost.watts}W`);
  if (cost.alloy) parts.push(`${cost.alloy} Alloy`);
  if (cost.cipher) parts.push(`${cost.cipher} Cipher`);
  return parts.length > 0 ? parts.join(' + ') : 'Free';
}

export class EmberRelayUI {
  private container: HTMLElement;
  private state: GameState;
  private audio: EmberAudioSynthesizer;
  private debugOpen: boolean;
  private statusBannerText: string = '';
  private rafId: number | null = null;
  private wavePhase: number = 0;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    initialState: GameState,
    options?: { debug?: boolean }
  ) {
    this.container = container;
    this.state = initialState;
    this.audio = new EmberAudioSynthesizer();
    this.debugOpen = Boolean(options?.debug);

    this.boundKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.boundKeyDown);

    this.injectStyles();
    this.render();
    this.startOscilloscopeLoop();
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(nextState: GameState): void {
    this.state = nextState;
    saveToLocalStorage(this.state);
    this.render();
  }

  public restartWithSeed(seed: number): void {
    clearLocalStorageSave();
    this.state = createInitialState(seed);
    saveToLocalStorage(this.state);
    this.statusBannerText = `Restarted Ember Point Relay with seed ${seed}.`;
    this.render();
  }

  public toggleDebug(force?: boolean): void {
    this.debugOpen = force !== undefined ? force : !this.debugOpen;
    this.render();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.audio.destroy();
    this.container.innerHTML = '';
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      this.toggleDebug();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      this.handleAction(() => crankDynamo(this.state), 'crank');
    } else if (
      (e.key === 's' || e.key === 'S') &&
      this.state.unlockedResources.alloy
    ) {
      e.preventDefault();
      this.handleAction(() => gatherSalvage(this.state), 'relay');
    } else if (
      (e.key === 't' || e.key === 'T') &&
      this.state.capabilities.oscilloscopeUnlocked
    ) {
      e.preventDefault();
      this.handleAction(() => alignFrequency(this.state), 'morse');
    } else if (
      (e.key === 'n' || e.key === 'N') &&
      this.state.capabilities.receiverWarmed
    ) {
      e.preventDefault();
      this.handleAction(() => stepCycle(this.state), 'relay');
    }
  }

  private handleAction(
    fn: () => { ok: boolean; reason: string },
    soundType: 'crank' | 'morse' | 'relay' | 'chord'
  ): void {
    const prevChapter = this.state.chapter;
    const prevOsc = this.state.capabilities.oscilloscopeUnlocked;
    const result = fn();
    this.statusBannerText = result.reason;

    if (result.ok) {
      if (
        this.state.chapter > prevChapter ||
        (!prevOsc && this.state.capabilities.oscilloscopeUnlocked) ||
        this.state.endingReached
      ) {
        this.audio.playChapterChord();
      } else if (soundType === 'crank') {
        this.audio.playDynamoCrank(this.state.capabilities.receiverWarmed);
      } else if (soundType === 'morse') {
        this.audio.playMorsePulse();
      } else if (soundType === 'relay') {
        this.audio.playRelayClunk();
      }
      saveToLocalStorage(this.state);
    }
    this.render();
  }

  private startOscilloscopeLoop(): void {
    if (typeof window === 'undefined') return;
    const tick = () => {
      this.wavePhase += 0.07;
      this.drawOscilloscope();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private drawOscilloscope(): void {
    const canvas = this.container.querySelector<HTMLCanvasElement>(
      '#ember-oscilloscope-canvas'
    );
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#090d12';
    ctx.fillRect(0, 0, w, h);

    // Subtle phosphor grid
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Carrier waveform
    const lockRatio = this.state.signalLock / 100;
    const jitter = (1 - lockRatio) * 14;
    ctx.strokeStyle = this.state.endingReached ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const t = x * 0.045 + this.wavePhase;
      const harmonic =
        Math.sin(t) * 20 +
        Math.sin(t * 2.3 + this.state.harmonicPhase * 0.1) * (8 * (1 - lockRatio * 0.6));
      const noise =
        Math.sin(x * 0.7 + this.wavePhase * 3.1) * jitter * 0.6;
      const y = h / 2 + harmonic + noise;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  private injectStyles(): void {
    if (document.getElementById('ember-relay-styles')) return;
    const style = document.createElement('style');
    style.id = 'ember-relay-styles';
    style.textContent = `
      .ember-root {
        container-type: inline-size;
        container-name: emberrelay;
        background: radial-gradient(circle at 50% 0%, #17202a 0%, #090c10 75%);
        color: #e2e8f0;
        font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        min-height: 100dvh;
        padding: clamp(0.75rem, 2vw, 1.5rem);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .ember-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid rgba(245, 158, 11, 0.3);
        padding-bottom: 0.75rem;
      }
      .ember-title {
        font-size: clamp(1.15rem, 1rem + 1.2vw, 1.65rem);
        font-weight: 700;
        color: #f59e0b;
        margin: 0;
        letter-spacing: 0.04em;
      }
      .ember-subtitle {
        font-size: 0.82rem;
        color: #94a3b8;
        margin: 0.2rem 0 0 0;
      }
      .ember-badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      .ember-badge {
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fcd34d;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .ember-resources {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.75rem;
      }
      .ember-res-card {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-left: 3px solid #f59e0b;
        border-radius: 6px;
        padding: 0.65rem 0.85rem;
      }
      .ember-res-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
      }
      .ember-res-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #f8fafc;
        margin-top: 0.2rem;
      }
      .ember-meter {
        height: 6px;
        background: #1e293b;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 0.4rem;
      }
      .ember-meter-fill {
        height: 100%;
        background: linear-gradient(90deg, #d97706, #fbbf24);
        transition: width 0.2s ease;
      }
      .ember-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      @container emberrelay (min-width: 760px) {
        .ember-grid {
          grid-template-columns: 1.05fr 1fr;
        }
      }
      .ember-panel {
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(245, 158, 11, 0.24);
        border-radius: 8px;
        padding: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .ember-panel-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #fbbf24;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ember-btn {
        background: rgba(245, 158, 11, 0.16);
        border: 1px solid #f59e0b;
        color: #fef3c7;
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s ease, transform 0.08s ease;
      }
      .ember-btn:hover:not(:disabled) {
        background: rgba(245, 158, 11, 0.3);
      }
      .ember-btn:active:not(:disabled) {
        transform: translateY(1px);
      }
      .ember-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
        border-color: #475569;
        color: #94a3b8;
      }
      .ember-btn-primary {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.38), rgba(245, 158, 11, 0.2));
        border-width: 1.5px;
      }
      .ember-card {
        background: rgba(9, 13, 20, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 6px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }
      .ember-log-list {
        max-height: 210px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.78rem;
      }
      .ember-log-item {
        padding: 0.35rem 0.5rem;
        border-left: 2px solid #64748b;
        background: rgba(2, 6, 23, 0.55);
      }
      .ember-log-item.cat-chapter { border-left-color: #f59e0b; color: #fde68a; }
      .ember-log-item.cat-signal { border-left-color: #38bdf8; color: #bae6fd; }
      .ember-log-item.cat-automation { border-left-color: #34d399; color: #a7f3d0; }
      .ember-log-item.cat-warning { border-left-color: #f87171; color: #fecaca; }
      .ember-banner {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.82rem;
        color: #fde68a;
      }
    `;
    document.head.appendChild(style);
  }

  public render(): void {
    const s = this.state;
    const chapterDef = CHAPTERS[s.chapter];
    const availableEvents = getAvailableMessageEvents(s);
    const poweredCount = getPoweredStationCount(s);

    const unlockedResIds = (['watts', 'alloy', 'cipher'] as ResourceId[]).filter(
      (id) => s.unlockedResources[id]
    );

    const resourceCardsHtml = unlockedResIds
      .map((resId) => {
        const def = RESOURCES[resId];
        const val = s.resources[resId];
        const max = s.maxResources[resId];
        const pct = max > 0 ? Math.min(100, Math.round((val / max) * 100)) : 0;
        return `
          <div class="ember-res-card" data-resource="${resId}">
            <div class="ember-res-label">${def.name}</div>
            <div class="ember-res-value">${val} / ${max} <span style="font-size:0.8rem;color:#fbbf24;">${def.unit}</span></div>
            <div class="ember-meter"><div class="ember-meter-fill" style="width:${pct}%"></div></div>
          </div>
        `;
      })
      .join('');

    const dynamoGain = s.repairs.repair_rectifier
      ? GAME_CONFIG.rectifierDynamoWatts
      : GAME_CONFIG.baseDynamoWatts;

    const salvageYield = s.repairs.repair_winch
      ? GAME_CONFIG.winchSalvageAlloy
      : GAME_CONFIG.baseSalvageAlloy;

    // Initial Repairs Section (Visible once receiver is warmed)
    const repairsHtml = s.capabilities.receiverWarmed
      ? `
      <div class="ember-panel" id="ember-repairs-panel">
        <h2 class="ember-panel-title">
          <span>Station Structural Repairs</span>
          <span style="font-size:0.74rem;color:#94a3b8;">${getCompletedRepairCount(s)}/2 Restored</span>
        </h2>
        ${
          !s.capabilities.oscilloscopeUnlocked
            ? `<div style="font-size:0.78rem;color:#fcd34d;">Complete either initial repair to bring the Frequency Oscilloscope & Harmonic Decoder online.</div>`
            : ''
        }
        ${(['repair_rectifier', 'repair_winch'] as InitialRepairId[])
          .map((repId) => {
            const rep = INITIAL_REPAIRS[repId];
            const done = s.repairs[repId];
            const affordable = canAfford(s, rep.cost);
            return `
              <div class="ember-card" data-repair="${repId}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="color:#f8fafc;font-size:0.85rem;">${rep.name}</strong>
                  <span class="ember-badge">${done ? 'ONLINE' : formatCost(rep.cost)}</span>
                </div>
                <div style="font-size:0.77rem;color:#cbd5e1;">${rep.summary}</div>
                ${
                  !done
                    ? `<button class="ember-btn" data-action="repair" data-repair-id="${repId}" ${!affordable ? 'disabled' : ''}>
                        Execute Repair (${formatCost(rep.cost)})
                      </button>`
                    : ''
                }
              </div>
            `;
          })
          .join('')}
      </div>
    `
      : '';

    // Oscilloscope & Signal Feed Panel
    const oscilloscopeHtml = s.capabilities.oscilloscopeUnlocked
      ? `
      <div class="ember-card">
        <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:#fcd34d;">
          <span>CARRIER HARMONIC OSCILLOSCOPE</span>
          <span>SIGNAL LOCK: ${s.signalLock}% | PHASE: ${s.harmonicPhase}°</span>
        </div>
        <canvas id="ember-oscilloscope-canvas" width="420" height="84" style="width:100%;height:84px;border-radius:4px;border:1px solid rgba(245,158,11,0.3);"></canvas>
      </div>
    `
      : '';

    // Incoming Signals Section (Visible once receiver is warmed)
    const signalsHtml = s.capabilities.receiverWarmed
      ? `
      <div class="ember-panel" id="ember-signals-panel">
        <h2 class="ember-panel-title">
          <span>Incoming Distress & Relay Signals</span>
          <span style="font-size:0.74rem;color:#38bdf8;">${s.completedEvents.length}/${MESSAGE_EVENTS.length} Resolved</span>
        </h2>
        ${oscilloscopeHtml}
        ${
          availableEvents.length === 0
            ? `<div class="ember-card" style="color:#94a3b8;font-size:0.8rem;">
                ${
                  s.completedEvents.length >= MESSAGE_EVENTS.length
                    ? 'All 12 Solstice transmissions have been resolved. Proceed to Final Convergence.'
                    : 'No active transmissions awaiting decode in this stage. Complete station repairs or advance chapter prerequisites.'
                }
              </div>`
            : availableEvents
                .map((evt) => {
                  const isDecoded = s.decodedEvents.includes(evt.id);
                  const canPayDecode = canAfford(s, evt.decodeCost);
                  return `
                    <div class="ember-card" data-event-id="${evt.id}">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                        <strong style="color:#38bdf8;font-size:0.86rem;">[${evt.frequencyMHz}] ${evt.title}</strong>
                        <span class="ember-badge">${evt.sender}</span>
                      </div>
                      <div style="font-size:0.73rem;color:#f59e0b;letter-spacing:0.08em;">MORSE: ${evt.morsePreview}</div>
                      <div style="font-size:0.8rem;color:#e2e8f0;line-height:1.4;">
                        ${isDecoded ? evt.decodedBody : evt.corruptedBody}
                      </div>
                      ${
                        !isDecoded
                          ? `<button class="ember-btn ember-btn-primary" data-action="decode-event" data-event-id="${evt.id}" ${!canPayDecode ? 'disabled' : ''}>
                              Decode Carrier Signal (${formatCost(evt.decodeCost)})
                            </button>`
                          : `<div style="display:flex;flex-direction:column;gap:0.45rem;margin-top:0.25rem;">
                              ${evt.choices
                                .map((ch) => {
                                  const canPayChoice = canAfford(s, ch.costs);
                                  return `
                                    <button class="ember-btn" data-action="resolve-event" data-event-id="${evt.id}" data-choice-id="${ch.id}" ${!canPayChoice ? 'disabled' : ''}>
                                      <div><strong>${ch.label}</strong></div>
                                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">${ch.description}</div>
                                    </button>
                                  `;
                                })
                                .join('')}
                            </div>`
                      }
                    </div>
                  `;
                })
                .join('')
        }
      </div>
    `
      : '';

    // Archipelago Radar & 4 Remote Stations (Unlocked in Chapter 2)
    const radarHtml = s.capabilities.radarUnlocked
      ? `
      <div class="ember-panel" id="ember-radar-panel">
        <h2 class="ember-panel-title">
          <span>Archipelago Radar & Remote Stations</span>
          <span style="font-size:0.74rem;color:#34d399;">${poweredCount}/4 Beacons Powered</span>
        </h2>
        <svg viewBox="0 0 240 110" style="width:100%;max-height:130px;background:#06101a;border:1px solid rgba(56,189,248,0.28);border-radius:6px;" aria-label="Archipelago Radar Map">
          <circle cx="120" cy="55" r="46" fill="none" stroke="rgba(56,189,248,0.16)" stroke-dasharray="3 3"/>
          <circle cx="120" cy="55" r="24" fill="none" stroke="rgba(56,189,248,0.22)"/>
          <circle cx="120" cy="55" r="4" fill="#f59e0b"/>
          <text x="126" y="58" fill="#fde68a" font-size="6.5">EMBER POINT</text>
          ${(Object.keys(REMOTE_STATIONS) as StationId[])
            .map((stId) => {
              const def = REMOTE_STATIONS[stId];
              const st = s.stations[stId];
              const cx = Math.round((def.coordinates.x / 100) * 220 + 10);
              const cy = Math.round((def.coordinates.y / 100) * 90 + 10);
              const color = st.powered
                ? '#34d399'
                : st.activated
                ? '#f59e0b'
                : '#64748b';
              return `
                <line x1="120" y1="55" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="${st.powered ? '1.5' : '0.7'}" stroke-dasharray="${st.powered ? 'none' : '2 2'}"/>
                <circle cx="${cx}" cy="${cy}" r="${st.powered ? 4.5 : 3}" fill="${color}"/>
                <text x="${cx + 6}" y="${cy + 2}" fill="${color}" font-size="6">${def.name.split(' ')[0]}</text>
              `;
            })
            .join('')}
        </svg>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0.6rem;">
          ${(Object.keys(REMOTE_STATIONS) as StationId[])
            .map((stId) => {
              const def = REMOTE_STATIONS[stId];
              const st = s.stations[stId];
              const canActivate = canAfford(s, def.activationCost);
              return `
                <div class="ember-card" data-station-id="${stId}">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:0.82rem;color:#f8fafc;">${def.name}</strong>
                    <span class="ember-badge" style="color:${st.powered ? '#34d399' : '#94a3b8'};">
                      ${st.powered ? 'POWERED' : st.activated ? 'STANDBY' : 'OFFLINE'}
                    </span>
                  </div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${def.sector}</div>
                  <div style="font-size:0.75rem;color:#cbd5e1;">${def.tradeoffNote}</div>
                  ${
                    !st.activated
                      ? `<button class="ember-btn" data-action="toggle-station" data-station-id="${stId}" ${!canActivate ? 'disabled' : ''}>
                          Activate Beacon (${formatCost(def.activationCost)})
                        </button>`
                      : `<button class="ember-btn" data-action="toggle-station" data-station-id="${stId}">
                          ${st.powered ? 'Throttle Beacon Offline (Save Upkeep)' : 'Power Beacon On'}
                        </button>`
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `
      : '';

    // Safe Automation Rule Rack (Unlocked in Chapter 2)
    const automationHtml = s.capabilities.automationUnlocked
      ? `
      <div class="ember-panel" id="ember-automation-panel">
        <h2 class="ember-panel-title">
          <span>Safe Automation Rule Rack</span>
          <span style="font-size:0.74rem;color:#34d399;">Declarative Circuit Relays</span>
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;">
          ${(Object.keys(AUTOMATION_RULES) as AutomationRuleId[])
            .map((ruleId) => {
              const def = AUTOMATION_RULES[ruleId];
              const rState = s.automationRules[ruleId];
              const canUnlock = canAfford(s, def.unlockCost);
              return `
                <div class="ember-card" data-rule-id="${ruleId}">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:0.83rem;color:#fde68a;">${def.name}</strong>
                    <span class="ember-badge">${
                      !rState.unlocked
                        ? 'UNFABRICATED'
                        : rState.enabled
                        ? 'ARMED'
                        : 'DISABLED'
                    }</span>
                  </div>
                  <div style="font-size:0.73rem;color:#38bdf8;">${def.conditionSummary}</div>
                  <div style="font-size:0.73rem;color:#cbd5e1;">${def.inputSummary} &rarr; ${def.outputSummary}</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Status: ${rState.lastStatus}</div>
                  ${
                    !rState.unlocked
                      ? `<button class="ember-btn" data-action="unlock-rule" data-rule-id="${ruleId}" ${!canUnlock ? 'disabled' : ''}>
                          Fabricate Rule (${formatCost(def.unlockCost)})
                        </button>`
                      : `<button class="ember-btn" data-action="toggle-rule" data-rule-id="${ruleId}">
                          ${rState.enabled ? 'Disable Automation Rule' : 'Enable Automation Rule'}
                        </button>`
                  }
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `
      : '';

    // Chapter 3 Final Convergence Panel
    const endingACheck = canTriggerEnding(s, 'ending_a_archival_beacon');
    const endingBCheck = canTriggerEnding(s, 'ending_b_exodus_convoy');

    const convergenceHtml =
      s.capabilities.convergenceUnlocked || s.chapter === 3 || s.endingReached
        ? `
      <div class="ember-panel" id="ember-convergence-panel" style="border-color:#38bdf8;">
        <h2 class="ember-panel-title" style="color:#38bdf8;">
          <span>Chapter 3: Solstice Convergence Protocols</span>
          <span style="font-size:0.74rem;">Network: ${s.networkIntegrity} | Convoy: ${s.convoyReadiness}</span>
        </h2>
        ${
          s.endingReached
            ? `<div class="ember-card" style="border-color:#fbbf24;background:rgba(245,158,11,0.12);">
                <h3 style="margin:0;color:#fbbf24;font-size:1.05rem;">${ENDINGS[s.endingReached].title}</h3>
                <div style="font-size:0.84rem;color:#fde68a;">${ENDINGS[s.endingReached].subtitle}</div>
                <p style="font-size:0.82rem;color:#f8fafc;line-height:1.5;margin:0.4rem 0 0 0;">${ENDINGS[s.endingReached].epilogue}</p>
              </div>`
            : `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0.75rem;">
                <div class="ember-card" data-ending-id="ending_a_archival_beacon">
                  <strong style="color:#34d399;font-size:0.86rem;">${ENDINGS.ending_a_archival_beacon.title}</strong>
                  <div style="font-size:0.76rem;color:#cbd5e1;">${ENDINGS.ending_a_archival_beacon.summary}</div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${ENDINGS.ending_a_archival_beacon.requirementDescription}</div>
                  <div style="font-size:0.73rem;color:#fcd34d;">Status: ${endingACheck.reason}</div>
                  <button class="ember-btn ember-btn-primary" data-action="trigger-ending" data-ending-id="ending_a_archival_beacon" ${!endingACheck.ok ? 'disabled' : ''}>
                    Lock Archival Beacon (25W + 4 Cipher)
                  </button>
                </div>
                <div class="ember-card" data-ending-id="ending_b_exodus_convoy">
                  <strong style="color:#38bdf8;font-size:0.86rem;">${ENDINGS.ending_b_exodus_convoy.title}</strong>
                  <div style="font-size:0.76rem;color:#cbd5e1;">${ENDINGS.ending_b_exodus_convoy.summary}</div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${ENDINGS.ending_b_exodus_convoy.requirementDescription}</div>
                  <div style="font-size:0.73rem;color:#fcd34d;">Status: ${endingBCheck.reason}</div>
                  <button class="ember-btn ember-btn-primary" data-action="trigger-ending" data-ending-id="ending_b_exodus_convoy" ${!endingBCheck.ok ? 'disabled' : ''}>
                    Fire Exodus Convoy Beam (25W + 12 Alloy + 3 Cipher)
                  </button>
                </div>
              </div>`
        }
      </div>
    `
        : '';

    const debugHtml = this.debugOpen
      ? `
      <div class="ember-panel" id="ember-debug-panel" style="border-color:#f43f5e;">
        <h2 class="ember-panel-title" style="color:#fb7185;">
          <span>Debug & Playtest Inspector [D]</span>
          <span>Seed: ${s.seed} | Brownouts: ${s.brownoutCount}</span>
        </h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          <button class="ember-btn" data-action="debug-grant">+25 All Resources</button>
          <button class="ember-btn" data-action="debug-ch2">Unlock Chapter 2</button>
          <button class="ember-btn" data-action="debug-ch3">Unlock Chapter 3</button>
          <button class="ember-btn" data-action="debug-reset">Reset Clean Save</button>
        </div>
        <div style="font-size:0.74rem;color:#cbd5e1;">
          Completed Events (${s.completedEvents.length}): ${s.completedEvents.join(', ') || 'None'}
        </div>
      </div>
    `
      : '';

    this.container.innerHTML = `
      <div class="ember-root">
        <header class="ember-header">
          <div>
            <h1 class="ember-title">THE LAST SIGNAL: EMBER RELAY</h1>
            <p class="ember-subtitle">${chapterDef.title} — ${chapterDef.subtitle}</p>
          </div>
          <div class="ember-badge-row">
            <span class="ember-badge">CYCLE ${s.cycle}</span>
            <span class="ember-badge">CHAPTER ${s.chapter} / 3</span>
            ${
              s.capabilities.radarUnlocked
                ? `<span class="ember-badge">GRID: ${s.networkIntegrity} | FLEET: ${s.convoyReadiness}</span>`
                : ''
            }
            <button class="ember-btn" style="padding:0.25rem 0.55rem;font-size:0.73rem;" data-action="toggle-mute">
              ${this.audio.isMuted() ? 'Audio: Muted' : 'Audio: On'}
            </button>
            <button class="ember-btn" style="padding:0.25rem 0.55rem;font-size:0.73rem;" data-action="toggle-debug">
              Debug [D]
            </button>
          </div>
        </header>

        ${
          this.statusBannerText
            ? `<div class="ember-banner" role="status" aria-live="polite">${this.statusBannerText}</div>`
            : ''
        }

        <section class="ember-resources" aria-label="Station Resource Telemetry">
          ${resourceCardsHtml}
        </section>

        <div class="ember-grid">
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <section class="ember-panel" id="ember-controls-panel">
              <h2 class="ember-panel-title">
                <span>Ember Point Manual Operations</span>
                <span style="font-size:0.73rem;color:#94a3b8;">Zero-Idle Active Controls</span>
              </h2>
              <button class="ember-btn ember-btn-primary" id="btn-crank-dynamo" data-action="crank-dynamo" ${s.endingReached ? 'disabled' : ''}>
                <div><strong>Strike Match / Crank Dynamo (+${dynamoGain} Watts)</strong></div>
                <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                  ${
                    !s.capabilities.receiverWarmed
                      ? `Turn the frozen hand-dynamo to reach ${GAME_CONFIG.receiverWarmupWatts}W and ignite the vacuum receiver lamp.`
                      : 'Manually charge the station capacitor bank. Shortcut: [C]'
                  }
                </div>
              </button>

              ${
                s.unlockedResources.alloy
                  ? `<button class="ember-btn" id="btn-gather-salvage" data-action="gather-salvage" ${s.endingReached ? 'disabled' : ''}>
                      <div><strong>Haul Cliffside Salvage Winch (+${salvageYield} Alloy)</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        Uses ${GAME_CONFIG.salvageWinchWattCost}W winch motor (or manual haul if <2W) to recover hull brass. Shortcut: [S]
                      </div>
                    </button>`
                  : ''
              }

              ${
                s.capabilities.oscilloscopeUnlocked
                  ? `<button class="ember-btn" id="btn-align-frequency" data-action="align-frequency" ${s.endingReached ? 'disabled' : ''}>
                      <div><strong>Align Frequency Harmonic (+${GAME_CONFIG.tuneSignalLockGain}% Lock${s.unlockedResources.cipher ? ' / +1 Cipher Key' : ''})</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        ${
                          s.unlockedResources.cipher
                            ? `Phase-locks carrier wave and synthesizes +1 Cipher Key (-${GAME_CONFIG.tuneCipherWattCost}W). Shortcut: [T]`
                            : 'Stabilizes oscilloscope waveform lock. Shortcut: [T]'
                        }
                      </div>
                    </button>`
                  : ''
              }

              ${
                s.capabilities.receiverWarmed
                  ? `<button class="ember-btn" id="btn-step-cycle" data-action="step-cycle" ${s.endingReached ? 'disabled' : ''}>
                      <div><strong>Advance Relay Cycle (Run Beacons & Automation)</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        Executes armed automation rules, station beacon yields, and generator trickle. Shortcut: [N]
                      </div>
                    </button>`
                  : ''
              }
            </section>

            ${repairsHtml}
            ${automationHtml}
          </div>

          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${convergenceHtml}
            ${signalsHtml}
            ${radarHtml}

            <section class="ember-panel" id="ember-log-panel">
              <h2 class="ember-panel-title">
                <span>Relay Watch Log</span>
                <span style="font-size:0.72rem;color:#94a3b8;">Persistent Event Audit</span>
              </h2>
              <div class="ember-log-list">
                ${s.logs
                  .slice(0, 14)
                  .map(
                    (entry) => `
                  <div class="ember-log-item cat-${entry.category}">
                    <span style="color:#64748b;">[C${entry.cycle}]</span> ${entry.text}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </section>
          </div>
        </div>

        ${debugHtml}
      </div>
    `;

    this.bindEvents();
    this.drawOscilloscope();
  }

  private bindEvents(): void {
    this.container
      .querySelectorAll<HTMLButtonElement>('button[data-action]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (!action) return;

          if (action === 'crank-dynamo') {
            this.handleAction(() => crankDynamo(this.state), 'crank');
          } else if (action === 'gather-salvage') {
            this.handleAction(() => gatherSalvage(this.state), 'relay');
          } else if (action === 'align-frequency') {
            this.handleAction(() => alignFrequency(this.state), 'morse');
          } else if (action === 'step-cycle') {
            this.handleAction(() => stepCycle(this.state), 'relay');
          } else if (action === 'repair') {
            const repairId = btn.dataset.repairId as InitialRepairId;
            this.handleAction(
              () => performInitialRepair(this.state, repairId),
              'chord'
            );
          } else if (action === 'decode-event') {
            const eventId = btn.dataset.eventId ?? '';
            this.handleAction(
              () => decodeMessageEvent(this.state, eventId),
              'morse'
            );
          } else if (action === 'resolve-event') {
            const eventId = btn.dataset.eventId ?? '';
            const choiceId = btn.dataset.choiceId ?? '';
            this.handleAction(
              () => resolveMessageEventChoice(this.state, eventId, choiceId),
              'morse'
            );
          } else if (action === 'toggle-station') {
            const stationId = btn.dataset.stationId as StationId;
            this.handleAction(
              () => toggleRemoteStation(this.state, stationId),
              'relay'
            );
          } else if (action === 'unlock-rule') {
            const ruleId = btn.dataset.ruleId as AutomationRuleId;
            this.handleAction(
              () => unlockAutomationRule(this.state, ruleId),
              'relay'
            );
          } else if (action === 'toggle-rule') {
            const ruleId = btn.dataset.ruleId as AutomationRuleId;
            this.handleAction(
              () => toggleAutomationRule(this.state, ruleId),
              'relay'
            );
          } else if (action === 'trigger-ending') {
            const endingId = btn.dataset.endingId as EndingId;
            this.handleAction(
              () => triggerEnding(this.state, endingId),
              'chord'
            );
          } else if (action === 'toggle-mute') {
            this.audio.setMuted(!this.audio.isMuted());
            this.render();
          } else if (action === 'toggle-debug') {
            this.toggleDebug();
          } else if (action === 'debug-grant') {
            this.state.capabilities.receiverWarmed = true;
            this.state.unlockedResources.alloy = true;
            this.state.unlockedResources.cipher = true;
            addResources(this.state, { watts: 25, alloy: 25, cipher: 10 });
            saveToLocalStorage(this.state);
            this.render();
          } else if (action === 'debug-ch2') {
            this.state.capabilities.receiverWarmed = true;
            this.state.capabilities.oscilloscopeUnlocked = true;
            this.state.repairs.repair_rectifier = true;
            this.state.completedEvents.push(
              'sig_01_reef_sos',
              'sig_02_dredge_beacon',
              'sig_03_harbor_charter'
            );
            evaluateChapterProgression(this.state);
            saveToLocalStorage(this.state);
            this.render();
          } else if (action === 'debug-ch3') {
            this.state.chapter = 2;
            this.state.capabilities.receiverWarmed = true;
            this.state.capabilities.oscilloscopeUnlocked = true;
            this.state.capabilities.radarUnlocked = true;
            this.state.capabilities.automationUnlocked = true;
            this.state.unlockedResources.alloy = true;
            this.state.unlockedResources.cipher = true;
            this.state.completedEvents.push('sig_08_mainland_silence');
            evaluateChapterProgression(this.state);
            saveToLocalStorage(this.state);
            this.render();
          } else if (action === 'debug-reset') {
            this.restartWithSeed(this.state.seed);
          }
        });
      });
  }
}

export { serializeState, deserializeState };
