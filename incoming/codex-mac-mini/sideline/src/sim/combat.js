import { DT, MAX_PROJECTILES } from '../contracts.js';

const HOSTILE_PROJECTILE_LIMIT = MAX_PROJECTILES - 128;

export function clampToArena(entity, arena, padding = entity.radius) {
  const dx = entity.x - arena.x, dy = entity.y - arena.y;
  const distance = Math.hypot(dx, dy), limit = arena.radius - padding;
  if (distance > limit) {entity.x = arena.x + dx / distance * limit; entity.y = arena.y + dy / distance * limit;}
}

export function spawnProjectile(world, shot, owner, events = [], kind = 'rifle') {
  if (owner === 'enemy' && world.projectiles.length >= HOSTILE_PROJECTILE_LIMIT) return null;
  if (world.projectiles.length >= MAX_PROJECTILES) {
    const hostile = world.projectiles.findIndex(projectile => projectile.owner === 'enemy');
    if (hostile < 0) return null;
    world.projectiles.splice(hostile, 1);
  }
  const projectile = {
    id: world.nextId++, x: shot.x, y: shot.y, prevX: shot.x, prevY: shot.y,
    vx: shot.dx * shot.speed, vy: shot.dy * shot.speed,
    radius: owner === 'enemy' ? 5 : 3, damage: shot.damage, pierce: shot.pierce,
    owner, kind, ttl: owner === 'enemy' ? 360 : 90, hitIds: [],
  };
  world.projectiles.push(projectile);
  events.push({type: 'shot', tick: world.tick, x: shot.x, y: shot.y, entityId: projectile.id, owner, kind});
  return projectile;
}

/** Earliest impact in [0,1], including a shot born inside the target. */
export function segmentCircle(x1, y1, x2, y2, cx, cy, radius) {
  const sx = x1 - cx, sy = y1 - cy, dx = x2 - x1, dy = y2 - y1;
  const c = sx * sx + sy * sy - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (sx * dx + sy * dy), discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}

export function rechargeFork(world, amount = 1) {
  const player = world.player;
  if (player.forkCharges >= 2) {player.forkRechargeTicks = 0; return;}
  player.forkRechargeTicks -= amount;
  if (player.forkRechargeTicks <= 0) {
    player.forkCharges++;
    player.forkRechargeTicks = player.forkCharges < 2 ? 360 : 0;
  }
}

export function damageEnemy(world, enemy, damage, owner, events) {
  if (enemy.hp <= 0 || enemy.spawnTicks > 0) return;
  const actual = Math.min(enemy.hp, damage);
  enemy.hp = Math.max(0, enemy.hp - damage);
  world.stats.damageDealt += actual;
  events.push({type: 'hit', tick: world.tick, x: enemy.x, y: enemy.y, entityId: enemy.id, owner, kind: enemy.kind || 'boss', amount: actual});
  if (enemy.hp > 0) return;
  const lastKill = world.killTicks.at(-1);
  if (lastKill === undefined || world.tick - lastKill > 120) world.streakKills = 0;
  world.killTicks = [world.tick];
  world.streakKills++;
  world.multiplier = Math.min(5, 1 + Math.floor(world.streakKills / 10));
  world.comboTicks = 120;
  world.stats.kills++;
  if (owner === 'echo') world.stats.echoKills++;
  const points = (enemy === world.boss ? 5000 : 100) * world.multiplier;
  world.score += points;
  rechargeFork(world, 18);
  events.push({type: 'kill', tick: world.tick, x: enemy.x, y: enemy.y, entityId: enemy.id, owner, kind: enemy.kind || 'boss', amount: points});
}

export function damagePlayer(world, damage, events, source = 'enemy') {
  const player = world.player;
  if (player.hp <= 0 || player.invulnTicks > 0) return false;
  const actual = Math.min(player.hp, damage);
  player.hp = Math.max(0, player.hp - damage);
  player.invulnTicks = 45;
  events.push({type: 'player-hit', tick: world.tick, x: player.x, y: player.y, amount: actual, owner: 'enemy', kind: source});
  return true;
}

