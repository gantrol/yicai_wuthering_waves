<!--/* File: src/lib/components/Grid.svelte */-->
<script lang="ts">
    import {cn} from '$lib/utils';
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import { t } from '$lib/translations';
    import { getColors, LOCKED_CELL_VALUE } from '$lib/utils/gridUtils';
    import LockIcon from '$lib/components/icons/LockIcon.svelte';

    let {
        grid,
        rows,
        cols,
        readonly = false,
        mousedown = () => {},
        mouseenter = () => {},
    } = $props();

    const displayColors = getColors();

    function isInteractive(): boolean {
        return !readonly;
    }

    const MAX_CELL_LENGTH = 64;
    const MIN_CELL_SIZE = 40;
    const GOLDEN_RATIO = 1.618;
    const MIN_LABEL_SIZE = 12;
    const MIN_NUMBER_SIZE = 8;

    let containerWidth = $state<number>();
    let cellSize = $derived(
        Math.max(
            Math.min(MAX_CELL_LENGTH, (containerWidth - MAX_CELL_LENGTH) / cols)
            , MIN_CELL_SIZE)
    );
    let labelFontSize = $derived(Math.max(MIN_LABEL_SIZE, cellSize * 0.25));
    let numberFontSize = $derived(Math.max(MIN_NUMBER_SIZE, cellSize * 0.2));
    let labelWidth = $derived(cellSize / GOLDEN_RATIO);

    function handleStart(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (isInteractive() && mousedown) {
            mousedown({row, col});
        }
    }

    function handleMove(row: number, col: number, event: MouseEvent | TouchEvent) {
        event.preventDefault();
        if (isInteractive() && mouseenter) {
            mouseenter({row, col});
        }
    }
</script>

{#if !grid || grid.length <= 1}
    <LoadingSpinner text={$t('common.loading')}/>
{:else }
    <div class="overflow-x-auto">
        <div
                class="min-w-fit"
                class:pointer-events-none={readonly}
                bind:clientWidth={containerWidth}
        >
            <div class="flex" style="margin-left: {labelWidth}px">
                {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
                    <div
                            class={cn("text-center font-semibold", "dark:text-gray-300")}
                            style="width: {cellSize}px; height: {labelWidth}px; line-height: {labelWidth}px; font-size: {labelFontSize}px;"
                    >
                        {colLabel}
                    </div>
                {/each}
            </div>

            <div class="flex flex-col touch-none">
                {#each grid as row, rowIndex}
                    <div class="flex items-center">
                        <div
                                class={cn("flex items-center justify-center font-semibold", "dark:text-gray-300")}
                                style="width: {labelWidth}px; height: {cellSize}px; line-height: {cellSize}px; font-size: {labelFontSize}px;"
                        >
                            {rowIndex + 1}
                        </div>

                        {#each row as cell, colIndex}
                            {@const interactive = isInteractive()}
                            {@const bgColor = cell === LOCKED_CELL_VALUE ? displayColors[5] : displayColors[cell]}
                            <div
                                    class={cn(
                                "relative border rounded",
                                "transition-colors duration-300 ease-in-out",
                                interactive && "cursor-pointer hover:opacity-90",
                                !interactive && "cursor-default",
                                "border-gray-200 dark:border-gray-700",
                                cell === LOCKED_CELL_VALUE && "flex items-center justify-center"
                            )}
                                    aria-label={`Grid cell: ${rowIndex}, ${colIndex}${cell === LOCKED_CELL_VALUE ? ' (Locked)' : ''}`}
                                    role={interactive ? "button" : "cell"}
                                    tabindex={interactive ? "0" : "-1"}
                                    style="width: {cellSize}px; height: {cellSize}px; background-color: {bgColor};"
                                    onmousedown={interactive ? (e) => handleStart(rowIndex, colIndex, e) : undefined}
                                    ontouchstart={interactive ? (e) => handleStart(rowIndex, colIndex, e) : undefined}
                                    onmousemove={interactive ? (e) => handleMove(rowIndex, colIndex, e) : undefined}
                                    ontouchmove={interactive ? (e) => handleMove(rowIndex, colIndex, e) : undefined}
                            >
                                {#if cell === LOCKED_CELL_VALUE}
                                    <LockIcon size="60%" color="#CCCCCC"/>
                                {:else}
                                <span
                                        class={cn(
                                    "absolute bottom-0.5 right-0.5",
                                    "text-gray-700 dark:text-gray-300"
                                )}
                                        style={`font-size: ${numberFontSize}px;`}
                                >
                                    {cell}
                                </span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>

            <div class="flex" style="margin-left: {labelWidth}px">
                {#each Array(cols).fill(0).map((_, i) => i + 1) as colLabel}
                    <div
                            class={cn("text-center font-semibold", "dark:text-gray-300")}
                            style="width: {cellSize}px; height: {labelWidth}px; line-height: {labelWidth}px; font-size: {labelFontSize}px;"
                    >
                        {colLabel}
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
