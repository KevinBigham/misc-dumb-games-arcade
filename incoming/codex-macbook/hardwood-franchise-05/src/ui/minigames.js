// ===== ui/minigames.js — training camp drills and the Three-Point Shootout =====
const MiniGames = {};
document.addEventListener('keydown', e => {
  if (App.mg && App.mg.key) { const used = App.mg.key(e); if (used) e.preventDefault(); return; }
  if ((e.code === 'Space' || e.key === ' ') && App.route === 'game' && App.game && !App.modal && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); Act.gvPlay(); }
});
function mgOpen(title, intro, onStart, onSim) {
  modal(title, `<div class="mg" id="mg">${intro}<div class="row">${btn('Start Drill', 'mgStart', 'gold lg')}${onSim ? btn('Sim it', 'mgSim', 'ghost') : ''}</div></div>`, '', { size: 'md', sticky: true });
  App.mgStart = onStart; App.mgSim = onSim;
}
Act.mgStart = () => { const f = App.mgStart; App.mgStart = null; f(); };
Act.mgSim = () => { const f = App.mgSim; App.mgSim = null; App.mg = null; closeModal(); f(); };
function mgFinish(title, grade, lines, cb, detail) {
  App.mg = null;
  $('#mg').innerHTML = `<div class="c"><div class="eyebrow">${title}</div><div style="font:800 64px/1 var(--f-num);color:var(--gold);margin:8px 0">${U.grade(grade)}</div><p>${lines}</p>${btn('Continue', 'mgDone', 'gold lg')}</div>`;
  App.mgDone = () => { closeModal(); cb(grade, detail); };
}
Act.mgDone = () => { const f = App.mgDone; App.mgDone = null; if (f) f(); };
function countdown(el, n, done) { if (n <= 0) { done(); return; } el.textContent = n; setTimeout(() => countdown(el, n - 1, done), 550); }

