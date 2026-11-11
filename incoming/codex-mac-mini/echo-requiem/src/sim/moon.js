import { MOON } from '../contracts.js';
import { random, normalizeSeed } from './rng.js';
import { MOON_UPGRADES, MOON_LAWS, MOON_LOADOUTS, MOON_DIFFICULTIES } from './moon-content.js';
export { MOON_UPGRADES, MOON_LAWS, MOON_LOADOUTS, MOON_DIFFICULTIES };

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const event = (w, type, data = {}) => w.events.push({ type, tick: w.tick, ...data });
const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
function points(w, amount) { w.score += Math.round(amount * w.rules.score); }
function badge(w, id) { if (!w.badges.includes(id)) { w.badges.push(id); event(w, 'badge', { id }); } }
function discover(w, id) { if (!w.discovered.includes(id)) w.discovered.push(id); }
const quotaFor = w => MOON.quotas[w.shift - 1] + Math.min(36, w.cycle * 6);

export function createMoonWorld(seed = 404, options = {}) {
  const loadout = MOON_LOADOUTS.find(item => item.id === options.loadout) || MOON_LOADOUTS[0];
  const rules = MOON_DIFFICULTIES.find(item => item.id === options.difficulty) || MOON_DIFFICULTIES[1];
  const hp = loadout.hp + rules.hp;
  return {
    seed: normalizeSeed(seed), rngState: normalizeSeed(seed), tick: 0, phase: 'playing', shift: 1, cycle: 0,
    difficulty: rules.id, loadout: loadout.id, runMode: options.mode === 'daily' ? 'daily' : 'free', rules: { ...rules },
    shiftTick: 0, nextId: 1, rent: 0, totalFed: 0, quota: MOON.quotas[0], score: 0, combo: 0, comboTicks: 0, kills: 0,
    law: null, previousLaw: null, lawTicks: 0, spawnTicks: 30, spawnCount: 0, depositTicks: 0,
    offers: [], upgrades: [], boss: null, enemies: [], shots: [], drops: [], hazards: [], portals: [], orbits: [], events: [],
    moon: { x: MOON.x, y: MOON.y }, badges: [], discovered: [],
    stats: { hits: 0, shots: 0, dashes: 0, burps: 0, reflected: 0, portals: 0, peakCombo: 0, shiftsPaid: 0, suns: 0, burpBest: 0 },
    player: { x: 640, y: 505, vx: 0, vy: 0, aim: -Math.PI / 2, radius: 20, hp, maxHp: hp, invulnerable: 0,
      dashTicks: 0, dashCooldown: 0, shotCooldown: 0, portalCooldown: 0, dashRate: loadout.dash, speed: loadout.speed,
      bag: 0, burp: 0, damage: loadout.id === 'tank' ? 1.4 : 1, fireRate: loadout.rate, spread: false,
      magnet: loadout.magnet, remote: false, bigBurp: false, orbit: false, pierce: false, ricochet: false,
      refund: false, tips: false, severance: false, tipTeeth: 0 },
  };
}
function spawnEnemy(w) {
  const side = Math.floor(random(w) * 4), along = random(w);
  let x = side === 0 ? 35 : side === 1 ? 1245 : 45 + along * 1190;
  let y = side === 2 ? 35 : side === 3 ? 605 : 45 + along * 550;
  if (distance({ x, y }, w.player) < 170) { x = 1280 - x; y = 640 - y; }
  const roll = random(w), level = w.shift + w.cycle;
  let kind = roll < 0.4 ? 'clock' : roll < 0.72 ? 'mail' : 'fish';
  if (level >= 2 && roll > 0.82) kind = 'chair';
  if (level >= 3 && roll > 0.93) kind = 'phone';
  if (w.spawnCount === 0 && w.shift === 2) kind = 'chair';
  if (w.spawnCount === 0 && w.shift === 3) kind = 'phone';
  const baseHp = { clock: 1, mail: 2, fish: 3, chair: 3, phone: 4 }[kind];
  const hp = baseHp + Math.min(5, w.cycle);
  w.enemies.push({ id: w.nextId++, x, y, kind, radius: kind === 'fish' || kind === 'phone' ? 24 : 21, hp, maxHp: hp,
    spawn: 45, attack: 90 + Math.floor(random(w) * 100), wobble: random(w) * Math.PI * 2, hit: 0,
    windup: 0, charge: 0, chargeAngle: 0, orbitCooldown: 0 });
  w.spawnCount++; discover(w, `enemy:${kind}`);
}
function shoot(w, x, y, angle, enemy = false, damage = 1) {
  // Hostile fire cannot starve the player's weapon when the room gets crowded.
  if (w.shots.length >= (enemy ? MOON.maxShots - 60 : MOON.maxShots)) return;
  const speed = enemy ? (180 + w.shift * 12) * w.rules.speed : 670;
  w.shots.push({ id: w.nextId++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, enemy, damage,
    radius: enemy ? 8 : 10, ttl: enemy ? 260 : w.player.ricochet ? 150 : 95, angle,
    pierce: !enemy && w.player.pierce ? 2 : 0, bounces: !enemy && w.player.ricochet ? 2 : 0, hitIds: [] });
  if (!enemy) w.stats.shots++;
}
function addHazard(w, x, y, radius = 65, warning = 65) {
  if (w.hazards.length >= 18) return;
  w.hazards.push({ id: w.nextId++, x: clamp(x, 65, 1215), y: clamp(y, 80, 560), radius, warning, totalWarning: warning, active: 24 });
}
function pop(w, enemy) {
  enemy.popped = true;
  w.kills++; w.combo = Math.min(99, w.combo + 1); w.comboTicks = 210;
  w.stats.peakCombo = Math.max(w.stats.peakCombo, w.combo);
  if (w.combo >= 20) badge(w, 'streak');
  points(w, 100 + Math.min(25, w.combo) * 10);
  event(w, 'pop', { x: enemy.x, y: enemy.y, kind: enemy.kind, combo: w.combo });
  const count = enemy.kind === 'fish' || enemy.kind === 'phone' ? 3 : 2;
  for (let i = 0; i < count && w.drops.length < MOON.maxDrops; i++) {
    const a = random(w) * Math.PI * 2;
    w.drops.push({ id: w.nextId++, x: clamp(enemy.x + Math.cos(a) * 18, 28, 1252), y: clamp(enemy.y + Math.sin(a) * 18, 28, 612), ttl: 1500, wobble: a });
  }
  if (w.player.severance) {
    for (const other of w.enemies) if (other.hp > 0 && distance(other, enemy) < 85) { other.hp -= 2; other.hit = 9; }
    event(w, 'blast', { x: enemy.x, y: enemy.y, radius: 85 });
  }
}
function damagePlayer(w, bypass = false) {
  const p = w.player;
  if (w.phase !== 'playing' || (p.invulnerable > 0 && !bypass)) return;
  p.hp--; p.invulnerable = 90; w.combo = 0; w.stats.hits++;
  event(w, 'hurt', { x: p.x, y: p.y });
  if (p.hp <= 0) { p.hp = 0; w.phase = 'lost'; event(w, 'lose'); }
}
function clearRoom(w) {
  w.shots = []; w.enemies = []; w.drops = []; w.hazards = []; w.portals = []; w.orbits = [];
  w.law = null; w.lawTicks = 0; w.moon.x = MOON.x; w.moon.y = MOON.y;
}
function completeShift(w) {
  clearRoom(w); w.stats.shiftsPaid++; badge(w, 'first-rent');
  w.player.hp = Math.min(w.player.maxHp, w.player.hp + 1);
  w.player.burp = Math.min(100, w.player.burp + 30);
  w.phase = 'upgrade';
  const available = MOON_UPGRADES.filter(u => !w.upgrades.includes(u.id));
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(random(w) * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  w.offers = available.slice(0, 3).map(u => u.id);
  // Exhausted catalog in deep overtime still has a valid, useful progression action.
  if (!w.offers.length) w.offers = ['lunch'];
  event(w, 'upgrade');
}
function startRoom(w) {
  const p = w.player;
  w.phase = 'playing'; w.shiftTick = 0; w.rent = 0; w.depositTicks = 0; w.spawnTicks = 65; w.spawnCount = 0;
  p.invulnerable = 120; p.vx = 0; p.vy = 0; p.x = 640; p.y = 515; p.dashTicks = 0; p.portalCooldown = 0;
  if (w.shift === 4) {
    const hp = w.rules.bossHp + w.cycle * 90;
    w.boss = { x: 640, y: 130, radius: 65, hp, maxHp: hp, attack: 130, phase: 1, hit: 0, telegraph: 0, pattern: 0 };
    w.quota = 0; discover(w, 'enemy:sun'); event(w, 'boss');
  } else {
    w.boss = null; w.quota = quotaFor(w);
    if (w.shift >= 2 || w.cycle > 0) {
      const flip = random(w) > 0.5;
      w.portals = [{ x: 200, y: flip ? 185 : 470 }, { x: 1080, y: flip ? 470 : 185 }];
    }
  }
}
export function chooseMoonUpgrade(w, id) {
  if (w.phase !== 'upgrade' || !w.offers.includes(id)) return false;
  const p = w.player;
  if (id === 'spread') p.spread = true;
  if (id === 'rapid') p.fireRate = Math.max(5, Math.round(p.fireRate * 0.65));
  if (id === 'magnet') { p.magnet = 190; p.remote = true; }
  if (id === 'heart') { p.maxHp += 2; p.hp = p.maxHp; }
  if (id === 'power') p.damage *= 2;
  if (id === 'burp') p.bigBurp = true;
  for (const name of ['orbit', 'pierce', 'ricochet', 'refund', 'tips', 'severance']) if (id === name) p[name] = true;
  if (id === 'lunch') { p.hp = p.maxHp; p.burp = 100; points(w, 1000); }
  else { w.upgrades.push(id); discover(w, `upgrade:${id}`); }
  w.offers = []; w.shift++; startRoom(w);
  return true;
}
export function continueMoonOvertime(w) {
  if (w.phase !== 'won' || w.runMode === 'daily') return false;
  clearRoom(w); w.cycle++; w.shift = 1; w.boss = null;
  w.player.hp = Math.min(w.player.maxHp, w.player.hp + 2);
  w.player.burp = 100; badge(w, 'overtime'); startRoom(w);
  event(w, 'overtime', { cycle: w.cycle }); return true;
}
function updateBoss(w) {
  const b = w.boss, p = w.player;
  b.phase = b.hp < b.maxHp / 2 ? 2 : 1;
  b.x = 640 + Math.sin(w.shiftTick / 150) * 330; b.y = 145 + Math.sin(w.shiftTick / 91) * 55;
  b.hit = Math.max(0, b.hit - 1); b.attack--;
  b.telegraph = b.attack < 45 ? 45 - b.attack : 0;
  if (b.attack <= 0) {
    const pattern = (b.pattern || 0) % 3;
    if (pattern === 1) {
      addHazard(w, p.x, p.y, 76, 65);
      addHazard(w, p.x - 180, p.y + 35, 65, 80);
      addHazard(w, p.x + 180, p.y - 35, 65, 80);
    } else {
      const count = pattern === 2 ? 9 : b.phase === 2 ? 18 : 12;
      const offset = Math.atan2(p.y - b.y, p.x - b.x);
      for (let i = 0; i < count; i++) shoot(w, b.x, b.y, pattern === 2 ? offset + (i - 4) * 0.15 : offset + i * Math.PI * 2 / count, true);
      if (b.phase === 2 && pattern === 0) addHazard(w, p.x, p.y, 65, 75);
    }
    b.pattern = (b.pattern || 0) + 1;
    b.attack = Math.max(70, (b.phase === 2 ? 105 : 140) - w.cycle * 7);
    event(w, 'boss-attack', { pattern });
  }
  if (distance(p, b) < b.radius + p.radius && p.dashTicks === 0) damagePlayer(w);
}
function reflect(w, shot) {
  shot.enemy = false; shot.vx *= -2.1; shot.vy *= -2.1; shot.damage = 3; shot.ttl = 120; shot.hitIds = []; shot.pierce = 1;
  shot.angle = Math.atan2(shot.vy, shot.vx); w.stats.reflected++;
  if (w.stats.reflected >= 10) badge(w, 'reflect');
  points(w, 25); event(w, 'reflect', { x: shot.x, y: shot.y });
}
function winMoon(w) {
  w.boss.hp = 0; points(w, 5000 + w.player.hp * 500 + w.cycle * 1000); w.phase = 'won'; w.stats.suns++;
  badge(w, 'union'); if (!w.stats.hits) badge(w, 'flawless'); if (w.difficulty === 'fever') badge(w, 'fever-win');
  event(w, 'win');
}
export function stepMoon(w, input = {}) {
  w.events = [];
  if (w.phase !== 'playing') return w.events;
  w.tick++; w.shiftTick++;
  const p = w.player;
  for (const key of ['invulnerable', 'dashTicks', 'dashCooldown', 'shotCooldown', 'portalCooldown']) if (p[key] > 0) p[key]--;
  if (w.comboTicks > 0) w.comboTicks--; else w.combo = 0;
  if (w.depositTicks > 0) w.depositTicks--;
  if (w.lawTicks > 0) w.lawTicks--; else w.law = null;
  if (w.shiftTick % 1080 === 660) {
    const laws = MOON_LAWS.filter(law => law.id !== w.previousLaw);
    w.law = laws[Math.floor(random(w) * laws.length)].id; w.previousLaw = w.law;
    w.lawTicks = 540; discover(w, `law:${w.law}`); event(w, 'law', { law: w.law });
  }
  const mxTarget = w.law === 'legs' ? 640 + Math.sin(w.tick / 95) * 245 : 640;
  const myTarget = w.law === 'legs' ? 300 + Math.cos(w.tick / 110) * 110 : 300;
  w.moon.x += clamp(mxTarget - w.moon.x, -2.5, 2.5); w.moon.y += clamp(myTarget - w.moon.y, -2.5, 2.5);
  p.radius = w.law === 'tiny' ? 13 : 20;
  let mx = clamp(finite(input.x), -1, 1), my = clamp(finite(input.y), -1, 1);
  const length = Math.hypot(mx, my); if (length > 1) { mx /= length; my /= length; }
  p.aim = Math.atan2(finite(input.aimY, p.y - 100) - p.y, finite(input.aimX, p.x) - p.x);
  if (input.dash && p.dashCooldown === 0) {
    p.dashTicks = 12; p.dashCooldown = p.dashRate; p.invulnerable = Math.max(p.invulnerable, 18); w.stats.dashes++;
    if (length === 0) { mx = Math.cos(p.aim); my = Math.sin(p.aim); }
    p.vx = mx * 920; p.vy = my * 920; event(w, 'dash', { x: p.x, y: p.y });
  }
  if (p.dashTicks === 0) {
    const smoothing = w.law === 'soup' ? 0.035 : 0.26, speed = p.speed * (w.law === 'tiny' ? 1.32 : 1);
    p.vx += (mx * speed - p.vx) * smoothing; p.vy += (my * speed - p.vy) * smoothing;
  }
  p.x = clamp(p.x + p.vx * MOON.step, 26, 1254); p.y = clamp(p.y + p.vy * MOON.step, 32, 610);
  if (p.portalCooldown === 0 && w.portals.length === 2) {
    const index = w.portals.findIndex(portal => distance(portal, p) < 28);
    if (index !== -1) {
      const fromX = p.x, fromY = p.y, to = w.portals[1 - index];
      p.x = to.x + (to.x > 640 ? -42 : 42); p.y = to.y; p.portalCooldown = 100; p.invulnerable = Math.max(p.invulnerable, 45);
      w.stats.portals++; badge(w, 'portal'); event(w, 'portal', { x: p.x, y: p.y, fromX, fromY });
    }
  }
  if (input.fire && p.shotCooldown === 0) {
    const offsets = p.spread ? [-0.19, 0, 0.19] : [0];
    if (w.law === 'bogo') offsets.push(-0.09, 0.09);
    for (const offset of offsets) shoot(w, p.x + Math.cos(p.aim) * 26, p.y + Math.sin(p.aim) * 26, p.aim + offset, false, p.damage);
    p.shotCooldown = p.fireRate; event(w, 'shot', { x: p.x, y: p.y });
  }
  if (input.burp && p.burp >= 100) {
    p.burp = 0; w.stats.burps++;
    const radius = p.bigBurp ? 1600 : 310;
    let toasted = 0;
    for (const e of w.enemies) if (e.hp > 0 && distance(e, p) < radius) { e.hp -= 8; if (e.hp <= 0) toasted++; }
    w.stats.burpBest = Math.max(w.stats.burpBest, toasted); if (toasted >= 5) badge(w, 'burp-five');
    w.shots = w.shots.filter(s => !s.enemy || distance(s, p) > radius);
    if (w.boss && distance(w.boss, p) < radius) w.boss.hp -= 26;
    p.invulnerable = Math.max(p.invulnerable, 50); event(w, 'burp', { x: p.x, y: p.y, radius, kills: toasted });
  }
  if (--w.spawnTicks <= 0) {
    if (w.enemies.length < MOON.maxEnemies) spawnEnemy(w);
    const base = w.boss ? 115 : Math.max(26, 86 - w.shift * 13 - Math.floor(w.shiftTick / 360));
    w.spawnTicks = Math.max(18, Math.round(base * w.rules.spawn / (1 + Math.min(5, w.cycle) * 0.17)));
  }
  const enemySpeed = w.rules.speed * (1 + Math.min(6, w.cycle) * 0.08);
  for (const e of w.enemies) {
    if (e.hit > 0) e.hit--;
    if (e.orbitCooldown > 0) e.orbitCooldown--;
    if (e.spawn > 0) { e.spawn--; continue; }
    if (e.hp <= 0) continue;
    const a = Math.atan2(p.y - e.y, p.x - e.x), dist = distance(e, p);
    let speed = e.kind === 'clock' ? 90 + w.shift * 7 : e.kind === 'fish' ? 56 : dist > 270 ? 64 : -12;
    let moveAngle = a;
    if (e.kind === 'chair') {
      if (e.windup > 0) { e.windup--; speed = 0; if (e.windup === 0) e.charge = 26; }
      else if (e.charge > 0) { e.charge--; speed = 440; moveAngle = e.chargeAngle; }
      else speed = 58;
    }
    if (e.kind === 'phone') speed = dist > 330 ? 40 : -8;
    e.x = clamp(e.x + Math.cos(moveAngle) * speed * enemySpeed / 60, 24, 1256);
    e.y = clamp(e.y + Math.sin(moveAngle) * speed * enemySpeed / 60, 24, 616);
    if (--e.attack <= 0 && e.kind !== 'clock') {
      if (e.kind === 'chair') { e.windup = 50; e.chargeAngle = a; e.attack = 180; }
      else if (e.kind === 'phone') { addHazard(w, p.x, p.y, 60, 75); e.attack = 220; }
      else {
        shoot(w, e.x, e.y, a, true);
        if (w.law === 'bogo') { shoot(w, e.x, e.y, a - 0.22, true); shoot(w, e.x, e.y, a + 0.22, true); }
        e.attack = e.kind === 'fish' ? 160 : 130;
      }
    }
    if (distance(e, p) < e.radius + p.radius && p.dashTicks === 0) damagePlayer(w);
  }
  if (w.boss) updateBoss(w);
  for (const hazard of w.hazards) {
    if (hazard.warning > 0) { hazard.warning--; continue; }
    hazard.active--;
    if (p.dashTicks === 0 && distance(hazard, p) < hazard.radius + p.radius * 0.6) damagePlayer(w);
  }
  w.hazards = w.hazards.filter(h => h.warning > 0 || h.active > 0);
  w.orbits = p.orbit ? [0, Math.PI].map(offset => ({ x: p.x + Math.cos(w.tick / 23 + offset) * 72, y: p.y + Math.sin(w.tick / 23 + offset) * 72 })) : [];
  for (const s of w.shots) {
    s.x += s.vx / 60; s.y += s.vy / 60; s.ttl--;
    if (s.enemy) {
      if (distance(s, p) < s.radius + p.radius + 14 && p.dashTicks > 0 && (p.refund || w.law === 'refund')) { reflect(w, s); continue; }
      if (w.orbits.some(o => distance(o, s) < 22)) { s.ttl = 0; event(w, 'block', { x: s.x, y: s.y }); continue; }
      if (distance(s, p) < s.radius + p.radius && p.dashTicks === 0) { damagePlayer(w); s.ttl = 0; }
    } else {
      if (s.bounces > 0 && (s.x < 15 || s.x > 1265 || s.y < 15 || s.y > 625)) {
        if (s.x < 15 || s.x > 1265) s.vx *= -1;
        if (s.y < 15 || s.y > 625) s.vy *= -1;
        s.x = clamp(s.x, 16, 1264); s.y = clamp(s.y, 16, 624); s.bounces--; s.angle = Math.atan2(s.vy, s.vx);
      }
      for (const e of w.enemies) {
        if (s.ttl > 0 && e.hp > 0 && e.spawn === 0 && !s.hitIds?.includes(e.id) && distance(s, e) < s.radius + e.radius) {
          e.hp -= s.damage; e.hit = 7; (s.hitIds ||= []).push(e.id);
          if (s.pierce > 0) s.pierce--; else s.ttl = 0;
        }
      }
      if (s.ttl > 0 && w.boss && !s.hitIds?.includes('sun') && distance(s, w.boss) < s.radius + w.boss.radius) {
        w.boss.hp -= s.damage; w.boss.hit = 5; s.ttl = 0;
      }
    }
  }
  for (const e of w.enemies) if (e.hp > 0 && e.spawn === 0 && !e.orbitCooldown && w.orbits.some(o => distance(o, e) < e.radius + 15)) {
    e.hp -= 1; e.hit = 7; e.orbitCooldown = 26;
  }
  w.shots = w.shots.filter(s => s.ttl > 0 && s.x > -30 && s.x < 1310 && s.y > -30 && s.y < 670);
  // Each enemy is processed at most once; resignation chains cannot recurse forever.
  let dead;
  while ((dead = w.enemies.find(e => e.hp <= 0 && !e.popped))) pop(w, dead);
  w.enemies = w.enemies.filter(e => e.hp > 0);
  for (const d of w.drops) {
    d.ttl--; const dist = distance(d, p), attraction = w.law === 'magnet' ? 1800 : p.magnet;
    if (dist < attraction && dist > 0) { const step = Math.min(dist, 7.5); d.x += (p.x - d.x) / dist * step; d.y += (p.y - d.y) / dist * step; }
    if (distance(d, p) < p.radius + 12) {
      p.bag++; p.burp = Math.min(100, p.burp + (p.bigBurp ? 12 : 6)); d.ttl = 0; event(w, 'pickup', { x: d.x, y: d.y });
    }
  }
  w.drops = w.drops.filter(d => d.ttl > 0);
  // Lethal damage wins ties, including a final deposit or a chain-reaction boss kill.
  if (w.phase === 'lost') return w.events;
  if (w.boss && w.boss.hp <= 0) {
    winMoon(w); return w.events;
  }
  if (p.bag > 0 && (distance(p, w.moon) < 145 || p.remote) && w.depositTicks === 0) {
    p.bag--; w.totalFed++; w.rent++; points(w, 75); w.depositTicks = p.remote ? 18 : 5;
    if (w.boss) w.boss.hp -= 2;
    if (p.tips && ++p.tipTeeth >= 12) { p.tipTeeth = 0; p.hp = Math.min(p.maxHp, p.hp + 1); event(w, 'heal', { x: p.x, y: p.y }); }
    event(w, 'feed', { x: p.x, y: p.y, moonX: w.moon.x, moonY: w.moon.y });
    if (w.boss && w.boss.hp <= 0) { winMoon(w); return w.events; }
    if (!w.boss && w.rent >= w.quota) { completeShift(w); return w.events; }
  }
  if (!w.boss && w.shiftTick >= MOON.shiftTicks) { damagePlayer(w, true); w.shiftTick = 0; event(w, 'law', { law: 'late' }); }
  return w.events;
}
