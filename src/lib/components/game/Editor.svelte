<!--/* File: src/lib/components/game/Editor.svelte */-->
<script lang="ts">
    import {cloneMatrix, floodFill, getColors, getColorsForPicker, LOCKED_CELL_VALUE} from "$lib/utils/gridUtils.js";
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import {Input} from "$lib/components/ui/input";
    import Grid from "$lib/components/Grid.svelte";
    import type {PuzzleDataType} from "$lib/types";
    import PlayCore from "$lib/components/game/PlayCore.svelte";
    import {Label} from "$lib/components/ui/label";
    import {Card, CardContent} from "$lib/components/ui/card";
    import Controls from "$lib/components/Controls.svelte";
    import {toast} from "$lib/stores/toast";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import * as Collapsible from '$lib/components/ui/collapsible/index.js';
    import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
    import {RedoIcon, UndoIcon} from "lucide-svelte";
    import {t} from "$lib/translations";

    type Props = {
        data: PuzzleDataType;
    }

    let props: Props = $props();

    let data = $derived(props.data);
    let selectedColor = $state(1);

    let grid: number[][] = $state(data.grid);
    let targetColor = $state(data.targetColor);
    let maxSteps = $state(data.maxSteps);
    let rows = $state(grid.length);
    let cols = $state(grid[0].length);

    let editedData = $derived({
        grid:cloneMatrix(grid),
        targetColor,
        maxSteps
    });
    let undoStack = $state<number[][][]>([]);
    let redoStack = $state<number[][][]>([]);

    let isDragging = $state(false);
    function updateGrid(newGrid: number[][]) {
        if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
            undoStack = [...undoStack, cloneMatrix(grid)];
            redoStack = [];
            grid = newGrid;
        }
    }

    function handleCellInteraction({ row, col }) {
        const oldGrid = cloneMatrix(grid);
        oldGrid[row][col] = selectedColor;
        updateGrid(oldGrid);
    }

    function clearGrid() {
        const emptyGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));
        updateGrid(emptyGrid);
        toast($t('common.clear_board') + ' ' + $t('common.success'), 'success');
    }

    function fillEmpty() {
        const filledGrid = grid.map(row =>
            row.map(cell => cell === 0 ? selectedColor : cell)
        );
        updateGrid(filledGrid);
        toast($t('common.fill_empty') + ' ' + $t('common.success'), 'success');
    }

    function exportPuzzle() {
        handleExportPuzzle();
    }

    function importPuzzle() {
        handleImportPuzzle();
    }

    function undo() {
        if (undoStack.length > 0) {
            redoStack = [...redoStack, cloneMatrix(grid)];
            grid = undoStack.pop()!;
            undoStack = undoStack;
            redoStack = redoStack;
        } else {
            toast('没有可以撤销的操作', 'info');
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack = [...undoStack, cloneMatrix(grid)];
            grid = redoStack.pop()!;
            undoStack = undoStack;
            redoStack = redoStack;
        } else {
            toast('没有可以重做的操作', 'info');
        }
    }

    function selectColor(colorIndex: number) {
        selectedColor = colorIndex;
    }


    function handleMouseDown(row: number, col: number) {
        isDragging = true;
        handleCellInteraction({ row, col });
    }

    function handleMouseEnter(row: number, col: number) {
        if (isDragging) {
            handleCellInteraction({ row, col });
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    let fileInput: HTMLInputElement;

    function handleImportPuzzle() {
        fileInput.click();
    }

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = (ev.target as FileReader).result as string;
                const puzzle = JSON.parse(content);
                if (puzzle.grid) {
                    grid = puzzle.grid;
                }
                if (puzzle.targetColor) targetColor = puzzle.targetColor;
                if (puzzle.maxSteps) maxSteps = puzzle.maxSteps;
                toast('题目已成功导入！', "success");
            } catch (error) {
                console.error('导入的 JSON 文件格式不正确:', error);
                toast('导入失败，文件格式不正确！', "error");
            }
        };
        reader.readAsText(file);
        (e.target as HTMLInputElement).value = '';
    }

    function handleExportPuzzle() {
        const puzzleData = {
            grid,
            targetColor,
            maxSteps,
        };
        const jsonStr = JSON.stringify(puzzleData, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "溢彩画示例.json");
        dlAnchorElem.click();
        dlAnchorElem.remove();
    }

    let editorIsOpen = $state(true);
</script>
<input
        accept="application/json"
        bind:this={fileInput}
        onchange={handleFileChange}
        style="display: none;"
        type="file"
/>

<div
        class="flex flex-col md:flex-row gap-4"
        onmouseleave={handleMouseUp}
        onmouseup={handleMouseUp}
        role="none"
>
    <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full mt-5">
        <Card>
            <CardContent class="space-y-4 p-6">
                <Collapsible.Root class="space-y-4" bind:open={editorIsOpen}>
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold tracking-tight">{$t('common.edit_puzzle')}</h2>
                        <Collapsible.Trigger
                                class={buttonVariants({ variant: "outline", size: "sm", class: "w-9 p-0" })}
                        >
                            <ChevronsUpDown class="h-4 w-4"/>
                            <span class="sr-only">Toggle</span>
                        </Collapsible.Trigger>
                    </div>
                    <Collapsible.Content class="space-y-2">
                        <div
                                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div class="space-y-2 w-full sm:w-auto">
                                <Label>{$t('common.target_color')}</Label>
                                <ColorPicker
                                        colors={getColorsForPicker()}
                                        select={(i) => (targetColor = i)}
                                        selectedColor={targetColor}
                                        label=""
                                />
                            </div>
                            <div class="flex items-center space-x-8">
                                <div class="space-y-2">
                                    <Label for="steps">{$t('common.max_steps')}</Label>
                                    <Input
                                            bind:value={maxSteps}
                                            class="w-24"
                                            id="steps"
                                            max="10"
                                            min="1"
                                            type="number"
                                    />
                                </div>
                            </div>
                        </div>
                        <Controls
                                clearGrid={clearGrid}
                                exportPuzzle={handleExportPuzzle}
                                fillEmpty={fillEmpty}
                                importPuzzle={handleImportPuzzle}
                        />

                        <div class="flex flex-col justify-between sm:flex-row gap-4">
                            <ColorPicker
                                    colors={getColorsForPicker()}
                                    label={$t('common.select_color')}
                                    select={selectColor}
                                    selectedColor={selectedColor}
                                    showLockButton={true}
                            />
                            <div class="flex gap-2">
                                <Button variant="outline" size="icon" onclick={undo} disabled={undoStack.length === 0} class="disabled:opacity-50">
                                    <UndoIcon class="h-4 w-4"/>
                                </Button>
                                <Button variant="outline" size="icon" onclick={redo} disabled={redoStack.length === 0} class="disabled:opacity-50">
                                    <RedoIcon class="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <Grid
                                cols={cols}
                                grid={grid}
                                mousedown={(e) => handleMouseDown(e.row, e.col)}
                                mouseenter={(e) => handleMouseEnter(e.row, e.col)}
                                rows={rows}
                                readonly={false}
                        />
                    </Collapsible.Content>
                </Collapsible.Root>
            </CardContent>
        </Card>
    </div>
    <div class="flex-1 w-full max-w-3xl">
        <PlayCore data={editedData}/>
    </div>
</div>
