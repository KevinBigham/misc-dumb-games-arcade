import { HONK } from '../contracts.js';
import { HONK_DESKS } from '../sim/honk.js';

const C = { ink: '#28332b', floor: '#dce4cd', white: '#fffdf1', orange: '#e86539', sage: '#91a980', dark: '#52634f', pink: '#ce6f82' };
export function createHonkRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let effects = [], scale = 1, ox = 0, oy = 0, shake = 0;
  const systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let reduced = systemReduced, tieColor = C.orange;
  function rect(x, y, w, h, fill, stroke = C.ink, width = 2, radius = 0) {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = width;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill(); if (width) ctx.stroke();
  }
  function ellipse(x, y, rx, ry, fill, stroke = C.ink, width = 2) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
    if (width) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }
  function line(points, color = C.ink, width = 2) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  }
  function text(value, x, y, size = 12, color = C.ink, font = 'Arial', weight = 'bold', align = 'center') {
    ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function plant(x, y) {
    ellipse(x, y + 13, 20, 8, '#6b805329', '', 0);
    rect(x - 11, y, 22, 19, '#c1ac80', '#677753', 1.6, 4);
    for (let i = 0; i < 5; i++) {
      ctx.save(); ctx.translate(x, y); ctx.rotate((i - 2) * .55);
      ellipse(0, -15, 7, 20, i % 2 ? '#80996a' : '#a4ba83', '#5a704e', 1.4); ctx.restore();
    }
  }
  function scene(s) {
    ctx.fillStyle = C.floor; ctx.fillRect(0, 0, HONK.width, HONK.height);
    ctx.strokeStyle = '#c5d1b5'; ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 60) line([[x, 43], [x, 640]], '#c9d3bc', 1);
    for (let y = 40; y < 640; y += 60) line([[0, y], [1200, y]], '#c9d3bc', 1);
    rect(0, 0, 1200, 35, '#8c9c7d', '', 0);
    rect(0, 34, 1200, 11, '#b7c6a3', '#718461', 1);
    rect(0, 44, 18, 596, '#9cae87', '', 0); rect(1182, 44, 18, 596, '#9cae87', '', 0);
    // Broad central runner, with worn edges and floor typography.
    rect(424, 53, 352, 562, '#c6d6b5', '', 0);
    line([[425, 55], [425, 615]], '#bacba7', 2); line([[775, 55], [775, 615]], '#bacba7', 2);
    ctx.save(); ctx.globalAlpha = .25;
    text('DISRUPTION', 600, 302, 37, '#627a50', 'Arial', '900'); text('DEPARTMENT', 600, 335, 34, '#627a50', 'Arial', '900');
    text('PLEASE DO NOT FEED THE EMPLOYEES', 600, 600, 9, '#5f754d', 'monospace'); ctx.restore();
    for (const x of [105, 1095]) {
      rect(x - 31, 6, 62, 19, '#c9ed83', '#4e6544', 1); text('EXIT →', x, 19, 10, '#425438', 'monospace');
    }
    for (const d of HONK_DESKS) {
      rect(d.x + 8, d.y + 14, d.w, d.h + 7, '#59754b25', '', 0, 3);
      rect(d.x, d.y + 9, d.w, d.h, '#a9a17f', '#667055', 2, 4);
      rect(d.x, d.y, d.w, d.h, '#e4d7ab', '#667055', 2, 4);
      rect(d.x - 10, d.y - 25, d.w + 20, 13, '#9caf90', '#62785b', 1.5, 2);
      line([[d.x - 10, d.y - 13], [d.x - 10, d.y + 60]], '#62785b', 3);
      rect(d.x + 52, d.y + 18, 50, 16, '#eee9d1', '#7f8065', 1, 2);
      for (let j = 0; j < 4; j++) line([[d.x + 57, d.y + 22 + j * 3], [d.x + 96, d.y + 22 + j * 3]], '#a2a58c', .7);
      rect(d.x + 119, d.y + 12, 17, 24, C.white, '#9eaa8d', 1);
      for (let j = 0; j < 3; j++) line([[d.x + 122, d.y + 18 + j * 5], [d.x + 132, d.y + 18 + j * 5]], '#a2ad94', 1);
      rect(d.x + 9, d.y + 16, 16, 15, '#f0d46e', '', 0); text('HELP', d.x + 17, d.y + 26, 4, '#8a7b42');
      ellipse(d.x + 75, d.y + 88, 23, 11, '#768b6433', '', 0);
      line([[d.x + 75, d.y + 66], [d.x + 75, d.y + 87]], '#5b6f51', 4);
      line([[d.x + 58, d.y + 91], [d.x + 75, d.y + 84], [d.x + 92, d.y + 91]], '#5b6f51', 3);
      rect(d.x + 51, d.y + 54, 48, 27, '#849677', '#52674d', 2, 10);
      text(d.x < 500 ? (d.y < 300 ? 'GARY · Q3 SYNERGY' : 'OPEN POSITION (FOREVER)') : (d.y < 300 ? 'LINDA · REPLY ALL' : 'KEITH · VIBES'), d.x + 75, d.y - 16, 6, '#495f40', 'monospace');
    }
    for (const [x, y] of [[70, 113], [1130, 112], [70, 570], [1130, 570]]) plant(x, y);
    // Corporate motivational wall art.
    rect(400, 7, 120, 24, '#f2eddb', '#627654', 2); text('HANG IN THERE.', 460, 22, 8, '#6b795e', 'monospace');
    rect(680, 7, 120, 24, '#f2eddb', '#627654', 2); text('PROFIT > GEESE', 740, 22, 8, '#6b795e', 'monospace');
    for (const o of s.props) prop(o);
  }
  function prop(o) {
    ctx.save(); ctx.translate(o.x, o.y);
    if (o.broken) {
      ctx.globalAlpha = .7;
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(Math.sin(i * 9) * 22, Math.cos(i * 6) * 15); ctx.rotate(i); rect(-6, -3, 12, 7, i % 2 ? '#eff0df' : '#698064', '#849278', 1); ctx.restore(); }
      ctx.restore(); return;
    }
    if (o.hit) ctx.translate(Math.sin(o.hit * 3) * 3, 0);
    if (o.kind === 'monitor') {
      line([[0, -6], [0, 10]], '#53694e', 5); rect(-17, 7, 34, 5, '#6d805e', '#53694e', 1);
      rect(-28, -32, 56, 37, '#53694e', '#394b34', 2, 3); rect(-23, -27, 46, 25, '#9cb3a4', '', 0, 1);
      line([[-18, -22], [-5, -22]], '#cce0cb', 2); line([[-18, -16], [16, -16]], '#bad2b9', 2); line([[-18, -10], [6, -10]], '#bad2b9', 2);
    } else if (o.kind === 'printer') {
      ellipse(0, 29, 34, 9, '#687c4c30', '', 0); rect(-30, -15, 60, 44, '#c4c9b6', '#64745b', 2, 4); rect(-24, -31, 48, 24, '#eff0df', '#64745b', 2, 2);
      rect(-23, 10, 46, 12, '#66775d', '', 0); rect(-18, 15, 36, 21, '#fffced', '#89957c', 1); line([[-12, 22], [10, 22]], '#aaa', 1);
      rect(9, -8, 13, 6, '#b5dd7f', '', 0); text('PAPER JAM', 0, 48, 7, '#667655', 'monospace');
    } else if (o.kind === 'cooler') {
      ellipse(0, 29, 20, 8, '#687c4c30', '', 0); rect(-16, -9, 32, 37, '#edf1df', '#667858', 2, 3); rect(-13, -38, 26, 33, '#b2cfca', '#718e81', 2, 7);
      line([[-8, -29], [-8, -16]], '#dfece0', 3); ellipse(-6, 3, 3, 3, '#cf745d', '', 0); ellipse(6, 3, 3, 3, '#759db4', '', 0); rect(-10, 11, 20, 9, '#b3c3a6', '', 0);
    } else if (o.kind === 'coffee') {
      rect(-32, -11, 64, 27, '#c2b18b', '#738263', 1.5, 3); rect(-13, -38, 26, 33, '#475e4d', '#33483b', 1.5, 3); rect(-8, -25, 16, 14, '#b49870', '#d6c7a4', 1);
      text('EMOTIONAL SUPPORT', 0, 32, 7, '#6d7e5d', 'monospace');
    } else {
      ellipse(0, 6, 26, 13, '#f3efd9', '#829570', 1.5); rect(-19, -13, 38, 20, '#e4b59b', '#9e816c', 1.5, 5); ellipse(0, -13, 19, 7, '#f9ead1', '#b59f7c', 1);
      text('MANDATORY FUN', 0, 32, 7, '#6d7e5d', 'monospace');
    }
    ctx.restore();
  }
  function chair(c, tick) {
    const rolling = Math.hypot(c.vx, c.vy) > 30;
    ellipse(c.x, c.y + 12, 22, 7, '#48603b30', '', 0);
    ctx.save(); ctx.translate(c.x, c.y); if (rolling && !reduced) ctx.rotate(c.spin);
    line([[-20, 14], [0, 7], [20, 14]], '#465a44', 3); line([[0, 7], [0, 23]], '#465a44', 3);
    for (const [x, y] of [[-20, 14], [20, 14], [0, 23]]) ellipse(x, y, 3, 3, '#465a44', '', 0);
    rect(-19, -12, 38, 29, '#dc9164', '#6e5b42', 2, 7); rect(-20, -23, 40, 15, '#efb075', '#6e5b42', 2, 5);
    line([[-25, -1], [-25, 9]], '#6e5b42', 3); line([[25, -1], [25, 9]], '#6e5b42', 3);
    text('↗', 0, 8, 17, '#fff3d5'); ctx.restore();
    if (!rolling && tick < 400) text('HONK TO BOWL', c.x, c.y + 39, 8, '#815e39', 'monospace');
    if (rolling && !reduced) {
      const len = Math.hypot(c.vx, c.vy) || 1;
      line([[c.x - c.vx / len * 26, c.y - c.vy / len * 26], [c.x - c.vx / len * 54, c.y - c.vy / len * 54]], '#e58b4c80', 4);
    }
  }
  function stamp(mark) {
    const active = mark.delay === 0;
    ctx.save(); ctx.setLineDash(active ? [] : [8, 5]);
    ellipse(mark.x, mark.y, mark.radius, mark.radius * .78, active ? '#c74d6966' : '#dc8f9e25', active ? '#a92f50' : '#b85974', active ? 4 : 2);
    ctx.setLineDash([]);
    if (!active) {
      ctx.beginPath(); ctx.arc(mark.x, mark.y, mark.radius + 4, -Math.PI / 2, -Math.PI / 2 + (1 - mark.delay / mark.totalDelay) * Math.PI * 2);
      ctx.strokeStyle = '#be526a'; ctx.lineWidth = 4; ctx.stroke();
    }
    text(active ? 'ACTION ITEMS' : 'MEETING IN', mark.x, mark.y - 4, 10, '#903e52', 'monospace');
    text(active ? 'ESCAPE NOW' : `${(mark.delay / 60).toFixed(1)}s`, mark.x, mark.y + 12, active ? 9 : 15, '#903e52', 'monospace');
    ctx.restore();
  }
  function goose(x, y, face = 1, size = 1, t = 0, honking = false, hurt = false, moving = false) {
    ctx.save(); ctx.translate(x, y);
    ellipse(0, 18 * size, 26 * size, 9 * size, '#38532f26', '', 0);
    ctx.scale(face * size, size);
    if (hurt && Math.floor(t / 5) % 2) ctx.globalAlpha = .45;
    const walk = moving && !reduced ? Math.sin(t * .4) * 5 : 0;
    line([[-7, 12], [-10 + walk, 24], [-3 + walk, 24]], C.orange, 4);
    line([[5, 13], [10 - walk, 22], [18 - walk, 22]], C.orange, 4);
    // One continuous goose silhouette with a tall, deeply unqualified neck.
    ctx.beginPath(); ctx.moveTo(-27, -1); ctx.quadraticCurveTo(-40, -16, -25, -13); ctx.quadraticCurveTo(-8, -27, 8, -14);
    ctx.lineTo(15, -40); ctx.bezierCurveTo(15, -54, 38, -56, 39, -41); ctx.quadraticCurveTo(41, -31, 29, -28);
    ctx.lineTo(24, -5); ctx.bezierCurveTo(25, 20, -17, 24, -27, -1); ctx.closePath(); ctx.fillStyle = hurt ? '#fff3e0' : C.white; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-23, -6); ctx.quadraticCurveTo(-3, -12, 11, 0); ctx.quadraticCurveTo(-6, 16, -23, -6); ctx.strokeStyle = '#a5ae99'; ctx.lineWidth = 1.5; ctx.stroke();
    line([[-16, 1], [-8, 5], [0, 4]], '#bcc4ae', 1);
    ctx.beginPath(); ctx.moveTo(38, -43); ctx.lineTo(55 + (honking ? 4 : 0), -36 - (honking ? 5 : 0)); ctx.lineTo(36, -32); ctx.closePath(); ctx.fillStyle = C.orange; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    if (honking) line([[39, -37], [53, -37]], C.ink, 2);
    ellipse(31, -43, 2.4, 2.8, C.ink, '', 0); line([[26, -49], [34, -47]], C.ink, 1.5);
    // Tie and employee pass.
    ctx.beginPath(); ctx.moveTo(16, -28); ctx.lineTo(28, -24); ctx.lineTo(23, -19); ctx.lineTo(25, -5); ctx.lineTo(16, 0); ctx.lineTo(15, -6); ctx.lineTo(21, -20); ctx.closePath(); ctx.fillStyle = tieColor; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    line([[14, -25], [5, -7]], '#7a8670', .8); rect(1, -9, 10, 12, '#faf4d4', '#7a8670', .7, 1); rect(3, -7, 6, 4, '#afc2a0', '', 0); line([[3, -1], [8, -1]], '#9eaa8e', .6);
    ctx.restore();
  }
  function worker(e, t) {
    if (e.kind === 'security' && e.windup > 0) {
      ctx.save(); ctx.setLineDash([8, 6]);
      line([[e.x, e.y], [e.x + e.chargeX * 225, e.y + e.chargeY * 225]], '#d6a23b', 18);
      ctx.setLineDash([]); text('AGGRESSIVE NETWORKING', e.x, e.y - 64, 9, '#8d6d23', 'monospace'); ctx.restore();
    }
    ctx.save(); ctx.translate(e.x, e.y); const boss = e.kind === 'boss', size = boss ? 1.8 : 1;
    if (e.age < 35) ctx.globalAlpha = .4 + e.age / 60;
    ellipse(0, 17, 20 * size, 7 * size, '#45643a28', '', 0); ctx.scale(size, size);
    const bob = reduced || e.stun ? 0 : Math.sin(t * .14 + e.id) * 2;
    ctx.translate(0, bob); const suit = e.hit ? '#fff3db' : boss ? e.bossPhase === 3 ? '#b34c56' : '#bb6680' : e.kind === 'security' ? '#586f83' : e.kind === 'email' ? '#8e9eb4' : '#7f9274';
    line([[-7, 9], [-8 - bob, 22]], '#465a47', 6); line([[7, 9], [8 + bob, 22]], '#465a47', 6);
    rect(-15, -19, 30, 33, suit, '#465a47', 2, 7);
    line([[-16, -12], [-22, 5]], suit, 7); line([[16, -12], [22, 5]], suit, 7);
    ellipse(0, -28, 12, 13, '#ead1ad', '#506149', 1.5);
    ctx.beginPath(); ctx.arc(-1, -32, 12, Math.PI, Math.PI * 2); ctx.fillStyle = boss ? '#e4dfca' : '#796d51'; ctx.fill();
    rect(-11, -33, 9, 6, '#455648', '#455648', 1, 1); rect(2, -33, 9, 6, '#455648', '#455648', 1, 1); line([[-2, -30], [2, -30]], '#455648', 1);
    line([[-4, -20], [4, -20]], '#7d7159', 1);
    if (boss) { text('HR', 0, 1, 13, '#fff2e4'); rect(15, -1, 17, 18, '#634c4f', '#453e3d', 1, 2); }
    else if (e.kind === 'security') { rect(-14, -44, 28, 9, '#d8b45f', '#546753', 1, 3); text('SEC', 0, 3, 9, '#fae5a0'); }
    else { line([[0, -15], [3, -4], [0, 2], [-3, -4], [0, -15]], '#e6be75', 2); }
    if (e.kind === 'email') { rect(-26, -1, 22, 15, '#fcf0dc', '#6e7c62', 1, 1); line([[-26, -1], [-15, 7], [-4, -1]], '#6e7c62', 1); }
    ctx.restore();
    if (e.warning) {
      ctx.save(); ctx.globalAlpha = .35 + e.warning / 70;
      ellipse(e.x, e.y, boss ? 48 : 28, boss ? 48 : 28, '#cb5f7410', '#c46076', 2); ctx.restore();
      text('!', e.x, e.y - (boss ? 95 : 60), 24, '#b85569');
    } else if (e.age > 30 && e.age < 165) {
      ctx.font = '9px monospace'; const w = ctx.measureText(e.line).width + 16;
      rect(e.x - w / 2, e.y - (boss ? 111 : 69), w, 20, '#fffdf0e8', '#9caa8a', 1, 3);
      text(e.line, e.x, e.y - (boss ? 97 : 55), 9, '#5d6c52', 'monospace', 'normal');
    }
  }
  function consume(events) {
    for (const e of events) {
      if (['honk', 'reply', 'impact', 'fired', 'broken', 'score', 'lunch', 'objective', 'hurt', 'dash', 'chair-hit', 'chair-launch', 'stamp', 'security-crash'].includes(e.type)) effects.push({ ...e, age: 0, life: e.type === 'score' || e.type === 'objective' ? 1.2 : e.type === 'lunch' ? 1.3 : e.type === 'reply' ? .85 : .45 });
      if (e.type === 'hurt') shake = 8; if (e.type === 'reply') shake = 12;
    }
    effects = effects.slice(-180);
  }
  function render(s, dt, title, wallTime) {
    const bounds = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * dpr), height = Math.round(bounds.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#b9c9a4'; ctx.fillRect(0, 0, bounds.width, bounds.height);
    scale = Math.min(bounds.width / HONK.width, bounds.height / HONK.height); ox = (bounds.width - HONK.width * scale) / 2; oy = (bounds.height - HONK.height * scale) / 2;
    // Letterbox retains the entire arena, including all touch-device escape routes.
    ctx.save(); ctx.translate(ox + (!reduced ? Math.sin(wallTime * 75) * shake : 0), oy); ctx.scale(scale, scale);
    scene(s);
    for (const mark of s.stamps) stamp(mark);
    for (const c of s.chairs) chair(c, s.tick);
    for (const n of s.snacks) {
      ctx.save(); ctx.translate(n.x, n.y + (reduced ? 0 : Math.sin(s.tick / 12 + n.id) * 3));
      if (n.kind === 'pizza') ctx.scale(1.5, 1.5);
      ellipse(0, 9, 14, 5, '#78914b25', '', 0);
      ctx.beginPath(); ctx.moveTo(-13, 3); ctx.lineTo(10, -10); ctx.lineTo(13, 7); ctx.closePath(); ctx.fillStyle = '#edc27d'; ctx.fill(); ctx.strokeStyle = '#827456'; ctx.lineWidth = 2; ctx.stroke();
      line([[-9, 3], [10, 6]], '#6a9b4d', 3); line([[-8, 0], [9, 3]], '#d78b6f', 2);
      if (n.kind === 'pizza') { ellipse(5, -3, 2, 2, '#698342', '', 0); ellipse(8, 2, 1.5, 1.5, '#698342', '', 0); }
      ctx.restore();
    }
    for (const b of s.papers) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
      rect(-10, -7, 20, 14, '#f6d7d4', '#bf5f73', 1.7, 1); line([[-10, -7], [0, 1], [10, -7]], '#bf5f73', 1); ctx.restore();
    }
    const characters = s.enemies.map(e => ({ y: e.y, e })); characters.push({ y: s.player.y, p: true });
    characters.sort((a, b) => a.y - b.y);
    if (!title) {
      for (const item of characters) if (item.p) goose(s.player.x, s.player.y, s.player.face, 1, s.tick, s.player.honking > 0, s.player.invulnerable > 0, s.player.moving || s.player.dashTicks > 0); else worker(item.e, s.tick);
    } else {
      ctx.save(); ctx.globalAlpha = .5;
      worker({ id: 1, x: 980, y: 330, kind: 'worker', age: 120, line: 'Is that a goose?' }, wallTime * 60);
      worker({ id: 2, x: 750, y: 510, kind: 'email', age: 200, line: 'Great culture fit.' }, wallTime * 60); ctx.restore();
      goose(790, 355 + (reduced ? 0 : Math.sin(wallTime * 2) * 3), 1, 3.5, wallTime * 60, Math.sin(wallTime * 2) > .92, false, false);
      // A stolen briefcase, because the goose has places to be.
      ctx.save(); ctx.translate(914, 377); ctx.rotate(-.13); rect(-35, -19, 70, 47, '#c69b65', '#655d40', 2.5, 5); line([[-12, -19], [-12, -32], [12, -32], [12, -19]], '#655d40', 4); line([[-35, 0], [35, 0]], '#897044', 2); rect(-4, -5, 8, 12, '#e1c792', '#655d40', 1); ctx.restore();
    }
    for (const fx of effects) {
      fx.age += dt; const progress = fx.age / fx.life; if (progress > 1) continue;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress);
      if (fx.type === 'honk' || fx.type === 'reply') {
        const radius = fx.type === 'reply' ? 30 + progress * 1450 : 25 + progress * fx.radius;
        ellipse(fx.x, fx.y - 12, radius, radius * .7, fx.type === 'reply' ? '#e865391a' : '#fffbea1a', fx.type === 'reply' ? C.orange : '#f8f9db', fx.type === 'reply' ? 12 : 5);
        if (fx.type === 'honk' && progress < .6) text('HONK!', fx.x + s.player.face * 40, fx.y - 52 - progress * 30, 19, C.orange, 'Arial', '900');
        if (fx.type === 'reply') { text('REPLY. ALL.', 600, 270, 70, C.orange, 'Arial', '900'); text('PLEASE REMOVE ME FROM THIS COMPANY', 600, 300, 16, C.ink, 'monospace'); }
      } else if (['score', 'lunch', 'objective'].includes(fx.type)) {
        text(fx.amount ? `+${fx.amount}` : '+ LUNCH', fx.x, fx.y - 30 - progress * 35, 18, fx.type === 'lunch' ? '#537d37' : '#b64d27', 'monospace');
        text(fx.label || '', fx.x, fx.y - 14 - progress * 35, 9, C.ink, 'monospace');
      } else if (fx.type === 'stamp') {
        ctx.save(); ctx.translate(fx.x, fx.y - 20 * (1 - progress)); ctx.rotate(-.15);
        rect(-61, -19, 122, 38, '#f4dfd5', '#b44a60', 3, 2); text('MANDATORY', 0, 6, 17, '#b44a60', 'monospace'); ctx.restore();
      } else {
        for (let j = 0; j < (reduced ? 2 : fx.type === 'broken' ? 15 : 7); j++) {
          const angle = j * 2.4 + fx.tick, length = 12 + progress * (fx.type === 'broken' ? 85 : 38);
          ctx.save(); ctx.translate(fx.x + Math.cos(angle) * length, fx.y + Math.sin(angle) * length - 10); ctx.rotate(angle + progress * 4);
          rect(-3, -3, 6, 9, j % 2 ? C.white : C.orange, '', 0); ctx.restore();
        }
      }
      ctx.restore();
    }
    effects = effects.filter(e => e.age < e.life); shake *= .8;
    ctx.restore();
  }
  return { render, consume, reset() { effects = []; shake = 0; }, setPreferences(options = {}) { reduced = systemReduced || Boolean(options.reducedMotion); tieColor = options.tie || C.orange; } };
}
