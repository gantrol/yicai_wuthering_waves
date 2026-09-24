<!--/* File: src/lib/components/game/PlayCore.svelte */-->
<script lang="ts">
    import {goto} from "$app/navigation";
    import { page } from '$app/state';
    import {Button} from '$lib/components/ui/button';
    import {Card, CardContent,} from '$lib/components/ui/card';
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType} from '$lib/types';
    import {cloneMatrix, floodFillWave, getColors, getColorsForPicker, isGoalState, LOCKED_CELL_VALUE} from '$lib/utils/gridUtils';
    import {encodePuzzleV2} from "$lib/utils/shareUtilsV2";
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import Share from 'lucide-svelte/icons/share';
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Edit2, Gamepad2} from "lucide-svelte";
    import {t} from "$lib/translations";
    import Eye from "lucide-svelte/icons/eye";

    type Props = {
        data: PuzzleDataType;
    }

    let props: Props = $props();

    let data = $derived(props.data);
    let currentStep = $state(0);

    $effect(() => {
        grid = data.grid;
        resetMoves();
        closeSolution();
    })
    let grid: number[][] = $state(data.grid);
    let originalGrid: number[][] = $derived(data.grid);

    let targetColor = $derived(data.targetColor);
    let maxSteps = $derived(+data.maxSteps);

    let selectedColor = $state(1);

    let moveHistory: Move[] = $state([]);

    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);

    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
    }

    let baseUrl = "";
    if (typeof window !== "undefined") {
        baseUrl = window.location.origin;
    }

    async function handleShare() {
        const code = encodePuzzleV2(targetColor, maxSteps, originalGrid);
        const shareUrl = `${baseUrl}/edit/share/v2/${code}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast($t('common.share_link_copied'), "success");
        } catch (e) {
            toast("复制失败，请手动复制链接：" + shareUrl, "error");
            console.error("Share failed:", e);
        }
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
                toast(`恭喜！您用了 ${moveHistory.length} 步完成了游戏！`, "success");
            }, 100);
        } else if (moveHistory.length >= maxSteps) {
            setTimeout(() => {
                toast($t('common.game_over'), "error");
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

    function gotoEdit() {
        const currentPath = page.url.pathname;
        if (currentPath.startsWith('/edit')) return;
        if (currentPath.startsWith('/share/v2/')) {
            goto(`/edit/share/v2/${page.params.code}`);
        } else if (currentPath.startsWith('/puzzles/')) {
            goto(`/edit/puzzles/${page.params.id}`);
        } else {
            goto(`/edit`);
        }
    }

    function goBackFromEdit() {
        const currentPath = page.url.pathname;
        if (!currentPath.startsWith('/edit')) return;
        const gamePath = currentPath.replace('/edit', '');
        goto(gamePath);
    }
    let isPathContainsEdit = $derived(page.url.pathname.startsWith('/edit'));
</script>

{#if showSolution}
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

            <Card>
                <CardContent>
                    <StepCounter
                            maxSteps={maxSteps}
                            moveHistory={moveHistory}
                    >
                        {#if isPathContainsEdit}
                            <Button
                                    variant="ghost"
                                    size="icon"
                                    onclick={goBackFromEdit}
                                    class="group"
                                    aria-label="Return to Game"
                                    title="Return to Game"
                            >
                                <Gamepad2 class="h-4 w-4" />
                                <span class="hidden">返回游戏</span>
                            </Button>
                        {:else}
                            <Button
                                    variant="ghost"
                                    size="icon"
                                    onclick={gotoEdit}
                                    class="group"
                                    aria-label="Edit Puzzle"
                                    title="Edit Puzzle"
                            >
                                <Edit2 class="h-4 w-4"/>
                                <span class="hidden">去编辑</span>
                            </Button>
                        {/if}
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

                            <Button class="group mr-1.5" onclick={handleShare} variant="secondary"
                                    aria-label={$t('common.share_puzzle')}
                                    title={$t('common.share_puzzle')}
                            >
                                <Share class="h-4 w-4"/>
                                <span class="hidden">{$t('common.share_puzzle')}</span>
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
                            cols={cols}
                            grid={grid}
                            mousedown={(e) => handleMouseDown(e.row, e.col)}
                            rows={rows}
                            readonly={isAnimating}
                    />
                </CardContent>
            </Card>
        </div>
    </div>
{/if}
