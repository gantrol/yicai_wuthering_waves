<script lang="ts">
    export let maxSteps: number;
    export let isAutoSolved: boolean;
    export let editMode: boolean;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function updateSteps(event: Event) {
        const value = parseInt((event.target as HTMLInputElement).value, 10);
        dispatch('updateSteps', value);
    }

    function handleClick(action: string) {
        dispatch(action);
    }
</script>

<style>
    .button-group {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    .button {
        padding: 10px 20px;
        background-color: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }

    .button:hover {
        background-color: #0056b3;
    }

    .settings {
        display: flex;
        gap: 10px;
        align-items: center;
    }
</style>

<div class="settings">
    <label for="steps">最大步骤:</label>
    <input
            id="steps"
            type="number"
            min="1"
            max="10"
            bind:value={maxSteps}
            on:input={updateSteps}
    />
</div>

<div class="button-group">
    <button class="button" on:click={() => handleClick('loadExample')}>加载示例</button>
    <button class="button" on:click={() => handleClick('clearGrid')}>清空画板</button>
    <button class="button" on:click={() => handleClick('generatePuzzle')}>新建题目</button>
    <button class="button" on:click={() => handleClick('fillEmpty')}>填充空白</button>
    <button class="button" on:click={() => handleClick(isAutoSolved ? 'restorePuzzle' : 'solvePuzzle')}>
        {isAutoSolved ? '还原题目' : '自动解题'}
    </button>
    {#if !editMode}
        <button class="button" on:click={() => handleClick('resetMoves')}>重新开始</button>
    {/if}
</div>
