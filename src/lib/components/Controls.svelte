<!-- /src/lib/components/Controls.svelte -->
<script lang="ts">
    import { Button } from "$lib/components/ui/button";
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
    .Button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
    }
    .Button {
        padding: 10px 20px;
        background-color: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }
    .Button:hover {
        background-color: #0056b3;
    }
    .settings {
        display: flex;
        gap: 10px;
        align-items: center;
    }
</style>

<!--<div class="settings">-->
<!--    <label for="steps">最大步骤:</label>-->
<!--    <input-->
<!--            id="steps"-->
<!--            type="number"-->
<!--            min="1"-->
<!--            max="10"-->
<!--            bind:value={maxSteps}-->
<!--            on:input={updateSteps}-->
<!--    />-->
<!--</div>-->

<div class="Button-group">
    <Button variant="outline" onclick={() => handleClick('clearGrid')}>清空画板</Button>
<!--    <Button variant="secondary" onclick={() => handleClick('generatePuzzle')}>新建题目</Button>-->
    <Button variant="outline" onclick={() => handleClick('fillEmpty')}>填充空白</Button>
<!--    <Button variant="secondary" onclick={() => handleClick(isAutoSolved ? 'restorePuzzle' : 'solvePuzzle')}>-->
<!--        {isAutoSolved ? '还原题目' : '自动解题'}-->
<!--    </Button>-->
<!--    {#if !editMode}-->
<!--        <Button variant="secondary" onclick={() => handleClick('resetMoves')}>重新开始</Button>-->
<!--    {/if}-->

    <!-- TODO:导入要有解决方案 -->
    <Button variant="secondary" onclick={() => handleClick('exportPuzzle')}>导出题目</Button>
    <Button variant="secondary" onclick={() => handleClick('importPuzzle')}>导入题目</Button>
</div>
