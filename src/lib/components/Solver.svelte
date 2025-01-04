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
            // 第 0 张快照是当前网格
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

    // 处理 Controls 组件触发的 requestShowSolution 事件
    function handleRequestShowSolution() {
        showSolution();
    }
</script>

<div
        class="flex flex-col md:flex-row gap-4"
        on:mouseup={handleMouseUp}
        on:mouseleave={handleMouseUp}
>
    <!-- 左边区域：编辑控件 + 棋盘 -->
    <div class="flex-1 flex flex-col gap-4">
        <!-- Card 1: 控制台区域（编辑模式开关、颜色选择等） -->
        <Card>
            <CardContent class="space-y-4">
                <div class="mode-switch flex items-center gap-2">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" bind:checked={editMode} />
                        <span>编辑题目</span>
                    </label>
                </div>
                <div class="flex flex-col sm:flex-row gap-4">
                    <ColorPicker
                            label="最终颜色:"
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
                />
            </CardContent>
            <CardFooter>
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
                <div class="flex flex-col sm:flex-row gap-4">
                    <ColorPicker
                            label="当前颜色:"
                            colors={colorsValue.slice(1)}
                            selectedColor={selectedColor}
                            on:select={(e) => (selectedColor = e.detail)}
                    />
                </div>
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
    </div>

    <!-- 右边区域：解题方案 (仅在 solution 存在时显示) -->
    {#if solution}
        <div class="w-full md:w-[320px] flex-shrink-0">
            <Card>
                <CardHeader>
                    <CardTitle>解题方案</CardTitle>
                </CardHeader>
                <CardContent>
                    <Solution
                            solution={solution}
                            steps={solvingSteps}
                            currentStep={currentStep}
                            prevStep={prevStep}
                            nextStep={nextStep}
                            showSolution={showSolution}
                    />
                </CardContent>
            </Card>
        </div>
    {/if}
</div>
