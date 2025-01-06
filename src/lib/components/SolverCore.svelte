<script lang="ts">
    import { onMount } from 'svelte';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import {
        Card,
        CardContent,
    } from '$lib/components/ui/card';
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Switch } from "$lib/components/ui/switch";
    import ColorPicker from './ColorPicker.svelte';
    import Controls from './Controls.svelte';
    import Grid from './Grid.svelte';
    import Solution from './Solution.svelte';
    import * as Collapsible from '$lib/components/ui/collapsible/index.js';
    import type {BFSResult, Move, Step, PuzzleDataType} from '$lib/types';
    import {
        cloneMatrix,
        floodFill,
        isGoalState
    } from '$lib/utils/gridUtils';
    import { bfs } from '$lib/utils/solver';
    import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
    import Footprints from 'lucide-svelte/icons/footprints';

    export let puzzleData: PuzzleDataType;

    // 是否处于编辑模式（外部也可传入，以控制组件的“编辑”与“游戏”状态）
    export let editMode = true;

    // 实际操作用的网格数据
    let grid: number[][] = [];
    // 原始网格数据（用于“重置”功能）
    let originalGrid: number[][] = [];

    // 要把所有格子最终变成的目标颜色
    let targetColor = 1;
    // 最大步数
    let maxSteps = 3;

    // BFS 的搜索结果（success/failed）
    let solution: BFSResult | undefined = undefined;
    // BFS 的每一步
    let solvingSteps: Step[] = [];
    // BFS 每一步对应的 grid（只在无动画的 next/prevStep 用到）
    let stepGrids: number[][] = [];
    let currentStep = 0;
    let isAutoSolved = false;

    // 当前选的刷子颜色（1表示蓝色，对应 colorsValue[1]）
    let selectedColor = 1;

    // 记录玩家手动移动历史（仅在游戏模式下使用）
    let moveHistory: Move[] = [];

    // 一些控制画板的配置
    let rows = 8;
    let cols = 10;
    let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];

    // 当 puzzleData 改变时，初始化 grid/targetColor/maxSteps/solutionSteps 等
    $: if (puzzleData) {
        initPuzzle(puzzleData);
    }

    // 将 puzzleData 初始化到本组件内部的状态
    function initPuzzle(data) {
        grid = cloneMatrix(data.grid);
        originalGrid = cloneMatrix(data.grid);

        // 这里可能是字符串，需要转为数字
        targetColor = +data.targetColor;
        maxSteps = +data.maxSteps;

        // 如果已经有解法
        if (data.solutionSteps && data.solutionSteps.length > 0) {
            solution = { type: 'success', steps: data.solutionSteps };
            solvingSteps = data.solutionSteps;
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of data.solutionSteps) {
                const { A, position } = step;
                tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                stepGrids.push(cloneMatrix(tempGrid));
            }
            currentStep = 0;
            isAutoSolved = true;
        } else {
            solution = undefined;
            solvingSteps = [];
            stepGrids = [];
            currentStep = 0;
            isAutoSolved = false;
        }

        // 每次切换 puzzle 时，也要清空 moveHistory
        moveHistory = [];
        selectedColor = 1;
    }


    // ----------------------------
    //   1. 常用编辑/操作函数
    // ----------------------------
    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        stepGrids = [];
        currentStep = 0;
    }

    // 可选：导出、导入功能
    function handleExportPuzzle() {
        const puzzleData = {
            grid,
            targetColor,
            maxSteps,
            solutionSteps: solution?.steps ?? [],
        };
        const jsonStr = JSON.stringify(puzzleData, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "溢彩画示例.json");
        dlAnchorElem.click();
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
                    originalGrid = cloneMatrix(grid);
                }
                if (puzzle.targetColor) targetColor = puzzle.targetColor;
                if (puzzle.maxSteps) maxSteps = puzzle.maxSteps;
                if (puzzle.solutionSteps && puzzle.solutionSteps.length > 0) {
                    solution = {
                        type: 'success',
                        steps: puzzle.solutionSteps
                    };
                    solvingSteps = puzzle.solutionSteps;
                    stepGrids = [cloneMatrix(grid)];
                    let tempGrid = cloneMatrix(grid);
                    for (let step of puzzle.solutionSteps) {
                        const {A, position} = step;
                        tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                        stepGrids.push(cloneMatrix(tempGrid));
                    }
                    currentStep = 0;
                    isAutoSolved = true;
                } else {
                    solution = undefined;
                    solvingSteps = [];
                    stepGrids = [];
                    currentStep = 0;
                    isAutoSolved = false;
                }
                moveHistory = [];
                alert('题目已成功导入！');
            } catch (error) {
                console.error('导入的 JSON 文件格式不正确:', error);
                alert('导入失败，文件格式不正确！');
            }
        };
        reader.readAsText(file);
    }

    // 清空画板
    function clearGrid() {
        grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 0)
        );
        moveHistory = [];
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

    // 如果需要把当前状态保存至本地 localStorage 的示例
    function saveToHistory() {
        const puzzles = JSON.parse(localStorage.getItem('puzzles') || '[]');
        puzzles.push({
            grid: grid,
            targetColor,
            maxSteps,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('puzzles', JSON.stringify(puzzles));
    }
    function generatePuzzle() {
        saveToHistory();
        fillEmpty();
    }
    function fillEmpty() {
        grid = grid.map(row => row.map(cell => cell === 0 ? selectedColor : cell));
    }

    // ----------------------------
    //   2. 拖拽、颜色变更相关
    // ----------------------------
    let isDragging = false;
    function handleMouseDown(row, col) {
        isDragging = true;
        tryMove(row, col);
    }
    function handleMouseEnter(row, col) {
        // 只有编辑模式才允许拖拽连续涂色
        if (isDragging && editMode) {
            changeColor(row, col);
        }
    }
    function handleMouseUp() {
        isDragging = false;
    }

    function tryMove(row, col) {
        if (editMode) {
            changeColor(row, col);
        } else {
            animateWaveFill(row, col, selectedColor);
        }
    }

    function changeColor(row, col) {
        grid[row][col] = selectedColor;
        // 手动触发 svelte 更新
        grid = cloneMatrix(grid);
    }

    function checkWinCondition() {
        if (isGoalState(grid, targetColor)) {
            setTimeout(() => {
                alert(`恭喜！您用了 ${moveHistory.length} 步完成了游戏！`);
            }, 100);
        } else if (moveHistory.length >= maxSteps) {
            setTimeout(() => {
                alert('已达到最大步数限制，请重试！');
            }, 100);
        }
    }

    // ----------------------------
    //   3. 波次扩散 + BFS 求解
    // ----------------------------
    function floodFillWave(currentGrid: number[][], row: number, col: number, oldColor: number) {
        const rowCount = currentGrid.length;
        const colCount = currentGrid[0].length;
        const visited = Array.from({ length: rowCount }, () => Array(colCount).fill(false));
        const queue: [number, number, number][] = [];
        const waveLayers: Array<Array<[number, number]>> = [];

        visited[row][col] = true;
        queue.push([row, col, 0]);

        while (queue.length > 0) {
            const [r, c, dist] = queue.shift()!;
            if (!waveLayers[dist]) {
                waveLayers[dist] = [];
            }
            waveLayers[dist].push([r, c]);

            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (
                    nr >= 0 && nr < rowCount &&
                    nc >= 0 && nc < colCount &&
                    !visited[nr][nc] &&
                    currentGrid[nr][nc] === oldColor
                ) {
                    visited[nr][nc] = true;
                    queue.push([nr, nc, dist + 1]);
                }
            }
        }

        return waveLayers;
    }

    function animateWaveFill(row: number, col: number, newColor: number) {
        if (moveHistory.length >= maxSteps) return;
        const oldColor = grid[row][col];
        if (oldColor === newColor) return;

        // 记录到 moveHistory
        moveHistory.push({
            position: [row, col],
            color: newColor,
            oldColor
        });
        moveHistory = moveHistory;

        const tempGrid = cloneMatrix(grid);
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                for (const [r, c] of layer) {
                    grid[r][c] = newColor;
                }
                // 触发 svelte 更新
                grid = cloneMatrix(grid);

                // 最后一圈染完后检查
                if (layerIndex === waveLayers.length - 1) {
                    checkWinCondition();
                }
            }, layerIndex * 80);
        });
    }

    function solvePuzzle() {
        const result = bfs(cloneMatrix(grid), targetColor, maxSteps);
        solution = result;
        if (result.type === 'success') {
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of result.steps) {
                const { A, position } = step;
                tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                stepGrids.push(cloneMatrix(tempGrid));
            }
            isAutoSolved = true;
        }
        solvingSteps = result.steps;
        currentStep = 0;
    }

    let isAnimatingStep = false;
    function nextStep() {
        if (!solution || !solvingSteps || isAnimatingStep) return;
        if (currentStep >= solvingSteps.length) return;

        const step = solvingSteps[currentStep];
        isAnimatingStep = true;
        const [row, col] = step.position;
        const oldColor = grid[row][col];

        const waveLayers = floodFillWave(cloneMatrix(grid), row, col, oldColor);

        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                for (const [r, c] of layer) {
                    grid[r][c] = step.A;
                }
                grid = cloneMatrix(grid);

                if (layerIndex === waveLayers.length - 1) {
                    currentStep++;
                    isAnimatingStep = false;
                }
            }, layerIndex * 80);
        });
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            grid = cloneMatrix(stepGrids[currentStep]);
        }
    }

    function showSolution() {
        if (solution && solution.steps && solution.steps.length > 0) {
            solvingSteps = solution.steps;
            currentStep = 0;
            if (stepGrids.length > 0) {
                grid = cloneMatrix(stepGrids[0]);
            }
        }
    }

    // 移除答案
    function restorePuzzle() {
        if (stepGrids.length > 0) {
            grid = cloneMatrix(stepGrids[0]);
            solvingSteps = [];
            stepGrids = [];
            solution = undefined;
            currentStep = 0;
            isAutoSolved = false;
        }
    }

    let gridWidth: number;
    function handleGridWidthChange(event: CustomEvent) {
        gridWidth = event.detail;
    }
