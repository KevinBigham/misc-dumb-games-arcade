import { LIGHT } from '../contracts.js';
import { normalizeSeed, random } from './rng.js';
import { MEMORIES, COUNCILS, PROMISES, ENEMY_NOTES } from './last-light-data.js';

const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const event = (w, type, data = {}) => w.events.push({ type, tick: w.tick, ...data });
const id = w => w.nextId++;
export const keptMemories = w => w.memories.filter(m => m.status === 'kept');
export const nextMemory = w => keptMemories(w).find(m => m.id !== w.protectedId);
export const waveLength = w => w.wave === 5 ? LIGHT.finalTicks : LIGHT.waveTicks;
export const availableChoices = w => w.phase === 'council' ? COUNCILS[w.wave - 1].choices.map(c => ({ ...c, available: keptMemories(w).filter(m => m.id !== w.protectedId).length >= (c.memoryCost || (c.requiresMemory ? 1 : 0)) })) : [];

export function createLight(seed = 42, mode = 'standard', promise = 'none') {
  const w = {
    seed: normalizeSeed(seed), rngState: normalizeSeed(seed), mode: mode === 'story' ? 'story' : 'standard', phase: 'playing', tick: 0, wave: 1, waveTick: 0, nextId: 1,
    player: { x: 550, y: 465, hp: 100, maxHp: 100, angle: -Math.PI / 2, speed: 235, radius: 12, invulnerable: 0, dashTicks: 0, dashCooldown: 0, shotCooldown: 0, pulseCooldown: 0, dx: 0, dy: -1, dashHits: [], salvage: 0 },
    beacon: { x: LIGHT.beaconX, y: LIGHT.beaconY, hp: 100, maxHp: 100, radius: 64, shotCooldown: 0 },
    mods: { fireRate: 18, damage: 13, bolts: 1, pierce: 1, escort: 3, escortSpeed: 1, recruit: 32, healing: 1, turret: false, mercy: false, magnet: false, orbit: false, spawnRate: 1, closed: false },
    enemies: [], bolts: [], hazards: [], people: [], memories: [], events: [], choices: [], protectedId: null,
    promise: { id: PROMISES.some(p => p.id === promise) ? promise : 'none', broken: false, tick: null, wave: null, reason: null },
    missing: [], nights: [], journal: [], sparks: [], beams: [], seenKinds: [], nightStart: null,
    stats: { rescued: 0, missed: 0, kills: 0, burned: 0, pulses: 0, damageTaken: 0, highestCombo: 0, dashKills: 0, salvage: 0, beamDodges: 0 },
    combo: 0, comboTicks: 0, score: 0, personIndex: 0, enemyCountdown: 150, personCountdown: 600, bossSpawned: false, bossDefeated: false,
  };
  w.deck = MEMORIES.map((_, i) => i);
  for (let i = w.deck.length - 1; i > 0; i--) { const j = Math.floor(random(w) * (i + 1)); [w.deck[i], w.deck[j]] = [w.deck[j], w.deck[i]]; }
  // The first two people already entrusted their memories to the archive.
  for (let i = 0; i < 2; i++) addMemory(w, takePerson(w));
  spawnPerson(w, 365, 485); spawnPerson(w, 755, 290);
  w.nightStart = { rescued: w.stats.rescued, burned: 0, missed: 0, kills: 0 };
  w.events = [];
  return w;
}
function takePerson(w) {
  const source = MEMORIES[w.deck[w.personIndex % w.deck.length]];
  w.personIndex++;
  return { id: id(w), ...source };
}
function addMemory(w, person) {
  const memory = { id: person.id, name: person.name, role: person.role, text: person.text, status: 'kept', night: w.wave, rescuedTick: w.tick };
  w.memories.push(memory); w.stats.rescued++;
  if (w.tick > 0) { w.player.hp = Math.min(w.player.maxHp, w.player.hp + 4); log(w, 'rescued', `${memory.name} reached the light.`); }
  event(w, 'rescue', { name: memory.name, text: memory.text, x: w.beacon.x, y: w.beacon.y, id: memory.id });
}
function spawnPerson(w, x, y, following = false) {
  if (w.personIndex >= MEMORIES.length) return;
  if (x === undefined) {
    const a = random(w) * TAU;
    x = 550 + Math.cos(a) * (310 + random(w) * 130);
    y = 370 + Math.sin(a) * (225 + random(w) * 55);
  }
  w.people.push({ ...takePerson(w), x, y, following, capture: 0 });
}
function spawnEnemy(w, kind) {
  if (w.enemies.length >= 70) return;
  const a = random(w) * TAU;
  const types = ['seeker', 'seeker', 'siege', ...(w.wave >= 2 ? ['ranged'] : []), ...(w.wave >= 3 ? ['brute', 'seeker', 'warden'] : [])];
  kind ||= types[Math.floor(random(w) * types.length)];
  const base = { seeker: [27, 66, 12], siege: [46, 36, 16], ranged: [34, 43, 14], brute: [100, 35, 23], warden: [58, 48, 18], boss: [1100, 25, 42] }[kind];
  const hp = base[0] * (kind === 'boss' ? (w.mode === 'story' ? .85 : 1) : 1 + (w.wave - 1) * .13);
  w.enemies.push({ id: id(w), kind, x: 550 + Math.cos(a) * 590, y: 370 + Math.sin(a) * 410, hp, maxHp: hp, radius: base[2], speed: base[1] + w.wave * 3, attack: 90, contact: 0, warmup: 45, angle: a, flash: 0, phase: 1, beamCooldown: 180, summonCooldown: 240 });
  if (kind === 'boss') { const boss = w.enemies.at(-1); boss.x = clamp(boss.x, 60, LIGHT.width - 60); boss.y = clamp(boss.y, 60, LIGHT.height - 60); }
  if (!w.seenKinds.includes(kind) && ENEMY_NOTES[kind]) { w.seenKinds.push(kind); event(w, 'notice', { text: ENEMY_NOTES[kind] }); }
}
function burn(w, reason) {
  const memory = nextMemory(w);
  if (!memory) return false;
  memory.status = 'burned'; memory.reason = reason; memory.burnedNight = w.wave; w.stats.burned++;
  log(w, 'burned', `${memory.name} lost a memory: ${reason}.`);
  breakPromise(w, 'memory', `${memory.name}’s story powered ${reason.toLowerCase()}.`);
  event(w, 'burn', { name: memory.name, text: memory.text, id: memory.id });
  return true;
}
export function protectMemory(w, memoryId) {
  if (!['playing', 'council'].includes(w.phase)) return false;
  const memory = w.memories.find(m => m.id === memoryId && m.status === 'kept');
  if (!memory) return false;
  w.protectedId = w.protectedId === memoryId ? null : memoryId;
  return true;
}
function log(w, kind, text) {
  w.journal.push({ kind, text, night: w.wave, tick: w.tick });
  if (w.journal.length > 100) w.journal.shift();
}
function breakPromise(w, kind, reason) {
  if (w.promise.id !== kind || w.promise.broken) return;
  Object.assign(w.promise, { broken: true, tick: w.tick, wave: w.wave, reason });
  log(w, 'promise', reason); event(w, 'promise-broken', { text: reason });
}
function missPerson(w, person, reason) {
  w.missing.push({ id: person.id, name: person.name, role: person.role, reason, night: w.wave, tick: w.tick });
  w.stats.missed++; breakPromise(w, 'people', `${person.name} was left outside: ${reason}.`);
  log(w, 'missing', `${person.name}: ${reason}.`);
}
function kill(w, enemy) {
  if (enemy.dead) return;
  enemy.dead = true; w.stats.kills++; w.combo++; w.comboTicks = 150;
  w.stats.highestCombo = Math.max(w.stats.highestCombo, w.combo);
  w.score += 10 * Math.min(5, 1 + Math.floor(w.combo / 8));
  if (enemy.kind === 'boss') { w.bossDefeated = true; event(w, 'notice', { text: 'THE EDITOR IS SILENT. Keep the light alive until dawn.' }); }
  if (w.sparks.length < 80) w.sparks.push({ id: id(w), x: enemy.x, y: enemy.y, ttl: 900 });
  event(w, 'kill', { x: enemy.x, y: enemy.y, kind: enemy.kind, combo: w.combo });
}
function damageEnemy(w, e, amount) {
  if (e.dead) return;
  e.hp -= amount; e.flash = 5;
  if (e.hp <= 0) kill(w, e);
}
function hurtPlayer(w, amount) {
  const p = w.player;
  if (p.invulnerable > 0 || p.dashTicks > 0) return;
  amount *= w.mode === 'story' ? .55 : 1;
  p.hp = Math.max(0, p.hp - amount); p.invulnerable = 42; w.stats.damageTaken += amount;
  event(w, 'hurt', { x: p.x, y: p.y, amount });
}
function fire(w, from, angle, owner = 'player') {
  const damage = w.mods.damage * (owner === 'turret' ? .72 : 1);
  w.bolts.push({ id: id(w), x: from.x, y: from.y, vx: Math.cos(angle) * 680, vy: Math.sin(angle) * 680, angle, damage, ttl: 58, hit: [], pierce: w.mods.pierce });
  event(w, 'shot', { x: from.x, y: from.y, angle, owner });
}
function pulse(w) {
  if (w.player.pulseCooldown > 0) return;
  if (!burn(w, 'Emergency pulse')) { event(w, 'notice', { text: 'No unprotected memories remain. The pulse has no fuel.' }); return; }
  w.stats.pulses++; w.player.pulseCooldown = 180; w.player.invulnerable = 90;
  // A pulse hits the entire arena; bosses resist it. It cannot consume multiple memories per press.
  for (const e of w.enemies) damageEnemy(w, e, e.kind === 'boss' ? 125 : 1000);
  w.hazards = []; w.beams = [];
  if (w.mods.mercy) { w.player.hp = Math.min(w.player.maxHp, w.player.hp + 30); w.beacon.hp = Math.min(w.beacon.maxHp, w.beacon.hp + 25); }
  event(w, 'pulse', { x: w.player.x, y: w.player.y });
}
function endWave(w) {
  for (const person of w.people) missPerson(w, person, 'the gate closed at dawn');
  w.nights.push({ night: w.wave, rescued: w.stats.rescued - w.nightStart.rescued, burned: w.stats.burned - w.nightStart.burned, kills: w.stats.kills - w.nightStart.kills, lost: w.missing.filter(m => m.night === w.wave).map(m => m.name) });
  w.people = []; w.enemies = []; w.bolts = []; w.hazards = []; w.sparks = []; w.beams = [];
  w.player.hp = Math.min(w.player.maxHp, w.player.hp + 25);
  w.phase = w.wave === LIGHT.waves ? 'ending' : 'council';
  event(w, w.phase === 'council' ? 'council' : 'end');
}

