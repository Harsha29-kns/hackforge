import React, { useState, useEffect, useCallback } from 'react';

const TILE_COUNT = 16;
const GRID_SIZE = 4;

// ✅ Near-solved shuffle function
function easyShuffle(tiles, moves = 20) {
  let newTiles = [...tiles];
  let emptyIndex = newTiles.indexOf(TILE_COUNT - 1);

  for (let m = 0; m < moves; m++) {
    const neighbors = [];
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;

    if (row > 0) neighbors.push(emptyIndex - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(emptyIndex + GRID_SIZE);
    if (col > 0) neighbors.push(emptyIndex - 1);
    if (col < GRID_SIZE - 1) neighbors.push(emptyIndex + 1);

    const swapIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
    [newTiles[emptyIndex], newTiles[swapIndex]] = [newTiles[swapIndex], newTiles[emptyIndex]];
    emptyIndex = swapIndex;
  }

  return newTiles;
}

const NumberPuzzleGame = ({ onGameEnd }) => {
  const [tiles, setTiles] = useState([...Array(TILE_COUNT).keys()]);
  const [moves, setMoves] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const shuffleTiles = useCallback(() => {
    const shuffled = easyShuffle([...Array(TILE_COUNT).keys()], 20); // only 20 random moves
    setTiles(shuffled);
    setMoves(0);
    setIsStarted(false);
  }, []);

  useEffect(() => {
    shuffleTiles();
  }, [shuffleTiles]);

  const handleTileClick = (index) => {
    if (!isStarted) setIsStarted(true);
    const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
    const tileIndex = tiles.indexOf(index);

    const isAdjacent = (i1, i2) => {
      const row1 = Math.floor(i1 / GRID_SIZE);
      const col1 = i1 % GRID_SIZE;
      const row2 = Math.floor(i2 / GRID_SIZE);
      const col2 = i2 % GRID_SIZE;
      return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    };

    if (isAdjacent(tileIndex, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[tileIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[tileIndex]];
      setTiles(newTiles);
      setMoves((prev) => prev + 1);
    }
  };

  const isSolved = tiles.every((tile, index) => tile === index);

  useEffect(() => {
    if (isStarted && isSolved) {
      const score = Math.max(150 - moves, 20); // Calculate score
      setTimeout(() => onGameEnd(score), 500);
    }
  }, [isSolved, moves, isStarted, onGameEnd]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Number Puzzle</h2>
      
      <div className="mb-4 text-lg">
        Moves: <span className="font-bold text-white">{moves}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-gray-900 p-2 rounded-lg">
        {tiles.map((tile, i) => (
          <div
            key={i}
            onClick={() => tile !== TILE_COUNT - 1 && handleTileClick(tile)}
            className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-md transition-all duration-300
              ${tile === TILE_COUNT - 1 ? 'bg-gray-800' : 'bg-orange-500 cursor-pointer hover:bg-orange-600'}`}
          >
            {tile !== TILE_COUNT - 1 ? tile + 1 : ''}
          </div>
        ))}
      </div>

      {isSolved && isStarted && (
        <div className="mt-6 text-center">
          <h3 className="text-2xl font-bold text-green-400 animate-pulse">Puzzle Solved!</h3>
          <p className="text-lg">Submitting your score...</p>
        </div>
      )}

      {/* 🔄 Shuffle button so user can restart easily */}
      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={shuffleTiles}
      >
        New Game
      </button>
    </div>
  );
};

export default NumberPuzzleGame;
