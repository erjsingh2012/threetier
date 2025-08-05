import { BaseResourceManager } from "../resources/managers/BaseResourceManager.js";

export class LevelManager extends BaseResourceManager {
  constructor(storageManager) {
    super();
    this.storageManager = storageManager;
    this.STORAGE_KEY = 'userLevel';
    this.level = 1;
  }

  async init() {
    await super.init();
    const saved = this.storageManager.get(this.STORAGE_KEY);
    if (saved) {
      this.level = parseInt(saved);
    }
  }

  getLevel() {
    return this.level;
  }

  setLevel(newLevel) {
    this.level = newLevel;
    this.saveLevel();
    this.updateUI();
  }

  levelUp() {
    this.level += 1;
    this.saveLevel();
    this.updateUI();
  }

  saveLevel() {
    this.storageManager.set(this.STORAGE_KEY, this.level);
  }

  updateUI() {
    const el = document.getElementById('user-level');
    if (el) {
      el.textContent = `Level ${this.level}`;
    }
  }
}
