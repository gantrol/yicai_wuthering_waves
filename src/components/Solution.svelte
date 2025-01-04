<script lang="ts">
    export let solution: any;
    export let steps: any[];
    export let currentStep: number;
    export let executeStep: () => void;
    export let showSolution: () => void;
</script>

<style>
    .solution {
        margin-top: 20px;
        max-width: 600px;
        word-wrap: break-word;
    }

    .solution-step {
        margin-bottom: 5px;
    }

    .button {
        padding: 10px 20px;
        background-color: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        margin-top: 10px;
    }

    .button:hover {
        background-color: #0056b3;
    }

    .error-message {
        color: #dc3545;
        margin-top: 10px;
    }
</style>

<div class="solution">
    {#if solution.type === 'success'}
        {#if solution.steps.length > 0}
            <h2>找到解决方案，共 {solution.steps.length} 步：</h2>
            <ol>
                {#each solution.steps as step, index}
                    <li class="solution-step">
                        选择{step.A}色({step.A})，点击位置 ({step.position[0] + 1}, {step.position[1] + 1})
                    </li>
                {/each}
            </ol>
            {#if steps.length > 0}
                <button class="button" on:click={executeStep} disabled={currentStep >= steps.length}>执行下一步</button>
                <p>当前步骤: {currentStep} / {steps.length}</p>
            {/if}
        {:else}
            <h2>当前方格已经全部为目标颜色，无需操作。</h2>
        {/if}
    {:else}
        <div class="error-message">
            <h2>{solution.message}</h2>
        </div>
    {/if}
</div>