</script>

<!-- 隐藏的文件选择器，用于导入题目 JSON -->
<input
        accept="application/json"
        bind:this={fileInput}
        on:change={handleFileChange}
        style="display: none;"
        type="file"
/>

<div
        class="flex flex-col md:flex-row gap-4 mt-5"
        on:mouseleave={handleMouseUp}
        on:mouseup={handleMouseUp}
>
    <div class="flex-1 flex flex-col gap-4">
        <Card>
            <CardContent class="space-y-4 p-6">
                <Collapsible.Root class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold tracking-tight">编辑区</h2>
                        <Collapsible.Trigger
                                class={buttonVariants({ variant: "outline", size: "sm", class: "w-9 p-0" })}
                        >
                            <ChevronsUpDown class="h-4 w-4" />
                            <span class="sr-only">Toggle</span>
                        </Collapsible.Trigger>
                    </div>
                    <div
                            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            style="max-width: {gridWidth}px"
                    >
                        <div class="space-y-2 w-full sm:w-auto">
                            <Label>要把色块全部染成</Label>
                            <ColorPicker
                                    colors={colorsValue.slice(1)}
                                    selectedColor={targetColor}
                                    on:select={(e) => (targetColor = e.detail)}
                            />
                        </div>
                        <div class="flex items-center space-x-8">
                            <div class="space-y-2">
                                <Label for="steps">最大步数</Label>
                                <Input
                                        id="steps"
                                        type="number"
                                        min="1"
                                        max="10"
                                        bind:value={maxSteps}
                                        class="w-24"
                                />
                            </div>
                            <div class="space-y-2">
                                <Label class="flex items-center space-x-2">
                                    编辑模式
                                </Label>
                                <Switch
                                        id="edit-mode"
                                        bind:checked={editMode}
                                />
                            </div>
                        </div>
                    </div>
                    <Collapsible.Content class="space-y-2">
                        <Controls
                                editMode={editMode}
                                isAutoSolved={isAutoSolved}
                                maxSteps={maxSteps}
                                on:clearGrid={clearGrid}
                                on:exportPuzzle={handleExportPuzzle}
                                on:fillEmpty={fillEmpty}
                                on:generatePuzzle={generatePuzzle}
                                on:importPuzzle={handleImportPuzzle}
                                on:resetMoves={resetMoves}
                                on:restorePuzzle={restorePuzzle}
                                on:solvePuzzle={solvePuzzle}
                        />
                    </Collapsible.Content>
                </Collapsible.Root>
            </CardContent>
        </Card>

        <Card>
            <CardContent>
                {#if !editMode}
                    <div class="mb-6" style="max-width: {gridWidth}px">
                        <div class="p-4 rounded-lg bg-secondary/50 border">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <Footprints class="h-5 w-5 text-primary" />
                                    <span class="text-base font-medium">步数</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xl font-bold text-primary">{moveHistory.length}</span>
                                    <span class="text-muted-foreground">/</span>
                                    <span class="text-lg font-medium text-muted-foreground">{maxSteps}</span>
                                </div>
                            </div>
                            <div class="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                        class="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                                        style="width: {(moveHistory.length / maxSteps * 100)}%"
                                />
                            </div>
                            <p class="mt-2 text-sm text-muted-foreground">
                                {#if moveHistory.length === maxSteps}
                                    已达到最大步数
                                {:else if moveHistory.length === 0}
                                    开始你的游戏吧
                                {:else}
                                    还剩 {maxSteps - moveHistory.length} 步
                                {/if}
                            </p>
                        </div>
                    </div>
                {/if}
                <div class="flex flex-col justify-between sm:flex-row gap-4" style="max-width: {gridWidth}px">
                    <ColorPicker
                            colors={colorsValue.slice(1)}
                            label="染色刷"
                            on:select={(e) => (selectedColor = e.detail)}
                            selectedColor={selectedColor}
                    />
                    <div>
                        {#if isAutoSolved}
                            <Button
                                    variant="outline"
                                    class="hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                                    onclick={restorePuzzle}
                            >
                                移除答案
                            </Button>
                        {:else}
                            <Button variant="default" onclick={solvePuzzle}>
                                自动解题
                            </Button>
                        {/if}
                        {#if !editMode}
                            <Button class="button" onclick={resetMoves}
                                    disabled={moveHistory.length === 0}>
                                重新开始
                            </Button>
                        {/if}
                    </div>
                </div>
                <Grid
                        colors={colorsValue}
                        cols={cols}
                        grid={grid}
                        on:mousedown={(e) => handleMouseDown(e.detail.row, e.detail.col)}
                        on:mouseenter={(e) => handleMouseEnter(e.detail.row, e.detail.col)}
                        on:widthChange={handleGridWidthChange}
                        rows={rows}
                />

            </CardContent>
        </Card>
    </div>

    {#if solution}
        <div class="w-full md:w-[320px] flex-shrink-0">
            <Card>
                <CardContent>
                    <Solution
                            solution={solution}
                            steps={solvingSteps}
                            currentStep={currentStep}
                            prevStep={prevStep}
                            nextStep={nextStep}
                    />
                </CardContent>
            </Card>
        </div>
    {/if}
</div>
