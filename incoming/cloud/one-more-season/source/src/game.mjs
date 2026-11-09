// One More Season — season state machine. Every change goes through reduce().
// reduce() is pure: it returns a brand-new state or an error, never mutates.
import { CONFIG } from './config.mjs';
import { ROSTER, OPPONENTS, ATTRS, TACTICS } from './content.mjs';
import { seedToState } from './rng.mjs';
import { simulateMatch, renderEvent } from './sim.mjs';

export const PHASES = ['prep', 'match', 'review', 'develop', 'recap'];
// Legal transitions, by command.
export const TRANSITIONS = {
  SET_DRAFT: { prep: 'prep' },
  COMMIT: { prep: 'match' },
  FINISH_MATCH: { match: 'review' },
  CONTINUE: { review: 'develop|recap' },
  DEVELOP: { develop: 'prep' },
  MARK_HISTORY: { recap: 'recap' },
};

const clone = x => JSON.parse(JSON.stringify(x));
const clampF = (f, cfg) => Math.max(0, Math.min(cfg.fatigueMax, f));

export function defaultDraft(roster, prevStarters) {
  const starters = prevStarters && prevStarters.length === CONFIG.startersCount
    ? prevStarters.slice()
    : ['reyke', 'marrow', 'abara', 'hollis', 'ostrova'];
  return { starters, prep: {}, tactic: 'balanced' };
}

export function newSeason(seed, id, cfg = CONFIG) {
  const roster = clone(ROSTER);
  return {
    version: cfg.saveVersion,
    id: String(id || seed),
    seed: String(seed),
    rng: seedToState(seed),
    phase: 'prep',
    fixture: 0,
    roster,
    draft: defaultDraft(roster),
    results: [],
    historyRecorded: false,
  };
}

export function currentOpponent(state) {
  return OPPONENTS[state.fixture];
}

// Checks a lineup/prep/tactic decision. Returns a list of problems (empty = legal).
export function checkDecision(state, d, cfg = CONFIG) {
  const errs = [];
  const ids = new Set(state.roster.map(p => p.id));
  const st = d.starters || [];
  if (st.length !== cfg.startersCount) errs.push(`Pick exactly ${cfg.startersCount} starters.`);
  if (new Set(st).size !== st.length) errs.push('A player is listed twice.');
  for (const id of st) if (!ids.has(id)) errs.push('Unknown player ' + id);
  if (!TACTICS[d.tactic]) errs.push('Pick a plan.');
  const prep = d.prep || {};
  const entries = Object.entries(prep);
  if (entries.length > cfg.prepPoints) errs.push(`Only ${cfg.prepPoints} prep points.`);
  for (const [id, act] of entries) {
    const p = state.roster.find(x => x.id === id);
    if (!p) { errs.push('Unknown player ' + id); continue; }
    if (act === 'rest') continue;
    const m = /^train:(\w+)$/.exec(act);
    if (!m || !ATTRS.includes(m[1])) { errs.push('Bad prep action for ' + p.name); continue; }
    if (p[m[1]] >= cfg.attrMax) errs.push(`${p.name} is already at ${cfg.attrMax} ${m[1]}.`);
  }
  return errs;
}

export function applyPrep(roster, prep, cfg = CONFIG) {
  const out = clone(roster);
  for (const [id, act] of Object.entries(prep)) {
    const p = out.find(x => x.id === id);
    if (act === 'rest') p.fatigue = clampF(p.fatigue - cfg.restAmount, cfg);
    else {
      const attr = act.split(':')[1];
      p[attr] = Math.min(cfg.attrMax, p[attr] + 1);
      p.fatigue = clampF(p.fatigue + cfg.trainFatigue, cfg);
    }
  }
  return out;
}

export function fatigueAfterMatch(roster, starters, cfg = CONFIG) {
  return roster.map(p => {
    const before = p.fatigue;
    const delta = starters.includes(p.id) ? cfg.starterFatigueBase - p.stamina : -cfg.reserveRecovery;
    return { id: p.id, before, after: clampF(before + delta, cfg) };
  });
}

