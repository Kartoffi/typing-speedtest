<script lang="ts">
    interface CharInfo {
        char: string;
        typed: boolean;
        correct: boolean | null;
    };

    let inputRef: HTMLInputElement;
    let accuracy = $state(100);

    let wpm = $state(0);
    let cpm = $state(0);
    let time = $state(60);

    let correctTippedChars = $state(0);
    let falseTippedChars = $state(0);

    let testOver = $state(false);
    let text = 'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier. Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.';
    let tippedText = $state('');
    let currentIndex = $state(0);
    let whitelist = ['Shift'];
    let currentRow = $state(0);
    
    const createTextArray = (text: string, maxCharLengthInRow: number) => {
        let chars = text.split('').map((char): CharInfo => ({ char, typed: false, correct: null }));
        let rows: CharInfo[][] = [];
        let row: CharInfo[] = [];
        chars.forEach((element, index) => {
            row.push(element);
            if ((index % maxCharLengthInRow === 0) && index !== 0) {
                rows.push(row);
                row = [];
            }
        });
        
        return rows;
    }

    let textArray = $state(createTextArray(text, 50));


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
    };

    const secondsInMinutes = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
</script>
<h1> Typing Speed-Test </h1>
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
    * {
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
    }

    input {
        opacity: 0;
        position: absolute;
        pointer-events: none;
    }

    .char {
        &--current {
            text-decoration: underline;
        }

        &--pending {
            color: grey;
        }

        &--correct {
            color: green;
        }

        &--incorrect {
            color: red;
        }
    }

    .text {
        border: 1px solid black;
        user-select: none;
        cursor: text;
        padding: 5px;
        text-wrap: pretty;
        text-align: justify;
    }
</style>