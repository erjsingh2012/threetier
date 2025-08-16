export default class GameDialog {
  static injected = false;

  constructor(options = {}) {
    this.message = options.message || "";
    this.onClose = options.onClose || (() => {});
    this.bgColor = options.bgColor || "rgba(0,0,0,0.7)";
    this.textColor = options.textColor || "#fff";
    this.fontSize = options.fontSize || "1.5rem";
    this.animationDuration = options.animationDuration || 300; // ms

    if (!GameDialog.injected) {
      this._injectStyles();
      GameDialog.injected = true;
    }

    this._render();
  }

  _injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .game-dialog-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.7);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 10000;
      }
      .game-dialog-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
      .game-dialog-box {
        background: #222;
        color: #fff;
        padding: 2rem 3rem;
        border-radius: 12px;
        text-align: center;
        font-size: 1.5rem;
        min-width: 200px;
        max-width: 90%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      .game-dialog-overlay.active .game-dialog-box {
        transform: scale(1);
      }
      .game-dialog-button {
        margin-top: 1.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: #4b6cb7;
        color: white;
      }
      .game-dialog-button:hover {
        background: #3a539b;
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    this.overlay = document.createElement("div");
    this.overlay.className = "game-dialog-overlay";

    this.box = document.createElement("div");
    this.box.className = "game-dialog-box";
    this.box.innerHTML = `<div class="game-dialog-message">${this.message}</div>`;

    this.closeBtn = document.createElement("button");
    this.closeBtn.className = "game-dialog-button";
    this.closeBtn.textContent = "OK";
    this.closeBtn.addEventListener("click", () => this.close());

    this.box.appendChild(this.closeBtn);
    this.overlay.appendChild(this.box);
    document.body.appendChild(this.overlay);
  }

  show(message = "") {
    if (message) {
      this.box.querySelector(".game-dialog-message").textContent = message;
    }
    this.overlay.classList.add("active");
  }

  close() {
    this.overlay.classList.remove("active");
    setTimeout(() => this.onClose(), this.animationDuration);
  }
}
