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
                        选择{colorsName[step.A]}色({step.A})，点击位置 ({step.position[0] + 1}, {step.position[1] + 1})（{colorsName[step.B]}色）
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
            <div class="flex items-center gap-4 my-4">
                <div class="flex-1 bg-secondary rounded-full h-2">
                    <div
                            class="bg-primary rounded-full h-2 transition-all duration-300"
                            style="width: {(currentStep / steps.length) * 100}%"
                    />
                </div>
                <span class="text-sm font-medium whitespace-nowrap">
                      {currentStep} / {steps.length}
                  </span>
            </div>
            <div class="bg-muted p-4 rounded-lg mt-4">
                <p class="text-sm text-muted-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    先数行，再数列，比方说（1, 5）表示第一行第五列
                </p>
            </div>
        {:else}
            <h2 class="text-xl font-semibold text-green-600">当前方格已经全部为目标颜色，无需操作。</h2>
        {/if}
    {:else}
        <div class="text-red-600 mt-4">
            <h2 class="text-xl font-semibold">{solution.message}</h2>
        </div>
    {/if}
</div>
