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

    let accuracy = $state(0);

    let wpm = $state(0);
    let cpm = $state(0);

    let timeRemaining = $state(timeTotal);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let testIsOver = $state(false);
    let gameIsPaused = $state(false);

    let currentIndex = $state(0);
    let whitelist = ['Shift'];
    let currentRow = $state(0);

    const startNewGame = () => {
        text = '';
        textArray = [];
        currentIndex = 0;
        currentRow = 0;
        correctTippedChars = 0;
        falseTippedChars = 0;
        accuracy = 0;
        wpm = 0;
        cpm = 0;
        timeRemaining = timeTotal;
        testIsOver = false;
        gameStarted = false;
        gameIsPaused = false;
        optionsMode = true;
    };
    
    const createTextArray = (text: string, maxCharLengthInRow: number) => {
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

    let textArray = $state(createTextArray(text, 22));

    const recalcSpeed = () => {
        let elapsedTime = timeTotal - timeRemaining;
        if (elapsedTime > 0) {
            cpm = Math.floor(correctTippedChars / (elapsedTime / 60));
            wpm = Math.floor(cpm / 5);
        } else {
            cpm = 0;
            wpm = 0;
        }
    };

    const calculate = (event: KeyboardEvent) => {
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
        charPos += currentIndex;
        if (charPos >= totalChars) {
            testIsOver = true;
            return;
        }

        if ((textArray[currentRow][currentIndex].char !== event.key)) {
            textArray[currentRow][currentIndex].correct = false;
            falseTippedChars += 1;
            currentIndex += 1;
            accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));

            if (charPos + 1 >= totalChars) {
                testIsOver = true;
            }

            // If last letter of row, move to next row
            if (currentIndex >= rowLength) {
                currentRow += 1;
                currentIndex = 0;
            }
            return;
        }

        textArray[currentRow][currentIndex].correct = true;
        correctTippedChars += 1;
        currentIndex += 1;
        accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));
        recalcSpeed();
        // If last letter of row, move to next row
        if (currentIndex >= rowLength) {
            currentRow += 1;
            currentIndex = 0;
        }
        if (charPos + 1 >= totalChars) {
            testIsOver = true;
        }

        if (currentRow >= textArray.length) {
            testIsOver = true;
        }
    };
</script>
<h1> {testIsOver ? 'Test Over!' : 'Typing Speed-Test'} </h1>

{#if !testIsOver}
    <TypeArea bind:textArray bind:currentRow bind:currentIndex {calculate} bind:gameStarted bind:gameIsPaused bind:testIsOver/>
{/if}

{#if !gameStarted && !testIsOver}
    <button onclick="{() => gameStarted = true}" class="primary-button" disabled="{gameStarted}"> Start Game</button>
{/if}
{#if gameStarted}
    <Timer {timeTotal} bind:timeRemaining bind:testIsOver {recalcSpeed} bind:gameStarted bind:gameIsPaused/>
    <GameStats bind:wpm bind:cpm bind:accuracy bind:falseTippedChars bind:correctTippedChars/>
{/if}

{#if testIsOver}
    <TextResult {textArray} />
    <button class="primary-button" onclick="{startNewGame}"> New Game </button>
{/if}