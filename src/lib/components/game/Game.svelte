<script lang="ts">
    import {GameMode, } from "$lib/types";
    import type {PuzzleDataType, } from "$lib/types";
    import PlayCore from "$lib/components/game/PlayCore.svelte";
    import DemoCore from "$lib/components/game/DemoCore.svelte";

    type Props = {
        data: PuzzleDataType;
        mode: GameMode;
    }
    let {data, mode}: Props = $props();
</script>

{#if mode === GameMode.PLAY_TRAVERSE}
    <PlayCore
            data={data}
            bind:mode={mode}
    ></PlayCore>
<!--{:else if mode === GameMode.DEMO}-->
<!--    <DemoCore-->
<!--            bind:this={solverRef}-->
<!--            puzzleData={demoData}-->
<!--            isAutoPlay={true}-->
<!--            currentStep={currentStep}-->
<!--    />-->
{:else if mode === GameMode.PLAY_RANDOM}

{:else if mode === GameMode.EDIT}
{:else if mode === GameMode.CREATE}

{:else if mode === GameMode.SOLUTION}

{:else}
<!--    TODO: 404?-->
{/if}
