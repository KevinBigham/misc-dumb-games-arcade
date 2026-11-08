// ===== player.js =====
const RK = ['ins', 'mid', 'tpt', 'ft', 'pas', 'bhd', 'orb', 'drb', 'pdf', 'idf', 'stl', 'blk', 'spd', 'str', 'jmp', 'sta', 'iq', 'dur'];
const RSHORT = { ins: 'INS', mid: 'MID', tpt: '3PT', ft: 'FT', pas: 'PAS', bhd: 'BHD', orb: 'ORB', drb: 'DRB', pdf: 'PDF', idf: 'IDF', stl: 'STL', blk: 'BLK', spd: 'SPD', str: 'STR', jmp: 'JMP', sta: 'STA', iq: 'IQ', dur: 'DUR' };
const RLONG = { ins: 'Inside Scoring', mid: 'Mid-Range', tpt: 'Three-Point', ft: 'Free Throw', pas: 'Passing', bhd: 'Ball Handling', orb: 'Off. Rebounding', drb: 'Def. Rebounding', pdf: 'Perimeter Defense', idf: 'Interior Defense', stl: 'Steal', blk: 'Block', spd: 'Speed', str: 'Strength', jmp: 'Vertical', sta: 'Stamina', iq: 'Basketball IQ', dur: 'Durability' };
const RGROUPS = [['Scoring', ['ins', 'mid', 'tpt', 'ft']], ['Playmaking', ['pas', 'bhd', 'iq']], ['Rebounding', ['orb', 'drb']], ['Defense', ['pdf', 'idf', 'stl', 'blk']], ['Athleticism', ['spd', 'str', 'jmp', 'sta', 'dur']]];
const POSS = ['PG', 'SG', 'SF', 'PF', 'C'];
const POS_IDX = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };
const PHYS = { spd: 1, str: 1, jmp: 1, sta: 1, dur: 1 };
const POS_BASE = {
  PG: { ins: 50, mid: 55, tpt: 55, ft: 72, pas: 70, bhd: 72, orb: 30, drb: 38, pdf: 58, idf: 30, stl: 58, blk: 22, spd: 75, str: 40, jmp: 62, sta: 70, iq: 58, dur: 72 },
  SG: { ins: 54, mid: 58, tpt: 58, ft: 72, pas: 55, bhd: 62, orb: 35, drb: 42, pdf: 58, idf: 35, stl: 55, blk: 28, spd: 70, str: 46, jmp: 64, sta: 70, iq: 55, dur: 72 },
  SF: { ins: 58, mid: 55, tpt: 50, ft: 68, pas: 50, bhd: 52, orb: 45, drb: 52, pdf: 56, idf: 48, stl: 50, blk: 40, spd: 64, str: 56, jmp: 62, sta: 68, iq: 55, dur: 72 },
  PF: { ins: 62, mid: 50, tpt: 36, ft: 63, pas: 42, bhd: 40, orb: 60, drb: 65, pdf: 45, idf: 60, stl: 42, blk: 55, spd: 54, str: 68, jmp: 58, sta: 66, iq: 55, dur: 72 },
  C: { ins: 64, mid: 42, tpt: 24, ft: 58, pas: 38, bhd: 32, orb: 68, drb: 72, pdf: 38, idf: 66, stl: 38, blk: 66, spd: 45, str: 75, jmp: 52, sta: 62, iq: 54, dur: 72 },
};
const HGT = { PG: [74.5, 1.4], SG: [77, 1.2], SF: [79, 1.1], PF: [81, 1.1], C: [83.5, 1.3] };
const WGT = { PG: 190, SG: 205, SF: 222, PF: 242, C: 258 };
const OVR_W = {
  PG: { tpt: .12, mid: .10, ins: .08, pas: .17, bhd: .15, pdf: .10, stl: .05, spd: .10, iq: .10, ft: .03 },
  SG: { tpt: .18, mid: .14, ins: .12, bhd: .09, pas: .06, pdf: .12, stl: .05, spd: .09, iq: .07, jmp: .05, ft: .03 },
  SF: { ins: .14, mid: .12, tpt: .12, pdf: .11, idf: .05, drb: .06, orb: .03, spd: .08, jmp: .08, str: .06, pas: .06, iq: .09 },
  PF: { ins: .18, mid: .08, tpt: .03, drb: .12, orb: .08, idf: .14, blk: .08, str: .12, jmp: .08, iq: .06, pas: .03 },
  C: { ins: .17, drb: .14, orb: .10, idf: .16, blk: .14, str: .13, jmp: .06, iq: .06, pas: .02, ft: .02 },
};
const ARCH = {
  PG: [['Floor General', { pas: 12, iq: 10, bhd: 5, ins: -4, jmp: -3 }], ['Scoring Guard', { tpt: 9, mid: 9, bhd: 6, pas: -6 }],
    ['Slashing Guard', { ins: 10, spd: 7, jmp: 7, tpt: -6, mid: -3 }], ['Defensive Pest', { pdf: 12, stl: 12, mid: -4, tpt: -4 }]],
  SG: [['Sharpshooter', { tpt: 13, ft: 8, mid: 5, ins: -5, pdf: -4 }], ['Slasher', { ins: 11, jmp: 9, spd: 5, tpt: -7 }],
    ['3-and-D Wing', { tpt: 8, pdf: 11, stl: 5, bhd: -5, ins: -4 }], ['Shot Creator', { mid: 11, bhd: 8, ins: 4, pdf: -5 }]],
  SF: [['Point Forward', { pas: 12, bhd: 9, iq: 6, jmp: -3 }], ['Two-Way Wing', { pdf: 10, idf: 6, ins: 4, tpt: 3, pas: -4 }],
    ['Volume Scorer', { ins: 8, mid: 8, tpt: 6, pdf: -6 }], ['Athletic Wing', { jmp: 12, spd: 8, ins: 6, mid: -5, iq: -3 }]],
  PF: [['Stretch Four', { tpt: 18, mid: 10, ft: 6, orb: -6, blk: -5, str: -4 }], ['Bruiser', { str: 10, orb: 9, drb: 7, idf: 6, mid: -5, spd: -4 }],
    ['High Flyer', { jmp: 12, ins: 8, blk: 6, mid: -5, iq: -3 }], ['Post Scorer', { ins: 12, mid: 5, str: 4, pdf: -5 }]],
  C: [['Rim Protector', { blk: 14, idf: 12, drb: 5, ins: -6, ft: -6 }], ['Post Anchor', { ins: 13, str: 6, iq: 3, blk: -5 }],
    ['Glass Cleaner', { orb: 13, drb: 12, str: 5, mid: -6 }], ['Stretch Big', { mid: 12, tpt: 15, ft: 10, orb: -5, str: -5 }]],
};
// normalize OVR so an average (talent 50) player of any position grades ~70
const OVR_OFF = {};
for (const pos of POSS) {
  let raw = 0;
  for (const k in OVR_W[pos]) {
    const ab = U.avg(ARCH[pos], a => a[1][k] || 0);
    raw += OVR_W[pos][k] * (POS_BASE[pos][k] + ab);
  }
  OVR_OFF[pos] = 70 - raw;
}

