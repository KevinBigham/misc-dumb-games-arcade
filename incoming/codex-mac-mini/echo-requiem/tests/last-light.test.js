import test from 'node:test';
import assert from 'node:assert/strict';
import { LIGHT } from '../src/contracts.js';
import { MEMORIES, COUNCILS } from '../src/sim/last-light-data.js';
import { createLight, stepLight, chooseLight, finishLight, protectMemory, nextMemory, keptMemories, availableChoices, waveLength, epitaph } from '../src/sim/last-light.js';
import { lightPilot } from './last-light-bot.js';

const enemy = (w, overrides = {}) => ({ id: w.nextId++, kind: 'seeker', x: 100, y: 100, hp: 30, maxHp: 30, radius: 12, speed: 0, attack: 200, contact: 0, warmup: 0, flash: 0, angle: 0, ...overrides });

test('Last Light: same seed and decisions reproduce every state, event, and story', () => {
  const a = createLight(1776), b = createLight('1776');
  for (let tick = 0; tick < 3000; tick++) {
    const input = lightPilot(a);
    assert.deepEqual(stepLight(a, input), stepLight(b, input));
    if (a.phase === 'council') { chooseLight(a, 'fork'); chooseLight(b, 'fork'); }
  }
  assert.deepEqual(a, b);
  assert.notDeepEqual(createLight(42).deck, createLight(43).deck);
});

test('Last Light: diagonal movement is normalized; invalid input cannot corrupt positions', () => {
  const straight = createLight(), diagonal = createLight();
  stepLight(straight, { moveX: 1, moveY: 0 }); stepLight(diagonal, { moveX: 1, moveY: 1 });
  assert.ok(Math.abs(Math.hypot(straight.player.x - 550, straight.player.y - 465) - Math.hypot(diagonal.player.x - 550, diagonal.player.y - 465)) < 1e-8);
  stepLight(diagonal, { moveX: Infinity, moveY: NaN, manualAim: true, aimX: NaN });
  assert.ok(Number.isFinite(diagonal.player.x) && Number.isFinite(diagonal.player.angle));
});

test('Last Light: recruitment alone does not count as rescue; the person must reach home', () => {
  const w = createLight(); const person = w.people[0];
  w.player.x = person.x; w.player.y = person.y;
  stepLight(w);
  assert.equal(person.following, true); assert.equal(w.stats.rescued, 2);
  w.player.x = w.beacon.x; w.player.y = w.beacon.y;
  for (let i = 0; i < 90; i++) stepLight(w);
  assert.equal(w.stats.rescued, 3); assert.ok(w.memories.some(m => m.name === person.name));
  assert.ok(!w.people.includes(person));
});

test('Last Light: pulse consumes one unprotected memory, preserves people, and damages the boss', () => {
  const w = createLight(); const first = w.memories[0];
  protectMemory(w, first.id);
  w.enemies = [enemy(w), enemy(w, { kind: 'boss', hp: 900, maxHp: 900 })];
  const events = stepLight(w, { pulsePressed: true });
  assert.equal(first.status, 'kept'); assert.equal(w.memories[1].status, 'burned');
  assert.equal(w.stats.rescued, 2); assert.equal(w.stats.kills, 1); assert.equal(w.stats.pulses, 1);
  assert.equal(w.enemies[0].hp, 775); assert.equal(events.filter(e => e.type === 'burn').length, 1);
  stepLight(w, { pulsePressed: true }); assert.equal(w.stats.burned, 1, 'cooldown must block duplicate sacrifice');
});

test('Last Light: a protected last memory cannot fuel a pulse or a paid upgrade', () => {
  const w = createLight(); w.memories[0].status = 'burned'; protectMemory(w, w.memories[1].id);
  const e = enemy(w); w.enemies = [e];
  stepLight(w, { pulsePressed: true }); assert.equal(e.hp, 30); assert.equal(w.stats.pulses, 0);
  w.phase = 'council'; const before = structuredClone(w);
  assert.equal(chooseLight(w, 'engine'), false); assert.deepEqual(w, before);
  assert.equal(availableChoices(w).find(c => c.id === 'engine').available, false);
});

test('Last Light: dash provides immunity and cannot be retriggered during cooldown', () => {
  const w = createLight(); w.enemies = [enemy(w, { x: w.player.x, y: w.player.y - 12 })];
  stepLight(w, { dashPressed: true }); assert.equal(w.player.hp, 100); assert.equal(w.player.dashCooldown, 100);
  stepLight(w, { dashPressed: true }); assert.equal(w.player.dashCooldown, 99);
});

