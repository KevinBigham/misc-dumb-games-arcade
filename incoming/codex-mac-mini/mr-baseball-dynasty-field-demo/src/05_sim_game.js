/* ════════════════ SECTION §F2 — GAME STATE, PITCHING, BATTING, RULES ════════════════ */
// Deterministic core: tick(state, inputFrames) mutates state, appends ordered
// events. No wall clock, no Math.random — all variance through state.rng.

function newGame(opts) {
  opts = opts || {};
  const teams = buildTeams();
  // control routing: per-team 'cpu' | 'human0' | 'human1' (P1 = HOME, per original 1P flow)
  const control = opts.control || (opts.demo ? ['cpu', 'cpu'] :
    (opts.humanTeam === 0 ? ['human0', 'cpu'] : ['cpu', 'human0']));
  const st = {
    frame: 0,
    rng: new RNG(opts.seed || [0x4B, 0x45, 0x56, 0x49, 0x4E]),   // "KEVIN" :)
    scene: opts.scene || 'TITLE', sceneT: 0,
    teams, control, menuSel: 0,
    pitchCount: [0, 0], lastMPH: 0, mphT: 0, tired: false,
    demo: !!opts.demo,                       // CPU vs CPU attract mode
    innings: opts.innings || CONST.INNINGS,  // [v0.6 P1-3] game length; title menu picks 3/6/9, demo keeps 3
    inning: 1, half: 0, outs: 0, balls: 0, strikes: 0,
    score: [0, 0], hits: [0, 0], errs: [0, 0],
    lineScore: [[], []],
    batterPtr: [0, 0],
    phase: 'PREPITCH', phaseT: 0,
    ball: newBall(),
    pitchSel: 4, pitchInfo: null,
    batter: null, swing: { state: 'idle', t: 0 }, swungThisPitch: false,
    fielders: [], chaser: -1, pred: null, predT: 0,
    runners: [], bases: [null, null, null, null],
    playOuts: 0, playErr: false, batterResult: null, runsThisPlay: 0,
    pendingHalfEnd: false, walkoff: false, gameOver: false,
    stealPlay: false, stealResolve: null, chaserLockF: 0,
    phantomDeadline: 0, playTimer: 0, heldTimer: 0,
    banner: null, cardType: null,
    fx: [],                                  // cosmetic dust/flash markers [v0.3, no RNG, render-only reads]
    camera: { mode: 'plate', xS: toSub(GEO.plate.x), yS: toSub(GEO.plate.y - 900), lastThrowT: -9 },
    cpu: { plan: null, batPlan: null, throwCd: 0 },
    events: [], log: [],
    stats: { pitches: 0, swings: 0, contacts: 0 },
  };
  return st;
}
function ev(st, type, data) {
  const e = { f: st.frame, type, data: data || null };
  st.events.push(e); st.log.push(st.frame + ':' + type);
  return e;
}
function battingTeam(st) { return st.half === 0 ? 0 : 1; }
function fieldingTeam(st) { return 1 - battingTeam(st); }
function padIndexFor(st, team) { const c = st.control[team]; return c === 'human0' ? 0 : c === 'human1' ? 1 : -1; }
function batPad(st) { return padIndexFor(st, battingTeam(st)); }
function fieldPad(st) { return padIndexFor(st, fieldingTeam(st)); }
function humanBatting(st) { return batPad(st) >= 0; }
function humanFielding(st) { return fieldPad(st) >= 0; }
function lineup(st, t) { return st.teams[t].players.slice(0, 9); }
function currentBatterP(st) { return lineup(st, battingTeam(st))[st.batterPtr[battingTeam(st)] % 9]; }
function currentPitcherP(st) { return st.teams[fieldingTeam(st)].players[15]; }
// [v0.6 P2-5] dur remembers the full life so render can tell a call's age (2-frame pop)
function setBanner(st, text, frames, color) { st.banner = { text, t: frames || 55, dur: frames || 55, color: color || '#f8f8f0' }; }

