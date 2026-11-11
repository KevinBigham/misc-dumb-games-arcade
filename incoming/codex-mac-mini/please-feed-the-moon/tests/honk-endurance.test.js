import test from 'node:test';
import assert from 'node:assert/strict';
import { HONK } from '../src/contracts.js';
import { createHonk, stepHonk, chooseHonkUpgrade, continueHonkOvertime } from '../src/sim/honk.js';
import { honkPilot, HONK_PILOT_UPGRADES } from './honk-pilot.js';

function play(s, limit = 8000, quantized = false) {
  for (let i = 0; i < limit && !['won', 'lost'].includes(s.phase); i++) {
    if (s.phase === 'promotion') {
      assert.equal(chooseHonkUpgrade(s, HONK_PILOT_UPGRADES.find(id => s.offers.includes(id))), true);
    } else {
      const input = honkPilot(s);
      if (quantized) { input.x = Math.abs(input.x) > .25 ? Math.sign(input.x) : 0; input.y = Math.abs(input.y) > .25 ? Math.sign(input.y) : 0; }
      stepHonk(s, input);
    }
    assert.ok(s.enemies.length <= HONK.maxEnemies && s.papers.length <= HONK.maxPapers && s.stamps.length <= HONK.maxStamps);
    assert.ok(s.snacks.length <= 28 && s.chairs.length === 4);
    for (const body of [s.player, ...s.chairs, ...s.enemies]) assert.ok(Number.isFinite(body.x) && Number.isFinite(body.y));
    assert.ok(Number.isSafeInteger(s.score) && s.charge >= 0 && s.charge <= 100);
  }
  assert.ok(['won', 'lost'].includes(s.phase), 'run must reach an ending');
  return s;
}

test('twenty seeded careers and their overtime rounds complete using ordinary actions', () => {
  for (const mode of ['career', 'casual']) for (const seed of [1, 2, 3, 4, 5, 42, 99, 7321, 9999, 0xffffffff]) {
    const s = play(createHonk(seed, { mode }));
    assert.equal(s.phase, 'won', `${mode} office ${seed}`);
    assert.equal(s.upgrades.length, 2); assert.ok(s.stats.incidents >= 3);
    assert.equal(continueHonkOvertime(s), true); play(s, 3500);
    assert.equal(s.phase, 'won', `${mode} overtime ${seed}`); assert.equal(s.stats.bosses, 2);
  }
});

test('keyboard-direction input can finish the office and two overtime rounds', () => {
  const s = play(createHonk(7321, { mode: 'casual' }), 8000, true);
  assert.equal(s.phase, 'won');
  for (let round = 1; round <= 2; round++) {
    continueHonkOvertime(s); play(s, 3500, true);
    assert.equal(s.phase, 'won'); assert.equal(s.overtime, round);
  }
  assert.equal(s.stats.bosses, 3);
});
