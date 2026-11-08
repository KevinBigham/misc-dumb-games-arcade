import {
  BlockType,
  CONFIG,
  Direction,
  DIRECTION_DELTAS,
  DIRECTION_ORDER,
  EnemyType,
  ItemType,
  oppositeDirection,
  rotateDirectionCW,
  SplitterRatioMode,
  VeinType,
} from './config';
import {
  BLOCKS,
  ENEMY_TYPES,
  getWaveDefinition,
  ITEMS,
  TECH_TREE_UNLOCKS,
  VEIN_TO_ITEM,
} from './content';
import { mulberry32 } from './rng';

export interface BeltItem {
  id: number;
  type: ItemType;
  progress: number;
}

export interface GridTile {
  x: number;
  y: number;
  vein: VeinType;
  block: BlockType;
  direction: Direction;
  hp: number;
  maxHp: number;
  item: BeltItem | null;
  inputBuffer: ItemType[];
  craftProgress: number;
  congested: boolean;
  splitterToggle: number;
  splitterRatio: SplitterRatioMode;
  ammoCount: number;
  maxAmmo: number;
  loadedAmmoType: ItemType | null;
  cooldown: number;
  produceOverride?: ItemType;
}

export interface EnemyInstance {
  id: number;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speedTilesPerTick: number;
  coreDamage: number;
  wallDamage: number;
  bountyCredits: number;
  isBoss: boolean;
  isShielded: boolean;
}

export interface ActiveShot {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  ttlTicks: number;
}

export interface QueuedSpawn {
  enemyType: EnemyType;
  delayTicks: number;
}

export interface FactoryStats {
  itemsMined: number;
  itemsDeliveredToCore: number;
  itemsRefined: number;
  ammoLoaded: number;
  shotsFired: number;
  totalDamageDealt: number;
  enemiesDestroyed: number;
  totalCreditsEarned: number;
  congestionTicks: number;
  wavesCleared: number;
}

export interface BottleneckReport {
  congestedTiles: Array<{ x: number; y: number; block: BlockType; reason: string }>;
  dryTurrets: Array<{ x: number; y: number; block: BlockType }>;
  starvedSmelters: Array<{ x: number; y: number }>;
  coreThroughputPerMin: number;
}

export type GameStatus = 'playing' | 'victory' | 'defeat';

export interface GameState {
  seed: number;
  rngState: number;
  tick: number;
  gridSize: number;
  corePos: { x: number; y: number };
  coreHp: number;
  coreMaxHp: number;
  credits: number;
  quotaProgress: number;
  claimedQuotaMilestones: number[];
  wave: number;
  waveActive: boolean;
  wavePrepTicksRemaining: number;
  queuedSpawns: QueuedSpawn[];
  waveSpawnTimer: number;
  enemies: EnemyInstance[];
  activeShots: ActiveShot[];
  unlockedBlocks: BlockType[];
  unlockedTechWaves: number[];
  coreInventory: Record<ItemType, number>;
  grid: GridTile[][];
  status: GameStatus;
  endlessMode: boolean;
  nextItemId: number;
  nextEnemyId: number;
  nextShotId: number;
  stats: FactoryStats;
  lastEventMessage: string;
}

export interface BuildCommand {
  type: 'place' | 'demolish' | 'rotate' | 'toggle_splitter_ratio';
  x: number;
  y: number;
  blockType?: BlockType;
  direction?: Direction;
  respectTechLock?: boolean;
  free?: boolean;
  produceOverride?: ItemType;
}

export interface BuildCommandResult {
  ok: boolean;
  reason?: string;
  refundedCredits?: number;
  costPaid?: number;
}

export function createEmptyTile(x: number, y: number, vein: VeinType = 'none'): GridTile {
  return {
    x,
    y,
    vein,
    block: 'empty',
    direction: 'E',
    hp: 0,
    maxHp: 0,
    item: null,
    inputBuffer: [],
    craftProgress: 0,
    congested: false,
    splitterToggle: 0,
    splitterRatio: '1:1',
    ammoCount: 0,
    maxAmmo: 0,
    loadedAmmoType: null,
    cooldown: 0,
  };
}

