<!--src/lib/components/game/DemoCore.svelte-->
<script lang="ts">
    import {Card, CardContent,} from '$lib/components/ui/card';
    import {toast} from "$lib/stores/toast";
    import type {Move, PuzzleDataType} from '$lib/types';
    import {cloneMatrix, floodFill, floodFillWave, getColors, isGoalState} from '$lib/utils/gridUtils';
    import Grid from "$lib/components/Grid.svelte";
    import SolutionMessage from "$lib/components/game/SolutionMessage.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";


    type Props = {
        data: PuzzleDataType;
        closeSolution
    }

    let {data, closeSolution}: Props = $props();

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

    // ==============================
    //  定义内部状态 (Svelte 5: runes)
    // ==============================
    // 3.1 解答和步骤
    let solution = $state<BFSResult | null>(null);
    let solvingSteps = $state<Step[]>([]);
    let currentStep = $state(0);

    // 3.2 控制是否正在Loading
    let isLoading = $state(false);

    // 3.3 组件内使用的临时网格(用于演示动画或回放)
    let grid = $state(cloneMatrix(data.grid));

    // 提取 targetColor 和 maxSteps
    // 如果 data.maxSteps 可能是 string，需要转成 number
    let targetColor = $derived(data.targetColor);
    let maxSteps = $derived(+data.maxSteps);

    // 是否正在播放某一步动画
    let isAnimatingStep = $state(false);
    // 要把所有格子最终变成的目标颜色
    // 最大步数
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

    // ==============================
    //  4. Worker 相关
    // ==============================
    let worker: Worker | null = null;

    // ==============================
    //  5. 组件加载后，如果没有现成 solutionSteps，就启动 Worker 计算
    // ==============================
    $effect(() => {
        // 如果 data.solutionSteps 为空或长度为0，尝试自动求解
        if (!data.solutionSteps || data.solutionSteps.length === 0) {
            solvePuzzleInWorker(cloneMatrix(data.grid), targetColor, maxSteps);
        } else {
            // 否则直接用现成答案
            solution = {type: 'success', steps: data.solutionSteps};
            solvingSteps = data.solutionSteps;
        }
    });

    // ==============================
    //  6. 调用 Worker 求解
    // ==============================
    function solvePuzzleInWorker(grid: number[][], targetColor: number, maxSteps: number) {
        // 注意 SSR 环境下没有 window 对象
        if (typeof window === 'undefined') return;

        if (!worker) {
            worker = new Worker(new URL('$lib/utils/solverWorker.ts', import.meta.url), {
                type: 'module'
            });

            // 监听 worker 返回的计算结果
            worker.addEventListener('message', (e: MessageEvent) => {
                const result = e.data as BFSResult;
                isLoading = false;

                if (result.type === 'success' && result.steps) {
                    solution = result;
                    solvingSteps = result.steps;
                    // 默认重置到第0步
                    currentStep = 0;
                    // 同时更新 grid，展示初始状态
                    grid = cloneMatrix(data.grid);
                } else {
                    // 失败或出错
                    solution = result; // 里面有 message
                    solvingSteps = [];
                    toast('没有求出解，或者发生错误', 'error');
                }
            });
        }

        // 发消息给 Worker 开始计算
        isLoading = true;
        worker.postMessage({
            grid: cloneMatrix(grid),
            targetColor,
            maxSteps
        });
    }

    // ==============================
    //  7. 回放功能 (nextStep / prevStep)
    // ==============================
    function nextStep() {
        if (!solution || !solvingSteps || isAnimatingStep) return;
        if (currentStep >= solvingSteps.length) return;

        isAnimatingStep = true;
        const step = solvingSteps[currentStep];

        // 获取当前位置、原色
        const [row, col] = step.position;
        const oldColor = grid[row][col];

        // 用 floodFillWave 演示“波浪染色”动画
        const waveLayers = floodFillWave(cloneMatrix(grid), row, col, oldColor);
        waveLayers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                // 把该 wave layer 的所有格子染成 step.A
                for (const [r, c] of layer) {
                    grid[r][c] = step.A;
                }
                grid = cloneMatrix(grid);

                // 最后一层染完后，进入下一步
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
            // 回退后，重新把 grid 恢复到 currentStep 时刻
            grid = getGridAtStep(currentStep);
        }
    }

    // 根据 stepIndex 获取那一步之后的网格
    function getGridAtStep(stepIndex: number): number[][] {
        let temp = cloneMatrix(data.grid);
        for (let i = 0; i < stepIndex; i++) {
            const st = solvingSteps[i];
            temp = floodFill(temp, st.A, st.position[0], st.position[1]);
        }
        return temp;
    }
</script>

{#if isLoading}
    <LoadingSpinner text="正在计算……"/>
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
                            colors={getColors()}
                            cols={cols}
                            grid={grid}
                            rows={rows}
                    />
                </CardContent>
            </Card>
        </div>
    </div>

{/if}
