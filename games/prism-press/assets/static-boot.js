import { AudioSystem } from "./audio.js";
import { GameLoop } from "./engine.js";
import { GameModel } from "./model.js";
import { ReactorScene } from "./scene.js";
import { PALETTE, ROTATIONS, shapeBounds, shapeDef } from "./config.js";
import { storage } from "./storage.js";
const canvas = document.querySelector("#game-canvas");
const root = document.querySelector("#ui-root");
const gameRoot = document.querySelector("#game-root");
const model = new GameModel();
const scene = new ReactorScene(canvas, model);
const audio = new AudioSystem();
const scoreFormat = new Intl.NumberFormat("en-US");
let dragging = false;
let helpOpen = false;
let lastKey = "";
const paths = {
    play: '<path d="m8 5 11 7-11 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 2-2.4 2-2.4 4M12 17h.01"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    mute: '<path d="M11 5 6 9H3v6h3l5 4zM16 10l5 5M21 10l-5 5"/>',
    rotate: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.5 12a7 7 0 0 0-12-4L4 12M5.5 12a7 7 0 0 0 12 4l2.5-4"/>',
    restart: '<path d="M4 4v6h6M20 20v-6h-6"/><path d="M5 15a8 8 0 0 0 13 3M19 9A8 8 0 0 0 6 6"/>',
    hold: '<path d="M4 7h16v13H4zM8 7V4h8v3M9 12h6"/>',
    zap: '<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>',
    home: '<path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-6M7 17h10"/>',
    infinity: '<path d="M8 8c-5 0-5 8 0 8 4 0 8-8 12-8 5 0 5 8 0 8-4 0-8-8-12-8z"/>',
    spark: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/>',
    mouse: '<path d="m5 3 13 9-6 1 3 6-3 1-3-6-4 4z"/>',
    keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M18 10h.01M7 14h.01M11 14h6"/>',
};
function icon(name, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.spark}</svg>`;
}
function kbd(text) { return `<kbd>${text}</kbd>`; }
function iconButton(action, label, glyph) {
    return `<button class="icon-button" data-action="${action}" aria-label="${label}" title="${label}">${icon(glyph, 19)}</button>`;
}
function muteButton() {
    return iconButton("mute", audio.muted ? "Turn sound on" : "Mute sound", audio.muted ? "mute" : "volume");
}
function miniPiece(piece, tiny = false) {
    const cells = ROTATIONS[piece.shape][piece.rotation % ROTATIONS[piece.shape].length];
    const bounds = shapeBounds(cells);
    const occupied = new Set(cells.map(([r, c]) => `${r}:${c}`));
    const color = PALETTE[piece.color % PALETTE.length].hex;
    let html = `<div class="mini-piece ${tiny ? "tiny" : ""}" style="--piece-color:${color};grid-template-columns:repeat(${bounds.cols},var(--mini-cell));grid-template-rows:repeat(${bounds.rows},var(--mini-cell))">`;
    for (let r = 0; r < bounds.rows; r += 1)
        for (let c = 0; c < bounds.cols; c += 1) {
            html += `<span class="${occupied.has(`${r}:${c}`) ? "filled" : "empty"}"></span>`;
        }
    return html + "</div>";
}
function helpHTML() {
    return `<div class="modal-backdrop" role="dialog" aria-modal="true"><section class="modal help-modal">
    ${iconButton("close-help", "Close instructions", "x")}<p class="eyebrow">FIELD MANUAL</p><h2>Make space. Make it sing.</h2>
    <div class="help-steps">
      <article><span>01</span><div><h3>Place a prism</h3><p>Drag any of the three shapes onto the 7×7 reactor. Press ${kbd("R")} or use Rotate to change its orientation.</p></div></article>
      <article><span>02</span><div><h3>Vent both axes</h3><p>Fill a complete row <em>or column</em> to clear it and cool the core. Cross-clears and back-to-back clears score big.</p></div></article>
      <article><span>03</span><div><h3>Beat the pressure</h3><p>Core load rises constantly. Bank one awkward piece per rack, and fire a charged 3×3 Pulse when space gets tight.</p></div></article>
    </div>
    <div class="control-grid"><div>${icon("mouse")}<span>Drag / tap to place</span></div><div>${icon("keyboard")}<span>${kbd("1")} ${kbd("2")} ${kbd("3")} select · arrows aim</span></div><div>${icon("rotate")}<span>${kbd("R")} rotate · ${kbd("Enter")} place</span></div><div>${icon("zap")}<span>${kbd("Q")} pulse · ${kbd("H")} hold</span></div><div>${icon("pause")}<span>${kbd("P")} / ${kbd("Esc")} pause</span></div><div>${icon("volume")}<span>${kbd("M")} sound on / off</span></div></div>
    <button class="primary-button" data-action="close-help">GOT IT ${icon("arrow")}</button></section></div>`;
}
function titleHTML(s) {
    return `<div class="title-screen"><div class="title-utility">${iconButton("help", "How to play", "help")}${muteButton()}</div>
    <main class="title-card"><div class="title-mark"><span></span><span></span><span></span></div><p class="eyebrow">A HIGH-PRESSURE SPATIAL PUZZLER</p>
    <h1><span>PRISM</span><strong>PRESS</strong></h1><p class="title-tagline">Think in shapes.<br>Move with purpose.</p>
    <button class="primary-button start-button" data-action="start" data-testid="start-game">${icon("play")} IGNITE THE CORE ${kbd("SPACE")}</button>
    <button class="text-button" data-action="help">HOW TO PLAY ${icon("arrow", 14)}</button>
    <div class="title-features"><span>ROTATE FREELY</span><i></i><span>CLEAR BOTH AXES</span><i></i><span>CHASE THE FLOW</span></div>
    ${s.best > 0 ? `<div class="title-best">${icon("trophy", 15)} PERSONAL BEST <strong>${scoreFormat.format(s.best)}</strong><span>SECTOR ${s.bestSector}</span></div>` : ""}
    </main><p class="title-footnote">7×7 REACTOR · SIX SECTORS · ENDLESS OVERCLOCK</p></div>`;
}
function tutorialHTML(s) {
    if (s.tutorial >= 4)
        return "";
    const steps = [
        ["01", "PLACE YOUR FIRST PRISM", "Drag a shape onto the grid. R rotates it."],
        ["02", "MAKE A LINE. VENT THE CORE.", "Fill any row or column before load reaches 100%."],
        ["03", "KEEP THE FLOW ALIVE", "Clear on consecutive placements to build a ×5 multiplier."],
        ["04", s.charge >= 100 ? "PULSE IS READY" : "CHARGE YOUR ESCAPE PLAN", s.charge >= 100 ? "Press Q, then choose a 3×3 pocket to erase." : "Place shapes and clear lines to charge a 3×3 Pulse."],
    ];
    const step = steps[s.tutorial];
    return `<div class="tutorial-card step-${s.tutorial}" data-testid="tutorial"><span>${step[0]}</span><div><strong>${step[1]}</strong><p>${step[2]}</p></div></div>`;
}
function hudHTML(s) {
    const progress = Math.min(100, s.sectorLines / s.sectorTarget * 100);
    const pieces = s.rack.map((piece, index) => `<button class="piece-card ${s.selected === index && piece && !s.pulseMode ? "selected" : ""} ${!piece ? "used" : ""}" data-slot="${index}" data-testid="piece-${index}" ${!piece ? "disabled" : ""} aria-label="${piece ? `Select ${shapeDef(piece.shape).name}` : "Piece placed"}">
    <span class="piece-number">0${index + 1}</span>${piece ? miniPiece(piece) : `<span class="placed-mark">${icon("check", 21)} PLACED</span>`}${piece ? `<span class="piece-name">${shapeDef(piece.shape).name}</span>` : ""}</button>`).join("");
    return `<header class="topbar"><div class="mini-brand"><span class="brand-gem"></span> PRISM <strong>PRESS</strong></div>
    <div class="heat-panel" id="heat-panel" data-testid="heat-panel"><div class="heat-label"><span>${icon("gauge", 14)} CORE LOAD</span><strong id="heat-value">0<small>%</small></strong></div><div class="heat-track"><span id="heat-fill"></span><i style="left:75%"></i></div><p id="heat-status">STABLE</p></div>
    <div class="top-actions">${iconButton("help", "How to play", "help")}${muteButton()}${iconButton("pause", "Pause game", "pause")}</div></header>
    <aside class="score-panel"><p class="eyebrow">CURRENT RUN</p><div class="score-value" data-testid="score">${scoreFormat.format(s.score)}</div><div class="best-line">${icon("trophy", 13)} BEST <strong>${scoreFormat.format(s.best)}</strong></div>
    <div class="sector-block"><div><span>${s.endless ? "OVERCLOCK" : `SECTOR ${s.sector}`}</span><strong>${s.sectorLines} / ${s.sectorTarget}</strong></div><div class="sector-track"><span style="width:${progress}%"></span></div><p>${s.endless ? "ENDLESS REACTOR" : "LINES TO NEXT SECTOR"}</p></div>
    <div class="combo-display ${s.combo > 0 ? "live" : ""}"><span>FLOW</span><strong>${s.combo > 0 ? `×${s.combo}` : "—"}</strong><small>${s.combo > 0 ? "CLEAR AGAIN" : "BUILD A STREAK"}</small></div>
    <div class="run-mini-stats"><span><strong>${s.lines}</strong> LINES</span><span><strong>${s.placements}</strong> PLACED</span></div></aside>
    <aside class="rack-panel"><div class="rack-heading"><div><p class="eyebrow">PRISM RACK</p><span>CHOOSE YOUR FIT</span></div>${icon("hold")}</div><div class="piece-rack">${pieces}</div>
    <div class="rack-tools"><button class="tool-button" data-action="rotate" data-testid="rotate-button" ${s.selected < 0 ? "disabled" : ""}>${icon("rotate", 17)}<span>ROTATE${kbd("R")}</span></button>
    <button class="hold-button ${s.holdUsed ? "locked" : ""}" data-action="hold" data-testid="hold-button" ${s.holdUsed || s.selected < 0 ? "disabled" : ""}><span class="hold-preview">${s.hold ? miniPiece(s.hold, true) : icon("hold", 19)}</span><span>HOLD<small>${s.holdUsed ? "USED THIS RACK" : "ONE PER RACK"}</small></span>${kbd("H")}</button></div>
    <button class="pulse-button ${s.canPulse ? "ready" : ""} ${s.pulseMode ? "armed" : ""}" data-action="pulse" data-testid="pulse-button" ${!s.canPulse ? "disabled" : ""}><div class="pulse-icon">${icon("zap", 20)}</div><div><span id="pulse-label">${s.pulseMode ? "PULSE ARMED" : s.canPulse ? "PULSE READY" : "CHARGING PULSE"}</span><small id="charge-label">${Math.floor(s.charge)} / 100 CHARGE</small></div>${kbd("Q")}<i><span id="charge-fill"></span></i></button>
    <p class="rack-tip">Complete rows <em>and</em> columns</p></aside>${tutorialHTML(s)}
    ${!s.hasMove && s.canPulse ? `<div class="rescue-callout">${icon("zap", 17)} NO FIT — YOUR PULSE CAN MAKE SPACE</div>` : ""}
    <div class="event-banner ${s.banner ? "show" : ""}" aria-live="polite">${s.banner}</div><div class="desktop-controls"><span>1—3 SELECT</span><span>ARROWS AIM</span><span>ENTER PLACE</span><span>R ROTATE</span></div>`;
}
function statsHTML(s) {
    return `<div class="result-stats"><div><strong>${scoreFormat.format(s.score)}</strong><span>SCORE</span></div><div><strong>${s.lines}</strong><span>LINES</span></div><div><strong>×${Math.max(1, s.maxCombo)}</strong><span>BEST FLOW</span></div></div>`;
}
function modalHTML(s) {
    if (helpOpen)
        return helpHTML();
    if (s.phase === "paused")
        return `<div class="modal-backdrop" data-testid="pause-modal"><section class="modal compact-modal"><p class="eyebrow">REACTOR SUSPENDED</p><h2>Take a breath.</h2><p>The core load is frozen. Your fit will be waiting.</p><button class="primary-button" data-action="resume" data-testid="resume-button">${icon("play")} RESUME ${kbd("ESC")}</button><button class="secondary-button" data-action="restart">${icon("restart", 17)} RESTART RUN</button><button class="text-button" data-action="title">${icon("home", 15)} BACK TO TITLE</button></section></div>`;
    if (s.phase === "sector")
        return `<div class="modal-backdrop sector-backdrop" data-testid="sector-modal"><section class="modal compact-modal"><div class="result-icon success">${icon("check", 28)}</div><p class="eyebrow">PRESSURE VENTED</p><h2>Sector ${s.sector} clear.</h2><p>Clean work. The next reactor runs hotter and introduces more complex prisms.</p>${statsHTML(s)}<button class="primary-button" data-action="continue" data-testid="continue-sector">ENTER SECTOR ${s.sector + 1} ${icon("arrow")}</button></section></div>`;
    if (s.phase === "gameover") {
        const overload = s.reason === "CORE OVERLOAD";
        return `<div class="modal-backdrop danger-backdrop" data-testid="gameover-modal"><section class="modal compact-modal"><div class="result-icon danger">${icon("zap", 27)}</div><p class="eyebrow">RUN TERMINATED</p><h2>${overload ? "The core blew its top." : "Nowhere left to fit."}</h2><p>${overload ? "Clear lines more often to vent load. A charged Pulse buys precious time." : "Keep broad pockets open and check all three shapes before committing."}</p>${s.newBest ? `<div class="new-best">${icon("spark", 16)} NEW PERSONAL BEST</div>` : ""}${statsHTML(s)}<button class="primary-button" data-action="restart" data-testid="restart-button">${icon("restart")} RUN IT BACK ${kbd("SPACE")}</button><button class="text-button" data-action="title">${icon("home", 15)} BACK TO TITLE</button></section></div>`;
    }
    if (s.phase === "victory")
        return `<div class="modal-backdrop victory-backdrop" data-testid="victory-modal"><section class="modal compact-modal victory-modal"><div class="victory-rays"></div><div class="result-icon trophy">${icon("trophy", 29)}</div><p class="eyebrow">ALL SIX SECTORS STABLE</p><h2>You pressed back.<br>And won.</h2><p>The Prism Core is yours. Overclock mode removes the ceiling — and keeps turning up the heat.</p>${statsHTML(s)}<button class="primary-button" data-action="endless" data-testid="endless-button">${icon("infinity", 19)} ENTER ENDLESS OVERCLOCK</button><button class="secondary-button" data-action="restart">${icon("restart", 17)} NEW RUN</button><button class="text-button" data-action="title">${icon("home", 15)} BACK TO TITLE</button></section></div>`;
    return "";
}
function render(force = false) {
    const s = model.snapshot();
    const key = [s.phase, s.score, s.best, s.sector, s.sectorLines, s.combo, s.rack.map((p) => p ? `${p.shape}.${p.rotation}.${p.color}` : "-").join(","), s.hold?.shape, s.hold?.rotation, s.holdUsed, s.selected, s.pulseMode, s.canPulse, s.hasMove, s.lines, s.placements, s.reason, s.bannerId, s.tutorial, s.endless, helpOpen, audio.muted].join("|");
    if (force || key !== lastKey) {
        root.innerHTML = `${s.phase === "title" ? titleHTML(s) : hudHTML(s)}${modalHTML(s)}`;
        gameRoot.className = `phase-${s.phase}`;
        lastKey = key;
    }
    updateDynamics(s);
}
function updateDynamics(s) {
    const heat = Math.min(100, s.heat);
    const heatPanel = document.querySelector("#heat-panel");
    if (heatPanel)
        heatPanel.className = `heat-panel ${heat >= 75 ? "hot" : ""} ${heat >= 90 ? "critical" : ""}`;
    const heatValue = document.querySelector("#heat-value");
    if (heatValue)
        heatValue.innerHTML = `${Math.ceil(heat)}<small>%</small>`;
    const heatFill = document.querySelector("#heat-fill");
    if (heatFill)
        heatFill.style.width = `${heat}%`;
    const heatStatus = document.querySelector("#heat-status");
    if (heatStatus)
        heatStatus.textContent = heat >= 90 ? "VENT NOW" : heat >= 75 ? "RUNNING HOT" : "STABLE";
    const chargeFill = document.querySelector("#charge-fill");
    if (chargeFill)
        chargeFill.style.width = `${s.charge}%`;
    const chargeLabel = document.querySelector("#charge-label");
    if (chargeLabel)
        chargeLabel.textContent = s.pulseMode ? "TAP A 3×3 ZONE" : s.canPulse ? "ERASE A 3×3 POCKET" : `${Math.floor(s.charge)} / 100 CHARGE`;
}
function action(name) {
    switch (name) {
        case "start":
        case "restart":
            helpOpen = false;
            model.start();
            break;
        case "title":
            helpOpen = false;
            model.toTitle();
            break;
        case "pause":
            model.pause();
            break;
        case "resume":
            model.resume();
            break;
        case "continue":
            model.continueSector();
            break;
        case "endless":
            model.continueEndless();
            break;
        case "rotate":
            model.rotate();
            break;
        case "hold":
            model.holdSelected();
            break;
        case "pulse":
            model.togglePulse();
            break;
        case "help":
            if (model.phase === "playing")
                model.pause();
            helpOpen = true;
            render();
            break;
        case "close-help":
            helpOpen = false;
            render();
            break;
        case "mute":
            audio.toggleMute();
            if (!audio.muted)
                audio.sfx("ui");
            render();
            break;
    }
}
root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (target && !target.hasAttribute("disabled"))
        action(target.dataset.action);
    const slot = event.target.closest("[data-slot]");
    if (slot && event.detail === 0)
        model.select(Number(slot.dataset.slot));
});
root.addEventListener("pointerdown", (event) => {
    const slot = event.target.closest("[data-slot]");
    if (!slot || slot.hasAttribute("disabled") || model.phase !== "playing")
        return;
    event.preventDefault();
    if (model.select(Number(slot.dataset.slot))) {
        dragging = true;
        scene.updatePointer(event.clientX, event.clientY);
    }
});
const onResize = () => scene.resize();
const onKeyDown = (event) => {
    const controlled = ["Space", "Enter", "Escape", "KeyP", "KeyM", "KeyR", "KeyH", "KeyQ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "Digit1", "Digit2", "Digit3"];
    if (controlled.includes(event.code))
        event.preventDefault();
    if (event.repeat)
        return;
    if (event.code === "KeyM") {
        action("mute");
        return;
    }
    if (helpOpen) {
        if (event.code === "Escape")
            action("close-help");
        return;
    }
    if (model.phase === "title") {
        if (event.code === "Space" || event.code === "Enter")
            model.start();
        return;
    }
    if (model.phase === "gameover") {
        if (event.code === "Space" || event.code === "Enter")
            model.start();
        if (event.code === "Escape")
            model.toTitle();
        return;
    }
    if (model.phase === "victory") {
        if (event.code === "Space" || event.code === "Enter")
            model.continueEndless();
        if (event.code === "Escape")
            model.toTitle();
        return;
    }
    if (model.phase === "sector") {
        if (event.code === "Space" || event.code === "Enter")
            model.continueSector();
        return;
    }
    if (model.phase === "paused") {
        if (["Escape", "KeyP", "Space"].includes(event.code))
            model.resume();
        return;
    }
    switch (event.code) {
        case "Escape":
            model.pulseMode ? model.togglePulse() : model.pause();
            break;
        case "KeyP":
            model.pause();
            break;
        case "KeyR":
            model.rotate();
            break;
        case "KeyH":
            model.holdSelected();
            break;
        case "KeyQ":
            model.togglePulse();
            break;
        case "Digit1":
            model.select(0);
            break;
        case "Digit2":
            model.select(1);
            break;
        case "Digit3":
            model.select(2);
            break;
        case "ArrowUp":
        case "KeyW":
            model.moveCursor(-1, 0);
            break;
        case "ArrowDown":
        case "KeyS":
            model.moveCursor(1, 0);
            break;
        case "ArrowLeft":
        case "KeyA":
            model.moveCursor(0, -1);
            break;
        case "ArrowRight":
        case "KeyD":
            model.moveCursor(0, 1);
            break;
        case "Enter":
            model.pulseMode ? model.pulseAt(model.hoverRow, model.hoverCol) : model.placeSelected();
            break;
    }
};
const onCanvasPointerDown = (event) => {
    if (model.phase !== "playing" || event.button !== 0)
        return;
    event.preventDefault();
    dragging = true;
    scene.updatePointer(event.clientX, event.clientY);
    try {
        canvas.setPointerCapture(event.pointerId);
    }
    catch { /* window fallback */ }
};
const onPointerMove = (event) => {
    if (model.phase === "playing" && (dragging || event.target === canvas))
        scene.updatePointer(event.clientX, event.clientY);
};
const onPointerUp = (event) => {
    if (!dragging)
        return;
    dragging = false;
    if (model.phase === "playing")
        scene.dropPointer(event.clientX, event.clientY);
};
const onBlur = () => { dragging = false; if (model.phase === "playing")
    model.pause(); };
const onVisibility = () => { if (document.hidden)
    onBlur(); };
model.subscribe(() => { scene.markDirty(); render(); });
model.onEvent((event) => {
    scene.handleEvent(event);
    switch (event.type) {
        case "start":
            audio.sfx("sector");
            audio.startMusic();
            break;
        case "place":
            audio.sfx("place");
            break;
        case "invalid":
            audio.sfx("invalid");
            break;
        case "clear":
            audio.sfx(event.strength && event.strength > 2 ? "combo" : "clear", event.strength);
            break;
        case "pulse":
            audio.sfx("pulse");
            break;
        case "hold":
            audio.sfx("hold");
            break;
        case "rotate":
            audio.sfx("rotate");
            break;
        case "select":
            audio.sfx("select");
            break;
        case "warning":
            audio.sfx("warning");
            break;
        case "sector":
            audio.sfx("sector");
            break;
        case "victory":
            audio.sfx("win");
            break;
        case "gameover":
            audio.sfx("lose");
            break;
        case "ui":
            audio.sfx("ui");
            break;
    }
});
window.addEventListener("resize", onResize);
window.addEventListener("keydown", onKeyDown, { passive: false });
canvas.addEventListener("pointerdown", onCanvasPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", () => { dragging = false; });
window.addEventListener("blur", onBlur);
document.addEventListener("visibilitychange", onVisibility);
const loop = new GameLoop({
    update: (dt) => {
        model.update(dt);
        scene.update(dt);
        audio.setIntensity(model.heat / 100);
        audio.setPlaying(model.phase === "playing");
        audio.update(dt);
    },
    render: () => { scene.render(); window.__GAME_READY__ = true; },
});
loop.start();
window.__gameProbe = () => ({ x: model.hoverCol - 3, y: 0, z: model.hoverRow - 3 });
window.__gameStats = () => scene.getStats();
window.__prismSnapshot = () => model.snapshot();
if (new URLSearchParams(window.location.search).has("verify"))
    window.__prismTest = { model, scene };
render(true);
