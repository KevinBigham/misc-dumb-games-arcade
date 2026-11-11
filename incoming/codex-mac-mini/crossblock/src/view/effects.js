// Cosmetics deliberately use their own generator and never touch simulation RNG.
export function cosmeticRandom(seed = 0x72f3a1c9) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export const INK = Object.freeze({
  ivory: '#fff0cb', gold: '#bd9862', cyan: '#86f7ed', red: '#ff654e',
  rust: '#c24133', dark: '#071012', pale: '#e7d5ad',
});

export function createEffects() {
  const random = cosmeticRandom(0xb105f00d);
  const particles = [];
  const rings = [];
  const ribbons = [];
  const ruptures = [];
  let shake = 0;
  let flash = 0;
  let reduced = false;
  let time = 0;

  function burst(x, y, count, color, energy = 1, kind = 'spark') {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    for (let i = 0; i < count && particles.length < 700; i += 1) {
      const angle = random() * Math.PI * 2;
      const speed = (25 + random() * 160) * energy;
      const life = 0.2 + random() * 0.65;
      particles.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed, life, max: life, color,
        size: 0.7 + random() * (kind === 'shard' ? 5 : 2.1),
        angle, spin: (random() - 0.5) * 6, kind });
    }
  }

  function ring(x, y, color, radius, life = 0.5, width = 1.5) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (rings.length >= 35) rings.shift();
    rings.push({ x, y, color, radius, life, max: life, width });
  }

  function consume(events = []) {
    for (const event of events) {
      const x = event.x;
      const y = event.y;
      switch (event.type) {
        case 'shot':
          if (event.owner !== 'enemy') burst(x, y, 2, event.owner === 'echo' ? INK.cyan : INK.ivory, 0.25);
          break;
        case 'hit':
          burst(x, y, 5, event.owner === 'echo' ? INK.cyan : INK.ivory, 0.6);
          break;
        case 'kill':
          burst(x, y, 15, INK.red, 1.1, 'shard');
          burst(x, y, 5, INK.gold, 0.7);
          ring(x, y, INK.red, 27, 0.26, 1);
          shake = Math.max(shake, 1.4);
          break;
        case 'dash':
          burst(x, y, 14, INK.ivory, 0.45);
          ring(x, y, INK.ivory, 40, 0.3);
          break;
        case 'fork': {
          if (ruptures.length >= 6) ruptures.shift();
          ruptures.push({ x, y, fromX: event.fromX, fromY: event.fromY, life: 1.35, max: 1.35 });
          const path = (event.path || []).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
          if (path.length > 1) {
            if (ribbons.length >= 4) ribbons.shift();
            ribbons.push({ path: path.map(p => ({ x: p.x, y: p.y })), life: 0.9, max: 0.9 });
          } else if (Number.isFinite(event.fromX) && Number.isFinite(x)) {
            if (ribbons.length >= 4) ribbons.shift();
            ribbons.push({ path: [{ x: event.fromX, y: event.fromY }, { x, y }], life: 0.9, max: 0.9 });
          }
          burst(x, y, 60, INK.cyan, 1.6, 'shard');
          burst(event.fromX, event.fromY, 30, INK.cyan, 0.6);
          ring(x, y, INK.cyan, 160, 0.75, 2);
          ring(x, y, INK.ivory, 90, 0.5, 1);
          ring(x, y, INK.cyan, 65, 0.45, 4);
          shake = Math.max(shake, 7);
          flash = Math.max(flash, 0.12);
          break;
        }
        case 'player-hit':
          burst(x, y, 24, INK.red, 1.3, 'shard');
          ring(x, y, INK.red, 65, 0.4, 2);
          shake = Math.max(shake, 8);
          flash = Math.max(flash, 0.22);
          break;
        case 'boss-phase':
          ring(x ?? 640, y ?? 360, INK.red, 440, 1.2, 3);
          burst(x ?? 640, y ?? 360, 55, INK.gold, 2, 'shard');
          shake = Math.max(shake, 6);
          break;
        case 'act-start':
          ring(640, 360, INK.gold, 380, 1.2, 1.5);
          break;
        case 'run-end':
          if (event.phase === 'won') {
            burst(x ?? 640, y ?? 360, 140, INK.gold, 2.5, 'shard');
            ring(x ?? 640, y ?? 360, INK.ivory, 500, 1.5, 3);
            shake = Math.max(shake, 10);
          }
          break;
        default: break;
      }
    }
  }

  function update(dt, reducedMotion) {
    reduced = reducedMotion;
    time += dt;
    shake *= Math.exp(-dt * 12);
    flash *= Math.exp(-dt * 9);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-dt * 2.4);
      p.vy *= Math.exp(-dt * 2.4);
      p.angle += p.spin * dt;
    }
    for (const collection of [rings, ribbons, ruptures]) {
      for (let i = collection.length - 1; i >= 0; i -= 1) {
        collection[i].life -= dt;
        if (collection[i].life <= 0) collection.splice(i, 1);
      }
    }
  }

  function draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ribbon of ribbons) {
      const progress = ribbon.life / ribbon.max;
      const points = ribbon.path;
      const remaining = Math.max(2, Math.ceil(points.length * Math.sqrt(progress)));
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (const [width, opacity] of [[18, 0.06], [6, 0.24], [1.5, 0.8]]) {
        ctx.strokeStyle = INK.cyan;
        ctx.globalAlpha = progress * opacity;
        ctx.lineWidth = width * progress;
        ctx.beginPath();
        for (let i = 0; i < remaining; i += 1) {
          const p = points[i];
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
    }
    for (const r of rings) {
      const t = 1 - r.life / r.max;
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = (1 - t) * (reduced ? 0.3 : 0.65);
      ctx.lineWidth = r.width * (1 - t * 0.6);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * (1 - (1 - t) ** 3), 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const rupture of ruptures) {
      const fade = Math.min(1, rupture.life * 1.8);
      const elapsed = rupture.max - rupture.life;
      for (const [x, y, origin] of [[rupture.x, rupture.y, false], [rupture.fromX, rupture.fromY, true]]) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        ctx.save(); ctx.translate(x, y);
        ctx.globalAlpha = fade * (origin ? 0.4 : 0.85);
        ctx.strokeStyle = INK.cyan; ctx.lineWidth = 1;
        const radius = origin ? 22 : 31 + Math.min(elapsed, 0.4) * 30;
        ctx.rotate(origin ? -elapsed * 0.2 : elapsed * 0.25);
        for (let i = 0; i < 8; i += 1) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath(); ctx.arc(0, 0, radius, -0.18, 0.18); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(radius - 5, 0); ctx.lineTo(radius + 5, 0); ctx.stroke();
        }
        ctx.restore();
      }
      if (Number.isFinite(rupture.x) && Number.isFinite(rupture.y)) {
        ctx.globalAlpha = fade * 0.9; ctx.fillStyle = INK.cyan;
        ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace'; ctx.textAlign = 'center';
        ctx.fillText('TIMELINE FORKED', rupture.x, rupture.y - 57);
      }
    }
    for (const p of particles) {
      const opacity = Math.min(1, p.life / p.max * 2);
      ctx.globalAlpha = opacity * (reduced ? 0.6 : 1);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.kind === 'shard') {
        const dx = Math.cos(p.angle) * p.size;
        const dy = Math.sin(p.angle) * p.size;
        ctx.beginPath();
        ctx.moveTo(p.x + dx * 1.5, p.y + dy * 1.5);
        ctx.lineTo(p.x - dy * 0.5, p.y + dx * 0.5);
        ctx.lineTo(p.x - dx, p.y - dy);
        ctx.fill();
      } else {
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  return {
    consume, update, draw,
    get shake() { return reduced || shake === 0 ? { x: 0, y: 0 } : { x: Math.sin(time * 91) * shake, y: Math.cos(time * 113) * shake * 0.65 }; },
    get flash() { return reduced ? 0 : flash; },
    clear() { particles.length = 0; rings.length = 0; ribbons.length = 0; ruptures.length = 0; shake = 0; flash = 0; },
  };
}
