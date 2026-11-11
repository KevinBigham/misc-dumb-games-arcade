import test from 'node:test';
import assert from 'node:assert/strict';
import { createInput } from '../src/input.js';

class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(name, callback) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(callback);
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  emit(name, data = {}) {
    const event = { target: this, repeat: false, preventDefault() { this.defaultPrevented = true; }, ...data };
    for (const callback of this.listeners.get(name) || []) callback(event);
    return event;
  }
}
class ElementMock extends Target {
  constructor(typing = false) { super(); this.typing = typing; }
  closest() { return this.typing ? this : null; }
}
function setup(t, callbacks = {}) {
  const saved = Object.fromEntries(['window', 'document', 'Element'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const window = new Target(), document = new Target(), canvas = new ElementMock();
  document.hidden = false;
  Object.assign(globalThis, { window, document, Element: ElementMock });
  const input = createInput(canvas, (x, y) => ({ x: x / 2, y: y / 2 }), callbacks);
  t.after(() => {
    input.destroy();
    for (const key of Object.keys(saved)) {
      if (saved[key]) Object.defineProperty(globalThis, key, saved[key]); else delete globalThis[key];
    }
  });
  return { window, document, canvas, input };
}

test('discrete input edges fire once across catch-up ticks; held fire and movement persist', t => {
  const { window, canvas, input } = setup(t);
  window.emit('keydown', { code: 'KeyD' });
  window.emit('keydown', { code: 'Space' });
  window.emit('keydown', { code: 'ShiftLeft' });
  canvas.emit('pointerdown', { pointerType: 'mouse', button: 0, buttons: 1, clientX: 600, clientY: 400 });
  canvas.emit('mousedown', { button: 0, buttons: 1, clientX: 600, clientY: 400 });
  const first = input.sample();
  assert.deepEqual(first, { moveX: 1, moveY: 0, aimX: 300, aimY: 200, fire: true, dashPressed: true, forkPressed: true });
  window.emit('keydown', { code: 'Space', repeat: true });
  const next = input.sample();
  assert.equal(next.forkPressed, false);
  assert.equal(next.dashPressed, false);
  assert.equal(next.fire, true);
  assert.equal(next.moveX, 1);
});

test('focus loss clears held keys, fire, and pending edges before resuming', t => {
  const { window, document, canvas, input } = setup(t);
  window.emit('keydown', { code: 'KeyW' });
  window.emit('keydown', { code: 'KeyE' });
  canvas.emit('pointerdown', { pointerType: 'mouse', button: 0, buttons: 1, clientX: 10, clientY: 10 });
  canvas.emit('mousedown', { button: 0, buttons: 1, clientX: 10, clientY: 10 });
  window.emit('blur');
  assert.equal(input.sample().moveY, 0);
  assert.equal(input.sample().fire, false);
  assert.equal(input.sample().forkPressed, false);
  window.emit('keydown', { code: 'KeyD' });
  document.hidden = true;
  document.emit('visibilitychange');
  assert.equal(input.sample().moveX, 0);
});

test('text entry and browser shortcuts are ignored, upgrade keys are zero-based', t => {
  const choices = [];
  const { window, input } = setup(t, { chooseUpgrade: index => choices.push(index) });
  window.emit('keydown', { code: 'Space', target: new ElementMock(true) });
  window.emit('keydown', { code: 'KeyD', metaKey: true });
  window.emit('keydown', { code: 'Digit2' });
  assert.deepEqual(choices, [1]);
  assert.equal(input.sample().forkPressed, false);
  assert.equal(input.sample().moveX, 0);
});

test('chorded mouse buttons Fork while firing and release left without latching fire', t => {
  const { window, canvas, input } = setup(t);
  // Browsers emit pointerdown only for the first depressed mouse button.
  canvas.emit('pointerdown', { pointerType: 'mouse', button: 0, buttons: 1, clientX: 200, clientY: 200 });
  canvas.emit('mousedown', { button: 0, buttons: 1, clientX: 200, clientY: 200 });
  assert.equal(input.sample().fire, true);
  canvas.emit('mousedown', { button: 2, buttons: 3, clientX: 300, clientY: 400 });
  const fork = input.sample();
  assert.equal(fork.forkPressed, true);
  assert.equal(fork.fire, true);
  assert.deepEqual([fork.aimX, fork.aimY], [150, 200]);
  assert.equal(input.sample().forkPressed, false);
  // Left can be released while right remains down: no pointerup yet.
  window.emit('mouseup', { button: 0, buttons: 2 });
  assert.equal(input.sample().fire, false);
  window.emit('pointerup', { pointerType: 'mouse', button: 2, buttons: 0 });
  window.emit('mouseup', { button: 2, buttons: 0 });
  assert.equal(input.sample().fire, false);
});

test('right button release preserves left fire and another right press emits one new Fork', t => {
  const { window, canvas, input } = setup(t);
  canvas.emit('pointerdown', { pointerType: 'mouse', button: 0, buttons: 1, clientX: 200, clientY: 200 });
  canvas.emit('mousedown', { button: 0, buttons: 1, clientX: 200, clientY: 200 });
  canvas.emit('mousedown', { button: 2, buttons: 3, clientX: 200, clientY: 200 });
  assert.equal(input.sample().forkPressed, true);
  window.emit('mouseup', { button: 2, buttons: 1 });
  assert.equal(input.sample().fire, true);
  canvas.emit('mousedown', { button: 2, buttons: 3, clientX: 200, clientY: 200 });
  assert.equal(input.sample().forkPressed, true);
  assert.equal(input.sample().forkPressed, false);
});

test('pen presses remain supported and compatibility mouse events never duplicate Fork', t => {
  const { window, canvas, input } = setup(t);
  const penDown = canvas.emit('pointerdown', { pointerType: 'pen', button: 2, buttons: 2, clientX: 300, clientY: 400 });
  assert.equal(penDown.defaultPrevented, true);
  assert.equal(input.sample().forkPressed, true);
  canvas.emit('mousedown', { button: 2, buttons: 2, clientX: 300, clientY: 400 });
  assert.equal(input.sample().forkPressed, false);
  window.emit('pointerup', { pointerType: 'pen', button: 2, buttons: 0 });
  window.emit('mouseup', { button: 2, buttons: 0 });
  canvas.emit('pointerdown', { pointerType: 'pen', button: 0, buttons: 1, clientX: 300, clientY: 400 });
  assert.equal(input.sample().fire, true);
  window.emit('pointerup', { pointerType: 'pen', button: 0, buttons: 0 });
  assert.equal(input.sample().fire, false);
  assert.equal(canvas.emit('contextmenu').defaultPrevented, true);
});
