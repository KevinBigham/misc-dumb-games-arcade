// Bot strategies for the seeded harness. They only use public sim/game functions.
import { CONFIG } from '../src/config.mjs';
import { TACTIC_ORDER, ATTRS } from '../src/content.mjs';
import { matchPreview } from '../src/sim.mjs';
import { applyPrep, currentOpponent, reduce } from '../src/game.mjs';
import { rngInt, seedToState } from '../src/rng.mjs';

function combos(arr, k, start = 0, cur = [], out = []) {
  if (cur.length === k) { out.push(cur.slice()); return out; }
  for (let i = start; i < arr.length; i++) { cur.push(arr[i]); combos(arr, k, i + 1, cur, out); cur.pop(); }
  return out;
}
const raw = p => p.attack + p.defense + p.control;

// Strategy A, "Rotate & Read": rest the two most tired players, then pick the lineup + plan with the
// best expected margin this match, minus a penalty for starters who will be very tired next match.
export const rotateRead = {
  name: 'Rotate & Read',
  decide(state) {
    const opp = currentOpponent(state);
    const tired = state.roster.slice().sort((a, b) => b.fatigue - a.fatigue).filter(p => p.fatigue >= 20).slice(0, 2);
    const prep = {};
    for (const p of tired) prep[p.id] = 'rest';
    if (Object.keys(prep).length < 2) {
      const t = state.roster.filter(p => !prep[p.id] && p.control < 10).sort((a, b) => b.control - a.control)[0];
      if (t) prep[t.id] = 'train:control';
    }
    const roster = applyPrep(state.roster, prep);
    const best = bestLineup(state, roster, 0.06);
    return { starters: best.starters, prep, tactic: best.tactic };
  },
  develop(state) {
    const p = state.roster.filter(x => x.control < 10).sort((a, b) => b.control - a.control)[0];
    return { playerId: p.id, attr: 'control' };
  },
};

// Strategy B, "Stars & Gas": start the five best right now (fatigue-adjusted), never rest,
// spend both points training attackers, always play Aggressive.
const effRaw = p => raw(p) * (1 - p.fatigue / CONFIG.fatigueDivisor);
export const starsGas = {
  name: 'Stars & Gas',
  decide(state) {
    const starters = state.roster.slice().sort((a, b) => effRaw(b) - effRaw(a)).slice(0, 5);
    const prep = {};
    for (const p of starters.filter(x => x.attack < 10).sort((a, b) => b.attack - a.attack).slice(0, 2)) prep[p.id] = 'train:attack';
    return { starters: starters.map(p => p.id), prep, tactic: 'aggressive' };
  },
  develop(state) {
    const p = state.roster.filter(x => x.attack < 10).sort((a, b) => b.attack - a.attack)[0];
    return { playerId: p.id, attr: 'attack' };
  },
};

// Strategy C, "Random": legal random decisions from a separate seeded stream.
export function randomStrategy(seed) {
  let r = seedToState('bot-' + seed);
  const pick = n => { let v; [v, r] = rngInt(r, n); return v; };
  return {
    name: 'Random',
    decide(state) {
      const ids = state.roster.map(p => p.id);
      const starters = [];
      while (starters.length < 5) { const id = ids[pick(8)]; if (!starters.includes(id)) starters.push(id); }
      const prep = {};
      for (let k = 0; k < 2; k++) {
        const p = state.roster[pick(8)];
        if (prep[p.id]) continue;
        const a = ATTRS[pick(4)];
        prep[p.id] = pick(2) ? 'rest' : (p[a] < 10 ? 'train:' + a : 'rest');
      }
      return { starters, prep, tactic: TACTIC_ORDER[pick(3)] };
    },
    develop(state) {
      const p = state.roster.filter(x => x.attack < 10)[pick(state.roster.filter(x => x.attack < 10).length)];
      return { playerId: p.id, attr: 'attack' };
    },
  };
}

// Plays one full season. hook(state, label) is called after every committed command.
export function playSeason(state, strat, hook) {
  const step = cmd => {
    const res = reduce(state, cmd);
    if (!res.ok) throw new Error(`${strat.name}: ${cmd.type} failed: ${res.error}`);
    state = res.state;
    if (hook) { const s2 = hook(state, cmd.type); if (s2) state = s2; }
  };
  while (state.phase !== 'recap') {
    if (state.phase === 'prep') step({ type: 'COMMIT', ...strat.decide(state) });
    else if (state.phase === 'match') step({ type: 'FINISH_MATCH' });
    else if (state.phase === 'review') step({ type: 'CONTINUE' });
    else if (state.phase === 'develop') step({ type: 'DEVELOP', ...strat.develop(state) });
  }
  return state;
}

// Shared lineup optimizer: best expected margin this match over all 56 lineups x 3 plans, minus a
// look-ahead penalty (weight w) for starters who will be very tired next match.
export function bestLineup(state, roster, w) {
  const opp = currentOpponent(state);
  let best = null;
  for (const c of combos(roster, 5)) for (const tactic of TACTIC_ORDER) {
    const pv = matchPreview(c, opp, tactic);
    const penalty = c.reduce((a, p) => a + Math.max(0, p.fatigue + CONFIG.starterFatigueBase - p.stamina - 55) * w, 0);
    const score = pv.evYou - pv.evThem - (state.fixture < 5 ? penalty : 0);
    if (!best || score > best.score) best = { score, starters: c.map(p => p.id), tactic };
  }
  return best;
}

// Strategy B2, "Train & Ride": never rest. Both prep points train Attack on the two best attackers
// (permanent +1, +8 fatigue each), then the same optimizer picks lineup and plan, with no look-ahead.
export const trainRide = {
  name: 'Train & Ride',
  decide(state) {
    const prep = {};
    for (const p of state.roster.filter(x => x.attack < 10 && x.fatigue < 60).sort((a, b) => b.attack - a.attack).slice(0, 2)) prep[p.id] = 'train:attack';
    const roster = applyPrep(state.roster, prep);
    const best = bestLineup(state, roster, 0);
    return { starters: best.starters, prep, tactic: best.tactic };
  },
  develop: starsGas.develop,
};
