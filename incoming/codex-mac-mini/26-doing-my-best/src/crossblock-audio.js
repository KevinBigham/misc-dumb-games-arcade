/** Synthesized sounds consume events and never change gameplay state. */
export function createCrossblockAudio() {
  let context = null, master = null, muted = false;
  function unlock() {
    if (muted) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; if (!Audio) return;
      if (!context) {
        context = new Audio(); master = context.createGain();
        master.gain.value = 1; master.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { /* Sound is optional. */ }
  }
  function note(frequency, delay = 0, duration = 0.12, volume = 0.035) {
    if (muted || !context || context.state !== 'running') return;
    const start = context.currentTime + delay, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + 0.007); gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain); gain.connect(master); oscillator.start(start); oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  return {
    unlock, setMuted(value) { muted = value; if (master) master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.015); },
    select() { note(440, 0, 0.06, 0.018); }, invalid() { note(130, 0, 0.09, 0.02); },
    consume(events) {
      for (const event of events) {
        if (event.type === 'placed') { note(262, 0, 0.1); note(392, 0.04, 0.1, 0.025); }
        if (event.type === 'rotated') note(520, 0, 0.07, 0.02);
        if (event.type === 'undone') { note(392); note(262, 0.06); }
        if (event.type === 'cleared') (event.cross ? [523, 659, 784, 1047] : [392, 494, 587]).forEach((tone, i) => note(tone, 0.04 + i * 0.065, 0.22, 0.035));
        if (event.type === 'perfect-clear') [659, 784, 1047, 1319].forEach((tone, i) => note(tone, 0.2 + i * 0.07, 0.25));
        if (event.type === 'puzzle-won') [523, 659, 784, 1047, 1319].forEach((tone, i) => note(tone, 0.3 + i * 0.08, 0.3, 0.025));
        if (event.type === 'game-over') [330, 294, 262].forEach((tone, i) => note(tone, 0.3 + i * 0.12, 0.28, 0.025));
      }
    },
  };
}