function rawOvr(r, pos) { let s = 0; const w = OVR_W[pos]; for (const k in w) s += r[k] * w[k]; return s + OVR_OFF[pos]; }
function calcOvr(r, pos) { return U.clamp(Math.round(rawOvr(r, pos)), 25, 99); }
function bestPosOvr(r) { let best = 'PG', bv = 0; for (const p of POSS) { const v = rawOvr(r, p); if (v > bv) { bv = v; best = p; } } return best; }

function genName(intlChance = 0.14) {
  for (let i = 0; i < 20; i++) {
    if (Math.random() < intlChance) {
      const c = U.pick(INTL);
      return { fn: U.pick(c[1]), ln: U.pick(c[2]), country: c[0] };
    }
    const fn = U.pick(FIRST), ln = U.pick(LAST);
    if (!NAME_BLOCK.has(fn + ' ' + ln)) return { fn, ln, country: 'USA' };
  }
  return { fn: 'Johnny', ln: 'Doe', country: 'USA' };
}

const PERS_W = [['leader', 10], ['winner', 16], ['mercenary', 16], ['loyal', 12], ['diva', 10], ['gymrat', 12], ['easy', 24]];

function genPlayer(S, o) {
  const pos = o.pos || U.pick(POSS);
  const T = o.talent;
  const arch = U.pick(ARCH[pos]);
  const hgt = Math.round(U.gauss(HGT[pos][0], HGT[pos][1]));
  const hd = hgt - HGT[pos][0];
  const r = {};
  for (const k of RK) r[k] = POS_BASE[pos][k] + (T - 50) * (PHYS[k] ? 0.55 : 0.95) + (arch[1][k] || 0) + U.gauss(0, 7);
  r.orb += hd * 2; r.drb += hd * 2; r.blk += hd * 2.5; r.idf += hd * 1.5; r.spd -= hd * 1.5; r.bhd -= hd * 1.2;
  r.ft = 0.5 * r.ft + 0.25 * r.mid + 0.25 * r.tpt + 8 + U.gauss(0, 4);
  r.dur = U.gauss(72, 12);
  r.sta = U.gauss(POS_BASE[pos].sta + (T - 50) * 0.3, 8);
  for (const k of RK) r[k] = Math.round(U.clamp(r[k], 20, 99));
  const nm = o.name || genName(o.intl);
  const age = o.age;
  const p = {
    pid: S.nextPid++, tid: o.tid != null ? o.tid : -1, fn: nm.fn, ln: nm.ln, country: nm.country, pos, age, hgt,
    wgt: Math.round(WGT[pos] + hd * 5 + U.gauss(0, 9)), arch: arch[0], r, ovr: 0, pot: 0,
    college: nm.country !== 'USA' ? nm.country : (age <= 20 && T > 60 && Math.random() < 0.3 ? PREP : U.pick(COLLEGES)),
    pers: U.wpick(PERS_W, x => x[1])[0], morale: 65, contract: { amt: 0, exp: S.season }, inj: null,
    stats: [], awards: [], yrsPro: Math.max(0, age - U.ri(19, 22)), num: 0, joined: S.season, draft: null, hist: [], prom: null,
  };
  p.ovr = calcOvr(r, pos);
  p.pot = o.pot != null ? o.pot : potFor(p.ovr, age);
  return p;
}