export function createInitialState(options?: {
  seed?: number;
  coreX?: number;
  coreY?: number;
}): GameState {
  const seed = options?.seed ?? 9092026;
  const rng = mulberry32(seed);
  const gridSize = CONFIG.GRID_SIZE;
  const coreX = options?.coreX ?? CONFIG.CORE_DEFAULT_X;
  const coreY = options?.coreY ?? CONFIG.CORE_DEFAULT_Y;

  const grid: GridTile[][] = [];
  for (let y = 0; y < gridSize; y++) {
    const row: GridTile[] = [];
    for (let x = 0; x < gridSize; x++) {
      row.push(createEmptyTile(x, y, 'none'));
    }
    grid.push(row);
  }

  // Place deterministic anchor veins near the Core so early-game layouts are always rich and fair
  const anchorVeins: Array<{ x: number; y: number; vein: VeinType }> = [
    { x: Math.max(0, coreX - 2), y: coreY, vein: 'copper_vein' },
    { x: Math.max(0, coreX - 3), y: Math.max(0, coreY - 1), vein: 'copper_vein' },
    { x: coreX, y: Math.max(0, coreY - 2), vein: 'iron_vein' },
    { x: Math.min(gridSize - 1, coreX + 2), y: coreY, vein: 'iron_vein' },
    { x: coreX, y: Math.min(gridSize - 1, coreY + 2), vein: 'copper_vein' },
    { x: Math.min(gridSize - 1, coreX + 3), y: Math.min(gridSize - 1, coreY + 2), vein: 'crystal_vein' },
    { x: Math.max(0, coreX - 2), y: Math.min(gridSize - 1, coreY + 3), vein: 'iron_vein' },
    { x: Math.min(gridSize - 1, coreX + 2), y: Math.max(0, coreY - 3), vein: 'crystal_vein' },
  ];

  for (const v of anchorVeins) {
    if (v.x !== coreX || v.y !== coreY) {
      grid[v.y][v.x].vein = v.vein;
    }
  }

  // Add seeded peripheral veins
  const veinChoices: readonly VeinType[] = ['copper_vein', 'iron_vein', 'crystal_vein'];
  for (let i = 0; i < 8; i++) {
    const vx = rng.nextInt(1, gridSize - 2);
    const vy = rng.nextInt(1, gridSize - 2);
    const dist = Math.abs(vx - coreX) + Math.abs(vy - coreY);
    if (dist >= 2 && grid[vy][vx].vein === 'none') {
      grid[vy][vx].vein = rng.pick(veinChoices);
    }
  }

  // Place Central Command Core
  const coreTile = grid[coreY][coreX];
  coreTile.vein = 'none';
  coreTile.block = 'core';
  coreTile.hp = CONFIG.CORE_MAX_HP;
  coreTile.maxHp = CONFIG.CORE_MAX_HP;

  const starterUnlocks = [...TECH_TREE_UNLOCKS[0].unlockedBlocks];

  return {
    seed,
    rngState: rng.getState(),
    tick: 0,
    gridSize,
    corePos: { x: coreX, y: coreY },
    coreHp: CONFIG.CORE_MAX_HP,
    coreMaxHp: CONFIG.CORE_MAX_HP,
    credits: CONFIG.INITIAL_CREDITS,
    quotaProgress: 0,
    claimedQuotaMilestones: [],
    wave: 1,
    waveActive: false,
    wavePrepTicksRemaining: CONFIG.WAVE_PREP_TICKS,
    queuedSpawns: [],
    waveSpawnTimer: 0,
    enemies: [],
    activeShots: [],
    unlockedBlocks: starterUnlocks,
    unlockedTechWaves: [1],
    coreInventory: {
      CuCircle: 0,
      FeSquare: 0,
      AuStar: 0,
      CutHalf: 0,
      BoltedAlloy: 0,
    },
    grid,
    status: 'playing',
    endlessMode: false,
    nextItemId: 1,
    nextEnemyId: 1,
    nextShotId: 1,
    stats: {
      itemsMined: 0,
      itemsDeliveredToCore: 0,
      itemsRefined: 0,
      ammoLoaded: 0,
      shotsFired: 0,
      totalDamageDealt: 0,
      enemiesDestroyed: 0,
      totalCreditsEarned: 0,
      congestionTicks: 0,
      wavesCleared: 0,
    },
    lastEventMessage: 'Command Core online. Place Miners and Belts to feed Core Quota & Perimeter Turrets.',
  };
}

export function getTile(state: GameState, x: number, y: number): GridTile | null {
  if (x < 0 || y < 0 || x >= state.gridSize || y >= state.gridSize) {
    return null;
  }
  return state.grid[y][x];
}

export function isBlockUnlocked(state: GameState, blockType: BlockType): boolean {
  if (blockType === 'empty' || blockType === 'core') return true;
  return state.unlockedBlocks.includes(blockType);
}

export function unlockTechForWave(state: GameState, targetWave: number): BlockType[] {
  const newlyUnlocked: BlockType[] = [];
  for (const tier of TECH_TREE_UNLOCKS) {
    if (tier.wave <= targetWave) {
      if (!state.unlockedTechWaves.includes(tier.wave)) {
        state.unlockedTechWaves.push(tier.wave);
      }
      for (const blockId of tier.unlockedBlocks) {
        if (!state.unlockedBlocks.includes(blockId)) {
          state.unlockedBlocks.push(blockId);
          newlyUnlocked.push(blockId);
        }
      }
    }
  }
  if (newlyUnlocked.length > 0) {
    const names = newlyUnlocked.map((b) => BLOCKS[b].name).join(' + ');
    state.lastEventMessage = `Tech Unlocked (Wave ${targetWave}): ${names}!`;
  }
  return newlyUnlocked;
}

