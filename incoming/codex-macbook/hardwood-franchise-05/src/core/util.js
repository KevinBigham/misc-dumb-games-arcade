// ===== util.js =====
const U = {
  ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  rf(a, b) { return Math.random() * (b - a) + a; },
  chance(p) { return Math.random() < p; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  wpick(arr, wfn) {
    let tot = 0; const ws = arr.map(x => { const w = Math.max(0, wfn(x)); tot += w; return w; });
    if (tot <= 0) return arr[Math.floor(Math.random() * arr.length)];
    let r = Math.random() * tot;
    for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  },
  gauss(mean = 0, sd = 1) {
    let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },
  clamp(x, a, b) { return x < a ? a : x > b ? b : x; },
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
  sum(arr, f) { let s = 0; for (const x of arr) s += f ? f(x) : x; return s; },
  avg(arr, f) { return arr.length ? U.sum(arr, f) / arr.length : 0; },
  maxBy(arr, f) { let best = null, bv = -Infinity; for (const x of arr) { const v = f(x); if (v > bv) { bv = v; best = x; } } return best; },
  sortBy(arr, f, desc = true) { return arr.slice().sort((a, b) => desc ? f(b) - f(a) : f(a) - f(b)); },
  money(k, dec) { // k = thousands of dollars
    const neg = k < 0; k = Math.abs(k);
    let s;
    if (k >= 1000) s = '$' + (k / 1000).toFixed(dec != null ? dec : (k >= 100000 ? 0 : 1)) + 'M';
    else s = k === 0 ? '$0' : '$' + Math.round(k) + 'K';
    return neg ? '-' + s : s;
  },
  dollars(n) { return '$' + Math.round(n).toLocaleString('en-US'); },
  pct(x, d = 1) { return (x * 100).toFixed(d) + '%'; },
  fg(m, a) { return a ? (m / a).toFixed(3).replace(/^0/, '') : '.000'; },
  f1(x) { return (Math.round(x * 10) / 10).toFixed(1); },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  ord(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); },
  hgt(inches) { return Math.floor(inches / 12) + "'" + (inches % 12) + '"'; },
  seasonLabel(y) { return y + '-' + String((y + 1) % 100).padStart(2, '0'); },
  fill(tpl, o) { return tpl.replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m); },
  grade(score) { // 0-100 → letter
    if (score >= 93) return 'A+'; if (score >= 86) return 'A'; if (score >= 80) return 'A-';
    if (score >= 75) return 'B+'; if (score >= 70) return 'B'; if (score >= 65) return 'B-';
    if (score >= 60) return 'C+'; if (score >= 55) return 'C'; if (score >= 50) return 'C-';
    if (score >= 42) return 'D'; return 'F';
  },
};