test('Last Light: the archive and keeper can fail separately; death beats a dawn transition', () => {
  const w = createLight(); w.player.hp = 1; w.waveTick = LIGHT.waveTicks - 1;
  w.enemies = [enemy(w, { x: w.player.x, y: w.player.y })]; stepLight(w);
  assert.equal(w.phase, 'lost'); assert.equal(w.lossReason, 'keeper');
  const other = createLight(); other.beacon.hp = 1;
  other.enemies = [enemy(other, { kind: 'siege', x: 550, y: 370 })]; stepLight(other);
  assert.equal(other.phase, 'lost'); assert.equal(other.lossReason, 'archive');
});

test('Last Light: dawn clears hazards, counts missing people, and freezes time for the council', () => {
  const w = createLight(); w.waveTick = LIGHT.waveTicks - 1; w.player.hp = 45;
  const outside = w.people.length; stepLight(w);
  assert.equal(w.phase, 'council'); assert.equal(w.stats.missed, outside); assert.equal(w.player.hp, 70);
  assert.equal(w.people.length + w.enemies.length + w.bolts.length + w.hazards.length, 0);
  const tick = w.tick; for (let i = 0; i < 100; i++) stepLight(w, { pulsePressed: true }); assert.equal(w.tick, tick);
});

test('Last Light: every council option validates its phase and applies its advertised effect', () => {
  for (let wave = 1; wave <= 4; wave++) for (const option of COUNCILS[wave - 1].choices) {
    const w = createLight(); w.phase = 'council'; w.people = []; w.wave = wave; w.beacon.hp = 40; w.player.hp = 60;
    assert.equal(chooseLight(w, option.id), true, option.id); assert.equal(w.phase, 'playing'); assert.equal(w.wave, wave + 1); assert.equal(w.choices[0].id, option.id);
    const expected = { fork: () => w.mods.bolts === 2, shelter: () => w.beacon.hp === 75 && w.mods.healing === 2, engine: () => w.mods.fireRate === 12 && w.stats.burned === 1, caravan: () => w.mods.escort === 6, sentinel: () => w.mods.turret && w.player.speed === 206.8, mercy: () => w.mods.mercy, precision: () => w.mods.pierce === 3 && w.mods.damage > 17, magnet: () => w.mods.recruit === 96 && w.mods.magnet, erase: () => w.mods.orbit && w.stats.burned === 2, open: () => w.people.length === 8 && w.mods.spawnRate === 1.25, beacon: () => w.player.hp === 35 && w.people.filter(p => p.following).length === 4, closed: () => w.people.length === 0 && w.beacon.hp === 85 && w.mods.closed };
    assert.ok(expected[option.id](), `effect for ${option.id}`);
    const snapshot = structuredClone(w); assert.equal(chooseLight(w, option.id), false); assert.deepEqual(w, snapshot);
  }
});

test('Last Light: protection is exclusive and may be toggled; unknown ids cannot change it', () => {
  const w = createLight(); const [a, b] = w.memories;
  assert.ok(protectMemory(w, a.id)); assert.equal(nextMemory(w).id, b.id);
  assert.ok(protectMemory(w, b.id)); assert.equal(nextMemory(w).id, a.id);
  assert.equal(protectMemory(w, -1), false); assert.equal(w.protectedId, b.id);
  protectMemory(w, b.id); assert.equal(w.protectedId, null);
});

test('Last Light: the final night requires a defeated Editor and both final choices work', () => {
  for (const decision of ['keep', 'release']) {
    const w = createLight(); w.wave = 5; w.waveTick = waveLength(w) - 1; w.bossSpawned = true;
    stepLight(w); assert.equal(w.phase, 'playing');
    w.bossDefeated = true; stepLight(w); assert.equal(w.phase, 'ending');
    assert.equal(finishLight(w, 'invalid'), false); assert.equal(finishLight(w, decision), true);
    assert.equal(w.phase, 'won'); assert.equal(w.finalDecision, decision);
    assert.ok(w.memories.every(m => m.status === (decision === 'release' ? 'released' : 'kept')));
    assert.ok(epitaph(w).question.endsWith('?')); assert.equal(finishLight(w, 'keep'), false);
  }
});

