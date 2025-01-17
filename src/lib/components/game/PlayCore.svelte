<!-- src/lib/components/game/PlayCore.svelte -->
<script lang="ts">
    import {goto} from "$app/navigation";
    import { page } from '$app/state';
    import {Button} from '$lib/components/ui/button';
    import {Card, CardContent,} from '$lib/components/ui/card';
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType} from '$lib/types';
    import {cloneMatrix, floodFillWave, getColors, getColorsForPicker, isGoalState} from '$lib/utils/gridUtils';
    import {encodePuzzle} from "$lib/utils/shareUtils";
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import Share from 'lucide-svelte/icons/share';
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Edit2, Gamepad2} from "lucide-svelte";

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
    // 实际操作用的网格数据
    let grid: number[][] = $state(data.grid);
    // 原始网格数据（用于“重置”功能）
    let originalGrid: number[][] = $derived(data.grid);

    // 要把所有格子最终变成的目标颜色
    let targetColor = $derived(data.targetColor);
    // 最大步数
    let maxSteps = $derived(+data.maxSteps);


    // 当前选的刷子颜色（1表示蓝色，对应 colorsValue[1]）
    let selectedColor = $state(1);

    // 记录玩家手动移动历史（仅在游戏模式下使用）
    let moveHistory: Move[] = $state([]);

    // 一些控制画板的配置
    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);

    // ----------------------------
    //   1. 常用编辑/操作函数
    // ----------------------------
    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
    }

    // 分享需要URL
    let baseUrl = "";
    if (typeof window !== "undefined") {
        baseUrl = window.location.origin;
    }

    async function handleShare() {
        // puzzleData 里可能还有 solutionSteps，但不需要了
        const code = encodePuzzle(targetColor, maxSteps, originalGrid);
        const shareUrl = `${baseUrl}/share/${code}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast("分享链接已复制到剪贴板！", "success");
        } catch (e) {
            toast("复制失败，请手动复制链接：" + shareUrl, "error");
        }
    }

    // ----------------------------
    //
    // ----------------------------
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
                toast('已达到最大步数限制，请重试！', "error");
            }, 100);
        }
    }

    let isAnimating = $state(false);

    const animateWaveFill = async (row: number, col: number, newColor: number) => {
        if (moveHistory.length >= maxSteps || isAnimating) return;
        const oldColor = grid[row][col];
        if (oldColor === newColor) return;
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
                // TODO: 后续棋盘大小有变化的话，改间隔
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
        goto(`/edit${currentPath}`);
    }

    function goBackFromEdit() {
        const currentPath = page.url.pathname;
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
                            >
                                <Edit2 class="h-4 w-4"/>
                                <span class="hidden">去编辑</span>
                            </Button>
                        {/if}
                    </StepCounter>
                    <div class="flex flex-col justify-between sm:flex-row gap-4">
                        <ColorPicker
                                colors={getColorsForPicker()}
                                label="染色刷"
                                select={(i) => (selectedColor = i)}
                                selectedColor={selectedColor}
                        />
                        <div class="flex">
                            <div class="flex items-center gap-4 mr-5">
                                <span class="text-sm font-medium leading-none">全染成</span>
                                <TargetColorButton
                                        index={targetColor}
                                ></TargetColorButton>
                            </div>


                            <Button variant="default"
                                    onclick={openSolution}
                                    class="group mr-1.5">
                                <div class="h-4 w-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </div>
                                <span class="hidden md:group-hover:inline">看看答案</span>
                            </Button>

                            <Button class="group mr-1.5" onclick={handleShare} variant="secondary">
                                <Share class="h-4 w-4"/>
                                <span class="hidden">分享当前</span>
                            </Button>
                            <Button
                                    class="group"
                                    disabled={moveHistory.length === 0}
                                    onclick={resetMoves}
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
                    />
                </CardContent>
            </Card>
        </div>
    </div>
{/if}
