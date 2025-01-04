<script lang="ts">
    import { onMount } from 'svelte'
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
    import ColorPicker from './ColorPicker.svelte'
    import Controls from './Controls.svelte'
    import Grid from './Grid.svelte'
    import Solution from './Solution.svelte'
    import { cloneMatrix, floodFill, isGoalState, matrixToString, isAllTargetColor } from '$lib/utils/gridUtils';
    import { bfs } from '$lib/utils/solver';

    let rows = 8;
    let cols = 10;
    let colorsName = ['空', '蓝', '红', '黄', '绿'];
    let colorsValue = ['#ffffff', '#4980b9', '#d2463e', '#f5db82', '#59a68d'];
    let selectedColor = 1;
    let targetColor = 1;
    let maxSteps = 4;
    let editMode = true;
    let moveHistory = [];
    let solution = undefined;
    let solvingSteps = [];
    let currentStep = 0;
    let stepGrids = [];
    let isAutoSolved = false;

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

    let grid = [];

    onMount(() => {
        loadExample();
    });

    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(exampleGrid);
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
    }

    function loadExample() {
        grid = cloneMatrix(exampleGrid);
        moveHistory = [];
        solution = undefined;
        solvingSteps = [];
        stepGrids = [];
        currentStep = 0;
        isAutoSolved = false;
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
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of result.steps) {
                const { A, B, position } = step;
                const [row, col] = position;
                tempGrid = floodFill(cloneMatrix(tempGrid), A, row, col);
                stepGrids.push(cloneMatrix(tempGrid));
            }
            isAutoSolved = true;
        }
    }

    function executeStep() {
        if (currentStep < solvingSteps.length) {
            const { A, B, position } = solvingSteps[currentStep];
            const [row, col] = position;
            grid = floodFill(cloneMatrix(grid), A, row, col);
            currentStep++;
        }
    }

    function showSolution() {
        if (solution && solution.steps && solution.steps.length > 0) {
            solvingSteps = solution.steps;
            currentStep = 0;
            grid = cloneMatrix(stepGrids[0]);
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

    // 处理 Controls 组件触发的 requestShowSolution 事件
    function handleRequestShowSolution() {
        showSolution();
    }
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: Arial, sans-serif;
        padding: 20px;
    }

    .controls {
        margin-bottom: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }

    .button-group {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    .button {
        padding: 10px 20px;
        background-color: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }

    .button:hover {
        background-color: #0056b3;
    }

    .mode-switch {
        margin: 10px 0;
    }

    .moves-counter {
        margin-top: 10px;
        font-size: 1.1em;
        font-weight: bold;
    }
</style>

<div
    class="space-y-6"
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
    >
<!-- Card 1: 控制台区域（编辑模式开关、颜色选择、控件面板等） -->
<Card>
    <CardHeader>
        <CardTitle>编辑与控件</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
        <div class="mode-switch flex items-center gap-2">
            <label class="flex items-center space-x-2">
                <input type="checkbox" bind:checked={editMode} />
                <span>编辑题目</span>
            </label>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
            <ColorPicker
                    label="选择颜色:"
                    colors={colorsValue.slice(1)}
                    selectedColor={selectedColor}
                    on:select={(e) => (selectedColor = e.detail)}
            />
            <ColorPicker
                    label="目标颜色:"
                    colors={colorsValue.slice(1)}
                    selectedColor={targetColor}
                    on:select={(e) => (targetColor = e.detail)}
            />
        </div>

        <Controls
                maxSteps={maxSteps}
                on:updateSteps={(e) => (maxSteps = e.detail)}
                on:loadExample={loadExample}
                on:clearGrid={clearGrid}
                on:generatePuzzle={generatePuzzle}
                on:fillEmpty={fillEmpty}
                on:solvePuzzle={solvePuzzle}
                on:restorePuzzle={restorePuzzle}
                on:resetMoves={resetMoves}
                isAutoSolved={isAutoSolved}
                editMode={editMode}
                canShowSolution={solution && solution.type === 'success'}
                on:requestShowSolution={handleRequestShowSolution}
        />
    </CardContent>
    <!-- 如果需要在卡片底部加一些状态或按钮，可以用 CardFooter -->
    <CardFooter>
        <!-- 在非编辑模式下，显示当前步数 -->
        {#if !editMode}
            <div class="font-semibold">
                当前步数: {moveHistory.length} / {maxSteps}
            </div>
        {/if}
    </CardFooter>
</Card>

<!-- Card 2: 棋盘区域 -->
<Card>
    <CardHeader>
        <CardTitle>棋盘</CardTitle>
    </CardHeader>
    <CardContent>
        <Grid
                grid={grid}
                colors={colorsValue}
                rows={rows}
                cols={cols}
                on:mousedown={(e) => handleMouseDown(e.detail.row, e.detail.col)}
                on:mouseenter={(e) => handleMouseEnter(e.detail.row, e.detail.col)}
        />
    </CardContent>
</Card>

<!-- Card 3: 解题结果 -->
{#if solution}
    <Card>
        <CardHeader>
            <CardTitle>解题方案</CardTitle>
        </CardHeader>
        <CardContent>
            <Solution
                    solution={solution}
                    steps={solvingSteps}
                    currentStep={currentStep}
                    executeStep={executeStep}
                    showSolution={showSolution}
            />
        </CardContent>
    </Card>
{/if}
</div>
