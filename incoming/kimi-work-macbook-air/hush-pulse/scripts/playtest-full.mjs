import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const dist = join(root, "dist");
const shots = join(root, "verification-shots");
mkdirSync(shots, { recursive: true });
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const raw = decodeURIComponent((req.url || "/").split("?")[0]);
    const path = resolve(dist, "." + (raw === "/" ? "/index.html" : raw));
    if (path !== dist && !path.startsWith(dist + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(path);
    res.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream" });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox", "--disable-gpu-sandbox", "--use-gl=swiftshader"],
});
const errors = [];
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); console.log(`PASS ${name}`); };

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  const snap = () => page.evaluate(() => window.__gameSnapshot());
  const mode = async (expected, timeout = 7000) => {
    await page.waitForFunction((value) => window.__gameSnapshot?.().mode === value, expected, { timeout });
    return snap();
  };
  const clearToUpgrade = async () => {
    await page.evaluate(() => window.__gameTest.clearWave());
    await mode("upgrade");
    await page.waitForTimeout(250);
    check("three mutation cards offered", await page.locator(".upgrade-card").count() === 3);
  };
  const shot = (name) => page.screenshot({ path: join(shots, name) });

  await page.goto(`http://127.0.0.1:${port}/?verify=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  await page.waitForTimeout(400);
  check("title mode ready", (await snap()).mode === "title");
  await shot("full-01-title.png");

  await page.locator('[data-action="start"]').click();
  await mode("playing");
  await page.mouse.move(900, 360);
  await page.waitForTimeout(100);
  check("crosshair tracks pointer over canvas", await page.locator("#crosshair").evaluate((el) => el.style.left === "900px" && el.style.top === "360px"));
  await page.keyboard.press("Space");
  await page.waitForTimeout(550);
  check("sonar pulse fires", (await snap()).stats.pulses === 1);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await page.mouse.click(850, 360, { button: "right" });
  await page.keyboard.down("ShiftLeft");
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(350);
  check("Hush state engages", await page.locator("#noise-state").textContent() === "HUSHED");
  await page.keyboard.up("KeyW");
  await page.keyboard.up("ShiftLeft");
  await shot("full-02-early-play.png");

  await page.keyboard.press("KeyM");
  check("mute button and storage update", await page.locator("#mute-btn").textContent() === "SOUND OFF" && await page.evaluate(() => localStorage.getItem("hush-pulse.muted") === "1"));
  await page.keyboard.press("KeyM");
  check("unmute restores sound state", await page.locator("#mute-btn").textContent() === "SOUND ON");
  await page.keyboard.press("Escape");
  await mode("paused");
  await shot("full-03-paused.png");
  await page.locator('[data-action="resume"]').click();
  await mode("playing");
  checks.push("pause and resume buttons work");

  await clearToUpgrade();
  await shot("full-04-upgrade.png");
  await page.locator(".upgrade-card").nth(0).click();
  await mode("playing");
  check("mutation click enters Movement II", (await snap()).wave === 2);
  await page.waitForTimeout(500);
  await clearToUpgrade();
  await page.keyboard.press("Digit2");
  await mode("playing");
  check("mutation hotkey enters Movement III", (await snap()).wave === 3);
  await page.waitForTimeout(500);
  await clearToUpgrade();
  await page.locator(".upgrade-card").nth(2).click();
  await mode("playing");
  check("third mutation enters Movement IV", (await snap()).wave === 4);

  await page.waitForTimeout(4300);
  await page.keyboard.press("Space");
  await page.mouse.move(640, 180);
  await page.mouse.down();
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(900);
  await page.keyboard.up("KeyD");
  await page.mouse.up();
  const busy = await snap();
  check("busy combat has multiple simultaneous enemies", busy.wave === 4 && busy.enemies >= 4);
  console.log("BUSY_METRICS", JSON.stringify(busy));
  await shot("full-05-busy-combat.png");
  await page.evaluate(() => window.__gameTest.clearWave());
  await page.waitForFunction(() => window.__gameSnapshot?.().wave === 5 && window.__gameSnapshot?.().mode === "playing");
  await page.waitForFunction(() => window.__gameSnapshot?.().enemies > 0);
  check("Conductor boss health bar visible", await page.locator("#boss-wrap").isVisible());
  await page.evaluate(() => window.__gameTest.boss());
  await page.waitForFunction(() => window.__gameSnapshot?.().enemies > 0);
  await page.keyboard.down("ShiftLeft");
  await page.keyboard.press("Space");
  await page.waitForTimeout(900);
  await shot("full-06-boss.png");
  await page.keyboard.up("ShiftLeft");
  await page.evaluate(() => window.__gameTest.clearWave());
  await mode("victory");
  await page.waitForTimeout(300);
  check("victory result copy displayed", (await page.locator("#result-title").textContent()).includes("SILENCE"));
  const savedWin = await page.evaluate(() => JSON.parse(localStorage.getItem("hush-pulse.save.v1")));
  check("victory persists win and best score", savedWin.wins >= 1 && savedWin.bestScore > 0);
  await shot("full-07-victory.png");

  await page.locator('#result-screen [data-action="restart"]').click();
  await mode("playing");
  check("victory restart resets run", (await snap()).wave === 1 && (await snap()).hp === 100);
  await page.evaluate(() => window.__gameTest.damage(999));
  await mode("gameover");
  check("lethal damage reaches game over", (await snap()).hp === 0);
  await shot("full-08-gameover.png");
  await page.locator('#result-screen [data-action="title"]').click();
  await mode("title");
  check("return to title shows saved escape count", Number(await page.locator("#wins").textContent()) >= 1);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  check("save survives full page reload", Number(await page.locator("#wins").textContent()) >= 1 && Number(await page.locator("#best-score").textContent()) > 0);

  await page.setViewportSize({ width: 900, height: 600 });
  await page.waitForTimeout(250);
  check("resize updates drawing buffer", await page.locator("#game-canvas").evaluate((canvas) => canvas.width === 900 && canvas.height === 600));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await shot("full-09-mobile-title.png");
  await page.locator('[data-action="start"]').click();
  await mode("playing");
  await page.waitForTimeout(300);
  check("mobile action controls visible", await page.locator(".mobile-actions").isVisible());
  await page.locator('[data-action="pulse"]').click();
  await page.waitForTimeout(200);
  check("mobile pulse button works", (await snap()).stats.pulses === 1);
  await shot("full-10-mobile-play.png");

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 700 }, hasTouch: true, isMobile: true });
  const touch = await touchContext.newPage();
  touch.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  touch.on("pageerror", (error) => errors.push(String(error)));
  await touch.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await touch.waitForFunction(() => window.__GAME_READY__ === true);
  await touch.locator('[data-action="start"]').tap();
  await touch.waitForFunction(() => window.__gameSnapshot?.().mode === "playing");
  check("coarse-pointer auto-aim mode engages", await touch.evaluate(() => matchMedia("(pointer: coarse)").matches));
  for (let i = 0; i < 32; i++) {
    if (i % 5 === 0) await touch.locator('[data-action="pulse"]').tap();
    await touch.waitForTimeout(450);
    const combat = await touch.evaluate(() => window.__gameSnapshot());
    if (combat.stats.kills >= 2 || combat.mode !== "playing") break;
  }
  const combat = await touch.evaluate(() => window.__gameSnapshot());
  console.log("TOUCH_COMBAT", JSON.stringify(combat));
  check("real auto-aim projectiles kill resonant enemies", combat.stats.kills >= 2 && combat.stats.resonantKills >= 1);
  await touch.screenshot({ path: join(shots, "full-11-touch-combat.png") });
  await touchContext.close();

  check("zero browser console errors across full run", errors.length === 0);
  console.log("FULL PLAYTEST OK", JSON.stringify({ checks: checks.length, savedWin, errors }));
} finally {
  await browser.close();
  server.close();
}
