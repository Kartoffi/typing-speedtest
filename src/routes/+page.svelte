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
<Timer {timeTotal} bind:timeRemaining bind:testIsOver {recalcSpeed}/>
{#if !testIsOver}
    <TypeArea bind:textArray bind:currentRow bind:currentIndex {calculate}/>
{/if}
<GameStats bind:wpm bind:cpm bind:accuracy bind:falseTippedChars bind:correctTippedChars/>
{#if testIsOver}
    <TextResult {textArray} />
{/if}

<style lang="scss">
    h1 {
        font-size: 2.5rem;
    }
</style>