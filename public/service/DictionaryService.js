import { BaseResourceManager } from "../resources/managers/BaseResourceManager.js";

export class DictionaryService extends BaseResourceManager {
  constructor(storageManager, apiManager, fileManager) {
    super();
    this.storageManager = storageManager; // ✅ kept reference (not used now)
    this.apiManager = apiManager;
    this.fileManager = fileManager;
    this.fileName = "/public/assets/Data/google-10000-english-no-swears.txt"; // file for persistence
    console.log("Dictionary Service " + this.fileName);
    this.words = []; // in-memory cache
    this.cache = {};
    this.lengthMap = {};
  }

  async init() {
    await super.init();

    try {
      // ✅ Public files are served at /assets/...
      const response = await fetch("/public/assets/Data/google-10000-english-no-swears.txt");
      if (!response.ok) throw new Error("HTTP error " + response.status);

      const text = await response.text();
      this.words = text.split(/\r?\n/).filter(Boolean);

      console.log(`✅ Loaded ${this.words.length} words`);

    } catch (err) {
      console.error("❌ Failed to load dictionary:", err);

    }
    this.words.forEach((word) => {
      this.cache[word.toLowerCase().trim()] = word;
      this.lengthMap[word.length] = [...(this.lengthMap[word.length] || []), word];
    });
  }

  async lookup(word) {
    if (!this.isReady()) {
      console.error("DictionaryService not ready.");
      return null;
    }

    const normalized = word.toLowerCase().trim();

    // ✅ Step 1: Check in-memory cache
    if (this.cache[normalized]) {
      console.log(`✅ Found '${normalized}' in memory cache`);
      return this.cache[normalized];
    }

    // ✅ Step 2: Fetch from API if not cached
    try {
      const response = await this.apiManager.get(`/dictionary/${encodeURIComponent(normalized)}`);
      if (response) {
        // Save in memory + file
        this.cache[normalized] = response;
        await this.fileManager.writeFile(this.fileName, JSON.stringify(this.cache, null, 2));

        console.log(`📥 Word '${normalized}' fetched from API & saved to file`);
        return response;
      } else {
        console.warn(`⚠️ No definition found for '${normalized}'`);
        return null;
      }
    } catch (err) {
      console.error(`❌ Dictionary lookup error for '${normalized}':`, err);
      return null;
    }
  }

  // ✅ New function: get first N cached words
  getCachedWords(n = 10) {
    if (!this.isReady()) {
      console.error("DictionaryService not ready.");
      return [];
    }
    return this.words.slice(0, n);
  }

  // ✅ New function: get first N cached words
  getCachedWordsOfLenth(n = 10, length = 1) {
    if (!this.isReady()) {
      console.error("DictionaryService not ready.");
      return [];
    }
    return this.lengthMap[length].slice(0, n);
  }
}
