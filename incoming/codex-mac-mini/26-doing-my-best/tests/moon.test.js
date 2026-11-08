import test from 'node:test';
import assert from 'node:assert/strict';
import { MOON } from '../src/contracts.js';
import { createMoonWorld, stepMoon, chooseMoonUpgrade, MOON_UPGRADES, MOON_LAWS } from '../src/sim/moon.js';

function enemy(w, data = {}) {
  const e = { id: w.nextId++, x: 800, y: 500, hp: 1, maxHp: 1, radius: 21, kind: 'clock', spawn: 0, attack: 999, wobble: 0, hit: 0, ...data };
  w.enemies.push(e); return e;
}
function pay(w) {
  w.enemies = []; w.shots = []; w.player.x = MOON.x; w.player.y = MOON.y;
  w.player.bag = w.quota; w.depositTicks = 0;
  for (let i = 0; i < 200 && w.phase === 'playing'; i++) stepMoon(w);
  assert.equal(w.phase, 'upgrade');
}

test('moon is deterministic for seed and fixed inputs; different seeds diverge', () => {
  const a = createMoonWorld(1776), b = createMoonWorld(1776), c = createMoonWorld(1777);
  for (let i = 0; i < 2400; i++) {
    const input = { x: Math.sin(i / 100), y: Math.cos(i / 100), aimX: 400, aimY: 120, fire: true, dash: i % 120 === 0, burp: i % 300 === 0 };
    stepMoon(a, input); stepMoon(b, input); stepMoon(c, input);
  }
  assert.deepEqual(a, b); assert.notDeepEqual(a, c);
});
test('moon toast kills hostile supplies, emits events and drops collectible teeth', () => {
  const w = createMoonWorld(); w.spawnTicks = 9999;
  enemy(w, { x: 720, y: 505 });
  let popped = false;
  for (let i = 0; i < 15; i++) if (stepMoon(w, { aimX: 720, aimY: 505, fire: true }).some(e => e.type === 'pop')) popped = true;
  assert.equal(popped, true); assert.equal(w.kills, 1); assert.ok(w.score >= 110);
  assert.ok(w.drops.length + w.player.bag >= 2);
});
test('moon pickups charge a burp; collection is distinct from depositing rent', () => {
  const w = createMoonWorld();
  w.drops.push({ id: 99, x: w.player.x, y: w.player.y, ttl: 100, wobble: 0 });
  stepMoon(w);
  assert.equal(w.player.bag, 1); assert.equal(w.player.burp, 6); assert.equal(w.rent, 0);
  w.player.x = MOON.x; w.player.y = MOON.y;
  assert.ok(stepMoon(w).some(e => e.type === 'feed'));
  assert.equal(w.rent, 1); assert.equal(w.player.bag, 0); assert.equal(w.totalFed, 1);
});
test('moon dash prevents contact and projectile damage and cannot be spammed', () => {
  const w = createMoonWorld(); enemy(w, { x: 650, y: 505, hp: 10 });
  const events = stepMoon(w, { x: 1, dash: true });
  assert.equal(w.player.hp, 5); assert.ok(events.some(e => e.type === 'dash'));
  const cooldown = w.player.dashCooldown;
  assert.equal(stepMoon(w, { dash: true }).some(e => e.type === 'dash'), false);
  assert.equal(w.player.dashCooldown, cooldown - 1);
  w.player.invulnerable = 0; w.player.dashTicks = 0; w.player.x = w.enemies[0].x; w.player.y = w.enemies[0].y;
  stepMoon(w); assert.equal(w.player.hp, 4);
  stepMoon(w); assert.equal(w.player.hp, 4, 'contact invulnerability prevents a damage burst');
});
test('moon cosmic burp costs full charge, clears nearby bullets, and damages enemies', () => {
  const w = createMoonWorld(); w.player.burp = 99;
  enemy(w, { x: 700, hp: 3 });
  stepMoon(w, { burp: true }); assert.equal(w.player.burp, 99); assert.equal(w.enemies.length, 1);
  w.player.burp = 100;
  w.shots.push({ id: 500, x: 700, y: 500, vx: 0, vy: 0, enemy: true, radius: 8, damage: 1, ttl: 100 });
  const events = stepMoon(w, { burp: true });
  assert.equal(w.player.burp, 0); assert.equal(w.enemies.length, 0); assert.equal(w.shots.length, 0);
  assert.ok(events.some(e => e.type === 'burp')); assert.ok(w.player.invulnerable > 0);
});
test('moon upgrades validate offer and phase; three paid shifts lead to a real boss', () => {
  const w = createMoonWorld(77), original = structuredClone(w);
  assert.equal(chooseMoonUpgrade(w, 'power'), false); assert.deepEqual(w, original);
  for (let shift = 1; shift <= 3; shift++) {
    pay(w); assert.equal(w.offers.length, 3); assert.equal(new Set(w.offers).size, 3);
    assert.ok(w.offers.every(id => MOON_UPGRADES.some(u => u.id === id) && !w.upgrades.includes(id)));
    const before = structuredClone(w);
    assert.equal(chooseMoonUpgrade(w, 'made-up'), false); assert.deepEqual(w, before);
    assert.equal(chooseMoonUpgrade(w, w.offers[0]), true);
    assert.equal(w.shift, shift + 1); assert.equal(w.phase, 'playing');
  }
  assert.equal(w.boss.hp, w.rules.bossHp); assert.equal(w.upgrades.length, 3); assert.equal(w.quota, 0);
});
test('moon all upgrades have actual mechanical effects', () => {
  for (const { id } of MOON_UPGRADES) {
    const w = createMoonWorld(); w.phase = 'upgrade'; w.offers = [id]; w.player.hp = 1;
    chooseMoonUpgrade(w, id); const p = w.player;
    if (id === 'spread') { stepMoon(w, { fire: true }); assert.equal(w.shots.length, 3); }
    if (id === 'rapid') { stepMoon(w, { fire: true }); assert.equal(p.shotCooldown, 8); }
    if (id === 'magnet') { p.bag = 1; stepMoon(w); assert.equal(w.rent, 1); assert.equal(p.magnet, 190); }
    if (id === 'heart') { assert.equal(p.hp, 7); assert.equal(p.maxHp, 7); }
    if (id === 'power') { stepMoon(w, { fire: true }); assert.equal(w.shots[0].damage, 2); }
    if (id === 'burp') { p.burp = 100; enemy(w, { x: 50, y: 50 }); stepMoon(w, { burp: true }); assert.equal(w.enemies.length, 0); }
  }
});
test('moon reality laws have visible duration and affect speed, inertia, shots and attraction', () => {
  const w = createMoonWorld(10); w.shiftTick = 659; stepMoon(w);
  assert.ok(MOON_LAWS.some(law => law.id === w.law)); assert.equal(w.lawTicks, 540);
  for (const id of ['soup', 'bogo', 'tiny', 'magnet']) {
    const a = createMoonWorld(), b = createMoonWorld(); a.law = id; a.lawTicks = 100;
    if (id === 'magnet') a.drops.push({ id: 99, x: 40, y: 40, ttl: 100, wobble: 0 });
    stepMoon(a, { x: 1, fire: true }); stepMoon(b, { x: 1, fire: true });
    if (id === 'soup') assert.ok(a.player.vx < b.player.vx);
    if (id === 'tiny') { assert.ok(a.player.vx > b.player.vx); assert.equal(a.player.radius, 13); }
    if (id === 'bogo') assert.equal(a.shots.length, 3);
    if (id === 'magnet') assert.ok(a.drops[0].x > 40);
  }
});
test('moon unpaid rent costs one heart and offers another deadline, not a forced restart', () => {
  const w = createMoonWorld(); w.shiftTick = MOON.shiftTicks - 1;
  stepMoon(w); assert.equal(w.player.hp, 4); assert.equal(w.phase, 'playing'); assert.equal(w.shiftTick, 0);
});
test('moon boss attacks are telegraphed and defeat ends the run; terminal states stay fixed', () => {
  const w = createMoonWorld(); w.shift = 3; w.phase = 'upgrade'; w.offers = ['power']; chooseMoonUpgrade(w, 'power');
  w.boss.attack = 20; stepMoon(w); assert.ok(w.boss.telegraph > 0);
  for (let i = 0; i < 20; i++) stepMoon(w);
  assert.ok(w.shots.filter(s => s.enemy).length >= 12);
  w.boss.hp = 0; stepMoon(w); assert.equal(w.phase, 'won'); assert.ok(w.score >= 5000);
  const tick = w.tick, score = w.score; stepMoon(w, { fire: true }); assert.equal(w.tick, tick); assert.equal(w.score, score);
});
test('moon lethal contact takes priority over a simultaneous rent payment or boss defeat', () => {
  for (const boss of [false, true]) {
    const w = createMoonWorld(); w.player.x = MOON.x; w.player.y = MOON.y; w.player.hp = 1; w.player.bag = 20; w.rent = 7;
    enemy(w, { x: MOON.x, y: MOON.y, hp: 10 });
    if (boss) w.boss = { x: 640, y: 130, hp: 0, maxHp: 150, radius: 65, attack: 120, phase: 1, hit: 0, telegraph: 0 };
    stepMoon(w); assert.equal(w.phase, 'lost'); assert.equal(w.player.hp, 0);
  }
});
test('moon long simulations keep entities bounded and invalid control values cannot poison state', () => {
  const w = createMoonWorld();
  stepMoon(w, { x: NaN, y: Infinity, aimX: NaN, aimY: Infinity, fire: true });
  assert.ok(Number.isFinite(w.player.x)); assert.ok(Number.isFinite(w.player.aim));
  for (let i = 0; i < 15000; i++) {
    // Invulnerability fixture lets the stress test reach sustained maximum load.
    w.player.invulnerable = 10; w.player.hp = 5;
    stepMoon(w, { x: Math.sin(i / 100), y: Math.cos(i / 100), fire: true, aimX: 640, aimY: 300 });
    assert.ok(w.enemies.length <= MOON.maxEnemies); assert.ok(w.shots.length <= MOON.maxShots); assert.ok(w.drops.length <= MOON.maxDrops);
    assert.ok(w.player.x >= 26 && w.player.x <= 1254); assert.ok(w.player.y >= 32 && w.player.y <= 610);
  }
});
