// One More Season — pure match simulator. No DOM, no storage, no Math.random.
import { CONFIG } from './config.mjs';
import { CLUB, TACTICS, TEMPLATES } from './content.mjs';
import { rngInt } from './rng.mjs';

export const round2 = x => Math.round(x * 100) / 100;

export function fatigueMult(p, cfg = CONFIG) {
  return 1 - p.fatigue / cfg.fatigueDivisor;
}

export function effective(p, attr, cfg = CONFIG) {
  if (attr === 'stamina') return p.stamina;
  return p[attr] * fatigueMult(p, cfg);
}

// Average effective Attack / Defense / Control across the five starters.
export function teamRatings(starters, cfg = CONFIG) {
  const n = starters.length;
  const sum = { attack: 0, defense: 0, control: 0, mult: 0 };
  for (const p of starters) {
    sum.attack += effective(p, 'attack', cfg);
    sum.defense += effective(p, 'defense', cfg);
    sum.control += effective(p, 'control', cfg);
    sum.mult += fatigueMult(p, cfg);
  }
  return { attack: round2(sum.attack / n), defense: round2(sum.defense / n), control: round2(sum.control / n), fatigueFactor: round2(sum.mult / n) };
}

export function oppRatings(opp) {
  return { attack: opp.attack, defense: opp.defense, control: opp.control, fatigueFactor: 1 };
}

export function tendencyPP(opp, side, yourTactic) {
  const t = opp.tendency;
  return t.side === side && t.tactic === yourTactic ? t.pp : 0;
}

// The single documented modifier formula. Returns every term so it can be logged.
export function possessionOdds(off, def, tactic, tendency, cfg = CONFIG) {
  const attackTerm = round2(cfg.kAttack * (off.attack - def.defense));
  const controlTerm = round2(cfg.kControl * (off.control - def.control));
  const raw = round2(attackTerm + controlTerm + tendency);
  const shift = Math.max(-cfg.maxShift, Math.min(cfg.maxShift, Math.round(raw)));
  const b = cfg.base[tactic];
  const dist = [b[0] - shift, b[1], b[2] + shift];
  return { attackTerm, controlTerm, tendency, raw, shift, dist };
}

export const expectedPoints = dist => round2((dist[1] * 3 + dist[2] * 7) / 100);

export function matchPreview(starters, opp, tactic, cfg = CONFIG) {
  const you = teamRatings(starters, cfg);
  const them = oppRatings(opp);
  const yourOdds = possessionOdds(you, them, tactic, tendencyPP(opp, 'you', tactic), cfg);
  const theirOdds = possessionOdds(them, you, opp.tactic, tendencyPP(opp, 'them', tactic), cfg);
  return {
    you, them, yourOdds, theirOdds,
    evYou: round2(expectedPoints(yourOdds.dist) * cfg.possessionsPerTeam),
    evThem: round2(expectedPoints(theirOdds.dist) * cfg.possessionsPerTeam),
  };
}

export function outcomeFor(dist, roll) {
  if (roll < dist[0]) return 0;
  if (roll < dist[0] + dist[1]) return 3;
  return 7;
}

// Resolve a whole match once. Possessions alternate; each team gets 8.
export function simulateMatch({ starters, opp, tactic, rngState, youFirst }, cfg = CONFIG) {
  const pv = matchPreview(starters, opp, tactic, cfg);
  let rng = rngState >>> 0;
  let scoreYou = 0, scoreThem = 0;
  const events = [];
  const total = cfg.possessionsPerTeam * 2;
  for (let i = 0; i < total; i++) {
    const yours = (i % 2 === 0) === !!youFirst;
    const odds = yours ? pv.yourOdds : pv.theirOdds;
    let roll;
    [roll, rng] = rngInt(rng, 100);
    const points = outcomeFor(odds.dist, roll);
    const marginBefore = scoreYou - scoreThem;
    if (yours) scoreYou += points; else scoreThem += points;
    events.push({
      i, n: i + 1, team: yours ? 'you' : 'them',
      tactic: yours ? tactic : opp.tactic,
      off: yours ? pv.you : pv.them,
      def: yours ? pv.them : pv.you,
      attackTerm: odds.attackTerm, controlTerm: odds.controlTerm, tendency: odds.tendency,
      raw: odds.raw, shift: odds.shift, dist: odds.dist.slice(),
      fatigueFactor: pv.you.fatigueFactor,
      roll, points, marginBefore, scoreYou, scoreThem,
    });
  }
  const outcome = scoreYou > scoreThem ? 'W' : scoreYou < scoreThem ? 'L' : 'D';
  return { events, scoreYou, scoreThem, outcome, rngAfter: rng, decisive: pickDecisive(events, cfg), preview: pv };
}

export function eventSwing(e, cfg = CONFIG) {
  let s = Math.abs(e.points - expectedPoints(e.dist));
  if (e.i >= cfg.lateFrom && Math.abs(e.marginBefore) <= cfg.lateMargin) s += cfg.lateBonus;
  return round2(s);
}

// Three decisive events: biggest swing vs expectation, ties go to the later possession.
export function pickDecisive(events, cfg = CONFIG) {
  return events
    .map(e => ({ i: e.i, s: eventSwing(e, cfg) }))
    .sort((a, b) => b.s - a.s || b.i - a.i)
    .slice(0, 3)
    .map(x => x.i)
    .sort((a, b) => a - b);
}

export function eventFlags(e, cfg = CONFIG) {
  return {
    team: e.team, points: e.points, tactic: e.tactic,
    tendency: e.tendency !== 0,
    late: e.i >= cfg.lateFrom && Math.abs(e.marginBefore) <= cfg.lateMargin,
    tired: e.team === 'you' ? e.fatigueFactor < cfg.tiredBelow : false,
  };
}

export function templateFor(e, cfg = CONFIG) {
  const f = eventFlags(e, cfg);
  return TEMPLATES.find(t => Object.entries(t.when).every(([k, v]) => f[k] === v));
}

export function renderEvent(e, ctx, cfg = CONFIG) {
  const t = templateFor(e, cfg);
  const yourTactic = ctx.tactic;
  const vals = {
    n: e.n,
    tactic: TACTICS[e.team === 'you' ? e.tactic : yourTactic].name.toLowerCase(),
    club: CLUB.short,
    opp: ctx.oppName,
    chance0: e.dist[0], chance3: e.dist[1], chance7: e.dist[2],
    roll: e.roll,
    score: `${CLUB.short} ${e.scoreYou}, ${ctx.oppShort} ${e.scoreThem}`,
    fatiguePct: Math.round(e.fatigueFactor * 100),
  };
  return { id: t.id, text: t.text.replace(/\{(\w+)\}/g, (_, k) => String(vals[k])) };
}
