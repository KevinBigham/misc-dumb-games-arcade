import { loadCore, playRun } from './core.mjs';
const L = loadCore(); const agg = {};
for (let i = 0; i < 20; i++) { const { s } = playRun(L, 'S' + i); for (const [k, v] of Object.entries(s.stats)) agg[k] = (agg[k] || 0) + v / 20; agg.nw = (agg.nw || 0) + L.netWorth(s) / 20; agg.minJoy = Math.min(agg.minJoy ?? 999, s.joy); }
console.log(Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, Math.round(v * 10) / 10])));
