<script lang="ts">
    import {Button} from "$lib/components/ui/button/index";
    import {derived} from "svelte/store";
    import {getColors} from "$lib/utils/gridUtils";

    interface Props {
        index: number;
        width: number;
        height: number;
    }

    let {
        index,
        width = 8,
        height = 8,
    } : Props = $props();

    let color = $derived(getColors()[index]);
</script>

<Button
        variant="outline"
        size="icon"
        class="w-{width} h-{height} rounded-md relative transition-all"
        style="background-color: {color};"
>
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium
                {color === '#FFFFFF' ? 'text-black' : 'text-white'}">
                {index}
            </span>
</Button>
