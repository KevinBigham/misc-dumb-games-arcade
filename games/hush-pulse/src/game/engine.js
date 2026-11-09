class GameLoop {
  constructor(hooks) {
    this.hooks = hooks;
  }
  hooks;
  /** Fixed step: 60Hz. */
  static STEP = 1 / 60;
  static MAX_FRAME = 0.25;
  // never catch up more than 250ms after a stall, to prevent the spiral of death
  acc = 0;
  last = 0;
  raf = 0;
  running = false;
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const frame = (now) => {
      if (!this.running) return;
      let delta = (now - this.last) / 1e3;
      this.last = now;
      if (delta > GameLoop.MAX_FRAME) delta = GameLoop.MAX_FRAME;
      this.acc += delta;
      while (this.acc >= GameLoop.STEP) {
        this.hooks.update(GameLoop.STEP);
        this.acc -= GameLoop.STEP;
      }
      this.hooks.render(this.acc / GameLoop.STEP);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
export {
  GameLoop
};
