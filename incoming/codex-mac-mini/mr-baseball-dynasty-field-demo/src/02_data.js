/* ════════════════ SECTION §D — DATA: teams, rosters, ratings ════════════════ */
// Schema mirrors the verified roster backbone [PROVEN structure, original values]:
// 25-man rosters — slots 0-14 batters (default lineup = roster order, first 9 bat),
// slots 15-24 pitchers, slot 15 = starter. Ratings are 0-15 nibbles backed by
// 16-entry tuning tables. ALL names/teams below are original inventions.

// Authentic engine idiom [PROVEN]: adjacent ratings collapse to even tiers
// before launch-table lookup (rating & ~1) — chunky player differentiation.
const tier = (r) => r & 0xE;

// 16-entry tuning tables — THE balancing surface (index = 0-15 rating)
const TABLE16 = {
  // batter top speed, subunits/frame (runner + manual fielder cap)
  runSpeed:  [560,576,592,608,624,640,656,672,688,704,720,744,768,800,832,864],
  // pitcher velocity → pitch flight frames get scaled between fast/slow poles
  pitchVelo: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  // fielder max speed, subunits/frame (per-rating around the 3.5 u/f tested max)
  fldSpeed:  [640,656,672,688,704,720,736,752,768,784,800,816,832,856,880,896],
  // CPU batter timing jitter (σ frames ×10) by team skill — difficulty surface
  cpuJitter: [34,32,30,28,26,25,24,23,22,21,20,19,18,17,16,15],
};

function makePlayer(surname, initial, pos, uniform, bat, pow, spd, def, hand) {
  return { surname, initial, pos, uniform,
    ratings: { bat, pow, spd, def }, hand,   // 0-15 nibbles
    // display stats [DESIGN: generated season-so-far flavor]
    avg: 0, hr: 0, gameAB: 0, gameH: 0 };
}
function makePitcher(surname, initial, uniform, velo, ctrl, stam, hand, w, l) {
  return { surname, initial, pos: 'P', uniform,
    ratings: { velo, ctrl, stam, bat: 2, pow: 1, spd: 4, def: 8 }, hand,
    w, l, era: 0, fourPitch: [0, 1, 2, 3] };   // indices into PITCH_TYPES
}

