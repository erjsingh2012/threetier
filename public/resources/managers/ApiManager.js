import { BaseResourceManager } from "./BaseResourceManager.js";

export class ApiManager extends BaseResourceManager { 
  constructor(baseUrl = ''  ) { 
    super();
    this.baseUrl = baseUrl;
  }

  async init() {
    await super.init();
    // Additional initialization logic for ApiManager can go here
  }

  async request(endpoint, options = {}) {
    if (!this.isReady()) {
      return null;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`API error: ${res.status}`);
    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}