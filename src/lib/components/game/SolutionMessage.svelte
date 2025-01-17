<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {ChevronLeft, ChevronRight, X} from "lucide-svelte";
    import {getDescriptionForSolutionStep} from "$lib/utils/gridUtils";

    interface Props {
        solution: any;
        steps: any[];
        currentStep: number;
        prevStep: () => void;
        nextStep: () => void;
        closeSolution: () => void;
    }

    let {
        solution,
        steps,
        currentStep,
        prevStep,
        nextStep,
        closeSolution,
    }: Props = $props();
</script>

<div class="relative mt-5 max-w-2xl p-8 bg-white">
    {#if solution?.type === "success"}
        {#if closeSolution}
            <Button
                    variant="ghost"
                    onclick={closeSolution}
                    aria-label="Close"
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full h-10 w-10 p-0 transition-all duration-300 hover:rotate-90"
            >
                <X class="h-6 w-6"/>
            </Button>
        {/if}

        {#if solution.steps.length > 0}
            <div class="space-y-6">
                <div class="border-l-4 border-primary pl-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        解决方案
                    </h2>
                </div>

                <div>
                    <ol class="space-y-3 list-decimal list-inside mb-2">
                        {#each solution.steps as step, index}
                            <li class="text-base text-gray-600 hover:text-gray-800 transition-colors">
                                {getDescriptionForSolutionStep(step)}
                            </li>
                        {/each}
                    </ol>
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <p class="text-sm text-gray-500 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            坐标表示方法为（行, 列），如（1, 5）表示第一行第五列
                        </p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                                    class="bg-primary rounded-full h-3 transition-all duration-500 ease-in-out"
                                    style="width: {(currentStep / steps.length) * 100}%"
                            ></div>
                        </div>
                    </div>
                    <div class="flex justify-center items-center gap-2 md:gap-6">
                        <Button
                                variant="outline"
                                onclick={prevStep}
                                disabled={currentStep <= 0}
                                class="flex items-center gap-2 px-4 md:px-6 py-3 font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 hover:bg-primary/10"
                                aria-label="Previous step"
                        >
                            <ChevronLeft class="h-5 w-5"/>
                        </Button>
                        <span class="font-semibold md:text-lg text-gray-700 px-3 md:px-4 py-2 bg-gray-100 rounded-lg">
                            {currentStep} / {steps.length}
                        </span>
                        <Button
                                variant="outline"
                                onclick={nextStep}
                                disabled={currentStep >= steps.length}
                                class="flex items-center gap-2 px-4 md:px-6 py-3 font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 hover:bg-primary/10"
                                aria-label="Next step"
                        >
                            <ChevronRight class="h-5 w-5"/>
                        </Button>
                    </div>


                </div>


            </div>
        {:else}
            <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                <h2 class="text-xl font-semibold text-green-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    完成！当前方格已经达到目标状态。
                </h2>
            </div>
        {/if}
    {:else}
        <div class="bg-red-50 p-6 rounded-lg border border-red-200">
            <p class="text-xl font-semibold text-red-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {solution?.message}
            </p>
        </div>
    {/if}
</div>

<style>
    /* 添加一些过渡效果 */
    .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
