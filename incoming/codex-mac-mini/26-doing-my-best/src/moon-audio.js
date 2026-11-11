/** Small original procedural soundtrack. The audio layer only consumes events. */
export function createMoonAudio() {
  let context, master, muted = false, beat = 0, lastTick = -1, voices = 0, requested = false;
  function note(frequency, duration = 0.1, type = 'triangle', volume = 0.08, slide = 1) {
    if (!context || muted || !requested || context.state !== 'running' || voices >= 32) return;
    const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequency * slide), now + duration);
    gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain); gain.connect(master); voices++; oscillator.start(); oscillator.stop(now + duration);
    oscillator.onended = () => { voices--; oscillator.disconnect(); gain.disconnect(); };
  }
  return {
    async unlock() {
      requested = true;
      try {
        if (!context) { const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; if (!Audio) return; context = new Audio(); master = context.createGain(); master.gain.value = 0.4; master.connect(context.destination); }
        if (!muted) await context.resume();
        if (!requested || muted) await context.suspend();
      } catch { /* Audio is optional; the game remains playable. */ }
    },
    setMuted(value) { muted = value; if (master) master.gain.value = muted ? 0 : 0.4; },
    suspend() { requested = false; context?.suspend().catch(() => {}); },
    reset() { lastTick = -1; beat = 0; },
    update(w) {
      if (w.tick === lastTick || w.tick % 15 !== 0) return;
      lastTick = w.tick;
      const bass = [65.41, 65.41, 77.78, 65.41, 98, 87.31, 77.78, 58.27];
      if (beat % 2 === 0) note(bass[(beat / 2) % 8], 0.17, 'triangle', 0.17);
      if (beat % 4 === 2) note(180, 0.065, 'square', 0.025, 0.2);
      if (beat % 2) note(1900, 0.023, 'triangle', 0.025, 0.4);
      if (beat % 4 === 0) note(bass[(beat / 2) % 8] * (w.boss ? 8 : 4), 0.15, 'sine', 0.06);
      beat++;
    },
    consume(events) {
      const played = new Set();
      for (const e of events) {
        if (played.has(e.type)) continue; played.add(e.type);
        if (e.type === 'shot') note(440, 0.045, 'triangle', 0.045, 0.55);
        if (e.type === 'pop') note(170, 0.1, 'square', 0.045, 0.3);
        if (e.type === 'pickup') note(800, 0.055, 'sine', 0.06, 1.3);
        if (e.type === 'feed') note(420 + e.tick % 5 * 90, 0.12, 'triangle', 0.11, 1.6);
        if (e.type === 'hurt') note(150, 0.2, 'sawtooth', 0.09, 0.3);
        if (e.type === 'burp') note(90, 0.6, 'sawtooth', 0.18, 0.22);
        if (e.type === 'dash') note(220, 0.1, 'sine', 0.06, 3);
        if (e.type === 'reflect' || e.type === 'block') note(1100, 0.09, 'triangle', 0.065, 1.8);
        if (e.type === 'portal') { note(160, 0.3, 'sine', 0.1, 5); note(320, 0.3, 'triangle', 0.04, 3); }
        if (e.type === 'heal' || e.type === 'badge') note(990, 0.25, 'sine', 0.07, 1.3);
        if (e.type === 'boss-attack') note(210, 0.2, 'triangle', 0.07, 0.55);
        if (['upgrade', 'win'].includes(e.type)) { note(523, 0.3, 'triangle', 0.09); note(659, 0.4, 'sine', 0.09); note(784, 0.5, 'sine', 0.09); }
        if (['law', 'boss'].includes(e.type)) note(300, 0.4, 'sawtooth', 0.07, 0.6);
      }
    },
  };
}
