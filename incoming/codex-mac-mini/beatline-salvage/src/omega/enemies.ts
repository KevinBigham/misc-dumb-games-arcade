import { Vec2, angleBetween, dist, fromAngle, lerpAngle } from './math';

export type EnemyType =
  | 'swarmer'
  | 'phalanx'
  | 'sniper'
  | 'breacher'
  | 'weaver'
  | 'pylon'
  | 'assassin'
  | 'juggernaut';

export interface EnemySpec {
  type: EnemyType;
  name: string;
  role: string;
  baseHp: number;
  speed: number;
  radius: number;
  color: string;
  scoreValue: number;
  xpValue: number;
  contactDamage: number;
}

export const ENEMY_SPECS: Record<EnemyType, EnemySpec> = {
  swarmer: {
    type: 'swarmer',
    name: 'Razor Swarmer',
    role: 'High-speed flocking assault drone',
    baseHp: 30,
    speed: 235,
    radius: 13,
    color: '#ff2a85',
    scoreValue: 50,
    xpValue: 10,
    contactDamage: 14,
  },
  phalanx: {
    type: 'phalanx',
    name: 'Aegis Phalanx',
    role: 'Directional energy shield unit — flank, rail-pierce, or parry its plasma bolts',
    baseHp: 95,
    speed: 125,
    radius: 20,
    color: '#38bdf8',
    scoreValue: 140,
    xpValue: 22,
    contactDamage: 20,
  },
  sniper: {
    type: 'sniper',
    name: 'Viper Lock-On Sniper',
    role: 'Projects a crimson targeting laser before firing high-velocity plasma lances',
    baseHp: 58,
    speed: 145,
    radius: 16,
    color: '#ff0844',
    scoreValue: 160,
    xpValue: 24,
    contactDamage: 12,
  },
  breacher: {
    type: 'breacher',
    name: 'Volatile Breacher Pod',
    role: 'Charges at hyper-speed and detonates into an 8-way shrapnel ring on destruction',
    baseHp: 65,
    speed: 280,
    radius: 17,
    color: '#ff9a00',
    scoreValue: 130,
    xpValue: 20,
    contactDamage: 28,
  },
  weaver: {
    type: 'weaver',
    name: 'Gravity Weaver',
    role: 'Warps the arena grid and fires decelerating dark-matter orbs',
    baseHp: 125,
    speed: 110,
    radius: 22,
    color: '#b721ff',
    scoreValue: 210,
    xpValue: 32,
    contactDamage: 18,
  },
  pylon: {
    type: 'pylon',
    name: 'Necro-Shield Pylon',
    role: 'Projects invulnerability tethers to nearby drones until the Pylon is destroyed',
    baseHp: 155,
    speed: 55,
    radius: 24,
    color: '#00f2fe',
    scoreValue: 240,
    xpValue: 38,
    contactDamage: 15,
  },
  assassin: {
    type: 'assassin',
    name: 'Phantom Blink-Stalker',
    role: 'Teleports behind your Mech and unleashes twin crescent blades',
    baseHp: 110,
    speed: 255,
    radius: 17,
    color: '#f43f5e',
    scoreValue: 220,
    xpValue: 34,
    contactDamage: 24,
  },
  juggernaut: {
    type: 'juggernaut',
    name: 'Void Juggernaut',
    role: 'Heavy siege mini-boss armed with rotary plasma cannons and shockwave slams',
    baseHp: 460,
    speed: 95,
    radius: 34,
    color: '#facc15',
    scoreValue: 650,
    xpValue: 95,
    contactDamage: 35,
  },
};

export interface EnemyEntity {
  id: number;
  type: EnemyType;
  pos: Vec2;
  vel: Vec2;
  knockbackVel: Vec2;
  bowlingTimer: number; // >0 when launched by a 99-POW Hit-Stick tackle!
  protacTimer: number; // >0 when docked with a PROTAC covalent warhead (+45% damage taken)
  radius: number;
  hp: number;
  maxHp: number;
  angle: number;
  color: string;
  fireTimer: number;
  specialTimer: number;
  telegraphRatio: number;
  chillTimer: number;
  burnTimer: number;
  hitFlash: number;
  shieldedByPylon: boolean;
}

export interface EnemySpawnProjectile {
  pos: Vec2;
  vel: Vec2;
  radius: number;
  damage: number;
  color: string;
}

