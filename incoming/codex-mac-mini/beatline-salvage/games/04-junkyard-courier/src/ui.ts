import { CourierAudioEngine } from './audio.ts';
import { GAME_CONFIG, LOADOUT_PRESETS, LoadoutPresetId } from './config.ts';
import {
  ARCHIPELAGO_NODES,
  BOAT_MODULES,
  getModuleById,
  getNodeById,
  HAZARDS,
  HazardChoicePreview,
  ModuleId,
} from './content.ts';
import {
  deserializeRunState,
  loadRunFromStorage,
  saveRunToStorage,
  serializeRunState,
} from './persistence.ts';
import {
  abandonContract,
  acceptContract,
  applyLoadoutPreset,
  beginTravelToNode,
  buyFuelDrum,
  buyRepairKit,
  crackFuelDrumIntoTank,
  createInitialRunState,
  deliverContract,
  findOptimalRouteForLoadout,
  getConnectedEdges,
  getNeighborNodeId,
  installModule,
  previewHazardOutcome,
  refuelAtPort,
  repairHullAtPort,
  resolvePendingEncounter,
  RunState,
  selectDeliveryUpgradeModule,
  sellFuelDrum,
  sellRepairKit,
  uninstallModule,
  useRepairKitOnHull,
  validateStateHoldCapacity,
} from './simulation.ts';

const STYLES = `
.jc-root {
  container: courier-shell / inline-size;
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: 100dvh;
  background: radial-gradient(circle at 20% 15%, #16262e 0%, #0b1317 70%);
  color: #e6edf0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-block: 0.75rem 1.5rem;
  padding-inline: clamp(0.5rem, 2cqi, 1.25rem);
}

.jc-root *, .jc-root *::before, .jc-root *::after {
  box-sizing: border-box;
}

.jc-header {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  gap: 0.75rem;
  padding-block: 0.65rem;
  padding-inline: 0.9rem;
  background: #122028;
  border: 1px solid #2b4654;
  border-radius: 8px;
  margin-block-end: 0.85rem;
}

.jc-brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.jc-title {
  margin: 0;
  font-size: clamp(1.05rem, 2.2cqi, 1.35rem);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #f3b34c;
  text-transform: uppercase;
}

.jc-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: #9ab3bf;
}

.jc-telemetry {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-inline-start: auto;
}

.jc-stat-pill {
  display: flex;
  flex-direction: column;
  padding-block: 0.3rem;
  padding-inline: 0.65rem;
  background: #0c161c;
  border: 1px solid #29424f;
  border-radius: 6px;
  min-inline-size: 86px;
}

.jc-stat-label {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #87a4b2;
}

.jc-stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0f6f8;
}

.jc-stat-value.warn {
  color: #e05a47;
}

.jc-stat-value.good {
  color: #56c288;
}

.jc-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  gap: 0.45rem;
  margin-block-end: 0.85rem;
}

.jc-btn {
  appearance: none;
  background: #1a313d;
  color: #e6edf0;
  border: 1px solid #385a6b;
  border-radius: 6px;
  padding-block: 0.42rem;
  padding-inline: 0.72rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s ease, border-color 0.14s ease;
}

.jc-btn:hover:not(:disabled) {
  background: #244354;
  border-color: #5ca1c2;
}

.jc-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.jc-btn-primary {
  background: #c87d20;
  border-color: #f3b34c;
  color: #0b1317;
  font-weight: 700;
}

.jc-btn-primary:hover:not(:disabled) {
  background: #e0922b;
  border-color: #ffd07b;
}

.jc-btn-success {
  background: #216e47;
  border-color: #46b87c;
  color: #eefaf3;
}

.jc-btn-danger {
  background: #5c2222;
  border-color: #b54545;
  color: #ffdede;
}

.jc-toast {
  padding-block: 0.5rem;
  padding-inline: 0.8rem;
  border-radius: 6px;
  margin-block-end: 0.8rem;
  font-size: 0.84rem;
  font-weight: 600;
  background: #19313d;
  border-inline-start: 4px solid #f3b34c;
}

.jc-toast.error {
  background: #3a1a1d;
  border-inline-start-color: #e05a47;
  color: #ffb8ae;
}

.jc-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

@container courier-shell (inline-size > 880px) {
  .jc-main-grid {
    grid-template-columns: 1.25fr 1fr;
    align-items: start;
  }
}

.jc-panel {
  background: #111e25;
  border: 1px solid #26404d;
  border-radius: 8px;
  padding: 0.85rem;
}

.jc-panel-title {
  margin: 0 0 0.6rem 0;
  font-size: 0.92rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #f3b34c;
  display: flex;
  align-items: safe center;
  justify-content: space-between;
  gap: 0.5rem;
}

.jc-map-canvas {
  display: block;
  inline-size: 100%;
  block-size: auto;
  aspect-ratio: 5 / 3;
  background: #091319;
  border: 1px solid #2c4c5c;
  border-radius: 6px;
  cursor: pointer;
}

.jc-leg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.55rem;
  margin-block-start: 0.75rem;
}

.jc-leg-card {
  background: #0c171d;
  border: 1px solid #294452;
  border-radius: 6px;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.jc-badge {
  display: inline-block;
  padding-block: 0.12rem;
  padding-inline: 0.45rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.jc-hold-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  margin-block: 0.55rem 0.75rem;
}

@container courier-shell (inline-size < 460px) {
  .jc-hold-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.jc-slot-cell {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px dashed #355566;
  background: #0a141a;
  min-block-size: 58px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.jc-slot-cell.cargo {
  border-style: solid;
  border-color: #f3b34c;
  background: rgba(243, 179, 76, 0.14);
}

.jc-slot-cell.module {
  border-style: solid;
  border-color: #5bc0de;
  background: rgba(91, 192, 222, 0.14);
}

.jc-slot-cell.fuel {
  border-style: solid;
  border-color: #e67e22;
  background: rgba(230, 126, 34, 0.14);
}

.jc-slot-cell.repair {
  border-style: solid;
  border-color: #56c288;
  background: rgba(86, 194, 136, 0.14);
}

.jc-slot-index {
  font-size: 0.64rem;
  color: #7e9aa8;
  font-weight: 700;
}

.jc-slot-name {
  font-size: 0.74rem;
  font-weight: 700;
  color: #eef5f8;
}

.jc-contract-list, .jc-module-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.jc-card {
  background: #0c161c;
  border: 1px solid #27414e;
  border-radius: 6px;
  padding: 0.65rem;
}

.jc-card.active-contract {
  border-color: #f3b34c;
  background: #172428;
}

.jc-card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-block-end: 0.35rem;
}

.jc-log-list {
  max-block-size: 165px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  font-size: 0.76rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-inline-end: 0.25rem;
}

/* Native modal dialog rules per modern-web-guidance */
dialog.jc-encounter-dialog {
  background: #101e26;
  color: #e6edf0;
  border: 2px solid #f3b34c;
  border-radius: 10px;
  padding: 1.15rem;
  max-inline-size: min(540px, 94dvw);
  inline-size: 100%;
}

dialog.jc-encounter-dialog[open] {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

dialog.jc-encounter-dialog:modal {
  overscroll-behavior: contain;
}

dialog.jc-encounter-dialog::backdrop {
  background: rgba(4, 10, 14, 0.78);
  overflow: hidden;
  overscroll-behavior: contain;
}

.jc-outcome-banner {
  padding: 0.9rem;
  border-radius: 8px;
  margin-block-end: 0.85rem;
  border: 2px solid #f3b34c;
  background: #172830;
}

.jc-outcome-banner.loss {
  border-color: #e05a47;
  background: #2d1417;
}

.jc-outcome-banner.victory {
  border-color: #56c288;
  background: #122e22;
}
`;

