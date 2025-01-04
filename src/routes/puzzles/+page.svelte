<script>
    import { onMount } from 'svelte';

    let puzzles = [];

    // 假设服务器提供一个题目列表 API
    async function loadPuzzles() {
        try {
            const response = await fetch('/puzzles_json/list.json'); // 更新为实际的 API
            if (!response.ok) throw new Error('无法加载题目列表');
            puzzles = await response.json();
        } catch (error) {
            console.error('加载题目列表失败:', error);
        }
    }

    onMount(loadPuzzles);
</script>

<style>
    .puzzle-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;
    }

    .puzzle-item {
        padding: 16px;
        text-align: center;
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .puzzle-item:hover {
        transform: scale(1.05);
    }
</style>

<div>
    <h1>题目列表</h1>
    <div class="puzzle-list">
        {#each puzzles as puzzle}
            <div
                    class="puzzle-item"
                    on:click={() => (window.location.href = `../../../static/puzzles_json/${puzzle.id}`)}
            >
                题目编号: {puzzle.id}
            </div>
        {/each}
    </div>
</div>
