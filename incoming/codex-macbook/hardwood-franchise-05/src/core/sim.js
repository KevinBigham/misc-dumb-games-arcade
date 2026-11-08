// ===== sim.js — possession-by-possession game engine =====
const SHOTS = {
  rim: { base: 0.617, k: 0.0058, kd: 0.0040, ast: 0.55, foul: 0.25, blk: 0.115, d: [0.5, 4] },
  close: { base: 0.398, k: 0.0054, kd: 0.0031, ast: 0.42, foul: 0.13, blk: 0.085, d: [4, 11] },
  mid: { base: 0.374, k: 0.0054, kd: 0.0027, ast: 0.54, foul: 0.038, blk: 0.02, d: [11, 22] },
  three: { base: 0.334, k: 0.0050, kd: 0.0025, ast: 0.84, foul: 0.012, blk: 0.01, d: [23.8, 26.5] },
};
const SIMK = { pace: [17.8, 15.6, 13.6], to: 0.150, nsf: 0.115, orb: 0.24, use: 2.85, drain: 0.00044, rec: 0.0011 };
const OFF_PLAYS = {
  balanced: { n: 'Balanced', d: 'Let the offense flow to the best look.' },
  pnr: { n: 'Pick & Roll', d: 'Guard-big action. More rim looks for bigs and pull-ups.' },
  iso: { n: 'Isolation', d: 'Clear out for your top scorer. Fewer assists.' },
  post: { n: 'Post Up', d: 'Pound it inside. Draws fouls, fewer threes.' },
  motion: { n: 'Motion', d: 'Ball movement. More assists, better looks, slower.' },
  three: { n: 'Spread & Fire', d: 'Five out. Hunt threes.' },
  push: { n: 'Push the Pace', d: 'Run on every possession. More rim attacks and risk.' },
};
const DEF_SCHEMES = {
  man: { n: 'Man-to-Man', d: 'Straight up. No gimmicks.' },
  zone: { n: '2-3 Zone', d: 'Protect the paint, concede threes and boards.' },
  press: { n: 'Full-Court Press', d: 'Force turnovers, burn energy, risk easy buckets.' },
  paint: { n: 'Pack the Paint', d: 'Sag off shooters, wall off the rim.' },
  deny: { n: 'Deny the Arc', d: 'Run shooters off the line, give up drives.' },
};
const PACES = ['Slow', 'Normal', 'Fast'];
const POS_TEND = { PG: [0.85, 0.42, 1.3, 0.75], SG: [0.9, 0.5, 1.4, 0.82], SF: [1.0, 0.75, 1.3, 0.6], PF: [1.1, 1.15, 1.1, 0.3], C: [1.3, 1.35, 0.68, 0.07] };
const ZONES = ['rim', 'close', 'mid', 'three'];

function comps(p) {
  const r = p.r, hb = 50 + (p.hgt - 79) * 4;
  return {
    rim: 0.55 * r.ins + 0.25 * r.jmp + 0.10 * r.str + 0.10 * hb, close: 0.62 * r.ins + 0.18 * r.str + 0.12 * r.iq + 0.08 * hb,
    mid: 0.85 * r.mid + 0.15 * r.iq, three: 0.92 * r.tpt + 0.08 * r.iq, ft: r.ft,
    create: 0.45 * r.bhd + 0.35 * r.spd + 0.20 * r.iq, pass: 0.75 * r.pas + 0.25 * r.iq, hand: 0.65 * r.bhd + 0.35 * r.iq,
    pdef: 0.6 * r.pdf + 0.25 * r.spd + 0.15 * r.iq, idef: 0.55 * r.idf + 0.2 * r.str + 0.15 * r.jmp + 0.10 * hb,
    blk: 0.7 * r.blk + 0.15 * r.jmp + 0.15 * hb, stl: 0.7 * r.stl + 0.3 * r.pdf,
    orb: 0.7 * r.orb + 0.15 * hb + 0.15 * r.jmp, drb: 0.7 * r.drb + 0.15 * hb + 0.15 * r.str,
  };
}

function newLine() { return { min: 0, pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, pm: 0 }; }

