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
    this.lookupCache = {};
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
  if (this.lookupCache[normalized]) {
    console.log(`✅ Found '${normalized}' in memory cache`);
    return this.lookupCache[normalized];
  }

  // ✅ Step 2: Fetch from public API if not cached
  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalized)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API HTTP ${response.status}`);

    const data = await response.json();

    // ✅ Extract useful info
    const entry = {
      word: data[0]?.word || normalized,
      phonetic: data[0]?.phonetic || "",
      meanings: data[0]?.meanings?.map(m => ({
        partOfSpeech: m.partOfSpeech,
        definition: m.definitions[0]?.definition || "",
        example: m.definitions[0]?.example || ""
      })) || []
    };

    // Save in cache + file
    this.cache[normalized] = entry;
    console.log(`📥 Word '${normalized}' fetched from Dictionary API & cached`);
    return entry;

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
