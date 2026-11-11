import test from 'node:test';
import assert from 'node:assert/strict';
import { createLight, stepLight, chooseLight } from '../src/sim/last-light.js';
import { LIGHT } from '../src/contracts.js';
import { promiseSummary, councilWitness, describeLightRecord } from '../src/sim/last-light-story.js';
import { councilMarkup, resultMarkup, historyMarkup, ledgerMarkup } from '../src/last-light-view.js';
import { lightPilot } from './last-light-bot.js';
const enemy = (w, extra = {}) => ({ id: w.nextId++, kind: 'seeker', x: 100, y: 100, hp: 100, maxHp: 100, radius: 12, speed: 0, attack: 999, contact: 0, warmup: 0, angle: 0, flash: 0, phase: 1, beamCooldown: 999, summonCooldown: 999, ...extra });

test('Last Light depth: promises have no hidden statistical advantage', () => {
  const a = createLight(42, 'standard', 'memory'), b = createLight(42, 'standard', 'people');
  delete a.promise; delete b.promise; assert.deepEqual(a, b);
});

test('Last Light depth: the first sacrifice breaks a promise exactly once and records why', () => {
  const w = createLight(42, 'standard', 'memory'); stepLight(w, { pulsePressed: true });
  assert.equal(w.promise.broken, true); assert.equal(w.promise.tick, 1); assert.match(w.promise.reason, /Emergency pulse/i);
  const original = structuredClone(w.promise); w.player.pulseCooldown = 0; stepLight(w, { pulsePressed: true });
  assert.deepEqual(w.promise, original); assert.equal(w.journal.filter(entry => entry.kind === 'promise').length, 1);
  assert.match(promiseSummary(w).status, /BROKEN/);
});

test('Last Light depth: missed people remain named and break the rescue promise', () => {
  const w = createLight(42, 'standard', 'people'); const name = w.people[0].name; w.waveTick = LIGHT.waveTicks - 1;
  stepLight(w); assert.equal(w.promise.broken, true); assert.equal(w.missing.length, 2); assert.equal(w.missing[0].name, name);
  assert.equal(w.nights[0].lost.length, 2); assert.ok(councilWitness(w).text.includes(name));
});

test('Last Light depth: a dash hits each enemy once and rewards a dash kill', () => {
  const w = createLight(); w.player.shotCooldown = 999;
  const durable = enemy(w, { x: w.player.x + 25, y: w.player.y });
  const fragile = enemy(w, { x: w.player.x + 60, y: w.player.y, hp: 30 }); w.enemies = [durable, fragile];
  for (let i = 0; i < 8; i++) stepLight(w, { moveX: 1, dashPressed: i === 0 });
  assert.equal(durable.hp, 54); assert.equal(w.stats.dashKills, 1); assert.equal(w.player.hp, 100);
});

test('Last Light depth: sparks must be carried home to repair and never exceed health caps', () => {
  const w = createLight(); w.player.hp = 40; w.beacon.hp = 50;
  w.sparks = [{ id: w.nextId++, x: w.player.x, y: w.player.y, ttl: 900 }];
  stepLight(w); assert.equal(w.player.salvage, 1); assert.equal(w.beacon.hp, 50);
  w.player.x = 550; w.player.y = 370; stepLight(w);
  assert.equal(w.player.salvage, 0); assert.equal(w.beacon.hp, 51.2); assert.ok(w.player.hp > 41.5); assert.equal(w.stats.salvage, 1);
  w.player.salvage = 80; stepLight(w); assert.equal(w.beacon.hp, 100); assert.equal(w.player.hp, 100);
});

test('Last Light depth: Warden capture takes the full warning duration and counts a person once', () => {
  const w = createLight(42, 'standard', 'people'), person = w.people[0];
  w.player.x = 1060; w.player.y = 25; w.enemyCountdown = 9999; w.personCountdown = 9999;
  w.enemies = [enemy(w, { kind: 'warden', x: person.x + 28, y: person.y })];
  for (let i = 0; i < 239; i++) stepLight(w);
  assert.equal(w.missing.length, 0); assert.equal(person.capture, 239);
  stepLight(w); assert.equal(w.missing.length, 1); assert.equal(w.missing[0].name, person.name); assert.equal(w.promise.broken, true);
  for (let i = 0; i < 10; i++) stepLight(w); assert.equal(w.missing.length, 1);
});

test('Last Light depth: recruiting a scanned person immediately interrupts redaction', () => {
  const w = createLight(), person = w.people[0]; person.capture = 239;
  w.player.x = person.x; w.player.y = person.y;
  w.enemies = [enemy(w, { kind: 'warden', x: person.x + 28, y: person.y })];
  stepLight(w); assert.equal(person.following, true); assert.equal(person.capture, 0); assert.equal(w.stats.missed, 0);
});