class GameSim {
  constructor(S, g, opts = {}) {
    this.S = S; this.g = g; this.opts = opts;
    this.allStar = !!opts.allStar;
    this.T = [this.mkTeam(g.h, 0, opts.rosters && opts.rosters[0]), this.mkTeam(g.a, 1, opts.rosters && opts.rosters[1])];
    this.q = 1; this.clock = 720; this.score = [0, 0]; this.qs = [[0], [0]];
    this.done = false; this.ev = []; this.log = []; this.fb = false; this.dead = true;
    this.run = { side: -1, pts: 0 }; this.elapsed = 0; this.shots = [];
    this.tip = U.chance(0.5) ? 0 : 1; this.pos = this.tip;
    this.injuries = [];
    this.zm = [{ rim: 0, close: 0, mid: 0, three: 0 }, { rim: 0, close: 0, mid: 0, three: 0 }];
    this.live = !!opts.live;
    this.userSide = opts.userSide != null ? opts.userSide : -1;
    this.homeAdv = this.allStar ? 0 : 0.022 + (this.S.teams[g.h] ? this.S.teams[g.h].arena.up.fan * 0.002 : 0);
    this.say(0, 'tip', `Tip-off. ${this.T[this.tip].abbr} win the jump ball.`);
  }
  mkTeam(tid, side, custom) {
    const S = this.S;
    const t = tid >= 0 ? S.teams[tid] : null;
    let ps;
    if (custom) ps = custom.pids.map(id => P(S, id));
    else {
      ensureRotation(S, tid);
      ps = t.rot.order.map(id => P(S, id)).filter(p => p && p.tid === tid && (!p.inj || p.inj.games <= 0));
      if (ps.length < 5) ps = ps.concat(roster(S, tid).filter(p => !ps.includes(p))).slice(0, 5);
    }
    const mins = custom ? custom.mins : t.rot.mins;
    let tot = U.sum(ps, p => mins[p.pid] || 0);
    const scale = tot > 0 ? 240 / tot : 1;
    const hc = t ? t.staff.hc : { r: { off: 60, def: 60, mot: 60 } };
    const gps = ps.map((p, i) => {
      const c = comps(p);
      const mor = this.allStar ? 0 : (p.morale - 60) * 0.25;
      for (const k in c) c[k] += mor * 0.2 + (k === 'pdef' || k === 'idef' ? (this.allStar ? -12 : 0) : 0);
      const tw = POS_TEND[p.pos];
      let tend = [Math.pow(c.rim / 55, 2) * tw[0], Math.pow(c.close / 55, 2) * tw[1], Math.pow(c.mid / 55, 2) * tw[2], Math.pow(Math.max(10, p.r.tpt) / 55, 3.2) * tw[3]];
      const ts = U.sum(tend); tend = tend.map(x => x / ts);
      const off = (tend[0] * c.rim + tend[1] * c.close + tend[2] * c.mid + tend[3] * c.three) * 0.72 + c.create * 0.28;
      let use = Math.pow(off / 55, SIMK.use) * (p.pers === 'diva' ? 1.08 : 1);
      return { p, pid: p.pid, c, tend, use, energy: 1, on: false, st: newLine(), fouls: 0, out: false, tgt: Math.min(44, (mins[p.pid] || 0) * scale), pi: POS_IDX[p.pos], starter: i < 5 };
    });
    gps.slice(0, 5).forEach(x => x.on = true);
    return {
      tid, side, t, abbr: t ? t.abbr : (custom && custom.abbr), name: t ? t.name : (custom && custom.name), ps: gps,
      strat: t ? Object.assign({}, t.strat) : { off: 'balanced', def: 'man', pace: 2 }, play: 'balanced', feed: null,
      tos: 7, qf: 0, auto: true, hc,
    };
  }
  on(side) { return this.T[side].ps.filter(x => x.on); }
  fat(g) { return 0.78 + 0.22 * g.energy; }
  say(side, type, text, extra) {
    const e = Object.assign({ type, side, text, q: this.q, clk: this.clock, sc: this.score.slice() }, extra || {});
    this.ev.push(e); this.log.push(e);
    return e;
  }
  clockStr() { const c = Math.max(0, this.clock); const m = Math.floor(c / 60), s = Math.floor(c % 60); return m + ':' + String(s).padStart(2, '0'); }

  // ---------- public controls ----------
  setPlay(side, play) { this.T[side].strat.off = play; }
  setDef(side, d) { this.T[side].strat.def = d; }
  setPace(side, p) { this.T[side].strat.pace = p; }
  timeout(side) {
    const T = this.T[side];
    if (T.tos <= 0 || this.done) return false;
    T.tos--;
    for (const s of [0, 1]) for (const g of this.on(s)) g.energy = Math.min(1, g.energy + 0.05);
    this.run = { side: -1, pts: 0 }; this.dead = true;
    this.say(side, 'timeout', `Timeout ${T.abbr}. (${T.tos} left)`);
    this.aiAdjust(side);
    return true;
  }
  sub(side, outPid, inPid) {
    const T = this.T[side];
    const o = T.ps.find(x => x.pid === outPid), i = T.ps.find(x => x.pid === inPid);
    if (!o || !i || !o.on || i.on || i.out) return false;
    o.on = false; i.on = true;
    this.say(side, 'sub', `${T.abbr} sub: ${pshort(i.p)} in for ${pshort(o.p)}`, { pin: inPid, pout: outPid });
    return true;
  }

  // ---------- engine ----------
  step() {
    this.ev = [];
    if (this.done) return this.ev;
    if (this.dead) { this.autoSubs(0); this.autoSubs(1); this.aiTimeouts(); }
    this.possession();
    if (this.clock <= 0.01) this.endPeriod();
    return this.ev;
  }
  simToEnd() { let n = 0; while (!this.done && n++ < 2000) this.step(); return this; }
  simToPeriodEnd() { const q = this.q; let n = 0; while (!this.done && this.q === q && n++ < 400) this.step(); }

