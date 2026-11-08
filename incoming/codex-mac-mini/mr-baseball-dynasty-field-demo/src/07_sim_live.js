/* ════════════════ SECTION §F4 — LIVE PLAY, CPU BRAINS, MASTER TICK ════════════════ */

function endLivePlay(st, reason) {
  if (st.phase === 'RESOLVE') return;
  const b = st.ball;
  // settle any still-running runners onto their target bases (play is called)
  for (const r of activeRunners(st)) {
    const base = r.state === 'run' ? r.toBase : r.fromBase;
    if (base >= 4) { scoreRun(st, r); continue; }
    if (!st.bases[base]) { st.bases[base] = r; r.fromBase = base; }
    r.state = 'onbase';
    // [v0.7] a thief settled by a called play is done stealing — clear the
    // flag and the burst (same hygiene as the arrival path in runnerTick)
    if (r.stealing) { r.stealing = false; r.speedS = TABLE16.runSpeed[r.player.ratings.spd]; }
    if (r.isBatter && !st.batterResult) st.batterResult = st.playErr ? 'E' : (base === 1 ? '1B' : base === 2 ? '2B' : '3B');
  }
  // banner + hit bookkeeping
  const bt = battingTeam(st);
  let text = null;
  if (st.playOuts >= 2) text = 'DOUBLE PLAY!';
  else if (st.batterResult === '1B') text = 'SINGLE!';
  else if (st.batterResult === '2B') text = 'DOUBLE!';
  else if (st.batterResult === '3B') text = 'TRIPLE!';
  else if (st.batterResult === 'E') text = 'SAFE ON THE ERROR';
  else if (st.batterResult === 'HR') text = null;                 // already bannered
  else if (st.playOuts > 0) text = null;                          // OUT!/CAUGHT! already shown
  if (['1B', '2B', '3B'].includes(st.batterResult) && !st.playErr) st.hits[bt]++;
  if (text) setBanner(st, text, 60, '#8fe08f');
  b.mode = 'dead'; b.heldBy = -1;
  st.phase = 'RESOLVE'; st.phaseT = 0;
  st.resolveDur = st.batterResult === 'HR' ? 110 : 62;
  st.resolveNext = st.outs >= 3 ? 'halfEnd' : 'nextPA';
  // pure steal plays keep the batter at the plate [v0.3]
  if (st.stealPlay && st.batterResult === null && st.outs < 3) st.resolveNext = st.stealResolve || 'samePA';
  st.stealPlay = false; st.stealResolve = null;
  if (st.walkoff) st.resolveNext = 'gameOver';
  ev(st, 'playDead', { reason, result: st.batterResult, outs: st.playOuts });
}
function homeRun(st) {
  const b = st.ball;
  const pred = predictLanding(b);
  const distU = Math.max(GEO.distFromPlate(toInt(b.xS), toInt(b.yS)), GEO.distFromPlate(pred.x, pred.y));
  const ft = Math.round(distU / 8.7 / 5) * 5 + 240;   // arcade-flattering ruler [DESIGN]
  setBanner(st, 'HOME RUN! ' + ft + ' FT!', 120, '#ffd76a');
  ev(st, 'hr', { dist: Math.round(distU), ft });
  for (let base = 3; base >= 1; base--) { const r = st.bases[base]; if (r) { st.bases[base] = null; scoreRun(st, r); } }
  for (const r of st.runners) if (r.state === 'run' || r.state === 'return') { if (r.isBatter) { scoreRun(st, r); } else scoreRun(st, r); }
  st.batterResult = 'HR';
  endLivePlay(st, 'homer');
}
function groundRuleDouble(st) {
  setBanner(st, 'GROUND RULE DOUBLE', 80, '#ffd76a');
  ev(st, 'grd');
  for (let base = 3; base >= 1; base--) {
    const r = st.bases[base]; if (!r) continue;
    st.bases[base] = null;
    const dest = base + 2;
    if (dest >= 4) scoreRun(st, r);
    else { st.bases[dest] = r; r.fromBase = dest; r.state = 'onbase'; const bc = GEO.bases[dest]; r.xS = toSub(bc.x); r.yS = toSub(bc.y); }
  }
  const br = st.runners.find(r => r.isBatter && (r.state === 'run' || r.state === 'onbase'));
  if (br) {
    if (br.state === 'onbase' && br.fromBase >= 1) st.bases[br.fromBase] = null;
    if (!st.bases[2]) { st.bases[2] = br; br.fromBase = 2; br.state = 'onbase'; const bc = GEO.bases[2]; br.xS = toSub(bc.x); br.yS = toSub(bc.y); }
  }
  st.batterResult = '2B';
  endLivePlay(st, 'grd');
}
// [v0.7] rule: on a foul, runners return to their time-of-pitch bases — a
// thief who ARRIVED before the foul verdict (long hang time) kept the bag
// before. tryLaunchSteal stamps stealFrom; toPrepitch clears it once the
// steal is final. Ascending base order un-stacks double steals cleanly.
function recallCompletedSteals(st) {
  for (let base = 1; base <= 3; base++) {
    const r = st.bases[base];
    if (!r || r.stealFrom === undefined || r.stealFrom === base || st.bases[r.stealFrom]) continue;
    st.bases[base] = null; st.bases[r.stealFrom] = r;
    r.fromBase = r.stealFrom; r.toBase = r.stealFrom + 1;
    const bc = GEO.bases[r.stealFrom]; r.xS = toSub(bc.x); r.yS = toSub(bc.y);
  }
}
function foulBall(st) {
  const b = st.ball;
  b.mode = 'dead';
  // real rule: a bunted foul with two strikes is a strikeout
  if (st.lastLaunch && st.lastLaunch.bunt && st.strikes === 2) {
    for (const r of activeRunners(st)) {
      const base = r.isBatter ? 0 : r.fromBase;
      if (base >= 1) { st.bases[base] = r; r.state = 'onbase'; const bc = GEO.bases[base]; r.xS = toSub(bc.x); r.yS = toSub(bc.y); }
      else r.state = 'scored';
    }
    st.runners = st.runners.filter(r => r.state === 'onbase');
    recallCompletedSteals(st);
    st.strikes = 3;
    ev(st, 'call:strikeout'); setBanner(st, 'BUNTED FOUL - STRIKE THREE!', 80, '#ff6a5a');
    recordPAOut(st, 'K');
    return;
  }
  if (st.strikes < 2) st.strikes++;
  ev(st, 'call:foul'); setBanner(st, 'FOUL BALL', 55, '#e8d8a0');
  // running runners scurry back
  for (const r of activeRunners(st)) {
    const base = r.isBatter ? 0 : r.fromBase;
    if (base >= 1) {
      st.bases[base] = r; r.state = 'onbase'; const bc = GEO.bases[base]; r.xS = toSub(bc.x); r.yS = toSub(bc.y);
      // [v0.7] the foul kills the steal: drop the flag and the burst, or the
      // next launch compounds speed and a later plain advance banners a
      // phantom SAFE! STOLEN BASE!
      if (r.stealing) { r.stealing = false; r.speedS = TABLE16.runSpeed[r.player.ratings.spd]; }
    }
    else r.state = 'scored';                       // batter-runner despawns
  }
  st.runners = st.runners.filter(r => r.state === 'onbase');
  recallCompletedSteals(st);
  st.phase = 'RESOLVE'; st.phaseT = 0; st.resolveDur = 58; st.resolveNext = 'samePA';
}