export function createEnemy(
  id: number,
  type: EnemyType,
  pos: Vec2,
  waveMultiplier = 1
): EnemyEntity {
  const spec = ENEMY_SPECS[type];
  const scaledHp = Math.round(spec.baseHp * waveMultiplier);
  return {
    id,
    type,
    pos: { ...pos },
    vel: { x: 0, y: 0 },
    knockbackVel: { x: 0, y: 0 },
    bowlingTimer: 0,
    protacTimer: 0,
    radius: spec.radius,
    hp: scaledHp,
    maxHp: scaledHp,
    angle: 0,
    color: spec.color,
    fireTimer: 1.1 + Math.random() * 1.2,
    specialTimer: 2.2 + Math.random() * 1.5,
    telegraphRatio: 0,
    chillTimer: 0,
    burnTimer: 0,
    hitFlash: 0,
    shieldedByPylon: false,
  };
}

export function updateEnemyAI(
  enemy: EnemyEntity,
  dt: number,
  playerPos: Vec2
): EnemySpawnProjectile[] {
  const spec = ENEMY_SPECS[enemy.type];
  const spawnedBullets: EnemySpawnProjectile[] = [];

  if (enemy.hitFlash > 0) enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 5);
  if (enemy.chillTimer > 0) enemy.chillTimer = Math.max(0, enemy.chillTimer - dt);
  if (enemy.burnTimer > 0) enemy.burnTimer = Math.max(0, enemy.burnTimer - dt);
  if (enemy.protacTimer > 0) enemy.protacTimer = Math.max(0, enemy.protacTimer - dt);
  if (enemy.bowlingTimer > 0) enemy.bowlingTimer = Math.max(0, enemy.bowlingTimer - dt);

  const chillFactor = enemy.chillTimer > 0 ? 0.58 : 1;
  const moveSpeed = spec.speed * chillFactor;
  const toPlayerAngle = angleBetween(enemy.pos, playerPos);
  const d = dist(enemy.pos, playerPos);

  if (enemy.type === 'phalanx') {
    enemy.angle = lerpAngle(enemy.angle, toPlayerAngle, dt * 3.2);
  } else {
    enemy.angle = lerpAngle(enemy.angle, toPlayerAngle, dt * 8.0);
  }

  if (enemy.type === 'sniper') {
    const preferredDist = 420;
    const dir = d > preferredDist + 40 ? 1 : d < preferredDist - 60 ? -0.75 : 0.15;
    const vec = fromAngle(toPlayerAngle, moveSpeed * dir);
    const strafe = fromAngle(toPlayerAngle + Math.PI * 0.5, moveSpeed * 0.45);
    enemy.vel.x = vec.x + strafe.x;
    enemy.vel.y = vec.y + strafe.y;

    enemy.fireTimer -= dt * chillFactor;
    if (enemy.fireTimer < 0.85 && enemy.fireTimer > 0) {
      enemy.telegraphRatio = 1 - enemy.fireTimer / 0.85;
    } else {
      enemy.telegraphRatio = 0;
    }

    if (enemy.fireTimer <= 0) {
      enemy.fireTimer = 2.6;
      enemy.telegraphRatio = 0;
      const shotVel = fromAngle(toPlayerAngle, 760);
      spawnedBullets.push({
        pos: { ...enemy.pos },
        vel: shotVel,
        radius: 6,
        damage: 24,
        color: '#ff0844',
      });
    }
  } else if (enemy.type === 'assassin') {
    enemy.specialTimer -= dt * chillFactor;
    if (enemy.specialTimer <= 0 && d > 140 && d < 620) {
      enemy.specialTimer = 4.2;
      const behind = fromAngle(toPlayerAngle, d + 115);
      enemy.pos.x += behind.x;
      enemy.pos.y += behind.y;
      for (const offset of [-0.18, 0.18]) {
        const bAngle = angleBetween(enemy.pos, playerPos) + offset;
        spawnedBullets.push({
          pos: { ...enemy.pos },
          vel: fromAngle(bAngle, 480),
          radius: 7,
          damage: 18,
          color: '#f43f5e',
        });
      }
    }
    const v = fromAngle(toPlayerAngle, moveSpeed);
    enemy.vel.x = v.x;
    enemy.vel.y = v.y;
  } else if (enemy.type === 'phalanx') {
    const v = fromAngle(enemy.angle, moveSpeed);
    enemy.vel.x = v.x;
    enemy.vel.y = v.y;
    enemy.fireTimer -= dt * chillFactor;
    if (enemy.fireTimer <= 0 && d < 580) {
      enemy.fireTimer = 2.1;
      spawnedBullets.push({
        pos: { ...enemy.pos },
        vel: fromAngle(enemy.angle, 410),
        radius: 6,
        damage: 16,
        color: '#38bdf8',
      });
    }
  } else if (enemy.type === 'weaver') {
    const v = fromAngle(toPlayerAngle + 0.55, moveSpeed);
    enemy.vel.x = v.x;
    enemy.vel.y = v.y;
    enemy.fireTimer -= dt * chillFactor;
    if (enemy.fireTimer <= 0 && d < 650) {
      enemy.fireTimer = 2.5;
      for (let i = -1; i <= 1; i++) {
        spawnedBullets.push({
          pos: { ...enemy.pos },
          vel: fromAngle(toPlayerAngle + i * 0.25, 340),
          radius: 8,
          damage: 17,
          color: '#b721ff',
        });
      }
    }
  } else if (enemy.type === 'juggernaut') {
    const v = fromAngle(toPlayerAngle, moveSpeed);
    enemy.vel.x = v.x;
    enemy.vel.y = v.y;
    enemy.fireTimer -= dt * chillFactor;
    if (enemy.fireTimer <= 0 && d < 720) {
      enemy.fireTimer = 1.65;
      for (let i = 0; i < 6; i++) {
        const a = toPlayerAngle + (i - 2.5) * 0.18;
        spawnedBullets.push({
          pos: { ...enemy.pos },
          vel: fromAngle(a, 430),
          radius: 7,
          damage: 20,
          color: '#facc15',
        });
      }
    }
  } else {
    const v = fromAngle(toPlayerAngle, moveSpeed);
    enemy.vel.x = v.x;
    enemy.vel.y = v.y;
  }

  enemy.pos.x += (enemy.vel.x + enemy.knockbackVel.x) * dt;
  enemy.pos.y += (enemy.vel.y + enemy.knockbackVel.y) * dt;

  // Decay Hit-Stick knockback velocity
  const kbDecay = Math.pow(0.025, dt);
  enemy.knockbackVel.x *= kbDecay;
  enemy.knockbackVel.y *= kbDecay;

  return spawnedBullets;
}