  advance(dt) {
    dt = Math.min(dt, this.clock);
    if (dt <= 0) return;
    this.clock -= dt; this.elapsed += dt;
    for (const s of [0, 1]) {
      const T = this.T[s], O = this.T[1 - s];
      const mult = (T.strat.pace === 2 ? 1.1 : T.strat.pace === 0 ? 0.92 : 1) * (T.strat.def === 'press' ? 1.35 : 1) * (this.allStar ? 0.7 : 1);
      for (const g of T.ps) {
        if (g.on) {
          g.st.min += dt / 60;
          g.energy = Math.max(0.35, g.energy - dt * SIMK.drain * (1.55 - g.p.r.sta / 100) * mult);
          if (this.S.settings.injuries && !this.allStar && !g.out) {
            const med = T.t ? T.t.arena.up.med : 0;
            const tr = T.t ? T.t.staff.trainer.r.cond : 60;
            const pInj = (dt / 60) * 0.00050 * ((112 - g.p.r.dur) / 45) * (1 - med * 0.07) * (1.15 - tr / 200) * (1.3 - g.energy * 0.3);
            if (Math.random() < pInj) this.injure(s, g);
          }
        } else g.energy = Math.min(1, g.energy + dt * SIMK.rec);
      }
    }
  }
  injure(side, g) {
    const inj = U.wpick(INJURIES, x => x[4] != null ? x[4] : x[3]);
    let games = U.ri(inj[1], inj[2]);
    const T = this.T[side];
    if (T.t) games = Math.max(1, Math.round(games * (1.1 - T.t.staff.trainer.r.med / 250) * (1 - T.t.arena.up.med * 0.06)));
    g.out = true; g.injury = { type: inj[0], games };
    this.injuries.push({ pid: g.pid, type: inj[0], games });
    this.say(side, 'inj', `${pshort(g.p)} (${T.abbr}) is hurt — ${inj[0]}. He will not return.`, { pid: g.pid });
    if (g.on) this.forceSub(side, g);
  }
  forceSub(side, g) {
    const T = this.T[side];
    g.on = false;
    const bench = T.ps.filter(x => !x.on && !x.out);
    if (!bench.length) { g.on = !g.out; return; }
    const rep = U.maxBy(bench, x => -Math.abs(x.pi - g.pi) * 0.6 + x.energy + x.tgt / 30 + x.p.ovr / 60);
    rep.on = true;
    this.say(side, 'sub', `${T.abbr} sub: ${pshort(rep.p)} in for ${pshort(g.p)}`, { pin: rep.pid, pout: g.pid });
  }
  regMinLeft() { return this.q <= 4 ? (4 - this.q) * 12 + this.clock / 60 : this.clock / 60; }
  autoSubs(side) {
    const T = this.T[side];
    if (!T.auto) return;
    const remain = Math.max(1.5, this.regMinLeft());
    const diff = this.score[side] - this.score[1 - side];
    const late = this.q >= 4 && this.clock < 300 && Math.abs(diff) <= 10;
    const garbage = this.q >= 4 && this.clock < 420 && Math.abs(diff) >= 18;
    const flim = [0, 2, 3, 4, 5, 5][Math.min(5, this.q)];
    const score = g => {
      if (g.out) return -99;
      let need = U.clamp((g.tgt - g.st.min) / remain, -1.5, 1.5);
      let s = need + 3.0 * (g.energy - 0.88);
      if (g.fouls >= flim && !(late && g.fouls < 6)) s -= 0.7;
      if (late) s += g.tgt / 40;
      if (garbage) s += g.tgt >= 26 ? -1.2 : g.tgt <= 10 ? 0.5 : 0;
      if (this.q > 4) s += g.tgt / 30;
      return s;
    };
    const court = this.on(side).sort((a, b) => score(a) - score(b));
    let swaps = 0;
    for (const c of court) {
      if (swaps >= 3) break;
      const cs = score(c);
      const bench = T.ps.filter(x => !x.on && !x.out);
      let best = null, bv = -99;
      for (const b of bench) {
        const pd = Math.abs(b.pi - c.pi);
        if (pd > 2) continue;
        const v = score(b) - pd * 0.12;
        if (v > bv) { bv = v; best = b; }
      }
      if (best && bv > cs + 0.18) {
        c.on = false; best.on = true; swaps++;
        this.say(side, 'sub', `${T.abbr} sub: ${pshort(best.p)} in for ${pshort(c.p)}`, { pin: best.pid, pout: c.pid, quiet: true });
      }
    }
    // keep someone who can handle the ball, and a big
    const on = this.on(side);
    const fix = (test, want) => {
      if (on.some(test)) return;
      const b = T.ps.filter(x => !x.on && !x.out && test(x)).sort((a, b) => b.energy - a.energy)[0];
      const c = on.filter(x => !test(x)).sort((a, b) => score(a) - score(b))[0];
      if (b && c) { c.on = false; b.on = true; this.say(side, 'sub', `${T.abbr} sub: ${pshort(b.p)} in for ${pshort(c.p)}`, { pin: b.pid, pout: c.pid, quiet: true }); }
    };
    fix(g => g.pi <= 1, 'guard'); fix(g => g.pi >= 3, 'big');
  }
  // live games: the AI coach reacts to how the game is going
  aiAdjust(s) {
    if (!this.live || s === this.userSide || this.allStar) return;
    const T = this.T[s], O = this.T[1 - s];
    const diff = this.score[s] - this.score[1 - s];
    const z = this.zm[1 - s], tot = z.rim + z.close + z.mid + z.three || 1;
    let def = T.t ? T.t.strat.def : 'man', off = 'balanced';
    if (z.three / tot > 0.42) def = 'deny';
    else if ((z.rim + z.close) / tot > 0.6) def = Math.random() < 0.5 ? 'paint' : 'zone';
    if (diff <= -12 && this.q >= 3) { def = 'press'; off = 'three'; }
    else if (diff <= -6) off = U.pick(['pnr', 'push', 'three']);
    else if (diff >= 10 && this.q >= 4) off = 'motion';
    else { const star = U.maxBy(this.on(s), g => g.st.pts); off = star && star.st.pts >= 6 + this.q * 5 ? 'iso' : U.pick(['balanced', 'balanced', 'pnr', 'motion', 'post']); }
    const msgs = [];
    if (def !== T.strat.def) { T.strat.def = def; msgs.push(DEF_SCHEMES[def].n); }
    if (off !== T.strat.off) { T.strat.off = off; msgs.push(OFF_PLAYS[off].n); }
    if (msgs.length) this.say(s, 'adjust', `${T.abbr} adjust: ${msgs.join(', ')}.`);
  }
  aiTimeouts() {
    for (const s of [0, 1]) {
      if (s === this.userSide) continue;
      if (this.run.side === 1 - s && this.run.pts >= 8 && this.T[s].tos > 1 && Math.random() < 0.7) this.timeout(s);
      else if (this.q >= 4 && this.clock < 40 && this.T[s].tos > 0 && Math.abs(this.score[0] - this.score[1]) <= 3 && Math.random() < 0.25 && this.pos === s) this.timeout(s);
    }
  }
  matchup(side, g) {
    const o = this.on(side).sort((a, b) => a.pi - b.pi), d = this.on(1 - side).sort((a, b) => a.pi - b.pi);
    return d[Math.max(0, o.indexOf(g))] || d[0];
  }
  pickShooter(O) {
    const on = this.on(O.side);
    const play = O.strat.off;
    const maxUse = Math.max(...on.map(g => g.use));
    return U.wpick(on, g => {
      let w = g.use * Math.pow(this.fat(g), 2);
      if (play === 'iso' && g.use === maxUse) w *= 1.7;
      if (play === 'pnr') w *= g.pi <= 1 ? 1.45 : g.pi >= 3 ? 1.25 : 0.8;
      if (play === 'post') w *= g.pi >= 3 ? 1.9 : g.pi === 2 ? 1 : 0.65;
      if (play === 'three') w *= Math.pow(g.p.r.tpt / 60, 2.2);
      if (play === 'motion') w = Math.pow(w, 0.6);
      if (O.feed === g.pid) w *= 2.0;
      if (g.st.fga > 18) w *= Math.max(0.45, 1 - (g.st.fga - 18) * 0.035);
      return w;
    });
  }
  pickType(g, O, D, trail3) {
    const play = O.strat.off, def = D.strat.def;
    const w = g.tend.slice();
    const m = [1, 1, 1, 1];
    if (play === 'pnr') { if (g.pi >= 3) m[0] *= 1.35; else m[2] *= 1.2; }
    if (play === 'iso') { m[2] *= 1.25; m[1] *= 1.1; }
    if (play === 'post') { m[1] *= 1.7; m[0] *= 1.15; m[3] *= 0.55; }
    if (play === 'three') { m[3] *= 1.65; m[2] *= 0.8; }
    if (play === 'push') { m[0] *= 1.3; m[3] *= 1.05; }
    if (play === 'motion') { m[3] *= 1.12; m[1] *= 1.05; }
    if (def === 'zone') { m[3] *= 1.28; m[0] *= 0.85; m[1] *= 0.9; }
    if (def === 'paint') { m[0] *= 0.8; m[1] *= 0.85; m[3] *= 1.22; }
    if (def === 'deny') { m[3] *= 0.72; m[0] *= 1.18; }
    if (def === 'press') { m[0] *= 1.1; }
    if (trail3) m[3] *= 5;
    if (this.fb) { m[0] *= 4; m[1] *= 0.5; m[2] *= 0.6; }
    const ws = w.map((x, i) => x * m[i]);
    return U.wpick([0, 1, 2, 3], i => ws[i]);
  }
  defValue(D, shooter, defender, zone) {
    const on = this.on(D.side);
    const f = g => this.fat(g);
    const bigs = shooter.pi >= 3;
    if (zone === 'rim') return 0.45 * (bigs ? defender.c.idef : defender.c.pdef) * f(defender) + 0.55 * Math.max(...on.map(g => g.c.idef * f(g)));
    if (zone === 'close') return 0.6 * defender.c.idef * f(defender) + 0.4 * Math.max(...on.map(g => g.c.idef * f(g)));
    if (zone === 'mid') return 0.8 * defender.c.pdef * f(defender) + 0.2 * U.avg(on, g => g.c.pdef * f(g));
    return 0.85 * defender.c.pdef * f(defender) + 0.15 * U.avg(on, g => g.c.pdef * f(g));
  }
  coachMod(O, D) { return ((O.hc.r.off - 55) - (D.hc.r.def - 55)) * 0.00035; }
  boost(side) {
    if (this.allStar) return 0;
    const df = DIFFS[this.S.diff] || DIFFS[1];
    const u = this.S.user;
    if (this.T[side].tid === u) return df.boost;
    if (this.T[1 - side].tid === u) return -df.boost * 0.5;
    return 0;
  }

