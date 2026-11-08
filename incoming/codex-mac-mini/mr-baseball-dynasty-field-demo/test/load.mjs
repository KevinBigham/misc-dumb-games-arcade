// loads the game.js monolith headless and returns the MBD test hooks
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
export function loadGame() {
  const src = fs.readFileSync(path.join(here, '..', 'game.js'), 'utf8');
  (0, eval)(src);                       // indirect eval → global scope, no window
  return globalThis.MBD;
}
export function readCsv(p) {
  return fs.readFileSync(p, 'utf8').split('\n')
    .map(l => l.split(',')).filter(r => /^\d+$/.test(r[0])).map(r => r.map(Number));
}
// telemetry fixtures: package layout first, original session layout as fallback
const CANDIDATES = [
  path.join(here, '..', '..', 'reference', 'handoff_spiritual', 'telemetry', 'plays'),
  path.join(here, '..', '..', 'handoff_spiritual', 'telemetry', 'plays'),
];
export const TELEMETRY = CANDIDATES.find(p => fs.existsSync(p)) || CANDIDATES[0];
