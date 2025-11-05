<script lang="ts">
    let { text = $bindable(), timeTotal = $bindable(), optionsMode = $bindable() } = $props();

    let texts = [
        'Die Hauskatze stammt von der Afrikanischen Wildkatze ab, auch Falbkatze genannt. Aus ihr entwickelten sich mehr als vierzig Katzenrassen. In Deutschland ist die Katze das häufigste Haustier.',
        'Svelte ist ein modernes Frontend-Framework, das sich durch seine Einfachheit und Effizienz auszeichnet. Es ermöglicht Entwicklern, reaktive Benutzeroberflächen mit minimalem Aufwand zu erstellen.',
        'TypeScript ist eine von Microsoft entwickelte Programmiersprache, die auf JavaScript basiert und statische Typisierung sowie moderne Sprachfeatures bietet. Sie verbessert die Codequalität und Wartbarkeit in großen Projekten.',
        'In der bezaubernden Welt von Animal Crossing kannst du alles in deinem eigenen, entspannten Tempo angehen: freunde dich mit deinen liebenswerten tierischen Nachbarn an, gehe auf große oder kleine Entdeckungsreisen und erschaffe deine eigenen einzigartigen Erlebnisse.',
        'Lass den Gerichtssaal hinter dir und sieh dich mit Edgeworth direkt am Tatort um, sammle Beweise und Hinweise und sprich mit Verdächtigen und Zeugen. Nutze deinen Verstand und deine Erkenntnisse, um faszinierend schwierige Fälle durch Logik und Schlussfolgerungen zu lösen.',
        'Im ersten Teil schlüpft der Spieler in die Rolle des jungen Strafverteidigers Phoenix Wright, der sich in seiner ersten Gerichtsverhandlung direkt mit einem Mord beschäftigen muss. Das Spiel enthält fünf spielbare Fälle, von dem der fünfte nur in jeder Version ab dem Nintendo DS, also auch in der Phoenix Wright: Ace Attorney Trilogy spielbar ist und extra für diese programmiert wurde.'
    ];
</script>

<h1> Choose Options: </h1>
<select bind:value={text} placeholder="Select Text">
    {#each texts as option}
        <option value="{option}">{option.slice(0, 50)}...</option>
    {/each}
</select>

{text}

<p> Set Time Limit (in seconds): </p>
<input type="number" bind:value={timeTotal} min="60" max="600">

<div class="error-text error-text{((timeTotal < 60 || timeTotal > 600) || text === '') ? '--visible' : ''}"> Please set a time limit between 60 and 600 seconds. </div>

<button
    class="primary-button"
    disabled={text === '' || (timeTotal < 60 || timeTotal > 600)}
    onclick="{() => optionsMode = false}"
>
    Play with these options
</button>