export function applyBuildCommand(
  state: GameState,
  command: BuildCommand
): BuildCommandResult {
  const tile = getTile(state, command.x, command.y);
  if (!tile) {
    return { ok: false, reason: 'out_of_bounds' };
  }

  if (command.type === 'rotate') {
    if (tile.block === 'empty' || tile.block === 'core') {
      return { ok: false, reason: 'not_rotatable' };
    }
    tile.direction = command.direction ?? rotateDirectionCW(tile.direction);
    return { ok: true };
  }

  if (command.type === 'toggle_splitter_ratio') {
    if (tile.block !== 'splitter') {
      return { ok: false, reason: 'not_splitter' };
    }
    const order: SplitterRatioMode[] = ['1:1', '2:1_A', '2:1_B'];
    const idx = order.indexOf(tile.splitterRatio);
    tile.splitterRatio = order[(idx + 1) % order.length];
    return { ok: true };
  }

  if (command.type === 'demolish') {
    if (tile.block === 'empty') {
      return { ok: false, reason: 'already_empty' };
    }
    if (tile.block === 'core') {
      return { ok: false, reason: 'cannot_demolish_core' };
    }
    const meta = BLOCKS[tile.block];
    const refund = Math.floor(meta.cost * CONFIG.REFUND_RATIO);
    state.credits += refund;
    const preservedVein = tile.vein;
    state.grid[tile.y][tile.x] = createEmptyTile(tile.x, tile.y, preservedVein);
    return { ok: true, refundedCredits: refund };
  }

  if (command.type === 'place') {
    const blockType = command.blockType;
    if (!blockType || blockType === 'empty') {
      return { ok: false, reason: 'invalid_block' };
    }
    if (tile.block === 'core') {
      return { ok: false, reason: 'cannot_overwrite_core' };
    }
    if (command.respectTechLock && !isBlockUnlocked(state, blockType)) {
      return { ok: false, reason: 'tech_locked' };
    }

    const meta = BLOCKS[blockType];
    const isSameBlockRotation = tile.block === blockType;
    const refundExisting =
      tile.block !== 'empty' && !isSameBlockRotation
        ? Math.floor(BLOCKS[tile.block].cost * CONFIG.REFUND_RATIO)
        : 0;
    const netCost = command.free || isSameBlockRotation ? 0 : Math.max(0, meta.cost - refundExisting);

    if (!command.free && state.credits < netCost) {
      return { ok: false, reason: 'insufficient_credits' };
    }

    state.credits -= netCost;

    if (isSameBlockRotation) {
      if (command.direction) {
        tile.direction = command.direction;
      } else {
        tile.direction = rotateDirectionCW(tile.direction);
      }
      if (command.produceOverride) {
        tile.produceOverride = command.produceOverride;
      }
      return { ok: true, costPaid: 0 };
    }

    const preservedVein = tile.vein;
    const nextTile = createEmptyTile(tile.x, tile.y, preservedVein);
    nextTile.block = blockType;
    nextTile.direction = command.direction ?? 'E';
    nextTile.hp = meta.maxHp;
    nextTile.maxHp = meta.maxHp;
    nextTile.maxAmmo = meta.turretMaxAmmo ?? 0;
    if (command.produceOverride) {
      nextTile.produceOverride = command.produceOverride;
    }

    if (blockType === 'core') {
      state.corePos = { x: tile.x, y: tile.y };
    }

    state.grid[tile.y][tile.x] = nextTile;
    return { ok: true, costPaid: netCost };
  }

  return { ok: false, reason: 'unknown_command' };
}

function isReceiverBlock(block: BlockType): boolean {
  return (
    block === 'core' ||
    block === 'belt' ||
    block === 'overclock_belt' ||
    block === 'splitter' ||
    block === 'smelter' ||
    block === 'silo' ||
    block === 'bolt_turret' ||
    block === 'scatter_turret' ||
    block === 'arc_railgun'
  );
}

function isTilePointingInto(tile: GridTile, targetX: number, targetY: number): boolean {
  if (
    tile.block !== 'belt' &&
    tile.block !== 'overclock_belt' &&
    tile.block !== 'miner' &&
    tile.block !== 'smelter'
  ) {
    return false;
  }
  const delta = DIRECTION_DELTAS[tile.direction];
  return tile.x + delta.dx === targetX && tile.y + delta.dy === targetY;
}

export function canTileAcceptItem(
  state: GameState,
  tx: number,
  ty: number,
  _itemType: ItemType,
  fromX?: number,
  fromY?: number
): boolean {
  const target = getTile(state, tx, ty);
  if (!target) return false;

  // Prevent head-on collision into a belt/miner pointing directly back at the sender
  if (
    fromX !== undefined &&
    fromY !== undefined &&
    (target.block === 'belt' || target.block === 'overclock_belt') &&
    isTilePointingInto(target, fromX, fromY)
  ) {
    return false;
  }

  switch (target.block) {
    case 'core':
      return true;
    case 'belt':
    case 'overclock_belt':
    case 'splitter':
      return target.item === null;
    case 'smelter':
      return target.inputBuffer.length < CONFIG.SMELTER_INPUT_CAPACITY;
    case 'silo':
      return target.inputBuffer.length < CONFIG.SILO_CAPACITY;
    case 'bolt_turret':
    case 'scatter_turret':
    case 'arc_railgun':
      return target.ammoCount < target.maxAmmo;
    default:
      return false;
  }
}

function checkQuotaMilestones(state: GameState): void {
  for (let i = 0; i < CONFIG.QUOTA_MILESTONES.length; i++) {
    const threshold = CONFIG.QUOTA_MILESTONES[i];
    if (
      state.quotaProgress >= threshold &&
      !state.claimedQuotaMilestones.includes(threshold)
    ) {
      state.claimedQuotaMilestones.push(threshold);
      const reward = CONFIG.QUOTA_MILESTONE_REWARDS[i] ?? 50;
      state.credits += reward;
      state.stats.totalCreditsEarned += reward;
      state.lastEventMessage = `Core Quota Milestone (${threshold}) reached! +${reward} Bonus Credits!`;
    }
  }
}

