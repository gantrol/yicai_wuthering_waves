<script lang="ts">
    import { onMount } from 'svelte';
    import SolverCore from './SolverCore.svelte';

    // 你也可以用路由参数或外部传参
    export let puzzleId: string = '1';
    export let editMode = false;

    // 用来存放从 fetch 拿到的 puzzleData
    let puzzleData = null;
    let errorMsg = '';

    // 监听 puzzleId 变化，重新 fetch
    $: if (puzzleId) {
        fetchPuzzle(puzzleId);
    }

    // 首次挂载时
    onMount(() => {
        fetchPuzzle(puzzleId);
    });

    async function fetchPuzzle(id: string) {
        try {
            puzzleData = null;
            errorMsg = '';
            const response = await fetch(`/puzzles_json/${id}.json`);
            console.log(response)
            if (!response.ok) {
                throw new Error('无法加载题目数据');
            }
            puzzleData = await response.json();
        } catch (err) {
            console.error('加载题目失败:', err);
            errorMsg = err.message;
        }
    }
</script>

{#if errorMsg}
    <p class="text-red-500">加载出错：{errorMsg}</p>
{:else if !puzzleData}
    <p>加载中...</p>
{:else}
    <SolverCore
            puzzleData={puzzleData}
            editMode={editMode}
    />
{/if}
