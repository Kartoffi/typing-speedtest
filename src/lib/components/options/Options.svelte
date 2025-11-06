<script lang="ts">

    let { text = $bindable(), minutes = $bindable(), seconds = $bindable(), optionsMode = $bindable() } = $props();

    let selectedOwnText = $state(false);

    let ownText = $state('');
    let selectedText = $state('');

    let timeTotal: number = $derived(parseInt(minutes) * 60 + parseInt(seconds));

    $effect(() => {
        if (selectedOwnText && ownText.trim() !== '') {
            text = ownText;
            return;
        }
        
        if (!selectedOwnText && selectedText !== '') {
            text = selectedText;
        }
    });

    let texts = [
        'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.',
        'Svelte ist ein modernes Frontend-Framework, das sich durch seine Einfachheit und Effizienz auszeichnet. Es ermöglicht Entwicklern, reaktive Benutzeroberflächen mit minimalem Aufwand zu erstellen.',
        'TypeScript ist eine von Microsoft entwickelte Programmiersprache, die auf JavaScript basiert und statische Typisierung sowie moderne Sprachfeatures bietet. Sie verbessert die Codequalität und Wartbarkeit in großen Projekten.',
        'In der bezaubernden Welt von Animal Crossing kannst du alles in deinem eigenen, entspannten Tempo angehen: freunde dich mit deinen liebenswerten tierischen Nachbarn an, gehe auf große oder kleine Entdeckungsreisen und erschaffe deine eigenen einzigartigen Erlebnisse.',
        'Lass den Gerichtssaal hinter dir und sieh dich mit Edgeworth direkt am Tatort um, sammle Beweise und Hinweise und sprich mit Verdächtigen und Zeugen. Nutze deinen Verstand und deine Erkenntnisse, um faszinierend schwierige Fälle durch Logik und Schlussfolgerungen zu lösen.',
        'Im ersten Teil schlüpft der Spieler in die Rolle des jungen Strafverteidigers Phoenix Wright, der sich in seiner ersten Gerichtsverhandlung direkt mit einem Mord beschäftigen muss. Das Spiel enthält fünf spielbare Fälle, von dem der fünfte nur in jeder Version ab dem Nintendo DS, also auch in der Phoenix Wright: Ace Attorney Trilogy spielbar ist und extra für diese programmiert wurde.'
    ];

    function changeSeconds(action: 'add' | 'subtract') {
    let secs = parseInt(seconds) || 0;
        if (action === 'add') {

            if (parseInt(minutes) === 10) {
                return;
            }

            secs += 10;
        }
        
        if (action === 'subtract') {

            if (secs === 0 && parseInt(minutes) === 1) {
                return;
            }
            secs -= 10;
        }

        if (secs < 0) {
            secs = 50;

            if (parseInt(minutes) > 1) {
                minutes = (parseInt(minutes) - 1).toString().padStart(2, '0');
            }
        } else if (secs > 50) {
            secs = 0;

            if (parseInt(minutes) < 10) {
                minutes = (parseInt(minutes) + 1).toString().padStart(2, '0');
            }
        }

        seconds = secs.toString().padStart(2, '0');
    }

    function changeMinutes(action: 'add' | 'subtract') {
    let mins = parseInt(minutes) || 0;
        if (action === 'add') {

            if (mins === 9 && parseInt(seconds) !== 0) {
                return;
            }
            mins += 1;
        }

        if (action === 'subtract') {
            mins -= 1;
        }

        if (mins < 1) {
            mins = 1;
        } else if (mins > 10) {
            mins = 10;
        }

        minutes = mins.toString().padStart(2, '0');
    }
</script>

<h1>Typing Speed-Test</h1>
<h3> Set time limit: </h3>
<div class="input-timer">
    <div class="input-container"> 
        <div class="input-time input-seconds">
            {minutes}
        </div> 
        <div class="input-arrows">
            <button class="input-arrow" onclick={() => changeMinutes('add')}>
                <img class="icon" src="/src/lib/assets/icons/up.svg" alt=""/>
            </button>
            <button class="input-arrow" onclick={() => changeMinutes('subtract')}>
                <img class="icon" src="/src/lib/assets/icons/down.svg" alt=""/>
            </button>
        </div>
    </div>
    <div class="separator">
        :
    </div>
    <div class="input-container"> 
        <div class="input-time input-seconds">
            {seconds}
        </div> 
        <div class="input-arrows">
            <button class="input-arrow" onclick={() => changeSeconds('add')}>
                <img class="icon" src="/src/lib/assets/icons/up.svg" alt=""/>
            </button>
            <button class="input-arrow" onclick={() => changeSeconds('subtract')}>
                <img class="icon" src="/src/lib/assets/icons/down.svg" alt=""/>
            </button>
        </div>
    </div>
</div>
<div class="text-selection-container">
    <h3>
        <input type="radio" checked={!selectedOwnText} onchange={() => selectedOwnText = false}>
        Choose a text:
    </h3>
    {#each texts as option}
        <button class="text-selection {(option === selectedText) && 'checked'}" onclick={() => selectedText = option} disabled={selectedOwnText}>
            {option}
        </button>
    {/each}
    <h3>
        <input type="radio" checked={selectedOwnText} onchange={() => selectedOwnText = true}>
        Or your own text:
    </h3>
    <div>
        <textarea rows="4" cols="50" bind:value={ownText} placeholder="Enter your custom text here..." disabled={!selectedOwnText}></textarea>
    </div>
</div>

<button
    class="primary-button"
    disabled={text === '' || (timeTotal < 60 || timeTotal > 600)}
    onclick="{() => optionsMode = false}"
>
    Play with these options
</button>

<style lang="scss">
.input-timer {
    background-color: #eee8ed;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    input {
        text-align: center;
        font-size: 2rem;
        width: 60px;
    }
}

.separator {
    font-size: 2rem;
}

.input-time {
    width: 40px;
    text-align: right;
}

.input-arrows {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-left: 5px;
    margin-right: 5px;

    & img {
        width: 16px;
        height: 16px;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
    }
}

.input-seconds {
    margin-left: 10px;
}

.input-arrow {
    position: relative;
    cursor: pointer;
    width: 16px;
    height: 16px;
    background: none;
    border: none;
}

.input-container {
    height: 60px;
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover .input-arrows img {
        opacity: 1;
    }
}

.text-selection-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 300px;
    margin: 40px 0;
}

.text-selection {
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    border: none;
    padding: 10px;
    background-color: white;
    border-left: 2px solid transparent;

    &:nth-of-type(odd) {
        background-color: #eee8ed;
    }

    &.checked {
        border-left: 2px solid var(--primary-color);
        font-weight: bold;
    }
}
</style>