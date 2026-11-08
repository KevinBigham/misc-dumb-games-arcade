import {
  GAME_CONFIG,
  HazardType,
  HeroClassId,
  PotionColorId,
  PotionEffectId,
  TileType,
} from './config';
import {
  ARMOR_CATALOG,
  ArmorDef,
  HERO_CLASSES,
  MONSTER_TEMPLATES,
  POTION_COLORS,
  POTION_EFFECT_ORDER,
  POTION_EFFECTS,
  WEAPON_CATALOG,
  WeaponDef,
} from './content';
import { SeededRng } from './rng';

export interface GridPoint {
  x: number;
  y: number;
}

export interface RoomRect {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'entrance' | 'combat' | 'alchemy' | 'vault' | 'exit';
}

export interface TileHazard {
  type: HazardType;
  remainingTicks: number;
}

export type InventoryItem =
  | {
      id: string;
      kind: 'potion';
      color: PotionColorId;
    }
  | {
      id: string;
      kind: 'scroll_upgrade';
    };

export type FloorGroundItem =
  | {
      id: string;
      x: number;
      y: number;
      kind: 'potion';
      color: PotionColorId;
    }
  | {
      id: string;
      x: number;
      y: number;
      kind: 'scroll_upgrade';
    }
  | {
      id: string;
      x: number;
      y: number;
      kind: 'weapon';
      weapon: WeaponDef;
    }
  | {
      id: string;
      x: number;
      y: number;
      kind: 'armor';
      armor: ArmorDef;
    };

export interface BossTelegraph {
  name: string;
  tiles: GridPoint[];
  damage: number;
  stunTicks: number;
}

export interface MonsterActor {
  id: string;
  templateId: string;
  name: string;
  glyph: string;
  color: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  moveTicks: number;
  attackTicks: number;
  rangedRange?: number;
  inflictsStatus?: 'poison' | 'burn' | 'chill';
  isBoss: boolean;
  nextActTick: number;
  stunnedTicks: number;
  burningTicks: number;
  poisonedTicks: number;
  sunderedDefense: number;
  telegraph: BossTelegraph | null;
  telegraphCooldown: number;
  alerted: boolean;
}

export interface HeroActor {
  classId: HeroClassId;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  baseAttack: number;
  baseDefense: number;
  moveTicks: number;
  weapon: WeaponDef;
  weaponUpgrades: number;
  armor: ArmorDef;
  armorUpgrades: number;
  abilityUpgrades: number;
  abilityCooldownTicks: number;
  nextActTick: number;
  invisibleTicks: number;
  burningTicks: number;
  poisonedTicks: number;
  chilledTicks: number;
  firebrandTicks: number;
  iceArmorHp: number;
  inventory: InventoryItem[];
}

export interface FloorState {
  floorNumber: number;
  width: number;
  height: number;
  tiles: TileType[][];
  explored: boolean[][];
  visible: boolean[][];
  hazards: (TileHazard | null)[][];
  rooms: RoomRect[];
  entrancePos: GridPoint;
  stairsDownPos: GridPoint;
  alchemyPos: GridPoint | null;
  alchemyCharges: number;
  monsters: MonsterActor[];
  groundItems: FloorGroundItem[];
}

export interface RunEpitaph {
  id: string;
  timestamp: string;
  seed: number;
  seedLabel: string;
  heroClass: HeroClassId;
  heroClassName: string;
  outcome: 'victory' | 'defeat';
  floorReached: number;
  totalTicks: number;
  turnsTaken: number;
  monstersSlain: number;
  potionsIdentified: number;
  upgradesApplied: number;
  killedBy: string;
  lastFiveTurns: string[];
  tacticalLesson: string;
}

export interface GameState {
  seed: number;
  seedLabel: string;
  rngState: number;
  status: 'playing' | 'victory' | 'defeat';
  currentTick: number;
  turnsTaken: number;
  monstersSlain: number;
  upgradesApplied: number;
  colorToEffect: Record<PotionColorId, PotionEffectId>;
  effectToColor: Record<PotionEffectId, PotionColorId>;
  identifiedColors: Record<PotionColorId, boolean>;
  hero: HeroActor;
  floor: FloorState;
  combatLog: string[];
  recentTurnSummaries: string[];
  epitaph: RunEpitaph | null;
  debugRevealAll: boolean;
}

export type GameCommand =
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'WAIT' }
  | { type: 'DRINK_POTION'; slotIndex: number }
  | { type: 'THROW_POTION'; slotIndex: number; targetX: number; targetY: number }
  | {
      type: 'USE_SCROLL_UPGRADE';
      slotIndex: number;
      choice: 'weapon' | 'armor' | 'ability';
    }
  | { type: 'USE_CLASS_ABILITY'; targetX?: number; targetY?: number }
  | { type: 'USE_ALCHEMY_DESK'; slotIndex?: number }
  | { type: 'DESCEND_STAIRS' };

export interface ActionTickPreview {
  moveTicks: number;
  attackTicks: number;
  abilityTicks: number;
  doubleTurnMonstersOnAttack: string[];
  doubleTurnMonstersOnMove: string[];
}

export function buildPotionColorMap(seed: number): {
  colorToEffect: Record<PotionColorId, PotionEffectId>;
  effectToColor: Record<PotionEffectId, PotionColorId>;
} {
  const rng = new SeededRng((seed ^ 0x9e3779b9) >>> 0);
  const shuffledEffects = rng.shuffle(POTION_EFFECT_ORDER);
  const colorToEffect = {} as Record<PotionColorId, PotionEffectId>;
  const effectToColor = {} as Record<PotionEffectId, PotionColorId>;

  POTION_COLORS.forEach((colorDef, idx) => {
    const effect = shuffledEffects[idx];
    colorToEffect[colorDef.id] = effect;
    effectToColor[effect] = colorDef.id;
  });

  return { colorToEffect, effectToColor };
}

export function isWalkableTile(tile: TileType): boolean {
  return tile !== 'wall';
}

export function findShortestPath(
  tiles: TileType[][],
  start: GridPoint,
  goal: GridPoint,
): GridPoint[] | null {
  const height = tiles.length;
  const width = tiles[0]?.length ?? 0;
  if (
    start.x < 0 ||
    start.x >= width ||
    start.y < 0 ||
    start.y >= height ||
    goal.x < 0 ||
    goal.x >= width ||
    goal.y < 0 ||
    goal.y >= height
  ) {
    return null;
  }
  if (!isWalkableTile(tiles[start.y][start.x]) || !isWalkableTile(tiles[goal.y][goal.x])) {
    return null;
  }

  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false),
  );
  const parent: (GridPoint | null)[][] = Array.from({ length: height }, () =>
    Array(width).fill(null),
  );

  const queue: GridPoint[] = [{ x: start.x, y: start.y }];
  visited[start.y][start.x] = true;

  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === goal.x && curr.y === goal.y) {
      const path: GridPoint[] = [];
      let step: GridPoint | null = curr;
      while (step) {
        path.push(step);
        step = parent[step.y][step.x];
      }
      path.reverse();
      return path;
    }

    for (const d of dirs) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited[ny][nx] &&
        isWalkableTile(tiles[ny][nx])
      ) {
        visited[ny][nx] = true;
        parent[ny][nx] = curr;
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return null;
}

function carveCorridor(tiles: TileType[][], from: GridPoint, to: GridPoint, rng: SeededRng): void {
  let x = from.x;
  let y = from.y;
  const horizontalFirst = rng.next() < 0.5;

  const stepTile = (cx: number, cy: number) => {
    if (
      cy > 0 &&
      cy < tiles.length - 1 &&
      cx > 0 &&
      cx < tiles[0].length - 1 &&
      tiles[cy][cx] === 'wall'
    ) {
      tiles[cy][cx] = 'floor';
    }
  };

  if (horizontalFirst) {
    while (x !== to.x) {
      stepTile(x, y);
      x += x < to.x ? 1 : -1;
    }
    while (y !== to.y) {
      stepTile(x, y);
      y += y < to.y ? 1 : -1;
    }
    stepTile(to.x, to.y);
  } else {
    while (y !== to.y) {
      stepTile(x, y);
      y += y < to.y ? 1 : -1;
    }
    while (x !== to.x) {
      stepTile(x, y);
      x += x < to.x ? 1 : -1;
    }
    stepTile(to.x, to.y);
  }
}

