<script lang="ts">
    import ColorButton from "$lib/components/ColorButton.svelte";

    interface Props {
        label: string;
        colors: string[];
        selectedColor: number;
        select: (i: number) => number;
    }

    let {
        label = "", colors, selectedColor,
        select,
    } : Props = $props();
</script>

<div class="flex items-center gap-4">
    <span class="text-sm font-medium leading-none">{label}</span>
    {#each colors as color, i}
        <ColorButton
            isSelected={selectedColor === (i + 1)}
            {color}
            select={() => select(i + 1)}
            index={i + 1}
        >

        </ColorButton>
    {/each}
</div>
