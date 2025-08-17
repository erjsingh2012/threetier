import { BaseResourceManager } from "../resources/managers/BaseResourceManager.js";

export class IdentityService extends BaseResourceManager {
  constructor(storageManager, apiManager) {
    super();
    this.storageManager = storageManager;
    this.apiManager = apiManager;
    this.identityKey = "device_identity";
    this.userKey = "user";
  }

  async init() {
    await super.init();

    let identity = this.getIdentity();
    if (!identity) {
      // Step 1: Create fingerprint
      identity = this.createFingerprint();

      // Step 2: Send fingerprint to server → receive user credentials
      try {
        const response = await this.apiManager.post("/identity/register", {
          fingerprint: identity,
        });

        if (response && response.user) {
          this.storageManager.set(this.identityKey, identity);
          this.storageManager.set(this.userKey, response.user);
          console.log("✅ New user registered via device fingerprint:", response.user);
        } else {
          console.error("❌ Failed to register identity with server");
        }
      } catch (err) {
        console.error("❌ Identity registration error:", err);
      }
    } else {
      console.log("Loaded existing device identity:", identity);
    }
  }

  isAuthenticated() {
    return !!this.getUser();
  }

  getUser() {
    return this.storageManager.get(this.userKey);
  }

  registerUser(user) {
    if (!this.isReady()) {
      console.error("IdentityService is not ready.");
      return;
    }
    this.storageManager.set(this.userKey, user);
    console.log("User registered manually:", user, this.getUser());
  }

  deleteUser() {
    if (!this.isReady()) {
      console.error("IdentityService is not ready.");
      return;
    }
    this.storageManager.remove(this.userKey);
    console.log("User deleted");
  }

  // ✅ DEVICE / BROWSER FINGERPRINT
  getIdentity() {
    return this.storageManager.get(this.identityKey);
  }

  createFingerprint() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      },
      hardware: {
        cores: navigator.hardwareConcurrency || "unknown",
        memory: navigator.deviceMemory || "unknown",
      },
      createdAt: new Date().toISOString(),
    };
  }

  deleteIdentity() {
    this.storageManager.remove(this.identityKey);
    console.log("Device identity deleted.");
  }
}
