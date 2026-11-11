const MOVEMENT = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]);
const CAPTURED = new Set([...MOVEMENT, "Space", "Escape", "KeyP", "KeyM", "KeyR"]);
export class Input {
  moveX = 0; moveZ = 0; pointerX = innerWidth * 0.5; pointerY = innerHeight * 0.5;
  pointerDown = false; chargeReleased = false;
  private held = new Set<string>(); private pressed = new Set<string>(); private off: Array<() => void> = [];
  constructor(private canvas: HTMLCanvasElement) {
    const on = <T extends Event>(el: Window | HTMLElement, type: string, fn: (event: T) => void, options?: AddEventListenerOptions) => {
      const handler = fn as EventListener; el.addEventListener(type, handler, options); this.off.push(() => el.removeEventListener(type, handler, options));
    };
    on<KeyboardEvent>(window, "keydown", (e) => { if (CAPTURED.has(e.code)) e.preventDefault(); if (!e.repeat) this.pressed.add(e.code); this.held.add(e.code); this.updateAxes(); });
    on<KeyboardEvent>(window, "keyup", (e) => { if (CAPTURED.has(e.code)) e.preventDefault(); this.held.delete(e.code); if (e.code === "Space") this.chargeReleased = true; this.updateAxes(); });
    on<PointerEvent>(canvas, "pointermove", (e) => { this.pointerX = e.clientX; this.pointerY = e.clientY; });
    on<PointerEvent>(canvas, "pointerdown", (e) => { if (e.button !== 0) return; this.pointerX = e.clientX; this.pointerY = e.clientY; this.pointerDown = true; this.canvas.setPointerCapture?.(e.pointerId); });
    on<PointerEvent>(canvas, "pointerup", (e) => { if (e.button !== 0) return; this.pointerDown = false; this.chargeReleased = true; });
    on<PointerEvent>(canvas, "pointercancel", () => { this.pointerDown = false; this.chargeReleased = true; });
    on(window, "blur", () => this.reset());
    on<PointerEvent>(canvas, "contextmenu", (e) => e.preventDefault());
  }
  isDown(code: string): boolean { return this.held.has(code); }
  consume(code: string): boolean { const value = this.pressed.has(code); this.pressed.delete(code); return value; }
  consumeRelease(): boolean { const value = this.chargeReleased; this.chargeReleased = false; return value; }
  endStep(): void { this.pressed.clear(); }
  reset(): void { this.held.clear(); this.pressed.clear(); this.pointerDown = false; this.chargeReleased = false; this.updateAxes(); }
  dispose(): void { for (const fn of this.off) fn(); this.off = []; this.reset(); }
  private updateAxes(): void {
    const down = (code: string) => this.held.has(code) ? 1 : 0;
    this.moveX = down("KeyD") + down("ArrowRight") - down("KeyA") - down("ArrowLeft");
    this.moveZ = down("KeyS") + down("ArrowDown") - down("KeyW") - down("ArrowUp");
  }
}
