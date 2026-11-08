// GameKit bots: node-only balance harness. Not pasted into games.
// Usage: const bots = require('./gk-bots.js');
//   bots.sweep({ knob, values, seeds, run(params, seed) -> {metric:number,...} })  -> { rows, summary, outliers }
//   bots.roundRobin({ strategies:{name:fn}, games, play(a, b, seed, nameA, nameB) -> 1 | 0 | 0.5 }) -> { table, overall, flags }
//   bots.usage(counts, allIds) -> ids never picked;   bots.toCSV(rows) / bots.writeCSV(file, rows)
'use strict';
const fs = require('fs');

function seeds(n, base) { const out = []; for (let i = 0; i < n; i++) out.push((base || 'seed') + '-' + i); return out; }
function quantile(sorted, q) { if (!sorted.length) return NaN; const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }
function stats(vals) {
  const s = vals.filter(v => typeof v === 'number' && isFinite(v)).sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / (s.length || 1);
  return { n: s.length, mean, min: s[0], p10: quantile(s, 0.1), p50: quantile(s, 0.5), p90: quantile(s, 0.9), max: s[s.length - 1] };
}
function toCSV(rows) {
  if (!rows.length) return '';
  const cols = []; rows.forEach(r => Object.keys(r).forEach(k => { if (!cols.includes(k)) cols.push(k); }));
  const cell = v => { if (v === undefined || v === null) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return cols.join(',') + '\n' + rows.map(r => cols.map(c => cell(r[c])).join(',')).join('\n') + '\n';
}
function writeCSV(file, rows) { fs.writeFileSync(file, toCSV(rows)); return file; }

// Sweep one knob over a grid of values, each against the same seeds. Flags the top and bottom 1% of seeds
// for every metric (across the whole sweep) so odd generated levels can be looked at by hand.
function sweep(o) {
  const knob = o.knob || 'value', values = o.values || [null], S = Array.isArray(o.seeds) ? o.seeds : seeds(o.seeds || 1000, o.seedBase);
  const rows = [];
  for (const v of values) for (const sd of S) {
    const params = Object.assign({}, o.base || {}); if (v !== null) params[knob] = v;
    let m; try { m = o.run(params, sd) || {}; } catch (e) { m = { error: String(e && e.message || e) }; }
    rows.push(Object.assign({ [knob]: v, seed: sd }, m));
  }
  const metrics = []; rows.forEach(r => Object.keys(r).forEach(k => { if (k !== knob && k !== 'seed' && typeof r[k] === 'number' && !metrics.includes(k)) metrics.push(k); }));
  const summary = values.map(v => { const sub = rows.filter(r => r[knob] === v), out = { [knob]: v }; metrics.forEach(k => { const st = stats(sub.map(r => r[k])); out[k + '_mean'] = +st.mean.toFixed(4); out[k + '_p10'] = st.p10; out[k + '_p50'] = st.p50; out[k + '_p90'] = st.p90; }); out.errors = sub.filter(r => r.error).length; return out; });
  const outliers = [], pct = o.outlierPct === undefined ? 0.01 : o.outlierPct;
  metrics.forEach(k => {
    const s = rows.filter(r => typeof r[k] === 'number').map(r => r[k]).sort((a, b) => a - b);
    if (s.length < 20) return;
    const lo = quantile(s, pct), hi = quantile(s, 1 - pct);
    if (lo === hi) return;
    rows.forEach(r => { if (typeof r[k] !== 'number') return; if (r[k] < lo) outliers.push({ metric: k, side: 'low', [knob]: r[knob], seed: r.seed, value: r[k] }); else if (r[k] > hi) outliers.push({ metric: k, side: 'high', [knob]: r[knob], seed: r.seed, value: r[k] }); });
  });
  const errors = rows.filter(r => r.error);
  if (o.csv) { writeCSV(o.csv, rows); writeCSV(o.csv.replace(/\.csv$/, '') + '.summary.csv', summary); if (outliers.length) writeCSV(o.csv.replace(/\.csv$/, '') + '.outliers.csv', outliers); }
  return { rows, summary, outliers, errors, metrics };
}

// Every strategy plays every other `games` times (sides swapped half the time).
// Flags any strategy that wins more than `dominant` (default 60%) against the field.
function roundRobin(o) {
  const names = Object.keys(o.strategies), games = o.games || 200, dom = o.dominant || 0.6, table = {}, totals = {};
  names.forEach(n => { table[n] = {}; totals[n] = { score: 0, games: 0 }; });
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const A = names[i], Bn = names[j]; let sa = 0;
    for (let g = 0; g < games; g++) {
      const sd = (o.seedBase || 'rr') + '-' + A + '-' + Bn + '-' + g, swap = g % 2 === 1;
      const r = swap ? 1 - o.play(o.strategies[Bn], o.strategies[A], sd, Bn, A) : o.play(o.strategies[A], o.strategies[Bn], sd, A, Bn);
      sa += r;
    }
    table[A][Bn] = sa / games; table[Bn][A] = 1 - sa / games;
    totals[A].score += sa; totals[A].games += games; totals[Bn].score += games - sa; totals[Bn].games += games;
  }
  const overall = {}; names.forEach(n => { overall[n] = totals[n].games ? totals[n].score / totals[n].games : 0; });
  const flags = names.filter(n => overall[n] > dom).map(n => ({ strategy: n, winRate: +overall[n].toFixed(3), note: 'beats the field more than ' + Math.round(dom * 100) + '%' }));
  const rows = names.map(n => Object.assign({ strategy: n, overall: +overall[n].toFixed(3) }, Object.fromEntries(names.filter(m => m !== n).map(m => ['vs_' + m, +table[n][m].toFixed(3)]))));
  if (o.csv) writeCSV(o.csv, rows);
  return { table, overall, flags, rows };
}

// Which choices (cards, upgrades, towers) did no bot ever pick?
function usage(counts, allIds) { return (allIds || Object.keys(counts)).filter(id => !(counts[id] > 0)); }

module.exports = { seeds, stats, quantile, toCSV, writeCSV, sweep, roundRobin, usage };
