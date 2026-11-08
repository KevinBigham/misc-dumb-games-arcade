/**
 * engine.ts — fixed-timestep game loop (decoupled from frame rate) + pooled frame state.
 * All gameplay logic advances at a fixed step in update(dt); rendering runs with interpolation in render(alpha).
 */
export class GameLoop {
    hooks;
    /** Fixed step: 60Hz. */
    static STEP = 1 / 60;
    static MAX_FRAME = 0.25; // never catch up more than 250ms after a stall, to prevent the spiral of death
    acc = 0;
    last = 0;
    raf = 0;
    running = false;
    constructor(hooks) {
        this.hooks = hooks;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.last = performance.now();
        const frame = (now) => {
            if (!this.running)
                return;
            let delta = (now - this.last) / 1000;
            this.last = now;
            if (delta > GameLoop.MAX_FRAME)
                delta = GameLoop.MAX_FRAME;
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
