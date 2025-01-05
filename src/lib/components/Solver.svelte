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
    import {
        cloneMatrix,
        floodFill,
        isGoalState
    } from '$lib/utils/gridUtils';
    import { bfs } from '$lib/utils/solver';
    import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';

    export let puzzleId: string | null;

    let prevPuzzleId: string | null = null;
    let originalGrid: number[][] = [];
    async function loadPuzzleById(id: string) {
        try {
            const response = await fetch(`/puzzles_json/${id}.json`);
            if (!response.ok) throw new Error('无法加载题目数据');
            const puzzle = await response.json();
            if (puzzle.grid) {
                grid = puzzle.grid;
                originalGrid = cloneMatrix(puzzle.grid);
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
        } catch (error) {
            console.error('加载题目失败:', error);
        }
    }

    onMount(() => {
        if (!puzzleId) {
            puzzleId = "1";
        }
        loadPuzzleById(puzzleId);
    });

    $: if (puzzleId && puzzleId !== prevPuzzleId) {
        prevPuzzleId = puzzleId;
        loadPuzzleById(puzzleId);
    }

    // 画板维度与颜色
    let rows = 8;
    let cols = 10;
    let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];
    // 注意：索引0对应'#ffffff'(空)，1->蓝,2->红,3->黄,4->绿

    // 当前选择刷子的颜色
    let selectedColor = 1;

    // 要把所有格子最终染成的目标颜色
    let targetColor = 1;

    // 最大步数
    let maxSteps = 4;

    // 是否处于编辑模式
    let editMode = true;

    // BFS 搜索结果
    let solution: BFSResult | undefined = undefined;
    // 解题步骤
    let solvingSteps: Step[] = [];
    let currentStep = 0;
    // 记录 BFS 求解时每一步的 grid，用于前后步骤演示
    let stepGrids: number[][] = [];
    // 是否已经自动求解出答案
    let isAutoSolved = false;
    // 手动下的着色记录
    let moveHistory: Move[] = [];

    // 示例（仅做演示）
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

    // 当前画板
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

    let isDragging = false;
    function handleMouseDown(row, col) {
        isDragging = true;
        tryMove(row, col);
    }

    function handleMouseEnter(row, col) {
        if (isDragging && editMode) {
            changeColor(row, col);
        }
    }

    function handleMouseUp() {
        isDragging = false;
    }

    // 新增或修改：编辑模式直接改色，游戏模式带动画
    function tryMove(row, col) {
        if (editMode) {
            // 编辑模式下仍然使用原先的一步到位改色
            changeColor(row, col);
        } else {
            // 游戏模式下使用带动画的分层扩散
            animateWaveFill(row, col, selectedColor);
        }
    }

    function changeColor(row, col) {
        grid[row][col] = selectedColor;
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

    // 新增或修改：分层 BFS，用于动画“从点击处向外扩散”
    function floodFillWave(currentGrid: number[][], row: number, col: number, oldColor: number) {
        const rows = currentGrid.length;
        const cols = currentGrid[0].length;

        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue: [number, number, number][] = []; // [r, c, dist]
        const waveLayers: Array<Array<[number, number]>> = [];

        visited[row][col] = true;
        queue.push([row, col, 0]);

        while (queue.length > 0) {
            const [r, c, dist] = queue.shift()!;
            // 第 dist 圈还没数组就创建
            if (!waveLayers[dist]) {
                waveLayers[dist] = [];
            }
            waveLayers[dist].push([r, c]);

            // 向四周扩散
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (
                    nr >= 0 && nr < rows &&
                    nc >= 0 && nc < cols &&
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

    // 新增或修改：基于 waveLayers，分圈依次染色并刷新
    function animateWaveFill(row: number, col: number, newColor: number) {
        if (moveHistory.length >= maxSteps) return;
        const oldColor = grid[row][col];
        if (oldColor === newColor) return;

        // 将这一步操作记录下来
        moveHistory = [
            ...moveHistory,
            {
                position: [row, col],
                color: newColor,
                oldColor
            }
        ];

        // 先备份一份
        const tempGrid = cloneMatrix(grid);
        // 获取每一圈要染色的坐标
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        // 分圈动画
        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                // 本圈逐个染色
                layer.forEach(([r, c]) => {
                    grid[r][c] = newColor;
                });
                // 让 svelte 检测到变化
                grid = cloneMatrix(grid);

                // 最后一圈完成后，检查是否成功
                if (layerIndex === waveLayers.length - 1) {
                    checkWinCondition();
                }
            }, layerIndex * 80); // 每圈延迟 80ms，可自行调节
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

    function executeStep() {
        if (currentStep < solvingSteps.length) {
            const { A, B, position } = solvingSteps[currentStep];
            const [row, col] = position;
            grid = floodFill(cloneMatrix(grid), A, row, col);
            currentStep++;
        }
    }

    function nextStep() {
        if (currentStep < stepGrids.length - 1) {
            currentStep += 1;
            grid = cloneMatrix(stepGrids[currentStep]);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep -= 1;
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

<!-- 隐藏的文件选择器，用于导入 JSON -->
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
                    <div class="flex flex-row items-center justify-between">
                        <div class="space-y-2">
                            <Label>要把色块全部染成</Label>
                            <ColorPicker
                                    colors={colorsValue.slice(1)}
                                    selectedColor={targetColor}
                                    on:select={(e) => (targetColor = e.detail)}
                            />
                        </div>
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
                        <Button
                                variant="outline"
                                class="hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                                on:click={restorePuzzle}
                        >
                            移除答案
                        </Button>
                    {:else}
                        <Button variant="default" on:click={solvePuzzle}>
                            自动解题
                        </Button>
                    {/if}
                    {#if !editMode}
                        <Button class="button" on:click={resetMoves}>重新开始</Button>
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