function deliverItemToTile(state: GameState, target: GridTile, item: BeltItem): void {
  switch (target.block) {
    case 'core': {
      const meta = ITEMS[item.type];
      state.credits += meta.creditValue;
      state.quotaProgress += meta.quotaValue;
      state.coreInventory[item.type] = (state.coreInventory[item.type] ?? 0) + 1;
      state.stats.itemsDeliveredToCore += 1;
      state.stats.totalCreditsEarned += meta.creditValue;
      checkQuotaMilestones(state);
      return;
    }
    case 'belt':
    case 'overclock_belt':
    case 'splitter': {
      target.item = { ...item, progress: 1 };
      return;
    }
    case 'smelter':
    case 'silo': {
      target.inputBuffer.push(item.type);
      return;
    }
    case 'bolt_turret':
    case 'scatter_turret':
    case 'arc_railgun': {
      target.ammoCount = Math.min(
        target.maxAmmo,
        target.ammoCount + CONFIG.AMMO_PER_DELIVERED_ITEM
      );
      if (
        !target.loadedAmmoType ||
        ITEMS[item.type].damageMultiplier >= ITEMS[target.loadedAmmoType].damageMultiplier
      ) {
        target.loadedAmmoType = item.type;
      }
      state.stats.ammoLoaded += CONFIG.AMMO_PER_DELIVERED_ITEM;
      return;
    }
    default:
      return;
  }
}

function findProducerOrProcessorTarget(
  state: GameState,
  tile: GridTile
): { x: number; y: number } {
  const primaryDelta = DIRECTION_DELTAS[tile.direction];
  const px = tile.x + primaryDelta.dx;
  const py = tile.y + primaryDelta.dy;
  const primaryNeighbor = getTile(state, px, py);

  if (
    primaryNeighbor &&
    isReceiverBlock(primaryNeighbor.block) &&
    !isTilePointingInto(primaryNeighbor, tile.x, tile.y)
  ) {
    return { x: px, y: py };
  }

  // Smart fallback: if facing direction is not a valid receiver, look for any adjacent connected receiver
  for (const dir of DIRECTION_ORDER) {
    const delta = DIRECTION_DELTAS[dir];
    const nx = tile.x + delta.dx;
    const ny = tile.y + delta.dy;
    const neighbor = getTile(state, nx, ny);
    if (
      neighbor &&
      isReceiverBlock(neighbor.block) &&
      !isTilePointingInto(neighbor, tile.x, tile.y)
    ) {
      return { x: nx, y: ny };
    }
  }

  return { x: px, y: py };
}

function getSplitterDownstreamCandidates(
  state: GameState,
  tile: GridTile
): Array<{ x: number; y: number }> {
  const startIdx = DIRECTION_ORDER.indexOf(tile.direction);
  const candidates: Array<{ x: number; y: number }> = [];

  for (let offset = 0; offset < 4; offset++) {
    const dir = DIRECTION_ORDER[(startIdx + offset) % 4];
    const delta = DIRECTION_DELTAS[dir];
    const nx = tile.x + delta.dx;
    const ny = tile.y + delta.dy;
    const neighbor = getTile(state, nx, ny);
    if (!neighbor) continue;
    if (!isReceiverBlock(neighbor.block)) continue;
    if (isTilePointingInto(neighbor, tile.x, tile.y)) continue;
    candidates.push({ x: nx, y: ny });
  }

  return candidates;
}

function pickSplitterTarget(
  state: GameState,
  tile: GridTile,
  itemType: ItemType
): { x: number; y: number } | null {
  const candidates = getSplitterDownstreamCandidates(state, tile);
  if (candidates.length === 0) return null;

  if (candidates.length === 1) {
    const only = candidates[0];
    if (canTileAcceptItem(state, only.x, only.y, itemType, tile.x, tile.y)) {
      tile.splitterToggle = (tile.splitterToggle + 1) % 2;
      return only;
    }
    return null;
  }

  // Determine preferred candidate index based on ratio mode (1:1 vs 2:1)
  let preferredSlot = 0;
  if (tile.splitterRatio === '1:1') {
    preferredSlot = tile.splitterToggle % candidates.length;
  } else if (tile.splitterRatio === '2:1_A') {
    const pattern = [0, 0, 1];
    preferredSlot = pattern[tile.splitterToggle % pattern.length] % candidates.length;
  } else {
    const pattern = [0, 1, 1];
    preferredSlot = pattern[tile.splitterToggle % pattern.length] % candidates.length;
  }

  for (let attempt = 0; attempt < candidates.length; attempt++) {
    const idx = (preferredSlot + attempt) % candidates.length;
    const cand = candidates[idx];
    if (canTileAcceptItem(state, cand.x, cand.y, itemType, tile.x, tile.y)) {
      tile.splitterToggle += 1;
      return cand;
    }
  }

  return null;
}