function setupLive(st) {
  const b = st.ball;
  st.camera.mode = 'field';
  // hard cut opens on the landing-lead framing [v0.3 camera grammar]
  const pr = predictLanding(b);
  st.camera.xS = clamp((toSub(pr.x) * 3 + b.xS) >> 2, toSub(760), toSub(CONST.WORLD_W - 760));
  st.camera.yS = clamp((toSub(pr.y) * 3 + b.yS) >> 2, toSub(560), toSub(CONST.PLATE_Y + 40));
  st.camera.lastThrowT = -9;
  const br = makeRunner(st, st.batter.player, 0);
  br.forced = true;
  const p0 = GEO.plate; br.xS = toSub(p0.x + (st.batter.hand === 'R' ? -20 : 20)); br.yS = toSub(p0.y - 6);
  computeForces(st);
  st.pred = predictLanding(b); st.predT = 0;
  pickChaser(st);
  // covers hustle to their bases
  for (const f of st.fielders) if (f.coverBase >= 0) { const bc = GEO.bases[f.coverBase]; f.targetX = bc.x; f.targetY = bc.y; }
}
function liveFrame(st, pads) {
  const b = st.ball;
  st.playTimer++;
  const fpad = fieldPad(st), bpad = batPad(st);
  if (b.heldBy >= 0) {
    st.heldTimer++;
    const f = st.fielders[b.heldBy];
    b.xS = f.xS; b.yS = f.yS; b.zS = toSub(14);
    // human throw: B + spatial d-pad → base [PROVEN mapping]
    if (fpad >= 0 && st.heldTimer > 5 && (pads[fpad].pressed & BTN.B)) {
      const h = pads[fpad].held;
      let base = null;
      if (h & BTN.RIGHT) base = 1; else if (h & BTN.UP) base = 2; else if (h & BTN.LEFT) base = 3; else if (h & BTN.DOWN) base = 0;
      if (base === null) {
        const lead = activeRunners(st).filter(r => r.state === 'run' && r.forced).sort((a, c) => c.toBase - a.toBase)[0];
        base = lead ? (lead.toBase % 4) : -1;
      }
      doThrow(st, base);
    }
    // human idle guard / CPU brain
    if (b.heldBy >= 0) {
      if (fpad < 0) cpuHolderThink(st);
      else if (st.heldTimer > 240) returnBallToPitcher(st);
    }
  } else if (b.mode !== 'dead') {
    // fielder switch [v0.3]: A cycles control to the next-nearest fielder
    if (fpad >= 0 && (pads[fpad].pressed & BTN.A)) {
      const px = st.pred ? st.pred.x : toInt(b.xS), py = st.pred ? st.pred.y : toInt(b.yS);
      const order = st.fielders.map((f, i) => ({ i, d: dist2d(toInt(f.xS), toInt(f.yS), px, py) }))
        .sort((a, c) => a.d - c.d).map(o => o.i);
      const cur = order.indexOf(st.chaser);
      st.chaser = order[(cur + 1) % order.length];
      st.chaserLockF = st.frame + 90;
      ev(st, 'switch');
    }
    // fielder dive: B while chasing an airborne ball [DESIGN on the original's contextual B]
    if (fpad >= 0 && (pads[fpad].pressed & BTN.B) && (b.mode === 'flight' || b.mode === 'throw')) {
      const ch = st.fielders[st.chaser];
      if (ch && ch.diveT === 0 && ch.proneT === 0) {
        const dd = dist2d(toInt(ch.xS), toInt(ch.yS), toInt(b.xS), toInt(b.yS));
        if (dd < 90) {
          ch.diveT = CONST.DIVE_FRAMES;
          const dxb = toInt(b.xS) + (b.vxS >> 8) * 6 - toInt(ch.xS);
          const dyb = toInt(b.yS) + (b.vyS >> 8) * 6 - toInt(ch.yS);
          const dl = Math.max(1, Math.sqrt(dxb * dxb + dyb * dyb));
          ch.diveDx = dxb / dl; ch.diveDy = dyb / dl; ch.faceL = dxb < 0;
          if (st.fx.length < 12) st.fx.push({ k: 'dust', x: toInt(ch.xS), y: toInt(ch.yS), f: st.frame });
          ev(st, 'dive');
        }
      }
    }
    // batting side steers airborne batted balls [MEASURED — core arcade mechanic]
    let ax = 0, ay = 0;
    if (b.mode === 'flight' && b.batted) {
      if (bpad >= 0) {
        const h = pads[bpad].held;
        ax = (h & BTN.RIGHT ? TUNE.STEER_ACCEL : 0) - (h & BTN.LEFT ? TUNE.STEER_ACCEL : 0);
        ay = (h & BTN.DOWN ? TUNE.STEER_ACCEL : 0) - (h & BTN.UP ? TUNE.STEER_ACCEL : 0);
      } else if (b.t < 60 && st.pred && st.chaser >= 0) {
        // [v0.3] CPU batters use the same mechanic, pushing AWAY from the
        // converging chaser (deterministic, state-derived)
        // [v0.6] full authority + longer window (was 75%/42f): with throws
        // traveling, ground-ball rallies die on the bases — gap-hitting keeps
        // the scoreboard honest (runs were 1.9/game, band is 2.5-5)
        const ch = st.fielders[st.chaser];
        const dx = st.pred.x - toInt(ch.xS), dy = st.pred.y - toInt(ch.yS);
        if (Math.abs(dx) + Math.abs(dy) < 380) {       // he's on it — work the gap
          ax = dx === 0 ? 0 : (dx > 0 ? TUNE.STEER_ACCEL : -TUNE.STEER_ACCEL);
          ay = dy === 0 ? 0 : (dy > 0 ? TUNE.STEER_ACCEL : -TUNE.STEER_ACCEL);
        }
      }
    }
    const preBounces = b.bounces;
    ballStep(b, (t, d) => ev(st, t, d), ax, ay);
    if (b.bounces > preBounces && b.bounces <= 3 && st.fx.length < 12)
      st.fx.push({ k: 'dust', x: toInt(b.xS), y: toInt(b.yS), f: st.frame });
    // first ground touch → fair/foul verdict [DESIGN on standard rules]
    if (b.batted && b.fairTouch === null && b.bounces > preBounces) {
      b.fairTouch = GEO.isFair(toInt(b.xS), toInt(b.yS));
      if (!b.fairTouch) { foulBall(st); return; }
      ev(st, 'fair');
    }
    // deep foul flies / backstop
    if (b.batted && toInt(b.yS) > CONST.PLATE_Y + 220) { foulBall(st); return; }
    // fence interactions
    if (b.batted && !b.pastFence) {
      const x = toInt(b.xS), y = toInt(b.yS);
      if (GEO.isFair(x, y)) {
        const az = GEO.azimuthOf(x, y), d = GEO.distFromPlate(x, y);
        if (d >= GEO.fenceDist(az)) {
          b.pastFence = true;
          const zi = toInt(b.zS);
          if (b.mode === 'flight' && !b.touchedGround && zi > CONST.WALL_Z) { homeRun(st); return; }
          if (b.mode === 'flight' && !b.touchedGround) {
            // off the wall — damped reflect back into play [DESIGN]
            b.vxS = -((b.vxS * 90) >> 8); b.vyS = -((b.vyS * 90) >> 8);
            b.pastFence = false; b.wallHit = true; ev(st, 'wall');
          } else { groundRuleDouble(st); return; }
        }
      }
    }
    // throw arrived nowhere (missed/overthrown) → it's just a live loose ball
    if (b.mode === 'throw' && b.t > b.throwT + 24) b.mode = 'flight';
  }
  // ── manual baserunning [DESIGN]: batting side A = send everyone, B = retreat ──
  if (bpad >= 0) {
    if (pads[bpad].pressed & BTN.A) {
      let sent = false;
      for (let base = 3; base >= 1; base--) {
        const r = st.bases[base]; if (!r) continue;
        const nb = base + 1;
        if (nb < 4 && st.bases[nb]) continue;
        st.bases[base] = null; r.state = 'run'; r.toBase = nb; r.forced = false; sent = true;
      }
      if (sent) ev(st, 'send');
    }
    if (pads[bpad].pressed & BTN.B) {
      let held = false;
      for (const r of activeRunners(st)) {
        if (r.state === 'run' && !r.forced && !r.isBatter) { r.state = 'return'; held = true; }
      }
      if (held) ev(st, 'retreat');
    }
  }
  // fielders + runners
  if (st.predT-- <= 0) { st.pred = predictLanding(b); st.predT = 6; if (b.heldBy < 0 && st.frame % 24 === 0) pickChaser(st); }
  for (let i = 0; i < st.fielders.length; i++) { fielderTick(st, st.fielders[i], i, pads); if (st.phase !== 'LIVE') return; }
  for (const r of st.runners) { runnerTick(st, r); if (st.phase !== 'LIVE') return; }
  // held-ball tags [v0.6]: a fielder holding the ball tags any off-base runner in
  // reach. Contested throw-downs/rundowns could NEVER produce outs before — the
  // throw beat the runner and the tag was only checked on the catch frame.
  if (b.heldBy >= 0) { forceTagCheck(st, b.heldBy, false); if (st.phase !== 'LIVE') return; }
  if (st.frame % 6 === 0) { computeForces(st); decideRunners(st); }
  // play-dead: everyone settled + ball possessed
  if (b.heldBy >= 0 && activeRunners(st).length === 0) { endLivePlay(st, 'settled'); return; }
  // ── liveness guarantee [DESIGN — the original's dead-zone stall bug is impossible] ──
  if (st.playTimer === CONST.LIVENESS_FORCE) { pickChaser(st); ev(st, 'forceFetch'); }
  if (st.playTimer > CONST.LIVENESS_KILL) {
    for (const r of activeRunners(st)) {
      const base = r.state === 'run' ? r.toBase : r.fromBase;
      if (base >= 4) scoreRun(st, r);
      else if (!st.bases[base]) { st.bases[base] = r; r.fromBase = base; r.state = 'onbase'; }
      else r.state = 'onbase';
    }
    b.heldBy = 0; b.mode = 'held';
    endLivePlay(st, 'timeout');
  }
}

