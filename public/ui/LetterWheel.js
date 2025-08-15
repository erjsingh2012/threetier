// letter-wheel.js
export default class LetterWheel {
  static injected = false;

  constructor(container, letters, options = {}) {
    this.container = container;
    this.letters = letters;
    this.onWordSubmit = options.onWordSubmit || (() => {});
    this.onSelectionChange = options.onSelectionChange || (() => {});
    this.wordList = [];
    this.selectedLetters = [];
    this.selectedPositions = [];
    this.selectedElements = [];
    this.isDragging = false;
    this.lastMousePos = null;
    this.letterPositions = new Map();
    this.size = options.size || 125;         // Wheel size
    this.letterSize = options.letterSize || 25; // Letter div size

    if (!LetterWheel.injected) {
      this._injectStyles();
      LetterWheel.injected = true;
    }

    this._render();
    this._attachEvents();
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .ww-container { }
      .ww-wheel-wrapper {  
        width: ${this.size}px;
        height: ${this.size}px;
      }
      .ww-wheel {
        position: relative; 
        width: ${this.size}px; 
        height: ${this.size}px;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 50%,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(173, 216, 230, 0.8) 40%,
            rgba(70, 130, 180, 0.7) 100%);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25),
          inset 0 4px 15px rgba(255, 255, 255, 0.8),
          inset 0 -4px 15px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.4);
      }
      .ww-svg { 
        position: absolute; 
        top: 0; 
        left: 0; 
        pointer-events: none; 
      }
      .ww-path { 
        stroke: #ff9800; 
        stroke-width: 10; 
        stroke-linecap: round; 
        stroke-linejoin: round; 
        filter: drop-shadow(0 0 6px rgba(255, 152, 0, 0.8)); 
      }
      .ww-letter {
        position: absolute;  
        color: white;
        display: flex; 
        align-items: center; 
        justify-content: center;
        border-radius: 12px; 
        cursor: pointer;
        border: 2px solid rgba(0, 0, 0, 0.2);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
        background: linear-gradient(145deg, #4a90e2, #357ABD);
        transition: transform 0.15s ease;
        width: ${this.letterSize}px;
        height: ${this.letterSize}px;
        font-size: ${Math.floor(this.letterSize * 0.48)}px;
      }
      .ww-letter:hover { transform: scale(1.15); }
      .ww-letter.selected { 
        background: linear-gradient(145deg, #2C5A8A, #1f3f63); 
        transform: scale(1.1); 
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    this.container.innerHTML = `
        <div class="ww-wheel-wrapper" style="position: relative;">
          <div class="ww-wheel"></div>
          <svg class="ww-svg" width="${this.size}" height="${this.size}">
            <polyline class="ww-path" fill="none" />
          </svg>
        </div>
    `;
    this._renderWheel();
  }

  _renderWheel() {
    const wheel = this.container.querySelector(".ww-wheel");
    wheel.innerHTML = "";
    this.letterPositions.clear();

    const total = this.letters.length;
    const radius = this.size * 0.36;
    const centerX = this.size / 2;
    const centerY = this.size / 2;

    this.letters.forEach((letter, index) => {
      const angle = (index / total) * (2 * Math.PI);
      const x = Math.cos(angle) * radius + centerX - this.letterSize / 2;
      const y = Math.sin(angle) * radius + centerY - this.letterSize / 2;

      const div = document.createElement("div");
      div.className = "ww-letter";
      div.textContent = letter;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;

      // Store letter position in SVG space
      this.letterPositions.set(letter, [
        x + this.letterSize / 2,
        y + this.letterSize / 2
      ]);

      div.addEventListener("mousedown", (e) => { 
        this._startSelection(letter, div, x + this.letterSize / 2, y + this.letterSize / 2); 
        e.preventDefault(); 
      });
      div.addEventListener("mouseenter", () => { 
        if (this.isDragging) this._selectLetter(letter, div, x + this.letterSize / 2, y + this.letterSize / 2); 
      });
      div.addEventListener("touchstart", (e) => { 
        this._startSelection(letter, div, x + this.letterSize / 2, y + this.letterSize / 2); 
        e.preventDefault(); 
      });
      div.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("ww-letter")) {
          const l = target.textContent;
          const pos = this.letterPositions.get(l);
          if (pos) this._selectLetter(l, target, pos[0], pos[1]);
        } else {
          this._updateLiveDrag(touch.clientX, touch.clientY);
        }
      });
      wheel.appendChild(div);
    });
  }

  _attachEvents() {
    document.addEventListener("mouseup", () => this._endSelection());
    document.addEventListener("mousemove", (e) => { 
      if (this.isDragging) this._updateLiveDrag(e.clientX, e.clientY); 
    });
    document.addEventListener("touchend", () => this._endSelection());
  }

  _startSelection(letter, element, px, py) {
    this._clearSelection();
    this.isDragging = true;
    this._selectLetter(letter, element, px, py);
  }

  _selectLetter(letter, element, px, py) {
    const idx = this.selectedLetters.indexOf(letter);
    if (!element.classList.contains("selected")) {
      this.selectedLetters.push(letter);
      this.selectedElements.push(element);
      this.selectedPositions.push(this.letterPositions.get(letter) || [px, py]);
      element.classList.add("selected");
      return this._refreshSelectionState();
    }
    if (this.isDragging && idx === this.selectedLetters.length - 2) {
      this.selectedPositions.pop();
      this.selectedLetters.pop();
      this.selectedElements.pop().classList.remove("selected");
      this._refreshSelectionState();
    }
  }

  _refreshSelectionState() {
    this._updatePath();
    this.onSelectionChange(this.selectedLetters);
  }

  _updateLiveDrag(clientX, clientY) {
    if (!this.isDragging || !this.selectedPositions.length) return;
    const svgRect = this.container.querySelector(".ww-svg").getBoundingClientRect();
    this.lastMousePos = [
      clientX - svgRect.left,
      clientY - svgRect.top
    ];
    this._updatePath(true);
  }

  _endSelection() {
    if (this.isDragging && this.selectedLetters.length) this._addToList();
    this.isDragging = false;
    this.lastMousePos = null;
  }

  _updatePath(includeLive = false) {
    const line = this.container.querySelector(".ww-path");
    let points = this.selectedPositions.map(p => p.join(","));
    if (includeLive && this.lastMousePos) points.push(this.lastMousePos.join(","));
    line.setAttribute("points", points.join(" "));
  }

  _addToList() {
    if (this.selectedLetters.length) {
      this.wordList.push(this.selectedLetters.join(""));
      this._clearSelection();
    }
  }

  _clearSelection() {
    this.container.querySelectorAll(".ww-letter").forEach(el => el.classList.remove("selected"));
    this.selectedLetters = [];
    this.selectedPositions = [];
    this.selectedElements = [];
    this.lastMousePos = null;
    this._updatePath();
  }
}
