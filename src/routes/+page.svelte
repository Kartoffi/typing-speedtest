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
    let textArray = $state(
        text.split('').map((char): CharInfo => ({ char, typed: false, correct: null }))
    );
    let tippedText = $state('');
    let currentIndex = $state(0);
    let whitelist = ['Shift'];


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

        if (currentIndex > text.length) {
            testOver = true;
            return;
        }

        if ((text.split('')[currentIndex] !== event.key)) {
            textArray[currentIndex].correct = false;
            falseTippedChars += 1;
            currentIndex += 1;
            accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));
            if (currentIndex >= text.length) {
                testOver = true;
            }
            return;
        }

        textArray[currentIndex].correct = true;
        correctTippedChars += 1;
        currentIndex += 1;
        accuracy = Math.max(0, Math.floor(((correctTippedChars) / (correctTippedChars + falseTippedChars)) * 100));
        recalcSpeed();

        if (currentIndex >= text.length) {
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
    {#each textArray as char, index}
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
</style>