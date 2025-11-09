<script lang="ts">
    import Game from '$lib/components/game/Game.svelte';
    import Options from '$lib/components/options/Options.svelte';

    let optionsMode: boolean = $state(true);
    let text: string = $state('');
    let gameMode: 'time' | 'tilTextFinished' = 'time';
    let minutes: string = $state('01');
    let seconds: string = $state('00');

    let timeTotal: number = $derived(parseInt(minutes) * 60 + parseInt(seconds));
</script>

{#if optionsMode}
    <Options bind:text bind:minutes bind:seconds bind:optionsMode />
{:else}
    <Game bind:text bind:timeTotal bind:optionsMode {minutes} {seconds}/>
{/if}