// One More Season — content data. All names and text are original and fictional.
export const CLUB = { name: 'Saltgate Town', short: 'Saltgate', league: 'Fenward Five League' };

export const ATTRS = ['attack', 'defense', 'control', 'stamina'];
export const ATTR_LABEL = { attack: 'Attack', defense: 'Defense', control: 'Control', stamina: 'Stamina' };
export const ATTR_SHORT = { attack: 'ATK', defense: 'DEF', control: 'CTL', stamina: 'STA' };
export const ATTR_HELP = {
  attack: 'Attack: turns possessions into 7-point scores against their Defense.',
  defense: 'Defense: blunts their Attack when they have the ball.',
  control: 'Control: keeps the ball against their Control, on both ends.',
  stamina: 'Stamina: does not score. It cuts the fatigue a starter gains each match.',
};

export const ROSTER = [
  { id: 'reyke', name: 'Tomas Reyke', role: 'Striker', attack: 9, defense: 3, control: 6, stamina: 5, fatigue: 64 },
  { id: 'marrow', name: 'Ilse Marrow', role: 'Playmaker', attack: 6, defense: 4, control: 9, stamina: 6, fatigue: 22 },
  { id: 'abara', name: 'Kofi Abara', role: 'Stopper', attack: 3, defense: 8, control: 5, stamina: 7, fatigue: 18 },
  { id: 'hollis', name: 'Bram Hollis', role: 'Keeper', attack: 2, defense: 9, control: 4, stamina: 6, fatigue: 12 },
  { id: 'ostrova', name: 'Nell Ostrova', role: 'Winger', attack: 7, defense: 4, control: 6, stamina: 8, fatigue: 30 },
  { id: 'calder', name: 'Rui Calder', role: 'Engine', attack: 5, defense: 6, control: 6, stamina: 9, fatigue: 26 },
  { id: 'danner', name: 'Pip Danner', role: 'Young forward', attack: 6, defense: 3, control: 4, stamina: 7, fatigue: 0 },
  { id: 'brask', name: 'Otto Brask', role: 'Veteran back', attack: 4, defense: 7, control: 5, stamina: 3, fatigue: 8 },
];

export const TACTICS = {
  patient: { id: 'patient', name: 'Patient', blurb: 'Work it short. Reliable 3s, fewer 7s.' },
  balanced: { id: 'balanced', name: 'Balanced', blurb: 'Mix it up. Even spread.' },
  aggressive: { id: 'aggressive', name: 'Aggressive', blurb: 'Go direct. Big upside, lots of blanks.' },
};
export const TACTIC_ORDER = ['patient', 'balanced', 'aggressive'];

// Tendency: when YOU pick `tactic`, add `pp` to the shift of `side`'s offense.
// side 'you' = your attacks; side 'them' = their attacks (positive pp helps them).
export const OPPONENTS = [
  {
    id: 'harbor', name: 'Harbor Lane Rovers', colors: ['#2f6f8f', '#e8d9a8'],
    attack: 4.5, defense: 4, control: 4.5, tactic: 'balanced',
    tendency: { tactic: 'patient', side: 'you', pp: 7, text: 'They push everyone forward. Patient build-ups find the space behind them.' },
  },
  {
    id: 'millbrook', name: 'Millbrook Stonecutters', colors: ['#6b6b6b', '#f2b134'],
    attack: 4, defense: 6, control: 4.5, tactic: 'patient',
    tendency: { tactic: 'aggressive', side: 'you', pp: -6, text: 'They pack the box. Long-range gambles get blocked.' },
  },
  {
    id: 'ironworks', name: 'Ironworks Social', colors: ['#8a3b2e', '#d9d2c5'],
    attack: 5.5, defense: 4.5, control: 4, tactic: 'aggressive',
    tendency: { tactic: 'aggressive', side: 'you', pp: 7, text: 'Slow to turn. Direct, aggressive attacks catch them flat.' },
  },
  {
    id: 'ashgrove', name: 'Ashgrove Kestrels', colors: ['#3d7a4a', '#f4f1e6'],
    attack: 5, defense: 4.5, control: 5, tactic: 'balanced',
    tendency: { tactic: 'aggressive', side: 'them', pp: 7, text: 'Lethal on the break. If you commit bodies forward (Aggressive), they punish it.' },
  },
  {
    id: 'cobalt', name: 'Cobalt Street', colors: ['#2b4aa0', '#9fd3f0'],
    attack: 5, defense: 5, control: 5, tactic: 'patient',
    tendency: { tactic: 'patient', side: 'you', pp: -6, text: 'They smother slow play. Patient possession gets pressed into mistakes.' },
  },
  {
    id: 'quillmouth', name: 'Quillmouth Lanterns', colors: ['#5a2d82', '#f6c945'],
    attack: 5.5, defense: 5.5, control: 5.5, tactic: 'balanced',
    tendency: { tactic: 'balanced', side: 'you', pp: 6, text: 'Champions with a high back line. Balanced, mixed play pulls them apart.' },
  },
];

