import { createWorld, stepWorld, applyUpgrade } from './sim/world.js';
import { createRenderer } from './view/renderer.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createUI } from './ui.js';
import { createStorage } from './storage.js';
import { createClock } from './clock.js';

const canvas = document.querySelector('#game');
const root = document.querySelector('#ui');
const storage = createStorage();
let profile = storage.load();
const renderer = createRenderer(canvas);
const audio = createAudio();
let world = createWorld(profile.lastSeed || 1);
let screen = 'title';
let paused = false;
let frameId = 0;
let disposed = false;
let lastTime = performance.now();
let uiElapsed = 0;
let lastPhase = world.phase;
let ended = false;
const frameTimes = [];

function settings() { return { ...profile.settings, bestScore: profile.bestScore, paused }; }
function save() {
  if (storage.save(profile)) profile = storage.load();
}
function unlockAudio() { Promise.resolve(audio.unlock()).catch(() => {}); }
function display(name) {
  screen = name;
  canvas.style.cursor = name === 'playing' ? 'none' : 'default';
  root.dataset.screen = name;
  ui.showScreen(name, { world, ...settings() });
  ui.update(world, settings());
  input.clear();
  clock.reset();
}
function freshSeed() { return crypto.getRandomValues(new Uint32Array(1))[0] || 1; }
function start(seed) {
  const requested = seed ?? new URLSearchParams(location.search).get('seed');
  const numeric = requested == null || requested === '' ? freshSeed() : Number(requested);
  world = createWorld(Number.isFinite(numeric) ? numeric : freshSeed());
  profile.lastSeed = world.seed;
  save();
  paused = false;
  ended = false;
  lastPhase = world.phase;
  unlockAudio();
  audio.setIntensity(1, 0);
  // A new renderer clears all event effects without rebuilding cached geometry.
  renderer.consume([{ type: 'run-start', tick: 0, act: 1 }]);
  display('playing');
  lastTime = performance.now();
}
function togglePause() {
  if (!['playing', 'paused'].includes(screen) || world.phase !== 'playing') return;
  paused = !paused;
  if (paused) audio.suspend(); else unlockAudio();
  display(paused ? 'paused' : 'playing');
}
function toggleMute() {
  profile.settings.muted = !profile.settings.muted;
  audio.setMuted(profile.settings.muted);
  if (!profile.settings.muted && !paused && screen !== 'title') unlockAudio();
  save();
  ui.update(world, settings());
}
function toggleReducedMotion() {
  profile.settings.reducedMotion = !profile.settings.reducedMotion;
  renderer.setReducedMotion(profile.settings.reducedMotion);
  save();
  ui.update(world, settings());
}
function chooseUpgrade(id) {
  if (world.phase !== 'upgrade') return;
  const events = applyUpgrade(world, id);
  renderer.consume(events);
  audio.consume(events);
  audio.setIntensity(world.act, world.boss?.phase || 0);
  if (world.phase !== 'upgrade') {
    lastPhase = world.phase;
    unlockAudio();
    display('playing');
  }
}
const ui = createUI(root, {
  play: start,
  chooseUpgrade,
  restartSame: () => start(world.seed),
  newRun: () => start(freshSeed()),
  togglePause,
  toggleMute,
  toggleReducedMotion,
});
const input = createInput(canvas, (x, y) => renderer.screenToWorld(x, y), {
  pause: togglePause,
  mute: toggleMute,
  chooseUpgrade: index => { const offer = world.upgradeOffers[index]; if (offer) chooseUpgrade(offer.id); },
  restart: () => { if (world.phase === 'won' || world.phase === 'lost') start(world.seed); },
});
const clock = createClock(() => {
  if (screen !== 'playing' || paused || world.phase !== 'playing') return false;
  const events = stepWorld(world, input.sample());
  renderer.consume(events);
  audio.consume(events);
  if (events.some(event => event.type === 'act-start' || event.type === 'boss-phase')) audio.setIntensity(world.act, world.boss?.phase || 0);
  if (world.phase !== lastPhase) {
    lastPhase = world.phase;
    if ((world.phase === 'won' || world.phase === 'lost') && !ended) {
      ended = true;
      profile.bestScore = Math.max(profile.bestScore, world.score);
      save();
    }
    display(world.phase === 'playing' ? 'playing' : world.phase);
    return false;
  }
  return true;
});

