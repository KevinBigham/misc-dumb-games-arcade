import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createLife, playCard, canPlay, comboFor, cardEffects, petCat, rerollPlans, resolveLifeEvent, chooseLifeUpgrade, validLife } from '../src/sim/quarterlife.js';
import { LIFE_CARDS, LIFE_EVENTS } from '../src/sim/quarterlife-data.js';
import { createLifeStorage } from '../src/quarterlife-storage.js';
import { QUARTERLIFE_KEY } from '../src/contracts.js';
import { renderLife, momentDialog } from '../src/quarterlife-view.js';
import { lifeEra, weekRecap, sceneCaption } from '../src/quarterlife-recap.js';

const copy = s => JSON.parse(JSON.stringify(s));
function advanceMoment(s) {
  if (s.phase === 'event') {
    const event = LIFE_EVENTS.find(e => e.id === s.pending);
    const i = event.options.findIndex(o => !o.effects.cash || s.stats.cash + o.effects.cash >= 0);
    assert.equal(resolveLifeEvent(s, i).ok, true);
  } else if (s.phase === 'upgrade') assert.equal(chooseLifeUpgrade(s, s.offers[0]).ok, true);
}

function playMonth(s, policy = 'balanced') {
  let safety = 0;
  while (s.phase !== 'ended' && safety++ < 100) {
    assert.equal(validLife(s), true, `day ${s.day}: ${s.phase}`);
    if (s.phase !== 'playing') { advanceMoment(s); continue; }
    let choice = 'sleep';
    if (policy === 'balanced' && s.stats.energy > 35) {
      choice = s.hand.find(id => !canPlay(s, id) && LIFE_CARDS[id].tag === 'work' && s.stats.cash < 1800)
        || s.hand.find(id => !canPlay(s, id)) || 'sleep';
    }
    assert.equal(playCard(s, choice).ok, true);
  }
  assert.equal(s.phase, 'ended');
  assert.equal(validLife(s), true);
  return s;
}

test('fixed daily economy, Friday pay, Sunday bills, and final rent settle exactly once', () => {
  const s = createLife(26); let day5, day7;
  while (s.day < 8) {
    if (s.phase !== 'playing') { advanceMoment(s); continue; }
    const before = s.stats.cash, day = s.day;
    playCard(s, 'sleep');
    if (day === 5) day5 = s.stats.cash - before;
    if (day === 7) day7 = s.stats.cash - before;
  }
  assert.equal(day5, 420); assert.equal(day7, -250);
  while (s.day < 28) { if (s.phase === 'playing') playCard(s, 'sleep'); else advanceMoment(s); }
  const before = s.stats.cash;
  playCard(s, 'sleep');
  assert.equal(s.stats.cash - before, -1450);
  const final = copy(s);
  assert.equal(playCard(s, 'sleep').ok, false);
  assert.deepEqual(s, final);
});

test('one action spends one evening, events spend none, and combos pay once', () => {
  const s = createLife(99);
  playCard(s, 'cook');
  assert.equal(s.day, 2); assert.equal(s.food, 3); assert.ok(s.hand.includes('host'));
  assert.equal(comboFor(s, 'host').title, 'Dinner-table lore');
  const cash = s.stats.cash;
  playCard(s, 'host');
  assert.equal(s.stats.cash, cash - 35 + 25); assert.equal(s.combos, 1); assert.equal(s.memories.length, 1);
  playCard(s, 'sleep'); assert.equal(s.day, 3); assert.equal(s.phase, 'event');
  assert.equal(s.history.length, 3);
  advanceMoment(s);
  assert.equal(s.day, 4); assert.equal(s.history.length, 3);
});

test('work-rest and walk-create combos have distinct rewards', () => {
  const s = createLife();
  playCard(s, 'gig');
  assert.equal(comboFor(s, 'sleep').effects.energy, 10);
  const energy = s.stats.energy;
  playCard(s, 'sleep');
  assert.equal(s.stats.energy, Math.min(100, energy + 29 + 10) - 8);
  const t = createLife(); playCard(t, 'walk');
  assert.ok(t.hand.includes('create')); playCard(t, 'create');
  assert.equal(t.combos, 1); assert.equal(t.memories.length, 2);
});

