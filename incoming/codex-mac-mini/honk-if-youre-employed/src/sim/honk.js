import { HONK } from '../contracts.js';
import { random, choose, normalizeSeed } from './rng.js';
import { HONK_MODES, HONK_INCIDENTS } from './honk-content.js';

export const HONK_UPGRADES = Object.freeze([
  { id: 'megaphone', icon: '01', name: 'Executive volume', detail: 'Your honk hits 35% farther and deals +1 damage.', joke: 'Being louder is basically leadership.' },
  { id: 'espresso', icon: '02', name: 'Unpaid espresso', detail: 'Move 18% faster. Honk cooldown is 25% shorter.', joke: 'Your blood type is now cold brew.' },
  { id: 'benefits', icon: '03', name: 'Dental, somehow', detail: '+2 maximum health. Completely heal.', joke: 'You have no teeth. Negotiate anyway.' },
  { id: 'reply', icon: '04', name: 'Reply-all privileges', detail: 'Charge Reply All twice as fast. Fill it now.', joke: '47,000 people needed to see this.' },
  { id: 'legal', icon: '05', name: 'Emotional support tie', detail: 'Dash twice as often. Dashing damages coworkers.', joke: 'Legally, you are now a consultant.' },
  { id: 'lunch', icon: '06', name: 'Lunch acquisition', detail: 'Pull snacks from much farther away. Snacks heal +1.', joke: 'The fridge is a merger opportunity.' },
  { id: 'bowling', icon: '07', name: 'Chairman of the board', detail: 'Chairs hit twice as hard and roll much longer.', joke: 'Your leadership style is furniture.' },
  { id: 'unsubscribe', icon: '08', name: 'Inbox zero', detail: 'Every email you honk away charges Reply All +4%.', joke: 'Your out-of-office reply has teeth.' },
  { id: 'union', icon: '09', name: 'Union-mandated break', detail: 'Taking damage stuns nearby coworkers. +1 max health.', joke: 'The goose has organized labor.' },
]);
export const HONK_DESKS = Object.freeze([
  { x: 188, y: 150, w: 150, h: 55 }, { x: 188, y: 435, w: 150, h: 55 },
  { x: 862, y: 150, w: 150, h: 55 }, { x: 862, y: 435, w: 150, h: 55 },
]);
const QUIPS = ['PER MY LAST HONK.', 'THIS MEETING IS NOW AN EMAIL.', 'CIRCLE BACK TO HELL.', 'SYNERGY HAS LEFT THE CHAT.', 'LET’S UNPACK THAT. VIOLENTLY.', 'GREAT QUESTION. HONK.', 'PLEASE ADVISE. HONK.', 'OUT OF OFFICE. IN YOUR FACE.'];
const WORKER_LINES = ['Quick sync?', 'Got a sec?', 'We’re a family.', 'Just circling back.', 'Mandatory fun!', 'Can you see my screen?', 'Let’s touch base.', 'Thoughts?'];
const MEETING_SPOTS = [{ x: 455, y: 220 }, { x: 740, y: 410 }, { x: 620, y: 290 }, { x: 1050, y: 330 }, { x: 140, y: 330 }];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function emit(s, type, data = {}) { s.events.push({ type, tick: s.tick, ...data }); }
function addScore(s, points, x, y, label) {
  s.combo = s.comboTicks > 0 ? s.combo + 1 : 1;
  s.comboTicks = 180;
  s.multiplier = Math.min(5, 1 + Math.floor(s.combo / 4));
  const amount = points * s.multiplier;
  s.score += amount;
  s.bestCombo = Math.max(s.bestCombo, s.combo);
  emit(s, 'score', { amount, x, y, label });
}
function props() {
  return [
    { x: 245, y: 145, kind: 'monitor' }, { x: 940, y: 145, kind: 'monitor' },
    { x: 245, y: 430, kind: 'monitor' }, { x: 940, y: 430, kind: 'monitor' },
    { x: 1120, y: 310, kind: 'printer' }, { x: 80, y: 310, kind: 'cooler' },
    { x: 600, y: 110, kind: 'coffee' }, { x: 600, y: 530, kind: 'cake' },
  ].map((p, id) => ({ ...p, id, hp: 2, hit: 0, broken: false }));
}
function createChairs() {
  return [{ x: 462, y: 245 }, { x: 735, y: 398 }, { x: 1050, y: 340 }, { x: 135, y: 400 }].map((c, i) => ({ ...c, id: i, vx: 0, vy: 0, spin: 0, hitIds: [], chain: 0, launchTick: -1 }));
}
export function createHonk(seed = 17, options = {}) {
  const mode = options.mode === 'casual' ? 'casual' : 'career', health = HONK_MODES[mode].health;
  return { seed: normalizeSeed(seed), rngState: normalizeSeed(seed), mode, overtime: 0, tick: 0, shift: 1, shiftTick: 0, phase: 'playing', score: 0,
    combo: 0, comboTicks: 0, multiplier: 1, bestCombo: 0, charge: 35, upgrades: [], offers: [],
    player: { x: 600, y: 350, face: 1, hp: health, maxHp: health, speed: 230, range: 122, damage: 2, honkCooldown: 0, honkRate: 36, dashCooldown: 0, dashRate: 100, dashTicks: 0, dashX: 1, dashY: 0, invulnerable: 0, honking: 0, moving: false },
    enemies: [], papers: [], snacks: [], props: props(), chairs: createChairs(), stamps: [], incident: null, events: [], nextId: 1, spawned: 0, bossSpawned: false, winBonus: 0,
    stats: { meetings: 0, objects: 0, honks: 0, lunches: 0, emails: 0, replies: 0, chairHits: 0, bestChairChain: 0, incidents: 0, damage: 0, bosses: 0 }, shiftStats: { meetings: 0, objects: 0 }, objectiveDone: false, headline: 'You lied on LinkedIn. They hired you anyway.' };
}
function resolveBody(body, radius) {
  body.x = clamp(body.x, 40, HONK.width - 40); body.y = clamp(body.y, 65, HONK.height - 40);
  for (const d of HONK_DESKS) {
    const nx = clamp(body.x, d.x, d.x + d.w), ny = clamp(body.y, d.y, d.y + d.h);
    let dx = body.x - nx, dy = body.y - ny;
    const len = Math.hypot(dx, dy);
    if (len > 0 && len < radius) { body.x = nx + dx / len * radius; body.y = ny + dy / len * radius; }
    else if (len === 0) {
      const sides = [body.x - d.x, d.x + d.w - body.x, body.y - d.y, d.y + d.h - body.y];
      const side = sides.indexOf(Math.min(...sides));
      if (side === 0) body.x = d.x - radius;
      else if (side === 1) body.x = d.x + d.w + radius;
      else if (side === 2) body.y = d.y - radius;
      else body.y = d.y + d.h + radius;
    }
  }
}
function crossesDesk(a, b, d, padding) {
  let low = 0, high = 1;
  for (const [axis, min, max] of [['x', d.x - padding, d.x + d.w + padding], ['y', d.y - padding, d.y + d.h + padding]]) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < .0001) { if (a[axis] <= min || a[axis] >= max) return false; }
    else {
      let start = (min - a[axis]) / delta, end = (max - a[axis]) / delta;
      if (start > end) [start, end] = [end, start];
      low = Math.max(low, start); high = Math.min(high, end);
      if (low >= high) return false;
    }
  }
  return high > .01 && low < .99;
}
function approach(e, target) {
  const radius = e.kind === 'boss' ? 28 : 16;
  const obstacle = HONK_DESKS.find(d => crossesDesk(e, target, d, radius));
  if (!obstacle) return target;
  const pad = radius + 7, d = obstacle;
  const corners = [{ x: d.x - pad, y: d.y - pad }, { x: d.x + d.w + pad, y: d.y - pad }, { x: d.x - pad, y: d.y + d.h + pad }, { x: d.x + d.w + pad, y: d.y + d.h + pad }];
  const visible = corners.filter(c => !HONK_DESKS.some(box => crossesDesk(e, c, box, radius)));
  visible.sort((a, b) => {
    const cost = c => distance(e, c) + distance(c, target) + (crossesDesk(c, target, d, radius) ? 120 : 0);
    return cost(a) - cost(b);
  });
  return visible[0] || target;
}
function snack(s, x, y, guaranteed = false) {
  if ((guaranteed || random(s) < 0.38) && s.snacks.length < 28) s.snacks.push({ id: s.nextId++, x, y, ttl: 900 });
}
function hurt(s) {
  if (s.phase !== 'playing') return;
  const p = s.player;
  if (p.invulnerable > 0 || p.dashTicks > 0) return;
  p.hp--; p.invulnerable = 100; s.combo = 0; s.comboTicks = 0; s.multiplier = 1;
  s.stats.damage++;
  if (s.upgrades.includes('union')) for (const e of s.enemies) if (distance(p, e) < 175 && e.kind !== 'boss') { e.stun = 100; e.chargeTicks = 0; }
  emit(s, 'hurt', { x: p.x, y: p.y });
  if (p.hp <= 0) { s.phase = 'lost'; s.headline = 'Your position has been made redundant.'; emit(s, 'lost'); }
}
function hitEnemy(s, e, damage, force = 24) {
  if (e.hp <= 0) return;
  e.hp -= damage; e.hit = 12; e.stun = e.kind === 'boss' ? 0 : 24;
  if (e.kind === 'security') { e.chargeTicks = 0; e.windup = 0; e.cooldown = Math.max(90, e.cooldown); }
  const dx = e.x - s.player.x, dy = e.y - s.player.y, len = Math.hypot(dx, dy) || 1;
  e.x += dx / len * force; e.y += dy / len * force; resolveBody(e, e.kind === 'boss' ? 28 : 18);
  s.charge = Math.min(100, s.charge + (s.upgrades.includes('reply') ? 10 : 5));
  emit(s, 'impact', { x: e.x, y: e.y, boss: e.kind === 'boss' });
  if (e.hp <= 0) {
    s.stats.meetings++; s.shiftStats.meetings++;
    addScore(s, e.kind === 'boss' ? 1000 : e.kind === 'email' ? 100 : 60, e.x, e.y, e.kind === 'boss' ? 'HR HAS BEEN OUTSOURCED' : choose(s, ['MEETING CANCELLED', 'OFFLINE, PERMANENTLY', 'TOUCHING GRASS', 'CALENDAR CLEARED', 'SYNERGY −100%']));
    snack(s, e.x, e.y); emit(s, 'fired', { x: e.x, y: e.y, kind: e.kind });
    if (e.kind === 'boss') {
      s.stats.bosses++; s.winBonus = Math.max(0, Math.ceil((HONK.shiftTicks[2] - s.shiftTick) / 60)) * 25; s.score += s.winBonus;
      s.phase = 'won'; s.headline = s.overtime ? 'The board has approved another board. You ate it.' : 'The board has elected you CEO. Nobody knows why.'; emit(s, 'won');
    }
  } else if (e.kind === 'boss') {
    const phase = e.hp <= e.maxHp * .25 ? 3 : e.hp <= e.maxHp * .6 ? 2 : 1;
    if (phase > (e.bossPhase || 1)) { e.bossPhase = phase; emit(s, 'boss-phase', { phase }); s.headline = phase === 2 ? 'HR has placed you on a Performance Improvement Plan. You cannot read.' : 'EXIT INTERVIEW. PLEASE BRING YOUR OWN EXIT.'; }
  }
}
function hitProp(s, o, damage) {
  if (o.broken) return;
  o.hp -= damage; o.hit = 12;
  if (o.hp <= 0) {
    o.broken = true; s.stats.objects++; s.shiftStats.objects++;
    const label = { monitor: 'PASSWORD RESET', printer: 'PC LOAD HONK', cooler: 'WATER: DISRUPTED', coffee: 'JAVA EXCEPTION', cake: 'CULTURE FIT: DELICIOUS' }[o.kind];
    addScore(s, 120, o.x, o.y, label); s.charge = Math.min(100, s.charge + 9); snack(s, o.x, o.y + 36, true);
    emit(s, 'broken', { x: o.x, y: o.y, kind: o.kind });
  }
}
function honk(s) {
  const p = s.player;
  p.honkCooldown = p.honkRate; p.honking = 15; s.stats.honks++;
  emit(s, 'honk', { x: p.x, y: p.y, radius: p.range });
  for (const e of s.enemies) if (distance(p, e) <= p.range + (e.kind === 'boss' ? 35 : 16)) hitEnemy(s, e, p.damage, e.kind === 'boss' ? 7 : 42);
  for (const o of s.props) if (distance(p, o) < p.range + 20) hitProp(s, o, p.damage);
  for (const chair of s.chairs) if (distance(p, chair) < p.range + 15) {
    const dx = chair.x - p.x, dy = chair.y - p.y, d = Math.hypot(dx, dy) || 1;
    chair.vx = (d > 1 ? dx / d : p.face) * 660; chair.vy = dy / d * 660; chair.hitIds = []; chair.chain = 0; chair.launchTick = s.tick;
    emit(s, 'chair-launch', { x: chair.x, y: chair.y });
  }
  for (const b of s.papers) if (b.ttl > 0 && distance(p, b) <= p.range) {
    b.ttl = 0; s.stats.emails++; s.charge = Math.min(100, s.charge + (s.upgrades.includes('unsubscribe') ? 4 : s.incident?.id === 'storm' ? 2 : 0)); emit(s, 'impact', { x: b.x, y: b.y });
  }
  if (s.stats.honks % 7 === 0) { s.headline = choose(s, QUIPS); emit(s, 'quip', { text: s.headline }); }
}
function replyAll(s) {
  if (s.charge < 100) return;
  s.charge = 0; s.stats.replies++;
  emit(s, 'reply', { x: s.player.x, y: s.player.y, radius: 1500 });
  for (const e of s.enemies) hitEnemy(s, e, e.kind === 'boss' ? 9 : 10, 70);
  for (const o of s.props) hitProp(s, o, 4);
  // The special cannot recharge itself from the damage it just dealt.
  s.charge = 0;
  s.papers = []; s.stamps = []; s.player.invulnerable = Math.max(80, s.player.invulnerable);
  s.headline = 'REPLY ALL: “Please remove me from this company.”';
}
function spawn(s, kind) {
  // Always reserve the boss slot, even if a player avoids every earlier enemy.
  const cap = HONK.maxEnemies - (!s.bossSpawned && s.shift === 3 && kind !== 'boss' ? 1 : 0);
  if (s.enemies.length >= cap) return;
  const points = [{ x: 42, y: 90 }, { x: 1158, y: 90 }, { x: 42, y: 570 }, { x: 1158, y: 570 }, { x: 600, y: 70 }];
  const safe = points.filter(p => distance(p, s.player) > 260);
  const point = choose(s, safe.length ? safe : points);
  const boss = kind === 'boss';
  const hp = boss ? HONK_MODES[s.mode].bossHealth + Math.min(48, s.overtime * 10) : kind === 'security' ? 5 : kind === 'email' ? 3 : 2 + (s.shift > 1 ? 1 : 0);
  s.enemies.push({ ...point, id: s.nextId++, kind, hp, maxHp: hp, speed: (boss ? 58 : kind === 'email' ? 67 : 77 + s.shift * 9) * HONK_MODES[s.mode].enemySpeed * (1 + Math.min(.5, s.overtime * .07)),
    hit: 0, stun: 0, age: 0, warning: 0, cooldown: boss ? 130 : 100 + Math.floor(random(s) * 80), line: boss ? 'WE NEED TO TALK.' : kind === 'security' ? 'BADGE CHECK.' : choose(s, WORKER_LINES), dashHit: false, bossPhase: 1, chargeTicks: 0, windup: 0, chargeX: 0, chargeY: 0 });
  s.spawned++;
  if (boss) { s.bossSpawned = true; s.headline = 'HUMAN RESOURCES. Neither human nor resourceful.'; emit(s, 'boss'); }
}
function firePaper(s, e, angle, speed = 170) {
  if (s.papers.length >= HONK.maxPapers) return;
  speed *= HONK_MODES[s.mode].paperSpeed;
  s.papers.push({ id: s.nextId++, x: e.x, y: e.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, ttl: 320, boss: e.kind === 'boss' });
}
function addStamp(s, x, y, delay = 90, duration = 75, radius = 68) {
  if (s.stamps.length >= HONK.maxStamps) return;
  s.stamps.push({ id: s.nextId++, x: clamp(x, 85, 1115), y: clamp(y, 110, 550), delay, totalDelay: delay, ttl: duration, radius, impact: false });
}
function beginIncident(s, id) {
  s.incident = { id, remaining: HONK_INCIDENTS[id].duration }; s.stats.incidents++;
  s.headline = `${HONK_INCIDENTS[id].title}. ${HONK_INCIDENTS[id].description}`; emit(s, 'incident', { id });
  if (id === 'pizza') {
    for (const p of [{ x: 460, y: 330 }, { x: 740, y: 240 }, { x: 600, y: 475 }]) if (s.snacks.length < 28) s.snacks.push({ ...p, id: s.nextId++, ttl: 480, kind: 'pizza' });
  }
  if (id === 'meeting') {
    const pool = [...MEETING_SPOTS];
    for (let i = 0; i < 3; i++) { const index = Math.floor(random(s) * pool.length), point = pool.splice(index, 1)[0]; addStamp(s, point.x, point.y, 100 + i * 35, 160, 78); }
  }
}
function stepChairs(s) {
  for (const c of s.chairs) {
    const speed = Math.hypot(c.vx, c.vy); if (speed < 30) { c.vx = 0; c.vy = 0; continue; }
    const oldX = c.x, oldY = c.y;
    c.x += c.vx / 60; c.y += c.vy / 60; const intendedX = c.x, intendedY = c.y;
    resolveBody(c, 18);
    if (Math.abs(c.x - intendedX) > .01) c.vx *= -.7;
    if (Math.abs(c.y - intendedY) > .01) c.vy *= -.7;
    c.spin += speed / 3200;
    const friction = s.upgrades.includes('bowling') ? .99 : .984; c.vx *= friction; c.vy *= friction;
    for (const e of s.enemies) {
      if (e.hp <= 0 || c.hitIds.includes(e.id) || distance(c, e) > (e.kind === 'boss' ? 49 : 37)) continue;
      c.hitIds.push(e.id); c.chain++; s.stats.chairHits++; s.stats.bestChairChain = Math.max(s.stats.bestChairChain, c.chain);
      hitEnemy(s, e, s.upgrades.includes('bowling') ? 6 : 3, 36);
      addScore(s, 35, e.x, e.y, c.chain >= 3 ? 'STRIKE! RESTRUCTURING COMPLETE.' : 'HOSTILE SEATING ARRANGEMENT');
      emit(s, 'chair-hit', { x: e.x, y: e.y, chain: c.chain });
      if (s.phase !== 'playing') return;
    }
    for (const o of s.props) if (!o.broken && distance(c, o) < 38) hitProp(s, o, 3);
    if (Math.abs(oldX - c.x) + Math.abs(oldY - c.y) < .1) { c.vx = 0; c.vy = 0; }
  }
}
function completeObjective(s) {
  if (s.objectiveDone) return;
  if ((s.shift === 1 && s.shiftStats.objects >= 3) || (s.shift === 2 && s.shiftStats.meetings >= 10)) {
    s.objectiveDone = true; s.score += 500; s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
    emit(s, 'objective', { x: s.player.x, y: s.player.y, amount: 500, label: 'KPI MET. SOMEHOW. +1 HEALTH' });
    s.headline = 'Outstanding performance. Concerning methods.';
  }
}
export function stepHonk(s, input = {}) {
  s.events = [];
  if (s.phase !== 'playing') return s.events;
  s.tick++; s.shiftTick++;
  const p = s.player;
  for (const key of ['honkCooldown', 'dashCooldown', 'invulnerable', 'honking']) p[key] = Math.max(0, p[key] - 1);
  if (s.comboTicks > 0) s.comboTicks--;
  if (!s.comboTicks) { s.combo = 0; s.multiplier = 1; }
  let dx = Number.isFinite(input.x) ? clamp(input.x, -1, 1) : 0, dy = Number.isFinite(input.y) ? clamp(input.y, -1, 1) : 0;
  const len = Math.hypot(dx, dy); if (len > 1) { dx /= len; dy /= len; }
  p.moving = Boolean(dx || dy);
  if (dx) p.face = Math.sign(dx);
  if (input.dash && p.dashCooldown === 0) {
    p.dashTicks = 13; p.dashCooldown = p.dashRate; p.dashX = dx || (dy ? 0 : p.face); p.dashY = dy;
    p.invulnerable = Math.max(20, p.invulnerable); for (const e of s.enemies) e.dashHit = false;
    emit(s, 'dash', { x: p.x, y: p.y });
  }
  if (p.dashTicks > 0) { p.x += p.dashX * 12; p.y += p.dashY * 12; p.dashTicks--; }
  else { p.x += dx * p.speed / HONK.rate; p.y += dy * p.speed / HONK.rate; }
  resolveBody(p, 18);
  if (input.honk && p.honkCooldown === 0) honk(s);
  if (input.reply) replyAll(s);
  // Killing the boss ends the run before any incoming hit can override the win.
  if (s.phase !== 'playing') return s.events;
  stepChairs(s); if (s.phase !== 'playing') return s.events;
  if (s.incident && --s.incident.remaining <= 0) { s.incident = null; emit(s, 'incident-end'); }
  if (s.shiftTick === 600 && s.shift < 3) beginIncident(s, s.shift === 1 ? 'pizza' : 'meeting');
  if (s.shiftTick === 1500 && s.shift === 2) beginIncident(s, 'storm');
  if (s.shiftTick === 1200 && s.shift === 3) beginIncident(s, choose(s, ['pizza', 'meeting', 'storm']));
  const interval = Math.round(Math.max(38, 105 - s.shift * 15 - Math.floor(s.shiftTick / 600) * 7 - s.overtime * 4) * HONK_MODES[s.mode].spawnRate);
  if (s.shiftTick === 90 || s.shiftTick % interval === 0) spawn(s, s.shift > 1 && s.spawned % 7 === 6 ? 'security' : s.spawned % 4 === 3 ? 'email' : 'worker');
  if (s.shift === 3 && s.shiftTick >= (s.overtime ? 240 : 600) && !s.bossSpawned) spawn(s, 'boss');
  for (const mark of s.stamps) {
    if (mark.delay > 0) { mark.delay--; continue; }
    if (!mark.impact) { mark.impact = true; emit(s, 'stamp', { x: mark.x, y: mark.y }); }
    mark.ttl--; if (distance(p, mark) < mark.radius + 12) hurt(s);
    if (s.phase !== 'playing') return s.events;
  }
  s.stamps = s.stamps.filter(mark => mark.ttl > 0);
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    e.age++; e.hit = Math.max(0, e.hit - 1); e.stun = Math.max(0, e.stun - 1);
    if (p.dashTicks > 0 && s.upgrades.includes('legal') && !e.dashHit && distance(p, e) < 50) { e.dashHit = true; hitEnemy(s, e, 2, 20); }
    if (s.phase !== 'playing') return s.events;
    if (e.hp <= 0) continue;
    const ex = p.x - e.x, ey = p.y - e.y, el = Math.hypot(ex, ey) || 1;
    if (!e.stun && e.age > 35) {
      const move = e.kind === 'email' && el < 230 ? (el < 165 ? -0.6 : 0) : 1;
      const pizza = s.incident?.id === 'pizza' && e.kind !== 'boss' ? s.snacks.find(n => n.kind === 'pizza' && n.ttl > 0) : null;
      const target = move > 0 ? approach(e, pizza || p) : p;
      const mx = target.x - e.x, my = target.y - e.y, ml = Math.hypot(mx, my) || 1;
      if (e.kind === 'security') {
        e.cooldown--; e.windup = Math.max(0, e.windup - 1);
        if (e.chargeTicks > 0) {
          e.chargeTicks--; const nextX = e.x + e.chargeX * 7, nextY = e.y + e.chargeY * 7;
          e.x = nextX; e.y = nextY; resolveBody(e, 16);
          if (Math.abs(e.x - nextX) + Math.abs(e.y - nextY) > 1) { e.chargeTicks = 0; e.stun = 75; emit(s, 'security-crash', { x: e.x, y: e.y }); }
        } else if (e.cooldown <= 0 && e.windup === 0 && el < 450) {
          e.windup = 45; e.cooldown = 220; e.chargeX = ex / el; e.chargeY = ey / el;
        } else if (e.windup === 1) { e.chargeTicks = 32; emit(s, 'security-charge', { x: e.x, y: e.y }); }
        else if (e.windup === 0) { e.x += mx / ml * e.speed / 60; e.y += my / ml * e.speed / 60; resolveBody(e, 16); }
      } else { e.x += mx / ml * e.speed / 60 * move; e.y += my / ml * e.speed / 60 * move; resolveBody(e, e.kind === 'boss' ? 28 : 16); }
      if (e.kind === 'email' || e.kind === 'boss') {
        e.cooldown--; e.warning = e.cooldown < 35 ? 35 - e.cooldown : 0;
        if (e.cooldown <= 0) {
          const angle = Math.atan2(ey, ex);
          if (e.kind === 'boss') {
            const count = e.bossPhase === 3 ? 10 : 8;
            for (let i = 0; i < count; i++) firePaper(s, e, angle + i * Math.PI * 2 / count, e.bossPhase === 3 ? 165 : 140);
            if (e.bossPhase >= 2) addStamp(s, p.x, p.y, s.mode === 'casual' ? 115 : 90, 50, 68);
            e.cooldown = e.bossPhase === 3 ? 100 : 150;
          } else {
            firePaper(s, e, angle);
            if (s.incident?.id === 'storm') { firePaper(s, e, angle - .2, 145); firePaper(s, e, angle + .2, 145); }
            e.cooldown = 150;
          }
          e.warning = 0; emit(s, 'email', { x: e.x, y: e.y });
        }
      }
    }
    if (!e.stun && e.age > 35 && e.hp > 0 && distance(p, e) < (e.kind === 'boss' ? 47 : 32)) hurt(s);
    if (s.phase !== 'playing') return s.events;
  }
  for (const b of s.papers) {
    b.x += b.vx / 60; b.y += b.vy / 60; b.ttl--;
    if (b.ttl > 0 && distance(p, b) < 22) { hurt(s); b.ttl = 0; }
    if (s.phase !== 'playing') return s.events;
  }
  for (const n of s.snacks) {
    n.ttl--;
    const d = distance(p, n), reach = s.upgrades.includes('lunch') ? 220 : 65;
    if (d < reach && d > 0) { n.x += (p.x - n.x) / d * 7; n.y += (p.y - n.y) / d * 7; }
    if (n.ttl > 0 && d < 25) { n.ttl = 0; s.stats.lunches++; p.hp = Math.min(p.maxHp, p.hp + (s.upgrades.includes('lunch') || n.kind === 'pizza' ? 2 : 1)); s.score += 25; emit(s, 'lunch', { x: n.x, y: n.y, label: n.kind === 'pizza' ? 'THIS IS YOUR ANNUAL BONUS.' : 'GARY’S LUNCH. YOUR LUNCH.' }); }
  }
  for (const o of s.props) o.hit = Math.max(0, o.hit - 1);
  s.enemies = s.enemies.filter(e => e.hp > 0); s.snacks = s.snacks.filter(n => n.ttl > 0);
  s.papers = s.papers.filter(b => b.ttl > 0 && b.x > 10 && b.x < HONK.width - 10 && b.y > 30 && b.y < HONK.height - 10);
  if (s.phase !== 'playing') return s.events;
  completeObjective(s);
  if (s.shiftTick >= HONK.shiftTicks[s.shift - 1]) {
    if (s.shift < 3) {
      s.phase = 'promotion';
      const pool = HONK_UPGRADES.filter(u => !s.upgrades.includes(u.id));
      s.offers = [];
      while (s.offers.length < Math.min(3, pool.length)) { const candidate = choose(s, pool); if (!s.offers.includes(candidate.id)) s.offers.push(candidate.id); }
      emit(s, 'promotion');
    } else { s.phase = 'lost'; s.headline = 'HR outlasted you. That is literally their job.'; emit(s, 'lost'); }
  }
  return s.events;
}
export function chooseHonkUpgrade(s, id) {
  if (s.phase !== 'promotion' || !s.offers.includes(id) || s.upgrades.includes(id)) return false;
  const p = s.player; s.upgrades.push(id);
  if (id === 'megaphone') { p.range *= 1.35; p.damage++; }
  if (id === 'espresso') { p.speed *= 1.18; p.honkRate = Math.round(p.honkRate * 0.75); }
  if (id === 'benefits') { p.maxHp += 2; p.hp = p.maxHp; }
  if (id === 'reply') s.charge = 100;
  if (id === 'legal') p.dashRate = 50;
  if (id === 'union') p.maxHp++;
  p.hp = Math.min(p.maxHp, p.hp + 2); p.invulnerable = 100;
  s.shift++; s.shiftTick = 0; s.phase = 'playing'; s.offers = []; s.enemies = []; s.papers = []; s.snacks = []; s.props = props();
  s.chairs = createChairs(); s.stamps = []; s.incident = null; p.dashTicks = 0; p.honkCooldown = 0; p.dashCooldown = 0;
  s.shiftStats = { meetings: 0, objects: 0 }; s.objectiveDone = false;
  s.headline = s.shift === 2 ? 'You are now middle management. You have changed nothing.' : 'FINAL INTERVIEW: defeat the Head of Human Resources.';
  s.events = [{ type: 'shift', tick: s.tick }];
  return true;
}
export function continueHonkOvertime(s) {
  if (s.phase !== 'won' || s.shift !== 3) return false;
  s.overtime++; s.phase = 'playing'; s.shiftTick = 0; s.bossSpawned = false; s.winBonus = 0;
  s.enemies = []; s.papers = []; s.snacks = []; s.props = props(); s.chairs = createChairs(); s.stamps = []; s.incident = null;
  s.player.x = 600; s.player.y = 350; s.player.hp = s.player.maxHp; s.player.invulnerable = 120; s.player.dashTicks = 0; s.player.dashCooldown = 0; s.player.honkCooldown = 0;
  s.charge = 100; s.combo = 0; s.comboTicks = 0; s.multiplier = 1;
  s.headline = `UNPAID OVERTIME ${s.overtime}. Your reward for doing good work is more work.`;
  s.events = [{ type: 'shift', tick: s.tick }]; return true;
}
