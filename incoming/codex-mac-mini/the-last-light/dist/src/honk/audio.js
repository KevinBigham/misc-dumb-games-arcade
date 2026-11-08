export function createHonkAudio() {
  let context, muted = false, wantsSound = false;
  const voices = new Set();
  function unlock() {
    if (muted) return;
    wantsSound = true;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume().then(() => {
        // A browser may resolve resume after a blur, pause, or mute action.
        if (!wantsSound || muted) context.suspend().catch(() => {});
      }).catch(() => {});
    } catch { /* Silent play remains fully functional. */ }
  }
  function tone(frequency, duration, type = 'sine', volume = .045, delay = 0, end = frequency) {
    if (!context || muted || !wantsSound || context.state !== 'running' || voices.size >= 24) return;
    const time = context.currentTime + delay, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, time); oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, end), time + duration);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .012); gain.gain.exponentialRampToValueAtTime(.001, time + duration);
    oscillator.connect(gain); gain.connect(context.destination); voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration + .02);
  }
  function consume(events) {
    const counts = {};
    for (const e of events) {
      counts[e.type] = (counts[e.type] || 0) + 1;
      if (counts[e.type] > 3) continue;
      if (e.type === 'honk') { tone(260, .17, 'sawtooth', .035, 0, 170); tone(510, .16, 'triangle', .045, .03, 340); }
      if (e.type === 'broken') { tone(150, .13, 'square', .025, 0, 45); tone(620, .08, 'triangle', .03, .03, 90); }
      if (e.type === 'fired') { tone(390, .12, 'triangle', .06, 0, 710); }
      if (e.type === 'hurt') { tone(180, .25, 'square', .035, 0, 55); }
      if (e.type === 'dash') { tone(460, .1, 'sine', .04, 0, 70); }
      if (e.type === 'chair-launch') { tone(110, .16, 'triangle', .04, 0, 330); }
      if (e.type === 'chair-hit') { tone(90, .09, 'square', .025, 0, 60); tone(650 + Math.min(5, e.chain) * 90, .1, 'sine', .04, .04); }
      if (e.type === 'stamp' || e.type === 'security-crash') { tone(70, .14, 'triangle', .06, 0, 40); }
      if (e.type === 'incident') { [523, 659, 523].forEach((f, i) => tone(f, .14, 'sine', .04, i * .1)); }
      if (e.type === 'security-charge') { tone(330, .2, 'sawtooth', .015, 0, 430); }
      if (e.type === 'lunch') { tone(700, .08, 'sine', .06); tone(950, .13, 'sine', .04, .08); }
      if (e.type === 'reply') { for (let i = 0; i < 4; i++) tone(190 + i * 80, .4, 'sawtooth', .025, i * .1, 90 + i * 50); }
      if (['promotion', 'won', 'objective'].includes(e.type)) { [392, 494, 587, 784].forEach((f, i) => tone(f, .2, 'triangle', .05, i * .09)); }
      if (e.type === 'boss' || e.type === 'lost' || e.type === 'boss-phase') { [220, 185, 147].forEach((f, i) => tone(f, .25, 'triangle', .06, i * .15)); }
    }
  }
  function suspend() { wantsSound = false; for (const voice of voices) { try { voice.stop(); } catch { /* Already ended. */ } } voices.clear(); context?.suspend().catch(() => {}); }
  return { unlock, consume, setMuted(value) { muted = value; if (muted) suspend(); }, suspend };
}
