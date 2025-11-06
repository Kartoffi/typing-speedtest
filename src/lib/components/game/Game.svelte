<script lang="ts">
    import Timer from '$lib/components/game/Timer.svelte';
    import TypeArea from '$lib/components/game/TypeArea.svelte';
    import GameStats from '$lib/components/game/GameStats.svelte';
	import TextResult from '$lib/components/game/TextResult.svelte';

    let { text = $bindable(), timeTotal = $bindable(), optionsMode = $bindable() } = $props();

    interface Char {
        char: string;
        typed: boolean;
        correct: boolean | null;
    };

    interface Word {
        word: string;
        chars: Char[];
    };

    let gameStarted = $state(false);

    let timeRemaining = $state(timeTotal);
    let elapsedTime = $derived(timeTotal - timeRemaining);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let cpm = $derived(Math.floor(correctTippedChars / (elapsedTime / 60)) || 0);
    let wpm = $derived(Math.floor(cpm / 5) || 0);
    let accuracy = $derived((Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100))) || 0);

    let testIsOver = $state(false);
    let gameIsPaused = $state(false);

    let currentLetterIndex = $state(0);
    let currentWordIndex = $state(0);
    let whitelist = ['Shift'];
    let currentRow = $state(0);

    let textArray = $state(createTextArrayTest(text));

    const startNewGame = () => {
        text = '';
        textArray = [];
        currentLetterIndex = 0;
        currentRow = 0;
        correctTippedChars = 0;
        falseTippedChars = 0;
        timeRemaining = timeTotal;
        testIsOver = false;
        gameStarted = false;
        gameIsPaused = false;
        optionsMode = true;
    };
    
    /*const calculate = (event: KeyboardEvent) => {
        if (testIsOver || whitelist.includes(event.key)) {
            return;
        }

        // Get row length for easier reference
        let rowLength = textArray[currentRow]?.length || 1;

        // Count total chars in textArray
        const totalChars = textArray.reduce((sum, row) => sum + row.length, 0);
        // Calculate current char position
        let charPos = 0;
        for (let r = 0; r < currentRow; r++) {
            charPos += textArray[r].length;
        }
        charPos += currentLetterIndex;
        if (charPos >= totalChars) {
            testIsOver = true;
            return;
        }

        if ((textArray[currentRow][currentLetterIndex].char !== event.key)) {
            textArray[currentRow][currentLetterIndex].correct = false;
            falseTippedChars += 1;
            currentLetterIndex += 1;

            if (charPos + 1 >= totalChars) {
                testIsOver = true;
            }

            // If last letter of row, move to next row
            if (currentLetterIndex >= rowLength) {
                currentRow += 1;
                currentLetterIndex = 0;
            }
            return;
        }

        textArray[currentRow][currentLetterIndex].correct = true;
        correctTippedChars += 1;
        currentLetterIndex += 1;

        // If last letter of row, move to next row
        if (currentLetterIndex >= rowLength) {
            currentRow += 1;
            currentLetterIndex = 0;
        }
        if (charPos + 1 >= totalChars) {
            testIsOver = true;
        }

        if (currentRow >= textArray.length) {
            testIsOver = true;
        }
    };*/

    const calculate = (event: KeyboardEvent) => {
        if (testIsOver || whitelist.includes(event.key)) {
            return;
        }

        const totalWords = textArray.length;
        const currentWord = textArray[currentWordIndex];

        if ((currentLetterIndex >= currentWord.chars.length) && (currentWordIndex >= totalWords)) {
            testIsOver = true;
            return;
        }

        if ((textArray[currentWordIndex].chars[currentLetterIndex].char !== event.key)) {
            textArray[currentWordIndex].chars[currentLetterIndex].correct = false;
            falseTippedChars += 1;
            currentLetterIndex += 1;

            if ((currentLetterIndex >= currentWord.chars.length) && (currentWordIndex + 1 >= totalWords)) {
                testIsOver = true;
            }

            if ((currentLetterIndex >= currentWord.chars.length)) {
                currentWordIndex++;
                currentLetterIndex = 0;
            }
            return;
        }

        textArray[currentWordIndex].chars[currentLetterIndex].correct = true;
        correctTippedChars += 1;
        currentLetterIndex += 1;

        if ((currentLetterIndex >= currentWord.chars.length) && (currentWordIndex + 1 >= totalWords)) {
            testIsOver = true;
        }

        if ((currentLetterIndex >= currentWord.chars.length)) {
            currentWordIndex++;
            currentLetterIndex = 0;
        }
    };

    function createTextArray(text: string, maxCharLengthInRow: number) {
        let words = text.split(' ');
        let wordsArr = [];
        let remainingCharsInRow = maxCharLengthInRow;
        let rows: Char[][] = [[]];

        wordsArr = words.map((word): Word => {
            return {
                word,
                chars: word.split('').map((char): Char => ({ char, typed: false, correct: null }))
            };
        });

        wordsArr.forEach((wordObj, i) => {
            // +1 for space between words, except at the start of a row
            let wordLengthWithSpace = wordObj.word.length + (rows[rows.length - 1].length > 0 ? 1 : 0);
            if (wordLengthWithSpace > remainingCharsInRow) {
                rows.push([]);
                remainingCharsInRow = maxCharLengthInRow;
            }
            // Add space if not first word in row
            if (rows[rows.length - 1].length > 0) {
                rows[rows.length - 1].push({ char: ' ', typed: false, correct: null });
                remainingCharsInRow -= 1;
            }
            rows[rows.length - 1].push(...wordObj.chars);
            remainingCharsInRow -= wordObj.word.length;
        });

        return rows;
    }

    function createTextArrayTest(text: string) {
        let words = text.split(' ');

        let wordsArray = words.map((word): Word => {
            return {
                word,
                chars: [
                    ...word.split('').map((char): Char => ({ char, typed: false, correct: null })),
                ]
            };
        });

        // Add space if not last word
        for (let i = 0; i < wordsArray.length - 1; i++) {
            wordsArray[i].chars.push({ char: ' ', typed: false, correct: null });
        }

        return wordsArray;
    }
</script>

<h1> {testIsOver ? 'Test Over!' : 'Typing Speed-Test'} </h1>

{#if !testIsOver}
    <TypeArea bind:textArray bind:currentWordIndex bind:currentLetterIndex {calculate} bind:gameStarted bind:gameIsPaused bind:testIsOver/>
{/if}

{#if !gameStarted && !testIsOver}
    <button onclick="{() => gameStarted = true}" class="primary-button" disabled="{gameStarted}"> Start Game</button>
{/if}

{#if gameStarted}
    <Timer {timeTotal} bind:timeRemaining bind:testIsOver bind:gameStarted bind:gameIsPaused/>
    <GameStats bind:wpm bind:cpm bind:accuracy bind:falseTippedChars bind:correctTippedChars/>
{/if}

{#if testIsOver}
    <TextResult {textArray} />
    <button class="primary-button" onclick="{startNewGame}"> New Game </button>
{/if}