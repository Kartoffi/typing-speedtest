<script lang="ts">
    let { textArray } = $props();
</script>

<div class="overview">
    {#each textArray as row}
        <div class="overview-row">
            {#each row as char}
                <span
                    class="overview-char"
                    class:overview-char--incorrect={char.correct === false}
                >
                    {char.char}
                </span>
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
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
</style>