test('Last Light depth: beam telegraphs do no damage; dash immunity works during the active beam', () => {
  for (const dash of [false, true]) {
    const w = createLight(); const boss = enemy(w, { kind: 'boss', x: 450, y: 465, hp: 900, maxHp: 900, warmup: 999 }); w.enemies = [boss];
    w.beams = [{ id: w.nextId++, owner: boss.id, x: 450, y: 465, angle: 0, warning: 4, total: 4, active: 3, width: 32, hit: false }];
    for (let i = 0; i < 4; i++) stepLight(w); assert.equal(w.player.hp, 100);
    stepLight(w, { moveX: 1, dashPressed: dash }); assert.equal(w.player.hp, dash ? 100 : 78);
    for (let i = 0; i < 3; i++) stepLight(w); assert.equal(w.beams.length, 0); assert.equal(w.stats.beamDodges, dash ? 1 : 0);
  }
});

test('Last Light depth: a pulse cancels warned beams and a dead boss cannot fire one', () => {
  const w = createLight(); const boss = enemy(w, { kind: 'boss', hp: 900, maxHp: 900 }); w.enemies = [boss];
  w.beams = [{ id: 99, owner: boss.id, x: 450, y: 465, angle: 0, warning: 0, active: 5, width: 32, hit: false }];
  boss.dead = true; stepLight(w); assert.equal(w.player.hp, 100); assert.equal(w.beams.length, 0);
  boss.dead = false; w.enemies = [boss]; w.beams = [{ id: 100, owner: boss.id, warning: 60, active: 5 }];
  stepLight(w, { pulsePressed: true }); assert.equal(w.beams.length, 0);
});

test('Last Light depth: paid council sacrifices are included in the next receipt and survivor response', () => {
  const w = createLight(42, 'story');
  for (let i = 0; i < LIGHT.waveTicks; i++) stepLight(w, lightPilot(w));
  assert.equal(w.phase, 'council'); const burned = w.memories[0].name; chooseLight(w, 'engine');
  for (let i = 0; i < LIGHT.waveTicks; i++) stepLight(w, lightPilot(w));
  assert.equal(w.phase, 'council'); assert.equal(w.nights[1].burned, 1); assert.equal(councilWitness(w).name, burned);
});

test('Last Light depth: record export preserves names without revealing erased story text', () => {
  const w = createLight(42, 'standard', 'memory'); const burnedText = w.memories[0].text;
  stepLight(w, { pulsePressed: true }); const text = describeLightRecord(w);
  assert.ok(!text.includes(burnedText)); assert.ok(text.includes(w.memories[0].name)); assert.match(text, /PROMISE/); assert.match(text, /erased on night 1/);
});

test('Last Light views: narrative projections are read-only and escape imported display text', () => {
  const w = createLight(); w.waveTick = LIGHT.waveTicks - 1; stepLight(w); const before = structuredClone(w);
  councilMarkup(w); resultMarkup(w); ledgerMarkup(w); historyMarkup([]); councilWitness(w); promiseSummary(w);
  assert.deepEqual(w, before);
  w.journal.push({ night: 1, tick: 0, text: '<img src=x onerror=evil()>' });
  assert.ok(!ledgerMarkup(w).includes('<img')); assert.ok(ledgerMarkup(w).includes('&lt;img'));
});

test('Last Light depth: sealing the gate has six named human consequences and breaks a rescue promise', () => {
  const w = createLight(42, 'standard', 'people');
  w.phase = 'council'; w.wave = 4; w.people = []; // A focused decision fixture.
  const before = w.personIndex;
  assert.ok(chooseLight(w, 'closed'));
  assert.equal(w.personIndex, before + 6); assert.equal(w.missing.length, 6);
  assert.equal(new Set(w.missing.map(p => p.name)).size, 6);
  assert.ok(w.missing.every(p => p.night === 5 && p.reason.includes('sealed')));
  assert.equal(w.promise.broken, true); assert.equal(w.promise.wave, 5);
  assert.equal(w.people.length, 0); assert.equal(w.mods.closed, true);
});

test('Last Light depth: the Editor announces a locked beam soon after its second phase begins', () => {
  const w = createLight(42, 'standard');
  const boss = enemy(w, { kind: 'boss', x: 800, y: 400, hp: 600, maxHp: 1100, beamCooldown: 180 });
  w.enemies = [boss]; w.player.shotCooldown = 999;
  for (let i = 0; i < 31; i++) stepLight(w);
  assert.equal(boss.phase, 2); assert.equal(w.beams.length, 1); assert.ok(w.beams[0].warning > 30);
  const locked = w.beams[0].angle; w.player.x = 100; w.player.y = 100; stepLight(w);
  assert.equal(w.beams[0].angle, locked, 'A warning must not retarget after the player commits to a dodge');
});
