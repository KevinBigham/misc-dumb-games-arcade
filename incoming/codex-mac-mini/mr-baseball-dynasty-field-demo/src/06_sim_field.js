/* ════════════════ SECTION §F3 — FIELDING, RUNNERS, LIVE PLAY, CPU, MASTER TICK ════════════════ */

/* ── runners ── */
function makeRunner(st, player, fromBase) {
  const bc = GEO.bases[fromBase];
  const r = {
    player, fromBase, toBase: fromBase + 1,
    xS: toSub(bc.x), yS: toSub(bc.y),
    state: 'run', forced: false,
    speedS: TABLE16.runSpeed[player.ratings.spd],
    isBatter: fromBase === 0, leadS: 0, slideT: 0,
  };
  st.runners.push(r);
  return r;
}
function activeRunners(st) { return st.runners.filter(r => r.state === 'run' || r.state === 'return'); }
function throwFrames(xS, yS, base) {
  const bc = GEO.bases[base % 4];
  return dist2d(toInt(xS), toInt(yS), bc.x, bc.y) / TUNE.THROW_SPEED + 6;
}
// [v0.3] full defensive ETA: if nobody has the ball yet, the chaser still has
// to REACH it — that time belongs in every runner's send/greed decision
function defenseETA(st, base) {
  const b = st.ball;
  let t = throwFrames(b.xS, b.yS, base);
  if (b.heldBy < 0) {
    const ch = st.fielders[st.chaser];
    if (ch) t += dist2d(toInt(ch.xS), toInt(ch.yS), toInt(b.xS), toInt(b.yS)) / (ch.maxS / SUB) + 10;
    else t += 40;
  }
  return t;
}
function runnerETA(r, base) {
  const bc = GEO.bases[base % 4];
  return dist2d(toInt(r.xS), toInt(r.yS), bc.x, bc.y) / (r.speedS / SUB);
}
function computeForces(st) {
  // classic force chain from the batter-runner
  const batterRunning = st.runners.some(r => r.isBatter && r.state === 'run');
  let chain = batterRunning;
  for (let b = 1; b <= 3; b++) {
    const r = st.bases[b];
    if (r) { r.forced = chain; } else chain = false;
  }
  for (const r of st.runners) if (r.state === 'run' && !r.isBatter) {
    // a runner already moving keeps the force it left with
  }
  if (batterRunning) { const br = st.runners.find(r => r.isBatter); if (br) br.forced = true; }
}
function runnerTick(st, r) {
  if (r.state !== 'run' && r.state !== 'return') return;
  const destBase = r.state === 'run' ? (r.toBase % 4) : r.fromBase;
  const bc = GEO.bases[destBase];
  const dx = toSub(bc.x) - r.xS, dy = toSub(bc.y) - r.yS;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= r.speedS || d < 10 * SUB / 8) {
    r.xS = toSub(bc.x); r.yS = toSub(bc.y);
    if (r.state === 'run' && r.toBase >= 4) { scoreRun(st, r); return; }
    // arrival: greed check for another base (unheld outfield ball only)
    const b = st.ball;
    let greed = false;
    if (r.state === 'run' && r.toBase < 4 && b.heldBy < 0 && b.mode !== 'dead' &&
        (b.mode === 'rolling' || b.mode === 'settled' || b.touchedGround)) {
      const nb = r.toBase + 1;
      const defT = defenseETA(st, nb) + 26;
      const runT = CONST.BASE_DIST / (r.speedS / SUB);
      if (toInt(b.yS) < 2350 && runT + 40 < defT && !(nb < 4 && st.bases[nb])) greed = true;   // [v0.6] was +32 — throws travel now
    }
    if (greed) { r.fromBase = r.toBase; r.toBase++; r.forced = false; ev(st, 'advance'); return; }
    const wasRun = r.state === 'run';
    const settleBase = wasRun ? r.toBase : r.fromBase;
    r.fromBase = settleBase; r.toBase = settleBase + 1;
    r.state = 'onbase'; st.bases[settleBase] = r; r.forced = false;
    if (r.stealing) {                                  // steal complete: SAFE [v0.3]
      r.stealing = false;
      r.speedS = TABLE16.runSpeed[r.player.ratings.spd];
      // [v0.7] only an arrival at the TARGET base is a stolen base — a thief
      // tagging back to his own bag on a caught fly is not SAFE! (the tag-up
      // recall was dead code until the isBatter fix, so this never fired)
      if (wasRun) {
        setBanner(st, 'SAFE! STOLEN BASE!', 55, '#8fe08f');
        ev(st, 'stolen', { base: settleBase });
      }
    }
    if (r.isBatter && st.batterResult === null) st.batterResult = st.playErr ? 'E' : (settleBase === 1 ? '1B' : settleBase === 2 ? '2B' : '3B');
    return;
  }
  const inv = r.speedS / d;
  r.xS += Math.round(dx * inv); r.yS += Math.round(dy * inv);
}
function decideRunners(st) {
  const b = st.ball;
  const flying = b.mode === 'flight' && !b.touchedGround && b.batted;
  // [v0.6] gap read: a deep fly the defense can't reach is a sure hit — runners
  // go on contact (1st→3rd, 2nd→home) instead of freezing through the flight
  let willDrop = false;
  if (flying && st.pred && st.pred.tGround > 0 && GEO.distFromPlate(st.pred.x, st.pred.y) > 1150) {
    let bestT = 1e9;
    for (const f of st.fielders) bestT = Math.min(bestT, dist2d(toInt(f.xS), toInt(f.yS), st.pred.x, st.pred.y) / (f.maxS / SUB) + 18);
    willDrop = st.pred.tGround + 12 < bestT;
  }
  for (let base = 3; base >= 1; base--) {
    const r = st.bases[base]; if (!r) continue;
    const nextBase = base + 1;
    if (nextBase < 4 && st.bases[nextBase]) continue;          // blocked ahead
    if (r.forced) {
      if (!flying || st.outs >= 2 || willDrop) { st.bases[base] = null; r.state = 'run'; r.toBase = nextBase; ev(st, 'go'); }
      continue;
    }
    if (flying) {
      // [v0.6] run on contact with 2 outs — the missing 100+ frames of ball
      // flight were why runners on 2B almost never scored on singles
      if (st.outs >= 2 || willDrop) { st.bases[base] = null; r.state = 'run'; r.toBase = nextBase; ev(st, 'go'); }
      continue;                                        // else hold on flies (tag-up handled at catch)
    }
    if (b.mode === 'dead' || b.heldBy >= 0) continue;
    const defT = defenseETA(st, nextBase) + 20;
    const runT = runnerETA(r, nextBase);
    if (runT + 30 < defT) { st.bases[base] = null; r.state = 'run'; r.toBase = nextBase; r.forced = false; ev(st, 'go'); }   // [v0.6] was +22 — throws travel now; dumb sends erase rallies
  }
}
function recordRunnerOut(st, r, kind) {
  r.state = 'out'; st.outs++; st.playOuts++;
  if (r.isBatter && !st.batterResult) st.batterResult = 'OUT';
  ev(st, 'call:out', { kind });
  if (st.outs >= 3) endLivePlay(st, 'sideRetired');
}

