// Pure-rules balance bot: plays many seeds with newRun/act only.
import { load } from './load.mjs';
export function makeBot(BB, opts = {}) {
  const { CONFIG, T, act, tideAt, tideETA, isKnown, WEAPONS, ARMORS } = BB;
  const W = CONFIG.W, H = CONFIG.H;
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]];
  const pass = t => t === T.FLOOR || t === T.UP || t === T.DOWN;
  const cheb = (a, b, c, d) => Math.max(Math.abs(a - c), Math.abs(b - d));
  function path(S, goal, avoidDeep, anyTile) {
    const d = new Int32Array(W * H).fill(-1), prev = new Int32Array(W * H).fill(-1);
    const s = S.p.y * W + S.p.x; d[s] = 0; const q = [s];
    for (let h = 0; h < q.length; h++) { const c = q[h], cx = c % W, cy = (c / W) | 0;
      if (goal(cx, cy) && c !== s) { const out = []; let k = c; while (k !== s) { out.push(k); k = prev[k]; } out.reverse(); return out.map(k => [k % W, (k / W) | 0]); }
      for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const n = ny * W + nx;
        if (d[n] >= 0 || (!S.seen[n] && !anyTile) || !pass(S.tiles[n])) continue;
        if (S.tiles[n] === T.DOWN && !goal(nx, ny)) continue;
        if (S.mobs.some(m => m.hp > 0 && m.x === nx && m.y === ny) && !goal(nx, ny)) continue;
        if (avoidDeep && tideAt(S, nx, ny) === 2 && !goal(nx, ny)) continue;
        d[n] = d[c] + 1; prev[n] = c; q.push(n); } }
    return null;
  }
  const avg = w => (w.dmg[0] + w.dmg[1]) / 2 + (w.acc || 0) * 0.3;
  const decide = function (S) { decide.route = null;
    const p = S.p, vis = S.mobs.filter(m => m.hp > 0 && S.vis[m.y * W + m.x]);
    const adj = vis.filter(m => cheb(m.x, m.y, p.x, p.y) === 1 && m.state !== 'sleep');
    const pk = S.p.pack;
    const idx = pred => pk.findIndex(pred);
    const mend = idx(it => it.k === 'brew' && it.id === 'mend' && isKnown(S, it));
    if (p.hp <= p.hpMax * 0.35 && mend >= 0 && (adj.length || p.hp <= p.hpMax * 0.25)) return { t: 'use', i: mend, mode: 'drink' };
    const boss = vis.find(m => m.type === 'boss');
    if (boss && boss.wind > 0 && cheb(boss.x, boss.y, p.x, p.y) <= 2 && !opts.noDodge) {
      let best = null, bd = -1; for (const [dx, dy] of DIRS) { const nx = p.x + dx, ny = p.y + dy; if (!pass(S.tiles[ny * W + nx]) || S.mobs.some(m => m.hp > 0 && m.x === nx && m.y === ny)) continue; const dd = cheb(nx, ny, boss.x, boss.y); if (dd > bd) { bd = dd; best = [dx, dy]; } }
      if (best) return { t: 'move', dx: best[0], dy: best[1] };
    }
    if (S.cls === 'ringer' && p.cd <= 0 && adj.length >= 2) return { t: 'ability' };
    // throw known bad brews at tough adjacent foes
    if (adj.length) {
      const tough = adj.find(m => ['gulper', 'boss', 'husk', 'jelly'].includes(m.type));
      const bad = idx(it => it.k === 'brew' && isKnown(S, it) && ['flame', 'still', 'murk'].includes(it.id));
      if (tough && bad >= 0) return { t: 'use', i: bad, mode: 'throw', x: tough.x, y: tough.y };
      const tgt = adj.sort((a, b) => a.hp - b.hp)[0];
      return { t: 'move', dx: tgt.x - p.x, dy: tgt.y - p.y };
    }
    // throw rivets at an approaching hunter
    const rv = idx(it => it.k === 'rivet');
    if (rv >= 0 && !opts.noRivet) { const h = vis.find(m => m.state === 'hunt' && cheb(m.x, m.y, p.x, p.y) >= 2 && cheb(m.x, m.y, p.x, p.y) <= 6);
      if (h) { const tp = BB.throwPath ? BB.throwPath(S, h.x, h.y) : null; if (!tp || tp.hit === h) return { t: 'use', i: rv, mode: 'throw', x: h.x, y: h.y }; } }
    // gear upgrades
    for (let i = 0; i < pk.length; i++) { const it = pk[i];
      if (it.k === 'weap') { const a = WEAPONS[it.id], b = WEAPONS[p.weapon.id]; if (avg(a) + it.plus > avg(b) + p.weapon.plus) return { t: 'use', i, mode: 'equip' }; }
      if (it.k === 'arm') { const a = ARMORS[it.id], b = ARMORS[p.armor.id]; if (a.armor + a.eva * 0.5 + it.plus > b.armor + b.eva * 0.5 + p.armor.plus) return { t: 'use', i, mode: 'equip' }; } }
    // identify-by-use when safe
    const calm = !vis.some(m => m.state === 'hunt');
    if (calm && !opts.noId) {
      const ub = idx(it => it.k === 'brew' && !isKnown(S, it));
      if (ub >= 0 && p.hp >= p.hpMax * 0.9) return { t: 'use', i: ub, mode: 'drink' };
      const us = idx(it => it.k === 'shell' && !isKnown(S, it));
      if (us >= 0 && p.hp >= p.hpMax * 0.7) return { t: 'use', i: us, mode: 'blow' };
      const ho = idx(it => it.k === 'shell' && isKnown(S, it) && (it.id === 'honing' || it.id === 'hardening'));
      if (ho >= 0) return { t: 'use', i: ho, mode: 'blow' };
      const vg = idx(it => it.k === 'brew' && isKnown(S, it) && it.id === 'vigor');
      if (vg >= 0) return { t: 'use', i: vg, mode: 'drink' };
    }
    // known shell of calm if tide is on top of us
    if (tideAt(S, p.x, p.y) === 2) { const c = idx(it => it.k === 'shell' && isKnown(S, it) && it.id === 'calm'); if (c >= 0) return { t: 'use', i: c, mode: 'blow' };
      const g = idx(it => it.k === 'brew' && isKnown(S, it) && it.id === 'gills'); if (g >= 0 && p.gills <= 0) return { t: 'use', i: g, mode: 'drink' }; }
    // regen if hurt and nothing around and tide far
    const ft = S.T - S.floorStart;
    const hurry = S.down && S.seen[S.down.y * W + S.down.x] && (tideETA(S, p.x, p.y, 2) < 25 || ft > 140);
    if (!hurry && p.hp < p.hpMax * 0.5 && calm && tideETA(S, p.x, p.y, 1) > 30 && !opts.noRest) return { t: 'wait' };
    // hunting foes in sight: go fight
    const hunter = vis.filter(m => m.state === 'hunt' || (m.state === 'sleep' && cheb(m.x, m.y, p.x, p.y) <= 5 && !hurry)).sort((a, b) => cheb(a.x, a.y, p.x, p.y) - cheb(b.x, b.y, p.x, p.y))[0];
    let route = null;
    if (hunter && !hurry) route = path(S, (x, y) => cheb(x, y, hunter.x, hunter.y) === 1 && !(x === hunter.x && y === hunter.y), true);
    if (boss && !route) route = path(S, (x, y) => cheb(x, y, boss.x, boss.y) === 1, false);
    if (!route && !hurry) { const items = S.items.filter(o => S.seen[o.y * W + o.x] && tideAt(S, o.x, o.y) < 2 && cheb(o.x, o.y, p.x, p.y) <= 10);
      if (items.length || S.grave) route = path(S, (x, y) => items.some(o => o.x === x && o.y === y) || (S.grave && S.grave.x === x && S.grave.y === y && S.seen[y * W + x]), true); }
    if (!route && S.down && S.seen[S.down.y * W + S.down.x] && (hurry || ft > 60 || opts.rush)) route = path(S, (x, y) => x === S.down.x && y === S.down.y, false, !!S.drainHint);
    if (!route) route = path(S, (x, y) => { for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !S.seen[ny * W + nx]) return true; } return false; }, true);
    if (!route && S.down && S.seen[S.down.y * W + S.down.x]) route = path(S, (x, y) => x === S.down.x && y === S.down.y, false);
    if (!route) route = path(S, (x, y) => { for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !S.seen[ny * W + nx]) return true; } return false; }, false);
    if (!route && S.drainHint && S.down) route = path(S, (x, y) => x === S.down.x && y === S.down.y, false, true);
    if (!route || !route.length) return { t: 'wait' };
    decide.route = route; const [nx, ny] = route[0]; return { t: 'move', dx: nx - p.x, dy: ny - p.y };
  };
  return decide;
}
export function playSeed(BB, seed, cls = 'diver', opts = {}) {
  const { S } = BB.newRun({ cls, seed });
  const decide = makeBot(BB, opts); let actions = 0, stuck = 0, lastKey = '';
  const floorTurns = [];
  let fStart = 0, curF = 1;
  while (!S.over && actions < 6000) {
    const a = decide(S); BB.act(S, a); actions++;
    if (S.floor !== curF) { floorTurns.push(actions - fStart); fStart = actions; curF = S.floor; }
    const key = S.p.x + ',' + S.p.y + ',' + S.floor; if (key === lastKey && a.t === 'move') stuck++; else stuck = 0; lastKey = key;
    if (stuck > 50) break;
  }
  return { seed, cls, over: S.over || 'stuck', floor: S.floor, actions, T: Math.round(S.T), lvl: S.p.lvl, cause: S.stats.cause ? (S.stats.cause.kind + (S.stats.cause.type ? ':' + S.stats.cause.type : '') + (S.stats.cause.id ? ':' + S.stats.cause.id : '')) : null, kills: S.stats.kills, learned: S.stats.learned.length, score: BB.computeScore(S), floorTurns, bossHp: (S.mobs.find(m => m.type === 'boss') || {}).hp };
}
if ((process.argv[1] || '').endsWith('bot.mjs')) {
  const env = load(); const BB = env.BB; const N = +(process.argv[2] || 100); const cls = process.argv[3] || 'diver';
  const res = []; for (let i = 0; i < N; i++) res.push(playSeed(BB, 's' + i, cls));
  const by = (f) => { const o = {}; for (const r of res) { const k = f(r); o[k] = (o[k] || 0) + 1; } return o; };
  console.log('outcome', by(r => r.over));
  console.log('floor', by(r => r.floor));
  console.log('cause', by(r => r.cause));
  const avgA = res.reduce((a, r) => a + r.actions, 0) / N; console.log('avg actions', avgA.toFixed(0), 'avg lvl', (res.reduce((a, r) => a + r.lvl, 0) / N).toFixed(1));
  const ft = []; res.forEach(r => r.floorTurns.forEach((t, i) => { (ft[i] = ft[i] || []).push(t); })); console.log('median actions per floor', ft.map(a => a.sort((x, y) => x - y)[a.length >> 1]).join(' '));
  console.log('boss hp left on boss deaths', res.filter(r => r.floor === 10 && r.over === 'dead').map(r => r.bossHp).join(','));
  console.log('errors', env.errors);
}
