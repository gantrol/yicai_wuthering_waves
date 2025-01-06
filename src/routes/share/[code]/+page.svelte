<script lang="ts">
    import SolverCore from "$lib/components/SolverCore.svelte";
    import { decodePuzzle } from "$lib/utils/shareUtils";

    let {data} = $props();
    let puzzleData = null;
    let errorMsg = "";

    // 解码
    try {
        const { targetColor, maxSteps, grid } = decodePuzzle(data.code);
        puzzleData = { targetColor, maxSteps, grid };
    } catch (error) {
        errorMsg = (error as Error).message;
    }
</script>

{#if errorMsg}
    <p class="text-red-500">{errorMsg}</p>
{:else if puzzleData}
    <SolverCore
            puzzleData={puzzleData}
            editMode={false}
    />
{/if}
