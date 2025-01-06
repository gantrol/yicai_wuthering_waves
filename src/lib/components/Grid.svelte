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

    // 添加常量定义
    const MIN_LABEL_SIZE = 12; // 标签文字最小尺寸(px)
    const MIN_NUMBER_SIZE = 8; // 右下角数字最小尺寸(px)

    // 计算动态尺寸
    $: labelFontSize = Math.max(MIN_LABEL_SIZE, cellSize * 0.25); // 标签文字大小为cell尺寸的1/4，但不小于最小值
    $: numberFontSize = Math.max(MIN_NUMBER_SIZE, cellSize * 0.2); // 右下角数字为cell尺寸的1/5，但不小于最小值

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
                    "text-center font-semibold",
                    "dark:text-gray-300"
                )}
                    style="
                    width: {cellSize}px;
                    height: {labelWidth}px;
                    line-height: {labelWidth}px;
                    font-size: {labelFontSize}px;
                "
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
                        "flex items-center justify-center font-semibold",
                        "dark:text-gray-300"
                    )}
                        style="
                        width: {labelWidth}px;
                        height: {cellSize}px;
                        line-height: {cellSize}px;
                        font-size: {labelFontSize}px;
                    "
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
                                "absolute bottom-0.5 right-0.5",
                                "text-gray-700 dark:text-gray-300"
                            )}
                                style="font-size: {numberFontSize}px;"
                        >
                            {cell}
                        </span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
