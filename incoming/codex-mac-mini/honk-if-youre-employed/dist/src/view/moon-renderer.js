import { MOON } from '../contracts.js';
import { MOON_LOADOUTS } from '../sim/moon-content.js';

const INK = '#242135', CREAM = '#fff2cb', PINK = '#fc8ba4', GREEN = '#d5ef80', PURPLE = '#a69bce';
const TAU = Math.PI * 2;

/** Original procedural art. No assets, browser randomness, or world mutation. */
export function createMoonRenderer(canvas) {
  const c = canvas.getContext('2d');
  let particles = [], words = [], rings = [], visualTime = 0, shake = 0, reduced = false, previewLoadout = 'classic';
  let cameraX = 640, visibleWidth = 1280, drawingTitle = true;
  function ellipse(x, y, rx, ry, fill, stroke = INK, width = 3) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
  }
  function line(points, color = INK, width = 3) {
    c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  function box(x, y, width, height, radius, fill, stroke = INK, weight = 3) {
    c.beginPath(); c.roundRect(x, y, width, height, radius); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = weight; c.stroke(); }
  }
  function text(label, x, y, size = 16, color = CREAM, align = 'center', font = 'monospace') {
    c.fillStyle = color; c.font = `bold ${size}px ${font}`; c.textAlign = align; c.fillText(label, x, y);
  }
  function star(x, y, radius, color, turn = 0, points = 4) {
    c.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = turn + i * Math.PI / points, r = i % 2 ? radius * 0.28 : radius;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath(); c.fillStyle = color; c.fill();
  }
  function eye(x, y, r, lookX = 0, lookY = 0, fill = CREAM) {
    ellipse(x, y, r, r * 1.22, fill);
    ellipse(x + lookX * r * 0.32, y + lookY * r * 0.25, r * 0.41, r * 0.55, INK, null);
    ellipse(x + lookX * r * 0.32 + 2, y + lookY * r * 0.25 - 3, r * 0.13, r * 0.16, '#fff', null);
  }
  function tooth(x, y, scale = 1, angle = 0) {
    c.save(); c.translate(x, y); c.rotate(angle); c.scale(scale, scale);
    c.beginPath(); c.moveTo(-10, -7); c.bezierCurveTo(-15, -20, 1, -19, 0, -13); c.bezierCurveTo(12, -22, 18, -10, 10, 1);
    c.bezierCurveTo(9, 20, 3, 17, 1, 5); c.bezierCurveTo(-4, 20, -10, 14, -10, -7);
    c.fillStyle = GREEN; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke();
    c.restore();
  }
  function toaster(x, y, angle = 0, scale = 1, time = 0, dash = false, loadout = 'classic') {
    c.save(); c.translate(x, y); c.scale(scale, scale);
    ellipse(0, 30, 28, 7, '#15122255', null);
    if (dash) { line([[-34, -8], [-55, -8]], GREEN, 4); line([[-32, 6], [-66, 6]], GREEN, 4); }
    const foot = Math.sin(time * 14) * 4;
    line([[-15, 14], [-17 - foot, 30], [-29 - foot, 30]], CREAM, 6);
    line([[14, 14], [17 + foot, 30], [29 + foot, 30]], CREAM, 6);
    for (const fx of [-29 - foot, -17 - foot, 17 + foot, 29 + foot]) ellipse(fx, 36, 4, 4, GREEN, INK, 2);
    box(-30, -26, 60, 48, loadout === 'tank' ? 5 : 14, MOON_LOADOUTS.find(l => l.id === loadout)?.color || PINK, INK, 3.5);
    if (loadout === 'tank') for (let i = -20; i <= 20; i += 10) { line([[i, -21], [i, 18]], '#b8784b', 1); line([[-25, i], [25, i]], '#b8784b', 1); }
    if (loadout === 'courier') { line([[-32, -17], [-47, -24], [-44, -12], [-56, -19]], CREAM, 3); }
    box(-19, -32, 38, 10, 4, INK);
    box(-15, -43, 30, 18, 5, '#eeb47c', INK, 2.5);
    box(-11, -39, 22, 10, 3, CREAM, null);
    eye(-11, -7, 7, Math.cos(angle), Math.sin(angle)); eye(10, -7, 7, Math.cos(angle), Math.sin(angle));
    line([[-7, 10], [0, 13], [7, 10]], INK, 2.5);
    line([[31, -7], [39, -7], [39, -18]], INK, 4); ellipse(39, -20, 5, 5, GREEN);
    c.restore();
  }
  function moon(x, y, radius, time, look, fed = false, title = false) {
    c.save(); c.translate(x, y); const s = radius / 80; c.scale(s, s);
    // The moon has a perfectly normal pair of gloved hands.
    line([[-69, 30], [-104, 46], [-120, 18]], PURPLE, 9);
    line([[69, 30], [105, 45], [122, 15]], PURPLE, 9);
    for (const side of [-1, 1]) {
      ellipse(side * 121, 12, 13, 18, CREAM, INK, 2.5);
      line([[side * 125, 4], [side * 128, -9]], CREAM, 6);
    }
    ellipse(6, 13, 81, 80, '#11101d66', null);
    ellipse(0, 0, 80, 80, CREAM, INK, 4);
    ellipse(-47, -34, 12, 9, '#dfd3ad', null); ellipse(47, 33, 11, 16, '#dfd3ad', null);
    ellipse(21, -59, 8, 5, '#dfd3ad', null); ellipse(-52, 29, 7, 8, '#dfd3ad', null);
    const a = look ? Math.atan2(look.y - y, look.x - x) : Math.sin(time / 2);
    eye(-24, -19, 16, Math.cos(a), Math.sin(a)); eye(24, -19, 16, Math.cos(a), Math.sin(a));
    line([[-42, -39], [-24, -44], [-9, -39]], INK, 4); line([[9, -39], [24, -44], [42, -39]], INK, 4);
    const mouthH = fed ? 29 + Math.sin(time * 22) * 6 : title ? 24 + Math.sin(time * 2) * 3 : 20;
    ellipse(0, 29, 35, mouthH, INK, null);
    c.save(); c.beginPath(); c.ellipse(0, 29, 35, mouthH, 0, 0, TAU); c.clip();
    ellipse(6, 45, 22, 10, PINK, null);
    for (let i = -2; i <= 2; i++) box(i * 12 - 5, 29 - mouthH - 2, 10, 12, 2, '#fff9e8', null);
    c.restore();
    ellipse(-43, 6, 11, 5, PINK, null); ellipse(43, 6, 11, 5, PINK, null);
    c.restore();
  }
  function enemy(e, t) {
    c.save(); c.translate(e.x, e.y); c.rotate(Math.sin(t * 4 + e.wobble) * 0.12);
    if (e.spawn > 0) {
      c.globalAlpha = 0.45 + Math.sin(t * 20) * 0.15;
      c.setLineDash([4, 5]); ellipse(0, 0, 32, 32, '#fc8ba418', PINK, 2); c.setLineDash([]);
    }
    ellipse(0, 23, 24, 6, '#15122266', null);
    if (e.kind === 'clock') {
      ellipse(-16, -23, 10, 7, PINK); ellipse(16, -23, 10, 7, PINK);
      line([[-12, 16], [-18, 28]], CREAM, 4); line([[12, 16], [18, 28]], CREAM, 4);
      ellipse(0, 0, 23, 23, e.hit ? '#fff' : '#f9b77a'); ellipse(0, 0, 17, 17, CREAM, INK, 2);
      line([[0, -11], [0, 0], [10, 6]], INK, 2.5);
      line([[-13, -7], [-4, -3]], INK, 3); line([[13, -7], [4, -3]], INK, 3);
      ellipse(-8, 0, 2, 3, INK, null); ellipse(8, 0, 2, 3, INK, null);
    } else if (e.kind === 'mail') {
      line([[-12, 16], [-18, 31], [-26, 31]], PINK, 4); line([[12, 16], [18, 31], [26, 31]], PINK, 4);
      box(-27, -19, 54, 38, 3, e.hit ? '#fff' : '#b3acd8');
      line([[-26, -17], [0, 5], [26, -17]], INK, 2);
      box(13, -14, 8, 9, 0, PINK, INK, 1);
      eye(-10, 0, 5, 0, 1); eye(8, 0, 5, 0, 1);
      line([[-7, 12], [5, 10]], INK, 2);
    } else if (e.kind === 'chair') {
      line([[-14, 11], [-21, 30], [-31, 30]], '#96d9ce', 5);
      line([[14, 11], [21, 30], [31, 30]], '#96d9ce', 5);
      box(-21, -31, 42, 36, 7, e.hit ? CREAM : '#96d9ce');
      box(-28, 4, 56, 12, 4, e.windup ? PINK : '#96d9ce');
      eye(-9, -17, 7, 0, 1); eye(9, -17, 7, 0, 1);
      line([[-20, -5], [-32, -5], [-32, 8]], INK, 4); line([[20, -5], [32, -5], [32, 8]], INK, 4);
      for (const side of [-1, 1]) ellipse(side * 27, 32, 5, 5, CREAM, INK, 2);
    } else if (e.kind === 'phone') {
      box(-27, -6, 54, 31, 8, e.hit ? CREAM : PINK);
      box(-30, -25, 60, 16, 8, '#c7b8e6');
      box(-31, -18, 15, 17, 6, '#c7b8e6'); box(16, -18, 15, 17, 6, '#c7b8e6');
      ellipse(0, 10, 12, 12, CREAM, INK, 2);
      for (let i = 0; i < 8; i++) ellipse(Math.cos(i * TAU / 8) * 8, 10 + Math.sin(i * TAU / 8) * 8, 1.8, 1.8, INK, null);
      eye(-11, -16, 5, 0, 1); eye(11, -16, 5, 0, 1);
      if (e.attack < 65) { line([[-38, -25], [-44, -12], [-39, 0]], PINK, 2); line([[38, -25], [44, -12], [39, 0]], PINK, 2); }
    } else {
      c.beginPath(); c.moveTo(-18, 0); c.lineTo(-40, -18); c.lineTo(-40, 18); c.closePath(); c.fillStyle = GREEN; c.fill(); c.strokeStyle = INK; c.stroke();
      ellipse(0, 0, 28, 21, e.hit ? '#fff' : GREEN);
      box(-10, 3, 22, 17, 2, '#544469');
      line([[-3, 3], [2, 14], [7, 3]], CREAM, 2);
      eye(14, -6, 8, 1, 0); line([[22, 10], [30, 8]], INK, 3);
      line([[-10, 18], [-10, 28], [-18, 28]], PINK, 4);
    }
    if (e.hp < e.maxHp) { box(-20, -37, 40, 4, 2, INK, null); box(-20, -37, 40 * e.hp / e.maxHp, 4, 2, PINK, null); }
    c.restore();
  }
  function sun(b, t) {
    c.save(); c.translate(b.x, b.y);
    for (let i = 0; i < 16; i++) {
      const a = i * TAU / 16 + t * 0.2;
      line([[Math.cos(a) * 73, Math.sin(a) * 73], [Math.cos(a + 0.1) * 94, Math.sin(a + 0.1) * 94]], b.phase === 2 ? PINK : '#f3b871', 9);
    }
    if (b.telegraph) ellipse(0, 0, 100 + b.telegraph / 2, 100 + b.telegraph / 2, '#fc8ba414', PINK, 2);
    ellipse(0, 0, 65, 65, b.hit ? CREAM : '#f3b871', INK, 4);
    eye(-21, -12, 17, 0, 1); eye(21, -12, 17, 0, 1);
    line([[-43, -35], [-8, -25]], INK, 6); line([[43, -35], [8, -25]], INK, 6);
    box(-28, 20, 56, 18, 2, INK);
    for (let i = -2; i <= 2; i++) line([[i * 9, 22], [i * 9, 36]], CREAM, 5);
    box(-38, 44, 76, 19, 3, CREAM); text('HUMAN RESOURCES', 0, 56, 7, INK);
    c.restore();
  }
  function background(t, title) {
    c.fillStyle = INK; c.fillRect(0, 0, 1280, 640);
    // Quiet checkerboard, screen-printed orbital rings, and a few decidedly wrong stars.
    for (let y = 0; y < 640; y += 80) for (let x = 0; x < 1280; x += 80) {
      if ((x / 80 + y / 80) % 2 === 0) { c.fillStyle = '#ffffff03'; c.fillRect(x, y, 80, 80); }
    }
    c.strokeStyle = '#b3acd819'; c.lineWidth = 1;
    for (let r = 150; r < 650; r += 110) { c.beginPath(); c.ellipse(title ? 890 : 640, 300, r, r * 0.84, -0.2, 0, TAU); c.stroke(); }
    for (let i = 0; i < 48; i++) {
      const x = (i * 197 + 61) % 1240 + 20, y = (i * 127 + 23) % 600 + 20;
      c.globalAlpha = 0.2 + Math.sin(t + i) * 0.08;
      if (i % 7 === 0) star(x, y, 7, CREAM, Math.PI / 4); else ellipse(x, y, 1.3, 1.3, CREAM, null);
    }
    c.globalAlpha = 1;
    c.setLineDash([7, 8]); box(18, 18, 1244, 604, 16, '#00000000', '#b3acd82b', 1); c.setLineDash([]);
  }
  function drawTitle(t) {
    background(t, true);
    c.save(); c.translate(895, 290); c.rotate(-0.22);
    c.strokeStyle = '#c4b8e555'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 285, 100, 0, 0, TAU); c.stroke(); c.restore();
    moon(882, 268 + Math.sin(t) * 9, 153, t, null, false, true);
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6 + t * 0.08;
      tooth(884 + Math.cos(a) * 262, 280 + Math.sin(a) * 180, 1.35, a * 0.3);
    }
    star(1080, 85, 35, PINK, t * 0.08, 9); star(627, 180, 21, GREEN, t * 0.1);
    toaster(736, 504 + Math.sin(t * 2) * 4, -1.1, 1.8, t, false, previewLoadout);
    c.save(); c.translate(1084, 455); c.rotate(0.14);
    box(-71, -40, 142, 80, 2, PINK, INK, 3); text('RENT DUE', 0, -12, 17, INK); text('8 TEETH', 0, 15, 23, INK); text('NO REFUNDS. EVER.', 0, 32, 8, INK); c.restore();
    text('FIG. 01 — AN ENTIRELY REASONABLE LANDLORD', 913, 599, 10, '#b7accb');
  }
  function consume(events) {
    for (const e of events) {
      if (['pop', 'hurt', 'feed', 'burp', 'dash', 'win', 'portal', 'reflect', 'block', 'heal'].includes(e.type)) {
        const count = e.type === 'pop' ? 12 : e.type === 'burp' ? 32 : e.type === 'win' ? 70 : 5;
        const color = e.type === 'hurt' ? PINK : e.type === 'feed' ? GREEN : CREAM;
        for (let i = 0; i < count; i++) {
          const a = i * 2.39996 + e.tick, speed = 50 + (i * 31 % 170);
          particles.push({ x: e.x ?? 640, y: e.y ?? 300, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.5 + (i % 4) * 0.12, color, size: 3 + i % 4 });
        }
      }
      if (e.type === 'pop') {
        const labels = ['CRUNCH.', 'UNEMPLOYED!', 'POP!', 'NO THANKS.', 'TOASTED.', 'RETURN TO SENDER'];
        words.push({ x: e.x, y: e.y - 30, label: labels[e.tick % labels.length], life: 0.8, color: CREAM });
      }
      if (e.type === 'feed') {
        rings.push({ x: e.moonX ?? MOON.x, y: e.moonY ?? MOON.y, radius: 80, life: 0.45, color: GREEN, speed: 70 });
        if (e.tick % 3 === 0) words.push({ x: e.moonX ?? MOON.x, y: (e.moonY ?? MOON.y) - 95, label: '+1 TOOTH', life: 0.7, color: GREEN });
      }
      if (e.type === 'burp') {
        rings.push({ x: e.x, y: e.y, radius: 20, life: 0.7, color: GREEN, speed: e.radius / 0.7 });
        words.push({ x: e.x, y: e.y - 40, label: 'B U U U R P.', life: 1.1, color: GREEN });
        shake = 7;
      }
      if (e.type === 'hurt') shake = 11;
      if (e.type === 'blast') rings.push({ x: e.x, y: e.y, radius: 10, life: 0.4, color: PINK, speed: 180 });
      if (e.type === 'reflect') words.push({ x: e.x, y: e.y - 20, label: 'NO, YOU.', life: 0.65, color: '#96d9ce' });
      if (e.type === 'heal') words.push({ x: e.x, y: e.y - 30, label: '+1 DENTAL BENEFIT', life: 1, color: GREEN });
      if (e.type === 'portal') { rings.push({ x: e.fromX, y: e.fromY, radius: 20, life: 0.5, color: '#96d9ce', speed: 120 }); words.push({ x: e.x, y: e.y - 40, label: 'WRONG ROOM. PERFECT.', life: 1, color: '#96d9ce' }); }
    }
    particles = particles.slice(-280); words = words.slice(-22); rings = rings.slice(-15);
  }
  return {
    consume,
    setReduced(value) { reduced = value; },
    setLoadout(value) { previewLoadout = value; },
    reset() { particles = []; words = []; rings = []; shake = 0; },
    screenToWorld(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const width = drawingTitle ? 1280 : Math.min(1280, 640 * rect.width / rect.height);
      const scale = Math.min(rect.width / width, rect.height / 640);
      return { x: (clientX - rect.left - (rect.width - width * scale) / 2) / scale + cameraX - width / 2,
        y: (clientY - rect.top - (rect.height - 640 * scale) / 2) / scale };
    },
    draw(w, seconds, title = false, frozen = false) {
      const dt = Math.min(seconds, 0.05); if (!frozen && !reduced) visualTime += dt;
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      drawingTitle = title;
      visibleWidth = title ? 1280 : Math.min(1280, 640 * width / height);
      cameraX = title ? 640 : Math.max(visibleWidth / 2, Math.min(1280 - visibleWidth / 2, w.player.x));
      const scale = Math.min(width / visibleWidth, height / 640);
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = INK; c.fillRect(0, 0, width, height);
      c.setTransform(scale, 0, 0, scale, width / 2 - cameraX * scale, (height - 640 * scale) / 2);
      c.lineCap = 'round'; c.lineJoin = 'round';
      if (title) { drawTitle(visualTime); return; }
      c.save();
      if (shake > 0 && !reduced) c.translate(Math.sin(visualTime * 87) * shake, Math.cos(visualTime * 73) * shake * 0.5);
      shake = Math.max(0, shake - dt * 35);
      background(visualTime, false);
      if (w.law === 'soup') {
        c.fillStyle = '#d5ef8010'; c.fillRect(0, 0, 1280, 640);
        for (let i = 0; i < 12; i++) { c.strokeStyle = '#d5ef8030'; c.beginPath(); c.ellipse((i * 211 + 70) % 1280, (i * 137 + 25) % 640, 40 + Math.sin(visualTime + i) * 10, 10, 0, 0, TAU); c.stroke(); }
      }
      for (const [i, door] of (w.portals || []).entries()) {
        const color = i ? PINK : '#96d9ce';
        ellipse(door.x, door.y + 36, 45, 12, `${color}22`, null);
        box(door.x - 26, door.y - 42, 52, 80, [24, 24, 2, 2], `${color}15`, color, 2.5);
        for (let lineIndex = 0; lineIndex < 4; lineIndex++) {
          const dy = ((visualTime * 30 + lineIndex * 18) % 67) - 32;
          line([[door.x - 18, door.y + dy], [door.x + 18, door.y + dy]], `${color}66`, 1);
        }
        eye(door.x, door.y - 13, 9, 0, 1, color); text(i ? 'SOMEWHERE ELSE' : 'UNAUTHORIZED DOOR', door.x, door.y + 58, 8, color);
      }
      for (const h of (w.hazards || [])) {
        const warning = h.warning > 0;
        ellipse(h.x, h.y, h.radius, h.radius, warning ? '#fc8ba412' : '#fc8ba466', PINK, warning ? 2 : 4);
        c.setLineDash([4, 6]); ellipse(h.x, h.y, warning ? h.radius * (1 - h.warning / h.totalWarning) : h.radius * 0.7, warning ? h.radius * (1 - h.warning / h.totalWarning) : h.radius * 0.7, '#00000000', PINK, 2); c.setLineDash([]);
        text(warning ? 'MOVE!' : 'DENIED', h.x, h.y + 5, warning ? 13 : 20, warning ? PINK : CREAM);
      }
      const feeding = w.depositTicks > 0, moonPosition = w.moon || MOON;
      if (!w.boss) {
        c.setLineDash([5, 9]); ellipse(moonPosition.x, moonPosition.y, 145, 145, feeding ? '#d5ef8018' : '#d5ef8007', feeding ? GREEN : '#d5ef8044', 2); c.setLineDash([]);
        if (w.law === 'legs') for (const side of [-1, 1]) {
          const step = Math.sin(visualTime * 8) * 14 * side;
          line([[moonPosition.x + side * 35, moonPosition.y + 55], [moonPosition.x + side * 48 + step, moonPosition.y + 91], [moonPosition.x + side * 74 + step, moonPosition.y + 91]], PURPLE, 10);
          ellipse(moonPosition.x + side * 70 + step, moonPosition.y + 95, 20, 8, PINK, INK, 2);
        }
        moon(moonPosition.x, moonPosition.y, 80, visualTime, w.player, feeding);
        text(w.player.bag ? 'BRING YOUR TEETH HERE' : 'RENT COLLECTION', moonPosition.x, moonPosition.y + 120, 11, w.player.bag ? GREEN : '#a49ab5');
      } else { moon(moonPosition.x, moonPosition.y, 51, visualTime, w.player, feeding); text('TOAST THE SUN. FREE THE MOON.', moonPosition.x, moonPosition.y + 80, 11, GREEN); }
      for (const d of w.drops) {
        c.globalAlpha = d.ttl < 180 ? 0.4 + Math.sin(visualTime * 15) * 0.3 : 1;
        ellipse(d.x, d.y + 6, 13, 5, '#d5ef8018', null);
        tooth(d.x, d.y + (reduced ? 0 : Math.sin(visualTime * 4 + d.wobble) * 3), 0.65, Math.sin(d.wobble) * 0.15);
      }
      c.globalAlpha = 1;
      for (const e of w.enemies) {
        if (e.windup > 0) { c.setLineDash([7, 6]); line([[e.x, e.y], [e.x + Math.cos(e.chargeAngle) * 240, e.y + Math.sin(e.chargeAngle) * 240]], PINK, 3); c.setLineDash([]); }
        enemy(e, visualTime);
      }
      if (w.boss) sun(w.boss, visualTime);
      if (w.boss && Math.abs(w.boss.x - cameraX) > visibleWidth / 2 - 65) {
        const markerX = cameraX + Math.sign(w.boss.x - cameraX) * (visibleWidth / 2 - 32);
        star(markerX, 145, 18, '#f3b871', visualTime * 0.2, 8); text('HR', markerX, 178, 10, '#f3b871');
      }
      for (const s of w.shots) {
        if (s.enemy) { ellipse(s.x, s.y, 11, 11, '#fc8ba425', null); ellipse(s.x, s.y, 6, 6, PINK, CREAM, 1.5); }
        else { c.save(); c.translate(s.x, s.y); c.rotate(s.angle + Math.PI / 2); box(-7, -9, 14, 18, 4, '#eeb47c', INK, 2); box(-4, -6, 8, 11, 2, CREAM, null); c.restore(); }
      }
      const p = w.player;
      for (const orb of (w.orbits || [])) { ellipse(orb.x, orb.y, 15, 15, '#eeb47c', CREAM, 2); ellipse(orb.x, orb.y, 6, 6, INK, null); }
      if (p.dashTicks > 0) {
        for (let i = 3; i > 0; i--) { c.globalAlpha = 0.09 * (4 - i); toaster(p.x - p.vx * i * 0.012, p.y - p.vy * i * 0.012, p.aim, p.radius / 24, visualTime, true, w.loadout); }
      }
      c.globalAlpha = p.invulnerable > 0 && w.tick % 8 < 4 ? 0.45 : 1;
      toaster(p.x, p.y, p.aim, p.radius / 24, Math.hypot(p.vx, p.vy) > 20 ? visualTime : 0, p.dashTicks > 0, w.loadout);
      c.globalAlpha = 1;
      if (p.bag) { box(p.x - 18, p.y + 43, 36, 19, 9, GREEN, INK, 1.5); text(String(p.bag), p.x, p.y + 57, 12, INK); }
      if (p.bag && !p.remote && !w.boss && Math.hypot(p.x - moonPosition.x, p.y - moonPosition.y) > 170) {
        const direction = Math.atan2(moonPosition.y - p.y, moonPosition.x - p.x), arrowX = p.x + Math.cos(direction) * 75, arrowY = p.y + Math.sin(direction) * 75;
        c.save(); c.translate(arrowX, arrowY); c.rotate(direction); line([[-8, -7], [4, 0], [-8, 7]], GREEN, 3); c.restore();
        text('RENT', arrowX, arrowY + 20, 8, GREEN);
      }
      if (p.refund || w.law === 'refund') { c.setLineDash([4, 8]); ellipse(p.x, p.y, 43, 43, '#00000000', p.dashTicks > 0 ? '#96d9ce' : '#96d9ce33', 2); c.setLineDash([]); }
      // Aiming reticle follows the actual simulated aim, not decorative camera movement.
      const ax = p.x + Math.cos(p.aim) * 67, ay = p.y + Math.sin(p.aim) * 67;
      line([[ax - 5, ay], [ax + 5, ay]], CREAM, 1.5); line([[ax, ay - 5], [ax, ay + 5]], CREAM, 1.5);
      if (!frozen) {
        for (const part of particles) { part.x += part.vx * dt; part.y += part.vy * dt; part.life -= dt; }
        for (const word of words) { word.y -= 26 * dt; word.life -= dt; }
        for (const ring of rings) { ring.radius += ring.speed * dt; ring.life -= dt; }
      }
      particles = particles.filter(particle => particle.life > 0); words = words.filter(word => word.life > 0); rings = rings.filter(ring => ring.life > 0);
      if (!reduced) for (const part of particles) { c.globalAlpha = Math.min(1, part.life * 2); c.fillStyle = part.color; c.fillRect(part.x, part.y, part.size, part.size); }
      for (const ring of rings) { c.globalAlpha = ring.life; ellipse(ring.x, ring.y, ring.radius, ring.radius, '#00000000', ring.color, 3); }
      for (const word of words) { c.globalAlpha = Math.min(1, word.life * 3); text(word.label, word.x, word.y, 13, word.color); }
      c.globalAlpha = 1; c.restore();
    },
  };
}