  possession() {
    const o = this.pos, d = 1 - o, O = this.T[o], D = this.T[d];
    const diff = this.score[o] - this.score[d];
    const lateQ = this.q >= 4;
    // intentional fouling when trailing late
    if (lateQ && this.clock <= 50 && this.clock > 2 && diff > 0 && diff <= 8 && !this.allStar && Math.random() < 0.85) {
      this.advance(U.rf(1.5, 5));
      const fouler = U.wpick(this.on(d), g => (6 - g.fouls) * (100 - g.p.ovr + 10));
      const ft = U.wpick(this.on(o), g => Math.pow(g.c.ft, 4));
      this.addFoul(d, fouler, `${pshort(fouler.p)} fouls ${pshort(ft.p)} intentionally to stop the clock`);
      this.dead = true;
      this.freeThrows(o, ft, 2);
      return;
    }
    // possession length
    let pace = SIMK.pace[O.strat.pace];
    if (O.strat.off === 'push') pace -= 2.2; if (O.strat.off === 'motion') pace += 1.3;
    if (D.strat.def === 'press') pace -= 1.4; if (D.strat.def === 'zone') pace += 0.6;
    if (this.allStar) pace -= 2.5;
    let dur = this.fb ? U.rf(3.5, 7) : U.clamp(U.gauss(pace, 4.2), 4, 23.5);
    let trail3 = false;
    if (lateQ && this.clock <= 60 && diff > 0) dur = Math.max(dur, U.rf(16, 23));
    if (lateQ && this.clock <= 35 && diff < 0) { dur = Math.min(dur, U.rf(3, 8)); if (diff <= -3) trail3 = true; }
    if (this.q < 4 && this.clock <= 26 && this.clock > dur) { if (Math.random() < 0.7) dur = this.clock - U.rf(0.3, 2.5); }
    let heave = false;
    if (dur >= this.clock) { if (this.clock < 2.5 && Math.random() < 0.85) heave = true; dur = this.clock; }
    this.advance(dur);
    // turnover
    const onO = this.on(o), onD = this.on(d);
    const offHand = U.avg(onO, g => g.c.hand * this.fat(g));
    const defStl = U.avg(onD, g => g.c.stl * this.fat(g));
    let pTO = SIMK.to * Math.pow(55 / offHand, 0.9) * Math.pow(defStl / 52, 0.9);
    if (D.strat.def === 'press') pTO += 0.03; if (O.strat.off === 'push') pTO += 0.015; if (O.strat.off === 'iso') pTO += 0.004;
    if (this.fb) pTO *= 0.7; if (this.allStar) pTO *= 0.85; if (heave) pTO = 0;
    this.fb = false;
    if (Math.random() < pTO) { this.turnover(o, d, defStl, dur); return; }
    // non-shooting foul
    let pN = SIMK.nsf + (D.strat.def === 'press' ? 0.02 : 0) + (O.strat.off === 'post' ? 0.012 : 0);
    if (!heave && Math.random() < pN) {
      const fouler = U.wpick(onD, g => 1.3 - g.c.pdef / 120 + (g.pi >= 3 ? 0.2 : 0));
      const vic = U.wpick(onO, g => g.use);
      D.qf++;
      this.addFoul(d, fouler, `Foul on ${pshort(fouler.p)}${D.qf >= 5 ? ' — in the penalty' : ''}`);
      if (D.qf >= 5) { this.dead = true; this.freeThrows(o, vic, 2); return; }
    }
    // shot(s), with offensive rebounds
    let shooter = this.pickShooter(O), putback = false;
    for (let att = 0; att < 6; att++) {
      const zi = putback ? (Math.random() < 0.65 ? 0 : 1) : heave ? 3 : this.pickType(shooter, O, D, trail3);
      const res = this.shoot(O, D, shooter, ZONES[zi], heave, putback);
      if (res !== 'oreb') return;
      // offensive rebound
      if (this.clock <= 0.05) return;
      const rb = this.lastReb;
      putback = Math.random() < 0.38 && rb.pi >= 2;
      shooter = putback ? rb : this.pickShooter(O);
      const t2 = putback ? U.rf(1, 3) : U.rf(4, 11);
      if (t2 >= this.clock) { this.advance(this.clock); heave = false; putback = true; shooter = rb; } else this.advance(t2);
    }
  }
  turnover(o, d, defStl, dur) {
    const O = this.T[o], D = this.T[d];
    const onO = this.on(o), onD = this.on(d);
    const g = U.wpick(onO, x => x.use * Math.pow(70 / Math.max(25, x.c.hand), 1.5));
    g.st.tov++;
    let stealP = 0.52 * Math.pow(defStl / 52, 0.7) + (D.strat.def === 'press' ? 0.08 : 0);
    if (Math.random() < stealP) {
      const s = U.wpick(onD, x => Math.pow(x.c.stl, 3));
      s.st.stl++;
      this.say(o, 'tov', `${pshort(s.p)} picks off ${pshort(g.p)}!`, { pid: g.pid, by: s.pid, steal: true });
      this.fb = Math.random() < (0.5 + (D.strat.pace === 2 ? 0.1 : 0));
      this.dead = false;
    } else {
      const r = Math.random();
      if (r < 0.14) { g.fouls++; g.st.pf++; this.say(o, 'tov', `Offensive foul on ${pshort(g.p)}.`, { pid: g.pid }); this.checkFoulOut(o, g); }
      else if (dur > 21.5) this.say(o, 'tov', `Shot clock violation on ${O.abbr}.`, { pid: g.pid });
      else this.say(o, 'tov', U.pick([`${pshort(g.p)} throws it away.`, `${pshort(g.p)} loses the handle out of bounds.`, `Traveling on ${pshort(g.p)}.`, `${pshort(g.p)} steps out of bounds.`, `Bad pass by ${pshort(g.p)}.`]), { pid: g.pid });
      this.dead = true;
    }
    this.pos = d;
  }
  addFoul(side, g, text) {
    g.fouls++; g.st.pf++;
    this.say(side, 'foul', text + ` (${g.fouls} PF)`, { pid: g.pid });
    this.checkFoulOut(side, g);
  }
  checkFoulOut(side, g) {
    if (g.fouls >= 6 && !this.allStar) { g.out = true; this.say(side, 'foulout', `${pshort(g.p)} has fouled out.`, { pid: g.pid }); if (g.on) this.forceSub(side, g); }
  }
  shotSpot(zone, heave) {
    let dist, ang = U.rf(-1.35, 1.35);
    if (heave) dist = U.rf(30, 60);
    else if (zone === 'three') {
      if (Math.abs(ang) > 1.15 && Math.random() < 0.6) { const x = (ang > 0 ? 1 : -1) * U.rf(22, 23); return { x, y: U.rf(1, 9), dist: 22 + U.rf(0, 1) }; }
      dist = U.rf(23.8, 23.8 + (Math.random() < 0.15 ? 5 : 2.5));
    } else { const [a, b] = SHOTS[zone].d; dist = U.rf(a, b); }
    let x = Math.sin(ang) * dist, y = 5.25 + Math.cos(ang) * dist;
    if (y < 1) y = 1;
    return { x, y, dist };
  }
  shoot(O, D, g, zone, heave, putback) {
    const o = O.side, d = D.side;
    const sh = SHOTS[zone];
    const defender = this.matchup(o, g);
    const spot = this.shotSpot(zone, heave);
    const skill = g.c[zone] * this.fat(g);
    const dv = this.defValue(D, g, defender, zone);
    let p = sh.base + sh.k * (skill - 58) - sh.kd * (dv - 55);
    p += (o === 0 ? this.homeAdv : -this.homeAdv * 0.3) + this.coachMod(O, D) + this.boost(o);
    if (O.strat.off === 'motion') p += 0.008;
    if (g.st.fga > 16) p -= (g.st.fga - 16) * 0.005;
    g.energy = Math.max(0.35, g.energy - 0.0015); if (this.fb && zone === 'rim') p += 0.06; if (putback) p += 0.04;
    const ds = D.strat.def;
    if (ds === 'zone') { if (zone === 'rim' || zone === 'close') p -= 0.025; if (zone === 'three') p += 0.012; }
    if (ds === 'paint') { if (zone === 'rim' || zone === 'close') p -= 0.035; if (zone === 'three' || zone === 'mid') p += 0.015; }
    if (ds === 'deny') { if (zone === 'three') p -= 0.03; if (zone === 'rim') p += 0.02; }
    if (ds === 'press' && zone === 'rim') p += 0.02;
    if (zone === 'three') p -= Math.max(0, spot.dist - 24.5) * 0.012;
    if (heave) p = spot.dist > 40 ? 0.02 : 0.07;
    if (this.allStar) p += zone === 'rim' ? 0.06 : 0.02;
    p = U.clamp(p, 0.02, 0.88);
    // block
    const onD = this.on(d);
    const blocker = U.wpick(onD, x => Math.pow(x.c.blk, 3) * (x === defender ? 2 : 1));
    const pB = heave ? 0.01 : sh.blk * Math.pow(blocker.c.blk * this.fat(blocker) / 60, 2.2) * (this.allStar ? 0.5 : 1);
    // shooting foul
    let pF = heave ? 0.005 : sh.foul * Math.pow(g.c.create / 60, 0.4) * (O.strat.off === 'post' ? 1.2 : 1) * (this.allStar ? 0.4 : 1);
    const fouled = Math.random() < pF;
    const pts = zone === 'three' ? 3 : 2;
    const info = { pid: g.pid, zone, x: spot.x, y: spot.y, dist: Math.round(spot.dist), pts };
    if (!fouled && Math.random() < pB) {
      g.st.fga++; if (pts === 3) g.st.tpa++; blocker.st.blk++;
      this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 0, z: zone });
      this.say(o, 'shot', `${pshort(g.p)} ${zone === 'three' ? 'three' : 'shot'} — REJECTED by ${pshort(blocker.p)}!`, Object.assign(info, { made: false, blk: blocker.pid }));
      return this.rebound(O, D, zone, true);
    }
    const made = Math.random() < (fouled ? p * 0.42 : p);
    if (fouled) {
      const fd = Math.random() < 0.75 ? defender : U.pick(onD);
      fd.fouls++; fd.st.pf++; D.qf++;
      if (made) {
        this.made(O, D, g, zone, pts, info, spot, true);
        this.say(d, 'foul', `And one! Foul on ${pshort(fd.p)} (${fd.fouls} PF)`, { pid: fd.pid });
        this.checkFoulOut(d, fd);
        this.freeThrows(o, g, 1);
      } else {
        this.say(d, 'foul', `${pshort(g.p)} fouled on the ${zone === 'three' ? 'three' : 'shot'} by ${pshort(fd.p)} (${fd.fouls} PF)`, { pid: fd.pid });
        this.checkFoulOut(d, fd);
        this.freeThrows(o, g, pts);
      }
      return 'done';
    }
    if (made) { this.made(O, D, g, zone, pts, info, spot, false); return 'done'; }
    g.st.fga++; if (pts === 3) g.st.tpa++;
    this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 0, z: zone });
    this.say(o, 'shot', shotText(g, zone, false, Math.round(spot.dist), null, heave), Object.assign(info, { made: false }));
    return this.rebound(O, D, zone, false);
  }
  made(O, D, g, zone, pts, info, spot, andOne) {
    const o = O.side;
    g.st.fga++; g.st.fgm++; g.st.pts += pts; if (pts === 3) { g.st.tpa++; g.st.tpm++; }
    const others = this.on(o).filter(x => x !== g);
    const passAvg = U.avg(others, x => x.c.pass);
    let pA = SHOTS[zone].ast * Math.pow(passAvg / 55, 0.6);
    if (O.strat.off === 'motion') pA *= 1.15; if (O.strat.off === 'iso') pA *= 0.62; if (O.strat.off === 'pnr') pA *= 1.08;
    if (this.allStar) pA *= 1.15;
    let ast = null;
    if (Math.random() < pA) { ast = U.wpick(others, x => Math.pow(x.c.pass, 3.6) * (x.pi === 0 ? 1.35 : 1)); ast.st.ast++; }
    const before = this.score[o] - this.score[1 - o];
    this.zm[o][zone] += pts;
    this.addPts(o, pts);
    if (this.q >= 4 && this.clock <= 1.5 && before <= 0 && before + pts > 0) this.walkoff = g.pid;
    this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 1, z: zone });
    this.say(o, 'shot', shotText(g, zone, true, Math.round(spot.dist), ast, false, this.fb) + (ast ? ` (${pshort(ast.p)} assists)` : ''), Object.assign(info, { made: true, ast: ast ? ast.pid : null }));
    this.dead = true;
    if (!andOne) this.pos = D.side;
  }
  addPts(side, pts) {
    if (this.walkoff && !this.T[side].ps.some(x => x.pid === this.walkoff)) this.walkoff = null;
    this.score[side] += pts;
    const qi = this.q - 1;
    this.qs[side][qi] = (this.qs[side][qi] || 0) + pts;
    for (const g of this.on(side)) g.st.pm += pts;
    for (const g of this.on(1 - side)) g.st.pm -= pts;
    if (this.run.side === side) this.run.pts += pts; else this.run = { side, pts };
  }
  rebound(O, D, zone, blocked) {
    const onO = this.on(O.side), onD = this.on(D.side);
    const oR = U.avg(onO, g => g.c.orb * this.fat(g)), dR = U.avg(onD, g => g.c.drb * this.fat(g));
    let pOR = SIMK.orb * Math.pow((oR / dR) / 0.86, 1.6);
    if (zone === 'three') pOR += 0.02; if (zone === 'rim') pOR += 0.015;
    if (D.strat.def === 'zone') pOR += 0.025; if (O.strat.off === 'push') pOR -= 0.02; if (O.strat.off === 'three') pOR -= 0.015;
    if (blocked) pOR += 0.04;
    pOR = U.clamp(pOR, 0.08, 0.5);
    if (Math.random() < pOR) {
      const rb = U.wpick(onO, g => Math.pow(g.c.orb, 2.0) * (g.pi >= 3 ? 1.15 : 1));
      rb.st.orb++; this.lastReb = rb;
      this.say(O.side, 'reb', `Offensive board, ${pshort(rb.p)}.`, { pid: rb.pid, off: true });
      return 'oreb';
    }
    const rb = U.wpick(onD, g => Math.pow(g.c.drb, 2.0) * (g.pi >= 3 ? 1.12 : 1));
    rb.st.drb++;
    this.say(D.side, 'reb', `${pshort(rb.p)} rebounds.`, { pid: rb.pid, off: false });
    this.fb = Math.random() < (0.1 + (D.strat.pace === 2 ? 0.07 : 0) + (D.strat.off === 'push' ? 0.1 : 0));
    this.dead = false;
    this.pos = D.side;
    return 'done';
  }
  freeThrows(side, g, n) {
    const T = this.T[side];
    let made = 0;
    for (let i = 0; i < n; i++) {
      let p = 0.27 + 0.0066 * g.c.ft * (0.9 + 0.1 * g.energy);
      if (this.allStar) p += 0.03;
      p = U.clamp(p, 0.3, 0.95);
      g.st.fta++;
      if (Math.random() < p) { g.st.ftm++; g.st.pts++; made++; this.addPts(side, 1); }
    }
    this.say(side, 'ft', `${pshort(g.p)} ${made}/${n} at the line.`, { pid: g.pid, made, n });
    if (made === n || n === 0) { this.pos = 1 - side; this.dead = true; return; }
    // missed last free throw: live rebound
    const O = this.T[side], D = this.T[1 - side];
    if (Math.random() < 0.14) {
      const rb = U.wpick(this.on(side), x => Math.pow(x.c.orb, 3)); rb.st.orb++;
      this.say(side, 'reb', `Offensive board, ${pshort(rb.p)}.`, { pid: rb.pid, off: true });
      this.pos = side; this.dead = false;
    } else {
      const rb = U.wpick(this.on(1 - side), x => Math.pow(x.c.drb, 3)); rb.st.drb++;
      this.say(1 - side, 'reb', `${pshort(rb.p)} rebounds.`, { pid: rb.pid, off: false });
      this.pos = 1 - side; this.dead = false;
    }
  }
  endPeriod() {
    const q = this.q;
    if (q >= 4 && this.score[0] !== this.score[1]) {
      this.done = true;
      if (this.walkoff && this.T[this.score[0] > this.score[1] ? 0 : 1].ps.every(x => x.pid !== this.walkoff)) this.walkoff = null;
      if (this.walkoff && this.clock > 0.01) this.walkoff = null;
      this.say(this.score[0] > this.score[1] ? 0 : 1, 'final', `Final${q > 4 ? (q === 5 ? '/OT' : '/' + (q - 4) + 'OT') : ''}: ${this.T[0].abbr} ${this.score[0]}, ${this.T[1].abbr} ${this.score[1]}`);
      return;
    }
    this.say(-1, 'period', q <= 4 ? `End of ${U.ord(q)} quarter: ${this.T[0].abbr} ${this.score[0]}, ${this.T[1].abbr} ${this.score[1]}` : `End of overtime: ${this.score[0]}-${this.score[1]}`);
    this.q++;
    this.clock = this.q <= 4 ? 720 : 300;
    for (const s of [0, 1]) {
      this.T[s].qf = 0; this.qs[s][this.q - 1] = 0;
      if (this.q === 3) this.T[s].tos = Math.max(this.T[s].tos, 4);
      if (this.q === 5) this.T[s].tos = Math.max(this.T[s].tos, 2);
      for (const g of this.T[s].ps) g.energy = Math.min(1, g.energy + (this.q === 3 ? 0.22 : 0.07));
    }
    this.pos = this.q === 2 || this.q === 3 ? 1 - this.tip : this.q === 4 ? this.tip : (U.chance(0.5) ? 0 : 1);
    this.aiAdjust(0); this.aiAdjust(1);
    this.dead = true; this.fb = false;
    this.say(-1, 'period', this.q <= 4 ? `Start of the ${U.ord(this.q)} quarter.` : 'Overtime!');
  }
  box() {
    return {
      gid: this.g.gid, q: this.q, ot: Math.max(0, this.q - 4), score: this.score.slice(), qs: this.qs.map(a => a.slice()),
      teams: this.T.map(T => ({
        tid: T.tid, abbr: T.abbr,
        ps: T.ps.filter(g => g.st.min > 0 || g.starter).map(g => Object.assign({ pid: g.pid, n: pshort(g.p), pos: g.p.pos, gs: g.starter ? 1 : 0 }, roundLine(g.st))),
      })),
      shots: this.shots,
    };
  }
}
function roundLine(st) { const o = Object.assign({}, st); o.min = Math.round(st.min * 10) / 10; return o; }

