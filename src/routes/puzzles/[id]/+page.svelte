<!-- /src/routes/solver/+page.svelte -->
<script>
    import Solver from '$lib/components/Solver.svelte';
    let {data} = $props();
    // console.log(data)
</script>

<Solver
        puzzleId={data.puzzleId}
/>