/* ── half-inning / at-bat setup ── */
function setupFielders(st) {
  const t = fieldingTeam(st), roster = st.teams[t].players;
  const used = new Set();
  st.fielders = FIELD_POS.map((fp) => {
    let pl = null;
    if (fp.id === 'P') pl = roster[15];
    else {
      for (let i = 0; i < 9; i++) if (!used.has(i) && roster[i].pos === fp.id) { pl = roster[i]; used.add(i); break; }
      if (!pl) for (let i = 0; i < 9; i++) if (!used.has(i) && !'P'.includes(roster[i].pos)) { pl = roster[i]; used.add(i); break; }
    }
    return {
      posId: fp.id, player: pl, homeX: fp.x, homeY: fp.y,
      xS: toSub(fp.x), yS: toSub(fp.y), speedS: 0,
      maxS: TABLE16.fldSpeed[pl ? pl.ratings.def : 8],
      targetX: fp.x, targetY: fp.y, coverBase: -1, bobbleT: 0, anim: 0,
      diveT: 0, proneT: 0, diveDx: 0, diveDy: 0, faceL: false,
    };
  });
  st.chaser = -1;
}
function newPA(st) {
  st.balls = 0; st.strikes = 0; st.swungThisPitch = false;
  const p = currentBatterP(st);
  st.batter = {
    player: p, hand: p.hand, bunting: false,
    boxX: p.hand === 'R' ? CONST.PLATE_X - CONST.HANDEDNESS_OFF : CONST.PLATE_X + CONST.HANDEDNESS_OFF,
  };
  st.swing = { state: 'idle', t: 0 };
  st.walkupT = 110;                       // NOW BATTING card timer
  ev(st, 'newBatter', { name: p.initial + '. ' + p.surname, pow: p.ratings.pow, spd: p.ratings.spd, syl: Math.max(2, Math.min(4, ((p.surname.length / 3) | 0) + 1)) });
}
function toPrepitch(st) {
  st.phase = 'PREPITCH'; st.phaseT = 0;
  st.phantomDeadline = CONST.PHANTOM_MIN + st.rng.range(CONST.PHANTOM_MAX - CONST.PHANTOM_MIN);
  st.ball.mode = 'held-p'; st.ball.heldBy = 0;   // pitcher has it
  const m = GEO.mound; st.ball.xS = toSub(m.x); st.ball.yS = toSub(m.y); st.ball.zS = toSub(14);
  st.ball.bounces = 0; st.ball.touchedGround = false; st.ball.fairTouch = null; st.ball.pastFence = false;
  st.playOuts = 0; st.playErr = false; st.batterResult = null; st.runsThisPlay = 0;
  st.playTimer = 0; st.heldTimer = 0;
  st.stealPlay = st.runners.some(r => r.stealing && r.state === 'run');   // steal may carry over [v0.3]
  // [v0.7] a settled steal is final — drop the foul-recall stamp (carried
  // mid-flight thieves keep theirs until their race resolves)
  for (const r of st.runners) if (!r.stealing) r.stealFrom = undefined;
  st.camera.mode = 'plate';
  st.cpu.plan = null; st.cpu.batPlan = null;
  for (const f of st.fielders) { f.targetX = f.homeX; f.targetY = f.homeY; f.coverBase = POS_COVERS_BASE[f.posId] !== undefined ? POS_COVERS_BASE[f.posId] : -1; }
}
function startHalf(st) {
  st.outs = 0; st.bases = [null, null, null, null]; st.runners = [];
  const bt = battingTeam(st);
  while (st.lineScore[0].length < st.inning) st.lineScore[0].push(null);
  while (st.lineScore[1].length < st.inning) st.lineScore[1].push(null);
  st.lineScore[bt][st.inning - 1] = 0;
  setupFielders(st);
  newPA(st);
  toPrepitch(st);
  if (!(st.inning === 1 && st.half === 0)) setBanner(st, (st.half === 0 ? 'TOP OF ' : 'BOTTOM OF ') + st.inning, 65, '#c8d0e8');
  ev(st, 'halfStart', { inning: st.inning, half: st.half });
}

