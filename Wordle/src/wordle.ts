export class WordleGame {

    private word: string;
    private maxAttempts: number = 7;
    private attempts: number = 1;
    private gamesWon: number = 0;
    private gamesLost: number = 0;

    constructor(word: string) {
        this.word = this.validateWord(word);
    }

    private validateWord(word: string): string {
        const upperWord = word.toUpperCase();
        const regex = /^[A-Z]{5}$/;
        if (!regex.test(upperWord)) {
            throw new Error("❗ Word must contain exactly 5 letters without accents or numbers. ❗");
        }
        return upperWord;
    }

    getWord() {
        return this.word;
    }

    getMaxAttempts() {
        return this.maxAttempts;
    }

    getAttempts() {
        return this.attempts;
    }

    getGamesWon() {
        return this.gamesWon;
    }

    getGamesLost() {
        return this.gamesLost;
    }

    checkLetters(inputWord: string): string[] {
        console.debug(`checkLetters called with inputWord: ${inputWord}`);
        const upperInputWord = this.validateWord(inputWord);
        const result: string[] = [];
        const resultColor: string[] = [];
        const wordArray = this.word.split('');
        const inputArray = upperInputWord.split('');
        const letterCount: { [key: string]: number } = {};

        for (const letter of wordArray) {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        }

        for (let i = 0; i < inputArray.length; i++) {
            if (this.word[i] === inputArray[i]) {
                result.push('correct');
                resultColor.push('🟩');
                letterCount[inputArray[i]]--;
                wordArray[i] = '';
            } else {
                result.push('');
                resultColor.push('');
            }
        }

        for (let i = 0; i < inputArray.length; i++) {
            if (result[i] === '') {
                if (wordArray.includes(inputArray[i]) && letterCount[inputArray[i]] > 0) {
                    result[i] = 'present';
                    resultColor[i] = '🟨';
                    letterCount[inputArray[i]]--;
                } else {
                    result[i] = 'absent';
                    resultColor[i] = '⬛';
                }
            }
        }

        console.log(resultColor.join(''));

        if (result.every(status => status === 'correct')) {
            console.log('🎉 Congratulations! You guessed the word correctly. 🎉');
            this.gamesWon++;
            process.exit(0);
        }

        if (this.attempts >= this.maxAttempts) {
            console.log(`You've used all your attempts. The word was: ${this.word}`);
            this.gamesLost++;
        }

        return result;
    }

    incrementAttempts() {
        this.attempts++;
    }

    async play() {
        console.debug('play method called');
        console.log(`Games won: ${this.gamesWon}, Games lost: ${this.gamesLost}`);
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let suggestedWord = '_____';

        const askForGuess = () => {
            console.debug(`askForGuess called, attempts: ${this.attempts}`);
            if (this.attempts >= this.maxAttempts) {
                console.log(`You've used all your attempts. The word was: ${this.word}`);
                this.gamesLost++;
                rl.close();
                return;
            }

            const prompt = this.attempts === 1
                ? `Enter your guess (or type "exit" to quit). Attempts left: ${this.maxAttempts - this.attempts}: `
                : `Enter your guess (or type "exit" to quit). Attempts left: ${this.maxAttempts - this.attempts}. Suggested word: ${suggestedWord}: `;

            rl.question(prompt, (inputWord: string) => {
                console.debug(`User input: ${inputWord}`);
                if (inputWord.toLowerCase() === 'exit') {
                    rl.close();
                    return;
                }
                try {
                    const validatedWord = this.validateWord(inputWord);
                    const result = this.checkLetters(validatedWord);
                    this.incrementAttempts();
                    suggestedWord = suggestedWord.split('').map((char, index) => result[index] === 'correct' ? validatedWord[index] : char).join('');
                    if (result.every(status => status === 'correct')) {
                        console.debug('User guessed the word correctly');
                        this.gamesWon++;
                        rl.close();
                        return;
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        console.error("Erreur :", error.message);
                    } else {
                        console.error("An unknown error occurred.");
                    }
                } finally {
                    askForGuess();
                }
            });
        };

        askForGuess();
    }

    // Mock implementation for testing purposes
    promptUser(): string {
        // This method should be overridden in tests
        return "";
    }
}