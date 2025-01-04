<script lang="ts">
    export let label: string;
    export let colors: string[];
    export let selectedColor: number;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function selectColor(index: number) {
        dispatch('select', index + 1);
    }
</script>

<style>
    .color-picker {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .color-option {
        width: 30px;
        height: 30px;
        border: 2px solid #000;
        cursor: pointer;
        border-radius: 4px;
        position: relative;
    }

    .color-option.selected {
        border: 4px solid #000;
    }
</style>

<div class="color-picker">
    <span>{label}</span>
    {#each colors as color, i}
        <div
                class="color-option {selectedColor === (i + 1) ? 'selected' : ''}"
                style="background-color: {color};"
                on:click={() => selectColor(i)}
        >
            <span class="cell-id">{i + 1}</span>
        </div>
    {/each}
</div>
