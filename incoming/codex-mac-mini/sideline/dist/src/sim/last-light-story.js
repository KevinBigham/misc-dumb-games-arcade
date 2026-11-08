import { PROMISES } from './last-light-data.js';

/** Read-only narrative projections. No moral score and no additional RNG draws. */
export function promiseSummary(w) {
  const promise = PROMISES.find(p => p.id === w.promise.id) || PROMISES[2];
  if (promise.id === 'none') return { ...promise, status: 'NO PROMISE MADE', detail: 'You chose to decide in the moment.' };
  if (w.promise.broken) return { ...promise, status: `BROKEN · NIGHT ${w.promise.wave}`, detail: w.promise.reason };
  return { ...promise, status: w.phase === 'won' ? 'KEPT THROUGH DAWN' : w.phase === 'lost' ? 'UNBROKEN WHEN THE LIGHT WENT OUT' : 'STILL KEPT', detail: w.phase === 'won' ? 'You reached dawn without breaking this promise.' : w.phase === 'lost' ? 'This promise remained intact when the run ended.' : 'Still holding, for now.' };
}

export function councilWitness(w) {
  const latest = w.nights.at(-1);
  const burned = latest?.burned ? w.memories.filter(m => m.status === 'burned').at(-1) : null;
  if (burned) return { name: burned.name, role: burned.role, text: [
    'I do not know what I lost. I know you kept me alive. Both things are true.',
    'Would I have said yes? I wish one of us could still answer that.',
    'Do not tell me it was only a story. Also: thank you for getting us through the night.',
  ][(w.wave - 1) % 3] };
  const person = [...w.memories].reverse().find(m => m.status === 'kept');
  if (!person) return { name: 'The archive', role: 'remaining transmission', text: 'There are people in the room. The record has nothing to say about them.' };
  if (latest?.lost.length) return { name: person.name, role: person.role, text: `${latest.lost[0]} was still outside when the light changed. Please keep their name in the report.` };
  if (w.wave === 3 && w.stats.burned === 0) return { name: person.name, role: person.role, text: 'You kept my story. I want you to know I would have understood if you needed to use it.' };
  return { name: person.name, role: person.role, text: [
    'When you came back for me, I stopped being a signal. I became someone again.',
    'The machine says we are doing well. I want to know what “well” means before we agree.',
    'You have been choosing for us all night. I am grateful. I am also frightened by how easy that is to get used to.',
    'Whatever happens tomorrow, please leave room for us to disagree with you.',
  ][w.wave - 1] };
}

export function lightRecord(w) {
  return {
    seed: w.seed, mode: w.mode, won: w.phase === 'won', night: w.wave,
    decision: w.finalDecision || null, promise: { ...w.promise },
    rescued: w.stats.rescued, burned: w.stats.burned, missed: w.stats.missed,
    kills: w.stats.kills, score: w.score, dashKills: w.stats.dashKills,
    choices: w.choices.map(c => c.id),
    keptNames: w.memories.filter(m => m.status !== 'burned').map(m => m.name),
    burnedNames: w.memories.filter(m => m.status === 'burned').map(m => m.name),
    missingNames: w.missing.map(m => m.name),
  };
}

export function describeLightRecord(w) {
  const promise = promiseSummary(w);
  return [
    'THE LAST LIGHT — THE HUMAN RECORD',
    `World ${w.seed} · ${w.mode.toUpperCase()} · ${w.phase === 'won' ? 'Reached dawn' : `Light lost on night ${w.wave}`}`,
    '', `PROMISE: ${promise.name}`, `${promise.status}: ${promise.detail}`,
    '', `${w.stats.rescued} people rescued. ${w.stats.burned} memories burned. ${w.stats.missed} people left outside.`,
    `Final decision: ${w.finalDecision === 'release' ? 'Broadcast the stories' : w.finalDecision === 'keep' ? 'Keep the archive' : 'The light went out'}`,
    '', 'YOUR DECISIONS', ...w.choices.map(c => `Night ${c.wave}: ${c.name}`),
    '', 'THE STORIES THAT REMAIN', ...w.memories.filter(m => m.status !== 'burned').map(m => `${m.name}, ${m.role}: “${m.text}”`),
    '', 'THE GAPS IN THE RECORD', ...w.memories.filter(m => m.status === 'burned').map(m => `${m.name}: erased on night ${m.burnedNight} (${m.reason}).`),
    '', 'THE PEOPLE STILL OUTSIDE', ...(w.missing.length ? w.missing.map(m => `${m.name}, ${m.role}: ${m.reason}, night ${m.night}.`) : ['Everyone who answered the signal came home.']),
    '', 'A record of what happened. Not a verdict on what it meant.',
  ].join('\n');
}