export function stepFactoryTick(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  state.tick += 1;

  // Decay visual projectile traces
  state.activeShots = state.activeShots
    .map((s) => ({ ...s, ttlTicks: s.ttlTicks - 1 }))
    .filter((s) => s.ttlTicks > 0);

  // Track movement budget for every item currently on the grid at the start of the tick
  const movesLeft = new Map<number, number>();
  const initialItemIdByTile = new Map<GridTile, number>();

  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const tile = state.grid[y][x];
      tile.congested = false;
      if (tile.item) {
        const budget = tile.block === 'overclock_belt' ? 2 : 1;
        movesLeft.set(tile.item.id, budget);
        initialItemIdByTile.set(tile, tile.item.id);
      }
    }
  }

  // Track which silos and smelters have already pushed in Phase 1
  const siloPushed = new Set<string>();

  // Phase 1: Downstream-to-Upstream Transport Relaxation Loop
  let movedAny = true;
  let guard = 0;
  const maxPasses = state.gridSize * state.gridSize * 2;

  while (movedAny && guard < maxPasses) {
    movedAny = false;
    guard += 1;

    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const tile = state.grid[y][x];

        // 1A: Belt or Overclocked Belt
        if (
          (tile.block === 'belt' || tile.block === 'overclock_belt') &&
          tile.item !== null
        ) {
          const rem = movesLeft.get(tile.item.id) ?? 0;
          if (rem > 0) {
            const delta = DIRECTION_DELTAS[tile.direction];
            const tx = tile.x + delta.dx;
            const ty = tile.y + delta.dy;
            if (canTileAcceptItem(state, tx, ty, tile.item.type, tile.x, tile.y)) {
              const movingItem = tile.item;
              const destTile = getTile(state, tx, ty)!;
              tile.item = null;
              deliverItemToTile(state, destTile, movingItem);
              const nextRem =
                destTile.block === 'overclock_belt' || tile.block === 'overclock_belt'
                  ? rem - 1
                  : 0;
              movesLeft.set(movingItem.id, Math.max(0, nextRem));
              movedAny = true;
            }
          }
        }

        // 1B: Splitter
        else if (tile.block === 'splitter' && tile.item !== null) {
          const rem = movesLeft.get(tile.item.id) ?? 0;
          if (rem > 0) {
            const targetCoord = pickSplitterTarget(state, tile, tile.item.type);
            if (targetCoord) {
              const movingItem = tile.item;
              const destTile = getTile(state, targetCoord.x, targetCoord.y)!;
              tile.item = null;
              deliverItemToTile(state, destTile, movingItem);
              movesLeft.set(movingItem.id, 0);
              movedAny = true;
            }
          }
        }

        // 1C: Smelter with a held refined output item waiting to exit
        else if (tile.block === 'smelter' && tile.item !== null) {
          const rem = movesLeft.get(tile.item.id) ?? 0;
          if (rem > 0) {
            const targetCoord = findProducerOrProcessorTarget(state, tile);
            if (
              canTileAcceptItem(
                state,
                targetCoord.x,
                targetCoord.y,
                tile.item.type,
                tile.x,
                tile.y
              )
            ) {
              const movingItem = tile.item;
              const destTile = getTile(state, targetCoord.x, targetCoord.y)!;
              tile.item = null;
              deliverItemToTile(state, destTile, movingItem);
              movesLeft.set(movingItem.id, 0);
              movedAny = true;
            }
          }
        }

        // 1D: Capacitor Buffer Silo auto-feeding adjacent turret or downstream belt
        else if (tile.block === 'silo' && tile.inputBuffer.length > 0) {
          const key = `${tile.x},${tile.y}`;
          if (!siloPushed.has(key)) {
            const nextType = tile.inputBuffer[0];
            // Priority 1: Directly adjacent turret needing ammo
            let fedTarget: GridTile | null = null;
            for (const dir of DIRECTION_ORDER) {
              const d = DIRECTION_DELTAS[dir];
              const adj = getTile(state, tile.x + d.dx, tile.y + d.dy);
              if (
                adj &&
                BLOCKS[adj.block].isTurret &&
                adj.ammoCount < adj.maxAmmo
              ) {
                fedTarget = adj;
                break;
              }
            }
            // Priority 2: Strictly the tile in the Silo's facing direction (if it's a downstream receiver)
            if (!fedTarget) {
              const d = DIRECTION_DELTAS[tile.direction];
              const outX = tile.x + d.dx;
              const outY = tile.y + d.dy;
              if (
                canTileAcceptItem(
                  state,
                  outX,
                  outY,
                  nextType,
                  tile.x,
                  tile.y
                )
              ) {
                fedTarget = getTile(state, outX, outY);
              }
            }

            if (fedTarget) {
              tile.inputBuffer.shift();
              const outItem: BeltItem = {
                id: state.nextItemId++,
                type: nextType,
                progress: 1,
              };
              movesLeft.set(outItem.id, 0);
              deliverItemToTile(state, fedTarget, outItem);
              siloPushed.add(key);
              movedAny = true;
            }
          }
        }
      }
    }
  }

  // Mark any belt/splitter/smelter that could not advance its pre-existing item as congested
  for (const [tile, startItemId] of initialItemIdByTile.entries()) {
    if (tile.item !== null && tile.item.id === startItemId) {
      tile.congested = true;
      state.stats.congestionTicks += 1;
    }
  }

  // Phase 2: Smelter Processing (Refines raw ore -> CutHalf / BoltedAlloy)
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const tile = state.grid[y][x];
      if (tile.block !== 'smelter') continue;

      if (tile.item === null && tile.inputBuffer.length > 0) {
        tile.craftProgress += 1;
        if (tile.craftProgress >= CONFIG.SMELTER_PROCESS_TICKS) {
          tile.craftProgress = 0;
          const rawType = tile.inputBuffer.shift()!;
          const refinedType = ITEMS[rawType].refinedInto ?? 'BoltedAlloy';
          const refinedItem: BeltItem = {
            id: state.nextItemId++,
            type: refinedType,
            progress: 1,
          };
          state.stats.itemsRefined += 1;

          // Attempt immediate push to downstream output if open
          const targetCoord = findProducerOrProcessorTarget(state, tile);
          if (
            canTileAcceptItem(
              state,
              targetCoord.x,
              targetCoord.y,
              refinedItem.type,
              tile.x,
              tile.y
            )
          ) {
            const destTile = getTile(state, targetCoord.x, targetCoord.y)!;
            deliverItemToTile(state, destTile, refinedItem);
            movesLeft.set(refinedItem.id, 0);
          } else {
            tile.item = refinedItem;
            tile.congested = true;
          }
        }
      }
    }
  }

  // Phase 3: Miner Extraction
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const tile = state.grid[y][x];
      if (tile.block !== 'miner') continue;

      const minedType: ItemType =
        tile.produceOverride ?? VEIN_TO_ITEM[tile.vein] ?? 'CuCircle';

      if (tile.item === null) {
        tile.craftProgress += 1;
        if (tile.craftProgress >= CONFIG.MINER_INTERVAL_TICKS) {
          tile.craftProgress = 0;
          tile.item = {
            id: state.nextItemId++,
            type: minedType,
            progress: 0,
          };
          state.stats.itemsMined += 1;
        }
      }

      if (tile.item !== null) {
        const targetCoord = findProducerOrProcessorTarget(state, tile);
        if (
          canTileAcceptItem(
            state,
            targetCoord.x,
            targetCoord.y,
            tile.item.type,
            tile.x,
            tile.y
          )
        ) {
          const destTile = getTile(state, targetCoord.x, targetCoord.y)!;
          const outItem = tile.item;
          tile.item = null;
          tile.congested = false;
          deliverItemToTile(state, destTile, outItem);
          movesLeft.set(outItem.id, 0);
        } else {
          tile.congested = true;
          state.stats.congestionTicks += 1;
        }
      }
    }
  }

  // Phase 4: Wave Prep Timer or Active Wave Combat
  if (!state.waveActive && state.enemies.length === 0) {
    if (state.wavePrepTicksRemaining > 0) {
      state.wavePrepTicksRemaining -= 1;
    }
  } else {
    stepWaveCombat(state);
  }

  return state;
}

