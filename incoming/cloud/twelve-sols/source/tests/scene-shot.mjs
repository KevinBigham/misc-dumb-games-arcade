// Renders the scene canvas in a few states to PNGs (no real browser here; jsdom + napi canvas).
import fs from 'fs';
import { createRequire } from 'module';
import { HTML } from './lib.mjs';
const require = createRequire(process.env.JSDOM_FROM || import.meta.url);
const { JSDOM } = require('jsdom'); const { createCanvas } = require('@napi-rs/canvas');
const out = process.argv[2] || '.';
const html = fs.readFileSync(HTML, 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://game.test/', beforeParse(w) {
  const P = w.HTMLCanvasElement.prototype; const map = new WeakMap();
  const nc = el => { let c = map.get(el); if (!c) { c = createCanvas(el._w || 300, el._h || 150); map.set(el, c); } return c; };
  Object.defineProperty(P, 'width', { get() { return this._w || 300; }, set(v) { this._w = v; nc(this).width = v; } });
  Object.defineProperty(P, 'height', { get() { return this._h || 150; }, set(v) { this._h = v; nc(this).height = v; } });
  P.getContext = function () { return nc(this).getContext('2d'); };
  P.png = function () { return nc(this).toBuffer('image/png'); };
  P.getBoundingClientRect = () => ({ width: 355, height: 128 });
  w.devicePixelRatio = 2;
} });
const w = dom.window; const H = w.__TS;
H.Scene.resize();
w.document.querySelector('[data-act="new"]').click();
const shot = (name) => { H.Scene.draw(); fs.writeFileSync(out + '/' + name + '.png', w.document.querySelector('#scene').png()); };
shot('scene-dawn');
H.G.s.hour = 5; H.G.s.builds = { shutter: 2, panel: 2, planter: 1 }; shot('scene-afternoon');
H.G.s.hour = 9; H.G.s.builds = { shutter: 3, panel: 1, planter: 2, lamp: 1, beacon: 1 }; H.G.s.hull = 20; H.G.s.sol = 10;
for (let i = 0; i < 60; i++) H.Scene.update(0.03); H.Scene.shake(12); shot('scene-night-storm');
console.log('ok');
process.exit(0);
