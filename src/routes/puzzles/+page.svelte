<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import PuzzleIcon from "lucide-svelte/icons/puzzle";
    import StarIcon from "lucide-svelte/icons/star";

    interface Puzzle {
        id: number;
        difficulty?: number; // 1-5 表示难度
        targetColor?: number;
        maxSteps?: number;
    }

    let puzzles: Puzzle[] = [];
    let loading = true;
    let error = null;

    async function loadPuzzles() {
        try {
            const response = await fetch('/puzzles_json/list.json');
            if (!response.ok) throw new Error('无法加载题目列表');
            puzzles = await response.json();

            // 加载每个题目的详细信息
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
        } catch (error) {
            console.error('加载题目列表失败:', error);
        } finally {
            loading = false;
        }
    }

    function getDifficultyStars(difficulty: number = 1) {
        return Array(difficulty).fill('★').join('');
    }

    function getColorName(colorId: number): string {
        const colors = ['空', '蓝', '红', '黄', '绿'];
        return colors[colorId] || '未知';
    }

    onMount(loadPuzzles);
</script>

<div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">题目列表</h1>
        <Button variant="outline" on:click={() => loadPuzzles()}>
            刷新列表
        </Button>
    </div>

    {#if loading}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each Array(6) as _}
                <div class="animate-pulse bg-gray-200 rounded-lg h-48"></div>
            {/each}
        </div>
    {:else if error}
        <div class="text-red-500 p-4 rounded-lg bg-red-50">
            加载失败: {error}
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each puzzles as puzzle (puzzle.id)}
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <PuzzleIcon class="w-5 h-5" />
                                <span>题目 {puzzle.id}</span>
                            </div>
                            {#if puzzle.difficulty}
                                <div class="text-yellow-500">
                                    {getDifficultyStars(puzzle.difficulty)}
                                </div>
                            {/if}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-2">
                            {#if puzzle.targetColor !== undefined}
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-600">目标颜色:</span>
                                    <span>{getColorName(puzzle.targetColor)}</span>
                                </div>
                            {/if}
                            {#if puzzle.maxSteps !== undefined}
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-600">最大步数:</span>
                                    <span>{puzzle.maxSteps}</span>
                                </div>
                            {/if}
                            <Button
                                    class="w-full mt-4"
                                    variant="default"
                                    href={`/puzzles/${puzzle.id}`}
                            >
                                开始解题
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div>
