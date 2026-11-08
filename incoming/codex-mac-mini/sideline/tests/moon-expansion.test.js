import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoonWorld, stepMoon, chooseMoonUpgrade, continueMoonOvertime, MOON_UPGRADES } from '../src/sim/moon.js';

function addEnemy(w, x, y, options = {}) {
  const enemy = { id: w.nextId++, x, y, hp: 5, maxHp: 5, radius: 21, kind: 'clock', spawn: 0, attack: 99999, wobble: 0, hit: 0, windup: 0, charge: 0, chargeAngle: 0, orbitCooldown: 0, ...options };
  w.enemies.push(enemy); return enemy;
}
function upgrade(w, id) { w.phase = 'upgrade'; w.offers = [id]; assert.equal(chooseMoonUpgrade(w, id), true); w.spawnTicks = 99999; }
function bullet(w, x, y, options = {}) { const shot = { id: w.nextId++, x, y, vx: 0, vy: 0, radius: 8, enemy: true, damage: 1, ttl: 150, hitIds: [], ...options }; w.shots.push(shot); return shot; }

test('moon builds and difficulties alter actual stats while normalizing unknown options', () => {
  const classic = createMoonWorld(1), courier = createMoonWorld(1, { loadout: 'courier' }), tank = createMoonWorld(1, { loadout: 'tank' });
  assert.ok(courier.player.speed > classic.player.speed); assert.ok(courier.player.magnet > classic.player.magnet);
  assert.ok(tank.player.hp > classic.player.hp); assert.ok(tank.player.damage > classic.player.damage);
  assert.ok(tank.player.speed < classic.player.speed);
  assert.equal(createMoonWorld(1, { loadout: 'fake', difficulty: 'fake' }).loadout, 'classic');
  assert.equal(createMoonWorld(1, { difficulty: 'daydream' }).player.hp, 7);
  assert.equal(createMoonWorld(1, { difficulty: 'fever' }).player.hp, 4);
});
test('moon piercing toast hits three different enemies but never the same target twice', () => {
  const w = createMoonWorld(); upgrade(w, 'pierce');
  w.player.x = 300; w.player.y = 300;
  const targets = [350, 380, 410, 440].map(x => addEnemy(w, x, 300));
  stepMoon(w, { fire: true, aimX: 700, aimY: 300 });
  for (let i = 0; i < 18; i++) stepMoon(w);
  assert.deepEqual(targets.map(e => e.hp), [4, 4, 4, 5]);
});
test('moon ricochet actually reverses velocity and spends a bounded bounce budget', () => {
  const w = createMoonWorld(); upgrade(w, 'ricochet'); w.player.x = 1230; w.player.y = 400;
  stepMoon(w, { fire: true, aimX: 1280, aimY: 400 });
  for (let i = 0; i < 6; i++) stepMoon(w);
  assert.ok(w.shots[0].vx < 0); assert.equal(w.shots[0].bounces, 1);
});
test('moon orbiting bagels damage nearby enemies and block bullets without touching player health', () => {
  const w = createMoonWorld(); upgrade(w, 'orbit'); w.player.x = 600; w.player.y = 400;
  const e = addEnemy(w, 672, 403), shot = bullet(w, 672, 403);
  stepMoon(w); assert.equal(e.hp, 4); assert.equal(w.shots.includes(shot), false); assert.equal(w.player.hp, 5);
  for (let i = 0; i < 10; i++) stepMoon(w);
  assert.equal(e.hp, 4, 'orbital contact uses a per-enemy cooldown');
});
test('moon reflection is a dash skill and reversed fire can hurt an enemy', () => {
  const w = createMoonWorld(); upgrade(w, 'refund'); w.player.x = 600; w.player.y = 400;
  const shot = bullet(w, 625, 400, { vx: -200 });
  stepMoon(w, { x: 1, dash: true });
  assert.equal(shot.enemy, false); assert.ok(shot.vx > 0); assert.equal(w.stats.reflected, 1); assert.equal(w.player.hp, 5);
  const e = addEnemy(w, 690, 400);
  for (let i = 0; i < 14; i++) stepMoon(w);
  assert.equal(e.hp, 2);
});
test('moon tooth benefits heal at the stated deposit count and cannot exceed max health', () => {
  const w = createMoonWorld(); upgrade(w, 'tips'); w.quota = 100; w.player.x = 640; w.player.y = 300; w.player.hp = 2; w.player.bag = 24;
  for (let i = 0; i < 120; i++) stepMoon(w);
  assert.equal(w.totalFed, 24); assert.equal(w.player.hp, 4); assert.equal(w.player.tipTeeth, 0);
});
test('moon explosive resignation produces bounded chain kills with no duplicate rewards', () => {
  const w = createMoonWorld(); upgrade(w, 'severance');
  for (let i = 0; i < 20; i++) addEnemy(w, 300 + i * 10, 200, { hp: i === 0 ? 0 : 2 });
  stepMoon(w); assert.equal(w.kills, 20); assert.equal(w.enemies.length, 0); assert.equal(w.drops.length, 40);
  const score = w.score; stepMoon(w); assert.equal(w.score, score); assert.equal(w.kills, 20);
});
test('moon walking law changes the real collection point; portals prevent immediate bounce-back', () => {
  const w = createMoonWorld(); w.law = 'legs'; w.lawTicks = 500;
  for (let i = 0; i < 60; i++) stepMoon(w);
  assert.notDeepEqual(w.moon, { x: 640, y: 300 }); w.player.x = w.moon.x; w.player.y = w.moon.y; w.player.bag = 1;
  stepMoon(w); assert.equal(w.rent, 1);
  w.portals = [{ x: 200, y: 180 }, { x: 1080, y: 470 }]; w.player.x = 200; w.player.y = 180;
  stepMoon(w); assert.equal(w.player.x, 1038); assert.equal(w.player.y, 470); assert.equal(w.stats.portals, 1);
  for (let i = 0; i < 30; i++) stepMoon(w);
  assert.equal(w.stats.portals, 1); assert.ok(w.badges.includes('portal'));
});
test('moon chair locks its charge direction and phones honor their warning period', () => {
  const w = createMoonWorld(); w.spawnTicks = 99999;
  const chair = addEnemy(w, 400, 400, { kind: 'chair', attack: 1 });
  stepMoon(w); assert.equal(chair.windup, 50); const angle = chair.chargeAngle;
  w.player.x = 300; w.player.y = 100;
  for (let i = 0; i < 51; i++) stepMoon(w);
  assert.equal(chair.chargeAngle, angle); assert.ok(chair.charge > 0);
  w.enemies = []; // Isolate the phone warning from the independently verified charge.
  const p = w.player; p.x = 600; p.y = 400; p.invulnerable = 0;
  addEnemy(w, 100, 100, { kind: 'phone', attack: 1 }); stepMoon(w);
  assert.ok(w.hazards.length > 0); assert.equal(p.hp, 5);
  for (let i = 0; i < 73; i++) stepMoon(w);
  assert.equal(p.hp, 5, 'no damage during the warning');
  for (let i = 0; i < 3; i++) stepMoon(w);
  assert.equal(p.hp, 4, 'active danger causes damage once, followed by immunity');
});
test('moon overtime only starts from victory, preserves earned powers, and remains completable after all upgrades', () => {
  const w = createMoonWorld(); const before = structuredClone(w);
  assert.equal(continueMoonOvertime(w), false); assert.deepEqual(w, before);
  w.phase = 'won'; w.player.hp = 1; w.player.spread = true; w.upgrades = ['spread']; w.score = 9000;
  assert.equal(continueMoonOvertime(w), true); assert.equal(w.cycle, 1); assert.equal(w.player.hp, 3); assert.equal(w.player.spread, true); assert.equal(w.score, 9000); assert.equal(w.quota, 14);
  w.upgrades = MOON_UPGRADES.map(u => u.id); w.player.x = w.moon.x; w.player.y = w.moon.y; w.player.bag = 1; w.rent = w.quota - 1;
  stepMoon(w); assert.deepEqual(w.offers, ['lunch']); assert.equal(chooseMoonUpgrade(w, 'lunch'), true); assert.equal(w.shift, 2); assert.equal(w.player.hp, w.player.maxHp);
  const daily = createMoonWorld(1, { mode: 'daily' }); daily.phase = 'won'; assert.equal(continueMoonOvertime(daily), false);
});
test('moon a final donated tooth defeats the Sun immediately, before another enemy tick', () => {
  const w = createMoonWorld(); w.shift = 3; upgrade(w, 'power'); w.boss.hp = 2;
  w.player.x = w.moon.x; w.player.y = w.moon.y; w.player.bag = 1; stepMoon(w);
  assert.equal(w.phase, 'won'); assert.equal(w.stats.suns, 1); const score = w.score;
  stepMoon(w); assert.equal(w.stats.suns, 1); assert.equal(w.score, score);
});