test('impossible and out-of-phase actions do not mutate state or consume randomness', () => {
  const s = createLife(); s.stats.cash = 0; s.stats.energy = 1;
  for (const id of ['cook', 'gig', 'unknown', '__proto__', 'toString']) {
    const before = copy(s); assert.equal(playCard(s, id).ok, false); assert.deepEqual(s, before);
  }
  assert.equal(playCard(s, 'sleep').ok, true);
  const before = copy(s);
  assert.equal(resolveLifeEvent(s, 0).ok, false); assert.equal(chooseLifeUpgrade(s, 'buffer').ok, false);
  assert.deepEqual(s, before);
});

test('petting and rerolling are limited per day; rerolls replace all three offers', () => {
  const s = createLife(); const peace = s.stats.peace;
  assert.equal(petCat(s).ok, true); assert.equal(s.stats.peace, peace + 3);
  const after = copy(s); assert.equal(petCat(s).ok, false); assert.deepEqual(s, after);
  const hand = [...s.hand]; rerollPlans(s);
  assert.ok(s.hand.every(id => !hand.includes(id))); assert.equal(s.hand.length, 3);
  const rerolled = copy(s); assert.equal(rerollPlans(s).ok, false); assert.deepEqual(s, rerolled);
  playCard(s, 'sleep'); assert.equal(s.petted, false); assert.equal(s.rerolled, false);
});

test('all random outcomes are deterministic and save/load continues the identical month', () => {
  const a = createLife(892), b = createLife(892);
  assert.deepEqual(playMonth(a), playMonth(b));
  const c = createLife(34);
  for (let i = 0; i < 11; i++) { if (c.phase === 'playing') playCard(c, 'sleep'); else advanceMoment(c); }
  const restored = copy(c); assert.equal(validLife(restored), true);
  assert.deepEqual(playMonth(c), playMonth(restored));
});

test('100 seeded months complete with bounded meters, unique events and upgrades', () => {
  const ends = [];
  for (let seed = 1; seed <= 100; seed++) {
    const s = playMonth(createLife(seed));
    assert.equal(s.history.length, 28); assert.equal(s.usedEvents.length, 8);
    assert.equal(new Set(s.usedEvents).size, 8); assert.equal(s.upgrades.length, 3);
    assert.equal(new Set(s.upgrades).size, 3); ends.push(s.stats.cash);
    for (const key of ['energy', 'peace', 'social']) assert.ok(s.stats[key] >= 0 && s.stats[key] <= 100);
  }
  assert.ok(ends.some(cash => cash >= 0), 'At least one rent-paid path must exist');
});

test('rest is always available, even with negative cash, and a zero meter recovers', () => {
  const s = createLife(); s.stats.cash = -250; s.stats.peace = 0; s.stats.energy = 0;
  assert.equal(canPlay(s, 'sleep'), null);
  playCard(s, 'sleep'); assert.equal(s.recoveries, 0); // Rest itself restores peace.
  s.stats.peace = 1; s.hand = ['gig', 'walk', 'cook']; s.stats.energy = 50;
  playCard(s, 'gig'); assert.equal(s.recoveries, 1); assert.ok(s.stats.peace > 0);
});

test('perk effects are applied to previews and actual card effects', () => {
  const s = createLife(); s.upgrades = ['pillow', 'regulars', 'rates'];
  assert.equal(cardEffects(s, 'sleep').energy, 37);
  assert.equal(cardEffects(s, 'host').social, 28);
  assert.equal(cardEffects(s, 'gig').cash, 170);
  const cash = s.stats.cash; playCard(s, 'gig'); assert.equal(s.stats.cash, cash + 170);
});

test('save schema rejects bad fields and preserves unknown versions and corrupt saves', () => {
  const fixture = createLife();
  for (const mutate of [s => s.version = 55, s => s.day = 99, s => s.stats.energy = NaN, s => s.hand = ['__proto__'], s => s.seed = -1, s => s.phase = 'event', s => s.memories = [{ title: 7 }], s => s.upgrades = ['pillow', 'pillow'], s => s.last = {}, s => s.rngState = 3.5]) {
    const invalid = copy(fixture); mutate(invalid); assert.equal(validLife(invalid), false);
  }
  for (const raw of ['{bad-json', JSON.stringify({version: 99, future: 'KEEP ME'})]) {
    const map = new Map([[QUARTERLIFE_KEY, raw], ['sideline.franchise', 'original']]);
    const store = createLifeStorage({ getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) });
    assert.equal(store.load(), null); assert.equal(store.blocked, true);
    assert.equal(store.save(fixture), false); assert.equal(map.get(QUARTERLIFE_KEY), raw);
    assert.equal(map.get('sideline.franchise'), 'original');
  }
});

