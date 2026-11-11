import { QUARTERLIFE_VERSION, QUARTERLIFE_DAYS, QUARTERLIFE_RENT } from '../contracts.js';
import { normalizeSeed, random } from './rng.js';
import { LIFE_CARDS, LIFE_EVENTS, LIFE_UPGRADES } from './quarterlife-data.js';

const EVENT_DAYS = [3, 6, 10, 13, 17, 20, 24, 27];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const stats = ['cash', 'energy', 'peace', 'social'];
const has = (state, perk) => state.upgrades.includes(perk);
const sample = (state, items, count) => {
  const pool = [...items], out = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(random(state) * pool.length), 1)[0]);
  return out;
};

export function createLife(seed = 26) {
  return {
    version: QUARTERLIFE_VERSION, seed: normalizeSeed(seed), rngState: normalizeSeed(seed),
    day: 1, phase: 'playing', stats: { cash: 650, energy: 70, peace: 58, social: 52 },
    food: 0, tidy: 0, hand: ['cook', 'walk', 'gig'], previous: null, rerolled: false, petted: false,
    pending: null, offers: [], upgrades: [], usedEvents: [], memories: [], history: [],
    boundaries: 0, combos: 0, recoveries: 0, earnings: 0, spending: 0, points: 0,
    feed: [{ day: 1, title: 'A fresh-ish start', text: '$650. A full-time job. A plant with trust issues. Let’s make a month of it.', kind: 'life' }],
    last: null, ending: null,
  };
}

function log(state, title, text, kind = 'life') {
  state.feed.unshift({ day: state.day, title, text, kind });
  state.feed = state.feed.slice(0, 40);
}

function apply(state, effects) {
  for (const [key, amount] of Object.entries(effects)) {
    if (key === 'cash') {
      state.stats.cash += amount;
      if (amount > 0) state.earnings += amount;
      else state.spending -= amount;
    } else state.stats[key] = clamp(state.stats[key] + amount, 0, 100);
  }
}

function memory(state, title) {
  if (!state.memories.some(m => m.title === title)) {
    state.memories.push({ title, day: state.day });
    state.points += 100;
  }
}

export function comboFor(state, cardId) {
  const card = LIFE_CARDS[cardId];
  if (!card || !state.previous) return null;
  const previous = LIFE_CARDS[state.previous];
  if (state.previous === 'cook' && card.tag === 'social') return { title: 'Dinner-table lore', text: 'Cook → connect: +$25, +8 connection, +6 peace.', effects: { cash: 25, social: 8, peace: 6 } };
  if (previous.tag === 'move' && card.tag === 'create') return { title: 'Main-character energy', text: 'Move → create: +14 peace and a bonus memory.', effects: { peace: 14 }, memory: 'A little main-character moment' };
  if (previous.tag === 'work' && card.tag === 'rest') return { title: 'Work. Then actually stop.', text: 'Hustle → rest: +10 energy, +10 peace.', effects: { energy: 10, peace: 10 } };
  if (previous.tag === 'admin' && card.tag === 'rest') return { title: 'Nothing hanging over you', text: 'Admin → rest: +16 peace.', effects: { peace: 16 } };
  if (previous.tag === 'social' && card.tag === 'boundary') return { title: 'A social battery, respected', text: 'Connect → boundary: +10 energy, +8 peace.', effects: { energy: 10, peace: 8 } };
  return null;
}

export function cardEffects(state, id) {
  if (!Object.hasOwn(LIFE_CARDS, id)) return null;
  const card = LIFE_CARDS[id], effects = { ...card.effects };
  if (card.tag === 'rest' && has(state, 'pillow')) effects.energy = (effects.energy || 0) + 8;
  if (card.tag === 'social' && has(state, 'regulars')) effects.social = (effects.social || 0) + 6;
  if (card.tag === 'work' && has(state, 'rates')) effects.cash = (effects.cash || 0) + 35;
  return effects;
}

