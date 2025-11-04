<script lang="ts">
    let wpm = $state(0);
    let cpm = $state(0);
    let time = $state(60);
    let tippedChars = $state(0);
    let testOver = $state(false);
    let text = 'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.';
    let tippedText = $state('');


    const recalcSpeed = () => {
        let elapsedTime = 60 - time;
        if (elapsedTime > 0) {
            cpm = tippedChars / (elapsedTime / 60);
            wpm = Math.floor(cpm / 5);
        } else {
            cpm = 0;
            wpm = 0;
        }
    };

    const countdown = () => {
        if (time > 0) {
            setTimeout(() => {
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

    const calculate = () => {
        tippedChars += 1;
        recalcSpeed();
    };

    const secondsInMinutes = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
</script>

<h1> Typing Speed-Test </h1>
<p>{text}</p>
<div> {secondsInMinutes(time)} seconds left</div>
<input type="text" onkeydown="{calculate}" disabled="{testOver}" />
{#if testOver}
    <h2> Test Over! </h2>
{/if}
<div> {wpm} WPM </div>
<div> {cpm} CPM </div>

<style>
    * {
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
    }
</style>