function potFor(ovr, age) {
  let g;
  if (age <= 19) g = U.gauss(18, 6); else if (age <= 20) g = U.gauss(15, 6); else if (age <= 21) g = U.gauss(12, 5);
  else if (age <= 22) g = U.gauss(9, 4.5); else if (age <= 23) g = U.gauss(6.5, 4); else if (age <= 24) g = U.gauss(4.5, 3);
  else if (age <= 26) g = U.gauss(2, 2); else g = 0;
  return U.clamp(Math.round(ovr + Math.max(0, g)), ovr, 99);
}

function potGrade(pot) { return U.grade(pot); }
function pname(p) { return p.fn + ' ' + p.ln; }
function pshort(p) { return p.fn[0] + '. ' + p.ln; }

// "worth" on the OVR scale, folding in age and upside
function playerWorth(p) {
  let v = p.ovr;
  if (p.age <= 25) v += (p.pot - p.ovr) * (p.age <= 21 ? 0.45 : p.age <= 23 ? 0.33 : 0.2);
  if (p.age >= 30) v -= (p.age - 29) * 1.1;
  if (p.inj && p.inj.games > 40) v -= 3;
  return v;
}

function marketSalary(S, p) {
  const v = playerWorth(p);
  const x = U.clamp((v - 55) / 40, 0, 1.12);
  let sal = 450 + 19800 * Math.pow(x, 2.15);
  sal *= S.cap / 49500;
  return Math.round(U.clamp(sal, S.minSal, S.maxSal) / 10) * 10;
}

function askYears(p) {
  if (p.age <= 24) return U.ri(3, 5);
  if (p.age <= 29) return U.ri(3, 5);
  if (p.age <= 32) return U.ri(2, 3);
  return U.ri(1, 2);
}

// trade/asset value: convex so stars dominate
function tradeValue(S, p, mode) {
  let w = playerWorth(p);
  if (mode === 'rebuild') { if (p.age >= 29) w -= (p.age - 28) * 1.5; if (p.age <= 24) w += 2; }
  if (mode === 'contend') { w += (p.ovr - w) * 0.5; if (p.age <= 22) w -= 1.5; }
  let v = Math.pow(Math.max(0, w - 45) / 10, 3.1) * 2.2;
  const yrs = Math.max(1, p.contract.exp - S.season + 1);
  const fair = marketSalary(S, p);
  const over = (p.contract.amt - fair) / 1000; // $M per year overpaid
  v -= over * Math.min(yrs, 4) * 1.4;
  if (p.inj) v -= Math.min(p.inj.games, 82) / 82 * v * 0.5;
  return v;
}

