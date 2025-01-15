<script lang="ts">
    import {onMount} from 'svelte';
    import {Button} from '$lib/components/ui/button';
    import {derived} from "svelte/store";
    import {getColors, getColorName} from "$lib/utils/gridUtils";
    import {goto} from "$app/navigation";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    interface Puzzle {
        id: number;
        title?: string;
        targetColor?: number;
        maxSteps?: number;
    }

    let puzzles: Puzzle[] = $state([]);
    let loading = $state(true);
    let error = null;

    const colors = getColors();

    let searchQuery = $state('');
    let filterPuzzles = $derived(getFilteredPuzzles(searchQuery))

    async function loadPuzzles() {
        loading = true;
        error = null;
        try {
            const response = await fetch('/puzzles_json/list.json');
            if (!response.ok) throw new Error('无法加载题目列表');
            puzzles = await response.json();

            const detailedPuzzles = await Promise.all(
                puzzles.map(async (puzzle) => {
                    try {
                        const detailResponse = await fetch(`/puzzles_json/${puzzle.id}.json`);
                        if (detailResponse.ok) {
                            const details = await detailResponse.json();
                            return { ...puzzle, ...details };
                        }
                        return puzzle;
                    } catch (e) {
                        return puzzle;
                    }
                })
            );
            puzzles = detailedPuzzles;
        } catch (err) {
            console.error('加载题目列表失败:', err);
            error = err.message;
        } finally {
            loading = false;
        }
    }

    onMount(loadPuzzles);

    // 基于搜索关键词过滤题目
    function getFilteredPuzzles(searchQuery) {
        const keyword = searchQuery?.trim().toLowerCase();
        if (!keyword) {
            return puzzles;
        }

        return puzzles.filter(p => {
            return (p.title).toLowerCase().includes(keyword);
        });
    }
</script>


<div class="min-h-screen bg-white">
    <div class="container mx-auto py-8 px-4">
        <!-- 头部区域 -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0 md:space-x-4">
            <div class="space-y-2">
                <h1 class="text-3xl font-bold text-slate-800">题库</h1>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
                <!-- 搜索框 -->
                <div class="relative">
                    <input
                            type="text"
                            class="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="搜索题目..."
                            bind:value={searchQuery}
                    />
                    <svg class="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <Button
                        variant="outline"
                        onclick={loadPuzzles}
                        class="flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    刷新列表
                </Button>
            </div>
        </div>

        <!-- 加载状态 -->
        {#if loading}
            <LoadingSpinner text="快速拉取题目列表..." />
        {:else if error}
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div class="flex items-center">
                    <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-red-700">加载失败: {error}</span>
                </div>
            </div>
        {:else}
            <!-- 大屏幕表格视图 -->
            <div class="hidden md:block">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table class="w-full text-sm">
                        <thead>
                        <tr class="bg-slate-50">
                            <th class="px-6 py-4 text-left font-semibold text-slate-600">标题</th>
                            <th class="px-6 py-4 text-left font-semibold text-slate-600">目标颜色</th>
                            <th class="px-6 py-4 text-left font-semibold text-slate-600">最大步数</th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                        {#each filterPuzzles as puzzle (puzzle.id)}
                            <tr class="hover:bg-slate-50 cursor-pointer transition-colors"
                                onclick={() => goto(`/puzzles/${puzzle.id}`)}>
                                <td class="px-6 py-4 text-slate-700 font-medium">
                                    {puzzle.title}
                                </td>
                                <td class="px-6 py-4">
                                    {#if puzzle.targetColor !== undefined}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                              style="background-color: {colors[puzzle.targetColor]}; color: {puzzle.targetColor === 3 ? '#000' : '#fff'}">
                                            {getColorName(puzzle.targetColor)}
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-6 py-4">
                                    {#if puzzle.maxSteps !== undefined}
                                        <span class="text-slate-600">{puzzle.maxSteps}</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 小屏幕卡片视图 -->
            <div class="md:hidden grid gap-4">
                {#each filterPuzzles as puzzle (puzzle.id)}
                    <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 space-y-3">
                        <div class="flex justify-between items-start">
                            <h3 class="font-semibold text-slate-800">
                                {puzzle.title || `第 ${puzzle.id} 题`}
                            </h3>
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between items-center">
                                <span class="text-slate-500">目标颜色</span>
                                {#if puzzle.targetColor !== undefined}
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                          style="background-color: {colors[puzzle.targetColor]}; color: {puzzle.targetColor === 3 ? '#000' : '#fff'}">
                                        {getColorName(puzzle.targetColor)}
                                    </span>
                                {/if}
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-slate-500">最大步数</span>
                                {#if puzzle.maxSteps !== undefined}
                                    <span class="text-slate-700">{puzzle.maxSteps} 步</span>
                                {/if}
                            </div>
                        </div>
                        <Button
                                variant="outline"
                                size="sm"
                                href={`/puzzles/${puzzle.id}`}
                                class="w-full mt-2"
                        >
                            开始解题
                        </Button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<svelte:head>
    <title>溢彩画题库</title>
</svelte:head>
