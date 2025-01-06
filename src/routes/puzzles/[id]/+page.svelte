<!-- /src/routes/solver/+page.svelte -->
<script>
    import Solver from '$lib/components/Solver.svelte';
    let {data} = $props();
</script>

<Solver
        puzzleId={data.puzzleId}
        editMode={false}
/>

