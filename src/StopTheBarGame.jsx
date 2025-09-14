import React, { useState, useEffect, useCallback } from 'react';

// A helper function for creating delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [
            newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
};

const SEALS = ['🐵', '🐗', '🐏', '🐰', '🐍', '🐲', '🐭', '🐂', '🐯', '🐔', '🐶', '🐴'];
const MAX_LEVEL = 20; // now 20 rounds total

// Speed progression for displaying the sequence
const getSpeed = (level) => {
    if (level < 4) return 300; // Slower for the first 3
    if (level < 8) return 150; // Faster for the next 4
    return 100; // Very fast for the rest
};

const gameStyles = `
    .game-body { background-color: #1a1a2e; color: #e0e0e0; font-family: 'Roboto', sans-serif; display: flex; justify-content: center; align-items: center; padding: 20px; }
    #game-container { background-color: #16213e; padding: 20px; border-radius: 15px; box-shadow: 0 0 20px rgba(227, 20, 44, 0.5); border: 2px solid #e94560; width: 100%; max-width: 500px; text-align: center; }
    h1 { color: #e94560; text-transform: uppercase; letter-spacing: 2px; }
    #status-bar { display: flex; justify-content: space-between; font-size: 1.2em; margin-bottom: 20px; font-weight: bold; }
    .display-area { background-color: #0f3460; border: 2px solid #533483; border-radius: 10px; min-height: 80px; margin-bottom: 20px; display: flex; justify-content: center; align-items: center; padding: 10px; font-size: 2.5em; letter-spacing: 10px; flex-wrap: wrap; }
    #message-text { font-size: 0.5em; color: #a0a0a0; letter-spacing: 1px; }
    #seal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .seal-button { background-color: #533483; border: 2px solid #e94560; border-radius: 10px; font-size: 2em; cursor: pointer; padding: 15px; transition: all 0.2s ease; user-select: none; }
    .seal-button:hover:not(:disabled) { background-color: #e94560; transform: scale(1.1); }
    .seal-button:disabled { opacity: 0.5; cursor: not-allowed; }
    #start-button { background-color: #e94560; color: #fff; border: none; border-radius: 8px; padding: 15px 30px; font-size: 1.2em; cursor: pointer; margin-top: 20px; text-transform: uppercase; transition: background-color 0.3s; }
    #start-button:hover { background-color: #c73048; }
    #timer-display { color: #e94560; font-weight: bold; font-size: 1.5em; margin-bottom: 15px; text-shadow: 0 0 5px #e94560; }
`;

