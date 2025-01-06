<script lang="ts">
    import { onMount } from 'svelte';
    import SolverCore from './SolverCore.svelte';
    import type {PuzzleDataType} from "$lib/types";
    import {Loader2} from "lucide-svelte";
    import * as Alert from "$lib/components/ui/alert";

    // 你也可以用路由参数或外部传参
    export let puzzleId: string = '1';
    export let editMode = false;

    // 用来存放从 fetch 拿到的 puzzleData
    let puzzleData: PuzzleDataType;
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
    <Alert.Root variant="destructive">
        <Alert.Title>错误</Alert.Title>
        <Alert.Description>{errorMsg}</Alert.Description>
    </Alert.Root>
{:else if !puzzleData}
    <div class="flex items-center justify-center p-8">
        <Loader2 class="h-8 w-8 animate-spin" />
        <span class="ml-2">加载中...</span>
    </div>
{:else}
    <SolverCore
            puzzleData={puzzleData}
            editMode={editMode}
    />
{/if}