// Twelve recap templates. Each describes ONE logged possession. Placeholders are
// filled only from the recorded event and match context (see sim.renderTemplate).
// Rules are checked top to bottom; first match wins.
export const TEMPLATES = [
  { id: 'you7_tend', when: { team: 'you', points: 7, tendency: true }, text: 'Possession {n}: the {tactic} plan hit the weakness the scouts flagged, and {club} scored 7 ({chance7}% chance, roll {roll}). {score}.' },
  { id: 'you7_late', when: { team: 'you', points: 7, late: true }, text: 'Possession {n}, late and tight: {club} found a 7 when it mattered ({chance7}% chance, roll {roll}). {score}.' },
  { id: 'you7', when: { team: 'you', points: 7 }, text: 'Possession {n}: {club} broke through for 7 ({chance7}% chance, roll {roll}). {score}.' },
  { id: 'you3_tired', when: { team: 'you', points: 3, tired: true }, text: 'Possession {n}: tired legs (your side at {fatiguePct}% strength) settled for 3. {score}.' },
  { id: 'you3', when: { team: 'you', points: 3 }, text: 'Possession {n}: {club} worked it into a 3 ({chance3}% chance). {score}.' },
  { id: 'you0_gamble', when: { team: 'you', points: 0, tactic: 'aggressive' }, text: 'Possession {n}: the aggressive gamble came up empty (a {chance0}% risk, roll {roll}). {score}.' },
  { id: 'you0_tired', when: { team: 'you', points: 0, tired: true }, text: 'Possession {n}: fatigue showed. Your side played at {fatiguePct}% strength and came away with nothing. {score}.' },
  { id: 'you0', when: { team: 'you', points: 0 }, text: 'Possession {n}: {club} came up empty ({chance0}% chance of a blank, roll {roll}). {score}.' },
  { id: 'them7_tend', when: { team: 'them', points: 7, tendency: true }, text: 'Possession {n}: {opp} punished your {tactic} shape exactly as scouted, 7 points ({chance7}% chance). {score}.' },
  { id: 'them7', when: { team: 'them', points: 7 }, text: 'Possession {n}: {opp} cut through for 7 ({chance7}% chance, roll {roll}). {score}.' },
  { id: 'them3', when: { team: 'them', points: 3 }, text: 'Possession {n}: {opp} chipped in a 3. {score}.' },
  { id: 'them0', when: { team: 'them', points: 0 }, text: 'Possession {n}: your defense held. {opp} got nothing ({chance0}% chance of a stop, roll {roll}). {score}.' },
];

export function validateContent(cfg) {
  const errors = [];
  const ids = new Set();
  if (ROSTER.length !== 8) errors.push('roster must have 8 players');
  for (const p of ROSTER) {
    if (ids.has(p.id)) errors.push('duplicate player id ' + p.id);
    ids.add(p.id);
    for (const a of ATTRS) {
      if (!Number.isInteger(p[a]) || p[a] < cfg.attrMin || p[a] > cfg.attrMax) errors.push(p.id + ' bad ' + a);
    }
    if (!(p.fatigue >= 0 && p.fatigue <= cfg.fatigueMax)) errors.push(p.id + ' bad fatigue');
  }
  if (OPPONENTS.length !== cfg.fixtures) errors.push('need one opponent per fixture');
  for (const o of OPPONENTS) {
    if (!TACTICS[o.tactic]) errors.push(o.id + ' bad tactic');
    const t = o.tendency;
    if (!TACTICS[t.tactic] || (t.side !== 'you' && t.side !== 'them') || Math.abs(t.pp) > cfg.maxShift) errors.push(o.id + ' bad tendency');
  }
  for (const k of TACTIC_ORDER) {
    const b = cfg.base[k];
    if (!b || b.length !== 3 || b[0] + b[1] + b[2] !== 100) errors.push('base ' + k + ' must sum to 100');
    if (b && (b[0] < cfg.maxShift || b[2] < cfg.maxShift)) errors.push('base ' + k + ' cannot absorb max shift');
  }
  if (TEMPLATES.length !== 12) errors.push('need 12 templates');
  const tids = new Set();
  const allowed = new Set(['n', 'tactic', 'club', 'opp', 'chance0', 'chance3', 'chance7', 'roll', 'score', 'fatiguePct']);
  for (const t of TEMPLATES) {
    if (tids.has(t.id)) errors.push('duplicate template ' + t.id);
    tids.add(t.id);
    for (const m of t.text.matchAll(/\{(\w+)\}/g)) if (!allowed.has(m[1])) errors.push(t.id + ' unknown placeholder ' + m[1]);
  }
  // every (team, points) pair must have a fallback template with no extra conditions
  for (const team of ['you', 'them']) for (const pts of cfg.outcomes) {
    if (!TEMPLATES.some(t => t.when.team === team && t.when.points === pts && Object.keys(t.when).length === 2)) errors.push('no fallback template for ' + team + ' ' + pts);
  }
  return errors;
}