export function generateFloor(
  floorNumber: number,
  seed: number,
  effectToColor: Record<PotionEffectId, PotionColorId>,
  heroClassId: HeroClassId = 'vanguard',
): FloorState {
  const width = GAME_CONFIG.GRID_WIDTH;
  const height = GAME_CONFIG.GRID_HEIGHT;
  const floorSeed = ((seed ^ Math.imul(floorNumber, 0x85ebca6b)) >>> 0) || 1;
  const rng = new SeededRng(floorSeed);

  const tiles: TileType[][] = Array.from({ length: height }, () =>
    Array<TileType>(width).fill('wall'),
  );
  const explored: boolean[][] = Array.from({ length: height }, () =>
    Array<boolean>(width).fill(false),
  );
  const visible: boolean[][] = Array.from({ length: height }, () =>
    Array<boolean>(width).fill(false),
  );
  const hazards: (TileHazard | null)[][] = Array.from({ length: height }, () =>
    Array<TileHazard | null>(width).fill(null),
  );

  // Structured 3x2 sector layout (inspired by RegularLevel room graph) guaranteeing 6 well-spaced rooms
  const sectors = [
    { sx: 1, sy: 1, sw: 7, sh: 7 },
    { sx: 9, sy: 1, sw: 7, sh: 7 },
    { sx: 17, sy: 1, sw: 8, sh: 7 },
    { sx: 1, sy: 9, sw: 7, sh: 8 },
    { sx: 9, sy: 9, sw: 7, sh: 8 },
    { sx: 17, sy: 9, sw: 8, sh: 8 },
  ];

  // Deterministic room order so entrance and exit are far apart
  const startTopLeft = rng.next() < 0.5;
  const orderedSectors = startTopLeft
    ? [sectors[0], sectors[3], sectors[1], sectors[4], sectors[2], sectors[5]]
    : [sectors[3], sectors[0], sectors[4], sectors[1], sectors[5], sectors[2]];

  const rooms: RoomRect[] = [];

  orderedSectors.forEach((sec, idx) => {
    const isBossRoom =
      idx === orderedSectors.length - 1 &&
      (floorNumber === GAME_CONFIG.MINI_BOSS_FLOOR ||
        floorNumber === GAME_CONFIG.FINAL_BOSS_FLOOR);
    const rw = isBossRoom ? Math.min(sec.sw, 6) : rng.nextInt(4, Math.min(6, sec.sw));
    const rh = isBossRoom ? Math.min(sec.sh, 6) : rng.nextInt(4, Math.min(6, sec.sh));
    const rx = sec.sx + rng.nextInt(0, Math.max(0, sec.sw - rw));
    const ry = sec.sy + rng.nextInt(0, Math.max(0, sec.sh - rh));

    let kind: RoomRect['kind'] = 'combat';
    if (idx === 0) kind = 'entrance';
    else if (idx === orderedSectors.length - 1) kind = 'exit';
    else if (idx === 2) kind = 'alchemy';
    else if (idx === 3) kind = 'vault';

    const room: RoomRect = { x: rx, y: ry, w: rw, h: rh, kind };
    rooms.push(room);

    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
          tiles[y][x] = 'floor';
        }
      }
    }
  });

  const roomCenter = (r: RoomRect): GridPoint => ({
    x: Math.floor(r.x + r.w / 2),
    y: Math.floor(r.y + r.h / 2),
  });

  // Connect sequential rooms and add a cross-loop corridor for tactical kiting
  for (let i = 0; i < rooms.length - 1; i++) {
    carveCorridor(tiles, roomCenter(rooms[i]), roomCenter(rooms[i + 1]), rng);
  }
  carveCorridor(tiles, roomCenter(rooms[1]), roomCenter(rooms[4]), rng);
  carveCorridor(tiles, roomCenter(rooms[0]), roomCenter(rooms[2]), rng);

  // Place doors on 1-tile choke transitions bordering rooms
  for (const r of rooms) {
    for (let x = r.x; x < r.x + r.w; x++) {
      const topY = r.y - 1;
      if (
        topY > 1 &&
        tiles[topY][x] === 'floor' &&
        tiles[topY][x - 1] === 'wall' &&
        tiles[topY][x + 1] === 'wall'
      ) {
        tiles[topY][x] = 'door';
      }
      const botY = r.y + r.h;
      if (
        botY < height - 2 &&
        tiles[botY][x] === 'floor' &&
        tiles[botY][x - 1] === 'wall' &&
        tiles[botY][x + 1] === 'wall'
      ) {
        tiles[botY][x] = 'door';
      }
    }
  }

  const entranceRoom = rooms[0];
  const exitRoom = rooms[rooms.length - 1];
  const alchemyRoom = rooms.find((r) => r.kind === 'alchemy') ?? rooms[2];
  const vaultRoom = rooms.find((r) => r.kind === 'vault') ?? rooms[3];

  const entrancePos = roomCenter(entranceRoom);
  const stairsDownPos = roomCenter(exitRoom);
  tiles[entrancePos.y][entrancePos.x] = 'stairs_up';
  tiles[stairsDownPos.y][stairsDownPos.x] = 'stairs_down';

  // Ensure connectivity with BFS; if blocked for any reason, carve direct fallback corridor
  if (!findShortestPath(tiles, entrancePos, stairsDownPos)) {
    carveCorridor(tiles, entrancePos, stairsDownPos, rng);
    tiles[entrancePos.y][entrancePos.x] = 'stairs_up';
    tiles[stairsDownPos.y][stairsDownPos.x] = 'stairs_down';
  }

  // Place Alchemy Desk in alchemy room
  const alchemyPos: GridPoint = {
    x: alchemyRoom.x + Math.min(alchemyRoom.w - 1, 1),
    y: alchemyRoom.y + Math.min(alchemyRoom.h - 1, 1),
  };
  if (
    (alchemyPos.x === entrancePos.x && alchemyPos.y === entrancePos.y) ||
    (alchemyPos.x === stairsDownPos.x && alchemyPos.y === stairsDownPos.y)
  ) {
    alchemyPos.x = Math.min(width - 2, alchemyPos.x + 1);
  }
  tiles[alchemyPos.y][alchemyPos.x] = 'alchemy_desk';
  const alchemyCharges = 1 + HERO_CLASSES[heroClassId].alchemyBonusCharges;

  const occupied = new Set<string>([
    `${entrancePos.x},${entrancePos.y}`,
    `${stairsDownPos.x},${stairsDownPos.y}`,
    `${alchemyPos.x},${alchemyPos.y}`,
  ]);

  const pickFreeRoomTile = (room: RoomRect): GridPoint => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const px = rng.nextInt(room.x, room.x + room.w - 1);
      const py = rng.nextInt(room.y, room.y + room.h - 1);
      const key = `${px},${py}`;
      if (!occupied.has(key) && isWalkableTile(tiles[py][px])) {
        occupied.add(key);
        return { x: px, y: py };
      }
    }
    // Fallback scan across all walkable tiles
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const key = `${x},${y}`;
        if (!occupied.has(key) && tiles[y][x] === 'floor') {
          occupied.add(key);
          return { x, y };
        }
      }
    }
    return { x: entrancePos.x + 1, y: entrancePos.y };
  };

  // Supply-Bounded Item Generation (Generator.java guarantees)
  const groundItems: FloorGroundItem[] = [];
  let itemSeq = 1;

  // 1. Guaranteed Potion of Mending on EVERY floor so healing is reliable
  const healRoom = rng.pick([rooms[1], alchemyRoom, vaultRoom]);
  const healPos = pickFreeRoomTile(healRoom);
  groundItems.push({
    id: `f${floorNumber}_item_${itemSeq++}`,
    x: healPos.x,
    y: healPos.y,
    kind: 'potion',
    color: effectToColor.mending,
  });

  // 2. Guaranteed Progression Item: Scroll of Upgrade on odd floors, Potion of Might on even floors
  const progPos = pickFreeRoomTile(vaultRoom);
  if (floorNumber % 2 === 1) {
    groundItems.push({
      id: `f${floorNumber}_item_${itemSeq++}`,
      x: progPos.x,
      y: progPos.y,
      kind: 'scroll_upgrade',
    });
  } else {
    groundItems.push({
      id: `f${floorNumber}_item_${itemSeq++}`,
      x: progPos.x,
      y: progPos.y,
      kind: 'potion',
      color: effectToColor.might,
    });
  }

  // 3. Tactical Potion (Liquid Flame, Frost Mist, Caustic Gas, or Shadow Veil)
  const tacticalEffects: PotionEffectId[] = [
    'liquid_flame',
    'frost_mist',
    'caustic_gas',
    'shadow_veil',
  ];
  const chosenTactical = rng.pick(tacticalEffects);
  const tacRoom = rng.pick([rooms[1], rooms[2], rooms[4]]);
  const tacPos = pickFreeRoomTile(tacRoom);
  groundItems.push({
    id: `f${floorNumber}_item_${itemSeq++}`,
    x: tacPos.x,
    y: tacPos.y,
    kind: 'potion',
    color: effectToColor[chosenTactical],
  });

  // 4. Vault Weapon or Armor drop on floors 2, 4, 6, 8
  if (floorNumber % 2 === 0 && floorNumber <= 8) {
    const targetTier = Math.min(4, Math.floor(floorNumber / 2) + 1);
    const gearPos = pickFreeRoomTile(vaultRoom);
    if (floorNumber % 4 === 2) {
      const candidates = WEAPON_CATALOG.filter((w) => w.tier === targetTier);
      const weapon = candidates.length > 0 ? rng.pick(candidates) : WEAPON_CATALOG[3];
      groundItems.push({
        id: `f${floorNumber}_item_${itemSeq++}`,
        x: gearPos.x,
        y: gearPos.y,
        kind: 'weapon',
        weapon,
      });
    } else {
      const candidates = ARMOR_CATALOG.filter((a) => a.tier === targetTier);
      const armor = candidates.length > 0 ? rng.pick(candidates) : ARMOR_CATALOG[3];
      groundItems.push({
        id: `f${floorNumber}_item_${itemSeq++}`,
        x: gearPos.x,
        y: gearPos.y,
        kind: 'armor',
        armor,
      });
    }
  }

  // Spawn Monsters
  const monsters: MonsterActor[] = [];
  let monsterSeq = 1;
  const eligibleTemplates = MONSTER_TEMPLATES.filter(
    (m) => !m.isBoss && floorNumber >= m.minFloor && floorNumber <= m.maxFloor,
  );
  const fallbackPool =
    eligibleTemplates.length > 0 ? eligibleTemplates : [MONSTER_TEMPLATES[0]];

  // Spawn standard monsters in non-entrance rooms
  const spawnRooms = rooms.slice(1);
  for (let i = 0; i < spawnRooms.length; i++) {
    const room = spawnRooms[i];
    const isExit = room.kind === 'exit';

    // If this is Floor 5 or Floor 10 exit room, spawn the Boss!
    if (
      isExit &&
      (floorNumber === GAME_CONFIG.MINI_BOSS_FLOOR ||
        floorNumber === GAME_CONFIG.FINAL_BOSS_FLOOR)
    ) {
      const bossTemplate = MONSTER_TEMPLATES.find(
        (m) => m.isBoss && m.bossFloor === floorNumber,
      )!;
      const bossPos = pickFreeRoomTile(room);
      monsters.push({
        id: `f${floorNumber}_boss_${monsterSeq++}`,
        templateId: bossTemplate.id,
        name: bossTemplate.name,
        glyph: bossTemplate.glyph,
        color: bossTemplate.color,
        x: bossPos.x,
        y: bossPos.y,
        hp: bossTemplate.maxHp,
        maxHp: bossTemplate.maxHp,
        attack: bossTemplate.attack,
        defense: bossTemplate.defense,
        moveTicks: bossTemplate.moveTicks,
        attackTicks: bossTemplate.attackTicks,
        isBoss: true,
        nextActTick: bossTemplate.moveTicks,
        stunnedTicks: 0,
        burningTicks: 0,
        poisonedTicks: 0,
        sunderedDefense: 0,
        telegraph: null,
        telegraphCooldown: 0,
        alerted: false,
      });
      continue;
    }

    // Spawn 1 monster per room (or 2 in larger lower-floor combat rooms)
    const count = i === 2 && floorNumber >= 3 ? 2 : 1;
    for (let c = 0; c < count; c++) {
      const tpl = rng.pick(fallbackPool);
      const mPos = pickFreeRoomTile(room);
      monsters.push({
        id: `f${floorNumber}_mon_${monsterSeq++}`,
        templateId: tpl.id,
        name: tpl.name,
        glyph: tpl.glyph,
        color: tpl.color,
        x: mPos.x,
        y: mPos.y,
        hp: tpl.maxHp,
        maxHp: tpl.maxHp,
        attack: tpl.attack,
        defense: tpl.defense,
        moveTicks: tpl.moveTicks,
        attackTicks: tpl.attackTicks,
        rangedRange: tpl.rangedRange,
        inflictsStatus: tpl.inflictsStatus,
        isBoss: false,
        nextActTick: tpl.moveTicks,
        stunnedTicks: 0,
        burningTicks: 0,
        poisonedTicks: 0,
        sunderedDefense: 0,
        telegraph: null,
        telegraphCooldown: 0,
        alerted: false,
      });
    }
  }

  return {
    floorNumber,
    width,
    height,
    tiles,
    explored,
    visible,
    hazards,
    rooms,
    entrancePos,
    stairsDownPos,
    alchemyPos,
    alchemyCharges,
    monsters,
    groundItems,
  };
}

