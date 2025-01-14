<!--src/lib/components/game/DemoCore.svelte-->
<script lang="ts">
    import {Card, CardContent,} from '$lib/components/ui/card';
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType} from '$lib/types';
    import {cloneMatrix, floodFill, floodFillWave, getColors, isGoalState} from '$lib/utils/gridUtils';
    import Grid from "$lib/components/Grid.svelte";
    import SolutionMessage from "$lib/components/game/SolutionMessage.svelte";


    type Props = {
        data: PuzzleDataType;
        closeSolution
    }

    let {data, closeSolution}: Props = $props();

    let currentStep = $state(0);
    let grid: number[][] = $state(data.grid);
    let originalGrid: number[][] = $derived(data.grid);
    let stepGrids: number[][][] = $derived.by(() => {
        const result = [cloneMatrix(originalGrid)];
        let tempGrid = cloneMatrix(originalGrid);
        for (let step of data.solutionSteps) {
            const {A, position} = step;
            tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
            result.push(cloneMatrix(tempGrid));
        }
        return result;
    })
    $effect(() => {
        grid = data.grid;
    })


    // 要把所有格子最终变成的目标颜色
    let targetColor = $state(data.targetColor);
    // 最大步数
    let maxSteps = $state(data.maxSteps);
    let solution = $derived({type: 'success', steps: data.solutionSteps});
    let solvingSteps = $derived(data.solutionSteps);
    // 当前选的刷子颜色（1表示蓝色，对应 colorsValue[1]）
    let selectedColor = $state(1);

    // 记录玩家手动移动历史（仅在游戏模式下使用）
    let moveHistory: Move[] = $state([]);

    // 一些控制画板的配置
    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);


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


    let gridWidth: number;

</script>


<div
        class="flex flex-col md:flex-row gap-4 mt-5"
        role="none"
>
    <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <Card>
            <CardContent>
                <SolutionMessage
                        currentStep={currentStep}
                        nextStep={nextStep}
                        prevStep={prevStep}
                        solution={solution}
                        steps={solvingSteps}
                        {closeSolution}
                />
                <Grid
                        bind:gridWidth={gridWidth}
                        colors={getColors()}
                        cols={cols}
                        grid={grid}
                        rows={rows}
                />
            </CardContent>
        </Card>
    </div>
</div>
