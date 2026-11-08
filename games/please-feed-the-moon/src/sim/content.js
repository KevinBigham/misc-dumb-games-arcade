import { ACT_TICKS, MAX_ENEMIES } from '../contracts.js';
import { random } from './rng.js';
import { damagePlayer, segmentCircle, spawnProjectile } from './combat.js';

export const UPGRADES = Object.freeze([
  {id: 'damage', name: 'Sun-forged Rounds', description: 'Your rifle deals 25% more damage.', flavor: 'A little of the dying sun, chambered.', icon: '✦'},
  {id: 'fire-rate', name: 'Quickened Pulse', description: 'Fire 20% faster.', flavor: 'The cathedral learns your heartbeat.', icon: '»'},
  {id: 'pierce', name: 'Throughline', description: 'Every rifle shot pierces one more enemy.', flavor: 'There is always someone behind the first.', icon: '↗'},
  {id: 'echo', name: 'Perfect Memory', description: 'Echoes deal 90% of recorded damage.', flavor: 'Your past sharpens its teeth.', icon: '◈'},
  {id: 'fork-burst', name: 'Arrival Shock', description: 'Fork deals 40 damage in a 90-radius burst.', flavor: 'You arrive like a broken bell.', icon: '◎'},
  {id: 'vitality', name: 'Second Heart', description: '+25 maximum health. Heal 25.', flavor: 'One more reason to keep beating.', icon: '+'},
]);

function upgradeOffers(world) {
  const pool = UPGRADES.filter(upgrade => !world.player.upgrades.includes(upgrade.id));
  const offers = [];
  while (offers.length < 3 && pool.length) offers.push({...pool.splice(Math.floor(random(world) * pool.length), 1)[0]});
  return offers;
}

function clearEncounter(world) {
  world.enemies = []; world.projectiles = []; world.echoes = []; world.player.history = [];
  world.player.hp = Math.min(world.player.maxHp, world.player.hp + 25);
  world.player.forkCharges = 2; world.player.forkRechargeTicks = 0;
  world.player.dashTicks = 0; world.player.dashCooldown = 0; world.player.fireCooldown = 0;
  world.player.invulnTicks = 60; world.killTicks = []; world.streakKills = 0; world.multiplier = 1; world.comboTicks = 0;
}

export function applyUpgrade(world, id) {
  if (world.phase !== 'upgrade' || !world.upgradeOffers.some(upgrade => upgrade.id === id) || world.player.upgrades.includes(id)) return [];
  const player = world.player;
  switch (id) {
    case 'damage': player.damage *= 1.25; break;
    case 'fire-rate': player.fireRate *= 1.2; break;
    case 'pierce': player.pierce++; break;
    case 'echo': player.echoDamage = 0.9; break;
    case 'fork-burst': player.forkBurst = true; break;
    case 'vitality': player.maxHp += 25; player.hp = Math.min(player.maxHp, player.hp + 25); break;
    default: return [];
  }
  player.upgrades.push(id);
  world.upgradeOffers = []; world.phase = 'playing'; world.act++; world.actTick = 0; world.nextSpawnTick = 60;
  return [{type: 'act-start', tick: world.tick, act: world.act}];
}

function spawnEnemy(world) {
  if (world.enemies.length >= MAX_ENEMIES) return;
  const roll = random(world);
  const kind = world.act === 1 ? 'chaser' : world.act === 2 ? (roll < 0.36 ? 'sentry' : 'chaser') : (roll < 0.27 ? 'lancer' : roll < 0.53 ? 'sentry' : 'chaser');
  let x = world.arena.x, y = world.arena.y, bestDistance = -1, best = null;
  for (let attempt = 0; attempt < 16; attempt++) {
    const angle = random(world) * Math.PI * 2, radius = world.arena.radius - 24;
    const candidateX = world.arena.x + Math.cos(angle) * radius, candidateY = world.arena.y + Math.sin(angle) * radius;
    const distance = Math.hypot(candidateX - world.player.x, candidateY - world.player.y);
    if (distance > bestDistance) {bestDistance = distance; best = {x: candidateX, y: candidateY};}
    if (distance >= 160 && world.enemies.every(enemy => Math.hypot(candidateX - enemy.x, candidateY - enemy.y) > 34)) {x = candidateX; y = candidateY; best = null; break;}
  }
  if (best) {
    // Do not turn a crowded spawn lane into an invisible collision wall.
    if (bestDistance < 160 || world.enemies.some(enemy => Math.hypot(best.x - enemy.x, best.y - enemy.y) <= 34)) return;
    ({x, y} = best);
  }
  const hp = kind === 'chaser' ? 40 : kind === 'sentry' ? 60 : 80;
  world.enemies.push({id: world.nextId++, kind, x, y, prevX: x, prevY: y,
    aim: Math.atan2(world.player.y - y, world.player.x - x), hp, maxHp: hp,
    radius: kind === 'chaser' ? 13 : 16, spawnTicks: 30, attackTicks: kind === 'sentry' ? 75 : 90,
    chargeTicks: 0, windupTicks: 0, chargeAngle: 0, targetX: world.player.x, targetY: world.player.y});
}

