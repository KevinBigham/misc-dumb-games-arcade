import { EMPTY_INPUT } from './contracts.js';

/** DOM input is sampled once per simulation tick; discrete actions are consumed once. */
export function createInput(canvas, screenToWorld, callbacks = {}) {
  const keys = new Set();
  const listeners = [];
  let mouseDown = false;
  let penDown = false;
  let penActive = false;
  let dashPressed = false;
  let forkPressed = false;
  let pointer = null;
  let aim = { x: EMPTY_INPUT.aimX, y: EMPTY_INPUT.aimY };
  const typing = (target) => target instanceof Element && Boolean((target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')));
  const on = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    listeners.push(() => target.removeEventListener(name, handler, options));
  };
  function clear() {
    keys.clear();
    mouseDown = false;
    penDown = false;
    penActive = false;
    dashPressed = false;
    forkPressed = false;
  }
  on(window, 'keydown', (event) => {
    if (typing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
    const code = event.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) event.preventDefault();
    keys.add(code);
    if (event.repeat) return;
    if (code === 'Space' || code === 'KeyE') forkPressed = true;
    if (code === 'ShiftLeft' || code === 'ShiftRight') dashPressed = true;
    if (code === 'Escape') callbacks.pause?.();
    if (code === 'KeyM') callbacks.mute?.();
    if (/^Digit[123]$/.test(code)) callbacks.chooseUpgrade?.(Number(code.slice(-1)) - 1);
    if (code === 'KeyR') callbacks.restart?.();
  });
  on(window, 'keyup', (event) => keys.delete(event.code));
  on(window, 'pointermove', (event) => { pointer = { x: event.clientX, y: event.clientY }; });
  // Mouse PointerEvents report only the first button down and final button up.
  // MouseEvents report every button transition, including right click during fire.
  on(canvas, 'mousedown', (event) => {
    if (penActive) return; // Suppress any pen compatibility mouse event.
    pointer = { x: event.clientX, y: event.clientY };
    if (event.button === 0) mouseDown = true;
    if (event.button === 2) forkPressed = true;
    if (event.button === 0 || event.button === 2) event.preventDefault();
  });
  on(window, 'mouseup', (event) => { if (event.button === 0) mouseDown = false; });
  on(canvas, 'pointerdown', (event) => {
    if (event.pointerType !== 'pen') return;
    penActive = true;
    pointer = { x: event.clientX, y: event.clientY };
    if (event.button === 0) penDown = true;
    if (event.button === 2) forkPressed = true;
    if (event.button === 0 || event.button === 2) event.preventDefault();
  });
  on(window, 'pointerup', (event) => {
    if (event.pointerType === 'pen') { penDown = false; penActive = false; }
  });
  on(window, 'pointercancel', clear);
  on(canvas, 'contextmenu', (event) => event.preventDefault());
  on(window, 'blur', clear);
  on(document, 'visibilitychange', () => { if (document.hidden) clear(); });

  return {
    sample() {
      if (pointer) {
        const converted = screenToWorld(pointer.x, pointer.y);
        if (converted && Number.isFinite(converted.x) && Number.isFinite(converted.y)) aim = converted;
      }
      const sample = {
        moveX: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
        moveY: Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')),
        aimX: aim.x, aimY: aim.y, fire: mouseDown || penDown, dashPressed, forkPressed,
      };
      dashPressed = false;
      forkPressed = false;
      return sample;
    },
    clear,
    destroy() { clear(); for (const remove of listeners) remove(); },
  };
}
