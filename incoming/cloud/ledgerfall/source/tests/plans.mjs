import { loadCore, playRun } from './core.mjs';
const L = loadCore();
for (const plan of ['treat', 'balanced', 'saver', 'super']) {
  const runs = []; for (let i = 0; i < 30; i++) runs.push(playRun(L, 'P' + i, { plan }).s);
  const nw = runs.map(L.netWorth).sort((a, b) => a - b), won = runs.filter(s => s.over === 'finished').length;
  const avg = k => Math.round(runs.reduce((a, s) => a + s.stats[k], 0) / runs.length * 10) / 10;
  const relaxed = runs.reduce((a, s) => a + (L.mood(s) === 'relaxed'), 0);
  console.log(plan.padEnd(9), 'won', won + '/30', 'medNW', nw[15], 'min', nw[0], 'max', nw[29], 'impulses', avg('impulses'), 'cardInt', avg('cardInterest'), 'interest', avg('interestEarned'), 'covered', avg('covered'), 'chargedEm', avg('chargedEmerg'), 'endRelaxed', relaxed);
}
