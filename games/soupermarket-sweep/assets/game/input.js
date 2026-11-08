/**
 * input.ts — keyboard/mouse + touch input. **Control-mapping conventions are fixed** (the most
 * frequent playtest defect is a reversed direction mapping):
 *
 *   W / ArrowUp    = move forward (moveZ = +1)
 *   S / ArrowDown  = move backward (moveZ = -1)
 *   A / ArrowLeft  = move left (moveX = -1)
 *   D / ArrowRight = move right (moveX = +1)
 *
 *   Mouse moving right => camera/crosshair turns right (yaw decreases, right-handed convention;
 *                          if you need it inverted, explicitly enable INVERT_* in config)
 *   Mouse moving up    => camera looks up (pitch increases)
 *   Touch left stick   = same directions as WASD; right-side drag = same as mouse
 *
 * When changing these conventions you must also update the direction assertions in scripts/verify-game.mjs.
 */
import { INPUT_CONFIG } from "./config.js";
const KEYMAP = {
    KeyW: ["moveZ", 1], ArrowUp: ["moveZ", 1],
    KeyS: ["moveZ", -1], ArrowDown: ["moveZ", -1],
    KeyA: ["moveX", -1], ArrowLeft: ["moveX", -1],
    KeyD: ["moveX", 1], ArrowRight: ["moveX", 1],
};
export class Input {
    target;
    /** Normalized movement axes: moveX ∈ [-1,1] (left negative, right positive), moveZ ∈ [-1,1] (backward negative, forward positive). */
    moveX = 0;
    moveZ = 0;
    /** Camera delta for this frame (radians). Multiply by sensitivity and INVERT config when applying. */
    yawDelta = 0;
    pitchDelta = 0;
    /** Instantaneous actions (true on the frame the key is pressed; auto-cleared once consumed). */
    actions = new Set();
    held = new Set();
    touchMoveId = null;
    touchAimId = null;
    touchMoveOrigin = { x: 0, y: 0 };
    touchAimOrigin = { x: 0, y: 0 };
    /** Listener teardown — collected at construction so dispose() can unwind every subscription. */
    unsubscribe = [];
    constructor(target = document.body) {
        this.target = target;
        const on = (el, type, fn, opts) => {
            const handler = fn;
            el.addEventListener(type, handler, opts);
            this.unsubscribe.push(() => el.removeEventListener(type, handler, opts));
        };
        on(window, "keydown", (e) => {
            if (e.repeat)
                return;
            const m = KEYMAP[e.code];
            if (m)
                this.held.add(e.code);
            this.actions.add(e.code); // e.g. "KeyE" / "Escape" / "Space" are consumed directly by code
            this.recomputeAxes();
        });
        on(window, "keyup", (e) => {
            this.held.delete(e.code);
            this.recomputeAxes();
        });
        // Focus loss must release everything: a keyup that happens while unfocused never arrives,
        // otherwise the character keeps walking by itself after Alt-Tab.
        on(window, "blur", () => this.resetAll());
        on(document, "visibilitychange", () => { if (document.hidden)
            this.resetAll(); });
        on(window, "mousemove", (e) => {
            if (document.pointerLockElement || e.buttons > 0) {
                const sx = INPUT_CONFIG.MOUSE_SENS_X * (INPUT_CONFIG.INVERT_X ? -1 : 1);
                const sy = INPUT_CONFIG.MOUSE_SENS_Y * (INPUT_CONFIG.INVERT_Y ? -1 : 1);
                // mouse right => camera right (yaw decreases in a right-handed system); mouse up => camera up (pitch increases)
                this.yawDelta -= e.movementX * sx;
                this.pitchDelta += -e.movementY * sy;
            }
        });
        on(target, "touchstart", (e) => this.onTouch(e, true), { passive: true });
        on(target, "touchmove", (e) => this.onTouch(e, false), { passive: true });
        on(target, "touchend", (e) => this.onTouchEnd(e), { passive: true });
        on(target, "touchcancel", (e) => this.onTouchEnd(e), { passive: true });
    }
    /** Detach every listener and zero the axes — call it when the game is unmounted (see src/game/boot.ts). */
    dispose() {
        for (const off of this.unsubscribe)
            off();
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
                }
                else if (t.clientX >= w / 2 && this.touchAimId === null) {
                    this.touchAimId = t.identifier;
                    this.touchAimOrigin = { x: t.clientX, y: t.clientY };
                }
            }
            else if (t.identifier === this.touchMoveId) {
                // left stick: push up = forward (+moveZ), push right = right (+moveX), exactly matching WASD
                this.moveX = clamp((t.clientX - this.touchMoveOrigin.x) / 60, -1, 1);
                this.moveZ = clamp(-(t.clientY - this.touchMoveOrigin.y) / 60, -1, 1);
            }
            else if (t.identifier === this.touchAimId) {
                const sx = INPUT_CONFIG.MOUSE_SENS_X * (INPUT_CONFIG.INVERT_X ? -1 : 1);
                const sy = INPUT_CONFIG.MOUSE_SENS_Y * (INPUT_CONFIG.INVERT_Y ? -1 : 1);
                this.yawDelta -= (t.clientX - this.touchAimOrigin.x) * sx * 0.5;
                this.pitchDelta += -(t.clientY - this.touchAimOrigin.y) * sy * 0.5;
                this.touchAimOrigin = { x: t.clientX, y: t.clientY };
            }
        }
    }
    onTouchEnd(e) {
        // Each lifted finger releases only its own stick — lifting the aim hand must not kill movement.
        for (const t of Array.from(e.changedTouches)) {
            if (t.identifier === this.touchMoveId) {
                this.touchMoveId = null;
                this.recomputeAxes(); // fall back to whatever the keyboard still holds (usually nothing)
            }
            else if (t.identifier === this.touchAimId) {
                this.touchAimId = null;
            }
        }
    }
    resetAll() {
        this.held.clear();
        this.touchMoveId = null;
        this.touchAimId = null;
        this.yawDelta = 0;
        this.pitchDelta = 0;
        this.recomputeAxes();
    }
    recomputeAxes() {
        let x = 0, z = 0;
        for (const code of this.held) {
            const m = KEYMAP[code];
            if (m) {
                if (m[0] === "moveX")
                    x += m[1];
                else
                    z += m[1];
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
        if (has)
            this.actions.delete(code);
        return has;
    }
}
function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
}