export function updateFieldOfView(floor: FloorState, heroX: number, heroY: number): void {
  const radius = GAME_CONFIG.FOV_RADIUS;
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      floor.visible[y][x] = false;
    }
  }

  const hasLineOfSight = (x0: number, y0: number, x1: number, y1: number): boolean => {
    let cx = x0;
    let cy = y0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (cx === x1 && cy === y1) return true;
      if (
        !(cx === x0 && cy === y0) &&
        (floor.tiles[cy][cx] === 'wall' || floor.tiles[cy][cx] === 'door')
      ) {
        return false;
      }
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  };

  for (let y = Math.max(0, heroY - radius); y <= Math.min(floor.height - 1, heroY + radius); y++) {
    for (
      let x = Math.max(0, heroX - radius);
      x <= Math.min(floor.width - 1, heroX + radius);
      x++
    ) {
      const distSq = (x - heroX) * (x - heroX) + (y - heroY) * (y - heroY);
      if (distSq <= radius * radius && hasLineOfSight(heroX, heroY, x, y)) {
        floor.visible[y][x] = true;
        floor.explored[y][x] = true;
      }
    }
  }
}

export function createInitialGameState(options: {
  seed: number;
  seedLabel?: string;
  heroClass?: HeroClassId;
  debug?: boolean;
}): GameState {
  const seed = options.seed >>> 0 || 20261106;
  const seedLabel = options.seedLabel ?? String(seed);
  const heroClassId = options.heroClass ?? 'vanguard';
  const classDef = HERO_CLASSES[heroClassId];

  const { colorToEffect, effectToColor } = buildPotionColorMap(seed);
  const identifiedColors: Record<PotionColorId, boolean> = {
    crimson: false,
    amber: false,
    viridian: false,
    azure: false,
    violet: false,
    obsidian: false,
  };

  for (const eff of classDef.preIdentifiedEffects) {
    const color = effectToColor[eff];
    identifiedColors[color] = true;
  }

  const inventory: InventoryItem[] = [];
  let initItemSeq = 1;
  for (const eff of classDef.startingPotions) {
    inventory.push({
      id: `init_item_${initItemSeq++}`,
      kind: 'potion',
      color: effectToColor[eff],
    });
  }
  if (classDef.startsWithUpgradeScroll) {
    inventory.push({
      id: `init_item_${initItemSeq++}`,
      kind: 'scroll_upgrade',
    });
  }

  const floor = generateFloor(1, seed, effectToColor, heroClassId);
  const maxHp = classDef.baseHp + classDef.startingArmor.maxHpBonus;

  const hero: HeroActor = {
    classId: heroClassId,
    name: classDef.name,
    x: floor.entrancePos.x,
    y: floor.entrancePos.y,
    hp: maxHp,
    maxHp,
    baseAttack: classDef.baseAttack,
    baseDefense: classDef.baseDefense,
    moveTicks: classDef.moveTicks,
    weapon: { ...classDef.startingWeapon },
    weaponUpgrades: 0,
    armor: { ...classDef.startingArmor },
    armorUpgrades: 0,
    abilityUpgrades: 0,
    abilityCooldownTicks: 0,
    nextActTick: 0,
    invisibleTicks: 0,
    burningTicks: 0,
    poisonedTicks: 0,
    chilledTicks: 0,
    firebrandTicks: 0,
    iceArmorHp: 0,
    inventory,
  };

  updateFieldOfView(floor, hero.x, hero.y);

  const preIdNames = classDef.preIdentifiedEffects
    .map((e) => `${POTION_EFFECTS[e].name} (${effectToColor[e].toUpperCase()})`)
    .join(', ');

  return {
    seed,
    seedLabel,
    rngState: seed,
    status: 'playing',
    currentTick: 0,
    turnsTaken: 0,
    monstersSlain: 0,
    upgradesApplied: 0,
    colorToEffect,
    effectToColor,
    identifiedColors,
    hero,
    floor,
    combatLog: [
      `[Tick 0] ${classDef.name} descends to Floor 1 (Seed: ${seedLabel}).`,
      `[Tick 0] Class Knowledge: ${preIdNames} is pre-identified!`,
    ],
    recentTurnSummaries: [],
    epitaph: null,
    debugRevealAll: Boolean(options.debug),
  };
}

