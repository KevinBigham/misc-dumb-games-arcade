import { LIGHT } from './contracts.js';

const C = { ink: '#0b2524', mint: '#99e1be', white: '#f1efda', orange: '#fa8969', dim: '#537e70', gold: '#ecc989' };
const TAU = Math.PI * 2;
const noise = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export function createLightRenderer(canvas, hero = false) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, ratio = 1, time = 0, particles = [], rings = [], labels = [], reduced = false, shake = 0;
  const circle = (x, y, r, color, fill = false, line = 1) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx[fill ? 'fillStyle' : 'strokeStyle'] = color; ctx.lineWidth = line; ctx[fill ? 'fill' : 'stroke'](); };
  const line = (x, y, x2, y2, color, w = 1) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(); };
  const text = (s, x, y, size = 10, color = C.dim, align = 'center') => { ctx.fillStyle = color; ctx.font = `${size}px ui-monospace, SFMono-Regular, Consolas, monospace`; ctx.textAlign = align; ctx.fillText(s, x, y); };
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (bounds.width === width && bounds.height === height && dpr === ratio) return;
    width = bounds.width; height = bounds.height; ratio = dpr;
    canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
  }
  function consume(events) {
    for (const e of events) {
      if (['kill', 'rescue', 'hurt', 'hit', 'dash', 'dash-hit', 'person-lost'].includes(e.type)) {
        const color = e.type === 'kill' || e.type === 'hurt' || e.type === 'person-lost' ? C.orange : C.mint;
        const count = reduced ? 2 : e.type === 'kill' ? 13 : e.type === 'rescue' ? 20 : 5;
        for (let i = 0; i < count; i++) {
          const a = noise(e.tick + i * 100 + (e.x || 0)) * TAU, speed = 25 + noise(i * 17 + e.tick) * 130;
          particles.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .5 + noise(i) * .4, max: .9, color });
        }
      }
      if (['pulse', 'hurt', 'dash-hit'].includes(e.type) && !reduced) shake = e.type === 'pulse' ? 5 : 2.5;
      if (e.type === 'repair') { labels.push({ x: e.x, y: e.y - 80, text: `${e.amount} SPARK${e.amount === 1 ? '' : 'S'} RETURNED`, life: 2.2 }); rings.push({ x: e.x, y: e.y, life: .6 }); }
      if (e.type === 'person-lost') labels.push({ x: e.x, y: e.y - 20, text: `${e.name.toUpperCase()} / SIGNAL LOST`, life: 2.5 });
      if (e.type === 'pulse') rings.push({ x: e.x, y: e.y, life: 1.1, pulse: true });
      if (e.type === 'rescue') { rings.push({ x: e.x, y: e.y, life: .6 }); labels.push({ x: e.x, y: e.y - 62, text: `${e.name.toUpperCase()} IS HOME`, life: 2.5 }); }
      if (e.type === 'follow') labels.push({ x: e.x, y: e.y - 20, text: 'TAKE ME TO THE LIGHT', life: 1.7 });
    }
    particles = particles.slice(-400); labels = labels.slice(-5);
  }
  function background(t) {
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, LIGHT.width, LIGHT.height);
    const glow = ctx.createRadialGradient(550, 370, 30, 550, 370, 540);
    glow.addColorStop(0, '#21463b'); glow.addColorStop(.5, '#11312d'); glow.addColorStop(1, C.ink);
    ctx.fillStyle = glow; ctx.fillRect(0, 0, LIGHT.width, LIGHT.height);
    for (let i = 0; i < 410; i++) {
      const x = noise(i) * 1100, y = noise(i + 500) * 740;
      ctx.fillStyle = `rgba(156,203,168,${.05 + noise(i + 1000) * .17})`;
      ctx.fillRect(x, y, i % 9 === 0 ? 2 : 1, 1);
    }
    for (let r = 130; r < 530; r += 82) {
      ctx.beginPath();
      for (let a = 0; a < 6.31; a += .03) { const rr = r + Math.sin(a * 5 + r) * 7 + Math.cos(a * 9 + r) * 3; const x = 550 + Math.cos(a) * rr, y = 370 + Math.sin(a) * rr * .82; if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.strokeStyle = '#29493c'; ctx.lineWidth = .6; ctx.stroke();
    }
    ctx.setLineDash([2, 8]); circle(550, 370, 240, '#42604a'); circle(550, 370, 340, '#284b3d'); ctx.setLineDash([]);
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16; const r = i % 4 === 0 ? 330 : 350; line(550 + Math.cos(a) * r, 370 + Math.sin(a) * r, 550 + Math.cos(a) * 360, 370 + Math.sin(a) * 360, '#375a48'); }
    text('N', 550, 30, 11, '#628570'); text('S', 550, 718, 11, '#628570');
    line(28, 28, 55, 28, C.dim); line(28, 28, 28, 55, C.dim); line(1072, 28, 1045, 28, C.dim); line(1072, 28, 1072, 55, C.dim);
    line(28, 712, 55, 712, C.dim); line(28, 712, 28, 685, C.dim); line(1072, 712, 1045, 712, C.dim); line(1072, 712, 1072, 685, C.dim);
    text('SECTOR 07 / THE REMAINDER', 48, 57, 9, '#70917b', 'left');
    text('NO SIGNAL BEYOND THE PERIMETER', 1052, 690, 9, '#70917b', 'right');
  }
  function beacon(w, t) {
    const b = w.beacon;
    const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 2.4);
    glow.addColorStop(0, '#ccdf8a30'); glow.addColorStop(.45, '#a9db8a14'); glow.addColorStop(1, '#a9db8a00'); ctx.fillStyle = glow; ctx.fillRect(b.x - 250, b.y - 250, 500, 500);
    circle(b.x, b.y, b.radius, '#92c98e44'); circle(b.x, b.y, b.radius + 7 + Math.sin(t * 1.5) * 3, '#8bbf7d20');
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(b.x + Math.cos(a) * 49, b.y + Math.sin(a) * 49, b.x + Math.cos(a) * 55, b.y + Math.sin(a) * 55, C.gold, 2); }
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#dfe3a1'; ctx.fillRect(-17, -17, 34, 34); ctx.strokeStyle = '#f4efbd'; ctx.strokeRect(-22, -22, 44, 44); ctx.fillStyle = '#436944'; ctx.fillRect(-9, -9, 18, 18); ctx.restore();
    circle(b.x, b.y, 5, '#fff8cb', true);
    const kept = w.memories.filter(memory => memory.status === 'kept').length;
    for (let i = 0; i < Math.min(24, kept); i++) { const a = i * TAU / Math.max(1, Math.min(24, kept)) + t * .035; circle(b.x + Math.cos(a) * 39, b.y + Math.sin(a) * 39, 1.8, C.white, true); }
    text('THE ARCHIVE', b.x, b.y + b.radius + 26, 10, '#d5dba9');
    if (!hero && b.hp < 100) { ctx.fillStyle = '#472f29'; ctx.fillRect(b.x - 30, b.y + 41, 60, 3); ctx.fillStyle = b.hp < 30 ? C.orange : C.gold; ctx.fillRect(b.x - 30, b.y + 41, 60 * b.hp / b.maxHp, 3); }
  }
  function human(person, t, index, mode) {
    const pulse = .6 + Math.sin(t * 3 + index) * .2;
    if (!person.following) { circle(person.x, person.y, 18 + pulse * 5, '#91d7ba33'); line(person.x, person.y - 24, person.x, person.y - 30, C.mint); }
    circle(person.x, person.y - 4, 4, C.mint, true);
    ctx.fillStyle = C.mint; ctx.fillRect(person.x - 4, person.y + 2, 8, 7);
    text(person.name.toUpperCase(), person.x, person.y + 27, 11, person.capture ? C.orange : '#b2d6b7');
    if (person.capture > 0) { ctx.beginPath(); ctx.arc(person.x, person.y, 25, -Math.PI / 2, -Math.PI / 2 + TAU * person.capture / (mode === 'story' ? 360 : 240)); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke(); text('REDACTING', person.x, person.y - 36, 9, C.orange); }
  }
  function enemy(e, t) {
    const color = e.flash > 0 ? C.white : C.orange;
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.angle + Math.PI / 2);
    ctx.strokeStyle = color; ctx.fillStyle = e.flash > 0 ? '#ebead0' : '#623a2d'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const sides = e.kind === 'boss' ? 8 : e.kind === 'brute' ? 6 : e.kind === 'ranged' ? 5 : e.kind === 'siege' || e.kind === 'warden' ? 4 : 3;
    for (let i = 0; i < sides; i++) { const a = i * TAU / sides - Math.PI / 2; const x = Math.cos(a) * e.radius, y = Math.sin(a) * e.radius; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (e.kind === 'siege' || e.kind === 'boss') { ctx.rotate(t); ctx.strokeRect(-e.radius * .45, -e.radius * .45, e.radius * .9, e.radius * .9); }
    if (e.kind === 'warden') { circle(0, 0, e.radius + 6, C.orange); line(-9, -9, 9, 9, C.white); line(9, -9, -9, 9, C.white); }
    circle(0, 0, e.kind === 'boss' ? 9 : 3, color, true);
    ctx.restore();
    if (e.hp < e.maxHp && e.kind !== 'boss') { ctx.fillStyle = '#f28b6b'; ctx.fillRect(e.x - 12, e.y - e.radius - 8, 24 * Math.max(0, e.hp / e.maxHp), 2); }
  }
  function draw(w, dt = .016) {
    resize(); if (!width || !height) return;
    time += reduced ? 0 : Math.min(dt, .05); const t = time;
    ctx.setTransform(ratio * width / LIGHT.width, 0, 0, ratio * height / LIGHT.height, 0, 0);
    shake = Math.max(0, shake - dt * 18);
    if (!reduced && shake > 0) ctx.translate(Math.sin(t * 71) * shake, Math.cos(t * 57) * shake);
    background(t); beacon(w, t);
    if (hero) {
      const points = [{ x: 288, y: 260, name: 'MARA' }, { x: 775, y: 480, name: 'IVO' }, { x: 785, y: 178, name: 'JUNE' }, { x: 385, y: 580, name: 'SOL' }];
      ctx.setLineDash([3, 7]);
      for (const p of points) line(550, 370, p.x, p.y, '#88a86d55');
      ctx.setLineDash([]); points.forEach((p, i) => human(p, t, i));
      for (let i = 0; i < 9; i++) { const a = i * 2.399 + t * .012; enemy({ x: 550 + Math.cos(a) * 440, y: 370 + Math.sin(a) * 310, kind: i % 3 === 0 ? 'siege' : 'seeker', angle: a - Math.PI, radius: 12, hp: 1, maxHp: 1 }, t); }
      circle(550, 370, 108 + t * 9 % 100, '#c2e8a01c');
      text('ONE LIGHT. EVERYONE LEFT.', 550, 666, 11, C.gold);
      return;
    }
    for (const p of w.people) if (p.following) { ctx.setLineDash([3, 6]); line(w.player.x, w.player.y, p.x, p.y, '#8dc4a045'); ctx.setLineDash([]); }
    for (const spark of w.sparks) { ctx.save(); ctx.translate(spark.x, spark.y); ctx.rotate(Math.PI / 4); ctx.fillStyle = C.gold; ctx.fillRect(-3, -3, 6, 6); ctx.restore(); }
    for (const beam of w.beams) {
      const endX = beam.x + Math.cos(beam.angle) * 1400, endY = beam.y + Math.sin(beam.angle) * 1400;
      if (beam.warning > 0) { ctx.setLineDash([12, 12]); line(beam.x, beam.y, endX, endY, '#f4926888', 2); ctx.setLineDash([]); circle(beam.x, beam.y, 50, C.orange); text(`REDACTION ${(beam.warning / 60).toFixed(1)}`, beam.x, beam.y - 65, 11, C.orange); }
      else { line(beam.x, beam.y, endX, endY, '#f4926844', beam.width + 14); line(beam.x, beam.y, endX, endY, '#ffe3bb', beam.width); }
    }
    for (const e of w.enemies) if (e.kind === 'warden') {
      const person = w.people.filter(p => !p.following).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
      if (person && Math.hypot(person.x - e.x, person.y - e.y) < 95) { ctx.setLineDash([4, 6]); line(e.x, e.y, person.x, person.y, C.orange); ctx.setLineDash([]); }
    }
    w.people.forEach((p, i) => human(p, t, i, w.mode));
    for (const e of w.enemies) enemy(e, t);
    for (const h of w.hazards) { circle(h.x, h.y, h.radius + 3, '#fa896933', true); circle(h.x, h.y, h.radius, C.orange); }
    for (const bolt of w.bolts) { line(bolt.x - Math.cos(bolt.angle) * 17, bolt.y - Math.sin(bolt.angle) * 17, bolt.x, bolt.y, C.mint, 3); circle(bolt.x, bolt.y, 2, C.white, true); }
    const p = w.player;
    if (w.mods.orbit) for (let i = 0; i < 3; i++) { const a = t * 2.5 + i * TAU / 3; circle(p.x + Math.cos(a) * 58, p.y + Math.sin(a) * 58, 7, C.gold); }
    if (p.dashTicks) { line(p.x - p.dx * 55, p.y - p.dy * 55, p.x, p.y, '#99e1be88', 8); }
    if (!(p.invulnerable > 0 && w.tick % 8 < 3)) {
      circle(p.x, p.y, 20, '#9bd7b23b');
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(-10, -10); ctx.lineTo(-5, 0); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (w.waveTick < 420 && w.wave === 1) { text('YOU', p.x, p.y - 28, 10, C.white); text('BRING THE GREEN SIGNALS HOME', 550, 90, 13, C.mint); }
    if (w.people.some(person => person.following) && Math.hypot(p.x - 550, p.y - 370) > 140) {
      const a = Math.atan2(370 - p.y, 550 - p.x); text('HOME', p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70, 9, C.gold);
    }
    const boss = w.enemies.find(e => e.kind === 'boss');
    if (boss) { text(`THE EDITOR / ${['', 'ERASURE', 'REVISION', 'FINAL DRAFT'][boss.phase || 1]}`, 550, 55, 11, C.orange); ctx.fillStyle = '#56392f'; ctx.fillRect(380, 67, 340, 4); ctx.fillStyle = C.orange; ctx.fillRect(380, 67, 340 * Math.max(0, boss.hp / boss.maxHp), 4); }
    const untilDawn = Math.ceil(((w.wave === 5 ? LIGHT.finalTicks : LIGHT.waveTicks) - w.waveTick) / 60);
    if (untilDawn > 0 && untilDawn <= 10 && w.people.length) text(`DAWN IN ${untilDawn} / ${w.people.length} SIGNALS STILL OUTSIDE`, 550, boss ? 100 : 55, 12, C.gold);
    for (const particle of particles) { particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; ctx.globalAlpha = Math.max(0, particle.life / particle.max); ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, 3, 3); }
    ctx.globalAlpha = 1; particles = particles.filter(p => p.life > 0);
    for (const ring of rings) { ring.life -= dt; ctx.globalAlpha = Math.max(0, ring.life); circle(ring.x, ring.y, (ring.pulse ? 1.1 - ring.life : .6 - ring.life) * (ring.pulse ? 1100 : 120), ring.pulse ? C.gold : C.mint, false, ring.pulse ? 4 : 2); }
    ctx.globalAlpha = 1; rings = rings.filter(r => r.life > 0);
    for (const label of labels) { label.life -= dt; text(label.text, label.x, label.y - (2.5 - label.life) * 9, 10, C.white); } labels = labels.filter(l => l.life > 0);
    if (p.hp < 25 || w.beacon.hp < 25) { ctx.strokeStyle = '#f0806055'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 1088, 728); }
  }
  return { draw, consume, resize, reset() { particles = []; rings = []; labels = []; shake = 0; }, setReducedMotion(value) { reduced = value; }, toWorld(clientX, clientY) { const r = canvas.getBoundingClientRect(); return { x: (clientX - r.left) / r.width * LIGHT.width, y: (clientY - r.top) / r.height * LIGHT.height }; } };
}
