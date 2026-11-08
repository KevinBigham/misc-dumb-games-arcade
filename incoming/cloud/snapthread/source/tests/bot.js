// Snapthread bot harness. Usage: node tests/bot.js [runsPerPolicy] [--html path]
// Plays full runs with the real rules (no UI). Policies differ only in card/path choices;
// all share one greedy combat brain that looks one card ahead with the real rules.
'use strict';
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadCore(htmlPath) {
  if (htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const m = html.match(/<script id="st-core">([\s\S]*?)<\/script>/);
    const ctx = { module: { exports: {} } }; vm.createContext(ctx); vm.runInContext(m[1], ctx);
    return ctx.module.exports;
  }
  return require(path.join(__dirname, '..', 'src', 'core.js'));
}

function makeBot(ST, policy) {
  const { Rules, DATA, clone } = ST;
  const C = DATA.CARDS;
  const PLAN_W = {
    taut: { taut: 3, neutral: 1.4, weave: 0.2, none: 0 },
    weave: { weave: 3, neutral: 1.4, taut: 0.2, none: 0 },
    random: null
  }[policy];
  const RAR = { common: 0, uncommon: 0.6, rare: 1.2, starter: -2 };

  function evalState(s, plan) {
    if (s.phase === 'defeat') return -1e7;
    if (s.phase !== 'combat') return 1e6 + s.hp * 30;
    const c = s.combat;
    let inc = Rules.incoming(s);
    const unblocked = Math.max(0, inc - c.block);
    let ehp = 0, alive = 0;
    c.enemies.forEach(e => { if (e.hp > 0) { ehp += e.hp + e.block * 0.6; alive++; } });
    let v = 0;
    v -= ehp * 1.0;
    v -= alive * 6;
    v -= unblocked * 1.7;
    v += s.hp * 1.7;
    v += Math.min(c.block, c.weave) * 0.7;
    v += c.weave * 0.9;
    // tension is ammo for taut decks, risk otherwise; snapping is already in hp
    const tval = plan === 'weave' ? 0.15 : 0.55;
    v += Math.min(c.T, 9) * tval - (plan === 'weave' ? Math.max(0, c.T - 7) * 1.2 : 0);
    for (const k in c.powers) v += c.powers[k] ? 9 : 0;
    // foresee end-of-turn tension from knots in hand and enemy pulls
    let endT = c.T + c.hand.filter(x => x.id === 'knot').length * ST.CONFIG.KNOT_TENSION;
    if (endT >= ST.CONFIG.T_MAX && !c.powers.snapback) v -= ST.CONFIG.SNAP_DMG * 1.7;
    endT -= ST.CONFIG.SLACK;
    c.enemies.forEach(e => { if (e.hp > 0 && e.intent) e.intent.fx.forEach(f => { if (f[0] === 'tense') endT += f[1]; }); });
    if (endT >= ST.CONFIG.T_MAX && !c.powers.snapback) v -= ST.CONFIG.SNAP_DMG * 1.5;
    c.enemies.forEach(e => { if (e.hp > 0) v += e.brittle * 2 + e.dull * 1.5; });
    return v;
  }

  function combatTurn(st, plan) {
    let guard = 0;
    while (st.phase === 'combat' && guard++ < 60) {
      const c = st.combat;
      let best = { v: evalState(st, plan), cmd: { t: 'end' } };
      const seen = new Set();
      for (const card of c.hand) {
        if (!Rules.canPlay(st, card)) continue;
        const sig = card.id + ':' + card.up;
        if (seen.has(sig)) continue; seen.add(sig);
        const targets = Rules.needsTarget(card) ? c.enemies.map((e, i) => e.hp > 0 ? i : -1).filter(i => i >= 0) : [null];
        for (const tg of targets) {
          const sim = clone(st);
          const err = Rules.applyMut(sim, [], { t: 'play', uid: card.uid, target: tg });
          if (err) continue;
          const v = evalState(sim, plan) + 0.01; // tiny bias to act
          if (v > best.v) best = { v, cmd: { t: 'play', uid: card.uid, target: tg } };
        }
      }
      const err = Rules.applyMut(st, [], best.cmd);
      if (err) throw new Error('bot cmd failed: ' + err);
      if (best.cmd.t === 'end') return;
    }
  }

  function cardValue(id) {
    const d = C[id];
    if (!PLAN_W) return 1;
    return PLAN_W[d.plan] + RAR[d.rarity];
  }

  function choosePlan(st) {
    if (policy !== 'random') return policy;
    let t = 0, w = 0; st.deck.forEach(x => { if (C[x.id].plan === 'taut') t++; if (C[x.id].plan === 'weave') w++; });
    return t >= w ? 'taut' : 'weave';
  }

  function step(st, rs, rec) {
    const R = ST.RNG;
    switch (st.phase) {
      case 'map': {
        const opts = Rules.reachable(st);
        const hpPct = st.hp / st.maxHp;
        const score = id => {
          const t = st.map.nodes[id].type;
          let v = R.rnd(rs) * 0.5;
          if (policy === 'random') return v + (t === 'R' && hpPct < 0.5 ? 2 : 0);
          if (t === 'E') v += hpPct > 0.7 ? 1.5 : -2;
          if (t === 'R') v += hpPct < 0.55 ? 2.5 : 0.2;
          if (t === 'M') v += st.gold >= 90 ? 1.2 : 0;
          if (t === 'S') v += 0.4;
          if (t === 'F') v += 0.8;
          return v;
        };
        let best = opts[0], bv = -1e9;
        for (const id of opts) { const v = score(id); if (v > bv) { bv = v; best = id; } }
        Rules.applyMut(st, [], { t: 'pick', id: best });
        return;
      }
      case 'combat': combatTurn(st, choosePlan(st)); return;
      case 'reward': {
        const cards = st.reward.cards;
        cards.forEach(id => { rec.offered[id] = (rec.offered[id] || 0) + 1; });
        let pick = null;
        if (policy === 'random') {
          const r = R.rint(rs, 0, cards.length); // last index = skip/chip
          pick = r < cards.length ? cards[r] : null;
        } else {
          let bv = 1.6;
          for (const id of cards) { const v = cardValue(id); if (v > bv) { bv = v; pick = id; } }
        }
        if (pick) { rec.picked[pick] = (rec.picked[pick] || 0) + 1; Rules.applyMut(st, [], { t: 'reward', kind: 'card', id: pick }); return; }
        // chip a starter that fits the plan least
        const chipId = policy === 'taut' ? 'brace' : 'tug';
        const ch = st.deck.find(x => x.id === chipId) || st.deck.find(x => x.id === 'tug');
        if (ch && st.deck.length > 8) { rec.chips++; Rules.applyMut(st, [], { t: 'reward', kind: 'chip', uid: ch.uid }); }
        else Rules.applyMut(st, [], { t: 'reward', kind: 'skip' });
        return;
      }
      case 'rest': {
        if (st.hp / st.maxHp < 0.6) { Rules.applyMut(st, [], { t: 'rest', kind: 'heal' }); return; }
        const ups = Rules.upgradeable(st).sort((a, b) => cardValue(b.id) - cardValue(a.id));
        if (ups.length) Rules.applyMut(st, [], { t: 'rest', kind: 'mend', uid: ups[0].uid });
        else Rules.applyMut(st, [], { t: 'rest', kind: 'heal' });
        return;
      }
      case 'market': {
        const M = st.market;
        let bought = false;
        M.cards.forEach((it, i) => {
          if (!bought && !it.sold && st.gold >= it.price && (policy === 'random' ? R.rnd(rs) < 0.3 : cardValue(it.id) >= 3)) {
            Rules.applyMut(st, [], { t: 'buy', kind: 'card', slot: i }); bought = true; rec.bought++;
          }
        });
        if (M.charm && !M.charmSold && st.gold >= ST.CONFIG.PRICE.relic) Rules.applyMut(st, [], { t: 'buy', kind: 'charm' });
        const ch = st.deck.find(x => x.id === (policy === 'taut' ? 'brace' : 'tug'));
        if (ch && !M.chipUsed && st.gold >= M.chipPrice && st.deck.length > 8) Rules.applyMut(st, [], { t: 'buy', kind: 'chip', uid: ch.uid });
        Rules.applyMut(st, [], { t: 'leave' });
        return;
      }
      case 'shrine': {
        const S = DATA.SHRINES[st.shrine.key];
        let opt = 0;
        if (S.opts[0].fx.some(f => f[0] === 'hurt') && st.hp < 25) opt = 1;
        if (S.opts[0].need && st.gold < S.opts[0].need) opt = 1;
        const o = S.opts[opt];
        let uid;
        if (o.fx.some(f => f[0] === 'mend')) { const u = Rules.upgradeable(st)[0]; if (!u) opt = 1; else uid = u.uid; }
        if (o.fx.some(f => f[0] === 'chip')) uid = (st.deck.find(x => x.id === 'tug') || st.deck[0]).uid;
        if (opt === 1 && S.opts[1].fx.some(f => f[0] === 'chip')) uid = (st.deck.find(x => x.id === 'tug') || st.deck[0]).uid;
        const err = Rules.applyMut(st, [], { t: 'shrine', opt, uid });
        if (err) Rules.applyMut(st, [], { t: 'shrine', opt: 1, uid: st.deck[0].uid });
        return;
      }
    }
  }

  function playRun(seed, char, salt, onStep) {
    let st = Rules.newRun({ seed, char: char || 'weaver' });
    const rs = { s: ST.RNG.hash(seed, 'bot', policy + (salt || '')) };
    const rec = { offered: {}, picked: {}, chips: 0, bought: 0, steps: 0, nodes: 0 };
    let guard = 0;
    while (st.phase !== 'victory' && st.phase !== 'defeat') {
      if (guard++ > 4000) throw new Error('soft lock? seed ' + seed + ' phase ' + st.phase);
      if (st.phase === 'map') rec.nodes++;
      if (onStep && onStep(st)) return { st, rec, stopped: true };
      step(st, rs, rec);
      rec.steps++;
    }
    return { st, rec };
  }
  return { playRun, combatTurn, evalState };
}

