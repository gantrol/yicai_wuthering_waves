<!-- src/lib/components/Grid.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let grid: number[][];
    export let colors: string[];
    export let rows: number;
    export let cols: number;

    const dispatch = createEventDispatcher();

    // Handle both mouse and touch events
    function handleStart(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault(); // Prevent scrolling on touch
        dispatch('mousedown', { row, col });
    }

    function handleMove(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault(); // Prevent scrolling on touch
        dispatch('mouseenter', { row, col });
    }

    // Calculate cell size based on screen width
    let containerWidth: number;
    $: cellSize = containerWidth ? Math.min(40, (containerWidth - 40) / cols) : 40; // 40px is the max size
</script>

<style>
    .grid-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }

    .grid-header {
        display: flex;
        margin-left: 30px;
    }

    .grid-row {
        display: flex;
        align-items: center;
    }

    .grid-header div, .row-label {
        text-align: center;
        font-weight: bold;
        font-size: 0.875rem; /* Smaller font on mobile */
    }

    .grid {
        display: flex;
        flex-direction: column;
        touch-action: none; /* Disable browser touch actions */
    }

    .cell {
        border: 1px solid #ccc;
        cursor: pointer;
        border-radius: 4px;
        position: relative;
        touch-action: none;
        transition: background-color 0.3s ease;
    }

    .cell-id {
        position: absolute;
        bottom: 2px;
        right: 2px;
        font-size: 10px; /* Smaller font on mobile */
        color: rgba(0, 0, 0, 0.7);
    }

    .row-label {
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 640px) {
        .grid-container {
            font-size: 0.875rem;
        }

        .cell-id {
            font-size: 8px;
        }
    }
</style>

<div
        class="grid-container"
        bind:clientWidth={containerWidth}
>
    <div class="grid-header">
        {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
            <div style="width: {cellSize}px; height: {cellSize}px; line-height: {cellSize}px;">
                {colLabel}
            </div>
        {/each}
    </div>
    <div class="grid">
        {#each grid as row, rowIndex}
            <div class="grid-row">
                <div
                        class="row-label"
                        style="height: {cellSize}px; line-height: {cellSize}px;"
                >
                    {rowIndex + 1}
                </div>
                {#each row as cell, colIndex}
                    <div
                            class="cell"
                            style="
                            width: {cellSize}px;
                            height: {cellSize}px;
                            background-color: {colors[cell]};
                        "
                            on:mousedown={(e) => handleStart(rowIndex, colIndex, e)}
                            on:touchstart={(e) => handleStart(rowIndex, colIndex, e)}
                            on:mousemove={(e) => handleMove(rowIndex, colIndex, e)}
                            on:touchmove={(e) => handleMove(rowIndex, colIndex, e)}
                    >
                        <span class="cell-id">{cell}</span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
