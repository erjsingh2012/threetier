// tile-rack.js
export default class TileRack {
  static injected = false;

  constructor(container, tiles = [], options = {}) {
    this.container = container;
    this.tilesData = tiles; // Array of letters
    this.tiles = [];
    this.tileClick = options.tileClick || (() => {});

    // Configurable options
    this.tileSize = options.tileSize || 70;           // in px
    this.rackBg = options.rackBg || "#ffe082";
    this.tileBg = options.tileBg || "#f4d03f";
    this.tileBorder = options.tileBorder || "5px solid #9e7e38";

    if (!TileRack.injected) {
      this._injectStyles();
      TileRack.injected = true;
    }

    this._render();
    this._initDragAndDrop();
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .tile-rack {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: calc(${this.tileSize}px * 0.12);
        padding: calc(${this.tileSize}px * 0.25);
        background: ${this.rackBg};
        border-radius: calc(${this.tileSize}px * 0.25);
        box-shadow: 0 calc(${this.tileSize}px * 0.08) calc(${this.tileSize}px * 0.2) rgba(0, 0, 0, 0.3);
      }
      .tile-rack .tile {
        width: ${this.tileSize}px;
        height: ${this.tileSize}px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: calc(${this.tileSize}px * 0.5);
        font-weight: bold;
        background: ${this.tileBg};
        border: ${this.tileBorder};
        border-radius: calc(${this.tileSize}px * 0.2);
        cursor: grab;
        user-select: none;
      }
      .tile-rack .rack-placeholder {
        background: #ccc !important;
        color: #888 !important;
        cursor: default;
        opacity: 0.6;
        border: ${this.tileBorder}; dashed #999;
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    this.container.innerHTML = "";
    this.container.classList.add("tile-rack");
    this.tiles = [];

    this.tilesData.forEach(letter => {
      const tile = document.createElement("span");
      tile.className = "tile";
      tile.textContent = letter;
      tile.addEventListener("click", () => this.tileClick(tile, letter));
      this.container.appendChild(tile);
      this.tiles.push(tile);
    });
  }

  _initDragAndDrop() {
    const visualProps = [
      "width","height","justify-content","align-items",
      "display","background","border","border-radius",
      "color","font-size","font-weight","boxShadow"
    ];

    let draggedTile = null;
    let placeholder = null;

    const moveDraggedTile = (e) => {
      if (!draggedTile) return;
      draggedTile.style.left = `${e.clientX - draggedTile.offsetWidth / 2}px`;
      draggedTile.style.top = `${e.clientY - draggedTile.offsetHeight / 2}px`;
    };

    this.container.addEventListener("pointerdown", (e) => {
      if (!e.target.classList.contains("tile")) return;

      placeholder = e.target;
      draggedTile = e.target.cloneNode(true);

      const computed = getComputedStyle(e.target);
      visualProps.forEach(prop => {
        draggedTile.style[prop] = computed.getPropertyValue(prop);
      });

      draggedTile.style.position = "fixed";
      draggedTile.style.zIndex = "1000";
      draggedTile.style.pointerEvents = "none";
      draggedTile.style.opacity = "0.9";

      document.body.appendChild(draggedTile);
      placeholder.classList.add("rack-placeholder");

      moveDraggedTile(e);
    });

    document.addEventListener("pointermove", moveDraggedTile);

    document.addEventListener("pointerup", () => {
      if (!draggedTile) return;
      draggedTile.remove();
      draggedTile = null;

      if (placeholder) {
        placeholder.classList.remove("rack-placeholder");
        placeholder = null;
      }
    });
  }

  shuffle() {
    for (let i = this.tilesData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tilesData[i], this.tilesData[j]] = [this.tilesData[j], this.tilesData[i]];
    }
    this._render();
    this._initDragAndDrop();
  }

  setTile(index, letter) {
    if (!this.tiles[index]) return;
    this.tilesData[index] = letter;
    this.tiles[index].textContent = letter;
  }

  resetRack(letters) {
    this.tilesData = letters;
    this._render();
    this._initDragAndDrop();
  }
}
