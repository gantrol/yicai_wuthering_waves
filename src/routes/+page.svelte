<!-- src/routes/+page.svelte -->
<script lang="ts">
    import {onMount, onDestroy, tick} from 'svelte';
    import SolverCore from '$lib/components/SolverCore.svelte';
    import type { PuzzleDataType } from '$lib/types';
    import { Button } from '$lib/components/ui/button';
    import { ArrowRight, Palette, Gamepad2, BookOpen, ArrowDown } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { getDescriptionForSolutionStep } from "$lib/utils/gridUtils";

    let demoData: PuzzleDataType;
    let currentStep = 0;
    let autoPlayTimer: NodeJS.Timeout;
    let solverRef: any;

    // 修改自动播放逻辑
    async function startDemo() {
        if (!demoData?.solutionSteps) return;

        // 先确保 solver 完成初始化
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

    function scrollTomore() {
        const demoSection = document.querySelector('#more');
        demoSection?.scrollIntoView({ behavior: 'smooth' });
    }

    onMount(async () => {
        try {
            const response = await fetch('/puzzles_json/槲生半岛青栎庭院右.json');
            if (!response.ok) throw new Error('Failed to load demo data');
            demoData = await response.json();

            // 等待下一个tick确保组件已渲染
            await tick();
            startDemo();
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

<div class="min-h-screen bg-gradient-to-b from-background to-secondary/20">
    <!-- Hero Section -->
    <section class="pt-32 px-4 text-center relative overflow-hidden">
        <!-- 增强的背景装饰效果 -->
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-10 right-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto">
            <h1 class="text-5xl md:text-6xl font-bold mb-16 tracking-tight">
                <span class="bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent animate-fade-in drop-shadow-sm">
                    溢彩画
                </span>
            </h1>

            <!-- 优化按钮样式 -->
            <div class="flex justify-center gap-6 mb-4 animate-slide-up-delayed">
                <Button
                        size="lg"
                        variant="default"
                        class="group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        onclick={() => goto('/random')}
                >
                    开始游戏
                    <ArrowRight class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button
                        size="lg"
                        variant="outline"
                        class="group transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        onclick={scrollTomore}
                >
                    查看更多
                    <ArrowDown class="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                </Button>
            </div>
        </div>
    </section>

    <!-- 优化教程部分 -->
    <section id="how-to-play" class="px-4 bg-secondary/10 backdrop-blur-sm">
        <div class="max-w-6xl mx-auto">
            <div class="relative rounded-2xl shadow-2xl">
                {#if demoData}
                    <SolverCore
                            bind:this={solverRef}
                            puzzleData={demoData}
                            editMode={false}
                            autoPlay={true}
                            currentStep={currentStep}
                    />

                    <div class="absolute top-4 right-4 bg-background/95 p-6 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105">
                        <h3 class="font-bold text-lg mb-3">第 {currentStep + 1} 步</h3>
                        <p class="text-muted-foreground">
                            {#if currentStep === 0}
                                观察棋盘
                            {:else}
                                {getDescriptionForSolutionStep(demoData.solutionSteps[currentStep - 1])}
                            {/if}
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </section>

    <section id="more" class="py-16 px-4 text-center relative overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {#each [
                { icon: Gamepad2, title: '策略性', desc: '运用智慧解决每一个谜题', path: '/random' },
                { icon: Palette, title: '自定义', desc: '创造属于你的独特谜题', path: '/edit' },
                { icon: BookOpen, title: '题库', desc: '丰富的题库与自动解答', path: '/puzzles' }
            ] as { icon, title, desc, path }}
                <div
                        class="bg-background/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-border/50"
                        on:click={() => goto(path)}
                >
                    <div class="text-4xl mb-6 text-primary/80">
                        <svelte:component this={icon} class="mx-auto" />
                    </div>
                    <h3 class="font-bold text-xl mb-3">{title}</h3>
                    <p class="text-muted-foreground">{desc}</p>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 1s ease-out;
    }

    .animate-slide-up {
        animation: slideUp 0.8s ease-out;
    }

    .animate-slide-up-delayed {
        animation: slideUp 0.8s ease-out 0.2s both;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
