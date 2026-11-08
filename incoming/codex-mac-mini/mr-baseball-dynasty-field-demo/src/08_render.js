/* ════════════════ SECTION §H — RENDER: 256×224 original pixel art ════════════════ */
// Honors the period constraints [K]: 256×224 logical canvas, chunky 16-color-feel
// palette (555-quantized values), discrete sprite frames, nearest-neighbor scale.
// ALL artwork below is original. Presentation reads sim state; never writes it.

const VIEW_W = 256, VIEW_H = 224;

// ── 4×5 pixel font (original glyph set) ──
const FONT = (() => {
  const raw = {
    A: [6, 9, 15, 9, 9], B: [14, 9, 14, 9, 14], C: [7, 8, 8, 8, 7], D: [14, 9, 9, 9, 14],
    E: [15, 8, 14, 8, 15], F: [15, 8, 14, 8, 8], G: [7, 8, 11, 9, 7], H: [9, 9, 15, 9, 9],
    I: [14, 4, 4, 4, 14], J: [3, 1, 1, 9, 6], K: [9, 10, 12, 10, 9], L: [8, 8, 8, 8, 15],
    M: [9, 15, 15, 9, 9], N: [9, 13, 11, 9, 9], O: [6, 9, 9, 9, 6], P: [14, 9, 14, 8, 8],
    Q: [6, 9, 9, 10, 5], R: [14, 9, 14, 10, 9], S: [7, 8, 6, 1, 14], T: [14, 4, 4, 4, 4],
    U: [9, 9, 9, 9, 6], V: [9, 9, 9, 10, 4], W: [9, 9, 15, 15, 6], X: [9, 9, 6, 9, 9],
    Y: [10, 10, 4, 4, 4], Z: [15, 1, 6, 8, 15],
    0: [6, 11, 13, 9, 6], 1: [4, 12, 4, 4, 14], 2: [14, 1, 6, 8, 15], 3: [14, 1, 6, 1, 14],
    4: [9, 9, 15, 1, 1], 5: [15, 8, 14, 1, 14], 6: [7, 8, 14, 9, 6], 7: [15, 1, 2, 4, 4],
    8: [6, 9, 6, 9, 6], 9: [6, 9, 7, 1, 14],
    ' ': [0, 0, 0, 0, 0], '.': [0, 0, 0, 0, 4], ',': [0, 0, 0, 4, 8], ':': [0, 4, 0, 4, 0],
    '!': [4, 4, 4, 0, 4], '-': [0, 0, 14, 0, 0], '/': [1, 2, 4, 4, 8], '#': [10, 15, 10, 15, 10],
    '(': [2, 4, 4, 4, 2], ')': [4, 2, 2, 2, 4], "'": [4, 4, 0, 0, 0], '+': [0, 4, 14, 4, 0], '=': [0, 14, 0, 14, 0],
    '>': [8, 12, 14, 12, 8], '<': [1, 3, 7, 3, 1], '@': [6, 9, 11, 8, 7], '?': [14, 1, 6, 0, 4],
    c: [0, 6, 8, 8, 6],
  };
  return raw;
})();
function drawText(ctx, text, x, y, color, scale) {
  scale = scale || 1;
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of String(text)) {
    const g = FONT[ch] || FONT[ch.toUpperCase()] || FONT['?'];
    for (let r = 0; r < 5; r++) {
      const bits = g[r];
      for (let c = 0; c < 4; c++) if (bits & (8 >> c)) ctx.fillRect(cx + c * scale, y + r * scale, scale, scale);
    }
    cx += 5 * scale;
  }
  return cx;
}
function drawTextShadow(ctx, text, x, y, color, scale, shadow) {
  const off = scale > 1 ? scale - 1 : 1;
  drawText(ctx, text, x + off, y + off, shadow || '#101018', scale);
  drawText(ctx, text, x, y, color, scale);
}
function textW(text, scale) { return String(text).length * 5 * (scale || 1); }
function centerText(ctx, text, y, color, scale, shadow) {
  const x = (VIEW_W - textW(text, scale)) >> 1;
  if (shadow !== false) drawTextShadow(ctx, text, x, y, color, scale, typeof shadow === 'string' ? shadow : undefined);
  else drawText(ctx, text, x, y, color, scale);
}
// ── chunky banner font [v0.3]: 4x5 glyphs upscaled 2x + 1px bold dilation (9x11 cells) ──
function drawChunk(ctx, text, x, y, color, scale) {
  scale = scale || 1;                       // [v0.6] integer scale for the call-pop treatment
  const cell = 2 * scale;
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of String(text)) {
    const g = FONT[ch] || FONT[ch.toUpperCase()] || FONT['?'];
    for (let r = 0; r < 5; r++) {
      const bits = g[r];
      for (let c = 0; c < 4; c++) if (bits & (8 >> c)) ctx.fillRect(cx + c * cell, y + r * cell, cell + scale, cell + scale);
    }
    cx += 9 * scale + 1;
  }
  return cx;
}
function chunkW(text, scale) { return String(text).length * (9 * (scale || 1) + 1); }
function centerChunk(ctx, text, y, color, shadow, scale) {
  const x = (VIEW_W - chunkW(text, scale)) >> 1;
  ctx.save();
  drawChunk(ctx, text, x + 2 * (scale || 1), y + 2 * (scale || 1), shadow || '#101018', scale);
  drawChunk(ctx, text, x, y, color, scale);
  ctx.restore();
}

// [v0.6 P2-5] the one-word umpire call set — these render at 2x with a white pop
const CALL_POP = {
  'BALL': 1, 'STRIKE!': 1, 'STRIKE THREE!': 1, 'FOUL BALL': 1,
  'OUT!': 1, 'CAUGHT!': 1, 'TAGGED OUT!': 1,
};

// ── sprite helper: string rows, palette map, integer scale ──
function drawSprite(ctx, rows, pal, x, y, flipX, scale) {
  scale = scale || 1;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const k = flipX ? row[row.length - 1 - c] : row[c];
      if (k === '.') continue;
      const col = pal[k]; if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    }
  }
}
// [v0.7 W8] inked sprite: 4-offset dark silhouette pass then the sprite on
// top — the Griffey-era black outline without touching a single sprite row
function drawSpriteOutlined(ctx, rows, pal, x, y, flipX, scale) {
  scale = scale || 1;
  ctx.fillStyle = '#14141c';
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const k = flipX ? row[row.length - 1 - c] : row[c];
      if (k === '.' || !pal[k]) continue;
      ctx.fillRect(x + c * scale - 1, y + r * scale, scale + 2, scale);
      ctx.fillRect(x + c * scale, y + r * scale - 1, scale, scale + 2);
    }
  }
  drawSprite(ctx, rows, pal, x, y, flipX, scale);
}

