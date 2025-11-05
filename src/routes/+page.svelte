<script lang="ts">
    import Timer from '$lib/components/Timer.svelte';

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

    let timeTotal = 120;

    let timeRemaining = $state(timeTotal);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let testIsOver = $state(false);

    let texts = [
        'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.',
        'Svelte ist ein modernes Frontend-Framework, das sich durch seine Einfachheit und Effizienz auszeichnet. Es ermöglicht Entwicklern, reaktive Benutzeroberflächen mit minimalem Aufwand zu erstellen.',
        'TypeScript ist eine von Microsoft entwickelte Programmiersprache, die auf JavaScript basiert und statische Typisierung sowie moderne Sprachfeatures bietet. Sie verbessert die Codequalität und Wartbarkeit in großen Projekten.'
    ];
    let text = texts[Math.floor(Math.random() * texts.length)];
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

        // Calculate global char index
        let globalIndex = currentRow * rowLength + currentIndex;
        if (globalIndex >= text.length) {
            testIsOver = true;
            return;
        }

        if ((textArray[currentRow][currentIndex].char !== event.key)) {
            textArray[currentRow][currentIndex].correct = false;
            falseTippedChars += 1;
            currentIndex += 1;
            accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));

            if (globalIndex + 1 >= text.length) {
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
        if (globalIndex + 1 >= text.length) {
            testIsOver = true;
        }

        if (currentRow >= textArray.length) {
            testIsOver = true;
        }
    };
</script>
<h1> {testIsOver ? 'Test Over!' : 'Typing Speed-Test'} </h1>
<Timer {timeTotal} bind:timeRemaining={timeRemaining} bind:testIsOver={testIsOver} {recalcSpeed}/>
{#if !testIsOver}
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
            {:else}
                <div class="row"></div>
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
            {:else}
                <div class="row"></div>
            {/if}
        {/if}
    </div>
{/if}
<input type="text" onkeydown={calculate} disabled={testIsOver} bind:this={inputRef}/>
<div class="stats">
    <div class="column">
        <div class="stats-container">
            <div class="stats-value">
                {wpm}
            </div>
            <div class="stats-text">
                WPM
            </div>
        </div>
        <div class="stats-container">
            <div class="stats-value">
                {cpm}
            </div>
            <div class="stats-text">
                CPM
            </div>
        </div>
    </div>
    <div class="accuracy-container">
        <div class="accuracy-area">
            <div class="accuracy-percent">
                {accuracy}
            </div>
            <svg class="accuracy" style="--progress: {accuracy}" viewBox="0 0 80 80" width="80" height="80">
                <circle class="accuracy-bg"></circle>
                <circle class="accuracy-fg"></circle>
            </svg>
        </div>
        <div> Accuracy</div>
    </div>
    <div class="column">
        <div class="stats-container">
            <div class="stats-value">
                {falseTippedChars}
            </div>
            <div class="stats-text">
                False Chars
            </div>
        </div>
        <div class="stats-container">
            <div class="stats-value">
                {correctTippedChars + falseTippedChars}
            </div>
            <div class="stats-text">
                Total Chars
            </div>
        </div>
    </div>
</div>
{#if testIsOver}
    <div class="overview">
        {#each textArray as row}
            <div class="overview-row">
                {#each row as char}
                    <span
                        class="overview-char"
                        class:char--correct={char.correct === true}
                        class:char--incorrect={char.correct === false}
                    >
                        {char.char}
                    </span>
                {/each}
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
    input {
        opacity: 0;
        position: absolute;
        pointer-events: none;
    }

    h1 {
        font-size: 2.5rem;
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
        border-bottom: 1px solid lightgrey;
        height: 30px;
        gap: 5px;
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
        margin: 30px;
    }

    .overview {
        margin-top: 20px;
        width: calc(100% - 80px);
        border: 1px solid rgba(194, 194, 194, 0.308);
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: 20px;
        display: flex;
        flex-direction: column;

        &-row {
            font-size: 1rem;
            border-bottom: 1px solid lightgrey;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 30px;
            gap: 5px;
        }

        &-char {
            display: inline-block;
            font-weight: bold;

            &--incorrect {
                color: rgb(255, 49, 100);
            }
        }
    }

    .accuracy {
        --size: 80px;
        --half-size: calc(var(--size) / 2);
        --stroke-width: 8px;
        --radius: calc((var(--size) - var(--stroke-width)) / 2);
        --circumference: calc(var(--radius) * pi * 2);
        --dash: calc((var(--progress) * var(--circumference)) / 100);

        &-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        & circle {
            cx: var(--half-size);
            cy: var(--half-size);
            r: var(--radius);
            fill: transparent;
            stroke-width: var(--stroke-width);
        }

        &-bg {
            stroke: #ddd;
        }

        &-fg {
            stroke: rgb(172, 49, 255);
            stroke-dasharray: var(--circumference);
            stroke-dashoffset: calc(var(--circumference) - var(--dash));
            transition: stroke-dashoffset 0.5s ease;
            transform: rotate(-90deg);
            transform-origin: var(--half-size) var(--half-size);
        }

        &-area {
            position: relative;
            width: 80px;
            height: 80px;    
        }

        &-percent {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.5rem;
            font-weight: bold;
        }
    }

    .stats {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 90%;

        &-container {
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }

        &-value {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
        }
    }

    .column {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>