export class BaseResourceManager {
  constructor() {
    this.initialized = false;
  }

  async init() {
    this.initialized = true;
  }

  isReady() {
    return this.initialized;
  }
}
