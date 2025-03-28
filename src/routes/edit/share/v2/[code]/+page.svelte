<script lang="ts">
    import { decodePuzzleV2 } from "$lib/utils/shareUtilsV2"; // Use V2 decoder
    import { GameMode } from "$lib/types";
    import Game from "$lib/components/game/Game.svelte";
    import { t } from '$lib/translations';

    let { data } = $props();
    let puzzleData = null;
    let errorMsg = "";

    try {
        const { targetColor, maxSteps, grid } = decodePuzzleV2(data.code);
        puzzleData = { targetColor, maxSteps, grid };
    } catch (error) {
        errorMsg = `${$t('common.decode_error')}: ${(error as Error).message}`;
        console.error("Decode V2 Error for Edit:", error);
    }
</script>

{#if errorMsg}
    <div class="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        {errorMsg}
    </div>
{:else if puzzleData}
    <Game
            data={puzzleData}
            mode={GameMode.EDIT}
            puzzleId={`edit-shared-v2-${data.code.substring(0, 6)}`} // Optional: Create a temporary ID
    ></Game>
{:else}
    <div class="p-4 my-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800" role="alert">
        {$t('common.loading')}
    </div>
{/if}
