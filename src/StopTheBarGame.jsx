import React, { useState, useEffect, useCallback } from 'react';

// --- Game Configuration ---
const ALL_ICONS = ['💻', '⚙️', '🚀', '🌐', '💡', '🔥', '🧠', '⚡️', '⚛️'];

// Speed progression for the game
const getSpeed = (round) => {
    if (round <= 2) return { flashTime: 400, delay: 200 };   // Slow
    if (round <= 5) return { flashTime: 280, delay: 140 };   // Medium
    return { flashTime: 150, delay: 75 };                    // Fast
};

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const CodeSequenceGame = ({ onGameEnd }) => {
    const [gameState, setGameState] = useState('instructions');
    const [sequence, setSequence] = useState([]);
    const [playerGuess, setPlayerGuess] = useState([]);
    const [activeIcon, setActiveIcon] = useState(null);
    const [gameIcons, setGameIcons] = useState([]);

    // CHANGED: Function now accepts the icon array to use
    const addNewIconToSequence = (currentSequence, iconsForRound) => {
        // CHANGED: Uses the passed-in array to prevent stale state
        const nextIcon = iconsForRound[Math.floor(Math.random() * iconsForRound.length)];
        const newSequence = [...currentSequence, nextIcon];
        setSequence(newSequence);
        setPlayerGuess([]);
        setGameState('watching');
        
        const { flashTime, delay } = getSpeed(newSequence.length);
        
        let i = 0;
        const interval = setInterval(() => {
            setActiveIcon(newSequence[i]); 
            setTimeout(() => setActiveIcon(null), flashTime);
            i++;
            if (i >= newSequence.length) {
                clearInterval(interval);
                setGameState('playing');
            }
        }, flashTime + delay);
    };

    const handlePlayerInput = (icon) => {
        if (gameState !== 'playing') return;

        const newPlayerGuess = [...playerGuess, icon];
        setPlayerGuess(newPlayerGuess);

        if (newPlayerGuess[newPlayerGuess.length - 1] !== sequence[newPlayerGuess.length - 1]) {
            setGameState('finished');
            return;
        }

        if (newPlayerGuess.length === sequence.length) {
            setGameState('watching');
            setTimeout(() => {
                // CHANGED: Pass the current gameIcons from state to match the new function signature
                addNewIconToSequence(sequence, gameIcons);
            }, 1000);
        }
    };

    const finishGame = useCallback(() => {
        const roundsCompleted = sequence.length > 0 ? sequence.length - 1 : 0;
        const score = Math.min(roundsCompleted * 10, 100);
        setTimeout(() => onGameEnd(score), 1200);
    }, [sequence, onGameEnd]);

    useEffect(() => {
        if (gameState === 'finished') {
            finishGame();
        }
    }, [gameState, finishGame]);

    const startGame = () => {
        // CHANGED: Generate icons into a local variable first
        const newGameIcons = shuffleArray(ALL_ICONS).slice(0, 6);
        setGameIcons(newGameIcons);
        setSequence([]);
        setPlayerGuess([]);
        setGameState('starting');
        setTimeout(() => {
            // CHANGED: Pass the new icons directly to the function to avoid the stale state bug
            addNewIconToSequence([], newGameIcons);
        }, 1000);
    };

    if (gameState === 'instructions') {
        return (
            <div className="text-center p-4 text-white">
                <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Code Sequence Challenge</h2>
                <div className="text-left space-y-3 mb-6 max-w-sm mx-auto">
                    <p><strong>Goal:</strong> Watch the sequence of flashing icons and repeat it back perfectly.</p>
                    <p><strong>Gameplay:</strong> The sequence gets longer and <strong className="text-red-400">FASTER</strong> each round. One wrong move and the game is over!</p>
                    <p><strong>Difficulty:</strong> The flash speed will increase after <strong className="text-yellow-300">Round 2</strong> and again after <strong className="text-yellow-300">Round 5</strong>.</p>
                    <p><strong>Scoring:</strong> You get <strong className="text-yellow-300">10 points</strong> for every round you complete (max 100).</p>
                </div>
                <button 
                    onClick={startGame}
                    className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg"
                >
                    Start Challenge
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold font-naruto text-orange-400 mb-4">
                {gameState === 'watching' && 'Watch Carefully...'}
                {gameState === 'playing' && 'Your Turn!'}
                {gameState === 'finished' && 'Game Over!'}
                {gameState === 'starting' && 'Get Ready...'}
            </h2>
            <p className="text-lg mb-4">
                Round: <span className="font-bold text-white">{sequence.length}</span>
            </p>
            
            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {gameIcons.map((icon, index) => (
                    <button
                        key={index}
                        onClick={() => handlePlayerInput(icon)}
                        disabled={gameState !== 'playing'}
                        className={`aspect-square flex items-center justify-center text-4xl rounded-lg transition-all duration-100 transform
                            ${activeIcon === icon ? 'bg-white scale-110 shadow-lg shadow-white/50' : 'bg-gray-700 hover:bg-gray-600'}
                            ${gameState !== 'playing' ? 'cursor-not-allowed' : ''}
                        `}
                    >
                        {icon}
                    </button>
                ))}
            </div>

            {gameState === 'finished' && (
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-red-500 animate-pulse">Sequence Broken!</h3>
                    <p className="text-lg">You completed {sequence.length - 1} rounds.</p>
                    <p className="text-lg">Submitting your score...</p>
                </div>
            )}
        </div>
    );
};

export default CodeSequenceGame;