module.exports = { loadCore, makeBot };

if (require.main === module) {
  const args = process.argv.slice(2);
  const hi = args.indexOf('--html');
  const htmlPath = hi >= 0 ? args[hi + 1] : null;
  const N = +args.find(a => /^\d+$/.test(a)) || 500;
  const charArg = (args.find(a => a.startsWith('--char=')) || '--char=weaver').split('=')[1];
  const ST = loadCore(htmlPath);
  const C = ST.DATA.CARDS;
  const out = {};
  const presence = {}; // card -> {in:[wins,runs], out:[wins,runs]} on random policy
  const t0 = Date.now();
  for (const policy of ['taut', 'weave', 'random']) {
    const bot = makeBot(ST, policy);
    let wins = 0, rows = 0, turns = 0, nodes = 0, hpWin = 0, snaps = 0;
    const deathRow = {}, killer = {}, offered = {}, picked = {}, deckSize = [];
    const lossSeeds = [];
    for (let i = 0; i < N; i++) {
      const seed = 1000 + i;
      const { st, rec } = bot.playRun(seed, charArg);
      const won = st.phase === 'victory';
      if (won) { wins++; hpWin += st.hp; } else { lossSeeds.push(seed); deathRow[st.end.row] = (deathRow[st.end.row] || 0) + 1; const k = st.end.by ? st.end.by.name : '?'; killer[k] = (killer[k] || 0) + 1; }
      rows += st.stats.rows; turns += st.stats.turns; nodes += st.visited.length; snaps += st.stats.snaps;
      deckSize.push(st.deck.length);
      for (const k in rec.offered) offered[k] = (offered[k] || 0) + rec.offered[k];
      for (const k in rec.picked) picked[k] = (picked[k] || 0) + rec.picked[k];
      if (policy === 'random') {
        const ids = new Set(st.deck.map(x => x.id));
        for (const k in C) {
          if (['starter', 'status'].includes(C[k].rarity)) continue;
          presence[k] = presence[k] || { inW: 0, inN: 0, outW: 0, outN: 0 };
          if (ids.has(k)) { presence[k].inN++; if (won) presence[k].inW++; } else { presence[k].outN++; if (won) presence[k].outW++; }
        }
      }
    }
    out[policy] = {
      winRate: +(wins / N * 100).toFixed(1), avgRows: +(rows / N).toFixed(2), avgTurns: +(turns / N).toFixed(1),
      avgNodes: +(nodes / N).toFixed(1), avgSnaps: +(snaps / N).toFixed(1), avgHpOnWin: wins ? +(hpWin / wins).toFixed(1) : 0,
      avgDeck: +(deckSize.reduce((a, b) => a + b, 0) / N).toFixed(1),
      deathRow, killer, lossSeeds,
      pickRate: Object.fromEntries(Object.keys(offered).sort().map(k => [k, +((picked[k] || 0) / offered[k] * 100).toFixed(0)]))
    };
  }
  const pres = {};
  for (const k in presence) {
    const p = presence[k];
    pres[k] = { withWin: p.inN ? +(p.inW / p.inN * 100).toFixed(1) : null, withoutWin: p.outN ? +(p.outW / p.outN * 100).toFixed(1) : null, runsWith: p.inN };
  }
  // seeds lost by every policy
  const allLost = out.taut.lossSeeds.filter(s => out.weave.lossSeeds.includes(s) && out.random.lossSeeds.includes(s));
  for (const p in out) { out[p].lossCount = out[p].lossSeeds.length; delete out[p].lossSeeds; }
  console.log(JSON.stringify({ N, char: charArg, ms: Date.now() - t0, policies: out, presence: pres, seedsLostByAll: allLost.length, sampleAllLost: allLost.slice(0, 12) }, null, 1));
}