export function updateSpawns(world) {
  if (world.act > 3 || world.actTick < world.nextSpawnTick) return;
  spawnEnemy(world);
  const progress = world.actTick / ACT_TICKS;
  const interval = world.act === 1 ? (world.actTick < 480 ? 120 : 84 - progress * 24) : world.act === 2 ? 66 - progress * 18 : 58 - progress * 16;
  world.nextSpawnTick = world.actTick + Math.round(interval);
}

function startBoss(world, events) {
  world.act = 4; world.actTick = 0;
  world.boss = {id: world.nextId++, x: world.arena.x, y: world.arena.y - 42, prevX: world.arena.x, prevY: world.arena.y - 42,
    hp: 12000, maxHp: 12000, radius: 44, phase: 1, angle: 0, telegraphs: [], ringTicks: 75, beamTicks: 150, spiralTicks: 8};
  if (Math.hypot(world.player.x - world.boss.x, world.player.y - world.boss.y) < 130) {
    world.player.x = world.arena.x; world.player.y = world.arena.y + 170;
    world.player.prevX = world.player.x; world.player.prevY = world.player.y;
  }
  events.push({type: 'act-start', tick: world.tick, act: 4});
  events.push({type: 'boss-phase', tick: world.tick, x: world.boss.x, y: world.boss.y, phase: 1});
}

export function updateBoss(world, events) {
  const boss = world.boss;
  if (!boss || boss.hp <= 0) return;
  const nextPhase = boss.hp <= boss.maxHp * 0.33 ? 3 : boss.hp <= boss.maxHp * 0.66 ? 2 : 1;
  if (nextPhase !== boss.phase) {
    boss.phase = nextPhase;
    boss.beamTicks = Math.min(boss.beamTicks, 70);
    events.push({type: 'boss-phase', tick: world.tick, x: boss.x, y: boss.y, phase: boss.phase});
  }
  boss.angle += 0.006;
  boss.ringTicks--;
  if (boss.ringTicks <= 0) {
    const gap = Math.floor((world.actTick / 95) % 16);
    for (let i = 0; i < 16; i++) {
      if ((i - gap + 16) % 16 < 3) continue;
      const angle = i / 16 * Math.PI * 2 + boss.angle;
      spawnProjectile(world, {x: boss.x + Math.cos(angle) * 50, y: boss.y + Math.sin(angle) * 50,
        dx: Math.cos(angle), dy: Math.sin(angle), speed: 140 + boss.phase * 10, damage: 8, pierce: 0}, 'enemy', events, 'ring');
    }
    boss.ringTicks = boss.phase === 3 ? 105 : 100;
  }
  // Telegraphs advance before new ones are added: all 48 warning ticks are safe.
  for (const beam of boss.telegraphs) {
    if (beam.remainingTicks > 0) {
      beam.remainingTicks--;
      if (beam.remainingTicks > 0) continue;
    }
    const endX = boss.x + Math.cos(beam.angle) * 750, endY = boss.y + Math.sin(beam.angle) * 750;
    if (segmentCircle(boss.x, boss.y, endX, endY, world.player.x, world.player.y, world.player.radius + beam.width / 2) !== null) {
      damagePlayer(world, 18, events, 'beam');
    }
    beam.activeTicks--;
  }
  boss.telegraphs = boss.telegraphs.filter(beam => beam.remainingTicks > 0 || beam.activeTicks > 0);
  if (boss.phase >= 2) {
    boss.beamTicks--;
    if (boss.beamTicks <= 0) {
      boss.telegraphs.push({kind: 'beam', angle: Math.atan2(world.player.y - boss.y, world.player.x - boss.x), remainingTicks: 48, durationTicks: 48, width: 24, activeTicks: 12});
      boss.beamTicks = boss.phase === 3 ? 145 : 180;
    }
  }
  if (boss.phase === 3) {
    boss.spiralTicks--;
    if (boss.spiralTicks <= 0) {
      const angle = world.actTick * 0.055;
      for (let i = 0; i < 2; i++) {
        const direction = angle + i * Math.PI;
        spawnProjectile(world, {x: boss.x + Math.cos(direction) * 50, y: boss.y + Math.sin(direction) * 50,
          dx: Math.cos(direction), dy: Math.sin(direction), speed: 170, damage: 8, pierce: 0}, 'enemy', events, 'spiral');
      }
      boss.spiralTicks = 10;
    }
  }
}

export function checkProgression(world, events) {
  // Victory has explicit priority over player death in the same fixed step.
  if (world.boss && world.boss.hp <= 0) world.phase = 'won';
  else if (world.player.hp <= 0) world.phase = 'lost';
  if (world.phase === 'won' || world.phase === 'lost') {
    events.push({type: 'run-end', tick: world.tick, phase: world.phase, x: world.player.x, y: world.player.y});
    return;
  }
  if (world.act > 3 || world.actTick < ACT_TICKS) return;
  clearEncounter(world);
  if (world.act === 3) startBoss(world, events);
  else {
    world.phase = 'upgrade'; world.upgradeOffers = upgradeOffers(world);
    events.push({type: 'upgrade-ready', tick: world.tick, act: world.act});
  }
}