// ── original sprite set ──
// keys: O outline · S skin · J jersey · T trim · P pants · G glove · W white · B ball-red
const SPR = {
  batterStance: [   // plate view 26x44 — bat up, shaded [v0.3]
    '.....................NN...',
    '....................NNn...',
    '...................NNn....',
    '.........CCCCC....NNn.....',
    '........CCCCCCC..NNn......',
    '.......CCCCCCCC.NNn.......',
    '.......CCCcccCC.NNn.......',
    '.......OSSSOcc.NNn........',
    '.......OSsSSO..NNW........',
    '........OsSO...NSS........',
    '.........OO..SSSSs........',
    '.......JJJJJSSSSs.........',
    '.....JJJJJJJJSSs..........',
    '....JJJJJJJJJJS...........',
    '...JJjJJJJJJJJj...........',
    '...JjJJJJJJJJJj...........',
    '..OJjJJJJJJJJjO...........',
    '..OJjJJJJJJJJjO...........',
    '..OJjJJJJJJJjJO...........',
    '..OJjJJJJJJJjJO...........',
    '...JjJJJJJJJjJ............',
    '...JjJJJJJJJjJ............',
    '...OjJJJJJJjO.............',
    '...OJJJJJJJJO.............',
    '....TTTTTTTT..............',
    '....PPPPPPPP..............',
    '...PPPPPPPPPP.............',
    '...PPPPPPPPPP.............',
    '..PPPPPpPPPPP.............',
    '..PPPPPpPPPPPP............',
    '..PPPPp.pPPPPP............',
    '..PPPp...pPPPP............',
    '.PPPp.....pPPPP...........',
    '.PPPp.....pPPPP...........',
    '.PPp.......pPPP...........',
    '.PPp.......pPPp...........',
    'OPPp........pPPO..........',
    'OPPO........pPPO..........',
    'OPPO........OPPO..........',
    'OPPO........OPPO..........',
    'OPPO........OPPO..........',
    'OPPOO......OOPPOO.........',
    'OOOOO......OOOOOO.........',
    '..........................',
  ],
  batterStanceB: [   // waggle frame
    '......................NN..',
    '.....................NNn..',
    '....................NNn...',
    '.........CCCCC.....NNn....',
    '........CCCCCCC...NNn.....',
    '.......CCCCCCCC..NNn......',
    '.......CCCcccCC..NNn......',
    '.......OSSSOcc..NNn.......',
    '.......OSsSSO...NNW.......',
    '........OsSO...NSS........',
    '.........OO..SSSSs........',
    '.......JJJJJSSSSs.........',
    '.....JJJJJJJJSSs..........',
    '....JJJJJJJJJJS...........',
    '...JJjJJJJJJJJj...........',
    '...JjJJJJJJJJJj...........',
    '..OJjJJJJJJJJjO...........',
    '..OJjJJJJJJJJjO...........',
    '..OJjJJJJJJJjJO...........',
    '..OJjJJJJJJJjJO...........',
    '...JjJJJJJJJjJ............',
    '...JjJJJJJJJjJ............',
    '...OjJJJJJJjO.............',
    '...OJJJJJJJJO.............',
    '....TTTTTTTT..............',
    '....PPPPPPPP..............',
    '...PPPPPPPPPP.............',
    '...PPPPPPPPPP.............',
    '..PPPPPpPPPPP.............',
    '..PPPPPpPPPPPP............',
    '..PPPPp.pPPPPP............',
    '..PPPp...pPPPP............',
    '.PPPp.....pPPPP...........',
    '.PPPp.....pPPPP...........',
    '.PPp.......pPPP...........',
    '.PPp.......pPPp...........',
    'OPPp........pPPO..........',
    'OPPO........pPPO..........',
    'OPPO........OPPO..........',
    'OPPO........OPPO..........',
    'OPPO........OPPO..........',
    'OPPOO......OOPPOO.........',
    'OOOOO......OOOOOO.........',
    '..........................',
  ],
  batterSwing1: [   // mid-swing, bat extended (40 wide)
    '........................................',
    '........................................',
    '.........CCCCC..........................',
    '........CCCCCCC.........................',
    '.......CCCCCCCC.........................',
    '.......CCCcccCC.........................',
    '.......OSSSOcc..........................',
    '.......OSsSSO...........................',
    '........OsSO............................',
    '.........OO.............................',
    '.......JJJJJJ...........................',
    '.....JJJJJJJJJJ.........................',
    '....JJJJJJJJJJJJSS......................',
    '...JJjJJJJJJJJJSSs......................',
    '...JjJJJJJJJJSSs........................',
    '..OJjJJJJJJJSSWnnNNNNNNNNNNNNNNNNNNNN...',
    '..OJjJJJJJJJSSWnnNNNNNNNNNNNNNNNNNNNNN..',
    '..OJjJJJJJJJjO..........................',
    '..OJjJJJJJJjJO..........................',
    '...JjJJJJJJjJ...........................',
    '...JjJJJJJjJJ...........................',
    '...OjJJJJJjO............................',
    '...OJJJJJJJO............................',
    '....TTTTTTTT............................',
    '....PPPPPPPP............................',
    '...PPPPPPPPPP...........................',
    '...PPPPPPPPPP...........................',
    '..PPPPPpPPPPP...........................',
    '..PPPPPpPPPPPP..........................',
    '..PPPPp.pPPPPP..........................',
    '..PPPp...pPPPP..........................',
    '.PPPp.....pPPPP.........................',
    '.PPPp.....pPPPP.........................',
    '.PPp.......pPPP.........................',
    '.PPp.......pPPp.........................',
    'OPPp........pPPO........................',
    'OPPO........pPPO........................',
    'OPPO........OPPO........................',
    'OPPO........OPPO........................',
    'OPPO........OPPO........................',
    'OPPOO......OOPPOO.......................',
    'OOOOO......OOOOOO.......................',
    '........................................',
    '........................................',
  ],
  batterSwing2: [   // follow-through wrapped
    '.NN.....................................',
    '.NNn....................................',
    '..NNn...................................',
    '..NNn....CCCCC..........................',
    '...NNn..CCCCCCC.........................',
    '...NNn.CCCCCCCC.........................',
    '....NNWCCCcccCC.........................',
    '....NSSOSSSOcc..........................',
    '....SSsOSsSSO...........................',
    '.....Ss.OsSO............................',
    '.........OO.............................',
    '.......JJJJJJ...........................',
    '.....JJJJJJJJJJ.........................',
    '....JJJJJJJJJJJJ........................',
    '...JJjJJJJJJJJJj........................',
    '...JjJJJJJJJJJJj........................',
    '..OJjJJJJJJJJJjO........................',
    '..OJjJJJJJJJJjJO........................',
    '..OJjJJJJJJJjJO.........................',
    '...JjJJJJJJJjJ..........................',
    '...JjJJJJJJjJJ..........................',
    '...OjJJJJJJjO...........................',
    '...OJJJJJJJJO...........................',
    '....TTTTTTTT............................',
    '....PPPPPPPP............................',
    '...PPPPPPPPPP...........................',
    '...PPPPPPPPPP...........................',
    '..PPPPPpPPPPP...........................',
    '..PPPPPpPPPPPP..........................',
    '..PPPp..pPPPPP..........................',
    '..PPp....pPPPP..........................',
    '.PPp......pPPPP.........................',
    '.PPp......pPPPP.........................',
    '.PPp.......pPPP.........................',
    'OPPp.......pPPp.........................',
    'OPPO........pPPO........................',
    'OPPO........pPPO........................',
    'OPPO........OPPO........................',
    'OPPO........OPPO........................',
    'OPPO........OPPO........................',
    'OPPOO......OOPPOO.......................',
    'OOOOO......OOOOOO.......................',
    '........................................',
    '........................................',
  ],
  batterBunt: [   // squared around
    '..........................',
    '..........................',
    '..........................',
    '.........CCCCC............',
    '........CCCCCCC...........',
    '.......CCCCCCCC...........',
    '.......CCCcccCC...........',
    '.......OSSSOcc............',
    '.......OSsSSO.............',
    '........OsSO..............',
    '.........OO...............',
    '.......JJJJJJ.............',
    '.....JJJJJJJJJJ...........',
    '....SSJJJJJJJJJSS.........',
    '..NNNNNNNNNNNNNNNNNN......',
    '..nnNNNNNNNNNNNNNNnn......',
    '....SsJJJJJJJJJSs.........',
    '..OJjJJJJJJJJjO...........',
    '..OJjJJJJJJJjJO...........',
    '...JjJJJJJJJjJ............',
    '...JjJJJJJJJjJ............',
    '...OjJJJJJJjO.............',
    '...OJJJJJJJJO.............',
    '....TTTTTTTT..............',
    '....PPPPPPPP..............',
    '...PPPPPPPPPP.............',
    '...PPPPPPPPPP.............',
    '..PPPPPpPPPPP.............',
    '..PPPPPpPPPPP.............',
    '..PPPPp.pPPPP.............',
    '..PPPp...pPPP.............',
    '.PPPp.....pPPP............',
    '.PPPp.....pPPP............',
    '.PPp.......pPP............',
    '.PPp.......pPp............',
    'OPPp........pPO...........',
    'OPPO........pPO...........',
    'OPPO........OPO...........',
    'OPPO........OPO...........',
    'OPPO........OPO...........',
    'OPPOO......OOPOO..........',
    'OOOOO......OOOOO..........',
    '..........................',
    '..........................',
  ],
  pitcherIdle: [   // [v0.6 P2-1] plate view 26x38, faces camera — feet plant at row 35
    '.........CCCCCC...........',
    '........CCCCCCCC..........',
    '........OcCCCCcO..........',
    '........OSSSSSSO..........',
    '........OSsSSsSO..........',
    '.........OSSSSO...........',
    '..........OssO............',
    '........JJJJJJJJJ.........',
    '.......JJJJJJJJJJJ........',
    '......JJjTJJJJTJjJ........',
    '.....OJJjJJJJJJjJJO.......',
    '.....OSJjJJJJJJjJSO.......',
    '.....OGGjJJJJJJjOO........',
    '.....OGGOJJJJJJO..........',
    '......OO.JJJJJJ...........',
    '........OJJJJO............',
    '........TTTTTT............',
    '........PPPPPP............',
    '.......PPPPPPPP...........',
    '.......PPPPPPPP...........',
    '.......PPPpPPPP...........',
    '.......PPp.pPPP...........',
    '.......Pp...pPP...........',
    '......PPp...pPP...........',
    '......PPp...pPP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '....OOPPOO.OOPPOO.........',
    '....OOOOO...OOOOO.........',
    '....OOOOO...OOOOO.........',
    '..........................',
    '..........................',
  ],
  pitcherRock: [   // rock back, glove to chest
    '.........CCCCCC...........',
    '........CCCCCCCC..........',
    '........OcCCCCcO..........',
    '........OSSSSSSO..........',
    '........OSsSSsSO..........',
    '.........OSSSSO...........',
    '..........OssO............',
    '........JJJJJJJJJ.........',
    '.......JJJJJJJJJJJ........',
    '......JJjGGJJJJTJj........',
    '.....OJJGGGGJJJjJJO.......',
    '.....OSJGGGGJJJjJSO.......',
    '.....OJJjGGJJJJjJO........',
    '.....OJJOJJJJJJO..........',
    '......OO.JJJJJJ...........',
    '........OJJJJO............',
    '........TTTTTT............',
    '........PPPPPP............',
    '.......PPPPPPPP...........',
    '.......PPPPPPPP...........',
    '.......PPPpPPPP...........',
    '.......PPp.pPPP...........',
    '.......Pp...pPP...........',
    '......PPp...pPP...........',
    '......PPp...pPP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '......Pp.....pP...........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '.....OPPO...OPPO..........',
    '....OOPPOO.OOPPOO.........',
    '....OOOOO...OOOOO.........',
    '....OOOOO...OOOOO.........',
    '..........................',
    '..........................',
  ],
  pitcherKick: [   // THE leg kick — [v0.6 P2-1] knee to chest, foot hangs higher
    '.........CCCCCC...........',
    '........CCCCCCCC..........',
    '........OcCCCCcO..........',
    '........OSSSSSSO..........',
    '........OSsSSsSO..........',
    '.........OSSSSO...........',
    '..........OssO............',
    '........JJJJJJJJJ.........',
    '.......JJJJJJJJJJJ........',
    '......JJjGGJJJJTJj........',
    '.....OJJGGGGJJJjJJO.......',
    '.....OSJGGGGJJJjJSO.......',
    '.....OJJjGGJJJJjJO........',
    '.....OJJOJJJJJJO..........',
    '......OO.JJJJJJ...........',
    '....PPPPPPPPP.............',
    '....PPPPPPPPPPP...........',
    '...PPPPpPPPPPPP...........',
    '...PPPp....PPPPP..........',
    '...PPP.....PPpPP..........',
    '...OPPO....PPpPP..........',
    '...OPPO....Pp.pP..........',
    '....OOO....Pp.............',
    '....OOO....Pp.............',
    '...........Pp.............',
    '...........Pp.............',
    '...........Pp.............',
    '..........OPPO............',
    '..........OPPO............',
    '..........OPPO............',
    '..........OPPO............',
    '..........OPPO............',
    '..........OPPO............',
    '.........OOPPOO...........',
    '.........OOOOO............',
    '.........OOOOO............',
    '..........................',
    '..........................',
  ],
  pitcherStride: [   // plant + drive — cocked arm back (ball shows), glove at the target
    '.........CCCCCC...........',
    '........CCCCCCCC..........',
    '........OcCCCCcO..........',
    '..W.....OSSSSSSO..........',
    '..WS....OSsSSsSO..........',
    '..SSs....OSSSSO...........',
    '...Ss....OssO.............',
    '....SsJJJJJJJJJSSO........',
    '....JJjJJJJJJTJjSGO.......',
    '...OJJjJJJJJJjJJSGO.......',
    '...OJJjJJJJJJjJJJO........',
    '....OJjJJJJJJjJO..........',
    '.....OO.JJJJJJ............',
    '........OJJJJO............',
    '........PPPPPP............',
    '.......PPPPPPPP...........',
    '......PPPPPPPPPP..........',
    '.....PPPPOPPPPPPP.........',
    '....PPPO...OPPPPPP........',
    '...PPPO.....OPPPPPP.......',
    '..PPPO.......OPPPPPP......',
    '.PPPO.........OPPPPPP.....',
    '.OPO...........OPPpPP.....',
    'OPPO............OPpPP.....',
    'OPO..............OPpP.....',
    'OPO..............OPpP.....',
    'OOO...............OPp.....',
    '..................OPp.....',
    '..................OPp.....',
    '..................OPp.....',
    '.................OPPO.....',
    '.................OPPO.....',
    '.................OPPO.....',
    '................OOPPOO....',
    '................OOOOO.....',
    '................OOOOO.....',
    '..........................',
    '..........................',
  ],
  pitcherThrow: [   // release — arm out front, drive through the plant leg
    '.........CCCCCC...........',
    '........CCCCCCCC..........',
    '........OcCCCCcO..........',
    '........OSSSSSSO..........',
    '........OSsSSsSO..........',
    '....SS...OSSSSO...........',
    '...SSs....OssO............',
    '..OWO..JJJJJJJJJ..........',
    '..OO..JJJJJJJJJJJ.........',
    '......JJjJJJJTJjJ.........',
    '......OJJJJJJJjJO.........',
    '......OJJJJJJJjO..........',
    '......OJJJJJJOGO..........',
    '......OJJJJJOGGO..........',
    '.......JJJJJOGO...........',
    '.......OJJJJO.............',
    '......PPPPPPPPPP..........',
    '.....PPPPOPPPPPPP.........',
    '....PPPO...OPPPPPP........',
    '...PPPO.....OPPPPPP.......',
    '..PPPO.......OPPPPPP......',
    '.PPPO.........OPPPPPP.....',
    '.OPO...........OPPpPP.....',
    'OPPO............OPpPP.....',
    'OPO..............OPpP.....',
    'OPO..............OPpP.....',
    'OOO...............OPp.....',
    '..................OPp.....',
    '..................OPp.....',
    '..................OPp.....',
    '.................OPPO.....',
    '.................OPPO.....',
    '.................OPPO.....',
    '................OOPPOO....',
    '................OOOOO.....',
    '................OOOOO.....',
    '..........................',
    '..........................',
  ],
  pitcherFollow: [   // [v0.6 P2-1] follow-through — head ducked, arm swept low, trail leg up
    '..........................',
    '..........................',
    '..........CCCCCC..........',
    '.........CCCCCCCC.........',
    '.........OcCCCCcO.........',
    '.........OSSSSSSO.........',
    '.........OSsSSsSO.........',
    '..........OSSSSO..........',
    '.......JJJJJOssO..........',
    '......JJJJJJJJJJJ.........',
    '.....JJjGGJJJJTJjJ........',
    '....OJJGGGGJJJjJJO........',
    '....OSJGGGGJJJjJJO........',
    '....OJJjJJJJJJjJJSO.......',
    '....OJJO.JJJJJJjJOSO......',
    '.....OO..OJJJJJO.OSO......',
    '.......PPPPPPPP..OSO......',
    '......PPPPPPPPPP.OO.......',
    '.....PPPPPPPPPPP..........',
    '....PPPPPPPPPPPP..........',
    '...PPPPOPPPPPPPPP.........',
    '..PPPO...PPPPPPPP.........',
    '..PPp.....PPPPPPP.........',
    '..OPO......PPPPPP.........',
    '..OPO.......PPPPP.........',
    '..OOO........PPpPP........',
    '............Pp.pP.........',
    '............Pp.pP.........',
    '............Pp.pP.........',
    '............Pp.pP.........',
    '............Pp.pP.........',
    '...........OPPO...........',
    '...........OPPO...........',
    '..........OOPPOO..........',
    '..........OOOOO...........',
    '..........OOOOO...........',
    '..........................',
    '..........................',
  ],
  catcher: [   // crouch 26x24, shaded gear [v0.3]
    '.........CCCCCCC..........',
    '........CCCCCCCCC.........',
    '........CcCCCCCcC.........',
    '.........OSSSSSO..........',
    '.........OsSSSsO..........',
    '......JJJJJJJJJJJJ........',
    '....JJJJJJJJJJJJJJJJ......',
    '...JJjJJJJJJJJJJJJjJ......',
    '..OJJjJJTTJJJJTTJjJJO.....',
    '..OJJjJJJJJJJJJJJjJJO.....',
    '..OJJjJJJJJJJJJJJjJGG.....',
    '..OSJjJJJJJJJJJJJjOGG.....',
    '..OSJjJJJJJJJJJJJjOGO.....',
    '...OJjJJJJJJJJJJJjO.......',
    '...OJJjjJJJJJJjjJO........',
    '....OPPPPO..OPPPPO........',
    '....OPPPPO..OPPPPO........',
    '...OPPPPPO..OPPPPPO.......',
    '...OPPpPPO..OPPpPPO.......',
    '..OPPPpPPO..OPPpPPPO......',
    '..OPPPpPPO..OPPpPPPO......',
    '..OOOOOOO....OOOOOOO......',
    '..........................',
    '..........................',
  ],
  catcherReceive: [   // glove punched up
    '..GGG....CCCCCCC..........',
    '.GGGGG..CCCCCCCCC.........',
    '.GGGGG..CcCCCCCcC.........',
    '..OGGO...OSSSSSO..........',
    '.........OsSSSsO..........',
    '....S.JJJJJJJJJJJJ........',
    '....SSJJJJJJJJJJJJJJ......',
    '...JJjJJJJJJJJJJJJjJ......',
    '..OJJjJJTTJJJJTTJjJJO.....',
    '..OJJjJJJJJJJJJJJjJJO.....',
    '..OJJjJJJJJJJJJJJjJJO.....',
    '..OSJjJJJJJJJJJJJjJSO.....',
    '..OSJjJJJJJJJJJJJjOSO.....',
    '...OJjJJJJJJJJJJJjO.......',
    '...OJJjjJJJJJJjjJO........',
    '....OPPPPO..OPPPPO........',
    '....OPPPPO..OPPPPO........',
    '...OPPPPPO..OPPPPPO.......',
    '...OPPpPPO..OPPpPPO.......',
    '..OPPPpPPO..OPPpPPPO......',
    '..OPPPpPPO..OPPpPPPO......',
    '..OOOOOOO....OOOOOOO......',
    '..........................',
    '..........................',
  ],
  ump: [   // behind the catcher 24x22 [v0.3]
    '.........OOOOOO.........',
    '........OUUUUUUO........',
    '........OUKUUKUO........',
    '........OUUUUUUO........',
    '.........OSSSSO.........',
    '.......UUUUUUUUUU.......',
    '.....UUUUUUUUUUUUUU.....',
    '....OUUUUUUUUUUUUUUO....',
    '...OUUKUUUUUUUUUKUUO....',
    '...OUUKUUUUUUUUUKUUO....',
    '...OUUUUUUUUUUUUUUUO....',
    '...OUUUUUUUUUUUUUUUO....',
    '...OSUUUUUUUUUUUUSO.....',
    '....OUUUUUUUUUUUUO......',
    '....OUUUO....OUUUO......',
    '....OUUUO....OUUUO......',
    '...OUUUUO....OUUUUO.....',
    '...OUUUUO....OUUUUO.....',
    '..OUUUUUO....OUUUUUO....',
    '..OOOOOO......OOOOOO....',
    '........................',
    '........................',
  ],
  umpPunch: [   // STRIKE punch-out
    '.........OOOOOO.........',
    '........OUUUUUUO........',
    '........OUKUUKUO........',
    '........OUUUUUUO........',
    '.........OSSSSO....SS...',
    '.......UUUUUUUUUU.SSs...',
    '.....UUUUUUUUUUUUUUs....',
    '....OUUUUUUUUUUUUUUO....',
    '...OUUKUUUUUUUUUUUO.....',
    '...OUUKUUUUUUUUUKUUO....',
    '...OUUUUUUUUUUUUUUUO....',
    '...OUUUUUUUUUUUUUUUO....',
    '...OSUUUUUUUUUUUUSO.....',
    '....OUUUUUUUUUUUUO......',
    '....OUUUO....OUUUO......',
    '....OUUUO....OUUUO......',
    '...OUUUUO....OUUUUO.....',
    '...OUUUUO....OUUUUO.....',
    '..OUUUUUO....OUUUUUO....',
    '..OOOOOO......OOOOOO....',
    '........................',
    '........................',
  ],
  fidle: [   // FIELD SET 16x24 [v0.6 P2-2] — idle, glove at side, feet row 22
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....CCccCCCC....',
    '....OSSSSSSO....',
    '....OSsSSsSO....',
    '....OSSSSSSO....',
    '.....OSSSO......',
    '......OO........',
    '....JJJJJJJJ....',
    '...JJJJJJJJJJ...',
    '..JJJJJJJJJJJJ..',
    '..OJJJJJJJJjO...',
    '..OSJJJJJJJjSO..',
    '..GG.JJJJJjJ....',
    '..GG.OJJJjO.....',
    '.....OJJjO......',
    '.....PPPPP......',
    '....PPPPPPPP....',
    '....PPPpPPPP....',
    '....PPP..PPP....',
    '....PPp..pPP....',
    '....PPp..pPP....',
    '...OOOO..OOOO...',
    '................',
  ],
  frun1: [   // run cycle A — stride, arms/lean left
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....CCccCCCC....',
    '....OSSSSSSO....',
    '....OSsSSsSO....',
    '....OSSSSSSO....',
    '.....OSSSO......',
    '......OO........',
    '....JJJJJJJJ....',
    '...JJJJJJJJJJ...',
    '..JJJJJJJJJJJJ..',
    '.SOJJJJJJJJjJOS.',
    '.SS.JJJJJjJj.SS.',
    '.....JJJJjJ.....',
    '.....JJJJjJ.....',
    '.....OJJjO......',
    '.....PPPPP......',
    '....PPPPPPp.....',
    '...PPPPpPPp.....',
    '...PPp....pPP...',
    '..PPp......pPP..',
    '..Pp........pP..',
    '.OPO........OPO.',
    '................',
  ],
  frun2: [   // run cycle B — passing plant, lean left
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....CCccCCCC....',
    '....OSSSSSSO....',
    '....OSsSSsSO....',
    '....OSSSSSSO....',
    '.....OSSSO......',
    '......OO........',
    '....JJJJJJJJ....',
    '...JJJJJJJJJJ...',
    '..JJJJJJJJJJJJ..',
    '.SOJJJJJJJJjJOS.',
    '.SS.JJJJJjJj.SS.',
    '.....JJJJjJ.....',
    '.....JJJJjJ.....',
    '.....OJJjO......',
    '.....PPPPP......',
    '....PPPPPPPP....',
    '....PPPPpPPP....',
    '.....PPPPpP.....',
    '.....PPPp.......',
    '.....PPp........',
    '....OPPp........',
    '................',
  ],
  frun3: [   // run cycle C — stride, mirrored lean right
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....CCCCccCC....',
    '....OSSSSSSO....',
    '....OSsSSsSO....',
    '....OSSSSSSO....',
    '.....OSSSO......',
    '......OO........',
    '....JJJJJJJJ....',
    '...JJJJJJJJJJ...',
    '..JJJJJJJJJJJJ..',
    '.SOJjJJJJJJJOS..',
    '.SS.jJjJJJJJ.SS.',
    '.....JJJJjJ.....',
    '.....JJJJjJ.....',
    '.....OJJjO......',
    '.....PPPPP......',
    '.....pPPPPPP....',
    '.....pPPpPPPP...',
    '...PPp....pPP...',
    '..PPp......pPP..',
    '..Pp........pP..',
    '.OPO........OPO.',
    '................',
  ],
  frun4: [   // run cycle D — passing gather, lean right
    '.....CCCCCC.....',
    '....CCCCCCCC....',
    '....CCCCccCC....',
    '....OSSSSSSO....',
    '....OSsSSsSO....',
    '....OSSSSSSO....',
    '.....OSSSO......',
    '......OO........',
    '....JJJJJJJJ....',
    '...JJJJJJJJJJ...',
    '..JJJJJJJJJJJJ..',
    '.SOJjJJJJJJJOS..',
    '.SS.jJjJJJJJ.SS.',
    '.....JJJJjJ.....',
    '.....JJJJjJ.....',
    '.....OJJjO......',
    '.....PPPPP......',
    '....PPPPPPPP....',
    '.....PPPpPP.....',
    '....PPPp.pPP....',
    '....PPp...pP....',
    '...OPp....pPO...',
    '...OO......OO...',
    '................',
  ],
  fthrow: [   // throwing — arm cocked high, ball W visible in hand
    '.....CCCCCC.SSW.',
    '....CCCCCCCCsS..',
    '....CCccCCCCS...',
    '....OSSSSSSOJ...',
    '....OSsSSsSOJ...',
    '....OSSSSSSJJ...',
    '.....OSSSOJ.....',
    '......OOJ.......',
    '....JJJJJJJ.....',
    '...JJJJJJJJJ....',
    '..JJJJJJJJJJ....',
    '.GG.JJJJJJJj....',
    '.GG.OJJJJjO.....',
    '.GO..JJJJj......',
    '.....OJJjO......',
    '.....PPPPP......',
    '....PPPPPPP.....',
    '...PPPPPPPp.....',
    '...PPPp...pPP...',
    '..PPPp....pPP...',
    '..PPp......pP...',
    '.OPp........pO..',
    '.OO..........OO.',
    '................',
  ],
  fcatch: [   // glove overhead, arm reaching up
    '...GGGG.........',
    '..GGGGGG........',
    '..OGGgGO........',
    '...SS...........',
    '...S.CCCCCC.....',
    '...SCCCCCCCC....',
    '...SCCCccCCC....',
    '...SOSSSSSSO....',
    '...SOSsSSsSO....',
    '...SOSSSSSSO....',
    '....SOSSSO......',
    '....S.OO........',
    '....SJJJJJJJ....',
    '...SJJJJJJJJJ...',
    '...S.JJJJJjJ....',
    '....OJJJJjO.....',
    '.....JJJjJ......',
    '.....OJjO.......',
    '.....PPPPP......',
    '....PPPPPPPP....',
    '....PPPpPPP.....',
    '....PPP..PPP....',
    '...OOOO..OOOO...',
    '................',
  ],
  fdive: [   // horizontal lunge 24x12, glove leading, feet trailing
    '......................GG',
    '.....................GGG',
    '....................OGGG',
    '...................SSO..',
    '..................OCCCO.',
    '.OOOO............OSsSO..',
    'OJJJJOOOOOOOOOOOOSSO....',
    'OJJJJJJJJJJJJJJJJOsO....',
    '.OJJJJJJJJJJJjjjOO......',
    '..OPPPPPPPPPpO..........',
    '...OPPPPPpO.............',
    '........................',
  ],
  fprone: [   // face down 24x8
    '........................',
    '..OOOOOOOOOOOOOOO.......',
    '.OJJJJJJJJJJJJJJSSO.....',
    '.OJJJJJJJJJJJJjjJSSs....',
    '.OPPPPPPPPPPPpOJJO......',
    '..OPPPPPPPPPpOO.........',
    '...OOOOOOOOOOOO.........',
    '........................',
  ],
  fslide: [   // feet-first slide 22x11, feet out front
    '................CCCC..',
    '...............CCCCCC.',
    '...............OSSSSO.',
    '...............OSsSsO.',
    '............JJJJJSSO..',
    '.........JJJJJJJJJs...',
    '.....OOJJJJJJJJJjO....',
    '..OOPPPPPPJJJJJj......',
    '.OPPPPPPPPOOOO........',
    'OPPPPPPPOO............',
    '.OOOOOO...............',
  ],
  bigBatterStance: [   // v0.4 PLATE STAR 38x54 — original art, Griffey-scale
    '..............................NN......',
    '.............................NNn......',
    '............................NNn.......',
    '............................NNn.......',
    '...........................NNn........',
    '..........CCCCCC..........NNn.........',
    '........CCCCCCCCCC.......NNn..........',
    '.......CCCCCCCCCCCC.....NNn...........',
    '.......CCCCCCcccCCC.....NNn...........',
    '.......CCCCCCcccCCC....NNn............',
    '.......OSSCCCCCCCC.....NNn............',
    '.......OSsSCCCCCC.....NNW.............',
    '........OSsSSO.......NNWW.............',
    '.........OSSO.......NSSS..............',
    '..........OO......SSSSSs..............',
    '........JJJJJJ...SSSSSs...............',
    '......JJJJJJJJJJ..SSSs................',
    '.....JJJJJJJJJJJJJSSs.................',
    '....JJJJJJJJJJJJJJSs..................',
    '....JJjJJJJJJJJJJJJ...................',
    '...JJjJJJJJJJJJJJJJj..................',
    '...JjJJJJJJJJJJJJJJj..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '...JjJJJJJJJJJJJjJJ...................',
    '...JjTTJJJJJJJTTjJJ...................',
    '...OjJJJJJJJJJJJjO....................',
    '...OJJJJJJJJJJJJJO....................',
    '....TTTTTTTTTTTTT.....................',
    '....PPPPPPPPPPPPP.....................',
    '...PPPPPPPPPPPPPPP....................',
    '...PPPPPPPPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPPP...................',
    '..PPPPPPp.pPPPPPPPP...................',
    '..PPPPPp...pPPPPPPP...................',
    '.PPPPPp.....pPPPPPPP..................',
    '.PPPPp.......pPPPPPP..................',
    '.PPPp.........pPPPPP..................',
    '.PPPp.........pPPPpP..................',
    'OPPPp..........pPPpPO.................',
    'OPPPO..........pPPpPO.................',
    'OPPPO..........OPPpPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OOPPOO........OOPPPOO.................',
    'OOOOOO........OOOOOOO.................',
    '......................................',
    '......................................',
  ],
  bigBatterStanceB: [   // waggle
    '...............................NN.....',
    '..............................NNn.....',
    '..............................NNn.....',
    '.............................NNn......',
    '............................NNn.......',
    '..........CCCCCC...........NNn........',
    '........CCCCCCCCCC........NNn.........',
    '.......CCCCCCCCCCCC......NNn..........',
    '.......CCCCCCcccCCC......NNn..........',
    '.......CCCCCCcccCCC.....NNn...........',
    '.......OSSCCCCCCCC......NNn...........',
    '.......OSsSCCCCCC......NNW............',
    '........OSsSSO........NNWW............',
    '.........OSSO........NSSS.............',
    '..........OO.......SSSSSs.............',
    '........JJJJJJ....SSSSSs..............',
    '......JJJJJJJJJJ...SSSs...............',
    '.....JJJJJJJJJJJJJJSSs................',
    '....JJJJJJJJJJJJJJSs..................',
    '....JJjJJJJJJJJJJJJ...................',
    '...JJjJJJJJJJJJJJJJj..................',
    '...JjJJJJJJJJJJJJJJj..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '...JjJJJJJJJJJJJjJJ...................',
    '...JjTTJJJJJJJTTjJJ...................',
    '...OjJJJJJJJJJJJjO....................',
    '...OJJJJJJJJJJJJJO....................',
    '....TTTTTTTTTTTTT.....................',
    '....PPPPPPPPPPPPP.....................',
    '...PPPPPPPPPPPPPPP....................',
    '...PPPPPPPPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPPP...................',
    '..PPPPPPp.pPPPPPPPP...................',
    '..PPPPPp...pPPPPPPP...................',
    '.PPPPPp.....pPPPPPPP..................',
    '.PPPPp.......pPPPPPP..................',
    '.PPPp.........pPPPPP..................',
    '.PPPp.........pPPPpP..................',
    'OPPPp..........pPPpPO.................',
    'OPPPO..........pPPpPO.................',
    'OPPPO..........OPPpPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OPPPO..........OPPPPO.................',
    'OOPPOO........OOPPPOO.................',
    'OOOOOO........OOOOOOO.................',
    '......................................',
    '......................................',
  ],
  bigBatterSwing1: [   // rip through the zone (52 wide)
    '....................................................',
    '....................................................',
    '..........CCCCCC....................................',
    '........CCCCCCCCCC..................................',
    '.......CCCCCCCCCCCC.................................',
    '.......CCCCCCcccCCC.................................',
    '.......CCCCCCcccCCC.................................',
    '.......OSSCCCCCCCC..................................',
    '.......OSsSCCCCCC...................................',
    '........OSsSSO......................................',
    '.........OSSO.......................................',
    '..........OO........................................',
    '........JJJJJJ......................................',
    '......JJJJJJJJJJJJ..................................',
    '.....JJJJJJJJJJJJJJJJ...............................',
    '....JJJJJJJJJJJJJJJSSSS.............................',
    '....JJjJJJJJJJJJJJSSSSss............................',
    '...JJjJJJJJJJJJJJSSWWnnnNNNNNNNNNNNNNNNNNNNNNNNN....',
    '...JjJJJJJJJJJJJJSSWWnnnNNNNNNNNNNNNNNNNNNNNNNNNN...',
    '..OJjJJJJJJJJJJJJJSSss..............................',
    '..OJjJJJJJJJJJJJJJjO................................',
    '..OJjJJJJJJJJJJJJJjO................................',
    '..OJjJJJJJJJJJJJjJO.................................',
    '..OJjJJJJJJJJJJJjJO.................................',
    '...JjJJJJJJJJJJjJJ..................................',
    '...JjTTJJJJJJTTjJJ..................................',
    '...OjJJJJJJJJJJjO...................................',
    '...OJJJJJJJJJJJJO...................................',
    '....TTTTTTTTTTTT....................................',
    '....PPPPPPPPPPPP....................................',
    '...PPPPPPPPPPPPPP...................................',
    '...PPPPPPPPPPPPPP...................................',
    '..PPPPPPPpPPPPPPP...................................',
    '..PPPPPPPpPPPPPPPP..................................',
    '..PPPPPPp.pPPPPPPP..................................',
    '..PPPPPp...pPPPPPP..................................',
    '.PPPPPp.....pPPPPPP.................................',
    '.PPPPp.......pPPPPP.................................',
    '.PPPp.........pPPPP.................................',
    '.PPPp.........pPPpP.................................',
    'OPPPp..........pPpPO................................',
    'OPPPO..........pPpPO................................',
    'OPPPO..........OPpPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OOPPOO........OOPPOO................................',
    'OOOOOO........OOOOOO................................',
    '....................................................',
    '....................................................',
    '....................................................',
    '....................................................',
    '....................................................',
  ],
  bigBatterSwing2: [   // follow-through
    '.NN.................................................',
    '.NNn................................................',
    '..NNn...............................................',
    '..NNn...............................................',
    '...NNn..............................................',
    '...NNn....CCCCCC....................................',
    '....NNn.CCCCCCCCCC..................................',
    '....NNWCCCCCCCCCCCC.................................',
    '....NWWCCCCCCcccCCC.................................',
    '....NSSCCCCCCcccCCC.................................',
    '...SSSsOSSCCCCCCCC..................................',
    '...SSs.OSsSCCCCCC...................................',
    '....Ss..OSsSSO......................................',
    '.........OSSO.......................................',
    '..........OO........................................',
    '........JJJJJJ......................................',
    '......JJJJJJJJJJJJ..................................',
    '.....JJJJJJJJJJJJJJJ................................',
    '....JJJJJJJJJJJJJJJJ................................',
    '....JJjJJJJJJJJJJJJj................................',
    '...JJjJJJJJJJJJJJJJj................................',
    '...JjJJJJJJJJJJJJJJj................................',
    '..OJjJJJJJJJJJJJJJjO................................',
    '..OJjJJJJJJJJJJJJJjO................................',
    '..OJjJJJJJJJJJJJJjJO................................',
    '..OJjJJJJJJJJJJJJjJO................................',
    '..OJjJJJJJJJJJJJjJO.................................',
    '...JjJJJJJJJJJJjJJ..................................',
    '...JjTTJJJJJJTTjJJ..................................',
    '...OjJJJJJJJJJJjO...................................',
    '...OJJJJJJJJJJJJO...................................',
    '....TTTTTTTTTTTT....................................',
    '....PPPPPPPPPPPP....................................',
    '...PPPPPPPPPPPPPP...................................',
    '...PPPPPPPPPPPPPP...................................',
    '..PPPPPPPpPPPPPPP...................................',
    '..PPPPPPPpPPPPPPPP..................................',
    '..PPPPPp..pPPPPPPP..................................',
    '..PPPp.....pPPPPPP..................................',
    '.PPPp.......pPPPPPP.................................',
    '.PPPp........pPPPPP.................................',
    '.PPPp.........pPPPP.................................',
    '.PPPp.........pPPpP.................................',
    'OPPPp..........pPpPO................................',
    'OPPPO..........pPpPO................................',
    'OPPPO..........OPpPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OPPPO..........OPPPO................................',
    'OOPPOO........OOPPOO................................',
    'OOOOOO........OOOOOO................................',
    '....................................................',
    '....................................................',
  ],
  bigBatterBunt: [   // squared
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '..........CCCCCC......................',
    '........CCCCCCCCCC....................',
    '.......CCCCCCCCCCCC...................',
    '.......CCCCCCcccCCC...................',
    '.......CCCCCCcccCCC...................',
    '.......OSSCCCCCCCC....................',
    '.......OSsSCCCCCC.....................',
    '........OSsSSO........................',
    '.........OSSO.........................',
    '..........OO..........................',
    '........JJJJJJ........................',
    '......JJJJJJJJJJJJ....................',
    '.....SSJJJJJJJJJJJSS..................',
    '....SSsJJJJJJJJJJJSSs.................',
    '..NNNNNNNNNNNNNNNNNNNNNNNN............',
    '..nnnNNNNNNNNNNNNNNNNNnnnn............',
    '.....SsJJJJJJJJJJJSs..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJJjO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '..OJjJJJJJJJJJJJJjJO..................',
    '...JjJJJJJJJJJJJjJJ...................',
    '...JjTTJJJJJJJTTjJJ...................',
    '...OjJJJJJJJJJJJjO....................',
    '...OJJJJJJJJJJJJJO....................',
    '....TTTTTTTTTTTTT.....................',
    '....PPPPPPPPPPPPP.....................',
    '...PPPPPPPPPPPPPPP....................',
    '...PPPPPPPPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPP....................',
    '..PPPPPPPpPPPPPPPP....................',
    '..PPPPPPp.pPPPPPPP....................',
    '..PPPPPp...pPPPPPP....................',
    '.PPPPPp.....pPPPPP....................',
    '.PPPPp.......pPPPP....................',
    '.PPPp.........pPPP....................',
    '.PPPp.........pPpP....................',
    'OPPPp..........pPPO...................',
    'OPPPO..........pPPO...................',
    'OPPPO..........OPPO...................',
    'OPPPO..........OPPO...................',
    'OPPPO..........OPPO...................',
    'OOPPOO........OOPPOO..................',
    'OOOOOO........OOOOOO..................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
  ],
  catcherBack: [   // [v0.7 W9] crouched catcher from behind, 30x32 — helmet,
    // chest protector, raised mitt; wide shin-guard squat, feet at last rows
    '..GGGG........................',
    '.GGGGGG.......................',
    '.GGgGGG...CCCCCCCCCC..........',
    '.GGGGgG..CCCCCCCCCCCC.........',
    '..GGGG...CCCCCCCCCCCCC........',
    '...GG....CCcccCCCCCCCC........',
    '.........CCcccCCCCCCCC........',
    '.........CCCCCCCCCCCC.........',
    '..........CCCCCCCCCC..........',
    '.......JJJJJJJJJJJJJJJJ.......',
    '.....JJJJJJJJJJJJJJJJJJJJ.....',
    '....JJJJTTTTTTTTTTTTTTJJJJ....',
    '....JJJTTtttTTTTTTtttTTJJJJ...',
    '....JJJTTtttTTTTTTtttTTJJJJ...',
    '....JjJTTTTTTTTTTTTTTTTJJjJ...',
    '....JjJTTTTTTTTTTTTTTTTJJjJ...',
    '....JjJ.TTTTTtttTTTTTT.JJjJ...',
    '....JJJ.TTTTTtttTTTTTT.JJJJ...',
    '.....J..TTTTTTTTTTTTTT..JJ....',
    '........TTTTTTTTTTTTTT........',
    '.......PPPPPPPPPPPPPPPP.......',
    '......PPPPPPPPPPPPPPPPPP......',
    '.....PPPPPpPPPPPPPPpPPPPP.....',
    '....PPPPPp..PPPPPP..pPPPPP....',
    '...TPPPPp...PPPPPP...pPPPPT...',
    '...TTPPp....pPPPPp....pPPTT...',
    '...TTPp.....pPPPPp.....pPTT...',
    '...TTP......pPPPPp......PTT...',
    '...TTT......pPPPPp......TTT...',
    '...TTT......pPPPPp......TTT...',
    '..OTTTO.....pPPPPp.....OTTTO..',
    '..OOOOO....OOOOOOOO....OOOOO..',
  ],
  umpire: [   // [v0.7 W9] home-plate ump, 18x20 — dark slate, mask grille;
    // hunched over the catcher's shoulder, lower body occluded by the catcher
    '......UUUUUU......',
    '.....UUUUUUUU.....',
    '....UUUUUUUUUU....',
    '....UMMMMMMMMU....',
    '....UMmMmMmMMU....',
    '....UMMMMMMMMU....',
    '.....MMMMMMMM.....',
    '....UUUUUUUUUU....',
    '..UUUUUUUUUUUUUU..',
    '.UUUUUUUUUUUUUUUU.',
    'UUUUUUUUUUUUUUUUUU',
    'UUUuUUUUUUUUUUuUUU',
    'UUUuUUUUUUUUUUuUUU',
    'UUuUUUUUUUUUUUUuUU',
    'UUuUUUUUUUUUUUUuUU',
    '.UuUUUUUUUUUUUUu..',
    '.UUUUUUUUUUUUUUU..',
    '.UUUUUUUUUUUUUUU..',
    '..UUUUUUUUUUUUU...',
    '..UUUUUUUUUUUUU...',
  ],
  goatStance: [   // v0.5 GOAT batter 44x70, [v0.7 W9] helmet enlarged (tool-assisted surgery)
    '....................................NNN.....',
    '...................................NNNn.....',
    '..................................NNNn......',
    '.................................NNNn.......',
    '................................NNNn........',
    '...............................NNNn.........',
    '............CCCCCCC...........NNNn..........',
    '..........CCCCCCCCCCC........NNNn...........',
    '.........CCCCCCCCCCCCC.......NNNn...........',
    '........CCCCCCCCCCCCCCC.....NNNn............',
    '.......CCCCCCCCCCCCCCCC....NNNn.............',
    '.......CCCCCCCCCCCCCCCC...NNNn..............',
    '.......CCCCCCCCCcccCCCC...NNNn..............',
    '.......CCCCCCCCCcccCCCC..NNNn...............',
    '.........OSSCCCCCCCCCC...NNNn...............',
    '.........OSsSCCCCCCCCC..NNWW................',
    '.........OSsSSCCCCCCC...NWWW................',
    '..........OSsSSOO......NSSSS................',
    '...........OSSSO......NSSSSs................',
    '............OSO......SSSSSs.................',
    '............JJJJ....SSSSSs..................',
    '..........JJJJJJJJ..SSSSs...................',
    '........JJJJJJJJJJJJSSSs....................',
    '.......JJJJJJJJJJJJJSSs.....................',
    '......JJJJJJJJJJJJJJSs......................',
    '......JJjJJJJJJJJJJJJ.......................',
    '.....JJjJJJJJJJJJJJJJj......................',
    '.....JjJJJJJJJJJJJJJJj......................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '.....JjJJJJJJJJJJJJjJJ......................',
    '.....JjTTTJJJJJJJTTTjJ......................',
    '.....OjJJJJJJJJJJJJJjO......................',
    '.....OJJJJJJJJJJJJJJJO......................',
    '......TTTTTTTTTTTTTTT.......................',
    '......PPPPPPPPPPPPPPP.......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPPP.....................',
    '....PPPPPPPPp.pPPPPPPPP.....................',
    '....PPPPPPPp...pPPPPPPP.....................',
    '...PPPPPPPp.....pPPPPPPP....................',
    '...PPPPPPp.......pPPPPPP....................',
    '...PPPPPp.........pPPPPP....................',
    '...PPPPp...........pPPPP....................',
    '..PPPPPp...........pPPPPP...................',
    '..PPPPp.............pPPPP...................',
    '..PPPp..............pPPPP...................',
    '..PPPp..............pPPpP...................',
    '.OPPPp..............pPPpPO..................',
    '.OPPPO..............pPPpPO..................',
    '.OPPPO..............OPPpPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    'OOPPPOO............OOPPPPOO.................',
    'OOOOOOO............OOOOOOOO.................',
    '............................................',
    '............................................',
    '............................................',
  ],
  goatStanceB: [
    '......................................NN....',
    '.....................................NNNn...',
    '.....................................NNn....',
    '....................................NNn.....',
    '...................................NNNn.....',
    '..................................NNNn......',
    '............CCCCCCC..............NNNn.......',
    '..........CCCCCCCCCCC...........NNNn........',
    '.........CCCCCCCCCCCCC.........NNNn.........',
    '........CCCCCCCCCCCCCCC.......NNNn..........',
    '.......CCCCCCCCCCCCCCCC......NNNn...........',
    '.......CCCCCCCCCCCCCCCC.....NNNn............',
    '.......CCCCCCCCCcccCCCC....NNNn.............',
    '.......CCCCCCCCCcccCCCC...NNNn..............',
    '.........OSSCCCCCCCCCC....NNNn..............',
    '.........OSsSCCCCCCCCC...NNWW...............',
    '.........OSsSSCCCCCCC....NWWW...............',
    '..........OSsSSOO.......NSSSS...............',
    '...........OSSSO.......NSSSSs...............',
    '............OSO.......SSSSSs................',
    '............JJJJ.....SSSSSs.................',
    '..........JJJJJJJJ...SSSSs..................',
    '........JJJJJJJJJJJJ.SSSs...................',
    '.......JJJJJJJJJJJJJSSSs....................',
    '......JJJJJJJJJJJJJJSs......................',
    '......JJjJJJJJJJJJJJJ.......................',
    '.....JJjJJJJJJJJJJJJJj......................',
    '.....JjJJJJJJJJJJJJJJj......................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '.....JjJJJJJJJJJJJJjJJ......................',
    '.....JjTTTJJJJJJJTTTjJ......................',
    '.....OjJJJJJJJJJJJJJjO......................',
    '.....OJJJJJJJJJJJJJJJO......................',
    '......TTTTTTTTTTTTTTT.......................',
    '......PPPPPPPPPPPPPPP.......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPPP.....................',
    '....PPPPPPPPp.pPPPPPPPP.....................',
    '....PPPPPPPp...pPPPPPPP.....................',
    '...PPPPPPPp.....pPPPPPPP....................',
    '...PPPPPPp.......pPPPPPP....................',
    '...PPPPPp.........pPPPPP....................',
    '...PPPPp...........pPPPP....................',
    '..PPPPPp...........pPPPPP...................',
    '..PPPPp.............pPPPP...................',
    '..PPPp..............pPPPP...................',
    '..PPPp..............pPPpP...................',
    '.OPPPp..............pPPpPO..................',
    '.OPPPO..............pPPpPO..................',
    '.OPPPO..............OPPpPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    'OOPPPOO............OOPPPPOO.................',
    'OOOOOOO............OOOOOOOO.................',
    '............................................',
    '............................................',
    '............................................',
  ],
  goatStanceC: [   // [v0.7 W10] waggle dip — bat-arm cluster sheared +2 around the grip (tool-derived from B)
    '............................................',
    '........................................NN..',
    '.......................................NNNn.',
    '.......................................NNn..',
    '......................................NNn...',
    '.....................................NNNn...',
    '............CCCCCCC.................NNNn....',
    '..........CCCCCCCCCCC..............NNNn.....',
    '.........CCCCCCCCCCCCC...........NNNn.......',
    '........CCCCCCCCCCCCCCC.........NNNn........',
    '.......CCCCCCCCCCCCCCCC.......NNNNn.........',
    '.......CCCCCCCCCCCCCCCC......NNNn...........',
    '.......CCCCCCCCCcccCCCC.....NNNn............',
    '.......CCCCCCCCCcccCCCC....NNNn.............',
    '.........OSSCCCCCCCCCC.....NNNn.............',
    '.........OSsSCCCCCCCCC...NNWW...............',
    '.........OSsSSCCCCCCC....NWWW...............',
    '..........OSsSSOO.......NSSSS...............',
    '...........OSSSO.......NSSSSs...............',
    '............OSO.......SSSSSs................',
    '............JJJJ.....SSSSSs.................',
    '..........JJJJJJJJ...SSSSs..................',
    '........JJJJJJJJJJJJ.SSSs...................',
    '.......JJJJJJJJJJJJJSSSs....................',
    '......JJJJJJJJJJJJJJSs......................',
    '......JJjJJJJJJJJJJJJ.......................',
    '.....JJjJJJJJJJJJJJJJj......................',
    '.....JjJJJJJJJJJJJJJJj......................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '.....JjJJJJJJJJJJJJjJJ......................',
    '.....JjTTTJJJJJJJTTTjJ......................',
    '.....OjJJJJJJJJJJJJJjO......................',
    '.....OJJJJJJJJJJJJJJJO......................',
    '......TTTTTTTTTTTTTTT.......................',
    '......PPPPPPPPPPPPPPP.......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPPP.....................',
    '....PPPPPPPPp.pPPPPPPPP.....................',
    '....PPPPPPPp...pPPPPPPP.....................',
    '...PPPPPPPp.....pPPPPPPP....................',
    '...PPPPPPp.......pPPPPPP....................',
    '...PPPPPp.........pPPPPP....................',
    '...PPPPp...........pPPPP....................',
    '..PPPPPp...........pPPPPP...................',
    '..PPPPp.............pPPPP...................',
    '..PPPp..............pPPPP...................',
    '..PPPp..............pPPpP...................',
    '.OPPPp..............pPPpPO..................',
    '.OPPPO..............pPPpPO..................',
    '.OPPPO..............OPPpPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPTO..............OTPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    '.OPPPO..............OPPPPO..................',
    'OOPPPOO............OOPPPPOO.................',
    'OOOOOOO............OOOOOOOO.................',
    '............................................',
    '............................................',
    '............................................',
  ],
  goatStride: [
    '..................................NNN.......',
    '.................................NNNn.......',
    '................................NNNn........',
    '...............................NNNn.........',
    '..............................NNNn..........',
    '.............................NNNn...........',
    '............CCCCCCC.........NNNn............',
    '..........CCCCCCCCCCC......NNNn.............',
    '.........CCCCCCCCCCCCC.....NNNn.............',
    '........CCCCCCCCCCCCCCC...NNNn..............',
    '.......CCCCCCCCCCCCCCCC..NNNn...............',
    '.......CCCCCCCCCCCCCCCC.NNNn................',
    '.......CCCCCCCCCcccCCCC.NNNn................',
    '.......CCCCCCCCCcccCCCCNNNn.................',
    '.........OSSCCCCCCCCCC.NNNn.................',
    '.........OSsSCCCCCCCCCNNWW..................',
    '.........OSsSSCCCCCCC.NWWW..................',
    '..........OSsSSOO....NSSSS..................',
    '...........OSSSO....NSSSSs..................',
    '............OSO....SSSSSs...................',
    '............JJJJ..SSSSSs....................',
    '..........JJJJJJJJSSSSs.....................',
    '........JJJJJJJJJJSSSs......................',
    '.......JJJJJJJJJJJSSs.......................',
    '......JJJJJJJJJJJJSs........................',
    '......JJjJJJJJJJJJJJJ.......................',
    '.....JJjJJJJJJJJJJJJJj......................',
    '.....JjJJJJJJJJJJJJJJj......................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '.....JjJJJJJJJJJJJJjJJ......................',
    '.....JjTTTJJJJJJJTTTjJ......................',
    '.....OjJJJJJJJJJJJJJjO......................',
    '.....OJJJJJJJJJJJJJJJO......................',
    '......TTTTTTTTTTTTTTT.......................',
    '......PPPPPPPPPPPPPPP.......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '.....PPPPPPPPPPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPP......................',
    '....PPPPPPPPPpPPPPPPPPP.....................',
    '....PPPPPPPPp.pPPPPPPPP.....................',
    '....PPPPPPPp..pPPPPPPP......................',
    '...PPPPPPPp...pPPPPPPPPP....................',
    '...PPPPPPp.....PPPPPPPPPP...................',
    '...PPPPPp.......PPPPPPPPPP..................',
    '...PPPPp.........PPPPPPPPPp.................',
    '..PPPPPp..........PPPPPPPPp.................',
    '..PPPPp............PPPPPPp..................',
    '..PPPp.............OPPPPO...................',
    '..PPPp.............OPPpO....................',
    '.OPPPp.............OPpPO....................',
    '.OPPPO.............OPpO.....................',
    '.OPPPO.............OPpO.....................',
    '.OPPPO.............OPPO.....................',
    '.OPPPO.............OPPO.....................',
    '.OPPTO..............OO......................',
    '.OPPTO......................................',
    '.OPPPO......................................',
    '.OPPPO......................................',
    '.OPPPO......................................',
    '.OPPPO......................................',
    'OOPPPOO.....................................',
    'OOOOOOO.....................................',
    '............................................',
    '............................................',
    '............................................',
  ],
  goatSwing1: [
    '....................................................................',
    '............CCCCCCC.................................................',
    '..........CCCCCCCCCCC...............................................',
    '.........CCCCCCCCCCCCC..............................................',
    '........CCCCCCCCCCCCCCC.............................................',
    '.......CCCCCCCCCCCCCCCC.............................................',
    '.......CCCCCCCCCCCCCCCC.............................................',
    '.......CCCCCCCCCcccCCCC.............................................',
    '.......CCCCCCCCCcccCCCC.............................................',
    '.........OSSCCCCCCCCCC..............................................',
    '.........OSsSCCCCCCCCC..............................................',
    '.........OSsSSCCCCCCC...............................................',
    '..........OSsSSOO...................................................',
    '...........OSSSO....................................................',
    '............OSO.....................................................',
    '............JJJJ....................................................',
    '..........JJJJJJJJJJ................................................',
    '........JJJJJJJJJJJJJJJ.............................................',
    '.......JJJJJJJJJJJJJJJJJJ...........................................',
    '......JJJJJJJJJJJJJJJJSSSS..........................................',
    '......JJjJJJJJJJJJJJJSSSSss.........................................',
    '.....JJjJJJJJJJJJJJJSSWWWnnnNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN......',
    '.....JjJJJJJJJJJJJJJSSWWWnnnNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN.....',
    '....OJjJJJJJJJJJJJJJSSWWnnnNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN......',
    '....OJjJJJJJJJJJJJJJJSSss...........................................',
    '....OJjJJJJJJJJJJJJJJjO.............................................',
    '....OJjJJJJJJJJJJJJJjJO.............................................',
    '....OJjJJJJJJJJJJJJJjJO.............................................',
    '....OJjJJJJJJJJJJJJjJO..............................................',
    '.....JjJJJJJJJJJJJjJJ...............................................',
    '.....JjTTTJJJJJTTTjJJ...............................................',
    '.....OjJJJJJJJJJJJjO................................................',
    '.....OJJJJJJJJJJJJJO................................................',
    '......TTTTTTTTTTTTT.................................................',
    '......PPPPPPPPPPPPP.................................................',
    '.....PPPPPPPPPPPPPPP................................................',
    '.....PPPPPPPPPPPPPPP................................................',
    '....PPPPPPPPPpPPPPPP................................................',
    '....PPPPPPPPPpPPPPPPP...............................................',
    '....PPPPPPPPp.pPPPPPP...............................................',
    '....PPPPPPPp...pPPPPP...............................................',
    '...PPPPPPPp.....pPPPPP..............................................',
    '...PPPPPPp.......pPPPP..............................................',
    '...PPPPPp.........pPPP..............................................',
    '...PPPPp...........pPPP.............................................',
    '..PPPPPp...........pPPPP............................................',
    '..PPPPp.............pPPP............................................',
    '..PPPp..............pPPP............................................',
    '..PPPp..............pPpP............................................',
    '.OPPPp..............pPpPO...........................................',
    '.OPPPO..............pPpPO...........................................',
    '.OPPPO..............OPpPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    '.OPPTO..............OTPPO...........................................',
    '.OPPTO..............OTPPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    '.OPPPO..............OPPPO...........................................',
    'OOPPPOO............OOPPPOO..........................................',
    'OOOOOOO............OOOOOOO..........................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
  ],
  goatSwing2: [
    '..NN................................................................',
    '..NNn...............................................................',
    '...NNn..............................................................',
    '...NNNn.............................................................',
    '....NNNn............................................................',
    '.....NNNn...CCCCCCC.................................................',
    '.....NNNn.CCCCCCCCCCC...............................................',
    '......NNNnCCCCCCCCCCCC..............................................',
    '......NNWWCCCCCCCCCCCCC.............................................',
    '.......NWWCCCCCCCCCCCCC.............................................',
    '.......NSSSCCCCCCCCCCCC.............................................',
    '......SSSSsCCCCCcccCCCC.............................................',
    '.....SSSSsCCCCCCcccCCCC.............................................',
    '.....SSSs..OSSCCCCCCCC..............................................',
    '......Ss...OSsSCCCCCCC..............................................',
    '...........OSsSSCCCCC...............................................',
    '............OSsSSO..................................................',
    '.............OSSSO..................................................',
    '..............OSO...................................................',
    '............JJJJJ...................................................',
    '..........JJJJJJJJJJ................................................',
    '........JJJJJJJJJJJJJJ..............................................',
    '.......JJJJJJJJJJJJJJJJ.............................................',
    '......JJJJJJJJJJJJJJJJJ.............................................',
    '......JJjJJJJJJJJJJJJJj.............................................',
    '.....JJjJJJJJJJJJJJJJJj.............................................',
    '.....JjJJJJJJJJJJJJJJJj.............................................',
    '....OJjJJJJJJJJJJJJJJjO.............................................',
    '....OJjJJJJJJJJJJJJJJjO.............................................',
    '....OJjJJJJJJJJJJJJJjJO.............................................',
    '....OJjJJJJJJJJJJJJJjJO.............................................',
    '....OJjJJJJJJJJJJJJjJO..............................................',
    '.....JjJJJJJJJJJJJjJJ...............................................',
    '.....JjTTTJJJJJTTTjJJ...............................................',
    '.....OjJJJJJJJJJJJjO................................................',
    '.....OJJJJJJJJJJJJJO................................................',
    '......TTTTTTTTTTTTT.................................................',
    '......PPPPPPPPPPPPP.................................................',
    '.....PPPPPPPPPPPPPPP................................................',
    '.....PPPPPPPPPPPPPPP................................................',
    '....PPPPPPPPPpPPPPPP................................................',
    '....PPPPPPPPPpPPPPPPP...............................................',
    '....PPPPPPPp..pPPPPPP...............................................',
    '....PPPPPp.....pPPPPP...............................................',
    '...PPPPPp.......pPPPPP..............................................',
    '...PPPPp.........pPPPP..............................................',
    '...PPPp...........pPPP..............................................',
    '...PPPp...........pPPP..............................................',
    '..PPPPp...........pPPPP.............................................',
    '..PPPp.............pPPP.............................................',
    '..PPPp.............pPPP.............................................',
    '..PPPp.............pPpP.............................................',
    '.OPPPp.............pPpPO............................................',
    '.OPPPO.............pPpPO............................................',
    '.OPPPO.............OPpPO............................................',
    '.OPPPO.............OPPPO............................................',
    '.OPPPO.............OPPPO............................................',
    '.OPPTO.............OTPPO............................................',
    '.OPPTO.............OTPPO............................................',
    '.OPPPO.............OPPPO............................................',
    '.OPPPO.............OPPPO............................................',
    '.OPPPO.............OPPPO............................................',
    '.OPPPO.............OPPPO............................................',
    'OOPPPOO...........OOPPPOO...........................................',
    'OOOOOOO...........OOOOOOO...........................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
    '....................................................................',
  ],
  goatBunt: [
    '............................................',
    '............................................',
    '............................................',
    '............................................',
    '............CCCCCCC.........................',
    '..........CCCCCCCCCCC.......................',
    '.........CCCCCCCCCCCCC......................',
    '........CCCCCCCCCCCCCCC.....................',
    '.......CCCCCCCCCCCCCCCC.....................',
    '.......CCCCCCCCCCCCCCCC.....................',
    '.......CCCCCCCCCcccCCCC.....................',
    '.......CCCCCCCCCcccCCCC.....................',
    '.........OSSCCCCCCCCCC......................',
    '.........OSsSCCCCCCCCC......................',
    '.........OSsSSCCCCCCC.......................',
    '..........OSsSSOO...........................',
    '...........OSSSO............................',
    '............OSO.............................',
    '............JJJJ............................',
    '..........JJJJJJJJJJ........................',
    '........JJJJJJJJJJJJJJ......................',
    '......SSSJJJJJJJJJJJJJSSS...................',
    '.....SSSsJJJJJJJJJJJJJSSSs..................',
    '...NNNNNNNNNNNNNNNNNNNNNNNNNNNN.............',
    '...nnnnNNNNNNNNNNNNNNNNNNNnnnnn.............',
    '......SsJJJJJJJJJJJJJSs.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJJjO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJJjJO.....................',
    '....OJjJJJJJJJJJJJJjJO......................',
    '.....JjJJJJJJJJJJJjJJ.......................',
    '.....JjTTTJJJJJTTTjJJ.......................',
    '.....OjJJJJJJJJJJJjO........................',
    '.....OJJJJJJJJJJJJJO........................',
    '......TTTTTTTTTTTTT.........................',
    '......PPPPPPPPPPPPP.........................',
    '.....PPPPPPPPPPPPPPP........................',
    '.....PPPPPPPPPPPPPPP........................',
    '....PPPPPPPPPpPPPPPP........................',
    '....PPPPPPPPPpPPPPPP........................',
    '....PPPPPPPPp.pPPPPP........................',
    '....PPPPPPPp...pPPPP........................',
    '...PPPPPPPp.....pPPPP.......................',
    '...PPPPPPp.......pPPP.......................',
    '...PPPPPp.........pPP.......................',
    '...PPPPp...........pPP......................',
    '..PPPPPp...........pPPP.....................',
    '..PPPPp.............pPP.....................',
    '..PPPp..............pPP.....................',
    '..PPPp..............pPp.....................',
    '.OPPPp..............pPpO....................',
    '.OPPPO..............pPpO....................',
    '.OPPPO..............OPpO....................',
    '.OPPPO..............OPPO....................',
    '.OPPPO..............OPPO....................',
    '.OPPTO..............OTPO....................',
    '.OPPTO..............OTPO....................',
    '.OPPPO..............OPPO....................',
    '.OPPPO..............OPPO....................',
    '.OPPPO..............OPPO....................',
    '.OPPPO..............OPPO....................',
    'OOPPPOO............OOPPOO...................',
    'OOOOOOO............OOOOOO...................',
    '............................................',
    '............................................',
    '............................................',
    '............................................',
    '............................................',
    '............................................',
    '............................................',
  ],
  // tiny 8x12 staging figures (plate-view distant infielders/runners)
  runner1: [        // tiny field figure (8×12), legs A
    '..OOO...',
    '.OJJJO..',
    '..OSO...',
    '.OJJJO..',
    'OJJJJJO.',
    'OSJJJSO.',
    '.OJJJO..',
    '.OPPPO..',
    '.OP.PO..',
    'OP...PO.',
    'OP....O.',
    'O.......',
  ],
  runner2: [        // legs B
    '..OOO...',
    '.OJJJO..',
    '..OSO...',
    '.OJJJO..',
    'OJJJJJO.',
    'OSJJJSO.',
    '.OJJJO..',
    '.OPPPO..',
    '.OPPO...',
    '..OPPO..',
    '.OP..PO.',
    '.O....O.',
  ],
  runner3: [        // run cycle C (stretch)
    '..OOO...',
    '.OJJJO..',
    '..OSO...',
    '.OJJJO..',
    'OJJJJJO.',
    'OSJJJSO.',
    '.OJJJO..',
    '.OPPPO..',
    'OP..PPO.',
    'OP...PO.',
    'O.....O.',
    '........',
  ],
  runner4: [        // run cycle D (gather)
    '..OOO...',
    '.OJJJO..',
    '..OSO...',
    '.OJJJO..',
    'OJJJJJO.',
    'OSJJJSO.',
    '.OJJJO..',
    '.OPPPO..',
    '..OPO...',
    '.OPPPO..',
    '.OP.PO..',
    '.O..O...',
  ],
  fielderIdle: [    // tiny, glove out
    '..OOO...',
    '.OJJJO..',
    '..OSO...',
    '.OJJJOG.',
    'OJJJJOGO',
    'OSJJJOO.',
    '.OJJJO..',
    '.OPPPO..',
    '.OP.PO..',
    '.OP.PO..',
    '.OP.PO..',
    '.OO.OO..',
  ],
  fielderCatch: [   // glove reaching up
    '...GG...',
    '..OGGO..',
    '..OJO...',
    '.OJJJO..',
    '..OSO...',
    'OJJJJJO.',
    'OSJJJJO.',
    '.OJJJO..',
    '.OPPPO..',
    '.OP.PO..',
    '.OP.PO..',
    '.OO.OO..',
  ],
  dive: [           // horizontal layout (14×7)
    '..........GG..',
    '.OOOOOOOOOGGO.',
    'OJJJJJJJSSOO..',
    'OJJJJJJJSSO...',
    'OPPPPPPOJJO...',
    '.OOPPPPOOO....',
    '...OOOO.......',
  ],
  prone: [          // face down, recovering (14×5)
    '..............',
    '.OOOOOOOOOO...',
    'OJJJJJJJJSSO..',
    'OPPPPPPJJJSO..',
    '.OOOOOOOOOO...',
  ],
  slide: [          // runner sliding feet-first (14×6)
    '..........OO..',
    '......OOOOJJO.',
    '.OOOOOJJJJSSO.',
    'OPPPPPJJJJJO..',
    'OPPPPOOOOOO...',
    '.OOOO.........',
  ],
};