/* ── pitching ── */
function selectPitchType(heldMask) {
  // d-pad chord at command → type; ambiguous chords normalize to STRAIGHT [PROVEN idiom]
  const u = !!(heldMask & BTN.UP), d = !!(heldMask & BTN.DOWN), l = !!(heldMask & BTN.LEFT), r = !!(heldMask & BTN.RIGHT);
  const count = u + d + l + r;
  if (count !== 1) return 4;                    // fallback table behavior
  if (d) return 0; if (l) return 1; if (r) return 2; if (u) return 3;
  return 4;
}
function startWindup(st, typeIdx, cpuTargetX) {
  const pt = PITCH_TYPES[typeIdx];
  const pitcher = currentPitcherP(st);
  // velocity rating trims flight frames within the [MEASURED] 20–26 envelope
  const veloAdj = Math.round((TABLE16.pitchVelo[pitcher.ratings.velo] - 8) / 5);  // −2..+1
  const T = clamp(pt.T - veloAdj, CONST.PITCH_T_FAST, CONST.PITCH_T_SLOW);
  // [v0.6 P1-1] humans get a live aim target (plate center) — d-pad moves it during WINDUP
  st.pitchInfo = { type: pt, T, targetX: cpuTargetX !== undefined ? cpuTargetX : CONST.PLATE_X };
  st.phase = 'WINDUP'; st.phaseT = 0;
  ev(st, 'windup', { type: pt.name });
}
function releasePitch(st) {
  const pi = st.pitchInfo, pt = pi.type;
  const pitcher = currentPitcherP(st);
  const ftm = fieldingTeam(st);
  st.pitchCount[ftm]++;
  // fatigue [DESIGN on K stamina field]: past the threshold, velo + control decay
  st.tired = st.pitchCount[ftm] > CONST.FATIGUE_BASE + pitcher.ratings.stam * CONST.FATIGUE_PER_STAM;
  const T = clamp(pi.T + (st.tired ? 1 : 0), CONST.PITCH_T_FAST, CONST.PITCH_T_SLOW);
  const hand = pitcher.hand === 'R' ? 14 : -14;
  const b = st.ball, m = GEO.mound;
  b.mode = 'pitch'; b.t = 0; b.heldBy = -1;
  b.xS = toSub(m.x + hand); b.yS = toSub(m.y);
  const distS = toSub(CONST.PLATE_Y) - b.yS;
  b.vyS = Math.round(distS / T);
  // radar gun [DESIGN nicety]: MPH from release y-speed
  st.lastMPH = Math.round((b.vyS / SUB) * 3.8 - 8); st.mphT = 150;
  // control scatter [DESIGN]: worse control → wider release offset
  const ctl = pitcher.ratings.ctrl, span = Math.max(2, 16 - ctl) + (st.tired ? 6 : 0);
  const off = st.rng.range(span * 2 + 1) - span;   // world units at plate
  // [v0.3] the release aims at the CALLED target (CPU plan or plate center) —
  // in-flight steering refines from there; wild targets now land truly wild
  const aimX = (pi.targetX !== null ? pi.targetX : CONST.PLATE_X) + off;
  b.vxS = Math.round(toSub(aimX) - b.xS - 0.5 * pt.breakX * T * T) / T | 0;
  // authored z curve, flat arrival: z(t) = zEnd + (z0−zEnd)·(1 − t/T)²
  // [OPEN→authored, corridor 16–57; z'(T)=0 keeps the contact window pure y-speed]
  const z0 = pt.z0, zEnd = CONST.PITCH_Z_END;
  const zK = (z0 - zEnd) / (T * T);
  b.pitch = { T, t: 0, z0, zEnd, zK, breakAx: pt.breakX, vy0: b.vyS, y0S: b.yS };
  b.zS = toSub(z0);
  st.stats.pitches++;
  st.swungThisPitch = false;              // only swings after release count against the batter
  st.phase = 'PITCH'; st.phaseT = 0;
  ev(st, 'release', { type: pt.name, T });
}
function pitchFrame(st, pads) {
  const b = st.ball, p = b.pitch;
  // live steering [MEASURED — the era-authentic controllable pitch]
  let steer = 0, timeAdj = 0;
  const fp = fieldPad(st);
  if (fp >= 0) {
    const h = pads[fp].held;
    if (h & BTN.LEFT) steer = -TUNE.PITCH_STEER_X;
    if (h & BTN.RIGHT) steer = TUNE.PITCH_STEER_X;
    if (h & BTN.UP) timeAdj = -1;      // up = float it (later arrival)
    if (h & BTN.DOWN) timeAdj = 1;     // down = hurry it
  }
  // [v0.3] CPU pitches fly pure ballistic — the release aim already compensates
  // the break exactly, so mid-flight "correction" only ever ADDED error
  // (double-correct overshoot measured at up to +30u). Humans steer by hand.
  b.vxS += p.breakAx + steer;
  if (timeAdj) {
    const dv = timeAdj * CONST.PITCH_STEER_T;
    const nv = b.vyS + dv;
    if (nv > p.vy0 * 0.85 && nv < p.vy0 * 1.15) b.vyS = nv;
  }
  b.xS += b.vxS; b.yS += b.vyS;
  const prog = clamp((b.yS - p.y0S) / (toSub(CONST.PLATE_Y) - p.y0S), 0, 1.15);
  const rem = (1 - prog) * p.T;                       // frames-worth of travel left
  b.zS = Math.max(toSub(8), Math.round((p.zEnd + p.zK * rem * rem) * SUB));
  b.t++; p.t++;
  // take resolution only once the ball exits the ENTIRE shadow-space depth
  // window — protects the late half of the [PROVEN] contact window
  const shadowY = toInt(b.yS) - 2 * toInt(b.zS);
  if (shadowY > CONST.PLATE_Y - 2 * CONST.BAT_PLANE_Z + CONST.DEPTH_WINDOW_HALF + 4) resolveTake(st);
}

