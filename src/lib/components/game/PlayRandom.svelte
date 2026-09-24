<!--/* File: src/lib/components/game/PlayRandom.svelte */-->
<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {toast} from "$lib/stores/toast";
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Shuffle} from "lucide-svelte";
    import {onMount} from "svelte";
    import {t} from "$lib/translations";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import Eye from "lucide-svelte/icons/eye";
    import { GameSession } from '$lib/game/GameSession.svelte';
    import UnifiedGameControl from "$lib/components/game/UnifiedGameControl.svelte";

    interface PuzzleItem { id: string | number; /* other fields */ }

    let data = $state({
        grid:[[]],
        targetColor: 1,
        maxSteps: 4,
    });

    const gameSession = new GameSession();
    let selectedColor = $state(1);
    let puzzleList: PuzzleItem[] = $state([]);
    let isLoadingPuzzle = $state(true);

    $effect(() => {
        // When data changes, re-init the session
        gameSession.init(data);
        selectedColor = 1;
        closeSolution();
    });

    $effect(() => {
        if (gameSession.status === 'won') {
            setTimeout(() => {
                toast(`恭喜！您用了 ${gameSession.moveHistory.length} 步完成了游戏！`, "success");
            }, 100);
        } else if (gameSession.status === 'lost') {
            setTimeout(() => {
                toast($t('common.game_over'), "error");
            }, 100);
        }
    });

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
        } catch (err: any) {
            console.error(err);
            toast($t('common.load_fail', {error: err.message}), 'error');
        }
    }

    async function loadRandomPuzzle() {
        isLoadingPuzzle = true;
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
        } catch (err: any) {
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
    <div class="flex flex-col md:flex-row gap-4 mt-5" role="none">
        <div class="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
            {#if isLoadingPuzzle}
                <LoadingSpinner text={$t('common.loading')} />
            {:else if data && gameSession.grid.length > 0}
                <UnifiedGameControl
                    {gameSession}
                    bind:selectedColor
                    onColorSelect={(c) => selectedColor = c}
                >
                     <div class="flex items-center gap-2 justify-between w-full">
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

                        <div class="flex ml-auto">
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
                                    disabled={gameSession.moveHistory.length === 0}
                                    onclick={() => gameSession.reset()}
                                    aria-label="Restart"
                                    title="Restart"
                            >
                                <RotateCcw class="h-4 w-4"/>
                                <span class="hidden">重新开始</span>
                            </Button>
                        </div>
                    </div>
                </UnifiedGameControl>
            {:else}
                 <div class="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                    {$t('common.load_fail', { error: 'No puzzle data available' })}
                </div>
            {/if}
        </div>
    </div>
{/if}
