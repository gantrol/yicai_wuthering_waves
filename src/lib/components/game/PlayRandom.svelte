<!--/* File: src/lib/components/game/PlayRandom.svelte */-->
<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {Card, CardContent,} from '$lib/components/ui/card';
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType} from '$lib/types';
    import {cloneMatrix, floodFillWave, getColors, getColorsForPicker, isGoalState, LOCKED_CELL_VALUE} from '$lib/utils/gridUtils';
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Shuffle} from "lucide-svelte";
    import {onMount} from "svelte";
    import {t} from "$lib/translations";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import Eye from "lucide-svelte/icons/eye";

    interface PuzzleItem { id: string | number; /* other fields */ }

    let data = $state<PuzzleDataType | null>(null);
    let grid: number[][] = $state([[]]);
    let originalGrid: number[][] = $state([[]]);
    let targetColor = $state(1);
    let maxSteps = $state(4);
    let rows = $derived(grid.length);
    let cols = $derived(grid[0]?.length ?? 0);
    let isLoadingPuzzle = $state(true);

    $effect(() => {
        if(data){
            grid = data.grid;
            originalGrid = cloneMatrix(data.grid);
            targetColor = data.targetColor;
            maxSteps = +data.maxSteps;
            resetMoves();
            closeSolution();
        } else {
            grid = [[]];
            originalGrid = [[]];
            targetColor = 1;
            maxSteps = 4;
        }
    })

    let selectedColor = $state(1);
    let currentStep = $state(0);
    let moveHistory: Move[] = $state([]);
    let puzzleList: PuzzleItem[] = $state([]);

    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
    }

    function handleMouseDown(row: number, col: number) {
        tryMove(row, col);
    }

    function tryMove(row: number, col: number) {
        animateWaveFill(row, col, selectedColor);
    }

    function checkWinCondition() {
        if (isGoalState(grid, targetColor)) {
            setTimeout(() => {
                toast(t('common.you_win_in', {count: moveHistory.length}), "success");
            }, 100);
        } else if (moveHistory.length >= maxSteps) {
            setTimeout(() => {
                toast(t('common.game_over'), "error");
            }, 100);
        }
    }

    let isAnimating = $state(false);

    const animateWaveFill = async (row: number, col: number, newColor: number) => {
        if (moveHistory.length >= maxSteps || isAnimating) return;
        const oldColor = grid[row][col];
        if (oldColor === LOCKED_CELL_VALUE || oldColor === newColor) return;
        isAnimating = true;

        moveHistory = [...moveHistory,
            {
                position: [row, col],
                color: newColor,
                oldColor
            }];

        const tempGrid = cloneMatrix(grid);
        const waveLayers = floodFillWave(tempGrid, row, col, oldColor);

        for (let i = 0; i < waveLayers.length; i++) {
            const layer = waveLayers[i];
            await new Promise(resolve => setTimeout(() => {
                const newGrid = cloneMatrix(grid);
                for (const [r, c] of layer) {
                    newGrid[r][c] = newColor;
                }
                grid = newGrid;
                if (i === waveLayers.length - 1) {
                    checkWinCondition();
                    isAnimating = false;
                }
                resolve();
            }, 30 * Math.log(i + 1)));
        }
    }


    let showSolution = $state(false);

    function openSolution() {
        showSolution = true;
    }

    function closeSolution() {
        showSolution = false;
    }

    onMount(async () => {
        await loadPuzzleList();
        await loadRandomPuzzle();
    });

    async function loadPuzzleList() {
        try {
            const res = await fetch('/puzzles_json/list.json');
            if (!res.ok) {
                throw new Error($t('common.load_fail', {error: 'list.json'}));
            }
            puzzleList = await res.json();
        } catch (err) {
            console.error(err);
            toast($t('common.load_fail', {error: err.message}), 'error');
        }
    }

    async function loadRandomPuzzle() {
        isLoadingPuzzle = true;
        data = null;
        try {
            if (puzzleList.length === 0) {
                toast($t('common.no_puzzles'), 'warning');
                return;
            }
            const randomIndex = Math.floor(Math.random() * puzzleList.length);
            const chosen = puzzleList[randomIndex];

            const puzzleUrl = `/puzzles_json/${chosen.id}.json`;
            const res = await fetch(puzzleUrl);
            if (!res.ok) {
                throw new Error($t('common.load_fail', {error: `${chosen.id}.json`}));
            }
            const puzzleJson = await res.json();
            data = puzzleJson;
        } catch (err) {
            console.error(err);
            toast($t('common.load_fail', {error: err.message}), 'error');
        } finally {
            isLoadingPuzzle = false;
        }
    }
</script>

{#if showSolution && data}
    <SolutionCore
            data={data}
            {closeSolution}
    />
{:else}
    <div
            class="flex flex-col md:flex-row gap-4 mt-5"
            role="none"
    >
        <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
            {#if isLoadingPuzzle}
                <LoadingSpinner text={$t('common.loading')} />
            {:else if data}
                <Card>
                    <CardContent>
                        <StepCounter
                                maxSteps={maxSteps}
                                moveHistory={moveHistory}
                        >
                            <Button
                                    variant="ghost"
                                    class="group"
                                    size="icon"
                                    onclick={loadRandomPuzzle}
                                    aria-label="Load Random Puzzle"
                                    title="Load Random Puzzle"
                            >
                                <Shuffle class="h-4 w-4"/>
                                <span class="hidden">重换</span>
                            </Button>
                        </StepCounter>
                        <div class="flex flex-col justify-between sm:flex-row gap-4">
                            <ColorPicker
                                    colors={getColorsForPicker()}
                                    label={$t('common.select_color')}
                                    select={(i) => (selectedColor = i)}
                                    selectedColor={selectedColor}
                            />
                            <div class="flex">
                                <div class="flex items-center gap-4 mr-5">
                                    <span class="text-sm font-medium leading-none">{$t('common.target_color')}</span>
                                    <TargetColorButton
                                            index={targetColor}
                                    ></TargetColorButton>
                                </div>

                                <Button variant="default"
                                        onclick={openSolution}
                                        class="group mr-1.5"
                                        aria-label={$t('common.solve_hint')}
                                        title={$t('common.solve_hint')}
                                >
                                    <Eye class="h-4 w-4" />
                                    <span class="hidden">{$t('common.solve_hint')}</span>
                                </Button>
                                <Button
                                        class="group"
                                        disabled={moveHistory.length === 0}
                                        onclick={resetMoves}
                                        aria-label="Restart"
                                        title="Restart"
                                >
                                    <RotateCcw class="h-4 w-4"/>
                                    <span class="hidden">重新开始</span>
                                </Button>
                            </div>
                        </div>
                        <Grid
                                colors={getColors()}
                                cols={cols}
                                grid={grid}
                                mousedown={(e) => handleMouseDown(e.row, e.col)}
                                rows={rows}
                                readonly={isAnimating}
                        />
                    </CardContent>
                </Card>
            {:else}
                <div class="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                    {$t('common.load_fail', { error: 'No puzzle data available' })}
                </div>
            {/if}
        </div>
    </div>
{/if}