/* ── CPU brains ── */
function cpuPitcherThink(st) {
  if (st.cpu.plan === null) st.cpu.plan = { act: 70 + st.rng.range(90) };
  // slide-step [v0.3]: a runner takes off → deliver NOW, cut his head start
  if (st.stealPlay && st.phaseT > 24 && st.phase === 'PREPITCH') {
    startWindup(st, 0, CONST.PLATE_X + (st.rng.range(21) - 10));
    return;
  }
  // occasional pickoff on a full lead
  if (st.phaseT > 56 && (st.phaseT & 15) === 0) {
    for (let base = 1; base <= 3; base++) {
      const r = st.bases[base];
      if (r && (r.leadS || 0) >= toSub(CONST.LEAD_MAX) - 80 && st.rng.range(256) < 9) { pickoffThrow(st, base); return; }
    }
  }
  if (st.phaseT < st.cpu.plan.act) return;
  const bal = st.balls, str = st.strikes;
  let weights;
  if (str > bal) weights = [[26, 0], [22, 1], [22, 2], [20, 3], [10, 4]];
  else if (bal > str) weights = [[45, 0], [15, 4], [14, 1], [14, 2], [12, 3]];
  else weights = [[32, 0], [17, 1], [17, 2], [17, 3], [17, 4]];
  const type = st.rng.weighted(weights);
  const ctrl = currentPitcherP(st).ratings.ctrl;
  // count-aware attack plan [v0.3]: behind → find the zone, ahead → nibble/expand
  // [v0.6] −3 across counts: working defense shortened games (~15% fewer pitches)
  // and walks fell under the 1-2 band with it (0.17-0.8/game measured)
  const zoneBase = bal === 3 ? 67 : (bal >= 2 && bal > str ? 65 : (str > bal ? 39 : 53));
  const zoneRoll = st.rng.range(100) < zoneBase + ctrl - (st.tired ? 10 : 0);
  let off;
  if (zoneRoll) { off = st.rng.range(19) * (st.rng.range(2) ? 1 : -1); st.cpu.lostIt = false; }
  else {
    const away = st.batter.hand === 'R' ? 1 : -1;   // work away from the batter
    // [v0.3] misses have a real tail, and wildness is STICKY — a pitcher who
    // just sprayed one is likelier to spray the next (walk clusters, era drama)
    const wild = st.rng.range(100) < (st.tired ? 50 : 32) + (st.cpu.lostIt ? 26 : 0);
    const span = wild ? 46 + st.rng.range(26) : 27 + st.rng.range(15);
    off = span * (st.rng.range(100) < 72 ? away : -away);
    st.cpu.lostIt = wild;
  }
  startWindup(st, type, CONST.PLATE_X + off);
}
function cpuBatterThink(st) {
  const b = st.ball; if (b.mode !== 'pitch') return;
  const plan = st.cpu.batPlan, p = b.pitch;
  const remaining = Math.max(1, (toSub(CONST.PLATE_Y) - b.yS) / b.vyS);
  const projX = toInt(b.xS + b.vxS * remaining + 0.5 * p.breakAx * remaining * remaining);
  const dz = Math.abs(projX - CONST.PLATE_X);
  // [v0.3] the batter reads the pitch MID-FLIGHT (t = T−12), after steering has
  // developed — early-flight misses no longer masquerade as strikes. A human
  // pitcher steering LATE can still fool the eye. That's the duel.
  if (plan === null && b.t >= Math.max(2, p.T - 12)) {
    const skill = st.teams[battingTeam(st)].skill;
    // timing error model: base jitter by skill + occasional badly-timed hack —
    // this is where CPU whiffs, fouls, and weak contact come from [DESIGN]
    const j = TABLE16.cpuJitter[skill] >= 24 ? 4 : 3;
    let jitter = st.rng.range(2 * j + 1) - j;
    if (st.rng.range(100) < 22) jitter += st.rng.range(2) ? 5 : -5;
    const idealPress = Math.round(p.T - TUNE.SWING_L - 1);   // aims first live frame just inside the window
    // ── CPU EYE MODEL [v0.3]: swing% shaped by zone distance and count ──
    const twoK = st.strikes === 2, threeB = st.balls === 3;
    let swingPct;
    if (dz <= 18)      swingPct = twoK ? 94 : (st.balls > st.strikes ? 58 : 68);
    else if (dz <= 30) swingPct = twoK ? 74 : 26;
    else if (dz <= 44) swingPct = twoK ? 24 : 8;
    else               swingPct = twoK ? 7 : 2;
    if (threeB) swingPct = dz <= 20 ? Math.max(swingPct, 62) : 0;   // ball four discipline: take it
    if (st.rng.range(100) < swingPct) {
      if (dz > 26) jitter += (st.rng.range(2) ? 1 : -1) * (2 + (dz >> 4));  // reaching costs timing
      let press = idealPress + jitter;
      // [v0.3] honest whiff rate: some committed swings are simply BEATEN — the
      // bat comes through as the ball hits the mitt (late hack, registers a swing)
      if (st.rng.range(100) < (twoK ? 13 : 22) + (dz > 26 ? 10 : 0)) press = p.T - 2 + st.rng.range(4);
      st.cpu.batPlan = { press, swing: true };
    }
    else st.cpu.batPlan = { press: -1, swing: false, reeval: dz > 20 && !threeB };
    return;
  }
  if (plan && plan.reeval && b.t === p.T - 8) {      // last look: late break back over the plate
    if (dz <= 24 && st.rng.range(100) < (st.strikes === 2 ? 84 : 38)) {
      plan.swing = true; plan.press = Math.max(b.t + 1, Math.round(p.T - TUNE.SWING_L - 1) + (st.rng.range(5) - 2)); plan.reeval = false;
    }
  }
  // check swing [v0.3]: the ball dives off the plate late → lay off (usually)
  if (plan && plan.swing && b.t === p.T - 7 && b.t < plan.press && dz > 34 && st.rng.range(100) < 70) {
    plan.swing = false;
  }
  if (plan && plan.swing && b.t >= plan.press && st.swing.state === 'idle') startSwing(st);
}
function cpuHolderThink(st) {
  const b = st.ball;
  if (st.heldTimer < 12) return;
  if (st.cpu.throwCd > 0) { st.cpu.throwCd--; return; }
  st.cpu.throwCd = 6;
  const f = st.fielders[b.heldBy];
  // steal defense [v0.3]: catcher contests even losing races (within reason)
  if (st.stealPlay) {
    if (st.heldTimer < CONST.STEAL_POP_TIME) return;   // [v0.6] the exchange takes time
    for (const r of activeRunners(st)) {
      if (!r.stealing || r.state !== 'run') continue;
      const base = r.toBase % 4;
      const margin = runnerETA(r, r.toBase) - throwFrames(b.xS, b.yS, base);
      if (margin > -14) { doThrow(st, base); return; }   // [v0.6: was −22 — catcher contested too few races; caught-rate ~16% → target ~30%]
    }
  }
  let best = null, bestScore = -1e9;
  for (const r of activeRunners(st)) {
    if (r.state !== 'run') continue;
    const base = r.toBase % 4;
    const margin = runnerETA(r, r.toBase) - throwFrames(b.xS, b.yS, base);
    if (margin < 8) continue;                       // don't throw into a lost race
    const prio = r.forced ? 20 : 6;
    const baseVal = base === 0 ? 14 : base === 3 ? 10 : base === 2 ? 6 : 8;
    const score = prio + baseVal + margin / 4;
    if (score > bestScore) { bestScore = score; best = base; }
  }
  if (best !== null) { doThrow(st, best); return; }
  if (activeRunners(st).length === 0) { returnBallToPitcher(st); return; }
  // [v0.4 STUCK-FIELDER FIX] no winnable throw is NOT a license to stand frozen
  // while runners tour the bases — contest the lead runner's bag, or if we've
  // held too long, fire it there anyway. (fielderTick also jogs the ball in.)
  const lead = activeRunners(st).filter(r => r.state === 'run').sort((a, c) => c.toBase - a.toBase)[0];
  if (lead) {
    const base = lead.toBase % 4;
    const margin = runnerETA(lead, lead.toBase) - throwFrames(b.xS, b.yS, base);
    if (st.heldTimer > 90 || margin > -30) { doThrow(st, base); return; }
  }
}

