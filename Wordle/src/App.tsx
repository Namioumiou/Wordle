import React, { useState } from 'react';
import { WordleGame } from './wordle';

interface AppProps {
    game: WordleGame;
}

const App: React.FC<AppProps> = ({ game }) => {
    const [input, setInput] = useState('');
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [suggestedWord, setSuggestedWord] = useState('_____');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = game.checkLetters(input);
            setAttempts(attempts + 1);
            setSuggestedWord(suggestedWord.split('').map((char, index) => result[index] === 'correct' ? input[index] : char).join(''));
            if (result.every(status => status === 'correct')) {
                setMessage('🎉 Congratulations! You guessed the word correctly. 🎉');
            } else {
                setMessage(result.join(' '));
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage('An unknown error occurred.');
            }
        }
        setInput('');
    };

    return (
        <div>
            <h1>Wordle Game</h1>
            <p>Attempts left: {game.getMaxAttempts() - attempts}</p>
            {attempts > 0 && <p>Suggested word: {suggestedWord}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={5}
                />
                <button type="submit">Submit</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default App;