export function updateProjectiles(world, events) {
  const player = world.player;
  for (const projectile of world.projectiles) {
    projectile.prevX = projectile.x; projectile.prevY = projectile.y;
    projectile.x += projectile.vx * DT; projectile.y += projectile.vy * DT;
    projectile.ttl--;
    if (projectile.owner === 'enemy') {
      // Relative motion catches both moving targets and fast projectiles.
      const hit = segmentCircle(projectile.prevX - player.prevX, projectile.prevY - player.prevY,
        projectile.x - player.x, projectile.y - player.y, 0, 0, projectile.radius + player.radius);
      if (hit !== null) {damagePlayer(world, projectile.damage, events, projectile.kind); projectile.ttl = 0;}
    } else {
      const targets = world.boss ? [...world.enemies, world.boss] : world.enemies;
      const hits = [];
      for (const target of targets) {
        if (target.hp <= 0 || target.spawnTicks > 0 || projectile.hitIds.includes(target.id)) continue;
        const hit = segmentCircle(projectile.prevX - (target.prevX ?? target.x), projectile.prevY - (target.prevY ?? target.y),
          projectile.x - target.x, projectile.y - target.y, 0, 0, projectile.radius + target.radius);
        if (hit !== null) hits.push({target, hit});
      }
      hits.sort((a, b) => a.hit - b.hit || a.target.id - b.target.id);
      for (const {target} of hits) {
        if (target.hp <= 0) continue;
        projectile.hitIds.push(target.id);
        damageEnemy(world, target, projectile.damage, projectile.owner, events);
        if (projectile.pierce <= 0) {projectile.ttl = 0; break;}
        projectile.pierce--;
      }
    }
    if (Math.hypot(projectile.x - world.arena.x, projectile.y - world.arena.y) > world.arena.radius + 80) projectile.ttl = 0;
  }
  world.projectiles = world.projectiles.filter(projectile => projectile.ttl > 0);
  world.enemies = world.enemies.filter(enemy => enemy.hp > 0);
}

export function updateEnemies(world, events) {
  const player = world.player;
  for (const enemy of world.enemies) {
    enemy.prevX = enemy.x; enemy.prevY = enemy.y;
    if (enemy.hp <= 0) continue;
    if (enemy.spawnTicks > 0) {enemy.spawnTicks--; continue;}
    const dx = player.x - enemy.x, dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1, ux = dx / distance, uy = dy / distance;
    enemy.aim = Math.atan2(dy, dx);
    if (enemy.kind === 'chaser') {
      enemy.x += ux * (82 + world.act * 4) * DT;
      enemy.y += uy * (82 + world.act * 4) * DT;
    } else if (enemy.kind === 'sentry') {
      const approach = distance > 205 ? 70 : distance < 135 ? -48 : 0;
      const orbit = (enemy.id % 2 ? 1 : -1) * 27;
      enemy.x += (ux * approach - uy * orbit) * DT;
      enemy.y += (uy * approach + ux * orbit) * DT;
      enemy.attackTicks--;
      if (enemy.attackTicks <= 0) {
        for (const offset of [-0.12, 0, 0.12]) {
          const angle = enemy.aim + offset;
          spawnProjectile(world, {x: enemy.x + ux * 19, y: enemy.y + uy * 19,
            dx: Math.cos(angle), dy: Math.sin(angle), speed: 210, damage: 10, pierce: 0}, 'enemy', events, 'sentry');
        }
        enemy.attackTicks = 150;
      }
    } else if (enemy.kind === 'lancer') {
      if (enemy.chargeTicks > 0) {
        enemy.x += Math.cos(enemy.chargeAngle) * 480 * DT;
        enemy.y += Math.sin(enemy.chargeAngle) * 480 * DT;
        enemy.aim = enemy.chargeAngle;
        enemy.chargeTicks--;
        if (enemy.chargeTicks === 0) enemy.attackTicks = 105;
      } else if (enemy.windupTicks > 0) {
        enemy.aim = enemy.chargeAngle;
        enemy.windupTicks--;
        if (enemy.windupTicks === 0) enemy.chargeTicks = 24;
      } else {
        enemy.attackTicks--;
        enemy.x += ux * 66 * DT; enemy.y += uy * 66 * DT;
        if (enemy.attackTicks <= 0) {
          enemy.targetX = player.x; enemy.targetY = player.y;
          enemy.chargeAngle = enemy.aim; enemy.windupTicks = 45;
        }
      }
    }
    clampToArena(enemy, world.arena);
  }
}

export function updateContacts(world, events) {
  const player = world.player;
  for (const enemy of world.enemies) {
    if (enemy.hp <= 0 || enemy.spawnTicks > 0) continue;
    if (segmentCircle(enemy.prevX - player.prevX, enemy.prevY - player.prevY,
      enemy.x - player.x, enemy.y - player.y, 0, 0, enemy.radius + player.radius) !== null) {
      damagePlayer(world, enemy.kind === 'lancer' && enemy.chargeTicks > 0 ? 20 : 14, events, enemy.kind);
    }
  }
  if (world.boss && world.boss.hp > 0 && Math.hypot(player.x - world.boss.x, player.y - world.boss.y) < world.boss.radius + player.radius) {
    damagePlayer(world, 18, events, 'boss');
  }
}
