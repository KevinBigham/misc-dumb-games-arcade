// smoke: the all-in-one artifact boots and reaches the title with zero page errors
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('/tmp/node_modules/playwright/index.js');
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 820, height: 760 } });
let errors = 0;
page.on('pageerror', (e) => { errors++; console.log('PAGE EXCEPTION:', e.message); });
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('PAGE ERROR:', m.text()); } });
await page.goto('file://' + path.join(here, '..', 'mr_baseball_dynasty_field_demo.html'));
await page.waitForTimeout(1200);
const state = await page.evaluate(() => (typeof Shell !== 'undefined' && Shell.state) ? Shell.state.scene : 'NO SHELL');
console.log('artifact scene:', state, '· errors:', errors);
await browser.close();
process.exit(state !== 'NO SHELL' && errors === 0 ? 0 : 1);
