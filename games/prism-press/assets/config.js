export const INPUT_CONFIG = {
    MOUSE_SENS_X: 0.0026,
    MOUSE_SENS_Y: 0.0022,
    INVERT_X: false,
    INVERT_Y: false,
};
export const BOARD_SIZE = 7;
export const FINAL_SECTOR = 6;
export const SECTOR_TARGETS = [3, 4, 5, 6, 7, 8];
export const PALETTE = [
    { hex: "#66f7d4", value: 0x66f7d4, name: "Mint" },
    { hex: "#73a7ff", value: 0x73a7ff, name: "Ion" },
    { hex: "#c891ff", value: 0xc891ff, name: "Violet" },
    { hex: "#ffcb6b", value: 0xffcb6b, name: "Amber" },
    { hex: "#ff718b", value: 0xff718b, name: "Coral" },
    { hex: "#91ef68", value: 0x91ef68, name: "Lime" },
];
export const SHAPES = [
    { id: "dot", name: "Spark", cells: [[0, 0]], minSector: 1, weight: 0.55 },
    { id: "duo", name: "Twin", cells: [[0, 0], [0, 1]], minSector: 1, weight: 1.2 },
    { id: "tri", name: "Beam", cells: [[0, 0], [0, 1], [0, 2]], minSector: 1, weight: 1.4 },
    { id: "corner", name: "Angle", cells: [[0, 0], [1, 0], [1, 1]], minSector: 1, weight: 1.35 },
    { id: "square", name: "Quad", cells: [[0, 0], [0, 1], [1, 0], [1, 1]], minSector: 1, weight: 1.1 },
    { id: "ell", name: "Boot", cells: [[0, 0], [1, 0], [2, 0], [2, 1]], minSector: 1, weight: 1 },
    { id: "tee", name: "Fork", cells: [[0, 0], [0, 1], [0, 2], [1, 1]], minSector: 2, weight: 1 },
    { id: "zig", name: "Zag", cells: [[0, 0], [0, 1], [1, 1], [1, 2]], minSector: 2, weight: 0.9 },
    { id: "bar4", name: "Rail", cells: [[0, 0], [0, 1], [0, 2], [0, 3]], minSector: 2, weight: 0.85 },
    { id: "plus", name: "Nova", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], minSector: 3, weight: 0.55 },
    { id: "u5", name: "Cradle", cells: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], minSector: 3, weight: 0.65 },
    { id: "p5", name: "Prism", cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]], minSector: 4, weight: 0.65 },
    { id: "bar5", name: "Lance", cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], minSector: 4, weight: 0.45 },
    { id: "w5", name: "Step", cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], minSector: 5, weight: 0.45 },
];
function normalize(cells) {
    let minR = Infinity;
    let minC = Infinity;
    for (const [r, c] of cells) {
        minR = Math.min(minR, r);
        minC = Math.min(minC, c);
    }
    return cells
        .map(([r, c]) => [r - minR, c - minC])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
function key(cells) {
    return cells.map(([r, c]) => `${r}:${c}`).join("|");
}
export const ROTATIONS = Object.fromEntries(SHAPES.map((shape) => {
    const variants = [];
    const seen = new Set();
    let current = normalize(shape.cells);
    for (let i = 0; i < 4; i += 1) {
        const k = key(current);
        if (!seen.has(k)) {
            seen.add(k);
            variants.push(current);
        }
        current = normalize(current.map(([r, c]) => [c, -r]));
    }
    return [shape.id, variants];
}));
export function shapeDef(id) {
    return SHAPES.find((shape) => shape.id === id) ?? SHAPES[0];
}
export function shapeBounds(cells) {
    let rows = 0;
    let cols = 0;
    for (const [r, c] of cells) {
        rows = Math.max(rows, r + 1);
        cols = Math.max(cols, c + 1);
    }
    return { rows, cols };
}
export const TUNING = {
    startHeat: 14,
    placementHeat: 1.15,
    heatPerSecond: 0.42,
    heatPerSector: 0.105,
    clearCooling: 13,
    chargePerCell: 4,
    chargePerLine: 18,
    maxParticles: 180,
    maxParticlesLow: 72,
};
