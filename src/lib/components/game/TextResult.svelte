<script lang="ts">
    let { textArray } = $props();
</script>

<div class="overview">
    {#each textArray as row, rowIndex}
        <div class="row">
            {#each row as word, wordIndex}
                <div class="word">
                    {#each word.chars as char, charIndex}
                        <span
                            class="char"
                            class:char--pending={char.correct === null}
                            class:char--incorrect={char.correct === false}
                            class:char--empty={char.char === ' '}
                            class:char--empty-incorrect={char.char === ' ' && char.correct === false}
                        >
                            {char.char}
                        </span>
                    {/each}
                </div>
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
.overview {
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
    width: 800px;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
}

.row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid lightgrey;
    height: 30px;
    width: 100%;
}

.word {
    display: flex;
}

.char {
    width: 16px;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &--pending {
        color: rgb(151, 151, 151);
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

        &-incorrect::after {
            content: '_';
        }
    }
}
</style>