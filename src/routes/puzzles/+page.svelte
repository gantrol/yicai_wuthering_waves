<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { getColorName } from "$lib/utils/gridUtils";

    interface Puzzle {
        id: number;
        title?: string;
        targetColor?: number;
        maxSteps?: number;
    }

    let puzzles: Puzzle[] = $state([]);
    let loading = $state(true);
    let error = null;

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
</script>

<div class="container mx-auto py-6 px-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">题目列表</h1>
        <Button variant="outline" on:click={loadPuzzles}>
            刷新列表
        </Button>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-10 text-gray-500">
            正在加载题目列表...
        </div>
    {:else if error}
        <div class="text-red-500 p-4 rounded-lg bg-red-50">
            加载失败: {error}
        </div>
    {:else}
        <!-- 大屏幕显示表格 -->
        <div class="hidden md:block">
            <div class="rounded-lg border border-slate-200">
                <table class="w-full text-sm">
                    <thead>
                    <tr class="bg-slate-50">
                        <th class="px-6 py-4 text-left font-medium text-slate-600">标题</th>
                        <th class="px-6 py-4 text-left font-medium text-slate-600">目标颜色</th>
                        <th class="px-6 py-4 text-left font-medium text-slate-600">最大步数</th>
                        <th class="px-6 py-4 text-right font-medium text-slate-600">操作</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                    {#each puzzles as puzzle (puzzle.id)}
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 text-slate-700">
                                {puzzle.title || `第 ${puzzle.id} 题`}
                            </td>
                            <td class="px-6 py-4 text-slate-700">
                                {#if puzzle.targetColor !== undefined}
                                    {getColorName(puzzle.targetColor)}
                                {/if}
                            </td>
                            <td class="px-6 py-4 text-slate-700">
                                {#if puzzle.maxSteps !== undefined}
                                    {puzzle.maxSteps} 步
                                {/if}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <Button
                                        variant="default"
                                        size="sm"
                                        href={`/puzzles/${puzzle.id}`}
                                        class="hover:scale-105 transition-transform"
                                >
                                    开始解题
                                </Button>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 小屏幕显示卡片 -->
        <div class="md:hidden space-y-4">
            {#each puzzles as puzzle (puzzle.id)}
                <div class="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <h3 class="font-medium text-slate-900">
                            {puzzle.title || `第 ${puzzle.id} 题`}
                        </h3>
                    </div>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between">
                            <span class="text-slate-500">目标颜色</span>
                            <span class="text-slate-700">
                                {#if puzzle.targetColor !== undefined}
                                    {getColorName(puzzle.targetColor)}
                                {/if}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">最大步数</span>
                            <span class="text-slate-700">
                                {#if puzzle.maxSteps !== undefined}
                                    {puzzle.maxSteps} 步
                                {/if}
                            </span>
                        </div>
                    </div>
                    <div class="pt-2">
                        <Button
                                variant="default"
                                size="sm"
                                href={`/puzzles/${puzzle.id}`}
                                class="w-full"
                        >
                            开始解题
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
