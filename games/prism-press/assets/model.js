import { BOARD_SIZE, FINAL_SECTOR, PALETTE, ROTATIONS, SECTOR_TARGETS, SHAPES, TUNING, shapeBounds, } from "./config.js";
import { storage } from "./storage.js";
const DEMO = [
    [1, 1, 1], [1, 2, 1], [2, 1, 2], [2, 3, 2], [3, 3, 0], [3, 4, 0],
    [4, 1, 3], [4, 2, 3], [4, 4, 4], [5, 4, 4], [5, 5, 1],
];
function validNumber(value, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function makeSeed() {
    try {
        const data = new Uint32Array(1);
        crypto.getRandomValues(data);
        return data[0] || 0x9e3779b9;
    }
    catch {
        return (Date.now() ^ 0xa5a5a5a5) >>> 0;
    }
}
/** All rules live here, independent of React and WebGL. */
export class GameModel {
    phase = "title";
    board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null);
    rack = [null, null, null];
    hold = null;
    holdUsed = false;
    selected = -1;
    hoverRow = 3;
    hoverCol = 3;
    score = 0;
    best = validNumber(storage.get("prism.best", 0));
    bestSector = Math.max(1, validNumber(storage.get("prism.bestSector", 1), 1));
    sector = 1;
    sectorLines = 0;
    heat = TUNING.startHeat;
    charge = 0;
    combo = 0;
    maxCombo = 0;
    lines = 0;
    placements = 0;
    pulseMode = false;
    reason = "";
    endless = false;
    newBest = false;
    tutorial = 0;
    banner = "";
    bannerId = 0;
    seed = makeSeed();
    nextCellId = 1;
    uiTimer = 0;
    warningStage = 0;
    uiListeners = new Set();
    eventListeners = new Set();
    constructor() {
        this.showDemo();
    }
    random() {
        // Mulberry32: repeatable, fast, and avoids unseeded Math.random in gameplay.
        let t = this.seed += 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    subscribe(fn) {
        this.uiListeners.add(fn);
        return () => this.uiListeners.delete(fn);
    }
    onEvent(fn) {
        this.eventListeners.add(fn);
        return () => this.eventListeners.delete(fn);
    }
    notify() {
        for (const fn of this.uiListeners)
            fn();
    }
    emit(event) {
        if (event.text) {
            this.banner = event.text;
            this.bannerId += 1;
        }
        for (const fn of this.eventListeners)
            fn(event);
        this.notify();
    }
    showDemo() {
        this.board.fill(null);
        for (const [row, col, color] of DEMO) {
            this.board[row * BOARD_SIZE + col] = { id: this.nextCellId++, color, glitch: false };
        }
    }
    start() {
        this.board.fill(null);
        this.phase = "playing";
        this.score = 0;
        this.sector = 1;
        this.sectorLines = 0;
        this.heat = TUNING.startHeat;
        this.charge = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lines = 0;
        this.placements = 0;
        this.hold = null;
        this.holdUsed = false;
        this.pulseMode = false;
        this.reason = "";
        this.endless = false;
        this.newBest = false;
        this.tutorial = 0;
        this.warningStage = 0;
        this.hoverRow = 3;
        this.hoverCol = 3;
        this.seed = makeSeed();
        this.rack = [this.makePiece("tri"), this.makePiece("corner"), this.makePiece("square")];
        this.selected = 0;
        this.banner = "";
        this.emit({ type: "start", text: "REACTOR ONLINE" });
    }
    toTitle() {
        this.phase = "title";
        this.pulseMode = false;
        this.showDemo();
        this.banner = "";
        this.notify();
    }
    pause() {
        if (this.phase !== "playing")
            return;
        this.phase = "paused";
        this.emit({ type: "ui" });
    }
    resume() {
        if (this.phase !== "paused")
            return;
        this.phase = "playing";
        this.emit({ type: "ui" });
    }
    get sectorTarget() {
        if (this.sector <= FINAL_SECTOR)
            return SECTOR_TARGETS[this.sector - 1];
        return 8 + (this.sector - FINAL_SECTOR) * 2;
    }
    get hasMove() {
        return this.rack.some((piece) => piece !== null && this.canFitAnywhere(piece));
    }
    get canPulse() {
        return this.charge >= 100 && this.board.some(Boolean);
    }
    makePiece(forcedShape) {
        let shapeId = forcedShape;
        if (!shapeId) {
            const available = SHAPES.filter((shape) => shape.minSector <= Math.min(this.sector, 5));
            const total = available.reduce((sum, shape) => sum + shape.weight, 0);
            let roll = this.random() * total;
            shapeId = available[0].id;
            for (const shape of available) {
                roll -= shape.weight;
                if (roll <= 0) {
                    shapeId = shape.id;
                    break;
                }
            }
        }
        const rotationCount = ROTATIONS[shapeId].length;
        return {
            shape: shapeId,
            rotation: forcedShape ? 0 : Math.floor(this.random() * rotationCount),
            color: Math.floor(this.random() * PALETTE.length),
        };
    }
    refillRack() {
        this.rack = [this.makePiece(), this.makePiece(), this.makePiece()];
        this.holdUsed = false;
        this.selected = 0;
    }
    cells(piece) {
        const variants = ROTATIONS[piece.shape];
        return variants[piece.rotation % variants.length];
    }
    select(slot) {
        if (this.phase !== "playing" || slot < 0 || slot > 2 || !this.rack[slot])
            return false;
        this.selected = slot;
        this.pulseMode = false;
        this.emit({ type: "select" });
        return true;
    }
    rotate() {
        if (this.phase !== "playing")
            return;
        if (this.selected < 0)
            this.selectFirst();
        const piece = this.rack[this.selected];
        if (!piece)
            return;
        piece.rotation = (piece.rotation + 1) % ROTATIONS[piece.shape].length;
        this.pulseMode = false;
        this.emit({ type: "rotate" });
    }
    selectFirst() {
        const index = this.rack.findIndex(Boolean);
        this.selected = index;
    }
    moveCursor(dr, dc) {
        if (this.phase !== "playing")
            return;
        if (this.selected < 0)
            this.selectFirst();
        this.hoverRow = Math.max(0, Math.min(BOARD_SIZE - 1, this.hoverRow + dr));
        this.hoverCol = Math.max(0, Math.min(BOARD_SIZE - 1, this.hoverCol + dc));
    }
    setHoverFromCell(row, col) {
        this.hoverRow = row;
        this.hoverCol = col;
        const piece = this.rack[this.selected];
        if (piece && !this.pulseMode) {
            const bounds = shapeBounds(this.cells(piece));
            this.hoverRow -= Math.floor(bounds.rows / 2);
            this.hoverCol -= Math.floor(bounds.cols / 2);
        }
    }
    canPlace(piece, row, col) {
        for (const [dr, dc] of this.cells(piece)) {
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || c < 0 || r >= BOARD_SIZE || c >= BOARD_SIZE)
                return false;
            if (this.board[r * BOARD_SIZE + c])
                return false;
        }
        return true;
    }
    canFitAnywhere(piece) {
        const original = piece.rotation;
        const variants = ROTATIONS[piece.shape].length;
        for (let rotation = 0; rotation < variants; rotation += 1) {
            piece.rotation = rotation;
            const bounds = shapeBounds(this.cells(piece));
            for (let row = 0; row <= BOARD_SIZE - bounds.rows; row += 1) {
                for (let col = 0; col <= BOARD_SIZE - bounds.cols; col += 1) {
                    if (this.canPlace(piece, row, col)) {
                        piece.rotation = original;
                        return true;
                    }
                }
            }
        }
        piece.rotation = original;
        return false;
    }
    placeSelected() {
        if (this.phase !== "playing" || this.pulseMode || this.selected < 0)
            return false;
        const piece = this.rack[this.selected];
        if (!piece)
            return false;
        if (!this.canPlace(piece, this.hoverRow, this.hoverCol)) {
            this.emit({ type: "invalid", text: "THAT FIT IS BLOCKED" });
            return false;
        }
        const placedCells = [];
        for (const [dr, dc] of this.cells(piece)) {
            const row = this.hoverRow + dr;
            const col = this.hoverCol + dc;
            this.board[row * BOARD_SIZE + col] = { id: this.nextCellId++, color: piece.color, glitch: false };
            placedCells.push({ row, col, color: piece.color });
        }
        this.rack[this.selected] = null;
        this.placements += 1;
        this.score += placedCells.length * 10;
        this.charge = Math.min(100, this.charge + placedCells.length * TUNING.chargePerCell);
        this.heat = Math.min(100, this.heat + TUNING.placementHeat);
        this.emit({ type: "place", cells: placedCells });
        const rows = [];
        const cols = [];
        for (let row = 0; row < BOARD_SIZE; row += 1) {
            let full = true;
            for (let col = 0; col < BOARD_SIZE; col += 1) {
                if (!this.board[row * BOARD_SIZE + col]) {
                    full = false;
                    break;
                }
            }
            if (full)
                rows.push(row);
        }
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            let full = true;
            for (let row = 0; row < BOARD_SIZE; row += 1) {
                if (!this.board[row * BOARD_SIZE + col]) {
                    full = false;
                    break;
                }
            }
            if (full)
                cols.push(col);
        }
        const lineCount = rows.length + cols.length;
        if (lineCount > 0) {
            this.combo = Math.min(5, this.combo + 1);
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            const cleared = new Map();
            for (const row of rows) {
                for (let col = 0; col < BOARD_SIZE; col += 1) {
                    const index = row * BOARD_SIZE + col;
                    const cell = this.board[index];
                    if (cell)
                        cleared.set(index, { row, col, color: cell.color });
                }
            }
            for (const col of cols) {
                for (let row = 0; row < BOARD_SIZE; row += 1) {
                    const index = row * BOARD_SIZE + col;
                    const cell = this.board[index];
                    if (cell)
                        cleared.set(index, { row, col, color: cell.color });
                }
            }
            for (const index of cleared.keys())
                this.board[index] = null;
            const points = 150 * lineCount * lineCount * Math.max(1, this.combo);
            this.score += points;
            this.lines += lineCount;
            this.sectorLines += lineCount;
            this.charge = Math.min(100, this.charge + lineCount * TUNING.chargePerLine);
            this.heat = Math.max(0, this.heat - lineCount * TUNING.clearCooling - Math.max(0, lineCount - 1) * 4);
            this.warningStage = this.heat > 75 ? 1 : 0;
            const label = lineCount > 1 ? `${lineCount}× CROSS CLEAR` : this.combo > 1 ? `FLOW ×${this.combo}` : "LINE VENTED";
            this.emit({ type: "clear", text: `${label}  +${points}`, cells: [...cleared.values()], rows, cols, points, strength: lineCount + this.combo });
            if (this.tutorial === 1)
                this.tutorial = 2;
        }
        else {
            this.combo = 0;
        }
        if (this.tutorial === 0)
            this.tutorial = 1;
        this.selectFirst();
        if (this.rack.every((piece) => piece === null))
            this.refillRack();
        this.updateRecord();
        if (this.sectorLines >= this.sectorTarget) {
            this.completeSector();
            return true;
        }
        this.checkForDeadlock();
        this.notify();
        return true;
    }
    updateRecord() {
        if (this.score > this.best) {
            this.best = this.score;
            this.newBest = true;
            storage.set("prism.best", this.best);
        }
        if (this.sector > this.bestSector) {
            this.bestSector = this.sector;
            storage.set("prism.bestSector", this.bestSector);
        }
    }
    checkForDeadlock() {
        if (this.hasMove)
            return;
        if (this.canPulse) {
            this.pulseMode = true;
            this.emit({ type: "warning", text: "NO FIT — FIRE THE PULSE!" });
        }
        else {
            this.gameOver("NO VALID FIT");
        }
    }
    holdSelected() {
        if (this.phase !== "playing" || this.holdUsed)
            return;
        if (this.selected < 0)
            this.selectFirst();
        const piece = this.rack[this.selected];
        if (!piece)
            return;
        const slot = this.selected;
        this.rack[slot] = this.hold;
        this.hold = piece;
        this.holdUsed = true;
        this.pulseMode = false;
        if (this.rack.every((item) => item === null)) {
            this.refillRack();
            this.holdUsed = true;
        }
        else if (!this.rack[slot]) {
            this.selectFirst();
        }
        this.emit({ type: "hold", text: "PRISM BANKED" });
        this.checkForDeadlock();
    }
    togglePulse() {
        if (this.phase !== "playing" || !this.canPulse)
            return;
        this.pulseMode = !this.pulseMode;
        this.emit({ type: "select", text: this.pulseMode ? "PULSE ARMED — CHOOSE A 3×3 ZONE" : undefined });
    }
    pulseAt(row, col) {
        if (this.phase !== "playing" || !this.pulseMode || !this.canPulse)
            return false;
        if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE)
            return false;
        const cells = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_SIZE - 1, row + 1); r += 1) {
            for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_SIZE - 1, col + 1); c += 1) {
                const index = r * BOARD_SIZE + c;
                const cell = this.board[index];
                if (cell) {
                    cells.push({ row: r, col: c, color: cell.color });
                    this.board[index] = null;
                }
            }
        }
        if (cells.length === 0) {
            this.emit({ type: "invalid", text: "PULSE NEEDS A FILLED CELL" });
            return false;
        }
        this.charge = 0;
        this.pulseMode = false;
        this.combo = 0;
        this.score += cells.length * 20;
        this.heat = Math.max(0, this.heat - 8 - cells.length * 1.5);
        this.updateRecord();
        this.emit({ type: "pulse", text: `POCKET ERASED  +${cells.length * 20}`, cells, points: cells.length * 20, strength: 2 });
        if (this.tutorial === 3)
            this.tutorial = 4;
        this.checkForDeadlock();
        return true;
    }
    completeSector() {
        this.heat = Math.max(0, this.heat - 20);
        this.pulseMode = false;
        this.updateRecord();
        if (this.sector >= FINAL_SECTOR && !this.endless) {
            this.phase = "victory";
            this.emit({ type: "victory", text: "PRISM CORE STABILIZED" });
        }
        else {
            this.phase = "sector";
            this.emit({ type: "sector", text: `SECTOR ${this.sector} CLEAR` });
        }
    }
    continueSector() {
        if (this.phase !== "sector")
            return;
        this.sector += 1;
        this.sectorLines = 0;
        this.phase = "playing";
        this.heat = Math.max(8, this.heat - 12);
        this.addGlitches(this.sector >= 5 ? 3 : this.sector >= 3 ? 2 : 1);
        this.emit({ type: "start", text: `SECTOR ${this.sector} — PRESSURE RISING` });
        this.checkForDeadlock();
    }
    continueEndless() {
        if (this.phase !== "victory")
            return;
        this.endless = true;
        this.sector += 1;
        this.sectorLines = 0;
        this.phase = "playing";
        this.heat = 24;
        this.addGlitches(3);
        this.emit({ type: "start", text: "ENDLESS OVERCLOCK" });
    }
    addGlitches(count) {
        const empty = [];
        for (let i = 0; i < this.board.length; i += 1)
            if (!this.board[i])
                empty.push(i);
        const cells = [];
        for (let n = 0; n < count && empty.length > 0; n += 1) {
            const pick = Math.floor(this.random() * empty.length);
            const index = empty.splice(pick, 1)[0];
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;
            this.board[index] = { id: this.nextCellId++, color: 4, glitch: true };
            cells.push({ row, col, color: 4 });
        }
        if (cells.length)
            this.emit({ type: "place", cells, text: "STATIC CELLS DETECTED" });
    }
    gameOver(reason) {
        if (this.phase === "gameover")
            return;
        this.phase = "gameover";
        this.reason = reason;
        this.pulseMode = false;
        this.updateRecord();
        this.emit({ type: "gameover", text: reason });
    }
    update(dt) {
        if (this.phase !== "playing")
            return;
        const rate = TUNING.heatPerSecond + (this.sector - 1) * TUNING.heatPerSector;
        this.heat = Math.min(100, this.heat + rate * dt);
        if (this.heat >= 75 && this.warningStage === 0) {
            this.warningStage = 1;
            this.emit({ type: "warning", text: "CORE RUNNING HOT" });
        }
        if (this.heat >= 90 && this.warningStage === 1) {
            this.warningStage = 2;
            this.emit({ type: "warning", text: "OVERLOAD IMMINENT" });
        }
        if (this.heat < 70)
            this.warningStage = 0;
        if (this.heat >= 100) {
            this.gameOver("CORE OVERLOAD");
            return;
        }
        if (this.charge >= 100 && this.tutorial === 2)
            this.tutorial = 3;
        this.uiTimer -= dt;
        if (this.uiTimer <= 0) {
            this.uiTimer = 0.1;
            this.notify();
        }
    }
    snapshot() {
        return {
            phase: this.phase,
            score: this.score,
            best: this.best,
            bestSector: this.bestSector,
            sector: this.sector,
            sectorLines: this.sectorLines,
            sectorTarget: this.sectorTarget,
            heat: this.heat,
            charge: this.charge,
            combo: this.combo,
            rack: this.rack.map((piece) => piece ? { ...piece } : null),
            hold: this.hold ? { ...this.hold } : null,
            holdUsed: this.holdUsed,
            selected: this.selected,
            pulseMode: this.pulseMode,
            canPulse: this.canPulse,
            hasMove: this.hasMove,
            lines: this.lines,
            placements: this.placements,
            maxCombo: this.maxCombo,
            reason: this.reason,
            banner: this.banner,
            bannerId: this.bannerId,
            tutorial: this.tutorial,
            newBest: this.newBest,
            endless: this.endless,
        };
    }
}
