// Preserve quick taps until the next fixed tick; held actions remain rate-limited by simulation.
export function createHonkInput() {
  const keys = new Set();
  let edgeDash = false, edgeReply = false, edgeHonk = false, pointerHonk = false;
  function clear() { keys.clear(); edgeDash = false; edgeReply = false; edgeHonk = false; pointerHonk = false; }
  function setKey(code, pressed) {
    if (pressed) {
      if (!keys.has(code)) {
        if (code === 'ShiftLeft' || code === 'ShiftRight') edgeDash = true;
        if (code === 'KeyE') edgeReply = true;
        if (code === 'Space') edgeHonk = true;
      }
      keys.add(code);
    } else keys.delete(code);
  }
  function setPointerHonk(pressed) { if (pressed && !pointerHonk) edgeHonk = true; pointerHonk = pressed; }
  function sample(autoHonk = false) {
    const value = {
      x: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
      y: Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')),
      honk: autoHonk || edgeHonk || keys.has('Space') || pointerHonk, dash: edgeDash, reply: edgeReply,
    };
    edgeHonk = false; edgeDash = false; edgeReply = false; return value;
  }
  return { clear, setKey, setPointerHonk, sample };
}