// ── Two original demo franchises (28-team league shape reserved for MBD) ──
function buildTeams() {
  const T = [];
  // AWAY — Bay City Admirals (navy & gold)
  {
    const b = [
      // surname ≤8, initial, pos, #, BAT,POW,SPD,DEF, hand
      makePlayer('VASQUEZ', 'R', 'CF', 24, 11, 6, 14, 11, 'L'),
      makePlayer('OKAFOR',  'D', 'SS',  7, 10, 5, 12, 13, 'R'),
      makePlayer('BIGHAM',  'K', 'RF', 30, 12, 13, 8, 9, 'R'),
      makePlayer('SLOAN',   'T', '1B', 44,  9, 14, 4, 8, 'L'),
      makePlayer('McGINTY', 'P', '3B', 17, 10, 9, 7, 10, 'R'),
      makePlayer('CHU',     'W', 'LF', 12,  9, 8, 11, 8, 'L'),
      makePlayer('DELGADO', 'M', 'C',   8,  8, 10, 3, 12, 'R'),
      makePlayer('PARISH',  'E', '2B',  4,  8, 4, 10, 12, 'R'),
      makePlayer('HOLT',    'J', 'P',  31,  4, 3, 5, 9, 'R'),
      makePlayer('ARCHER',  'B', 'OF', 25,  8, 7, 9, 8, 'R'),
      makePlayer('NUNEZ',   'F', 'IF',  2,  7, 5, 10, 10, 'L'),
      makePlayer('WYATT',   'C', 'OF', 28,  7, 9, 7, 7, 'L'),
      makePlayer('KIMURA',  'S', 'IF',  9,  8, 4, 9, 11, 'R'),
      makePlayer('BOONE',   'L', 'C',  15,  6, 8, 3, 10, 'R'),
      makePlayer('FARRIS',  'G', 'IF', 11,  6, 6, 8, 9, 'R'),
    ];
    const p = [
      makePitcher('HOLT',    'J', 31, 12, 10, 11, 'R', 9, 4),
      makePitcher('OYELARAN','T', 45, 14, 6, 9, 'L', 7, 6),
      makePitcher('DRAKE',   'N', 21, 9, 12, 8, 'R', 6, 3),
      makePitcher('CASTILLO','A', 38, 10, 9, 7, 'L', 5, 5),
      makePitcher('PLUM',    'H', 52, 8, 8, 10, 'R', 4, 2),
      makePitcher('REEVES',  'V', 40, 11, 7, 6, 'R', 3, 4),
      makePitcher('KOWALSKI','Z', 33, 9, 10, 5, 'L', 2, 1),
      makePitcher('BATES',   'O', 19, 7, 11, 7, 'R', 3, 2),
      makePitcher('IVERSON', 'M', 48, 10, 8, 4, 'R', 1, 0),
      makePitcher('GRUBB',   'D', 56, 6, 9, 9, 'R', 0, 1),
    ];
    T.push({ city: 'BAY CITY', name: 'ADMIRALS', abbr: 'BAY',
      colors: { main: '#1c2f6b', trim: '#e8b93c', skinA: '#e8b48c', skinB: '#8a5a34' },
      players: b.concat(p), skill: 9 });
  }
  // HOME — Riverton Riverhawks (scarlet & cream)
  {
    const b = [
      makePlayer('FONTAINE','J', 'SS', 5, 11, 4, 13, 14, 'R'),
      makePlayer('ADEYEMI', 'B', 'CF', 22, 10, 7, 15, 10, 'R'),
      makePlayer('CROSS',   'D', 'RF', 34, 13, 12, 9, 8, 'L'),
      makePlayer('HAMMER',  'R', '1B', 42, 8, 15, 3, 7, 'R'),
      makePlayer('SORIA',   'E', 'LF', 18, 10, 8, 10, 9, 'L'),
      makePlayer('TANAKA',  'Y', '3B', 10, 9, 7, 8, 12, 'R'),
      makePlayer('WHITLOW', 'C', 'C',   6, 7, 9, 2, 13, 'R'),
      makePlayer('GARZA',   'I', '2B', 14, 8, 3, 11, 12, 'L'),
      makePlayer('PENNY',   'A', 'P',  29, 3, 2, 5, 8, 'L'),
      makePlayer('STROUD',  'N', 'OF', 27, 8, 8, 8, 8, 'R'),
      makePlayer('LACROIX', 'V', 'IF', 3, 7, 5, 9, 11, 'R'),
      makePlayer('DUFFY',   'Q', 'OF', 36, 6, 10, 6, 7, 'L'),
      makePlayer('MBEKI',   'S', 'IF', 13, 7, 6, 10, 10, 'R'),
      makePlayer('ROYCE',   'W', 'C',  20, 6, 7, 4, 11, 'R'),
      makePlayer('ALBRIGHT','H', 'IF', 16, 5, 6, 7, 10, 'R'),
    ];
    const p = [
      makePitcher('PENNY',   'A', 29, 11, 12, 10, 'L', 8, 5),
      makePitcher('STEEL',   'R', 47, 15, 5, 8, 'R', 6, 7),
      makePitcher('VANCE',   'K', 26, 9, 11, 9, 'R', 7, 2),
      makePitcher('OROZCO',  'L', 35, 10, 10, 6, 'L', 4, 4),
      makePitcher('BIRCH',   'F', 51, 8, 9, 11, 'R', 5, 3),
      makePitcher('KHAN',    'S', 41, 12, 8, 5, 'R', 3, 3),
      makePitcher('LUND',    'E', 32, 9, 9, 6, 'L', 2, 2),
      makePitcher('TREMBLAY','G', 23, 7, 12, 8, 'R', 2, 4),
      makePitcher('ASHFORD', 'P', 49, 10, 7, 4, 'R', 1, 1),
      makePitcher('MOTT',    'U', 54, 6, 10, 9, 'R', 1, 0),
    ];
    T.push({ city: 'RIVERTON', name: 'RIVERHAWKS', abbr: 'RIV',
      colors: { main: '#9c2020', trim: '#f0e6c8', skinA: '#8a5a34', skinB: '#e8b48c' },
      players: b.concat(p), skill: 9 });
  }
  // seed display stats deterministically (flavor only)
  const r = new RNG([7, 7, 7, 7, 7]);
  for (const t of T) for (const pl of t.players) {
    if (pl.pos !== 'P' || pl.w === undefined) {
      pl.avg = 210 + r.range(90) + (pl.ratings.bat ? pl.ratings.bat * 6 : 0); // .2xx-.35x
      if (pl.avg > 355) pl.avg = 355;
      pl.hr = Math.max(0, ((pl.ratings.pow * 3) >> 1) + r.range(6) - 2);
    }
    if (pl.w !== undefined) pl.era = 250 + r.range(200) - pl.ratings.ctrl * 8;
  }
  return T;
}

