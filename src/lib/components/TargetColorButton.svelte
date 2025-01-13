<script lang="ts">
    import {Button} from "$lib/components/ui/button/index";
    import {derived} from "svelte/store";
    import {getColorsForPicker} from "$lib/utils/gridUtils";

    interface Props {
        index: number;
    }

    let {
        index
    } : Props = $props();

    let color = $derived(getColorsForPicker()[index]);
</script>

<Button
        variant="outline"
        size="icon"
        class="w-8 h-8 rounded-md relative transition-all"
        style="background-color: {color};"
>
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium
                {color === '#FFFFFF' ? 'text-black' : 'text-white'}">
                {index}
            </span>
</Button>
