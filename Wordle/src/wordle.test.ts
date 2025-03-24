import { WordleGame } from './wordle';
import { expect, it, describe, vi } from 'vitest';

describe('WordleGame', () => {
    it('should throw an error if the word is not exactly 5 letters', () => {
        // Arrange
        const consoleErrorSpy = vi.spyOn(console, 'error');

        // Act
        const game1 = () => new WordleGame("hell");
        const game2 = () => new WordleGame("helloo");

        // Assert
        expect(game1).toThrow("Word must contain exactly 5 letters without accents or numbers.");
        expect(game2).toThrow("Word must contain exactly 5 letters without accents or numbers.");

        // Cleanup
        consoleErrorSpy.mockRestore();
    });

    it('should convert the word to uppercase', () => {
        // Arrange
        const game = new WordleGame("hello");

        // Act
        const word = game.getWord();

        // Assert
        expect(word).toBe("HELLO");
    });

    it('should log an error message if the input word contain accent or numbers', () => {
        // Arrange
        const consoleErrorSpy = vi.spyOn(console, 'error');

        // Act
        const game1 = () => new WordleGame("héllo");
        const game2 = () => new WordleGame("hell1");

        // Assert
        expect(game1).toThrow("❗ Word must contain exactly 5 letters without accents or numbers. ❗");
        expect(game2).toThrow("❗ Word must contain exactly 5 letters without accents or numbers. ❗");

        // Cleanup
        consoleErrorSpy.mockRestore();
    });

    it('should handle duplicate letters correctly when one is correct and the other is present', () => {
        // Arrange
        const game = new WordleGame("hello");

        // Act
        const result = game.checkLetters("heell");

        // Assert
        expect(result).toEqual(['correct', 'correct', 'absent', 'correct', 'present']);
    });

    it('should handle duplicate letters correctly when both are present but not correct', () => {
        // Arrange
        const game = new WordleGame("hello");

        // Act
        const result = game.checkLetters("llele");

        // Assert
        expect(result).toEqual(['present', 'absent', 'present', 'correct', 'absent']);
    });

    it('should return correct, present, or absent for each letter in the input word', () => {
        // Arrange
        const game = new WordleGame("hello");

        // Act
        const result2 = game.checkLetters("holle");
        const result3 = game.checkLetters("world");
        const result4 = game.checkLetters("hlloe");

        // Assert
        expect(result2).toEqual(['correct', 'present', 'correct', 'correct', 'present']);
        expect(result3).toEqual(['absent', 'present', 'absent', 'correct', 'absent']);
        expect(result4).toEqual(['correct', 'present', 'correct', 'present', 'present']);
    });

    it('should log a congratulation message if all letters are correct and stop the game', () => {
        // Arrange
        const game = new WordleGame("hello");
        const consoleSpy = vi.spyOn(console, 'log');
        const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
            throw new Error(`process.exit: ${code}`);
        });

        // Act
        try {
            game.checkLetters("hello");
        } catch (error) {
            expect((error as Error).message).toBe('process.exit: 0');
        }

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith('🟩🟩🟩🟩🟩');
        expect(consoleSpy).toHaveBeenCalledWith('🎉 Congratulations! You guessed the word correctly. 🎉');

        // Cleanup        
        consoleSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('should log only the colored result if not all letters are correct', () => {
        // Arrange
        const game = new WordleGame("hello");
        const consoleSpy = vi.spyOn(console, 'log');

        // Act
        game.checkLetters("holle");
        game.checkLetters("hlloe");

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith('🟩🟨🟩🟩🟨');
        expect(consoleSpy).not.toHaveBeenCalledWith('🎉 Congratulations! You guessed the word correctly. 🎉');
        expect(consoleSpy).toHaveBeenCalledWith('🟩🟨🟩🟨🟨');
        expect(consoleSpy).not.toHaveBeenCalledWith('🎉 Congratulations! You guessed the word correctly. 🎉');

        // Cleanup        
        consoleSpy.mockRestore();
    });

    it('should count the number of attempts correctly', () => {
        // Arrange
        const game = new WordleGame("hello");
        const consoleSpy = vi.spyOn(console, 'log');

        // Act
        game.checkLetters("world");
        game.incrementAttempts();
        game.checkLetters("world");
        game.incrementAttempts();
        game.checkLetters("world");
        game.incrementAttempts();

        // Assert
        expect(game['attempts']).toBe(4); // Initial attempt + 3 increments
        expect(consoleSpy).toHaveBeenCalledWith('⬛🟨⬛🟩⬛');
        expect(consoleSpy).toHaveBeenCalledWith('⬛🟨⬛🟩⬛');
        expect(consoleSpy).toHaveBeenCalledWith('⬛🟨⬛🟩⬛');

        // Cleanup        
        consoleSpy.mockRestore();
    });

    it('should play the game and handle user input correctly', async () => {
        // Arrange
        console.debug('Test: should play the game and handle user input correctly');
        const game = new WordleGame("hello");
        const consoleSpy = vi.spyOn(console, 'log');
        const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: number | undefined): never => {
            throw new Error(`process.exit: ${code}`);
        });

        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const rlQuestionSpy = vi.spyOn(rl, 'question').mockImplementation((question, callback) => {
            console.debug(`Mocked readline question: ${question}`);
            if (question.includes("Attempts left: 6")) {
                callback("hello");
            } else {
                callback("exit");
            }
        });

        // Act
        try {
            await game.play();
        } catch (error) {
            console.debug(`Caught error: ${(error as Error).message}`);
            expect((error as Error).message).toBe('process.exit: 0');
        }

        // Assert
        console.debug('Asserting console logs');
        expect(consoleSpy).toHaveBeenCalledWith('🟩🟩🟩🟩🟩');
        expect(consoleSpy).toHaveBeenCalledWith('🎉 Congratulations! You guessed the word correctly. 🎉');

        // Cleanup
        consoleSpy.mockRestore();
        processExitSpy.mockRestore();
        rlQuestionSpy.mockRestore();
    });

    /*it('should display a message when the player runs out of attempts', () => {
        // Arrange
        const game = new WordleGame("hello");
        const consoleSpy = vi.spyOn(console, 'log');

        // Act
        for (let i = 0; i < 6; i++) {
            game.checkLetters("world");
            game.incrementAttempts();
        }
        game.checkLetters("world");

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(`You've used all your attempts. The word was: HELLO`);

        // Cleanup        
        consoleSpy.mockRestore();    
    });*/
});