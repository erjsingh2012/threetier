// ScrabbleBoard.js
export default class ScrabbleBoard {
  static injected = false;

  constructor(container, boardData = [], options = {}) {
    this.container = container;
    this.boardData = boardData;
    this.tiles = [];
    this.tileClick = options.tileClick || (() => { });

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
      #ScrabbleBoard {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        box-sizing: border-box;
      }
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
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.2);
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
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .tile.occupied {
        background: #34ed06ff !important; /* glow color */
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    this.container.innerHTML = "";
    const board = document.createElement("div");
    board.className = "board";

    this.tiles = [];
    this.boardData.forEach(row => {
      row.forEach(cell => {
        const tile = document.createElement("div");
        tile.className = "tile" + (cell ? ` ${cell}` : "");
        tile.textContent = cell || "";
        tile.addEventListener("click", () => this.tileClick(tile, cell));
        board.appendChild(tile);
        this.tiles.push(tile);
      });
    });

    this.container.appendChild(board);
    this._addTileHoverListeners();
  }

  setTile(x, y, letter = "", bonus = "") {
    const index = y * this.boardData[0].length + x;
    const tile = this.tiles[index];
    if (!tile) return;

    tile.textContent = letter.toUpperCase();

    // Remove all existing classes and re-add base tile + bonus
    tile.className = "tile" + (bonus ? ` ${bonus}` : "");

    // Add occupied class if tile has a letter
    if (letter) {
      tile.classList.add("occupied"); // ✅ correct, no dot
    } else {
      tile.classList.remove("occupied");
    }
  }



  resetBoard() {
    this.boardData.forEach((row, y) => {
      row.forEach((cell, x) => this.setTile(x, y, "", cell));
    });
  }

  _addTileHoverListeners() {
    const highlightColor = "#ffd54f"; // hovered tile color
    this.tiles.forEach(tile => {
      tile.addEventListener("mouseenter", () => {
        tile.style.background = highlightColor;
      });
      tile.addEventListener("mouseleave", () => {
        tile.style.background = ""; // restore class-based background
      });

      tile.addEventListener("touchstart", () => {
        tile.style.background = highlightColor;
      });
      tile.addEventListener("touchend", () => {
        tile.style.background = ""; // restore class-based background
      });
    });
  }


  placeTileFromRack(letter, clientX, clientY) {
    // Find tile under pointer
    const boardTile = this.tiles.find(t => {
      const rect = t.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom;
    });

    if (!boardTile) return false;

    const idx = this.tiles.indexOf(boardTile);
    const x = idx % this.boardData[0].length;
    const y = Math.floor(idx / this.boardData[0].length);

    // Check if tile is already occupied
    if (!boardTile.classList.contains("occupied")) {
      this.setTile(x, y, letter);
      return true;
    }
    return false;
  }
}
