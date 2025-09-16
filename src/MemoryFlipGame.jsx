import React, { useState, useEffect, useCallback, useRef } from 'react';

// A larger set of symbols to pull from
const symbols = ['🎮', '🚀', '💻', '💡', '🤖', '🌐', '🧠', '🏆', '🔥', '⚙️', '⚡️', '⚛️']; 
const PAIRS_COUNT = 10; // 10 pairs (20 cards)
const INITIAL_TIME = 90; // 90-second timer

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const MemoryFlipGame = ({ onGameEnd }) => {
    const [gameState, setGameState] = useState('instructions'); // instructions, playing, finished
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [peekUsed, setPeekUsed] = useState(false); // This can be removed if 'peek' is no longer a feature
    const timerRef = useRef(null);

    const initializeGame = useCallback(() => {
        const gameSymbols = shuffleArray([...symbols]).slice(0, PAIRS_COUNT);
        const cardDeck = [...gameSymbols, ...gameSymbols];
        const shuffledCards = shuffleArray(cardDeck).map((symbol, index) => ({ id: index, symbol }));
        
        setCards(shuffledCards);
        setFlippedIndices([]);
        setMatchedPairs([]);
        setMoves(0);
        setTimeLeft(INITIAL_TIME);
        setPeekUsed(false);
        setGameState('instructions');
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        initializeGame();
        return () => clearInterval(timerRef.current);
    }, [initializeGame]);

    // --- UPDATED SCORING LOGIC ---
    const calculateScore = useCallback(() => {
        const MAX_SCORE = 100;
        
        // Scenario 1: Timer runs out before completion
        if (timeLeft <= 0) {
            // Score is proportional to the pairs found, capped at 50
            const pairsFoundRatio = matchedPairs.length / PAIRS_COUNT;
            return Math.round(pairsFoundRatio * 50);
        }

        // Scenario 2: Game is completed successfully
        let score = MAX_SCORE;

        // Penalty for time taken: Lose up to 40 points based on time
        const timeUsed = INITIAL_TIME - timeLeft;
        const timePenalty = (timeUsed / INITIAL_TIME) * 40;
        score -= timePenalty;
        
        // Penalty for extra moves: Lose 2 points for each extra move
        const extraMoves = moves - PAIRS_COUNT;
        const movePenalty = Math.max(0, extraMoves) * 2;
        score -= movePenalty;
        
        // Ensure score is within bounds (e.g., min score of 10 if completed)
        return Math.max(10, Math.round(score));

    }, [moves, timeLeft, matchedPairs]);

    const finishGame = useCallback(() => {
        setGameState('finished');
        clearInterval(timerRef.current);
        const score = calculateScore();
        setTimeout(() => onGameEnd(score), 1200);
    }, [calculateScore, onGameEnd]);

    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        finishGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState]);
    
    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [firstIndex, secondIndex] = flippedIndices;
            setMoves(prev => prev + 1);
            if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
                setMatchedPairs(prev => [...prev, cards[firstIndex].symbol]);
                setFlippedIndices([]);
            } else {
                setTimeout(() => setFlippedIndices([]), 1000);
            }
        }
    }, [flippedIndices, cards]);

    useEffect(() => {
        if (matchedPairs.length === PAIRS_COUNT) {
            finishGame();
        }
    }, [matchedPairs, finishGame]);

    const handleCardClick = (index) => {
        if (gameState !== 'playing' || flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(cards[index].symbol)) {
            return;
        }
        setFlippedIndices(prev => [...prev, index]);
    };

    const isCardFlipped = (card) => {
        return flippedIndices.includes(card.id) || matchedPairs.includes(card.symbol);
    }
    
    if (gameState === 'instructions') {
        return (
            <div className="text-center p-4 text-white">
                <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Memory Flip Challenge</h2>
                <div className="text-left space-y-3 mb-6">
                    <p><strong>Goal:</strong> Match all 10 pairs of cards as quickly as you can.</p>
                    <p><strong>Timer:</strong> You have <strong className="text-yellow-400">{INITIAL_TIME} seconds</strong> to complete the puzzle.</p>
                    <p><strong>Scoring:</strong> Your score is based on moves and time remaining (Max 100). If time runs out, your score will be based on pairs found.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setGameState('playing')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Memory Flip Challenge</h2>
            <div className="flex justify-between w-full max-w-md mb-4 text-lg">
                <span>Moves: <span className="font-bold text-white">{moves}</span></span>
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    Time: {timeLeft}s
                </span>
            </div>
            <div className="grid grid-cols-5 gap-3 w-full max-w-md"> 
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className="aspect-square perspective-1000"
                    >
                         <div
                            className={`relative w-full h-full transition-transform duration-700 rounded-lg ${isCardFlipped(card) ? '[transform:rotateY(180deg)]' : ''}`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute w-full h-full bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center [backface-visibility:hidden]"></div>
                            <div className="absolute w-full h-full bg-orange-500 rounded-lg flex items-center justify-center text-3xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                {card.symbol}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {gameState === 'finished' && (
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-green-400 animate-pulse">Challenge Complete!</h3>
                    <p className="text-lg">Submitting your score...</p>
                </div>
            )}
        </div>
    );
};

export default MemoryFlipGame;