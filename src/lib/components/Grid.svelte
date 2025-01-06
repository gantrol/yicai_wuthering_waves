<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { cn } from '$lib/utils';

    export let grid: number[][];
    export let colors: string[];
    export let rows: number;
    export let cols: number;

    const dispatch = createEventDispatcher();

    function handleStart(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        dispatch('mousedown', { row, col });
    }

    function handleMove(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        dispatch('mouseenter', { row, col });
    }

    let containerWidth: number;
    $: cellSize = containerWidth ? Math.min(40, (containerWidth - 40) / cols) : 40;
</script>

<div bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div class="flex ml-[30px]">
        {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
            <div
                    class={cn(
                    "text-center font-semibold text-sm",
                    "dark:text-gray-300"
                )}
                    style="width: {cellSize}px; height: {cellSize}px; line-height: {cellSize}px;"
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
                        "w-[30px] flex items-center justify-center",
                        "font-semibold text-sm dark:text-gray-300"
                    )}
                        style="height: {cellSize}px; line-height: {cellSize}px;"
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
