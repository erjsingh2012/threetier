import { BaseResourceManager } from "./BaseResourceManager.js";

export class DataFileManager extends BaseResourceManager {
  constructor() {
    super();
    this.files = {}; // in-memory storage of loaded files
  }

  async init() {
    await super.init();
    console.log("📂 DataFileManager initialized");
  }

  /**
   * Load a file via input element or fetch URL
   * @param {File|String} source - File object from <input> OR URL string
   * @param {String} type - "json" | "csv" | "txt"
   */
  async load(source, type = "json") {
    let textData;

    if (source instanceof File) {
      textData = await source.text();
    } else if (typeof source === "string") {
      const res = await fetch(source);
      textData = await res.text();
    } else {
      throw new Error("Invalid source: must be File or URL");
    }

    let parsed;
    if (type === "json") {
      parsed = JSON.parse(textData);
    } else if (type === "csv") {
      parsed = this.parseCSV(textData);
    } else if (type === "txt") {
      // Split by line → trim → filter empty
      parsed = textData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    } else {
      throw new Error("Unsupported type: " + type);
    }

    this.files[source.name || source] = parsed;
    console.log(`✅ Loaded ${type.toUpperCase()} file:`, parsed);
    return parsed;
  }

  /**
   * Save data to downloadable file
   * @param {String} filename - name of file to save
   * @param {Object|Array|String} data - JSON | CSV | TXT data
   * @param {String} type - "json" | "csv" | "txt"
   */
  save(filename, data, type = "json") {
    let blob;
    if (type === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    } else if (type === "csv") {
      blob = new Blob([this.toCSV(data)], { type: "text/csv" });
    } else if (type === "txt") {
      // If array, join by newline; otherwise keep string
      const text = Array.isArray(data) ? data.join("\n") : String(data);
      blob = new Blob([text], { type: "text/plain" });
    } else {
      throw new Error("Unsupported type: " + type);
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    console.log(`💾 Saved ${type.toUpperCase()} file: ${filename}`);
  }

  /**
   * Convert CSV string → Array of objects
   */
  parseCSV(text) {
    const [headerLine, ...lines] = text.split("\n").map(l => l.trim()).filter(Boolean);
    const headers = headerLine.split(",");
    return lines.map(line => {
      const values = line.split(",");
      return headers.reduce((obj, key, i) => {
        obj[key.trim()] = values[i] ? values[i].trim() : "";
        return obj;
      }, {});
    });
  }

  /**
   * Convert Array of objects → CSV string
   */
  toCSV(data) {
    if (!Array.isArray(data) || !data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] ?? "").join(","));
    return [headers.join(","), ...rows].join("\n");
  }

  /**
   * Get cached file content
   */
  getFile(name) {
    return this.files[name] || null;
  }

  clear() {
    this.files = {};
    console.log("🧹 Cleared all loaded files");
  }
}
