<script lang="ts">
    let { timeRemaining = $bindable(), timeTotal, testIsOver = $bindable(), recalcSpeed } = $props();

    const convertSecondsInMinutes = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    const countdown = () => {
        if (testIsOver) return;
        if (timeRemaining > 0) {
            setTimeout(() => {
                if (testIsOver) return;
                timeRemaining -= 1;
                recalcSpeed();
                countdown();
            }, 1000);
        }

        if (timeRemaining === 0) {
            testIsOver = true;
        }
    };

    countdown();
</script>

<div class="countdown">
    <div class="countdown-timer">
        {convertSecondsInMinutes(timeRemaining)}
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
        width: 100%;
        margin: 20px 0;

        &-timer {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 6px;
        }

        &-progression-bar {
            width: 80%;
            height: 10px;
            background-color: lightgray;
            border-radius: 5px;
            box-shadow: inset 0 1px 2px rgba(0,0,0,.075);

            &-fill {
                height: 100%;
                background-color: rgb(172, 49, 255);
                border-radius: 5px;
                transition: width 1s linear;
            }
        }
    }
</style>