function shotText(g, zone, made, dist, ast, heave, fb) {
  const n = pshort(g.p);
  const dunker = g.p.r.jmp >= 70 || (g.pi >= 3 && g.p.r.str >= 70);
  if (heave) return made ? `${n} launches from ${dist} feet... BANG! At the buzzer!` : `${n} heaves from ${dist} feet — no good.`;
  if (zone === 'rim') {
    if (made) {
      if (fb) return U.pick([`${n} leaks out and finishes the break`, `${n} all alone — easy two in transition`, dunker ? `${n} throws it down on the break!` : `${n} lays it in on the break`]);
      if (dunker && Math.random() < 0.45) return ast && Math.random() < 0.4 ? `${n} finishes the alley-oop!` : U.pick([`${n} rises and SLAMS it home`, `${n} with a thunderous dunk`, `${n} throws down a two-hand jam`, `${n} hammers it in traffic`]);
      return U.pick([`${n} drives and lays it in`, `${n} finishes at the rim`, `${n} scoops in a reverse layup`, `${n} goes glass on the drive`, `${n} converts the layup`, `${n} finishes through contact`]);
    }
    return U.pick([`${n} misses the layup`, `${n} can't finish at the rim`, `${n} rolls the layup off the iron`, dunker ? `${n} hammers the dunk off the back iron` : `${n} misses in traffic`]);
  }
  if (zone === 'close') {
    if (made) return U.pick([`${n} drops in a hook shot`, `${n} banks in a floater`, `${n} turnaround in the post — good`, `${n} drop step and scores`, `${n} runner in the lane`, `${n} spins baseline and hits`]);
    return U.pick([`${n} misses the hook`, `${n} floater rims out`, `${n} turnaround is short`, `${n} misses from ${dist} feet`]);
  }
  if (zone === 'mid') {
    if (made) return U.pick([`${n} pull-up jumper from ${dist} — good`, `${n} hits the ${dist}-foot fadeaway`, `${n} knocks down the elbow jumper`, `${n} buries the baseline J from ${dist}`, `${n} step-back from ${dist} — got it`]);
    return U.pick([`${n} misses a ${dist}-footer`, `${n} pull-up rattles out`, `${n} fadeaway is off`, `${n} long two — no good`]);
  }
  if (made) return U.pick([`${n} drains a ${dist}-footer from deep`, `${n} — THREE! Got it!`, `${n} buries the triple`, `${n} splashes the three from ${dist}`, dist <= 22 ? `${n} corner three is good` : `${n} step-back three — money`]);
  return U.pick([`${n} misses from downtown`, `${n} three-point try is off`, `${n} long three rims out`, `${n} airballs from ${dist}`.replace('airballs', Math.random() < 0.1 ? 'airballs' : 'bricks')]);
}