const StopTheBarGame = ({ onGameEnd }) => {
    // --- State Management ---
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [gameSequence, setGameSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [isDisplayingSequence, setIsDisplayingSequence] = useState(false);
    const [gameMessage, setGameMessage] = useState('Click Start for a true challenge.');
    const [isGameActive, setIsGameActive] = useState(false);
    const [shuffledSeals, setShuffledSeals] = useState([...SEALS]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isReverseMode, setIsReverseMode] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    const gameOver = useCallback((message) => {
        setGameMessage(message);
        setIsGameActive(false);
        setIsPlayerTurn(false);
    }, []);

    // Effect to trigger onGameEnd when the game is no longer active
    useEffect(() => {
        if (!isGameActive && score > 0 && onGameEnd) {
            onGameEnd(score);
        }
    }, [isGameActive, score, onGameEnd]);

    // --- Game Logic ---
    const startGame = () => {
        setShowInstructions(false);
        setLevel(1);
        setScore(0);
        setGameSequence([]);
        setPlayerSequence([]);
        setIsReverseMode(false);
        setIsGameActive(true);
        setGameMessage('Prepare yourself...');
    };

    // This effect controls the start of each round
    useEffect(() => {
        if (!isGameActive) return;

        const roundTimer = setTimeout(() => {
            setIsPlayerTurn(false);
            setPlayerSequence([]);
            
            const reverseChance = level >= 5 ? 0.4 : 0;
            const newReverseMode = Math.random() < reverseChance;
            setIsReverseMode(newReverseMode);
            
            setShuffledSeals(shuffleArray(SEALS));
            const newSeal = SEALS[Math.floor(Math.random() * SEALS.length)];
            setGameSequence(prev => [...prev, newSeal]);
            setIsDisplayingSequence(true);
        }, 1500);

        return () => clearTimeout(roundTimer);
    }, [isGameActive, level]);

    // This effect handles displaying the sequence
    useEffect(() => {
        if (!isDisplayingSequence) return;

        const showSequence = async () => {
            setGameMessage(isReverseMode ? 'Memorize... IN REVERSE!' : 'Memorize...');
            const displayTime = getSpeed(level);

            for (let i = 0; i < gameSequence.length; i++) {
                setGameMessage(gameSequence[i]);
                await sleep(displayTime);
                setGameMessage('');
                await sleep(50); // Brief pause between seals
            }
            
            setIsDisplayingSequence(false);
            setGameMessage(isReverseMode ? 'Repeat the sequence BACKWARDS!' : 'Repeat the sequence!');
            setIsPlayerTurn(true);
        };

        showSequence();
    }, [isDisplayingSequence, gameSequence, level, isReverseMode]);

    // --- Player Turn Timer ---
    useEffect(() => {
        if (!isPlayerTurn || !isGameActive) return;

        const timeAllowed = 3 + Math.floor(gameSequence.length * 0.5);
        setTimeLeft(timeAllowed);

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    const correctSequence = isReverseMode ? [...gameSequence].reverse() : gameSequence;
                    gameOver(`Time's up! Sequence was: ${correctSequence.join('')}`);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isPlayerTurn, isGameActive, gameSequence, isReverseMode, gameOver]);

    // This effect checks the player's input
    useEffect(() => {
        if (playerSequence.length === 0 || !isPlayerTurn) return;

        const correctSequence = isReverseMode ? [...gameSequence].reverse() : gameSequence;
        const index = playerSequence.length - 1;
        
        if (playerSequence[index] !== correctSequence[index]) {
            gameOver(`Wrong Seal! Correct sequence was: ${correctSequence.join('')}`);
            return;
        }

        if (playerSequence.length === correctSequence.length) {
            setIsPlayerTurn(false);
            setScore(prev => prev + 5); // 5 points per round
            
            if (level === MAX_LEVEL) {
                gameOver('IMPOSSIBLE! You are a true Jutsu Master! 🏆');
            } else {
                setGameMessage('Correct!');
                setLevel(prev => prev + 1);
            }
        }
    }, [playerSequence, isPlayerTurn, gameSequence, isReverseMode, level, gameOver]);

    const handleSealClick = useCallback((seal) => {
        if (!isPlayerTurn) return;
        setPlayerSequence(prev => [...prev, seal]);
    }, [isPlayerTurn]);

    if (showInstructions) {
        return (
            <div className="game-body">
                <style>{gameStyles}</style>
                <div id="game-container">
                    <h1>Hand Seal Memory Challenge</h1>
                    <div style={{ textAlign: 'left', margin: '20px 0' }}>
                        <h2 style={{ color: '#e94560' }}>How to Play:</h2>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                            <li>Press <b>Start Challenge</b> to begin.</li>
                            <li>A sequence of hand seals (🐵 🐗 🐏 etc.) will appear one by one.</li>
                            <li>Memorize the exact order of seals.</li>
                            <li>When the display ends, click the seals in the correct order.</li>
                            <li>From level 5 onward, you may be asked to repeat the sequence <b>in reverse</b>.</li>
                            <li>You only have a limited amount of time to respond, so be quick!</li>
                        </ul>
                        <h2 style={{ color: '#e94560', marginTop: '20px' }}>Scoring:</h2>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                            <li>You get 5 points for each level you complete.</li>
                            <li>The game has 20 levels total (maximum score = 100 points).</li>
                            <li>Reach level 20 to become a true Jutsu Master 🏆.</li>
                        </ul>
                    </div>
                    <button id="start-button" onClick={startGame}>Start Challenge</button>
                </div>
            </div>
        );
    }
    
    // --- Render ---
    return (
        <div className="game-body">
            <style>{gameStyles}</style>
            <div id="game-container">
                <h1>Hand Seal Memory</h1>
                <div id="status-bar">
                    <div>Round: <span>{level} {isReverseMode && '(Reverse!)'}</span></div>
                    <div>Score: <span>{score}</span></div>
                </div>

                {isPlayerTurn && <div id="timer-display">Time Left: {timeLeft}s</div>}

                <div id="sequence-display" className="display-area">
                    {isGameActive ? (
                        isDisplayingSequence ? gameMessage : 
                        isPlayerTurn ? playerSequence.join('') : 
                        <p id="message-text">{gameMessage}</p>
                    ) : (
                        <p id="message-text">{gameMessage}</p>
                    )}
                </div>

                <div id="seal-grid">
                    {shuffledSeals.map((seal) => (
                        <button key={seal} className="seal-button" onClick={() => handleSealClick(seal)} disabled={!isPlayerTurn}>
                            {seal}
                        </button>
                    ))}
                </div>

                {!isGameActive && (
                    <button id="start-button" onClick={startGame}>
                        {score > 0 ? 'Try Again' : 'Start Challenge'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StopTheBarGame;
