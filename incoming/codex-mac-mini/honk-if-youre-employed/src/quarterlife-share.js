import { lifeEra } from './quarterlife-recap.js';

/** A local souvenir, generated from read-only run data. Nothing is uploaded. */
export async function downloadLifeRecap(state) {
  if (state.phase !== 'ended') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1000; canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not create your recap image.');
  const ink = '#2b3c33', muted = '#7e896e';
  const text = (value, x, y, size = 24, color = ink, serif = false) => {
    ctx.fillStyle = color; ctx.font = `${size}px ${serif ? 'Georgia' : 'sans-serif'}`; ctx.fillText(String(value), x, y);
  };
  const wrap = (value, x, y, width, size = 24, lineHeight = 33, color = ink, serif = false) => {
    ctx.font = `${size}px ${serif ? 'Georgia' : 'sans-serif'}`;
    let line = '';
    for (const word of String(value).split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > width && line) { text(line, x, y, size, color, serif); y += lineHeight; line = word; }
      else line = next;
    }
    if (line) { text(line, x, y, size, color, serif); y += lineHeight; }
    return y;
  };
  const box = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, 15); ctx.fill(); };
  ctx.fillStyle = '#f5f2e9'; ctx.fillRect(0, 0, 1000, 1280);
  ctx.strokeStyle = '#deded1'; ctx.lineWidth = 2; ctx.strokeRect(32, 32, 936, 1216);
  text('26', 70, 178, 130, ink, true); text('DOING MY BEST', 252, 126, 25); text('MY MONTH, WRAPPED.', 254, 163, 17, muted);
  ctx.beginPath(); ctx.moveTo(70, 208); ctx.lineTo(930, 208); ctx.stroke();
  const era = lifeEra(state);
  text('THE GROUP CHAT HAS NAMED MY ERA:', 70, 260, 17, muted);
  let y = wrap(era.name, 70, 330, 850, 53, 60, ink, true);
  y = wrap(era.line, 70, y + 10, 840, 23, 32, muted) + 28;
  const cash = state.stats.cash;
  const figures = [[`${cash < 0 ? '−' : ''}$${Math.abs(cash).toLocaleString('en-US')}`, 'AFTER RENT'], [state.memories.length, 'LITTLE MEMORIES'], [state.combos, 'SMALL-WIN COMBOS'], [state.boundaries, 'HEALTHY BOUNDARIES']];
  figures.forEach(([value, label], i) => {
    const x = 70 + (i % 2) * 440, yy = y + Math.floor(i / 2) * 135;
    box(x, yy, 420, 117, ['#e2e9d9', '#f4e2d7', '#f2e9cb', '#e8e4ef'][i]);
    text(value, x + 24, yy + 62, 44, ink, true); text(label, x + 25, yy + 91, 14, muted);
  });
  y += 304;
  text('THINGS I’M TAKING WITH ME', 70, y, 17, muted); y += 42;
  const memories = state.memories.slice(-3);
  if (!memories.length) y = wrap('The knowledge that making it through still counts.', 70, y, 820, 25, 34, ink, true);
  for (const memory of memories) { y = wrap(`— ${memory.title}`, 70, y, 820, 25, 35, ink, true) + 10; }
  box(70, 1030, 860, 130, '#2b3c33');
  text('DOING-MY-BEST SCORE', 96, 1071, 16, '#bdc8b1'); text(state.ending.score.toLocaleString('en-US'), 95, 1131, 53, '#faf6e7', true);
  text(`${state.ending.wins}/4 little goals`, 690, 1123, 22, '#d7dfcd');
  text('Not a life score. Just one very human month.', 70, 1201, 18, muted);
  text(`MONTH SEED ${state.seed}`, 650, 1201, 15, muted);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('This browser could not save your recap image.');
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = `26-my-month-${state.seed}.png`; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return true;
}
