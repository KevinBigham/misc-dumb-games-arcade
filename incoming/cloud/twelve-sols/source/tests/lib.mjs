// Loads the core rules from the built HTML (or src) into Node and provides bots.
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
export const HTML = path.join(here, '..', 'twelve-sols.html');

export function loadCore() {
  let code;
  if (fs.existsSync(HTML)) {
    const html = fs.readFileSync(HTML, 'utf8');
    const m = html.match(/<script id="core">([\s\S]*?)<\/script>/);
    code = m[1];
  } else code = fs.readFileSync(path.join(here, '..', 'src', 'core.js'), 'utf8');
  const ctx = { console }; vm.createContext(ctx); vm.runInContext(code, ctx);
  return ctx.TwelveSols;
}

// ---------- bots ----------
export function makeRng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

export function randomBot(T, r) {
  return (s, meta) => { const L = T.Rules.legal(s, meta); return L[Math.floor(r() * L.length)]; };
}
export const passiveBot = () => (s) => ({ t: 'end' });

// Heuristic survivor. strategy: 'turtle' (shutters + needs) or 'beacon' (rush the beacon).
// explore: try untried pairs with secrets when it has spare hours (how a curious novice plays).
export function smartBot(T, r, { strategy = 'turtle', explore = true } = {}) {
  const { Rules, DATA, CONFIG } = T;
  const has = (s, id, n = 1) => (s.inv[id] || 0) >= n;
  const knows = (m, id) => m.known.indexOf(id) >= 0;
  const ok = (s, m, a) => Rules.check(s, m, a).ok;
  const craftOf = (s, m, id) => { const R = T.RECIPE_BY_ID[id]; const a = { t: 'craft', a: R.a, b: R.b }; return knows(m, id) && ok(s, m, a) ? a : null; };
  return (s, m) => {
    const N = s.needs; const tonight = Rules.stormTonight(s);
    // 1. emergencies: use consumables
    const useIf = (id) => ok(s, m, { t: 'use', id }) ? { t: 'use', id } : null;
    if (N.air < 40) { const a = useIf('oxy'); if (a) return a; }
    if (N.warm < 40) { const a = useIf('heat') || useIf('broth'); if (a) return a; }
    if (N.food < 40) { const a = useIf('mash') || useIf('ration') || useIf('broth'); if (a) return a; }
    if (s.hull - tonight.dmg <= 5 || s.hull < 35) { const a = useIf('patch'); if (a) return a; }
    // 2. craft toward needs
    const want = [];
    if (N.air < 70 && !has(s, 'oxy')) want.push('oxy');
    if (N.warm < 70 && !has(s, 'heat')) want.push('heat');
    if (N.warm < 60 && !has(s, 'heat') && !has(s, 'broth')) want.push('broth');
    if (N.food < 70 && !has(s, 'mash')) want.push('mash');
    if (s.hull < 60 && !has(s, 'patch')) want.push('patch');
    if (strategy === 'beacon' && !s.builds.beacon) want.push('beacon', 'circuit', 'antenna');
    const calm = N.air > 50 && N.warm > 50 && N.food > 45;
    if (calm && (s.builds.shutter || 0) < (strategy === 'beacon' ? 1 : 3)) want.push('shutter');
    if ((calm || 'planter' === 'insul') && !s.builds.planter) want.push('planter');
    if ((calm || 'liner' === 'insul') && !s.builds.liner) want.push('liner');
    if ((calm || 'insul' === 'insul') && !s.builds.insul) want.push('insul');
    if (calm && (s.builds.panel || 0) < 2) want.push('panel');
    if (calm && !s.builds.lamp) want.push('lamp');
    // intermediates
    if (want.includes('oxy') || want.includes('mash') || want.includes('patch') || want.includes('shutter')) want.push('water');
    if (want.includes('patch') || want.includes('shutter')) want.push('brick');
    if (want.includes('heat') || want.includes('panel') || want.includes('antenna')) want.push('coil');
    for (const id of want) { const a = craftOf(s, m, id); if (a) return a; }
    if (explore) {
      for (const id of m.hints) { if (knows(m, id)) continue; const R = T.RECIPE_BY_ID[id]; const a = { t: 'craft', a: R.a, b: R.b }; if (ok(s, m, a)) return a; }
    }
    // 3. scavenge the site that best fits what we lack
    const lack = { ice: !has(s, 'ice') && !has(s, 'water'), cell: !has(s, 'cell', 2), moss: !has(s, 'moss'), scrap: !has(s, 'scrap'), wire: !has(s, 'wire'),
      dust: !has(s, 'dust'), resin: !has(s, 'resin'), glass: !has(s, 'glass'), cloth: !has(s, 'cloth') };
    let best = null, bv = -1;
    s.sites.forEach((id, i) => {
      if (!ok(s, m, { t: 'scav', i })) return;
      const site = DATA.SITES[id]; let v = 0; let tot = 0;
      Object.keys(site.loot).forEach(k => tot += site.loot[k]);
      Object.keys(site.loot).forEach(k => { v += (site.loot[k] / tot) * (lack[k] ? 3 : 1) * site.n; });
      v -= Rules.tripAir(s, id) * (N.air < 50 ? 0.4 : 0.1);
      if (v > bv) { bv = v; best = { t: 'scav', i }; }
    });
    if (best && N.air > 25) return best;
    // 4. explore untried pairs that have secrets
    if (explore) {
      const ids = Object.keys(s.inv).filter(id => Rules.secretsFor(m, id) > 0);
      const cands = [];
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const st = Rules.pairStatus(m, ids[i], ids[j]).st;
        if (st === 'untried') cands.push({ t: 'craft', a: ids[i], b: ids[j] });
      }
      const okc = cands.filter(a => ok(s, m, a));
      // a reader follows field-note hints first
      const hinted = okc.filter(a => { const R = T.RECIPE_BY_PAIR[T.pairKey(a.a, a.b)]; return R && m.hints.indexOf(R.id) >= 0; });
      if (hinted.length) return hinted[0];
      if (okc.length && (N.warm > 30 || r() < 0.3)) return okc[Math.floor(r() * okc.length)];
    }
    return { t: 'end' };
  };
}

export function play(T, bot, { seed = 'x', meta = null, mode = 'normal', maxSteps = 2000, onStep = null, level = null } = {}) {
  let m = meta || T.newMeta();
  let s = T.Rules.newRun(seed, mode, m, '', level);
  let steps = 0; const trace = [];
  while (!s.result && steps < maxSteps) {
    const a = bot(s, m);
    const out = T.Rules.act(s, m, a);
    if (onStep) onStep(s, m, a, out);
    trace.push(a);
    s = out.s; m = out.meta; steps++;
  }
  return { s, meta: m, steps, trace };
}
