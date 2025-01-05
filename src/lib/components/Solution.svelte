<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    export let solution: any;
    export let steps: any[];
    export let currentStep: number;
    export let prevStep: () => void;
    export let nextStep: () => void;

    let colorsName = ['空', '蓝', '红', '黄', '绿'];
</script>

<div class="mt-5 max-w-2xl break-words">
    {#if solution.type === 'success'}
        {#if solution.steps.length > 0}
            <h2 class="text-xl font-semibold mb-4">找到解决方案，共 {solution.steps.length} 步：</h2>
            <ol class="space-y-2 list-decimal list-inside mb-4">
                {#each solution.steps as step, index}
                    <li class="text-base">
                        选择{colorsName[step.A]}色({step.A})，点击位置 ({step.position[0] + 1}, {step.position[1] + 1})
                    </li>
                {/each}
            </ol>

            <div class="flex gap-2 my-4">
                <Button
                        variant="outline"
                        onclick={prevStep}
                        disabled={currentStep <= 0}
                        class="disabled:opacity-50"
                >
                    上一步
                </Button>

                <Button
                        onclick={nextStep}
                        disabled={currentStep >= steps.length}
                        class="disabled:opacity-50"
                >
                    下一步
                </Button>
            </div>

            <p class="text-xl text-gray-600">当前步骤: {currentStep} / {steps.length}</p>
            <p class="text-sm text-gray-500 font-light pt-1">注：先数行，再数列，（1, 5）第一行第五列</p>
        {:else}
            <h2 class="text-xl font-semibold text-green-600">当前方格已经全部为目标颜色，无需操作。</h2>
        {/if}
    {:else}
        <div class="text-red-600 mt-4">
            <h2 class="text-xl font-semibold">{solution.message}</h2>
        </div>
    {/if}
</div>