function shade(hex, f) {   // render-only shade helper (Q: darken toward black)
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function teamPal(team, alt) {
  const J = team.colors.main, T = team.colors.trim;
  const S = alt ? team.colors.skinB : team.colors.skinA;
  const P = alt ? '#b9b9c4' : '#ece8dc';
  return {
    O: '#14141c', S, s: shade(S, 0.72),
    J, j: shade(J, 0.66), T, t: shade(T, 0.7),
    P, p: shade(P, 0.66),
    G: '#7a4f28', g: '#5e3c1e', C: T, c: shade(T, 0.62),
    N: '#d8b878', n: '#a8884a', W: '#f4f4ee', B: '#d04030',
  };
}
// [v0.7 W9] the home-plate umpire's palette — neutral dark slate + mask
// grille, deliberately team-free
const UMP_PAL = { U: '#3a3a46', u: '#2a2a34', M: '#9a9aa4', m: '#6a6a76', O: '#14141c' };
// [v0.7 W8] the batter wears home whites, Griffey-style: cream jersey/pants
// pop off the dirt; team identity carries in helmet, chest trim, belt,
// stirrups and wristbands (C/T chars). Skin/bat/outline unchanged.
function goatPal(team, alt) {
  const p = teamPal(team, alt);
  const M = team.colors.main;
  return Object.assign({}, p, {
    J: '#ece8dc', j: '#c9c5b4',
    P: '#e6e2d4', p: '#c2beae',
    T: M, t: shade(M, 0.7), C: M, c: shade(M, 0.62),
  });
}


// ── palette (555-feel, original) ──
const PAL = {
  skyTop: '#0e1c40', sky: '#28448c', stands1: '#3a3a4c', stands2: '#2e2e40',
  crowdDots: ['#c8b090', '#8898b8', '#b87878', '#88b088', '#d8d0a8', '#7878a8'],
  grassA: '#46a13c', grassB: '#399030', grassDark: '#2f7c2c',   // [v0.7 W8] kelly-green daylight (was v0.5 sunshine)
  dirt: '#cf9f70', dirtDark: '#b18a58',   // [v0.7 W8] sunlit tan (was v0.5 warm tan)
  line: '#f0ece0', base: '#f4f4ee',       // [v0.6 FIX] chalk + bags — were swallowed by a trailing comment, undefined since v0.5
  wall: '#1c4c78', wallTop: '#dfe86c', track: '#a4784c',
  hudBg: 'rgba(10,10,24,0.82)', hudText: '#f0f0e4', hudDim: '#9aa0b8',
  night: '#0a0a18',
};

/* ── ball with discrete height bands [PROVEN mechanic: no smooth scaling] ── */
function ballBandRadius(zInt) {
  if (zInt < 24) return 2;
  if (zInt < 48) return 3;
  if (zInt < 88) return 4;
  if (zInt < 136) return 5;
  return 6;
}
function drawBall(ctx, sx, sy, r) {
  ctx.fillStyle = '#14141c'; ctx.fillRect(sx - r, sy - r + 1, r * 2, r * 2 - 1); ctx.fillRect(sx - r + 1, sy - r, r * 2 - 1, r * 2);
  ctx.fillStyle = '#f8f8f2'; ctx.fillRect(sx - r + 1, sy - r + 1, r * 2 - 2, r * 2 - 2);
  if (r >= 4) {              // round the big bands: shave corners + shade lower-right [v0.3]
    ctx.fillStyle = '#14141c';
    ctx.fillRect(sx - r + 1, sy - r + 1, 1, 1); ctx.fillRect(sx + r - 2, sy - r + 1, 1, 1);
    ctx.fillRect(sx - r + 1, sy + r - 2, 1, 1); ctx.fillRect(sx + r - 2, sy + r - 2, 1, 1);
    ctx.fillStyle = '#cccabe'; ctx.fillRect(sx, sy + r - 3, r - 2, 1);
  }
  if (r >= 3) { ctx.fillStyle = '#d04030'; ctx.fillRect(sx - 1, sy - r + 2, 1, 1); ctx.fillRect(sx + r - 3, sy, 1, 1); }
}
function drawShadow(ctx, sx, sy, r) {
  ctx.fillStyle = 'rgba(10,20,10,0.45)';
  ctx.fillRect(sx - r, sy, r * 2, 2);
}

/* ── world→screen for the FIELD view: OBLIQUE projection [v0.3] ──
   Ground-plane y is foreshortened (FSHORT/256 ≈ 0.656 vertical compression →
   the diamond reads as the original's wide trapezoid, 2B up-screen).
   CRITICAL: the 2:1 shadow projection [PROVEN] is preserved EXACTLY in screen
   pixels — height z lifts a sprite off its shadow by 2z world units at FULL
   scale (never foreshortened). Steering/catch feel is untouched. */
const FSHORT = 168;                       // ground-y compression, Q8 (168/256 = 0.65625)
function groundToScreenY(st, wy) {        // ground plane only (stripes, shapes)
  const camY = toInt(st.camera.yS);
  return 116 + (((((wy - camY) * FSHORT) >> 8) * 3) >> 5);
}
function fieldToScreen(st, wx, wy, wz) {
  const camX = toInt(st.camera.xS), camY = toInt(st.camera.yS);
  const sx = 128 + (((wx - camX) * 3) >> 5);
  const sy = 116 + (((((wy - camY) * FSHORT) >> 8) * 3) >> 5)   // foreshortened ground
                 - (((2 * (wz || 0)) * 3) >> 5);                 // exact 2:1 z lift [PROVEN]
  return { sx, sy };
}

function crowdPixel(x, y) { return PAL.crowdDots[(x * 7 + y * 13 + ((x * y) >> 3)) % PAL.crowdDots.length]; }

// [v0.6 P2-6] chaser chevron pixel shape: 9px wide, 2px-thick arms, 6 tall
const CHEVRON = [
  [-4, 0], [4, 0], [-3, 1], [3, 1], [-2, 2], [2, 2], [-1, 3], [1, 3], [0, 4],
  [-4, 1], [4, 1], [-3, 2], [3, 2], [-2, 3], [2, 3], [-1, 4], [1, 4], [0, 5],
];

/* ── FIELD VIEW (v0.3 oblique · v0.4 textured) ── */
function renderField(ctx, st) {
  ctx.fillStyle = PAL.grassB; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // [v0.7 W8] mow CHECKERBOARD on the foreshortened ground plane (was stripes)
  // — world-anchored 256u cells, band+column parity, Griffey-cut kelly green
  for (let band = 0; band < 24; band++) {
    const wy0 = band * 256;
    const s0 = groundToScreenY(st, wy0), s1 = groundToScreenY(st, wy0 + 256);
    if (s1 < 0 || s0 > VIEW_H) continue;
    const h = Math.max(1, s1 - s0);
    ctx.fillStyle = band % 2 ? PAL.grassA : PAL.grassB;
    ctx.fillRect(0, s0, VIEW_W, h);
    ctx.fillStyle = band % 2 ? PAL.grassB : PAL.grassA;
    for (let seg = 0; seg < 16; seg++) {
      if ((band + seg) % 2) continue;
      const p0 = fieldToScreen(st, seg * 256, wy0, 0), p1 = fieldToScreen(st, seg * 256 + 256, wy0, 0);
      if (p1.sx < 0 || p0.sx > VIEW_W) continue;
      ctx.fillRect(p0.sx, s0, Math.max(1, p1.sx - p0.sx), h);
    }
  }
  // [v0.4] grass speckle texture over the stripes (matches the plate scene)
  const tiles = getTiles(ctx);
  if (tiles) { ctx.fillStyle = tiles.speckle; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
  const P = GEO.plate;
  // ── outfield wall arc + stands that FILL upward (curved tiers, era look) ──
  // build wallY per screen column from the fence arc, then column-fill stands
  const wallY = new Int16Array(VIEW_W).fill(-999);
  {
    let prev = null;
    for (let a = -degToSteps(52); a <= degToSteps(52); a += 8) {
      const d = GEO.fenceDist(Math.max(-degToSteps(45), Math.min(degToSteps(45), a)));
      const rad = (a / CONST.ANGLE_STEPS) * TAU;
      const wx = P.x + Math.sin(rad) * d, wy = P.y - Math.cos(rad) * d;
      const pt = fieldToScreen(st, wx | 0, wy | 0, 0);
      if (prev) {
        const x0 = Math.min(prev.sx, pt.sx), x1 = Math.max(prev.sx, pt.sx);
        for (let x = Math.max(0, x0); x <= Math.min(VIEW_W - 1, x1); x++) {
          const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
          wallY[x] = Math.round(prev.sy + (pt.sy - prev.sy) * t);
        }
      }
      prev = pt;
    }
  }
  for (let x = 0; x < VIEW_W; x++) {
    const wy = wallY[x];
    if (wy === -999 || wy < -60) continue;
    if (wy - 6 > 0) {
      // stands base from screen-top to the wall
      ctx.fillStyle = PAL.stands2; ctx.fillRect(x, 0, 1, wy - 5);
      // crowd tiers follow the arc: 8px seat rows, sparse fans, strong railings
      for (let y = wy - 7; y >= 0; y--) {
        const row = wy - y;
        const band = (row >> 3) & 1;
        if ((row & 7) === 7) { ctx.fillStyle = '#181824'; ctx.fillRect(x, y, 1, 1); continue; }   // rail shadow
        if ((row & 7) === 6) { ctx.fillStyle = '#4e4e66'; ctx.fillRect(x, y, 1, 1); continue; }   // railing
        if (band && ((x + row) & 1)) { ctx.fillStyle = PAL.stands1; ctx.fillRect(x, y, 1, 1); }
        if (((x * 7 + y * 5 + (row >> 3) * 13) & 15) < 3) { ctx.fillStyle = crowdPixel(x, y); ctx.fillRect(x, y, 1, 1); }
      }
    }
    // wall band + yellow HR line + warning track
    ctx.fillStyle = PAL.wallTop; ctx.fillRect(x, wy - 5, 1, 1);
    ctx.fillStyle = PAL.wall; ctx.fillRect(x, wy - 4, 1, 5);
    ctx.fillStyle = PAL.track; ctx.fillRect(x, wy + 1, 1, 3);
  }
  // ── infield dirt diamond (auto-foreshortened trapezoid) ──
  const d1 = fieldToScreen(st, P.x, P.y + 60, 0);
  const d2 = fieldToScreen(st, GEO.bases[1].x + 130, GEO.bases[1].y + 20, 0);
  const d3 = fieldToScreen(st, P.x, GEO.bases[2].y - 130, 0);
  const d4 = fieldToScreen(st, GEO.bases[3].x - 130, GEO.bases[3].y + 20, 0);
  ctx.fillStyle = PAL.dirt;
  ctx.beginPath(); ctx.moveTo(d1.sx, d1.sy); ctx.lineTo(d2.sx, d2.sy); ctx.lineTo(d3.sx, d3.sy); ctx.lineTo(d4.sx, d4.sy); ctx.closePath(); ctx.fill();
  // infield grass cut
  const g1 = fieldToScreen(st, P.x, P.y - 140, 0);
  const g2 = fieldToScreen(st, GEO.bases[1].x - 95, GEO.bases[1].y + 95, 0);
  const g3 = fieldToScreen(st, P.x, GEO.bases[2].y + 190, 0);
  const g4 = fieldToScreen(st, GEO.bases[3].x + 95, GEO.bases[3].y + 95, 0);
  ctx.fillStyle = PAL.grassA;
  ctx.beginPath(); ctx.moveTo(g1.sx, g1.sy); ctx.lineTo(g2.sx, g2.sy); ctx.lineTo(g3.sx, g3.sy); ctx.lineTo(g4.sx, g4.sy); ctx.closePath(); ctx.fill();
  // dirt texture dither on the diamond (subtle, deterministic)
  ctx.fillStyle = PAL.dirtDark;
  for (let i = 0; i < 40; i++) {
    const wx = P.x - 500 + ((i * 149) % 1000), wy = P.y - 160 - ((i * 211) % 800);
    const pt = fieldToScreen(st, wx, wy, 0);
    if (((i * 7) & 3) === 0 && pt.sy > 0 && pt.sy < VIEW_H) ctx.fillRect(pt.sx, pt.sy, 1, 1);
  }
  // [v0.6 P2-3] worn base-path lanes: translucent foreshortened quads, two
  // passes (soft outer edge, warmer core) so they read as wear, not slabs.
  // Ground pass only — bags, actors, ball and the chaser marker draw over them.
  {
    const lane = (a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      const nx = -dy / len, ny = dx / len;                     // ground-plane normal
      for (const [w, col] of [[26, 'rgba(166,124,80,0.34)'], [12, 'rgba(196,148,104,0.42)']]) {
        const ox = nx * w, oy = ny * w;
        const p1 = fieldToScreen(st, a.x + ox, a.y + oy, 0), p2 = fieldToScreen(st, b.x + ox, b.y + oy, 0);
        const p3 = fieldToScreen(st, b.x - ox, b.y - oy, 0), p4 = fieldToScreen(st, a.x - ox, a.y - oy, 0);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy); ctx.lineTo(p4.sx, p4.sy); ctx.closePath(); ctx.fill();
      }
    };
    for (let i = 0; i < 4; i++) lane(GEO.bases[i], GEO.bases[(i + 1) % 4]);   // home→1B→2B→3B→home
  }
  // ── home dirt circle (ellipse — oblique) + mound oval ──
  const home = fieldToScreen(st, P.x, P.y, 0);
  ctx.fillStyle = PAL.dirt;
  ctx.beginPath(); ctx.ellipse(home.sx, home.sy, 17, 11, 0, 0, TAU); ctx.fill();
  const m = fieldToScreen(st, GEO.mound.x, GEO.mound.y, 0);
  ctx.fillStyle = PAL.dirt;
  ctx.beginPath(); ctx.ellipse(m.sx, m.sy, 9, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.dirtDark;
  ctx.beginPath(); ctx.ellipse(m.sx, m.sy - 1, 6, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d8d4c4'; ctx.fillRect(m.sx - 2, m.sy - 1, 5, 2);   // rubber
  // foul lines to the fence corners
  ctx.strokeStyle = PAL.line; ctx.lineWidth = 1;
  for (const s of [-1, 1]) {
    const rad = (s * degToSteps(45) / CONST.ANGLE_STEPS) * TAU;
    const d = GEO.fenceDist(degToSteps(45));
    const e = fieldToScreen(st, P.x + Math.sin(rad) * d, P.y - Math.cos(rad) * d, 0);
    ctx.beginPath(); ctx.moveTo(home.sx, home.sy); ctx.lineTo(e.sx, e.sy); ctx.stroke();
  }
  // bases: oblique parallelogram bags with a near-edge shadow
  for (let b = 1; b <= 3; b++) {
    const bc = GEO.bases[b], pt = fieldToScreen(st, bc.x, bc.y, 0);
    ctx.fillStyle = '#14141c'; ctx.fillRect(pt.sx - 3, pt.sy - 1, 7, 4);
    ctx.fillStyle = PAL.base; ctx.fillRect(pt.sx - 3, pt.sy - 2, 6, 3);
    ctx.fillStyle = '#c8c4b4'; ctx.fillRect(pt.sx - 3, pt.sy, 6, 1);
  }
  ctx.fillStyle = PAL.base; ctx.fillRect(home.sx - 2, home.sy - 1, 5, 3);
  // batter boxes hint
  ctx.fillStyle = PAL.dirtDark; ctx.fillRect(home.sx - 10, home.sy - 2, 5, 4); ctx.fillRect(home.sx + 5, home.sy - 2, 5, 4);

  // ── actors (painter-sorted by screen y so big sprites overlap correctly) ──
  const ft = fieldingTeam(st), bt = battingTeam(st);
  const fPal = teamPal(st.teams[ft]), rPal = teamPal(st.teams[bt], true);
  const RUN_CYCLE = [SPR.frun1, SPR.frun3, SPR.frun2, SPR.frun4];
  const acts = [];
  // runners (slide on close arrivals)
  for (const r of st.runners) {
    if (r.state === 'out' || r.state === 'scored') continue;
    const pt = fieldToScreen(st, toInt(r.xS), toInt(r.yS), 0);
    const moving = r.state === 'run' || r.state === 'return';
    let spr = moving ? RUN_CYCLE[(st.frame >> 3) & 3] : SPR.fidle;
    let sliding = false;
    const destBase = r.state === 'run' ? (r.toBase % 4) : r.fromBase;
    if (moving) {
      const bc = GEO.bases[destBase];
      const dd = dist2d(toInt(r.xS), toInt(r.yS), bc.x, bc.y);
      if (dd < 55 && r.toBase >= 2) sliding = true;    // slide into 2B/3B/home
      else r.faceL = bc.x < toInt(r.xS);
    }
    if (sliding) {
      const bc = GEO.bases[destBase];
      acts.push({ y: pt.sy, draw: () => drawSpriteOutlined(ctx, SPR.fslide, rPal, pt.sx - 11, pt.sy - 10, bc.x < toInt(r.xS)) });
    } else {
      const fl = !!r.faceL, sp = spr;
      acts.push({ y: pt.sy, draw: () => drawSpriteOutlined(ctx, sp, rPal, pt.sx - 8, pt.sy - 22, fl) });
    }
  }
  // fielders (run cycle, catch pose, throw, dive, prone)
  for (let i = 0; i < st.fielders.length; i++) {
    const f = st.fielders[i];
    const pt = fieldToScreen(st, toInt(f.xS), toInt(f.yS), 0);
    const idx = i;
    if (f.diveT > 0) { acts.push({ y: pt.sy, draw: () => drawSpriteOutlined(ctx, SPR.fdive, fPal, pt.sx - 12, pt.sy - 11, f.faceL) }); continue; }
    if (f.proneT > 0) { acts.push({ y: pt.sy, draw: () => drawSpriteOutlined(ctx, SPR.fprone, fPal, pt.sx - 12, pt.sy - 7, f.faceL) }); continue; }
    const moving = f.speedS > 60;
    let spr;
    if (st.ball.heldBy === idx && st.heldTimer < 14) spr = SPR.fcatch;
    else if (st.ball.mode === 'throw' && st.ball.thrownBy === idx && st.ball.t < 12) spr = SPR.fthrow;
    else spr = moving ? RUN_CYCLE[(f.anim >> 2) & 3] : SPR.fidle;
    const sp = spr;
    acts.push({ y: pt.sy, draw: () => {
      drawSpriteOutlined(ctx, sp, fPal, pt.sx - 8, pt.sy - 22, f.faceL);   // [v0.7 W8] inked
      if (idx === st.chaser && st.ball.heldBy < 0 && humanFielding(st)) {   // [v0.6 P2-6] pulsing chevron
        const bob = (st.frame >> 3) & 1, cy = pt.sy - 35 + bob;
        ctx.fillStyle = '#14141c';                             // dark drop pass: reads on grass/dirt/wall/crowd
        for (const [dx, dy] of CHEVRON) ctx.fillRect(pt.sx + dx, cy + dy + 1, 1, 1);
        ctx.fillStyle = bob ? '#ffe27a' : '#f8f8f2';
        for (const [dx, dy] of CHEVRON) ctx.fillRect(pt.sx + dx, cy + dy, 1, 1);
      }
      if (st.ball.heldBy === idx) { ctx.fillStyle = '#f8f8f2'; ctx.fillRect(pt.sx + 7, pt.sy - 15, 2, 2); }
    } });
  }
  acts.sort((a, b) => a.y - b.y);
  for (const a of acts) a.draw();
  // ── cosmetic FX [v0.3]: dust puffs (bounces/dives/slides) + catch pop flash ──
  for (const fx of st.fx) {
    const age = st.frame - fx.f;
    if (age > 14) continue;
    const pt = fieldToScreen(st, fx.x, fx.y, 0);
    const n = 3 + (age >> 2);
    for (let i = 0; i < n; i++) {
      const h = (fx.x * 7 + fx.y * 13 + i * 29) & 15;
      const dx = ((h & 3) - 1.5) * (1 + age * 0.4), dy = -((h >> 2) & 3) * 0.5 * (1 + age * 0.25);
      ctx.fillStyle = age < 6 ? 'rgba(214,190,150,0.8)' : 'rgba(214,190,150,0.35)';
      ctx.fillRect((pt.sx + dx) | 0, (pt.sy + dy - 1) | 0, 2, 2);
    }
  }
  // slide dust: stateless, streams behind any sliding runner
  for (const r of st.runners) {
    if (r.state !== 'run' || r.toBase < 2) continue;
    const bc = GEO.bases[r.toBase % 4];
    const dd = dist2d(toInt(r.xS), toInt(r.yS), bc.x, bc.y);
    if (dd >= 55) continue;
    const pt = fieldToScreen(st, toInt(r.xS), toInt(r.yS), 0);
    const back = bc.x < toInt(r.xS) ? 1 : -1;
    for (let i = 0; i < 4; i++) {
      const h = (st.frame * 13 + i * 37) & 7;
      ctx.fillStyle = i < 2 ? 'rgba(214,190,150,0.85)' : 'rgba(214,190,150,0.4)';
      ctx.fillRect(pt.sx + back * (6 + i * 3 + (h & 3)), pt.sy - 2 + (h >> 2), 2, 2);
    }
  }
  // catch pop: 6-frame starburst at a fresh catch
  if (st.ball.heldBy >= 0 && st.heldTimer < 6) {
    const f = st.fielders[st.ball.heldBy];
    const pt = fieldToScreen(st, toInt(f.xS), toInt(f.yS), 0);
    const r = 3 + st.heldTimer;
    ctx.fillStyle = st.heldTimer < 3 ? '#f8f8f2' : '#ffe27a';
    ctx.fillRect(pt.sx - r, pt.sy - 14, r * 2, 1); ctx.fillRect(pt.sx, pt.sy - 14 - r, 1, r * 2);
    ctx.fillRect(pt.sx - (r >> 1), pt.sy - 14 - (r >> 1), 1, 1); ctx.fillRect(pt.sx + (r >> 1), pt.sy - 14 + (r >> 1), 1, 1);
  }
  // HR fireworks (render-only celebration while the banner is up)
  if (st.banner && st.banner.text.indexOf('HOME RUN') >= 0) {
    for (let i = 0; i < 26; i++) {
      const seed = i * 613 + ((st.frame >> 1) * 97);
      const px = (seed * 31) % VIEW_W, py = ((seed * 17) % 70) + 8;
      const c = PAL.crowdDots[(i + (st.frame >> 3)) % PAL.crowdDots.length];
      ctx.fillStyle = c;
      ctx.fillRect(px, py, 2, 2);
      if ((seed & 3) === 0) { ctx.fillRect(px - 3, py, 1, 1); ctx.fillRect(px + 4, py, 1, 1); ctx.fillRect(px, py - 3, 1, 1); ctx.fillRect(px, py + 4, 1, 1); }
    }
  }
  // predicted landing marker (subtle, only while airborne batted ball)
  const b = st.ball;
  if (b.mode === 'flight' && b.batted && st.pred) {
    const pt = fieldToScreen(st, st.pred.x, st.pred.y, 0);
    ctx.fillStyle = (st.frame >> 2) & 1 ? 'rgba(240,240,220,0.7)' : 'rgba(240,240,220,0.3)';
    ctx.fillRect(pt.sx - 2, pt.sy, 5, 1); ctx.fillRect(pt.sx, pt.sy - 2, 1, 5);
  }
  // ball + shadow (never when held) with a motion trail on hot flights
  if (b.mode !== 'dead' && b.heldBy < 0) {
    const bx = toInt(b.xS), by = toInt(b.yS), bz = toInt(b.zS);
    const sh = fieldToScreen(st, bx, by, 0);
    drawShadow(ctx, sh.sx, sh.sy, 2);
    const pt = fieldToScreen(st, bx, by, bz);
    const spd = Math.abs(b.vxS) + Math.abs(b.vyS);
    if ((b.mode === 'flight' || b.mode === 'throw') && spd > 1600) {
      const gx = pt.sx - (((b.vxS >> 8) * 3) >> 4), gy = pt.sy - (((b.vyS >> 8) * 3) >> 4);
      ctx.fillStyle = 'rgba(248,248,242,0.35)'; ctx.fillRect(gx - 1, gy - 1, 2, 2);
    }
    drawBall(ctx, pt.sx, pt.sy, ballBandRadius(bz));
  }
}

/* ── PLATE VIEW (staged composition, like the source era) ── */
/* ── v0.4 ground texture tiles (16x16 patterns, built once; headless-safe) ── */
let TILES = null;
function getTiles(ctx) {
  if (TILES !== null || typeof document === 'undefined') return TILES;
  const mk = (base, alt, spk1, spk2) => {
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 16, 16);
    c.fillStyle = alt; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8);
    for (let i = 0; i < 30; i++) {
      const x = (i * 7 + 3) & 15, y = (i * 11 + 5) & 15;
      c.fillStyle = (i & 1) ? spk1 : spk2;
      c.fillRect(x, y, 1, 1);
    }
    return ctx.createPattern(cv, 'repeat');
  };
  // transparent speckle overlay (field view lays it over the mow stripes)
  const cv2 = document.createElement('canvas'); cv2.width = 16; cv2.height = 16;
  const c2 = cv2.getContext('2d');
  for (let i = 0; i < 22; i++) {
    const x = (i * 7 + 3) & 15, y = (i * 11 + 5) & 15;
    c2.fillStyle = (i & 1) ? 'rgba(86,170,92,0.5)' : 'rgba(26,84,32,0.40)';   // [v0.7 W8] brighter speckle
    c2.fillRect(x, y, 1, 1);
  }
  TILES = {
    grass: mk('#46a13c', '#41993a', '#55ad48', '#358430'),          // [v0.7 W8] kelly
    dirt: mk('#cf9f70', '#cb9a6a', '#d7a97a', '#c2925f'),           // [v0.7 W8] sunlit + low-contrast speckle (Griffey-flat)
    speckle: ctx.createPattern(cv2, 'repeat'),
  };
  return TILES;
}
function renderPlate(ctx, st) {
  const fr = st.frame;
  const CX = 136;                       // scene center: plate lane sits right of the HUD column [v0.4]
  const tiles = getTiles(ctx);
  // ── ALL FIELD, no stands: textured grass everywhere [v0.4 Griffey composition] ──
  ctx.fillStyle = tiles ? tiles.grass : PAL.grassA;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // [v0.7 W8] big soft mow checks (26px cells, screen-anchored — plate cam is fixed)
  ctx.fillStyle = 'rgba(150,215,125,0.14)';
  for (let cy = 0; cy < VIEW_H; cy += 26)
    for (let cx2 = ((cy / 26) & 1) * 26; cx2 < VIEW_W; cx2 += 52)
      ctx.fillRect(cx2, cy, 26, 26);
  // ── infield dirt expanse: broad arc bulging toward CF ──
  ctx.fillStyle = tiles ? tiles.dirt : PAL.dirt;
  ctx.beginPath(); ctx.ellipse(CX, 300, 240, 205, 0, 0, TAU); ctx.fill();   // v0.5: higher, flatter arc
  // arc lip highlight
  ctx.strokeStyle = 'rgba(255,240,210,0.16)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(CX, 300, 240, 205, 0, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  // ── mound: compact oval hill up-screen with rim light + rubber ──
  ctx.fillStyle = tiles ? tiles.dirt : PAL.dirt;
  ctx.beginPath(); ctx.ellipse(CX, 44, 26, 10, 0, 0, TAU); ctx.fill();      // [v0.7 W9] compacted (was 30x11)
  ctx.fillStyle = '#d8ab7c';
  ctx.beginPath(); ctx.ellipse(CX, 42, 18, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.dirtDark;
  ctx.beginPath(); ctx.ellipse(CX, 46, 24, 5, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.fill();
  ctx.fillStyle = '#d8d4c4'; ctx.fillRect(CX - 3, 43, 7, 2);         // rubber
  // ── foul lines racing to the corners ── [v0.7 W8] thin era chalk (was 2px)
  ctx.strokeStyle = 'rgba(60,40,20,0.22)'; ctx.lineWidth = 2;                     // chalk shadow
  ctx.beginPath(); ctx.moveTo(CX - 14, 215); ctx.lineTo(0, 133); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX + 14, 215); ctx.lineTo(VIEW_W, 131); ctx.stroke();
  ctx.strokeStyle = '#f6f4ea'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(CX - 14, 214); ctx.lineTo(0, 132); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX + 14, 214); ctx.lineTo(VIEW_W, 130); ctx.stroke();
  // ── batter boxes: thin white-chalk outlines flanking the plate [v0.7 W8: 1px border, was 2] ──
  for (const bx0 of [CX - 50, CX + 20]) {
    ctx.fillStyle = '#f6f4ea'; ctx.fillRect(bx0, 158, 30, 48);
    ctx.fillStyle = tiles ? tiles.dirt : PAL.dirtDark; ctx.fillRect(bx0 + 1, 159, 28, 46);
  }
  // home plate (pentagon)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(CX - 7, 208, 14, 4); ctx.fillRect(CX - 5, 212, 10, 3); ctx.fillRect(CX - 2, 215, 4, 2);
  // [v0.7 W9] battery behind the plate, Griffey-style: ump leans over the
  // catcher's right shoulder (drawn first, occluded), catcher crouches over
  // the plate in the FIELDING team's colors; batter draws later = in front
  {
    const cPal = teamPal(st.teams[fieldingTeam(st)]);
    drawSpriteOutlined(ctx, SPR.umpire, UMP_PAL, CX + 10, 192);
    drawSpriteOutlined(ctx, SPR.catcherBack, cPal, CX - 15, 190);
  }
  // [v0.6 P1-1] human pitch-aim cursor: small glove chevron at the called target,
  // windup only — restrained, era-styled, blinks at an 8-frame cadence
  if (st.phase === 'WINDUP' && st.pitchInfo && humanFielding(st)) {
    const ax = CX + (st.pitchInfo.targetX - CONST.PLATE_X);
    ctx.fillStyle = (fr >> 3) & 1 ? '#ffe27a' : '#f8f8f2';
    ctx.fillRect(ax - 3, 199, 7, 2);
    ctx.fillRect(ax - 2, 201, 5, 2);
    ctx.fillRect(ax - 1, 203, 3, 2);
  }
  // ── staged infield defenders (distance figures) + base runners ──
  {
    const fPalTiny = teamPal(st.teams[fieldingTeam(st)]);
    const rPalTiny = teamPal(st.teams[battingTeam(st)], true);
    drawSpriteOutlined(ctx, SPR.fielderIdle, fPalTiny, 210, 82);   // 1B
    drawSpriteOutlined(ctx, SPR.fielderIdle, fPalTiny, 188, 38);   // 2B — wide of the mound
    drawSpriteOutlined(ctx, SPR.fielderIdle, fPalTiny, 84, 38);    // SS
    drawSpriteOutlined(ctx, SPR.fielderIdle, fPalTiny, 62, 82);    // 3B
    // corner bags at the arc edges (2B is cropped up-screen, era-authentic)
    ctx.fillStyle = PAL.base;
    ctx.fillRect(232, 88, 6, 4); ctx.fillRect(36, 88, 6, 4);
    if (st.bases[1]) drawSpriteOutlined(ctx, ((fr >> 4) & 1) ? SPR.runner1 : SPR.fielderIdle, rPalTiny, 236, 78);
    if (st.bases[2]) drawSpriteOutlined(ctx, ((fr >> 4) & 1) ? SPR.runner1 : SPR.fielderIdle, rPalTiny, 142, 26);
    if (st.bases[3]) drawSpriteOutlined(ctx, ((fr >> 4) & 1) ? SPR.runner1 : SPR.fielderIdle, rPalTiny, 28, 78);
    // stealing runner sprints between staged bags [v0.3]
    const SPOTS = [[CX, 196], [232, 84], [140, 44], [40, 84], [CX, 196]];
    for (const r of st.runners) {
      if (!r.stealing || (r.state !== 'run' && r.state !== 'return')) continue;
      const from = r.state === 'run' ? r.fromBase : r.toBase, to = r.state === 'run' ? r.toBase : r.fromBase;
      const bcF = GEO.bases[from % 4], bcT = GEO.bases[to % 4];
      const total = Math.max(1, dist2d(bcF.x, bcF.y, bcT.x, bcT.y));
      const frac = clamp(1 - dist2d(toInt(r.xS), toInt(r.yS), bcT.x, bcT.y) / total, 0, 1);
      const A = SPOTS[Math.min(4, from)], B = SPOTS[Math.min(4, to)];
      const rx = Math.round(A[0] + (B[0] - A[0]) * frac), ry = Math.round(A[1] + (B[1] - A[1]) * frac);
      drawSpriteOutlined(ctx, ((fr >> 2) & 1) ? SPR.runner2 : SPR.runner3, rPalTiny, rx, ry, B[0] < A[0]);
      ctx.fillStyle = (fr >> 2) & 1 ? '#ffe27a' : '#f8f8f2';
      ctx.fillRect(rx + 2, ry - 4, 3, 2);
    }
  }
  const ft = fieldingTeam(st), bt = battingTeam(st);
  const pPal = teamPal(st.teams[ft]);
  const bPal = goatPal(st.teams[bt], true);   // [v0.7 W8] home whites at the plate
  const softShadow = (x, y, rx, ry) => {
    ctx.fillStyle = 'rgba(10,16,10,0.30)';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  };
  // ── pitcher: the 84-frame theatrical delivery [MEASURED arc] ──
  // [v0.6 P2-1] 26x38 redraw: rock → kick → stride → release, then the
  // follow-through holds through early PITCH and eases back to idle
  let pspr = SPR.pitcherIdle;
  if (st.phase === 'WINDUP') {
    const t = st.phaseT;
    if (t < 16) pspr = SPR.pitcherRock;
    else if (t < CONST.WINDUP_FRAMES - 28) pspr = SPR.pitcherKick;      // long anticipation hold
    else if (t < CONST.WINDUP_FRAMES - 12) pspr = SPR.pitcherStride;
    else pspr = SPR.pitcherThrow;
  }
  else if (st.phase === 'PITCH' && st.ball.t < 6) pspr = SPR.pitcherThrow;
  else if (st.phase === 'PITCH' && st.ball.t < 20) pspr = SPR.pitcherFollow;   // was snap to idle at t≥14
  else if (st.phase === 'PHANTOM') pspr = (st.phaseT >> 3) & 1 ? SPR.pitcherRock : SPR.pitcherIdle;
  softShadow(CX, 56, 13, 3);
  drawSpriteOutlined(ctx, pspr, pPal, CX - 13, 22, currentPitcherP(st).hand === 'L');   // feet row 35 → old foot line y=57 · [v0.7 W8] inked
  // ── THE BATTER — 38x54 original star sprite [v0.4] ──
  const bat = st.batter;
  if (bat) {
    const lefty = bat.hand === 'L';
    const homeBox = lefty ? CONST.PLATE_X + CONST.HANDEDNESS_OFF : CONST.PLATE_X - CONST.HANDEDNESS_OFF;
    const anchor = lefty ? CX + 35 : CX - 35;            // box centers
    const bx = anchor + (bat.boxX - homeBox) * 2;
    // [v0.7 W10] idle waggle RHYTHM (was a 32f A/B metronome): settle high,
    // quick pump down through mid to the dip, ease back through mid —
    // A·24 B·8 C·12 B·12 = 56f (~0.93s) cycle, +1px weight bob on the dip.
    // Render-only: phase runs off st.frame, sim untouched.
    const wph = fr % 56;
    let bspr = SPR.goatStance, bob = 0;
    if (wph >= 24) {
      if (wph < 32) bspr = SPR.goatStanceB;
      else if (wph < 44) { bspr = SPR.goatStanceC; bob = 1; }
      else bspr = SPR.goatStanceB;
    }
    if (bat.bunting) { bspr = SPR.goatBunt; bob = 0; }
    else if (st.swing.state === 'windup') { bspr = SPR.goatStride; bob = 0; }   // [v0.6 P1-4] stride/load, was stance pop
    else if (st.swing.state === 'active') { bspr = SPR.goatSwing1; bob = 0; }
    else if (st.swing.state === 'follow') { bspr = SPR.goatSwing2; bob = 0; }
    softShadow(bx, 218, 18, 4);
    const w = bspr[0].length;
    drawSpriteOutlined(ctx, bspr, bPal, lefty ? bx - (w - 15) : bx - 14, 152 + bob, lefty);   // [v0.7 W8] inked

  }
  // ── ball in pitch flight (grows on approach; landing cursor on the dirt) ──
  const b = st.ball;
  if (b.mode === 'pitch') {
    const t = clamp((toInt(b.yS) - GEO.mound.y) / CONST.MOUND_DIST, 0, 1.12);
    const sx = CX + (toInt(b.xS) - CONST.PLATE_X);
    const zi = toInt(b.zS);
    const sy = 54 + t * 152 - (zi - CONST.PITCH_Z_END);
    if (b.pitch && b.t < b.pitch.T) {
      const rem = Math.max(0, (toSub(CONST.PLATE_Y) - b.yS) / Math.max(1, b.vyS));
      const projX = toInt(b.xS + b.vxS * rem + 0.5 * b.pitch.breakAx * rem * rem);
      const px = CX + (projX - CONST.PLATE_X);
      ctx.strokeStyle = (fr >> 2) & 1 ? 'rgba(248,244,220,0.85)' : 'rgba(248,244,220,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(px, 210, 5, 2, 0, 0, TAU); ctx.stroke();
    }
    drawShadow(ctx, sx, 54 + t * 152 + 6, 2);
    if (b.pitch && b.pitch.T <= 21 && t > 0.2) {   // heater trail
      ctx.fillStyle = 'rgba(248,248,242,0.45)'; ctx.fillRect(sx, (sy - 5) | 0, 1, 3);
      ctx.fillStyle = 'rgba(248,248,242,0.22)'; ctx.fillRect(sx, (sy - 9) | 0, 1, 3);
    }
    drawBall(ctx, sx | 0, sy | 0, 1 + Math.floor(t * 2.2) + (zi > 34 ? 1 : 0));
  } else if (b.mode === 'held-p') {
    drawBall(ctx, CX - 6, 44, 1);
  }
  // phantom pitch presentation [MEASURED mechanic]: abstract strobing pitch
  if (st.phase === 'PHANTOM') {
    const t = st.phaseT / CONST.PHANTOM_ANIM;
    const sy = 54 + t * 148;
    ctx.fillStyle = (st.phaseT >> 1) & 1 ? '#f8f8f2' : '#a8b8d8';
    ctx.fillRect(CX - 1, sy | 0, 3, 3);
    centerText(ctx, 'DELAY OF GAME CLOCK', 118, '#c8d0e8', 1);
  }
}
function drawMiniDiamond(ctx, st, cx, cy) {
  // v0.4: floating white-outline diamond, corner-anchored (era scorebug style)
  ctx.fillStyle = 'rgba(10,10,24,0.45)';
  ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx + 14, cy); ctx.lineTo(cx, cy + 14); ctx.lineTo(cx - 14, cy); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8e4d8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx, cy - 11); ctx.lineTo(cx + 11, cy); ctx.lineTo(cx, cy + 11); ctx.lineTo(cx - 11, cy); ctx.closePath(); ctx.stroke();
  const spots = [[0, 9], [9, 0], [0, -9], [-9, 0]];   // home,1B,2B,3B
  for (let i = 0; i <= 3; i++) {
    const occupied = i === 0 ? false : !!st.bases[i];
    ctx.fillStyle = occupied ? '#ffe27a' : '#5a627a';
    const [dx, dy] = spots[i];
    ctx.fillRect(cx + dx - 2, cy + dy - 2, 4, 4);
  }
}

