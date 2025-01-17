<script lang="ts">
    import {cn} from "$lib/utils";
    import {Button} from "$lib/components/ui/button/index";

    interface Props {
        isSelected: boolean;
        color: string;
        index: number;
        select: (i: number) => number;
    }

    let {
        isSelected = false,
        color,
        select,
        index
    } : Props = $props();
</script>

<Button
        variant="outline"
        size="icon"
        class={cn(
                "w-8 h-8 rounded-md relative transition-all",
                isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
            )}
        style="background-color: {color};"
        onclick={select}
>
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium
                {color === '#FFFFFF' ? 'text-black' : 'text-white'}">
                {index}
            </span>
</Button>
