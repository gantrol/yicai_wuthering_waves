<!-- src/lib/components/game/PlayCore.svelte -->
<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {Card, CardContent,} from '$lib/components/ui/card';
    import ColorPicker from "$lib/components/ColorPicker.svelte";
    import {toast} from "$lib/stores/toast";
    import type {Move} from '$lib/types';
    import {cloneMatrix, floodFillWave, getColors, getColorsForPicker, isGoalState} from '$lib/utils/gridUtils';
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import StepCounter from "$lib/components/game/StepCounter.svelte";
    import Grid from "$lib/components/Grid.svelte";
    import TargetColorButton from "$lib/components/TargetColorButton.svelte";
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Shuffle} from "lucide-svelte";
    import {onMount} from "svelte";
    import {t} from "$lib/translations";


    let data = $state({
        grid:[[]],
        targetColor: 1,
        maxSteps: 4,
    });
    let grid: number[][] = $state(data.grid);
    let originalGrid: number[][] = $derived(data.grid);
    let targetColor = $derived(data.targetColor);
    let maxSteps = $derived(data.maxSteps);
    let rows = $derived(grid.length);
    let cols = $derived(grid[0].length);
    $effect(() => {
        grid = data.grid;
        resetMoves();
        closeSolution();
    })

    let selectedColor = $state(1);
    let currentStep = $state(0);
    let moveHistory: Move[] = $state([]);
    let puzzleList: PuzzleItem[] = $state([]);

    // ----------------------------
    //   1. 常用编辑/操作函数
    // ----------------------------
    function resetMoves() {
        moveHistory = [];
        grid = cloneMatrix(originalGrid);
        currentStep = 0;
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

    // 组件挂载时先拉取 list.json
    onMount(async () => {
        await loadPuzzleList();
        // 默认第一次挂载时就随机获取一个
        await loadRandomPuzzle();
    });

    // 拉取 list.json
    async function loadPuzzleList() {
        try {
            const res = await fetch('/puzzles_json/list.json');
            if (!res.ok) {
                throw new Error('加载 list.json 失败');
            }
            puzzleList = await res.json();
        } catch (err) {
            console.error(err);
            toast('加载题目列表失败', 'error');
        }
    }

    // TODO: loading
    async function loadRandomPuzzle() {
        try {
            if (puzzleList.length === 0) {
                toast('当前题目列表为空', 'error');
                return;
            }
            const randomIndex = Math.floor(Math.random() * puzzleList.length);
            const chosen = puzzleList[randomIndex];

            // 因为我们真实的网格题目（grid、targetColor、maxSteps 等）还在 /puzzles_json/{id}.json 文件里
            // 根据 chosen.id 拼出路径来加载
            const puzzleUrl = `/puzzles_json/${chosen.id}.json`;
            const res = await fetch(puzzleUrl);
            if (!res.ok) {
                throw new Error(`加载 puzzle ${chosen.id} 失败`);
            }
            data = await res.json();
        } catch (err) {
            console.error(err);
            toast('加载随机题目失败', 'error');
        }
    }
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
                        <Button
                                variant="ghost"
                                class="group"
                                size="icon"
                                onclick={loadRandomPuzzle}
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
                                    class="group mr-1.5">
                                <div class="h-4 w-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </div>
                                <span class="hidden">{$t('common.solve_hint')}</span>
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
