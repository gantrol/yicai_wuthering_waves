<!--/* File: src/lib/components/game/SolutionCore.svelte */-->
<script lang="ts">
    import {Card, CardContent,} from '$lib/components/ui/card';
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType, BFSResult, Step} from '$lib/types';
    import {cloneMatrix, floodFill, floodFillWave, getColors, isGoalState, LOCKED_CELL_VALUE} from '$lib/utils/gridUtils';
    import Grid from "$lib/components/Grid.svelte";
    import SolutionMessage from "$lib/components/game/SolutionMessage.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import {t} from '$lib/translations';

    type Props = {
        data: PuzzleDataType;
        closeSolution?: () => void;
    }

    let {data, closeSolution}: Props = $props();

    let originalGrid: number[][] = $derived(data.grid);

    let stepGrids: number[][][] = $derived.by(() => {
        if (!data.solutionSteps) return [cloneMatrix(originalGrid)];
        const result = [cloneMatrix(originalGrid)];
        let tempGrid = cloneMatrix(originalGrid);
        for (let step of data.solutionSteps) {
            const {A, position} = step;
            tempGrid = floodFill(cloneMatrix(tempGrid), A, position[0], position[1]);
            result.push(cloneMatrix(tempGrid));
        }
        return result;
    })

    let solution = $state<BFSResult | null>(null);
    let solvingSteps = $state<Step[]>([]);
    let currentStep = $state(0);

    let isLoading = $state(false);

    let grid = $state(cloneMatrix(data.grid));

    let targetColor = $derived(data.targetColor);
    let maxSteps = $derived(+data.maxSteps);

    let isAnimatingStep = $state(false);

    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);

    let worker: Worker | null = null;

    $effect(() => {
        if (!data.solutionSteps || data.solutionSteps.length === 0) {
            solvePuzzleInWorker(cloneMatrix(data.grid), targetColor, maxSteps);
        } else {
            solution = {type: 'success', steps: data.solutionSteps};
            solvingSteps = data.solutionSteps;
            grid = cloneMatrix(data.grid);
            currentStep = 0;
        }
    });

    function solvePuzzleInWorker(workerGrid: number[][], workerTargetColor: number, workerMaxSteps: number) {
        if (typeof window === 'undefined') return;

        if (worker) {
            worker.terminate();
        }

        worker = new Worker(new URL('$lib/utils/solverWorker.ts', import.meta.url), {
            type: 'module'
        });

        worker.addEventListener('message', (e: MessageEvent) => {
            const result = e.data as BFSResult;
            isLoading = false;

            if (result.type === 'success' && result.steps) {
                solution = result;
                solvingSteps = result.steps;
                currentStep = 0;
                grid = cloneMatrix(data.grid);
            } else {
                solution = result;
                solvingSteps = [];
                toast(result.message || t('common.solve_error', {maxSteps: workerMaxSteps}), 'error');
            }
        });

        worker.addEventListener('error', (e) => {
            isLoading = false;
            solution = { type: 'failure', message: `Worker error: ${e.message}`};
            solvingSteps = [];
            toast(`Worker error: ${e.message}`, 'error');
        });

        isLoading = true;
        worker.postMessage({
            grid: cloneMatrix(workerGrid),
            targetColor: workerTargetColor,
            maxSteps: workerMaxSteps
        });
    }

    $effect(() => {
        return () => {
            if (worker) {
                worker.terminate();
                worker = null;
            }
        };
    });

    function nextStep() {
        if (!solution || !solvingSteps || isAnimatingStep || currentStep >= solvingSteps.length) return;

        isAnimatingStep = true;
        const step = solvingSteps[currentStep];

        const [row, col] = step.position;
        const oldColor = grid[row][col];

        if (oldColor === LOCKED_CELL_VALUE || oldColor === step.A) {
            currentStep++;
            isAnimatingStep = false;
            if (currentStep < solvingSteps.length) {
                grid = getGridAtStep(currentStep);
            } else if (currentStep === solvingSteps.length) {
                grid = getGridAtStep(currentStep);
            }
            return;
        }

        const waveLayers = floodFillWave(cloneMatrix(grid), row, col, oldColor);
        let animationCompleted = false;
        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                if (animationCompleted) return;
                const currentGrid = cloneMatrix(grid);
                for (const [r, c] of layer) {
                    currentGrid[r][c] = step.A;
                }
                grid = currentGrid;

                if (layerIndex === waveLayers.length - 1) {
                    currentStep++;
                    isAnimatingStep = false;
                    animationCompleted = true;
                }
            }, layerIndex * 80);
        });
    }

    function prevStep() {
        if (currentStep > 0 && !isAnimatingStep) {
            currentStep--;
            grid = getGridAtStep(currentStep);
        }
    }

    function getGridAtStep(stepIndex: number): number[][] {
        if (stepIndex < 0 || stepIndex > solvingSteps.length) {
            return cloneMatrix(data.grid);
        }
        if (stepIndex === 0) {
            return cloneMatrix(data.grid);
        }
        let temp = cloneMatrix(data.grid);
        for (let i = 0; i < stepIndex; i++) {
            const st = solvingSteps[i];
            if (!st) continue;
            temp = floodFill(temp, st.A, st.position[0], st.position[1]);
        }
        return temp;
    }
</script>

{#if isLoading}
    <LoadingSpinner text={$t('common.loading')}/>
{:else}
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
                            cols={cols}
                            grid={grid}
                            rows={rows}
                            readonly={true}
                    />
                </CardContent>
            </Card>
        </div>
    </div>

{/if}
