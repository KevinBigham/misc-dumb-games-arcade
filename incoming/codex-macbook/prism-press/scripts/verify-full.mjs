import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const ROOT = resolve("dist");
const SHOTS = resolve("verification-shots");
mkdirSync(SHOTS, { recursive: true });
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const data = await readFile(join(ROOT, pathname));
    res.writeHead(200, { "content-type": mime[extname(pathname)] ?? "application/octet-stream" }); res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--no-sandbox", "--disable-gpu-sandbox", "--use-gl=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const missing = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (r) => { if (r.status() === 404) missing.push(r.url()); });
const check = (value, message) => { if (!value) throw new Error(`FULL VERIFY: ${message}`); };
const snap = () => page.evaluate(() => window.__prismSnapshot());
const shot = (name) => page.screenshot({ path: join(SHOTS, name) });
const startClean = async () => {
  await page.evaluate(() => { window.__prismTest.model.start(); window.__prismTest.scene.markDirty(); });
  await page.waitForTimeout(80);
};
const fillCells = async (cells) => page.evaluate((cells) => {
  const { model, scene } = window.__prismTest;
  for (const [row, col, color = 1] of cells) model.board[row * 7 + col] = { id: 10000 + row * 7 + col, color, glitch: false };
  scene.markDirty();
}, cells);
const setPiece = async (shape, row, col, rotation = 0) => page.evaluate(({ shape, row, col, rotation }) => {
  const { model } = window.__prismTest;
  model.rack[0] = { shape, rotation, color: 0 }; model.selected = 0;
  model.hoverRow = row; model.hoverCol = col;
}, { shape, row, col, rotation });
const rowSetup = async (row = 0, comboReset = true) => {
  if (comboReset) await startClean();
  await fillCells(Array.from({ length: 6 }, (_, col) => [row, col, col % 6]).filter(([, col]) => col !== 6));
  await setPiece("dot", row, 6);
};

