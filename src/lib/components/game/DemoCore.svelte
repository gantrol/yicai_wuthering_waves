<!--/* File: src/lib/components/game/DemoCore.svelte */-->
<script lang="ts">
    import { Card, CardContent } from "$lib/components/ui/card";
    import { toast } from "$lib/stores/toast";
    import type { BFSResult, Move, PuzzleDataType, Step } from "$lib/types";
    import {
        cloneMatrix,
        floodFillWave,
        getColors,
        getColorsForPicker,
        isGoalState,
        LOCKED_CELL_VALUE
    } from "$lib/utils/gridUtils";
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import {t} from "$lib/translations";

    let { currentStep, puzzleData } = $props();

    let isAutoPlay = true;

    export function executeNextStep() {
        if (!solution || !solvingSteps || currentStep >= solvingSteps.length)
            return;

        const step = solvingSteps[currentStep];
        const [row, col] = step.position;
        selectedColor = step.A;
        animateWaveFill(row, col, step.A);
    }

    export function resetDemo() {
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
        moveHistory = [];
    }

    let grid: number[][] = $state([[]]);
    let originalGrid: number[][] = $state([]);

    let targetColor = $state(1);
    let maxSteps = $state(3);

    let solution: BFSResult | undefined = undefined;
    let solvingSteps: Step[] = [];

    let selectedColor = $state(1);

    let moveHistory: Move[] = $state([]);

    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);

    $effect(() => {
        if (puzzleData) {
            initPuzzle(puzzleData);
        }
    });

    function initPuzzle(data: PuzzleDataType) {
        grid = cloneMatrix(data.grid);
        originalGrid = cloneMatrix(data.grid);

        targetColor = +data.targetColor;
        maxSteps = +data.maxSteps;

        if (data.solutionSteps && data.solutionSteps.length > 0) {
            solution = { type: "success", steps: data.solutionSteps };
            solvingSteps = data.solutionSteps;
            currentStep = 0;
        } else {
            solution = undefined;
            solvingSteps = [];
            currentStep = 0;
        }

        moveHistory = [];
        selectedColor = 1;
    }

    function checkWinCondition() {
        if (isGoalState(grid, targetColor)) {
            setTimeout(() => {
                toast(`恭喜！您用了 ${moveHistory.length} 步完成了游戏！`, "success");
            }, 100);
        } else if (moveHistory.length >= maxSteps) {
            setTimeout(() => {
                toast($t('common.game_over'), "error");
            }, 100);
        }
    }

    export function animateWaveFill(
        row: number,
        col: number,
        newColor: number,
    ) {
        if (moveHistory.length >= maxSteps) return;
        const oldColor = grid[row][col];
        if (oldColor === LOCKED_CELL_VALUE || oldColor === newColor) return;

        moveHistory.push({
            position: [row, col],
            color: newColor,
            oldColor,
        });
        moveHistory = moveHistory;

        const tempGrid = cloneMatrix(grid);
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                for (const [r, c] of layer) {
                    grid[r][c] = newColor;
                }
                grid = cloneMatrix(grid);

                if (layerIndex === waveLayers.length - 1 && !isAutoPlay) {
                    checkWinCondition();
                }
            }, layerIndex * 80);
        });
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
                <StepCounter {maxSteps} {moveHistory} />
                <div class="flex flex-col justify-between sm:flex-row gap-4">
                    <ColorPicker
                            colors={getColorsForPicker()}
                            label={$t('common.select_color')}
                            select={(i) => (selectedColor = i)}
                            {selectedColor}
                    />
                    <div class="flex items-center gap-4">
                        <span class="text-sm font-medium leading-none"
                        >{$t('common.target_color')}</span
                        >
                        <TargetColorButton index={targetColor}
                        ></TargetColorButton>
                    </div>
                </div>
                <Grid
                        colors={getColors()}
                        {cols}
                        {grid}
                        readonly={isAutoPlay}
                        {rows}
                />
            </CardContent>
        </Card>
    </div>
</div>