export function stepLight(w, input = {}) {
  w.events = [];
  if (w.phase !== 'playing') return w.events;
  w.tick++; w.waveTick++;
  const p = w.player, b = w.beacon, dt = 1 / LIGHT.hz;
  for (const key of ['invulnerable', 'dashCooldown', 'shotCooldown', 'pulseCooldown', 'dashTicks']) p[key] = Math.max(0, p[key] - 1);
  w.comboTicks = Math.max(0, w.comboTicks - 1); if (!w.comboTicks) w.combo = 0;
  let mx = Number.isFinite(input.moveX) ? clamp(input.moveX, -1, 1) : 0;
  let my = Number.isFinite(input.moveY) ? clamp(input.moveY, -1, 1) : 0;
  const magnitude = Math.hypot(mx, my);
  if (magnitude > 0) { mx /= magnitude; my /= magnitude; p.dx = mx; p.dy = my; }
  if (input.dashPressed && p.dashCooldown === 0) { p.dashTicks = 12; p.dashCooldown = 100; p.dashHits = []; event(w, 'dash', { x: p.x, y: p.y, dx: p.dx, dy: p.dy }); }
  const escorting = w.people.some(person => person.following);
  const speed = p.speed * (escorting ? w.mods.escortSpeed : 1);
  p.x = clamp(p.x + (p.dashTicks ? p.dx * 720 : mx * speed) * dt, 22, LIGHT.width - 22);
  p.y = clamp(p.y + (p.dashTicks ? p.dy * 720 : my * speed) * dt, 22, LIGHT.height - 22);
  if (input.pulsePressed) pulse(w);
  if (dist(p, b) < b.radius && p.invulnerable === 0) p.hp = Math.min(p.maxHp, p.hp + .06 * w.mods.healing * (w.mode === 'story' ? 1.5 : 1));
  // The gun targets the nearest threat automatically, unless the pointer is held.
  let target = null, nearest = 540;
  for (const e of w.enemies) { const d = dist(p, e); if (!e.dead && d < nearest) { nearest = d; target = e; } }
  const manual = input.manualAim && Number.isFinite(input.aimX) && Number.isFinite(input.aimY);
  if (manual) p.angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
  else if (target) p.angle = Math.atan2(target.y - p.y, target.x - p.x);
  else if (magnitude > 0) p.angle = Math.atan2(my, mx);
  if (p.shotCooldown === 0 && (target || manual)) {
    for (let i = 0; i < w.mods.bolts; i++) fire(w, p, p.angle + (i - (w.mods.bolts - 1) / 2) * .13);
    p.shotCooldown = w.mods.fireRate;
  }
  if (w.mods.turret) {
    b.shotCooldown = Math.max(0, b.shotCooldown - 1);
    const near = w.enemies.filter(e => !e.dead).sort((a, c) => dist(a, b) - dist(c, b))[0];
    if (near && dist(near, b) < 420 && b.shotCooldown === 0) { fire(w, b, Math.atan2(near.y - b.y, near.x - b.x), 'turret'); b.shotCooldown = 24; }
  }
  if (w.mods.orbit && w.tick % 8 === 0) {
    for (const e of w.enemies) if (dist(e, p) < 76) damageEnemy(w, e, 12);
  }
  let followers = w.people.filter(person => person.following).length;
  const rescued = [];
  for (const person of w.people) {
    if (!person.following && followers < w.mods.escort && dist(person, p) < w.mods.recruit) { person.following = true; person.capture = 0; followers++; event(w, 'follow', { name: person.name, x: person.x, y: person.y }); }
    if (person.following) {
      const d = dist(person, p);
      if (d > 23) { const followSpeed = p.dashTicks ? 520 : 275; person.x += (p.x - person.x) / d * Math.min(d - 23, followSpeed * dt); person.y += (p.y - person.y) / d * Math.min(d - 23, followSpeed * dt); }
      if (dist(person, b) < b.radius) { rescued.push(person.id); addMemory(w, person); w.score += 100; if (w.mods.magnet) b.hp = Math.min(b.maxHp, b.hp + 5); }
    }
  }
  w.people = w.people.filter(person => !rescued.includes(person.id));
  const duration = waveLength(w);
  if (w.waveTick < duration - 360 && --w.enemyCountdown <= 0) {
    spawnEnemy(w);
    w.enemyCountdown = Math.round(Math.max(29, 100 - w.wave * 12) / w.mods.spawnRate * (w.mode === 'story' ? 1.25 : 1));
  }
  if (!w.mods.closed && w.waveTick < duration - 700 && --w.personCountdown <= 0) { spawnPerson(w); w.personCountdown = 630; }
  if (w.wave === 5 && w.waveTick >= 420 && !w.bossSpawned) { spawnEnemy(w, 'boss'); w.bossSpawned = true; event(w, 'notice', { text: 'THE EDITOR // “You can stop carrying all of this.”' }); }
  for (const e of w.enemies) {
    if (e.dead) continue;
    e.flash = Math.max(0, e.flash - 1); e.contact = Math.max(0, e.contact - 1);
    if (e.warmup > 0) { e.warmup--; continue; }
    const target = e.kind === 'warden' ? w.people.filter(person => !person.following).sort((a, c) => dist(e, a) - dist(e, c))[0] || p : ['siege', 'brute'].includes(e.kind) ? b : p;
    const d = Math.max(1, dist(e, target));
    const stop = e.kind === 'warden' && target !== p ? 28 : e.kind === 'ranged' ? 270 : e.kind === 'boss' ? 200 : 0;
    if (d > stop) { e.x += (target.x - e.x) / d * e.speed * dt; e.y += (target.y - e.y) / d * e.speed * dt; }
    e.angle = Math.atan2(target.y - e.y, target.x - e.x);
    if (p.dashTicks > 0 && dist(e, p) < e.radius + 22 && !p.dashHits.includes(e.id)) {
      p.dashHits.push(e.id); damageEnemy(w, e, e.kind === 'boss' ? 32 : 46);
      if (e.dead) w.stats.dashKills++;
      event(w, 'dash-hit', { x: e.x, y: e.y });
    }
    if (e.dead) continue;
    if (e.kind === 'boss') {
      const phase = e.hp < e.maxHp * .3 ? 3 : e.hp < e.maxHp * .65 ? 2 : 1;
      if (phase !== e.phase) { e.phase = phase; e.beamCooldown = Math.min(e.beamCooldown, 30); if (phase === 3) e.summonCooldown = Math.min(e.summonCooldown, 45); event(w, 'boss-phase', { phase, text: phase === 2 ? 'THE EDITOR / REVISION. The red lines lock before they fire. Dash across them.' : 'THE EDITOR / FINAL DRAFT. It is running out of arguments.' }); }
      if (phase >= 2 && --e.beamCooldown <= 0 && w.beams.length < 6) {
        const warning = w.mode === 'story' ? 96 : 72;
        w.beams.push({ id: id(w), owner: e.id, x: e.x, y: e.y, angle: e.angle, warning, total: warning, active: 12, width: 32, hit: false });
        e.beamCooldown = phase === 3 ? 150 : 210;
        event(w, 'beam-warning', { x: e.x, y: e.y });
      }
      if (phase === 3 && --e.summonCooldown <= 0) { spawnEnemy(w, 'seeker'); spawnEnemy(w, 'seeker'); e.summonCooldown = 300; }
    }
    if ((e.kind === 'ranged'  || e.kind === 'boss') && --e.attack <= 0) {
      const count = e.kind === 'boss' ? 12 : 1;
      for (let i = 0; i < count && w.hazards.length < 240; i++) { const a = e.kind === 'boss' ? e.angle + i * TAU / count + w.tick * .003 : e.angle; w.hazards.push({ x: e.x, y: e.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, ttl: 300, radius: 6 }); }
      e.attack = e.kind === 'boss' ? (e.hp < e.maxHp / 2 ? 72 : 115) : 150;
    }
    if (dist(e, p) < e.radius + p.radius) hurtPlayer(w, e.kind === 'boss' ? 20 : 12);
    if (['siege', 'brute'].includes(e.kind) && dist(e, b) < e.radius + 28 && e.contact === 0) {
      b.hp = Math.max(0, b.hp - (w.mode === 'story' ? 2 : 4)); e.contact = 70; event(w, 'hurt', { x: b.x, y: b.y, target: 'beacon' });
    }
  }
  const captured = [];
  for (const person of w.people) {
    const scanning = !person.following && w.enemies.some(e => !e.dead && e.kind === 'warden' && e.warmup === 0 && dist(e, person) < 55);
    person.capture = scanning ? person.capture + 1 : Math.max(0, person.capture - 3);
    if (person.capture === 1) event(w, 'notice', { text: `${person.name.toUpperCase()} IS BEING REDACTED. Reach the green signal or destroy the Warden.` });
    if (person.capture >= (w.mode === 'story' ? 360 : 240)) { captured.push(person.id); missPerson(w, person, 'the Warden erased their signal'); event(w, 'person-lost', { name: person.name, x: person.x, y: person.y }); }
  }
  w.people = w.people.filter(person => !captured.includes(person.id));
  for (const beam of w.beams) {
    if (!w.enemies.some(e => !e.dead && e.id === beam.owner)) { beam.active = 0; continue; }
    if (beam.warning > 0) { beam.warning--; continue; }
    const dx = p.x - beam.x, dy = p.y - beam.y;
    const along = dx * Math.cos(beam.angle) + dy * Math.sin(beam.angle);
    const across = Math.abs(dx * Math.sin(beam.angle) - dy * Math.cos(beam.angle));
    if (along >= 0 && along < 1400 && across < beam.width / 2 + p.radius) { const hp = p.hp; hurtPlayer(w, 22); if (p.hp < hp) beam.hit = true; }
    if (--beam.active === 0 && !beam.hit) w.stats.beamDodges++;
  }
  w.beams = w.beams.filter(beam => beam.active > 0 && w.enemies.some(e => !e.dead && e.id === beam.owner));
  for (const spark of w.sparks) {
    spark.ttl--;
    if (dist(p, spark) < 70) { const d = Math.max(1, dist(p, spark)); spark.x += (p.x - spark.x) / d * 7; spark.y += (p.y - spark.y) / d * 7; }
    if (dist(p, spark) < 23 && p.salvage < 80) { p.salvage++; spark.ttl = 0; event(w, 'spark', { x: spark.x, y: spark.y }); }
  }
  w.sparks = w.sparks.filter(spark => spark.ttl > 0);
  if (dist(p, b) < b.radius && p.salvage > 0) {
    const amount = p.salvage; w.stats.salvage += amount; p.salvage = 0;
    p.hp = Math.min(p.maxHp, p.hp + amount * 1.5); b.hp = Math.min(b.maxHp, b.hp + amount * 1.2);
    event(w, 'repair', { x: b.x, y: b.y, amount });
  }
  for (const bolt of w.bolts) {
    bolt.x += bolt.vx * dt; bolt.y += bolt.vy * dt; bolt.ttl--;
    for (const e of w.enemies) {
      if (e.dead || bolt.ttl <= 0 || bolt.hit.includes(e.id)) continue;
      if (dist(bolt, e) < e.radius + 7) { bolt.hit.push(e.id); damageEnemy(w, e, bolt.damage); event(w, 'hit', { x: bolt.x, y: bolt.y }); if (bolt.hit.length >= bolt.pierce) bolt.ttl = 0; }
    }
  }
  for (const h of w.hazards) { h.x += h.vx * dt; h.y += h.vy * dt; h.ttl--; if (dist(h, p) < h.radius + p.radius) { hurtPlayer(w, 10); h.ttl = 0; } }
  w.enemies = w.enemies.filter(e => !e.dead);
  w.bolts = w.bolts.filter(e => e.ttl > 0 && e.x > -40 && e.x < LIGHT.width + 40 && e.y > -40 && e.y < LIGHT.height + 40);
  w.hazards = w.hazards.filter(e => e.ttl > 0);
  if (p.hp <= 0 || b.hp <= 0) { for (const person of w.people) missPerson(w, person, 'the light went out'); w.people = []; w.phase = 'lost'; w.lossReason = p.hp <= 0 ? 'keeper' : 'archive'; event(w, 'end'); }
  else if (w.waveTick >= duration && (w.wave < 5 || w.bossDefeated)) endWave(w);
  return w.events;
}

