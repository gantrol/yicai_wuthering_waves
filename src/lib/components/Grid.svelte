<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { cn } from '$lib/utils';

    export let grid: number[][];
    export let colors: string[];
    export let rows: number;
    export let cols: number;
    export let MAX_CELL_LENGTH: number = 64;
    const dispatch = createEventDispatcher();
    const GOLDEN_RATIO = 1.618;

    function handleStart(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        dispatch('mousedown', { row, col });
    }

    function handleMove(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        dispatch('mouseenter', { row, col });
    }

    let containerWidth: number;
    $: cellSize = containerWidth ? Math.min(MAX_CELL_LENGTH, (containerWidth - MAX_CELL_LENGTH) / cols) : MAX_CELL_LENGTH;
    $: labelWidth = cellSize / GOLDEN_RATIO; // 使用黄金比例计算标签宽度
    $: if (containerWidth) {
        const actualSize = labelWidth + 10 * cellSize;
        dispatch('widthChange', actualSize);
    }
</script>

<div bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div class="flex" style="margin-left: {labelWidth}px">
        {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
            <div
                    class={cn(
                    "text-center font-semibold text-sm",
                    "dark:text-gray-300"
                )}
                    style="width: {cellSize}px; height: {labelWidth}px; line-height: {labelWidth}px;"
            >
                {colLabel}
            </div>
        {/each}
    </div>

    <!-- Grid -->
    <div class="flex flex-col touch-none">
        {#each grid as row, rowIndex}
            <div class="flex items-center">
                <!-- Row Label -->
                <div
                        class={cn(
                        "flex items-center justify-center",
                        "font-semibold text-sm dark:text-gray-300"
                    )}
                        style="width: {labelWidth}px; height: {cellSize}px; line-height: {cellSize}px;"
                >
                    {rowIndex + 1}
                </div>

                <!-- Cells -->
                {#each row as cell, colIndex}
                    <div
                            class={cn(
                            "relative cursor-pointer border rounded",
                            "transition-colors duration-300 ease-in-out",
                            "hover:opacity-90 touch-none",
                            "border-gray-200 dark:border-gray-700"
                        )}
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
                        <span
                                class={cn(
                                "absolute bottom-0.5 right-0.5 text-[10px]",
                                "text-gray-700 dark:text-gray-300",
                                "sm:text-[8px]"
                            )}
                        >
                            {cell}
                        </span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