/* ── phantom pitch: the delay-penalty pacing governor [MEASURED] ── */
function phantomResolve(st) {
  const strike = st.rng.range(100) < 55;
  if (strike) {
    st.strikes++;
    if (st.strikes >= 3) { ev(st, 'call:strikeout'); setBanner(st, 'DELAY — STRIKE THREE!', 75, '#ff6a5a'); recordPAOut(st, 'K'); return; }
    ev(st, 'call:strike'); setBanner(st, 'DELAY OF GAME — STRIKE!', 60, '#ffb45a');
  } else {
    st.balls++;
    if (st.balls >= 4) { ev(st, 'call:walk'); setBanner(st, 'DELAY — BALL FOUR', 70, '#7ad0ff'); awardWalk(st); return; }
    ev(st, 'call:ball'); setBanner(st, 'DELAY OF GAME — BALL', 60, '#9adf9a');
  }
  endPitch(st);
}

/* ── scene/phase transitions ── */
function afterResolve(st) {
  // clear finished runners — but stealing runners may still be mid-flight [v0.3]
  st.runners = st.runners.filter(r => r.state === 'onbase' || (r.stealing && (r.state === 'run' || r.state === 'return')));
  // [v0.7] a runner who survives a play boundary is never the next play's
  // batter-runner. isBatter was set at creation and never cleared, so every
  // baserunner read as "the batter" forever: foul recalls despawned real
  // runners, safe steals credited phantom doubles and consumed the batter's
  // PA, flyouts called the wrong man out, tag-ups and the retreat command
  // matched nobody, and computeForces saw a phantom batter-runner on steals.
  for (const r of st.runners) r.isBatter = false;
  switch (st.resolveNext) {
    case 'samePA': toPrepitch(st); break;
    case 'nextPA':
      st.batterPtr[battingTeam(st)] = (st.batterPtr[battingTeam(st)] + 1) % 9;
      newPA(st); toPrepitch(st); break;
    case 'halfEnd': {
      // zero-fill the completed half's line score cell
      const bt = battingTeam(st);
      if (st.lineScore[bt][st.inning - 1] === null) st.lineScore[bt][st.inning - 1] = 0;
      st.batterPtr[bt] = (st.batterPtr[bt] + 1) % 9;
      const over = gameOverCheck(st);
      if (over) { toFinal(st); return; }
      st.scene = 'CARD'; st.sceneT = 0; st.cardType = 'half';
      ev(st, 'card');
      break;
    }
    case 'gameOver': toFinal(st); break;
    default: toPrepitch(st);
  }
}
function gameOverCheck(st) {
  const [a, h] = st.score;
  if (st.half === 0) {
    // home already ahead heading to their last bottom half → game over
    if (st.inning >= st.innings && h > a) return true;
    return false;
  }
  // bottom half just ended
  if (st.inning >= st.innings && a !== h) return true;
  if (st.inning >= st.innings + CONST.MAX_EXTRA && st.half === 1) return true;  // called: tie stands
  return false;
}
function toFinal(st) {
  st.scene = 'FINAL'; st.sceneT = 0; st.gameOver = true;
  ev(st, 'final', { score: st.score.slice() });
}
function flipHalf(st) {
  if (st.half === 0) st.half = 1;
  else { st.half = 0; st.inning++; }
  st.scene = 'GAME'; st.sceneT = 0;
  startHalf(st);
}

