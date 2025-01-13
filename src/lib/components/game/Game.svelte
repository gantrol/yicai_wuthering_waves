<script lang="ts">
    import {GameMode, } from "$lib/types";
    import type {PuzzleDataType, } from "$lib/types";
    import PlayCore from "$lib/components/game/PlayCore.svelte";
    import DemoCore from "$lib/components/game/DemoCore.svelte";
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";

    type Props = {
        data: PuzzleDataType;
        mode: GameMode;
    }
    let props: Props = $props();

    let data = $derived(props.data);
    let mode = $derived(props.mode);

</script>

{#if mode === GameMode.PLAY_TRAVERSE}
    <PlayCore
            data={data}
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
    <SolutionCore
            data={data}
    ></SolutionCore>
{:else}
<!--    TODO: 404?-->
{/if}