export function getHeroAttackPower(hero: HeroActor): number {
  const fireBonus = hero.firebrandTicks > 0 ? 3 : 0;
  return hero.baseAttack + hero.weapon.attackBonus + hero.weaponUpgrades * 2 + fireBonus;
}

export function getHeroDefense(hero: HeroActor): number {
  return hero.baseDefense + hero.armor.defenseBonus + hero.armorUpgrades * 2;
}

export function getHeroAttackTicks(hero: HeroActor): number {
  const reduced = Math.max(7, hero.weapon.attackTicks - Math.floor(hero.weaponUpgrades / 2));
  return reduced + (hero.chilledTicks > 0 ? 3 : 0);
}

export function getHeroMoveTicks(hero: HeroActor): number {
  return hero.moveTicks + (hero.chilledTicks > 0 ? 3 : 0);
}

export function getPotionDisplayName(
  state: GameState,
  color: PotionColorId,
): { title: string; identified: boolean; effect: PotionEffectId } {
  const effect = state.colorToEffect[color];
  const identified = state.identifiedColors[color] || state.debugRevealAll;
  const colorDef = POTION_COLORS.find((c) => c.id === color)!;
  if (identified) {
    return {
      title: `${POTION_EFFECTS[effect].name} [${colorDef.label}]`,
      identified: true,
      effect,
    };
  }
  return {
    title: `Unidentified ${colorDef.label}`,
    identified: false,
    effect,
  };
}

export function getActionTickPreview(state: GameState): ActionTickPreview {
  const moveTicks = getHeroMoveTicks(state.hero);
  const attackTicks = getHeroAttackTicks(state.hero);
  const classDef = HERO_CLASSES[state.hero.classId];
  const abilityTicks = classDef.abilityCostTicks;

  const doubleTurnMonstersOnAttack: string[] = [];
  const doubleTurnMonstersOnMove: string[] = [];

  for (const m of state.floor.monsters) {
    if (m.hp <= 0 || m.stunnedTicks > 0) continue;
    const isVis =
      state.floor.visible[m.y]?.[m.x] ||
      Math.abs(m.x - state.hero.x) + Math.abs(m.y - state.hero.y) <= 2;
    if (!isVis) continue;

    const firstAct = m.nextActTick;
    const secondAct = firstAct + Math.min(m.moveTicks, m.attackTicks);
    if (secondAct <= state.currentTick + attackTicks) {
      doubleTurnMonstersOnAttack.push(m.name);
    }
    if (secondAct <= state.currentTick + moveTicks) {
      doubleTurnMonstersOnMove.push(m.name);
    }
  }

  return {
    moveTicks,
    attackTicks,
    abilityTicks,
    doubleTurnMonstersOnAttack,
    doubleTurnMonstersOnMove,
  };
}

function logEvent(state: GameState, message: string): void {
  const formatted = `[Tick ${state.currentTick}] ${message}`;
  state.combatLog.push(formatted);
  if (state.combatLog.length > 80) {
    state.combatLog.shift();
  }
  state.recentTurnSummaries.push(formatted);
  if (state.recentTurnSummaries.length > 5) {
    state.recentTurnSummaries.shift();
  }
}

function damageHero(state: GameState, rawAmount: number, sourceName: string): void {
  if (state.status !== 'playing' || rawAmount <= 0) return;

  let remaining = rawAmount;
  if (state.hero.iceArmorHp > 0) {
    const absorbed = Math.min(state.hero.iceArmorHp, remaining);
    state.hero.iceArmorHp -= absorbed;
    remaining -= absorbed;
  }

  if (remaining <= 0) {
    logEvent(state, `Ice Armor absorbs ${rawAmount} damage from ${sourceName}!`);
    return;
  }

  state.hero.hp = Math.max(0, state.hero.hp - remaining);
  if (state.hero.hp <= 0) {
    finalizePermadeath(state, sourceName);
  }
}

function finalizePermadeath(state: GameState, killedBy: string): void {
  state.status = 'defeat';
  logEvent(state, `PERMADEATH: Slain on Floor ${state.floor.floorNumber} by ${killedBy}!`);

  const hasMendingInBag = state.hero.inventory.some(
    (item) => item.kind === 'potion' && state.colorToEffect[item.color] === 'mending',
  );
  const identifiedCount = Object.values(state.identifiedColors).filter(Boolean).length;

  let tacticalLesson =
    'Use corridor doorways to fight monsters 1-on-1 and watch the Action-Cost Tick Preview to avoid enemy double-turns.';
  if (killedBy.includes('Potion of')) {
    tacticalLesson =
      'Drinking unknown vials at low HP is lethal if they contain Liquid Flame or Caustic Gas. Test unknown colors at an Alchemy Desk or THROW them at enemies first!';
  } else if (killedBy.includes('Slam') || killedBy.includes('Eruption')) {
    tacticalLesson =
      'Bosses telegraph multi-tile slams 1 turn in advance. Step out of red warning tiles or use Shield Bash / Frost Mist to stun the boss and cancel the slam!';
  } else if (hasMendingInBag) {
    tacticalLesson =
      'You fell with a Potion of Mending still in your pack! Drink healing draughts before dropping into critical single-hit range.';
  }

  state.epitaph = {
    id: `epitaph_${state.seed}_${state.currentTick}`,
    timestamp: new Date().toISOString(),
    seed: state.seed,
    seedLabel: state.seedLabel,
    heroClass: state.hero.classId,
    heroClassName: state.hero.name,
    outcome: 'defeat',
    floorReached: state.floor.floorNumber,
    totalTicks: state.currentTick,
    turnsTaken: state.turnsTaken,
    monstersSlain: state.monstersSlain,
    potionsIdentified: identifiedCount,
    upgradesApplied: state.upgradesApplied,
    killedBy,
    lastFiveTurns: [...state.recentTurnSummaries],
    tacticalLesson,
  };
}

function finalizeVictory(state: GameState): void {
  state.status = 'victory';
  logEvent(
    state,
    `VICTORY! ${state.hero.name} conquered all 10 floors and ascended from the Abyssal Core!`,
  );
  const identifiedCount = Object.values(state.identifiedColors).filter(Boolean).length;

  state.epitaph = {
    id: `victory_${state.seed}_${state.currentTick}`,
    timestamp: new Date().toISOString(),
    seed: state.seed,
    seedLabel: state.seedLabel,
    heroClass: state.hero.classId,
    heroClassName: state.hero.name,
    outcome: 'victory',
    floorReached: state.floor.floorNumber,
    totalTicks: state.currentTick,
    turnsTaken: state.turnsTaken,
    monstersSlain: state.monstersSlain,
    potionsIdentified: identifiedCount,
    upgradesApplied: state.upgradesApplied,
    killedBy: 'Survived & Conquered Floor 10',
    lastFiveTurns: [...state.recentTurnSummaries],
    tacticalLesson:
      'Masterful alchemy and turn-tick control! Try racing the same seed with another Hero Class.',
  };
}

