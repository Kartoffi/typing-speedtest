<script lang="ts">
    let { textArray = $bindable(), currentRow = $bindable(), currentIndex = $bindable(), calculate } = $props();
    let inputRef: HTMLInputElement | null = null;

    console.log(textArray[currentRow]);
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

<input type="text" onkeydown={calculate} bind:this={inputRef}/>

<style lang="scss">
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

input {
    opacity: 0;
    position: absolute;
    pointer-events: none;
}
</style>