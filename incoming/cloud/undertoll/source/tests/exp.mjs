import { load } from './load.mjs'; import { playSeed } from './bot.mjs';
const env = load(); const BB = env.BB;
const sets = JSON.parse(process.argv[2]);
for (const set of sets) {
  Object.assign(BB.CONFIG.TIDE, set);
  const out = [];
  for (const cls of ['diver', 'ringer', 'salvager']) { let won = 0, drown = 0, act = 0; const N = 100; for (let i = 0; i < N; i++) { const r = playSeed(BB, 'e' + i, cls); if (r.over === 'won') won++; if (r.cause === 'drown') drown++; act += r.actions; } out.push(`${cls} win ${won} drown ${drown} act ${Math.round(act / N)}`); }
  console.log(JSON.stringify(set), '\n  ' + out.join('\n  '));
}