/* ── HUD (score/inning/count/cards) ── */
function renderHUD(ctx, st) {
  const bt = battingTeam(st);
  // [v0.7 W8] Griffey scorebug: no black band — stacked chunky outlined team
  // lines float straight on the field, batting side lit yellow
  const a = st.teams[0], h = st.teams[1];
  const capA = Math.min(st.score[0], CONST.SCORE_CAP[0]), capH = Math.min(st.score[1], CONST.SCORE_CAP[1]);
  const scoreLine = (txt, y, lit) => {
    drawChunk(ctx, txt, 5, y + 1, '#101018', 1);
    drawChunk(ctx, txt, 4, y, lit ? '#ffe27a' : '#f6f4ea', 1);
  };
  scoreLine(a.abbr + ' ' + capA, 3, bt === 0);
  scoreLine(h.abbr + ' ' + capH, 15, bt === 1);
  drawTextShadow(ctx, (st.half === 0 ? 'TOP' : 'BOT') + ' ' + st.inning, 5, 28, '#f0eeda', 1);
  // count pips: bottom-left column above the batter card [v0.5 ref position]
  // [v0.7 W8] round era dots w/ dark ring (was 5x5 squares on chip color)
  const pipY = 152;
  const dot = (x, y, on, col) => {
    ctx.fillStyle = '#101018';
    ctx.fillRect(x - 3, y - 2, 6, 4); ctx.fillRect(x - 2, y - 3, 4, 6);
    ctx.fillStyle = on ? col : '#4a5064';
    ctx.fillRect(x - 2, y - 1, 4, 2); ctx.fillRect(x - 1, y - 2, 2, 4);
  };
  drawText(ctx, 'B', 4, pipY + 1, '#101018'); drawText(ctx, 'B', 3, pipY, '#9adf9a');
  for (let i = 0; i < 3; i++) dot(13 + i * 8, pipY + 2, i < st.balls, '#7ae87a');
  drawText(ctx, 'S', 4, pipY + 9, '#101018'); drawText(ctx, 'S', 3, pipY + 8, '#ffb45a');
  for (let i = 0; i < 2; i++) dot(13 + i * 8, pipY + 10, i < st.strikes, '#ffb445');
  drawText(ctx, 'O', 4, pipY + 17, '#101018'); drawText(ctx, 'O', 3, pipY + 16, '#ff6a5a');
  for (let i = 0; i < 2; i++) dot(13 + i * 8, pipY + 18, i < st.outs, '#ff5a4a');
  // batter card (plate view, quiet phases only)
  if (st.camera.mode === 'plate' && st.batter) {
    const p = st.batter.player;
    const ord = (st.batterPtr[bt] % 9) + 1;
    drawTextShadow(ctx, ord + ' ' + p.pos + ' #' + p.uniform, 6, VIEW_H - 26, '#d8bc58', 1);
    drawTextShadow(ctx, p.initial + '.' + p.surname, 6, VIEW_H - 18, '#f2d264', 1);
    drawTextShadow(ctx, '.' + String(p.avg).padStart(3, '0') + ' ' + p.hr + 'HR', 6, VIEW_H - 10, '#f2d264', 1);
    // pitcher tag: left column under the count pips [v0.4 Griffey layout]
    const pit = currentPitcherP(st);
    drawTextShadow(ctx, 'P ' + pit.surname + ' #' + pit.uniform, 3, 52, st.tired ? '#ff8a7a' : '#f2d264', 1);
    drawTextShadow(ctx, 'P' + String(st.pitchCount[fieldingTeam(st)]).padStart(2, ' ') + (st.tired ? ' TIRED' : ''), 3, 60, st.tired ? '#ff8a7a' : '#d8bc58', 1);
    // radar readout floats top-right, no panel [v0.4]
    if (st.mphT > 0) drawTextShadow(ctx, st.lastMPH + ' MPH', 212, 14, '#ffe27a', 1);
    // mini diamond floats bottom-right, Griffey-corner style [v0.4]
    drawMiniDiamond(ctx, st, 240, 202);
    // NOW BATTING walk-up card [v0.7 W8]: bordered era panel, not a full-bleed band
    if (st.walkupT > 0 && st.phase === 'PREPITCH') {
      const txt = 'NOW BATTING  #' + p.uniform + ' ' + p.initial + '.' + p.surname + '  ' + p.pos;
      const w = textW(txt) + 14, x0 = (VIEW_W - w) >> 1;
      ctx.fillStyle = '#f6f4ea'; ctx.fillRect(x0 - 1, 119, w + 2, 16);
      ctx.fillStyle = 'rgba(14,14,34,0.94)'; ctx.fillRect(x0, 120, w, 14);
      ctx.fillStyle = st.teams[bt].colors.main; ctx.fillRect(x0, 120, 3, 14);
      ctx.fillStyle = st.teams[bt].colors.trim; ctx.fillRect(x0 + w - 3, 120, 3, 14);
      centerText(ctx, txt, 124, '#f8f8f2', 1, false);
    }
  }
  // banner
  if (st.banner) {
    const blink = st.banner.t > 20 || ((st.banner.t >> 2) & 1);
    if (blink) {
      // [v0.6 P2-5] one-word umpire calls punch in at 2x chunk with a 2-frame
      // white pop — arcade-fast, no added frames to game flow
      if (CALL_POP[st.banner.text]) {
        const pop = st.banner.dur - st.banner.t < 2;
        centerChunk(ctx, st.banner.text, 85, pop ? '#ffffff' : st.banner.color, undefined, 2);
      } else {
        centerChunk(ctx, st.banner.text, 96, st.banner.color);   // chunky banner font [v0.3]
      }
    }
  }
  // contextual control hints (demo nicety)
  if (!st.demo) {
    let hint = null;
    const runnersOn = st.bases[1] || st.bases[2] || st.bases[3];
    if (st.phase === 'PREPITCH') hint = humanFielding(st)
      ? (runnersOn ? 'B+DPAD=PITCH TYPE  A+DIR=PICKOFF' : 'B=PITCH +DPAD=PITCH TYPE')
      : (runnersOn ? 'B=SWING  A=BUNT  A+DIR=STEAL (U=2B L=3B)' : 'DPAD=BOX  B=SWING  HOLD A=BUNT');
    else if (st.phase === 'WINDUP' && humanFielding(st)) hint = 'DPAD L/R=AIM';   // [v0.6 P1-1]
    else if (st.phase === 'PITCH') hint = humanFielding(st) ? 'DPAD=STEER PITCH' : 'B=SWING  HOLD A=BUNT';
    else if (st.phase === 'LIVE' && humanFielding(st)) hint = st.ball.heldBy >= 0 ? 'B+DPAD=THROW (R=1B U=2B L=3B D=HOME)' : 'DPAD=RUN  B=DIVE';
    else if (st.phase === 'LIVE' && humanBatting(st)) {
      hint = st.ball.batted && st.ball.mode === 'flight' ? 'DPAD=STEER THE BALL!  A=SEND RUNNERS' : 'A=SEND RUNNERS  B=HOLD UP';
    }
    // [v0.7 W8] no band — outlined text floats on the field like the rest of the HUD
    if (hint) centerText(ctx, hint, VIEW_H - 7, '#f0eeda');
  }
  if (st.demo) {
    centerText(ctx, 'DEMO MODE - PRESS ANY KEY', VIEW_H - 7, '#ffe27a');
  }
}