export function canPlay(state, id) {
  if (state.phase !== 'playing') return 'Finish the current moment first.';
  if (!Object.hasOwn(LIFE_CARDS, id) || (!state.hand.includes(id) && id !== 'sleep')) return 'That plan is not available.';
  const effects = cardEffects(state, id);
  if (effects.cash < 0 && state.stats.cash + effects.cash < 0) return 'Not enough cash. A free night still counts.';
  if (effects.energy < 0 && state.stats.energy + effects.energy < 0) return 'Your battery says no. Try a rest night.';
  return null;
}

function deal(state) {
  const all = Object.keys(LIFE_CARDS).filter(id => id !== 'sleep' && id !== state.previous);
  const result = sample(state, all, 3);
  // A setup always has its payoff next day. Sleep is permanently available.
  const tag = LIFE_CARDS[state.previous]?.tag;
  if (state.previous === 'cook') result[0] = 'host';
  else if (tag === 'move') result[0] = 'create';
  else if (tag === 'social') result[0] = 'boundary';
  state.hand = [...new Set(result)];
  while (state.hand.length < 3) state.hand.push(sample(state, all.filter(id => !state.hand.includes(id)), 1)[0]);
}

export function playCard(state, id) {
  const error = canPlay(state, id);
  if (error) return { ok: false, error };
  const card = LIFE_CARDS[id], effects = cardEffects(state, id), combo = comboFor(state, id);
  apply(state, effects);
  state.food += (card.food || 0) + (id === 'cook' && has(state, 'rice') ? 2 : 0);
  state.tidy = Math.min(7, state.tidy + (card.tidy || 0));
  if (card.memory) memory(state, card.memory);
  if (card.tag === 'boundary') state.boundaries++;
  let note = card.note;
  if (card.chance) {
    if (random(state) < 0.55) {
      apply(state, { peace: 18, social: 10 }); memory(state, 'A date worth leaving the house for');
      note = 'You talked until the café closed. They asked real questions. Wait. That was nice?';
    } else {
      apply(state, { peace: -6 }); memory(state, 'An extremely good bad-date story');
      note = 'They explained cryptocurrency for 38 minutes. The group chat is going to eat this up.';
    }
  }
  if (card.scroll) {
    if (random(state) < 0.3) {
      apply(state, { peace: 22 }); memory(state, 'The raccoon with the grape');
      note = 'The raccoon got the grape. You laughed until you cried. Rare algorithm W.';
    } else { apply(state, { energy: -5, peace: -6 }); note = 'It is somehow 1:14 am. You now know how to grout a bathroom you do not own.'; }
  }
  state.points += 20;
  if (combo) {
    apply(state, combo.effects); state.combos++; state.points += 75;
    if (combo.memory) memory(state, combo.memory);
    log(state, combo.title, combo.text, 'combo');
  }
  state.last = { title: combo?.title || card.title, text: note, combo: Boolean(combo) };
  log(state, card.title, note, 'action');
  state.history.push({ day: state.day, card: id, combo: Boolean(combo) });
  state.previous = id;
  settleDay(state);
  return { ok: true, combo: combo?.title || null };
}

function settleDay(state) {
  const weekend = (state.day - 1) % 7 >= 5;
  const fed = state.food > 0;
  if (fed) state.food--;
  apply(state, { energy: -(weekend ? 4 : 8) + (fed ? 4 : 0), peace: has(state, 'boundaries') ? -1 : -3, social: -3 });
  if (state.tidy > 0) { apply(state, { peace: 2 }); state.tidy--; }
  if ((state.day - 1) % 7 === 4) {
    apply(state, { cash: 420 }); log(state, 'Direct deposit hit. +$420', 'Your weekly take-home pay. Rich for approximately seven minutes.', 'money');
  }
  if (state.day % 7 === 0) {
    apply(state, { cash: -250 }); log(state, 'The boring bills. −$250', 'Groceries, utilities, transport, and your ordinary life. Rent is separate.', 'money');
  }
  if (state.stats.energy === 0 || state.stats.peace === 0) {
    state.recoveries++;
    apply(state, { energy: 18, peace: 15 });
    log(state, 'A very human reset', 'You hit a wall. An early night and a friend checking in got you moving again. No game over for being human.', 'life');
  }
  if (state.day === QUARTERLIFE_DAYS) { finishMonth(state); return; }
  if (EVENT_DAYS.includes(state.day)) {
    const available = LIFE_EVENTS.filter(e => !state.usedEvents.includes(e.id));
    state.pending = sample(state, available, 1)[0].id;
    state.usedEvents.push(state.pending); state.phase = 'event'; return;
  }
  afterMoment(state);
}