export function chooseLight(w, choiceId) {
  if (w.phase !== 'council') return false;
  const choice = availableChoices(w).find(c => c.id === choiceId && c.available);
  if (!choice) return false;
  w.events = [];
  const b = w.beacon, p = w.player, m = w.mods;
  const nightStart = { rescued: w.stats.rescued, burned: w.stats.burned, missed: w.stats.missed, kills: w.stats.kills };
  switch (choiceId) {
    case 'fork': m.bolts = 2; break;
    case 'shelter': b.hp = Math.min(b.maxHp, b.hp + 35); b.radius = 90; m.healing = 2; break;
    case 'engine': burn(w, 'Weapon overclock'); m.fireRate = Math.round(m.fireRate / 1.45); break;
    case 'caravan': m.escort = 6; m.escortSpeed = 1.2; break;
    case 'sentinel': m.turret = true; p.speed *= .88; break;
    case 'mercy': m.mercy = true; break;
    case 'precision': m.damage *= 1.35; m.pierce = 3; break;
    case 'magnet': m.recruit = 96; m.magnet = true; break;
    case 'erase': burn(w, 'Orbital shield'); burn(w, 'Orbital shield'); m.orbit = true; break;
    case 'open': m.spawnRate = 1.25; break;
    case 'beacon': p.hp = Math.max(1, p.hp - 25); break;
    case 'closed': m.closed = true; b.hp = Math.min(b.maxHp, b.hp + 45); m.damage *= 1.25; break;
  }
  w.choices.push({ id: choiceId, name: choice.name, wave: w.wave });
  log(w, 'choice', choice.name);
  w.nightStart = nightStart;
  w.wave++; w.waveTick = 0; w.enemyCountdown = 100; w.personCountdown = 600; w.phase = 'playing';
  p.x = 550; p.y = 465; p.invulnerable = 120; p.dashCooldown = 0; p.pulseCooldown = 0; p.dashTicks = 0; p.dashHits = [];
  if (choiceId === 'closed') for (let i = 0; i < 6 && w.personIndex < MEMORIES.length; i++) missPerson(w, takePerson(w), 'the gate was sealed before they could enter');
  if (!m.closed) { spawnPerson(w); spawnPerson(w); }
  if (choiceId === 'open') for (let i = 0; i < 6; i++) spawnPerson(w);
  if (choiceId === 'beacon') for (let i = 0; i < 4; i++) spawnPerson(w, 510 + i * 22, 495, true);
  event(w, 'wave', { wave: w.wave });
  return true;
}
export function finishLight(w, decision) {
  if (w.phase !== 'ending' || !['keep', 'release'].includes(decision)) return false;
  if (decision === 'release') for (const memory of w.memories) if (memory.status === 'kept') memory.status = 'released';
  w.finalDecision = decision; w.phase = 'won'; return true;
}
export function epitaph(w) {
  const remaining = w.memories.filter(m => m.status !== 'burned').length;
  if (w.phase === 'lost') return { title: 'The light was real.', text: `The ${w.lossReason === 'keeper' ? 'keeper fell' : 'archive went dark'}. For ${w.stats.rescued} people, there was somewhere to go. ${w.stats.burned ? `${w.stats.burned} memories bought that time.` : 'You never fed a memory to the machine.'} A short light is still a light.`, question: 'Would you make the same choices if no one remembered making them?' };
  if (w.finalDecision === 'release') return { title: 'No one owns the dawn.', text: `You sent ${remaining} memories beyond the wall. There is no master copy now. ${w.stats.rescued} people are alive to tell the stories differently. The machine cannot promise what comes next.`, question: 'Is a memory still yours when someone else carries it?' };
  return { title: w.stats.burned ? 'A future with missing pages.' : w.stats.missed ? 'An unbroken record. An unfinished world.' : 'An imperfect, unbroken world.', text: `${w.stats.rescued} people survived. ${remaining} memories remain in the archive. ${w.stats.burned ? `${w.stats.burned} were spent to get here. The people are still here; those parts of their stories are not.` : 'You kept even the parts the machine could not use.'} ${w.stats.missed ? `${w.stats.missed} people who answered the signal never reached the light. ` : ''}The key is still in your hand.`, question: w.mods.closed ? 'Who is missing from a history written by the people inside?' : 'When does protecting a story become controlling it?' };
}
