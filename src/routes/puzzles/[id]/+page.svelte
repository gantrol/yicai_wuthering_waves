<!-- /src/routes/solver/+page.svelte -->
<script>
    import PlayCore from "$lib/components/game/PlayCore.svelte";

    let {data} = $props();
</script>

<svelte:head>
    <title>溢彩画{data.puzzleId}</title>
</svelte:head>

<PlayCore
    puzzleData={data.puzzleData}
></PlayCore>
