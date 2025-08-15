// scrabble-board.js
export default class ScrabbleBoard {
  static injected = false;

  constructor(container, boardData = [], options = {}) {
    this.container = container;
    this.boardData = boardData;
    this.tiles = [];
    this.tileClick = options.tileClick || (() => {});

    // Configurable options
    this.boardWidth = options.boardWidth || 500;           // Board max-width in px
    this.tileWidth = options.tileWidth || "90%";           // Tile width relative to cell
    this.boardBg = options.boardBg || "#92ceecff";         // Board background color
    this.tileBg = options.tileBg || "linear-gradient(to bottom, #e8f4d0, #b5f9f467)"; // Tile background

    if (!ScrabbleBoard.injected) {
      this._injectStyles();
      ScrabbleBoard.injected = true;
    }

    this._render();
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .board {
        display: grid;
        grid-template-columns: repeat(${this.boardData[0]?.length || 11}, 1fr);
        gap: 1px;
        width: 100%;
        max-width: ${this.boardWidth}px;
        aspect-ratio: 1/1;
        border-radius: 10px;
        margin: 0 auto;
        background-color: ${this.boardBg};
      }
      .tile {
        width: ${this.tileWidth};
        aspect-ratio: 1/1;
        font-size: 0.7rem;
        font-weight: bold;
        color: #fff;
        background: ${this.tileBg};
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        text-transform: uppercase;
        border-radius: 10px;
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.2);
        border: 1px solid #ccc;
        transition: transform 0.1s ease;
      }
      .TW { background: #c62828; }
      .DW { background: #f9a825; }
      .TL { background: #1565c0; }
      .DL { background: #6a1b9a; }
      .TW, .DW, .TL, .DL {
        font-weight: bold;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    this.container.innerHTML = "";
    const board = document.createElement("div");
    board.className = "board";

    this.boardData.forEach(row => {
      row.forEach(cell => {
        const tile = document.createElement("div");
        tile.className = "tile" + (cell ? ` ${cell}` : "");
        tile.textContent = cell || "";
        tile.addEventListener("click", () => this.tileClick(tile, cell));
        this.tiles.push(tile);
        board.appendChild(tile);
      });
    });

    this.container.appendChild(board);
  }

  setTile(x, y, letter = "", bonus = "") {
    const index = y * this.boardData[0].length + x;
    const tile = this.tiles[index];
    if (!tile) return;
    tile.textContent = letter.toUpperCase();
    tile.className = "tile" + (bonus ? ` ${bonus}` : "");
  }

  resetBoard() {
    this.boardData.forEach((row, y) => {
      row.forEach((cell, x) => this.setTile(x, y, "", cell));
    });
  }
}
