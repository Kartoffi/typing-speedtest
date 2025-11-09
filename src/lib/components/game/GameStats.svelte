<script lang="ts">
    let { testIsOver, timeElapsedInMinutesAndSeconds, timeRemainingInMinutesAndSeconds, timeTotalInMinutesAndSeconds, wpm = $bindable(), cpm = $bindable(), accuracy = $bindable(), correctTippedChars = $bindable(), falseTippedChars = $bindable() } = $props();
</script>

<div class="stats">
    {#if testIsOver}
        <div class="stats-time">
            <div class="stats-container">
                <div class="stats-value">
                    {timeElapsedInMinutesAndSeconds()}
                </div>
                <div class="stats-text">
                    Elapsed
                </div>
            </div>
            
            <div class="stats-container">
                <div class="stats-value">
                    {timeTotalInMinutesAndSeconds()}
                </div>
                <div class="stats-text">
                    Total
                </div>
            </div>
        </div>
    {/if}
    
    <div class="stats-chars">
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
</div>

<style lang="scss">
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
        stroke: var(--primary-color);
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
    margin: 20px 0;
    width: 90%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    &-chars {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    &-time {
        display: flex;
        gap: 40px;
    }

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

.time-total {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
}
</style>