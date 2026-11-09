// Human-like tapping: tap the far goal of each route, let auto-walk carry you, count taps and interruptions.
import { load, shot } from './load.mjs'; import { makeBot } from './bot.mjs';
const seeds = (process.argv[2] || 'f1,f2,f3').split(',');
for (const seed of seeds) {
  const env = load(); const { BB, doc, win, errors } = env;
  BB.startRun({ cls: 'diver', seed });
  const tapTile = (x, y) => { const [sx, sy] = BB.tileToScreen(x, y); BB.tapAt(sx + BB.R.TS / 2, sy + BB.R.TS / 2); };
  const settle = () => { for (let i = 0; i < 25; i++) BB.draw(env.adv(16)); };
  const toasts = {}; const tEl = doc.getElementById('toast'); let lastToast = '';
  const bot = makeBot(BB); let taps = 0, walks = 0, walkSteps = 0, interrupts = 0, deadTaps = 0, acts = 0, offscreen = 0, snaps = 0;
  while (BB.UI.S && !BB.UI.S.over && acts < 4000) {
    settle(); const S = BB.UI.S; const a = bot(S); acts++; const pre = S.mobs.filter(m => m.hp > 0 && Math.max(Math.abs(m.x - S.p.x), Math.abs(m.y - S.p.y)) <= 1).map(m => m.type + '@' + m.x + ',' + m.y + ':' + m.state + ':fz' + m.frozen + ':st' + m.stun);
    if (a.t === 'move') {
      let goal = bot.route ? bot.route[bot.route.length - 1] : [S.p.x + a.dx, S.p.y + a.dy];
      // humans only tap what is on screen
      const [gx, gy] = BB.tileToScreen(goal[0], goal[1]);
      if (gy + BB.R.TS / 2 < BB.R.top + 2 || gy + BB.R.TS / 2 > BB.R.h - BB.R.bot - 2 || gx < 0 || gx > BB.R.w - BB.R.TS) if (bot.route) { offscreen++; const k = bot.route.findIndex(([x, y]) => { const [a1, b1] = BB.tileToScreen(x, y); return b1 + BB.R.TS / 2 < BB.R.top + 2 || b1 + BB.R.TS / 2 > BB.R.h - BB.R.bot - 2 || a1 < 0 || a1 > BB.R.w - BB.R.TS; }); goal = bot.route[Math.max(0, k - 1)]; }
      const T0 = S.turns, F0 = S.floor; settle(); const [qx, qy] = BB.tileToScreen(goal[0], goal[1]); const back = BB.screenToTile(qx + BB.R.TS / 2, qy + BB.R.TS / 2); tapTile(goal[0], goal[1]); const wg = BB.UI.walkGoal; taps++;
      if (BB.UI.walk !== null || BB.UI.walkGoal) { walks++; let n = 0; while (BB.UI.walk && n < 80) { const now = env.adv(130); BB.stepWalk(now); BB.draw(now); n++; } }
      const moved = BB.UI.S && (BB.UI.S.turns !== T0 || BB.UI.S.floor !== F0);
      if (!moved) { deadTaps++; if (process.env.DBG) { const S2 = BB.UI.S, i = goal[1] * 32 + goal[0]; console.log('DEAD', JSON.stringify({ p: [S2.p.x, S2.p.y], goal, tile: S2.tiles[i], seen: S2.seen[i], vis: S2.vis[i], mob: (S2.mobs.find(m => m.x === goal[0] && m.y === goal[1] && m.hp > 0) || {}).type, routeLen: bot.route && bot.route.length, walk: !!BB.UI.walk, target: !!BB.UI.target, sheet: doc.getElementById('sheet').classList.contains('on'), toast: tEl.style.display === 'block' ? tEl.textContent : '' , frozen: S2.p.frozen, back, wg, qy, fp: (BB.findPath(S2, goal[0], goal[1], false) || []).length, pre, hereMob: S2.mobs.filter(m => m.hp > 0 && Math.max(Math.abs(m.x - S2.p.x), Math.abs(m.y - S2.p.y)) <= 1).map(m => m.type + ':' + m.state + ':' + S2.vis[m.y * 32 + m.x]).join(',') })); } BB.doAct(a); }
      else if (BB.UI.S && BB.UI.S.floor === F0 && (BB.UI.S.p.x !== goal[0] || BB.UI.S.p.y !== goal[1]) && bot.route && bot.route.length > 1) interrupts++;
      if (BB.UI.S) walkSteps += BB.UI.S.turns - T0;
    } else if (a.t === 'use' && a.mode === 'throw') { BB.UI.target = { it: S.p.pack[a.i] }; settle(); tapTile(a.x, a.y); taps += 2; }
    else { BB.doAct(a); taps += a.t === 'wait' ? 1 : 3; }
    if (tEl.style.display === 'block' && tEl.textContent !== lastToast) { lastToast = tEl.textContent; const k = lastToast.replace(/\d+/g, 'N').slice(0, 48); toasts[k] = (toasts[k] || 0) + 1; }
  }
  const S = BB.UI.S;
  console.log(`seed ${seed}: over=${S && S.over} floor=${S && S.floor} decisions=${acts} taps=${taps} walks=${walks} avgWalkLen=${(walkSteps / Math.max(1, walks)).toFixed(1)} interrupts=${interrupts} deadTaps=${deadTaps} offscreenGoals=${offscreen} errors=${errors.length}`);
  console.log('  toasts', JSON.stringify(toasts));
}
