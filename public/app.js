import { StorageManager } from "./resources/managers/StorageManager.js";
import { ApiManager } from "./resources/managers/ApiManager.js";
import { AuthService } from "./service/AuthService.js";
import { LevelManager } from "./service/LevelManager.js";
import LetterWheel from './ui/LetterWheel.js';
import ScrabbleBoard from './ui/ScrabbleBoard.js';

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
  let letterWeel = new LetterWheel(document.getElementById("LetterWheel"), ["A", "B", "C", "D", "E", "F", "G"], {
    size: 180,
    letterSize: 36,
    onWordSubmit: words => alert("Game1 submitted: " + words.join(", ")),
    onSelectionChange: letters => console.log("Game1 current:", letters.join(""))
  });

  let scrabbleBoard = new ScrabbleBoard(
  document.getElementById("ScrabbleBoard"),
  [
    ["TW", "", "", "DL", "", "", "", "DL", "", "", "TW"],
    ["", "DW", "", "", "", "TL", "", "", "", "DW", ""],
    ["", "", "DW", "", "", "", "", "", "DW", "", ""],
    ["DL", "", "", "DW", "", "", "", "DW", "", "", "DL"],
    ["", "", "", "", "DW", "", "DW", "", "", "", ""],
    ["", "TL", "", "", "", "★", "", "", "", "TL", ""],
    ["", "", "", "", "DW", "", "DW", "", "", "", ""],
    ["DL", "", "", "DW", "", "", "", "DW", "", "", "DL"],
    ["", "", "DW", "", "", "", "", "", "DW", "", ""],
    ["", "DW", "", "", "", "TL", "", "", "", "DW", ""],
    ["TW", "", "", "DL", "", "", "", "DL", "", "", "TW"]
  ],
  {
    boardWidth: 12000,  // Max board width in px
    tileWidth: "95%", // Tile width relative to cell
    boardBg: "#9fa2a7ff", // Board background color
    tileBg: "linear-gradient(to bottom, #e8f4d0, #b5f9f467)", // Default tile background
    tileClick: (tile, cell) => {
      
    }
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
  // Initial activation
  pages[0].classList.add('active');
}

// Handle initialization errors
initApp().catch(err => {
  document.getElementById("loading").textContent = "Failed to initialize app.";
  console.error(err);
});