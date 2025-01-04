<!-- /src/lib/components/app-sidebar.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    // 你也可以根据需要导入一些图标，如 lucide-svelte/icons
    import House from "lucide-svelte/icons/house";
    import Inbox from "lucide-svelte/icons/inbox";
    import Circle from "lucide-svelte/icons/circle";
    import PuzzleIcon from "lucide-svelte/icons/puzzle";

    interface PuzzleItem {
        id: number;
    }

    // 定义一些内置菜单示例
    const commonItems = [
        { title: "首页",    url: "/",        icon: House },
        { title: "列表页",  url: "/list",   icon: Inbox },
        // { title: "其它示例", url: "#random", icon: Circle },
    ];

    // 这里加载 /puzzles/list.json 里的题目 ID，动态加入菜单
    let puzzles: PuzzleItem[] = [];

    async function loadPuzzles() {
        try {
            const response = await fetch('/puzzles/list.json');
            if (!response.ok) throw new Error('无法加载题目列表');
            puzzles = await response.json();
        } catch (error) {
            console.error('加载题目列表失败:', error);
        }
    }

    onMount(() => {
        loadPuzzles();
    });
</script>

<!-- Sidebar 根 -->
<Sidebar.Root side="left" variant="sidebar" collapsible="offcanvas">
    <!-- 这里可以加 Sidebar.Header, Footer, Content 等组件 -->

    <Sidebar.Header>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton isActive>
                    {#snippet child({ props })}
                    <!-- 这里仅做个简单标题，点击无跳转 -->
                    <div {...props} class="flex items-center gap-2">
                        <PuzzleIcon />
                    </div>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Header>

    <!-- 2. 中间可滚动内容 -->
    <Sidebar.Content>
        <!-- 第一组：示例内置菜单 -->
        <Sidebar.Group>
            <Sidebar.GroupLabel>主页面</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each commonItems as item (item.title)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                                {#snippet child({ props })}
                                <a href={item.url} {...props} class="flex items-center gap-2">
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>

        <!-- 分隔线 -->
        <Sidebar.Separator />

        <!-- 第二组：题目列表 -->
        <Sidebar.Group>
            <Sidebar.GroupLabel>题目列表</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#if puzzles.length === 0}
                        <!-- 如果还没加载到题目，可以显示一个 Skeleton 或“暂无数据” -->
                        <Sidebar.MenuItem>
                            <Sidebar.MenuSkeleton />
                        </Sidebar.MenuItem>
                    {:else}
                        {#each puzzles as puzzle (puzzle.id)}
                            <Sidebar.MenuItem>
                                <Sidebar.MenuButton>
                                    {#snippet child({ props })}
                                    <!-- 点击跳转至 /solver?id=xxx -->
                                    <a
                                            href={`/solver?id=${puzzle.id}`}
                                            {...props}
                                            class="flex items-center gap-2"
                                    >
                                        <PuzzleIcon />
                                        <span>题目 {puzzle.id}</span>
                                    </a>
                                    {/snippet}
                                </Sidebar.MenuButton>
                            </Sidebar.MenuItem>
                        {/each}
                    {/if}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>

    <!-- 3. (可选) Footer 区域，比如放账号信息等 -->
    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                    {#snippet child({ props })}
                    <a href="https://github.com/gantrol/yicai_wuthering_waves" {...props} target="_blank">
                        <span>GitHub仓库</span>
                    </a>
                    {/snippet}
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>
