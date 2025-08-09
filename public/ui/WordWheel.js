class WordWheel {
  constructor(container, letters, options = {}) {
    this.container = container;
    this.letters = letters;
    this.onWordSubmit = options.onWordSubmit || function () { };
    this.onSelectionChange = options.onSelectionChange || function () { };
    this.wordList = [];
    this.selectedLetters = [];
    this.selectedPositions = [];
    this.isDragging = false;
    this.lastMousePos = null;
    this._render();
    this._attachEvents();
  }

  _render() {
    this.container.innerHTML = `
      <style>
        .ww-container {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          text-align: center;
          padding: 20px;
        }
        .ww-wheel {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%,
              rgba(255,255,255,0.95) 0%,
              rgba(173, 216, 230, 0.8) 40%,
              rgba(70, 130, 180, 0.7) 100%);
          box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.25),   /* drop shadow */
          inset 0 4px 15px rgba(255,255,255,0.8), /* top light */
          inset 0 -4px 15px rgba(0,0,0,0.1); /* bottom shading */
          border: 2px solid rgba(255,255,255,0.4);
        }
        .ww-svg {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        .ww-path {
          stroke: #ff9800;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 6px rgba(255,152,0,0.8));
        }
        .ww-letter {
          position: absolute;
          width: 50px;
          height: 50px;
          
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.2);
          font-size: 24px;
          font-weight: bold;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          user-select: none;
          transition: transform 0.15s ease;
            background: linear-gradient(145deg, #4a90e2, #357ABD);

  font-weight: bold;
  box-shadow: 0 3px 8px rgba(0,0,0,0.25);
        }
        .ww-letter:hover {
          transform: scale(1.15);
        }
        .ww-letter.selected {
          background: linear-gradient(145deg, #2C5A8A, #1f3f63);
          transform: scale(1.1);
        }
        .ww-current {
          font-size: 20px;
          font-weight: bold;
          margin-top: 15px;
        }
        .ww-list {
          margin-top: 15px;
          background: rgba(255,255,255,0.8);
          padding: 12px 18px;
          border-radius: 8px;
          min-height: 40px;
          display: inline-block;
          font-size: 16px;
        }
        .ww-btn {
          margin: 5px;
          padding: 8px 16px;
          font-size: 15px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(145deg, #4a90e2, #357ABD);
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .ww-btn:hover {
          background: linear-gradient(145deg, #5AA0F2, #4685C2);
        }
      </style>
      <div class="ww-container">
        <div style="position:relative; display:inline-block;">
          <div class="ww-wheel"></div>
          <svg class="ww-svg" width="250" height="250">
            <polyline class="ww-path" fill="none"/>
          </svg>
        </div>
        <div class="ww-current">_</div>
        <div>
          <button class="ww-btn ww-clear">Clear Selection</button>
          <button class="ww-btn ww-add">Add to List</button>
          <button class="ww-btn ww-reset">Clear List</button>
          <button class="ww-btn ww-submit">Submit</button>
        </div>
        <div class="ww-list">(No words yet)</div>
      </div>
    `;
    this._renderWheel();
  }

  _renderWheel() {
    const wheel = this.container.querySelector(".ww-wheel");
    wheel.innerHTML = "";
    const total = this.letters.length;
    const radius = 100;
    const centerX = 125;
    const centerY = 125;
    this.letters.forEach((letter, index) => {
      const angle = (index / total) * (2 * Math.PI);
      const x = Math.cos(angle) * radius + centerX - 25;
      const y = Math.sin(angle) * radius + centerY - 25;
      const div = document.createElement("div");
      div.className = "ww-letter";
      div.textContent = letter;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.addEventListener("mousedown", (e) => {
        this._startSelection(letter, div, x + 25, y + 25);
        e.preventDefault();
      });
      div.addEventListener("mouseenter", () => {
        if (this.isDragging)
          this._selectLetter(letter, div, x + 25, y + 25);
      });
      div.addEventListener("touchstart", (e) => {
        this._startSelection(letter, div, x + 25, y + 25);
        e.preventDefault();
      });
      div.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );
        if (target && target.classList.contains("ww-letter")) {
          const rect = target.getBoundingClientRect();
          const posX =
            rect.left +
            rect.width / 2 -
            wheel.getBoundingClientRect().left;
          const posY =
            rect.top +
            rect.height / 2 -
            wheel.getBoundingClientRect().top;
          this._selectLetter(target.textContent, target, posX, posY);
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
    
    this.container
      .querySelector(".ww-clear")
      .addEventListener("click", () => this._clearSelection());
    this.container
      .querySelector(".ww-add")
      .addEventListener("click", () => this._addToList());
    this.container
      .querySelector(".ww-reset")
      .addEventListener("click", () => this._clearList());
    this.container
      .querySelector(".ww-submit")
      .addEventListener("click", () => this._submitList());
      
  }

  _startSelection(letter, element, px, py) {
    this._clearSelection();
    this.isDragging = true;
    this._selectLetter(letter, element, px, py);
  }

  _selectLetter(letter, element, px, py) {
    if (!element.classList.contains("selected")) {
      this.selectedLetters.push(letter);
      this.selectedPositions.push([px, py]);
      element.classList.add("selected");
      this._updateCurrentWord();
      this._updatePath();
      this.onSelectionChange(this.selectedLetters);
    }
  }

  _updateLiveDrag(clientX, clientY) {
    if (!this.isDragging || this.selectedPositions.length === 0) return;
    const wheelRect = this.container
      .querySelector(".ww-wheel")
      .getBoundingClientRect();
    const x = clientX - wheelRect.left;
    const y = clientY - wheelRect.top;
    this.lastMousePos = [x, y];
    this._updatePath(true);
  }

  _endSelection() {
    if (this.isDragging && this.selectedLetters.length > 0) {
      this._addToList();
    }
    this.isDragging = false;
    this.lastMousePos = null;
  }

  _updateCurrentWord() {
    this.container.querySelector(".ww-current").textContent =
      this.selectedLetters.join("") || "_";
  }

  _clearSelection() {
    this.container
      .querySelectorAll(".ww-letter")
      .forEach((el) => el.classList.remove("selected"));
    this.selectedLetters = [];
    this.selectedPositions = [];
    this.lastMousePos = null;
    this._updatePath();
    this._updateCurrentWord();
  }

  _updatePath(includeLive = false) {
    const line = this.container.querySelector(".ww-path");
    let points = this.selectedPositions.map((p) => p.join(","));
    if (includeLive && this.lastMousePos) {
      points.push(this.lastMousePos.join(","));
    }
    line.setAttribute("points", points.join(" "));
  }

  _addToList() {
    if (this.selectedLetters.length > 0) {
      const word = this.selectedLetters.join("");
      this.wordList.push(word);
      this._updateWordList();
      this._clearSelection();
    }
  }

  _clearList() {
    this.wordList = [];
    this._updateWordList();
  }

  _submitList() {
    this.onWordSubmit(this.wordList);
  }

  _updateWordList() {
    this.container.querySelector(".ww-list").textContent =
      this.wordList.join(", ") || "(No words yet)";
  }
}
export { WordWheel };