export function spawnEnemy(
  state: GameState,
  enemyType: EnemyType,
  customX?: number,
  customY?: number
): EnemyInstance {
  const meta = ENEMY_TYPES[enemyType];
  const rng = mulberry32(state.rngState);

  let sx = customX;
  let sy = customY;
  if (sx === undefined || sy === undefined) {
    const edge = rng.nextInt(0, 3);
    const offset = rng.nextInt(1, state.gridSize - 2);
    if (edge === 0) {
      sx = offset;
      sy = 0;
    } else if (edge === 1) {
      sx = state.gridSize - 1;
      sy = offset;
    } else if (edge === 2) {
      sx = offset;
      sy = state.gridSize - 1;
    } else {
      sx = 0;
      sy = offset;
    }
  }
  state.rngState = rng.getState();

  // Gentle HP scaling across the 30-wave campaign
  const waveScale = 1 + Math.max(0, state.wave - 1) * 0.06;
  const scaledHp = Math.round(meta.maxHp * waveScale);

  const enemy: EnemyInstance = {
    id: state.nextEnemyId++,
    type: enemyType,
    name: meta.name,
    x: sx,
    y: sy,
    hp: scaledHp,
    maxHp: scaledHp,
    speedTilesPerTick: meta.speedTilesPerTick,
    coreDamage: meta.coreDamage,
    wallDamage: meta.wallDamage,
    bountyCredits: meta.bountyCredits,
    isBoss: meta.isBoss,
    isShielded: meta.isShielded,
  };

  state.enemies.push(enemy);
  return enemy;
}

export function triggerNextWave(
  state: GameState,
  options?: { earlyBonus?: boolean; waveNumber?: number }
): GameState {
  if (state.status !== 'playing') return state;

  if (options?.waveNumber !== undefined) {
    state.wave = options.waveNumber;
  }

  unlockTechForWave(state, state.wave);

  const waveDef = getWaveDefinition(state.wave);
  if (options?.earlyBonus && !state.waveActive && state.wavePrepTicksRemaining > 0) {
    state.credits += waveDef.earlyLaunchBonus;
    state.stats.totalCreditsEarned += waveDef.earlyLaunchBonus;
  }

  const queue: QueuedSpawn[] = [];
  for (const group of waveDef.spawns) {
    for (let i = 0; i < group.count; i++) {
      queue.push({
        enemyType: group.enemyType,
        delayTicks: i === 0 ? 0 : group.spacingTicks,
      });
    }
  }

  state.queuedSpawns = queue;
  state.waveSpawnTimer = 0;
  state.waveActive = true;
  state.wavePrepTicksRemaining = 0;
  state.lastEventMessage = `${waveDef.title} incoming! Keep turret magazines supplied!`;

  // Spawn first enemy immediately so combat starts right away
  if (state.queuedSpawns.length > 0) {
    const first = state.queuedSpawns.shift()!;
    spawnEnemy(state, first.enemyType);
    if (state.queuedSpawns.length > 0) {
      state.waveSpawnTimer = state.queuedSpawns[0].delayTicks;
    }
  }

  return state;
}

