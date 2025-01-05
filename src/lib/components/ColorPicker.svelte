<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";

    export let label: string;
    export let colors: string[];
    export let selectedColor: number;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function selectColor(index: number) {
        dispatch('select', index + 1);
    }
</script>

<div class="flex items-center gap-4">
    <span class="text-sm font-medium leading-none">{label}</span>
    {#each colors as color, i}
        <Button
                variant="outline"
                size="icon"
                class={cn(
                "w-8 h-8 rounded-md relative transition-all",
                selectedColor === (i + 1) ? "ring-2 ring-offset-2 ring-primary" : ""
            )}
                style="background-color: {color};"
                onclick={() => selectColor(i)}
        >
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium
                {color === '#FFFFFF' ? 'text-black' : 'text-white'}">
                {i + 1}
            </span>
        </Button>
    {/each}
</div>
