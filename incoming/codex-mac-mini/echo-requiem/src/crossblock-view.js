import { CROSSBLOCK_SIZE as SIZE } from './contracts.js';
import { pieceSize, pieceFits, previewPlacement } from './sim/crossblock.js';
const number = value => value.toLocaleString('en-US');

export function createCrossblockView() {
  const board = document.querySelector('#board'), tray = document.querySelector('#tray'), cells = [];
  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement('div'); row.className = 'board-row'; row.setAttribute('role', 'row');
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement('button'); cell.className = 'cell'; cell.dataset.x = x; cell.dataset.y = y;
      cell.setAttribute('role', 'gridcell'); cell.setAttribute('aria-rowindex', y + 1); cell.setAttribute('aria-colindex', x + 1);
      cell.tabIndex = x === 0 && y === 0 ? 0 : -1; row.append(cell); cells.push(cell);
    }
    board.append(row);
  }
  let toastTimeout;
  function announce(message) { document.querySelector('#announcement').textContent = message; }
  function preview(world, ui) {
    document.querySelector('#tray-hint').textContent = 'Pick one. Place anywhere it fits.';
    cells.forEach((cell, index) => {
      cell.className = `cell${world.board[index] ? ` filled color-${world.board[index]}` : ''}`;
      cell.setAttribute('aria-label', `Row ${Math.floor(index / SIZE) + 1}, column ${index % SIZE + 1}, ${world.board[index] ? 'occupied' : 'empty'}`);
      cell.setAttribute('aria-selected', 'false'); cell.tabIndex = index === ui.cursor.y * SIZE + ui.cursor.x ? 0 : -1;
    });
    if (!ui.showPreview || ui.selected < 0 || !world.hand[ui.selected] || world.status !== 'playing') return;
    const piece = world.hand[ui.selected], result = previewPlacement(world, ui.selected, ui.cursor.x, ui.cursor.y);
    for (const [dx, dy] of piece.cells) {
      const x = ui.cursor.x + dx, y = ui.cursor.y + dy;
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
      const cell = cells[y * SIZE + x]; cell.className = `cell color-${piece.color} ${result.valid ? 'ghost' : 'invalid'}`;
      cell.setAttribute('aria-selected', 'true');
    }
    for (const index of result.cleared) cells[index].classList.add('will-clear');
    if (ui.keyboard) cells[ui.cursor.y * SIZE + ui.cursor.x]?.classList.add('keyboard-cursor');
    document.querySelector('#tray-hint').textContent = result.rows.length && result.columns.length
      ? 'A Cross! Double line points.' : result.cleared.length ? `${result.rows.length + result.columns.length} line clear lined up.` : 'Pick one. Place anywhere it fits.';
  }
  function render(world, ui, profile, completedDaily = null) {
    preview(world, ui); tray.replaceChildren();
    world.hand.forEach((piece, index) => {
      const card = document.createElement('button'); card.className = `piece-card${ui.selected === index ? ' selected' : ''}`; card.dataset.slot = index;
      if (!piece) {
        card.classList.add('used'); card.disabled = true; card.setAttribute('aria-label', `Shape ${index + 1}, placed`);
        card.innerHTML = '<span aria-hidden="true">✓</span><span class="piece-label">NICELY PLACED</span>';
      } else {
        const fits = pieceFits(world, piece), { width, height } = pieceSize(piece);
        card.setAttribute('aria-label', `Shape ${index + 1}: ${piece.name}, ${width} by ${height}${fits ? '' : ', no space in any rotation'}`);
        card.setAttribute('aria-pressed', ui.selected === index ? 'true' : 'false'); if (!fits) card.classList.add('no-fit');
        const shape = document.createElement('span'); shape.className = `piece-shape color-${piece.color}${height >= 4 ? ' tall-shape' : ''}`;
        shape.style.setProperty('--cols', width); shape.style.setProperty('--rows', height); shape.setAttribute('aria-hidden', 'true');
        for (const [x, y] of piece.cells) {
          const tile = document.createElement('i'); tile.className = 'mini-block'; tile.style.gridColumn = x + 1; tile.style.gridRow = y + 1; shape.append(tile);
        }
        const label = document.createElement('span'); label.className = 'piece-label';
        const shortcut = document.createElement('b'); shortcut.textContent = `0${index + 1}`;
        label.append(shortcut, fits ? piece.name : 'No space'); card.append(shape, label);
      }
      tray.append(card);
    });
    const daily = world.mode === 'daily', won = world.status === 'won';
    document.querySelector('#mode-free').setAttribute('aria-pressed', String(!daily));
    document.querySelector('#mode-daily').setAttribute('aria-pressed', String(daily));
    document.querySelector('#mode-description').textContent = daily ? `${world.puzzleKey} · Clear every block with just three shapes.` : 'Your pace. Your next personal best.';
    document.querySelector('#score-label').textContent = daily ? 'PUZZLE SCORE' : 'YOUR SCORE';
    document.querySelector('#best-label').textContent = daily ? 'TODAY’S BEST' : 'PERSONAL BEST';
    document.querySelector('#score').textContent = number(world.score);
    document.querySelector('#best-score').textContent = number(daily ? (completedDaily?.key === world.puzzleKey ? completedDaily.score : 0) : profile.bestScore);
    document.querySelector('#lines').textContent = String(world.lines).padStart(2, '0'); document.querySelector('#moves').textContent = String(world.moves).padStart(2, '0');
    document.querySelector('#rotate-button').disabled = ui.selected < 0 || world.status !== 'playing'; document.querySelector('#undo-button').disabled = !world.undo;
    document.querySelector('#selection-label').textContent = won ? 'A perfect fit. Beautifully done.' : world.status === 'over' ? 'Try undo, or give it another go.' : ui.selected < 0 ? 'Choose a shape to get started' : `${world.hand[ui.selected]?.name ?? 'Shape'} selected · R to rotate`;
    document.querySelector('#board-label').textContent = won ? 'TODAY’S PUZZLE. SOLVED.' : world.status === 'over' ? 'ONE MORE ANGLE?' : daily ? `${3 - world.moves} SHAPE${world.moves === 2 ? '' : 'S'} LEFT. MAKE ROOM.` : world.chain > 1 ? `${world.chain} CLEAR STREAK. KEEP IT GOING.` : 'YOUR NEXT GOOD MOVE';
    document.querySelector('#chain-card').classList.toggle('flowing', world.chain > 0);
    document.querySelector('#chain-title').textContent = world.chain > 0 ? `${world.chain} clear${world.chain === 1 ? '' : 's'} in a row.` : 'Find your flow.';
    document.querySelector('#chain-description').textContent = world.chain > 0 ? `Clear again next move for +${world.chain * 50} streak points.` : 'Clear lines on consecutive moves to build a streak.';
    document.querySelectorAll('.chain-dots i').forEach((dot, i) => dot.classList.toggle('active', i < world.chain));
    if (daily) {
      document.querySelector('#chain-title').textContent = won ? 'A perfect fit.' : 'Three shapes. One clean slate.';
      document.querySelector('#chain-description').textContent = won ? 'Come back tomorrow for another arrangement. Your free-play board is waiting.' : 'Empty the board in three placements. Rotate freely. Undo or retry any time.';
      document.querySelectorAll('.chain-dots i').forEach((dot, i) => { dot.classList.toggle('active', i < world.moves); dot.hidden = i >= 3; });
    } else document.querySelectorAll('.chain-dots i').forEach(dot => { dot.hidden = false; });
    document.querySelector('#new-button').textContent = daily ? '↻  Retry this puzzle' : '↗  A fresh start';
    document.querySelector('#board-shell').classList.toggle('puzzle-solved', won);
  }
  function toast(title, subtitle = '') {
    const node = document.querySelector('#board-toast'); clearTimeout(toastTimeout); node.replaceChildren(document.createTextNode(title));
    if (subtitle) { const small = document.createElement('small'); small.textContent = subtitle; node.append(small); }
    node.classList.remove('visible'); void node.offsetWidth; node.classList.add('visible'); toastTimeout = setTimeout(() => node.classList.remove('visible'), 1700);
  }
  function consume(events) {
    for (const event of events) {
      if (event.type === 'placed') {
        for (const index of event.cells) cells[index].classList.add('just-placed');
        const score = document.querySelector('#score'); score.classList.remove('pop'); void score.offsetWidth; score.classList.add('pop');
      }
      if (event.type === 'cleared') {
        const effects = document.querySelector('#effects');
        for (const { index, color } of event.cells) {
          const flash = document.createElement('i'); flash.className = `clear-flash color-${color}`;
          flash.style.left = `${cells[index].offsetLeft - board.offsetLeft}px`; flash.style.top = `${cells[index].offsetTop - board.offsetTop}px`;
          effects.append(flash); setTimeout(() => flash.remove(), 550);
        }
        const lineCount = event.rows.length + event.columns.length;
        toast(event.cross ? 'CROSS!' : lineCount > 1 ? `${lineCount} LINES. NICE.` : ['ROOM TO BREATHE.', 'THAT’S THE FIT.', 'NICELY DONE.'][event.chain % 3], `+${number(event.points)}${event.chain > 1 ? ` · ${event.chain} CLEAR STREAK` : ''}`);
      }
      if (event.type === 'perfect-clear') toast('CLEAN SLATE!', '+500 · EVERY SQUARE CLEARED');
    }
  }
  function bump() { const shell = document.querySelector('#board-shell'); shell.classList.remove('bump'); void shell.offsetWidth; shell.classList.add('bump'); }
  function resetEffects() { clearTimeout(toastTimeout); document.querySelector('#effects').replaceChildren(); document.querySelector('#board-toast').classList.remove('visible'); }
  return { render, preview, consume, toast, bump, announce, resetEffects, cells };
}