/* ── batting: swing machine + PROVEN contact check ── */
function startSwing(st) {
  if (st.swing.state !== 'idle') return;
  st.swing = { state: 'windup', t: 0 };
  st.swungThisPitch = true; st.stats.swings++;
  ev(st, 'swing');
}
function swingFrame(st) {
  const s = st.swing;
  if (s.state === 'idle') return;
  s.t++;
  if (s.state === 'windup' && s.t >= TUNE.SWING_L) { s.state = 'active'; s.t = 0; }
  else if (s.state === 'active') {
    if (st.ball.mode === 'pitch') tryContact(st);
    if (s.t >= TUNE.SWING_D) { s.state = 'follow'; s.t = 0; }
  } else if (s.state === 'follow' && s.t >= CONST.SWING_FOLLOW) { s.state = 'idle'; s.t = 0; }
}
// Squared-bunt contact [DESIGN]: wider volume, always-weak dribbler
function tryBunt(st) {
  const b = st.ball, bat = st.batter;
  if (b.mode !== 'pitch') return;
  const bx = toInt(b.xS), by = toInt(b.yS), bz = toInt(b.zS);
  const shadowY = by - 2 * bz;
  const batRef = bat.boxX + (bat.hand === 'R' ? CONST.HANDEDNESS_OFF : -CONST.HANDEDNESS_OFF);
  const dLat = bx - batRef;
  const dDepth = shadowY - (CONST.PLATE_Y - 2 * CONST.BAT_PLANE_Z);
  if (Math.abs(dLat) >= CONST.BUNT_LAT || Math.abs(dDepth) > CONST.BUNT_DEPTH_HALF) return;
  const speedRaw = 45 + st.rng.range(30);
  const elevRaw = 470 + st.rng.range(45);
  let az = dLat * 2 + st.rng.range(61) - 30;
  az = clamp(az, -230, 230);
  const speedU = speedRaw / 16;
  const elevRad = ((elevRaw - 512) / CONST.ANGLE_STEPS) * TAU;
  const planar = speedU * Math.cos(elevRad);
  const v = vecFromAngle(az, planar);
  const launch = { vxS: v.vx, vyS: v.vy, vzS: Math.round(Math.sin(elevRad) * speedU * SUB), az, elevRaw, speedRaw, timingClass: 'bunt', quality: 0, bunt: true };
  applyContact(b, launch);
  st.stats.contacts++;
  st.lastLaunch = launch;
  ev(st, 'crack', { q: 0, tc: 'bunt', bunt: true });
  st.phase = 'BLANK'; st.phaseT = 0;
}
function tryContact(st) {
  const b = st.ball, bat = st.batter;
  const bx = toInt(b.xS), by = toInt(b.yS), bz = toInt(b.zS);
  // evaluated in shadow-projected space (y − 2z) [PROVEN, matches disassembly]
  const shadowY = by - 2 * bz;
  const batRef = bat.boxX + (bat.hand === 'R' ? CONST.HANDEDNESS_OFF : -CONST.HANDEDNESS_OFF);
  const dLat = bx - batRef;
  const dDepth = shadowY - (CONST.PLATE_Y - 2 * CONST.BAT_PLANE_Z);
  if (Math.abs(dLat) >= CONST.LAT_WINDOW) return;
  if (Math.abs(dDepth) > CONST.DEPTH_WINDOW_HALF) return;
  const ad = Math.abs(dDepth);
  const quality = ad < CONST.QUALITY_T4 ? 4 : ad < CONST.QUALITY_T2 ? 2 : 0;
  const pow = bat.player.ratings.pow;
  const launch = computeLaunch(st.rng, quality, dDepth, dLat, bat.hand, pow);
  applyContact(b, launch);
  st.stats.contacts++;
  st.swing.state = 'follow'; st.swing.t = 0;
  st.lastLaunch = launch;
  ev(st, 'crack', { q: quality, tc: launch.timingClass });
  // [PROVEN] contact → 6-frame forced-blank hard cut to the field view
  st.phase = 'BLANK'; st.phaseT = 0;
}

