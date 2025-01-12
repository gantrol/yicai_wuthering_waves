<script>
    import {onDestroy, onMount, tick} from "svelte";
    import SolverCore from "$lib/components/SolverCore.svelte";
    import { getDescriptionForSolutionStep } from "$lib/utils/gridUtils";

    let solverRef;
    let demoData;
    let autoPlayTimer;
    let currentStep = 0;

    // 修改自动播放逻辑
    async function startDemo() {
        if (!demoData?.solutionSteps) return;

        await tick();

        if (solverRef) {
            // 开始自动播放
            autoPlayTimer = setInterval(() => {
                if (currentStep >= demoData.solutionSteps.length) {
                    // 重置演示
                    currentStep = 0;
                    solverRef.resetDemo();
                } else {
                    solverRef.executeNextStep();
                    currentStep++;
                }
            }, 4000);
        }
    }

    onMount(async () => {
        try {
            const response = await fetch('/puzzles_json/槲生半岛青栎庭院右.json');
            if (!response.ok) throw new Error('Failed to load demo data');
            demoData = await response.json();

            // 等待下一个tick确保组件已渲染
            await tick();
            await startDemo();
        } catch (error) {
            console.error('Demo initialization failed:', error);
        }
    });


    onDestroy(() => {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
        }
    });
</script>


<div class="max-w-6xl mx-auto">
    <div class="relative rounded-2xl shadow-2xl">
        {#if demoData}
            <SolverCore
                    bind:this={solverRef}
                    puzzleData={demoData}
                    editMode={false}
                    isAutoPlay={true}
                    currentStep={currentStep}
            />

            <div class="absolute top-4 right-4 bg-background/95 p-6 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">

                <h3 class="font-bold text-lg mb-3">
                    {#if currentStep === 0}
                        观察棋盘
                    {:else}
                        第 {currentStep} 步
                    {/if}
                </h3>

                <p class="text-muted-foreground">
                    {#if currentStep === 0}
                        一步染一片，三步内染成黄色
                    {:else}
                        {getDescriptionForSolutionStep(demoData.solutionSteps[currentStep - 1])}
                    {/if}
                </p>
            </div>
        {/if}
    </div>
</div>