export class JunkyardCourierUI {
  private container: HTMLElement;
  private state: RunState;
  private audio: CourierAudioEngine;
  private debugOpen: boolean;
  private statusNotice: { text: string; isError: boolean } | null = null;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(
    container: HTMLElement,
    initialState: RunState,
    options?: { debug?: boolean },
  ) {
    this.container = container;
    this.state = initialState;
    this.audio = new CourierAudioEngine();
    this.debugOpen = Boolean(options?.debug);

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if (
          document.activeElement &&
          ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
        ) {
          return;
        }
        this.toggleDebug();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
    this.render();
  }

  public getState(): RunState {
    return this.state;
  }

  public setState(nextState: RunState): void {
    this.state = nextState;
    this.render();
  }

  public restartWithSeed(seed: number): void {
    this.state = createInitialRunState(seed);
    this.statusNotice = {
      text: `Started fresh archipelago run with Seed #${seed}.`,
      isError: false,
    };
    this.audio.playFoghorn();
    this.render();
  }

  public toggleDebug(force?: boolean): void {
    this.debugOpen = typeof force === 'boolean' ? force : !this.debugOpen;
    this.render();
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
    this.audio.destroy();
    this.container.innerHTML = '';
  }

  private setNotice(text: string, isError = false): void {
    this.statusNotice = { text, isError };
  }

  private buildHoldSlotsVisualArray(): {
    slotNumber: number;
    category: 'cargo' | 'module' | 'fuel' | 'repair' | 'empty';
    title: string;
    subtitle: string;
  }[] {
    const slots: {
      slotNumber: number;
      category: 'cargo' | 'module' | 'fuel' | 'repair' | 'empty';
      title: string;
      subtitle: string;
    }[] = [];

    for (const c of this.state.contracts.filter((ct) => ct.status === 'ACCEPTED')) {
      for (let i = 0; i < c.cargoSlots; i++) {
        slots.push({
          slotNumber: slots.length + 1,
          category: 'cargo',
          title: c.cargoName,
          subtitle: `Cargo (${i + 1}/${c.cargoSlots}) -> ${getNodeById(c.destinationNodeId).code}`,
        });
      }
    }

    for (const modId of this.state.installedModules) {
      const mod = getModuleById(modId);
      for (let i = 0; i < mod.slotCost; i++) {
        slots.push({
          slotNumber: slots.length + 1,
          category: 'module',
          title: mod.shortTag,
          subtitle: mod.name,
        });
      }
    }

    for (let i = 0; i < this.state.fuelDrums; i++) {
      slots.push({
        slotNumber: slots.length + 1,
        category: 'fuel',
        title: 'FUEL DRUM',
        subtitle: `+${GAME_CONFIG.fuelPerDrum} Reserve Fuel`,
      });
    }

    for (let i = 0; i < this.state.repairKits; i++) {
      const restoreAmt = this.state.installedModules.includes('mod-bilge-rig')
        ? GAME_CONFIG.bilgeRigRepairAmount
        : GAME_CONFIG.baseRepairAmount;
      slots.push({
        slotNumber: slots.length + 1,
        category: 'repair',
        title: 'REPAIR KIT',
        subtitle: `+${restoreAmt} Hull Patch`,
      });
    }

    while (slots.length < this.state.maxHoldSlots) {
      slots.push({
        slotNumber: slots.length + 1,
        category: 'empty',
        title: 'OPEN SLOT',
        subtitle: 'Available Hold Space',
      });
    }

    return slots;
  }

