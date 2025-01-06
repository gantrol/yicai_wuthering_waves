<!-- File: src/routes/share/[code]/+page.svelte -->
<script lang="ts">
    import SolverCore from "$lib/components/SolverCore.svelte";
    import { decodePuzzle } from "$lib/utils/shareUtils";

    let {data} = $props();

    let decodedData: { targetColor: number; maxSteps: number; grid: number[][] } | null = null;
    let errorMsg = "";


    // 在页面初始化时解码
    // 也可用一个 load() + PageData 方式，但此处直接在页面组件中演示
    try {
        decodedData = decodePuzzle(data.shareCode);
    } catch (error) {
        errorMsg = (error as Error).message || "解析分享链接失败";
    }
</script>

{#if errorMsg}
    <p class="text-red-500 text-sm mt-4">{errorMsg}</p>
{:else if decodedData}
    <SolverCore
            puzzleData={{
      grid: decodedData.grid,
      targetColor: decodedData.targetColor,
      maxSteps: decodedData.maxSteps,
      // 如果需要 solutionSteps，可省略或自定义
    }}
            editMode={false}
    />
{/if}
