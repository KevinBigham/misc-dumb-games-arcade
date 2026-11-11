/** Procedural score at 100 BPM. The audio graph is created only by unlock(). */
export function createAudio() {
  let context = null;
  let master = null;
  let music = null;
  let effects = null;
  let organWave = null;
  let noiseBuffer = null;
  let timer = null;
  let muted = false;
  let suspended = true;
  let destroyed = false;
  let ended = false;
  let act = 1;
  let bossPhase = 1;
  let step = 0;
  let nextNote = 0;
  let lifecycle = 0;
  const voices = new Set();
  const STEP_SECONDS = 60 / 100 / 4;
  const MAX_VOICES = 24;
  const progression = [
    [146.832, 174.614, 220],
    [116.541, 146.832, 174.614],
    [97.999, 116.541, 146.832],
    [110, 138.591, 164.814],
  ];

  function initialize() {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return false;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.65;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -9;
    limiter.knee.value = 9;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    music = context.createGain();
    music.gain.value = 0.35;
    effects = context.createGain();
    effects.gain.value = 0.65;
    music.connect(limiter);
    effects.connect(limiter);
    limiter.connect(master);
    master.connect(context.destination);

    const reverb = context.createConvolver();
    const impulse = context.createBuffer(2, context.sampleRate * 1.6, context.sampleRate);
    let noiseState = 0x51f15e;
    const random = () => { noiseState = (Math.imul(noiseState, 1664525) + 1013904223) >>> 0; return noiseState / 0x100000000 * 2 - 1; };
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < data.length; index += 1) data[index] = random() * (1 - index / data.length) ** 3;
    }
    reverb.buffer = impulse;
    const wet = context.createGain();
    wet.gain.value = 0.2;
    music.connect(reverb);
    effects.connect(reverb);
    reverb.connect(wet);
    wet.connect(limiter);

    const real = new Float32Array(9);
    const imaginary = new Float32Array([0, 1, 0.38, 0.15, 0.23, 0.04, 0.07, 0.02, 0.02]);
    organWave = context.createPeriodicWave(real, imaginary);
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noise.length; index += 1) noise[index] = random();
    return true;
  }

  function voice({ frequency = 220, targetFrequency, type = 'sine', duration = 0.2, volume = 0.1, when = context?.currentTime || 0, attack = 0.005, bus = effects, pan = 0, noise = false, cutoff = 3000 }) {
    if (!context || muted || suspended || destroyed || voices.size >= MAX_VOICES || (bus === music && voices.size >= 18)) return;
    const source = noise ? context.createBufferSource() : context.createOscillator();
    if (noise) source.buffer = noiseBuffer;
    else {
      if (type === 'organ') source.setPeriodicWave(organWave);
      else source.type = type;
      source.frequency.setValueAtTime(Math.max(20, frequency), when);
      if (targetFrequency) source.frequency.exponentialRampToValueAtTime(Math.max(20, targetFrequency), when + duration);
    }
    const envelope = context.createGain();
    const panner = context.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + Math.min(attack, duration / 3));
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    let filter = null;
    if (noise) {
      filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      source.connect(filter);
      filter.connect(envelope);
    } else source.connect(envelope);
    envelope.connect(panner);
    panner.connect(bus);
    const record = { source, bus };
    voices.add(record);
    source.onended = () => {
      voices.delete(record);
      source.disconnect();
      filter?.disconnect();
      envelope.disconnect();
      panner.disconnect();
    };
    source.start(when);
    source.stop(when + duration + 0.02);
  }

  function scoreNote(index, when) {
    const chord = progression[Math.floor(index / 16) % progression.length];
    const subdivision = index % 16;
    if (subdivision === 0) {
      for (let note = 0; note < chord.length; note += 1) {
        voice({ frequency: chord[note], type: 'organ', duration: 2.3, volume: 0.055, when, attack: 0.16, pan: (note - 1) * 0.35, bus: music });
      }
    }
    if (subdivision % (act >= 3 ? 4 : 8) === 0) {
      voice({ frequency: chord[0] / 2, type: 'triangle', duration: 0.6, volume: 0.14, when, attack: 0.015, bus: music });
    }
    if (act >= 2 && subdivision % 8 === 0) {
      voice({ frequency: 95, targetFrequency: 35, duration: 0.25, volume: 0.22, when, bus: music });
    }
    if (act >= 2 && subdivision % 8 === 4) {
      voice({ noise: true, duration: 0.095, volume: 0.07, cutoff: 1800, when, bus: music });
      voice({ frequency: 175, targetFrequency: 115, duration: 0.1, volume: 0.045, when, bus: music });
    }
    if (act >= 3 && subdivision % 2 === 0) {
      voice({ noise: true, duration: 0.035, volume: subdivision % 4 === 0 ? 0.026 : 0.013, cutoff: 6500, when, pan: subdivision % 4 ? 0.25 : -0.25, bus: music });
    }
    if (act === 4 && subdivision % (bossPhase >= 3 ? 2 : 4) === 0) {
      voice({ frequency: chord[(subdivision / 2) % 3 | 0] * 4, type: 'sine', duration: 0.5, volume: 0.033, when, attack: 0.01, pan: Math.sin(index) * 0.45, bus: music });
    }
  }

  function schedule() {
    if (!context || context.state !== 'running' || muted || suspended || ended || destroyed) return;
    // After a system stall, resume from now instead of scheduling a burst of old beats.
    if (nextNote < context.currentTime - 0.2) nextNote = context.currentTime + 0.03;
    while (nextNote < context.currentTime + 0.16) {
      scoreNote(step, nextNote);
      nextNote += STEP_SECONDS;
      step += 1;
    }
  }
  function stopTimer() { if (timer !== null) { clearInterval(timer); timer = null; } }
  function startTimer() {
    if (timer !== null || muted || suspended || ended || destroyed || !context) return;
    nextNote = context.currentTime + 0.035;
    schedule();
    timer = setInterval(schedule, 75);
  }
  function stopVoices() {
    for (const voiceRecord of voices) {
      try { voiceRecord.source.stop(); } catch { /* A scheduled source may already have ended. */ }
    }
    voices.clear();
  }
  function setMuted(value) {
    muted = Boolean(value);
    if (!context) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : 0.65, context.currentTime, 0.015);
    if (muted) { stopTimer(); stopVoices(); }
    else startTimer();
  }

  function consume(events) {
    if (!context || context.state !== 'running' || muted || suspended || destroyed) return;
    const now = context.currentTime;
    for (const event of events) {
      const pan = Number.isFinite(event.x) ? (event.x - 640) / 900 : 0;
      if (event.type === 'shot') {
        if (event.owner === 'enemy') continue;
        voice({ frequency: event.owner === 'echo' ? 670 : 340, targetFrequency: 95, type: 'triangle', duration: 0.065, volume: event.owner === 'echo' ? 0.022 : 0.045, pan });
      } else if (event.type === 'hit') {
        voice({ frequency: 980, targetFrequency: 380, duration: 0.035, volume: 0.025, pan });
      } else if (event.type === 'kill') {
        voice({ frequency: event.owner === 'echo' ? 620 : 460, targetFrequency: 115, type: 'triangle', duration: 0.14, volume: 0.065, pan });
        voice({ noise: true, cutoff: 1200, duration: 0.09, volume: 0.04, pan });
      } else if (event.type === 'dash') {
        voice({ noise: true, duration: 0.12, cutoff: 1800, volume: 0.07, pan });
        voice({ frequency: 180, targetFrequency: 440, duration: 0.12, volume: 0.035, pan });
      } else if (event.type === 'fork') {
        music.gain.cancelScheduledValues(now);
        music.gain.setValueAtTime(0.07, now);
        music.gain.linearRampToValueAtTime(0.35, now + 0.65);
        voice({ frequency: 660, targetFrequency: 90, type: 'sine', duration: 0.3, volume: 0.17, pan: -pan });
        voice({ frequency: 88, targetFrequency: 32, duration: 0.7, volume: 0.36, when: now + 0.05 });
        voice({ noise: true, duration: 0.38, cutoff: 2200, volume: 0.075, pan });
      } else if (event.type === 'player-hit') {
        voice({ frequency: 110, targetFrequency: 45, type: 'sawtooth', duration: 0.18, volume: 0.08 });
        voice({ noise: true, duration: 0.17, cutoff: 700, volume: 0.12 });
      } else if (event.type === 'act-start' || event.type === 'boss-phase') {
        voice({ frequency: 73.416, type: 'organ', duration: 1.2, volume: 0.16, attack: 0.04 });
        voice({ frequency: 293.665, type: 'sine', duration: 1.6, volume: 0.075, when: now + 0.12 });
      } else if (event.type === 'upgrade-ready') {
        [293.665, 349.228, 440].forEach((frequency, index) => voice({ frequency, duration: 1.2, volume: 0.085, when: now + index * 0.1, attack: 0.02 }));
      } else if (event.type === 'run-end') {
        ended = true;
        stopTimer();
        const won = event.phase === 'won' || event.kind === 'won';
        const notes = won ? [146.832, 220, 293.665, 349.228] : [73.416, 110, 138.591];
        notes.forEach((frequency, index) => voice({ frequency, type: 'organ', duration: 2.5, volume: 0.09, when: now + index * 0.08, attack: 0.03 }));
      }
    }
  }

  return {
    async unlock() {
      if (destroyed) return false;
      const requestedLifecycle = lifecycle;
      try {
        if (!context && !initialize()) return false;
        await context.resume();
        if (destroyed || requestedLifecycle !== lifecycle) return false;
        suspended = false;
        ended = false;
        startTimer();
        return true;
      } catch { return false; }
    },
    consume,
    setIntensity(nextAct, nextPhase = 1) { act = Math.max(1, Math.min(4, Number(nextAct) || 1)); bossPhase = Math.max(1, Math.min(3, Number(nextPhase) || 1)); },
    setMuted,
    suspend() {
      lifecycle += 1;
      suspended = true;
      stopTimer();
      stopVoices();
      if (context && context.state !== 'closed') context.suspend().catch(() => {});
    },
    destroy() {
      lifecycle += 1;
      destroyed = true;
      suspended = true;
      stopTimer();
      stopVoices();
      if (context && context.state !== 'closed') context.close().catch(() => {});
    },
  };
}
