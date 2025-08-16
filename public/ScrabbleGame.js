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
  const myRack = new TileRack(rackContainer, ["A", "B", "C", "D", "E", "F", "G"], {
    tileClick: (tile, letter) => console.log("tileleClicked", tile, letter),
    onTileDrop: (letter, clientX, clientY) => {
      console.log("tileDropped", letter, clientX, clientY);
      const placed = scrabbleBoard.placeTileFromRack(letter, clientX, clientY);
      if (placed) {
        // remove from rack
        const idx = myRack.tilesData.indexOf(letter);
        if (idx >= 0) myRack.setTile(idx, "");
      }
      // else tile stays on rack automatically
    }
  });
  // Enable dropping tiles onto board
  myRack.enableBoardDrop(scrabbleBoard);
}

// Start app
document.addEventListener("DOMContentLoaded", initApp);
