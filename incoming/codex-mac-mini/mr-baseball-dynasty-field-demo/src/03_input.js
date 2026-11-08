/* ════════════════ SECTION §E — INPUT: held / pressed / released frames ════════════════ */
// One normalized InputFrame per pad per tick [PROVEN pattern]:
//   pressed = held & ~previous  (rising edges — swing/pitch/throw use these)
const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, B: 16, A: 32, START: 64 };

function InputBus() {
  this.raw = [0, 0];          // live hardware state (browser writes; node scripts write)
  this.prev = [0, 0];
  this.frames = [
    { held: 0, pressed: 0, released: 0 },
    { held: 0, pressed: 0, released: 0 },
  ];
}
InputBus.prototype.latch = function () {   // call exactly once per sim tick
  for (let p = 0; p < 2; p++) {
    const cur = this.raw[p], prev = this.prev[p];
    const f = this.frames[p];
    f.held = cur; f.pressed = cur & ~prev; f.released = prev & ~cur;
    this.prev[p] = cur;
  }
  return this.frames;
};

// Browser keyboard maps — P1 (pad 0) and P2 (pad 1, for 2P VS mode)
const KEYMAP = {
  ArrowUp: BTN.UP, ArrowDown: BTN.DOWN, ArrowLeft: BTN.LEFT, ArrowRight: BTN.RIGHT,
  KeyW: BTN.UP, KeyS: BTN.DOWN, KeyA: BTN.LEFT, KeyD: BTN.RIGHT,
  KeyZ: BTN.B, Space: BTN.B, KeyX: BTN.A, ShiftLeft: BTN.A,
  Enter: BTN.START,
};
const KEYMAP2 = {
  KeyI: BTN.UP, KeyK: BTN.DOWN, KeyJ: BTN.LEFT, KeyL: BTN.RIGHT,
  KeyN: BTN.B, KeyM: BTN.A, Backslash: BTN.START,
};
