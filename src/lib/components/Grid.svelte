<script lang="ts">
    import {cn} from '$lib/utils';

    export let grid: number[][];
    export let colors: string[];
    export let rows: number;
    export let cols: number;
    export let readonly = false; // 新增: 只读模式
    export let gridWidth: number;

    const MAX_CELL_LENGTH = 64;
    const MIN_CELL_SIZE = 40;
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
    let cellSize: number;
    let labelWidth: number;
    $: if (containerWidth) {
        cellSize = Math.min(MAX_CELL_LENGTH, (containerWidth - MAX_CELL_LENGTH) / cols);
        cellSize = Math.max(cellSize, MIN_CELL_SIZE)
        labelWidth = cellSize / GOLDEN_RATIO;
        gridWidth = labelWidth + 10 * cellSize;
    }
</script>

<div class="overflow-x-auto">
    <div class="min-w-fit"
         class:pointer-events-none={readonly}
         bind:clientWidth={containerWidth}>
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
                                    "relative border rounded",
                                    "transition-colors duration-300 ease-in-out",
                                    !readonly && "cursor-pointer hover:opacity-90",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                                aria-label="Grid cell: {rowIndex}, {colIndex}"
                                role={readonly ? "cell" : "button"}
                                tabindex={readonly ? "-1" : "0"}
                                style="
                                    width: {cellSize}px;
                                    height: {cellSize}px;
                                    background-color: {colors[cell]};
                                "
                                on:mousedown={(e) => !readonly && handleStart(rowIndex, colIndex, e)}
                                on:touchstart={(e) => !readonly && handleStart(rowIndex, colIndex, e)}
                                on:mousemove={(e) => !readonly && handleMove(rowIndex, colIndex, e)}
                                on:touchmove={(e) => !readonly && handleMove(rowIndex, colIndex, e)}
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
    </div>
</div>
