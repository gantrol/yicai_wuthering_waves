<!-- /src/routes/solver/+page.svelte -->
<script lang="ts">
    import Game from "$lib/components/game/Game.svelte";
    import {GameMode} from "$lib/types";

    let {data} = $props();

    let puzzleData = $derived(data.puzzleData);
    let id = $derived(data.puzzleId);

</script>

<svelte:head>
    <title>溢彩画{id}</title>
</svelte:head>

<Game
        data={puzzleData}
        mode={GameMode.PLAY_TRAVERSE}
></Game>
