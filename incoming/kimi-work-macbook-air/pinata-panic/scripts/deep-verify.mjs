import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const DIST = join(ROOT, "dist");
const SHOTS = join(ROOT, "verification-shots");
mkdirSync(SHOTS, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json" };
const server = createServer(async (req, res) => {
  try {
    const pathname = req.url.split("?")[0];
    const raw = pathname === "/" ? "/index.html" : pathname;
    const file = resolve(DIST, "." + decodeURIComponent(raw));
    if (file !== DIST && !file.startsWith(DIST + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const missing = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(String(error)));
page.on("response", (response) => { if (response.status() === 404) missing.push(response.url()); });
const state = () => page.evaluate(() => window.__pinataDebug.state());
const debug = (method, ...args) => page.evaluate(({ method, args }) => window.__pinataDebug[method](...args), { method, args });
const shot = (name) => page.screenshot({ path: join(SHOTS, name) });
const wait = (ms) => page.waitForTimeout(ms);

try {
  await page.goto(`http://127.0.0.1:${port}/?test=1&seed=42`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  assert.equal((await state()).mode, "title");
  await shot("01-title.png");

  await page.locator("#mute-button").click();
  assert.match(await page.locator("#mute-button").textContent(), /OFF/);
  await page.locator("#mute-button").click();
  assert.match(await page.locator("#mute-button").textContent(), /ON/);
  await page.locator("#motion-button").click();
  assert.match(await page.locator("#motion-button").textContent(), /OFF/);
  await page.locator("#motion-button").click();

  await page.locator('[data-action="start"]').click();
  await wait(450);
  assert.equal((await state()).mode, "playing");
  const pos = () => page.evaluate(() => window.__gameProbe());
  const p0 = await pos();
  await page.keyboard.down("KeyW"); await wait(250); await page.keyboard.up("KeyW");
  const pW = await pos();
  assert.ok(pW.z < p0.z, "W moves toward world -Z");
  await page.keyboard.down("KeyD"); await wait(250); await page.keyboard.up("KeyD");
  const pD = await pos();
  assert.ok(pD.x > pW.x, "D moves toward world +X");
  await page.keyboard.down("KeyS"); await wait(180); await page.keyboard.up("KeyS");
  const pS = await pos();
  assert.ok(pS.z > pD.z, "S moves toward world +Z");
  await page.keyboard.down("KeyA"); await wait(180); await page.keyboard.up("KeyA");
  const pA = await pos();
  assert.ok(pA.x < pS.x, "A moves toward world -X");

  await page.mouse.move(760, 330);
  await page.mouse.click(760, 330);
  await wait(150);
  assert.ok((await state()).stats.thrown >= 3, "Mouse throw spends candy");
  await page.keyboard.press("Space");
  await wait(120);
  assert.ok((await state()).stats.dashes >= 1, "Space starts a dash");
  await debug("hit");
  await wait(150);
  assert.ok((await state()).stats.hits >= 1, "Hit spills candy and enters recovery");
  await shot("02-gameplay.png");

  await page.keyboard.press("Escape");
  await wait(120);
  assert.equal((await state()).mode, "paused");
  await shot("03-paused.png");
  await page.locator('[data-action="resume"]').click();
  assert.equal((await state()).mode, "playing");

  await debug("teleport", -8.5, -4.1);
  await debug("dash", 0, -1);
  await wait(400);
  assert.ok((await state()).stats.gifts >= 1, "Real dash collision opens a present");
  await debug("setCandy", 25);
  await debug("teleport", 0, -8.15);
  await wait(2300);
  assert.equal((await state()).mode, "upgrade", "Standing at the goody bag banks the full quota");
  assert.equal(await page.locator(".upgrade-card").count(), 3);
  await shot("04-upgrade.png");
  await page.locator(".upgrade-card").nth(1).click();
  assert.equal((await state()).wave, 1);
  assert.equal((await state()).mode, "playing");

  await debug("setWave", 1);
  await wait(6500);
  assert.ok((await state()).musicalTimer < 3, "Musical chairs telegraph begins");
  await shot("05-musical.png");
  await wait(2200);
  assert.ok((await state()).musicalTimer > 8, "Musical chairs event resolves and resets");

  await debug("setWave", 2);
  await wait(7500);
  console.log("CONGA STATE", JSON.stringify(await state()));
  assert.ok((await state()).activeKinds.conga >= 6, "Conga line spawns after its lane telegraph");
  await shot("06-conga.png");

  await debug("setWave", 3);
  await wait(3900);
  assert.ok(["windup", "charge", "recover"].includes((await state()).cakeState), "Runaway cake executes its charge pattern");
  await shot("07-cake.png");

  await debug("setWave", 4);
  await debug("busy");
  await wait(4600);
  assert.ok(["windup", "recover", "chase"].includes((await state()).bossState), "Birthday boss executes its wish slam");
  await shot("08-boss-busy.png");
  await wait(1800);
  const performance = await page.evaluate(() => window.__gameStats());
  assert.ok(performance.calls > 0 && performance.triangles > 0);

  await debug("victory");
  assert.equal((await state()).mode, "victory");
  await shot("09-victory.png");
  await page.locator('#results-screen [data-action="restart"]').click();
  assert.equal((await state()).wave, 0);
  assert.equal((await state()).score, 0);
  await debug("setCandy", 0);
  await debug("hit");
  assert.equal((await state()).mode, "gameover", "A hit with zero candy ends the run");
  await shot("10-gameover.png");
  const savedBest = await page.evaluate(() => Number(localStorage.getItem("game.pinata.best")));
  assert.ok(savedBest > 0, "Best score persists locally");
  await page.locator('#results-screen [data-action="title"]').click();
  assert.equal((await state()).mode, "title");

  await page.setViewportSize({ width: 960, height: 600 });
  await page.keyboard.press("Space");
  await wait(300);
  assert.equal((await state()).mode, "playing");
  await page.keyboard.press("Escape");
  await wait(120);
  await page.locator('#pause-screen [data-action="restart"]').click();
  assert.equal((await state()).mode, "playing");
  await page.keyboard.press("Escape");
  await wait(120);
  await page.locator('#pause-screen [data-action="title"]').click();
  assert.equal((await state()).mode, "title");

  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  assert.deepEqual(missing, [], `404s: ${missing.join("\n")}`);
  console.log(JSON.stringify({ ok: true, performance, savedBest, checks: [
    "title/start", "WASD directions", "candy throw", "dash", "hit/spill", "pause/resume",
    "real present collision", "real banking/quota", "upgrade selection", "musical chairs",
    "conga line", "cake charge", "boss slam", "busy scene", "victory/restart",
    "empty-candy game-over", "local best", "resize", "pause restart/title", "zero console errors/404s",
  ] }, null, 2));
} finally {
  await browser.close();
  server.close();
}