function afterMoment(state) {
  if (state.day % 7 === 0) {
    state.phase = 'upgrade';
    state.offers = sample(state, Object.keys(LIFE_UPGRADES).filter(id => !has(state, id)), 3);
  } else nextDay(state);
}

function nextDay(state) {
  state.day++; state.phase = 'playing'; state.rerolled = false; state.petted = false;
  state.pending = null; state.offers = []; deal(state);
}

export function resolveLifeEvent(state, index) {
  if (state.phase !== 'event' || !Number.isInteger(index)) return { ok: false, error: 'No choice to resolve.' };
  const event = LIFE_EVENTS.find(e => e.id === state.pending), option = event?.options[index];
  if (!option) return { ok: false, error: 'That choice is not available.' };
  if (option.effects.cash < 0 && state.stats.cash + option.effects.cash < 0) return { ok: false, error: 'That would cost more cash than you have.' };
  apply(state, option.effects);
  if (option.memory) memory(state, option.memory);
  if (option.boundary) state.boundaries++;
  state.food += option.food || 0;
  state.tidy = Math.min(7, state.tidy + (option.tidy || 0));
  state.last = { title: option.label, text: option.reply, combo: false };
  log(state, event.title, option.reply, 'message');
  state.pending = null; afterMoment(state);
  return { ok: true };
}

export function chooseLifeUpgrade(state, id) {
  if (state.phase !== 'upgrade' || !state.offers.includes(id)) return { ok: false, error: 'That upgrade is not available.' };
  state.upgrades.push(id);
  if (id === 'buffer') apply(state, { cash: 130 });
  log(state, LIFE_UPGRADES[id].title, LIFE_UPGRADES[id].description, 'upgrade');
  state.last = { title: 'A little life upgrade', text: LIFE_UPGRADES[id].flavor, combo: true };
  nextDay(state); return { ok: true };
}

export function rerollPlans(state) {
  if (state.phase !== 'playing' || state.rerolled || state.stats.peace < 5) return { ok: false, error: 'You can rethink once a day, for 5 peace.' };
  apply(state, { peace: -5 }); state.rerolled = true;
  const pool = Object.keys(LIFE_CARDS).filter(id => id !== 'sleep' && !state.hand.includes(id));
  state.hand = sample(state, pool, 3);
  return { ok: true };
}

export function petCat(state) {
  if (state.phase !== 'playing' || state.petted) return { ok: false, error: 'Miso is recharging. More pets tomorrow.' };
  state.petted = true; apply(state, { peace: 3 });
  return { ok: true };
}

function finishMonth(state) {
  apply(state, { cash: -QUARTERLIFE_RENT });
  state.phase = 'ended'; state.hand = []; state.pending = null; state.offers = [];
  const solvent = state.stats.cash >= 0;
  const balanced = ['energy', 'peace', 'social'].every(key => state.stats[key] >= 25);
  const richLife = state.memories.length >= 4;
  const boundaried = state.boundaries >= 3;
  const wins = Number(solvent) + Number(balanced) + Number(richLife) + Number(boundaried);
  const title = wins === 4 ? 'A life that actually feels like yours.' : solvent && richLife ? 'Rent paid. Lore acquired.' : solvent ? 'The bills are paid. You’re still becoming.' : 'A plot twist. Not a verdict.';
  const text = wins === 4 ? 'You made room for your people, your peace, and your rent. Nobody has it all figured out. You figured out enough.' : solvent ? 'You kept the lights on and made it through a month of being a person. There is no perfect run at being 26.' : `You’re $${Math.abs(state.stats.cash)} short after rent. That is a problem to solve, not a personality trait. Next month is another run.`;
  state.points += wins * 250 + state.combos * 25 + Math.round((state.stats.energy + state.stats.peace + state.stats.social) * 2);
  state.ending = { title, text, solvent, balanced, richLife, boundaried, wins, score: state.points };
  log(state, solvent ? 'Rent is paid. You did it.' : 'Rent needs a plan.', text, 'money');
}