test('save round-trip and quota failures are explicit', () => {
  const map = new Map(), store = createLifeStorage({ getItem: key => map.get(key), setItem: (key, value) => map.set(key, value) });
  const s = createLife(88); playCard(s, 'walk');
  assert.equal(store.save(s), true); assert.deepEqual(store.load(), s);
  const failed = createLifeStorage({getItem: () => null, setItem: () => { throw Error('quota'); }});
  assert.equal(failed.save(s), false); assert.match(failed.warning, /could not save/);
});

test('rendering every phase is pure and saves cannot inject markup', () => {
  const s = createLife(); s.feed[0].title = '<img src=x onerror=alert(1)>';
  const before = copy(s); const html = renderLife(s);
  assert.deepEqual(s, before); assert.ok(!html.includes('<img src=x')); assert.ok(html.includes('&lt;img'));
  for (let i = 0; i < 3; i++) playCard(s, 'sleep');
  const snapshot = copy(s); assert.ok(momentDialog(s).includes('modal-title')); assert.deepEqual(s, snapshot);
});

test('initial fixture remains compatible with v1', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/quarterlife-v1.json', import.meta.url), 'utf8'));
  assert.equal(validLife(fixture), true); assert.deepEqual(fixture, createLife(26));
});

test('save-before-load and stale tabs cannot overwrite a protected or newer save', () => {
  const future = JSON.stringify({version: 999});
  const map = new Map([[QUARTERLIFE_KEY, future]]);
  const backend = {getItem: key => map.get(key), setItem: (key,value) => map.set(key,value)};
  assert.equal(createLifeStorage(backend).save(createLife()), false);
  assert.equal(map.get(QUARTERLIFE_KEY), future);
  map.clear();
  const first = createLifeStorage(backend), second = createLifeStorage(backend);
  first.load(); second.load();
  const s = createLife(); first.save(s); playCard(s, 'walk'); first.save(s);
  const newer = map.get(QUARTERLIFE_KEY);
  assert.equal(second.save(createLife()), false); assert.equal(map.get(QUARTERLIFE_KEY), newer);
  assert.match(second.warning, /Another tab/);
});

test('each surprise always has a cash-free exit and choices do not consume evenings', () => {
  for (const event of LIFE_EVENTS) {
    const free = event.options.findIndex(o => !o.effects.cash || o.effects.cash >= 0);
    assert.notEqual(free, -1, event.id);
    const s = createLife(42);
    for(let i=0;i<3;i++)playCard(s,'sleep');
    s.pending = event.id; s.usedEvents = [event.id]; s.stats.cash = -100;
    const day = s.day, history = s.history.length;
    assert.equal(resolveLifeEvent(s, free).ok, true, event.id);
    assert.equal(s.day, day + 1); assert.equal(s.history.length, history); assert.equal(validLife(s), true);
  }
});

test('risk cards produce both outcomes across seeds without unseeded randomness', () => {
  const outcomes = new Set(), scrolls = new Set();
  for(let seed=0;seed<100;seed++) {
    const s=createLife(seed);s.hand=['date','scroll','walk'];playCard(s,'date');outcomes.add(s.last.text);
    const t=createLife(seed);t.hand=['date','scroll','walk'];playCard(t,'scroll');scrolls.add(t.last.text);
  }
  assert.equal(outcomes.size,2);assert.equal(scrolls.size,2);
});

test('recaps reflect actual choices and remain pure', () => {
  const s = playMonth(createLife(26), 'rest'), before = copy(s);
  assert.equal(lifeEra(s).name, 'Professionally Horizontal');
  assert.equal(weekRecap(s).rest, 7);
  assert.equal(typeof sceneCaption(s), 'string');
  assert.deepEqual(s,before);
});

test('portable build preserves dollar templates and compiles with no module requests', async () => {
  const html = await readFile(new URL('../twenty-six.html', import.meta.url),'utf8');
  assert.ok(html.includes("$${Math.abs(value).toLocaleString('en-US')}"));
  const script = html.match(/<script type="module">([\s\S]+)<\/script>/)[1];
  assert.doesNotThrow(()=>new Function(script));
  assert.doesNotMatch(script, /^import /m);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel="stylesheet"/);
});