/* ── master tick ── */
function tick(st, pads) {
  st.frame++;
  st.events.length = 0;
  if (st.banner && --st.banner.t <= 0) st.banner = null;
  const anyPress = pads[0].pressed | pads[1].pressed;
  switch (st.scene) {
    case 'TITLE':
      st.sceneT++;
      if (pads[0].pressed & BTN.UP) { st.menuSel = (st.menuSel + 3) % 4; ev(st, 'menu'); }
      if (pads[0].pressed & BTN.DOWN) { st.menuSel = (st.menuSel + 1) % 4; ev(st, 'menu'); }
      // [v0.6 P1-3] game-length row: d-pad L/R (or B/START as a toggle) cycles 3/6/9
      if (st.menuSel === 3 && (pads[0].pressed & (BTN.LEFT | BTN.RIGHT | BTN.B | BTN.START))) {
        const o = CONST.INNINGS_OPTS, i = Math.max(0, o.indexOf(st.innings));
        st.innings = o[(i + (pads[0].pressed & BTN.LEFT ? o.length - 1 : 1)) % o.length];
        ev(st, 'menu');
        break;
      }
      if (pads[0].pressed & (BTN.START | BTN.B)) {
        ev(st, 'menu');
        if (st.menuSel === 0) { st.control = ['cpu', 'human0']; st.scene = 'MATCHUP'; st.sceneT = 0; }
        else if (st.menuSel === 1) { st.control = ['human1', 'human0']; st.scene = 'MATCHUP'; st.sceneT = 0; }
        else return 'DEMO';
      }
      break;
    case 'MATCHUP':
      st.sceneT++;
      if (anyPress & (BTN.START | BTN.B)) { st.scene = 'GAME'; st.sceneT = 0; ev(st, 'playball'); setBanner(st, 'PLAY BALL!', 70, '#ffe27a'); startHalf(st); }
      break;
    case 'CARD':
      st.sceneT++;
      if ((anyPress & (BTN.START | BTN.B)) || (st.demo && st.sceneT > 240) || st.sceneT > 1800) flipHalf(st);
      break;
    case 'FINAL':
      st.sceneT++;
      if (anyPress & (BTN.START | BTN.B)) { ev(st, 'menu'); return 'RESET'; }
      break;
    case 'GAME': gameTick(st, pads); break;
  }
  // ── CAMERA GRAMMAR [v0.3, RE §5.5: an information system first] ──
  // state-driven targets · integer constant-speed pan · deadzone · HARD CUTS on throws
  if (st.camera.mode === 'field') {
    const b = st.ball;
    let txS, tyS, cut = false;
    if (b.mode === 'throw') {
      // decisive: frame the contested base the moment the throw leaves
      const tb = b.throwTarget === -1 ? 2 : (b.throwTarget % 4);
      const bc = b.throwTarget === -1 ? GEO.mound : GEO.bases[tb];
      txS = toSub(bc.x); tyS = toSub(bc.y);
      if (st.camera.lastThrowT !== b.throwTarget) { cut = true; st.camera.lastThrowT = b.throwTarget; }
    } else {
      st.camera.lastThrowT = -9;
      if (b.mode === 'flight' && b.batted && st.pred) {
        // ball flight: lead the LANDING POINT, not the ball (3:1 weight)
        txS = (toSub(st.pred.x) * 3 + b.xS) >> 2;
        tyS = (toSub(st.pred.y) * 3 + b.yS) >> 2;
      } else if (b.heldBy >= 0) {
        // possession: frame holder + lead runner (base-play focus)
        const f = st.fielders[b.heldBy];
        const lead = activeRunners(st)[0];
        if (lead) { txS = (f.xS + lead.xS) >> 1; tyS = (f.yS + lead.yS) >> 1; }
        else { txS = f.xS; tyS = f.yS; }
      } else if (b.mode === 'rolling' || b.mode === 'settled' || (b.mode === 'flight' && b.touchedGround)) {
        // fielding focus: ball + chaser midpoint
        const ch = st.fielders[st.chaser];
        if (ch) { txS = (b.xS * 3 + ch.xS) >> 2; tyS = (b.yS * 3 + ch.yS) >> 2; }
        else { txS = b.xS; tyS = b.yS; }
      } else if (b.mode === 'dead') {
        const lead = activeRunners(st)[0];
        if (lead) { txS = lead.xS; tyS = lead.yS; } else { txS = st.camera.xS; tyS = st.camera.yS; }
      } else { txS = b.xS; tyS = b.yS; }
    }
    txS = clamp(txS, toSub(760), toSub(CONST.WORLD_W - 760));
    tyS = clamp(tyS, toSub(560), toSub(CONST.PLATE_Y + 40));
    if (cut) { st.camera.xS = txS; st.camera.yS = tyS; }
    else {
      const dzn = toSub(12), PAN = toSub(11);
      const dx = txS - st.camera.xS, dy = tyS - st.camera.yS;
      if (Math.abs(dx) > dzn) st.camera.xS += clamp(dx, -PAN, PAN);
      if (Math.abs(dy) > dzn) st.camera.yS += clamp(dy, -PAN, PAN);
    }
  }
  return null;
}
/* ── STEALS [v0.3, DESIGN — original system Unknown; era-appropriate original design] ──
   Command: batting side presses A + direction of the TARGET base during
   PREPITCH/WINDUP (U=2B, L=3B, D=home). The runner bursts (+25% speed) from his
   lead. When the catcher gloves the pitch, the throw-down race is played out
   in a live cut. Jump timing decides: PREPITCH jumps are safer but pickoff-
   exposed; WINDUP jumps are coin flips for fast runners. */
