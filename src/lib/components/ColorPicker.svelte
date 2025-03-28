<script lang="ts">
    import ColorButton from "$lib/components/ColorButton.svelte";

    import {Button} from "$lib/components/ui/button/index";
    import {cn} from "$lib/utils";
    import LockIcon from '$lib/components/icons/LockIcon.svelte';
    import {getColors, LOCKED_CELL_VALUE} from '$lib/utils/gridUtils';
    import {t} from "$lib/translations";

    interface Props {
        label: string;
        colors: string[];
        selectedColor: number;
        select: (i: number) => void;
        showLockButton?: boolean;
    }

    let {
        label = "", colors, selectedColor,
        select, showLockButton = false
    }: Props = $props();

    const lockedStyleColor = getColors()[5];

</script>

<div class="flex items-center gap-4 flex-wrap">
    <span class="text-sm font-medium leading-none">{label}</span>
    {#each colors as color, i}
        {@const colorIndex = i + 1}
        <ColorButton
                isSelected={selectedColor === colorIndex}
                {color}
                select={() => select(colorIndex)}
                index={colorIndex}
        />
    {/each}

    {#if showLockButton}
        <!-- Lock Button -->
        <Button
                variant="outline"
                size="icon"
                class={cn(
            "w-8 h-8 rounded-md relative transition-all",
            selectedColor === LOCKED_CELL_VALUE ? "ring-2 ring-offset-2 ring-primary" : ""
        )}
                style="background-color: {lockedStyleColor};"
                onclick={() => select(LOCKED_CELL_VALUE)}
                aria-label="Select Lock Tool"
                title={$t('common.color_name_locked')}
        >
            <LockIcon size="60%" color="#E5E7EB"/>
        </Button>
    {/if}
</div>
