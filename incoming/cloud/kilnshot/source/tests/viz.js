// Design visualizer: draws a level, sample trajectories of winning/partial shots, and the launch-grid outcome map.
// usage: node viz.js L03 [--step 20] [--prefix "[[vx,vy],...]"] -> /tmp/claude-.../viz-L03.png
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const { load, grid } = require('./lib.js');
const K = load();
const args = process.argv.slice(2);
const id = args[0]; let step = 20, prefix = [], outDir = process.env.VIZ_OUT || '/tmp/claude-0/-home-user/508f3823-ff59-53ff-9bd9-0b1c867cd7af/scratchpad';
for (let i = 1; i < args.length; i++) { if (args[i] === '--step') step = +args[++i]; if (args[i] === '--prefix') prefix = JSON.parse(args[++i]); }
const lvl = K.LEVELS.find(l => l.id === id) || (global.__custom);
const base = K.replay(lvl, prefix);
const total = K.secondsLeft(base);
const vecs = grid(step, K);
const res = [];
for (const v of vecs) {
  const w = K.cloneWorld(base); const paths = {};
  K.launch(w, v[0], v[1]);
  let g = 0;
  while (!K.shotOver(w) && g++ < 4000) { K.step(w); w.events.length = 0; if (g % 6 === 0) { for (const b of w.beads) if (b.alive) (paths[b.id] = paths[b.id] || []).push([b.x, b.y]); for (const p of w.pots) if (p.dyn) (paths['p' + p.id] = paths['p' + p.id] || []).push([p.x, p.y]); } }
  K.endShot(w);
  res.push({ v, broke: total - K.secondsLeft(w), keeper: w.keeperBroken, paths: Object.values(paths) });
}
const cmds=[]; let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700"><rect width="1000" height="700" fill="#f6ead2"/>`;
svg += `<g transform="translate(20,30)"><rect x="0" y="-500" width="360" height="1140" fill="none"/><rect width="360" height="640" fill="#fbf3e2" stroke="#999"/>`;
for (const s of base.segs) {
  if (s.frame) continue; const col = s.mat === 'spring' ? '#6a9a3a' : s.mat === 'clay' ? '#7a4a2a' : s.gate ? (base.gates[s.gate] ? '#a0522d' : '#e0c0a0') : '#555';
  svg += `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${col}" stroke-width="6" stroke-linecap="round" ${s.gate && !base.gates[s.gate] ? 'stroke-dasharray="4 4"' : ''}/>`;
}
for (const f of base.fans) svg += `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="rgba(80,160,255,.18)"/>`;
for (const p of base.pegs) svg += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="#777"/>`;
for (const l of base.latches) svg += `<circle cx="${l.x}" cy="${l.y}" r="${l.r}" fill="#d4a017"/><text x="${l.x - 4}" y="${l.y + 4}" font-size="10">${l.t.join('')}</text>`;
// sample trajectories
const wins = res.filter(r => !r.keeper && r.broke === total), parts = res.filter(r => !r.keeper && r.broke > 0 && r.broke < total);
const pick = (a, n) => a.filter((_, i) => i % Math.max(1, Math.floor(a.length / n)) === 0).slice(0, n);
const NP = +(process.env.NP || 3);
const best = parts.slice().sort((a, b) => b.broke - a.broke);
for (const r of (wins.length ? pick(wins, NP) : best.slice(0, NP))) for (const pa of r.paths) svg += `<polyline points="${pa.map(p => p.join(',')).join(' ')}" fill="none" stroke="${wins.length ? 'rgba(220,40,20,.8)' : 'rgba(230,120,0,.7)'}" stroke-width="1.5"/>`;
for (const p of base.pots) {
  if (p.broken) continue;
  if (p.cord) svg += `<line x1="${p.cord.ax}" y1="${p.cord.ay}" x2="${p.x}" y2="${p.y - p.r}" stroke="#b08" stroke-width="1.5"/>`;
  svg += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${p.kind === 'keeper' ? '#2f9c95' : (p.hard ? '#8a6' : '#c96')}" stroke="#333"/>`;
  if (p.n) svg += `<text x="${p.x - 4}" y="${p.y + 4}" font-size="11" fill="#fff">${p.n}</text>`;
}
svg += `<circle cx="${base.sling.x}" cy="${base.sling.y}" r="7" fill="orange" stroke="#000"/>`;
svg += `<text x="0" y="-10" font-size="14">${lvl.id} ${lvl.name} par ${lvl.par} | wins ${wins.length}/${res.length} partial ${parts.length} keeper ${res.filter(r => r.keeper).length}</text></g>`;
// outcome map: x = vx, y = vy
const M = K.CONFIG.MAXV, ox = 420, oy = 40, sc = 0.28;
svg += `<g transform="translate(${ox},${oy})"><text x="0" y="-8" font-size="13">launch map (x=vx, y=vy). red=win orange=partial teal=keeper broken</text>`;
for (const r of res) {
  const c = r.keeper ? '#2f9c95' : r.broke === total ? '#d22' : r.broke > 0 ? '#f90' : '#ddd';
  svg += `<rect x="${(r.v[0] + M) * sc}" y="${(r.v[1] + M) * sc}" width="${step * sc}" height="${step * sc}" fill="${c}"/>`;
}
svg += `<line x1="${M * sc}" y1="0" x2="${M * sc}" y2="${1400 * sc}" stroke="#000" stroke-width=".5"/></g></svg>`;
const f = path.join(outDir, 'viz-' + id + '.svg');
fs.writeFileSync(f, svg);
execSync(`python3 ${__dirname}/draw.py ${f} ${f.replace(".svg", ".png")}`);
console.log(f.replace('.svg', '.png'), 'wins', wins.length, 'partial', parts.length);