/* ── scene screens ── */
// [v0.6 P2-4] heroic title portrait 44x72 — front-view batter, bat resting on
// the shoulder. Original art, teamPal keys (home team colors on the title).
const TITLE_HERO = [
  '........NNN...................................',
  '........NNNn..................................',
  '.........NNn..................................',
  '.........NNn..................................',
  '..........NNn.................................',
  '...........NNn....JJJJJJJJJ.................',
  '............NNn..JJJJJJJJJJJJJ..............',
  '.............NNnJJJJJJJJJJJJJJJ.............',
  '.............NNnJJJjjjjjjjJJJ.............',
  '.............NNnOJJJJJJJJJJJO...............',
  '..............NNnOJJJJJJJJJJJJJJJO..........',
  '..............NNnOSSSSSSSSSSSSSO............',
  '..............NNnOSsSSSSSSSsSSO.............',
  '...............NNnOSsOsSSSsOsSO.............',
  '...............NNnOSSSSSSSSSSSO.............',
  '...............NNnOSsSSSSSSsSSO.............',
  '................NNnSsSSssssSSsO.............',
  '................NNnOSSSSSSSSSSO.............',
  '................NNnOsSSSSSSsO...............',
  '................NSS..OssssO.................',
  '...............NSSS.JJJJJJJJJJ..............',
  '.............SSSSSJJJJJJJJJJJJJJJJJ.........',
  '............JJSSSSJJJJJJJJJJJJJJJJJJJJ......',
  '...........JJJJSSSJJJJJJJJJJJJJJJJJJJJ......',
  '...........JjJJJJJJJJJJJJJJJJJJJJJjJ.......',
  '...........JjJJJSSSSSSSSSSSJJJJJJJJjJ.......',
  '...........JjJJJSSSJJJJJJJJJJJJJJJjJ.......',
  '...........OjJJJJJJJJJJJJJJJJJJJJjO.......',
  '...........OjJJJJJJJJJJJJJJJJJJJJjO.......',
  '...........OjJJJJJJJJJJJJJJJJJJJJjO.......',
  '............OJJJJJJJJJJJJJJJJJJJO........',
  '............OJJJJJJJJJJJJJJJJJJJO........',
  '............OJJJJJJJJJJJJJJJJJJJO........',
  '............TTTTTTTTTTTTTTTTTTTT........',
  '............PPPPPPPPPPPPPPPPPPPP........',
  '............PPPPPPPPPPPPPPPPPPPPPPPP..........',
  '...........PPPPPPPPPPPPPPPPPPPPPPPPPP.........',
  '...........PPPPPPPPPPpPPPPPPPPPPPPPPP.........',
  '...........PPPPPPPPp.pPPPPPPPPPPPPPP..........',
  '..........PPPPPPPPp...pPPPPPPPPPPPPPP.........',
  '..........PPPPPPPp.....pPPPPPPPPPPPPP.........',
  '..........PPPPPPPp.....pPPPPPPPPPPPPP.........',
  '..........PPPPPPp.......pPPPPPPPPPPPP.........',
  '.........PPPPPPPp.......pPPPPPPPPPPPPP........',
  '.........PPPPPPp.........pPPPPPPPPPPPP........',
  '.........PPPPPPp.........pPPPPPPPPPPPP........',
  '.........PPPPPp...........pPPPPPPPPPPP........',
  '........PPPPPPp...........pPPPPPPPPPPPP.......',
  '........PPPPPp.............pPPPPPPPPPPP.......',
  '........PPPPPp.............pPPPPPPPPPP........',
  '........PPPPp...............pPPPPPPPPP........',
  '.......PPPPPp...............pPPPPPPPPPP.......',
  '.......PPPPp.................pPPPPPPPPP.......',
  '.......PPPPp.................pPPPPPPPP........',
  '.......PPPp...................pPPPPPPP........',
  '......OPPPp...................pPPPPPPPO.......',
  '......OPPPp...................pPPPPPPPO.......',
  '......OPPp.....................pPPPPPPO.......',
  '......OPPp.....................pPPPPPPO.......',
  '......OPPO.....................OPPPPPO........',
  '......OPPO.....................OPPPPPO........',
  '.....OOPPOO...................OOPPPPOO........',
  '.....OOWWOO...................OOWWPPOO........',
  '.....OOOOOO...................OOOOOOOO........',
  '............................................',
  '............................................',
  '............................................',
];

