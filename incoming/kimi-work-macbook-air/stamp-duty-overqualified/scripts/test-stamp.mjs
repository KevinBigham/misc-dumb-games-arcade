import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");
const shots = resolve(root, "verification-shots");
await mkdir(shots, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const failed = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("requestfailed", (request) => failed.push(request.url()));
const state = () => page.evaluate(() => window.__STAMP_DEBUG__.state());
const shot = (name) => page.screenshot({ path: resolve(shots, name) });
const law = (id) => page.evaluate((value) => window.__STAMP_DEBUG__.law(value), id);

try {
  await page.goto(pathToFileURL(resolve(root, "dist/index.html")).href);
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  assert.equal((await state()).mode, "title");
  await shot("01-title.png");

  await page.keyboard.press("Space");
  await page.waitForTimeout(350);
  assert.equal((await state()).mode, "playing");
  const before = await page.evaluate(() => window.__gameProbe());
  await page.mouse.move(800, 390);
  await page.mouse.down(); await page.waitForTimeout(420); await page.mouse.up();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__gameProbe());
  assert.ok(Math.hypot(after.x - before.x, after.z - before.z) > 20, "charge launch moves the stamp");
  for (const [key, axis, sign] of [["KeyW", "z", -1], ["KeyS", "z", 1], ["KeyA", "x", -1], ["KeyD", "x", 1]]) {
    await page.evaluate(() => window.__STAMP_DEBUG__.start());
    await page.waitForTimeout(120);
    const a = await page.evaluate(() => window.__gameProbe());
    await page.keyboard.down(key); await page.waitForTimeout(260); await page.keyboard.up(key);
    const b = await page.evaluate(() => window.__gameProbe());
    assert.ok((b[axis] - a[axis]) * sign > 0.05, `${key} direction is correct`);
  }

  await page.evaluate(() => window.__STAMP_DEBUG__.start());
  for (let attempt = 0; attempt < 8 && (await state()).stack === 0; attempt++) {
    const target = (await state()).target;
    await page.mouse.move(target.x, target.y);
    await page.mouse.down(); await page.waitForTimeout(450); await page.mouse.up();
    await page.waitForTimeout(420);
  }
  assert.ok((await state()).stack > 0, "a real charged collision stamps and collects a form");
  await shot("02-gameplay.png");

  await page.keyboard.press("Escape");
  assert.equal((await state()).mode, "paused");
  await shot("03-paused.png");
  await page.click('[data-action="shake"]');
  await page.click('[data-action="resume"]');
  assert.equal((await state()).mode, "playing");
  await page.keyboard.press("KeyM");
  assert.equal(await page.locator('[data-action="mute"]').textContent(), "SOUND OFF");
  await page.keyboard.press("KeyM");
  assert.equal(await page.locator('[data-action="mute"]').textContent(), "SOUND ON");

  await page.evaluate(() => window.__STAMP_DEBUG__.bank(6));
  assert.equal((await state()).mode, "upgrade");
  assert.equal(await page.locator(".upgrade-card").count(), 3);
  await page.waitForTimeout(400);
  await shot("04-upgrade.png");
  await page.locator(".upgrade-card").first().click();
  assert.equal((await state()).mode, "playing");
  assert.equal((await state()).department, 1);

  await page.evaluate(() => window.__STAMP_DEBUG__.busy());
  await page.waitForTimeout(800);
  await shot("05-busy.png");
  const busy = await state();
  assert.ok(busy.forms >= 20 && busy.laws.length === 3, "busy state is genuinely busy");
  const performance = await page.evaluate(() => new Promise((resolvePerf) => {
    let frames = 0; const start = window.performance.now();
    const tick = (now) => { frames++; if (now - start >= 2000) resolvePerf({ fps: frames * 1000 / (now - start), renderer: "Canvas2D" }); else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  assert.ok(performance.fps > 50, `busy scene frame rate ${performance.fps}`);

  for (const id of ["bounce", "slip", "sticky", "tiny", "giant", "fan", "gravity", "jelly", "hole", "duck", "calculator", "teeth", "coffee", "magnet", "birthday", "lunch"]) {
    await law(id);
    assert.ok((await state()).laws.includes(id), `law ${id} activates`);
  }

  await page.evaluate(() => window.__STAMP_DEBUG__.boss());
  await page.waitForTimeout(4300);
  assert.equal((await state()).department, 4);
  assert.ok((await state()).hazards > 0, "boss telegraph produces paper-policy hazards");
  await shot("06-boss.png");

  await page.evaluate(() => window.__STAMP_DEBUG__.gameOver());
  await page.waitForTimeout(1200);
  assert.equal((await state()).mode, "gameover");
  await shot("07-gameover.png");
  await page.click('[data-action="restart"]');
  assert.equal((await state()).mode, "playing");
  assert.equal((await state()).score, 0);
  assert.equal((await state()).stack, 0);

  await page.evaluate(() => window.__STAMP_DEBUG__.win());
  assert.equal((await state()).mode, "victory");
  await page.waitForTimeout(450);
  await shot("08-victory.png");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("stamp-duty.save")));
  assert.ok(stored.best >= 12500 && stored.wins >= 1, "victory and best score persist");
  await page.reload();
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  assert.ok((await page.locator(".title-footer").textContent()).includes("1 SHIFTS SURVIVED"));

  await page.setViewportSize({ width: 900, height: 600 });
  await page.waitForTimeout(250);
  await shot("09-small-title.png");
  const panel = await page.locator(".panel").boundingBox();
  assert.ok(panel && panel.x >= 0 && panel.y >= 0 && panel.x + panel.width <= 900 && panel.y + panel.height <= 600, "small viewport panel fits");
  await page.keyboard.press("Space");
  await page.waitForTimeout(400);
  await shot("10-small-gameplay.png");

  assert.deepEqual(errors, [], "zero console/runtime errors");
  assert.deepEqual(failed, [], "zero failed asset requests");
  console.log(JSON.stringify({ ok: true, performance, busy, finalState: await state(), errors, failed }, null, 2));
} finally {
  await browser.close();
}