function devPlayer(p, delta, opts = {}) {
  const age = p.age;
  for (const k of RK) {
    let d = delta * (1 + U.gauss(0, 0.7));
    if (PHYS[k] && k !== 'str' && k !== 'dur') {
      if (age >= 30) d -= (age - 29) * 0.9 + U.rf(0, 1.2);
      else if (age <= 22) d += U.rf(0, 1.0);
    }
    if (k === 'iq') d = Math.abs(delta) * 0.3 + (age >= 27 ? U.rf(0, 1.5) : U.rf(0, 2));
    if (k === 'str' && age <= 26) d += U.rf(0, 1.5);
    if (k === 'dur') d = age >= 31 ? -U.rf(0, 2.5) : U.gauss(0, 1);
    p.r[k] = Math.round(U.clamp(p.r[k] + d, 15, 99));
  }
  // correct drift so OVR change lands near target
  const before = p.ovr, target = before + delta;
  let now = rawOvr(p.r, p.pos);
  const fix = (target - now);
  if (Math.abs(fix) > 0.5) {
    const ks = Object.keys(OVR_W[p.pos]);
    for (const k of ks) p.r[k] = Math.round(U.clamp(p.r[k] + fix, 15, 99));
  }
  p.ovr = calcOvr(p.r, p.pos);
  return p.ovr - before;
}

// season-end development. ctx: {coachDev, facility, mpg, asst}
function progressPlayer(p, ctx = {}) {
  const age = p.age;
  let d;
  const gap = Math.max(0, p.pot - p.ovr);
  if (age <= 26) {
    const f = age <= 19 ? 0.32 : age <= 20 ? 0.30 : age <= 21 ? 0.27 : age <= 22 ? 0.24 : age <= 23 ? 0.21 : age <= 24 ? 0.18 : age <= 25 ? 0.14 : 0.10;
    d = gap * f + U.gauss(0, 2.2);
    if (ctx.mpg != null) d += U.clamp((ctx.mpg - 15) / 20, -0.6, 0.8);
  } else if (age <= 29) d = U.gauss(-0.4, 1.4);
  else d = -(age - 29) * 0.95 - 0.4 + U.gauss(0, 1.5);
  d += ((ctx.coachDev || 60) - 60) / 40 + (ctx.facility || 0) * 0.35 + ((ctx.asst || 60) - 60) / 60;
  if (p.pers === 'gymrat') d += 0.6;
  if (d > 0 && p.ovr >= 88) d *= 0.5;
  if (age >= 33 && Math.random() < 0.15) d -= U.rf(2, 5);
  d = Math.round(U.clamp(d, -12, 14));
  const res = devPlayer(p, d);
  if (age <= 25) p.pot = U.clamp(Math.round(p.pot + U.gauss(-0.3, 2.0)), 40, 99);
  else p.pot = Math.min(p.pot, p.ovr + (age <= 27 ? 2 : 0));
  return res;
}

function isRookie(S, p) { return p.draft && p.draft.year === S.season + 0 && p.yrsPro === 0; }

function seasonRow(p, season, tid, po) {
  let row = p.stats.find(s => s.s === season && s.tid === tid && s.po === po);
  if (!row) {
    row = { s: season, tid, po, gp: 0, gs: 0, min: 0, pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0 };
    p.stats.push(row);
  }
  return row;
}

const STAT_KEYS = ['gp', 'gs', 'min', 'pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'orb', 'drb', 'ast', 'stl', 'blk', 'tov', 'pf'];
function sumRows(rows) {
  const t = {}; for (const k of STAT_KEYS) t[k] = 0;
  for (const r of rows) for (const k of STAT_KEYS) t[k] += r[k] || 0;
  return t;
}
function seasonTotals(p, season, po = 0) { return sumRows(p.stats.filter(s => s.s === season && s.po === po)); }
function careerTotals(p, po = 0) { return sumRows(p.stats.filter(s => s.po === po)); }
function perGame(t) {
  const g = t.gp || 1;
  return {
    gp: t.gp, gs: t.gs, mpg: t.min / g, ppg: t.pts / g, rpg: (t.orb + t.drb) / g, apg: t.ast / g, spg: t.stl / g, bpg: t.blk / g, tpg: t.tov / g,
    fgp: t.fga ? t.fgm / t.fga : 0, tpp: t.tpa ? t.tpm / t.tpa : 0, ftp: t.fta ? t.ftm / t.fta : 0,
    eff: (t.pts + t.orb + t.drb + t.ast + t.stl + t.blk - (t.fga - t.fgm) - (t.fta - t.ftm) - t.tov) / g,
  };
}
