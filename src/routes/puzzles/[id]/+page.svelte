<!-- /src/routes/solver/+page.svelte -->
<script>
    import Solver from '$lib/components/Solver.svelte';
    let {data} = $props();
</script>

<svelte:head>
    <title>溢彩画{data.puzzleId}</title>
</svelte:head>

<Solver
        puzzleId={data.puzzleId}
        editMode={false}
/>
