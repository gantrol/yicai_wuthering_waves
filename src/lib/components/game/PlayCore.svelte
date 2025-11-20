<!--/* File: src/lib/components/game/PlayCore.svelte */-->
<script lang="ts">
    import {goto} from "$app/navigation";
    import { page } from '$app/state';
    import {Button} from '$lib/components/ui/button';
    import {toast} from "$lib/stores/toast";
    import type {PuzzleDataType} from '$lib/types';
    import {encodePuzzleV2} from "$lib/utils/shareUtilsV2";
    import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
    import Share from 'lucide-svelte/icons/share';
    import SolutionCore from "$lib/components/game/SolutionCore.svelte";
    import {Edit2, Gamepad2} from "lucide-svelte";
    import {t} from "$lib/translations";
    import Eye from "lucide-svelte/icons/eye";
    import { GameSession } from "$lib/game/GameSession.svelte";
    import UnifiedGameControl from "$lib/components/game/UnifiedGameControl.svelte";

    type Props = {
        data: PuzzleDataType;
    }

    let { data }: Props = $props();

    const gameSession = new GameSession(data);
    let selectedColor = $state(1);

    $effect(() => {
        // When data changes, re-init the session
        gameSession.init(data);
        selectedColor = 1;
        closeSolution();
    });

    $effect(() => {
        // Watch for game status changes to show toasts
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

    let baseUrl = "";
    if (typeof window !== "undefined") {
        baseUrl = window.location.origin;
    }

    async function handleShare() {
        const code = encodePuzzleV2(gameSession.targetColor, gameSession.maxSteps, gameSession.originalGrid);
        const shareUrl = `${baseUrl}/edit/share/v2/${code}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast($t('common.share_link_copied'), "success");
        } catch (e) {
            toast("复制失败，请手动复制链接：" + shareUrl, "error");
            console.error("Share failed:", e);
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
    <UnifiedGameControl
        {gameSession}
        bind:selectedColor
        onColorSelect={(c) => selectedColor = c}
    >
        <div class="flex items-center gap-2 justify-between w-full">
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

                <Button class="group mr-1.5" onclick={handleShare} variant="secondary"
                        aria-label={$t('common.share_puzzle')}
                        title={$t('common.share_puzzle')}
                >
                    <Share class="h-4 w-4"/>
                    <span class="hidden">{$t('common.share_puzzle')}</span>
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
{/if}
