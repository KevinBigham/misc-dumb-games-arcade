import { ACT_NAMES, ACT_TICKS, FORK_RECHARGE_TICKS, HISTORY_TICKS, MIN_HISTORY_TICKS, TICK_RATE } from './contracts.js';

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const number = (value) => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('en-US');
const duration = (ticks) => {
  const seconds = Math.max(0, Math.floor((ticks || 0) / TICK_RATE));
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};
const button = (action, text, className = 'button') => `<button class="${className}" type="button" data-action="${action}">${text}</button>`;
const controls = () => `<div class="controls" aria-label="Game controls"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><b>MOVE</b></span><span><i class="mouse-icon" aria-hidden="true"></i><b>AIM · HOLD TO FIRE</b></span><span><kbd>SPACE</kbd><b>FORK TIME</b></span><span><kbd>SHIFT</kbd><b>DASH</b></span></div>`;

export function createUI(root, callbacks = {}) {
  let screen = 'title';
  let lastWorld = null;
  let settings = { muted: false, reducedMotion: false };
  let bestScore = 0;
  let destroyed = false;
  root.classList.add('game-ui');
  root.innerHTML = `
    <div class="hud" hidden>
      <div class="hud-top">
        <div class="vital-block"><span class="micro-label">VITALITY <span class="health-value">100 / 100</span></span><div class="health-track"><i></i></div></div>
        <div class="act-block"><span class="micro-label act-label">I / THE WAKE</span><span class="time-value">00:00</span></div>
        <div class="score-block"><span class="micro-label">REQUIEM SCORE</span><span class="score-value">0</span><span class="combo-value"></span></div>
      </div>
      <div class="boss-hud" hidden><div class="boss-heading"><span>THE CHOIR</span><span class="boss-phase">PHASE I</span></div><div class="boss-track"><i></i></div></div>
      <div class="hud-bottom"><div class="fork-block"><div class="fork-heading"><span class="micro-label">TEMPORAL FORK</span><span class="fork-status">RECORDING</span></div><div class="fork-pips"><i></i><i></i></div><span class="fork-key">SPACE / E / RIGHT CLICK</span></div><div class="tactical-hint"><span class="hint-title">YOUR PAST IS LOADED.</span><span class="hint-copy">Move. Fire. Fork back — your echo keeps fighting.</span></div><div class="dash-block"><span class="micro-label">SHIFT / DASH</span><div class="dash-track"><i></i></div><button class="text-button pause-button" type="button" data-action="pause">ESC / PAUSE</button></div></div>
    </div>
    <div class="screen-layer"></div>
    <div class="preferences"><button type="button" class="preference-button" data-action="mute" aria-pressed="false"><span class="sound-symbol" aria-hidden="true">▂▅▃▆</span><span class="sound-label">SOUND ON</span></button><span class="preference-divider"></span><button type="button" class="preference-button" data-action="motion" aria-pressed="false"><span class="motion-label">FULL MOTION</span></button></div>
    <span class="screen-reader-status" role="status" aria-live="polite"></span>`;
  const find = (selector) => root.querySelector(selector);
  const hud = find('.hud');
  const layer = find('.screen-layer');
  const refs = Object.fromEntries(['health-value', 'health-track', 'act-label', 'time-value', 'score-value', 'combo-value', 'boss-hud', 'boss-phase', 'boss-track', 'fork-status', 'fork-pips', 'tactical-hint', 'hint-title', 'hint-copy', 'dash-track', 'sound-label', 'motion-label', 'screen-reader-status'].map((name) => [name, find(`.${name}`)]));
  const setText = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  const setWidth = (node, fraction) => { node.firstElementChild.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`; };

  function refreshSettings() {
    setText(refs['sound-label'], settings.muted ? 'SOUND OFF' : 'SOUND ON');
    setText(refs['motion-label'], settings.reducedMotion ? 'REDUCED MOTION' : 'FULL MOTION');
    find('[data-action="mute"]').setAttribute('aria-pressed', String(settings.muted));
    find('[data-action="motion"]').setAttribute('aria-pressed', String(settings.reducedMotion));
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  }

  function showScreen(name, payload = {}) {
    if (destroyed) return;
    screen = name;
    if (payload.world) lastWorld = payload.world;
    if (payload.bestScore !== undefined) bestScore = payload.bestScore;
    if (payload.muted !== undefined) settings.muted = payload.muted;
    if (payload.reducedMotion !== undefined) settings.reducedMotion = payload.reducedMotion;
    root.dataset.screen = name;
    hud.hidden = !['playing', 'paused', 'upgrade'].includes(name);
    layer.hidden = name === 'playing';
    const world = lastWorld;
    if (name === 'title') {
      layer.innerHTML = `<section class="title-screen"><div class="title-identity"><span class="eyebrow"><i></i> CHRONAL COMBAT // SOLO PROTOCOL</span><h1>ECHO<br><em>REQUIEM</em><span class="title-period">.</span></h1><p class="title-hook">Jump back.<br>Leave yourself fighting.</p><div class="title-action">${button('play', 'ENTER THE REQUIEM <span aria-hidden="true">↗</span>', 'button primary-button')}<span class="run-note">THREE ACTS. ONE LAST CHOIR.</span></div></div><div class="title-coordinate" aria-hidden="true"><span>ORBITAL CATHEDRAL</span><i></i><span>AT THE END OF THE SUN</span></div><div class="title-footer">${controls()}<div class="title-record">${bestScore > 0 ? `PERSONAL BEST <strong>${number(bestScore)}</strong>` : '<span>DEATH IS FINAL.<br>MEMORY IS NOT.</span>'}</div></div></section>`;
      setText(refs['screen-reader-status'], 'Echo Requiem. Ready to play.');
    } else if (name === 'paused') {
      layer.innerHTML = `<section class="modal-screen paused-screen"><div class="modal-content"><span class="eyebrow">THE CATHEDRAL CAN WAIT</span><h2>Hold the<br><em>moment.</em></h2><p class="modal-copy">Your echo will be here when you return.</p>${button('pause', 'RESUME THE REQUIEM <span aria-hidden="true">↗</span>', 'button primary-button')}${button('restart', 'RESTART THIS SEED', 'text-button secondary-action')}${controls()}</div></section>`;
      setText(refs['screen-reader-status'], 'Paused.');
    } else if (name === 'upgrade') {
      const upcoming = Math.min(4, (world?.act || 1) + 1);
      layer.innerHTML = `<section class="modal-screen upgrade-screen"><div class="upgrade-content"><span class="eyebrow">A MOMENT BETWEEN ACTS</span><h2>Choose what<br><em>remains.</em></h2><p class="modal-copy">Carry one new power into the ${upcoming === 2 ? 'fracture' : 'procession'}.</p><div class="upgrade-grid">${(world?.upgradeOffers || []).map((offer, index) => `<button type="button" class="upgrade-card" data-action="upgrade" data-upgrade="${escapeHTML(offer.id)}"><span class="upgrade-index">0${index + 1}<span>PRESS ${index + 1}</span></span><span class="upgrade-glyph" aria-hidden="true">${['◈', '✣', '⌁'][index]}</span><strong>${escapeHTML(offer.name)}</strong><span class="upgrade-description">${escapeHTML(offer.description)}</span><span class="upgrade-flavor">${escapeHTML(offer.flavor)}</span><span class="upgrade-select">ACCEPT THIS MEMORY <i aria-hidden="true">↗</i></span></button>`).join('')}</div><span class="upgrade-footnote">VITALITY RESTORED +25 &nbsp; / &nbsp; FORK CHARGES REFILLED</span></div></section>`;
      setText(refs['screen-reader-status'], 'Act complete. Choose one of three upgrades.');
    } else if (name === 'won' || name === 'lost') {
      const won = name === 'won';
      layer.innerHTML = `<section class="modal-screen result-screen ${won ? 'victory' : 'defeat'}"><div class="result-content"><span class="eyebrow">${won ? 'THE LAST NOTE IS YOURS' : 'THE CATHEDRAL REMEMBERS'}</span><h2>${won ? 'Silence,<br><em>at last.</em>' : 'An echo<br><em>remains.</em>'}</h2><p class="result-caption">${won ? 'You have broken the Choir. The sun can rest.' : 'The requiem ends here. Your next one begins now.'}</p><div class="result-score"><span class="micro-label">REQUIEM SCORE</span><strong>${number(world?.score)}</strong>${(world?.score || 0) >= bestScore && (world?.score || 0) > 0 ? '<span class="record-badge">PERSONAL BEST</span>' : ''}</div><dl class="result-stats"><div><dt>TIME SURVIVED</dt><dd>${duration(world?.tick)}</dd></div><div><dt>ELIMINATIONS</dt><dd>${number(world?.stats?.kills)}</dd></div><div><dt>ECHO KILLS</dt><dd>${number(world?.stats?.echoKills)}</dd></div></dl><div class="result-actions">${button('restart', 'RETRY THIS REQUIEM <span aria-hidden="true">↗</span>', 'button primary-button')}${button('new', 'NEW SEED', 'button outline-button')}</div><span class="seed-note">SEED ${escapeHTML(world?.seed ?? '—')} <span>·</span> ${won ? 'ALL FOUR MOVEMENTS COMPLETE' : 'SAME SEED. ANOTHER CHANCE.'}</span></div></section>`;
      setText(refs['screen-reader-status'], `${won ? 'Victory' : 'Run ended'}. Score ${number(world?.score)}.`);
    } else {
      layer.innerHTML = '';
    }
    refreshSettings();
    if (world) update(world, settings);
    if (name !== 'playing') {
      queueMicrotask(() => { if (!destroyed && screen === name) layer.querySelector('button')?.focus({ preventScroll: true }); });
    }
  }

  function update(world, nextSettings) {
    if (destroyed || !world) return;
    lastWorld = world;
    if (nextSettings?.bestScore !== undefined) bestScore = nextSettings.bestScore;
    if (nextSettings && (nextSettings.muted !== settings.muted || nextSettings.reducedMotion !== settings.reducedMotion)) {
      settings = { muted: Boolean(nextSettings.muted), reducedMotion: Boolean(nextSettings.reducedMotion) };
      refreshSettings();
    }
    const player = world.player;
    if (!player) return;
    setText(refs['health-value'], `${Math.ceil(Math.max(0, player.hp))} / ${player.maxHp}`);
    setWidth(refs['health-track'], player.hp / player.maxHp);
    refs['health-track'].classList.toggle('critical', player.hp / player.maxHp <= 0.25);
    setText(refs['act-label'], `${['I', 'II', 'III', 'IV'][world.act - 1]} / ${ACT_NAMES[world.act - 1]}`);
    setText(refs['time-value'], world.act < 4 ? duration(Math.max(0, ACT_TICKS - world.actTick)) : duration(world.tick));
    setText(refs['score-value'], number(world.score));
    setText(refs['combo-value'], world.multiplier > 1 ? `×${world.multiplier} CHAIN` : '');
    refs['boss-hud'].hidden = !world.boss;
    if (world.boss) {
      setWidth(refs['boss-track'], world.boss.hp / world.boss.maxHp);
      setText(refs['boss-phase'], `PHASE ${['I', 'II', 'III'][world.boss.phase - 1] || 'I'}`);
    }
    const history = player.history?.length || 0;
    setText(refs['fork-status'], history < MIN_HISTORY_TICKS ? 'RECORDING' : player.forkCharges > 0 ? `${(Math.min(HISTORY_TICKS, history) / TICK_RATE).toFixed(1)}s READY` : 'RECHARGING');
    for (let index = 0; index < 2; index += 1) {
      const pip = refs['fork-pips'].children[index];
      const charged = index < player.forkCharges;
      pip.classList.toggle('charged', charged);
      const progress = charged ? 1 : index === player.forkCharges ? 1 - player.forkRechargeTicks / FORK_RECHARGE_TICKS : 0;
      pip.style.setProperty('--charge', `${Math.max(0, Math.min(1, progress)) * 100}%`);
    }
    refs['fork-pips'].setAttribute('aria-label', `${player.forkCharges} of 2 Fork charges`);
    setWidth(refs['dash-track'], 1 - player.dashCooldown / 90);
    refs['tactical-hint'].hidden = world.act > 1 || world.stats?.forks > 0 || world.actTick > 1200;
    setText(refs['hint-title'], history < MIN_HISTORY_TICKS ? 'MAKE A MEMORY.' : 'YOUR PAST IS LOADED.');
    setText(refs['hint-copy'], history < MIN_HISTORY_TICKS ? 'Move and hold the mouse to fire. Your path is being recorded.' : 'Press SPACE to jump back. Your echo keeps fighting.');
  }

  function click(event) {
    const target = event.target.closest('button[data-action]');
    if (!target || !root.contains(target)) return;
    const action = target.dataset.action;
    if (action === 'play') callbacks.play?.();
    if (action === 'pause') callbacks.togglePause?.();
    if (action === 'restart') callbacks.restartSame?.();
    if (action === 'new') callbacks.newRun?.();
    if (action === 'upgrade') callbacks.chooseUpgrade?.(target.dataset.upgrade);
    if (action === 'mute') callbacks.toggleMute?.();
    if (action === 'motion') callbacks.toggleReducedMotion?.();
  }
  root.addEventListener('click', click);
  showScreen('title');
  return { update, showScreen, destroy() { destroyed = true; root.removeEventListener('click', click); root.replaceChildren(); root.classList.remove('game-ui'); } };
}