function resize() { renderer.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 1.5)); }
function loseFocus() {
  input.clear();
  if (screen === 'playing' && !paused) togglePause();
  else audio.suspend();
}
function visibility() { if (document.hidden) loseFocus(); }
window.addEventListener('resize', resize);
window.addEventListener('blur', loseFocus);
document.addEventListener('visibilitychange', visibility);
audio.setMuted(profile.settings.muted);
renderer.setReducedMotion(profile.settings.reducedMotion);
resize();
display('title');

function frame(now) {
  if (disposed) return;
  const dt = Math.max(0, (now - lastTime) / 1000);
  lastTime = now;
  const active = screen === 'playing' && !paused && !document.hidden;
  const alpha = clock.advance(dt, active);
  renderer.draw(world, alpha, Math.min(dt, 0.05));
  if (active && dt < 0.25) {
    frameTimes.push(dt * 1000);
    if (frameTimes.length > 600) frameTimes.shift();
  }
  uiElapsed += dt;
  if (uiElapsed >= 1 / 30) { ui.update(world, settings()); uiElapsed = 0; }
  frameId = requestAnimationFrame(frame);
}
frameId = requestAnimationFrame(frame);

// Read-only diagnostics enable repeatable browser validation without gameplay cheats.
Object.defineProperty(window, '__echoRequiem', { value: Object.freeze({
  inspect: () => ({
    screen, paused, phase: world.phase, seed: world.seed, tick: world.tick, act: world.act,
    actTick: world.actTick, score: world.score, stats: { ...world.stats },
    player: { x: world.player.x, y: world.player.y, hp: world.player.hp, maxHp: world.player.maxHp, forkCharges: world.player.forkCharges, historyLength: world.player.history.length, dashCooldown: world.player.dashCooldown },
    enemies: world.enemies.map(({ id, kind, x, y, hp, spawnTicks }) => ({ id, kind, x, y, hp, spawnTicks })),
    projectiles: world.projectiles.filter(p => p.owner === 'enemy').map(({ x, y, vx, vy }) => ({ x, y, vx, vy })),
    echoes: world.echoes.length,
    boss: world.boss ? { x: world.boss.x, y: world.boss.y, hp: world.boss.hp, maxHp: world.boss.maxHp, phase: world.boss.phase } : null,
    upgrades: [...world.player.upgrades], offers: world.upgradeOffers.map(offer => ({ ...offer })),
  }),
  performance: () => {
    const sorted = [...frameTimes].sort((a, b) => a - b);
    return { samples: sorted.length, medianMs: sorted[Math.floor(sorted.length / 2)] || 0, p95Ms: sorted[Math.floor(sorted.length * 0.95)] || 0 };
  },
}) });

function pageHide(event) {
  // Back/Forward cache freezes this same document; it does not re-run modules.
  if (event.persisted) { loseFocus(); clock.reset(); return; }
  disposed = true;
  cancelAnimationFrame(frameId);
  input.destroy(); ui.destroy(); renderer.destroy(); audio.destroy();
  window.removeEventListener('resize', resize);
  window.removeEventListener('blur', loseFocus);
  document.removeEventListener('visibilitychange', visibility);
  window.removeEventListener('pagehide', pageHide);
  window.removeEventListener('pageshow', pageShow);
}
function pageShow(event) {
  if (!event.persisted || disposed) return;
  lastTime = performance.now();
  clock.reset();
  input.clear();
  resize();
  cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(frame);
}
window.addEventListener('pagehide', pageHide);
window.addEventListener('pageshow', pageShow);