function pickupItemsAtHero(state: GameState): void {
  const { hero, floor } = state;
  const remaining: FloorGroundItem[] = [];

  for (const item of floor.groundItems) {
    if (item.x !== hero.x || item.y !== hero.y) {
      remaining.push(item);
      continue;
    }

    if (item.kind === 'weapon') {
      const currentScore = hero.weapon.attackBonus - (hero.weapon.attackTicks - 10);
      const newScore = item.weapon.attackBonus - (item.weapon.attackTicks - 10);
      if (newScore >= currentScore) {
        hero.weapon = { ...item.weapon };
        logEvent(
          state,
          `Equipped ${item.weapon.name} (+${item.weapon.attackBonus} ATK, ${item.weapon.attackTicks}t)!`,
        );
      } else {
        logEvent(state, `Inspected ${item.weapon.name} (kept superior ${hero.weapon.name}).`);
      }
    } else if (item.kind === 'armor') {
      if (item.armor.defenseBonus >= hero.armor.defenseBonus) {
        const hpDiff = item.armor.maxHpBonus - hero.armor.maxHpBonus;
        hero.armor = { ...item.armor };
        if (hpDiff > 0) {
          hero.maxHp += hpDiff;
          hero.hp += hpDiff;
        }
        logEvent(
          state,
          `Equipped ${item.armor.name} (+${item.armor.defenseBonus} DEF, +${item.armor.maxHpBonus} Max HP)!`,
        );
      } else {
        logEvent(state, `Inspected ${item.armor.name} (kept superior ${hero.armor.name}).`);
      }
    } else {
      if (hero.inventory.length < GAME_CONFIG.MAX_INVENTORY_SLOTS) {
        if (item.kind === 'potion') {
          hero.inventory.push({ id: item.id, kind: 'potion', color: item.color });
          const disp = getPotionDisplayName(state, item.color);
          logEvent(state, `Picked up ${disp.title}.`);
        } else {
          hero.inventory.push({ id: item.id, kind: 'scroll_upgrade' });
          logEvent(state, `Picked up Scroll of Upgrade!`);
        }
      } else {
        logEvent(state, `Inventory full (6/6)! Drink or throw a vial to make room.`);
        remaining.push(item);
      }
    }
  }

  floor.groundItems = remaining;
}

function checkMonsterDeath(state: GameState, monster: MonsterActor): void {
  if (monster.hp > 0) return;
  state.monstersSlain += 1;
  monster.telegraph = null;
  logEvent(state, `Defeated ${monster.name}!`);

  if (monster.isBoss) {
    // Boss reward: heal +20 HP and drop a Scroll of Upgrade on the boss tile if not Floor 10
    const heal = Math.min(state.hero.maxHp - state.hero.hp, 24);
    if (heal > 0) {
      state.hero.hp += heal;
    }
    if (state.floor.floorNumber === GAME_CONFIG.MINI_BOSS_FLOOR) {
      state.floor.groundItems.push({
        id: `boss_reward_${state.currentTick}`,
        x: monster.x,
        y: monster.y,
        kind: 'scroll_upgrade',
      });
      logEvent(
        state,
        `The Iron Warden collapses! Floor 5 Stairs unlocked & Scroll of Upgrade dropped!`,
      );
    } else if (state.floor.floorNumber === GAME_CONFIG.FINAL_BOSS_FLOOR) {
      logEvent(
        state,
        `THE ABYSSAL CORE SHATTERS! Step onto the Sanctuary Stairs (>) to claim Victory!`,
      );
    }
  }

  state.floor.monsters = state.floor.monsters.filter((m) => m.hp > 0);
}

function performHeroMeleeAttack(state: GameState, monster: MonsterActor): number {
  const { hero } = state;
  const costTicks = getHeroAttackTicks(hero);
  const isAmbush = hero.invisibleTicks > 0;
  if (isAmbush) {
    hero.invisibleTicks = 0;
  }

  const rawAtk = getHeroAttackPower(hero);
  const multiplier = isAmbush ? 2.0 : 1.0;
  const effectiveDef = Math.max(0, monster.defense - monster.sunderedDefense);
  const dmg = Math.max(2, Math.round(rawAtk * multiplier) - effectiveDef);

  monster.hp = Math.max(0, monster.hp - dmg);
  monster.alerted = true;

  logEvent(
    state,
    `${isAmbush ? 'AMBUSH CRIT! ' : ''}You strike ${monster.name} with ${hero.weapon.name} for ${dmg} dmg (${costTicks} ticks).`,
  );

  checkMonsterDeath(state, monster);
  return costTicks;
}

function buildBossTelegraph(
  state: GameState,
  boss: MonsterActor,
): BossTelegraph {
  const tiles: GridPoint[] = [];
  const centerX = state.hero.x;
  const centerY = state.hero.y;

  // 3x3 slam centered on hero's current position
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = centerX + dx;
      const ty = centerY + dy;
      if (
        tx >= 1 &&
        tx < state.floor.width - 1 &&
        ty >= 1 &&
        ty < state.floor.height - 1 &&
        isWalkableTile(state.floor.tiles[ty][tx])
      ) {
        tiles.push({ x: tx, y: ty });
      }
    }
  }

  if (boss.templateId === 'abyssal_core') {
    // Plus extended cardinal rays 2 tiles out
    const rays = [
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
    ];
    for (const r of rays) {
      const tx = centerX + r.dx;
      const ty = centerY + r.dy;
      if (
        tx >= 1 &&
        tx < state.floor.width - 1 &&
        ty >= 1 &&
        ty < state.floor.height - 1 &&
        isWalkableTile(state.floor.tiles[ty][tx])
      ) {
        tiles.push({ x: tx, y: ty });
      }
    }
    return {
      name: 'Abyssal Void Eruption',
      tiles,
      damage: 28,
      stunTicks: 10,
    };
  }

  return {
    name: 'Seismic Chain Slam',
    tiles,
    damage: 24,
    stunTicks: 10,
  };
}

