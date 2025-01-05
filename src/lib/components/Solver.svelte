<script lang="ts">
    import { onMount } from 'svelte';
    import { Button, buttonVariants } from '$lib/components/ui/button';
    import {
        Card,
        CardHeader,
        CardTitle,
        CardContent,
        CardFooter
    } from '$lib/components/ui/card';
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Switch } from "$lib/components/ui/switch";
    import ColorPicker from './ColorPicker.svelte';
    import Controls from './Controls.svelte';
    import Grid from './Grid.svelte';
    import Solution from './Solution.svelte';
    import * as Collapsible from '$lib/components/ui/collapsible/index.js';
    import type { BFSResult, Move, Step } from '$lib/types';

    // 工具函数 & BFS 逻辑
    import {
        cloneMatrix,
        floodFill,
        isGoalState
    } from '$lib/utils/gridUtils';
    import { bfs } from '$lib/utils/solver';

    // 图标
    import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';

    export let puzzleId: string | null;
    let prevPuzzleId: string | null = null;
    let originalGrid: number[][] = [];
    // 获取编号对应的 JSON 数据
    async function loadPuzzleById(id: string) {
        try {
            const response = await fetch(`/puzzles_json/${id}.json`); // 根据实际 API 更新 URL
            if (!response.ok) throw new Error('无法加载题目数据');
            const puzzle = await response.json();

            // 更新棋盘状态
            if (puzzle.grid) {
                grid = puzzle.grid;
                originalGrid = cloneMatrix(puzzle.grid);
            }
            if (puzzle.targetColor) targetColor = puzzle.targetColor;
            if (puzzle.maxSteps) maxSteps = puzzle.maxSteps;
            if (puzzle.solutionSteps && puzzle.solutionSteps.length > 0) {
                // 重置 solution 为 "success"，并存入 steps
                solution = {
                    type: 'success',
                    steps: puzzle.solutionSteps
                };
                solvingSteps = puzzle.solutionSteps;

                // 3. 重新构建 stepGrids：第 0 步是导入后的当前网格
                stepGrids = [cloneMatrix(grid)];
                let tempGrid = cloneMatrix(grid);
                for (let step of puzzle.solutionSteps) {
                    const {A, position} = step;
                    tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                    stepGrids.push(cloneMatrix(tempGrid));
                }
                currentStep = 0;
                isAutoSolved = true; // 说明此时已经有解法
            } else {
                // 如果导入的 puzzle 没有解法步骤，则不设置 solution/stepGrids
                solution = undefined;
                solvingSteps = [];
                stepGrids = [];
                currentStep = 0;
                isAutoSolved = false;
            }
        } catch (error) {
            console.error('加载题目失败:', error);
        }
    }

    // 自动加载编号对应数据
    onMount(() => {
        if (puzzleId) {
        } else {
            puzzleId = "1"
        }
        loadPuzzleById(puzzleId);

    });


    $: if (puzzleId && puzzleId !== prevPuzzleId) {
        prevPuzzleId = puzzleId;
        loadPuzzleById(puzzleId);
    }

    let rows = 8;
    let cols = 10;
    let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];
    let selectedColor = 1;
    let targetColor = 1;
    let maxSteps = 4;
    let editMode = true;


    let solution: BFSResult | undefined = undefined;

    let solvingSteps: Step[] = [];
    let currentStep = 0;
    let stepGrids: number[][] = [];
    let isAutoSolved = false;

    let moveHistory: Move[] = [];

    const exampleGrid = [
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 3, 3, 3, 2, 3, 3, 3, 3, 1],
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 3, 3, 3, 3, 3, 3, 2, 3, 1],
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
    ];

    let grid: number[][] = [];

    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

    function loadExample() {
        grid = cloneMatrix(exampleGrid);
        originalGrid = cloneMatrix(exampleGrid);
        moveHistory = [];
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

    function handleExportPuzzle() {
        const puzzleData = {
            grid,
            targetColor,
            maxSteps,
            solutionSteps: solution?.steps ?? [],
        };

        // 转成 JSON 字符串
        const jsonStr = JSON.stringify(puzzleData, null, 2);

        // 创建下载链接并触发下载
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        // TODO: change name
        dlAnchorElem.setAttribute("download", "溢彩画示例.json");
        dlAnchorElem.click();
    }

    let fileInput: HTMLInputElement;

    function handleImportPuzzle() {
        fileInput.click();  // 触发选择文件对话框
    }

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const content = (ev.target as FileReader).result as string;
                const puzzle = JSON.parse(content);

                // 1. 根据 puzzle 更新当前画板
                if (puzzle.grid) {
                    grid = puzzle.grid;
                    originalGrid = cloneMatrix(grid);
                }
                if (puzzle.targetColor) targetColor = puzzle.targetColor;
                if (puzzle.maxSteps) maxSteps = puzzle.maxSteps;

                // 2. 若 puzzle 带有解法步骤，则恢复解题状态
                if (puzzle.solutionSteps && puzzle.solutionSteps.length > 0) {
                    // 重置 solution 为 "success"，并存入 steps
                    solution = {
                        type: 'success',
                        steps: puzzle.solutionSteps
                    };
                    solvingSteps = puzzle.solutionSteps;

                    // 3. 重新构建 stepGrids：第 0 步是导入后的当前网格
                    stepGrids = [cloneMatrix(grid)];
                    let tempGrid = cloneMatrix(grid);
                    for (let step of puzzle.solutionSteps) {
                        const {A, position} = step;
                        tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                        stepGrids.push(cloneMatrix(tempGrid));
                    }
                    currentStep = 0;
                    isAutoSolved = true; // 说明此时已经有解法
                } else {
                    // 如果导入的 puzzle 没有解法步骤，则不设置 solution/stepGrids
                    solution = undefined;
                    solvingSteps = [];
                    stepGrids = [];
                    currentStep = 0;
                    isAutoSolved = false;
                }

                // 4. 其他操作：清空 moveHistory 等
                moveHistory = [];

                alert('题目已成功导入！');

            } catch (error) {
                console.error('导入的 JSON 文件格式不正确:', error);
                alert('导入失败，文件格式不正确！');
            }
        };
        reader.readAsText(file);
    }


    function clearGrid() {
        grid = Array.from({length: rows}, () =>
            Array.from({length: cols}, () => 0)
        );
        moveHistory = [];
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

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
        // TODO: 先不用
        fillEmpty();
    }

    function fillEmpty() {
        grid = grid.map(row => row.map(cell => cell === 0 ? selectedColor : cell));
    }

    let isDragging = false;

    function handleMouseDown(row, col) {
        isDragging = true;
        if (editMode) {
            changeColor(row, col);
        } else {
            tryMove(row, col);
        }
    }

    function handleMouseEnter(row, col) {
        if (isDragging && editMode) {
            changeColor(row, col);
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    function changeColor(row, col) {
        grid[row][col] = selectedColor;
        grid = cloneMatrix(grid);
    }

    function tryMove(row, col) {
        if (moveHistory.length >= maxSteps) return;
        if (grid[row][col] === selectedColor) return;

        const newGrid = floodFill(cloneMatrix(grid), selectedColor, row, col);

        moveHistory = [
            ...moveHistory,
            {
                position: [row, col],
                color: selectedColor,
                oldColor: grid[row][col]
            }
        ];

        grid = newGrid;
        solution = undefined;
        checkWinCondition();
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

    function solvePuzzle() {
        const result = bfs(cloneMatrix(grid), targetColor, maxSteps);
        solution = result;

        if (result.type === 'success') {
            // 第 0 张快照是当前网格
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of result.steps) {
                const {A, position} = step;
                tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                stepGrids.push(cloneMatrix(tempGrid));
            }
            isAutoSolved = true;
        }

        solvingSteps = result.steps;
        currentStep = 0;
    }

    function executeStep() {
        if (currentStep < solvingSteps.length) {
            const {A, B, position} = solvingSteps[currentStep];
            const [row, col] = position;
            grid = floodFill(cloneMatrix(grid), A, row, col);
            currentStep++;
        }
    }

    // 新增「下一步」「上一步」逻辑
    function nextStep() {
        // 若还没到最后一步，则切换到下一步
        if (currentStep < stepGrids.length - 1) {
            currentStep += 1;
            grid = cloneMatrix(stepGrids[currentStep]);
        }
    }

    function prevStep() {
        // 若不是第一步，则回退一步
        if (currentStep > 0) {
            currentStep -= 1;
            grid = cloneMatrix(stepGrids[currentStep]);
        }
    }

    // 「查看解题步骤」时，将 BFS 求得的 steps 存入 solvingSteps
    function showSolution() {
        if (solution && solution.steps && solution.steps.length > 0) {
            solvingSteps = solution.steps;
            currentStep = 0;
            // 回到初始网格
            if (stepGrids.length > 0) {
                grid = cloneMatrix(stepGrids[0]);
            }
        }
    }

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
</script>
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
    <!-- 左边区域：编辑控件 + 棋盘 -->
    <div class="flex-1 flex flex-col gap-4">
        <!-- Card 1: 控制台区域（编辑模式开关、颜色选择等） -->
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

                    <div class="flex flex-row items-center justify-between">
                        <div class="space-y-2">
                            <Label>要把色块全部染成</Label>
                            <ColorPicker
                                    colors={colorsValue.slice(1)}
                                    selectedColor={targetColor}
                                    on:select={(e) => (targetColor = e.detail)}
                            />
                        </div>

                        <!-- 最大步数设置 -->
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

                        <!-- 编辑模式开关 -->
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
                                on:loadExample={loadExample}
                                on:resetMoves={resetMoves}
                                on:restorePuzzle={restorePuzzle}
                                on:solvePuzzle={solvePuzzle}
                        />
                    </Collapsible.Content>
                </Collapsible.Root>
            </CardContent>
        </Card>

        <!-- Card 2: 棋盘区域 -->
        <Card>
            <CardContent>
                {#if !editMode}
                    <div class="font-semibold">
                        当前步数: {moveHistory.length} / {maxSteps}
                    </div>
                {/if}
                <div class="flex flex-col sm:flex-row gap-4">
                    <ColorPicker
                            colors={colorsValue.slice(1)}
                            label="染色刷"
                            on:select={(e) => (selectedColor = e.detail)}
                            selectedColor={selectedColor}
                    />
                    {#if isAutoSolved}
                        <Button variant="outline"
                                class="hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                                onclick={restorePuzzle}>
                            移除答案
                        </Button>
                    {:else}
                        <Button variant="default" onclick={solvePuzzle}>
                            自动解题
                        </Button>
                    {/if}
                    {#if !editMode}
                        <Button class="button" onclick={resetMoves}>重新开始</Button>
                    {/if}
                </div>

                <Grid
                        colors={colorsValue}
                        cols={cols}
                        grid={grid}
                        on:mousedown={(e) => handleMouseDown(e.detail.row, e.detail.col)}
                        on:mouseenter={(e) => handleMouseEnter(e.detail.row, e.detail.col)}
                        rows={rows}
                />
            </CardContent>
        </Card>
    </div>

    <!-- 右边区域：解题方案 (仅在 solution 存在时显示) -->
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