// ── Pitch types [DESIGN within MEASURED envelope: 20–26f flight, z 16–57] ──
// sel: d-pad held at B-press → type [MEASURED interface]. curvature per authored
// curves (pitch phase is NOT ballistic — fitted ≈ −0.017 u/f², own model) [OPEN→authored]
// z0 = release height per type; curves arrive FLAT at the bat plane (vertex at
// the plate) so the shadow-space window width is set purely by y-speed — this
// reproduces the spec's 4.4–5.7f windows and the "slower = more forgiving"
// mechanic by construction.
const PITCH_TYPES = [
  { id: 0, name: 'FASTBALL',  sel: 'DOWN',  T: 20, breakX: 0,    z0: 22 },
  { id: 1, name: 'SLIDER',    sel: 'LEFT',  T: 23, breakX: -2.4, z0: 27 },
  { id: 2, name: 'SCREWBALL', sel: 'RIGHT', T: 23, breakX: 2.4,  z0: 27 },
  { id: 3, name: 'CHANGEUP',  sel: 'UP',    T: 26, breakX: 0,    z0: 36 },
  { id: 4, name: 'STRAIGHT',  sel: null,    T: 23, breakX: 0,    z0: 27 },
];

// ── Launch tables [HYPOTHESIS, genre-standard — the tuning heart] ──
// Row select: (quality 4/2/0). Within a row: weighted elevation bands + speed.
// Elevation raw: degrees = (raw − 512) × 360 / 2048  [PROVEN encoding]
// Speed raw: units/f = raw / 16                      [PROVEN encoding]
const LAUNCH = {
  // elevation raw ranges [lo, hi] with weights, per quality
  elev: {
    4: [[40, [560, 600]], [45, [620, 700]], [15, [700, 760]]],           // liners / flies / high flies
    2: [[30, [488, 540]], [30, [548, 600]], [25, [615, 690]], [15, [770, 880]]], // grd/liner/fly/pop
    0: [[45, [476, 528]], [20, [540, 580]], [35, [790, 940]]],           // choppers / soft liners / pops
  },
  // speed raw base per quality (+ POW tier scaling + rng)
  // [v0.6] +6 across qualities: with throws traveling, runs pinned at ~2/game —
  // deep flies died at the track (12+ flyouts, 0.06 wall hits). A little more
  // carry turns track-outs into HR/off-wall XBH and restores 2.5-5 runs/game.
  speedBase: { 4: 148, 2: 128, 0: 90 },
  powPerTier: 5,      // raw per even tier step (tier 0-14)
  rngSpan: 12,
  // azimuth: timing class base (steps; sign flips for handedness), dLat gain
  azTiming: { early: -300, on: 0, late: 300 },
  azJitter: 90, azDLatGain: 3,
};