function tryLaunchSteal(st, fromBase) {
  if (fromBase < 1 || fromBase > 3) return false;
  const r = st.bases[fromBase]; if (!r) return false;
  const dest = fromBase + 1;
  if (dest <= 3 && st.bases[dest]) return false;          // blocked ahead
  st.bases[fromBase] = null;
  r.state = 'run'; r.toBase = dest; r.forced = false; r.stealing = true;
  r.stealFrom = fromBase;   // [v0.7] launch bag, so a foul can undo a completed steal (rule: runners return to time-of-pitch bases)
  r.speedS = r.speedS + (r.speedS >> 4);                  // steal burst ×1.0625 [v0.6: was ×1.125 — caught-rate ~16%, target ~30%]
  st.stealPlay = true;
  ev(st, 'steal', { from: fromBase });
  setBanner(st, 'RUNNER GOES!', 30, '#ffe27a');
  return true;
}
function stealLive(st, next) {
  if (!activeRunners(st).some(r => r.stealing)) return;   // already settled
  st.stealResolve = next;
  st.phase = 'LIVE'; st.phaseT = 0;
  st.camera.mode = 'field'; st.camera.lastThrowT = -9;
  const b = st.ball;
  b.mode = 'held'; b.heldBy = 1;                          // slot 1 = catcher
  st.heldTimer = 0; st.chaser = 1;
  st.playTimer = 0; st.pred = null;
  computeForces(st);
}
function cpuStealThink(st) {
  if (TUNE.CPU_STEAL_PCT <= 0) return;
  for (let base = 1; base <= 2; base++) {
    const r = st.bases[base]; if (!r) continue;
    if (st.bases[base + 1]) continue;
    const spd = r.player.ratings.spd;
    if (spd < 10) continue;
    if (spd < 11) continue;
    const chance = (((spd - 9) * 3 + (st.outs === 2 ? -6 : 0)) * TUNE.CPU_STEAL_PCT / 100) | 0;
    if (st.rng.range(100) < chance) { tryLaunchSteal(st, base); return; }
  }
}
function updateLeads(st, active) {
  // PREPITCH leads [DESIGN]: runners creep toward the next base; pickoff bait
  for (let base = 1; base <= 3; base++) {
    const r = st.bases[base]; if (!r) continue;
    if (active && st.phaseT > 40) r.leadS = Math.min(toSub(CONST.LEAD_MAX), (r.leadS || 0) + 130);
    else r.leadS = Math.max(0, (r.leadS || 0) - 220);
    const bc = GEO.bases[base], nc = GEO.bases[(base + 1) % 4];
    const d = Math.max(1, dist2d(bc.x, bc.y, nc.x, nc.y));
    const lead = (r.leadS || 0) / SUB;
    r.xS = toSub(Math.round(bc.x + (nc.x - bc.x) / d * lead));
    r.yS = toSub(Math.round(bc.y + (nc.y - bc.y) / d * lead));
  }
}
function pickoffThrow(st, base) {
  const r = st.bases[base]; if (!r) return;
  ev(st, 'pickoff', { base });
  st.phaseT = 0;                                       // resets the delay clock — buying time is legal
  const fullLead = (r.leadS || 0) >= toSub(CONST.LEAD_MAX) - 80;
  if (fullLead && st.rng.range(256) < CONST.PICKOFF_OUT_CHANCE) {
    st.bases[base] = null; r.state = 'out';
    st.runners = st.runners.filter(x => x !== r);
    st.outs++;
    ev(st, 'call:out', { kind: 'pickoff' });
    setBanner(st, 'PICKED OFF!', 70, '#ffb45a');
    if (st.outs >= 3) { st.phase = 'RESOLVE'; st.phaseT = 0; st.resolveDur = 70; st.resolveNext = 'halfEnd'; }
  } else {
    r.leadS = 0;
    setBanner(st, 'BACK IN TIME!', 34, '#c8d0e8');
  }
}
function gameTick(st, pads) {
  st.phaseT++;
  while (st.fx.length && st.frame - st.fx[0].f > 18) st.fx.shift();   // prune cosmetic fx
  const hb = humanBatting(st), hf = humanFielding(st);
  const bp = batPad(st), fp = fieldPad(st);
  if (st.walkupT > 0) st.walkupT--;
  if (st.mphT > 0) st.mphT--;
  switch (st.phase) {
    case 'PREPITCH': {
      updateLeads(st, true);
      batterBoxMove(st, pads);
      if (hb) {
        // steal command [v0.3]: A + target-base direction (U=2B L=3B D=home)
        if (pads[bp].pressed & BTN.A) {
          const h = pads[bp].held;
          const target = (h & BTN.UP) ? 2 : (h & BTN.LEFT) ? 3 : (h & BTN.DOWN) ? 4 : 0;
          if (target) tryLaunchSteal(st, target - 1);
        }
        st.batter.bunting = !!(pads[bp].held & BTN.A);
        if (!st.batter.bunting && (pads[bp].pressed & BTN.B)) startSwing(st);   // practice cut
      }
      else if (st.phaseT === 46) cpuStealThink(st);
      swingFrame(st);
      if (hf) {
        // pickoff: A + base direction (→1B ↑2B ←3B) [DESIGN on the original's pickoff interface]
        if (pads[fp].pressed & BTN.A) {
          const h = pads[fp].held;
          const base = (h & BTN.RIGHT) ? 1 : (h & BTN.UP) ? 2 : (h & BTN.LEFT) ? 3 : 0;
          if (base && st.bases[base]) pickoffThrow(st, base);
        }
        if (st.phase === 'PREPITCH' && (pads[fp].pressed & BTN.B)) startWindup(st, selectPitchType(pads[fp].held));
      }
      else cpuPitcherThink(st);
      if (st.phase === 'PREPITCH' && st.phaseT > st.phantomDeadline) { st.phase = 'PHANTOM'; st.phaseT = 0; ev(st, 'phantom'); }
      break;
    }
    case 'WINDUP':
      updateLeads(st, true);
      batterBoxMove(st, pads);
      if (hf && st.pitchInfo) {
        // [v0.6 P1-1] human pitch aim: d-pad L/R slides the release target during
        // the windup (type was the chord at B-press; aim is the windup job).
        // Scatter at release still applies — aim sets the TARGET, not the result.
        const ah = pads[fp].held;
        if (ah & BTN.LEFT) st.pitchInfo.targetX--;
        if (ah & BTN.RIGHT) st.pitchInfo.targetX++;
        st.pitchInfo.targetX = clamp(st.pitchInfo.targetX, CONST.PLATE_X - CONST.PITCH_AIM_RANGE, CONST.PLATE_X + CONST.PITCH_AIM_RANGE);
      }
      if (hb) {
        if (pads[bp].pressed & BTN.A) {                  // late steal window [v0.3]
          const h = pads[bp].held;
          const target = (h & BTN.UP) ? 2 : (h & BTN.LEFT) ? 3 : (h & BTN.DOWN) ? 4 : 0;
          if (target) tryLaunchSteal(st, target - 1);
        }
        st.batter.bunting = !!(pads[bp].held & BTN.A);
        if (!st.batter.bunting && (pads[bp].pressed & BTN.B)) startSwing(st);
      }
      swingFrame(st);
      if (st.phaseT >= CONST.WINDUP_FRAMES) releasePitch(st);
      break;
    case 'PITCH':
      batterBoxMove(st, pads);
      if (hb) {
        st.batter.bunting = !!(pads[bp].held & BTN.A);
        if (!st.batter.bunting && (pads[bp].pressed & BTN.B)) startSwing(st);
      }
      if (!hb) cpuBatterThink(st);
      if (st.batter.bunting && st.swing.state === 'idle') tryBunt(st);   // squared = attempting
      swingFrame(st);                       // contact can fire in here
      if (st.phase === 'PITCH') pitchFrame(st, pads);
      break;
    case 'BLANK':
      if (st.phaseT >= CONST.CONTACT_BLANK) { st.phase = 'LIVE'; setupLive(st); }
      break;
    case 'LIVE':
      swingFrame(st);
      liveFrame(st, pads);
      break;
    case 'PHANTOM':
      if (st.phaseT >= CONST.PHANTOM_ANIM) phantomResolve(st);
      break;
    case 'RESOLVE':
      if (st.phaseT >= (st.resolveDur || 55)) afterResolve(st);
      break;
  }
  // stealing runners keep moving through non-LIVE phases [v0.3]
  if (st.phase !== 'LIVE') {
    for (const r of st.runners) if (r.stealing && (r.state === 'run' || r.state === 'return')) runnerTick(st, r);
  }
}
function batterBoxMove(st, pads) {
  const bp = batPad(st);
  if (bp < 0) return;
  const h = pads[bp].held;
  const home = st.batter.hand === 'R' ? CONST.PLATE_X - CONST.HANDEDNESS_OFF : CONST.PLATE_X + CONST.HANDEDNESS_OFF;
  if (h & BTN.LEFT) st.batter.boxX--;      // 1 unit/frame within ±8 [PROVEN-adjacent]
  if (h & BTN.RIGHT) st.batter.boxX++;
  st.batter.boxX = clamp(st.batter.boxX, home - CONST.BOX_RANGE, home + CONST.BOX_RANGE);
}
