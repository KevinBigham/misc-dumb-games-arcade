/* ════════════════ SECTION §J — SHELL: fixed-timestep loop, canvas, keyboard ════════════════ */
// Fixed 60.0988 Hz accumulator [PROVEN cadence]. Simulation only advances in
// whole ticks; rendering happens per animation frame (no interpolation —
// "authentic feel" mode is the only mode in the demo).
const Shell = {
  state: null, bus: null, canvas: null, ctx: null,
  acc: 0, last: 0, paused: false, idleT: 0,
  boot() {
    const cv = document.getElementById('mbd-canvas');
    cv.width = VIEW_W; cv.height = VIEW_H;
    this.canvas = cv; this.ctx = cv.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.bus = new InputBus();
    this.state = newGame({});
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  },
  onKey(e, down) {
    if (e.repeat) { e.preventDefault(); return; }
    AudioSys.init();
    if (this.state && this.state.demo && down) {   // any key exits attract mode
      this.state = newGame({}); this.bus = new InputBus(); e.preventDefault(); return;
    }
    if (e.code === 'Escape' && down) { this.paused = !this.paused; e.preventDefault(); return; }
    const bit = KEYMAP[e.code], bit2 = KEYMAP2[e.code];
    if (bit === undefined && bit2 === undefined) return;
    e.preventDefault();
    if (bit !== undefined) { if (down) { this.bus.raw[0] |= bit; this.idleT = 0; } else this.bus.raw[0] &= ~bit; }
    if (bit2 !== undefined) { if (down) { this.bus.raw[1] |= bit2; this.idleT = 0; } else this.bus.raw[1] &= ~bit2; }
  },
  frame(now) {
    const SPF = 1000 / CONST.FPS;
    let dt = now - this.last; this.last = now;
    if (dt > 250) dt = 250;                        // tab-away guard
    if (!this.paused) this.acc += dt;
    let steps = 0;
    while (this.acc >= SPF && steps < 4) {
      this.acc -= SPF; steps++;
      const frames = this.bus.latch();
      const r = tick(this.state, frames);
      AudioSys.consume(this.state.events, this.state);
      if (r === 'RESET') { this.state = newGame({}); this.bus = new InputBus(); break; }
      // attract mode: menu pick or 15 s idle on title → CPU-vs-CPU demo game
      if (r === 'DEMO' || (this.state.scene === 'TITLE' && this.state.sceneT > 60 * 15)) {
        this.state = newGame({ scene: 'GAME', demo: true, seed: [9, 9, 9, 9, 9] });
        this.state.scene = 'GAME'; startHalf(this.state);
      }
    }
    render(this.ctx, this.state);
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.55)'; this.ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      centerText(this.ctx, 'PAUSE', 104, '#f8f8f2', 2);
      centerText(this.ctx, 'ESC TO RESUME', 126, '#9aa0b8', 1);
    }
    requestAnimationFrame((t) => this.frame(t));
  },
};

/* ════════════════ SECTION §K — TESTHOOKS (node/headless) ════════════════ */
const MBD = {
  version: '0.6.0',
  CONST, TUNE, GEO, TABLE16, PITCH_TYPES, LAUNCH, FIELD_POS, BTN,
  RNG, InputBus, buildTeams,
  toSub, toInt, vecFromAngle, degToSteps,
  newBall, ballStep, predictLanding, computeLaunch, applyContact, setThrow,
  newGame, tick, startHalf, startWindup, releasePitch, startSwing, selectPitchType,
  battingTeam, fieldingTeam, lineup,
  // rules-engine hooks for test labs
  awardWalk, newPA, recordPAOut, scoreRun, endLivePlay, foulBall, computeForces, makeRunner,
};
if (typeof globalThis !== 'undefined') globalThis.MBD = MBD;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => Shell.boot());
  else Shell.boot();
}
