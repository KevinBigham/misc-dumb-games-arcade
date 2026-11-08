import { INPUT_CONFIG } from "./config.js";
const KEYMAP = {
  KeyW: ["moveZ", 1],
  ArrowUp: ["moveZ", 1],
  KeyS: ["moveZ", -1],
  ArrowDown: ["moveZ", -1],
  KeyA: ["moveX", -1],
  ArrowLeft: ["moveX", -1],
  KeyD: ["moveX", 1],
  ArrowRight: ["moveX", 1]
};
class Input {
  constructor(target = document.body) {
    this.target = target;
    const on = (el, type, fn, opts) => {
      const handler = fn;
      el.addEventListener(type, handler, opts);
      this.unsubscribe.push(() => el.removeEventListener(type, handler, opts));
    };
    on(window, "keydown", (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      const m = KEYMAP[e.code];
      if (m || e.code === "ShiftLeft" || e.code === "ShiftRight") this.held.add(e.code);
      this.actions.add(e.code);
      this.recomputeAxes();
    });
    on(window, "keyup", (e) => {
      this.held.delete(e.code);
      this.recomputeAxes();
    });
    on(window, "blur", () => this.resetAll());
    on(document, "visibilitychange", () => {
      if (document.hidden) this.resetAll();
    });
    on(window, "mousemove", (e) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
      if (document.pointerLockElement || e.buttons > 0) {
        const sx = INPUT_CONFIG.MOUSE_SENS_X * (INPUT_CONFIG.INVERT_X ? -1 : 1);
        const sy = INPUT_CONFIG.MOUSE_SENS_Y * (INPUT_CONFIG.INVERT_Y ? -1 : 1);
        this.yawDelta -= e.movementX * sx;
        this.pitchDelta += -e.movementY * sy;
      }
    });
    on(target, "pointerdown", (e) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this.actions.add("MouseRight");
    });
    on(window, "pointerup", (e) => {
      if (e.button === 0) this.firing = false;
    });
    on(target, "contextmenu", (e) => e.preventDefault());
    on(target, "touchstart", (e) => this.onTouch(e, true), { passive: true });
    on(target, "touchmove", (e) => this.onTouch(e, false), { passive: true });
    on(target, "touchend", (e) => this.onTouchEnd(e), { passive: true });
    on(target, "touchcancel", (e) => this.onTouchEnd(e), { passive: true });
  }
  target;
  /** Normalized movement axes: moveX ∈ [-1,1] (left negative, right positive), moveZ ∈ [-1,1] (backward negative, forward positive). */
  moveX = 0;
  moveZ = 0;
  /** Camera delta for this frame (radians). Multiply by sensitivity and INVERT config when applying. */
  yawDelta = 0;
  pitchDelta = 0;
  /** Instantaneous actions (true on the frame the key is pressed; auto-cleared once consumed). */
  actions = /* @__PURE__ */ new Set();
  pointerX = window.innerWidth * 0.5;
  pointerY = window.innerHeight * 0.5;
  firing = false;
  hushForced = false;
  held = /* @__PURE__ */ new Set();
  touchMoveId = null;
  touchAimId = null;
  touchMoveOrigin = { x: 0, y: 0 };
  touchAimOrigin = { x: 0, y: 0 };
  /** Listener teardown — collected at construction so dispose() can unwind every subscription. */
  unsubscribe = [];
  /** Detach every listener and zero the axes — call it when the game is unmounted (see src/game/boot.ts). */
  dispose() {
    for (const off of this.unsubscribe) off();
    this.unsubscribe = [];
    this.actions.clear();
    this.resetAll();
  }
  onTouch(e, start) {
    const w = window.innerWidth;
    for (const t of Array.from(e.changedTouches)) {
      if (start) {
        if (t.clientX < w / 2 && this.touchMoveId === null) {
          this.touchMoveId = t.identifier;
          this.touchMoveOrigin = { x: t.clientX, y: t.clientY };
        } else if (t.clientX >= w / 2 && this.touchAimId === null) {
          this.touchAimId = t.identifier;
          this.touchAimOrigin = { x: t.clientX, y: t.clientY };
        }
      } else if (t.identifier === this.touchMoveId) {
        this.moveX = clamp((t.clientX - this.touchMoveOrigin.x) / 60, -1, 1);
        this.moveZ = clamp(-(t.clientY - this.touchMoveOrigin.y) / 60, -1, 1);
      } else if (t.identifier === this.touchAimId) {
        const sx = INPUT_CONFIG.MOUSE_SENS_X * (INPUT_CONFIG.INVERT_X ? -1 : 1);
        const sy = INPUT_CONFIG.MOUSE_SENS_Y * (INPUT_CONFIG.INVERT_Y ? -1 : 1);
        this.yawDelta -= (t.clientX - this.touchAimOrigin.x) * sx * 0.5;
        this.pitchDelta += -(t.clientY - this.touchAimOrigin.y) * sy * 0.5;
        this.touchAimOrigin = { x: t.clientX, y: t.clientY };
      }
    }
  }
  onTouchEnd(e) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === this.touchMoveId) {
        this.touchMoveId = null;
        this.recomputeAxes();
      } else if (t.identifier === this.touchAimId) {
        this.touchAimId = null;
      }
    }
  }
  resetAll() {
    this.held.clear();
    this.firing = false;
    this.touchMoveId = null;
    this.touchAimId = null;
    this.yawDelta = 0;
    this.pitchDelta = 0;
    this.recomputeAxes();
  }
  isHeld(code) {
    return this.held.has(code);
  }
  recomputeAxes() {
    let x = 0, z = 0;
    for (const code of this.held) {
      const m = KEYMAP[code];
      if (m) {
        if (m[0] === "moveX") x += m[1];
        else z += m[1];
      }
    }
    this.moveX = clamp(x, -1, 1);
    this.moveZ = clamp(z, -1, 1);
  }
  /** Consume the camera delta before each frame render (take and zero it). */
  consumeLook() {
    const r = { yaw: this.yawDelta, pitch: this.pitchDelta };
    this.yawDelta = 0;
    this.pitchDelta = 0;
    return r;
  }
  /** Consume an instantaneous action: was this key pressed during the current frame. */
  consumeAction(code) {
    const has = this.actions.has(code);
    if (has) this.actions.delete(code);
    return has;
  }
}
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
export {
  Input
};
