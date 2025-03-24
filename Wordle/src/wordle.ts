export class WordleGame {

    private word: string;
    private maxAttempts: number = 7;
    private attempts: number = 1;

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

    checkLetters(inputWord: string): string[] {
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
        }

        return result;
    }

    incrementAttempts() {
        this.attempts++;
    }

    async play() {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askForGuess = () => {
            if (this.attempts == this.maxAttempts) {
                console.log(`You've used all your attempts. The word was: ${this.word}`);
                rl.close();
                return;
            }

            rl.question(`Enter your guess (or type "exit" to quit). Attempts left: ${this.maxAttempts - this.attempts}: `, (inputWord: string) => {
                if (inputWord.toLowerCase() === 'exit') {
                    rl.close();
                    return;
                }
                try {
                    const validatedWord = this.validateWord(inputWord);
                    const result = this.checkLetters(validatedWord);
                    this.incrementAttempts();
                    if (result.every(status => status === 'correct')) {
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
}