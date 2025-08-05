import { StorageManager } from "./resources/managers/StorageManager.js"; 
import { ApiManager } from "./resources/managers/ApiManager.js";
import { AuthService } from "./service/AuthService.js";

const storageManager = new StorageManager();
const apiManager = new ApiManager('');
const authService = new AuthService(storageManager, apiManager);

async function initApp() {
  await storageManager.init();
  await apiManager.init();
  await authService.init();
  if (!authService.isAuthenticated()) {
    showSignup();
  } else {
    //authService.deleteUser();
    startApp();
  }
}

function showSignup() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("authPanel").style.display = "block";

  document.getElementById("signupBtn").addEventListener("click", () => {
    const username = document.getElementById("usernameInput").value.trim();
    if (username) {
      authService.registerUser(username);
      document.getElementById("authPanel").style.display = "none";
      startApp();
    } else {
      alert("Please enter a name.");
    }
  });
}

async function startApp() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("app").style.display = "block";

  const user = authService.getUser();
  storageManager.set('welcomeMessage', `Welcome back, ${user}!`);
  console.log(storageManager.get('welcomeMessage'));
};

initApp().catch(err => {
  document.getElementById("loading").textContent = "Failed to initialize app.";
  console.error(err);
});