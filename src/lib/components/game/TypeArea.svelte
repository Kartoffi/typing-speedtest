<script lang="ts">

    import { onMount } from 'svelte';
    
    let { 
        textArray = $bindable(),
        currentRow = $bindable(),
        currentLetterIndex = $bindable(),
        currentWordIndex = $bindable(),
        gameStarted = $bindable(),
        gameIsPaused = $bindable(),
        testIsOver = $bindable(),
        calculate
    } = $props();

    let inputRef: HTMLInputElement | null = null;

    // Focus input on mount
    onMount(() => {
        if (inputRef) inputRef.focus();
    });

    $effect(() => {
        if (gameStarted && !gameIsPaused && inputRef) {
            inputRef.focus();
        }
    });
</script>

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
    {#if gameIsPaused}
        <div class="paused">
            Game is paused
        </div>
    {/if}
    {#each textArray as word, wordIndex}
        <div class="word">
            {#each word.chars as char, charIndex}
                <span
                    class="char"
                    class:char--pending={char.correct === null}
                    class:char--current={currentWordIndex === wordIndex && charIndex === currentLetterIndex}
                    class:char--incorrect={char.correct === false}
                    class:char--empty={char.char === ' '}
                >
                    {char.char}
                </span>
            {/each}
        </div>
    {/each}
</div>

<input type="text" onkeydown={calculate} bind:this={inputRef} disabled={!gameStarted || gameIsPaused}/>

<style lang="scss">
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
    font-size: 1.2rem;
    display: flex;
    margin: 30px;
    outline: none;
    flex-wrap: wrap;
    max-width: 800px;
    &:focus {
        border: 2px solid rgba(173, 49, 255, 0.336);
    }
}

.word {
    padding-top: 20px;
    border-bottom: 1px solid lightgrey;
    display: flex;
}

.char {
    width: 10px;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &--pending {
        color: rgb(151, 151, 151);
    }

    &--current {
        border-bottom: 2px solid var(--primary-color);
        color: var(--primary-color);
    }

    &--incorrect {
        color: rgb(255, 49, 100);
    }

    &--empty {
        min-width: 0.6rem;
        height: 25px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }
}

input {
    opacity: 0;
    position: absolute;
    pointer-events: none;
}

.paused {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.788);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: rgba(0, 0, 0, 0.733);
}
</style>