function advanceTimelineAndResolveActors(state: GameState, heroActionCostTicks: number): void {
  const { hero, floor } = state;
  const targetHeroTick = state.currentTick + heroActionCostTicks;
  hero.nextActTick = targetHeroTick;
  state.turnsTaken += 1;

  // Tick down hero buffs/debuffs
  if (hero.abilityCooldownTicks > 0) {
    hero.abilityCooldownTicks = Math.max(0, hero.abilityCooldownTicks - heroActionCostTicks);
  }
  if (hero.invisibleTicks > 0) {
    hero.invisibleTicks = Math.max(0, hero.invisibleTicks - heroActionCostTicks);
  }
  if (hero.chilledTicks > 0) {
    hero.chilledTicks = Math.max(0, hero.chilledTicks - heroActionCostTicks);
  }
  if (hero.firebrandTicks > 0) {
    hero.firebrandTicks = Math.max(0, hero.firebrandTicks - heroActionCostTicks);
  }

  // Hero standing on floor hazard or suffering DoT
  const heroTileHazard = floor.hazards[hero.y]?.[hero.x];
  if (heroTileHazard?.type === 'fire') {
    hero.burningTicks = Math.max(hero.burningTicks, 20);
  } else if (heroTileHazard?.type === 'caustic') {
    hero.poisonedTicks = Math.max(hero.poisonedTicks, 20);
  }

  if (hero.burningTicks > 0) {
    hero.burningTicks = Math.max(0, hero.burningTicks - heroActionCostTicks);
    logEvent(state, `Flames scorch you for 5 fire damage!`);
    damageHero(state, 5, 'Burning Flames (Potion of Liquid Flame)');
    if (state.status !== 'playing') return;
  }

  if (hero.poisonedTicks > 0) {
    hero.poisonedTicks = Math.max(0, hero.poisonedTicks - heroActionCostTicks);
    logEvent(state, `Caustic venom deals 5 poison damage!`);
    damageHero(state, 5, 'Caustic Poison (Potion of Caustic Gas)');
    if (state.status !== 'playing') return;
  }

  // Tick down floor tile hazards
  for (let y = 0; y < floor.height; y++) {
    for (let x = 0; x < floor.width; x++) {
      const h = floor.hazards[y][x];
      if (h) {
        h.remainingTicks -= heroActionCostTicks;
        if (h.remainingTicks <= 0) {
          floor.hazards[y][x] = null;
        }
      }
    }
  }

  // Resolve monster turns in chronological order up to targetHeroTick
  let safetyCounter = 0;
  while (state.status === 'playing' && safetyCounter < 60) {
    safetyCounter += 1;
    const readyMonsters = floor.monsters
      .filter((m) => m.hp > 0 && m.nextActTick <= targetHeroTick)
      .sort((a, b) => a.nextActTick - b.nextActTick);

    if (readyMonsters.length === 0) break;

    const mon = readyMonsters[0];
    state.currentTick = mon.nextActTick;

    // Monster tile hazards & DoTs
    const monHazard = floor.hazards[mon.y]?.[mon.x];
    if (monHazard?.type === 'fire') {
      mon.burningTicks = Math.max(mon.burningTicks, 20);
    } else if (monHazard?.type === 'caustic') {
      mon.poisonedTicks = Math.max(mon.poisonedTicks, 20);
      mon.sunderedDefense = Math.max(mon.sunderedDefense, 2);
    }

    if (mon.burningTicks > 0) {
      mon.burningTicks = Math.max(0, mon.burningTicks - 10);
      mon.hp = Math.max(0, mon.hp - 6);
      logEvent(state, `${mon.name} burns for 6 fire damage!`);
      if (mon.hp <= 0) {
        checkMonsterDeath(state, mon);
        continue;
      }
    }

    if (mon.poisonedTicks > 0) {
      mon.poisonedTicks = Math.max(0, mon.poisonedTicks - 10);
      mon.hp = Math.max(0, mon.hp - 6);
      logEvent(state, `${mon.name} takes 6 caustic gas damage!`);
      if (mon.hp <= 0) {
        checkMonsterDeath(state, mon);
        continue;
      }
    }

    if (mon.stunnedTicks > 0) {
      mon.stunnedTicks = Math.max(0, mon.stunnedTicks - 10);
      mon.telegraph = null;
      mon.nextActTick += mon.moveTicks;
      continue;
    }

    // If Boss has an active Telegraph, resolve it now!
    if (mon.telegraph) {
      const tg = mon.telegraph;
      mon.telegraph = null;
      mon.telegraphCooldown = 2;
      const hitHero = tg.tiles.some((t) => t.x === hero.x && t.y === hero.y);
      if (hitHero) {
        const reduced = Math.max(6, tg.damage - Math.floor(getHeroDefense(hero) / 2));
        logEvent(
          state,
          `BOSS SLAM! ${mon.name}'s ${tg.name} crushes you for ${reduced} damage!`,
        );
        damageHero(state, reduced, `${mon.name}'s ${tg.name}`);
      } else {
        logEvent(
          state,
          `You dodged ${mon.name}'s ${tg.name} as it shatters the flagstones!`,
        );
      }
      mon.nextActTick += mon.attackTicks;
      continue;
    }

    // Check if monster can sense hero
    const distManhattan = Math.abs(mon.x - hero.x) + Math.abs(mon.y - hero.y);
    const chebyshevDist = Math.max(Math.abs(mon.x - hero.x), Math.abs(mon.y - hero.y));
    if (floor.visible[mon.y]?.[mon.x] && hero.invisibleTicks <= 0) {
      mon.alerted = true;
    }

    if (!mon.alerted || hero.invisibleTicks > 0) {
      mon.nextActTick += mon.moveTicks;
      continue;
    }

    // Boss telegraph trigger when within 3 tiles
    if (mon.isBoss && chebyshevDist <= 3) {
      if (mon.telegraphCooldown <= 0) {
        mon.telegraph = buildBossTelegraph(state, mon);
        logEvent(
          state,
          `WARNING! ${mon.name} raises its weapon for ${mon.telegraph.name} — move out of red danger tiles!`,
        );
        mon.nextActTick += mon.attackTicks;
        continue;
      } else {
        mon.telegraphCooldown -= 1;
      }
    }

    // Adjacent or Ranged attack
    const canMelee = chebyshevDist === 1;
    const canRanged =
      Boolean(mon.rangedRange) &&
      chebyshevDist <= (mon.rangedRange ?? 1) &&
      floor.visible[mon.y]?.[mon.x];

    if (canMelee || canRanged) {
      const heroDef = getHeroDefense(hero);
      const dmg = Math.max(1, mon.attack - heroDef);
      logEvent(
        state,
        `${mon.name} ${canRanged && !canMelee ? 'blasts' : 'strikes'} you for ${dmg} dmg!`,
      );
      if (mon.inflictsStatus === 'poison' && hero.poisonedTicks <= 0) {
        hero.poisonedTicks = 20;
        logEvent(state, `${mon.name} inflicts Poison!`);
      } else if (mon.inflictsStatus === 'burn' && hero.burningTicks <= 0) {
        hero.burningTicks = 20;
        logEvent(state, `${mon.name}'s embers ignite you!`);
      }
      damageHero(state, dmg, mon.name);
      mon.nextActTick += mon.attackTicks;
      continue;
    }

    // Move 1 step toward hero
    if (distManhattan <= 12) {
      const stepCandidates: GridPoint[] = [];
      const dx = Math.sign(hero.x - mon.x);
      const dy = Math.sign(hero.y - mon.y);
      if (dx !== 0) stepCandidates.push({ x: mon.x + dx, y: mon.y });
      if (dy !== 0) stepCandidates.push({ x: mon.x, y: mon.y + dy });
      if (dx !== 0 && dy !== 0) stepCandidates.push({ x: mon.x + dx, y: mon.y + dy });

      let moved = false;
      for (const cand of stepCandidates) {
        if (
          cand.x >= 0 &&
          cand.x < floor.width &&
          cand.y >= 0 &&
          cand.y < floor.height &&
          isWalkableTile(floor.tiles[cand.y][cand.x]) &&
          !(cand.x === hero.x && cand.y === hero.y) &&
          !floor.monsters.some((other) => other.hp > 0 && other.x === cand.x && other.y === cand.y)
        ) {
          mon.x = cand.x;
          mon.y = cand.y;
          moved = true;
          break;
        }
      }
      if (!moved) {
        // Fallback BFS path step
        const path = findShortestPath(floor.tiles, { x: mon.x, y: mon.y }, { x: hero.x, y: hero.y });
        if (path && path.length >= 2) {
          const nextStep = path[1];
          if (
            !(nextStep.x === hero.x && nextStep.y === hero.y) &&
            !floor.monsters.some(
              (other) => other.hp > 0 && other.x === nextStep.x && other.y === nextStep.y,
            )
          ) {
            mon.x = nextStep.x;
            mon.y = nextStep.y;
          }
        }
      }
    }

    mon.nextActTick += mon.moveTicks;
  }

  state.currentTick = targetHeroTick;
  updateFieldOfView(floor, hero.x, hero.y);
}

