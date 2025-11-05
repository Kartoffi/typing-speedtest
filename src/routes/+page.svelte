<script lang="ts">
    import Game from '$lib/components/game/Game.svelte';
    import Options from '$lib/components/options/Options.svelte';

    let optionsMode: boolean = true;
    let text: string = '';
    let gameMode: 'time' | 'tilTextFinished' = 'time';
    let timeTotal: number = 60;
</script>

{#if optionsMode}
    <Options bind:text bind:timeTotal bind:optionsMode />
{:else}
    <Game {text} {timeTotal}/>
{/if}