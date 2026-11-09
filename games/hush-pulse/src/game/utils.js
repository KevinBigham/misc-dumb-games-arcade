const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const distSq = (ax, az, bx, bz) => {
  const x = ax - bx;
  const z = az - bz;
  return x * x + z * z;
};
class Random {
  seed;
  constructor(seed = 5370206) {
    this.seed = seed >>> 0;
  }
  next() {
    let t = this.seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  range(min, max) {
    return min + (max - min) * this.next();
  }
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
  pick(items) {
    return items[Math.floor(this.next() * items.length)];
  }
}
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
export {
  Random,
  clamp,
  damp,
  distSq,
  formatTime,
  lerp
};
