<!-- /src/lib/components/Controls.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";

    let { clearGrid, fillEmpty, exportPuzzle, importPuzzle } = $props();
</script>

<style>
    .Button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
    }
</style>


<div class="Button-group">
    <Button variant="outline" onclick={() => clearGrid()}>清空画板</Button>
<!--    <Button variant="secondary" onclick={() => handleClick('generatePuzzle')}>新建题目</Button>-->
    <Button variant="outline" onclick={() => fillEmpty()}>填充空白</Button>
    <Button variant="secondary" onclick={() => exportPuzzle()}>导出题目</Button>
    <Button variant="secondary" onclick={() => importPuzzle()}>导入题目</Button>
</div>
