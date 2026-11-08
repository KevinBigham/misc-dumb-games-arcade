import { newSeason, record } from '../src/game.mjs';
import { rotateRead, starsGas, trainRide, randomStrategy, playSeason } from './strategies.mjs';
import { validateContent } from '../src/content.mjs';
import { CONFIG } from '../src/config.mjs';
console.log('content errors', validateContent(CONFIG));
const N = +process.argv[2] || 300;
for (const mk of [() => rotateRead, () => trainRide, () => starsGas, s => randomStrategy(s)]) {
  let succ = 0, wins = 0, draws = 0; const byFix = [0,0,0,0,0,0];
  let name;
  for (let s = 1; s <= N; s++) {
    const st = mk(s); name = st.name;
    const end = playSeason(newSeason('sweep-' + s), st);
    const r = record(end); wins += r.w; draws += r.d; if (r.w >= 4) succ++;
    end.results.forEach((x, i) => { if (x.outcome === 'W') byFix[i]++; });
  }
  console.log(name.padEnd(14), 'success', (100*succ/N).toFixed(1)+'%', 'avg W', (wins/N).toFixed(2), 'avg D', (draws/N).toFixed(2), 'win% by fixture', byFix.map(x => Math.round(100*x/N)).join(' '));
}
