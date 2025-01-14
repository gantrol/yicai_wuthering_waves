<!-- StepCounter.svelte -->
<script lang="ts">
    import type { Move } from '$lib/types';
    import Footprints from 'lucide-svelte/icons/footprints';

    let { gridWidth, moveHistory, maxSteps, children } = $props();

    interface StepCounterProps {
        gridWidth: number;
        moveHistory: Move[];
        maxSteps: number;
    }
</script>

<div class="mb-6" style="max-width: {gridWidth}px">
    <div class="p-4 bg-secondary/50">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Footprints class="h-5 w-5 text-primary" />
                <span class="text-base font-medium">步数</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xl font-bold text-primary">{moveHistory.length}</span>
                <span class="text-muted-foreground">/</span>
                <span class="text-lg font-medium text-muted-foreground">{maxSteps}</span>
            </div>
        </div>
        <div class="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
                    class="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                    style="width: {(moveHistory.length / maxSteps * 100)}%"
            ></div>
        </div>
        <div class="flex justify-between items-center mt-2">
            <p class="text-sm text-muted-foreground">
                {#if moveHistory.length === maxSteps}
                    已达到最大步数
                {:else if moveHistory.length === 0}
                    开始你的游戏吧
                {:else}
                    还剩 {maxSteps - moveHistory.length} 步
                {/if}
            </p>
            {@render children?.()}
        </div>
    </div>
</div>