  public render(): void {
    const st = this.state;
    const holdValidation = validateStateHoldCapacity(st);
    const currentNode = getNodeById(st.currentNodeId);
    const activeContracts = st.contracts.filter((c) => c.status === 'ACCEPTED');
    const portOffers = st.contracts.filter(
      (c) => c.status === 'OFFERED' && c.originNodeId === st.currentNodeId,
    );
    const connectedEdges = getConnectedEdges(st, st.currentNodeId);
    const holdCells = this.buildHoldSlotsVisualArray();

    let routePreviewHtml = '';
    const previewTargetId =
      st.selectedNodeId && st.selectedNodeId !== st.currentNodeId
        ? st.selectedNodeId
        : activeContracts[0]?.destinationNodeId;
    let highlightedPathNodes: string[] = [];

    if (previewTargetId && previewTargetId !== st.currentNodeId) {
      try {
        const bestRoute = findOptimalRouteForLoadout(st, st.currentNodeId, previewTargetId, 5);
        highlightedPathNodes = bestRoute.pathNodeIds;
        const targetNode = getNodeById(previewTargetId);
        routePreviewHtml = `
          <div style="margin-block-start:0.55rem;padding:0.5rem 0.65rem;background:#0c1820;border:1px solid #2b4a59;border-radius:6px;font-size:0.78rem;">
            <strong>Best Route Preview to ${targetNode.name} (${targetNode.code}):</strong>
            <span>${bestRoute.pathNodeIds.map((id) => getNodeById(id).code).join(' → ')}</span>
            <span style="margin-inline-start:0.6rem;color:#f3b34c;">Est. Fuel: ${bestRoute.totalExpectedFuel}F</span>
            <span style="margin-inline-start:0.6rem;color:#e05a47;">Est. Hull Risk: -${bestRoute.expectedHullDamage}</span>
          </div>
        `;
      } catch {
        // ignore if unreachable
      }
    }

    this.container.innerHTML = `
      <style>${STYLES}</style>
      <div class="jc-root">
        <header class="jc-header">
          <div class="jc-brand">
            <h1 class="jc-title">Junkyard Courier · The Rustwater Shallows</h1>
            <p class="jc-subtitle">Vessel: The Iron Skiff · Moored at <strong>${currentNode.name} (${currentNode.code})</strong> · Turn ${st.turn} · Seed #${st.seed}</p>
          </div>
          <div class="jc-telemetry" role="region" aria-label="Boat Telemetry">
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Hull Plating</span>
              <span class="jc-stat-value ${st.hull <= 12 ? 'warn' : 'good'}" data-testid="stat-hull">${st.hull}/${st.maxHull}</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Internal Fuel</span>
              <span class="jc-stat-value ${st.fuel <= 2 ? 'warn' : ''}" data-testid="stat-fuel">${st.fuel}/${st.maxFuel} (+${st.fuelDrums} Drum)</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Hold Capacity</span>
              <span class="jc-stat-value ${holdValidation.usedSlots >= st.maxHoldSlots ? 'warn' : ''}" data-testid="stat-hold">${holdValidation.usedSlots}/${st.maxHoldSlots} Slots</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Guild Credits</span>
              <span class="jc-stat-value good" data-testid="stat-credits">${st.credits}¢</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Deliveries</span>
              <span class="jc-stat-value good" data-testid="stat-deliveries">${st.deliveriesCompleted}/${GAME_CONFIG.deliveriesToWin}</span>
            </div>
          </div>
        </header>

        <div class="jc-toolbar">
          <button type="button" class="jc-btn" data-action="preset-hauler" title="${LOADOUT_PRESETS.hauler.preferredStrategy}">
            Preset: Light High-Capacity Hauler
          </button>
          <button type="button" class="jc-btn" data-action="preset-armored" title="${LOADOUT_PRESETS.armored_runner.preferredStrategy}">
            Preset: Armored Storm-Runner
          </button>
          <button type="button" class="jc-btn" data-action="save-run">Save Run</button>
          <button type="button" class="jc-btn" data-action="load-run">Load Saved</button>
          <button type="button" class="jc-btn" data-action="new-run">New Seed Run</button>
          <button type="button" class="jc-btn" data-action="toggle-mute">${this.audio.muted ? 'Unmute Audio' : 'Mute Audio'}</button>
          <button type="button" class="jc-btn" data-action="toggle-debug" style="margin-inline-start:auto;">[D] Debug Inspector</button>
        </div>

        ${
          this.statusNotice
            ? `<div class="jc-toast ${this.statusNotice.isError ? 'error' : ''}" role="status">${this.statusNotice.text}</div>`
            : ''
        }

        ${this.renderOutcomeBanner()}
        ${this.renderPendingUpgradeBanner()}

        <div class="jc-main-grid">
          <!-- LEFT COLUMN: 12-Node Archipelago Map & Outgoing Route Legs -->
          <section class="jc-panel" aria-label="Archipelago Navigation Chart">
            <h2 class="jc-panel-title">
              <span>12-Location Rustwater Archipelago Chart</span>
              <span style="font-size:0.74rem;color:#9ab3bf;font-weight:500;">Click any adjacent node or route card to sail</span>
            </h2>
            <canvas class="jc-map-canvas" width="800" height="480" data-testid="archipelago-canvas"></canvas>
            ${routePreviewHtml}

            <h3 style="margin:0.8rem 0 0.4rem 0;font-size:0.82rem;color:#f3b34c;text-transform:uppercase;">
              Outgoing Route Legs from ${currentNode.name} (${currentNode.code})
            </h3>
            <div class="jc-leg-grid">
              ${connectedEdges
                .map((edge) => {
                  const neighborId = getNeighborNodeId(edge, st.currentNodeId);
                  const neighbor = getNodeById(neighborId);
                  const haz = HAZARDS[edge.hazardId];
                  const counterOwned =
                    haz.counterModuleId && st.installedModules.includes(haz.counterModuleId);
                  const isDest = activeContracts.some((c) => c.destinationNodeId === neighborId);
                  return `
                    <div class="jc-leg-card" style="${isDest ? 'border-color:#f3b34c;' : ''}">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.3rem;">
                        <strong style="font-size:0.84rem;color:#fff;">→ ${neighbor.code}: ${neighbor.name}</strong>
                        <span class="jc-badge" style="background:${haz.badgeColor};color:#081014;">${haz.shortCode}</span>
                      </div>
                      <div style="font-size:0.74rem;color:#b4c7d0;">
                        Base Fuel: <strong>${edge.baseFuelCost}F</strong> · Channel: ${edge.channelType.replace('_', ' ')}
                      </div>
                      <div style="font-size:0.72rem;color:#9ab3bf;">
                        ${haz.name}: ${haz.consequenceSummary}
                      </div>
                      <div style="font-size:0.71rem;color:${counterOwned ? '#56c288' : '#f3b34c'};">
                        ${
                          counterOwned
                            ? `✓ Counter Equipped (${getModuleById(haz.counterModuleId!).shortTag})`
                            : haz.counterModuleId
                              ? `Counter Module: ${getModuleById(haz.counterModuleId).name}`
                              : 'Standard seamanship leg'
                        }
                      </div>
                      <button
                        type="button"
                        class="jc-btn jc-btn-primary"
                        data-action="sail-node"
                        data-node-id="${neighborId}"
                        ${st.runStatus !== 'IN_PROGRESS' ? 'disabled' : ''}
                      >
                        Sail to ${neighbor.code} (${edge.baseFuelCost} Fuel)
                      </button>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>

          <!-- RIGHT COLUMN: 8-Slot Hold Grid, Contract Clipboard & Modules -->
          <div style="display:flex;flex-direction:column;gap:0.9rem;">
            <!-- Hold Slot Allocation Grid -->
            <section class="jc-panel" aria-label="Boat Hold Slot Allocation">
              <h2 class="jc-panel-title">
                <span>Iron Skiff Shared Hold (${holdValidation.usedSlots}/${st.maxHoldSlots} Slots)</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Cargo ${holdValidation.breakdown.cargoSlots} · Mods ${holdValidation.breakdown.moduleSlots} · Drums ${holdValidation.breakdown.fuelDrumSlots} · Kits ${holdValidation.breakdown.repairKitSlots}</span>
              </h2>
              <div class="jc-hold-grid" data-testid="hold-slot-grid">
                ${holdCells
                  .map(
                    (cell) => `
                  <div class="jc-slot-cell ${cell.category}">
                    <span class="jc-slot-index">SLOT 0${cell.slotNumber} · ${cell.category.toUpperCase()}</span>
                    <span class="jc-slot-name">${cell.title}</span>
                    <span style="font-size:0.66rem;color:#9ab3bf;">${cell.subtitle}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                <button type="button" class="jc-btn" data-action="port-refuel" ${st.fuel >= st.maxFuel ? 'disabled' : ''}>
                  Refuel Tank (+1F / ${GAME_CONFIG.portFuelUnitCost}¢)
                </button>
                <button type="button" class="jc-btn" data-action="port-repair" ${st.hull >= st.maxHull ? 'disabled' : ''}>
                  Drydock Patch (+5 Hull / ${GAME_CONFIG.portHullPointCost * 5}¢)
                </button>
                <button type="button" class="jc-btn" data-action="buy-drum">
                  +1 Fuel Drum (${GAME_CONFIG.fuelDrumCost}¢ · 1 Slot)
                </button>
                <button type="button" class="jc-btn" data-action="crack-drum" ${st.fuelDrums <= 0 || st.fuel >= st.maxFuel ? 'disabled' : ''}>
                  Crack Drum (+${GAME_CONFIG.fuelPerDrum}F)
                </button>
                <button type="button" class="jc-btn" data-action="sell-drum" ${st.fuelDrums <= 0 ? 'disabled' : ''}>
                  Unload Drum (+${GAME_CONFIG.fuelDrumResell}¢)
                </button>
                <button type="button" class="jc-btn" data-action="buy-kit">
                  +1 Repair Kit (${GAME_CONFIG.repairKitCost}¢ · 1 Slot)
                </button>
                <button type="button" class="jc-btn" data-action="use-kit" ${st.repairKits <= 0 || st.hull >= st.maxHull ? 'disabled' : ''}>
                  Use Kit (+${st.installedModules.includes('mod-bilge-rig') ? GAME_CONFIG.bilgeRigRepairAmount : GAME_CONFIG.baseRepairAmount} Hull)
                </button>
                <button type="button" class="jc-btn" data-action="sell-kit" ${st.repairKits <= 0 ? 'disabled' : ''}>
                  Unload Kit (+${GAME_CONFIG.repairKitResell}¢)
                </button>
              </div>
            </section>

            <!-- Port Contract Clipboard -->
            <section class="jc-panel" aria-label="Port Salvage Contracts">
              <h2 class="jc-panel-title">
                <span>Salvage Contract Clipboard</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Active: ${activeContracts.length}/${GAME_CONFIG.maxActiveContracts}</span>
              </h2>

              <div class="jc-contract-list">
                ${activeContracts
                  .map((c) => {
                    const dest = getNodeById(c.destinationNodeId);
                    const canDeliver = st.currentNodeId === c.destinationNodeId && !c.paidOut;
                    return `
                      <div class="jc-card active-contract" data-testid="active-contract-${c.id}">
                        <div class="jc-card-header">
                          <strong>[IN HOLD] ${c.cargoName} (${c.cargoSlots} Slot${c.cargoSlots > 1 ? 's' : ''})</strong>
                          <span class="jc-badge" style="background:#f3b34c;color:#0b1317;">Payout ${Math.max(10, c.basePayout - c.accumulatedPenalty)}¢</span>
                        </div>
                        <div style="font-size:0.76rem;color:#d0e0e7;margin-block-end:0.4rem;">
                          Destination: <strong>${dest.name} (${dest.code})</strong> · Hops: ${c.hopsTaken}
                          ${c.fragile ? ' · <span style="color:#ff9f7f;">FRAGILE</span>' : ''}
                          ${c.bulky ? ' · <span style="color:#f3b34c;">BULKY (3 Slots)</span>' : ''}
                        </div>
                        <div style="display:flex;gap:0.45rem;">
                          ${
                            canDeliver
                              ? `<button type="button" class="jc-btn jc-btn-success" data-action="deliver-contract" data-contract-id="${c.id}">Deliver & Claim Payout (${Math.max(10, c.basePayout - c.accumulatedPenalty)}¢)</button>`
                              : `<button type="button" class="jc-btn" data-action="focus-node" data-node-id="${c.destinationNodeId}">Plot Route to ${dest.code}</button>`
                          }
                          <button type="button" class="jc-btn jc-btn-danger" data-action="abandon-contract" data-contract-id="${c.id}">Jettison Cargo</button>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}

                ${portOffers
                  .map((c) => {
                    const dest = getNodeById(c.destinationNodeId);
                    const fitsHold = holdValidation.breakdown.freeSlots >= c.cargoSlots;
                    return `
                      <div class="jc-card" data-testid="offer-contract-${c.id}">
                        <div class="jc-card-header">
                          <strong>${c.cargoName} — ${c.categoryName}</strong>
                          <div>
                            <span class="jc-badge" style="background:#264554;color:#fff;">${c.cargoSlots} Hold Slot${c.cargoSlots > 1 ? 's' : ''}</span>
                            <span class="jc-badge" style="background:#56c288;color:#08120c;">+${c.basePayout}¢</span>
                          </div>
                        </div>
                        <div style="font-size:0.75rem;color:#9ab3bf;margin-block-end:0.35rem;">
                          Deliver to <strong>${dest.name} (${dest.code})</strong>
                          ${c.fragile ? ' · <strong style="color:#ff9f7f;">FRAGILE</strong>' : ''}
                          ${c.urgentMaxHops ? ` · <strong style="color:#7fd4ff;">URGENT (≤${c.urgentMaxHops} hops: +15¢)</strong>` : ''}
                        </div>
                        <p style="margin:0 0 0.45rem 0;font-size:0.73rem;color:#8aa4b0;">${c.description}</p>
                        <div style="display:flex;gap:0.45rem;">
                          <button
                            type="button"
                            class="jc-btn jc-btn-primary"
                            data-action="accept-contract"
                            data-contract-id="${c.id}"
                            ${!fitsHold || activeContracts.length >= GAME_CONFIG.maxActiveContracts ? 'disabled' : ''}
                          >
                            ${fitsHold ? `Accept & Load (${c.cargoSlots} Slot${c.cargoSlots > 1 ? 's' : ''})` : `Needs ${c.cargoSlots} Free Slots (${holdValidation.breakdown.freeSlots} Free)`}
                          </button>
                          <button type="button" class="jc-btn" data-action="focus-node" data-node-id="${c.destinationNodeId}">
                            Inspect Route
                          </button>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            </section>

            <!-- 6 Boat Modules Refit Bay -->
            <section class="jc-panel" aria-label="Boat Module Refit Bay">
              <h2 class="jc-panel-title">
                <span>Boat Modules (${st.installedModules.length}/6 Installed)</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Modules share the 8-Slot Hold</span>
              </h2>
              <div class="jc-module-list">
                ${BOAT_MODULES.map((mod) => {
                  const installed = st.installedModules.includes(mod.id);
                  return `
                    <div class="jc-card" style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;">
                      <div>
                        <div style="font-size:0.81rem;font-weight:700;color:${installed ? '#5bc0de' : '#e6edf0'};">
                          ${mod.name} (${mod.slotCost} Slot${mod.slotCost > 1 ? 's' : ''} · ${mod.creditCost}¢)
                        </div>
                        <div style="font-size:0.72rem;color:#9ab3bf;">${mod.description}</div>
                      </div>
                      ${
                        installed
                          ? `<button type="button" class="jc-btn jc-btn-danger" data-action="uninstall-mod" data-mod-id="${mod.id}">Remove</button>`
                          : `<button type="button" class="jc-btn" data-action="install-mod" data-mod-id="${mod.id}">Install (${mod.creditCost}¢)</button>`
                      }
                    </div>
                  `;
                }).join('')}
              </div>
            </section>

            <!-- Voyage Log -->
            <section class="jc-panel" aria-label="Skipper Logbook">
              <h2 class="jc-panel-title"><span>Skipper's Logbook</span></h2>
              <div class="jc-log-list">
                ${[...st.log]
                  .reverse()
                  .map(
                    (entry) => `
                  <div>
                    <strong style="color:#f3b34c;">[T${entry.turn}]</strong>
                    <span>${entry.message}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </section>
          </div>
        </div>

        ${this.debugOpen ? this.renderDebugPanel() : ''}
        ${this.renderEncounterDialog()}
      </div>
    `;

    this.drawArchipelagoCanvas(highlightedPathNodes);
    this.bindEvents();
    this.syncEncounterModal();
  }

  private renderOutcomeBanner(): string {
    const st = this.state;
    if (st.runStatus === 'VICTORY') {
      return `
        <div class="jc-outcome-banner victory" role="region" aria-label="Run Victory Summary">
          <h2 style="margin:0 0 0.35rem 0;color:#56c288;">★ VOYAGE VICTORY — 3 SALVAGE DELIVERIES COMPLETED!</h2>
          <p style="margin:0 0 0.55rem 0;font-size:0.85rem;">
            The Iron Skiff conquered The Rustwater Shallows with <strong>${st.credits}¢</strong> in guild earnings,
            <strong>${st.hull}/${st.maxHull} Hull</strong>, and <strong>${st.fuel}/${st.maxFuel} Fuel</strong> remaining.
          </p>
          <button type="button" class="jc-btn jc-btn-primary" data-action="new-run">Launch Next Archipelago Run</button>
        </div>
      `;
    }
    if (st.runStatus === 'LOSS' && st.failureDiagnostic) {
      const diag = st.failureDiagnostic;
      return `
        <div class="jc-outcome-banner loss" role="region" aria-label="Failure Diagnostic Report" data-testid="failure-diagnostic">
          <h2 style="margin:0 0 0.35rem 0;color:#ff8978;">✕ VOYAGE LOST — ${diag.title}</h2>
          <p style="margin:0 0 0.35rem 0;font-size:0.84rem;">
            <strong>Diagnostic (${diag.mistakeCategory}):</strong> ${diag.summary}
          </p>
          <p style="margin:0 0 0.6rem 0;font-size:0.8rem;color:#ffd0c8;">
            <strong>Skipper Recommendation:</strong> ${diag.recommendation}
          </p>
          <button type="button" class="jc-btn jc-btn-primary" data-action="new-run">Retry Archipelago Run</button>
        </div>
      `;
    }
    return '';
  }

  private renderPendingUpgradeBanner(): string {
    const st = this.state;
    if (st.pendingUpgradeChoices.length === 0 || st.runStatus !== 'IN_PROGRESS') {
      return '';
    }
    return `
      <div class="jc-outcome-banner" role="region" aria-label="Delivery Module Upgrade Reward">
        <h3 style="margin:0 0 0.35rem 0;color:#f3b34c;">Delivery Complete! Select 1 Guild Module Upgrade (or +20¢ Stipend):</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${st.pendingUpgradeChoices
            .map((modId) => {
              const mod = getModuleById(modId);
              return `
                <button type="button" class="jc-btn jc-btn-primary" data-action="claim-upgrade" data-mod-id="${mod.id}">
                  Install Free: ${mod.name} (${mod.slotCost} Slot${mod.slotCost > 1 ? 's' : ''})
                </button>
              `;
            })
            .join('')}
          <button type="button" class="jc-btn" data-action="claim-upgrade" data-mod-id="skip_for_credits">
            Skip Module (+20¢ Guild Stipend)
          </button>
        </div>
      </div>
    `;
  }

  private renderEncounterDialog(): string {
    const enc = this.state.pendingEncounter;
    if (!enc) {
      return `<dialog class="jc-encounter-dialog" id="jc-hazard-modal" aria-labelledby="jc-hazard-title" closedby="none"></dialog>`;
    }
    const haz = HAZARDS[enc.hazardId];
    const destNode = getNodeById(enc.toNodeId);
    return `
      <dialog class="jc-encounter-dialog" id="jc-hazard-modal" aria-labelledby="jc-hazard-title" closedby="none">
        <div>
          <span class="jc-badge" style="background:${haz.badgeColor};color:#081014;">${haz.severity} HAZARD ENCOUNTER</span>
          <h2 id="jc-hazard-title" style="margin:0.35rem 0 0.25rem 0;color:#f3b34c;">${haz.name} — En Route to ${destNode.name}</h2>
          <p style="margin:0;font-size:0.83rem;color:#c2d5de;">${haz.description}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.55rem;">
          ${haz.choices
            .map((ch, idx) => {
              const prev = previewHazardOutcome(this.state, enc.hazardId, ch.id);
              const disabled = ch.id === 'patch_brace' && this.state.repairKits <= 0;
              return `
                <div class="jc-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-block-end:0.3rem;">
                    <strong>${ch.label}</strong>
                    <span style="font-size:0.74rem;color:#f3b34c;">
                      Extra Fuel: ${prev.extraFuel}F · Hull: -${prev.hullDamage}
                      ${prev.scrapCreditBonus > 0 ? ` · +${prev.scrapCreditBonus}¢ Scrap` : ''}
                    </span>
                  </div>
                  <p style="margin:0 0 0.45rem 0;font-size:0.76rem;color:#9ab3bf;">${prev.summaryNote}</p>
                  <button
                    type="button"
                    class="jc-btn jc-btn-primary"
                    data-action="resolve-encounter"
                    data-choice-id="${ch.id}"
                    ${idx === 0 ? 'autofocus' : ''}
                    ${disabled ? 'disabled' : ''}
                  >
                    ${disabled ? 'Requires 1 Repair Kit in Hold' : `Execute: ${ch.label}`}
                  </button>
                </div>
              `;
            })
            .join('')}
        </div>
      </dialog>
    `;
  }

  private renderDebugPanel(): string {
    const st = this.state;
    const hold = validateStateHoldCapacity(st);
    return `
      <section class="jc-panel" style="margin-block-start:0.9rem;border-color:#5bc0de;" data-testid="debug-inspector">
        <h2 class="jc-panel-title"><span>[D] Debug Telemetry & Route Inspector</span></h2>
        <div style="font-size:0.76rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;">
          <div>
            <strong>Seed / RNG State:</strong> ${st.seed} / ${st.rngState}<br/>
            <strong>Hold Validation:</strong> ${hold.valid ? 'VALID' : 'INVALID'} (${hold.usedSlots}/${hold.maxSlots} Slots)<br/>
            <strong>Delivered IDs (Anti-Double-Pay Ledger):</strong> ${st.deliveredContractIds.join(', ') || 'None'}
          </div>
          <div>
            <strong>Serialize / Import State:</strong>
            <div style="display:flex;gap:0.4rem;margin-block-start:0.3rem;">
              <button type="button" class="jc-btn" data-action="debug-add-credits">+50¢ Credits</button>
              <button type="button" class="jc-btn" data-action="debug-heal">Full Hull & Fuel</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private syncEncounterModal(): void {
    const dialog = this.container.querySelector<HTMLDialogElement>('#jc-hazard-modal');
    if (!dialog) return;
    if (this.state.pendingEncounter) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute('open', '');
        }
      }
    } else if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  }

  private drawArchipelagoCanvas(highlightedPathNodes: string[]): void {
    const canvas = this.container.querySelector<HTMLCanvasElement>('.jc-map-canvas');
    if (!canvas) return;
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      return;
    }
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      return;
    }
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Nautical grid lines
    ctx.strokeStyle = 'rgba(65, 115, 138, 0.16)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const highlightedPairs = new Set<string>();
    for (let i = 0; i < highlightedPathNodes.length - 1; i++) {
      highlightedPairs.add(`${highlightedPathNodes[i]}__${highlightedPathNodes[i + 1]}`);
      highlightedPairs.add(`${highlightedPathNodes[i + 1]}__${highlightedPathNodes[i]}`);
    }

    // Draw edges
    for (const edge of this.state.edges) {
      const fromNode = getNodeById(edge.from);
      const toNode = getNodeById(edge.to);
      const haz = HAZARDS[edge.hazardId];
      const isHighlighted = highlightedPairs.has(`${edge.from}__${edge.to}`);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = isHighlighted ? '#f3b34c' : haz.badgeColor;
      ctx.lineWidth = isHighlighted ? 4 : 2.2;
      if (edge.channelType === 'INNER_SHORTCUT' && !isHighlighted) {
        ctx.setLineDash([6, 4]);
      }
      ctx.stroke();
      ctx.restore();

      // Midpoint badge showing Fuel + Hazard code
      const mx = (fromNode.x + toNode.x) / 2;
      const my = (fromNode.y + toNode.y) / 2;
      const label = `${edge.baseFuelCost}F·${haz.shortCode}`;
      ctx.fillStyle = 'rgba(9, 19, 25, 0.88)';
      ctx.fillRect(mx - 28, my - 9, 56, 17);
      ctx.strokeStyle = haz.badgeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 28, my - 9, 56, 17);
      ctx.fillStyle = '#e6edf0';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, mx, my);
    }

    const activeDestinations = new Set(
      this.state.contracts
        .filter((c) => c.status === 'ACCEPTED')
        .map((c) => c.destinationNodeId),
    );

    // Draw nodes
    for (const node of ARCHIPELAGO_NODES) {
      const isCurrent = node.id === this.state.currentNodeId;
      const isTarget = activeDestinations.has(node.id);
      const isSelected = node.id === this.state.selectedNodeId;

      ctx.beginPath();
      ctx.arc(node.x, node.y, isCurrent ? 15 : 11, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent ? '#f3b34c' : isTarget ? '#56c288' : '#1b3542';
      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeStyle = isSelected ? '#ffffff' : isCurrent ? '#081014' : '#5bc0de';
      ctx.stroke();

      ctx.fillStyle = isCurrent || isTarget ? '#081014' : '#e6edf0';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.code, node.x, node.y);

      // Node title label
      ctx.fillStyle = isCurrent ? '#f3b34c' : isTarget ? '#7ef0b0' : '#d2e2e9';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(node.name, node.x, node.y + 24);
    }
  }

  private bindEvents(): void {
    const canvas = this.container.querySelector<HTMLCanvasElement>('.jc-map-canvas');
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;

        for (const node of ARCHIPELAGO_NODES) {
          const dist = Math.hypot(cx - node.x, cy - node.y);
          if (dist <= 24) {
            this.state.selectedNodeId = node.id;
            const connected = getConnectedEdges(this.state, this.state.currentNodeId).some(
              (edge) => getNeighborNodeId(edge, this.state.currentNodeId) === node.id,
            );
            if (connected && this.state.runStatus === 'IN_PROGRESS') {
              const res = beginTravelToNode(this.state, node.id);
              if (!res.ok) {
                this.setNotice(res.error ?? 'Unable to sail.', true);
              } else {
                this.audio.playDieselChug();
              }
            } else {
              this.audio.playSonarPing();
              this.setNotice(`Selected ${node.name} (${node.code}) on archipelago chart.`);
            }
            this.render();
            break;
          }
        }
      });
    }

    this.container.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'preset-hauler':
          case 'preset-armored': {
            const presetId: LoadoutPresetId =
              action === 'preset-hauler' ? 'hauler' : 'armored_runner';
            const res = applyLoadoutPreset(this.state, presetId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Preset blocked by hold capacity.', true);
            } else {
              this.audio.playHullClank();
              this.setNotice(`Equipped ${LOADOUT_PRESETS[presetId].name} loadout.`);
            }
            this.render();
            break;
          }
          case 'save-run': {
            const ok = saveRunToStorage(this.state);
            this.setNotice(
              ok
                ? `Run saved at ${getNodeById(this.state.currentNodeId).name} (Seed #${this.state.seed}).`
                : 'Unable to save run to localStorage.',
              !ok,
            );
            this.render();
            break;
          }
          case 'load-run': {
            const loaded = loadRunFromStorage();
            if (loaded) {
              this.state = loaded;
              this.audio.playSonarPing();
              this.setNotice(`Loaded saved run (Seed #${loaded.seed}, Turn ${loaded.turn}).`);
            } else {
              this.setNotice('No saved run found in localStorage.', true);
            }
            this.render();
            break;
          }
          case 'new-run': {
            this.restartWithSeed(this.state.seed + 1);
            break;
          }
          case 'toggle-mute': {
            this.audio.muted = !this.audio.muted;
            this.render();
            break;
          }
          case 'toggle-debug': {
            this.toggleDebug();
            break;
          }
          case 'sail-node': {
            const targetId = btn.dataset.nodeId!;
            const res = beginTravelToNode(this.state, targetId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Cannot sail leg.', true);
            } else {
              this.audio.playDieselChug();
            }
            this.render();
            break;
          }
          case 'resolve-encounter': {
            const choiceId = btn.dataset.choiceId as HazardChoicePreview['id'];
            const res = resolvePendingEncounter(this.state, choiceId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Encounter resolution failed.', true);
            } else {
              this.audio.playHullClank();
            }
            this.render();
            break;
          }
          case 'accept-contract': {
            const cId = btn.dataset.contractId!;
            const res = acceptContract(this.state, cId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Cannot accept contract.', true);
            } else {
              this.audio.playHullClank();
              this.setNotice('Contract cargo loaded into Hold.');
            }
            this.render();
            break;
          }
          case 'abandon-contract': {
            const cId = btn.dataset.contractId!;
            const res = abandonContract(this.state, cId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Cannot jettison contract.', true);
            } else {
              this.setNotice('Cargo jettisoned; hold slots freed.');
            }
            this.render();
            break;
          }
          case 'deliver-contract': {
            const cId = btn.dataset.contractId!;
            const res = deliverContract(this.state, cId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Delivery rejected.', true);
            } else {
              this.audio.playCoinChime();
              this.setNotice(`Delivered contract for +${res.payout}¢!`);
            }
            this.render();
            break;
          }
          case 'claim-upgrade': {
            const modId = btn.dataset.modId as ModuleId | 'skip_for_credits';
            const res = selectDeliveryUpgradeModule(this.state, modId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Cannot install upgrade (check free Hold Slots).', true);
            } else {
              this.audio.playCoinChime();
              this.setNotice('Applied post-delivery guild upgrade!');
            }
            this.render();
            break;
          }
          case 'focus-node': {
            this.state.selectedNodeId = btn.dataset.nodeId ?? null;
            this.audio.playSonarPing();
            this.render();
            break;
          }
          case 'install-mod': {
            const modId = btn.dataset.modId as ModuleId;
            const res = installModule(this.state, modId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Module installation failed.', true);
            } else {
              this.audio.playHullClank();
              this.setNotice('Module bolted into boat hold.');
            }
            this.render();
            break;
          }
          case 'uninstall-mod': {
            const modId = btn.dataset.modId as ModuleId;
            const res = uninstallModule(this.state, modId);
            if (!res.ok) {
              this.setNotice(res.error ?? 'Cannot remove module.', true);
            } else {
              this.setNotice('Module uninstalled and hold space freed.');
            }
            this.render();
            break;
          }
          case 'port-refuel': {
            const res = refuelAtPort(this.state, 1);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot refuel.', true);
            this.render();
            break;
          }
          case 'port-repair': {
            const res = repairHullAtPort(this.state, 5);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot repair hull.', true);
            this.render();
            break;
          }
          case 'buy-drum': {
            const res = buyFuelDrum(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot buy Fuel Drum.', true);
            this.render();
            break;
          }
          case 'crack-drum': {
            const res = crackFuelDrumIntoTank(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot crack drum.', true);
            this.render();
            break;
          }
          case 'sell-drum': {
            const res = sellFuelDrum(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot sell drum.', true);
            this.render();
            break;
          }
          case 'buy-kit': {
            const res = buyRepairKit(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot buy Repair Kit.', true);
            this.render();
            break;
          }
          case 'use-kit': {
            const res = useRepairKitOnHull(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot use Repair Kit.', true);
            this.render();
            break;
          }
          case 'sell-kit': {
            const res = sellRepairKit(this.state);
            if (!res.ok) this.setNotice(res.error ?? 'Cannot sell Repair Kit.', true);
            this.render();
            break;
          }
          case 'debug-add-credits': {
            this.state.credits += 50;
            this.render();
            break;
          }
          case 'debug-heal': {
            this.state.hull = this.state.maxHull;
            this.state.fuel = this.state.maxFuel;
            this.render();
            break;
          }
        }
      });
    });
  }

  public exportStateJson(): string {
    return serializeRunState(this.state);
  }

  public importStateJson(raw: string): boolean {
    const res = deserializeRunState(raw);
    if (res.ok && res.state) {
      this.state = res.state;
      this.render();
      return true;
    }
    return false;
  }
}
