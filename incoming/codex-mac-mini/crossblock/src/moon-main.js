import { MOON } from './contracts.js';
import { normalizeSeed } from './sim/rng.js';
import { createClock } from './clock.js';
import { createMoonWorld, stepMoon, chooseMoonUpgrade, continueMoonOvertime } from './sim/moon.js';
import { MOON_UPGRADES, MOON_LAWS, MOON_LOADOUTS, MOON_DIFFICULTIES, MOON_ACHIEVEMENTS, MOON_ENEMY_GUIDE, MOON_QUOTES } from './sim/moon-content.js';
import { createMoonStorage, moonDailySeed } from './moon-storage.js';
import { createMoonRenderer } from './view/moon-renderer.js';
import { createMoonAudio } from './moon-audio.js';

const $ = id => document.getElementById(id);
const canvas = $('moon-canvas'), screen = $('screen'), renderer = createMoonRenderer(canvas), audio = createMoonAudio();
const storage = createMoonStorage();
let profile = storage.load();
const coarsePointer = matchMedia('(pointer: coarse)').matches;
let world = null, mode = 'title', runMode = 'free', paused = false, muted = profile.settings.muted;
let reduced = storage.fresh || storage.status !== 'ready' ? matchMedia('(prefers-reduced-motion: reduce)').matches : profile.settings.reduced;
let autoAim = storage.fresh || storage.status !== 'ready' ? coarsePointer : profile.settings.autoAim;
let mouse = { x: 640, y: 200 }, firing = false, dash = false, burp = false, lastFrame = performance.now(), lastPhase = '', notificationUntil = 0;
let lastRun = null, runToken = '', storedDiscoveryCount = -1, badgeTime = 0, badgeQueue = [];
let stick = { x: 0, y: 0, pointer: null }, gamepadDash = false, gamepadBurp = false, gamepadPause = false;
const held = new Set(), knownBadges = new Set(profile.badges);
const requestedSeed = new URLSearchParams(location.search).get('seed');
const fixedSeed = requestedSeed !== null && requestedSeed.trim() !== '' && Number.isFinite(Number(requestedSeed)) ? normalizeSeed(requestedSeed) : null;
const lunch = { id: 'lunch', name: 'A legally mandated lunch', tag: 'FULL RECOVERY', description: 'Refill health and burp. Collect 1,000 points. You have somehow exhausted the promotions.', symbol: '☕' };
function setText(id, value) { const el = $(id); if (el && el.textContent !== value) el.textContent = value; }
function announce(message) { $('announcer').textContent = message; }
function dayKey() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function randomSeed() { const data = new Uint32Array(1); crypto.getRandomValues(data); return data[0]; }
function setProfile(next) { profile = next; setText('record-note', storage.status === 'ready' ? 'RECORDS SAVED ON THIS DEVICE' : 'RECORDS AVAILABLE THIS SESSION ONLY'); }
function persistDiscovery() {
  if (!world || storedDiscoveryCount === world.badges.length + world.discovered.length) return;
  setProfile(storage.discover(world.badges, world.discovered)); storedDiscoveryCount = world.badges.length + world.discovered.length;
}
function clearInput() {
  held.clear(); firing = false; dash = false; burp = false; stick.x = 0; stick.y = 0; stick.pointer = null;
  if ($('stick-knob')) $('stick-knob').style.transform = 'translate(0,0)';
}
function focusFirst() { screen.querySelector('button')?.focus({ preventScroll: true }); }
function clearScreen() {
  screen.innerHTML = ''; screen.className = 'screen'; screen.removeAttribute('role'); screen.removeAttribute('aria-modal'); screen.removeAttribute('aria-label');
}
function queueBadge(id) {
  if (knownBadges.has(id)) return;
  knownBadges.add(id); badgeQueue.push(id);
}
function renderTitle() {
  const daily = runMode === 'daily';
  const loadout = MOON_LOADOUTS.find(l => l.id === (daily ? 'classic' : profile.settings.loadout));
  const difficulty = MOON_DIFFICULTIES.find(d => d.id === (daily ? 'night' : profile.settings.difficulty));
  renderer.setLoadout(loadout.id);
  const best = daily ? (profile.daily.day === dayKey() ? profile.daily.score : 0) : profile.best[difficulty.id];
  screen.innerHTML = `<div class="intro"><div class="eyebrow">✳ NIGHT SHIFT / SECOND HELPING</div><h2>A LITTLE TOAST.<br>A LOT OF <em>EXISTENTIAL<br>DREAD.</em></h2><p>Skate through a very strange night shift.<br>Toast the uninvited. Collect their teeth.<br>Reality is optional. Rent is not.</p><div class="run-picker" aria-label="Universe"><button data-mode="free" aria-pressed="${!daily}">NEW UNIVERSE</button><button data-mode="daily" aria-pressed="${daily}">DAILY WEIRDNESS</button></div><button class="loadout-preview" data-action="configure"><span>${loadout.short} <b>·</b> ${difficulty.name.toUpperCase()}</span><span>${daily ? 'FIXED BUILD' : 'CHANGE ↗'}</span></button><button class="primary" data-action="start">CLOCK IN <span>↗</span></button><div class="intro-foot">${daily ? 'SAME UNIVERSE FOR EVERYONE. RESETS MIDNIGHT CHICAGO.' : 'THREE BUILDS. TWELVE PROMOTIONS. ZERO EXPLANATIONS.'}<br><br>${best ? `PERSONAL BEST ${best.toLocaleString()}` : 'YOUR FIRST SHIFT IS WAITING.'} <span>●</span> ${coarsePointer ? 'TOUCH CONTROLS READY' : 'KEYBOARD / MOUSE / GAMEPAD'}</div></div>`;
  setText('shift-label', daily ? 'DAILY WEIRDNESS / FIXED UNIVERSE' : 'EMPLOYEE ORIENTATION');
  setText('objective', daily ? 'CLASSIC TOASTER · NIGHT SHIFT · LOCAL PERSONAL BEST' : 'YOUR FIRST SHIFT STARTS WHEN YOU DO.');
}
function showTitle() {
  persistDiscovery(); document.body.classList.remove('in-run');
  mode = 'title'; world = null; paused = false; clearInput(); audio.suspend(); clearScreen();
  $('hud').hidden = true; $('abilities').hidden = true; $('law-banner').hidden = true; $('pause-button').disabled = true;
  $('mission').hidden = true; $('law-chip').hidden = true; $('touch-controls').hidden = true;
  renderTitle(); setText('moon-says', '“We are like a family here. A family that owes me teeth.”');
}
function start(same = false) {
  document.body.classList.add('in-run'); window.scrollTo(0, 0);
  if (!same || !lastRun) {
    const daily = runMode === 'daily', day = daily ? dayKey() : '';
    lastRun = { seed: daily ? moonDailySeed(day) : fixedSeed ?? randomSeed(), loadout: daily ? 'classic' : profile.settings.loadout, difficulty: daily ? 'night' : profile.settings.difficulty, mode: runMode, day };
  }
  world = createMoonWorld(lastRun.seed, lastRun); runToken = `${lastRun.seed}:${randomSeed()}`;
  mode = 'playing'; paused = false; lastPhase = ''; notificationUntil = 0; storedDiscoveryCount = -1;
  clearInput(); renderer.reset(); audio.reset(); audio.unlock(); clock.reset(); clearScreen();
  $('hud').hidden = false; $('abilities').hidden = false; $('pause-button').disabled = false; $('touch-controls').hidden = !coarsePointer;
  $('law-banner').hidden = true; setText('pause-button', 'Ⅱ'); $('pause-button').setAttribute('aria-label', 'Pause game');
  canvas.focus({ preventScroll: true }); updateHUD();
  announce('Shift one. Toast enemies, collect green teeth, and bring eight teeth to the moon.');
}
function panel(html, label) {
  clearInput(); screen.className = 'screen centered'; screen.setAttribute('role', 'dialog'); screen.setAttribute('aria-modal', 'true'); screen.setAttribute('aria-label', label);
  screen.innerHTML = `<div class="panel">${html}</div>`; focusFirst();
}
function pause(force) {
  if (!world || mode !== 'playing' || world.phase !== 'playing') return;
  const next = force ?? !paused;
  if (next === paused) return;
  paused = next; clearInput(); clock.reset();
  if (paused) {
    audio.suspend(); persistDiscovery();
    panel('<div class="eyebrow">A GOVERNMENT-APPROVED BREATHER</div><h2>EXISTENCE IS PAUSED.</h2><p>The moon can wait. For once.</p><button class="primary" data-action="resume">BACK TO THE NONSENSE <span>↗</span></button><div class="pause-links"><button class="secondary" data-action="handbook">Read the employee handbook</button><button class="secondary" data-action="title">Leave this shift</button></div>', 'Game paused');
  } else { clearScreen(); audio.unlock(); canvas.focus({ preventScroll: true }); }
  setText('pause-button', paused ? '▶' : 'Ⅱ'); $('pause-button').setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
}
function selectUpgrade(id) {
  if (!world || !chooseMoonUpgrade(world, id)) return;
  persistDiscovery(); clearInput(); renderer.reset(); clock.reset(); lastPhase = ''; clearScreen(); canvas.focus({ preventScroll: true }); audio.unlock();
  if (world.boss) {
    setText('moon-says', '“THE SUN FROM HR would like a quick chat about your attitude.”');
    showNotice('THE SUN FROM HR', 'Dodge pink bullets. Leave red circles. Toast the Sun.', world.tick + 210); audio.consume([{ type: 'boss' }]);
  } else {
    setText('moon-says', MOON_QUOTES[world.shift - 1]);
    if (world.shift === 2) showNotice('PLEASE USE THE WRONG DOOR', 'Colored doors are linked. The chairs have ambitions now.', world.tick + 170);
    if (world.shift === 3) showNotice('YOUR PAST IS CALLING', 'Phones mark red danger circles. Move before they ring.', world.tick + 170);
  }
  updateHUD();
}
function overtime() {
  if (!world || !continueMoonOvertime(world)) return;
  for (const e of world.events) if (e.type === 'badge') queueBadge(e.id);
  persistDiscovery(); clearInput(); renderer.reset(); clock.reset(); lastPhase = ''; clearScreen();
  $('pause-button').disabled = false; audio.unlock(); canvas.focus({ preventScroll: true });
  showNotice(`OVERTIME ${world.cycle}`, 'Keep your promotions. Tougher guests. Bigger bills. Two hearts restored.', world.tick + 210);
  setText('moon-says', '“You volunteered for this. Our lawyers are delighted.”'); updateHUD();
}
function showNotice(name, description, until) {
  setText('law-name', name); setText('law-description', description); $('law-banner').hidden = false; notificationUntil = until; announce(`${name}. ${description}`);
}
function recordResult() {
  persistDiscovery();
  setProfile(storage.record({ token: `${runToken}:${world.cycle}`, score: world.score, cycle: world.cycle, difficulty: world.difficulty, loadout: world.loadout, mode: world.runMode, day: lastRun.day, won: world.phase === 'won' }));
  for (const id of profile.badges) queueBadge(id);
}
function updateHUD() {
  if (!world) return;
  const p = world.player, round = world.cycle ? `OVERTIME ${world.cycle} / ` : '';
  setText('shift-label', world.boss ? `${round}FINAL NOTICE / THE SUN FROM HR` : `${round}NIGHT SHIFT / 0${world.shift}`);
  setText('objective', world.boss ? 'TOAST THE SUN. LIBERATE YOUR LANDLORD.' : `RENT DUE IN ${Math.ceil((MOON.shiftTicks - world.shiftTick) / 60)}s · ${p.bag} TEETH IN POCKET`);
  const hearts = p.maxHp > 8 ? `${p.hp}<span class="health-total"> / ${p.maxHp} ♥</span>` : '♥'.repeat(p.hp) + `<span class="empty">${'♡'.repeat(p.maxHp - p.hp)}</span>`;
  if ($('hearts').innerHTML !== hearts) $('hearts').innerHTML = hearts;
  $('hearts').setAttribute('aria-label', `${p.hp} of ${p.maxHp} hearts`);
  const count = world.boss ? `${Math.max(0, Math.ceil(world.boss.hp))} <span>/ ${world.boss.maxHp}</span>` : `${world.rent} <span>/ ${world.quota}</span>`;
  if ($('rent-count').innerHTML !== count) $('rent-count').innerHTML = count;
  setText('rent-label', world.boss ? 'THE SUN’S PATIENCE' : 'TEETH FOR THE MOON');
  $('rent-fill').style.width = `${world.boss ? Math.max(0, world.boss.hp) / world.boss.maxHp * 100 : world.rent / world.quota * 100}%`;
  setText('score', String(world.score).padStart(6, '0'));
  setText('combo', world.combo > 1 ? `${world.combo} IN A ROW · KEEP CRUNCHING` : 'NO PRESSURE. JUST RENT.');
  setText('dash-state', p.dashCooldown === 0 ? (p.refund || world.law === 'refund' ? 'DASH TO REFLECT' : 'PANIC POLITELY') : `RECHARGING ${(p.dashCooldown / 60).toFixed(1)}s`);
  setText('burp-state', p.burp >= 100 ? 'BURP READY!' : `COSMIC BURP ${p.burp}%`);
  $('burp-state').classList.toggle('ready', p.burp >= 100); $('burp-fill').style.width = `${p.burp}%`;
  setText('bag-state', `${p.bag} TEETH IN POCKET`);
  $('touch-burp').classList.toggle('ready', p.burp >= 100); $('touch-burp').setAttribute('aria-label', `Cosmic burp ${p.burp}% charged`);
  setText('touch-burp-label', p.burp >= 100 ? 'BURP!' : `${p.burp}%`);
  if (world.tick > notificationUntil) $('law-banner').hidden = true;
  const activeLaw = MOON_LAWS.find(l => l.id === world.law);
  $('law-chip').hidden = !activeLaw; if (activeLaw) setText('law-chip', `${activeLaw.name} · ${Math.ceil(world.lawTicks / 60)}s`);
  $('mission').hidden = world.shift !== 1 || world.cycle > 0 || world.phase !== 'playing';
  if (!$('mission').hidden) setText('mission', !world.kills ? '01 / HOLD SPACE OR CLICK TO TOAST' : !p.bag && !world.rent ? '02 / SCOOP UP THE GREEN TEETH' : '03 / BRING TEETH TO THE MOON’S RING');
  if (world.phase !== lastPhase) {
    lastPhase = world.phase;
    if (world.phase === 'upgrade') {
      persistDiscovery(); $('law-banner').hidden = true;
      panel(`<div class="eyebrow">RENT PAID / SHIFT 0${world.shift} COMPLETE</div><h2>YOU’VE EARNED A PROBLEM.</h2><p>Choose your promotion. One heart restored. No salary increase.</p><div class="cards">${world.offers.map((id, i) => {
        const u = MOON_UPGRADES.find(item => item.id === id) || lunch;
        return `<button class="upgrade" data-upgrade="${id}"><span class="key-hint">[${i + 1}]</span><span class="symbol">${u.symbol}</span><span class="tag">${u.tag}</span><strong>${u.name}</strong><p>${u.description}</p><span class="choose">ACCEPT POSITION ↗</span></button>`;
      }).join('')}</div><div class="build-strip">YOUR QUESTIONABLE QUALIFICATIONS: ${world.upgrades.length ? world.upgrades.map(id => MOON_UPGRADES.find(u => u.id === id).name).join(' · ') : 'NONE WHATSOEVER'}</div>`, 'Choose a promotion');
      announce('Rent paid. Choose a promotion.');
    }
    if (world.phase === 'won' || world.phase === 'lost') {
      recordResult(); const won = world.phase === 'won'; $('law-banner').hidden = true; $('mission').hidden = true;
      const rank = won ? (!world.stats.hits ? 'S / FACTORY CONDITION' : world.player.hp >= 3 ? 'A / PREMIUM APPLIANCE' : 'B / SURVIVED THE WARRANTY') : world.shift >= 3 ? 'C / PROMISING CRUMBS' : 'D / STILL UNDER WARRANTY';
      const reason = world.cycle ? `OVERTIME ${world.cycle} · ${world.stats.suns} SUNS TOASTED` : 'ONE VERY STRANGE NIGHT';
      panel(`<div class="eyebrow">${won ? 'HUMAN RESOURCES HAS BEEN TOASTED' : 'YOUR EMPLOYMENT HAS BEEN DIGESTED'}</div><h2>${won ? 'THE MOON IS FREE.<br>YOU ARE STILL A TOASTER.' : 'YOU WERE<br>DELICIOUS.'}</h2><p>${won ? 'You abolished the Sun. The moon has unionized.<br>Clock out a hero, or volunteer for worse conditions.' : 'The moon has eaten your security deposit.<br>Dash through danger. Keep moving. There is another shift.'}</p><div class="result-rank">${rank}</div><div class="result-stats"><div><strong>${world.score.toLocaleString()}</strong><span>FINAL VALUE</span></div><div><strong>${world.totalFed}</strong><span>TEETH DONATED</span></div><div><strong>${world.kills}</strong><span>PROBLEMS TOASTED</span></div></div><div class="result-actions">${won && world.runMode !== 'daily' ? '<button class="primary" data-action="overtime">VOLUNTEER FOR OVERTIME <span>∞</span></button>' : '<button class="primary" data-action="new">ANOTHER SHIFT? <span>↗</span></button>'}<button class="outline-button" data-action="title">${won ? 'CLOCK OUT' : 'CHANGE YOUR BAD IDEA'}</button></div><button class="secondary" data-action="retry">Replay this exact universe</button><div class="micro">${reason} · UNIVERSE ${world.seed}</div><div class="result-build">${world.upgrades.map(id => MOON_UPGRADES.find(u => u.id === id).name).join(' / ')}</div>`, 'Run result');
      $('pause-button').disabled = true; announce(won ? 'Victory. The Sun from HR is toast. You can clock out or enter overtime.' : 'Run over. Try another shift.');
    }
  }
}
function gamepadInput() {
  let gamepad;
  try { gamepad = Array.from(navigator.getGamepads?.() || []).find(p => p?.connected); }
  catch { return null; } // Sandboxed previews may disable the Gamepad API.
  if (!gamepad) { gamepadDash = false; gamepadBurp = false; gamepadPause = false; return null; }
  const deadzone = n => Math.abs(n || 0) > 0.18 ? n : 0;
  const down = i => Boolean(gamepad.buttons[i]?.pressed);
  const x = deadzone(gamepad.axes[0]), y = deadzone(gamepad.axes[1]), aimX = deadzone(gamepad.axes[2]), aimY = deadzone(gamepad.axes[3]);
  const nextDash = down(0), nextBurp = down(1), nextPause = down(9);
  if (nextDash && !gamepadDash) dash = true;
  if (nextBurp && !gamepadBurp) burp = true;
  if (nextPause && !gamepadPause) pause();
  gamepadDash = nextDash; gamepadBurp = nextBurp; gamepadPause = nextPause;
  return { x, y, aimX, aimY, fire: down(7) || down(2) || Math.hypot(aimX, aimY) > 0.3 };
}
let currentGamepad = null;
const clock = createClock(() => {
  let target = mouse;
  const assisted = held.has('Space') || autoAim || (currentGamepad?.fire && !currentGamepad.aimX && !currentGamepad.aimY);
  if (assisted) {
    const candidates = [...world.enemies.filter(e => e.spawn === 0), ...(world.boss ? [world.boss] : [])];
    candidates.sort((a, b) => Math.hypot(a.x - world.player.x, a.y - world.player.y) - Math.hypot(b.x - world.player.x, b.y - world.player.y));
    target = candidates[0] || { x: world.player.x + Math.cos(world.player.aim) * 100, y: world.player.y + Math.sin(world.player.aim) * 100 };
  } else if (currentGamepad && (currentGamepad.aimX || currentGamepad.aimY)) target = { x: world.player.x + currentGamepad.aimX * 200, y: world.player.y + currentGamepad.aimY * 200 };
  const x = Number(held.has('KeyD') || held.has('ArrowRight')) - Number(held.has('KeyA') || held.has('ArrowLeft')) + stick.x + (currentGamepad?.x || 0);
  const y = Number(held.has('KeyS') || held.has('ArrowDown')) - Number(held.has('KeyW') || held.has('ArrowUp')) + stick.y + (currentGamepad?.y || 0);
  const events = stepMoon(world, { x, y, aimX: target.x, aimY: target.y, fire: firing || assisted || currentGamepad?.fire, dash, burp });
  dash = false; burp = false; renderer.consume(events); audio.consume(events); audio.update(world);
  for (const e of events) {
    if (e.type === 'badge') queueBadge(e.id);
    if (e.type === 'law') {
      if (e.law === 'late') { showNotice('YOUR RENT IS LATE', 'One heart deducted. Same moon. Same bill. 50 more seconds.', world.tick + 180); setText('moon-says', '“Late fees are paid in structural integrity.”'); }
      else { const law = MOON_LAWS.find(item => item.id === e.law); showNotice(law.name, law.description, world.tick + 160); setText('moon-says', `“${law.name}. Please update your employee handbook.”`); }
    }
    if (e.type === 'feed' && world.rent === 1) setText('moon-says', MOON_QUOTES[(world.shift + world.cycle + Math.floor(world.totalFed / 7)) % MOON_QUOTES.length]);
  }
  if (world.tick % 6 === 0 || world.phase !== 'playing') updateHUD();
  return world.phase === 'playing';
});
function renderConfiguration() {
  const daily = runMode === 'daily';
  $('configuration-content').innerHTML = `<div class="eyebrow">YOUR PERSONAL APPLIANCE CRISIS</div><h2>CHOOSE YOUR BAD IDEA.</h2><p>${daily ? 'Daily weirdness uses a fixed Classic toaster and Night shift difficulty. Everyone gets the same universe. Your free-play preferences are kept.' : 'Every build is available from the start. Your choice changes the way you skate, shoot, and survive.'}</p><div class="loadout-cards">${MOON_LOADOUTS.map(l => `<button class="loadout-card" data-loadout="${l.id}" aria-pressed="${l.id === (daily ? 'classic' : profile.settings.loadout)}" ${daily ? 'disabled' : ''}><span class="symbol" style="color:${l.color}">${l.symbol}</span><strong>${l.name}</strong><span>${l.perk}</span><small>${l.tagline}</small></button>`).join('')}</div><div class="eyebrow difficulty-label">SELECT YOUR LEVEL OF UNWELL</div><div class="difficulty-options">${MOON_DIFFICULTIES.map(d => `<button data-difficulty="${d.id}" aria-pressed="${d.id === (daily ? 'night' : profile.settings.difficulty)}" ${daily ? 'disabled' : ''}><strong>${d.name}</strong><small>${d.description}</small></button>`).join('')}</div>`;
}
function openConfiguration() { renderConfiguration(); $('configuration-dialog').showModal(); }
function openCabinet() {
  pause(true); persistDiscovery();
  $('cabinet-content').innerHTML = `<div class="eyebrow">THE DEPARTMENT OF QUESTIONABLE ACHIEVEMENT</div><h2>YOUR EMPLOYEE FILE.</h2><p>${profile.suns} suns toasted · ${profile.badges.length}/${MOON_ACHIEVEMENTS.length} badges · ${profile.discovered.filter(id => id.startsWith('upgrade:')).length}/${MOON_UPGRADES.length} promotions discovered</p><div class="record-grid">${MOON_DIFFICULTIES.map(d => `<div><strong>${profile.best[d.id].toLocaleString()}</strong><span>${d.name}</span></div>`).join('')}<div><strong>${profile.best.overtime.toLocaleString()}</strong><span>Overtime</span></div></div><div class="cabinet-badges">${MOON_ACHIEVEMENTS.map(a => `<div class="badge-card ${profile.badges.includes(a.id) ? 'earned' : ''}"><span>${a.symbol}</span><div><strong>${a.name}</strong><p>${a.description}</p><small>${profile.badges.includes(a.id) ? 'FILED. PROBABLY LEGALLY.' : 'NOT YET FILED'}</small></div></div>`).join('')}</div><h3>YOUR COLLEAGUES FROM THE VOID</h3><div class="bestiary">${MOON_ENEMY_GUIDE.map(e => `<div><strong>${profile.discovered.includes(`enemy:${e.id}`) ? e.name : `UNIDENTIFIED / SHIFT ${e.shift}`}</strong><p>${profile.discovered.includes(`enemy:${e.id}`) ? e.description : 'Encounter this colleague to read their personnel file.'}</p></div>`).join('')}</div><div class="help-note">These are personal records on this device, not an online leaderboard. A live run is not saved. ${storage.status === 'ready' ? '' : 'Permanent records are unavailable here; this session still works.'}</div>`;
  $('cabinet-dialog').showModal();
}
function updateSettings() {
  audio.setMuted(muted); renderer.setReduced(reduced);
  setText('sound-button', `SOUND: ${muted ? 'OFF' : 'ON'}`); $('sound-button').setAttribute('aria-pressed', String(muted));
  setText('motion-button', `MOTION: ${reduced ? 'LOW' : 'ON'}`); $('motion-button').setAttribute('aria-pressed', String(reduced));
  setText('auto-button', `AUTO: ${autoAim ? 'ON' : 'OFF'}`); $('auto-button').setAttribute('aria-pressed', String(autoAim));
  setText('touch-auto-label', autoAim ? 'AUTO-TOAST IS ON' : 'AUTO-TOAST IS OFF');
}
function toggleAutoAim() { autoAim = !autoAim; setProfile(storage.settings({ autoAim })); updateSettings(); announce(`Automatic aiming and shooting ${autoAim ? 'on' : 'off'}.`); }
async function fullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.querySelector('.arcade').requestFullscreen(); }
  catch { announce('Fullscreen is unavailable in this browser. The game remains playable here.'); }
}
screen.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  if (button.dataset.upgrade) { selectUpgrade(button.dataset.upgrade); return; }
  if (button.dataset.mode) { runMode = button.dataset.mode; renderTitle(); screen.querySelector(`[data-mode="${runMode}"]`)?.focus({ preventScroll: true }); return; }
  const action = button.dataset.action;
  if (action === 'start' || action === 'new') start();
  if (action === 'retry') start(true);
  if (action === 'resume') pause(false);
  if (action === 'title') { showTitle(); focusFirst(); }
  if (action === 'overtime') overtime();
  if (action === 'configure') openConfiguration();
  if (action === 'handbook') $('help-dialog').showModal();
});
$('configuration-content').addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button || runMode === 'daily') return;
  if (button.dataset.loadout) setProfile(storage.settings({ loadout: button.dataset.loadout }));
  if (button.dataset.difficulty) setProfile(storage.settings({ difficulty: button.dataset.difficulty }));
  const selector = button.dataset.loadout ? `[data-loadout="${button.dataset.loadout}"]` : `[data-difficulty="${button.dataset.difficulty}"]`;
  renderConfiguration(); renderTitle(); $('configuration-content').querySelector(selector)?.focus();
});
window.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]')) return;
  if (e.code === 'Tab' && screen.getAttribute('aria-modal') === 'true') {
    const buttons = [...screen.querySelectorAll('button')], index = buttons.indexOf(document.activeElement);
    e.preventDefault(); buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus(); return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'KeyF' && !e.repeat) { e.preventDefault(); fullscreen(); return; }
  if (mode !== 'playing') return;
  if (['Escape', 'KeyP'].includes(e.code) && !e.repeat) { e.preventDefault(); pause(); return; }
  if (e.code === 'KeyR' && !e.repeat) { e.preventDefault(); toggleAutoAim(); return; }
  if (world.phase === 'upgrade' && ['Digit1', 'Digit2', 'Digit3'].includes(e.code) && !e.repeat) { e.preventDefault(); selectUpgrade(world.offers[Number(e.code.slice(-1)) - 1]); return; }
  if (paused || world.phase !== 'playing') return;
  const controls = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyE'];
  if (!controls.includes(e.code)) return;
  e.preventDefault(); held.add(e.code);
  if (!e.repeat && e.code.startsWith('Shift')) dash = true;
  if (!e.repeat && e.code === 'KeyE') burp = true;
});
window.addEventListener('keyup', e => held.delete(e.code));
canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') mouse = renderer.screenToWorld(e.clientX, e.clientY); });
canvas.addEventListener('pointerdown', e => { if (e.button !== 0 || e.pointerType === 'touch' || mode !== 'playing' || paused) return; mouse = renderer.screenToWorld(e.clientX, e.clientY); firing = true; canvas.focus({ preventScroll: true }); });
window.addEventListener('pointerup', () => { firing = false; });
window.addEventListener('pointercancel', clearInput);
window.addEventListener('blur', () => { clearInput(); pause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pause(true); audio.suspend(); persistDiscovery(); } });
$('pause-button').addEventListener('click', () => pause());
$('sound-button').addEventListener('click', () => { muted = !muted; setProfile(storage.settings({ muted })); updateSettings(); if (!muted && !paused && world?.phase === 'playing') audio.unlock(); });
$('motion-button').addEventListener('click', () => { reduced = !reduced; setProfile(storage.settings({ reduced })); updateSettings(); });
$('auto-button').addEventListener('click', toggleAutoAim);
$('fullscreen-button').addEventListener('click', fullscreen);
$('help-button').addEventListener('click', () => { pause(true); $('help-dialog').showModal(); });
$('cabinet-button').addEventListener('click', openCabinet);
$('touch-dash').addEventListener('pointerdown', e => { e.preventDefault(); if (!paused && world?.phase === 'playing') dash = true; });
$('touch-burp').addEventListener('pointerdown', e => { e.preventDefault(); if (!paused && world?.phase === 'playing') burp = true; });
const stickPad = $('stick-pad');
function moveStick(e) {
  if (stick.pointer !== e.pointerId) return;
  const rect = stickPad.getBoundingClientRect(), dx = e.clientX - rect.left - rect.width / 2, dy = e.clientY - rect.top - rect.height / 2, length = Math.hypot(dx, dy), radius = rect.width * 0.32;
  const magnitude = Math.min(1, length / radius);
  stick.x = length ? dx / length * magnitude : 0; stick.y = length ? dy / length * magnitude : 0;
  $('stick-knob').style.transform = `translate(${stick.x * radius}px,${stick.y * radius}px)`;
}
stickPad.addEventListener('pointerdown', e => { if (paused || world?.phase !== 'playing') return; e.preventDefault(); stick.pointer = e.pointerId; stickPad.setPointerCapture(e.pointerId); moveStick(e); });
stickPad.addEventListener('pointermove', moveStick);
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stickPad.addEventListener(type, e => { if (stick.pointer === e.pointerId) { stick.pointer = null; stick.x = 0; stick.y = 0; $('stick-knob').style.transform = 'translate(0,0)'; } });
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
  currentGamepad = mode === 'playing' && world?.phase === 'playing' && !document.querySelector('dialog[open]') ? gamepadInput() : null;
  clock.advance(dt, mode === 'playing' && !paused && world?.phase === 'playing' && !document.querySelector('dialog[open]'));
  renderer.draw(world, dt, mode === 'title', paused || (world && world.phase !== 'playing'));
  if (badgeTime > 0) badgeTime -= dt;
  else if (badgeQueue.length) {
    const badgeId = badgeQueue.shift();
    const achievement = MOON_ACHIEVEMENTS.find(a => a.id === badgeId);
    setText('award-name', achievement.name); setText('award-description', achievement.description); $('award-toast').hidden = false; badgeTime = 3.8;
  } else $('award-toast').hidden = true;
  requestAnimationFrame(frame);
}
Object.defineProperty(window, '__moon', { value: Object.freeze({ inspect: () => ({ mode, runMode, paused, muted, reduced, autoAim, storage: storage.status, profile: structuredClone(profile), world: world ? structuredClone(world) : null }) }), writable: false });
if (storage.fresh) setProfile(storage.settings({ reduced, autoAim }));
else setProfile(profile);
showTitle(); updateSettings(); requestAnimationFrame(frame);
