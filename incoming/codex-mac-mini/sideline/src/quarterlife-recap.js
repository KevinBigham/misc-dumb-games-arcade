import { LIFE_CARDS } from './sim/quarterlife-data.js';

/** Presentation-only selectors. These never mutate a run or consume its RNG. */
export function lifeEra(state) {
  const count = tag => state.history.filter(h => LIFE_CARDS[h.card].tag === tag).length;
  if (count('rest') >= 13) return { name: 'Professionally Horizontal', line: 'CEO of finding out that a nap was the answer.', icon: 'moon' };
  if (count('work') >= 7) return { name: 'The Invoice Goblin', line: 'An ambitious little creature with a spreadsheet and a dream.', icon: 'laptop' };
  if (count('social') >= 7) return { name: 'The Glue Friend', line: 'You turned “we should hang out” into an actual location.', icon: 'heart' };
  if (state.boundaries >= 7) return { name: 'The Boundary Renaissance', line: 'Unavailable, respectfully. Thriving, intermittently.', icon: 'shield' };
  if (count('create') >= 5) return { name: 'The Side-Quest Romantic', line: 'You made room for the version of you that makes things.', icon: 'spark' };
  if (count('home') >= 5) return { name: 'Domestically Delusional', line: 'A stocked fridge and clean sheets. Basically an empire.', icon: 'bowl' };
  if (state.combos >= 6) return { name: 'Small-Win Stacking Legend', line: 'One tiny good decision quietly became another.', icon: 'check' };
  return { name: 'Doing My Best, Actually', line: 'Not a finished product. A pretty good person-in-progress.', icon: 'sun' };
}

export function weekRecap(state) {
  const first = Math.floor((state.day - 1) / 7) * 7 + 1;
  const actions = state.history.filter(h => h.day >= first);
  return {
    nights: actions.length,
    work: actions.filter(h => LIFE_CARDS[h.card].tag === 'work').length,
    rest: actions.filter(h => LIFE_CARDS[h.card].tag === 'rest').length,
    social: actions.filter(h => LIFE_CARDS[h.card].tag === 'social').length,
    memories: state.memories.filter(m => m.day >= first).length,
    combos: actions.filter(h => h.combo).length,
  };
}

export function sceneCaption(state) {
  if (state.stats.energy < 25) return 'Low battery. Still a whole person.';
  if (state.stats.social < 20) return 'Maybe send someone a little “hey.”';
  const last = LIFE_CARDS[state.previous];
  if (last?.tag === 'rest') return 'An evening without a deliverable.';
  if (last?.tag === 'social') return 'Still smiling about something they said.';
  if (last?.tag === 'work') return 'Laptop closed. Probably. Mostly.';
  if (last?.tag === 'create') return 'A little more you than yesterday.';
  if (last?.tag === 'boundary') return 'The quiet you actually wanted.';
  return 'A perfectly imperfect little life';
}