export function stepWaveCombat(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  // 1. Spawn queued enemies
  if (state.waveActive && state.queuedSpawns.length > 0) {
    if (state.waveSpawnTimer > 0) {
      state.waveSpawnTimer -= 1;
    }
    if (state.waveSpawnTimer <= 0 && state.queuedSpawns.length > 0) {
      const next = state.queuedSpawns.shift()!;
      spawnEnemy(state, next.enemyType);
      if (state.queuedSpawns.length > 0) {
        state.waveSpawnTimer = state.queuedSpawns[0].delayTicks;
      }
    }
  }

  // 2. Turrets acquire targets and fire (ONLY when supplied with ammo > 0)
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const tile = state.grid[y][x];
      const meta = BLOCKS[tile.block];
      if (!meta.isTurret) continue;

      if (tile.cooldown > 0) {
        tile.cooldown -= 1;
      }
      if (tile.ammoCount <= 0 || tile.cooldown > 0 || state.enemies.length === 0) {
        continue;
      }

      const range = meta.turretRange ?? 3.8;
      const inRange = state.enemies
        .map((enemy) => {
          const distToTurret = Math.hypot(enemy.x - tile.x, enemy.y - tile.y);
          const distToCore = Math.hypot(
            enemy.x - state.corePos.x,
            enemy.y - state.corePos.y
          );
          return { enemy, distToTurret, distToCore };
        })
        .filter((entry) => entry.distToTurret <= range && entry.enemy.hp > 0)
        .sort((a, b) => a.distToCore - b.distToCore);

      if (inRange.length === 0) continue;

      const maxTargets = meta.turretTargetsPerShot ?? 1;
      const targets = inRange.slice(0, maxTargets);

      const ammoType = tile.loadedAmmoType ?? 'CuCircle';
      const ammoMeta = ITEMS[ammoType];
      const baseDamage = meta.turretBaseDamage ?? 15;

      tile.ammoCount = Math.max(0, tile.ammoCount - 1);
      if (tile.ammoCount === 0) {
        tile.loadedAmmoType = null;
      }
      tile.cooldown = Math.max(0, (meta.turretFireIntervalTicks ?? 1) - 1);
      state.stats.shotsFired += 1;

      for (const { enemy } of targets) {
        let shotDamage = Math.round(baseDamage * ammoMeta.damageMultiplier);
        if (
          (enemy.isBoss || enemy.isShielded) &&
          (meta.turretAntiBossMultiplier ?? 1) > 1
        ) {
          shotDamage = Math.round(shotDamage * (meta.turretAntiBossMultiplier ?? 1));
        }
        enemy.hp -= shotDamage;
        state.stats.totalDamageDealt += shotDamage;

        state.activeShots.push({
          id: state.nextShotId++,
          fromX: tile.x,
          fromY: tile.y,
          toX: enemy.x,
          toY: enemy.y,
          color: ammoMeta.color,
          ttlTicks: 2,
        });
      }
    }
  }

  // 3. Remove defeated enemies and award bounties
  const surviving: EnemyInstance[] = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) {
      state.credits += enemy.bountyCredits;
      state.stats.totalCreditsEarned += enemy.bountyCredits;
      state.stats.enemiesDestroyed += 1;
    } else {
      surviving.push(enemy);
    }
  }
  state.enemies = surviving;

  // 4. Advance remaining enemies toward Command Core
  const afterMove: EnemyInstance[] = [];
  for (const enemy of state.enemies) {
    const dx = state.corePos.x - enemy.x;
    const dy = state.corePos.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= 0.85) {
      // Enemy impacts the Command Core
      state.coreHp = Math.max(0, state.coreHp - enemy.coreDamage);
      state.lastEventMessage = `WARNING: ${enemy.name} struck the Command Core (-${enemy.coreDamage} HP)!`;
      if (state.coreHp <= 0) {
        state.coreHp = 0;
        state.status = 'defeat';
        state.waveActive = false;
        state.lastEventMessage = 'CRITICAL FAILURE: Command Core Hull reached 0 HP!';
        break;
      }
      // Non-boss drones detonate on core impact; bosses continue battering if still alive
      if (enemy.isBoss) {
        afterMove.push(enemy);
      }
      continue;
    }

    const stepDist = Math.min(dist, enemy.speedTilesPerTick);
    const nx = enemy.x + (dx / dist) * stepDist;
    const ny = enemy.y + (dy / dist) * stepDist;
    const cellTile = getTile(state, Math.round(nx), Math.round(ny));

    if (cellTile && cellTile.block === 'wall' && cellTile.hp > 0) {
      cellTile.hp -= enemy.wallDamage;
      if (cellTile.hp <= 0) {
        const preservedVein = cellTile.vein;
        state.grid[cellTile.y][cellTile.x] = createEmptyTile(
          cellTile.x,
          cellTile.y,
          preservedVein
        );
      }
      afterMove.push(enemy);
    } else {
      enemy.x = nx;
      enemy.y = ny;
      afterMove.push(enemy);
    }
  }

  if (state.status === 'defeat') {
    return state;
  }

  state.enemies = afterMove;

  // 5. Check Wave Clear & Campaign Victory / Tech Unlocks
  if (
    state.waveActive &&
    state.queuedSpawns.length === 0 &&
    state.enemies.length === 0 &&
    state.coreHp > 0
  ) {
    const clearedWave = state.wave;
    const waveDef = getWaveDefinition(clearedWave);
    state.waveActive = false;
    state.stats.wavesCleared += 1;
    state.credits += waveDef.rewardCredits;
    state.stats.totalCreditsEarned += waveDef.rewardCredits;

    // Repair walls slightly between waves
    for (let y = 0; y < state.gridSize; y++) {
      for (let x = 0; x < state.gridSize; x++) {
        const t = state.grid[y][x];
        if (t.block === 'wall' && t.hp > 0 && t.hp < t.maxHp) {
          t.hp = Math.min(t.maxHp, t.hp + 40);
        }
      }
    }

    if (clearedWave >= CONFIG.CAMPAIGN_MAX_WAVE && !state.endlessMode) {
      state.status = 'victory';
      state.lastEventMessage = `CAMPAIGN VICTORY! All ${CONFIG.CAMPAIGN_MAX_WAVE} Waves survived!`;
    } else {
      state.wave = clearedWave + 1;
      state.wavePrepTicksRemaining = CONFIG.WAVE_PREP_TICKS;
      const unlocked = unlockTechForWave(state, state.wave);
      if (unlocked.length === 0) {
        state.lastEventMessage = `Wave ${clearedWave} cleared (+${waveDef.rewardCredits} Credits)! Prepare for Wave ${state.wave}.`;
      }
    }
  }

  return state;
}

