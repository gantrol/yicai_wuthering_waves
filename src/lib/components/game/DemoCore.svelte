<!--src/lib/components/game/DemoCore.svelte-->
<script lang="ts">
    import {Card, CardContent,} from '$lib/components/ui/card';
    import {toast} from "$lib/stores/toast";
    import type {BFSResult, Move, PuzzleDataType, Step} from '$lib/types';
    import {
        cloneMatrix,
        floodFill,
        floodFillWave,
        getColors,
        getColorsForPicker,
        isGoalState
    } from '$lib/utils/gridUtils';
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import ColorButton from "$lib/components/ColorButton.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";

    export let puzzleData: PuzzleDataType;
    export let currentStep = 0;

    let isAutoPlay = true;

    export function executeNextStep() {
        if (!solution || !solvingSteps || currentStep >= solvingSteps.length) return;

        const step = solvingSteps[currentStep];
        const [row, col] = step.position;
        // 选择颜色 step.A
        selectedColor = step.A;
        // 执行染色动画
        animateWaveFill(row, col, step.A);
    }

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
    // BFS 的每一步 (避免 undefined by defaulting to [])
    let solvingSteps: Step[] = [];
    // BFS 每一步对应的 grid（只在无动画的 next/prevStep 用到）
    let stepGrids: number[][][] = [];
    let isAutoSolved = false;

    // 当前选的刷子颜色（1表示蓝色，对应 colorsValue[1]）
    let selectedColor = 1;

    // 记录玩家手动移动历史（仅在游戏模式下使用）
    let moveHistory: Move[] = [];

    // 一些控制画板的配置
    let rows = 8;
    let cols = 10;

    // 当 puzzleData 改变时，初始化 grid/targetColor/maxSteps/solutionSteps 等
    $: if (puzzleData) {
        initPuzzle(puzzleData);
    }

    // 将 puzzleData 初始化到本组件内部的状态
    function initPuzzle(data: PuzzleDataType) {
        grid = cloneMatrix(data.grid);
        originalGrid = cloneMatrix(data.grid);

        // 这里可能是字符串，需要转为数字
        targetColor = +data.targetColor;
        maxSteps = +data.maxSteps;

        // 如果已经有解法
        if (data.solutionSteps && data.solutionSteps.length > 0) {
            solution = {type: 'success', steps: data.solutionSteps};
            solvingSteps = data.solutionSteps;
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of data.solutionSteps) {
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

        // 每次切换 puzzle 时，也要清空 moveHistory
        moveHistory = [];
        selectedColor = 1;
    }

    $: externalCurrentStep = currentStep;

    $: if (externalCurrentStep === 0) {
        resetDemo();
    }


    // 新增: 重置演示状态的方法
    export function resetDemo() {
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
        moveHistory = [];

        // 如果有解法步骤,重置相关状态
        if (solution?.steps) {
            stepGrids = [cloneMatrix(grid)];
            let tempGrid = cloneMatrix(grid);
            for (let step of solution.steps) {
                const {A, position} = step;
                tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
                stepGrids.push(cloneMatrix(tempGrid));
            }
        }
    }

    // ----------------------------
    //   2. 拖拽、颜色变更相关
    // ----------------------------

    function tryMove(row: number, col: number) {
        if (editMode) {
            changeColor(row, col);
        } else {
            animateWaveFill(row, col, selectedColor);
        }
    }

    function changeColor(row: number, col: number) {
        grid[row][col] = selectedColor;
        // 手动触发 svelte 更新
        grid = cloneMatrix(grid);
    }

    function checkWinCondition() {
        if (isGoalState(grid, targetColor)) {
            setTimeout(() => {
                toast(`恭喜！您用了 ${moveHistory.length} 步完成了游戏！`, "success");
            }, 100);
        } else if (moveHistory.length >= maxSteps) {
            setTimeout(() => {
                toast('已达到最大步数限制，请重试！', "error");
            }, 100);
        }
    }

    // ----------------------------
    //   求解逻辑
    // ----------------------------
    export function animateWaveFill(row: number, col: number, newColor: number) {
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
                if (layerIndex === waveLayers.length - 1 && !isAutoPlay) {
                    checkWinCondition();
                }
            }, layerIndex * 80);
        });
    }


    let gridWidth: number;

    function handleGridWidthChange(event: CustomEvent) {
        gridWidth = event.detail;
    }
</script>


<div
        class="flex flex-col md:flex-row gap-4 mt-5"
        class:pointer-events-none={isAutoPlay}
        role="none"
>
    <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <Card>
            <CardContent>
                <StepCounter
                        gridWidth={gridWidth}
                        maxSteps={maxSteps}
                        moveHistory={moveHistory}
                />
                <div class="flex flex-col justify-between sm:flex-row gap-4" style="max-width: {gridWidth}px">
                    <ColorPicker
                            colors={getColorsForPicker()}
                            label="染色刷"
                            select={(i) => (selectedColor = i)}
                            selectedColor={selectedColor}
                    />
                    <div class="flex items-center gap-4">
                        <span class="text-sm font-medium leading-none">全染成</span>
                        <TargetColorButton
                                index={targetColor}
                        ></TargetColorButton>
                    </div>
                </div>
                <Grid
                        colors={getColors()}
                        cols={cols}
                        grid={grid}
                        on:widthChange={handleGridWidthChange}
                        readonly={isAutoPlay}
                        rows={rows}
                />
            </CardContent>
        </Card>
    </div>
</div>
