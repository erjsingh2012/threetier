import ScrabbleBoard from './ui/ScrabbleBoard.js';
import TileRack from './ui/TileRack.js';

// Main initialization
function initApp() {
  const currentWordEl = document.getElementById("CurrentWord");

  function setCurrentWord(word) {
    currentWordEl.textContent = word || "—";
  }

  // Initialize Scrabble Board
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
      boardWidth: 440,
      tileWidth: "95%",
      boardBg: "#9fa2a7ff",
      tileBg: "linear-gradient(to bottom, #e8f4d0, #b5f9f467)",
      tileClick: (tile, cell) => {
        console.log("Tile clicked:", tile, "at", cell);
      }
    }
  );

    const rackContainer = document.getElementById("rack-container");

    const myRack = new TileRack(rackContainer, ["A","B","C","D","E","F","G"], {
      tileClick: (tile, letter) => console.log("tileleClicked", tile,letter)
    });

    document.getElementById("shuffle-btn").addEventListener("click", () => {
      myRack.shuffle();
    });

}

// Start app
document.addEventListener("DOMContentLoaded", initApp);
