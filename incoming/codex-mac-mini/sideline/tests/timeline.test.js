import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld } from '../src/sim/world.js';
import { activateFork, updateEchoes, recordFrame } from '../src/sim/timeline.js';

const frame = (x = 600, shots = []) => ({x, y: 360, aim: 0, shots});
const shot = {x: 600, y: 360, dx: 1, dy: 0, speed: 900, damage: 20, pierce: 0};
test('history retains exactly the last 240 completed immutable frames', () => {
  const w = createWorld(1); const shots = [{...shot}];
  recordFrame(w, shots); shots[0].damage = 999;
  assert.equal(w.player.history[0].shots[0].damage, 20);
  for (let i = 0; i < 300; i++) {w.player.x = i; recordFrame(w, []);}
  assert.equal(w.player.history.length, 240); assert.equal(w.player.history[0].x, 60);
});
test('Fork requires a second of history and wins over simultaneous dash', () => {
  const w = createWorld(1); w.player.history = Array.from({length: 59}, () => frame());
  assert.equal(activateFork(w, []), false); assert.equal(w.player.forkCharges, 2);
  w.player.history.push(frame()); w.player.hp = 41; w.player.fireCooldown = 20;
  const beforeRng = w.rngState; const events = stepWorld(w, {forkPressed: true, dashPressed: true});
  assert.equal(w.player.x, 600); assert.equal(w.player.hp, 41); assert.equal(w.player.forkCharges, 1);
  assert.equal(w.player.dashTicks, 0); assert.equal(w.player.fireCooldown, 19);
  assert.equal(w.player.history.length, 1); assert.equal(w.echoes[0].index, 0);
  assert.equal(w.rngState, beforeRng); assert.equal(events.filter(e => e.type === 'fork').length, 1);
});
test('echoes start next tick and replay recorded shots exactly once at captured damage', () => {
  const w = createWorld(1); w.tick = 100;
  w.player.history = Array.from({length: 60}, (_, i) => frame(600 + i, i % 20 === 0 ? [shot] : []));
  const events = []; assert.ok(activateFork(w, events));
  updateEchoes(w, events); assert.equal(w.projectiles.length, 0);
  w.player.damage = 500; const beforeRng = w.rngState;
  for (let i = 0; i < 60; i++) {w.tick++; updateEchoes(w, events);}
  assert.equal(w.projectiles.length, 3); assert.ok(w.projectiles.every(p => p.damage === 12));
  assert.equal(w.echoes.length, 0); assert.equal(w.rngState, beforeRng);
  assert.equal(events.filter(e => e.type === 'shot' && e.owner === 'echo').length, 3);
});
test('a third Fork retires the oldest echo without creating recursive history', () => {
  const w = createWorld(1);
  for (let i = 0; i < 3; i++) {w.tick++; w.player.forkCharges = 2; w.player.history = Array.from({length: 60}, () => frame()); activateFork(w, []);}
  assert.equal(w.echoes.length, 2); assert.equal(w.player.history.length, 0);
  assert.ok(w.echoes[0].bornTick < w.echoes[1].bornTick);
});
test('charges recharge sequentially over six seconds', () => {
  const w = createWorld(1); w.player.forkCharges = 0; w.player.forkRechargeTicks = 360;
  for (let i = 0; i < 360; i++) stepWorld(w, {});
  assert.equal(w.player.forkCharges, 1); assert.equal(w.player.forkRechargeTicks, 360);
  for (let i = 0; i < 360; i++) {w.player.hp = 100; stepWorld(w, {});}
  assert.equal(w.player.forkCharges, 2); assert.equal(w.player.forkRechargeTicks, 0);
});
test('a full Fork replays all 240 frames and preserves the live world', () => {
  const w = createWorld(1); w.tick = 300; w.player.hp = 25; w.score = 300;
  w.player.history = Array.from({length: 240}, (_, i) => frame(400 + i, i === 239 ? [shot] : []));
  const hostile = {id: 999, owner: 'enemy'}; w.projectiles.push(hostile);
  const events = []; activateFork(w, events);
  assert.equal(w.player.hp, 25); assert.equal(w.score, 300); assert.equal(w.projectiles[0], hostile);
  for (let i = 0; i < 239; i++) {w.tick++; updateEchoes(w, events);}
  assert.equal(w.echoes.length, 1); assert.equal(w.echoes[0].x, 638); assert.equal(w.projectiles.length, 1);
  w.tick++; updateEchoes(w, events); assert.equal(w.echoes.length, 0); assert.equal(w.projectiles.length, 2);
});
test('Fork immunity protects 18 collision steps and then expires', () => {
  const w = createWorld(1); w.player.history = Array.from({length: 60}, () => frame());
  stepWorld(w, {forkPressed: true}); assert.equal(w.player.invulnTicks, 18);
  for (let i = 0; i < 17; i++) stepWorld(w, {});
  assert.equal(w.player.invulnTicks, 1); stepWorld(w, {}); assert.equal(w.player.invulnTicks, 0);
});
test('echo shots never enter new player history and Arrival Shock rewards only nearby kills', () => {
  const w = createWorld(1); w.player.forkBurst = true;
  w.player.history = Array.from({length: 60}, () => frame(600, [shot]));
  w.enemies = [
    {id: 100, kind: 'chaser', x: 630, y: 360, prevX: 630, prevY: 360, hp: 40, maxHp: 40, radius: 13, spawnTicks: 0},
    {id: 101, kind: 'chaser', x: 850, y: 360, prevX: 850, prevY: 360, hp: 40, maxHp: 40, radius: 13, spawnTicks: 0},
  ];
  stepWorld(w, {forkPressed: true}); assert.equal(w.stats.kills, 1); assert.equal(w.stats.echoKills, 0);
  const events = stepWorld(w, {});
  assert.ok(events.some(event => event.type === 'shot' && event.owner === 'echo'));
  assert.ok(w.player.history.every(frame => frame.shots.length === 0));
  assert.equal(w.enemies.length, 1);
});
