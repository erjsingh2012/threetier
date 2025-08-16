// TileRack.js
export default class TileRack {
  static injected = false;

  constructor(container, tiles = [], options = {}) {
    this.container = container;
    this.tilesData = tiles; // Array of letters
    this.tiles = [];
    this.tileClick = options.tileClick || (() => { });

    // Configurable options
    this.tileSize = options.tileSize || 36;           // in px
    this.rackBg = options.rackBg || "#ffe082";
    this.tileBg = options.tileBg || "#f4d03f";
    this.tileBorder = options.tileBorder || "5px solid #9e7e38";

    if (!TileRack.injected) {
      this._injectStyles();
      TileRack.injected = true;
    }

    this._render();
    this._initDragAndDrop();
    this.onTileDrop = options.onTileDrop || (() => { });
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
      background: #f3e6d6; /* same as boardBg: soft cream-beige */
      border-radius: calc(${this.tileSize}px * 0.25);
      box-shadow: 0 calc(${this.tileSize}px * 0.08) calc(${this.tileSize}px * 0.2) rgba(0, 0, 0, 0.3);
      touch-action: none;
    }

    .tile-rack .tile {
      width: ${this.tileSize}px;
      height: ${this.tileSize}px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: calc(${this.tileSize}px * 0.5);
      font-weight: bold;
      color: #222; /* darker letters for readability */
      background: linear-gradient(to bottom, #fff9f0, #f0e0d6); /* warm tile gradient */
      border: 1px solid #d1bfa7; /* subtle border */
      border-radius: calc(${this.tileSize}px * 0.2);
      cursor: grab;
      user-select: none;
      touch-action: none;
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.1s ease, background 0.2s ease;
    }

    .tile-rack .tile:hover {
      background: rgba(255, 213, 79, 0.4); /* subtle hover, matches board hover */
    }

    .tile-rack .tile.occupied {
      background: #fff3b0; /* same as board occupied tile */
      box-shadow: 0 0 8px rgba(255, 235, 130, 0.7);
      color: #222;
    }

    .tile-rack .rack-placeholder {
      background: #ccc !important;
      color: #888 !important;
      cursor: default;
      opacity: 0.6;
      border: 1px dashed #999;
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

      // touchstart for mobile
      tile.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this._startTouchDrag(tile, e.touches[0]);
      });

      this.container.appendChild(tile);
      this.tiles.push(tile);
    });
  }

  _initDragAndDrop() {
    const visualProps = [
      "width", "height", "justify-content", "align-items",
      "display", "background", "border", "border-radius",
      "color", "font-size", "font-weight", "box-shadow"
    ];

    // --- Use class properties instead of local variables ---
    this.draggedTile = null;
    this.placeholder = null;
    this.draggedTileTouch = null;
    this.placeholderTouch = null;

    const moveDraggedTile = (e) => {
      if (!this.draggedTile) return;
      this.draggedTile.style.left = `${e.clientX - this.draggedTile.offsetWidth / 2}px`;
      this.draggedTile.style.top = `${e.clientY - this.draggedTile.offsetHeight / 2}px`;
    };

    this.container.addEventListener("pointerdown", (e) => {
      if (!e.target.classList.contains("tile")) return;

      this.placeholder = e.target;
      this.draggedTile = e.target.cloneNode(true);

      const computed = getComputedStyle(e.target);
      visualProps.forEach(prop => {
        this.draggedTile.style[prop] = computed.getPropertyValue(prop);
      });

      this.draggedTile.style.position = "fixed";
      this.draggedTile.style.zIndex = "1000";
      this.draggedTile.style.pointerEvents = "none";
      this.draggedTile.style.opacity = "0.9";

      document.body.appendChild(this.draggedTile);
      this.placeholder.classList.add("rack-placeholder");

      moveDraggedTile(e);
    });

    document.addEventListener("pointermove", moveDraggedTile);

    document.addEventListener("pointerup", (e) => {
      if (this.draggedTile && this.placeholder) {
        this._handleDrop(this.draggedTile.textContent, e.clientX, e.clientY, this.placeholder);
        this.draggedTile.remove();
        this.draggedTile = null;
        this.placeholder.classList.remove("rack-placeholder");
        this.placeholder = null;
      }
    });

    // --- Touch events ---
    const moveDraggedTileTouch = (e) => {
      if (!this.draggedTileTouch) return;
      const touch = e.touches[0];
      this.draggedTileTouch.style.left = `${touch.clientX - this.draggedTileTouch.offsetWidth / 2}px`;
      this.draggedTileTouch.style.top = `${touch.clientY - this.draggedTileTouch.offsetHeight / 2}px`;
    };

    document.addEventListener("touchmove", moveDraggedTileTouch);

    document.addEventListener("touchend", (e) => {
      if (this.draggedTileTouch && this.placeholderTouch) {
        const touch = e.changedTouches[0];
        this._handleDrop(this.draggedTileTouch.textContent, touch.clientX, touch.clientY, this.placeholderTouch);
        this.draggedTileTouch.remove();
        this.draggedTileTouch = null;
        this.placeholderTouch.classList.remove("rack-placeholder");
        this.placeholderTouch = null;
      }
    });

    this._startTouchDrag = (tile, touch) => {
      this.placeholderTouch = tile;
      this.draggedTileTouch = tile.cloneNode(true);

      const computed = getComputedStyle(tile);
      visualProps.forEach(prop => {
        this.draggedTileTouch.style[prop] = computed.getPropertyValue(prop);
      });

      this.draggedTileTouch.style.position = "fixed";
      this.draggedTileTouch.style.zIndex = "1000";
      this.draggedTileTouch.style.pointerEvents = "none";
      this.draggedTileTouch.style.opacity = "0.9";

      document.body.appendChild(this.draggedTileTouch);
      this.placeholderTouch.classList.add("rack-placeholder");

      this.draggedTileTouch.style.left = `${touch.clientX - this.draggedTileTouch.offsetWidth / 2}px`;
      this.draggedTileTouch.style.top = `${touch.clientY - this.draggedTileTouch.offsetHeight / 2}px`;
    };
  }

  // Helper to trigger drop callback
  _handleDrop(letter, clientX, clientY, placeholderTile) {
    if (this.onTileDrop) this.onTileDrop(letter, clientX, clientY);
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

  enableBoardDrop(boardInstance) {
    if (!boardInstance) return;

    const handleDrop = (letter, clientX, clientY, placeholderTile) => {
      // Trigger external callback
      this.onTileDrop(letter, clientX, clientY);

      const placed = boardInstance.placeTileFromRack(letter, clientX, clientY);

      if (placed) {
        const idx = this.tiles.indexOf(placeholderTile);
        if (idx >= 0) this.setTile(idx, "");
      }
    };

    document.addEventListener("pointerup", (e) => {
      if (this.draggedTile && this.placeholder) {
        handleDrop(this.draggedTile.textContent, e.clientX, e.clientY, this.placeholder);
      }
    });

    document.addEventListener("touchend", (e) => {
      if (this.draggedTileTouch && this.placeholderTouch) {
        const touch = e.changedTouches[0];
        handleDrop(this.draggedTileTouch.textContent, touch.clientX, touch.clientY, this.placeholderTouch);
      }
    });
  }
}
