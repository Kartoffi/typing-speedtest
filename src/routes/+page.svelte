<script lang="ts">
    import Game from '$lib/components/game/Game.svelte';
    import Options from '$lib/components/options/Options.svelte';
    import type { PageData } from './$types';

    const { data } = $props<{ data: PageData }>();

    let optionsMode: boolean = $state(true);
    let text: string = $state('');
    let gameMode: 'time' | 'tilTextFinished' = 'time';
    let minutes: string = $state('01');
    let seconds: string = $state('00');

    let timeTotal: number = $derived(parseInt(minutes) * 60 + parseInt(seconds));
</script>

{#if data.session}
    {#if data.session.user.user_metadata.avatar_url}
        <div class="user-profile-pic-container">
            <img class="user-profile-pic" src="{data.session.user.user_metadata.avatar_url}" alt="Profile picture" />
            <div class="user-profile-name">
                {data.session.user.user_metadata.full_name}
            </div>
        </div>
    {/if}

    {#if optionsMode}
        <Options bind:text bind:minutes bind:seconds bind:optionsMode />
    {:else}
        <Game bind:text bind:timeTotal bind:optionsMode {minutes} {seconds}/>
    {/if}
{:else}
    <p>Please <a href="/login">log in</a> to access the game.</p>
{/if}

<style lang="scss">
    .user-profile-pic {
        width: 60px;
        height: 60px;
        border-radius: 50%;

        &-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            font-weight: bold;
            position: absolute;
            top: 15px;
            left: 15px;
        }
    }
</style>