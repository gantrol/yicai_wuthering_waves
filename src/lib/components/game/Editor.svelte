<!-- src/lib/components/game/Editor.svelte -->
<script lang="ts">
    import {cloneMatrix, floodFill, getColors, getColorsForPicker} from "$lib/utils/gridUtils.js";
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
    // Undo/Redo state
    let undoStack = $state<number[][][]>([]);
    let redoStack = $state<number[][][]>([]);

    // ----------------------------
    //   拖拽、颜色变更相关
    // ----------------------------
    let isDragging = $state(false);
    let dragStartGrid: number[][] | null = $state(null); // Store the grid state when dragging starts

    function updateGrid(newGrid: number[][]) {
        if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
            undoStack = [...undoStack, cloneMatrix(grid)];
            redoStack = []; // Clear redo stack on new action
            grid = newGrid;
        }
    }

    function handleCellClick({ row, col }) {
        if (!isDragging) { // Only push to undo stack for single clicks
            const oldGrid = cloneMatrix(grid);
            oldGrid[row][col] = selectedColor;
            updateGrid(oldGrid);
        } else {
            // Directly modify the grid during drag
            grid[row][col] = selectedColor;
            grid = [...grid]; // Trigger reactivity
        }
    }

    function clearGrid() {
        const emptyGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));
        updateGrid(emptyGrid);
        toast('画板已清空', 'success');
    }

    function fillEmpty() {
        const filledGrid = grid.map(row => row.map(cell => cell === 0 ? selectedColor : cell));
        updateGrid(filledGrid);
        toast('空白已填充', 'success');
    }

    function exportPuzzle() {
        // Implement export logic here, potentially using shareUtils
        toast('导出功能待实现', 'warning');
    }

    function importPuzzle() {
        // Implement import logic here
        toast('导入功能待实现', 'warning');
    }

    function undo() {
        if (undoStack.length > 0) {
            redoStack = [...redoStack, cloneMatrix(grid)];
            grid = undoStack.pop();
        } else {
            toast('没有可以撤销的操作', 'info');
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack = [...undoStack, cloneMatrix(grid)];
            grid = redoStack.pop();
        } else {
            toast('没有可以重做的操作', 'info');
        }
    }

    function selectColor(colorIndex: number) {
        selectedColor = colorIndex;
    }

    function handleMouseDown(row: number, col: number) {
        isDragging = true;
        dragStartGrid = cloneMatrix(grid); // Capture the grid state when dragging starts
        handleCellClick({ row, col });
    }

    function handleMouseEnter(row: number, col: number) {
        if (isDragging) {
            handleCellClick({ row, col });
        }
    }

    function handleMouseUp() {
        if (isDragging && dragStartGrid) {
            // Push the grid state at the start of the drag to the undo stack
            if (JSON.stringify(grid) !== JSON.stringify(dragStartGrid)) {
                undoStack = [...undoStack, dragStartGrid];
                redoStack = [];
            }
            dragStartGrid = null;
        }
        isDragging = false;
    }

    // ----------------------------
    //   文件导出导入
    // ----------------------------
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
                // if (puzzle.solutionSteps && puzzle.solutionSteps.length > 0) {
                //     solution = {
                //         type: 'success',
                //         steps: puzzle.solutionSteps
                //     };
                //     solvingSteps = puzzle.solutionSteps;
                //     stepGrids = [cloneMatrix(grid)];
                //     let tempGrid = cloneMatrix(grid);
                //     for (let step of puzzle.solutionSteps) {
                //         const {A, position} = step;
                //         tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                //         stepGrids.push(cloneMatrix(tempGrid));
                //     }
                //     currentStep = 0;
                //     isAutoSolved = true;
                // } else {
                //     solution = undefined;
                //     solvingSteps = [];
                //     stepGrids = [];
                //     currentStep = 0;
                //     isAutoSolved = false;
                // }
                // moveHistory = [];
                toast('题目已成功导入！', "success");
            } catch (error) {
                console.error('导入的 JSON 文件格式不正确:', error);
                toast('导入失败，文件格式不正确！', "error");
            }
        };
        reader.readAsText(file);
    }

    function handleExportPuzzle() {
        const puzzleData = {
            grid,
            targetColor,
            maxSteps,
            // solutionSteps: solution?.steps ?? [],
        };
        const jsonStr = JSON.stringify(puzzleData, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "溢彩画示例.json");
        dlAnchorElem.click();
    }

    let editorIsOpen = $state(true);
</script>
<!-- 隐藏的文件选择器，用于导入题目 JSON -->
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
                        <h2 class="text-lg font-semibold tracking-tight">编辑区</h2>
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
                                    select={(i) => (selectedColor = i)}
                                    selectedColor={selectedColor}
                            />
                            <div class="flex gap-2">
                                <Button variant="outline" size="icon" onclick={undo} disabled={undoStack.length === 0}>
                                    <UndoIcon class="h-4 w-4"/>
                                    <span class="sr-only">撤销</span>
                                </Button>
                                <Button variant="outline" size="icon" onclick={redo} disabled={redoStack.length === 0}>
                                    <RedoIcon class="h-4 w-4"/>
                                    <span class="sr-only">重做</span>
                                </Button>
                            </div>
                        </div>
                        <Grid
                                colors={getColors()}
                                cols={cols}
                                grid={grid}
                                mousedown={(e) => handleMouseDown(e.row, e.col)}
                                mouseenter={(e) => handleMouseEnter(e.row, e.col)}
                                rows={rows}
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
