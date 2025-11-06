<script lang="ts">
    let { timeRemaining = $bindable(), timeTotal, testIsOver = $bindable(), gameStarted = $bindable(), gameIsPaused = $bindable() } = $props();

    const convertSecondsInMinutes = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    let timerId: ReturnType<typeof setTimeout> | null = null;

    function stopCountdown() {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    }

    function pauseCountdown() {
        stopCountdown();
    }

    function resumeCountdown() {
        if (!timerId) {
            countdown();
        }
    }

    function countdown() {
        stopCountdown();
        if (!gameStarted || testIsOver || timeRemaining <= 0) return;
        timerId = setTimeout(() => {
            if (!gameStarted || testIsOver || timeRemaining <= 0) {
                stopCountdown();
                return;
            }
            timeRemaining -= 1;
            if (timeRemaining <= 0) {
                testIsOver = true;
                stopCountdown();
                return;
            }
            countdown();
        }, 1000);
    }

    $effect(() => {
        if (gameStarted && !testIsOver && timeRemaining > 0) {
            countdown();
        }
        
        if (gameIsPaused && !testIsOver && gameStarted && timeRemaining > 0) {
            pauseCountdown();

        }
        
        if (!gameIsPaused && !testIsOver && gameStarted && timeRemaining > 0) {
            resumeCountdown();
        }
        
        else {
            stopCountdown();
        }
    });
</script>

<div class="countdown">
    <div class="countdown-timer">
        <button class="button {testIsOver && 'hidden'}" onclick="{() => gameIsPaused = !gameIsPaused}" disabled="{testIsOver}">
            <img class="icon" src="{gameIsPaused ? '/src/lib/assets/icons/continue.svg' : '/src/lib/assets/icons/pause.svg'}" alt="Pause" />
        </button>
        {convertSecondsInMinutes(timeRemaining)}
        <button class="button {testIsOver && 'hidden'}" onclick="{() => testIsOver = true}" disabled="{testIsOver}">
            <img class="icon" src="/src/lib/assets/icons/stop.svg" alt="Stop" />
        </button>
    </div>
    <div class="countdown-progression-bar">
        <div
            class="countdown-progression-bar-fill"
            style="width: {(timeRemaining / timeTotal) * 100}%"
        ></div>
    </div>
</div>

<style lang="scss">
.countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    max-width: 400px;
    width: 100%;
    margin: 20px 0;

    &-timer {
        font-size: 2rem;
        font-weight: bold;
        letter-spacing: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    &-progression-bar {
        width: 100%;
        height: 10px;
        background-color: lightgray;
        border-radius: 5px;
        box-shadow: inset 0 1px 2px rgba(0,0,0,.075);
        margin-top: 10px;

        &-fill {
            height: 100%;
            background-color: var(--primary-color);
            border-radius: 5px;
        }
    }
}

.button {
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    flex-grow: 0;

    &:hover .icon {
        opacity: 0.7;
    }
}

.hidden {
    opacity: 0;
    pointer-events: none;
}

.icon {
    width: 35px;
    height: 35px;
    filter: brightness(0) saturate(100%) invert(47%) sepia(87%) saturate(6924%) hue-rotate(266deg) brightness(100%) contrast(102%);
    transition: opacity 0.2s;
}
</style>