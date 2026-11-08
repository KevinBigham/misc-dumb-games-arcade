import { ARENA, DT, EMPTY_INPUT } from '../contracts.js';
import { normalizeSeed } from './rng.js';
import { clampToArena, rechargeFork, spawnProjectile, updateContacts, updateEnemies, updateProjectiles } from './combat.js';
import { activateFork, recordFrame, updateEchoes } from './timeline.js';
import { checkProgression, updateBoss, updateSpawns } from './content.js';

export { applyUpgrade } from './content.js';

export function createWorld(seed = 1) {
  const normalized = normalizeSeed(seed);
  return {
    seed: normalized, rngState: normalized, tick: 0, phase: 'playing', act: 1, actTick: 0,
    arena: {...ARENA}, nextId: 1, enemies: [], projectiles: [], echoes: [], boss: null,
    score: 0, stats: {kills: 0, echoKills: 0, forks: 0, damageDealt: 0},
    upgradeOffers: [], multiplier: 1, comboTicks: 0, killTicks: [], streakKills: 0, nextSpawnTick: 90,
    player: {x: ARENA.x, y: ARENA.y, prevX: ARENA.x, prevY: ARENA.y, aim: -Math.PI / 2,
      hp: 100, maxHp: 100, radius: 11, invulnTicks: 0, dashTicks: 0, dashCooldown: 0,
      dashVX: 0, dashVY: 0, fireCooldown: 0, fireRate: 8, damage: 20, pierce: 0,
      forkCharges: 2, forkRechargeTicks: 0, history: [], upgrades: [], echoDamage: 0.6, forkBurst: false},
  };
}

function finite(value, fallback = 0) {return Number.isFinite(value) ? value : fallback;}

export function stepWorld(world, rawInput = EMPTY_INPUT) {
  if (world.phase !== 'playing') return [];
  const input = rawInput || EMPTY_INPUT, player = world.player;
  const events = [];
  world.tick++; world.actTick++;
  player.prevX = player.x; player.prevY = player.y;
  player.invulnTicks = Math.max(0, player.invulnTicks - 1);
  player.dashCooldown = Math.max(0, player.dashCooldown - 1);
  if (player.fireCooldown > 0) player.fireCooldown--;
  rechargeFork(world);
  if (world.comboTicks > 0) world.comboTicks--;
  const lastKill = world.killTicks.at(-1);
  if (lastKill === undefined || world.tick - lastKill > 120) {world.multiplier = 1; world.killTicks = []; world.streakKills = 0;}

  const forked = Boolean(input.forkPressed) && activateFork(world, events);
  let moveX = finite(input.moveX), moveY = finite(input.moveY);
  const length = Math.hypot(moveX, moveY);
  if (length > 1) {moveX /= length; moveY /= length;}
  const aimX = finite(input.aimX, player.x + Math.cos(player.aim));
  const aimY = finite(input.aimY, player.y + Math.sin(player.aim));
  if (aimX !== player.x || aimY !== player.y) player.aim = Math.atan2(aimY - player.y, aimX - player.x);
  if (!forked && input.dashPressed && player.dashCooldown === 0) {
    const direction = length > 0 ? Math.atan2(moveY, moveX) : player.aim;
    player.dashVX = Math.cos(direction) * 880; player.dashVY = Math.sin(direction) * 880;
    player.dashTicks = 9; player.dashCooldown = 90; player.invulnTicks = Math.max(player.invulnTicks, 9);
    events.push({type: 'dash', tick: world.tick, x: player.x, y: player.y});
  }
  if (player.dashTicks > 0) {
    player.x += player.dashVX * DT; player.y += player.dashVY * DT; player.dashTicks--;
  } else {player.x += moveX * 260 * DT; player.y += moveY * 260 * DT;}
  clampToArena(player, world.arena);
  const shots = [];
  if (input.fire && player.fireCooldown <= 0) {
    const dx = Math.cos(player.aim), dy = Math.sin(player.aim);
    const shot = {x: player.x + dx * 17, y: player.y + dy * 17, dx, dy, speed: 900, damage: player.damage, pierce: player.pierce};
    if (spawnProjectile(world, shot, 'player', events)) {shots.push(shot); player.fireCooldown += 60 / player.fireRate;}
  } else if (!input.fire && player.fireCooldown < 0) player.fireCooldown = 0;
  updateEchoes(world, events);
  updateEnemies(world, events);
  updateSpawns(world);
  updateBoss(world, events);
  updateProjectiles(world, events);
  updateContacts(world, events);
  recordFrame(world, shots);
  checkProgression(world, events);
  return events;
}
