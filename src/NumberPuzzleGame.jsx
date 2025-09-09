import React, { useState, useEffect, useCallback, useRef } from 'react';

const TILE_COUNT = 16;
const GRID_SIZE = 4;

// More robust shuffle function
function shuffle(tiles, moves = 150) {
    let newTiles = [...tiles];
    let emptyIndex = newTiles.indexOf(TILE_COUNT - 1);
    let lastMove = -1;

    for (let m = 0; m < moves; m++) {
        const neighbors = [];
        const row = Math.floor(emptyIndex / GRID_SIZE);
        const col = emptyIndex % GRID_SIZE;

        if (row > 0 && emptyIndex - GRID_SIZE !== lastMove) neighbors.push(emptyIndex - GRID_SIZE);
        if (row < GRID_SIZE - 1 && emptyIndex + GRID_SIZE !== lastMove) neighbors.push(emptyIndex + GRID_SIZE);
        if (col > 0 && emptyIndex - 1 !== lastMove) neighbors.push(emptyIndex - 1);
        if (col < GRID_SIZE - 1 && emptyIndex + 1 !== lastMove) neighbors.push(emptyIndex + 1);
        
        const swapIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
        lastMove = emptyIndex;
        [newTiles[emptyIndex], newTiles[swapIndex]] = [newTiles[swapIndex], newTiles[emptyIndex]];
        emptyIndex = swapIndex;
    }
    return newTiles;
}

const NumberPuzzleGame = ({ onGameEnd }) => {
    const [tiles, setTiles] = useState([...Array(TILE_COUNT).keys()]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [gameState, setGameState] = useState('instructions'); // instructions, playing, finished
    const timerRef = useRef(null);

    const shuffleTiles = useCallback(() => {
        const shuffled = shuffle([...Array(TILE_COUNT).keys()]);
        setTiles(shuffled);
        setMoves(0);
        setSeconds(0);
        setGameState('instructions');
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        shuffleTiles();
        return () => clearInterval(timerRef.current);
    }, [shuffleTiles]);

    const startGame = useCallback(() => {
        setGameState('playing');
        timerRef.current = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
    }, []);

    const handleTileClick = (index) => {
        if (gameState !== 'playing') return;
        
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
        if (gameState === 'playing' && isSolved) {
            clearInterval(timerRef.current);
            setGameState('finished');

            const MAX_SCORE = 100;
            const IDEAL_MOVES = 50;
            const MAX_TIME_SECONDS = 180;

            const timePenalty = Math.min(50, (seconds / MAX_TIME_SECONDS) * 50);
            const movePenalty = Math.min(50, Math.max(0, moves - IDEAL_MOVES) * 0.5);
            
            const finalScore = MAX_SCORE - timePenalty - movePenalty;
            const score = Math.max(10, Math.round(finalScore)); 
            
            setTimeout(() => onGameEnd(score), 500);
        }
    }, [isSolved, moves, seconds, gameState, onGameEnd]);

    if (gameState === 'instructions') {
        return (
            <div className="text-center p-4 text-white">
                <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Number Puzzle</h2>
                <div className="text-left space-y-3 mb-6">
                    <p><strong>Goal:</strong> Arrange the tiles in numerical order from 1 to 15.</p>
                    <p><strong>How to Play:</strong> Click a tile adjacent to the empty space to slide it.</p>
                    <p><strong>Scoring:</strong> Your score (Max 100) is based on how quickly and efficiently you solve the puzzle. Fewer moves and less time lead to a higher score!</p>
                </div>
                <button
                    onClick={startGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg"
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Number Puzzle</h2>
            
            <div className="flex justify-between w-full max-w-xs mb-4 text-lg">
                <span>Moves: <span className="font-bold text-white">{moves}</span></span>
                <span>Time: <span className="font-bold text-white">{seconds}s</span></span>
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

            {gameState === 'finished' && (
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-green-400 animate-pulse">Puzzle Solved!</h3>
                    <p className="text-lg">Submitting your score...</p>
                </div>
            )}

            <button
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={shuffleTiles}
                disabled={gameState === 'playing'}
            >
                New Game
            </button>
        </div>
    );
};

export default NumberPuzzleGame;