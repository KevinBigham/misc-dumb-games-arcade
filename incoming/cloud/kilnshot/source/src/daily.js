// ===================== KILNSHOT DAILY KILN =====================
// A seeded level generator plus a small greedy solver that sets the day's par.
// Everyone gets the same level and par for a date (seeded RNG + deterministic physics).

function genDaily(seed) {
  const rnd = makeRng(seed);
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const slingX = pick([56, 56, 180]);
  const lvl = { id: 'D' + seed, ch: 0, name: 'Daily Kiln', par: 3, sling: [slingX, 556], hint: 'Today’s firing. Beat the kiln’s par.', segs: [], pots: [], pegs: [] };
  // ledges
  const ledges = [];
  const nL = ri(2, 4);
  for (let t = 0; t < 40 && ledges.length < nL; t++) {
    const w = ri(6, 14) * 10, x = ri(10, 34) * 10 - w / 2, y = ri(18, 50) * 10;
    if (x < 10 || x + w > 350) continue;
    if (Math.abs(x + w / 2 - slingX) < 70 && y > 430) continue;
    let ok = true;
    for (const L of ledges) if (x < L.x + L.w + 30 && L.x < x + w + 30 && Math.abs(y - L.y) < 90) ok = false;
    if (!ok) continue;
    ledges.push({ x, y, w });
    lvl.segs.push([x, y, x + w, y]);
  }
  // spots where pots can sit
  const spots = [];
  for (const L of ledges) for (let px = L.x + 18; px <= L.x + L.w - 18; px += 34) spots.push([px, L.y - 19]);
  for (let px = 130; px <= 340; px += 34) if (Math.abs(px - slingX) > 80) spots.push([px, 609]);
  // shuffle spots
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = spots[i]; spots[i] = spots[j]; spots[j] = t; }
  const nS = ri(3, 5), nK = ri(0, 2);
  for (let i = 0; i < nS && spots.length; i++) { const s = spots.pop(); lvl.pots.push({ x: s[0], y: s[1] }); }
  for (let i = 0; i < nK && spots.length; i++) { const s = spots.pop(); lvl.pots.push({ x: s[0], y: s[1], k: 'k' }); }
  // a jar? (the highest second becomes a jar)
  if (rnd() < 0.6) {
    let hi = null; for (const p of lvl.pots) if (p.k !== 'k' && (!hi || p.y < hi.y)) hi = p;
    if (hi) hi.n = ri(4, 7);
  }
  // a hanging pot?
  if (rnd() < 0.35) {
    const x = ri(12, 32) * 10, y = ri(14, 26) * 10;
    let clear = true; for (const p of lvl.pots) if (Math.abs(p.x - x) < 40 && Math.abs(p.y - y) < 60) clear = false;
    for (const L of ledges) if (x > L.x - 20 && x < L.x + L.w + 20 && L.y < y + 40) clear = false;
    if (clear) lvl.pots.push({ x, y, cord: [x, ri(3, 8) * 10], n: rnd() < 0.5 ? 4 : 0 });
  }
  // a reed mat on the floor?
  if (rnd() < 0.3) { const x = ri(12, 26) * 10; if (Math.abs(x + 40 - slingX) > 90) lvl.segs.push([x, 621, x + 80, 621, 'spring']); }
  return lvl;
}

// Greedy daily solver, coarse to fine so it runs in a few seconds on a phone.
// Each round: fire a coarse launch grid, take the most promising cells, test a fine 3x3 around each,
// and keep the best shot whose neighbours mostly agree (a robust, human-repeatable throw).
// It is a generator: it yields progress 0..1 so the page can time-slice it.
function* dailySolve(lvl, maxShots) {
  const M = CONFIG.MAXV, CO = 80, FI = 40, coarse = [];
  for (let vx = -M; vx <= M; vx += CO) for (let vy = -M; vy <= 400; vy += CO) { const s = vx * vx + vy * vy; if (s <= M * M && s >= 160 * 160) coarse.push([vx, vy]); }
  const shots = []; const w = makeWorld(lvl);
  for (let k = 0; k < maxShots; k++) {
    const cache = new Map(); const left0 = secondsLeft(w), key0 = boardKey(w);
    const score = (vx, vy) => {
      const id = vx + ',' + vy; if (cache.has(id)) return cache.get(id);
      const s = vx * vx + vy * vy; let r = 0;
      if (s <= M * M && s >= 120 * 120) { const c = cloneWorld(w); runShot(c, vx, vy); r = c.keeperBroken ? -1 : (left0 - secondsLeft(c)) * 1000 + (boardKey(c) === key0 ? 0 : 1); }
      cache.set(id, r); return r;
    };
    let i = 0;
    for (const v of coarse) { score(v[0], v[1]); if ((++i & 15) === 0) yield (k + 0.8 * i / coarse.length) / maxShots; }
    const cands = coarse.filter(v => cache.get(v[0] + ',' + v[1]) > 0).sort((a, b) => cache.get(b[0] + ',' + b[1]) - cache.get(a[0] + ',' + a[1])).slice(0, 8);
    let best = null, bestScore = 0, ci = 0;
    for (const c of cands) {
      const r = score(c[0], c[1]); let same = 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && score(c[0] + dx * FI, c[1] + dy * FI) === r) same++;
      yield (k + 0.8 + 0.2 * (++ci) / cands.length) / maxShots;
      if (same < 3) continue;
      const sc = r * 10 + same; if (sc > bestScore) { bestScore = sc; best = c; }
    }
    if (!best) return { ok: false, shots };
    shots.push(best); runShot(w, best[0], best[1]);
    if (secondsLeft(w) === 0) return { ok: true, shots, par: shots.length };
  }
  return { ok: false, shots };
}

