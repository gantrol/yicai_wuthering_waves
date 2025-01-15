<script lang="ts">
    import { cn } from '$lib/utils';

    let {
        grid,
        colors,
        rows,
        cols,
        readonly = false,
        mousedown,
        mouseenter,
    } = $props();

    // Constants
    const MAX_CELL_LENGTH = 64;
    const MIN_CELL_SIZE = 40;
    const GOLDEN_RATIO = 1.618;
    const MIN_LABEL_SIZE = 12;
    const MIN_NUMBER_SIZE = 8;

    // Reactive state variables using the $state rune
    let containerWidth = $state<number>();
    let cellSize = $derived(
        Math.max(
            Math.min(MAX_CELL_LENGTH, (containerWidth - MAX_CELL_LENGTH) / cols)
            , MIN_CELL_SIZE)
    );
    // Derived reactive variables using the $derived rune
    let labelFontSize = $derived(Math.max(MIN_LABEL_SIZE, cellSize * 0.25));
    let numberFontSize = $derived(Math.max(MIN_NUMBER_SIZE, cellSize * 0.2));

    let labelWidth = $derived(cellSize / GOLDEN_RATIO);

    // Event handler functions that invoke callback props
    function handleStart(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (!readonly && mousedown) {
            mousedown({ row, col });
        }
    }

    function handleMove(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (!readonly && mouseenter) {
            mouseenter({ row, col });
        }
    }
</script>

<div class="overflow-x-auto">
    <div
            class="min-w-fit"
            class:pointer-events-none={readonly}
            bind:clientWidth={containerWidth}
    >
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
                            aria-label={`Grid cell: ${rowIndex}, ${colIndex}`}
                            role={readonly ? "cell" : "button"}
                            tabindex={readonly ? "-1" : "0"}
                            style="
                                width: {cellSize}px;
                                height: {cellSize}px;
                                background-color: {colors[cell]};
                            "
                            onmousedown={!readonly ? (e) => handleStart(rowIndex, colIndex, e) : undefined}
                            ontouchstart={!readonly ? (e) => handleStart(rowIndex, colIndex, e) : undefined}
                            onmousemove={!readonly ? (e) => handleMove(rowIndex, colIndex, e) : undefined}
                            ontouchmove={!readonly ? (e) => handleMove(rowIndex, colIndex, e) : undefined}
                    >
                            <span
                                    class={cn(
                                    "absolute bottom-0.5 right-0.5",
                                    "text-gray-700 dark:text-gray-300"
                                )}
                                    style={`font-size: ${numberFontSize}px;`}
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