/* ── fielding ── */
function pickChaser(st, force) {
  if (!force && st.frame < st.chaserLockF) return;    // manual switch holds control [v0.3]
  const pred = st.pred || predictLanding(st.ball);
  let best = -1, bestT = 1e9, curT = 1e9;
  for (let i = 0; i < st.fielders.length; i++) {
    const f = st.fielders[i];
    const t = dist2d(toInt(f.xS), toInt(f.yS), pred.x, pred.y) / (f.maxS / SUB) + 18;
    if (t < bestT) { bestT = t; best = i; }
    if (i === st.chaser) curT = t;
  }
  // [v0.4] hysteresis: only reassign when clearly better — kills the two-fielder
  // oscillation where control flip-flops and BOTH keep braking ("stuck" look)
  if (!force && st.chaser >= 0 && bestT > curT * 0.8) return;
  st.chaser = best;
}
function fielderTick(st, f, idx, pads) {
  if (f.bobbleT > 0) f.bobbleT--;
  const b = st.ball;
  const holder = b.heldBy === idx;
  // ── dive / prone states [DESIGN, per the original's contextual B fielding action] ──
  if (f.proneT > 0) { f.proneT--; f.speedS = 0; return; }        // recovering — helpless
  const diving = f.diveT > 0;
  if (diving) {
    f.diveT--;
    f.xS += Math.round(f.diveDx * CONST.DIVE_SPEED * SUB);
    f.yS += Math.round(f.diveDy * CONST.DIVE_SPEED * SUB);
    if (f.diveT === 0) { f.proneT = CONST.DIVE_PRONE; ev(st, 'divemiss'); }  // cleared on a grab below
  }
  // ── target selection ──
  let tx = f.homeX, ty = f.homeY;
  if (st.phase === 'LIVE') {
    if (holder) {
      tx = toInt(f.xS); ty = toInt(f.yS);
      // unassisted force: run to a nearby force base if we beat the runner [DESIGN]
      let hasPlay = false;
      for (const r of activeRunners(st)) {
        if (r.state !== 'run' || !r.forced) continue;
        const bc = GEO.bases[r.toBase % 4];
        const dMe = dist2d(toInt(f.xS), toInt(f.yS), bc.x, bc.y);
        if (dMe < 260 && dMe / (f.maxS / SUB) + 8 < runnerETA(r, r.toBase)) { tx = bc.x; ty = bc.y; hasPlay = true; break; }
      }
      // [v0.4 STUCK-FIELDER FIX] nothing at hand + runners loose → RUN THE BALL IN
      // (shrinks every throw distance until a play opens or the play dies)
      if (!hasPlay && st.heldTimer > 40 && activeRunners(st).length) { tx = GEO.mound.x; ty = GEO.mound.y; }
    } else if (b.mode === 'throw' && f.coverBase === b.throwTarget) {
      // [v0.6 FIX] the -1 return-to-pitcher sentinel = the mound (was GEO.bases[-1] crash)
      const bc = b.throwTarget === -1 ? GEO.mound : GEO.bases[b.throwTarget % 4]; tx = bc.x; ty = bc.y;
    } else if (idx === st.chaser && b.heldBy < 0) {
      const pred = st.pred; if (pred) { tx = pred.x; ty = pred.y; }
      else { tx = toInt(b.xS); ty = toInt(b.yS); }
    } else if (f.coverBase >= 0) {
      const incoming = activeRunners(st).some(r => (r.toBase % 4) === f.coverBase) || (b.mode === 'throw' && b.throwTarget === f.coverBase);
      if (incoming || st.runners.length) { const bc = GEO.bases[f.coverBase]; tx = bc.x; ty = bc.y; }
    }
  }
  // ── movement: measured accel/brake model [MEASURED/PROVEN] ──
  if (!diving) {
    let mvx = 0, mvy = 0, manual = false;
    const fp = fieldPad(st);
    if (st.phase === 'LIVE' && fp >= 0 && idx === st.chaser) {
      const h = pads[fp].held;
      let ix = (h & BTN.RIGHT ? 1 : 0) - (h & BTN.LEFT ? 1 : 0);
      let iy = (h & BTN.DOWN ? 1 : 0) - (h & BTN.UP ? 1 : 0);
      if (ix || iy) { manual = true; mvx = ix; mvy = iy; }
    }
    if (!manual) {
      const dx = tx - toInt(f.xS), dy = ty - toInt(f.yS);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) { mvx = dx / d; mvy = dy / d; }
    }
    if (mvx || mvy) {
      f.speedS = f.speedS === 0 ? CONST.FLD_START : Math.min(f.maxS, f.speedS + CONST.FLD_ACCEL);
      let sp = f.speedS;
      if (manual && mvx && mvy) sp = (sp * CONST.DIAG_NUM) >> 8; // exact diagonal norm [PROVEN]
      if (f.bobbleT > 0) sp = sp >> 1;
      f.xS += Math.round(mvx * sp); f.yS += Math.round(mvy * sp);
      if (mvx) f.faceL = mvx < 0;
      f.anim++;
    } else {
      f.speedS = Math.max(0, f.speedS - CONST.FLD_BRAKE);        // brake = 2× accel [PROVEN]
      if (f.speedS > 0) f.anim++;
    }
    // CPU auto-dive: chaser lunges when the intercept is just out of reach
    if (idx === st.chaser && fp < 0 && st.phase === 'LIVE' && b.heldBy < 0 &&
        (b.mode === 'flight' || b.mode === 'throw') && b.batted && !b.touchedGround) {
      const zi0 = toInt(b.zS);
      const dd0 = dist2d(toInt(f.xS), toInt(f.yS), toInt(b.xS), toInt(b.yS));
      if (zi0 < 52 && b.vzS < 0 && dd0 > TUNE.CATCH_RADIUS + 4 && dd0 < 44) {
        f.diveT = CONST.DIVE_FRAMES;
        const dxb = toInt(b.xS) - toInt(f.xS), dyb = toInt(b.yS) - toInt(f.yS);
        const dl = Math.max(1, Math.sqrt(dxb * dxb + dyb * dyb));
        f.diveDx = dxb / dl; f.diveDy = dyb / dl; f.faceL = dxb < 0;
        if (st.fx.length < 12) st.fx.push({ k: 'dust', x: toInt(f.xS), y: toInt(f.yS), f: st.frame });
        ev(st, 'dive');
      }
    }
  }
  f.xS = clamp(f.xS, toSub(20), toSub(CONST.WORLD_W - 20));
  f.yS = clamp(f.yS, toSub(120), toSub(CONST.WORLD_H - 20));
  // ── catch / pickup ──
  if (st.phase !== 'LIVE' || b.heldBy >= 0 || b.mode === 'dead') return;
  const d = dist2d(toInt(f.xS), toInt(f.yS), toInt(b.xS), toInt(b.yS));
  const zi = toInt(b.zS);
  const reach = TUNE.CATCH_RADIUS + (diving ? CONST.DIVE_REACH : 0);
  const zReach = TUNE.CATCH_Z + (diving ? 12 : 0);
  if ((b.mode === 'flight' || b.mode === 'throw') && !b.touchedGround && zi <= zReach && d <= reach &&
      !(b.mode === 'throw' && idx === b.thrownBy && b.t < 2)) {   // [v0.6] a thrower never fields his own throw — throws must TRAVEL (they never did)
    if (b.mode === 'throw') {
      b.heldBy = idx; b.mode = 'held'; st.heldTimer = 0; st.chaser = idx;
      f.proneT = 0; f.diveT = 0;
      ev(st, 'catchpop');
      forceTagCheck(st, idx, true);
    } else if (b.batted) {
      // FLYOUT
      b.heldBy = idx; b.mode = 'held'; st.heldTimer = 0; st.chaser = idx;
      f.proneT = diving ? 10 : 0; f.diveT = 0;                   // snow-cone pop-up
      ev(st, 'catch'); ev(st, 'flyout');
      setBanner(st, 'CAUGHT!', 55, '#ffb45a');
      const br = st.runners.find(r => r.isBatter && r.state === 'run');
      if (br) { br.state = 'out'; st.outs++; st.playOuts++; if (!st.batterResult) st.batterResult = 'FLYOUT'; }
      const catchDist = GEO.distFromPlate(toInt(b.xS), toInt(b.yS));
      for (const r of st.runners) {
        if (r.isBatter || r.state !== 'run') continue;
        r.state = 'return';                                   // tag back
      }
      if (st.outs < 3) {
        const third = st.bases[3];
        if (third && catchDist > 1500) { st.bases[3] = null; third.state = 'run'; third.toBase = 4; third.forced = false; ev(st, 'tagup'); }
        const second = st.bases[2];   // [v0.3] deep sac advances 2B→3B too
        if (second && !st.bases[3] && catchDist > 1750) { st.bases[2] = null; second.state = 'run'; second.toBase = 3; second.forced = false; ev(st, 'tagup'); }
      }
      if (st.outs >= 3) endLivePlay(st, 'sideRetired');
    }
    return;
  }
  if ((b.mode === 'rolling' || b.mode === 'settled' || (b.mode === 'flight' && b.touchedGround)) && zi <= 24 && d <= CONST.PICKUP_RADIUS + (diving ? 6 : 0)) {
    if (f.bobbleT > 0) return;
    if (diving) { f.diveT = 0; f.proneT = 8; }
    const def = f.player ? f.player.ratings.def : 8;
    const hot = Math.abs(b.vxS) + Math.abs(b.vyS) > 900;
    // [v0.6] errors were ~0.08/game (most defenders rolled a flat 0 chance) —
    // with throws now traveling, ground-ball DPs erased every rally. Realistic
    // miscue rates bring back offense AND inning drama.
    const chance = hot ? Math.max(0, 14 - def) * 6 : Math.max(0, 12 - def) * 3;
    if (st.rng.range(256) < chance) {
      f.bobbleT = 26;
      if (!st.playErr) { st.playErr = true; st.errs[fieldingTeam(st)]++; }
      b.vxS = (st.rng.range(400) - 200); b.vyS = (st.rng.range(400) - 200); b.mode = 'rolling';
      ev(st, 'error'); setBanner(st, 'BOBBLED!', 40, '#ff8a7a');
      return;
    }
    b.heldBy = idx; b.mode = 'held'; b.vxS = b.vyS = b.vzS = 0; st.heldTimer = 0; st.chaser = idx;
    ev(st, 'pickup');
    forceTagCheck(st, idx, false);
  }
}
function forceTagCheck(st, idx, fromThrow) {
  const f = st.fielders[idx];
  const fx = toInt(f.xS), fy = toInt(f.yS);
  // force outs: fielder w/ ball standing at a base a forced runner needs
  for (let b = 0; b <= 3; b++) {
    const bc = GEO.bases[b];
    if (dist2d(fx, fy, bc.x, bc.y) > 14) continue;
    for (const r of activeRunners(st)) {
      if (r.state !== 'run' || !r.forced) continue;
      if ((r.toBase % 4) !== b) continue;
      recordRunnerOut(st, r, 'force');
      setBanner(st, 'OUT!', 45, '#ffb45a');
      if (st.phase !== 'LIVE') return;
    }
  }
  // tags: any off-base runner in reach
  for (const r of activeRunners(st)) {
    if (dist2d(fx, fy, toInt(r.xS), toInt(r.yS)) <= 14) {
      recordRunnerOut(st, r, 'tag');
      setBanner(st, 'TAGGED OUT!', 45, '#ffb45a');
      if (st.phase !== 'LIVE') return;
    }
  }
}
function coveringFielder(st, base, exclude) {
  let best = -1, bestD = 1e9;
  for (let i = 0; i < st.fielders.length; i++) {
    if (i === exclude) continue;                        // [v0.6] never "cover" a base with the thrower himself
    if (i === st.chaser && st.ball.heldBy !== i) continue;
    const f = st.fielders[i];
    const bc = GEO.bases[base % 4];
    const d = dist2d(toInt(f.xS), toInt(f.yS), bc.x, bc.y);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}
function doThrow(st, base) {
  const b = st.ball, idx = b.heldBy;
  if (idx < 0) return;
  const f = st.fielders[idx];
  const toMound = base === -1;
  const target = { x: (toMound ? GEO.mound : GEO.bases[base % 4]).x, y: (toMound ? GEO.mound : GEO.bases[base % 4]).y };
  let rec;
  if (toMound) rec = 0;                            // fielder slot 0 = P
  else { rec = coveringFielder(st, base, idx); if (rec >= 0) st.fielders[rec].coverBase = base % 4; }
  // [v0.6] throwing errors: low-def arms and long OF throws sometimes sail —
  // the miss lands past/beside the bag and the play stays alive (unearned-run drama)
  if (!toMound) {
    const def = f.player ? f.player.ratings.def : 8;
    const d = dist2d(toInt(f.xS), toInt(f.yS), target.x, target.y);
    const errChance = Math.max(0, 11 - def) * 4 + (d > 1200 ? 4 : 0);
    if (st.rng.range(256) < errChance) {
      const side = st.rng.range(2) ? 1 : -1;
      target.x += side * (60 + st.rng.range(120));
      target.y += (st.rng.range(2) ? 1 : -1) * (40 + st.rng.range(60));
      if (!st.playErr) { st.playErr = true; st.errs[fieldingTeam(st)]++; }
      setBanner(st, 'ERRANT THROW!', 50, '#ff8a7a');
      ev(st, 'error', { throwing: true });
    }
  }
  b.batted = false; b.throwTarget = toMound ? -1 : base % 4;
  b.thrownBy = idx;                                  // render-only: throw pose [v0.3]
  setThrow(b, f.xS, f.yS, target, (t, d) => ev(st, t, d));
  if (rec >= 0) st.chaser = rec;
}
function returnBallToPitcher(st) {
  const b = st.ball;
  if (b.heldBy >= 0 && st.fielders[b.heldBy].posId === 'P') { endLivePlay(st, 'settled'); return; }
  doThrow(st, -1);   // -1 sentinel → mound
}
