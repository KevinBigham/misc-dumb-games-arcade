/** Deterministic balance survey; not a substitute for human playtesting. */
import { strict as assert } from 'node:assert';
import { writeFile, mkdir } from 'node:fs/promises';
import { createLight, stepLight, chooseLight, finishLight, availableChoices } from '../src/sim/last-light.js';
import { makeLightCheckpoint } from '../src/last-light-storage.js';
import { lightPilot } from './last-light-bot.js';
const routes = [
  { name: 'preserve', choices: ['fork','sentinel','precision','closed'], pulse: false },
  { name: 'spend', choices: ['engine','mercy','erase','open'], pulse: true },
  { name: 'rescue', choices: ['shelter','caravan','magnet','beacon'], pulse: true },
];
const runs = [];
for (const mode of ['standard','story']) for (const route of routes) for (let seed = 1; seed <= 20; seed++) {
  const world = createLight(seed,mode,'memory'); let ticks = 0;
  while (!['won','lost'].includes(world.phase) && ticks++ < 22000) {
    if (world.phase === 'council') {
      assert.ok(makeLightCheckpoint(world), 'Each council is recoverable');
      const choice = availableChoices(world).find(c => c.id === route.choices[world.wave - 1]);
      assert.ok(choice.available, 'The pilot must be able to take its designated route');
      assert.ok(chooseLight(world, choice.id)); assert.ok(makeLightCheckpoint(world));
    } else if (world.phase === 'ending') { assert.ok(makeLightCheckpoint(world)); finishLight(world, route.name === 'preserve' ? 'keep' : 'release'); }
    else { const input = lightPilot(world); if (!route.pulse) input.pulsePressed = false; stepLight(world, input); }
    assert.equal(world.stats.rescued, world.memories.length);
    assert.equal(world.stats.missed, world.missing.length);
    assert.ok(world.player.hp >= 0 && world.player.hp <= 100 && world.beacon.hp >= 0 && world.beacon.hp <= 100);
    assert.ok(world.enemies.length <= 70 && world.sparks.length <= 80 && world.beams.length <= 6);
  }
  assert.ok(['won','lost'].includes(world.phase), 'A run must terminate');
  runs.push({mode,route:route.name,seed,won:world.phase === 'won',...world.stats});
}
const summary = [];
for (const mode of ['standard','story']) for (const route of routes) {
  const group = runs.filter(r => r.mode === mode && r.route === route.name);
  const mean = key => Math.round(group.reduce((sum,r) => sum + r[key],0) / group.length * 10) / 10;
  summary.push({mode,route:route.name,completed:group.filter(r=>r.won).length,runs:group.length,rescued:mean('rescued'),burned:mean('burned'),missed:mean('missed')});
}
await mkdir('output/last-light',{recursive:true});
await writeFile('output/last-light/balance.json',JSON.stringify({summary,runs},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