function renderTitle(ctx, st) {
  ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // starfield stadium lights
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + 13) % VIEW_W, y = (i * 53 + 7) % 76;
    ctx.fillStyle = (st.frame >> 4) % 3 === i % 3 ? '#8890b0' : '#3a4060';
    ctx.fillRect(x, y, 1, 1);
  }
  // [v0.6 P2-4] layered chunky logo lockup: deep offset + mid shadow + face
  const t1 = 'MR. BASEBALL', x1 = (VIEW_W - chunkW(t1, 2)) >> 1;
  drawChunk(ctx, t1, x1 + 6, 12, '#40160a', 2);
  drawChunk(ctx, t1, x1 + 3, 9, '#b04418', 2);
  drawChunk(ctx, t1, x1, 6, '#ffe27a', 2);
  const t2 = 'DYNASTY', x2 = (VIEW_W - chunkW(t2, 2)) >> 1;
  drawChunk(ctx, t2, x2 + 6, 38, '#40160a', 2);
  drawChunk(ctx, t2, x2 + 3, 35, '#7a3010', 2);
  drawChunk(ctx, t2, x2, 32, '#f8f8f2', 2);
  // baseballs flanking the second line (diamond motif)
  drawBall(ctx, x2 - 16, 42, 4); drawBall(ctx, x2 + chunkW(t2, 2) + 16, 42, 4);
  centerText(ctx, 'FIELD DEMO V0.6', 60, PAL.hudDim, 1);
  // hero portrait (home colors) left · diamond emblem right
  drawSpriteOutlined(ctx, TITLE_HERO, teamPal(st.teams[1], true), 16, 76);
  const cx = 198, cy = 108;
  ctx.fillStyle = '#1c4c28';
  ctx.beginPath(); ctx.moveTo(cx, cy + 26); ctx.lineTo(cx + 32, cy); ctx.lineTo(cx, cy - 26); ctx.lineTo(cx - 32, cy); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2e7c34'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = PAL.dirt;
  ctx.beginPath(); ctx.moveTo(cx, cy + 19); ctx.lineTo(cx + 25, cy); ctx.lineTo(cx, cy - 19); ctx.lineTo(cx - 25, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.base;
  ctx.fillRect(cx - 2, cy + 16, 4, 4); ctx.fillRect(cx + 22, cy - 2, 4, 4); ctx.fillRect(cx - 2, cy - 20, 4, 4); ctx.fillRect(cx - 26, cy - 2, 4, 4);
  drawBall(ctx, cx, cy, 5);
  // mode menu (+ [v0.6 P1-3] game-length row)
  const opts = ['1P VS CPU', '2P VS', 'WATCH DEMO', 'INNINGS: ' + st.innings];
  for (let i = 0; i < 4; i++) {
    const sel = st.menuSel === i;
    const y = 152 + i * 11;
    if (sel) drawText(ctx, '>', 82, y, ((st.frame >> 4) & 1) ? '#ffe27a' : '#f8f8f2');
    const label = i === 3 && sel ? '< ' + opts[i] + ' >' : opts[i];
    centerText(ctx, label, y, sel ? '#f8f8f2' : '#5a627a', 1, false);
  }
  centerText(ctx, 'P1 ARROWS+Z/X  P2 IJKL+N/M  ENTER=START', 198, PAL.hudDim, 1);
  centerText(ctx, 'SPORTSDYNASTYGAMES - ALL ORIGINAL WORK', 208, '#3a4060', 1);
  centerText(ctx, 'ATTRACT DEMO IN ' + Math.max(0, 15 - (st.sceneT / 60 | 0)) + 'S', 216, '#3a4060', 1);
}
function renderMatchup(ctx, st) {
  ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#141430'; ctx.fillRect(8, 20, VIEW_W - 16, 184);
  ctx.strokeStyle = '#3a4060'; ctx.lineWidth = 1; ctx.strokeRect(8.5, 20.5, VIEW_W - 17, 183);
  centerText(ctx, "TODAY'S GAME", 30, '#ffe27a', 2);
  const a = st.teams[0], h = st.teams[1];
  const pa = a.players[15], ph = h.players[15];
  centerText(ctx, a.city + ' ' + a.name, 62, '#f8f8f2', 1);
  centerText(ctx, pa.initial + '. ' + pa.surname + ' (' + pa.w + '-' + pa.l + ')', 74, PAL.hudDim, 1);
  centerText(ctx, 'AT', 92, '#ffe27a', 1);
  centerText(ctx, h.city + ' ' + h.name, 108, '#f8f8f2', 1);
  centerText(ctx, ph.initial + '. ' + ph.surname + ' (' + ph.w + '-' + ph.l + ')', 120, PAL.hudDim, 1);
  const twoP = st.control[0] === 'human1';
  centerText(ctx, twoP ? 'P1 = ' + h.abbr + ' (HOME)   P2 = ' + a.abbr + ' (AWAY)' : 'YOU ARE ' + h.city + ' (HOME)', 142, '#9adf9a', 1);
  centerText(ctx, twoP ? 'P2 BATS FIRST - P1 TAKES THE MOUND' : 'AWAY BATS FIRST - YOU TAKE THE MOUND', 154, PAL.hudDim, 1);
  centerText(ctx, st.innings + ' INNINGS - FIELD DEMO RULES', 166, PAL.hudDim, 1);
  if ((st.frame >> 5) & 1) centerText(ctx, 'PRESS B FOR PLAY BALL', 186, '#f8f8f2', 1);
}
function renderCardScreen(ctx, st, final) {
  ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#141430'; ctx.fillRect(6, 14, VIEW_W - 12, 196);
  ctx.strokeStyle = '#3a4060'; ctx.strokeRect(6.5, 14.5, VIEW_W - 13, 195);
  centerText(ctx, final ? 'FINAL' : "TODAY'S GAME", 22, '#ffe27a', 2);
  // line score grid
  const innCount = Math.max(st.innings, st.lineScore[0].length);
  const gx = 16, gy = 52, cw = 14;
  drawText(ctx, 'TEAM', gx, gy - 10, PAL.hudDim);
  for (let i = 0; i < innCount; i++) drawText(ctx, String(i + 1), gx + 58 + i * cw, gy - 10, PAL.hudDim);
  drawText(ctx, 'R', gx + 58 + innCount * cw + 6, gy - 10, '#ffe27a');
  drawText(ctx, 'H', gx + 58 + innCount * cw + 20, gy - 10, PAL.hudDim);
  drawText(ctx, 'E', gx + 58 + innCount * cw + 34, gy - 10, PAL.hudDim);
  for (let t = 0; t < 2; t++) {
    const y = gy + t * 14;
    drawText(ctx, st.teams[t].abbr, gx, y, t === battingTeam(st) && !final ? '#ffe27a' : '#f8f8f2');
    for (let i = 0; i < innCount; i++) {
      const v = st.lineScore[t][i];
      drawText(ctx, v === null || v === undefined ? '-' : String(v), gx + 58 + i * cw, y, PAL.hudText);
    }
    drawText(ctx, String(Math.min(st.score[t], CONST.SCORE_CAP[t])), gx + 58 + innCount * cw + 6, y, '#ffe27a');
    drawText(ctx, String(st.hits[t]), gx + 58 + innCount * cw + 20, y, PAL.hudText);
    drawText(ctx, String(st.errs[t]), gx + 58 + innCount * cw + 34, y, PAL.hudText);
  }
  if (!final) {
    // DUE UP: next three batters [K info design]
    const bt = battingTeam(st) === 0 ? 1 : 0;   // team about to bat after flip
    const nextBt = st.half === 0 ? 1 : 0;
    const team = st.teams[nextBt];
    centerText(ctx, 'DUE UP - ' + team.abbr, 102, '#9adf9a', 1);
    for (let i = 0; i < 3; i++) {
      const p = lineup(st, nextBt)[(st.batterPtr[nextBt] + i) % 9];
      centerText(ctx, ((st.batterPtr[nextBt] + i) % 9 + 1) + ' ' + p.initial + '.' + p.surname + ' ' + p.pos + ' .' + String(p.avg).padStart(3, '0'), 114 + i * 11, PAL.hudText, 1);
    }
    // inert management buttons (roadmap)
    ctx.fillStyle = '#1c1c38';
    ctx.fillRect(24, 158, 60, 14); ctx.fillRect(98, 158, 60, 14); ctx.fillRect(172, 158, 60, 14);
    drawText(ctx, 'BULLPEN', 34, 162, '#5a627a'); drawText(ctx, 'LINE UP', 108, 162, '#5a627a'); drawText(ctx, 'EXIT', 192, 162, PAL.hudText);
    centerText(ctx, '(BULLPEN/LINEUP ARRIVE WITH MBD)', 178, '#3a4060', 1);
    if ((st.frame >> 5) & 1) centerText(ctx, 'PRESS B TO CONTINUE', 194, '#f8f8f2', 1);
  } else {
    const [as, hs] = st.score;
    const win = as === hs ? null : (as > hs ? st.teams[0] : st.teams[1]);
    centerText(ctx, win ? win.city + ' ' + win.name + ' WIN!' : 'CALLED A TIE - DEMO RULES', 110, '#ffe27a', win ? 2 : 1);
    if (st.walkoff) centerText(ctx, 'WALK-OFF!', 132, '#ff8a5a', 1);
    centerText(ctx, 'THANKS FOR PLAYING THE FIELD DEMO', 156, PAL.hudText, 1);
    centerText(ctx, 'FULL SEASON LIVES IN MR. BASEBALL DYNASTY', 168, PAL.hudDim, 1);
    if ((st.frame >> 5) & 1) centerText(ctx, 'PRESS ENTER FOR TITLE', 190, '#f8f8f2', 1);
  }
}

