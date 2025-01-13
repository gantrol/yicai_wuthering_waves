<!-- /src/routes/solver/+page.svelte -->
<script lang="ts">
    import Game from "$lib/components/game/Game.svelte";
    import {GameMode} from "$lib/types";
    let {data} = $props();
</script>

<svelte:head>
    <title>溢彩画{data.puzzleId}</title>
</svelte:head>

<Game
    data={data.puzzleData}
    mode={GameMode.PLAY_TRAVERSE}
></Game>
