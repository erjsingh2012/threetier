class WordWheel {
  constructor(container, letters, options = {}) {
    this.container = container;
    this.letters = letters;
    this.onWordSubmit = options.onWordSubmit || function () {};
    this.onSelectionChange = options.onSelectionChange || function () {};
    this.wordList = [];
    this.selectedLetters = [];
    this.selectedPositions = [];
    this.selectedElements = [];
    this.isDragging = false;
    this.lastMousePos = null;

    this.size = options.size || 250; // default size of the wheel in px
    this.minSize = 150;
    this.maxSize = 500;

    this._render();
    this._attachEvents();
  }

  _render() {
    // Compute letter size & font size based on wheel size:
    const letterSize = Math.max(30, Math.min(80, (this.size / 250) * 50));
    const fontSize = Math.max(14, Math.min(36, (this.size / 250) * 24));

    this.container.innerHTML = `
      <style>
        .ww-container {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          display: flex;
          flex-direction: column;
          padding-top: 30vh;
          height: 100%;       /* or fixed height if needed */
          max-height: 100vh;  /* keep it viewport limited if you want */
        }
        .ww-wheel-wrapper {
          margin-top: auto;
          align-self: center;
          position: relative;
          display: inline-block;
          margin-bottom: 10px; /* small gap above nav */
        }
        .ww-wheel {
          position: relative;
          width: ${this.size}px;
          height: ${this.size}px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%,
              rgba(255,255,255,0.95) 0%,
              rgba(173, 216, 230, 0.8) 40%,
              rgba(70, 130, 180, 0.7) 100%);
          box-shadow:
          0 8px 20px rgba(0, 0, 0, 0.25),
          inset 0 4px 15px rgba(255,255,255,0.8),
          inset 0 -4px 15px rgba(0,0,0,0.1);
          border: 2px solid rgba(255,255,255,0.4);
          margin: 0 auto;
        }
        .ww-svg {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          width: ${this.size}px;
          height: ${this.size}px;
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
          width: ${letterSize}px;
          height: ${letterSize}px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.2);
          font-size: ${fontSize}px;
          font-weight: bold;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          user-select: none;
          transition: transform 0.15s ease;
          background: linear-gradient(145deg, #4a90e2, #357ABD);
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
      <div class="ww-list">(No words yet)</div>
      <div class="ww-current">_</div>
        <div style="position:relative; display:inline-block;">
          <div class="ww-wheel"></div>
          <svg class="ww-svg" width="${this.size}" height="${this.size}">
            <polyline class="ww-path" fill="none"/>
          </svg>
        </div>
      </div>
    `;
    this._renderWheel(letterSize);
  }

  _renderWheel(letterSize) {
    const wheel = this.container.querySelector(".ww-wheel");
    wheel.innerHTML = "";
    const total = this.letters.length;
    const radius = this.size / 2 - letterSize / 1.5;
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    this.letters.forEach((letter, index) => {
      const angle = (index / total) * (2 * Math.PI);
      const x = Math.cos(angle) * radius + centerX - letterSize / 2;
      const y = Math.sin(angle) * radius + centerY - letterSize / 2;
      const div = document.createElement("div");
      div.className = "ww-letter";
      div.textContent = letter;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.style.width = `${letterSize}px`;
      div.style.height = `${letterSize}px`;
      div.style.fontSize = `${Math.max(14, (letterSize / 50) * 24)}px`;
      div.addEventListener("mousedown", (e) => {
        this._startSelection(
          letter,
          div,
          x + letterSize / 2,
          y + letterSize / 2
        );
        e.preventDefault();
      });
      div.addEventListener("mouseenter", () => {
        if (this.isDragging)
          this._selectLetter(
            letter,
            div,
            x + letterSize / 2,
            y + letterSize / 2
          );
      });
      div.addEventListener("touchstart", (e) => {
        this._startSelection(
          letter,
          div,
          x + letterSize / 2,
          y + letterSize / 2
        );
        e.preventDefault();
      });
      div.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("ww-letter")) {
          const rect = target.getBoundingClientRect();
          const posX =
            rect.left + rect.width / 2 - wheel.getBoundingClientRect().left;
          const posY =
            rect.top + rect.height / 2 - wheel.getBoundingClientRect().top;
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
  }

  setSize(newSize) {
    if (newSize < this.minSize) newSize = this.minSize;
    if (newSize > this.maxSize) newSize = this.maxSize;
    this.size = newSize;
    this._render();
  }

  _startSelection(letter, element, px, py) {
    this._clearSelection();
    this.isDragging = true;
    this._selectLetter(letter, element, px, py);
  }

 _selectLetter(letter, element, px, py) {
  const isSelected = element.classList.contains("selected");
  const idx = this.selectedLetters.indexOf(letter);

  // Case 1: Selecting a new letter
  if (!isSelected) {
    this.selectedLetters.push(letter);
    this.selectedPositions.push([px, py]);
    element.classList.add("selected");
    this.selectedElements.push(element);
  }

  // Case 2: Deselecting the second-last selected letter (backtracking)
  else if (idx >= 0 && idx === this.selectedLetters.length - 2) {
    this.selectedPositions.pop();
    this.selectedLetters.pop();
    const removedElement = this.selectedElements.pop();
    console.log('Jsingh Removing removedLetterElement:', removedElement.classList);
    removedElement.classList.remove("selected");
  }

  // Update UI & callbacks if anything changed
  if (!isSelected || (idx >= 0 && idx === this.selectedLetters.length - 1)) {
    this._updateCurrentWord();
    this._updatePath();
    this.onSelectionChange(this.selectedLetters);
    console.log(`Selected letters: ${this.selectedLetters.join(", ")}`);
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
