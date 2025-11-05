<script lang="ts">
    import Timer from '$lib/components/Timer.svelte';
    import TypeArea from '$lib/components/TypeArea.svelte';
    import GameStats from '$lib/components/GameStats.svelte';
	import TextResult from '$lib/components/TextResult.svelte';

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

    let accuracy = $state(100);

    let wpm = $state(0);
    let cpm = $state(0);

    let timeTotal = 1200;

    let timeRemaining = $state(timeTotal);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let testIsOver = $state(false);
    let gameIsPaused = $state(false);

    let texts = [
        'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.',
        'Svelte ist ein modernes Frontend-Framework, das sich durch seine Einfachheit und Effizienz auszeichnet. Es ermöglicht Entwicklern, reaktive Benutzeroberflächen mit minimalem Aufwand zu erstellen.',
        'TypeScript ist eine von Microsoft entwickelte Programmiersprache, die auf JavaScript basiert und statische Typisierung sowie moderne Sprachfeatures bietet. Sie verbessert die Codequalität und Wartbarkeit in großen Projekten.'
    ];
    let text = texts[Math.floor(Math.random() * texts.length)];
    let currentIndex = $state(0);
    let whitelist = ['Shift'];
    let currentRow = $state(0);

    const startNewGame = () => {
        console.log('Starting new game');
        text = texts[Math.floor(Math.random() * texts.length)];
        textArray = createTextArray(text, 22);
        currentIndex = 0;
        currentRow = 0;
        correctTippedChars = 0;
        falseTippedChars = 0;
        accuracy = 100;
        wpm = 0;
        cpm = 0;
        timeRemaining = timeTotal;
        testIsOver = false;
        gameStarted = false;
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
<Timer {timeTotal} bind:timeRemaining bind:testIsOver {recalcSpeed} bind:gameStarted bind:gameIsPaused/>

{#if !testIsOver}
    <TypeArea bind:textArray bind:currentRow bind:currentIndex {calculate} bind:gameStarted bind:gameIsPaused bind:testIsOver/>
{/if}

{#if !gameStarted && !testIsOver}
    <button onclick="{() => gameStarted = true}" class="primary-button" disabled="{gameStarted}"> Start Game</button>
{/if}

{#if gameStarted}
    <GameStats bind:wpm bind:cpm bind:accuracy bind:falseTippedChars bind:correctTippedChars/>
{/if}

{#if testIsOver}
    <button class="primary-button" onclick="{startNewGame}"> New Game </button>

    <TextResult {textArray} />
{/if}

<style lang="scss">
    .primary-button {
        margin: 0 auto;
        padding: 16px 20px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 5px;
        transition: transform 0.3s ease;

        &:hover {
            background-color: var(--primary-color-dark);
            transform: translateY(-2px);
        }
    }
</style>