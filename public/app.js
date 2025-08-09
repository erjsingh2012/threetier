import { StorageManager } from "./resources/managers/StorageManager.js";
import { ApiManager } from "./resources/managers/ApiManager.js";
import { AuthService } from "./service/AuthService.js";
import { LevelManager } from "./service/LevelManager.js";
import { WordWheel } from './ui/WordWheel.js';

// Instantiate core managers
const storageManager = new StorageManager();
const apiManager = new ApiManager('');
const authService = new AuthService(storageManager, apiManager);
const levelManager = new LevelManager(storageManager);

// Main initialization function
async function initApp() {
  await storageManager.init();
  await apiManager.init();
  await authService.init();

  if (!authService.isAuthenticated()) {
    showSignup();
  } else {
    startApp();
  }
}

// Show signup screen
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

// Start main app UI
async function startApp() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("app").style.display = "flex";

  const user = authService.getUser();

  // Set user profile
  document.getElementById("user-name").textContent = user;

  // Initialize level
  levelManager.init();
  levelManager.updateUI();

  // Store a welcome message
  storageManager.set('welcomeMessage', `Welcome back, ${user}!`);
  console.log(storageManager.get('welcomeMessage'));

  // Initialize page navigation
  initPageScroll();

  // Example usage:
  const container = document.getElementById("gameContainer");
  const game = new WordWheel(
    container,
    ["A", "B", "C", "D", "E", "F", "G"],
    {
      onWordSubmit: (words) => alert("Submitted: " + words.join(", ")),
      onSelectionChange: (letters) =>
        console.log("Current: ", letters.join("")),
    }
  );
}

// Page scroll / swipe logic
function initPageScroll() {
  const pages = document.getElementById('pages').children;
  const nav = document.getElementById('nav').children;
  let currentIndex = 0;

  function goTo(index) {
    if (index === currentIndex || index < 0 || index >= pages.length) return;

    const oldPage = pages[currentIndex];
    const newPage = pages[index];

    // Remove all old animation classes
    oldPage.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
    newPage.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');

    // Animate direction
    if (index > currentIndex) {
      oldPage.classList.add('slide-out-left');
      newPage.classList.add('slide-in-right');
    } else {
      oldPage.classList.add('slide-out-right');
      newPage.classList.add('slide-in-left');
    }

    // Show/hide page after animation
    newPage.classList.add('active');
    setTimeout(() => {
      oldPage.classList.remove('active');
    }, 300); // animation time

    // Update nav buttons
    [...nav].forEach(btn => btn.classList.remove('active'));
    nav[index].classList.add('active');

    currentIndex = index;
  }

  // Nav click handling
  document.getElementById('nav').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const index = parseInt(e.target.dataset.index);
      goTo(index);
    }
  });
  /*
  // Touch swipe support
  let startX = 0;
  document.querySelector('.pages').addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  document.querySelector('.pages').addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (diff > 50 && currentIndex > 0) {
      goTo(currentIndex - 1); // swipe right
    } else if (diff < -50 && currentIndex < pages.length - 1) {
      goTo(currentIndex + 1); // swipe left
    }
  });
*/
  // Initial activation
  pages[0].classList.add('active');
}

// Handle initialization errors
initApp().catch(err => {
  document.getElementById("loading").textContent = "Failed to initialize app.";
  console.error(err);
});