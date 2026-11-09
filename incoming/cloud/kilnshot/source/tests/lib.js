// Loads the pure game core (CONFIG, physics, levels, generator) into Node for bots.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
function load() {
  const ctx = { Math, console, Object, Array, JSON, Number, String, Date };
  vm.createContext(ctx);
  for (const f of ['core.js', 'levels.js', 'daily.js']) {
    const p = path.join(SRC, f); if (!fs.existsSync(p)) continue;
    vm.runInContext(fs.readFileSync(p, 'utf8') + '\n;', ctx, { filename: f });
  }
  vm.runInContext('this.__k={CONFIG,makeWorld,launch,step,shotOver,endShot,runShot,replay,preview,boardKey,cloneWorld,secondsLeft,secondsTotal,embersFor,isWon,starsFor,clampLaunch,pullToLaunch,makeRng,hashStr,LEVELS:typeof LEVELS!=="undefined"?LEVELS:[],genDaily:typeof genDaily!=="undefined"?genDaily:null,dailySolve:typeof dailySolve!=="undefined"?dailySolve:null,validateLevel:typeof validateLevel!=="undefined"?validateLevel:null,buildDaily:typeof buildDaily!=="undefined"?buildDaily:null}', ctx);
  return ctx.__k;
}
// launch grid (integer velocities, same quantization as the game)
function grid(step, K) {
  const out = []; const M = K.CONFIG.MAXV;
  for (let vx = -M; vx <= M; vx += step) for (let vy = -M; vy <= 400; vy += step) {
    const s = vx * vx + vy * vy; if (s > M * M || s < 120 * 120) continue; out.push([vx, vy]);
  }
  return out;
}
module.exports = { load, grid };