try {
  await page.goto(`http://127.0.0.1:${port}/?verify=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__GAME_READY__ === true);
  check((await snap()).phase === "title", "cold start did not reach title");
  await page.getByRole("button", { name: "How to play" }).first().click();
  check(await page.getByRole("dialog").count() === 1, "title help did not open");
  await page.getByRole("button", { name: /GOT IT/ }).click();
  await page.getByTestId("start-game").click();
  check((await snap()).phase === "playing", "start button did not start play");

  const beforeRotation = (await snap()).rack[1].rotation;
  await page.keyboard.press("Digit2");
  await page.keyboard.press("KeyR");
  check((await snap()).rack[1].rotation !== beforeRotation, "keyboard rotation did not change orientation");
  await page.keyboard.press("Enter");
  check((await snap()).placements === 1, "keyboard Enter did not place selected piece");

  await startClean();
  const piece = await page.getByTestId("piece-0").boundingBox();
  await page.mouse.move(piece.x + piece.width / 2, piece.y + piece.height / 2);
  await page.mouse.down();
  await page.mouse.move(640, 360, { steps: 8 });
  await page.mouse.up();
  check((await snap()).placements === 1, "mouse drag-and-drop placement failed");
  await page.getByTestId("hold-button").click();
  check((await snap()).hold !== null && (await snap()).holdUsed, "hold did not bank a piece");
  check(await page.getByTestId("hold-button").isDisabled(), "hold did not lock after use");

  await page.getByRole("button", { name: "Pause game" }).click();
  const pausedHeat = (await snap()).heat;
  await page.waitForTimeout(350);
  check(Math.abs((await snap()).heat - pausedHeat) < 0.001, "heat advanced while paused");
  await page.getByTestId("resume-button").click();
  check((await snap()).phase === "playing", "resume button failed");
  await page.getByRole("button", { name: "Pause game" }).click();
  await page.getByRole("button", { name: /RESTART RUN/ }).click();
  const reset = await snap();
  check(reset.score === 0 && reset.lines === 0 && reset.hold === null && reset.placements === 0, "restart left run residue");

  await rowSetup(0);
  check(await page.evaluate(() => window.__prismTest.model.placeSelected()), "real line placement was rejected");
  let state = await snap();
  check(state.lines === 1 && state.combo === 1 && state.sectorLines === 1, "single line clear did not score and vent");
  check(await page.evaluate(() => window.__prismTest.model.board.slice(0, 7).every((cell) => cell === null)), "cleared row remained occupied");
  await shot("04-line-clear.png");

  await rowSetup(1);
  console.log("COMBO SETUP", await page.evaluate(() => { const m = window.__prismTest.model; return { row: m.board.slice(7, 14).map(Boolean), hover: [m.hoverRow, m.hoverCol], selected: m.selected, piece: m.rack[m.selected] }; }));
  const secondPlacement = await page.evaluate(() => window.__prismTest.model.placeSelected());
  state = await snap();
  check(secondPlacement && state.combo === 2, `consecutive clear did not build Flow multiplier: placed=${secondPlacement} state=${JSON.stringify({ combo: state.combo, lines: state.lines, phase: state.phase, reason: state.reason })}`);

  await startClean();
  const cross = [];
  for (let i = 0; i < 7; i += 1) if (i !== 1) cross.push([1, i, 2], [i, 1, 3]);
  await fillCells(cross);
  await setPiece("dot", 1, 1);
  await page.evaluate(() => window.__prismTest.model.placeSelected());
  state = await snap();
  check(state.lines === 2 && state.combo === 1 && state.score >= 610, "row/column cross-clear did not resolve simultaneously");

  await startClean();
  await page.evaluate(() => { window.__prismTest.model.sectorLines = window.__prismTest.model.sectorTarget - 1; });
  await rowSetup(0, false);
  await page.evaluate(() => window.__prismTest.model.placeSelected());
  check((await snap()).phase === "sector", "sector target did not open sector-clear state");
  await shot("05-sector-clear.png");
  await page.getByTestId("continue-sector").click();
  state = await snap();
  check(state.phase === "playing" && state.sector === 2 && state.board.some((cell) => cell?.glitch), "next sector did not add static hazard");

  await startClean();
  await fillCells(Array.from({ length: 9 }, (_, i) => [Math.floor(i / 3) + 2, i % 3 + 2, i % 6]));
  await page.evaluate(() => { const m = window.__prismTest.model; m.charge = 100; m.heat = 65; m.togglePulse(); });
  check((await snap()).pulseMode, "charged Pulse did not arm");
  await page.evaluate(() => window.__prismTest.model.pulseAt(3, 3));
  state = await snap();
  check(state.charge === 0 && !state.pulseMode && state.board.slice(16, 25).every((cell) => cell === null), "3×3 Pulse did not erase its pocket");

  await startClean();
  await fillCells(Array.from({ length: 49 }, (_, i) => [Math.floor(i / 7), i % 7, i % 6]));
  await page.evaluate(() => { const m = window.__prismTest.model; m.charge = 100; m.togglePulse(); m.pulseAt(3, 3); });
  await page.waitForTimeout(70);
  await shot("06-busy-pulse.png");
  const stats = await page.evaluate(() => window.__gameStats());
  check(stats.drawCalls < 150, `draw-call budget exceeded (${stats.drawCalls})`);

  await startClean();
  await page.evaluate(() => { const m = window.__prismTest.model; m.heat = 99.99; m.update(1); });
  check((await snap()).phase === "gameover" && (await snap()).reason === "CORE OVERLOAD", "heat overload did not end the run");
  await shot("07-game-over.png");
  await page.getByTestId("restart-button").click();
  check((await snap()).phase === "playing" && (await snap()).score === 0, "game-over restart failed");

  await startClean();
  await fillCells(Array.from({ length: 49 }, (_, i) => [Math.floor(i / 7), i % 7, i % 6]));
  await page.evaluate(() => window.__prismTest.model.holdSelected());
  check((await snap()).phase === "gameover" && (await snap()).reason === "NO VALID FIT", "no-fit deadlock did not end the run");

  await startClean();
  await page.evaluate(() => { const m = window.__prismTest.model; m.sector = 6; m.sectorLines = m.sectorTarget - 1; });
  await rowSetup(0, false);
  await page.evaluate(() => window.__prismTest.model.placeSelected());
  check((await snap()).phase === "victory", "sector six did not trigger victory");
  await shot("08-victory.png");
  await page.getByTestId("endless-button").click();
  state = await snap();
  check(state.phase === "playing" && state.endless && state.sector === 7, "endless overclock did not start");

  await page.getByRole("button", { name: "Mute sound" }).click();
  check(await page.evaluate(() => localStorage.getItem("game.prism.muted") === "true"), "mute preference was not persisted");
  await page.getByRole("button", { name: "Turn sound on" }).click();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  mobile.on("console", (m) => { if (m.type() === "error") errors.push(`mobile: ${m.text()}`); });
  mobile.on("pageerror", (e) => errors.push(`mobile: ${e}`));
  await mobile.goto(`http://127.0.0.1:${port}/?verify=1`, { waitUntil: "networkidle" });
  await mobile.waitForFunction(() => window.__GAME_READY__ === true);
  await mobile.screenshot({ path: join(SHOTS, "09-mobile-title.png") });
  await mobile.getByTestId("start-game").tap();
  await mobile.getByTestId("piece-0").tap();
  await mobile.touchscreen.tap(195, 410);
  const mobileState = await mobile.evaluate(() => window.__prismSnapshot());
  check(mobileState.placements > 0, "touch tap placement failed");
  await mobile.screenshot({ path: join(SHOTS, "10-mobile-gameplay.png") });
  await mobile.close();

  check(errors.length === 0, `console errors: ${errors[0] ?? ""}`);
  check(missing.length === 0, `404 responses: ${missing[0] ?? ""}`);
  console.log(`FULL VERIFY OK: placement, rotation, drag, hold, pause, restart, clears, combo, cross-clear, sector, pulse, deadlock, overload, victory, endless, mute, mobile.`);
  console.log(`RENDER STATS: ${JSON.stringify(stats)}`);
} finally {
  await browser.close();
  server.close();
}