/* ── take / count resolution ── */
function resolveTake(st) {
  const b = st.ball;
  const x = toInt(b.xS), z = toInt(b.zS);
  b.mode = 'held-c';   // catcher gloves it
  // HBP-analog special-walk path [PROVEN a distinct path exists]
  // [v0.3] tightened: must arrive AT the batter's body, and batters mostly dodge
  if (!st.swungThisPitch && Math.abs(x - st.batter.boxX) < 5 && st.rng.range(100) < 16) {
    setBanner(st, 'PLUNKED! TAKE YOUR BASE', 70, '#ffd27a'); ev(st, 'call:hbp');
    awardWalk(st); return;
  }
  const swung = st.swungThisPitch && st.swing.state !== 'idle' || st.swungThisPitch;
  // [v0.3] ump edge wobble: borderline calls breathe a little
  let zoneHalf = CONST.ZONE_HALF_W;
  if (Math.abs(Math.abs(x - CONST.PLATE_X) - CONST.ZONE_HALF_W) <= 3) zoneHalf += st.rng.range(7) - 3;
  const inZone = Math.abs(x - CONST.PLATE_X) <= zoneHalf && z >= 8 && z <= 30;
  const stealOn = st.runners.some(r => r.stealing && r.state === 'run');
  if (swung || inZone) {
    st.strikes++;
    if (st.strikes >= 3) {
      ev(st, 'call:strikeout'); setBanner(st, 'STRIKE THREE!', 75, '#ff6a5a');
      recordPAOut(st, 'K');
      if (stealOn && st.outs < 3) stealLive(st, 'nextPA');    // strike-em-out-throw-em-out [v0.3]
    } else {
      ev(st, 'call:strike', { x: x - CONST.PLATE_X, swung: !!swung }); setBanner(st, swung ? 'SWING AND A MISS!' : 'STRIKE!', 50, '#ffb45a');
      if (stealOn) stealLive(st, 'samePA'); else endPitch(st);
    }
  } else {
    st.balls++;
    if (st.balls >= 4) {
      ev(st, 'call:walk'); setBanner(st, 'BALL FOUR — TAKE YOUR BASE', 70, '#7ad0ff');
      awardWalk(st);                                          // no throw-down on ball four
    } else {
      ev(st, 'call:ball', { x: x - CONST.PLATE_X }); setBanner(st, 'BALL', 45, '#9adf9a');
      if (stealOn) stealLive(st, 'samePA'); else endPitch(st);
    }
  }
}
function endPitch(st) { st.phase = 'RESOLVE'; st.phaseT = 0; st.resolveNext = 'samePA'; st.resolveDur = 52; }
function awardWalk(st) {
  // forced advances only
  const bt = battingTeam(st);
  const batterRunner = makeRunner(st, st.batter.player, 0);
  let carry = batterRunner, base = 1;
  while (carry && base <= 3) {
    const occ = st.bases[base];
    st.bases[base] = carry; carry.fromBase = base; carry.state = 'onbase';
    const bc = GEO.bases[base]; carry.xS = toSub(bc.x); carry.yS = toSub(bc.y);
    carry = occ; base++;
  }
  if (carry) { scoreRun(st, carry); }   // bases-loaded walk
  st.phase = 'RESOLVE'; st.phaseT = 0; st.resolveNext = 'nextPA'; st.resolveDur = 76;
}
function recordPAOut(st, kind) {
  st.outs++; st.playOuts++;
  ev(st, 'out', { kind });
  st.phase = 'RESOLVE'; st.phaseT = 0; st.resolveDur = 82;
  st.resolveNext = st.outs >= 3 ? 'halfEnd' : 'nextPA';
}
function scoreRun(st, runner) {
  const bt = battingTeam(st);
  st.score[bt]++; st.runsThisPlay++;
  st.lineScore[bt][st.inning - 1] = (st.lineScore[bt][st.inning - 1] || 0) + 1;
  if (runner) runner.state = 'scored';
  ev(st, 'run', { team: bt });
  // walk-off check
  if (st.half === 1 && st.inning >= st.innings && st.score[1] > st.score[0]) st.walkoff = true;
}
