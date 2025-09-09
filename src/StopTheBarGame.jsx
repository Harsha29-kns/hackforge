import React, { useState, useEffect, useCallback } from 'react';

// --- Game Configuration (Corrected & Harder) ---
const ALL_ICONS = [
    '💻', '⚙️', '🚀', '🌐', '💡', '🔥', '🧠', '⚡️', '⚛️', 
    '🛡️', '🛰️', '💎', '📈', '🔑', '🔬', '🔭'
];

// Speed progression (Adjusted for multi-flash clarity)
const getSpeed = (round) => {
    if (round <= 2) return { flashTime: 200, delay: 100 };
    if (round <= 5) return { flashTime: 150, delay: 70 };
    return { flashTime: 100, delay: 40 }; 
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

    const flashSequence = (sequenceToFlash) => {
        const uniqueRounds = sequenceToFlash.filter((val, i, arr) => arr.indexOf(val) === i).length;
        const { flashTime, delay } = getSpeed(uniqueRounds);
        let i = 0;
        const interval = setInterval(() => {
            setActiveIcon(sequenceToFlash[i]);
            setTimeout(() => setActiveIcon(null), flashTime);
            i++;
            if (i >= sequenceToFlash.length) {
                clearInterval(interval);
                setGameState('playing');
            }
        }, flashTime + delay);
    };

    const startNewRound = useCallback((currentSequence) => {
        const newIconsForRound = shuffleArray(ALL_ICONS).slice(0, 9);
        setGameIcons(newIconsForRound);
        setPlayerGuess([]);
        setGameState('watching');

        const nextIcon = newIconsForRound[Math.floor(Math.random() * newIconsForRound.length)];
        const uniqueRounds = currentSequence.filter((val, i, arr) => arr.indexOf(val) === i).length;
        
        // --- CORRECTED MULTI-FLASH LOGIC ---
        let numberOfFlashes = 1;
        const randomChance = Math.random();
        // Probability of multi-flashes increases with each unique round
        if (uniqueRounds > 4 && randomChance < 0.20) { // 20% chance of triple flash
            numberOfFlashes = 3;
        } else if (uniqueRounds > 1 && randomChance < 0.40) { // 40% chance of double flash
            numberOfFlashes = 2;
        }

        const newSequence = [...currentSequence];
        for(let i = 0; i < numberOfFlashes; i++) {
            newSequence.push(nextIcon);
        }
        
        setSequence(newSequence);
        flashSequence(newSequence);
    }, []);

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
                startNewRound(sequence);
            }, 1000);
        }
    };

    const finishGame = useCallback(() => {
        const roundsCompleted = Math.max(0, sequence.filter((val, index, arr) => arr.indexOf(val) === index).length - 1);
        const score = Math.min(roundsCompleted * 10, 100);
        setTimeout(() => onGameEnd(score), 1200);
    }, [sequence, onGameEnd]);

    useEffect(() => {
        if (gameState === 'finished') {
            finishGame();
        }
    }, [gameState, finishGame]);

    const startGame = () => {
        setSequence([]);
        setGameState('starting');
        setTimeout(() => {
            startNewRound([]);
        }, 1000);
    };

    if (gameState === 'instructions') {
        return (
            <div className="text-center p-4 text-white">
                <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Code Sequence: EXTREME</h2>
                <div className="text-left space-y-3 mb-6 max-w-sm mx-auto">
                    <p><strong>Goal:</strong> Repeat the sequence perfectly. It gets longer and <strong className="text-red-400">FASTER</strong> each round.</p>
                    <p className="font-bold text-yellow-300">⚠️ NEW RULE #1: The icon pads will shuffle and change after every successful round.</p>
                    <p className="font-bold text-yellow-300">⚠️ NEW RULE #2: An icon might flash multiple times (2x or even 3x). You must press it for each flash!</p>
                    <p><strong>Scoring:</strong> You get <strong className="text-yellow-300">10 points</strong> for every unique icon round you complete (max 100).</p>
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
                Round: <span className="font-bold text-white">{sequence.filter((val, index, arr) => arr.indexOf(val) === index).length}</span>
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
                    <p className="text-lg">You completed {Math.max(0, sequence.filter((val, index, arr) => arr.indexOf(val) === index).length - 1)} rounds.</p>
                    <p className="text-lg">Submitting your score...</p>
                </div>
            )}
        </div>
    );
};

export default CodeSequenceGame;