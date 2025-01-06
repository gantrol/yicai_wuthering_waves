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

    // puzzleId 用于路由传参（可选）
    export let puzzleId: string | null;
    // 是否处于编辑模式
    export let editMode = true;

    let prevPuzzleId: string | null = null;
    let originalGrid: number[][] = [];

    /**
     * 当 puzzleId 改变时，载入对应的 puzzle
     */
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
        // 如果 puzzleId 不存在，就默认加载 puzzle #1
        if (!puzzleId) {
            puzzleId = "1";
        }
        loadPuzzleById(puzzleId);
    });

    // 监听 puzzleId 变化（用于在路由切换时重新加载）
    $: if (puzzleId && puzzleId !== prevPuzzleId) {
        prevPuzzleId = puzzleId;
        loadPuzzleById(puzzleId);
    }

    // 画板大小与颜色列表
    let rows = 8;
    let cols = 10;
    let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];

    // 当前选的刷子颜色（1表示蓝色，对应 colorsValue[1]）
    let selectedColor = 1;

    // 要把所有格子最终变成的目标颜色（1表示蓝色）
    let targetColor = 1;

    // 最大步数
    let maxSteps = 4;


    // BFS 的搜索结果
    let solution: BFSResult | undefined = undefined;
    // BFS 的每一步
    let solvingSteps: Step[] = [];
    let currentStep = 0;
    // BFS 每一步对应的 grid（用于旧版的无动画 next/prevStep）
    let stepGrids: number[][] = [];
    // 是否已经自动求解
    let isAutoSolved = false;
    // 手动操作记录
    let moveHistory: Move[] = [];

    // 一个示例
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

    // 重置到 puzzle 原始状态
    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

    // 加载示例
    function loadExample() {
        grid = cloneMatrix(exampleGrid);
        originalGrid = cloneMatrix(grid);
        moveHistory = [];
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
        maxSteps = 4;
        targetColor = 1
    }

    // 导出
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

    // 导入
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

    // 拖拽相关
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

    // 根据模式区别对待：编辑模式=>直接涂色；游戏模式=>带动画扩散
    function tryMove(row, col) {
        if (editMode) {
            changeColor(row, col);
        } else {
            animateWaveFill(row, col, selectedColor);
        }
    }

    // 直接涂色（编辑模式使用）
    function changeColor(row, col) {
        grid[row][col] = selectedColor;
        // 手动触发 svelte 更新
        grid = cloneMatrix(grid);
    }

    // 检查是否完成
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

    /**
     * 分层 BFS，返回 waveLayers[i] 为“距离点击点为 i”的所有坐标
     */
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
            // 记录到 waveLayers
            if (!waveLayers[dist]) {
                waveLayers[dist] = [];
            }
            waveLayers[dist].push([r, c]);

            // 四方向拓展
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

    /**
     * 游戏模式下，单次点击的扩散动画
     */
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

        // 分层 BFS
        const tempGrid = cloneMatrix(grid);
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        // 分圈染色
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

    /**
     * 自动解题入口
     */
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

    /**
     * 原先的“下一步”是直接一口气切换到 stepGrids[currentStep+1]。
     * 现在改为带动画，让每一步也触发“点击式”波次染色。
     *
     * 如果您仍然想保留“无动画版本”，可以保留一个函数 nextStepNoAnimation() 使用旧逻辑。
     */
    let isAnimatingStep = false;
    function nextStep() {
        if (!solution || !solvingSteps || isAnimatingStep) return;
        if (currentStep >= solvingSteps.length) return;

        // 取本步
        const step = solvingSteps[currentStep];
        isAnimatingStep = true;

        // 在 BFS 解法中，step = { A, B, position }
        // oldColor = step.B (可能已记录), 也可以从当前 grid[row][col] 取
        const [row, col] = step.position;
        const oldColor = grid[row][col]; // 也可以用 step.B

        // 做和 animateWaveFill 类似的事，但这里不往 moveHistory 里加了
        const waveLayers = floodFillWave(cloneMatrix(grid), row, col, oldColor);

        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                for (const [r, c] of layer) {
                    grid[r][c] = step.A;
                }
                grid = cloneMatrix(grid);

                // 最后一圈
                if (layerIndex === waveLayers.length - 1) {
                    // 动画结束后，才算这一步完成
                    currentStep++;
                    isAnimatingStep = false;
                }
            }, layerIndex * 80);
        });
    }

    // 上一步：如果要动画回退，需要自己实现。本文示例不做回退动画。
    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            // 直接一口气切回，不做动画
            grid = cloneMatrix(stepGrids[currentStep]);
        }
    }

    // 如果需要从头演示所有 step，可在这里把 currentStep=0，然后依次 nextStep()。
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
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div class="space-y-2 w-full sm:w-auto">
                            <Label>要把色块全部染成</Label>
                            <ColorPicker
                                    colors={colorsValue.slice(1)}
                                    selectedColor={targetColor}
                                    on:select={(e) => (targetColor = e.detail)}
                            />
                        </div>
                        <div class="flex items-center space-x-8"> <!-- 增加了 space-x-8 来控制两个控件之间的间距 -->
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
