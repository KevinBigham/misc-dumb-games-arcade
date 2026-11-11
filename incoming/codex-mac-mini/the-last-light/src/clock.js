/** Bounded fixed-step clock. Pausing drops accumulated time instead of catching up. */
export function createClock(step, rate = 60, maxTicks = 5) {
  const interval = 1 / rate;
  let accumulator = 0;
  return {
    advance(seconds, active = true) {
      if (!active) { accumulator = 0; return 0; }
      if (!Number.isFinite(seconds) || seconds < 0) return accumulator / interval;
      accumulator += Math.min(seconds, 0.25);
      let count = 0;
      while (accumulator + 1e-10 >= interval && count < maxTicks) {
        accumulator = Math.max(0, accumulator - interval);
        count++;
        if (step() === false) { accumulator = 0; break; }
      }
      if (count === maxTicks && accumulator >= interval) accumulator %= interval;
      return accumulator / interval;
    },
    reset() { accumulator = 0; },
  };
}