export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  playerPos: Vec2
): void {
  ctx.save();
  ctx.translate(enemy.pos.x, enemy.pos.y);

  // Sniper lock-on sightline
  if (enemy.type === 'sniper' && enemy.telegraphRatio > 0) {
    const dx = playerPos.x - enemy.pos.x;
    const dy = playerPos.y - enemy.pos.y;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 8, 68, ${0.25 + enemy.telegraphRatio * 0.7})`;
    ctx.lineWidth = 1 + enemy.telegraphRatio * 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dx, dy);
    ctx.stroke();
    ctx.restore();
  }

  // PROTAC Covalent Warhead Ubiquitin Degradation Ring
  if (enemy.protacTimer > 0) {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shielded by Pylon halo
  if (enemy.shieldedByPylon) {
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(enemy.angle);

  const strokeColor =
    enemy.hitFlash > 0.1
      ? '#ffffff'
      : enemy.protacTimer > 0
      ? '#10b981'
      : enemy.chillTimer > 0
      ? '#7dd3fc'
      : enemy.color;

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle =
    enemy.hitFlash > 0.1 ? 'rgba(255,255,255,0.65)' : 'rgba(12, 16, 30, 0.88)';
  ctx.lineWidth = 2.4;

  const r = enemy.radius;
  ctx.beginPath();
  if (enemy.type === 'swarmer') {
    ctx.moveTo(r * 1.15, 0);
    ctx.lineTo(-r * 0.85, -r * 0.85);
    ctx.lineTo(-r * 0.4, 0);
    ctx.lineTo(-r * 0.85, r * 0.85);
    ctx.closePath();
  } else if (enemy.type === 'phalanx') {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * r * 0.85;
      const py = Math.sin(a) * r * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
    ctx.restore();
    return;
  } else if (enemy.type === 'juggernaut') {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.moveTo(r * 1.1, 0);
    ctx.lineTo(0, -r * 0.9);
    ctx.lineTo(-r, 0);
    ctx.lineTo(0, r * 0.9);
    ctx.closePath();
  }

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (enemy.hp < enemy.maxHp && enemy.maxHp >= 50) {
    const bw = enemy.radius * 1.9;
    const bh = 4;
    const bx = enemy.pos.x - bw * 0.5;
    const by = enemy.pos.y - enemy.radius - 11;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = enemy.protacTimer > 0 ? '#10b981' : enemy.color;
    ctx.fillRect(bx, by, bw * Math.max(0, enemy.hp / enemy.maxHp), bh);
  }
}

export function isBlockedByPhalanxShield(
  enemy: EnemyEntity,
  incomingPos: Vec2,
  pierceCount: number
): boolean {
  if (enemy.type !== 'phalanx' || pierceCount > 0) return false;
  const hitAngle = angleBetween(enemy.pos, incomingPos);
  let diff = ((hitAngle - enemy.angle + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= Math.PI * 0.42;
}
