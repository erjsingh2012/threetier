class BoardComponent {
  constructor(container, options = {}) {
    this.container = (typeof container === 'string') ? document.getElementById(container) : container;
    if (!this.container) throw new Error('Container not found');

    // Configurable options
    this.size = options.size || 11;
    this.boardData = options.boardData || this._defaultBoardData();
    this.wordColors = options.wordColors || [
      '#4caf50', '#2196f3', '#f44336', '#ff9800',
      '#9c27b0', '#009688', '#e91e63', '#3f51b5',
    ];
    this.wordCount = 0;

    // Tiles matrix
    this.tiles = [];

    this._render();
  }

  _defaultBoardData() {
    return [
      ['TW', '', '', 'DL', '', '', 'DL', '', '', '', 'TW'],
      ['', 'DW', '', '', '', 'TL', '', '', '', 'DW', ''],
      ['', '', 'DW', '', '', '', '', '', 'DW', '', ''],
      ['DL', '', '', 'DW', '', '', '', 'DW', '', '', 'DL'],
      ['', '', '', '', 'DW', '', 'DW', '', '', '', ''],
      ['', 'TL', '', '', '', '★', '', '', '', 'TL', ''],
      ['', '', '', '', 'DW', '', 'DW', '', '', '', ''],
      ['DL', '', '', 'DW', '', '', '', 'DW', '', '', 'DL'],
      ['', '', 'DW', '', '', '', '', '', 'DW', '', ''],
      ['', 'DW', '', '', '', 'TL', '', '', '', 'DW', ''],
      ['TW', '', '', 'DL', '', '', 'DL', '', '', '', 'TW']
    ];
  }

  _injectStyles() {
    if (BoardComponent.hasInjectedStyles) return;
    const style = document.createElement('style');
    style.textContent = `
      .board {
        display: grid;
        grid-template-columns: repeat(${this.size}, 1fr);
        gap: 0;
        background: #e0e0e0;
        padding: 10px 16px;
        width: 90vw;
        max-width: 500px;
        aspect-ratio: 1 / 1;
        border-radius: 14px;
        user-select: none;
        box-shadow: 0 3px 6px rgb(0 0 0 / 0.1);
      }
      .tile {
        width: 100%;
        aspect-ratio: 1 / 1;
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(to bottom, #e8f4d0, #b5f9f467);
        display: flex;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        border-radius: 10px;
        box-shadow:
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #d0d0d0;
        transition:
          background-color 0.3s ease,
          color 0.3s ease,
          transform 0.1s ease;
        cursor: default;
        user-select: none;
      }
      .word-tile {
        border-radius: 0 !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        cursor: default;
      }
      .word-start {
        border-top-left-radius: 10px !important;
        border-bottom-left-radius: 10px !important;
      }
      .word-end {
        border-top-right-radius: 10px !important;
        border-bottom-right-radius: 10px !important;
      }
      .word-start-vertical {
        border-top-left-radius: 10px !important;
        border-top-right-radius: 10px !important;
      }
      .word-end-vertical {
        border-bottom-left-radius: 10px !important;
        border-bottom-right-radius: 10px !important;
      }
      .TW {
        background: #f44336;
        color: #fff;
        border-color: #d32f2f;
        font-weight: 800;
        font-size: 0.85rem;
        user-select: none;
      }
      .DW {
        background: #ffc107;
        color: #000;
        border-color: #ffa000;
        font-weight: 800;
        font-size: 0.85rem;
        user-select: none;
      }
      .TL {
        background: #2196f3;
        border-color: #1976d2;
        user-select: none;
      }
      .DL {
        background: #9e9e9e;
        border-color: #7e7e7e;
        user-select: none;
      }
      .placed {
        background-color: #4caf50 !important;
        color: #fff !important;
        font-weight: bolder;
        box-shadow: none !important;
        border: none !important;
        cursor: default;
        user-select: text;
        transition: background-color 0.3s ease, color 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    BoardComponent.hasInjectedStyles = true;
  }

  _render() {
    this._injectStyles();
    this.container.innerHTML = '';
    this.container.classList.add('board');
    this.container.setAttribute('tabindex', '0');

    this.tiles = [];
    for (let r = 0; r < this.size; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.size; c++) {
        const cell = this.boardData[r]?.[c] || '';
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (cell) tile.classList.add(cell);
        tile.textContent = cell || '';
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('aria-rowindex', r + 1);
        tile.setAttribute('aria-colindex', c + 1);
        tile.setAttribute('tabindex', '-1');
        this.container.appendChild(tile);
        this.tiles[r][c] = tile;
      }
    }
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  clearBoard() {
    for (const row of this.tiles) {
      for (const tile of row) {
        tile.textContent = '';
        tile.className = 'tile';
        tile.style.background = '';
        tile.style.color = '';
        tile.style.borderRadius = '';
        tile.classList.remove(
          'word-start', 'word-end',
          'word-start-vertical', 'word-end-vertical',
          'placed', 'word-tile'
        );
      }
    }
    this.wordCount = 0;
  }

  placeTile(letter, row, col) {
    if (!this.isValidPosition(row, col)) {
      console.warn(`Invalid tile position (${row}, ${col})`);
      return false;
    }
    const tile = this.tiles[row][col];
    tile.textContent = letter.toUpperCase();
    tile.className = 'tile placed';
    tile.style.backgroundColor = '#4caf50';
    tile.style.color = '#fff';

    tile.classList.remove('word-tile', 'word-start', 'word-end', 'word-start-vertical', 'word-end-vertical');
    tile.style.borderRadius = '';
    return true;
  }

  placeWord(word, startRow, startCol, direction = 'horizontal') {
    direction = direction.toLowerCase();
    if (direction !== 'horizontal' && direction !== 'vertical') {
      console.error('Direction must be "horizontal" or "vertical"');
      return false;
    }

    word = word.toUpperCase();

    // Validate bounds
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'horizontal' ? startRow : startRow + i;
      const c = direction === 'horizontal' ? startCol + i : startCol;

      if (!this.isValidPosition(r, c)) {
        console.warn(`Word placement out of bounds at (${r},${c})`);
        return false;
      }
    }

    const color = this.wordColors[this.wordCount % this.wordColors.length];
    this.wordCount++;

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'horizontal' ? startRow : startRow + i;
      const c = direction === 'horizontal' ? startCol + i : startCol;

      const tile = this.tiles[r][c];
      tile.textContent = word[i];
      tile.className = 'tile placed word-tile';
      tile.style.backgroundColor = color;
      tile.style.color = '#fff';
      tile.style.borderRadius = '0';

      if (i === 0) {
        if (direction === 'horizontal') tile.classList.add('word-start');
        else tile.classList.add('word-start-vertical');
      } else if (i === word.length - 1) {
        if (direction === 'horizontal') tile.classList.add('word-end');
        else tile.classList.add('word-end-vertical');
      }
    }
    return true;
  }
}

// Usage:
// const board = new BoardComponent('board-container');
// board.placeTile('A', 5, 5);
// board.placeWord('HELLO', 2, 3, 'horizontal');

export { BoardComponent };
