<script lang="ts">
    import {decodePuzzle} from "$lib/utils/shareUtils";
    import {GameMode} from "$lib/types";
    import Game from "$lib/components/game/Game.svelte";

    let {data} = $props();
    let puzzleData = null;
    let errorMsg = "";

    // 解码
    try {
        const {targetColor, maxSteps, grid} = decodePuzzle(data.code);
        puzzleData = {targetColor, maxSteps, grid};
    } catch (error) {
        errorMsg = (error as Error).message;
    }
</script>

{#if errorMsg}
    <p class="text-red-500">{errorMsg}</p>
{:else if puzzleData}
    <Game
            data={puzzleData}
            mode={GameMode.PLAY_SIMPLE}
    ></Game>
{/if}
