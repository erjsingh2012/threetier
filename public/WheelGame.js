import LetterWheel from './ui/LetterWheel.js';
import WheelScrabbleBoard from './ui/WheelScrabbleBoard.js';

// Main initialization
function initApp() {
  const currentWordEl = document.getElementById("CurrentWord");

  function setCurrentWord(word) {
    currentWordEl.textContent = word || "—";
  }

  // ✅ Load rack from storage (fallback to default if not found)
  const storedRack = JSON.parse(localStorage.getItem('wheeltileRack') || '["A","B","C","D","E","F","G"]');
  console.log("Loaded rack from storage:", storedRack);
  let letterWheel = new LetterWheel(
    document.getElementById("LetterWheel"),
    storedRack,
    {
      size: 180,
      letterSize: 36,
      onWordSubmit: words => console.log("App Submitted: " + words),
      onSelectionChange: letters => setCurrentWord(letters.join(""))
    }
  );

  // Initialize Scrabble Board
  let wheelScrabbleBoard = new WheelScrabbleBoard(
    document.getElementById("wheelScrabbleBoard"),
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
      boardWidth: 440,
      tileWidth: "95%",
      boardBg: "#9fa2a7ff",
      tileBg: "linear-gradient(to bottom, #e8f4d0, #b5f9f467)",
      tileClick: (tile, cell) => {
        console.log("Tile clicked:", tile, "at", cell);
      }
    }
  );

}

// Start app
document.addEventListener("DOMContentLoaded", initApp);