export function reduce(state, cmd, cfg = CONFIG) {
  const allowed = TRANSITIONS[cmd.type];
  if (!allowed) return { ok: false, error: 'Unknown command ' + cmd.type, state };
  if (!(state.phase in allowed)) return { ok: false, error: `${cmd.type} is not allowed during ${state.phase}`, state };
  const s = clone(state);
  switch (cmd.type) {
    case 'SET_DRAFT': {
      const d = cmd.draft;
      s.draft = { starters: (d.starters || []).slice(0, cfg.startersCount), prep: Object.assign({}, d.prep), tactic: d.tactic };
      return { ok: true, state: s };
    }
    case 'COMMIT': {
      const d = { starters: cmd.starters, prep: cmd.prep || {}, tactic: cmd.tactic };
      const errs = checkDecision(s, d, cfg);
      if (errs.length) return { ok: false, error: errs.join(' '), state };
      const opp = currentOpponent(s);
      // 1. prep is applied once, as part of the same atomic commit
      const rosterBefore = clone(s.roster);
      s.roster = applyPrep(s.roster, d.prep, cfg);
      const starters = d.starters.map(id => s.roster.find(p => p.id === id));
      const youFirst = s.fixture % 2 === 0;
      // 2. the match is resolved exactly once; result + RNG are stored before playback
      const m = simulateMatch({ starters, opp, tactic: d.tactic, rngState: s.rng, youFirst }, cfg);
      s.results.push({
        fixture: s.fixture, oppId: opp.id, starters: d.starters.slice(), prep: clone(d.prep), tactic: d.tactic,
        youFirst, rosterBefore, rosterAtKickoff: clone(s.roster),
        events: m.events, scoreYou: m.scoreYou, scoreThem: m.scoreThem, outcome: m.outcome,
        decisive: m.decisive, preview: m.preview, rngBefore: s.rng, rngAfter: m.rngAfter,
        fatigueApplied: false, fatigueChanges: null, devApplied: false, dev: null,
      });
      s.rng = m.rngAfter;
      s.phase = 'match';
      return { ok: true, state: s };
    }
    case 'FINISH_MATCH': {
      const r = s.results[s.fixture];
      if (r.fatigueApplied) return { ok: false, error: 'Fatigue already applied', state };
      const ch = fatigueAfterMatch(s.roster, r.starters, cfg);
      for (const c of ch) s.roster.find(p => p.id === c.id).fatigue = c.after;
      r.fatigueChanges = ch;
      r.fatigueApplied = true;
      s.phase = 'review';
      return { ok: true, state: s };
    }
    case 'CONTINUE': {
      s.phase = s.fixture < cfg.fixtures - 1 ? 'develop' : 'recap';
      return { ok: true, state: s };
    }
    case 'DEVELOP': {
      const r = s.results[s.fixture];
      if (r.devApplied) return { ok: false, error: 'Development already chosen', state };
      const p = s.roster.find(x => x.id === cmd.playerId);
      if (!p) return { ok: false, error: 'Pick a player', state };
      if (!ATTRS.includes(cmd.attr)) return { ok: false, error: 'Pick an attribute', state };
      if (p[cmd.attr] >= cfg.attrMax) return { ok: false, error: `${p.name} is already at ${cfg.attrMax}`, state };
      p[cmd.attr] += 1;
      r.devApplied = true;
      r.dev = { playerId: p.id, attr: cmd.attr, to: p[cmd.attr] };
      s.fixture += 1;
      s.phase = 'prep';
      s.draft = defaultDraft(s.roster, r.starters);
      s.draft.tactic = r.tactic;
      return { ok: true, state: s };
    }
    case 'MARK_HISTORY': {
      if (s.historyRecorded) return { ok: false, error: 'Already recorded', state };
      s.historyRecorded = true;
      return { ok: true, state: s };
    }
  }
  return { ok: false, error: 'unreachable', state };
}