// ---- Shooting: stop the sweeping meter in the green ----
MiniGames.shoot = (p, cb, opts = {}) => {
  const contest = !!opts.contest;
  const intro = `<p class="c" style="max-width:52ch">${contest ? `Three-Point Shootout: 25 balls in five racks, 60 seconds. The last ball in each rack is the money ball — worth 2.` : `Ten shots from around the arc and the elbows.`} Press <b>Space</b>, click, or tap <b>Shoot</b> when the marker is in the <span class="good">green</span>. ${E(pshort(p))}'s shooting widens the window.</p>`;
  mgOpen(contest ? 'Three-Point Shootout' : 'Shooting Clinic', intro, () => run(), contest ? null : () => cb(campSimGrade(App.S, p)));
  function run() {
    const W = 560, H = 300;
    $('#mg').innerHTML = `<div class="hud"><span>Score <span id="mgS" class="gold">0</span></span><span>Ball <span id="mgB">1</span>/${contest ? 25 : 10}</span>${contest ? '<span>Time <span id="mgT">60</span></span>' : ''}</div><canvas id="mgC" width="${W}" height="${H}" style="width:${W}px;max-width:100%"></canvas><button class="btn gold lg" id="mgShoot" data-a="mgShoot"><span>Shoot</span></button><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    const cv = $('#mgC'), c = cv.getContext('2d');
    const total = contest ? 25 : 10;
    let i = 0, score = 0, made = 0, t = 0, marker = 0, dirn = 1, speed = 0.95, state = 'cd', ballAnim = null, timeLeft = 60, last = 0;
    const racks = [[]];
    const rating = k => p.r[k];
    const spotType = n => contest ? 'tpt' : (n % 2 ? 'mid' : 'tpt');
    const zoneW = n => U.clamp(0.07 + (rating(spotType(n)) - 40) * 0.0026, 0.07, 0.22);
    const draw = () => {
      c.fillStyle = '#101827'; c.fillRect(0, 0, W, H);
      // floor and hoop
      c.fillStyle = '#7a5230'; c.fillRect(0, H - 50, W, 50);
      c.fillStyle = '#e8eef8'; c.fillRect(W - 70, 70, 8, 70);
      c.strokeStyle = '#ff7a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(W - 70, 120); c.lineTo(W - 120, 120); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(W - 118 + k * 11, 121); c.lineTo(W - 112 + k * 9, 142); c.stroke(); }
      // shooter
      c.fillStyle = App.S.teams[App.S.user].c1; c.beginPath(); c.arc(90, H - 80, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.font = '700 16px "Chakra Petch", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.num || '', 90, H - 80);
      // meter
      const mx = 40, my = 26, mw = W - 80, mh = 22, zw = zoneW(i);
      c.fillStyle = '#263552'; c.fillRect(mx, my, mw, mh);
      c.fillStyle = 'rgba(255,204,77,.55)'; c.fillRect(mx + mw * (0.5 - zw), my, mw * zw * 2, mh);
      c.fillStyle = '#3ddc84'; c.fillRect(mx + mw * (0.5 - zw / 2), my, mw * zw, mh);
      c.fillStyle = '#fff'; c.fillRect(mx + mw * marker - 2, my - 6, 4, mh + 12);
      if (contest) { const rk = Math.floor(i / 5), b = i % 5; c.fillStyle = '#8e9cb6'; c.font = '600 13px Barlow, sans-serif'; c.textAlign = 'left'; c.fillText(`Rack ${Math.min(5, rk + 1)}${b === 4 ? ' · MONEY BALL' : ''}`, 40, 70); }
      if (ballAnim) { const a = ballAnim, tt = Math.min(1, a.t); const x = 110 + (W - 135 - 110) * tt, y = H - 95 - Math.sin(Math.PI * tt) * 120 + (a.make ? 0 : tt > 0.9 ? (tt - 0.9) * 200 : 0) + tt * (120 - (H - 95)) * 1; c.fillStyle = a.money ? '#ff4d8d' : '#ff7a1a'; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fill(); }
      if (state === 'msg') { c.fillStyle = msg.ok ? '#3ddc84' : '#ff5d5d'; c.font = '800 34px "Saira Condensed", sans-serif'; c.textAlign = 'center'; c.fillText(msg.text, W / 2, H / 2); }
    };
    let msg = { text: '', ok: true };
    const shoot = () => {
      if (state !== 'aim') return;
      const zw = zoneW(i), d = Math.abs(marker - 0.5);
      let make = d <= zw / 2 ? true : d <= zw ? Math.random() < 0.45 : Math.random() < 0.04;
      const money = contest && i % 5 === 4;
      const pts = make ? (money ? 2 : 1) : 0;
      score += pts; made += make ? 1 : 0;
      if (contest) { racks[racks.length - 1].push(make ? 1 : 0); if (racks[racks.length - 1].length === 5 && racks.length < 5) racks.push([]); }
      ballAnim = { t: 0, make, money };
      state = 'flight';
      msg = { text: make ? (money ? 'MONEY!' : 'SWISH!') : (d <= zw ? 'Rims out' : 'Brick'), ok: make };
    };
    App.mg = { key: e => { if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') { shoot(); return true; } return false; } };
    App.mgShootFn = shoot;
    cv.addEventListener('pointerdown', shoot);
    const step = now => {
      if (!document.body.contains(cv)) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (contest && (state === 'aim' || state === 'flight' || state === 'msg')) { timeLeft -= dt; const te = $('#mgT'); if (te) te.textContent = Math.max(0, Math.ceil(timeLeft)); if (timeLeft <= 0) { end(); return; } }
      if (state === 'aim') { marker += dirn * speed * dt; if (marker > 1) { marker = 1; dirn = -1; } if (marker < 0) { marker = 0; dirn = 1; } }
      if (state === 'flight') { ballAnim.t += dt * 1.9; if (ballAnim.t >= 1) { state = 'msg'; t = 0; } }
      if (state === 'msg') { t += dt; if (t > (contest ? 0.35 : 0.6)) { i++; ballAnim = null; $('#mgS').textContent = score; if (i >= total) { end(); return; } $('#mgB').textContent = i + 1; speed = Math.min(2.2, speed + (contest ? 0.03 : 0.06)); marker = Math.random() < 0.5 ? 0 : 1; dirn = marker ? -1 : 1; state = 'aim'; } }
      draw();
      requestAnimationFrame(step);
    };
    const end = () => {
      state = 'done';
      while (contest && racks.length < 5) racks.push([]);
      const grade = contest ? U.clamp(score / 30 * 100, 0, 100) : made * 10;
      mgFinish(contest ? 'Shootout' : 'Shooting Clinic', grade, contest ? `${E(pname(p))} scored <b>${score}</b> points.` : `${E(pname(p))} made <b>${made}/10</b>.`, cb, { racks, tot: score, made });
    };
    draw();
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; state = 'aim'; requestAnimationFrame(step); });
  }
};
Act.mgShoot = () => { if (App.mgShootFn) App.mgShootFn(); };

// ---- Ball-handling: repeat the combo before the clock runs out ----
MiniGames.handle = (p, cb) => {
  const intro = `<p class="c" style="max-width:52ch">Eight combos. Repeat each one with the <b>arrow keys</b> (or the pad) before time runs out. Combos get longer. ${E(pshort(p))}'s handles buy extra time.</p>`;
  mgOpen('Ball-Handling Gauntlet', intro, () => run(), () => cb(campSimGrade(App.S, p)));
  function run() {
    const A = ['←', '↑', '→', '↓'], K = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
    $('#mg').innerHTML = `<div class="hud"><span>Round <span id="hR">1</span>/8</span><span>Cleared <span id="hC" class="good">0</span></span><span>Time <span id="hT">0.0</span></span></div><div class="seq" id="hSeq"></div><div class="bar" style="width:min(420px,100%)"><i id="hBar" style="width:100%"></i></div>
      <div class="arrows"><span></span><button data-a="hIn" data-k="1" aria-label="Up">↑</button><span></span><button data-a="hIn" data-k="0" aria-label="Left">←</button><button data-a="hIn" data-k="3" aria-label="Down">↓</button><button data-a="hIn" data-k="2" aria-label="Right">→</button></div><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    let round = 0, cleared = 0, seq = [], pos = 0, limit = 0, left = 0, state = 'cd', last = 0, speedBonus = 0;
    const bonus = (p.r.bhd - 50) / 100;
    const newRound = () => {
      const len = Math.min(8, 3 + Math.floor(round / 1.5));
      seq = Array.from({ length: len }, () => U.ri(0, 3)); pos = 0;
      limit = Math.max(1.6, 4.2 - round * 0.28 + bonus * 1.6); left = limit;
      $('#hR').textContent = round + 1;
      $('#hSeq').innerHTML = seq.map(x => `<span>${A[x]}</span>`).join('');
      state = 'play';
    };
    const input = k => {
      if (state !== 'play') return;
      const spans = $$('#hSeq span');
      if (k === seq[pos]) { spans[pos].classList.add('done'); pos++; if (pos >= seq.length) { cleared++; speedBonus += left / limit; $('#hC').textContent = cleared; next(); } }
      else { spans[pos].classList.add('bad'); next(); }
    };
    const next = () => { state = 'gap'; round++; setTimeout(() => { if (round >= 8) end(); else newRound(); }, 350); };
    App.mg = { key: e => { if (K[e.key] != null) { input(K[e.key]); return true; } return false; } };
    App.hInput = input;
    const tick = now => {
      if (!$('#hSeq')) return;
      const dt = last ? (now - last) / 1000 : 0; last = now;
      if (state === 'play') { left -= dt; $('#hT').textContent = Math.max(0, left).toFixed(1); $('#hBar').style.width = Math.max(0, left / limit * 100) + '%'; if (left <= 0) next(); }
      if (state !== 'done') requestAnimationFrame(tick);
    };
    const end = () => { state = 'done'; const grade = U.clamp(cleared / 8 * 85 + speedBonus / 8 * 20, 0, 100); mgFinish('Ball-Handling Gauntlet', grade, `${E(pname(p))} cleared <b>${cleared}/8</b> combos.`, cb, { cleared }); };
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; newRound(); requestAnimationFrame(tick); });
  }
};
Act.hIn = el => { if (App.hInput) App.hInput(+el.dataset.k); };

// ---- Defensive slides: stay in front of the ball-handler ----
MiniGames.defense = (p, cb) => {
  const intro = `<p class="c" style="max-width:52ch">Twenty seconds of on-ball defense. Slide with <b>← →</b> (or hold the buttons, or drag on the court) to stay in front of the dribbler. ${E(pshort(p))}'s foot speed sets how quick you slide.</p>`;
  mgOpen('Defensive Slides', intro, () => run(), () => cb(campSimGrade(App.S, p)));
  function run() {
    const W = 560, H = 220;
    $('#mg').innerHTML = `<div class="hud"><span>In front <span id="dP" class="good">0%</span></span><span>Time <span id="dT">20.0</span></span></div><canvas id="mgC" width="${W}" height="${H}" style="width:${W}px;max-width:100%"></canvas><div class="row">${btn('◀ Slide', 'dHold', 'lg', { k: -1 })}${btn('Slide ▶', 'dHold', 'lg', { k: 1 })}</div><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    const cv = $('#mgC'), c = cv.getContext('2d');
    let ox = W / 2, tx = W / 2, dx = W / 2, vx = 0, left = 20, inFront = 0, frames = 0, state = 'cd', last = 0, retarget = 0, hold = 0, dragX = null;
    const dSpeed = 260 + (p.r.spd - 50) * 3 + (p.r.pdf - 50) * 2;
    const keys = {};
    App.mg = { key: e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = e.type !== 'keyup'; return true; } return false; } };
    const up = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keys[e.key] = false; };
    document.addEventListener('keyup', up);
    const toX = ev => { const r = cv.getBoundingClientRect(); return (ev.clientX - r.left) / r.width * W; };
    cv.addEventListener('pointerdown', ev => { dragX = toX(ev); cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', ev => { if (dragX != null) dragX = toX(ev); });
    cv.addEventListener('pointerup', () => { dragX = null; });
    App.dHold = k => { hold = k; };
    const draw = (ok) => {
      c.fillStyle = '#c48a4f'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(W / 2, H + 120, 230, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, H - 24, W, 24);
      // offense
      c.fillStyle = '#5d6b85'; c.beginPath(); c.arc(ox, 70, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(ox + Math.sin(performance.now() / 90) * 12, 98, 8, 0, Math.PI * 2); c.fill();
      // defender
      const t = App.S.teams[App.S.user];
      c.fillStyle = t.c1; c.beginPath(); c.arc(dx, 150, 24, 0, Math.PI * 2); c.fill(); c.strokeStyle = ok ? '#3ddc84' : '#ff5d5d'; c.lineWidth = 4; c.stroke();
      c.fillStyle = textOn(t.c1); c.font = '700 15px "Chakra Petch", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.num || '', dx, 150);
      c.fillStyle = ok ? '#3ddc84' : '#ff5d5d'; c.font = '800 20px "Saira Condensed", sans-serif'; c.fillText(ok ? 'IN FRONT' : 'BLOWN BY', W / 2, 20);
    };
    const tick = now => {
      if (!document.body.contains(cv)) { document.removeEventListener('keyup', up); return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (state === 'play') {
        left -= dt; retarget -= dt;
        if (retarget <= 0) { tx = U.rf(60, W - 60); retarget = U.rf(0.35, 0.85) - (20 - left) * 0.008; }
        const os = 300 + (20 - left) * 9;
        ox += U.clamp(tx - ox, -os * dt, os * dt);
        let dir = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0) + hold;
        if (dragX != null) dir = U.clamp((dragX - dx) / 30, -1, 1);
        vx = dir * dSpeed; dx = U.clamp(dx + vx * dt, 24, W - 24);
        const ok = Math.abs(dx - ox) < 30;
        frames++; if (ok) inFront++;
        $('#dT').textContent = Math.max(0, left).toFixed(1); $('#dP').textContent = Math.round(inFront / frames * 100) + '%';
        draw(ok);
        if (left <= 0) { state = 'done'; document.removeEventListener('keyup', up); const pct = inFront / Math.max(1, frames); mgFinish('Defensive Slides', U.clamp((pct - 0.25) / 0.6 * 100, 0, 100), `${E(pname(p))} stayed in front <b>${Math.round(pct * 100)}%</b> of the time.`, cb, { pct }); return; }
      } else draw(true);
      requestAnimationFrame(tick);
    };
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; state = 'play'; requestAnimationFrame(tick); });
    requestAnimationFrame(tick);
  }
};
Act.dHold = el => { if (App.dHold) { App.dHold(+el.dataset.k); setTimeout(() => App.dHold && App.dHold(0), 180); } };
document.addEventListener('keyup', e => { if (App.mg && App.mg.key && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) App.mg.key({ key: e.key, type: 'keyup' }); });
