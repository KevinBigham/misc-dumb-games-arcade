// ===================== KILNSHOT DATA: LEVELS =====================
// Each chapter teaches one idea, then a twist level blocks the obvious approach.
// segs: [x1,y1,x2,y2, mat('stone'|'spring'|'clay'), gate?]
// pots: {x,y,k:'s'(flawed, smash it) | 'k'(keeper, spare it), r, n:beads inside, hard, cord:[ax,ay]}
// pegs: [x,y,r]  latches: {x,y,t:[gates]}  gates:{A:true=closed}  fans:[x,y,w,h,ax,ay]
const CHAPTERS = [
  { n: 1, name: 'The Throw', idea: 'Pull back, let go, smash the cracked pots.' },
  { n: 2, name: 'Keepers', idea: 'Glossy blue pots are good. Do not break them.' },
  { n: 3, name: 'Ember Jars', idea: 'Jars full of embers spill and chain.' },
  { n: 4, name: 'Cords', idea: 'Cut a cord and the pot drops.' },
  { n: 5, name: 'Reed & Clay', idea: 'Reed mats fling you up. Wet clay swallows you.' },
  { n: 6, name: 'Latches', idea: 'Strike a latch to swing its doors.' },
  { n: 7, name: 'Bellows', idea: 'Kiln air pushes everything it touches.' },
  { n: 8, name: 'Thick Glaze', idea: 'Only a hard, direct hit cracks a thick pot.' },
];

