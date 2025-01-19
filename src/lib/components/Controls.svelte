<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { t } from '$lib/translations';

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
    <Button variant="outline" onclick={() => clearGrid()}>{$t('common.clear_board')}</Button>
    <Button variant="outline" onclick={() => fillEmpty()}>{$t('common.fill_empty')}</Button>
    <Button variant="secondary" onclick={() => exportPuzzle()}>{$t('common.export_puzzle')}</Button>
    <Button variant="secondary" onclick={() => importPuzzle()}>{$t('common.import_puzzle')}</Button>
</div>
