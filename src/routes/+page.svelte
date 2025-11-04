<script lang="ts">
    interface Char {
        char: string;
        typed: boolean;
        correct: boolean | null;
    };

    interface Word {
        word: string;
        chars: Char[];
    };

    let inputRef: HTMLInputElement;
    let accuracy = $state(100);

    let wpm = $state(0);
    let cpm = $state(0);
    let time = $state(600);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let testOver = $state(false);
    let text = 'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier. Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.';
    let currentIndex = $state(0);
    let whitelist = ['Shift'];
    let currentRow = $state(0);
    
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
        let elapsedTime = 60 - time;
        if (elapsedTime > 0) {
            cpm = Math.floor(correctTippedChars / (elapsedTime / 60));
            wpm = Math.floor(cpm / 5);
        } else {
            cpm = 0;
            wpm = 0;
        }
    };

    const countdown = () => {
        if (testOver) return;
        if (time > 0) {
            setTimeout(() => {
                if (testOver) return;
                time -= 1;
                recalcSpeed();
                countdown();
            }, 1000);
        }

        if (time === 0) {
            testOver = true;
        }
    };

    countdown();

    const calculate = (event: KeyboardEvent) => {
        if (testOver || whitelist.includes(event.key)) {
            return;
        }

        // Get row length for easier reference
        let rowLength = textArray[currentRow]?.length || 1;

        // Calculate global char index
        let globalIndex = currentRow * rowLength + currentIndex;
        if (globalIndex >= text.length) {
            testOver = true;
            return;
        }

        if ((textArray[currentRow][currentIndex].char !== event.key)) {
            textArray[currentRow][currentIndex].correct = false;
            falseTippedChars += 1;
            currentIndex += 1;
            accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));
            if (globalIndex + 1 >= text.length) {
                testOver = true;
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
        if (globalIndex + 1 >= text.length) {
            testOver = true;
        }

        if (currentRow >= textArray.length) {
            testOver = true;
        }
    };

    const secondsInMinutes = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
</script>
<h1> Typing Speed-Test </h1>
{#if !testOver}
    <div
        class="text"
        role="button"
        tabindex="0"
        onclick={() => inputRef && inputRef.focus()}
        onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef && inputRef.focus();
            }
        }}
    >
        {#if textArray.length > 0 && textArray[currentRow]}
            {#if textArray[currentRow - 1]}
                <div class="row">
                    {#each textArray[currentRow - 1] as char}
                        <span
                            class="char"
                            class:char--correct={char.correct === true}
                            class:char--incorrect={char.correct === false}
                        >
                            {char.char}
                        </span>
                    {/each}
                </div>
            {/if}
            <div class="row">
                {#each textArray[currentRow] as char, index}
                    <span
                        class="char"
                        class:char--current={index === currentIndex}
                        class:char--correct={index < currentIndex && char.correct === true}
                        class:char--incorrect={index < currentIndex && char.correct === false}
                        class:char--pending={index > currentIndex}
                    >
                        {char.char}
                    </span>
                {/each}
            </div>
            {#if textArray[currentRow + 1]}
                <div class="row">
                    {#each textArray[currentRow + 1] as char}
                        <span
                            class="char"
                            class:char--pending={true}
                        >
                            {char.char}
                        </span>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
{/if}
<div> {secondsInMinutes(time)} seconds left</div>
<input type="text" onkeydown={calculate} disabled={testOver} bind:this={inputRef}/>
{#if testOver}
    <h2> Test Over! </h2>
    <p>
        {#each textArray as row}
            {#each row as char}
                <span
                    class="char"
                    class:char--correct={char.correct === true}
                    class:char--incorrect={char.correct === false}
                >
                    {char.char}
                </span>
            {/each}
            <br/>
        {/each}
    </p>
{/if}
<div> {wpm} WPM </div>
<div> {cpm} CPM </div>
<div> Accuracy: {accuracy}</div>
<div> False chars: {falseTippedChars}</div>
<div> Total chars: {correctTippedChars + falseTippedChars}</div>

<style lang="scss">
    input {
        opacity: 0;
        position: absolute;
        pointer-events: none;
    }

    .char {
        display: inline-block;
        font-weight: bold;
        width: 16px;
        height: 28px;
        text-align: center;
        border-bottom: 2px solid transparent;
        &--current {
            border-bottom: 2px solid rgb(172, 49, 255);
            color: rgb(172, 49, 255);
        }

        &--pending {
            color: rgb(151, 151, 151);
        }

        &--incorrect {
            color: rgb(255, 49, 100);
        }
    }

    .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid lightgrey;
    }

    .text {
        border: 1px solid rgba(194, 194, 194, 0.308);
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        user-select: none;
        cursor: text;
        padding: 30px;
        text-wrap: pretty;
        text-align: justify;
        font-size: 1.2rem;
        width: calc(100% - 80px);
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
</style>