const LEVELS = [
  // ---------- 1. The Throw ----------
  { id: 'L01', ch: 1, name: 'First Firing', par: 1, sling: [56, 556],
    hint: 'Pull back anywhere on the screen, aim, and let go.',
    segs: [[210, 470, 320, 470]],
    pots: [{ x: 265, y: 451 }] },
  { id: 'L02', mirror: true, ch: 1, name: 'Over the Wall', par: 1, sling: [56, 556],
    hint: 'Pull down farther for a higher, harder throw.',
    segs: [[170, 628, 170, 390]],
    pots: [{ x: 270, y: 609 }] },
  { id: 'L03', ch: 1, name: 'Punch Through', par: 1, sling: [44, 410],
    hint: 'An ember smashes straight through a cracked pot and keeps flying.',
    segs: [[0, 426, 70, 426], [150, 440, 350, 440], [350, 440, 350, 400]],
    pots: [{ x: 190, y: 421 }, { x: 240, y: 421 }, { x: 290, y: 421 }] },
  { id: 'L04', ch: 1, name: 'Off the Wall', par: 1, sling: [56, 556],
    hint: 'Twist: the roof blocks every straight throw. Let the far wall drop you in.',
    segs: [[180, 628, 180, 250], [180, 250, 305, 250]],
    pots: [{ x: 300, y: 609 }] },
  // ---------- 2. Keepers ----------
  { id: 'L05', ch: 2, name: 'Mind the Good Pot', par: 1, sling: [56, 556],
    hint: 'The glossy blue pot is a keeper. Break it and the firing is ruined.',
    segs: [],
    pots: [{ x: 200, y: 609, k: 'k' }, { x: 236, y: 609, k: 'k' }, { x: 300, y: 609 }] },
  { id: 'L06', mirror: true, ch: 2, name: 'Soft Touch', par: 1, sling: [56, 556],
    hint: 'Twist: punching through now hits the keeper. Come in from above.',
    segs: [[140, 420, 330, 420], [330, 420, 330, 380]],
    pots: [{ x: 210, y: 401, k: 'k' }, { x: 260, y: 401 }] },
  { id: 'L07', ch: 2, name: 'Crowded Shelf', par: 2, sling: [56, 556],
    hint: 'Two cracked pots, three keepers. Pick your lines.',
    segs: [[120, 460, 340, 460], [180, 300, 360, 300]],
    pots: [{ x: 160, y: 441, k: 'k' }, { x: 210, y: 441 }, { x: 260, y: 441, k: 'k' }, { x: 260, y: 281 }, { x: 310, y: 281, k: 'k' }] },
  // ---------- 3. Ember Jars ----------
  { id: 'L08', ch: 3, name: 'Full Jar', par: 1, sling: [56, 556],
    hint: 'A jar of embers bursts when it cracks. Hit the one on top.',
    segs: [[120, 470, 250, 470]],
    pots: [{ x: 184, y: 395, n: 8 }, { x: 168, y: 423 }, { x: 200, y: 423 }, { x: 152, y: 451 }, { x: 184, y: 451 }, { x: 216, y: 451 }] },
  { id: 'L09', ch: 3, name: 'Chain Shelf', par: 1, sling: [56, 556],
    hint: 'One crack can start a cascade. Find the first domino.',
    segs: [[140, 220, 180, 220], [190, 310, 230, 310], [240, 400, 280, 400], [215, 628, 215, 500]],
    pots: [{ x: 160, y: 201, n: 3 }, { x: 210, y: 291, n: 3 }, { x: 260, y: 381, n: 4 },
           { x: 260, y: 609 }, { x: 298, y: 609 }, { x: 336, y: 609 }] },
  { id: 'L10', mirror: true, ch: 3, name: 'Hot Spill', par: 1, sling: [56, 556],
    hint: 'Twist: spilled embers fall where they are thrown. A keeper waits below.',
    segs: [[150, 300, 210, 300], [250, 628, 250, 590]],
    pots: [{ x: 180, y: 281, n: 4 }, { x: 180, y: 609, k: 'k' }, { x: 300, y: 609 }, { x: 335, y: 609 }] },
  // ---------- 4. Cords ----------
  { id: 'L11', ch: 4, name: 'Cut Loose', par: 1, sling: [56, 556],
    hint: 'This pot is caged. Cut its cord and it drops.',
    segs: [[205, 380, 205, 460], [275, 380, 275, 460], [205, 460, 275, 460], [205, 380, 232, 380], [248, 380, 275, 380]],
    pots: [{ x: 240, y: 420, cord: [240, 90] }] },
  { id: 'L12', ch: 4, name: 'Drop Zone', par: 1, sling: [56, 556],
    hint: 'Cut the cord and drop the jar right into the bin.',
    segs: [[170, 628, 170, 330], [225, 180, 225, 280], [275, 180, 275, 280], [225, 180, 242, 180], [258, 180, 275, 180]],
    pots: [{ x: 250, y: 250, n: 6, cord: [250, 60] }, { x: 210, y: 609 }, { x: 250, y: 609 }, { x: 290, y: 609 }, { x: 330, y: 609 }] },
  { id: 'L13', ch: 4, name: 'Hanging Keeper', par: 1, sling: [56, 556],
    hint: 'Twist: that cord holds a keeper. Do not cut it.',
    segs: [[260, 470, 345, 470]],
    pots: [{ x: 220, y: 420, k: 'k', cord: [220, 40] }, { x: 300, y: 451 }] },
  // ---------- 5. Reed & Clay ----------
  { id: 'L14', mirror: true, ch: 5, name: 'Reed Mat', par: 1, sling: [56, 556],
    hint: 'Green reed mats always fling you up hard.',
    segs: [[170, 60, 170, 470], [240, 400, 360, 400], [240, 340, 360, 340], [190, 620, 330, 620, 'spring']],
    pots: [{ x: 320, y: 381 }] },
  { id: 'L15', ch: 5, name: 'Wet Clay', par: 2, sling: [56, 556], floor: 'clay',
    hint: 'Twist: brown clay swallows embers. No floor bounces today.',
    segs: [[220, 410, 360, 410], [260, 470, 360, 470], [120, 610, 180, 560, 'spring']],
    pots: [{ x: 320, y: 451 }, { x: 290, y: 609 }] },
  { id: 'L16', ch: 5, name: 'Too Much Spring', par: 2, sling: [56, 556],
    hint: 'Twist: a reed mat flings embers straight into a keeper. Land elsewhere.',
    segs: [[200, 622, 300, 622, 'spring'], [190, 350, 310, 350], [120, 200, 200, 200]],
    pots: [{ x: 250, y: 331, k: 'k' }, { x: 160, y: 181 }, { x: 330, y: 609 }, { x: 170, y: 609 }] },
  // ---------- 6. Latches ----------
  { id: 'L17', ch: 6, name: 'The Latch', par: 2, sling: [56, 556], gates: { A: true },
    hint: 'Strike the gold latch to swing its door open.',
    segs: [[240, 500, 360, 500], [240, 420, 360, 420], [240, 420, 240, 500, 'stone', 'A']],
    latches: [{ x: 150, y: 260, t: ['A'] }],
    pots: [{ x: 310, y: 481 }] },
  { id: 'L18', mirror: true, ch: 6, name: 'Two Doors', par: 3, sling: [56, 556], gates: { A: true, B: false },
    hint: 'Each strike swings both doors. Think about the order.',
    segs: [[220, 260, 360, 260], [220, 200, 360, 200], [220, 200, 220, 260, 'stone', 'A'],
           [220, 520, 360, 520], [220, 460, 360, 460], [220, 460, 220, 520, 'stone', 'B']],
    latches: [{ x: 100, y: 330, t: ['A', 'B'] }],
    pots: [{ x: 310, y: 241 }, { x: 310, y: 501 }] },
  { id: 'L19', ch: 6, name: 'Trapdoor', par: 1, sling: [56, 556], gates: { A: true },
    hint: 'Twist: a door can be a floor too.',
    segs: [[200, 240, 280, 240, 'stone', 'A'], [200, 140, 200, 240], [280, 140, 280, 240], [200, 140, 280, 140],
           [180, 628, 180, 470]],
    latches: [{ x: 110, y: 230, t: ['A'] }],
    pots: [{ x: 240, y: 221, n: 7 }, { x: 205, y: 609 }, { x: 240, y: 609 }, { x: 285, y: 609 }, { x: 325, y: 609 }] },
  // ---------- 7. Bellows ----------
  { id: 'L20', ch: 7, name: 'Bellows', par: 1, sling: [56, 556],
    hint: 'Blue kiln air lifts anything that drifts into it.',
    segs: [[200, 628, 200, 330], [200, 200, 360, 200], [260, 140, 360, 140]],
    fans: [[210, 210, 60, 410, 0, -1500]],
    pots: [{ x: 320, y: 181 }] },
  { id: 'L21', ch: 7, name: 'Crosswind', par: 1, sling: [56, 556],
    hint: 'Air pushes sideways too. Throw into the wind.',
    segs: [[0, 160, 90, 160], [90, 160, 90, 135], [0, 300, 120, 300]],
    fans: [[0, 0, 360, 250, -850, 0]],
    pots: [{ x: 40, y: 141 }, { x: 160, y: 609, k: 'k' }] },
  { id: 'L22', ch: 7, name: 'Hot Draft', par: 1, sling: [56, 556],
    hint: 'Twist: rising air shields that pot from above. Come in low.',
    segs: [[150, 628, 150, 590]],
    fans: [[250, 160, 110, 468, 0, -1500]],
    pots: [{ x: 200, y: 609, k: 'k' }, { x: 300, y: 609 }, { x: 290, y: 200, k: 'k' }] },
  // ---------- 8. Thick Glaze ----------
  { id: 'L23', mirror: true, ch: 8, name: 'Thick Glaze', par: 1, sling: [44, 410],
    hint: 'Green-glazed pots shrug off soft hits. Line them up and throw hard.',
    segs: [[0, 426, 70, 426], [160, 440, 330, 440]],
    pots: [{ x: 200, y: 421, hard: true }, { x: 250, y: 421, hard: true }, { x: 300, y: 421 }] },
  { id: 'L24', ch: 8, name: "The Master's Kiln", par: 3, sling: [180, 556], gates: { A: true },
    hint: 'Everything you learned, in one firing. Plan your throws.',
    segs: [[20, 420, 150, 420], [270, 560, 360, 560], [270, 560, 270, 628, 'stone', 'A']],
    pegs: [[72, 330, 8]],
    latches: [{ x: 310, y: 190, t: ['A'] }],
    pots: [{ x: 72, y: 190, n: 6, cord: [72, 40] }, { x: 38, y: 401 }, { x: 108, y: 401 },
           { x: 320, y: 609, hard: true }, { x: 320, y: 541, k: 'k' }] },

];

// Some levels are authored on the left and flipped here, so throws don't all bank off the same wall.
function mirrorLevel(l) {
  const W = CONFIG.W, fx = (x) => W - x;
  l.sling = [fx(l.sling[0]), l.sling[1]];
  if (l.segs) l.segs = l.segs.map(s => [fx(s[0]), s[1], fx(s[2]), s[3]].concat(s.slice(4)));
  if (l.pots) l.pots = l.pots.map(p => Object.assign({}, p, { x: fx(p.x) }, p.cord ? { cord: [fx(p.cord[0]), p.cord[1]] } : {}));
  if (l.pegs) l.pegs = l.pegs.map(p => [fx(p[0])].concat(p.slice(1)));
  if (l.latches) l.latches = l.latches.map(q => Object.assign({}, q, { x: fx(q.x) }));
  if (l.fans) l.fans = l.fans.map(f => [W - f[0] - f[2], f[1], f[2], f[3], -f[4], f[5]]);
  delete l.mirror;
}
for (const l of LEVELS) if (l.mirror) mirrorLevel(l);
