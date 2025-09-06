import React, { useState, useEffect, useCallback } from 'react';

// You can replace these symbols with image URLs if you prefer
const symbols = ['🎮', '🚀', '💻', '💡', '🤖', '🌐', '🧠', '🏆'];
const cardDeck = [...symbols, ...symbols];

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const MemoryFlipGame = ({ onGameEnd }) => {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = useCallback(() => {
        const shuffledCards = shuffleArray([...cardDeck]).map((symbol, index) => ({
            id: index,
            symbol,
        }));
        setCards(shuffledCards);
        setFlippedIndices([]);
        setMatchedPairs([]);
        setMoves(0);
        setGameOver(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

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
        if (matchedPairs.length === symbols.length) {
            setGameOver(true);
            // Simple scoring: 100 minus penalty for extra moves. Minimum score is 10.
            const score = Math.max(100 - (moves - symbols.length) * 5, 10);
            setTimeout(() => onGameEnd(score), 1200); // Wait for the last card flip animation
        }
    }, [matchedPairs, moves, onGameEnd]);


    const handleCardClick = (index) => {
        if (gameOver || flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(cards[index].symbol)) {
            return;
        }
        setFlippedIndices(prev => [...prev, index]);
    };

    const isCardFlipped = (card) => {
        return flippedIndices.includes(card.id) || matchedPairs.includes(card.symbol);
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold font-naruto text-orange-400 mb-4">Memory Flip Challenge</h2>
            <div className="mb-4 text-lg">
                Moves: <span className="font-bold text-white">{moves}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 w-full max-w-md">
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
                            <div className="absolute w-full h-full bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center [backface-visibility:hidden]">
                                {/* Front of the card */}
                            </div>
                            <div className="absolute w-full h-full bg-orange-500 rounded-lg flex items-center justify-center text-4xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                {/* Back of the card */}
                                {card.symbol}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {gameOver && (
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-green-400 animate-pulse">Challenge Complete!</h3>
                    <p className="text-lg">Submitting your score...</p>
                </div>
            )}
        </div>
    );
};

export default MemoryFlipGame;