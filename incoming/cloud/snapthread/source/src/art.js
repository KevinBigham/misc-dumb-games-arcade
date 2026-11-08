// ===================== SNAPTHREAD ART (all drawn in code) =====================
var ART = (function () {
  'use strict';
  function svg(vb, body, extra) { return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"' + (extra || '') + '>' + body + '</svg>'; }
  var I = {
    atk: svg('0 0 24 24', '<path d="M3 21 L17 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="19" cy="5" rx="2.6" ry="1.6" transform="rotate(-45 19 5)" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 21 l3-1 -2-2z" fill="currentColor"/>'),
    block: svg('0 0 24 24', '<path d="M12 2 L20 5 V11 C20 16.5 16.5 20 12 22 C7.5 20 4 16.5 4 11 V5 Z" fill="currentColor"/>'),
    tension: svg('0 0 24 24', '<path d="M12 12 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -5 -1 a5 5 0 1 1 9 3 a7 7 0 1 1 -12 -5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
    weave: svg('0 0 24 24', '<path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" opacity=".55"/><path d="M7 3v18M12 3v18M17 3v18" stroke="currentColor" stroke-width="2.4" stroke-dasharray="4 3"/>'),
    buff: svg('0 0 24 24', '<path d="M12 3 L20 13 H15 V21 H9 V13 H4 Z" fill="currentColor"/>'),
    debuff: svg('0 0 24 24', '<path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" fill="currentColor"/>'),
    knot: svg('0 0 24 24', '<path d="M4 18 C8 18 9 6 13 6 C17 6 17 12 13 12 C9 12 10 4 14 4 M13 12 C16 12 18 16 20 18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>'),
    heal: svg('0 0 24 24', '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill="currentColor"/>'),
    energy: svg('0 0 24 24', '<path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z" fill="currentColor"/>'),
    draw: svg('0 0 24 24', '<rect x="5" y="3" width="11" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="7" width="11" height="15" rx="2" fill="currentColor"/>'),
    gold: svg('0 0 24 24', '<circle cx="12" cy="12" r="8.5" fill="#e9ab3c" stroke="#ffd27a" stroke-width="2"/><path d="M12 7v10M9 9.5h4.5a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5H15" stroke="#7a5211" stroke-width="1.6" fill="none"/>'),
    heart: svg('0 0 24 24', '<path d="M12 21 C5 15 2 12 2 8 a5 5 0 0 1 10 -1 a5 5 0 0 1 10 1 c0 4 -3 7 -10 13z" fill="#e0665a"/>'),
    deck: svg('0 0 24 24', '<rect x="3" y="5" width="12" height="16" rx="2" fill="#c3ae8e"/><rect x="8" y="3" width="12" height="16" rx="2" fill="#f4e8cd" stroke="#7a604c"/>'),
    // map nodes
    F: svg('0 0 24 24', '<path d="M5 19 L18 6 M19 19 L6 6" stroke="#f4e8cd" stroke-width="2.4" stroke-linecap="round"/><circle cx="18.5" cy="5.5" r="1.8" fill="none" stroke="#f4e8cd" stroke-width="1.4"/><circle cx="5.5" cy="5.5" r="1.8" fill="none" stroke="#f4e8cd" stroke-width="1.4"/>'),
    E: svg('0 0 24 24', '<path d="M12 2 l2.6 5.8 6.4.6 -4.8 4.2 1.4 6.3 -5.6 -3.3 -5.6 3.3 1.4 -6.3 -4.8 -4.2 6.4 -.6z" fill="#e0665a"/><circle cx="12" cy="11" r="2.4" fill="#271b16"/>'),
    R: svg('0 0 24 24', '<path d="M4 9 h13 v4 a6 6 0 0 1 -6 6 h-1 a6 6 0 0 1 -6 -6z" fill="#c4cf6a"/><path d="M17 10.5 h1.5 a2.5 2.5 0 0 1 0 5 H16" fill="none" stroke="#c4cf6a" stroke-width="1.8"/><path d="M8 3 c-1 2 1 2 0 4 M12 3 c-1 2 1 2 0 4" stroke="#f4e8cd" stroke-width="1.4" fill="none"/>'),
    M: svg('0 0 24 24', '<circle cx="12" cy="12" r="8.5" fill="#e9ab3c" stroke="#ffd27a" stroke-width="2"/><path d="M12 7v10M9 9.5h4.5a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5H15" stroke="#7a5211" stroke-width="1.6" fill="none"/>'),
    S: svg('0 0 24 24', '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="#9fb0ff" stroke-width="2"/><path d="M8 4v16M12 4v16M16 4v16" stroke="#9fb0ff" stroke-width="1.3"/><path d="M4 12h16" stroke="#ffd27a" stroke-width="2.2"/>'),
    B: svg('0 0 24 24', '<rect x="5" y="3" width="14" height="3" rx="1" fill="#c2473c"/><rect x="5" y="18" width="14" height="3" rx="1" fill="#c2473c"/><rect x="7" y="6" width="10" height="12" fill="#e9ab3c"/><path d="M7 8h10M7 10h10M7 12h10M7 14h10M7 16h10" stroke="#7a5211" stroke-width=".9"/><path d="M17 12 C21 13 20 18 23 20" stroke="#e9ab3c" stroke-width="1.6" fill="none"/>')
  };

  // ---- enemy sprites ----
  function threadLines(n, cx, cy, r, col, seed) {
    var out = '', a = seed || 1;
    for (var i = 0; i < n; i++) {
      a = (a * 9301 + 49297) % 233280; var t = a / 233280 * Math.PI * 2;
      a = (a * 9301 + 49297) % 233280; var l = r * (0.6 + a / 233280 * 0.6);
      out += '<path d="M' + cx + ' ' + cy + ' q' + (Math.cos(t + 0.6) * l * 0.6).toFixed(1) + ' ' + (Math.sin(t + 0.6) * l * 0.6).toFixed(1) + ' ' + (Math.cos(t) * l).toFixed(1) + ' ' + (Math.sin(t) * l).toFixed(1) + '" stroke="' + col + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    }
    return out;
  }
  function eyes(x1, x2, y, r, col) {
    return '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="#fff6e0"/><circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="#fff6e0"/><circle cx="' + (x1 + r * 0.3) + '" cy="' + (y + r * 0.2) + '" r="' + r * 0.5 + '" fill="' + (col || '#1a120e') + '"/><circle cx="' + (x2 + r * 0.3) + '" cy="' + (y + r * 0.2) + '" r="' + r * 0.5 + '" fill="' + (col || '#1a120e') + '"/>';
  }
  function spikes(cx, cy, r, n, col) {
    var p = '';
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, b = a + Math.PI / n;
      p += (i ? 'L' : 'M') + (cx + Math.cos(a) * r * 1.35).toFixed(1) + ' ' + (cy + Math.sin(a) * r * 1.35).toFixed(1) + ' L' + (cx + Math.cos(b) * r * 0.9).toFixed(1) + ' ' + (cy + Math.sin(b) * r * 0.9).toFixed(1);
    }
    return '<path d="' + p + 'Z" fill="' + col + '"/>';
  }
  var SPR = {
    burrling: function () { return spikes(50, 58, 24, 14, '#9aa646') + '<circle cx="50" cy="58" r="22" fill="#b8c457"/>' + eyes(42, 58, 54, 6) + '<path d="M43 68 q7 5 14 0" stroke="#3a2a22" stroke-width="2.5" fill="none"/>'; },
    burrlet: function () { return spikes(50, 64, 16, 11, '#9aa646') + '<circle cx="50" cy="64" r="15" fill="#c4cf6a"/>' + eyes(44, 56, 61, 4.5) ; },
    knotworm: function () { return '<path d="M15 80 C15 50 45 50 45 68 C45 86 75 86 72 58 C70 38 45 40 52 30" stroke="#c2473c" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M15 80 C15 50 45 50 45 68 C45 86 75 86 72 58 C70 38 45 40 52 30" stroke="#e0665a" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="3 6"/><circle cx="54" cy="27" r="11" fill="#c2473c"/>' + eyes(50, 59, 25, 3.5); },
    finch: function () { return '<ellipse cx="50" cy="60" rx="22" ry="17" fill="#e9ab3c"/><path d="M30 55 L10 45 L28 64Z" fill="#c98a22"/><path d="M70 52 L88 40 M70 58 L90 54 M70 64 L88 68" stroke="#e9ab3c" stroke-width="3" stroke-linecap="round"/><path d="M50 78 l-4 12 M56 77 l3 12" stroke="#7a5211" stroke-width="3"/>' + eyes(44, 56, 54, 4.5) + '<path d="M48 63 l4 6 4-6z" fill="#7a3a12"/>'; },
    guard: function () { return '<rect x="38" y="12" width="24" height="10" rx="3" fill="#7a604c"/><rect x="38" y="80" width="24" height="10" rx="3" fill="#7a604c"/><path d="M42 22 C30 50 30 55 42 80 H58 C70 55 70 50 58 22Z" fill="#4553a8"/><path d="M36 35h28M34 45h32M34 55h32M36 65h28" stroke="#6f7fd6" stroke-width="2.5"/><path d="M30 48 L12 40 M70 48 L88 40" stroke="#c3ae8e" stroke-width="5" stroke-linecap="round"/>' + eyes(44, 56, 46, 5, '#c2473c'); },
    wisp: function () { return threadLines(10, 50, 52, 34, '#9fb0ff', 7) + '<circle cx="50" cy="52" r="17" fill="#34418a" opacity=".9"/>' + threadLines(6, 50, 52, 20, '#c8d0ff', 3) + eyes(44, 56, 50, 4.5, '#e9ab3c'); },
    shearA: function () { return '<path d="M20 30 L62 62" stroke="#c3ae8e" stroke-width="9" stroke-linecap="round"/><path d="M20 30 L62 62" stroke="#f4e8cd" stroke-width="3" stroke-linecap="round"/><circle cx="68" cy="68" r="13" fill="none" stroke="#c2473c" stroke-width="7"/>' + eyes(30, 40, 38, 3.5); },
    shearB: function () { return '<path d="M80 30 L38 62" stroke="#c3ae8e" stroke-width="9" stroke-linecap="round"/><path d="M80 30 L38 62" stroke="#f4e8cd" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="68" r="13" fill="none" stroke="#4553a8" stroke-width="7"/>' + eyes(60, 70, 38, 3.5); },
    hound: function () { var w = ''; for (var i = 0; i < 9; i++) w += '<circle cx="' + (28 + i * 6) + '" cy="' + (52 + (i % 2) * 5) + '" r="10" fill="#e6d3ae"/>'; return w + '<circle cx="80" cy="44" r="13" fill="#e6d3ae"/><path d="M72 34 l-4 -10 8 6z M86 34 l4 -10 -8 6z" fill="#c3ae8e"/><path d="M30 64 v18 M44 66 v18 M60 66 v18 M72 62 v18" stroke="#c3ae8e" stroke-width="5" stroke-linecap="round"/>' + eyes(76, 86, 42, 3.2) + '<path d="M80 50 l6 2" stroke="#3a2a22" stroke-width="2"/>'; },
    mite: function () { return '<ellipse cx="50" cy="62" rx="15" ry="12" fill="#b9a68a"/><path d="M38 58 l-10 -6 M38 66 l-11 4 M62 58 l10 -6 M62 66 l11 4 M44 72 l-4 9 M56 72 l4 9" stroke="#8f7a62" stroke-width="2.6" stroke-linecap="round"/>' + eyes(45, 55, 58, 3.5); },
    warden: function () { return '<rect x="30" y="8" width="40" height="10" rx="3" fill="#c2473c"/><rect x="30" y="84" width="40" height="10" rx="3" fill="#c2473c"/><path d="M34 18 C20 50 20 55 34 84 H66 C80 55 80 50 66 18Z" fill="#e9ab3c"/><path d="M30 30h40M27 42h46M26 54h48M28 66h44M31 76h38" stroke="#b9771a" stroke-width="2.6"/><path d="M24 50 L4 30 M76 50 L96 30 M24 58 L6 72 M76 58 L94 72" stroke="#7a604c" stroke-width="6" stroke-linecap="round"/>' + eyes(42, 58, 46, 6, '#c2473c') + '<path d="M40 60 h20" stroke="#3a2a22" stroke-width="3"/>'; },
    colossus: function () { var t = ''; for (var i = 0; i < 26; i++) { var a = i * 0.9, r = 18 + (i % 5) * 5; t += '<circle cx="' + (50 + Math.cos(a) * r * 0.9).toFixed(1) + '" cy="' + (55 + Math.sin(a) * r * 0.75).toFixed(1) + '" r="' + (9 + i % 4) + '" fill="' + (i % 3 ? '#7a604c' : '#8f7a62') + '"/>'; } return t + threadLines(8, 50, 55, 46, '#b9a68a', 11) + eyes(40, 60, 48, 6, '#e9ab3c') + '<path d="M38 66 q12 -6 24 0" stroke="#1a120e" stroke-width="3.5" fill="none"/>'; },
    witch: function () { return '<path d="M50 8 L72 60 H28Z" fill="#34418a"/><path d="M26 60 h48 l6 26 H20z" fill="#4553a8"/><ellipse cx="50" cy="86" rx="22" ry="7" fill="#1a120e"/><path d="M34 80 c4 -8 10 -8 14 0 c4 -8 10 -8 14 0" stroke="#c2473c" stroke-width="4" fill="none"/>' + eyes(44, 56, 46, 4, '#e9ab3c') + '<path d="M28 60 C14 66 12 76 18 84" stroke="#4553a8" stroke-width="6" fill="none" stroke-linecap="round"/>'; },
    unraveler: function () { var l = ''; for (var i = 0; i < 9; i++) l += '<path d="M22 ' + (30 + i * 5) + ' h56" stroke="' + (i % 2 ? '#c2473c' : '#e0665a') + '" stroke-width="4"/>'; return '<rect x="14" y="14" width="72" height="12" rx="4" fill="#3a2a22"/><rect x="14" y="76" width="72" height="12" rx="4" fill="#3a2a22"/><rect x="22" y="26" width="56" height="50" fill="#b8403a"/>' + l + threadLines(9, 78, 50, 26, '#e0665a', 21) + threadLines(7, 22, 60, 22, '#e0665a', 5) + '<circle cx="50" cy="50" r="13" fill="#271b16"/><circle cx="50" cy="50" r="8" fill="#e9ab3c"/><circle cx="52" cy="51" r="4" fill="#1a120e"/>'; }
  };
  function enemy(key) { var f = SPR[key]; return svg('0 0 100 100', f ? f() : '<circle cx="50" cy="50" r="30" fill="#8f7a62"/>'); }

  // ---- card art: procedural motifs drawn from the card's own data ----
  var PAL = { taut: ['#e9ab3c', '#c2473c', '#7a5211'], weave: ['#4553a8', '#6f7fd6', '#2b3a8f'], neutral: ['#8f7a62', '#c2473c', '#4a3a2e'], none: ['#6a5a4e', '#3a2a22', '#1a120e'] };
  function cardArt(id, plan) {
    var p = PAL[plan] || PAL.neutral, h = 0, b = '';
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    function r() { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; }
    var bg = '<rect width="120" height="66" fill="' + (plan === 'weave' ? '#dfe2f2' : plan === 'taut' ? '#f6e2b8' : plan === 'none' ? '#5a4a3e' : '#eedfc0') + '"/>';
    var M = {
      tug: function () { return '<path d="M8 40 C40 30 80 30 112 40" stroke="' + p[1] + '" stroke-width="5" fill="none"/><circle cx="20" cy="37" r="9" fill="' + p[0] + '"/><path d="M95 26 l14 10 -14 10" fill="' + p[2] + '"/>'; },
      brace: function () { return '<path d="M60 8 L92 18 V34 C92 48 78 58 60 62 C42 58 28 48 28 34 V18 Z" fill="' + p[0] + '"/><path d="M40 22h40M38 32h44M42 42h36M48 52h24" stroke="#f4e8cd" stroke-width="3"/>'; },
      pluck: function () { return '<path d="M10 50 L60 20 L110 50" stroke="' + p[1] + '" stroke-width="3" fill="none"/><circle cx="60" cy="20" r="6" fill="' + p[0] + '"/><path d="M54 8 l6 10 6 -10" stroke="' + p[2] + '" stroke-width="2.5" fill="none"/>'; },
      reel: function () { return '<circle cx="60" cy="33" r="22" fill="' + p[0] + '"/><circle cx="60" cy="33" r="7" fill="#f6e2b8"/><path d="M60 33 m0 -16 a16 16 0 1 1 -16 16" stroke="' + p[2] + '" stroke-width="3" fill="none"/><path d="M82 33 C95 33 100 48 115 50" stroke="' + p[1] + '" stroke-width="3" fill="none"/>'; },
      release: function () { var s = ''; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; s += '<path d="M60 33 L' + (60 + Math.cos(a) * 55).toFixed(0) + ' ' + (33 + Math.sin(a) * 30).toFixed(0) + '" stroke="' + p[i % 2] + '" stroke-width="3"/>'; } return s + '<circle cx="60" cy="33" r="8" fill="' + p[2] + '"/>'; },
      snapback: function () { return '<path d="M5 33 H45 L52 20 L60 46 L68 20 L75 33 H115" stroke="' + p[1] + '" stroke-width="4" fill="none"/><path d="M40 12 C20 12 20 54 40 54" stroke="' + p[0] + '" stroke-width="4" fill="none"/><path d="M80 12 C100 12 100 54 80 54" stroke="' + p[0] + '" stroke-width="4" fill="none"/>'; },
      slam: function () { return '<rect x="20" y="18" width="80" height="30" rx="8" fill="' + p[0] + '"/><path d="M28 18v30M40 18v30M52 18v30M64 18v30M76 18v30M88 18v30" stroke="' + p[1] + '" stroke-width="2"/><path d="M10 58 L30 50 M110 58 L90 50" stroke="' + p[2] + '" stroke-width="3"/>'; },
      lash: function () { return '<path d="M10 56 C30 10 60 60 80 18 S108 30 112 10" stroke="' + p[1] + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M104 6 l10 2 -4 9" stroke="' + p[2] + '" stroke-width="3" fill="none"/><circle cx="12" cy="56" r="6" fill="' + p[0] + '"/>'; },
      flick: function () { return '<path d="M20 50 Q50 50 70 26" stroke="' + p[1] + '" stroke-width="3" fill="none"/><circle cx="74" cy="22" r="5" fill="' + p[0] + '"/><path d="M84 14 l10 -6 M86 22 l12 0 M84 30 l10 6" stroke="' + p[2] + '" stroke-width="2.5" stroke-linecap="round"/>'; },
      bline: function () { return '<path d="M60 8 V60" stroke="' + p[2] + '" stroke-width="4"/><path d="M60 10 L14 58 M60 10 L106 58" stroke="' + p[1] + '" stroke-width="2.5"/><path d="M8 60 h104" stroke="' + p[2] + '" stroke-width="3"/><path d="M60 22 L78 30 V40 C78 48 70 54 60 56 C50 54 42 48 42 40 V30 Z" fill="' + p[0] + '" opacity=".9"/>'; },
      hold: function () { return '<path d="M4 33 H116" stroke="' + p[1] + '" stroke-width="3"/><path d="M38 14 h44 v20 c0 14 -12 22 -22 26 c-10 -4 -22 -12 -22 -26z" fill="' + p[0] + '"/><path d="M48 30 h24 M60 20 v28" stroke="#fff3d9" stroke-width="3"/>'; },
      loosen: function () { return '<circle cx="24" cy="33" r="16" fill="' + p[0] + '"/><circle cx="24" cy="33" r="5" fill="#f6e2b8"/><path d="M38 28 C60 28 60 50 80 46 S100 30 116 38" stroke="' + p[1] + '" stroke-width="3" fill="none" stroke-dasharray="6 4"/><path d="M92 14 h20 v12 c0 8 -6 12 -10 14 c-4 -2 -10 -6 -10 -14z" fill="' + p[2] + '"/>'; },
      whip: function () { var s = '<path d="M4 33 H116" stroke="' + p[1] + '" stroke-width="2.5"/>'; for (var i = 0; i < 6; i++) { var x = 14 + i * 17; s += '<path d="M' + x + ' 18 L' + (x + 10) + ' 48" stroke="' + p[i % 2 ? 2 : 0] + '" stroke-width="4" stroke-linecap="round"/>'; } return s; },
      trip: function () { return '<path d="M6 46 H114" stroke="' + p[1] + '" stroke-width="3"/><rect x="6" y="38" width="6" height="16" fill="' + p[2] + '"/><rect x="108" y="38" width="6" height="16" fill="' + p[2] + '"/><path d="M52 46 l8 -18 8 18" fill="none" stroke="' + p[0] + '" stroke-width="3"/><path d="M48 20 l-6 -6 M60 16 v-8 M72 20 l6 -6" stroke="' + p[0] + '" stroke-width="2.5" stroke-linecap="round"/>'; },
      windup: function () { var s = ''; for (var i = 0; i < 4; i++) s += '<circle cx="60" cy="33" r="' + (6 + i * 7) + '" fill="none" stroke="' + p[i % 3] + '" stroke-width="3" stroke-dasharray="' + (20 + i * 10) + ' 8"/>'; return s + '<path d="M96 12 l8 8 -10 2z" fill="' + p[1] + '"/>'; },
      hstring: function () { return '<path d="M8 58 L60 6 L112 58" stroke="' + p[2] + '" stroke-width="3" fill="none"/><path d="M60 6 V58" stroke="' + p[1] + '" stroke-width="4"/><circle cx="60" cy="6" r="5" fill="' + p[0] + '"/><path d="M30 30 h60" stroke="' + p[0] + '" stroke-width="2"/><path d="M22 42 h76" stroke="' + p[0] + '" stroke-width="2" opacity=".6"/>'; },
      weave: function () { var s = ''; for (var y = 8; y < 64; y += 10) s += '<path d="M0 ' + y + ' H120" stroke="' + p[1] + '" stroke-width="4"/>'; for (var x = 8; x < 120; x += 12) s += '<path d="M' + x + ' 0 V66" stroke="' + p[0] + '" stroke-width="5" stroke-dasharray="10 10" stroke-dashoffset="' + (x % 24 ? 10 : 0) + '"/>'; return s; },
      shuttle: function () { return '<path d="M10 33 C30 14 90 14 110 33 C90 52 30 52 10 33Z" fill="' + p[0] + '"/><ellipse cx="60" cy="33" rx="22" ry="7" fill="#dfe2f2"/><path d="M40 33 H80" stroke="' + p[2] + '" stroke-width="3"/><path d="M0 52 H120" stroke="' + p[1] + '" stroke-width="2" stroke-dasharray="4 4"/>'; },
      mesh: function () { var s = ''; for (var i = -60; i < 120; i += 12) { s += '<path d="M' + i + ' 0 L' + (i + 66) + ' 66" stroke="' + p[1] + '" stroke-width="2"/><path d="M' + (i + 66) + ' 0 L' + i + ' 66" stroke="' + p[0] + '" stroke-width="2"/>'; } return s; },
      bolt: function () { return '<ellipse cx="34" cy="33" rx="12" ry="24" fill="' + p[2] + '"/><rect x="34" y="9" width="70" height="48" fill="' + p[0] + '"/><ellipse cx="104" cy="33" rx="12" ry="24" fill="' + p[1] + '"/><ellipse cx="104" cy="33" rx="4" ry="9" fill="' + p[2] + '"/><path d="M40 20 H98 M40 33 H98 M40 46 H98" stroke="#dfe2f2" stroke-width="2" opacity=".6"/>'; },
      heavy: function () { return '<rect x="14" y="30" width="92" height="28" rx="6" fill="' + p[2] + '"/><rect x="24" y="8" width="72" height="24" rx="6" fill="' + p[0] + '"/><path d="M30 8v24M44 8v24M58 8v24M72 8v24M86 8v24" stroke="' + p[1] + '" stroke-width="2"/><path d="M20 44 H100" stroke="#dfe2f2" stroke-width="2"/>'; },
      hem: function () { return '<path d="M0 22 H120 V48 H0Z" fill="' + p[0] + '"/><path d="M0 48 H120" stroke="' + p[2] + '" stroke-width="4"/><path d="M4 42 H116" stroke="#f4e8cd" stroke-width="2.5" stroke-dasharray="7 5"/><path d="M90 14 L110 6" stroke="#c3ae8e" stroke-width="3"/><circle cx="88" cy="15" r="2" fill="#c3ae8e"/>'; },
      dknit: function () { var s = ''; for (var i = 0; i < 2; i++) { var x = 30 + i * 46; s += '<path d="M' + x + ' 10 L' + (x + 18) + ' 16 V28 C' + (x + 18) + ' 40 ' + (x + 9) + ' 48 ' + x + ' 52 C' + (x - 9) + ' 48 ' + (x - 18) + ' 40 ' + (x - 18) + ' 28 V16 Z" fill="' + p[i] + '"/>'; } return s + '<path d="M50 56 C55 62 65 62 70 56" stroke="' + p[2] + '" stroke-width="3" fill="none"/>'; },
      barbed: function () { var s = '<path d="M0 33 H120" stroke="' + p[0] + '" stroke-width="5"/>'; for (var x = 10; x < 120; x += 20) s += '<path d="M' + x + ' 33 l6 -12 M' + x + ' 33 l6 12 M' + (x + 4) + ' 33 l-6 -12" stroke="' + p[2] + '" stroke-width="2.5" stroke-linecap="round"/>'; return s; },
      felting: function () { var s = ''; for (var i = 0; i < 28; i++) { var x = 10 + r() * 100, y = 8 + r() * 50; s += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + ' q' + (r() * 12 - 6).toFixed(0) + ' ' + (r() * 12 - 6).toFixed(0) + ' ' + (r() * 16 - 8).toFixed(0) + ' ' + (r() * 16 - 8).toFixed(0) + '" stroke="' + p[i % 3] + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>'; } return s; },
      snip: function () { return '<circle cx="26" cy="22" r="9" fill="none" stroke="' + p[2] + '" stroke-width="4"/><circle cx="26" cy="46" r="9" fill="none" stroke="' + p[2] + '" stroke-width="4"/><path d="M33 26 L92 40 M33 42 L92 26" stroke="' + p[0] + '" stroke-width="5" stroke-linecap="round"/><path d="M96 33 H120" stroke="' + p[1] + '" stroke-width="3" stroke-dasharray="4 3"/>'; },
      fray: function () { var s = '<path d="M0 33 H60" stroke="' + p[1] + '" stroke-width="6"/>'; for (var i = 0; i < 7; i++) s += '<path d="M58 33 q' + (14 + r() * 10).toFixed(0) + ' ' + (r() * 30 - 15).toFixed(0) + ' ' + (36 + r() * 20).toFixed(0) + ' ' + (r() * 44 - 22).toFixed(0) + '" stroke="' + p[i % 3] + '" stroke-width="2" fill="none"/>'; return s; },
      unspool: function () { return '<rect x="12" y="12" width="26" height="42" rx="3" fill="' + p[0] + '"/><rect x="8" y="10" width="34" height="5" rx="2" fill="' + p[2] + '"/><rect x="8" y="52" width="34" height="5" rx="2" fill="' + p[2] + '"/><path d="M38 24 C70 20 60 52 90 46 S114 22 118 30" stroke="' + p[1] + '" stroke-width="3" fill="none"/>'; },
      heave: function () { return '<path d="M8 58 H112" stroke="' + p[2] + '" stroke-width="3"/><rect x="40" y="22" width="40" height="36" rx="4" fill="' + p[0] + '"/><path d="M60 22 V4" stroke="' + p[1] + '" stroke-width="4"/><path d="M52 10 l8 -8 8 8" fill="none" stroke="' + p[1] + '" stroke-width="3"/><path d="M48 34 h24" stroke="#f4e8cd" stroke-width="3"/>'; },
      sweep: function () { return '<path d="M8 50 C30 14 90 14 112 50" stroke="' + p[1] + '" stroke-width="5" fill="none"/><path d="M14 56 C34 26 86 26 106 56" stroke="' + p[0] + '" stroke-width="3" fill="none" opacity=".7"/><path d="M104 40 l10 12 -14 2z" fill="' + p[1] + '"/>'; },
      snare: function () { return '<circle cx="60" cy="36" r="20" fill="none" stroke="' + p[1] + '" stroke-width="4"/><path d="M80 36 C96 36 104 20 116 12" stroke="' + p[1] + '" stroke-width="4" fill="none"/><path d="M48 30 h24 M48 38 h24 M48 46 h24 M54 20 v32 M66 20 v32" stroke="' + p[2] + '" stroke-width="1.5" opacity=".6"/>'; },
      breath: function () { return '<path d="M10 40 C30 20 50 50 70 30 S100 20 112 30" stroke="' + p[0] + '" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M20 52 C40 36 60 60 84 44" stroke="' + p[1] + '" stroke-width="3" fill="none" opacity=".7"/><path d="M90 6 L80 26 H90 L84 42 L102 18 H92 L98 6Z" fill="#6f7fd6"/>'; },
      patch: function () { return '<rect x="30" y="12" width="60" height="42" rx="4" fill="' + p[0] + '" transform="rotate(-6 60 33)"/><rect x="30" y="12" width="60" height="42" rx="4" fill="none" stroke="#f4e8cd" stroke-width="2.5" stroke-dasharray="6 4" transform="rotate(-6 60 33)"/><path d="M52 33 h16 M60 25 v16" stroke="#c4f0a0" stroke-width="4"/>'; },
      knot: function () { return '<path d="M10 50 C40 50 40 14 60 14 C80 14 80 40 60 40 C40 40 48 10 70 12 M60 40 C80 40 90 52 112 52" stroke="#c3ae8e" stroke-width="5" fill="none" stroke-linecap="round"/>'; }
    };
    if (M[id]) b = M[id]();
    else {
      // generic motif: woven bands + loose threads seeded by id, styled by plan
      var n = 3 + Math.floor(r() * 4);
      for (var k = 0; k < n; k++) {
        var y = 8 + r() * 50, c = p[k % 3];
        b += '<path d="M0 ' + y.toFixed(0) + ' C40 ' + (y - 14 + r() * 28).toFixed(0) + ' 80 ' + (y - 14 + r() * 28).toFixed(0) + ' 120 ' + (y + r() * 10 - 5).toFixed(0) + '" stroke="' + c + '" stroke-width="' + (2 + r() * 5).toFixed(1) + '" fill="none" stroke-linecap="round"/>';
      }
      if (plan === 'weave') for (var x = 10; x < 120; x += 14) b += '<path d="M' + x + ' 0 V66" stroke="' + p[2] + '" stroke-width="2" opacity=".35"/>';
      if (plan === 'taut') b += '<circle cx="' + (30 + r() * 60).toFixed(0) + '" cy="' + (20 + r() * 26).toFixed(0) + '" r="' + (5 + r() * 7).toFixed(0) + '" fill="' + p[1] + '"/>';
    }
    return svg('0 0 120 66', bg + b, ' preserveAspectRatio="xMidYMid slice"');
  }
  return { I: I, enemy: enemy, cardArt: cardArt };
})();