/** Validate before accepting persisted state. No migration exists before initial v1. */
export function validLife(state) {
  if (!state || state.version !== QUARTERLIFE_VERSION) return false;
  if (!Number.isInteger(state.seed) || state.seed < 0 || state.seed > 0xffffffff || !Number.isInteger(state.rngState) || state.rngState < 0 || state.rngState > 0xffffffff) return false;
  if (!Number.isInteger(state.day) || state.day < 1 || state.day > 28 || !['playing', 'event', 'upgrade', 'ended'].includes(state.phase)) return false;
  if (!state.stats || stats.some(key => !Number.isSafeInteger(state.stats[key]))) return false;
  if (['energy', 'peace', 'social'].some(key => state.stats[key] < 0 || state.stats[key] > 100)) return false;
  for (const key of ['food', 'tidy', 'boundaries', 'combos', 'recoveries', 'earnings', 'spending', 'points']) if (!Number.isSafeInteger(state[key]) || state[key] < 0 || state[key] > 1000000) return false;
  if (typeof state.petted !== 'boolean' || typeof state.rerolled !== 'boolean') return false;
  for (const [key, source, max] of [['hand', LIFE_CARDS, 3], ['offers', LIFE_UPGRADES, 3], ['upgrades', LIFE_UPGRADES, 3]]) {
    if (!Array.isArray(state[key]) || state[key].length > max || new Set(state[key]).size !== state[key].length || state[key].some(id => typeof id !== 'string' || !Object.hasOwn(source, id))) return false;
  }
  if (state.previous !== null && !Object.hasOwn(LIFE_CARDS, state.previous)) return false;
  const short = value => typeof value === 'string' && value.length <= 1000;
  if (!Array.isArray(state.history) || state.history.length > 28 || state.history.some((h, i) => !h || !Object.hasOwn(LIFE_CARDS, h.card) || h.day !== i + 1 || typeof h.combo !== 'boolean')) return false;
  if (state.previous !== (state.history.at(-1)?.card ?? null)) return false;
  if (state.upgrades.length !== Math.floor((state.day - 1) / 7)) return false;
  if (!Array.isArray(state.memories) || state.memories.length > 40 || state.memories.some(m => !m || !short(m.title) || !Number.isInteger(m.day) || m.day < 1 || m.day > 28)) return false;
  if (!Array.isArray(state.feed) || state.feed.length > 40 || state.feed.some(f => !f || !short(f.title) || !short(f.text) || !short(f.kind) || !Number.isInteger(f.day))) return false;
  if (!Array.isArray(state.usedEvents) || state.usedEvents.length > 8 || new Set(state.usedEvents).size !== state.usedEvents.length || state.usedEvents.some(id => !LIFE_EVENTS.some(e => e.id === id))) return false;
  if (state.last !== null && (!state.last || !short(state.last.title) || !short(state.last.text) || typeof state.last.combo !== 'boolean')) return false;
  const ended = state.phase === 'ended';
  if (ended) {
    if (state.day !== 28 || state.history.length !== 28 || !state.ending || !short(state.ending.title) || !short(state.ending.text) || !Number.isSafeInteger(state.ending.score) || !Number.isInteger(state.ending.wins)) return false;
    if (['solvent', 'balanced', 'richLife', 'boundaried'].some(key => typeof state.ending[key] !== 'boolean')) return false;
  } else if (state.ending !== null) return false;
  if (state.phase === 'event' && (!EVENT_DAYS.includes(state.day) || !state.usedEvents.includes(state.pending))) return false;
  if (state.phase !== 'event' && state.pending !== null) return false;
  if (state.phase === 'upgrade' && (state.day % 7 !== 0 || state.offers.length !== 3 || state.offers.some(id => state.upgrades.includes(id)))) return false;
  if (state.phase !== 'upgrade' && state.offers.length) return false;
  if (state.phase === 'playing' && (state.hand.length !== 3 || state.history.length !== state.day - 1)) return false;
  if (['event', 'upgrade'].includes(state.phase) && state.history.length !== state.day) return false;
  return true;
}
