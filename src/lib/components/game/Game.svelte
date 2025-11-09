<script lang="ts">
    import Timer from '$lib/components/game/Timer.svelte';
    import TypeArea from '$lib/components/game/TypeArea.svelte';
    import GameStats from '$lib/components/game/GameStats.svelte';
	import TextResult from '$lib/components/game/TextResult.svelte';

    let { text = $bindable(), minutes, seconds, timeTotal = $bindable(), optionsMode = $bindable() } = $props();

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
    let timeElapsed = $derived(timeTotal - timeRemaining);

    let timeElapsedInMinutesAndSeconds = $derived(() => convertSecondsInMinutes(timeElapsed));
    let timeTotalInMinutesAndSeconds = $derived(() => convertSecondsInMinutes(timeTotal));
    let timeRemainingInMinutesAndSeconds = $derived(() => convertSecondsInMinutes(timeRemaining));

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let cpm = $derived(timeElapsed > 0 ? Math.floor(correctTippedChars / (timeElapsed / 60)) : 0);
    let wpm = $derived(cpm > 0 ? Math.floor(cpm / 5) : 0);
    let accuracy = $derived((Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100))) || 0);

    let testIsOver = $state(false);
    let gameIsPaused = $state(false);

    let currentCharIndex = $state(0);
    let currentWordIndex = $state(0);
    let whitelist = ['Shift'];

    // get the current width of the text area
    let textAreaWidth = $state(0);
    let currentRowIndex = $state(0);

    let textArray = $state(createTextArray(text));

    let totalWords = $derived(() => {
        let count = 0;
        for (let row of textArray) {
            count += row.length;
        }
        return count;
    });

    let totalChars = $derived(() => {
        let count = 0;
        for (let row of textArray) {
            for (let word of row) {
                count += word.chars.length;
            }
        }
        return count;
    });

    $effect(() => {
        textArray = createTextArray(text);
    });

    const startNewGame = () => {
        text = '';
        textArray = [];
        currentCharIndex = 0;
        currentRowIndex = 0;
        currentWordIndex = 0;
        correctTippedChars = 0;
        falseTippedChars = 0;
        timeRemaining = timeTotal;
        testIsOver = false;
        gameStarted = false;
        gameIsPaused = false;
        optionsMode = true;
    };

    const restartGame = () => {
        textArray = createTextArray(text);
        currentCharIndex = 0;
        currentRowIndex = 0;
        currentWordIndex = 0;
        correctTippedChars = 0;
        falseTippedChars = 0;
        timeRemaining = timeTotal;
        testIsOver = false;
        gameStarted = false;
        gameIsPaused = false;
    }

    const calculate = (event: KeyboardEvent) => {
        if (testIsOver || whitelist.includes(event.key)) {
            return;
        }

        let lastRowIndex = textArray.length - 1;
        let lastWordIndex = textArray[lastRowIndex].length - 1;
        let lastCharIndex = textArray[lastRowIndex][lastWordIndex].chars.length - 1;

        if (currentRowIndex === lastRowIndex &&
            currentWordIndex === lastWordIndex &&
            currentCharIndex === lastCharIndex) {
            testIsOver = true;
            return;
        }

        if (textArray[currentRowIndex][currentWordIndex].chars[currentCharIndex].char === event.key) {
            textArray[currentRowIndex][currentWordIndex].chars[currentCharIndex].typed = true;
            textArray[currentRowIndex][currentWordIndex].chars[currentCharIndex].correct = true;
            correctTippedChars += 1;
        } else {
            textArray[currentRowIndex][currentWordIndex].chars[currentCharIndex].typed = true;
            textArray[currentRowIndex][currentWordIndex].chars[currentCharIndex].correct = false;
            falseTippedChars += 1;
        }

        // Move to next char
        if (currentCharIndex < textArray[currentRowIndex][currentWordIndex].chars.length - 1) {
            currentCharIndex += 1;
        } else {
            // Move to next word
            currentCharIndex = 0;
            if (currentWordIndex < textArray[currentRowIndex].length - 1) {
                currentWordIndex += 1;
            } else {
                // Move to next row
                currentWordIndex = 0;
                if (currentRowIndex < textArray.length - 1) {
                    currentRowIndex += 1;
                }
            }
        }
    };

    function convertSecondsInMinutes(seconds: number) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function createTextArray(text: string) {
        let words = text.split(' ');
        let wordsArr = [];
        let rows: Word[][] = [];
        let currentAmountOfCharsInRow = 0;

        wordsArr = words.map((word): Word => {
            return {
                word,
                chars: word.split('').map((char): Char => ({ char, typed: false, correct: null }))
            };
        });

        wordsArr.map((word) => {
            
            // if word is last one in wordsArr
            if (!(wordsArr.indexOf(word) === wordsArr.length - 1)) {
                word.chars.push({ char: ' ', typed: false, correct: null });
            }

        });

        let row: Word[] = [];
        for (let i = 0; i < wordsArr.length; i++) {
            const word = wordsArr[i];
            const wordLength = word.chars.length;
            // If adding this word would exceed the row limit, start a new row
            if ((currentAmountOfCharsInRow + wordLength) * 16 > textAreaWidth && row.length > 0) {
                rows.push(row);
                row = [];
                currentAmountOfCharsInRow = 0;
            }
            row.push(word);
            currentAmountOfCharsInRow += wordLength;
        }
        // Push the last row if it has any words
        if (row.length > 0) {
            rows.push(row);
        }
        return rows;
    }
</script>

<h1> {testIsOver ? 'Test Over!' : 'Typing Speed-Test'} </h1>

{#if !testIsOver}
    <TypeArea bind:textAreaWidth bind:textArray bind:currentRowIndex bind:currentWordIndex bind:currentCharIndex {calculate} bind:gameStarted bind:gameIsPaused bind:testIsOver/>
{/if}

{#if !gameStarted && !testIsOver}
    <button onclick="{() => gameStarted = true}" class="primary-button" disabled="{gameStarted}"> Start Game</button>
{/if}

{#if gameStarted}
    <Timer {timeTotal} {convertSecondsInMinutes} bind:timeRemaining bind:testIsOver bind:gameStarted bind:gameIsPaused/>
    <GameStats bind:wpm bind:cpm bind:accuracy bind:falseTippedChars bind:correctTippedChars {testIsOver} {timeElapsedInMinutesAndSeconds} {timeTotalInMinutesAndSeconds} {timeRemainingInMinutesAndSeconds} />
{/if}

<div class="button-row">
    {#if gameStarted}
        <button class="primary-button" onclick="{restartGame}"> Restart Game </button>
    {/if}
    {#if testIsOver}
        <button class="primary-button" onclick="{startNewGame}"> New Game </button>
    {/if}
</div>

{#if testIsOver}
    <TextResult {textArray} />
{/if}

<style lang="scss">
    .button-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin: 30px 0;
        max-width: 450px;
        width: 100%;
    }
</style>