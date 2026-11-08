import { HISTORY_TICKS, MIN_HISTORY_TICKS, FORK_RECHARGE_TICKS } from '../contracts.js';
import { damageEnemy, spawnProjectile } from './combat.js';

export function recordFrame(world, shots) {
  const player = world.player;
  player.history.push({x: player.x, y: player.y, aim: player.aim, shots: shots.map(shot => ({...shot}))});
  if (player.history.length > HISTORY_TICKS) player.history.shift();
}

export function activateFork(world, events) {
  const player = world.player;
  if (player.forkCharges <= 0 || player.history.length < MIN_HISTORY_TICKS) return false;
  const frames = player.history.map(frame => ({...frame, shots: frame.shots.map(shot => ({...shot}))}));
  const first = frames[0], fromX = player.x, fromY = player.y;
  player.x = first.x; player.y = first.y; player.prevX = first.x; player.prevY = first.y; player.aim = first.aim;
  player.history = [];
  player.forkCharges--;
  if (player.forkRechargeTicks <= 0) player.forkRechargeTicks = FORK_RECHARGE_TICKS;
  player.invulnTicks = Math.max(player.invulnTicks, 18);
  // Fork cancels an ongoing dash, but never refunds its cooldown.
  player.dashTicks = 0;
  const echo = {id: world.nextId++, x: first.x, y: first.y, prevX: first.x, prevY: first.y,
    aim: first.aim, frames, index: 0, bornTick: world.tick, damageScale: player.echoDamage};
  world.echoes.push(echo);
  if (world.echoes.length > 2) world.echoes.shift();
  world.stats.forks++;
  events.push({type: 'fork', tick: world.tick, x: first.x, y: first.y, fromX, fromY, entityId: echo.id, path: frames.map(({x, y}) => ({x, y}))});
  if (player.forkBurst) {
    const targets = world.boss ? [...world.enemies, world.boss] : world.enemies;
    for (const target of targets) if (Math.hypot(target.x - first.x, target.y - first.y) <= 90 + target.radius) damageEnemy(world, target, 40, 'player', events);
  }
  return true;
}

export function updateEchoes(world, events) {
  for (const echo of world.echoes) {
    if (echo.bornTick >= world.tick) continue;
    const frame = echo.frames[echo.index];
    if (!frame) continue;
    echo.prevX = echo.x; echo.prevY = echo.y;
    echo.x = frame.x; echo.y = frame.y; echo.aim = frame.aim;
    for (const shot of frame.shots) spawnProjectile(world, {...shot, damage: shot.damage * echo.damageScale}, 'echo', events, 'rifle');
    echo.index++;
  }
  world.echoes = world.echoes.filter(echo => echo.index < echo.frames.length);
}
