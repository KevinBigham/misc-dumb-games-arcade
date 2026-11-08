// Loads src/rules.js into a sandbox and provides bot drivers.
const fs = require('fs'), vm = require('vm'), path = require('path');
function loadLW() {
  const ctx = { console, Math, JSON, Object, Array, Number, String, Error, isFinite };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/rules.js'), 'utf8'), ctx);
  return ctx.LW;
}
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function mkr(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* Rhythm bot: taps at the ready time + gaussian noise; sensible breathing, walls, pacing. */
function rhythmBot(o = {}) {
  const sd = o.sd ?? 0.025, r = mkr(o.seed ?? 7), breatheEvery = o.breatheEvery ?? 3, pushAt = o.pushAt ?? 0.7, uwTo = o.uwTo ?? 9, flipErr = o.flipErr ?? 0.15, rtMean = o.rt ?? 0.66;
  let target = null, pendingUp = [], strokes = 0, lastPhase = null, lastLap = -1, flipAt = null;
  return function tick(LW, race) {
    const p = race.p, out = [], t = race.t;
    pendingUp = pendingUp.filter(u => { if (t >= u.t) { out.push({ t, type: 'up', side: u.side }); return false; } return true; });
    if (p.phase !== lastPhase || p.lap !== lastLap) { target = null; lastPhase = p.phase; lastLap = p.lap; flipAt = null; }
    const press = (side, hold) => { out.push({ t, type: 'down', side }); pendingUp.push({ t: t + (hold ? 0.22 : 0.06), side }); };
    const x = LW.xOf(race), dist = race.ev.dist;
    if (o.push !== false) { const want = x >= dist * pushAt; if (want !== p.push && (p.phase === 'swim' || p.phase === 'uw')) LW.setPush(race, want); }
    if (p.phase === 'set') { if (target == null) target = race.beepT + rtMean + gauss(r) * 0.04; if (t >= target) { press('L'); target = null; } }
    else if (p.phase === 'uw') {
      if (target == null) target = p.uw.readyT + gauss(r) * sd;
      const S = LW.strokeDef(race);
      const wantUp = p.lx >= uwTo || p.uw.kicks >= S.uwMax;
      if (t >= target) { press('L', wantUp); target = null; }
    } else if (p.phase === 'swim') {
      const S = LW.strokeDef(race), d = LW.wallDist(race), fin = LW.isFinalLap(race), tk = fin ? 'fin' : LW.turnKindFor(race);
      if (tk === 'flip' && d <= LW.CONFIG.TURN_ZONE) {
        if (flipAt == null) flipAt = LW.CONFIG.FLIP_IDEAL + gauss(r) * flipErr;
        if (d <= flipAt) { press('B'); return out; }
      }
      if ((tk === 'open' || tk === 'fin') && d <= LW.CONFIG.REACH * 0.85 && t >= p.readyT - 0.1) { press(S.pattern === 'alt' ? p.nextArm : 'B'); return out; }
      if (target == null) target = p.readyT + gauss(r) * sd;
      if (t >= target) {
        strokes++;
        const hold = o.breathe !== false && S.breath && (strokes % breatheEvery === 0 || p.o2 < 30) && !(fin && d < 6 && p.o2 > 25);
        press(S.pattern === 'alt' ? p.nextArm : 'B', hold); target = null;
      }
    }
    return out;
  };
}
/* Masher: taps alternating pads as fast as a thumb can, ignoring the ring. */
function masherBot(o = {}) {
  const r = mkr(o.seed ?? 3), gap = o.gap ?? 0.11; let next = 0, side = 'L', ups = [];
  return function tick(LW, race) {
    const t = race.t, out = [];
    ups = ups.filter(u => { if (t >= u.t) { out.push({ t, type: 'up', side: u.side }); return false; } return true; });
    if (race.p.phase === 'stand' || race.p.phase === 'marks') return out; // even a masher waits for the beep
    if (t >= next) { out.push({ t, type: 'down', side }); ups.push({ t: t + 0.05, side }); side = side === 'L' ? 'R' : 'L'; next = t + gap * (0.8 + r() * 0.4); }
    return out;
  };
}
function idleBot() { return () => []; }

function runRace(LW, opts, bot, maxT = 600) {
  const race = LW.createRace(opts);
  const DT = LW.CONFIG.DT;
  let n = 0;
  while (!race.over && race.t < maxT) {
    for (const e of bot(LW, race)) LW.raceInput(race, e);
    LW.stepRace(race, DT);
    race.ev_.length = 0;
    if (++n > 1e6) throw new Error('runaway');
  }
  return race;
}
module.exports = { loadLW, rhythmBot, masherBot, idleBot, runRace, mkr, gauss };