function dailyRow(dateStr) {
  if (typeof DAILY_TABLE === 'undefined') return null;
  const a = Date.UTC(+DAILY_TABLE.start.slice(0, 4), +DAILY_TABLE.start.slice(5, 7) - 1, +DAILY_TABLE.start.slice(8, 10));
  const b = Date.UTC(+dateStr.slice(0, 4), +dateStr.slice(5, 7) - 1, +dateStr.slice(8, 10));
  const i = Math.round((b - a) / 864e5); const rows = DAILY_TABLE.rows.split('|');
  if (!(i >= 0 && i < rows.length)) return null;
  const n = rows[i].split(' ').map(Number); if (n.length < 4 || n.some(x => !Number.isFinite(x))) return null;
  const proof = []; for (let k = 2; k + 1 < n.length; k += 2) proof.push([n[k], n[k + 1]]);
  return { sub: n[0], par: n[1], proof };
}

// Build the daily level for a date string like "2026-11-06": tries a few sub-seeds until one is solvable.
function* buildDaily(dateStr) {
  const base = hashStr('kilnshot:' + dateStr);
  // fast path: the precomputed cache, re-proven here by replaying its throws
  const row = dailyRow(dateStr);
  if (row) {
    const lvl = genDaily((base + row.sub * 7919) >>> 0);
    if (validateLevel(lvl).ok) {
      const w = replay(lvl, row.proof);
      if (secondsLeft(w) === 0 && !w.keeperBroken && row.proof.length === row.par) { lvl.par = row.par; lvl.proof = row.proof; lvl.date = dateStr; return lvl; }
    }
  }
  for (let t = 0; t < 12; t++) {
    const lvl = genDaily((base + t * 7919) >>> 0);
    if (!validateLevel(lvl).ok) continue;
    if (secondsTotal(makeWorld(lvl)) < 2) continue;
    const g = dailySolve(lvl, 4); let r;
    while (true) { const n = g.next(); if (n.done) { r = n.value; break; } yield (t + n.value) / 12; }
    if (r.ok) { lvl.par = r.par; lvl.proof = r.shots; lvl.date = dateStr; return lvl; }
  }
  // fallback: a hand-made easy level so the day always has a firing
  const fb = JSON.parse(JSON.stringify(LEVELS[0])); fb.id = 'D' + base; fb.name = 'Daily Kiln'; fb.date = dateStr; fb.proof = null; return fb;
}

// Content validator (Untrusted-style): every level must be well formed and winnable in principle.
function validateLevel(l) {
  const errs = [];
  const num = (v) => typeof v === 'number' && isFinite(v);
  if (!l || typeof l !== 'object') return { ok: false, errs: ['not an object'] };
  if (!Array.isArray(l.sling) || !num(l.sling[0]) || !num(l.sling[1])) errs.push('bad sling');
  if (!(l.par >= 1)) errs.push('bad par');
  const pots = l.pots || [];
  if (!pots.some(p => p.k !== 'k')) errs.push('no cracked pot to break');
  for (const p of pots) {
    if (!num(p.x) || !num(p.y)) errs.push('bad pot');
    if (p.x < 0 || p.x > CONFIG.W || p.y > 628) errs.push('pot out of bounds');
    if (Math.abs(p.x - l.sling[0]) < 30 && Math.abs(p.y - l.sling[1]) < 30) errs.push('pot on the sling');
  }
  for (let i = 0; i < pots.length; i++) for (let j = i + 1; j < pots.length; j++) {
    const a = pots[i], b = pots[j], r = (a.r || 16) + (b.r || 16);
    if ((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) < (r - 1) * (r - 1)) errs.push('pots overlap ' + i + ',' + j);
  }
  for (const s of (l.segs || [])) if (s.length < 4 || !s.slice(0, 4).every(num)) errs.push('bad ledge');
  return { ok: errs.length === 0, errs };
}
