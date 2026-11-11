import { ACT_NAMES, ARENA, HEIGHT, WIDTH, MIN_HISTORY_TICKS } from '../contracts.js';
import { cosmeticRandom, createEffects, INK } from './effects.js';

const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const lerp = (a, b, t) => a + (b - a) * t;
const position = (entity, alpha) => ({
  x: lerp(entity.prevX ?? entity.x, entity.x, alpha),
  y: lerp(entity.prevY ?? entity.y, entity.y, alpha),
});

function surface(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

function polygon(ctx, points, fill, stroke, width = 1) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function arc(ctx, x, y, radius, start, end, color, width = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function glowSprite(color) {
  const { canvas, ctx } = surface(128, 128);
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.18, color);
  gradient.addColorStop(1, '#00000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

function makeEclipse(random) {
  const { canvas, ctx } = surface(840, 840);
  const cx = 420;
  const cy = 420;
  const radius = 232;
  const corona = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, 416);
  corona.addColorStop(0, '#00000000');
  corona.addColorStop(0.24, '#f4be7966');
  corona.addColorStop(0.31, '#ffb363a0');
  corona.addColorStop(0.4, '#bb653e45');
  corona.addColorStop(0.65, '#8d382d15');
  corona.addColorStop(1, '#00000000');
  ctx.fillStyle = corona;
  ctx.fillRect(0, 0, 840, 840);
  for (let i = 0; i < 370; i += 1) {
    const angle = random() * TAU;
    const length = 8 + random() ** 3 * 108;
    const inner = radius - 2 + random() * 5;
    const outer = radius + length;
    const opacity = 0.02 + random() * 0.1;
    ctx.strokeStyle = `rgba(255,188,119,${opacity})`;
    ctx.lineWidth = 0.3 + random() * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.quadraticCurveTo(cx + Math.cos(angle + 0.025) * (inner + length * 0.6), cy + Math.sin(angle + 0.025) * (inner + length * 0.6), cx + Math.cos(angle + 0.035) * outer, cy + Math.sin(angle + 0.035) * outer);
    ctx.stroke();
  }
  const blackSun = ctx.createRadialGradient(cx - 90, cy - 100, 5, cx, cy, radius);
  blackSun.addColorStop(0, '#070b10');
  blackSun.addColorStop(0.85, '#07090d');
  blackSun.addColorStop(1, '#120e10');
  ctx.fillStyle = blackSun;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();
  arc(ctx, cx, cy, radius + 0.8, 0, TAU, '#eebd7faa', 2.8);
  arc(ctx, cx, cy, radius + 3, -0.6, 2.1, '#ffe5a8aa', 1.2);
  arc(ctx, cx, cy, radius - 1, 2.1, 5.7, '#8b5b43', 1);
  return canvas;
}

function makeFloor(random) {
  const { canvas, ctx } = surface(WIDTH, HEIGHT);
  const { x, y, radius } = ARENA;
  ctx.save();
  ctx.translate(x, y);
  // The offset stone foundation creates a physical edge below the walkable disc.
  ctx.fillStyle = '#030708';
  ctx.beginPath(); ctx.ellipse(0, 18, radius + 12, radius + 7, 0, 0, TAU); ctx.fill();
  arc(ctx, 0, 10, radius + 3, 0, Math.PI, '#302d26', 13);
  arc(ctx, 0, 13, radius + 2, 0.15, Math.PI - 0.15, '#0e1212', 3);
  const floor = ctx.createRadialGradient(-70, -90, 20, 0, 0, radius);
  floor.addColorStop(0, '#172321');
  floor.addColorStop(0.6, '#121c1c');
  floor.addColorStop(1, '#0c1517');
  ctx.fillStyle = floor;
  ctx.beginPath(); ctx.arc(0, 0, radius, 0, TAU); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, radius - 3, 0, TAU); ctx.clip();
  // Individually cut, slightly irregular radial slabs; no grid under the combat.
  for (let band = 0; band < 5; band += 1) {
    const inner = band === 0 ? 40 : 42 + band * 54;
    const outer = inner + 52;
    const count = 10 + band * 6;
    const offset = band * 0.19;
    for (let i = 0; i < count; i += 1) {
      const a = i / count * TAU + offset + 0.008;
      const b = (i + 1) / count * TAU + offset - 0.008;
      const r1 = inner + random() * 2;
      const r2 = outer - random() * 2;
      ctx.beginPath();
      ctx.arc(0, 0, r1, a, b);
      ctx.lineTo(Math.cos(b) * r2, Math.sin(b) * r2);
      ctx.arc(0, 0, r2, b, a, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(${24 + Math.floor(random() * 12)},${33 + Math.floor(random() * 10)},${31 + Math.floor(random() * 10)},${0.2 + random() * 0.35})`;
      ctx.fill();
      ctx.strokeStyle = '#030a0b85'; ctx.lineWidth = 1.3; ctx.stroke();
      arc(ctx, 0, 0, r2, a, b, '#6570630c', 1);
    }
  }
  for (let i = 0; i < 3700; i += 1) {
    const px = (random() - 0.5) * 640;
    const py = (random() - 0.5) * 640;
    ctx.fillStyle = random() > 0.45 ? '#ab967b08' : '#00000012';
    ctx.fillRect(px, py, random() * 2.6 + 0.4, random() * 1.5 + 0.4);
  }
  // Long fractures branch through the stone; they are visual, never collisions.
  for (let i = 0; i < 19; i += 1) {
    const a = random() * TAU;
    const start = 125 + random() * 150;
    let px = Math.cos(a) * start;
    let py = Math.sin(a) * start;
    const points = [[px, py]];
    for (let j = 0; j < 7; j += 1) {
      px += Math.cos(a) * (7 + random() * 14) + (random() - 0.5) * 19;
      py += Math.sin(a) * (7 + random() * 14) + (random() - 0.5) * 19;
      points.push([px, py]);
    }
    ctx.beginPath(); points.forEach(([qx, qy], j) => j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy));
    ctx.strokeStyle = '#010708a0'; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.translate(0.6, 0.6);
    ctx.strokeStyle = '#a2946d16'; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.translate(-0.6, -0.6);
  }
  // Faded concentric liturgy and an eight-point inlaid central seal.
  for (const r of [43, 47, 102, 211, 279, 284]) arc(ctx, 0, 0, r, 0, TAU, '#ad94532b', r === 284 ? 1.4 : 0.65);
  for (let i = 0; i < 64; i += 1) {
    const a = i / 64 * TAU;
    const r = i % 4 === 0 ? 272 : 276;
    ctx.strokeStyle = '#b29b6044'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * 280, Math.sin(a) * 280); ctx.stroke();
  }
  ctx.save(); ctx.rotate(Math.PI / 8);
  const seal = Array.from({ length: 16 }, (_, i) => {
    const a = i / 16 * TAU;
    return [Math.cos(a) * (i % 2 ? 28 : 66), Math.sin(a) * (i % 2 ? 28 : 66)];
  });
  polygon(ctx, seal, '#26302933', '#ac97632c', 1);
  ctx.restore();
  ctx.restore();
  // Tarnished edge and separate chipped rim segments.
  arc(ctx, 0, 0, radius - 1, 0, TAU, '#766044', 1.8);
  arc(ctx, 0, 0, radius - 5, 0, TAU, '#322f25', 5);
  arc(ctx, 0, 0, radius - 8, 0, TAU, '#a88a4d55', 0.7);
  for (let i = 0; i < 44; i += 1) {
    const a = i / 44 * TAU + 0.008;
    const b = (i + 1) / 44 * TAU - 0.014;
    arc(ctx, 0, 0, radius + 1, a, b, i % 7 ? '#5c5140' : '#a38a58', 3.5);
    if (i % 3 === 0) {
      ctx.save(); ctx.rotate(a);
      polygon(ctx, [[303, -3], [320, -4], [324, 0], [318, 4], [303, 3]], '#37382f', '#99825777', 0.7);
      ctx.restore();
    }
  }
  ctx.restore();
  return canvas;
}

function makeArchitecture(random) {
  const { canvas, ctx } = surface(WIDTH, HEIGHT);
  // Broken buttresses anchor the circular nave in a vast, unlit cathedral.
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(640 + side * 448, 360);
    ctx.scale(side, 1);
    polygon(ctx, [[-34, -440], [33, -440], [33, -250], [13, -214], [13, 213], [44, 264], [44, 440], [-42, 440], [-42, 270], [-16, 225], [-16, -223], [-34, -259]], '#0a1114', '#5b503a77', 1.5);
    polygon(ctx, [[-16, -225], [6, -213], [6, 212], [-16, 225]], '#111b1c', '#84704a44');
    polygon(ctx, [[-40, -281], [32, -281], [41, -259], [15, -223], [-17, -223], [-47, -260]], '#141b1b', '#a58a5455');
    polygon(ctx, [[-16, 226], [15, 219], [47, 263], [40, 287], [-42, 287], [-48, 267]], '#151d1c', '#75633e77');
    ctx.strokeStyle = '#c0a16b66'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-7, -195); ctx.lineTo(-7, 189); ctx.stroke();
    for (let y = -190; y < 220; y += 44) {
      polygon(ctx, [[-3, y], [2, y + 9], [-3, y + 18], [-8, y + 9]], '#a0875044');
    }
    ctx.restore();
  }
  for (const y of [-44, 764]) {
    ctx.save(); ctx.translate(640, y);
    arc(ctx, 0, 0, 230, 0, TAU, '#302e2370', 28);
    arc(ctx, 0, 0, 230, 0, TAU, '#7f694544', 1.5);
    arc(ctx, 0, 0, 247, 0, TAU, '#6b593255', 2);
    ctx.restore();
  }
  // Floating carved masonry beyond the battle circle.
  for (let i = 0; i < 20; i += 1) {
    const a = random() * TAU;
    const r = 360 + random() * 170;
    const px = 640 + Math.cos(a) * r;
    const py = 360 + Math.sin(a) * r;
    const size = 9 + random() * 22;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a + random());
    polygon(ctx, [[-size, -size / 3], [size / 3, -size / 2], [size, size / 4], [size / 2, size / 2], [-size, size / 3]], '#10191a', '#71634555');
    ctx.restore();
  }
  return canvas;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('ECHO REQUIEM needs a Canvas 2D context.');
  const random = cosmeticRandom(0xec401213);
  const floor = makeFloor(random);
  const eclipse = makeEclipse(random);
  const architecture = makeArchitecture(random);
  const skyLayer = surface(WIDTH, HEIGHT);
  const sky = skyLayer.ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  sky.addColorStop(0, '#070d12'); sky.addColorStop(0.55, '#111419'); sky.addColorStop(1, '#110f14');
  skyLayer.ctx.fillStyle = sky; skyLayer.ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const lensLayer = surface(WIDTH, HEIGHT);
  const vignette = lensLayer.ctx.createRadialGradient(640, 350, 270, 640, 350, 740);
  vignette.addColorStop(0, '#00000000'); vignette.addColorStop(0.7, '#02070a22'); vignette.addColorStop(1, '#02070abb');
  lensLayer.ctx.fillStyle = vignette; lensLayer.ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glows = { gold: glowSprite('#b58c4944'), cyan: glowSprite('#5fe5d955'), red: glowSprite('#ff4e3644'), ivory: glowSprite('#fff3cb55') };
  const stars = Array.from({ length: 135 }, () => ({
    x: random() * WIDTH, y: random() * HEIGHT,
    size: 0.3 + random() * 1.1, a: 0.15 + random() * 0.5, phase: random() * TAU,
  }));
  const effects = createEffects();
  let cssWidth = WIDTH;
  let cssHeight = HEIGHT;
  let pixelRatio = 1;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let time = 0;
  let reducedMotion = false;
  let dead = false;
  let previousTick = -1;
  let pointer = null;
  let actBanner = null;
  let choirAssembly = 0;

  function clearPresentation() {
    effects.clear();
    actBanner = null;
    choirAssembly = 0;
  }

  function announceAct(act) {
    actBanner = { act: clamp(act || 1, 1, ACT_NAMES.length), remaining: 1.8 };
  }

  const glow = (kind, x, y, size, opacity = 1) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = opacity;
    ctx.drawImage(glows[kind], x - size / 2, y - size / 2, size, size); ctx.restore();
  };

  function resize(width, height, dpr = 1) {
    cssWidth = Math.max(1, width);
    cssHeight = Math.max(1, height);
    pixelRatio = clamp(dpr || 1, 0.5, 1.5);
    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);
    scale = Math.min(cssWidth / WIDTH, cssHeight / HEIGHT);
    offsetX = (cssWidth - WIDTH * scale) / 2;
    offsetY = (cssHeight - HEIGHT * scale) / 2;
  }

  function screenToWorld(clientX, clientY) {
    const bounds = canvas.getBoundingClientRect();
    pointer = {
      x: ((clientX - bounds.left) * cssWidth / (bounds.width || cssWidth) - offsetX) / scale,
      y: ((clientY - bounds.top) * cssHeight / (bounds.height || cssHeight) - offsetY) / scale,
    };
    return { ...pointer };
  }

  function backdrop(act) {
    ctx.drawImage(skyLayer.canvas, 0, 0);
    for (const star of stars) {
      const drift = reducedMotion ? 0 : Math.sin(time * 0.025 + star.phase) * 3;
      ctx.globalAlpha = star.a * (0.8 + Math.sin(time * 0.35 + star.phase) * 0.2);
      ctx.fillStyle = '#d5c9a7';
      ctx.fillRect(star.x + drift, star.y + drift * 0.3, star.size, star.size);
    }
    ctx.globalAlpha = 1;
    const breathe = reducedMotion ? 1 : 1 + Math.sin(time * 0.23) * 0.007;
    ctx.save(); ctx.translate(1006, 218); ctx.scale(breathe, breathe);
    ctx.globalAlpha = act >= 4 ? 0.88 : 0.75;
    ctx.drawImage(eclipse, -420, -420); ctx.restore();
    glow('gold', 1075, 480, 750, 0.18);
    glow('cyan', 280, 210, 900, 0.055);
    ctx.drawImage(architecture, 0, 0);
    // Three separate incomplete armillary rings move at imperceptibly different rates.
    ctx.save(); ctx.translate(ARENA.x, ARENA.y);
    const orbit = reducedMotion ? 0.12 : time * 0.014;
    for (let band = 0; band < 3; band += 1) {
      ctx.save(); ctx.rotate(orbit * (band % 2 ? -0.6 : 1) + band * 0.44);
      const r = 329 + band * 17;
      for (let i = 0; i < 6; i += 1) {
        const a = i * TAU / 6 + 0.09;
        const b = a + (band === 1 ? 0.7 : 0.48);
        arc(ctx, 0, 0, r + 3, a, b, '#02090acc', band === 0 ? 11 : 7);
        arc(ctx, 0, 0, r, a, b, band === 0 ? '#5e5238' : '#413e2e', band === 0 ? 5 : 2.5);
        arc(ctx, 0, 0, r - 2, a, b, '#c1a26966', 0.8);
        if (band === 0) {
          for (let k = 0; k < 7; k += 1) {
            const angle = a + k * 0.065;
            ctx.save(); ctx.rotate(angle);
            ctx.fillStyle = '#a18b5a77'; ctx.fillRect(r - 2, -0.5, 5, 1); ctx.restore();
          }
        }
      }
      ctx.restore();
    }
    ctx.restore();
    // Atmospheric veils drift behind the playable floor, retaining a clean combat surface.
    glow('gold', 830 + Math.sin(time * 0.045) * 25, 620, 700, 0.07);
    glow('cyan', 430, 90 + Math.cos(time * 0.035) * 20, 600, 0.025);
  }

  function drawHistory(player) {
    const history = player.history || [];
    if (history.length < 2) return;
    const ready = history.length >= MIN_HISTORY_TICKS && player.forkCharges > 0;
    const oldest = history[0];
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = INK.cyan; ctx.lineWidth = ready ? 1.4 : 0.7;
    ctx.globalAlpha = ready ? 0.26 : 0.11;
    ctx.beginPath();
    for (let i = 0; i < history.length; i += 3) {
      const p = history[i];
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    }
    ctx.lineTo(player.x, player.y); ctx.stroke();
    if (ready) {
      glow('cyan', oldest.x, oldest.y, 75, 0.25);
      ctx.globalAlpha = 0.5;
      const pulse = 18 + Math.sin(time * 3) * 1.5;
      arc(ctx, oldest.x, oldest.y, pulse, time * 0.3, time * 0.3 + Math.PI * 1.35, INK.cyan, 1);
      ctx.save(); ctx.translate(oldest.x, oldest.y); ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = INK.cyan; ctx.lineWidth = 1; ctx.strokeRect(-5, -5, 10, 10); ctx.restore();
      ctx.globalAlpha = 0.65; ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = INK.cyan; ctx.fillText('RETURN', oldest.x, oldest.y + 32);
    }
    ctx.restore();
  }

  function shadow(x, y, radius) {
    ctx.save(); ctx.fillStyle = '#00080aac'; ctx.beginPath();
    ctx.ellipse(x + 4, y + 9, radius * 1.2, radius * 0.7, -0.2, 0, TAU); ctx.fill(); ctx.restore();
  }

  function drawPlayer(entity, alpha, ghost = false) {
    const p = position(entity, alpha);
    const aim = Number.isFinite(entity.aim) ? entity.aim : -Math.PI / 2;
    const hurt = !ghost && entity.invulnTicks > 0;
    if (ghost && entity.frames?.length) {
      const start = Math.max(0, (entity.index || 0) - 25);
      const end = Math.min(entity.frames.length, entity.index || 0);
      ctx.save(); ctx.strokeStyle = '#8af2df66'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = start; i < end; i += 2) {
        const frame = entity.frames[i];
        i === start ? ctx.moveTo(frame.x, frame.y) : ctx.lineTo(frame.x, frame.y);
      }
      ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
    }
    if (!ghost) shadow(p.x, p.y, 13);
    glow(ghost ? 'cyan' : 'ivory', p.x, p.y, ghost ? 72 : 66, ghost ? 0.3 : 0.4);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(aim);
    ctx.globalAlpha = ghost ? 0.54 : hurt ? reducedMotion ? 0.85 : 0.7 + Math.sin(time * 45) * 0.2 : 1;
    const white = ghost ? '#a1fff4' : '#f6edce';
    const mid = ghost ? '#307c80' : '#a49a78';
    const shade = ghost ? '#164e57' : '#4b5652';
    if (!ghost && entity.dashTicks > 0) {
      polygon(ctx, [[-8, -10], [-70, -4], [-90, 0], [-65, 4], [-8, 10]], '#d5ecd12b');
      polygon(ctx, [[-12, -3], [-75, 0], [-12, 3]], '#f8f3d480');
    }
    // Ivory plate, a dark split cloak, and a long directional weapon.
    polygon(ctx, [[-3, -8], [-22, -12], [-16, -2], [-24, 5], [-4, 10]], shade, ghost ? '#7eeadd88' : '#baa57066');
    polygon(ctx, [[-5, -13], [5, -12], [13, -4], [5, -1], [-10, -6]], white, '#111c1e', 1.3);
    polygon(ctx, [[-6, 12], [5, 10], [12, 3], [3, 0], [-11, 6]], mid, '#111c1e', 1.3);
    polygon(ctx, [[-6, -6], [11, -5], [16, 0], [6, 6], [-7, 4]], white, '#223137', 1.1);
    polygon(ctx, [[-6, -6], [4, -3], [16, 0], [11, -5]], ghost ? '#e3fff8' : '#fffbe7');
    polygon(ctx, [[1, -2], [12, -2], [13, 0], [1, 1]], '#102a2d');
    ctx.fillStyle = ghost ? '#d1fff7' : '#79dcd0'; ctx.fillRect(6, -1.8, 6, 1.5);
    polygon(ctx, [[3, 6], [23, 4], [27, 6], [23, 8], [3, 9]], ghost ? '#67cfc8' : '#aa9766', '#111b1d');
    ctx.fillStyle = white; ctx.fillRect(20, 4, 7, 1.5);
    if (ghost) {
      ctx.strokeStyle = '#b6fff588'; ctx.lineWidth = 0.6;
      for (let y = -9; y < 10; y += 4) { ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(13, y); ctx.stroke(); }
    }
    ctx.restore();
    if (!ghost) {
      const angle = time * 0.6;
      arc(ctx, p.x, p.y, 23, angle, angle + Math.PI * 0.65, '#f8e9bc55', 0.8);
      arc(ctx, p.x, p.y, 23, angle + Math.PI, angle + Math.PI * 1.65, '#f8e9bc55', 0.8);
    }
  }

  function enemyTelegraph(enemy, alpha) {
    const p = position(enemy, alpha);
    if (enemy.spawnTicks > 0) {
      const progress = 1 - enemy.spawnTicks / 30;
      glow('red', p.x, p.y, 75, 0.3);
      arc(ctx, p.x, p.y, 18 + (1 - progress) * 18, 0, TAU, '#ff735eaa', 1.1);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(time * 0.8);
      for (let i = 0; i < 4; i += 1) {
        ctx.rotate(Math.PI / 2); polygon(ctx, [[21, -3], [15, 0], [21, 3]], '#f68760');
      }
      ctx.restore();
    }
    if (enemy.kind === 'lancer' && (enemy.windupTicks > 0 || enemy.chargeTicks > 0)) {
      const angle = enemy.chargeAngle ?? Math.atan2((enemy.targetY ?? p.y) - p.y, (enemy.targetX ?? p.x) - p.x);
      const charging = enemy.chargeTicks > 0;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      ctx.fillStyle = charging ? '#ff5a402a' : '#ff5a4017'; ctx.fillRect(0, -10, 210, 20);
      ctx.strokeStyle = charging ? '#ffba87cc' : '#ff8b6aaa'; ctx.lineWidth = 1; ctx.setLineDash([5, 8]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(210, 0); ctx.stroke();
      ctx.setLineDash([]);
      if (!charging) {
        const progress = 1 - clamp(enemy.windupTicks / 45, 0, 1);
        arc(ctx, 0, 0, 25, -Math.PI / 2, -Math.PI / 2 + progress * TAU, '#ffa67a', 1.5);
      }
      ctx.restore();
    }
  }

  function drawEnemy(enemy, alpha) {
    const p = position(enemy, alpha);
    const radius = enemy.radius || 14;
    const r = radius / 15;
    shadow(p.x, p.y, radius);
    glow('red', p.x, p.y, radius * 4.5, enemy.spawnTicks > 0 ? 0.14 : 0.3);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(enemy.aim || 0); ctx.scale(r, r);
    ctx.globalAlpha = enemy.spawnTicks > 0 ? 0.2 + (1 - enemy.spawnTicks / 30) * 0.6 : 1;
    if (enemy.kind === 'sentry') {
      polygon(ctx, [[-15, -7], [-4, -15], [9, -13], [16, 0], [9, 13], [-4, 15], [-15, 7]], '#612c28', '#b75b42', 1.3);
      polygon(ctx, [[-11, -6], [-3, -11], [7, -9], [11, 0], [7, 9], [-3, 11], [-11, 6]], '#242d2c', '#dc7a54', 1.2);
      polygon(ctx, [[-1, -4], [20, -5], [24, 0], [20, 5], [-1, 4]], '#a34a34', '#eea16a');
      polygon(ctx, [[-7, -16], [1, -20], [6, -13], [-4, -10]], '#cc6546');
      polygon(ctx, [[-7, 16], [1, 20], [6, 13], [-4, 10]], '#74372c');
      ctx.fillStyle = '#ffd69a'; ctx.fillRect(17, -2, 5, 4);
    } else if (enemy.kind === 'lancer') {
      polygon(ctx, [[-21, -10], [-6, -12], [6, -6], [24, 0], [6, 6], [-6, 12], [-21, 10], [-12, 0]], '#772d30', '#ed6a4e', 1.2);
      polygon(ctx, [[-13, -7], [-5, -15], [14, -6], [31, 0], [0, -2]], '#dc5b42');
      polygon(ctx, [[-13, 7], [-5, 15], [14, 6], [31, 0], [0, 2]], '#914035');
      polygon(ctx, [[-3, -2], [29, 0], [-3, 2]], '#ffe4b0');
    } else {
      polygon(ctx, [[-15, -3], [-16, -14], [-3, -11], [13, -6], [20, 0], [13, 6], [-3, 11], [-16, 14], [-15, 3]], '#8b302c', '#e46c4f', 1.1);
      polygon(ctx, [[-12, -12], [-4, -15], [7, -8], [3, -2], [-5, -4]], '#ec7551');
      polygon(ctx, [[-12, 12], [-4, 15], [7, 8], [3, 2], [-5, 4]], '#ad4132');
      polygon(ctx, [[-7, 0], [3, -7], [17, 0], [3, 7]], '#c44a35', '#59272b');
      polygon(ctx, [[4, -3], [14, 0], [4, 3]], '#ffd5a0');
    }
    ctx.restore();
    if (enemy.hp < enemy.maxHp && enemy.spawnTicks <= 0) {
      ctx.fillStyle = '#100f12'; ctx.fillRect(p.x - 13, p.y - radius - 10, 26, 2);
      ctx.fillStyle = '#f47e57'; ctx.fillRect(p.x - 13, p.y - radius - 10, 26 * clamp(enemy.hp / enemy.maxHp, 0, 1), 2);
    }
  }

  function bossTelegraphs(boss) {
    if (!boss) return;
    ctx.save();
    ctx.beginPath(); ctx.arc(ARENA.x, ARENA.y, ARENA.radius - 2, 0, TAU); ctx.clip();
    for (const beam of boss.telegraphs || []) {
      ctx.save(); ctx.translate(boss.x, boss.y); ctx.rotate(beam.angle);
      const active = beam.remainingTicks <= 0;
      const progress = 1 - clamp(beam.remainingTicks / (beam.durationTicks || 48), 0, 1);
      const width = beam.width || 20;
      if (active) {
        ctx.fillStyle = '#ff5e4166'; ctx.fillRect(0, -width * 0.8, 900, width * 1.6);
        ctx.fillStyle = '#ff9d69'; ctx.fillRect(0, -width / 2, 900, width);
        ctx.fillStyle = '#fff0ca'; ctx.fillRect(0, -width * 0.16, 900, width * 0.32);
      } else {
        ctx.fillStyle = `rgba(255,100,70,${0.06 + progress * 0.18})`; ctx.fillRect(0, -width / 2, 900, width);
        ctx.strokeStyle = '#ff8b65aa'; ctx.lineWidth = 1;
        ctx.setLineDash([10, 7]);
        ctx.beginPath(); ctx.moveTo(0, -width / 2); ctx.lineTo(900, -width / 2); ctx.moveTo(0, width / 2); ctx.lineTo(900, width / 2); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 0.35 + progress * 0.6;
        ctx.fillStyle = '#ffd494'; ctx.fillRect(0, -0.7, 900, 1.4);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawBoss(boss) {
    if (!boss) return;
    const r = Math.max(58, boss.radius || 64);
    const phase = boss.phase || 1;
    const assembled = 1 - clamp(choirAssembly / 1.3, 0, 1);
    shadow(boss.x, boss.y + 10, r * 1.45);
    glow('red', boss.x, boss.y, r * 5, 0.6);
    glow('gold', boss.x, boss.y, r * 3.5, 0.45);
    ctx.save(); ctx.translate(boss.x, boss.y);
    // The physical core never moves or disappears during the decorative arrival.
    if (choirAssembly > 0) {
      arc(ctx, 0, 0, boss.radius || 44, 0, TAU, '#efb57b66', 1);
    }
    // The Choir is a rose window rebuilt as a weapon: gilded ribs and colored glass.
    ctx.save(); ctx.rotate((boss.angle || 0) * 0.35);
    for (let i = 0; i < 8; i += 1) {
      ctx.save(); ctx.rotate(i / 8 * TAU);
      const formation = clamp((assembled - i * 0.025) / 0.825, 0, 1);
      const unfolded = 1 - (1 - formation) ** 3;
      ctx.globalAlpha = reducedMotion ? assembled : unfolded;
      if (!reducedMotion) {
        ctx.rotate((1 - unfolded) * 0.3);
        ctx.scale(1, 0.12 + unfolded * 0.88);
      }
      const reach = r * (i % 2 ? 1.27 : 1.53);
      polygon(ctx, [[r * 0.45, -r * 0.17], [r * 0.93, -r * 0.28], [reach, -r * 0.08], [reach + 10, 0], [reach, r * 0.08], [r * 0.93, r * 0.28], [r * 0.45, r * 0.17]], '#413729', '#bd8c51', 1.4);
      polygon(ctx, [[r * 0.62, -r * 0.1], [r * 0.98, -r * 0.17], [reach - 6, 0], [r * 0.98, r * 0.17], [r * 0.62, r * 0.1]], i % 2 ? '#914d3c' : '#2d706d', '#f6ba6a88', 0.8);
      polygon(ctx, [[r * 0.69, 0], [r * 0.98, -r * 0.13], [reach - 8, 0]], i % 2 ? '#e18b57' : '#5db6a1');
      ctx.restore();
    }
    ctx.restore();
    ctx.save(); ctx.rotate(-(boss.angle || 0) * 0.45);
    ctx.globalAlpha = reducedMotion ? assembled : 1;
    const ringSweep = reducedMotion ? TAU : TAU * (1 - (1 - assembled) ** 2);
    arc(ctx, 0, 0, r * 1.04, -Math.PI / 2, -Math.PI / 2 + ringSweep, '#211d1d', 9);
    arc(ctx, 0, 0, r * 1.04, -Math.PI / 2, -Math.PI / 2 + ringSweep, '#c29458', 2.2);
    arc(ctx, 0, 0, r * 0.92, Math.PI / 2, Math.PI / 2 + ringSweep, '#76573b', 1.5);
    for (let i = 0; i < 12; i += 1) {
      ctx.save(); ctx.rotate(i / 12 * TAU);
      const formation = clamp((assembled - i * 0.025) / 0.725, 0, 1);
      ctx.globalAlpha = reducedMotion ? assembled : formation;
      if (!reducedMotion) ctx.scale(1, 0.1 + formation * 0.9);
      polygon(ctx, [[r * 0.26, 0], [r * 0.66, -r * 0.15], [r * 0.87, 0], [r * 0.66, r * 0.15]], i % 3 === 0 ? '#91c1a0' : i % 3 === 1 ? '#b64d49' : '#715b86', '#e2b477', 1.1);
      ctx.strokeStyle = '#201d25'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(r * 0.3, 0); ctx.lineTo(r * 0.87, 0); ctx.moveTo(r * 0.65, -r * 0.14); ctx.lineTo(r * 0.65, r * 0.14); ctx.stroke();
      polygon(ctx, [[r * 0.97, -3], [r * 1.13, 0], [r * 0.97, 3]], '#e2b474');
      ctx.restore();
    }
    ctx.restore();
    arc(ctx, 0, 0, r * 0.33, 0, TAU, '#211b24', 9);
    arc(ctx, 0, 0, r * 0.33, 0, TAU, '#d7ab6d', 2);
    const core = r * (0.17 + (reducedMotion ? 0 : Math.sin(time * (2 + phase)) * 0.015));
    polygon(ctx, [[0, -core * 1.6], [core, -core * 0.3], [core * 0.7, core], [0, core * 1.5], [-core * 0.7, core], [-core, -core * 0.3]], '#ffd7a2', '#fff0c9', 1.5);
    polygon(ctx, [[0, -core], [core * 0.45, 0], [0, core], [-core * 0.45, 0]], phase > 2 ? '#fc5449' : '#a8433c');
    ctx.restore();
  }

  function drawActBanner() {
    if (!actBanner) return;
    const elapsed = 1.8 - actBanner.remaining;
    const opacity = Math.min(1, elapsed / 0.2, actBanner.remaining / 0.45);
    if (opacity <= 0) return;
    const act = actBanner.act;
    ctx.save();
    ctx.globalAlpha = opacity * 0.92;
    ctx.textAlign = 'center';
    ctx.fillStyle = INK.gold;
    ctx.font = '10px Georgia, Times New Roman, serif';
    ctx.fillText(['I', 'II', 'III', 'IV'][act - 1], 640, 108);
    ctx.strokeStyle = '#bd986277'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(571, 104); ctx.lineTo(612, 104); ctx.moveTo(668, 104); ctx.lineTo(709, 104); ctx.stroke();
    ctx.font = '25px Georgia, Times New Roman, serif';
    ctx.fillStyle = INK.ivory;
    ctx.shadowColor = '#03090d'; ctx.shadowBlur = 9;
    ctx.fillText(ACT_NAMES[act - 1], 640, 139);
    ctx.restore();
  }

  function drawProjectile(projectile, alpha) {
    const p = position(projectile, alpha);
    const hostile = projectile.owner === 'enemy';
    const echo = projectile.owner === 'echo';
    const angle = Math.atan2(projectile.vy || 0, projectile.vx || 1);
    const r = projectile.radius || 3;
    if (hostile) {
      glow('red', p.x, p.y, 22 + r * 2, 0.4);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      polygon(ctx, [[r + 2, 0], [0, -r], [-r - 2, 0], [0, r]], '#ff7558', '#ffcf96', 0.9);
      ctx.fillStyle = '#ffe5bd'; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    } else {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      const color = echo ? '#87f6eb' : '#fff1cd';
      polygon(ctx, [[-18, -r * 0.55], [4, -r * 0.55], [7, 0], [4, r * 0.55], [-18, r * 0.55]], echo ? '#6df2e84d' : '#f5df9666');
      ctx.strokeStyle = color; ctx.lineWidth = echo ? 1.6 : 2.2;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(7, 0); ctx.stroke(); ctx.restore();
    }
  }

  function draw(world, alpha = 1, realDt = 1 / 60) {
    if (dead) return;
    const dt = clamp(Number.isFinite(realDt) ? realDt : 1 / 60, 0, 0.08);
    time += dt;
    if (world && world.tick < previousTick) clearPresentation();
    previousTick = world?.tick ?? -1;
    effects.update(dt, reducedMotion);
    if (actBanner) {
      actBanner.remaining -= dt;
      if (actBanner.remaining <= 0) actBanner = null;
    }
    choirAssembly = Math.max(0, choirAssembly - dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#04080b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shake = effects.shake;
    ctx.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, offsetX * pixelRatio, offsetY * pixelRatio);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, WIDTH, HEIGHT); ctx.clip();
    backdrop(world?.act || 1);
    ctx.translate(shake.x, shake.y);
    ctx.drawImage(floor, 0, 0);
    // The architecture slowly changes its light as the liturgy advances.
    const act = clamp(world?.act || 1, 1, 4);
    const rimColors = ['#d0a96c77', '#86bcb488', '#cf8b6c88', '#f2a475aa'];
    arc(ctx, ARENA.x, ARENA.y, ARENA.radius - 1, -1.2, 0.25, rimColors[act - 1], 0.8);
    if (act > 1) {
      const kind = act === 2 ? 'cyan' : act === 3 ? 'red' : 'gold';
      glow(kind, ARENA.x + 120, ARENA.y - 180, 520, act === 4 ? 0.14 : 0.065);
      arc(ctx, ARENA.x, ARENA.y, ARENA.radius - 8, 1.1, 2.1, rimColors[act - 1], 0.7);
    }
    // Draw typography below combat so every hostile silhouette stays visible.
    ctx.save(); ctx.translate(-shake.x, -shake.y); drawActBanner(); ctx.restore();
    if (world) {
      alpha = clamp(alpha, 0, 1);
      if (world.player) drawHistory(world.player);
      ctx.save(); ctx.beginPath(); ctx.arc(ARENA.x, ARENA.y, ARENA.radius - 1, 0, TAU); ctx.clip();
      for (const enemy of world.enemies || []) enemyTelegraph(enemy, alpha);
      bossTelegraphs(world.boss);
      ctx.restore();
      drawBoss(world.boss);
      for (const enemy of world.enemies || []) drawEnemy(enemy, alpha);
      for (const echo of world.echoes || []) drawPlayer(echo, alpha, true);
      for (const projectile of world.projectiles || []) drawProjectile(projectile, alpha);
      if (world.player) drawPlayer(world.player, alpha);
    }
    effects.draw(ctx);
    if (effects.flash > 0.002) {
      ctx.fillStyle = `rgba(182,233,215,${effects.flash * 0.38})`; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();
    if (world?.tick > 0 && world.phase === 'playing' && pointer && pointer.x >= 0 && pointer.x <= WIDTH && pointer.y >= 0 && pointer.y <= HEIGHT) {
      ctx.save(); ctx.translate(pointer.x, pointer.y);
      arc(ctx, 0, 0, 7, 0, TAU, '#031012bb', 3);
      for (let i = 0; i < 4; i += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.strokeStyle = '#f0e1b7cc'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(5, -3); ctx.lineTo(8, -3); ctx.lineTo(8, 3); ctx.lineTo(5, 3); ctx.stroke();
      }
      ctx.fillStyle = INK.cyan; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    // Lens falloff keeps the cathedral vast and the central combat surface clear.
    ctx.drawImage(lensLayer.canvas, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  resize(canvas.clientWidth || WIDTH, canvas.clientHeight || HEIGHT, globalThis.devicePixelRatio || 1);
  return {
    resize, screenToWorld, consume(events = []) {
      for (const event of events) {
        if (event.type === 'run-start') {
          clearPresentation();
          previousTick = -1;
          announceAct(1);
        } else if (event.type === 'act-start') {
          announceAct(event.act);
          if (event.act === 4) choirAssembly = 1.3;
        } else if (event.type === 'boss-phase' && event.phase === 1) {
          choirAssembly = 1.3;
          announceAct(4);
        }
      }
      effects.consume(events);
    }, draw,
    setReducedMotion(value) { reducedMotion = Boolean(value); },
    destroy() { clearPresentation(); dead = true; },
  };
}
