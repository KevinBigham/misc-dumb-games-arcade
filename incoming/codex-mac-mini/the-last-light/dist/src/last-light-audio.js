/** Presentation-only procedural audio; no assets or gameplay RNG. */
export function createLightAudio() {
  let context, master, muted = false, wanted = false, generation = 0, lastShot = -100, lastKill = -100;
  const voices = new Set(), hums = [];
  function clearVoices() {
    for (const voice of [...voices]) { try { voice.oscillator.stop(); } catch { /* Already finished. */ } voice.finish(); }
  }
  function suspend() {
    wanted = false; generation++; clearVoices();
    context?.suspend().catch(() => {});
  }
  function unlock() {
    if (muted) return;
    wanted = true; const request = ++generation;
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        context = new AudioContext(); master = context.createGain(); master.gain.value = .18; master.connect(context.destination);
        for (const frequency of [55, 82.41, 110.16]) {
          const oscillator = context.createOscillator(), gain = context.createGain();
          oscillator.frequency.value = frequency; gain.gain.value = .035; oscillator.connect(gain); gain.connect(master); oscillator.start(); hums.push({ oscillator, gain });
        }
      }
      const active = context;
      active.resume().then(() => {
        // A browser may resolve resume after a pause, mute, or page blur.
        if (request !== generation && (!wanted || muted)) active.suspend().catch(() => {});
      }).catch(() => {});
    } catch { /* Sound is optional. */ }
  }
  function note(frequency, duration, type = 'sine', volume = .15, endFrequency) {
    if (!context || context.state !== 'running' || !wanted || muted || voices.size >= 18) return;
    const oscillator = context.createOscillator(), gain = context.createGain(), t = context.currentTime;
    const voice = { oscillator, finish() { if (!voices.delete(voice)) return; oscillator.disconnect(); gain.disconnect(); } };
    voices.add(voice);
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, t);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, t + duration);
    gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.001, t + duration);
    oscillator.connect(gain); gain.connect(master); oscillator.onended = voice.finish; oscillator.start(); oscillator.stop(t + duration);
  }
  function consume(events) {
    for (const e of events) {
      if (e.type === 'shot' && e.tick - lastShot > 5) { lastShot = e.tick; note(520, .055, 'triangle', .1, 160); }
      if (e.type === 'kill' && e.tick - lastKill > 1) { lastKill = e.tick; note(100, .11, 'triangle', .22, 40); }
      if (e.type === 'hurt') note(75, .2, 'sawtooth', .12, 35);
      if (e.type === 'beam-warning') note(180, .4, 'sine', .12, 600);
      if (e.type === 'repair') { note(392, .25); note(523, .4, 'sine', .09); }
      if (e.type === 'dash-hit') note(160, .13, 'triangle', .2, 40);
      if (e.type === 'promise-broken') note(220, 1.1, 'sine', .12, 110);
      if (e.type === 'dash') note(200, .16, 'sine', .2, 700);
      if (e.type === 'rescue') { note(523, .45); note(659, .6, 'sine', .1); note(784, .8, 'sine', .08); }
      if (e.type === 'pulse') { note(65, 1.2, 'sawtooth', .3, 25); note(880, .9, 'sine', .12, 55); }
      if (e.type === 'council') note(330, 1.5, 'sine', .2);
    }
  }
  return {
    unlock, consume, suspend,
    setMuted(value) { muted = Boolean(value); if (master) master.gain.setTargetAtTime(muted ? 0 : .18, context.currentTime, .03); if (muted) suspend(); },
    reset() { lastShot = -100; lastKill = -100; clearVoices(); },
    destroy() { suspend(); for (const { oscillator, gain } of hums.splice(0)) { oscillator.stop(); oscillator.disconnect(); gain.disconnect(); } context?.close().catch(() => {}); context = null; master = null; },
  };
}
