import { BaseResourceManager } from "../resources/managers/BaseResourceManager.js";

export class AuthService extends BaseResourceManager {
    constructor(strorageManager, apiManager) {
        super();
        this.storageManager = strorageManager;
        this.apiManager = apiManager;
    }

    async init() {
      await super.init();
    }

    isAuthenticated() {
      return !!this.getUser();
    }

    getUser() {
      return this.storageManager.get('user');
    } 
    
    registerUser(user) {
      if (!this.isReady()) {
        console.error("AuthService is not ready.");
        return;
      }
      this.storageManager.set('user', user);
      console.log('User registered:', user, this.getUser());
    }

    deleteUser() {
      if (!this.isReady()) {
        console.error("AuthService is not ready.");
        return;
      }
      this.storageManager.remove('user');
      console.log('User deleted');
    }
}