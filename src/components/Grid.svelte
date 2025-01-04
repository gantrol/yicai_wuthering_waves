<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let grid: number[][];
    export let colors: string[];
    export let rows: number;
    export let cols: number;

    const dispatch = createEventDispatcher();

    function handleMouseDown(row: number, col: number) {
        dispatch('mousedown', { row, col });
    }

    function handleMouseEnter(row: number, col: number) {
        dispatch('mouseenter', { row, col });
    }
</script>

<style>
    .grid-container {
        display: flex;
        flex-direction: column;
    }

    .grid-header, .grid-row {
        display: flex;
    }

    .grid-header {
        margin-left: 30px;
    }

    .grid-header div, .row-label {
        width: 40px;
        height: 40px;
        line-height: 40px;
        border: 1px solid rgba(204, 204, 204, 0);
        text-align: center;
        font-weight: bold;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(var(--cols), 40px);
        grid-gap: 2px;
        user-select: none;
    }

    .cell {
        width: 40px;
        height: 40px;
        border: 1px solid #ccc;
        cursor: pointer;
        border-radius: 4px;
        position: relative;
    }

    .cell-id {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.7);
    }

    .row-label {
        width: 30px;
        height: 40px;
        border: 1px solid rgba(204, 204, 204, 0);
        line-height: 40px;
        text-align: center;
        font-weight: bold;
    }
</style>

<div class="grid-container">
    <div class="grid-header">
        {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
            <div>{colLabel}</div>
        {/each}
    </div>
    <div class="grid">
        {#each grid as row, rowIndex}
            <div class="grid-row" style="display: flex;">
                <div class="row-label">{rowIndex + 1}</div>
                {#each row as cell, colIndex}
                    <div
                            class="cell"
                            style="background-color: {colors[cell]};"
                            on:mousedown={() => handleMouseDown(rowIndex, colIndex)}
                            on:mouseenter={() => handleMouseEnter(rowIndex, colIndex)}
                    >
                        <span class="cell-id">{cell}</span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