/* ── master render ── */
// INIDISP-style brightness-step scene fades [v0.3, per wpB graphics docs]:
// 6 frames of quantized darkness (0.25 steps) on every scene/camera change.
const FADE = { t: 0, key: '' };
function render(ctx, st) {
  const fkey = st.scene + '|' + (st.scene === 'GAME' ? st.camera.mode : '');
  if (fkey !== FADE.key) { FADE.key = fkey; if (st.phase !== 'BLANK') FADE.t = 6; }
  switch (st.scene) {
    case 'TITLE': renderTitle(ctx, st); applyFade(ctx); return;
    case 'MATCHUP': renderMatchup(ctx, st); applyFade(ctx); return;
    case 'CARD': renderCardScreen(ctx, st, false); applyFade(ctx); return;
    case 'FINAL': renderCardScreen(ctx, st, true); applyFade(ctx); return;
  }
  // GAME
  if (st.phase === 'BLANK') {          // [PROVEN] 6-frame forced blank on contact
    // [DESIGN] 2-frame white impact pop inside the blank, then black
    ctx.fillStyle = st.phaseT < 2 ? '#f8f8f2' : '#000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    return;
  }
  if (st.camera.mode === 'plate') renderPlate(ctx, st);
  else renderField(ctx, st);
  renderHUD(ctx, st);
  applyFade(ctx);
}
function applyFade(ctx) {
  if (FADE.t <= 0) return;
  FADE.t--;
  const step = Math.ceil(FADE.t / 2) * 0.25 + 0.25;      // 0.75 / 0.5 / 0.25 quantized
  ctx.fillStyle = 'rgba(0,0,0,' + step + ')';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}