test('Last Light: rescue-first pilot can finish all five nights without burning a memory', () => {
  const w = createLight(42, 'story'); const path = ['fork', 'sentinel', 'precision', 'closed'];
  for (let i = 0; i < 22000 && !['ending', 'lost'].includes(w.phase); i++) {
    if (w.phase === 'council') chooseLight(w, path[w.wave - 1]);
    const input = lightPilot(w); input.pulsePressed = false; stepLight(w, input);
  }
  assert.equal(w.phase, 'ending', JSON.stringify({ wave: w.wave, tick: w.tick, health: w.player.hp, archive: w.beacon.hp, stats: w.stats }));
  assert.equal(w.stats.burned, 0); assert.ok(w.stats.rescued >= 8); assert.ok(w.bossDefeated);
  assert.equal(new Set(w.memories.map(m => m.name)).size, w.memories.length);
  assert.ok(w.personIndex <= MEMORIES.length);
  finishLight(w, 'keep'); assert.match(epitaph(w).title, /unbroken/);
});

test('Last Light: presentation selectors do not mutate the simulation', () => {
  const w = createLight(); w.phase = 'council'; const before = structuredClone(w);
  nextMemory(w); keptMemories(w); availableChoices(w); waveLength(w); epitaph(w);
  assert.deepEqual(w, before);
});

test('Last Light: sentinel and orbital shield damage real threats without consuming memories', () => {
  const turret = createLight(); turret.mods.turret = true;
  turret.enemies = [enemy(turret, { x: 650, y: 370, hp: 200, maxHp: 200 })];
  turret.player.x = 25; turret.player.y = 25;
  for (let i = 0; i < 30; i++) stepLight(turret);
  assert.ok(turret.enemies[0].hp < 200); assert.equal(turret.stats.burned, 0);
  const orbit = createLight(); orbit.mods.orbit = true; orbit.tick = 7;
  orbit.enemies = [enemy(orbit, { x: orbit.player.x + 45, y: orbit.player.y, hp: 100 })];
  stepLight(orbit); assert.equal(orbit.enemies[0].hp, 88); assert.equal(orbit.stats.burned, 0);
});

test('Last Light: mercy pulse restores health and archive only when a sacrifice succeeds', () => {
  const w = createLight(); w.mods.mercy = true; w.player.hp = 30; w.beacon.hp = 40;
  stepLight(w, { pulsePressed: true }); assert.equal(w.player.hp, 60); assert.equal(w.beacon.hp, 65);
  stepLight(w, { pulsePressed: true }); assert.equal(w.player.hp, 60); assert.equal(w.beacon.hp, 65);
});

test('Last Light: Story mode reduces actual incoming damage and closed gates prevent new arrivals', () => {
  const amounts = ['standard', 'story'].map(mode => {
    const w = createLight(42, mode); w.enemies = [enemy(w, { x: w.player.x, y: w.player.y })];
    stepLight(w); return 100 - w.player.hp;
  });
  assert.ok(Math.abs(amounts[1] / amounts[0] - .55) < 1e-8);
  const w = createLight(); w.phase = 'council'; w.wave = 4; w.people = [];
  chooseLight(w, 'closed');
  for (let i = 0; i < 1800 && w.phase === 'playing'; i++) stepLight(w, lightPilot(w));
  assert.equal(w.people.length, 0); assert.equal(w.personIndex, 10);
  assert.equal(w.stats.missed, 6);
});

test('Last Light: split/piercing shots hit multiple targets; each bolt hits a target only once', () => {
  const w = createLight(); w.mods.bolts = 2; w.mods.pierce = 3;
  w.enemies = [enemy(w, { x: 650, y: 465, hp: 100 }), enemy(w, { x: 720, y: 465, hp: 100 })];
  stepLight(w, { manualAim: true, aimX: 1000, aimY: 465 }); assert.equal(w.bolts.length, 2);
  w.player.shotCooldown = 999;
  for (let i = 0; i < 20; i++) stepLight(w);
  assert.equal(w.enemies[0].hp, 74); assert.equal(w.enemies[1].hp, 74);
});

test('Last Light: the Editor appears once and emits radial hazards on its attack clock', () => {
  const w = createLight(); w.wave = 5; w.waveTick = 419;
  stepLight(w); const boss = w.enemies.find(e => e.kind === 'boss'); assert.ok(boss);
  boss.x = 800; boss.y = 370; boss.warmup = 0; boss.attack = 1;
  stepLight(w); assert.equal(w.hazards.length, 12); assert.equal(w.enemies.filter(e => e.kind === 'boss').length, 1);
});