// Structural validation for loaded saves. Returns problems (empty = valid).
export function validateState(s, cfg = CONFIG) {
  const e = [];
  if (!s || typeof s !== 'object') return ['not an object'];
  if (s.version !== cfg.saveVersion) e.push('version ' + s.version);
  if (!PHASES.includes(s.phase)) e.push('phase ' + s.phase);
  if (!Number.isInteger(s.fixture) || s.fixture < 0 || s.fixture >= cfg.fixtures) e.push('fixture');
  if (!Number.isInteger(s.rng) || s.rng < 0) e.push('rng');
  if (!Array.isArray(s.roster) || s.roster.length !== ROSTER.length) e.push('roster');
  else for (const p of s.roster) {
    for (const a of ATTRS) if (!Number.isInteger(p[a]) || p[a] < cfg.attrMin || p[a] > cfg.attrMax) e.push(p.id + '.' + a);
    if (typeof p.fatigue !== 'number' || p.fatigue < 0 || p.fatigue > cfg.fatigueMax) e.push(p.id + '.fatigue');
  }
  if (!Array.isArray(s.results)) return e.concat('results');
  const need = s.phase === 'prep' ? s.fixture : s.fixture + 1;
  if (s.results.length !== need) e.push(`results length ${s.results.length} != ${need}`);
  const r = s.results[s.fixture];
  if (s.phase === 'match' && r && r.fatigueApplied) e.push('match phase but fatigue applied');
  if ((s.phase === 'review' || s.phase === 'develop' || s.phase === 'recap') && r && !r.fatigueApplied) e.push('fatigue missing');
  if (s.phase === 'develop' && r && r.devApplied) e.push('develop phase but dev applied');
  if (s.phase === 'recap' && s.fixture !== cfg.fixtures - 1) e.push('recap before last fixture');
  for (const x of s.results) if (!Array.isArray(x.events) || x.events.length !== cfg.possessionsPerTeam * 2) e.push('events');
  if (s.phase === 'prep' && (!s.draft || !Array.isArray(s.draft.starters))) e.push('draft');
  return e;
}

export function record(state) {
  const w = state.results.filter(r => r.outcome === 'W').length;
  const d = state.results.filter(r => r.outcome === 'D').length;
  const l = state.results.filter(r => r.outcome === 'L').length;
  return { w, d, l };
}

// Season recap built only from recorded results.
export function seasonRecap(state, cfg = CONFIG) {
  const rec = record(state);
  const success = rec.w >= cfg.winTarget;
  const pf = state.results.reduce((a, r) => a + r.scoreYou, 0);
  const pa = state.results.reduce((a, r) => a + r.scoreThem, 0);
  const starts = {};
  for (const r of state.results) for (const id of r.starters) starts[id] = (starts[id] || 0) + 1;
  const lines = state.results.map(r => {
    const opp = OPPONENTS[r.fixture];
    const big = r.decisive.map(i => r.events[i]).sort((a, b) => Math.abs(b.points - 3) - Math.abs(a.points - 3))[0];
    return {
      fixture: r.fixture + 1, opp: opp.name, outcome: r.outcome, score: `${r.scoreYou}-${r.scoreThem}`,
      tactic: TACTICS[r.tactic].name,
      key: big ? renderEvent(big, { tactic: r.tactic, oppName: opp.name, oppShort: opp.name.split(' ')[0] }, cfg).text : '',
    };
  });
  const losses = state.results.filter(r => r.outcome !== 'W').map(r => ({ r, m: r.scoreThem - r.scoreYou })).sort((a, b) => a.m - b.m);
  const closest = losses[0] ? { fixture: losses[0].r.fixture + 1, opp: OPPONENTS[losses[0].r.fixture].name, margin: losses[0].m, outcome: losses[0].r.outcome, tactic: TACTICS[losses[0].r.tactic].name, fatiguePct: Math.round(losses[0].r.preview.you.fatigueFactor * 100) } : null;
  let peak = null;
  for (const r of state.results) for (const id of r.starters) {
    const p = r.rosterAtKickoff.find(x => x.id === id);
    if (!peak || p.fatigue > peak.fatigue) peak = { name: p.name, fatigue: p.fatigue, fixture: r.fixture + 1 };
  }
  return { rec, success, pf, pa, starts, lines, closest, peak };
}
