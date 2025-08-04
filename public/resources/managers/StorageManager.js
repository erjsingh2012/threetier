import { BaseResourceManager } from "./BaseResourceManager.js";

export class StorageManager extends BaseResourceManager {
  constructor(storageType = 'localStorage') {
    super();
    this.storage = window[storageType] || localStorage;
  }

  async init() {
    await super.init();
    // Additional initialization logic for StorageManager can go here
  }

  set(key, value) {
    if (!this.isReady()) return;
    this.storage.setItem(key, JSON.stringify(value));
  }

  get(key) {
    if (!this.isReady()) return null;

    const value = this.storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  remove(key) {
    if (!this.isReady()) return;
    this.storage.removeItem(key);
  }

  clear() {
    if (!this.isReady()) return;
    this.storage.clear();
  }
}