export function applyCommand(state: GameState, command: GameCommand): GameState {
  if (state.status !== 'playing') return state;

  const { hero, floor } = state;

  switch (command.type) {
    case 'MOVE': {
      const tx = hero.x + command.dx;
      const ty = hero.y + command.dy;
      if (tx < 0 || tx >= floor.width || ty < 0 || ty >= floor.height) {
        return state;
      }

      const monsterAtTarget = floor.monsters.find(
        (m) => m.hp > 0 && m.x === tx && m.y === ty,
      );
      if (monsterAtTarget) {
        const atkCost = performHeroMeleeAttack(state, monsterAtTarget);
        advanceTimelineAndResolveActors(state, atkCost);
        return state;
      }

      if (!isWalkableTile(floor.tiles[ty][tx])) {
        return state;
      }

      hero.x = tx;
      hero.y = ty;
      pickupItemsAtHero(state);

      if (floor.tiles[ty][tx] === 'alchemy_desk' && floor.alchemyCharges > 0) {
        logEvent(
          state,
          `Standing at Alchemy Desk (${floor.alchemyCharges} charge${floor.alchemyCharges > 1 ? 's' : ''} left) — click [Identify Vial] to test an unknown potion safely!`,
        );
      } else if (floor.tiles[ty][tx] === 'stairs_down') {
        logEvent(
          state,
          `Standing on Stairs Down (>) — press [>] or click [Descend Floor] to advance!`,
        );
      }

      const moveCost = getHeroMoveTicks(hero);
      advanceTimelineAndResolveActors(state, moveCost);
      return state;
    }

    case 'WAIT': {
      const visibleThreats = floor.monsters.some(
        (m) => m.hp > 0 && floor.visible[m.y]?.[m.x],
      );
      if (!visibleThreats && hero.hp < hero.maxHp && hero.burningTicks === 0 && hero.poisonedTicks === 0) {
        hero.hp = Math.min(hero.maxHp, hero.hp + 1);
      }
      logEvent(state, `You wait and steady your breathing (${GAME_CONFIG.WAIT_TICKS} ticks).`);
      advanceTimelineAndResolveActors(state, GAME_CONFIG.WAIT_TICKS);
      return state;
    }

    case 'DRINK_POTION': {
      const item = hero.inventory[command.slotIndex];
      if (!item || item.kind !== 'potion') return state;

      hero.inventory.splice(command.slotIndex, 1);
      const color = item.color;
      const effect = state.colorToEffect[color];
      const wasIdentified = state.identifiedColors[color];
      state.identifiedColors[color] = true;
      const effectDef = POTION_EFFECTS[effect];

      if (!wasIdentified) {
        logEvent(
          state,
          `IDENTIFIED! ${color.toUpperCase()} VIAL is ${effectDef.name}!`,
        );
      }

      switch (effect) {
        case 'mending': {
          const heal = Math.max(28, Math.round(hero.maxHp * 0.45));
          hero.hp = Math.min(hero.maxHp, hero.hp + heal);
          hero.burningTicks = 0;
          hero.poisonedTicks = 0;
          hero.chilledTicks = 0;
          logEvent(
            state,
            `Drank ${effectDef.name}: Restored +${heal} HP and cleansed all ailments!`,
          );
          break;
        }
        case 'might': {
          hero.baseAttack += 2;
          hero.maxHp += 12;
          hero.hp = Math.min(hero.maxHp, hero.hp + 12);
          logEvent(
            state,
            `Drank ${effectDef.name}: Permanently gained +2 Base Attack and +12 Max HP!`,
          );
          break;
        }
        case 'shadow_veil': {
          hero.invisibleTicks = 50;
          logEvent(
            state,
            `Drank ${effectDef.name}: Cloaked in Invisibility for 50 ticks (next attack deals 2.0x Ambush Crit)!`,
          );
          break;
        }
        case 'liquid_flame': {
          hero.burningTicks = 30;
          hero.firebrandTicks = 40;
          logEvent(
            state,
            `HAZARD! Drank ${effectDef.name} — it scorches your throat (Burning for 30t, +3 Fire ATK)! Throw this color at enemies instead!`,
          );
          damageHero(state, 6, `Self-Drunk ${effectDef.name}`);
          break;
        }
        case 'frost_mist': {
          hero.chilledTicks = 20;
          hero.burningTicks = 0;
          hero.iceArmorHp = 6;
          logEvent(
            state,
            `Drank ${effectDef.name} — chills your limbs (+3t action cost for 20t, +6 Ice Armor)! Throw this color to freeze enemies!`,
          );
          break;
        }
        case 'caustic_gas': {
          hero.poisonedTicks = 30;
          logEvent(
            state,
            `HAZARD! Drank ${effectDef.name} — corrosive fumes choke you! Throw this color at enemy packs instead!`,
          );
          damageHero(state, 7, `Self-Drunk ${effectDef.name}`);
          break;
        }
      }

      if (state.status === 'playing') {
        advanceTimelineAndResolveActors(state, GAME_CONFIG.POTION_USE_TICKS);
      }
      return state;
    }

    case 'THROW_POTION': {
      const item = hero.inventory[command.slotIndex];
      if (!item || item.kind !== 'potion') return state;

      const tx = Math.max(1, Math.min(floor.width - 2, command.targetX));
      const ty = Math.max(1, Math.min(floor.height - 2, command.targetY));

      hero.inventory.splice(command.slotIndex, 1);
      const color = item.color;
      const effect = state.colorToEffect[color];
      const wasIdentified = state.identifiedColors[color];
      state.identifiedColors[color] = true;
      const effectDef = POTION_EFFECTS[effect];
      const classMult = HERO_CLASSES[hero.classId].thrownPotionMultiplier;

      if (!wasIdentified) {
        logEvent(
          state,
          `IDENTIFIED! Thrown ${color.toUpperCase()} VIAL is ${effectDef.name}!`,
        );
      }

      // Apply 3x3 splash around (tx, ty)
      const affectedMonsters: MonsterActor[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ax = tx + dx;
          const ay = ty + dy;
          if (ax < 0 || ax >= floor.width || ay < 0 || ay >= floor.height) continue;
          if (!isWalkableTile(floor.tiles[ay][ax])) continue;

          if (effect === 'liquid_flame') {
            floor.hazards[ay][ax] = { type: 'fire', remainingTicks: 30 };
          } else if (effect === 'frost_mist') {
            floor.hazards[ay][ax] = { type: 'frost', remainingTicks: 20 };
          } else if (effect === 'caustic_gas') {
            floor.hazards[ay][ax] = { type: 'caustic', remainingTicks: 40 };
          }

          const mon = floor.monsters.find((m) => m.hp > 0 && m.x === ax && m.y === ay);
          if (mon) affectedMonsters.push(mon);
        }
      }

      switch (effect) {
        case 'liquid_flame': {
          const burstDmg = Math.round(12 * classMult);
          for (const mon of affectedMonsters) {
            mon.hp = Math.max(0, mon.hp - burstDmg);
            mon.burningTicks = 30;
            mon.alerted = true;
            checkMonsterDeath(state, mon);
          }
          logEvent(
            state,
            `Threw ${effectDef.name} at (${tx},${ty}): Ignited 3x3 firestorm (${burstDmg} fire dmg + 30t burn to ${affectedMonsters.length} foe(s))!`,
          );
          break;
        }
        case 'frost_mist': {
          const coldDmg = Math.round(8 * classMult);
          for (const mon of affectedMonsters) {
            mon.hp = Math.max(0, mon.hp - coldDmg);
            mon.stunnedTicks = 20;
            mon.telegraph = null;
            mon.alerted = true;
            checkMonsterDeath(state, mon);
          }
          logEvent(
            state,
            `Threw ${effectDef.name} at (${tx},${ty}): Froze ${affectedMonsters.length} foe(s) solid for 20 ticks!`,
          );
          break;
        }
        case 'caustic_gas': {
          const acidDmg = Math.round(9 * classMult);
          for (const mon of affectedMonsters) {
            mon.hp = Math.max(0, mon.hp - acidDmg);
            mon.poisonedTicks = 40;
            mon.sunderedDefense = 2;
            mon.alerted = true;
            checkMonsterDeath(state, mon);
          }
          logEvent(
            state,
            `Threw ${effectDef.name} at (${tx},${ty}): Corrosive cloud hits ${affectedMonsters.length} foe(s) (${acidDmg} dmg, Poison & -2 DEF)!`,
          );
          break;
        }
        case 'shadow_veil': {
          for (const mon of affectedMonsters) {
            mon.stunnedTicks = 15;
            mon.telegraph = null;
          }
          logEvent(
            state,
            `Threw ${effectDef.name} at (${tx},${ty}): Blinded ${affectedMonsters.length} foe(s) for 15 ticks!`,
          );
          break;
        }
        case 'mending': {
          if (Math.abs(tx - hero.x) <= 1 && Math.abs(ty - hero.y) <= 1) {
            const splashHeal = 18;
            hero.hp = Math.min(hero.maxHp, hero.hp + splashHeal);
            logEvent(state, `Threw ${effectDef.name} nearby: Splash mist healed +${splashHeal} HP.`);
          } else {
            logEvent(
              state,
              `Threw ${effectDef.name} at (${tx},${ty}) — drink this color directly for full +45% HP healing!`,
            );
          }
          break;
        }
        case 'might': {
          logEvent(
            state,
            `Threw ${effectDef.name} at (${tx},${ty}) — the vial shatters! Drink this color next time for permanent +2 ATK & +12 Max HP!`,
          );
          break;
        }
      }

      advanceTimelineAndResolveActors(state, GAME_CONFIG.POTION_USE_TICKS);
      return state;
    }

    case 'USE_SCROLL_UPGRADE': {
      const item = hero.inventory[command.slotIndex];
      if (!item || item.kind !== 'scroll_upgrade') return state;

      hero.inventory.splice(command.slotIndex, 1);
      state.upgradesApplied += 1;
      const vanguardBonusHp = hero.classId === 'vanguard' ? 2 : 0;

      if (command.choice === 'weapon') {
        hero.weaponUpgrades += 1;
        if (vanguardBonusHp > 0) {
          hero.maxHp += vanguardBonusHp;
          hero.hp += vanguardBonusHp;
        }
        logEvent(
          state,
          `Scroll of Upgrade reforges ${hero.weapon.name} +${hero.weaponUpgrades} (+2 ATK, ${getHeroAttackTicks(hero)}t speed)!`,
        );
      } else if (command.choice === 'armor') {
        hero.armorUpgrades += 1;
        const hpGain = 10 + vanguardBonusHp;
        hero.maxHp += hpGain;
        hero.hp = Math.min(hero.maxHp, hero.hp + hpGain);
        logEvent(
          state,
          `Scroll of Upgrade reinforces ${hero.armor.name} +${hero.armorUpgrades} (+2 DEF, +${hpGain} Max HP)!`,
        );
      } else {
        hero.abilityUpgrades += 1;
        hero.abilityCooldownTicks = 0;
        logEvent(
          state,
          `Scroll of Upgrade empowers ${HERO_CLASSES[hero.classId].abilityName} +${hero.abilityUpgrades} & resets cooldown!`,
        );
      }

      advanceTimelineAndResolveActors(state, GAME_CONFIG.SCROLL_USE_TICKS);
      return state;
    }

    case 'USE_CLASS_ABILITY': {
      const classDef = HERO_CLASSES[hero.classId];
      if (hero.abilityCooldownTicks > 0) {
        logEvent(
          state,
          `${classDef.abilityName} is on cooldown (${hero.abilityCooldownTicks} ticks remaining).`,
        );
        return state;
      }

      if (hero.classId === 'vanguard') {
        // Shield Bash: hit adjacent monster
        const adj = floor.monsters.find(
          (m) =>
            m.hp > 0 &&
            Math.max(Math.abs(m.x - hero.x), Math.abs(m.y - hero.y)) <= 1,
        );
        if (!adj) {
          logEvent(state, `Shield Bash requires an adjacent monster within 1 tile!`);
          return state;
        }
        const dmg = Math.max(
          4,
          Math.round(getHeroAttackPower(hero) * (1.4 + hero.abilityUpgrades * 0.2)) -
            adj.defense,
        );
        adj.hp = Math.max(0, adj.hp - dmg);
        adj.stunnedTicks = 20 + hero.abilityUpgrades * 5;
        adj.telegraph = null;
        hero.abilityCooldownTicks = Math.max(
          40,
          classDef.abilityCooldownTicks - hero.abilityUpgrades * 10,
        );
        logEvent(
          state,
          `SHIELD BASH! Slammed ${adj.name} for ${dmg} dmg and Stunned it for ${adj.stunnedTicks} ticks!`,
        );
        checkMonsterDeath(state, adj);
      } else if (hero.classId === 'rogue') {
        // Smoke Bomb: invisibility + blind adjacent foes
        hero.invisibleTicks = 35 + hero.abilityUpgrades * 10;
        for (const mon of floor.monsters) {
          if (
            mon.hp > 0 &&
            Math.max(Math.abs(mon.x - hero.x), Math.abs(mon.y - hero.y)) <= 1
          ) {
            mon.stunnedTicks = 15;
            mon.telegraph = null;
          }
        }
        hero.abilityCooldownTicks = Math.max(
          40,
          classDef.abilityCooldownTicks - hero.abilityUpgrades * 10,
        );
        logEvent(
          state,
          `SMOKE BOMB! Vanished into Shadow Veil for ${hero.invisibleTicks} ticks (next hit deals 2.0x Ambush Crit)!`,
        );
      } else {
        // Arcane Alchemist: Arcane Catalyst Bolt at nearest visible monster within 5 tiles
        const targets = floor.monsters
          .filter(
            (m) =>
              m.hp > 0 &&
              Math.max(Math.abs(m.x - hero.x), Math.abs(m.y - hero.y)) <= 5 &&
              (floor.visible[m.y]?.[m.x] ||
                Math.abs(m.x - hero.x) + Math.abs(m.y - hero.y) <= 2),
          )
          .sort(
            (a, b) =>
              Math.abs(a.x - hero.x) +
              Math.abs(a.y - hero.y) -
              (Math.abs(b.x - hero.x) + Math.abs(b.y - hero.y)),
          );
        if (targets.length === 0) {
          logEvent(state, `Arcane Catalyst Bolt requires a visible enemy within 5 tiles!`);
          return state;
        }
        const target = targets[0];
        const boltDmg =
          12 + floor.floorNumber * 2 + hero.abilityUpgrades * 5;
        target.hp = Math.max(0, target.hp - boltDmg);
        target.sunderedDefense = Math.max(target.sunderedDefense, 2);
        target.alerted = true;
        hero.abilityCooldownTicks = Math.max(
          35,
          classDef.abilityCooldownTicks - hero.abilityUpgrades * 10,
        );
        logEvent(
          state,
          `ARCANE CATALYST BOLT! Blasted ${target.name} for ${boltDmg} arcane dmg & sundered -2 DEF!`,
        );
        checkMonsterDeath(state, target);
      }

      advanceTimelineAndResolveActors(state, classDef.abilityCostTicks);
      return state;
    }

    case 'USE_ALCHEMY_DESK': {
      if (!floor.alchemyPos || floor.alchemyCharges <= 0) {
        logEvent(state, `No active Alchemy Desk charges remaining on this floor.`);
        return state;
      }
      const dist =
        Math.max(
          Math.abs(hero.x - floor.alchemyPos.x),
          Math.abs(hero.y - floor.alchemyPos.y),
        );
      if (dist > 1) {
        logEvent(state, `Move onto or adjacent to the Alchemy Desk (⚗) to analyze a potion!`);
        return state;
      }

      // Find target unidentified potion in inventory
      let targetItem: Extract<InventoryItem, { kind: 'potion' }> | undefined;
      if (command.slotIndex !== undefined) {
        const cand = hero.inventory[command.slotIndex];
        if (cand && cand.kind === 'potion' && !state.identifiedColors[cand.color]) {
          targetItem = cand;
        }
      }
      if (!targetItem) {
        targetItem = hero.inventory.find(
          (it): it is Extract<InventoryItem, { kind: 'potion' }> =>
            it.kind === 'potion' && !state.identifiedColors[it.color],
        );
      }

      if (!targetItem) {
        // If all carried potions are already identified, identify the next unknown color in the run's table!
        const unknownColor = POTION_COLORS.find((c) => !state.identifiedColors[c.id]);
        if (!unknownColor) {
          logEvent(state, `All 6 Potion Colors are already identified for this run!`);
          return state;
        }
        state.identifiedColors[unknownColor.id] = true;
        floor.alchemyCharges -= 1;
        const eff = POTION_EFFECTS[state.colorToEffect[unknownColor.id]];
        logEvent(
          state,
          `ALCHEMY DESK: Distilled residue reveals ${unknownColor.label.toUpperCase()} is ${eff.name}!`,
        );
        advanceTimelineAndResolveActors(state, GAME_CONFIG.ALCHEMY_USE_TICKS);
        return state;
      }

      state.identifiedColors[targetItem.color] = true;
      floor.alchemyCharges -= 1;
      const eff = POTION_EFFECTS[state.colorToEffect[targetItem.color]];
      logEvent(
        state,
        `ALCHEMY DESK: Safely tested ${targetItem.color.toUpperCase()} VIAL — it is ${eff.name}! (Vial preserved)`,
      );
      advanceTimelineAndResolveActors(state, GAME_CONFIG.ALCHEMY_USE_TICKS);
      return state;
    }

    case 'DESCEND_STAIRS': {
      if (
        hero.x !== floor.stairsDownPos.x ||
        hero.y !== floor.stairsDownPos.y
      ) {
        logEvent(state, `Step onto the Stairs Down (>) tile to descend!`);
        return state;
      }

      const livingBoss = floor.monsters.find((m) => m.hp > 0 && m.isBoss);
      if (livingBoss) {
        logEvent(
          state,
          `The stairs are sealed by ${livingBoss.name}! Defeat the floor boss first!`,
        );
        return state;
      }

      if (floor.floorNumber >= GAME_CONFIG.MAX_FLOORS) {
        finalizeVictory(state);
        return state;
      }

      const nextFloorNum = floor.floorNumber + 1;
      const nextFloor = generateFloor(
        nextFloorNum,
        state.seed,
        state.effectToColor,
        hero.classId,
      );
      state.floor = nextFloor;
      hero.x = nextFloor.entrancePos.x;
      hero.y = nextFloor.entrancePos.y;
      hero.hp = Math.min(hero.maxHp, hero.hp + 10);

      for (const m of nextFloor.monsters) {
        m.nextActTick = state.currentTick + m.moveTicks;
      }

      updateFieldOfView(nextFloor, hero.x, hero.y);
      logEvent(
        state,
        `Descended to Floor ${nextFloorNum} (+10 HP breather recovery).${
          nextFloorNum === GAME_CONFIG.MINI_BOSS_FLOOR
            ? ' BEWARE: The Iron Warden patrols the exit chamber!'
            : nextFloorNum === GAME_CONFIG.FINAL_BOSS_FLOOR
              ? ' FINAL FLOOR: The Abyssal Core awaits!'
              : ''
        }`,
      );
      return state;
    }
  }
}