export function diagnoseBottlenecks(state: GameState): BottleneckReport {
  const congestedTiles: BottleneckReport['congestedTiles'] = [];
  const dryTurrets: BottleneckReport['dryTurrets'] = [];
  const starvedSmelters: BottleneckReport['starvedSmelters'] = [];

  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      const tile = state.grid[y][x];
      if (tile.congested) {
        const delta = DIRECTION_DELTAS[tile.direction];
        const dest = getTile(state, tile.x + delta.dx, tile.y + delta.dy);
        let reason = 'Downstream capacity full';
        if (!dest || dest.block === 'empty') {
          reason = 'Belt ends at open deck (no receiver)';
        } else if (BLOCKS[dest.block].isTurret && dest.ammoCount >= dest.maxAmmo) {
          reason = `${BLOCKS[dest.block].shortLabel} magazine full (${dest.ammoCount}/${dest.maxAmmo})`;
        } else if (dest.block === 'smelter') {
          reason = 'Smelter input buffer full';
        }
        congestedTiles.push({ x, y, block: tile.block, reason });
      }
      if (BLOCKS[tile.block].isTurret && tile.ammoCount === 0) {
        dryTurrets.push({ x, y, block: tile.block });
      }
      if (tile.block === 'smelter' && tile.inputBuffer.length === 0 && tile.item === null) {
        starvedSmelters.push({ x, y });
      }
    }
  }

  const ticksElapsed = Math.max(1, state.tick);
  const ticksPerMinute = Math.round(60000 / CONFIG.TICK_INTERVAL_MS);
  const coreThroughputPerMin = Math.round(
    (state.stats.itemsDeliveredToCore / ticksElapsed) * ticksPerMinute
  );

  return {
    congestedTiles,
    dryTurrets,
    starvedSmelters,
    coreThroughputPerMin,
  };
}

export function deployStarterBlueprint(state: GameState): void {
  const cx = state.corePos.x;
  const cy = state.corePos.y;

  // Copper vein at (cx - 2, cy) -> belt at (cx - 1, cy) -> Core at (cx, cy)
  applyBuildCommand(state, {
    type: 'place',
    x: cx - 2,
    y: cy,
    blockType: 'miner',
    direction: 'E',
  });
  applyBuildCommand(state, {
    type: 'place',
    x: cx - 1,
    y: cy,
    blockType: 'belt',
    direction: 'E',
  });

  // Iron vein at (cx, cy - 2) -> belt at (cx, cy - 1) -> Core at (cx, cy)
  applyBuildCommand(state, {
    type: 'place',
    x: cx,
    y: cy - 2,
    blockType: 'miner',
    direction: 'S',
  });
  applyBuildCommand(state, {
    type: 'place',
    x: cx,
    y: cy - 1,
    blockType: 'belt',
    direction: 'S',
  });

  // South Copper vein at (cx, cy + 2) -> Bolt Turret at (cx, cy + 3)
  applyBuildCommand(state, {
    type: 'place',
    x: cx,
    y: cy + 2,
    blockType: 'miner',
    direction: 'S',
  });
  applyBuildCommand(state, {
    type: 'place',
    x: cx,
    y: cy + 3,
    blockType: 'bolt_turret',
    direction: 'S',
  });

  state.lastEventMessage =
    'Starter Blueprint deployed: 2 Core Economy lines + 1 Perimeter Bolt Turret line active!';
}
